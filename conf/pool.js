// conf/db.js
// MySQL数据库联接配置  数据库池
const mysql=require("mysql");
var pool=mysql.createPool({
    host:"localhost",
    user:"root",
    password:"root",
    port:3306,
    database:"test",
    connectionLimit:10
    // connectionLimit:0    // 0 代表无限制
})
module.exports=pool;



