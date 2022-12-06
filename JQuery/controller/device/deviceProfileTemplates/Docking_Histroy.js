define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho) {

    SelectedIdOnGlobale = new Array
    columnSortFilter = new Object();
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
        self.checksample = ko.observable();
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ["SerialNumber", "ModelName"];
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
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));
                loadelement(popupName, 'genericPopup');
                $('#downloadModel').modal('show');
            }
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
        }
        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
        }

        self.exportToExcel = function (isExport, gId) {
            var param = getDockingHistoryParameters(true, columnSortFilter, visibleColumnsList);

            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflag = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                dockingHistoryExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function dockingHistoryExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    } 
                }
            }
            var method = 'GetDeviceDockingHistory';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }



        var param = getDockingHistoryParameters(false, columnSortFilter, []);
        dockingHistoryGrid('jqxgridDockingHistory', param);

        seti18nResourceData(document, resourceStorage);
    };

    //for grid
    function dockingHistoryGrid(gID, param) {
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

        var source =
        {
            dataType: "json",
            dataFields: [
                     { name: 'isSelected', type: 'number' },
                     { name: 'SerialNumber', map: 'SerialNumber' },
                     { name: 'DeviceId', map: 'DeviceId' },
                     { name: 'ModelName', map: 'ModelName'},
                     { name: 'DockInDate', map: 'DockInDate', type: 'date' },
                     { name: 'DockInBatteryLevel', map: 'DockInBatteryLevel' },
                     { name: 'DockOutDate', map: 'DockOutDate', type: 'date' },
                     { name: 'DockOutBatteryLevel', map: 'DockOutBatteryLevel' },
                     { name: 'UniqueDeviceId', map: 'UniqueDeviceId' }
            ],
            root: 'DeviceDockingHistoryResult',
            type: "POST",
            data: param,

            url: AppConstants.get('API_URL') + "/GetDeviceDockingHistory",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getDeviceDockingHistoryResp) {
                    data.getDeviceDockingHistoryResp = $.parseJSON(data.getDeviceDockingHistoryResp);
                }
                else
                    data.getDeviceDockingHistoryResp = [];
                if (data.getDeviceDockingHistoryResp && data.getDeviceDockingHistoryResp.PaginationResponse) {
                    source.totalrecords = data.getDeviceDockingHistoryResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDeviceDockingHistoryResp.PaginationResponse.TotalPages;
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
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'DeviceDockingHistory');
                    param.getDeviceDockingHistoryReq.ColumnSortFilter = columnSortFilter;
                    param.getDeviceDockingHistoryReq.Pagination = getPaginationObject(param.getDeviceDockingHistoryReq.Pagination, gID);
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    
                    if (data.getDeviceDockingHistoryResp && data.getDeviceDockingHistoryResp.DeviceDockingHistoryResult) {
                        for (var i = 0; i < data.getDeviceDockingHistoryResp.DeviceDockingHistoryResult.length; i++) {
                            data.getDeviceDockingHistoryResp.DeviceDockingHistoryResult[i].DockInDate = convertToLocaltimestamp(data.getDeviceDockingHistoryResp.DeviceDockingHistoryResult[i].DockInDate);
                            data.getDeviceDockingHistoryResp.DeviceDockingHistoryResult[i].DockOutDate = convertToLocaltimestamp(data.getDeviceDockingHistoryResp.DeviceDockingHistoryResult[i].DockOutDate);
                        }
                        //if (data.getDeviceDockingHistoryResp.PaginationResponse && data.getDeviceDockingHistoryResp.PaginationResponse.HighLightedItemPage > 0) {
                        //    gridStorage[0].highlightedPage = data.getDeviceDockingHistoryResp.PaginationResponse.HighLightedItemPage;
                        //    var updatedGridStorage = JSON.stringify(gridStorage);
                        //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        //}
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getDeviceDockingHistoryResp = new Object();
                        data.getDeviceDockingHistoryResp.DeviceDockingHistoryResult = [];

                    }
                    $('.all-disabled').hide();
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                }
            }
        );


        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'DockingHistoryId', element, gridStorage, false, 'pagerDivDockingHistory', false, 0, 'DockingHistoryId', null, null, null);
            return true;
        }

        //for device profile
        function SerialNoRenderer(row, columnfield, value, defaulthtml, columnproperties) {
            var rowData = $("#" + gID).jqxGrid("getrowdata", row);

            if (rowData.UniqueDeviceId == 0) {
                var html = '<div class="serial-Number-txt" style="padding-left:10px;padding-top:9px;cursor:default">' + value + '</div>'
            } else {
                var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
            }
            return html;
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
            ready: function (){
                var columns = genericHideShowColumn(gID, true, []);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;
                if (koUtil.ModelName == i18n.t('Carbon_8', { lng: lang })) {
                        $("#" + gID).jqxGrid('hidecolumn', 'SerialNumber');
                        $("#" + gID).jqxGrid('hidecolumn', 'ModelName');                    
                } 
            },

            columns: [
                    {
                        text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, hidden: true, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    { text: '', dataField: 'DockingHistoryId', hidden: true, editable: false, minwidth:0 },
                    {
                        text: i18n.t('serial', { lng: lang }), dataField: 'SerialNumber', editable: false, minwidth: 100, 
                        filtertype: "custom", cellsrenderer: SerialNoRenderer,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },                     
                    {
                        text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 120, width: 'auto', enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
                        }
                    },
                    {
                        text: i18n.t('Dock_In_Date_Time', { lng: lang }), datafield: 'DockInDate', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 160, filterable: true, editable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('dock_in_bttry', { lng: lang }), datafield: 'DockInBatteryLevel',  minwidth: 160, filterable: true, editable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('dock_out_date_time', { lng: lang }), datafield: 'DockOutDate', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 160, filterable: true, editable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('dock_out_bttry', { lng: lang }), datafield: 'DockOutBatteryLevel', minwidth: 130, filterable: true, editable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);

                        }
                    },
            ]
        });
        getGridBiginEdit(gID, 'DockingHistoryId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'DockingHistoryId');
    }

    function getDockingHistoryParameters(isExport, columnSortFilter, visibleColumns) {
        var getDeviceDockingHistoryReq = new Object();
        var Export = new Object();
        var Selector = new Object();

        var Pagination = new Object();
      
        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
                
        Export.IsAllSelected = isExport;
        Export.IsExport = isExport;
        Export.VisibleColumns = visibleColumns;

        var ColumnSortFilter = columnSortFilter;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getDeviceDockingHistoryReq.ColumnSortFilter = ColumnSortFilter;
        getDeviceDockingHistoryReq.DeviceId = koUtil.deviceId;
        getDeviceDockingHistoryReq.Export = Export;
        getDeviceDockingHistoryReq.Pagination = Pagination;
        getDeviceDockingHistoryReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

        var param = new Object();
        param.token = TOKEN();
        param.getDeviceDockingHistoryReq = getDeviceDockingHistoryReq;

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