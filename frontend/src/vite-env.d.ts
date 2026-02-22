/// <reference types="vite/client" />

declare module 'circomlibjs' {
  export function buildPoseidon(): Promise<any>;
}

declare module '*.json' {
  const value: any;
  export default value;
}
