// parsingForm.tsx

'use client'
import React, { useState } from 'react';
import { ClipLoader } from 'react-spinners';
const FormComponent = () => {
    const [file, setFile] = useState<File | null>(null);
    const [question, setQuestion] = useState("")
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]); // Capture the file from the input
        }
    };

    const handleQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion(event.target.value); // Capture the question from the input
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
        formData.append('question', question);
    
        try {
            const response = await fetch('https://superia.northeurope.cloudapp.azure.com/chatpdf', {
                method: 'POST',
                body: formData,
            });
        
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to submit form with status:', response.status, 'and body:', errorText);
                throw new Error(`Network response was not ok: ${errorText}`);
            }
        
            const result = await response.json();  // Assuming JSON response now
            setResponse(result.response);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit the form.');
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
            <h1 className="text-2xl">Pose des questions à ton Fichier</h1>
            <input type="text" name="question" value={question} onChange={handleQuestionChange} placeholder="Write your question"/>
            <label>Fichier:</label>
            <input type="file" name="file" onChange={handleFileChange}/>
            <button type="submit">Envoyer</button>
        </form>
        {response && <div className="response"><p>Response:</p><div dangerouslySetInnerHTML={{ __html: response }} /></div>}
        </div>
    );
};

export default FormComponent;


