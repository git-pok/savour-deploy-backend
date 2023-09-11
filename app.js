const cors = require("cors");
const express = require("express");
const ExpressError = require("./models/error.js");
const userRoutes = require("./routes/users.js");
const recipeRoutes = require("./routes/recipes.js");
const ingrdtRoutes = require("./routes/ingredients.js");
const occsnRoutes = require("./routes/occasions.js");
const { authenticateToken } = require("./middleware/auth.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateToken);
app.use("/users", userRoutes);
app.use("/recipes", recipeRoutes);
app.use("/ingredients", ingrdtRoutes);
app.use("/occasions", occsnRoutes);

/**
 * "/"
 * Test route to verify request works.
 */
// app.get("/", (req, res) => {
//     return res.status(200).json({
//         msg: "HOME ROUTE!"
//     });
// });

/**
 * Bad Request Error Handler
 */
app.use((req, res, next) => {
    const err = new ExpressError(404, "Page not found!");
    return next(err);
})


/**
 * Error Handler
 */
app.use((err, req, res, next) => {
    const statusCode = err.status || 400;
    const msg = err.msg || err;
    return res.status(statusCode).json({
        error: {
            statusCode,
            message: msg
        }
    });
})

module.exports = app;