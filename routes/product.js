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
var path = require('path');

//注册 
router.post("/register", (req, res) => {  //insert
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.body;
        var sql = "SELECT * FROM users where telphone=?";
        conn.query(sql, params.telphone, (err, result) => {
            if (err) return res.json({ code: 500, msg: err});
            else {
                if (result.length !== 0) {
                    res.json({ code: 500, msg: "该手机号已注册" })
                    res.end()
                } else if (result.length == 0) {
                    var sql = "insert into users(telphone,password,sex) values(?,?,?)"
                    conn.query(sql, [params.telphone, params.password, params.sex], (err, result) => {
                        if (err) return res.json({ code: 500, msg: err});
                        if (result.affectedRows > 0) {
                            res.json({ code: 200, msg: "注册成功" })
                        } else {
                            res.json({ code: 500, msg: "注册失败" })
                        }
                    });
                }
                // 释放数据库连接池
                conn.release();
            }
        });
    })
})
    //登录
router.post("/login", (req, res) => {  //select
    console.log(req.body)
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.body;
        var sql = "SELECT * FROM users where telphone=?";
        conn.query(sql, params.telphone, (err, result) => {
            if (err) return res.json({ code: 500, msg: err});
            else {
                if (result.length == 0) {
                    res.json({ code: 500, msg: "你还没有注册，快去注册一个账号吧" });
                    res.end();
                } else if (result.length !== 0) {
                    var sql = "SELECT * FROM users where telphone=? and password=?"
                    conn.query(sql, [params.telphone, params.password], (err, result) => {
                        if (err) return res.json({ code: 500, msg: err});
                        else {
                            if (result.length == 0) {
                                res.json({ code: 500, msg: "登录失败" });
                                res.end();
                            } else {
                                // 生成token信息
                                // 这里是把登录信息(账号和密码)作为了规则，6个小时的有效期
                                params.endTime=new Date().getTime()+1000*60*60*6
                                let token = jwt.sign(params, "xiao") 
                                res.json({ code: 200, msg: "登录成功", data: {user: result, token: token}});
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

// 生成token，并返回给前端
router.post("/login2", (req, res) => {  //select
    let params = req.body;
    console.log(params)
    // params: {
    //     pwd: "123456"
    //     username: "test"
    // }
    // 这里是把登录信息(账号和密码)作为了规则，6个小时的有效期
    params.endTime=new Date().getTime()+1000*60*60*6
    let token = jwt.sign(params, "xiao") 
    res.json({ code: 200, msg: "登录成功" ,data:token});
    res.end();
})
    
// 拿到token，解析 token，定位用户
router.post("/getmsg", (req, res) => {  //select
    console.log(req)
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'] || req.headers['token']
    // 确认token
    jwt.verify(token, "xiao", function(err, decoded) {
        if (err) {
            res.json({ code: 500, msg: 'token信息错误或失效！' })
        } else {
            // 如果没问题就把解码后的信息保存到请求中，供后面的路由使用
            // decoded: {
            //   exp: 1738220706
            //   iat: 1651820706
            //   pwd: "123456"
            //   username: "test"
            // }
            if(new Date().getTime()>=decoded.endTime){
                res.json({ code: 500, msg: 'token信息过期！' })
            }else{
                res.json({ code: 200, msg: '', data: decoded })
            }
        }
    });
})
// 修改用户头像和名称 //  
// router.post("/upload/file",upload.uploadAloneFile,(req, res) => {  // update
//     pool.getConnection((err, conn) => {
//         let params = req.body;
//         console.log(req,params)
//         if (err) {
//             // fs.rm("./public"+params.icon,(err=>{
//             //     console.log(err)
//             // }))
//             fs.unlink("./public"+params.icon, (err) => {
//                 if (err) throw err;
//                 console.log('path/file.txt was deleted');
//             });
//             return res.json({ code: 500, msg: err, data:params});
//         }
//         var sql = "UPDATE users SET icon=?, name=? WHERE id=?";
//         // let files = params.files;
        
//         pool.query(sql, [params.icon, params.name, params.uid], (err, result) => {
//             if (err) return res.json({ code: 500, msg: err});
//             console.log(JSON.stringify(result))
//             if (result.affectedRows > 0) {
//                 res.json({ code: 200, msg: "更新成功", })
//             } else {
//                 res.json({ code: 500, msg: "更新失败" })
//             }
//             conn.release();
//         })
//     })
// })


// 上传文件的接口(单文件，多文件，文件夹) 
router.post("/upload/file",upload.uploadFile,(req, res) => {  // update
    pool.getConnection((err, conn) => {
        let params = req.body;
        console.log('-----',params,req.fields,req.files)
        if (err) return res.json({ code: 500, msg: err,});
        var sql = "UPDATE users SET icon=?, name=? WHERE id=?";
        // let files = params.files;
        
        pool.query(sql, [params.icon, params.name, params.uid], (err, result) => {
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
// 文件下载
router.get("/download/:id",(req,res)=>{
    pool.getConnection((err, conn) => {
        let id = req.params.id || '';
        // console.log(req.params,res.query,id)
        console.log(__dirname,path.join(__dirname, '../public/images/upload/255.png'))
        res.download(path.join(__dirname, '../public/images/upload/255.png'), '255.png');
    })
})

// 修改用户头像和名称
router.post("/editusers",upload.uploadAloneFile, (req, res) => {  // update
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.body;
        console.log(params)
        var sql = "UPDATE users SET icon=?, name=? WHERE id=?";
        // let files = params.files;
        
        pool.query(sql, [params.icon, params.name, params.uid], (err, result) => {
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
        if (err) return res.json({ code: 500, data:null ,msg: err});
        let params = req.query;
        var sql = `SELECT * FROM users WHERE id=?`;
        console.log(JSON.stringify(params))
        // 从链接池中获取链接
        conn.query(sql, params.id, (err, result) => {
            if (err) return res.json({ code: 500, data:null ,msg: err});
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
//留言反馈
router.post("/addAdvice", (req, res) => {  //insert
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.body;
        var sql = "insert into advice(uid,type,content) values(?,?,?)"
        conn.query(sql, [params.uid,params.type, params.content], (err, result) => {
            if (err) return res.json({ code: 500, msg: err});
            if (result.affectedRows > 0) {
                res.json({ code: 200, msg: "反馈成功" })
            } else {
                res.json({ code: 500, msg: "反馈失败" })
            }
            conn.release();
        });
    })
})
//景区推荐
router.post("/recomjingqu", (req, res) => {  //insert
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.body;
        var sql = "insert into recomscenic(uid,recomaddress,recomname,recombecause) values(?,?,?,?)"
        conn.query(sql, [params.uid,params.recomaddress, params.recomname, params.recombecause], (err, result) => {
            if (err) return res.json({ code: 500, msg: err});
            if (result.affectedRows > 0) {
                res.json({ code: 200, msg: "感谢您的推荐，我们会尽快处理您的推荐" })
            } else {
                res.json({ code: 500, msg: "推荐失败" })
            }
            conn.release();
        });
    })
})

// 搜索查询--景区
router.get("/getjingqus", (req, res) => {
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.query;
        var sql 
        if(params&&params.keyword){
            sql = `SELECT * FROM scenic WHERE introduce LIKE '%${params.keyword}%';`;
        }else{
            sql = "SELECT * FROM scenic";
        }
        console.log(JSON.stringify(params))
        // 从链接池中获取链接
        conn.query(sql, (err, result) => {
            if (err) return res.json({ code: 500, msg: err});
            if (result) {
                if(result.length!=0){
                    res.json({ code: 200, data:result })
                }else{
                    res.json({ code: 200, data:result ,msg:"暂无匹配内容"})
                }
                conn.release();
            }
        })
    })
})
// 景区专属推荐
router.get("/jingquCustomized", (req, res) => {
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.query;
        var huanjing=params.huanjing?("huanjing LIKE '%"+params.huanjing+"%'"+(params.yinshi||params.jiaotong||params.aihao||params.sheshi||params.xiaofei?" && ":"")):""
        var yinshi=params.yinshi?("yinshi LIKE '%"+params.yinshi+"%'"+(params.jiaotong||params.aihao||params.sheshi||params.xiaofei?" && ":"")):""
        var jiaotong=params.jiaotong?("jiaotong LIKE '%"+params.jiaotong+"%'"+(params.aihao||params.sheshi||params.xiaofei?" && ":"")):""
        var aihao=params.aihao?("aihao LIKE '%"+params.aihao+"%'"+(params.sheshi||params.xiaofei?" && ":"")):""
        var sheshi=params.sheshi?("sheshi LIKE '%"+params.sheshi+"%'"+(params.xiaofei?" && ":"")):""
        var xiaofei=params.xiaofei?("xiaofei LIKE '%"+params.xiaofei+"%';"):""
        var sql = "SELECT * FROM scenic WHERE "+huanjing+yinshi+jiaotong+aihao+sheshi+xiaofei;
        console.log(JSON.stringify(params))
        console.log(sql)
        // 从链接池中获取链接
        conn.query(sql, (err, result) => {
            if (err) return res.json({ code: 500, msg: err});
            if (result) {
                if(result.length!=0){
                    res.json({ code: 200,msg:"提交成功", data:result })
                }else{
                    res.json({ code: 200,msg:"提交成功,但暂无匹配内容", data:result })
                }
                conn.release();
            }
        })
    })
})
// 游记分享
router.get("/shares", (req, res) => {
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.query;
        var sql = "SELECT * FROM shares";
        // 从链接池中获取链接
        conn.query(sql, (err, result) => {
            if (err) return res.json({ code: 500, msg: err});
            if (result) {
                conn.release();
                res.json({ code: 200, data:result })
            }
        })
    })
})
// 添加--游记分享
router.post("/sharesAdd", (req, res) => {
    pool.getConnection((err, conn) => {
        if (err) return res.json({ code: 500, msg: err});
        let params = req.body;
        console.log("....."+JSON.stringify(params))
        var sql = "insert into shares(uid,cover,title,content,ctime) values(?,?,?,?,?)"
        conn.query(sql, [params.uid,params.cover,params.title, params.content,params.ctime], (err, result) => {
            if (err) return res.json({ code: 500, msg: err});
            if (result.affectedRows > 0) {
                res.json({ code: 200, msg: "发表成功" })
            } else {
                res.json({ code: 500, msg: "发表失败" })
            }
            conn.release();
        });
    })
})
    // 将路由对象导出
module.exports = router;