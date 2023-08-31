FROM node:18

COPY package*.json /robot-web-interface
COPY server /robot-web-interface/server
COPY dist /robot-web-interface/dist

WORKDIR /robot-web-interface/server
RUN npm ci

EXPOSE 80
EXPOSE 443
CMD ["node", "index.js"]
