FROM node:18 as base
# Create app directory
WORKDIR /server

COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Build Stage
FROM base as build
WORKDIR /server

# Bundle app source
COPY . .
# Build the app
RUN npm run tsc


# Final Stage
FROM node:18-alpine

WORKDIR /server

COPY package*.json ./

RUN npm i -g npm@10.2.3

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm ci --omit=dev

COPY --from=build /server/dist ./dist
RUN ls dist
RUN chown -R node:node /server

USER node

# Expose the port the app runs on
EXPOSE 5000
