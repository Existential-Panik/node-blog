const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const adminLayout = '../views/layouts/admin';

const authMiddleware = (req,res,next) => {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json( {message: 'Unauthorized'});
    }

    try {
        const decoded = jwt.verify(token,  jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized.'})
    }
}

router.get('/', async (req, res) => {
    try {
        res.render('admin/index', {layout: adminLayout});
    } catch (error) {
        console.log(error);
    }
});

router.post('/register', async (req, res) => {
    try {
        const {username, password} = req.body;
        const hashedPass = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPass});
            res.status(201).json({ message: 'User Created', user});
        } catch (error) {
            if(error.code == 11000){
                res.status(409).json({ message: 'User already in use.'});
                
            }
            res.status(500).json({ message: 'Internal server error'});
        }
    } catch (error) {
       console.log(error);
    }
})
router.get('/dashboard', authMiddleware, async (req, res) => {

    try{
    const data = await Post.find();

    res.render('admin/dashboard', {data, layout: adminLayout});
    }
    catch(error){
        res.send(error);
    }
})

router.get('/add-post', async (req, res) => {
    try{
    const data = await Post.find();

    res.render('admin/add-post', {data, layout: adminLayout});
    }
    catch(error){
        res.send(error);
    }
});

router.post('/add-post', async(req, res) => {
    try {
       try {
        const newPost = new Post({
            title: req.body.title,
            body: req.body.body
        })

        await Post.create(newPost);
        res.redirect('/admin/dashboard');
       } catch (error) {
           console.log(error);
       } 
    } catch (error) {
        console.log(error)
    }
})
router.post('/', async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne( {username});

        if(!user){
            return res.status(401).json({ message: 'Invalid credentials'});

        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json({ message: 'Invalid Credentials'});
        }

        const token = jwt.sign( {userId: user._id}, jwtSecret)
        res.cookie('token', token, {httpOnly: true});
        console.log('Sucessful login')
        res.redirect('/admin/dashboard');
    } catch (error) {
       console.log(error);
    }
});

router.get('/edit-post/:id', authMiddleware,async (req, res) => {
    try{
    const post = await Post.findOne({_id: req.params.id});

    res.render('admin/edit-post', {
        data: post,
    });
    }
    catch(error){
        console.log(error);
    }

})

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now(),
        });

        res.redirect(`/admin/edit-post/${req.params.id}`);
    } catch (error) {
        
    }
});

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id});
        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error);
    }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});

module.exports = router;