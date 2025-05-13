<?php
/**
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\EditorSummernoteWebclient;

use Aurora\System\SettingsProperty;

/**
 * @property bool $Disabled
 * @property bool $AllowEditHtmlSource
 * @property array $FontNames
 * @property string $DefaultFontName
 * @property string $DefaultFontSize
 */

class Settings extends \Aurora\System\Module\Settings
{
    protected function initDefaults()
    {
        $this->aContainer = [
            'Disabled' => new SettingsProperty(
                false,
                'bool',
                null,
                'Setting to true disables the module'
            ),
            "AvailableFor" => new SettingsProperty(
                [
                    "MailWebclient"
                ],
                "array",
                null,
                "Automatically provide this feature if one of the listed modules is requested by the entry point",
            ),
            'AllowEditHtmlSource' => new SettingsProperty(
                false,
                'bool',
                null,
                'If set true, HTML source code editing is added to HTML editor'
            ),
            'FontNames' => new SettingsProperty(
                ['Arial', 'Tahoma', 'Verdana', 'Courier New'],
                'array',
                null,
                'List of available font names'
            ),
            'DefaultFontName' => new SettingsProperty(
                'Arial',
                'string',
                null,
                'Font name used by default when composing email message'
            ),
            'FontSizes' => new SettingsProperty(
                [
                    ['value' => '10', 'label' => 'EDITORSUMMERNOTEWEBCLIENT/LABEL_FONTSIZE_SMALLEST'],
                    ['value' => '12', 'label' => 'EDITORSUMMERNOTEWEBCLIENT/LABEL_FONTSIZE_SMALLER'],
                    ['value' => '16', 'label' => 'EDITORSUMMERNOTEWEBCLIENT/LABEL_FONTSIZE_STANDARD'],
                    ['value' => '20', 'label' => 'EDITORSUMMERNOTEWEBCLIENT/LABEL_FONTSIZE_BIGGER'],
                    ['value' => '24', 'label' => 'EDITORSUMMERNOTEWEBCLIENT/LABEL_FONTSIZE_LARGE']
                ],
                'array',
                null,
                'List of available font sizes (px)'
            ),
            'DefaultFontSize' => new SettingsProperty(
                '16',
                'string',
                null,
                'Font size (px) used by default when composing email message'
            ),
            'Colors' => new SettingsProperty(
                [
                    ['#4f6573', '#83949b', '#aab2bd', '#afb0a4', '#8b8680', '#69655a', '#c9b037', '#ced85e'],
                    ['#2b6a6c', '#00858a', '#00b4b1', '#77ce87', '#4a8753', '#8aa177', '#96b352', '#beca02'],
                    ['#004c70', '#1d7299', '#109dc0', '#52b9d5', '#6c99bb', '#0a63a0', '#406cbd', '#5d9cec'],
                    ['#fc736c', '#e83855', '#e34f7c', '#f97394', '#ad5f7d', '#975298', '#b287bd', '#7e86c7'],
                    ['#fdae5f', '#f9c423', '#fad371', '#ed9223', '#de692f', '#a85540', '#87564a', '#c7a57a'],
                ],
                'array',
                null,
                'List of available colors'
            ),
            'Icons' => new SettingsProperty(
                [],
                'array',
                null,
                'List of custom icons'
            ),
        ];
    }
}
