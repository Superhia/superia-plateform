import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { io } from 'socket.io-client';
import ClipLoader from 'react-spinners/ClipLoader';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import Joi from 'joi';

const socket = io('wss://superia.northeurope.cloudapp.azure.com', {
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

const MySwal = withReactContent(Swal);

interface QAResponse {
  question: string;
  response: string;
}

const AgentComponent: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [responses, setResponses] = useState<QAResponse[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [fetchedFiles, setFetchedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [streaming, setStreaming] = useState<boolean>(false);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [requestLimit, setRequestLimit] = useState<number>(2);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const requestInProgress = useRef(false);

  const inappropriateKeywords = ["carte bancaire", "numéro de sécurité sociale", "DROP TABLE", "script", "mot de passe"];

  const schema = Joi.object({
    question: Joi.string().max(200).pattern(/^[a-zA-Z0-9 .,!?]+$/).required()
  });

  const validateInput = (data: { question: string }) => {
    const { error, value } = schema.validate(data);
    if (error) {
      return [false, error];
    } else {
      return [true, value];
    }
  };

  const containsInappropriateKeywords = (text: string) => {
    return inappropriateKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  const sanitizeHtml = (inputHtml: string) => {
    return DOMPurify.sanitize(inputHtml, { ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'strong', 'em'], ALLOWED_ATTR: ['href', 'title', 'rel'] });
  };

  useEffect(() => {
    fetchPDFFilesAndSetFiles();

    socket.on('Préchauffage du transistor de Superia', (data: { progress: number; status: string; log: string }) => {
      setProgress(data.progress);
      setStatus(data.status);
      setCurrentUrl(data.log);
    });

    return () => {
      socket.off('Préchauffage du transistor de Superia');
    };
  }, []);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  };

  const fetchPDFFilesAndSetFiles = async () => {
    try {
      const fileUrls = [
        '/10 Tips to Write the Perfect Job Description - PeopleSpheres.pdf',
        '/11 tips for crafting highly effective job descriptions _ CIO.pdf',
        '/16 Tips for Writing the Perfect Job Description _ Harver.pdf',
        '/How to write a good job description.pdf',
        '/How to write an effective job description _ Michael Page.pdf',
        '/How To Write Your Own Job Description (With Examples) _ Indeed.com.pdf',
        '/Ultimate Guide to Writing Effective Job Descriptions.pdf',
      ];

      const fileFetchPromises = fileUrls.map(async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], url.split('/').pop()!, { type: blob.type });
      });

      const files = await Promise.all(fileFetchPromises);
      setFetchedFiles(files);
    } catch (error) {
      console.error('Erreur denvoie du document:', error);
      alert('Document non envoyer.');
    }
  };

  const cleanText = (text: string) => {
    const pattern = /【\d+:\d+†source】/g; // Use 'g' for global replacement
    return text.replace(pattern, '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (containsInappropriateKeywords(question)) {
      setResponses((prevResponses) => [
        ...prevResponses,
        { question, response: "Je ne peux pas répondre à cette question car elle contient des caractères inappropriés." }
      ]);
      setQuestion('');
      return;
    }

    if (!isLoggedIn && requestCount >= requestLimit) {
      MySwal.fire({
        icon: 'warning',
        title: 'Login Requis',
        html: (
          <div>
            Vous avez atteint le nombre de requêtes maximum, veuillez vous connecter.
            Merci  <a href="/login" style={{ color: 'blue' }}>log in</a> 
          </div>
        ),
        confirmButtonText: 'OK'
      });
      return;
    }

    if (fetchedFiles.length === 0) {
      setResponses([{ question, response: 'Pas de fichier envoyé' }]);
      return;
    }

    const formData = new FormData();
    fetchedFiles.forEach((file) => formData.append('file', file));
    formData.append('question', question);

    setLoading(true);
    setStreaming(false);

    try {
      const response = await fetch('https://superia.northeurope.cloudapp.azure.com/assistantCOE', {
        method: 'POST',
        body: formData,
      });

      if (!response.body) {
        throw new Error('ReadableStream nest pas supporté dans ce navigateur');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let responseContent = '';

      const newResponses = [...responses, { question, response: '' }];
      const lastIndex = newResponses.length - 1;
      setResponses(newResponses);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          setStreaming(true);
          const chunk = decoder.decode(value, { stream: true });
          responseContent += chunk;
          const cleanedText = cleanText(responseContent);
          newResponses[lastIndex].response = cleanedText;
          setResponses([...newResponses]);
        }
      }

      console.log('Contenu de la réponse finale:', responseContent);
      if (!isLoggedIn) {
        setRequestCount(requestCount + 1);
      }
    } catch (error) {
      console.error('Error querying assistant:', error);
      setResponses([{ question, response: ' L assistant ne répond pas.' }]);
    } finally {
      setLoading(false);
      setStreaming(false);
      setQuestion('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
        <div style={{ whiteSpace: 'break-spaces', wordBreak: 'break-word' }}>
        {responses.map((res, index) => (
          <div key={index}>
            <strong>Q: {res.question}</strong>
            <ReactMarkdown className="markdown-content">{sanitizeHtml(res.response)}</ReactMarkdown>
          </div>
        ))}
      </div>
          <input 
            placeholder="Entrez le poste et l'entreprise"
            className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6"
            type="text"
            id="question"
            value={question}
            onChange={handleQuestionChange}
          />
        </div>
        <button className="p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" type="submit" disabled={loading}>
          {loading ? 'En cours...' : 'Posez votre question'}
        </button>
      </form>
      {loading && !streaming && (
        <div className="flex flex-col items-center py-7">
          <ClipLoader color="#0000ff" loading={loading} size={50} />
          <div className="mt-2">{status}</div>
          <div>En cours de process: {currentUrl}</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
            <div
              className="bg-blue-900 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
            <div>{progress}%</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentComponent;
