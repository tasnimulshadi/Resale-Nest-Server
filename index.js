const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());

//database


app.get('/', (req, res) => {
    res.send('Hello From Server 12');
});

//run server
app.listen(port, () => {
    console.log('Server Runnig,', port);
});
