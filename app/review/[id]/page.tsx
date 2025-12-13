// app/review/[id]/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewPage({ params }: { params: { id: string } }) {
  const apiId = params.id;
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
        // Redirect back to the API detail page after a short delay
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
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">Submit a Review</h1>
      <h2 className="text-xl text-indigo-600 mb-6">for: {apiName}</h2>

      {/* Status Message Display */}
      {message && (
        <div 
          className={`p-3 mb-4 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating (1-5 Stars)</label>
          <input
            id="rating"
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value) || 1)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label htmlFor="textContent" className="block text-sm font-medium text-gray-700">Review Text (Optional)</label>
          <textarea
            id="textContent"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={4}
            placeholder="Share your experience..."
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}