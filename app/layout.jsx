'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { usePathname } from "next/navigation";
import Header from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Shop Billing System',
//   description: 'Complete billing solution for retail shops',
// };

export default function RootLayout({ children }) {

  const pathname = usePathname();

  const hideHeaderRoutes = ["/login", "/register"];
  const shouldHideHeader = hideHeaderRoutes.includes(pathname);

  return (
    <html lang="en">
      <body className={`${inter.className} h-screen`}>
        <AuthProvider>
          {!shouldHideHeader && <Header />}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}