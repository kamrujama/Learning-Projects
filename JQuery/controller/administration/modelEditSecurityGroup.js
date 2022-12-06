define(["knockout", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, autho) {
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    var globalVariableForModelEditSecurityGroup = new Object();
    var getSelectedRole = new Object();

    return function editSecurityGroupViewModel() {
     
        var config = {
            '.chosen-select': {},
            '.chosen-select-deselect': { allow_single_deselect: true },
            '.chosen-select-no-single': { disable_search_threshold: 10 },
            '.chosen-select-no-results': { no_results_text: 'Oops, nothing found!' },
            '.chosen-select-width': { width: "95%" }
        }

        //Chosen dropdown
        ko.bindingHandlers.chosen = {
            init: function (element) {
                ko.bindingHandlers.options.init(element);
                $(element).chosen({ disable_search_threshold: 10 });
            },
            update: function (element, valueAccessor, allBindings) {
                ko.bindingHandlers.options.update(element, valueAccessor, allBindings);
                $(element).trigger('chosen:updated');
            }
        };

        for (var selector in config) {
            $(selector).chosen(config[selector]);
        }

        var self = this;
      
        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        self.SecurityGroupName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('enter_security_name', {
                    lng: lang
                })
            }
        });

        self.RoleName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_assign_role_to_security_group', {
                    lng: lang
                })
            }
        });


        self.roleNameArr = ko.observableArray();
        self.getRoledataArray = ko.observableArray();

        self.securityGroupName = globalVariableForEditRoles[0].selectedSecurityGroupName;
        self.description = globalVariableForEditRoles[0].selectedDescription;
        self.rolesCsv = globalVariableForEditRoles[0].selectedRolesCsv;

        self.securityGroupId = globalVariableForEditRoles[0].selectedSecurityGroupId;

        var orignalDescription = globalVariableForEditRoles[0].selectedDescription;     

        getActiveRoleDetails(self.getRoledataArray, self.securityGroupId);


        self.editRoles = function (observableModelPopup, gID) {
            var retVal = checkError();
            if (retVal == null || retVal == "") {
                editSecurityGroupDetails(self.roleNameArr, self.securityGroupId, observableModelPopup, gID, self.getRoledataArray, orignalDescription);
            }
        }

        function checkError() {
            var retval = '';

            var editSecurityName = $("input#editSecurityNameID");
            editSecurityName.val(editSecurityName.val().replace(/^\s+/, ""));

            // validation for security name
            if ($("#editSecurityNameID").val() == null || $("#editSecurityNameID").val() == "") {
                retval += 'edit security name';
                self.SecurityGroupName(null);
                $("#editSecurityNameVaidationID").text(i18n.t('enter_security_name'));
                $("#editSecurityNameVaidationID").show();
            } else {
                retval += '';
            }

            if ($("#roleTypeId").chosen().val() == null || $("#roleTypeId").chosen().val() == "" || $("#roleTypeId").chosen().val().length == 0) {
                retval += 'edit role for security';
                self.RoleName(null);
                $("#roleType").text(i18n.t('Please_assign_role_to_security_group'));
                $("#roleType").show();
            } else {
                retval += '';
            }

            return retval;
        };


        self.onChangeRole = function () {
            $("#roleType").empty();
            if ($("#roleTypeId").chosen().val() == null || $("#roleTypeId").chosen().val() == "" || $("#roleTypeId").chosen().val().length == 0) {
                if ($("#roleTypeId").find('option:selected').val() != undefined) {
                    self.RoleName = null;
                    $("#roleType").text(i18n.t('Please_assign_role_to_security_group'));
                    $("#roleType").show();
                }
            } else {
                var forselction = [];

                self.roleNameArr([]);
                $('#roleTypeId :selected').each(function (i, selected) {
                    var selectionObj = new Object();
                    selectionObj.id = $(selected).val();
                    selectionObj.Name = $(selected).text();
                    forselction.push(selectionObj);
                });
                self.roleNameArr.push(forselction);
                $("#roleType").empty();
                $('#btn_editSecurity').removeAttr('disabled');
            }
        }

        $("#roleType").hide();

        //enabled add button
        $("#editRoleDescriptionID").on('change keyup paste', function () {
            if ($("#editRoleDescriptionID").val() != "") {
                $('#btn_editSecurity').removeAttr('disabled');
            }
        });


        $("#editSecurityNameID").on('change keyup paste', function () {
            if ($("#editSecurityNameID").val() != "") {
                $('#btn_editSecurity').removeAttr('disabled');
            }
        });

        // allow only 255 charcters in  security group name
        $("#editSecurityNameID").on("keypress keyup paste", function (e) {
            var textMax = 255;
            var textLength = $('#editSecurityNameID').val().length;
            var textRemaining = textMax - textLength;
        });

        $('#editSecurityNameID').keyup(function () {
            if (this.value.match(/[^a-zA-Z0-9`~!@#$&()|+\=;:.'",<>\{\}\[\]\\\-_/ ]/g)) {
                this.value = this.value.replace(/[^a-zA-Z0-9`~!@#$&()|+\=;:.'",<>\{\}\[\]\\\-_/ ]/g, '');
                return true;
            }
        });

        $('.chosen-choices').on('click', function () {
            $('#roleTypeId_chosen .search-field input[type=text]').focus();
        });

        seti18nResourceData(document, resourceStorage);
    };


    $('#modelEditSecGrpHeader').mouseup(function () {
        $("#modelEditSecGrp").draggable({ disabled: true });
    });

    $('#modelEditSecGrpHeader').mousedown(function () {
        $("#modelEditSecGrp").draggable({ disabled: false });
    });

    //get role detils on add button click
    function getActiveSecurityGroupDetails(securityGroupId) {
        var securityGroupId = securityGroupId;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.roles)
                        data.roles = $.parseJSON(data.roles);
                    getSelectedRole = data.roles;
                    var values = globalVariableForEditRoles[0].selectedRolesCsv;
                    var modelsArray = $('select#roleTypeId option');

                    $.each(values.split(','), function (index, element) {
                        for (var i = 0; i < globalVariableForModelEditSecurityGroup.length; i++) {
                            for (var j = 0; j < getSelectedRole.length; j++) {
                                if (globalVariableForModelEditSecurityGroup[i].RoleId == getSelectedRole[j].RoleId) {
                                    if (modelsArray[i].text == element.trim()) {
                                        $('select#roleTypeId option[value=' + modelsArray[i].value + ']').prop('selected', 'selected');
                                        $("#roleTypeId").trigger('chosen:updated');
                                    }
                                }
                            }
                        }
                    });

                }
            }
        }

        var method = 'GetSecurityGroup';
        var params = '{"token":"' + TOKEN() + '","securityGroupId":' + securityGroupId + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    //get role detils on add button click
    function getActiveRoleDetails(getRoledataArray, securityGroupId) {
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data && data.rolesList) {
                        data.rolesList = $.parseJSON(data.rolesList);
                    }

                    getRoledataArray(data.rolesList);
                    globalVariableForModelEditSecurityGroup = getRoledataArray();
                    getActiveSecurityGroupDetails(securityGroupId)
                }
            }
        }

        var method = 'GetActiveRoles';
        var params = '{"token":"' + TOKEN() + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getRoleArry(role) {
        var roleNew = new Array();

        if (role.length <= 0) {
            for (var i = 0; i < getSelectedRole.length; i++) {
                var eRole = new Object();
                eRole.RoleId = getSelectedRole[i].RoleId;
                eRole.RoleName = getSelectedRole[i].RoleName;;
                roleNew.push(eRole);
            }
        } else {           
            var selectedRoleName = role[0];
            for (var i = 0; i < selectedRoleName.length; i++) {
                var eRole = new Object();
                eRole.RoleId = selectedRoleName[i].id;
                eRole.RoleName = selectedRoleName[i].Name;
                roleNew.push(eRole);
            }
        }

        return roleNew;
    }

    function editSecurityGroupDetails(roleNameArr, securityGroupId, observableModelPopup, gID, getRoledataArray, orignalDescription) {
        var existingSecurityGroup = new Object();
        var updatedSecurityGroup = new Object();

        var roles = getRoleArry(roleNameArr());

        var editDescription = $("#editRoleDescriptionID").val();
        var securityGroupName = $("#editSecurityNameID").val();

        existingSecurityGroup.Description = orignalDescription;
        existingSecurityGroup.SecurityGroupId = securityGroupId;
        existingSecurityGroup.SecurityGroupName = securityGroupName;

        updatedSecurityGroup.Description = editDescription;
        updatedSecurityGroup.SecurityGroupId = securityGroupId;
        updatedSecurityGroup.SecurityGroupName = securityGroupName;


        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'the_security_group_changes_saved_successfully');
                    $("#modelSecurityID").modal('hide');
                    gridFilterClear(gID);
                    observableModelPopup('unloadTemplate');
                } else if (data.responseStatus.StatusCode == AppConstants.get('Security_Group_Name_Already_Exists')) {
                    openAlertpopup(2, 'security_group_already_exists');
                } else if (data.responseStatus.StatusCode == AppConstants.get('Security_Group_Details_Not_Found_In_Active_Directory')) {
                    var msg = securityGroupName + " " + i18n.t('is_not_a_valid_active_directory_security_group', { lng: lang });
                    openAlertpopup(2, msg);
                }
            }
        }

        var method = 'SetSecurityGroup';
        var params = '{"token":"' + TOKEN() + '","existingSecurityGroup":' + JSON.stringify(existingSecurityGroup) + ',"updatedSecurityGroup":' + JSON.stringify(updatedSecurityGroup) + ',"roles":' + JSON.stringify(roles) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }
});