define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, ADSearchUtil) {

    return function ExportToRSACertViewModel() {

        ko.validation.init({
            decorateElement: true,
            errorElementClass: 'err',
            insertMessages: false
        });

        var self = this;
        $('#mdlExportToRSACertHeader').mouseup(function () {
            $("#mdlExportToRSACert").draggable({ disabled: true });
        });

        $('#mdlExportToRSACertHeader').mousedown(function () {
            $("#mdlExportToRSACert").draggable({ disabled: false });
        });
        self.ExportRSASaveClicked = function (gridId, unloadTempPopup, refereshHierarchyfordeviceProfile) {
            ExportToRSACert(gridId, unloadTempPopup, refereshHierarchyfordeviceProfile);
        }
        seti18nResourceData(document, resourceStorage);
    }

    function ExportToRSACert(gridId, unloadTempPopup, refereshHierarchyfordeviceProfile) {
        var selectedIds = getSelectedUniqueId(gridId);
        var unSelectedIds = getUnSelectedUniqueId(gridId);
        var exportVRKCertificatesReq = new Object();
        var Selector = new Object();
        var checkcount = new Array();

        if (ADSearchUtil.AdScreenName == 'deviceSearch') {
            exportVRKCertificatesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
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
            exportVRKCertificatesReq.DeviceSearch = null;
            Selector.SelectedItemIds = DeviceIds;
            Selector.UnSelectedItemIds = null;
        }

        exportVRKCertificatesReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
        exportVRKCertificatesReq.Selector = Selector;
        exportVRKCertificatesReq.ExportedFileName = $('#txtZipname').val();

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    $('#deviceModel').modal('hide');
                    unloadTempPopup;
                    gridRefresh(gridId);
                    openAlertpopup(1, 'export_Sucess');
                } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                    Token_Expired();
                }
            } else if (error) {

                openAlertpopup(2, 'network_error');
            }
        }

        var method = 'ExportVRKCertificates';
        var params = '{"token":"' + TOKEN() + '","exportVRKCertificatesReq":' + JSON.stringify(exportVRKCertificatesReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});