import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config();

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: process.env.SWAGGER_TITLE || "API de Envíos",
            version: process.env.SWAGGER_VERSION || "1.0.0",
            description: process.env.SWAGGER_DESCRIPTION || "Documentación de la API de envíos con Swagger",
        },
        servers: [
            {
                url: process.env.SWAGGER_SERVER_URL || "http://localhost:3000",
                description: "Servidor de desarrollo",
            },
        ],
    },
    apis: ["./src/routes/*.ts"], 
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Application) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`📄 Documentación Swagger disponible en: ${process.env.SWAGGER_SERVER_URL || "http://localhost:3000"}/api-docs`);
}

