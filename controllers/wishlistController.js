const Users = require("../models/userModel");
const Products = require("../models/productModel");


const getWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login');
    }

    const user = await Users.findById(userId).populate('wishList.productId');

    const wishlist = user.wishList;
     
    if (!user || !user.wishList) {
      return res.status(200).render("wishlist", { wishlist:[], message: "Your wishlist is empty" });
    }

    res.status(200).render("wishlist", {
      wishlist,
      message: null,
    });
  } catch (error) {
    console.error("Error fetching cart details:", error);
    res.status(500).send("Internal Server Error");
  }
};


const addToWishlist = async (req, res) => {
  try {
    const productId = req.params._id;
    const userId = req.session.userId;

    const user = await Users.findOne({ _id: userId }).populate('wishList.productId');
    if (!user) {
      return res.redirect('/login'); 
    }

  
    const existingItem = user.wishList.find(item => item.productId && item.productId._id.toString() === productId);


    if (existingItem) {
      return res.redirect(`/user/wishlist?message=${encodeURIComponent('This item is already in the wishlist')}`);
    }


      user.wishList.push({ productId});
  

   
    await user.save();
    
   res.status(200).redirect('/user/wishlist')
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while adding to the cart.');
  }
};


const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.userId;
console.log(productId)
console.log(userId)
      if (!productId || !userId) {
      return res.status(400).send('Invalid request. Missing product or user ID.');
    }

    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.redirect('/login');
    }

    user.wishList = user.wishList.filter(item => item.productId.toString() !== productId);
    await user.save();

    res.redirect('/user/wishlist');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while removing the item.');
  }
};



module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
}