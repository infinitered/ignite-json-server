const test = require('ava')
const sinon = require('sinon')
const plugin = require('../plugin')
const NPM_MODULE_NAME = 'json-server'

// spy on few things so we know they're called
const removeModule = sinon.spy()
const remove = sinon.spy()
const read = sinon.stub().returns({ scripts: {'json-server': 'foo'} })
const write = sinon.spy()
const patchInFile = sinon.spy()

test('removes JsonServer without dev server integration', async t => {
  const exists = sinon.stub().returns(false)

  const isInFile = sinon.stub().returns(false)

  const removeDebugConfig = sinon.spy()

  const context = {
    ignite: { removeModule, patchInFile, removeDebugConfig },
    filesystem: { exists, remove, read, write },
    patching: { isInFile }
  }

  await plugin.remove(context)

  t.true(removeModule.calledWith(NPM_MODULE_NAME, { dev: true }))
  t.true(remove.calledWith('JsonServer'))

  t.false(removeDebugConfig.calledWith('useJsonServer'))
})

test('removes JsonServer with dev server integration', async t => {
  const exists = sinon.stub().returns(true)

  const isInFile = sinon.stub().returns(true)

  const removeDebugConfig = sinon.spy()

  const context = {
    ignite: { removeModule, patchInFile, removeDebugConfig },
    filesystem: { exists, remove, read, write },
    patching: { isInFile }
  }

  await plugin.remove(context)

  t.true(removeModule.calledWith(NPM_MODULE_NAME, { dev: true }))
  t.true(remove.calledWith('JsonServer'))

  t.true(removeDebugConfig.calledWith('useJsonServer'))
})
