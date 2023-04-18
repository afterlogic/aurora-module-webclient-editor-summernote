'use strict'

module.exports = function (appData) {
  const ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js')
  if (!ModulesManager.isModuleAvailable('MailWebclient')) {
    return null
  }

  const App = require('%PathToCoreWebclientModule%/js/App.js')

  const Settings = require('modules/%ModuleName%/js/Settings.js')

  Settings.init(appData)

  if (App.isUserNormalOrTenant()) {
    return {
      start: function (ModulesManager) {
        App.subscribeEvent('MailWebclient::GetCHtmlEditorView', (params) => {
          params.CHtmlEditorView = require('modules/%ModuleName%/js/views/CSummernoteEditorView.js')
        })
      },
    }
  }

  return null
}
