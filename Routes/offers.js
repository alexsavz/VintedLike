const express = require('express');
const isAuthenticated = require('../Middlewares/isAuthenticated');
const router = express.Router();

const User = require('../Models/User');
const Offer = require('../Models/Offer');

// ROUTES OFFERS

router.get('/offers', isAuthenticated, async (req, res) => {

    const regexTitle = new RegExp(req.query.title, "i");
    let priceMin = 0;
    let priceMax = 10000;
    if(req.query.priceMax){
        priceMax = Number(req.query.priceMax);
    }
    if(req.query.priceMin){
        priceMin = Number(req.query.priceMin);
    }
    const page = Number(req.query.page);
    const sort = req.query.sort;
 
    try {

        let price = "asc";
        let skip = 0;

        if(page > 1){
            skip = page * 20;
        }
        if(sort === "price-asc"){
            price = "asc";
        }
        else if(sort === "price-desc"){
            price = "desc";
        }
        const offersList = await Offer.find(
            {
            product_name : regexTitle, 
            product_price : { $gte : priceMin, $lte : priceMax }
        })
        .select("product_name product_price")
        .sort({product_price : price})
        .skip(skip)
        .limit(5); 
        
        res.status(200).json({offersList})
    } catch (error) {
        res.status(400).json({message : error.message});
    }
});

router.get('/offer/:id', async (req, res) => {
    try {
        const OfferDetails = await Offer.findById(req.params.id).populate("owner");//.select("product_details");
        res.status(200).json({OfferDetails});
    } catch (error) {
       res.status(400).json({message : error.message}); 
    }
});

module.exports = router;