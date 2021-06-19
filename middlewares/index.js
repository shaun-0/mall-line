//ALl middleware are setup here
let Product = require("../models/product")
let Review = require("../models/review");
const user = require("../models/user");

const middlewareObj ={};

// check whether user own campground


// Check if comment is own by user
middlewareObj.checkReviewOwnership = function (req,res,next){
  if(req.isAuthenticated()){
    Review.findById(req.params.comment_id,function(err,foundReview){
    if(err || !foundReview){
      req.flash("error","Comment not found")
      console.log(err)
        res.redirect("back");
    }else{
      console.log(foundReview)
      if(foundReview.author.id.equals(req.user._id)){
        next();
      }else{
      console.log(err)
      req.flash("error","You are not authorized")
      res.redirect("back");
      }
    }
    });
  }else{
    res.redirect("back");
  }
}

//check if user is logged in middleware
middlewareObj.isLoggedIn = function (req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error","Please Login First")
  res.redirect("/login");
}


module.exports = middlewareObj;