// 引入模块
const express = require("express");
// 接收formData数据
const multer = require('multer')
const fs = require("fs")
// 创建路由对象
var router = express.Router();
// 加载数据库池
const pool = require("../conf/pool");
const utils = require("../utils/utils")
// 操作token
const jwt = require('jsonwebtoken')
// 文件上传
const upload = require("../utils/upload")
    //登录
router.post("/login", (req, res) => {  //select
    console.log(req.body)
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.body;
        var sql = "SELECT * FROM adminUsers where username=?";
        conn.query(sql, params.username, (err, result) => {
            if (err) return res.json({ code: 500, msg: err});
            else {
                if (result.length == 0) {
                    res.json({ code: 500, msg: "账号不存在" });
                    res.end();
                } else if (result.length !== 0) {
                    var sql = "SELECT * FROM adminUsers where username=? and password=?"
                    conn.query(sql, [params.username, params.password], (err, result) => {
                        if (err) return res.json({ code: 500, msg: err});
                        else {
                            if (result.length == 0) {
                                res.json({ code: 500, msg: "登录失败" });
                                res.end();
                            } else {
                                res.json({ code: 200, msg: "登录成功", data: result });
                                res.end();
                            }
                        }
                        conn.release();
                    });
                }
            }
        });
    })
})
// 修改用户头像和名称
router.post("/editusers",upload.uploadAloneFile, (req, res) => {  // update
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.body;
        console.log(params)
        var sql = "UPDATE adminUsers SET icon=?, username=? WHERE id=?";
        // let files = params.files;
        
        pool.query(sql, [params.icon, params.username, params.uid], (err, result) => {
            if (err) return res.json({ code: 500, msg: err});
            console.log(JSON.stringify(result))
            if (result.affectedRows > 0) {
                res.json({ code: 200, msg: "更新成功", })
            } else {
                res.json({ code: 500, msg: "更新失败" })
            }
            conn.release();
        })
    })
})
// 获取用户信息
router.get("/getusers", (req, res) => {
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.query;
        var sql = `SELECT * FROM adminUsers WHERE id=?`;
        console.log(JSON.stringify(params))
        // 从链接池中获取链接
        conn.query(sql, params.id, (err, result) => {
            if (err) return res.json({ code: 500, msg: err});
            else{
                if (result) {
                    res.json({ code: 200, data:result })
                }else{
                    res.json({ code: 200, data:null ,msg:"暂无匹配内容"})
                }
                conn.release();
            }
        })
    })
})

// 获取用户信息
router.get("/getUserList", (req, res) => {
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.query;
        var sql = `SELECT * FROM adminUsers`;
        console.log(JSON.stringify(params))
        // 从链接池中获取链接
        conn.query(sql, (err, result) => {
            if (err) return res.json({ code: 500, msg: err});
            else{
                if (result) {
                    res.json({ code: 200, data:result })
                }else{
                    res.json({ code: 200, data:null ,msg:"暂无内容"})
                }
                conn.release();
            }
        })
    })
})
    // 将路由对象导出
module.exports = router;