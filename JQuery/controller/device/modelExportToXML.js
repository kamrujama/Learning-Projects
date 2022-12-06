define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, ADSearchUtil) {

    return function ExportToXMLViewModel() {

        ko.validation.init({
            decorateElement: true,
            errorElementClass: 'err',
            insertMessages: false
        });


        var self = this;
        $('#mdlExportToXmlHeader').mouseup(function () {
            $("#mdlExportToXml").draggable({ disabled: true });
        });

        $('#mdlExportToXmlHeader').mousedown(function () {
            $("#mdlExportToXml").draggable({ disabled: false });
        });

        self.ExportClicked = function (unloadTempPopup) {
            ExportDeviceDetailsToXML(unloadTempPopup);
        }
        seti18nResourceData(document, resourceStorage);
    }
    
    function ExportDeviceDetailsToXML(gridId, unloadTempPopup) {
        var selectedIds = getSelectedUniqueId(gridId);
        var unSelectedIds = getUnSelectedUniqueId(gridId);
        var exportDeviceDetailsToXMLReq = new Object();
        var Export = new Object();
        var Selector = new Object();
        var ColumnSortFilter = new Object();
        var checkcount = new Array();
        if (checkAllSelected(gridId) == 1) {
            Export.IsAllSelected = true;
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unSelectedIds;
            checkcount = ["allcheck"];
            exportDeviceDetailsToXMLReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
        } else {
            Export.IsAllSelected = false;
            Selector.SelectedItemIds = selectedIds;
            Selector.UnSelectedItemIds = null;
            checkcount = selectedIds;
            exportDeviceDetailsToXMLReq.DeviceSearch = null;
        }

        Export.IsExport = true;
        ColumnSortFilter.FilterList = null;
        ColumnSortFilter.SortList = null;

        var isHierarchiesChecked = false;
        var isGroupChecked;
        var isSoftwareChecked;
        var isSoftwareNParameterChecked;

        if ($("#chkHierarchies").is(':checked')) {
            isHierarchiesChecked = true;
        } else {
            isHierarchiesChecked = false;
        }

        if ($("#chkGroup").is(':checked')) {
            isGroupChecked = true;
        } else {
            isGroupChecked = false;
        }

        if ($("#chkSwAssignment").is(':checked')) {
            isSoftwareChecked = true;
        } else {
            isSoftwareChecked = false;
        }

        if ($("#chkSoftwareAssignmentNParametere").is(':checked')) {
            isSoftwareNParameterChecked = true;
        } else {
            isSoftwareNParameterChecked = false;
        }

        exportDeviceDetailsToXMLReq.ColumnSortFilter = ColumnSortFilter;
        //exportDeviceDetailsToXMLReq.DeviceSearch = null;
        exportDeviceDetailsToXMLReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
        exportDeviceDetailsToXMLReq.Export = Export;
        exportDeviceDetailsToXMLReq.IncludeGroups = isGroupChecked;
        exportDeviceDetailsToXMLReq.IncludeHierarchies = isHierarchiesChecked;
        exportDeviceDetailsToXMLReq.IncludeSW = isSoftwareChecked;
        exportDeviceDetailsToXMLReq.IncludeSWAndParam = isSoftwareNParameterChecked;
        exportDeviceDetailsToXMLReq.Selector = Selector;


        exportDeviceDetailsToXMLReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    $('#deviceModel').modal('hide');
                    unloadTempPopup;
                    gridRefresh(gridId);
                    openAlertpopup(1, 'export_Sucess');
                } 
            }
        }

        var method = 'ExportDeviceDetailsToXML';
        var params = '{"token":"' + TOKEN() + '","exportDeviceDetailsToXMLReq":' + JSON.stringify(exportDeviceDetailsToXMLReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});