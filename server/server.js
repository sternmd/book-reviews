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
const { auth } = require('./middleware/auth');

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
    // localhost:3001/api/books?skip=3&limit=2&order=asc
    
    // query options
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

// USER REGISTER
app.post('/api/register', (req,res) => {
    const user = new User(req.body);

    user.save((err,doc) => {
        if (err) return res.json({success:false});
        res.status(200).json({
            success: true,
            user: doc
        })
    })
})

// USER LOGIN
app.post('api/login', (req,res) => {
    User.findOne({'email': req.body.email}, (err,user) => {
        if(!user) return res.json({isAuth: false, message: 'Auth failed. Email not found.'});

        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) return res.json({
                isAuth: false,
                message: 'Wrong password'
            });

            user.generateToken((err,user) => {
                if (err) return res.status(400).send(err);
                res.cookie('auth', user.token).json({
                    isAuth: true,
                    id: user._id,
                    email: user.email
                })

            })
        })
    })
})

// USER isAuth
app.get('/api/auth', auth, (req,res) => {
    res.json({
        isAuth: true,
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname
    })
})

// USER LOGOUT
app.get('/api/logout', auth, (req,res) => {
// remove token of user, then log user out
    req.user.deleteToken(req.token, (err,user) => {
        if (err) return res.status(400).send(err);
        res.sendStatus(200)
    })
})

// REVIEWER ID
app.get('/api/getReviewer', (req,res) => {
    let id = req.query.id;

    User.findById(id, (err,doc) => {
        if (err) return res.status(400).send(err);
        res.json({
            name: doc.name,
            lastname: doc.lastname
        })
    })
})

// GET ALL USERS
app.get('/api/users', (req,res) => {
    User.find({}, (err,users) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(users);
    })
})

// GET POSTS (REVIEWS) OF A USER
app.get('/api/user_posts', (req,res) => {
    // search all books that belong to owner id
    Book.find({ownerId: req.query.user}).exec((err,docs) => {
        if (err) return res.status(400).send(err);
        res.send(docs)
    })
})

// UPDATE ROUTE
app.post('/api/book_update', (req, res) => {
    Book.findByIdAndUpdate(req.body._id, req.body, {new:true}, (err, doc) => {
        if (err) return res.status(400).send(err);
        res.json({
            sucess: true,
            doc
        })
    })
})

// DELETE ROUTE
app.delete('/api/delete_book', (req,res) => {
    // localhost:3001/api/books?id=123345
    let id = req.query.id;

    Book.findByIdAndRemove(id, (err,doc) => {
        if (err) return res.status(400).send(err);
        res.json(true)
    })
})

// PORT
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})