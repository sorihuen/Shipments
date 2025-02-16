import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: process.env.SWAGGER_TITLE || "API de Envíos",
            version: process.env.SWAGGER_VERSION || "1.0.0",
            description: process.env.SWAGGER_DESCRIPTION || "Documentación de la API de envíos con Swagger",
            contact: {
                name: "Suyin Orihuen",
                email: process.env.CONTACT_EMAIL || "sorihuen@gmail.com.",
            },
        },
        servers: [
            {
                url: process.env.SWAGGER_SERVER_URL || "http://localhost:3000",
                description: "Servidor de desarrollo",
            },
            // Puedes agregar más servidores, como producción, staging, etc.
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Ingresa el token JWT con el formato: Bearer {token}",
                },
            },
        },
        tags: [
            {
                name: "Autenticación",
                description: "Operaciones de autenticación y gestión de usuarios",
            },
            // Los tags específicos como Routes y Orders ya los has agregado en los archivos de rutas
        ],
    },
    apis: [
        "./src/routes/*.ts",
        "./src/models/*.ts",  // Si tienes modelos con esquemas que quieres documentar
        "./src/docs/*.yaml",  // Si quieres agregar documentación adicional en archivos YAML
    ],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Application) {
    // Configuración de opciones para la UI de Swagger
    const swaggerUIOptions: swaggerUi.SwaggerUiOptions = {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }', // Opcional: oculta la barra superior
        customSiteTitle: process.env.SWAGGER_TITLE || "API de Envíos - Documentación",
        customfavIcon: "/assets/favicon.ico", // Si tienes un favicon personalizado
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            filter: true,
            tagsSorter: 'alpha'
        }
    };
    
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUIOptions));
    
    // Endpoint para obtener el spec en formato JSON
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    
    console.log(`📄 Documentación Swagger disponible en: ${process.env.SWAGGER_SERVER_URL || "http://localhost:3000"}/api-docs`);
}