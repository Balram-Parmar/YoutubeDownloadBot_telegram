FROM node:16

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y ffmpeg
RUN npm install

COPY . .

CMD ["node", "telegram.js"]