
window.addEventListener("DOMContentLoaded", main)
function main()
{
    if (location.href.includes('topics/'))
    {
        const splitted = location.href.split('topics/')
        loadTopic(splitted[splitted.length - 1])
    }
    document.querySelector('#sign-container form').addEventListener('submit', registerEvent)
    document.querySelector('#login-container form').addEventListener('submit', loginEvent)
    document.querySelector('#apply-container #submit-apply').addEventListener('click', topicApplyEvent)
}

function loadTopic(topicID)
{
    window.socket.on('topic fetch success', async ({topic}) =>
    {
        const title = (topic.name.length > 0 ? topic.name : "Идея, которой не нужно имя")
        if ({topic})
        {
            document.querySelector('.topic-container .title').textContent = title;
            document.querySelector('.topic-container .description .text').id = topic.group_id;
            const editor = new EditorJS({
                readOnly : true,
                data : JSON.parse(topic.description),
                holder : topic.group_id,
                tools :
                {
                    header : {
                        class : Header,
                        inlineToolbar : ['link', 'bold']
                    },
                    list : 
                    {
                        class : List,
                        inlineToolbar : true
                    },
                    embed :
                    {
                        class : Embed,
                        inlineToolbar : false,
                        config : 
                        {
                            services : 
                            {
                                youtube : true,
                                coub : true,
                                imgur : 
                                {
                                    regex: /https?:\/\/(?:i\.)?imgur\.com.*\/([a-zA-Z0-9]+)(?:\.gifv)?/,
                                    embedUrl: 'http://imgur.com/<%= remote_id %>/embed',
                                    html: '<iframe allowfullscreen="true" scrolling="no" id="imgur-embed-iframe-pub-<%= remote_id %>" class="imgur-embed-iframe-pub" style="height: 500px; width: 100%; border: 1px solid #000;"></iframe>'
                                }
                            }
                        }
                    },
                    image :
                    {
                        class : ImageTool
                    }
                }
            })
            await editor.isReady;
        }
        else
        {
            location.href = '/'
        }

    })
    window.socket.emit('topic fetch', {topicID});
}
async function registerEvent(event)
{
    event.preventDefault();
    const formData = new FormData(event.target);
    const result = await fetch('/register', {method : "POST", body : formData })
    const JsonResult = await result.json();
    if (!JsonResult.valid) 
    {
        alert(JsonResult.reason);
        return;
    }
}
async function loginEvent(event)
{
    event.preventDefault();
    const formData = new FormData(event.target);
    const result = await fetch('/login', {method : "POST", body : formData })
    const JsonResult = await result.json();
    if (!JsonResult.valid) 
    {
        alert(JsonResult.reason);
        return; 
    }
    setCookie('authKey', JsonResult.authKey);
    alert("Успешно выполнен вход. Ваш ключ: " + JsonResult.authKey);
}   
async function topicApplyEvent(event)
{
    const socket = window.socket;
    socket.on('successful topic apply', ({id}) =>
    {
        window.location.pathname = '/topics/' + id;
    })
    const JSONdata = await window.editor.save();
    const topicDescription = JSON.stringify(JSONdata);
    const topicTitle = document.querySelector('#apply-title').value
    socket.emit('topic apply', {topicDescription, topicTitle});

}