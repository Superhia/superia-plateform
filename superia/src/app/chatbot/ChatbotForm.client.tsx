'use client'
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import io from 'socket.io-client';
import { ClipLoader } from 'react-spinners';
import Cookies from 'js-cookie';

const socket = io('wss://superia.northeurope.cloudapp.azure.com', {
    path: '/socket.io',
    transports: ['websocket', 'polling']
});

interface ProgressData {
    progress: number;
    status: string;
    log?: string;
}

const ChatbotForm = () => {
  const [domain, setDomain] = useState<string>('');
  const [assistantName, setAssistantName] = useState<string>('Custom Assistant');
  const [instructions, setInstructions] = useState<string>('You are a helpful assistant that answers questions based on the document.');
  const [question, setQuestion] = useState<string>('');
  const [assistantId, setAssistantId] = useState<string>('');
  const [responses, setResponses] = useState<{ question: string; response: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requestLimit, setRequestLimit] = useState<number>(2);
  const [streaming, setStreaming] = useState(false);

  const requestInProgress = useRef(false);

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

    socket.on('update_progress', (data: ProgressData) => {
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

    socket.on('crawling_complete', (data: string) => {
      setResponses((prev) => [...prev, { question: 'Scraping complete', response: data }]);
      setLoading(false);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socket.off('update_progress');
      socket.off('crawling_complete');
    };
  }, []);

  const preconfiguredAssistants = [
    {
      name: 'Analyse Marque Employeur',
      instructions: " 'Analyse générale de la marque employeur' avec les sous-rubriques Proposition de valeur et Culture d'entreprise.Assure-toi de bien Retirer les 【3:0†source]. "
    },
    {
      name: 'Candidate persona',
      instructions: " 'Proposer un candidate persona' principal basé sur une analyse rapide des besoins et objectifs des utilisateurs potentiels. Assure-toi de bien Retirer les 【3:0†source]. "
    },
    {
      name: 'Employee Value Propositions',
      instructions: " 'Définir 3 Employee Value Propositions (EVP)' qui mettent en avant les avantages uniques de travailler pour l'entreprise.Assure-toi de bien Retirer les 【3:0†source]. "
    }
  ];

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
    setStreaming(true);

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
        throw new Error(data.error || `An error occurred: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Reader not available');
      }

      const decoder = new TextDecoder('utf-8');
      let done = false;
      let responseContent = '';

      const newResponses = [...responses, { question: 'Scraping in progress', response: '' }];
      const lastIndex = newResponses.length - 1;
      setResponses(newResponses);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          responseContent += chunk;

          // Update the response state incrementally
          newResponses[lastIndex].response = responseContent;
          setResponses([...newResponses]);
        }
      }

      console.log('Final response content:', responseContent);
    const match = responseContent.match(/assistant_id: (\w+)/);
    if (match) {
      setAssistantId(match[1]); // Extract assistant_id from the stream
    } else {
      throw new Error('assistant_id not found in the response');
    }
    setRequestCount((prevCount) => prevCount + 1);
  } catch (error) {
    console.error('Error fetching scrape data:', error);
    setError((error as Error).message);
  } finally {
    setLoading(false);
    requestInProgress.current = false;
    setStreaming(false);
  }
};

  const handleAsk = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestInProgress.current || requestCount >= requestLimit) return;

    setLoading(true);
    setError(null);
    requestInProgress.current = true;
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
        throw new Error(`An error occurred: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Reader not available');
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

          newResponses[lastIndex].response = responseContent;
          setResponses([...newResponses]);
        }
      }

      console.log('Final response content:', responseContent);
      setRequestCount((prevCount) => prevCount + 1);
    } catch (error) {
      console.error('Error querying assistant:', error);
      setError('Failed to get a response from the assistant.');
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
        <div className="flex flex-col items-center py-7">
          <ClipLoader color="#0000ff" loading={loading} size={50} />
          <div className="mt-2">{status}</div>
          <div>Currently Crawling: {currentUrl}</div>
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
      {responses.length > 0 && (
        <div>
          <h2 className='font-bold text-2xl my-5'>Réponses:</h2>
          {responses.map((item, index) => (
            <div key={index}>
              <h3 className='font-bold'>Question: {item.question}</h3>
              <div dangerouslySetInnerHTML={{ __html: item.response.replace(/\n/g, '<br />') }} />
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
            {loading ? 'Processing...' : 'Pose ta question'}
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
