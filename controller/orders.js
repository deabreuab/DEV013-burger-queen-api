const { ObjectId } = require('mongodb');
const { getDataBase } = require('../connect');

const createOrder = async (req, res) => {
  try {
    const collection = getDataBase().collection('orders');
    const orderInfo = req.body;
    if (!req.body.userId) {
      return res.status(400).json({ error: 'El id del usuario no es válido' });
    }
    if (req.body.products.length === 0) {
      return res.status(403).json({ error: 'No se ha introducido ningún producto en la orden' });
    }
    const dbResult = await collection.insertOne(orderInfo);
    console.log(dbResult);
    res.json(req.body);
  } catch (error) {
    res.status(500).json({
      message: 'Algo salió mal',
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const collection = getDataBase().collection('orders');
    const { _limit, _page } = req.query;
    const limit = parseInt(_limit) || 10;
    const page = parseInt(_page) || 1;
    const offset = (page - 1) * limit;
    const orders = await collection.find({}).skip(offset).limit(limit).toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Algo salió mal',
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (orderId.length < 24) {
      return res.status(404).send('El id de la orden es invalido, debe ser una cadena de texto de 24 caracteres');
    }
    const collection = getDataBase().collection('orders');
    const filter = new ObjectId(orderId);
    const order = await collection.findOne(filter);
    if (!order) {
      return res.status(404).json({
        error: 'La orden no existe en la base de datos',
      });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: 'Algo salió mal',
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const collection = getDataBase().collection('orders');
    const { orderId } = req.params;
    if (orderId.length < 24) {
      return res.status(404).send('El id de la orden es invalido, debe ser una cadena de texto de 24 caracteres');
    }
    const filter = { _id: new ObjectId(orderId) };
    const { status } = req.body;
    if (!status || !['pending', 'delivered', 'delivering', 'preparing'].includes(status)) {
      return res.status(400).json({ error: 'El estatus de la orden no es válido' });
    }
    const updatingOrder = {
      $set: req.body,
    };
    const updatedOrder = await collection.updateOne(filter, updatingOrder);
    if (updatedOrder.matchedCount === 0) {
      return res.status(404).json({
        error: 'La orden no existe en la base de datos',
      });
    }
    if (updatedOrder.modifiedCount === 0) {
      return res.status(400).json({
        error: 'No se realizó ningún cambio en la orden',
      });
    }
    const order = await collection.findOne(filter);
    if (!order) {
      return res.status(404).json({ error: 'La orden no existe en la base de datos' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: 'Algo salió mal',
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const collection = getDataBase().collection('orders');
    const { orderId } = req.params;
    if (orderId.length < 24) {
      return res.status(404).send('El id de la orden es invalido, debe ser una cadena de texto de 24 caracteres');
    }
    const filter = { _id: new ObjectId(orderId) };
    const order = await collection.findOne(filter);
    if (order === null) {
      return res.status(404).json({
        error: 'La orden que intentas eliminar no existe',
      });
    }
    const deleteResult = await collection.deleteOne(order);
    console.log(deleteResult);
    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: 'Algo salió mal',
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
