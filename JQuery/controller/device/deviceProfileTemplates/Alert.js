var statusCheckRow = '';
define(["knockout", "autho", "advancedSearchUtil", "koUtil", "spinner"], function (ko, autho, ADSearchUtil, koUtil) {

    globalVariableForSetAlerts = new Array();
    selectedIdOnGlobale1 = new Array();
    columnSortFilterAlertOpen = new Object();
    var lang = getSysLang();
    var isAlertsCheck = false;

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function alertOpenViewModel() {
    

        // code for confirmation tabindex
        $('#allSelectedID').on('shown.bs.modal', function () {
            $('#btnCloseAlertNo').focus();
        })

        //setTabindexForConfirmationPopUp(4, "allSelectedID", 3);
        //end

      
        var self = this;
        checkRightsOfAlert();

        function checkRightsOfAlert() {
            var retvalAlerts = autho.checkRightsBYScreen('Alerts', 'IsModifyAllowed');
            if (retvalAlerts == true) {
                $("#disabledBtn").prop("disabled", false);
            } else {
                $("#disabledBtn").prop("disabled", true);
            }
        }

        //Check rights   


        self.alertName = ko.observable();
        self.eventReceivedDate = ko.observable();
        self.modelName = ko.observable();
        self.severity = ko.observable();
        self.serialNumber = ko.observable();
        self.deviceId = ko.observable();
        self.templateFlag = ko.observable(false);
        self.alertModelComponent = ko.observable();
        self.observableModelPopup = ko.observable();
        self.gridIdForShowHide = ko.observable();

        self.forDeviceProfile = ko.observable();
        //if (koUtil.isDeviceProfile() == true) {
        //    self.forDeviceProfile(false);
        //    $("#alertOpenHead").text(i18n.t('Alerts', { lan: lang }));
        //    if ($("#alertBtnDiv").hasClass('pull-right')) {
        //        $("#alertBtnDiv").removeClass('pull-right');
        //    }
        //} else {
        //    self.forDeviceProfile(true);
        //    $("#alertOpenHead").text(i18n.t('alertsOpen', { lan: lang }));
        //    if ($("#alertBtnDiv").hasClass('pull-right')) {

        //    } else {
        //        $("#alertBtnDiv").addClass('pull-right');
        //    }
        //}



        $('#modelEditOpenAlertIDHeader').mouseup(function () {
            $("#modelEditOpenAlertIDContent").draggable({ disabled: true });
        });

        $('#modelEditOpenAlertIDHeader').mousedown(function () {
            $("#modelEditOpenAlertIDContent").draggable({ disabled: false });
        });



        var compulsoryfields = ['SerialNumber', 'Status', 'AlertName', 'IsNoteExists'];
        self.columnlist = ko.observableArray();
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        self.AdvanceTemplateFlag = ko.observable(false);// For Advance Search
        self.observableCriteria = ko.observable();
        loadCriteria('modalCriteria', 'genericPopup');

        ADSearchUtil.deviceSearchObj = new Object()
        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];
      //  ADSearchUtil.AdScreenName = 'Open Alerts';
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;
        ADSearchUtil.ExportDynamicColumns = [];
        self.observableAdvancedSearchModelPopup = ko.observable();
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        setMenuSelection();

        //<!---advance search changes--->
        //Check Rights
        checkGridVisible();
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        function checkGridVisible() {
            var retval = autho.checkRightsBYScreen('Devices', 'IsDeleteAllowed');
            if (retval == true) {
                isAlertsCheck = true;
            } else {
                isAlertsCheck = false;
            }
            return retval;
        }

        /////////////////////////
        modelReposition();
        // open Popup model
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist(null); //<!---advance search changes--->
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));

                loadelement(popupName, 'genericPopup');
                $('#alertModel').modal('show');
            } else if (popupName == "modelCloseSelectedAlert") {
                var selectedData = getMultiSelectedData(gId);
                var selectedIds = getSelectedUniqueId(gId);
                var unSelectedIds = getUnSelectedUniqueId(gId);
                var checkall = checkAllSelected(gId);
                var checkcount = new Array();

                if (checkall == 1) {
                    SelectedItemIds = null;
                    UnSelectedItemIds = unSelectedIds;
                    checkcount = ["allcheck"];
                }
                else {
                    SelectedItemIds = selectedIds;
                    UnSelectedItemIds = null;
                    checkcount = selectedIds;
                }

                if (checkcount.length > 0) {
                    loadelement(popupName, 'alerts');
                    $('#alertModel').modal('show');
                    globalVariableForSetAlerts = selectedData;
                    globalVariableForSetAlerts.push = gId;
                }
                else {
                    openAlertpopup(1, 'please_select_an_alert(s)');
                }
            } else if (popupName == 'modelAdvancedSearch') {

                self.AdvanceTemplateFlag(true);
                loadAdvancedSearchModelPopup(popupName, 'genericPopup');
                $('#AdvanceSearchModal').modal('show');
            }
        }

        //close alert
        self.closeAlert = function (gId) {
            checkallSelect(gId, self.openPopup);
        }


        self.GetAlertResultsDetails = function () {

            var Export = new Object();
            var Pagination = new Object();
            var getAlertResultsDetailsReq = new Object();

            Pagination.HighLightedItemId = null
            Pagination.PageNumber = 1;
            Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

            Export.DynamicColumns = null;
            Export.IsAllSelected = false;
            Export.IsExport = false;
            //Export.ExportReportType = 3;


            var ColumnSortFilter = new Object();
            ColumnSortFilter.GridId = "AlertHistory";
            var FilterList = new Array();
            ColumnSortFilter.FilterList = FilterList;

            var SortList = new Array();
            ColumnSortFilter.SortList = SortList;

            var Selector = new Object();

            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = null;

            getAlertResultsDetailsReq.Selector = Selector;
            getAlertResultsDetailsReq.DeviceSearch = null

            getAlertResultsDetailsReq.AlertSeverity = 3;
            getAlertResultsDetailsReq.AlertStatus = 0;
            getAlertResultsDetailsReq.AlertTypeId = 0;
            getAlertResultsDetailsReq.CallType = 3;

            getAlertResultsDetailsReq.ColumnSortFilter = ColumnSortFilter;
            getAlertResultsDetailsReq.Export = Export;
            getAlertResultsDetailsReq.Pagination = Pagination;

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.getPackagesResp && data.getPackagesResp.Packages) {
                        }
                    }
                }
            }

            var method = 'GetAlertResultsDetails';
            var params = '{"token":"' + TOKEN() + '","getAlertResultsDetailsReq":' + JSON.stringify(getAlertResultsDetailsReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

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

        function checkallSelect(gId, openPopup) {
            var selectedIds = getSelectedUniqueId(gId);
            var unSelectedIds = getUnSelectedUniqueId(gId);
            var checkall = checkAllSelected(gId);
            var checkcount = new Array();
            if (checkall == 1) {
                SelectedItemIds = null;
                UnSelectedItemIds = unSelectedIds;
                checkcount = ["allcheck"];
                $('#allSelectedID').draggable();
                $('#allSelectedID').modal('show');
            }
            else {

                SelectedItemIds = selectedIds;
                UnSelectedItemIds = null;
                checkcount = selectedIds;
                openPopup('modelCloseSelectedAlert', gId);
            }
        }

        //open popup on cofirmation pop up yes button click
        self.closeAlertPopup = function (gId) {
            openSelectepopup(gId, self.openPopup);
        }

        function openSelectepopup(gId, openPopup) {
            openPopup('modelCloseSelectedAlert', gId);
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.alertModelComponent('unloadTemplate');
            $("#modelEditOpenAlertIDContent").css('left', '');
            $("#modelEditOpenAlertIDContent").css('top', '');
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

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.alertModelComponent(elementname);

        }
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

        // reset filter
        self.clearfilter = function (gridId) {
            CallType = ENUM.get("CALLTYPE_NONE");
            gridFilterClear(gridId);
        }

        // refresh grid
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }

        //ExportToExcel 
        self.exportToExcel = function (isExport, gId) {
            var selectedAlertOpenItems = getSelectedUniqueId(gId);
            var unselectedAlertOpenItems = getUnSelectedUniqueId(gId);
            var checkall = checkAllSelected(gId);
            var param = getAlertOpenParametersDP(true, columnSortFilterAlertOpen, selectedAlertOpenItems, unselectedAlertOpenItems, checkall, ADSearchUtil.deviceSearchObj, visibleColumnsList);
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                alertOpenExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export')

            }

        }

        //Save and close alert
        self.modelcloseAlert = function () {
            saveAndCloseEditAlertDetailsProfile();
        }

        // Save Changes
        self.saveAlert = function () {
            saveEditAlertDetailsDeviceProfile(statusCheckRow);            
        }

        var param = getAlertOpenParametersDP(false, columnSortFilterAlertOpen, null, null, 0, ADSearchUtil.deviceSearchObj);
        getAlertGridDetailsDP('jqxgridAlertsOpenProfile', self.openPopup, param);

        ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridAlertsOpenProfile';

        seti18nResourceData(document, resourceStorage);
    }

    function alertOpenExport(param, gId, openPopup) {
        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(1, 'export_Sucess');
                } 
            }
        }

        var method = 'GetDeviceAlertHistory';
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

    function getAlertGridDetailsDP(gID, openPopup, param) {
        var gridColumns = [];
        var sourceDataFieldsArr = [{ name: 'isSelected', type: 'number' },
                                        { name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
                                        { name: 'AlertTypeId', map: 'AlertTypeId' },
                                        { name: "SerialNumber", map: 'DeviceDetail>SerialNumber' },
                                        { name: 'DeviceId', map: 'DeviceDetail>DeviceId' },
                                        { name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath' ,type: 'string'},
                                        { name: 'ModelName', map: 'DeviceDetail>ModelName' },
                                        { name: 'EventReceivedDate', map: 'EventReceivedDate', type: 'date' },
                                        { name: 'EventRaisedDate', map: 'EventRaisedDate' },
                                        { name: 'Severity', map: 'Severity' },
                                        { name: 'AlertName', map: 'AlertName' },
                                        { name: 'IsNoteExists', map: 'IsNoteExists' },
                                        { name: 'Notes', map: 'Notes' },
                                        { name: 'DeviceAlertId', map: 'DeviceAlertId' },
                                        { name: 'Status', map: 'Status' },
                                        { name: 'ClosedDate', map: 'ClosedDate', type: 'date' },
                                        { name: 'FullName', map: 'FullName' },
                                        { name: 'CreatedBy', map: 'CreatedBy' },
                                        { name: 'LoginName', map: 'LoginName' },
                                        { name: 'Description', map: 'Description' },
                                        { name: 'Details', map: 'Details' },
                                        { name: 'Component', map: 'Component' }                                        
        ];
        //for grid local storage//

      //  CallType = ENUM.get("CALLTYPE_WEEK");
        // reset filter
        self.clearfilter = function (gridId) {
            gridFilterClear(gridId);
        }
        var isFilter;
        if (isAlertGridDetailsFilter == undefined || isAlertGridDetailsFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        isAlertGridDetailsFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
      //  CallType = InitGridStoragObj.CallType;

        var source = {
            dataType: 'json',
            dataFields: [
                 { name: 'isSelected', type: 'number' },
                { name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
                { name: 'AlertTypeId', map: 'AlertTypeId' },
                { name: "SerialNumber", map: 'DeviceDetail>SerialNumber' },
                { name: 'DeviceId', map: 'DeviceDetail>DeviceId' },
                { name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath' ,type: 'string'},
                { name: 'ModelName', map: 'DeviceDetail>ModelName' },
                { name: 'EventReceivedDate', map: 'EventReceivedDate', type: 'date' },
                { name: 'EventRaisedDate', map: 'EventRaisedDate' },
                { name: 'Severity', map: 'Severity' },
                { name: 'AlertName', map: 'AlertName' },
                { name: 'IsNoteExists', map: 'IsNoteExists' },
                { name: 'Notes', map: 'Notes' },
                { name: 'DeviceAlertId', map: 'DeviceAlertId' },
                { name: 'Status', map: 'Status' },
                { name: 'ClosedDate', map: 'ClosedDate', type: 'date' },
                { name: 'FullName', map: 'FullName' },
                { name: 'CreatedBy', map: 'CreatedBy' },
                { name: 'LoginName', map: 'LoginName' },
                { name: 'Description', map: 'Description' },
                { name: 'Details', map: 'Details' },
                { name: 'Component', map: 'Component' }
            ],
            root: 'DeviceAlerts',
            type: 'POST',
            data: param,

            url: AppConstants.get('API_URL') + "/GetDeviceAlertHistory",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getDeviceAlertHistoryResp) {
                    data.getDeviceAlertHistoryResp = $.parseJSON(data.getDeviceAlertHistoryResp);
                }
                else
                    data.getDeviceAlertHistoryResp = [];
                if (data.getDeviceAlertHistoryResp.PaginationResponse) {
                    source.totalrecords = data.getDeviceAlertHistoryResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDeviceAlertHistoryResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                    data.getDeviceAlertHistoryResp.DeviceAlerts = [];
                }
            },
        }
        var request = 
           {
               formatData: function (data) {
                   $('.all-disabled').show();
                   disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                   //$("#disabledBtn").prop("disabled", true);
                   var columnSortFilter = new Object();
                   columnSortFilter = columnSortFilterFormatedData(columnSortFilterAlertOpen, gID, gridStorage, 'DeviceAlerts');
                   koUtil.GlobalColumnFilter = columnSortFilter;
                   param.getDeviceAlertHistoryReq.ColumnSortFilter = columnSortFilter;
                   if (koUtil.isDeviceProfile() == true) {

                       param.getDeviceAlertHistoryReq.CallType = ENUM.get("CALLTYPE_NONE");
                   } else {

                       param.getDeviceAlertHistoryReq.CallType = CallType;
                   }

                   param.getDeviceAlertHistoryReq.Pagination = getPaginationObject(param.getDeviceAlertHistoryReq.Pagination, gID);
                   param.getDeviceAlertHistoryReq.DeviceSearch = ADSearchUtil.deviceSearchObj;  ///Advance Search
                   data = JSON.stringify(param);
                   return data;
               },
               downloadComplete: function (data, status, xhr) {
                   
                   if (data.getDeviceAlertHistoryResp && data.getDeviceAlertHistoryResp.DeviceAlerts) {
                       for (var i = 0; i < data.getDeviceAlertHistoryResp.DeviceAlerts.length; i++) {
                           data.getDeviceAlertHistoryResp.DeviceAlerts[i].EventRaisedDate = convertToDeviceZonetimestamp(data.getDeviceAlertHistoryResp.DeviceAlerts[i].EventRaisedDate);
                           data.getDeviceAlertHistoryResp.DeviceAlerts[i].EventReceivedDate = convertToLocaltimestamp(data.getDeviceAlertHistoryResp.DeviceAlerts[i].EventReceivedDate);
                           data.getDeviceAlertHistoryResp.DeviceAlerts[i].ClosedDate = convertToLocaltimestamp(data.getDeviceAlertHistoryResp.DeviceAlerts[i].ClosedDate);

                           if (data.getDeviceAlertHistoryResp.DeviceAlerts[i].IsSeverityApplicable != null) {
                               if (data.getDeviceAlertHistoryResp.DeviceAlerts[i].IsSeverityApplicable == true) {
                                   if (data.getDeviceAlertHistoryResp.DeviceAlerts[i].Severity == "High") {
                                       data.getDeviceAlertHistoryResp.DeviceAlerts[i].Severity = "High";
                                   } else if (data.getDeviceAlertHistoryResp.DeviceAlerts[i].Severity == "Low") {
                                       data.getDeviceAlertHistoryResp.DeviceAlerts[i].Severity = "Low";
                                   } else if (data.getDeviceAlertHistoryResp.DeviceAlerts[i].Severity == "Medium") {
                                       data.getDeviceAlertHistoryResp.DeviceAlerts[i].Severity = "Medium";
                                   }
                               }
                           }
                       }
                   }
                   enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                   var initfieldsArr = [
                                        { name: 'isSelected', type: 'number' },
                                        { name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
                                        { name: 'AlertTypeId', map: 'AlertTypeId' },
                                        { name: "SerialNumber", map: 'DeviceDetail>SerialNumber' },
                                        { name: 'DeviceId', map: 'DeviceDetail>DeviceId' },
                                        { name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath', type: 'string' },
                                        { name: 'ModelName', map: 'DeviceDetail>ModelName' },
                                        { name: 'EventReceivedDate', map: 'EventReceivedDate', type: 'date' },
                                        { name: 'EventRaisedDate', map: 'EventRaisedDate' },
                                        { name: 'Severity', map: 'Severity' },
                                        { name: 'AlertName', map: 'AlertName' },
                                        { name: 'IsNoteExists', map: 'IsNoteExists' },
                                        { name: 'Notes', map: 'Notes' },
                                        { name: 'DeviceAlertId', map: 'DeviceAlertId' },
                                        { name: 'Status', map: 'Status' },
                                        { name: 'ClosedDate', map: 'ClosedDate', type: 'date' },
                                        { name: 'FullName', map: 'FullName' },
                                        { name: 'CreatedBy', map: 'CreatedBy' },
                                        { name: 'LoginName', map: 'LoginName' },
                                        { name: 'Description', map: 'Description' },
                                        { name: 'Details', map: 'Details' },
                                        { name: 'Component', map: 'Component' }
                   ];

                   if (data.getDeviceAlertHistoryResp && data.getDeviceAlertHistoryResp.DeviceAlerts != '') {
                       //$("#disabledBtn").prop("disabled", false);
                       if (data.getDeviceAlertHistoryResp.TotalSelectionCount != 'undefined') {
                           gridStorage[0].TotalSelectionCount = data.getDeviceAlertHistoryResp.TotalSelectionCount;
                           var updatedGridStorage = JSON.stringify(gridStorage);
                           window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                       }

                       if (data.getDeviceAlertHistoryResp.PaginationResponse) {
                           //if (data.getDeviceAlertHistoryResp.PaginationResponse.HighLightedItemPage > 0) {
                           //    gridStorage[0].highlightedPage = data.getDeviceAlertHistoryResp.PaginationResponse.HighLightedItemPage;
                           //    var updatedGridStorage = JSON.stringify(gridStorage);
                           //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                           //}
                       }
                   } else {
                       data.getDeviceAlertHistoryResp = new Object();
                       data.getDeviceAlertHistoryResp.DeviceAlerts = [];
                   }
                   $('.all-disabled').hide();
               }
           }
        var dataAdapter = intializeDataAdapter(source, request);
        //for allcheck
        var rendered = function (element) {
            if (isAlertsCheck == true) {
                enablegridfunctions(gID, 'DeviceAlertId', element, gridStorage, true, 'pagerDivAlertsOpen', true, 4, 'Status', null, null, null);
            } else {
                enablegridfunctions(gID, 'DeviceAlertId', element, gridStorage, false, 'pagerDivAlertsOpen', true, 4, 'Status', null, null, null);
            }
            return true;
        }
        var cellclass = function (row, columnfield, value) {
            var check = $("#" + gID).jqxGrid('getcellvalue', row, 'Status');
            if (check == 0) {
                return '';
            } else {
                return 'disabled';
            }
        }
        //open popup on notes button click
        var notesRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            if (value == true) {
                return '<div class="btn btn-xs btn-default" style="color: black; margin-left: 50%; left: -15px; top: 7px; position: relative;"><a style="color: black;" title="Click to view notes" onClick="modelEditOpenAlertProfile(' + row + ')"><i class="icon-pencil"></i></a></div>'

            } else if (value == false) {
                return " ";
            }
        }

        var alertTypeRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {

            if (value == 0) {
                return '<div style="padding-left:5x;padding-top:7px">Open</div>';
            } else if (value == 1) {
                return '<div style="padding-left:5x;padding-top:7px">Closed</div>';
            } else if (value == 2) {
                return '<div style="padding-left:5x;padding-top:7px">All</div>';
            }
        }

        var severityRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {

            var isSeverityApplicableFlag = $("#" + gID).jqxGrid('getcellvalue', row, 'IsSeverityApplicable');

            if (value == "Low") {
                return '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Low_severity"></div></a>' + value + '</span></div>';
            } else if (value == "High") {
                return '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg high_Severity"></div></a>' + value + '</span></div>';
            } else if (value == "Medium") {
                return '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Medium_severity"></div></a>' + value + '</span></div>';
            } else if (value == "Not Applicable") {
                return '<div style="padding-left:35px; padding-top:7px;" disabled="disabled">' + "Not Applicable" + '</div>';
            }

        }

        var closedByToolTipRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var createdBy = $("#" + gID).jqxGrid('getcellvalue', row, 'CreatedBy');
            var loginName = $("#" + gID).jqxGrid('getcellvalue', row, 'LoginName');
            if (createdBy == '' || createdBy== undefined) {
                return '<div style="padding-left:5x;padding-top:7px"><span title="' + loginName + '">' + value + '</span></div>';
            } else {
                return '<div style="padding-left:5x;padding-top:7px"><span title="' + createdBy + '">' + value + '</span></div>';
            }
          
        }

        var descriptionToolTipRenderer = function (row, column, value, defaultHtml) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);

            if (rowData.Details && rowData.Details != '') {
                return '<div style="padding-left:5px;padding-top:6px;overflow:hidden;text-overflow:ellipsis;"><span title=" ' + rowData.Details + '"> ' + value + ' </span></div>'
            } else {
                return '<div style="padding-left:5px;padding-top:6px;"> ' + value + ' </div>'
            }
        }

        //For filter
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

        }
        var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
            genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
        }

        var cellbeginedit = function (row, datafield, columntype, value) {

            var check = $("#" + gID).jqxGrid('getcellvalue', row, 'Status');
            if (check == '0') {
                return true;
            } else {
                return false;
            }
        }

        //for ad Search
        gridColumns = [
            {
                text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclass,
                datafield: 'isSelected', width: 40, renderer: function () {
                    return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                }, rendered: rendered
            },

                    {
                        text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 100, enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('component', { lng: lang }), dataField: 'Component', editable: false, minwidth: 150, width: 'auto', enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Component');
                        }
                    },
                    {
                        text: i18n.t('Alert', { lng: lang }), datafield: 'AlertName', editable: false, minwidth: 130, width: 'auto', 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Alerts');
                        }
                    },

                    {
                        text: i18n.t('Description', { lng: lang }), datafield: 'Description', editable: false, enabletooltips: false, minwidth: 130, cellsrenderer: descriptionToolTipRenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },

                    {
                        text: i18n.t('received_date', { lng: lang }), datafield: 'EventReceivedDate', filtertype: 'date', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 150,  enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('raised_date', { lng: lang }), datafield: 'EventRaisedDate', filtertype: 'date', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 160,  enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('severity', { lng: lang }), datafield: 'Severity', editable: false, minwidth: 100, cellsrenderer: severityRenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Severity');
                        }
                    },
                    {
                        text: i18n.t('alert_status', { lng: lang }), datafield: 'Status', editable: false, enabletooltips: false, minwidth: 100, cellsrenderer: alertTypeRenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Alert Status');
                        }
                    },

                    {
                        text: i18n.t('close_by_alert', { lng: lang }), datafield: 'FullName', menu: false, filterable: false, sortable: false, editable: false, minwidth: 100, enabletooltips: false, cellsrenderer: closedByToolTipRenderer
                    },
                    {
                        text: i18n.t('close_date_alert', { lng: lang }), datafield: 'ClosedDate', filtertype: 'date', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 150, enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('notes', { lng: lang }), datafield: 'IsNoteExists', menu: false, filterable: false, sortable: false, editable: false, enabletooltips: false, minwidth: 100,  cellsrenderer: notesRenderer
                    }
        ];
        //end Ad Search


        $("#" + gID).jqxGrid(
            {
                width: "100%",
                height: gridHeightFunction(gID, "30"),
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
                rowsheight: 32,
                autoshowcolumnsmenubutton: false,
                enabletooltips: true,
                rendergridrows: function () {
                    return dataAdapter.records;
                },
                ready: function () {
                    callOnGridReady(gID, gridStorage, undefined, 'EventReceivedDate');
                 //   if (koUtil.isDeviceProfile() == false) {
                       
                        //CallType = addDefaultfilter(CallType, 'EventReceivedDate', gID);
                   // }


                    var columns = genericHideShowColumn(gID, true, []);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    koUtil.gridColumnList.push('LastHeartBeat');
                    visibleColumnsList = koUtil.gridColumnList;
                },
                autoshowfiltericon: true,
                columns: gridColumns,
            });
        //
        getGridBiginEdit(gID, 'DeviceAlertId', gridStorage);

        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'DeviceAlertId');


        // open popup on row double click
        $("#" + gID).on('rowdoubleclick', function (event) {
            globalVariableForEditAlerts = event.args.row.bounddata;
            var row = event.args.rowindex;
            modelEditOpenAlertProfile(row);
            statusCheckRow = row;
        });
    }

    function getAlertOpenParametersDP(isExport, columnSortFilterAlertOpen, selectedAlertOpenItems, unselectedAlertOpenItems, checkAll, deviceSearchObj, visibleColumns) {
        var getDeviceAlertHistoryReq = new Object();
        var Export = new Object();
        var Pagination = new Object();
        var Selector = new Object();
        var DeviceSearch = new Object();
        var DefaultDate = new Object();


        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Export.DynamicColumns = null;
        Export.VisibleColumns = visibleColumns;
        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedAlertOpenItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
                Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
                Export.ExportReportType = ENUM.get('OpenAlerts');
            } else {
                Export.ExportReportType = ENUM.get('OpenAlerts');
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedAlertOpenItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.IsExport = true;
                Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
                // Export.ExportReportType = ENUM.get('OpenAlerts');
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
                // Export.ExportReportType = ENUM.get('OpenAlerts');
            }
        }

        var ColumnSortFilter = columnSortFilterAlertOpen;
        getDeviceAlertHistoryReq.ColumnSortFilter = ColumnSortFilter;
        getDeviceAlertHistoryReq.DeviceId = koUtil.deviceId;
        getDeviceAlertHistoryReq.Export = Export;
        getDeviceAlertHistoryReq.ModelName = koUtil.ModelName;
        getDeviceAlertHistoryReq.Pagination = Pagination;
        getDeviceAlertHistoryReq.Selector = Selector;
        getDeviceAlertHistoryReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        var param = new Object();
        param.token = TOKEN();
        param.getDeviceAlertHistoryReq = getDeviceAlertHistoryReq;

        return param;
    }

});

function modelEditOpenAlertProfile(row) {
    statusCheckRow = row;
    var gID = 'jqxgridAlertsOpenProfile';
    $("#modelEditOpenAlertID").modal('show');

    var self = this;

    globalVariableForEditAlerts = $("#" + gID).jqxGrid('getrowdata', row);
    var jsonDateValue = CreatJSONDateLocal(globalVariableForEditAlerts.EventReceivedDate);

    self.alertName = globalVariableForEditAlerts.AlertName;
    self.eventReceivedDate = jsonDateConversion(jsonDateValue, LONG_DATETIME_FORMAT_AMPM);
    self.modelName = globalVariableForEditAlerts.ModelName;
    self.severity = globalVariableForEditAlerts.Severity;
    self.serialNumber = globalVariableForEditAlerts.SerialNumber;
    self.deviceId = globalVariableForEditAlerts.DeviceId;
    self.notes = globalVariableForEditAlerts.Notes;
    self.UniqueDeviceId = globalVariableForEditAlerts.UniqueDeviceId;
    self.DeviceAlertId = globalVariableForEditAlerts.DeviceAlertId;
    self.AlertTypeId = globalVariableForEditAlerts.AlertTypeId;
    self.IsNoteExists = globalVariableForEditAlerts.IsNoteExists;

    $("#eventReceivedDate").empty();
    $("#modelName").empty();
    $("#alertName").empty();
    $("#serialNumber").empty();
    $("#severity").empty();
    $("#deviceId").empty();
    $("#previousNotes").empty();
    $("#newNotes").empty();
    $("#newNotes").val('');
    $("#eventReceivedDate").append(self.eventReceivedDate);
    $("#modelName").append(self.modelName);
    $("#alertName").append(self.alertName);
    $("#serialNumber").append(self.serialNumber);
    $("#severity").append(self.severity);
    $("#deviceId").append(self.deviceId);
    $("#newNotes").append(self.notes);

    if (globalVariableForEditAlerts.Status == 1) {
        $("#closeAndSaveBtn").prop('disabled', true);
    } else {
        $('#closeAndSaveBtn').prop("disabled", false);
    }


    //getnotes
    getAlertNotesProfile(self.DeviceAlertId);

    $("#showPreviousNote").hide();

    if (self.IsNoteExists == true) {
        $("#showPreviousNote").show();
    }
    else {
        $("#showPreviousNote").hide();
    }
}
// convert severity value
function getSeverity(value) {
    retval = "";
    if (value == 0) {
        retval = "Low";
    } else if (value == 1) {
        retval = "Medium";
    } else if (value == 2) {
        retval = "High";
    } else if (value == 3) {
        retval = "All";
    }

    return retval;
}

function getAlertNotesProfile(DeviceAlertId) {
    $("#previousNotes").val("");
    var deviceAlertId = DeviceAlertId;
    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {                
                $("#previousNotes").val(data.notes);
            } 
        }
    }

    var method = 'GetAlertNotes';
    var params = '{"token":"' + TOKEN() + '" ,"deviceAlertId":"' + deviceAlertId + '"}';
    ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

function saveAndCloseEditAlertDetailsProfile() {
    var setAlertReq = new Object();
    var deviceAlerts = new Array();
    var eDeviceAlert = new Object();

    eDeviceAlert.DeviceAlertId = self.DeviceAlertId;
    eDeviceAlert.Notes = $("#newNotes").val();
    eDeviceAlert.Status = 1;
    eDeviceAlert.UniqueDeviceId = self.UniqueDeviceId;
    deviceAlerts.push(eDeviceAlert);

    setAlertReq.AlertTypeId = self.AlertTypeId;
    setAlertReq.CallType = ENUM.get("CALLTYPE_NONE");
    setAlertReq.DeviceId = self.deviceId;
    setAlertReq.DeviceSearch = null;
    setAlertReq.UnSelectedItemIds = null;
    setAlertReq.Notes = $("#newNotes").val();
    setAlertReq.Status = "Closed";
    setAlertReq.IsClosedOn = true;
    setAlertReq.UniqueDeviceId = 0;
    setAlertReq.IsClosedOn = true;
    setAlertReq.DeviceAlerts = deviceAlerts;

    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                //hide poup                       
                gridFilterClear('jqxgridAlertsOpenProfile');
                $("#modelEditOpenAlertID").modal('hide');
                $("#modelEditOpenAlertIDContent").css('left', '');
                $("#modelEditOpenAlertIDContent").css('top', '');
                openAlertpopup(0, 'alert_changes_saved_successfully');
            }   
        }
    }

    var method = 'SetAlert';
    var params = '{"token":"' + TOKEN() + '" ,"setAlertReq":' + JSON.stringify(setAlertReq) + '}';
    ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

function saveEditAlertDetailsDeviceProfile(statusCheckRow) {
    if (statusCheckRow != '' || statusCheckRow != null) {
        Status = $("#jqxgridAlertsOpenProfile").jqxGrid('getcellvalue', statusCheckRow, 'Status');
    }
    var setAlertReq = new Object();
    var deviceAlerts = new Array();
    var eDeviceAlert = new Object();
    var UnSelectedItemIds = new Object();

    eDeviceAlert.DeviceAlertId = self.DeviceAlertId;
    eDeviceAlert.Notes = $("#newNotes").val();
    eDeviceAlert.Status = Status;
    eDeviceAlert.UniqueDeviceId = self.UniqueDeviceId;
    deviceAlerts.push(eDeviceAlert);

    setAlertReq.AlertTypeId = self.AlertTypeId;
    setAlertReq.CallType = ENUM.get("CALLTYPE_NONE");
    setAlertReq.DeviceId = null;
    setAlertReq.DeviceSearch = null;
    setAlertReq.UnSelectedItemIds = UnSelectedItemIds;
    setAlertReq.Notes = $("#newNotes").val();
    if (Status == 0)
        setAlertReq.Status = "Open";
    else
        setAlertReq.Status = "Closed";

    setAlertReq.UniqueDeviceId = 0;
    setAlertReq.IsClosedOn = false;
    setAlertReq.DeviceAlerts = deviceAlerts;
    setAlertReq.IsClosedOn = false;

    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                //hide poup
                gridFilterClear('jqxgridAlertsOpenProfile');
                $("#modelEditOpenAlertID").modal('hide');
                $("#modelEditOpenAlertIDContent").css('left', '');
                $("#modelEditOpenAlertIDContent").css('top', '');
                openAlertpopup(0, 'alert_changes_saved_successfully');
            } 
        }
    }

    var method = 'SetAlert';
    var params = '{"token":"' + TOKEN() + '" ,"setAlertReq":' + JSON.stringify(setAlertReq) + '}';
    ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}
