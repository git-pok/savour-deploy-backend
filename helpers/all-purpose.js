const ExpressError = require("../models/error.js");
const {
        recipesFltrKeyToClmnName,
        recipeQryFilterKeys
    } = require("../config.js");

/**
 * defineProps
 * Defines properties in an object.
 * Arguments: props array and object
 * Returns new object.
 * const obj = { two: 2 }
 * definePropsPure([["one", 1]], obj) => { one: 1, two: 2 };
 */
function defineProps (propsArr, obj, pure = true) {
    try {
        if (!Array.isArray(propsArr)) throw new ExpressError(400, "Invalid data type for propsArr!");
        const isPure = pure === true;
        const isImpure = pure !== true;
        const objCopyOrFalse = isPure ? JSON.parse(JSON.stringify(obj)) : "";
        propsArr.forEach(prop => {
            isPure ? objCopyOrFalse[prop[0]] = prop[1] : obj[prop[0]] = prop[1];
        });
        return isPure ? objCopyOrFalse : "Object props defined.";
    } catch (err) {
        const errMsg = err.msg ? err.msg : `${err}`;
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

module.exports = {
    defineProps
};