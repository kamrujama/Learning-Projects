define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, ADSearchUtil) {

    return function DeleteGroupAssignment() {
       
     
        self.groupData = ko.observableArray();
        deleteGroupAssignmentGridModel('jqxgridDeleteGroup', self.groupData);
        var checkDeleteGroupAssociation = 1;
        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#deviceModified').on('shown.bs.modal', function (e) {
            $('#deviceModified_ConfoNo').focus();

        });
        $('#deviceModified').keydown(function (e) {
            if ($('#deviceModified_ConfoNo').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#deviceModified_ConfoYes').focus();
            }
        });
        $('#deleteGroupConfirmation').on('shown.bs.modal', function (e) {
            if (checkDeleteGroupAssociation == 0) {
                $('#deletGroup_Yes').focus();
            } else {
                $('#deletGroup_No').focus();
            }
        });
        $('#deleteGroupConfirmation').keydown(function (e) {
            if ($('#deletGroup_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#deletGroup_Yes').focus();
            }
        });
        $('#modelDeleteGroupId').on('shown.bs.modal', function (e) {
            $('#modelDeleteGroupId_NO').focus();

        });
        $('#modelDeleteGroupId').keydown(function (e) {
            if ($('#modelDeleteGroupId_NO').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#modelDeleteGroupId_yes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------

        $('#mdlDelGrupAssgnmentHeder').mouseup(function () {
            $("#mdlDelGrupAssgnmentContent").draggable({ disabled: true });
        });

        $('#mdlDelGrupAssgnmentHeder').mousedown(function () {
            $("#mdlDelGrupAssgnmentContent").draggable({ disabled: false });
        });


        self.clearfilter = function (gridId) {
            //gridFilterClear(gridId);
            clearUiGridFilter(gridId);
        }
        self.exportToXls = function (gridId) {
            //$("#" + gridId).jqxGrid('exportdata', 'csv', 'Groups');

            var dataInfo = $("#" + gridId).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#" + gridId).jqxGrid('exportdata', 'csv', 'Groups');
                openAlertpopup(1, 'export_Information');
            }
        }

        self.deleteAssignmentFromGroups = function (parentGridID, gridId, observableModelPopup, isContinue) {
            var selectedIds = getSelectedUniqueId(gridId);
            if ((selectedIds == null) || (selectedIds == "")) {
                openAlertpopup(1, 'select_group');
            } else {
                self.confirmAssignmentFromGroups(parentGridID, gridId, observableModelPopup, isContinue)
            }
        }

        self.agCancel = function () {
            $("#modelDeleteGroupId").modal('hide');
        }

        self.cancelReset = function () {
            $('#deleteGroupConfirmation').modal('hide');
            $('#deviceModified').modal('hide');
            repositionAdvanceSearchPopUp("mdlDelGrupAssgnmentContent");
        }

        self.refreshData = function (parentGridID, observableModelPopup) {
            gridFilterClear(parentGridID);
            $('#deviceModel').modal('hide');
            observableModelPopup('unloadTemplate');
        }
        self.confirmAssignmentFromGroups = function (parentGridID, gridId, observableModelPopup, isContinue) {
            var selectedIds = getSelectedUniqueId(gridId);
            if (selectedIds.length >= 1 || checkAllSelected(gridId) == 1) {
                var DeleteDevicesFromGroupsReq = new Object();
                var Selector = new Object();
                var selectedDeviceSearchItems = getSelectedUniqueId(parentGridID);
                var unselectedDeviceSearchItems = getUnSelectedUniqueId(parentGridID);
                var checkAll = checkAllSelected(parentGridID);

                if (checkAll == 1) {
                    DeleteDevicesFromGroupsReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                    Selector.SelectedItemIds = null;
                    if (unselectedDeviceSearchItems.length == 0) {
                        Selector.UnSelectedItemIds = null;
                    } else {
                        Selector.UnSelectedItemIds = unselectedDeviceSearchItems;
                    }

                } else {
                    DeleteDevicesFromGroupsReq.DeviceSearch = null;
                    Selector.SelectedItemIds = selectedDeviceSearchItems;
                    Selector.UnSelectedItemIds = null;
                }
                DeleteDevicesFromGroupsReq.ContinueDeletion = isContinue;
                DeleteDevicesFromGroupsReq.GroupIds = getSelectedUniqueId(gridId);
                DeleteDevicesFromGroupsReq.Selector = Selector;

                DeleteDevicesFromGroupsReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

                var callBackfunction = function (data, error) {
                    if (data) {
                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                            $('#deviceModel').modal('hide');
                            observableModelPopup('unloadTemplate');
                            openAlertpopup(0, 'device_removed');
                            gridRefreshClearSelection(parentGridID);
                        } else if (data.responseStatus.StatusCode == AppConstants.get('DEVICES_DOES_NOT_BELONGS_TO_GROUP')) {
                            openAlertpopup(1, 'group_not_associated');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('FEW_DEVICES_DOES_NOT_BELONGS_TO_GROUP')) {
                            checkDeleteGroupAssociation = 0;
                            $('#deleteGroupConfirmation').modal('show');
                            $("#deletGroupText").text(i18n.t('one_or_more_group_are_not_associated', { lng: lang }));

                        } else if (data.responseStatus.StatusCode == AppConstants.get('SELECTED_DEVICE_MODIFIED')) {
                            $('#deviceModified').modal('show');
                            $("#deviceModifiedText").text(i18n.t('some_devices_refresh', { lng: lang }));
                        }
                    }
                }

                var method = 'DeleteDevicesFromGroups';
                var params = '{"token":"' + TOKEN() + '","deleteDevicesFromGroupsReq":' + JSON.stringify(DeleteDevicesFromGroupsReq) + '}';
                ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
            } else {
                openAlertpopup(1, 'no_group_selected');
            }
        }

        function getSelectedIds() {
            var pageinfo = $("#jqxgridAddGroup").jqxGrid('getpaginginformation');
            var startrow = Number(pageinfo.pagenum) * Number(pageinfo.pagesize);
            var selectedarr = new Array();
            for (var i = startrow; i < startrow + pageinfo.pagesize; i++) {
                var value = $('#jqxgridAddGroup').jqxGrid('getcellvalue', i, "isSelected");
                if (value > 0) {
                    var selectedid = $('#jqxgridAddGroup').jqxGrid('getcellvalue', i, "GroupId");
                    selectedarr.push(selectedid);
                }
            }
            return selectedarr;
        }

        seti18nResourceData(document, resourceStorage);
    }

    //GetGroups Call
    function deleteGroupAssignmentGridModel(gID, groupData) {

        var getGroupsReq = new Object();
        var Export = new Object();
        var Pagination = new Object();
        var Selector = new Object();
        var ColumnSortFilter = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Selector.SelectedItemIds = null;
        Selector.UnSelectedItemIds = null;

        ColumnSortFilter.FilterList = null;
        ColumnSortFilter.SortList = null;

        Export.DynamicColumns = null;
        Export.ExportReportType = 5;
        Export.IsAllSelected = false;
        Export.IsExport = false;

        getGroupsReq.ColumnSortFilter = ColumnSortFilter;
        getGroupsReq.Pagination = Pagination;
        getGroupsReq.Selector = Selector;
        getGroupsReq.ShowAllRecords = true;
        getGroupsReq.Export = Export;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.getGroupsResp)
                    data.getGroupsResp = $.parseJSON(data.getGroupsResp);
                groupData(data.getGroupsResp.Groups);
                deleteGroupAssignmentGrid(gID, groupData());
            } else if (error) {
                groupData(null);
            }
        }
        var method = 'GetGroups';
        var params = '{"token":"' + TOKEN() + '","getGroupsReq":' + JSON.stringify(getGroupsReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }

    //GetGroups grid
    function deleteGroupAssignmentGrid(gID, groupData) {

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


        var source =
        {
            dataType: "json",
            localdata: groupData,
            dataFields: [
                  { name: 'isSelected', type: 'number' },
                  { name: 'GroupName', map: 'GroupName', type: 'string' },
                  { name: 'GroupId', type: 'number' }

            ],
        };

        var dataAdapter = new $.jqx.dataAdapter(source);

        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID);
        }
        var rendered = function (element) {
            enableUiGridFunctions(gID, 'GroupId', element, gridStorage, true);
            return true;
        }


        $("#" + gID).jqxGrid(
        {
            width: "100%",
            source: dataAdapter,
            sortable: true,
            filterable: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            pagesize: groupData.length,
            altrows: true,
            autoshowcolumnsmenubutton: false,
            showsortmenuitems: false,
            enabletooltips: true,
            rowsheight: 32,
            editable: true,
            columnsResize: true,
            ready: function () {
                clearUiGridFilter(gID);
            },
            columns: [
                {
                    text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false, exportable: false,
                    datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                        return '<div style="margin-left:10px;margin-top: 5px;"><div></div></div>';
                    }, rendered: rendered
                },
                { text: '', datafield: 'GroupId', hidden: true, minwidth: 0 },
                {
                    text: 'Group Name', datafield: 'GroupName', editable: false, minWidh: 100,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    },
                },
            ]
        });

        getUiGridBiginEdit(gID, 'GroupId', gridStorage);
        callUiGridFilter(gID, gridStorage);

    }
    //end grid
});