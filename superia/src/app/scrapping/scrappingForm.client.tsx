'use client'
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { ClipLoader } from 'react-spinners';

const socket = io('wss://superia.northeurope.cloudapp.azure.com', {
    transports: ['websocket','polling'] });

interface ProgressData {
    progress: number;
    status: string;
    log?: string;
}

const ScrappingForm: React.FC = () => {
    const [response, setResponse] = useState<string| null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [log, setLog] = useState<string[]>([]);
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });
        socket.on('update_progress', (data: ProgressData) => {
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
            setResponse(data);
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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setResponse(null);
        setProgress(0);
        setStatus('');
        setLog([]);
        const form = event.currentTarget;
        const formData = new FormData(form);
        const domain = formData.get('question');

        try {
            const res = await fetch("http://127.0.0.1:8000/process_msg", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ domain })
            });

            if (!res.body) {
                throw new Error('ReadableStream not yet supported in this browser.');
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
            setLoading(false);
            setStatus('Failed to submit');
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
        <form onSubmit={handleSubmit} className="p-4">
            <label htmlFor="question" className="block mb-2 text-lg font-medium text-gray-900">
                Veuillez saisir l’url exacte du site carrières que vous souhaitez analyser.
            </label>
            <input
                className="block w-full p-2 mb-4 text-lg text-gray-900 border border-gray-300 rounded-lg"
                placeholder="Entrez votre url ici"
                id="question"
                name="question"
                type="text"
                required
            />
            <div className="flex justify-center">
            <button
                type="submit"
                className="p-3 mx-auto rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"
                disabled={loading}
            >
                Lancer l’analyse !
            </button>
            </div>
            {loading && (
                <div className="flex flex-col items-center">
                    <ClipLoader color="#0000ff" loading={loading} size={50} />
                </div>
            )}
            {loading && !response && (
                <>
                    <div className="mb-4">
                        <div>Status: {status}</div>
                        <div>Currently Crawling: {currentUrl}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div
                                className="bg-blue-900 h-2.5 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div>{progress}%</div>
                    </div>
                    <div className="mb-4">
                        {log.map((entry, index) => (
                            <div key={index}>{entry}</div>
                        ))}
                    </div>
                </>
            )}
            {renderResponse(response)}
        </form>
    );
};

export default ScrappingForm;


