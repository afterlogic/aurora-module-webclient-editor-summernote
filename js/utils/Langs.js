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
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ar-AR.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-az-AZ.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-bg-BG.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-bn-BD.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ca-ES.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-cs-CZ.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-da-DK.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-de-CH.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-de-DE.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-el-GR.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-en-US.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-es-ES.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-es-EU.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-fa-IR.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-fi-FI.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-fr-FR.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-gl-ES.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-he-IL.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-hr-HR.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-hu-HU.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-id-ID.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-it-IT.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ja-JP.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ko-KR.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-lt-LT.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-lt-LV.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-mn-MN.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-nb-NO.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-nl-NL.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-pl-PL.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-pt-BR.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-pt-PT.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ro-RO.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ru-RU.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-sk-SK.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-sl-SI.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-sr-RS-Latin.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-sr-RS.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-sv-SE.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-ta-IN.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-th-TH.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-tr-TR.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-uk-UA.min.js')
    // require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-uz-UZ.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-vi-VN.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-zh-CN.min.js')
    require('modules/%ModuleName%/js/vendors/summernote/lang/summernote-zh-TW.min.js')
    return summernoteLang
  },
}
