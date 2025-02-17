
const Products = require('../models/productModel');
const Users = require('../models/userModel')

const loadCategoryPage = async (req, res) => { 
    try {
        const query = req.query?.category; 
        const currentCategory = req.query?.category || "all";
        
        let products;
        if (query) {
        
            products = await Products.find({ category: query });
        } else {
            
            products = await Products.find({isDeleted:false});
        }

        res.status(200).render('category', { products,currentCategory });
    } catch (error) {
        console.error("Error loading category page:", error);
        res.status(500).send("An error occurred while loading the page.");
    }
};


module.exports ={
    loadCategoryPage
}