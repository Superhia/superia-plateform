import { AppProps } from 'next/app';
import { Auth0Provider } from '@auth0/auth0-react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const domain = process.env.AUTH0_ISSUER_BASE_URL;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || 'http://localhost:3000/auth-callback';

  const router = useRouter();

  if (!domain || !clientId) {
    throw new Error('Missing Auth0 configuration');
  }

  const handleRedirectCallback = (appState?: any) => {
    // Redirect to the page the user was on before authentication or home page
    router.push(appState?.returnTo || '/');
  };
  console.log("Auth0Provider is active");

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: redirectUri }}
      onRedirectCallback={handleRedirectCallback}
    >
      <Component {...pageProps} />
    </Auth0Provider>
  );
}

export default MyApp;
