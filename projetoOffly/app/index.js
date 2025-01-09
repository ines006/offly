import React from 'react';
import  Navbar from './components/navbar';
import { CardProvider } from './components/shake/cardContext';
import Login from './components/entrar/login'

export default function App() {
  return (
    <CardProvider>
      <Navbar />
    </CardProvider>
  );
}

