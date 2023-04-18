'use strict'

const Types = require('%PathToCoreWebclientModule%/js/utils/Types.js')

module.exports = {
  AllowChangeInputDirection: false,
  AllowEditHtmlSource: false,
  FontNames: [],
  DefaultFontName: '',
  DefaultFontSize: 0,

  /**
   * Initializes settings from AppData object sections.
   *
   * @param {Object} appData Object containes modules settings.
   */
  init: function (appData) {
    const appDataSection = appData['%ModuleName%']
    this.AllowChangeInputDirection = Types.pBool(
      appDataSection?.AllowChangeInputDirection,
      this.AllowChangeInputDirection
    )
    this.AllowEditHtmlSource = Types.pBool(appDataSection?.AllowEditHtmlSource, this.AllowEditHtmlSource)
    this.FontNames = Types.pArray(appDataSection?.FontNames, this.FontNames)
    this.DefaultFontName = Types.pString(appDataSection?.DefaultFontName, this.DefaultFontName)
    this.DefaultFontSize = Types.pInt(appDataSection?.DefaultFontSize, this.DefaultFontSize)
  },
}
