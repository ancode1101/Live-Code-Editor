import React, { useEffect, useRef, useState } from 'react';
import Client from '../components/Client';
import Editor from '../components/Editor';
import socket from '../socket';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import { 
  useLocation,
  useNavigate, 
  Navigate,   
  useParams,
} from 'react-router-dom';

const EditorPage = () => {
  const [clients, setClients] = useState([]);
  const { roomId } = useParams();
  const CodeRef = useRef(null);
  const socketRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    const initializeSocket = () => {
      // Configure socket before connecting
      socket.io.opts.transports = ['websocket', 'polling'];
      socket.io.opts.reconnectionAttempts = maxReconnectAttempts;
      socket.io.opts.reconnectionDelay = 1000;
      socket.io.opts.timeout = 10000;

      if (!socket.connected) {
        socket.connect();
      }

      socket.on('connect_error', handleErrors);
      socket.on('connect_failed', handleErrors);
      socket.on('error', handleErrors);

      socket.on('connect', () => {
        console.log('Connected to server');
        reconnectAttempts.current = 0;
        
        socket.emit(ACTIONS.JOIN, {
          roomId,
          username: location.state?.username,
        });
      });

      socket.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
          console.log(`${username} joined`);
        }
        setClients(clients);
        socket.emit(ACTIONS.SYNC_CODE, {
          code: CodeRef.current,
          socketId,
        });
      });

      socket.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => prev.filter(
          (client) => client.socketId !== socketId
        ));
      });
    };

    function handleErrors(err) {
      console.error('Socket error:', err);
      reconnectAttempts.current += 1;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        toast.error('Unable to connect to the server. Please try again later.');
        reactNavigator('/');
      } else {
        toast.error(`Connection attempt ${reconnectAttempts.current} failed. Retrying...`);
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (!socket.connected) {
            socket.connect();
          }
        }, 2000);
      }
    }

    initializeSocket();

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('connect_failed');
      socket.off('error');
      socket.off(ACTIONS.JOINED);
      socket.off(ACTIONS.DISCONNECTED);
      socket.disconnect();
    };
  }, [location, roomId, reactNavigator]);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been copied to your clipboard');
    } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator('/');
  }

  if (!location.state) {
    return <Navigate to="/" />; 
  }
  
  return ( 
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img 
              className="logoImage" 
              src="/code-sync.png" 
              alt="logo" 
            />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client 
                key={client.socketId} 
                username={client.username}
              />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
      </div>
      <div className="editorWrap">
        <Editor 
          socket={socket} 
          roomId={roomId} 
          onCodeChange={(code) => {
            CodeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;