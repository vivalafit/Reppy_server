const express = require('express');
const router = express.Router();
router.use('/auth', require('./auth/auth.controller'));
router.use('/posts', require('./posts/post.controller'));
router.use('/categories', require('./category/category.controller'));
router.use('/location', require('./location/location.controller'));
router.use('/faq', require('./faq/faq.controller'));
router.use('/test', require('./test'));
module.exports = router;