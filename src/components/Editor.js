import React, { useEffect, useRef, useState } from "react";
import CodeMirror from "codemirror";
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import { themes } from './Theme';
import { jsPDF } from 'jspdf'; // Import jsPDF for PDF generation
import ACTIONS from "../Actions";

const Editor = ({ socket, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const [theme, setTheme] = useState('dracula');

  // Function to generate PDF
  const generatePDF = () => {
    const code = editorRef.current.getValue();
    const doc = new jsPDF();
    doc.setFontSize(12); // Set font size
    doc.setFont('courier', 'normal'); // Set font type
    doc.text(code, 10, 10); // Adjust coordinates and styling as needed
    doc.save("code.pdf");
  };

  useEffect(() => {
    // CodeMirror initialization
    const init = async () => {
      if (editorRef.current && typeof editorRef.current.getAttribute === 'function') {
        editorRef.current = CodeMirror.fromTextArea(editorRef.current, {
          mode: { name: 'javascript', json: true },
          theme: theme,
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        });
      } else {
        console.error('Textarea element is not valid for CodeMirror initialization');
      }
    };
    init();
  }, [theme]);

  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    setTheme(selectedTheme);
    localStorage.setItem('userTheme', selectedTheme);
    socket.emit(ACTIONS.THEME_CHANGE, {
      roomId,
      theme: selectedTheme,
    });
  };

  useEffect(() => {
    // Code synchronization and events
    if (!editorRef.current) return;

    const storedTheme = localStorage.getItem('userTheme');
    if (storedTheme) {
      setTheme(storedTheme);
    }

    editorRef.current.setOption('theme', theme);

    // Event listeners
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

    socket.on(ACTIONS.THEME_CHANGE, ({ theme }) => {
      setTheme(theme);
      editorRef.current.setOption('theme', theme);
    });

    return () => {
      socket.off(ACTIONS.CODE_CHANGE);
    };
  }, [editorRef, theme, socket, onCodeChange, roomId]);

  return (
    <div>
      {/* Dropdown to select theme */}
      <select id="themeSelector" onChange={handleThemeChange} value={theme}>
        {themes.map((themeName, index) => (
          <option key={index} value={themeName}>
            {themeName}
          </option>
        ))}
      </select>
      
      {/* Button to trigger PDF generation */}
      {/* <button onClick={generatePDF}>Save as PDF</button> */}

      {/* Code editor */}
      <textarea ref={editorRef} id="livecodeeditor"></textarea>
    </div>
  );
};

export default Editor;
