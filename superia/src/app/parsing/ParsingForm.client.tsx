'use client';
import React, { useState, useRef } from 'react';
import { ClipLoader } from 'react-spinners';

const FormComponent = () => {
    const [file, setFile] = useState<File | null>(null);
    const [question, setQuestion] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion(event.target.value);
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
        if (!question) {
            alert('Please enter a question.');
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Step 1: Upload the file and get the assistant ID
            const fileUploadResponse = await fetch('http://127.0.0.1:8000/chatdoc', {
                method: 'POST',
                body: formData,
            });

            if (!fileUploadResponse.ok) {
                const errorText = await fileUploadResponse.text();
                console.error('Failed to upload file with status:', fileUploadResponse.status, 'and body:', errorText);
                throw new Error(`File upload failed: ${errorText}`);
            }

            const fileUploadResult = await fileUploadResponse.json();
            const assistantId = fileUploadResult.assistant_id;

            // Step 2: Use the assistant ID to submit the question
            const questionFormData = new FormData();
            questionFormData.append('question', question);
            questionFormData.append('assistant_id', assistantId);

            const questionResponse = await fetch('http://127.0.0.1:8000/ask', {
                method: 'POST',
                body: questionFormData,
            });

            if (!questionResponse.ok) {
                const errorText = await questionResponse.text();
                console.error('Failed to submit question with status:', questionResponse.status, 'and body:', errorText);
                throw new Error(`Question submission failed: ${errorText}`);
            }

            const questionResult = await questionResponse.text(); // Fetch response as text
            setResponse(questionResult);

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit the form.');
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
                <input
                    className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-2xl 2xl:leading-6"
                    type="text"
                    name="question"
                    value={question}
                    onChange={handleQuestionChange}
                    placeholder="Ecrivez votre question"
                />
                <label className="text-2xl">Fichier:</label>
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
            {response && (
                <div className="response">
                    <p>Response:</p>
                    <div dangerouslySetInnerHTML={{ __html: response }} />
                </div>
            )}
        </div>
    );
};

export default FormComponent;


