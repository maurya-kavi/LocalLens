const express = require('express');
const { recordContact } = require('../controllers/activityController');
const { optionalAuthenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/contact', optionalAuthenticate, recordContact);

module.exports = router;
