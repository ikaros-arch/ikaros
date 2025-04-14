import React, { useMemo } from 'react';
import SimpleMDEReact from "react-simplemde-editor";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import "easymde/dist/easymde.min.css";
import 'assets/css/easyMDE.css';


export const TextEditor = ({ id, currData, setCurrData }) => {

  const options = useMemo(() => ({
    toolbar: [
      "bold", 
      "italic",
      "strikethrough",
      "heading",
      "|",
      "unordered-list",
      "ordered-list",
      "quote",
      "table",
      "horizontal-rule",
      "|",
      "undo",
      "redo",
      "|",
      "preview",
      "fullscreen",
      "|",
      "guide"
    ],
    minHeight: "150px",
  }), []); // The empty dependency array means the options will only be created once on mount
  
  function onChange (value) {
    let updatedData = { ...currData, [id]: value };
    setCurrData(updatedData);
  };

  return (
    <SimpleMDEReact
      id={id}
      //label="Your label"
      value={currData ? currData[id] : ''} 
      onChange={onChange}
      options={options}
      style={{width:"100%"
      }}
    />
  );
};

export const TextViewer = ({ id, text }) => {

  const options = useMemo(() => ({
    toolbar: false,
    status: false,
    minHeight: "150px",
  }), []); // The empty dependency array means the options will only be created once on mount

  const getIntance = instance => {
    // You can now store and manipulate the simplemde instance.
    instance.togglePreview();
  };

  return (
    <SimpleMDEReact
      getMdeInstance= { getIntance } // <-- set callback prop
      id={id}
      value={text} 
      options={options}
      style={{width:"100%"}}
    />
  );
};

export const MarkdownViewer = ({ text }) => {

  return (
    <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
  );
};