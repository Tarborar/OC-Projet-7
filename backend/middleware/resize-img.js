const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const resizeImg = (req, res, next) => {
    if(!req.file) { 
        next();
    } else {
    const filename = req.file.filename.replace(/\.[^.]*$/,''); //cherche le dernier . pour remplacer l'extension
    
    sharp(req.file.path)
     .resize(824, 1040, 'contain') // redimensionne l'image
     .webp({ quality: 90 }) // change en .webp avec une qualité de 90 
     .toFile(path.join('images',`resized-${filename}.webp`)) //réécrit la nouvelle image en la renommant avec "resized-" + l'extension .webp
     .then(() => {
        fs.unlink(req.file.path, () => { // enlève le chemin de l'image initialement uploadée
            req.file.path = path.join('images',`resized-${filename}.webp`); // pour le remplacer par celui de la nouvelle 
            next();
        });
    })
     .catch(err => res.status(400).json({err}))
    }
};

module.exports = resizeImg;