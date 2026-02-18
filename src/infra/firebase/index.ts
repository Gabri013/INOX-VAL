// Re-export from the main firebase configuration
// This provides a clean import path for infra layer components
export { db, getFirestore, getFirebaseAuth, getEmpresaContext, setEmpresaContext } from '../../lib/firebase';
