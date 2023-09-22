const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const resizeImg = require('../middleware/resize-img');
const router= express.Router();

const booksCtrl = require('../controllers/books');

//Toutes les routes ont besoin d'être authentifiées par auth == userId

router.get('/', booksCtrl.getAllBook);
router.get('/bestrating', booksCtrl.getBestRate);
router.post('/', auth, multer, resizeImg, booksCtrl.createBook);
router.get('/:id', booksCtrl.getOneBook);
router.put('/:id', auth, multer, resizeImg, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.post('/:id/rating', auth, booksCtrl.rateBook);

module.exports = router;