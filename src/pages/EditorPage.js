import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client';
import Editor from '../components/Editor';
import socket from '../socket';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions'
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
  // const isSocketInitialized = useRef(false);
  const location = useLocation();
  const reactNavigator = useNavigate(); 
  useEffect(() => {
    // Check if the socket is already connected
    if (!socket.connected) {
      // Connect to the server if not already connected
      socket.connect();
    }

    socket.on('connect_error', (err) => handleErrors(err));
    socket.on('connect_failed', (err) => handleErrors(err));

    function handleErrors(e) {
      console.log('socket error', e);
      toast.error('Socket connection failed, try again later.');
      reactNavigator('/');
    }
    // Log when connected
    socket.on('connect', () => {
      console.log('Connected to server');
      
      // Emit JOIN event with roomId and username when connected
      socket.emit(ACTIONS.JOIN, {
        roomId, // Assuming roomId is passed from location state
        username: location.state?.username,
      });

      socket.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          // Assuming 'toast' is imported from 'react-hot-toast'
          toast.success(`${username} joined the room.`);
          console.log(`${username} joined`);
        }
        setClients(clients);
        socket.emit(ACTIONS.SYNC_CODE, {
          code: CodeRef.current,
          socketId,
        });
      });
        // Listening for disconnected
      socket.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter(
            (client) => client.socketId !== socketId
          );
        }); 
      });
      
    });
 
    // Clean up when component unmounts
    return () => {
      socket.disconnect();
      socket.off(ACTIONS.JOINED);
      socket.off(ACTIONS.DISCONNECTED);
    };
  }, [location]);

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
    return <Navigate to = "/" />; 
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
            <div className="clientsList">
              {clients.map((client) => (
                <Client 
                  key={client.socketId} 
                  username={client.username}
                />
              ))}
            </div>
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
        <button className="btn leaveBtn" on onClick={leaveRoom}>Leave</button>
      </div>
      <div className="editorWrap">
        <Editor 
          socket = {socket} 
          roomId = {roomId} 
          onCodeChange= {(code) => {
            CodeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage
