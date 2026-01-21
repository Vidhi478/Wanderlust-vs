const express = require('express')
const app = express();
const mongoose = require('mongoose');
const Listing=require("./models/listing.js");
const path=require("path");
const MONGO_URL= "mongodb://127.0.0.1:27017/wanderlust";
const methodOverride=require("method-override");
const ejsMate= require("ejs-mate");
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

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,'views'));

//index
app.get("/listings",async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
})

//new 
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

//show 
app.get("/listings/:id",async(req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
})
//create
app.post("/listings",async(req,res)=>{
    const newListing =new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})

//edit 
app.get("/listings/:id/edit",async(req,res)=>{
     let {id}= req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})
//Update Route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});
//delete
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

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

app.get("/",(req,res)=>{
    res.render("listings/home.ejs");

})
app.listen(8080,()=>{
    console.log("server is listening on port 8080");
})
