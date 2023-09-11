process.env.NODE_ENV = "test";
const { db } = require("../config.js");
const SECRET_KEY = require("../keys.js");
const {
    validateSchema, hashPassword, generateToken,
    decodeToken, verifyPassword
} = require("../helpers/users.js");
const ExpressError = require("../models/error.js");
const {
    BCRYPT_WORK_FACTOR,
} = require("../config.js");


let usr1;
let usr2;
let usr1Token;
let usr2Token;

async function genTestUsers () {
    const pwd1 = await hashPassword("password1");
    const pwd2 = await hashPassword("password2");

    usr1 = {
        username: "usr1",
		first_name: "usr1fn",
		last_name: "usr1ln",
		email: "usr1@g.com",
		phone: "813 507 4490",
        password: pwd1
    }

    usr2 = {
        username: "usr2",
		first_name: "usr2fn",
		last_name: "usr2ln",
		email: "usr2@g.com",
		phone: "813 507 4490",
        password: pwd2
    }

    const usr1Res = await db.query(`
        INSERT INTO users (username, first_name, last_name, email, phone, password)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, id`,
        ["usr1", "usr1fn", "usr1ln", "usr1@g.com", "813 507 4490", pwd1]
    );

    const usr2Res = await db.query(`
        INSERT INTO users (username, first_name, last_name, email, phone, password)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, id`,
        ["usr2", "usr2fn", "usr2ln", "usr2@g.com", "813 507 4490", pwd2]
    );
    const { username: user1Username, id: user1Id } = usr1Res.rows[0];
    const { username: user2Username, id: user2Id } = usr2Res.rows[0];
    const user1TknObj = { userId: user1Id, userUsername: user1Username };
    const user2TknObj = { userId: user2Id, userUsername: user2Username };
    usr1Token = generateToken(user1TknObj, SECRET_KEY);
    usr2Token = generateToken(user2TknObj, SECRET_KEY);

    const usr1Id = usr1Res.rows[0].id;
    const usr2Id = usr2Res.rows[0].id;
    await db.query(`
        INSERT INTO favorite_recipes (user_id, recipe_id)
        VALUES ($1, $2), ($3, $4)`,
        [usr1Id, 6, usr1Id, 100]
    );

    await db.query(`
        INSERT INTO saved_recipes (user_id, recipe_id)
        VALUES ($1, $2), ($3, $4)`,
        [usr1Id, 300, usr1Id, 400]
    );

    const listId1Req = await db.query(`
        INSERT INTO recipelists (user_id, occasion_id, list_name)
        VALUES ($1, $2, $3) RETURNING id`,
        [usr1Id, 7,  "weekly meals"]
    );

    const listId2Req = await db.query(`
        INSERT INTO recipelists (user_id, occasion_id, list_name)
        VALUES ($1, $2, $3) RETURNING id`,
        [usr1Id, 2, "rasta bash",]
    );

    const listId3Req = await db.query(`
        INSERT INTO recipelists (user_id, occasion_id, list_name)
        VALUES ($1, $2, $3) RETURNING id`,
        [
            usr2Id, 1, "christmas appetizers"
        ]
    );

    const { id: listId1 } = listId1Req.rows[0];
    const { id: listId2 } = listId2Req.rows[0];
    const { id: listId3 } = listId3Req.rows[0];

    await db.query(`
        INSERT INTO recipelists_recipes (list_id, recipe_id)
        VALUES ($1, $2), ($3, $4)`,
        [
            listId1, 450,
            listId1, 460
        ]
    );

    const shoplist1 = await db.query(`
        INSERT INTO shoppinglists (user_id, recipe_id, list_name)
        VALUES ($1, $2, $3) RETURNING id`,
        [
            usr1Id, 120, 'User 1 Shoplist for Recipe 120'
        ]
    );

    const shoplist2 = await db.query(`
        INSERT INTO shoppinglists (user_id, recipe_id, list_name)
        VALUES ($1, $2, $3) RETURNING id`,
        [
            usr2Id, 320, 'User 2 Shoplist for Recipe 320'
        ]
    );
    
    const { id: shopList1Id } = shoplist1.rows[0];
    const { id: shopList2Id } = shoplist2.rows[0];

    await db.query(`
        INSERT INTO shoppinglists_items
            (list_id, qty, unit_id, ingredient_id)
        VALUES
            ($1, $2, $3, $4), ($5, $6, $7, $8), ($9, $10, $11, $12)`,
        [
            shopList1Id, '20', 20, 506,
            shopList1Id, '3', 3, 10,
            shopList2Id, '20', 20, 506
        ]
    );

    const listItemReq = await db.query(
        `SELECT id FROM shoppinglists_items
        WHERE list_id = $1 AND ingredient_id = $2 LIMIT 1`,
        [shopList1Id, 506]
    );
    const { id: list1ItemId } = listItemReq.rows[0];

    const listItem2Req = await db.query(
        `SELECT id FROM shoppinglists_items
        WHERE list_id = $1 AND ingredient_id = $2 LIMIT 1`,
        [shopList1Id, 10]
    );
    const { id: list1Item2Id } = listItem2Req.rows[0];

    const user1Recipe = await db.query(`
        INSERT INTO user_recipes (user_id, recipe_name)
        VALUES ($1, $2) RETURNING id`,
        [
            usr1Id, 'User 1 Chicken Dumplings Tweak'
        ]
    );

    const user2Recipe = await db.query(`
        INSERT INTO user_recipes (user_id, recipe_name)
        VALUES ($1, $2) RETURNING id`,
        [
            usr2Id, 'User 2 Stuffed Shells Tweak'
        ]
    );

    const { id: user1RecipeId } = user1Recipe.rows[0];
    const { id: user2RecipeId } = user2Recipe.rows[0];

    const res = await db.query(`
        SELECT * FROM user_recipes WHERE id = $1
    `, [user2RecipeId]);

    await db.query(`
        INSERT INTO user_recipes_steps (user_recipe_id, step)
        VALUES ($1, $2), ($3, $4), ($5, $6), ($7, $8), ($9, $10)`,
        [
            user1RecipeId, 'User 1 Test Step 1',
            user1RecipeId, 'User 1 Test Step 2',
            user1RecipeId, 'User 1 Test Step 3',
            user2RecipeId, 'User 2 Test Step 1',
            user2RecipeId, 'User 2 Test Step 2'
        ]
    );

    await db.query(`
        INSERT INTO user_recipes_ingredients
            (user_recipe_id, qty, unit_id, ingredient_id)
        VALUES
            ($1, $2, $3, $4), ($5, $6, $7, $8)`,
        [
            user1RecipeId, 10, 20, 506,
            user1RecipeId, 4, 3, 10
        ]
    );

    const user1RecipeIngrdIdReq = await db.query(
        `SELECT id FROM user_recipes_ingredients
        WHERE user_recipe_id = $1 AND ingredient_id = $2`,
        [user1RecipeId, 506]
    );
    
    const { id: user1RecipeIngrdId } = user1RecipeIngrdIdReq.rows[0];
    
    const user1RecipeIngrd2IdReq = await db.query(
        `SELECT id FROM user_recipes_ingredients
        WHERE user_recipe_id = $1 AND ingredient_id = $2`,
        [user1RecipeId, 10]
    );
    const { id: user1RecipeIngrd2Id } = user1RecipeIngrd2IdReq.rows[0];

    await db.query(`
        INSERT INTO reviews
            (user_id, recipe_id, stars, review)
        VALUES ($1, $2, $3, $4)`,
        [
            usr1Id, 100, 5, "Good."
        ]
    );

    return {
        usr1,
        usr1Token,
        usr2,
        usr2Token,
        usr1Id,
        usr2Id,
        listId1,
        listId2,
        listId3,
        shopList1Id,
        shopList2Id,
        list1ItemId,
        list1Item2Id,
        user1RecipeId,
        user2RecipeId,
        user1RecipeIngrdId,
        user1RecipeIngrd2Id
    };
}


module.exports = {
    genTestUsers
}