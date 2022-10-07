const db = require('../../db');
function handleEvents(io)
{
    io.on('connection', (socket) =>
    {
        socket.on('topic fetch', async ({topicID}) =>
        {
            const topic = (await db.getTopicById(topicID)).rows[0];
            socket.emit('topic fetch success', ({topic}))
        })
    })
}
module.exports = handleEvents;