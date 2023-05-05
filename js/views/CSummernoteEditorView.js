'use strict'
const _ = require('underscore'),
  $ = require('jquery'),
  ko = require('knockout')

const TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
  AlertPopup = require('%PathToCoreWebclientModule%/js/popups/AlertPopup.js'),
  ConfirmPopup = require('%PathToCoreWebclientModule%/js/popups/ConfirmPopup.js'),
  App = require('%PathToCoreWebclientModule%/js/App.js'),
  CJua = require('%PathToCoreWebclientModule%/js/CJua.js'),
  Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),
  UserSettings = require('%PathToCoreWebclientModule%/js/Settings.js')

const CAttachmentModel = require('modules/MailWebclient/js/models/CAttachmentModel.js'),
  MailCache = require('modules/MailWebclient/js/Cache.js'),
  MailSettings = require('modules/MailWebclient/js/Settings.js'),
  TemplatesUtils = require('modules/MailWebclient/js/utils/Templates.js')

const FontUtils = require('modules/%ModuleName%/js/utils/Font.js'),
  LangsUtils = require('modules/%ModuleName%/js/utils/Langs.js'),
  Settings = require('modules/%ModuleName%/js/Settings.js')

require('modules/%ModuleName%/js/vendors/summernote/summernote-lite.js')
require('modules/%ModuleName%/js/vendors/summernote/summernote-lite.css')
require('modules/%ModuleName%/js/vendors/summernote/codemirror.js')
require('modules/%ModuleName%/js/vendors/summernote/codemirror.css')
require('modules/%ModuleName%/js/vendors/summernote/xml.js')
require('modules/%ModuleName%/js/vendors/summernote/formatting.js')

/**
 * @constructor
 * @param {boolean} isBuiltInSignature
 * @param {boolean} allowPlainTextMode
 * @param {object} parentView
 */
function CHtmlEditorView(isBuiltInSignature, allowPlainTextMode, parentView) {
  this.isBuiltInSignature = isBuiltInSignature
  this.parentView = parentView

  this.oEditor = null
  this.editorId = `editorId${Math.random().toString().replace('.', '')}`
  this.textFocused = ko.observable(false)
  this.workareaDom = ko.observable()
  this.plaintextDom = ko.observable()
  this.editorDom = ko.observable()
  this.uploaderAreaDom = ko.observable()
  this.isUploaderAreaDragOver = ko.observable(false)

  this.htmlEditorDom = ko.observable()

  this.htmlSize = ko.observable(0)

  this.shouldInsertImageAsBase64 = this.isBuiltInSignature

  this.allowPlainTextMode = allowPlainTextMode
  this.plainTextMode = ko.observable(false)
  this.plainTextMode.subscribe(() => {
    if (!this.oEditor || !this.oEditor.data('summernote')) {
      return
    }
    if (this.plainTextMode()) {
      this.oEditor.data('summernote').layoutInfo.editor.hide()
      if (this.plaintextDom() && this.plaintextDom().length > 0) {
        setTimeout(() => {
          this.plaintextDom()[0].focus()
        })
      }
    } else {
      this.oEditor.data('summernote').layoutInfo.editor.show()
    }
  })
  this.changeTextModeTitle = ko.computed(function () {
    return this.plainTextMode()
      ? TextUtils.i18n('MAILWEBCLIENT/LINK_TURNOFF_PLAINTEXT')
      : TextUtils.i18n('MAILWEBCLIENT/LINK_TURNON_PLAINTEXT')
  }, this)

  this.isDialogOpen = ko.observable(false)

  this.aUploadedImagesData = []

  this.inactive = ko.observable(false)
  this.sPlaceholderText = ''

  this.disableEdit = ko.observable(false)

  this.textChanged = ko.observable(false)

  this.actualTextСhanged = ko.observable(false)

  this.templates = ko.observableArray([])
  this.templates.subscribe(() => {
    this.addTemplatesButton()
  })
  TemplatesUtils.initTemplatesSubscription(this.templates)
}

CHtmlEditorView.prototype.ViewTemplate = '%ModuleName%_SummernoteEditorView'

CHtmlEditorView.prototype.onClose = function () {
  if (this.oEditor) {
    this.oEditor.summernote('destroy')
    this.oEditor = null
  }
}

CHtmlEditorView.prototype.addTemplatesButton = function () {
  if (this.templatesButton || this.templates().length === 0 || !this.oEditor) {
    return
  }
  const templatesIconUrl = 'modules/%ModuleName%/js/vendors/summernote/templates-on.svg'
  const ui = $.summernote.ui
  const allTemplates = this.templates()
  const insertTemplate = this.insertTemplate.bind(this)
  const buttonGroup = ui.buttonGroup([
    ui.button({
      className: 'dropdown-toggle',
      contents: `<svg width="20" height="24" style="margin: -7px -2px;">
						  <image xlink:href="${templatesIconUrl}" width="20" height="24"/>
					   </svg><span class="note-icon-caret"></span>`,
      data: {
        toggle: 'dropdown',
      },
    }),
    ui.dropdown({
      className: 'dropdown-template',
      items: allTemplates.map((template) => template.subject),
      callback: (items) => {
        $(items)
          .find('a.note-dropdown-item')
          .on('click', function (event) {
            const templateSubject = $(this).text()
            const template = allTemplates.find((template) => template.subject === templateSubject)
            if (template) {
              insertTemplate(template.text, event)
            }
          })
      },
    }),
  ])

  this.templatesButton = buttonGroup.render()
  this.oEditor.data('summernote').layoutInfo.toolbar.append(this.templatesButton)
}

/**
 * @param {string} sText
 * @param {boolean} bPlain
 * @param {string} sTabIndex
 * @param {string} sPlaceholderText
 */
CHtmlEditorView.prototype.init = function (sText, bPlain, sTabIndex, sPlaceholderText) {
  this.sPlaceholderText = sPlaceholderText || ''

  if (this.oEditor) {
    // in case if knockoutjs destroyed dom element with html editor
    this.oEditor.summernote('destroy')
    this.oEditor = null
    this.templatesButton = null
  }

  if (!this.oEditor) {
    var CustomFontSizeButton = function (context) {
      const ui = $.summernote.ui
      const sizes = {
        10: 'Smallest',
        12: 'Smaller',
        16: 'Standard',
        20: 'Bigger',
        24: 'Large',
        // '9': 'Smallest',
        // '10': 'Smaller',
        // '12': 'Standard',
        // '14': 'Bigger',
        // '18': 'Large',
      }
      const getSizeName = (item) => {
        return sizes[item] !== undefined ? sizes[item] + ' (' + item + 'px)' : item + 'px'
      }

      const buttonGroup = ui.buttonGroup([
        ui.button({
          className: 'dropdown-toggle',
          contents: ui.dropdownButtonContents('<span class="note-current-fontsize"></span>', ui.options),
          // tooltip: lang.font.size,
          data: {
            toggle: 'dropdown',
          },
        }),
        ui.dropdownCheck({
          className: 'dropdown-fontsize',
          checkClassName: ui.options.icons.menuCheck,
          items: Object.keys(sizes),
          template: (item) => {
            return '<span style="font-size: ' + item + 'px;">' + getSizeName(item) + '</span>'
          },
          itemClick: (event, item, value) => {
            event.stopPropagation()
            event.preventDefault()
            context.invoke('editor.fontStyling', 'font-size', value)
            context.invoke('buttons.updateCurrentStyle')
          },
        }),
      ])

      return buttonGroup.render() // return button as jquery object
    }

    this.inlineImagesJua = null // uploads inline images
    this.initInlineImagesJua()

    this.attachmentsJua = null // uploads non-images using parent methods
    this.initAttachmentsJua()

    this.oEditor = $(`#${this.editorId}`)
    const toolbar = [
      ['history', ['undo', 'redo']],
      ['style', ['bold', 'italic', 'underline']],
      ['font', ['fontname', 'customfontsize']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['misc', MailSettings.AllowInsertImage ? ['table', 'link', 'picture', 'clear'] : ['table', 'link', 'clear']],
    ]
    if (Settings.AllowEditHtmlSource) {
      toolbar.push(['codeview', ['codeview']])
    }
    const options = {
      lang: LangsUtils.getSummernoteLang(),
      toolbar,
      codemirror: {
        mode: 'text/html',
        htmlMode: true,
        lineNumbers: true,
      },
      dialogsInBody: true,
      shortcuts: false,
      disableResizeEditor: true,
      followingToolbar: false, //true makes toolbar sticky
      buttons: {
        customfontsize: CustomFontSizeButton,
      },
      colors: [
        ['#4f6573', '#83949b', '#aab2bd', '#afb0a4', '#8b8680', '#69655a', '#c9b037', '#ced85e'],
        ['#2b6a6c', '#00858a', '#00b4b1', '#77ce87', '#4a8753', '#8aa177', '#96b352', '#beca02'],
        ['#004c70', '#1d7299', '#109dc0', '#52b9d5', '#6c99bb', '#0a63a0', '#406cbd', '#5d9cec'],
        ['#fc736c', '#e83855', '#e34f7c', '#f97394', '#ad5f7d', '#975298', '#b287bd', '#7e86c7'],
        ['#fdae5f', '#f9c423', '#fad371', '#ed9223', '#de692f', '#a85540', '#87564a', '#c7a57a'],
      ],
      popover: {
        image: [
          ['image', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
          ['remove', ['removeMedia']],
        ],
        link: [['link', ['linkDialogShow', 'unlink']]],
        table: [
          ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
          ['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
        ],
      },
      callbacks: {
        onChange: () => {
          this.textChanged(true)
          this.actualTextСhanged.valueHasMutated()
          const html = this.oEditor ? this.oEditor.summernote('code') : ''
          this.htmlSize(html.length)
        },
        onChangeCodeview: () => {
          this.textChanged(true)
          this.actualTextСhanged.valueHasMutated()
          const html = this.oEditor ? this.oEditor.summernote('code') : ''
          this.htmlSize(html.length)
        },
        onFocus: (event) => {
          // the timeout is necessary to prevent the compose popup from closing on Escape
          // if the editor dialog was open
          setTimeout(() => {
            this.isDialogOpen(false)
          }, 100)
          this.textFocused(true)
        },
        onBlur: (event) => {
          this.isDialogOpen(false)
          this.textFocused(false)
        },
        onDialogShown: () => {
          this.isDialogOpen(true)
        },
        onImageUpload: (files) => {
          Array.from(files).forEach((file) => {
            this.uploadFile(file, this.isDialogOpen())
          })
        },
      },
    }
    if (Array.isArray(Settings.FontNames) && Settings.FontNames.length > 0) {
      options.fontNames = Settings.FontNames
    }
    this.oEditor.summernote(options)
  }

  this.getEditableArea().attr('tabindex', sTabIndex)
  this.getEditableArea().css(FontUtils.getBasicStyles())

  this.clearUndoRedo()
  this.setText(sText, bPlain)
  this.setInactive(this.inactive())

  this.aUploadedImagesData = []

  TemplatesUtils.fillTemplatesOptions(this.templates)
}

CHtmlEditorView.prototype.setInactive = function (bInactive) {
  this.inactive(bInactive)
  if (this.inactive()) {
    this.setPlaceholder()
  } else {
    this.removePlaceholder()
  }
}

CHtmlEditorView.prototype.setPlaceholder = function () {
  if (this.oEditor) {
    const html = this.removeAllTags(this.oEditor.summernote('code'))
    if (html === '' || html === '&nbsp;') {
      this.setText(`<span>${this.sPlaceholderText}</span>`)
    }
  }
}

CHtmlEditorView.prototype.removePlaceholder = function () {
  if (this.oEditor) {
    const html = this.removeAllTags(this.oEditor.summernote('code'))
    if (html === this.sPlaceholderText) {
      this.setText('')

      // *** Without this trick, the focus does not appear in the signature
      this.getEditableArea().blur()
      setTimeout(() => {
        this.getEditableArea().focus()
      }, 10)
      // ***
    }
  }
}

CHtmlEditorView.prototype.hasOpenedPopup = function () {
  return this.isDialogOpen()
}

CHtmlEditorView.prototype.setDisableEdit = function (bDisableEdit) {
  this.disableEdit(!!bDisableEdit)
}

CHtmlEditorView.prototype.commit = function () {
  this.textChanged(false)
}

CHtmlEditorView.prototype.insertTemplate = function (html, event) {
  event.stopPropagation()
  event.preventDefault()
  this.insertHtml(html)
}

CHtmlEditorView.prototype.isInitialized = function () {
  return !!this.oEditor
}

CHtmlEditorView.prototype.setFocus = function () {
  if (this.oEditor) {
    this.getEditableArea().focus()
  }
}

/**
 * @param {string} sNewSignatureContent
 * @param {string} sOldSignatureContent
 */
CHtmlEditorView.prototype.changeSignatureContent = function (sNewSignatureContent, sOldSignatureContent) {
  if (this.oEditor && !this.disableEdit()) {
    const content = this.getEditableArea(),
      $SignatureContainer = $(content).find('div[data-anchor="signature"]'),
      $NewSignature = $(sNewSignatureContent).closest('div[data-crea="font-wrapper"]'),
      $OldSignature = $(sOldSignatureContent).closest('div[data-crea="font-wrapper"]')
    /*** there is a signature container in the message ***/
    if ($SignatureContainer.length > 0) {
      const sCurrentSignatureContent = $SignatureContainer.html()
      /*** previous signature is empty -> append to the container a new signature ***/
      if (sOldSignatureContent === '') {
        $SignatureContainer.html(sCurrentSignatureContent + sNewSignatureContent)
      } else if (
        /*** previous signature was found in the container -> replace it with a new ***/
        sCurrentSignatureContent.indexOf(sOldSignatureContent) !== -1
      ) {
        $SignatureContainer.html(sCurrentSignatureContent.replace(sOldSignatureContent, sNewSignatureContent))
      } else if (
        /*** new signature is found in the container -> do nothing ***/
        sCurrentSignatureContent.indexOf(sNewSignatureContent) !== -1
      ) {
      } else {
        const sClearOldSignature =
          $NewSignature.length === 0 || $OldSignature.length === 0 ? sOldSignatureContent : $OldSignature.html()
        const sClearNewSignature =
          $NewSignature.length === 0 || $OldSignature.length === 0 ? sNewSignatureContent : $NewSignature.html()
        /*** found a previous signature without wrapper -> replace it with a new ***/
        if (sCurrentSignatureContent.indexOf(sClearOldSignature) !== -1) {
          $SignatureContainer.html(sCurrentSignatureContent.replace(sClearOldSignature, sNewSignatureContent))
        } else if (
          /*** found a new signature without wrapper -> do nothing ***/
          sCurrentSignatureContent.indexOf(sClearNewSignature) !== -1
        ) {
        } else {
          /*** append the new signature to the end of the container ***/
          $SignatureContainer.html(sCurrentSignatureContent + sNewSignatureContent)
        }
      }
    }
  }
}

CHtmlEditorView.prototype.getPlainText = function () {
  const html = this.oEditor ? this.oEditor.summernote('code') : ''
  return html
    .replace(/([^>]{1})<div>/gi, '$1\n')
    .replace(/<style[^>]*>[^<]*<\/style>/gi, '\n')
    .replace(/<br *\/{0,1}>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<a [^>]*href="([^"]*?)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
}

/**
 * @param {boolean=} bRemoveSignatureAnchor = false
 */
CHtmlEditorView.prototype.getText = function (bRemoveSignatureAnchor) {
  if (this.plainTextMode()) {
    return this.plaintextDom() ? this.plaintextDom().val() : ''
  }

  let html = this.oEditor ? this.oEditor.summernote('code') : ''
  if (this.sPlaceholderText !== '' && this.removeAllTags(html) === this.sPlaceholderText) {
    return ''
  }

  html = `<div data-crea="font-wrapper" style="${FontUtils.getBasicStylesString()}">${html}</div>`
  if (bRemoveSignatureAnchor) {
    return html.replace('data-anchor="signature"', '')
  }

  return html
}

/**
 * Returns JQuery instance of main editable element
 */
CHtmlEditorView.prototype.getEditableArea = function () {
  return this.oEditor.data('summernote')?.layoutInfo?.editable || null
}

/**
 * @param {string} sText
 * @param {boolean} bPlain
 */
CHtmlEditorView.prototype.setText = function (sText, bPlain = null) {
  if (this.oEditor && !this.disableEdit()) {
    if (bPlain !== null) {
      this.plainTextMode(!!bPlain)
    }
    if (this.inactive() && sText === '') {
      this.setPlaceholder()
    } else if (this.plainTextMode()) {
      if (TextUtils.isHtml(sText)) {
        sText = TextUtils.htmlToPlain(sText)
      }
      this.plaintextDom().val(sText)
    } else {
      if (!TextUtils.isHtml(sText)) {
        sText = TextUtils.plainToHtml(sText)
      }
      if (sText === '') {
        sText = '<p></p>'
      }
      this.oEditor.summernote('code', this.prepareSummernoteCode(sText))
    }
  }
}

CHtmlEditorView.prototype.prepareSummernoteCode = function (html) {
  const outerNode = $(html)
  if (outerNode.length !== 1) {
    return html
  }

  if (outerNode.data('crea') === 'font-wrapper') {
    this.getEditableArea()?.css(FontUtils.getBasicStylesFromNode(outerNode))
    return outerNode.html()
  }

  const oChildren = outerNode.children()

  if (oChildren.length !== 1) {
    return html
  }

  const oInner = oChildren.first()
  if (outerNode.data('xDivType') === 'body' && oInner.data('crea') === 'font-wrapper') {
    this.setBasicStyles(FontUtils.getBasicStylesFromNode(oInner))
    return oInner.html()
  }

  return html
}

CHtmlEditorView.prototype.undoAndClearRedo = function () {
  if (this.oEditor) {
    this.oEditor.summernote('undo')
  }
}

CHtmlEditorView.prototype.clearUndoRedo = function () {
  if (this.oEditor) {
    this.oEditor.summernote('commit')
  }
}

/**
 * @param {string} sText
 */
CHtmlEditorView.prototype.removeAllTags = function (sText) {
  return sText.replace(/<style>.*<\/style>/g, '').replace(/<[^>]*>/g, '')
}

CHtmlEditorView.prototype.closeAllPopups = function () {
  // do nothing - summernote will close its dialogs
}

/**
 * @param {string} sHtml
 */
CHtmlEditorView.prototype.insertHtml = function (sHtml) {
  if (this.oEditor) {
    if (!this.oEditor.summernote('hasFocus')) {
      this.oEditor.summernote('focus')
    }
    this.oEditor.summernote('pasteHTML', sHtml)
  }
}

/**
 * @param {string} sUid
 * @param oAttachmentData
 */
CHtmlEditorView.prototype.insertComputerImageFromDialog = function (sUid, oAttachmentData) {
  if (!MailSettings.AllowInsertImage || !this.oEditor) {
    return
  }

  const accountId = _.isFunction(this.parentView && this.parentView.senderAccountId)
      ? this.parentView.senderAccountId()
      : MailCache.currentAccountId(),
    attachment = new CAttachmentModel(accountId)
  attachment.parse(oAttachmentData)
  const viewLink = attachment.getActionUrl('view')

  if (viewLink.length > 0) {
    const $img = $(`<img src="${viewLink}" data-x-src-cid="${sUid}" />`)
    this.oEditor.summernote('insertNode', $img[0])
    oAttachmentData.CID = sUid
    this.aUploadedImagesData.push(oAttachmentData)
  }
}

CHtmlEditorView.prototype.getUploadedImagesData = function () {
  return this.aUploadedImagesData
}

/**
 * Initializes file uploader.
 */
CHtmlEditorView.prototype.initInlineImagesJua = function () {
  // this.oJua must be re-initialized because compose popup is destroyed after it is closed
  this.inlineImagesJua = new CJua({
    action: '?/Api/',
    name: 'jua-uploader',
    queueSize: 2,
    hiddenElementsPosition: UserSettings.IsRTL ? 'right' : 'left',
    disableMultiple: true,
    disableAjaxUpload: false,
    disableDragAndDrop: true,
    hidden: _.extendOwn(
      {
        Module: MailSettings.ServerModuleName,
        Method: 'UploadAttachment',
        Parameters: function () {
          return JSON.stringify({
            AccountID: MailCache.currentAccountId(),
          })
        },
      },
      App.getCommonRequestParameters()
    ),
  })
  this.inlineImagesJua
    .on('onSelect', _.bind(this.onFileUploadSelect, this))
    .on('onComplete', _.bind(this.onFileUploadComplete, this))
}

/**
 * Initializes file uploader for editor.
 */
CHtmlEditorView.prototype.initAttachmentsJua = function () {
  // this.attachmentsJua must be re-initialized because compose popup is destroyed after it is closed
  if (this.uploaderAreaDom()) {
    if (
      this.parentView &&
      this.parentView.composeUploaderDragOver &&
      this.parentView.onFileUploadProgress &&
      this.parentView.onFileUploadStart &&
      this.parentView.onFileUploadComplete
    ) {
      const fBodyDragEnter = _.bind(function () {
        this.isUploaderAreaDragOver(true)
        this.oParent.composeUploaderDragOver(true)
      }, this)

      const fBodyDragOver = _.bind(function () {
        this.isUploaderAreaDragOver(false)
        this.oParent.composeUploaderDragOver(false)
      }, this)

      this.attachmentsJua = new CJua({
        action: '?/Api/',
        name: 'jua-uploader',
        queueSize: 1,
        dragAndDropElement: this.uploaderAreaDom(),
        disableMultiple: true,
        disableAjaxUpload: false,
        disableDragAndDrop: false,
        hidden: _.extendOwn(
          {
            Module: MailSettings.ServerModuleName,
            Method: 'UploadAttachment',
            Parameters: function () {
              return JSON.stringify({
                AccountID: MailCache.currentAccountId(),
              })
            },
          },
          App.getCommonRequestParameters()
        ),
      })

      this.attachmentsJua
        .on('onDragEnter', _.bind(this.parentView.composeUploaderDragOver, this.parentView, true))
        .on('onDragLeave', _.bind(this.parentView.composeUploaderDragOver, this.parentView, false))
        .on('onBodyDragEnter', fBodyDragEnter)
        .on('onBodyDragLeave', fBodyDragOver)
        .on('onProgress', _.bind(this.parentView.onFileUploadProgress, this.parentView))
        .on('onSelect', _.bind(this.parentView.onFileUploadSelect, this.parentView))
        .on('onStart', _.bind(this.parentView.onFileUploadStart, this.parentView))
        .on('onComplete', _.bind(this.parentView.onFileUploadComplete, this.parentView))
    }
  }
}

CHtmlEditorView.prototype.isDragAndDropSupported = function () {
  return this.attachmentsJua ? this.attachmentsJua.isDragAndDropSupported() : false
}

CHtmlEditorView.prototype.uploadNotImageAsAttachment = function (file) {
  const fileInfo = {
    File: file,
    FileName: file.name,
    Folder: '',
    Size: file.size,
    Type: file.type,
  }
  this.attachmentsJua.addNewFile(fileInfo)
}

CHtmlEditorView.prototype.uploadImageAsInline = function (file) {
  if (!MailSettings.AllowInsertImage || !this.inlineImagesJua) {
    return
  }

  const fileInfo = {
    File: file,
    FileName: file.name,
    Folder: '',
    Size: file.size,
    Type: file.type,
  }
  this.inlineImagesJua.addNewFile(fileInfo)
}

CHtmlEditorView.prototype.uploadImageAsBase64 = function (file) {
  if (!MailSettings.AllowInsertImage || !this.oEditor) {
    return
  }

  const $img = $('<img src="./static/styles/images/wait.gif" />')
  this.oEditor.summernote('insertNode', $img[0])
  const reader = new window.FileReader()
  reader.onload = function (event) {
    $img.attr('src', event.target.result)
  }
  reader.readAsDataURL(file)
}

CHtmlEditorView.prototype.uploadFile = function (file, isUploadFromDialog) {
  if (!file || typeof file.type !== 'string') {
    return
  }
  if (MailSettings.AllowInsertImage && 0 === file.type.indexOf('image/')) {
    if (MailSettings.ImageUploadSizeLimit > 0 && file.size > MailSettings.ImageUploadSizeLimit) {
      Popups.showPopup(AlertPopup, [TextUtils.i18n('COREWEBCLIENT/ERROR_UPLOAD_SIZE')])
    } else {
      if (this.shouldInsertImageAsBase64 || !isUploadFromDialog) {
        this.uploadImageAsBase64(file)
      } else {
        this.uploadImageAsInline(file)
      }
    }
  } else if (!isUploadFromDialog && this.attachmentsJua) {
    // upload is from drag
    // and attachmentsJua uploader is initialized
    this.uploadNotImageAsAttachment(file)
  } else {
    Popups.showPopup(AlertPopup, [TextUtils.i18n('MAILWEBCLIENT/ERROR_NOT_IMAGE_CHOOSEN')])
  }
}

/**
 * @param {Object} oFile
 */
CHtmlEditorView.prototype.isFileImage = function (oFile) {
  if (typeof oFile.Type === 'string') {
    return -1 !== oFile.Type.indexOf('image')
  } else {
    var iDotPos = oFile.FileName.lastIndexOf('.'),
      sExt = oFile.FileName.substr(iDotPos + 1),
      aImageExt = ['jpg', 'jpeg', 'gif', 'tif', 'tiff', 'png']
    return -1 !== $.inArray(sExt, aImageExt)
  }
}

/**
 * @param {string} sUid
 * @param {Object} oFile
 */
CHtmlEditorView.prototype.onFileUploadSelect = function (sUid, oFile) {
  if (!this.isFileImage(oFile)) {
    Popups.showPopup(AlertPopup, [TextUtils.i18n('MAILWEBCLIENT/ERROR_NOT_IMAGE_CHOOSEN')])
    return false
  }
  return true
}

/**
 * @param {string} sUid
 * @param {boolean} bResponseReceived
 * @param {Object} oData
 */
CHtmlEditorView.prototype.onFileUploadComplete = function (sUid, bResponseReceived, oData) {
  var sError = ''

  if (oData && oData.Result) {
    if (oData.Result.Error) {
      sError =
        oData.Result.Error === 'size'
          ? TextUtils.i18n('COREWEBCLIENT/ERROR_UPLOAD_SIZE')
          : TextUtils.i18n('COREWEBCLIENT/ERROR_UPLOAD_UNKNOWN')

      Popups.showPopup(AlertPopup, [sError])
    } else {
      this.insertComputerImageFromDialog(sUid, oData.Result.Attachment)
    }
  } else {
    Popups.showPopup(AlertPopup, [TextUtils.i18n('COREWEBCLIENT/ERROR_UPLOAD_UNKNOWN')])
  }
}

/**
 * Changes text mode - html or plain text.
 */
CHtmlEditorView.prototype.changeTextMode = function () {
  const changeTextModeHandler = () => {
    if (this.plainTextMode()) {
      const html = '<div>' + TextUtils.plainToHtml(this.getText()) + '</div>'
      this.setText(html, false)
    } else {
      this.setText(this.getPlainText(), true)
    }
  }

  if (this.plainTextMode()) {
    changeTextModeHandler()
  } else {
    const confirmText = TextUtils.i18n('MAILWEBCLIENT/CONFIRM_HTML_TO_PLAIN_FORMATTING')
    Popups.showPopup(ConfirmPopup, [
      confirmText,
      function (changeConfirmed) {
        if (changeConfirmed) {
          changeTextModeHandler()
        }
      },
    ])
  }
}

CHtmlEditorView.prototype.getHotKeysDescriptions = function () {
  return [
    { value: 'Ctrl+Z', action: TextUtils.i18n('MAILWEBCLIENT/LABEL_UNDO_HOTKEY'), visible: ko.observable(true) },
    { value: 'Ctrl+Y', action: TextUtils.i18n('MAILWEBCLIENT/LABEL_REDO_HOTKEY'), visible: ko.observable(true) },
  ]
}

module.exports = CHtmlEditorView
