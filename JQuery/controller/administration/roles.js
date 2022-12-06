define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho) {

    columnSortFilterForRoles = new Object();
    var lang = getSysLang();
    koUtil.GlobalColumnFilter = new Array();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false['LastLoginDate']
    });

    return function downloadLibararyappViewModel() {

        var self = this;

        $('#btnRefresh').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#btnRefresh').click();
            }
        });

        $('#addUserBtn').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#addUserBtn').click();
            }
        });

        $('#editRoleBtn').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#editRoleBtn').click();
            }
        });

        $('#deleteBtn').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#deleteBtn').click();
            }
        });

        //-----------------------------------------------FOCUS ON BUTTON ON CONFO POP UP-----------------------------------------------------

        $('#roleDeleteModel').on('shown.bs.modal', function (e) {
            $('#roleDeleteModelBtn_No').focus();

        });

        $('#roleDeleteModel').keydown(function (e) {
            if ($('#roleDeleteModelBtn_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#roleDeleteModelBtn_Yes').focus();
            }
        });

        var self = this;
        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();
        var modelname = 'unloadTemplate';        
        self.gridIdForShowHide = ko.observable();
        self.columnlist = ko.observableArray();

        init();
        function init() {
            setMenuSelection();
            modelReposition();
            loadelement(modelname, 'genericPopup');
            var param = getRolesParameters(false, columnSortFilterForRoles, null, null, 0, []);
            rolesGrid('jqxgridRoles', param);
        }

        //Load Template
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        //unload template
        self.unloadTempPopup = function () {
            self.observableModelPopup('unloadTemplate');
        }

        //Generate template
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

        //Clear filter
        self.clearfilter = function (gId) {
            gridFilterClear(gId);
        }

        //Refresh Grid
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }

        self.editClick = function () {
            $("#editRole").show();
        }
        
        //Open Popup
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));

                if (visibleColumnsList.length == 0) {
                    var columns = self.columnlist();
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                }
                loadelement(popupName, 'genericPopup');
            } else if (popupName == "modelEditRole") {
                var selecteItemIds = getSelectedUniqueId('jqxgridRoles');
                var checkAll = checkAllSelected('jqxgridRoles');
                var unSelecteItemIds = getUnSelectedUniqueId('jqxgridRoles');
                var datacount = getTotalRowcount('jqxgridRoles');
                if (checkAll == 1) {
                    if (unSelecteItemIds.length == datacount - 1) {
                        loadelement(popupName, 'administration');
                        $('#rolesModel').show();
                        $("#editRoleScreen").show();
                        $('#roleMain').hide();
                        editButtonClick(gId);
                    } else {
                        openAlertpopup(1, 'select_single_role_to_edit');
                        return;
                    }
                } else {
                    if (selecteItemIds.length == 1) {
                        loadelement(popupName, 'administration');
                        $('#rolesModel').show();
                        $("#editRoleScreen").show();
                        $('#roleMain').hide();
                        editButtonClick('jqxgridRoles');
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'select_role_to_edit');
                        return;
                    } else if (selecteItemIds.length > 1) {
                        openAlertpopup(1, 'select_single_role_to_edit');
                        return;
                    }
                }
            } else if (popupName == "modelAddRole") {
                loadelement(popupName, 'administration');
                $("#addRoleScreen").show();
                $('#rolesModel').show();
                $('#roleMain').hide();
            }
        }

        //Edit button click
        function editButtonClick(gId) {
            var selectedIds = getMultiSelectedData(gId);
            var selectedarr = new Array();
            for (var i = 0; i < selectedIds.length; i++) {
                var editRole = new Object();
                editRole.selectedCreatedById = selectedIds[i].CreatedByUserId;
                editRole.selectedCreatedByUserName = selectedIds[i].CreatedByUserName;
                editRole.selectedModifiedByUserId = selectedIds[i].ModifiedByUserId;
                editRole.selectedModifiedByUserName = selectedIds[i].ModifiedByUserName;
                editRole.selectedCreatedOn = selectedIds[i].CreatedOn;
                editRole.selectedModifiedOn = selectedIds[i].ModifiedOn;
                editRole.selectedTotalRows = selectedIds[i].TotalRows;
                editRole.selectedRoleName = selectedIds[i].RoleName;
                editRole.selectedDescription = selectedIds[i].Description;
                editRole.selectedRoleId = selectedIds[i].RoleId;
                editRole.selectedLoginName = selectedIds[i].LoginName;
                selectedarr.push(editRole);
                globalVariableForEditRole = selectedarr;
                globalVariableForEditRole.gId = gId;
            }
        }

        //Export to excel functionality
		self.exportToExcel = function (isExport, gId){
            var selectedRoleItems = getSelectedUniqueId(gId);
            var unselectedRoleItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getRolesParameters(true, columnSortFilterForRoles, selectedRoleItems, unselectedRoleItems, checkAll, visibleColumnsList);

            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflage = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                rolesExport(param);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function rolesExport(param) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetRoles';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
        }

        //Delete role API
        self.deleteRoleClick = function (gId) {
            var deleteCount = getAllSelectedDataCount(gId);
            var source = getMultiSelectedData(gId);
            var roleName = '';
            var selectedarr = new Array();

            for (var i = 0; i < source.length; i++) {
                var roleObj = new Object();
                roleObj.selectedRoleName = source[i].RoleName
                selectedarr.push(roleObj);
                roleName = selectedarr[i].selectedRoleName
            }

            if (deleteCount == 0) {
                openAlertpopup(1, 'Please_select_at_least_one_role_to_delete');
            } else if (deleteCount > 1) {
                $('#roleDeleteModel').modal('show');
                $("#deleteRole").text(i18n.t('Are_you_sure_you_want_to_delete_the_role', { deleteCount: deleteCount }, { lng: lang }));
            } else {
                $('#roleDeleteModel').modal('show');
                $("#deleteRole").text(i18n.t('delete_the_role', { roleName: roleName }, { lng: lang }));
            }
        }

        self.deleteRoleCall = function (gId) {
            var deleteRolesReq = new Object();
            var selectedDeleteIds = getSelectedUniqueId(gId);
            var unSelecedRowID = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            var Selector = new Object();
            if (checkAll == 1) {
                Selector.SelectedItemIds = null;
                Selector.UnSelectedItemIds = unSelecedRowID;
            }
            else {
                Selector.SelectedItemIds = selectedDeleteIds;
                Selector.UnSelectedItemIds = null;
            }
            deleteRolesReq.Selector = Selector;
            deleteRolesReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
            var callBackfunction = function (data, error) {
                if (data) {
                    gridRefreshClearSelection(gId);
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(0, 'role_deleted');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('ROLE_CANNOT_BE_DELETED')) {
                        var undeletedRoles = data.deleteRolesResp.UnDeletedRoles;
                        if (IsADUser || IsADFSUser) {
                            openAlertpopup(1, i18n.t('role_msg', { undeletedRoles: undeletedRoles }, { lng: lang }));
                        } else {
                            openAlertpopup(1, i18n.t('role_mapped_to_users', { undeletedRoles: undeletedRoles }, { lng: lang }));
                        }
                    }
                }
            }
            var method = 'DeleteRoles';
            var params = '{"token":"' + TOKEN() + '","deleteRolesReq":' + JSON.stringify(deleteRolesReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
        }

        seti18nResourceData(document, resourceStorage);
    };

    //Grid for fetching roles
    function rolesGrid(gID, param) {
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

        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;

        var source =
            {
                dataType: "json",
                dataFields: [
                    { name: 'isSelected', type: 'number' },
                    { name: 'RoleId', map: 'RoleId' },
                    { name: 'RoleName', map: 'RoleName' },
                    { name: 'Description', map: 'Description' },
                    { name: 'CreatedByUserName', map: 'CreatedByUserName' },
                    { name: 'CreatedOn', map: 'CreatedOn', type: 'date' },
                    { name: 'ModifiedByUserName', map: 'ModifiedByUserName' },
                    { name: 'ModifiedOn', map: 'ModifiedOn', type: 'date' },
                    { name: 'CreatedByUserId', map: 'CreatedByUserId' },
                    { name: 'ModifiedByUserId', map: 'ModifiedByUserId' },
                    { name: 'TotalRows', map: 'TotalRows' },

                ],
                root: 'RolesList',
                type: "POST",
                data: param,

                url: AppConstants.get('API_URL') + "/GetRoles",
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data && data.getRolesResp) {
                        data.getRolesResp = $.parseJSON(data.getRolesResp);
                    }
                    else
                        data.getRolesResp = [];

                    if (data.getRolesResp && data.getRolesResp.PaginationResponse) {
                        source.totalrecords = data.getRolesResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getRolesResp.PaginationResponse.TotalPages;
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
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForRoles, gID, gridStorage, 'Roles');
                    param.getRolesReq.ColumnSortFilter = columnSortFilter;
                    koUtil.GlobalColumnFilter = columnSortFilter;
                    param.getRolesReq.Pagination = getPaginationObject(param.getRolesReq.Pagination, gID);

                    updatepaginationOnState(gID, gridStorage, param.getRolesReq.Pagination, null, null);

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                    if (data.getRolesResp && data.getRolesResp.RolesList) {
                        for (var i = 0; i < data.getRolesResp.RolesList.length; i++) {
                            data.getRolesResp.RolesList[i].CreatedOn = convertToLocaltimestamp(data.getRolesResp.RolesList[i].CreatedOn);
                            data.getRolesResp.RolesList[i].ModifiedOn = convertToLocaltimestamp(data.getRolesResp.RolesList[i].ModifiedOn);
                        }
                        if (data.getRolesResp.PaginationResponse) {
                            //if (data.getRolesResp.PaginationResponse.HighLightedItemPage > 0) {
                            //    //for (var h = 0; h < data.getRolesResp.RolesList.length; h++) {
                            //    //if (data.getRolesResp.RolesList[h].RoleId == data.getRolesResp.PaginationResponse.HighLightedItemId) {
                            //    gridStorage[0].highlightedPage = data.getRolesResp.PaginationResponse.HighLightedItemPage;
                            //    var updatedGridStorage = JSON.stringify(gridStorage);
                            //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            //    //}
                            //    //}
                            //}
                        }

                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getRolesResp = new Object();
                        data.getRolesResp.RolesList = [];

                    }
                    $('.all-disabled').hide();
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                }
            }
        );

        //Custom filter
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);
        }
        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'RoleId', element, gridStorage, true, 'pagerDivRoles', false, 0, 'RoleId', null, null, null);
            return true;
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
                    //gridRefresh(gID);
                    callOnGridReady(gID, gridStorage);

                    var columns = genericHideShowColumn(gID, true, []);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                },

                autoshowfiltericon: true,
                columns: [
                    {
                        text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false,
                        datafield: 'isSelected', minwidth: 40, width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    { text: '', datafield: 'RoleId', hidden: true, editable: false, },
                    {
                        text: i18n.t('role_nm', { lng: lang }), datafield: 'RoleName', editable: false, minwidth: 120,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('role_desc', { lng: lang }), datafield: 'Description', editable: false, minwidth: 120, filterable: true,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                    {
                        text: i18n.t('rpt_Created_By', { lng: lang }), datafield: 'CreatedByUserName', editable: false, minwidth: 100, filterable: false, sortable: false,
                        filtertype: "custom", menu: false,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                    {
                        text: i18n.t('CreatedOnAdmin', { lng: lang }), datafield: 'CreatedOn', cellsformat: LONG_DATETIME_GRID_FORMAT,
                        enabletooltips: false, editable: false, minwidth: 150,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('modify_by_group', { lng: lang }), datafield: 'ModifiedByUserName', editable: false, minwidth: 120, filterable: false, sortable: false,
                        filtertype: "custom", menu: false,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('modify_on_device_status', { lng: lang }), datafield: 'ModifiedOn', cellsformat: LONG_DATETIME_GRID_FORMAT,
                        enabletooltips: false, editable: false, minwidth: 150,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                ]
            });
        getGridBiginEdit(gID, 'RoleId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'RoleId');
    }

    ///Getting parameter of Users
    function getRolesParameters(isExport, columnSortFilterForRoles, selectedRoleItems, unselectedRoleItems, checkAll, visibleColumns) {
        var getRolesReq = new Object();
        var Export = new Object();
        var Selector = new Object();
        var Pagination = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
        Export.DynamicColumns = null;
        Export.VisibleColumns = visibleColumns;
        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedRoleItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedRoleItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        }

        var ColumnSortFilter = columnSortFilterForRoles;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);
        getRolesReq.Pagination = Pagination;
        getRolesReq.ColumnSortFilter = ColumnSortFilter;
        getRolesReq.Export = Export;
        getRolesReq.Selector = Selector;
        var param = new Object();
        param.token = TOKEN();
        param.getRolesReq = getRolesReq;
        return param;
    }
    //end grid
});
