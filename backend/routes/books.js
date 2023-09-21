const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const router= express.Router();

const booksCtrl = require('../controllers/books');

//Toutes les routes ont besoin d'être authentifiées par auth == userId

router.post('/', auth, multer, booksCtrl.createBook);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/:id', auth, booksCtrl.getOneBook);
router.get('/', auth, booksCtrl.getAllBook);

module.exports = router;