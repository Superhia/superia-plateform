// BPIFranceForm.client.tsx
"use client";

import React, { useState } from 'react';
import { ClipLoader } from 'react-spinners';

export default function OrangeForm() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const res = await fetch("https://superia.northeurope.cloudapp.azure.com/process_msg", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domain: "https://carriere.altradendel.com/" }) // Send the correct key as expected by the backend
      });
      const data = await res.json();
      setResponse(JSON.stringify(data)); // Update the response state with the server response
      console.log(data); // Log the data to the console for debugging
    } catch (error) {
      console.error('Failed to submit:', error);
      setResponse("Failed to submit"); // Set error message in response state
    } finally {
      setLoading(false); // Ensure loading stops regardless of outcome
    }
  };
    if (loading) {
        return <ClipLoader color="#0000ff" loading={loading} size={150} />;
    }

    return (
        <div className='rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 m-5'>
      <button className="p-5 px-28 m-5" onClick={handleSubmit}>
      <img src="altrad-endel.png" alt="logo orange" className="h-8 w-8 mx-auto"/>https://carriere.altradendel.com/
      </button>
      
      <div className="response-container bg-gray-100 rounded-md">
        {loading ? (
          <div className="flex justify-center items-center ">
            <ClipLoader color="#0000ff" loading={loading} size={150} />
          </div>
        ) : (
          response && <pre className='mt-5 p-5' style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{response}</pre>
        )}
      </div>
    </div>
    );
}