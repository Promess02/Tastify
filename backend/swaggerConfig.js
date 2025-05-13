const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Tastify API',
            version: '1.0.0',
            description: 'API documentation for the Tastify application',
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Local server',
            },
        ],
    },
    apis: ['./APIHandler.js'], // Path to the API handler file
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;