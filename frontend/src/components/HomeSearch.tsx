'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomeSearch() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query params
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    
    // Navigate to jobs page with filters
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
    >
      <input
        type="text"
        placeholder="Job title, company, or keyword..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-field flex-1 text-base"
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="input-field sm:w-40 text-base"
      />
      <button type="submit" className="btn-primary text-base px-8 shrink-0">
        Search
      </button>
    </form>
  );
}
