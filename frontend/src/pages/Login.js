import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI } from '../config/constants';
import Spinner from '../components/Spinner';

const Login = () => {
  const { user, loading, loginWithDiscord } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Rediriger vers le dashboard si déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Traiter le code de retour de Discord
  useEffect(() => {
    const handleDiscordCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      
      if (code) {
        const success = await loginWithDiscord(code);
        
        if (success) {
          navigate('/');
        }
      }
    };

    handleDiscordCallback();
  }, [location, loginWithDiscord, navigate]);

  // Générer l'URL d'authentification Discord
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email%20guilds`;

  // Rediriger vers Discord pour l'authentification
  const handleLogin = () => {
    window.location.href = discordAuthUrl;
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Discord Ticket Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connectez-vous avec votre compte Discord pour accéder au dashboard de tickets
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
            Se connecter avec Discord
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;