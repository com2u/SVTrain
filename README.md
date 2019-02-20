# How to start and configure server

## Set up environment variables

1. Copy file .env.example to .env
2. Set up variable HOST, PORT for file-explorer server
3. Set up variable STATIC_SERVER_PORT, STATIC_SERVER_HOST for the static server that serve files from directories with exploring files (That server will be process files from ROOT_PATH directory)
4. Set up variable ROOT_PATH. It is path to directory with exploring files.
5. Set up variable COMMAND_FILES_PATH, set it with directory which consists files train.bat, validate.bat etc.

## Install npm packages

Execute `npm install` command

## Start up the application

Execute `npm start` command.

## Open file explorer

Create new browser window and type http://HOST:PORT/index.html