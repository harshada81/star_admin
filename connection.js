var mysql = require("mysql");
var util = require("util");
var conn = mysql.createConnection({
    "host":"b6whaeosmlsztcoeybsh-mysql.services.clever-cloud.com",
    "user":"u3wcnaqr5z6jzgde",
    "password":"ugXppqVUyfIhyDFMNcQ2",
    "database":"b6whaeosmlsztcoeybsh"
});

var exe = util.promisify(conn.query).bind(conn);

module.exports = exe;
