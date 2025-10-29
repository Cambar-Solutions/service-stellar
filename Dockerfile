# Etapa 1: construcción de la aplicación
FROM node:22 AS builder
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Verificar que el build se completó correctamente
RUN ls -la dist && test -f dist/src/main.js

# Etapa 2: imagen de producción
FROM node:22-slim
WORKDIR /app

# Copiar archivos compilados y dependencias
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Exponer puerto
EXPOSE 4008

# Ejecutar aplicación
CMD ["node", "dist/src/main.js"]
