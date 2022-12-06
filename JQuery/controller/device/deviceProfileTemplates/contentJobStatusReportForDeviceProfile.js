define(["knockout", "autho", "advancedSearchUtil", "koUtil" ], function (ko, autho, ADSearchUtil,koUtil) {
    var lang = getSysLang();
    columnSortFilterContentJob = new Object();
    columnSortFilterModelJob = new Object();
    jobDevicesId = 0;
    isCancelRequestFailed = '';
    return function DashBoardViewModel() {
        
        var self = this;

        //Check Rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }


        self.templateFlag = ko.observable(false);

        self.observableModelComponent = ko.observable();
        self.observableModelPopup = ko.observable();

        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['SerialNumber', 'results', 'PackageName', 'FileSize'];
        self.columnlist = ko.observableArray();

        var modelName = "unloadTemplate";
        loadelement(modelName, 'genericPopup', 1);
        loadelement(modelName, 'genericPopup', 2);

        //For advanced serch functionality
        self.AdvanceTemplateFlag = ko.observable(false);
        self.observableCriteria = ko.observable();
        loadCriteria('modalCriteria', 'genericPopup');
        self.observableAdvancedSearchModelPopup = ko.observable();
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
        ADSearchUtil.deviceSearchObj = new Object()
        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];
      //  ADSearchUtil.AdScreenName = 'contentJobStatus';
        ADSearchUtil.ExportDynamicColumns = [];

        setMenuSelection();

        //For advanced search
        ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridContentJobStatusProfile';
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;

        ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "HierarchyFullPath", "ModelName", "JobName", "JobStatus", "Package", "Tags", "ScheduleDate", "ScheduledInstallDate", "ScheduledReplaceDate", "ScheduleInformation", "JobCreatedBy", "JobCreatedOn", "results", "ContentName", "Status", "StartTime", "DownloadDuration", "InstalledDate", "ExpiredDate", "File", "FileSize","FullName"];

        modelReposition();
        //open popup
        self.openPopup = function (popupName, gridID) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                
                self.gridIdForShowHide(gridID);
                self.columnlist('');////
                
                self.columnlist(genericHideShowColumn(gridID, true, compulsoryfields));

                if (visibleColumnsList.length == 0) {
                    var columns = self.columnlist();
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                }

                loadelement(popupName, 'genericPopup', 2);
                
                $('#modelcloseShowHide').modal('show');
            } else if (popupName == "modelContentJobStatus") {
                loadelement(popupName, 'contentLibrary', 1);
                $('#contentModelID').modal('show');
            } else if (popupName == "modelCancelContentJobStatus") {
                loadelement(popupName, 'contentLibrary', 1);
                $('#contentModelID').modal('show');
            } else if (popupName == 'modelAdvancedSearch') {
                self.AdvanceTemplateFlag(true);
                loadAdvancedSearchModelPopup(popupName, 'genericPopup', 2);
                $('#AdvanceSearchModal').modal('show');
            }
        }

        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
        }

        function loadelement(elementname, controllerId, flage) {
            
            if (!ko.components.isRegistered(elementname)) {
                
                generateTemplate(elementname, controllerId);
            }

            if (flage == 2) {
                
                self.observableModelPopup(elementname);
            } else {
                
                self.observableModelComponent(elementname);
            }
        }

        //For advanced search
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

        function loadAdvancedSearchModelPopup(elementname, controllerId) {

            if (!ko.components.isRegistered(elementname)) {
                //new template code
                var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
                var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
                ko.components.register(elementname, {
                    viewModel: { require: ViewName },
                    template: { require: 'plugin/text!' + htmlName }
                });
            }
            self.observableAdvancedSearchModelPopup(elementname);
        }


        $('#openContentModelheader').mouseup(function () {
            $("#openContentModelContent").draggable({ disabled: true });
        });

        $('#openContentModelheader').mousedown(function () {
            $("#openContentModelContent").draggable({ disabled: false });
        });


        //unload template
        self.closeOpenModel = function (gridID, modelPopup) {
            gridRefresh(gridID);
            $('#' + modelPopup).modal('hide');
            isPopUpOpen = false;
            self.observableModelComponent('unloadTemplate');
            self.observableModelPopup('unloadTemplate');
            $("#openContentModelContent").css('left', '');
            $("#openContentModelContent").css('top', '');
        };

        // reset filter
        self.clearfilter = function (gridID) {
            
            //CallType = ENUM.get("CALLTYPE_NONE");
            gridFilterClear(gridID);
        }

        // refresh grid
        self.refreshGrid = function (gridID) {
            gridRefresh(gridID);
        }

        self.expandCriteria = function () {
            if ($("#deviceCriteriaDiv").hasClass('hide')) {
                $("#deviceCriteriaDiv").removeClass('hide');
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default"  role="button" tabindex="0"  title="collapse"><i class="icon-angle-up"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            } else {
                $("#deviceCriteriaDiv").addClass('hide')
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default"  role="button" tabindex="0"  title="expand"><i class="icon-angle-down"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            }
        }

        //unload advance search popup
        self.unloadAdvancedSearch = function () {
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            $("#AdvanceSearchModal").modal('hide');
            $("#mainPageBody").removeClass('modal-open-appendon');
            isAdpopup = '';
        }
        self.clearAdvancedSearch = function () {
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
        }

        // cancel job status
        self.cancelJobStatus = function (popupName, gridID) {
            var selectedCount = parseInt($("#" + gridID + "seleceteRowSpan").text());
            if (selectedCount == 0) {
                openAlertpopup(1, 'please_select_atleast_one_job_for_cancellation');
            } else {
                self.openPopup(popupName, gridID);
            }
        }

        //export to excel
        self.exportToExcel = function (isExport, gridID) {
            var selectedContentJobItems = getSelectedUniqueId(gridID);
            var unselectedContentJobItems = getUnSelectedUniqueId(gridID);
            var checkAll = checkAllSelected(gridID);
            var datainfo = $("#" + gridID).jqxGrid('getdatainformation');

            if (gridID == "jqxgridContentJobStatusProfile") {
                visibleColumnsList = GetExportVisibleColumn(gridID);
                var param = getContentJobStatusParameters(true, columnSortFilterContentJob, ADSearchUtil.deviceSearchObj, selectedContentJobItems, unselectedContentJobItems, checkAll, visibleColumnsList);

                if (datainfo.rowscount > 0) {
                    contentJobExport(param);
                } else {
                    openAlertpopup(1, 'no_data_to_export');
                }
            } else {
                var param = getDownloadResultsForContentParams(true, columnSortFilterModelJob, jobDevicesId, visibleColumnsListForPopup);

                if (datainfo.rowscount > 0) {
                    getDownloadResultsForContentExport(param);
                }
                else {
                    openAlertpopup(1, 'no_data_to_export');
                }
            }
        }

        //grid call declare
        var param = getContentJobStatusParameters(false, columnSortFilterContentJob, ADSearchUtil.deviceSearchObj, null, null, 0, []);
        getContentJobGridDetails('jqxgridContentJobStatusProfile', param, self.openPopup);

        seti18nResourceData(document, resourceStorage);
    }

    function generateTemplate(tempname, controllerId) {
        //new template code
        var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
        var viewName = 'controller/' + controllerId + '/' + tempname + '.js';
        ko.components.register(tempname, {
            viewModel: { require: viewName },
            template: { require: 'plugin/text!' + htmlName }
        });
        // end new template code
    }

    function contentJobExport(param) {

        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(1, 'export_Sucess');
                } 
            }
        }

        var method = 'GetDownloadJobSummaryForDeviceProfile';
        var param1 = new Object();
        param1.getDownloadJobSummaryForDeviceProfileReq = param.getDownloadJobSummaryForDeviceProfileReq;
        param1.token = param.token;
        var params = JSON.stringify(param1);
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getContentJobGridDetails(gID, param, openPopup) {
        var isFilter;
        if (isContentJobGridDetailsFilter == undefined || isContentJobGridDetailsFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        isContentJobGridDetailsFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
      //  CallType = InitGridStoragObj.CallType;
        //For Advanced search
        var gridColumns = [];

        var updatedGridColumn = [];
        

        var source = {
            dataType: 'json',
            dataFields: [
                { name: 'JobDevicesId', map: 'JobDevicesId' },
                { name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
                { name: 'SerialNumber', map: 'DeviceDetail>SerialNumber' },
                { name: 'DeviceId', map: 'TaskDeviceId' },
                { name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath' ,type: 'string'},
                { name: 'ModelName', map: 'DeviceDetail>ModelName' },
                { name: 'JobName', map: 'JobName' },
                { name: 'JobStatus', map: 'JobStatus' },
                { name: 'Package', map: 'Package' },//chek
                { name: 'Tags', map: 'Tags' },
                { name: 'ScheduleDate', map: 'ScheduleDate'},
                { name: 'ScheduledInstallDate', map: 'ScheduledInstallDate'},
                { name: 'ScheduledReplaceDate', map: 'ScheduledReplaceDate'},
                { name: 'ScheduleInformation', map: 'ScheduleInformation' },
                { name: 'JobCreatedBy', map: 'JobCreatedBy' },
                { name: 'JobCreatedOn', map: 'JobCreatedOn', type: 'date' },
                { name: 'isSelected', type: 'number' },
                { name: 'IsJobCancelAllowed', map: 'IsJobCancelAllowed' },
                { name: 'AdditionalStatusInfo', map: 'AdditionalStatusInfo' },
                { name: 'FullName', map: 'FullName' },
                { name: 'IsCancelRequestFailed', map: 'IsCancelRequestFailed' },
                { name: 'Component', map: 'Component' }
            ],
            root: 'DownloadJobs',
            type: 'POST',
            data: param,
            url: AppConstants.get('API_URL') + "/GetDownloadJobSummaryForDeviceProfile",
            contentType: 'application/json',
            beforeprocessing: function (data) {

                if (data.getDownloadJobSummaryForDeviceProfileResp)
                    data.getDownloadJobSummaryForDeviceProfileResp = $.parseJSON(data.getDownloadJobSummaryForDeviceProfileResp);
                else
                    data.getDownloadJobSummaryForDeviceProfileResp = [];
                if (data.getDownloadJobSummaryForDeviceProfileResp && data.getDownloadJobSummaryForDeviceProfileResp.PaginationResponse) {
                    source.totalrecords = data.getDownloadJobSummaryForDeviceProfileResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDownloadJobSummaryForDeviceProfileResp.PaginationResponse.TotalPages;

                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
            },
        }
      
          var request= {
               formatData: function (data) {
                   $('.all-disabled').show();
                   $("#btnCancelContent").prop('disabled',true)
                   disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                   var columnSortFilter = new Object();
                   columnSortFilter = columnSortFilterFormatedData(columnSortFilterContentJob, gID, gridStorage, 'contentJobsForDeviceProfile', 'JobCreatedOn');
                   param.getDownloadJobSummaryForDeviceProfileReq.ColumnSortFilter = columnSortFilter;
                   param.getDownloadJobSummaryForDeviceProfileReq.Pagination = getPaginationObject(param.getDownloadJobSummaryForDeviceProfileReq.Pagination, gID);
                   data = JSON.stringify(param);
                   return data;
               },
               downloadComplete: function (data, status, xhr) {
                   
                   if (data.getDownloadJobSummaryForDeviceProfileResp && data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs) {
                       $("#btnCancelContent").prop('disabled', false);
                       for (var i = 0; i < data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs.length; i++) {
                           data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs[i].ScheduleDate = convertToDeviceZonetimestamp(data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs[i].ScheduleDate);
                           data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs[i].ScheduledInstallDate = convertToDeviceZonetimestamp(data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs[i].ScheduledInstallDate);
                           data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs[i].ScheduledReplaceDate = convertToDeviceZonetimestamp(data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs[i].ScheduledReplaceDate);
                           data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs[i].JobCreatedOn = convertToLocaltimestamp(data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs[i].JobCreatedOn);
                       }
                   }

                   enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                   if (data.getDownloadJobSummaryForDeviceProfileResp && data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs) {
                       if (data.getDownloadJobSummaryForDeviceProfileResp.TotalSelectionCount != 'undefined') {
                           gridStorage[0].TotalSelectionCount = data.getDownloadJobSummaryForDeviceProfileResp.TotalSelectionCount;
                           var updatedGridStorage = JSON.stringify(gridStorage);
                           window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                       }
                       if (data.getDownloadJobSummaryForDeviceProfileResp.PaginationResponse) {
                           //if (data.getDownloadJobSummaryForDeviceProfileResp.PaginationResponse.HighLightedItemPage > 0) {
                           //    gridStorage[0].highlightedPage = data.getDownloadJobSummaryForDeviceProfileResp.PaginationResponse.HighLightedItemPage;
                           //    var updatedGridStorage = JSON.stringify(gridStorage);
                           //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                           //}
                       } else {

                       }
                   }
                   else {
                       data.getDownloadJobSummaryForDeviceProfileResp = new Object();
                       data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs = [];
                       $("#btnCancelContent").prop('disabled', true)
                   }
                   if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
                       $("#btnCancelContent").prop("disabled", true);
                   }
                   $('.all-disabled').hide();
               }
           }
          var dataAdapter = intializeDataAdapter(source, request);

        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, true, 'pagerDivContentJobStatusProfile', true, 1, 'IsJobCancelAllowed', null, null, null, 'Protocol');

            return true;
        }

        //for device profile
        function SerialNoRendereContentJobStatus(row, columnfield, value, defaulthtml, columnproperties) {
            var data = $("#" + gID).jqxGrid('getrowdata', row);

            var href = null;
            return '<div style="padding-left:10px;padding-top:9px;"><a href="index.html#deviceProfile/' + data.UniqueDeviceId + '" style="text-decoration:underline;" title="View Profile" >' + value + '</a></div>'
        }


        // click on view result model popup is open
        var resultsRender = function (row, columnfield, value, defaulthtml, columnproperties) {
            return '<div style="padding-left:5x;padding-top:7px;cursor:pointer"> <a title="Click to view Content Details" id="imageId" style="text-decoration:underline;" onClick="openIconPopupcontentjobdeviceProfile(' + row + ')" height="60" width="50" >View Results</a></div>'
        }

        var cellclass = function (row, columnfield, value) {
            var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'IsJobCancelAllowed');
            return classname;
        }

        var cellbeginedit = function (row, datafield, columntype, value) {
            var check = $("#" + gID).jqxGrid('getcellvalue', row, 'IsJobCancelAllowed');
            if (check == true) {
                return true;
            } else {
                return false;
            }
        }

        var jobStatusToolTipRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = displayTooltipAndIconRenderer(gID, row, column, value, defaultHtml, 2);
            return defaultHtml;
        }

        var checkboxrender = function (row, columnfield, value, defaulthtml, columnproperties) {
            var selectedValue = $("#" + gID).jqxGrid('getcellvalue', row, 'JobStatus');
            if (selectedValue == 'Scheduled') {
                $("#row" + row + gID).children('div').css("display", "none");
            } else {
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

        gridColumns = [
                    {
                        text: '', menu: false, sortable: false, filterable: false, resizable: false, draggable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclass,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    { text: '', datafield: 'JobDevicesId', hidden: true, editable: false, minwidth: 0, minwidth: 0, },
                    { text: '', datafield: 'UniqueDeviceId', hidden: true, editable: false, minwidth: 0, },
                    { text: '', datafield: 'AdditionalStatusInfo', hidden: true, editable: false, minwidth: 0, },
                    {
                        text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 100,  enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },                    
                    {
                        text: i18n.t('job_name', { lng: lang }), datafield: 'JobName', editable: false, minwidth: 100, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('job_status', { lng: lang }), datafield: 'JobStatus', editable: false, minwidth: 120, cellsrenderer: jobStatusToolTipRenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Download\/Content Job Status');
                        }
                    },
                    { text: i18n.t('content(s)', { lng: lang }), datafield: 'Package', editable: false, minwidth: 100, menu: false, sortable: false, filterable: false },//check
                    
                    {
                        text: i18n.t('download_scheduled_col', { lng: lang }), datafield: 'ScheduleDate', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 150,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('install_schedule', { lng: lang }), datafield: 'ScheduledInstallDate', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 150,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('expiry_schedule', { lng: lang }), datafield: 'ScheduledReplaceDate', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 150,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    { text: i18n.t('schedule_information', { lng: lang }), datafield: 'ScheduleInformation', editable: false, minwidth: 130,  sortable: false, menu: false, filterable: false },
                    {
                        text: i18n.t('created_by', { lng: lang }), dataField: 'FullName', editable: false, minwidth: 100, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('createdOn', { lng: lang }), datafield: 'JobCreatedOn', editable: false, minwidth: 160,  cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },

                    { text: i18n.t('results', { lng: lang }), datafield: 'results', editable: false, minwidth: 100,  sortable: false, filterable: false, menu: false, enabletooltips: false, cellsrenderer: resultsRender },
        ];




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
                enabletooltips: true,
                sortable: true,
                rowsheight: 32,
                columnsResize: true,
                columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                ready: function () {
                    callOnGridReady(gID, gridStorage, CallType, '');
                    var columns = genericHideShowColumn(gID, true, ['results']);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    koUtil.gridColumnList.push('LastHeartBeat');
                    visibleColumnsList = koUtil.gridColumnList;
                },
                rendergridrows: function () {
                    return dataAdapter.records;
                },
                autoshowfiltericon: true,
                columns: gridColumns,

            });
        getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'JobDevicesId');
    }


    function getContentJobStatusParameters(isExport, columnSortFilterContentJob, deviceSearchObj, selectedContentJobItems, unselectedContentJobItems, checkAll, visibleColumns) {

        var getDownloadJobSummaryForDeviceProfileReq = new Object();
        var Export = new Object();
        var Pagination = new Object();
        var Selector = new Object();
        var DeviceSearch = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
        Export.VisibleColumns = visibleColumns;
        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedContentJobItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
                Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedContentJobItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.IsExport = true;
                Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
                Export.DynamicColumns = null;
            }
        }

        var ColumnSortFilter = columnSortFilterContentJob;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getDownloadJobSummaryForDeviceProfileReq.DeviceId = koUtil.deviceId;  
        getDownloadJobSummaryForDeviceProfileReq.ColumnSortFilter = ColumnSortFilter;
        getDownloadJobSummaryForDeviceProfileReq.ModelName = koUtil.ModelName;
        getDownloadJobSummaryForDeviceProfileReq.PackageType = ENUM.get("Content");
        getDownloadJobSummaryForDeviceProfileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        getDownloadJobSummaryForDeviceProfileReq.Export = Export;
        getDownloadJobSummaryForDeviceProfileReq.Pagination = Pagination;
        getDownloadJobSummaryForDeviceProfileReq.Selector = Selector;

        var param = new Object();
        param.token = TOKEN();
        param.getDownloadJobSummaryForDeviceProfileReq = getDownloadJobSummaryForDeviceProfileReq;

        return param;

    }

});

// open popup defination
function openIconPopupcontentjobdeviceProfile(row, columnlist) {
    $('#modelProfileContentResults').modal('show');
    $('#profileContentResultsDiv').empty();
    $('#profileContentResultsDiv').html('<div id="jqxGridProfileContentResults"></div><div id="pagerDivProfileContentResults"></div>');
    GetContentResultsdeviceProfile(row);
}

function GetContentResultsdeviceProfile(row) {

    var self = this;

    self.serialNumber = $("#jqxgridContentJobStatusProfile").jqxGrid('getcellvalue', row, 'SerialNumber');
    self.modelName = $("#jqxgridContentJobStatusProfile").jqxGrid('getcellvalue', row, 'ModelName');
    jobDevicesId = $("#jqxgridContentJobStatusProfile").jqxGrid('getcellvalue', row, 'JobDevicesId');
    isCancelRequestFailed = $("#jqxgridContentJobStatusProfile").jqxGrid('getcellvalue', row, 'IsCancelRequestFailed');


    $("#modelName").empty();
    $("#serialNumber").empty();
    $("#modelName").append(self.modelName);
    $("#serialNumber").append(self.serialNumber);

    //grid display    
    var param = getDownloadResultsForContentParams(false, columnSortFilterModelJob, jobDevicesId, []);
    getDownloadResultsForContent('jqxGridProfileContentResults', param);
}

function getDownloadResultsForContentExport(param) {

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

function getDownloadResultsForContent(gID, param) {
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
            { name: 'PackageName', map: 'PackageName' },
            { name: 'Status', map: 'Status' },
            { name: 'StartTime', map: 'StartTime'},
            { name: 'DownloadDuration', map: 'DownloadDuration' },
            { name: 'InstalledDate', map: 'InstalledDate'},
            { name: 'ExpiredDate', map: 'ExpiredDate'},
            { name: 'File', map: 'File' },
            { name: 'FileSize', map: 'FileSize' },
            { name: 'JobDevicesId', map: 'JobDevicesId' },
            { name: 'AdditiionalStatusIfo', map: 'AdditiionalStatusIfo'},
            { name: 'isSelected', type: 'number' }
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
               $('.all-disabled').show();
               var columnSortFilter = new Object();
               columnSortFilter = columnSortFilterFormatedData(columnSortFilterModelJob, gID, gridStorage, 'modelContentJobStatus');
            
               param.getDownloadResultsReq.ColumnSortFilter = columnSortFilter;
               param.getDownloadResultsReq.Pagination = getPaginationObject(param.getDownloadResultsReq.Pagination, gID);
               param.getDownloadResultsReq.JobDevicesId = jobDevicesId;
               data = JSON.stringify(param);
               return data;
           },
           downloadComplete: function (data, status, xhr) {
               
               isPopUpOpen = true;
               if (data.getDownloadResultsResp && data.getDownloadResultsResp.DownloadJobResults) {
                   for (var i = 0; i < data.getDownloadResultsResp.DownloadJobResults.length; i++) {
                       data.getDownloadResultsResp.DownloadJobResults[i].StartTime = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].StartTime);
                       data.getDownloadResultsResp.DownloadJobResults[i].InstalledDate = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].InstalledDate);
                       data.getDownloadResultsResp.DownloadJobResults[i].ExpiredDate = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].ExpiredDate);
                   }
               }

               if (data.getDownloadResultsResp && data.getDownloadResultsResp.DownloadJobResults) {
                   if (data.getDownloadResultsResp.TotalSelectionCount != 'undefined') {
                       gridStorage[0].TotalSelectionCount = data.getDownloadResultsResp.TotalSelectionCount;
                       var updatedGridStorage = JSON.stringify(gridStorage);
                       window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                   }
                   if (data.getDownloadResultsResp.PaginationResponse) {
                       //if (data.getDownloadResultsResp.PaginationResponse.HighLightedItemPage > 0) {
                       //    gridStorage[0].highlightedPage = data.getDownloadResultsResp.PaginationResponse.HighLightedItemPage;
                       //    var updatedGridStorage = JSON.stringify(gridStorage);
                       //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                       //}
                   } else {

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
    //for allcheck
    var rendered = function (element) {
        enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, false, 'pagerDivProfileContentResults', true, 0, 'JobDevicesId', null, null, null);
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
    var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
        genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
    }

    var statusTooltipRenderer = function (row, column, value, defaulthtml, columnproperties) {
        defaultHtml = displayTooltipIconRendererForViewResults(gID, row, column, value, defaulthtml);
        return defaultHtml;
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
            autoshowcolumnsmenubutton: false,
            sortable: true,
            columnsResize: true,
            columnsreorder: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            rendergridrows: function () {
                return dataAdapter.records;
            },
            autoshowfiltericon: true,
            enabletooltips: true,
            ready: function () {                
                var columns = genericHideShowColumn(gID, true, '');
                for (var i = 0; i < columns.length; i++) {
                    visibleColumnsListForPopup.push(columns[i].columnfield);
                }
            },
            columns: [
                 {
                     text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox',
                     datafield: 'isSelected', width: 40, renderer: function () {
                         return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                     }, rendered: rendered, hidden: true,
                 },
                { text: '', datafield: 'JobDevicesId', hidden: true, editable: false, minwidth: 0 },
                {
                    text: i18n.t('content(s)', { lng: lang }), datafield: 'PackageName', filterable: true, editable: false, minwidth: 100, 
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }

                },
                {
                    text: i18n.t('rs_statsus', { lng: lang }), datafield: 'Status', editable: false, minwidth: 130, cellsrenderer: statusTooltipRenderer,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelMultiChoice(filterPanel, datafield, 'Content Job Task Status');
                    }
                },
                {
                    text: i18n.t('download_started_at', { lng: lang }), datafield: 'StartTime', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 160,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelDate(filterPanel, datafield);
                    }

                },
                {
                    text: i18n.t('download_duration', { lng: lang }), datafield: 'DownloadDuration', editable: false, minwidth: 130,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('installed_at', { lng: lang }), datafield: 'InstalledDate', editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 150,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelDate(filterPanel, datafield);
                    }

                },
                {
                    text: i18n.t('expiration_date', { lng: lang }), datafield: 'ExpiredDate', editable: false, minwidth: 130,  cellsformat: LONG_DATETIME_GRID_FORMAT,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelDate(filterPanel, datafield);
                    }

                },
                {
                    text: i18n.t('content_file_name', { lng: lang }), datafield: 'File', editable: false, minwidth: 100,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }

                },
                {
                    text: i18n.t('fileSize_mb', { lng: lang }), datafield: 'FileSize', editable: false, minwidth: 100, 
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }

                },
            ],
        });

    getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
    callGridFilter(gID, gridStorage);
    callGridSort(gID, gridStorage, 'JobDevicesId');
}

function getDownloadResultsForContentParams(isExport, columnSortFilterModelJob, jobDevicesId, visibleColumns) {

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

    getDownloadResultsReq.CallType = ENUM.get("CALLTYPE_NONE");
    getDownloadResultsReq.ColumnSortFilter = ColumnSortFilter;
    getDownloadResultsReq.Export = Export;
    getDownloadResultsReq.JobDevicesId = jobDevicesId;
    getDownloadResultsReq.PackageType = ENUM.get("Content");
    getDownloadResultsReq.Pagination = Pagination;

    var param = new Object();
    param.token = TOKEN();
    param.getDownloadResultsReq = getDownloadResultsReq;

    return param;
}
