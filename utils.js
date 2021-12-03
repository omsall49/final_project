const crypto = require('crypto');
const User = require("./models/User");

const encryptPassword = (password) => {
    return crypto.createHash('sha512').update(password).digest('base64');
}

const setAuth = async (req, res, next) => {
    const authorization = req.headers.authorization;
    const [bearer, key] = authorization.split(' ');
    if (bearer !== 'Bearer')
        return res.send({error: 'Wrong Authorization'}).status(400);

    const user = await User.findOne({ key });

    if (!user)
        return res.send({error: 'Cannot find user'}).status(404);

    req.user = user;
    return next();
}
module.exports = {
    encryptPassword,
    setAuth,
}