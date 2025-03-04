const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Server = require('../models/Server');
const config = require('../config/config');

// URL de l'API Discord
const DISCORD_API = 'https://discord.com/api/v10';

// Fonction pour échanger le code contre un token
const exchangeCode = async (code) => {
  const params = new URLSearchParams({
    client_id: config.DISCORD_CLIENT_ID,
    client_secret: config.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.DISCORD_REDIRECT_URI,
    scope: 'identify email guilds'
  });

  const response = await axios.post(`${DISCORD_API}/oauth2/token`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return response.data;
};

// Fonction pour récupérer les informations de l'utilisateur Discord
const getUserInfo = async (accessToken) => {
  const response = await axios.get(`${DISCORD_API}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data;
};

// Fonction pour récupérer les serveurs de l'utilisateur Discord
const getUserGuilds = async (accessToken) => {
  const response = await axios.get(`${DISCORD_API}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data;
};

// Login avec Discord
exports.discordLogin = async (req, res) => {
  const { code } = req.body;

  try {
    // Échanger le code contre un token
    const tokenData = await exchangeCode(code);
    const { access_token } = tokenData;

    // Récupérer les informations de l'utilisateur
    const userInfo = await getUserInfo(access_token);

    // Récupérer les serveurs de l'utilisateur
    const userGuilds = await getUserGuilds(access_token);

    // Filtrer les serveurs où l'utilisateur a des droits d'administrateur
    const adminGuilds = userGuilds.filter(guild => (guild.permissions & 0x8) === 0x8);

    // Vérifier si l'utilisateur existe déjà dans la base de données
    let user = await User.findOne({ discordId: userInfo.id });

    if (!user) {
      // Créer un nouvel utilisateur
      user = new User({
        discordId: userInfo.id,
        username: userInfo.username,
        avatar: userInfo.avatar ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png` : null,
        email: userInfo.email
      });

      await user.save();
    } else {
      // Mettre à jour les informations de l'utilisateur
      user.username = userInfo.username;
      user.avatar = userInfo.avatar ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png` : null;
      user.email = userInfo.email;
      
      await user.save();
    }

    // Créer ou mettre à jour les serveurs
    for (const guild of adminGuilds) {
      let server = await Server.findOne({ discordId: guild.id });

      if (!server) {
        server = new Server({
          discordId: guild.id,
          name: guild.name,
          icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
          owner: user._id
        });

        await server.save();

        // Ajouter le serveur à l'utilisateur
        user.servers.push(server._id);
        await user.save();
      }
    }

    // Créer un token JWT
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Discord login error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la connexion avec Discord'
    });
  }
};

// Vérifier l'authentification
exports.checkAuth = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Non autorisé, pas de token'
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }
};