import Link from 'next/link';
import JobFilters from '@/components/JobFilters';

interface IFrontendJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  isRemote: boolean;
  salary: { min: number; max: number };
  createdAt: string;
}

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * SSR (Server-Side Rendering) Data Fetching function
 */
async function getJobs(searchParamsStr: string): Promise<IFrontendJob[]> {
  // Pass the search string directly to our backend API!
  const res = await fetch(`${API_URL}/jobs?${searchParamsStr}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch jobs');
  }

  const json = await res.json();
  return json.jobs;
}

export const metadata = {
  title: 'All Jobs',
};

// Layouts and Pages in Next.js receive `searchParams` as a prop automatically!
export default async function JobsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Convert Next.js searchParams object back to a standard URL query string
  const queryParamStr = new URLSearchParams(searchParams as any).toString();
  
  // 1. Fetch data on the server, constrained by the URL filters
  const jobs = await getJobs(queryParamStr);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Latest Opportunities</h1>
        <span className="text-slate-500">{jobs.length} jobs found</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters (Client Component) */}
        <aside className="w-full lg:w-1/4">
          <JobFilters />
        </aside>

        {/* Job Listings Header */}
        <div className="w-full lg:w-3/4">
          <div className="grid gap-4 sm:gap-6">
            {jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-500">No open jobs found matching your criteria right now.</p>
              </div>
            ) : (
              jobs.map((job: any) => (
                <Link key={job._id} href={`/jobs/${job._id}`} className="block group">
                  <div className="card group-hover:border-blue-400 group-hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h2>
                        <p className="text-slate-600 mt-1">{job.company}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          {job.isRemote && <span className="badge-purple">Remote</span>}
                          <span className="badge-blue capitalize">{job.jobType.replace('-', ' ')}</span>
                          <span className="badge-green capitalize">{job.experienceLevel} Level</span>
                          <span className="text-sm font-medium text-slate-500 flex items-center gap-1 ml-2">
                            📍 {job.location}
                          </span>
                        </div>
                      </div>
                      
                      <div className="sm:text-right flex flex-col justify-between">
                        <span className="font-semibold text-emerald-600">
                          ${(job.salary.min / 1000).toFixed(0)}k - ${(job.salary.max / 1000).toFixed(0)}k
                        </span>
                        <span className="text-sm text-slate-400 mt-2 sm:mt-0">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
