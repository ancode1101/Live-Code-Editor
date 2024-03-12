import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from "../Actions";

const Editor = ({socket, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const codeMirrorInitialized = useRef(false);

  useEffect(() => {
    if (!editorRef.current || codeMirrorInitialized.current) return;

    async function init() {
      editorRef.current =  CodeMirror.fromTextArea(editorRef.current, {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });

      // Set codeMirrorInitialized to true to prevent re-initialization
      codeMirrorInitialized.current = true;

      // code sync
      editorRef.current.on('change', (instance, changes) => {
        console.log('changes', changes);
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== 'setValue') {
          socket.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          })
        }
        console.log(code);
      });

      socket.on(ACTIONS.CODE_CHANGE, ({code}) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      })

      return () => {
        socket.off(ACTIONS.CODE_CHANGE);
      };
  
    }
    init();
  }, []);

  return <textarea ref={editorRef} id="livecodeeditor"></textarea>;
};

export default Editor;
