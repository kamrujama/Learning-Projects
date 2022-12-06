define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil, autho) {
    var lang = getSysLang();
    var selectedRowData = new Array();
    var gridSeletedRowData = new Array();
    var systemConfiguartion = new Object();
    var referenceSetArrayTocheck = [];
    var selectedRowArrayfroSwap = new Array();
    var gridSelectedDataForSwap = new Array();

    Array.prototype.moveUp = function (value) {
        var index = this.indexOf(value),
            newPos = index - 1;

        if (index === -1)
            throw new Error("Element not found in array");

        this.splice(index, 1);
        if (index === 0)
            newPos = this.length;
        this.splice(newPos, 0, value);
    };

    Array.prototype.moveDown = function (value) {
        var index = this.indexOf(value),
            newPos = index + 1;

        if (index === -1)
            throw new Error("Element not found in array");

        this.splice(index, 1);
        if (index >= this.length)
            newPos = 0;
        this.splice(newPos, 0, value);
    };

    return function viewModelForEditHierarchyAssignment() {

        var self = this;

        //Draggable function
        $('#modelUnassignReferenceSetHeader').mouseup(function () {
            $("#modelUnassignRFS").draggable({ disabled: true });
        });

        $('#modelUnassignReferenceSetHeader').mousedown(function () {
            $("#modelUnassignRFS").draggable({ disabled: false });
        });


        $('#unAssignConfirmationPopup').on('shown.bs.modal', function (e) {
            $('#unAssignNo').focus();

        });
        $('#unAssignConfirmationPopup').keydown(function (e) {
            if ($('#unAssignNo').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#unAssignYes').focus();
            }
        });

        checkRight();

        function checkRight() {
            var retval = autho.checkRightsBYScreen('Download Library', 'IsModifyAllowed');
            if (retval) {
                $("#btnSave").prop("disabled", false);
            } else {
                $("#btnSave").prop("disabled", true);
            }
            return retval;
        }

        self.availableReferenceSet = ko.observableArray();
        self.hierarchyId = globalVariableForHierarchyAssignment.HierarchyId;
        self.IsMultiEdit = ko.observable(globalVariableForHierarchyAssignment.IsMultiEdit)();
        self.selectedCount = ko.observable(globalVariableForHierarchyAssignment.selectedCount)();
        self.unselectedCount = ko.observable(globalVariableForHierarchyAssignment.unselectedCount)();
        self.checkAll = ko.observable(globalVariableForHierarchyAssignment.checkAll)();

        fetchGetAssignedReferencesets(self.hierarchyId, self.availableReferenceSet)

        self.handleCloseEvent = function (unloadTempPopup) {
            unloadTempPopup('unloadTemplate', 'modelHierarchyAssignmentID');
            $("#jqxgridHierarchyAssignment").jqxGrid('updatebounddata');
        }

        self.closeConfirmation = function () {
            $("#unAssignConfirmationPopup").modal('hide');
        }

        self.clearfilter = function (gridId) {
            clearUiGridFilter(gridId);
        }
        self.exportToXls = function (gridId) {
            var dataInfo = $("#" + gridId).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#" + gridId).jqxGrid('exportdata', 'csv', 'Assigned ReferenceSets');
                openAlertpopup(1, 'export_Information');
            }
        }

        function fetchGetAssignedReferencesets(hierarchyId, assignedReferenceSets) {
            var getAssignedReferencesetForHierarchiesReq = new Object();
            var Selector = new Object();
            var isAllItemSelected = false;

            var selectedItems = getSelectedUniqueId('jqxgridHierarchyAssignment');
            var unselectedItems = getUnSelectedUniqueId('jqxgridHierarchyAssignment');

            if (self.checkAll == 1) {
                isAllItemSelected = true;
                Selector.SelectedItemIds = null;
                Selector.UnSelectedItemIds = unselectedItems.length > 0 ? unselectedItems : null;
            } else {
                Selector.SelectedItemIds = selectedItems;
                Selector.UnSelectedItemIds = null;
            }

            getAssignedReferencesetForHierarchiesReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
            getAssignedReferencesetForHierarchiesReq.Selector = Selector;
            getAssignedReferencesetForHierarchiesReq.IsAllSelected = isAllItemSelected;

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.getAssignedReferencesetForHierarchiesResp) {
                            data.getAssignedReferencesetForHierarchiesResp = $.parseJSON(data.getAssignedReferencesetForHierarchiesResp);

                            if (data.getAssignedReferencesetForHierarchiesResp.ReferenceSets) {
                                assignedReferenceSets(data.getAssignedReferencesetForHierarchiesResp.ReferenceSets);
                            } else {
                                assignedReferenceSets([]);
                            }

                            assignedReferenceSetsGrid(assignedReferenceSets(), 'jqxgridUnassignReferenceSet');
                        }
                    } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                        $("#loadingDiv").hide();
                        Token_Expired();
                    }
                }
                if (error) {
                    $("#loadingDiv").hide();
                }
            }

            var method = 'GetAssignedReferencesetForHierarchies';
            var params = '{"token":"' + TOKEN() + '","getAssignedReferencesetForHierarchiesReq":' + JSON.stringify(getAssignedReferencesetForHierarchiesReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        function assignedReferenceSetsGrid(assignedReferenceSets, gID) {

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
                localdata: assignedReferenceSets,
                datafields: [
                    { name: 'ReferenceSetId', map: 'ReferenceSetId' },
                    { name: 'Name', map: 'Name', type: 'string' },
                    { name: 'SupportedPackages', map: 'SupportedPackages', type: 'string' },
                    { name: 'Status', map: 'Status', type: 'string' },
                    { name: 'isSelected', type: 'number' }
                ],

            };
            var dataAdapter = new $.jqx.dataAdapter(source);

            var buildFilterPanel = function (filterPanel, datafield) {
                wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
            }

            var buildFilterPanelMultiChoice = function (filterPanel, datafield, checkArr) {
                multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gID, checkArr, true);
            }

            var rendered = function (element) {
                enableUiGridFunctions(gID, 'ReferenceSetId', element, gridStorage, true);
                return true;
            }

            var statusCellRenderer = function (row, column, value, defaultHtml) {
                var rowData = $("#" + gID).jqxGrid('getrowdata', row);
                var text = "Status: ";
                if (value == "Active") {
                    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
                }
                if (value == "Inactive") {
                    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg inactive_Orange"></div></a>' + value + '</span></div>';
                }
                return defaultHtml;
            }

            $("#" + gID).jqxGrid(
            {
                width: "100%",
                height: "450px",
                source: dataAdapter,
                pagesize: assignedReferenceSets.length,
                sortable: true,
                filterable: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                altrows: true,
                autoshowcolumnsmenubutton: false,
                showsortmenuitems: false,
                editable: true,
                rowsheight: 32,
                enabletooltips: true,
                columnsResize: true,
                columns: [
                            {
                                text: null, menu: false, sortable: false, exportable: false, filterable: false, columntype: 'checkbox', enabletooltips: false,
                                datafield: 'isSelected', width: 40,
                                renderer: function () {
                                    return '<div style="margin-left:10px"><div style="margin-top: 5px"></div></div>';
                                },
                                rendered: rendered,
                            },
                            {
                                text: i18n.t('rs_refrence_set', { lng: lang }), datafield: 'Name', width: 140, minwidth: 140, editable: false,
                                filtertype: "custom",
                                createfilterpanel: function (datafield, filterPanel) {
                                    buildFilterPanel(filterPanel, datafield);
                                }
                            },
                            {
                                text: i18n.t('rs_packages', { lng: lang }), datafield: 'SupportedPackages', width: 140, minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
                            },
                            {
                                text: i18n.t('rs_statsus', { lng: lang }), datafield: 'Status', width: 'auto', resizable: false, minwidth: 80, editable: false, cellsrenderer: statusCellRenderer,
                                filtertype: "custom",
                                createfilterpanel: function (datafield, filterPanel) {
                                    var checkArr = getMultiCoiceFilterArr('ReferenceSet Status');
                                    buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
                                }
                            },
                ]
            }).on({
                filter: function (e) {
                    gridSeletedRowData = [];
                }
            });

            $("#" + gID).on('cellbeginedit', function (event) {
                var args = event.args;
                var datainfo = $("#" + gID).jqxGrid('getdatainformation');
                if (args.value) {
                    assignedReferenceSets = assignedReferenceSets - 1;
                } else {
                    $("#" + gID).jqxGrid('setcellvalue', args.rowindex, 'isSelected', 1);
                    assignedReferenceSets = assignedReferenceSets + 1;
                }
            });

            getUiGridBiginEdit(gID, 'ReferenceSetId', gridStorage);
            callUiGridFilter(gID, gridStorage);
        }

        self.unAssignReferenceSetsConfirmation = function (gridId, observableModelPopup, isContinue) {
            var selectedIds = getSelectedUniqueId(gridId);
            if ((selectedIds == null) || (selectedIds == "")) {
                openAlertpopup(1, 'please_select_a_reference_set');
            } else {
                $('#unAssignConfirmationPopup').modal('show');
                var hierarchycount = 1;
                if (self.IsMultiEdit) {
                    if (self.checkAll == 1 && self.unselectedCount.length == 0) {
                        hierarchycount = 'all the';
                    } else {
                        hierarchycount = self.selectedCount;
                    }
                }
                
                if (hierarchycount == 1) {
                    $("#hierarchy").text(i18n.t('unassign_reference_sets_from_single_hierarchy', { lng: lang }));
                } else {
                    $("#hierarchy").text(i18n.t('unassign_reference_sets_from', { hierarchynodes: hierarchycount }, { lng: lang }));
                }
            }
        }

        self.unAssignReferenceSets = function (gridId, observableModelPopup, isContinue) {
            $("#unAssignConfirmationPopup").modal('hide');
            var selectedIds = getSelectedUniqueId(gridId);
            if (selectedIds.length >= 1 || checkAllSelected(gridId) == 1) {
                var unAssignReferenceSetsFromHierarchyReq = new Object();
                var Selector = new Object();

                var selectedItems = getSelectedUniqueId('jqxgridHierarchyAssignment');
                var unselectedItems = getUnSelectedUniqueId('jqxgridHierarchyAssignment');
                var isAllSelected = false;

                if (self.checkAll == 1) {
                    Selector.SelectedItemIds = null;
                    Selector.UnSelectedItemIds = unselectedItems.length > 0 ? unselectedItems : null;
                    if (unselectedItems.length > 0) {
                        isAllSelected = false;
                    } else {
                        isAllSelected = true;
                    }
                } else {
                    Selector.SelectedItemIds = selectedItems;
                    Selector.UnSelectedItemIds = null;
                    isAllSelected = false;
                }

                var selectedReferenceSetIds = getSelectedUniqueId(gridId);
                var unSelectedReferenceSetIds = getUnSelectedUniqueId(gridId);
                var checkAllRFS = checkAllSelected(gridId);
                var isAllRFSSelected = false;

                if (checkAllRFS == 1) {
                    if (unSelectedReferenceSetIds.length > 0) {
                        isAllRFSSelected = false;
                    } else {
                        isAllRFSSelected = true;
                    }
                } else {
                    isAllRFSSelected = false;
                }
                                
                unAssignReferenceSetsFromHierarchyReq.Selector = Selector;
                unAssignReferenceSetsFromHierarchyReq.IsAllSelected = isAllSelected;
                unAssignReferenceSetsFromHierarchyReq.IsAllReferencesetSelected = isAllRFSSelected;
                unAssignReferenceSetsFromHierarchyReq.UnAssignedReferenceSetIds = selectedReferenceSetIds;
                unAssignReferenceSetsFromHierarchyReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

                var callBackfunction = function (data, error) {
                    if (data) {
                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                            openAlertpopup(0, 'hierarchy_reference_set_changes_saved_successfully');
                            gridFilterClear('jqxgridHierarchyAssignment');
                            observableModelPopup('unloadTemplate');
                            $("#modelHierarchyAssignmentID").modal('hide');
                        }
                    }
                }

                var method = 'UnAssignReferenceSetsFromHierarchy';
                var params = '{"token":"' + TOKEN() + '","unAssignReferenceSetsFromHierarchyReq":' + JSON.stringify(unAssignReferenceSetsFromHierarchyReq) + ' }';
                ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
            } else {
                openAlertpopup(1, 'please_select_a_reference_set');
            }
        }
        seti18nResourceData(document, resourceStorage);
    }
});