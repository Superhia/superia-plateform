import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { io } from 'socket.io-client';
import ReactMarkdown from 'react-markdown';
import ClipLoader from 'react-spinners/ClipLoader';

const socket = io('http://127.0.0.1:8000', {
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

interface SentimentAnalysisResponse {
  status: string;
  response: string;
}
interface ProgressData {
  progress: number;
  status: string;
  log?: string;
}

const SentimentAnalysisForm = () => {
  const [entreprise, setEntreprise] = useState<string>('');
  const [response, setResponse] = useState<SentimentAnalysisResponse | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [streaming, setStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const requestInProgress = useRef(false);

  useEffect(() => {
    // Listen for progress updates from the server
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('Préchauffage du transistor de Superia', (data: ProgressData) => {
      console.log('Progress update received', data);
      setProgress(data.progress);
      setStatus(data.status);
      if (data.log) {
        console.log('Log received:', data.log);
        setLog((prevLog) => [...prevLog, data.log!]);
        setCurrentUrl(data.log);
      }
      if (data.progress === 100) {
        setLoading(false);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socket.off('Préchauffage du transistor de Superia');
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setProgress(0); // Reset progress

    try {
      const res = await fetch('http://127.0.0.1:8000/sentiment_analysis', {
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
      setStreaming(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6"
          type="text"
          value={entreprise}
          onChange={(e) => setEntreprise(e.target.value)}
          placeholder="Entrez le nom de l'entreprise"
          required
        />
        <button className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit" disabled={loading}>
          {loading ? 'Chargement...' : 'Analyse'}
        </button>
      </form>

      {loading && !streaming && (
        <div className="flex flex-col items-center m-4">
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

      {response && (
  <div className="mt-4">
    <h2>Résultat d'analyse</h2>
    <div>
      <ReactMarkdown>{response.response}</ReactMarkdown>
    </div>
  </div>
)}
    </div>
  );
};

export default SentimentAnalysisForm;
