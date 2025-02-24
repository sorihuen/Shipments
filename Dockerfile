# Etapa 1: Construcción
FROM node:18-alpine AS builder
WORKDIR /app
# Instalar herramientas de compilación
RUN apk add --no-cache make gcc g++ python3
COPY package.json ./
COPY package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build
# Listar archivos en dist para depuración
RUN find /app/dist -type f

# Etapa 2: Imagen final
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
EXPOSE 3000
CMD ["npm", "start"]

