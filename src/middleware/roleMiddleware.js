const { sendResponse } = require('../utils/response');

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return sendResponse(res, 403, false, 'Akses dilarang untuk role ini');
        }
        next();
    };
};

module.exports = authorize;
