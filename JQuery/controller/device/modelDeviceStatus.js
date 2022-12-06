define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();

    return function modelUndeletedDevicesDetails() {
      
        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#deviceStatusConfo_No').focus();
        $('#deviceModel').on('shown.bs.modal', function (e) {
            $('#deviceStatusConfo_No').focus();

        });

        $('#deviceModel').keydown(function (e) {
            if ($('#deviceStatusConfo_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#deviceStatusConfo_Yes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------

        $('#modelDeviceStatusContent').mouseup(function () {
            $("#modelDeviceStatus").draggable({ disabled: true });
        });

        $('#modelDeviceStatusContent').mousedown(function () {
            $("#modelDeviceStatus").draggable({ disabled: false });
        });


        self.undeleteCount = ko.observable();
        self.status = ko.observable();
        self.action = ko.observable('deleted');

        var selectedDevicesCount = getAllSelectedDataCount('Devicejqxgrid');
        var status = globalVariableForDeviceSearchStatus[0].Status;
        var computedDeviceStatus = globalVariableForDeviceSearchStatus[0].ComputedDeviceStatus

        var dataId = koUtil.globalSubStatus;
        var deviceSubStatusName = selectedArr[0].SubStatus;
        var source = _.where(selectedArr, { "SubStatus": dataId });

        // open popup on status code 
        if (selectedDevicesCount == 1) {
            if (status == "1") {
                if (computedDeviceStatus == "Pending Registration") {
                    $("#countMsgId").text(i18n.t('change_device_status_from_pending_registartion', { lng: lang }));

                } else {
                    $("#countMsgId").text(i18n.t('change_device_status_to_active', { lng: lang }));
                }
            } else if (status == "2") {
                if (subStatusData.length == 0) {
                    if (computedDeviceStatus == "Inactive") {
                        openAlertpopup(1, 'Selected Device is already in Inactive State.');
                    } else if (computedDeviceStatus == "Active") {
                        $("#countMsgId").text(i18n.t('change_device_status_to_inactive', { lng: lang }));
                    } else {
                        $("#countMsgId").text(i18n.t('change_device_status_from_pending_registartion', { lng: lang }));
                    }
                } else {
                    if (computedDeviceStatus == "Inactive") {
                        if (koUtil.globalSubStatus == deviceSubStatusName) {
                            return;
                        }
                        if (koUtil.globalSubStatus == "--No-Sub-Status--" && deviceSubStatusName == '') {
                            return;
                        } else if (koUtil.globalSubStatus != "--No-Sub-Status--") {
                            $("#countMsgId").text(i18n.t('change_device_status_to_inactive_sub', { subStatusName: koUtil.globalSubStatus }, { lng: lang }));
                        } else {
                            $("#countMsgId").text(i18n.t('change_device_status_to_inactive', { lng: lang }));
                        }
                    } else if (computedDeviceStatus == "Pending Registration") {
                        $("#countMsgId").text(i18n.t('change_device_status_from_pending_registartion', { lng: lang }));
                    } else if (computedDeviceStatus == "Active") {
                        var subStatusName = koUtil.globalSubStatus;
                        if (subStatusName != "--No-Sub-Status--") {
                            $("#countMsgId").text(i18n.t('change_device_status_to_inactive_sub', { subStatusName: subStatusName }, { lng: lang }));
                        } else {
                            $("#countMsgId").text(i18n.t('change_device_status_to_inactive', { lng: lang }));
                        }
                    } else {
                        var subStatusName = koUtil.globalSubStatus;
                        $("#countMsgId").text(i18n.t('change_device_status_to_inactive_sub', { subStatusName: subStatusName }, { lng: lang }));
                    }
                }
            } else if (status == "3") {
                if (computedDeviceStatus == "Pending Registration") {
                    $("#countMsgId").text(i18n.t('change_device_status_to_pending_resgistration', { lng: lang }));
                }
                else if (computedDeviceStatus == "Active") {
                    $("#countMsgId").text(i18n.t('Are_you_sure_you_want_to_change_the_status_to_Pending_Registration', { lng: lang }));

                } if (computedDeviceStatus == "Inactive") {
                    $("#countMsgId").text(i18n.t('Are_you_sure_you_want_to_change_the_status_to_Pending_Registration', { lng: lang }));

                } else {
                    $("#countMsgId").text(i18n.t('change_status_to_pending_registartion', { lng: lang }));
                }
            }
        } else {
            $("#countMsgId").text(i18n.t('change_device_status_for_multiple_devices', { lng: lang }));
        }


        // deleted or Blacklist Devices
        self.changeStatusDeviceSearch = function (gID, observableModelPopup) {
            var checkAll = checkAllSelected(gID);
            var SelectedIds = getSelectedUniqueId(gID);
            var unSelecedIds = getUnSelectedUniqueId(gID);

            var selectedItemsIds;
            var unSelecedItemsIds;

            if (checkAll == 1) {
                selectedItemsIds = null;
                unSelecedItemsIds = unSelecedIds;

            } else {
                selectedItemsIds = SelectedIds;
                unSelecedItemsIds = null;
            }
            var status = globalVariableForDeviceSearchStatus[0].Status;
            updateDeviceStatusfun(gID, status, observableModelPopup, selectedItemsIds, unSelecedItemsIds)
        }
        seti18nResourceData(document, resourceStorage);
    }

    function updateDeviceStatusfun(gID, status, observableModelPopup, selectedItemsIds, unSelecedItemsIds) {

        var updateDeviceReq = new Object();
        var Selector = new Object();
        var device = new Object();
        var subStatus = new Object();
        device.Status = status;

        Selector.SelectedItemIds = selectedItemsIds;
        Selector.UnSelectedItemIds = unSelecedItemsIds;
        updateDeviceReq.Device = device;

        var adStorage = JSON.parse(sessionStorage.getItem(gID + "adStorage"));
        if (adStorage)
            updateDeviceReq.DeviceSearch = adStorage[0].adSearchObj;
        else
            updateDeviceReq.DeviceSearch = null;
        subStatus.SubStatusId = koUtil.globalSubStatusId;
        subStatus.SubStatusName = koUtil.globalSubStatus;
        updateDeviceReq.Selector = Selector;
        updateDeviceReq.SubStatus = subStatus;

        updateDeviceReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'device_status_successfully_changed');
                    observableModelPopup('unloadTemplate');
                    gridRefreshClearSelection(gID);
                } else if (data.responseStatus.StatusCode == AppConstants.get('MODIFY_DEVICE')) {
                    openAlertpopup(1, 'some_devices_refresh');
                }
            }
        }
        var method = 'UpdateDevice';
        var params = '{"token":"' + TOKEN() + '","updateDeviceReq":' + JSON.stringify(updateDeviceReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true)
    }
});