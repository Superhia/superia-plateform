'use client';

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { ClipLoader } from 'react-spinners';
import QuestionComponent from './Question.client';

export interface FileUploadComponentRef {
  handleSubmit: () => void;
}

const FileUploadComponent = forwardRef<FileUploadComponentRef>((props, ref) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPDFAndSetFile = async () => {
    try {
      const response = await fetch('/livre_sitecarriere_10_GV.pdf');
      const blob = await response.blob();
      const file = new File([blob], 'livre_sitecarriere_10_GV.pdf', { type: 'application/pdf' });
      setFile(file);
      return file;
    } catch (error) {
      console.error('Error fetching the file:', error);
      alert('Failed to fetch the file.');
    }
  };

  const handleSubmit = async () => {
    const fetchedFile = file || await fetchPDFAndSetFile();
    if (!fetchedFile) {
      return;
    }
  setLoading(true);
  const formData = new FormData();
  formData.append('file', fetchedFile);

    try {
      const response = await fetch('https://superia.northeurope.cloudapp.azure.com/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.sourceId) {
        setSourceId(result.sourceId);
        console.log('Received sourceId:', result.sourceId);
      } else {
        console.error('Error: Source ID not found in response. Full response:', JSON.stringify(result));
        throw new Error("Source ID not found in response.");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit the form. See console for more details.');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmit: () => {
      handleSubmit();
    },
  }));

  if (loading) {
    return <ClipLoader color="#0000ff" loading={loading} size={150} />;
  }

  return (
    <div>
      {uploadStatus && <p>{uploadStatus}</p>}
      {sourceId && <p>Source ID: {sourceId}</p>}
      {sourceId && <QuestionComponent sourceId={sourceId} />}
    </div>
  );
});

FileUploadComponent.displayName = 'FileUploadComponent';

export default FileUploadComponent;


