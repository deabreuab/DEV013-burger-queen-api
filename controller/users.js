const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const { getDataBase } = require('../connect');

module.exports = {
  createAdminUser: async (adminUser) => {
    try {
      const collection = getDataBase().collection('users');
      const { email, role } = adminUser;
      const filter = { email, role };
      const findResults = await collection.find(filter).toArray();
      if (!findResults.length) {
        const creatingAdminUser = await collection.insertOne(adminUser);
        console.log(creatingAdminUser);
      }
    } catch (error) {
      console.log(error);
    }
  },

  getUsers: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'El usuario no tiene permisos para consultar la información' });
      }
      const collection = getDataBase().collection('users');
      const options = { projection: { password: 0 } };
      const { _limit, _page } = req.query;
      const limit = parseInt(_limit) || 10;
      const page = parseInt(_page) || 1;
      const offset = (page - 1) * limit;
      const findResults = await collection.find({}, options).skip(offset).limit(limit).toArray();
      res.json(findResults);
    } catch (error) {
      res.status(500).json({
        message: 'Algo salió mal',
      });
    }
  },

  createUser: async (req, res) => {
    try {
      const collection = getDataBase().collection('users');
      const { email, role } = req.body;
      let password = req.body.password;
      if (!email || !req.body.password) {
        return res.status(400).json({
          error: 'No se ha ingresado un email o contraseña válido',
        });
      }
      const validationRegex = /^[\w.-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/;
      if (!validationRegex.test(email)) {
        return res.status(400).json({ error: 'El email ingresado no es válido' });
      }
      // Verificar que la contraseña no sea vacia y sea >= 4
      if (password.trim().length < 4) {
        return res.status(400).json({ error: 'La contraseña ingresada no es válida' });
      }
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      password = hashedPassword;
      const emailExist = await collection.findOne({ email });
      if (emailExist) {
        return res.status(403).json({
          error: 'El email ya esta en uso',
        });
      }
      const creatingUser = await collection.insertOne({
        email,
        password,
        role,
      });
      const { insertedId } = creatingUser;
      res.json({
        _id: insertedId,
        email,
        role,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Algo salió mal',
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      const collection = getDataBase().collection('users');
      const { uid } = req.params;
      const options = { projection: { password: 0 } };
      const filter = createFilter(uid);
      if (!filter) {
        return res.status(400).json({ error: 'Identificador inválido' });
      }
      const user = await collection.findOne(filter, options);
      if (!validateOwnerOrAdmin(req, uid)) {
        return res.status(403).json({ error: 'El usuario no tiene permisos para ver esta información' });
      }
      if (user === null) {
        return res.status(404).json({ error: 'El usuario no existe' });
      }
      const { _id, email, role } = user;
      return res.json({
        id: _id,
        email,
        role,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Algo salió mal',
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const collection = getDataBase().collection('users');
      const { uid } = req.params;
      const options = { projection: { password: 0 } };
      const filter = createFilter(uid);
      if (!filter) {
        return res.status(400).json({ error: 'Identificador inválido' });
      }
      const user = await collection.findOne(filter, options);
      if (!validateOwnerOrAdmin(req, uid)) {
        return res.status(403).json({ error: 'El usuario no tiene permisos para ver esta información' });
      }
      if (user === null) {
        return res.status(404).json({ error: 'El usuario no existe' });
      }
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'No se ha enviado ninguna información para modificar' });
      }
      const { password } = req.body;
      if (password) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        req.body.password = hashedPassword;
      }
      const updatingUser = {
        $set: req.body,
      };
      if (req.body.role && req.body.role !== user.role) {
        if (req.user.role !== 'admin') {
          return res.status(403).json({ error: 'El usuario no tiene permisos para cambiar su rol' });
        }
      }
      const updatedUser = await collection.updateOne(filter, updatingUser);
      if (updatedUser.modifiedCount === 0) {
        return res.status(400).json({ error: 'No se realizó ningún cambio' });
      }
      const finalUserResult = await collection.findOne(filter, options);
      res.json(finalUserResult);
    } catch (error) {
      res.status(500).json({
        message: 'Algo salió mal',
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const collection = getDataBase().collection('users');
      const { uid } = req.params;
      const options = { projection: { password: 0 } };
      const filter = createFilter(uid);
      if (!filter) {
        return res.status(400).json({ error: 'Identificador inválido' });
      }
      const user = await collection.findOne(filter, options);
      if (!validateOwnerOrAdmin(req, uid)) {
        return res.status(403).json({ error: 'El usuario no tiene permisos para ver esta información' });
      }
      if (user === null) {
        return res.status(404).json({
          error: 'El usuario que intentas eliminar no existe',
        });
      }
      const deleteResult = await collection.deleteOne(user);
      console.log(deleteResult);
      res.json(user);
    } catch (error) {
      res.status(500).json({
        message: 'Algo salió mal',
      });
    }
  },
};

const validateOwnerOrAdmin = (req, uid) => {
  if (req.user.role !== 'admin') {
    if (uid !== req.user.uid && uid !== req.user.email) {
      return false;
    }
  }
  return true;
};

const createFilter = (uid) => {
  let filter = null;
  const validationRegex = /^[\w.-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/;
  if (validationRegex.test(uid)) {
    filter = { email: uid };
  } else {
    if (uid.length >= 24) {
      filter = new ObjectId(uid);
    }
  }
  return filter;
};
