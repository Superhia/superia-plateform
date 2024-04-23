// FileUploadComponent.tsx
'use client'
import React, { useState } from 'react';
import QuestionComponent from './Question.client';
import { ClipLoader } from 'react-spinners';

const FileUploadComponent = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [sourceId, setSourceId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]); // Capture the file from the input
        }
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
                // Proceed with using the sourceId
            } else {
                console.error('Error: Source ID not found in response. Full response:', JSON.stringify(result));
                throw new Error("Source ID not found in response.");
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit the form. See console for more details.');
        } finally {
            setLoading(false); // Assurez-vous d'arrêter le chargement quel que soit le résultat
        }
    };
    if (loading) {
        return <ClipLoader color="#0000ff" loading={loading} size={150} />;
    }

    return (
        <div>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <h1 className="text-2xl">Upload Your File</h1>
                <input type="file" name="file" onChange={handleFileChange}/>
                <button type="submit">Upload File</button>
            </form>
            {uploadStatus && <p>{uploadStatus}</p>}
            {sourceId && <p>Source ID: {sourceId}</p>}
            {sourceId && <QuestionComponent sourceId={sourceId} />}
            
        </div>
    );
};

export default FileUploadComponent;
