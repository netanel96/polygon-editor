FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN mkdir -p /app/logs

EXPOSE 4000

CMD ["npm", "start"]
