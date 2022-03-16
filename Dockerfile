FROM node:14-alpine3.15 AS frontend-build

WORKDIR /build
COPY ./client/package.json /build/
COPY ./client/yarn.lock /build/
RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python2 && \
  yarn install --frozen-lockfile && \
  apk del native-deps

COPY .git/ /build/.git/
RUN apk --no-cache add git

COPY ./client /build/
RUN ./node_modules/.bin/cross-env GITHUB_SHA=$(git rev-parse --short HEAD) \
  GITHUB_REPOSITORY=$(git config --get remote.origin.url | sed -e 's/^git@.*:\([[:graph:]]*\).git/\1/') \
  yarn build

RUN rm -rf /build/.git

FROM node:14-bullseye

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN apt update
RUN apt install -y python3 python3-pip bash curl zip

RUN apt install -y g++ && yarn install --production

RUN pip3 install \
  tensorflow==2.8 \
  matplotlib==3.4.3 \
  imagesize

RUN pip3 install numpy==1.22.2
# tensorflow comes with this dependency but then conflicts with it since there are two keras: keras and tf.keras
# RUN pip3 uninstall keras

COPY . .

# remove client dir as we copy the dist file from the build stage
RUN rm -rf /app/client/
COPY --from=frontend-build /build/dist/ /app/public/

RUN adduser --disabled-password svtrain
RUN chown -R svtrain: .
USER svtrain

# Use VOLUME for directories only.
VOLUME [ "/data" ]
# Do not use `VOLUME` for files, but instead
# initialize them with sane values here
RUN touch /app/.env
RUN echo '{}' > /app/roles.json
RUN echo '{}' > /app/sessions.json
RUN echo '{}' > /app/users.json
RUN echo '{}' > /app/statistic.data

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

ENTRYPOINT [ "yarn", "start" ]
