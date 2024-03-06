import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

const Editor = () => {
  const editorRef = useRef(null);
  const codeMirrorInitialized = useRef(false);

  useEffect(() => {
    if (!editorRef.current || codeMirrorInitialized.current) return;

    async function init() {
      CodeMirror.fromTextArea(editorRef.current, {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });

      // Set codeMirrorInitialized to true to prevent re-initialization
      codeMirrorInitialized.current = true;
    }
    init();
  }, []);

  return <textarea ref={editorRef} id="livecodeeditor"></textarea>;
};

export default Editor;
