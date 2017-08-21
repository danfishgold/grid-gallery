require('dotenv').config()
const AWS = require('aws-sdk/global')
const S3 = require('aws-sdk/clients/s3')
const fs = require('fs')
const path = require('path')
const huey = require('huey')
const mongo = require('mongodb')

const s3 = new AWS.S3({
    apiVersion: process.env.S3_API_VERSION,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
})
const bucket = process.env.S3_BUCKET

const dir = 'photos'
const localDir = '../example-photos'
const mongoUrl = 'mongodb://localhost:27017/photos-project'
const mongoCollection = 'photos'

mongo.MongoClient.connect(mongoUrl, (err, db) => {
    if (err) { throw err }
    const collection = db.collection(mongoCollection)

    fs.readdir(localDir, (err, files) => {
        for (let filename of files) {
            
            const filepath = path.join(localDir, filename)
    
            huey(filepath, (error, rgb, photoData) => {
                if (err) { throw err }
                const id = new mongo.ObjectId()
                const { width, height } = photoData
                
                const stream = fs.createReadStream(filepath)
                const fileParams = {
                    Bucket: bucket,
                    Key: path.join(dir, id.toHexString()),
                    Body: stream,
                    ACL: 'public-read'
                }
                s3.upload(fileParams, (err, data) => {
                    if (err) { throw err }
                    const doc = {
                        _id: id,
                        dominantColor: rgbToHex(rgb),
                        width,
                        height,
                        url: data.Location
                    }
                    collection.insertOne(doc, (err, res) => {
                        if (err) { throw err }
                        console.log(`added ${filename}`)
                    })
                })
            })
        }
    })
})

function componentToHex(c) {
    var hex = c.toString(16)
    return hex.length == 1 ? "0" + hex : hex
}

function rgbToHex(rgb) {
    const [r, g, b] = rgb
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}
