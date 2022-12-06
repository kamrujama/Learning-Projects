define(["knockout", "advancedSearchUtil", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, ADSearchUtil, koUtil, autho) {

    SelectedIdOnGlobale = new Array();
    columnSortFilterForDownload = new Object();
    isPackagenotFound = new Object();
    var lang = getSysLang();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function detailDownloadStatusViewModel() {

        
        SelectedIdOnGlobale = new Array();
        checkALlPageId = 0;
        pagechangedcheck = 0;
        totalselectedRowCount = 0;

        var self = this;
        self.checksample = ko.observable();
        self.observableModelPopup = ko.observable();

        //For advanced search
        ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridVRKDownloadDetailsForDeviceProfile';
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;

        setMenuSelection();

        //For Clear Filter
        self.clearfilter = function (gId) {
            CallType = ENUM.get("CALLTYPE_NONE");
            gridFilterClear(gId);
        }

        // For Refresh Grid
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }

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

        //Function For Get selected
        function getSelectedIds() {
            return SelectedIdOnGlobale;
        }

        //PopUp Functions
        self.packageName = ko.observableArray();
        self.downloadDetailModelPopUp = ko.observable();
        self.templateFlag = ko.observable(false);
        self.AdvanceTemplateFlag = ko.observable(false);
        self.columnlist = ko.observableArray();
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['SerialNumber', 'HierarchyFullPath', 'ModelName'];
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');

        //For advanced search popup
        self.observableCriteria = ko.observable();
        loadCriteria('modalCriteria', 'genericPopup');
        ADSearchUtil.deviceSearchObj = new Object();

        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];
        //ADSearchUtil.AdScreenName = 'vrkDownloadDetails';
        ADSearchUtil.ExportDynamicColumns = [];
        self.observableAdvancedSearchModelPopup = ko.observable();
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "HierarchyFullPath", "ModelName", "ComputedDeviceStatus", "BundleName", "BundleFile", "VRKPayload", "Status", "AdditionalInfo", "Status", "DownloadSchedule", "DownloadStartedAt", "DownloadDuration", "InstalledAt", "SubmittedOn", "TaskSentDate"];
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
                $('#viewDetailDownload').modal('show');
            } else if (popupName == "modelExportSucess") {
                loadelement(popupName, 'genericPopup');
                $('#viewDetailDownload').modal('show');;
            } else if (popupName == 'modelAdvancedSearch') {
                self.AdvanceTemplateFlag(true);
                loadAdvancedSearchModelPopup(popupName, 'genericPopup');
                $('#AdvanceSearchModal').modal('show');
            }
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
        function loadAdvancedSearchModelPopup(elementname, controllerId) {// Advance Search

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


        //Unload Template
        self.unloadTempPopup = function (popupName, flage, gId, exportflage) {
            if (flage == 1) {
                for (var i = 0; i < hideColumnsArr.length; i++) {
                    $("#" + hideColumnsArr[i].gridId).jqxGrid('hidecolumn', hideColumnsArr[i].column);
                }
                hideColumnsArr = [];
            }
            self.downloadDetailModelPopUp(popupName);
            if (gId != null) {
                if (exportflage != null && exportflage != false) {
                    gridFilterClear(gId);
                }
            }
        };

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
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = detailedDownloadStatusParameter(true, columnSortFilterForDownload, ADSearchUtil.deviceSearchObj, selectedDetailedDownloadItems, unselectedDetailedDownloadItems, checkAll, visibleColumnsList);

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
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    } 
                }
            }

            var params = JSON.stringify(param);;
            ajaxJsonCall('GetVRKDownloadDetailsForDeviceProfile', params, callBackfunction, true, 'POST', true);
        }

        //Reschedule declare
        self.downloadDetailReschedule = function (gId) {
            var selectedIds = getSelectedUniqueId(gId);
            if ((selectedIds.length == 1) || (selectedIds.length > 1)) {
                $("#scheduleConfId").modal('show');
                $("#draggConfID").draggable();
            } else {
                openAlertpopup(1, 'there_are_no_downloads_selected_to_reschedule');
                $("#draggInfoID").draggable();
            }
        }

        //reschedule on downloadstatus
        self.rescheduleDownload = function (gId) {
            var selectedMultiDataItems = getMultiSelectedData(gId);
            var unselectedItemIds = getUnSelectedUniqueId(gId);
            var checkALL = checkAllSelected(gId);
            var schedule = 0;
            var isContinue = false;
            for (var i = 0; i < selectedMultiDataItems.length; i++) {
                var selectedDownloadStatus = selectedMultiDataItems[i].Status;
                var selectedIsRescheduled = selectedMultiDataItems[i].IsRescheduled;
                var selectedIsVRKRescheduled = selectedMultiDataItems[i].IsVRKRescheduled;
                if ((selectedDownloadStatus == 'Download Failed' || selectedDownloadStatus == 'Install Failed') &&
                    selectedIsRescheduled == false && selectedIsVRKRescheduled == false) {
                    schedule = 1;
                }
            }

            if (schedule == 1) {
                vrkDetailedDownloadParameterReschedule(selectedMultiDataItems, unselectedItemIds, ADSearchUtil.deviceSearchObj, checkALL, gId, self.packageName, isContinue);
            }
        }

        //reschedule when package not found
        self.reschedulePackage = function (gId, isContinue, observableModelPopup) {
            var selectedMultiDataItems = getMultiSelectedData(gId);
            var unselectedItemIds = getUnSelectedUniqueId(gId);
            var checkALL = checkAllSelected(gId);
            var schedule = 0;
            for (var i = 0; i < selectedMultiDataItems.length; i++) {
                var selectedDownloadStatus = selectedMultiDataItems[i].Status;
                var selectedIsRescheduled = selectedMultiDataItems[i].IsRescheduled;
                var selectedIsVRKRescheduled = selectedMultiDataItems[i].IsVRKRescheduled;
                if ((selectedDownloadStatus == 'Download Failed' || selectedDownloadStatus == 'Install Failed') &&
                    selectedIsRescheduled == false && selectedIsVRKRescheduled == false) {
                    schedule = 1;
                }
            }

            if (schedule == 1) {
                vrkDetailedDownloadParameterReschedule(selectedMultiDataItems, unselectedItemIds, ADSearchUtil.deviceSearchObj, checkALL, gId, self.packageName, isContinue);
            }
        }

        //Grid Call
        var param = detailedDownloadStatusParameter(false, columnSortFilterForDownload, ADSearchUtil.deviceSearchObj, null, null, 0, []);
        detailedVRKDownloadStatusGrid('jqxgridVRKDownloadDetailsForDeviceProfile', param);

        seti18nResourceData(document, resourceStorage);
    }// ModelView End

    // Reschedule Function call
    function vrkDetailedDownloadParameterReschedule(selectedMultiDataItems, unselectedItemIds, deviceSearchObj, checkALL, gId, packageName, isContinue) {
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
        createRescheduleJobReq.DeviceSearch = deviceSearchObj;
        createRescheduleJobReq.IsContinue = isContinue;
        createRescheduleJobReq.PackageType = ENUM.get("VRKPayLoad");
        createRescheduleJobReq.TaskDetails = schedule;
        createRescheduleJobReq.UnselectedItemIds = UnselectedItemIds;
        createRescheduleJobReq.DeviceId = null;
        createRescheduleJobReq.ModelName = null;
        createRescheduleJobReq.UniqueDeviceId = 0;


        var callbackFunction = function (data, error, IsContinue) {
            self.isPackagenotFound = ko.observable(false);

            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'vrk_downloads_successfully_rescheduled');
                    $('#draggDetailID').draggable();
                    gridRefresh('jqxgridVRKDownloadDetailsForDeviceProfile');
                } else if (data.responseStatus.StatusCode == AppConstants.get('RESCHEDULE_PACKAGE_STATUS_CODE') && (data.createRescheduleJobResp.PackageNames == null)) {
                    openAlertpopup(2, 'unable_to_reschedule_as_packages_associated_with_the_selected_job_are_removed_from_vrk_bundle_library');
                } else if (data.responseStatus.StatusCode == AppConstants.get('Package_Not_Found')) {
                    openAlertpopup(2, data.responseStatus.StatusMessage);
                } else if (data.responseStatus.StatusCode == AppConstants.get('RESCHEDULE_PACKAGE_STATUS_CODE')) {
                    packageName(data.createRescheduleJobResp.PackageNames);
                    $("#modalScheduleID").modal('show');
                } else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Exists')) {
                    openAlertpopup(2, 'No_Eligible_Device_Exists_Include_Inactive_Devices');
                } else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Excluding_Inactive_Devices')) {
                    openAlertpopup(2, 'No_Eligible_Device_Exists_Exclude_Inactive_Devices');
                } else if (data.responseStatus.StatusCode == AppConstants.get('RESCHEDULE_PACKAGE_STATUS_CODE')) {
                    openAlertpopup(2, 'unable_to_reschedule_as_packages_associated_with_the_selected_job_are_removed_from_vrk_bundle_library');
                }
            }
        }

        var method = 'CreateRescheduleJob';
        var params = '{"token":"' + TOKEN() + '" ,"createRescheduleJobReq":' + JSON.stringify(createRescheduleJobReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }



    // Calling Jqxgrid
    function detailedVRKDownloadStatusGrid(gID, param) {

        //For Advanced search
        var gridColumns = [];
        

        CallType = ENUM.get("CALLTYPE_WEEK");

        //var gridID = '#' + gID + '';
        var isFilter;
        if (isdetailedVRKDownloadStatusGridFilter == undefined || isdetailedVRKDownloadStatusGridFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        isdetailedVRKDownloadStatusGridFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;


        var source =
        {
            dataType: "json",
            dataFields: [
                     { name: 'SerialNumber', map: 'SerialNumber' },
                     { name: 'TaskId', map: 'TaskId' },
                     { name: 'DeviceId', map: 'TaskDeviceId' },
                     { name: 'HierarchyFullPath', map: 'HierarchyFullPath' ,type: 'string'},
                     { name: 'ModelName', map: 'ModelName' },
                     { name: 'ComputedDeviceStatus', map: 'DeviceDetail>ComputedDeviceStatus' },
                     { name: 'BundleName', map: 'BundleName' },
                     { name: 'BundleFile', map: 'BundleFile' },
                     { name: 'VRKPayload', map: 'VRKPayload' },
                     { name: 'Status', map: 'Status' },
                     { name: 'AdditionalInfo', map: 'AdditionalInfo' },
                     { name: 'DownloadSchedule', map: 'DownloadSchedule', type: 'date' },
                     { name: 'DownloadStartedAt', map: 'DownloadStartedAt', type: 'date' },
                     { name: 'DownloadDuration', map: 'DownloadDuration' },
                     { name: 'InstalledAt', map: 'InstalledAt', type: 'date' },
                     { name: 'SubmittedOn', map: 'SubmittedOn', type: 'date' },
                     { name: 'isSelected', type: 'number' },
                     { name: 'LastHeartBeat', map: 'DeviceDetail>LastHeartBeat'},
                     { name: 'TaskSentDate', map: 'TaskSentDate' },
                     { name: 'IsRescheduled', map: 'IsRescheduled' },
                     { name: 'IsVRKRescheduled', map: 'IsVRKRescheduled' },
                     { name: 'Component', map: 'Component' }

            ],
            root: 'VRKBundleDetails',
            type: "POST",
            data: param,

            url: AppConstants.get('API_URL') + "/GetVRKDownloadDetailsForDeviceProfile",
            contentType: 'application/json',
            beforeprocessing: function (data) {

                if (data && data.getVRKDownloadDetailsForDeviceProfileResp) {
                    data.getVRKDownloadDetailsForDeviceProfileResp = $.parseJSON(data.getVRKDownloadDetailsForDeviceProfileResp);
                }
                else
                    data.getVRKDownloadDetailsForDeviceProfileResp=[];

                if (data.getVRKDownloadDetailsForDeviceProfileResp && data.getVRKDownloadDetailsForDeviceProfileResp.PaginationResponse &&
                    data.getVRKDownloadDetailsForDeviceProfileResp.PaginationResponse.TotalRecords > 0) {
                    source.totalrecords = data.getVRKDownloadDetailsForDeviceProfileResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getVRKDownloadDetailsForDeviceProfileResp.PaginationResponse.TotalPages;
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
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh', 'rescheduleBtn']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForDownload, gID, gridStorage, AppConstants.get('VRKDownloadDetailsForDeviceProfileGrid'));
                    param.getVRKDownloadDetailsForDeviceProfileReq.ColumnSortFilter = columnSortFilter;
                    param.getVRKDownloadDetailsForDeviceProfileReq.Pagination = getPaginationObject(param.getVRKDownloadDetailsForDeviceProfileReq.Pagination, gID);
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh', 'rescheduleBtn']);
                    //if (data && data.getVRKDownloadDetailsForDeviceProfileResp) {
                    //    data.getVRKDownloadDetailsForDeviceProfileResp = $.parseJSON(data.getVRKDownloadDetailsForDeviceProfileResp);
                    //}

                    if (data.getVRKDownloadDetailsForDeviceProfileResp && data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails) {
                        
                        for (var i = 0; i < data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails.length; i++) {
                            data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails[i].TaskSentDate = convertToDeviceZonetimestamp(data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails[i].TaskSentDate);
                            data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails[i].DeviceDetail.LastHeartBeat = convertToDeviceZonetimestamp(data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails[i].DeviceDetail.LastHeartBeat);
                            data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails[i].DownloadStartedAt = convertToDeviceZonetimestamp(data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails[i].DownloadStartedAt);
                            data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails[i].InstalledAt = convertToDeviceZonetimestamp(data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails[i].InstalledAt);
                            data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails[i].DownloadSchedule = convertToDeviceZonetimestamp(data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails[i].DownloadSchedule);
                            data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails[i].SubmittedOn = convertToLocaltimestamp(data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails[i].SubmittedOn);

                            if (data.getVRKDownloadDetailsForDeviceProfileResp.TotalSelectionCount != 'undefined') {
                                gridStorage[0].TotalSelectionCount = data.getVRKDownloadDetailsForDeviceProfileResp.TotalSelectionCount;
                                var updatedGridStorage = JSON.stringify(gridStorage);
                                window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            }
                            
                        }
                        if (data.getVRKDownloadDetailsForDeviceProfileResp.PaginationResponse) {
                            //if (data.getVRKDownloadDetailsForDeviceProfileResp.PaginationResponse.HighLightedItemPage > 0) {
                            //    gridStorage[0].highlightedPage = data.getVRKDownloadDetailsForDeviceProfileResp.PaginationResponse.HighLightedItemPage;
                            //    var updatedGridStorage = JSON.stringify(gridStorage);
                            //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            //}
                        } else {

                        }
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getVRKDownloadDetailsForDeviceProfileResp = new Object();
                        data.getVRKDownloadDetailsForDeviceProfileResp.VRKBundleDetails = [];
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
            enablegridfunctions(gID, 'TaskId', element, gridStorage, true, 'pagerDivVRKDetailDownload', true, 3, 'Status', 'Status', 'IsRescheduled', 'IsVRKRescheduled');
            return true;
        }

        //for device profile
        function SerialNoRendereDownloadDetail(row, columnfield, value, defaulthtml, columnproperties) {
            var data = $("#" + gID).jqxGrid('getrowdata', row);
            var href = null;
            return '<div style="padding-left:10px;padding-top:9px;"><a href="index.html#deviceProfile/' + data.UniqueDeviceId + '" style="text-decoration:underline;" title="View Profile" >' + value + '</a></div>'
        }


        var cellbeginedit = function (row, datafield, columntype, value) {
            var datafield1val = $("#" + gID).jqxGrid('getcellvalue', row, 'Status');
            var datafield2val = $("#" + gID).jqxGrid('getcellvalue', row, 'IsRescheduled');
            var datafield3val = $("#" + gID).jqxGrid('getcellvalue', row, 'IsVRKRescheduled');
            if ((datafield1val == 'Download Failed' || datafield1val == 'Install Failed') && datafield2val == false && datafield3val == false) {
                return true;
            } else {
                return false;
            }
        }

        var cellclass = function (row, columnfield) {
            var classname = genericCellDisablesrendererForVRKDetails(row, columnfield, gID, 'Status', 'IsRescheduled', 'IsVRKRescheduled');
            return classname;
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

        // tootip renderer for job status
        var toolTipDetailsRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = displayTooltipAndIconRendererForVRK(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }
        var toolTipDownStatusloadRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = displayTooltipAndIconRendererForVRK(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }
        var toolTipComputedRenderer = function (row, column, value, defaultHtml) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
            var text = "Status: ";
            if (value == "Pending Hierarchy Assignment") {
                defaultHtml = '<div style="padding-left:8px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-checkmark iPanding" ></i></span><span style="padding-left:12px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
            }
            if (value == "Pending Registration" || value == "PendingRegistration") {
                defaultHtml = '<div style="margin-left:-4px; padding-left:0px;padding-top:3px;overflow:hidden;text-overflow: ellipsis;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg registration"></div></a><span style="padding-left:0px;padding-top:3px;" title="' + text + '' + value + '">' + value + '</span></div>';
            }

            if (value == "Active") {
                defaultHtml = '<div style="padding-left:8px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-checkmark" style="color:green"></i></span><span style="padding-left:12px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
            }
            if (value == "Inactive") {
                defaultHtml = '<div style="padding-left:8px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-cross" style="color:red"></i></span><span style="padding-left:12px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
            }


            return defaultHtml;
        }
        //ToolTip For Create by Column
        var createdBytooltip = function (row, column, value, defaultHtml) {
            var cellvalue = $("#" + gID).jqxGrid('getcellvalue', row, 'CreatedBy');
            defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><i class="icon-cross" style="color:red"></i></span><span style="padding-left:5px;padding-top:7px;" title="' + cellvalue + '">' + value + '</span></div>';
            return defaultHtml;
        }
        //For Advanced search
        gridColumns = [
                   {
                       text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclass,
                       datafield: 'isSelected', width: 40, renderer: function () {
                           return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                       }, rendered: rendered
                   },

                   {
                       text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 130, width: 'auto', filtertype: "custom", enabletooltips: false, 
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },                   
                   {
                       text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 200, width: 'auto', filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 100, width: 'auto', enabletooltips: false,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
                       }
                   },
                   {
                       text: i18n.t('Device Status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 150, width: 'auto', enabletooltips: false, filtertype: "custom", cellsrenderer: toolTipComputedRenderer,
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
                       }
                   },
                   {
                       text: i18n.t('bundlename', { lng: lang }), datafield: 'BundleName', editable: false, minwidth: 150, width: 'auto', enabletooltips: false, cellsrenderer: toolTipDetailsRenderer,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('bundlefile', { lng: lang }), datafield: 'BundleFile', editable: false, minwidth: 150, width: 'auto',
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('vrk_payload', { lng: lang }), datafield: 'VRKPayload', editable: false, minwidth: 130, width: 'auto', filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('Download_Status_lbl', { lng: lang }), datafield: 'Status', editable: false, minwidth: 150, width: 'auto', enabletooltips: false, cellsrenderer: toolTipDownStatusloadRenderer,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelMultiChoice(filterPanel, datafield, 'Software Job Task Status');
                       }
                   },
                   {
                       text: i18n.t('download_failed_reason', { lng: lang }), datafield: 'AdditionalInfo', editable: false, minwidth: 180, width: 'auto',
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);

                       }
                   },
                   {
                       text: i18n.t('download_scheduled_col', { lng: lang }), datafield: 'DownloadSchedule', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 180, width: 'auto', enabletooltips: false,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);

                       }

                   },
                   {
                       text: i18n.t('download_started_at', { lng: lang }), datafield: 'DownloadStartedAt', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 180, width: 'auto', enabletooltips: false,
                       filtertype: "custom",
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
                       text: i18n.t('installed_at', { lng: lang }), datafield: 'InstalledAt', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 180, width: 'auto', enabletooltips: false, filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);

                       }

                   },
                   {
                       text: i18n.t('submitted_on', { lng: lang }), datafield: 'SubmittedOn', editable: false, minwidth: 180, width: 'auto', cellsformat: LONG_DATETIME_GRID_FORMAT,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);

                       }

                   },
                   {
                       text: i18n.t('last_Mgmt_plan', { lng: lang }), datafield: 'TaskSentDate', cellsformat: LONG_DATETIME_GRID_FORMAT, hidden: true, editable: false, minwidth: 180, width: 'auto', filterable: true, enabletooltips: false, filtertype: "custom",
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
                var columns = genericHideShowColumn(gID, true, ['TaskSentDate']);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                koUtil.gridColumnList.push('LastHeartBeat');
                visibleColumnsList = koUtil.gridColumnList;
            },
            autoshowfiltericon: true,
            columns: gridColumns

        });//JqxGrid End

        getGridBiginEdit(gID, 'TaskId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'TaskId');
    } //Grid Function End

    //Grid parameter
    function detailedDownloadStatusParameter(isExport, columnSortFilterForDownload, deviceSearchObj, selectedDetailedDownloadItems, unselectedDetailedDownloadItems, checkAll, visibleColumns) {

        var getVRKDownloadDetailsForDeviceProfileReq = new Object();
        var Export = new Object();
        var Selector = new Object();
        var Pagination = new Object();
        var UniqueDeviceId = new Object();
        var coulmnfilter = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
        Export.ExportReportType = ENUM.get("DownloadStatus");

        Export.DynamicColumns = null;
        Export.VisibleColumns = visibleColumns;
        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedDetailedDownloadItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
                Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedDetailedDownloadItems;
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

        var ColumnSortFilter = columnSortFilterForDownload;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        ColumnSortFilter.GridId = AppConstants.get('VRKDownloadDetailsForDeviceProfileGrid');
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getVRKDownloadDetailsForDeviceProfileReq.ColumnSortFilter = ColumnSortFilter;
        getVRKDownloadDetailsForDeviceProfileReq.Export = Export;
        getVRKDownloadDetailsForDeviceProfileReq.ModelName = koUtil.ModelName;
        //getVRKDownloadDetailsForDeviceProfileReq.PackageType = ENUM.get("Software");
        getVRKDownloadDetailsForDeviceProfileReq.Pagination = Pagination;
        getVRKDownloadDetailsForDeviceProfileReq.Selector = Selector;
        getVRKDownloadDetailsForDeviceProfileReq.CallType = ENUM.get("CALLTYPE_NONE");
        getVRKDownloadDetailsForDeviceProfileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

        var param = new Object();
        param.token = TOKEN();
        param.getVRKDownloadDetailsForDeviceProfileReq = getVRKDownloadDetailsForDeviceProfileReq;

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