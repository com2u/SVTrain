FROM node:14-alpine3.15 AS builder-base

ONBUILD RUN apk update

# install dependencies required for api
ONBUILD RUN apk --no-cache add make gcc g++ python2 bash curl zip
# TODO: tensorflow/python3 dependencies check later
ONBUILD RUN apk --no-cache add python3

# install dependencies required for ui
ONBUILD RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python2

ONBUILD ADD ./api/package.json /app/api/
ONBUILD ADD ./api/yarn.lock /app/api/
ONBUILD ADD ./ui/package.json /app/ui/
ONBUILD ADD ./ui/yarn.lock /app/ui/

# provide env file to adonisjs to prevent exception
ONBUILD RUN touch /app/api/.env

FROM builder-base AS dev-builder

# fetch api and install dependencies
WORKDIR /app/api
RUN yarn install --frozen-lockfile

# fetch ui and install dependencies
WORKDIR /app/ui
RUN yarn install --frozen-lockfile

FROM builder-base as prod-builder

# fetch api and install dependencies
WORKDIR /app/api
RUN yarn install --frozen-lockfile --production
RUN node ace build --production

# fetch ui and install dependencies
WORKDIR /app/ui
RUN yarn install --frozen-lockfile --production
RUN yarn build

FROM node:14-bullseye as prod-image

WORKDIR /app
COPY --from=prod-builder /app/api/build ./
COPY --from=prod-builder /app/ui/dist ./public

RUN adduser --disabled-password svtrain
RUN chown -R svtrain: .
USER svtrain

# Use VOLUME for directories only.
VOLUME [ "/data" ]
# Do not use `VOLUME` for files, but instead
# initialize them with sane values here
RUN echo '{}' > /app/api/roles.json
RUN echo '{}' > /app/api/sessions.json
RUN echo '{}' > /app/api/users.json
RUN echo '{}' > /app/api/statistic.data

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

WORKDIR /app

EXPOSE 3333
CMD ["yarn", "start"]
