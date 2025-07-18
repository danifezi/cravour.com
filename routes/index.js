const express = require('express');
const router = express.Router();

const planRoutes = require('./planRoutes');
const waitlistRoutes = require('./waitlistRoutes');

router.use('/plans', planRoutes);
router.use('/waitlist', waitlistRoutes);

module.exports = router;
