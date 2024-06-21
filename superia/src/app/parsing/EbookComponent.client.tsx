'use client';

import React, { useState, useRef, FC, useImperativeHandle, forwardRef, ForwardRefRenderFunction } from 'react';
import { ClipLoader } from 'react-spinners';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

export interface FileUploadComponentRef {
    handleSubmit: (question: string) => void;
}

const Ebook: ForwardRefRenderFunction<FileUploadComponentRef> = (props, ref) => {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [assistantId, setAssistantId] = useState('');
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [showPdf, setShowPdf] = useState<boolean>(false);

    const fetchPDFAndSetFile = async () => {
        try {
            const response = await fetch('/ebookExperienceCandidat_nosummary.pdf');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setFileUrl(url);
            return url;
        } catch (error) {
            console.error('Error fetching the file:', error);
            alert('Failed to fetch the file.');
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const fileUrl = await fetchPDFAndSetFile();
        if (!fileUrl) {
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', new File([fileUrl], 'ebookExperienceCandidat_nosummary.pdf', { type: 'application/pdf' }));

        try {
            const response = await fetch('https://superia.northeurope.cloudapp.azure.com/chatdoc', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                setAssistantId(result.assistant_id);
                setUploadStatus('File uploaded successfully.');
                setShowPdf(true);
            } else {
                setUploadStatus(result.error || 'Failed to upload the file.');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus('Failed to upload the file.');
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        handleSubmit,
    }));

    const AskQuestionComponent: FC<{ assistantId: string }> = ({ assistantId }) => {
        const [question, setQuestion] = useState('');
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [responses, setResponses] = useState<{ question: string; response: string }[]>([]);
        const currentResponseRef = useRef('');

        const handleQuestionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setLoading(true);
            setError(null);

            const newResponses = [...responses, { question, response: '' }];
            const lastIndex = newResponses.length - 1;
            setResponses(newResponses);

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
                    throw new Error(`An error occurred: ${askRes.statusText}`);
                }

                const reader = askRes.body?.getReader();
                if (!reader) {
                    throw new Error('Reader not available');
                }

                const decoder = new TextDecoder('utf-8');
                let done = false;

                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value) {
                        const chunk = decoder.decode(value, { stream: true });
                        currentResponseRef.current += chunk;

                        // Update the response state incrementally
                        newResponses[lastIndex].response = currentResponseRef.current;
                        setResponses([...newResponses]);
                    }
                }

                console.log('Final response content:', currentResponseRef.current);
            } catch (error) {
                console.error('Error querying assistant:', error);
                setError('Failed to get a response from the assistant.');
            } finally {
                setLoading(false);
                setQuestion(''); // Clear the question input after submission
                currentResponseRef.current = ''; // Reset the ref for the next question
            }
        };

        return (
            <div className="container bg-white min-h-screen p-4">
                <div className="flex-grow overflow-y-auto">
                    {responses.map((qa, index) => (
                        <div key={index} className="mb-4">
                            <p className="font-bold">Question: {qa.question}</p>
                            <div dangerouslySetInnerHTML={{ __html: qa.response.replace(/\n/g, '<br />') }} />
                        </div>
                    ))}
                </div>
                <form onSubmit={handleQuestionSubmit} className="flex-none flex">
                    <input
                        className="flex-grow rounded-md border-0 py-2.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-2xl 2xl:leading-6"
                        type="text"
                        name="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask your question"
                    />
                    <button className="p-3 m-1 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit">
                        Ask
                    </button>
                </form>
                {loading && <ClipLoader color="#0000ff" loading={loading} size={150} />}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        );
    };

    if (loading) {
        return <ClipLoader color="#0000ff" loading={loading} size={150} />;
    }

    return (
        <div className="bg-white min-h-screen p-4">
            <button
                className="p-5 pl-20 pr-20 m-5 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"
                onClick={handleSubmit}
            >
                <img src="Ebook.png" alt="Ebook Experience Candidat" className="h-32 w-24 mx-auto" />
                Ebook Experience Candidat
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
