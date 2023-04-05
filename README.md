# How to start and configure server

## Setup local development workspace

1. Modify `development.env` that meets your requirements
2. By default, the application points to a keycloak instance of a test stage; not yet mocked 
3. Update variables in file `/config/ui.js` if you want to change default GUI variables file right menu's width, number of images for page, ...

### Environment variable explanations
| Variable           | default value                 | Description                                                            |
|--------------------|-------------------------------|------------------------------------------------------------------------|
| ENV_SILENT         | true                          | Keep default value, details see AdonisJS reference                     |
| HOST               | 0.0.0.0                       | Configures AdonisJS api backend, should be default                     |
| PORT               | 3333                          | Configures AdonisJS api backend, should be default                     |
| NODE_ENV           | development                   | Keep default value, production can be used for simulation purposes     |
| SESSION_DRIVER     | cookie                        | See AdonisJS for reference                                             |
| KEYCLOAK_URI_*     | see env file                  | Keycloak parameters point to test instance; should be mocked in future |
| STORAGE_PATH       | ./development/storages        | Contains backups                                                       |
| ROOT_PATH          | ./development/mlexplorer-root | Files in workspaces are processed there, e.g. labeling, training, etc. |
| COMMAND_FILES_PATH | ./development/script          | Location of scripts                                                    |
| STATIC_SERVER_PORT | 2929                          | Keep default value                                                     |
| STATIC_SERVER_HOST | 0.0.0.0                       | Keep default value                                                     |
| SCRIPT_*           | see env file                  | Location of script files                                               |
| PATH_LOG_*         | see env file                  | Location of respective log files                                       |
| OUT_*              | see env file                  | Configure location of training output                                  |
| FOLDER_*           | see env file                  | Subfolder configuration                                                |
| DB_CONNECTION      | sqlite                        | Until now keep default value, but sqlite not yet used                  |

## Start workspace with Docker

1. Make sure that your Docker environment is fully operational, e.g. install Docker Desktop
2. Start your local development environment: `docker-compose up -d`. This will provide you:
   1. A nginx that acts as a reverse proxy in order to serve backend and frontend dev environments at the same time
   2. Executes `node --inspect=0.0.0.0 server.js` of api component (backend part based on AdonisJS)
   3. Executes `yarn run serve --host 0.0.0.0` of ui component (frontend part of application based on VueJS)
   4. Both ui and api components are started with auto refresh with live code changes and debugging
   5. Node modules being created a locally mounted (means persisted between docker restarts), but be aware that node modules being built inside the docker are not compatible with your host OS which is no problem as these are separated
3. 
## Optional: Install npm packages

If you require node_modules to be in your local environment (e.g. your IDE requires it for code lookup), please execute `yarn install` command.
Be aware that we do utilize the lock file here, so running `yarn install --frozen-lockfile` will make sure that exactly the versions that have been selected and bundled are being installed. If you don't use frozen lockfiles, be aware that you will change `yarn.lock` as well which is fine, if you intend to upgrade versions. Otherwise please don't commit changes.

## Open file explorer

Create new browser window and type `http://localhost:3333`. That is the port nginx is listening on your local while reverse proxying to api and ui components.

## Logging

Check user activities in file "SVTrain.log"

## Docker

### Pulling already built image

The CI is building docker images with each push for master branch and for each pull request.

The images are stored in GitHub Docker registry. To pull it you first need to find the right tag.

Each pushed image is tagged with it's git commit short hash in a form `sha-<short-hash>` e.g. `sha-bb2b6e93`.

Each pull request image is additionally tagged with `pr-<pull request id>`, e.g. for pull request #10 it will be `pr-10`.
Each push to `master` is additionally tagged with `edge` tag.

List of all available images (tags) can be found under: https://github.com/com2u?repo_name=SVTrain&tab=packages.

*Be carefull when using `edge`, if you already have that pulled on your computer, docker will not pull newer version, so it's recommended to use `sha-<hash>` image versions instead.*

When you already obtain information about which tag do you want to run use, prepare your local configuration:
1. Adapt `development.env` accordingly, esp. `ROOT_PATH` and `COMMAND_FILES_PATH`. It is recommended to use `/data/root` and `/data`, respectiveley. Make sure to change the docker run commend below, in case you use different values.
2. Copy `api/roles.json.example` to `api/roles.json`. Adapt if needed.
3. Generate a `user.json` file by running `node setPassword` in directory `api`
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
