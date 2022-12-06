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

    return function communicationHistoryForDeviceProfileViewModel() {
 

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
        var compulsoryfields = ["SerialNumber", "DeviceCommunicationType"];
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

        self.exportToExcel = function (isExport, gId) {
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getCommunivcationHistoryParameters(true, columnSortFilter, visibleColumnsList);

            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflag = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                communicationHistoryExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function communicationHistoryExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetDeviceCommunicationHistory';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }



        var param = getCommunivcationHistoryParameters(false, columnSortFilter, []);
        communicationHistoryGrid('jqxgridCommunicationHistory', param);

        seti18nResourceData(document, resourceStorage);
    };

    //for grid
    function communicationHistoryGrid(gID, param) {
        var isFilter;
        if (iscommunicationHistoryGridFilter == undefined || iscommunicationHistoryGridFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        iscommunicationHistoryGridFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var source =
        {
            dataType: "json",
            dataFields: [
                     { name: 'isSelected', type: 'number' },
                     { name: 'SerialNumber', map: 'SerialNumber' },
                     { name: 'MessageProcessedOn', map: 'MessageProcessedOn', type: 'date' },
                     { name: 'DeviceCommunicationType', map: 'DeviceCommunicationType' },
                     { name: 'DeviceStatus', map: 'DeviceStatus' },
                     { name: 'DeviceStatusAdditionalInfo', map: 'DeviceStatusAdditionalInfo' },
                     { name: 'ServerCommunicationType', map: 'ServerCommunicationType' },
                     { name: 'ServerStatus', map: 'ServerStatus' },
            ],
            root: 'DeviceCommunicationHistory',
            type: "POST",
            data: param,

            url: AppConstants.get('API_URL') + "/GetDeviceCommunicationHistory",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getDeviceCommunicationHistoryResp)
                    data.getDeviceCommunicationHistoryResp = $.parseJSON(data.getDeviceCommunicationHistoryResp);
                else
                    data.getDeviceCommunicationHistoryResp = [];
                if (data.getDeviceCommunicationHistoryResp && data.getDeviceCommunicationHistoryResp.PaginationResponse) {
                    source.totalrecords = data.getDeviceCommunicationHistoryResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDeviceCommunicationHistoryResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;

                }
            },
        };

       
        var request =  {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'CommuniationHistoryForDeviceProfile');
                    param.getDeviceCommunicationHistoryReq.ColumnSortFilter = columnSortFilter;
                    param.getDeviceCommunicationHistoryReq.Pagination = getPaginationObject(param.getDeviceCommunicationHistoryReq.Pagination, gID);
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    
                    if (data.getDeviceCommunicationHistoryResp && data.getDeviceCommunicationHistoryResp.DeviceCommunicationHistory) {
                        for (var i = 0; i < data.getDeviceCommunicationHistoryResp.DeviceCommunicationHistory.length; i++) {
                            data.getDeviceCommunicationHistoryResp.DeviceCommunicationHistory[i].MessageProcessedOn = convertToLocaltimestamp(data.getDeviceCommunicationHistoryResp.DeviceCommunicationHistory[i].MessageProcessedOn);
                        }
                        //if (data.getDeviceCommunicationHistoryResp.PaginationResponse && data.getDeviceCommunicationHistoryResp.PaginationResponse.HighLightedItemPage > 0) {
                        //    gridStorage[0].highlightedPage = data.getDeviceCommunicationHistoryResp.PaginationResponse.HighLightedItemPage;
                        //    var updatedGridStorage = JSON.stringify(gridStorage);
                        //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        //}
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getDeviceCommunicationHistoryResp = new Object();
                        data.getDeviceCommunicationHistoryResp.DeviceCommunicationHistory = [];

                    }
                    $('.all-disabled').hide();
                }
            }
        
        var dataAdapter = intializeDataAdapter(source, request);

        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'HistoryId', element, gridStorage, false, 'pagerDivCommunicationHistory', false, 0, 'HistoryId', null, null, null);
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


        var toolTipRenderer = function (row, column, value, defaultHtml) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
            var dateConvert = jsonDateConversion(rowData.MessageProcessedOn, LONG_DATETIME_FORMAT_AMPM)

            var str = '';
            if (rowData.MessageProcessedOn != null) {
                str += '<div style="padding-left:5px;padding-top:6px;"><span title="Date : ' + dateConvert + '\n';
                if (rowData.DeviceCommunicationType != null) {
                    str += 'Device Communication: ' + rowData.DeviceCommunicationType + '\n';
                }
                if (rowData.DeviceStatus) {
                    str += 'Device Status:  ' + rowData.DeviceStatus + '\n';
                }
                if (rowData.DeviceStatusAdditionalInfo) {
                    str += 'Device Additional Info:   ' + rowData.DeviceStatusAdditionalInfo + '\n';
                }
                if (rowData.ServerCommunicationType != null) {
                    str += 'Server Communication:  ' + rowData.ServerCommunicationType + '\n';
                }
                if (rowData.ServerStatus) {
                    str += 'Server Status:   ' + rowData.ServerStatus + '\n';
                }
                if (rowData.ServerStatusAdditionalInfo) {
                    str += 'Server Additional Info:  ' + rowData.ServerStatusAdditionalInfo + '';

                }
                str += '">' + value + '</span></div>';
            }

            defaultHtml = str
            return defaultHtml;
        }



        $("#" + gID).jqxGrid(
        {
            width: "100%",
            height: gridHeightFunction(gID, "50"),
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
                if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
                    {
                        $("#" + gID).jqxGrid('hidecolumn', 'DeviceCommunicationType');
                    }
                }

            },
            columns: [
                    {
                        text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, hidden: true, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    { text: '', dataField: 'HistoryId', hidden: true, editable: false,  },
                    {
                        text: i18n.t('serial', { lng: lang }), dataField: 'SerialNumber', editable: false, minwidth: 90, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                      {
                          text: i18n.t('date', { lng: lang }), datafield: 'MessageProcessedOn', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 130, filterable: true, editable: false,
                          filtertype: "custom",
                          createfilterpanel: function (datafield, filterPanel) {
                              buildFilterPanelDate(filterPanel, datafield);

                          }
                      },
                     {
                         text: i18n.t('dev_commn', { lng: lang }), dataField: 'DeviceCommunicationType', editable: false, minwidth: 100, 
                         filtertype: "custom", cellsrenderer: toolTipRenderer,
                         createfilterpanel: function (datafield, filterPanel) {
                             buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Communication');
                         }
                     },
                      {
                          text: i18n.t('dev_status_device', { lng: lang }), dataField: 'DeviceStatus', editable: false, minwidth: 100, 
                          filtertype: "custom", cellsrenderer: toolTipRenderer,
                          createfilterpanel: function (datafield, filterPanel) {
                              buildFilterPanelMultiChoice(filterPanel, datafield, 'Status');
                          }
                      },
                    {
                        text: i18n.t('server_communication', { lng: lang }), dataField: 'ServerCommunicationType', editable: false, minwidth: 100,
                        filtertype: "custom", cellsrenderer: toolTipRenderer,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Server Communication');
                        }
                    },
                   {
                       text: i18n.t('server_status_device', { lng: lang }), dataField: 'ServerStatus', editable: false, minwidth: 100, filterable: true,
                       filtertype: "custom", cellsrenderer: toolTipRenderer,
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
            ]
        });
        getGridBiginEdit(gID, 'HistoryId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'HistoryId');
    }

    function getCommunivcationHistoryParameters(isExport, columnSortFilter, visibleColumns) {
        var getDeviceCommunicationHistoryReq = new Object();
        var Export = new Object();
        var Selector = new Object();

        var Pagination = new Object();
        var device = new Object();

        device.DeviceId = koUtil.deviceId;;
        device.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;;
        device.SerialNumber = koUtil.serialNumber;;
        device.ModelName = koUtil.ModelName;;

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

        getDeviceCommunicationHistoryReq.Device = device;
        getDeviceCommunicationHistoryReq.Pagination = Pagination;
        getDeviceCommunicationHistoryReq.ColumnSortFilter = ColumnSortFilter;
        getDeviceCommunicationHistoryReq.Export = Export;

        var param = new Object();
        param.token = TOKEN();
        param.getDeviceCommunicationHistoryReq = getDeviceCommunicationHistoryReq;

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
