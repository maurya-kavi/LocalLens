function errorHandler(error, request, response, next) {
  const statusCode = error.statusCode || (error.name === 'MulterError' || error.message === 'Only image files are allowed' ? 400 : 500);
  const message = statusCode === 500 ? 'An unexpected server error occurred' : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = errorHandler;
