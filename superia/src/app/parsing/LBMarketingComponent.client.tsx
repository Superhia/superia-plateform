'use client';

import React, {useState,useRef,FC,useImperativeHandle,forwardRef,ForwardRefRenderFunction,useEffect,} from 'react';
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

export interface FileUploadComponentRef {
    handleSubmit: (question: string) => void;
}

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
    transports: ['websocket', 'polling'],
});

const Ebook: ForwardRefRenderFunction<FileUploadComponentRef> = (props, ref) => {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [assistantId, setAssistantId] = useState('');
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [showPdf, setShowPdf] = useState<boolean>(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [currentUrl, setCurrentUrl] = useState('');
    const [streaming, setStreaming] = useState(false);

    const fetchPDFAndSetFile = async () => {
        try {
            const response = await fetch('/livre_blanc_inbound_marketing_recruteurs_campagne_1.compressed.pdf');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setFileUrl(url);
            return url;
        } catch (error) {
            console.error('Error fetching the file:', error);
            alert('Erreur denvoie du fichier.');
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setStreaming(false);
        const fileUrl = await fetchPDFAndSetFile();
        if (!fileUrl) {
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', new File([fileUrl], 'livre_blanc_inbound_marketing_recruteurs_campagne_1.compressed.pdf', { type: 'application/pdf' }));

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
            } else {
                setUploadStatus(result.error || 'Erreur de chargement du fichier.');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus('Erreur de chargement du fichier.');
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        handleSubmit,
    }));

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
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
        });

        return () => {
            socket.off('Préchauffage du transistor de Superia');
            socket.off('upload_complete');
        };
    }, []);

    const AskQuestionComponent: FC<{ assistantId: string }> = ({ assistantId }) => {
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
      
            console.log('Final response content:', responseContent); // Increment request count
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
            <div className="container bg-white min-h-screen p-4">
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
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        );
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
        <div className="bg-white min-h-screen p-4">
            <button
                className="p-5 pl-20 pr-20 m-5 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"
                onClick={handleSubmit}
            >
                <img src="LBMarketing.png" alt="Ebook Experience Candidat" className="h-32 w-24 mx-auto" />
                Livre Blanc Marketing
            </button>
            {uploadStatus && <p>{uploadStatus}</p>}
            {showPdf && assistantId && fileUrl && (
                <div className="grid grid-cols-2 gap-4 h-screen">
                    <div className="height-full overflow-auto border-black">
                        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                            <div style={{ height: '750px' }}>
                                <Viewer fileUrl={fileUrl} />
                            </div>
                        </Worker>
                    </div>
                    <div className="flex flex-col justify-between p-5">
                        <AskQuestionComponent assistantId={assistantId} />
                    </div>
                </div>
            )}
        </div>
    );
};

Ebook.displayName = 'Ebook';
export default forwardRef(Ebook);
