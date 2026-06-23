declare module '*.css';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';

// Injected at build time by webpack's DefinePlugin (see webpack.config.js).
declare const process: {
  env: {
    SUPPORTDOCK_API_KEY: string;
  };
};
