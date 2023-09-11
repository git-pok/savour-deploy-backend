process.env.NODE_ENV = "test";
const { db } = require("../config.js");
const ExpressError = require("../models/error.js");
const {
    defineProps
} = require("./all-purpose.js");


let obj1 = {};

beforeEach(async () => {
    obj1.name = "dumplings";
    obj1.cat = "chineese"
});

afterEach(() => {
    delete obj1.name;
    delete obj1.cat;
});
// Without db.end the test results will
// have the waiting for functions output
// because of supertest.
// PostgreSQL server has to be on also.
afterAll(async () => {
    await db.end();
});


describe("defineProps", () => {
    test("define props in empty object, pure parmater", () => {
        const propsArr = [["username", "biz"], ["first_name", "bizq"]];
        const obj = {};
        const newObj = defineProps(propsArr, obj);
        expect(newObj).toEqual(
            {
                username: "biz", first_name: "bizq"
            }
        );
        expect(obj).not.toEqual(
            {
                username: "biz", first_name: "bizq"
            }
        );
        expect(newObj).not.toBe(obj);
    });

    test("define props in object, pure parmater", () => {
        const propsArr = [["first_name", "bizq"], ["last_name", "dreco"]];
        const object = {
            name: "V", rating: 5,
            username: "vn", header_img: "img"
        };
        const newObj = defineProps(propsArr, object);
        expect(newObj).toEqual(
            {
                name: "V", rating: 5,
                username: "vn", header_img: "img",
                first_name: "bizq", last_name: "dreco"
            }
        );
        expect(object).not.toEqual(
            {
                name: "V", rating: 5,
                username: "vn", header_img: "img",
                first_name: "bizq", last_name: "dreco"
            }
        );
        expect(newObj).not.toEqual(object);
    });

    test("define props in object, impure parmater", () => {
        const propsArr = [["first_name", "bizq"], ["last_name", "dreco"]];
        const object = {
            name: "V", rating: 5,
            username: "vn", header_img: "img"
        };
        const newObj = defineProps(propsArr, object, false);
        expect(newObj).toEqual("Object props defined.");
        expect(object).toEqual(
            {
                name: "V", rating: 5,
                username: "vn", header_img: "img",
                first_name: "bizq", last_name: "dreco"
            }
        );
    });
    
    test("error for non array in propsArr arg", () => {
        const propsArr = { name: "l", age: 8 };
        function error () {
            defineProps(propsArr, {});
        }
        expect(error).toThrow(ExpressError);
    });
});