const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config/config').get(process.env.NODE_ENV);

const app = express();

// MONGOOSE
mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE);

const { User } = require('./models/user');
const { Book } = require('./models/book');

// MIDDLEWARE
app.use(bodyParser.json());
app.use(cookieParser());

// PORT
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})