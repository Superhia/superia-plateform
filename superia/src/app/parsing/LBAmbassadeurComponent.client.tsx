// components/EbookComponent.client.js
'use client';

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { ClipLoader } from 'react-spinners';

export interface FileUploadComponentRef {
    handleSubmit: (question: string) => void;
  }

const FileUploadComponent = forwardRef<FileUploadComponentRef>((props, ref) => {
  const [file, setFile] = useState<File | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPDFAndSetFile = async () => {
    try {
      const response = await fetch('/Livre_blanc_Ambassadeur_Marque_Employeur.pdf');
      const blob = await response.blob();
      const file = new File([blob], 'Livre_blanc_Ambassadeur_Marque_Employeur.pdf', { type: 'application/pdf' });
      setFile(file);
      return file;
    } catch (error) {
      console.error('Error fetching the file:', error);
      alert('Failed to fetch the file.');
    }
  };

  const handleSubmit = async (question: string)  => {
    const fetchedFile = file || await fetchPDFAndSetFile();
    if (!fetchedFile || !question) {
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', fetchedFile);
    formData.append('question', question);

    try {
      const response = await fetch('https://superia.northeurope.cloudapp.azure.com/chatpdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const htmlResponse = await response.text();
      console.log("Received HTML response:", htmlResponse);  // Logging for debugging
      setResponseMessage(htmlResponse);
    } catch (error) {
      console.log('An unexpected error occurred:', error);
      setResponseMessage('An unexpected error occurred.');
    } finally {
      setLoading(false); // Ensure to stop loading regardless of the result
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmit: (question: string)  => {
      handleSubmit(question);
    },
  }));

  if (loading) {
    return <ClipLoader color="#0000ff" loading={loading} size={150} />;
  }

  return (
    <div>
      {responseMessage && <div dangerouslySetInnerHTML={{ __html: responseMessage }} />}
    </div>
  );
});

FileUploadComponent.displayName = 'FileUploadComponent';

export default FileUploadComponent;

