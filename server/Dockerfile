FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends git zip \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY .yarn ./.yarn
COPY .yarnrc.yml ./
COPY package.json yarn.lock ./
COPY docs/package.json ./docs/package.json
COPY packages/create-react-native-library ./packages/create-react-native-library
COPY server ./server

RUN yarn install --immutable

ENV PORT=8788

CMD ["node", "server/src/runner.ts"]
