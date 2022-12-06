define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "AppConstants"], function (ko, koUtil) {

    var lang = getSysLang();
    columnSortFilterForAuditReport = new Object();
    columnSortFilterForAuditHistoryDevices = new Object();
    openflag = 0;
    auditId = 0;

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function auditReportViewModel() {


        var self = this;
        openflag = 0;

        self.gridIdForShowHide = ko.observable();
        self.columnlist = ko.observableArray();
        self.templateFlage = ko.observable(false);

        //self.observableCriteria = ko.observable();
        //loadCriteria('modalCriteria', 'genericPopup');


        self.clearfilter = function (gId) {
            var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
            gridStorage[0].CallType = ENUM.get("CALLTYPE_NONE");
            CallType = gridStorage[0].CallType;
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);
            ///end
            //CallType = ENUM.get("CALLTYPE_NONE");
            gridFilterClear(gId);
        }
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }


        //open popup
        self.AuditReportModelPopup = ko.observable();
        self.observableModelpopup = ko.observable();

        var compulsoryfieldsforDeviceResults = ['SerialNumber', 'ModelName'];
        var compulsoryfieldsforHierarchyResults = ['HierarchyName'];

        var modelName = "unloadTemplate";
        loadelement(modelName, 'genericPopup', 2);

        setMenuSelection();
        modelReposition();
        self.openPopup = function (popupName, gId) {
            //self.templateFlage;
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                if (gId == "jqxGridAuditLogReportDetails") {
                    self.columnlist(genericHideShowColumn(gId, true, compulsoryfieldsforDeviceResults));
                } else if (gId == "jqxGridHierarchyAuditLogReportDetails") {
                    self.columnlist(genericHideShowColumn(gId, true, compulsoryfieldsforHierarchyResults));
                }
                $('#modelpopup').modal('show');
                loadelement(popupName, 'genericPopup', 2);
            } else if (popupName == "modelExportSucess") {
                loadelement(popupName, 'genericPopup');
                $('#viewAuditReportModal').modal('show');

            }
        }

        //unload template
        self.unloadTempPopup = function (popupName, gridID, exportflage) {
            self.AuditReportModelPopup('unloadTemplate');
        };

        //function loadCriteria(elementname, controllerId) {// Advance Search
        //    if (!ko.components.isRegistered(elementname)) {
        //        //new template code
        //        var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
        //        var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
        //        ko.components.register(elementname, {
        //            viewModel: { require: ViewName },
        //            template: { require: 'plugin/text!' + htmlName }
        //        });
        //    }
        //    self.observableCriteria(elementname);
        //}

        //open popup model
        self.closeOpenModel = function (gridID, modelGridID) {
            //$('#' + gridID).jqxGrid('render');
            //$("#jqxgridAuditReport").jqxGrid('updatebounddata');
            if (modelGridID == "jqxGridAuditLogReportDetails") {
                $('#openModalPopup').modal('hide');
            } else {
                $('#viewDetailsHierarchy').modal('hide');
            }
            gridFilterClear(modelGridID);
            isPopUpOpen = false;
        }

        function loadelement(elementname, controllerId, flag) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            if (flag == 2) {
                self.observableModelpopup(elementname);
            } else {
                self.AuditReportModelPopup(elementname);
            }
        }

        var param = getAuditLogReportParameters(false, []);
        auditLogReportGrid('jqxgridAuditReport', param, self.openPopup, self.columnlist);

        //  ExportToExcel 
        self.exportToExcel = function (isExport, gId) {
            var selectedData = getSelectedData(gId);
            var selectedAuditLogReportItems = new Array();
            selectedAuditLogReportItems.push(selectedData.AuditId);
            if (gId == "jqxgridAuditReport") {
                visibleColumnsList = GetExportVisibleColumn(gId);
                var param = getAuditLogReportParameters(true, visibleColumnsList);
            } else if (gId == "jqxGridAuditLogReportDetails") {
                var param = getAuditLogReportDeviceDetailsParameters(true, auditId, columnSortFilterForAuditHistoryDevices, visibleColumnsListForPopup);
            } else if (gId == "jqxGridHierarchyAuditLogReportDetails") {
                var param = getAuditHistoryHierarchyParameters(true, auditId, columnSortFilterForAuditHistoryDevices, visibleColumnsListForPopup);
            }


            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                if (gId == 'jqxgridAuditReport') {
                    auditLogReportExport(param, gId, self.openPopup);
                } else if (gId == "jqxGridAuditLogReportDetails") {
                    auditLogDetails(param, gId, self.openPopup);
                } else if (gId == "jqxGridHierarchyAuditLogReportDetails") {
                    auditLogHierarchyDetails(param, gId, self.openPopup);
                }
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        //ExportToExcel Goes To this Function
        function auditLogReportExport(param, gId) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetUserActivity';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

        }

        function auditLogDetails(param, gId) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetAuditHistoryDevices';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

        }

        function auditLogHierarchyDetails(param, gId) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetAuditHistoryHierarchies';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

        }

        seti18nResourceData(document, resourceStorage);
    }

    function generateTemplate(tempname, controllerId) {
        //new template code
        var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
        var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
        ko.components.register(tempname, {
            viewModel: { require: ViewName },
            template: { require: 'plugin/text!' + htmlName }
        });
        // end new template code
    }


    //for grid
    function auditLogReportGrid(gID, param) {


        //calculate height of grid
        var gridheight = $(window).height();
        var percentValue;
        if (gridheight > 600) {
            percentValue = (20 / 100) * gridheight;
            gridheight = gridheight - 150;

            gridheight = gridheight - percentValue + 'px';


        } else {
            gridheight = '400px';
        }
        ////////////////

        var InitGridStoragObj = initGridStorageObj(gID, CallType);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var source =
            {
                dataType: "json",
                dataFields: [
                    { name: 'isSelected', type: 'number' },
                    { name: 'ModifiedOn', map: 'Device>CommunicationInfo>ModifiedOn', type: 'date' },
                    { name: 'Verbose', map: 'Verbose' },
                    { name: 'Source', map: 'Source' },
                    { name: 'LoginName', map: 'UserInfo>LoginName' },
                    { name: 'AuditId', map: 'AuditId' },
                    { name: 'IsDetailExists', map: 'IsDetailExists' },
                    { name: 'EntityName', map: 'EntityName' },
                    { name: 'ModifiedBy', map: 'UserInfo>FullName' }

                ],
                root: 'AuditDetails',
                type: "POST",
                data: param,
                url: AppConstants.get('API_URL') + "/GetUserActivity",
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data.getUserActivityResp)
                        data.getUserActivityResp = $.parseJSON(data.getUserActivityResp);
                    else
                        data.getUserActivityResp = [];

                    if (data.getUserActivityResp && data.getUserActivityResp.PaginationResponse) {
                        source.totalrecords = data.getUserActivityResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getUserActivityResp.PaginationResponse.TotalPages;
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
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForAuditReport, gID, gridStorage, 'AuditLogReport', 'ModifiedOn');

                    param.getUserActivityReq.ColumnSortFilter = columnSortFilter;
                    param.getUserActivityReq.CallType = CallType;
                    param.getUserActivityReq.Pagination = getPaginationObject(param.getUserActivityReq.Pagination, gID);

                    updatepaginationOnState(gID, gridStorage, param.getUserActivityReq.Pagination, null, null, param.getUserActivityReq.CallType);

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                    if (data.getUserActivityResp) {
                        if (data.getUserActivityResp.AuditDetails) {
                            for (var h = 0; h < data.getUserActivityResp.AuditDetails.length; h++) {
                                data.getUserActivityResp.AuditDetails[h].Device.CommunicationInfo.ModifiedOn = convertToLocaltimestamp(data.getUserActivityResp.AuditDetails[h].Device.CommunicationInfo.ModifiedOn);
                            }
                            //gridStorage[0].highlightedPage = data.getUserActivityResp.PaginationResponse.HighLightedItemPage;
                            //var updatedGridStorage = JSON.stringify(gridStorage);
                            //window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        } else {
                            data.getUserActivityResp = new Object();
                            data.getUserActivityResp.AuditDetails = [];
                        }
                    } else {
                        data.getUserActivityResp = new Object();
                        data.getUserActivityResp.AuditDetails = [];
                    }


                    $('.all-disabled').hide();
                }
            }
        var dataAdapter = intializeDataAdapter(source, request);



        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'AuditId', element, gridStorage, false, 'pagerDivAuditReport', false, 0, 'AuditId', null, null, null);
            return true;
        }

        var resultsRender = function (row, columnfield, value, defaulthtml, columnproperties) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
            if (rowData.EntityName == "REFERENCESET") {
                if (value == true) {
                    return '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"> <a title="Click to view Audit log Details"  id="imageIdHierarchyAudit" tabindex="0" style="text-decoration:underline;" onClick="openIconPopupHierarchyAuditLogDetails(' + row + ')" height="60" width="50" >View Results</a></div>'
                } else if (value == false) {
                    return " ";
                }
            } else {
                if (value == true) {
                    return '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"> <a title="Click to view Audit log Details"  id="imageIdDeviceAudit" tabindex="0" style="text-decoration:underline;" onClick="openIconPopupAuditLogDetails(' + row + ')" height="60" width="50" >View Results</a></div>'
                } else if (value == false) {
                    return " ";
                }
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

        var initialColumnFilter = function () {
            if (gridStorage[0].isdefaultfilter == 0) {
                var DateObj = Object();
                CallType = ENUM.get("CALLTYPE_WEEK");
                DateObj.ColumnType = 'Date';
                DateObj.FilterDays = 0;
                var fromDate = moment().subtract('days', 6);
                DateObj.FilterValue = moment(fromDate).format('DD/MMM/YYYY');
                DateObj.FilterValueOptional = moment().format('DD/MMM/YYYY');
                DateObj.IsFixedDateRange = true;
                var dateArr = new Array();
                dateArr.push(DateObj);


                var filtergroup = new $.jqx.filter();
                var filter_or_operator = 1;
                var filtervalue = dateArr;
                var filtercondition = 'contains';
                var filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
                filtergroup.addfilter(filter_or_operator, filter);
                return filtergroup;
            }
        }();

        //Grid 
        $("#" + gID).jqxGrid(
            {
                height: gridHeightFunction(gID, "50"),
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
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                rowsheight: 32,
                enabletooltips: true,
                autoshowfiltericon: true,
                rendergridrows: function () {
                    return dataAdapter.records;
                },

                ready: function () {
                    //CallType = addDefaultfilter(CallType, 'ModifiedOn', gID)
                    callOnGridReady(gID, gridStorage, CallType, 'ModifiedOn');

                    var columns = genericHideShowColumn(gID, true, ['AuditId', 'IsDetailExists']);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                },

                columns: [
                    {
                        text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', width: 40, hidden: true,
                        renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        },
                        rendered: rendered,
                    },
                    {
                        text: i18n.t('date_changed', { lng: lang }), datafield: 'ModifiedOn', filter: initialColumnFilter, editable: false, minwidth: 180, enabletooltips: false, cellsformat: LONG_DATETIME_GRID_FORMAT,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('description', { lng: lang }), datafield: 'Verbose', editable: false, minwidth: 200,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                    {
                        text: i18n.t('p_t_source', { lng: lang }), datafield: 'Source', editable: false, minwidth: 120, filterable: true, enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Audit Log Source');
                        },
                    },
                    {
                        text: i18n.t('p_t_copy_modifiedby', { lng: lang }), datafield: 'ModifiedBy', editable: false, minwidth: 180, filterable: true,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                    { text: i18n.t('results', { lng: lang }), datafield: 'IsDetailExists', editable: false, minwidth: 100, menu: false, sortable: false, enabletooltips: false, resizable: false, filterable: false, cellsrenderer: resultsRender },
                    { datafield: 'AuditId', editable: false, minwidth: 100, menu: false, sortable: false, enabletooltips: false, resizable: false, filterable: false, hidden: true }
                ]
            });
        getGridBiginEdit(gID, 'AuditId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'AuditId');
    }


    //Audit Report Parameters
    function getAuditLogReportParameters(isExport, visibleColumns) {
        getUserActivityReq = new Object();
        var FilterList = new Array();

        var Export = new Object();
        var Pagination = new Object();
        var Selector = new Object();
        Export.DynamicColumns = null;

        if (isExport == true) {
            Export.ExportReportType = ENUM.get("AuditLogReport");
            Export.IsAllSelected = false;
            Export.IsExport = true;
        } else {
            Export.ExportReportType = ENUM.get("AuditLogReport");
            Export.IsAllSelected = false;
            Export.IsExport = false;
        }
        Export.VisibleColumns = visibleColumns;

        var columnSortFilter = columnSortFilterForAuditReport;
        var CategoryId = new Object();
        Pagination.HighLightedItemId = null;
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        getUserActivityReq.CategoryId = CategoryId;
        getUserActivityReq.CategoryName = null;
        getUserActivityReq.CallType = CallType;
        getUserActivityReq.ColumnSortFilter = columnSortFilter;
        getUserActivityReq.DeviceSearch = null;
        getUserActivityReq.Export = Export;
        getUserActivityReq.Pagination = Pagination;
        getUserActivityReq.DeviceId = null;
        getUserActivityReq.IsForDeviceProfile = false;
        getUserActivityReq.ModelName = null;
        getUserActivityReq.Source = null;
        var param = new Object();
        param.token = TOKEN();
        param.getUserActivityReq = getUserActivityReq;
        return param;

    }
});

function openIconPopupAuditLogDetails(row) {

    $('#openModalPopup').modal('show');
    $('#mdlAuditLogReportItemHeader').mouseup(function () {
        $("#mdlAuditLogReportItem").draggable({ disabled: true });
    });

    $('#mdlAuditLogReportItemHeader').mousedown(function () {
        $("#mdlAuditLogReportItem").draggable({ disabled: false });
    });
    GetAuditLogReportDeviceDetails(row);
}

function GetAuditLogReportDeviceDetails(row) {

    var self = this;
    auditId = $("#jqxgridAuditReport").jqxGrid('getcellvalue', row, 'AuditId');

    visibleDetailsColumnsList = new Array();
    //grid display
    var param = getAuditLogReportDeviceDetailsParameters(false, auditId, columnSortFilterForAuditHistoryDevices, visibleDetailsColumnsList);
    $("#gridAreaAuditDeviceDetailsDiv").empty();
    $('#gridAreaAuditDeviceDetailsDiv').html('<div id="jqxGridAuditLogReportDetails"></div> <div id="pagerDivAuditReportDetails">');
    GetAuditHistoryDevices('jqxGridAuditLogReportDetails', param);
}

function getAuditLogReportDeviceDetailsParameters(isExport, auditId, columnSortFilterForAuditHistoryDevices, visibleColumns) {
    getAuditHistoryDevicesReq = new Object();

    var Export = new Object();
    var Pagination = new Object();

    Export.DynamicColumns = null;
    Export.ExportReportType = ENUM.get("AuditLogReport");
    Export.IsAllSelected = false;
    Export.IsExport = isExport;
    Export.VisibleColumns = visibleColumns;

    var columnSortFilter = columnSortFilterForAuditHistoryDevices;
    //columnSortFilter.FilterList = (null);
    columnSortFilter.GridId = 'AuditHistoryDevices';
    //columnSortFilter.SortList = null;

    Pagination.HighLightedItemId = null;
    Pagination.PageNumber = 1;
    Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

    getAuditHistoryDevicesReq.ColumnSortFilter = columnSortFilter;
    getAuditHistoryDevicesReq.Export = Export;
    getAuditHistoryDevicesReq.Pagination = Pagination;
    getAuditHistoryDevicesReq.AuditId = auditId;
    getAuditHistoryDevicesReq.UniqueDeviceId = 0;
    if (isExport == true)
        getAuditHistoryDevicesReq.CallType = CallType;
    getAuditHistoryDevicesReq.IsForDeviceProfile = false;
    var param = new Object();
    param.token = TOKEN();
    param.getAuditHistoryDevicesReq = getAuditHistoryDevicesReq;
    return param;

}


function GetAuditHistoryDevices(gID, param) {

    openflag = 1;

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
            { name: 'SerialNumber', map: 'SerialNumber' },
            { name: 'DeviceId', map: 'DeviceId' },
            { name: 'HierarchyFullPath', map: 'HierarchyFullPath' },
            { name: 'ModelName', map: 'ModelName' }
        ],
        root: 'Devices',
        type: 'POST',
        data: param,
        url: AppConstants.get('API_URL') + "/GetAuditHistoryDevices",
        contentType: 'application/json',
        beforeprocessing: function (data) {

            if (data && data.getAuditHistoryDevicesResp) {
                data.getAuditHistoryDevicesResp = $.parseJSON(data.getAuditHistoryDevicesResp);
            } else
                data.getAuditHistoryDevicesResp = [];

            if (data.getAuditHistoryDevicesResp) {
                if (data.getAuditHistoryDevicesResp.PaginationResponse) {
                    source.totalrecords = data.getAuditHistoryDevicesResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getAuditHistoryDevicesResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
            }
        },
    }
    var request =
        {
            formatData: function (data) {
                $('.all-disabled').show();
                disableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
                columnSortFilter = new Object();
                columnSortFilter = columnSortFilterFormatedData(columnSortFilterForAuditHistoryDevices, gID, gridStorage, 'AuditHistoryDevices');
                param.getAuditHistoryDevicesReq.AuditId = auditId;
                param.getAuditHistoryDevicesReq.ColumnSortFilter = columnSortFilter;
                param.getAuditHistoryDevicesReq.CallType = CallType;
                param.getAuditHistoryDevicesReq.Pagination = getPaginationObject(param.getAuditHistoryDevicesReq.Pagination, gID);
                data = JSON.stringify(param);
                return data;
            },
            downloadComplete: function (data, status, xhr) {
                enableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);

                if (data.getAuditHistoryDevicesResp && data.getAuditHistoryDevicesResp.Devices) {
                    if (data.getAuditHistoryDevicesResp.TotalSelectionCount != 'undefined') {
                        gridStorage[0].TotalSelectionCount = data.getAuditHistoryDevicesResp.TotalSelectionCount;
                        var updatedGridStorage = JSON.stringify(gridStorage);
                        window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                    }

                } else {
                    source.totalrecords = 0;
                    data.getAuditHistoryDevicesResp = new Object();
                    data.getAuditHistoryDevicesResp.Devices = [];
                }
                $('.all-disabled').hide();
            }
        }
    var dataAdapter = intializeDataAdapter(source, request);

    //for device profile
    function SerialNoRenderAuditReportLogDetails(row, columnfield, value, defaulthtml, columnproperties) {
        var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
        return html;
    }

    var rendered = function (element) {
        enablegridfunctions(gID, 'DeviceId', element, gridStorage, false, 'pagerDivAuditReportDetails', false, 0, 'DeviceId', null, null, null);
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
                var columns = genericHideShowColumn(gID, true, []);
                for (var i = 0; i < columns.length; i++) {
                    visibleDetailsColumnsList.push(columns[i].columnfield);
                }
                visibleColumnsListForPopup = visibleDetailsColumnsList;
                isPopUpOpen = true;
            },
            columns: [
                {
                    text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', resizable: false, draggable: false,
                    datafield: 'isSelected', width: 40, renderer: function () {
                        return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                    }, rendered: rendered, hidden: true
                },
                {
                    text: i18n.t('serial', { lng: lang }), dataField: 'SerialNumber', editable: false, minwidth: 130, width: 'auto', enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('device_id', { lng: lang }), dataField: 'DeviceId', editable: false, minwidth: 120, width: 'auto', enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('hierarchy_path', { lng: lang }), dataField: 'HierarchyFullPath', editable: false, minwidth: 200, width: 'auto',
                    filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('model', { lng: lang }), dataField: 'ModelName', editable: false, minwidth: 100, width: 'auto', enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
                    }
                }
            ],
        });

    getGridBiginEdit(gID, 'serial', gridStorage);
    callGridFilter(gID, gridStorage);
    callGridSort(gID, gridStorage, 'serial');
}

function openIconPopupHierarchyAuditLogDetails(row) {

    $('#viewDetailsHierarchy').modal('show');
    $('#mdlHierarchyAuditLogReportItemHeader').mouseup(function () {
        $("#mdlHierarchyAuditLogReportItem").draggable({ disabled: true });
    });

    $('#mdlHierarchyAuditLogReportItemHeader').mousedown(function () {
        $("#mdlHierarchyAuditLogReportItem").draggable({ disabled: false });
    });
    GetAuditLogReportHierarchyDetails(row);
}

function GetAuditLogReportHierarchyDetails(row) {

    var self = this;
    auditId = $("#jqxgridAuditReport").jqxGrid('getcellvalue', row, 'AuditId');

    visibleDetailsColumnsList = new Array();
    //grid display
    var param = getAuditHistoryHierarchyParameters(false, auditId, columnSortFilterForAuditHistoryDevices, visibleDetailsColumnsList);
    $("#gridAreaAuditHierarchiesDetailsDiv").empty();
    $('#gridAreaAuditHierarchiesDetailsDiv').html('<div id="jqxGridHierarchyAuditLogReportDetails"></div> <div id="pagerDivHierarchyAuditLogReportDetails">');
    GetAuditHistoryHierarchies('jqxGridHierarchyAuditLogReportDetails', param);
}

function getAuditHistoryHierarchyParameters(isExport, auditId, columnSortFilterForAuditHistoryDevices, visibleColumns) {
    getAuditHistoryHierarchiesReq = new Object();

    var Export = new Object();
    var Pagination = new Object();

    Export.DynamicColumns = null;
    Export.ExportReportType = ENUM.get("AuditLogReport");
    Export.IsAllSelected = false;
    Export.IsExport = isExport;
    Export.VisibleColumns = visibleColumns;

    var columnSortFilter = columnSortFilterForAuditHistoryDevices;
    //columnSortFilter.FilterList = (null);
    columnSortFilter.GridId = 'AuditHistoryHierarchies';
    //columnSortFilter.SortList = null;

    Pagination.HighLightedItemId = null;
    Pagination.PageNumber = 1;
    Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

    getAuditHistoryHierarchiesReq.AuditId = auditId;
    getAuditHistoryHierarchiesReq.ColumnSortFilter = columnSortFilter;
    getAuditHistoryHierarchiesReq.Export = Export;
    getAuditHistoryHierarchiesReq.Pagination = Pagination;
    getAuditHistoryHierarchiesReq.IsForDeviceProfile = false;
    var param = new Object();
    param.token = TOKEN();
    param.getAuditHistoryHierarchiesReq = getAuditHistoryHierarchiesReq;
    return param;

}

function GetAuditHistoryHierarchies(gID, param) {

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
            { name: 'HierarchyName', map: 'HierarchyName' },
            { name: 'HierarchyPath', map: 'HierarchyFullPath' }
        ],
        root: 'Hierarchies',
        type: 'POST',
        data: param,
        url: AppConstants.get('API_URL') + "/GetAuditHistoryHierarchies",
        contentType: 'application/json',
        beforeprocessing: function (data) {

            if (data && data.getAuditHistoryHierarchiesResp) {
                data.getAuditHistoryHierarchiesResp = $.parseJSON(data.getAuditHistoryHierarchiesResp);
            } else
                data.getAuditHistoryHierarchiesResp = [];

            if (data.getAuditHistoryHierarchiesResp) {
                if (data.getAuditHistoryHierarchiesResp.PaginationResponse) {
                    source.totalrecords = data.getAuditHistoryHierarchiesResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getAuditHistoryHierarchiesResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
            }
        },
    }
    var request =
        {
            formatData: function (data) {
                $('.all-disabled').show();
                disableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
                columnSortFilter = new Object();
                columnSortFilter = columnSortFilterFormatedData(columnSortFilterForAuditHistoryDevices, gID, gridStorage, 'AuditHistoryHierarchies');
                param.getAuditHistoryHierarchiesReq.AuditId = auditId;
                param.getAuditHistoryHierarchiesReq.ColumnSortFilter = columnSortFilter;
                param.getAuditHistoryHierarchiesReq.CallType = CallType;
                param.getAuditHistoryHierarchiesReq.Pagination = getPaginationObject(param.getAuditHistoryHierarchiesReq.Pagination, gID);
                data = JSON.stringify(param);
                return data;
            },
            downloadComplete: function (data, status, xhr) {
                enableIcons(['btnHierarchyRestFilter', 'btnHierarchyShowHide', 'btnHierarchyExport', 'btnHierarchyRefresh']);

                if (data.getAuditHistoryHierarchiesResp && data.getAuditHistoryHierarchiesResp.Hierarchies) {
                    if (data.getAuditHistoryHierarchiesResp.TotalSelectionCount != 'undefined') {
                        gridStorage[0].TotalSelectionCount = data.getAuditHistoryHierarchiesResp.TotalSelectionCount;
                        var updatedGridStorage = JSON.stringify(gridStorage);
                        window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                    }

                } else {
                    source.totalrecords = 0;
                    data.getAuditHistoryHierarchiesResp = new Object();
                    data.getAuditHistoryHierarchiesResp.Hierarchies = [];
                }
                $('.all-disabled').hide();
            }
        }
    var dataAdapter = intializeDataAdapter(source, request);

    //Custom filter
    var buildFilterPanel = function (filterPanel, datafield) {
        genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
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
                var columns = genericHideShowColumn(gID, false, []);
                for (var i = 0; i < columns.length; i++) {
                    visibleDetailsColumnsList.push(columns[i].columnfield);
                }
                visibleColumnsListForPopup = visibleDetailsColumnsList;
                isPopUpOpen = true;
            },
            columns: [
                {
                    text: i18n.t('hierarchy_name', { lng: lang }), dataField: 'HierarchyName', editable: false, minwidth: 130, width: 'auto', enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('hierarchy_path', { lng: lang }), dataField: 'HierarchyPath', editable: false, minwidth: 200, width: 'auto',
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                }
            ],
        });

    getGridBiginEdit(gID, 'serial', gridStorage);
    callGridFilter(gID, gridStorage);
    callGridSort(gID, gridStorage, 'serial');
}
