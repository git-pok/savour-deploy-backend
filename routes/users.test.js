process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app.js");
const { db } = require("../config.js");
const ExpressError = require("../models/error.js");
const { genTestUsers } = require("../test-data/_test-data.js");

let usr1Test;
let usr2Test;
let usr1TokenTest;
let usr2TokenTest;
let usr1IdTest;
let usr2IdTest;
let listId1Test;
let listId2Test;
let listId3Test;
let shopList1IdTest;
let shopList2IdTest;
let list1ItemIdTest;
let list1Item2IdTest;
let user1RecipeIdTest;
let user2RecipeIdTest;
let user1RecipeIngrdIdTest;
let user1RecipeIngrd2IdTest;

beforeEach(async () => {
    const { 
        usr1, usr1Token, usr2, usr2Token,
        usr1Id, usr2Id, listId1, listId2,
        listId3, shopList1Id, shopList2Id,
        list1ItemId, list1Item2Id, user1RecipeId,
		user2RecipeId, user1RecipeIngrdId,
		user1RecipeIngrd2Id
    } = await genTestUsers();
    usr1Test = {...usr1};
    usr2Test = {...usr2};
    usr1TokenTest = usr1Token;
    usr2TokenTest = usr2Token;
    usr1IdTest = usr1Id;
    usr2IdTest = usr2Id;
    listId1Test = listId1;
	listId2Test = listId2;
	listId3Test = listId3;
    shopList1IdTest = shopList1Id;
    shopList2IdTest = shopList2Id;
    user1RecipeIdTest = user1RecipeId;
    user2RecipeIdTest = user2RecipeId;
	list1ItemIdTest = list1ItemId;
	list1Item2IdTest = list1Item2Id;
	user1RecipeIngrdIdTest = user1RecipeIngrdId;
	user1RecipeIngrd2IdTest = user1RecipeIngrd2Id;
});

afterEach(async () => {
    await db.query(`
        DELETE FROM users;
    `);
});

afterAll(async () => {
    await db.end();
});

describe("/POST /users/register", () => {
    test("register user", async () => {
        // console.log("USER1TEST", usr1Test);
        const req = await request(app).post("/users/register")
            .send({
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
		        "phone": "813 507 4490",
		        "header_img": "testHeaderImage",
		        "profile_img": "testProfileImage",
		        "password": "password"
            });
        expect(req.statusCode).toBe(201);
        expect(req.body).toEqual([{
            "id": expect.any(Number),
		    "username": "dremon",
		    "first_name": "dremon",
		    "last_name": "Lokz",
		    "email": "dremon@g.com",
		    "phone": "813 507 4490",
		    "header_img": "testHeaderImage",
		    "profile_img": "testProfileImage",
		    "token": expect.any(String)
        }]);
    });

    test("400 error for registering user with is_admin", async () => {
        const req = await request(app).post("/users/register")
            .send({
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
		        "phone": "813 507 4490",
		        "header_img": "testHeaderImage",
		        "profile_img": "testProfileImage",
                "is_admin": true,
		        "password": "password"
            });
        expect(req.statusCode).toBe(400);
    });

    test("400 error for registering user with wrong schema", async () => {
        const req = await request(app).post("/users/register")
            .send({
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
		        "phone": 8135074490,
		        "header_img": "testHeaderImage",
		        "profile_img": "testProfileImage",
		        "password": "password"
            });
        expect(req.statusCode).toBe(400);
    });
});

describe("/POST /users/login", () => {
    test("login", async () => {
        const req = await request(app).post("/users/login")
            .send({
                "username": usr1Test.username,
                "password": "password1"
            });
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            { 
                user: {
                    "id": expect.any(Number),
                    "username": usr1Test.username,
                    "token": expect.any(String)
                }
            }
        ]);
    });

    test("400 error for logging in with invalid password", async () => {
        const req = await request(app).post("/users/login")
            .send({
                "username": usr1Test.username,
                "password": "wrongPassword"
            });
        expect(req.statusCode).toBe(400);
    });
});

describe("/GET /users/:username", () => {
    test("get user", async () => {
        const req = await request(app)
            .get(`/users/${usr1Test.username}`)
            .set("_token", `Bearer ${usr1TokenTest}`)
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([{
            user: {
                "id": expect.any(Number),
                "username": usr1Test.username,
                "first_name": usr1Test.first_name,
                "last_name": usr1Test.last_name,
                "email": usr1Test.email,
                "is_admin": false,
                "phone": expect.any(String),
		        "header_img": null,
		        "profile_img": null
            }
        }]);
    });

    test("400 error for not current user", async () => {
        const req = await request(app)
            .get(`/users/${usr1Test.username}`)
            .set("_token", `Bearer ${usr2TokenTest}`)
        expect(req.statusCode).toBe(400);
    });
});

describe("/PATCH /users/:username", () => {
    test("edit user", async () => {
        const req = await request(app)
            .patch(`/users/${usr1Test.username}`)
            .set("_token", `Bearer ${usr1TokenTest}`)
            .send({
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
            })
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([{
            user: {
                "id": expect.any(Number),
                "username": "usr1",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
                "is_admin": false,
                "phone": expect.any(String),
		        "header_img": null,
		        "profile_img": null
            }
        }]);
    });

	test("400 error for editing username", async () => {
        const req = await request(app)
            .patch(`/users/${usr1Test.username}`)
            .set("_token", `Bearer ${usr1TokenTest}`)
            .send({
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
            })
        expect(req.statusCode).toBe(400);
    });

    test("400 error for editing is_admin", async () => {
        const req = await request(app)
            .patch(`/users/${usr1Test.username}`)
            .set("_token", `Bearer ${usr1TokenTest}`)
            .send({
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com",
                "is_admin": true
            })
        expect(req.statusCode).toBe(400);
    });

    test("400 error for not current user", async () => {
        const req = await request(app)
            .patch(`/users/${usr2Test.username}`)
            .set("_token", `Bearer ${usr1TokenTest}`)
            .send({
                "username": "dremon",
		        "first_name": "dremon",
		        "last_name": "Lokz",
		        "email": "dremon@g.com"
            })
        expect(req.statusCode).toBe(400);
    });
});

describe("/DELETE /users/:username", () => {
    test("delete user", async () => {
        const req = await request(app)
            .delete(`/users/${usr1Test.username}`)
            .set("_token", `Bearer ${usr1TokenTest}`)
        expect(req.statusCode).toBe(200);
        const deletedUsr = await db.query(`
            SELECT * FROM users where username = '${usr1Test.username}'
        `);
        expect(deletedUsr.rows.length).toEqual(0);
    });

    test("400 error for not current user", async () => {
        const req = await request(app).delete(`/users/${usr2Test.username}`)
            .set("_token", `Bearer ${usr1TokenTest}`)
        expect(req.statusCode).toBe(400);
    });
});

describe("/GET /users/:id/favorite-recipes", () => {
    test("get user's favorite recipes", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/favorite-recipes`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            {
                "id": 6,
                "name": "egg & avocado open sandwich",
		        "author": "chelsie collins",
		        "rating": 4,
		        "vote_count": 5,
		        "url": "https://www.bbcgoodfood.com/recipes/egg-avocado-open-sandwich",
		        "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/egg-avocado-open-sandwich-3b6ef94.jpg",
		        "description": "Give your lunch box a moreish makeover - take the ingredients separately and assemble for a fresh and healthy midday meal",
		        "serves": 1,
		        "level": "easy",
		        "main_cat_name": "recipes",
		        "sub_cat_name": "lunch recipes",
		        "steps": "Bring a medium pan of water to the boil. Add the eggs and cook for 8-9 mins until hard-boiled. Meanwhile, halve the avocado and scoop the flesh into a bowl. Add the lime juice, season well and mash with a fork. When the eggs are cooked, run under cold water for 2 mins before removing the shells. Spread the avocado on the rye bread. Slice the eggs into thin rounds and place on top of the avocado. Drizzle some chilli sauce over the eggs, scatter the cress on top and add a good grinding of black pepper.",
		        "prep_time": "10 mins",
		        "cook_time": "10 mins"
            },
            {
                "id": 100,
                "name": "next level chilli con carne",
		        "author": "barney desmazery",
		        "rating": 4,
		        "vote_count": 43,
		        "url": "https://www.bbcgoodfood.com/recipes/next-level-chilli-con-carne",
		        "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/the-ultimate-chilli-edb1c8c.jpg",
		        "description": "Reinvent this classic comfort food with our one-pan version that is enrichened with peanut butter, espresso powder and dark chocolate. You won't look back",
		        "serves": 8,
		        "level": "more effort",
		        "main_cat_name": "recipes",
		        "sub_cat_name": "dinner recipes",
		        "steps": "Heat oven to 140C/120C fan/gas 1. Over a high heat, toast the whole chillies on all sides until you can smell them cooking, then remove and set aside. Keep the pan on the heat and toast the peppercorns, cumin seeds and coriander seeds until they just start to change colour, then grind to a powder using a pestle and mortar or spice grinder. Mix with the smoked paprika and oregano (this is a standard tex-mex seasoning), then set aside. Return the casserole to the heat, add half the oil and heat until shimmering. Fry the beef in batches, adding more oil if you need to, until it’s browned on all sides, then set aside. Fry the onions in the pan over a low heat for about 8 mins until soft and golden, then add the garlic and cook for 1 min more. Working fast, add the meat and juices, the spice mix, tomato purée, peanut butter and coffee to the pan and cook for 2-3 mins, stirring to coat the meat until everything is thick and gloopy, then pour in the vinegar and stock. Add the toasted chillies back into the casserole, along with the bay leaves, cinnamon and some salt. Bring to a simmer and stir well, then cover with the lid and cook in the oven for 3hrs, stirring occasionally, until the meat is very tender but not falling apart. Take the casserole out of the oven, put back on the stove and remove the lid. Simmer the sauce for 5 mins, then stir in the semolina flour and simmer for 2-3 mins more. Finely grate over the chocolate, stir through with the beans and simmer for a minute more to heat through. Fish out the chillies, then leave everything to rest for at least 15 mins. Bring the pan to the table. Serve with bowls of accompaniments and the chilli paste (see tip below) to add heat.",
		        "prep_time": "25 mins",
		        "cook_time": "3 hrs"
            }
        ]);
    });

    test("400 error for not current user", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/favorite-recipes`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

    test("400 error for logged out user", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/favorite-recipes`)
        .set("_token", `Bearer`);
		expect(req.statusCode).toBe(400);
    });
});

describe("/POST /users/:id/favorite-recipes", () => {
    test("favorite a recipe", async () => {
		const favReq = await db.query(`
			SELECT * FROM favorite_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 1000]
		);
		expect(favReq.rows.length).toEqual(0);
        const req = await request(app).post(`/users/${usr1IdTest}/favorite-recipes`)
            .send({
                "recipe_id": 1000
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(201);
        expect(req.body).toEqual({ message: "Favorited recipe!" });
		const postFavReq = await db.query(`
			SELECT * FROM favorite_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 1000]
		);
		expect(postFavReq.rows.length).toEqual(1);
    });

	test("400 error for invalid schema", async () => {
		const favReq = await db.query(`
			SELECT * FROM favorite_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 1000]
		);
		expect(favReq.rows.length).toEqual(0);
        const req = await request(app).post(`/users/${usr1IdTest}/favorite-recipes`)
            .send({
                "recipe_id": "1000"
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("400 error for logged out user", async () => {
		const favReq = await db.query(`
			SELECT * FROM favorite_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 1000]
		);
		expect(favReq.rows.length).toEqual(0);
        const req = await request(app).post(`/users/${usr1IdTest}/favorite-recipes`)
            .send({
                "recipe_id": 1000
            })
			.set("_token", `Bearer `);
        expect(req.statusCode).toBe(400);
    });
});

describe("/GET /users/:id/favorite-recipes/:recipe_id", () => {
    test("get recipe from user's favorite recipes", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/favorite-recipes/${100}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            {
                "id": 100,
                "name": "next level chilli con carne",
		        "author": "barney desmazery",
		        "rating": 4,
		        "vote_count": 43,
		        "url": "https://www.bbcgoodfood.com/recipes/next-level-chilli-con-carne",
		        "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/the-ultimate-chilli-edb1c8c.jpg",
		        "description": "Reinvent this classic comfort food with our one-pan version that is enrichened with peanut butter, espresso powder and dark chocolate. You won't look back",
		        "serves": 8,
		        "level": "more effort",
		        "main_cat_name": "recipes",
		        "sub_cat_name": "dinner recipes",
		        "steps": "Heat oven to 140C/120C fan/gas 1. Over a high heat, toast the whole chillies on all sides until you can smell them cooking, then remove and set aside. Keep the pan on the heat and toast the peppercorns, cumin seeds and coriander seeds until they just start to change colour, then grind to a powder using a pestle and mortar or spice grinder. Mix with the smoked paprika and oregano (this is a standard tex-mex seasoning), then set aside. Return the casserole to the heat, add half the oil and heat until shimmering. Fry the beef in batches, adding more oil if you need to, until it’s browned on all sides, then set aside. Fry the onions in the pan over a low heat for about 8 mins until soft and golden, then add the garlic and cook for 1 min more. Working fast, add the meat and juices, the spice mix, tomato purée, peanut butter and coffee to the pan and cook for 2-3 mins, stirring to coat the meat until everything is thick and gloopy, then pour in the vinegar and stock. Add the toasted chillies back into the casserole, along with the bay leaves, cinnamon and some salt. Bring to a simmer and stir well, then cover with the lid and cook in the oven for 3hrs, stirring occasionally, until the meat is very tender but not falling apart. Take the casserole out of the oven, put back on the stove and remove the lid. Simmer the sauce for 5 mins, then stir in the semolina flour and simmer for 2-3 mins more. Finely grate over the chocolate, stir through with the beans and simmer for a minute more to heat through. Fish out the chillies, then leave everything to rest for at least 15 mins. Bring the pan to the table. Serve with bowls of accompaniments and the chilli paste (see tip below) to add heat.",
		        "prep_time": "25 mins",
		        "cook_time": "3 hrs",
		        "reviews": [
			        {
				        "stars": 5,
				        "review": "Good.",
				        "user_id": usr1IdTest
			        }
		        ],
		        "ingredients": [
			        {
						"id": 989,
						"qty": "2",
						"unit": "no unit",
						"ingredient": "dried ancho chillies",
						"ingredient_id": 732,
						"unit_id": 25
					},
					{
						"id": 990,
						"qty": "2",
						"unit": "tsp",
						"ingredient": "black peppercorns",
						"ingredient_id": 733,
						"unit_id": 2
					},
					{
						"id": 991,
						"qty": "2",
						"unit": "tbsp",
						"ingredient": "cumin seeds",
						"ingredient_id": 36,
						"unit_id": 3
					},
					{
						"id": 992,
						"qty": "2",
						"unit": "tbsp",
						"ingredient": "coriander seeds",
						"ingredient_id": 734,
						"unit_id": 3
					},
					{
						"id": 993,
						"qty": "2",
						"unit": "tsp",
						"ingredient": "smoked paprika",
						"ingredient_id": 267,
						"unit_id": 2
					},
					{
						"id": 994,
						"qty": "1",
						"unit": "tbsp",
						"ingredient": "dried oregano",
						"ingredient_id": 322,
						"unit_id": 3
					},
					{
						"id": 995,
						"qty": "3",
						"unit": "tbsp",
						"ingredient": "vegetable oil",
						"ingredient_id": 642,
						"unit_id": 3
					},
					{
						"id": 996,
						"qty": "1½",
						"unit": "kg",
						"ingredient": "braising steak, cut into 4cm cubes – meat from the brisket, short rib, blade or chuck steak are all good",
						"ingredient_id": 735,
						"unit_id": 6
					},
					{
						"id": 997,
						"qty": "2",
						"unit": "no unit",
						"ingredient": "onions, finely chopped",
						"ingredient_id": 736,
						"unit_id": 25
					},
					{
						"id": 998,
						"qty": "6",
						"unit": "no unit",
						"ingredient": "garlic cloves, minced",
						"ingredient_id": 737,
						"unit_id": 25
					},
					{
						"id": 999,
						"qty": "2",
						"unit": "tbsp",
						"ingredient": "tomato purée",
						"ingredient_id": 87,
						"unit_id": 3
					},
					{
						"id": 1000,
						"qty": "1",
						"unit": "tbsp",
						"ingredient": "smooth peanut butter",
						"ingredient_id": 738,
						"unit_id": 3
					},
					{
						"id": 1001,
						"qty": "½",
						"unit": "tsp",
						"ingredient": "instant espresso powder",
						"ingredient_id": 739,
						"unit_id": 2
					},
					{
						"id": 1002,
						"qty": "2",
						"unit": "tbsp",
						"ingredient": "apple cider vinegar",
						"ingredient_id": 459,
						"unit_id": 3
					},
					{
						"id": 1003,
						"qty": "1",
						"unit": "l",
						"ingredient": "beef or chicken stock",
						"ingredient_id": 740,
						"unit_id": 5
					},
					{
						"id": 1004,
						"qty": "2",
						"unit": "no unit",
						"ingredient": "bay leaves",
						"ingredient_id": 429,
						"unit_id": 25
					},
					{
						"id": 1005,
						"qty": "",
						"unit": "no unit",
						"ingredient": "small piece of cinnamon stick",
						"ingredient_id": 741,
						"unit_id": 25
					},
					{
						"id": 1006,
						"qty": "2",
						"unit": "tbsp",
						"ingredient": "semolina, polenta or Mexican masa flour",
						"ingredient_id": 742,
						"unit_id": 3
					},
					{
						"id": 1007,
						"qty": "25",
						"unit": "g",
						"ingredient": "dark chocolate (70-80% cocoa solids)",
						"ingredient_id": 743,
						"unit_id": 1
					}
		        ]
	        }
        ]);
    });

    test("get recipe from user's favorite recipes", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/favorite-recipes/${6}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            {
                "id": 6,
		        "name": "egg & avocado open sandwich",
		        "author": "chelsie collins",
		        "rating": 4,
		        "vote_count": 5,
		        "url": "https://www.bbcgoodfood.com/recipes/egg-avocado-open-sandwich",
		        "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/egg-avocado-open-sandwich-3b6ef94.jpg",
		        "description": "Give your lunch box a moreish makeover - take the ingredients separately and assemble for a fresh and healthy midday meal",
		        "serves": 1,
		        "level": "easy",
		        "main_cat_name": "recipes",
		        "sub_cat_name": "lunch recipes",
		        "steps": "Bring a medium pan of water to the boil. Add the eggs and cook for 8-9 mins until hard-boiled. Meanwhile, halve the avocado and scoop the flesh into a bowl. Add the lime juice, season well and mash with a fork. When the eggs are cooked, run under cold water for 2 mins before removing the shells. Spread the avocado on the rye bread. Slice the eggs into thin rounds and place on top of the avocado. Drizzle some chilli sauce over the eggs, scatter the cress on top and add a good grinding of black pepper.",
		        "prep_time": "10 mins",
		        "cook_time": "10 mins",
		        "reviews": [],
		        "ingredients": [
			        {
						"id": 53,
						"qty": "2",
						"unit": "no unit",
						"ingredient": "medium eggs",
						"ingredient_id": 53,
						"unit_id": 25
					},
					{
						"id": 54,
						"qty": "1",
						"unit": "no unit",
						"ingredient": "ripe avocado",
						"ingredient_id": 54,
						"unit_id": 25
					},
					{
						"id": 55,
						"qty": "",
						"unit": "no unit",
						"ingredient": "juice 1 lime",
						"ingredient_id": 55,
						"unit_id": 25
					},
					{
						"id": 56,
						"qty": "2",
						"unit": "no unit",
						"ingredient": "slices rye bread",
						"ingredient_id": 56,
						"unit_id": 25
					},
					{
						"id": 57,
						"qty": "2",
						"unit": "tsp",
						"ingredient": "hot chilli sauce - we used sriracha",
						"ingredient_id": 57,
						"unit_id": 2
					}
		        ]
	        }
        ]);
    });

    test("empty array for recipe not in favorites", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/favorite-recipes/${76}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.body).toEqual([]);
    });

    test("400 error for not current user", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/favorite-recipes/${6}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });
});

describe("/DELETE /users/:id/favorite-recipes/:recipe_id", () => {
    test("delete recipe from user's favorite recipes", async () => {
        const favReq = await db.query(`
			SELECT * FROM favorite_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 6]
		);
		expect(favReq.rows.length).toEqual(1);
		const req = await request(app).delete(`/users/${usr1IdTest}/favorite-recipes/${6}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
		const postFavReq = await db.query(`
			SELECT * FROM favorite_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 6]
		);
		expect(postFavReq.rows.length).toEqual(0);
	});

	test("404 error for delete recipe that doesn't exist", async () => {
        const favReq = await db.query(`
			SELECT * FROM favorite_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 200]
		);
		expect(favReq.rows.length).toEqual(0);
		const req = await request(app).delete(`/users/${usr1IdTest}/favorite-recipes/${200}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
	});

	test("400 error for not current user", async () => {
		const req = await request(app).delete(`/users/${usr2IdTest}/favorite-recipes/${6}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
	});
});

describe("/GET /users/:id/saved-recipes", () => {
    test("get user's saved recipes", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/saved-recipes`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            {
                "id": 400,
		        "name": "nettle & blue cheese rarebit",
		        "author": "good food team",
		        "rating": 5,
		        "vote_count": 3,
		        "url": "https://www.bbcgoodfood.com/recipes/nettle-blue-cheese-rarebit",
		        "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-1286499_8-0596bb1.jpg",
		        "description": "No nettles? This simple rustic dish can also be made using spinach",
		        "serves": 4,
		        "level": "easy",
		        "main_cat_name": "recipes",
		        "sub_cat_name": "cheese recipes",
		        "steps": "Heat the olive oil in a frying pan. Add the nettles and cook for 1 min until wilted. Allow to cool for 1 min, then roughly chop. Add to a bowl with the crème fraÎche, mustard and half the blue cheese. Stir in seasoning and set aside. Heat the grill and lightly toast the bread on both sides. Divide the nettle and cheese mix between the toasts then pile on the remaining cheese and grill until golden and bubbling. Serve immediately.",
		        "prep_time": "5 mins",
		        "cook_time": "15 mins"
            },
            {
                "id": 300,
		        "name": "vegan chilli",
		        "author": "barney desmazery",
		        "rating": 5,
		        "vote_count": 232,
		        "url": "https://www.bbcgoodfood.com/recipes/vegan-chilli",
		        "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/vegan-chilli-be48585.jpg",
		        "description": "Our healthy vegan chilli recipe packs in plenty of vegetables and doesn’t fall short on the flavour front. Serve it with rice or in jacket potatoes for a filling supper",
		        "serves": 4,
		        "level": "easy",
		        "main_cat_name": "recipes",
		        "sub_cat_name": "storecupboard",
		        "steps": "Heat the oven to 200C/180C fan/gas 6. Put the sweet potato in a roasting tin and drizzle over 1½ tbsp oil, 1 tsp smoked paprika and 1 tsp ground cumin. Give everything a good mix so that all the chunks are coated in spices, season with salt and pepper, then roast for 25 mins until cooked. Meanwhile, heat the remaining oil in a large saucepan over a medium heat. Add the onion, carrot and celery. Cook for 8-10 mins, stirring occasionally until soft, then crush in the garlic and cook for 1 min more. Add the remaining dried spices and tomato purée. Give everything a good mix and cook for 1 min more. Add the red pepper, chopped tomatoes and 200ml water. Bring the chilli to a boil, then simmer for 20 mins. Tip in the beans and cook for another 10 mins before adding the sweet potato. Season to taste then serve with lime wedges, guacamole, rice and coriander. Will keep, in an airtight container in the freezer, for up to three months.To make in a slow cookerHeat the oil in a large frying pan over a medium heat. Add the onion, carrot and celery. Cook for 8-10 mins, stirring occasionally until soft, then crush in the garlic, tip in the sweet potato chunks and cook for 1 min more. Add all the dried spices, oregano and tomato purée, cook for 1 min, then tip into a slow cooker.Add the red pepper and chopped tomatoes. Give everything a good stir then cook on low for 5 hrs. Stir in the beans and cook for another 30 mins to 1 hr. Season to taste and serve with lime wedges, guacamole, rice and coriander.",
		        "prep_time": "15 mins",
		        "cook_time": "45 mins"
            }
        ]);
    });

	test("empty array for user with no favorite recipes", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/saved-recipes`)
            .set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([]);
	});

    test("400 error for not current user", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/saved-recipes`)
            .set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(400);
    });
});


describe("/POST /users/:id/saved-recipes", () => {
    test("save a recipe", async () => {
		const savReq = await db.query(`
			SELECT * FROM saved_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 1000]
		);
		expect(savReq.rows.length).toEqual(0);
        const req = await request(app).post(`/users/${usr1IdTest}/saved-recipes`)
            .send({
                "recipe_id": 1000
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(201);
        expect(req.body).toEqual( { message: "Saved recipe!" } );
		const postSavReq = await db.query(`
			SELECT * FROM saved_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 1000]
		);
		expect(postSavReq.rows.length).toEqual(1);
    });

	test("400 error for invalid schema", async () => {
		const savReq = await db.query(`
			SELECT * FROM saved_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 1000]
		);
		expect(savReq.rows.length).toEqual(0);
        const req = await request(app).post(`/users/${usr1IdTest}/saved-recipes`)
            .send({
                "recipe_id": "1000"
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("400 error for logged out user", async () => {
		const savReq = await db.query(`
			SELECT * FROM saved_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 1000]
		);
		expect(savReq.rows.length).toEqual(0);
        const req = await request(app).post(`/users/${usr1IdTest}/saved-recipes`)
            .send({
                "recipe_id": 1000
            })
			.set("_token", `Bearer `);
        expect(req.statusCode).toBe(400);
    });
});

describe("/GET /users/:id/saved-recipes/:recipe_id", () => {
    test("get recipe from user's saved recipes", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/saved-recipes/${400}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            {
                "id": 400,
		        "name": "nettle & blue cheese rarebit",
		        "author": "good food team",
		        "rating": 5,
		        "vote_count": 3,
		        "url": "https://www.bbcgoodfood.com/recipes/nettle-blue-cheese-rarebit",
		        "image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-1286499_8-0596bb1.jpg",
		        "description": "No nettles? This simple rustic dish can also be made using spinach",
		        "serves": 4,
		        "level": "easy",
		        "main_cat_name": "recipes",
		        "sub_cat_name": "cheese recipes",
		        "steps": "Heat the olive oil in a frying pan. Add the nettles and cook for 1 min until wilted. Allow to cool for 1 min, then roughly chop. Add to a bowl with the crème fraÎche, mustard and half the blue cheese. Stir in seasoning and set aside. Heat the grill and lightly toast the bread on both sides. Divide the nettle and cheese mix between the toasts then pile on the remaining cheese and grill until golden and bubbling. Serve immediately.",
		        "prep_time": "5 mins",
		        "cook_time": "15 mins",
		        "reviews": [],
		        "ingredients": [
			        {
						"id": 3617,
						"qty": "1",
						"unit": "tbsp",
						"ingredient": "olive oil",
						"ingredient_id": 16,
						"unit_id": 3
					},
					{
						"id": 3618,
						"qty": "200",
						"unit": "g",
						"ingredient": "nettle leave",
						"ingredient_id": 2269,
						"unit_id": 1
					},
					{
						"id": 3619,
						"qty": "200",
						"unit": "ml",
						"ingredient": "tub crème fraîche",
						"ingredient_id": 2270,
						"unit_id": 4
					},
					{
						"id": 3620,
						"qty": "1",
						"unit": "tsp",
						"ingredient": "wholegrain mustard",
						"ingredient_id": 1107,
						"unit_id": 2
					},
					{
						"id": 3621,
						"qty": "140",
						"unit": "g",
						"ingredient": "British blue cheese, such as Blue Vinney",
						"ingredient_id": 2271,
						"unit_id": 1
					}
		        ]
	        }
        ]);
    });

    test("empty array for recipe not in saved recipes", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/saved-recipes/${76}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.body).toEqual([]);
    });

    test("400 error for not current user", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/saved-recipes/${6}`)
            .set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(400);
    });
});

describe("/DELETE /:id/saved-recipes/:recipe_id", () => {
    test("delete recipe from user's saved recipes", async () => {
        const savReq = await db.query(`
			SELECT * FROM saved_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 300]
		);
		expect(savReq.rows.length).toEqual(1);
		const req = await request(app).delete(`/users/${usr1IdTest}/saved-recipes/${300}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
		const postSavReq = await db.query(`
			SELECT * FROM saved_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 300]
		);
		expect(postSavReq.rows.length).toEqual(0);
	});

	test("404 error for delete recipe that doesn't exist", async () => {
        const savReq = await db.query(`
			SELECT * FROM saved_recipes WHERE user_id = $1
			AND recipe_id = $2`,
			[usr1IdTest, 500]
		);
		expect(savReq.rows.length).toEqual(0);
		const req = await request(app).delete(`/users/${usr1IdTest}/saved-recipes/${500}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
	});

	test("400 error for logged out user", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/saved-recipes/${500}`)
            .set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
	});
});


describe("/GET /users/:id/recipelists", () => {
    test("get user's recipelists", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/recipelists`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            {
				"id": expect.any(Number),
				"list_name": "rasta bash",
				"occasion": "party"
			},
            {
				"id": expect.any(Number),
				"list_name": "weekly meals",
				"occasion": "meal prep"
			}
        ]);
    });

    test("400 error for not current user", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/recipelists`)
            .set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(400);
    });
});


describe("/POST /users/:id/recipelists", () => {
    test("create a recipelist", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipelists`)
            .send({
				"user_id": usr1IdTest,
                "occasion_id": 5,
				"list_name": "Test Recipelist"
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(201);
        expect(req.body).toEqual({
			"id": expect.any(Number),
			"list_name": "Test Recipelist",
			"occasion": "birthday"
		});
    });

	test("400 error for invalid schema", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipelists`)
            .send({
				"user_id": usr1IdTest,
                "occasion_id": "5",
				"list_name": "Test Recipelist"
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("400 error for not current user", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipelists`)
            .send({
				"user_id": usr2IdTest + 1,
                "occasion_id": "5",
				"list_name": "Test Recipelist"
            })
			.set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("400 error for logged out user", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipelists`)
            .send({
				"user_id": usr1IdTest,
                "occasion_id": "5",
				"list_name": "Test Recipelist"
            })
			.set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
    });
});

describe("/GET /users/:id/recipelists/:list_id", () => {
    test("get recipelist recipes", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/recipelists/${listId1Test}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual({
			"list_name": "weekly meals",
			"occasion": "meal prep",
            "recipes": [
				{
					"id": 460,
					"name": "apple flapjack crumble",
					"author": "mary cadogan",
					"rating": 5,
					"vote_count": 154,
					"url": "https://www.bbcgoodfood.com/recipes/apple-flapjack-crumble",
					"image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-1069547_10-f1dcd02.jpg",
					"description": "Sweetening the apples with apricot jam and orange juice makes it twice as fruity and adding a little syrup to the oaty crumble makes great little chewy clusters",
					"serves": 6,
					"level": "easy",
					"main_cat_name": "recipes",
					"sub_cat_name": "desserts",
					"steps": "Heat oven to 190C/fan 170C/gas 5. Peel, core and thinly slice the apples and mix with the jam and orange juice. Spread evenly over a buttered 1.5-litre ovenproof dish, not too deep. Mix the oats, flour and cinnamon in a large bowl. Add the butter in small chunks and rub in gently. Stir in the sugar and rub in again. Drizzle over the syrup, mixing with a knife so it forms small clumps. Sprinkle evenly over the apples and bake for 30-35 mins until the juices from the apples start to bubble up. Cool for 10 mins, then serve with custard, cream or ice cream.",
					"prep_time": "20 mins",
					"cook_time": "35 mins"
				},
				{
					"id": 450,
					"name": "sticky cinnamon figs",
					"author": "jane hornby",
					"rating": 5,
					"vote_count": 30,
					"url": "https://www.bbcgoodfood.com/recipes/sticky-cinnamon-figs",
					"image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-339086_11-8e6b423.jpg",
					"description": "A simple and stylish nutty fig pudding ready in just 10 minutes",
					"serves": 4,
					"level": "easy",
					"main_cat_name": "recipes",
					"sub_cat_name": "desserts",
					"steps": "Heat grill to medium high. Cut a deep cross in the top of each fig then ease the top apart like a flower. Sit the figs in a baking dish and drop a small piece of the butter into the centre of each fruit. Drizzle the honey over the figs, then sprinkle with the nuts and spice. Grill for 5 mins until figs are softened and the honey and butter make a sticky sauce in the bottom of the dish. Serve warm, with dollops of mascarpone or yogurt.",
					"prep_time": "5 mins",
					"cook_time": "5 mins"
				}
			]
        });
    });

    test("400 error for not current user", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/recipelists/${listId1Test}`)
            .set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

    test("404 error for not found list", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/recipelists/${listId3Test + 1}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
    });

    test("400 error for not logged in user", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/recipelists/${listId1Test}`)
            .set("_token", `Bearer `);
        expect(req.statusCode).toBe(400);
    });
});

describe("/POST /users/:id/recipelists/:list_id", () => {
    test("add a recipe to a recipelist", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipelists/${listId1Test}`)
            .send({
                "recipe_id": 5
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(201);
        expect(req.body).toEqual({
			"list_name": "weekly meals",
			"occasion": "meal prep",
            "recipes": [
				{
					"id": 460,
					"name": "apple flapjack crumble",
					"author": "mary cadogan",
					"rating": 5,
					"vote_count": 154,
					"url": "https://www.bbcgoodfood.com/recipes/apple-flapjack-crumble",
					"image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-1069547_10-f1dcd02.jpg",
					"description": "Sweetening the apples with apricot jam and orange juice makes it twice as fruity and adding a little syrup to the oaty crumble makes great little chewy clusters",
					"serves": 6,
					"level": "easy",
					"main_cat_name": "recipes",
					"sub_cat_name": "desserts",
					"steps": "Heat oven to 190C/fan 170C/gas 5. Peel, core and thinly slice the apples and mix with the jam and orange juice. Spread evenly over a buttered 1.5-litre ovenproof dish, not too deep. Mix the oats, flour and cinnamon in a large bowl. Add the butter in small chunks and rub in gently. Stir in the sugar and rub in again. Drizzle over the syrup, mixing with a knife so it forms small clumps. Sprinkle evenly over the apples and bake for 30-35 mins until the juices from the apples start to bubble up. Cool for 10 mins, then serve with custard, cream or ice cream.",
					"prep_time": "20 mins",
					"cook_time": "35 mins"
				},
				{
					"id": 5,
					"name": "falafel burgers",
					"author": "good food team",
					"rating": 4,
					"vote_count": 710,
					"url": "https://www.bbcgoodfood.com/recipes/falafel-burgers-0",
					"image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-326597_11-b7385b9.jpg",
					"description": "A healthy burger that's filling too. These are great for anyone after a satisfying bite low in calories.",
					"serves": 4,
					"level": "easy",
					"main_cat_name": "recipes",
					"sub_cat_name": "lunch recipes",
					"steps": "Drain the chickpeas and pat dry with kitchen paper. Tip into a food processor along with the onion, garlic, parsley, cumin, coriander, harissa paste, flour and a little salt. Blend until fairly smooth, then shape into four patties with your hands. Heat the sunflower oil in a non-stick frying pan, and fry the burgers for 3 mins on each side until lightly golden. Serve with the toasted pitta bread, tomato salsa and green salad.",
					"prep_time": "10 mins",
					"cook_time": "6 mins",
				},
				{
					"id": 450,
					"name": "sticky cinnamon figs",
					"author": "jane hornby",
					"rating": 5,
					"vote_count": 30,
					"url": "https://www.bbcgoodfood.com/recipes/sticky-cinnamon-figs",
					"image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-339086_11-8e6b423.jpg",
					"description": "A simple and stylish nutty fig pudding ready in just 10 minutes",
					"serves": 4,
					"level": "easy",
					"main_cat_name": "recipes",
					"sub_cat_name": "desserts",
					"steps": "Heat grill to medium high. Cut a deep cross in the top of each fig then ease the top apart like a flower. Sit the figs in a baking dish and drop a small piece of the butter into the centre of each fruit. Drizzle the honey over the figs, then sprinkle with the nuts and spice. Grill for 5 mins until figs are softened and the honey and butter make a sticky sauce in the bottom of the dish. Serve warm, with dollops of mascarpone or yogurt.",
					"prep_time": "5 mins",
					"cook_time": "5 mins"
				}
			]
		});
    });

	test("400 error for invalid schema", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipelists/${listId1Test}`)
            .send({
				"recipe_id": "5"
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("404 error for not found list", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipelists/${listId3Test}`)
            .send({
				"recipe_id": 5
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
    });

	test("400 error for not current user", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipelists/${listId1Test}`)
            .send({
				"recipe_id": "5"
            })
			.set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(400);
    });
});

describe("/DELETE /users/:id/recipelists/:list_id", () => {
    test("delete recipelist", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/recipelists/${listId1Test}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
		expect(req.body).toEqual({
			message: "Deleted recipelist!"
		});
	});

	test("404 error for not found recipelist", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/recipelists/${listId3Test}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
	});

	test("400 error for not current user", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/recipelists/${listId1Test}`)
            .set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(400);
	});

	test("400 error for logged out user", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/recipelists/${listId1Test}`)
            .set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
	});

});

describe("/GET /users/:id/recipelists/:list_id/:recipe_id", () => {
    test("get recipelist recipe", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/recipelists/${listId1Test}/${450}`)
            .set("_token", `Bearer ${usr1TokenTest}`);

        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            {
				"list_name": "weekly meals",
				"occasion": "meal prep",
            	"recipe": [
					{
						"id": 450,
						"name": "sticky cinnamon figs",
						"author": "jane hornby",
						"rating": 5,
						"vote_count": 30,
						"url": "https://www.bbcgoodfood.com/recipes/sticky-cinnamon-figs",
						"image": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/recipe-image-legacy-id-339086_11-8e6b423.jpg",
						"description": "A simple and stylish nutty fig pudding ready in just 10 minutes",
						"serves": 4,
						"level": "easy",
						"main_cat_name": "recipes",
						"sub_cat_name": "desserts",
						"steps": "Heat grill to medium high. Cut a deep cross in the top of each fig then ease the top apart like a flower. Sit the figs in a baking dish and drop a small piece of the butter into the centre of each fruit. Drizzle the honey over the figs, then sprinkle with the nuts and spice. Grill for 5 mins until figs are softened and the honey and butter make a sticky sauce in the bottom of the dish. Serve warm, with dollops of mascarpone or yogurt.",
						"prep_time": "5 mins",
						"cook_time": "5 mins",
                		// "liked_user_ids": [],
	            		// "disliked_user_ids": [],
	            		// "reviews": [],
	            		"ingredients": [
		            		{
								"id": 3904,
								"qty": "8",
								"unit": "no unit",
								"ingredient": "ripe figs",
								"ingredient_id": 2289,
								"unit_id": 25
							},
							{
								"id": 3905,
								"qty": "",
								"unit": "no unit",
								"ingredient": "large  knob of butter",
								"ingredient_id": 2422,
								"unit_id": 25
							},
							{
								"id": 3906,
								"qty": "4",
								"unit": "tbsp",
								"ingredient": "clear honey",
								"ingredient_id": 135,
								"unit_id": 3
							},
							{
								"id": 3907,
								"qty": "",
								"unit": "no unit",
								"ingredient": "handful  shelled pistachio  nuts or almonds",
								"ingredient_id": 2423,
								"unit_id": 25
							},
							{
								"id": 3908,
								"qty": "1",
								"unit": "tsp",
								"ingredient": "ground cinnamon  or mixed spice",
								"ingredient_id": 2424,
								"unit_id": 2
							}
						]
					}
				]
			}]);
    });

    test("400 error for not current user", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/recipelists/${listId1Test}/${450}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

    test("404 error for not found recipelist", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/recipelists/${listId3Test}/${450}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
    });

    test("400 error for logged out user", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/recipelists/${listId1Test}/${450}`)
            .set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
    });
});

describe("/DELETE /users/:id/recipelists/:list_id/:recipe_id", () => {
    test("delete recipe from recipelist", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/recipelists/${listId1Test}/${450}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
		expect(req.body).toEqual({
			message: "Deleted recipe from recipelist!"
		});
	});

	test("400 error for not current user", async () => {
		const req = await request(app).delete(`/users/${usr2IdTest}/recipelists/${listId1Test}/${450}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
	});

	test("404 error for not found recipelist", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/recipelists/${listId3Test}/${450}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
	});

	test("400 error for logged out user", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/recipelists/${listId1Test}/${450}`)
            .set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
	});

});

describe("/GET /users/:id/shoppinglists", () => {
    test("get user 1 shoppinglists", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/shoppinglists`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            {
				"id": expect.any(Number),
				"list_name": "User 1 Shoplist for Recipe 120",
				"recipe_id": 120
			}
        ]);
    });

    test("get user 2 shoppinglists", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/shoppinglists`)
            .set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            {
				"id": expect.any(Number),
				"list_name": "User 2 Shoplist for Recipe 320",
				"recipe_id": 320
			}
        ]);
    });

    test("400 error for not current user", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/shoppinglists`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });
});


describe("/POST /users/:id/shoppinglists", () => {
    test("create a shoppinglist", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/shoppinglists`)
            .send({
                "recipe_id": 5,
				"list_name": "Test Shoppinglist"
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(201);
        expect(req.body).toEqual([
			{
				"id": expect.any(Number),
				"list_name": "Test Shoppinglist",
				"recipe_id": 5
			},
			{
				"id": expect.any(Number),
				"list_name": "User 1 Shoplist for Recipe 120",
				"recipe_id": 120
			}
		]);
    });

	test("400 error for invalid schema", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/shoppinglists`)
            .send({
				"recipe_id": "5",
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("400 error for not current user", async () => {
        const req = await request(app).post(`/users/${usr2IdTest}/shoppinglists`)
            .send({
				"recipe_id": 5,
				"list_name": "Test Shoppinglist"
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("400 error for logged out user", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/shoppinglists`)
            .send({
				"recipe_id": 5,
				"list_name": "Test Shoppinglist"
            })
			.set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
    });
});

describe("/GET /users/:id/shoppinglists/:list_id", () => {
    test("get user 1 shoppinglist", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/shoppinglists/${shopList1IdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual(
            {
				"list_name": "User 1 Shoplist for Recipe 120",
				"recipe_name": "double bean & roasted pepper chilli",
				"recipe_author": "sarah cook",
				"recipes_ingredients": [
					{
						"id": 1262,
						"qty": "2",
						"unit": "no unit",
						"ingredient": "onions, chopped",
						"ingredient_id": 316,
						"unit_id": 25
					},
					{
						"id": 1263,
						"qty": "2",
						"unit": "no unit",
						"ingredient": "celery sticks, finely chopped",
						"ingredient_id": 783,
						"unit_id": 25
					},
					{
						"id": 1264,
						"qty": "2",
						"unit": "no unit",
						"ingredient": "yellow or orange peppers, finely chopped",
						"ingredient_id": 891,
						"unit_id": 25
					},
					{
						"id": 1265,
						"qty": "2",
						"unit": "tbsp",
						"ingredient": "sunflower oil or rapeseed oil",
						"ingredient_id": 892,
						"unit_id": 3
					},
					{
						"id": 1266,
						"qty": "2x460",
						"unit": "g",
						"ingredient": "jars roasted red peppers",
						"ingredient_id": 893,
						"unit_id": 1
					},
					{
						"id": 1267,
						"qty": "2",
						"unit": "tsp",
						"ingredient": "chipotle paste",
						"ingredient_id": 338,
						"unit_id": 2
					},
					{
						"id": 1268,
						"qty": "2",
						"unit": "tbsp",
						"ingredient": "red wine vinegar",
						"ingredient_id": 260,
						"unit_id": 3
					},
					{
						"id": 1269,
						"qty": "1",
						"unit": "tbsp",
						"ingredient": "cocoa powder",
						"ingredient_id": 894,
						"unit_id": 3
					},
					{
						"id": 1270,
						"qty": "1",
						"unit": "tbsp",
						"ingredient": "dried oregano",
						"ingredient_id": 322,
						"unit_id": 3
					},
					{
						"id": 1271,
						"qty": "1",
						"unit": "tbsp",
						"ingredient": "sweet smoked paprika",
						"ingredient_id": 815,
						"unit_id": 3
					},
					{
						"id": 1272,
						"qty": "2",
						"unit": "tbsp",
						"ingredient": "ground cumin",
						"ingredient_id": 43,
						"unit_id": 3
					},
					{
						"id": 1273,
						"qty": "1",
						"unit": "tsp",
						"ingredient": "ground cinnamon",
						"ingredient_id": 523,
						"unit_id": 2
					},
					{
						"id": 1274,
						"qty": "2x400",
						"unit": "g",
						"ingredient": "cans chopped tomatoes",
						"ingredient_id": 664,
						"unit_id": 1
					},
					{
						"id": 1275,
						"qty": "400",
						"unit": "g",
						"ingredient": "can refried beans",
						"ingredient_id": 895,
						"unit_id": 1
					},
					{
						"id": 1276,
						"qty": "3x400",
						"unit": "g",
						"ingredient": "cans kidney beans, drained and rinsed",
						"ingredient_id": 896,
						"unit_id": 1
					}
				],
				"list_items": [
                    {
						"id": expect.any(Number),
						"qty": "20",
						"unit": "oz",
						"ingredient": "boneless, skinless chicken breast"
					},
					{
						"id": expect.any(Number),
						"qty": "3",
						"unit": "tbsp",
						"ingredient": "garlic granules"
					}
				]
			}
        );
    });

    test("get user 2 shoppinglist", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/shoppinglists/${shopList2IdTest}`)
            .set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual(
            {
				"list_name": "User 2 Shoplist for Recipe 320",
				"recipe_name": "lemony broad beans with goat's cheese, peas & mint",
				"recipe_author": "esther clark",
				"recipes_ingredients": [
					{
						"id": 2933,
						"qty": "40",
						"unit": "g",
						"ingredient": "blanched hazelnuts",
						"ingredient_id": 1853,
						"unit_id": 1
					},
					{
						"id": 2934,
						"qty": "250",
						"unit": "g",
						"ingredient": "broad beans, podded and skins removed from the beans",
						"ingredient_id": 1854,
						"unit_id": 1
					},
					{
						"id": 2935,
						"qty": "200",
						"unit": "g",
						"ingredient": "fresh peas",
						"ingredient_id": 1855,
						"unit_id": 1
					},
					{
						"id": 2936,
						"qty": "4",
						"unit": "tbsp",
						"ingredient": "extra virgin olive oil, plus a drizzle to serve",
						"ingredient_id": 1856,
						"unit_id": 3
					},
					{
						"id": 2937,
						"qty": "2",
						"unit": "no unit",
						"ingredient": "banana shallots, peeled and thinly sliced",
						"ingredient_id": 1857,
						"unit_id": 25
					},
					{
						"id": 2938,
						"qty": "1⁄2",
						"unit": "no unit",
						"ingredient": "small bunch of mint, finely chopped, plus extra leaves to serve",
						"ingredient_id": 1858,
						"unit_id": 25
					},
					{
						"id": 2939,
						"qty": "½",
						"unit": "no unit",
						"ingredient": "small bunch of flat-leaf parsley, finely chopped",
						"ingredient_id": 1859,
						"unit_id": 25
					},
					{
						"id": 2940,
						"qty": "1",
						"unit": "no unit",
						"ingredient": "lemon, zested and juiced",
						"ingredient_id": 97,
						"unit_id": 25
					},
					{
						"id": 2941,
						"qty": "150",
						"unit": "g",
						"ingredient": "log goat's cheese  with rind, sliced into 5mm rounds",
						"ingredient_id": 1860,
						"unit_id": 1
					}
				],
				"list_items": [
					{
						"id": expect.any(Number),
						"qty": "20",
						"unit": "oz",
						"ingredient": "boneless, skinless chicken breast"
					}
				]
			}
        );
    });

    test("400 error for not current user", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/shoppinglists/${shopList2IdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

    test("404 error for not found shoppping list", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/shoppinglists/${shopList2IdTest + 1}`)
            .set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(404);
    });
});


describe("/DELETE /:id/shoppinglists/:list_id", () => {
    test("delete shoppinglist", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/shoppinglists/${shopList1IdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
		expect(req.body).toEqual({
			message: "Deleted shoppinglist!"
		});
	});

	test("404 error for not found list", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/shoppinglists/${shopList2IdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
	});

	test("400 error for not current user", async () => {
		const req = await request(app).delete(`/users/${usr2IdTest}/shoppinglists/${shopList2IdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
	});

	test("400 error for logged out user", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/shoppinglists/${shopList2IdTest}`)
            .set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
	});
});


describe("/POST /:id/shoppinglists/:list_id/items", () => {
    test("add an item to a shoppinglist", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/shoppinglists/${shopList1IdTest}/items`)
            .send({
				"qty": "1",
                "unit_id": 6,
				"ingredient_id": 135
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(201);
        expect(req.body).toEqual({
			"list_name": "User 1 Shoplist for Recipe 120",
			"recipe_name": "double bean & roasted pepper chilli",
			"recipe_author": "sarah cook",
			"recipes_ingredients": [
				{
					"id": 1262,
					"qty": "2",
					"unit": "no unit",
					"ingredient": "onions, chopped",
					"ingredient_id": 316,
					"unit_id": 25
				},
				{
					"id": 1263,
					"qty": "2",
					"unit": "no unit",
					"ingredient": "celery sticks, finely chopped",
					"ingredient_id": 783,
					"unit_id": 25
				},
				{
					"id": 1264,
					"qty": "2",
					"unit": "no unit",
					"ingredient": "yellow or orange peppers, finely chopped",
					"ingredient_id": 891,
					"unit_id": 25
				},
				{
					"id": 1265,
					"qty": "2",
					"unit": "tbsp",
					"ingredient": "sunflower oil or rapeseed oil",
					"ingredient_id": 892,
					"unit_id": 3
				},
				{
					"id": 1266,
					"qty": "2x460",
					"unit": "g",
					"ingredient": "jars roasted red peppers",
					"ingredient_id": 893,
					"unit_id": 1
				},
				{
					"id": 1267,
					"qty": "2",
					"unit": "tsp",
					"ingredient": "chipotle paste",
					"ingredient_id": 338,
					"unit_id": 2
				},
				{
					"id": 1268,
					"qty": "2",
					"unit": "tbsp",
					"ingredient": "red wine vinegar",
					"ingredient_id": 260,
					"unit_id": 3
				},
				{
					"id": 1269,
					"qty": "1",
					"unit": "tbsp",
					"ingredient": "cocoa powder",
					"ingredient_id": 894,
					"unit_id": 3
				},
				{
					"id": 1270,
					"qty": "1",
					"unit": "tbsp",
					"ingredient": "dried oregano",
					"ingredient_id": 322,
					"unit_id": 3
				},
				{
					"id": 1271,
					"qty": "1",
					"unit": "tbsp",
					"ingredient": "sweet smoked paprika",
					"ingredient_id": 815,
					"unit_id": 3
				},
				{
					"id": 1272,
					"qty": "2",
					"unit": "tbsp",
					"ingredient": "ground cumin",
					"ingredient_id": 43,
					"unit_id": 3
				},
				{
					"id": 1273,
					"qty": "1",
					"unit": "tsp",
					"ingredient": "ground cinnamon",
					"ingredient_id": 523,
					"unit_id": 2
				},
				{
					"id": 1274,
					"qty": "2x400",
					"unit": "g",
					"ingredient": "cans chopped tomatoes",
					"ingredient_id": 664,
					"unit_id": 1
				},
				{
					"id": 1275,
					"qty": "400",
					"unit": "g",
					"ingredient": "can refried beans",
					"ingredient_id": 895,
					"unit_id": 1
				},
				{
					"id": 1276,
					"qty": "3x400",
					"unit": "g",
					"ingredient": "cans kidney beans, drained and rinsed",
					"ingredient_id": 896,
					"unit_id": 1
				}
			],
			"list_items": [
				{
					"id": expect.any(Number),
					"qty": "20",
					"unit": "oz",
					"ingredient": "boneless, skinless chicken breast"
				},
				{
					"id": expect.any(Number),
					"qty": "3",
					"unit": "tbsp",
					"ingredient": "garlic granules"
				},
				{
					"id": expect.any(Number),
					"qty": "1",
					"unit": "kg",
					"ingredient": "clear honey"
				}
			]
		});
    });

	test("400 error for invalid schema", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/shoppinglists/${shopList1IdTest}/items`)
            .send({
                "unit_id": 6,
				"ingredient_id": 135
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("400 error for invalid schema", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/shoppinglists/${shopList1IdTest}/items`)
            .send({
				"qty": 6,
                "unit_id": 6,
				"ingredient_id": 135
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("400 error for not current user", async () => {
        const req = await request(app).post(`/users/${usr2IdTest}/shoppinglists/${shopList1IdTest}/items`)
            .send({
				"qty": "1",
                "unit_id": 6,
				"ingredient_id": 135
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("404 error for not found shoppinglist", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/shoppinglists/${shopList2IdTest}/items`)
            .send({
				"qty": "1",
                "unit_id": 6,
				"ingredient_id": 135
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
    });

	test("400 error for logged out user", async () => {
        const req = await request(app).post(`/users/${usr2IdTest}/shoppinglists/${shopList2IdTest + 1}/items`)
            .send({
				"qty": "1",
                "unit_id": 6,
				"ingredient_id": 135
            })
			.set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
    });
});


describe("/DELETE /:id/shoppinglists/:list_id/items", () => {
    test("delete shoppinglist item", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/shoppinglists/${shopList1IdTest}/items`)
			.send({
				"item_id": list1ItemIdTest
			})
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
		expect(req.body).toEqual({
			message: "Deleted item from shoppinglist!"
		});
	});

	test("404 error for not found list", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/shoppinglists/${shopList2IdTest}/items`)
        .send({
			"item_id": list1ItemIdTest
		})    
		.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
	});

	test("404 error for not found list item", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/shoppinglists/${shopList1IdTest}/items`)
        .send({
			"item_id": list1ItemIdTest + list1Item2IdTest
		})    
		.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
	});

	test("400 error for not current user", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/shoppinglists/${shopList1IdTest}/items`)
        .send({
			"item_id": list1ItemIdTest
		})
		.set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(400);
	});

	test("400 error for invalid schema", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/shoppinglists/${shopList1IdTest}/items`)
        .send({
			"itemId": list1ItemIdTest
		})
		.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
	});
});

describe("/GET /:id/recipes", () => {
    test("get user 1 recipes", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/recipes`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            {
				"id": expect.any(Number),
				"recipe_name": "User 1 Chicken Dumplings Tweak"
			}
        ]);
    });

    test("get user 2 recipes", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/recipes`)
            .set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual([
            {
				"id": expect.any(Number),
				"recipe_name": "User 2 Stuffed Shells Tweak"
			}
        ]);
    });

    test("400 error for not current user", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/recipes`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });
});


describe("/POST /:id/recipes", () => {
    test("create a user recipe", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipes`)
            .send({
				"recipe_name": "My Twist for Dumplings By Sarah Cook",
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(201);
        expect(req.body).toEqual({
			"recipe_name": "My Twist for Dumplings By Sarah Cook",
			"ingredients": [],
			"steps": []
		});
    });

	test("400 error for invalid schema", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipes`)
            .send({
				"recipeName": "My Twist for Dumplings By Sarah Cook",
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("400 error for not current user", async () => {
        const req = await request(app).post(`/users/${usr2IdTest}/recipes`)
            .send({
				"recipe_name": "My Twist for Dumplings By Sarah Cook",
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("400 error for logged out user", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipes`)
            .send({
				"recipe_name": "My Twist for Dumplings By Sarah Cook",
            })
			.set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
    });
});


describe("/GET /:id/recipes/:recipe_id", () => {
    test("get user 1 recipe", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/recipes/${user1RecipeIdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual(
            {
				"recipe_name": "User 1 Chicken Dumplings Tweak",
				"ingredients": [
					{
						"id": expect.any(Number),
						"qty": 10,
						"unit": "oz",
						"ingredient": "boneless, skinless chicken breast"
					},
                    {
						"id": expect.any(Number),
						"qty": 4,
						"unit": "tbsp",
						"ingredient": "garlic granules"
					}
				],
				"steps": [
					{
						"step": "User 1 Test Step 1",
					},
					{
						"step": "User 1 Test Step 2",
					},
					{
						"step": "User 1 Test Step 3",
					}
				]
			}
        );
    });

    test("get user 2 recipe", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/recipes/${user2RecipeIdTest}`)
            .set("_token", `Bearer ${usr2TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual(
            {
				"recipe_name": "User 2 Stuffed Shells Tweak",
				"ingredients": [],
				"steps": [
					{
						"step": "User 2 Test Step 1",
					},
					{
						"step": "User 2 Test Step 2",
					}
				]
			}
        );
    });

    test("404 error for not found user recipe", async () => {
        const req = await request(app).get(`/users/${usr1IdTest}/recipes/${user2RecipeIdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
    });

    test("400 error for not current user", async () => {
        const req = await request(app).get(`/users/${usr2IdTest}/recipes/${user1RecipeIdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });
});


describe("/POST /:id/recipes/:recipe_id", () => {
    test("add ingredient to user recipe", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipes/${user1RecipeIdTest}`)
            .send({
				"qty": 6,
  				"unit_id": 12,
  				"ingredient_id": 300
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(201);
        expect(req.body).toEqual({
			"recipe_name": "User 1 Chicken Dumplings Tweak",
			"ingredients": [
				{
					"id": expect.any(Number),
					"qty": 10,
					"unit": "oz",
					"ingredient": "boneless, skinless chicken breast"
				},
				{
					"id": expect.any(Number),
					"qty": 6,
					"unit": "c",
					"ingredient": "brown basmati rice"
				},
				{
					"id": expect.any(Number),
					"qty": 4,
					"unit": "tbsp",
					"ingredient": "garlic granules"
				}
			],
			"steps": [
				{
					"step": "User 1 Test Step 1"
				},
				{
					"step": "User 1 Test Step 2"
				},
				{
					"step": "User 1 Test Step 3"
				}
			]
		});
    });

	test("400 error for invalid schema", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipes/${user1RecipeIdTest}`)
            .send({
				"qty": 6,
  				"unitId": 12,
  				"ingredientId": 300
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
    });

	test("404 error for not found user recipe", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipes/${user2RecipeIdTest}`)
            .send({
				"qty": 6,
  				"unit_id": 12,
  				"ingredient_id": 300
            })
			.set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
    });

	test("400 error for logged out user", async () => {
        const req = await request(app).post(`/users/${usr1IdTest}/recipes/${user1RecipeIdTest}`)
            .send({
				"qty": 6,
  				"unit_id": 12,
  				"ingredient_id": 300
            })
			.set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
    });
});


describe("/DELETE /:id/recipes/:recipe_id", () => {
    test("delete user recipe", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/recipes/${user1RecipeIdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
		expect(req.body).toEqual({
			message: "Deleted user's recipe!"
		});
	});

	test("404 error for not found list", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/recipes/${user2RecipeIdTest + 1}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
	});

	test("400 error for not current user", async () => {
		const req = await request(app).delete(`/users/${usr2IdTest}/recipes/${user2RecipeIdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
	});
});


describe("/DELETE /:id/recipes/:recipe_id/:item_id", () => {
    test("delete user recipe ingredient", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/recipes/${user1RecipeIdTest}/${user1RecipeIngrdIdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
		expect(req.body).toEqual({
			message: "Deleted ingredient from user's recipe!"
		});
	});

	test("404 error for not found recipe", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/recipes/${user2RecipeIdTest}/${user1RecipeIngrdIdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
	});

	test("404 error for not found recipe item", async () => {
		const req = await request(app).delete(`/users/${usr1IdTest}/recipes/${user1RecipeIdTest}/${user1RecipeIngrdIdTest + user1RecipeIngrd2IdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
	});

	test("400 error for not current user", async () => {
		const req = await request(app).delete(`/users/${usr2IdTest}/recipes/${user1RecipeIdTest}/${user1RecipeIngrdIdTest}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(400);
	});
});