const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json()); //intercepte toutes les requêtes qui ont un content-type json

//CORS -> Contrôle les requêtes HTTP
app.use((req, res, next) => {
    //autorise tout le monde à faire des requêtes sur le serveur
    res.setHeader('Access-Control-Allow-Origin', '*');

    //Spécifie quels requêtes peuvent être inclus
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); 

    //méthodes HTTP autorisées
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); 
    next();
});

//détermine la route pour les middlewares
app.use('/api/books', booksRoutes); 
app.use('/api/auth', userRoutes); 
app.use('/images', express.static(path.join(__dirname, 'images'))); //ajoute une route sur le disque pour les fichiers statiques 

module.exports = app;