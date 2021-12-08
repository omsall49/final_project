const crypto = require('crypto');
const User = require("./models/User");

const encryptPassword = (password) => {
    return crypto.createHash('sha512').update(password).digest('base64');
}

const setAuth = async (req, res, next) => {
    const authorization = req.headers.authorization;
    const [bearer, key] = authorization.split(' ');
    if (bearer !== 'Bearer') res.redirect('/login')

    const user = await User.findOne({ key });

    if (!user) res.redirect('/login')

    req.user = user;
    return next();
}
module.exports = {
    encryptPassword,
    setAuth,
}