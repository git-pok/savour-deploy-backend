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

beforeEach(async () => {
    const { 
            usr1, usr1Token, usr2, usr2Token,
            usr1Id, usr2Id
        } = await genTestUsers();
    usr1Test = {...usr1};
    usr2Test = {...usr2};
    usr1TokenTest = usr1Token;
    usr2TokenTest = usr2Token;
    usr1IdTest = usr1Id;
    usr2IdTest = usr2Id;
})

afterEach(async () => {
    await db.query(`
        DELETE FROM users
    `);
});

afterAll(async () => {
    await db.end();
});

describe("/GET /recipes/:id", () => {
    test("get recipe", async () => {
        const req = await request(app).get(`/recipes/${5}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body.length).toEqual(1);
        expect(req.body[0].id).toEqual(5);
        expect(req.body).toEqual([{
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
		    "fav_user_ids": [],
		    "sav_user_ids": [],
            "reviews": [],
            "ingredients": [
                {
                    "id": 39,
                    "qty": "400",
                    "unit": "g",
                    "ingredient": "can  chickpeas, rinsed and drained",
                    "ingredient_id": 39,
                    "unit_id": 1
                },
                {
                    "id": 40,
                    "qty": "1",
                    "unit": "no unit",
                    "ingredient": "small red onion, roughly chopped",
                    "ingredient_id": 40,
                    "unit_id": 25
                },
                {
                    "id": 41,
                    "qty": "1",
                    "unit": "no unit",
                    "ingredient": "garlic clove, chopped",
                    "ingredient_id": 41,
                    "unit_id": 25
                },
                {
                    "id": 42,
                    "qty": "",
                    "unit": "no unit",
                    "ingredient": "handful of flat-leaf parsley  or curly parsley",
                    "ingredient_id": 42,
                    "unit_id": 25
                },
                {
                    "id": 43,
                    "qty": "1",
                    "unit": "tsp",
                    "ingredient": "ground cumin",
                    "ingredient_id": 43,
                    "unit_id": 2
                },
                {
                    "id": 44,
                    "qty": "1",
                    "unit": "tsp",
                    "ingredient": "ground coriander",
                    "ingredient_id": 44,
                    "unit_id": 2
                },
                {
                    "id": 45,
                    "qty": "½",
                    "unit": "tsp",
                    "ingredient": "harissa paste  or chilli powder",
                    "ingredient_id": 45,
                    "unit_id": 2
                },
                {
                    "id": 46,
                    "qty": "2",
                    "unit": "tbsp",
                    "ingredient": "plain flour",
                    "ingredient_id": 46,
                    "unit_id": 3
                },
                {
                    "id": 47,
                    "qty": "2",
                    "unit": "tbsp",
                    "ingredient": "sunflower oil",
                    "ingredient_id": 47,
                    "unit_id": 3
                },
                {
                    "id": 48,
                    "qty": "",
                    "unit": "no unit",
                    "ingredient": "toasted pitta bread, to serve",
                    "ingredient_id": 48,
                    "unit_id": 25
                },
                {
                    "id": 49,
                    "qty": "200",
                    "unit": "g",
                    "ingredient": "tub tomato salsa, to serve",
                    "ingredient_id": 49,
                    "unit_id": 1
                }
            ]
        }]);
    });

    test("get recipe that has fav user ids", async () => {
        const req = await request(app).get(`/recipes/${6}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body.length).toEqual(1);
        expect(req.body[0].id).toEqual(6);
        expect(req.body).toEqual([{
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
		    "fav_user_ids": [usr1IdTest],
		    "sav_user_ids": [],
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
        }]);
    });

    test("400 error for logged out user", async () => {
        const req = await request(app).get(`/recipes/${5}`)
            .set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
    });

    test("404 error for not found recipe", async () => {
        const req = await request(app).get(`/recipes/${3000}`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(404);
    });
});

describe("/GET /recipes", () => {
    test("get recipes no filters", async () => {
        const req = await request(app).get("/recipes")
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body.length).toEqual(1686);
        expect(req.body[0].id).toEqual(expect.any(Number));
        expect(req.body[0].name).toEqual(expect.any(String));
        expect(req.body[0].description).toEqual(expect.any(String));
        expect(req.body[0].author).toEqual(expect.any(String));
        expect(req.body[0].steps).toEqual(expect.any(String));
        expect(req.body[0]["fav_user_ids"]).toEqual(expect.any(Array));
        expect(req.body[0]["sav_user_ids"]).toEqual(expect.any(Array));
    });

    test("get recipes with name filter", async () => {
        const req = await request(app).get("/recipes")
            .set("_token", `Bearer ${usr1TokenTest}`)
            .query({ name: "chicken" });
        expect(req.statusCode).toBe(200);
        expect(req.body[0].name).toContain("chicken");
        expect(req.body[1].name).toContain("chicken");
        expect(req.body[0]["fav_user_ids"]).toEqual(expect.any(Array));
        expect(req.body[0]["sav_user_ids"]).toEqual(expect.any(Array));
        expect(req.body[req.body.length - 1].name).toContain("chicken");
    });

    test("get recipes with orderBy filter", async () => {
        const req = await request(app).get("/recipes")
            .set("_token", `Bearer ${usr1TokenTest}`)
            .query({ orderBy: "rating" });
        expect(req.statusCode).toBe(200);
        expect(req.body[0].rating).toEqual(1);
        expect(req.body[0]["fav_user_ids"]).toEqual(expect.any(Array));
        expect(req.body[0]["sav_user_ids"]).toEqual(expect.any(Array));
    });

    test("get recipes with orderBy/chronOrder filter", async () => {
        const req = await request(app).get("/recipes")
            .set("_token", `Bearer ${usr1TokenTest}`)
            .query({ orderBy: "rating", chronOrder: "desc" });
        expect(req.statusCode).toBe(200);
        expect(req.body[0].rating).toEqual(5);
        expect(req.body[0]["fav_user_ids"]).toEqual(expect.any(Array));
        expect(req.body[0]["sav_user_ids"]).toEqual(expect.any(Array));
    });

    test("400 error for logged out user", async () => {
        const req = await request(app).get("/recipes")
            .set("_token", `Bearer`)
            .query({ orderBy: "rating", chronOrder: "desc" });
        expect(req.statusCode).toBe(400);
    });
});

describe("/GET /recipes/:id/reviews", () => {
    test("get recipe reviews", async () => {
        const req = await request(app).get(`/recipes/${100}/reviews`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body[0].stars).toEqual(5);
        expect(req.body).toEqual([{
            "stars": 5,
		    "review": "Good.",
		    "user_id": usr1IdTest
        }]);
    });

    test("400 error for logged out user", async () => {
        const req = await request(app).get(`/recipes/${100}/reviews`);
        expect(req.statusCode).toBe(400);
    });
});

describe("/POST /recipes/:id/reviews", () => {
    test("create review", async () => {
        const req = await request(app).post(`/recipes/${10}/reviews`)
            .set("_token", `Bearer ${usr1TokenTest}`)
            .send({
                "user_id": usr1IdTest,
	            "stars": 4,
	            "review": "I didn't like the advacado!"
            })
        expect(req.statusCode).toBe(201);
        expect(req.body[0].stars).toEqual(4);
        expect(req.body).toEqual([{
            "stars": 4,
		    "review": "I didn't like the advacado!",
		    "user_id": usr1IdTest
        }]);
    });

    test("400 error for invalid stars schema type", async () => {
        const req = await request(app).post(`/recipes/${10}/reviews`)
            .set("_token", `Bearer ${usr1TokenTest}`)
            .send({
                "user_id": usr1IdTest,
	            "stars": "4",
	            "review": "I didn't like the advacado!"
            })
        expect(req.statusCode).toBe(400);
    });

    test("400 error for invalid review schema length", async () => {
        const req = await request(app).post(`/recipes/${10}/reviews`)
            .set("_token", `Bearer ${usr1TokenTest}`)
            .send({
                "user_id": usr1IdTest,
	            "stars": "4",
	            "review": ""
            })
        expect(req.statusCode).toBe(400);
    });

    test("400 error for not current user", async () => {
        const req = await request(app).post(`/recipes/${10}/reviews`)
            .set("_token", `Bearer ${usr1TokenTest}`)
            .send({
                "user_id": usr2IdTest,
	            "stars": 4,
	            "review": "I didn't like the advacado!"
            })
        expect(req.statusCode).toBe(400);
    });

    test("400 error for logged out user", async () => {
        const req = await request(app).post(`/recipes/${10}/reviews`)
            .set("_token", `Bearer`)
            .send({
                "user_id": usr1IdTest,
	            "stars": 4,
	            "review": "I didn't like the advacado!"
            })
        expect(req.statusCode).toBe(400);
    });
});

/**
 * DID NOT USE LIKE ROUTES.
*/
// describe("/POST /recipes/:recipe_id/likes/:user_id", () => {
//     test("like a recipe", async () => {
//         const req = await request(app).post(`/recipes/${430}/likes/${usr1IdTest}`)
//             .set("_token", `Bearer ${usr1TokenTest}`);

//         expect(req.statusCode).toEqual(200);
//         expect(req.body).toEqual({ message: "Liked recipe!"});
//     });

//     test("400 error for not current user", async () => {
//         const req = await request(app).post(`/recipes/${430}/likes/${usr2IdTest}`)
//             .set("_token", `Bearer ${usr1TokenTest}`);
//         expect(req.statusCode).toEqual(400);
//     });

//     test("404 error for logged out user", async () => {
//         const req = await request(app).post(`/recipes/${430}/likes/${usr1IdTest}`)
//             .set("_token", `Bearer`);
//         expect(req.statusCode).toEqual(400);
//     });
// });

/**
 * DID NOT USE LIKE ROUTES.
*/
// describe("/DELETE /recipes/:recipe_id/likes/:user_id", () => {
//     test("delete a liked recipe", async () => {
//         await request(app).post(`/recipes/${430}/likes/${usr1IdTest}`)
//             .set("_token", `Bearer ${usr1TokenTest}`);

//         const req = await request(app).delete(`/recipes/${430}/likes/${usr1IdTest}`)
//             .set("_token", `Bearer ${usr1TokenTest}`);
//         expect(req.statusCode).toEqual(200);
//         expect(req.body).toEqual({ message: "Deleted liked recipe!"});
//     });

//     test("404 error for not found row", async () => {
//         const req = await request(app).delete(`/recipes/${4300}/likes/${usr1IdTest}`)
//             .set("_token", `Bearer ${usr1TokenTest}`);
//         expect(req.statusCode).toEqual(404);
//     });

//     test("400 error for not current user", async () => {
//         const req = await request(app).delete(`/recipes/${430}/likes/${usr2IdTest}`)
//             .set("_token", `Bearer ${usr1TokenTest}`);
//         expect(req.statusCode).toEqual(400);
//     });

//     test("400 error for logged out user", async () => {
//         const req = await request(app).delete(`/recipes/${430}/likes/${usr1IdTest}`)
//             .set("_token", `Bearer`);
//         expect(req.statusCode).toEqual(400);
//     });
// });

/**
 * DID NOT USE DISLIKE ROUTES.
*/
// describe("/POST /recipes/:recipe_id/dislikes/:user_id", () => {
//     test("dislike a recipe", async () => {
//         const req = await request(app).post(`/recipes/${430}/dislikes/${usr1IdTest}`)
//             .set("_token", `Bearer ${usr1TokenTest}`);
//         expect(req.statusCode).toEqual(200);
//         expect(req.body).toEqual({ message: "Disliked recipe!"});
//     });

//     test("400 error for not current user", async () => {
//         const req = await request(app).post(`/recipes/${430}/dislikes/${usr2IdTest}`)
//             .set("_token", `Bearer ${usr1TokenTest}`);
//         expect(req.statusCode).toEqual(400);
//     });

//     test("400 error for logged out user", async () => {
//         const req = await request(app).post(`/recipes/${430}/dislikes/${usr1IdTest}`)
//             .set("_token", `Bearer`);
//         expect(req.statusCode).toEqual(400);
//     });
// });

/**
 * DID NOT USE DISLIKE ROUTES.
*/
// describe("/DELETE /recipes/:recipe_id/dislikes/:user_id", () => {
//     test("delete a disliked recipe", async () => {
//         await request(app).post(`/recipes/${430}/dislikes/${usr1IdTest}`)
//             .set("_token", `Bearer ${usr1TokenTest}`);

//         const req = await request(app).delete(`/recipes/${430}/dislikes/${usr1IdTest}`)
//             .set("_token", `Bearer ${usr1TokenTest}`);
//         expect(req.statusCode).toEqual(200);
//         expect(req.body).toEqual({ message: "Deleted disliked recipe!"});
//     });

//     test("404 error for not found row", async () => {
//         const req = await request(app).delete(`/recipes/${4300}/dislikes/${usr1IdTest}`)
//             .set("_token", `Bearer ${usr1TokenTest}`);
//         expect(req.statusCode).toEqual(404);
//     });

//     test("400 error for not current user", async () => {
//         const req = await request(app).delete(`/recipes/${430}/dislikes/${usr2IdTest}`)
//             .set("_token", `Bearer ${usr1TokenTest}`);
//         expect(req.statusCode).toEqual(400);
//     });

//     test("400 error for logged out user", async () => {
//         const req = await request(app).delete(`/recipes/${430}/dislikes/${usr1IdTest}`)
//             .set("_token", `Bearer`);
//         expect(req.statusCode).toEqual(400);
//     });
// });