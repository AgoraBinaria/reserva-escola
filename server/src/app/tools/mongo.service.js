const MongoClient = require("mongodb").MongoClient;

const config = require("../tools/config");
const utils = require("./mongo.utils");

let sharedMongoConnection;

module.exports.getDb = async () =>
  sharedMongoConnection.db || this.connect().db;

module.exports.connect = async () => {
  console.log("...MONGODB conecting to" + config.MONGODB_URI);
  sharedMongoConnection = await MongoClient.connect(
    config.MONGODB_URI,
    { useNewUrlParser: true }
  );
  console.log("!!!MONGODB conected to" + config.MONGODB_URI);
  return sharedMongoConnection;
};

module.exports.getCollection = async col => {
  let db = await this.getDb();
  if (!db) {
    console.error("ERROR: NO MONGODB conected to" + config.MONGODB_URI);
  } else if (!db.collection) {
    console.error("ERROR: NO COLLECTION FUNCTION to" + config.MONGODB_URI);
    console.log("db", db);
    db = await this.connect();
  }
  return db.collection(col);
};

module.exports.find = async (col, query, sort = { _id: -1 }) => {
  const colDb = await this.getCollection(col);
  try {
    return await colDb
      .find(query)
      .sort(sort)
      .toArray();
  } catch (err) {
    return utils.getError(err);
  }
};

module.exports.count = async (col, query) => {
  const colDb = await this.getCollection(col);
  try {
    return await colDb.find(query).count();
  } catch (err) {
    return utils.getError(err);
  }
};

module.exports.findOneById = async (col, id) => {
  const query = utils.getQueryById(id);
  return this.findOne(col, query);
};

module.exports.findOne = async (col, query) => {
  const colDb = await this.getCollection(col);
  try {
    return await colDb.findOne(query);
  } catch (err) {
    return utils.getError(err);
  }
};

module.exports.insertOne = async (col, doc) => {
  const colDb = await this.getCollection(col);
  try {
    await colDb.insertOne(doc);
    return doc;
  } catch (err) {
    return utils.getError(err);
  }
};

module.exports.updateOne = async (col, id, doc) => {
  const colDb = await this.getCollection(col);
  const query = utils.getQueryById(id);
  const newDoc = utils.setDocId(doc, query._id);
  try {
    const data = await colDb.update(query, newDoc);
    return utils.getResult(data, newDoc);
  } catch (err) {
    return utils.getError(err);
  }
};

module.exports.updateQuery = async (col, id, query) => {
  const colDb = await this.getCollection(col);
  const filter = utils.getQueryById(id);
  try {
    const data = colDb.updateOne(filter, query);
    return utils.getResult(data);
  } catch (err) {
    return utils.getError(err);
  }
};

module.exports.removeOne = async (col, id) => {
  const colDb = await this.getCollection(col);
  const query = utils.getQueryById(id);
  try {
    const data = await colDb.remove(query);
    return utils.getResult(data, data);
  } catch (err) {
    return utils.getError(err);
  }
};
