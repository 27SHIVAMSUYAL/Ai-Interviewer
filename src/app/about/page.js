"use client"
import { useState, useEffect } from "react";
import Loading from "../loading"; // Adjust path accordingly

export default function MyComponent() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 2000); // Simulate API load
    }, []);

    return loading ? <Loading /> : <div>This is the about page </div>;
}
