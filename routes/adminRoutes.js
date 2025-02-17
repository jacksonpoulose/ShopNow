const express = require('express');
//const path = require('path');
const {getAdminDashboard,
  getUsersList,
  getUsersCards,
  getProductsList,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  deleteProduct,
  getCategoryList,
  addCategory,
  getEditCategory,
  postEditCategory,
  deleteCategory,
  handleUser,
  getOrdersList,
  getOrderDetailsPage,
  updateOrderStatus,
  getReviewPage,
  getCouponPage,
  getAddCouponPage,
  createCoupon,
  logoutController
}= require('../controllers/adminController.js');

const {
  getSalesReport,
  postSalesReport
} = require("../controllers/reportsCcontroller.js")
const {storage,upload} = require('../helpers/productHelper.js')
const router = express.Router();

router.get('',getAdminDashboard);
router.get('/users-list', getUsersList);
router.get('/users-cards', getUsersCards);
router.get('/products-list',getProductsList);
router.get('/addproduct',getAddProduct);
router.post('/addproduct', upload.array('images', 5),postAddProduct);
router.get('/product/edit/:_id', getEditProduct);
router.post('/product/edit/:_id', upload.array('newImages', 10), postEditProduct);
router.patch('/delete-endpoint', deleteProduct);
router.get('/categories-list', getCategoryList);
router.post('/category/new',addCategory);
router.get('/category/edit/:_id', getEditCategory);
router.post('/category/edit/:_id', postEditCategory);
router.post('/category/delete/:_id', deleteCategory)
router.post('/blockuser/:_id', handleUser);
router.post('/unblockuser/:_id', handleUser);  
router.get('/orders',getOrdersList);
router.get('/reviews',getReviewPage)
router.get('/coupons',getCouponPage)
router.get('/addcoupon',getAddCouponPage)
router.post('/addcoupon',createCoupon)
router.get('/logout',logoutController);
router.get('/sales-report',getSalesReport)
router.post('/sales-report',postSalesReport)
router.get('/order/:_id',getOrderDetailsPage)
router.post('/update-order-status',updateOrderStatus)

module.exports = router;