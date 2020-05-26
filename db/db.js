require("json-dotenv")();
const mysql = require('mysql');
const pool = mysql.createPool(JSON.parse(process.env.DB));

module.exports = class Database {
    constructor() {
        this.pool = pool;
    }
    query(sql, params) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                if (err) {
                    if (conn) {
                        conn.release()
                    }
                    console.log(err);
                    return reject(err);
                }

                conn.query(sql, [params], (err, result) => {
                    conn.release()
                    if (err) {
                        console.log(err)
                        return reject(err);
                    }
                    console.log(result);
                    return resolve(result);
                })
            })
        })
    }
}