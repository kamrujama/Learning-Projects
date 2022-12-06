define(["knockout", "advancedSearchUtil", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, ADSearchUtil, koUtil, autho) {
    SelectedIdOnGlobale = new Array
    columnSortFilterForContent = new Object();
    var lang = getSysLang();
    return function detailContentStatusViewModel() {

        //Localization
        ko.validation.init({
            decorateElement: true,
            errorElementClass: 'err',
            insertMessages: false
        });

   

        SelectedIdOnGlobale = new Array();
        checkALlPageId = 0;
        pagechangedcheck = 0;
        totalselectedRowCount = 0;

        var self = this;
        self.checksample = ko.observable();
        self.observableModelPopup = ko.observable();
        self.packageName = ko.observableArray();

        //For advanced serch functionality
        self.AdvanceTemplateFlag = ko.observable(false);
        self.observableCriteria = ko.observable();
        loadCriteria('modalCriteria', 'genericPopup');
        self.observableAdvancedSearchModelPopup = ko.observable();
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
        ADSearchUtil.deviceSearchObj = new Object()
        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];
        //  ADSearchUtil.AdScreenName = 'contentDetailedStatus';
        ADSearchUtil.ExportDynamicColumns = [];

        setMenuSelection();

        //For advanced search
        ADSearchUtil.gridIdForAdvanceSearch = 'detailContentGridProfile';
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;

        ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "HierarchyFullPath", "ModelName", "JobName", "JobStatus", "PackageName", "PackageVersion", "Description", "ComputedDeviceStatus", "Status", "ScheduledDownloadDate", "StartDate", "DownloadDuration", "ActualInstalledDate", "ExpirationDateInDevice", "FileName", "FileSize", "FullName", "CreatedOn", "ActionTasksAdditionalInfo", "LastHeartBeat", "TaskSentDate"];


        //For Clear Filter
        self.clearfilter = function (gId) {
            CallType = ENUM.get("CALLTYPE_NONE");
            gridFilterClear(gId);

        }
        // For Refresh Grid
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }
        //Function For Get selected
        function getSelectedIds() {
            return SelectedIdOnGlobale;

        }
        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            //  reschuleBtnFlag = retval;
            return retval;
        }

        //For Load element
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
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
        ///////////////////////
        //focus on first textbox
        $('#contentConfId').on('shown.bs.modal', function () {
            $('#scheduleContConfoNo').focus();
        })
        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#contentConfId').on('shown.bs.modal', function (e) {
            $('#scheduleContConfoNo').focus();

        });
        $('#contentConfId').keydown(function (e) {
            if ($('#scheduleContConfoNo').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#scheduleContConfoYes').focus();
            }
        });
        $('#scheduleContnetId').on('shown.bs.modal', function (e) {
            $('#scheduleContnetId_No').focus();

        });
        $('#scheduleContnetId').keydown(function (e) {
            if ($('#scheduleContnetId_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#scheduleContnetId_Yes').focus();
            }
        });
        $('#modalScheduleID').on('shown.bs.modal', function (e) {
            $('#modalScheduleID_No').focus();

        });
        $('#modalScheduleID').keydown(function (e) {
            if ($('#modalScheduleID_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#modalScheduleID_Yes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------




        //PopUp Functions

        self.alertModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        self.columnlist = ko.observableArray();
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['SerialNumber', "PackageName", "ScheduledDownloadDate"];
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');
        // Unload Template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.alertModelPopup(popupName);
            self.observableModelPopup(popupName);

            if (gId != null) {
                if (exportflage != null && exportflage != false) {
                    gridFilterClear(gId);
                }
            }
        };
        modelReposition();
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist(''); //<!---advance search changes--->
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));

                if (visibleColumnsList.length == 0) {
                    var columns = self.columnlist();
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                }

                loadelement(popupName, 'genericPopup');
                $('#contentModel').modal('show');
            } else if (popupName == "modelExportSucess") {
                loadelement(popupName, 'genericPopup');
                $('#contentModel').modal('show');
            } else if (popupName == 'modelAdvancedSearch') {
                self.AdvanceTemplateFlag(true);
                loadAdvancedSearchModelPopup(popupName, 'genericPopup');
                $('#AdvanceSearchModal').modal('show');
            }
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

        //ExportToExcel 
        self.exportToExcel = function (isExport, gId) {
            var selectedDetailedContentItems = getSelectedUniqueId(gId);
            var unselectedDetailedContentItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = detailedContentStatusParameter(true, columnSortFilterForContent, ADSearchUtil.deviceSearchObj, selectedDetailedContentItems, unselectedDetailedContentItems, checkAll, visibleColumnsList);
            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflage = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                detailedContentExport(param, gId, self.openPopup);
            } else {

                openAlertpopup(1, 'no_data_to_export');
            }
        }
        //ExportToExcel Goes To this Function
        function detailedContentExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }

            var params = JSON.stringify(param);;
            ajaxJsonCall('GetDownloadResultsDetailsForDeviceProfile', params, callBackfunction, true, 'POST', true);
        }

        //Reschedule declare
        self.contentDetailReschedule = function (gId) {
            var selectedIds = getSelectedUniqueId(gId);
            if ((selectedIds.length == 1) || (selectedIds.length > 1)) {
                $("#contentConfId").modal('show');
                $("#draggConfID").draggable();
            } else {
                openAlertpopup(1, 'there_are_no_downloads_selected_to_reschedule');
                $("#draggInfoID").draggable();
            }
        }

        // reschedule content
        self.rescheduleContent = function (gId) {
            var selectedMultiDataItems = getMultiSelectedData(gId);
            var unselectedItemIds = getUnSelectedUniqueId(gId);
            var checkALL = checkAllSelected(gId);
            var schedule = 0;
            var isContinue = false;
            for (var i = 0; i < selectedMultiDataItems.length; i++) {
                var selectedJobStatus = selectedMultiDataItems[i].JobStatus;
                var selectedIsAutoDownloadJob = selectedMultiDataItems[i].IsAutoDownloadJob;
                var selectedIsRescheduled = selectedMultiDataItems[i].IsRescheduled;
                var protocol = String(selectedMultiDataItems[i].Protocol).toUpperCase();
                if (selectedJobStatus == "Failed" && selectedIsAutoDownloadJob == false && selectedIsRescheduled == false && protocol == AppConstants.get('VEM_PROTOCOL')) {
                    schedule = 1;
                }
            }
            if (schedule == 1) {
                detailedContentParameterReschedule(selectedMultiDataItems, unselectedItemIds, checkALL, gId, isContinue, self.packageName);
            }
        }

        //reschedule when package not found
        self.reschedulePackage = function (gId, isContinue) {
            var selectedMultiDataItems = getMultiSelectedData(gId);
            var unselectedItemIds = getUnSelectedUniqueId(gId);
            var checkALL = checkAllSelected(gId);
            var schedule = 0;
            for (var i = 0; i < selectedMultiDataItems.length; i++) {
                var selectedJobStatus = selectedMultiDataItems[i].JobStatus;
                var selectedIsAutoDownloadJob = selectedMultiDataItems[i].IsAutoDownloadJob;
                var selectedIsRescheduled = selectedMultiDataItems[i].IsRescheduled;
                var protocol = String(selectedMultiDataItems[i].Protocol).toUpperCase();
                if (selectedJobStatus == "Failed" && selectedIsAutoDownloadJob == false && selectedIsRescheduled == false && protocol == AppConstants.get('VEM_PROTOCOL')) {
                    schedule = 1;

                }
            }
            if (schedule == 1) {
                detailedContentParameterReschedule(selectedMultiDataItems, unselectedItemIds, checkALL, gId, isContinue, self.packageName);
            }
        }

        //Grid Call
        var param = detailedContentStatusParameter(false, columnSortFilterForContent, ADSearchUtil.deviceSearchObj, null, null, 0, []);
        detailedContentStatusGrid('detailContentGridProfile', param);

        seti18nResourceData(document, resourceStorage);
    }// ModelView End

    function detailedContentParameterReschedule(selectedMultiDataItems, unselectedItemIds, checkALL, gId, isContinue, packageName) {
        createRescheduleJobReq = new Object();
        var UnselectedItemIds = new Array();
        var Selector = new Object();
        var schedule = new Array();

        for (var i = 0; i < selectedMultiDataItems.length; i++) {
            var eDownloadJob = new Object();
            if (checkALL == 1) {
                UnselectedItemIds = unselectedItemIds;
                eDownloadJob = null;
            } else {
                UnselectedItemIds = null;
                eDownloadJob = selectedMultiDataItems[i].TaskId;
            }
            schedule.push(eDownloadJob);
        }

        createRescheduleJobReq.CallType = ENUM.get("CALLTYPE_NONE");
        createRescheduleJobReq.DeviceSearch = null;
        createRescheduleJobReq.IsContinue = isContinue;
        createRescheduleJobReq.PackageType = ENUM.get("Content");
        createRescheduleJobReq.TaskDetails = schedule;
        createRescheduleJobReq.UnselectedItemIds = UnselectedItemIds;
        createRescheduleJobReq.DeviceId = null;
        createRescheduleJobReq.ModelName = null;
        createRescheduleJobReq.UniqueDeviceId = 0;

        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'content_downloads_successfully_rescheduled');
                    gridRefresh('detailContentGridProfile');
                } else if (data.responseStatus.StatusCode == AppConstants.get('Package_Not_Found')) {
                    openAlertpopup(2, data.responseStatus.StatusMessage);
                } else if (data.responseStatus.StatusCode == AppConstants.get('RESCHEDULE_PACKAGE_STATUS_CODE') && (data.createRescheduleJobResp.PackageNames == null)) {
                    openAlertpopup(2, 'unable_to_reschedule_as_packages_associated_with_the_selected_job_are_removed_from_content_library');
                } else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Exists')) {
                    openAlertpopup(2, 'No_Eligible_Device_Exists_Include_Inactive_Devices');
                } else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Excluding_Inactive_Devices')) {
                    openAlertpopup(2, 'No_Eligible_Device_Exists_Exclude_Inactive_Devices');
                } else if (data.responseStatus.StatusCode == AppConstants.get('RESCHEDULE_PACKAGE_STATUS_CODE')) {
                    packageName(data.createRescheduleJobResp.PackageNames);
                    $("#modalScheduleID").modal('show');
                    $("#draggScheduleID").draggable();
                }
            }
        }

        var method = 'CreateRescheduleJob';
        var params = '{"token":"' + TOKEN() + '" ,"createRescheduleJobReq":' + JSON.stringify(createRescheduleJobReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

    }

    // Calling Jqxgrid


    function detailedContentStatusGrid(gID, param) {
        //For Advanced search
        var gridColumns = [];
        var isFilter;
        if (isdetailedContentStatusGridFilter == undefined || isdetailedContentStatusGridFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        isdetailedContentStatusGridFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
       // CallType = InitGridStoragObj.CallType;

        var source =
        {
            dataType: "json",
            dataFields: [
                     { name: 'isSelected', type: 'number' },
                     { name: 'SerialNumber', map: 'DeviceDetail>SerialNumber' },
                     { name: 'TaskId', map: 'TaskId' },
                     { name: 'DeviceId', map: 'TaskDeviceId' },
                     { name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath' ,type: 'string'},
                     { name: 'ModelName', map: 'DeviceDetail>ModelName' },
                     { name: 'JobName', map: 'JobName' },
                     { name: 'JobStatus', map: 'JobStatus' },
                     { name: 'PackageName', map: 'PackageName' },
                     { name: 'PackageVersion', map: 'PackageVersion' },
                     { name: 'Description', map: 'Description' },
                     { name: 'ComputedDeviceStatus', map: 'DeviceDetail>ComputedDeviceStatus' },
                     { name: 'Status', map: 'Status' },
                     { name: 'ScheduledDownloadDate', map: 'ScheduledDownloadDate' },
                     { name: 'StartDate', map: 'StartDate', type: 'date' },
                     { name: 'DownloadDuration', map: 'DownloadDuration' },
                     { name: 'ScheduledInstallDate', map: 'ScheduledInstallDate' },
                     { name: 'ScheduledReplaceDate', map: 'ScheduledReplaceDate' },
                     { name: 'FileName', map: 'FileName' },
                     { name: 'FileSize', map: 'FileSize' },
                     { name: 'FullName', map: 'FullName' },
                     { name: 'TaskCreatedDate', map: 'TaskCreatedDate', type: 'date' },
                     { name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
                     { name: 'ActionTasksAdditionalInfo', map: 'ActionTasksAdditionalInfo' },
                     { name: 'LastHeartBeat', map: 'DeviceDetail>LastHeartBeat' },
                     { name: 'TaskSentDate', map: 'TaskSentDate' },
                     { name: 'IsAutoDownloadJob', map: 'IsAutoDownloadJob' },
                     { name: 'DownloadFailedReason', map: 'DownloadFailedReason' },
                     { name: 'JobDownloadFailedReason', map: 'JobDownloadFailedReason' },
                     { name: 'StatusAdditionalInfo', map: 'StatusAdditionalInfo' },
                     { name: 'IsRescheduled', map: 'IsRescheduled' },
                     { name: 'Protocol', map: 'Protocol' },
                     { name: 'Component', map: 'Component' }
            ],
            root: 'DownloadResultsDetails',
            type: "POST",
            data: param,

            url: AppConstants.get('API_URL') + "/GetDownloadResultsDetailsForDeviceProfile",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getDownloadResultsDetailsForDeviceProfileResp) {
                    data.getDownloadResultsDetailsForDeviceProfileResp = $.parseJSON(data.getDownloadResultsDetailsForDeviceProfileResp);
                    if (data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse) {
                        source.totalrecords = data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse.TotalPages;
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                    }
                }
                else
                    data.getDownloadResultsDetailsForDeviceProfileResp = [];
            },
        }


        var request = {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh', 'btnReschedule']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForContent, gID, gridStorage, 'ContentDetailsForDeviceProfile', 'TaskCreatedDate');
                    param.getDownloadResultsDetailsForDeviceProfileReq.ColumnSortFilter = columnSortFilter;
                    param.getDownloadResultsDetailsForDeviceProfileReq.Pagination = getPaginationObject(param.getDownloadResultsDetailsForDeviceProfileReq.Pagination, gID);
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    if (data) {
                        
                        if (data.getDownloadResultsDetailsForDeviceProfileResp && data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails) {
                            for (var i = 0; i < data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails.length; i++) {
                                data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].ScheduledDownloadDate = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].ScheduledDownloadDate);
                                data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].ScheduledInstallDate = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].ScheduledInstallDate);
                                data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].StartDate = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].StartDate);
                                data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].ScheduledReplaceDate = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].ScheduledReplaceDate);
                                data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].TaskSentDate = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].TaskSentDate);
                                data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].DeviceDetail.LastHeartBeat = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].DeviceDetail.LastHeartBeat);
                                data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].TaskCreatedDate = convertToLocaltimestamp(data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].TaskCreatedDate);
                            }
                        }
                    }
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh', 'btnReschedule']);
                    if (data.getDownloadResultsDetailsForDeviceProfileResp && data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails) {
                        $("#btnReschedule").prop("disabled", false);
                        if (data.getDownloadResultsDetailsForDeviceProfileResp.TotalSelectionCount != 'undefined') {
                            gridStorage[0].TotalSelectionCount = data.getDownloadResultsDetailsForDeviceProfileResp.TotalSelectionCount;
                            var updatedGridStorage = JSON.stringify(gridStorage);
                            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        }
                        if (data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse) {
                            //if (data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse.HighLightedItemPage > 0) {
                            //    gridStorage[0].highlightedPage = data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse.HighLightedItemPage;
                            //    var updatedGridStorage = JSON.stringify(gridStorage);
                            //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            //}
                        } else {

                        }
                    } else {
                        $("#btnReschedule").prop("disabled", true);
                        data.getDownloadResultsDetailsForDeviceProfileResp = new Object();
                        data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails = [];
                    }
                    $('.all-disabled').hide();
                }
                
            }
        var dataAdapter = intializeDataAdapter(source, request);


        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'TaskId', element, gridStorage, true, 'pagerDivContentDetailStatus', true, 2, 'JobStatus', 'JobStatus', 'IsAutoDownloadJob', 'IsRescheduled', 'Protocol');
            return true;
        }


        //for device profile
        function SerialNoRendereDetailContent(row, columnfield, value, defaulthtml, columnproperties) {
            var data = $("#" + gID).jqxGrid('getrowdata', row);

            var href = null;
            return '<div style="padding-left:10px;padding-top:9px;"><a href="index.html#deviceProfile/' + data.UniqueDeviceId + '" style="text-decoration:underline;" title="View Profile" >' + value + '</a></div>'
        }

        var celldisablesrenderer = function (row, column, value, defaultHtml) {

            defaultHtml = genericCellDisablesrendererForDetails(row, column, value, defaultHtml, gID, 'JobStatus', 'IsAutoDownloadJob', 'IsRescheduled', 'Protocol');

            return defaultHtml;
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
            defaultHtml = displayTooltipAndIconRenderer(gID, row, column, value, defaultHtml, 1);
            return defaultHtml;
        }

        var cellbeginedit = function (row, datafield, columntype, value) {

            var datafield1 = $("#" + gID).jqxGrid('getcellvalue', row, 'JobStatus');
            var datafield2 = $("#" + gID).jqxGrid('getcellvalue', row, 'IsAutoDownloadJob');
            var datafield3 = $("#" + gID).jqxGrid('getcellvalue', row, 'IsRescheduled');
            var datafield4 = $("#" + gID).jqxGrid('getcellvalue', row, 'Protocol');

            if (datafield1 == 'Failed' && datafield2 == false && datafield3 == false && datafield4 == AppConstants.get('VEM_PROTOCOL')) {
                return true;
            } else {
                return false;
            }

        }

        var cellclass = function (row, columnfield, value) {
            var classname = genericCellClassDisablesrendererForDetails(row, columnfield, gID, 'JobStatus', 'IsAutoDownloadJob', 'IsRescheduled', 'Protocol');
            return classname;
        }

        var deviceStatusToolTipRenderer = function (row, column, value, defaultHtml) {
              defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml)
            return defaultHtml;
        }

        var downStatusToolTipRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = dispalyTooltipIcon_DownloadStatus(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }

        gridColumns = [
                   {
                       text: '', menu: false, sortable: false, filterable: false, resizable: false, draggable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclass,
                       datafield: 'isSelected', width: 40, renderer: function () {
                           return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                       }, rendered: rendered
                   },
                   { text: '', datafield: 'JobDownloadFailedReason', hidden: true, editable: false, minwidth: 200, width: 'auto' },
                   { text: '', dataField: 'IsAutoDownloadJob', hidden: true, editable: false, minwidth: 200, width: 'auto', },
                   { text: '', dataField: 'IsRescheduled', hidden: true, editable: false, width: 150, },
                   { text: '', dataField: 'Protocol', hidden: true, editable: false, width: 100, },

                   {
                       text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', enabletooltips: false, editable: false, minwidth: 130, width: 'auto',
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },                   
                   {
                       text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 180, width: 'auto', filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },

                   {
                       text: i18n.t('job_name', { lng: lang }), datafield: 'JobName', editable: false, minwidth: 120, width: 'auto', filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('job_status', { lng: lang }), datafield: 'JobStatus', editable: false, minwidth: 120, width: 'auto', cellsrenderer: jobStatusToolTipRenderer,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelMultiChoice(filterPanel, datafield, 'Download\/Content Job Status');
                       }
                   },
                   {
                       text: i18n.t('content_name', { lng: lang }), datafield: 'PackageName', editable: false, minwidth: 150, width: 'auto',
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('content_version', { lng: lang }), datafield: 'PackageVersion', editable: false, minwidth: 160, width: 'auto', filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },

                   {
                       text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 150, width: 'auto', cellsrenderer: deviceStatusToolTipRenderer,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
                       }
                   },
                   {
                       text: i18n.t('Download_Status_lbl', { lng: lang }), datafield: 'Status', editable: false, minwidth: 180, width: 'auto', cellsrenderer: downStatusToolTipRenderer,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelMultiChoice(filterPanel, datafield, 'Content Job Task Status');
                       }
                   },
                   {
                       text: i18n.t('download_scheduled_col', { lng: lang }), editable: false, datafield: 'ScheduledDownloadDate', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 190, width: 'auto',
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('download_started_at', { lng: lang }), datafield: 'StartDate', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 200, width: 'auto', filtertype: "custom", enabletooltips: false,
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('download_duration', { lng: lang }), datafield: 'DownloadDuration', editable: false, minwidth: 180, width: 'auto',
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('installed_at', { lng: lang }), datafield: 'ScheduledInstallDate', editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 160, width: 'auto', enabletooltips: false, filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('expiration_date', { lng: lang }), datafield: 'ScheduledReplaceDate', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 160, width: 'auto', enabletooltips: false, filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('content_file', { lng: lang }), datafield: 'FileName', editable: false, minwidth: 100, width: 'auto',
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('fileSize_mb', { lng: lang }), datafield: 'FileSize', editable: false, minwidth: 140, width: 'auto',
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('created_by', { lng: lang }), datafield: 'FullName', editable: false, minwidth: 100, width: 'auto',
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('createdOn', { lng: lang }), datafield: 'TaskCreatedDate', editable: false, minwidth: 150, width: 'auto', cellsformat: LONG_DATETIME_GRID_FORMAT,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);

                       }
                    },
                    {
                        text: i18n.t('additional_info', { lng: lang }), datafield: 'ActionTasksAdditionalInfo', hidden: true, editable: false, minwidth: 180, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },

                   {
                       text: i18n.t('last_Mgmt_plan', { lng: lang }), datafield: 'TaskSentDate', hidden: true, editable: false, minwidth: 180, width: 'auto', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);
                       }
                   }
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
            enabletooltips: true,
            rowsheight: 32,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            autoshowcolumnsmenubutton: false,
            rendergridrows: function () {
                return dataAdapter.records;
            },
            ready: function () {
                callOnGridReady(gID, gridStorage, CallType, '');
                var columns = genericHideShowColumn(gID, true, ['ActionTasksAdditionalInfo', 'TaskSentDate']);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                koUtil.gridColumnList.push('LastHeartBeat');
                visibleColumnsList = koUtil.gridColumnList;
            },
            autoshowfiltericon: true,

            columns: gridColumns,
        });//JqxGrid End

        getGridBiginEdit(gID, 'TaskId', gridStorage);

        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'TaskId');

    }//Grid Function End

    //Grid parameter
    function detailedContentStatusParameter(isExport, columnSortFilterForContent, deviceSearchObj, selectedDetailedContentItems, unselectedDetailedContentItems, checkAll, visibleColumns) {
        var getDownloadResultsDetailsForDeviceProfileReq = new Object();
        var Export = new Object();
        var Selector = new Object();
        var Pagination = new Object();
        var UniqueDeviceId = new Object();
        coulmnfilter = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
        Export.ExportReportType = ENUM.get("ContentDeliveryStatus");
        Export.VisibleColumns = visibleColumns;
        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedDetailedContentItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
                Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedDetailedContentItems;
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


        var ColumnSortFilter = columnSortFilterForContent;
        FilterList = new Array();
        coulmnfilter.ColumnType = null;
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterDays = null;
        coulmnfilter.FilterValue = null;
        coulmnfilter.FilterValueOptional = null;

        FilterList.push(coulmnfilter);


        getDownloadResultsDetailsForDeviceProfileReq.ColumnSortFilter = ColumnSortFilter;
        getDownloadResultsDetailsForDeviceProfileReq.DeviceId = koUtil.deviceId;
        getDownloadResultsDetailsForDeviceProfileReq.Export = Export;
        getDownloadResultsDetailsForDeviceProfileReq.PackageType = ENUM.get("Content");
        getDownloadResultsDetailsForDeviceProfileReq.Pagination = Pagination;
        getDownloadResultsDetailsForDeviceProfileReq.Selector = Selector;
        getDownloadResultsDetailsForDeviceProfileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        getDownloadResultsDetailsForDeviceProfileReq.ModelName = koUtil.ModelName;

        var param = new Object();
        param.token = TOKEN();
        param.getDownloadResultsDetailsForDeviceProfileReq = getDownloadResultsDetailsForDeviceProfileReq;

        return param;
    }
    //end grid parameter


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