define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil, ADSearchUtil) {
    var lang = getSysLang();

    return function modelUndeletedDevicesDetails() {

        //focus on first btn
        $('#btnNoDeleteBlacklist').focus();
        $('#deviceModel').on('shown.bs.modal', function () {
            $('#btnNoDeleteBlacklist').focus();
        });

        $('#deviceModel').keydown(function (e) {
            if ($('#btnNoDeleteBlacklist').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#btnYesDeleteBlacklist').focus();
            }
        });

        $('#modalDeleteBlacklistContent').mouseup(function () {
            $("#modalDeleteBlacklist").draggable({ disabled: true });
        });

        $('#modalDeleteBlacklistContent').mousedown(function () {
            $("#modalDeleteBlacklist").draggable({ disabled: false });
        });

        var self = this;
        self.status = ko.observable();
        var undeletedCount = getAllSelectedDataCount('jqxgridDeletedDevices');

        if (!_.isEmpty(globalVariableForDeletedandBlacklistedDevices) && globalVariableForDeletedandBlacklistedDevices.length > 0) {
            self.status = globalVariableForDeletedandBlacklistedDevices[0].Status;
        } else {
            self.status = deviceStatusLabel;
        }

        if (self.status === AppConstants.get('UNDELETED')) {
            $("#titleText").text(i18n.t('confirmation_title', { lng: lang }));
            if (undeletedCount > 1) {
                $("#confirmationMessage").text(i18n.t('undelete_multiple_devices', { undeleteCount: undeletedCount }, { lng: lang }));
            } else {
                $("#confirmationMessage").text(i18n.t('undelete_single_device', { lng: lang }));
            }
        } else if (self.status === AppConstants.get('BLACKLISTED')) {
            $("#titleText").text(i18n.t('confirmation_title', { lng: lang }));
            if (undeletedCount > 1) {
                $("#confirmationMessage").text(i18n.t('blacklist_multiple_devices', { undeleteCount: undeletedCount }, { lng: lang }));
            } else {
                $("#confirmationMessage").text(i18n.t('blacklist_single_device', { lng: lang }));
            }
        } else if (self.status === AppConstants.get('PERMANENT_DELETE')) {
            getWarningAlert();
        }

        function getWarningAlert() {
            $("#alertIcon").removeClass('icon-confirmation c-green');
            $("#alertIcon").addClass('icon-warning c-red');
            $("#titleText").removeClass('c-green');
            $("#titleText").addClass('c-red');
            $("#btnYesDeleteBlacklist").removeClass('btn-success');
            $("#btnYesDeleteBlacklist").addClass('btn-danger');
            $("#titleText").text(i18n.t('warning_title', { lng: lang }));
            $("#confirmationMessage").text(i18n.t('permanent_delete_device', { lng: lang }));
        }

        self.deletedAndBlacklistDevices = function (gId, observableModelPopup) {
            var checkAll = checkAllSelected(gId);
            var selectedItemsIds = getSelectedUniqueId(gId);
            var unSelecedItemsIds = getUnSelectedUniqueId(gId);
            var DeviceStatusUpdate = new Array();
            var deviceSearch = new Object();
            var selectedId = (!_.isEmpty(selectedItemsIds) && selectedItemsIds.length > 0) ? selectedItemsIds[0] : 0;

            if (checkAll == 1) {
                selectedItemsIds = null;
                DeviceStatusUpdate = null;
                deviceSearch = ADSearchUtil.deviceSearchObj;
            } else {
                unSelecedItemsIds = null;
                DeviceStatusUpdate = globalVariableForDeletedandBlacklistedDevices;
                deviceSearch = null;
            }
            if (self.status === AppConstants.get('UNDELETED')) {
                unDeleteDevice(gId, observableModelPopup, self.status, selectedItemsIds, unSelecedItemsIds, DeviceStatusUpdate, deviceSearch);
            } else if (self.status === AppConstants.get('BLACKLISTED')) {
                blacklistDevice(gId, observableModelPopup, self.status, selectedItemsIds, unSelecedItemsIds, DeviceStatusUpdate, deviceSearch);
            } else if (self.status === AppConstants.get('PERMANENT_DELETE')) {
                permanentDeleteDevice(gId, observableModelPopup, selectedId);
            }
        }

        function unDeleteDevice(gId, observableModelPopup, status, selectedItemsIds, unSelecedItemsIds, DeviceStatusUpdate, deviceSearch) {
            var updateDeviceStatusReq = new Object();
            var Selector = new Object();

            Selector.SelectedItemIds = selectedItemsIds;
            updateDeviceStatusReq.DeviceList = DeviceStatusUpdate;
            updateDeviceStatusReq.DeviceSearch = deviceSearch;
            updateDeviceStatusReq.IsContinue = false;
            updateDeviceStatusReq.Status = status;
            updateDeviceStatusReq.UnSelectedItemIds = unSelecedItemsIds;
            updateDeviceStatusReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

            var callBackfunction = function (data, error) {
                observableModelPopup('unloadTemplate');
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        gridRefreshClearSelection(gId);
                        openAlertpopup(0, 'device_undelete_success');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('EX_DEVICE_COUNT_EXCEED_UNDELETE')) {
                        //Remaining from backend
                    } else if (data.responseStatus.StatusCode == AppConstants.get('EX_DEVICE_COUNT_EQUAL_LICENSE_COUNT_UNDELETE')) {
                        //Remaining from backend
                    } else if (data.responseStatus.StatusCode == AppConstants.get('BLACKLISTE_DEVICES_NOT_UNDELETED')) {
                        gridRefreshClearSelection(gId);
                        openAlertpopup(0, 'alert_device_delete_success_without_blacklisted');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('MODIFY_DEVICE')) {
                        openAlertpopup(1, data.responseStatus.StatusMessage);
                    }
                }
            }
            var method = 'UpdateDeviceStatus';
            var params = '{"token":"' + TOKEN() + '","updateDeviceStatusReq":' + JSON.stringify(updateDeviceStatusReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        function blacklistDevice(gId, observableModelPopup, status, selectedItemsIds, unSelecedItemsIds, DeviceStatusUpdate, deviceSearch) {
            var deleteDeviceReq = new Object();
            var Selector = new Object();

            Selector.SelectedItemIds = selectedItemsIds;
            deleteDeviceReq.DeviceList = DeviceStatusUpdate;
            deleteDeviceReq.DeviceSearch = deviceSearch;
            deleteDeviceReq.IsContinue = false;
            deleteDeviceReq.Status = status;
            deleteDeviceReq.UnSelectedItemIds = unSelecedItemsIds;
            deleteDeviceReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

            var callBackfunction = function (data, error) {
                observableModelPopup('unloadTemplate');
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        gridRefreshClearSelection(gId);
                        openAlertpopup(0, 'device_blacklist_success');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('EX_DEVICE_COUNT_EXCEED_UNDELETE')) {
                        //Remaining from backend
                    } else if (data.responseStatus.StatusCode == AppConstants.get('EX_DEVICE_COUNT_EQUAL_LICENSE_COUNT_UNDELETE')) {
                        //Remaining from backend
                    } else if (data.responseStatus.StatusCode == AppConstants.get('BLACKLISTE_DEVICES_NOT_UNDELETED')) {
                        gridRefreshClearSelection(gId);
                        openAlertpopup(0, 'alert_device_delete_success_without_blacklisted');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('MODIFY_DEVICE')) {
                        openAlertpopup(1, data.responseStatus.StatusMessage);
                    }
                }
            }
            var method = 'DeleteDevice';
            var params = '{"token":"' + TOKEN() + '","deleteDeviceReq":' + JSON.stringify(deleteDeviceReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        function permanentDeleteDevice(gId, observableModelPopup, selectedUniqueDeviceId) {
            var permanentDeleteDeviceReq = new Object();
            permanentDeleteDeviceReq.UniqueDeviceId = selectedUniqueDeviceId;

            var callBackfunction = function (data, error) {
                observableModelPopup('unloadTemplate');
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        gridRefreshClearSelection(gId);
                        openAlertpopup(0, 'permanent_delete_device_success');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('EX_DB_ERROR_WHILE_DELETE_DEVICE')) {
                        openAlertpopup(2, 'ex_db_error_while_delete_device');
                    }
                }
            }

            var method = 'PermanentDeleteDevice';
            var params = '{"token":"' + TOKEN() + '","permanentDeleteDeviceReq":' + JSON.stringify(permanentDeleteDeviceReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true)
        }

        seti18nResourceData(document, resourceStorage);
    }
});