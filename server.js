const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const firebaseService = require('./services/firebaseService');
const errorMiddleware = require('./middleware/errorMiddleware');
const apiRoutes = require('./routes');

const app = express();

// --- INITIALIZATIONS & MIDDLEWARE ---
firebaseService.initializeFirebaseAdmin();

app.use(cors());
app.use(express.json());

// Serve the static files from the Webpack build directory
app.use(express.static(path.join(__dirname, 'dist')));

// --- API ROUTING ---
app.use('/api', apiRoutes);

// --- SERVE SPA & ERROR HANDLING ---
// For any other request, serve the index.html file for the SPA
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// Centralized error handler must be last
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cravour backend server running on http://localhost:${PORT}`));
