define(["knockout", "autho", "koUtil", "advancedSearchUtil"], function (ko, autho, koUtil, ADSearchUtil) {
    var lang = getSysLang();
    columnSortFilterContentJob = new Object();
    columnSortFilterModelJob = new Object();
    koUtil.GlobalColumnFilter = new Array();

    jobDevicesId = 0;
    return function DashBoardViewModel() {

      
        var self = this;

        //Draggable function
        $('#mdlAdvancedForContentJobHeader').mouseup(function () {
            $("#AdvanceSearchModalContent").draggable({ disabled: true });
        });

        $('#mdlAdvancedForContentJobHeader').mousedown(function () {
            $("#AdvanceSearchModalContent").draggable({ disabled: false });
        });

        $('#mdlContentJobHeader').mouseup(function () {
            $("#openContentModelContent").draggable({ disabled: true });
        });

        $('#mdlContentJobHeader').mousedown(function () {
            $("#openContentModelContent").draggable({ disabled: false });
        });
        /////////

        //Check Rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }


        self.templateFlag = ko.observable(false);

        self.observableModelComponent = ko.observable();
        self.observableModelPopup = ko.observable();

        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'ComputedDeviceStatus', 'HierarchyFullPath', 'PackageName', 'ContentName', 'FileSize', 'results'];
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
        ADSearchUtil.AdScreenName = 'contentJobStatus';
        ADSearchUtil.ExportDynamicColumns = [];

        setMenuSelection();

        //For advanced search
        ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridContentJob';
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;

        ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "ModelName", "ComputedDeviceStatus", "HierarchyFullPath", "JobName", "JobStatus", "Package", "Tags", "ScheduleDate", "ScheduledInstallDate", "ScheduledReplaceDate", "ScheduleInformation", "JobCreatedBy", "JobCreatedOn", "results", "ContentName", "Status", "StartTime", "DownloadDuration", "InstalledDate", "ExpiredDate", "File", "FileSize", "FullName"];
      
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

                var arr = self.columnlist();
                for (var i = 0; i < arr.length; i++) {
                    if ($.inArray(arr[i].columnfield, ADSearchUtil.initColumnsArr) < 0) {

                        var source = _.where(ADSearchUtil.localDynamicColumns, { datafield: arr[i].columnfield });
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

        //unload template
        self.unloadTempPopup = function (popupName, gridID, exportflage) {
            self.observableModelComponent('unloadTemplate');
            self.observableModelPopup('unloadTemplate');
            $('#modelcloseShowHide').modal('hide');
            $('#contentModelID').modal('hide');
        };

        // reset filter
        self.clearfilter = function (gridID) {

            var gridStorage = JSON.parse(sessionStorage.getItem(gridID + "gridStorage"));
            gridStorage[0].CallType = ENUM.get("CALLTYPE_NONE");
            CallType = gridStorage[0].CallType;
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gridID + 'gridStorage', updatedGridStorage);
            ///end

            //CallType = ENUM.get("CALLTYPE_NONE");
            gridFilterClear(gridID);
        }

        // refresh grid
        self.refreshGrid = function (gridID) {
            gridRefresh(gridID);
        }

        //close popup
        self.closeOpenModel = function (gridID, modelPopup) {
            $('#' + gridID).jqxGrid('render');
            $('#' + modelPopup).modal('hide');
            isPopUpOpen = false;
            $("#openContentModelContent").css('left', '');
            $("#openContentModelContent").css('top', '');
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
            repositionAdvanceSearchPopUp("AdvanceSearchModalContent");
            ClearAdSearch = 0;
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            $("#AdvanceSearchModal").modal('hide');
            $("#mainPageBody").removeClass('modal-open-appendon');
            isAdpopup = '';
        }
        self.clearAdvancedSearch = function () {
            repositionAdvanceSearchPopUp("AdvanceSearchModalContent");
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

            if (gridID == "jqxgridContentJob") {
                visibleColumnsList = GetExportVisibleColumn(gridID);
                var param = getContentJobStatusParameters(true, columnSortFilterContentJob, ADSearchUtil.deviceSearchObj, selectedContentJobItems, unselectedContentJobItems, checkAll, visibleColumnsList);

                if (datainfo.rowscount > 0) {
                    contentJobExport(param, gridID, self.openPopup);
                } else {
                    openAlertpopup(1, 'no_data_to_export');
                }
            } else {
                var param = getModelContentResultDetials(true, columnSortFilterModelJob, jobDevicesId, visibleColumnsListForPopup);
                if (datainfo.rowscount > 0) {
                    modelContentJobExport(param);
                }
                else {
                    openAlertpopup(1, 'no_data_to_export');
                }
            }
        }

        //grid call declare
        var param = getContentJobStatusParameters(false, columnSortFilterContentJob, ADSearchUtil.deviceSearchObj, null, null, 0, []);
        getContentJobGridDetails('jqxgridContentJob', param, self.observableAdvancedSearchModelPopup);

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

    function contentJobExport(param, gridID, openPopup) {

        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(1, 'export_Sucess');
                } 
            }
        }

        var method = 'GetDownloadJobSummary';
        var params = JSON.stringify(param);
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getContentJobGridDetails(gID, param, modelPopup) {
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

        var gridColumns = [];
        var DynamicColumns = [];
        var initfieldsArr = [];
        var sourceDataFieldsArr = [
                { name: 'isSelected', type: 'number' },
                { name: 'JobDevicesId', map: 'JOBDEVICESID' },
                { name: 'UniqueDeviceId', map: 'UNIQUEDEVICEID' },
                { name: 'SerialNumber', map: 'SERIALNUMBER' },
                { name: 'DeviceId', map: 'TASKDEVICEID' },
                { name: 'HierarchyFullPath', map: 'HIERARCHYFULLPATH' ,type: 'string'},
                { name: 'ModelName', map: 'MODELNAME' },
                { name: 'ComputedDeviceStatus', map: 'COMPUTEDDEVICESTATUS' },
                { name: 'JobName', map: 'JOBNAME' },
                { name: 'JobStatus', map: 'COMPJOBSTATUS' },
                { name: 'Package', map: 'ACTIONSVERBOSE' },
                { name: 'Tags', map: 'TAGS' },
                { name: 'ScheduleDate', map: 'SCHEDULEDDATE' },
                { name: 'ScheduledInstallDate', map: 'SCHEDULEDINSTALLDATE' },
                { name: 'ScheduledReplaceDate', map: 'SCHEDULEDREPLACEDATE' },
                { name: 'ScheduleInformation', map: 'SCHEDULEINFORMATION' },
                { name: 'JobCreatedBy', map: 'JOBCREATEDBYUSERNAME' },
                { name: 'JobCreatedOn', map: 'JOBCREATEDON', type: 'date' },
                { name: 'FullName', map: 'FULLNAME' },
                { name: 'IsJobCancelAllowed', map: 'ISJOBCANCELALLOWED' },
                { name: 'IsCancelRequestFailed', map: 'ISCANCELREQUESTFAILED' },
                { name: 'AdditionalStatusInfo', map: 'JOBDEVICESADDITIONALSTATUSINFO' }
        ];
        var updatedGridColumn = [];

        var InitGridStoragObj = initGridStorageObj(gID, ENUM.get("CALLTYPE_DAY"));
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var source = {
            dataType: 'json',
            dataFields: sourceDataFieldsArr,
            root: 'DownloadJobs',
            type: 'POST',
            data: param,
            url: AppConstants.get('API_URL') + "/GetDownloadJobSummary",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getDownloadJobSummaryResp)
                    data.getDownloadJobSummaryResp = $.parseJSON(data.getDownloadJobSummaryResp);
                else
                    data.getDownloadJobSummaryResp = [];
                if (data.getDownloadJobSummaryResp && data.getDownloadJobSummaryResp.PaginationResponse) {
                    source.totalrecords = data.getDownloadJobSummaryResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDownloadJobSummaryResp.PaginationResponse.TotalPages;

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

                   columnSortFilter = columnSortFilterFormatedData(columnSortFilterContentJob, gID, gridStorage, 'contentJobStatusReport', 'JobCreatedOn');

                   koUtil.GlobalColumnFilter = columnSortFilter;
                   param.getDownloadJobSummaryReq.ColumnSortFilter = columnSortFilter;
                   
                   param.getDownloadJobSummaryReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                   param.getDownloadJobSummaryReq.CallType = CallType;
                   param.getDownloadJobSummaryReq.Pagination = getPaginationObject(param.getDownloadJobSummaryReq.Pagination, gID);

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

                   updatepaginationOnState(gID, gridStorage, param.getDownloadJobSummaryReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage, param.getDownloadJobSummaryReq.CallType);
                   
                   var customData =JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
                   if (customData) {
                       ADSearchUtil.deviceSearchObj = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
                       ADSearchUtil.SearchText = sessionStorage.getItem(gID + 'CustomSearchText');
                       $("#deviceCriteriaDiv").empty();
                       $("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
                   }
                   param.getDownloadJobSummaryReq.DeviceSearch = ADSearchUtil.deviceSearchObj;

                   data = JSON.stringify(param);
                   return data;
               },
               downloadComplete: function (data, status, xhr) {
                   if (data) {
                       
                       if (data.getDownloadJobSummaryResp && data.getDownloadJobSummaryResp.DownloadJobs) {
                           for (var i = 0; i < data.getDownloadJobSummaryResp.DownloadJobs.length; i++) {
                               data.getDownloadJobSummaryResp.DownloadJobs[i].SCHEDULEDDATE = convertToDeviceZonetimestamp(data.getDownloadJobSummaryResp.DownloadJobs[i].SCHEDULEDDATE);
                               data.getDownloadJobSummaryResp.DownloadJobs[i].SCHEDULEDINSTALLDATE = convertToDeviceZonetimestamp(data.getDownloadJobSummaryResp.DownloadJobs[i].SCHEDULEDINSTALLDATE);
                               data.getDownloadJobSummaryResp.DownloadJobs[i].SCHEDULEDREPLACEDATE = convertToDeviceZonetimestamp(data.getDownloadJobSummaryResp.DownloadJobs[i].SCHEDULEDREPLACEDATE);
                               data.getDownloadJobSummaryResp.DownloadJobs[i].JOBCREATEDON = convertToLocaltimestamp(data.getDownloadJobSummaryResp.DownloadJobs[i].JOBCREATEDON);
                           }
                       }

                       //For Advanced Search
                       initfieldsArr = sourceDataFieldsArr;

                       ADSearchUtil.localDynamicColumns = [];///

                       if (data.getDownloadJobSummaryResp) {
                           if (data.getDownloadJobSummaryResp.DynamicColumns) {
                               DynamicColumns = data.getDownloadJobSummaryResp.DynamicColumns;
                               for (var i = 0; i < data.getDownloadJobSummaryResp.DynamicColumns.length; i++) {
                                   var FieldSource = _.where(sourceDataFieldsArr, { name: data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeName });
                                   if (FieldSource == '') {
                                       var dynamicObj = new Object();
                                       dynamicObj.name = data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeName;
                                       dynamicObj.map = data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeName.toUpperCase();
                                       if (data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType == 'Date') {
                                           dynamicObj.type = 'date';
                                       }
                                       ADSearchUtil.newAddedDataFieldsArr.push(dynamicObj);
                                       var exportDynamicColumns = new Object();
                                       exportDynamicColumns.AttributeName = data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeName;
                                       exportDynamicColumns.AttributeType = data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeType;
                                       exportDynamicColumns.ControlType = data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType;
                                       exportDynamicColumns.DisplayName = data.getDownloadJobSummaryResp.DynamicColumns[i].DisplayName;
                                       exportDynamicColumns.FilterSource = data.getDownloadJobSummaryResp.DynamicColumns[i].FilterSource;
                                       exportDynamicColumns.IsCustomAttribute = data.getDownloadJobSummaryResp.DynamicColumns[i].IsCustomAttribute;
                                       exportDynamicColumns.IsInDeviceTimeZone = data.getDownloadJobSummaryResp.DynamicColumns[i].IsInDeviceTimeZone;
                                       ADSearchUtil.ExportDynamicColumns.push(exportDynamicColumns);
                                   }
                                   var ColumnSource = _.where(gridColumns, { datafield: data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeName });

                                   var coulmnObj = new Object();
                                   coulmnObj.text = i18n.t(data.getDownloadJobSummaryResp.DynamicColumns[i].DisplayName, { lng: lang });
                                   coulmnObj.datafield = data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeName;
                                   coulmnObj.editable = false;
                                   coulmnObj.minwidth = 200;
                                   coulmnObj.width = 'auto';
                                   coulmnObj.enabletooltips = true;
                                   if (data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType == 'Date') {
                                       coulmnObj.cellsformat = LONG_DATETIME_GRID_FORMAT;
                                   }
                                   coulmnObj.filtertype = "custom";
                                   if (data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType == 'TextBox') {
                                       coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
                                   } else if (data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType == 'MultiCombo' || data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType == 'Combo') {
                                       coulmnObj.createfilterpanel = function (datafield, filterPanel) {
                                           var FilterSource = AppConstants.get(datafield);
                                           buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource);
                                       };
                                   } else if (data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType == 'Date') {
                                       coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanelDate(filterPanel, datafield); };

                                   }
                                   ////////
                                   if (ColumnSource == '') {
                                       ADSearchUtil.newAddedgridColumns.push(coulmnObj);
                                   }
                                   ADSearchUtil.localDynamicColumns.push(coulmnObj);
                                   //////
                               }
                           }
                       }

                       
                       source.dataFields = sourceDataFieldsArr;
                       ///////End
                       enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                       if (data.getDownloadJobSummaryResp && data.getDownloadJobSummaryResp.DownloadJobs) {
                           if (data.getDownloadJobSummaryResp.TotalSelectionCount != 'undefined') {

                               gridStorage[0].TotalSelectionCount = data.getDownloadJobSummaryResp.TotalSelectionCount;
                               var updatedGridStorage = JSON.stringify(gridStorage);
                               window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                           }
                           if (data.getDownloadJobSummaryResp.PaginationResponse) {
                               //if (data.getDownloadJobSummaryResp.PaginationResponse.HighLightedItemPage > 0) {
                               //    //for (var h = 0; h < data.getDownloadJobSummaryResp.DownloadJobs.length; h++) {
                               //        //if (data.getDownloadJobSummaryResp.DownloadJobs[h].JobDevicesId == data.getDownloadJobSummaryResp.PaginationResponse.HighLightedItemId) {
                               //            gridStorage[0].highlightedPage = data.getDownloadJobSummaryResp.PaginationResponse.HighLightedItemPage;
                               //            var updatedGridStorage = JSON.stringify(gridStorage);
                               //            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                               //       // }
                               //    //}
                               //} else {
                               //    gridStorage[0].highlightedPage = 0;
                               //    var updatedGridStorage = JSON.stringify(gridStorage);
                               //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                               //}
                           } else {

                           }
                       }
                       else {
                           data.getDownloadJobSummaryResp = new Object();
                           data.getDownloadJobSummaryResp.DownloadJobs = [];
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
            enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, true, 'pagerDivContentJobStatus', true, 1, 'IsJobCancelAllowed', null, null, null);

            return true;
        }

        //for device profile
        function SerialNoRendereContentJobStatus(row, columnfield, value, defaulthtml, columnproperties) {
            var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
            return html;
        }

        var deviceStatusRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }

        // click on view result model popup is open
        var resultsRender = function (row, columnfield, value, defaulthtml, columnproperties) {

            return '<div style="padding-left:5px;padding-top:7px;cursor:pointer"> <a title="Click to view Content Details" id="imageId" tabindex="0" style="text-decoration:underline;" onClick="openIconPopupcontentjob(' + row + ')" height="60" width="50" >View Results</a></div>'
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

        var toolTipRenderer = function (row, column, value, defaultHtml) {
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
        var checkboxhiderender = function (row, columnfield, value, defaulthtml, columnproperties) {
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
                    { text: '', datafield: 'JobDevicesId', hidden: true, editable: false, minwidth: 0,  },
                    { text: '', datafield: 'UniqueDeviceId', hidden: true, editable: false, },
                    { text: '', datafield: 'AdditionalStatusInfo', hidden: true, editable: false, minwidth: 0, },
                    {
                        text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 90,  enabletooltips: false, cellsrenderer: SerialNoRendereContentJobStatus,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 100, enabletooltips: false,
                        filtertype: "custom", cellsrenderer: SerialNoRendereContentJobStatus,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },                    
                    {
                        text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 90,  enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
                        }
                    },
                    {
                        text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 130, enabletooltips: false, cellsrenderer: deviceStatusRenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
                        }
                    },
                    {
                        text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 130,
                        filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('job_name', { lng: lang }), datafield: 'JobName', editable: false, minwidth: 150,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('job_status', { lng: lang }), datafield: 'JobStatus', editable: false, minwidth: 150, cellsrenderer: toolTipRenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Download\/Content Job Status');
                        }
                    },
                    {
                        text: i18n.t('createdOn', { lng: lang }), datafield: 'JobCreatedOn', filter: initialColumnFilter, editable: false, minwidth: 180, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    { text: i18n.t('content(s)', { lng: lang }), datafield: 'Package', editable: false, minwidth: 100,  menu: false, sortable: false, filterable: false },//check
                    {
                        text: i18n.t('Tags_downl_lib', { lng: lang }), datafield: 'Tags', editable: false, minwidth: 120, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
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
                        text: i18n.t('created_by', { lng: lang }), datafield: 'FullName', editable: false, minwidth: 100,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    { text: i18n.t('results', { lng: lang }), datafield: 'results', editable: false, minwidth: 100,  sortable: false, filterable: false, menu: false, enabletooltips: false, cellsrenderer: resultsRender },
        ];




        $("#" + gID).jqxGrid(
            {
                height: gridHeightFunction(gID,"30"),
                width: "100%",
                pageable: true,
                editable: true,
                source: dataAdapter,
                altRows: true,
                virtualmode: true,
                pageSize: AppConstants.get('ROWSPERPAGE'),
                filterable: true,
                enabletooltips: true,
                sortable: true,
                columnsResize: true,
                columnsreorder: true,
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
                            };
                        }

                        //////
                        for (var i = 0; i < ADSearchUtil.localDynamicColumns.length; i++) {
                            $("#" + gID).jqxGrid('showcolumn', ADSearchUtil.localDynamicColumns[i].datafield);
                        }
                        //////

                        for (var i = 0; i < gridColumns.length; i++) {
                            if ($.inArray(gridColumns[i].datafield, ADSearchUtil.initColumnsArr) < 0) {                               
                                    if (DynamicColumns) {
                                        var checkSource = _.where(DynamicColumns, { AttributeName: gridColumns[i].datafield });
                                        if (checkSource == '') {
                                            $("#" + gID).jqxGrid('hidecolumn', gridColumns[i].datafield);
                                        } 
                                    } else {
                                        var checkSource = _.where(initfieldsArr, { datafield: gridColumns[i].datafield });
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
                    callOnGridReady(gID, gridStorage, CallType, 'JobCreatedOn');
                    //CallType = addDefaultfilter(CallType, 'JobCreatedOn', gID)

                    var columns = genericHideShowColumn(gID, true, ['results']);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                    visibleColumnsList.push('LastHeartBeat');
                },
            });
        getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'JobDevicesId');
    }


    function getContentJobStatusParameters(isExport, columnSortFilterContentJob, deviceSearchObj, selectedContentJobItems, unselectedContentJobItems, checkAll, visibleColumns) {

        var getDownloadJobSummaryReq = new Object();
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
            }
        }

        var ColumnSortFilter = columnSortFilterContentJob;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getDownloadJobSummaryReq.DeviceId = null
        getDownloadJobSummaryReq.ColumnSortFilter = ColumnSortFilter;
        getDownloadJobSummaryReq.DeviceSearch = deviceSearchObj;
        getDownloadJobSummaryReq.PackageType = ENUM.get("Content");
        getDownloadJobSummaryReq.UniqueDeviceId = 0;
        getDownloadJobSummaryReq.CallType = CallType;      // 3-week
        getDownloadJobSummaryReq.Export = Export;
        getDownloadJobSummaryReq.Pagination = Pagination;
        getDownloadJobSummaryReq.Selector = Selector;

        var param = new Object();
        param.token = TOKEN();
        param.getDownloadJobSummaryReq = getDownloadJobSummaryReq;

        return param;

    }

});

// open popup defination
function openIconPopupcontentjob(row, columnlist) {
    $('#modelContentResults').modal('show');
    $('#contentResultsDiv').empty();
    $('#contentResultsDiv').html('<div id="jqxGridContentResults"></div><div id="pagerDivContentResults"></div>');
    GetContentResults(row);
}

function GetContentResults(row) {

    var self = this;

    self.serialNumber = $("#jqxgridContentJob").jqxGrid('getcellvalue', row, 'SerialNumber');
    self.modelName = $("#jqxgridContentJob").jqxGrid('getcellvalue', row, 'ModelName');
    jobDevicesId = $("#jqxgridContentJob").jqxGrid('getcellvalue', row, 'JobDevicesId');
    isCancelRequestFailed = $("#jqxgridContentJob").jqxGrid('getcellvalue', row, 'IsCancelRequestFailed');

    $("#modelName").empty();
    $("#serialNumber").empty();
    $("#modelName").append(self.modelName);
    $("#serialNumber").append(self.serialNumber);

    //grid display
    var param = getModelContentResultDetials(false, columnSortFilterModelJob, jobDevicesId, []);
    getContentResultsGrid('jqxGridContentResults', param);
}

function modelContentJobExport(param) {

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

function getContentResultsGrid(gID, param) {
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
            { name: 'StartTime', map: 'StartTime' },
            { name: 'DownloadDuration', map: 'DownloadDuration' },
            { name: 'InstalledDate', map: 'InstalledDate' },
            { name: 'ExpiredDate', map: 'ExpiredDate' },
            { name: 'File', map: 'File' },
            { name: 'FileSize', map: 'FileSize' },
            { name: 'JobDevicesId', map: 'JobDevicesId' },
            { name: 'isSelected', type: 'number' },
            { name: 'AdditiionalStatusIfo', map: 'AdditiionalStatusIfo' }
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
            data.getDownloadResultsResp=[];
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
               disableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
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
               if (data) {                   
                   if (data.getDownloadResultsResp && data.getDownloadResultsResp.DownloadJobResults) {
                       for (var i = 0; i < data.getDownloadResultsResp.DownloadJobResults.length; i++) {
                           data.getDownloadResultsResp.DownloadJobResults[i].StartTime = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].StartTime);
                           data.getDownloadResultsResp.DownloadJobResults[i].InstalledDate = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].InstalledDate);
                           data.getDownloadResultsResp.DownloadJobResults[i].ExpiredDate = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].ExpiredDate);
                       }
                   }
                   enableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
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
        enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, false, 'pagerDivContentResults', true, 0, 'JobDevicesId', null, null, null);
        $('.jqx-grid-pager').css("display", "none");
        return true;
    }

    var viewContentjobStatusTooltipRenderer = function (row, column, value, defaulthtml) {
        defaultHtml = displayTooltipIconRendererForViewResults(gID, row, column, value, defaulthtml);
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
            rowsheight: 32,
            rendergridrows: function () {
                return dataAdapter.records;
            },
            autoshowfiltericon: true,
            enabletooltips: true,
            ready: function () {
                var columns = genericHideShowColumn(gID, true, ['IsProcessed']);
                for (var i = 0; i < columns.length; i++) {
                    visibleColumnsListForPopup.push(columns[i].columnfield);
                }
                
                $("body").mousemove(function () {
                    var scrolling = $("#" + gID).jqxGrid("scrolling");
                    if (scrolling.horizontal == true) {
                        $("Div.jqx-grid-cell.jqx-grid-empty-cell").children("span").css({ "margin-left": "39%" });
                    };
                });
            },
            columns: [
                 {
                     text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox', resizable: false, draggable: false,
                     datafield: 'isSelected', width: 40, renderer: function () {
                         return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                     }, rendered: rendered, hidden: true,
                 },
                { text: '', datafield: 'JobDevicesId', hidden: true, editable: false, width: 'auto' },
                {
                    text: i18n.t('content(s)', { lng: lang }), datafield: 'PackageName', editable: false, minwidth: 90, 
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }

                },
                {
                    text: i18n.t('rs_statsus', { lng: lang }), datafield: 'Status', enabletooltips: false, editable: false, minwidth: 100, cellsrenderer: viewContentjobStatusTooltipRenderer,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelMultiChoice(filterPanel, datafield, 'Content Job Task Status');
                    }
                },
                {
                    text: i18n.t('download_started_at', { lng: lang }), datafield: 'StartTime', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 100,  enabletooltips: false,
                    filtertype: "custom",
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
                    text: i18n.t('installed_at', { lng: lang }), datafield: 'InstalledDate', editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 130, enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelDate(filterPanel, datafield);
                    }

                },
                {
                    text: i18n.t('expiration_date', { lng: lang }), datafield: 'ExpiredDate', editable: false, minwidth: 130,  cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelDate(filterPanel, datafield);
                    }

                },
                {
                    text: i18n.t('content_file_name', { lng: lang }), datafield: 'File', editable: false, minwidth: 90, 
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }

                },
                {
                    text: i18n.t('fileSize_mb', { lng: lang }), datafield: 'FileSize', editable: false, minwidth: 90,
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

function getModelContentResultDetials(isExport, columnSortFilterModelJob, jobDevicesId, visibleColumns) {

    var getDownloadResultsReq = new Object();
    var Export = new Object();
    var Pagination = new Object();

    Pagination.HighLightedItemId = null
    Pagination.PageNumber = 1;
    Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

    Export.DynamicColumns = null;
    if (isExport == true) {
        Export.IsAllSelected = false;
        Export.IsExport = true;
    } else {
        Export.IsAllSelected = false;
        Export.IsExport = false;
    }
    Export.VisibleColumns = visibleColumns;
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
    getDownloadResultsReq.PackageType = ENUM.get("Content");
    getDownloadResultsReq.Pagination = Pagination;

    var param = new Object();
    param.token = TOKEN();
    param.getDownloadResultsReq = getDownloadResultsReq;

    return param;
}
