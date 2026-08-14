FROM node:20.19.4-alpine

WORKDIR /app
COPY package.json verify.mjs canary-state.json ./

USER node
CMD ["npm", "test"]
