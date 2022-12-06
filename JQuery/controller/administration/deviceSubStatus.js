define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "AppConstants"], function (ko, koUtil, autho) {

    var lang = getSysLang();
    var columnSortFilterForDevice = new Object();
    koUtil.GlobalColumnFilter = new Array();
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function deviceSubStatusViewModel() {

      
        var self = this;

        $('#refreshGroupList').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#refreshGroupList').click();
            }
        });

        $('#addGroup').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#addGroup').click();
            }
        });

        $('#editGroup').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#editGroup').click();
            }
        });

        $('#deleteGroups').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#deleteGroups').click();
            }
        });

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;

        }
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
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }

        // unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup(popupName);            
            $('#viewDeviceSubStatusModal').modal('hide');
        };
        //open popup
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');

        setMenuSelection();
        modelReposition();

        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);

            if (popupName == "modelExportSucess") {
                loadelement(popupName, 'genericPopup');
                $('#viewDeviceSubStatusModal').modal('show');

            } else if (popupName == "modelAddDeviceSubStatus") {
                loadelement(popupName, 'administration');
                $('#viewDeviceSubStatusModal').modal('show');
            } else if (popupName == "modelEditDeviceSubStatus") {

                var selecteItemIds = getSelectedUniqueId('jqxgridDeviceSubStatus');
                var checkAll = checkAllSelected('jqxgridDeviceSubStatus');
                var unSelecteItemIds = getUnSelectedUniqueId('jqxgridDeviceSubStatus');
                var datacount = getTotalRowcount('jqxgridDeviceSubStatus');
                if (checkAll == 1) {
                    if (unSelecteItemIds.length == datacount - 1) {
                        loadelement(popupName, 'administration');
                        $('#viewDeviceSubStatusModal').modal('show');
                        editButtonClick('jqxgridDeviceSubStatus');
                    }
                    else {
                        openAlertpopup(1, 'please_select_a_single_sub_status_to_edit');
                        return;
                    }

                } else {
                    if (selecteItemIds.length == 1) {
                        loadelement(popupName, 'administration');
                        $('#viewDeviceSubStatusModal').modal('show');
                        editButtonClick('jqxgridDeviceSubStatus');
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'please_select_a_sub_status_to_edit');
                        return;
                    } else if (selecteItemIds.length > 1) {
                        openAlertpopup(1, 'please_select_a_single_sub_status_to_edit');
                        return;
                    }
                }

            } else if (popupName == "modelDeleteDeviceSubStatus") {

                var selecteItemIds = getSelectedUniqueId('jqxgridDeviceSubStatus');
                var deleteCount = getAllSelectedDataCount('jqxgridDeviceSubStatus');
                var checkAll = checkAllSelected('jqxgridDeviceSubStatus');

                if (checkAll == 1) {
                    if (deleteCount < 1) {
                        openAlertpopup(1, 'please_select_at_least_one_sub_status_to_delete');
                    } else {
                        loadelement(popupName, 'administration');
                        $('#viewDeviceSubStatusModal').modal('show');
                        deleteButtonClick(gId, 1);
                    }

                } else {
                    if (selecteItemIds.length == 1 || selecteItemIds.length > 1) {
                        loadelement(popupName, 'administration');
                        $('#viewDeviceSubStatusModal').modal('show');
                        deleteButtonClick(gId, 1);
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'please_select_at_least_one_sub_status_to_delete');
                        return;
                    }
                }

            }

        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        //focus on first textbox
        $('#contentConfId').on('shown.bs.modal', function () {
            $('#scheduleContConfoNo').focus();
        })

        // focus on next tab index 
        //lastIndex = 4;
        //prevLastIndex = 3;
        //$(document).keydown(function (e) {
        //    if (e.keyCode == 9) {
        //        var thisTab = +$(":focus").prop("tabindex") + 1;
        //        if (e.shiftKey) {
        //            if (thisTab == prevLastIndex) {
        //                $("#" + tabLimitInID).find('[tabindex=' + prevLastIndex + ']').focus();
        //                return false;
        //            }
        //        } else {
        //            if (thisTab == lastIndex) {
        //                $("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
        //                return false;
        //            }
        //        }
        //    }
        //});

        var setTabindexLimit = function (x, standardFile, y) {
            console.log(x);
            startIndex = 2;
            lastIndex = x;
            prevLastIndex = y;
            tabLimitInID = standardFile;
        }
        setTabindexLimit(4, "contentConfId", 3);
        // end tabindex

        //export

        self.exportToExcel = function (isExport, gId, exportflage) {
            var selectedDeviceSubStatusItems = getSelectedUniqueId(gId);
            var unselectedDeviceSubStatusItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getDeviceSubStatusParameters(true, null, selectedDeviceSubStatusItems, unselectedDeviceSubStatusItems, checkAll, visibleColumnsList);


            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflage = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                deviceSubStatusExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function deviceSubStatusExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    } 
                } 
            }
            var method = 'GetDeviceSubStatus';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }
        //Edit Button Click

        //Edit Button Click
        function editButtonClick(gID) {
            var selectedData = getMultiSelectedData(gID);

            selectedId = getSelectedUniqueId(gID);
            var selectedarr = new Array();
            for (var i = 0; i < selectedData.length; i++) {
                var editDeviceSubStatus = new Object();
                editDeviceSubStatus.selectedSubStatusId = selectedData[i].SubStatusId;
                editDeviceSubStatus.selectedDescription = selectedData[i].Description;
                editDeviceSubStatus.selectedDeviceStatus = selectedData[i].DeviceStatus;// InActive
                editDeviceSubStatus.selectedSubStatus = selectedData[i].SubStatus;
                selectedarr.push(editDeviceSubStatus);
                globalVariableForEditDeviceSubStatus = selectedarr;
                globalVariableForEditDeviceSubStatus.gID = gID;
            }
        }

        // Delete Button Click
        function deleteButtonClick(gID, check) {

            var selectedDeleteIds = getSelectedUniqueId(gID);
            var selectedData = getMultiSelectedData(gID);
            var unSelecedRowID = getUnSelectedUniqueId(gID);
            var checkAll = checkAllSelected(gID);
            var selectedarr = new Array();
            var deleteDeviceSubStatus = new Object();
            var selectedsource = _.where(selectedData, { SubStatusId: selectedDeleteIds[0] });
            if (checkAll == 1) {
                deleteDeviceSubStatus.selectedRowID = null;
                deleteDeviceSubStatus.unSelecedRowID = unSelecedRowID;
                deleteDeviceSubStatus.selectedData = selectedData;
            }
            else {
                deleteDeviceSubStatus.selectedSubStatusId = selectedsource[0].SubStatusId;
                deleteDeviceSubStatus.selectedDescription = selectedsource[0].Description;
                deleteDeviceSubStatus.selectedDescription = selectedsource[0].DeviceStatus;
                deleteDeviceSubStatus.selectedSubStatus = selectedsource[0].SubStatus
                deleteDeviceSubStatus.selectedRowID = selectedDeleteIds;
                deleteDeviceSubStatus.unSelecedRowID = null;
            }
            deleteDeviceSubStatus.checkAll = checkAll;
            selectedarr.push(deleteDeviceSubStatus);
            globalVariableFordeleteDeviceSubStatus = selectedarr;


        }

        // Grid Call
        var param = getDeviceSubStatusParameters(false, null, null, 0);
        deviceSubStatusGrid('jqxgridDeviceSubStatus', param);

        seti18nResourceData(document, resourceStorage);
    };


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
    function deviceSubStatusGrid(gID, param) {

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

        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;
        
        var source =
        {
            dataType: "json",
            dataFields: [
                     { name: 'isSelected', type: 'number' },
                     { name: 'DeviceStatus', map: 'DeviceStatus' },
                     { name: 'SubStatus', map: 'SubStatus' },
                     { name: 'Description', map: 'Description' },
                     { name: 'CreatedByUserName', map: 'CreatedByUserName' },
                     { name: 'CreatedOn', map: 'CreatedOn', type: 'date' },
                     { name: 'ModifiedByUserName', map: 'ModifiedByUserName' },
                     { name: 'ModifiedOn', map: 'ModifiedOn', type: 'date' },
                     { name: 'SubStatusId', map: 'SubStatusId' },
                     { name: 'SubStatusType', map: 'SubStatusType' },
            ],
            root: 'DeviceSubStatus',
            type: "POST",
            data: param,

            url: AppConstants.get('API_URL') + "/GetDeviceSubStatus",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data && data.getDeviceSubStatusResp) {
                    data.getDeviceSubStatusResp = $.parseJSON(data.getDeviceSubStatusResp);
                } else
                    data.getDeviceSubStatusResp = [];

                if (data.getDeviceSubStatusResp && data.getDeviceSubStatusResp.PaginationResponse) {
                    source.totalrecords = data.getDeviceSubStatusResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDeviceSubStatusResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;

                }
            },
        };

        var dataAdapter = new $.jqx.dataAdapter(source,
            {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForDevice, gID, gridStorage, 'DeviceSubStatus');
                    param.getDeviceSubStatusReq.ColumnSortFilter = columnSortFilter;
                    koUtil.GlobalColumnFilter = columnSortFilter;
                    param.getDeviceSubStatusReq.Pagination = getPaginationObject(param.getDeviceSubStatusReq.Pagination, gID);
                    param.getDeviceSubStatusReq.CallType = CallType;

                    updatepaginationOnState(gID, gridStorage, param.getDeviceSubStatusReq.Pagination, null, null, param.getDeviceSubStatusReq.CallType);

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    if (data.getDeviceSubStatusResp ) {
						if (data.getDeviceSubStatusResp.DeviceSubStatus && data.getDeviceSubStatusResp.DeviceSubStatus.length > 0) {
							deviceSubStatusDataAll = new Array();
							deviceSubStatusDataUser = new Array();
							var subStatusObj = new Object();
							subStatusObj.CreatedByUserName = '';
							subStatusObj.CreatedOn = '';
							subStatusObj.Description = '';
							subStatusObj.DeviceStatus = 'Inactive';
							subStatusObj.DeviceStatusConfigId = 0;
							subStatusObj.ModifiedByUserName = '';
							subStatusObj.ModifiedOn = null;
							subStatusObj.SubStatus = AppConstants.get('NO_SUBSTATUS');
							subStatusObj.SubStatusId = 0;
							subStatusObj.SubStatusName = (null);
							subStatusObj.SubStatusType = '';
							deviceSubStatusDataUser.push(subStatusObj);

							var subStatusItem = new Object();
							subStatusItem.CreatedByUserName = '';
							subStatusItem.CreatedOn = '';
							subStatusItem.Description = '';
							subStatusItem.DeviceStatus = 'Inactive';
							subStatusItem.DeviceStatusConfigId = 0;
							subStatusItem.ModifiedByUserName = '';
							subStatusItem.ModifiedOn = null;
							subStatusItem.SubStatus = AppConstants.get('BLANKS');
							subStatusItem.SubStatusId = 0;
							subStatusItem.SubStatusName = (null);
							subStatusItem.SubStatusType = '';
							deviceSubStatusDataAll.push(subStatusItem);

                            for (var i = 0; i < data.getDeviceSubStatusResp.DeviceSubStatus.length; i++) {
                                data.getDeviceSubStatusResp.DeviceSubStatus[i].ModifiedOn = convertToLocaltimestamp(data.getDeviceSubStatusResp.DeviceSubStatus[i].ModifiedOn);
								data.getDeviceSubStatusResp.DeviceSubStatus[i].CreatedOn = convertToLocaltimestamp(data.getDeviceSubStatusResp.DeviceSubStatus[i].CreatedOn);

								deviceSubStatusDataAll.push(data.getDeviceSubStatusResp.DeviceSubStatus[i]);
								if (data.getDeviceSubStatusResp.DeviceSubStatus[i].SubStatusType == 'User') {
									deviceSubStatusDataUser.push(data.getDeviceSubStatusResp.DeviceSubStatus[i]);
								}
							}

							UpdateMultiChoiceFilterArray("Device Sub Status", deviceSubStatusDataAll);

                        } else {
                            source.totalrecords = 0;
                            source.totalpages = 0;
                            data.getDeviceSubStatusResp = new Object();
                            data.getDeviceSubStatusResp.DeviceSubStatus = [];
                        }                       

                        //if (data.getDeviceSubStatusResp.PaginationResponse && data.getDeviceSubStatusResp.PaginationResponse.HighLightedItemPage > 0) {
                        //    //for (var h = 0; h < data.getDeviceSubStatusResp.DeviceSubStatus.length; h++) {
                        //    //if (data.getDeviceSubStatusResp.DeviceSubStatus[h].SubStatusId == data.getDeviceSubStatusResp.PaginationResponse.HighLightedItemId) {
                        //    gridStorage[0].highlightedPage = data.getDeviceSubStatusResp.PaginationResponse.HighLightedItemPage;
                        //    var updatedGridStorage = JSON.stringify(gridStorage);
                        //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        //    //}
                        //    //}
                        //}
                        if (data.getDeviceSubStatusResp.UserSubStatusCount != 'undefined') {
                            gridStorage[0].TotalSelectionCount = data.getDeviceSubStatusResp.UserSubStatusCount;
                            var updatedGridStorage = JSON.stringify(gridStorage);
                            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        }

                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getDeviceSubStatusResp = new Object();
                        data.getDeviceSubStatusResp.DeviceSubStatus = [];

                    }
                    $('.all-disabled').hide();
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                }
            }
        );


        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'SubStatusId', element, gridStorage, true, 'pagerDivjqxgridDeviceSubStatus', false, 5, 'SubStatusType', null, null, null);
            return true;
        }

        //For Checkbox depend on substatus type flag
        var cellclass = function (row, columnfield, value) {
            var checkSubStatusType = $("#" + gID).jqxGrid('getcellvalue', row, 'SubStatusType');
            if (checkSubStatusType == 'User') {
                return '';
            } else {
                return 'disabled';
            }
        }


        //row is enabled when IsJobCancelAllowed true
        var cellbeginedit = function (row, datafield, columntype, value) {
            var checkSubStatusType = $("#" + gID).jqxGrid('getcellvalue', row, 'SubStatusType');
            if (checkSubStatusType == 'User') {
                return true;
            } else {
                return false;
            }
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
            height: gridHeightFunction(gID, "60"),
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
            rendergridrows: function () {
                return dataAdapter.records;
            },

            ready: function () {
               callOnGridReady(gID, gridStorage);
               // CallType = addDefaultfilter(CallType, 'ModifiedOn', gID)

                var columns = genericHideShowColumn(gID, true, []);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;
            },

            columns: [
                    {
                        text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, cellclassname: cellclass, cellbeginedit: cellbeginedit,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered,
                    },
                    {
                        text: i18n.t('dev_status', { lng: lang }), datafield: 'DeviceStatus', editable: false, minwidth: 100, filterable: false, sortable: false, menu: false,

                    },
                    {
                        text: i18n.t('deviceSubStatus', { lng: lang }), datafield: 'SubStatus', editable: false, minwidth: 100,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                    {
                        text: i18n.t('description', { lng: lang }), datafield: 'Description', editable: false, minwidth: 150, filterable: true,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },

                    },
                    {
                        text: i18n.t('sub_status_type', { lng: lang }), datafield: 'SubStatusType', editable: false, minwidth: 130, 
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Sub Status Type');
                        }
                    },
                    {
                        text: i18n.t('created_by', { lng: lang }), datafield: 'CreatedByUserName', editable: false, minwidth: 100, filterable: false, sortable: false, menu: false,

                    },
                    {
                        text: i18n.t('createdOn', { lng: lang }), datafield: 'CreatedOn', editable: false, minwidth: 140,  enabletooltips: false, cellsformat: LONG_DATETIME_GRID_FORMAT,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }

                    },
                   {
                       text: i18n.t('p_t_copy_modifiedby', { lng: lang }), datafield: 'ModifiedByUserName', editable: false, minwidth: 100,  filterable: false, sortable: false, menu: false,

                   },
                     {
                         text: i18n.t('p_t_copy_modifiedon', { lng: lang }), datafield: 'ModifiedOn', enabletooltips: false, editable: false, minwidth: 140,  enabletooltips: false, cellsformat: LONG_DATETIME_GRID_FORMAT,
                         filtertype: "custom",
                         createfilterpanel: function (datafield, filterPanel) {
                             buildFilterPanelDate(filterPanel, datafield);

                         }

                     }


            ]
        });
        getGridBiginEdit(gID, 'SubStatusId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'SubStatusId');
    }


    //Device Sub Status Parameter
    function getDeviceSubStatusParameters(isExport, ColumnSortFilter, selectedDeviceSubStatusItems, unselectedDeviceSubStatusItems, checkAll, visibleColumns) {
        var getDeviceSubStatusReq = new Object();
        var Export = new Object();
        var Selector = new Object();
        var Pagination = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Selector.SelectedItemIds = null
        Selector.UnSelectedItemIds = null;

        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedDeviceSubStatusItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedDeviceSubStatusItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        }
        Export.VisibleColumns = visibleColumns;

        var coulmnfilter = columnSortFilterForDevice;
        getDeviceSubStatusReq.Export = Export;
        getDeviceSubStatusReq.Pagination = Pagination;
        getDeviceSubStatusReq.Selector = Selector;

        getDeviceSubStatusReq.ColumnSortFilter = coulmnfilter;
		getDeviceSubStatusReq.DeviceSubStatusType = ENUM.get('SUB_STATUS_ALL');
        // getDeviceSubStatusReq.CallType = CallType;

        var param = new Object();
        param.token = TOKEN();
        param.getDeviceSubStatusReq = getDeviceSubStatusReq;
        return param;
    }
});


