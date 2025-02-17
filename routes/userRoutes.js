const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const Users = require("../models/userModel");
const Products = require("../models/productModel");
const { validateAddress, handleValidationErrors } =require('../middlewares/userMiddlewares')

const {
  
  addToCart,
  logoutController,
  getDashboard,
  cartController,
  loadCheckoutPage,
  removeFromCart,
  getCouponPage,
  updateCartQuantity,
  applyCoupon
} = require("../controllers/userController");

const {
  addressController,
  updateBillingAddress,
  editAccountDetails,
  addShippingAddress,
  removeAddress,
} = require('../controllers/addressController')

const {
  createOrder,
  getOrderPage,
  viewOrderDetails,
  paypalPaymentController,
  paymentConfirmation,
  invoiceDownload
} = require("../controllers/ordercontrollers")

const{
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/wishlistController')

const router = express.Router();

router.get("/", getDashboard);

router.get("/wishlist", getWishlist);
router.post("/add-to-wishlist/:_id", addToWishlist);
router.post('/wishlist/remove/:id', removeFromWishlist);
router.post("/add-to-cart/:_id", addToCart);
router.get("/cart",cartController);
router.get('/checkout',loadCheckoutPage);
router.get("/address",addressController);
router.post('/address/add', handleValidationErrors,addShippingAddress);
router.get("/logout", logoutController);
router.get("/logout", logoutController);
router.post('/cart/remove/:id', removeFromCart);
router.post('/cart/update', updateCartQuantity);
router.post('/update-billing',updateBillingAddress);
router.post('/update-user',editAccountDetails);
router.get('/orders',getOrderPage);
router.get('/order/:_id',viewOrderDetails);
router.post('/create-order',createOrder);
router.post('/paypal',paypalPaymentController);
router.get('/paid',paymentConfirmation);
router.post('/removeAddress/:_id', removeAddress);
router.get('/coupon',getCouponPage);
router.post('/coupon/apply', applyCoupon)
router.get("/invoice/:_id",invoiceDownload)




module.exports = router;
