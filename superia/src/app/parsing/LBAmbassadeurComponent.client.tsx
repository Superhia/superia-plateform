// components/EbookComponent.client.js
'use client';

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { ClipLoader } from 'react-spinners';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface FileUploadComponentRef {
  handleSubmit: (question: string) => void;
}

const LBAmbassadeur = forwardRef<FileUploadComponentRef>((props, ref) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [assistantId, setAssistantId] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [showPdf, setShowPdf] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);

  const fetchPDFAndSetFile = async () => {
    try {
      const response = await fetch('/Livre_blanc_Ambassadeur_Marque_Employeur.pdf');
      const blob = await response.blob();
      const file = new File([blob], 'Livre_blanc_Ambassadeur_Marque_Employeur.pdf', { type: 'application/pdf' });
      setFile(file);
      setPdfUrl(URL.createObjectURL(file));
      return file;
    } catch (error) {
      console.error('Error fetching the file:', error);
      alert('Failed to fetch the file.');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const file = await fetchPDFAndSetFile();
    if (!file) {
      setLoading(false);
      return;
    }

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

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (loading) {
    return <ClipLoader color="#0000ff" loading={loading} size={150} />;
  }

  return (
    <div>
      <button
        className="p-5 pl-20 pr-20 m-5 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"
        onClick={handleSubmit}
      >
        <img src="LBAmbassadeur.png" alt="Livre Blanc Ambassadeur" className="h-32 w-24 mx-auto" />
        Livre Blanc Ambassadeur
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}
      {showPdf && assistantId && pdfUrl && (
        <div className="grid grid-cols-2 gap-4 h-screen">
          <div className='height-full overflow-auto border-black'>
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
});

const AskQuestionComponent = ({ assistantId }: { assistantId: string }) => {
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [qaList, setQaList] = useState<{ question: string; response: string }[]>([]);

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
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Ensuring correct content type
        },
      });

      const result = await response.text();
      if (response.ok) {
        setQaList([...qaList, { question, response: result || 'No response received.' }]);
      } else {
        setQaList([...qaList, { question, response: result || 'Failed to get a response.' }]);
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
          <div dangerouslySetInnerHTML={{ __html: qa.response }} />
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

LBAmbassadeur.displayName = 'LBAmbassadeur';
export default LBAmbassadeur;

