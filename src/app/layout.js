import './globals.css';
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <nav className="p-4 bg-gray-800">AI VR Interview</nav>
        {children}
        <footer className="p-4 bg-gray-800 text-center">© 2025 AI Simulator</footer>
      </body>
    </html>
  );
}
