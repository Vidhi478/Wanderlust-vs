const express=require("express");
const router=express.Router();
const {reviewSchema}= require("../schema.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner}= require("../middleware.js");
const multer  = require('multer');
const { storage } =require("../cloudConfig.js");
const upload = multer({ storage });
//index
router.get("/",async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
})

//new 
router.get("/new", isLoggedIn,  (req,res)=>{
    res.render("listings/new.ejs");
})

//show 
router.get("/:id",async(req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author",
        }
    })
    .populate("owner");

    if(!listing){
     req.flash("error","Listing you requested for does not exist!");
     res.redirect("/listings");
    }
  console.log(listing);
    res.render("listings/show.ejs",{listing});
})
//create
router.post("/", isLoggedIn ,upload.single('listing[image]'),async(req,res)=>{
    try{
      let url=req.file.path;
      let filename=req.file.filename;
    const newListing =new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={ url, filename};
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings"); 
}
catch(err){
  console.log(err);
}
});
 
//edit 
router.get("/:id/edit", isLoggedIn,isOwner,async(req,res)=>{
     let {id}= req.params;
    const listing=await Listing.findById(id);
    
    if(!listing){
     req.flash("error","Listing you requested for does not exist!");
     res.redirect("/listings");
    }
    
    res.render("listings/edit.ejs",{listing});
})


//Update Route
router.put("/:id",isLoggedIn,isOwner, async (req, res) => {
  let { id } = req.params;
   let listing=await Listing.findByIdAndUpdate(id);
  listing.title=req.body.listing.title;
  listing.description=req.body.listing.description;
  listing.price=req.body.listing.price;
  listing.location=req.body.listing.location;
  listing.country=req.body.listing.country;
   await listing.save();
   req.flash("success","Listing Updated!");
  res.redirect(`/listings/${id}`);
});


//delete
router.delete("/:id",isLoggedIn, isOwner,async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
   req.flash("success","Listing Deleted!");
  res.redirect("/listings");
});

module.exports= router;
