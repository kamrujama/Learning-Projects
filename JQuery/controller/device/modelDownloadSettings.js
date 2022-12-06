define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, ADSearchUtil) {

    return function DownloadSettingsViewModel() {

        ko.validation.init({
            decorateElement: true,
            errorElementClass: 'err',
            insertMessages: false
        });

        $("#rbtnNoneSingleSession").prop('checked', true);
        $("#rbtnEnableSingleSession").prop('disabled', true);
        $("#rbtnDisableSingleSession").prop('disabled', true);
        $("#rbtnNoneCallbackImmediate").prop('checked', true);
        $("#rbtnEnableCallbackImmediate").prop('disabled', true);
        $("#rbtnDisableCallbackImmediate").prop('disabled', true);
        $("#btnSaveDownloadSettings").prop('disabled', true);

        if (ADSearchUtil.AdScreenName == 'deviceProfile') {
            if (koUtil.IsDldSingleSession != null) {
                if (koUtil.IsDldSingleSession == true) {
                    $("#rbtnEnableSingleSession").prop('checked', true);
                }
                else if (koUtil.IsDldSingleSession == false) {
                    $("#rbtnDisableSingleSession").prop('checked', true);
                }
            }
            if (koUtil.IsCallbackImmediate != null) {
                if (koUtil.IsCallbackImmediate == true) {
                    $("#rbtnEnableCallbackImmediate").prop('checked', true);
                }
                else if (koUtil.IsCallbackImmediate == false) {
                    $("#rbtnDisableCallbackImmediate").prop('checked', true);
                }
            }
        }

        var self = this;
        $('#mdlExportToDownloadSettingsHeader').mouseup(function () {
            $("#mdlExportToDownloadSettings").draggable({ disabled: true });
        });

        $('#mdlExportToDownloadSettingsHeader').mousedown(function () {
            $("#mdlExportToDownloadSettings").draggable({ disabled: false });
        });
        self.SaveClicked = function (gridId, unloadTempPopup, refereshHierarchyfordeviceProfile) {
            SetDownloadSettingOptions(gridId, unloadTempPopup, refereshHierarchyfordeviceProfile);
        }

        $("#chkSingleSession").on('change', function (e) {
            if ($("#chkCallbackImmediate").is(':checked') || $("#chkSingleSession").is(':checked'))
                $("#btnSaveDownloadSettings").prop('disabled', false);
            else
                $("#btnSaveDownloadSettings").prop('disabled', true);

            if ($("#chkSingleSession").is(':checked')) {
                //$("#rbtnNoneSingleSession").prop('checked', true);
                $("#rbtnEnableSingleSession").prop('disabled', false);
                $("#rbtnDisableSingleSession").prop('disabled', false);
                
            }
            else {
                //$("#rbtnNoneSingleSession").prop('checked', true);
                $("#rbtnEnableSingleSession").prop('disabled', true);
                $("#rbtnDisableSingleSession").prop('disabled', true);
                $("#rbtnEnableSingleSession").prop('checked', koUtil.IsDldSingleSession);
                $("#rbtnDisableSingleSession").prop('checked', koUtil.IsDldSingleSession);
            }
        });

        $("#chkCallbackImmediate").on('change', function (e) {
            if ($("#chkCallbackImmediate").is(':checked') || $("#chkSingleSession").is(':checked'))
                $("#btnSaveDownloadSettings").prop('disabled', false);
            else
                $("#btnSaveDownloadSettings").prop('disabled', true);

            if ($("#chkCallbackImmediate").is(':checked')) {
                //$("#rbtnNoneCallbackImmediate").prop('checked', true);
                $("#rbtnEnableCallbackImmediate").prop('disabled', false);
                $("#rbtnDisableCallbackImmediate").prop('disabled', false);
            }
            else {
                //$("#rbtnNoneCallbackImmediate").prop('checked', true);
                $("#rbtnEnableCallbackImmediate").prop('disabled', true);
                $("#rbtnDisableCallbackImmediate").prop('disabled', true);
                $("#rbtnEnableCallbackImmediate").prop('checked', koUtil.IsCallbackImmediate);
                $("#rbtnDisableCallbackImmediate").prop('checked', koUtil.IsCallbackImmediate);
            }
        });
        seti18nResourceData(document, resourceStorage);
    }

    function SetDownloadSettingOptions(gridId, unloadTempPopup, refereshHierarchyfordeviceProfile) {
        var selectedIds = getSelectedUniqueId(gridId);
        var unSelectedIds = getUnSelectedUniqueId(gridId);
        var setDownloadSettingOptionsReq = new Object();
        var Selector = new Object();
        var checkcount = new Array();

        if (ADSearchUtil.AdScreenName == 'deviceSearch') {
            setDownloadSettingOptionsReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
            if (checkAllSelected(gridId) == 1) {
                Selector.SelectedItemIds = null;
                Selector.UnSelectedItemIds = unSelectedIds;
                checkcount = ["allcheck"];
            } else {
                Selector.SelectedItemIds = selectedIds;
                Selector.UnSelectedItemIds = null;
                checkcount = selectedIds;
            }
        }
        else if (ADSearchUtil.AdScreenName == 'deviceProfile') {
            var DeviceIds = new Array()
            DeviceIds.push(koUtil.deviceProfileUniqueDeviceId);
            setDownloadSettingOptionsReq.DeviceSearch = null;
            Selector.SelectedItemIds = DeviceIds;
            Selector.UnSelectedItemIds = null;
        }

        var isSingleSessionDownload = ENUM.get("None_DownloadSettings");
        var isCallbackImmediate = ENUM.get("None_DownloadSettings");


        if ($("#chkSingleSession").is(':checked')) {
            if ($("#rbtnEnableSingleSession").is(':checked')) {
                isSingleSessionDownload = ENUM.get("Enable_DownloadSettings");
            }
            else if ($("#rbtnDisableSingleSession").is(':checked')) {
                isSingleSessionDownload = ENUM.get("Disable_DownloadSettings");
            }
            else if ($("#rbtnNoneSingleSession").is(':checked')) {
                isSingleSessionDownload = ENUM.get("None_DownloadSettings");
            }
        }

        if ($("#chkCallbackImmediate").is(':checked')) {
            if ($("#rbtnEnableCallbackImmediate").is(':checked')) {
                isCallbackImmediate = ENUM.get("Enable_DownloadSettings");
            }
            else if ($("#rbtnDisableCallbackImmediate").is(':checked')) {
                isCallbackImmediate = ENUM.get("Disable_DownloadSettings");
            }
            else if ($("#rbtnNoneCallbackImmediate").is(':checked')) {
                isCallbackImmediate = ENUM.get("None_DownloadSettings");
            }
        }

        setDownloadSettingOptionsReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
        setDownloadSettingOptionsReq.IsSingleSessionDownload = isSingleSessionDownload;
        setDownloadSettingOptionsReq.IsCallbackImmediate = isCallbackImmediate;
        setDownloadSettingOptionsReq.Selector = Selector;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    $('#deviceModel').modal('hide');
                    unloadTempPopup;
                    if (gridId != null) {
                        gridFilterClear(gridId);
                    }
                    if (ADSearchUtil.AdScreenName == 'deviceProfile')
                        refereshHierarchyfordeviceProfile();
					openAlertpopup(0, 'download_settings_success');
                } 
            }
        }

        var method = 'SetDownloadSettingOptions';
        var params = '{"token":"' + TOKEN() + '","setDownloadSettingOptionsReq":' + JSON.stringify(setDownloadSettingOptionsReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});