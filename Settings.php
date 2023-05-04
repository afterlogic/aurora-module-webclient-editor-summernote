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
 * @property int $DefaultFontSize
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
            'DefaultFontSize' => new SettingsProperty(16, 'int', null, 'Font size (px) used by default when composing email message'),
        ];
    }
}
