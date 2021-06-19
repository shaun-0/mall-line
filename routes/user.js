
const express = require("express");
const routes = express.Router();
const flash = require("connect-flash")
const passport = require("passport");
const User = require("../models/user");
const product = require("../models/product");
const middlewareObj = require("../middlewares");

routes.get("/cart",middlewareObj.isLoggedIn,async(req,res)=>{
  try{
    let user = req.user;
     user =await (await User.findById(user._id).populate("cart.productId")).execPopulate();
    if(user.cart){
      res.render("cart",{user:user});
    }else{
      req.flash("error","User not found")
        res.redirect("/");
    }
  }catch(err){
    req.flash("error",err.message)
        res.redirect("/");
  }
  
})


module.exports = routes;