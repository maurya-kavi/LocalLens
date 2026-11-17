const cors = require('cors');
const express = require('express');
const { clientUrl, port } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use('/api', apiRoutes);
app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: 'Route not found'
  });
});
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`LocalLens API listening on http://localhost:${port}`);
  });
}

module.exports = app;
