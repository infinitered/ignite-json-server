const test = require('ava')
const sinon = require('sinon')
const plugin = require('../plugin')
const PLUGIN_PATH = __dirname.replace('/test', '')
const APP_PATH = process.cwd()
const API_PATH = `${APP_PATH}/App/Services/Api.js`
const API_PATCH_IMPORT_DEBUG_CONFIG = "import DebugConfig from '../Config/DebugConfig'"
const API_PATCH_IMPORT_JSON_SERVER_SETTINGS = "import JsonServerSettings from '../../JsonServer/json-server.json'"
const API_PATCH_GET_ROOT_ORIGINAL = "const getRoot = () => api.get('')"
const API_PATCH_GET_ROOT = "const getRoot = () => api.get(DebugConfig.useJsonServer ? 'root' : '')"
const API_PATCH_SET_BASE_URL = "  if (DebugConfig.useJsonServer) { baseURL = 'http://' + JsonServerSettings.host + ':' + JsonServerSettings.port }"
const API_PATCH_API_SAUCE_CREATE_FINDER = 'const api'
// spy on few things so we know they're called
const addModule = sinon.spy()
const patchInFile = sinon.spy()
const copy = sinon.spy()
const read = sinon.stub().returns({ scripts: {'json-server': 'foo'} })
const write = sinon.spy()
const setDebugConfig = sinon.spy()

const JSON_SERVER_VERSION = '0.9.6'

test('adds the proper npm module and modifies the expected files if user does not integrate with the dev screens', async t => {
  const exists = sinon.stub()
  exists.onCall(0).returns(false) // if filesystem.exists(IGNITE_DEVSCREENS_PATH)

  // mock a context
  const context = {
    ignite: { addModule, patchInFile },
    filesystem: { exists, copy, read, write }
  }

  await plugin.add(context)

  t.true(addModule.calledWith('json-server', { dev: true, version: JSON_SERVER_VERSION }))

  t.true(copy.calledWith(`${PLUGIN_PATH}/templates/minimalInstall/JsonServer`, 'JsonServer'))

  t.false(patchInFile.calledWith(
    API_PATH, {
      insert: API_PATCH_IMPORT_DEBUG_CONFIG,
      after: "import apisauce from 'apisauce'"
    }
  ))

  t.false(patchInFile.calledWith(
    API_PATH, {
      insert: API_PATCH_IMPORT_JSON_SERVER_SETTINGS,
      after: API_PATCH_IMPORT_DEBUG_CONFIG
    }
  ))

  t.false(patchInFile.calledWith(
    API_PATH, {
      insert: API_PATCH_SET_BASE_URL,
      before: API_PATCH_API_SAUCE_CREATE_FINDER
    }
  ))

  t.false(patchInFile.calledWith(
    API_PATH, {
      insert: API_PATCH_GET_ROOT,
      replace: API_PATCH_GET_ROOT_ORIGINAL
    }
  ))

  t.false(setDebugConfig.calledWith(
    'useJsonServer', '__DEV__ && true', true
  ))

  t.true(read.calledWith('package.json', 'json'))
})

test('adds the proper npm module and installs the expected files if user integrates with the dev screens', async t => {
  const confirm = sinon.stub().returns(true)
  const exists = sinon.stub()
  exists.onCall(0).returns(true) // if filesystem.exists(IGNITE_DEVSCREENS_PATH)
  exists.onCall(1).returns(false) // if !filesystem.exists('JsonServer')

  // mock a context
  const context = {
    ignite: { addModule, patchInFile, setDebugConfig },
    filesystem: { exists, copy, read, write },
    prompt: { confirm }
  }

  await plugin.add(context)

  t.true(addModule.calledWith('json-server', { dev: true, version: JSON_SERVER_VERSION }))

  await context.prompt.confirm('Do you want to integrate json-server with the dev screens?')

  t.true(copy.calledWith(`${PLUGIN_PATH}/templates/devScreensInstall/JsonServer`, 'JsonServer'))

  t.true(patchInFile.calledWith(
    API_PATH, {
      insert: API_PATCH_IMPORT_DEBUG_CONFIG,
      after: "import apisauce from 'apisauce'"
    }
  ))

  t.true(patchInFile.calledWith(
    API_PATH, {
      insert: API_PATCH_IMPORT_JSON_SERVER_SETTINGS,
      after: API_PATCH_IMPORT_DEBUG_CONFIG
    }
  ))

  t.true(patchInFile.calledWith(
    API_PATH, {
      insert: API_PATCH_SET_BASE_URL,
      before: API_PATCH_API_SAUCE_CREATE_FINDER
    }
  ))

  t.true(patchInFile.calledWith(
    API_PATH, {
      insert: API_PATCH_GET_ROOT,
      replace: API_PATCH_GET_ROOT_ORIGINAL
    }
  ))

  t.true(setDebugConfig.calledWith(
    'useJsonServer', '__DEV__ && true', true
  ))

  t.true(read.calledWith('package.json', 'json'))
})
