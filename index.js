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
