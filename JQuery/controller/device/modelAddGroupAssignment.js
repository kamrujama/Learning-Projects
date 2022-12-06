define(["knockout", "autho", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, autho, ADSearchUtil, koUtil) {
    selectedGroups = new Array();

    return function AddGroupAssignment() {
        ko.validation.init({
            decorateElement: true,
            errorElementClass: 'err',
            insertMessages: false
        });
  

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
        //------------------------------------------------------------------------------------------------------------------------

        var self = this;
        var CheckAddGroupPopUpActive;
        //$("#mdlAddGrpAssgnmt").draggable();
		
		ADSearchUtil.AdScreenName = !_.isEmpty(deviceLiteData) ? deviceLiteData.Source : ADSearchUtil.AdScreenName;

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        self.groupsName = ko.observable().extend({
            required: {
                params: true,
                message: i18n.t('please_enter_group_name'),
                lng: lang
            }
        });

        function checkerror(chekVal) {
            var retval = '';
            if ($("#groupName").val().trim() == "") {
                retval += 'reference name';
                self.groupsName(null);
                $("#please_enter_group_name").show();
            }
            else {
                retval += '';
            }
            return retval;
        }


        self.groupData = ko.observableArray();

        addGroupAssignmentGridModel('jqxgridAddGroup', self.groupData);
        self.addModelPopup = ko.observable();

        //Visible save button
        self.fromDeviceSearchScreen = ko.observable(false);
        self.fromDeviceProfileScreen = ko.observable(false);
        self.addGroupBtnVisible = ko.observable(false);
        $("#groupDeviceId").hide();
        $("#deviceSeachTitle").hide();
        $("#deviceProfileTitle").hide();

        if (ADSearchUtil.AdScreenName == 'deviceProfile') {
            self.fromDeviceSearchScreen(false);
            self.fromDeviceProfileScreen(true);
            self.addGroupBtnVisible(false);
            $("#deviceSeachTitle").hide();
            $("#deviceProfileTitle").show();
            $("#groupDeviceId").show();
        } else {
            self.fromDeviceSearchScreen(true);
            self.fromDeviceProfileScreen(false);
            self.addGroupBtnVisible(true);
            $("#deviceSeachTitle").show();
            $("#deviceProfileTitle").hide();
            $("#groupDeviceId").hide();
        }

        self.openAddGroup = function () {
            addgroup()
        }
        self.agCancel = function (unloadTempPopup) {
            $("#agInside").css("left", '');
            $("#agInside").css("top", '');
            agCancel();
        }

        //cancel function on confirmation popup
        self.cancelPopup = function () {
            $('#deviceModified').modal('hide');
        }

        function addgroup() {
            $(".addGroup").addClass("addGroupShow");
            CheckAddGroupPopUpActive = 1;
        }
        function agCancel() {
            self.groupsName('groupName');
            $("#description").empty();
            $("#groupName").val('');
            $(".addGroup").removeClass("addGroupShow");
            CheckAddGroupPopUpActive = 0;
        }

        self.description = ko.observable();
        self.columnlist = ko.observableArray();
        self.checkname = ko.observable();

        self.clearfilter = function (gID) {
            //gridFilterClear(gID);
            clearUiGridFilter(gID);
        }
        self.exportToXls = function (gID) {
            var dataInfo = $("#" + gID).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                exportjqxcsvData(gID,'Groups'); 
               openAlertpopup(1, 'export_Information');
            }
        }

        self.addGroupClick = function (gID, observableModelPopup) {
            var retval = checkerror();
            if (retval == null || retval == "") {
                var group = new Object();
                group.GroupId = 0;
                group.GroupName = $("#groupName").val();
                group.Description = $("#description").val();
                group.Tags = "";
                var callBackfunction = function (data, error) {
                    if (data) {
                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                            agCancel();
                            openAlertpopup(0, 'group_has_been_added_successfully');
                            $("#groupName").empty();
                            $("#description").empty();
                            $(".addGroup").removeClass("addGroupShow");
                            $("#loadingDiv").show();
                            $("#agInside").css("left", '');
                            $("#agInside").css("top", '');
                            addGroupAssignmentGridModel(gID, self.groupData);
                        } else if (data.responseStatus.StatusCode == AppConstants.get('DUPLICATE_GROUP_NAME_FOUND')) {
                            openAlertpopup(1, 'Duplicate_group_name');
                            $("#loadingDiv").hide();
                            return;
                        } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                            $("#loadingDiv").hide();
                            Token_Expired();
                        }
                    } else if (error) {
                        $("#loadingDiv").hide();
                    }
                }

                var method = 'AddGroup';
                var params = '{"token":"' + TOKEN() + '","group":' + JSON.stringify(group) + '}';
                ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
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
                    selectedid = "" + selectedid + "";
                    selectedarr.push(selectedid);
                }
            }
            return selectedarr;
        }

        self.refreshData = function (parentGridID, observableModelPopup) {
            gridFilterClear(parentGridID);
            $('#deviceModel').modal('hide');
            observableModelPopup('unloadTemplate');
        }

        self.assignDevicesToGroups = function (parentGridID, gID, unloadTempPopup) {

            var checkAll = checkAllSelected(parentGridID);
            var selectedIds;
            var unSelectedIds;
            var AssignDevicesToGroupsReq = new Object();
            var selectedGroupIds = getSelectedUniqueId(gID);

			if (koUtil.isDeviceProfile() === true) {
				selectedIds = [koUtil.DeviceProfileLite.UniqueDeviceId];
				unSelectedIds = null;
				AssignDevicesToGroupsReq.DeviceSearch = null;
			} else {
				if (checkAll === 1) {
					selectedIds = null;
					unSelectedIds = getUnSelectedUniqueId(parentGridID);
					AssignDevicesToGroupsReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
				} else {
					selectedIds = getSelectedUniqueId(parentGridID);
					unSelectedIds = null;
					AssignDevicesToGroupsReq.DeviceSearch = null;
				}
			}

            if (selectedGroupIds.length >= 1) {
                AssignDevicesToGroupsReq = new Object();
				var Selector = new Object();
				
                Selector.SelectedItemIds = selectedIds;
				Selector.UnSelectedItemIds = unSelectedIds;
                AssignDevicesToGroupsReq.GroupIds = selectedGroupIds;
                AssignDevicesToGroupsReq.Selector = Selector;
                AssignDevicesToGroupsReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                AssignDevicesToGroupsReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

                var callBackfunction = function (data, error) {
                    if (data) {
                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                            koUtil.GlobalColumnFilter = [];
                            $('#deviceModel').modal('hide');
                            unloadTempPopup('unloadTemplate');
							openAlertpopup(0, 'devices_assigned_to_groups');
							if (koUtil.isDeviceProfile() === false) {
								gridRefreshClearSelection(parentGridID);
							}
                        } else if (data.responseStatus.StatusCode == AppConstants.get('SELECTED_DEVICE_MODIFIED')) {
                            $('#deviceModified').modal('show');
                            $("#deviceModifiedText").text(i18n.t('some_devices_refresh', { lng: lang }));
                        }
                    }
                }

                var method = 'AssignDevicesToGroups';
                var params = '{"token":"' + TOKEN() + '","assignDevicesToGroupsReq":' + JSON.stringify(AssignDevicesToGroupsReq) + '}';
                ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
            } else {

                openAlertpopup(1, 'please_select_atleast_one_group');
            }
        }

        //Device profile call  
        var isAssigned = false;
        var isRemoved = false;
        self.saveBtnClicked = function (gID, unloadTempPopup, refereshHierarchyfordeviceProfile) {
            var groupArr = $("#" + gID).jqxGrid('getrows');
            var arraySelectedGroups = koUtil.deviceProfileGroup;
            var groupsToAdd = new Array();
            var groupsToRemove = new Array();
            isAssigned = false;
            isRemoved = false;

            if (groupArr && groupArr.length > 0) {
                for (i = 0; i < groupArr.length; i++) {
                    if (groupArr[i].isSelected == 1) {
                        groupsToAdd.push(groupArr[i].GroupId);
                    } else {
                        groupsToRemove.push(groupArr[i].GroupId);
                    }
                }
            }            

            if (groupsToRemove && groupsToRemove.length > 0) {
                for (j = 0; j < groupsToRemove.length; j++) {
                    var isRefreshDeviceProfile = false;
                    if (j == groupsToRemove.length - 1) {
                        isRefreshDeviceProfile = true;
                    }
                    self.removeGroupsUnselected(groupsToAdd, groupsToRemove[j], unloadTempPopup, refereshHierarchyfordeviceProfile, isRefreshDeviceProfile);
                }
            }

            if (groupsToAdd && groupsToAdd.length > 0) {
                self.addGroupsSelected(groupsToAdd, groupsToRemove, unloadTempPopup, refereshHierarchyfordeviceProfile);
            }

        }

        self.removeGroupsUnselected = function (groupsToAdd, groupToRemove, unloadTempPopup, refereshHierarchyfordeviceProfile, isRefreshDeviceProfile) {
            var obj = new Object();
            obj.GroupID = groupToRemove;
            obj.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
            obj.ColumnSortFilter = koUtil.GlobalColumnFilter;

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (isRefreshDeviceProfile) {
                            isRemoved = true;
                            unloadTempPopup('unloadTemplate');
                            openAlertpopup(0, 'devices_assigned_to_groups_profile');
							refreshDeviceProfileLitePage(AppConstants.get('GROUP_REFRESH_DATA'));
                            //if (groupsToAdd && groupsToAdd.length > 0) {
                            //    if (isAssigned) {
                            //        refereshHierarchyfordeviceProfile();
                            //    }
                            //} else {
                            //    refereshHierarchyfordeviceProfile();
                            //}
                        }
                    } else if (data.responseStatus.StatusCode == AppConstants.get('SELECTED_DEVICE_MODIFIED')) {
                        openAlertpopup(1, 'selected_device_modified');
                    }
                }
            }
            var method = 'RemoveDeviceFromGroup';
            var params = '{"token":"' + TOKEN() + '","deviceGroup":' + JSON.stringify(obj) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        self.addGroupsSelected = function (groupsToAdd, groupsToRemove, unloadTempPopup, refereshHierarchyfordeviceProfile) {
            var assignDevicesToGroupsReq = new Object();
            var Selector = new Object();
            var AssignDevicesToGroupsReq = new Object();
            var uniqueDeviceIds = new Array();
            var deviceFilterObj = new Object;
            uniqueDeviceIds.push(koUtil.deviceProfileUniqueDeviceId);
            Selector.SelectedItemIds = uniqueDeviceIds;
            assignDevicesToGroupsReq.GroupIds = groupsToAdd;
            assignDevicesToGroupsReq.Selector = Selector;

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        isAssigned = true;
                        unloadTempPopup('unloadTemplate');
                        openAlertpopup(0, 'devices_assigned_to_groups_profile');
						refreshDeviceProfileLitePage(AppConstants.get('GROUP_REFRESH_DATA'));
                        //if (groupsToRemove && groupsToRemove.length > 0) {
                        //    if (isRemoved) {
                        //        refereshHierarchyfordeviceProfile();
                        //    }
                        //} else {
                        //    refereshHierarchyfordeviceProfile();
                        //}
                    } else if (data.responseStatus.StatusCode == AppConstants.get('SELECTED_DEVICE_MODIFIED')) {
                        openAlertpopup(1, 'selected_device_modified');
                        unloadTempPopup('unloadTemplate');
                    }
                }
            }
            var method = 'AssignDevicesToGroups';
            var params = '{"token":"' + TOKEN() + '","assignDevicesToGroupsReq":' + JSON.stringify(assignDevicesToGroupsReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

        }


        $('#modelHeaderSoftUpgrade').mouseup(function () {
            if (CheckAddGroupPopUpActive == 1) {

            } else {
                $("#mdlAddGrpAssgnmtContent").draggable({ disabled: true, scroll: false });
            }
        });

        $('#modelHeaderSoftUpgrade').mousedown(function () {
            $("#mdlAddGrpAssgnmtContent").draggable({ disabled: false, scroll: false });
        });

        $('#agInsideHeader').mouseup(function () {
            $("#agInside").draggable({ disabled: true, scroll: false });
        });

        $('#agInsideHeader').mousedown(function () {

            $("#agInside").draggable({ disabled: false, scroll: false });
        });

        seti18nResourceData(document, resourceStorage);
    }

    function addGroupAssignmentGridModel(gID, groupData) {
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
                if (data.getGroupsResp) {
                    data.getGroupsResp = $.parseJSON(data.getGroupsResp);
                    if (data.getGroupsResp.Groups != null && data.getGroupsResp.Groups != undefined) {
                        groupData = data.getGroupsResp.Groups;                        
                    } else {
                        groupData([]);
                    }
                    addGroupAssignmentGrid(gID, groupData);
                }              
                $("#loadingDiv").hide();
                if (ADSearchUtil.AdScreenName == 'deviceProfile') {
                } else {
                    clearUiGridFilter(gID);
                }
            } else if (error) {
                groupData([]);
            }
        }
        var method = 'GetGroups';
        var params = '{"token":"' + TOKEN() + '","getGroupsReq":' + JSON.stringify(getGroupsReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }

    //for grid
    function addGroupAssignmentGrid(gID, groupData) {
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
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
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
            columns: [
                {
                    text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false, exportable: false,
                    datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                        return '<div style="margin-left: 10px; margin-top: 5px;"><div></div></div>';
                    }, rendered: rendered
                },
                { text: '', datafield: 'GroupId', hidden: true, minwidth: 0 },
                {
                    text: 'Group Name', datafield: 'GroupName', editable: false, minWidh: 120,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
            ]
        });

        getUiGridBiginEdit(gID, 'GroupId', gridStorage);
        callUiGridFilter(gID, gridStorage);
        var arraySelectedGroups = koUtil.deviceProfileGroup;
        var arr = groupData;

        if (arr) {
            if (arr.length) {
                for (i = 0; i < arr.length; i++) {
                    if (arr[i].GroupId && arraySelectedGroups) {
                        var id = parseInt(arr[i].GroupId);
                        var source = _.where(arraySelectedGroups, { "GroupId": id })
                        if (source != '') {
                            gridStorage[0].selectedDataArr.push(id);
                            try {
                                var funcGridValueSetString = "this.f = function funcGridValueSet" + i + "() { $('#jqxgridAddGroup').jqxGrid('setcellvalue', " + i + ", 'isSelected', 1); $('#jqxgridAddGroup').jqxGrid('updatebounddata');}";
                                setTimeout(eval(funcGridValueSetString), 500);
                            }
                            catch (err) {
                            }
                        }
                    }
                }
            }
        }

        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
        var datainfo = $("#jqxgridAddGroup").jqxGrid('getdatainformation');
        if (arraySelectedGroups && datainfo.rowscount == arraySelectedGroups.length) {
            $("#jqxgridAddGroup").find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-checked');
        } else if (arraySelectedGroups && arraySelectedGroups.length == 0) {
            $("#jqxgridAddGroup").find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-checked');
            $("#jqxgridAddGroup").find('.jqx-grid-column-header:first').find('span').removeClass('partial-selection');
        } else if (arraySelectedGroups && datainfo.rowscount > arraySelectedGroups.length) {
            $("#jqxgridAddGroup").find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-checked');
            $("#jqxgridAddGroup").find('.jqx-grid-column-header:first').find('span').addClass('partial-selection');
        }
    }

});

