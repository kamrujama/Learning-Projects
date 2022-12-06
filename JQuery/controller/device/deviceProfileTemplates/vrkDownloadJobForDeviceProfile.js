define(["knockout", "autho", "advancedSearchUtil", "koUtil", "utility"], function (ko, autho, ADSearchUtil, koUtil) {

    var lang = getSysLang();
    columnSortFilterVRKDownloadJob = new Object();
    columnSortFilterModelJob = new Object();
    jobDevicesId = 0;
    koutilLocal = koUtil;

    return function vrkDownloadjobViewModel() {
       
        var self = this;

        $('#btnCancelDownload').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnCancelDownload').click();
            }
        });

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }
        visibleColumnsListForPopup = new Array();

        self.serialNumber = ko.observable();
        self.modelName = ko.observable();

        self.templateFlag = ko.observable(false);
        self.AdvanceTemplateFlag = ko.observable(false);

        self.observableCriteria = ko.observable();
        loadCriteria('modalCriteria', 'genericPopup');
        ADSearchUtil.deviceSearchObj = new Object();// Advance Search

        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];
        //ADSearchUtil.AdScreenName = 'vrkDownloadJob';
        ADSearchUtil.ExportDynamicColumns = [];
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;
        self.observableAdvancedSearchModelPopup = ko.observable();
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        setMenuSelection();

        ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "HierarchyFullPath", "ModelName", "JobName", "JobStatus", "BundleName", "BundleFile", "VRKPayload", "DownloadSchedule", "ScheduleInformation", "SubmittedOn", "IsProcessed"];

        self.observableModelComponent = ko.observable();
        self.observableModelpopup = ko.observable();

        self.gridIdForShowHide = ko.observable();
        self.columnlist = ko.observableArray();
        var compulsoryfields = ['SerialNumber', 'IsProcessed', 'BundleName', 'BundleFile'];

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
                self.columnlist(genericHideShowColumn(gridID, true, compulsoryfields));

                if (visibleColumnsList.length == 0) {
                    var columns = self.columnlist();
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                }

                //<!---advance search changes--->
                if (gridID == "jqxGridProfileVRKResults") {
                    self.columnlist.remove(self.columnlist()[0]);
                    self.columnlist.remove(self.columnlist()[5]);
                }

                loadelement(popupName, 'genericPopup', 2);
                $('#modelpopup').modal('show');
            } else if (popupName == "modelDownloadJob") {
                loadelement(popupName, 'vrkBundleLibrary', 1);
                $('#jobStautsView').modal('show');
            } else if (popupName == "modelCancelVRKDownloadJob") {
                loadelement(popupName, 'vrkBundleLibrary', 1);
                $('#jobStautsView').modal('show');
            } else if (popupName == 'modelAdvancedSearch') {
                self.AdvanceTemplateFlag(true);
                loadAdvancedSearchModelPopup(popupName, 'genericPopup', 2);
                $('#AdvanceSearchModal').modal('show');
            }

        }

        //unload advance serach popup
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

        //unload template
        self.unloadTempPopup = function (popupName, gridID, exportflage) {
            self.observableModelComponent('unloadTemplate');
        };

        self.expandCriteria = function () {
            if ($("#deviceCriteriaDiv").hasClass('hide')) {
                $("#deviceCriteriaDiv").removeClass('hide');
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default"  role="button" tabindex="0"  title="Collapse"><i class="icon-angle-up"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            } else {
                $("#deviceCriteriaDiv").addClass('hide')
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default"  role="button" tabindex="0"  title="Expand"><i class="icon-angle-down"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            }
        }

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

        function loadAdvancedSearchModelPopup(elementname, controllerId) {// Advance search
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

        function loadCriteria(elementname, controllerId) {// Advance Search
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

        $('#mdlDeviceVrkDownloadLibraryJobHeader').mouseup(function () {
            $("#mdlDeviceVrkDownloadLibraryJob").draggable({ disabled: true });
        });

        $('#mdlDeviceVrkDownloadLibraryJobHeader').mousedown(function () {
            $("#mdlDeviceVrkDownloadLibraryJob").draggable({ disabled: false });
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

        //open popup model
        self.closeOpenModel = function (gridID, modelPopup) {
            gridRefresh(gridID);
            $('#' + modelPopup).modal('hide');
            isPopUpOpen = false;
        }

        //export to excel
        self.exportToExcel = function (isExport, gridID) {

            var selectedDownloadJobItems = getSelectedUniqueId(gridID);
            var unselectedDownloadJobItems = getUnSelectedUniqueId(gridID);
            var checkAll = checkAllSelected(gridID);
            var datainfo = $("#" + gridID).jqxGrid('getdatainformation');
            if (gridID == "jqxGridvrkDownloadJobForDeviceProfile") {
                var param = getVRKDPDownloadJobStatusParameters(true, columnSortFilterVRKDownloadJob, selectedDownloadJobItems, ADSearchUtil.deviceSearchObj, unselectedDownloadJobItems, checkAll, visibleColumnsList);

                if (datainfo.rowscount > 0) {
                    VRKDPdownloadJobExport(param, gridID, self.openPopup);
                } else {
                    openAlertpopup(1, 'no_data_to_export');
                }
            } else {
                var param = getModelVRKDPDownloadResultDetials(true, columnSortFilterModelJob, jobDevicesId, visibleColumnsListForPopup);
                if (datainfo.rowscount > 0) {
                    modelVRKDownloadJobExportDP(param);
                }
                else {
                    openAlertpopup(1, 'no_data_to_export');
                }
            }
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

        var param = getVRKDPDownloadJobStatusParameters(false, columnSortFilterVRKDownloadJob, null, ADSearchUtil.deviceSearchObj, null, 0, []);
        getVRKDownloadJobGridDetails('jqxGridvrkDownloadJobForDeviceProfile', param, self.openPopup, self.columnlist);
        ADSearchUtil.gridIdForAdvanceSearch = 'jqxGridvrkDownloadJobForDeviceProfile';

        seti18nResourceData(document, resourceStorage);
    }

    function VRKDPdownloadJobExport(param, gridID, openPopup) {

        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(1, 'export_Sucess');
                } 
            }
        }

        var method = 'GetVRKJobSummaryForDeviceProfile';
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

    function getVRKDownloadJobGridDetails(gID, param, openPopup, columnlist) {
        var gridColumns = [];
        var sourceDataFieldsArr = [{ name: 'JobDevicesId', map: 'JobDevicesId' },
                { name: 'UniqueDeviceId', map: 'UniqueDeviceId' },
                { name: 'SerialNumber', map: 'SerialNumber' },
                { name: 'DeviceId', map: 'TaskDeviceId' },
                { name: 'HierarchyFullPath', map: 'HierarchyFullPath', type: 'string' },
                { name: 'ModelName', map: 'ModelName' },
                { name: 'JobName', map: 'JobName' },
                { name: 'JobStatus', map: 'JobStatus' },
                { name: 'BundleName', map: 'BundleName' },
                { name: 'BundleFile', map: 'BundleFile' },
                { name: 'VRKPayload', map: 'VRKPayload' },
                { name: 'DownloadSchedule', map: 'DownloadSchedule'},
                { name: 'ScheduleInformation', map: 'ScheduleInformation' },
                { name: 'IsProcessed', map: 'IsProcessed' },
                { name: 'AdditionalInfo', map: 'AdditionalInfo' },
                { name: 'isSelected', type: 'number' },
                { name: 'SubmittedOn', map: 'SubmittedOn', type: 'date' },
                { name: 'IsJobCancelAllowed', map: 'IsJobCancelAllowed' },
                { name: 'Component', map: 'Component' }
        ];

        CallType = ENUM.get("CALLTYPE_WEEK");
        var isFilter;
        if (isVRKDownloadJobGridDetailsFilter == undefined || isVRKDownloadJobGridDetailsFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        isVRKDownloadJobGridDetailsFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var source = {
            dataType: 'json',
            dataFields: [
                { name: 'JobDevicesId', map: 'JobDevicesId' },
                { name: 'UniqueDeviceId', map: 'UniqueDeviceId' },
                { name: 'SerialNumber', map: 'SerialNumber' },
                { name: 'DeviceId', map: 'TaskDeviceId' },
                { name: 'HierarchyFullPath', map: 'HierarchyFullPath', type: 'string' },
                { name: 'ModelName', map: 'ModelName' },
                { name: 'JobName', map: 'JobName' },
                { name: 'JobStatus', map: 'JobStatus' },
                { name: 'BundleName', map: 'BundleName' },
                { name: 'BundleFile', map: 'BundleFile' },
                { name: 'VRKPayload', map: 'VRKPayload' },
                { name: 'DownloadSchedule', map: 'DownloadSchedule' },
                { name: 'ScheduleInformation', map: 'ScheduleInformation' },
                { name: 'IsProcessed', map: 'IsProcessed' },
                { name: 'AdditionalInfo', map: 'AdditionalInfo' },
                { name: 'isSelected', type: 'number' },
                { name: 'SubmittedOn', map: 'SubmittedOn', type: 'date' },
                { name: 'IsJobCancelAllowed', map: 'IsJobCancelAllowed' },
                { name: 'Component', map: 'Component' }
            ],
            root: 'VRKBundleDetails',
            type: 'POST',
            data: param,
            url: AppConstants.get('API_URL') + "/GetVRKJobSummaryForDeviceProfile",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data && data.getVRKJobSummaryForDeviceProfileResp) {
                    data.getVRKJobSummaryForDeviceProfileResp = $.parseJSON(data.getVRKJobSummaryForDeviceProfileResp);
                }
            else
                data.getVRKJobSummaryForDeviceProfileResp=[];

                if (data.getVRKJobSummaryForDeviceProfileResp && data.getVRKJobSummaryForDeviceProfileResp.PaginationResponse) {
                    source.totalrecords = data.getVRKJobSummaryForDeviceProfileResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getVRKJobSummaryForDeviceProfileResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
            },
        }
        var dataAdapter = new $.jqx.dataAdapter(source,
           {
               formatData: function (data) {
                   $('.all-disabled').show();
                   disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                   var columnSortFilter = new Object();
                   columnSortFilter = columnSortFilterFormatedData(columnSortFilterVRKDownloadJob, gID, gridStorage, AppConstants.get('VRKJobSummaryForDeviceProfileGrid'));
                   param.getVRKJobSummaryForDeviceProfileReq.ColumnSortFilter = columnSortFilter;
                   param.getVRKJobSummaryForDeviceProfileReq.Pagination = getPaginationObject(param.getVRKJobSummaryForDeviceProfileReq.Pagination, gID);
                   data = JSON.stringify(param);
                   return data;
               },
               downloadComplete: function (data, status, xhr) {

                   //if (data && data.getVRKJobSummaryForDeviceProfileResp) {
                   //    data.getVRKJobSummaryForDeviceProfileResp = $.parseJSON(data.getVRKJobSummaryForDeviceProfileResp);
                   //}

                   if (data) {
                       if (data.getVRKJobSummaryForDeviceProfileResp && data.getVRKJobSummaryForDeviceProfileResp.VRKBundleDetails) {
                           for (var i = 0; i < data.getVRKJobSummaryForDeviceProfileResp.VRKBundleDetails.length; i++) {
                               data.getVRKJobSummaryForDeviceProfileResp.VRKBundleDetails[i].DownloadSchedule = convertToDeviceZonetimestamp(data.getVRKJobSummaryForDeviceProfileResp.VRKBundleDetails[i].DownloadSchedule);
                               //data.getVRKJobSummaryForDeviceProfileResp.VRKBundleDetails[i].ScheduledInstallDate = convertToDeviceZonetimestamp(data.getVRKJobSummaryForDeviceProfileResp.VRKBundleDetails[i].ScheduledInstallDate);
                               data.getVRKJobSummaryForDeviceProfileResp.VRKBundleDetails[i].SubmittedOn = convertToLocaltimestamp(data.getVRKJobSummaryForDeviceProfileResp.VRKBundleDetails[i].SubmittedOn);
                           }
                       }

                       enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                       if (data.getVRKJobSummaryForDeviceProfileResp && data.getVRKJobSummaryForDeviceProfileResp.VRKBundleDetails) {
                           if (data.getVRKJobSummaryForDeviceProfileResp.TotalSelectionCount != 'undefined') {
                               gridStorage[0].TotalSelectionCount = data.getVRKJobSummaryForDeviceProfileResp.TotalSelectionCount;
                               var updatedGridStorage = JSON.stringify(gridStorage);
                               window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                           }
                           if (data.getVRKJobSummaryForDeviceProfileResp.PaginationResponse) {
                               //if (data.getVRKJobSummaryForDeviceProfileResp.PaginationResponse.HighLightedItemPage > 0) {
                               //    gridStorage[0].highlightedPage = data.getVRKJobSummaryForDeviceProfileResp.PaginationResponse.HighLightedItemPage;
                               //    var updatedGridStorage = JSON.stringify(gridStorage);
                               //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                               //}
                           } else {

                           }
                       } else {
                           data.getVRKJobSummaryForDeviceProfileResp = new Object();
                           data.getVRKJobSummaryForDeviceProfileResp.VRKBundleDetails = [];
                       }
                       $('.all-disabled').hide();
                   }
               },
               loadError: function (jqXHR, status, error) {
                   $('.all-disabled').hide();
               }
           }
       );

        // display image when IsNoteExist true
        var resultsRender = function (row, columnfield, value, defaulthtml, columnproperties) {
            if (value == true) {
                return '<div style="padding-left:5x;padding-top:7px;cursor:pointer;"> <a title="Click to view Download Details"  id="imageId" style="text-decoration:underline;" onClick="openIconPopupdownloadjob(' + row + ')" height="60" width="50" >View Results</a></div>'
            } else if (value == false) {
                return " ";
            }
        }

        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, true, 'pagerDivDownloadJob', true, 1, 'IsJobCancelAllowed', null, null, null);
            return true;
        }

        //for device profile
        function SerialNoRendereDownloadJobStatus(row, columnfield, value, defaulthtml, columnproperties) {
            var data = $("#" + gID).jqxGrid('getrowdata', row);
            var href = null;
            return '<div style="padding-left:10px;padding-top:9px;"><a href="index.html#deviceProfile/' + data.UniqueDeviceId + '" style="text-decoration:underline;" title="View Profile" >' + value + '</a></div>'
        }

        //for Reason for Failure
        function reasonForFailureStatus(row, columnfield, value, defaulthtml, columnproperties) {
            var JobStatus = $("#" + gID).jqxGrid('getcellvalue', row, 'JobStatus');
            var additionalInfo = $("#" + gID).jqxGrid('getcellvalue', row, 'AdditionalInfo');

            if (JobStatus == 'Download Failed' || JobStatus == 'Install Failed' || JobStatus == 'Failed') {
                return '<div style="padding-left:5px;padding-top:5px"><span>' + additionalInfo + '</span></div>';
            } else {
                return " ";
            }
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

        var toolTipRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = displayTooltipAndIconRendererForVRK(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }

        gridColumns = [
                    {
                        text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclass, resizable: false, draggable: false,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    {
                        text: i18n.t('serial', { lng: lang }), dataField: 'SerialNumber', editable: false, minwidth: 130, width: 'auto', enabletooltips: false, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },                    
                    {
                        text: i18n.t('hierarchy_path', { lng: lang }), dataField: 'HierarchyFullPath', editable: false, minwidth: 200, width: 'auto', cellsrenderer: HierarchyPathRenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('model', { lng: lang }), dataField: 'ModelName', editable: false, minwidth: 100, width: 'auto', enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
                        }
                    },
                    {
                        text: i18n.t('job_name', { lng: lang }), dataField: 'JobName', editable: false, minwidth: 150, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('job_status', { lng: lang }), dataField: 'JobStatus', editable: false, minwidth: 150, width: 'auto', enabletooltips: false, cellsrenderer: toolTipRenderer,//toolTipRenderer
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'VRK Job Status');
                        }
                    },
                    {
                        text: i18n.t('vrkBundle_Name', { lng: lang }), dataField: 'BundleName', editable: false, minwidth: 150, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('vrkBundle_Bundle_File', { lng: lang }), dataField: 'BundleFile', editable: false, minwidth: 100, width: 'auto', filterable: true,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('vrkBundle_vrkPayload', { lng: lang }), dataField: 'VRKPayload', editable: false, minwidth: 100, width: 'auto', filterable: true,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('download_scheduled_col', { lng: lang }), dataField: 'DownloadSchedule', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 180, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    { text: i18n.t('schedule_information', { lng: lang }), datafield: 'ScheduleInformation', editable: false, minwidth: 170, width: 'auto', menu: false, sortable: false, filterable: false },
                    {
                        text: i18n.t('vrkReasonForFailure', { lng: lang }), dataField: 'AdditionalInfo', editable: false, minwidth: 130, width: 'auto', 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('vrkBundle_SubmittedOn', { lng: lang }), datafield: 'SubmittedOn', editable: false, minwidth: 180, width: 'auto', cellsformat: LONG_DATETIME_GRID_FORMAT,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    { text: i18n.t('results', { lng: lang }), datafield: 'IsProcessed', editable: false, minwidth: 100, width: 'auto', menu: false, sortable: false, enabletooltips: false, resizable: false, filterable: false, cellsrenderer: resultsRender },
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
                autoshowfiltericon: true,
                columns: gridColumns,

                ready: function () {
                    callOnGridReady(gID, gridStorage, CallType, '');
                    var columns = genericHideShowColumn(gID, true, ['IsProcessed']);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    koUtil.gridColumnList.push('LastHeartBeat');
                    visibleColumnsList = koUtil.gridColumnList;
                },
            });

        getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'JobDevicesId');       
    }

    function getVRKDPDownloadJobStatusParameters(isExport, columnSortFilterVRKDownloadJob, selectedDownloadJobItems, deviceSearchObj, unselectedDownloadJobItems, checkAll, visibleColumns) {

        var getVRKJobSummaryForDeviceProfileReq = new Object();
        var Export = new Object();
        var Pagination = new Object();
        var Selector = new Object();
        var DeviceSearch = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

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
            }
        }
        Export.VisibleColumns = visibleColumns;

        var ColumnSortFilter = columnSortFilterVRKDownloadJob;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.GridId = AppConstants.get('VRKJobSummaryForDeviceProfileGrid');
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getVRKJobSummaryForDeviceProfileReq.ColumnSortFilter = ColumnSortFilter;
        getVRKJobSummaryForDeviceProfileReq.ModelName = koUtil.ModelName;
        getVRKJobSummaryForDeviceProfileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        getVRKJobSummaryForDeviceProfileReq.Export = Export;
        getVRKJobSummaryForDeviceProfileReq.Pagination = Pagination;
        getVRKJobSummaryForDeviceProfileReq.Selector = Selector;

        var param = new Object();
        param.token = TOKEN();
        param.getVRKJobSummaryForDeviceProfileReq = getVRKJobSummaryForDeviceProfileReq;

        return param;
    }

});

// click on view result open popup for download job status
function openIconPopupdownloadjob(row) {

    $('#modelProfileVRKResults').modal('show');
    $('#profileVRKResultsDiv').empty();
    $('#profileVRKResultsDiv').html('<div id="jqxGridProfileVRKResults"></div><div id="pagerDivProfileVRKResults"></div>');

    
    GetDownloadResults(row);
}
function GetDownloadResults(row) {

    var self = this;
    self.serialNumber = $("#jqxGridvrkDownloadJobForDeviceProfile").jqxGrid('getcellvalue', row, 'SerialNumber');
    self.modelName = $("#jqxGridvrkDownloadJobForDeviceProfile").jqxGrid('getcellvalue', row, 'ModelName');
    jobDevicesId = $("#jqxGridvrkDownloadJobForDeviceProfile").jqxGrid('getcellvalue', row, 'JobDevicesId');

    $("#modelName").empty();
    $("#serialNumber").empty();
    $("#modelName").append(self.modelName);
    $("#serialNumber").append(self.serialNumber);

    //grid display
        
    var param = getModelVRKDPDownloadResultDetials(false, columnSortFilterModelJob, jobDevicesId, visibleColumnsListForPopup);
    getModalJobResults('jqxGridProfileVRKResults', param);
}

function modelVRKDownloadJobExportDP(param) {

    var callbackFunction = function (data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                openAlertpopup(1, 'export_Sucess');
            } 
        }
    }

    var method = 'GetVRKDownloadResults';
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
            { name: 'StartTime', map: 'StartTime' },
            { name: 'DownloadDuration', map: 'DownloadDuration' },
            { name: 'InstalledDate', map: 'InstalledDate' },
            { name: 'File', map: 'File' },
            { name: 'FileSize', map: 'FileSize' },
            { name: 'JobDevicesId', map: 'JobDevicesId' },
            { name: 'isSelected', type: 'number' },
            { name: 'AdditiionalStatusIfo', map: 'AdditiionalStatusIfo' },
        ],
        root: 'DownloadJobResults',
        type: 'POST',
        data: param,
        url: AppConstants.get('API_URL') + "/GetVRKDownloadResults",
        contentType: 'application/json',
        beforeprocessing: function (data) {
            if (data && data.getVRKDownloadResultsResp) {
                data.getVRKDownloadResultsResp = $.parseJSON(data.getVRKDownloadResultsResp);
            }
        else
            data.getVRKDownloadResultsResp=[];
            if (data.getVRKDownloadResultsResp) {
                if (data.getVRKDownloadResultsResp.PaginationResponse) {
                    source.totalrecords = data.getVRKDownloadResultsResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getVRKDownloadResultsResp.PaginationResponse.TotalPages;
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
               disableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
               var columnSortFilter = new Object();
               columnSortFilter = columnSortFilterFormatedData(columnSortFilterModelJob, gID, gridStorage, 'VRKDownloadResultsHeaders');
               param.getVRKDownloadResultsReq.ColumnSortFilter = columnSortFilter;
               param.getVRKDownloadResultsReq.Pagination = getPaginationObject(param.getVRKDownloadResultsReq.Pagination, gID);
               param.getVRKDownloadResultsReq.JobDevicesId = jobDevicesId;
               data = JSON.stringify(param);
               return data;
           },
           downloadComplete: function (data, status, xhr) {

               isPopUpOpen = true;
               if (data) {
                   if (data.getVRKDownloadResultsResp && data.getVRKDownloadResultsResp.DownloadJobResults) {
                       for (var i = 0; i < data.getVRKDownloadResultsResp.DownloadJobResults.length; i++) {
                           data.getVRKDownloadResultsResp.DownloadJobResults[i].StartTime = convertToDeviceZonetimestamp(data.getVRKDownloadResultsResp.DownloadJobResults[i].StartTime);
                           data.getVRKDownloadResultsResp.DownloadJobResults[i].InstalledDate = convertToDeviceZonetimestamp(data.getVRKDownloadResultsResp.DownloadJobResults[i].InstalledDate);
                       }
                   }
                   enableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
                   if (data.getVRKDownloadResultsResp && data.getVRKDownloadResultsResp.DownloadJobResults) {
                       if (data.getVRKDownloadResultsResp.TotalSelectionCount != 'undefined') {
                           gridStorage[0].TotalSelectionCount = data.getVRKDownloadResultsResp.TotalSelectionCount;
                           var updatedGridStorage = JSON.stringify(gridStorage);
                           window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                       }
                       if (data.getVRKDownloadResultsResp.PaginationResponse) {
                           //if (data.getVRKDownloadResultsResp.PaginationResponse.HighLightedItemPage > 0) {
                           //    gridStorage[0].highlightedPage = data.getVRKDownloadResultsResp.PaginationResponse.HighLightedItemPage;
                           //    var updatedGridStorage = JSON.stringify(gridStorage);
                           //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                           //}
                       } else {

                       }
                   } else {
                       data.getVRKDownloadResultsResp = new Object();
                       data.getVRKDownloadResultsResp.DownloadJobResults = [];
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
        enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, false, 'pagerDivProfileVRKResults', true, 0, 'JobDevicesId', null, null, null);
        $('.jqx-grid-pager').css("display", "none")
        return true;
    }

    var statusTooltipRenderer = function (row, column, value, defaultHtml) {
        defaultHtml = displayTooltipAndIconRendererForVRK(gID, row, column, value, defaultHtml);
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
            height: gridHeightFunction(gID, "50"),
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
                callOnGridReady(gID, gridStorage);
                koutilLocal.gridColumnList = new Array();
                var columns = genericHideShowColumn(gID, true, []);
                for (var i = 0; i < columns.length; i++) {
                    koutilLocal.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsListForPopup = koutilLocal.gridColumnList;
            },
            columns: [
                  {
                      text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', resizable: false, draggable: false,
                      datafield: 'isSelected', width: 40, renderer: function () {
                          return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                      }, rendered: rendered, hidden: true
                  },
                {
                    text: i18n.t('vrk_payload', { lng: lang }), dataField: 'PackageName', editable: false, minwidth: 180, width: 'auto', enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('Download_Status_lbl', { lng: lang }), dataField: 'Status', enabletooltips: false, editable: false, minwidth: 150, width: 'auto', cellsrenderer: statusTooltipRenderer,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelMultiChoice(filterPanel, datafield, 'Software Job Task Status');
                    }
                },
                {
                    text: i18n.t('download_failed_reason', { lng: lang }), dataField: 'Description', editable: false, minwidth: 150, width: 'auto', menu: false, sortable: false, filterable: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('download_started_at', { lng: lang }), dataField: 'StartTime', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 180, width: 'auto', enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelDate(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('download_duration', { lng: lang }), dataField: 'DownloadDuration', editable: false, minwidth: 180, width: 'auto', enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('installed_at', { lng: lang }), dataField: 'InstalledDate', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 180, width: 'auto', enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelDate(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('fileSize_mb', { lng: lang }), dataField: 'FileSize', editable: false, minwidth: 140, width: 'auto', enabletooltips: false,
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

function getModelVRKDPDownloadResultDetials(isExport, columnSortFilterModelJob, jobDevicesId, visibleColumns) {

    var getVRKDownloadResultsReq = new Object();
    var Export = new Object();
    var Pagination = new Object();

    Pagination.HighLightedItemId = null
    Pagination.PageNumber = 1;
    Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
    Export.VisibleColumns = visibleColumns;
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

    //getVRKDownloadResultsReq.CallType = ENUM.get("CALLTYPE_WEEK");
    getVRKDownloadResultsReq.ColumnSortFilter = ColumnSortFilter;
    getVRKDownloadResultsReq.Export = Export;
    getVRKDownloadResultsReq.JobDevicesId = jobDevicesId;
    //getVRKDownloadResultsReq.PackageType = ENUM.get("Software");
    getVRKDownloadResultsReq.Pagination = Pagination;

    var param = new Object();
    param.token = TOKEN();
    param.getVRKDownloadResultsReq = getVRKDownloadResultsReq;

    return param;
}