define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
    var lang = getSysLang();
    columnSortFilterModelJob = new Object();

    return function getModelJobResult() {
       
        var self = this;
        self.serialNumber = globalVariableForDownloadJobStatus.SerialNumber;
        self.modelName = globalVariableForDownloadJobStatus.ModelName;
        self.jobDevicesId = globalVariableForDownloadJobStatus.JobDevicesId;
        self.columnlist = ko.observableArray();
        var compulsoryfields = ['PackageName', 'FileSize'];
        modelReposition();
        //open model show hide
        self.openPopup = function (gridID) {
            self.columnlist(genericHideShowColumn(gridID, false, compulsoryfields));
            $('#closeShowHide').modal('show');
        }

        //display model show hide
        self.Hidecolumn = function (gId) {
            $("#columnDiv").find("input:checkbox").each(function (i, ob) {
                var columnName = $(ob).val();
                if ($(ob).is(':checked')) {
                    $("#" + gId).jqxGrid('showcolumn', columnName);
                } else {
                    $("#" + gId).jqxGrid('hidecolumn', columnName);
                }
            });
            $('#closeShowHide').modal('hide');
        }

        //close show hide
        self.closeshowhidecol = function () {
            $('#closeShowHide').modal('hide');
        }

        // reset filter
        self.clearfilterModel = function (gridID) {
            gridFilterClear(gridID);
        }

        // refresh grid
        self.refreshGridModel = function (gridID) {
            gridRefresh(gridID);
        }

        //exportToexcel model
        self.exportToExcelModel = function (isExport, gridID) {
            var param = getModelDownloadResultDetials(true, columnSortFilterModelJob, self.jobDevicesId);
            modelVRKlibDownloadJobExport(param);
        }

        //grid display
        var param = getModelDownloadResultDetials(false, columnSortFilterModelJob, self.jobDevicesId);
        getModalJobResults('jqxGridModel', param, self.jobDevicesId);
        seti18nResourceData(document, resourceStorage);
    }

    function modelVRKlibDownloadJobExport(param) {
        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(1, 'export_Sucess');
                } 
            }
        }

        var method = 'GetDownloadResults ';
        var params = JSON.stringify(param);
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getModalJobResults(gID, param) {

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
        gridStorageObj.highlightedRow = 0;
        gridStorageArr.push(gridStorageObj);
        var gridStorage = JSON.stringify(gridStorageArr);
        window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
        var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

        var source = {
            dataType: 'json',
            dataFields: [
                { name: 'PackageName', map: 'PackageName'},
                { name: 'Status', map: 'Status' },
                { name: 'Description', map: 'Description'},
                { name: 'StartTime', map: 'StartTime'},
                { name: 'DownloadDuration', map: 'DownloadDuration'},
                { name: 'InstalledDate', map: 'InstalledDate'},
                { name: 'File', map: 'File'},
                { name: 'FileSize', map: 'FileSize'},
                { name: 'JobDevicesId', map: 'JobDevicesId'},
                { name: 'isSelected', type: 'number'},
            ],
            root: 'DownloadJobResults',
            type: 'POST',
            data: param,           
            url: AppConstants.get('API_URL') + "/GetDownloadResults",
            contentType: 'application/json',
            beforeprocessing: function (data) {

                if (data && data.getDownloadJobSummaryResp) {
                    data.getDownloadJobSummaryResp = $.parseJSON(data.getDownloadJobSummaryResp);
                }
                else
                    data.getDownloadJobSummaryResp = [];

                if (data.getDownloadJobSummaryResp) {
                    if (data.getDownloadResultsResp.PaginationResponse) {
                        source.totalrecords = data.getDownloadResultsResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getDownloadResultsResp.PaginationResponse.TotalPages;
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
                   var columnSortFilter = new Object();
                   columnSortFilter = columnSortFilterFormatedData(columnSortFilterModelJob, gID, gridStorage);
                   var pagerInfo = $("#" + gID).jqxGrid('getpaginginformation');
                   if (pagerInfo.pagenum && pagerInfo.pagesize != null) {
                       param.getDownloadResultsReq.Pagination.PageNumber = Number(pagerInfo.pagenum) + 1;
                   } else {
                       param.getDownloadResultsReq.Pagination.PageNumber = 1;
                   }
                   param.getDownloadResultsReq.ColumnSortFilter = columnSortFilter;
                   param.getDownloadResultsReq.Pagination.HighLightedItemId = gridStorage[0].highlightedRow;
                   data = JSON.stringify(param);
                   return data;
               },
               downloadComplete: function (data, status, xhr) {

                   if (data.getDownloadResultsResp && data.getDownloadResultsResp.DownloadJobResults) {
                       for (var i = 0; i < data.getDownloadResultsResp.DownloadJobResults.length; i++) {
                           data.getDownloadResultsResp.DownloadJobResults[i].StartTime = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].StartTime);
                           data.getDownloadResultsResp.DownloadJobResults[i].InstalledDate = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].InstalledDate);
                       }
                       if (data.getDownloadResultsResp.TotalSelectionCount != 'undefined') {
                           gridStorage[0].TotalSelectionCount = data.getDownloadResultsResp.TotalSelectionCount;
                           var updatedGridStorage = JSON.stringify(gridStorage);
                           window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                       }
                   } else {
                       data.getDownloadResultsResp = new Object();
                       data.getDownloadResultsResp.DownloadJobResults = [];
                   }
                   $('.all-disabled').hide();
               },
               loadError: function (jqXHR, status, error) {
                   $('.all-disabled').hide();
               }
           }
       );

        //event job date conversion
        var receivedDateRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var dateReceived = $("#" + gID).jqxGrid("getcellvalue", row, columnfield);
            var dateConvert = jsonDateConversion(dateReceived);
            return dateConvert;
        }


        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, true, 'pagerDivmodelDowloadJob');
            $('.jqx-grid-pager').css("display", "none")
            return true;
        }

        //Custom filter
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
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
                showfilterrow: true,
                virtualmode: true,
                pageSize: AppConstants.get('ROWSPERPAGE'),
                filterable: true,
                filterMode: 'advanced',
                sortable: true,
                columnsResize: true,
                columnsreorder: true,
                selectionmode: 'singlerowadvanced',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowfiltericon: true,
                rendergridrows: function () {
                    return dataAdapter.records;
                },
                handlekeyboardnavigation: function (event) {
                    var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
                    if (key == 13) {
                        $("#" + gID).jqxGrid('clearselection');
                        $("#" + gID).jqxGrid('updatebounddata');
                        return true;
                    }
                },
                columns: [
                      {
                          text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox',
                          datafield: 'isSelected', width: 40, rendered: rendered, hidden: true
                      },
                    {
                        text: i18n.t('device_pack', { lng: lang }), dataField: 'PackageName', filterable: true, editable: false, minwidth: 200, width: 'auto', filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    { text: i18n.t('rs_statsus', { lng: lang }), dataField: 'Status', filterable: true, editable: false, minwidth: 200, width: 'auto', },
                    { text: i18n.t('content_description', { lng: lang }), dataField: 'Description', filterable: true, editable: false, minwidth: 200, width: 'auto', },
                    {
                        text: i18n.t('download_started_at', { lng: lang }), dataField: 'StartTime', filterable: true, editable: false, minwidth: 200, width: 'auto', cellsrenderer: receivedDateRenderer, filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    { text: i18n.t('download_duration', { lng: lang }), dataField: 'DownloadDuration', filterable: true, editable: false, minwidth: 200, width: 'auto', },
                    {
                        text: i18n.t('installed_at', { lng: lang }), dataField: 'InstalledDate', filterable: true, editable: false, minwidth: 200, width: 'auto', cellsrenderer: receivedDateRenderer, filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('content_file_name', { lng: lang }), dataField: 'File', filterable: true, editable: false, minwidth: 200, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('fileSize_mb', { lng: lang }), dataField: 'FileSize', filterable: true, editable: false, minwidth: 200, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                ],
            });

        getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'JobDevicesId');

    }

    function getModelDownloadResultDetials(isExport, columnSortFilterModelJob, jobDevicesId) {

        var getDownloadResultsReq = new Object();
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

        var ColumnSortFilter = columnSortFilterModelJob;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getDownloadResultsReq.CallType = ENUM.get("CALLTYPE_WEEK");
        getDownloadResultsReq.ColumnSortFilter = ColumnSortFilter;
        getDownloadResultsReq.Export = Export;
        getDownloadResultsReq.JobDevicesId = jobDevicesId;
        getDownloadResultsReq.PackageType = ENUM.get("Software'");
        getDownloadResultsReq.Pagination = Pagination;

        var param = new Object();
        param.token = TOKEN();
        param.getDownloadResultsReq = getDownloadResultsReq;

        return param;
    }

});