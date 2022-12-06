roleId = '';
define(["knockout", "autho", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, autho,koUtil) {
    var lang = getSysLang();
    var isEditable = 0;
    uploadedfiledata = new Array();
    currentAddedUserGuid = "";
    currentTemporaryPassword = "";
    emailValue = "";
    var selectedRoleId = "";
    var selectedRoleName = "";
    
    securityGroupDataGlobal = new Array();
    addRightsGlobal = new Array();
    addUsersGlobal = new Array();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function AddpackageViewModel() {

        var self = this;
        self.rightsSection = ko.observable(true);        
        self.userData = ko.observableArray();
        self.rightsData = ko.observableArray();
        self.securityGroupData = ko.observableArray();
        self.userSectionEnable = ko.observable(true);
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        var sourceSelectedRole = new Array();
        selectedRoleId = "";
        selectedRoleName = "";
        
        init();
        function init() {
            modelReposition();
            checkRights();
            loadelement(modelname, 'genericPopup');

            var selectedId = getSelectedUniqueId('jqxgridRoles');
            if (!_.isEmpty(selectedId) && selectedId.length > 0) {
                sourceSelectedRole = _.where(globalVariableForEditRole, { "selectedRoleId": selectedId[0] });
                if (!_.isEmpty(sourceSelectedRole) && sourceSelectedRole.length > 0) {
                    self.description = ko.observable(sourceSelectedRole[0].selectedDescription);
                    roleId = sourceSelectedRole[0].selectedRoleId;
                    selectedRoleId = sourceSelectedRole[0].selectedRoleId ? sourceSelectedRole[0].selectedRoleId : 0;
                    selectedRoleName = sourceSelectedRole[0].selectedRoleName ? sourceSelectedRole[0].selectedRoleName : '';

                    //Enable/disable role name and description and rights section
                    $("#rightsGrid").addClass("panel-body v-list-panel");
                    $("#rightsGrid").removeClass("panel-body v-list-panel disabled");
                    if (selectedRoleName == "Marketing User" || selectedRoleName == "Operations") {
                        $('#roleNameId').prop('disabled', true);
                        $('#descriptionId').prop('disabled', true);
                    } else if (selectedRoleName == "Administrators") {
                        $('#roleNameId').prop('disabled', true);
                        $('#descriptionId').prop('disabled', true);
                        $("#rightsDisabled").prop('disabled', true);
                        //$("#rightsGrid").removeClass("panel-body v-list-panel");
                        //$("#rightsGrid").addClass("panel-body v-list-panel disabled");
                        $("#rightsBtns").removeClass("pull-left btn-mgl");
                        $("#rightsBtns").addClass("pull-left btn-mgl disabled");
                        self.rightsSection(false);
                        koUtil.isAdministartionRole = 1;
                    } else {
                        koUtil.isAdministartionRole = 0;
                    }
                }
            }
            //Users/Security Groups screen should be visible false/true
            if (IsADUser || IsADFSUser) {
                $("#userSection").hide();
                $("#securityGroupSection").show();
            } else {
                $("#userSection").show();
                $("#securityGroupSection").hide();
            }

            function callback() {
                $("#loadingDiv").hide();
            }
            getUserDetails(self.userData, self.rightsData, self.securityGroupData, self.userSectionEnable, callback);
        }

        function checkRights() {
            var retval = autho.checkRightsBYScreen('Roles and Users', 'IsModifyAllowed');
            if (retval == true && isEditable == 1) {
                $('#addBtn').removeAttr('disabled');
            }
        }

        self.checkRightsForCancel = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        //load element
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
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


        //-----------------------------------------------------FOCUS OF BUTTON ON POP UP-----------------------------------------------------------

        $('#userDeleteModel_Role_Child').on('shown.bs.modal', function (e) {
            $('#userDeleteModel_Role_Child_No_Btn').focus();
        });

        $('#userDeleteModel_Role_Child').keydown(function (e) {
            if ($('#userDeleteModel_Role_Child_No_Btn').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#userDeleteModel_Role_Child_Yes_Btn').focus();
            }
        });

        $('#rightsDeleteModel').on('shown.bs.modal', function (e) {
            $('#rightsDeleteModel_BTN_NO').focus();

        });

        $('#rightsDeleteModel').keydown(function (e) {
            if ($('#rightsDeleteModel_BTN_NO').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#rightsDeleteModel_BTN_Yes').focus();
            }
        });        

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
            $('#downloadModel').modal('hide');
        }

        //enabled add button
        $("#roleNameId").on('change keyup paste', function () {
            if ($("#roleNameId").val() != "") {
                isEditable = 1;
                $('#addBtn').removeAttr('disabled');
            }
        });

        $("#descriptionId").on('change keyup paste', function () {
            if ($("#descriptionId").val() != "") {
                isEditable = 1;
                $('#addBtn').removeAttr('disabled');
            }
        });

        $('#roleNameId').keyup(function () {
            var yourInput = $(this).val();
            re = /[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
            // store current positions in variables
            var start = this.selectionStart,
                end = this.selectionEnd;

            var isSplChar = re.test(yourInput);
            if (isSplChar) {
                var no_spl_char = yourInput.replace(/[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '');
                $(this).val(no_spl_char);

                // restore from variables...
                this.setSelectionRange(start - 1, end - 1);
            }
        });

        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelEditRoleUser") {
                self.userDataArray = ko.observableArray();
                getUnAssignedUsersForRole(self.userDataArray);
            } else if (popupName == "modelAddRights") {
                getUnAssignedRightsForRole();
            } else if (popupName == "modelEditRights") {
                if (self.rightsData() != null) {
                    var selectedIds = getSelectedUniqueId(gId);
                    if (selectedIds.length == 0) {
                        openAlertpopup(1, 'select_rights_to_edit');
                    } else {
                        loadelement(popupName, 'administration');
                        $('#downloadModel').modal('show');
                        editButtonClick(gId);
                    }
                } else {
                    openAlertpopup(1, 'no_user_selected');
                }
            } else if (popupName == "modelRoleAddSecurityGroups") {
                self.securityGroupData = ko.observableArray();
                getUnAssignedSecurityGroupsForRole();
            }
        }

        //Users call
        function getUnAssignedUsersForRole(userDataArray) {
            var role = new Object();
            $("#loadingDiv").show();

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.users)
                            data.users = $.parseJSON(data.users);

                        if (data.users != null) {
                            loadelement("modelEditRoleUser", 'administration');
                            $('#downloadModel').modal('show');
                            addUsersGlobal = data.users;
                        } else {
                            openAlertpopup(1, 'no_unassigned_users');
                        }
                    } else if (data.responseStatus.StatusCode == AppConstants.get('DUPLICATE_ROLE_FOUND')) {
                        openAlertpopup(2, 'role_name_exists');
                    }
                    $("#loadingDiv").hide();
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'GetUnAssignedUsersForRole';
            var params = '{"token":"' + TOKEN() + '","roleId":"' + selectedRoleId + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        //rights call
        function getUnAssignedRightsForRole() {
            $("#loadingDiv").show();

            function callbackFunction(data, error) {
                if (data) {
                    if (data.rights)
                        data.rights = $.parseJSON(data.rights);
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.rights != null && data.rights != '') {
                            loadelement("modelAddRights", 'administration');
                            $('#downloadModel').modal('show');
                            addRightsGlobal = data.rights;
                        } else {
                            openAlertpopup(1, 'no_unassigned_rights');
                        }
                    } 
                    $("#loadingDiv").hide();
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'GetUnAssignedRightsForRole';
            var params = '{"token":"' + TOKEN() + '","roleId":"' + selectedRoleId + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        //Security group call
        function getUnAssignedSecurityGroupsForRole() {
            var role = new Object();
            $("#loadingDiv").show();

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.securityGroups){
                            data.securityGroups = $.parseJSON(data.securityGroups);                       
                            loadelement("modelRoleAddSecurityGroups", 'administration');
                            $('#downloadModel').modal('show');
                            securityGroupDataGlobal = data.securityGroups;
                        }else{
                            openAlertpopup(1, 'no_unassigned_grp');
                        }
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
            var params = '{"token":"' + TOKEN() + '","roleId":"' + selectedRoleId + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        //export user details/SG/Rights
        self.exportToXls = function (gridId) {
            var dataInfo = $("#" + gridId).jqxGrid('getdatainformation');
          
            if (gridId == "jqxgridForUserDetails") {
                if (dataInfo.rowscount <= 0) {
                    openAlertpopup(1, 'no_data_to_export');
                } else {
                    $("#" + gridId).jqxGrid('exportdata', 'csv', 'Role_Users');
                    openAlertpopup(1, 'export_Information');
                }
            } else if (gridId == "jqxgridForRightsDetails") {
                if (dataInfo.rowscount <= 0) {
                    openAlertpopup(1, 'no_data_to_export');
                }else {
                    $("#" + gridId).jqxGrid('exportdata', 'csv', 'Rights');
                    openAlertpopup(1, 'export_Information');
                }
            } else {
                if (dataInfo.rowscount <= 0) {
                    openAlertpopup(1, 'no_data_to_export');
                }else {
                    $("#" + gridId).jqxGrid('exportdata', 'csv', 'SecurityGroupExcel');
                    openAlertpopup(1, 'export_Information');
                }
            }
            
        }

        //claer filter of users/SG
        self.clearfilter = function (gridId) {
            if (gridId == "jqxgridForUserDetails") {
                clearUiGridFilter(gridId);
            } else {
                clearUiGridFilter(gridId);
            }
        }

      
        //Cancel role operation
        self.cancelClick = function (observableModelPopup) {
            isEditable = 0;
            observableModelPopup('unloadTemplate');
            $("#editRoleScreen").hide();
            $("#jqxgridRoles").jqxGrid('updatebounddata');
            $('#roleMain').show();
        }

    
        //Validation on role name field
        self.roleName = ko.observable(selectedRoleName).extend({
            required: {
                params: true,
                message: i18n.t('enter_role_name', {
                    lng: lang
                })
            }
        });

        //cance popup
        self.cancelReset =function() {
            $('#userDeleteModel_Role_Child').modal('hide');
            $('#rightsDeleteModel').modal('hide');
            $('#securityGroupDeleteModel').modal('hide');
        }

        function checkerror(chekVal) {
            var retval = '';

            var roleName = $("input#roleNameId");
            var roleDescription = $("input#descriptionId");
            roleName.val(roleName.val().replace(/^\s+/, ""));
            roleDescription.val(roleDescription.val().replace(/^\s+/, ""));

            if ($("#roleNameId").val() == "") {
                retval += 'role name';
                self.roleName(null);
                $("#enter_role_name").show();
            } else {
                retval += '';
            }
            return retval;
        };

        //Add Role API call
        self.setRole = function (observableModelPopup) {
            var retval = checkerror();
            if (retval == null || retval == "") {
                var role = new Object();
                $("#loadingDiv").show();
                role.RoleName = $("#roleNameId").val();
                role.Description = $("#descriptionId").val();
                role.RoleId = selectedRoleId;

                function callbackFunction(data, error) {
                    if (data) {
                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                            isEditable = 0;
                            $("#editRoleScreen").hide();
                            $('#roleMain').show();
                            gridFilterClear('jqxgridRoles');
                            observableModelPopup('unloadTemplate');
                            $('#downloadModel').modal('hide');
                            openAlertpopup(0, 'successfully_save');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('DUPLICATE_ROLE_FOUND')) {
                            openAlertpopup(2, 'role_name_exists');
                        }
                        $("#loadingDiv").hide();
                    }
                    if (error) {
                        retval = "";
                    }
                }

                var method = 'SetRole';
                var params = '{"token":"' + TOKEN() + '","role":' + JSON.stringify(role) + '}';
                ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
            } else {
                return false;
            }
        }

        self.getDetails = function (getDetailsCallback) {
            $("#gridAreaForRightsDetails").empty();
            var str = '<div id="jqxgridForRightsDetails"></div>';
            $("#gridAreaForRightsDetails").append(str);
            function callback() {
                return getDetailsCallback();
            }
            getUserDetails(self.userData, self.rightsData, self.securityGroupData, self.userSectionEnable, callback);
        }

        self.getDetailsForUser = function () {
            $("#loadingDiv").show();
            $("#gridArea").empty();
            var str = '<div id="jqxgridForUserDetails"></div>';
            $("#gridArea").append(str);
            $("#gridAreaForRightsDetails").empty();
            var str = '<div id="jqxgridForRightsDetails"></div>';
            $("#gridAreaForRightsDetails").append(str);
            function callback() {
                $("#loadingDiv").hide();
            }
            getUserDetails(self.userData, self.rightsData, self.securityGroupData, self.userSectionEnable, callback);
        }
        //Delete user from role
        self.removeUserFromRoleBtnClick =  function(gId) {
            var selectedrowids = getSelectedUniqueId(gId);
            var userArray = self.userData();
            if (selectedrowids.length == 1) {
                $('#userDeleteModel_Role_Child').modal('show');
                $("#deleteUser").text(i18n.t('remove_user_from_role', { lng: lang }));
            } else if (selectedrowids.length > 1) {
                $('#userDeleteModel_Role_Child').modal('show');
                $("#deleteUser").text(i18n.t('remove_user_from_role', { lng: lang }));
            } else if (userArray.length == 0) {
                openAlertpopup(1, 'not_valid_operation_for_user');
            } else if (selectedrowids.length == 0) {
                var roleName = selectedRoleName;
                openAlertpopup(1, i18n.t('user_unassign_from_role', { roleName: roleName }, { lng: lang }));
            }
        }

        self.removeUsersFromRole = function (gId) {
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
                        self.getDetailsForUser();
                        var roleName = selectedRoleName;
                        openAlertpopup(0, i18n.t('delete_user_success', { roleName: roleName }, { lng: lang }));
                    } else if (data.responseStatus.StatusCode == AppConstants.get('DUPLICATE_ROLE_FOUND')) {
                        openAlertpopup(2, 'role_name_exists');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('ATLEAT_ONE_ROLE_MANDATORY')) {
                        var roleName = selectedRoleName;
                        var loginnames =data.loginNames;
                        openAlertpopup(1, i18n.t('user_with_login_name_cannot_deleted', { roleName: roleName, loginnames: loginnames }, { lng: lang }));
                        clearUiGridFilter('jqxgridForUserDetails');
                        self.getDetailsForUser();
                    }
                    $('#userDeleteModel_Role_Child').modal('hide');
                    $("#loadingDiv").hide();
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'RemoveUsersFromRole';
            var params = '{"token":"' + TOKEN() + '","roleId":"' + selectedRoleId + '","users":' +JSON.stringify( arrAssignedUsers)+ '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        //Delete security groups from role
        self.removeSecurityGroupFromRoleBtnClick = function (gId) {
            var selectedrowids = getSelectedUniqueId(gId);
            var selectedData = getMultiSelectedData(gId);
            if (selectedrowids.length == 1) {
                securityGroupName = selectedData[0].SecurityGroupName
                $('#securityGroupDeleteModel').modal('show');
                $("#deleteSecurityGroups").text(i18n.t('sure_del_sec_grp', { securityGroupName: securityGroupName }, { lng: lang }));
            } else if (selectedrowids.length > 1) {
                var length = selectedrowids.length;
                $('#securityGroupDeleteModel').modal('show');
                $("#deleteSecurityGroups").text(i18n.t('sure_del_sec_groups', { length: length }, { lng: lang }));
            } else if (selectedrowids.length == 0) {
                openAlertpopup(1, i18n.t('one_security_group', { lng: lang }));
            }
        }

        self.removeSecuritygroupFromRole = function (gId) {
            var getMulSelectedData = getMultiSelectedData(gId);
            var arrAssignedSecurityGroup = new Array();

            var rolesObj = new Object();
            if (!_.isEmpty(sourceSelectedRole) && sourceSelectedRole.length > 0) {
                rolesObj.CreatedByUserId = sourceSelectedRole[0].selectedCreatedById;
                rolesObj.CreatedByUserName = sourceSelectedRole[0].selectedCreatedByUserName;
                rolesObj.CreatedOn = createJSONTimeStamp(sourceSelectedRole[0].selectedCreatedOn);
                rolesObj.Description = sourceSelectedRole[0].selectedDescription;
                rolesObj.ModifiedByUserId = sourceSelectedRole[0].selectedModifiedByUserId;
                rolesObj.ModifiedByUserName = sourceSelectedRole[0].selectedModifiedByUserName;
                rolesObj.RoleId = sourceSelectedRole[0].selectedRoleId;
                rolesObj.RoleName = sourceSelectedRole[0].selectedRoleName;
                rolesObj.TotalRows = sourceSelectedRole[0].selectedTotalRows;
                rolesObj.UserInfo = null;
            }
            for (var i = 0; i < getMulSelectedData.length; i++) {
                var securityGroup = new Object();
                securityGroup.SecurityGroupId = getMulSelectedData[i].SecurityGroupId;
                securityGroup.SecurityGroupName = getMulSelectedData[i].SecurityGroupName;
                arrAssignedSecurityGroup.push(securityGroup);
            }
            $("#loadingDiv").show();
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        clearUiGridFilter('jqxgridForSecurityGroupsDetails');
                        function callback() {
                            $("#loadingDiv").hide();
                        }
                        getUserDetails(self.userData, self.rightsData, self.securityGroupData, self.userSectionEnable, callback);
                        var roleName = selectedRoleName;
                        openAlertpopup(0, i18n.t('delete_security_success', { roleName: roleName }, { lng: lang }));
                    }
                    $('#securityGroupDeleteModel').modal('hide');
                    $("#loadingDiv").hide();
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'RemoveSecurityGroupsFromRole';
            var params = '{"token":"' + TOKEN() + '","role":' + JSON.stringify(rolesObj) + ',"securityGroups":' + JSON.stringify(arrAssignedSecurityGroup) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        //Remove rights from role
        self.deleteRightsClick = function (gId) {
            var selectedrowids = getSelectedUniqueId(gId);
            if (selectedrowids.length == 1) {
                $('#rightsDeleteModel').modal('show');
                $("#deleteRights").text(i18n.t('remove_rights_from_role', { lng: lang }));
            } else if (selectedrowids.length > 1) {
                $('#rightsDeleteModel').modal('show');
                $("#deleteRights").text(i18n.t('remove_rights_from_role', { lng: lang }));
            } else if (selectedrowids.length == 0) {
                var roleName = selectedRoleName;
                openAlertpopup(1, i18n.t('rights_unassign_from_role', { roleName: roleName }, { lng: lang }));
            }
        }


        self.removeRightsFromRole = function (gId) {
            var getMulSelectedData = getMultiSelectedData(gId);
            var rightsArr = new Array();

            for (var i = 0; i < getMulSelectedData.length; i++) {
                var rightsObj = new Object();
                rightsObj.RightId = getMulSelectedData[i].RightId;
                rightsArr.push(rightsObj);
            }
            $("#loadingDiv").show();
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        $('#rightsDeleteModel').modal('hide');
                        clearUiGridFilter('jqxgridForRightsDetails');
                        function getDetailsCallback() {
                            clearUiGridFilter('jqxgridForUserDetails');
                        }
                        self.getDetails(getDetailsCallback);
                        var roleName = selectedRoleName;
                        openAlertpopup(0, i18n.t('delete_rights_success', { roleName: roleName }, { lng: lang }));
                    } 
                    $('#userDeleteModel_Role_Child').modal('hide');
                    $("#loadingDiv").hide();
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'RemoveRightsFromRole';
            var params = '{"token":"' + TOKEN() + '","roleId":"' + selectedRoleId + '","actions":' + JSON.stringify(rightsArr) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        //Edit rights
        function editButtonClick(gId) {
            var rights = new Object();
            var selectedData = getMultiSelectedData(gId);
            var selectedIds = getSelectedUniqueId(gId);
            globalVariableForAssignedRights=[];
            for (var i = 0; i < selectedIds.length ; i++) {
                var source = _.where(selectedData, { RightId: selectedIds[i] });
                if (!_.isEmpty(source) & source.length > 0) {
                    var rights = new Object();
                    rights.RightId = source[0].RightId;
                    rights.RightName = source[0].RightName;
                    rights.IsDeleteAllowed = source[0].IsDeleteAllowed;
                    rights.IsModifyAllowed = source[0].IsModifyAllowed;
                    rights.IsViewAllowed = source[0].IsViewAllowed;
                    globalVariableForAssignedRights.push(rights);
                }
            }
        }

        seti18nResourceData(document, resourceStorage);

    };

    //User grid
    function jqxgridForUser(userData, gID) {

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
            localdata: userData,
            datafields: [
                { name: 'UserGuid', map: 'UserGuid' },
                { name: 'LoginName', map: 'LoginName',type: 'String' },
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
            pagesize: userData.length,
            altrows: true,
            autoshowcolumnsmenubutton: false,
            rowsheight: 32,
            showsortmenuitems: false,
            enabletooltips: true,
            editable: true,
            columnsResize: true,
            columns: [
                    {
                        text: '', menu: false, sortable: false, exportable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                { text: '', datafield: 'UserGuid', exportable: false, hidden: true, minwidth: 0, },
                {

                    text: i18n.t('login_name_datagrid', { lng: lang }), datafield: 'LoginName', editable: false, minwidth: 100,
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

        if (userData.length == 0) {
            $("#jqxgridForUserDetails").find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-checked');
        }
        $("#loadingDiv").hide();
    }

    //Rights grid
    function jqxgridForRights(rightsData, gID) {

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
            localdata: rightsData,
            datafields: [
                { name: 'RightName', map: 'Action>RightName', type: 'String' },
                { name: 'RightId', map: 'RightId' },
                { name: 'IsModifyAllowed', map: 'IsModifyAllowed' },
                { name: 'IsDeleteAllowed', map: 'IsDeleteAllowed' },
                { name: 'IsViewAllowed', map: 'IsViewAllowed' },
                { name: 'isSelected', type: 'number' }
            ],
            beforeprocessing: function () {
                if (koUtil.isAdministartionRole == 1) {
                    $("#" + gID).jqxGrid('sortable', false);
                    $("#" + gID).jqxGrid('editable', false);
                } else {
                    $("#" + gID).jqxGrid('sortable', true);
                    $("#" + gID).jqxGrid('editable', true);
                }
            }
        };
        var dataAdapter = new $.jqx.dataAdapter(source);
        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID);
        }
        var rendered = function (element) {

            enableUiGridFunctions(gID, 'RightId', element, gridStorage, true, 'RightName');

            return true;
        }

       
        var cellbeginedit = function (row, datafield, columntype, value) {

            var check = $("#" + gID).jqxGrid('getcellvalue', row, 'RightName');
            var checkModifyFlag = $("#" + gID).jqxGrid('getcellvalue', row, 'IsModifyAllowed');
            if (koUtil.isAdministartionRole == 1) {
                $("#" + gID).jqxGrid('editable', false);
                    return false;
            } else {
                    return true;
            }
            if (koUtil.isAdministartionRole == 1) {
                $("#" + gID).jqxGrid('editable', false);
                return false;
            } else {
                if (check == "Basic Access") {
                    $("#" + gID).jqxGrid('editable', false);
                    return false;
                } else {
                    return true;
                }
            }


        }

        // create jqxgrid.
        $("#" + gID).jqxGrid(
        {
            width: "100%",
            source: dataAdapter,
            filterable: false,
            ready: function () {
             
            },

            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            rowsheight: 32,
            pagesize: rightsData.length,
            enabletooltips: true,
            altrows: true,
            editable: true,
            columnsResize: true,
            columns: [
                    {
                        text: '', menu: false, sortable: false, exportable: false, cellbeginedit: cellbeginedit, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                { text: '', datafield: 'RightId', exportable: false, hidden: true, width: 'auto' },
                {

                    text: i18n.t('right_name', { lng: lang }), datafield: 'RightName', enabletooltips: true, editable: false, minwidth: 100, menu: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    },
                },

              {
                  text: i18n.t('modify', { lng: lang }), datafield: 'IsModifyAllowed', editable: false, columntype: 'checkbox', editable: false,  minwidth: 70, menu: false, enabletooltips: false,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },

              {
                  text: i18n.t('delete', { lng: lang }), datafield: 'IsDeleteAllowed', editable: false, columntype: 'checkbox',  minwidth: 70, menu: false, enabletooltips: false,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },
              {
                  text: i18n.t('view', { lng: lang }), datafield: 'IsViewAllowed', editable: false, columntype: 'checkbox',  minwidth: 70, menu: false, enabletooltips: false,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },
            ]
        });

        getUiGridBiginEdit(gID, 'RightId', gridStorage);
        callUiGridFilter(gID, gridStorage);


        if (koUtil.isAdministartionRole == 1) {
            $("#" + gID).find('.jqx-grid-column-header:first').fadeTo('fast', .6);
            $("#" + gID).find('.jqx-grid-column-header:first').append('<div style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');

        }
    }

    //Security Group grid
    function jqxgridForSecurityGroups(securityGroupData, gID) {

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
            localdata: securityGroupData,
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

        var securityGroupLength = function () {
            if (securityGroupData)
                var records = securityGroupData.length
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
            pagesize: securityGroupData.length,
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
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                { text: '', datafield: 'SecurityGroupId', hidden: true, width: 'auto' },
                {
                    text: i18n.t('security_Group', { lng: lang }), datafield: 'SecurityGroupName', editable: false,  minwidth: 140, 
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    },
                },
                {
                    text: i18n.t('description', { lng: lang }), datafield: 'Description', editable: false,  minwidth: 100,
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
    function getUserDetails(userData, rightsData, securityGroupData, userSectionEnable, callback) {
        var role = new Object();
        $("#loadingDiv").show();

        function callbackFunction(data, error) {
            if (data) {
                if (data.securityGroups)
                    data.securityGroups = $.parseJSON(data.securityGroups);
                if (data.roleRights)
                    data.roleRights = $.parseJSON(data.roleRights);
                if (data.users)
                    data.users = $.parseJSON(data.users);

                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.users) {
                        userSectionEnable(true);
                        userData(data.users);
                    } else {
                        userSectionEnable(false);
                        userData([]);
                    }

                    if (data.securityGroups) {
                        securityGroupData(data.securityGroups);
                    } else {
                        securityGroupData([]);
                    }

                    if (data.roleRights) {
                        rightsData(data.roleRights);
                    } else {
                        rightsData([]);
                    }
                    jqxgridForRights(rightsData(), 'jqxgridForRightsDetails');
                    if (IsADUser || IsADFSUser) {
                        jqxgridForSecurityGroups(securityGroupData(), 'jqxgridForSecurityGroupsDetails');
                    } else {
                        jqxgridForUser(userData(), 'jqxgridForUserDetails');
                    }
                    return callback();
                } else if (data.responseStatus.StatusCode == AppConstants.get('DUPLICATE_ROLE_FOUND')) {
                    openAlertpopup(2, 'role_name_exists');
                }
                $("#loadingDiv").hide();
            }
            if (error) {
                retval = "";
            }
        }

        var method = 'GetRoleDetails';
        var params = '{"token":"' + TOKEN() + '","roleId":"' + selectedRoleId + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
    }

});

