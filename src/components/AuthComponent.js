"use client"; // For Next.js App Router

import { auth } from "../firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

export default function AuthComponent() {
  const [user, setUser] = useState(null);    // user is just to save the details of the current user , that firebase gives us , it is used just to rneder the ui accordingly and to display the user details . 

  useEffect(() => {               // 1st parameter is auth and the 2nd parameter is a callback function 
    //  which takes the input by automatically detection of the user you can use any name , user , currentuser , u , cu , hero etc 
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

    });

    return () => unsubscribe(); // Cleanup function
  }, []);

  useEffect(() => {
    console.log("User State Changed:", user);  // ✅ Logs whenever user state changes
  }, [user]);


  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);

    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const logOut = async () => {

    await signOut(auth);
  };

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.displayName}</p>
          <div className="text-center">
            <button onClick={logOut} className="bg-blue-600 text-white py-1 px-2 mb-1 rounded hover:bg-blue-700 cursor-pointer">Logout</button>
          </div>
        </>
      ) : (
        <button onClick={signIn} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700  cursor-pointer">Sign in with Google</button>

      )}
    </div>
  );
}
