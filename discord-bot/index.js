require('dotenv').config();
const { Client, IntentsBitField, Events, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const config = require('../backend/config/config');
const User = require('../backend/models/User');
const Server = require('../backend/models/Server');
const Ticket = require('../backend/models/Ticket');

// Connexion à la base de données
mongoose.connect(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Initialisation du client Discord
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.MessageContent
  ]
});

// Événement de démarrage
client.once(Events.ClientReady, () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  
  // Définir l'activité du bot
  client.user.setPresence({
    activities: [{ name: 'vos tickets', type: ActivityType.Watching }],
    status: 'online',
  });
});

// Événement de réception de message privé
client.on(Events.MessageCreate, async message => {
  // Ignorer les messages du bot lui-même
  if (message.author.bot) return;

  // Traiter uniquement les messages privés
  if (!message.guild) {
    // Vérifier si c'est un nouveau ticket ou une réponse à un ticket existant
    try {
      // Rechercher des tickets ouverts pour cet utilisateur
      const discordUser = await User.findOne({ discordId: message.author.id });
      
      if (!discordUser) {
        // L'utilisateur n'est pas dans la base de données
        return message.reply("Vous devez d'abord vous connecter au dashboard pour pouvoir ouvrir un ticket.");
      }
      
      // Vérifier s'il y a un ticket ouvert
      const openTicket = await Ticket.findOne({ 
        user: discordUser._id, 
        status: 'open' 
      });

      if (openTicket) {
        // Ajouter le message au ticket existant
        openTicket.messages.push({
          content: message.content,
          sender: discordUser._id,
          attachments: message.attachments.map(a => ({
            url: a.url,
            filename: a.name
          }))
        });
        
        await openTicket.save();
        
        // Confirmer la réception
        message.reply("Votre message a été ajouté au ticket existant.");
      } else {
        // Demander à l'utilisateur pour quel serveur il souhaite ouvrir un ticket
        const userServers = await Server.find({
          discordId: { $in: client.guilds.cache.map(g => g.id) }
        });
        
        if (userServers.length === 0) {
          return message.reply("Je ne suis pas présent sur des serveurs où vous êtes également présent. Veuillez d'abord ajouter le bot à votre serveur.");
        }
        
        // Si l'utilisateur n'est que sur un serveur, ouvrir directement le ticket
        if (userServers.length === 1) {
          const newTicket = new Ticket({
            user: discordUser._id,
            server: userServers[0]._id,
            category: 'General',
            messages: [{
              content: message.content,
              sender: discordUser._id,
              attachments: message.attachments.map(a => ({
                url: a.url,
                filename: a.name
              }))
            }]
          });
          
          await newTicket.save();
          
          message.reply(`Votre ticket a été ouvert pour le serveur ${userServers[0].name}. Un modérateur vous répondra bientôt.`);
        } else {
          // TODO: Implémenter une sélection de serveur via des boutons Discord
          message.reply("Vous êtes présent sur plusieurs serveurs. Veuillez ouvrir votre ticket directement depuis le dashboard en précisant le serveur concerné.");
        }
      }
    } catch (error) {
      console.error('Ticket error:', error);
      message.reply("Une erreur est survenue lors du traitement de votre message. Veuillez réessayer plus tard.");
    }
  }
});

// Fonction pour envoyer un message à un utilisateur
async function sendDirectMessage(discordId, content) {
  try {
    const user = await client.users.fetch(discordId);
    await user.send(content);
    return true;
  } catch (error) {
    console.error('DM error:', error);
    return false;
  }
}

// Exporter cette fonction pour qu'elle soit utilisable par l'API
module.exports.sendDirectMessage = sendDirectMessage;

// Connexion du bot
client.login(config.DISCORD_BOT_TOKEN);