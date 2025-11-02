import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigation } from './src/navigation/RootNavigation';

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </PaperProvider>
  );
}
