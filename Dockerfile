FROM node:18

COPY package*.json /robot-web-interface/
COPY server /robot-web-interface/
COPY dist /robot-web-interface/

WORKDIR /robot-web-interface/server
RUN npm ci

EXPOSE 80
EXPOSE 443
CMD ["npm", "run", "start"]
