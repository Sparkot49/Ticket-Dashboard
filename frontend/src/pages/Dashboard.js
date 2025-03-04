import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Header from '../components/Header';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/servers`);
        if (response.data.success) {
          setServers(response.data.servers);
        } else {
          setError(response.data.error || 'Erreur lors de la récupération des serveurs');
        }
      } catch (error) {
        console.error('Fetch servers error:', error);
        setError(error.response?.data?.error || 'Erreur lors de la récupération des serveurs');
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Vos serveurs Discord</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {servers.length === 0 ? (
  <div className="bg-white shadow-md rounded-lg p-6">
    <p className="text-gray-600">
      Vous n'avez pas encore de serveurs Discord où vous êtes administrateur, ou vous n'avez pas
      encore ajouté notre bot à vos serveurs.
    </p>
    <div className="mt-4">
      
        href="https://discord.com/api/oauth2/authorize?client_id=748238534904643602&permissions=8&scope=bot"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Ajouter le bot à un serveur
      </a>
    </div>
  </div>
) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map(server => (
              <Link to={`/server/${server._id}`} key={server._id}>
                <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center mb-4">
                    {server.icon ? (
                      <img src={server.icon} alt={server.name} className="w-12 h-12 rounded-full mr-4" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-4">
                        {server.name.charAt(0)}
                      </div>
                    )}
                    <h2 className="text-xl font-semibold">{server.name}</h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    {server.owner._id === user.id ? 'Propriétaire' : 'Modérateur'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;