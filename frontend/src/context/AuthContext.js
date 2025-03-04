import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';

// Création du contexte
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Configurer axios avec le token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Vérifier le token
        const response = await axios.get(`${API_URL}/api/auth/check`);
        
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          // Token invalide
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Token invalide
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setError('Session expirée. Veuillez vous reconnecter.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion avec Discord
  const loginWithDiscord = async (code) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/discord`, { code });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Sauvegarder le token
        localStorage.setItem('token', token);
        
        // Configurer axios avec le token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Mettre à jour l'état
        setUser(user);
        setError(null);
        
        return true;
      } else {
        setError(response.data.error || 'Échec de la connexion');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Échec de la connexion');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    // Supprimer le token
    localStorage.removeItem('token');
    
    // Supprimer le header d'autorisation
    delete axios.defaults.headers.common['Authorization'];
    
    // Réinitialiser l'état
    setUser(null);
  };

  // Valeurs à exposer dans le contexte
  const value = {
    user,
    loading,
    error,
    loginWithDiscord,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};