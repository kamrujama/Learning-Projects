var gId = '';
define(["knockout", "koUtil", "download", "constants", "globalFunction"], function (ko, koUtil) {
    var lang = getSysLang();
    columnSortFilterForImport = new Object();
    columnSortFilterForExport = new Object();
    columnSortFilterForTaskStatus = new Object();
    columnSortFilterTaskStatusDetails = new Object();
    scheduleSoftwareQueueId = 0;

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function DeviceSearchdViewModel() {
        var self = this;

        $('#btnRefresh').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnRefresh').click();
            }
        });

        $('#modalTaskStatusHeader').mouseup(function () {
            $("#modalTaskStatusContent").draggable({ disabled: true });
        });

        $('#modalTaskStatusHeader').mousedown(function () {
            $("#modalTaskStatusContent").draggable({ disabled: false });
        });

        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        self.gridIdForShowHide = ko.observableArray();
        self.columnlist = ko.observableArray();
        var compulsoryfields = ['FileName', 'LogFileName', 'FileUrl'];
        var modelname = 'unloadTemplate';
        var isImportGridLoaded = false;
        var isExportGridLoaded = false;
        var isTaskStatusGridLoaded = false;
        var tabStorage = new Object();
        gId = 'jqxgridImport';

        init();
        function init() {
            loadelement(modelname, 'genericPopup');
            modelReposition();
            setMenuSelection();
            setTabStorage();
            setTabSelection();
        }

        function setTabStorage() {
            tabStorage = JSON.parse(sessionStorage.getItem("statusStorage"));
            if (tabStorage == null) {
                var exportStorageArr = new Array();

                var exportStorageObj = new Object();
                exportStorageObj.isImport = 1;
                exportStorageObj.isExport = 0;
                exportStorageObj.isTaskStatus = 0;

                exportStorageArr.push(exportStorageObj);
                tabStorage = JSON.stringify(exportStorageArr);
                window.sessionStorage.setItem('statusStorage', tabStorage);
                tabStorage = JSON.parse(sessionStorage.getItem("statusStorage"));
            }
        }

        function setTabSelection() {
            if (!_.isEmpty(tabStorage) && tabStorage.length > 0) {
                if (tabStorage[0].isImport === 1) {
                    showSelectedTab(0);

                    var param = getImportParameters(columnSortFilterForImport);
                    importGrid('jqxgridImport', param);
                    isImportGridLoaded = true;
                } else if (tabStorage[0].isExport === 1) {
                    showSelectedTab(1);

                    var param = getExportParameters(columnSortFilterForExport);
                    exportGrid("jqxgridExport", param);
                    isExportGridLoaded = true;
                } else if (tabStorage[0].isTaskStatus === 1) {
                    showSelectedTab(2);

                    var param = getTaskStatusParameters(columnSortFilterForTaskStatus);
                    taskStatusGrid('jqxgridTaskStatus', param);
                    isTaskStatusGridLoaded = true;
                }
            } else {
                showSelectedTab(0);

                var param = getImportParameters(columnSortFilterForImport);
                importGrid('jqxgridImport', param);
                isImportGridLoaded = true;
            }
        }

        self.unloadTempPopup = function (popupName, gId) {
            self.observableModelPopup(popupName);
        }

        self.openPopup = function (popupName) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));

                if (visibleColumnsList.length == 0) {
                    var columns = self.columnlist();
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                }

                loadelement(popupName, 'genericPopup');
                $('#downloadModel').modal('show');
            } else {
                loadelement(popupName, 'exports');
                $('#deviceModel').modal('show');
            }
        }

        self.clearFilter = function () {
            gridFilterClear(gId);
        }

        self.refreshGrid = function () {
            gridRefresh(gId);
        }

        self.showImportStatus = function () {
            showSelectedTab(0);
            if (isImportGridLoaded) {
                $("#jqxgridImport").jqxGrid('updatebounddata');
            } else {
                var param = getImportParameters(columnSortFilterForImport);
                importGrid("jqxgridImport", param);
                isImportGridLoaded = true;
            }

            var statusStorage = JSON.parse(sessionStorage.getItem("statusStorage"));
            statusStorage[0].isImport = 1;
            statusStorage[0].isExport = 0;
            statusStorage[0].isTaskStatus = 0;
            var statusStorageObject = JSON.stringify(statusStorage);
            window.sessionStorage.setItem('statusStorage', statusStorageObject);
        }

        self.showExportStatus = function () {
            showSelectedTab(1);
            if (isExportGridLoaded) {
                $("#jqxgridExport").jqxGrid('updatebounddata');
            } else {
                var param = getExportParameters(columnSortFilterForExport);
                exportGrid("jqxgridExport", param);
                isExportGridLoaded = true;
            }

            var statusStorage = JSON.parse(sessionStorage.getItem("statusStorage"));
            statusStorage[0].isImport = 0;
            statusStorage[0].isExport = 1;
            statusStorage[0].isTaskStatus = 0;
            var statusStorageObject = JSON.stringify(statusStorage);
            window.sessionStorage.setItem('statusStorage', statusStorageObject);
        }

        self.showTaskStatus = function () {
            showSelectedTab(2);
            if (isTaskStatusGridLoaded) {
                $("#jqxgridTaskStatus").jqxGrid('updatebounddata');
            } else {
                var param = getTaskStatusParameters(columnSortFilterForTaskStatus);
                taskStatusGrid("jqxgridTaskStatus", param);
                isTaskStatusGridLoaded = true;
            }

            var statusStorage = JSON.parse(sessionStorage.getItem("statusStorage"));
            statusStorage[0].isImport = 0;
            statusStorage[0].isExport = 0;
            statusStorage[0].isTaskStatus = 1;
            var statusStorageObject = JSON.stringify(statusStorage);
            window.sessionStorage.setItem('statusStorage', statusStorageObject);
        }

        function showSelectedTab(tabIndex) {
            if (tabIndex === 0) {
                $("#importli").addClass('active');
                $("#exportli").removeClass('active');
                $("#taskStatusli").removeClass('active');
                $("#importStatus").addClass('active');
                $("#exportStatus").removeClass('active');
                $("#taskStatus").removeClass('active');
                $("#importStatus").show();
                $("#exportStatus").hide();
                $("#taskStatus").hide();
                gId = 'jqxgridImport';
            } else if (tabIndex === 1) {
                $("#exportli").addClass('active');
                $("#importli").removeClass('active');
                $("#taskStatusli").removeClass('active');
                $("#exportStatus").addClass('active');
                $("#importStatus").removeClass('active');
                $("#taskStatus").removeClass('active');
                $("#exportStatus").show();
                $("#importStatus").hide();
                $("#taskStatus").hide();
                gId = 'jqxgridExport';
            } else if (tabIndex === 2) {
                $("#taskStatusli").addClass('active');
                $("#importli").removeClass('active');
                $("#exportli").removeClass('active');
                $("#taskStatus").addClass('active');
                $("#importStatus").removeClass('active');
                $("#exportStatus").removeClass('active');
                $("#taskStatus").show();
                $("#importStatus").hide();
                $("#exportStatus").hide();
                gId = 'jqxgridTaskStatus';
            }
        }

        self.exportToExcel = function (isExport, gId) {
            var dataInfo = $("#" + gId).jqxGrid('getdatainformation');
            var param = getTaskStatusDetailsParam(true, columnSortFilterTaskStatusDetails, scheduleSoftwareQueueId, visibleDetailsColumnsList);
            if (dataInfo.rowscount > 0) {
                getTaskStatusDetailsExport(param);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        self.closeViewDetails = function (gridID, modelPopup) {
            $('#' + gridID).jqxGrid('render');
            $('#' + modelPopup).modal('hide');
            isPopUpOpen = false;
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        seti18nResourceData(document, resourceStorage);
    }

    function generateTemplate(tempname, controllerId) {
        var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
        var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
        ko.components.register(tempname, {
            viewModel: { require: ViewName },
            template: { require: 'plugin/text!' + htmlName }
        });
    }

    function getImportParameters(columnSortFilterForImport) {
        var getImportDeviceStatusReq = new Object();
        var Pagination = new Object();
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getImportDeviceStatusReq.ColumnSortFilter = columnSortFilterForImport;
        getImportDeviceStatusReq.Pagination = Pagination;

        var param = new Object();
        param.token = TOKEN();
        param.getImportDeviceStatusReq = getImportDeviceStatusReq;

        return param;
    }

    function getExportParameters(columnSortFilterForExport) {
        var getExportedAndImportedItemsReq = new Object();
        var Pagination = new Object();
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getExportedAndImportedItemsReq.ColumnSortFilter = columnSortFilterForExport;
        getExportedAndImportedItemsReq.Pagination = Pagination;

        var param = new Object();
        param.token = TOKEN();
        param.getExportedAndImportedItemsReq = getExportedAndImportedItemsReq;

        return param;
    }

    function getTaskStatusParameters(columnSortFilterForTaskStatus) {
        var getScheduleSofwareStatusReq = new Object();
        var Pagination = new Object();
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getScheduleSofwareStatusReq.ColumnSortFilter = columnSortFilterForTaskStatus;
        getScheduleSofwareStatusReq.Pagination = Pagination;

        var param = new Object();
        param.token = TOKEN();
        param.getScheduleSofwareStatusReq = getScheduleSofwareStatusReq;

        return param;
    }

    function importGrid(gID, param) {
        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        var gridheight = $(window).height();
        var percentValue;
        if (gridheight > 600) {
            percentValue = (25 / 100) * gridheight;
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
                { name: 'ImportQueueId', map: 'ImportQueueId' },
                { name: 'FileName', map: 'FileName' },
                { name: 'ImportedBy', map: 'ImportedBy' },
                { name: 'ImportedOn', map: 'ImportedOn', type: 'date' },
                { name: 'Mode', map: 'Mode' },
                { name: 'Status', map: 'Status' },
                { name: 'LogFileName', map: 'LogFileName' },
                { name: 'ParameterResultFile', map: 'ParameterResultFile' },
                { name: 'AdditionalStatus', map: 'AdditionalStatus' }
            ],
            root: 'ImportDevicesResults',
            type: "POST",
            data: param,
            url: AppConstants.get('API_URL') + "/GetImportDeviceStatus",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getImportDeviceStatusResp)
                    data.getImportDeviceStatusResp = $.parseJSON(data.getImportDeviceStatusResp);
                else
                    data.getImportDeviceStatusResp = [];
                if (data.getImportDeviceStatusResp && data.getImportDeviceStatusResp.PaginationResponse) {
                    source.totalrecords = data.getImportDeviceStatusResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getImportDeviceStatusResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
            },
        };

        var dataAdapter = new $.jqx.dataAdapter(source,
            {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForImport, gID, gridStorage, 'Import');
                    param.getImportDeviceStatusReq.ColumnSortFilter = columnSortFilter;
                    param.getImportDeviceStatusReq.Pagination = getPaginationObject(param.getImportDeviceStatusReq.Pagination, gID);

                    updatepaginationOnState(gID, gridStorage, param.getImportDeviceStatusReq.Pagination, null, null);

                    data = JSON.stringify(param);
                    return data;
                }, downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                    if (data.getImportDeviceStatusResp) {
                        if (data.getImportDeviceStatusResp.ImportDevicesResults && data.getImportDeviceStatusResp.ImportDevicesResults.length > 0) {
                            for (var i = 0; i < data.getImportDeviceStatusResp.ImportDevicesResults.length; i++) {
                                data.getImportDeviceStatusResp.ImportDevicesResults[i].ImportedOn = convertToLocaltimestamp(data.getImportDeviceStatusResp.ImportDevicesResults[i].ImportedOn);
                            }
                        }
                        if (data.getImportDeviceStatusResp.PaginationResponse && data.getImportDeviceStatusResp.ImportDevicesResults) {
                            //for (var h = 0; h < data.getImportDeviceStatusResp.ImportDevicesResults.length; h++) {
                            //if (data.getImportDeviceStatusResp.ImportDevicesResults[h].ImportQueueId == data.getImportDeviceStatusResp.PaginationResponse.HighLightedItemId) {
                            //gridStorage[0].highlightedPage = data.getImportDeviceStatusResp.PaginationResponse.HighLightedItemPage;
                            //var updatedGridStorage = JSON.stringify(gridStorage);
                            //window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            //}
                            //}

                        } else {
                            source.totalrecords = 0;
                            source.totalpages = 0;
                            data.getImportDeviceStatusResp = new Object();
                            data.getImportDeviceStatusResp.ImportDevicesResults = [];
                        }
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getImportDeviceStatusResp = new Object();
                        data.getImportDeviceStatusResp.ImportDevicesResults = [];
                    }
                    $('.all-disabled').hide();
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                }
            }
        );

        var rendered = function (element) {
            enablegridfunctions(gID, 'ImportQueueId', element, gridStorage, false, 'pagerDivImport', false, 0, 'ImportQueueId', null, null, null);
            return true;
        }

        var downloadDeviceLogFile = function (row, columnfield, value, defaulthtml, columnproperties) {
            var status = $("#" + gID).jqxGrid('getcellvalue', row, 'Status');
            var fileName = $("#" + gID).jqxGrid('getcellvalue', row, 'FileName');

            // Get file name from url
            var filename = value.substring(value.lastIndexOf("/") + 1).split("?")[0];
            if ((status == AppConstants.get('EXPORT_COMPLETED') || status == AppConstants.get('EXPORT_FAILED') || status == AppConstants.get('EXPORT_COMPLETED_WITH_ERRORS')) && columnfield == 'LogFileName' && value != '') {
                return '<a  id="imageId" onClick="tempimportdownload(\'' + row + '\',\'' + columnfield + '\')", class="btn default" target="_blank" style="margin-left: 5px;" height="60" title="Download" width="50" ><i class="icon-download3"></i></a>';
            } else {
                return '<a  id="imageId" disabled="true" class="btn disabled" title="Download" style="margin-left: 5px;" height="60" width="50" ><i class="icon-download3" ></i></a>';
            }
        }

        var downloadParameterResultFile = function (row, columnfield, value, defaulthtml, columnproperties) {
            var status = $("#" + gID).jqxGrid('getcellvalue', row, 'Status');
            var fileName = $("#" + gID).jqxGrid('getcellvalue', row, 'FileName');

            // Get file name from url
            var filename = value.substring(value.lastIndexOf("/") + 1).split("?")[0];
            if ((status == AppConstants.get('EXPORT_COMPLETED') || status == AppConstants.get('EXPORT_FAILED') || status == AppConstants.get('EXPORT_COMPLETED_WITH_ERRORS')) && columnfield == 'ParameterResultFile' && value != '') {
                return '<a  id="imageId" onClick="tempimportdownload(\'' + row + '\',\'' + columnfield + '\')", class="btn default" target="_blank" style="margin-left: 5px;" height="60" title="Download" width="50" ><i class="icon-download3"></i></a>';
            } else {
                return '<a  id="imageId" disabled="true" class="btn disabled" title="Download" style="margin-left: 5px;" height="60" width="50" ><i class="icon-download3" ></i></a>';
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
                height: gridHeightFunction(gID, "Export"),
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
                rowsheight: 32,
                enabletooltips: true,
                rendergridrows: function () {
                    return dataAdapter.records;
                },
                ready: function () {
                    callOnGridReady(gID, gridStorage);
                    var gridheight = $(window).height();
                    if (gridheight > 600) {
                        gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 38;
                    } else {
                        gridheight = '400px';
                    }
                    $("#" + gID).jqxGrid({ height: gridheight });
                },
                autoshowfiltericon: true,

                columns: [
                    {
                        text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox',
                        datafield: 'isSelected', width: 40, hidden: true,
                        renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    { text: '', datafield: 'ImportQueueId', hidden: true, editable: false, width: 'auto' },
                    {
                        text: i18n.t('dgcol_FileName', { lng: lang }), datafield: 'FileName', editable: false, minwidth: 200,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('dgcol_RequestedBy', { lng: lang }), datafield: 'ImportedBy', editable: false, minwidth: 110,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('dgcol_RequestedOn', { lng: lang }), datafield: 'ImportedOn', editable: false, minwidth: 150, cellsformat: LONG_DATETIME_GRID_FORMAT,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('mode', { lng: lang }), datafield: 'Mode', editable: false, minwidth: 80,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Import Mode');
                        }
                    },
                    {
                        text: i18n.t('dgcol_Status', { lng: lang }), datafield: 'Status', editable: false, minwidth: 100,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Import Status');
                        }
                    },
                    { text: i18n.t('dgcol_Download_DeviceLogs_File', { lng: lang }), filterable: false, sortable: false, menu: false, dataField: 'LogFileName', editable: false, minwidth: 80, width: 180, enabletooltips: false, cellsrenderer: downloadDeviceLogFile },
                    { text: i18n.t('dgcol_Download_ParamResult_File', { lng: lang }), filterable: false, sortable: false, menu: false, dataField: 'ParameterResultFile', editable: false, minwidth: 80, width: 200, enabletooltips: false, cellsrenderer: downloadParameterResultFile },
                    {
                        text: i18n.t('additional_info', { lng: lang }), datafield: 'AdditionalStatus', editable: false, minwidth: 120,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    }
                ]
            });

        getGridBiginEdit(gID, 'ImportQueueId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'ImportQueueId');
    }

    function exportGrid(gID, param) {
        CallType = ENUM.get("CALLTYPE_NONE");
        var InitGridStoragObj = initGridStorageObj(gID, CallType);
        var gridStorage = InitGridStoragObj.gridStorage;
        var gridheight = $(window).height();
        var percentValue;
        if (gridheight > 600) {
            percentValue = (25 / 100) * gridheight;
            gridheight = gridheight - 150;
            gridheight = gridheight - percentValue + 'px';

        } else {
            gridheight = '400px';
        }

        var source =
        {
            dataType: "json",
            dataFields: [
                { name: 'ExportImportQueueId', map: 'ExportImportQueueId' },
                { name: 'Operation', map: 'Operation' },
                { name: 'RequestedOn', map: 'RequestedOn', type: 'date' },
                { name: 'ExportedBy', map: 'ExportedBy' },
                { name: 'Status', map: 'Status' },
                { name: 'FileName', map: 'FileName' },
                { name: 'FileUrl', map: 'FileUrl' },
            ],
            root: 'ExportImportItems',
            type: "POST",
            data: param,
            url: AppConstants.get('API_URL') + "/GetExportedAndImportedItems",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getExportedAndImportedItemsResp)
                    data.getExportedAndImportedItemsResp = $.parseJSON(data.getExportedAndImportedItemsResp);
                else
                    data.getExportedAndImportedItemsResp = [];

                if (data.getExportedAndImportedItemsResp && data.getExportedAndImportedItemsResp.PaginationResponse) {
                    source.totalrecords = data.getExportedAndImportedItemsResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getExportedAndImportedItemsResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
            },

        };
        var dataAdapter = new $.jqx.dataAdapter(source,
            {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    columnSortFilter = new Object();
                    if (customerData[0].IsSupportIdp) {
                        columnSortFilter = columnSortFilterFormatedData(columnSortFilterForExport, gID, gridStorage, 'Export', 'ExportedBy', 'Text', "VF\\" + userData[0].LoginName);
                    } else {
                        columnSortFilter = columnSortFilterFormatedData(columnSortFilterForExport, gID, gridStorage, 'Export', 'ExportedBy', 'Text', userData[0].FullName);
                    }
                    param.getExportedAndImportedItemsReq.ColumnSortFilter = columnSortFilter;
                    param.getExportedAndImportedItemsReq.Pagination = getPaginationObject(param.getExportedAndImportedItemsReq.Pagination, gID);

                    updatepaginationOnState(gID, gridStorage, param.getExportedAndImportedItemsReq.Pagination, null, null);

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                    if (data.getExportedAndImportedItemsResp) {
                        if (data.getExportedAndImportedItemsResp.ExportImportItems && data.getExportedAndImportedItemsResp.ExportImportItems.length > 0) {
                            for (var i = 0; i < data.getExportedAndImportedItemsResp.ExportImportItems.length; i++) {
                                data.getExportedAndImportedItemsResp.ExportImportItems[i].RequestedOn = convertToLocaltimestamp(data.getExportedAndImportedItemsResp.ExportImportItems[i].RequestedOn);
                            }
                        }
                        if (data.getExportedAndImportedItemsResp.ExportImportItems && data.getExportedAndImportedItemsResp.PaginationResponse) {
                            //for (var h = 0; h < data.getExportedAndImportedItemsResp.ExportImportItems.length; h++) {
                            //if (data.getExportedAndImportedItemsResp.ExportImportItems[h].ExportImportQueueId == data.getExportedAndImportedItemsResp.PaginationResponse.HighLightedItemId) {
                            //gridStorage[0].highlightedPage = data.getExportedAndImportedItemsResp.PaginationResponse.HighLightedItemPage;
                            //var updatedGridStorage = JSON.stringify(gridStorage);
                            //window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            //}
                            //}

                        } else {
                            source.totalrecords = 0;
                            source.totalpages = 0;
                            data.getExportedAndImportedItemsResp = new Object();
                            data.getExportedAndImportedItemsResp.ExportImportItems = [];
                        }

                    } else {
                        data.getExportedAndImportedItemsResp = new Object();
                        data.getExportedAndImportedItemsResp.ExportImportItems = [];
                    }
                    $('.all-disabled').hide();
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                }
            }
        );

        var rendered = function (element) {
            enablegridfunctions(gID, 'ExportImportQueueId', element, gridStorage, false, 'pagerDivExport12', false, 0, 'ExportImportQueueId', null, null, null);
            return true;
        }
        var downloadExportRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var status = $("#" + gID).jqxGrid('getcellvalue', row, 'Status');
            var fileUrl = $("#" + gID).jqxGrid('getcellvalue', row, 'FileUrl');
            if (status === "Successful") {
                if (fileUrl === '') {
                    return '<a id="imageId" class="btn" title="There is no data to export" style="margin-left: 5px; cursor:default" height="60" width="50" ><i class="icon-download3" ></i></a>';
                } else {
                    return '<a  id="imageId" tabindex="0" class="btn default" style="margin-left: 5px;" height="60" title="Download" width="50" onClick="downloadExport(' + row + ')"><i class="icon-download3"></i></a>';
                }
            } else {
                return '<a  id="imageId" disabled="true" class="btn disabled" title="Download" style="margin-left: 5px;" height="60" width="50" ><i class="icon-download3" ></i></a>';
            }
        }

        var initialColumnFilter = function () {
            if (gridStorage[0].isdefaultfilter == 0) {
                var filtergroup = new $.jqx.filter();
                var filtervalue = '';
                if (customerData[0].IsSupportIdp) {
                    filtervalue = "VF\\" + userData[0].LoginName;
                } else {
                    filtervalue = userData[0].FullName;
                }
                var filter_or_operator = 1;
                var filtercondition = 'contains';
                var filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
                filtergroup.addfilter(filter_or_operator, filter);
                return filtergroup;
            }
        }();
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
                height: gridHeightFunction(gID, "Export"),
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
                ready: function () {
                    callOnGridReady(gID, gridStorage, ENUM.get("CALLTYPE_NONE"), 'ExportedBy');
                    var gridheight = $(window).height();
                    if (gridheight > 600) {
                        gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 38;
                    } else {
                        gridheight = '400px';
                    }
                    $("#" + gID).jqxGrid({ height: gridheight });
                },
                autoshowfiltericon: true,

                columns: [
                    {
                        text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, hidden: true,
                        datafield: 'isSelected', width: 40,
                        renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    { text: '', datafield: 'ExportImportQueueId', hidden: true, editable: false, minwidth: 0, },
                    {
                        text: i18n.t('module_name', { lng: lang }), datafield: 'Operation', sortable: true, editable: false, minwidth: 110, filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('dgcol_ExportedBy', { lng: lang }), datafield: 'ExportedBy', filter: initialColumnFilter, editable: false, minwidth: 120, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('dgcol_RequestedOn', { lng: lang }), datafield: 'RequestedOn', cellsformat: LONG_DATETIME_GRID_FORMAT, sortable: true, editable: false, minwidth: 160,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('dgcol_Status', { lng: lang }), datafield: 'Status', editable: false, minwidth: 100,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Export Status');
                        }
                    },
                    {
                        text: i18n.t('dgcol_FileName', { lng: lang }), datafield: 'FileName', sortable: true, editable: false, minwidth: 100,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    { text: i18n.t('dgcol_Download', { lng: lang }), filterable: false, sortable: false, menu: false, datafield: 'FileUrl', editable: false, minwidth: 100, cellsrenderer: downloadExportRenderer },

                ]
            });

        getGridBiginEdit(gID, 'ExportImportQueueId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'ExportImportQueueId');
    }

    function taskStatusGrid(gID, param) {
        CallType = ENUM.get("CALLTYPE_NONE");
        var InitGridStoragObj = initGridStorageObj(gID, CallType);
        var gridStorage = InitGridStoragObj.gridStorage;
        var gridheight = $(window).height();
        var percentValue;
        if (gridheight > 600) {
            percentValue = (25 / 100) * gridheight;
            gridheight = gridheight - 150;
            gridheight = gridheight - percentValue + 'px';
        } else {
            gridheight = '400px';
        }

        var source =
        {
            dataType: "json",
            dataFields: [
                { name: 'ID', map: 'ID'},
                { name: 'Process', map: 'Process' },
                { name: 'Description', map: 'Description' },
                { name: 'RequestedBy', map: 'RequestedBy' },
                { name: 'RequestedOn', map: 'RequestedOn', type: 'date' },
                { name: 'Status', map: 'Status' },
                { name: 'RecordsAffected', map: 'RecordsAffected' },
                { name: 'RecordsProcessed', map: 'RecordsProcessed' },
            ],
            root: 'Data',
            type: "POST",
            data: param,
            url: AppConstants.get('API_URL') + "/GetScheduleSofwareStatus",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getScheduleSofwareStatusResp)
                    data.getScheduleSofwareStatusResp = $.parseJSON(data.getScheduleSofwareStatusResp);
                else
                    data.getScheduleSofwareStatusResp = new Object();

                if (data.getScheduleSofwareStatusResp && data.getScheduleSofwareStatusResp.PaginationResponse) {
                    source.totalrecords = data.getScheduleSofwareStatusResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getScheduleSofwareStatusResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
            },

        };
        var dataAdapter = new $.jqx.dataAdapter(source,
            {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    columnSortFilter = new Object();
                    if (customerData[0].IsSupportIdp) {
                        columnSortFilter = columnSortFilterFormatedData(columnSortFilterForTaskStatus, gID, gridStorage, 'SoftwareStatusQueue', 'RequestedBy', 'Text', "VF\\" + userData[0].LoginName);
                    } else {
                        columnSortFilter = columnSortFilterFormatedData(columnSortFilterForTaskStatus, gID, gridStorage, 'SoftwareStatusQueue', 'RequestedBy', 'Text', userData[0].FullName);
                    }
                    param.getScheduleSofwareStatusReq.ColumnSortFilter = columnSortFilter;
                    param.getScheduleSofwareStatusReq.Pagination = getPaginationObject(param.getScheduleSofwareStatusReq.Pagination, gID);

                    updatepaginationOnState(gID, gridStorage, param.getScheduleSofwareStatusReq.Pagination, null, null);

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                    if (data.getScheduleSofwareStatusResp) {
                        if (data.getScheduleSofwareStatusResp.Data && data.getScheduleSofwareStatusResp.Data.length > 0) {
                            for (var i = 0; i < data.getScheduleSofwareStatusResp.Data.length; i++) {
                                data.getScheduleSofwareStatusResp.Data[i].RequestedOn = convertToLocaltimestamp(data.getScheduleSofwareStatusResp.Data[i].RequestedOn);
                            }
                        }

                    } else {
                        data.getScheduleSofwareStatusResp = new Object();
                        data.getScheduleSofwareStatusResp.Data = [];
                    }
                    $('.all-disabled').hide();
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                }
            }
        );

        var rendered = function (element) {
            enablegridfunctions(gID, 'ID', element, gridStorage, false, 'pagerDivTaskStatus', false, 0, 'ID', null, null, null);
            return true;
        }
        var resultsRender = function (row, columnfield, value, defaulthtml, columnproperties) {
            return '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"> <a title="Click to view more details" tabindex="0" id="imageId" onClick="viewDetails(' + row + ')" style="text-decoration:underline;" height="60" width="50" >View Results</a></div>'
        }

        var initialColumnFilter = function () {
            if (gridStorage[0].isdefaultfilter == 0) {
                var filtergroup = new $.jqx.filter();
                var filtervalue = '';
                if (customerData[0].IsSupportIdp) {
                    filtervalue = "VF\\" + userData[0].LoginName;
                } else {
                    filtervalue = userData[0].FullName;
                }
                var filter_or_operator = 1;
                var filtercondition = 'contains';
                var filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
                filtergroup.addfilter(filter_or_operator, filter);
                return filtergroup;
            }
        }

        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

        }
        $("#" + gID).jqxGrid(
            {

                width: "100%",
                height: gridHeightFunction(gID, "Export"),
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
                ready: function () {
                    callOnGridReady(gID, gridStorage);
                    var gridheight = $(window).height();
                    if (gridheight > 600) {
                        gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 38;
                    } else {
                        gridheight = '400px';
                    }
                    $("#" + gID).jqxGrid({ height: gridheight });
                },
                autoshowfiltericon: true,

                columns: [
                    {
                        text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, hidden: true,
                        datafield: 'isSelected', width: 40,
                        renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    {
                        text: i18n.t('dgcol_Operation', { lng: lang }), datafield: 'Process', sortable: true, editable: false, minwidth: 160, filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('description', { lng: lang }), datafield: 'Description', sortable: true, editable: false, minwidth: 160, filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('dgcol_RequestedBy', { lng: lang }), datafield: 'RequestedBy', editable: false, minwidth: 120, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('dgcol_RequestedOn', { lng: lang }), datafield: 'RequestedOn', cellsformat: LONG_DATETIME_GRID_FORMAT, sortable: true, editable: false, minwidth: 160,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('dgcol_Status', { lng: lang }), datafield: 'Status', editable: false, minwidth: 100,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('dgcol_selected_devices', { lng: lang }), datafield: 'RecordsAffected', sortable: true, editable: false, minwidth: 100,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('dgcol_processed_devices', { lng: lang }), datafield: 'RecordsProcessed', sortable: true, editable: false, minwidth: 100,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    { text: i18n.t('results', { lng: lang }), datafield: 'IsProcessed', editable: false, minwidth: 80, menu: false, sortable: false, enabletooltips: false, resizable: false, filterable: false, cellsrenderer: resultsRender },
                ]
            });

        getGridBiginEdit(gID, 'ID', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'ID');
    }

});

function tempimportdownload(rowindex, fileType) {
    var logFileUrl = '';
    var fileNameDisp = '';
    if (fileType == AppConstants.get('IMPORT_FILETYPE_DEVICELOGFILE')) {
        logFileUrl = $("#jqxgridImport").jqxGrid('getcellvalue', rowindex, 'LogFileName');
        var LogFileName = $("#jqxgridImport").jqxGrid('getcellvalue', rowindex, 'FileName');
        fileNameDisp = logFileUrl.split('/').pop();
        fileNameDisp = LogFileName;
    }
    else if (fileType == AppConstants.get('IMPORT_FILETYPE_PARAMETERLOGFILE')) {
        logFileUrl = $("#jqxgridImport").jqxGrid('getcellvalue', rowindex, 'ParameterResultFile');
        var ParameterResultfileName = $("#jqxgridImport").jqxGrid('getcellvalue', rowindex, 'FileName');
        fileNameDisp = logFileUrl.split('/').pop();
        fileNameDisp = ParameterResultfileName;

    }
    //var logFileUrl = $("#jqxgridImport").jqxGrid('getcellvalue', rowindex, 'LogFileName');
    logFileUrl = replaceIpAddressByHostName(logFileUrl);  //Replacing IP address by the domain name If Download File URL contains IP
    //  var fileNameDisp = $("#jqxgridImport").jqxGrid('getcellvalue', rowindex, 'FileName');
    var extUrl = logFileUrl.split('.').pop().toLowerCase();
    var extName = fileNameDisp.split('.').pop().toLowerCase();

    if (extUrl == 'txt') {
        fileNameDisp = fileNameDisp.substr(0, fileNameDisp.lastIndexOf(".")) + "." + extUrl;
    }

    if (extUrl == 'csv') {
        fileNameDisp = fileNameDisp.substr(0, fileNameDisp.lastIndexOf(".")) + "." + extUrl;
    }
    $.ajax({
        url: logFileUrl,
        dataType: "text",
        success: function (result) {
            var downloadResult = download(result, fileNameDisp, "application/txt");
            if (downloadResult == true) {
                openAlertpopup(0, 'file_successfully_downloaded');
            } else {

            }
        },
        error: function (jqXHR, status, error) {
            if (jqXHR != null) {
                ajaxErrorHandler(jqXHR, status, error);
                if (jqXHR.status != 401) {
                    openAlertpopup(2, 'error_occurred_while_downloading_file');
                }
            } else {
                openAlertpopup(2, 'error_occurred_while_downloading_file');
            }
        }
    });

}

function downloadExport(row) {
    var logFileUrl = $("#jqxgridExport").jqxGrid('getcellvalue', row, 'FileUrl');
    logFileUrl = replaceIpAddressByHostName(logFileUrl);  //Replacing IP address by the domain name If Download File URL contains IP
    var fileNameDisp = $("#jqxgridExport").jqxGrid('getcellvalue', row, 'FileName');
    var fileExtension = fileNameDisp.split('.').pop();
    if (fileExtension.toLowerCase() == "zip") {
        var f = document.createElement("iframe");
        document.body.appendChild(f);
        f.src = logFileUrl;
        setTimeout(function () { document.body.removeChild(f); openAlertpopup(1, 'export_Information'); }, 1000);
    } else {
        $.ajax({
            url: logFileUrl,
            dataType: "text",
            success: function (result) {
                var downloadResult = download(result, fileNameDisp, "application/txt");
                if (downloadResult != "") {
                    openAlertpopup(0, 'file_successfully_downloaded');
                }
            },
            error: function (jqXHR, status, error) {
                if (jqXHR != null) {
                    ajaxErrorHandler(jqXHR, status, error);
                    if (jqXHR.status != 401) {
                        openAlertpopup(2, 'error_occurred_while_downloading_file');
                    }
                } else {
                    openAlertpopup(2, 'error_occurred_while_downloading_file');
                }
            }
        });
    }
}

function viewDetails(row) {
    $('#modalTaskStatusDetails').modal('show');
    $('#taskStatusDetailsDiv').empty();
    $('#taskStatusDetailsDiv').html('<div id="jqxGridTaskStatusDetails"></div><div id="pagerDivTaskStatusDetails"></div>');
    gId = 'jqxGridTaskStatusDetails';
    getTaskStatusDetails(row);

    $("#operationText").empty();
    $("#operationText").append(i18n.t('software_template_assignment', { lng: lang }));
}

function getTaskStatusDetails(row) {
    scheduleSoftwareQueueId = $("#jqxgridTaskStatus").jqxGrid('getcellvalue', row, 'ID');
    visibleDetailsColumnsList = new Array();
    visibleDetailsColumnsList = visibleColumnsListForPopup;

    var param = getTaskStatusDetailsParam(false, columnSortFilterTaskStatusDetails, scheduleSoftwareQueueId, visibleDetailsColumnsList);
    gridTaskStatusDetails('jqxGridTaskStatusDetails', param);
}

function getTaskStatusDetailsExport(param) {
    var callbackFunction = function (data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                openAlertpopup(1, 'export_Sucess');
            }
        }
    }

    var method = 'GetDevicesAssignedForScheduleSoftwareQueue';
    var params = JSON.stringify(param);
    ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

function gridTaskStatusDetails(gID, param) {
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
            { name: 'HierachryPath', map: 'HierachryPath' },
            { name: 'Model', map: 'Model' },
            { name: 'Status', map: 'Status' },
            { name: 'AdditionalInfo', map: 'AdditionalInfo' }
        ],
        root: 'Data',
        type: 'POST',
        data: param,
        url: AppConstants.get('API_URL') + "/GetDevicesAssignedForScheduleSoftwareQueue",
        contentType: 'application/json',
        beforeprocessing: function (data) {
            if (data.getDevicesAssignedForScheduleSoftwareQueueResp) {
                data.getDevicesAssignedForScheduleSoftwareQueueResp = $.parseJSON(data.getDevicesAssignedForScheduleSoftwareQueueResp);

                if (data.getDevicesAssignedForScheduleSoftwareQueueResp.PaginationResponse) {
                    source.totalrecords = data.getDevicesAssignedForScheduleSoftwareQueueResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDevicesAssignedForScheduleSoftwareQueueResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
            } else {
                data.getDevicesAssignedForScheduleSoftwareQueueResp = [];
            }
        },
    }
    var dataAdapter = new $.jqx.dataAdapter(source,
        {
            formatData: function (data) {
                $('.all-disabled').show();
                disableIcons(['btnResetFilterTaskStatusDetails', 'btnShowHideTaskStatusDetails', 'btnExportToexcelTaskStatusDetails', 'btnRefreshTaskStatusDetails']);
                var columnSortFilter = new Object();
                columnSortFilter = columnSortFilterFormatedData(columnSortFilterTaskStatusDetails, gID, gridStorage, 'DeviceAssignedToSoftwareQueue');
                param.getScheduledDevicesForSoftwareStatusReq.ColumnSortFilter = columnSortFilter;
                param.getScheduledDevicesForSoftwareStatusReq.Pagination = getPaginationObject(param.getScheduledDevicesForSoftwareStatusReq.Pagination, gID);
                param.getScheduledDevicesForSoftwareStatusReq.ScheduleSoftwareQueueId = scheduleSoftwareQueueId;
                data = JSON.stringify(param);
                return data;
            },
            downloadComplete: function (data, status, xhr) {
                if (data) {

                    isPopUpOpen = true;
                    if (data.getDevicesAssignedForScheduleSoftwareQueueResp && data.getDevicesAssignedForScheduleSoftwareQueueResp.Data) {
                        if (data.getDevicesAssignedForScheduleSoftwareQueueResp.Data.length > 0) {

                        }
                    }
                    enableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
                    if (data.getDevicesAssignedForScheduleSoftwareQueueResp && data.getDevicesAssignedForScheduleSoftwareQueueResp.Data) {
                        if (data.getDevicesAssignedForScheduleSoftwareQueueResp.TotalSelectionCount != 'undefined') {
                            gridStorage[0].TotalSelectionCount = data.getDevicesAssignedForScheduleSoftwareQueueResp.TotalSelectionCount;
                            var updatedGridStorage = JSON.stringify(gridStorage);
                            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        }
                    } else {
                        data.getDevicesAssignedForScheduleSoftwareQueueResp = new Object();
                        data.getDevicesAssignedForScheduleSoftwareQueueResp.Data = [];
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


    //for allcheck
    var rendered = function (element) {
        enablegridfunctions(gID, 'ID', element, gridStorage, false, 'pagerDivTaskStatusDetails', true, 0, 'ID', null, null, null);
        $('.jqx-grid-pager').css("display", "none")
        return true;
    }

    var statusTooltipRenderer = function (row, column, value, defaultHtml) {
        defaultHtml = displayTooltipUserTaskStatus(gID, row, column, value, defaultHtml);
        return defaultHtml;
    }

    var downloadDurationRenderer = function (row, column, value, defaultHtml) {
        defaultHtml = displayTooltipForDownloadDuration(gID, row, column, value, defaultHtml);
        return defaultHtml;
    }

    var buildFilterPanel = function (filterPanel, datafield) {
        genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
    }

    var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
        genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
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
                var columns = genericHideShowColumn(gID, true, ['IsProcessed']);
                for (var i = 0; i < columns.length; i++) {
                    visibleDetailsColumnsList.push(columns[i].columnfield);
                }
            },

            columns: [
                {
                    text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', resizable: false, draggable: false,
                    datafield: 'isSelected', width: 40, renderer: function () {
                        return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                    }, rendered: rendered, hidden: true
                },
                {
                    text: i18n.t('serial', { lng: lang }), dataField: 'SerialNumber', editable: false, minwidth: 120,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('device_id', { lng: lang }), dataField: 'DeviceId', editable: false, minwidth: 130,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('model', { lng: lang }), dataField: 'Model', enabletooltips: false, editable: false, minwidth: 100,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
                    }
                },
                {
                    text: i18n.t('hierarchy_path', { lng: lang }), dataField: 'HierachryPath', editable: false, minwidth: 100, enabletooltips: false, cellsrenderer: downloadDurationRenderer,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('rs_statsus', { lng: lang }), dataField: 'Status', enabletooltips: false, editable: false, minwidth: 100, cellsrenderer: statusTooltipRenderer,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                }
            ],
        });

    getGridBiginEdit(gID, 'ID', gridStorage);
    callGridFilter(gID, gridStorage);
    callGridSort(gID, gridStorage, 'ID');
}

function getTaskStatusDetailsParam(isExport, columnSortFilterDetails, scheduleSoftwareQueueId, visibleColumns) {

    var getScheduledDevicesForSoftwareStatusReq = new Object();
    var Export = new Object();
    var Pagination = new Object();

    Pagination.HighLightedItemId = null
    Pagination.PageNumber = 1;
    Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

    Export.DynamicColumns = null;
    if (isExport == true) {
        Export.IsAllSelected = false;
        Export.IsExport = true;
    } else {
        Export.IsAllSelected = false;
        Export.IsExport = false;
    }
    Export.VisibleColumns = visibleColumns;

    getScheduledDevicesForSoftwareStatusReq.ColumnSortFilter = columnSortFilterDetails;
    getScheduledDevicesForSoftwareStatusReq.ScheduleSoftwareQueueId = scheduleSoftwareQueueId;
    getScheduledDevicesForSoftwareStatusReq.Pagination = Pagination;
    getScheduledDevicesForSoftwareStatusReq.Export=Export;

    var param = new Object();
    param.token = TOKEN();
    param.getScheduledDevicesForSoftwareStatusReq = getScheduledDevicesForSoftwareStatusReq;

    return param;
}