<?php
/**
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\EditorSummernoteWebclient;

use Aurora\System\SettingsProperty;
use Aurora\System\Enums;

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
            'Disabled' => new SettingsProperty(false, 'bool', null, 'Setting to true disables the module'),
            'AllowEditHtmlSource' => new SettingsProperty(false, 'bool', null, 'If set true, HTML source code editing is added to HTML editor'),
            'FontNames' => new SettingsProperty(['Arial', 'Tahoma', 'Verdana', 'Courier New'], 'array', null, 'List of available font names'),
            'DefaultFontName' => new SettingsProperty('Arial', 'string', null, 'Font name used by default when composing email message'),
            'FontSizes' => new SettingsProperty([
                ['value' => '10', 'label' => 'EDITORSUMMERNOTEWEBCLIENT/LABEL_FONTSIZE_SMALLEST'],
                ['value' => '12', 'label' => 'EDITORSUMMERNOTEWEBCLIENT/LABEL_FONTSIZE_SMALLER'],
                ['value' => '16', 'label' => 'EDITORSUMMERNOTEWEBCLIENT/LABEL_FONTSIZE_STANDARD'],
                ['value' => '20', 'label' => 'EDITORSUMMERNOTEWEBCLIENT/LABEL_FONTSIZE_BIGGER'],
                ['value' => '24', 'label' => 'EDITORSUMMERNOTEWEBCLIENT/LABEL_FONTSIZE_LARGE']
            ], 'array', null, 'List of available font sizes (px)'),
            'DefaultFontSize' => new SettingsProperty('16', 'string', null, 'Font size (px) used by default when composing email message'),
        ];
    }
}
