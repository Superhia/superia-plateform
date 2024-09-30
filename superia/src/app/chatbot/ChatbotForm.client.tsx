'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import io from 'socket.io-client';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import Joi from 'joi';
import ReactMarkdown from 'react-markdown';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const socket = io('wss://superia.northeurope.cloudapp.azure.com', {
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

interface QAResponse {
  question: string;
  response: string;
}

interface ProgressData {
  progress: number;
  status: string;
  log?: string;
}

const preconfiguredAssistants = [
  {
    name: 'Analyse Marque Employeur',
    instructions: "Résume en une centaine de mots le contenu de la page, puis fait une Analyse générale de la marque employeur avec les rubriques Proposition de valeur et Culture d'entreprise."
  },
  {
    name: 'Candidate persona',
    instructions: "Résume en une centaine de mots le contenu de la page, puis Propose un candidate persona principal basé sur une analyse rapide des besoins et objectifs des utilisateurs potentiels."
  },
  {
    name: 'Employee Value Propositions',
    instructions: "Résume en une centaine de mots le contenu de la page, puis Définis 3 Employee Value Propositions (EVP) qui mettent en avant les avantages uniques de travailler pour l'entreprise."
  }
];

// Nouvelle liste des six sites fixes
const fixedSites = [
  {
    name: 'BPI France Talents',
    url: 'https://talents.bpifrance.fr',
    instructions: "Résume en une centaine de mots le contenu de la page, puis fait une Analyse générale de la marque employeur avec les rubriques Proposition de valeur et Culture d'entreprise."
  },
  {
    name: 'Decathlon Recrutement',
    url: 'https://recrutement.decathlon.fr',
    instructions: "Résume en une centaine de mots le contenu de la page, puis fait une Analyse générale de la marque employeur avec les rubriques Proposition de valeur et Culture d'entreprise."
  },
  {
    name: 'Generali Carrières',
    url: 'https://carrieres.generali.fr/',
    instructions: "Résume en une centaine de mots le contenu de la page, puis fait une Analyse générale de la marque employeur avec les rubriques Proposition de valeur et Culture d'entreprise."
  },
  {
    name: 'La Poste Recrute',
    url: 'https://laposterecrute.fr/',
    instructions: "Résume en une centaine de mots le contenu de la page, puis fait une Analyse générale de la marque employeur avec les rubriques Proposition de valeur et Culture d'entreprise."
  },
  {
    name: 'Altrad Del',
    url: 'https://carriere.altradendel.com/',
    instructions: "Résume en une centaine de mots le contenu de la page, puis fait une Analyse générale de la marque employeur avec les rubriques Proposition de valeur et Culture d'entreprise."
  },
  {
    name: 'Audencia',
    url: 'https://audencia.teamtailor.com/',
    instructions: "Résume en une centaine de mots le contenu de la page, puis fait une Analyse générale de la marque employeur avec les rubriques Proposition de valeur et Culture d'entreprise."
  }
];

const ChatbotForm: React.FC = () => {
  const [domain, setDomain] = useState<string>('');
  const [assistantName, setAssistantName] = useState<string>('Custom Assistant');
  const [instructions, setInstructions] = useState<string>('');
  const [responses, setResponses] = useState<QAResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [requestLimit, setRequestLimit] = useState<number>(1000);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [log, setLog] = useState<string[]>([]);

  const requestInProgress = useRef(false);

  const inappropriateKeywords = ["carte bancaire", "numéro de sécurité sociale", "DROP TABLE", "script", "mot de passe"];

  const schema = Joi.object({
    domain: Joi.string().uri({ scheme: ['http', 'https'] }).required()
  });

  const validateInput = (data: { domain: string }) => {
    const { error, value } = schema.validate(data);
    if (error) {
      return [false, error];
    } else {
      return [true, value];
    }
  };

  const MySwal = withReactContent(Swal);

  const validateDomain = (domain: string) => {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlPattern.test(domain);
  };

  useEffect(() => {
    socket.on('Préchauffage du transistor de Superia', (data: ProgressData) => {
      console.log('Progress update received', data);
      setProgress(data.progress);
      setStatus(data.status);
      if (data.log) {
        setLog((prevLog) => [...prevLog, data.log as string]);
        setCurrentUrl(data.log);
      }
      if (data.progress === 100) {
        setLoading(false);
      }
    });

    socket.on('crawling_complete', (data: string) => {
      console.log('Crawling complete received:', data);
      setResponses((prevResponses) => [
        ...prevResponses,
        { question: assistantName, response: data }
      ]);
      setLoading(false);
      MySwal.fire({
        icon: 'success',
        title: 'Analyse terminée',
        text: 'L\'analyse de la marque employeur est terminée.',
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socket.off('Préchauffage du transistor de Superia');
      socket.off('crawling_complete');
      socket.off('disconnect');
    };
  }, [assistantName]);

  // Fonction modifiée pour accepter siteUrl, instructions et siteName
  const handleScrapeSubmit = async (siteUrl: string, selectedInstructions: string, siteName: string) => {
    if (!validateDomain(siteUrl)) {
      MySwal.fire({
        icon: 'error',
        title: 'Erreur',
        html: `<span style="color: red;">Veuillez entrer une URL valide au format https://example.com</span>`,
        confirmButtonText: 'OK',
      });
      return;
    }
    if (requestInProgress.current || requestCount >= requestLimit) return;

    // Valider les entrées
    const [isValid, validationError] = validateInput({ domain: siteUrl });
    if (!isValid && validationError) {
      MySwal.fire({
        icon: 'error',
        title: 'Entrée invalide',
        text: validationError.details[0].message,
      });
      return;
    }

    // Vérifier les mots-clés inappropriés
    if (containsInappropriateKeywords(siteUrl) || containsInappropriateKeywords(selectedInstructions)) {
      MySwal.fire({
        icon: 'warning',
        title: 'Contenu inapproprié',
        text: 'Votre saisie contient des termes inappropriés.',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    setStatus('');
    setLog([]);
    requestInProgress.current = true;

    console.log("Submitting with site:", siteUrl, "and instructions:", selectedInstructions);

    try {
      const response = await fetch('https://superia.northeurope.cloudapp.azure.com/scanrh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entreprise: siteUrl, instructions: selectedInstructions }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Une erreur survient: ${response.statusText}`);
      }

      const data = await response.json();
      setResponses((prevResponses) => [
        ...prevResponses,
        { question: siteName, response: data.response }
      ]);
      setRequestCount(prevCount => prevCount + 1);

    } catch (error) {
      console.error('Error:', error);
      setError((error as Error).message);
      setResponses((prevResponses) => [
        ...prevResponses,
        { question: 'Erreur', response: 'Une erreur est survenue lors de l\'envoi de la requête.' }
      ]);
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  };

  const handlePreconfiguredSubmit = async (configIndex: number) => {
    const config = preconfiguredAssistants[configIndex];
    setAssistantName(config.name);
    setInstructions(config.instructions);

    // Soumettre avec l'URL du champ d'entrée
    await handleScrapeSubmit(domain, config.instructions, config.name);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setRequestLimit(1000);
    setRequestCount(0);
  };

  const containsInappropriateKeywords = (text: string): boolean => {
    return inappropriateKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  const sanitizeHtml = (inputHtml: string): string => {
    return DOMPurify.sanitize(inputHtml, { 
      ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'strong', 'em'], 
      ALLOWED_ATTR: ['href', 'title', 'rel'] 
    });
  };

  return (
    <div className="container">
      {/* Formulaire pour entrer le domaine */}
      <form onSubmit={(e) => e.preventDefault()} className="mb-6">
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
          Site Carrières URL:
        </label>
        <input
          className="block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6"
          type="url"
          id="domain"
          placeholder='https://www.recrutement.leclerc'
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          required
          disabled={requestCount >= requestLimit}
        />
      </form>

      {/* Boutons Préconfigurés Existants */}
      <div className="preconfigured-buttons flex flex-wrap justify-center mb-6">
        {preconfiguredAssistants.map((config, index) => (
          <button
            key={index}
            className="p-5 pl-10 pr-10 m-5 mx-4 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8" 
            onClick={() => handlePreconfiguredSubmit(index)}
            disabled={loading || requestCount >= requestLimit}
          >
            {config.name}
          </button>
        ))}
      </div>
      <h4 className="text-center py-5">Testez notre outil avec un des sites déjà analysé</h4>

      {/* Boutons Fixes pour Sites Spécifiques */}
      <div className="fixed-sites-buttons flex flex-wrap justify-center mb-6">
        {fixedSites.map((site, index) => (
          <button
            key={index}
            className="p-5 pl-10 pr-10 m-5 mx-10 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8"
            onClick={() => handleScrapeSubmit(site.url, site.instructions, site.name)}
            disabled={loading || requestCount >= requestLimit}
          >
            {site.name}
          </button>
        ))}
      </div>

      {/* Indicateur de Chargement et Progression */}
      {loading && (
        <div className="flex flex-col items-center m-4">
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

      {/* Affichage des Erreurs */}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {/* Affichage des Réponses */}
      <div className="mt-4">
        {responses.map((res, index) => (
          <div key={index} className="mb-6 p-4 border rounded-md shadow-md">
            <h3 className='font-bold text-xl mb-2'>Q: {res.question}</h3>
            <ReactMarkdown className="markdown-content">
              {sanitizeHtml(res.response)}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      {/* Limite de Requêtes Atteinte */}
      {requestCount >= requestLimit && (
        <div className="text-center mt-6">
          <p className="text-red-500 font-bold text-xl">Vous avez atteint le nombre maximal de requêtes.</p>
          {!isLoggedIn && (
            <Link href="/login">
              <button className="p-5 pl-20 pr-20 m-5 mx-auto rounded-md border-0 text-violet-900 ring-1 ring-inset ring-violet-300 text-xl 2xl:leading-8">
                Découvrir toute la solution
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotForm;
