'use client';

import { useState, FormEvent, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const { id: apiId } = use(params);
  const router = useRouter();
  
  const [apiName, setApiName] = useState('Loading...');
  const [rating, setRating] = useState(5);
  const [textContent, setTextContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Fetch the API Name for display purposes
  useEffect(() => {
    async function fetchApiName() {
      try {
        const res = await fetch(`/api/stats/${apiId}`);
        const data = await res.json();
        if (res.ok) {
          setApiName(data.name);
        } else {
          setApiName('API Not Found');
        }
      } catch (e) {
        setApiName('Error loading API name');
      }
    }
    fetchApiName();
  }, [apiId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiId, rating, textContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: `Thank you! Your review for ${apiName} was submitted. Redirecting...`, type: 'success' });
        setTimeout(() => {
          router.push(`/api/${apiId}`);
        }, 2000);
      } else {
        setMessage({ text: data.message || 'Review submission failed.', type: 'error' });
      }

    } catch (error) {
      setMessage({ text: 'A network error occurred. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/api/${apiId}`} className="text-teal-400 hover:text-teal-300 text-sm mb-2 inline-block">
            ← Back to API Details
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Submit a Review</h1>
          <p className="text-gray-400">for: <span className="text-teal-400 font-semibold">{apiName}</span></p>
        </div>
        
        {/* Status Message Display */}
        {message && (
          <div 
            className={`p-4 mb-6 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-900/30 border-green-500 text-green-300' 
                : 'bg-red-900/30 border-red-500 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Review Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg 
                      className={`w-10 h-10 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-xl font-bold text-white">{rating}/5</span>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label htmlFor="textContent" className="block text-sm font-semibold text-gray-300 mb-2">
                Review Text <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={6}
                placeholder="Share your experience with this API... What did you like? Any issues? Performance notes?"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-teal-500 hover:bg-teal-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}