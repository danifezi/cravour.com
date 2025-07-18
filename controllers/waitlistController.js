const firebaseService = require('../services/firebaseService');

const joinWaitlist = async (req, res, next) => {
    try {
        const { email } = req.body;
        await firebaseService.saveToWaitlist(email);
        res.status(201).json({ 
            message: "Successfully added to the waitlist.", 
        });
    } catch (error) {
        // Handle potential duplicate email submissions gracefully if needed,
        // but Firestore's set() with a specific ID handles this implicitly.
        if (error.code === 'ALREADY_EXISTS') {
             return res.status(200).json({ message: 'This email is already on the waitlist.' });
        }
        next(error);
    }
};

module.exports = {
    joinWaitlist,
};
