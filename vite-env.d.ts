// Reference to vite/client removed to fix "Cannot find type definition file" error.
// /// <reference types="vite/client" />

// Augment the global NodeJS namespace to add API_KEY to ProcessEnv.
// This avoids the "Cannot redeclare block-scoped variable 'process'" error.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    [key: string]: string | undefined;
  }
}
