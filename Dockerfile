FROM node:18


WORKDIR /robot-web-interface

COPY server ./server/
COPY dist ./dist/

WORKDIR /robot-web-interface/server
RUN npm ci

EXPOSE 80



EXPOSE 443
CMD ["node", "router.js"]
