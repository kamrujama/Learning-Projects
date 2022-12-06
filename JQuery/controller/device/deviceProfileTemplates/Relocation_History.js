define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho) {

    SelectedIdOnGlobale = new Array
    columnSortFilter = new Object();
    packageNameApplication = "";
    var lang = getSysLang();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function downloadLibararyappViewModel() {
 

        SelectedIdOnGlobale = new Array();
        checkALlPageId = 0;
        pagechangedcheck = 0;
        totalselectedRowCount = 0;
        var self = this;
        self.checksample = ko.observable();
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ["SerialNumber","ModifiedOn","CurrentDeviceSubStatus"];
        self.columnlist = ko.observableArray();

        self.clearfilter = function (gId) {
            gridFilterClear(gId);
        }
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }
        function getSelectedIds() {
            return SelectedIdOnGlobale;
        }

        //clear filter of application
        self.clearfilterApplication = function (gridId) {
            clearUiGridFilter(gridId);
        }

        //export application 
        self.exportToExcelApplication = function (gridId) {
            var dataInfo = $("#" + gridId).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                $("#" + gridId).jqxGrid('exportdata', 'csv', 'Application');
                openAlertpopup(1, 'export_Information');
                $("#loadingDiv").hide();
            }
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }
        modelReposition();
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));
                loadelement(popupName, 'genericPopup');
                $('#downloadModel').modal('show');
            }
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
        }
        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
        }

        self.exportToExcel = function (isExport, gId) {
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getRelocationHistoryParameters(true, columnSortFilter, visibleColumnsList);

            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflag = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                userActivityExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function userActivityExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    } 
                }
            }
            var method = 'GetDeviceMovementAndStatusChangeHistory';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }



        var param = getRelocationHistoryParameters(false, columnSortFilter, []);
        relocationHistoryGrid('jqxgridRelocationHistory', param);

        seti18nResourceData(document, resourceStorage);
    };

    //for grid
    function relocationHistoryGrid(gID, param) {
        
        CallType = ENUM.get("NONE");
        var isFilter;
        if (isRelocationStatusHistoryFilter == undefined || isRelocationStatusHistoryFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        isRelocationStatusHistoryFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;

        var source =
        {
            dataType: "json",
            dataFields: [
                     { name: 'isSelected', type: 'number' },
                     { name: 'SerialNumber', map: 'SerialNumber' },
                     { name: 'ModifiedOn', map: 'ModifiedOn', type: 'date' },
                     { name: 'PreviousHierarchyPath', map: 'PreviousHierarchyPath' },
                     { name: 'CurrentHierarchyPath', map: 'CurrentHierarchyPath' },
                     { name: 'PreviousDeviceStatus', map: 'PreviousDeviceStatus' },
                     { name: 'CurrentDeviceStatus', map: 'CurrentDeviceStatus' },
                     { name: 'PreviousDeviceSubStatus', map: 'PreviousDeviceSubStatus' },
                     { name: 'CurrentDeviceSubStatus', map: 'CurrentDeviceSubStatus' },
                     { name: 'ModifiedByUserName', map: 'ModifiedByUserName' },
            ],
            root: 'DeviceHistoryDetails',
            type: "POST",
            data: param,

            url: AppConstants.get('API_URL') + "/GetDeviceMovementAndStatusChangeHistory",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data && data.getDeviceMovementHistoryResp) {
                    data.getDeviceMovementHistoryResp = $.parseJSON(data.getDeviceMovementHistoryResp);
                }
                else
                    data.getDeviceMovementHistoryResp = [];

                if (data.getDeviceMovementHistoryResp && data.getDeviceMovementHistoryResp.PaginationResponse) {
                    source.totalrecords = data.getDeviceMovementHistoryResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDeviceMovementHistoryResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;

                }
            },
        };

      
          request= {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'RelocationHistory');
                    param.getDeviceMovementHistoryReq.ColumnSortFilter = columnSortFilter;
                    param.getDeviceMovementHistoryReq.Pagination = getPaginationObject(param.getDeviceMovementHistoryReq.Pagination, gID);
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    //if (data && data.getDeviceMovementHistoryResp) {
                    //    data.getDeviceMovementHistoryResp = $.parseJSON(data.getDeviceMovementHistoryResp);
                    //}

                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    if (data.getDeviceMovementHistoryResp && data.getDeviceMovementHistoryResp.DeviceHistoryDetails) {

                        for (var i = 0; i < data.getDeviceMovementHistoryResp.DeviceHistoryDetails.length; i++) {
                            data.getDeviceMovementHistoryResp.DeviceHistoryDetails[i].ModifiedOn = convertToLocaltimestamp(data.getDeviceMovementHistoryResp.DeviceHistoryDetails[i].ModifiedOn);   
                        }

                        //if (data.getDeviceMovementHistoryResp.PaginationResponse && data.getDeviceMovementHistoryResp.PaginationResponse.HighLightedItemPage > 0) {
                        //    gridStorage[0].highlightedPage = data.getDeviceMovementHistoryResp.PaginationResponse.HighLightedItemPage;
                        //    var updatedGridStorage = JSON.stringify(gridStorage);
                        //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        //}

                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getDeviceMovementHistoryResp = new Object();
                        data.getDeviceMovementHistoryResp.DeviceHistoryDetails = [];

                    }
                    $('.all-disabled').hide();
                }
            }
        
        var dataAdapter = intializeDataAdapter(source, request);

        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'DeviceHistoryId', element, gridStorage, false, 'pagerDivRelocationHistory', false, 0, 'DeviceHistoryId', null, null, null);
            return true;
        }

        var fromStatus_ToStatusRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = fromStatusToStatus(gID, row, column, value, defaultHtml)
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

        var toolTipComputedRenderer = function (row, column, value, defaultHtml) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
            var text = "Status: ";
            if (value == "Pending Hierarchy Assignment") {
                defaultHtml = '<div style="padding-left:12px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-checkmark iPanding" ></i></span><span style="padding-left:13px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
            }
            if (value == "Pending Registration") {
             //   defaultHtml = '<div style="padding-left:12px;padding-top:7px;"><span ><i class="icon-pencil" style="color:blue;"></i></span><span style="padding-left:13px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
                defaultHtml = '<div style="padding-left:0px;padding-top:0px;overflow:hidden;text-overflow: ellipsis;"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg registration"></div></a>' + value + '</span></div>';
            }

            if (value == "Active") {
                defaultHtml = '<div style="padding-left:12px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-checkmark" style="color:green"></i></span><span style="padding-left:13px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
            }
            if (value == "Inactive") {
                defaultHtml = '<div style="padding-left:12px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-cross" style="color:red"></i></span><span style="padding-left:13px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
            }
            if (value == "BlackListed") {
                defaultHtml = '<div style="padding-top:3px;overflow:hidden;text-overflow: ellipsis;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="30"><div class="iconImg blacklistedStatus"></div></a><span style="padding-top:3px;" title="' + text + '' + value + '">' + value + '</span></div>';
            }
            if (value == "Deleted") {
                defaultHtml = '<div style="padding-top:3px;overflow:hidden;text-overflow: ellipsis;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="30"><div class="iconImg deletedStatus"></div></a><span style="padding-top:3px;" title="' + text + '' + value + '">' + value + '</span></div>';
            }

            return defaultHtml;
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
            sortable: true,
            columnsResize: true,
            columnsreorder: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            autoshowcolumnsmenubutton: false,
            rowsheight: 32,
            enabletooltips: true,            
            autoshowfiltericon: true,
            rendergridrows: function () {
                return dataAdapter.records;
            },

            ready: function () {
                callOnGridReady(gID, gridStorage, CallType, '');
                var columns = genericHideShowColumn(gID, true, []);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;

                var gridheight = $(window).height();
                gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 50;
                $("#" + gID).jqxGrid({ height: gridheight });
            },

            columns: [
                    {
                        text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, hidden: true, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    { text: '', dataField: 'DeviceHistoryId', hidden: true, editable: false, minwidth: 0 },
                    {
                        text: i18n.t('serial', { lng: lang }), dataField: 'SerialNumber', editable: false, minwidth: 90,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                      {
                          text: i18n.t('RH_DateofChange', { lng: lang }), datafield: 'ModifiedOn', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 150, filterable: true, editable: false,
                          filtertype: "custom",
                          createfilterpanel: function (datafield, filterPanel) {
                              buildFilterPanelDate(filterPanel, datafield);

                          }
                      },
                     {
                         text: i18n.t('RH_FromHierarchy', { lng: lang }), dataField: 'PreviousHierarchyPath', editable: false, minwidth: 150,
                         filtertype: "custom",
                         createfilterpanel: function (datafield, filterPanel) {
                             buildFilterPanel(filterPanel, datafield);
                         }
                     },
                      {
                          text: i18n.t('RH_ToHierarchy', { lng: lang }), dataField: 'CurrentHierarchyPath', editable: false, minwidth: 150,
                          filtertype: "custom",
                          createfilterpanel: function (datafield, filterPanel) {
                              buildFilterPanel(filterPanel, datafield);
                          }
                      },
                      {
                          text: i18n.t('RH_FromStatus', { lng: lang }), dataField: 'PreviousDeviceStatus', editable: false, minwidth: 130,  cellsrenderer: toolTipComputedRenderer,
                          filtertype: "custom",
                          createfilterpanel: function (datafield, filterPanel) {
                              buildFilterPanelMultiChoice(filterPanel, datafield, 'All Device Status');
                          }
                      },
                      {
                          text: i18n.t('RH_ToStatus', { lng: lang }), dataField: 'CurrentDeviceStatus', editable: false, minwidth: 130, cellsrenderer: toolTipComputedRenderer,
                          filtertype: "custom",
                          createfilterpanel: function (datafield, filterPanel) {
                              buildFilterPanelMultiChoice(filterPanel, datafield, 'All Device Status');
                          }
                      },
                       {
                           text: i18n.t('RH_FromSubStatus', { lng: lang }), dataField: 'PreviousDeviceSubStatus', editable: false, minwidth: 140, 
                           filtertype: "custom",
                           createfilterpanel: function (datafield, filterPanel) {
                               buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Sub Status');
                           }
                       },
                      {
                          text: i18n.t('RH_ToSubStatus', { lng: lang }), dataField: 'CurrentDeviceSubStatus', editable: false, minwidth: 140, 
                          filtertype: "custom",
                          createfilterpanel: function (datafield, filterPanel) {
                              buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Sub Status');
                          }
                      },
                       {
                           text: i18n.t('RH_ModifiedBy', { lng: lang }), dataField: 'ModifiedByUserName', editable: false, minwidth: 100,
                           filtertype: "custom",
                           createfilterpanel: function (datafield, filterPanel) {
                               buildFilterPanel(filterPanel, datafield);
                           }
                       },
            ]
        });
        getGridBiginEdit(gID, 'DeviceHistoryId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'DeviceHistoryId');
    }

    function getRelocationHistoryParameters(isExport, columnSortFilter, visibleColumns) {
        var getDeviceMovementHistoryReq = new Object();
        var Export = new Object();
        var Selector = new Object();

        var Pagination = new Object();
        var device = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Export.IsAllSelected = false;
        Export.IsExport = isExport;
        Export.DynamicColumns = null;
        Export.VisibleColumns = visibleColumns;

        var ColumnSortFilter = columnSortFilter;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getDeviceMovementHistoryReq.Pagination = Pagination;
        getDeviceMovementHistoryReq.DeviceId = koUtil.deviceId;
        getDeviceMovementHistoryReq.ModelName = koUtil.ModelName;
        getDeviceMovementHistoryReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        getDeviceMovementHistoryReq.ColumnSortFilter = ColumnSortFilter;
        getDeviceMovementHistoryReq.Export = Export;

        var param = new Object();
        param.token = TOKEN();
        param.getDeviceMovementHistoryReq = getDeviceMovementHistoryReq;

        return param;
    }
    //end grid

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
