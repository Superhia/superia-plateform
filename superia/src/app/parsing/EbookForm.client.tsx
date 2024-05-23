'use client';

import React, { useRef, useState } from 'react';
import FileUploadComponent, { FileUploadComponentRef } from './EbookComponent.client';

const EbookClientComponent = () => {
  const fileUploadRef = useRef<FileUploadComponentRef>(null);
  const [question, setQuestion] = useState("");

  const handleButtonClick = () => {
    if (fileUploadRef.current) {
      console.log("Submitting question:", question);  // Logging for debugging
      fileUploadRef.current.handleSubmit(question);
    }
  };

  return (
    <div>
      <div>
        <label>Question:</label>
        <input 
          type="text" 
          value={question} 
          onChange={(e) => setQuestion(e.target.value)}
          className="block w-full px-1 rounded-md border-0 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 2xl:leading-6" 
        />
      </div>
      <button
        className="p-5 pl-20 pr-20 m-5 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300"
        onClick={handleButtonClick}
      >
        <img src="ebookExperienceCandidat_nosummary.pdf" alt="Ebook Experience Candidat" className="h-32 w-24 mx-auto" />
        Livre Site Carrière
      </button>
      <FileUploadComponent ref={fileUploadRef} />
      
    </div>
  );
};

export default EbookClientComponent;


                
