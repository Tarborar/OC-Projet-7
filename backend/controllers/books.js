const Book = require('../models/Book');
const fs = require('fs');

//Toutes les logiques de route

// exports.createBook = (req, res, next) => {

//     //on convertit le JSON en objet pour le manipuler dans bookObject

//     const bookObject = JSON.parse(req.body.book);

//     // //on supprime l'id généré automatiquement pas mongoDB

//     console.log(bookObject);

//     delete bookObject._id;

//     //on supprime le userId pour des raisons de sécurité et pour éviter toute manipulation non autorisée de cette information lors de la modification du livre

//     delete bookObject._userId;

 

//     //on crée une nouvelle instance du modele Book

//     const book = new Book({
//         //on récupère toutes les propriétés
//         ...bookObject,
//         //on récupère le userId de l'utilisateur authentifié
//         userId: req.auth.userId,
//         //on crée l'url de l'image uplodé
//         imageUrl: `${req.protocol}://${req.get('host')}/images/resized-${req.file.filename.replace(/\.[^.]*$/, '')}.webp`,
//         //on crée l'objet ratings en sauvegardant le userId et sa note donnée
//         ratings: {

//             userId: req.auth.userId,

//             grade: bookObject.ratings[0].grade
            
//         },
//         //on définie la note moyenne qui est = à la note qui vient d'etre donnée (c'est le premier à noter le livre)
//         averageRating: bookObject.ratings[0].grade
//     });

//     //on enregistre le nouveau book

//     book.save()

//         .then(() => res.status(201).json({ message: "Livre enregistré !" }))

//         .catch(error => res.status(400).json({ error }));

// };


exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book); //Objet envoyé sous forme JSON en chaîne de caractère -> parse transforme chaîne de caractère en objet
    delete bookObject.id; //retire l'id mis automatiquement par mongoDB
    delete bookObject._userId; //on préfère utiliser l'id du token que l'userId
    const book = new Book({
        ...bookObject, //raccourci qui évite d'écrire tout le models userId: title: etc
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //génère url de l'image -> http :// localhost:3000 /images/ file_name
    });

    book.save() //enregistre l'objet dans la base de donnée et retourne un promise
    .then(() => {
        console.log('requête post réussi : L\'objet a été enregistré');
        res.status(201).json({message: 'Objet enregistré'});
    })
    .catch(error => {
        console.log('requête post échoué : L\'objet n\'a pas été enregistré');
        console.log(error);
        res.status(400).json({error})
    });
}

exports.modifyBook = (req, res, next) => {
    //format de la requête n'est pas le même s'il y a un fichier ou non
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //génère url de l'image -> http :// localhost:3000 /images/ file_name
    } : { ...req.body };

    delete bookObject._userId; //évite qu'on asigne l'objet à un autre utilisateur

    Book.findOne({_id: req.params.id}) //Récupère l'objet dans la base de donnée
    .then((book) => {
        if (book.userId != req.auth.userId){ //Vérifie si l'utilisateur qui modifie correspond bien à celui qui l'a créé
            res.status(401).json({message: 'Non-autorisé'});
        } else{
            Book.updateOne({ _id: req.params.id}, {...bookObject, _id: req.params.id}) //compare l'id au paramètre de requête, le nouvel objet userId: title: ...etc
            .then(() => {
                console.log('requête put de Book.updateOne réussi : L\'objet a été modifié');
                res.status(200).json({message: 'Objet modifié'});
            })
            .catch(error => {
                console.log('requête put de Book.updateOne échoué : L\'objet n\'a pas été modifié');
                res.status(400).json({error});
            });
        }    
    })
    .catch((error) => {
        res.status(400).json({error});
    });
}

exports.deleteBook = (req, res, next) =>{
    Book.findOne({_id: req.params.id}) //Récupère l'objet dans la base de donnée
    .then((book) => {
        if (book.userId != req.auth.userId){ //Vérifie si l'utilisateur qui supprime correspond bien à celui qui l'a créé
            res.status(401).json({message: 'Non-autorisé'});
        } else { // doit supprimer l'objet et l'image
            const filename = book.imageUrl.split('/images/')[1]; //récupère l'url du fichier pour recréer un chemin

            fs.unlink(`images/${filename}`, () => { //suppression
                Book.deleteOne({ _id: req.params.id }) 
                .then(() => {
                    console.log('requête delete de Book.deleteOne réussi : L\'objet a été supprimé');
                    res.status(200).json({message: 'Objet supprimé'}); //renvoie l'objet correspondant à l'id trouvé
                })
                .catch(error => {
                    console.log('requête delete de Book.deleteOne échoué : L\'objet n\'a pas été supprimé');
                    res.status(400).json({error});
                });
            });
        }    
    })
    .catch(error => {
        res.status(500).json({error});
    });
}

exports.getOneBook = (req, res, next) =>{
    Book.findOne({ _id: req.params.id}) //compare l'id au paramètre de requête
    .then(book => {
        console.log('requête get de Book.findOne réussi : L\'objet a été trouvé');
        res.status(200).json(book); //renvoie l'objet correspondant à l'id trouvé
    })
    .catch(error => {
        console.log('requête get de Book.findOne échoué : L\'objet n\'a pas été trouvé');
        res.status(404).json({error});
    });
}

exports.getAllBook = (req, res, next) => {
    Book.find()
    .then(books => {
        console.log('requête get de Book.find réussi');
        res.status(200).json(books); //renvoie le tableau des books enregistrés
    })
    .catch(error => {
        console.log('requête get de Book.find échoué');
        res.status(400).json({error});
    });
}