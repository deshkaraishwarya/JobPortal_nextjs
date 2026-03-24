'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { api } from '@/lib/api';

/**
 * Dashboard Component
 * 
 * WHY IS THIS A CLIENT COMPONENT?
 * Because our JWT is stored in `localStorage`, which is a Browser API.
 * Next.js Server Components run in Node.js, so they cannot access `localStorage`.
 * To fetch protected API routes, we must do it from the client after mounting.
 */
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ensure user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    // 2. Fetch the correct dashboard data based on Role
    const fetchDashboard = async () => {
      try {
        const endpoint = userData.role === 'employer' 
          ? '/applications/employer' 
          : '/applications/me';

        const response = await api.get<any>(endpoint);

        if (response.success) {
          // Matches backend structure: { success: true, applications: [...] }
          setApplications((response as any).applications || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  // Employer action to update an application status
  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      const response = await api.put<any>(`/applications/${appId}/status`, { status: newStatus });

      if (response.success) {
        // Optimistically update the UI locally!
        setApplications(apps => 
          apps.map(app => app._id === appId ? { ...app, status: newStatus } : app)
        );
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user.name}</h1>
        <p className="text-slate-500 text-lg">
          {user.role === 'employer' ? 'Manage your job listings and applicants.' : 'Review your application statuses.'}
        </p>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-6">
        {user.role === 'employer' ? `Recent Applicants (${applications.length})` : `Your Applications (${applications.length})`}
      </h2>

      {applications.length === 0 ? (
        <div className="bg-white p-10 rounded-xl border border-slate-200 text-center">
          <p className="text-slate-500">No applications found.</p>
          {user.role === 'jobseeker' && (
            <Link href="/jobs" className="mt-4 inline-block btn-primary px-6 py-2">Find a Job</Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">{user.role === 'employer' ? 'Applicant Name' : 'Job Title'}</th>
                <th className="p-4">{user.role === 'employer' ? 'Job Applied For' : 'Company'}</th>
                <th className="p-4">Resume</th>
                <th className="p-4">Date Applied</th>
                <th className="p-4 pr-6">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                  
                  {/* Column 1: Identifying entity */}
                  <td className="p-4 pl-6 font-semibold text-slate-900">
                    {user.role === 'employer' ? app.applicant.name : app.job.title}
                  </td>
                  
                  {/* Column 2: Context entity */}
                  <td className="p-4 text-slate-600">
                    {user.role === 'employer' ? app.job.title : app.employer.name}
                  </td>
                  
                  {/* Column 3: Resume */}
                  <td className="p-4">
                    <a href={app.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
                      View Resume ↗
                    </a>
                  </td>

                  {/* Column 4: Date */}
                  <td className="p-4 text-slate-500 text-sm">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>

                  {/* Column 5: Status Badge / Status Selector */}
                  <td className="p-4 pr-6">
                    {user.role === 'jobseeker' ? (
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize
                        ${app.status === 'pending' ? 'bg-amber-100 text-amber-800' : ''}
                        ${app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : ''}
                        ${app.status === 'interviewing' ? 'bg-purple-100 text-purple-800' : ''}
                        ${app.status === 'hired' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${app.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {app.status}
                      </span>
                    ) : (
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app._id, e.target.value)}
                        className={`text-sm border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 font-medium capitalize
                          ${app.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' : ''}
                          ${app.status === 'reviewed' ? 'bg-blue-50 text-blue-800 border-blue-200' : ''}
                          ${app.status === 'interviewing' ? 'bg-purple-50 text-purple-800 border-purple-200' : ''}
                          ${app.status === 'hired' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : ''}
                          ${app.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-200' : ''}
                        `}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
