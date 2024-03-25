const { MongoClient } = require('mongodb');
const config = require('./config');
// eslint-disable-next-line no-unused-vars
const { dbUrl } = config;
const client = new MongoClient(dbUrl);

async function connect() {
  // TODO: Database Connection
  try {
    await client.connect();
    console.log('conectado correctamente')
  } catch (error) {
    console.log('Hubo un error', error);
  }
}
const getDataBase = () => {
  const db = client.db('BurguerQueen');
  return db;
};

module.exports = { connect, getDataBase };
