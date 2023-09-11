const express = require("express");
const ExpressError = require("../models/error.js");
const router = new express.Router();
const Ingredient = require("../models/ingredients.js");
const { isLoggedIn } = require("../middleware/auth.js");

/**
 * "/"
 * route type: GET
 * Authorization: logged in
 * Returns ingredients.
 */
router.get("/", isLoggedIn, async (req, res, next) => {
    try {
        const { name = false } = req.query;
        const ingrds = await Ingredient.getIngrs(name);
        return res.status(200).json(ingrds);
    } catch (err) {
        return next(err);
    }
});


module.exports = router;