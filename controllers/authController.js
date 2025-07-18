
const firebaseService = require('../services/firebaseService');

const registerUser = async (req, res, next) => {
    try {
        const { uid, email } = req.user; // Comes from authMiddleware
        const { profile } = req.body;
        
        await firebaseService.createUserProfile(uid, email, profile);
        
        res.status(201).json({ 
            message: "User registered successfully.", 
            user: { id: uid, email: email } 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
};
