const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Server = require('../models/Server');

// Créer un nouveau ticket
exports.createTicket = async (req, res) => {
  try {
    const { userId, serverId, category, initialMessage } = req.body;

    // Vérifier si l'utilisateur et le serveur existent
    const user = await User.findById(userId);
    const server = await Server.findById(serverId);

    if (!user || !server) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur ou serveur non trouvé'
      });
    }

    // Créer le ticket
    const ticket = new Ticket({
      user: userId,
      server: serverId,
      category: category || 'General',
      messages: [{
        content: initialMessage,
        sender: userId
      }]
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la création du ticket'
    });
  }
};

// Récupérer tous les tickets d'un serveur
exports.getServerTickets = async (req, res) => {
  try {
    const { serverId } = req.params;
    const { status } = req.query;

    // Vérifier si l'utilisateur a accès au serveur
    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Serveur non trouvé'
      });
    }

    if (
      server.owner.toString() !== req.user.id &&
      !server.moderators.some(mod => mod.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à ce serveur'
      });
    }

    // Construire la requête
    const query = { server: serverId };
    
    if (status) {
      query.status = status;
    }

    // Récupérer les tickets
    const tickets = await Ticket.find(query)
      .populate('user', 'discordId username avatar')
      .populate('assignedTo', 'discordId username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Get server tickets error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la récupération des tickets'
    });
  }
};

// Récupérer un ticket par son ID
exports.getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId)
      .populate('user', 'discordId username avatar')
      .populate('assignedTo', 'discordId username avatar')
      .populate('messages.sender', 'discordId username avatar');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket non trouvé'
      });
    }

    // Vérifier si l'utilisateur a accès au ticket
    const server = await Server.findById(ticket.server);

    if (
      server.owner.toString() !== req.user.id &&
      !server.moderators.some(mod => mod.toString() === req.user.id) &&
      ticket.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à ce ticket'
      });
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la récupération du ticket'
    });
  }
};

// Ajouter un message à un ticket
exports.addMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { content, attachments } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket non trouvé'
      });
    }

    // Vérifier si l'utilisateur a accès au ticket
    const server = await Server.findById(ticket.server);

    if (
      server.owner.toString() !== req.user.id &&
      !server.moderators.some(mod => mod.toString() === req.user.id) &&
      ticket.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à ce ticket'
      });
    }

    // Vérifier si le ticket est fermé
    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        error: 'Impossible d\'ajouter un message à un ticket fermé'
      });
    }

    // Ajouter le message
    ticket.messages.push({
      content,
      sender: req.user.id,
      attachments: attachments || []
    });

    await ticket.save();

    // Récupérer le ticket mis à jour avec les informations des utilisateurs
    const updatedTicket = await Ticket.findById(ticketId)
      .populate('user', 'discordId username avatar')
      .populate('assignedTo', 'discordId username avatar')
      .populate('messages.sender', 'discordId username avatar');

    res.status(200).json({
      success: true,
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de l\'ajout du message'
    });
  }
};

exports.assignTicket = async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { moderatorId } = req.body;
  
      const ticket = await Ticket.findById(ticketId);
  
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket non trouvé'
        });
      }
  
      // Vérifier si l'utilisateur a accès au ticket
      const server = await Server.findById(ticket.server);
  
      if (
        server.owner.toString() !== req.user.id &&
        !server.moderators.some(mod => mod.toString() === req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à ce ticket'
        });
      }
  
      // Vérifier si le modérateur existe et a accès au serveur
      const moderator = await User.findById(moderatorId);
  
      if (!moderator) {
        return res.status(404).json({
          success: false,
          error: 'Modérateur non trouvé'
        });
      }
  
      if (
        server.owner.toString() !== moderatorId &&
        !server.moderators.some(mod => mod.toString() === moderatorId)
      ) {
        return res.status(403).json({
          success: false,
          error: 'L\'utilisateur sélectionné n\'est pas un modérateur de ce serveur'
        });
      }
  
      // Assigner le ticket
      ticket.assignedTo = moderatorId;
      await ticket.save();
  
      // Récupérer le ticket mis à jour
      const updatedTicket = await Ticket.findById(ticketId)
        .populate('user', 'discordId username avatar')
        .populate('assignedTo', 'discordId username avatar');
  
      res.status(200).json({
        success: true,
        ticket: updatedTicket
      });
    } catch (error) {
      console.error('Assign ticket error:', error);
      res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de l\'assignation du ticket'
      });
    }
  };
  
  // Modifier la catégorie d'un ticket
  exports.updateTicketCategory = async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { category } = req.body;
  
      const ticket = await Ticket.findById(ticketId);
  
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket non trouvé'
        });
      }
  
      // Vérifier si l'utilisateur a accès au ticket
      const server = await Server.findById(ticket.server);
  
      if (
        server.owner.toString() !== req.user.id &&
        !server.moderators.some(mod => mod.toString() === req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à ce ticket'
        });
      }
  
      // Vérifier si la catégorie existe
      const categoryExists = server.ticketCategories.some(cat => cat.name === category);
  
      if (!categoryExists && category !== 'General') {
        return res.status(404).json({
          success: false,
          error: 'Catégorie non trouvée'
        });
      }
  
      // Mettre à jour la catégorie
      ticket.category = category;
      await ticket.save();
  
      res.status(200).json({
        success: true,
        ticket
      });
    } catch (error) {
      console.error('Update ticket category error:', error);
      res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de la mise à jour de la catégorie'
      });
    }
  };
  
  // Fermer un ticket
  exports.closeTicket = async (req, res) => {
    try {
      const { ticketId } = req.params;
  
      const ticket = await Ticket.findById(ticketId);
  
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket non trouvé'
        });
      }
  
      // Vérifier si l'utilisateur a accès au ticket
      const server = await Server.findById(ticket.server);
  
      if (
        server.owner.toString() !== req.user.id &&
        !server.moderators.some(mod => mod.toString() === req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à ce ticket'
        });
      }
  
      // Vérifier si le ticket est déjà fermé
      if (ticket.status === 'closed') {
        return res.status(400).json({
          success: false,
          error: 'Ce ticket est déjà fermé'
        });
      }
  
      // Fermer le ticket
      ticket.status = 'closed';
      ticket.closedAt = Date.now();
      ticket.closedBy = req.user.id;
  
      await ticket.save();
  
      res.status(200).json({
        success: true,
        ticket
      });
    } catch (error) {
      console.error('Close ticket error:', error);
      res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de la fermeture du ticket'
      });
    }
  };
  
  // Rouvrir un ticket
  exports.reopenTicket = async (req, res) => {
    try {
      const { ticketId } = req.params;
  
      const ticket = await Ticket.findById(ticketId);
  
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket non trouvé'
        });
      }
  
      // Vérifier si l'utilisateur a accès au ticket
      const server = await Server.findById(ticket.server);
  
      if (
        server.owner.toString() !== req.user.id &&
        !server.moderators.some(mod => mod.toString() === req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à ce ticket'
        });
      }
  
      // Vérifier si le ticket est déjà ouvert
      if (ticket.status === 'open') {
        return res.status(400).json({
          success: false,
          error: 'Ce ticket est déjà ouvert'
        });
      }
  
      // Rouvrir le ticket
      ticket.status = 'open';
      ticket.closedAt = null;
      ticket.closedBy = null;
  
      await ticket.save();
  
      res.status(200).json({
        success: true,
        ticket
      });
    } catch (error) {
      console.error('Reopen ticket error:', error);
      res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de la réouverture du ticket'
      });
    }
  };
  
  // Ajouter une note à un ticket
  exports.addTicketNote = async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { content } = req.body;
  
      const ticket = await Ticket.findById(ticketId);
  
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket non trouvé'
        });
      }
  
      // Vérifier si l'utilisateur a accès au ticket
      const server = await Server.findById(ticket.server);
  
      if (
        server.owner.toString() !== req.user.id &&
        !server.moderators.some(mod => mod.toString() === req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à ce ticket'
        });
      }
  
      // Ajouter la note
      ticket.notes.push({
        content,
        createdBy: req.user.id
      });
  
      await ticket.save();
  
      // Récupérer le ticket mis à jour avec les informations des utilisateurs
      const updatedTicket = await Ticket.findById(ticketId)
        .populate('user', 'discordId username avatar')
        .populate('assignedTo', 'discordId username avatar')
        .populate('notes.createdBy', 'discordId username avatar');
  
      res.status(200).json({
        success: true,
        ticket: updatedTicket
      });
    } catch (error) {
      console.error('Add ticket note error:', error);
      res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de l\'ajout de la note'
      });
    }
  };
  
  // Rechercher des tickets par utilisateur
  exports.searchTicketsByUser = async (req, res) => {
    try {
      const { serverId } = req.params;
      const { discordId } = req.query;
  
      // Vérifier si l'utilisateur a accès au serveur
      const server = await Server.findById(serverId);
  
      if (!server) {
        return res.status(404).json({
          success: false,
          error: 'Serveur non trouvé'
        });
      }
  
      if (
        server.owner.toString() !== req.user.id &&
        !server.moderators.some(mod => mod.toString() === req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à ce serveur'
        });
      }
  
      // Trouver l'utilisateur
      const user = await User.findOne({ discordId });
  
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }
  
      // Récupérer les tickets
      const tickets = await Ticket.find({ server: serverId, user: user._id })
        .populate('user', 'discordId username avatar')
        .populate('assignedTo', 'discordId username avatar')
        .sort({ createdAt: -1 });
  
      res.status(200).json({
        success: true,
        tickets
      });
    } catch (error) {
      console.error('Search tickets by user error:', error);
      res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de la recherche des tickets'
      });
    }
  };
  
  // Ajouter une note à un utilisateur
  exports.addUserNote = async (req, res) => {
    try {
      const { userId } = req.params;
      const { content } = req.body;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }
  
      // Ajouter la note
      user.notes.push({
        content,
        createdBy: req.user.id
      });
  
      await user.save();
  
      // Récupérer l'utilisateur mis à jour avec les informations des créateurs de notes
      const updatedUser = await User.findById(userId)
        .populate('notes.createdBy', 'discordId username avatar');
  
      res.status(200).json({
        success: true,
        user: updatedUser
      });
    } catch (error) {
      console.error('Add user note error:', error);
      res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de l\'ajout de la note'
      });
    }
  };