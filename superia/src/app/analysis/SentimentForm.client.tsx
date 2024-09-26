import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { io } from 'socket.io-client';
import ReactMarkdown from 'react-markdown';
import ClipLoader from 'react-spinners/ClipLoader';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import DOMPurify from 'dompurify';
import Joi from 'joi';

const MySwal = withReactContent(Swal);

const socket = io('wss://superia.northeurope.cloudapp.azure.com', {
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

const SentimentAnalysisForm: React.FC = () => {
  const [entreprise, setEntreprise] = useState<string>('');
  const [response, setResponse] = useState<SentimentAnalysisResponse | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [streaming, setStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [requestLimit, setRequestLimit] = useState<number>(2);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const requestInProgress = useRef(false);

  // Define inappropriate keywords
  const inappropriateKeywords = ["carte bancaire", "numéro de sécurité sociale", "DROP TABLE", "script", "mot de passe"];

  // Define Joi schema for input validation
  const schema = Joi.object({
    entreprise: Joi.string().max(100).pattern(/^[a-zA-ZÀ-ÖØ-öø-ÿ0-9 .,!?'’]+$/).required()
  });

  // Validate input using Joi
  const validateInput = (data: { entreprise: string }) => {
    const { error, value } = schema.validate(data);
    return error ? [false, error] : [true, value];
  };

  // Check for inappropriate keywords
  const containsInappropriateKeywords = (text: string) => {
    return inappropriateKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  // Sanitize HTML output
  const sanitizeHtml = (inputHtml: string) => {
    return DOMPurify.sanitize(inputHtml, { ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'strong', 'em'], ALLOWED_ATTR: ['href', 'title', 'rel'] });
  };

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

    // Input validation
    const [isValid, validationError] = validateInput({ entreprise });
    if (!isValid) {
      MySwal.fire({
        icon: 'error',
        title: 'Entrée invalide',
        text: validationError?.details[0].message || 'Erreur de validation',
      });
      return;
    }

    // Check for inappropriate keywords
    if (containsInappropriateKeywords(entreprise)) {
      MySwal.fire({
        icon: 'warning',
        title: 'Contenu inapproprié',
        text: 'Votre saisie contient des termes inappropriés.',
      });
      return;
    }

    // Request limiting
    if (!isLoggedIn && requestCount >= requestLimit) {
      MySwal.fire({
        icon: 'warning',
        title: 'Limite atteinte',
        html: (
          <div>
            Vous avez atteint le nombre de requêtes maximum. Veuillez vous <a href="/api/auth/login" style={{ color: 'blue' }}>connecter</a>.
          </div>
        ),
        confirmButtonText: 'OK'
      });
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0); // Reset progress

    try {
      const res = await fetch('https://superia.northeurope.cloudapp.azure.com/sentiment_analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entreprise }),
      });

      if (!res.ok) {
        throw new Error(`Erreur: ${res.status} ${res.statusText}`);
      }

      const data: SentimentAnalysisResponse = await res.json();
      setResponse(data);

      if (!isLoggedIn) {
        setRequestCount(prevCount => prevCount + 1);
      }
    } catch (err) {
      setError((err as Error).message);
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        text: (err as Error).message,
      });
    } finally {
      setLoading(false);
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
        <button
          className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Chargement...' : 'Analyse'}
        </button>
      </form>

      {loading && (
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
            <ReactMarkdown className="markdown-content">{sanitizeHtml(response.response)}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysisForm;
