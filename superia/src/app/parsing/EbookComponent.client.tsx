'use client';

import React, { useState, FC, useRef, useImperativeHandle, forwardRef } from 'react';
import { ClipLoader } from 'react-spinners';
import { Page, Text, View, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 20,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Section #1</Text>
      </View>
      <View style={styles.section}>
        <Text>Section #2</Text>
      </View>
    </Page>
  </Document>
);

export interface FileUploadComponentRef {
  handleSubmit: (question: string) => void;
}

const Ebook = forwardRef<FileUploadComponentRef>((props, ref) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [assistantId, setAssistantId] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [showPdf, setShowPdf] = useState<boolean>(false);
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);

  const fetchPDFAndSetFile = async () => {
    try {
      const response = await fetch('/ebookExperienceCandidat_nosummary.pdf');
      const blob = await response.blob();
      setFileBlob(blob);
      return blob;
    } catch (error) {
      console.error('Error fetching the file:', error);
      alert('Failed to fetch the file.');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const fileBlob = await fetchPDFAndSetFile();
    if (!fileBlob) {
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', new File([fileBlob], 'ebookExperienceCandidat_nosummary.pdf', { type: 'application/pdf' }));

    try {
      const response = await fetch('https://superia.northeurope.cloudapp.azure.com/chatdoc', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setAssistantId(result.assistant_id);
        setUploadStatus('File uploaded successfully.');
        setShowPdf(true);
      } else {
        setUploadStatus(result.error || 'Failed to upload the file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Failed to upload the file.');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  if (loading) {
    return <ClipLoader color="#0000ff" loading={loading} size={150} />;
  }

  return (
    <div>
      <button
        className="p-5 pl-20 pr-20 m-5 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"
        onClick={handleSubmit}
      >
        <img src="Ebook.png" alt="Ebook Experience Candidat" className="h-32 w-24 mx-auto" />
        Ebook Experience Candidat
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}
      {showPdf && assistantId && fileBlob && (
        <div className="grid grid-cols-2 gap-4 h-screen">
          <div className="height-full overflow-auto border-black">
            <PDFViewer style={{ width: '100%', height: '100%' }}>
              <MyDocument />
            </PDFViewer>
          </div>
          <div className="flex flex-col justify-between p-5">
            <AskQuestionComponent assistantId={assistantId} />
          </div>
        </div>
      )}
    </div>
  );
});

interface AskQuestionComponentProps {
  assistantId: string;
}
interface QAResponse {
  question: string;
  response: string;
}
const AskQuestionComponent: FC<AskQuestionComponentProps> = ({ assistantId }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<QAResponse[]>([]);

  const currentResponseRef = useRef('');

  const handleQuestionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const newResponses = [...responses, { question, response: '' }];
    const lastIndex = newResponses.length - 1;
    setResponses(newResponses);

    try {
      const askRes = await fetch('https://superia.northeurope.cloudapp.azure.com/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          assistant_id: assistantId,
        }),
      });

      if (!askRes.ok) {
        throw new Error(`An error occurred: ${askRes.statusText}`);
      }

      const reader = askRes.body?.getReader();
      if (!reader) {
        throw new Error('Reader not available');
      }

      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          currentResponseRef.current += chunk;

          // Update the response state incrementally
          newResponses[lastIndex].response = currentResponseRef.current;
          setResponses([...newResponses]);
        }
      }

      console.log('Final response content:', currentResponseRef.current);
    } catch (error) {
      console.error('Error querying assistant:', error);
      setError('Failed to get a response from the assistant.');
    } finally {
      setLoading(false);
      setQuestion(''); // Clear the question input after submission
      currentResponseRef.current = ''; // Reset the ref for the next question
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        {responses.map((qa, index) => (
          <div key={index} className="mb-4">
            <p className="font-bold">Question: {qa.question}</p>
            <div dangerouslySetInnerHTML={{ __html: qa.response.replace(/\n/g, '<br />') }} />
          </div>
        ))}
      </div>
      <form onSubmit={handleQuestionSubmit} className="flex-none flex">
        <input
          className="flex-grow rounded-md border-0 py-2.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-2xl 2xl:leading-6"
          type="text"
          name="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question"
        />
        <button className="p-3 m-1 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit">
          Ask
        </button>
      </form>
      {loading && <ClipLoader color="#0000ff" loading={loading} size={150} />}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
Ebook.displayName = 'Ebook';
export default Ebook;
