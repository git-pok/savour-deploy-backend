process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app.js");
const { db } = require("../config.js");
const ExpressError = require("./error.js");
const Ingredient = require("./ingredients.js");
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
        DELETE FROM users;
    `);
});

afterAll(async () => {
    await db.end();
});

describe("Ingredient.getIngrs", () => {
    test("get all ingredients from ingredients table", async () => {
        const ingrdts = await Ingredient.getIngrs();
        expect(ingrdts.length).toBeGreaterThan(1400);
        expect(ingrdts[0].id).toEqual(expect.any(Number));
        expect(ingrdts[0].ingredient).toEqual(expect.any(String));
        expect(ingrdts[20].id).toEqual(expect.any(Number));
        expect(ingrdts[20].ingredient).toEqual(expect.any(String));
        expect(ingrdts[1000].id).toEqual(expect.any(Number));
        expect(ingrdts[1000].ingredient).toEqual(expect.any(String));
    });
});

describe("Ingredient.getIngrs", () => {
    test("get all ingredients from ingredients table using name arg", async () => {
        const ingrdts = await Ingredient.getIngrs("flour");
        expect(ingrdts.length).toBeGreaterThan(10);
        expect(ingrdts[0].id).toEqual(expect.any(Number));
        expect(ingrdts[0].ingredient).toContain("flour");
        expect(ingrdts[20].ingredient).toContain("flour");
    });
});