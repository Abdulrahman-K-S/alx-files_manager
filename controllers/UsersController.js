const sha1 = require('sha1');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }

    const emailExists = await dbClient.usercollection.findOne({ email });
    if (emailExists) {
      return res.status(400).send({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = {
      email,
      password: hashedPassword,
    };

    try {
      const result = await dbClient.usercollection.insertOne(newUser);
      return res.status(201).send({ id: result.insertedId, email });
    } catch (error) {
      return res.status(500).send({ error: 'Error creating user' });
    }
  }
}

module.exports = UsersController;
