const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;
const mongoConnectionString = process.env.DBURL
const secret = process.env.SECRET
const adminRoutes = require("./routes/admin");
const Product = require("./models/product");
const review = require("./models/review");
const User = require("./models/user");
const bodyParser = require("body-parser");
const passport = require("passport");
const passportLocal = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const indexRoute = require("./routes/index");
const productRoutes = require("./routes/product");
const userRoutes = require("./routes/user");
const paymentRoutes = require("./routes/checkout")

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

mongoose
  .connect(mongoConnectionString, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connecter to db"))
  .catch((err) => console.log(err));

app.use(methodOverride("_method"))   //methodOverride for put and delete requests

app.use(flash());

app.use(
  require("express-session")({
    secret: secret,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error")
  res.locals.success = req.flash("success")
  next();
});

//registration

app.use("/",indexRoute);
app.use("/product", productRoutes)
app.use("/admin", adminRoutes);
app.use("/user",userRoutes);
app.use("/order",paymentRoutes);

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
 