import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-6xl font-bold text-indigo-600">404</h1>
          <h2 className="text-2xl font-semibold mt-4 mb-8">Page non trouvée</h2>
          <p className="text-gray-600 mb-6">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link
            to="/"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;