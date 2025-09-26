FROM node:22.11.0

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
COPY ./packages/ /app/packages/

ENV YARN_VERSION=4.10.3
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

ENV NODE_OPTIONS="--max-old-space-size=8192"

RUN yarn install --immutable

RUN yarn run build

# Run the server when the container launches
CMD ["yarn", "run", "ui:preview"]
