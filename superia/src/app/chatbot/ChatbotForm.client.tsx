'use client';
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import Joi from 'joi';
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

const ChatbotForm: React.FC = () => {
  const [domain, setDomain] = useState<string>('');
  const [assistantName, setAssistantName] = useState<string>('Custom Assistant');
  const [instructions, setInstructions] = useState<string>('You are a helpful assistant that answers questions based on the document. If the questions aren\'t linked with the document, you return "Mon rôle est de vous aider sur les solutions RH, je ne suis pas en mesure de répondre à votre question." If it contains inappropriate characters, you return "Je ne peux pas répondre à cette question car elle contient des caractères inappropriés."');
  const [question, setQuestion] = useState<string>('');
  const [assistantId, setAssistantId] = useState<string>('');
  const [responses, setResponses] = useState<QAResponse[]>([]);
  const [initialResponse, setInitialResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [requestLimit, setRequestLimit] = useState<number>(1000);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [log, setLog] = useState<string[]>([]);

  const requestInProgress = useRef(false);

  const inappropriateKeywords = ["carte bancaire", "numéro de sécurité sociale", "DROP TABLE", "script", "mot de passe"];

  const schema = Joi.object({
    question: Joi.string().max(200).pattern(/^[a-zA-Z0-9 .,!?]+$/).required()
  });

  const validateInput = (data: { question: string }) => {
    const { error, value } = schema.validate(data);
    if (error) {
      return [false, error];
    } else {
      return [true, value];
    }
  };

  const containsInappropriateKeywords = (text: string) => {
    return inappropriateKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  const sanitizeHtml = (inputHtml: string) => {
    return DOMPurify.sanitize(inputHtml, { ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'strong', 'em'], ALLOWED_ATTR: ['href', 'title', 'rel'] });
  };

  const checkResponseRelevance = (response: string) => {
    // Check if response contains relevant content
    return response.toLowerCase().includes("site carrière") || response.toLowerCase().includes("recrutement");
  };

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await fetch('/api/auth/validate-session');
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
        if (data.isLoggedIn) {
          setRequestLimit(1000);
        }
        console.log('Logged In Status:', data.isLoggedIn);
      } catch (error) {
        console.error('Error validating session:', error);
        setIsLoggedIn(false);
      }
    };

    validateSession();
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

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

  const preconfiguredAssistants = [
    {
      name: 'Analyse Marque Employeur',
      instructions: " 'Analyse générale de la marque employeur' avec les sous-rubriques Proposition de valeur et Culture d'entreprise. Assure-toi de bien Retirer les 【3:0†source].You are a helpful assistant that answers questions based on the document. If the questions aren\'t linked with the document, you return :Mon rôle est de vous aider sur les solutions RH, je ne suis pas en mesure de répondre à votre question. If it contains inappropriate characters, you return : Je ne peux pas répondre à cette question car elle contient des caractères inappropriés. "
    },
    {
      name: 'Candidate persona',
      instructions: " 'Proposer un candidate persona' principal basé sur une analyse rapide des besoins et objectifs des utilisateurs potentiels. Assure-toi de bien Retirer les 【3:0†source]. You are a helpful assistant that answers questions based on the document. If the questions aren\'t linked with the document, you return : Mon rôle est de vous aider sur les solutions RH, je ne suis pas en mesure de répondre à votre question. If it contains inappropriate characters, you return : Je ne peux pas répondre à cette question car elle contient des caractères inappropriés."
    },
    {
      name: 'Employee Value Propositions',
      instructions: " 'Définir 3 Employee Value Propositions (EVP)' qui mettent en avant les avantages uniques de travailler pour l'entreprise. Assure-toi de bien Retirer les 【3:0†source]. You are a helpful assistant that answers questions based on the document. If the questions aren\'t linked with the document, you return : Mon rôle est de vous aider sur les solutions RH, je ne suis pas en mesure de répondre à votre question. If it contains inappropriate characters, you return : Je ne peux pas répondre à cette question car elle contient des caractères inappropriés."
    }
  ];
  const cleanText = (text:string) => {
  const patterns = [
    /assistant_id:\s*\w+/gi,
    /【\d+:\d+†source】/g]; // Use 'g' for global replacement
    patterns.forEach(pattern => {
      text = text.replace(pattern, '');
    });
    return text;
};

  const handlePreconfiguredSubmit = (configIndex: number) => {
    const config = preconfiguredAssistants[configIndex];
    setAssistantName(config.name);
    setInstructions(config.instructions);
    handleScrapeSubmit();
  };

  const handleScrapeSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    if (requestInProgress.current || requestCount >= requestLimit) return;

    setLoading(true);
    setError(null);
    setProgress(0);
    setStatus('');
    setLog([]);
    requestInProgress.current = true;
    setStreaming(false);

    try {
      const response = await fetch('https://superia.northeurope.cloudapp.azure.com/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain, assistant_name: assistantName, instructions }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Une erreur survient: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Reader nest pas disponible');
      }

      const decoder = new TextDecoder('utf-8');
      let done = false;
      let responseContent = '';

      const newResponses = [...responses, { question: 'Etude en cours', response: '' }];
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

      const match = responseContent.match(/assistant_id: (\w+)/);
      if (match) {
        setAssistantId(match[1]); // Extract assistant_id from the stream but do not display it
      } else {
        throw new Error('L assistantid nest pas dans la réponse');
      }

      setRequestCount((prevCount) => prevCount + 1);
    } catch (error) {
      console.error('Error:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  };

  const handleAsk = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestInProgress.current || requestCount >= requestLimit) return;

    if (containsInappropriateKeywords(question)) {
      setResponses((prevResponses) => [
        ...prevResponses,
        { question, response: "Je ne peux pas répondre à cette question car elle contient des caractères inappropriés." }
      ]);
      setQuestion('');
      return;
    }

    setLoading(true);
    setError(null);
    setStreaming(false);

    try {
      const response = await fetch('https://superia.northeurope.cloudapp.azure.com/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          assistant_id: assistantId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Une erreur survient: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
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

      if (!checkResponseRelevance(responseContent)) {
        newResponses[lastIndex].response = 'Mon rôle est de vous aider pour les solutions RH, je ne suis pas en mesure de répondre à votre question.';
        setResponses([...newResponses]);
      } else {
        setRequestCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      console.error('Error querying assistant:', error);
      setError('L assistant ne répond pas.');
    } finally {
      setLoading(false);
      requestInProgress.current = false;
      setQuestion('');
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setRequestLimit(1000);
    setRequestCount(0);
  };

  return (
    <div className="container">
      <form onSubmit={handleScrapeSubmit}>
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

      {initialResponse && (
        <div style={{whiteSpace: 'break-spaces', wordBreak: 'break-word' }}>
          <h2 className='font-bold text-2xl my-5'>Résumé Initial:</h2>
          <ReactMarkdown>{initialResponse}</ReactMarkdown>
        </div>
      )}

      {responses.length > 0 && (
        <div style={{whiteSpace: 'break-spaces', wordBreak: 'break-word' }}>
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
            placeholder='Dis moi en plus sur : '
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

