'use client';

import React, { useRef } from 'react';
import FileUploadComponent, { FileUploadComponentRef } from './EbookUploadComponent.client';


const EbookClientComponent = () => {
    const fileUploadRef = useRef<FileUploadComponentRef>(null);
  
    const handleButtonClick = () => {
      if (fileUploadRef.current) {
        fileUploadRef.current.handleSubmit();
      }
    };
  
    return (
      <div>
        <button
          className="p-5 pl-20 pr-20 m-5 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300"
          onClick={handleButtonClick}
        >
          <img src="ebookExperienceCandidat_nosummary.pdf" alt="Ebook Experience Candidat" className="h-32 w-24 mx-auto" />
          Ebook Experience Candidat
        </button>
        
        <FileUploadComponent ref={fileUploadRef} />
      </div>
    );
  }
  
  export default EbookClientComponent;
