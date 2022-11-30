const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());
//jwt

//database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bfrcfcb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async () => {
    try {
        //collections
        const userCollection = client.db('resalenestdb').collection('users');
        const productCollection = client.db('resalenestdb').collection('products');
        const categoryCollection = client.db('resalenestdb').collection('categories');
        const bookingCollection = client.db('resalenestdb').collection('bookings');

        //users

        app.post('/user', async (req, res) => {
            const user = req.body;
            //check user
            const query = { email: user.email }
            const userInDB = await userCollection.findOne(query);

            if (!userInDB) {
                //set user
                const result = await userCollection.insertOne(user);
                res.send(result);
            }
        })

        app.get('/user', async (req, res) => {
            const email = req.query.email;
            const query = { email }
            const result = await userCollection.findOne(query);
            res.send(result ? result : { result: null });
            // res.send(result);
        })

        app.put('/user', async (req, res) => {
            const email = req.query.email;
            const body = req.body;
            // console.log(body);

            const filter = { email }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    verified: body.varification
                },
            };

            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const role = req.query.role;
            let query = {};
            if (role) {
                query = { role };
            }
            const cursor = userCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });


        // category

        app.get('/categories', async (req, res) => {
            const query = {};
            const cursor = categoryCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        });


        // products
        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product)
            res.send(result);
        });

        // get product by product id
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.findOne(query)
            res.send(result);
        });

        // delete prroduct by id
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            let query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        });

        // get prroducts by category id
        app.get('/products/:id', async (req, res) => {
            const categoryId = req.params.id;
            const searchQuery_filter = req.query.filter;

            let query = { sold: false }

            if (categoryId !== 'all') {
                query = { categoryId: categoryId, sold: false };
            }
            if (searchQuery_filter === 'advertise') {
                query = { advertise: true, sold: false };
            }

            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // get prroducts by seller email
        app.get('/productsbyseller/:email', async (req, res) => {
            const sellerEmail = req.params.email;
            let query = { email: sellerEmail }
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // updates product (sold) with product id by seller
        app.patch('/product/sold/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body;

            let filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    sold: body.sold,
                    advertise: body.advertise
                },
            };

            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // updates product (advertise) with product id by seller
        app.patch('/product/advertise/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const body = req.body;
            console.log(body);

            // advertise limit is 4. only update if count is less then 4
            const countQuery = { sold: false, advertise: true };
            const soldProductsCount = await productCollection.countDocuments(countQuery);
            console.log(soldProductsCount);
            if (soldProductsCount >= 4) {
                return res.send({ acknowledged: false, adlimit: true })
            }

            let filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    advertise: body.advertise
                },
            };

            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });


        // booking

        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking)
            res.send(result);
        });



        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            let query = {};
            if (email) {
                query: { buyeremail: email }
            }
            const cursor = bookingCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });



    }
    finally {
        //
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello From Server 12');
});

//run server
app.listen(port, () => {
    console.log('Server Runnig,', port);
});
