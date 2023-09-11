const { db } = require("../config.js");
const {
        genWhereSqlArr,
        arrayConcat,
        genJoinSql,
        qryObjToOrderBySql,
        genSelectSql, genUpdateSqlObj,
        genInsertSqlObj, rowExists
    } = require("../helpers/sql.js");
const ExpressError = require("./error.js");


/**
 * Ingredient
 * Simple Class
 * Logics for ingredients routes.
 */
class Ingredient {

    /**
     * getIngrs
     * Retrieves ingredients.
     * Arguments: none
     * getIngrs() => [{}]
     */
    static async getIngrs(name = false) {
        // Creates select sql.
        const selectSqlStr = genSelectSql(["id", "ingredient"], "ingredients");
        // Create where sql object if name !== false.
        const sqlWhereObj = name !== false ? genWhereSqlArr({ ingredient: name }, 1) : false;
        // Create final sql.
        const sqlQry = sqlWhereObj ? arrayConcat([selectSqlStr, sqlWhereObj.whereSql]) : selectSqlStr;
        // Makes ingredient request.
        if (name === false) {
            const req = await db.query(
                `${sqlQry} ORDER BY ingredient`
            );
            return req.rows;
        } else {
            const req = await db.query(
                `${sqlQry} ORDER BY ingredient`,
                sqlWhereObj.values
            );
            return req.rows;
        }
    }
}

module.exports = Ingredient;