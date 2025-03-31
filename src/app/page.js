import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">🚀 AI VR Interview Simulator</h1>
      <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
   
      <p>Practice AI-powered job interviews in a VR environment.</p>
      <Link href="/auth">
        <button className="mt-4 px-6 py-2 bg-blue-600 rounded-lg">Get Started</button>
      </Link>
    </div>
  );
}
