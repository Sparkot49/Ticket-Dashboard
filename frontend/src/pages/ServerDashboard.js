import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Spinner from '../components/Spinner';
import TicketList from '../components/TicketList';
import ServerSettings from '../components/ServerSettings';

const ServerDashboard = () => {
  const { serverId } = useParams();
  const { user } = useContext(AuthContext);
  const [server, setServer] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('open');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        // Récupérer les informations du serveur
        const serverResponse = await axios.get(`${API_URL}/api/servers/${serverId}`);
        
        if (serverResponse.data.success) {
          setServer(serverResponse.data.server);
        } else {
          setError(serverResponse.data.error || 'Erreur lors de la récupération du serveur');
          return;
        }

        // Récupérer les tickets du serveur
        const ticketsResponse = await axios.get(`${API_URL}/api/tickets/server/${serverId}`, {
          params: { status: activeTab }
        });
        
        if (ticketsResponse.data.success) {
          setTickets(ticketsResponse.data.tickets);
        } else {
          setError(ticketsResponse.data.error || 'Erreur lors de la récupération des tickets');
        }
      } catch (error) {
        console.error('Fetch server data error:', error);
        setError(error.response?.data?.error || 'Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchServerData();
  }, [serverId, activeTab]);

  // Actualiser les tickets après un changement
  const refreshTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/tickets/server/${serverId}`, {
        params: { status: activeTab }
      });
      
      if (response.data.success) {
        setTickets(response.data.tickets);
      } else {
        setError(response.data.error || 'Erreur lors de la récupération des tickets');
      }
    } catch (error) {
      console.error('Refresh tickets error:', error);
      setError(error.response?.data?.error || 'Erreur lors de l\'actualisation des tickets');
    } finally {
      setLoading(false);
    }
  };

  // Rechercher des tickets par utilisateur Discord
  const searchUserTickets = async (discordId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/tickets/server/${serverId}/user`, {
        params: { discordId }
      });
      
      if (response.data.success) {
        setTickets(response.data.tickets);
        setActiveTab('search');
      } else {
        setError(response.data.error || 'Utilisateur non trouvé');
      }
    } catch (error) {
      console.error('Search user tickets error:', error);
      setError(error.response?.data?.error || 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !server) {
    return <Spinner />;
  }

  const isOwner = server?.owner._id === user.id;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {server && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                {server.icon ? (
                  <img src={server.icon} alt={server.name} className="w-12 h-12 rounded-full mr-4" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-4">
                    {server.name.charAt(0)}
                  </div>
                )}
                <h1 className="text-3xl font-bold">{server.name}</h1>
              </div>
              
              {isOwner && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  {showSettings ? 'Tickets' : 'Paramètres du serveur'}
                </button>
              )}
            </div>
            
            {showSettings && isOwner ? (
              <ServerSettings server={server} refreshServer={setServer} />
            ) : (
              <>
                <div className="flex mb-6">
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setActiveTab('open')}
                      className={`px-4 py-2 rounded ${
                        activeTab === 'open'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      Tickets ouverts
                    </button>
                    <button
                      onClick={() => setActiveTab('closed')}
                      className={`px-4 py-2 rounded ${
                        activeTab === 'closed'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      Tickets fermés
                    </button>
                  </div>
                  
                  <div className="ml-auto">
                    <input
                      type="text"
                      placeholder="Rechercher par ID Discord"
                      className="border border-gray-300 rounded px-3 py-2 mr-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          searchUserTickets(e.target.value);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        setActiveTab('open');
                        refreshTickets();
                      }}
                      className="bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
                
                <TicketList
                  tickets={tickets}
                  categories={server.ticketCategories}
                  moderators={[...server.moderators, server.owner]}
                  refreshTickets={refreshTickets}
                  serverId={serverId}
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ServerDashboard;