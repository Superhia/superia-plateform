'use client'
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import Joi from 'joi';
import ReactMarkdown from 'react-markdown';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

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

const preconfiguredAssistants = [
  {
    name: 'Analyse Marque Employeur',
    instructions: "Résume en une centaine de mots le contenu de la page, puis fait une Analyse générale de la marque employeur avec les rubriques Proposition de valeur et Culture d'entreprise."
  },
  {
    name: 'Candidate persona',
    instructions: "Résume en une centaine de mots le contenu de la page, puis Propose un candidate persona principal basé sur une analyse rapide des besoins et objectifs des utilisateurs potentiels."
  },
  {
    name: 'Employee Value Propositions',
    instructions: "Résume en une centaine de mots le contenu de la page, puis Définis 3 Employee Value Propositions (EVP) qui mettent en avant les avantages uniques de travailler pour l'entreprise."
  }
];

const ChatbotForm: React.FC = () => {
  const [domain, setDomain] = useState<string>('');
  const [assistantName, setAssistantName] = useState<string>('Custom Assistant');
  const [instructions, setInstructions] = useState<string>('');
  const [responses, setResponses] = useState<QAResponse[]>([]);
  const [initialResponse, setInitialResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [requestLimit, setRequestLimit] = useState<number>(1000);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [log, setLog] = useState<string[]>([]);

  const requestInProgress = useRef(false);

  const inappropriateKeywords = ["carte bancaire", "numéro de sécurité sociale", "DROP TABLE", "script", "mot de passe"];

  const schema = Joi.object({
    domain: Joi.string().uri({ scheme: ['http', 'https'] }).required()
  });

  const validateInput = (data: { domain: string }) => {
    const { error, value } = schema.validate(data);
    if (error) {
      return [false, error];
    } else {
      return [true, value];
    }
  };

  const MySwal = withReactContent(Swal);

  const validateDomain = (domain: string) => {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlPattern.test(domain);
  };

  useEffect(() => {
    socket.on('Préchauffage du transistor de Superia', (data: ProgressData) => {
      console.log('Progress update received', data);
      setProgress(data.progress);
      setStatus(data.status);
      if (data.log) {
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

  const handlePreconfiguredSubmit = async (configIndex: number) => {
    const config = preconfiguredAssistants[configIndex];
    setAssistantName(config.name);
    setInstructions(config.instructions);

    // Automatically submit after selecting an assistant
    await handleScrapeSubmit(config.instructions);
  };

  const handleScrapeSubmit = async (selectedInstructions: string) => {
    if (!validateDomain(domain)) {
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        html: `<span style="color: red;">Veuillez entrer une URL valide au format https://lasuperagence.com</span>`,
        confirmButtonText: 'OK',
      });
      return;
    }
    if (requestInProgress.current || requestCount >= requestLimit) return;

    setLoading(true);
    setError(null);
    setProgress(0);
    setStatus('');
    setLog([]);
    requestInProgress.current = true;

    console.log("Submitting with entreprise:", domain, "and instructions:", selectedInstructions);

    try {
      const response = await fetch('https://superia.northeurope.cloudapp.azure.com/scanrh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entreprise: domain, instructions: selectedInstructions }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Une erreur survient: ${response.statusText}`);
      }

      const data = await response.json();
      setInitialResponse(data.response);
      setRequestCount(prevCount => prevCount + 1);

    } catch (error) {
      console.error('Error:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setRequestLimit(1000);
    setRequestCount(0);
  };

  return (
    <div className="container">
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="domain">Site Carrières URL:</label>
        <input
          className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6"
          type="url"
          id="domain"
          placeholder='https://lasuperagence.com'
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          required
          disabled={requestCount >= requestLimit}
        />
      </form>

      <div className="preconfigured-buttons">
        {preconfiguredAssistants.map((config, index) => (
          <button
            key={index}
            className="p-5 pl-20 pr-20 m-5 mx-4 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"
            onClick={() => handlePreconfiguredSubmit(index)}
            disabled={loading || requestCount >= requestLimit}
          >
            {config.name}
          </button>
        ))}
      </div>

      {loading && !initialResponse && (
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

      {initialResponse && (
        <div>
          <h2 className='font-bold text-2xl my-5'>Résumé Initial:</h2>
          <ReactMarkdown className="markdown-content">{initialResponse}</ReactMarkdown>
        </div>
      )}

      {requestCount >= requestLimit && (
        <div>
          <p className="text-red-500 font-bold text-xl">Vous avez atteint le nombre maximal de requêtes.</p>
          {!isLoggedIn && (
            <Link href="/login">
              <button className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-violet-900 ring-1 ring-inset ring-violet-300 text-xl 2xl:leading-8">
                Découvrir toute la solution
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotForm;
