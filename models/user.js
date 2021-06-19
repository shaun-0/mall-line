const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email:String,
  username:{
    type:String,
    min:2,
    max:25
  },
  password:{
    type:String,
    min:8,
    max:30,
  },
  contactNumber:{
    type:Number,
    length:10
  },
  address:{
    type:String
  },
  cart:[{
    productId:{ 
      type:mongoose.Schema.Types.ObjectId,
      ref:"product"
    },
    count:{
      type:Number,
      min:0,
      default:0
    },
    totalprice:{
      type:Number,
      min:0,
      default:0
    }
  }],
  totalBill:{
    type:Number,
    min:0,
    default:0
  }
})
userSchema.plugin(passportLocalMongoose);
 
module.exports = mongoose.model("user",userSchema)