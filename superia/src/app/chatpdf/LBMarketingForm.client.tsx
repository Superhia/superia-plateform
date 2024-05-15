'use client';

import React, { useRef } from 'react';
import FileUploadComponent, { FileUploadComponentRef } from './LBMarketingUploadComponent.client';


const LBMarketingClientComponent = () => {
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
          <img src="livre_blanc_inbound_marketing_recruteurs_campagne_1.compressed.pdf" alt="Livre Blanc Marketing Recruteur" className="h-32 w-24 mx-auto" />
          Livre Blanc Marketing Recruteur
        </button>
        
        <FileUploadComponent ref={fileUploadRef} />
      </div>
    );
  }
  
  export default LBMarketingClientComponent;
