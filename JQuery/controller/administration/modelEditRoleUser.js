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
      
        //Popup open
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

        //export user 
        self.exportToXls = function (gridId) {
            var dataInfo = $("#" + gridId).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                $("#" + gridId).jqxGrid('exportdata', 'csv', 'Add_User_To_Role');
                openAlertpopup(1, 'export_Information');
                $("#loadingDiv").hide();
            }
        }

        //clear filter of users
        self.clearfilter = function (gridId) {
            clearUiGridFilter(gridId);
        }

        $('#modelEditUsersHeader').mouseup(function () {
            $("#modelEditUsers").draggable({ disabled: true });
        });

        $('#modelEditUsersHeader').mousedown(function () {
            $("#modelEditUsers").draggable({ disabled: false });
        });

        //adding user to role
        self.addUsersToRole = function (observableModelPopup, gId, getDetailsForUser) {
            var selectedrowids = getSelectedUniqueId(gId);
            if (selectedrowids.length == 0) {
                openAlertpopup(1, 'please_select_one_user_to_add');
            } else if (selectedrowids.length>=1) {
                var source = _.where(globalVariableForEditRole, { "selectedRoleId": selectedId[0] });
                var rolesObj = new Object();
                var roles = new Array();

                rolesObj.CreatedByUserId = source[0].selectedCreatedById;
                rolesObj.CreatedByUserName = source[0].selectedCreatedByUserName;

                var createdOn = null;

                if (source[0].selectedCreatedOn != null) {
                    createdOn = createJSONTimeStamp(source[0].selectedCreatedOn);
                } else {
                    createdOn = null;
                }

                rolesObj.CreatedOn = createdOn;
                rolesObj.Description = source[0].selectedDescription;
                rolesObj.ModifiedByUserId = source[0].selectedModifiedByUserId;
                rolesObj.ModifiedByUserName = source[0].selectedModifiedByUserName;


                var modeifiedOn = null;
                if (source[0].selectedModifiedOn != null) {
                    modeifiedOn = createJSONTimeStamp(source[0].selectedModifiedOn);
                } else {
                    modeifiedOn = null;
                }
                rolesObj.ModifiedOn = modeifiedOn;
                rolesObj.RoleId = source[0].selectedRoleId;
                rolesObj.RoleName = source[0].selectedRoleName;
                rolesObj.TotalRows = source[0].selectedTotalRows;
                rolesObj.UserInfo = null;
                roles.push(rolesObj);

                var users = new Object()
                var getMulSelectedData = getMultiSelectedData(gId);
                var arrAssignedUsers = new Array();
                for (var i = 0; i < getMulSelectedData.length; i++) {
                    var user = new Object();
                    user.UserGuid = getMulSelectedData[i].UserGuid;
                    user.LoginName = getMulSelectedData[i].LoginName;
                    user.FirstName = getMulSelectedData[i].FirstName;
                    user.LastName = getMulSelectedData[i].LastName;
                    arrAssignedUsers.push(user);
                }
                $("#loadingDiv").show();
                function callbackFunction(data, error) {
                    if (data) {
                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                            clearUiGridFilter('jqxgridForUserDetails');
                            getDetailsForUser();
                            observableModelPopup('unloadTemplate');
                            $('#downloadModel').modal('hide');
                            openAlertpopup(0, 'user_successfully_modified');
                        } 
                        $("#loadingDiv").hide();
                    }
                    if (error) {
                        retval = "";
                        $("#loadingDiv").hide();
                    }
                }

                var method = 'AddUsersToRole';
                var params = '{"token":"' + TOKEN() + '","roles":' + JSON.stringify(roles) + ',"users":' + JSON.stringify(arrAssignedUsers) + ', "isFromRoles":true}';
                ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
            }
        }
       
        //Grid for fetching users
        jqxgridForUser(addUsersGlobal, 'jqxgridForUnAssignedUsersForRole');

        seti18nResourceData(document, resourceStorage);
        
    };

    //User grid
    function jqxgridForUser(addUsersGlobal, gID) {

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
            localdata: addUsersGlobal,
            datafields: [
                { name: 'UserGuid', map: 'UserGuid' },
                { name: 'LoginName', map: 'LoginName', type: 'String' },
                { name: 'FirstName', map: 'FirstName', type: 'String' },
                { name: 'LastName', map: 'LastName', type: 'String' },
                { name: 'isSelected', type: 'number' }
            ],

        };
        var dataAdapter = new $.jqx.dataAdapter(source);
        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID);
        }
        var rendered = function (element) {

            enableUiGridFunctions(gID, 'UserGuid', element, gridStorage, true);

            return true;
        }
        // create jqxgrid.
        $("#" + gID).jqxGrid(
        {
            width: "100%",
            source: dataAdapter,
            sortable: true,
            filterable: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            pagesize: addUsersGlobal.length,
            altrows: true,
            autoshowcolumnsmenubutton: false,
            rowsheight: 32,
            showsortmenuitems: false,
            enabletooltips: true,
            editable: true,
            columnsResize: true,
            ready: function () {
                clearUiGridFilter(gID);
            },
            columns: [
                    {
                        text: '', menu: false, exportable: false, sortable: false, editable: true, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                            return '<div style="margin-left:10px;"><div style="margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                { text: '', datafield: 'UserGuid', hidden: true, width: 'auto' },
                {

                    text: i18n.t('login_name_datagrid', { lng: lang }), datafield: 'LoginName', editable: false,  minwidth: 100,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    },
                },

              {
                  text: i18n.t('first_name', { lng: lang }), datafield: 'FirstName', editable: false,  minwidth: 100,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },

              {
                  text: i18n.t('last_name', { lng: lang }), datafield: 'LastName', editable: false,  resizable: false, minwidth: 100,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },
            ]
        });

        getUiGridBiginEdit(gID, 'UserGuid', gridStorage);
        callUiGridFilter(gID, gridStorage);
    }
});

