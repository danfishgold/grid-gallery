require('dotenv').config()
const AWS = require('aws-sdk/global')
const S3 = require('aws-sdk/clients/s3')
const fs = require('fs')
const path = require('path')
const huey = require('huey')
const sharp = require('sharp')
const mongo = require('mongodb')

const s3 = new AWS.S3({
    apiVersion: process.env.S3_API_VERSION,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
})

const s3Params = {
    Bucket: process.env.S3_BUCKET,
    ACL: 'public-read'
}


const s3Dir = 'photos'
const localDir = './example-photos'
const mongoUrl = 'mongodb://localhost:27017/photos-project'
const mongoCollection = 'photos'


// PROMISE STUFF

Promise.prototype.thenMap = function(fn) {
    return this.then(arr => Promise.all(arr.map(fn)))
}
Promise.prototype.thenLog = function(log) {
    return this.then(x => {
        console.log(log)
        return x
    })
}

function readDir(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, data) => {
            if (err) { reject(err) }
            else { resolve(data) }
        })
    })
}

function uploadFileToS3(params) {
    return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
            if (err) { reject(err) }
            else { resolve(data) }
        })
    })
}

// COLOR STUFF

function componentToHex(c) {
    var hex = c.toString(16)
    return hex.length == 1 ? "0" + hex : hex
}

function rgbToHex(rgb) {
    const [r, g, b] = rgb
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}


// ACTUAL STUFF

mongo.MongoClient
    .connect(mongoUrl)
    .then(db => db.collection(mongoCollection))
    .then(collection => {
        return collection.deleteMany({})
            .then(() => collection)
    })
    .then(collection => {
        return readDir(localDir)
            .then(fileNames =>
                Promise.all(fileNames.map(fileName => {
                    const filePath = path.join(localDir, fileName)
                    return makePhotoStuff(filePath)
                        .then(stuff => upload(stuff, s3, collection))
                }))
            )
    })
    .thenLog("Finished!")
    .catch(err => {
        console.log(`error: ${err.stack}`)
    })


function makePhotoStuff(filepath) {
    const image = sharp(filepath)
    const original = image.jpeg().toBuffer()
    const metadata = image.metadata()
    const smaller = metadata
        .then(props => {
            if (props.width > props.height) { return image.resize(400, null) }
            else { return image.resize(null, 400) }
        })
        .then(img => img.jpeg().toBuffer())

    return Promise.all([original, smaller, metadata])
        .then(stuff => {
            return {
                big: stuff[0],
                small: stuff[1],
                width: stuff[2].width,
                height: stuff[2].height
            }
        })
}


function upload(photoStuff, s3, collection) {
    const { big, small, width, height } = photoStuff
    const id = new mongo.ObjectID()

    const bigParams = Object.assign({}, s3Params, {
        Key: `${s3Dir}/${id}.jpg`,
        Body: big
    })
    const smallParams = Object.assign({}, s3Params, {
        Key: `${s3Dir}/${id}_small.jpg`,
        Body: small
    })

    const uploads = Promise.all([
        uploadFileToS3(bigParams).thenLog(`uploaded big ${id}`),
        uploadFileToS3(smallParams).thenLog(`uploaded small ${id}`)
    ])

    const insertion = uploads.then(uploads => {
        const [bigUpload, smallUpload] = uploads
        const doc = {
            _id: id,
            width,
            height,
            smallUrl: smallUpload.Location,
            bigUrl: bigUpload.Location
        }
        return collection.insertOne(doc).thenLog(`inserted ${id}`)
    })

    return insertion
}