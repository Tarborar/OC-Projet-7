const Book = require('../models/Book');


//Toutes les logiques de route

exports.createBook = (req, res, next) => {
    delete req.body._id; //retire l'id mis automatiquement par mongoDB
    const book = new Book({
        ...req.body //raccourci qui évite d'écrire tout le models userId: title: etc
    });
    book.save() //enregistre l'objet dans la base de donnée et retourne un promise
    .then(() => {
        console.log('requête post réussi : L\'objet a été enregistré');
        res.status(201).json({message: 'Objet enregistré'});
    })
    .catch(error => {
        console.log('requête post échoué : L\'objet n\'a pas été enregistré');
        res.status(400).json({error})
    });
}

exports.modifyBook = (req, res, next) => {
    Book.updateOne({ _id: req.params.id}, {...req.body, _id: req.params.id}) //compare l'id au paramètre de requête, le nouvel objet userId: title: ...etc
    .then(() => {
        console.log('requête put de Book.updateOne réussi : L\'objet a été modifié');
        res.status(200).json({message: 'Objet modifié'});
    })
    .catch(error => {
        console.log('requête put de Book.updateOne échoué : L\'objet n\'a pas été modifié');
        res.status(400).json({error});
    });
}

exports.deleteBook = (req, res, next) =>{
    Book.deleteOne({ _id: req.params.id })
    .then(() => {
        console.log('requête delete de Book.deleteOne réussi : L\'objet a été supprimé');
        res.status(200).json({message: 'Objet supprimé'}); //renvoie l'objet correspondant à l'id trouvé
    })
    .catch(error => {
        console.log('requête delete de Book.deleteOne échoué : L\'objet n\'a pas été supprimé');
        res.status(400).json({error});
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