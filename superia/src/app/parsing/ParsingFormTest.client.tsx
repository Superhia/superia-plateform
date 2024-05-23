// FileUploadComponent.tsx
'use client'
import React, { useState } from 'react';
import { ClipLoader } from 'react-spinners';

const TestFormComponent = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string>('');
    const [question, setQuestion] = useState<string>('');

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
            const response = await fetch('http://127.0.0.1:8000/chatpdf', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            if (result.session_id) {
                setResponse('File uploaded successfully.');
                console.log('Received sessionId:', result.session_id);
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
    const handleAsk = async () => {
        if (!question) {
            alert('Please enter a question.');
            return;
        }

        setLoading(true);

        try {
            console.log('Asking question:', question);
            const body = new URLSearchParams({ question: question }).toString();
            console.log('Request Body:', body);
            const res = await fetch('http://127.0.0.1:8000/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body,
                credentials: 'include',
            });
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }

            const data = await res.json();
            setResponse(data.response);
        } catch (error) {
            console.error('Failed to submit:', error);
            setResponse("Failed to submit");
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return <ClipLoader color="#0000ff" loading={loading} size={150} />;
    }

    return (
        <div>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <input type="file" name="file" onChange={handleFileChange} />
                <button className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit">Upload File</button>
            </form>
                <div>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter your question"
                        className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6"
                    />
                    <button className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" onClick={handleAsk}>
                        Ask Question
                    </button>
                </div>
            )
            {response && <div className="response-container bg-white rounded-md p-4 mt-4">{response}</div>}
        </div>
    );
};

export default TestFormComponent;