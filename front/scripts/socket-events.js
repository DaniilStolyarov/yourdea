const editorDefaults = { // шаблон для настроек EditorJS
    logLevel: 'ERROR',
    readOnly : true,
    data : undefined,
    holder : undefined,
    // data : JSON.parse(topic.description),
    // holder : topic.group_id,
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
}
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
    document.querySelector('.topic-container .comment-submit').addEventListener('click', commentSubmitEvent)
}
async function commentSubmitEvent(event)
{
    const authKey = getCookie('authKey');
    const data = await window.commentEditor.save();
    const stringData = JSON.stringify(data);
    const topicID = window.currentTopicID; // ID загруженного на странице topic
    window.socket.emit('comment apply', {content : stringData, topicID, authKey});
    location.reload();
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
    avatarDOM.style["background-image"] = `url(/images/${user.avatar_id})`

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
function loadComments(topicID)
{
    window.socket.on('comments fetch success', ({comments}) =>
    {
        comments.forEach(async (comment) =>
            {
                const {author_id, content} = comment;
                const commentPromise = new Promise((resolve, reject) =>
                {
                    setTimeout(() => {
                        reject()
                    }, 5000);
                    window.socket.on('success fetch user', ({nickname, avatar_id}) =>
                    {
                        resolve({nickname, avatar_id})
                    })
                    socket.emit('fetch user', {id : author_id})
                })
                const {avatar_id, nickname} = await commentPromise;
                const commentContainerDOM = document.createElement('div');
                    commentContainerDOM.classList.add('comment-container');
                const commentAvatarDOM = document.createElement('div');
                    commentAvatarDOM.classList.add('comment-avatar');
                    commentAvatarDOM.style["background-image"] = `url(/images/${avatar_id})`;
                const contentGroup = document.createElement('div');
                    contentGroup.classList.add('content-group');
                const commentNickname = document.createElement('div');
                    commentNickname.classList.add('comment-nickname');
                    commentNickname.textContent = nickname;
                const commentContent = document.createElement('div');
                    commentContent.classList.add('comment-content');
                    commentContent.id = "message-" + comment.message_id;
                contentGroup.append(commentNickname, commentContent);
                commentContainerDOM.append(commentAvatarDOM, contentGroup);
                document.querySelector('.comments .view').append(commentContainerDOM);
                const commentEditorOptions = {}
                Object.assign(commentEditorOptions, editorDefaults, {data : JSON.parse(content), holder : "message-" + comment.message_id})
                const commentEditor = new EditorJS(commentEditorOptions);
                await commentEditor.isReady;

                
            })
  
    })
    window.socket.emit('comments fetch', {topicID})
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
            const editorOptions = {};
            Object.assign(editorOptions, editorDefaults, {data : JSON.parse(topic.description), holder : topic.group_id})
            const editor = new EditorJS(editorOptions)
            await editor.isReady;
        }
        else
        {
            location.href = '/'
        }
        window.currentTopicID = topic.group_id;
        const descriptionDOM = document.querySelector('.topic .description');
        const titleDOM = document.querySelector('.topic .title');
        descriptionDOM.style.height = `calc(100% - ${titleDOM.clientHeight}px)`
        loadComments(topicID);
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
    const JSONdata = await window.applyEditor.save();
    const topicDescription = JSON.stringify(JSONdata);
    const topicTitle = document.querySelector('#apply-title').value 
    // todo : сделать проверку на наличие title
    socket.emit('topic apply', {topicDescription, topicTitle, authKey});

}