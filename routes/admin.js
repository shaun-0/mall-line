const express = require("express");
const middlewareObj = require("../middlewares");
const routes = express.Router();
const product = require("../models/product")


 

routes.get("/product/add",middlewareObj.isLoggedIn,(req,res)=>{
  if(req.user.username=="Admin"){
    res.render("product/addNew");

  }
  else{
    
  req.flash("error","Only admins can add new products")
  res.redirect("/");
  }
})

routes.post("/product",middlewareObj.isLoggedIn,async (req,res)=>{
  try{

  
  let newProduct = await product.create({
    name: req.body.name,
    image: req.body.image,
    price: req.body.price,
    description: req.body.description,
    name: req.body.name,
  })
  if(newProduct){
    console.log("NewProduct created ",newProduct);
    req.flash("success","Product created");
  res.redirect("/")
  }
}catch(err){
  req.flash("error",err.message);
  res.redirect("/")
}
})

module.exports = routes;