const { MongoClient } = require('mongodb');
const process = require('process');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
  constructor() {
    this.client = null;
    this.connect();
  }

  async connect() {
    try {
      const client = await MongoClient.connect(url, {
        useNewUrlParser: true, useUnifiedTopology: true,
      });
      this.client = client.db(DB_DATABASE);
      this.usercollection = this.client.collection('users');
      this.filecollection = this.client.collection('files');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
    }
  }

  isAlive() {
    return this.client !== null;
  }

  async nbUsers() {
    if (!this.usercollection) return 0;
    return this.usercollection.countDocuments();
  }

  async nbFiles() {
    if (!this.filecollection) return 0;
    return this.filecollection.countDocuments();
  }

  async insertFile(file) {
    const result = await this.client.collection('files').insertOne(file);
    return result.ops[0];
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
