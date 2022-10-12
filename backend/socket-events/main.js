const db = require('../../db');
function handleEvents(io)
{
    io.on('connection', (socket) =>
    {
        socket.on('topic fetch', async ({topicID}) =>
        {
            try 
            {
                const topic = (await db.getTopicById(topicID)).rows[0];
                socket.emit('topic fetch success', ({topic}))
            }
            catch (err)
            {
                socket.emit('topic fecth failed', {errorMessage : err.message});
            }
        })
    })
}
module.exports = handleEvents;