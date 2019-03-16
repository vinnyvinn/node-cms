const express = require('express');
const router =  express.Router();
const Category = require('../../models/Category');

router.all('/*',(req,res,next) =>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/',(req,res) =>{
    Category.find({}).then((categories) =>{
        res.render('admin/categories/index',{categories:categories});
      })
    
});

router.post('/create',(req,res) =>{
  const category = new Category({name:req.body.name});
  category.save().then((saveCategory) =>{
      req.flash('success_message','Category sucessfully created');
      res.redirect('/admin/categories');

  }).catch((e) => res.send(e));
});

router.get('/edit/:id',(req,res) =>{
    Category.findOne({_id:req.params.id}).then((category) =>{
        res.render('admin/categories/edit',{category:category});
    });
});

router.put('/update/:id',(req,res) =>{
 Category.findOne({_id:req.params.id}).then((category) =>{
  category.name=req.body.name;
  category.save().then((result) =>{
      req.flash('success_message','You successfully updated category');
      res.redirect('/admin/categories');
  })
 });
});

router.delete('/delete/:id',(req,res) =>{
    Category.findOne({_id:req.params.id}).then((category) =>{
    category.remove();
    req.flash('success_message','Category successfully deleted');
    res.redirect('/admin/categories');
    });
})

module.exports = router;