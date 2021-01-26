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

There is 2 ways you can obtain docker image:
### Building image on your own

```
docker build -t svtrain .
```

### Pulling already built image

The CI is building docker images with each push for master branch and for each pull request.

The images are stored in GitHub Docker registry. To pull it you first need to find the right tag.

Each pushed image is tagged with it's git commit short hash in a form `sha-<short-hash>` e.g. `sha-bb2b6e93`.

Each pull request image is additionally tagged with `pr-<pull request id>`, e.g. for pull request #10 it will be `pr-10`.
Each push to `master` is additionally tagged with `edge` tag.

List of all available images (tags) can be found under: https://github.com/com2u?repo_name=SVTrain&tab=packages.

*Be carefull when using `edge`, if you already have that pulled on your computer, docker will not pull newer version, so it's recommended to use `sha-<hash>` image versions instead.*

When you already obtain information about which tag do you want to run use, prepare your local configuration:
1. Copy `.env.example` to `.env` and adapt accordingly, esp. `ROOT_PATH` and `COMMAND_FILES_PATH`. It is recommended to use `/data/root` and `/data`, respectiveley. Make sure to change the docker run commend below, in case you use different values.
2. Copy `roles.json.example` to `roles.json`. Adapt if needed.
3. Generate a `user.json` file by running `node setPassword`
4. Prepare and empty data dir by running `mkdir -p ./data/root/`

Now you can run the docker image as follows:

```
docker run \
    -p 3333:3333 \
    -v "$(pwd)/data:/data" \
    -v "$(pwd)/.env:/app/.env" \
    -v "$(pwd)/roles.json:/app/roles.json" \
    -v "$(pwd)/users.json:/app/users.json" \
    -it --rm ghcr.io/com2u/svtrain:<version-tag>
```

This command will automatically pull and run the specified image.

In case you just want to pull the image (without running it) you can use
```
docker pull ghcr.io/com2u/svtrain:<version-tag>
```
