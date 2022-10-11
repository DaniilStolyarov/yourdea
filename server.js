const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const options = 
{
    key: fs.readFileSync(__dirname + '/yourdea.ga/privkey1.pem'),
    cert: fs.readFileSync(__dirname + '/yourdea.ga/fullchain1.pem'),
    rejectUnathourized : false
}
const server = https.createServer(options, app);
const {Server} = require('socket.io');
const handleEvents = require('./backend/socket-events/main')
const formidable = require('express-formidable');
const io = new Server(server);
const {validRegister, validLogin} = require("./backend/validation");
const db = require('./db');
handleEvents(io);
app.use(express.static('./front'));
app.get('/', (req,res,next) =>
{
    res.sendFile(__dirname + '/front/index.html');
})


app.post('/register', formidable(), async (req, res) =>
{
    const {email, name, password, telegram, phone} = req.fields;
    const passwordConfirm = req.fields["password-confirm"];
    const avatar = req.files.avatar;
    const result = await validRegister({email, name, password, telegram, phone, passwordConfirm, avatar});
    res.send(result);
    if (result.valid)
    {
        await db.addUser({email, password, name, phoneNum : phone, telegram});
    }
})
app.post('/login', formidable(), async (req,res) =>
{
    const {email, password} = req.fields;
    const result = await validLogin({email, password})
    res.send(result);
})

server.listen(443, () =>
{
    console.log('listening on ' + 443);
}); 
