'use client'
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { ClipLoader } from 'react-spinners';
import ReactMarkdown from 'react-markdown';

const socket = io('wss://superia.northeurope.cloudapp.azure.com', {
    path: '/socket.io',
    transports: ['websocket', 'polling']
});

interface QAResponse {
  question: string;
  response: string;
}

interface ProgressData {
  progress: number;
  status: string;
  log?: string;
}

const YoutubeDataForm = () => {
  const [url, setUrl] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [assistantId, setAssistantId] = useState<string>('');
  const [responses, setResponses] = useState<QAResponse[]>([]);
  const [youtubeData, setYoutubeData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [requestLimit, setRequestLimit] = useState<number>(1000);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('Préchauffage du transistor de Superia', (data: ProgressData) => {
      console.log('Progress update received', data); // Debug log
      setProgress(data.progress);
      setStatus(data.status);
      if (data.log) {
        setCurrentUrl(data.log); // Update the current URL being processed
      }
      if (data.progress === 100) {
        setLoading(false);
      }
    });

    socket.on('youtube_data_complete', (data: string) => {
      setYoutubeData(data);
      setLoading(false);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socket.off('Préchauffage du transistor de Superia');
      socket.off('youtube_data_complete');
    };
  }, []);

  const cleanText = (text:string) => {
    const patterns = [
      /assistant_id:\s*\w+/gi,
      /【\d+:\d+†source】/g]; // Use 'g' for global replacement
      patterns.forEach(pattern => {
        text = text.replace(pattern, '');
      });
      return text;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestCount >= requestLimit) return;

    setLoading(true);
    setError(null);
    setYoutubeData(null);
    setStreaming(false);

    try {
      const response = await fetch(`https://superia.northeurope.cloudapp.azure.com/youtube_data?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`Une erreur survient: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream nest pas supporté ou le contenu du corp est null.');
      }
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const cleanedData = cleanText(buffer);
          setYoutubeData(cleanedData);

          // Extract assistant ID from the buffer if it's provided
          const assistantIdMatch = buffer.match(/assistant_id:\s*(\w+)/);
          if (assistantIdMatch) {
            setAssistantId(assistantIdMatch[1]);
          }
        }
      }

      setRequestCount((prevCount) => prevCount + 1); // Increment request count
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestCount >= requestLimit) return;

    setLoading(true);
    setError(null);
    setStreaming(false);

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

      if (!askRes.ok) {
        throw new Error(`Une erreur survient: ${askRes.statusText}`);
      }

      const reader = askRes.body?.getReader();
      if (!reader) {
        throw new Error('Reader nest pas disponible');
      }

      const decoder = new TextDecoder('utf-8');
      let done = false;
      let responseContent = '';

      const newResponses = [...responses, { question, response: '' }];
      const lastIndex = newResponses.length - 1;
      setResponses(newResponses);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          setStreaming(true);
          const chunk = decoder.decode(value, { stream: true });
          responseContent += chunk;

          const cleanedText = cleanText(responseContent);
          newResponses[lastIndex].response = cleanedText;
          setResponses([...newResponses]);
        }
      }

      console.log('Final response content:', responseContent);
      setRequestCount((prevCount) => prevCount + 1); // Increment request count
    } catch (error) {
      console.error('Error querying assistant:', error);
      setError('L assistant ne répond pas.');
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
          disabled={requestCount >= requestLimit}
        />
        <button className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit" disabled={loading || requestCount >= requestLimit}>
          {loading ? 'En cours...' : 'Envoyer'}
        </button>
      </form>

      {loading && !streaming && (
        <div className="flex flex-col items-center">
          <ClipLoader color="#0000ff" loading={loading} size={50} />
          <div className="mt-2">{status}</div>
          <div>En cours de process: {currentUrl}</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
            <div
              className="bg-blue-900 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
            <div>{progress}%</div>
          </div>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {youtubeData && (
        <div>
          <h2 className='font-bold text-2xl my-5'>YouTube Résumé:</h2>
          <ReactMarkdown>{youtubeData}</ReactMarkdown>
        </div>
      )}

      {responses.length > 0 && (
        <div>
          <h2 className='font-bold text-2xl my-5'>Réponses:</h2>
          {responses.map((item, index) => (
            <div key={index}>
              <h3 className='font-bold'>Question: {item.question}</h3>
              <ReactMarkdown>{item.response}</ReactMarkdown>
            </div>
          ))}
        </div>
      )}

      {assistantId && requestCount < requestLimit && (
        <form onSubmit={handleAsk} className="ask-form">
          <label htmlFor="question">Question:</label>
          <input
            className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6"
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            disabled={requestCount >= requestLimit}
          />
          <button className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit" disabled={loading || requestCount >= requestLimit}>
            {loading ? 'En cours...' : 'Posez votre question'}
          </button>
        </form>
      )}

      {requestCount >= requestLimit && (
        <div>
          <p className="text-red-500 font-bold text-xl">Vous avez utilisé le maximum de requêtes.</p>
        </div>
      )}
    </div>
  );
};

export default YoutubeDataForm;
