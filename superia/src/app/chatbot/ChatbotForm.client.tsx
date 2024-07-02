'use client'
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import io from 'socket.io-client';
import { ClipLoader } from 'react-spinners';
import Cookies from 'js-cookie';

const socket = io('http://127.0.0.1:8000', {
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
    // Call the API to validate session
    const validateSession = async () => {
      try {
        const response = await fetch('/api/auth/validate-session');
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn); // Set based on the response from the server
        if (data.isLoggedIn) {
          setRequestLimit(1000); // Set the request limit for logged in users
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
      console.log('Progress update received', data); // Debug log
      setProgress(data.progress);
      setStatus(data.status);
      if (data.log) {
        setLog((prevLog) => [...prevLog, data.log!]);
        setCurrentUrl(data.log); // Update the current URL being crawled
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

  const handleScrapeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestInProgress.current || requestCount >= requestLimit) return;

    setLoading(true);
    setError(null);
    setProgress(0);
    setStatus('');
    setLog([]);
    requestInProgress.current = true;

    try {
      const response = await fetch('http://127.0.0.1:8000/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `An error occurred: ${response.statusText}`);
      }

      const data = await response.json();
      setAssistantId(data.assistant_id);  // Assuming the API returns an 'assistant_id'
      setRequestCount((prevCount) => prevCount + 1); // Increment request count
    } catch (error) {
      console.error('Error fetching scrape data:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
      requestInProgress.current = false;
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
      const response = await fetch('http://127.0.0.1:8000/ask', {
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

          // Update the response state incrementally
          newResponses[lastIndex].response = responseContent;
          setResponses([...newResponses]);
        }
      }

      console.log('Final response content:', responseContent);
      setRequestCount((prevCount) => prevCount + 1); // Increment request count
    } catch (error) {
      console.error('Error querying assistant:', error);
      setError('Failed to get a response from the assistant.');
    } finally {
      setLoading(false);
      requestInProgress.current = false;
      setQuestion(''); // Clear the question input after submission
    }
  };

  const handleLogin = () => {
    // Set loggedIn to true and upgrade the request limit
    setIsLoggedIn(true);
    setRequestLimit(1000); // Upgrade the request limit on login
    setRequestCount(0); // Reset request count on login
  };

  return (
    <div className="container">
      <form onSubmit={handleScrapeSubmit}>
        <label htmlFor="domain">Site Carrières URL:</label>
        <input
          className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6"
          type="url"
          id="domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          required
          disabled={requestCount >= requestLimit}
        />
        <button className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit" disabled={loading || requestCount >= requestLimit}>
          {loading ? 'Processing...' : 'Envoyer'}
        </button>
      </form>

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

      {assistantId && requestCount < requestLimit &&(
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
