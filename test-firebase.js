// Test Firebase connection and questions collection
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9raam6InbA4sEyIlGvq1JH0sYU7L_8S0",
  authDomain: "ai-interviewer-ab969.firebaseapp.com",
  projectId: "ai-interviewer-ab969",
  storageBucket: "ai-interviewer-ab969.firebasestorage.app",
  messagingSenderId: "793087621521",
  appId: "1:793087621521:web:34c46421945061485c8230"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebaseConnection() {
  try {
    console.log("Testing Firebase connection...");
    
    // Try to fetch questions
    const questionsRef = collection(db, "questions");
    const snapshot = await getDocs(questionsRef);
    
    console.log("Connection successful!");
    console.log("Number of questions found:", snapshot.size);
    
    if (snapshot.size === 0) {
      console.log("No questions found. Adding a sample question...");
      
      // Add a sample question
      const sampleQuestion = {
        name: "Two Sum",
        statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Easy",
        category: "Arrays"
      };
      
      const docRef = await addDoc(questionsRef, sampleQuestion);
      console.log("Sample question added with ID:", docRef.id);
      
      // Fetch again to verify
      const newSnapshot = await getDocs(questionsRef);
      console.log("Questions after adding sample:", newSnapshot.size);
    }
    
    // Display all questions
    snapshot.forEach((doc) => {
      console.log("Question:", doc.id, "=>", doc.data());
    });
    
  } catch (error) {
    console.error("Firebase connection failed:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
  }
}

testFirebaseConnection();
