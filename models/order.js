const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  products:[
    {
    product:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "product"
  },
    count:{
      type:Number,
      min:0,
      default:0
    }
  }
],
  amount:{
    type:Number,
    min:0,
    default:0
  },
  paid:{
    type:Boolean,
    default:false
  }
})

module.exports=mongoose.model("order",orderSchema);
