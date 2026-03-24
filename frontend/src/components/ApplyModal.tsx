'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface ApplyModalProps {
  jobId: string;
}

export default function ApplyModal({ jobId }: ApplyModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    resume: '',
    coverLetter: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpen = () => {
    // Basic check: is user logged in?
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to apply for jobs.');
      router.push('/login');
      return;
    }
    
    // Check if user is a jobseeker
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'jobseeker') {
        alert('Only Job Seekers can apply to jobs. Employers cannot apply.');
        return;
      }
    }

    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await api.post<any>(`/applications/${jobId}`, formData);

      if (!response.success) {
        throw new Error(response.message || 'Application failed');
      }

      setStatus('success');
      
      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
        router.refresh(); // Refresh SSR page to update application counts if needed
      }, 2000);

    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="btn-primary w-full text-lg py-3 shadow-md hover:shadow-lg transition-all"
      >
        Apply Now
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Submit Application</h2>
            <p className="text-slate-500 mb-6 text-sm">Please provide a link to your resume and an optional cover letter.</p>

            {status === 'success' ? (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-center font-medium my-4">
                🎉 Application submitted successfully! Good luck!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {status === 'error' && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resume Link (URL)</label>
                  <input
                    type="url"
                    required
                    className="input-field"
                    placeholder="https://drive.google.com/... or portfolio link"
                    value={formData.resume}
                    onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cover Letter (Optional)</label>
                  <textarea
                    rows={4}
                    className="input-field"
                    placeholder="Why are you a great fit for this role?"
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors border border-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex-1 btn-primary py-2"
                  >
                    {status === 'loading' ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
