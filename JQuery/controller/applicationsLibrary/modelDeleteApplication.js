define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();

    return function modelDeleteContentLibrary() {
   

        var self = this;
        self.applicationName = ko.observable();
        self.applicationCount = ko.observable();
        var deleteCount = getAllSelectedDataCount('jqxgridApplications');
        if (deleteCount > 1) {
            self.applicationCount = deleteCount;
            $("#deleteCountId").text(i18n.t('mul_delete_lib_file_application', { applicationCount: deleteCount }, { lng: lang }))
        } else {
            self.applicationName = globalVariableForEditApplication[0].Application;
            var displayApplicationName = self.applicationName;
            $("#deleteMsgId").text(i18n.t('delete_lib_file_application', { application: displayApplicationName }, { lng: lang }));
        }

        var isContinue = false;
        //click on yes button to delete library
        self.deleteApplications = function (observableModelPopup) {
            var selecteItemIds = new Array();
            var unSelectedIds = '';
            if (globalVariableForEditApplication[0].checkAll == 1) {
                selecteItemIds = null;
                unSelectedIds = globalVariableForEditApplication[0].unSelecedRowID;
            } else {
                selecteItemIds = globalVariableForEditApplication[0].selectedRowID;
                unSelectedIds = null;
            }

            var deleteApplicationsReq = new Object();
            deleteApplicationsReq.Selector = new Object();
            deleteApplicationsReq.Selector.SelectedItemIds = selecteItemIds;
            deleteApplicationsReq.Selector.UnSelectedItemIds = unSelectedIds;
            deleteApplicationsReq.IsDeleteApp = isContinue;
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        gridFilterClear('jqxgridApplications');
                        $('#downloadModel').modal('hide');
                        observableModelPopup('unloadTemplate');
                        openAlertpopup(0, 'app_library_delete_success');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('CANNOT_DELETE_APPLICATION')) {
                        //if (self.applicationCount > 1) {
                        //    $("#deleteCountId").text(i18n.t('app_library_app_delete_confirmation', { lng: lang }))
                        //} else {
                        //    $("#deleteMsgId").text(i18n.t('app_library_app_delete_confirmation', { lng: lang }));
                        //}
                        //isContinue = true;
                        openAlertpopup(1, 'app_library_cannot_delete');
                    } 
                }
            }
            var method = 'DeleteApplications';
            var params = '{"token":"' + TOKEN() + '","deleteApplicationsReq":' + JSON.stringify(deleteApplicationsReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
            //deleteApplications(selecteItemIds, unSelectedIds, observableModelPopup);
        }

        seti18nResourceData(document, resourceStorage);
    };

    // for delete VRK Bundle library
    function deleteApplications(selecteItemIds, unSelectedIds, observableModelPopup) {
        var deleteApplicationsReq = new Object();
        deleteApplicationsReq.Selecter = new Object();

        var checkAll = checkAllSelected("jqxgridApplications");

        if (checkAll == 1) {
            deleteApplicationsReq.SelectedItemIds = null;
            deleteApplicationsReq.UnSelectedItemIds = unSelectedIds;
        } else {
            deleteApplicationsReq.SelectedItemIds = selecteItemIds;
            deleteApplicationsReq.UnSelectedItemIds = null;
        }
        deleteApplicationsReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    gridFilterClear('jqxgridApplications');
                    $('#downloadModel').modal('hide');
                    observableModelPopup('unloadTemplate');
                    openAlertpopup(0, 'alert_bunble_delete_success');
                } else if (data.responseStatus.StatusCode == AppConstants.get('CANNOT_DELETE_APPLICATION')) {
                    
                } 
            }
        }
        var method = 'DeleteApplications';
        var params = '{"token":"' + TOKEN() + '","deleteApplicationsReq":' + JSON.stringify(deleteApplicationsReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});