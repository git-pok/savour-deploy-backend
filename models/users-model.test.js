process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app.js");
const { db } = require("../config.js");
const ExpressError = require("../models/error.js");
const User = require("./users.js");
const { genTestUsers } = require("../test-data/_test-data.js");
const recipesSchema = require("../schemas/userRecipes.json");

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
let user1RecipeIdTest;
let user2RecipeIdTest;

beforeEach(async () => {
    const { 
			usr1, usr1Token, usr2, usr2Token,
			usr1Id, usr2Id, listId1, listId2,
			listId3, shopList1Id, shopList2Id,
			user1RecipeId, user2RecipeId
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
})

afterEach(async () => {
    await db.query(`
        DELETE FROM users;
    `);
});

afterAll(async () => {
    await db.end();
});

describe("User.register", () => {
    test("register user", async () => {
        const data = {
                "username": "newUsr",
		        "first_name": "newUsr",
		        "last_name": "Lokz",
		        "email": "newusr@g.com",
		        "phone": "813 507 4490",
		        "header_img": "testHeaderImage",
		        "profile_img": "testProfileImage",
		        "password": "password4"
            };
        const user = await User.register(data);
        expect(user).toEqual({
            "id": expect.any(Number),
		    "username": "newUsr",
		    "first_name": "newUsr",
		    "last_name": "Lokz",
		    "email": "newusr@g.com",
		    "phone": "813 507 4490",
		    "header_img": "testHeaderImage",
		    "profile_img": "testProfileImage",
		    "token": expect.any(String)
        });
    });
});

describe("User.login", () => {
	test("login", async () => {
		const data = {
			username: usr1Test.username,
			password: "password1"
		}
        const user = await User.login(data);
        expect(user).toEqual({
            "id": expect.any(Number),
		    "username": usr1Test.username,
		    "token": expect.any(String)
        });
    });

	test("login with invalid password", async () => {
		const data = {
			username: usr1Test.username,
			password: "WrongPassword"
		}
        await expect(async () => {
			await User.login(data);
		}).rejects.toThrow(ExpressError);
    });

	test("login with invalid username", async () => {
		const data = {
			username: "WrongUsername",
			password: "password1"
		}
        await expect(async () => {
			await User.login(data);
		}).rejects.toThrow(ExpressError);
    });
});

describe("User.getUser", () => {
	test("get user", async () => {
		const data = {
			username: usr1Test.username,
			password: "password1"
		}
        const user = await User.getUser(usr1Test.username);
        expect(user).toEqual({
            "id": expect.any(Number),
		    "username": usr1Test.username,
		    "first_name": usr1Test.first_name,
		    "last_name": usr1Test.last_name,
		    "email": usr1Test.email,
			"is_admin": false,
		    "phone": usr1Test.phone,
		    "header_img": null,
		    "profile_img": null
        });
    });
});

describe("User.editUser", () => {
	test("edit user", async () => {
		const data = {
			first_name: "usr1Test newFname"
		}
        const user = await User.editUser(data, usr1Test.username);
        expect(user).toEqual({
            "id": expect.any(Number),
		    "username": "usr1",
		    "first_name": "usr1Test newFname",
		    "last_name": usr1Test.last_name,
		    "email": usr1Test.email,
			"is_admin": false,
		    "phone": usr1Test.phone,
		    "header_img": null,
		    "profile_img": null
        });
    });

	test("error for editing username", async () => {
		const data = {
			username: "usr1Test newUsrName",
			first_name: "usr1Test newFname"
		}

        await expect(async () => {
			await User.editUser(data, usr1Test.username);
		}).rejects.toThrow(ExpressError);
    });
});

describe("User.getFavRecipes", () => {
    test("get user's fav recipes", async () => {
        const favRecipes = await User.getFavRecipes(usr1IdTest);
        expect(favRecipes).toEqual(
            [
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
            ]
        )
    });

	test("get user's fav recipe", async () => {
        const favRecipes = await User.getFavRecipes(usr1IdTest, 100);
        expect(favRecipes).toEqual(
            [
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
					// "liked_user_ids": [],
					// "disliked_user_ids": [],
					"reviews": [
						{
							"stars": 5,
							"review": "Good.",
							"user_id": usr1IdTest
						},
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
            ]
        )
    });
});

describe("User.getSavedRecipes", () => {
    test("get user's saved recipes", async () => {
        const savedRecipes = await User.getSavedRecipes(usr1IdTest);
        expect(savedRecipes).toEqual(
            [
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
            ]
        )
    });

	test("get user's saved recipe", async () => {
        const savedRecipes = await User.getSavedRecipes(usr1IdTest, 400);
        expect(savedRecipes).toEqual(
            [
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
					// "liked_user_ids": [],
					// "disliked_user_ids": [],
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
            ]
        )
    });
});

describe("User.getRecipeLists", () => {
	test("get recipelists", async () => {
		const req = await User.getRecipeLists(usr1IdTest);
		expect(req).toEqual([
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

	test("404 error for not found user", async () => {
		await expect(async () => {
            await User.getRecipeLists(usr2IdTest + 1);
        }).rejects.toThrow(ExpressError);
	});
});

describe("User.getListRecipes", () => {
	test("get recipelist recipes", async () => {
		const req = await User.getListRecipes(usr1IdTest, listId1Test);
		expect(req).toEqual({
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
		]});
	});

	test("get recipelist recipe", async () => {
		const req = await User.getListRecipes(usr1IdTest, listId1Test, 450);
		expect(req).toEqual({
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
		]});
	});

	test("404 error for not found recipelist", async () => {
		await expect(async () => {
            await User.getListRecipes(usr1IdTest, listId3Test);
        }).rejects.toThrow(ExpressError);
	});

	test("404 error for not found user", async () => {
		await expect(async () => {
            await User.getListRecipes(usr2IdTest + 1, listId3Test);
        }).rejects.toThrow(ExpressError);
	});

	test("404 error for not found list", async () => {
		await expect(async () => {
            await User.getListRecipes(usr2IdTest, listId3Test + 1);
        }).rejects.toThrow(ExpressError);
	});
});

describe("User.getShopLists", () => {
	test("get user1 shoplists", async () => {
		const list = await User.getShopLists(usr1IdTest);
		expect(list).toEqual([
			{
				"id": expect.any(Number),
				"list_name": "User 1 Shoplist for Recipe 120",
				"recipe_id": 120
			}
		]);
	});

	test("get user2 shoplists", async () => {
		const list = await User.getShopLists(usr2IdTest);
		expect(list).toEqual([
			{
				"id": expect.any(Number),
				"list_name": "User 2 Shoplist for Recipe 320",
				"recipe_id": 320,
			}
		]);
	});

	test("get user1 shoplist", async () => {
		const list = await User.getShopLists(usr1IdTest, shopList1IdTest);
		expect(list).toEqual([
			{
				"id": expect.any(Number),
				"list_name": "User 1 Shoplist for Recipe 120",
				"recipe_id": 120,
			}
		]);
	});

	test("get empty array for user with no shoppinglists", async () => {
		const list = await User.getShopLists(usr1IdTest, shopList2IdTest);
		expect(list).toEqual([]);
	});

	test("error for not found user", async () => {
		await expect(async () => {
			await User.getShopLists(usr2IdTest + 1);
		}).rejects.toThrow(ExpressError);
	});
});

describe("User.shopListsItems", () => {
	test("get user1 shoplist items", async () => {
		const list = await User.shopListsItems(usr1IdTest, shopList1IdTest);
		expect(list).toEqual(
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

	test("get user2 shoplist items", async () => {
		const list = await User.shopListsItems(usr2IdTest, shopList2IdTest);
		expect(list).toEqual(
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

	test("error for not found user", async () => {
		await expect(async () => {
			await User.shopListsItems(usr2IdTest + 1, shopList2IdTest);
		}).rejects.toThrow(ExpressError);
	});

	test("error for not found shoppinglist", async () => {
		await expect(async () => {
			await User.shopListsItems(usr2IdTest, shopList1IdTest);
		}).rejects.toThrow(ExpressError);
	});
});

describe("User.userRecipes", () => {
	test("get user1 recipes", async () => {
		const list = await User.userRecipes(usr1IdTest);
		expect(list).toEqual([
			{
				"id": expect.any(Number),
				"recipe_name": "User 1 Chicken Dumplings Tweak"
			},
		]);
	});

	test("get user2 recipes", async () => {
		const list = await User.userRecipes(usr2IdTest);
		expect(list).toEqual([
			{
				"id": expect.any(Number),
				"recipe_name": "User 2 Stuffed Shells Tweak"
			},
		]);
	});

	test("empty array for no user recipes", async () => {
		const res = await User.userRecipes(usr2IdTest + 1);
		expect(res).toEqual([]);
	});
});

describe("User.recipeSteps", () => {
	test("get user1 recipe steps", async () => {
		const list = await User.recipeSteps(usr1IdTest, user1RecipeIdTest);
		expect(list).toEqual([
			{
				"step": "User 1 Test Step 1",
			},
			{
				"step": "User 1 Test Step 2",
			},
			{
				"step": "User 1 Test Step 3",
			}
		]);
	});

	test("get user2 recipe steps", async () => {
		const list = await User.recipeSteps(usr2IdTest, user2RecipeIdTest);
		expect(list).toEqual([
			{
				"step": "User 2 Test Step 1",
			},
			{
				"step": "User 2 Test Step 2",
			}
		]);
	});

	test("empty array for user recipe with no steps", async () => {
		const list = await User.recipeSteps(usr2IdTest, user2RecipeIdTest + 1);
		expect(list).toEqual([]);
	});
});

describe("User.recipe", () => {
	test("get user1 recipe", async () => {
		const list = await User.recipe(usr1IdTest, user1RecipeIdTest);
		expect(list).toEqual(
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

	test("get user2 recipe", async () => {
		const list = await User.recipe(usr2IdTest, user2RecipeIdTest);
		expect(list).toEqual(
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

	test("error for not found user recipe", async () => {
		await expect(async () => {
			await User.recipe(usr2IdTest, user2RecipeIdTest + 1);
		}).rejects.toThrow(ExpressError);
	});
});

describe("User.deleteRow", () => {
	test("delete user", async () => {
		const userReq = await db.query(
			`SELECT * FROM users WHERE id = $1`,
			[usr1IdTest]
		);
		expect(userReq.rows.length).toEqual(1);
		expect(userReq.rows[0].id).toEqual(usr1IdTest);
		const list = await User.deleteRow("users", {id: usr1IdTest}, "Deleted user!");
		expect(list).toEqual(
			{
				message: "Deleted user!"
			}
		);
		const userDltReq = await db.query(
			`SELECT * FROM users WHERE id = $1`,
			[usr1IdTest]
		);
		expect(userDltReq.rows.length).toEqual(0);
	});
});

describe("User.insertRow", () => {
	test("insert user recipe with schema parameter", async () => {
		const recpReq = await db.query(
			`SELECT * FROM user_recipes WHERE recipe_name = $1`,
			["Insert Recipe"]
		);
		expect(recpReq.rows.length).toEqual(0);
		const insertData = {user_id: usr1IdTest, recipe_name: "Insert Recipe"};
		const res = await User.insertRow("user_recipes", insertData, recipesSchema, false, "Inserted user recipe!");
		expect(res).toEqual({ message: "Inserted user recipe!" });
		const recpDltReq = await db.query(
			`SELECT * FROM user_recipes WHERE recipe_name = $1`,
			["Insert Recipe"]
		);
		expect(recpDltReq.rows.length).toEqual(1);
		expect(recpDltReq.rows[0].recipe_name).toEqual("Insert Recipe");
	});

	test("insert user recipe without schema parameter", async () => {
		const recpReq = await db.query(
			`SELECT * FROM user_recipes WHERE recipe_name = $1`,
			["Insert Recipe"]
		);
		expect(recpReq.rows.length).toEqual(0);
		const insertData = {user_id: usr1IdTest, recipe_name: "Insert Recipe"};
		const res = await User.insertRow("user_recipes", insertData, false, false, "Inserted user recipe!");
		expect(res).toEqual({ message: "Inserted user recipe!" });
		const recpDltReq = await db.query(
			`SELECT * FROM user_recipes WHERE recipe_name = $1`,
			["Insert Recipe"]
		);
		expect(recpDltReq.rows.length).toEqual(1);
		expect(recpDltReq.rows[0].recipe_name).toEqual("Insert Recipe");
	});

	test("error for data not matching schema parameter schema", async () => {
		const recpReq = await db.query(
			`SELECT * FROM user_recipes WHERE recipe_name = $1`,
			["Insert Recipe"]
		);
		expect(recpReq.rows.length).toEqual(0);
		const insertData = {user_id: usr1IdTest, recipe_name: 1};
		await expect(async () => {
			await User.insertRow("user_recipes", insertData, recipesSchema, false, "Inserted user recipe!");
		}).rejects.toThrow(ExpressError);
	});
});