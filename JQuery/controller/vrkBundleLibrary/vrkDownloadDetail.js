define(["knockout", "koUtil", "autho", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho, ADSearchUtil) {

    SelectedIdOnGlobale = new Array();
    columnSortFilterForDownload = new Object();
    isPackagenotFound = new Object();
    var lang = getSysLang();
    koUtil.GlobalColumnFilter = new Array();
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
        ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridVRKDownloadDetails';
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;

        setMenuSelection();

        //For Clear Filter
        self.clearfilter = function (gId) {
            var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
            gridStorage[0].CallType = ENUM.get("CALLTYPE_NONE");
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);

            CallType = ENUM.get("CALLTYPE_NONE");
            gridFilterClear(gId);
        }

        // For Refresh Grid
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }
        //Draggable function

        //Draggable function
        $('#mdVRKAdvanceSearchModal').mouseup(function() {
            $("#mdlVRKAdvanceSearch").draggable({ disabled: true });
            });

        $('#mdVRKAdvanceSearchModal').mousedown(function () {
            $("#mdlVRKAdvanceSearch").draggable({ disabled: false });
        });
        

        self.expandCriteria = function () {
            if ($("#deviceCriteriaDiv").hasClass('hide')) {
                $("#deviceCriteriaDiv").removeClass('hide');
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Collapse"><i class="icon-angle-up"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            } else {
                $("#deviceCriteriaDiv").addClass('hide')
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Expand"><i class="icon-angle-down"></i></a>';
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
        var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'ComputedDeviceStatus', 'HierarchyFullPath'];
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');

        //For advanced search popup
        self.observableCriteria = ko.observable();
        loadCriteria('modalCriteria', 'genericPopup');
        ADSearchUtil.deviceSearchObj = new Object();

        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];
        ADSearchUtil.AdScreenName = 'vrkDownloadDetails';
        ADSearchUtil.ExportDynamicColumns = [];
        self.observableAdvancedSearchModelPopup = ko.observable();
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "ModelName", "ComputedDeviceStatus", "HierarchyFullPath", "BundleName", "BundleFile", "VRKPayload", "Status", "AdditionalInfo", "Status", "DownloadSchedule", "DownloadStartedAt", "DownloadDuration", "InstalledAt", "SubmittedOn", "LastHeartBeat", "TaskSentDate"];
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

                //<!---advance search changes--->
                var arr = self.columnlist();
                for (var i = 0; i < arr.length; i++) {
                    if ($.inArray(arr[i].columnfield, ADSearchUtil.initColumnsArr) < 0) {
                        var source = _.where(ADSearchUtil.localDynamicColumns, { datafield: arr[i].columnfield });//////
                        if (source == '') {
                            self.columnlist.remove(arr[i]);
                        }
                    }
                }

                //For advanced search popup
                if (ADSearchUtil.resetAddSerchFlag == AppConstants.get('reset_value')) {
                    for (var i = 0; i < ADSearchUtil.newAddedgridColumns.length; i++) {
                        var source = _.where(self.columnlist(), { columnfield: ADSearchUtil.newAddedgridColumns[i].datafield });
                        if (source != '') {
                            self.columnlist.remove(source[0]);
                        }
                    }
                }

                loadelement(popupName, 'genericPopup');
                $('#viewDetailDownload').modal('show');
            } else if (popupName == "modelExportSucess") {
                loadelement(popupName, 'genericPopup');
                $('#viewDetailDownload').modal('show');
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
            $('#viewDetailDownload').modal('hide');
            if (gId != null) {
                if (exportflage != null && exportflage != false) {
                    gridFilterClear(gId);
                }
            }
            checkIsPopUpOPen();
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
            visibleColumnsList = GetExportVisibleColumn(gId);
            var checkAll = checkAllSelected(gId);
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
            ajaxJsonCall('GetVRKDownloadDetails', params, callBackfunction, true, 'POST', true);
        }

        //Reschedule declare
        self.downloadDetailReschedule = function (gId) {
            var selectedIds = getSelectedUniqueId(gId);
            var checkALL = checkAllSelected(gId);
            if ((selectedIds.length >= 1) || (checkALL == 1)) {
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
                if ((selectedDownloadStatus == 'Download Failed' || selectedDownloadStatus == 'Install Failed' || selectedDownloadStatus == 'Failed') &&
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
                if ((selectedDownloadStatus == 'Download Failed' || selectedDownloadStatus == 'Install Failed' || selectedDownloadStatus == 'Failed') &&
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
        detailedVRKDownloadStatusGrid('jqxgridVRKDownloadDetails', param, self.observableAdvancedSearchModelPopup);
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
        createRescheduleJobReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

        var callbackFunction = function (data, error, IsContinue) {
            self.isPackagenotFound = ko.observable(false);

            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'vrk_downloads_successfully_rescheduled');
                    $('#draggDetailID').draggable();
                    gridRefreshClearSelection('jqxgridVRKDownloadDetails');
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
    function detailedVRKDownloadStatusGrid(gID, param, modelPopup) {

        //For Advanced search
        var gridColumns = [];
        var DynamicColumns = [];
        var initfieldsArr = [];
        var sourceDataFieldsArr = [
                { name: 'isSelected', type: 'number' },
                { name: 'SerialNumber', map: 'SERIALNUMBER' },
                { name: 'TaskId', map: 'TASKID' },
                { name: 'DeviceId', map: 'DEVICEID' },
                { name: 'HierarchyFullPath', map: 'HIERARCHYFULLPATH' ,type: 'string'},
                { name: 'ModelName', map: 'MODELNAME' },
                { name: 'ComputedDeviceStatus', map: 'COMPUTEDDEVICESTATUS' },
                { name: 'BundleName', map: 'BUNDLENAME' },
                { name: 'BundleFile', map: 'BUNDLEFILE' },
                { name: 'VRKPayload', map: 'PACKAGENAME' },
                { name: 'Status', map: 'STATUS' },
                { name: 'AdditionalInfo', map: 'STATUSADDITIONALINFO' },
                { name: 'DownloadSchedule', map: 'SCHEDULEDDOWNLOADDATE', type: 'date' },
                { name: 'DownloadStartedAt', map: 'STARTDATE', type: 'date' },
                { name: 'UniqueDeviceId', map: 'UNIQUEDEVICEID' },
                { name: 'DownloadDuration', map: 'DOWNLOADDURATION' },
                { name: 'InstalledAt', map: 'INSTALLEDDATE', type: 'date' },
                { name: 'SubmittedOn', map: 'SUBMITTEDON', type: 'date' },                
                { name: 'LastHeartBeat', map: 'LASTHEARTBEAT', type: 'date' },
                { name: 'TaskSentDate', map: 'TASKSENTDATE', type: 'date' },
                { name: 'IsRescheduled', map: 'ISRESCHEDULED' },
                { name: 'IsVRKRescheduled', map: 'ISVRKRESCHEDULED' }
        ];
       
        var InitGridStoragObj = initGridStorageObj(gID, ENUM.get("CALLTYPE_DAY"));
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var gridheight = $(window).height();
        var percentValue;
        if (gridheight > 600) {
            percentValue = (20 / 100) * gridheight;
            gridheight = gridheight - 150;

            gridheight = gridheight - percentValue + 'px';


        } else {
            gridheight = '400px';
        }

        //var gridID = '#' + gID + '';
        //var gridStorageArr = new Array();
        //var gridStorageObj = new Object();
        //gridStorageObj.checkAllFlag = 0;
        //gridStorageObj.counter = 0;
        //gridStorageObj.filterflage = 0;
        //gridStorageObj.selectedDataArr = [];
        //gridStorageObj.unSelectedDataArr = [];
        //gridStorageObj.singlerowData = [];
        //gridStorageObj.multiRowData = [];
        //gridStorageObj.TotalSelectionCount = null;
        //gridStorageObj.highlightedRow = null;
        //gridStorageObj.highlightedPage = null;
        //gridStorageArr.push(gridStorageObj);
        //var gridStorage = JSON.stringify(gridStorageArr);
        //window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
        //var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));
        
        var source =
        {
            dataType: "json",
            dataFields: sourceDataFieldsArr,
            root: 'VRKBundleDetails',
            type: "POST",
            data: param,

            url: AppConstants.get('API_URL') + "/GetVRKDownloadDetails",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data && data.getVRKDownloadDetailsResp) {
                    data.getVRKDownloadDetailsResp = $.parseJSON(data.getVRKDownloadDetailsResp);
                }
                else
                    data.getVRKDownloadDetailsResp=[];

                if (data.getVRKDownloadDetailsResp && data.getVRKDownloadDetailsResp.PaginationResponse &&
                    data.getVRKDownloadDetailsResp.PaginationResponse.TotalRecords > 0) {
                    source.totalrecords = data.getVRKDownloadDetailsResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getVRKDownloadDetailsResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
            },       
        };


        var dataAdapter = new $.jqx.dataAdapter(source,
            {
                formatData: function (data) {
                    if (!isAdvancedSavedSearchApplied || koUtil.isSearchCancelled() == true) {
                        $("#" + gID).jqxGrid('showloadelement');
                        $('.all-disabled').show();
                    } else {
                        $("#" + gID).jqxGrid('hideloadelement');
                    }
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh', 'rescheduleBtn']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForDownload, gID, gridStorage, AppConstants.get('VRKDownloadDetailsGrid'), 'SubmittedOn');
                    param.getVRKDownloadDetailsReq.ColumnSortFilter = columnSortFilter;
                    koUtil.GlobalColumnFilter = columnSortFilter;
                    param.getVRKDownloadDetailsReq.CallType = CallType;
                    
                    var customData =JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
                    if (customData) {
                        ADSearchUtil.deviceSearchObj = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
                        ADSearchUtil.SearchText = sessionStorage.getItem(gID + 'CustomSearchText');
                        $("#deviceCriteriaDiv").empty();
                        $("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
                        $("#criteriabtnDiv").css("display", "block");
                    }
                    param.getVRKDownloadDetailsReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                    param.getVRKDownloadDetailsReq.Pagination = getPaginationObject(param.getVRKDownloadDetailsReq.Pagination, gID);

                    updatepaginationOnState(gID, gridStorage, param.getVRKDownloadDetailsReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage, param.getVRKDownloadDetailsReq.CallType);

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    //if (data && data.getVRKDownloadDetailsResp) {
                    //    data.getVRKDownloadDetailsResp = $.parseJSON(data.getVRKDownloadDetailsResp);
                    //}

                    if (data.getVRKDownloadDetailsResp && data.getVRKDownloadDetailsResp.VRKBundleDetails) {
                        for (var i = 0; i < data.getVRKDownloadDetailsResp.VRKBundleDetails.length; i++) {
                            data.getVRKDownloadDetailsResp.VRKBundleDetails[i].SCHEDULEDDOWNLOADDATE = convertToDeviceZonetimestamp(data.getVRKDownloadDetailsResp.VRKBundleDetails[i].SCHEDULEDDOWNLOADDATE);
                            data.getVRKDownloadDetailsResp.VRKBundleDetails[i].STARTDATE = convertToDeviceZonetimestamp(data.getVRKDownloadDetailsResp.VRKBundleDetails[i].STARTDATE);
                            data.getVRKDownloadDetailsResp.VRKBundleDetails[i].INSTALLEDDATE = convertToDeviceZonetimestamp(data.getVRKDownloadDetailsResp.VRKBundleDetails[i].INSTALLEDDATE);
                            data.getVRKDownloadDetailsResp.VRKBundleDetails[i].LASTHEARTBEAT = convertToDeviceZonetimestamp(data.getVRKDownloadDetailsResp.VRKBundleDetails[i].LASTHEARTBEAT);
                            data.getVRKDownloadDetailsResp.VRKBundleDetails[i].TASKSENTDATE = convertToDeviceZonetimestamp(data.getVRKDownloadDetailsResp.VRKBundleDetails[i].TASKSENTDATE);
                            data.getVRKDownloadDetailsResp.VRKBundleDetails[i].SUBMITTEDON = convertToLocaltimestamp(data.getVRKDownloadDetailsResp.VRKBundleDetails[i].SUBMITTEDON);
                        }
                    }

                    //Start advanced search
                    initfieldsArr = sourceDataFieldsArr;

                    ADSearchUtil.localDynamicColumns = [];//<!---advance search changes--->
                    if (data.getVRKDownloadDetailsResp && data.getVRKDownloadDetailsResp.DynamicColumns) {
                        DynamicColumns = data.getVRKDownloadDetailsResp.DynamicColumns;
                        for (var i = 0; i < data.getVRKDownloadDetailsResp.DynamicColumns.length; i++) {
                            var FieldSource = _.where(sourceDataFieldsArr, { name: data.getVRKDownloadDetailsResp.DynamicColumns[i].AttributeName });
                            if (FieldSource == '') {
                                var dynamicObj = new Object();
                                dynamicObj.name = data.getVRKDownloadDetailsResp.DynamicColumns[i].AttributeName;
                                dynamicObj.map = data.getVRKDownloadDetailsResp.DynamicColumns[i].AttributeName.toUpperCase();
                                if (data.getVRKDownloadDetailsResp.DynamicColumns[i].ControlType == 'Date') {
                                    dynamicObj.type = 'date';
                                }
                                ADSearchUtil.newAddedDataFieldsArr.push(dynamicObj);
                                var exportDynamicColumns = new Object();
                                exportDynamicColumns.AttributeName = data.getVRKDownloadDetailsResp.DynamicColumns[i].AttributeName;
                                exportDynamicColumns.AttributeType = data.getVRKDownloadDetailsResp.DynamicColumns[i].AttributeType;
                                exportDynamicColumns.ControlType = data.getVRKDownloadDetailsResp.DynamicColumns[i].ControlType;
                                exportDynamicColumns.DisplayName = data.getVRKDownloadDetailsResp.DynamicColumns[i].DisplayName;
                                exportDynamicColumns.FilterSource = data.getVRKDownloadDetailsResp.DynamicColumns[i].FilterSource;
                                exportDynamicColumns.IsCustomAttribute = data.getVRKDownloadDetailsResp.DynamicColumns[i].IsCustomAttribute;
                                exportDynamicColumns.IsInDeviceTimeZone = data.getVRKDownloadDetailsResp.DynamicColumns[i].IsInDeviceTimeZone;
                                ADSearchUtil.ExportDynamicColumns.push(exportDynamicColumns);
                            }
                            var ColumnSource = _.where(gridColumns, { datafield: data.getVRKDownloadDetailsResp.DynamicColumns[i].AttributeName });

                            var coulmnObj = new Object();
                            coulmnObj.text = i18n.t(data.getVRKDownloadDetailsResp.DynamicColumns[i].DisplayName, { lng: lang });
                            coulmnObj.datafield = data.getVRKDownloadDetailsResp.DynamicColumns[i].AttributeName;
                            coulmnObj.editable = false;
                            coulmnObj.minwidth = 200;
                            coulmnObj.width = 'auto';
                            coulmnObj.enabletooltips = true;
                            if (data.getVRKDownloadDetailsResp.DynamicColumns[i].ControlType == 'Date') {
                                coulmnObj.cellsformat = LONG_DATETIME_GRID_FORMAT;
                            }
                            coulmnObj.filtertype = "custom";
                            if (data.getVRKDownloadDetailsResp.DynamicColumns[i].ControlType == 'TextBox') {
                                coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
                            } else if (data.getVRKDownloadDetailsResp.DynamicColumns[i].ControlType == 'MultiCombo' || data.getVRKDownloadDetailsResp.DynamicColumns[i].ControlType == 'Combo') {
                                coulmnObj.createfilterpanel = function (datafield, filterPanel) {
                                    var FilterSource = AppConstants.get(datafield);
                                    buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource);
                                };
                            } else if (data.getVRKDownloadDetailsResp.DynamicColumns[i].ControlType == 'Date') {
                                coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanelDate(filterPanel, datafield); };

                            }
                            //<!---advance search changes--->
                            if (ColumnSource == '') {
                                ADSearchUtil.newAddedgridColumns.push(coulmnObj);

                            }
                            ADSearchUtil.localDynamicColumns.push(coulmnObj);
                            //<!---End--->
                        }
                    }
                    source.dataFields = sourceDataFieldsArr;
                    ///end Ad Search
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh', 'rescheduleBtn']);
                    if (data.getVRKDownloadDetailsResp && data.getVRKDownloadDetailsResp.VRKBundleDetails) {
                        if (data.getVRKDownloadDetailsResp.TotalSelectionCount != 'undefined') {
                            gridStorage[0].TotalSelectionCount = data.getVRKDownloadDetailsResp.TotalSelectionCount;
                            var updatedGridStorage = JSON.stringify(gridStorage);
                            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        }
                        if (data.getVRKDownloadDetailsResp.PaginationResponse) {
                            //if (data.getVRKDownloadDetailsResp.PaginationResponse.HighLightedItemPage > 0) {
                            //    gridStorage[0].highlightedPage = data.getVRKDownloadDetailsResp.PaginationResponse.HighLightedItemPage;
                            //    var updatedGridStorage = JSON.stringify(gridStorage);
                            //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            //}
                        } else {

                        }
                    } else {
                        data.getVRKDownloadDetailsResp = new Object();
                        data.getVRKDownloadDetailsResp.VRKBundleDetails = [];
                    }
                    if (isAdvancedSavedSearchApplied && koUtil.isSearchCancelled() == false) {
                        $("#searchInProgress").modal('hide');
                        $("#AdvanceSearchModal").modal('hide');
                        koUtil.isHierarchyModified(false);
                        koUtil.isAttributeModified(false);
                        modelPopup('unloadTemplate');
                    } else {
                        $('.all-disabled').hide();
                    }
                    $("#" + gID).jqxGrid('hideloadelement');
                    isAdvancedSavedSearchApplied = false;
                    koUtil.isSearchCancelled(false);
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
            var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
            return html;
        }


        var cellbeginedit = function (row, datafield, columntype, value) {
            var datafield1val = $("#" + gID).jqxGrid('getcellvalue', row, 'Status');
            var datafield2val = $("#" + gID).jqxGrid('getcellvalue', row, 'IsRescheduled');
            var datafield3val = $("#" + gID).jqxGrid('getcellvalue', row, 'IsVRKRescheduled');
            if ((datafield1val == 'Download Failed' || datafield1val == 'Install Failed' || datafield1val == 'Failed') && datafield2val == false && datafield3val == false) {
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
        
        // tootip renderer for device status
        var deviceStatusRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml);
            return defaultHtml;

        }
        
        // tootip renderer for download status
        var toolTipDownStatusloadRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = displayTooltipAndIconRendererForVRK(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }

        //ToolTip For Create by Column
        var createdBytooltip = function (row, column, value, defaultHtml) {
            var cellvalue = $("#" + gID).jqxGrid('getcellvalue', row,'CreatedBy');
            defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><i class="icon-cross" style="color:red"></i></span><span style="padding-left:5px;padding-top:7px;" title="' + cellvalue + '">' + value + '</span></div>';
            return defaultHtml;
        }

         var initialColumnFilter = function () {
            return initialColumnFilterBuilder(gridStorage);
        }();
        //For Advanced search
        gridColumns = [
                   {
                       text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclass,
                       datafield: 'isSelected', width: 40, renderer: function () {
                           return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                       }, rendered: rendered
                   },

                   {
                       text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 120, width: 'auto', filtertype: "custom", enabletooltips: false, cellsrenderer: SerialNoRendereDownloadDetail,
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 120, width: 'auto', filtertype: "custom", enabletooltips: false, cellsrenderer: SerialNoRendereDownloadDetail,
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
                       text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 150, width: 'auto', enabletooltips: false,
                       filtertype: "custom", cellsrenderer: deviceStatusRenderer,
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
                       }
                   },
                   {
                       text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 180, width: 'auto', filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   
                   {
                       text: i18n.t('bundlename', { lng: lang }), datafield: 'BundleName', editable: false, minwidth: 150, width: 'auto',
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
                       text: i18n.t('vrk_payload', { lng: lang }), datafield: 'VRKPayload', editable: false, minwidth: 150, width: 'auto', filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('submitted_on', { lng: lang }), datafield: 'SubmittedOn', filter: initialColumnFilter, editable: false, minwidth: 180, width: 'auto', cellsformat: LONG_DATETIME_GRID_FORMAT,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                   {
                       text: i18n.t('Download_Status_lbl', { lng: lang }), datafield: 'Status', editable: false, minwidth: 200, width: 'auto', enabletooltips: false, cellsrenderer: toolTipDownStatusloadRenderer,
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
                       text: i18n.t('last_heartBeat', { lng: lang }), datafield: 'LastHeartBeat', cellsformat: LONG_DATETIME_GRID_FORMAT, hidden: true, editable: false, minwidth: 180, width: 'auto', filterable: true, enabletooltips: false, filtertype: "custom",
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
            height: gridHeightFunction(gID, "1"),
            pageable: true,
            editable: true,
            source: dataAdapter,
            altRows: true,
            virtualmode: true,
            pageSize: AppConstants.get('ROWSPERPAGE'),
            filterable: true,
            sortable: true,
            rowsheight: 32,
            columnsResize: true,
            columnsreorder: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            autoshowcolumnsmenubutton: false,
            enabletooltips: true,
            autoshowfiltericon: true,
            rendergridrows: function () {
                return dataAdapter.records;
            },
            
            ready: function () {
                //CallType = addDefaultfilter(CallType, 'SubmittedOn', gID)

                if (ADSearchUtil.resetAddSerchFlag == '') {
                    var gID = ADSearchUtil.gridIdForAdvanceSearch;

                    for (var k = 0; k < initfieldsArr.length; k++) {
                        var FieldSource = _.where(sourceDataFieldsArr, { name: initfieldsArr[k].name });
                        if (FieldSource == '') {
                            sourceDataFieldsArr.push(initfieldsArr[k]);
                        }
                    }
                    for (var k = 0; k < ADSearchUtil.newAddedDataFieldsArr.length; k++) {
                        var FieldSource = _.where(sourceDataFieldsArr, { name: ADSearchUtil.newAddedDataFieldsArr[k].name });
                        if (FieldSource == '') {
                            sourceDataFieldsArr.push(ADSearchUtil.newAddedDataFieldsArr[k]);
                        }
                    }

                    for (var k = 0; k < ADSearchUtil.newAddedgridColumns.length; k++) {
                        var FieldSource = _.where(gridColumns, { datafield: ADSearchUtil.newAddedgridColumns[k].datafield });
                        if (FieldSource == '') {
                            gridColumns.push(ADSearchUtil.newAddedgridColumns[k]);
                        };
                    }

                    //<!---advance search changes--->
                    for (var i = 0; i < ADSearchUtil.localDynamicColumns.length; i++) {
                        $("#" + gID).jqxGrid('showcolumn', ADSearchUtil.localDynamicColumns[i].datafield);
                    }
                    //<!---end--->

                    for (var i = 0; i < gridColumns.length; i++) {
                        if ($.inArray(gridColumns[i].datafield, ADSearchUtil.initColumnsArr) < 0) {
                            if (DynamicColumns) {
                                var checkSource = _.where(DynamicColumns, { AttributeName: gridColumns[i].datafield });
                                if (checkSource == '') {
                                    $("#" + gID).jqxGrid('hidecolumn', gridColumns[i].datafield);
                                }
                            }
                        }
                    }

                } else if (ADSearchUtil.resetAddSerchFlag == AppConstants.get('reset_value')) {
                    var gID = ADSearchUtil.gridIdForAdvanceSearch;
                    for (var init = 0; init < gridColumns.length; init++) {
                        if ($.inArray(gridColumns[init].datafield, ADSearchUtil.initColumnsArr) < 0) {
                            $("#" + gID).jqxGrid('hidecolumn', gridColumns[init].datafield);
                        }
                    }

                    for (var k = 0; k < ADSearchUtil.newAddedDataFieldsArr.length; k++) {
                        sourceDataFieldsArr = jQuery.grep(sourceDataFieldsArr, function (value) {
                            var l = sourceDataFieldsArr.indexOf(ADSearchUtil.newAddedDataFieldsArr[k]);
                            return (value != sourceDataFieldsArr[l] && value != null);
                        });
                    }
                }
                callOnGridReady(gID, gridStorage, CallType, 'SubmittedOn');
                var columns = genericHideShowColumn(gID, true, ['LastHeartBeat', 'TaskSentDate']);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;
                visibleColumnsList.push('LastHeartBeat');
            },
            columns: gridColumns

        });//JqxGrid End

        getGridBiginEdit(gID, 'TaskId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'TaskId');
    } //Grid Function End

    //Grid parameter
    function detailedDownloadStatusParameter(isExport, columnSortFilterForDownload, deviceSearchObj, selectedDetailedDownloadItems, unselectedDetailedDownloadItems, checkAll, visibleColumns) {

        var getVRKDownloadDetailsReq = new Object();
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

        //this code has to be removed---------------
        //var SelectedItemIds = new Array();
        //SelectedItemIds.push("2022,2023,2024");
        //Selector.SelectedItemIds = SelectedItemIds;
        //Selector.UnSelectedItemIds = (null);
        //------------------------------------------


        var ColumnSortFilter = columnSortFilterForDownload;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);


        getVRKDownloadDetailsReq.ColumnSortFilter = ColumnSortFilter;
        getVRKDownloadDetailsReq.Export = Export;
        //getVRKDownloadDetailsReq.PackageType = ENUM.get("Software");
        getVRKDownloadDetailsReq.Pagination = Pagination;
        getVRKDownloadDetailsReq.Selector = Selector;
        getVRKDownloadDetailsReq.DeviceSearch = deviceSearchObj;
        getVRKDownloadDetailsReq.UniqueDeviceId = 0;
        
        var param = new Object();
        param.token = TOKEN();
        param.getVRKDownloadDetailsReq = getVRKDownloadDetailsReq;

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