const express = require('express');
const router = express.Router();
const Poster = require('../model/posterModel');
const multer = require('multer');
const asyncHandler = require('express-async-handler');
const uploadCloudinary = require('../middlewares/uploadMiddleware')


const posterController = require('../controllers/posterController');

// Routes for poster
router.get('/', asyncHandler(posterController.getAllPosters));
router.get('/:id', asyncHandler(posterController.getPosterById));
router.post('/',uploadCloudinary.uploadPosters.single('imageUrl'), asyncHandler(posterController.createPoster));
router.put('/:id',uploadCloudinary.uploadPosters.single('imageUrl'), asyncHandler(posterController.updatePoster));
router.delete('/:id', asyncHandler(posterController.deletePoster));

module.exports = router;