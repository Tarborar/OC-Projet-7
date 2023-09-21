const jwt = require('jsonwebtoken');

//Extrait userId du token chiffré pour l'exporter dans les routes
module.exports = (req, res, next) =>{
    try{
        const token = req.headers.authorization.split(' ')[1]
         //split Bearer ey... pour récupérer uniquement le TOKEN
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); //déchiffre le token
        const userId = decodedToken.userId; //récupère le userId déchiffré précédemment
        req.auth = {
            userId: userId
        };
        next();
    } catch(error) {
        console.log('Echec du déchiffrement du token');
        console.log(error);
        res.status(401).json({error});
    }
};