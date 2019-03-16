const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');
const Post = require('../../models/Post');

router.all('/*',(req,res,next) =>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/',(req,res) =>{
    Comment.find({user:req.user.id}).populate('user')
    .then((comments) =>{
        res.render('admin/comments',{comments:comments});
    });
   
});

router.delete('/delete/:id',(req,res) =>{
Comment.findOne({_id:req.params.id}).then((comment) =>{
    comment.remove().then((removedComment) =>{
        Post.findOneAndUpdate({comments:req.params.id},{$pull:{comments:req.params.id}},(err,data) =>{
            if(err) console.log(err);
            res.redirect('/admin/comments');
                  });
    });           
       
    });
    
})

router.post('/approve-comment',(req,res)=>{
   Comment.findByIdAndUpdate(req.body.id,{$set:{approveComments:req.body.approveComments}},(err,result) =>{
       if(err) return err;
       res.send(result);
   })

});

router.post('/',(req,res) =>{
Post.findOne({_id:req.body.id}).then((post) =>{

    console.log(post.id);
    const newComment = new Comment({
    body:req.body.body,
    user:req.user.id
    });
 
    post.comments.push(newComment);
    post.save().then((savedPost) =>{
       newComment.save().then((savedComment) =>{
           res.redirect(`/show/${post.id}`);
       }).catch((e) => res.send(e)); 
    }).catch((e) => res.send(e));
}).catch((e) => res.send('An error occured'));
});

module.exports=router;