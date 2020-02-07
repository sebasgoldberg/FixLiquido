[![Build Status](https://travis-ci.org/SAP/openui5-basic-template-app.svg?branch=master)](https://travis-ci.org/SAP/openui5-basic-template-app)
![OpenUI5 logo](http://openui5.org/images/OpenUI5_new_big_side.png)

# openui5-basic-template-app (with ES6+ support)
OpenUI5 basic template app using the UI5 Build and Development Tooling. You can use it as a starting point to build custom OpenUI5 apps.

This is a fork [SAP/openui5-basic-template-app](https://github.com/SAP/openui5-basic-template-app.git) adding support to code using ES6+.

## More information
* [Live Demo](https://sap.github.io/openui5-basic-template-app)
* [Documentation](https://openui5.hana.ondemand.com/#/topic/7a4d93c0b0bb439b9d889ffc5b02eac9)
* [UI5 Tooling](https://github.com/SAP/ui5-tooling)
* [OpenUI5](https://github.com/SAP/openui5)

## Prerequisites
The **UI5 build and development tooling command line interface (UI5 CLI)** has to be installed.
For installation instructions please see [Installing the UI5 CLI](https://github.com/SAP/ui5-tooling#installing-the-ui5-cli).

## Setup
1. Clone the repository and navigate into it
    ```sh
    git clone https://github.com/sebasgoldberg/openui5-basic-template-app.git
    cd openui5-basic-template-app
    ```

1. Install grunt-cli
    ```sh
    npm i -g grunt-cli
    ```

1. Install all dependencies
    ```sh
    npm install
    ```

1. Run the transpiler (from ES6+ to JavaScript (ES5))
    ```sh
    grunt transp
    ```

1. Start a local server and run the application (http://localhost:8080/index.html)
    ```sh
    ui5 serve -o /index.html
    ```

## Workflow
1. To run the transpiler automatically while you are working, please leave running the following task:
    ```sh
    grunt watch
    ```

## Testing
* Run ESLint code validation
    ```sh
    npm run lint
    ```
* Start a local server and execute the tests automatically after every change
    ```sh
    npm run watch
    ```
* Run ESLint, start a local server and run the tests in CI mode
    ```sh
    npm test
    ```

For more build and development options please see: [UI5 Build and Development Tooling](https://github.com/SAP/ui5-tooling)

## Adding Support To Code Using ES6+ In An Existing Project

1. Install and save dependencies:
    ```sh
    npm i -g grunt-cli
    npm install --save-dev grunt
    npm install --save-dev grunt-babel @babel/core @babel/preset-env
    npm install --save-dev grunt-contrib-clean
    npm install --save-dev grunt-contrib-copy
    npm install --save-dev grunt-eslint
    npm install --save-dev grunt-contrib-watch
    npm install --save-dev grunt-exec
    npm install --save-dev babel-plugin-transform-es2015-modules-ui5
    npm install -S ui5-babel-polyfills
    ```
1. Copy the Gruntfile.js and .babelrc files to your project.
1. Add ui5.yaml resources section and shims section content to your project's ui5.yaml.
1. Add to your project's .gitignore: `transp`.
1. Include your html's project in the ui5 bootstrap: `data-sap-ui-libs="custom.libs.external.polyfill"`.
1. Add in your manifest.json libs section: `"custom.libs.external.polyfill": {}`.
1. Change your karma-ci.conf.js: `webapp` to `transp`.
1. To use native2ascii install Java SDK (JDK) and add to env the bin folder of JDK.
1. To use an specific UI5 version (for example an LTS version), inyour project package.json change `^` to `~` and set the ui5 specific version to the @openui5 packages.

## Support
This repository is based on the [OpenUI5 template demo apps](https://openui5.hana.ondemand.com/#/demoapps) and updated regularly with our latest recommendations. 
If you found a bug, please create an [OpenUI5 issue](https://github.com/sap/openui5/issues). Thank you!
