#
# BUILD CLIENT
#
FROM node:22-alpine AS client-build

WORKDIR /app

COPY client/package*.json ./

RUN npm install

COPY client/ .

RUN npm run build

#
# NGINX
#
FROM nginx:alpine

COPY nginx/nginx.conf /etc/nginx/nginx.conf

COPY --from=client-build /app/dist /usr/share/nginx/html