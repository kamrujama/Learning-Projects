define(["knockout", "koUtil", "advancedSearchUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, ADSearchUtil, autho) {
    SelectedIdOnGlobale = new Array
    columnSortFilterForContent = new Object();
    var lang = getSysLang();
    koUtil.GlobalColumnFilter = new Array();

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


        //Draggable function
        $('#mdlAdvancedForContentDetailHeader').mouseup(function () {
            $("#mdlAdvancedForContentDetailContent").draggable({ disabled: true });
        });

        $('#mdlAdvancedForContentDetailHeader').mousedown(function () {
            $("#mdlAdvancedForContentDetailContent").draggable({ disabled: false });
        });
        /////////

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
        ADSearchUtil.AdScreenName = 'contentDetailedStatus';
        ADSearchUtil.ExportDynamicColumns = [];

        setMenuSelection();

        //For advanced search
        ADSearchUtil.gridIdForAdvanceSearch = 'detailContentGrid';
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;

        ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "TaskDeviceId", "HierarchyFullPath", "ModelName", "JobName", "JobStatus", "PackageName", "PackageVersion", "Description", "ComputedDeviceStatus", "Status", "ScheduledDownloadDate", "StartDate", "DownloadDuration", "ActualInstalledDate", "ExpirationDateInDevice", "FileName", "FileSize", "FullName", "TaskCreatedDate", "StatusAdditionalInfo", "LastHeartBeat", "TaskSentDate", "ScheduledInstallDate", "CreatedBy"];

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        //For Clear Filter
        self.clearfilter = function (gId) {

            var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
            gridStorage[0].CallType = ENUM.get("CALLTYPE_NONE");
            CallType = gridStorage[0].CallType;
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);
            ///end

            //CallType = ENUM.get("CALLTYPE_NONE");
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



        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        //focus on first btn
        $('#contentConfId').on('shown.bs.modal', function () {
            $('#scheduleContConfoNo').focus();
        })
        $('#contentConfId').keydown(function (e) {
            if ($('#scheduleContConfoNo').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#contentConfIdYes').focus();
            }
        });

        //focus on first btn
        $('#modalScheduleID').on('shown.bs.modal', function () {
            $('#modalScheduleID_No').focus();
        })
        $('#contentConfId').keydown(function (e) {
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
        var compulsoryfields = ['SerialNumber', 'TaskDeviceId', 'ModelName', 'ComputedDeviceStatus', 'HierarchyFullPath'];
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');
        // Unload Template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.alertModelPopup(popupName);
            self.observableModelPopup(popupName);
            $('#contentModel').modal('hide');
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

                //For Advanced search
                if (ADSearchUtil.resetAddSerchFlag == 'reset') {
                    for (var i = 0; i < ADSearchUtil.newAddedgridColumns.length; i++) {
                        var source = _.where(self.columnlist(), { columnfield: ADSearchUtil.newAddedgridColumns[i].datafield });
                        if (source != '') {
                            self.columnlist.remove(source[0]);
                        }
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
                var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Collapse"><i class="icon-angle-up"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            } else {
                $("#deviceCriteriaDiv").addClass('hide')
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Expand"><i class="icon-angle-down"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            }
        }

        //unload advance search popup
        self.unloadAdvancedSearch = function () {
            repositionAdvanceSearchPopUp("mdlAdvancedForContentDetailContent");
            ClearAdSearch = 0;
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            $("#AdvanceSearchModal").modal('hide');
            $("#mainPageBody").removeClass('modal-open-appendon');
            isAdpopup = '';
        }

        self.clearAdvancedSearch = function () {
            repositionAdvanceSearchPopUp("mdlAdvancedForContentDetailContent");
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
            ajaxJsonCall('GetDownloadResultsDetails', params, callBackfunction, true, 'POST', true);
        }

        //Reschedule declare
        self.contentDetailReschedule = function (gId) {
            var selectedIds = getSelectedUniqueId(gId);
            if ((selectedIds.length == 1) || (selectedIds.length > 1)) {
                $("#contentConfId").modal('show');
                $("#draggConfID").draggable();
            } else {
                if (checkAllSelected('detailContentGrid') == 1) {
                    $("#contentConfId").modal('show');
                    $("#draggConfID").draggable();
                } else {
                    openAlertpopup(1, 'there_are_no_downloads_selected_to_reschedule');
                    $("#draggInfoID").draggable();
                }


            }
        }

        // reschedule content
        self.rescheduleContent = function (gId) {
            var selectedMultiDataItems = getMultiSelectedData(gId);
            var unselectedItemIds = getUnSelectedUniqueId(gId);
            var checkALL = checkAllSelected(gId);



            var schedule = 0;
            var isContinue = false;
            var totCount = getAllSelectedDataCount(gId);
            var selectedLength = selectedMultiDataItems.length;
            if (checkALL != 1) {
                for (var i = 0; i < selectedMultiDataItems.length; i++) {
                    var selectedJobStatus = selectedMultiDataItems[i].JobStatus;
                    var selectedIsAutoDownloadJob = selectedMultiDataItems[i].IsAutoDownloadJob;
                    var selectedIsRescheduled = selectedMultiDataItems[i].IsRescheduled;
                    var protocol = String(selectedMultiDataItems[i].Protocol).toUpperCase();
                    if (selectedJobStatus == "Failed" && selectedIsAutoDownloadJob == false && selectedIsRescheduled == false && protocol == AppConstants.get('VEM_PROTOCOL')) {
                        schedule = 1;
                    }
                }
            }
            if (schedule == 1) {
                detailedContentParameterReschedule(selectedMultiDataItems, unselectedItemIds, checkALL, gId, isContinue, self.packageName, ADSearchUtil.deviceSearchObj);
            } else if (checkALL == 1) {
                detailedContentParameterReschedule(null, unselectedItemIds, checkALL, gId, isContinue, self.packageName, ADSearchUtil.deviceSearchObj);
            }
        }

        //reschedule when package not found
        self.reschedulePackage = function (gId, isContinue) {
            var selectedMultiDataItems = getMultiSelectedData(gId);
            var unselectedItemIds = getUnSelectedUniqueId(gId);
            var checkALL = checkAllSelected(gId);
            var schedule = 0;
            if (checkALL != 1) {
                for (var i = 0; i < selectedMultiDataItems.length; i++) {
                    var selectedJobStatus = selectedMultiDataItems[i].JobStatus;
                    var selectedIsAutoDownloadJob = selectedMultiDataItems[i].IsAutoDownloadJob;
                    var selectedIsRescheduled = selectedMultiDataItems[i].IsRescheduled;
                    var protocol = String(selectedMultiDataItems[i].Protocol).toUpperCase();
                    if (selectedJobStatus == "Failed" && selectedIsAutoDownloadJob == false && selectedIsRescheduled == false && protocol == AppConstants.get('VEM_PROTOCOL')) {
                        schedule = 1;
                    }
                }
            }
            if (schedule == 1) {
                detailedContentParameterReschedule(selectedMultiDataItems, unselectedItemIds, checkALL, gId, isContinue, self.packageName, ADSearchUtil.deviceSearchObj);
            } else if (checkALL == 1) {
                detailedContentParameterReschedule(null, unselectedItemIds, checkALL, gId, isContinue, self.packageName, ADSearchUtil.deviceSearchObj);
            }
        }

        //Grid Call
        var param = detailedContentStatusParameter(false, columnSortFilterForContent, ADSearchUtil.deviceSearchObj, null, null, 0, []);
        detailedContentStatusGrid('detailContentGrid', param, self.observableAdvancedSearchModelPopup);

        seti18nResourceData(document, resourceStorage);
    }// ModelView End

    function detailedContentParameterReschedule(selectedMultiDataItems, unselectedItemIds, checkALL, gId, isContinue, packageName, deviceSearchObject) {
        createRescheduleJobReq = new Object();
        var UnselectedItemIds = new Array();
        var Selector = new Object();
        var schedule = new Array();
        if (checkALL != 1) {
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
        } else {
            UnselectedItemIds = unselectedItemIds;
            eDownloadJob = null;
            schedule.push(eDownloadJob);
        }

        createRescheduleJobReq.CallType = CallType;
        createRescheduleJobReq.DeviceSearch = deviceSearchObject;
        createRescheduleJobReq.IsContinue = isContinue;
        createRescheduleJobReq.PackageType = ENUM.get("Content");
        createRescheduleJobReq.TaskDetails = schedule;
        createRescheduleJobReq.UnselectedItemIds = UnselectedItemIds;
        createRescheduleJobReq.DeviceId = null;
        createRescheduleJobReq.ModelName = null;
        createRescheduleJobReq.UniqueDeviceId = 0;
        createRescheduleJobReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'content_downloads_successfully_rescheduled');
                    //  refreshGrid('detailContentGrid');                   
                    gridRefreshClearSelection('detailContentGrid');
                } else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Exists')) {
                    openAlertpopup(2, 'No_Eligible_Device_Exists_Include_Inactive_Devices');
                } else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Excluding_Inactive_Devices')) {
                    openAlertpopup(2, 'No_Eligible_Device_Exists_Exclude_Inactive_Devices');
                } else if (data.responseStatus.StatusCode == AppConstants.get('Package_Not_Found')) {
                    openAlertpopup(2, data.responseStatus.StatusMessage);
                } else if (data.responseStatus.StatusCode == AppConstants.get('RESCHEDULE_PACKAGE_STATUS_CODE') && (data.createRescheduleJobResp.PackageNames == null)) {
                    openAlertpopup(2, 'unable_to_reschedule_as_packages_associated_with_the_selected_job_are_removed_from_content_library');
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
    function detailedContentStatusGrid(gID, param, modelPopup) {
        //calculate height of grid
        var gridheight = $(window).height();
        var percentValue;
        if (gridheight > 600) {
            percentValue = (20 / 100) * gridheight;
            gridheight = gridheight - 150;

            gridheight = gridheight - percentValue + 'px';


        } else {
            gridheight = '400px';
        }
        ////////////////
        //For Advanced search
        var gridColumns = [];
        var DynamicColumns = [];
        var initfieldsArr = [];
        var sourceDataFieldsArr = [
                { name: 'isSelected', type: 'number' },
                { name: 'SerialNumber', map: 'SERIALNUMBER' },
                { name: 'TaskId', map: 'TASKID' },
                { name: 'TaskDeviceId', map: 'TASKDEVICEID' },
                { name: 'HierarchyFullPath', map: 'HIERARCHYFULLPATH', type: 'string' },
                { name: 'ModelName', map: 'MODELNAME' },
                { name: 'JobName', map: 'JOBNAME' },
                { name: 'JobStatus', map: 'COMPJOBSTATUS' },
                { name: 'PackageName', map: 'PACKAGENAME' },
                { name: 'PackageVersion', map: 'VERSION' },
                { name: 'Description', map: 'DESCRIPTION' },
                { name: 'ComputedDeviceStatus', map: 'COMPUTEDDEVICESTATUS' },
                { name: 'Status', map: 'STATUS' },
                { name: 'ScheduledDownloadDate', map: 'SCHEDULEDDOWNLOADDATE' },
                { name: 'ScheduledInstallDate', map: 'SCHEDULEDINSTALLDATE' },
                { name: 'StartDate', map: 'STARTDATE' },
                { name: 'DownloadDuration', map: 'DOWNLOADDURATION' },
                { name: 'ActualInstalledDate', map: 'INSTALLEDDATE' },
                { name: 'ExpirationDateInDevice', map: 'EXPIRATIONDATEINDEVICE' },
                { name: 'CreatedBy', map: 'DWCREATEDBYUSERNAME' },
                { name: 'FileName', map: 'FILENAME' },
                { name: 'FileSize', map: 'FILESIZE' },
                { name: 'FullName', map: 'FULLNAME' },
                { name: 'TaskCreatedDate', map: 'TASKCREATEDDATE', type: 'date' },
                { name: 'UniqueDeviceId', map: 'UNIQUEDEVICEID' },
                { name: 'StatusAdditionalInfo', map: 'STATUSADDITIONALINFO' },
                { name: 'LastHeartBeat', map: 'LASTHEARTBEAT', type: 'date' },
                { name: 'TaskSentDate', map: 'TASKSENTDATE', type: 'date' },
                { name: 'IsAutoDownloadJob', map: 'ISAUTODOWNLOADJOB' },
                { name: 'AdditionalStatusInfo', map: 'ADDITIONALSTATUSINFO' },
                { name: 'DownloadFailedReason', map: 'DownloadFailedReason' },
                { name: 'IsRescheduled', map: 'ISRESCHEDULED' },
                { name: 'IsResheduleAllowed', map: 'ISRESHEDULEALLOWED' },
                { name: 'Protocol', map: 'PROTOCOL' },
                { name: 'IsCancelRequestFailed', map: 'ISCANCELREQUESTFAILED' },
        ];

        var InitGridStoragObj = initGridStorageObj(gID, ENUM.get("CALLTYPE_DAY"));
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var source =
            {
                dataType: "json",
                dataFields: sourceDataFieldsArr,
                root: 'DownloadResultsDetails',
                type: "POST",
                data: param,

                url: AppConstants.get('API_URL') + "/GetDownloadResultsDetails",
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data.getDownloadResultsDetailsResp) {
                        data.getDownloadResultsDetailsResp = $.parseJSON(data.getDownloadResultsDetailsResp);

                        if (data.getDownloadResultsDetailsResp.PaginationResponse) {
                            source.totalrecords = data.getDownloadResultsDetailsResp.PaginationResponse.TotalRecords;
                            source.totalpages = data.getDownloadResultsDetailsResp.PaginationResponse.TotalPages;
                        } else {
                            source.totalrecords = 0;
                            source.totalpages = 0;
                        }
                    }
                    else
                        data.getDownloadResultsDetailsResp = [];
                },
            }


        var dataAdapter = new $.jqx.dataAdapter(source,
            {
                formatData: function (data) {
                    if (!isAdvancedSavedSearchApplied || koUtil.isSearchCancelled() == true) {
                        $("#" + gID).jqxGrid('showloadelement');
                        $('.all-disabled').show();
                    } else {
                        $("#" + gID).jqxGrid('hideloadelement');
                    }
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForContent, gID, gridStorage, 'DetailedContentStatus', 'TaskCreatedDate');
                    param.getDownloadResultsDetailsReq.ColumnSortFilter = columnSortFilter;
                    koUtil.GlobalColumnFilter = columnSortFilter;
                    param.getDownloadResultsDetailsReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                    param.getDownloadResultsDetailsReq.CallType = CallType;
                    param.getDownloadResultsDetailsReq.Pagination = getPaginationObject(param.getDownloadResultsDetailsReq.Pagination, gID);

                    ///for staemangment
                    var adStorage = JSON.parse(sessionStorage.getItem(gID + "adStorage"));
                    if (adStorage[0].isAdSearch == 0) {
                        if (adStorage[0].adSearchObj) {
                            ADSearchUtil.deviceSearchObj = adStorage[0].adSearchObj;
                        } else {
                            ADSearchUtil.deviceSearchObj = null;
                        }
                    } else {
                        if (adStorage[0].quickSearchObj) {
                            ADSearchUtil.deviceSearchObj = adStorage[0].quickSearchObj;
                        } else {
                            ADSearchUtil.deviceSearchObj = null;
                        }
                    }

                    updatepaginationOnState(gID, gridStorage, param.getDownloadResultsDetailsReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage, param.getDownloadResultsDetailsReq.CallType);

                    var customData = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
                    if (customData) {
                        ADSearchUtil.deviceSearchObj = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
                        ADSearchUtil.SearchText = sessionStorage.getItem(gID + 'CustomSearchText');
                        $("#deviceCriteriaDiv").empty();
                        $("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
                    }

                    param.getDownloadResultsDetailsReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {

                    if (data) {


                        if (data.getDownloadResultsDetailsResp && data.getDownloadResultsDetailsResp.DownloadResultsDetails) {
                            for (var i = 0; i < data.getDownloadResultsDetailsResp.DownloadResultsDetails.length; i++) {
                                data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].SCHEDULEDDOWNLOADDATE = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].SCHEDULEDDOWNLOADDATE);
                                data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].SCHEDULEDINSTALLDATE = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].SCHEDULEDINSTALLDATE);
                                data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].INSTALLEDDATE = convertToLocaltimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].INSTALLEDDATE);
                                data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].EXPIRATIONDATEINDEVICE = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].EXPIRATIONDATEINDEVICE);
                                data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].STARTDATE = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].STARTDATE);
                                data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].TASKSENTDATE = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].TASKSENTDATE);
                                data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].LASTHEARTBEAT = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].LASTHEARTBEAT);
                                data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].TASKCREATEDDATE = convertToLocaltimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].TASKCREATEDDATE);
                            }
                        }
                        //For Advanced Search
                        initfieldsArr = sourceDataFieldsArr;
                        ADSearchUtil.localDynamicColumns = [];//<!---advance search changes--->
                        if (data.getDownloadResultsDetailsResp && data.getDownloadResultsDetailsResp.DynamicColumns) {
                            DynamicColumns = data.getDownloadResultsDetailsResp.DynamicColumns;
                            for (var i = 0; i < data.getDownloadResultsDetailsResp.DynamicColumns.length; i++) {
                                var FieldSource = _.where(sourceDataFieldsArr, { name: data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeName });
                                if (FieldSource == '') {
                                    var dynamicObj = new Object();
                                    dynamicObj.name = data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeName;
                                    dynamicObj.map = data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeName.toUpperCase();
                                    if (data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType == 'Date') {
                                        dynamicObj.type = 'date';
                                    }
                                    ADSearchUtil.newAddedDataFieldsArr.push(dynamicObj);
                                    var exportDynamicColumns = new Object();
                                    exportDynamicColumns.AttributeName = data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeName;
                                    exportDynamicColumns.AttributeType = data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeType;
                                    exportDynamicColumns.ControlType = data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType;
                                    exportDynamicColumns.DisplayName = data.getDownloadResultsDetailsResp.DynamicColumns[i].DisplayName;
                                    exportDynamicColumns.FilterSource = data.getDownloadResultsDetailsResp.DynamicColumns[i].FilterSource;
                                    exportDynamicColumns.IsCustomAttribute = data.getDownloadResultsDetailsResp.DynamicColumns[i].IsCustomAttribute;
                                    exportDynamicColumns.IsInDeviceTimeZone = data.getDownloadResultsDetailsResp.DynamicColumns[i].IsInDeviceTimeZone;
                                    ADSearchUtil.ExportDynamicColumns.push(exportDynamicColumns);
                                }
                                var ColumnSource = _.where(gridColumns, { datafield: data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeName });

                                var coulmnObj = new Object();
                                coulmnObj.text = i18n.t(data.getDownloadResultsDetailsResp.DynamicColumns[i].DisplayName, { lng: lang });
                                coulmnObj.datafield = data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeName;
                                coulmnObj.editable = false;
                                coulmnObj.minwidth = 200;
                                coulmnObj.width = 'auto';
                                coulmnObj.enabletooltips = true;
                                if (data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType == 'Date') {
                                    coulmnObj.cellsformat = LONG_DATETIME_GRID_FORMAT;
                                }
                                coulmnObj.filtertype = "custom";
                                if (data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType == 'TextBox') {
                                    coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
                                } else if (data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType == 'MultiCombo' || data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType == 'Combo') {
                                    coulmnObj.createfilterpanel = function (datafield, filterPanel) {
                                        var FilterSource = AppConstants.get(datafield);
                                        buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource);
                                    };
                                } else if (data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType == 'Date') {
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
                        ///////End
                        enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                        if (data.getDownloadResultsDetailsResp && data.getDownloadResultsDetailsResp.DownloadResultsDetails) {
                            if (data.getDownloadResultsDetailsResp.TotalSelectionCount != 'undefined') {
                                gridStorage[0].TotalSelectionCount = data.getDownloadResultsDetailsResp.TotalSelectionCount;
                                var updatedGridStorage = JSON.stringify(gridStorage);
                                window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            }
                            if (data.getDownloadResultsDetailsResp.PaginationResponse) {
                                //if (data.getDownloadResultsDetailsResp.PaginationResponse.HighLightedItemPage > 0) {
                                //    //for (var h = 0; h < data.getDownloadResultsDetailsResp.DownloadResultsDetails.length; h++) {
                                //    //if (data.getDownloadResultsDetailsResp.DownloadResultsDetails[h].TaskId == data.getDownloadResultsDetailsResp.PaginationResponse.HighLightedItemId) {
                                //    gridStorage[0].highlightedPage = data.getDownloadResultsDetailsResp.PaginationResponse.HighLightedItemPage;
                                //    var updatedGridStorage = JSON.stringify(gridStorage);
                                //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                                //    //}
                                //    //}
                                //}
                            } else {

                            }
                        } else {
                            data.getDownloadResultsDetailsResp = new Object();
                            data.getDownloadResultsDetailsResp.DownloadResultsDetails = [];
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
            enablegridfunctions(gID, 'TaskId', element, gridStorage, true, 'pagerDivContentDetailStatus', true, 2, 'JobStatus', 'JobStatus', 'IsAutoDownloadJob', 'IsRescheduled', 'Protocol', null, null, 'IsResheduleAllowed');
            return true;
        }

        //for device profile
        function SerialNoRendereDetailContent(row, columnfield, value, defaulthtml, columnproperties) {
            var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
            return html;
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
            var classname = genericCellClassDisablesrendererForDetails(row, columnfield, gID, 'JobStatus', 'IsAutoDownloadJob', 'IsResheduleAllowed', 'IsRescheduled', 'Protocol');
            return classname;
        }

        var toolTipDetailsRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = displayTooltipAndIconRenderer(gID, row, column, value, defaultHtml, 2);
            return defaultHtml;
        }
        var deviceStatusRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }

        var toolTipDownStatusloadRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = dispalyTooltipIcon_DownloadStatus(gID, row, column, value, defaultHtml, 0);
            return defaultHtml;
        }

        var tooltipCretatedByRenderer = function (row, column, value, defaultHtml) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
            var createdBy = rowData.CreatedBy;
            var loginName = rowData.LoginName;

            if (createdBy != null || createdBy != '') {
                return '<div style="padding-left:5px;padding-top:7px;"><span style="padding-left:5px;padding-top:7px;" title="' + createdBy + '">' + value + '</span></div>';
            } else {
                return '<div style="padding-left:5px;padding-top:7px;"><span style="padding-left:5px;padding-top:7px;" title="' + loginName + '">' + value + '</span></div>';
            }

        }

        var initialColumnFilter = function () {
            return initialColumnFilterBuilder(gridStorage);
        }();

        gridColumns = [
            {
                text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclass, resizable: false, draggable: false,
                datafield: 'isSelected', width: 40, renderer: function () {
                    return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                }, rendered: rendered
            },
            { text: '', datafield: 'JobDownloadFailedReason', hidden: true, editable: false, minwidth: 0, },
            { text: '', dataField: 'IsAutoDownloadJob', hidden: true, editable: false, minwidth: 0, },
            { text: '', dataField: 'IsRescheduled', hidden: true, editable: false, width: 0, },
            { text: '', dataField: 'Protocol', hidden: true, editable: false, width: 0, },

            {
                text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', enabletooltips: false, editable: false, minwidth: 120,
                filtertype: "custom", cellsrenderer: SerialNoRendereDetailContent,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('device_id', { lng: lang }), datafield: 'TaskDeviceId', enabletooltips: false, editable: false, minwidth: 120,
                filtertype: "custom", cellsrenderer: SerialNoRendereDetailContent,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 100, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
                }
            },
            {
                text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 150, cellsrenderer: deviceStatusRenderer, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
                }
            },
            {
                text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 180, filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },                        
            {
                text: i18n.t('job_name', { lng: lang }), datafield: 'JobName', editable: false, minwidth: 150, filtertype: "custom", enabletooltips: false,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('job_status', { lng: lang }), datafield: 'JobStatus', editable: false, minwidth: 150, cellsrenderer: toolTipDetailsRenderer, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Download\/Content Job Status');
                }
            },
            {
                text: i18n.t('createdOn', { lng: lang }), datafield: 'TaskCreatedDate', filter: initialColumnFilter, editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 180, enabletooltips: false, filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('content_name', { lng: lang }), datafield: 'PackageName', editable: false, minwidth: 150, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('content_version', { lng: lang }), datafield: 'PackageVersion', editable: false, minwidth: 120, filtertype: "custom", enabletooltips: false,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            { text: i18n.t('description', { lng: lang }), datafield: 'Description', sortable: false, editable: false, minwidth: 120, sortable: false, menu: false, filterable: false, },            
            {
                text: i18n.t('Download_Status_lbl', { lng: lang }), datafield: 'Status', editable: false, minwidth: 180, cellsrenderer: toolTipDownStatusloadRenderer, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Content Job Task Status');
                }
            },
            {
                text: i18n.t('download_scheduled_col', { lng: lang }), editable: false, datafield: 'ScheduledDownloadDate', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 180, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('download_started_at', { lng: lang }), datafield: 'StartDate', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 180, filtertype: "custom", enabletooltips: false,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('download_duration', { lng: lang }), datafield: 'DownloadDuration', editable: false, minwidth: 100,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('installed_at', { lng: lang }), datafield: 'ScheduledInstallDate', editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 180, enabletooltips: false, filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('expiration_date', { lng: lang }), datafield: 'ExpirationDateInDevice', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 180, enabletooltips: false, filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('content_file', { lng: lang }), datafield: 'FileName', editable: false, minwidth: 120,
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
            {
                text: i18n.t('created_by', { lng: lang }), datafield: 'FullName', editable: false, minwidth: 100, enabletooltips: false, cellsrenderer: tooltipCretatedByRenderer,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },            
            {
                text: i18n.t('additional_info', { lng: lang }), datafield: 'StatusAdditionalInfo', hidden: true, editable: false, minwidth: 120,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('last_heartBeat', { lng: lang }), datafield: 'LastHeartBeat', hidden: true, editable: false, minwidth: 180, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('last_Mgmt_plan', { lng: lang }), datafield: 'TaskSentDate', hidden: true, editable: false, minwidth: 180, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);
                }
            }
        ];

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



        $("#" + gID).jqxGrid(
            {
                height: gridHeightFunction(gID, "30"),
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
                enabletooltips: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                rowsheight: 32,
                autoshowfiltericon: true,
                columns: gridColumns,
                rendergridrows: function () {
                    return dataAdapter.records;
                },

                ready: function () {
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
                            }
                        }

                        //<!---advance search changes--->
                        for (var i = 0; i < ADSearchUtil.localDynamicColumns.length; i++) {
                            $("#" + gID).jqxGrid('showcolumn', ADSearchUtil.localDynamicColumns[i].datafield);
                        }
                        //<!---end--->

                            for (var i = 0; i < gridColumns.length; i++) {
                                if ($.inArray(gridColumns[i].datafield, ADSearchUtil.initColumnsArr) < 0) {
                                        if (DynamicColumns) {
                                            var checkSource = _.where(DynamicColumns, { AttributeName: gridColumns[i].datafield });//<!---advance search changes--->
                                            if (checkSource == '') {
                                                $("#" + gID).jqxGrid('hidecolumn', gridColumns[i].datafield);
                                            }
                                        }
                                }
                            }
                        
                    } else if (ADSearchUtil.resetAddSerchFlag == 'reset') {
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
                    callOnGridReady(gID, gridStorage, CallType, 'TaskCreatedDate');
                    //CallType = addDefaultfilter(CallType, 'TaskCreatedDate', gID)

                    var columns = genericHideShowColumn(gID, true, ['StatusAdditionalInfo', 'LastHeartBeat', 'TaskSentDate']);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                    visibleColumnsList.push('LastHeartBeat');
                },

            });//JqxGrid End

        getGridBiginEdit(gID, 'TaskId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'TaskId');

    }//Grid Function End

    //Grid parameter
    function detailedContentStatusParameter(isExport, columnSortFilterForContent, deviceSearchObj, selectedDetailedContentItems, unselectedDetailedContentItems, checkAll, visibleColumns) {
        var getDownloadResultsDetailsReq = new Object();
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


        getDownloadResultsDetailsReq.ColumnSortFilter = ColumnSortFilter;
        getDownloadResultsDetailsReq.Export = Export;
        getDownloadResultsDetailsReq.PackageType = ENUM.get("Content");
        getDownloadResultsDetailsReq.CallType = CallType;
        getDownloadResultsDetailsReq.Pagination = Pagination;
        getDownloadResultsDetailsReq.Selector = Selector;
        getDownloadResultsDetailsReq.UniqueDeviceId = 0;
        getDownloadResultsDetailsReq.DeviceSearch = deviceSearchObj;
        getDownloadResultsDetailsReq.DownloadStatus = ENUM.get("DETAILED_CONTENT_DOWNLOAD_STATUS");

        var param = new Object();
        param.token = TOKEN();
        param.getDownloadResultsDetailsReq = getDownloadResultsDetailsReq;

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