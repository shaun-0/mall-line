
const express = require("express");
const routes = express.Router();
const flash = require("connect-flash")
const passport = require("passport");
const User = require("../models/user");
const product = require("../models/product");
const review = require("../models/review");
const order = require("../models/order")
const middleware = require("../middlewares");
const PaytmChecksum = require("paytmchecksum");

const checksum_lib = require("../paytm/checksum");
const config = require("../paytm/config");
const middlewareObj = require("../middlewares");


routes.post("/new",async (req,res)=>{
  let myOrder = await order.find({
    userId: req.user._id
  })
  if(myOrder){
    order.findOneAndDelete({userId:req.user._id},(err)=>{
      if(err){
        console.log("status : ",err)
      }
    });

  }
  let newOrder = await order.create({
    userId: req.user._id,
    amount: req.user.totalBill
  })
  req.user.cart.forEach(function(item){
      if(item.count>0){
        newOrder.products.push({
          product: item.productId,
          count: item.count
        });
      }
    })
    console.log("Order created")
  newOrder.save();
  res.redirect("/order/summary");
})



routes.get("/summary",middlewareObj.isLoggedIn,async (req,res)=>{
  let myOrder = await order.findOne({
    userId: req.user._id
  }).populate("userId")
  .populate("products.product")
  
  if(myOrder){
    res.render("orderSummary",{order:myOrder,user:req.user})
  }else{
    res.send("No order found")
  }
})


// below code paytm payment integration



routes.post("/payment",async (req,res)=>{
  let update = await User.findOneAndUpdate({_id:req.user._id},{
    email: req.body.email,
    contactNumber: req.body.phone,
    address: req.body.address
  })
      console.log(update);
     
  let myOrder = await order.findOne({
    userId: req.user._id
  }).populate("userId")
  .populate("products.product")
  .exec()
  if(myOrder){

 var paymentDetails = {
    amount: myOrder.amount,
    customerId: myOrder.userId.username,
    customerEmail: myOrder.userId.email,
    customerPhone: myOrder.userId.contactNumber
}
if(!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
    res.status(400).send('Payment failed')
} else {
    var params = {};
    params['MID'] = config.PaytmConfig.mid;
    params['WEBSITE'] = config.PaytmConfig.website;
    params['CHANNEL_ID'] = 'WEB';
    params['INDUSTRY_TYPE_ID'] = 'Retail';
    params['ORDER_ID'] = myOrder._id;
    params['CUST_ID'] = paymentDetails.customerId;
    params['TXN_AMOUNT'] = paymentDetails.amount;
    params['CALLBACK_URL'] = 'http://localhost:3000/order/callback';
    params['EMAIL'] = paymentDetails.customerEmail;
    params['MOBILE_NO'] = paymentDetails.customerPhone;


/////////////////////////////////
checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
  var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
  // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

  var form_fields = "";
  for (var x in params) {
      form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
  }
  form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
  res.end();

});
//////////////////////////////////////////////
}}
else{
  res.redirect("/")
}
})
routes.post("/callback", (req, res) => {
  // Route for verifiying payment

  var body = '';

  req.on('data', function (data) {
     body += data;
  });

   req.on('end', function () {
     var html = "";
     var post_data = qs.parse(body);

     // received params in callback
     console.log('Callback Response: ', post_data, "\n");


     // verify the checksum
     var checksumhash = post_data.CHECKSUMHASH;
     // delete post_data.CHECKSUMHASH;
     var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
     console.log("Checksum Result => ", result, "\n");


     // Send Server-to-Server request to verify Order Status
     var params = {"MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID};

     checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {

       params.CHECKSUMHASH = checksum;
       post_data = 'JsonData='+JSON.stringify(params);

       var options = {
         hostname: 'securegw-stage.paytm.in', // for staging
         // hostname: 'securegw.paytm.in', // for production
         port: 443,
         path: '/merchant-status/getTxnStatus',
         method: 'POST',
         headers: {
           'Content-Type': 'application/x-www-form-urlencoded',
           'Content-Length': post_data.length
         }
       };


       // Set up the request
       var response = "";
       var post_req = https.request(options, function(post_res) {
         post_res.on('data', function (chunk) {
           response += chunk;
         });

         post_res.on('end', function(){
           console.log('S2S Response: ', response, "\n");

           var _result = JSON.parse(response);
             if(_result.STATUS == 'TXN_SUCCESS') {
                 res.send('payment sucess')
             }else {
               console.log("payment failed")
                 res.redirect("/")
             }
           });
       });

       // post the data
       post_req.write(post_data);
       post_req.end();
      });
     });
});

module.exports = routes;