require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/config');

// Connexion à la base de données
connectDB();

// Démarrage du serveur
app.listen(config.PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
});