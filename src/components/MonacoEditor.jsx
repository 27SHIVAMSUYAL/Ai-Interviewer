"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import "react-resizable/css/styles.css";

const boilerplateCodes = {
    javascript: `// JavaScript Boilerplate
function sayHello() {
  console.log("Hello, World!");
}
sayHello();`,

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
};

const languageMap = {
    javascript: 63, // JavaScript
    python: 71, // Python
    cpp: 54, // C++
};

const MonacoEditor = () => {
    const [language, setLanguage] = useState("javascript");
    const [theme, setTheme] = useState("vs-dark");
    const [fontSize, setFontSize] = useState(14);
    const [code, setCode] = useState(boilerplateCodes[language]);
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [editorWidth, setEditorWidth] = useState(800);
    const editorRef = useRef(null);
    const isDraggingRef = useRef(false);

    useEffect(() => {
        const savedCode = localStorage.getItem(`monaco-code-${language}`);
        setCode(savedCode || boilerplateCodes[language]);
    }, [language]);

    useEffect(() => {
        localStorage.setItem(`monaco-code-${language}`, code);
    }, [code, language]);

    const encodeBase64 = (str) => {
        return btoa(unescape(encodeURIComponent(str)));
    };

    const runCode = async () => {
        setOutput("");
        setLoading(true);

        const apiKey = process.env.NEXT_PUBLIC_JUDGE0_API_KEY;
        if (!apiKey) {
            setOutput("Error: API key is missing!");
            setLoading(false);
            return;
        }

        const submissionData = {
            source_code: encodeBase64(code),
            language_id: languageMap[language],
            stdin: encodeBase64(""),
            expected_output: null,
            base64_encoded: "true",
        };

        try {
            const response = await axios.post(
                "https://judge0-ce.p.rapidapi.com/submissions",
                submissionData,
                {
                    params: { base64_encoded: "true", fields: "*" },
                    headers: {
                        "x-rapidapi-key": apiKey,
                        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                        "Content-Type": "application/json",
                    },
                }
            );

            const { token } = response.data;
            if (!token) {
                setOutput("Error: No token received!");
                setLoading(false);
                return;
            }

            let result = null;
            while (!result || result.status.id <= 2) {
                await new Promise((res) => setTimeout(res, 1500));
                result = await axios.get(
                    `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
                    {
                        params: { base64_encoded: "true", fields: "*" },
                        headers: {
                            "x-rapidapi-key": apiKey,
                            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                        },
                    }
                );
                result = result.data;
            }

            setOutput(atob(result.stdout || "No Output"));
        } catch (error) {
            console.error(error);
            setOutput("Error: Unable to execute the code!");
        }

        setLoading(false);
    };

    // Handle Dragging to Resize Editor
    const startDrag = () => {
        isDraggingRef.current = true;
    };

    const stopDrag = () => {
        isDraggingRef.current = false;
    };

    const handleMouseMove = (event) => {
        if (isDraggingRef.current) {
            const newWidth = event.clientX - editorRef.current.getBoundingClientRect().left;
            if (newWidth >= 500 && newWidth <= 1200) {
                setEditorWidth(newWidth);
            }
        }
    };

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", stopDrag);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopDrag);
        };
    }, []);

    return (
        <div style={{ width: "90%", paddingTop: "20px" }}>
            {/* Controls - Now Responsive to Editor Width */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                    background: theme === "vs-dark" ? "#282c34" : "#f5f5f5",
                    padding: "10px",
                    borderRadius: "5px",
                    color: theme === "vs-dark" ? "#fff" : "#000",
                    width: editorWidth, // Adjust with editor width
                }}
            >
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                        padding: "5px",
                        borderRadius: "4px",
                        background: theme === "vs-dark" ? "#444" : "#fff",
                        color: theme === "vs-dark" ? "#fff" : "#000",
                        border: "1px solid #ccc",
                    }}
                >
                    {Object.keys(boilerplateCodes).map((lang) => (
                        <option key={lang} value={lang}>
                            {lang.toUpperCase()}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
                    style={{
                        padding: "5px 10px",
                        borderRadius: "4px",
                        background: theme === "vs-dark" ? "#444" : "#fff",
                        color: theme === "vs-dark" ? "#fff" : "#000",
                        border: "1px solid #ccc",
                    }}
                >
                    {theme === "vs-dark" ? "☀️ Light" : "🌙 Dark"}
                </button>

                <input
                    type="number"
                    min="10"
                    max="30"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    style={{
                        width: "50px",
                        padding: "5px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                />

                <button
                    onClick={runCode}
                    disabled={loading}
                    style={{
                        padding: "8px 12px",
                        backgroundColor: loading ? "#999" : "#007bff",
                        color: "#fff",
                        borderRadius: "5px",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Running..." : "Run Code"}
                </button>
            </div>

            {/* Resizable Editor */}
            <div
                ref={editorRef}
                style={{
                    width: editorWidth,
                    height: "400px",
                    border: "1px solid #ccc",
                    position: "relative",
                }}
            >
                <Editor
                    height="100%"
                    language={language}
                    theme={theme}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{ fontSize, automaticLayout: true }}
                />
                <div
                    onMouseDown={startDrag}
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        width: "10px",
                        height: "100%",
                        cursor: "ew-resize",
                        backgroundColor: "transparent",
                    }}
                />
            </div>

            {/* Output */}
            <pre style={{ color: "black", marginTop: "15px", padding: "10px", background: "#eee", borderRadius: "5px" }}>
                {output}
            </pre>

        </div>
    );
};

export default MonacoEditor;
