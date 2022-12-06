define(["knockout", "koUtil", "autho", "advancedSearchUtil", "utility"], function (ko, koUtil, autho, ADSearchUtil) {

    var lang = getSysLang();
    columnSortFilterVRKDownloadJob = new Object();
    columnSortFilterModelJob = new Object();
    koUtil.GlobalColumnFilter = new Array();
    koutilLocal = koUtil;
    jobDevicesId = 0;

    return function vrkDownloadjobViewModel() {

        var self = this;

        visibleColumnsListForPopup = new Array();
        $('#btnCancelDownload').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnCancelDownload').click();
            }
        });

        //Draggable function
        $('#mdVRKAdvanceSearchModal').mouseup(function () {
            $("#mdlVRKAdvanceSearch").draggable({ disabled: true });
        });

        $('#mdVRKAdvanceSearchModal').mousedown(function () {
            $("#mdlVRKAdvanceSearch").draggable({ disabled: false });
        });

        $('#mdlVrkDownloadLibraryJobHeader').mouseup(function () {
            $("#mdlVrkDownloadLibraryJob").draggable({ disabled: true });
        });

        $('#mdlVrkDownloadLibraryJobHeader').mousedown(function () {
            $("#mdlVrkDownloadLibraryJob").draggable({ disabled: false });
        });

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            //return false;
            return retval;
        }

        self.serialNumber = ko.observable();
        self.modelName = ko.observable();

        self.templateFlag = ko.observable(false);
        self.AdvanceTemplateFlag = ko.observable(false);

        self.observableCriteria = ko.observable();
        loadCriteria('modalCriteria', 'genericPopup');
        ADSearchUtil.deviceSearchObj = new Object();// Advance Search

        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];
        ADSearchUtil.AdScreenName = 'vrkDownloadJob';
        ADSearchUtil.ExportDynamicColumns = [];
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;
        self.observableAdvancedSearchModelPopup = ko.observable();
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        setMenuSelection();

        ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "ModelName", "ComputedDeviceStatus", "HierarchyFullPath", "JobName", "JobStatus", "BundleName", "BundleFile", "VRKPayload", "DownloadSchedule", "ScheduleInformation", "jobDevicesAdditionalStatusInfo", "SubmittedOn", "IsProcessed", "Tags"];

        self.observableModelComponent = ko.observable();
        self.observableModelpopup = ko.observable();

        self.gridIdForShowHide = ko.observable();
        self.columnlist = ko.observableArray();
        var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'ComputedDeviceStatus', 'HierarchyFullPath', 'BundleName', 'BundleFile', 'IsProcessed'];

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
                if (gridID == "jqxGridVRKResults") {
                    self.columnlist.remove(self.columnlist()[0]);
                    self.columnlist.remove(self.columnlist()[5]);
                }
                else {
                    var arr = self.columnlist();
                    for (var i = 0; i < arr.length; i++) {
                        if ($.inArray(arr[i].columnfield, ADSearchUtil.initColumnsArr) < 0) {
                            var source = _.where(ADSearchUtil.localDynamicColumns, { datafield: arr[i].columnfield });//<!---advance search changes--->
                            if (source == '') {
                                self.columnlist.remove(arr[i]);
                            }
                        }
                    }
                }
                if (ADSearchUtil.resetAddSerchFlag == 'reset') {
                    for (var i = 0; i < ADSearchUtil.newAddedgridColumns.length; i++) {
                        var source = _.where(self.columnlist(), { columnfield: ADSearchUtil.newAddedgridColumns[i].datafield });
                        if (source != '') {
                            self.columnlist.remove(source[0]);
                        }
                    }
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
            $('#jobStautsView').modal('hide');
            checkIsPopUpOPen();
        };

        self.expandCriteria = function () {
            if ($("#deviceCriteriaDiv").hasClass('hide')) {
                $("#deviceCriteriaDiv").removeClass('hide');
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default btn-xs"  role="button" tabindex="0"  title="Collapse"><i class="icon-angle-up"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            } else {
                $("#deviceCriteriaDiv").addClass('hide')
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default btn-xs"  role="button" tabindex="0"  title="Expand"><i class="icon-angle-down"></i></a>';
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
            $('#' + gridID).jqxGrid('render');
            $('#' + modelPopup).modal('hide');
            isPopUpOpen = false;
         }
       
        //export to excel
        self.exportToExcel = function (isExport, gridID) {

            var selectedDownloadJobItems = getSelectedUniqueId(gridID);
            var unselectedDownloadJobItems = getUnSelectedUniqueId(gridID);
            var checkAll = checkAllSelected(gridID);
            var datainfo = $("#" + gridID).jqxGrid('getdatainformation');
            if (gridID == "jqxgridVRKDownloadJob") {
                visibleColumnsList = GetExportVisibleColumn(gridID);
                var param = getVRKDownloadJobStatusParameters(true, columnSortFilterVRKDownloadJob, selectedDownloadJobItems, ADSearchUtil.deviceSearchObj, unselectedDownloadJobItems, checkAll, visibleColumnsList);

                if (datainfo.rowscount > 0) {
                    VRKdownloadJobExport(param, gridID, self.openPopup);
                } else {
                    openAlertpopup(1, 'no_data_to_export');
                }
            } else {

                var param = getModelVRKDownloadResultDetials(true, columnSortFilterModelJob, jobDevicesId, visibleColumnsListForPopup);
                if (datainfo.rowscount > 0) {
                    modelVRKDownloadJobExport(param);
                }
                else {
                    openAlertpopup(1, 'no_data_to_export');
                }
            }
        }

        // cancel job status
        self.cancelJobStatus = function (popupName, gridID) {
            var selectedJobID = getMultiSelectedData(gridID);
            var checkAll = checkAllSelected(gridID);
            if (checkAll == 1) {
                self.openPopup(popupName, gridID);
            } else {
                if (selectedJobID.length == 1 || selectedJobID.length > 1) {
                    self.openPopup(popupName, gridID);
                } else if (selectedJobID.length == 0) {
                    openAlertpopup(1, 'please_select_atleast_one_job_for_cancellation');
                    return;
                }
            }

        }

        var param = getVRKDownloadJobStatusParameters(false, columnSortFilterVRKDownloadJob, null, ADSearchUtil.deviceSearchObj, null, 0, []);
        getVRKDownloadJobGridDetails('jqxgridVRKDownloadJob', param, self.observableAdvancedSearchModelPopup, self.columnlist);
        ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridVRKDownloadJob';
        seti18nResourceData(document, resourceStorage);
    }

    function VRKdownloadJobExport(param, gridID, openPopup) {

        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(1, 'export_Sucess');
                } 
            }
        }

        var method = 'GetVRKJobSummary';
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

    function getVRKDownloadJobGridDetails(gID, param, modelPopup, columnlist) {
        var gridColumns = [];
        var initfieldsArr = [];
        var DynamicColumns = [];
        var sourceDataFieldsArr = [
                { name: 'isSelected', type: 'number' },
                { name: 'JobDevicesId', map: 'JOBDEVICESID' },
                { name: 'UniqueDeviceId', map: 'UNIQUEDEVICEID' },
                { name: 'SerialNumber', map: 'SERIALNUMBER' },
                { name: 'DeviceId', map: 'DEVICEID' },
                { name: 'HierarchyFullPath', map: 'HIERARCHYFULLPATH', type: 'string' },
                { name: 'ModelName', map: 'MODELNAME' },
                { name: 'ComputedDeviceStatus', map: 'COMPUTEDDEVICESTATUS' },
                { name: 'Tags', map: 'TAGS' },
                { name: 'JobName', map: 'JOBNAME' },
                { name: 'JobStatus', map: 'COMPJOBSTATUS' },
                { name: 'BundleName', map: 'BUNDLENAME' },
                { name: 'BundleFile', map: 'BUNDLEFILE' },
                { name: 'VRKPayload', map: 'PACKAGENAME' },
                { name: 'DownloadSchedule', map: 'SCHEDULEDDATE' },
                { name: 'ScheduleInformation', map: 'SCHEDULEINFORMATION' },
                { name: 'jobDevicesAdditionalStatusInfo', map: 'JOBDEVICESADDITIONALSTATUSINFO' },
                { name: 'SubmittedOn', map: 'SUBMITTEDON', type: 'date' },
                { name: 'IsProcessed', map: 'ISPROCESSED' },
                { name: 'LastHeartBeat', map: 'LASTHEARTBEAT', type: 'date' },
                { name: 'IsJobCancelAllowed', map: 'ISCANCELALLOWED' }
        ];

        var InitGridStoragObj = initGridStorageObj(gID,ENUM.get("CALLTYPE_DAY"));
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

        var source = {
            dataType: 'json',
            dataFields: sourceDataFieldsArr,
            root: 'VRKBundleDetails',
            type: 'POST',
            data: param,
            url: AppConstants.get('API_URL') + "/GetVRKJobSummary",
            contentType: 'application/json',
            beforeprocessing: function (data) {

                if (data && data.getVRKJobSummaryResp) {
                    data.getVRKJobSummaryResp = $.parseJSON(data.getVRKJobSummaryResp);
                }
                else
                    data.getVRKJobSummaryResp=[];

                if (data.getVRKJobSummaryResp && data.getVRKJobSummaryResp.PaginationResponse) {
                    source.totalrecords = data.getVRKJobSummaryResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getVRKJobSummaryResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
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
                   var columnSortFilter = new Object();
                   columnSortFilter = columnSortFilterFormatedData(columnSortFilterVRKDownloadJob, gID, gridStorage, 'VRKJobSummary', 'SubmittedOn');
                   param.getVRKJobSummaryReq.ColumnSortFilter = columnSortFilter;
                   koUtil.GlobalColumnFilter = columnSortFilter;
                   param.getVRKJobSummaryReq.CallType = CallType;

                   updatepaginationOnState(gID, gridStorage, param.getVRKJobSummaryReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage, param.getVRKJobSummaryReq.CallType);

                   var customData =JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
                   
                   if (customData) {
                       ADSearchUtil.deviceSearchObj = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
                       ADSearchUtil.SearchText = sessionStorage.getItem(gID + 'CustomSearchText');
                       $("#deviceCriteriaDiv").empty();
                       $("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
                       $("#criteriabtnDiv").css("display","block");
                   }
                       param.getVRKJobSummaryReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                       param.getVRKJobSummaryReq.Pagination = getPaginationObject(param.getVRKJobSummaryReq.Pagination, gID);
                      
                   data = JSON.stringify(param);
                   return data;
               },
               downloadComplete: function (data, status, xhr) {
                   //if (data && data.getVRKJobSummaryResp) {
                   //    data.getVRKJobSummaryResp = $.parseJSON(data.getVRKJobSummaryResp);
                   //}

                   if (data) {
                       if (data.getVRKJobSummaryResp && data.getVRKJobSummaryResp.VRKBundleDetails) {
                          for (var i = 0; i < data.getVRKJobSummaryResp.VRKBundleDetails.length; i++) {
                              data.getVRKJobSummaryResp.VRKBundleDetails[i].SCHEDULEDDATE = convertToDeviceZonetimestamp(data.getVRKJobSummaryResp.VRKBundleDetails[i].SCHEDULEDDATE);                               
                               //data.getVRKJobSummaryResp.VRKBundleDetails[i].ScheduledInstallDate = convertToDeviceZonetimestamp(data.getVRKJobSummaryResp.VRKBundleDetails[i].ScheduledInstallDate);
                               data.getVRKJobSummaryResp.VRKBundleDetails[i].SUBMITTEDON = convertToLocaltimestamp(data.getVRKJobSummaryResp.VRKBundleDetails[i].SUBMITTEDON);

                           }
                       }

                       enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                       if (data.getVRKJobSummaryResp) {
                           initfieldsArr = sourceDataFieldsArr;

                           ADSearchUtil.localDynamicColumns = [];//<!---advance search changes--->
                           if (data.getVRKJobSummaryResp) {
                               if (data.getVRKJobSummaryResp.DynamicColumns) {
                                   DynamicColumns = data.getVRKJobSummaryResp.DynamicColumns;
                                   for (var i = 0; i < data.getVRKJobSummaryResp.DynamicColumns.length; i++) {
                                       var FieldSource = _.where(sourceDataFieldsArr, { name: data.getVRKJobSummaryResp.DynamicColumns[i].AttributeName });
                                       if (FieldSource == '') {
                                           var dynamicObj = new Object();
                                           dynamicObj.name = data.getVRKJobSummaryResp.DynamicColumns[i].AttributeName;
                                           dynamicObj.map = data.getVRKJobSummaryResp.DynamicColumns[i].AttributeName.toUpperCase();
                                           if (data.getVRKJobSummaryResp.DynamicColumns[i].ControlType == 'Date') {
                                               dynamicObj.type = 'date';
                                           }
                                           ADSearchUtil.newAddedDataFieldsArr.push(dynamicObj);
                                           var exportDynamicColumns = new Object();
                                           exportDynamicColumns.AttributeName = data.getVRKJobSummaryResp.DynamicColumns[i].AttributeName;
                                           exportDynamicColumns.AttributeType = data.getVRKJobSummaryResp.DynamicColumns[i].AttributeType;
                                           exportDynamicColumns.ControlType = data.getVRKJobSummaryResp.DynamicColumns[i].ControlType;
                                           exportDynamicColumns.DisplayName = data.getVRKJobSummaryResp.DynamicColumns[i].DisplayName;
                                           exportDynamicColumns.FilterSource = data.getVRKJobSummaryResp.DynamicColumns[i].FilterSource;
                                           exportDynamicColumns.IsCustomAttribute = data.getVRKJobSummaryResp.DynamicColumns[i].IsCustomAttribute;
                                           exportDynamicColumns.IsInDeviceTimeZone = data.getVRKJobSummaryResp.DynamicColumns[i].IsInDeviceTimeZone;
                                           ADSearchUtil.ExportDynamicColumns.push(exportDynamicColumns);
                                       }

                                       var ColumnSource = _.where(gridColumns, { datafield: data.getVRKJobSummaryResp.DynamicColumns[i].AttributeName });

                                       var coulmnObj = new Object();
                                       coulmnObj.text = i18n.t(data.getVRKJobSummaryResp.DynamicColumns[i].DisplayName, { lng: lang });
                                       coulmnObj.datafield = data.getVRKJobSummaryResp.DynamicColumns[i].AttributeName;
                                       coulmnObj.editable = false;
                                       coulmnObj.minwidth = 200;
                                       coulmnObj.width = 'auto';
                                       coulmnObj.enabletooltips = true;
                                       if (data.getVRKJobSummaryResp.DynamicColumns[i].ControlType == 'Date') {
                                           coulmnObj.cellsformat = LONG_DATETIME_GRID_FORMAT;
                                       }
                                       coulmnObj.filtertype = "custom";
                                       if (data.getVRKJobSummaryResp.DynamicColumns[i].ControlType == 'TextBox') {
                                           coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
                                       } else if (data.getVRKJobSummaryResp.DynamicColumns[i].ControlType == 'MultiCombo' || data.getVRKJobSummaryResp.DynamicColumns[i].ControlType == 'Combo') {
                                           coulmnObj.createfilterpanel = function (datafield, filterPanel) {
                                               var FilterSource = AppConstants.get(datafield);
                                               buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource);
                                           };
                                       } else if (data.getVRKJobSummaryResp.DynamicColumns[i].ControlType == 'Date') {
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
                           }
                          
                           source.dataFields = sourceDataFieldsArr;
                       }
                       if (data.getVRKJobSummaryResp && data.getVRKJobSummaryResp.VRKBundleDetails) {
                           if (data.getVRKJobSummaryResp.TotalSelectionCount != 'undefined') {
                               gridStorage[0].TotalSelectionCount = data.getVRKJobSummaryResp.TotalSelectionCount;
                               var updatedGridStorage = JSON.stringify(gridStorage);
                               window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                           }
                           if (data.getVRKJobSummaryResp.PaginationResponse) {
                               //if (data.getVRKJobSummaryResp.PaginationResponse.HighLightedItemPage > 0) {
                               //    gridStorage[0].highlightedPage = data.getVRKJobSummaryResp.PaginationResponse.HighLightedItemPage;
                               //    var updatedGridStorage = JSON.stringify(gridStorage);
                               //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                               //}
                           } else {

                           }
                       } else {
                           data.getVRKJobSummaryResp = new Object();
                           data.getVRKJobSummaryResp.VRKBundleDetails = [];
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

        // display image when IsNoteExist true
        var resultsRender = function (row, columnfield, value, defaulthtml, columnproperties) {
            if (value == true) {
                return '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"> <a title="Click to view Download Details"  id="imageId2" tabindex="0" style="text-decoration:underline;" onClick="openIconPopupVRKdownloadjob(' + row + ')" height="60" width="50" >View Results</a></div>'
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
            var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
            return html;
        }

        var deviceStatusRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }

        //for Reason for Failure
        function reasonForFailureStatus(row, columnfield, value, defaulthtml, columnproperties) {
            var JobStatus = $("#" + gID).jqxGrid('getcellvalue', row, 'JobStatus');
            var jobDevicesAdditionalStatusInfo = $("#" + gID).jqxGrid('getcellvalue', row, 'jobDevicesAdditionalStatusInfo');

            if (JobStatus == 'Download Failed' || JobStatus == 'Install Failed' || JobStatus == 'Failed') {
                return '<div style="padding-left:5px;padding-top:5px;text-overflow: ellipsis;overflow:hidden;"><span>' + jobDevicesAdditionalStatusInfo + '</span></div>';
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

        var unixdateRendererSubmittedOn = function (row, columnfield, value, defaulthtml, columnproperties) {

            if (value != "") {
                var localTime1 = moment(value)
                localTime1 = moment(localTime1).format(LONG_DATETIME_FORMAT_AMPM);
                return '<div style="padding-left:5px;padding-top:7px;"><span style="padding-left:5px;padding-top:7px;">' + localTime1 + '</span></div>';
            }
            else {
                return '';
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
                    {
                        text: i18n.t('serial', { lng: lang }), dataField: 'SerialNumber', editable: false, minwidth: 120, width: 'auto', enabletooltips: false, cellsrenderer: SerialNoRendereDownloadJobStatus,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('device_id', { lng: lang }), dataField: 'DeviceId', editable: false, minwidth: 120, width: 'auto', enabletooltips: false, cellsrenderer: SerialNoRendereDownloadJobStatus,
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
                        text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 150, enabletooltips: false,
                        filtertype: "custom", cellsrenderer: deviceStatusRenderer,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
                        }
                    },
                    {
                        text: i18n.t('hierarchy_path', { lng: lang }), dataField: 'HierarchyFullPath', editable: false, minwidth: 180, width: 'auto', cellsrenderer: HierarchyPathRenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    
                    {
                        text: i18n.t('tags', { lng: lang }), dataField: 'Tags', editable: false, minwidth: 100, width: 'auto', enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('job_name', { lng: lang }), dataField: 'JobName', editable: false, minwidth: 160, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('job_status', { lng: lang }), dataField: 'JobStatus', editable: false, minwidth: 160, width: 'auto', enabletooltips: false, cellsrenderer: toolTipRenderer,//toolTipRenderer
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'VRK Job Status');
                        }
                    },
                    {
                        text: i18n.t('vrkBundle_SubmittedOn', { lng: lang }), datafield: 'SubmittedOn', filter: initialColumnFilter, editable: false, minwidth: 180, width: 'auto', cellsformat: LONG_DATETIME_GRID_FORMAT,
                            filtertype: "custom",
                            createfilterpanel: function(datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
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
                        text: i18n.t('vrkBundle_Bundle_File', { lng: lang }), dataField: 'BundleFile', editable: false, minwidth: 150, width: 'auto', filterable: true,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('vrkBundle_vrkPayload', { lng: lang }), dataField: 'VRKPayload', editable: false, minwidth: 150, width: 'auto', filterable: true,
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
                    {
                        text: i18n.t('schedule_information', { lng: lang }), datafield: 'ScheduleInformation', editable: false, minwidth: 170, width: 'auto', menu: false, sortable: false, filterable: false
                    },
                    {
                        text: i18n.t('vrkReasonForFailure', { lng: lang }), dataField: 'jobDevicesAdditionalStatusInfo', editable: false, minwidth: 130, width: 'auto', cellsrenderer: reasonForFailureStatus,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },                    
                    { text: i18n.t('results', { lng: lang }), datafield: 'IsProcessed', editable: false, minwidth: 100, width: 'auto', menu: false, sortable: false, enabletooltips: false, resizable: false, filterable: false, cellsrenderer: resultsRender },
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
                columnsResize: true,
                columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                enabletooltips: true,
                rowsheight: 32,
                autoshowfiltericon: true,
                rendergridrows: function () {
                    return dataAdapter.records;
                },
                ready: function () {
                    // CallType = addDefaultfilter(CallType, 'JobCreatedOn', gID)
                   // callOnGridReady(gID, gridStorage);
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
                            if (ADSearchUtil.newAddedgridColumns[k].datafield != undefined) {
                                ADSearchUtil.newAddedgridColumns[k].dataField = ADSearchUtil.newAddedgridColumns[k].datafield;
                            }
                            var FieldSource = _.where(gridColumns, { dataField: ADSearchUtil.newAddedgridColumns[k].datafield });
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
                    callOnGridReady(gID, gridStorage, CallType, 'SubmittedOn');
                    var columns = genericHideShowColumn(gID, true, ['IsProcessed']);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                    visibleColumnsList.push('LastHeartBeat');
                },
                columns: gridColumns
            });

        getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'JobDevicesId');                 
    }

    function getVRKDownloadJobStatusParameters(isExport, columnSortFilterVRKDownloadJob, selectedDownloadJobItems, deviceSearchObj, unselectedDownloadJobItems, checkAll, visibleColumns) {

        var getVRKJobSummaryReq = new Object();
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

        var ColumnSortFilter = columnSortFilterVRKDownloadJob;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getVRKJobSummaryReq.ColumnSortFilter = ColumnSortFilter;
        getVRKJobSummaryReq.DeviceSearch = deviceSearchObj;
        getVRKJobSummaryReq.UniqueDeviceId = 0;
        getVRKJobSummaryReq.CallType = CallType;
        getVRKJobSummaryReq.Export = Export;
        getVRKJobSummaryReq.Pagination = Pagination;
        getVRKJobSummaryReq.Selector = Selector;

        var param = new Object();
        param.token = TOKEN();
        param.getVRKJobSummaryReq = getVRKJobSummaryReq;

        return param;
    }

});

// click on view result open popup for download job status
function openIconPopupVRKdownloadjob(row) {
   // $("#jqxgridVRKDownloadJob").jqxGrid('selectrow', row);
    $('#modelVRKResults').modal('show');
    $('#VRKResultsDiv').html('<div id="jqxGridVRKResults"></div><div id="pagerDivVRKResults"></div>');
    GetVRKDownloadResults(row);
}

function GetVRKDownloadResults(row) {

    var self = this;
    self.serialNumber = $("#jqxgridVRKDownloadJob").jqxGrid('getcellvalue', row, 'SerialNumber');
    self.modelName = $("#jqxgridVRKDownloadJob").jqxGrid('getcellvalue', row, 'ModelName');
    jobDevicesId = $("#jqxgridVRKDownloadJob").jqxGrid('getcellvalue', row, 'JobDevicesId');

    $("#modelName").empty();
    $("#serialNumber").empty();
    $("#modelName").append(self.modelName);
    $("#serialNumber").append(self.serialNumber);

    //grid display       
    var param = getModelVRKDownloadResultDetials(false, columnSortFilterModelJob, jobDevicesId, visibleColumnsListForPopup);
    getModalVRKJobResults('jqxGridVRKResults', param);
}

function modelVRKDownloadJobExport(param) {

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

function getModalVRKJobResults(gID, param) {
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
        enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, false, 'pagerDivVRKResults', true, 0, 'JobDevicesId', null, null, null);
        $('.jqx-grid-pager').css("display", "none")
        return true;
    }

    var statusTooltipRenderer = function (row, column, value, defaultHtml) {
        defaultHtml = displayTooltipIconRendererForViewResults(gID, row, column, value, defaultHtml);
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
            height: gridHeightFunction(gID, "1"),
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
            rowsheight: 32,
            enabletooltips: true,
            rendergridrows: function () {
                return dataAdapter.records;
            },
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
                    text: i18n.t('Download_Status_lbl', { lng: lang }), dataField: 'Status', enabletooltips: false, editable: false, minwidth: 200, width: 'auto', cellsrenderer: statusTooltipRenderer,
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

function getModelVRKDownloadResultDetials(isExport, columnSortFilterModelJob, jobDevicesId, visibleColumns) {

    var getVRKDownloadResultsReq = new Object();
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
   
    getVRKDownloadResultsReq.ColumnSortFilter = ColumnSortFilter;
    getVRKDownloadResultsReq.Export = Export;
    getVRKDownloadResultsReq.JobDevicesId = jobDevicesId;
    getVRKDownloadResultsReq.Pagination = Pagination;

    var param = new Object();
    param.token = TOKEN();
    param.getVRKDownloadResultsReq = getVRKDownloadResultsReq;

    return param;
}


