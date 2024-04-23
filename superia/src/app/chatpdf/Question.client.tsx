// scrappingForm.tsx

'use client'
import React, { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
interface QuestionComponentProps {
    sourceId: string | null;  // Define that sourceId can be a string or null
}
const QuestionComponent: React.FC<QuestionComponentProps> = ({ sourceId }) => {
    const [question, setQuestion] = useState("");
    const [responseMessage, setResponseMessage] = useState("");
    const apiUrl = `https://superia.northeurope.cloudapp.azure.com/query?sourceId=${encodeURIComponent(sourceId ?? '')}`;
    const [loading, setLoading] = useState(false);
    console.log("Encoded URL:", apiUrl);



    console.log("Using sourceId for URL:", sourceId);
    useEffect(() => {
    const selector = "div#someId.special-class";
    const element = document.querySelector(selector);
    console.log("Selected element:", element);
    if (!element) {
        console.error("No element found with the selector:", selector);
    }
    }, [sourceId, responseMessage]);

    const handleQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion(event.target.value); // Capture the question from the input
    };
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    if (!sourceId) {
        console.error('Source ID is missing, cannot proceed.');
        setResponseMessage("Source ID is required.");
        return; // Early return if sourceId is not available
    }
    const formData = new URLSearchParams();
    formData.append('question', question);
    formData.append('source_id', sourceId);
    console.log("Final form data string:", formData.toString());
    setLoading(true);
    try {
        const response = await fetch('https://superia.northeurope.cloudapp.azure.com/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
        const rawResponse = await response.text(); // Get raw response text
        console.log("Raw server response:", rawResponse);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${rawResponse}`);
        }
        let result;
    try {
        result = JSON.parse(rawResponse);
        console.log("Parsed server response:", result);
        setResponseMessage(result.message || 'Success!');
    } catch (jsonError) {
        console.log('Response is not JSON, handling as plain text.');
        setResponseMessage(rawResponse);  // Handle plain text response
    }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);  // Now safely accessed because we've confirmed 'error' is an instance of Error
            setResponseMessage(`Error: ${error.message}`);
        } else {
            // Handle cases where the error might not be an instance of Error
            console.log('An unexpected error occurred:', error);
            setResponseMessage('An unexpected error occurred.');
        }
    } finally {
        setLoading(false); // Assurez-vous d'arrêter le chargement quel que soit le résultat
    }
};
if (loading) {
    return <ClipLoader color="#0000ff" loading={loading} size={150} />;
}
    return (
        <div id="someId" className="special-class">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <h2 className="text-1xl">Pose tes Questions</h2>
            <input type="text" name="question" value={question} onChange={handleQuestionChange} placeholder="Write your question"/>
            <button type="submit">Post</button>
        </form>
        {responseMessage && <div>{responseMessage}</div>}  {/* Display the response message */}</div>
    );
};

export default QuestionComponent;