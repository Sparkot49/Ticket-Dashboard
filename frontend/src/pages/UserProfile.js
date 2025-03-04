import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config/constants';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Spinner from '../components/Spinner';

const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [note, setNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/${userId}`);
        
        if (response.data.success) {
          setUserData(response.data.user);
          setTicketHistory(response.data.ticketHistory);
        } else {
          setError(response.data.error || 'Erreur lors de la récupération des données utilisateur');
        }
      } catch (error) {
        console.error('Fetch user data error:', error);
        setError(error.response?.data?.error || 'Erreur lors de la récupération des données utilisateur');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Ajouter une note à l'utilisateur
  const handleAddNote = async (e) => {
    e.preventDefault();
    
    if (!note.trim()) {
      return;
    }
    
    try {
      setIsAddingNote(true);
      
      const response = await axios.post(`${API_URL}/api/users/${userId}/notes`, {
        content: note
      });
      
      if (response.data.success) {
        setUserData(response.data.user);
        setNote('');
        toast.success('Note ajoutée avec succès');
      } else {
        toast.error(response.data.error || 'Erreur lors de l\'ajout de la note');
      }
    } catch (error) {
      console.error('Add user note error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout de la note');
    } finally {
      setIsAddingNote(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Utilisateur non trouvé'}
          </div>
          <Link to="/" className="text-indigo-600 hover:text-indigo-900">
            Retour au dashboard
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="text-indigo-600 hover:text-indigo-900">
            &larr; Retour au dashboard
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            {userData.avatar ? (
              <img src={userData.avatar} alt={userData.username} className="w-16 h-16 rounded-full mr-4" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-4">
                {userData.username.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{userData.username}</h1>
              <p className="text-gray-500">ID Discord: {userData.discordId}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Historique des tickets */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Historique des tickets</h2>
            
            {ticketHistory.length === 0 ? (
              <p className="text-gray-500">Aucun ticket ouvert par cet utilisateur.</p>
            ) : (
              <div className="space-y-3">
                {ticketHistory.map(ticket => (
                  <Link
                    key={ticket._id}
                    to={`/ticket/${ticket._id}`}
                    className="block p-3 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          Serveur: {ticket.server.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(ticket.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {ticket.category}
                        </span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ticket.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {ticket.status === 'open' ? 'Ouvert' : 'Fermé'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Notes utilisateur */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notes sur l'utilisateur</h2>
            
            <div className="space-y-3 mb-4">
              {userData.notes && userData.notes.length > 0 ? (
                userData.notes.map((note, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded">
                    <div className="flex items-center mb-1">
                      {note.createdBy.avatar ? (
                        <img src={note.createdBy.avatar} alt={note.createdBy.username} className="w-6 h-6 rounded-full mr-2" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-2">
                          {note.createdBy.username.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-sm">{note.createdBy.username}</span>
                      <span className="text-gray-500 text-xs ml-2">
                        {format(new Date(note.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Aucune note pour cet utilisateur.</p>
              )}
            </div>
            
            <form onSubmit={handleAddNote}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mb-2"
                rows="3"
                placeholder="Ajouter une note sur cet utilisateur..."
                disabled={isAddingNote}
              ></textarea>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
                disabled={isAddingNote || !note.trim()}
              >
                {isAddingNote ? 'Ajout...' : 'Ajouter une note'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;