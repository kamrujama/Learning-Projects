define(["knockout", "koUtil", "advancedSearchUtil", "spinner"], function (ko, koUtil, ADSearchUtil) {

    var lang = getSysLang();
    columnSortFilterForDeviceReference = new Object();

    return function DashBoardViewModel() {
      
        var self = this;

        //Draggable function
        $('#deviceAdvanceSearchModalHeader').mouseup(function () {
            $("#AdvanceSearchModalContent").draggable({ disabled: true });
        });

        $('#deviceAdvanceSearchModalHeader').mousedown(function () {
            $("#AdvanceSearchModalContent").draggable({ disabled: false });
        });
        ////////////////

        $('#btnRefresh').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnRefresh').click();
            }
        });

        self.observableModelPopup = ko.observable();
        self.columnlist = ko.observableArray();
        self.templateFlag = ko.observable(false);
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'ComputedDeviceStatus', 'HierarchyFullPath', 'ReferenceSetName'];
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');

        setMenuSelection();

        //For advanced search popup
        self.AdvanceTemplateFlag = ko.observable(false);
        self.observableCriteria = ko.observable();
        self.observableAdvancedSearchModelPopup = ko.observable();
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
        loadCriteria('modalCriteria', 'genericPopup');
        ADSearchUtil.deviceSearchObj = new Object();
        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];
        ADSearchUtil.ExportDynamicColumns = [];
        ADSearchUtil.AdScreenName = 'deviceAssignmentReport';

        ADSearchUtil.initColumnsArr = ["SerialNumber", "DeviceId", "HierarchyFullPath", "ModelName", "ComputedDeviceStatus", "ReferenceSetName", "PackageName", "IsDirectAssignment", "ReferenceSetHierarchyPath"];

        /////End
        modelReposition();
        self.openPopup = function (popupName, gID) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gID);
                self.columnlist(null); //<!---advance search changes--->
                self.columnlist(genericHideShowColumn(gID, true, compulsoryfields));

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
                if (ADSearchUtil.resetAddSerchFlag == 'reset') {
                    for (var i = 0; i < ADSearchUtil.newAddedgridColumns.length; i++) {
                        var source = _.where(self.columnlist(), { columnfield: ADSearchUtil.newAddedgridColumns[i].datafield });
                        if (source != '') {
                            self.columnlist.remove(source[0]);
                        }
                    }
                }
                //
                loadelement(popupName, 'genericPopup');
                $('#modelAssignmentID').modal('show');
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

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        // Advanced search for load criteria component add function
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
        //

        //unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
            checkIsPopUpOPen();
        };

        //unload advance serach popup
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

        //For advanced search
        ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridDeviceReferenceAssignment';
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;

        // reset filter
        self.clearfilter = function (gID) {
            gridFilterClear(gID);
        }

        // refresh grid
        self.refreshGrid = function (gID) {
            gridRefresh(gID);
        }

        //ExportToExcel 
        self.exportToExcel = function (isExport, gID) {
            visibleColumnsList = GetExportVisibleColumn(gID);
            var param = getDeviceReferenceAssignmentDetails(isExport, ADSearchUtil.deviceSearchObj, columnSortFilterForDeviceReference, visibleColumnsList);

            var datainfo = $("#" + gID).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                exportDeviceReferenceAssignmentDetails(param);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        var param = getDeviceReferenceAssignmentDetails(false, ADSearchUtil.deviceSearchObj, columnSortFilterForDeviceReference, []);

        jqxGridSetDeviceReferenceAssignmentDetails(param, 'jqxgridDeviceReferenceAssignment', self.observableAdvancedSearchModelPopup);
        seti18nResourceData(document, resourceStorage);
    };

    function exportDeviceReferenceAssignmentDetails(param) {
        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(1, 'export_Sucess');
                } 
            }
        }

        var method = 'GetDeviceReferenceSet';
        var params = JSON.stringify(param);
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
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

    function jqxGridSetDeviceReferenceAssignmentDetails(param, gID, modelPopup) {

        var gridheight = $(window).height();
        var percentValue;
        if (gridheight > 600) {
            percentValue = (20 / 100) * gridheight;
            gridheight = gridheight - 150;

            gridheight = gridheight - percentValue + 'px';


        } else {
            gridheight = '400px';
        }


        //For Advanced serach popup
        var gridColumns = [];
        var DynamicColumns = [];
        var initfieldsArr = [{ name: "SerialNumber", map: 'DeviceDetail>SerialNumber' },
        { name: 'DeviceId', map: 'DeviceDetail>DeviceId' },
        { name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath', type: 'string' },
        { name: 'ModelName', map: 'DeviceDetail>ModelName' },
        { name: 'ComputedDeviceStatus', map: 'DeviceDetail>ComputedDeviceStatus' },
        { name: 'ReferenceSetName', map: 'ReferenceSetName' },
        { name: 'PackageName', map: 'PackageName' },
        { name: 'IsDirectAssignment', map: 'IsDirectAssignment' },
        { name: 'ReferenceSetHierarchyPath', map: 'ReferenceSetHierarchyPath' },
        { name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' }
        ];
        var sourceDataFieldsArr = [{ name: "SerialNumber", map: 'DeviceDetail>SerialNumber' },
                                        { name: 'DeviceId', map: 'DeviceDetail>DeviceId' },
                                        { name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath', type: 'string' },
                                        { name: 'ModelName', map: 'DeviceDetail>ModelName' },
                                        { name: 'ComputedDeviceStatus', map:'DeviceDetail>ComputedDeviceStatus'},
                                        { name: 'ReferenceSetName', map: 'ReferenceSetName' },
                                        { name: 'PackageName', map: 'PackageName' },
                                        { name: 'IsDirectAssignment', map: 'IsDirectAssignment' },
                                        { name: 'ReferenceSetHierarchyPath', map: 'ReferenceSetHierarchyPath' },
                                        { name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' }];


        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;

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

        var source = {
            dataType: 'json',
            dataFields: [
                { name: "SerialNumber", map: 'DeviceDetail>SerialNumber' },
                { name: 'DeviceId', map: 'DeviceDetail>DeviceId' },
                { name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath', type: 'string' },
                { name: 'ModelName', map: 'DeviceDetail>ModelName' },
                { name: 'ComputedDeviceStatus', map: 'DeviceDetail>ComputedDeviceStatus' },
                { name: 'ReferenceSetName', map: 'ReferenceSetName' },
                { name: 'PackageName', map: 'PackageName' },
                { name: 'IsDirectAssignment', map: 'IsDirectAssignment' },
                { name: 'ReferenceSetHierarchyPath', map: 'ReferenceSetHierarchyPath' },
                { name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' }
            ],
            root: 'DeviceReferenceSets',
            type: 'POST',
            data: param,

            url: AppConstants.get('API_URL') + "/GetDeviceReferenceSet",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getDeviceReferenceSetResp) {
                    data.getDeviceReferenceSetResp = $.parseJSON(data.getDeviceReferenceSetResp);
                }
                else
                    data.getDeviceReferenceSetResp = [];

                if (data.getDeviceReferenceSetResp.PaginationResponse) {
                    source.totalrecords = data.getDeviceReferenceSetResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDeviceReferenceSetResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                    data.getDeviceReferenceSetResp.DeviceReferenceSets = [];
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
                   columnSortFilter = columnSortFilterFormatedData(columnSortFilterForDeviceReference, gID, gridStorage, 'DeviceAssignmentReport');
                   param.getDeviceReferenceSetReq.ColumnSortFilter = columnSortFilter;
                   param.getDeviceReferenceSetReq.Pagination = getPaginationObject(param.getDeviceReferenceSetReq.Pagination, gID);

                   var adStorage = JSON.parse(sessionStorage.getItem(gID + "adStorage"));
                   if (adStorage[0].isAdSearch == 0) {
                       if (adStorage[0].adSearchObj) {
                           ADSearchUtil.deviceSearchObj = adStorage[0].adSearchObj;
                       } else {
                           ADSearchUtil.deviceSearchObj = {};
                       }
                   } else {
                       if (adStorage[0].quickSearchObj) {
                           ADSearchUtil.deviceSearchObj = adStorage[0].quickSearchObj;
                       } else {
                           ADSearchUtil.deviceSearchObj = {};
                       }
                   }

                   updatepaginationOnState(gID, gridStorage, param.getDeviceReferenceSetReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage);
                   
                   
                   var customData =JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
                   if (customData) {
                       ADSearchUtil.deviceSearchObj = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
                       ADSearchUtil.SearchText = sessionStorage.getItem(gID + 'CustomSearchText');
                       $("#deviceCriteriaDiv").empty();
                       $("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
                   }

                   param.getDeviceReferenceSetReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                   data = JSON.stringify(param);
                   return data;
               },
               downloadComplete: function (data, status, xhr) {
                   if (data) {
                       enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                       //if (data.getDeviceReferenceSetResp) {
                       //    data.getDeviceReferenceSetResp = $.parseJSON(data.getDeviceReferenceSetResp);
                       //}
                       //for Advanced Search                      

                       ADSearchUtil.localDynamicColumns = [];//<!---advance search changes--->
                       if (data.getDeviceReferenceSetResp && data.getDeviceReferenceSetResp.DynamicColumns) {
                           DynamicColumns = data.getDeviceReferenceSetResp.DynamicColumns;
                           for (var i = 0; i < data.getDeviceReferenceSetResp.DynamicColumns.length; i++) {
                               var FieldSource = _.where(sourceDataFieldsArr, { name: data.getDeviceReferenceSetResp.DynamicColumns[i].AttributeName });
                               if (FieldSource == '') {
                                   var dynamicObj = new Object();
                                   dynamicObj.name = data.getDeviceReferenceSetResp.DynamicColumns[i].AttributeName;
                                   dynamicObj.map = 'DeviceDetail>' + data.getDeviceReferenceSetResp.DynamicColumns[i].AttributeName;
                                   if (data.getDeviceReferenceSetResp.DynamicColumns[i].ControlType == 'Date') {
                                       dynamicObj.type = 'date';
                                   }
                                   ADSearchUtil.newAddedDataFieldsArr.push(dynamicObj);
                                   var exportDynamicColumns = new Object();
                                   exportDynamicColumns.AttributeName = data.getDeviceReferenceSetResp.DynamicColumns[i].AttributeName;
                                   exportDynamicColumns.AttributeType = data.getDeviceReferenceSetResp.DynamicColumns[i].AttributeType;
                                   exportDynamicColumns.ControlType = data.getDeviceReferenceSetResp.DynamicColumns[i].ControlType;
                                   exportDynamicColumns.DisplayName = data.getDeviceReferenceSetResp.DynamicColumns[i].DisplayName;
                                   exportDynamicColumns.FilterSource = data.getDeviceReferenceSetResp.DynamicColumns[i].FilterSource;
                                   exportDynamicColumns.IsCustomAttribute = data.getDeviceReferenceSetResp.DynamicColumns[i].IsCustomAttribute;
                                   exportDynamicColumns.IsInDeviceTimeZone = data.getDeviceReferenceSetResp.DynamicColumns[i].IsInDeviceTimeZone;
                                   ADSearchUtil.ExportDynamicColumns.push(exportDynamicColumns);
                               }
                               var ColumnSource = _.where(gridColumns, { datafield: data.getDeviceReferenceSetResp.DynamicColumns[i].AttributeName });

                               var coulmnObj = new Object();
                               coulmnObj.text = i18n.t(data.getDeviceReferenceSetResp.DynamicColumns[i].DisplayName, { lng: lang });//columnArr[f].DisplayName;
                               coulmnObj.datafield = data.getDeviceReferenceSetResp.DynamicColumns[i].AttributeName;
                               coulmnObj.editable = false;
                               coulmnObj.minwidth = 200;
                               coulmnObj.width = 'auto';
                               coulmnObj.enabletooltips = true;
                               if (data.getDeviceReferenceSetResp.DynamicColumns[i].ControlType == 'Date') {
                                   coulmnObj.cellsformat = LONG_DATETIME_GRID_FORMAT;
                               }
                               coulmnObj.filtertype = "custom";
                               if (data.getDeviceReferenceSetResp.DynamicColumns[i].ControlType == 'TextBox') {
                                   coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
                               } else if (data.getDeviceReferenceSetResp.DynamicColumns[i].ControlType == 'MultiCombo' || data.getDeviceReferenceSetResp.DynamicColumns[i].ControlType == 'Combo') {
                                   coulmnObj.createfilterpanel = function (datafield, filterPanel) {
                                       var FilterSource = AppConstants.get(datafield);
                                       buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource);
                                   };
                               } else if (data.getDeviceReferenceSetResp.DynamicColumns[i].ControlType == 'Date') {
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
                       //End Advanced search
                       if (data.getDeviceReferenceSetResp && data.getDeviceReferenceSetResp.DeviceReferenceSets) {
                           if (data.getDeviceReferenceSetResp.TotalSelectionCount != 'undefined') {
                               gridStorage[0].TotalSelectionCount = data.getDeviceReferenceSetResp.TotalSelectionCount;
                               var updatedGridStorage = JSON.stringify(gridStorage);
                               window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                           }

                           if (data.getDeviceReferenceSetResp.PaginationResponse) {
                               //if (data.getDeviceReferenceSetResp.PaginationResponse.HighLightedItemPage > 0) {
                               //    //for (var h = 0; h < data.getDeviceReferenceSetResp.DeviceReferenceSets.length; h++) {
                               //        //if (data.getDeviceReferenceSetResp.DeviceReferenceSets[h].UniqueDeviceId == data.getDeviceReferenceSetResp.PaginationResponse.HighLightedItemId) {
                               //    gridStorage[0].highlightedPage = data.getDeviceReferenceSetResp.PaginationResponse.HighLightedItemPage;
                               //    var updatedGridStorage = JSON.stringify(gridStorage);
                               //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                               //        //}
                               //    //}
                               //}
                           }
                       } else {
                           data.getDeviceReferenceSetResp = new Object();
                           data.getDeviceReferenceSetResp.DeviceReferenceSets = [];
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

        var rendered = function (element) {
            enablegridfunctions(gID, 'UniqueDeviceId', element, gridStorage, false, 'pagerDivDeviceReferenceAssignment', true, 0, 'UniqueDeviceId', null, null, null);
            $('.jqx-grid-pager').css("display", "inline");
            $('.jqx-grid-pager').css("z-index", "-1");
            return true;
        }

        //for device profile
        function SerialNoRendereDeviceAssignReport(row, columnfield, value, defaulthtml, columnproperties) {
            var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
            return html;
        }

        var deviceStatusRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }

        // change value depend on condition
        var isDirectAssignmentRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var html = '';
            if (value == true) {
                html = '<div  style="padding-left:5px;padding-top:7px">Yes</div>';
            } else {
                html = '<div  style="padding-left:5px;padding-top:7px">No</div>';
            }
            return html;
        }

        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

        }
        var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
            genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
        }

        gridColumns = [
                {
                    text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false,
                    datafield: 'isSelected', width: 40, hidden: true,
                    renderer: function () {
                        return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                    },
                    rendered: rendered,
                },
                {
                    text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 90, enabletooltips: false, cellsrenderer: SerialNoRendereDeviceAssignReport,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, enabletooltips: false, minwidth: 90, enabletooltips: false, cellsrenderer: SerialNoRendereDeviceAssignReport,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 90, enabletooltips: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
                    }
                },                
                {
                    text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 100, enabletooltips: false,
                    filtertype: "custom", cellsrenderer: deviceStatusRenderer,
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
                    }
                },
                {
                    text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 130,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('rs_refrence_set', { lng: lang }), datafield: 'ReferenceSetName', editable: false, minwidth: 100,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('rs_packages', { lng: lang }), datafield: 'PackageName', editable: false, minwidth: 100,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('isdirectassignment', { lng: lang }), datafield: 'IsDirectAssignment', editable: false, minwidth: 100,  cellsrenderer: isDirectAssignmentRenderer,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelMultiChoice(filterPanel, datafield, 'ReferenceSet Assignment Status');
                    }
                },
                {
                    text: i18n.t('referenceset_hier_path', { lng: lang }), datafield: 'ReferenceSetHierarchyPath', editable: false, minwidth: 130, 
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
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
           enabletooltips: true,
           selectionmode: 'singlerow',
           theme: AppConstants.get('JQX-GRID-THEME'),
           rowsheight: 32,
           autoshowcolumnsmenubutton: false,
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
               callOnGridReady(gID, gridStorage);

               var columns = genericHideShowColumn(gID, true, []);
               koUtil.gridColumnList = new Array();
               for (var i = 0; i < columns.length; i++) {
                   koUtil.gridColumnList.push(columns[i].columnfield);
               }
               visibleColumnsList = koUtil.gridColumnList;              
           },
       });

        getGridBiginEdit(gID, 'UniqueDeviceId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'UniqueDeviceId');
    }

    function getDeviceReferenceAssignmentDetails(isExport, deviceSearchObj, columnSortFilterForDeviceReference, visibleColumns) {

        var getDeviceReferenceSetReq = new Object();
        var DeviceSearch = new Object();
        var Export = new Object();
        var Pagination = new Object();
        var HierarchyIdsWithChildren = new Object();

        HierarchyIdsWithChildren.long = 0;

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Export.VisibleColumns = visibleColumns;

        if (isExport == true) {
            Export.IsAllSelected = false;
            Export.IsExport = true;
            Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
        } else {
            Export.IsAllSelected = false;
            Export.IsExport = false;
        }

        var ColumnSortFilter = columnSortFilterForDeviceReference;

        getDeviceReferenceSetReq.ColumnSortFilter = ColumnSortFilter;
        getDeviceReferenceSetReq.DeviceSearch = deviceSearchObj;
        getDeviceReferenceSetReq.Export = Export;
        getDeviceReferenceSetReq.Pagination = Pagination;
        var param = new Object();
        param.token = TOKEN();
        param.getDeviceReferenceSetReq = getDeviceReferenceSetReq;

        return param;
    }
});