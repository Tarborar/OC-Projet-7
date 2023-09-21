const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');


exports.signup = (req, res, next) =>{
    bcrypt.hash(req.body.password, 10) //corps de la requête + 10 tours de "salt"
    .then(hash => {
        console.log('requête post du hash réussi');
        const user = new User({
            email: req.body.email,
            password: hash //enregistre le hash pour ne pas stocker le mot de passe en brut
        });

        user.save()
        .then(() => {
            console.log('requête post du hash réussi : L\'utilisateur a été enregistré');
            res.status(201).json({message: 'Utilisateur enregistré'});
        })
        .catch(error => {
            console.log('requête post du hash échoué : L\'utilisateur n\'a pas été enregistré');
            res.status(500).json({error})
        });
    })
    .catch(error => {
        console.log('requête post échoué : L\'utilisateur n\'a pas été enregistré');
        res.status(500).json({error})
    });
};

exports.login = (req, res, next) =>{
    User.findOne({ email: req.body.email }) //corps des email existants
    .then(user => {
        console.log('requête post de User.findOne réussi : L\'utilisateur a été trouvé');

        if (!user){ //compare si l'utilisateur existe
            return res.status(401).json({ message: 'Incorrect' })
        } 

        bcrypt.compare(req.body.password, user.password) //envoie du password du client, ce qui est stocké dans la base de donnée
        .then(valid => {
            console.log('bcrypt compare réussi');
            if(!valid){
                console.log('Mot de passe entré par l\'utilisateur ne correspond pas à cet email');
                return res.status(401).json({message: 'Incorrect'});
            } 

            console.log('Mot de passe entré par l\'utilisateur correspond à cet email');
            res.status(200).json({ //retourne l'objet qui contient les informations pour l'authentification
                userId: user._id,
                token: jwt.sign( //chiffre les objets suivant pour en créer un token
                    {userId: user._id},
                    'RANDOM_TOKEN_SECRET',
                    {expiresIn: '24h'} //stock le token 24h
                ) 
            });  
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({error})
        });
    })
    .catch(error => {
        console.log('requête post de User.findOne échoué : L\'utilisateur n\'a pas été trouvé');
        res.status(500).json({error});
    });
};

