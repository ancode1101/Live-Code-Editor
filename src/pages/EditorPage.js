import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
// import { useLocation } from 'react-router-dom';

const EditorPage = () => {

  const [clients, setClients] = useState([
    // { socketId: 1, username: 'Ankit S'},
    // { socketId: 2, username: 'Jarin J'},
    // { socketId: 3, username: 'Shyam Y'}
  ]);

  const socketRef = useRef(null);
  const isSocketInitialized = useRef(false);
  // const location = useLocation(); 
  useEffect (() => {
    const init = async () => {
      socketRef.current = await initSocket();
      isSocketInitialized.current = true;
      // socketRef.current.emit(ACTIONS.JOIN, {
      //   roomId,
      //   username: location.state?.username,
      // });
    };
    init();
    return () => {
      // ... Add logic to disconnect socket or unregister listeners here
      if (socketRef.current) {
        socketRef.current.disconnect(); // Assuming socket.io provides a disconnect method
        socketRef.current = null;
      }
    };
  }, []);
  
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
        <button className="btn copyBtn">Copy ROOM ID</button>
        <button className="btn leaveBtn">Leave</button>
      </div>
      <div className="editorWrap">
        <Editor />
      </div>
    </div>
  );
};

export default EditorPage
