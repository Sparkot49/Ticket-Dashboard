const Server = require('../models/Server');
const User = require('../models/User');

// Récupérer tous les serveurs de l'utilisateur
exports.getUserServers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('servers');
    
    res.status(200).json({
      success: true,
      servers: user.servers
    });
  } catch (error) {
    console.error('Get user servers error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la récupération des serveurs'
    });
  }
};

// Récupérer un serveur par son ID
exports.getServerById = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id)
      .populate('owner', 'discordId username avatar')
      .populate('moderators', 'discordId username avatar');

    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Serveur non trouvé'
      });
    }

    // Vérifier si l'utilisateur a accès au serveur
    if (
      server.owner.toString() !== req.user.id &&
      !server.moderators.some(mod => mod._id.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à ce serveur'
      });
    }

    res.status(200).json({
      success: true,
      server
    });
  } catch (error) {
    console.error('Get server error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la récupération du serveur'
    });
  }
};

// Ajouter un modérateur au serveur
exports.addModerator = async (req, res) => {
  try {
    const { serverId, discordId } = req.body;

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Serveur non trouvé'
      });
    }

    // Vérifier si l'utilisateur est le propriétaire du serveur
    if (server.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Seul le propriétaire du serveur peut ajouter des modérateurs'
      });
    }

    // Trouver l'utilisateur à ajouter comme modérateur
    const userToAdd = await User.findOne({ discordId });

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'utilisateur est déjà modérateur
    if (server.moderators.includes(userToAdd._id)) {
      return res.status(400).json({
        success: false,
        error: 'Cet utilisateur est déjà modérateur sur ce serveur'
      });
    }

    // Ajouter l'utilisateur comme modérateur
    server.moderators.push(userToAdd._id);
    await server.save();

    res.status(200).json({
      success: true,
      message: 'Modérateur ajouté avec succès',
      server
    });
  } catch (error) {
    console.error('Add moderator error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de l\'ajout du modérateur'
    });
  }
};

// Supprimer un modérateur du serveur
exports.removeModerator = async (req, res) => {
  try {
    const { serverId, moderatorId } = req.params;

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Serveur non trouvé'
      });
    }

    // Vérifier si l'utilisateur est le propriétaire du serveur
    if (server.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Seul le propriétaire du serveur peut supprimer des modérateurs'
      });
    }

    // Supprimer le modérateur
    server.moderators = server.moderators.filter(
      mod => mod.toString() !== moderatorId
    );
    
    await server.save();

    res.status(200).json({
      success: true,
      message: 'Modérateur supprimé avec succès',
      server
    });
  } catch (error) {
    console.error('Remove moderator error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la suppression du modérateur'
    });
  }
};

// Ajouter une catégorie de ticket
exports.addTicketCategory = async (req, res) => {
  try {
    const { serverId, name, color } = req.body;

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Serveur non trouvé'
      });
    }

    // Vérifier si l'utilisateur est le propriétaire ou un modérateur du serveur
    if (
      server.owner.toString() !== req.user.id &&
      !server.moderators.some(mod => mod.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    // Ajouter la catégorie
    server.ticketCategories.push({ name, color });
    await server.save();

    res.status(200).json({
      success: true,
      message: 'Catégorie ajoutée avec succès',
      server
    });
  } catch (error) {
    console.error('Add ticket category error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de l\'ajout de la catégorie'
    });
  }
};

// Supprimer une catégorie de ticket
exports.removeTicketCategory = async (req, res) => {
  try {
    const { serverId, categoryId } = req.params;

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Serveur non trouvé'
      });
    }

    // Vérifier si l'utilisateur est le propriétaire ou un modérateur du serveur
    if (
      server.owner.toString() !== req.user.id &&
      !server.moderators.some(mod => mod.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    // Supprimer la catégorie
    server.ticketCategories = server.ticketCategories.filter(
      category => category._id.toString() !== categoryId
    );
    
    await server.save();

    res.status(200).json({
      success: true,
      message: 'Catégorie supprimée avec succès',
      server
    });
  } catch (error) {
    console.error('Remove ticket category error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la suppression de la catégorie'
    });
  }
};