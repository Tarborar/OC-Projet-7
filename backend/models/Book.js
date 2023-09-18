const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true }, //required => nécessaire pour créer un objet dans la bdd
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [{
        userId: { type: String, required: true },
        grade: { type: Number, required: true }
    }],
    averageRating: { type: Number, required: true }
});

module.exports = mongoose.model('Book', bookSchema);