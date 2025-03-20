"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

const boilerplateCodes = {
  javascript: `// JavaScript Boilerplate
function sayHello() {
  console.log("Hello, World!");
}
sayHello();`,

  typescript: `// TypeScript Boilerplate
function sayHello(name: string): void {
  console.log(\`Hello, \${name}!\`);
}
sayHello("World");`,

  python: `# Python Boilerplate
def say_hello():
    print("Hello, World!")

say_hello()`,

  cpp: `// C++ Boilerplate
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,

  html: `<!-- HTML Boilerplate -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>`,

  css: `/* CSS Boilerplate */
body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    text-align: center;
}
h1 {
    color: blue;
}`,
};

const MonacoEditor = () => {
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [editorWidth, setEditorWidth] = useState("70vw");
  const [code, setCode] = useState(boilerplateCodes[language]);
  const resizerRef = useRef(null);

  useEffect(() => {
    const savedCode = localStorage.getItem(`monaco-code-${language}`);
    setCode(savedCode || boilerplateCodes[language]);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(`monaco-code-${language}`, code);
  }, [code, language]);

  // Handle Drag to Resize
  useEffect(() => {
    const resizer = resizerRef.current;
    if (!resizer) return;

    const handleMouseMove = (event) => {
      const newWidth = Math.min(Math.max(event.clientX, 300), window.innerWidth - 100);
      setEditorWidth(`${newWidth}px`);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = () => {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    resizer.addEventListener("mousedown", handleMouseDown);
    return () => {
      resizer.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Editor Container */}
      <div
        style={{
          width: editorWidth,
          height: "100vh",
          backgroundColor: theme === "vs-dark" ? "#1e1e1e" : "#fff",
          borderRight: "3px solid #ccc",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            background: theme === "vs-dark" ? "#282c34" : "#f5f5f5",
          }}
        >
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: "6px",
              borderRadius: "5px",
              fontSize: "14px",
              color: theme === "vs-dark" ? "#fff" : "#000",
              background: theme === "vs-dark" ? "#444" : "#fff",
            }}
          >
            {Object.keys(boilerplateCodes).map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
            style={{
              padding: "8px",
              borderRadius: "5px",
              cursor: "pointer",
              background: theme === "vs-dark" ? "#444" : "#ddd",
              color: theme === "vs-dark" ? "#fff" : "#000",
              fontSize: "14px",
            }}
          >
            {theme === "vs-dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Font Size Adjuster */}
          <input
            type="number"
            min="10"
            max="30"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{
              padding: "6px",
              width: "50px",
              textAlign: "center",
              fontSize: "14px",
              borderRadius: "5px",
              color: theme === "vs-dark" ? "#fff" : "#000",
              background: theme === "vs-dark" ? "#444" : "#fff",
            }}
          />
        </div>

        {/* Monaco Editor */}
        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            language={language}
            theme={theme}
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              minimap: { enabled: true },
              fontSize: fontSize,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              formatOnType: true,
            }}
          />
        </div>
      </div>

      {/* Resizer Bar */}
      <div
        ref={resizerRef}
        style={{
          width: "5px",
          cursor: "ew-resize",
          backgroundColor: "#aaa",
          height: "100vh",
          zIndex: 10,
        }}
      ></div>

      {/* Right Side Content (Can Add More Features Here) */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <h2>📜 Code Preview</h2>
        <pre
          style={{
            background: theme === "vs-dark" ? "#222" : "#f4f4f4",
            padding: "10px",
            borderRadius: "5px",
            color: theme === "vs-dark" ? "#fff" : "#000",
            fontSize: `${fontSize}px`,
            whiteSpace: "pre-wrap",
          }}
        >
          {code}
        </pre>
      </div>
    </div>
  );
};

export default MonacoEditor;
