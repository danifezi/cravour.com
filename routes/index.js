
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const planRoutes = require('./planRoutes');
const transactionRoutes = require('./transactionRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const adRoutes = require('./adRoutes');
const paymentRoutes = require('./paymentRoutes');

router.use('/auth', authRoutes);
router.use('/plans', planRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ads', adRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
