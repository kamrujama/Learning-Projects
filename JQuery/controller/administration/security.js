define(["knockout", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "AppConstants"], function (ko, autho) {
    var lang = getSysLang();
    var columnSortFilterForSecurityGroups = new Object();

    return function securityGroupsViewModel() {
    

        var self = this;

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();
        self.securityGroupName = ko.observable();
        self.securityGroupID = ko.observable();

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        setMenuSelection();
        modelReposition();
        self.openPopup = function (popupName, gID) {
            self.templateFlag(true);
            if (popupName == "modelAddSecurityGroups") {
                loadelement(popupName, 'administration');
                $('#modelSecurityID').modal('show');
            } else if (popupName == "modelEditSecurityGroup") {


                var selecteItemIds = getSelectedUniqueId(gID);
                var checkAll = checkAllSelected(gID);
                var unSelecteItemIds = getUnSelectedUniqueId(gID);
                var datacount = getTotalRowcount(gID);
                if (checkAll == 1) {
                    if (unSelecteItemIds.length == datacount - 1) {
                        loadelement(popupName, 'administration');
                        $('#modelSecurityID').modal('show');
                        editSecurityButton(gID);
                    }
                    else {
                        openAlertpopup(1, 'please_select_a_single_security_group_to_edit');
                        return;
                    }
                } else {
                    if (selecteItemIds.length == 1) {
                        loadelement(popupName, 'administration');
                        $('#modelSecurityID').modal('show');
                        editSecurityButton(gID);
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'please_select_security_group_to_edit');
                        return;
                    } else if (selecteItemIds.length > 1) {
                        openAlertpopup(1, 'please_select_a_single_security_group_to_edit');
                        return;
                    }
                }
            }
        }

        function editSecurityButton(gID) {
            var selectedRolesData = getMultiSelectedData(gID);

            var selectedarr = new Array();
            for (var i = 0; i < selectedRolesData.length; i++) {
                if (selectedRolesData[i] != null) {
                    var editRoles = new Object();
                    editRoles.selectedSecurityGroupName = selectedRolesData[i].SecurityGroupName;
                    editRoles.selectedDescription = selectedRolesData[i].Description;
                    editRoles.selectedRolesCsv = selectedRolesData[i].RolesCsv;
                    editRoles.selectedSecurityGroupId = selectedRolesData[i].SecurityGroupId;
                    selectedarr.push(editRoles);
                    globalVariableForEditRoles = selectedarr;
                    
                }
            }
        }


        //unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
            $('#modelSecurityID').modal('hide');
        };

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

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
            var selectedSecurityGroupsItems = getSelectedUniqueId(gID);
            
            var unselectedSecurityGroupsItems = getUnSelectedUniqueId(gID);
            var checkAll = checkAllSelected(gID);
            

            var param = getSecurityGroupsDetails(isExport, columnSortFilterForSecurityGroups, selectedSecurityGroupsItems, unselectedSecurityGroupsItems, checkAll);

            var datainfo = $("#" + gID).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                securityGroupsExport(param);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }

        }

        // delete security group
        self.deleteSecurityGroup = function (gID) {

            var deleteCount = getAllSelectedDataCount(gID);
            var checkAll = checkAllSelected(gID);
            var getSelectedData = getMultiSelectedData(gID);

            for (var i = 0; i < getSelectedData.length; i++) {
                if (getSelectedData[i] != null) {
                    var groupName = getSelectedData[i].SecurityGroupName;
                }
            }

            if (checkAll == 1) {
                if (deleteCount < 1) {
                    openAlertpopup(1, 'please_select_a_security_group_to_delete');
                } else if (deleteCount == 1) {
                    $("#modelDeleteSecID").modal('show');
                    $("#deleteSecCountId").text(i18n.t('are_you_sure_you_want_to_delete_single_security_group', { deleteSecurityGroup: groupName }, { lng: lang }));
                } else if (deleteCount > 1) {
                    $("#modelDeleteSecID").modal('show');
                    $("#deleteSecCountId").text(i18n.t('are_you_sure_you_want_to_delete_these_security_groups', { deleteCount: deleteCount }, { lng: lang }));
                }
            } else {
                if (getSelectedData.length == 1) {
                    $("#modelDeleteSecID").modal('show');
                    $("#deleteSecCountId").text(i18n.t('are_you_sure_you_want_to_delete_single_security_group', { deleteSecurityGroup: groupName }, { lng: lang }));
                } else if (getSelectedData.length > 1) {
                    $("#modelDeleteSecID").modal('show');
                    $("#deleteSecCountId").text(i18n.t('are_you_sure_you_want_to_delete_these_security_groups', { deleteCount: deleteCount }, { lng: lang }));
                } else if (getSelectedData.length == 0) {
                    openAlertpopup(1, 'please_select_a_security_group_to_delete');
                    return;
                }
            }
        }

        //delted security group
        self.deleteSecurity = function (observableModelPopup, gID) {
            var getSelectedData = getMultiSelectedData(gID);
            deleteSecurityGroupDetails(observableModelPopup, getSelectedData, false, gID);
        }

        // delete security group on status code
        self.deleteAnyWaySecurity = function (observableModelPopup, gID) {
            var getSelectedData = getMultiSelectedData(gID);
            deleteSecurityGroupDetails(observableModelPopup, getSelectedData, true, gID);
        }

        var param = getSecurityGroupsDetails(false, columnSortFilterForSecurityGroups, null, null, null);
        jqxGridSecurityGroupsDetails(param, 'jqxgridSecurityGroups');

        seti18nResourceData(document, resourceStorage);
    };


    function deleteSecurityGroupDetails(observableModelPopup, getSelectedData, isDeleteAnyway, gID) {

        var securityGroup = new Array();      

        for (var i = 0; i < getSelectedData.length; i++) {

            var EGenericConfigurations = new Object();
            EGenericConfigurations.SecurityGroupId = getSelectedData[i].SecurityGroupId;
            EGenericConfigurations.SecurityGroupName = getSelectedData[i].SecurityGroupName;
            securityGroup.push(EGenericConfigurations);
        }

        var isDeleteAnyway = isDeleteAnyway;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'security_group_deleted_successfully');
                    gridFilterClear(gID);

                } else if (data.responseStatus.StatusCode == AppConstants.get('ADMIN_SECURITYGROUP_CANNOT_DELETED')) {
                    openAlertpopup(1, 'administrator_must_have_atleast_one_security_group');
                }
                else if (data.responseStatus.StatusCode == AppConstants.get('SECURITY_GROUPS_CANNOT_BE_DELETED')) {
                    if (getSelectedData.length == 1) {
                        $("#modelDeleteID").modal('show');
                        $("#deletedMsgID").text(i18n.t('users_associated_with_security', { securityGroup: getSelectedData[0].SecurityGroupName }, { lng: lang }));

                    } else {
                        $("#modelDeleteID").modal('show');
                        $("#deletedMsgID").text(i18n.t('users_associated_with_the_selected_security_groups_may_not_be_able_to_login_to_VHQ', { lng: lang }));
                    }                   
                }
            }
        }

        var method = 'DeleteSecurityGroups ';
        var params = '{"token":"' + TOKEN() + '","securityGroup":' + JSON.stringify(securityGroup) + ',"isDeleteAnyway":' + isDeleteAnyway + '}';
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

    //Export data
    function securityGroupsExport(param) {

        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(1, 'export_Sucess');
                }
            } 
        }

        var method = 'GetSecurityGroups';
        var params = JSON.stringify(param);
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    // display data in jqxgrid
    function jqxGridSecurityGroupsDetails(param, gID) {

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

        var source = {
            dataType: 'json',
            dataFields: [
                { name: 'SecurityGroupName', map: 'SecurityGroupName' },
                { name: 'Description', map: 'Description' },
                { name: 'RolesCsv', map: 'RolesCsv' },
                { name: 'ModifiedByUserName', map: 'ModifiedByUserName' },
                { name: 'CreatedByUserName', map: 'CreatedByUserName' },
                { name: 'CreatedOn', map: 'CreatedOn', type: 'date' },
                { name: 'ModifiedOn', map: 'ModifiedOn' ,type:'date'},
                { name: 'SecurityGroupId', map: 'SecurityGroupId' },
                { name: 'isSelected', type: 'number' },
            ],
            root: 'SecurityGroupRoles',
            type: 'POST',
            data: param,

            url: AppConstants.get('API_URL') + "/GetSecurityGroups",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getSecurityGroupsResp) 
                {
                    data.getSecurityGroupsResp = $.parseJSON(data.getSecurityGroupsResp);
                    if (data.getSecurityGroupsResp.PaginationResponse) {
                        source.totalrecords = data.getSecurityGroupsResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getSecurityGroupsResp.PaginationResponse.TotalPages;
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getSecurityGroupsResp.SecurityGroupRoles = [];
                    }
                }
                else
                {
                    data.getSecurityGroupsResp = [];
                }
            },
        }

        var dataAdapter = new $.jqx.dataAdapter(source,
         {
             formatData: function (data) {
                 $('.all-disabled').show();
                 disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                 var columnSortFilter = new Object();
                 columnSortFilter = columnSortFilterFormatedData(columnSortFilterForSecurityGroups, gID, gridStorage, 'SecurityGroups');

                 param.getSecurityGroupsReq.ColumnSortFilter = columnSortFilter;
                 param.getSecurityGroupsReq.Pagination = getPaginationObject(param.getSecurityGroupsReq.Pagination, gID);
                 data = JSON.stringify(param);
                 return data;
             },
             downloadComplete: function (data, status, xhr) {
                 enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
               
                 if (data.getSecurityGroupsResp && data.getSecurityGroupsResp.SecurityGroupRoles != '') {
                     for (var i = 0; i < data.getSecurityGroupsResp.SecurityGroupRoles.length; i++) {
                         data.getSecurityGroupsResp.SecurityGroupRoles[i].CreatedOn = convertToLocaltimestamp(data.getSecurityGroupsResp.SecurityGroupRoles[i].CreatedOn);
                         data.getSecurityGroupsResp.SecurityGroupRoles[i].ModifiedOn = convertToLocaltimestamp(data.getSecurityGroupsResp.SecurityGroupRoles[i].ModifiedOn);
                     }
                     if (data.getSecurityGroupsResp.TotalSelectionCount != 'undefined') {
                         gridStorage[0].TotalSelectionCount = data.getSecurityGroupsResp.TotalSelectionCount;
                         var updatedGridStorage = JSON.stringify(gridStorage);
                         window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                     }

                     //if (data.getSecurityGroupsResp.PaginationResponse) {
                     //    if (data.getSecurityGroupsResp.PaginationResponse.HighLightedItemPage > 0) {
                     //        gridStorage[0].highlightedPage = data.getSecurityGroupsResp.PaginationResponse.HighLightedItemPage;
                     //        var updatedGridStorage = JSON.stringify(gridStorage);
                     //        window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                     //    }
                     //}
                 } else {
                     data.getSecurityGroupsResp = new Object();
                     data.getSecurityGroupsResp.SecurityGroupRoles = [];
                 }
                 $('.all-disabled').hide();
             },
             loadError: function (jqXHR, status, error) {
                 $('.all-disabled').hide();
             }
         }
     );

        var rendered = function (element) {
            enablegridfunctions(gID, 'SecurityGroupId', element, gridStorage, true, 'pagerDivSecurityGroups', false, 0, 'SecurityGroupId', null, null, null);
            return true;
        }

        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }

        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

        }

        $("#" + gID).jqxGrid(
        {
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
            enabletooltips: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            autoshowcolumnsmenubutton: false,
            rowsheight: 32,
            rendergridrows: function () {
                return dataAdapter.records;
            },

            autoshowfiltericon: true,

            columns: [
                 {
                     text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false,
                     datafield: 'isSelected', width: 40,
                     renderer: function () {
                         return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                     },
                     rendered: rendered,
                 },
                 {
                     text: i18n.t('security_group_name', { lng: lang }), datafield: 'SecurityGroupName', editable: false, minwidth: 150, 
                     filtertype: "custom",
                     createfilterpanel: function (datafield, filterPanel) {
                         buildFilterPanel(filterPanel, datafield);
                     }
                 },
                  {
                      text: i18n.t('content_description', { lng: lang }), dataField: 'Description', editable: false, minwidth: 130,
                      filtertype: "custom",
                      createfilterpanel: function (datafield, filterPanel) {
                          buildFilterPanel(filterPanel, datafield);
                      }
                  },
                  {
                      text: i18n.t('role_(s)', { lng: lang }), datafield: 'RolesCsv', editable: false, minwidth: 130,  menu: false, sortable: false, filterable: false,
                  },
                  {
                      text: i18n.t('created_by', { lng: lang }), datafield: 'CreatedByUserName', editable: false, minwidth: 120,  enabletooltips: false, menu: false, sortable: false, filterable: false,
                  },
                  {
                      text: i18n.t('createdOn', { lng: lang }), datafield: 'CreatedOn', cellsformat:
                       LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 150, 
                       filtertype: "custom",
                       createfilterpanel: function (datafield, filterPanel) {
                           buildFilterPanelDate(filterPanel, datafield);

                       }
                  },
                 {
                     text: i18n.t('p_t_copy_modifiedby', { lng: lang }), datafield: 'ModifiedByUserName', editable: false, minwidth: 130,enabletooltips: false, menu: false, sortable: false, filterable: false,
                 },
                 {
                     text: i18n.t('p_t_copy_modifiedon', { lng: lang }), datafield: 'ModifiedOn', cellsformat:
                      LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 150, 
                     filtertype: "custom",
                     createfilterpanel: function (datafield, filterPanel) {
                         buildFilterPanelDate(filterPanel, datafield);

                     }
                 },
            ]
        });

        getGridBiginEdit(gID, 'SecurityGroupId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'SecurityGroupId');
    }

    function getSecurityGroupsDetails(isExport, columnSortFilterForSecurityGroups, selectedSecurityGroupsItems, unselectedSecurityGroupsItems, checkAll) {

        var getSecurityGroupsReq = new Object();
        var Export = new Object();
        var Pagination = new Object();
        var Selector = new Object();

        Export.DynamicColumns = null;

        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedSecurityGroupsItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedSecurityGroupsItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        }

        var ColumnSortFilter = columnSortFilterForSecurityGroups;

        Pagination.HighLightedItemId = null;
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        getSecurityGroupsReq.ColumnSortFilter = ColumnSortFilter;
        getSecurityGroupsReq.Export = Export;
        getSecurityGroupsReq.Pagination = Pagination;
        getSecurityGroupsReq.Selector = Selector;

        var param = new Object();
        param.token = TOKEN();
        param.getSecurityGroupsReq = getSecurityGroupsReq;

        return param;

    }
});