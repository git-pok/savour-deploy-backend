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
        DELETE FROM users;
    `);
});

afterAll(async () => {
    await db.end();
});

describe("/GET /ingredients", () => {
    test("get ingredients", async () => {
        const req = await request(app).get(`/ingredients`)
            .set("_token", `Bearer ${usr1TokenTest}`);
        expect(req.statusCode).toBe(200);
        expect(req.body.length).toBeGreaterThan(1000);
        expect(req.body[0].id).toEqual(expect.any(Number));
        expect(req.body[0].ingredient).toEqual(expect.any(String));
        expect(req.body[1000].id).toEqual(expect.any(Number));
        expect(req.body[1000].ingredient).toEqual(expect.any(String));
    });

    test("400 error for logged out", async () => {
        const req = await request(app).get(`/ingredients`)
            .set("_token", `Bearer`);
        expect(req.statusCode).toBe(400);
    });
});