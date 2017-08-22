const MongoClient = require('mongodb').MongoClient
const express = require('express')
const cors = require('cors')

const mongoUrl = 'mongodb://localhost:27017/photos-project'
const mongoCollection = 'photos'

MongoClient.connect(mongoUrl, (err, db) => {
    if (err) { throw err }
    const collection = db.collection(mongoCollection)

    const app = express()
    app.use(cors())
    
    app.get('/photos', function (req, res) {

        collection.find({}).toArray((err, docs) => {
            res.send(docs)
        })
    })

    app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
    })
})