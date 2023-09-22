const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book); //Objet envoyé sous forme JSON en chaîne de caractère -> parse transforme chaîne de caractère en objet
    delete bookObject.id; //retire l'id mis automatiquement par mongoDB
    delete bookObject._userId; //on préfère utiliser l'id du token que l'userId
    const book = new Book({
        ...bookObject, //raccourci qui évite d'écrire tout le models userId: title: etc
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized-${req.file.filename.replace(/\.[^.]*$/, '')}.webp`, //génère url de l'image -> http :// localhost:3000 /images/ resized-file_name .webp
        ratings: { //crée l'objet ratings en sauvegardant le userId et sa note donnée
            userId: req.auth.userId,
            grade: bookObject.ratings[0].grade
        },

        averageRating: bookObject.ratings[0].grade //définie la note moyenne qui est = à la note qui vient d'etre donnée (c'est le premier à noter le livre)
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
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized-${req.file.filename.replace(/\.[^.]*$/, '')}.webp` //génère url de l'image -> http :// localhost:3000 /images/ resized-file_name .webp
    } : { ...req.body };

    delete bookObject._userId; //évite qu'on asigne l'objet à un autre utilisateur

    Book.findOne({_id: req.params.id}) //Récupère l'objet dans la base de donnée
    .then((book) => {
        if (book.userId != req.auth.userId){ //Vérifie si l'utilisateur qui modifie correspond bien à celui qui l'a créé
            res.status(401).json({message: 'Non-autorisé'});
        } else {
            if (req.file) {
                //S'il y a une nouvelle image, on supprime (unlink) et remplace (updateOne) l'ancienne
                const oldImg = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${oldImg}`, () => {
                    Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: "Livre modifié!" }))
                        .catch(error => res.status(400).json({ error }));
                });
            } else {
                //S'il n'y a pas de nouvelle image, on met à jour les infos du livres
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Livre modifié!" }))
                    .catch(error => res.status(400).json({ error }));
            };
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

exports.getBestRate = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3) //range par ordre décroissant.nombre de résultat à 3
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.rateBook = (req, res) => {
    Book.findOne({ _id: req.params.id }) //compare l'id au paramètre de requête
        .then(book => {
            if (book.ratings.includes(rating => rating.userId == req.auth.userId)) {//vérifie si l'utilisateur a déjà noté le livre
                res.status(404).json({ message: 'Vous avez déja noté ce livre' });
            } else if (1 > req.body.rating > 5) { // vérifie que la note soit comprise entre 1 et 5
                res.status(404).json({ message: 'La note soit être comprise entre 1 et 5' });
            } else {
                book.ratings.push({ //push userId et grade dans le tableau ratings de l'objet book
                    userId: req.auth.userId,
                    grade: req.body.rating
                });
                let sumGrades = 0 //somme des notes du tableau ratings
                for (let i = 0; i < book.ratings.length; i++) {
                    let indexGrade = book.ratings[i].grade; //récupère chaque grade
                    sumGrades += indexGrade; //ajoute à la somme des notes
                }
                book.averageRating = Math.round((sumGrades / book.ratings.length) * 100) / 100; //moyenne: somme/nombre de notes à l'arrondi
                return book.save();
            }
        })
        .then((book) => { res.status(200).json(book); })
        .catch((error) => { res.status(404).json({ error: error }); });
};