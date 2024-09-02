import React, { useEffect, useRef, useState } from "react";
import CodeMirror from "codemirror";
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from "../Actions";

const Editor = ({ socket, roomId, onCodeChange }) => {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const [theme, setTheme] = useState('dracula');

  useEffect(() => {
    if (textareaRef.current && !editorRef.current) {
      editorRef.current = CodeMirror.fromTextArea(textareaRef.current, {
        mode: { name: 'javascript', json: true },
        theme: theme,
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });
    }
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
        <option value="dracula">Dracula</option>
        <option value="monokai">Monokai</option>
        <option value="material">Material</option>
        {/* Add more themes as needed */}
      </select>
      <textarea ref={textareaRef}></textarea>
    </div>
  );
};

export default Editor;
