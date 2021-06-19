const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  rating:{
    type:Number,
    min:1,
    max: 5,
    required:true,
    default:1
  },
  comment:{ 
    type:String,
    maxlength:150
  },
  author:{
    // id:{
    // type:mongoose.Schema.Types.ObjectId,
    // ref:"user"
    // },
    
      type:String,
      default:"Anonymous"
  }
},{ 
  timestamps: true 
});
module.exports=mongoose.model("review",reviewSchema);
