define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil, ADSearchUtil) {
    var lang = getSysLang();

    return function modelUndeletedDevicesDetails() {
    

        //focus on first 
        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
         $('#btnDeletedBlacklisted').focus();
         $('#deviceModel').on('shown.bs.modal', function (e) {
             $('#btnDeletedBlacklisted').focus();
         });

        $('#deviceModel').keydown(function (e) {
            if ($('#btnDeletedBlacklisted').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#btnDeletedBlacklisted_Yes').focus();
            }
        });
        //---------------------------------------------------------------------------------------------------
        var self = this;
      
        
        self.undeleteCount = ko.observable();
        self.status = ko.observable();
        self.action = ko.observable('deleted');

        var undeletedCount = getAllSelectedDataCount('Devicejqxgrid');

        var status = globalVariableForDeviceSearch[0].Status;
        var serialNumber = globalVariableForDeviceSearch[0].SerialNumber;

        // open popup on status code 
        if (status == 'Deleted') {
            if (undeletedCount > 1) {
                //self.undeleteCount = undeletedCount;
                //$("#countMsgdeviceId").text(i18n.t('mul_delete_dev_file_alert', { undeletedCount: undeletedCount }, { lng: lang }));

                $("#countMsgdeviceId").text(i18n.t('delete_Multiple_Device_Confirmation', { lng: lang }));
            } else {
                if (serialNumber == '') {
                    $("#infoID").text(i18n.t('delete_Single_Device_Confirmation_without_SerialNumber', { lng: lang }));
                } else{
                    $("#infoID").text(i18n.t('are_you_sure_you_want_to_delete_this_device', { lng: lang }));
                }
            }
        }

        // deleted or Blacklist Devices
        self.deletedAndBlacklistDevicesDeviceSearch = function (gId, observableModelPopup) {
            var checkAll = checkAllSelected(gId);
            var SelectedIds = getSelectedUniqueId(gId);
            var unSelecedIds = getUnSelectedUniqueId(gId);
          

            var selectedItemsIds;
            var unSelecedItemsIds;
            var DeviceStatusUpdate;
            var deviceSearch;
            if (checkAll == 1) {
                selectedItemsIds = null;
                unSelecedItemsIds = unSelecedIds;
                DeviceStatusUpdate = null;
                deviceSearch = ADSearchUtil.deviceSearchObj;
            } else {
                selectedItemsIds = SelectedIds;
                unSelecedItemsIds = null;
                DeviceStatusUpdate = globalVariableForDeviceSearch;
                deviceSearch = null;
            }
            updateDeviceStatusfun(gId, status, observableModelPopup, selectedItemsIds, unSelecedItemsIds, DeviceStatusUpdate, deviceSearch)
        }

        seti18nResourceData(document, resourceStorage);
    }

    function updateDeviceStatusfun(gId, status, observableModelPopup, selectedItemsIds, unSelecedItemsIds, DeviceStatusUpdate, deviceSearch) {
        var deleteDeviceReq = new Object();
        var Selector = new Object();
        var DeviceList = new Object();

        Selector.SelectedItemIds = selectedItemsIds;
        deleteDeviceReq.DeviceList = DeviceStatusUpdate;
        deleteDeviceReq.DeviceSearch = deviceSearch;
        deleteDeviceReq.IsContinue = false;
        deleteDeviceReq.Status = status;
        deleteDeviceReq.UnSelectedItemIds = unSelecedItemsIds;

        deleteDeviceReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (status == 'Deleted') {
                        openAlertpopup(0, 'alert_device_delete_success');
                    }
                    observableModelPopup('unloadTemplate');
                    gridRefreshClearSelection(gId);
                } else if (data.responseStatus.StatusCode == AppConstants.get('EX_DEVICE_COUNT_EXCEED_UNDELETE')) {
                    //Remaining from backend
                } else if (data.responseStatus.StatusCode == AppConstants.get('EX_DEVICE_COUNT_EQUAL_LICENSE_COUNT_UNDELETE')) {
                    //Remaining from backend
                } else if (data.responseStatus.StatusCode == AppConstants.get('BLACKLISTE_DEVICES_NOT_UNDELETED')) {
                    openAlertpopup(2, 'alert_device_delete_success_without_blacklisted');
                } else if (data.responseStatus.StatusCode == AppConstants.get('MODIFY_DEVICE')) {
                    openAlertpopup(1, data.responseStatus.StatusMessage);
                } 
            }
        }
        var method = 'DeleteDevice';
        var params = '{"token":"' + TOKEN() + '","deleteDeviceReq":' + JSON.stringify(deleteDeviceReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true)
    }
});