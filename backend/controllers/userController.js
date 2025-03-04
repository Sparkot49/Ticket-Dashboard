const User = require('../models/User');
const Ticket = require('../models/Ticket');

// Récupérer le profil de l'utilisateur connecté
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('servers');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la récupération du profil'
    });
  }
};

// Récupérer un utilisateur par son ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('discordId username avatar notes')
      .populate('notes.createdBy', 'discordId username avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Récupérer les tickets de l'utilisateur
    const tickets = await Ticket.find({ user: userId })
      .populate('server', 'name')
      .select('category status createdAt closedAt');

    res.status(200).json({
      success: true,
      user,
      ticketHistory: tickets
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la récupération de l\'utilisateur'
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