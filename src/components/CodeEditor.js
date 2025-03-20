"use client"; // Required to avoid hydration errors in Next.js

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

const CodeEditor = () => {
  const [value, setValue] = useState("// Type your JavaScript code here...");

  return (
    <CodeMirror
      value={value}
      height="300px"
      theme="dark"
      extensions={[javascript()]}
      onChange={(val) => setValue(val)}
    />
  );
};

export default CodeEditor;
