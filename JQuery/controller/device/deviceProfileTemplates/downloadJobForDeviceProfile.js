define(["knockout", "autho", "koUtil", "advancedSearchUtil"], function (ko, autho, koUtil, ADSearchUtil) {

    var lang = getSysLang();
    columnSortFilterDownloadJob = new Object();
    columnSortFilterModelJob = new Object();
    jobDevicesId = 0;

    return function DownloadjobViewModel() {    

        var self = this;

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }


        self.serialNumber = ko.observable();
        self.modelName = ko.observable();

        self.templateFlag = ko.observable(false);
        self.AdvanceTemplateFlag = ko.observable(false);

        self.observableCriteria = ko.observable();
        Protocol = koUtil.Protocol;
       

        ADSearchUtil.deviceSearchObj = new Object();// Advance Search

        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];
      //  ADSearchUtil.AdScreenName = 'downloadJob';
        ADSearchUtil.ExportDynamicColumns = [];
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;
        self.observableAdvancedSearchModelPopup = ko.observable();
        

        setMenuSelection();

        self.observableModelComponent = ko.observable();
        self.observableModelpopup = ko.observable();

        self.gridIdForShowHide = ko.observable();
        self.columnlist = ko.observableArray();
        var compulsoryfields = ['SerialNumber', 'IsProcessed'];
        var compulsoryfieldsforpopup = ['PackageName', 'FileSize'];

        var modelName = "unloadTemplate";
        loadelement(modelName, 'genericPopup', 1);
        loadelement(modelName, 'genericPopup', 2);
         modelReposition();
        //open popup
        self.openPopup = function (popupName, gridID) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gridID);
                self.columnlist(''); //<!---advance search changes--->
                if (!isPopUpOpen)
                    self.columnlist(genericHideShowColumn(gridID, true, compulsoryfields));
                else
                    self.columnlist(genericHideShowColumn(gridID, true, compulsoryfieldsforpopup));

                for (var i = 0; i < self.columnlist().length; i++) {
                    if ((koUtil.deviceFamily.toUpperCase() == AppConstants.get('MX_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('VX_FAMILY')) && self.columnlist()[i].columnfield == "Component") {
                        self.columnlist.remove(self.columnlist()[i]);
                        break;
                    }
                }

                if (visibleColumnsList.length == 0) {
                    var columns = self.columnlist();
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                }

                loadelement(popupName, 'genericPopup', 2);
                $('#modelpopup').modal('show');
            } else if (popupName == "modelDownloadJob") {
                loadelement(popupName, 'downloadLibrary', 1);
                $('#jobStautsView').modal('show');
            } else if (popupName == "modelCancelDownloadJob") {
                loadelement(popupName, 'downloadLibrary', 1);
                $('#jobStautsView').modal('show');
            } 

        }

        self.closeOpenModel = function (gridID, modelPopup) {
            gridRefresh(gridID);
            $('#' + modelPopup).modal('hide');
            isPopUpOpen = false;
            autoRefreshDownloadProgressStop();
        }
        
        //unload template
        self.unloadTempPopup = function (popupName, gridID, exportflage) {
            self.observableModelComponent('unloadTemplate');
            self.observableModelpopup('unloadTemplate');
            $("#openModalPopupDownloadContent").css('left', '');
            $("#openModalPopupDownloadContent").css('top', '');
        };

        
        function loadelement(elementname, controllerId, flage) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);

            }
            if (flage == 2) {
                self.observableModelpopup(elementname);
            } else {
                self.observableModelComponent(elementname);
            }
        }


        $('#openModalPopupDownloadheader').mouseup(function () {
            $("#openModalPopupDownloadContent").draggable({ disabled: true });
        });

        $('#openModalPopupDownloadheader').mousedown(function () {
            $("#openModalPopupDownloadContent").draggable({ disabled: false });
        });
       
        // reset filter
        self.clearfilter = function (gridID) {
            CallType = ENUM.get("CALLTYPE_NONE");
            gridFilterClear(gridID);
        }

        // refresh grid
        self.refreshGrid = function (gridID) {
            gridRefresh(gridID);
        }

        //export to excel
        self.exportToExcel = function (isExport, gridID) {

            var selectedDownloadJobItems = getSelectedUniqueId(gridID);
            var unselectedDownloadJobItems = getUnSelectedUniqueId(gridID);
            var checkAll = checkAllSelected(gridID);
            var datainfo = $("#" + gridID).jqxGrid('getdatainformation');

            if (gridID == "jqxgridDownloadJobProfil") {
                var param = getDPDownloadJobStatusParameters(true, columnSortFilterDownloadJob, selectedDownloadJobItems, ADSearchUtil.deviceSearchObj, unselectedDownloadJobItems, checkAll, visibleColumnsList);

                if (datainfo.rowscount > 0) {
                    DPdownloadJobExport(param, gridID, self.openPopup);
                } else {
                    openAlertpopup(1, 'no_data_to_export');
                }
            } else {
                var param = getModelDownloadResultDetialsdeviceprofile(true, columnSortFilterModelJob, jobDevicesId, visibleColumnsListForPopup);
                if (datainfo.rowscount > 0) {
                    modelDownloadJobExportDeviceprofile(param);
                }
                else {
                    openAlertpopup(1, 'no_data_to_export');
                }
            }
        }

        // cancel job status
        self.cancelJobStatus = function (popupName, gridID) {
            var selectedJobID = getMultiSelectedData(gridID);
            if (selectedJobID.length == 1 || selectedJobID.length > 1) {
                self.openPopup(popupName, gridID);
            } else if (selectedJobID.length == 0) {
                openAlertpopup(1, 'please_select_atleast_one_job_for_cancellation');
                return;
            }

        }

        var param = getDPDownloadJobStatusParameters(false, columnSortFilterDownloadJob, null, ADSearchUtil.deviceSearchObj, null, 0);
        getDownloadJobGridDetails('jqxgridDownloadJobProfil', param, self.openPopup, self.columnlist);

        ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridDownloadJobProfil';

        seti18nResourceData(document, resourceStorage);
    }

    function DPdownloadJobExport(param, gridID, openPopup) {

        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(1, 'export_Sucess');
                } 
            }
        }

        var method = 'GetDownloadJobSummaryForDeviceProfile';
        var params = JSON.stringify(param);
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
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

    function getDownloadJobGridDetails(gID, param, openPopup, columnlist) {
        var gridColumns = [];
        var sourceDataFieldsArr = [{ name: 'JobDevicesId', map: 'JobDevicesId' },
                                        { name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
                                        { name: 'SerialNumber', map: 'DeviceDetail>SerialNumber' },
                                        { name: 'DeviceId', map: 'TaskDeviceId' },
                                        { name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath' ,type: 'string'},
                                        { name: 'ModelName', map: 'DeviceDetail>ModelName' },
                                        { name: 'JobName', map: 'JobName' },
                                        { name: 'JobStatus', map: 'JobStatus' },
                                        { name: 'Package', map: 'Package' },
                                        { name: 'Tags', map: 'Tags' },
                                        { name: 'ScheduleDate', map: 'ScheduleDate'},
                                        { name: 'ScheduledInstallDate', map: 'ScheduledInstallDate'},
                                        { name: 'ScheduleInformation', map: 'ScheduleInformation' },
                                        { name: 'FullName', map: 'FullName' },
                                        { name: 'JobCreatedOn', map: 'JobCreatedOn', type: 'date' },
                                        { name: 'DownloadTypes', map: 'DownloadTypes' },
                                        { name: 'ReferenceSetName', map: 'ReferenceSetName' },
                                        { name: 'ReferenceSetHierarchyPath', map: 'ReferenceSetHierarchyPath' },
                                        { name: 'IsProcessed', map: 'IsProcessed' },
                                        { name: 'isSelected', type: 'number' },
                                        { name: 'AdditionalStatusInfo', map: 'AdditionalStatusInfo' },
                                        { name: 'IsJobCancelAllowed', map: 'IsJobCancelAllowed' },
                                        { name: 'IsCancelRequestFailed', map: 'IsCancelRequestFailed' },
                                        { name: 'Component', map: 'Component' }
        ];

        CallType = ENUM.get("NONE");
        var isFilter;
        if (isDownloadJobGridFilter == undefined || isDownloadJobGridFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        isDownloadJobGridFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
     //   CallType = InitGridStoragObj.CallType;

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
                { name: 'Package', map: 'Package' },
                { name: 'Tags', map: 'Tags' },
                { name: 'ScheduleDate', map: 'ScheduleDate'},
                { name: 'ScheduledInstallDate', map: 'ScheduledInstallDate'},
                { name: 'ScheduleInformation', map: 'ScheduleInformation' },
                { name: 'FullName', map: 'FullName' },
                { name: 'JobCreatedOn', map: 'JobCreatedOn', type: 'date' },
                { name: 'DownloadTypes', map: 'DownloadTypes' },
                { name: 'ReferenceSetName', map: 'ReferenceSetName' },
                { name: 'ReferenceSetHierarchyPath', map: 'ReferenceSetHierarchyPath' },
                { name: 'IsProcessed', map: 'IsProcessed' },
                { name: 'isSelected', type: 'number' },
                { name: 'AdditionalStatusInfo', map: 'AdditionalStatusInfo' },
                { name: 'IsJobCancelAllowed', map: 'IsJobCancelAllowed' },
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
       var request=
           {
               formatData: function (data) {
                   $('.all-disabled').show();
                   $("#btnCancelJob").prop('disabled',true);
                   disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                   var columnSortFilter = new Object();
                   columnSortFilter = columnSortFilterFormatedData(columnSortFilterDownloadJob, gID, gridStorage, 'downloadJobsForDeviceProfile', 'JobCreatedOn');
                   param.getDownloadJobSummaryForDeviceProfileReq.ColumnSortFilter = columnSortFilter;
                   param.getDownloadJobSummaryForDeviceProfileReq.Pagination = getPaginationObject(param.getDownloadJobSummaryForDeviceProfileReq.Pagination, gID);
                   data = JSON.stringify(param);
                   return data;
               },
               downloadComplete: function (data, status, xhr) {
                   

                    if (data.getDownloadJobSummaryForDeviceProfileResp && data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs) {
                       $("#btnCancelJob").prop('disabled', false);
                       for (var i = 0; i < data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs.length; i++) {
                           data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs[i].ScheduleDate = convertToDeviceZonetimestamp(data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs[i].ScheduleDate);
                           data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs[i].ScheduledInstallDate = convertToDeviceZonetimestamp(data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs[i].ScheduledInstallDate);
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
                   } else {
                       data.getDownloadJobSummaryForDeviceProfileResp = new Object();
                       data.getDownloadJobSummaryForDeviceProfileResp.DownloadJobs = [];
                       $("#btnCancelJob").prop('disabled', true);
                   }
                   
                   $('.all-disabled').hide();
               }
           }
       var dataAdapter = intializeDataAdapter(source, request);

        // display image when IsNoteExist true
        var resultsRender = function (row, columnfield, value, defaulthtml, columnproperties) {
            if (value == true) {
                return '<div style="padding-left:5x;padding-top:7px;cursor:pointer;"> <a title="Click to view Download Details"  id="imageId" style="text-decoration:underline;" onClick="openIconPopupdownloadjobdeviceprofile(' + row + ')" height="60" width="50" >View Results</a></div>'
            } else if (value == false) {
                return " ";
            }
        }

        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, true, 'pagerDivDownloadJob', true, 1, 'IsJobCancelAllowed', null, null, null, 'Protocol');
            return true;
        }

        //for device profile
        function SerialNoRendereDownloadJobStatus(row, columnfield, value, defaulthtml, columnproperties) {
            var data = $("#" + gID).jqxGrid('getrowdata', row);

            var href = null;
            return '<div style="padding-left:10px;padding-top:9px;"><a href="index.html#deviceProfile/' + data.UniqueDeviceId + '" style="text-decoration:underline;" title="View Profile" >' + value + '</a></div>'
        }


        var cellclass = function (row, columnfield, value) {
            var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'IsJobCancelAllowed');
            return classname;
        }


        //row is enabled when IsJobCancelAllowed true
        var cellbeginedit = function (row, datafield, columntype, value) {
            var check = $("#" + gID).jqxGrid('getcellvalue', row, 'IsJobCancelAllowed');
            if (check == true) {
                return true;
            } else {
                return false;
            }
        }
        //download type renderer
        var downloadtyperenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var html = '<div><span></span></div>';
            if (value == 0) {
                html = '<div style="padding-left:5px;padding-top:5px"><span>All</span></div>';
            }
            else if (value == 1) {
                html = '<div style="padding-left:5px;padding-top:5px"><span>Manual</span></div>';
            }
            else if (value == 2) {
                html = '<div style="padding-left:5px;padding-top:5px"><span>Automatic</span></div>';
            }
            else if (value == 3) {
                html = '<div style="padding-left:5px;padding-top:5px"><span>Device-Initiated</span></div>';
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

        var jobStatusToolTipRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = displayTooltipAndIconRenderer(gID, row, column, value, defaultHtml, 2);
            return defaultHtml;
        }

        gridColumns = [
                    {
                        text: '', menu: false, sortable: false, filterable: false, resizable: false, draggable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclass,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    { text: '', datafield: 'AdditionalStatusInfo', hidden: true, editable: false, minwidth: 0, },
                    {
                        text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 100, enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('component', { lng: lang }), dataField: 'Component', editable: false, minwidth: 100,  enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Component');
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
                        text: i18n.t('job_status', { lng: lang }), dataField: 'JobStatus', editable: false, minwidth: 100,  enabletooltips: false, cellsrenderer: jobStatusToolTipRenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Download\/Content Job Status');
                        }
                    },
                    {
                        text: i18n.t('packages_applications', { lng: lang }), dataField: 'Package', editable: false, minwidth: 100, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('download_scheduled_col', { lng: lang }), datafield: 'ScheduleDate', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 160,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('install_schedule', { lng: lang }), datafield: 'ScheduledInstallDate', enabletooltips: false, cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 160, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    { text: i18n.t('schedule_information', { lng: lang }), datafield: 'ScheduleInformation', editable: false, minwidth: 130, menu: false, sortable: false, filterable: false },
                    {
                        text: i18n.t('created_by', { lng: lang }), datafield: 'FullName', editable: false, minwidth: 100, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('createdOn', { lng: lang }), datafield: 'JobCreatedOn', editable: false, minwidth: 150,  cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('download_types', { lng: lang }), datafield: 'DownloadTypes', editable: false, minwidth: 130,  cellsrenderer: downloadtyperenderer, enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Download Types');
                        }
                    },
                    {
                        text: i18n.t('rs_refrence_set', { lng: lang }), datafield: 'ReferenceSetName', editable: false, minwidth: 130, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('reference_set_hierarchy_path', { lng: lang }), datafield: 'ReferenceSetHierarchyPath', editable: false, minwidth: 150, cellsrenderer: HierarchyPathRenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    { text: i18n.t('results', { lng: lang }), datafield: 'IsProcessed', editable: false, minwidth: 100,  menu: false, sortable: false, enabletooltips: false, filterable: false, cellsrenderer: resultsRender },

                    
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
                ready: function () {
                    callOnGridReady(gID, gridStorage, CallType, '');
                    var columns = genericHideShowColumn(gID, true, ['IsProcessed']);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    koUtil.gridColumnList.push("LastHeartBeat");
                    visibleColumnsList = koUtil.gridColumnList;     
                 
                    if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
                        $("#" + gID).jqxGrid('hidecolumn', 'ScheduledInstallDate');
                        $("#" + gID).jqxGrid('hidecolumn', 'ReferenceSetName');
                        $("#" + gID).jqxGrid('hidecolumn', 'ReferenceSetHierarchyPath');
                        $("#btnCancelJob").prop('disabled', true);
                    }

                    if (koUtil.deviceFamily.toUpperCase() == AppConstants.get('MX_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('VX_FAMILY')) {
                        $("#" + gID).jqxGrid('hidecolumn', 'Component');
                    }
                },
                autoshowfiltericon: true,

                columns: gridColumns
            });

        getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'JobDevicesId');
    }

    function getDPDownloadJobStatusParameters(isExport, columnSortFilterDownloadJob, selectedDownloadJobItems, deviceSearchObj, unselectedDownloadJobItems, checkAll, visibleColumns) {

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
            Selector.UnSelectedItemIds = unselectedDownloadJobItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
                Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
                Export.DynamicColumns = null;
            }
        } else {
            Selector.SelectedItemIds = selectedDownloadJobItems;
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
        Export.ExportReportType = ENUM.get("DownloadStatus");

        var ColumnSortFilter = columnSortFilterDownloadJob;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter); 

        //getDownloadJobSummaryForDeviceProfileReq.DeviceId = null;
        getDownloadJobSummaryForDeviceProfileReq.DeviceId = koUtil.deviceId;
        getDownloadJobSummaryForDeviceProfileReq.ColumnSortFilter = ColumnSortFilter;
        getDownloadJobSummaryForDeviceProfileReq.PackageType = ENUM.get("Software");
        getDownloadJobSummaryForDeviceProfileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        getDownloadJobSummaryForDeviceProfileReq.ModelName = koUtil.ModelName;
        getDownloadJobSummaryForDeviceProfileReq.Export = Export;
        getDownloadJobSummaryForDeviceProfileReq.Pagination = Pagination;
        getDownloadJobSummaryForDeviceProfileReq.Selector = Selector;

        var param = new Object();
        param.token = TOKEN();
        param.getDownloadJobSummaryForDeviceProfileReq = getDownloadJobSummaryForDeviceProfileReq;

        return param;
    }

});

// click on view result open popup for download job status
function openIconPopupdownloadjobdeviceprofile(row) {
    $('#jqxgridDownloadJobProfil').jqxGrid('selectrow', row);
    $('#modelProfileDownloadResults').modal('show');
    $('#profileDownloadResultsDiv').empty();
    $('#profileDownloadResultsDiv').html('<div id="jqxGridProfileDownloadResults"></div><div id="pagerDivProfileDownloadResults"></div>');
    GetDownloadResultsdeviceProfile(row);
}

function GetDownloadResultsdeviceProfile(row) {

    var self = this;
    self.serialNumber = $("#jqxgridDownloadJobProfil").jqxGrid('getcellvalue', row, 'SerialNumber');
    self.modelName = $("#jqxgridDownloadJobProfil").jqxGrid('getcellvalue', row, 'ModelName');
    jobDevicesId = $("#jqxgridDownloadJobProfil").jqxGrid('getcellvalue', row, 'JobDevicesId');

    $("#modelName").empty();
    $("#serialNumber").empty();
    $("#modelName").append(self.modelName);
    $("#serialNumber").append(self.serialNumber);

    //grid display
    var param = getModelDownloadResultDetialsdeviceprofile(false, columnSortFilterModelJob, jobDevicesId);
    getModalJobResultsdwonloadjobdeviceprofile('jqxGridProfileDownloadResults', param);
}

function modelDownloadJobExportDeviceprofile(param) {

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

function getModalJobResultsdwonloadjobdeviceprofile(gID, param) {
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
            { name: 'Description', map: 'Description' },
            { name: 'StartTime', map: 'StartTime'},
            { name: 'DownloadDuration', map: 'DownloadDuration' },
            { name: 'InstalledDate', map: 'InstalledDate'},
            { name: 'File', map: 'File' },
            { name: 'FileSize', map: 'FileSize' },
            { name: 'JobDevicesId', map: 'JobDevicesId' },
            { name: 'AdditiionalStatusIfo', map: 'AdditiionalStatusIfo' },
            { name: 'DownloadAttempts', map: 'DownloadAttempts' },
            { name: 'DownloadProgress', map: 'DownloadProgress' },
            { name: 'TaskId', map: 'TaskId' },
            { name: 'PackageFileType', map: 'PackageFileType' },
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
               disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
               var columnSortFilter = new Object();
               columnSortFilter = columnSortFilterFormatedData(columnSortFilterModelJob, gID, gridStorage, 'modelDownloadJob');
               param.getDownloadResultsReq.ColumnSortFilter = columnSortFilter;
               param.getDownloadResultsReq.Pagination = getPaginationObject(param.getDownloadResultsReq.Pagination, gID);
               param.getDownloadResultsReq.JobDevicesId = jobDevicesId;
               data = JSON.stringify(param);
               return data;
           },
           downloadComplete: function (data, status, xhr) {
               
               isPopUpOpen = true;
               if (data.getDownloadResultsResp && data.getDownloadResultsResp.DownloadJobResults) {
                   if (data.getDownloadResultsResp.DownloadJobResults.length > 0) {
                       var taskIds = new Array();
                       for (var i = 0; i < data.getDownloadResultsResp.DownloadJobResults.length; i++) {
                           data.getDownloadResultsResp.DownloadJobResults[i].StartTime = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].StartTime);
                           data.getDownloadResultsResp.DownloadJobResults[i].InstalledDate = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].InstalledDate);

                           var downloadStatus = data.getDownloadResultsResp.DownloadJobResults[i].Status;
                           var packageFileType = data.getDownloadResultsResp.DownloadJobResults[i].PackageFileType;
                           if (packageFileType == AppConstants.get('OTA') && (downloadStatus != AppConstants.get('InstallSuccessfulCount') && downloadStatus != AppConstants.get('DownloadFailedCount'))) {
                               var taskId = new Object();
                               taskId = data.getDownloadResultsResp.DownloadJobResults[i].TaskId;
                               taskIds.push(taskId);
                           }
                       }
                   }

                   if (taskIds.length > 0) {
                       autoRefreshDownloadProgress(taskIds);
                   } else {
                       autoRefreshDownloadProgressStop();
                   }
               }
               enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
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
       },
        $("#" + gID).bind("bindingcomplete", function (event) {
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
        })
   );


    //for allcheck
    var rendered = function (element) {
        enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, false, 'pagerDivProfileDownloadResults', true, 0, 'JobDevicesId', null, null, null);
        $('.jqx-grid-pager').css("display", "none")
        return true;
    }
    var statusTooltipRenderer = function (row, column, value, defaultHtml) {
        defaultHtml = displayTooltipIconRendererForViewResults(gID, row, column, value, defaultHtml);
        return defaultHtml;
    }

    var downloadProgressRenderer = function (row, column, value, defaultHtml) {
        defaultHtml = downloadProgressRendererForJobs(gID, row, column, value, defaultHtml);
        return defaultHtml;
    }

    var downloadDurationRenderer = function (row, column, value, defaultHtml) {
        defaultHtml = displayTooltipForDownloadDuration(gID, row, column, value, defaultHtml);
        return defaultHtml;
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
            enabletooltips: true,
            rowsheight: 32,
            rendergridrows: function () {
                return dataAdapter.records;
            },
            ready: function () {                
                visibleColumnsListForPopup = new Array();
                var columns = genericHideShowColumn(gID, true, []);

                for (var i = 0; i < columns.length; i++) {
                    visibleColumnsListForPopup.push(columns[i].columnfield);
                }
                if (Protocol == 'Zontalk') {
                    $("#" + gID).jqxGrid('hidecolumn', 'InstalledDate');
                }                
            },
            columns: [
                  {
                      text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox',
                      datafield: 'isSelected', width: 40, renderer: function () {
                          return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                      }, rendered: rendered, hidden: true
                  },
                {
                    text: i18n.t('packages_applications', { lng: lang }), dataField: 'PackageName', editable: false, minwidth: 120,  enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('rs_statsus', { lng: lang }), dataField: 'Status', editable: false, minwidth: 160,  cellsrenderer: statusTooltipRenderer,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelMultiChoice(filterPanel, datafield, 'Software Job Task Status');
                    }
                },
                {
                    text: 'Progress', datafield: 'DownloadProgress', editable: false, sortable: false, filterable: false, menu: false, minwidth: 150, enabletooltips: false, cellsrenderer: downloadProgressRenderer,
                },
                {
                    text: i18n.t('content_description', { lng: lang }), datafield: 'Description', editable: false, minwidth: 120,  menu: false, sortable: false, filterable: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('download_started_at', { lng: lang }), datafield: 'StartTime', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 160, enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelDate(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('download_duration', { lng: lang }), datafield: 'DownloadDuration', editable: false, minwidth: 140, enabletooltips: false, cellsrenderer: downloadDurationRenderer,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('installed_at', { lng: lang }), datafield: 'InstalledDate', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 160,  enabletooltips: false,
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
                    text: i18n.t('fileSize_mb', { lng: lang }), datafield: 'FileSize', editable: false, minwidth: 100, enabletooltips: false,
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

function getModelDownloadResultDetialsdeviceprofile(isExport, columnSortFilterModelJob, jobDevicesId, visibleColumns) {

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
    getDownloadResultsReq.PackageType = ENUM.get("Software");
    getDownloadResultsReq.Pagination = Pagination;

    var param = new Object();
    param.token = TOKEN();
    param.getDownloadResultsReq = getDownloadResultsReq;

    return param;
}

function autoRefreshDownloadProgress(taskIds) {
    window.clearInterval(autoRefreshIntervalId);
    autoRefreshIntervalId = setInterval(function () {
        getJobsDownloadProgress(taskIds);
    }, 10000);
}