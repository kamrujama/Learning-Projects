define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();

    return function modelDeleteContentLibrary() {
    

        //focus on first textbox
        $('#viewDeviceSubStatusModal').on('shown.bs.modal', function () {
            $('#btnDeletedDeviceID').focus();
        })


        $('#viewDeviceSubStatusModal').keydown(function (e) {
            if ($('#btnDeletedDeviceID').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#yesBtndeleteDeviceSubStatus').focus();
            }
        });


        //// focus on next tab index 
        //lastIndex = 4;
        //prevLastIndex = 3;
        //$(document).keydown(function (e) {
        //    if (e.keyCode == 9) {
        //        var thisTab = +$(":focus").prop("tabindex") + 1;
        //        if (e.shiftKey) {
        //            if (thisTab == prevLastIndex) {
        //                $("#" + tabLimitInID).find('[tabindex=' + prevLastIndex + ']').focus();
        //                return false;
        //            }
        //        } else {
        //            if (thisTab == lastIndex) {
        //                $("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
        //                return false;
        //            }
        //        }
        //    }
        //});

        //var setTabindexLimit = function (x, standardFile, y) {
        //    console.log(x);
        //    startIndex = 2;
        //    lastIndex = x;
        //    prevLastIndex = y;
        //    tabLimitInID = standardFile;
        //}
        //setTabindexLimit(4, "deletedSubStatusID", 3);
        //// end tabindex

        var self = this;
     
        
        self.deleteSubStatus = ko.observable();
        self.deviceSubStatusDisp = ko.observable();
        var deleteCount = getAllSelectedDataCount('jqxgridDeviceSubStatus');
        var deviceSubStatus = globalVariableFordeleteDeviceSubStatus[0].selectedSubStatus;
        var checkAll = globalVariableFordeleteDeviceSubStatus[0].checkAll;


        $('#deletedSubStatusID').mouseup(function () {
            $("#modelDeleteDeviceSubStatus").draggable({ disabled: true });
        });

        $('#deletedSubStatusID').mousedown(function () {
            $("#modelDeleteDeviceSubStatus").draggable({ disabled: false });
        });





        //if (deleteCount > 1) {
        //    $("#deleteCount").text(i18n.t('confo_delete_selected_sub_status', { deleteSubStatus: deleteCount }, { lng: lang }))
        //} else if (deleteCount == 1) {
        //    if (checkAll == 1) {
        //        var substatusDevice = globalVariableFordeleteDeviceSubStatus[0].selectedData[0].SubStatus;
        //        $("#deleteCount").text(i18n.t('confo_delete_the_sub_status', { deviceSubStatusDisp: substatusDevice }, { lng: lang }));
        //    } else {
        //        $("#deleteCount").text(i18n.t('confo_delete_the_sub_status', { deviceSubStatusDisp: deviceSubStatus }, { lng: lang }));
        //    }
        //} else {
        //    $("#deleteCount").text(i18n.t('confo_delete_the_sub_status', { deviceSubStatusDisp: deviceSubStatus }, { lng: lang }))
        //}


        //confirmation popup for selected devices
        if (deleteCount > 1) {
            $("#deleteCount").text(i18n.t('confo_delete_selected_sub_status', { deleteSubStatus: deleteCount }, { lng: lang }));
        } else {
            $("#deleteCount").text(i18n.t('delete_the_selected_sub_status', { lng: lang }));
        }

        //click on yes button to delete library
        self.deleteSubStatus = function (observableModelPopup) {
            var selecteItemIds = '';
            var selecteItemIds = '';
            if (globalVariableFordeleteDeviceSubStatus[0].checkAll == 1) {
                if (deleteCount == 1) {
                    selecteItemIds = null;
                    unSelectedIds = globalVariableFordeleteDeviceSubStatus[0].unSelecedRowID;
                } else {
                    selecteItemIds = null;
                    unSelectedIds = globalVariableFordeleteDeviceSubStatus[0].unSelecedRowID;
                }

            } else {
                selecteItemIds = globalVariableFordeleteDeviceSubStatus[0].selectedRowID;
                unSelectedIds = null;
            }
            deleteDeviceSubStatus(selecteItemIds, unSelectedIds, observableModelPopup);
        }

        seti18nResourceData(document, resourceStorage);
    };

    // for delete library
    function deleteDeviceSubStatus(selecteItemIds, unSelectedIds, observableModelPopup) {
        $('.all-disabled').show();
        var deleteDeviceSubStatusReq = new Object();
        var Selector = new Object();
        var checkAll = checkAllSelected("jqxgridDeviceSubStatus");

        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unSelectedIds;
        } else {
            Selector.SelectedItemIds = selecteItemIds;
            Selector.UnSelectedItemIds = null;
        }

        deleteDeviceSubStatusReq.Selector = Selector;
        deleteDeviceSubStatusReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
        var callBackfunction = function (data, error) {
            if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					observableModelPopup('unloadTemplate');
                    gridRefreshClearSelection("jqxgridDeviceSubStatus");
                    openAlertpopup(0, 'device_sub_status_deleted_successfully');                    
                } else if (data.responseStatus.StatusCode == AppConstants.get('DEVICE_SUB_STATUS_ASSOCIATED_TO_DEVICE_CANNOT_DELETED')) {
                    openAlertpopup(1, 'cannot_delete_as_the_device_sub_status_is_associated_to_device');
                } else if (data.responseStatus.StatusCode == AppConstants.get('DEVICE_SUB_STATUS_ASSOCIATED_TO_DEVICE_HISTORY_CANNOT_DELETED')) {
                    openAlertpopup(1, 'cannot_delete_as_the_device_sub_status_is_associated_to_device_history');
                }
            } 
            $('.all-disabled').hide();
        }
        var method = 'DeleteDeviceSubStatus';
        var params = '{"token":"' + TOKEN() + '","deleteDeviceSubStatusReq":' + JSON.stringify(deleteDeviceSubStatusReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});