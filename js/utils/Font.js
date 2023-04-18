'use strict'

const UserSettings = require('%PathToCoreWebclientModule%/js/Settings.js')

const Settings = require('modules/%ModuleName%/js/Settings.js')

module.exports = {
  getFontNameWithFamily(fontName) {
    if (typeof fontName !== 'string' || fontName === '') {
      return 'sans-serif'
    }

    switch (fontName) {
      case 'Arial':
      case 'Arial Black':
      case 'Tahoma':
      case 'Verdana':
        return `${fontName}, sans-serif`
      case 'Courier New':
        return `${fontName}, monospace`
      case 'Times New Roman':
        return `${fontName}, serif`
      default:
        return `${fontName}, sans-serif`
    }
  },

  getBasicStyles() {
    const basicStyles = {
      direction: UserSettings.IsRTL ? 'rtl' : 'ltr',
    }
    if (typeof Settings.DefaultFontName === 'string' && Settings.DefaultFontName !== '') {
      basicStyles['font-family'] = this.getFontNameWithFamily(Settings.DefaultFontName)
    }
    if (typeof Settings.DefaultFontSize === 'number' && Settings.DefaultFontSize > 0) {
      basicStyles['font-size'] = `${Settings.DefaultFontSize}px`
    }
    return basicStyles
  },

  getBasicStylesFromNode(node) {
    const basicStyles = {}
    if (node.css('direction')) {
      basicStyles['direction'] = node.css('direction')
    }
    if (node.css('font-family')) {
      basicStyles['font-family'] = node.css('font-family')
    }
    if (node.css('font-size')) {
      basicStyles['font-size'] = `${node.css('font-size')}px`
    }
    return basicStyles
  },

  getBasicStylesString() {
    const basicStyles = [`direction: ${UserSettings.IsRTL ? 'rtl' : 'ltr'}`]
    if (typeof Settings.DefaultFontName === 'string' && Settings.DefaultFontName !== '') {
      basicStyles.push(`font-family: ${this.getFontNameWithFamily(Settings.DefaultFontName)}`)
    }
    if (typeof Settings.DefaultFontSize === 'number' && Settings.DefaultFontSize > 0) {
      basicStyles.push(`font-size: ${Settings.DefaultFontSize}px`)
    }
    return basicStyles.join('; ')
  },
}
