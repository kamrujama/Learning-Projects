define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "advancedSearchUtil"], function (ko, koUtil, ADSearchUtil) {

    SelectedIdOnGlobale = new Array();
    columnSortFilter = new Object();
    isPackagenotFound = new Object();
    koUtil.GlobalColumnFilter = new Array();
    var lang = getSysLang();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function peripheralDeviceDetailsViewModel() {

    
        SelectedIdOnGlobale = new Array();
        checkALlPageId = 0;
        pagechangedcheck = 0;
        totalselectedRowCount = 0;

        var self = this;
        self.checksample = ko.observable();
        self.observableModelPopup = ko.observable();

        setMenuSelection();

        //For Clear Filter
        self.clearfilter = function (gId) {            
            gridFilterClear(gId);
        }

        // For Refresh Grid
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }

        //PopUp Functions
        self.templateFlag = ko.observable(false);
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');
        modelReposition();
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelExportSucess") {
                loadelement(popupName, 'genericPopup');
                $('#viewPeripheralDeviceDetails').modal('show');
            }
        }

        //For Load element
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        //for load criteria component 
        function loadCriteria(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                //new template code
                var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
                var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
                ko.components.register(elementname, {
                    viewModel: { require: ViewName },
                    template: { require: 'plugin/text!' + htmlName }
                });
            }
            self.observableCriteria(elementname);
        }


        //focus on first textbox
        $('#scheduleConfId').on('shown.bs.modal', function () {
            $('#scheduleConfoNo').focus();
        })

        // focus on next tab index 
        lastIndex = 4;
        prevLastIndex = 3;
        $(document).keydown(function (e) {
            if (e.keyCode == 9) {
                var thisTab = +$(":focus").prop("tabindex") + 1;
                if (e.shiftKey) {
                    if (thisTab == prevLastIndex) {
                        $("#" + tabLimitInID).find('[tabindex=' + prevLastIndex + ']').focus();
                        return false;
                    }
                } else {
                    if (thisTab == lastIndex) {
                        $("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
                        return false;
                    }
                }
            }
        });

        var setTabindexLimit = function (x, standardFile, y) {
            console.log(x);
            startIndex = 2;
            lastIndex = x;
            prevLastIndex = y;
            tabLimitInID = standardFile;
        }
        setTabindexLimit(4, "scheduleConfId", 3);
        // end tabindex

        //ExportToExcel 
        self.exportToExcel = function (isExport, gId) {
            var selectedDetailedDownloadItems = getSelectedUniqueId(gId);
            var unselectedDetailedDownloadItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            var param = getPeripheralDevicesDetailsParameter(true, columnSortFilter, visibleColumnsList);

            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflage = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                detailedDownloadExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        //ExportToExcel Goes To this Function
        function detailedDownloadExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data != null) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }

            var params = JSON.stringify(param);;
            ajaxJsonCall('GetPeripheralDevicesForDevice', params, callBackfunction, true, 'POST', true);
        }

        //Grid Call
        var param = getPeripheralDevicesDetailsParameter(false, columnSortFilter, []);
        getPeripheralDevicesDetailsGrid('jqxgridPeripheralDeviceDetails', param);

        seti18nResourceData(document, resourceStorage);
    }// ModelView End


    //Grid parameter
    function getPeripheralDevicesDetailsParameter(isExport, columnSortFilter, visibleColumnsList) {

        var getPeripheralDevicesForDeviceReq = new Object();
        var Export = new Object();
        var UniqueDeviceId = new Object();
        var coulmnfilter = new Object();

        Export.DynamicColumns = null;
        if (isExport == true) {
            Export.IsAllSelected = true;
            Export.IsExport = true;
            Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
        } else {
            Export.IsAllSelected = false;
            Export.IsExport = false;
        }
        Export.VisibleColumns = visibleColumnsList;

        FilterList = new Array();
        coulmnfilter.ColumnType = null;
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterDays = null;
        coulmnfilter.FilterValue = null;
        coulmnfilter.FilterValueOptional = null;

        FilterList.push(coulmnfilter);

        var ColumnSortFilter = columnSortFilter;
        ColumnSortFilter.FilterList = (null);
        ColumnSortFilter.GridId = 'ConnectedDevicesDeviceProfile';
        ColumnSortFilter.SortList = null;

        getPeripheralDevicesForDeviceReq.ColumnSortFilter = ColumnSortFilter;
        getPeripheralDevicesForDeviceReq.Export = Export;
        getPeripheralDevicesForDeviceReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

        var param = new Object();
        param.token = TOKEN();
        param.getPeripheralDevicesForDeviceReq = getPeripheralDevicesForDeviceReq;

        return param;
    }
    //end grid parameter

    // Calling Jqxgrid
    function getPeripheralDevicesDetailsGrid(gID, param) {

        var gridColumns = [];

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
                     { name: 'SerialNumber', map: 'SerialNumber' },
                     { name: 'Model', map: 'Model' },
                     { name: 'LastContactedOn', map: 'LastContactedOn', type: 'date' },
                     { name: 'UniqueDeviceId', map: 'UniqueDeviceId' }

            ],
            root: 'PeripheralDevice',
            type: "POST",
            data: param,

            url: AppConstants.get('API_URL') + "/GetPeripheralDevicesForDevice",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getPeripheralDevicesForDeviceResp)
                    data.getPeripheralDevicesForDeviceResp = $.parseJSON(data.getPeripheralDevicesForDeviceResp);
                else
                    data.getPeripheralDevicesForDeviceResp = [];

                if (data.getPeripheralDevicesForDeviceResp && data.getPeripheralDevicesForDeviceResp.TotalRecords > 0) {
                    source.totalrecords = data.getPeripheralDevicesForDeviceResp.TotalRecords;
                    source.totalpages = data.getPeripheralDevicesForDeviceResp.TotalPages;
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
                    disableIcons(['btnRestFilter', 'btnExportToexcel', 'btnRefresh']);
                    var columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'ConnectedDevicesDeviceProfile', 'LastContactedOn');

                    koUtil.GlobalColumnFilter = columnSortFilter;
                    param.getPeripheralDevicesForDeviceReq.ColumnSortFilter = columnSortFilter;

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnExportToexcel', 'btnRefresh']);
                    if (data.getPeripheralDevicesForDeviceResp && data.getPeripheralDevicesForDeviceResp.PeripheralDevice) {
                        for (var i = 0; i < data.getPeripheralDevicesForDeviceResp.PeripheralDevice.length; i++) {
                            if (data.getPeripheralDevicesForDeviceResp.PeripheralDevice[i].LastContactedOn != null) {
                                var localTime1 = moment(data.getPeripheralDevicesForDeviceResp.PeripheralDevice[i].LastContactedOn);
                                localTime1 = moment(localTime1).format(LONG_DATETIME_FORMAT_AMPM);
                                data.getPeripheralDevicesForDeviceResp.PeripheralDevice[i].LastContactedOn = localTime1;
                            }
                        }

                        if (data.getPeripheralDevicesForDeviceResp.TotalSelectionCount != 'undefined') {
                            gridStorage[0].TotalSelectionCount = data.getPeripheralDevicesForDeviceResp.TotalSelectionCount;
                            var updatedGridStorage = JSON.stringify(gridStorage);
                            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        }

                    } else {
                        data.getPeripheralDevicesForDeviceResp = new Object();
                        data.getPeripheralDevicesForDeviceResp.PeripheralDevice = [];
                    }
                    $('.all-disabled').hide();
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                }
            }
        );

        var rendered = function (element) {
            enablegridfunctions(gID, 'UniqueDeviceId', element, gridStorage, false, 'pagerDivPeripheralDeviceDetails', false, 0, 'UniqueDeviceId', null, null, null);
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

        gridColumns = [
                    {
                        text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, hidden: true, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                   {
                       text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 200, width: 'auto', enabletooltips: false, cellsrenderer: SerialNoRenderer,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('model', { lng: lang }), datafield: 'Model', editable: false, minwidth: 200, width: 'auto', enabletooltips: false,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
                       }
                   },
                   {
                       text: i18n.t('last_contact_date', { lng: lang }), datafield: 'LastContactedOn', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 200, width: 'auto', enabletooltips: false,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);

                       }

                   }
        ];

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
            rowsheight: 32,
            enabletooltips: true,
            rendergridrows: function () {
                return dataAdapter.records;
            },
            ready: function () {
                callOnGridReady(gID, gridStorage);

                var columns = genericHideShowColumn(gID, true, []);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;
            },
            columns: gridColumns

        });//JqxGrid End

        getGridBiginEdit(gID, 'model', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'model');
    } //Grid Function End

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