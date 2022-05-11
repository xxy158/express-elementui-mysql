// 引入模块
// 接收formData数据
const multer = require('multer')
const fs = require("fs")
const path = require('path');
module.exports= {
    //自定义multer中间件   
    uploadAloneFile(req,res,next){
        //dest 值为文件存储的路径;single方法,表示上传单个文件,参数为表单数据对应的key
        let upload=multer({dest:"./public/images/upload"}).single("file");
        upload(req,res,(err)=>{
            //打印结果看下面的截图
            console.log(req.file);
            if(err){
                res.send("err:"+err);
            }else{
                var file=req.file
                //将文件信息赋值到req.body中，继续执行下一步
                //这里修改文件名字，改为上传文件的名称。
                console.log(file)
                var newname=file.originalname.slice(0,file.originalname.lastIndexOf(".")) + "-" + new Date().getTime() + file.originalname.slice(file.originalname.lastIndexOf("."))
                fs.renameSync('./public/images/upload/' + file.filename, './public/images/upload/' + newname);
                req.body.icon="/images/upload/"+newname
                next();
            }
        })
    },
    uploadMoreFile(req,res,next){
        //dest 值为文件存储的路径;array方法,表示上传多个文件,参数为表单数据对应的key
        // console.log('???',multer)
        let upload=multer({dest:"./public/images/upload"}).any();
        upload(req,res,(err)=>{
            //打印结果看下面的截图
            if(err){
                res.send("err:"+err);
            }else{
                let files = req.files;
                console.log('92-',req);
                if (files.length === 0) {  //判断一下文件是否存在，也可以在前端代码中进行判断。
                    res.json({ code: 500, msg: "请上传文件" });
                } else {
                    var newfiles=[]
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i]
                        let fileInfo = {};
                        //这里修改文件名字，改为上传文件的名称。
                        var newname=file.originalname.slice(0,file.originalname.lastIndexOf(".")) + "-" + new Date().getTime() + file.originalname.slice(file.originalname.lastIndexOf("."))
                        // var webkitRelativePath=file.webkitRelativePath?file.webkitRelativePath.slice(0,file.webkitRelativePath.lastIndexOf("/")+1):""
                        // console.log('----',webkitRelativePath)
                        fs.renameSync('./public/images/upload/' + file.filename, './public/images/upload/' + newname);
                        // 获取文件信息
                        fileInfo.type = file.mimetype;
                        fileInfo.name = file.originalname;
                        fileInfo.size = file.size;
                        fileInfo.path = "/images/upload/"+newname;
                        newfiles.push(fileInfo)
                    }
                    // 将文件信息赋值到req.body中
                    req.body.files=newfiles
                }
                //继续执行下一步
                next();
            }
        })
    },
    uploadFile(req,res,next) {
        // formidable({ multiples: true,uploadDir: "./public/images/upload"})
        var files=req.files.file
        console.log(files,files.length>0)
        var basicPath=path.join(__dirname, '../public/images/upload/')
        try {
            // 多文件（文件夹）
            if(files&&files.length>0){
                files.forEach(item => {
                    var directory=item.name
                    var oldDirect=newDirect=basicPath
                    var oldName=item.path.slice(item.path.lastIndexOf("\\")+1)
                    var newName=Date.now()+"-"+item.name.slice(item.name.lastIndexOf("/")+1)
                    // 文件重命名
                    fs.renameSync(oldDirect + oldName, oldDirect + newName)
                    // 判断文件名是否有路径（上传文件夹需按原文件夹路径保存文件）
                    if(directory.indexOf("/")!=-1){
                        var direct=item.name.slice(0,item.name.lastIndexOf("/"))
                        newDirect=path.join(newDirect,direct)
                        // 判断文件夹是否已存在
                        if(!fs.existsSync(newDirect)){
                            // 创建文件夹
                            fs.mkdirSync(newDirect)
                        }
                        // 如果指定根目录存在
                        if(fs.existsSync(newDirect)){
                            // 复制文件到新目录
                            fs.copyFileSync(oldDirect + newName,newDirect +"\\"+newName)
                            // 删除原文件
                            fs.unlinkSync(oldDirect + newName)
                        }
                    }
                });
            }else{
                // 单文件
                // var oldurl=basicPath + files.path.slice(files.path.lastIndexOf("\\")+1)
                var directory=files.name
                var oldDirect=newDirect=basicPath
                var oldName=files.path.slice(files.path.lastIndexOf("\\")+1)
                var newName=Date.now()+"-"+files.name.slice(files.name.lastIndexOf("/")+1)
                // 文件重命名
                fs.rename(basicPath + oldName, newDirect + newName)
                // 判断文件名是否有路径（上传文件夹需按原文件夹路径保存文件）
                if(directory.indexOf("/")!=-1){
                    var direct=files.name.slice(0,files.name.lastIndexOf("/"))
                    newDirect=path.join(newDirect,direct)
                    // 判断文件夹是否已存在
                    if(!fs.existsSync(newDirect)){
                        // 创建文件夹
                        console.log(newDirect)
                        fs.mkdirSync(newDirect)
                    }
                    // 如果指定根目录存在
                    if(fs.existsSync(newDirect)){
                        // 复制文件到新目录
                        fs.copyFileSync(oldDirect + newName,newDirect +"\\"+newName)
                        // 删除原文件
                        fs.unlinkSync(oldDirect + newName)
                    }
                }
            }
        } catch (error) {
            console.log(error)
            return res.json({ code: 500, msg: "上传失败",err: error})
        }
        next()
    }
}