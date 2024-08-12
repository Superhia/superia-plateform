'use client';

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { ClipLoader } from 'react-spinners';
import ReactMarkdown from 'react-markdown';

const socket = io('wss://superia.northeurope.cloudapp.azure.com', {
    transports: ['websocket', 'polling']
});

interface ProgressData {
    progress: number;
    status: string;
    log?: string;
}

const OrangeForm: React.FC = () => {
    const [response, setResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [log, setLog] = useState<string[]>([]);
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });

        socket.on('Préchauffage du transistor de Superia', (data: ProgressData) => {
            console.log('Received progress update:', data);
            setProgress(data.progress);
            setStatus(data.status);
            if (data.log !== undefined) {
                setLog((prevLog) => [...prevLog, data.log!]);
                setCurrentUrl(data.log); // Update the current URL being crawled
            }
            if (data.progress === 100) {
                setLoading(false);
            }
        });

        socket.on('crawling_complete', (data: string) => {
            setResponse(data);
            setLoading(false);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
        });

        return () => {
            socket.off('Préchauffage du transistor de Superia');
            socket.off('crawling_complete');
        };
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setResponse(null);
        setProgress(0);
        setStatus('');
        setLog([]);
        const form = event.currentTarget;

        try {
            const res = await fetch("https://superia.northeurope.cloudapp.azure.com/process_msg", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ domain: "https://audencia.teamtailor.com/" })
            });

            if (!res.body) {
                throw new Error('ReadableStream nest pas supporté dans ce navigateur.');
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                const chunk = decoder.decode(value, { stream: true });
                setResponse((prev) => (prev ? prev + chunk : chunk));
                setLoading(false);
            }

        } catch (error) {
            console.error('Failed to submit:', error);
            setStatus('Erreur denvoie');
        } finally {
            setLoading(false);
        }
    };

    const renderResponse = (data: string | null) => {
        if (!data) return null;

        try {
            const parsedData = JSON.parse(data);
            return (
                <div>
                    {parsedData.Rubriques.map((rubrique: any, index: number) => (
                        <div key={index}>
                            <h3 className="text-2xl ">{rubrique["Titre de la rubrique"]}</h3>
                            <h4 className="text-xl font-bold">{rubrique["Sous-titre de la rubrique"]}</h4>
                            <p>{rubrique["Contenu de la rubrique"]}</p>
                        </div>
                    ))}
                </div>
            );
        } catch (e) {
            return <div className='text-blue-900' dangerouslySetInnerHTML={{ __html: data.replace(/\n/g, '<br />') }} />;
        }
    };

    return (
        <div className='rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 m-5'>
            <form onSubmit={handleSubmit}>
            <div className="flex justify-center">
                <button className="p-5 px-28 m-5" disabled={loading}>
                    <img src="Audencia.png" alt="logo orange" className="h-8 w-24 mx-auto" />https://audencia.teamtailor.com/
                </button>
                </div>
            </form>
            {loading && (
                <div className="flex flex-col items-center">
                    <ClipLoader color="#0000ff" loading={loading} size={50} />
                </div>
            )}
            {loading && !response && (
                <>
                    <div className="mb-4">
                        <div>Status: {status}</div>
                        <div>En cours de process: {currentUrl}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div
                                className="bg-blue-900 h-2.5 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div>{progress}%</div>
                    </div>
                </>
            )}
            <ReactMarkdown>{response}</ReactMarkdown>
        </div>
    );
};

export default OrangeForm;

