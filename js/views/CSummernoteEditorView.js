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
  FontSizeUtils = require('modules/%ModuleName%/js/utils/FontSize.js'),
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
  if (this.templatesButton || this.templates().length === 0 || !this.oEditor || !this.oEditor.data('summernote')) {
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
    this.inlineImagesJua = null // uploads inline images
    this.initInlineImagesJua()

    this.attachmentsJua = null // uploads non-images using parent methods
    this.initAttachmentsJua()

    this.oEditor = $(`#${this.editorId}`)
    const toolbar = [
      ['history', ['undo', 'redo']],
      ['style', ['bold', 'italic', 'underline']],
      ['font', ['fontname', Settings.FontSizes.length > 0 ? 'customfontsize' : 'fontsize']],
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
      addDefaultFonts: false,
      disableResizeEditor: true,
      followingToolbar: false, //true makes toolbar sticky
      buttons: {
        customfontsize: FontSizeUtils.getFontSizeButtonCreateHandler(),
      },
      tableClassName: '',
      tableAttrStyle: 'width: 100%;',
      tableAttrBorder: '1',
      popover: {
        image: [
          ['image', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
          ['remove', ['removeMedia']],
        ],
        link: [['link', ['linkDialogShow', 'unlink']]],
        table: [
          ['resize', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeManual']],
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
    if (Settings.FontNames.length > 0) {
      options.fontNames = Settings.FontNames
    }
    if (Settings.Colors.length > 0) {
      options.colors = Settings.Colors
    }
    this.oEditor.summernote(options)
  }

  this.getEditableArea().attr('tabindex', sTabIndex)
  this.getEditableArea().css(FontUtils.getBasicStyles())

  if (Settings.DefaultFontName !== '') {
    this.oEditor.summernote('fontName', Settings.DefaultFontName)
  }
  if (Settings.DefaultFontSize !== '') {
    this.oEditor.summernote('fontSize', Settings.DefaultFontSize)
  }
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
    const editableArea = this.getEditableArea()
    let $SignatureContainer = $(editableArea).find('div[data-anchor="signature"]')
    const $NewSignature = $(sNewSignatureContent).closest('div[data-crea="font-wrapper"]'),
      $OldSignature = $(sOldSignatureContent).closest('div[data-crea="font-wrapper"]')
    if ($SignatureContainer.length > 0) {
      /*** there is a signature container in the message ***/
      const sCurrentSignatureContent = $SignatureContainer.html()
      if (sOldSignatureContent === '') {
        /*** previous signature is empty -> append to the container a new signature ***/
        $SignatureContainer.html(sCurrentSignatureContent + sNewSignatureContent)
      } else if (sCurrentSignatureContent.indexOf(sOldSignatureContent) !== -1) {
        /*** previous signature was found in the container -> replace it with a new ***/
        $SignatureContainer.html(sCurrentSignatureContent.replace(sOldSignatureContent, sNewSignatureContent))
      } else if (sCurrentSignatureContent.indexOf(sNewSignatureContent) !== -1) {
        /*** new signature is found in the container -> do nothing ***/
      } else {
        const sClearOldSignature =
          $NewSignature.length === 0 || $OldSignature.length === 0 ? sOldSignatureContent : $OldSignature.html()
        const sClearNewSignature =
          $NewSignature.length === 0 || $OldSignature.length === 0 ? sNewSignatureContent : $NewSignature.html()
        if (sCurrentSignatureContent.indexOf(sClearOldSignature) !== -1) {
          /*** found a previous signature without wrapper -> replace it with a new ***/
          $SignatureContainer.html(sCurrentSignatureContent.replace(sClearOldSignature, sNewSignatureContent))
        } else if (sCurrentSignatureContent.indexOf(sClearNewSignature) !== -1) {
          /*** found a new signature without wrapper -> do nothing ***/
        } else {
          /*** append the new signature to the end of the container ***/
          $SignatureContainer.html(sCurrentSignatureContent + sNewSignatureContent)
        }
      }
    } else {
      /*** there is NO signature container in the message ***/
      let sFoundOldSignature = sOldSignatureContent
      try {
        /*** Attempt 1 to find element which contains old signature ***/
        $SignatureContainer = editableArea.find('*:contains("' + sFoundOldSignature + '")')
      } catch (err) {
        $SignatureContainer = $('')
      }
      if ($SignatureContainer.length === 0 && $OldSignature.length > 0) {
        sFoundOldSignature = $OldSignature.html()
        try {
          /*** Attempt 2 to find element which contains old signature ***/
          $SignatureContainer = editableArea.find('*:contains("' + sFoundOldSignature + '")')
        } catch (oErr) {
          $SignatureContainer = $('')
        }
      }

      let $SignatureBlockquoteParent = null
      if ($SignatureContainer.length > 0) {
        /*** Element which contains old signature is found ***/
        $SignatureContainer = $($SignatureContainer[0])
        $SignatureBlockquoteParent = $SignatureContainer.closest('blockquote')
      }

      if ($SignatureBlockquoteParent && $SignatureBlockquoteParent.length === 0) {
        $SignatureContainer.html($SignatureContainer.html().replace(sFoundOldSignature, sNewSignatureContent))
      } else {
        let $replyTitle = editableArea.find('div[data-anchor="reply-title"]')
        let $replyTitleBlockquoteParent = $replyTitle.length > 0 ? $($replyTitle[0]).closest('blockquote') : $replyTitle
        if ($replyTitle.length === 0 || $replyTitleBlockquoteParent.length > 0) {
          $replyTitle = editableArea.find('blockquote')
        }

        if ($replyTitle.length > 0) {
          $($replyTitle[0]).before($('<br /><div data-anchor="signature">' + sNewSignatureContent + '</div><br />'))
        } else {
          editableArea.append($('<br /><div data-anchor="signature">' + sNewSignatureContent + '</div><br />'))
        }
      }
    }
    this.textChanged(true)
    this.actualTextСhanged.valueHasMutated()
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

  html = `<div data-crea="font-wrapper" style="${FontUtils.getBasicStylesString(this.getEditableArea())}">${html}</div>`
  if (bRemoveSignatureAnchor) {
    html = html.replace('data-anchor="signature"', '')
  }

  let htmlElem = $(html)
  htmlElem.find('p').css('margin', 0)

  return htmlElem.html()
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
  let outerNode = $(html)
  let isOuterElemChanged = false
  while (
    outerNode.length === 1 &&
    (outerNode.data('x-div-type') === 'html' || outerNode.data('x-div-type') === 'body')
  ) {
    outerNode = outerNode.children()
    isOuterElemChanged = true
  }
  if (outerNode.length === 1 && outerNode.data('crea') === 'font-wrapper') {
    this.getEditableArea()?.css(FontUtils.getBasicStylesFromNode(outerNode))
    return outerNode.html()
  }
  if (!isOuterElemChanged) {
    return html
  } else {
    let res = ''
    outerNode.each((index, elem) => {
      res += elem.outerHTML
    })
    return res
  }
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

CHtmlEditorView.prototype.onEscHandler = function () {
  // do nothing - summernote will close its dialogs
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
        this.parentView.composeUploaderDragOver(true)
      }, this)

      const fBodyDragOver = _.bind(function () {
        this.isUploaderAreaDragOver(false)
        this.parentView.composeUploaderDragOver(false)
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
    { value: 'Ctrl+K', action: TextUtils.i18n('MAILWEBCLIENT/LABEL_LINK_HOTKEY'), visible: ko.observable(true) },
    { value: 'Ctrl+B', action: TextUtils.i18n('MAILWEBCLIENT/LABEL_BOLD_HOTKEY'), visible: ko.observable(true) },
    { value: 'Ctrl+I', action: TextUtils.i18n('MAILWEBCLIENT/LABEL_ITALIC_HOTKEY'), visible: ko.observable(true) },
    { value: 'Ctrl+U', action: TextUtils.i18n('MAILWEBCLIENT/LABEL_UNDERLINE_HOTKEY'), visible: ko.observable(true) },
  ]
}

module.exports = CHtmlEditorView
