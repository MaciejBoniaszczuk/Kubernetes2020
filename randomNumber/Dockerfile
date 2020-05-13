FROM node:alpine

WORKDIR /opt/app

COPY package.json yarn.lock? ./

RUN yarn install

COPY . .

EXPOSE 4000

CMD ["yarn", "start"]