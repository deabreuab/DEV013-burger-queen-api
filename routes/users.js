const bcrypt = require('bcrypt');

const {
  requireAuth,
  requireAdmin,
} = require('../middleware/auth');

const {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  createAdminUser,
} = require('../controller/users');

const initAdminUser = (app, next) => {
  const { adminEmail, adminPassword } = app.get('config');
  if (!adminEmail || !adminPassword) {
    return next();
  }

  const adminUser = {
    email: adminEmail,
    password: bcrypt.hashSync(adminPassword, 10),
    role: 'admin',
  };

  createAdminUser(adminUser);

  next();
};

module.exports = (app, next) => {
  app.get('/users', requireAdmin, getUsers);

  app.get('/users/:uid', requireAuth, getUserById);

  app.post('/users', requireAdmin, createUser);

  app.put('/users/:uid', requireAuth, updateUser);

  app.delete('/users/:uid', requireAuth, deleteUser);

  initAdminUser(app, next);
};
