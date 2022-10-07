const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const handleEvents = require('./backend/socket-events/main')

const io = new Server(server);

handleEvents(io);

app.use(express.static('./front'));
app.get('/topics/*', (req,res,next) =>
{
    res.sendFile(__dirname + '/front/index.html');
})
server.listen(process.env.PORT || 5000); 
