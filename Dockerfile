FROM node:18

WORKDIR /robot-web-interface

COPY package*.json ./
COPY server ./
COPY dist ./

WORKDIR /robot-web-interface/server
RUN npm ci

EXPOSE 80
EXPOSE 443
CMD ["node", "index.js"]
