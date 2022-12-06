define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko) {
    var lang = getSysLang();
    uploadedfiledata = new Array();
    currentAddedUserGuid = "";
    currentTemporaryPassword = "";
    emailValue = "";
    seletctedRowArray = new Array();

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
            $("#" + gridId).jqxGrid('exportdata', 'csv', 'Rights');
            openAlertpopup(1, 'export_Information');
        }


        $('#modelAddRightsIdHeader').mouseup(function () {
            $("#modelAddRightsId").draggable({ disabled: true });
        });

        $('#modelAddRightsIdHeader').mousedown(function () {
            $("#modelAddRightsId").draggable({ disabled: false });
        });


        //Adding rights to roles
        self.addRightsToRole = function (observableModelPopup, gId, getDetails) {

            //Show message
            var isCheckFlag = false;
            var rows = $("#" + gId).jqxGrid('getrows');
            for (i = 0; i < rows.length; i++) {
                if (rows[i].IsViewAllowed == true) {
                    isCheckFlag = true;
                }
            }

            if (isCheckFlag == false) {
                openAlertpopup(1, 'select_one_alertforeditrole');
            } else {
            $("#loadingDiv").show();
            var rightsArray = new Array();
            var rows = $("#" + gId).jqxGrid('getrows');
            for (i = 0; i < rows.length; i++) {
                if (rows[i].IsModifyAllowed == true || rows[i].IsDeleteAllowed == true || rows[i].IsViewAllowed == true) {
                    var rightsObj = new Object();
                    rightsObj.RightId = rows[i].RightId;
                    rightsObj.RightName = rows[i].RightName
                    rightsObj.IsDeleteAllowed = rows[i].IsDeleteAllowed
                    rightsObj.IsModifyAllowed = rows[i].IsModifyAllowed
                    rightsObj.IsViewAllowed = rows[i].IsViewAllowed;
                    rightsArray.push(rightsObj)
                }
            }
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        clearUiGridFilter('jqxgridForRightsDetails');
                        function getDetailsCallback() {
                            clearUiGridFilter('jqxgridForUserDetails');
                        }
                        observableModelPopup('unloadTemplate');
                        $('#downloadModel').modal('hide');
                        $("gridAreaForRightsDetails").empty();
                        $("gridAreaForRightsDetails").append('<div id="jqxgridForRightsDetails"></div>');
                        getDetails(getDetailsCallback);
                        openAlertpopup(0, 'rights_modified');
                    }
                    $("#loadingDiv").hide();
                }
                if (error) {
                    retval = "";                    
                }
            }

            var method = 'AddRightsToRole';
            var params = '{"token":"' + TOKEN() + '","roleId":"' + roleId + '","roleRights":' + JSON.stringify(rightsArray) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }
        }

        self.modifyChecked = function (gId) {
            gId = 'jqxgridForUnAssignedRightsForRole'
            var rows = $('#jqxgridForUnAssignedRightsForRole').jqxGrid('getrows');
                
               for (i = 0; i < rows.length ; i++) {
                   if ($("#modifyCheckBox").is(':checked')) {
                       var Flage = $("#jqxgridForUnAssignedRightsForRole").jqxGrid('getcellvalue', i, 'defaultModifyFlage');
                       if (Flage) {
                           $("#jqxgridForUnAssignedRightsForRole").jqxGrid('setcellvalue', i, 'IsModifyAllowed', true);
                           var Flage = $("#jqxgridForUnAssignedRightsForRole").jqxGrid('getcellvalue', i, 'defaultViewFlage');
                           if (Flage) {
                               $("#jqxgridForUnAssignedRightsForRole").jqxGrid('setcellvalue', i, 'IsViewAllowed', true);
                           }
                       }
                       //var Flage = $("#jqxgridForUnAssignedRightsForRole").jqxGrid('getcellvalue', i, 'defaultViewFlage');
                       //if (Flage) {
                           
                       //}
                   }
                   else {
                       $("#jqxgridForUnAssignedRightsForRole").jqxGrid('setcellvalue', i, 'IsModifyAllowed', false);
                   }
                }
            
        }

        self.deleteChecked = function (gId) {
            gId = 'jqxgridForUnAssignedRightsForRole'
            var rows = $('#jqxgridForUnAssignedRightsForRole').jqxGrid('getrows');

            for (i = 0; i < rows.length ; i++) {
                if ($("#deleteCheckbox").is(':checked')) {
                    var Flage = $("#jqxgridForUnAssignedRightsForRole").jqxGrid('getcellvalue', i, 'defaultDeleteFlage');
                    if (Flage) {
                        $("#jqxgridForUnAssignedRightsForRole").jqxGrid('setcellvalue', i, 'IsDeleteAllowed', true);
                    }
                    var Flage = $("#jqxgridForUnAssignedRightsForRole").jqxGrid('getcellvalue', i, 'defaultDeleteFlage');
                    if (Flage) {
                        $("#jqxgridForUnAssignedRightsForRole").jqxGrid('setcellvalue', i, 'IsViewAllowed', true);
                    }
                }
                else {
                    $("#jqxgridForUnAssignedRightsForRole").jqxGrid('setcellvalue', i, 'IsDeleteAllowed', false);
                }
            }
        }

        self.viewChecked = function (gId) {
            gId = 'jqxgridForUnAssignedRightsForRole'
            var rows = $('#jqxgridForUnAssignedRightsForRole').jqxGrid('getrows');

            for (var i = 0; i < rows.length ; i++) {
                if ($("#viewCheckbox").is(':checked')) {
                    var Flage = $("#jqxgridForUnAssignedRightsForRole").jqxGrid('getcellvalue', i, 'defaultViewFlage');
                    if (Flage) {
                        $("#jqxgridForUnAssignedRightsForRole").jqxGrid('setcellvalue', i, 'IsViewAllowed', true);
                    } else {
                        $("#jqxgridForUnAssignedRightsForRole").jqxGrid('setcellvalue', i, 'IsViewAllowed', false);
                    }
                }
                else {
                    
                    $("#jqxgridForUnAssignedRightsForRole").jqxGrid('setcellvalue', i, 'IsViewAllowed', false);
                    $("#jqxgridForUnAssignedRightsForRole").jqxGrid('setcellvalue', i, 'IsModifyAllowed', false);
                    $("#modifyCheckBox").prop('checked',false);
                }
            }

            //var rows = $('#jqxgridForUnAssignedRightsForRole').jqxGrid('getrows');
            //gId = 'jqxgridForUnAssignedRightsForRole'
            //for (var j = 0; j < rows.length ; j++) {
            //    $("#" + gId).jqxGrid('setcellvalue', args.rowindex, 'IsViewAllowed', true);
            //}
        }
        
        //Grid for fetching rights
        self.isViewChecked = ko.observable(false);
        self.isModifyChecked = ko.observable(false);
        self.isDeleteChecked = ko.observable(false);
        jqxgridForAddRights(addRightsGlobal, 'jqxgridForUnAssignedRightsForRole', self.isViewChecked, self.isModifyChecked, self.isDeleteChecked);

        seti18nResourceData(document, resourceStorage);
    };

    //Rights add grid
    function jqxgridForAddRights(addRightsGlobal, gID, isViewChecked, isModifyChecked, isDeleteChecked) {
        var modifyCount = 0;
        var deleteCount = 0;
        var viewCount = 0;
        for (var j = 0; j < addRightsGlobal.length; j++) {
            if (addRightsGlobal[j].IsModifyAllowed) {
              //  modifyCount = modifyCount + 1;
                addRightsGlobal[j].defaultModifyFlage = true;
                addRightsGlobal[j].IsModifyAllowed = false

            } else {
                addRightsGlobal[j].defaultModifyFlage = false;
            }
            if (addRightsGlobal[j].IsDeleteAllowed) {
               // deleteCount = deleteCount + 1;
                addRightsGlobal[j].defaultDeleteFlage = true;
                addRightsGlobal[j].IsDeleteAllowed = false
            } else {
                addRightsGlobal[j].defaultDeleteFlage = false;
            }
            if (addRightsGlobal[j].IsViewAllowed) {
               // viewCount = viewCount + 1;
                addRightsGlobal[j].defaultViewFlage = true;
                addRightsGlobal[j].IsViewAllowed = false
            } else {
                addRightsGlobal[j].defaultViewFlage = false;
            }
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
            localdata: addRightsGlobal,
            datafields: [
                { name: 'RightName', map: 'RightName' ,type:'String' },
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

        var cellclassModifyAllowedAdd = function (row, columnfield, value) {
            var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'defaultModifyFlage');
            return classname;
        }

        var cellclassDeleteAllowedAdd = function (row, columnfield, value) {
            var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'defaultDeleteFlage');
            return classname;
        }

        var cellclassViewAllowedAdd = function (row, columnfield, value) {
            var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'defaultViewFlage');
            return classname;
        }
        
        var cellclassModifyAllowedAdd = function (row, columnfield, value) {
            var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'defaultModifyFlage');
            return classname;
        }

        var cellclassDeleteAllowedAdd = function (row, columnfield, value) {
            var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'defaultDeleteFlage');
            return classname;
        }

        var cellclassViewAllowedAdd = function (row, columnfield, value) {
            var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'defaultViewFlage');
            return classname;
        }
        

        // create jqxgrid.
        $("#" + gID).jqxGrid(
        {
            width: "100%",
            source: dataAdapter,
            sortable: false,
            filterable: false,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            pagesize: addRightsGlobal.length,
            altrows: true,
            autoshowcolumnsmenubutton: false,
            rowsheight: 32,
            showsortmenuitems: false,
            enabletooltips: true,
            editable: true,
            columnsResize: true,
            columns: [
                    {
                        text: '', menu: false, sortable: false, exportable: false, filterable: false, hidden: true, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                { text: '', datafield: 'RightId', hidden: true, minwidth: 0, },
                {

                    text: i18n.t('right_name', { lng: lang }), datafield: 'RightName', editable: false,  minwidth: 100, menu: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    },
                },

              {
                  text: i18n.t('modify', { lng: lang }), datafield: 'IsModifyAllowed', editable: true, columntype: 'checkbox', width: 'auto', minwidth: 80, menu: false, cellbeginedit: cellbeginedit, enabletooltips: false, cellclassname: cellclassModifyAllowedAdd,
                  filtertype: "custom", 
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },

              {
                  text: i18n.t('delete', { lng: lang }), datafield: 'IsDeleteAllowed', columntype: 'checkbox', width: 'auto', resizable: false, minwidth: 80, menu: false, cellbeginedit: cellbeginedit, enabletooltips: false, cellclassname: cellclassDeleteAllowedAdd,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },
              {
                  text: i18n.t('view', { lng: lang }), datafield: 'IsViewAllowed', columntype: 'checkbox', width: 'auto', resizable: false, minwidth: 80, menu: false, cellbeginedit: cellbeginedit, enabletooltips: false, cellclassname: cellclassViewAllowedAdd,
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
                    modifyCount = modifyCount - 1;
                } else {
                    $("#" + gID).jqxGrid('setcellvalue', args.rowindex, 'IsViewAllowed', true);
                    modifyCount = modifyCount + 1;
                    viewCount = viewCount + 1;
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

