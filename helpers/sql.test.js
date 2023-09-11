process.env.NODE_ENV = "test";
// const request = require("supertest");
// const app = require("../app.js");
const { db } = require("../config.js");
// const SECRET_KEY = require("../keys.js");
const ExpressError = require("../models/error.js");
const {
    arrayConcat, genJoinSql, qryObjToOrderBySql,
    genWhereSqlArr,
    genSelectSql, genUpdateSqlObj,
    genInsertSqlObj, rowExists
} = require("./sql.js");
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
// Without db.end the test results will
// have the waiting for functions output
// because of supertest.
// PostgreSQL server has to be on also.
afterAll(async () => {
    await db.end();
});


describe("arrayConcat", () => {
    test("concat array of strings", () => {
        const arr = ["SELECT name", "FROM recipes", "WHERE name = 'chicken'"];
        const concatedArr = arrayConcat(arr);
        expect(concatedArr).toEqual(
            "SELECT name FROM recipes WHERE name = 'chicken'"
        );
    });
    test("concat array of strings and numbers", () => {
        const arr = ["SELECT rating FROM ratings", "WHERE rating =", 1];
        const concatedArr = arrayConcat(arr);
        expect(concatedArr).toEqual(
            "SELECT rating FROM ratings WHERE rating = 1"
        );
    });

    test("error for object", () => {
        function errorConcat() {
            arrayConcat({one: 1});
        }
        expect(errorConcat).toThrow(ExpressError);
        // expect(() => {
        //     arrayConcat(array1, array2);
        // }).toThrow();
    });
});

describe("genJoinSql", () => {
    test("create join sql", () => {
        const joinArr = [
            ["authors", "r.author_id", "a.id"],
            ["ratings", "r.rating_id", "rt.id"]
        ];
        const joinSql = genJoinSql(joinArr, "JOIN");
        expect(joinSql).toEqual(
            "JOIN authors a ON r.author_id = a.id JOIN ratings rt ON r.rating_id = rt.id"
        );
    });

    test("error for object", () => {
        function errorJoin() {
            genJoinSql({one: 1}, "JOIN");
        }
        expect(errorJoin).toThrow(ExpressError);
    });

    test("error for string", () => {
        function errorJoin() {
            genJoinSql("string", "JOIN");
        }
        expect(errorJoin).toThrow(ExpressError);
    });
});

describe("qryObjToOrderBySql", () => {
    test("create order by with orderBy param", () => {
        const qry = {
            author: "testAuth", name: "testNm",
            orderBy: "name"
        };
        const orderBySql = qryObjToOrderBySql(qry);
        expect(orderBySql).toEqual(
            "ORDER BY r.name"
        );
    });

    test("create order by with orderBy/chronOrder param", () => {
        const qry = {
            author: "testAuth", name: "testNm",
            orderBy: "name", chronOrder: "asc"
        };
        const orderBySql = qryObjToOrderBySql(qry);
        expect(orderBySql).toEqual(
            "ORDER BY r.name ASC"
        );
    });

    test("create order by with orderBy/orderBy2/chronOrder param", () => {
        const qry = {
            author: "testAuth", name: "testNm",
            orderBy: "name", orderBy2: "rating",
            chronOrder: "asc"
        };
        const orderBySql = qryObjToOrderBySql(qry);
        expect(orderBySql).toEqual(
            "ORDER BY r.name, rt.rating ASC"
        );
    });

    test("receive empty string for non exist params", () => {
        const qry = {
            nonExist: "testAuth", nonExist2: "testNm"
        };
        const orderBySql = qryObjToOrderBySql(qry);
        expect(orderBySql).toEqual(
            ""
        );
    });
});

describe("genWhereSqlArr", () => {
    test("create where sql with case insensitive values", () => {
        const columnsVals = { first_name: "l", username: "lmon" };
        const whereSql = genWhereSqlArr(columnsVals, 1);
        expect(whereSql).toEqual({
            whereSql: "WHERE first_name ILIKE $1 AND username ILIKE $2",
            values: ["%l%", "%lmon%"]
        });
    });

    test("create where sql with exact match", () => {
        const columnsVals = { first_name: "l", username: "lmon" };
        const whereSql = genWhereSqlArr(columnsVals, 1, true);
        expect(whereSql).toEqual({
            whereSql: "WHERE first_name = $1 AND username = $2",
            values: ["l", "lmon"]
        });
    });

    test("create where sql with table abreviations and returning", () => {
        const columnsVals = { first_name: "l", username: "lmon" };
        const returnArr = [ "first_name", "username" ];
        const usersClmnToTableAbrevsObj = { first_name: "usr.",  username: "usr." }
        const whereSql = genWhereSqlArr(columnsVals, 1, false, returnArr, true, usersClmnToTableAbrevsObj);
        expect(whereSql).toEqual({
            whereSql: "WHERE usr.first_name ILIKE $1 AND usr.username ILIKE $2 RETURNING first_name, username",
            values: ["%l%", "%lmon%"]
        });
    });
});

describe("genSelectSql", () => {
    test("create select sql with no table abrevs in front of columns", () => {
        const columnSelectVals = [ "first_name", "last_name", "username" ];
        const selectSql = genSelectSql(columnSelectVals, "users");
        expect(selectSql).toEqual(
            "SELECT first_name, last_name, username FROM users"
        );
    });

    test("create select sql with table abrevs in front of columns", () => {
        const columnSelectVals = [ "usr.first_name", "usr.last_name", "usr.username" ];
        const selectSql = genSelectSql(columnSelectVals, "users", true);
        expect(selectSql).toEqual(
            "SELECT usr.first_name, usr.last_name, usr.username FROM users usr"
        );
    });

    test("error for invalid qryType", () => {
        const columnSelectVals = { first_name: "first_name", last_name: "last_name" };
        function errorGenSelectSql() {
            genSelectSql(columnSelectVals, "users");
        }
        expect(errorGenSelectSql).toThrow(ExpressError);
    });
});

describe("genUpdateSqlObj", () => {
    test("create update sql with no return statement", () => {
        const clmnValUpdateObj = { first_name: "l", last_name: "lmon", username: "lm" };
        const updateSql = genUpdateSqlObj ("users", clmnValUpdateObj);
        expect(updateSql).toEqual({
            sql: "UPDATE users SET first_name = $1, last_name = $2, username = $3",
            values: ["l", "lmon", "lm"]
        });
    });

    test("create update sql with return statement", () => {
        const clmnValUpdateObj = { first_name: "l", last_name: "lmon", username: "lm" };
        const returnArr = [ "first_name", "username" ];
        const updateSql = genUpdateSqlObj ("users", clmnValUpdateObj, returnArr);
        expect(updateSql).toEqual({
            sql: "UPDATE users SET first_name = $1, last_name = $2, username = $3 RETURNING first_name, username",
            values: ["l", "lmon", "lm"]
        });
    });

    test("error for invalid table name", () => {
        const clmnValUpdateObj = { first_name: "l", last_name: "lmon", username: "lm" };
        const returnArr = [ "first_name", "username" ];
        function errorGenUpdateSqlObj() {
            genUpdateSqlObj ("invalidTable", clmnValUpdateObj, returnArr);
        }
        expect(errorGenUpdateSqlObj).toThrow(ExpressError);
    });
});


describe("genInsertSqlObj", () => {
    test("create insert sql with no return statement", () => {
        const clmnValInsrtObj = { first_name: "l", last_name: "lmon", username: "lm" };
        const insertSql = genInsertSqlObj ("users", clmnValInsrtObj);
        expect(insertSql).toEqual({
            sql: "INSERT INTO users (first_name, last_name, username) VALUES ($1, $2, $3)",
            values: ["l", "lmon", "lm"]
        });
    });

    test("create insert sql with return statement", () => {
        const clmnValInsrtObj = { first_name: "l", last_name: "lmon", username: "lm" };
        const returnArr = [ "first_name", "username" ];
        const insertSql = genInsertSqlObj ("users", clmnValInsrtObj, returnArr);
        expect(insertSql).toEqual({
            sql: "INSERT INTO users (first_name, last_name, username) VALUES ($1, $2, $3) RETURNING first_name, username",
            values: ["l", "lmon", "lm"]
        });
    });

    test("error for invalid table name", () => {
        const clmnValInsrtObj = { first_name: "l", last_name: "lmon", username: "lm" };
        const returnArr = [ "first_name", "username" ];
        function errorGenUpdateSqlObj() {
            genUpdateSqlObj ("invalidTable", clmnValInsrtObj, returnArr);
        }
        expect(errorGenUpdateSqlObj).toThrow(ExpressError);
    });
});

describe("rowExists", () => {
    test("404 error for not found user", async () => {
        const id = usr2IdTest + 1;
        await expect(async () => {
            await rowExists("user", "id", "users", [["id", id]]);
        }).rejects.toThrow(ExpressError);
    });

    test("404 error for not found recipe", async () => {
        await expect(async () => {
            await rowExists("recipe", "id", "recipes", [["id", 2000]]);
        }).rejects.toThrow(ExpressError);
    });
});