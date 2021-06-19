
const express = require("express");
const routes = express.Router();
const flash = require("connect-flash")
const passport = require("passport");
const User = require("../models/user");
const product = require("../models/product");
const review = require("../models/review");
const middleware = require("../middlewares");
const order = require("../models/order")


routes.get("/:id", async (req, res) => {
  
  product.findById(req.params.id)
  .populate("reviews")
  .populate("author")
  .exec(function (err,foundProduct){
    if(err){
    req.flash("error",err.message);
    res.redirect("/")
    }
    if (!foundProduct) {
      req.flash("error","Product not found");
      res.redirect("/");
    }
    res.render("product/productDesc", { product: foundProduct });
  })
  

});

routes.get("/:id/review", middleware.isLoggedIn ,async(req,res)=>{
try{
  let foundProduct = await product.findById(req.params.id);
  if(foundProduct){
    res.render("review/newReview",{product:foundProduct})
  }else{
  req.flash("error","Product not found");
  res.redirect("/")
  }
}catch(err){
  req.flash("error",err.message);
  res.redirect("/")
}
})

routes.post("/:id/review",middleware.isLoggedIn, async(req,res)=>{  //post new comment
try{
  let foundProduct = await product.findById(req.params.id);
  if(foundProduct){

    let rating = parseInt(req.body.rating);
    let newComment = await review.create({
      rating : rating,
      comment : req.body.review,
      author : req.user.username
    });
    foundProduct.reviews.push(newComment);
    foundProduct.totalRating+=rating;
    foundProduct.rating = foundProduct.totalRating / foundProduct.reviews.length ;
    await foundProduct.save();
    res.redirect(`/product/${req.params.id}`)
  }
  else{
  req.flash("error","Product not found");
  res.redirect("/")
  }
}catch(err){
  req.flash("error",err.message);
  res.redirect("/")
}
})

//cart
routes.post("/:id/addtocart",middleware.isLoggedIn,async (req,res)=>{

  try{

    const prod = await product.findById(req.params.id);
    if(prod){
      let obj = req.user.cart.find(o=>o.productId==req.params.id)
      if(obj){
        obj.count++;
        obj.totalprice=prod.price * obj.count;
      }
      else{
        req.user.cart.push({
          productId: req.params.id,
          count: 1,
          totalprice: prod.price
        })
      }
      req.user.totalBill += prod.price;
      req.user.save();
      req.flash("success","Product added to cart");
      res.redirect("back")
    }
    else{
      req.flash("error","Product not found");
      res.redirect("/")
    }
  }catch(err){
    req.flash("error",err.message);
  res.redirect("/")
    console.log(err)
  }
});

routes.post("/:id/buy",middleware.isLoggedIn,async (req,res)=>{
  let myOrder = await order.find({
    userId: req.user._id
  })
  if(myOrder){
    order.findOneAndDelete({userId:req.user._id},(err)=>{
      if(err){
        req.flash("error",err.message);
        res.redirect("/")
      }
    });
  }
  let prod = await product.findById(req.params.id);
  if(!prod){
    req.flash("error","Product not found");
    res.redirect("back")
  }
  let newOrder = await order.create({
    userId: req.user._id,
    amount: prod.price
   
  })
  newOrder.products.push({
    product: req.params.id,
    count:1
  })
    console.log(newOrder)
  newOrder.save();
  res.redirect("/order/summary");
})

 routes.post("/:id/dec",middleware.isLoggedIn,async (req,res)=>{
  try{
    const prod = await product.findById(req.params.id);
    if(prod){
      let obj = req.user.cart.find(o=>o.productId==req.params.id)
      if(obj){
        if(obj.count>0){
          obj.count--;
          req.user.totalBill -=prod.price
        }
         obj.totalprice=prod.price * obj.count;
      }
      else{
        res.send("cant find product in cart")
      }
      req.user.save();
      res.redirect("back")
    }
    else{
      req.flash("error","Product not found");
      res.redirect("/");
    }
  }catch(err){
    req.flash("error",err.message);
    res.redirect("/")
  }
 })
  

 routes.post("/:id/inc",middleware.isLoggedIn,async (req,res)=>{
  try{
    const prod = await product.findById(req.params.id);
    if(prod){
      let obj = req.user.cart.find(o=>o.productId==req.params.id)
      if(obj){
        if(obj.count<10){
          obj.count++;
          req.user.totalBill +=prod.price
        }else{
          req.flash("error","Maximum limit of this product reached");
          res.redirect("back")
        }
         obj.totalprice=prod.price * obj.count;
      }
      else{
        res.send("cant find product in cart")
      }
      req.user.save();
      res.redirect("back")
    }
    else{
      req.flash("error","Product not found")
      res.redirect("/");
    }
  }catch(err){
    req.flash("error",err.message)
    res.redirect("/");
  }
 })

 routes.post("/:id/delete",middleware.isLoggedIn,async (req,res)=>{
  try{
    const prod = await product.findById(req.params.id);
    if(prod){
      let obj = req.user.cart.find(o=>o.productId==req.params.id)
      if(obj){
          req.user.totalBill -= prod.price * obj.count
          obj.count=0;
         obj.totalprice=0;
      }
      else{
        req.flash("error",err.message)
        res.redirect("/");
      }
      req.user.save();
      res.redirect("back")
    }
    else{
      req.flash("error","Product not found")
        res.redirect("/");
    }
  }catch(err){
    req.flash("error",err.message)
        res.redirect("/");
  }
 })

module.exports = routes;