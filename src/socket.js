import { io } from 'socket.io-client';

// In development, use localhost
// In production, the socket will automatically connect to the same host
const URL = process.env.NODE_ENV === 'production' 
    ? undefined  // Will automatically use the same host
    : 'http://localhost:5000';

const socket = io(URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    timeout: 10000
});

export default socket;