define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "AppConstants"], function (ko, koUtil, autho) {

    var lang = getSysLang();
    columnSortFilter = new Object();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function alertHistoryViewModel() {


        var self = this;

        $('#refreshGroupList').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#refreshGroupList').click();
            }
        });

        $('#addGroup').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#addGroup').click();
            }
        });

        $('#editGroup').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#editGroup').click();
            }
        });

        $('#deleteGroups').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#deleteGroups').click();
            }
        });

        checkRights();
        //Check rights
        function checkRights(screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen('Groups and Hierarchies', 'IsModifyAllowed');
            var deleteVal = autho.checkRightsBYScreen('Groups and Hierarchies', 'IsDeleteAllowed');
            if (retval == false) {
                $("#addGroup").prop("disabled", true);
                $("#editGroup").prop("disabled", true);
            } else {
                $("#addGroup").prop("disabled", false);
                $("#editGroup").prop("disabled", false);
            }

            if (deleteVal == false) {
                $("#deleteGroups").prop("disabled", true);
            } else {
                $("#deleteGroups").prop("disabled", false);
            }
        }


        self.clearfilter = function (gId) {
            gridFilterClear(gId);
        }
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }

        //open popup
        self.observableModelPopup = ko.observable();

        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');
        self.templateFlag = ko.observable(false);
        self.gridIdForShowHide = ko.observable();

        setMenuSelection();
        modelReposition();
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);

            if (popupName == "modelExportSucess") {
                loadelement(popupName, 'genericPopup');
                $('#viewgroupEstablishMentModal').modal('show');
            } else if (popupName == "modelAddGroupEstablishment") {
                loadelement(popupName, 'administration');
                $('#viewgroupEstablishMentModal').modal('show');
            } else if (popupName == "modelEditGroupEstablishment") {

                var selecteItemIds = getSelectedUniqueId('jqxgridGroupEstablishment');
                var checkAll = checkAllSelected('jqxgridGroupEstablishment');
                var unSelecteItemIds = getUnSelectedUniqueId('jqxgridGroupEstablishment');
                var datacount = getTotalRowcount('jqxgridGroupEstablishment');
                if (checkAll == 1) {
                    if (unSelecteItemIds.length == datacount - 1) {
                        loadelement(popupName, 'administration');
                        $('#viewgroupEstablishMentModal').modal('show');
                        editButtonClick('jqxgridGroupEstablishment');
                    }
                    else {
                        openAlertpopup(1, 'please_select_a_single_group_to_edit');
                        return;
                    }

                } else {
                    if (selecteItemIds.length == 1) {
                        loadelement(popupName, 'administration');
                        $('#viewgroupEstablishMentModal').modal('show');
                        editButtonClick('jqxgridGroupEstablishment');
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'please_select_a_group');
                        return;
                    } else if (selecteItemIds.length > 1) {
                        openAlertpopup(1, 'please_select_a_single_group_to_edit');
                        return;
                    }
                }

            } else if (popupName == "modelDeleteGroupEstablishment") {

                var selecteItemIds = getSelectedUniqueId('jqxgridGroupEstablishment');
                var deleteCount = getAllSelectedDataCount('jqxgridGroupEstablishment');
                var checkAll = checkAllSelected('jqxgridGroupEstablishment');

                if (checkAll == 1) {
                    if (deleteCount < 1) {
                        openAlertpopup(1, 'please_select_a_group');
                    } else {
                        loadelement(popupName, 'administration');
                        $('#viewgroupEstablishMentModal').modal('show');
                        deleteButtonClick(gId, 1);
                    }

                } else {
                    if (selecteItemIds.length == 1 || selecteItemIds.length > 1) {
                        loadelement(popupName, 'administration');
                        $('#viewgroupEstablishMentModal').modal('show');
                        deleteButtonClick(gId, 1);
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'please_select_a_group');
                        return;
                    }
                }

            }

        }

        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
            $('#viewgroupEstablishMentModal').modal('hide');            
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }



        //  ExportToExcel 
        self.exportToExcel = function (isExport, gId) {
            var selectedGroupEstablishmentItems = getSelectedUniqueId(gId);
            var unSelectedGroupEstablishmentItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getGroupEstablishmentParameters(true, selectedGroupEstablishmentItems, unSelectedGroupEstablishmentItems, checkAll, columnSortFilter, visibleColumnsList);


            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                groupEstablishmentExport(param, gId, self.openPopup);
            } else {

                openAlertpopup(1, 'no_data_to_export');
            }
        }

        //ExportToExcel Goes To this Function
        function groupEstablishmentExport(param, gId, openPopup) {

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetGroups';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

        }

        //Edit Button Click
        function editButtonClick(gID) {
            var selectedIds = getMultiSelectedData(gID);
            var selectedarr = new Array();
            for (var i = 0; i < selectedIds.length; i++) {
                var editGroup = new Object();
                editGroup.selectedGroupId = selectedIds[i].GroupId;
                editGroup.selectedDescription = selectedIds[i].Description;
                editGroup.selectedGroupName = selectedIds[i].GroupName;
                selectedarr.push(editGroup);
                globalVariableForEditGroup = selectedarr;
                globalVariableForEditGroup.gID = gID;
            }
        }

        function deleteButtonClick(gID, check) {

            var selectedDeleteIds = getSelectedUniqueId(gID);
            var selectedData = getMultiSelectedData(gID);
            var unSelecedRowID = getUnSelectedUniqueId(gID);
            var checkAll = checkAllSelected(gID);
            var selectedarr = new Array();
            var deleteGroup = new Object();
            var selectedsource = _.where(selectedData, { GroupId: selectedDeleteIds[0] });
            if (checkAll == 1) {
                deleteGroup.selectedRowID = null;
                deleteGroup.unSelecedRowID = unSelecedRowID;
                deleteGroup.selectedData = selectedData;
            }
            else {
                deleteGroup.selectedGroupName = selectedsource[0].GroupName;
                deleteGroup.selectedDescription = selectedsource[0].Description;
                deleteGroup.selectedRowID = selectedDeleteIds;
                deleteGroup.unSelecedRowID = null;
            }
            deleteGroup.checkAll = checkAll;
            selectedarr.push(deleteGroup);
            globalVariableFordeleteGroupEstablishmnet = selectedarr;


        }

        //grid call
        //$("#GroupEstGridMain").empty();
        //var str = '<div id="jqxgridGroupEstablishment" style="width: 100%" tabindex="7"></div><div id="pagerDivGroupEstablishment"></div>';
        //$("#GroupEstGridMain").append(str);
        var param = getGroupEstablishmentParameters(false, null, null, 0, columnSortFilter, []);
        groupEstablishmentGrid('jqxgridGroupEstablishment', param, self.openPopup);

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

    function groupEstablishmentGrid(gID, param) {

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


        var source =
            {
                dataType: "json",
                dataFields: [
                    { name: 'isSelected', type: 'number' },
                    { name: 'Description', map: 'Description' },
                    { name: 'CreatedBy', map: 'CreatedByUserName' },
                    { name: 'CreatedOn', map: 'CreatedOn', type: 'date' },
                    { name: 'ModifiedBy', map: 'ModifiedByUserName' },
                    { name: 'ModifiedOn', map: 'ModifiedOn', type: 'date' },
                    { name: 'GroupId', map: 'GroupId' },
                    { name: 'GroupName', map: 'GroupName', type: 'string' }
                ],
                root: 'Groups',
                type: "POST",
                data: param,

                url: AppConstants.get('API_URL') + "/GetGroups",
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data.getGroupsResp)
                        data.getGroupsResp = $.parseJSON(data.getGroupsResp);
                    else
                        data.getGroupsResp = [];

                    if (data.getGroupsResp && data.getGroupsResp.PaginationResponse) {
                        source.totalrecords = data.getGroupsResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getGroupsResp.PaginationResponse.TotalPages;
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
                    //    disableIcons(['refreshGroupList', 'addGroup', 'editGroup', 'deleteGroups', 'btnExportToexcel', 'btnRestFilter']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'GroupEstablishment');
                    koUtil.GlobalColumnFilter = columnSortFilter;
                    param.getGroupsReq.ColumnSortFilter = columnSortFilter;
                    param.getGroupsReq.Pagination = getPaginationObject(param.getGroupsReq.Pagination, gID);

                    updatepaginationOnState(gID, gridStorage, param.getGroupsReq.Pagination, null, null);

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    //  enableIcons(['refreshGroupList', 'addGroup', 'editGroup', 'deleteGroups', 'btnRestFilter', 'btnExportToexcel']);                    

                    if (data.getGroupsResp) {
                        //if (data.getGroupsResp.PaginationResponse && data.getGroupsResp.PaginationResponse.HighLightedItemPage > 0) {
                        //    //for (var h = 0; h < data.getGroupsResp.Groups.length; h++) {
                        //    //if (data.getGroupsResp.Groups[h].GroupId == data.getGroupsResp.PaginationResponse.HighLightedItemId) {
                        //    gridStorage[0].highlightedPage = data.getGroupsResp.PaginationResponse.HighLightedItemPage;
                        //    var updatedGridStorage = JSON.stringify(gridStorage);
                        //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        //    //}
                        //    //}
                        //}
                        if (data.getGroupsResp.Groups) {
                            for (var i = 0; i < data.getGroupsResp.Groups.length; i++) {
                                data.getGroupsResp.Groups[i].CreatedOn = convertToLocaltimestamp(data.getGroupsResp.Groups[i].CreatedOn);
                                data.getGroupsResp.Groups[i].ModifiedOn = convertToLocaltimestamp(data.getGroupsResp.Groups[i].ModifiedOn);
                            }

                        } else {
                            data.getGroupsResp = new Object();
                            data.getGroupsResp.Groups = [];
                        }
                    } else {
                        data.getGroupsResp = new Object();
                        data.getGroupsResp.Groups = [];
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
            enablegridfunctions(gID, 'GroupId', element, gridStorage, true, 'pagerDivGroupEstablishment', false, 0, 'GroupId', null, null, null);
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


        function groupNamerenderer(row, columnfield, value, defaulthtml, columnproperties) {

            return '<div class="systemConfiguration-name-txt" style="padding-left:5px;padding-top:5px;text-overflow:ellipsis; cursor: default !important;"><span title="' + value + '">' + value + '</span></div>';

        }




        $("#" + gID).jqxGrid(
            {
                height: gridHeightFunction(gID, "50"),
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
                    //gridRefresh(gID);

                    var columns = genericHideShowColumn(gID, true, []);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                },

                columns: [
                    {
                        text: '', sortable: false, filterable: false, resizable: false, draggable: false, columntype: 'checkbox', enabletooltips: false, menu: false,
                        datafield: 'isSelected', minwidth: 40, width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered,
                    },
                    {
                        text: i18n.t('Group_Name_headertext', { lng: lang }), datafield: 'GroupName', editable: false, minwidth: 110, enabletooltips: false, cellsrenderer: groupNamerenderer,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                    {
                        text: i18n.t('description', { lng: lang }), datafield: 'Description', editable: false, minwidth: 120, cellsformat: LONG_DATETIME_GRID_FORMAT,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },

                    {
                        text: i18n.t('created_by', { lng: lang }), datafield: 'CreatedBy', editable: false, minwidth: 100, sortable: false, filterable: false, menu: false

                    },
                    {
                        text: i18n.t('createdOn', { lng: lang }), datafield: 'CreatedOn', editable: false, minwidth: 150, enabletooltips: false, filterable: true, cellsformat: LONG_DATETIME_GRID_FORMAT,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        },
                    },
                    {
                        text: i18n.t('p_t_copy_modifiedby', { lng: lang }), datafield: 'ModifiedBy', editable: false, minwidth: 100, sortable: false, filterable: false, menu: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                    {
                        text: i18n.t('p_t_copy_modifiedon', { lng: lang }), datafield: 'ModifiedOn', editable: false, minwidth: 150, enabletooltips: false, filterable: true, cellsformat: LONG_DATETIME_GRID_FORMAT,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        },
                    }

                ]
            });
        getGridBiginEdit(gID, 'GroupId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'GroupId');
    }


    //Group Establishment Parameter
    function getGroupEstablishmentParameters(isExport, selectedGroupEstablishmentItems, UnSelectedGroupEstablishmentItems, checkAll, columnSortFilter, visibleColumns) {
        getGroupsReq = new Object();
        var FilterList = new Array();

        var Export = new Object();
        var Pagination = new Object();
        var Selector = new Object();
        Export.DynamicColumns = null;

        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = UnSelectedGroupEstablishmentItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedGroupEstablishmentItems;
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

        var coulmnfilter = columnSortFilter;
        var CategoryId = new Object();

        Pagination.HighLightedItemId = null;
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Selector.SelectedItemIds = selectedGroupEstablishmentItems;
        Selector.UnSelectedItemIds = null;
        getGroupsReq.Export = Export;
        getGroupsReq.ColumnSortFilter = coulmnfilter;
        getGroupsReq.Pagination = Pagination;
        getGroupsReq.ShowAllRecords = false;
        getGroupsReq.Source = null;
        var param = new Object();
        param.token = TOKEN();
        param.getGroupsReq = getGroupsReq;
        return param;

    }
});


