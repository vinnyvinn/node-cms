const express = require('express');
const router = express.Router();
const Post =  require('../../models/Post');
const Category = require('../../models/Category');
const {isEmpty,uploadDir} = require('../../helpers/upload-helpers');
const fs = require('fs');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*',(req,res,next) =>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/',(req,res) =>{
    Post.find({})
    .populate('category')
    .then((posts) =>{
        res.render('admin/posts',{posts:posts});
    })
    
}); 

router.get('/my-posts',(req,res) =>{
    Post.find({user:req.user.id})
    .populate('category')
    .then((posts) =>{
        res.render('admin/posts/my-posts',{posts:posts});
    });
   });

router.get('/edit/:id',(req,res) =>{
    Post.findOne({_id:req.params.id}).then((post) =>{
        Category.find({}).then((categories) =>{
            res.render('admin/posts/edit',{post:post,categories:categories});
        })
       
    });
    
   
})

router.get('/create',(req,res) =>{
    Category.find({}).then((categories) =>{
        res.render('admin/posts/create',{categories:categories});
    });
   
});

router.post('/create',(req,res) =>{

    let filename ='';
    if(!isEmpty(req.files)){
        const file = req.files.file;
         filename = Date.now() + '-'+ file.name;
        
    file.mv('./public/uploads/'+filename).then((res) =>{
    console.log('File Uploaded successfully...');
    }).catch((e) => console.log(e));
       
    }
       
    let allowComments = true;
    if(req.body.allowComments){
        allowComments=true;
    }
    else{
        allowComments=false;
    }
 const newPost = Post({
     user:req.user.id,
     title:req.body.title,
     status:req.body.status,
     allowComments:allowComments,
     body:req.body.body,
     file:filename,
     category:req.body.category
 });
 newPost.save().then((savedData) =>{
     req.flash('success_message',`Post was created successfully`);
     res.redirect('/admin/posts');
 }).catch((validator) => {
     res.render('admin/posts/create',{
         errors: validator.errors
     });
 });


   
});

router.put('/edit/:id',(req,res) =>{
    Post.findOne({_id:req.params.id}).then((post)=>{
        if(req.body.allowComments){
            allowComments=true;
        }
        else{
            allowComments=false;
        }
      
        post.user=req.user.id;
        post.title = req.body.title;
        post.allowComments=allowComments;
        post.status=req.body.status;
        post.body=req.body.body;
        post.category=req.body.category;
        
        
        if(!isEmpty(req.files)){
            const file = req.files.file;
             filename = Date.now() + '-'+ file.name;
              post.file = filename;
        file.mv('./public/uploads/'+filename).then((res) =>{
        console.log('File Uploaded successfully...');
        }).catch((e) => console.log(e));
           
        }

        post.save().then((updatePost) =>{
            req.flash('success_message','Post was successfully updated');
            res.redirect('/admin/posts');
        });
    });
});

router.delete('/:id',(req,res) =>{
    Post.findOne({_id:req.params.id}).populate('comments')
    .then((post) =>{
     fs.unlink(uploadDir + post.file,(err) =>{
         if(!post.comments.length < 1){
      post.comments.forEach((comment) =>{
       comment.remove();
      });
         }
       post.remove().then((removedPost) =>{
        req.flash('success_message','Post was successfully deleted..');
        res.redirect('/admin/posts');
       });
      
     })
     
     
    });
})

module.exports = router;