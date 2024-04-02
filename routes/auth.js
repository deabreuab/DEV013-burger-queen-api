const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getDataBase } = require('../connect');
const config = require('../config');

const { secret } = config;

module.exports = (app, nextMain) => {
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email o contraseña no ingresados, por favor verifique de nuevo los campos obligatorios',
      });
    }
    const collection = getDataBase().collection('users');
    const userInfoDb = await collection.findOne({ email });
    if (userInfoDb == null) {
      return res.status(404).json({
        error: 'El email es invalido, por favor intente de nuevo con información válida',
      });
    }
    const { _id, role } = userInfoDb;
    if (await bcrypt.compare(password, userInfoDb.password)) {
      const accessToken = jwt.sign({ uid: _id, role, email }, secret);
      return res.json({
        accessToken,
        user: {
          id: _id,
          email,
          role,
        },
      });
    } else {
      return res.status(404).json({
        error: 'contraseña incorrecta, por favor intentelo de nuevo',
      });
    }
  });

  return nextMain();
};
