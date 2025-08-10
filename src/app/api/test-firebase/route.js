import { db } from '../../../firebaseConfig';
import { collection, getDocs, addDoc } from "firebase/firestore";

export async function GET() {
  try {
    console.log("API: Testing Firebase connection...");
    
    // Try to fetch questions
    const questionsRef = collection(db, "questions");
    
    // Add sample questions first (these might work without auth restrictions)
    const sampleQuestions = [
      {
        name: "Two Sum",
        statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Easy",
        category: "Arrays"
      },
      {
        name: "Reverse String",
        statement: "Write a function that reverses a string. The input string is given as an array of characters s.",
        difficulty: "Easy",
        category: "Strings"
      },
      {
        name: "Valid Parentheses",
        statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "Easy",
        category: "Stack"
      }
    ];
    
    try {
      // Try to add sample questions
      for (const question of sampleQuestions) {
        await addDoc(questionsRef, question);
      }
      console.log("Sample questions added successfully");
    } catch (addError) {
      console.log("Could not add questions (might already exist or need auth):", addError.message);
    }
    
    // Try to fetch questions
    const snapshot = await getDocs(questionsRef);
    const questions = [];
    snapshot.forEach((doc) => {
      questions.push({ id: doc.id, ...doc.data() });
    });
    
    console.log("API: Found questions:", questions);
    
    return Response.json({ 
      success: true, 
      questions: questions,
      count: questions.length,
      message: questions.length > 0 ? "Questions fetched successfully" : "No questions found"
    });
    
  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      suggestion: "This might be a Firebase security rules issue. Check if authentication is required."
    }, { status: 500 });
  }
}
