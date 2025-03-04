import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config/constants';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Spinner from '../components/Spinner';

const TicketView = () => {
  const { ticketId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [server, setServer] = useState(null);
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedModerator, setSelectedModerator] = useState('');
  const messagesEndRef = useRef(null);

  // Récupérer les données du ticket
  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const ticketResponse = await axios.get(`${API_URL}/api/tickets/${ticketId}`);
        
        if (ticketResponse.data.success) {
          setTicket(ticketResponse.data.ticket);
          
          // Récupérer les informations du serveur
          const serverResponse = await axios.get(`${API_URL}/api/servers/${ticketResponse.data.ticket.server}`);
          
          if (serverResponse.data.success) {
            setServer(serverResponse.data.server);
            setSelectedCategory(ticketResponse.data.ticket.category);
            setSelectedModerator(ticketResponse.data.ticket.assignedTo?._id || '');
          }
        } else {
          toast.error(ticketResponse.data.error || 'Erreur lors de la récupération du ticket');
          navigate('/');
        }
      } catch (error) {
        console.error('Fetch ticket error:', error);
        toast.error(error.response?.data?.error || 'Erreur lors de la récupération du ticket');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [ticketId, navigate]);

  // Faire défiler jusqu'au dernier message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.messages]);

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }
    
    try {
      setIsSending(true);
      
      const response = await axios.post(`${API_URL}/api/tickets/${ticketId}/message`, {
        content: message,
        attachments: [] // TODO: Gérer les pièces jointes
      });
      
      if (response.data.success) {
        setTicket(response.data.ticket);
        setMessage('');
      } else {
        toast.error(response.data.error || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  // Ajouter une note
  const handleAddNote = async (e) => {
    e.preventDefault();
    
    if (!note.trim()) {
      return;
    }
    
    try {
      setIsAddingNote(true);
      
      const response = await axios.post(`${API_URL}/api/tickets/${ticketId}/note`, {
        content: note
      });
      
      if (response.data.success) {
        setTicket(response.data.ticket);
        setNote('');
        toast.success('Note ajoutée avec succès');
      } else {
        toast.error(response.data.error || 'Erreur lors de l\'ajout de la note');
      }
    } catch (error) {
      console.error('Add note error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout de la note');
    } finally {
      setIsAddingNote(false);
    }
  };

  // Fermer le ticket
  const handleCloseTicket = async () => {
    try {
      const response = await axios.put(`${API_URL}/api/tickets/${ticketId}/close`);
      
      if (response.data.success) {
        setTicket({ ...ticket, status: 'closed' });
        toast.success('Ticket fermé avec succès');
      } else {
        toast.error(response.data.error || 'Erreur lors de la fermeture du ticket');
      }
    } catch (error) {
      console.error('Close ticket error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la fermeture du ticket');
    }
  };

  // Rouvrir le ticket
  const handleReopenTicket = async () => {
    try {
      const response = await axios.put(`${API_URL}/api/tickets/${ticketId}/reopen`);
      
      if (response.data.success) {
        setTicket({ ...ticket, status: 'open' });
        toast.success('Ticket rouvert avec succès');
      } else {
        toast.error(response.data.error || 'Erreur lors de la réouverture du ticket');
      }
    } catch (error) {
      console.error('Reopen ticket error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la réouverture du ticket');
    }
  };

  // Changer la catégorie
  const handleCategoryChange = async (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    
    try {
      const response = await axios.put(`${API_URL}/api/tickets/${ticketId}/category`, {
        category: newCategory
      });
      
      if (response.data.success) {
        setTicket({ ...ticket, category: newCategory });
        toast.success('Catégorie mise à jour avec succès');
      } else {
        toast.error(response.data.error || 'Erreur lors de la mise à jour de la catégorie');
      }
    } catch (error) {
      console.error('Update category error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour de la catégorie');
    }
  };

  // Assigner le ticket
  const handleAssignTicket = async (e) => {
    const moderatorId = e.target.value;
    setSelectedModerator(moderatorId);
    
    try {
      const response = await axios.put(`${API_URL}/api/tickets/${ticketId}/assign`, {
        moderatorId
      });
      
      if (response.data.success) {
        setTicket(response.data.ticket);
        toast.success('Ticket assigné avec succès');
      } else {
        toast.error(response.data.error || 'Erreur lors de l\'assignation du ticket');
      }
    } catch (error) {
      console.error('Assign ticket error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'assignation du ticket');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!ticket || !server) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Impossible de charger le ticket. Il a peut-être été supprimé ou vous n'avez pas les autorisations nécessaires.
          </div>
          <Link to="/" className="text-indigo-600 hover:text-indigo-900">
            Retour au dashboard
          </Link>
        </main>
      </div>
    );
  }

  // Vérifier si l'utilisateur est un modérateur ou le propriétaire du serveur
  const isModerator = server.owner._id === user.id || server.moderators.some(mod => mod._id === user.id);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row mb-6">
          <div className="md:w-2/3">
            <div className="flex items-center mb-2">
              <Link to={`/server/${server._id}`} className="text-indigo-600 hover:text-indigo-900 mr-2">
                &larr; Retour
              </Link>
              <h1 className="text-3xl font-bold">Ticket #{ticket._id.slice(-6)}</h1>
            </div>
            <div className="flex items-center space-x-3 mb-4">
              <Link to={`/user/${ticket.user._id}`} className="flex items-center">
                {ticket.user.avatar ? (
                  <img src={ticket.user.avatar} alt={ticket.user.username} className="w-8 h-8 rounded-full mr-2" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-2">
                    {ticket.user.username.charAt(0)}
                  </div>
                )}
                <span className="text-gray-700">{ticket.user.username}</span>
              </Link>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">
                {format(new Date(ticket.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
              </span>
              <span className="text-gray-500">•</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                ticket.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {ticket.status === 'open' ? 'Ouvert' : 'Fermé'}
              </span>
            </div>
          </div>
          
          {isModerator && (
            <div className="md:w-1/3 md:flex md:justify-end space-y-2 md:space-y-0 md:space-x-2 mb-4 md:mb-0">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="w-full md:w-auto bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                {showNotes ? 'Masquer les notes' : 'Afficher les notes'}
              </button>
              {ticket.status === 'open' ? (
                <button
                  onClick={handleCloseTicket}
                  className="w-full md:w-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Fermer le ticket
                </button>
              ) : (
                <button
                  onClick={handleReopenTicket}
                  className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Rouvrir le ticket
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Informations du ticket pour les modérateurs */}
        {isModerator && (
          <div className="bg-white shadow-md rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="block w-full border border-gray-300 rounded-md py-2 px-3"
                  disabled={ticket.status === 'closed'}
                >
                  <option value="General">General</option>
                  {server.ticketCategories.map(category => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigné à
                </label>
                <select
                  value={selectedModerator}
                  onChange={handleAssignTicket}
                  className="block w-full border border-gray-300 rounded-md py-2 px-3"
                  disabled={ticket.status === 'closed'}
                >
                  <option value="">Non assigné</option>
                  {[server.owner, ...server.moderators].map(mod => (
                    <option key={mod._id} value={mod._id}>
                      {mod.username} {mod._id === server.owner._id ? '(Propriétaire)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de l'utilisateur
                </label>
                <div className="flex items-center border border-gray-300 rounded-md py-2 px-3 bg-gray-50">
                  <span className="text-gray-500">{ticket.user.discordId}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Notes du ticket (visible uniquement pour les modérateurs) */}
        {isModerator && showNotes && (
          <div className="bg-yellow-50 shadow-md rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">Notes (visibles uniquement par l'équipe)</h2>
            
            <div className="space-y-3 mb-4">
              {ticket.notes && ticket.notes.length > 0 ? (
                ticket.notes.map((note, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-yellow-200">
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
                <p className="text-gray-500">Aucune note pour ce ticket.</p>
              )}
            </div>
            
            <form onSubmit={handleAddNote}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mb-2"
                rows="2"
                placeholder="Ajouter une note (visible uniquement par l'équipe)"
                disabled={isAddingNote || ticket.status === 'closed'}
              ></textarea>
              <button
                type="submit"
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-yellow-300"
                disabled={isAddingNote || !note.trim() || ticket.status === 'closed'}
              >
                {isAddingNote ? 'Ajout...' : 'Ajouter une note'}
              </button>
            </form>
          </div>
        )}
        
        {/* Conversation */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-4 h-96 overflow-y-auto">
            {ticket.messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${message.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3/4 ${message.sender._id === user.id ? 'bg-indigo-100' : 'bg-gray-100'} rounded-lg p-3`}>
                  <div className="flex items-center mb-1">
                    {message.sender.avatar ? (
                      <img src={message.sender.avatar} alt={message.sender.username} className="w-6 h-6 rounded-full mr-2" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-2">
                        {message.sender.username.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium text-sm">{message.sender.username}</span>
                    <span className="text-gray-500 text-xs ml-2">
                      {format(new Date(message.createdAt), 'HH:mm', { locale: fr })}
                    </span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Affichage des pièces jointes */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment, i) => (
                        
                          key={i}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-indigo-600 hover:text-indigo-900"
                        >
                          {attachment.filename || 'Pièce jointe'}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Formulaire de réponse */}
          {ticket.status === 'open' && (
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 mb-2"
                  rows="3"
                  placeholder="Répondre au ticket..."
                  disabled={isSending}
                ></textarea>
                <div className="flex justify-between">
                  <div>
                    {/* TODO: Ajouter un bouton pour les pièces jointes */}
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
                    disabled={isSending || !message.trim()}
                  >
                    {isSending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {ticket.status === 'closed' && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 text-center">
              <p className="text-gray-600">Ce ticket est fermé. {isModerator && 'Cliquez sur "Rouvrir le ticket" pour reprendre la conversation.'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TicketView;