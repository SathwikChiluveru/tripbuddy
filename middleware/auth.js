const jwt = require('jsonwebtoken')

const authenticateUser = (req, res, next) =>{
    const token = req.header.authorization

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - Missing token' });
    }

    // Verify the token

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }
    
        // Attach the user information to the request for future use
        req.user = decoded;
        next();
    });
}

module.exports = authenticateUser