'use client';
import React, { useState, useRef} from 'react';
import { ClipLoader } from 'react-spinners';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileUploadComponent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showPdf, setShowPdf] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]); // Capture the file from the input
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
      alert('Please select a file.');
      return;
    }
    setLoading(true);
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
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (loading) {
    return <ClipLoader color="#0000ff" loading={loading} size={150} />;
}

return (
  <div>
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
        />
      </div>
      <button
        className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"
        type="submit"
      >
        Envoyer
      </button>
    </form>
    {uploadStatus && <p>{uploadStatus}</p>}
    {showPdf && assistantId && pdfUrl && (
        <div className="grid grid-cols-2 gap-4 h-screen">
          <div
            style={{
              border: '1px solid rgba(0, 0, 0, 0.3)',
              height: '100%',
              overflow: 'auto',
            }}
          >
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
              {Array.from(
                new Array(numPages),
                (el, index) => (
                  <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                ),
              )}
            </Document>
          </div>
          <div className="flex flex-col justify-between p-5">
            <AskQuestionComponent assistantId={assistantId} />
          </div>
        </div>
      )}
  </div>
);
};

const AskQuestionComponent = ({ assistantId }: { assistantId: string }) => {
  const [question, setQuestion] = useState<string>('');
  const [qaList, setQaList] = useState<{ question: string; response: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleQuestionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new URLSearchParams();
    formData.append('question', question);
    formData.append('assistant_id', assistantId);

    try {
      const response = await fetch('https://superia.northeurope.cloudapp.azure.com/ask', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setQaList([...qaList, { question, response: result.response || 'No response received.' }]);
      } else {
        setQaList([...qaList, { question, response: result.error || 'Failed to get a response.' }]);
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      setQaList([...qaList, { question, response: 'Failed to submit the question.' }]);
    } finally {
      setLoading(false);
    }
    setQuestion('');
  };
  if (loading) {
    return <ClipLoader color="#0000ff" loading={loading} size={150} />;
}

return (
  <div className="flex flex-col h-full">
    <div className="flex-grow overflow-y-auto">
      {qaList.map((qa, index) => (
        <div key={index} className="mb-4">
          <p className="font-bold">Question: {qa.question}</p>
          <p>Response: {qa.response}</p>
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
      <button className="p-3 m-1 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit">Ask</button>
    </form>
  </div>
);
};

export default FileUploadComponent;
