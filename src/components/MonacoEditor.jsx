"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import "react-resizable/css/styles.css";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { db, auth } from '../firebaseConfig';  // Import auth as well
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";


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

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });

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

    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const interviewInterval = useRef(null);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Function to fetch all questions
    const fetchQuestions = async () => {
        try {
            console.log("Starting to fetch questions...");
            console.log("Database instance:", db);
            console.log("Current user:", user);
            
            if (!user) {
                console.log("No user authenticated, using fallback questions");
                // Return fallback questions if no user is authenticated
                const fallbackQuestions = [
                    {
                        id: "fallback-1",
                        name: "Two Sum",
                        statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                        difficulty: "Easy",
                        category: "Arrays"
                    },
                    {
                        id: "fallback-2",
                        name: "Reverse String",
                        statement: "Write a function that reverses a string. The input string is given as an array of characters s.",
                        difficulty: "Easy",
                        category: "Strings"
                    },
                    {
                        id: "fallback-3",
                        name: "Valid Parentheses",
                        statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
                        difficulty: "Easy",
                        category: "Stack"
                    }
                ];
                console.log("Using fallback questions:", fallbackQuestions);
                return fallbackQuestions;
            }
            
            // Reference to the 'questions' collection
            const questionsCollection = collection(db, "questions");
            console.log("Questions collection reference:", questionsCollection);
            
            const querySnapshot = await getDocs(questionsCollection);
            console.log("Query snapshot received:", querySnapshot);
            console.log("Query snapshot size:", querySnapshot.size);

            // Array to store all statements
            const questions = [];

            // Loop through each document
            querySnapshot.forEach((doc) => {
                console.log("Document found:", doc.id, doc.data());
                questions.push({ id: doc.id, ...doc.data() });
            });

            // Log or return the result
            console.log("All Questions fetched:", questions);
            console.log("Total questions found:", questions.length);
            
            // If no questions found in Firebase, return fallback questions
            if (questions.length === 0) {
                console.log("No questions in Firebase, using fallback questions");
                const fallbackQuestions = [
                    {
                        id: "fallback-1",
                        name: "Two Sum",
                        statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                        difficulty: "Easy",
                        category: "Arrays"
                    },
                    {
                        id: "fallback-2",
                        name: "Reverse String",
                        statement: "Write a function that reverses a string. The input string is given as an array of characters s.",
                        difficulty: "Easy",
                        category: "Strings"
                    },
                    {
                        id: "fallback-3",
                        name: "Valid Parentheses",
                        statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
                        difficulty: "Easy",
                        category: "Stack"
                    }
                ];
                return fallbackQuestions;
            }
            
            return questions;

        } catch (error) {
            console.error("Error fetching questions:", error);
            console.error("Error details:", error.message, error.code);
            
            // Return fallback questions on error
            console.log("Firebase error, using fallback questions");
            const fallbackQuestions = [
                {
                    id: "fallback-1",
                    name: "Two Sum",
                    statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                    difficulty: "Easy",
                    category: "Arrays"
                },
                {
                    id: "fallback-2",
                    name: "Reverse String",
                    statement: "Write a function that reverses a string. The input string is given as an array of characters s.",
                    difficulty: "Easy",
                    category: "Strings"
                },
                {
                    id: "fallback-3",
                    name: "Valid Parentheses",
                    statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
                    difficulty: "Easy",
                    category: "Stack"
                }
            ];
            
            setOutput((prevOutput) => `${prevOutput}\n\n[Info]: Using fallback questions due to Firebase connection issue.`);
            return fallbackQuestions;
        }
    };

    // Stop Interview Function
    const stopInterview = () => {
        if (interviewInterval.current) {
            clearInterval(interviewInterval.current);
            setOutput((prevOutput) => `${prevOutput}\n\nInterview Stopped.`);
            console.log("Interview stopped");
        }
    };

  










    // AI Interview Function
    const runAIInterview = async () => {
        if (!selectedQuestion || !code) {
            console.warn("No question selected or no code written.");
            setOutput((prevOutput) => `${prevOutput}\n\n[Warning]: No question selected or no code written.`);
            return;
        }

        const prompt = `
      Act as a coding interviewer. 
      Question: ${selectedQuestion?.statement}
      Candidate's Current Code: 
      ${code}
      
      1. Do you think the candidate is heading in the right direction?
      2. What suggestions or improvements would you recommend?
      3. Rate the candidate's coding skills out of 10 based on what they have written so far.
      but in a few words , just talk directly to the candidate your words are being converted to speech`;

        try {
            setOutput((prevOutput) => `${prevOutput}\n\n[Getting AI Feedback...]`);
            const result = await model.generateContent(prompt);
            const aiResponse = await result.response.text();
            setOutput((prevOutput) => `${prevOutput}\n\n[INTERVIEW FEEDBACK]:\n${aiResponse}`);
            console.log("AI Response: ", aiResponse);
        } catch (error) {
            console.error("Error calling GenAI:", error);
            setOutput((prevOutput) => `${prevOutput}\n\n[Error]: Unable to get feedback. ${error.message}`);
        }
    };



    const languageMap = {
        javascript: 63, // JavaScript
        python: 71, // Python
        cpp: 54, // C++
    };



    // Monitor authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("Auth state changed:", currentUser ? "User logged in" : "No user");
            setUser(currentUser);
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Fetch questions on component mount - try regardless of auth status
    useEffect(() => {
        if (!authLoading) {
            const loadQuestions = async () => {
                console.log("useEffect: Starting to load questions...");
                if (user) {
                    console.log("Current user:", user.email);
                }
                setLoading(true);
                setOutput("Loading questions...");
                try {
                    const fetchedQuestions = await fetchQuestions();
                    console.log("useEffect: Questions fetched:", fetchedQuestions);
                    setQuestions(fetchedQuestions || []);
                    const message = fetchedQuestions?.length > 0 
                        ? `Loaded ${fetchedQuestions.length} questions successfully.` 
                        : "No questions found.";
                    console.log("useEffect:", message);
                    setOutput(message);
                } catch (error) {
                    console.error("useEffect: Failed to load questions:", error);
                    setOutput("Failed to load questions. Using fallback questions.");
                } finally {
                    setLoading(false);
                    console.log("useEffect: Loading completed");
                }
            };
            loadQuestions();
        }
    }, [authLoading, user]);

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
            if (newWidth >= 500 && newWidth <= 800) {
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



      // Start Interview Function
      const startInterview = () => {
        if (!selectedQuestion) {
            alert("Please select a question before starting the interview.");
            return;
        }
        setOutput("Interview Started...");
        console.log("Interview started");
        interviewInterval.current = setInterval(runAIInterview, 10000); // 1-minute interval
    };


    return (
        <div style={{ width: "90%"}}>
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
                    width: '100%' // Adjust with editor width
                }}>
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
                <select
                    value={selectedQuestion?.id || ""}
                    onChange={(e) =>
                        setSelectedQuestion(
                            questions.find((q) => q.id === e.target.value) || null
                        )
                    }
                    style={{
                        padding: "5px",
                        color: theme === "vs-dark" ? "#fff" : "#000",
                        borderRadius: "4px",
                        background: theme === "vs-dark" ? "#444" : "#fff",
                        border: "1px solid #ccc",
                    }}
                >
                    <option value="" disabled>
                        Select Question
                    </option>
                    {questions.map((q) => (
                        <option key={q.id} value={q.id}>
                            {q.name}
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
                <button
                    onClick={startInterview}
                    disabled={loading}
                    style={{
                        padding: "8px 12px",
                        backgroundColor: loading ? "#999" : "#28a745",
                        color: "#fff",
                        borderRadius: "5px",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    Start Interview
                </button>
                <button
                    onClick={stopInterview}
                    disabled={loading}
                    style={{
                        padding: "8px 12px",
                        backgroundColor: loading ? "#999" : "#dc3545",
                        color: "#fff",
                        borderRadius: "5px",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    Stop Interview
                </button>
            </div>

            {/* Resizable Editor */}
            <div style={{ display: "flex" }}>
                <div
                    ref={editorRef}
                    style={{
                        width: editorWidth,
                        height: "400px",
                        border: "1px solid #ccc",
                        position: "relative",
                        display: "flex",
                    }}>

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



                </div>{/* Right Side Div */}
                <div style={{

                    flex: 1,                         // Take remaining space
                    overflowY: "auto",               // Enable vertical scrolling
                    overflowX: "hidden",             // Disable horizontal scrolling
                    whiteSpace: "pre-wrap",          // Wrap long text
                    wordBreak: "break-word",         // Break long words
                    padding: "10px",                 // Inner padding for readability
                    backgroundColor: "#fff",         // Optional for contrast
                    borderRadius: "5px",             // Aesthetic rounded corners
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)", // Slight shadow
                    maxHeight: "400px"               // <-- ADD THIS LINE
                }}>
                    <h3 className="text-black">Question</h3>
                    <p className="bg-blue-100 text-black">{selectedQuestion?.statement || "Please select a question."}</p>
                </div>




            </div>


            {/* Output */}
           
            <pre style={{ color: "black", marginTop: "15px", padding: "10px", background: "#eee", borderRadius: "5px" }}>
                {output}
            </pre>

        </div>
    );
};

export default MonacoEditor;




