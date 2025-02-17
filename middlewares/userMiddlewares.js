const { body, validationResult } = require('express-validator');

const validateAddress = [
  body('name').notEmpty().withMessage('Name is required'),
  body('street').notEmpty().withMessage('Street is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('zip').isPostalCode('any').withMessage('Invalid zip code'),
];


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).redirect('/user/address/add', {
      errors: errors.array(),
      inputData: req.body,
    });
  }
  next(); 
};

module.exports = {
  validateAddress,
  handleValidationErrors,
};
