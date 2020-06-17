FROM node:7

WORKDIR /opt/app

COPY package.json .

RUN npm install

COPY . .

CMD node index.js

EXPOSE 4000