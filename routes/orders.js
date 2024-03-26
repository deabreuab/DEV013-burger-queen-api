const { requireAuth } = require('../middleware/auth');

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require('../controller/orders');

module.exports = (app, nextMain) => {
  app.get('/orders', requireAuth, getOrders);

  app.get('/orders/:orderId', requireAuth, getOrderById);

  app.post('/orders', requireAuth, createOrder);

  app.put('/orders/:orderId', requireAuth, updateOrder);

  app.delete('/orders/:orderId', requireAuth, deleteOrder);

  nextMain();
};
