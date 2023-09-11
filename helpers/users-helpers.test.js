process.env.NODE_ENV = "test";
const { db } = require("../config.js");
const SECRET_KEY = require("../keys.js");
const ExpressError = require("../models/error.js");
const {
        validateSchema, hashPassword, generateToken,
        decodeToken, verifyPassword 
    } = require("./users.js");

// Without db.end the test results will
// have the waiting for functions output
// because of supertest.
// PostgreSQL server has to be on also.
afterAll(async () => {
    await db.end();
});

const jsonSchema = {
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "$id": "http://example.com/example.json",
    "type": "object",
    "default": {},
    "title": "Root Schema",
    "required": [
        "name",
        "rating"
    ],
    "properties": {
        "name": {
            "type": "string",
            "default": "",
            "title": "The name Schema",
            "examples": [
                "hello"
            ]
        },
        "rating": {
            "type": "integer",
            "default": 0,
            "title": "The rating Schema",
            "examples": [
                1
            ]
        }
    },
    "examples": [{
        "name": "hello",
        "rating": 1
    }]
}


describe("validateSchema", () => {
    test("test data of incorrect schema", () => {
        const schemaVald = validateSchema({ "name": "fvin" }, jsonSchema);
        expect(schemaVald.valid).toEqual(false);
        expect(schemaVald.errors.length).toBeGreaterThan(0);
    });

    test("test data of correct schema", () => {
        const schemaVald = validateSchema({ "name": "fvin", rating: 1 }, jsonSchema);
        expect(schemaVald.valid).toEqual(true);
        expect(schemaVald.errors.length).toEqual(0);
    });
});


describe("hashPassword", () => {
    test("hash password", async () => {
        const pwd = "Password";
        const hashedPwd = await hashPassword(pwd);
        expect(hashedPwd).not.toEqual(pwd);
    });
});

describe("verifyPassword", () => {
    test("test correct password", async () => {
        const pwd = "Password";
        const hashedPwd = await hashPassword(pwd);
        const pwdVerify = await verifyPassword(pwd, hashedPwd);
        expect(pwdVerify).toEqual(true);
    });

    test("test incorrect password", async () => {
        const pwd = "Password";
        const hashedPwd = await hashPassword(pwd);
        const pwdVerify = await verifyPassword("Password2", hashedPwd);
        expect(pwdVerify).toEqual(false);
    });
});

describe("generateToken", () => {
    test("generate token", async () => {
        const token = generateToken({ user_id: 1 }, SECRET_KEY);
        expect(token).not.toEqual({ user_id: 1 });
        expect(token).toEqual(expect.any(String));
    });
});

describe("decodeToken", () => {
    test("test correct password", async () => {
        const token = generateToken({ user_id: 1 }, SECRET_KEY)
        const tokenDecode = decodeToken(token, SECRET_KEY);
        expect(tokenDecode).not.toEqual(expect.any(String));
        expect(tokenDecode).toEqual({
            iat: expect.any(Number),
            user_id: 1
        });
    });
});