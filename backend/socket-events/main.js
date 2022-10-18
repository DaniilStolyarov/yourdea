const db = require('../../db');
function handleEvents(io)
{
    io.on('connection', (socket) =>
    {
        socket.on('fetch by key', async ({sessionID}) =>
        {
            let user;
            try
            {
                user = (await db.getUserBySession(sessionID)).rows[0];
            }
            catch (err)
            {
                socket.emit('failed fetch by key', {reason : "invalid sessionID"});
                return;
            }
            if (!user) 
            {
                socket.emit('failed fetch by key', {reason : "invalid sessionID"});
                return;
            }
            const resUser = {nickname : user.nickname, user_description : user.user_description, admin : user.admin, timestamp : user.timestamp, email : user.email, phone: user.phone_number, telegram: user.telegram}
            socket.emit('successful fetch by key', {resUser});
        })
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