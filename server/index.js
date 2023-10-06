const express = require("express")
const fs = require("fs-extra")
const rimraf = require("rimraf")
const bodyParser = require('body-parser')
const formidable = require('express-formidable')
const app = express()


// 配置请求参数解析器
app.use(bodyParser.json({ extended: false }))

const filePath = "/static/"
const fileUrl = "http://localhost:10000"

// 配置跨域
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next()
})

// 验证文件状态接口
app.post("/api/upload/verify", (req, res) => {
    // 接受前端传递参数
    let { fileMd5, extension } = req.body
    console.log(fileMd5, extension)
    // 判断文件是否存在, 如果存在，秒传：返回上传成功
    if (fs.existsSync(__dirname + filePath + fileMd5 + "." + extension)) {
        res.send({
            url: fileUrl + filePath + fileMd5 + "." + extension,
            code: 200,
            uploadedList: []
        })
        return
    }
    // 如果不存在，判断是否有已经上传的切片，如果有，返回已上传切片list
    const dirPath = __dirname + filePath + fileMd5
    let files = []
    try {
        files = fs.readdirSync(dirPath);
    } catch (e) {
        // 目录不存在，使用文件的md5值为目录名创建文件
        fs.mkdirSync(dirPath)
        res.send({
            url: "",
            code: 200,
            uploadedList: []
        })
        return
    }
    res.send({
        url: "",
        code: 200,
        uploadedList: files
    })
})

// 分片上传接口
app.post("/api/upload", formidable(), (req, res) => {
    let { file } = req.files
    let { filename, fileMd5 } = req.fields

    const newPath = __dirname + filePath + fileMd5 + "/" + filename
    console.log(newPath)
    fs.move(file.path, newPath, err => {
        if (err) {
            console.log(err)
            res.send("failed")
            return
        }
        res.send("success")
    })
})

// 合并文件接口
app.post("/api/upload/merge", async (req, res) => {
    let { fileMd5, extension } = req.body
    let files = []
    const dirPath = __dirname + filePath + fileMd5
    console.log(dirPath)
    files = fs.readdirSync(dirPath);
    console.log(files)
    files.sort((a, b) => a.split("-")[1] - b.split("-")[1])
    const fileSavePath = __dirname + filePath + fileMd5 + "." + extension
    const writeStream = fs.createWriteStream(fileSavePath)
    files.map((chunk, index) => {
        const chunkName = dirPath + "/" + fileMd5 + "-" + index
        const readStream = fs.readFileSync(chunkName)
        writeStream.write(readStream)
    })
    if (rimraf.rimrafSync(dirPath)) {
        console.log("删除目录成功")
    } else {
        console.log("删除目录失败")
    }
    res.send({
        code: 200,
        message: "上传成功"
    })
})

app.get("", (req, res) => {
    res.send("success")
})


app.listen(10000, () => {
    console.log("大文件上传服务器已启动")
})