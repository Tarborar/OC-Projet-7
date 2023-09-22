const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
    windowMs: 1 * 60 * 1000, //1 minute
    max: 6, //6 requêtes par minute
    handler: function (req, res, next) {
        return res.status(429).json({ error: 'Vous avez envoyé trop de requêtes, attendez une minute' })
    }
});