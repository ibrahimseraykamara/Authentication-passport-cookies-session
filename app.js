

//new code

require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport=require("passport")
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");

const path = require("path");

// ...
const app = express();
app.set("view engine", "ejs"); // Set the view engine to ejs
app.set("views", path.join(__dirname, "/views")); // Set the path to the views directory


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Route definitions
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});


app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    if(req.isAuthenticated()){
    res.render("secrets");
}else{
    res.redirect("/login")
}
});


app.post("/register", (req, res) => {

User.register({username: req.body.username}, req.body.password, function(err, user){
  if(err){
    console.log(err)
    res.redirect("/register");
  } else{
    passport.authenticate("local")(req,res, function(){
     res.redirect("/secrets")   
    })
  }
})

});



app.post("/login", (req, res) => {
const user=new User({
    username: req.body.username,
    password: req.body.password
})
req.login(user, function(err){
    if(err){
        console.log(err);
    }else{
        passport.authenticate("local")(req,res, function(){
            res.redirect("/secrets")   
           })
    }
})
})


// app.post('/login', 
//   passport.authenticate('local', { failureRedirect: '/login' }),
//   function(req, res) {
//     res.redirect('/secrets');
//   });



app.listen(1013, function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is running on port 1010");
    }

}) 
