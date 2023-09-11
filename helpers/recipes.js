const ExpressError = require("../models/error.js");
// const jsonschema = require("jsonschema");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
const {
        recipesFltrKeyToClmnName,
        recipeQryFilterKeys
    } = require("../config.js");
/**
 * deleteObjProps
 * Deletes properties from an object.
 * Arguments: props array and object
 * Returns new object.
 * const obj = { one: 1, two: 2 }
 * deleteObjProps(["one"], obj) => { two: 2 };
 */
function deleteObjProps (propsArr, obj) {
    if (!Array.isArray(propsArr)) throw new ExpressError(400, "Invalid data type for propsArr!");
    try {
        propsArr.forEach(prop => {
            delete obj[prop];
        })
        return obj;
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
        // throw new ExpressError(400, `${err}`);
    }
}

/**
 * deleteNullInArrPure
 * Deletes null values.
 * Arguments: array
 * Returns new array.
 * const arr = [1, null, 2];
 * deleteNullInArrPure(arr) => [ 1, 2 ];
 */
function deleteNullInArrPure (arr) {
    try {
        if (!Array.isArray(arr)) throw new ExpressError(400, "Invalid data type for arr!");
        const filteredArr = arr.filter(val => val !== null);
        return filteredArr;
    } catch (err) {
        const errMsg = err.msg ? err.msg : `${err}`;
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

/**
 * deletePropsNotInSetPure
 * Deletes properties from an object if in set.
 * Arguments: props set and object
 * Returns new object.
 * const set = { "two" };
 * const obj = { one: 1, two: 2 }
 * deletePropsNotInSetPure(set, obj) => { two: 2 };
 */
function deletePropsNotInSetPure (propsSet, obj) {
    try {
        const newObj = JSON.parse(JSON.stringify(obj))
        for (let prop in newObj) {
            if (!propsSet.has(prop)) delete newObj[prop];
        }
        return newObj;
    } catch (err) {
        const errMsg = err.msg ? err.msg : `${err}`;
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

/**
 * isFilter
 * Verifies if qry object has permitted filters.
 * Arguments: qry object and a set
 * Returns boolean.
 * const set = { "name" };
 * isFilter({ name: "good" }, set) => true
 */
function isFilter (qry, filters = recipeQryFilterKeys) {
    try {
        const qryArray = Object.entries(qry);
        if (qryArray.length === 0) return false;
        const filterExists = qryArray.some(prop => {
            return filters.has(prop[0]);
        });
        return filterExists;
    } catch (err) {
        const errMsg = err.msg ? err.msg : `${err}`;
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

/**
 * recipesFiltersToSqlClmns
 * Converts recipes filter key names to sql column names.
 * Arguments: qry object and obj of key names set to sql column names
 * Returns object.
 * recipesFiltersToSqlClmns({ name: "chicken", author: "good" }) =>
 * { name: "chicken", full_name: "good" };
 */
function recipesFiltersToSqlClmns (qry, keyFilters = recipesFltrKeyToClmnName) {
    try {
        const newObj = {};
        const qryCpy = JSON.parse(JSON.stringify(qry));
        for (let prop in qryCpy) {
            const keyNrmlzd = prop.toLowerCase().trim();
            const cnvrtdKey = keyFilters[keyNrmlzd];
            newObj[cnvrtdKey] = qryCpy[prop];
        }
        return newObj;
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}


module.exports = {
    deleteObjProps,
    deletePropsNotInSetPure, deleteNullInArrPure,
    isFilter, recipesFiltersToSqlClmns
};