import './globals.css';
import Link from 'next/link';
import AuthComponent from '@/components/AuthComponent';
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <nav className="p-2 bg-gray-800 flex justify-between items-center h-16">
          <Link href={"/"} className='text-3xl ml-2'>AceBot</Link>

          <div className='flex space-x-2 items-center'>
            <AuthComponent />
            <Link href={"/interview"} className='text-l mr-2 hover:text-blue-200 '>Interview</Link>


            <Link href={"/about"} className='text-l mr-2 hover:text-blue-200 '>About</Link>
          </div>
        </nav>
        {children}
        <footer className="p-4 bg-gray-800 text-center">Google Solution Challenge 2025 AI </footer>
      </body>
    </html>
  );
}
