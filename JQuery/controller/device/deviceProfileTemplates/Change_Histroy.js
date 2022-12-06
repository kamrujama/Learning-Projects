define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho) {

    SelectedIdOnGlobale = new Array
    columnSortFilter = new Object();
    columnSortFilterForAuditHistoryDevices = new Object();
    openflagChangeHistory = 0;
    packageNameApplication = "";
    var lang = getSysLang();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function downloadLibararyappViewModel() {


        SelectedIdOnGlobale = new Array();
        checkALlPageId = 0;
        pagechangedcheck = 0;
        totalselectedRowCount = 0;
        var self = this;
        openflagChangeHistory = 0;
        self.checksample = ko.observable();
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['ModifiedByUserName', 'IsDetailExists'];
        var compulsoryfieldsforpopup = ['SerialNumber', 'ModelName'];
        self.columnlist = ko.observableArray();

        $("#openModalPopupAuditReportDetails").on('keydown', function (e) {
            if (e.keyCode == 27) {
                isPopUpOpen = false;
            }
        });

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
            //$('#' + gridID).jqxGrid('render');
            $("#jqxgridChangeHistory").jqxGrid('updatebounddata');
            $('#openModalPopupAuditReportDetails').modal('hide');
            // gridFilterClear(modelGridID);
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
            self.observableModelPopup(elementname);
        }
        modelReposition();
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist('');
                if (!isPopUpOpen)
                    self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));
                else
                    self.columnlist(genericHideShowColumn(gId, true, compulsoryfieldsforpopup));
                loadelement(popupName, 'genericPopup');
                $('#downloadModel').modal('show');
            }
        }

        //unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
        }
        
        self.exportToExcel = function (isExport, gId) {
            var param = null;
            var isAuditLogReport = false;
            if (gId == "jqxgridChangeHistory") {
                visibleColumnsList = GetExportVisibleColumn(gId);
                param = getChangehistoryParameters(true, columnSortFilter, visibleColumnsList);
                isAuditLogReport = false;
            }
            else if (gId == "jqxGridChangeHistoryAuditLogReportDetails") {
                param = getChangeHistoryDeviceDetailsParameters(true, auditId, columnSortFilterForAuditHistoryDevices, visibleColumnsListForPopup);
                isAuditLogReport = true;
            }

            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflag = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
           if (datainfo.rowscount > 0) {
               userActivityExport(param, gId, self.openPopup, isAuditLogReport);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function userActivityExport(param, gId, openPopup, isAuditLogReport) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    } 
                }
            }
            var method = 'GetUserActivity';
            if (isAuditLogReport)
                method = 'GetAuditHistoryDevices';

            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }



        var param = getChangehistoryParameters(false, columnSortFilter);
        changeHistoryGrid('jqxgridChangeHistory', param);

        seti18nResourceData(document, resourceStorage);
    };

    //for grid
    function changeHistoryGrid(gID, param) {
        var isFilter;
        if (ischangeHistoryGridFilter == undefined || ischangeHistoryGridFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        ischangeHistoryGridFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var source =
        {
            dataType: "json",
            dataFields: [
                     { name: 'isSelected', type: 'number' },
                     { name: 'SerialNumber', map: 'Device>SerialNumber' },
                     { name: 'ModifiedOn', map: 'ModifiedOn', type: 'date' },
                     { name: 'Verbose', map: 'Verbose' },
                     { name: 'Source', map: 'Source' },
                     { name: 'ModifiedByUserName', map: 'Device>CommunicationInfo>ModifiedByUserName' },
                     { name: 'AuditId', map: 'AuditId' },
                     { name: 'IsDetailExists', map: 'IsDetailExists' }
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

        var request=
            {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'AuditLogForDeviceProfile');
                    param.getUserActivityReq.ColumnSortFilter = columnSortFilter;
                    param.getUserActivityReq.Pagination = getPaginationObject(param.getUserActivityReq.Pagination, gID);
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    
                    if (data.getUserActivityResp && data.getUserActivityResp.AuditDetails) {
                        for (var i = 0; i < data.getUserActivityResp.AuditDetails.length; i++) {
                            data.getUserActivityResp.AuditDetails[i].ModifiedOn = convertToLocaltimestamp(data.getUserActivityResp.AuditDetails[i].ModifiedOn);
                        }
                        //if (data.getUserActivityResp.PaginationResponse && data.getUserActivityResp.PaginationResponse.HighLightedItemPage > 0) {
                        //    gridStorage[0].highlightedPage = data.getUserActivityResp.PaginationResponse.HighLightedItemPage;
                        //    var updatedGridStorage = JSON.stringify(gridStorage);
                        //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        //}

                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getUserActivityResp = new Object();
                        data.getUserActivityResp.AuditDetails = [];

                    }
                    $('.all-disabled').hide();
                }
            }
      

        var dataAdapter = intializeDataAdapter(source, request);
        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'AuditId', element, gridStorage, false, 'pagerDivChangeHistory', false, 0, 'AuditId', null, null, null);
            return true;
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

        var resultsRender = function (row, columnfield, value, defaulthtml, columnproperties) {
            if (value == true) {
                return '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"> <a title="Click to view Change history Details"  id="imageId" style="text-decoration:underline;" onClick="openIconPopupAuditLogDetailsChangeHistory(' + row + ')" height="60" width="50" >View Results</a></div>'
            } else if (value == false) {
                return " ";
            }
        }

        $("#" + gID).jqxGrid(
        {
            width: "100%",
            height: gridHeightFunction(gID, "30"),
            pageable: true,
            editable: true,
            source: dataAdapter,
            altRows: true,
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
                callOnGridReady(gID, gridStorage, CallType, '');
                var columns = genericHideShowColumn(gID, true, ['IsDetailExists']);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;
            },
            columns: [
                    {
                        text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, hidden: true, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected',  renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    { text: '', dataField: 'AuditId', hidden: true, editable: false, minwidth: 0 },
                    {
                        text: i18n.t('serial', { lng: lang }), dataField: 'SerialNumber', editable: false, minwidth: 100, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                      {
                          text: i18n.t('date_changed', { lng: lang }), datafield: 'ModifiedOn', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 150,  filterable: true, editable: false,
                          filtertype: "custom",
                          createfilterpanel: function (datafield, filterPanel) {
                              buildFilterPanelDate(filterPanel, datafield);

                          }
                      },
                     {
                         text: i18n.t('description', { lng: lang }), dataField: 'Verbose', editable: false, minwidth: 120,
                         filtertype: "custom",
                         createfilterpanel: function (datafield, filterPanel) {
                             buildFilterPanel(filterPanel, datafield);
                         }
                     },
                      {
                            text: i18n.t('p_t_source', { lng: lang }), datafield: 'Source', editable: false, minwidth: 100,filterable: true, enabletooltips: false,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelMultiChoice(filterPanel, datafield, 'Audit Log Source');
                            },
                        },
                      {
                          text: i18n.t('modified_by_audit', { lng: lang }), dataField: 'ModifiedByUserName', editable: false, minwidth: 100, 
                          filtertype: "custom",
                          createfilterpanel: function (datafield, filterPanel) {
                              buildFilterPanel(filterPanel, datafield);
                          }
                      },
                      { text: i18n.t('results', { lng: lang }), datafield: 'IsDetailExists', editable: false, minwidth: 100,  menu: false, sortable: false, enabletooltips: false, resizable: false, filterable: false, cellsrenderer: resultsRender }
                   
            ]
        });
        getGridBiginEdit(gID, 'AuditId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'AuditId');
    }

    function getChangehistoryParameters(isExport, columnSortFilter, visibleColumns) {
        var getUserActivityReq = new Object();
        var Export = new Object();
        var Selector = new Object();

        var Pagination = new Object();
        var device = new Object();

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

        getUserActivityReq.Device = device;
        getUserActivityReq.CallType = ENUM.get("CALLTYPE_NONE");
        getUserActivityReq.CategoryId = koUtil.deviceProfileUniqueDeviceId;
        getUserActivityReq.CategoryName = "Device";
        getUserActivityReq.DeviceId = koUtil.deviceId;
        getUserActivityReq.IsForDeviceProfile =true;
        getUserActivityReq.ModelName = koUtil.ModelName;
        getUserActivityReq.Source = null;
        getUserActivityReq.Pagination = Pagination;
        getUserActivityReq.ColumnSortFilter = ColumnSortFilter;
        getUserActivityReq.Export = Export;

        var param = new Object();
        param.token = TOKEN();
        param.getUserActivityReq = getUserActivityReq;

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

function openIconPopupAuditLogDetailsChangeHistory(row) {

    $('#openModalPopupAuditReportDetails').modal('show');
    $('#mdlÄuditReportLogsHeader').mouseup(function () {
        $("#mdlÄuditReportLogs").draggable({ disabled: true });
    });

    $('#mdlÄuditReportLogsHeader').mousedown(function () {
        $("#mdlÄuditReportLogs").draggable({ disabled: false });
    });
    GetChangeHistoryDeviceDetails(row);
}

function GetChangeHistoryDeviceDetails(row) {

    var self = this;
    auditId = $("#jqxgridChangeHistory").jqxGrid('getcellvalue', row, 'AuditId');

    visibleDetailsColumnsList = new Array();
    //grid display

    isPopUpOpen = true;
    var param = getChangeHistoryDeviceDetailsParameters(false, auditId, columnSortFilterForAuditHistoryDevices, visibleDetailsColumnsList);
    if (openflagChangeHistory == 0) {
        GetAuditHistoryDevices('jqxGridChangeHistoryAuditLogReportDetails', param);
    } else {
        $("#jqxGridChangeHistoryAuditLogReportDetails").jqxGrid('updatebounddata');
    }
}

function getChangeHistoryDeviceDetailsParameters(isExport, auditId, columnSortFilterForAuditHistoryDevices, visibleColumns) {
    getAuditHistoryDevicesReq = new Object();

    var Export = new Object();
    var Pagination = new Object();

    Export.DynamicColumns = null;
    Export.ExportReportType = ENUM.get("AuditLogReport");
    Export.IsAllSelected = false;
    Export.IsExport = isExport;
    Export.VisibleColumns = visibleColumns;

    var columnSortFilter = columnSortFilterForAuditHistoryDevices;
    columnSortFilter.GridId = 'AuditHistoryDevices';

    Pagination.HighLightedItemId = null;
    Pagination.PageNumber = 1;
    Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

    getAuditHistoryDevicesReq.ColumnSortFilter = columnSortFilter;
    getAuditHistoryDevicesReq.Export = Export;
    getAuditHistoryDevicesReq.Pagination = Pagination;
    getAuditHistoryDevicesReq.AuditId = auditId;
    getAuditHistoryDevicesReq.UniqueDeviceId = koUtilUniqueDeviceId;
    if (isExport == true)
        getAuditHistoryDevicesReq.CallType = CallType;
    getAuditHistoryDevicesReq.IsForDeviceProfile = true;
    var param = new Object();
    param.token = TOKEN();
    param.getAuditHistoryDevicesReq = getAuditHistoryDevicesReq;
    return param;

}


function GetAuditHistoryDevices(gID, param) {

    openflagChangeHistory = 1;

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
            }
            else
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
    var dataAdapter = new $.jqx.dataAdapter(source,
       {
           formatData: function (data) {
               $('.all-disabled').show();
               disableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
               columnSortFilter = new Object();
               columnSortFilter = columnSortFilterFormatedData(columnSortFilterForAuditHistoryDevices, gID, gridStorage, 'AuditHistoryDevices');

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
           },
           loadError: function (jqXHR, status, error) {
               $('.all-disabled').hide();
               openAlertpopup(2, 'network_error');
           }
       }
   );

    //for device profile
    function SerialNoRenderAuditReportLogDetails(row, columnfield, value, defaulthtml, columnproperties) {
        var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
        return html;
    }

    var rendered = function (element) {
        enablegridfunctions(gID, 'DeviceId', element, gridStorage, false, 'pagerDivChangeHistoryAuditReportDetails', false, 0, 'DeviceId', null, null, null);
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
            },
            columns: [
                 {
                     text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', resizable: false, draggable: false,
                     datafield: 'isSelected', renderer: function () {
                         return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                     }, rendered: rendered, hidden: true
                 },
                  {
                      text: i18n.t('serial', { lng: lang }), dataField: 'SerialNumber', editable: false, minwidth: 100, enabletooltips: false,
                      filtertype: "custom",
                      createfilterpanel: function (datafield, filterPanel) {
                          buildFilterPanel(filterPanel, datafield);
                      }
                  },
                    {
                        text: i18n.t('device_id', { lng: lang }), dataField: 'DeviceId', editable: false, minwidth: 100,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('hierarchy_path', { lng: lang }), dataField: 'HierarchyFullPath', editable: false, minwidth: 150,
                        filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('model', { lng: lang }), dataField: 'ModelName', editable: false, minwidth: 90,  enabletooltips: false,
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
