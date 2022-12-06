define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {

    columnSortFilterModelJob = new Object();
    var lang = getSysLang();
    return function getModelJobResult() {
     

        var self = this;

        //Draggable function
        $('#mdlContentJobStatusHeader').mouseup(function () {
            $("#mdlContentJobStatus").draggable({ disabled: true });
        });

        $('#mdlContentJobStatusHeader').mousedown(function () {
            $("#mdlContentJobStatus").draggable({ disabled: false });
        });
        /////////
        
        self.serialNumber = globalVariableForContentJobStatus.SerialNumber;
        self.modelName = globalVariableForContentJobStatus.ModelName;
        self.jobDevicesId = globalVariableForContentJobStatus.JobDevicesId;
        self.columnlist = ko.observableArray();
        var compulsaryfield = ['ContentName', 'FileSize'];
        modelReposition();
        //open model show hide
        self.openPopup = function (gridID) {
            self.columnlist(genericHideShowColumn(gridID, false, compulsaryfield));
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
            var param = getModelContentResultDetials(true, columnSortFilterModelJob, self.jobDevicesId, visibleColumnsListForPopup);
            modelContentJobExport(param);
        }

        //grid display
        var param = getModelContentResultDetials(false, columnSortFilterModelJob, self.jobDevicesId);
        getContentResultsGrid('jqxGridModelID', param);

        seti18nResourceData(document, resourceStorage);
    }   

    function modelContentJobExport(param) {

        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                } 
            }
        }

        var method = 'GetDownloadResults ';
        var params = JSON.stringify(param);
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getContentResultsGrid(gID, param) {

        var gridStorageArr = new Array();
        var gridStorageObj = new Object();
        gridStorageObj.checkAllFlag = 0;
        gridStorageObj.counter = 0;
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
                { name: 'ContentName', map: 'ContentName' },
                { name: 'Status', map: 'Status' },               
                { name: 'StartTime', map: 'StartTime' },
                { name: 'DownloadDuration', map: 'DownloadDuration' },
                { name: 'InstalledDate', map: 'InstalledDate' },
                { name: 'ExpiredDate', map: 'ExpiredDate' },
                { name: 'File', map: 'File' },
                { name: 'FileSize', map: 'FileSize' },
                { name: 'JobDevicesId', map: 'JobDevicesId' },
                { name: 'isSelected', type:'number' }
            ],
            root: 'DownloadJobResults',
            type: 'POST',
            data: param,
            url: AppConstants.get('API_URL') + "/GetDownloadResults",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getDownloadResultsResp) {
                    data.getDownloadResultsResp = $.parseJSON(data.getDownloadResultsResp);
                }
                else
                    data.getDownloadResultsResp = [];
                if (data.getDownloadResultsResp) {
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
                   var columnSortFilter = new Object();
                   columnSortFilter = columnSortFilterFormatedData(columnSortFilterModelJob, gID);
                   var pagerInfo = $("#" + gID).jqxGrid('getpaginginformation');
                   if (pagerInfo.pagenum && pagerInfo.pagesize != null) {
                       param.getDownloadResultsReq.Pagination.PageNumber = Number(pagerInfo.pagenum) + 1;
                   } else {
                       param.getDownloadResultsReq.Pagination.PageNumber = 1;
                   }
                   param.getDownloadResultsReq.ColumnSortFilter = columnSortFilter;
                   data = JSON.stringify(param);
                   return data;
               },
               downloadComplete: function (data, status, xhr) {
                   enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                   
                   if (data.getDownloadResultsResp && data.getDownloadResultsResp.DownloadJobResults) {
                       for (var i = 0; i < data.getDownloadResultsResp.DownloadJobResults.length; i++) {
                           data.getDownloadResultsResp.DownloadJobResults[i].StartTime = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].StartTime);
                           data.getDownloadResultsResp.DownloadJobResults[i].InstalledDate = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].InstalledDate);
                           data.getDownloadResultsResp.DownloadJobResults[i].ExpiredDate = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].ExpiredDate);
                       }
                   }
                   if (data.getDownloadResultsResp.Devices) {
                       if (data.getDownloadResultsResp.PaginationResponse) {
                           //if (data.getDownloadResultsResp.PaginationResponse.HighLightedItemPage > 0) {
                           //    gridStorage[0].highlightedPage = data.getDownloadResultsResp.PaginationResponse.HighLightedItemPage;
                           //    var updatedGridStorage = JSON.stringify(gridStorage);
                           //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                           //}
                       } else {

                       }
                   } else {
                       data.getDownloadResultsResp.Devices = [];
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
            enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, false, 'pagerDivmodelContentJob');
            $('.jqx-grid-pager').css("display", "none");
            return true;
        }

        $("#" + gID).jqxGrid(
            {
                width: "100%",
                pageable: true,
                editable: true,
                source: dataAdapter,
                altRows: true,
                autoshowcolumnsmenubutton:false,
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
                ready: function () {
                    var columns = genericHideShowColumn(gID, true, '');
                    for (var i = 0; i < columns.length; i++) {
                        visibleColumnsListForPopup.push(columns[i].columnfield);
                    }
                    isPopUpOpen = true;
                },
                columns: [
                     {
                         text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox',
                         datafield: 'isSelected', width: 40, rendered: rendered, hidden: true
                     },
                    { text: '', datafield: 'JobDevicesId', hidden: true, editable: false, minwidth: 0, },
                    {
                        text: i18n.t('content(s)', { lng: lang }), datafield: 'ContentName', filterable: true, editable: false, minwidth: 100,
                        
                    },
                    { text: i18n.t('rs_statsus', { lng: lang }), datafield: 'Status', editable: false, minwidth: 100,  },
                    {
                        text: i18n.t('download_started_at', { lng: lang }), datafield: 'StartTime', editable: false, minwidth: 130,  cellsrenderer: receivedDateRenderer,
                        
                    },
                    { text: i18n.t('download_duration', { lng: lang }), datafield: 'DownloadDuration', editable: false, minwidth: 100,  },
                    {
                        text: i18n.t('installed_at', { lng: lang }), datafield: 'InstalledDate', editable: false, minwidth: 150,  cellsrenderer: receivedDateRenderer,
                       
                    },
                    {
                        text: i18n.t('expiration_date', { lng: lang }), datafield: 'ExpiredDate', editable: false, minwidth: 150, cellsrenderer: receivedDateRenderer,
                       
                    },
                    {
                        text: i18n.t('content_file_name', { lng: lang }), datafield: 'File', editable: false,minwidth: 100,
                        
                    },
                    {
                        text: i18n.t('fileSize_mb', { lng: lang }), datafield: 'FileSize', editable: false, minwidth: 100, 
                       
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

    function getModelContentResultDetials(isExport, columnSortFilterModelJob, jobDevicesId, visibleColumns) {
        var getDownloadResultsReq = new Object();
        var Export = new Object();
        var Pagination = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Export.DynamicColumns = null;
        Export.VisibleColumns = visibleColumns;
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
        getDownloadResultsReq.PackageType = 2 ; //ENUM.get("Content'")
        getDownloadResultsReq.Pagination = Pagination;

        var param = new Object();
        param.token = TOKEN();
        param.getDownloadResultsReq = getDownloadResultsReq;

        return param;
    }

});

