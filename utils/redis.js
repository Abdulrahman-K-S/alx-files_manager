const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = null;
    this.connect();
  }

  connect() {
    // Creates a client which listens on local host by default
    // with the port 6379
    this.client = redis.createClient();

    this.getAsync = promisify(this.client.get).bind(this.client);

    // Executes when there's an error in the conection
    this.client.on('error', (err) => {
      console.log(`Redis client not connected to the server: ${err.message}`);
    });
  }

  isAlive() {
    return this.clinet !== null;
  }

  async get(key) {
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  async del(key) {
    this.client.del(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
