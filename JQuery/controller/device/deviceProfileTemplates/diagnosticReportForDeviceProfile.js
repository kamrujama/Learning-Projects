define(["knockout", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, ADSearchUtil, koUtil) {
    var lang = getSysLang();
    columnSortFilter = new Object();
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function detailActionStatusViewModel() {



        SelectedIdOnGlobale = new Array();
        checkALlPageId = 0;
        pagechangedcheck = 0;
        totalselectedRowCount = 0;

        var self = this;
        self.checksample = ko.observable();
        self.observableModelPopup = ko.observable();
        self.AdvanceTemplateFlag = ko.observable(false);
        self.observableCriteria = ko.observable();

        //For advanced search
        ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridDetailedActionProfile';
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;
        ADSearchUtil.ExportDynamicColumns = [];

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
        //Unload Template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.detailDiagnosticModelPopUp(popupName);
            self.observableModelPopup(popupName);
        };
        //PopUp Functions

        self.detailDiagnosticModelPopUp = ko.observable();
        self.templateFlag = ko.observable(false);
        self.columnlist = ko.observableArray();
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['DeviceActionTypeDisplayName'];
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');

        //For advanced search popup
        self.observableCriteria = ko.observable();
        loadCriteria('modalCriteria', 'genericPopup');
        self.observableAdvancedSearchModelPopup = ko.observable();
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
        ADSearchUtil.deviceSearchObj = new Object();

        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];
        //ADSearchUtil.AdScreenName = 'diagnosticReport';

        ADSearchUtil.initColumnsArr = ["SerialNumber", "Component", "DeviceId", "HierarchyFullPath", "ModelName", "JobName", "JobStatus", "ComputedDeviceStatus", "DeviceActionTypeDisplayName", "Status", "StatusReceivedDate", "ScheduledDate", "OperationExecutionTimeOnDevice", "FullName", "JobCreatedOn", "ActionTasksAdditionalInfo", "LastHeartBeat", "TaskSentDate"];
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
                    if ((koUtil.deviceFamily.toUpperCase() == AppConstants.get('MX_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('VX_FAMILY')) && arr[i].columnfield == "Component") {
                        self.columnlist.remove(arr[i]);
                    }
                    if ($.inArray(arr[i].columnfield, ADSearchUtil.initColumnsArr) < 0) {
                        var source = _.where(ADSearchUtil.localDynamicColumns, { datafield: arr[i].columnfield });
                        if (source == '') {
                            self.columnlist.remove(arr[i]);
                        }
                    }
                }

                //For advanced search popup
                if (ADSearchUtil.resetAddSerchFlag == 'reset') {
                    for (var i = 0; i < ADSearchUtil.newAddedgridColumns.length; i++) {
                        var source = _.where(self.columnlist(), { columnfield: ADSearchUtil.newAddedgridColumns[i].datafield });
                        if (source != '') {
                            self.columnlist.remove(source[0]);
                        }
                    }
                }
                loadelement(popupName, 'genericPopup');
                $('#actionModel').modal('show');
            }
            else if (popupName == "modelExportSucess") {
                loadelement(popupName, 'genericPopup');
                $('#actionModel').modal('show');
            } else if (popupName == 'modelAdvancedSearch') {
                self.AdvanceTemplateFlag(true);
                loadAdvancedSearchModelPopup(popupName, 'genericPopup');
                $('#AdvanceSearchModal').modal('show');
            }
        }

        //for advance search
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

        // ExportToExcel 
        self.exportToExcel = function (isExport, gId) {
            var selectedDetailedActionItems = getSelectedUniqueId(gId);
            var unselectedDetailedActionItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = detailedAtionStatusParameter(true, ADSearchUtil.deviceSearchObj, columnSortFilter, selectedDetailedActionItems, unselectedDetailedActionItems, checkAll, visibleColumnsList);


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
            ajaxJsonCall('GetDiagnosticsResultsDetailsForDeviceProfile', params, callBackfunction, true, 'POST', true);
        }

        ////Grid Call
        var param = detailedAtionStatusParameter(false, ADSearchUtil.deviceSearchObj, columnSortFilter, null, null, 0, []);
        detailedActionStatusGrid('jqxgridDetailedActionProfile', param);

        seti18nResourceData(document, resourceStorage);
    }// ModelView End


    function detailedActionStatusGrid(gID, param) {
       // CallType = ENUM.get("CALLTYPE_WEEK");

        //For Advanced search
        var gridColumns = [];
        
        var isFilter;
        if (isdetailedActionStatusGridFilter == undefined || isdetailedActionStatusGridFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        isdetailedActionStatusGridFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
       // CallType = InitGridStoragObj.CallType;
        var source =
        {
            dataType: "json",
            dataFields: [
                     { name: 'SerialNumber', map: 'DeviceDetail>SerialNumber' },
                     { name: 'TaskId', map: 'TaskId' },
                     { name: 'DeviceId', map: 'TaskDeviceId' },
                     { name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath' ,type: 'string'},
                     { name: 'ModelName', map: 'DeviceDetail>ModelName' },
                     { name: 'JobName', map: 'JobName' },
                     { name: 'JobStatus', map: 'JobStatus' },
                     { name: 'ComputedDeviceStatus', map: 'DeviceDetail>ComputedDeviceStatus' },
                     { name: 'DeviceActionTypeDisplayName', map: 'DeviceActionTypeDisplayName' },
                     { name: 'Status', type: 'Status' },
                     { name: 'StatusReceivedDate', map: 'StatusReceivedDate', type: 'date' },
                     { name: 'ScheduledDate', map: 'ScheduledDate'},
                     { name: 'OperationExecutionTimeOnDevice', map: 'OperationExecutionTimeOnDevice'},
                     { name: 'JobCreatedOn', map: 'JobCreatedOn', type: 'date' },
                     { name: 'FullName', map: 'FullName' },
                     { name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
                     { name: 'ActionTasksAdditionalInfo', map: 'ActionTasksAdditionalInfo' },
                     { name: 'LastHeartBeat', map: 'DeviceDetail>LastHeartBeat', type: 'date' },
                     { name: 'TaskSentDate', map: 'TaskSentDate' },
                     { name: 'isSelected', type: 'number' },
                     { name: 'Component', map: 'Component' },                     
                     { name: 'IsCancelRequestFailed', map: 'IsCancelRequestFailed' },
                     { name: 'AdditionalStatusInfo', map: 'JobDevicesAdditionalInfo' }
            ],

            type: "POST",
            data: param,
            root: 'DiagnosticResult',
            url: AppConstants.get('API_URL') + "/GetDiagnosticsResultsDetailsForDeviceProfile",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data && data.getDiagnosticsResultsDetailsForDeviceProfileResp) {
                    data.getDiagnosticsResultsDetailsForDeviceProfileResp = $.parseJSON(data.getDiagnosticsResultsDetailsForDeviceProfileResp);
                }
                else
                    data.getDiagnosticsResultsDetailsForDeviceProfileResp = [];

                if (data.getDiagnosticsResultsDetailsForDeviceProfileResp && data.getDiagnosticsResultsDetailsForDeviceProfileResp.PaginationResponse) {
                    source.totalrecords = data.getDiagnosticsResultsDetailsForDeviceProfileResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDiagnosticsResultsDetailsForDeviceProfileResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;

                }
            },

        };


        var request =
            {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'DiagnosticsActionDetails');
                    param.getDiagnosticsResultsDetailsForDeviceProfileReq.ColumnSortFilter = columnSortFilter;
                    param.getDiagnosticsResultsDetailsForDeviceProfileReq.Pagination = getPaginationObject(param.getDiagnosticsResultsDetailsForDeviceProfileReq.Pagination, gID);
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    

                    if (data.getDiagnosticsResultsDetailsForDeviceProfileResp && data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult) {
                        for (var i = 0; i < data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult.length; i++) {
                            data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult[i].ScheduledDate = convertToDeviceZonetimestamp(data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult[i].ScheduledDate);
                            data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult[i].OperationExecutionTimeOnDevice = convertToDeviceZonetimestamp(data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult[i].OperationExecutionTimeOnDevice);
                            data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult[i].DeviceDetail.LastHeartBeat = convertToDeviceZonetimestamp(data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult[i].DeviceDetail.LastHeartBeat);
                            data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult[i].TaskSentDate = convertToDeviceZonetimestamp(data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult[i].TaskSentDate);
                            data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult[i].StatusReceivedDate = convertToLocaltimestamp(data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult[i].StatusReceivedDate);
                            data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult[i].JobCreatedOn = convertToLocaltimestamp(data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult[i].JobCreatedOn);
                        }
                    }

                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    if (data.getDiagnosticsResultsDetailsForDeviceProfileResp && data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult) {
                        if (data.getDiagnosticsResultsDetailsForDeviceProfileResp.PaginationResponse) {
                            //if (data.getDiagnosticsResultsDetailsForDeviceProfileResp.PaginationResponse.HighLightedItemPage > 0) {
                            //    gridStorage[0].TotalSelectionCount = data.getDiagnosticsResultsDetailsForDeviceProfileResp.TotalSelectionCount;
                            //    var updatedGridStorage = JSON.stringify(gridStorage);
                            //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            //}
                        } else {
                            source.totalrecords = 0;
                            source.totalpages = 0;
                            data.getDiagnosticsResultsDetailsForDeviceProfileResp = new Object();
                            data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult = [];
                        }

                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getDiagnosticsResultsDetailsForDeviceProfileResp = new Object();
                        data.getDiagnosticsResultsDetailsForDeviceProfileResp.DiagnosticResult = [];
                    }
                    $('.all-disabled').hide();
                }
               
            }
        var dataAdapter = intializeDataAdapter(source, request);




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


        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'TaskId', element, gridStorage, false, 'pagerDivDetailAction', true, 0, 'TaskId', null, null, null);

            return true;
        }

        //for device profile
        function SerialNoRendereDetailAction(row, columnfield, value, defaulthtml, columnproperties) {
            var data = $("#" + gID).jqxGrid('getrowdata', row);

            var href = null;
            return '<div style="padding-left:10px;padding-top:9px;"><a href="index.html#deviceProfile/' + data.UniqueDeviceId + '" style="text-decoration:underline;" title="View Profile" >' + value + '</a></div>'
        }


        // custom tooltip for job status
        var jobStatusToolTipRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = displayTooltipAndIconRenderer(gID, row, column, value, defaultHtml, 2);
            return defaultHtml;
        }

        var deviceStatusToolTipRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml)
            return defaultHtml;
        }

        // tooltip for diagnostice status
        var diagnosticStatusTooltipRenderer = function (row, column, value) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);

            var text = "Status: ";
            var scheduleDate = "Scheduled Date: ";
            var defaultHtml = '';
            var className;
            if (value == "Success") {
                className = "SuccessAction";
            } else if (value == "Failed") {
                className = "Actionfailed";
            }

            // schedule date
            if (value == "Success") {
                if (rowData.ScheduledDate && rowData.ScheduledDate != "") {
                   // defaultHtml += '<div style="padding-left:5px;padding-top:7px;"><span><i class="icon-checkmark" style="color:green"></i></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '\n' + scheduleDate + '' + rowData.ScheduledDate + '">' + value + '</span></div>';
                    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '\n' + scheduleDate + '' + rowData.ScheduledDate + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg ' + className + '"></div></a>' + value + '</span></div>';
                }
            }
            else if (value == "Failed") {
                if (rowData.ScheduledDate && rowData.ScheduledDate != "") {
                    //defaultHtml += '<div style="padding-left:5px;padding-top:7px;"><span><i class="icon-cross" style="color:red"></i></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '\n' + scheduleDate + '' + rowData.ScheduledDate + '">' + value + '</span></div>';
                    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '\n' + scheduleDate + '' + rowData.ScheduledDate + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg ' + className + '"></div></a>' + value + '</span></div>';
                }
            }

            if (rowData) {
                //Hierarchy path
                var hierarchyPath = "HierarchyFullpath: ";
                if (rowData.HierarchyFullPath != null && rowData.HierarchyFullPath != "") {
                    //defaultHtml += '<div style="padding-left:5px;padding-top:7px;"><div class="iconImg ' + className + '"></div><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '\n' + hierarchyPath + '' + rowData.HierarchyFullPath + '">' + value + '</span></div>';
                    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '\n' + hierarchyPath + '' + rowData.HierarchyFullPath + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg ' + className + '"></div></a>' + value + '</span></div>';
                }

                //DeviceActionTypeDisplayName
                var deviceActionType = "Action Type: ";
                if (rowData.DeviceActionTypeDisplayName && rowData.DeviceActionTypeDisplayName != "") {
                    // defaultHtml += '<div style="padding-left:5px;padding-top:7px;"><div class="iconImg ' + className + '"></div><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '\n' + deviceActionType + '' + rowData.DeviceActionTypeDisplayName + '">' + value + '</span></div>';
                    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '\n' + deviceActionType + '' + rowData.DeviceActionTypeDisplayName + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg ' + className + '"></div></a>' + value + '</span></div>';
                }

                //Status
                var status = "Status: ";
                if (rowData.Status && rowData.Status != "") {
                    // defaultHtml += '<div style="padding-left:5px;padding-top:7px;"><div class="iconImg ' + className + '"></div><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '\n' + status + '' + rowData.Status + '">' + value + '</span></div>';
                    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '\n' + status + '' + rowData.Status + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg ' + className + '"></div></a>' + value + '</span></div>';
                }

                //Reason
                var reason = "Reason: ";
                if (rowData.AdditionalStatusInfo && rowData.AdditionalStatusInfo != "") {
                    //defaultHtml += '<div style="padding-left:5px;padding-top:7px;"><div class="iconImg ' + className + '"></div><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalStatusInfo + '">' + value + '</span></div>';
                    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalStatusInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg ' + className + '"></div></a>' + value + '</span></div>';
                }

                //Reason
                var recivedDate = "Status Received Date: ";
                if (rowData.StatusReceivedDate && rowData.StatusReceivedDate != "" && rowData.Status != "Scheduled" && rowData.Status != "Schedule Sent" && rowData.Status != "Schedule Confirmed") {
                    // defaultHtml += '<div style="padding-left:5px;padding-top:7px;"><div class="iconImg ' + className + '"></div><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '\n' + recivedDate + '' + rowData.StatusReceivedDate + '">' + value + '</span></div>';
                    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '\n' + recivedDate + '' + rowData.StatusReceivedDate + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg ' + className + '"></div></a>' + value + '</span></div>';
                }

                //Created By Login Name
                var createdName = "Created By Login Name: ";
                if (rowData.CreatedByUserName && rowData.CreatedByUserName != "") {
                    // defaultHtml += '<div style="padding-left:5px;padding-top:7px;"><div class="iconImg ' + className + '"></div><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '\n' + createdName + '' + rowData.CreatedByUserName + '">' + value + '</span></div>';
                    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + text + '' + value + '\n' + createdName + '' + rowData.CreatedByUserName + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg ' + className + '"></div></a>' + value + '</span></div>';
                }
            }

            return defaultHtml;
        }

        //advance search
        gridColumns = [
             {
                 text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, columntype: 'checkbox', enabletooltips: false,
                 datafield: 'isSelected', hidden: true, width: 40, renderer: function () {
                     return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                 }, rendered: rendered
             },

                   {
                       text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 100, filtertype: "custom", enabletooltips: false, 
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
                       text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 130, filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
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
                       text: i18n.t('job_status', { lng: lang }), datafield: 'JobStatus', editable: false, minwidth: 100,  enabletooltips: false, cellsrenderer: jobStatusToolTipRenderer,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelMultiChoice(filterPanel, datafield, 'Diagnostic Job Status');
                       }
                   },
                   {
                       text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 130,  enabletooltips: false, cellsrenderer: deviceStatusToolTipRenderer,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
                       }
                   },
                   {
                       text: i18n.t('action', { lng: lang }), datafield: 'DeviceActionTypeDisplayName', editable: false, minwidth: 120, 
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanel(filterPanel, datafield);
                       }
                   },
                   {
                       text: i18n.t('Diagnostic_status', { lng: lang }), datafield: 'Status', editable: false, minwidth: 130,  enabletooltips: false, cellsrenderer: diagnosticStatusTooltipRenderer,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelMultiChoice(filterPanel, datafield, 'Diagnostic Action Status');
                       }
                   },
                   {
                       text: i18n.t('status_recieved_date', { lng: lang }), editable: false, datafield: 'StatusReceivedDate', minwidth: 160,  cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);

                       }
                   },
                   {
                       text: i18n.t('action_schedule', { lng: lang }), datafield: 'ScheduledDate', editable: false, minwidth: 160,  cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);

                       }
                   },
                   {
                       text: i18n.t('action_executed_at', { lng: lang }), datafield: 'OperationExecutionTimeOnDevice', editable: false, minwidth: 150,  cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);

                       }
                   },
                    {
                        text: i18n.t('created_by', { lng: lang }), datafield: 'FullName', editable: false, minwidth: 100,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                   {
                       text: i18n.t('createdOn', { lng: lang }), datafield: 'JobCreatedOn', editable: false, minwidth: 160, enabletooltips: false, cellsformat: LONG_DATETIME_GRID_FORMAT,
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);

                       }
                   },
                    {
                        text: i18n.t('additional_info', { lng: lang }), hidden: true, datafield: 'ActionTasksAdditionalInfo', editable: false, minwidth: 120, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                   
                   {
                       text: i18n.t('last_Mgmt_plan', { lng: lang }), hidden: true, datafield: 'TaskSentDate', editable: false, minwidth: 150, filterable: true, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
                       filtertype: "custom",
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
            rowsheight: 32,
            enabletooltips: true,
            rendergridrows: function () {
                return dataAdapter.records;
            },
            ready: function () {
                callOnGridReady(gID, gridStorage, undefined, '');
                var columns = genericHideShowColumn(gID, true, ['ActionTasksAdditionalInfo', 'TaskSentDate']);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                koUtil.gridColumnList.push('LastHeartBeat');
                visibleColumnsList = koUtil.gridColumnList;

                if (koUtil.deviceFamily.toUpperCase() == AppConstants.get('MX_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('VX_FAMILY')) {
                    $("#" + gID).jqxGrid('hidecolumn', 'Component');
                }
            },
            autoshowfiltericon: true,
            columns: gridColumns,
        });//JqxGrid End

        getGridBiginEdit(gID, 'TaskId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'TaskId');

    }//Grid Function End


    function detailedAtionStatusParameter(isExport, deviceSearchObj, columnSortFilter, selectedDetailedActionItems, unselectedDetailedActionItems, checkAll, visibleColumns) {
        var getDiagnosticsResultsDetailsForDeviceProfileReq = new Object();

        //var CallType = new Object();
        var ColumnSortFilter = new Object();

        var Export = new Object();
        var Pagination = new Object();
        var Selector = new Object();
        var UniqueDeviceId = new Object();
        var coulmnfilter = new Object();


        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Export.VisibleColumns = visibleColumns;
        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedDetailedActionItems;
            if (isExport == true) {
                Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
                Export.IsAllSelected = true;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedDetailedActionItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        }

        FilterList = new Array();
        coulmnfilter.ColumnType = null;
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterDays = null;
        coulmnfilter.FilterValue = null;
        coulmnfilter.FilterValueOptional = null;

        FilterList.push(coulmnfilter);
        getDiagnosticsResultsDetailsForDeviceProfileReq.ColumnSortFilter = columnSortFilter;
        getDiagnosticsResultsDetailsForDeviceProfileReq.DeviceId = koUtil.deviceId;
        getDiagnosticsResultsDetailsForDeviceProfileReq.Export = Export;
        getDiagnosticsResultsDetailsForDeviceProfileReq.ModelName = koUtil.ModelName;
        getDiagnosticsResultsDetailsForDeviceProfileReq.Pagination = Pagination;
        getDiagnosticsResultsDetailsForDeviceProfileReq.Selector = Selector;
        getDiagnosticsResultsDetailsForDeviceProfileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

        var param = new Object();
        param.token = TOKEN();
        param.getDiagnosticsResultsDetailsForDeviceProfileReq = getDiagnosticsResultsDetailsForDeviceProfileReq;

        return param;
    }

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