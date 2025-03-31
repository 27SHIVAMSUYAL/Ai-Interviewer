"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    OAuthProvider,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    // Handle email/password signup
    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            setError("");
        } catch (error) {
            setError(error.message);
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            setUser(userCredential.user);
        } catch (error) {
            setError(error.message);
        }
    };

    // Sign in with GitHub
    const signInWithGithub = async () => {
        const provider = new GithubAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            setUser(userCredential.user);
        } catch (error) {
            setError(error.message);
        }
    };

    // Sign in with Microsoft
    const signInWithMicrosoft = async () => {
        const provider = new OAuthProvider("microsoft.com");
        try {
            const userCredential = await signInWithPopup(auth, provider);
            setUser(userCredential.user);
        } catch (error) {
            setError(error.message);
        }
    };

    const router = useRouter();

    useEffect(() => {
         if (user) {
            router.push("/interview");
         } 

    }, [user]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl text-black text-center font-bold mb-4">Sign Up</h2>

                {error && <p className="text-red-500">{error}</p>}

                {user ? (
                    <div>
                        <p>Welcome, {user.displayName || user.email}</p>
                    </div>
                ) : (
                    <>
                        {/* Email/Password Signup Form */}
                        <form onSubmit={handleSignup} className="flex flex-col space-y-3">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="p-2 border rounded text-gray-600"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="p-2 border rounded text-gray-600"
                                required
                            />
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                                Sign Up
                            </button>
                        </form>
                        <p className="text-center text-gray-600 mt-2">Or sign up with</p>
                        <div className="mt-4 space-y-2">

                            <div className="flex justify-center space-x-2 mt-2">
                                <button
                                    onClick={signInWithGoogle}
                                    className="bg-red-500 text-white p-2 rounded hover:bg-red-800"
                                >
                                    Google
                                </button>
                                <button onClick={signInWithGithub}
                                    className="bg-gray-800 text-white p-2 rounded hover:bg-gray-500" >
                                    GitHub
                                </button>
                                <button
                                    onClick={signInWithMicrosoft}
                                    className="bg-blue-700 text-white p-2 rounded hover:bg-blue-800"
                                >
                                    Microsoft
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}



