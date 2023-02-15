FROM node:14-alpine3.15 AS builder-base

ARG GITHUB_SHA
ENV GITHUB_SHA ${GITHUB_SHA}
ARG GITHUB_REPOSITORY
ENV GITHUB_REPOSITORY ${GITHUB_REPOSITORY}

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
COPY ./api/ /app/api/
WORKDIR /app/api
RUN yarn install --frozen-lockfile

# fetch ui and install dependencies
COPY ./ui/ /app/ui/
WORKDIR /app/ui
RUN yarn install --frozen-lockfile
ENV PATH="/app/ui/node_modules/.bin:${PATH}"
SHELL ["/bin/bash", "-c"]
RUN echo $(set) > ./env_vars.txt
RUN cat ./env_vars.txt
RUN yarn build

FROM node:14-bullseye as prod-image

WORKDIR /app
COPY --from=prod-builder /app/ui/env_vars.txt ./
COPY --from=prod-builder /app/api/ ./
# we need to copy only package.json and yarn.lock file and rebuilt. if we don't we run into musl errors (linking of C libs as difference between prodimage and builder image
#COPY --from=prod-builder /app/api/ ./
COPY --from=prod-builder /app/api/package.json ./
COPY --from=prod-builder /app/api/yarn.lock ./
COPY --from=prod-builder /app/ui/dist/ ./public/

# TODO: taking over legacy dependencies from old Dockerfile, to be refactored, see details in SWT-678
RUN apt update
RUN apt install -y python3 python3-pip bash curl zip jq
RUN apt install -y g++

# We need to rebuild node modules. if we don't we run into musl errors (linking of C libs as difference between prodimage and builder image
# we need to build node modules for api once again, the node modules from builder image cannot be used see comment above -> musl error
RUN rm -rf ./node_modules
RUN yarn install --production

RUN pip3 install \
  tensorflow==2.8 \
  matplotlib==3.4.3 \
  imagesize
RUN pip3 install numpy==1.22.2
# end legacy dependencies

RUN adduser --disabled-password svtrain
RUN chown -R svtrain: .
USER svtrain

# Use VOLUME for directories only.
VOLUME [ "/data" ]
# Do not use `VOLUME` for files, but instead
# initialize them with sane values here
RUN echo '{}' > /app/roles.json
RUN echo '{}' > /app/sessions.json
RUN echo '{}' > /app/users.json
RUN echo '{}' > /app/statistic.data

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

WORKDIR /app

EXPOSE 3333
ENTRYPOINT ["yarn", "start"]
