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
        socket.on('topic apply', async ({topicDescription, topicTitle}) =>
        {
            if ((typeof topicDescription) != "string" || (typeof topicTitle) != "string")
            {
                return
            }
            try
            {
                JSON.parse(topicDescription)
            }
            catch (err) 
            {
                console.log(err)
            }
            db.addGroup(topicTitle, topicDescription).catch(err =>
                {
                    socket.emit('failed topic apply')
                })
            const id = (await db.getLastGroup()).rows[0].group_id;
            socket.emit('successful topic apply',  {id})
        })
    })
}
module.exports = handleEvents;