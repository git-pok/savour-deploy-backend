const ExpressError = require("../models/error.js");
const {
    db, sqlOperator, recpesFltrClmnNmToTblAbrev,
    sqlOperatorStrict, sqlCommandsObj,
    sqlCommandsModifsObj, orderByChron,
    orderByKeys,
    isNumbers, tablesJoinAbrv, joinTableNameAbrv,
    recipesOnData, savourTableNames
} = require("../config.js");

const {
    deleteObjProps
} = require("../helpers/recipes.js");

/**
 * arrayConcat
 * Generates string from array values.
 * Arguments: arr
 * Returns string.
 * arrayConcat (["SELECT", "name", "FROM", "recipes"]) =>
 * "SELECT name FROM recipes"
 */
function arrayConcat (arr) {
    try {
        return arr.join(" ");
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

/**
 * genJoinSql
 * Creates join sql.
 * Arguments: join array, and join type
 * joinArr: array of arrays where the values in each array are:
 *      0: the table name being joined,
 *      1: the column name of the left side of the join equation
 *      2: the column name of the right side of the join equation
 * Returns string.
 * const joinArr = [["authors", "r.author_id", "a.id"]];
 * genJoinSql("r", joinArr, "JOIN") => 
 * "JOIN authors a ON r.author_id = a.id";
 */
function genJoinSql (joinArr, joinType = "JOIN") {
    try {
        if (!Array.isArray(joinArr)) throw new ExpressError(400, "joinArr must be an array!");
        const finalSql = [];
        joinArr.forEach(val => {
            // Define join table name and abrev.
            // => authors a
            const join = tablesJoinAbrv[val[0]];
            const joinOn1SqlArr = [];
            const joinOn2SqlArr = [];
            // Define left side of join equation => "author_id" =
            const joinOn1 = val[1];
            joinOn1SqlArr.push(joinOn1);
            // Create right side of join equation => = "id"
            const joinOn2 = val[2];
            joinOn2SqlArr.push(joinOn2);
            const joinOn1Sql = joinOn1SqlArr.join("");
            const joinOn2Sql = joinOn2SqlArr.join("");
            finalSql.push(
                joinType, join, "ON", joinOn1Sql, "=", joinOn2Sql
            );
        });
        return finalSql.join(" ");
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

/**
 * qryObjToOrderBySql
 * Creates ORDER BY sql.
 * Arguments: query object
 * Returns string with order by statement.
 * qryObjToOrderBySql({ orderBy: "name", chronOrder: "DESC" }) => "ORDER BY r.name DESC"
 */
function qryObjToOrderBySql (qry) {
    try {
        const qryCpy = JSON.parse(JSON.stringify(qry));
        const orderByCmnd =  [];
        const sqlObj = {
            columns: [],
            order: [],
            order2: [],
            chronOrder: []
        };
        const qryArray = Object.entries(qryCpy);
        qryArray.forEach(prop => {
            const keyNormlzd = prop[0].toLowerCase().trim();
            const valNormlzd = keyNormlzd !== "chronorder" ? prop[1] : prop[1].toLowerCase().trim();
            const orderByExists = keyNormlzd === "orderby";
            const orderBy2Exists = keyNormlzd === "orderby2";
            if (!orderByCmnd.length && orderByExists) orderByCmnd.push("ORDER BY");
            else if (!orderByCmnd.length && orderBy2Exists) orderByCmnd.push("ORDER BY");

            if (orderByKeys.has(keyNormlzd)) {
                const orderByLen = sqlObj.order.length;
                const orderBy2Len = sqlObj.order2.length;
                const isChron = valNormlzd === "asc" || valNormlzd === "desc";
                const tableCode = recpesFltrClmnNmToTblAbrev[valNormlzd];
                if (!isChron && !sqlObj.order.length) sqlObj.order.push(tableCode, valNormlzd);
                else if (!isChron && sqlObj.order.length) sqlObj.order2.push(tableCode, valNormlzd);
                // Do nothing if chronOrder is selected without an orderBy.
                else if (isChron && !orderByLen && !orderBy2Len) null;
                else if (isChron) sqlObj.chronOrder.push(orderByChron[valNormlzd]);
            }
        });
        const orderBySql = orderByCmnd.length ? orderByCmnd.join("") : "";
        const finalOrder =  [orderBySql];
        if (!sqlObj.order2.length) finalOrder.push(sqlObj.order.join(""));
        // EDGE CASE PREVNT: if orderBy2 is queried without orderBy
        else if (!sqlObj.order.length && sqlObj.order2.length) finalOrder.push(sqlObj.order2.join(""));
        else {
            const order = sqlObj.order.join("");
            finalOrder.push(`${order},`, sqlObj.order2.join(""));
        };
        if (sqlObj.chronOrder.length) finalOrder.push(sqlObj.chronOrder.join(""));
        const finalQry = finalOrder.join(" ");
        return finalQry === " " ? "" : finalQry;
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

/**
 * genWhereSqlArr
 * Creates WHERE sql and parametized values.
 * Arguments: column and value object, parametizer, exactMatch, returnArray, abrev, column name to table abrev object
 * Returns object with whereSql and values props.
 * genWhereSqlArr({ name: "good" }, 1, true) => {
    whereSql: ["WHERE name = $1"],
    values: ["good"]
 * }
 *  genWhereSqlArr({ name: "good" }, 1) => {
    whereSql: ["WHERE name ILIKE $1"],
    values: ["%good%"]
 * }
 *  const recipesClmnNameToTblAbrev = { name: "r." "};
 *  const clmnVals = { name: "good" };
 *  genWhereSqlArr(clmnVals, 1, false, false, true, recipesClmnNameToTblAbrev) => {
    whereSql: ["WHERE r.name ILIKE $1"],
    values: ["%good%"]
 * 
 */
function genWhereSqlArr (columnValObj, parametizer, exactMatch = false, returnArray = false, abrv = false, tableAbrevForColmn) {
    try {
        const sqlObj = {
            whereSql: [],
            values: []
        };
        const isStrict = exactMatch !== false;
        const isReturn = returnArray !== false;
        const qryArray = Object.entries(columnValObj);
        qryArray.forEach((prop, idx) => {
            const isValNumber = Number.isInteger(prop[1]);
            const keyNormlzd = prop[0];
            // const valNormlzd = !isValNumber ? prop[1].toLowerCase().trim() : prop[1];
            const valNormlzd = prop[1];
            // Define ILIKE or = commands.
            const queryOperator = isStrict ? sqlOperatorStrict[keyNormlzd] : sqlOperator[keyNormlzd];
            // Define table code for abrev => r.
            const tableCode = abrv ? tableAbrevForColmn[prop[0]] : null;
            // Define column command => name or r.name.
            const column = !abrv ? [keyNormlzd] : [tableCode, keyNormlzd];
            const columnJoin = column.join("");
            // Define sql command => r.name ILIKE $1.
            const sql = [columnJoin, queryOperator, `$${parametizer}`];
            // Define value for sql command => "chicken".
            const cmndValue = isStrict ? `${valNormlzd}` : `%${valNormlzd}%`;
            // Checks if column val is number;
            const isValNum = isNumbers.has(valNormlzd);
            // checks if column's value should be number.
            const value = !isNumbers.has(keyNormlzd) ? cmndValue : +valNormlzd;
            if (!sqlObj.whereSql.length) sqlObj.whereSql.push("WHERE", sql.join(" "));
            else sqlObj.whereSql.push("AND", sql.join(" "));
            sqlObj.values.push(value);
            parametizer++;
        });
        const returnStmnt = isReturn ? returnArray.join(", ") : "";
        const returnStr = isReturn ? sqlObj.whereSql.push(`RETURNING ${returnStmnt}`) : null;
        sqlObj.whereSql = sqlObj.whereSql.join(" ");
        return sqlObj;
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

/**
 * genSelectSql
 * Creates select sql.
 * Arguments: selectColumnsArr, tableName, tableNameAbrev
 * selectColumnsArr argument: column values
        [ "name", "description" ],
        or ["r.name", "a.author AS author"]
 * Returns string.
 * const selectArr = [ "name", "description" ];
 * genSelectSql(selectArr, "recipes") =>
 * "SELECT name, description FROM recipes"
 * const selectArr2 = [ "r.name", "r.description" ];
 * genSelectSql(selectArr2, "recipes", true) =>
 * "SELECT r.name, r.description FROM recipes r"
 *
 */
function genSelectSql (selectColumnsArr, tableName, tableNameAbrev = false) {
    try {
        if (!Array.isArray(selectColumnsArr)) throw new ExpressError("selectColumnsArr must be an array!");
        const finalSql = [];
        const columns = [];
        finalSql.push("SELECT");
        // Push column names to array.
        selectColumnsArr.forEach(clmnName => columns.push(clmnName));
        finalSql.push(columns.join(", "), "FROM");
        if (tableNameAbrev !== false) {
            // Define table name with table abrev => authors a
            const tableNameAndAbrev = tablesJoinAbrv[tableName];
            finalSql.push(tableNameAndAbrev);
        } else {
            finalSql.push(tableName);
        }
        return finalSql.join(" ");
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}


/**
 * genUpdateSqlObj
 * Creates update sql query object with parametized values.
 * Arguments: tableName, clmnsValsObj, returnArray
 * clmnsValsObj argument: object with column name keys
        and their values as values => { first_name: "lu" }
 * Returns object with sql and values props.
 * const returnArray = [ "first_name", "last_name" ];
 * const clmnsValsObj = { first_name: "fvin2", last_name: "I2" };
 * genUpdateSqlObj("users", clmnsValsObj, returnArray) =>
 * {
 *  sql: "UPDATE users SET first_name = $1, last_name = $2
 *  RETURNING first_name, last_name"
 *  values: ["fvin2", "I2"]
 * }
 */
function genUpdateSqlObj (tableName, clmnsValsObj, returnArray = []) {
    try {
        if (!savourTableNames.has(tableName)) throw new ExpressError(400, `Table name ${tableName} dosen't exist!`);
        const returnLen = returnArray.length;
        const dataArray = Object.entries(clmnsValsObj);
        const sqlCommand = [sqlCommandsObj["update"]];
        const sqlCommandModifs = [sqlCommandsModifsObj["update"]];
        const columns = [];
        const values = [];
        const sqlArr = [];
        const parametizers = [];
        dataArray.forEach((data, idx) => {
            // Define sql operator from column name:
            // name => ILIKE.
            const operator = sqlOperatorStrict[data[0]];
            // Define sql command arr => [ "name ILIKE $1" ]
            const updateSql = [data[0], operator, `$${idx + 1}`].join(" ");
            columns.push(updateSql);
            values.push(data[1]);
        });
        sqlArr.push(sqlCommand.join(" "), tableName, sqlCommandModifs.join(" "), columns.join(", "));
        const returnStmnt = returnLen ? returnArray.join(", ") : "";
        const returnStr = returnLen ? sqlArr.push(`RETURNING ${returnStmnt}`) : null;
        let sql = sqlArr.join(" ");
        return {
            sql,
            values
        };
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

/**
 * genInsertSqlObj
 * Creates insert sql query object with parametized values.
 * Arguments: tableName, clmnsValsObj, returnArray
 * clmnsValsObj argument: object with column name keys
        and their values as values => { first_name: "lu" }
 * Returns object with sql and values props.
 * const returnArray = [ "first_name", "last_name" ];
 * const clmnsValsObj = { first_name: "fvin2", last_name: "I2" };
 * genInsertSqlObj("users", clmnsValsObj, returnArray) =>
 * {
 *  sql: "INSERT INTO users (first_name, last_name) VALUES ($1, $2)
 *  RETURNING first_name, last_name"
 *  values: ["fvin2", "I2"]
 * }
 */
function genInsertSqlObj (tableName, clmnsValsObj, returnArray = []) {
    try {
        if (!savourTableNames.has(tableName)) throw new ExpressError(400, `Table name ${tableName} dosen't exist!`);
        const returnLen = returnArray.length;
        const dataArray = Object.entries(clmnsValsObj);
        const sqlCommand = [sqlCommandsObj["insert"]];
        const sqlCommandModifs = [sqlCommandsModifsObj["insert"]];
        const columns = [];
        const values = [];
        const sqlArr = [];
        const parametizers = [];
        dataArray.forEach((data, idx) => {
            columns.push(data[0]);
            values.push(data[1]);
            parametizers.push(`$${idx + 1}`);
        });
        sqlArr.push(sqlCommand.join(" "), tableName, "(", columns.join(", "), ")", sqlCommandModifs.join(" "), "(", parametizers.join(", "), ")");
        const returnStmnt = returnLen ? returnArray.join(", ") : "";
        const returnStr = returnLen ? sqlArr.push(`RETURNING ${returnStmnt}`) : null;
        let sql = sqlArr.join(" ");
        sql = sql.replaceAll("( ", "(").replaceAll(" )", ")");
        return {
            sql,
            values
        };
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

/**
 * rowExists
 * Creates select sql for a specific row
 * to see if it exists.
 * Arguments: searchFor, columnSelStr, tableName, clmnsNvalsArr
 *      serchFor: string to search for => "recipes"
 *      columnSelStr: select column => "id"
 *      clmnsNvalsArr: array of nested arrays where each array has
 *      two values: column name, column value.
 */
async function rowExists (searchFor, columnSelStr, tableName, clmnsNvalsArr) {
    try {
        // Define sql array for select command.
        const selectSql = ["SELECT", columnSelStr, "FROM", tableName];
        // Define sql array for where command.
        const whereSql = ["WHERE"];
        // Define sql array for values.
        const values = [];
        const arrLgth = clmnsNvalsArr.length
        clmnsNvalsArr.forEach((val, idx) => {
            if (arrLgth === 1) {
                // Push sql where commands to array.
                whereSql.push(val[0], "=", `$${idx + 1}`);
                // Push sql values to array.
                values.push(val[1]);
            } else if (arrLgth > 1 && idx !== 0) {
                whereSql.push("AND", val[0], "=", `$${idx + 1}`);
                values.push(val[1]);
            } else if (arrLgth > 1 && idx === 0) {
                whereSql.push(val[0], "=", `$${idx + 1}`);
                values.push(val[1]);
            }
        });
        // Define final sql array.
        const finalsql = [selectSql.join(" "), whereSql.join(" ")];
        // Define final sql string.
        const finalSqlStr = finalsql.join(" ");
        // Make request to database.
        const pgReq = await db.query(
            `${finalSqlStr}`, values
        )
        // Check if user or recipe exists.
        const isExist = pgReq.rows.length;
        // If not throw error.
        if (!isExist) throw new ExpressError(404, `${searchFor} not found!`);
        else return pgReq.rows;
    } catch(err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

module.exports = {
    arrayConcat,
    genJoinSql,
    qryObjToOrderBySql,
    genWhereSqlArr,
    genSelectSql, genUpdateSqlObj,
    genInsertSqlObj, rowExists
};