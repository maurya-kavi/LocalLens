const { v2: cloudinary } = require('cloudinary');
const { cloudinary: config } = require('../config/env');

if (config.cloudName && config.apiKey && config.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret
  });
}

function uploadImage(file) {
  if (!file) return Promise.resolve(null);
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    const error = new Error('Image storage is not configured');
    error.statusCode = 503;
    return Promise.reject(error);
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'locallens/products', resource_type: 'image' }, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
    stream.end(file.buffer);
  });
}

function deleteImage(publicId) {
  if (!publicId || !config.cloudName) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

module.exports = { uploadImage, deleteImage };
