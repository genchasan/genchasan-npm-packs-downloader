# NPM Package Downloader and Publisher

In this project, you can query the versions of a specific package and its dependencies, download them, and upload them to the Nexus npm registry.

## Development

You can follow the steps below for project development:

1. Clone the project:
    ```
    git clone https://github.com/genchasan/npm-packs-downloader.git
    ```

2. Install the project:
    ```
    cd yourproject
    npm install
    ```

## Usage

By adding the npm-packs-downloader package to your project, you can download the packages used in your project and upload them to a local Nexus npm registry.

### Adding Package

```
npm install --save-dev npm-packs-downloader
```

### Downloading and Installing Packages

The project can be used to query the versions of a specific package and its dependencies. You can use the following commands:

- To see all command parameters:
    ```
    npm-packs-download --help
    ```

- To get the list of packages and their dependencies:
    ```
    npm-packs-download list
    ```

- To download packages and their dependencies:
    ```
    npm-packs-download download
    ```

- To write the package list to a file:
    ```
    npm-packs-download write-to-file
    ```

- To download packages from the package-lock.json file:
    ```
    npm-packs-download lock-file
    ```

## Uploading to Nexus npm Registry

You can use the `publish-nexus` script to upload packages to the Nexus npm registry. This script uploads all npm `.tgz` files in the `./modules/` directory, which were previously downloaded with npm-packs-download, to the specified registry.

```
./publish-nexus.sh http://localhost:8081/repository/npm-hosted    <username> <password>
```
