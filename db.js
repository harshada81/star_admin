

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",  // Make sure this is correct
    database: "star_kidz",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function execute(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw error;
    }
}

module.exports = { execute };
