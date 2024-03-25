const { connect, getDataBase } = require('.././connect')
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../controller/products')
const {
  requireAuth,
  requireAdmin,
} = require('../middleware/auth');

module.exports = (app, nextMain) => {
  app.get('/products', requireAuth, getProducts);

  app.get('/products/:productId', requireAuth, getProductById);

  app.post('/products', requireAdmin, createProduct);

  app.put('/products/:productId', requireAdmin, updateProduct);

  app.delete('/products/:productId', requireAdmin, deleteProduct);

  nextMain();
};
