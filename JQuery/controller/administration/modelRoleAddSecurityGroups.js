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
        

        //$("#addSecurityGroup").text('Add_Security_Group_for', { roleNameGroups: roleNameGroups }, { lng: lang });
        $("#addSecurityGroupLabel").text(i18n.t('Add_Security_Group_for', { roleNameGroups: roleNameGroups }, { lng: lang }));
        //Popu open
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        var selectedId = getSelectedUniqueId('jqxgridRoles');


        //claer filter of SG
        self.clearfilter = function (gridId) {
            clearUiGridFilter(gridId);
        }

        //export user 
        self.exportToXls = function (gridId) {
            var dataInfo = $("#" + gridId).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            }else{
                $("#" + gridId).jqxGrid('exportdata', 'csv', 'SecurityGroupExcel');
                openAlertpopup(1, 'export_Information');
            }
        }


        $('#modelRoleAddSecGrpHeader').mouseup(function () {
            $("#modelRoleAddSecGrp").draggable({ disabled: true });
        });

        $('#modelRoleAddSecGrpHeader').mousedown(function () {
            $("#modelRoleAddSecGrp").draggable({ disabled: false });
        });


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

        //adding security group  to role
        self.addSecurityGroupsToRole = function (observableModelPopup, gId, getDetails) {
            var source = _.where(globalVariableForEditRole, { "selectedRoleId": selectedId[0] });
            var rolesObj = new Object();
            var roles = new Array();

            rolesObj.CreatedByUserId = source[0].selectedCreatedById;
            rolesObj.CreatedByUserName = source[0].selectedCreatedByUserName;
            rolesObj.CreatedOn = createJSONTimeStamp(source[0].selectedCreatedOn);
            rolesObj.Description = source[0].selectedDescription;
            rolesObj.ModifiedByUserId = source[0].selectedModifiedByUserId;
            rolesObj.ModifiedByUserName = source[0].selectedModifiedByUserName;
            rolesObj.RoleId = source[0].selectedRoleId;
            rolesObj.RoleName = source[0].selectedRoleName;
            rolesObj.TotalRows = source[0].selectedTotalRows;
            rolesObj.UserInfo = null;

            var users = new Object()
            var getMulSelectedData = getMultiSelectedData(gId);
            var arrAssignedSecurityGroups = new Array();
            for (var i = 0; i < getMulSelectedData.length; i++) {
                var securityGroups = new Object();
                securityGroups.SecurityGroupId = getMulSelectedData[i].SecurityGroupId;
                securityGroups.SecurityGroupName = getMulSelectedData[i].SecurityGroupName;
                arrAssignedSecurityGroups.push(securityGroups);
            }
            $("#loadingDiv").show();
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        clearUiGridFilter('jqxgridForUnAssignedSecurityGroupForRole');
                        getDetails();
                        observableModelPopup('unloadTempPopup');
                        $('#downloadModel').modal('hide');
                        openAlertpopup(0, 'Security_Group_assigned_to_add');
                    } 
                    $("#loadingDiv").hide();
                }
                if (error) {
                    retval = "";
                    $("#loadingDiv").hide();
                }
            }

            var method = 'AddSecurityGroupsToRole';
            var params = '{"token":"' + TOKEN() + '","role":' + JSON.stringify(rolesObj) + ',"securityGroups":' + JSON.stringify(arrAssignedSecurityGroups) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);

        }
       
       //Grid For fetching security groups
        jqxgridForSecurityGroups(securityGroupDataGlobal, 'jqxgridForUnAssignedSecurityGroupForRole');

        seti18nResourceData(document, resourceStorage);
    };

    //User grid
    function jqxgridForSecurityGroups(securityGroupDataGlobal, gID) {

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
            localdata: securityGroupDataGlobal,
            datafields: [
                { name: 'SecurityGroupName', map: 'SecurityGroupName' },
                { name: 'Description', map: 'Description' },
                { name: 'SecurityGroupId', map: 'SecurityGroupId' },
                { name: 'isSelected', type: 'number' }
            ],

        };
        var dataAdapter = new $.jqx.dataAdapter(source);
        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID);
        }
        var rendered = function (element) {

            enableUiGridFunctions(gID, 'SecurityGroupId', element, gridStorage, true);

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
            pagesize: securityGroupDataGlobal.length,
            altrows: true,
            autoshowcolumnsmenubutton: false,
            rowsheight: 32,
            showsortmenuitems: false,
            enabletooltips: true,
            editable: true,
            columnsResize: true,
            columns: [
                    {
                        text: '', menu: false, sortable: false, filterable: false, exportable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                            return '<div style="margin-left: 10px; margin-top: 5px;"><div></div></div>';
                        }, rendered: rendered
                    },
                { text: '', datafield: 'SecurityGroupId', hidden: true, minwidth: 0, },
                {

                    text: i18n.t('security_Group', { lng: lang }), datafield: 'SecurityGroupName', editable: false,  minwidth: 120,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    },
                },

              {
                  text: i18n.t('description', { lng: lang }), datafield: 'Description', editable: false, minwidth: 130,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },

            ]
        });

        getUiGridBiginEdit(gID, 'SecurityGroupId', gridStorage);
        callUiGridFilter(gID, gridStorage);

    }

    //Getting details of role
    function getUnAssignedSecurityGroupsForRole(securityGroupData) {
        var role = new Object();
        $("#loadingDiv").show();

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.securityGroups)
                        data.securityGroups = $.parseJSON(data.securityGroups);

                    securityGroupData(data.securityGroups);
                    jqxgridForSecurityGroups(securityGroupData(), 'jqxgridForUnAssignedSecurityGroupForRole');
                } else if (data.responseStatus.StatusCode == AppConstants.get('DUPLICATE_ROLE_FOUND')) {
                    openAlertpopup(2, 'role_name_exists');
                }
                $("#loadingDiv").hide();
            }
            if (error) {
                retval = "";
            }
        }

        var method = 'GetUnAssignedSecurityGroupsForRole';
        var params = '{"token":"' + TOKEN() + '","roleId":"' + roleId + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
    }

});

