// This file contains global type declarations for the project

// Declare modules for image imports
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.ico' {
  const src: string;
  export default src;
}

// Environment variables
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_REACT_APP_BACKEND_URL?: string;
  readonly DEV: boolean;
  readonly MODE: string;
  readonly SSR: boolean;
  readonly BASE_URL: string;
  // Add any other environment variables used in your app
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
