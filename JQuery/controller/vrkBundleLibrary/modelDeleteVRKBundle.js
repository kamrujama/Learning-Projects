define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();

    return function modelDeleteContentLibrary() {
      
        var self = this;
        self.bundleName = ko.observable();
        self.bundleCount = ko.observable();
        var deleteCount = getAllSelectedDataCount('jqxgridVRKBundlesLib');
        if (deleteCount > 1) {
            self.bundleCount = deleteCount;
            $("#deleteCountId").text(i18n.t('mul_delete_lib_file_VRKBundle', { bundleCount: deleteCount }, { lng: lang }))
        } else {
            self.bundleName = globalVariableForEditBundle[0].BundleName;
            var displayBundleName = self.bundleName;           
            $("#deleteMsgId").text(i18n.t('delete_lib_file_VRKBundle', { bundleName: displayBundleName }, { lng: lang }));
        }

        //click on yes button to delete library
        self.deleteLibrary = function (observableModelPopup) {
            var selecteItemIds = new Array();
            var unSelectedIds = '';

            var VRKBundleLitesArray = globalVariableForEditBundle[0].selectedData;
            var isAllSelected = false;
            if (globalVariableForEditBundle[0].checkAll == 1) {
                selecteItemIds = null;
                unSelectedIds = globalVariableForEditBundle[0].unSelecedRowID;
                isAllSelected = true;
            } else {
                for (var i = 0; i < VRKBundleLitesArray.length; i++) {
                    if (VRKBundleLitesArray[i].Status == "Complete" || VRKBundleLitesArray[i].Status == "Not Scheduled") {
                        var obj = new Object();
                        obj.BundleFile = VRKBundleLitesArray[i].BundleFile;
                        obj.BundleId = VRKBundleLitesArray[i].VRKBundleId;
                        obj.BundleName = VRKBundleLitesArray[i].BundleName;
                        obj.FileRepoId = VRKBundleLitesArray[i].FileRepoId;
                        selecteItemIds.push(obj);
                    }
                }
                //selecteItemIds = globalVariableForEditBundle[0].selectedRowID;
                unSelectedIds = null;
                isAllSelected = false;
            }
            deleteVRKBundle(selecteItemIds, unSelectedIds, observableModelPopup,isAllSelected);
        }
        seti18nResourceData(document, resourceStorage);
    };

    // for delete VRK Bundle library
    function deleteVRKBundle(selecteItemIds, unSelectedIds, observableModelPopup, isAllSelected) {
        var deleteVRKBundleReq = new Object();
        deleteVRKBundleReq.VRKBundleLites = selecteItemIds;
        deleteVRKBundleReq.UnSelectedItemIds = unSelectedIds;
        deleteVRKBundleReq.IsAllSelected = isAllSelected;
        deleteVRKBundleReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    gridRefreshClearSelection('jqxgridVRKBundlesLib');
                    $('#downloadModel').modal('hide');
                    observableModelPopup('unloadTemplate');
                    openAlertpopup(0, 'alert_bunble_delete_success');
                } 
            }
        }
        var method = 'DeleteVRKBundle';
        var params = '{"token":"' + TOKEN() + '","deleteVRKBundleReq":' + JSON.stringify(deleteVRKBundleReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});