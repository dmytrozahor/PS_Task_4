# ---- Base image ----
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENV DD_TRACE_ENABLED=true

EXPOSE 3000

CMD ["node", "-r", "dd-trace/init", "dist/server.js"]
