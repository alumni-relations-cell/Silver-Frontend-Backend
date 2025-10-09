const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminAuthController = require('../controllers/adminAuthController');
const adminImageController = require('../controllers/adminImageController');

router.post('/seed', adminAuthController.seedAdmin); // run once then remove or protect
router.post('/login', adminAuthController.login);
router.post('/logout', adminAuthController.logout);

router.get('/cloudinary/sign', adminAuth, adminImageController.getCloudinarySignature);
router.post('/upload', adminAuth, adminImageController.uploadServer); // server-side
router.post('/images', adminAuth, adminImageController.createImageRecord);
router.get('/images', adminAuth, adminImageController.listImages);
router.delete('/images/:id', adminAuth, adminImageController.deleteImage);

module.exports = router;
