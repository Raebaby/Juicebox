const express = require('express');
const postsRouter = express.Router();
const { requireUser } = require('./utils');
const { getAllPosts } = require('../db');


postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");
    res.send({message: 'Hello from Posts'})
  //next();
});


postsRouter.get('/', async (req, res, next) => {
  
    try {
      const allPosts = await getAllPosts()
      
      const posts = allPosts.filter(post => post.active || (req.user && post.author.id === req.user.id))
      console.log("ALl posts here ", posts)
      res.send(posts)
    
    }catch({name,error}) {
      next({name, error})
    }
  })



postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;
  console.log()
  const tagArr = tags.trim().split(/\s+/)
  const postData = {};

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = postsRouter;