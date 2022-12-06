define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho) {

    var lang = getSysLang();
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    columnSortFilter = new Object();
    return function parameterauditappViewModel() {
        var self = this;
        self.observableParameterModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        self.clearfilter = function (gId) {
            gridFilterClear(gId);
        }
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
             
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['ApplicationName', 'ApplicationVersion', 'ParameterName'];
        self.columnlist = ko.observableArray();
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }
        //unload template
        self.unloadTempPopup = function (popupName) {
            self.observableParameterModelPopup('unloadTemplate');
        }
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableParameterModelPopup(elementname);
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
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist('');
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));               
                loadelement(popupName, 'genericPopup');
                $('#parameterDeviceModel').modal('show');
            }
        }
       
        function getparameterAudithistoryParameters(isExport, columnSortFilter, visibleColumns) {
            var getAuditParameterHistoryReq = new Object();
            var Export = new Object();
            var Selector = new Object();

            var Pagination = new Object();
            var device = new Object();

            Pagination.HighLightedItemId = null
            Pagination.PageNumber = 1;
            Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

            Export.IsAllSelected = false;
            Export.IsExport = isExport;
            Export.VisibleColumns = visibleColumns;
            var ColumnSortFilter = columnSortFilter;
            var FilterList = new Array();
            var coulmnfilter = new Object();
            coulmnfilter.FilterColumn = null;
            coulmnfilter.FilterValue = null;
            FilterList.push(coulmnfilter);            
            getAuditParameterHistoryReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
            getAuditParameterHistoryReq.CallType = ENUM.get("CALLTYPE_WEEK");
            getAuditParameterHistoryReq.Pagination = Pagination;
            getAuditParameterHistoryReq.ColumnSortFilter = ColumnSortFilter;
            getAuditParameterHistoryReq.Export = Export;

            var param = new Object();
            param.token = TOKEN();
            param.getAuditParameterHistoryReq = getAuditParameterHistoryReq;

            return param;
        }
        //end grid
        self.exportToExcel = function (isExport, gId) {
            var param = null;           
            if (gId == "jqxgridParameterAuditHistory") {
                visibleColumnsList = GetExportVisibleColumn(gId);
                param = getparameterAudithistoryParameters(true, columnSortFilter, visibleColumnsList);
            }          
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                userActivityExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }
        //open popup model
        self.closeOpenModel = function (gridID, modelGridID) {
            $('#' + gridID).jqxGrid('render');
            $("#jqxgridParameterAuditHistory").jqxGrid('updatebounddata');
            // gridFilterClear(modelGridID);
            isPopUpOpen = false;
        }
        function userActivityExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetAuditParameterHistory';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }
        //for grid
        function parameterAuditHistoryGrid(gID, param) {
            var isFilter;
            if (isparameterAuditHistoryGridFilter == undefined || isparameterAuditHistoryGridFilter == false) {
                isFilter = false;
            } else {
                isFilter = true;
            }
            isparameterAuditHistoryGridFilter = true;
            var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
            var gridStorage = InitGridStoragObj.gridStorage;
            var adStorage = InitGridStoragObj.adStorage;
            CallType = InitGridStoragObj.CallType;
            var source =
            {
                dataType: "json",
                dataFields: [
                         { name: 'isSelected', type: 'number' },
                         { name:'AuditParameterId',map:'AuditParameterId'},
                         { name: 'ApplicationName', map: 'ApplicationName', type: 'string' },
                         { name: 'ApplicationVersion', map: 'ApplicationVersion', type: 'string' },
                         { name: 'ParameterName', map: 'ParameterName', type: 'string' },
                         { name: 'ParamValue', map: 'ParamValue', type: 'string' },
                         { name: 'ParamModifiedOn', map: 'ParamModifiedOn', type: 'date' },
                         { name: 'ModifiedBy', map: 'ModifiedBy', type: 'string' },
                         { name: 'Description', map: 'Description', type: 'string' },
                ],
                root: 'AuditDetails',
                type: "POST",
                data: param,
                url: AppConstants.get('API_URL') + "/GetAuditParameterHistory",
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data.getAuditParameterHistoryResp)
                        data.getAuditParameterHistoryResp = $.parseJSON(data.getAuditParameterHistoryResp);
                    else
                        data.getAuditParameterHistoryResp = [];

                    if (data.getAuditParameterHistoryResp && data.getAuditParameterHistoryResp.PaginationResponse) {
                        source.totalrecords = data.getAuditParameterHistoryResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getAuditParameterHistoryResp.PaginationResponse.TotalPages;
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
                        columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'ParameterAuditHistory');
                        param.getAuditParameterHistoryReq.ColumnSortFilter = columnSortFilter;
                        param.getAuditParameterHistoryReq.Pagination = getPaginationObject(param.getAuditParameterHistoryReq.Pagination, gID);
                        data = JSON.stringify(param);
                        return data;
                    },
                    downloadComplete: function (data, status, xhr) {
                        enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                        if (data.getAuditParameterHistoryResp && data.getAuditParameterHistoryResp.AuditDetails) {
                            for (var i = 0; i < data.getAuditParameterHistoryResp.AuditDetails.length; i++) {
                                data.getAuditParameterHistoryResp.AuditDetails[i].ParamModifiedOn = convertToLocaltimestamp(data.getAuditParameterHistoryResp.AuditDetails[i].ParamModifiedOn);
                            }
                            //if (data.getAuditParameterHistoryResp.PaginationResponse && data.getAuditParameterHistoryResp.PaginationResponse.HighLightedItemPage > 0) {
                            //    gridStorage[0].highlightedPage = data.getAuditParameterHistoryResp.PaginationResponse.HighLightedItemPage;
                            //    var updatedGridStorage = JSON.stringify(gridStorage);
                            //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            //}
                        } else {
                            source.totalrecords = 0;
                            source.totalpages = 0;
                            data.getAuditParameterHistoryResp = new Object();
                            data.getAuditParameterHistoryResp.AuditDetails = [];

                        }
                        $('.all-disabled').hide();
                    }
                }


            var dataAdapter = intializeDataAdapter(source, request);
            //for allcheck
            var rendered = function (element) {
                enablegridfunctions(gID, 'AuditParameterId', element, gridStorage, false, 'pagerDivParameterAuditHistory', false, 0, 'AuditId', null, null, null);
                return true;
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
                height: gridHeightFunction(gID, "30"),
                pageable: true,
                editable: true,
                source: dataAdapter,
                altRows: true,
                virtualmode: true,
                pageSize: AppConstants.get('ROWSPERPAGE'),
                filterable: true,
                // filterMode: 'advanced',
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
                autoshowfiltericon: true,
                ready: function () {
                    callOnGridReady(gID, gridStorage, CallType, '');
                    var columns = genericHideShowColumn(gID, true, ['ApplicationName','ApplicationVersion','ParameterName']);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;                   
                },
                columns: [
                     {
                         text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, hidden: true, columntype: 'checkbox', enabletooltips: false,
                         datafield: 'isSelected', renderer: function () {
                             return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                         }, rendered: rendered
                     },
                        { text: '', dataField: 'AuditParameterId', hidden: true, editable: false, minwidth: 0 },
                        {
                            text: i18n.t('paremeter_audit_history_app_name', { lng: lang }), dataField: 'ApplicationName', editable: false, minwidth: 100,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                         {
                             text: i18n.t('paremeter_audit_history_app_version', { lng: lang }), dataField: 'ApplicationVersion', editable: false, minwidth: 100,
                             filtertype: "custom",
                             createfilterpanel: function (datafield, filterPanel) {
                                 buildFilterPanel(filterPanel, datafield);
                             }
                         },
                         {
                             text: i18n.t('paremeter_audit_history_parameter_name', { lng: lang }), dataField: 'ParameterName', editable: false, minwidth: 100,
                             filtertype: "custom",
                             createfilterpanel: function (datafield, filterPanel) {
                                 buildFilterPanel(filterPanel, datafield);
                             }
                         },{
                             text: i18n.t('paremeter_audit_history_parameter_value', { lng: lang }), dataField: 'ParamValue', editable: false, minwidth: 100,
                             filtertype: "custom",
                             createfilterpanel: function (datafield, filterPanel) {
                                 buildFilterPanel(filterPanel, datafield);
                             }
                         },
                          {
                              text: i18n.t('paremeter_audit_history_date', { lng: lang }), datafield: 'ParamModifiedOn', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 150, filterable: true, editable: false,
                              filtertype: "custom",
                              createfilterpanel: function (datafield, filterPanel) {
                                  buildFilterPanelDate(filterPanel, datafield);

                              }
                          },
                         {
                             text: i18n.t('paremeter_audit_history_user', { lng: lang }), dataField: 'ModifiedBy', editable: false, minwidth: 120,
                             filtertype: "custom",
                             createfilterpanel: function (datafield, filterPanel) {
                                 buildFilterPanel(filterPanel, datafield);
                             }
                         },
                          {
                              text: i18n.t('paremeter_audit_history_description', { lng: lang }), dataField: 'Description', editable: false, minwidth: 120,
                              filtertype: "custom",
                              createfilterpanel: function (datafield, filterPanel) {
                                  buildFilterPanel(filterPanel, datafield);
                              }
                          },
                ]
            });
            getGridBiginEdit(gID, 'AuditParameterId', gridStorage);
            callGridFilter(gID, gridStorage);
            callGridSort(gID, gridStorage, 'AuditParameterId');
        }
        var param = getparameterAudithistoryParameters(false, columnSortFilter);
        parameterAuditHistoryGrid("jqxgridParameterAuditHistory", param);

        seti18nResourceData(document, resourceStorage);
    }
});