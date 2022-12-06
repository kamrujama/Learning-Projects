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
        var compulsoryfields = ['SwapOutSerialNumber', 'SwappedOn'];
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
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getChangehistoryParameters(true, columnSortFilter, visibleColumnsList);

            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflag = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                userActivityExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function userActivityExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    } 
                }
            }
            var method = 'GetDeviceSwapHistory';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }



        var param = getChangehistoryParameters(false, columnSortFilter, []);
        changeHistoryGrid('jqxgridSwapHistory', param);

        seti18nResourceData(document, resourceStorage);
    };

    //for grid
    function changeHistoryGrid(gID, param) {
        var isFilter;
        if (isswapHistoryGridFilter == undefined || isswapHistoryGridFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        isswapHistoryGridFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var source =
        {
            dataType: "json",
            dataFields: [
                     { name: 'isSelected', type: 'number' },
                     { name: 'SwapOutSerialNumber', map: 'SwapOutSerialNumber' },
                     { name: 'SwapOutHierarchyPath', map: 'SwapOutHierarchyPath' },
                     { name: 'SwappedOn', map: 'SwappedOn', type: 'date' },
            ],
            root: 'DeviceSwapHistory',
            type: "POST",
            data: param,

            url: AppConstants.get('API_URL') + "/GetDeviceSwapHistory",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data && data.getDeviceSwapHistoryResp) {
                    data.getDeviceSwapHistoryResp = $.parseJSON(data.getDeviceSwapHistoryResp);
                }
                else
                    data.getDeviceSwapHistoryResp = [];

                if (data.getDeviceSwapHistoryResp && data.getDeviceSwapHistoryResp.PaginationResponse) {
                    source.totalrecords = data.getDeviceSwapHistoryResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDeviceSwapHistoryResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;

                }
            },
        };

        var request = {
                formatData: function (data) {
                    $('.all-disabled').show();
                    //disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'DeviceSwapHistory');
                    param.getDeviceSwapHistoryReq.ColumnSortFilter = columnSortFilter;
                    param.getDeviceSwapHistoryReq.Pagination = getPaginationObject(param.getDeviceSwapHistoryReq.Pagination, gID);
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                    //if (data && data.getDeviceSwapHistoryResp) {
                    //    data.getDeviceSwapHistoryResp = $.parseJSON(data.getDeviceSwapHistoryResp);
                    //}

                    if (data.getDeviceSwapHistoryResp && data.getDeviceSwapHistoryResp.DeviceSwapHistory) {
                        for (var i = 0; i < data.getDeviceSwapHistoryResp.DeviceSwapHistory.length; i++) {
                            data.getDeviceSwapHistoryResp.DeviceSwapHistory[i].SwappedOn = convertToLocaltimestamp(data.getDeviceSwapHistoryResp.DeviceSwapHistory[i].SwappedOn);
                        }
                    }

                    if (data.getDeviceSwapHistoryResp && data.getDeviceSwapHistoryResp.DeviceSwapHistory) {
                        //if (data.getDeviceSwapHistoryResp.PaginationResponse && data.getDeviceSwapHistoryResp.PaginationResponse.HighLightedItemPage > 0) {
                        //    gridStorage[0].highlightedPage = data.getDeviceSwapHistoryResp.PaginationResponse.HighLightedItemPage;
                        //    var updatedGridStorage = JSON.stringify(gridStorage);
                        //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        //}

                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getDeviceSwapHistoryResp = new Object();
                        data.getDeviceSwapHistoryResp.DeviceSwapHistory = [];

                    }
                    $('.all-disabled').hide();
                }
                }
        
        var dataAdapter = intializeDataAdapter(source,request);

        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'AuditId', element, gridStorage, false, 'pagerDivSwapHistory', false, 0, 'AuditId', null, null, null);
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
                    { text: '', dataField: 'AuditId', hidden: true, editable: false, },
                    {
                        text: i18n.t('serial', { lng: lang }), dataField: 'SwapOutSerialNumber', editable: false, width: "33.33%", 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                      {
                          text: i18n.t('so_hierarchy_path', { lng: lang }), dataField: 'SwapOutHierarchyPath', editable: false, width: "33.33%",
                          filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                          createfilterpanel: function (datafield, filterPanel) {
                              buildFilterPanel(filterPanel, datafield);
                          }
                      },
                      {
                          text: i18n.t('swapped_on', { lng: lang }), datafield: 'SwappedOn', cellsformat: LONG_DATETIME_GRID_FORMAT, width: "33.33%", filterable: true, editable: false,
                          filtertype: "custom",
                          createfilterpanel: function (datafield, filterPanel) {
                              buildFilterPanelDate(filterPanel, datafield);

                          }
                      },
                   
            ]
        });
        getGridBiginEdit(gID, 'AuditId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'AuditId');
    }

    function getChangehistoryParameters(isExport, columnSortFilter, visibleColumns) {
        var getDeviceSwapHistoryReq = new Object();
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

        getDeviceSwapHistoryReq.DeviceId = koUtil.deviceId;
        getDeviceSwapHistoryReq.ModelName = koUtil.ModelName;
        getDeviceSwapHistoryReq.Pagination = Pagination;
        getDeviceSwapHistoryReq.ColumnSortFilter = ColumnSortFilter;
        getDeviceSwapHistoryReq.Export = Export;

        var param = new Object();
        param.token = TOKEN();
        param.getDeviceSwapHistoryReq = getDeviceSwapHistoryReq;

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
