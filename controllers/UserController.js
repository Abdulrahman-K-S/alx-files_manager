import dbClient from '../utils/db';
import sha1 from 'sha1';

class UserController {
    static async postNew(req, res) {
        const { email, password } = req.body;

        if (!email) return res.status(400).send({ error: 'Missing email' });
        if (!password) return res.status(400).send({ error: 'Missing password' });

        const emailExists = await dbClient.usercollection.findone({ email });
        if (!emailExists) return res.status(400).send({ error: 'Already exist' });

        const hashedPassword = sha1(password);
        const newUser = {
            email: email,
            password: hashedPassword
        };

        try {
            const result = await dbClient.usercollection.insertOne(newUser);
            return res.status(201).send({ id: result.insertedId, email });
        } catch(error) {
            return res.status(500).send({ error: 'Error creating user' });
        }
    }
}

module.exports = UserController;
