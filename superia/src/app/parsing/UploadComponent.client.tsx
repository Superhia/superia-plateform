'use client'
import React, { useState, useRef, useEffect, FC } from 'react';
import io from 'socket.io-client';
import { ClipLoader } from 'react-spinners';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

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

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('update_progress', (data: ProgressData) => {
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
      socket.off('update_progress');
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
    if (!file || requestCount >= requestLimit) {
      alert('Please select a file or you have reached the request limit.');
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
        setUploadStatus('File uploaded successfully.');
        setShowPdf(true);
        setRequestCount((prevCount) => prevCount + 1); // Increment request count
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

  if (loading && !streaming) {
    return (
      <div className="flex flex-col items-center py-7">
        <ClipLoader color="#0000ff" loading={loading} size={50} />
        <div className="mt-2">{status}</div>
        <div>Currently Processing: {currentUrl}</div>
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
            <p>Drag & drop your file here or click to select</p>
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
          {loading ? 'Processing...' : 'Envoyer'}
        </button>
      </form>
      {uploadStatus && <p>{uploadStatus}</p>}
      {requestCount >= requestLimit && (
        <div>
          <p className="text-red-500 font-bold text-xl">You have reached the maximum number of requests.</p>
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

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('update_progress', (data: ProgressData) => {
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
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socket.off('update_progress');
      socket.off('response_complete');
    };
  }, []);

  const handleQuestionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestCount >= requestLimit) return;

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
        throw new Error(`An error occurred: ${askRes.statusText}`);
      }

      const reader = askRes.body?.getReader();
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
      setQuestion(''); // Clear the question input after submission
    }
  };

  return (
    <div className="bg-white flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        {responses.map((qa, index) => (
          <div key={index} className="mb-4">
            <p className="font-bold">Question: {qa.question}</p>
            <div dangerouslySetInnerHTML={{ __html: qa.response.replace(/\n/g, '<br />') }} />
          </div>
        ))}
      </div>
      {loading && !streaming && (
        <div className="flex flex-col items-center">
          <ClipLoader color="#0000ff" loading={loading} size={50} />
          <div className="mt-2">{status}</div>
          <div>Currently Processing: {currentUrl}</div>
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
            placeholder="Ask your question"
          />
          <button disabled={loading} className="p-3 m-1 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit">
            Ask
          </button>
        </form>
      )}
      {requestCount >= requestLimit && (
        <div>
          <p className="text-red-500 font-bold text-xl">You have reached the maximum number of requests.</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FileUploadComponent;