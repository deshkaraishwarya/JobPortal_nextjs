import type { Metadata } from 'next';
import HomeSearch from '@/components/HomeSearch';

/**
 * WHY do pages export metadata?
 * In the App Router, each page/layout can export its own `metadata` object.
 * Next.js merges it with the root layout's metadata.
 * The `template: '%s | JobTrackr'` in the root layout means this page
 * will render as: "Find Your Next Job | JobTrackr" in the browser tab.
 */
export const metadata: Metadata = {
  title: 'Find Your Next Job',
  description:
    'Browse thousands of job listings across all industries and locations.',
};

/**
 * WHY is this a Server Component by default?
 * In Next.js 14 App Router, ALL components are React Server Components (RSC)
 * UNLESS you add "use client" at the top.
 *
 * Server Components:
 * ✅ Can fetch data directly (no useEffect needed!)
 * ✅ Can access backend resources (DB, files, env vars)
 * ✅ Zero JS sent to browser for the component itself
 * ❌ Cannot use useState, useEffect, or browser APIs
 *
 * Since our home page just displays content (no interactivity),
 * a Server Component is perfect here.
 *
 * This page will be STATICALLY GENERATED (SSG) at build time by default,
 * because there's no dynamic data fetching. We'll add dynamic job data
 * in Phase 5 and show SSR vs SSG vs CSR in practice.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="animate-fade-in">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
            🚀 Now Live — JobTrackr Beta
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight mb-6">
            Find Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              Dream Job
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Browse thousands of opportunities, apply with one click, and track
            every application — all in one place.
          </p>

          {/* Search Bar — will be interactive (Client Component) in Phase 6 */}
          <HomeSearch />
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '10,000+', label: 'Active Jobs' },
            { value: '2,500+', label: 'Companies' },
            { value: '50,000+', label: 'Job Seekers' },
            { value: '95%', label: 'Satisfaction Rate' },
          ].map((stat) => (
            <div key={stat.label} className="card animate-slide-up">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { icon: '💻', name: 'Engineering', count: '3,240' },
            { icon: '🎨', name: 'Design', count: '1,180' },
            { icon: '📊', name: 'Marketing', count: '890' },
            { icon: '💼', name: 'Sales', count: '1,450' },
            { icon: '🏥', name: 'Healthcare', count: '760' },
            { icon: '📚', name: 'Education', count: '540' },
            { icon: '⚖️', name: 'Legal', count: '320' },
            { icon: '🏗️', name: 'Operations', count: '980' },
          ].map((cat) => (
            <div
              key={cat.name}
              className="card flex items-center gap-3 cursor-pointer hover:border-blue-300 hover:scale-105 transition-all duration-200"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <div className="font-semibold text-slate-800">{cat.name}</div>
                <div className="text-xs text-slate-500">{cat.count} jobs</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
