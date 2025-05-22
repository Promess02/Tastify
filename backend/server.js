const express = require('express');
const cors = require('cors');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerConfig');
const apiHandler = require('./APIHandler');

app.use(cors());
app.use(express.json());

app.use(apiHandler);

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
    console.log('Swagger docs available at http://localhost:4000/api-docs');
});