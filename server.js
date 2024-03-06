const express = require('express');
const app = express();
const http = require('http');
const {Server} = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

});

// io.on('reconnect_attempt', () => {
//     // Implement your logic here, e.g., delay reconnection attempts
//     console.log('Reconnection attempt...');
//   });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`)); 