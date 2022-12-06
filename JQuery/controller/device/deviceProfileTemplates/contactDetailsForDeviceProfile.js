define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho) {

    SelectedIdOnGlobale = new Array
    columnSortFilter = new Object();
    columnSortFilterForDeviceContactCount = new Object();
    packageNameApplication = "";
    openflagCountDetails = 0;
    koutilLocal = koUtil;
    var lang = getSysLang();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function contactDetailsForDeviceProfileViewModel() {
 

        SelectedIdOnGlobale = new Array();
        checkALlPageId = 0;
        pagechangedcheck = 0;
        totalselectedRowCount = 0;
        var self = this;
        openflagCountDetails = 0;
        self.checksample = ko.observable();
        self.observableModelPopupDeviceContact = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ["MinimumContactedDateTime", "MaximumContactedDateTime"];
        self.columnlist = ko.observableArray();

        self.clearfilter = function (gId) {
            gridFilterClear(gId);
        }
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }
        function getSelectedIds() {
            return SelectedIdOnGlobale;
        }

        //clear filter of application
        self.clearfilterApplication = function (gridId) {
            clearUiGridFilter(gridId);
        }

        //open popup model
        self.closeOpenModel = function (gridID, modelGridID) {
            $("#" + gridID).jqxGrid('updatebounddata');
            $('#' + modelGridID).modal('hide');
            isPopUpOpen = false;
        }

        //export application 
        self.exportToExcelApplication = function (gridId) {
            var dataInfo = $("#" + gridId).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                $("#" + gridId).jqxGrid('exportdata', 'csv', 'Application');
                openAlertpopup(1, 'export_Information');
                $("#loadingDiv").hide();
            }
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopupDeviceContact(elementname);
        }
        modelReposition();
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));
                loadelement(popupName, 'genericPopup');
                $('#downloadModelDeviceContact').modal('show');
            }
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopupDeviceContact('unloadTemplate');
        }

        self.exportToExcel = function (isExport, gId) {
            var param = null;
            if (gId == "jqxgridDeviceContact") {
                visibleColumnsList = GetExportVisibleColumn(gId);
                param = getdeviceContactParameters(true, columnSortFilter, visibleColumnsList);
            }
            else if (gId == "jqxGridDeviceContactDetails") {
                param = getDeviceContactCountDetailsParameters(true, uniquedeviceid, hbdate, columnSortFilterForDeviceContactCount, visibleColumnsListForPopup);
            }

            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflag = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                if (gId == "jqxgridDeviceContact") {
                    contactHistoryExport(param, gId, self.openPopup);
                }
                else if (gId == "jqxGridDeviceContactDetails") {
                    heartBeatHistoryExport(param, gId, self.openPopup);
                }
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function contactHistoryExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetDeviceContactHistory';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        function heartBeatHistoryExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetDeviceHeartBeatHistory';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        var param = getdeviceContactParameters(false, columnSortFilter, []);
        deviceContactGrid('jqxgridDeviceContact', param);

        seti18nResourceData(document, resourceStorage);
    };

    //for grid
    function deviceContactGrid(gID, param) {
        var isFilter;
        if (iscontactDetailsGridFilter == undefined || iscontactDetailsGridFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        iscontactDetailsGridFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var source =
        {
            dataType: "json",
            dataFields: [
                     { name: 'isSelected', type: 'number' },
                     { name: 'DeviceContactHistoryId', map: 'DeviceContactHistoryId' },
                     { name: 'UniqueDeviceId', map: 'UniqueDeviceId' },
                     { name: 'ContactedDate', map: 'ContactedDate' },
                     { name: 'MinimumContactedDateTime', map: 'MinimumContactedDateTime', type: 'date' },
                     { name: 'MaximumContactedDateTime', map: 'MaximumContactedDateTime', type: 'date' },
                     { name: 'HBCount', map: 'HBCount' }
            ],
            root: 'DeviceContactHistory',
            type: "POST",
            data: param,

            url: AppConstants.get('API_URL') + "/GetDeviceContactHistory",
            contentType: 'application/json',
            beforeprocessing: function (data) {

                if (data && data.getDeviceContactHistoryResp) {
                    data.getDeviceContactHistoryResp = $.parseJSON(data.getDeviceContactHistoryResp);
                }
                else
                    data.getDeviceContactHistoryResp = [];

                if (data.getDeviceContactHistoryResp && data.getDeviceContactHistoryResp.PaginationResponse) {
                    source.totalrecords = data.getDeviceContactHistoryResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDeviceContactHistoryResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;

                }
            },
        };

        var request =
            {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'ContactHistoryForDeviceProfile');
                    param.getDeviceContactHistoryReq.ColumnSortFilter = columnSortFilter;
                    param.getDeviceContactHistoryReq.Pagination = getPaginationObject(param.getDeviceContactHistoryReq.Pagination, gID);
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    

                    if (data.getDeviceContactHistoryResp && data.getDeviceContactHistoryResp.DeviceContactHistory) {
                        for (var i = 0; i < data.getDeviceContactHistoryResp.DeviceContactHistory.length; i++) {

                            data.getDeviceContactHistoryResp.DeviceContactHistory[i].MinimumContactedDateTime = convertToLocaltimestamp(data.getDeviceContactHistoryResp.DeviceContactHistory[i].MinimumContactedDateTime);
                            data.getDeviceContactHistoryResp.DeviceContactHistory[i].MaximumContactedDateTime = convertToLocaltimestamp(data.getDeviceContactHistoryResp.DeviceContactHistory[i].MaximumContactedDateTime);

                            if (data.getDeviceContactHistoryResp.DeviceContactHistory[i].ContactedDate) {
                                var contactedDate = moment(data.getDeviceContactHistoryResp.DeviceContactHistory[i].ContactedDate);
                                var currentDateMinusSeven = moment().subtract('days', 7);
                                if (moment(contactedDate).isBefore(currentDateMinusSeven)) {
                                    data.getDeviceContactHistoryResp.DeviceContactHistory[i].HBCount = null;
                                }
                            }
                        }
                        //if (data.getDeviceContactHistoryResp.PaginationResponse && data.getDeviceContactHistoryResp.PaginationResponse.HighLightedItemPage > 0) {
                        //    gridStorage[0].highlightedPage = data.getDeviceContactHistoryResp.PaginationResponse.HighLightedItemPage;
                        //    var updatedGridStorage = JSON.stringify(gridStorage);
                        //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        //}
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getDeviceContactHistoryResp = new Object();
                        data.getDeviceContactHistoryResp.DeviceContactHistory = [];

                    }
                    $('.all-disabled').hide();
                }

            }
        var dataAdapter = intializeDataAdapter(source, request);

        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'DeviceContactHistoryId', element, gridStorage, false, 'pagerDivDeviceContact', false, 0, 'DeviceContactHistoryId', null, null, null);
            return true;
        }

        //Custom filter 
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

        }        

        var countsRender = function (row, columnfield, value, defaulthtml, columnproperties) {
            return '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"> <a title="View Count Details" style="text-decoration:underline;" onClick="openIconPopupDeviceContactCountDetails(' + row + ')" height="60" width="50" >' + value + '</a></div>';
        }

        $("#" + gID).jqxGrid(
        {
            width: "100%",
            pageable: true,
            editable: true,
            source: dataAdapter,
            altRows: true,
            virtualmode: true,
            pageSize: AppConstants.get('ROWSPERPAGE'),
            filterable: true,
            sortable: true,
            columnsResize: true,
            columnsreorder: true,
            selectionmode: 'singlerowadvanced',
            theme: AppConstants.get('JQX-GRID-THEME'),
            autoshowcolumnsmenubutton: false,
            enabletooltips: true,
            rowsheight: 32,
            rendergridrows: function () {
                return dataAdapter.records;
            },
            autoshowfiltericon: true,
            ready: function () {
                callOnGridReady(gID, gridStorage, CallType, '');
                var columns = genericHideShowColumn(gID, true, []);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;
            },
            columns: [
                    {
                        text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, hidden: true, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    { text: '', dataField: 'DeviceContactHistoryId', hidden: true, editable: false, },
                    { text: '', dataField: 'UniqueDeviceId', hidden: true, editable: false, },
                    { text: '', dataField: 'ContactedDate', hidden: true, editable: false,},
                    {
                        text: i18n.t('first_heartbeat_contact', { lng: lang }), datafield: 'MinimumContactedDateTime', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 180, width: 'auto', filterable: true, editable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('last_heartbeat_contact', { lng: lang }), datafield: 'MaximumContactedDateTime', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 180, width: 'auto', filterable: true, editable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('hb_count_contact', { lng: lang }), dataField: 'HBCount', editable: false, minwidth: 200, width: 'auto',
                        filtertype: "custom", cellsrenderer: countsRender,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    }
            ]
        });
        getGridBiginEdit(gID, 'DeviceContactHistoryId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'DeviceContactHistoryId');
    }

    function getdeviceContactParameters(isExport, columnSortFilter, visibleColumns) {
        var getDeviceContactHistoryReq = new Object();
        var Export = new Object();
        var Selector = new Object();

        var Pagination = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Export.IsAllSelected = false;
        Export.IsExport = isExport;
        Export.VisibleColumns = visibleColumns;
        var ColumnSortFilter = columnSortFilter;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getDeviceContactHistoryReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        getDeviceContactHistoryReq.Pagination = Pagination;
        getDeviceContactHistoryReq.ColumnSortFilter = ColumnSortFilter;
        getDeviceContactHistoryReq.Export = Export;

        var param = new Object();
        param.token = TOKEN();
        param.getDeviceContactHistoryReq = getDeviceContactHistoryReq;

        return param;
    }
    //end grid

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


});

function openIconPopupDeviceContactCountDetails(row) {

    $('#openModalPopupDeviceContactDetails').modal('show');
    $('#mdlDeviceContactDetailsHeader').mouseup(function () {
        $("#mdlDeviceContactDetails").draggable({ disabled: true });
    });

    $('#mdlDeviceContactDetailsHeader').mousedown(function () {
        $("#mdlDeviceContactDetails").draggable({ disabled: false });
    });
    GetDeviceContactCountDetails(row);
}

function GetDeviceContactCountDetails(row) {

    var self = this;
    uniquedeviceid = $("#jqxgridDeviceContact").jqxGrid('getcellvalue', row, 'UniqueDeviceId');
    hbdate = $("#jqxgridDeviceContact").jqxGrid('getcellvalue', row, 'ContactedDate');
    hbdate = createJSONTimeStamp(hbdate);
    koutilLocal.gridColumnList = new Array();
    //grid display


    jsonDateConversion()


    var param = getDeviceContactCountDetailsParameters(false, uniquedeviceid, hbdate, columnSortFilterForDeviceContactCount, []);

    if (openflagCountDetails == 1) {
        $("#gridAreaDeviceContactDetails").empty();
        $('#gridAreaDeviceContactDetails').html('<div id="jqxGridDeviceContactDetails"></div> <div id="pagerDivDeviceContactDetails">');        
    }
    GetDeviceContactCountDetailsGrid('jqxGridDeviceContactDetails', param);
}

function getDeviceContactCountDetailsParameters(isExport, uniquedeviceid, hbdate, columnSortFilterForDeviceContactCount, visibleColumns) {
    getDeviceHeartBeatHistoryReq = new Object();

    var Export = new Object();
    var Pagination = new Object();

    Export.IsAllSelected = false;
    Export.IsExport = isExport;
    Export.VisibleColumns = visibleColumns;

    Pagination.HighLightedItemId = null;
    Pagination.PageNumber = 1;
    Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

    var columnSortFilter = columnSortFilterForDeviceContactCount;
    columnSortFilter.GridId = 'HeartBeatHistoryForDeviceProfile';

    getDeviceHeartBeatHistoryReq.ColumnSortFilter = columnSortFilter;
    getDeviceHeartBeatHistoryReq.Export = Export;
    getDeviceHeartBeatHistoryReq.Pagination = Pagination;
    getDeviceHeartBeatHistoryReq.HBDate = hbdate;
    getDeviceHeartBeatHistoryReq.UniqueDeviceId = uniquedeviceid;
    if (isExport == true)
        getDeviceHeartBeatHistoryReq.CallType = CallType;
    var param = new Object();
    param.token = TOKEN();
    param.getDeviceHeartBeatHistoryReq = getDeviceHeartBeatHistoryReq;
    return param;

}


function GetDeviceContactCountDetailsGrid(gID, param) {

    openflagCountDetails = 1;

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

    var source = {
        dataType: 'json',
        dataFields: [
            { name: 'isSelected', type: 'number' },
            { name: 'HeartBeatId', map: 'HeartBeatId' },
            { name: 'HBDateTime', map: 'HBDateTime', type: 'date' },
            { name: 'HBType', map: 'HBType' }
        ],
        root: 'DeviceHeartBeatHistory',
        type: 'POST',
        data: param,
        url: AppConstants.get('API_URL') + "/GetDeviceHeartBeatHistory",
        contentType: 'application/json',
        beforeprocessing: function (data) {
            if (data && data.getDeviceHeartBeatHistoryResp) {
                data.getDeviceHeartBeatHistoryResp = $.parseJSON(data.getDeviceHeartBeatHistoryResp);
            }
            else
                data.getDeviceHeartBeatHistoryResp = [];

            if (data.getDeviceHeartBeatHistoryResp) {
                if (data.getDeviceHeartBeatHistoryResp.PaginationResponse) {
                    source.totalrecords = data.getDeviceHeartBeatHistoryResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDeviceHeartBeatHistoryResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
            }
        },
    }
    var dataAdapter = new $.jqx.dataAdapter(source,
       {
           formatData: function (data) {
               $('.all-disabled').show();
               disableIcons(['btnModelRestFilterId', 'btnModelExportToexcelId']);
               columnSortFilter = new Object();
               columnSortFilter = columnSortFilterFormatedData(columnSortFilterForDeviceContactCount, gID, gridStorage, 'HeartBeatHistoryForDeviceProfile');

               param.getDeviceHeartBeatHistoryReq.ColumnSortFilter = columnSortFilter;
               param.getDeviceHeartBeatHistoryReq.CallType = CallType;
               param.getDeviceHeartBeatHistoryReq.Pagination = getPaginationObject(param.getDeviceHeartBeatHistoryReq.Pagination, gID);               
               data = JSON.stringify(param);
               return data;
           },
           downloadComplete: function (data, status, xhr) {
               enableIcons(['btnModelRestFilterId', 'btnModelExportToexcelId']);
               
               if (data.getDeviceHeartBeatHistoryResp && data.getDeviceHeartBeatHistoryResp.DeviceHeartBeatHistory) {
                   for (var i = 0; i < data.getDeviceHeartBeatHistoryResp.DeviceHeartBeatHistory.length; i++) {
                       data.getDeviceHeartBeatHistoryResp.DeviceHeartBeatHistory[i].HBDateTime = convertToLocaltimestamp(data.getDeviceHeartBeatHistoryResp.DeviceHeartBeatHistory[i].HBDateTime);
                   }
                   if (data.getDeviceHeartBeatHistoryResp.TotalSelectionCount != 'undefined') {
                       gridStorage[0].TotalSelectionCount = data.getDeviceHeartBeatHistoryResp.TotalSelectionCount;
                       var updatedGridStorage = JSON.stringify(gridStorage);
                       window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                   }

               } else {
                   source.totalrecords = 0;
                   data.getDeviceHeartBeatHistoryResp = new Object();
                   data.getDeviceHeartBeatHistoryResp.DeviceHeartBeatHistory = [];
               }
               $('.all-disabled').hide();
           },
           loadError: function (jqXHR, status, error) {
               $('.all-disabled').hide();
               openAlertpopup(2, 'network_error');
           }
       }
   );

    var renderedHeartBeatDetails = function (element) {
        enablegridfunctions(gID, 'HeartBeatId', element, gridStorage, false, 'pagerDivDeviceContactDetails', false, 0, 'HeartBeatId', null, null, null);
        $('.jqx-grid-pager').css("display", "none")
        return true;
    }

    //Custom filter
    var buildFilterPanel = function (filterPanel, datafield) {
        genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
    }

    var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
        genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
    }

    var buildFilterPanelDate = function (filterPanel, datafield) {
        genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

    }

    $("#" + gID).jqxGrid(
        {
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
                koutilLocal.gridColumnList = new Array();
                var columns = genericHideShowColumn(gID, true, []);
                for (var i = 0; i < columns.length; i++) {
                    koutilLocal.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsListForPopup = koutilLocal.gridColumnList;
                isPopUpOpen = true;
            },
            columns: [
                    {
                        text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, hidden: true, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: renderedHeartBeatDetails
                    },
                    { text: '', dataField: 'HeartBeatId', hidden: true, editable: false,},
                    {
                        text: i18n.t('heartbeat_date', { lng: lang }), datafield: 'HBDateTime', cellsformat: LONG_DATETIME_GRID_FORMAT,width: "50%",  filterable: true, editable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('heartbeat_type', { lng: lang }), dataField: 'HBType', editable: false, width: "50%",  enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'HeartBeat Type');
                        }
                    }
            ],
        });

    getGridBiginEdit(gID, 'HeartBeatId', gridStorage);
    callGridFilter(gID, gridStorage);
    callGridSort(gID, gridStorage, 'HeartBeatId');
}
