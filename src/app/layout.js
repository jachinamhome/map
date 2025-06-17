import "./globals.css";
import Link from 'next/link';
import { FaHome, FaYoutube, FaInstagram } from 'react-icons/fa';

export const metadata = {
  title: "자취남부동산",
  description: "자취남부동산 웹 애플리케이션",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">

      <head>
        <meta name="theme-color" content="#FFE066" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>

      <body className="bg-background text-foreground">
        <div className="min-h-screen flex flex-col">
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          {/* Footer */}
          {/* <footer className="w-full bg-white border-t border-gray-200 mt-4 py-6 sm:pb-2 px-4 flex flex-col items-center gap-2 text-sm text-gray-500">
            <div className="flex gap-6 mb-2">
              <Link href="/" className="hover:text-blue-500 transition-colors" aria-label="홈페이지">
                <FaHome className="w-7 h-7" />
              </Link>
              <a href="https://www.youtube.com/@jachinam" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors" aria-label="유튜브">
                <FaYoutube className="w-7 h-7" />
              </a>
              <a href="https://www.instagram.com/jachinam" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors" aria-label="인스타그램">
                <FaInstagram className="w-7 h-7" />
              </a>
            </div>
            <div className="text-xs text-gray-400">© {new Date().getFullYear()} 자취남부동산. All rights reserved.</div>
          </footer> */}
        </div>
      </body>
    </html>
  );
}
