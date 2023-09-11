const {
        db, recipesRelDataSelectColumns,
        favRecipesjoinArr, savedRecipesjoinArr,
        ingrdsRelDataSelectColumns,
        selectLikRecUsrId, selectDisRecUsrId,
        selectFavRecUsrId, selectSavRecUsrId,
        likRecipeJoinData,
        disRecipeJoinData,
        favRecipeJoinData, savRecipeJoinData,
        ingrdRecipesJoinData,
        recipeFilterKeys, recipesClmnToTblAbrev,
        favRecpesClmnToTblAbrev, savedRecpesClmnToTblAbrev,
        recipesOnData,
        recipesIngrdsClmnToTblAbrev
    } = require("../config.js");
const {
        genWhereSqlArr,
        arrayConcat,
        genJoinSql,
        qryObjToOrderBySql,
        genSelectSql, genUpdateSqlObj,
        genInsertSqlObj, rowExists
    } = require("../helpers/sql.js");

const {
    deleteObjProps,
    deleteNullInArrPure,
    deletePropsNotInSetPure,
    recipesFiltersToSqlClmns
} = require("../helpers/recipes.js");
// const SECRET_KEY = require("../keys.js");
// const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userRegister.json");
const loginSchema = require("../schemas/userLogin.json");
const userEditSchema = require("../schemas/userEdit.json");
const ExpressError = require("./error.js");


/**
 * Recipe
 * Smart Class
 * Logics for recipe routes.
 */
class Recipe {
    /**
     * getFavsOrSavs
     * Old Name: getLikesOrDis
     * Retrieves fav or sav usr ids for recipe.
     * Arguments: recipe id, favs
     * getFavsOrSavs(id) => [1, 2, 3]
     */
    static async getFavsOrSavs(id, favs = true) {
        const isFavs = favs === true;
        await rowExists("recipe", "id", "recipes", [["id", id]]);
        const dbRecipe = await db.query(`SELECT * FROM recipes WHERE id = $1`, [id]);
        const dbRecipeRows = JSON.parse(JSON.stringify(dbRecipe.rows));
        const dbRecipeRowsObj = JSON.parse(JSON.stringify(dbRecipeRows[0]));
        // Creates select sql string.
        const selectClmns = isFavs ? [...selectFavRecUsrId] : [...selectSavRecUsrId];
        const selectSqlStr = genSelectSql(selectClmns, "recipes", true);
        // Creates join sql string.
        const joinVals = isFavs ? [...favRecipeJoinData] : [...savRecipeJoinData];
        const joinSqlStr = genJoinSql(joinVals, "FULL JOIN");
        // Creates one string from array of sql strings.
        const selectJoinSqlStr = arrayConcat([selectSqlStr, joinSqlStr]);
        // Creates object with keys of where sql column names
        //  and their values as values.
        const whereObj = { id: dbRecipeRowsObj.id };
        // Generates where sql objects.
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, recipesClmnToTblAbrev);
        // Creates query from select/join/where query strings.
        const sqlQry = arrayConcat([selectJoinSqlStr, sqlWhereObj.whereSql]);
        // Creates pg values.
        const pgValues = sqlWhereObj.values;
        // Makes request with query string.
        const recipesReq = await db.query(
            `${sqlQry}`, pgValues
        );
        // Maps recipe's user ids.
        const mapProp = isFavs ? ["fav_user_id"] : ["sav_user_id"];
        const usrIds = recipesReq.rows.map(obj => obj[mapProp]);
        // Deletes null values from usr ids arrays.
        const noNullUrdIds = deleteNullInArrPure(usrIds);
        return noNullUrdIds;
    }

    /**
     * getRecipeIngrdts
     * Retrieves a recipes ingredients.
     * Arguments: recipe id
     * getRecipeIngrdts(id) =>
     * {
		"qty": "410",
		"unit": "g",
		"ingredient": "can  peach halves"
     * },...  
     */
    static async getRecipeIngrdts(id) {
        // Check if recipe exists.
        await rowExists("recipe", "id", "recipes", [["id", id]]);
        const dbRecipe = await db.query(`SELECT * FROM recipes WHERE id = $1`, [id]);
        const dbRecipeRows = JSON.parse(JSON.stringify(dbRecipe.rows));
        const dbRecipeRowsObj = JSON.parse(JSON.stringify(dbRecipeRows[0]));
        // Creates select sql string.
        const ingrSelectSqlStr = genSelectSql(ingrdsRelDataSelectColumns, "recipes_ingredients", true);
        // Creates join sql string.
        const ingrJoinSqlStr = genJoinSql(ingrdRecipesJoinData, "JOIN");
        // Creates one string from array of sql strings
        const ingrSelectJoinSqlStr = arrayConcat([ingrSelectSqlStr, ingrJoinSqlStr]);
        // Creates object with keys of where sql column names
        //  and their values as values.
        const RecIngrdsObj = { recipe_id: dbRecipeRowsObj.id };
        // Generates where sql objects.
        const ingrdsWhereObj = genWhereSqlArr(RecIngrdsObj, 1, true, false, true, recipesIngrdsClmnToTblAbrev);
        // Creates query from select/join/where query strings.
        const ingrSelectQry = arrayConcat([ingrSelectJoinSqlStr, ingrdsWhereObj.whereSql]);
        // Creates pg values.
        const pgValues = ingrdsWhereObj.values;
        // Makes request with query string.
        const ingredsReq = await db.query(
            `${ingrSelectQry}`, pgValues
        );
        return ingredsReq.rows;
    }

    /**
     * getRecipeReviews
     * Retrieves recipe reviews.
     * Arguments: recipe id
     * getRecipeReviews(id) =>
     * {
		"stars": 5,
		"review": "Good!",
		"user_id": 11
	 * },...
     */
    static async getRecipeReviews(id) {
        // Check if recipe exists.
        await rowExists("recipe", "id", "recipes", [["id", id]]);
        const dbRecipe = await db.query(`SELECT * FROM recipes WHERE id = $1`, [id]);
        const dbRecipeRows = JSON.parse(JSON.stringify(dbRecipe.rows));
        const dbRecipeRowsObj = JSON.parse(JSON.stringify(dbRecipeRows[0]));
        // Creates select sql string.
        const selectRvwsSqlStr = genSelectSql(["rv.stars", "rv.review", "rv.user_id"], "reviews", true);
        // Creates join sql string.
        const rvwJoinEqts = [ ["recipes", "rv.recipe_id", "r.id"] ];
        const joinRvwSqlStr = genJoinSql(rvwJoinEqts, "JOIN");
        // Creates one string from array of sql strings
        const selectRvwJoinSqlStr = arrayConcat([selectRvwsSqlStr, joinRvwSqlStr]);
        // Creates object with keys of where sql column names
        //  and their values as values.
        const whereObj = { id: dbRecipeRowsObj.id };
        // Generates where sql objects.
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, recipesClmnToTblAbrev);
        // Creates query from select/join/where query strings.
        const rvwQry = arrayConcat([selectRvwJoinSqlStr, sqlWhereObj.whereSql]);
        // Creates pg values.
        const pgValues = sqlWhereObj.values;
        // Makes request with query string.
        const rvwRecipesReq = await db.query(
            `${rvwQry}`, pgValues
        );
        // Debug query.
        // const rvwRecipesReq = await db.query(
        //     `SELECT rv.stars, rv.review, rv.user_id FROM reviews rv JOIN recipes r ON rv.recipe_id = r.id WHERE r.id = $1`, pgValues
        // );
        return rvwRecipesReq.rows;
    }

    /**
     * defineFavsSavs
     * Old Name: defineLiksDis
     * Requests user likes and dislikes for a recipe and
     * defines props for them on obj.
     * Arguments: array of objects
     * const obj = [{ id: 1, name: "berry smoothie"}]
     * defineFavsSavs(id) =>
     * [{id: 1, name: "berry smoothie", liked_user_ids: [1], ...}]
     */
    static async defineFavsSavs(arrayOfObjs, pure = false) {
        const isPure = pure === true;
        const pureArr = [];
        for (let obj of arrayOfObjs) {
            // Retrieves recipe likes user ids.
            const usrsRecipeFavs = await Recipe.getFavsOrSavs(obj.id);
            // const usrsRecipeLiks = await Recipe.getRecipeLikes(obj.id);
            // Retireves recipe dislikes user ids.
            const usrsRecipeSavs = await Recipe.getFavsOrSavs(obj.id, false);
            // const usrsRecipeDislikes = await Recipe.getRecipeDisLikes(obj.id);
            if (!isPure) {
                // Defines new liked/disliked recipe user ids and reviews props.
                obj["fav_user_ids"] = usrsRecipeFavs;
                obj["sav_user_ids"] = usrsRecipeSavs;
            } else {
                const newObj = JSON.parse(JSON.stringify(obj));
                newObj["fav_user_ids"] = usrsRecipeFavs;
                newObj["sav_user_ids"] = usrsRecipeSavs;
                pureArr.push(newObj);
            }
        }
        return !isPure ? arrayOfObjs : pureArr;
    }

    /**
     * recipeOrRecipes
     * Retrieves a recipe or recipes.
     * Arguments: recipe id
     * recipeOrRecipes(id) =>
     * {
		name: "Sausage ...",
        author: "Vin...",  
	* }
    * recipeOrRecipes() =>
    * {
		name: "Sausage ...",
        author: "Vin...",
	* }, ...
     */
    static async recipeOrRecipes(id = false) {
        const isRecipes = id === false;
        // Check if recipe exists.
        if (!isRecipes) await rowExists("recipe", "id", "recipes", [["id", id]]);
        // Creates a select sql.
        const selectSqlStr = genSelectSql(recipesRelDataSelectColumns, "recipes", true);
        // Create join sql.
        const joinSqlStr = genJoinSql(recipesOnData, "JOIN");
        // Generates where sql objects.
        const sqlWhereObj = !isRecipes ? genWhereSqlArr({id: +id}, 1, true, false, true, recipesClmnToTblAbrev) : null;
        const sqlArr = isRecipes ? [selectSqlStr, joinSqlStr, "ORDER BY name ASC"] : [selectSqlStr, joinSqlStr, sqlWhereObj.whereSql]; 
        const selectJoinSqlStr = arrayConcat(sqlArr);
        const pgValues = isRecipes ? "" : sqlWhereObj.values;
        // console.log("selectJoinSqlStr", selectJoinSqlStr, pgValues);
        // Make request for recipes.
        const recipesReq = await db.query(
            `${selectJoinSqlStr}`, pgValues
        );
        const recipeRows = recipesReq.rows;
        // Retrieves recipe likes/dislikes user ids
        // and defines props for them.
        await Recipe.defineFavsSavs(recipeRows);

        if (!isRecipes) {
            for (let obj of recipeRows) {
                // Retrieves recipe's ingredients.
                const recipeIngredts = await Recipe.getRecipeIngrdts(id);
                // Retrieves recipe's reviews.
                const recipeRvws = await Recipe.getRecipeReviews(id);
                // Define reviews and ingredients props.
                obj["reviews"] = recipeRvws;
                obj.ingredients = recipeIngredts;
            }
        }
        return recipeRows;
    }

    /**
     * recipesFilter
     * Filters recipes by name, author, or rating.
     * Arguments: query params object
     * const qry = { author: "good" };
     * recipesFilter(qry) =>
     * {
		name: "Sausage ...",
        author: "Vin...",
        ...
	* },
    * {
		name: "Sausage ...",
        author: "Vin...",
        ...
	* }
     */
    static async recipesFilter(qryParams) {
        if (
            (qryParams.chronOrder)
            && (qryParams.orderBy === undefined)
            && (qryParams.orderBy2 === undefined)
        ) throw new ExpressError(400, "Must select order by for sort order to work!");
        const finalSql = [];
        // Create parametizer for qry values.
        let prmTzr = 1;
        // Parse out qry object keys that aren't permitted filters.
        const filtersParsed = deletePropsNotInSetPure(recipeFilterKeys, qryParams);
        // Convert qry object keys to sql table column names.
        const filtersConverted = recipesFiltersToSqlClmns(filtersParsed);
        // Create where sql object.
        // console.log("filtersConverted $#$#$#$#$#$#$", filtersConverted)
        const whereSqlObj = genWhereSqlArr(filtersConverted, prmTzr, false, false, true, recipesClmnToTblAbrev);
        // Create sql select qry.
        const selectSqlStr = genSelectSql(recipesRelDataSelectColumns, "recipes", true);
        // Create sql join query.
        const joinSqlStr = genJoinSql(recipesOnData, "JOIN");
        // Concat select and join queries.
        const selectJoinSqlStr = arrayConcat([selectSqlStr, joinSqlStr]);
        // Concat the select/join query and where query.
        const selectWhereQry = arrayConcat([selectJoinSqlStr, whereSqlObj.whereSql]);
        // Create order by query with qry onject.
        const orderByStr = qryObjToOrderBySql(qryParams);
        const orderBy = orderByStr ? orderByStr : "";
        const pgValuesQry = whereSqlObj.values;
        finalSql.push(selectWhereQry, orderBy);
        const finalSqlQry = finalSql.join(" ");
        // console.log("FINAL STRING $#$#$#$#$#$#", finalSqlQry, pgValuesQry);
        const recipesReq = await db.query(
            `${finalSqlQry}`, pgValuesQry
        );
        const recipeRows = recipesReq.rows;

        if (recipeRows.length) await Recipe.defineFavsSavs(recipeRows);
        return recipeRows;
    }
}

module.exports = Recipe;