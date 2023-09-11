const { db } = require("../config.js");
const {
        genSelectSql
    } = require("../helpers/sql.js");
const ExpressError = require("./error.js");


/**
 * Occasion
 * Simple Class
 * Logics for occasions routes.
 */
class Occasion {

    /**
     * getOccasions
     * Retrieves occasions.
     * Arguments: none
     * getOccasions() => [ {id: 1, occasion: "holiday"}, ...];
     */
    static async getOccasions() {
        // Creates select sql.
        const selectSqlStr = genSelectSql(["id", "occasion"], "occasions");
        // Makes ingredient request.
        const req = await db.query(
            `${selectSqlStr} ORDER BY id`,
        );
        return req.rows;
    }
}

module.exports = Occasion;