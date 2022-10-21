window.addEventListener("DOMContentLoaded", main)
async function main()
{
    const userPromise = fetchUser()
        .catch(reason =>
        {
            console.log(reason);
            deleteCookie('authKey');
            location.replace(location.origin)
        })
    const user = await userPromise;
    if (user) 
    onFetchedUser(user);
    if (location.href.includes('topics/'))
    {
        const splitted = location.href.split('topics/')
        loadTopic(splitted[splitted.length - 1])
    }
    document.querySelector('#sign-container form').addEventListener('submit', registerEvent)
    document.querySelector('#login-container form').addEventListener('submit', loginEvent)
    document.querySelector('#apply-container #submit-apply').addEventListener('click', topicApplyEvent)
    document.querySelector('#profile-container #logout').addEventListener('click', logoutEvent)
}
async function logoutEvent(event)
{ // удаляем authKey
    deleteCookie('authKey');
    location.replace(location.origin)
}
async function onFetchedUser(user)
{
    console.log(user)
    const loginTitle = document.querySelector('#login-title');
    const profileButton = document.querySelector('#profile-trigger');
    const nameDOM = document.querySelector('#profile-container .name');
    const emailDOM = document.querySelector('#profile-container .email');
    const avatarDOM = document.querySelector('#profile-container .avatar');
    const telegramDOM = document.querySelector('#profile-container .telegram-text')
    const phoneDOM = document.querySelector('#profile-container .phone_number')

    profileButton.classList.add('active');
    loginTitle.classList.remove('active');
    
    nameDOM.textContent = user.nickname;
    emailDOM.textContent = user.email;
    telegramDOM.textContent = user.telegram;
    phoneDOM.textContent = user.phone;

}
async function fetchUser()
{
    const sessionID = getCookie('authKey');
    const socket = window.socket;
    if (!sessionID) return;
    const getUserData = new Promise((resolve, reject) =>
    {
        socket.on('successful fetch by key', ({resUser}) =>
        {
            resolve(resUser);
        })
        socket.on('failed fetch by key', ({reason}) =>
        {
            reject(reason);
        })
        setTimeout(() => {
            reject("Timeout")
        }, 30000);
        socket.emit('fetch by key', {sessionID})
    })
    return getUserData;
} 
function loadTopic(topicID)
{
    window.socket.on('topic fetch success', async ({topic}) =>
    {
        console.log(topic)
        const title = (topic.name.length > 0 ? topic.name : "Идея, которой не нужно имя")
        const author = topic.author;
        const timestamp = topic.timestamp;
        let dateStamp = new Date(timestamp);

        if ({topic})
        {
            document.querySelector('.topic-container .title').textContent = title;
            document.querySelector('.topic-container .description .text').id = topic.group_id;
            document.querySelector('.topic-container .info .author-info div').textContent = author;
            document.querySelector('.topic-container .info .date-info div').textContent = `${dateStamp.getDate()}.${dateStamp.getMonth() + 1}.${dateStamp.getFullYear()}`
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
    location.replace(location.origin);
}   
async function topicApplyEvent(event)
{
    const socket = window.socket;
    const authKey = getCookie('authKey')
    socket.on('successful topic apply', ({id}) =>
    {
        window.location.pathname = '/topics/' + id;
    })
    const JSONdata = await window.editor.save();
    const topicDescription = JSON.stringify(JSONdata);
    const topicTitle = document.querySelector('#apply-title').value
    socket.emit('topic apply', {topicDescription, topicTitle, authKey});

}