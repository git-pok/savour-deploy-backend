const express = require("express");
const ExpressError = require("../models/error.js");
const router = new express.Router();
const User = require("../models/users.js");
const Recipe = require("../models/recipes.js");
const { validateSchema, hashPassword } = require("../helpers/users.js");
const { rowExists } = require("../helpers/sql.js");
const { isLoggedIn, isCurrUser } = require("../middleware/auth.js");
const favSavRecipeSchema = require("../schemas/favSavRecipe.json");
const recipeListsSchema = require("../schemas/recipeLists.json");
const shopListsSchema = require("../schemas/shopLists.json");
const recipesSchema = require("../schemas/userRecipes.json");
const recipeListsRecipesSchema = require("../schemas/recipeListsRecipes.json");
const shopListItemsSchema = require("../schemas/shopListItems.json");
const recipeIngrdtsSchema = require("../schemas/userRecipeIngrd.json");
/**
 * "/register"
 * route type: POST
 * Authorization: none
 * Returns inserted register data.
 * and token
 */
router.post("/register", async (req, res, next) => {
    try {
        const data = req.body;
        const user = await User.register(data);
        return res.status(201).json([
            user
        ]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/login"
 * route type: POST
 * Authorization: none
 * Returns token.
 */
router.post("/login", async (req, res, next) => {
    try {
        const data = req.body;
        const user = await User.login(data);
        return res.status(200).json([{ user }]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:username"
 * route type: GET
 * Authorization: logged in
 * Returns user.
 */
router.get("/:username", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.getUser(username);
        return res.status(200).json([{
            user
        }]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/username"
 * route type: PATCH
 * Authorization: logged in
 * Updates a user's information.
 * Returns updated user data.
 */
router.patch("/:username", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { username } = req.params;
        const data = req.body;
        const user = await User.editUser(data, username);
        return res.status(200).json([
            {
                user
            }
        ]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/username"
 * route type: DELETE
 * Authorization: logged in
 * Returns deleted message.
 */
router.delete("/:username", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { username } = req.params;
        const msg = "Deleted user from users!"
        const clmnNameValObj = { username };
        const deletedMsg = await User.deleteRow("users", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/favorite-recipes"
 * route type: GET
 * Authorization: logged in
 * Returns favorited recipes.
 */
router.get("/:id/favorite-recipes", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const favRecipes = await User.getFavRecipes(id);
        return res.status(200).json(favRecipes);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/favorite-recipes"
 * Favorites a recipe.
 * route type: POST
 * Authorization: logged in
 * Returns message.
 */
router.post("/:id/favorite-recipes", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { recipe_id } = req.body;
        const qry = {recipe_id, user_id: +id};
        const msg = "Favorited recipe!";
        const favMsg = await User.insertRow("favorite_recipes", qry, favSavRecipeSchema, false, msg);
        return res.status(201).json(favMsg);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/favorite-recipes/:recipe_id"
 * route type: GET
 * Authorization: logged in
 * Returns favorited recipe.
 */
router.get("/:id/favorite-recipes/:recipe_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, recipe_id } = req.params;
        const favRecipe = await User.getFavRecipes(id, recipe_id);
        return res.status(200).json(favRecipe);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/favorite-recipes/:recipe_id"
 * route type: DELETE
 * Authorization: logged in
 * Deletes favorited recipe.
 * Returns deleted message.
 */
router.delete("/:id/favorite-recipes/:recipe_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, recipe_id } = req.params;
        const msg = "Deleted recipe from favorites!"
        const clmnNameValObj = { user_id: +id,  recipe_id: +recipe_id };
        const deletedMsg = await User.deleteRow("favorite_recipes", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/saved-recipes"
 * route type: GET
 * Authorization: logged in
 * Returns saved recipes.
 */
router.get("/:id/saved-recipes", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const savedRecipes = await User.getSavedRecipes(id);
        return res.status(200).json(savedRecipes);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/saved-recipes"
 * route type: POST
 * Authorization: logged in
 * Saves a recipe.
 * Returns message.
 */
router.post("/:id/saved-recipes", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id: user_id } = req.params;
        const { recipe_id } = req.body;
        const qry = {recipe_id, user_id: +user_id};
        const msg = "Saved recipe!";
        const savMsg = await User.insertRow("saved_recipes", qry, favSavRecipeSchema, false, msg);
        return res.status(201).json(savMsg);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/saved-recipes/:recipe_id"
 * route type: GET
 * Authorization: logged in
 * Returns saved recipe.
 */
router.get("/:id/saved-recipes/:recipe_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, recipe_id } = req.params;
        const savedRecipe = await User.getSavedRecipes(id, recipe_id);
        return res.status(200).json(savedRecipe);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/saved-recipes/:recipe_id"
 * route type: DELETE
 * Authorization: logged in
 * Deletes saved recipe.
 * Returns deleted message.
 */
router.delete("/:id/saved-recipes/:recipe_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, recipe_id } = req.params;
        const msg = "Deleted recipe from saved recipes!"
        const clmnNameValObj = { user_id: +id,  recipe_id: +recipe_id };
        const deletedMsg = await User.deleteRow("saved_recipes", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/recipelists"
 * route type: GET
 * Authorization: logged in
 * Returns recipelists.
 */
router.get("/:id/recipelists", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipeLists = await User.getRecipeLists(id);
        return res.status(200).json(recipeLists);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/recipelists"
 * route type: POST
 * Authorization: logged in
 * Creates recipelist.
 * Returns recipelist.
 */
router.post("/:id/recipelists", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { occasion_id, list_name } = req.body;
        await rowExists("user", "id", "users", [["id", +id]]);
        const data = { user_id: +id, occasion_id, list_name };
        const returnClmns = ["id"];
        const listRes = await User.insertRow("recipelists", data, recipeListsSchema, returnClmns);
        const { id: listId } = listRes.rows[0];
        const list = await User.getRecipeLists(+id, +listId);
        return res.status(201).json(list[0]);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/recipelists/:list_id"
 * route type: GET
 * Authorization: logged in
 * Returns recipelist recipes.
 */
router.get("/:id/recipelists/:list_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, list_id } = req.params;
        const recipes = await User.getListRecipes(id, list_id);
        return res.status(200).json(recipes);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/recipelists/:list_id"
 * route type: POST
 * Authorization: logged in
 * Adds a recipe to recipelist.
 * Returns recipelist recipes.
 */
router.post("/:id/recipelists/:list_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id: user_id, list_id } = req.params;
        await rowExists("list", "id", "recipelists", [["id", +list_id]]);
        const { recipe_id } = req.body;
        const data = { recipe_id: recipe_id, list_id: +list_id };
        const returnClmns = ["list_id"];
        const listRes = await User.insertRow("recipelists_recipes", data, recipeListsRecipesSchema, returnClmns);
        const { list_id: listId } = listRes.rows[0];
        const list = await User.getListRecipes(+user_id, +listId);
        return res.status(201).json(list);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/recipelists/:list_id"
 * route type: DELETE
 * Authorization: logged in
 * Deletes recipelist.
 * Returns deleted message.
 */
router.delete("/:id/recipelists/:list_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, list_id } = req.params;
        const msg = "Deleted recipelist!"
        const clmnNameValObj = { user_id: +id,  id: +list_id };
        const deletedMsg = await User.deleteRow("recipelists", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/recipelists/:list_id/:recipe_id"
 * route type: GET
 * Authorization: logged in
 * Returns recipe from recipelist recipes.
 */
router.get("/:id/recipelists/:list_id/:recipe_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, list_id, recipe_id } = req.params;
        const clmnsNvals = [["list_id", +list_id], ["recipe_id", +recipe_id]];
        const tableName = "recipelists_recipes";
        const recipe = await User.getListRecipes(+id, +list_id, +recipe_id);
        return res.status(200).json([recipe]);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/recipelists/:list_id/:recipe_id"
 * route type: DELETE
 * Authorization: logged in
 * Deletes recipelist recipe.
 * Returns deleted message.
 */
router.delete("/:id/recipelists/:list_id/:recipe_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, list_id, recipe_id } = req.params;
        const rowCheckArr = [["list_id", +list_id], ["recipe_id", +recipe_id]];
        await rowExists("recipelist recipe", "id", "recipelists_recipes", rowCheckArr);
        const msg = "Deleted recipe from recipelist!"
        const clmnNameValObj = { list_id: +list_id,  recipe_id: +recipe_id };
        const deletedMsg = await User.deleteRow("recipelists_recipes", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/shoppinglists"
 * route type: GET
 * Authorization: logged in
 * Returns shoppinglists.
 */
router.get("/:id/shoppinglists", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const lists = await User.getShopLists(id);
        return res.status(200).json(lists);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/shoppinglists"
 * route type: POST
 * Authorization: logged in
 * Creates shoppinglist.
 * Returns shoppinglist.
 */
router.post("/:id/shoppinglists", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id: user_id } = req.params;
        await rowExists("user", "id", "users", [["id", +user_id]]);
        const { recipe_id, list_name } = req.body;
        const data = { user_id: +user_id, recipe_id: +recipe_id, list_name };
        const returnClmns = ["id"];
        const listRes = await User.insertRow("shoppinglists", data, shopListsSchema, returnClmns);
        const { id: listId } = listRes.rows[0];
        const list = await User.getShopLists(+user_id);
        return res.status(201).json(list);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/shoppinglists/:list_id"
 * route type: GET
 * Authorization: logged in
 * Returns shoppinglist items.
 */
router.get("/:id/shoppinglists/:list_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, list_id } = req.params;
        const lists = await User.shopListsItems(id, list_id);
        return res.status(200).json(lists);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/shoppinglists/:list_id"
 * route type: DELETE
 * Authorization: logged in
 * Deletes shoppinglist.
 * Returns deleted message.
 */
router.delete("/:id/shoppinglists/:list_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id: user_id, list_id } = req.params;
        const msg = "Deleted shoppinglist!"
        const clmnNameValObj = { user_id: +user_id, id: +list_id };
        const deletedMsg = await User.deleteRow("shoppinglists", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/shoppinglists/:list_id/items"
 * route type: POST
 * Authorization: logged in
 * Adds items to shoppinglist.
 * Returns shoppinglist.
 */
router.post("/:id/shoppinglists/:list_id/items", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id: user_id, list_id } = req.params;
        await rowExists("shoppinglist", "id", "shoppinglists", [["user_id", +user_id], ["id", +list_id]]);
        const { qty, unit_id, ingredient_id } = req.body;
        const data = { list_id: +list_id, qty: qty, unit_id: unit_id, ingredient_id: ingredient_id };
        const returnClmns = ["list_id"];
        const listRes = await User.insertRow("shoppinglists_items", data, shopListItemsSchema, returnClmns);
        const { list_id: listId } = listRes.rows[0];
        const list = await User.shopListsItems(user_id, listId);
        return res.status(201).json(list);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/shoppinglists/:list_id/items"
 * route type: DELETE
 * Authorization: logged in
 * Deletes shoppinglist item.
 * Returns deleted message.
 */
router.delete("/:id/shoppinglists/:list_id/items", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id: user_id, list_id } = req.params;
        await rowExists("shoppinglist", "id", "shoppinglists", [["user_id", +user_id], ["id", +list_id]]);
        const { item_id } = req.body;
        const msg = "Deleted item from shoppinglist!"
        const clmnNameValObj = { id: +item_id };
        const deletedMsg = await User.deleteRow("shoppinglists_items", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/recipes"
 * route type: GET
 * Authorization: logged in
 * Returns user's recipes.
 */
router.get("/:id/recipes", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const lists = await User.userRecipes(id);
        return res.status(200).json(lists);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/recipes"
 * route type: POST
 * Authorization: logged in
 * Creates user recipe.
 * Returns user recipe.
 */
router.post("/:id/recipes", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id: user_id } = req.params;
        // await rowExists("user", "id", "users", [["id", +user_id]]);
        const { recipe_name } = req.body;
        const data = { user_id: +user_id, recipe_name };
        const returnClmns = ["id"];
        const listRes = await User.insertRow("user_recipes", data, recipesSchema, returnClmns);
        const { id: listId } = listRes.rows[0];
        const list = await User.recipe(+user_id, listId);
        return res.status(201).json(list);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:user_id/recipes/:id"
 * route type: GET
 * Authorization: logged in
 * Returns user's recipe.
 */
router.get("/:id/recipes/:recipe_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, recipe_id } = req.params;
        const lists = await User.recipe(+id, +recipe_id);
        return res.status(200).json(lists);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:user_id/recipes/:id"
 * route type: POST
 * Authorization: logged in
 * Adds ingredient to user's recipe.
 * Returns user recipe with ingredients.
 */
router.post("/:id/recipes/:recipe_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, recipe_id } = req.params;
        await rowExists("user recipe", "id", "user_recipes", [["user_id", +id], ["id", +recipe_id]]);
        const { qty, unit_id, ingredient_id } = req.body;
        const data = { user_recipe_id: +recipe_id, qty, unit_id, ingredient_id };
        const returnClmns = ["id"];
        const listRes = await User.insertRow("user_recipes_ingredients", data, recipeIngrdtsSchema, returnClmns);
        // const { id: listId } = listRes.rows[0];
        const list = await User.recipe(+id, +recipe_id);
        return res.status(201).json(list);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:user_id/recipes/:id"
 * route type: DELETE
 * Authorization: logged in
 * Deletes user recipe.
 * Returns deleted message.
 */
router.delete("/:id/recipes/:recipe_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, recipe_id } = req.params;
        const msg = "Deleted user's recipe!"
        const clmnNameValObj = { user_id: +id, id: +recipe_id };
        const deletedMsg = await User.deleteRow("user_recipes", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:user_id/recipes/:id"
 * route type: DELETE
 * Authorization: logged in
 * Deletes user recipe ingredient.
 * Returns deleted message.
 */
router.delete("/:id/recipes/:recipe_id/:item_id", isLoggedIn, isCurrUser, async (req, res, next) => {
    try {
        const { id, recipe_id: list_id, item_id } = req.params;
        await rowExists("user recipe", "id", "user_recipes", [["user_id", +id], ["id", +list_id]]);
        const msg = "Deleted ingredient from user's recipe!"
        const clmnNameValObj = { id: +item_id };
        const deletedMsg = await User.deleteRow("user_recipes_ingredients", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
        return next(err);
    }
});


module.exports = router;