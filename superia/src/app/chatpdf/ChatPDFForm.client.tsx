'use client'
import { useState } from 'react';
import { ClipLoader } from 'react-spinners';

const YoutubeDataForm = () => {
  const [url, setUrl] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [assistantId, setAssistantId] = useState<string>('');
  const [responses, setResponses] = useState<{ question: string; response: string }[]>([]);
  const [youtubeData, setYoutubeData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://superia.northeurope.cloudapp.azure.com/youtube_data?url=${encodeURIComponent(url)}`);
      console.log('YouTube data response:', res);
      if (!res.ok) {
        throw new Error(`An error occurred: ${res.statusText}`);
      }
      const data = await res.json();
      console.log('YouTube data:', data);
      setYoutubeData(data.response);
      setAssistantId(data.assistant_id); // Assuming the response contains the assistant_id
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const askRes = await fetch('https://superia.northeurope.cloudapp.azure.com/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          assistant_id: assistantId,
        }),
      });
      console.log('Query response:', askRes);
      if (!askRes.ok) {
        throw new Error(`An error occurred: ${askRes.statusText}`);
      }
      const askData = await askRes.json();
      console.log('Query data:', askData);
      // Clean the response to remove leading/trailing whitespace and newlines
      setResponses(prevResponses => [...prevResponses, { question: question, response: askData.response }]);  // Append new response
    } catch (error) {
      console.error('Error querying assistant:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
      setQuestion(''); // Clear the question input after submission
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <label htmlFor="url">YouTube URL:</label>
        <input
          className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6"
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Envoyer'}
        </button>
      </form>

      {loading && <ClipLoader color="#0000ff" loading={loading} size={150} />}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {youtubeData && (
        <div>
          <h2 className='font-bold text-2xl my-5'>YouTube Résumé:</h2>
          <div dangerouslySetInnerHTML={{ __html: youtubeData }} />
        </div>
      )}

      {responses.length > 0 && (
        <div>
          <h2 className='font-bold text-2xl my-5'>Réponses:</h2>
          {responses.map((item, index) => (
            <div key={index}>
              <h3 className='font-bold'>Question: {item.question}</h3>
              <div dangerouslySetInnerHTML={{ __html: item.response }} />
            </div>
          ))}
        </div>
      )}

      {assistantId && (
        <form onSubmit={handleAsk} className="ask-form">
          <label htmlFor="question">Question:</label>
          <input
            className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6"
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
          <button className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Pose ta question'}
          </button>
        </form>
      )}
    </div>
  );
};

export default YoutubeDataForm;






