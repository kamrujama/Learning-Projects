define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {

    var lang = getSysLang();
    var columnSortFilterActionJob = new Object();
    koUtil.GlobalColumnFilter = new Array();
    return function getModelActionResults() {
       
        var self = this;
        self.serialNumber = globalVariableForActionJobStatus.SerialNumber;
        self.modelName = globalVariableForActionJobStatus.ModelName;
        self.jobDevicesId = globalVariableForActionJobStatus.JobDevicesId;
        self.isCancelRequestFailed = globalVariableForActionJobStatus.IsCancelRequestFailed;
        self.jobName = globalVariableForActionJobStatus.JobName;
        self.uniqueDeviceId = globalVariableForActionJobStatus.UniqueDeviceId
        self.columnlist = ko.observableArray();
        var compulsaryfield = ['ActionType'];
        modelReposition();
        //open model show hide
        self.openPopup = function (gridID) {
            self.columnlist(genericHideShowColumn(gridID, false, compulsaryfield));
            $('#closeShowHide').modal('show');
        }

        //display model show hide
        self.Hidecolumn = function (gridID) {
            $("#columnDiv").find("input:checkbox").each(function (i, ob) {
                var columnName = $(ob).val();
                if ($(ob).is(':checked')) {
                    $("#" + gridID).jqxGrid('showcolumn', columnName);
                } else {
                    $("#" + gridID).jqxGrid('hidecolumn', columnName);
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
            var param = getModelActionJobStatusParameters(true, columnSortFilterActionJob, self.jobDevicesId, self.jobName);
           

            self.exportflage = ko.observable();
            var datainfo = $("#" + gridID).jqxGrid('getdatainformation');
           
            if (datainfo.rowscount > 0) {
               
                openAlertpopup(1, 'export_Sucess');
                self.exportflage(true);
                modelActionJobExport(param);
            }
            else {
                
                openAlertpopup(1, 'no_data_to_export');
                self.exportflage(false);
            }
        }

        //grid display
        var param = getModelActionJobStatusParameters(false, columnSortFilterActionJob, self.jobDevicesId, self.jobName);
        getModalActionJobResults('jqxGridActionModel', param);
        seti18nResourceData(document, resourceStorage);
    }

    function modelActionJobExport(param) {

        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                } 
            }
        }

        var method = 'GetDiagnosticsResults ';
        var params = JSON.stringify(param);
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getModalActionJobResults(gID, param) {

        var gridStorageArr = new Array();
        var gridStorageObj = new Object();
        gridStorageObj.checkAllFlag = 0;
        gridStorageObj.counter = 0;
        gridStorageObj.selectedDataArr = [];
        gridStorageObj.unSelectedDataArr = [];
        gridStorageObj.singlerowData = [];
        gridStorageObj.multiRowData = [];
        gridStorageArr.push(gridStorageObj);
        var gridStorage = JSON.stringify(gridStorageArr);
        window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
        var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

        var source = {
            dataType: 'json',
            dataFields: [
                { name: 'ActionType', map: 'ActionType' },
                { name: 'OperationExecutionTimeOnDevice', map: 'OperationExecutionTimeOnDevice' },
                { name: 'Status', map: 'Status' },
                { name: 'RecievedOn', map: 'RecievedOn' },
                { name: 'FileUrl', map: 'FileUrl' },
            ],
            root: 'DiagnosticsResult',
            type: 'POST',
            data: param,
            url: AppConstants.get('API_URL') + "/GetDiagnosticsResults",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getDiagnosticsResultsResp && data.getDiagnosticsResultsResp) {
                    data.getDiagnosticsResultsResp = $.parseJSON(data.getDiagnosticsResultsResp);
                    if (data.getDiagnosticsResultsResp.PaginationResponse) {
                        source.totalrecords = data.getDiagnosticsResultsResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getDiagnosticsResultsResp.PaginationResponse.TotalPages;
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                    }
                }
                else
                    data.getDiagnosticsResultsResp = [];

            },
        }
        var dataAdapter = new $.jqx.dataAdapter(source,
           {
               formatData: function (data) {
                   $('.all-disabled').show();
                   var columnSortFilter = new Object();
                   columnSortFilter = columnSortFilterFormatedData(columnSortFilterActionJob, gID);
                   var pagerInfo = $("#" + gID).jqxGrid('getpaginginformation');
                   if (pagerInfo.pagenum && pagerInfo.pagesize != null) {
                       param.getDiagnosticsResultsReq.Pagination.PageNumber = Number(pagerInfo.pagenum) + 1;
                   } else {
                       param.getDiagnosticsResultsReq.Pagination.PageNumber = 1;
                   }
                   param.getDiagnosticsResultsReq.ColumnSortFilter = columnSortFilter;
                   koUtil.GlobalColumnFilter = columnSortFilter;
                   data = JSON.stringify(param);
                   return data;
               },
               downloadComplete: function (data, status, xhr) {
                   enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                   //if (data.getDiagnosticsResultsResp)
                   //    data.getDiagnosticsResultsResp = $.parseJSON(data.getDiagnosticsResultsResp);

                   if (data.getDiagnosticsResultsResp.Devices) {
                       for (var i = 0; i < data.getDiagnosticsResultsResp.DiagnosticsResult.length; i++) {
                           if (data.getDiagnosticsResultsResp.DiagnosticsResult[i].OperationExecutionTimeOnDevice) {

                               data.getDiagnosticsResultsResp.DiagnosticsResult[i].OperationExecutionTimeOnDevice = convertToLocaltimestamp(data.getDiagnosticsResultsResp.DiagnosticsResult[i].OperationExecutionTimeOnDevice);
                           }
                           data.getDiagnosticsResultsResp.DiagnosticsResult[i].RecievedOn = convertToLocaltimestamp(data.getDiagnosticsResultsResp.DiagnosticsResult[i].RecievedOn);
                       }
                       if (data.getDiagnosticsResultsResp.PaginationResponse) {
                           //if (data.getDiagnosticsResultsResp.PaginationResponse.HighLightedItemPage > 0) {
                           //    gridStorage[0].highlightedPage = data.getDiagnosticsResultsResp.PaginationResponse.HighLightedItemPage;
                           //    var updatedGridStorage = JSON.stringify(gridStorage);
                           //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                           //}
                       } else {

                       }
                   } else {
                       data.getDiagnosticsResultsResp.Devices = [];
                   }

                   $('.all-disabled').hide();
               },
               loadError: function (jqXHR, status, error) {
                   $('.all-disabled').hide();
               }
           }
       );

        //sorting
        $("#" + gID).bind("sort", function (event) {
            $("#" + gID).jqxGrid('updatebounddata');
        });

        //event job date conversion
        var receivedDateRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var dateReceived = $("#" + gID).jqxGrid("getcellvalue", row, columnfield);
            var dateConvert = convertToLocaltimestamp(dateReceived);
            return dateConvert;
        }      

        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID,  'JobDevicesId',element, gridStorage, true, 'pagerDivmodelActionJob');
            $('.jqx-grid-pager').css("display", "none");
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
                virtualmode: true,
                pageSize: AppConstants.get('ROWSPERPAGE'),
               filterable: true,
                sortable: true,
                columnsResize: true,
                columnsreorder: true,
                selectionmode: 'singlerowadvanced',
                theme: AppConstants.get('JQX-GRID-THEME'),
                rowsheight: 32,
                rendergridrows: function () {
                    return dataAdapter.records;
                },
                autoshowfiltericon: true,
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
                          text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox',
                          datafield: 'isSelected', width: 40, rendered: rendered, hidden: true
                      },
                      { text: '', dataField: 'JobDevicesId', hidden: true, editable: false, minwidth: 0,  },
                    {
                        text: i18n.t('action', { lng: lang }), dataField: 'ActionType', editable: false, minwidth: 100, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }

                    },
                    {
                        text: i18n.t('executed_at', { lng: lang }), dataField: 'OperationExecutionTimeOnDevice', editable: false, minwidth: 160,  cellsrenderer: receivedDateRenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    { text: i18n.t('rs_statsus', { lng: lang }), dataField: 'Status', editable: false, minwidth: 120, },
                    {
                        text: i18n.t('received_date', { lng: lang }), dataField: 'RecievedOn', editable: false, minwidth: 160, cellsrenderer: receivedDateRenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('results', { lng: lang }), dataField: 'FileUrl', columntype: 'button', sortable: false,menu:false, filterable: false, editable: false, minwidth: 100,  cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value != null) {
                                return '...';
                            } else {
                                return '';
                            }
                        },
                        buttonclick: function (row) {
                            //get cell value
                            var Value = $("#" + gID).jqxGrid('getcellvalue', row, 'FileUrl');
                            //redirect to another page based on File url
                            window.open(Value)
                        }
                    },
                ],
            });


        $("#" + gID).on('filter', function (event) {
            $("#" + gID).jqxGrid('updatebounddata');
        });
        $("#" + gID).on('sort', function (event) {
            $("#" + gID).jqxGrid('updatebounddata');
        });

    }

    function getModelActionJobStatusParameters(isExport, columnSortFilterActionJob, jobDevicesId, jobName) {

        var getDiagnosticsResultsReq = new Object();
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

        var ColumnSortFilter = columnSortFilterActionJob;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getDiagnosticsResultsReq.CallType = ENUM.get("CALLTYPE_WEEK");
        getDiagnosticsResultsReq.ColumnSortFilter = ColumnSortFilter; 
        getDiagnosticsResultsReq.Export = Export;
        getDiagnosticsResultsReq.JobDevicesId = jobDevicesId;
        getDiagnosticsResultsReq.JobName = jobName;
        getDiagnosticsResultsReq.Pagination = Pagination;

        var param = new Object();
        param.token = TOKEN();
        param.getDiagnosticsResultsReq = getDiagnosticsResultsReq;

        return param;
    }
});