define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko) {
    var lang = getSysLang();
    uploadedfiledata = new Array();
    currentAddedUserGuid = "";
    currentTemporaryPassword = "";
    emailValue = "";

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function AddpackageViewModel() {

    
        var self = this;
       
        //Popu open
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        var selectedId = getSelectedUniqueId('jqxgridRoles');

        function loadelement(elementname, controllerId) {

            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
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

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
        }

        //export rights
        self.exportToXls = function (gridId) {     
            var dataInfo = $("#" + gridId).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#" + gridId).jqxGrid('exportdata', 'csv', 'Rights');
                openAlertpopup(1, 'export_Information');
            }
        }


        $('#modelEditRightHeader').mouseup(function () {
            $("#modelEditRight").draggable({ disabled: true });
        });

        $('#modelEditRightHeader').mousedown(function () {
            $("#modelEditRight").draggable({ disabled: false });
        });



        //editing role rights
        self.editRightsToRole = function (observableModelPopup, gId, getDetails) {
            var isCheckFlag = false;
            var rightsArray = new Array();
            var rows = $("#" + gId).jqxGrid('getrows');
            for (i = 0; i < rows.length; i++) {
                    var rightsObj = new Object();
                    rightsObj.RightId = rows[i].RightId;
                    rightsObj.IsDeleteAllowed = rows[i].IsDeleteAllowed;
                    rightsObj.IsModifyAllowed = rows[i].IsModifyAllowed;
                    rightsObj.IsViewAllowed = rows[i].IsViewAllowed;
                    rightsArray.push(rightsObj);
            }

            for (i = 0; i < rows.length; i++) {
                if (rows[i].IsViewAllowed == true) {
                    isCheckFlag = true;
                }
            }

            if (isCheckFlag == false) {
                openAlertpopup(1, 'select_one_alertforeditrole');
            } else {
                setRightToRole(rightsArray, observableModelPopup, gId, getDetails);
            }
            
        }

        function setRightToRole(rightsArray, observableModelPopup, gId, getDetails) {
            $("#loadingDiv").show();
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        clearUiGridFilter('jqxgridForUnAssignedRightsForRoleEdit');
                        function getDetailsCallback() {
                            clearUiGridFilter('jqxgridForUserDetails');
                        }
                        observableModelPopup('unloadTemplate');
                        $('#downloadModel').modal('hide');
                        getDetails(getDetailsCallback);
                        openAlertpopup(0, 'update_rights');
                    }
                    $("#loadingDiv").hide();
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'SetRightsToRole';
            var params = '{"token":"' + TOKEN() + '","roleId":"' + roleId + '","roleRights":' + JSON.stringify(rightsArray) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }


        self.modifyChecked = function (gId) {
            gId = 'jqxgridForUnAssignedRightsForRoleEdit'
            var rows = $('#jqxgridForUnAssignedRightsForRoleEdit').jqxGrid('getrows');

            for (i = 0; i < rows.length ; i++) {
                if ($("#modifyCheckBox").is(':checked')) {
                    //alert('click')
                    var Flage = $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('getcellvalue', i, 'defaultModifyFlage');
                    if (Flage) {
                        $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('setcellvalue', i, 'IsModifyAllowed', true);
                        var Flage = $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('getcellvalue', i, 'defaultViewFlage');
                        if (Flage) {
                            $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('setcellvalue', i, 'IsViewAllowed', true);
                        }
                    }
                   
                }
                else {
                    //alert('unclick');
                    $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('setcellvalue', i, 'IsModifyAllowed', false);

                }
            }
            $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('refresh');

        }

        self.deleteChecked = function (gId) {
            gId = 'jqxgridForUnAssignedRightsForRoleEdit'
            var rows = $('#jqxgridForUnAssignedRightsForRoleEdit').jqxGrid('getrows');

            for (i = 0; i < rows.length ; i++) {
                if ($("#deleteCheckbox").is(':checked')) {
                    var Flage = $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('getcellvalue', i, 'defaultDeleteFlage');
                    if (Flage) {
                        $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('setcellvalue', i, 'IsDeleteAllowed', true);
                    }
                    var Flage = $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('getcellvalue', i, 'defaultDeleteFlage');
                    if (Flage) {
                        $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('setcellvalue', i, 'IsViewAllowed', true);
                    }
                }
                else {
                    $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('setcellvalue', i, 'IsDeleteAllowed', false);
                }
            }
            $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('refresh');
        }

        self.viewChecked = function (gId) {
            gId = 'jqxgridForUnAssignedRightsForRoleEdit'
            var rows = $('#jqxgridForUnAssignedRightsForRoleEdit').jqxGrid('getrows');

            for (i = 0; i < rows.length ; i++) {
                if ($("#viewCheckbox").is(':checked')) {
                    var Flage = $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('getcellvalue', i, 'defaultViewFlage');
                    if (Flage) {
                        $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('setcellvalue', i, 'IsViewAllowed', true);
                        $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('refresh');
                    }
                    
                }
                else {
                    $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('setcellvalue', i, 'IsViewAllowed', false);
                    $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('setcellvalue', i, 'IsModifyAllowed', false);
                    $("#modifyCheckBox").prop('checked', false);
                    $("#jqxgridForUnAssignedRightsForRoleEdit").jqxGrid('refresh');
                }
                
            }

            //var rows = $('#jqxgridForUnAssignedRightsForRoleEdit').jqxGrid('getrows');
            //gId = 'jqxgridForUnAssignedRightsForRoleEdit'
            //for (i = 0; i < rows.length ; i++) {
            //    $("#" + gId).jqxGrid('setcellvalue', args.rowindex, 'IsViewAllowed', true);
            //}
           
        }

        //Fetching edit rights
        self.isViewChecked = ko.observable(false);
        self.isModifyChecked = ko.observable(false);
        self.isDeleteChecked = ko.observable(false);
        jqxgridForEditRights('jqxgridForUnAssignedRightsForRoleEdit', self.isViewChecked, self.isModifyChecked, self.isDeleteChecked);

        seti18nResourceData(document, resourceStorage);
    };

    //Rights Edit grid
    function checkRight(id, field) {       
        var source = _.where(userRightData, { RightId: id })
        if (!_.isEmpty(source) && source.length > 0) {
            if (source[0][field]) {
                return true;
            } else {
                return false;
            }
        }
    }

    function jqxgridForEditRights(gID, isViewChecked, isModifyChecked, isDeleteChecked) {
        var modifyCount = 0;
        var deleteCount = 0;
        var viewCount = 0;
        for (var j = 0; j < globalVariableForAssignedRights.length; j++) {
            if (globalVariableForAssignedRights[j].IsModifyAllowed) {
                modifyCount = modifyCount + 1;
                globalVariableForAssignedRights[j].defaultModifyFlage = true;
            } else {
                var checkval = checkRight(globalVariableForAssignedRights[j].RightId, 'IsModifyAllowed')
                if (checkval) {
                    globalVariableForAssignedRights[j].defaultModifyFlage = true;
                } else {
                    globalVariableForAssignedRights[j].defaultModifyFlage = false;
                }
            }
            if (globalVariableForAssignedRights[j].IsDeleteAllowed) {
                deleteCount = deleteCount + 1;
                globalVariableForAssignedRights[j].defaultDeleteFlage = true;
            } else {
                var checkval = checkRight(globalVariableForAssignedRights[j].RightId, 'IsDeleteAllowed')
                if (checkval) {
                    globalVariableForAssignedRights[j].defaultDeleteFlage = true;
                } else {
                    globalVariableForAssignedRights[j].defaultDeleteFlage = false;
                }
                
            }
            if (globalVariableForAssignedRights[j].IsViewAllowed) {
                viewCount = viewCount + 1;
                globalVariableForAssignedRights[j].defaultViewFlage = true;
            } else {
                var checkval = checkRight(globalVariableForAssignedRights[j].RightId, 'IsViewAllowed')
                if (checkval) {

                    globalVariableForAssignedRights[j].defaultViewFlage = true;
                    
                } else {
                    globalVariableForAssignedRights[j].defaultViewFlage = false;
                   
                }
                
            }
            
            
        }
        

        if (modifyCount == globalVariableForAssignedRights.length) {
            isModifyChecked(true);
            $("#modifyCheckBox").prop('checked', 'checked');
        }
        if (deleteCount == globalVariableForAssignedRights.length) {
            isDeleteChecked(true);
           // $("#deleteCheckbox").prop('checked', 'checked');
        }
        if (viewCount == globalVariableForAssignedRights.length) {
            isViewChecked(true);
           // $("#viewCheckbox").prop('checked', 'checked');
        }
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

        // prepare the data
        var source =
        {
            datatype: "json",
            localdata: globalVariableForAssignedRights,
            datafields: [
                { name: 'RightName', map: 'RightName', type: 'String' },
                { name: 'RightId', map: 'RightId' },
                { name: 'IsModifyAllowed', map: 'IsModifyAllowed' },
                { name: 'IsDeleteAllowed', map: 'IsDeleteAllowed' },
                { name: 'IsViewAllowed', map: 'IsViewAllowed' },
                { name: 'defaultModifyFlage', map: 'defaultModifyFlage' },
                { name: 'defaultDeleteFlage', map: 'defaultDeleteFlage' },
                { name: 'defaultViewFlage', map: 'defaultViewFlage' },
                { name: 'isSelected', type: 'number' }
            ],

        };
        var dataAdapter = new $.jqx.dataAdapter(source);
        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID);
        }
        var rendered = function (element) {

            enableUiGridFunctions(gID, 'RightId', element, gridStorage, true);

            return true;
        }

        var cellbeginedit = function (row, datafield, columntype, value) {

            if (datafield == 'IsModifyAllowed') {
                var check = $("#" + gID).jqxGrid('getcellvalue', row, 'defaultModifyFlage');
                if (check == true) {
                    return true;
                } else {
                    return false;
                }
            }

            if (datafield == 'IsDeleteAllowed') {
                var check = $("#" + gID).jqxGrid('getcellvalue', row, 'defaultDeleteFlage');
                if (check == true) {
                    return true;
                } else {
                    return false;
                }
            }

            if (datafield == 'IsViewAllowed') {
                var check = $("#" + gID).jqxGrid('getcellvalue', row, 'defaultViewFlage');
                if (check == true) {
                    return true;
                } else {
                    return false;
                }
            }
        }

        var cellclassModifyAllowed = function (row, columnfield, value) {
            var check = $("#" + gID).jqxGrid('getcellvalue', row, 'defaultModifyFlage');
            if (check == true || check == 'Deleted') {
                return '';
            } else {

                return 'disabled';
            }
          
        }

        var cellclassDeleteAllowed = function (row, columnfield, value) {
            var check = $("#" + gID).jqxGrid('getcellvalue', row, 'defaultDeleteFlage');
            if (check == true || check == 'Deleted') {
                return '';
            } else {

                return 'disabled';
            }
           

        }

        var cellclassViewAllowed = function (row, columnfield, value) {
            var check = $("#" + gID).jqxGrid('getcellvalue', row, 'defaultViewFlage');
            if (check == true || check == 'Deleted') {
                return '';
            } else {

                return 'disabled';
            }
        }

        // create jqxgrid.
        $("#" + gID).jqxGrid(
        {
            width: "100%",
            source: dataAdapter,
            filterable: false,
            sortable: false,
            ready: function () {

            },
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            rowsheight: 32,
            pagesize: globalVariableForAssignedRights.length,
            enabletooltips: true,
            altrows: true,
            editable: true,
            columnsResize: true,
            columns: [
                    {
                        text: '', menu: false, sortable: false, filterable: false, hidden: true, columnsResize: false, columntype: 'checkbox', enabletooltips: false, exportable: false,
                        datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                { text: '', datafield: 'RightId', exportable: false, hidden: true, width: 'auto' },
                {

                    text: i18n.t('right_name', { lng: lang }), datafield: 'RightName', editable: false,  minwidth: 100, menu: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    },
                },

              {
                  text: i18n.t('modify', { lng: lang }), datafield: 'IsModifyAllowed', columntype: 'checkbox',  minwidth: 80, menu: false, cellbeginedit: cellbeginedit, enabletooltips: false, 
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },

              {
                  text: i18n.t('delete', { lng: lang }), datafield: 'IsDeleteAllowed', columntype: 'checkbox', resizable: false, minwidth: 80, menu: false, cellbeginedit: cellbeginedit, enabletooltips: false, 
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },
              {
                  text: i18n.t('view', { lng: lang }), datafield: 'IsViewAllowed', columntype: 'checkbox',  resizable: false, minwidth: 80, menu: false, cellbeginedit: cellbeginedit, enabletooltips: false, 
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },
            ]
        });

       
        $("#" + gID).on('cellbeginedit', function (event) {
            var args = event.args;
            var datainfo = $("#" + gID).jqxGrid('getdatainformation');
            if (args.datafield == 'IsModifyAllowed') {
                if (args.value) {
                   // $("#" + gID).jqxGrid('setcellvalue', args.rowindex, 'IsViewAllowed', false);
                    modifyCount = modifyCount - 1;
                } else {
                    $("#" + gID).jqxGrid('setcellvalue', args.rowindex, 'IsViewAllowed', true);
                    modifyCount = modifyCount + 1;
                }
                if (datainfo.rowscount == modifyCount) {
                    isModifyChecked(true);
                    isViewChecked(true);
                } else {
                    isModifyChecked(false);
                }
            }

            if (args.datafield == 'IsDeleteAllowed') {
                if (args.value) {
                  //  $("#" + gID).jqxGrid('setcellvalue', args.rowindex, 'IsViewAllowed', false);
                    deleteCount = deleteCount - 1;
                } else {
                    $("#" + gID).jqxGrid('setcellvalue', args.rowindex, 'IsViewAllowed', true);
                    deleteCount = deleteCount + 1;
                }
                if (datainfo.rowscount == deleteCount) {
                    isDeleteChecked(true);
                } else {
                    isDeleteChecked(false);
                }
            }

            if (args.datafield == 'IsViewAllowed') {
                if (args.value) {
                    $("#" + gID).jqxGrid('setcellvalue', args.rowindex, 'IsModifyAllowed', false);
                    viewCount = viewCount - 1;
                } else {
                    viewCount = viewCount + 1;
                }
                if (datainfo.rowscount == viewCount) {
                    isViewChecked(true);
                } else {
                    isViewChecked(false);
                }
            }
          
            $("#" + gID).jqxGrid('refresh');
        });
        getUiGridBiginEdit(gID, 'RightId', gridStorage);
        callUiGridFilter(gID, gridStorage);

    }

});

