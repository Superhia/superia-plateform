"use client"
import React, { useState } from 'react';

// Define a type for the API response
interface SentimentAnalysisResponse {
  status: string;
  response: string;
}

const SentimentAnalysisForm = () => {
  const [entreprise, setEntreprise] = useState<string>('');
  const [response, setResponse] = useState<SentimentAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('https://superia.northeurope.cloudapp.azure.com/sentiment_analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entreprise }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data: SentimentAnalysisResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Sentiment Analysis</h1>
      <form onSubmit={handleSubmit}>
        <input
        className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6"
          type="text"
          value={entreprise}
          onChange={(e) => setEntreprise(e.target.value)}
          placeholder="Enter company name"
          required
        />
        <button className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Analyze'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && (
        <div>
          <h2>Analysis Result</h2>
          <p>Status: {response.status}</p>
          <p>Response: {response.response}</p>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysisForm;
