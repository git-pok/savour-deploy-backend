process.env.NODE_ENV = "test";
// const request = require("supertest");
// const app = require("../app.js");
const { db } = require("../config.js");
// const SECRET_KEY = require("../keys.js");
const ExpressError = require("../models/error.js");
// const {
//     BCRYPT_WORK_FACTOR,
// } = require("../config.js");

const {
    deleteObjProps,
    deletePropsNotInSetPure, deleteNullInArrPure,
    isFilter, recipesFiltersToSqlClmns
} = require("./recipes.js");

// Without db.end the test results will
// have the waiting for functions output
// because of supertest.
// PostgreSQL server has to be on also.
afterAll(async () => {
    await db.end();
});

const set = new Set();
    set.add("first_name").add("last_name").add("username");
// const array1 = ["SELECT name FROM recipes", "WHERE name = 'chicken'"];
// const array2 = ["SELECT rating FROM ratings", "WHERE rating =", 1];
describe("deleteObjProps", () => {
    test("delete props in object", () => {
        const propsArr = ["name", "rating"];
        const filters = {
            name: "V", rating: 5,
            username: "vn", header_img: "img"
        };
        const newObj = deleteObjProps (propsArr, filters);
        expect(newObj).toEqual(
            {
                username: "vn", header_img: "img"
            }
        );
    });
    
    test("error for non array in propsArr arg", () => {
        const propsArr = { name: "l", age: 8 };
        const filters = {
            name: "V", rating: 5,
            username: "vn", header_img: "img"
        };
        function error () {
            deleteObjProps (propsArr, filters);
        }
        expect(error).toThrow(ExpressError);
    });
});

describe("deleteNullInArrPure", () => {
    test("delete null values in array", () => {
        const array = [null, "biz", null, "bizq"];
        const newArr = deleteNullInArrPure (array);
        expect(newArr).toEqual(["biz", "bizq"]);
    });

    test("pass in array with no null", () => {
        const array = ["biz", "bizq"];
        const newArr = deleteNullInArrPure (array);
        expect(newArr).toEqual(["biz", "bizq"]);
    });
    
    test("error for non array in arg", () => {
        const arr = { name: "l", age: 8 };
        function error () {
            deleteNullInArrPure (arr);
        }
        expect(error).toThrow(ExpressError);
    });
});

describe("deletePropsNotInSetPure", () => {
    test("delete props not in set", () => {
        const obj = { first_name: "l", age: 5, favColor: "red" };
        const newObj = deletePropsNotInSetPure (set, obj);
        expect(newObj).toEqual({ first_name: "l" });
    });

    test("pass in object where all values exist in set", () => {
        const obj = { first_name: "l", last_name: "m", username: "lm" };
        const newArr = deletePropsNotInSetPure (set, obj);
        expect(newArr).toEqual(obj);
    });
    
    test("error for non set in arg", () => {
        const set = [ "l", 8 ];
        function error () {
            deletePropsNotInSetPure (set, { l: "m"});
        }
        expect(error).toThrow(ExpressError);
    });
});

describe("isFilter", () => {
    test("returns true for obj that has permitted values", () => {
        const qry = { first_name: "l", age: 5, favColor: "red" };
        const newObj = isFilter (qry, set);
        expect(newObj).toEqual(true);
    });

    test("returns false for obj that doesn't have permitted values", () => {
        const qry = { age: 5, favColor: "red" };
        const newObj = isFilter (qry, set);
        expect(newObj).toEqual(false);
    });
    
    test("error for non set in arg", () => {
        const set = [ "l", 8 ];
        const qry = { first_name: "l", age: 5, favColor: "red" };
        function error () {
            deletePropsNotInSetPure (set, qry);
        }
        expect(error).toThrow(ExpressError);
    });
});

describe("recipesFiltersToSqlClmns", () => {
    test("returns object with sql column names as props", () => {
        const qry = { author: "lu", name: "good", mainCategory: "health" };
        const newObj = recipesFiltersToSqlClmns (qry);
        expect(newObj).toEqual(
            {
                full_name: "lu", name: "good",
                main_cat_name: "health"
            }
        );
    });
});
