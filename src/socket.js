// socket.js
import { io } from 'socket.io-client';

const options = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    timeout: 10000,
    transports: ['websocket'],
};

const socket = io(process.env.REACT_APP_BACKEND_URL, options);

export default socket;
