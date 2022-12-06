define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, ADSearchUtil) {


    columnSortFilterForAlertHistory = new Object();
    // for grid variables
    globalSelectedIds = new Array();
    globalsampleArr = new Array();
    var lang = getSysLang();


    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });



    return function alertHistoryViewModel() {

        var self = this;


        //Draggable function
        $('#mdlAdvForAlertHistoryHeader').mouseup(function () {
            $("#mdlAdvForAlertHistoryContent").draggable({ disabled: true });
        });

        $('#mdlAdvForAlertHistoryHeader').mousedown(function () {
            $("#mdlAdvForAlertHistoryContent").draggable({ disabled: false });
        });

        $('#modelViewAlertHistoryRenderHeader').mouseup(function () {
            $("#modelViewAlertHistoryRenderContent").draggable({ disabled: true });
        });

        $('#modelViewAlertHistoryRenderHeader').mousedown(function () {
            $("#modelViewAlertHistoryRenderContent").draggable({ disabled: false });
        });
        ////////////////

        self.clearfilter = function (gId) {
            var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
            gridStorage[0].CallType = ENUM.get("CALLTYPE_NONE");
            CallType = gridStorage[0].CallType;
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);

            //CallType = ENUM.get("CALLTYPE_NONE");
            gridFilterClear(gId);

        }
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }

        // unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            $("#modelViewAlertHistoryRenderContent").css('left', '');
            $("#modelViewAlertHistoryRenderContent").css('top', '');
            $('#viewAlertModal').modal('hide');
            self.alertModelPopup(popupName);
            if (gId != null) {
                if (exportflage != null && exportflage != false) {
                    gridFilterClear(gId);
                }
            }
        };

        //unload advance serach popup
        self.unloadAdvancedSearch = function () {
            reppositionPopUp();
            ClearAdSearch = 0;
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            $("#AdvanceSearchModal").modal('hide');
            $("#mainPageBody").removeClass('modal-open-appendon');
            isAdpopup = '';
        }

        function reppositionPopUp() {
            $("#mdlAdvForAlertHistoryContent").css('left', '');
            $("#mdlAdvForAlertHistoryContent").css('top', '');
        }
        self.clearAdvancedSearch = function () {
            reppositionPopUp();
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
        }

        setMenuSelection();

        //open popup
        self.alertModelPopup = ko.observable();
        self.columnlist = ko.observableArray();
        self.templateFlag = ko.observable(false);
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'ComputedDeviceStatus', 'HierarchyFullPath', 'PREVIOUSHIERARCHYNAME', 'EventReceivedDate', 'Severity', 'AlertName', 'IsNoteExists'];
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');

        self.AdvanceTemplateFlag = ko.observable(false);// Advance Search
        self.observableCriteria = ko.observable();
        loadCriteria('modalCriteria', 'genericPopup');
        ADSearchUtil.deviceSearchObj = new Object()
        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];
        ADSearchUtil.AdScreenName = 'Alert History';
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;
        ADSearchUtil.ExportDynamicColumns = [];
        self.observableAdvancedSearchModelPopup = ko.observable();
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        ADSearchUtil.initColumnsArr = ["SerialNumber", "DeviceId", "Component", "HierarchyFullPath", "PREVIOUSHIERARCHYNAME", "ModelName", "ComputedDeviceStatus", "EventReceivedDate", "EventRaisedDate", "Severity", "AlertName", "Description", "Status", "ClosedDate", "FullName", "IsNoteExists"];
        modelReposition();
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

                if (ADSearchUtil.resetAddSerchFlag == 'reset') {
                    for (var i = 0; i < ADSearchUtil.newAddedgridColumns.length; i++) {
                        var source = _.where(self.columnlist(), { columnfield: ADSearchUtil.newAddedgridColumns[i].datafield });
                        if (source != '') {
                            self.columnlist.remove(source[0]);
                        }
                    }
                }
                loadelement(popupName, 'genericPopup');
                $('#viewAlertModal').modal('show');
            }

            else if (popupName == "modelViewAlertHistory") {
                loadelement(popupName, 'alerts');
                $('#viewAlertModal').modal('show');
            } else if (popupName == "modelExportSucess") {
                loadelement(popupName, 'genericPopup');
                $('#viewAlertModal').modal('show');

            } else if (popupName == 'modelAdvancedSearch') {// Advance Search
                self.AdvanceTemplateFlag(true);
                loadAdvancedSearchModelPopup(popupName, 'genericPopup');
                $('#AdvanceSearchModal').modal('show');
            }

        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.alertModelPopup(elementname);
        }
        function loadCriteria(elementname, controllerId) {    // Advance Search

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

        var param = getAlertHistoryParameters(false, columnSortFilterForAlertHistory, null, ADSearchUtil.deviceSearchObj, []);
        getAlertResultsDetails('jqxgridAlertHistory', self.observableAdvancedSearchModelPopup, param);

        ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridAlertHistory';// Advance Search

        self.expandCriteria = function () {
            if ($("#deviceCriteriaDiv").hasClass('hide')) {
                $("#deviceCriteriaDiv").removeClass('hide');
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default btn-xs" tabindex="0" role="button"  title="Collapse"><i class="icon-angle-up"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            } else {
                $("#deviceCriteriaDiv").addClass('hide')
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default btn-xs" tabindex="0" role="button"  title="Expand"><i class="icon-angle-down"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            }
        }



        //ExportToExcel 
        self.exportToExcel = function (isExport, gId) {
            var selectedData = getSelectedData(gId);
            var selectedAlertHIstoryItems = new Array();
            selectedAlertHIstoryItems.push(selectedData.DeviceAlertId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getAlertHistoryParameters(true, columnSortFilterForAlertHistory, selectedAlertHIstoryItems, ADSearchUtil.deviceSearchObj, visibleColumnsList);


            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflage = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                alertHistoryExport(param, gId, self.openPopup);
            } else {

                openAlertpopup(1, 'no_data_to_export');
            }
        }
        //ExportToExcel Goes To this Function
        function alertHistoryExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {

                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }

            var params = JSON.stringify(param);;
            ajaxJsonCall('getAlertResultsDetails', params, callBackfunction, true, 'POST', true);


        }

        seti18nResourceData(document, resourceStorage);
    }

    function generateTemplate(tempname, controllerId) {
        //new template code
        var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
        var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
        ko.components.register(tempname, {
            viewModel: { require: ViewName },
            template: { require: 'plugin/text!' + htmlName }
        });
        // end new template code
    }

    //for grid

    function getAlertResultsDetails(gID, modelPopup, param) {


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
            { name: 'UniqueDeviceId', map: 'UNIQUEDEVICEID' },
            { name: 'DeviceAlertId', map: 'DEVICEALERTID' },
            { name: 'SerialNumber', map: 'SERIALNUMBER' },
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
            { name: 'Status', map: 'STATUS' },
            { name: 'ClosedDate', map: 'CLOSEDDATE', type: 'date' },
            { name: 'FullName', map: 'FULLNAME' },
            { name: 'IsNoteExists', map: 'ISNOTEEXISTS' },
            { name: 'Description', map: 'DESCRIPTION' },
            { name: 'Details', map: 'DETAILS' },
            { name: 'Notes', map: 'Notes' }
        ];

        var InitGridStoragObj = initGridStorageObj(gID, ENUM.get("CALLTYPE_DAY"));
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var source = {
            dataType: "json",
            datafields: sourceDataFieldsArr,

            root: 'DeviceAlerts',
            type: "POST",
            data: param,
            url: AppConstants.get('API_URL') + "/GetAlertResultsDetails",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getAlertResultsDetailsResp)
                    data.getAlertResultsDetailsResp = $.parseJSON(data.getAlertResultsDetailsResp);
                else
                    data.getAlertResultsDetailsResp = [];

                if (data.getAlertResultsDetailsResp && data.getAlertResultsDetailsResp.PaginationResponse) {
                    source.totalrecords = data.getAlertResultsDetailsResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getAlertResultsDetailsResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                    if (data.getAlertResultsDetailsResp)
                        data.getAlertResultsDetailsResp.DeviceAlerts = [];
                }
            },

        };

        ///custom pager
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
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForAlertHistory, gID, gridStorage, 'AlertHistory', 'EventReceivedDate');

                    param.getAlertResultsDetailsReq.ColumnSortFilter = columnSortFilter;


                    param.getAlertResultsDetailsReq.CallType = CallType;

                    ///for staemangment

                    ///for staemangment
                    var adStorage = JSON.parse(sessionStorage.getItem(gID + "adStorage"));
                    //alert('11111111111111===' + JSON.stringify(adStorage[0].adSearchObj));

                    if (adStorage[0].isAdSearch == 0) {
                        if (adStorage[0].adSearchObj) {
                            ADSearchUtil.deviceSearchObj = adStorage[0].adSearchObj;
                        } else {
                            //alert('else1')
                            ADSearchUtil.deviceSearchObj = null;
                        }
                    } else {
                        if (adStorage[0].quickSearchObj) {
                            ADSearchUtil.deviceSearchObj = adStorage[0].quickSearchObj;
                        } else {

                            ADSearchUtil.deviceSearchObj = null;
                        }
                    }

                    updatepaginationOnState(gID, gridStorage, param.getAlertResultsDetailsReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage, param.getAlertResultsDetailsReq.CallType);
                    //if (gridStorage[0].isGridReady == 1) {
                    //    gridStorage[0].Pagination = param.getAlertResultsDetailsReq.Pagination;
                    //    gridStorage[0].CallType = param.getAlertResultsDetailsReq.CallType;
                    //    var updatedGridStorage = JSON.stringify(gridStorage);
                    //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);

                    //}
                    /////end 



                    param.getAlertResultsDetailsReq.Pagination = getPaginationObject(param.getAlertResultsDetailsReq.Pagination, gID);
                    var customData = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));

                    if (customData) {
                        ADSearchUtil.deviceSearchObj = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
                        ADSearchUtil.SearchText = sessionStorage.getItem(gID + 'CustomSearchText');
                        $("#deviceCriteriaDiv").empty();
                        $("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
                    }
                    param.getAlertResultsDetailsReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                    //alert('ad search==' + JSON.stringify(ADSearchUtil.deviceSearchObj.SearchText));
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    if (data) {

                        if (data.getAlertResultsDetailsResp && data.getAlertResultsDetailsResp.DeviceAlerts) {
                            for (var i = 0; i < data.getAlertResultsDetailsResp.DeviceAlerts.length; i++) {
                                data.getAlertResultsDetailsResp.DeviceAlerts[i].EVENTRAISEDDATE = convertToDeviceZonetimestamp(data.getAlertResultsDetailsResp.DeviceAlerts[i].EVENTRAISEDDATE);
                                data.getAlertResultsDetailsResp.DeviceAlerts[i].EVENTRECEIVEDDATE = convertToLocaltimestamp(data.getAlertResultsDetailsResp.DeviceAlerts[i].EVENTRECEIVEDDATE);
                                data.getAlertResultsDetailsResp.DeviceAlerts[i].CLOSEDDATE = convertToLocaltimestamp(data.getAlertResultsDetailsResp.DeviceAlerts[i].CLOSEDDATE);

                                if (data.getAlertResultsDetailsResp.DeviceAlerts[i].SEVERITY == "High") {
                                    data.getAlertResultsDetailsResp.DeviceAlerts[i].SEVERITY = "High";
                                } else if (data.getAlertResultsDetailsResp.DeviceAlerts[i].SEVERITY == "Low") {
                                    data.getAlertResultsDetailsResp.DeviceAlerts[i].SEVERITY = "Low";
                                } else if (data.getAlertResultsDetailsResp.DeviceAlerts[i].SEVERITY == "Medium") {
                                    data.getAlertResultsDetailsResp.DeviceAlerts[i].SEVERITY = "Medium";
                                }

                            }
                        }
                        enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                        initfieldsArr = sourceDataFieldsArr;

                        ADSearchUtil.localDynamicColumns = [];//<!---advance search changes--->
                        if (data.getAlertResultsDetailsResp) {
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
                            if (data.getAlertResultsDetailsResp) {
                                if (data.getAlertResultsDetailsResp.PaginationResponse) {
                                    //if (data.getAlertResultsDetailsResp.PaginationResponse.HighLightedItemPage > 0) {
                                    //    //for (var h = 0; h < data.getAlertResultsDetailsResp.DeviceAlerts.length; h++) {
                                    //    //if (data.getAlertResultsDetailsResp.DeviceAlerts[h].DeviceAlertId == data.getAlertResultsDetailsResp.PaginationResponse.HighLightedItemId) {
                                    //    gridStorage[0].highlightedPage = data.getAlertResultsDetailsResp.PaginationResponse.HighLightedItemPage;
                                    //    var updatedGridStorage = JSON.stringify(gridStorage);
                                    //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                                    //    //}
                                    //    //}
                                    //}
                                }
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
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                    openAlertpopup(2, 'network_error');
                }
            }
        );

        //for all check
        var rendered = function (element) {
            enablegridfunctions(gID, 'DeviceAlertId', element, gridStorage, false, 'pagerDivAlertHistory', true, 0, 'DeviceAlertId', null, null, null);
            $('.jqx-grid-pager').css("display", "inline");
            $('.jqx-grid-pager').css("z-index", "-1");
            return true;
        }


        //for device profile
        function SerialNoRendereAlertHisory(row, columnfield, value, defaulthtml, columnproperties) {
            var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
            return html;
        }

        var severityRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {

            var isSeverityApplicableFlag = $("#" + gID).jqxGrid('getcellvalue', row, 'IsSeverityApplicable');

            if (value == "Low") {
                // return '<div style="padding-left:5px;padding-top:0px;"><a  id="imageId" class="btn default" style="padding-left: 0px; color: #18f008" height="60" width="50"><i class="icon-checkmark ienable"></i></a>' + value + '</div>';
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Low_severity"></div></a>' + value + '</span></div>';
            } else if (value == "High") {
                //return '<div style="padding-left:5px;padding-top:0px;"><a  id="imageId" class="btn default" style="padding-left: 0px; color: #18f008" height="60" width="50"><i class="icon-checkmark idisabled"></i></a>' + value + '</div>';
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg high_Severity"></div></a>' + value + '</span></div>';
            } else if (value == "Medium") {
                //return '<div style="padding-left:5px;padding-top:0px;"><a  id="imageId" class="btn default" style="padding-left: 0px; color: #18f008" height="60" width="50"><i class="icon-checkmark idisabled"></i></a>' + value + '</div>';
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Medium_severity"></div></a>' + value + '</span></div>';
            } else if (value == "Not Applicable") {
                // return '<div style="padding-left:5px;padding-top:7px;" disabled="disabled"><a  id="imageId" class="btn default" style="padding-left: 0px; color: #18f008" height="60" width="50"></a>' + value + '</div>';
                defaultHtml = '<div style="padding-left:5px;padding-top:7px;" disabled="disabled"><a  id="imageId" class="btn default" style="padding-left: 0px; color: #18f008" height="60" width="50"></a>' + value + '</div>';
            }
            return defaultHtml;
        }


        //For Note Model Pop up 
        // For Notes Renderer
        var notesrenderer = function (row, value, columnfield, defaulthtml, columnproperties) {
            var status = $("#" + gID).jqxGrid('getcellvalue', row, "IsNoteExists");
            if (status == true) {
                return '<a tabindex="0" onclick="modelViewAlertHistoryRender(' + row + ')"  class="btn btn-xs btn-default" id="imageId" style="color: black; margin-left: 50%; left: -15px; top: 7px; position: relative;" title="Click to view notes" ><i class="icon-pencil" ></i></a>';
            } else {
                return '';
            }
        }

        var deviceStatusRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml);
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

        //for filter
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
                text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false,
                datafield: 'isSelected', width: 40, hidden: true,
                renderer: function () {
                    return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                },
                rendered: rendered,
            },
            { text: '', hidden: true, datafield: 'DeviceAlertId', editable: false, width: 100 },
            {
                text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 120, enabletooltips: false,
                filtertype: "custom", cellsrenderer: SerialNoRendereAlertHisory,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, enabletooltips: false, minwidth: 120,
                filtertype: "custom", cellsrenderer: SerialNoRendereAlertHisory,
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
                text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 150, cellsrenderer: deviceStatusRenderer,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
                }
            },
            {
                text: i18n.t('from_hierarchy_path', { lng: lang }), datafield: 'PREVIOUSHIERARCHYNAME', editable: false, minwidth: 130,
                filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('to_hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 130,
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
                text: i18n.t('received_date', { lng: lang }), datafield: 'EventReceivedDate', filter: initialColumnFilter, editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 180, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);

                }
            },
            {
                text: i18n.t('raised_date', { lng: lang }), datafield: 'EventRaisedDate', editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 180, enabletooltips: true, id: 'EventRaisedDate*',
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);

                }
            },
            {
                text: i18n.t('severity', { lng: lang }), datafield: 'Severity', minwidth: 110, editable: false, cellsrenderer: severityRenderer,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Severity');
                }
            },
            {
                text: i18n.t('alert_type', { lng: lang }), datafield: 'AlertName', editable: false, minwidth: 150,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Alerts');
                }
            },
            {
                text: i18n.t('description', { lng: lang }), datafield: 'Description', editable: false, enabletooltips: false, minwidth: 110, cellsrenderer: descriptionToolTipRenderer,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('status', { lng: lang }), datafield: 'Status', editable: false, minwidth: 90, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Alert Status');
                }
            },
            {
                text: i18n.t('close_date_alert', { lng: lang }), datafield: 'ClosedDate', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 180, enabletooltips: true,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);

                }
            },
            {
                text: i18n.t('close_by_alert', { lng: lang }), datafield: 'FullName', menu: false, filterable: false, sortable: false, editable: false, minwidth: 100,

            },
            {
                text: i18n.t('notes', { lng: lang }), datafield: 'IsNoteExists', autoshowfiltericon: false, filterable: false, menu: false, sortable: false, resizable: false, enabletooltips: false, editable: false, minwidth: 50, cellsrenderer: notesrenderer

            },
        ];
        //end Grid Advance search

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


                    callOnGridReady(gID, gridStorage, CallType, 'EventReceivedDate');

                    //if (gridStorage[0].isgridState) {
                    //    CallType = gridStorage[0].CallType; //ENUM.get("CALLTYPE_NONE");
                    //    $("#" + gID).jqxGrid('loadstate', gridStorage[0].isgridState);
                    //    if (gridStorage[0].Pagination.PageNumber != 1) {
                    //        $("#" + gID).jqxGrid('gotopage', gridStorage[0].Pagination.PageNumber - 1);
                    //    }
                    //}
                    //else {

                    //        CallType = gridStorage[0].CallType;
                    //        addDefaultfilter(gridStorage[0].CallType, 'EventReceivedDate', gID);
                    //}

                    //gridStorage[0].isGridReady = 1;
                    //var updatedGridStorage = JSON.stringify(gridStorage);
                    //window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);

                    //CallType = addDefaultfilter(CallType, 'EventReceivedDate', gID);

                    var columns = genericHideShowColumn(gID, true, []);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                    //$("#" + gID).jqxGrid("addrow", null, {});
                    //var cols = $("#jqxGrid").columns;
                    //alert('ccccccc ' + cols.length);
                },

            });
        //
        getGridBiginEdit(gID, 'DeviceAlertId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'DeviceAlertId');

        //$("#" + gID).on('bindingcomplete', function (event) {

        //    alert("BindingComplete");

        //    var textData = new Array();
        //    var cols = $("#" + gID).jqxGrid("columns");
        //    for (var i = 0; i < cols.records.length; i++) {
        //        textData[i] = cols.records[i].datafield;



        //    }


        //    var columnarrayInfoForColumnWidth = new Array();
        //    var VisibleColumnCount = 0;
        //    var gridHeaderText = "";
        //    var gridWidth = $("#" + gID).width();
        //    for (var l = 0; l < textData.length; l++) {
        //        var columnInfo = new Object();

        //        columnInfo.isHidden = $("#" + gID).jqxGrid('getcolumnproperty', textData[l], 'hidden');
        //        if (columnInfo.isHidden == false) {
        //            VisibleColumnCount++;
        //            columnInfo.datafield = $("#" + gID).jqxGrid('getcolumnproperty', textData[l], 'datafield');
        //            columnInfo.width = $("#" + gID).jqxGrid('getcolumnproperty', textData[l], 'width');
        //            columnInfo.text = $("#" + gID).jqxGrid('getcolumnproperty', textData[l], 'text');
        //            gridHeaderText = gridHeaderText + columnInfo.text;
        //        }


        //        columnarrayInfoForColumnWidth.push(columnInfo);
        //    }


        //    ////alert(JSON.stringify(VisibleColumnCount + "------------" + JSON.stringify(columnarrayInfoForColumnWidth)));


        //    for (m = 0; m < columnarrayInfoForColumnWidth.length; m++) {

        //        var columnWidth = 100 / VisibleColumnCount;

        //        //  alert(columnarrayInfoForColumnWidth[m].datafield);
        //        if (columnarrayInfoForColumnWidth[m].isHidden == false) {
        //            //alert(columnarrayInfoForColumnWidth[m].text.length * 10);

        //            if (gridWidth < gridHeaderText.length * 10) {

        //                // $("#" + gID).jqxGrid('autoresizecolumns');
        //                var colWidth = $("#" + gID).jqxGrid('getcolumnproperty', columnarrayInfoForColumnWidth[m].datafield, 'minwidth');
        //                //alert(colWidth + ":" + columnarrayInfoForColumnWidth[m].datafield);
        //                $("#" + gID).jqxGrid('setcolumnproperty', columnarrayInfoForColumnWidth[m].datafield, 'minwidth', colWidth-20);
        //                //$("#" + gID).jqxGrid('setcolumnproperty', columnarrayInfoForColumnWidth[m].datafield, 'maxwidth', colWidth);
        //                alert(colWidth - 20 + ":" + colWidth);

        //            } else {
        //                // $("#" + gID).jqxGrid('setcolumnproperty', columnarrayInfoForColumnWidth[m].datafield, 'width', columnarrayInfoForColumnWidth[m].text.length * 12 + "px");
        //            }

        //        }

        //    }


        //   // alert("HeaderLength" + gridHeaderText.length);
        //   // alert($("#" + gID).width());

        //});


        $("#" + gID).on('rowdoubleclick', function (event) {
            var row = event.args.rowindex;
            globalVariableForAlertsHistory = event.args.row.bounddata

            modelViewAlertHistoryRender(row);


            //openPopup('modelViewAlertHistory');
        });
    }

    //Alert history Parameter
    function getAlertHistoryParameters(isExport, columnSortFilterForAlertHistory, selectedAlertHIstoryItems, deviceSearchObj, visibleColumns) {
        var getAlertResultsDetailsReq = new Object();
        var FilterList = new Array();

        var Export = new Object();
        var Pagination = new Object();
        var Selector = new Object();
        Export.DynamicColumns = null;
        Export.VisibleColumns = visibleColumns;
        if (isExport == true) {
            Export.ExportReportType = ENUM.get("AlertHistory");
            Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
            Export.IsAllSelected = false;
            Export.IsExport = true;
        } else {
            Export.ExportReportType = ENUM.get("AlertHistory");
            Export.IsAllSelected = false;
            Export.IsExport = false;
        }


        var ColumnSortFilter = columnSortFilterForAlertHistory;
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        Pagination.HighLightedItemId = null;
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Selector.SelectedItemIds = null;
        Selector.UnSelectedItemIds = null;

        getAlertResultsDetailsReq.AlertSeverity = ENUM.get("SEVERITY_ALL");
        getAlertResultsDetailsReq.AlertStatus = ENUM.get("STATUS_ALL");
        getAlertResultsDetailsReq.AlertTypeId = 0;
        getAlertResultsDetailsReq.CallType = CallType;
        getAlertResultsDetailsReq.ColumnSortFilter = ColumnSortFilter;
        getAlertResultsDetailsReq.DeviceSearch = deviceSearchObj;
        getAlertResultsDetailsReq.Export = Export;
        getAlertResultsDetailsReq.Pagination = Pagination;
        getAlertResultsDetailsReq.Selector = Selector;
        getAlertResultsDetailsReq.UniqueDeviceId = null;
        var param = new Object();
        param.token = TOKEN();
        param.getAlertResultsDetailsReq = getAlertResultsDetailsReq;
        return param;
    }
});

function modelViewAlertHistoryRender(row) {

    var self = this;

    self.alertName = $("#jqxgridAlertHistory").jqxGrid('getcellvalue', row, "AlertName");
    var severity = $("#jqxgridAlertHistory").jqxGrid('getcellvalue', row, "Severity");
    self.modelName = $("#jqxgridAlertHistory").jqxGrid('getcellvalue', row, "ModelName");
    self.deviceId = $("#jqxgridAlertHistory").jqxGrid('getcellvalue', row, "DeviceId");
    self.notes = $("#jqxgridAlertHistory").jqxGrid('getcellvalue', row, "Notes");
    self.serialNumber = $("#jqxgridAlertHistory").jqxGrid('getcellvalue', row, "SerialNumber");
    self.eventReceivedDate = $("#jqxgridAlertHistory").jqxGrid('getcellvalue', row, "EventReceivedDate");
    self.deviceAlertId = $("#jqxgridAlertHistory").jqxGrid('getcellvalue', row, "DeviceAlertId");
    self.PreviousNotes = '';
    var alertDate = CreatJSONDateLocal(self.eventReceivedDate);
    var alertDateDisplay = jsonDateConversion(alertDate, LONG_DATETIME_FORMAT_AMPM);
    retval = "";


    if (severity == 0) {
        retval = "Low";
    } else if (severity == 1) {
        retval = "Medium";
    } else if (severity == 2) {
        retval = "High";
    } else if (severity == 3) {
        retval = "All";
    }
    else {
        retval = severity;
    }


    $("#recievedDate").empty();
    $("#modelName").empty();
    $("#alertType").empty();
    $("#severity").empty();
    $("#serialNumber").empty();
    $("#deviceId").empty();
    $("#PreviousNotes").empty();

    $("#recievedDate").text(alertDateDisplay);
    $("#modelName").text(self.modelName);
    $("#alertType").text(self.alertName);
    $("#severity").text(retval);
    $("#serialNumber").text(self.serialNumber);
    $("#deviceId").text(self.deviceId);
    $("#PreviousNotes").text(self.PreviousNotes);


    $("#modelViewAlertHistoryRender").modal('show');
    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                self.PreviousNotes = data.notes;
                //  $('#PreviousNotes').prop("disabled", "disabled");
                $("#PreviousNotes").text(self.PreviousNotes);
            }
        }
    }

    var method = 'GetAlertNotes';
    var params = '{"token":"' + TOKEN() + '" ,"deviceAlertId":"' + deviceAlertId + '"}';
    ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}




