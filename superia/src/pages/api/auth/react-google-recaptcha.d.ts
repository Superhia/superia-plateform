declare module 'react-google-recaptcha-v3' {
  import * as React from 'react';

  interface GoogleReCaptchaProviderProps {
    reCaptchaKey: string;
    children: React.ReactNode;
  }

  interface UseGoogleReCaptcha {
    executeRecaptcha: (action?: string) => Promise<string>;
  }

  export const GoogleReCaptchaProvider: React.FC<GoogleReCaptchaProviderProps>;
  export const useGoogleReCaptcha: () => UseGoogleReCaptcha;
}
 