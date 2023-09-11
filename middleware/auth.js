const SECRET_KEY = require("../keys.js");
const ExpressError = require("../models/error.js");

const {
    validateSchema, hashPassword, generateToken,
    decodeToken, verifyPassword
} = require("../helpers/users.js");

/**
 * authenticateToken
 * Authorizes.
 * Searches for a token.
 * Places token on response object.
 */
function authenticateToken(req, res, next) {
    try {
        const reqHeader = req.headers._token;
        const reqToken = reqHeader ? reqHeader.replace("Bearer ", "") : null;
        if (reqToken) {
            const payload = decodeToken(reqToken, SECRET_KEY)
            res.user = [ payload ];
        }
        else res.user = [];
        return next();
    } catch(err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * isLoggedIn
 * Authorizes user.
 * Searches for the user object
 * to authorize.
 */
function isLoggedIn(req, res, next) {
    try {
        const payload = res.user;
        // console.log(payload);
        if (!payload.length) {
            const error = new ExpressError(400, "Must be logged in");
            return next(error);
        }
        else return next();
    } catch(err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * isCurrUser
 * Authorizes a user.
 * Searches for user object,
 * and compares a username to userUsername,
 * or user id to userId.
 */
function isCurrUser(req, res, next) {
    try {
        const payload = res.user[0] || [];
        // Destructures different payload username key names.
        // For my app, a token's payload will have either
        // username or userUsername key for username props.
        // User.register and User.login create the payloads
        // these keys are set on.
        const {
            username: usrName = false, userUsername: user = false,
            userId = false, id: userId2 = false
        } = payload;
        // Destructures params.
        const { username = false, id = false, user_id = false } = req.params;
        if (usrName) if (usrName === username) return next();
        if (user) if (user === username) return next();
        if (userId) if (userId === +id) return next();
        if (userId) if (userId === +user_id) return next();
        if (userId2) if (userId2 === +id) return next();
        if (userId2) if (userId2 === +user_id) return next();
        const error = new ExpressError(400, "Must be current user!");
        return next(error);
    } catch(err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * isBodyCurrUser
 * Authorizes a user.
 * Searches for user object,
 * and compares a sent user id to the payload id.
 */
function isBodyCurrUser(req, res, next) {
    try {
        const payload = res.user[0] || [];
        // Destructures different payload key names.
        const { userId = false } = payload;
        // Destructures request body.
        const { user_id = false } = req.body;
        if (userId && user_id === userId) return next();
        else {
            const error = new ExpressError(400, "Must be current user!");
            return next(error);
        }
    } catch(err) {
        throw new ExpressError(400, `${err}`);
    }
}

module.exports = {
    authenticateToken, isLoggedIn,
    isCurrUser, isBodyCurrUser
};