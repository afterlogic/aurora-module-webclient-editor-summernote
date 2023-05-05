'use strict'

const TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js')

const Settings = require('modules/%ModuleName%/js/Settings.js')

module.exports = {
  getFontSizeButtonCreateHandler() {
    return function (context) {
      const ui = $.summernote.ui
      const buttonGroup = ui.buttonGroup([
        ui.button({
          className: 'dropdown-toggle',
          contents: ui.dropdownButtonContents('<span class="note-current-fontsize"></span>', ui.options),
          data: {
            toggle: 'dropdown',
          },
        }),
        ui.dropdownCheck({
          className: 'dropdown-fontsize',
          checkClassName: ui.options.icons.menuCheck,
          items: Settings.FontSizes.map((fontSizeData) => fontSizeData.value),
          template: (value) => {
            const sizePx = `${value}px`
            const fontSizeData = Settings.FontSizes.find((fontSizeData) => fontSizeData.value === value)
            const sizeName = fontSizeData ? `${TextUtils.i18n(fontSizeData.label)} (${value}px)` : sizePx
            return `<span style="font-size: ${sizePx};">${sizeName}</span>`
          },
          click: context.createInvokeHandlerAndUpdateState('editor.fontSize'),
        }),
      ])

      return buttonGroup.render() // return button as jquery object
    }
  },
}
