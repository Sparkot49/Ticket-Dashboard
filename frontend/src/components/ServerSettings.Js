import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { toast } from 'react-hot-toast';

const ServerSettings = ({ server, refreshServer }) => {
  const [moderatorId, setModeratorId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3B82F6');
  const [isAddingModerator, setIsAddingModerator] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Ajouter un modérateur
  const handleAddModerator = async (e) => {
    e.preventDefault();
    
    if (!moderatorId) {
      toast.error('Veuillez entrer un ID Discord');
      return;
    }
    
    try {
      setIsAddingModerator(true);
      
      const response = await axios.post(`${API_URL}/api/servers/moderator`, {
        serverId: server._id,
        discordId: moderatorId
      });
      
      if (response.data.success) {
        toast.success('Modérateur ajouté avec succès');
        setModeratorId('');
        refreshServer(response.data.server);
      } else {
        toast.error(response.data.error || 'Erreur lors de l\'ajout du modérateur');
      }
    } catch (error) {
      console.error('Add moderator error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout du modérateur');
    } finally {
      setIsAddingModerator(false);
    }
  };

  // Supprimer un modérateur
  const handleRemoveModerator = async (moderatorId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/servers/${server._id}/moderator/${moderatorId}`);
      
      if (response.data.success) {
        toast.success('Modérateur supprimé avec succès');
        refreshServer(response.data.server);
      } else {
        toast.error(response.data.error || 'Erreur lors de la suppression du modérateur');
      }
    } catch (error) {
      console.error('Remove moderator error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression du modérateur');
    }
  };

  // Ajouter une catégorie
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryName) {
      toast.error('Veuillez entrer un nom de catégorie');
      return;
    }
    
    try {
      setIsAddingCategory(true);
      
      const response = await axios.post(`${API_URL}/api/servers/category`, {
        serverId: server._id,
        name: categoryName,
        color: categoryColor
      });
      
      if (response.data.success) {
        toast.success('Catégorie ajoutée avec succès');
        setCategoryName('');
        refreshServer(response.data.server);
      } else {
        toast.error(response.data.error || 'Erreur lors de l\'ajout de la catégorie');
      }
    } catch (error) {
      console.error('Add category error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout de la catégorie');
    } finally {
      setIsAddingCategory(false);
    }
  };

  // Supprimer une catégorie
  const handleRemoveCategory = async (categoryId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/servers/${server._id}/category/${categoryId}`);
      
      if (response.data.success) {
        toast.success('Catégorie supprimée avec succès');
        refreshServer(response.data.server);
      } else {
        toast.error(response.data.error || 'Erreur lors de la suppression de la catégorie');
      }
    } catch (error) {
      console.error('Remove category error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression de la catégorie');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Paramètres du serveur</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gestion des modérateurs */}
        <div>
          <h3 className="text-lg font-medium mb-4">Modérateurs</h3>
          
          <form onSubmit={handleAddModerator} className="mb-4">
            <div className="flex">
              <input
                type="text"
                value={moderatorId}
                onChange={(e) => setModeratorId(e.target.value)}
                placeholder="ID Discord du modérateur"
                className="flex-1 border border-gray-300 rounded-l px-3 py-2"
                disabled={isAddingModerator}
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700 disabled:bg-indigo-400"
                disabled={isAddingModerator}
              >
                {isAddingModerator ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>
          
          <div className="space-y-2">
            {server.moderators.map(moderator => (
              <div key={moderator._id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center">
                  {moderator.avatar ? (
                    <img src={moderator.avatar} alt={moderator.username} className="w-8 h-8 rounded-full mr-2" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-2">
                      {moderator.username.charAt(0)}
                    </div>
                  )}
                  <span>{moderator.username}</span>
                </div>
                <button
                  onClick={() => handleRemoveModerator(moderator._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </div>
            ))}
            
            {server.moderators.length === 0 && (
              <p className="text-gray-500">Aucun modérateur ajouté pour le moment.</p>
            )}
          </div>
        </div>
        
        {/* Gestion des catégories */}
        <div>
          <h3 className="text-lg font-medium mb-4">Catégories de tickets</h3>
          
          <form onSubmit={handleAddCategory} className="mb-4">
            <div className="mb-3">
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nom de la catégorie"
                className="w-full border border-gray-300 rounded px-3 py-2"
                disabled={isAddingCategory}
              />
            </div>
            <div className="flex mb-3">
              <label className="mr-2 text-gray-700">Couleur:</label>
              <input
                type="color"
                value={categoryColor}
                onChange={(e) => setCategoryColor(e.target.value)}
                className="border border-gray-300 rounded"
                disabled={isAddingCategory}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
              disabled={isAddingCategory}
            >
              {isAddingCategory ? 'Ajout...' : 'Ajouter une catégorie'}
            </button>
          </form>
          
          <div className="space-y-2">
            {server.ticketCategories.map(category => (
              <div key={category._id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span>{category.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveCategory(category._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </div>
            ))}
            
            {server.ticketCategories.length === 0 && (
              <p className="text-gray-500">Aucune catégorie ajoutée pour le moment. La catégorie par défaut "General" sera utilisée.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerSettings;