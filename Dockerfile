FROM node:12-alpine AS frontend-build

WORKDIR /build
COPY ./client/package.json /build/
COPY ./client/yarn.lock /build/
RUN yarn install
COPY ./client /build/
RUN npm run build

FROM node:12-alpine

WORKDIR /app

RUN adduser -D svtrain
RUN chown svtrain: .

COPY package.json .
COPY yarn.lock .
RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python && \
  yarn install --production && \
  apk del native-deps

COPY . .

# remove client dir as we copy the dist file from the build stage
RUN rm -rf /app/client/
COPY --from=frontend-build /build/dist/ /app/public/

USER svtrain

# Use VOLUME for directories only.
VOLUME [ "/data" ]
# Do not use `VOLUME` for files, but instead
# initialize them with sane values here
RUN touch /app/.env
RUN echo '{}' > /app/roles.json
RUN echo '{}' > /app/sessions.json
RUN echo '{}' > /app/users.json

ENTRYPOINT [ "npm", "start" ]
