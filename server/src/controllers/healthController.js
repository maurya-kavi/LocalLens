function getHealth(request, response) {
  response.status(200).json({
    success: true,
    message: 'LocalLens API is running'
  });
}

module.exports = { getHealth };
