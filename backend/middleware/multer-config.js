const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

//configure la logique pour savoir où enregistrer les fichiers entrants

const storage = multer.diskStorage({ //enregistre sur le disque
  destination: (req, file, callback) =>{
    callback(null, 'images') //enregistre dans le dossier images
  },
  filename: (req, file, callback) =>{
    const name = file.originalname.split(' ').join('_'); //nom d'origine + remplace tous les espaces par des _ pour éviter problème serveur
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension); //ajoute la date pour le rendre plus unique
  }
});

module.exports = multer({ storage }).single('image'); //fichier unique de type image