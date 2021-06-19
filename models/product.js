const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name:{
    type: String,
    minlength: 1,
    maxlength: 75
  },
  image:String,
  price:{
    type: Number,
    required: true,
  },
  description:{
    type:String,
  },
  reviews:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "review"
    }
  ],
  totalRating:{
    type: Number,
    min:0,
    default:0
  },
  rating:{
    type:Number,
    default:0
  }
})
  
module.exports=mongoose.model("product",productSchema);
