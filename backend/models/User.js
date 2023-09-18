const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true }, //unique rend impossible l'inscription de plusieurs même email
    password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator); // plugin() vérifie si email existe déjà dans la base de donnée 

module.exports = mongoose.model('User', userSchema);