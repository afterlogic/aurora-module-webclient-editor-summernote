'use strict'

const UserSettings = require('%PathToCoreWebclientModule%/js/Settings.js')

const summernoteLangMap = {
  arabic: 'ar-AR',
  bulgarian: 'bg-BG',
  'chinese-traditional': 'zh-TW',
  'chinese-simplified': 'zh-CN',
  czech: 'cs-CZ',
  danish: 'da-DK',
  dutch: 'nl-NL',
  english: 'en-US',
  // 'estonian': 'et',
  finnish: 'fi-FI',
  french: 'fr-FR',
  german: 'de-DE',
  greek: 'el-GR',
  hebrew: 'he-IL',
  hungarian: 'hu-HU',
  italian: 'it-IT',
  japanese: 'ja-JP',
  korean: 'ko-KR',
  // 'latvian': 'lv',
  lithuanian: 'lt-LT',
  norwegian: 'nb-NO',
  persian: 'fa-IR',
  polish: 'pl-PL',
  'portuguese-brazil': 'pt-BR',
  'portuguese-portuguese': 'pt-PT',
  romanian: 'ro-RO',
  russian: 'ru-RU',
  serbian: 'sr-RS',
  slovenian: 'sl-SI',
  spanish: 'es-ES',
  swedish: 'sv-SE',
  thai: 'th-TH',
  turkish: 'tr-TR',
  ukrainian: 'uk-UA',
  vietnamese: 'vi-VN',
}

const summernoteLang = summernoteLangMap[UserSettings.Language.toLowerCase()] || summernoteLangMap.English

module.exports = {
  getSummernoteLang() {
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ar-AR.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-az-AZ.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-bg-BG.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-bn-BD.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ca-ES.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-cs-CZ.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-da-DK.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-de-CH.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-de-DE.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-el-GR.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-es-ES.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-es-EU.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-fa-IR.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-fi-FI.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-fr-FR.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-gl-ES.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-he-IL.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-hr-HR.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-hu-HU.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-id-ID.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-it-IT.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ja-JP.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ko-KR.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-lt-LT.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-lt-LV.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-mn-MN.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-nb-NO.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-nl-NL.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-pl-PL.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-pt-BR.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-pt-PT.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ro-RO.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ru-RU.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-sk-SK.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-sl-SI.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-sr-RS-Latin.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-sr-RS.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-sv-SE.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ta-IN.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-th-TH.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-tr-TR.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-uk-UA.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-uz-UZ.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-vi-VN.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-zh-CN.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-zh-TW.js')
    return summernoteLang
  },
}
