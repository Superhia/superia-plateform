'use client'
import React, { useState, useRef, useEffect, FC, FormEvent } from 'react';
import io from 'socket.io-client';
import { ClipLoader } from 'react-spinners';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import ReactMarkdown from 'react-markdown';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
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

const socket = io('wss://superia.northeurope.cloudapp.azure.com', {
    path: '/socket.io',
    transports: ['websocket', 'polling']
});

const FileUploadComponent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState<boolean>(false);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [requestLimit, setRequestLimit] = useState<number>(1000);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const inappropriateKeywords = ["carte bancaire", "numéro de sécurité sociale", "DROP TABLE", "script", "mot de passe"];

  // Define Joi schema for file validation
  const fileSchema = Joi.object({
    file: Joi.object({
      name: Joi.string().max(100).required(),
      size: Joi.number().max(5 * 1024 * 1024).required(), // Max 5MB
      type: Joi.string().valid('application/pdf').required(),
    }).required(),
  });

  // Validate file using Joi
  const validateFile = (file: File): [boolean, Joi.ValidationError | null] => {
    const { error } = fileSchema.validate({ file });
    return [!error, error || null];
  };

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

    socket.on('upload_complete', (data: string) => {
      setUploadStatus(data);
      setLoading(false);
      MySwal.fire({
        icon: 'success',
        title: 'Téléchargement réussi',
        text: data,});
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socket.off('Préchauffage du transistor de Superia');
      socket.off('upload_complete');
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setPdfUrl(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
      setPdfUrl(URL.createObjectURL(event.dataTransfer.files[0]));
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      MySwal.fire({
        icon: 'warning',
        title: 'Aucun fichier sélectionné',
        text: 'Veuillez sélectionner un fichier à télécharger.',
      });
      return;
    }

    if (requestCount >= requestLimit) {
      MySwal.fire({
        icon: 'warning',
        title: 'Limite atteinte',
        html: (
          <div>
            Vous avez atteint le nombre de requêtes maximum. Veuillez vous{' '}
            <a href="/api/auth/login" style={{ color: 'blue' }}>
              connecter
            </a>
            .
          </div>
        ),
        confirmButtonText: 'OK',
      });
      return;
    }
    setLoading(true);
    setStreaming(false);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://superia.northeurope.cloudapp.azure.com/chatdoc', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setAssistantId(result.assistant_id);
        setUploadStatus('Fichier chargé avec succès.');
        setShowPdf(true);
        setRequestCount((prevCount) => prevCount + 1); // Increment request count
        MySwal.fire({
          icon: 'success',
          title: 'Téléchargement réussi',
          text: 'Votre fichier a été téléchargé avec succès.',
        });
      } else {
        setUploadStatus(result.error || 'Erreur de chargement du fichier.');
        MySwal.fire({
          icon: 'error',
          title: 'Erreur de téléchargement',
          text: result.error || 'Une erreur est survenue lors du téléchargement du fichier.',
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Erreur de chargement du fichier.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !streaming) {
    return (
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
    );
  }

  return (
    <div className='bg-white'>
      <form onSubmit={handleSubmit}>
        <div
          className={`border-2 border-dashed rounded-md p-6 text-center ${dragActive ? 'border-blue-500' : 'border-gray-300'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {file ? (
            <p>{file.name}</p>
          ) : (
            <p>Drag & drop votre fichier ici ou cliquez pour chargé votre fichier</p>
          )}
          <input
            type="file"
            ref={inputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={requestCount >= requestLimit}
          />
        </div>
        <button
          className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"
          type="submit" disabled={loading || requestCount >= requestLimit}
        >
          {loading ? 'En cours...' : 'Envoyer'}
        </button>
      </form>
      {uploadStatus && <p>{uploadStatus}</p>}
      {requestCount >= requestLimit && (
        <div>
          <p className="text-red-500 font-bold text-xl">Vous avez atteints le nombre maximum de requêtes.</p>
        </div>
      )}
      {showPdf && assistantId && pdfUrl && (
        <div className="grid grid-cols-2 gap-4 h-screen">
          <div
            style={{
              border: '1px solid rgba(0, 0, 0, 0.3)',
              height: '100%',
              overflow: 'auto',
            }}
          >
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
              <div style={{ height: '750px' }}>
                <Viewer fileUrl={pdfUrl} />
              </div>
            </Worker>
          </div>
          <div className="flex flex-col justify-between p-5">
            <AskQuestionComponent assistantId={assistantId} requestCount={requestCount} requestLimit={requestLimit} setRequestCount={setRequestCount} />
          </div>
        </div>
      )}
    </div>
  );
};

interface AskQuestionComponentProps {
  assistantId: string;
  requestCount: number;
  requestLimit: number;
  setRequestCount: React.Dispatch<React.SetStateAction<number>>;
}

const AskQuestionComponent: FC<AskQuestionComponentProps> = ({ assistantId, requestCount, requestLimit, setRequestCount }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<QAResponse[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');

  const inappropriateKeywords = ["carte bancaire", "numéro de sécurité sociale", "DROP TABLE", "script", "mot de passe"];

  // Define Joi schema for question validation
  const schema = Joi.object({
    question: Joi.string().max(200).pattern(/^[a-zA-ZÀ-ÖØ-öø-ÿ0-9 .,!?'’]+$/).required(),
  });

  // Validate input using Joi
  const validateInput = (data: { question: string }) => {
    const { error, value } = schema.validate(data);
    return error ? [false, error] : [true, value];
  };

  // Check for inappropriate keywords
  const containsInappropriateKeywords = (text: string): boolean => {
    return inappropriateKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  // Sanitize HTML output
  const sanitizeHtml = (inputHtml: string): string => {
    return DOMPurify.sanitize(inputHtml, {
      ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'strong', 'em'],
      ALLOWED_ATTR: ['href', 'title', 'rel'],
    });
  };

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

    socket.on('response_complete', (data: string) => {
      setResponses((prev) => [...prev, { question: 'Response complete', response: data }]);
      setLoading(false);
      MySwal.fire({
        icon: 'success',
        title: 'Réponse reçue',
        text: 'Votre question a été traitée avec succès.',
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socket.off('Préchauffage du transistor de Superia');
      socket.off('response_complete');
    };
  }, []);

  const cleanText = (text:string) => {
    const pattern = /【\d+:\d+†source】/g; // Use 'g' for global replacement
    return text.replace(pattern, '');
  };

  const handleQuestionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const [isValid, validationError] = validateInput({ question });
    if (!isValid) {
      MySwal.fire({
        icon: 'error',
        title: 'Entrée invalide',
        text: validationError?.details[0].message || 'Erreur de validation',
      });
      return;
    }

    // Check for inappropriate keywords
    if (containsInappropriateKeywords(question)) {
      MySwal.fire({
        icon: 'warning',
        title: 'Contenu inapproprié',
        text: 'Votre question contient des termes inappropriés.',
      });
      return;
    }

    // Request limiting
    if (requestCount >= requestLimit) {
      MySwal.fire({
        icon: 'warning',
        title: 'Limite atteinte',
        html: (
          <div>
            Vous avez atteint le nombre de requêtes maximum. Veuillez vous{' '}
            <a href="/api/auth/login" style={{ color: 'blue' }}>
              connecter
            </a>
            .
          </div>
        ),
        confirmButtonText: 'OK',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setStreaming(false);

    try {
      const askRes = await fetch('https://superia.northeurope.cloudapp.azure.com/ask', {
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
        throw new Error(`Une erreur est survenue: ${askRes.statusText}`);
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
  const sanitizedMarkdown = (text: string): string => {
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'strong', 'em'],
      ALLOWED_ATTR: ['href', 'title', 'rel'],
    });
  };

  return (
    <div className="bg-white flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        {responses.map((qa, index) => (
          <div key={index} className="mb-4">
            <p className="font-bold">Question: {qa.question}</p>
            <ReactMarkdown className="markdown-content">{sanitizeHtml(qa.response)}</ReactMarkdown>
          </div>
        ))}
      </div>
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
      {requestCount < requestLimit && (
        <form onSubmit={handleQuestionSubmit} className="flex-none flex">
          <input
            className="flex-grow rounded-md border-0 py-2.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-2xl 2xl:leading-6"
            type="text"
            name="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Entrez votre question"
          />
          <button disabled={loading} className="p-3 m-1 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit">
            Posez votre question
          </button>
        </form>
      )}
      {requestCount >= requestLimit && (
        <div>
          <p className="text-red-500 font-bold text-xl">Vous avez atteints le nombre maximum de requètes.</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FileUploadComponent;