const { Client } = require("pg");

let BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

let DB_URI;

DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql:///savour_test" : "postgresql:///savour";

let db = new Client ({ 
    connectionString: DB_URI
});

db.connect();

const recipesFltrKeyToClmnName = {
    author: "full_name",
    name: "name",
    maincategory: "main_cat_name",
    subcategory: "sub_cat_name",
    rating: "rating",
    id: "id",
    difficulty: "level"
};


/**
 * recpesFltrClmnNmToTblAbrev
 * Table abreviations for recipes filter values.
 */
const recpesFltrClmnNmToTblAbrev = {
    author: "a.",
    full_name: "a.",
    name: "r.",
    mainCategory: "m.",
    subCategory: "s.",
    rating: "rt.",
    id: "r.",
    difficulty: "d."
};


/**
 * recipesClmnToTblAbrev
 * Column name table abreviations
 * for recipes table and joined tables
 * for getting a recipe.
 */
const recipesClmnToTblAbrev = {
    full_name: "a.",
    name: "r.",
    main_cat_name: "m.",
    sub_cat_name: "s.",
    rating: "rt.",
    id: "r.",
    level: "d."
};

/**
 * favRecpesClmnToTblAbrev
 * Column name table abreviations
 * for recipes table and joined tables
 * for getting a recipe.
 */
const favRecpesClmnToTblAbrev = {
    user_id: "fr.",
    recipe_id: "fr."
};

/**
 * savedRecpesClmnToTblAbrev
 * Column name table abreviations
 * for recipes table and joined tables
 * for getting a saved recipe.
 */
const savedRecpesClmnToTblAbrev = {
    user_id: "sv.",
    recipe_id: "sv."
};


/**
 * recipesClmnToTblAbrev
 * column name table abreviations
 * for recipes_ingredients table.
 */
const recipesIngrdsClmnToTblAbrev = {
    id: "ri.",
    recipe_id: "ri."
};


/**
 * usersClmnToTblAbrev
 * column name table abreviations for users table.
 */
const usersClmnToTblAbrev = {
    username: "u.",
	first_name: "u.",
	last_name: "u.",
	email: "u.",
	phone: "u.",
	header_img: "u.",
	profile_img: "u.",
	password: "u."
};


/**
 * tablesJoinAbrv
 * Table name and abreviation for table name.
 * JOIN authors a
 */
const tablesJoinAbrv = {
    authors: "authors a",
    units: "units u",
    ingredients: "ingredients ing",
    main_category: "main_category m",
    sub_category: "sub_category s",
    difficulty: "difficulty d",
    recipes: "recipes r",
    recipes_ingredients: "recipes_ingredients ri",
    ratings: "ratings rt",
    users: "users usr",
    disliked_recipes: "disliked_recipes dis",
    liked_recipes: "liked_recipes lik",
    favorite_recipes: "favorite_recipes fr",
    saved_recipes: "saved_recipes sv",
    occasions: "occasions o",
    recipelists: "recipelists rl",
    recipelists_recipes: "recipelists_recipes rlr",
    tips: "tips t",
    reviews: "reviews rv",
    shoppinglists: "shoppinglists sl",
    shoppinglists_items: "shoppinglists_items sli",
    user_recipes: "user_recipes ur",
    user_recipes_ingredients: "user_recipes_ingredients uri",
    user_recipes_steps: "user_recipes_steps urs",
};


/**
 * joinTableNameAbrv
 * Table abreviations for join equal to expressions.
 * r.author_id = a.id
 */
const joinTableNameAbrv = {
    authors: "a.",
    units: "u.",
    ingredients: "ing.",
    main_category: "m.",
    sub_category: "s.",
    difficulty: "d.",
    recipes: "r.",
    recipes_ingredients: "ri.",
    ratings: "rt.",
    users: "usr.",
    disliked_recipes: "dis.",
    liked_recipes: "lik.",
    favorite_recipes: "fr.",
    saved_recipes: "sv.",
    occasions: "o.",
    recipelists: "rl.",
    recipelists_recipes: "rlr.",
    tips: "t.",
    reviews: "rv.",
    shoppinglists: "sl.",
    shoppinglists_items: "sli.",
    user_recipes: "ur.",
    user_recipes_ingredients: "uri.",
    user_recipes_steps: "urs.",
};


/**
 * sqlOperator
 * Sql operators for where query table columns
 * WHERE full_name ILIKE
 */
const sqlOperator = {
    full_name: "ILIKE",
    first_name: "ILIKE",
    last_name: "ILIKE",
    username: "ILIKE",
    email: "ILIKE",
    name: "ILIKE",
    main_cat_name: "ILIKE",
    sub_cat_name: "ILIKE",
    rating: "=",
    id: "=",
    user_id: "=",
    recipe_id: "=",
    list_id: "=",
    user_recipe_id: "=",
    ingredient_id: "=",
    unit_id: "=",
    occasion_id: "=",
    ingredient: "ILIKE"
};


/**
 * sqlOperatorStrict
 * Strict sql operators for where query table columns
 * WHERE full_name =
 */
const sqlOperatorStrict = {
    full_name: "=",
    first_name: "=",
    last_name: "=",
    email: "=",
	phone: "=",
	header_img: "=",
	profile_img: "=",
	password: "=",
    name: "=",
    main_cat_name: "=",
    sub_cat_name: "=",
    rating: "=",
    id: "=",
    username: "=",
    recipe_id: "=",
    user_id: "=",
    recipe_id: "=",
    list_id: "=",
    user_recipe_id: "=",
    ingredient_id: "=",
    unit_id: "=",
    occasion_id: "=",
    ingredient: "="
};


/**
 * sqlCommandsObj
 * Sql commands for queries.
 * ex("select", ["name"]) => "SELECT name"
 */
const sqlCommandsObj = {
    select: "SELECT",
    insert: "INSERT INTO",
    update: "UPDATE"
};


/**
 * sqlCommandsModifsObj
 * Sql modifyer commands for queries.
 * ex("select", ["name"]) => "SELECT name FROM"
 */
const sqlCommandsModifsObj = {
    select: "FROM",
    insert: "VALUES",
    update: "SET"
};


/**
 * recipesRelDataSelectColumns
 * Select column names to query all
 * relational data for recipes table.
 */
const recipesRelDataSelectColumns = [
    "r.id", "r.name", "a.full_name AS author", "rt.rating",
    "rt.vote_count", "r.url", "r.image", "r.description",
    "r.serves", "d.level", "m.main_cat_name", "s.sub_cat_name",
    "r.steps", "r.prep_time", "r.cook_time"
];


/**
 * ingrdsRelDataSelectColumns
 * Select column names to
 * query all relational data for
 * recipes_ingredients table.
 */
const ingrdsRelDataSelectColumns = [
    "ri.id", "ri.qty", "u.unit", "ing.ingredient",
    "ing.id AS ingredient_id", "u.id AS unit_id"
];


/**
 * selectLikRecUsrId
 * Select column names to
 * query user id from liked_recipes table.
 */
const selectLikRecUsrId = [
    "lik.user_id AS liked_user_id"
];


/**
 * selectDisRecUsrId
 * Select column names to
 * query user id from disliked_recipes table.
 */
const selectDisRecUsrId = [
    "dis.user_id AS disliked_user_id"
];

/**
 * selectFavRecUsrId
 * Select column names to
 * query user id from favorite_recipes table.
 */
const selectFavRecUsrId = [
    "fr.user_id AS fav_user_id"
];

/**
 * selectSavRecUsrId
 * Select column names to
 * query user id from saved_recipes table.
 */
const selectSavRecUsrId = [
    "sv.user_id AS sav_user_id"
];


const orderByChron = {
    asc: "ASC",
    desc: "DESC"
};


const recipesOnData = [
    ["authors", "r.author_id", "a.id"],
    ["ratings", "r.id", "rt.recipe_id"],
    ["difficulty", "r.difficulty_id", "d.id"],
    ["main_category", "r.main_category_id", "m.id"],
    ["sub_category", "r.sub_category_id", "s.id"]
];

const favRecipesjoinArr = [
    ["recipes", "fr.recipe_id", "r.id"],
    ["authors", "r.author_id", "a.id"],
    ["ratings", "r.id", "rt.recipe_id"],
    ["difficulty", "r.difficulty_id", "d.id"],
    ["main_category", "r.main_category_id", "m.id"],
    ["sub_category", "r.sub_category_id", "s.id"]
]

const savedRecipesjoinArr = [
    ["recipes", "sv.recipe_id", "r.id"],
    ["authors", "r.author_id", "a.id"],
    ["ratings", "r.id", "rt.recipe_id"],
    ["difficulty", "r.difficulty_id", "d.id"],
    ["main_category", "r.main_category_id", "m.id"],
    ["sub_category", "r.sub_category_id", "s.id"]
]


const likRecipeJoinData = [
    ["liked_recipes", "r.id", "lik.recipe_id"]
];


const disRecipeJoinData = [
    ["disliked_recipes", "r.id", "dis.recipe_id"]
];

const favRecipeJoinData = [
    ["favorite_recipes", "r.id", "fr.recipe_id"]
];

const savRecipeJoinData = [
    ["saved_recipes", "r.id", "sv.recipe_id"]
];

const ingrdRecipesJoinData = [
    ["units", "ri.unit_id", "u.id"],
    ["ingredients", "ri.ingredient_id", "ing.id"]
];


const savourTableNames = new Set();
    savourTableNames.add("authors").add("units").add("ingredients")
    .add("main_category").add("sub_category").add("difficulty")
    .add("recipes").add("recipes_ingredients").add("ratings")
    .add("users").add("disliked_recipes").add("liked_recipes")
    .add("favorite_recipes").add("view_later").add("occasions")
    .add("recipelists").add("recipelists_recipes").add("tips")
    .add("reviews").add("shoppinglists").add("shoppinglists_items")
    .add("user_recipes").add("user_recipes_ingredients")
    .add("saved_recipes");


const recipeQryFilterKeys = new Set();
        recipeQryFilterKeys.add("name").add("author").add("rating")
        .add("orderBy").add("orderBy2").add("mainCategory").add("subCategory");


const recipeFilterKeys = new Set();
        recipeFilterKeys.add("name").add("author").add("rating")
        .add("mainCategory").add("subCategory");


const orderByKeys = new Set();
        orderByKeys.add("orderby").add("orderby2").add("chronorder");


const isNumbers = new Set();
        isNumbers.add("recipe_id").add("user_id").add("rating")
        .add("id").add("vote_count").add("list_id")
        .add("user_recipe_id");


const userSqlReturnNoAbrv = [
    "id", "username", "first_name", "last_name",
    "email", "phone", "header_img", "profile_img"
];

module.exports = {
    db, BCRYPT_WORK_FACTOR, recipesFltrKeyToClmnName,
    recpesFltrClmnNmToTblAbrev, recipesClmnToTblAbrev,
    favRecpesClmnToTblAbrev, savedRecpesClmnToTblAbrev,
    recipesIngrdsClmnToTblAbrev, usersClmnToTblAbrev,
    tablesJoinAbrv, joinTableNameAbrv, sqlOperator,
    sqlOperatorStrict, sqlCommandsObj, sqlCommandsModifsObj,
    recipesRelDataSelectColumns,
    ingrdsRelDataSelectColumns,
    selectLikRecUsrId, selectDisRecUsrId,
    selectFavRecUsrId, selectSavRecUsrId,
    orderByChron, recipesOnData,
    favRecipesjoinArr, savedRecipesjoinArr,
    likRecipeJoinData, disRecipeJoinData,
    favRecipeJoinData, savRecipeJoinData,
    ingrdRecipesJoinData, savourTableNames, recipeQryFilterKeys,
    recipeFilterKeys, orderByKeys, isNumbers,
    userSqlReturnNoAbrv
};