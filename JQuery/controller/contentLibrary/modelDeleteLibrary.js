define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();

    return function modelDeleteContentLibrary() {
     

        var self = this;
        self.packageName = ko.observable(); 
        self.packageCount = ko.observable();

        ////-------------------ON POP UP --- FOCUS------------------------
        $('#deleteContentNoBtn').focus();
        $('#addLibraryModal').on('shown.bs.modal', function () {
            $('#deleteContentNoBtn').focus();
        });

        $('#addLibraryModal').keydown(function (e) {
            if ($('#deleteContentNoBtn').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#modelDelLibYes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------
        ////-------------------------------------------

        if (checkthumbnailview) {
            var deleteCount = globalVariableForEditContent.length;
        } else {
            var deleteCount = getAllSelectedDataCount('jqxgridContentlib');
        }
        

        if (deleteCount > 1) {
            $("#deleteCountId").text(i18n.t('are_you_sure_you_want_to_delete_these', { deleteCount: deleteCount }, { lng: lang }))
            self.packageCount = deleteCount;
           
        } else {
            if (globalVariableForEditContent.length > 0) {
                if (globalVariableForEditContent[0].checkAll == 1) {
                    self.packageName = globalVariableForEditContent[0].selectedData[0].PackageName;
                    var displayPackageName = self.packageName;
                    $("#deleteMsgId").text(i18n.t('are_you_sure_you_want_to_delete_these_library_file', { displayPackageName: displayPackageName }, { lng: lang }));
                } else {
                    self.packageName = globalVariableForEditContent[0].packageName;
                    var displayPackageName = self.packageName;
                    $("#deleteMsgId").text(i18n.t('are_you_sure_you_want_to_delete_these_library_file', { displayPackageName: displayPackageName }, { lng: lang }));
                }
            }
        } 

        self.deleteLibrary = function (observableModelPopup, refershTileview) {
            var selecteItemIds = new Array();
            var unSelectedIds = new Array();
            for (var i = 0; i < globalVariableForEditContent.length; i++) {
                if (globalVariableForEditContent[i].checkAll == 1) {
                    selecteItemIds = null;
                    unSelectedIds=globalVariableForEditContent[i].unSelecedRowID;
                } else {
                    if (checkthumbnailview == true) {
                        for (var i = 0; i < globalVariableForEditContent.length; i++) {
                            selecteItemIds.push(globalVariableForEditContent[i].selectedRowID);
                        }
                        unSelectedIds = null;
                    } else {
                            selecteItemIds=globalVariableForEditContent[i].selectedRowID;
                            unSelectedIds = null;
                       
                    }
                }
            }
            DeletePackage(selecteItemIds, unSelectedIds, observableModelPopup, refershTileview);
        }

        seti18nResourceData(document, resourceStorage);
    }

    function DeletePackage(selecteItemIds, unSelectedIds, observableModelPopup, refershTileview) {
        var deletePackageReq = new Object();
        var Selector = new Object();
        deletePackageReq.PackageType = 2;
        Selector.SelectedItemIds = selecteItemIds;
        Selector.UnSelectedItemIds = unSelectedIds;
        deletePackageReq.Selector = Selector;

        var callBackfunction = function (data, error) {            
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {                 
                    gridFilterClear('jqxgridContentlib');
                    observableModelPopup('unloadTemplate');
                    $('#addLibraryModal').modal('hide');
                    openAlertpopup(0, 'alert_package_delete_success');
                    refershTileview();
                    globalVariableForEditContent = [];
                    $('#draggDeleteLibraryID').draggable();
                } else if (data.responseStatus.StatusCode == AppConstants.get('PACKAGE_ASSOCIATED_TO_DEVICE_HENCE_CANNOT_BE_DELETED')) {    //37
                    $("#infoAllDeleted").modal('show');
                }
            }
        }

        var method = 'DeletePackage';
        var params = '{"token":"' + TOKEN() + '","deletePackageReq":' + JSON.stringify(deletePackageReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }

    function getContentLibraryData() {

        var getPackagesReq = new Object();
        var Pagination = new Object();
        var Export = new Object();
        var Selector = new Object();
        var ColumnSortFilter = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Export.DynamicColumns = null;
        Export.IsAllSelected = false;
        Export.IsExport = false;

        Selector.SelectedItemIds = null;
        Selector.UnSelectedItemIds = null;

        ColumnSortFilter.FilterList = null;
        ColumnSortFilter.SortList = null;

        getPackagesReq.ColumnSortFilter = null;
        getPackagesReq.Export = Export;
        getPackagesReq.PackageType = 2;
        getPackagesReq.Pagination = Pagination;
        getPackagesReq.Selector = Selector;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.getPackagesResp && data.getPackagesResp.Packages) {
                    }
                } 
            }
        }
        var method = 'GetPackages';
        var params = '{"token":"' + TOKEN() + '","getPackagesReq":' + JSON.stringify(getPackagesReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

});