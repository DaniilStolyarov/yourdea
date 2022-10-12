
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

}
function loadTopic(topicID)
{
    window.socket.on('topic fetch success', ({topic}) =>
    {
        if (topic)
        {
            document.querySelector('.topic-container .title').textContent = topic.name;
            document.querySelector('.topic-container .description .text').innerHTML = topic.description;
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