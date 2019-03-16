const express = require('express');
const router =  express.Router();
const faker = require('faker');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const Category = require('../../models/Category');
const {userAuthenticated} = require('../../helpers/authentication');


router.all('/*',(req,res,next) =>{
    req.app.locals.layout = 'admin';
    next();
})

router.get('/',(req,res) =>{
  const promises = [
   Post.count().exec(),
   Comment.count().exec(),
   Category.count().exec(),

  ];
  Promise.all(promises).then(([postCount,commentCount,categoryCount])=>{
    res.render('admin/index',{
      postCount:postCount,
      commentCount:commentCount,
      categoryCount:categoryCount
    });
  })
  
   
});

router.post('/generate-fake-posts',(req,res) =>{
for(let i =0;i<req.body.amount;i++){
 let post = new Post();
 post.title = faker.name.title();
 post.slug= faker.name.title();
 post.status = 'public';
 post.allowComments = faker.random.boolean();
 post.body = faker.lorem.sentence();

 post.save().then((savedPost) =>{
   res.redirect('/admin/posts');
 });

}
});

module.exports = router;