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

// GET BOOK ROUTE
app.get('/api/getBook', (req, res) => {
    // localhost:3001/api/getBook?id=123456
    let id = req.query.id;

    Book.findById(id, (err, doc) => {
        if (err) return res.status(400).send(err);
        res.send(doc);
    })
})

// GET BOOKS ROUTE
app.get('/api/books', (req, res) => {
    // localhost:3001/books?skip=3&limit=2&order=asc
    
    // options
    let skip  = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let order = req.query.order; // asc || desc

    Book.find()
        .skip(skip)
        .sort({_id:order})
        .limit(limit)
        .exec((err,doc) => {
            if (err) return res.status(400).send(err);
            res.send(doc);            
    })
})

// POST ROUTE
app.post('/api/book', (req, res) => {
    const book = new Book(req.body);

    book.save((err, doc) => {
        if (err) return res.status(400).send(err);
        res.status(200).json({
            post: true,
            bookId: doc._id
        })
    })
})

// UPDATE ROUTE

// DELETE ROUTE

// PORT
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})