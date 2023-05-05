'use strict'

const Types = require('%PathToCoreWebclientModule%/js/utils/Types.js')

module.exports = {
  AllowEditHtmlSource: false,
  FontNames: [],
  FontSizes: [],
  DefaultFontName: '',
  DefaultFontSize: '',

  /**
   * Initializes settings from AppData object sections.
   *
   * @param {Object} appData Object containes modules settings.
   */
  init: function (appData) {
    const appDataSection = appData['%ModuleName%']
    this.AllowEditHtmlSource = Types.pBool(appDataSection?.AllowEditHtmlSource, this.AllowEditHtmlSource)
    this.FontNames = Types.pArray(appDataSection?.FontNames, this.FontNames)
    this.DefaultFontName = Types.pString(appDataSection?.DefaultFontName, this.DefaultFontName)
    this.FontSizes = Types.pArray(appDataSection?.FontSizes, this.FontSizes)
    this.DefaultFontSize = Types.pString(appDataSection?.DefaultFontSize, this.DefaultFontSize)
  },
}
