import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Envíos",
            version: "1.0.0",
            description: "Documentación de la API de envíos con Swagger",
        },
    },
    apis: ["./src/routes/*.ts"], 
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Application) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("📄 Documentación Swagger disponible en: http://localhost:3000/api-docs");
}
