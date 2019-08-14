FROM node:8

ADD . /app
WORKDIR /app

RUN npm install

ENV NODE_ENV production
ENV HTTP_PORT 5000
ENV UPDATE_INTERVAL 1

EXPOSE 5000

CMD ["node","Server/server.js"]
