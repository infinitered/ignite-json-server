// Ignite plugin for JsonServer
// ----------------------------------------------------------------------------

const NPM_MODULE_NAME = 'json-server'
const PLUGIN_PATH = __dirname
const APP_PATH = process.cwd()
const PACKAGE_JSON_PATCH = 'json-server -c JsonServer/json-server.json JsonServer/db.json'
const PACKAGE_JSON_PATCH_WITH_DEV_SCREEN_INTEGRATION = 'json-server -c JsonServer/json-server.json JsonServer/db.json --middlewares JsonServer/devScreenIntegration.js'
const DEBUG_CONFIG_PATH = `${APP_PATH}/App/Config/DebugConfig.js`
const API_PATCH_IMPORT_DEBUG_CONFIG = "import DebugConfig from '../Config/DebugConfig'"
const API_PATCH_IMPORT_JSON_SERVER_SETTINGS = "import JsonServerSettings from '../../JsonServer/json-server.json'"
const API_PATCH_API_SAUCE_CREATE_FINDER = 'const api'
const API_PATCH_SET_BASE_URL = "  if (DebugConfig.useJsonServer) { baseURL = 'http://' + JsonServerSettings.host + ':' + JsonServerSettings.port }"
const API_PATCH_GET_ROOT_ORIGINAL = "const getRoot = () => api.get('')"
const API_PATCH_GET_ROOT = "const getRoot = () => api.get(DebugConfig.useJsonServer ? 'root' : '')"

const API_PATH = `${APP_PATH}/App/Services/Api.js`
const IGNITE_DEVSCREENS_PATH = `${APP_PATH}/ignite/DevScreens`

const add = async function (context) {
  const { ignite, filesystem } = context

  // install a npm module and link it
  await ignite.addModule(NPM_MODULE_NAME, {dev: true, version: '0.9.6'})

  let installIntegratedWithDevScreens = false

  // here we present prompts
  if (filesystem.exists(IGNITE_DEVSCREENS_PATH)) {
    installIntegratedWithDevScreens = await context.prompt.confirm(
      'Do you want to integrate json-server with the dev screens?'
    )
  }

  // Copy templates/JsonServer to /JsonServer
  if (!filesystem.exists('JsonServer')) {
    const templateDir = installIntegratedWithDevScreens ? 'devScreensInstall' : 'minimalInstall'
    filesystem.copy(`${PLUGIN_PATH}/templates/${templateDir}/JsonServer`, 'JsonServer')
  }

  if (installIntegratedWithDevScreens) {
    // Patch API.js
    ignite.patchInFile(API_PATH, {
      insert: API_PATCH_IMPORT_DEBUG_CONFIG,
      after: "import apisauce from 'apisauce'"
    })
    // Patch API.js
    ignite.patchInFile(API_PATH, {
      insert: API_PATCH_IMPORT_JSON_SERVER_SETTINGS,
      after: API_PATCH_IMPORT_DEBUG_CONFIG
    })

    // Patch API.js
    ignite.patchInFile(API_PATH, {
      insert: API_PATCH_SET_BASE_URL,
      before: API_PATCH_API_SAUCE_CREATE_FINDER
    })

    ignite.patchInFile(API_PATH, {
      insert: API_PATCH_GET_ROOT,
      replace: API_PATCH_GET_ROOT_ORIGINAL
    })

    ignite.setDebugConfig('useJsonServer', '__DEV__ && true', true)

    // patch package.json with a script that starts json-server with the necessary middleware file for the dev screens.
    const pkg = filesystem.read('package.json', 'json')
    pkg.scripts['json-server'] = PACKAGE_JSON_PATCH_WITH_DEV_SCREEN_INTEGRATION
    filesystem.write('package.json', pkg)
  } else {
  // patch package.json with a script that starts json-server.
    const pkg = filesystem.read('package.json', 'json')
    pkg.scripts['json-server'] = PACKAGE_JSON_PATCH
    filesystem.write('package.json', pkg)
  }
}

/**
 * Remove yourself from the project.
 */
const remove = async function (context) {
  const { ignite, filesystem, patching } = context

  // remove the npm module
  await ignite.removeModule(NPM_MODULE_NAME, {dev: true})

  // Remove App/JsonServer folder
  filesystem.remove('JsonServer')

  if (filesystem.exists(IGNITE_DEVSCREENS_PATH)) {
    // currently leaves a blank line behind in the app's /Config/DebugConfig.js file
    // to be fixed in Ignite and possibly in GlueGun
    // See https://github.com/infinitered/ignite/issues/948
    if (patching.isInFile(DEBUG_CONFIG_PATH, 'useJsonServer')) {
      ignite.removeDebugConfig('useJsonServer')
    }

    // Unpatch changes to API.js
    if (patching.isInFile(API_PATH, API_PATCH_IMPORT_DEBUG_CONFIG)) {
      ignite.patchInFile(API_PATH, {
        delete: `${API_PATCH_IMPORT_DEBUG_CONFIG}\n`
      })
    }

    // Unpatch changes to API.js
    if (patching.isInFile(API_PATH, API_PATCH_IMPORT_JSON_SERVER_SETTINGS)) {
      ignite.patchInFile(API_PATH, {
        delete: `${API_PATCH_IMPORT_JSON_SERVER_SETTINGS}\n`
      })
    }

    // Unpatch changes to API.js
    if (patching.isInFile(API_PATH, 'DebugConfig.useJsonServer')) {
      ignite.patchInFile(API_PATH, {
        delete: `${API_PATCH_SET_BASE_URL}\n`
      })
    }

    // Unpatch changes to API.js
    if (patching.isInFile(API_PATH, "root' : ''")) {
      ignite.patchInFile(API_PATH, {
        replace: API_PATCH_GET_ROOT,
        insert: API_PATCH_GET_ROOT_ORIGINAL
      })
    }
  }

  // remove script added to package.json
  const pkg = filesystem.read('package.json', 'json')
  delete pkg.scripts['json-server']
  filesystem.write('package.json', pkg)
}

// Required in all Ignite plugins
module.exports = { add, remove }

