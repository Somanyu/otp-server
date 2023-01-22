const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const dotenv = require('dotenv');

const app = express();

dotenv.config({ path: './.env' });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const contactRouter = require('./routes/contact');
app.use('/contact', contactRouter);

app.listen(process.env.PORT, () => {
    console.log(`App listening on at http://localhost:${process.env.PORT}`);
})