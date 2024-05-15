// scrappingForm.client.tsx
'use client';

import React,{ useState } from 'react';
import { ClipLoader } from 'react-spinners';
export default function ScrappingForm() {
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true); 
        const form = event.currentTarget;
        const formData = new FormData(form);
        const domain = formData.get('question'); // Get the domain from the form input
        
        try {
            const res = await fetch("https://superia.northeurope.cloudapp.azure.com/process_msg", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ domain: domain }) // Send the correct key as expected by the backend
            });
            const data = await res.json();
            setResponse(JSON.stringify(data)); // Update the response state with the server response
            console.log(data); // Log the data to the console for debugging
        } catch (error) {
            console.error('Failed to submit:', error);
            setResponse("Failed to submit"); // Set error message in response state
        } finally {
            setLoading(false); // Assurez-vous d'arrêter le chargement quel que soit le résultat
        }
    };
    if (loading) {
        return <ClipLoader color="#0000ff" loading={loading} size={150} />;
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="question">Veuillez saisir l’url exacte du site carrières que vous souhaitez analyser.</label>
            <input className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-2xl 2xl:leading-6" placeholder="Entrez votre url ici" id="question" name="question" type="text" required />
            <button type="submit" className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0  text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8">Lancer l’analyse !</button>
            {response && <div>{response}</div>}
        </form>
    );
}
