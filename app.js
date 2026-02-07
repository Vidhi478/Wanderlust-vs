if(process.env.NODE_ENV!="production"){
require('dotenv').config();
}


const express = require('express')
const app = express();
const mongoose = require('mongoose');
const Listing=require("./models/listing.js");
const path=require("path");
 const dbUrl= process.env.ATLASDB_URL;


const methodOverride=require("method-override");
const ejsMate= require("ejs-mate");
const Review = require("./models/review.js");
const {reviewSchema}= require("./schema.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const session=require("express-session");
const MongoStore = require('connect-mongo').default;

const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

main()
.then(()=>{
    console.log("connect to DB");
})
.catch((err)=>{
    console.log(err);
});

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

 const  store= MongoStore.create({
 mongoUrl:dbUrl,
 crypto:{
    secret:process.env.SECRET,
 },
 touchAfter: 24*3600,
 });

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized:true,
    cookie:{
        expire: Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};


async function main() {
    await mongoose.connect(dbUrl);
}
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.set("view engine","ejs");
app.set("views",path.join(__dirname,'views'));


const validateReview=(req,res,next)=>{
    let{error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg= error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
    };



    //flash msg
  app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();

  });

//   app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"fakeusername",
//     });
//     let registeredUser= await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
//   });
    
    app.use("/listings",listingRouter);
    app.use('/listings/:id/reviews',reviewRouter);
    app.use("/",userRouter);


// app.get("/testListing",async(req,res)=>{
// let sampleListing=new Listing({
//     title:"My New Villa",
//     description:"By the beech",
//     price:120000,
//     location:"Calangute,Goa",
//     country:"India",
// });
// await sampleListing.save();
// console.log("sample was saved");
// res.send("successful testing");
// })

// app.use((err,req,next)=>{
//     res.send("something went wrong!");
// });
app.get("/",(req,res)=>{
    res.render("listings/home.ejs");

})
app.listen(8080,()=>{
    console.log("server is listening on port 8080");
})
