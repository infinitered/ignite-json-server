# ignite-json-server
[Ignite](https://infinite.red/ignite) plugin that adds json-server to an Ignited project

This plugin installs the necessary files and configuration settings to run [JSON-Server](https://github.com/typicode/json-server) from the root directory of your Ignited project.

## Installation and Usage

1. CD to the root of your Ignited project and issue this command: `yarn|npm add json-server`

2. If you have installed [ignite-dev-screens](https://github.com/infinitered/ignite-dev-screens) to your app, a prompt will appear ('Do you want to integrate json-server with the dev screens?').
  - If you answer yes, json-server will be integrated with the dev screens. You will have to start up json-server in order to provide the API endpoints required by the Startup saga as well as the API testing dev screens. See step 3 to see how to start up json-server.
  - If you answer no, json-server will be added to your application without integration to the optional dev screens.

 3. Open a new terminal screen and start json-server with this command: `yarn|npm run json-server`. This will start a json-server instance that you can access via API endpoints if you integrate them into your application. The default settings for json-server are in `JsonServer/json-server.json`. Here is where you set the host and port settings for json-server. I recommend installing [Postman](https://www.getpostman.com/) to test json-server.

 4. Read the docs for [JSON-Server](https://github.com/typicode/json-server). You can modify the JSON file used by json-server here: `JsonServer/db.json`. Set up routes if you need them by modifying `JsonServer/routes.json`.

5. If you elected to integrate json-server with the dev screens, a middleware file is added to JsonServer/devScreenIntegration.js. This file is referenced in the startup script:
    ```
    "json-server": "json-server -c JsonServer/json-server.json JsonServer/db.json --middlewares JsonServer/devScreenIntegration.js"
    ```
    This simple middleware file demonstrates how to intercept a json-server request and return whatever you like to the request. In this example, searches for users return a request URL pattern match in `JsonServer/db.json`.

6. If you elected to integrate json-server with the dev screens, you can disable json-server by setting `useJsonServer` to false (`__DEV__ && false`) in `App/Config/DebugConfig.js`. This will result in Fixtures being used for the API endpoints.

## Premium Support

[Ignite](https://infinite.red/ignite) and [Ignite-json-server](https://github.com/infinitered/ignite-json-server), as open source projects, are free to use and always will be. [Infinite Red](https://infinite.red/) offers premium Ignite and Ignite-json-server support and general mobile app design/development services. Email us at [hello@infinite.red](mailto:hello@infinite.red) to get in touch with us for more details.
