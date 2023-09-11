const express = require("express");
const ExpressError = require("../models/error.js");
const router = new express.Router();
const Recipe = require("../models/recipes.js");
const User = require("../models/users.js");
const { isLoggedIn, isCurrUser, isBodyCurrUser } = require("../middleware/auth.js");
const { isFilter } = require("../helpers/recipes.js");
const { rowExists } = require("../helpers/sql.js");
const reviewsSchema = require("../schemas/reviews.json");
/**
 * "/:id"
 * route type: GET
 * Authorization: logged in
 * Returns recipe.
 */
router.get("/:id", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.recipeOrRecipes(+id);
        // const recipe = await Recipe.getRecipe(id);
        return res.status(200).json(recipe);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/"
 * route type: GET
 * Authorization: logged in
 * Returns recipes.
 */
router.get("/", isLoggedIn, async (req, res, next) => {
    try {
        const qry = req.query;
        const filterExists = isFilter(qry);
        const recipes = filterExists ? await Recipe.recipesFilter(qry) : await Recipe.recipeOrRecipes();
        // const recipes = filterExists ? await Recipe.recipesFilter(qry) : await Recipe.getRecipes();
        return res.status(200).json(
            recipes
        );
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/reviews"
 * route type: GET
 * Authorization: logged in
 * Returns recipe reviews.
 */
router.get("/:id/reviews", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipeRvws = await Recipe.getRecipeReviews(+id);

        return res.status(200).json(
            recipeRvws
        );
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/reviews"
 * route type: POST
 * Authorization: logged in
 * Posts and returns recipe review.
 */
router.post("/:id/reviews", isLoggedIn, isBodyCurrUser, async (req, res, next) => {
    try {
        const { id: recipe_id } = req.params;
        const { user_id, stars, review } = req.body;
        // Check if recipe exists.
        await rowExists("recipe", "id", "recipes", [["id", +recipe_id]]);
        const data = { user_id, stars, review, recipe_id: +recipe_id };
        const returning = await User.insertRow("reviews", data, reviewsSchema, ["stars", "review", "user_id"]);

        return res.status(201).json(
            returning.rows
        );
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:recipe_id/likes/:user_id"
 * route type: POST
 * Authorization: logged in
 * Likes a recipe.
 * Returns message.
 */
// router.post("/:recipe_id/likes/:user_id", isLoggedIn, isCurrUser, async (req, res, next) => {
//     try {
//         const { recipe_id, user_id } = req.params;
//         const rowExistsArr = [["id", +user_id]];
//         await rowExists("user", "id", "users", rowExistsArr);
//         const msg = "Liked recipe!";
//         const qryObj = { recipe_id: +recipe_id, user_id: +user_id };
//         const likMsg = await User.insertRow("liked_recipes", qryObj, false, false, msg);
//         return res.status(200).json(
//             likMsg
//         );
//     } catch (err) {
//         return next(err);
//     }
// });

/**
 * "/:recipe_id/likes/:user_id"
 * route type: DELETE
 * Authorization: logged in
 * Deletes a liked recipe.
 * Returns message.
 */
// router.delete("/:recipe_id/likes/:user_id", isLoggedIn, isCurrUser, async (req, res, next) => {
//     try {
//         const { recipe_id, user_id } = req.params;
//         await rowExists("user", "id", "users", [["id", +user_id]]);
//         const msg = "Deleted liked recipe!";
//         const qryObj = { recipe_id: +recipe_id, user_id: +user_id };
//         const likDltMsg = await User.deleteRow("liked_recipes", qryObj, msg);
//         return res.status(200).json(
//             likDltMsg
//         );
//     } catch (err) {
//         return next(err);
//     }
// });

/**
 * "/:recipe_id/dislikes/:user_id"
 * route type: POST
 * Authorization: logged in
 * Dislikes a recipe.
 * Returns message.
 */
// router.post("/:recipe_id/dislikes/:user_id", isLoggedIn, isCurrUser, async (req, res, next) => {
//     try {
//         const { recipe_id, user_id } = req.params;
//         const rowExistsArr = [["id", +user_id]];
//         await rowExists("user", "id", "users", rowExistsArr);
//         const msg = "Disliked recipe!";
//         const qryObj = { recipe_id: +recipe_id, user_id: +user_id };
//         const dislikMsg = await User.insertRow("disliked_recipes", qryObj, false, false, msg);
//         return res.status(200).json(
//             dislikMsg
//         );
//     } catch (err) {
//         return next(err);
//     }
// });

/**
 * "/:recipe_id/dislikes/:user_id"
 * route type: DELETE
 * Authorization: logged in
 * Deletes a disliked recipe.
 * Returns message.
 */
// router.delete("/:recipe_id/dislikes/:user_id", isLoggedIn, isCurrUser, async (req, res, next) => {
//     try {
//         const { recipe_id, user_id } = req.params;
//         await rowExists("user", "id", "users", [["id", +user_id]]);
//         const msg = "Deleted disliked recipe!";
//         const qryObj = { recipe_id: +recipe_id, user_id: +user_id };
//         const dislikDltMsg = await User.deleteRow("disliked_recipes", qryObj, msg);
//         return res.status(200).json(
//             dislikDltMsg
//         );
//     } catch (err) {
//         return next(err);
//     }
// });


module.exports = router;