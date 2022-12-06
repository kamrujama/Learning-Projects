define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "chosen", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho) {

    SelectedIdOnGlobale = new Array
    columnSortFilter = new Object();
    columnSortFilterForVRKBundleLibDetails = new Object();
    koUtil.GlobalColumnFilter = new Array();
   
    vrkbundleId = 0;
    vrkBlobStatus = '';
    vrkBundleName = '';
    var lang = getSysLang();
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function vrkBundlesLibraryappViewModel() {

        openflag = 0;
        openBlobflag = 0;
        SelectedIdOnGlobale = new Array();
        checkALlPageId = 0;
        pagechangedcheck = 0;
        totalselectedRowCount = 0;
        var self = this;
        self.checksample = ko.observable();
        self.observableModelPopup = ko.observable();
        self.observableModelComponent = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['BundleName', 'ImportFilePath', 'PackageMode'];
        self.columnlist = ko.observableArray();
        self.vrkBundleBlobCounts = ko.observableArray();
        self.showNoDataFound = ko.observable(false);
        setMenuSelection();
        self.bundleName = ko.observable('');
        self.clearfilter = function (gId) {
            gridFilterClear(gId);
        }
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }

        function getSelectedIds() {
            return SelectedIdOnGlobale;
        }

        //Check Rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }
        self.deleteVRKBundle = function (popupName, gridId) {
                self.openPopup(popupName, gridId);
        }

        self.exportToExcel = function (isExport, gId, exportflage) {
            var selectedDownloadLibraryItems = getSelectedUniqueId(gId);
            var unselectedDownloadLibraryItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getVRKBundlesParameters(true, columnSortFilter, selectedDownloadLibraryItems, unselectedDownloadLibraryItems, checkAll, visibleColumnsList);


            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflage = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                vrkBundleLibraryExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function vrkBundleLibraryExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    } 
                }
            }
            var method = 'GetVRKBundles';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        self.closeOpenModel = function (gridID, modelGridID) {
            $('#' + gridID).jqxGrid('render');
            gridFilterClear(modelGridID);
        }
        self.closeBlobCountsModel = function (gridID) {
            $('#' + gridID).jqxGrid('render');
            $('#openModalPopup').modal('hide');
        }
        self.closeBlobModel = function () {
            $('#openBlobDetailsPopup').modal('hide');
        }
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        function createNewScreen(elementname, controllerId) {
            $("#modelAddVRKBundlesublink").click();
        }

        modelReposition();
        self.openPopup = function (popupName, gId) {
            //self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist('');
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));

                if (visibleColumnsList.length == 0) {
                    var columns = self.columnlist();
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                }

                loadelement(popupName, 'genericPopup');
                $('#modelpopup').modal('show');
            } else if (popupName == "modelEditVRKBundle") {
                $('#btn_editLibrary').prop('disabled', true);
                var selecteItemIds = getSelectedUniqueId('jqxgridVRKBundlesLib');
                var checkAll = checkAllSelected('jqxgridVRKBundlesLib');
                var unSelecteItemIds = getUnSelectedUniqueId('jqxgridVRKBundlesLib');
                var datacount = getTotalRowcount('jqxgridVRKBundlesLib');
                if (checkAll == 1) {
                    if (unSelecteItemIds.length == datacount - 1) {
                        loadelement(popupName, 'vrkBundleLibrary');
                        $('#modelpopup').modal('show');
                        editButtonClick('jqxgridVRKBundlesLib');
                    }
                    else {
                        openAlertpopup(1, 'select_single_file_bundle');
                        return;
                    }
                        
                } else {
                    if (selecteItemIds.length == 1) {
                        loadelement(popupName, 'vrkBundleLibrary');
                        $('#modelpopup').modal('show');
                        editButtonClick('jqxgridVRKBundlesLib');
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'please_selct_bundle_file');
                        return;
                    } else if (selecteItemIds.length > 1) {
                        openAlertpopup(1, 'select_single_file_bundle');
                        return;
                    }
                }
            } else if (popupName == "modelAddVRKBundle") {
                createNewScreen(popupName, 'vrkBundleLibrary');
                //$('#modelpopup').modal('show');
            }else if (popupName == "modelDeleteVRKBundle") {
                var selecteItemIds = getSelectedUniqueId('jqxgridVRKBundlesLib');
                var deleteCount = getAllSelectedDataCount('jqxgridVRKBundlesLib');
                var checkAll = checkAllSelected('jqxgridVRKBundlesLib');
                if (checkAll == 1) {
                    if (deleteCount < 1) {
                        openAlertpopup(1, 'select_item');
                    } else {
                        loadelement(popupName, 'vrkBundleLibrary');
                        $('#modelpopup').modal('show');
                        deleteButtonClick(gId, 1);
                    }

                } else {                
                    if (selecteItemIds.length == 1) {
                        var selectedData = getMultiSelectedData('jqxgridVRKBundlesLib');
                        var selectedsource = _.where(selectedData, { VRKBundleId: selecteItemIds[0] });
                        if (selectedsource[0].Status == "Processing" || selectedsource[0].Status == "Scheduled" || selectedsource[0].Status == "Failed" || selectedsource[0].Status == "Complete With Failures") {
                            openAlertpopup(1, i18n.t('delete_lib_file_VRKBundle_info', { bundleName: selectedsource[0].BundleName, bundleStatus: selectedsource[0].Status }, { lng: lang }));
                        } else {
                            loadelement(popupName, 'vrkBundleLibrary', 2);
                            $('#modelpopup').modal('show');
                            deleteButtonClick(gId, 1);
                        }                      

                    } else if (selecteItemIds.length > 1) {
                        var VRKBundleLitesArray = getMultiSelectedData('jqxgridVRKBundlesLib');
                        var isAuthorizeToDelete = false;
                        for (var i = 0; i < VRKBundleLitesArray.length; i++) {
                            if ( VRKBundleLitesArray[i].Status == "Complete" || VRKBundleLitesArray[i].Status == "Not Scheduled") {
                                isAuthorizeToDelete = true;
                            }
                        }
                        if (isAuthorizeToDelete == true) {
                            loadelement(popupName, 'vrkBundleLibrary', 2);
                            $('#modelpopup').modal('show');
                            deleteButtonClick(gId, 1);                         
                        } else {
                            openAlertpopup(1, i18n.t('delete_lib_file_VRKBundle_multi_info', { lng: lang }));
                        }                      
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'please_selct_bundle_file');
                        $("#draggDeleteID").draggable();
                        return;
                    }
                }
            }
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
            $('#modelpopup').modal('hide');
            //self.observableModelComponent('unloadTemplate');
            checkIsPopUpOPen();
        }


        function vrkBundlesLibraryExport(param) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = '';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        function editButtonClick(gID) {
            var selectedData = getMultiSelectedData(gID);
            var selectedarr = new Array();
            var editPackage = new Object();
            editPackage.selectedData = selectedData;
            selectedarr.push(editPackage);
            globalVariableForEditBundle = selectedarr;
        }

        function deleteButtonClick(gID, check) {
            var selectedDeleteIds = getSelectedUniqueId(gID);
            var selectedData = getMultiSelectedData(gID);
            var unSelecedRowID = getUnSelectedUniqueId(gID);
            var checkAll = checkAllSelected(gID);
            var selectedarr = new Array();
            var editPackage = new Object();
            var selectedsource = _.where(selectedData, { VRKBundleId: selectedDeleteIds[0] });
            if (checkAll == 1) {
                editPackage.selectedRowID = null;
                editPackage.unSelecedRowID = unSelecedRowID;
                editPackage.selectedData = selectedData;
            }
            else {
                editPackage.BundleName = selectedsource[0].BundleName;
                editPackage.selectedData = selectedData;
                editPackage.selectedRowID = selectedDeleteIds;
                editPackage.unSelecedRowID = null;
            }
            editPackage.checkAll = checkAll;
            selectedarr.push(editPackage);
            globalVariableForEditBundle = selectedarr;
        }
        // delete library
        self.deleteVRKBundleLibrary = function () {
            var selecteItemIds = getSelectedUniqueId('jqxgridVRKBundlesLib');
            var unSelectedIds = getUnSelectedUniqueId('jqxgridVRKBundlesLib');
            deleteVRKBundle(selecteItemIds, unSelectedIds);
        }

        // package is associated to device. Hence, cannot be deleted
        self.deleteAllLibrary = function () {
            var selecteItemIds = getSelectedUniqueId('jqxgridVRKBundlesLib');
            var unSelectedIds = getUnSelectedUniqueId('jqxgridVRKBundlesLib');
            var checkAll = checkAllSelected('jqxgridVRKBundlesLib');
            var selecteDeleteIds;
            var unSelectedDeleteIds;

            if (checkAll == 1) {
                selecteDeleteIds = null;
                unSelectedDeleteIds = unSelectedIds;
            }
            else {
                selecteDeleteIds = selecteItemIds;
                unSelectedDeleteIds = null;
            }
            deleteVRKBundle(selecteDeleteIds, unSelectedDeleteIds)
        }

        var param = getVRKBundlesParameters(false, columnSortFilter, null, null, 0, []);
        vrkBundlesLibraryGrid('jqxgridVRKBundlesLib', param);
        self.refreshBundleCountsData=function(){
            getVRKBlobCountsData(vrkbundleId, vrkBundleName);
        }
        function getVRKBundlesParameters(isExport, columnSortFilter, selectedVRKBundlesLibraryItems, unselectedVRKBundlesLibraryItems, checkAll, visibleColumns) {
            var getVRKBundlesReq = new Object();
            var Export = new Object();
            var Selector = new Object();

            var Pagination = new Object();
            Pagination.HighLightedItemId = null
            Pagination.PageNumber = 1;
            Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
            Export.DynamicColumns = null;
            Export.ExportReportType = 5;
            Export.VisibleColumns = visibleColumns;

            if (checkAll == 1) {
                Selector.SelectedItemIds = null;
                Selector.UnSelectedItemIds = unselectedVRKBundlesLibraryItems;
                if (isExport == true) {
                    Export.IsAllSelected = true;
                    Export.IsExport = true;
                } else {
                    Export.IsAllSelected = false;
                    Export.IsExport = false;
                }
            } else {
                Selector.SelectedItemIds = selectedVRKBundlesLibraryItems;
                Selector.UnSelectedItemIds = null;
                if (isExport == true) {
                    Export.IsAllSelected = false;
                    Export.IsExport = true;
                } else {
                    Export.IsAllSelected = false;
                    Export.IsExport = false;
                }
            }

            var ColumnSortFilter = columnSortFilter;
            var FilterList = new Array();
            var coulmnfilter = new Object();
            coulmnfilter.FilterColumn = null;
            coulmnfilter.FilterValue = null;
            FilterList.push(coulmnfilter);

            getVRKBundlesReq.ColumnSortFilter = ColumnSortFilter;
            getVRKBundlesReq.Export = Export;
            getVRKBundlesReq.PackageType = 1;
            getVRKBundlesReq.Pagination = Pagination;
            getVRKBundlesReq.Selector = Selector;

            var param = new Object();
            param.token = TOKEN();
            param.getVRKBundlesReq = getVRKBundlesReq;

            return param;
        }
           
        openIconPopupVRKBundleLibDetails = function (row) {
            $('#openModalPopup').modal('show');

            $('#mdlVrkBundleLibraryItemHeader').mouseup(function () {
                $("#mdlVrkBundleLibraryItem").draggable({ disabled: true });
            });

            $('#mdlVrkBundleLibraryItemHeader').mousedown(function () {
                $("#mdlVrkBundleLibraryItem").draggable({ disabled: false });
            });
            vrkbundleId = $("#jqxgridVRKBundlesLib").jqxGrid('getcellvalue', row, 'VRKBundleId');
            self.bundleName = vrkBundleName = $("#jqxgridVRKBundlesLib").jqxGrid('getcellvalue', row, 'BundleName');
            getVRKBlobCountsData(vrkbundleId, self.bundleName)
        }
        function getVRKBlobCountsData(vrkBundleId,BundleName) {
            var param = getVRKBundleLibDetailsParameters(vrkBundleId);
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.getVRKBundleKeyBlobCountsResp) {
                            var keyblob;
                            var responseCounts = $.parseJSON(data.getVRKBundleKeyBlobCountsResp);
                            if (responseCounts == null) {
                                self.showNoDataFound(true);
                            } else if (responseCounts.length == 0) {
                                self.showNoDataFound(true);
                            } else {
                                self.showNoDataFound(false);
                            }
                            self.vrkBundleBlobCounts([]);
                            for (var keyblobitem in responseCounts) {
                                keyblob = {};
                                keyblob.keyblobName = keyblobitem;
                                keyblob.keyblobDisplayName = keyblobitem.replace('Count', '').replace('InProgress', 'In Progress');
                                keyblob.keyblobValue = responseCounts[keyblobitem];
                                if (keyblob.keyblobValue > 0 && keyblob.keyblobDisplayName != "Total") {
                                    keyblob.showDetails = true;
                                } else {
                                    keyblob.showDetails = false;
                                }
                                self.vrkBundleBlobCounts.push(keyblob);
                            }

                        }
                        $("#bundleName").empty();
                        $("#bundleName").append(BundleName);
                    }
                }
            }
            var method = 'GetVRKBundleKeyBlobCounts';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }
        function vrkBundlesLibraryGrid(gID, param) {

            var InitGridStoragObj = initGridStorageObj(gID);
            var gridStorage = InitGridStoragObj.gridStorage;
            var adStorage = InitGridStoragObj.adStorage;

            var gridheight = $(window).height();
            var percentValue;
            if (gridheight > 600) {
                percentValue = (20 / 100) * gridheight;
                gridheight = gridheight - 150;
                gridheight = gridheight - percentValue + 'px';
            } else {
                gridheight = '400px';
            }          
            var source =
            {
                dataType: "json",
                dataFields: [
                         { name: 'isSelected', type: 'number' },
                         { name: 'VRKBundleId', map: 'VRKBundleId' },
                         { name: 'BundleName', map: 'BundleName' },
                         { name: 'BundleFile', map: 'BundleFile' },
                         { name: 'BundleSize', map: 'BundleSize' },
                         { name: 'Tags', map: 'Tags' },
                         { name: 'IsProcessed', map: 'IsProcessed' },
                         { name: 'ImportFilePath', map: 'ImportFilePath' },
                         { name: 'Status', map: 'Status' },
                         { name: 'ScheduleType', map: 'ScheduleType' },
                         { name: 'IsMaintenance', map: 'IsMaintenance' },
                         { name: 'UploadedByUserName', map: 'UploadedByUserName' },
                         { name: 'DownloadOnVerbose', map: 'DownloadOnVerbose' },
                         { name: 'UploadedOn', map: 'UploadedOn', type: 'date' },
                         { name: 'DownloadOn', map: 'DownloadOn', type: 'date' },
                         { name: 'FileRepoId', map: 'FileRepoId' },
                         
                ],
                root: 'VRKBundles',
                type: "POST",
                data: param,

                url: AppConstants.get('API_URL') + "/GetVRKBundles",
                contentType: 'application/json',
                beforeprocessing: function (data) {

                    if (data && data.getVRKBundlesResp) {
                        data.getVRKBundlesResp = $.parseJSON(data.getVRKBundlesResp);
                    }
                    else
                        data.getVRKBundlesResp = [];

                    if (data.getVRKBundlesResp && data.getVRKBundlesResp.PaginationResponse) {
                        source.totalrecords = data.getVRKBundlesResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getVRKBundlesResp.PaginationResponse.TotalPages;
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                    }
                },
            };

            var dataAdapter = new $.jqx.dataAdapter(source,
                {
                    formatData: function (data) {
                        try {
                            $('.all-disabled').show();
                            disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                            columnSortFilter = new Object();
                            columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'VRKBundleLibrary');

                            koUtil.GlobalColumnFilter = columnSortFilter;
                            param.getVRKBundlesReq.ColumnSortFilter = columnSortFilter;

                            param.getVRKBundlesReq.Pagination = getPaginationObject(param.getVRKBundlesReq.Pagination, gID);
                            data = JSON.stringify(param);
                            return data;
                        }
                        catch (e) { }
                    },
                    downloadComplete: function (data, status, xhr) {
                        enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                        if (data) {
                            if (data.getVRKBundlesResp) {
                                if (data.getVRKBundlesResp.VRKBundles){
                                for (var i = 0; i < data.getVRKBundlesResp.VRKBundles.length; i++) {
                                    data.getVRKBundlesResp.VRKBundles[i].UploadedOn = convertToLocaltimestamp(data.getVRKBundlesResp.VRKBundles[i].UploadedOn);
                                    data.getVRKBundlesResp.VRKBundles[i].DownloadOn = convertToLocaltimestamp(data.getVRKBundlesResp.VRKBundles[i].DownloadOn);
                                }
                            }

                                if (data.getVRKBundlesResp.PaginationResponse) {
                                    //if (data.getVRKBundlesResp.PaginationResponse.HighLightedItemPage > 0) {
                                    //    gridStorage[0].highlightedPage = data.getVRKBundlesResp.PaginationResponse.HighLightedItemPage;
                                    //    var updatedGridStorage = JSON.stringify(gridStorage);
                                    //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                                    //}
                                }

                                if (data.getVRKBundlesResp.TotalSelectionCount != 'undefined' && data.getVRKBundlesResp.TotalSelectionCount > 0 && data.getVRKBundlesResp.TotalSelectionCount != undefined) {
                                    gridStorage[0].TotalSelectionCount = data.getVRKBundlesResp.TotalSelectionCount;
                                    var updatedGridStorage = JSON.stringify(gridStorage);
                                    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                                }
                            }
                            if (!data.getVRKBundlesResp || !data.getVRKBundlesResp.VRKBundles) {
                                source.totalrecords = 0;
                                source.totalpages = 0;
                                data.getVRKBundlesResp = new Object();
                                data.getVRKBundlesResp.VRKBundles = [];
                            }
                            $('.all-disabled').hide();
                        }
                    },
                    loadError: function (jqXHR, status, error) {
                        $('.all-disabled').hide();
                        openAlertpopup(2, 'network_error');
                    }
                }
            );


            //sorting
            $("#" + gID).bind("sort", function (event) {
                $("#" + gID).jqxGrid('updatebounddata');
            });

            //for allcheck
            var cellclass = function (row, columnfield, value) {
                var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'IsProcessed');
                return classname;
            }


            //row is enabled when IsProcessed true
            var cellbeginedit = function (row, datafield, columntype, value) {
                var check = $("#" + gID).jqxGrid('getcellvalue', row, 'IsProcessed');
                if (check == true) {
                    return true;
                } else {
                    return false;
                }

            }
            var rendered = function (element) {
                enablegridfunctions(gID, 'VRKBundleId', element, gridStorage, true, 'pagerDivVRKBundlesLib', false, 6, 'Status', null, null, null);
                return true;
            }

            var detailnrender = function (row, columnfield, value, defaulthtml, columnproperties) {
                //var importFilePath = $("#" + gID).jqxGrid('getcellvalue', row, 'ImportFilePath');
                //var vrkBundleId = $("#" + gID).jqxGrid('getcellvalue', row, 'VRKBundleId');
                var bundleName = $("#" + gID).jqxGrid('getcellvalue', row, 'BundleName');
                if (bundleName != '') {
                    var html = '<div  style="height:100px;cursor:pointer;text-align:center;padding-top:7px;float:left;"><a style="text-decoration: underline" tabindex="0" title="Click to view Details"  onclick="openIconPopupVRKBundleLibDetails('+row+')" role="button" >View Details</a></div>';
                    return html;
                } else {
                    return " ";
                }
            }

            var downloadLogsRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
                var isProcessed = $("#" + gID).jqxGrid('getcellvalue', row, 'IsProcessed');
                var BundleName = $("#" + gID).jqxGrid('getcellvalue', row, 'BundleName');

                if (isProcessed) {
                    if (BundleName && BundleName != '') {
                        return '<a  id="imageId" tabindex="0" class="btn btn-xs btn-default" style="margin-left: 10px; margin-top:4px; padding:2px 6px !important" height="60" title="Request logs" width="50" onClick="vrkExportLogs(' + row + ')"><i class="icon-doc-info"></i></a>'
                        + '<a  id="imageId" tabindex="0" class="btn btn-xs btn-default" style="margin-left: 5px; margin-top:4px; padding:2px 6px !important" height="60" title="Export the current details of keyblobs" width="50" onClick="vrkExportCurrentBlobDetails(' + row + ')"><i class="icon-export-excel"></i></a>';                      
                    } else {
                        return '<a  id="imageId" tabindex="0" class="btn btn-xs btn-default disabled" style="margin-left: 10px; margin-top:4px; padding:2px 6px !important" height="60" title="Request logs" width="50"><i class="icon-doc-info"></i></a>'
                       + '<a  id="imageId" tabindex="0" class="btn btn-xs  btn-default disabled" style="margin-left: 5px; margin-top:4px; padding:2px 6px !important" height="60" title="Export the current details of keyblobs" width="50"><i class="icon-export-excel"></i></a>';                        
                    }
                } else {
                    return '<a  id="imageId" tabindex="0" class="btn btn-xs btn-default disabled" style="margin-left: 10px; margin-top:4px; padding:2px 6px !important" height="60" title="Request logs" width="50"><i class="icon-doc-info"></i></a>'
                       + '<a  id="imageId" tabindex="0" class="btn btn-xs btn-default disabled" style="margin-left: 5px; margin-top:4px; padding:2px 6px !important" height="60" title="Export the current details of keyblobs" width="50"><i class="icon-export-excel"></i></a>';                    
                }
               
            }

            //Custom filter
            var buildFilterPanel = function (filterPanel, datafield) {
                genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
            }
            var buildFilterPanelDate = function (filterPanel, datafield) {
                genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

            }
            var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
                genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
            }

            $("#" + gID).jqxGrid(
            {
                width: "100%",
                height: gridHeightFunction(gID, "1"),
                pageable: true,
                editable: true,
                source: dataAdapter,
                altRows: true,
                //showfilterrow: true,
                virtualmode: true,
                pageSize: AppConstants.get('ROWSPERPAGE'),
                filterable: true,
                // filterMode: 'advanced',
                sortable: true,
                columnsResize: true,
                columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                enabletooltips: true,
                rowsheight: 32,
                rendergridrows: function () {
                    return dataAdapter.records;
                },
                autoshowfiltericon: true,

                ready: function () {
                    callOnGridReady(gID, gridStorage);

                    var columns = genericHideShowColumn(gID, true, ['ImportFilePath', 'PackageMode']);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                },                
                //handlekeyboardnavigation: function (event) {
                //    var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
                //    if (key == 13) {
                //        $("#" + gID).jqxGrid('clearselection');
                //        $("#" + gID).jqxGrid('updatebounddata');
                //        return true;
                //    }
                //},
                columns: [
                         {
                             text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false,  resizable: false, draggable: false,
                             datafield: 'isSelected', width: 40, renderer: function () {
                                 return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                             }, rendered: rendered
                         },
                         { text: '', dataField: 'VRKBundleId', hidden: true, editable: false, width: 'auto' },
                         {
                             text: i18n.t('vrkBundle_Name', { lng: lang }), dataField: 'BundleName', editable: false, minwidth: 150, width: 'auto',
                             filtertype: "custom",
                             createfilterpanel: function (datafield, filterPanel) {
                                 buildFilterPanel(filterPanel, datafield);
                             }
                         },
                        {
                            text: i18n.t('vrkBundle_File', { lng: lang }), dataField: 'BundleFile', editable: false, minwidth: 150, width: 'auto', filterable: true,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('vrkBundle_FileSize', { lng: lang }), dataField: 'BundleSize', editable: false, minwidth: 100, width: 'auto', filterable: true,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('vrkBundle_Tags', { lng: lang }), dataField: 'Tags', editable: false, minwidth: 100, width: 'auto', filterable: true,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('vrkBundle_Bundle_Status', { lng: lang }), dataField: 'Status', editable: false, minwidth: 180, width: 'auto',
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelMultiChoice(filterPanel, datafield, 'VRK Bundle Status');
                            }
                        },                      
                        {
                            text: i18n.t('vrkBundle_is_maintenance', { lng: lang }), dataField: 'IsMaintenance', editable: false, minwidth: 180, width: 'auto',hidden:true,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        { text: i18n.t('vrkBundle_UploadedBy', { lng: lang }), datafield: 'UploadedByUserName', editable: false, minwidth: 10, width: 'auto', filterable: false, menu: false, sortable: false },
                        {
                            text: i18n.t('vrkBundle_UploadedOn', { lng: lang }), datafield: 'UploadedOn', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 180, width: 'auto', filterable: true, editable: false,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelDate(filterPanel, datafield);
                            }
                        },
                        { text: i18n.t('vrkBundle_Schedule_Info', { lng: lang }), datafield: 'DownloadOnVerbose', editable: false, minwidth: 180, width: 'auto', filterable: false, menu: false, sortable: false },
                        { text: i18n.t('vrkBundle_Actions', { lng: lang }), filterable: false, sortable: false, menu: false, dataField: 'ImportFilePath', editable: false, minwidth: 100, width: 'auto', cellsrenderer: downloadLogsRenderer },
                        { text: i18n.t('vrkBundle_Details', { lng: lang }), filterable: false, sortable: false, menu: false, datafield: 'PackageMode', editable: false, minwidth: 100, width: 'auto', cellsrenderer: detailnrender }



                ]
            });
            getGridBiginEdit(gID, 'VRKBundleId', gridStorage);
            callGridFilter(gID, gridStorage);
            callGridSort(gID, gridStorage, 'VRKBundleId');

        }
        seti18nResourceData(document, resourceStorage);
    };
    
    function generateTemplate(tempname, controllerId) {
        //new template code
        var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
        var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
        var cunanem = tempname + '1';
        ko.components.register(tempname, {
            viewModel: { require: ViewName },
            template: { require: 'plugin/text!' + htmlName }
        });
        // end new template code
    }

    //for grid
      
});

function vrkExportLogs(row) {
    var BundleName = $("#jqxgridVRKBundlesLib").jqxGrid('getcellvalue', row, 'BundleName');
    var VRKBundleId = $("#jqxgridVRKBundlesLib").jqxGrid('getcellvalue', row, 'VRKBundleId');
    var addVRKProcessLogQueueReq = new Object();
    addVRKProcessLogQueueReq.BundleName = BundleName;
    addVRKProcessLogQueueReq.VRKBundleId = VRKBundleId;
    var callBackfunction = function (data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                openAlertpopup(1, 'export_vrk_logs_Sucess');
            }
        }
    }
    var method = 'AddVRKProcessLogQueue';
    var params = '{"token":"' + TOKEN() + '","addVRKProcessLogQueueReq":' + JSON.stringify(addVRKProcessLogQueueReq) + '}';
    ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
}

function vrkExportCurrentBlobDetails(row) {
    var VRKBundleId = $("#jqxgridVRKBundlesLib").jqxGrid('getcellvalue', row, 'VRKBundleId');
    var exportVRKKeyBlobsReq = new Object();
    var Export = new Object();
    Export.IsAllSelected = true;
    Export.IsExport = true;
    Export.VisibleColumns=["Serial #","Key Blob","Reason"];
    exportVRKKeyBlobsReq.Export = Export;
    exportVRKKeyBlobsReq.VRKBundleId = VRKBundleId;
    var callBackfunction = function (data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                openAlertpopup(1, 'export_vrk_key_blobs_logs_Sucess');
            }
        }
    }
    var method = 'ExportVRKKeyBlobs';
    var params = '{"token":"' + TOKEN() + '","exportVRKKeyBlobsReq":' + JSON.stringify(exportVRKKeyBlobsReq) + '}';
    ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
}

function getVRKBundleLibDetailsParameters(vrkbundleId) {
    getVRKBundleKeyBlobCountsReq = new Object();
        
   

    getVRKBundleKeyBlobCountsReq.VRKBundleId = vrkbundleId;
    var param = new Object();
    param.token = TOKEN();
    param.getVRKBundleKeyBlobCountsReq = getVRKBundleKeyBlobCountsReq;
    return param;

}
function getVRKBundleBlobDetailsParameters(vrkbundleId,status) {
    getVRKBlobsByStatusReq = new Object();

    var Pagination = new Object();
    Pagination.HighLightedItemId = null
    Pagination.PageNumber = 1;
    Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

    getVRKBlobsByStatusReq.BundleID = vrkbundleId;
    getVRKBlobsByStatusReq.Status = status;
    var param = new Object();
    param.token = TOKEN();
    getVRKBlobsByStatusReq.Pagination = Pagination;
    param.getVRKBlobsByStatusReq = getVRKBlobsByStatusReq;
    return param;

}

function showDetailedBlobDetails(blobStatus) {
    $('#openBlobDetailsPopup').modal('show');
    $('#mdlVrkBlobDetailItemHeader').mouseup(function () {
        $("#mdlVrkBlobDetailItem").draggable({ disabled: true });
    });

    $('#mdlVrkBlobDetailItemHeader').mousedown(function () {
        $("#mdlVrkBlobDetailItem").draggable({ disabled: false });
    });
    GetVRKBundleBlobDetails(blobStatus);
}

function GetVRKBundleBlobDetails(blobStatus) {
  
    $("#bundleNameBlob").empty();
    $("#bundleNameBlob").append(vrkBundleName);
    vrkBlobStatus = blobStatus;
    //grid display
    var param = getVRKBundleBlobDetailsParameters(vrkbundleId, blobStatus);
    if (openBlobflag == 0) {
        GetVRKBundleKeyBlobItemDetails('jqxGridVRKBlobDetails', param);
    } else {
        $("#jqxGridVRKBlobDetails").jqxGrid('updatebounddata');
    }
}
function GetVRKBundleKeyBlobItemDetails(gID, param) {

    openBlobflag = 1;

    var gridStorageArr = new Array();
    var gridStorageObj = new Object();
    gridStorageObj.checkAllFlag = 0;
    gridStorageObj.counter = 0;
    gridStorageObj.filterflage = 0;
    gridStorageObj.selectedDataArr = [];
    gridStorageObj.unSelectedDataArr = [];
    gridStorageObj.singlerowData = [];
    gridStorageObj.multiRowData = [];
    gridStorageObj.TotalSelectionCount = null;
    gridStorageObj.highlightedRow = null;
    gridStorageObj.highlightedPage = null;
    gridStorageArr.push(gridStorageObj);

    var gridStorage = JSON.stringify(gridStorageArr);
    window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
    var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

    var rendered = function (element) {
        enablegridfunctions(gID, 'VRKBundleId', element, gridStorage, true, 'pagerDivVRKBlobDetails', false, 6, 'Status', null, null, null);
        return true;
    }

    var source = {
        dataType: 'json',
        dataFields: [
            { name: 'SerialNumber', map: 'SerialNumber' },
            { name: 'KeyBlobName', map: 'KeyBlobName' },
            { name: 'Status', map: 'Status' }
        ],
        root: 'VRKKeyBlobStatus',
        type: 'POST',
        data: param,
        url: AppConstants.get('API_URL') + "/GetVRKBlobsByStatus",
        contentType: 'application/json',
        beforeprocessing: function (data) {
            if (data && data.getVRKBlobsByStatusResp) {
                data.getVRKBlobsByStatusResp = $.parseJSON(data.getVRKBlobsByStatusResp);
            }
            else {
                data.getVRKBlobsByStatusResp = [];
            }
           
            if (data.getVRKBlobsByStatusResp) {
                source.totalrecords = data.getVRKBlobsByStatusResp.PaginationResponse.TotalRecords;
                source.totalpages = data.getVRKBlobsByStatusResp.PaginationResponse.TotalPages;
            } else {
                source.totalrecords = 0;
                source.totalpages = 0;
            }
        },
    }
    var dataAdapter = new $.jqx.dataAdapter(source,
        {
            formatData: function (data) {
                $('.all-disabled').show();
                //disableIcons(['btnModelRestFilterId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
                param.getVRKBlobsByStatusReq.BundleID = vrkbundleId;
                param.getVRKBlobsByStatusReq.Status = vrkBlobStatus
                param.getVRKBlobsByStatusReq.Pagination = getPaginationObject(param.getVRKBlobsByStatusReq.Pagination, gID);
                data = JSON.stringify(param);
                return data;
            },
            downloadComplete: function (data, status, xhr) {
                enableIcons(['btnModelRestFilterId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
                if (data.getVRKBlobsByStatusResp == undefined || data.getVRKBlobsByStatusResp == null) {
                    data.getVRKBlobsByStatusResp = [];
                }
                $('.all-disabled').hide();
            },
            loadError: function (jqXHR, status, error) {
                $('.all-disabled').hide();
                openAlertpopup(2, 'network_error');
            }
        }
    );


    $("#" + gID).jqxGrid({
        width: "100%",        
        pageable: true,
        editable: true,
        source: dataAdapter,
        altRows: true,
        autoshowcolumnsmenubutton: false,
        virtualmode: true,
        pageSize: AppConstants.get('ROWSPERPAGE'),
        filterable: true,
        sortable: true,
        columnsResize: true,
        columnsreorder: true,
        selectionmode: 'singlerow',
        theme: AppConstants.get('JQX-GRID-THEME'),
        autoshowfiltericon: true,
        rowsheight: 32,
        enabletooltips: true,
        rendergridrows: function () {
            return dataAdapter.records;
        },
        ready: function () {
            $("#horizontalScrollBarjqxGridVRKBlobDetails").hide();
        },
        columns: [
            {
                text: '', menu: false, sortable: false, hidden: true, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false,
                datafield: 'isSelected', width: 40, renderer: function () {
                    return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                }, rendered: rendered
            },
            {
                text: i18n.t('VRK_Key_Blob_Detail_Serial_Header', { lng: lang }), sortable: false, filterable: false, menu: false, dataField: 'SerialNumber', editable: false, minwidth: 100, width: 'auto', enabletooltips: false
            },
            {
                text: i18n.t('VRK_Key_Blob_Detail_KeyBlob_Header', { lng: lang }), sortable: false, filterable: false, menu: false, dataField: 'KeyBlobName', editable: false, minwidth: 100, width: 'auto'
            },
            {
                text: i18n.t('VRK_Key_Blob_Detail_Status_Header', { lng: lang }), sortable: false, filterable: false, menu: false, dataField: 'Status', editable: false, minwidth: 100, width: 'auto'
            },
        ],
    });
}
