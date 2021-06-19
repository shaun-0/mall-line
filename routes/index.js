
const express = require("express");
const routes = express.Router();
const flash = require("connect-flash")
const passport = require("passport");
const User = require("../models/user");
const product = require("../models/product")
const middleware = require("../middlewares");


routes.get("/", async (req, res) => {
  //=========================Add product manually=================================
  // let newProduct = new product({
  //   name:'Rolex watch for men comfortable and stylish okay?',
  //   image:"https://rukminim1.flixcart.com/image/492/590/k7z3afk0/watch/f/j/n/lcs-4116-lois-caron-original-imafq3k8rbbbybgz.jpeg?q=50",
  //   price:"3000.5",
  //   rating:"2",
  //   description:"LCS-4116 CROCO STRAP DAY AND DATE FUNCTIONING Analog Watch - For Men"
  // })
  // newProduct = await newProduct.save();
  //===============================================================================
  try {
    let foundProduct = await product.find();
    res.render("home", { products: foundProduct });
  } catch (err) {
    req.flash("error",err.message)
        res.redirect("/");
  }
});

routes.get("/register", (req, res) => {
  
  res.render("register");
});
// ----------------SEARCH-----------------
routes.post("/search",(req,res)=>{
  let query = " ";
  if(req.body.query){
    query=req.body.query;
  }
  res.redirect("/search/"+query);
})

routes.get("/search/:query",async(req,res)=>{
  try {
    let foundProduct = await product.find({name: { $regex: new RegExp(req.params.query, "i") } });
    res.render("product/search", { products: foundProduct });
  } catch (err) {
    req.flash("error",err.message)
        res.redirect("/");
  }
})
//----------------------------------------

routes.post("/register", (req, res) => {
  if(req.body.password === req.body.confirmpassword){
    const user = new User({
      username: req.body.username,
      email: req.body.email
    });
    User.register(user, req.body.password, (err, user) => {
      if (err) {
        console.log(err.message);
        req.flash("error",err.message)
        return res.redirect("/register");
      }
      console.log(User);
      passport.authenticate("local")(req, res, function () {
        req.flash("success",`Signed Up successfully, Welcome ${user.username}`)
        res.redirect("/");
      });
    });
  }else{
    res.redirect('/register')
  }
  
});

//LOGIN

routes.get("/login", (req, res) => {
  res.render("login");
});

routes.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  }),
  (req, res) => {}
);

//LOGOUT

routes.get("/logout", (req, res) => {
  req.logout();
  req.flash("success","Logged you out");
  res.redirect("/");
});



module.exports = routes;