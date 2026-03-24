'use client';

/**
 * WHY 'use client'?
 * In Next.js 14 App Router, all components are Server Components by default.
 * Server Components CANNOT use hooks like useState, useEffect, or usePathname.
 * Since a Navbar needs to know the current browser path to highlight the active
 * link, and needs to handle user clicks (logout), it MUST be a Client Component.
 */
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // We'll manage basic auth state here for now.
  // In a real app, you might use React Context or Jotai/Zustand.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);

  // Check auth status on mount and when pathname changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // We stored the user object during login/register
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsEmployer(user.role === 'employer');
      }
    } else {
      setIsAuthenticated(false);
      setIsEmployer(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    router.push('/');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Find Jobs', href: '/jobs' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span className="font-bold text-xl tracking-tight text-blue-600">
                JobTrackr
              </span>
            </Link>

            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'border-blue-600 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {isEmployer && (
                  <Link href="/jobs/new" className="hidden sm:block btn-secondary text-sm">
                    ✨ Post a Job
                  </Link>
                )}
                <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-500 hover:text-slate-900"
                >
                  Log in
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
