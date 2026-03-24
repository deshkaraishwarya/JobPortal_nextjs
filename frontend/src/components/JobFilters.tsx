'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

/**
 * JobFilters Component
 * 
 * WHY 'use client'?
 * Because it manages typing state and interacts with Next.js router hooks
 * like `useRouter` and `useSearchParams` to modify the URL.
 */
export default function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from existing URL params (if any)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    isRemote: searchParams.get('isRemote') === 'true',
  });

  // Debounce typing so we don't spam the URL on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      // Build the new search string
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.location) params.set('location', filters.location);
      if (filters.jobType) params.set('jobType', filters.jobType);
      if (filters.experienceLevel) params.set('experienceLevel', filters.experienceLevel);
      if (filters.isRemote) params.set('isRemote', 'true');

      // Next.js App Router pushes the new URL. 
      // This automatically triggers the SSR page to re-fetch getJobs() with the new params!
      router.push(`/jobs?${params.toString()}`);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const isChecked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? isChecked : value,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Filter Jobs</h2>
      
      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Title, skills, or company"
            className="input-field"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="City or Country"
            className="input-field"
          />
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Job Type</label>
          <select
            name="jobType"
            value={filters.jobType}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Experience</label>
          <select
            name="experienceLevel"
            value={filters.experienceLevel}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">All Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="lead">Lead</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        {/* Remote Checkbox */}
        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="isRemote"
            name="isRemote"
            checked={filters.isRemote}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <label htmlFor="isRemote" className="text-sm font-medium text-slate-700 cursor-pointer">
            Remote Jobs Only
          </label>
        </div>
        
        {/* Clear Filters Button */}
        <button 
          onClick={() => setFilters({ search: '', location: '', jobType: '', experienceLevel: '', isRemote: false })}
          className="w-full mt-4 py-2 text-sm text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
