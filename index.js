const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const app = express();

dotenv.config({ path: './.env' });

mongoose.set('strictQuery', false);

// MongoDB connection setup
mongoose.connect(process.env.MONGODB_CONNECT,
    { useNewUrlParser: true }, (err) => {
      if (!err) {
        console.log('Connected to MongoDB Atlas (otpmessagelist).');
      } else {
        console.log('Error in connecting to MongoDB Atlas: ' + err);
      }
    }
  )

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
const contactRouter = require('./routes/contact');
app.use('/contact', contactRouter);

app.listen(process.env.PORT, () => {
    console.log(`App listening on at http://localhost:${process.env.PORT}`);
})