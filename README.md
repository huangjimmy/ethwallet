# Single Page Application based on Vue 2.0 and electron

## Build Setup


# install dependencies
``` bash
yarn install
```
# serve with hot reload at localhost:8080
``` bash
yarn dev
```
# launch electron with dev mode
``` bash
yarn start
```
# package
``` bash
yarn build && yarn predeploy &&  electron-packager . CPSWallet --asar=true --all --overwrite --out=./outapp/ --no-prune

```
