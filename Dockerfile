FROM node:12-alpine AS frontend-build

WORKDIR /build
COPY ./client/package.json /build/
COPY ./client/yarn.lock /build/
RUN yarn install
COPY ./client /build/
RUN npm run build

FROM node:12-alpine

COPY package.json /app/
COPY yarn.lock /app/
RUN cd /app/ && \
  apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python && \
  yarn install --production && \
  apk del native-deps

WORKDIR /app
COPY . .
RUN rm -rf /app/client/
COPY --from=frontend-build /build/dist/ /app/public/

VOLUME [ "/data", "/app/.env", "/app/roles.json", "/app/users.json", "/app/sessions.json" ]

RUN adduser -D svtrain
USER svtrain
ENTRYPOINT [ "npm", "start" ]
