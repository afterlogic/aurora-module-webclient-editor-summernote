<?php
/**
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\EditorSummernoteWebclient;

use Aurora\Api;
use Aurora\System\Enums\UserRole;

/**
 * Module provides Summernote HTML editor.
 *
 * @license https://www.gnu.org/licenses/agpl-3.0.html AGPL-3.0
 * @license https://afterlogic.com/products/common-licensing Afterlogic Software License
 * @copyright Copyright (c) 2023, Afterlogic Corp.
 *
 * @package Modules
 */
class Module extends \Aurora\System\Module\AbstractModule
{
    /**
     *
     * @return Module
     */
    public static function getInstance()
    {
        return parent::getInstance();
    }

    /**
     *
     * @return Module
     */
    public static function Decorator()
    {
        return parent::Decorator();
    }


    /***** private functions *****/
    /**
     * Initializes EditorSummernoteWebclient Module.
     *
     * @ignore
     */
    public function init()
    {

    }
    /***** private functions *****/

    /***** public functions might be called with web API *****/
    /**
     * @api {post} ?/Api/ GetSettings
     * @apiName GetSettings
     * @apiGroup EditorSummernoteWebclient
     * @apiDescription Obtains list of module settings.
     *
     * @apiParam {string=EditorSummernoteWebclient} Module Module name.
     * @apiParam {string=GetSettings} Method Method name.
     *
     * @apiParamExample {json} Request-Example:
     * {
     *   Module: 'EditorSummernoteWebclient',
     *   Method: 'GetSettings'
     * }
     *
     * @apiSuccess {object[]} Result Array of response objects.
     * @apiSuccess {string} Result.Module Module name.
     * @apiSuccess {string} Result.Method Method name.
     * @apiSuccess {mixed} Result.Result List of module settings in case of success, otherwise **false**.
     * @apiSuccess {bool} Result.Result.AllowChangeInputDirection Enables switching between RTL and LTR input directions
     * @apiSuccess {bool} Result.Result.AllowEditHtmlSource If set true, HTML source code editing is added to HTML editor
     * @apiSuccess {array} Result.Result.FontNames List of available font names
     * @apiSuccess {string} Result.Result.DefaultFontName Font name used by default when composing email message
     * @apiSuccess {string} Result.Result.DefaultFontSize Date format.
     * @apiSuccess {int} [Result.ErrorCode] Error code.
     *
     * @apiSuccessExample {json} Success response example:
     * {
     *   Module: 'EditorSummernoteWebclient',
     *   Method: 'GetSettings',
     *   Result: { AllowEditHtmlSource: false, AllowEditHtmlSource: true, FontNames: ['Arial', 'Tahoma', 'Verdana', 'Courier New'], DefaultFontName: 'Arial',
     *             DefaultFontSize: 12 }
     * }
     *
     * @apiSuccessExample {json} Error response example:
     * {
     *   Module: 'EditorSummernoteWebclient',
     *   Method: 'GetSettings',
     *   Result: false,
     *   ErrorCode: 102
     * }
     */
    /**
     * Obtains list of module settings.
     *
     * @return array
     */
    public function GetSettings()
    {
        Api::checkUserRoleIsAtLeast(UserRole::Anonymous);
        return array(
            'AllowEditHtmlSource' => $this->getConfig('AllowEditHtmlSource', false),
            'AllowChangeInputDirection' => $this->getConfig('AllowChangeInputDirection', ['Arial', 'Tahoma', 'Verdana', 'Courier New']),
            'FontNames' => $this->getConfig('FontNames', false),
            'DefaultFontName' => $this->getConfig('DefaultFontName', 'Arial'),
            'DefaultFontSize' => $this->getConfig('DefaultFontSize', '12'),
        );
    }
    /***** public functions might be called with web API *****/
}
