const db = require('../../db');
function handleEvents(io)
{
    io.on('connection', (socket) =>
    {
        socket.on('fetch user', async ({id}) =>
        {
            try
            {
                const user = (await db.getUserById(id)).rows[0];
                const res = {avatar_id : user.avatar_id, nickname : user.nickname}
                socket.emit('success fetch user', res)
            } catch (err)
            {
                console.log(err)
            }
        })
        socket.on('comments fetch', async ({topicID}) =>
        {
            try
            {
                const messages = (await db.getMessagesByTopicId(topicID)).rows
                socket.emit('comments fetch success', {comments : messages});
            }
            catch (err)
            {
                console.log(err)
            }
            return;
        })
        socket.on('comment apply', async ({content, topicID, authKey}) =>
        {
            try
            {
                const user = (await db.getUserBySession(authKey)).rows[0];
                const topic = (await db.getTopicById(topicID)).rows[0];
                if (user && topic)
                {
                    await db.addMessage(user.user_id, topic.group_id, content);
                }
            }
            catch (err)
            {
                console.log(err)
            }
        })
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
            const resUser = {nickname : user.nickname, user_description : user.user_description, admin : user.admin, 
                timestamp : user.timestamp, email : user.email, phone: user.phone_number, telegram: user.telegram, 
                avatar_id : user.avatar_id}
            socket.emit('successful fetch by key', {resUser});
        })
        socket.on('topic fetch', async ({topicID}) =>
        {
            try 
            {
                const topic = (await db.getTopicById(topicID)).rows[0];
                const authorID = topic.author_id;
                const {nickname} = (await db.getUserById(authorID)).rows[0];
                delete topic.author_id;
                topic.author = nickname;
                socket.emit('topic fetch success', ({topic}))
            }
            catch (err)
            {
                console.log(err)
                socket.emit('topic fecth failed', {errorMessage : err.message});
            }
        })
        socket.on('topic apply', async ({topicDescription, topicTitle, authKey}) =>
        {
            if (!authKey) return;
            if ((typeof topicDescription) != "string" || (typeof topicTitle) != "string")
            {
                return
            }
            try
            {   
                JSON.parse(topicDescription)
                const {user_id} = (await db.getUserBySession(authKey)).rows[0];
                db.addGroup(topicTitle, topicDescription, user_id).catch(err =>
                    {
                        socket.emit('failed topic apply')
                    })
                const id = (await db.getLastGroup()).rows[0].group_id;
                socket.emit('successful topic apply',  {id})
            }
            catch (err) 
            {
                console.log(err)
                return;
            }
        })
    })
}
module.exports = handleEvents;