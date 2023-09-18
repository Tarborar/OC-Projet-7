const express = require('express');
const auth = require('../middleware/auth');
const router= express.Router();

const booksCtrl = require('../controllers/books');

//Toutes les routes ont besoin d'être authentifiées par auth == userId

router.post('/', auth, booksCtrl.createBook);
router.put('/:id', auth, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/:id', auth, booksCtrl.getOneBook);
router.get('/', auth, booksCtrl.getAllBook);

module.exports = router;