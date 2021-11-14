const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const app = express();
const cors = require('cors');

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l4fja.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('bicycle_store');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');

        // Get products API
        app.get('/products', async (req, res) => {
            const result = productsCollection.find({});
            const size = parseInt(req.query.size);
            let products;
            if (size === 6) {
                products = await result.limit(size).toArray();
            }
            else {
                products = await result.toArray();
            }
            res.json(products);
        });

        // Get single product api
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.findOne(query);
            res.json(result);
        });

        // Post Products api
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        })

        // DELETE product api
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })


        // Get Reviews API
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find({}).toArray();
            res.json(result);
        });

        // Post Reviews api
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        })

        // GET orders api
        app.get('/orders', async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.json(result);
        })

        // Post Orders api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });

        // put order api
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedOrder.status,
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // Post user api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // Put update user api
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true };
            const docs = { $set: user };
            const result = await usersCollection.updateOne(filter, docs, options);
            res.json(result);
        });

        // put admin api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const doc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, doc);
            res.json(result);
        })

        // get admin api
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        // get my orders api
        app.get('/myOrders/:email', async (req, res) => {
            const email = req.params.email;
            const result = await ordersCollection.find({ email: email }).toArray();
            res.json(result);
        })

        // Delete order api
        app.delete('/myOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})
