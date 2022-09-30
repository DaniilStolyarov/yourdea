const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const handleEvents = require('./backend/socket-events/main')

const io = new Server(server);

handleEvents(io);

app.use(express.static('./front'));

server.listen(process.env.PORT || 5000); 
