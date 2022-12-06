define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho) {

    SelectedIdOnGlobale = new Array
    columnSortFilter = new Object();
    var lang = getSysLang();
    koUtil.GlobalColumnFilter = new Array();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function downloadLibararyappViewModel() {

        var self = this;

        updateComponentsOnUserAuthentication(self, 'users');

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

        $('#editUserBtn').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#editUserBtn').click();
            }
        });

        $('#deactivateBtn').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#deactivateBtn').click();
            }
        });

        //--------------FOCUS ON POP UP------------------------

        $('#userDeleteModel').on('shown.bs.modal', function (e) {
            $('#userDeleteModelBtn_No').focus();

        });
        $('#userDeleteModel').keydown(function (e) {
            if ($('#userDeleteModelBtn_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#userDeleteModelBtn_Yes').focus();
            }
        });
        //-------------------------------------------

        //Getting User Guid
        userrData = JSON.parse(sessionStorage.getItem("userrData"));
        userGuid = userrData[0].UserGuid;

        SelectedIdOnGlobale = new Array();
        checkALlPageId = 0;
        pagechangedcheck = 0;
        totalselectedRowCount = 0;
        checkRightsForUser();     

        //
        function checkRightsForUser() {
            var retval = autho.checkRightsBYScreen('Roles and Users', 'IsDeleteAllowed');
            if (retval == true) {
                if (!IsVHQAuthorizedUser || IsExternalIdp) {
                    $("#deactivateBtn").hide();
                } else {
                    $("#deactivateBtn").show();
                }
            }
        }


        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            if (retval == true) {
                return false;
            } else {
                return true;
            }
        }

        self.templateFlag = ko.observable(false);
        self.checksample = ko.observable();
        self.observableModelPopup = ko.observable();
        self.observableModelPopupShowHide = ko.observable();

        setMenuSelection();

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        loadelementForShowHide(modelname, 'genericPopup');
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['LastLoginDate'];
        self.columnlist = ko.observableArray();

        //Load grid of uesrs
        var param = getUsersParameters(false, columnSortFilter, null, null, 0, []);
        usersGrid('jqxgridUsers', param);

        isAdpopup = '';

        //Clear filter
        self.clearfilter = function (gId) {
            gridFilterClear(gId);
        }

        //Refresh Grid
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }

        //Deactivate users
        self.deactivateUser = function (gId) {
            var selecteItemIds = getSelectedUniqueId('jqxgridUsers');
            var unSelectedIds = getUnSelectedUniqueId('jqxgridUsers');
            deleteUser(selecteItemIds, unSelectedIds, gId);
        }

        function CheckAttemptToDeleteMyself() {
            var userGuid = userrData[0].UserGuid;
            var source = getMultiSelectedData('jqxgridUsers');
            var selectedsource = _.where(source, { UserGuid: userGuid });
            if (selectedsource.length > 0) {
                if (selectedsource[0].UserGuid == userGuid) {
                    return true;
                }
            }
            return false;
        }

        //validation on delete click
        function deleteUser(selecteItemIds, unSelectedIds, gId) {
            var selectedDeleteIds = getSelectedUniqueId(gId);
            var deleteCount = getAllSelectedDataCount('jqxgridUsers');
            var checkAll = checkAllSelected('jqxgridUsers');

            //You cannot delete your own account
            var deletUserFlag = CheckAttemptToDeleteMyself();
            if (deletUserFlag == true) {
                openAlertpopup(3, 'You_cannot_delete_your_own_account');
                return;
            }

            var source = getMultiSelectedData(gId);
            var loginName;
            var selectedarr = new Array();

            for (var i = 0; i < source.length; i++) {
                var userObj = new Object();
                userObj.selectedLoginName = source[i].LoginName
                selectedarr.push(userObj);
                loginName = selectedarr[i].selectedLoginName
            }

            var inactive = 0;
            for (var i = 0; i < source.length; i++) {
                if (source[i].Status == "Inactive") {
                    inactive++;
                }
            }

            if (deleteCount < 1) {
                openAlertpopup(1, 'Please_select_atleast_one_user_to_delete');
            }

            if (deleteCount > 1) {
                if (inactive == deleteCount) {
                    openAlertpopup(1, i18n.t('selected_user', { deleteCount: deleteCount }, { lng: lang }));
                } else {
                    $('#userDeleteModel').modal('show');
                    if (inactive > 0) {
                        $("#active").text(i18n.t('only_active_will_be_deleted', { lng: lang }));
                    } else {
                        $("#active").text(i18n.t('Are_you_sure_you_want_to_deactivate_the', { deleteCount: deleteCount }, { lng: lang }));
                    }
                }
            } else {
                if (selecteItemIds.length == 1) {
                    if (inactive > 0) {
                        openAlertpopup(1, i18n.t('already_deactivated', { loginName: loginName }, { lng: lang }));
                    } else {
                        $('#userDeleteModel').modal('show');
                        $("#active").text(i18n.t('Are_you_sure_you_want_to_delete_user', { loginName: loginName }, { lng: lang }));
                    }

                } else if (selecteItemIds.length == 0) {
                    openAlertpopup(1, 'Please_select_atleast_one_user_to_delete');
                    $("#draggDeleteID").draggable();
                    return;
                }
            }

        }

        //Conformation delete click
        self.confirmDeleteUser = function (gId, isActivate) {
            var selectedDeleteIds = getSelectedUniqueId(gId);
            var selectedData = getMultiSelectedData(gId);
            var unSelecedRowID = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            var selectedarr = new Array();
            var deleteUser = new Object();
            var selectedsource = _.where(selectedData, { UserGuid: selectedDeleteIds[0] });
            if (checkAll == 1) {
                deleteUser.selectedRowID = null;
                deleteUser.unSelecedRowID = unSelecedRowID;
                deleteUser.selectedData = selectedData;
            }
            else {
                deleteUser.userGuid = selectedsource[0].UserGuid;
                deleteUser.selectedRowID = selectedDeleteIds;
                deleteUser.unSelecedRowID = null;
            }
            deleteUser.checkAll = checkAll;
            selectedarr.push(deleteUser);

            var activateDeactivateUsersReq = new Object();
            var selector = new Object();
            for (var i = 0; i < selectedarr.length; i++) {
                selector.SelectedItemIds = selectedarr[i].selectedRowID;
                selector.UnSelectedItemIds = selectedarr[i].unSelecedRowID;
            }
            activateDeactivateUsersReq.IncludeInternal = false;
            activateDeactivateUsersReq.Selector = selector;
            activateDeactivateUsersReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
            function callbackFunction(data, error) {
                if (data) {

                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(0, 'User_has_been_deactivated_successfully');
                        gridRefreshClearSelection('jqxgridUsers');
                    }
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'ActivateDeactivateUsers';
            var params = '{"token":"' + TOKEN() + '","activateDeactivateUsersReq":' + JSON.stringify(activateDeactivateUsersReq) + ',"isActive":"' + isActivate + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        function getSelectedIds() {
            return SelectedIdOnGlobale;
        }
        modelReposition();
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
                loadelementForShowHide(popupName, 'genericPopup');
                $('#downloadModelShowHide').modal('show');
            } else if (popupName == "modelEditUser") {
                isHierarchyChange = false;
                var selecteItemIds = getSelectedUniqueId('jqxgridUsers');
                var checkAll = checkAllSelected('jqxgridUsers');
                var unSelecteItemIds = getUnSelectedUniqueId('jqxgridUsers');
                var datacount = getTotalRowcount('jqxgridUsers');
                if (checkAll == 1) {
                    if (unSelecteItemIds.length == datacount - 1) {
                        loadelement(popupName, 'administration');
                        $('#usersModel').show();
                        $("#editUserScreen").show();
                        $('#userMainScreen').hide();
                        editButtonClick('jqxgridUsers');
                    }
                    else {
                        openAlertpopup(1, 'select_single_user_to_edit');
                        return;
                    }

                } else {
                    if (selecteItemIds.length == 1) {
                        loadelement(popupName, 'administration');
                        $('#usersModel').show();
                        $("#editUserScreen").show();
                        $('#userMainScreen').hide();
                        editButtonClick('jqxgridUsers');
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'Please_select_user_to_edit.');
                        return;
                    } else if (selecteItemIds.length > 1) {
                        openAlertpopup(1, 'select_single_user_to_edit');
                        return;
                    }
                }
            } else if (popupName == "modelAddUser") {
                isHierarchyChange = false;
                loadelement(popupName, 'administration');
                $('#usersModel').show();
                $('#userMainScreen').hide();

            }
        }


        //Edit button click
        function editButtonClick(gId) {
            var selectedIds = getMultiSelectedData(gId);
            var selectedarr = new Array();
            for (var i = 0; i < selectedIds.length; i++) {
                var editUser = new Object();
                editUser.selectedFirstName = selectedIds[i].FirstName;
                editUser.selectedLoginName = selectedIds[i].LoginName;
                editUser.selectedLastName = selectedIds[i].LastName;
                editUser.selectedUserGuid = selectedIds[i].UserGuid;
                editUser.selectedEmailId = selectedIds[i].AlertEmail;
                editUser.selectedPrimaryPhone = selectedIds[i].ContactNumber1;
                editUser.selectedalternatePhone = selectedIds[i].ContactNumber2;
                editUser.selectedTitle = selectedIds[i].Title;
                editUser.selectedColorTheme = selectedIds[i].ColorTheme;
                editUser.selectedLastFailedLoginDate = selectedIds[i].LastFailedLoginDate;
                editUser.selectedLastLoginDate = selectedIds[i].LastLoginDate;
                editUser.selectedRowInsertedDate = selectedIds[i].RowInsertedDate;
                editUser.selectedRowUpdatedDate = selectedIds[i].RowUpdatedDate;
                editUser.selectedStatus = selectedIds[i].Status;
                editUser.selectedHierarchyName = selectedIds[i].HierarchyName;
                editUser.selectedHierarchyLevel = selectedIds[i].HierarchyLevel;
                selectedarr.push(editUser);
                globalVariableForEditUser = selectedarr;
                globalVariableForEditUser.gId = gId;
            }
        }


        //Load Template
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        //Load element for show/hide
        function loadelementForShowHide(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopupShowHide(elementname);
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
        }

        //Unload template for show/hide
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopupShowHide('unloadTemplate');
            $('#downloadModelShowHide').modal('hide');
        }

        //Generate template
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

        //Export to excel functionality
        self.exportToExcel = function (isExport, gId, exportflage) {
            var selectedUserItems = getSelectedUniqueId(gId);
            var unselectedUserItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getUsersParameters(true, columnSortFilter, selectedUserItems, unselectedUserItems, checkAll, visibleColumnsList);


            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflage = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                usersExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function usersExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetUsers';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
        }

        seti18nResourceData(document, resourceStorage);
    };

    //Grid for fetching users
    function usersGrid(gID, param) {

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

        var source =
            {
                dataType: "json",
                dataFields: [
                    { name: 'isSelected', type: 'number' },
                    { name: 'LoginName', map: 'LoginName' },
                    { name: 'FirstName', map: 'FirstName' },
                    { name: 'FileName', map: 'FileName' },
                    { name: 'LastName', map: 'LastName' },
                    { name: 'Title', map: 'Title' },
                    { name: 'AlertEmail', map: 'AlertEmail' },
                    { name: 'LastLoginDate', map: 'LastLoginDate', type: 'date' },
                    { name: 'Status', map: 'Status' },
                    { name: 'CreatedByUserName', map: 'CreatedByUserName' },
                    { name: 'CreatedOn', map: 'CreatedOn', type: 'date' },
                    { name: 'ModifiedByUserName', map: 'ModifiedByUserName' },
                    { name: 'ModifiedOn', map: 'ModifiedOn', type: 'date' },
                    { name: 'UserGuid', map: 'UserGuid' },
                    { name: 'ContactNumber1', map: 'ContactNumber1' },
                    { name: 'ContactNumber2', map: 'ContactNumber2' },
                    { name: 'HierarchyName', map: 'UserHierarchy>Hierarchy>HierarchyName' },
                    { name: 'HierarchyLevel', map: 'UserHierarchy>Hierarchy>Level' },
                    { name: 'Status', map: 'Status' },
                    { name: 'Roles', map: 'Roles' }
                ],
                root: 'UserList',
                type: "POST",
                data: param,

                url: AppConstants.get('API_URL') + "/GetUsers",
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data.getUsersResp)
                        data.getUsersResp = $.parseJSON(data.getUsersResp);
                    else
                        data.getUsersResp = [];

                    if (data.getUsersResp && data.getUsersResp.PaginationResponse) {
                        source.totalrecords = data.getUsersResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getUsersResp.PaginationResponse.TotalPages;
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
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'Users');
                    param.getUsersReq.ColumnSortFilter = columnSortFilter;
                    koUtil.GlobalColumnFilter = columnSortFilter;
                    param.getUsersReq.Pagination = getPaginationObject(param.getUsersReq.Pagination, gID);

                    updatepaginationOnState(gID, gridStorage, param.getUsersReq.Pagination, null, null);

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {

                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                    if (data.getUsersResp && data.getUsersResp.UserList) {
                        for (var i = 0; i < data.getUsersResp.UserList.length; i++) {
                            data.getUsersResp.UserList[i].CreatedOn = convertToLocaltimestamp(data.getUsersResp.UserList[i].CreatedOn);
                            data.getUsersResp.UserList[i].ModifiedOn = convertToLocaltimestamp(data.getUsersResp.UserList[i].ModifiedOn);
                            data.getUsersResp.UserList[i].LastLoginDate = convertToLocaltimestamp(data.getUsersResp.UserList[i].LastLoginDate);
                        }
                        //if (data.getUsersResp.PaginationResponse && data.getUsersResp.PaginationResponse.HighLightedItemPage > 0) {
                        //    //for (var h = 0; h < data.getUsersResp.UserList.length; h++) {
                        //    //if (data.getUsersResp.UserList[h].UserGuid == data.getUsersResp.PaginationResponse.HighLightedItemId) {
                        //    gridStorage[0].highlightedPage = data.getUsersResp.PaginationResponse.HighLightedItemPage;
                        //    var updatedGridStorage = JSON.stringify(gridStorage);
                        //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        //    //}
                        //    //}
                        //}

                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getUsersResp = new Object();
                        data.getUsersResp.UserList = [];

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
        var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
            genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
        }
        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'UserGuid', element, gridStorage, true, 'pagerDivUsers', false, 0, 'UserGuid', null, null, null);
            return true;
        }

        var userStatus = function (row, column, value, defaultHtml) {

            if (value == "Active") {
                //defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><i class="icon-checkmark" style="color:green"></i></span><span style="padding-left:5px;padding-top:7px;" >' + value + '</span></div>';
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
            }
            if (value == "Inactive") {
                // defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><i class="icon-cross" style="color:red"></i></span><span style="padding-left:5px;padding-top:7px;" >' + value + '</span></div>';
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg inactive_Orange"></div></a>' + value + '</span></div>';
            }
            return defaultHtml;
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
                autoshowfiltericon: true,
                rendergridrows: function () {
                    return dataAdapter.records;
                },

                ready: function () {
                    callOnGridReady(gID, gridStorage);

                    var columns = genericHideShowColumn(gID, true, []);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                },

                columns: [
                    {
                        text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    { text: '', datafield: 'UserGuid', hidden: true, editable: false, },
                    {
                        text: i18n.t('user_name', { lng: lang }), datafield: 'LoginName', editable: false, minwidth: 100,


                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('first_name', { lng: lang }), datafield: 'FirstName', editable: false, minwidth: 100, filterable: true,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                    {
                        text: i18n.t('Last_user_name', { lng: lang }), datafield: 'LastName', editable: false, minwidth: 100, filterable: true,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                    {
                        text: i18n.t('title', { lng: lang }), datafield: 'Title', editable: false, minwidth: 100, filterable: true,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('roles', { lng: lang }), datafield: 'Roles', editable: false,

                        minwidth: 120, filterable: false, sortable: false, menu: false,

                    },
                    {
                        text: i18n.t('email', { lng: lang }), datafield: 'AlertEmail', editable: false, minwidth: 150,


                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },

                    {
                        text: i18n.t('last_login', { lng: lang }), datafield: 'LastLoginDate', cellsformat:
                        LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 150,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('status_user', { lng: lang }), datafield: 'Status', enabletooltips: false, editable: false, minwidth: 100, cellsrenderer: userStatus,
                        sortable: true,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'ReferenceSet Status');
                        }
                    },
                    {
                        text: i18n.t('rpt_Created_By', { lng: lang }), datafield: 'CreatedByUserName', editable: false,

                        minwidth: 120, filterable: false, sortable: false, menu: false,

                    },
                    {
                        text: i18n.t('CreatedOnAdmin', { lng: lang }), datafield: 'CreatedOn', cellsformat:
                        LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 180,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('modify_by_group', { lng: lang }), sortable: false, datafield: 'ModifiedByUserName',

                        filterable: false, sortable: false, minwidth: 100, editable: false, menu: false,
                    },
                    {
                        text: i18n.t('modify_on_device_status', { lng: lang }), datafield: 'ModifiedOn', cellsformat:

                        LONG_DATETIME_GRID_FORMAT, minwidth: 180, filterable: true, editable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },

                ]
            });
        getGridBiginEdit(gID, 'UserGuid', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'UserGuid');


    }

    ///Getting parameter of Users
    function getUsersParameters(isExport, columnSortFilter, selectedUserItems, unselectedUserItems, checkAll, visibleColumns) {
        var getUsersReq = new Object();
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
            Selector.UnSelectedItemIds = unselectedUserItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.ExportReportType = 7;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.ExportReportType = 7;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedUserItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.ExportReportType = 7;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
                Export.ExportReportType = 7;
            }
        }

        var ColumnSortFilter = columnSortFilter;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);
        getUsersReq.Pagination = Pagination;
        getUsersReq.ColumnSortFilter = ColumnSortFilter;
        getUsersReq.includeInternal = false;
        getUsersReq.Export = Export;
        getUsersReq.Selector = Selector;
        var param = new Object();
        param.token = TOKEN();
        param.getUsersReq = getUsersReq;
        return param;
    }
    //end grid
});