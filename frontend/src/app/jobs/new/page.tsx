'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticate user on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'employer') {
      router.push('/jobs'); // Kick jobseekers out
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Parse skills into array
    const skillsString = formData.get('skills') as string;
    const skills = skillsString.split(',').map(s => s.trim()).filter(s => s);

    const payload = {
      title: formData.get('title'),
      company: formData.get('company'),
      location: formData.get('location'),
      description: formData.get('description'),
      salary: {
        min: Number(formData.get('salaryMin')),
        max: Number(formData.get('salaryMax')),
      },
      jobType: formData.get('jobType'),
      experienceLevel: formData.get('experienceLevel'),
      isRemote: formData.get('isRemote') === 'on',
      skills,
    };

    try {
      const response = await api.post<any>('/jobs', payload);

      if (response.success && (response as any).job) {
        router.push(`/jobs/${(response as any).job._id}`);
      } else {
        setError(response.message || 'Failed to post job');
      }
    } catch (err: any) {
      setError(err.message || 'A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Post a New Job</h1>
        <p className="text-slate-500 mb-8">Reach thousands of talented developers instantly.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
              <input required type="text" id="title" name="title" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" placeholder="e.g. Senior Frontend Engineer" />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
              <input required type="text" id="company" name="company" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" placeholder="e.g. Acme Corp" />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
              <input required type="text" id="location" name="location" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" placeholder="e.g. New York, NY" />
            </div>

            <div className="flex items-center pt-8">
              <input type="checkbox" id="isRemote" name="isRemote" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded" />
              <label htmlFor="isRemote" className="ml-2 block text-sm text-slate-900">This is a remote position</label>
            </div>
            
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-slate-700 mb-1">Job Type *</label>
              <select required id="jobType" name="jobType" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-slate-700 mb-1">Experience Level *</label>
              <select required id="experienceLevel" name="experienceLevel" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white">
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            <div>
              <label htmlFor="salaryMin" className="block text-sm font-medium text-slate-700 mb-1">Minimum Salary ($) *</label>
              <input required type="number" id="salaryMin" name="salaryMin" min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" placeholder="e.g. 80000" />
            </div>

            <div>
              <label htmlFor="salaryMax" className="block text-sm font-medium text-slate-700 mb-1">Maximum Salary ($) *</label>
              <input required type="number" id="salaryMax" name="salaryMax" min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" placeholder="e.g. 120000" />
            </div>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated) *</label>
            <input required type="text" id="skills" name="skills" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" placeholder="e.g. React, Node.js, TypeScript" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Job Description * (min 50 chars)</label>
            <textarea 
              required 
              id="description" 
              name="description" 
              rows={6} 
              minLength={50}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" 
              placeholder="Describe the role and responsibilities in detail..."></textarea>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3 text-lg transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Publishing Job...' : '🚀 Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
