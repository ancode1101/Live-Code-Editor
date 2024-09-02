import React, { useEffect, useRef, useState } from "react";
import CodeMirror from "codemirror";
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
// import { themes } from './Theme';
// import { jsPDF } from 'jspdf'; // Import jsPDF for PDF generation
import ACTIONS from "../Actions";

const Editor = ({ socket, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const [theme, setTheme] = useState('dracula');

  useEffect(() => {
    const init = async () => {
      if (editorRef.current) {
        editorRef.current = CodeMirror.fromTextArea(editorRef.current, {
          mode: { name: 'javascript', json: true },
          theme: theme,
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        });
      }
    };
    init();
  }, [theme]);

  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    setTheme(selectedTheme);
    if (editorRef.current) {
      editorRef.current.setOption('theme', selectedTheme);
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;

    // Code sync and events
    editorRef.current.on('change', (instance, changes) => {
      const { origin } = changes;
      const code = instance.getValue();
      onCodeChange(code);
      if (origin !== 'setValue') {
        socket.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code,
        });
      }
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
      if (code !== null) {
        editorRef.current.setValue(code);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off(ACTIONS.CODE_CHANGE);
    };
  }, [editorRef, socket, onCodeChange, roomId]);

  return (
    <div>
      <select id="themeSelector" onChange={handleThemeChange} value={theme}>
        {/* Add your desired themes here */}
        <option value="dracula">Dracula</option>
        <option value="3024-day">3024-day</option>
        <option value="3024-night">3024-night</option>
        {/* ... other themes ... */}
      </select>
      <textarea ref={editorRef} id="livecodeeditor"></textarea>
    </div>
  );
};

export default Editor;