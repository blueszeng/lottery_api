import swaggerUi from 'swagger-ui-koa'
import swaggerJSDoc from 'swagger-jsdoc'
import convert from 'koa-convert'
import mount from 'koa-mount'
//import swaggerDocument from './swagger.json' //also can be used

export default function(app) {
    //without jsdoc from swagger.json
    //app.use(swaggerUi.serve) //serve swagger static files
    //app.use(convert(mount('/swagger', swaggerUi.setup(swaggerDocument)))) //mount endpoint for access
    //with jsdoc
    const options = {
            swaggerDefinition: {
                // openapi: '3.0.1',
                info: {
                    title: 'API', // Title (required)
                    version: '2.0.0', // Version (required)
                },
                securityDefinitions: {
                    jwt: {
                        type: 'apiKey',
                        name: 'Authorization',
                        in: 'header'
                    }
                },
                security: [
                    { jwt: [] }
                ]
            },
            apis: [
                './src/routes/*.js', // Path to the API docs from root
            ],
        }
        // Initialize swagger-jsdoc -> returns validated swagger spec in json format
    const swaggerSpec = swaggerJSDoc(options)
    app.use(swaggerUi.serve) //serve swagger static files
    app.use(convert(mount('/swagger', swaggerUi.setup(swaggerSpec)))) //mount endpoint for access
}