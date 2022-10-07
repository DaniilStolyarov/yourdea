window.onload = (ev) =>
{
    if (location.href.includes('topics/'))
    {
        const splitted = location.href.split('topics/')
        loadTopic(splitted[splitted.length - 1])
    }
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