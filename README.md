# How to start and configure server

## Set up environment variables

1. Copy file .env.example to .env
2. Set up variable HOST, PORT for file-explorer server
3. Set up variable STATIC_SERVER_PORT, STATIC_SERVER_HOST for the static server that serve files from directories with exploring files (That server will be process files from ROOT_PATH directory)
4. Set up variable ROOT_PATH. It is path to directory with exploring files.
5. Set up variable COMMAND_FILES_PATH, set it with directory which consists files train.bat, validate.bat etc.
6. Update variables in file `/config/ui.js` if you want to change default GUI variables file right menu's width, number of images for page, ...

## Install npm packages

Execute `npm install` command

## Start up the application

Execute `npm start` command.

## Open file explorer

Create new browser window and type http://HOST:PORT/index.html

## Logging

Check user activities in file "SVTrain.log"

## Docker

You can also use Docker to run the SVTrain application. To do so under Linux or macOS, use the following steps.

First, build the docker image:

```
docker build -t svtrain .
```

Now, prepare your local configuration:
1. Copy `.env.example` to `.env` and adapt accordingly, esp. `ROOT_PATH` and `COMMAND_FILES_PATH`. It is recommended to use `/data/root` and `/data`, respectiveley. Make sure to change the docker run commend below, in case you use different values.
2. Copy `roles.json.example` to `roles.json`. Adapt if needed.
3. Generate a `user.json` file by running `node setPassword`
4. Prepare and empty data dir by running `mkdir -p ./data/root/`

Now you can run the docker image as follows:

```
docker run \
    -p 2929:2929 \
    -p 3333:3333 \
    -v "$(pwd)/data:/data" \
    -v "$(pwd)/.env:/app/.env" \
    -v "$(pwd)/roles.json:/app/roles.json" \
    -v "$(pwd)/users.json:/app/users.json" \
    -it --rm svtrain
```
