// components/EbookComponent.client.js
'use client';

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { ClipLoader } from 'react-spinners';

export interface FileUploadComponentRef {
    handleSubmit: (question: string) => void;
}

const FileUploadComponent = forwardRef<FileUploadComponentRef>((props, ref) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [assistantId, setAssistantId] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [responseMessage, setResponseMessage] = useState<string>('');

  const fetchPDFAndSetFile = async () => {
    try {
      const response = await fetch('/ebookExperienceCandidat_nosummary.pdf');
      const blob = await response.blob();
      const file = new File([blob], 'ebookExperienceCandidat_nosummary.pdf', { type: 'application/pdf' });
      setFile(file);
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

  if (loading) {
    return <ClipLoader color="#0000ff" loading={loading} size={150} />;
  }

  return (
    <div>
      <button
        className="p-5 pl-20 pr-20 m-5 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"
        onClick={handleSubmit}
      >
        <img src="Ebook.png" alt="Ebook Experience Candidat" className="h-32 w-24 mx-auto" />
        Ebook Experience Candidat
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}
      {assistantId && <AskQuestionComponent assistantId={assistantId} />}
      {responseMessage && <div dangerouslySetInnerHTML={{ __html: responseMessage }} />}
    </div>
  );
});

FileUploadComponent.displayName = 'FileUploadComponent';

const AskQuestionComponent = ({ assistantId }: { assistantId: string }) => {
  const [question, setQuestion] = useState<string>('');
  const [response, setResponse] = useState<string>('');

  const handleQuestionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
        setResponse(result.response || 'No response received.');
      } else {
        setResponse(result.error || 'Failed to get a response.');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      setResponse('Failed to submit the question.');
    }
  };

  return (
    <div>
      <form onSubmit={handleQuestionSubmit}>
        <input
          className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-2xl 2xl:leading-6"
          type="text"
          name="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question"
        />
        <button className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit">Ask Question</button>
      </form>
      {response && <p>{response}</p>}
    </div>
  );
};

export default FileUploadComponent;
