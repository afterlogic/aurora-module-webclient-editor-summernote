'use strict'

module.exports = function (appData) {
  const App = require('%PathToCoreWebclientModule%/js/App.js'),
    ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js')
  if (!ModulesManager.isModuleAvailable('MailWebclient')) {
    return null
  }

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
