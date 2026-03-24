import Link from 'next/link';
import { notFound } from 'next/navigation';
import ApplyModal from '@/components/ApplyModal';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Fetch single job dynamically
async function getJob(id: string) {
  const res = await fetch(`${API_URL}/jobs/${id}`, {
    cache: 'no-store', // Always fetch fresh
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch job');
  }

  const json = await res.json();
  return json.job;
}

/**
 * Dynamic Metadata Generation
 * Next.js calls this before rendering the page to set the SEO <head>
 */
export async function generateMetadata({ params }: { params: { id: string } }) {
  const job = await getJob(params.id);
  if (!job) return { title: 'Job Not Found' };

  return {
    title: `${job.title} at ${job.company}`,
    description: `Apply for the ${job.title} position at ${job.company} in ${job.location}.`,
  };
}

// ─── Dynamic Route Page [id] ──────────────────────────────────────────────────
// WHY [id]?
// The brackets tell Next.js this is a dynamic URL.
// /jobs/1234 -> params.id = "1234"
// ─────────────────────────────────────────────────────────────────────────────

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJob(params.id);

  if (!job) {
    // Triggers Next.js built-in 404 page (or app/not-found.tsx if you make one)
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <Link href="/jobs" className="text-blue-600 hover:text-blue-800 font-medium mb-8 inline-flex items-center gap-2">
        ← Back to all jobs
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="p-8 border-b border-slate-100 p-8 sm:p-10">
          <div className="flex flex-col md:flex-row justify-between item-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
              <div className="text-xl text-blue-600 font-medium mb-4">{job.company}</div>
              
              <div className="flex flex-wrap gap-3">
                <span className="badge-blue capitalize text-sm">{job.jobType.replace('-', ' ')}</span>
                <span className="badge-green capitalize text-sm">{job.experienceLevel} Level</span>
                {job.isRemote && <span className="badge-purple text-sm">Remote</span>}
              </div>
            </div>

            <div className="flex flex-col gap-4 text-left md:text-right min-w-[200px]">
              <ApplyModal jobId={job._id} />
              <div className="text-sm font-medium text-slate-500">
                📍 {job.location}
              </div>
              <div className="text-sm font-medium text-emerald-600">
                💰 ${(job.salary.min / 1000).toFixed(0)}k - ${(job.salary.max / 1000).toFixed(0)}k / year
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-10 bg-slate-50">
          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-bold mb-4">About the role</h3>
            <p className="whitespace-pre-wrap text-slate-600 mb-8">{job.description}</p>

            {job.requirements && job.requirements.length > 0 && (
              <>
                <h3 className="text-xl font-bold mb-4">Requirements</h3>
                <ul className="list-disc pl-5 mb-8 space-y-2 text-slate-600">
                  {job.requirements.map((req: string, i: number) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <>
                <h3 className="text-xl font-bold mb-4">Responsibilities</h3>
                <ul className="list-disc pl-5 mb-8 space-y-2 text-slate-600">
                  {job.responsibilities.map((res: string, i: number) => (
                    <li key={i}>{res}</li>
                  ))}
                </ul>
              </>
            )}

            {job.skills && job.skills.length > 0 && (
              <>
                <h3 className="text-xl font-bold mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
