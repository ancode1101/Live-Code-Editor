const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};
const userThemeMap = {};
function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    ); 
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN,({ roomId, username }) => {
        if (!userSocketMap[socket.id]) { 
            userSocketMap[socket.id] = username;
            socket.join(roomId);
            const clients = getAllConnectedClients(roomId);
            clients.forEach(({ socketId }) => {
                io.to(socketId).emit(ACTIONS.JOINED, {
                    clients: clients,
                    username : username,
                    socketId : socket.id,
                });
            });
        }
    });

    socket.on(ACTIONS.THEME_CHANGE, ({ roomId, theme }) => {
        userThemeMap[socket.id] = theme;
        console.log(theme);
        socket.in(roomId).emit(ACTIONS.THEME_CHANGE, { theme });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE , ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });


    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId : socket.id,
                username : userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        delete userThemeMap[socket.id];
        socket.leave();
    });

});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`)); 