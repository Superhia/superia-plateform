import React, { useState, useEffect, FormEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import ClipLoader from 'react-spinners/ClipLoader';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ReactMarkdown from 'react-markdown';

const socket = io('wss://superia.northeurope.cloudapp.azure.com', {
    path: '/socket.io',
    transports: ['websocket', 'polling']
});

const MySwal = withReactContent(Swal);

const AgentComponent: React.FC = () => {
    const [question, setQuestion] = useState<string>('');
    const [responses, setResponses] = useState<{ question: string, response: string }[]>([]);
    const [progress, setProgress] = useState<number>(0);
    const [fetchedFiles, setFetchedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<string>('');
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const [streaming, setStreaming] = useState<boolean>(false);
    const [requestCount, setRequestCount] = useState<number>(0); // State to track number of requests
    const isLoggedIn = false; // Mock login status, replace with actual login logic

    useEffect(() => {
        fetchPDFFilesAndSetFiles();

        // Handle socket.io events
        socket.on('Préchauffage du transistor de Superia', (data: { progress: number; status: string; log: string }) => {
            setProgress(data.progress);
            setStatus(data.status);
            setCurrentUrl(data.log); // Adjust this if log contains the current URL or status you want to show
        });

        return () => {
            socket.off('Préchauffage du transistor de Superia');
        };
    }, []);

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion(e.target.value);
    };

    const fetchPDFFilesAndSetFiles = async () => {
        try {
            const fileUrls = [
                '/ebookExperienceCandidat_nosummary.pdf',
                '/Livre_blanc_Ambassadeur_Marque_Employeur.pdf',
                '/livre_sitecarriere_10_GV.pdf',
                '/livre_sitecarriere_16.pdf',
                '/Livre-blanc-neojobs.pdf',
            ];

            const fileFetchPromises = fileUrls.map(async (url) => {
                const response = await fetch(url);
                const blob = await response.blob();
                return new File([blob], url.split('/').pop()!, { type: blob.type });
            });

            const files = await Promise.all(fileFetchPromises);
            setFetchedFiles(files);
        } catch (error) {
            console.error('Error fetching the files:', error);
            alert('Failed to fetch the files.');
        }
    };

    const cleanText = (text:string) => {
        const pattern = /【\d+:\d+†source】/g; // Use 'g' for global replacement
        return text.replace(pattern, '');
      };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!isLoggedIn && requestCount >= 2) {
            MySwal.fire({
                icon: 'warning',
                title: 'Login Required',
                html: (
                    <div>
                        You have reached the maximum number of requests allowed without logging in.
                        Please <a href="/login" style={{ color: 'blue' }}>log in</a> to continue.
                    </div>
                ),
                confirmButtonText: 'OK'
            });
            return;
        }

        if (fetchedFiles.length === 0) {
            setResponses([{ question, response: 'No files fetched' }]);
            return;
        }

        const formData = new FormData();
        fetchedFiles.forEach((file) => formData.append('file', file));
        formData.append('question', question);

        setLoading(true);

        try {
            const response = await fetch('https://superia.northeurope.cloudapp.azure.com/agent', {
                method: 'POST',
                body: formData,
            });

            if (!response.body) {
                throw new Error('ReadableStream not supported in this browser.');
            }

            const reader = response.body.getReader();
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
            if (!isLoggedIn) {
                setRequestCount(requestCount + 1); // Increment the request count for non-logged-in users
            }
        } catch (error) {
            console.error('Error querying assistant:', error);
            setResponses([{ question, response: 'Failed to get a response from the assistant.' }]);
        } finally {
            setLoading(false);
            setStreaming(false);
            setQuestion('');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <input 
                    placeholder='Enter your question'
                    className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6"
                    type="text" id="question" value={question} onChange={handleQuestionChange} />
                </div>
                <button 
                className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"
                type="submit">Submit</button>
            </form>
            {loading && !streaming &&(
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
            <div style={{whiteSpace: 'break-spaces', wordBreak: 'break-word' }}>
                {responses.map((res, index) => (
                    <div key={index}>
                        <strong>Q: {res.question}</strong>
                        <ReactMarkdown>{res.response}</ReactMarkdown>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgentComponent;
