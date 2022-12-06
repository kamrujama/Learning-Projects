define(["knockout", "autho", "advancedSearchUtil", "koUtil", "spinner"], function (ko, autho, ADSearchUtil, koUtil) {

    globalVariableForSetAlerts = new Array();
    selectedIdOnGlobale1 = new Array();
    columnSortFilterAlertOpen = new Object();
    koUtil.GlobalColumnFilter = new Array();
    var lang = getSysLang();
    var isAlertsCheck = false;

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    var state = null;


    return function alertOpenViewModel() {


        // code for confirmation tabindex
        $('#allSelectedID').on('shown.bs.modal', function () {
            $('#btnCloseAlertNo').focus();
        })
        $('#allSelectedID').keydown(function (e) {
            if ($('#btnCloseAlertNo').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#btnCloseAlertYes').focus();
            }
        });


        //end

        var self = this;


        //Draggable function
        $('#mdlAdvancedForOpenAlertHeader').mouseup(function () {
            $("#mdlAdvancedForOpenAlertContent").draggable({ disabled: true });
        });

        $('#mdlAdvancedForOpenAlertHeader').mousedown(function () {
            $("#mdlAdvancedForOpenAlertContent").draggable({ disabled: false });
        });

        $('#modelEditOpenAlertIDHeader').mouseup(function () {
            $("#modelEditOpenAlertIDContent").draggable({ disabled: true });
        });

        $('#modelEditOpenAlertIDHeader').mousedown(function () {
            $("#modelEditOpenAlertIDContent").draggable({ disabled: false });
        });
        ////////////////

        $('#disabledBtn').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#disabledBtn').click();
            }
        });



        //------------------------------FOCUS ON  POP UP------WHEN FOCUS ON END-------------------------------

        $('#modelEditOpenAlertID').keydown(function (e) {
            if ($('#modelEditOpenAlertID_CancelBtn').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#modelEditOpenAlertID_CloseBtn').focus();
            }
        });

        //----------------------------------------------------------------------------------------
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

        var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'ComputedDeviceStatus', 'HierarchyFullPath', 'PREVIOUSHIERARCHYNAME', 'EventReceivedDate', 'AlertName', 'IsNoteExists'];
        self.columnlist = ko.observableArray();
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        self.AdvanceTemplateFlag = ko.observable(false);// For Advance Search
        self.observableCriteria = ko.observable();
        loadCriteria('modalCriteria', 'genericPopup');

        ADSearchUtil.deviceSearchObj = new Object()

        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];
        ADSearchUtil.AdScreenName = 'Open Alerts';
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;
        ADSearchUtil.ExportDynamicColumns = [];
        self.observableAdvancedSearchModelPopup = ko.observable();
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        setMenuSelection();

        //<!---advance search changes--->
        ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "ModelName", "ComputedDeviceStatus", "HierarchyFullPath", "PREVIOUSHIERARCHYNAME", "Component", "AlertName", "Description", "Severity", "EventReceivedDate", "EventRaisedDate", "IsNoteExists"];

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

                if (ADSearchUtil.resetAddSerchFlag == 'reset') {                           //Modify After Advance Search
                    for (var i = 0; i < ADSearchUtil.newAddedgridColumns.length; i++) {
                        var source = _.where(self.columnlist(), { columnfield: ADSearchUtil.newAddedgridColumns[i].datafield });
                        if (source != '') {
                            self.columnlist.remove(source[0]);
                        }
                    }
                }

                //<!---end--->
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
            getAlertResultsDetailsReq.CallType = CallType;

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
                var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Collapse"><i class="icon-angle-up"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            } else {
                $("#deviceCriteriaDiv").addClass('hide')
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Expand"><i class="icon-angle-down"></i></a>';
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
            $('#alertModel').modal('hide');
            $("#modelEditOpenAlertIDContent").css('left', '');
            $("#modelEditOpenAlertIDContent").css('top', '');

        };

        //unload advance serach popup
        self.unloadAdvancedSearch = function () {
            ClearAdSearch = 0;
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            $("#AdvanceSearchModal").modal('hide');
            $("#mainPageBody").removeClass('modal-open-appendon');
            isAdpopup = '';
            reppositionPopUp();
        }
        self.clearAdvancedSearch = function () {
            reppositionPopUp();
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        }
        function reppositionPopUp() {
            $("#mdlAdvancedForOpenAlertContent").css('left', '');
            $("#mdlAdvancedForOpenAlertContent").css('top', '');
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
            //for satemant
            var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
            gridStorage[0].CallType = ENUM.get("CALLTYPE_NONE");
            CallType = gridStorage[0].CallType;
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
            ///end
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
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getAlertOpenParameters(true, columnSortFilterAlertOpen, selectedAlertOpenItems, unselectedAlertOpenItems, checkall, ADSearchUtil.deviceSearchObj, visibleColumnsList);
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                alertOpenExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export')

            }

        }

        //Save and close alert
        self.modelcloseAlert = function (gID) {
            saveAndCloseEditAlertDetails(gID);
        }

        // Save Changes
        self.saveAlert = function () {
            saveEditAlertDetails();
        }

        var param = getAlertOpenParameters(false, columnSortFilterAlertOpen, null, null, 0, ADSearchUtil.deviceSearchObj, []);
        getAlertGridDetails('jqxgridAlertsOpen', self.observableAdvancedSearchModelPopup, param);

        ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridAlertsOpen';

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

        var method = 'GetAlertResultsDetails';
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

    function getAlertGridDetails(gID, modelPopup, param) {

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
            { name: 'UniqueDeviceId', map: 'UNIQUEDEVICEID' },
            { name: 'AlertTypeId', map: 'AlertTypeId' },
            { name: 'DeviceAlertId', map: 'DEVICEALERTID' },
            { name: "SerialNumber", map: 'SERIALNUMBER' },
            { name: 'DeviceId', map: 'DEVICEID' },
            { name: 'Component', map: 'COMPONENT' }, 
            { name: 'PREVIOUSHIERARCHYNAME', map: 'PREVIOUSHIERARCHYNAME', type: 'string' },
            { name: 'HierarchyFullPath', map: 'HIERARCHYFULLPATH', type: 'string' },
            { name: 'ModelName', map: 'MODELNAME' },
            { name: 'ComputedDeviceStatus', map: 'COMPUTEDDEVICESTATUS' },
            { name: 'EventReceivedDate', map: 'EVENTRECEIVEDDATE', type: 'date' },
            { name: 'EventRaisedDate', map: 'EVENTRAISEDDATE' },
            { name: 'Severity', map: 'SEVERITY' },
            { name: 'AlertName', map: 'ALERTNAME' },
            { name: 'Description', map: 'DESCRIPTION' },
            { name: 'Details', map: 'DETAILS' },
            { name: 'IsNoteExists', map: 'ISNOTEEXISTS' },
            { name: 'Notes', map: 'Notes' }
        ];
        //for grid local storage//

        // reset filter
        self.clearfilter = function (gridId) {
            gridFilterClear(gridId);
        }

        ///for statemanage
        var InitGridStoragObj = initGridStorageObj(gID, ENUM.get("CALLTYPE_DAY"));
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var source = {
            dataType: 'json',
            dataFields: sourceDataFieldsArr,
            root: 'DeviceAlerts',
            type: 'POST',
            data: param,

            url: AppConstants.get('API_URL') + "/GetAlertResultsDetails",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getAlertResultsDetailsResp)
                    data.getAlertResultsDetailsResp = $.parseJSON(data.getAlertResultsDetailsResp);
                else
                    data.getAlertResultsDetailsResp = [];

                if (data.getAlertResultsDetailsResp != null && data.getAlertResultsDetailsResp.PaginationResponse) {
                    source.totalrecords = data.getAlertResultsDetailsResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getAlertResultsDetailsResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                    if (data.getAlertResultsDetailsResp)
                        data.getAlertResultsDetailsResp.DeviceAlerts = [];
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
                    $("#disabledBtn").prop("disabled", true);
                    var columnSortFilter = new Object();

                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterAlertOpen, gID, gridStorage, 'OpenAlerts', 'EventReceivedDate');
                    param.getAlertResultsDetailsReq.ColumnSortFilter = columnSortFilter;
                    koUtil.GlobalColumnFilter = columnSortFilter;
                    globalColumnFilter = columnSortFilter;
                    if (koUtil.isDeviceProfile() == true) {
                        param.getAlertResultsDetailsReq.CallType = ENUM.get("CALLTYPE_NONE");
                    } else {
                        param.getAlertResultsDetailsReq.CallType = CallType
                    }

                    param.getAlertResultsDetailsReq.Pagination = getPaginationObject(param.getAlertResultsDetailsReq.Pagination, gID);

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

                    //if (gridStorageAd[0].adSearchObj) {
                    //    //alert('in');
                    //    if (gridStorageAd[0].adSearchObj.SearchText || gridStorageAd[0].adSearchObj.SearchText != undefined) {
                    //        ADSearchUtil.deviceSearchObj = gridStorageAd[0].adSearchObj;
                    //    } else {
                    //        ADSearchUtil.deviceSearchObj = '';
                    //    }

                    //} else {
                    //    //alert('is null')
                    //    ADSearchUtil.deviceSearchObj = '';
                    //}

                    updatepaginationOnState(gID, gridStorage, param.getAlertResultsDetailsReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage, param.getAlertResultsDetailsReq.CallType);
                    //if (gridStorage[0].isGridReady == 1) {
                    //    gridStorage[0].Pagination = param.getAlertResultsDetailsReq.Pagination;
                    //    gridStorage[0].CallType = param.getAlertResultsDetailsReq.CallType;
                    //    var updatedGridStorage = JSON.stringify(gridStorage);
                    //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);

                    //}
                    /////end 
                    var customData = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));

                    if (customData) {
                        ADSearchUtil.deviceSearchObj = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
                        ADSearchUtil.SearchText = sessionStorage.getItem(gID + 'CustomSearchText');
                        $("#deviceCriteriaDiv").empty();
                        $("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
                    }
                    param.getAlertResultsDetailsReq.DeviceSearch = ADSearchUtil.deviceSearchObj;  ///Advance Search
                    //alert('ad search==' + JSON.stringify(ADSearchUtil.deviceSearchObj.SearchText));
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    if (data) {// <!----changes1----->

                        if (data.getAlertResultsDetailsResp && data.getAlertResultsDetailsResp.DeviceAlerts) {
                            for (var i = 0; i < data.getAlertResultsDetailsResp.DeviceAlerts.length; i++) {
                                data.getAlertResultsDetailsResp.DeviceAlerts[i].EVENTRAISEDDATE = convertToDeviceZonetimestamp(data.getAlertResultsDetailsResp.DeviceAlerts[i].EVENTRAISEDDATE);
                                data.getAlertResultsDetailsResp.DeviceAlerts[i].EVENTRECEIVEDDATE = convertToLocaltimestamp(data.getAlertResultsDetailsResp.DeviceAlerts[i].EVENTRECEIVEDDATE);
                                if (data.getAlertResultsDetailsResp.DeviceAlerts[i].ISSEVERITYAPPLICABLE != null) {
                                    if (data.getAlertResultsDetailsResp.DeviceAlerts[i].ISSEVERITYAPPLICABLE == true) {
                                        if (data.getAlertResultsDetailsResp.DeviceAlerts[i].SEVERITY == "High") {
                                            data.getAlertResultsDetailsResp.DeviceAlerts[i].SEVERITY = "High";
                                        } else if (data.getAlertResultsDetailsResp.DeviceAlerts[i].SEVERITY == "Low") {
                                            data.getAlertResultsDetailsResp.DeviceAlerts[i].SEVERITY = "Low";
                                        } else if (data.getAlertResultsDetailsResp.DeviceAlerts[i].SEVERITY == "Medium") {
                                            data.getAlertResultsDetailsResp.DeviceAlerts[i].SEVERITY = "Medium";
                                        }
                                    }
                                }
                            }
                            enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                            initfieldsArr = sourceDataFieldsArr;

                            //Advance
                            ADSearchUtil.localDynamicColumns = [];//<!---advance search changes--->
                            if (data.getAlertResultsDetailsResp) { // <!----changes2----->
                                if (data.getAlertResultsDetailsResp.DynamicColumns) {
                                    DynamicColumns = data.getAlertResultsDetailsResp.DynamicColumns;
                                    for (var i = 0; i < data.getAlertResultsDetailsResp.DynamicColumns.length; i++) {
                                        var FieldSource = _.where(sourceDataFieldsArr, { name: data.getAlertResultsDetailsResp.DynamicColumns[i].AttributeName });
                                        if (FieldSource == '') {
                                            var dynamicObj = new Object();
                                            dynamicObj.name = data.getAlertResultsDetailsResp.DynamicColumns[i].AttributeName;
                                            dynamicObj.map = data.getAlertResultsDetailsResp.DynamicColumns[i].AttributeName.toUpperCase();
                                            if (data.getAlertResultsDetailsResp.DynamicColumns[i].ControlType == 'Date') {
                                                dynamicObj.type = 'date';
                                            }
                                            ADSearchUtil.newAddedDataFieldsArr.push(dynamicObj);
                                            var exportDynamicColumns = new Object();
                                            exportDynamicColumns.AttributeName = data.getAlertResultsDetailsResp.DynamicColumns[i].AttributeName;
                                            exportDynamicColumns.AttributeType = data.getAlertResultsDetailsResp.DynamicColumns[i].AttributeType;
                                            exportDynamicColumns.ControlType = data.getAlertResultsDetailsResp.DynamicColumns[i].ControlType;
                                            exportDynamicColumns.DisplayName = data.getAlertResultsDetailsResp.DynamicColumns[i].DisplayName;
                                            exportDynamicColumns.FilterSource = data.getAlertResultsDetailsResp.DynamicColumns[i].FilterSource;
                                            exportDynamicColumns.IsCustomAttribute = data.getAlertResultsDetailsResp.DynamicColumns[i].IsCustomAttribute;
                                            exportDynamicColumns.IsInDeviceTimeZone = data.getAlertResultsDetailsResp.DynamicColumns[i].IsInDeviceTimeZone;
                                            ADSearchUtil.ExportDynamicColumns.push(exportDynamicColumns);
                                        }
                                        var ColumnSource = _.where(gridColumns, { datafield: data.getAlertResultsDetailsResp.DynamicColumns[i].AttributeName });

                                        var coulmnObj = new Object();
                                        coulmnObj.text = i18n.t(data.getAlertResultsDetailsResp.DynamicColumns[i].DisplayName, { lng: lang });
                                        coulmnObj.datafield = data.getAlertResultsDetailsResp.DynamicColumns[i].AttributeName;
                                        coulmnObj.editable = false;
                                        coulmnObj.minwidth = 200;
                                        coulmnObj.width = 'auto';
                                        coulmnObj.enabletooltips = true;
                                        if (data.getAlertResultsDetailsResp.DynamicColumns[i].ControlType == 'Date') {
                                            coulmnObj.cellsformat = LONG_DATETIME_GRID_FORMAT;
                                        }
                                        coulmnObj.filtertype = "custom";
                                        if (data.getAlertResultsDetailsResp.DynamicColumns[i].ControlType == 'TextBox') {
                                            coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
                                        } else if (data.getAlertResultsDetailsResp.DynamicColumns[i].ControlType == 'MultiCombo' || data.getAlertResultsDetailsResp.DynamicColumns[i].ControlType == 'Combo') {
                                            coulmnObj.createfilterpanel = function (datafield, filterPanel) {
                                                var FilterSource = AppConstants.get(datafield);
                                                buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource);
                                            };
                                        } else if (data.getAlertResultsDetailsResp.DynamicColumns[i].ControlType == 'Date') {
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

                            if (data.getAlertResultsDetailsResp && data.getAlertResultsDetailsResp.DeviceAlerts != '') {
                                if (autho.checkRightsBYScreen('Alerts', 'IsModifyAllowed')) {
                                    $("#disabledBtn").prop("disabled", false);
                                }
                                if (data.getAlertResultsDetailsResp.TotalSelectionCount != 'undefined') {
                                    gridStorage[0].TotalSelectionCount = data.getAlertResultsDetailsResp.TotalSelectionCount;
                                    var updatedGridStorage = JSON.stringify(gridStorage);
                                    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                                }

                                if (data.getAlertResultsDetailsResp != null && data.getAlertResultsDetailsResp.PaginationResponse) {
                                    //if (data.getAlertResultsDetailsResp.PaginationResponse.HighLightedItemPage > 0) {
                                    //    //for (var h = 0; h < data.getAlertResultsDetailsResp.DeviceAlerts.length; h++) {
                                    //    //if (data.getAlertResultsDetailsResp.DeviceAlerts[h].DEVICEALERTID == data.getAlertResultsDetailsResp.PaginationResponse.HighLightedItemId) {
                                    //    gridStorage[0].highlightedPage = data.getAlertResultsDetailsResp.PaginationResponse.HighLightedItemPage;
                                    //    var updatedGridStorage = JSON.stringify(gridStorage);
                                    //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                                    //    //}
                                    //    //}
                                    //}
                                }
                            } else {
                                data.getAlertResultsDetailsResp = new Object();
                                data.getAlertResultsDetailsResp.DeviceAlerts = [];
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
                    }
                    $('.all-disabled').hide();
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                    openAlertpopup(2, 'network_error');// <!----changes4----->
                }
            }
        );


        //for allcheck
        var rendered = function (element) {
            if (isAlertsCheck == true) {
                enablegridfunctions(gID, 'DeviceAlertId', element, gridStorage, true, 'pagerDivAlertsOpen', true, 0, 'DeviceAlertId', null, null, null);
            } else {
                enablegridfunctions(gID, 'DeviceAlertId', element, gridStorage, false, 'pagerDivAlertsOpen', true, 0, 'DeviceAlertId', null, null, null);
            }
            return true;
        }

        //for device profile
        function SerialNoRendereOpenAlert(row, columnfield, value, defaulthtml, columnproperties) {
            var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
            return html;
        }

        var deviceStatusRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }

        //open popup on notes button click
        var notesRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            if (value == true) {
                return '<div class="btn btn-xs btn-default" style="color: black; margin-left: 50%; left: -15px; top: 7px; position: relative;"><a style="color: black;" tabindex="0" title="Click to view notes" onClick="modelEditOpenAlert(' + row + ')"><i class="icon-pencil"></i></a></div>'
            } else if (value == false) {
                return " ";
            }
        }

        var severityRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {

            var isSeverityApplicableFlag = $("#" + gID).jqxGrid('getcellvalue', row, 'IsSeverityApplicable');
            if (value == "Low") {
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Low_severity"></div></a>' + value + '</span></div>';
            } else if (value == "High") {
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg high_Severity"></div></a>' + value + '</span></div>';
            } else if (value == "Medium") {
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Medium_severity"></div></a>' + value + '</span></div>';
            } else if (value == "Not Applicable") {
                defaultHtml = '<div style="padding-left:5px;padding-top:7px;" disabled="disabled"><a  id="imageId" class="btn default" style="padding-left: 0px; color: #18f008" height="60" width="50"></a>' + value + '</div>';
            }
            return defaultHtml;
        }

        var descriptionToolTipRenderer = function (row, column, value, defaultHtml) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);

            if (!_.isEmpty(rowData) && !_.isEmpty(rowData.Details)) {
                var description = "Description: " + value;
                var details = "Details: " + rowData.Details;
                var tooltip = description + '\n\n' + details;
                return '<div style="padding-left:5px;padding-top:6px;overflow:hidden;text-overflow:ellipsis;"><span title="' + tooltip + '"> ' + value + ' </span></div>'
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

        var initialColumnFilter = function () {
            return initialColumnFilterBuilder(gridStorage);
        }();

        //for ad Search
        gridColumns = [
            {
                text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false,
                datafield: 'isSelected', width: 40, renderer: function () {
                    return '<div><div style="margin-left: 10px; margin-top: 2px;"></div></div>';
                }, rendered: rendered
            },
            { text: '', hidden: true, datafield: 'DeviceAlertId', editable: false, width: '100px' },
            {
                text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 120, enabletooltips: false,
                filtertype: "custom", cellsrenderer: SerialNoRendereOpenAlert,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 120,
                filtertype: "custom", cellsrenderer: SerialNoRendereOpenAlert,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, enabletooltips: false, minwidth: 100,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
                }
            },
            {
                text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 150, cellsrenderer: deviceStatusRenderer,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
                }
            },
            {
                text: i18n.t('from_hierarchy_path', { lng: lang }), datafield: 'PREVIOUSHIERARCHYNAME', editable: false, minwidth: 180,
                filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('to_hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 180,
                filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {

                text: i18n.t('component', { lng: lang }), dataField: 'Component', editable: false, minwidth: 120, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Component');
                }
            },
            {
                text: i18n.t('alert_type', { lng: lang }), datafield: 'AlertName', enabletooltips: true, editable: false, minwidth: 100,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Alerts');
                }
            },
            {
                text: i18n.t('description', { lng: lang }), datafield: 'Description', editable: false, enabletooltips: false, minwidth: 100, cellsrenderer: descriptionToolTipRenderer,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('severity', { lng: lang }), editable: false, datafield: 'Severity', minwidth: 110, cellsrenderer: severityRenderer,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Severity');
                }
            },
            {
                text: i18n.t('received_date', { lng: lang }), datafield: 'EventReceivedDate', filter: initialColumnFilter, cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 180, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);

                }
            },
            {
                text: i18n.t('raised_date', { lng: lang }), datafield: 'EventRaisedDate', filtertype: 'date', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 180, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);

                }
            },
            {
                text: i18n.t('notes', { lng: lang }), datafield: 'IsNoteExists', menu: false, filterable: false, sortable: false, editable: false, enabletooltips: false, minwidth: 50, cellsrenderer: notesRenderer
            }
        ];
        //end Ad Search


        $("#" + gID).jqxGrid(
            {
                height: gridHeightFunction(gID, "1"),
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
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                rowsheight: 32,
                enabletooltips: true,
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
                    callOnGridReady(gID, gridStorage, CallType, 'EventReceivedDate');

                    //if (gridStorage[0].isgridState) {
                    //    CallType = gridStorage[0].CallType; //ENUM.get("CALLTYPE_NONE");
                    //    $("#jqxgridAlertsOpen").jqxGrid('loadstate', gridStorage[0].isgridState);
                    //    if (gridStorage[0].Pagination) {
                    //        if (gridStorage[0].Pagination.PageNumber != 1) {
                    //            //alert(' in paged');
                    //            $("#" + gID).jqxGrid('gotopage', gridStorage[0].Pagination.PageNumber - 1);
                    //        }
                    //    }
                    //}
                    //else {
                    //    if (koUtil.isDeviceProfile() == false) {
                    //        CallType = gridStorage[0].CallType;
                    //        addDefaultfilter(gridStorage[0].CallType, 'EventReceivedDate', gID);
                    //    }
                    //}

                    var columns = genericHideShowColumn(gID, true, []);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                },
            });
        //
        getGridBiginEdit(gID, 'DeviceAlertId', gridStorage);

        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'DeviceAlertId');


        // open popup on row double click
        $("#" + gID).on('rowdoubleclick', function (event) {
            globalVariableForEditAlerts = event.args.row.bounddata;
            var row = event.args.rowindex;

            modelEditOpenAlert(row);

            //if (globalVariableForEditAlerts.IsNoteExists == true) {
            //    modelEditOpenAlert(row);
            //}

        });

    }

    function getAlertOpenParameters(isExport, columnSortFilterAlertOpen, selectedAlertOpenItems, unselectedAlertOpenItems, checkAll, deviceSearchObj, visibleColumns) {
        var getAlertResultsDetailsReq = new Object();
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
                Export.ExportReportType = ENUM.get('OpenAlerts');
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
                Export.ExportReportType = ENUM.get('OpenAlerts');
            }
        }

        var ColumnSortFilter = columnSortFilterAlertOpen;
        getAlertResultsDetailsReq.ColumnSortFilter = ColumnSortFilter;
        getAlertResultsDetailsReq.DeviceSearch = deviceSearchObj;
        getAlertResultsDetailsReq.AlertSeverity = ENUM.get("SEVERITY_ALL");
        getAlertResultsDetailsReq.AlertStatus = ENUM.get("STATUS_OPEN");
        getAlertResultsDetailsReq.AlertTypeId = 0;
        getAlertResultsDetailsReq.CallType = CallType;
        getAlertResultsDetailsReq.Export = Export;
        getAlertResultsDetailsReq.Pagination = Pagination;
        getAlertResultsDetailsReq.Selector = Selector;
        var param = new Object();
        param.token = TOKEN();
        param.getAlertResultsDetailsReq = getAlertResultsDetailsReq;

        return param;
    }

});


//function savestate() {
//    state = $("#jqxgridAlertsOpen").jqxGrid('savestate');
//}
//function loadstate() {
//    //alert('isgridState ' + JSON.stringify(isgridState));
//    if (isgridState) {
//        $("#jqxgridAlertsOpen").jqxGrid('loadstate', isgridState);
//    } else {
//        $("#jqxgridAlertsOpen").jqxGrid('loadstate');
//    }
//}


function modelEditOpenAlert(row) {

    var gID = 'jqxgridAlertsOpen';
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

    //getnotes
    getAlertNotes(self.DeviceAlertId);

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
        retval = "NotApplicable";
    } else if (value == 1) {
        retval = "Low";
    } else if (value == 2) {
        retval = "Medium";
    } else if (value == 3) {
        retval = "High";
    }
    else if (value == 4) {
        retval = "All";
    }

    return retval;
}

function getAlertNotes(DeviceAlertId) {
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

function saveAndCloseEditAlertDetails(gId) {
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
    setAlertReq.UniqueDeviceId = 0;
    setAlertReq.IsClosedOn = true;
    setAlertReq.DeviceAlerts = deviceAlerts;
    setAlertReq.ColumnSortFilter = globalColumnFilter;
    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                //hide poup                       
                fixeddatechecKInternal = '';
                gridClearFlag = 1;
                pagechange = 1;

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
                window.sessionStorage.setItem(gId + 'gridStorage', gridStorage);

                gridRefresh('jqxgridAlertsOpen');

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

function saveEditAlertDetails() {
    var setAlertReq = new Object();
    var deviceAlerts = new Array();
    var eDeviceAlert = new Object();
    var UnSelectedItemIds = new Object();

    eDeviceAlert.DeviceAlertId = self.DeviceAlertId;
    eDeviceAlert.Notes = $("#newNotes").val();
    eDeviceAlert.Status = 0;
    eDeviceAlert.UniqueDeviceId = self.UniqueDeviceId;
    deviceAlerts.push(eDeviceAlert);

    setAlertReq.AlertTypeId = self.AlertTypeId;
    setAlertReq.CallType = ENUM.get("CALLTYPE_NONE");
    setAlertReq.DeviceId = null;
    setAlertReq.DeviceSearch = null;
    setAlertReq.UnSelectedItemIds = UnSelectedItemIds;
    setAlertReq.Notes = $("#newNotes").val();
    setAlertReq.Status = "Open";
    setAlertReq.UniqueDeviceId = 0;
    setAlertReq.IsClosedOn = false;
    setAlertReq.DeviceAlerts = deviceAlerts;
    setAlertReq.ColumnSortFilter = globalColumnFilter;
    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                //hide poup
                gridRefresh('jqxgridAlertsOpen');
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
