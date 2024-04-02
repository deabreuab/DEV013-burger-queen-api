const { ObjectId } = require('mongodb');
const { getDataBase } = require('../connect');

const createProduct = async (req, res) => {
  try {
    const collection = getDataBase().collection('products');
    const infoProduct = req.body;
    if (!infoProduct.price || infoProduct.price <= 0) {
      return res.status(400).json({
        error: 'Información obligatoria incompleta, por favor verifique el precio del producto',
      });
    }
    if (!infoProduct.name || infoProduct.name.trim().length === 0) {
      return res.status(400).json({
        error: 'Información obligatoria incompleta, por favor verifique el nombre del producto',
      });
    }
    const dbResult = await collection.insertOne(infoProduct);
    console.log(dbResult);
    res.json(req.body);
  } catch (error) {
    res.status(500).json({
      message: 'Algo salió mal',
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const collection = getDataBase().collection('products');
    const products = await collection.find({}).toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: 'Algo salió mal',
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    if (productId.length < 24) {
      return res.status(404).send('productId invalido, debe ser una cadena de texto de 24 caracteres');
    }
    const collection = getDataBase().collection('products');
    const filter = { _id: new ObjectId(productId) };
    const product = await collection.findOne(filter);
    if (!product) {
      return res.status(404).json({
        error: 'El producto no existe',
      });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Algo salió mal',
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const collection = getDataBase().collection('products');
    const { productId } = req.params;
    if (productId.length < 24) {
      return res.status(404).send('productId invalido, debe ser una cadena de texto de 24 caracteres');
    }
    const filter = { _id: new ObjectId(productId) };
    const { price } = req.body;
    if (!parseFloat(price)) {
      return res.status(400).json({ error: 'Precio indicado no válido' });
    }
    const updatingProduct = {
      $set: req.body,
    };
    const updatedProduct = await collection.updateOne(filter, updatingProduct);
    if (updatedProduct.matchedCount === 0) {
      return res.status(404).json({
        error: 'El producto no existe en la base de datos',
      });
    }
    if (updatedProduct.modifiedCount === 0) {
      return res.status(400).json({
        error: 'No se realizó ningún cambio',
      });
    }
    const product = await collection.findOne(filter);
    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Algo salió mal',
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const collection = getDataBase().collection('products');
    const { productId } = req.params;
    if (productId.length < 24) {
      return res.status(404).send('productId invalido, debe ser una cadena de texto de 24 caracteres');
    }
    const filter = { _id: new ObjectId(productId) };
    const product = await collection.findOne(filter);
    if (product === null) {
      return res.status(404).json({
        error: 'El producto que intentas eliminar no existe',
      });
    }
    const deleteResult = await collection.deleteOne(product);
    console.log(deleteResult);
    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Algo salió mal',
    });
  }
};

module.exports = {
  createProduct, getProducts, getProductById, updateProduct, deleteProduct,
};
