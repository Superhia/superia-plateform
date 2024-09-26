import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { io } from 'socket.io-client';
import ClipLoader from 'react-spinners/ClipLoader';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import Joi from 'joi';

const MySwal = withReactContent(Swal);

interface QAResponse {
  question: string;
  response: string;
}

interface ProgressData {
  progress: number;
  status: string;
  log?: string;
}

const AgentO1mini: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [responses, setResponses] = useState<QAResponse[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [streaming, setStreaming] = useState<boolean>(false);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [requestLimit, setRequestLimit] = useState<number>(2);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const requestInProgress = useRef(false);

  // Questions prédéfinies
  const predefinedQuestions = [
    "Explique moi la marque employeur",
    "Quels sont les étapes de la marque employeur ?",
    "Quel impacte la marque employeur sur le recrutement ?"
  ];

  const inappropriateKeywords = ["carte bancaire", "numéro de sécurité sociale", "DROP TABLE", "script", "mot de passe"];

  const schema = Joi.object({
    question: Joi.string().max(200).pattern(/^[a-zA-ZÀ-ÖØ-öø-ÿ0-9 .,!?'’]+$/).required()
  });

  const validateInput = (data: { question: string }): [boolean, Joi.ValidationError | null] => {
    const { error, value } = schema.validate(data);
    return [!error, error || null];
  };

  const containsInappropriateKeywords = (text: string): boolean => {
    return inappropriateKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  const sanitizeHtml = (inputHtml: string): string => {
    return DOMPurify.sanitize(inputHtml, { 
      ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'strong', 'em'], 
      ALLOWED_ATTR: ['href', 'title', 'rel'] 
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const socket = io('wss://superia.northeurope.cloudapp.azure.com', {
        path: '/socket.io',
        transports: ['websocket', 'polling']
      });

      socket.on('Préchauffage du transistor de Superia', (data: ProgressData) => {
        setProgress(data.progress);
        setStatus(data.status);
        setCurrentUrl(data.log || '');
      });

      return () => {
        socket.off('Préchauffage du transistor de Superia');
      };
    }
  }, []);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  };

  const cleanText = (text: string): string => {
    const pattern = /【\d+:\d+†source】/g; 
    return text.replace(pattern, '');
  };

  // Fonction de soumission des questions
  const submitQuestion = async (submittedQuestion: string) => {
    const [isValid, validationError] = validateInput({ question: submittedQuestion });
    if (!isValid && validationError) {
      setResponses((prevResponses) => [
        ...prevResponses,
        { question: submittedQuestion, response: validationError.details[0].message }
      ]);
      return;
    }

    if (containsInappropriateKeywords(submittedQuestion)) {
      setResponses((prevResponses) => [
        ...prevResponses,
        { question: submittedQuestion, response: "Je ne peux pas répondre à cette question car elle contient des caractères inappropriés." }
      ]);
      return;
    }

    if (!isLoggedIn && requestCount >= requestLimit) {
      MySwal.fire({
        icon: 'warning',
        title: 'Login Requis',
        html: (
          <div>
            Vous avez atteint le nombre de requêtes maximum, veuillez vous connecter.
            Merci <a href="/api/auth/login" style={{ color: 'blue' }}>log in</a>
          </div>
        ),
        confirmButtonText: 'OK'
      });
      return;
    }

    const formData = new FormData();
    formData.append('question', submittedQuestion);

    setLoading(true);
    setStreaming(false);

    try {
      const response = await fetch('https://superia.northeurope.cloudapp.azure.com/agentbis', {
        method: 'POST',
        body: formData,
      });

      if (!response.body) {
        throw new Error('ReadableStream n\'est pas supporté dans ce navigateur');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let responseContent = '';

      const newResponses = [...responses, { question: submittedQuestion, response: '' }];
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

      if (!isLoggedIn) {
        setRequestCount(prevCount => prevCount + 1);
      }
    } catch (error) {
      console.error('Error querying assistant:', error);
      setResponses((prevResponses) => [
        ...prevResponses,
        { question: submittedQuestion, response: 'L\'assistant ne répond pas.' }
      ]);
    } finally {
      setLoading(false);
      setStreaming(false);
      setQuestion('');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitQuestion(question);
  };

  const handleTryQuestion = (predefinedQuestion: string) => {
    submitQuestion(predefinedQuestion);
  };

  return (
    <div className='mx-40'>
      <div className="request-info">
        <p>Nombre de requêtes: {requestCount} / {requestLimit}</p>
      </div>

      {/* Section des Questions Prédéfinies */}
      <div className="predefined-questions">
        <h3>Essayez une de ces questions :</h3>
        {predefinedQuestions.map((predefQuestion, index) => (
          <div key={index} className="flex justify-between items-center my-3">
            <button
              className="p-2 px-4 ml-3 bg-blue-500 text-white rounded hover:bg-blue-700"
              onClick={() => handleTryQuestion(predefQuestion)}
            >
              {predefQuestion}
            </button>
          </div>
        ))}
      </div>

      {/* Formulaire de Soumission de Question */}
      <form onSubmit={handleSubmit}>
        <div>
          <div>
            {responses.map((res, index) => (
              <div key={index}>
                <strong>Q: {res.question}</strong>
                <ReactMarkdown className="markdown-content">{sanitizeHtml(res.response)}</ReactMarkdown>
              </div>
            ))}
          </div>
          <input 
            placeholder='Entrez votre question'
            className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6"
            type="text"
            id="question"
            value={question}
            onChange={handleQuestionChange}
          />
        </div>
        <button 
          className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'En cours...' : 'Posez votre question'}
        </button>
      </form>
      
      {/* Indicateur de Chargement */}
      {loading && !streaming && (
        <div className="flex flex-col items-center py-7">
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
    </div>
  );
};

export default AgentO1mini;
