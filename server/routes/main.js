const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/', async (req, res, next) => {
    try {
        let perPage = 3;
        let page = req.query.page || 1;

        const posts = await Post.aggregate([{ $sort: { createdAt: -1}}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.count();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', {
            posts,
            current: page,
            nextPage: hasNextPage ? nextPage : null
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/post/:id', async (req, res, next) => {
    try {
        let slug = req.params.id;

        const data = await Post.findById({ _id: slug });

        res.render('post', {
            data,
        })
    } catch (error) {
        
    }
});

router.get('/search', async(req, res, next) => {
    try {
        const searchTerm = req.body.searchTerm;

        console.log(searchTerm);

        res.send(searchTerm);
    } catch (error) {
        console.log(error);
    }
})

router.get('/about',  (req, res, next) => {
    res.render('about');
});

module.exports = router;