const express = require('express')
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const fileUpload = require('express-fileupload');

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qdveb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db('social');
        const postCollection = database.collection('posts')
        const userCollection = database.collection('users');

        // Get Posts API
        app.get('/posts', async (req, res) => {
            const cursor = postCollection.find({});
            const posts = await cursor.toArray();
            res.send(posts)
        });

        // Post User API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        })

        // Post Product API
        app.post('/posts', async (req, res) => {
            const name = req.body.name;
            const description = req.body.description;
            const likes = req.body.likes;
            const picData = req.files.image.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64')
            const post = {
                name,
                description,
                likes,
                image: imageBuffer
            }
            const result = await postCollection.insertOne(post);
            res.json(result)
        });

        // Update Post API
        app.put('/posts/:id/update', async (req, res) => {
            const id = req.params.id;
            const name = req.body.name;
            const description = req.body.description;
            const picData = req.files.image.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64')
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name,
                    description,
                    image: imageBuffer
                }
            };
            const result = await postCollection.updateOne(filter, updateDoc, options)
            res.json(result);
        })

        // Update Post API
        app.put('/posts/:id', async (req, res) => {
            const id = req.params.id;
            const updatedLikes = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    likes: updatedLikes.like
                }
            };
            const result = await postCollection.updateOne(filter, updateDoc, options)
            res.json(result);
        })

        // Update Post API
        app.put('/posts/:id/comments', async (req, res) => {
            const id = req.params.id;
            const updatedComments = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    comments: updatedComments.comment
                }
            };
            const result = await postCollection.updateOne(filter, updateDoc, options)
            res.json(result);
        })

        // Delete Post Api
        app.delete('/posts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await postCollection.deleteOne(query);
            res.json(result);
        })

    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello ATG.World!')
})

app.listen(port, () => {
    console.log(`Listening at ${port}`)
})