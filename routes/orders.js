const { requireAuth } = require('../middleware/auth');

module.exports = (app, nextMain) => {
  app.get('/orders', requireAuth, async (req, res, next) => {
    const db = await mongoConnect;
    const collection = db.collection('orders');
    const findResult = await collection.find({}).toArray();
    resp.json(findResult);
    });

    // app.get('/orders/:orderId', requireAuth, (req, resp, next) => {
    // });

    // app.post('/orders', requireAuth, (req, resp, next) => {
    // });

    // app.put('/orders/:orderId', requireAuth, (req, resp, next) => {
    // });

    // app.delete('/orders/:orderId', requireAuth, (req, resp, next) => {
    // });

    nextMain();
};
