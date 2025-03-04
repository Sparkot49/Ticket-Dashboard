const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

module.exports = async (req, res, next) => {
  try {
    // Vérifier si le token est présent
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Non autorisé, pas de token'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Récupérer l'utilisateur
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }
};