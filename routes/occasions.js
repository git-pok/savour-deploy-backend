const express = require("express");
const ExpressError = require("../models/error.js");
const router = new express.Router();
const Occasion = require("../models/occasions.js");
const { isLoggedIn } = require("../middleware/auth.js");

/**
 * "/"
 * route type: GET
 * Authorization: logged in
 * Returns occasions.
 */
router.get("/", isLoggedIn, async (req, res, next) => {
    try {
        const occasions = await Occasion.getOccasions();
        return res.status(200).json(occasions);
    } catch (err) {
        return next(err);
    }
});


module.exports = router;