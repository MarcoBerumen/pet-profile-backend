FROM node:latest AS build

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:latest

WORKDIR /app

COPY --from=build /src/package*.json ./

RUN npm install --only=prod

COPY --from=build /src/build ./build

EXPOSE 4000

ENV NODE_ENV=production

CMD [ "node", "./build/app.js"]