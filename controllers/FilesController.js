const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const redisClient = require('../utils/redis'); // Assuming you have a Redis client set up in utils/redis.js
const dbClient = require('../utils/db'); // Assuming you have a DB client set up in utils/db.js

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const validTypes = ['folder', 'file', 'image'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    let parentFile = null;
    if (parentId !== 0) {
      parentFile = await dbClient.filecollection.findOne({
        _id: dbClient.client.ObjectId(parentId),
      });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath: null,
    };

    if (type !== 'folder') {
      const folderPath = path.resolve(FOLDER_PATH);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      const fileUUID = uuidv4();
      const localPath = path.join(folderPath, fileUUID);
      fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
      newFile.localPath = localPath;
    }

    const result = await dbClient.filecollection.insertOne(newFile);
    const insertedFile = result.ops[0];
    return res.status(201).json({
      id: insertedFile._id.toString(),
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath: newFile.localPath,
    });
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    const file = await dbClient.findFileById(fileId);

    if (!file || file.userId !== userId) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { parentId = 0, page = 0 } = req.query;
    const pageSize = 20;
    const files = await dbClient.findFilesByUserAndParentId(userId, parentId, page, pageSize);

    return res.status(200).json(files);
  }
}

module.exports = FilesController;
