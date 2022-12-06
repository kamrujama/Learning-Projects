define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
    var lang = getSysLang();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function modelAddSecurityGroupViewModel() {


        var config = {
            '.chosen-select': {},
            '.chosen-select-deselect': { allow_single_deselect: true },
            '.chosen-select-no-single': { disable_search_threshold: 10 },
            '.chosen-select-no-results': { no_results_text: 'Oops, nothing found!' },
            '.chosen-select-width': { width: "95%" }
        }

        for (var selector in config) {
            $(selector).chosen(config[selector]);
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

        //focus on first textbox
        $('#modelSecurityID').on('shown.bs.modal', function () {
            $('#securityNameID').focus();
        })

        // focus on next tab index 
        lastIndex = 7;
        prevLastIndex = 3;
        $(document).keydown(function (e) {
            if (e.keyCode == 9) {
                var thisTab = +$(":focus").prop("tabindex") + 1;
                var isDisabled = $("#btn_addSecurity").is(':disabled');
                if (e.shiftKey) {
                    if (thisTab == prevLastIndex) {
                        if (isDisabled == true) {
                            $("#" + tabLimitInID).find('[tabindex=' + disableIndex + ']').focus();
                            return false;
                        } else {
                            $("#" + tabLimitInID).find('[tabindex=' + prevIndex + ']').focus();
                            return false;
                        }
                    }
                } else {
                    if (thisTab == prevIndex) {
                        if (isDisabled == true) {
                            $("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
                            return false;
                        }

                    } else if (thisTab == lastIndex) {
                        $("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
                        return false;
                    }
                }
            }
        });

        var setTabindexLimit = function (x, addSecurityGroupID, y) {
            console.log(x);
            startIndex = 2;
            lastIndex = x;
            prevLastIndex = y;
            prevIndex = 6;
            disableIndex = 5;
            tabLimitInID = addSecurityGroupID;
        }
        setTabindexLimit(7, "securityAllID", 3);
        // end tabindex

        var self = this;
      
        self.roleNameArr = ko.observableArray();

        self.getRoledataArray = ko.observableArray();
        getActiveRoleDetails(self.getRoledataArray);

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

        self.onChangeRole = function () {
            $("#roleType").empty();
            if ($("#roleId").chosen().val() == null || $("#roleId").chosen().val() == "" || $("#roleId").chosen().val().length == 0) {
                self.RoleName(null);
                $("#roleType").text(i18n.t('Please_assign_role_to_security_group'));
                $("#roleType").show();
            } else {
                var forselction = [];
                self.roleNameArr([]);
                $('#roleId :selected').each(function (i, selected) {
                    forselction[i] = $(selected).text();
                });
                self.roleNameArr.push(forselction);
                $("#roleType").empty();
                $('#btn_addSecurity').removeAttr('disabled');
            }
        }


        self.addNewRoles = function (observableModelPopup, gID) {
            var retVal = checkError();
            if (retVal == null || retVal == "") {
                addSecurityGroupDetails(self.roleNameArr, observableModelPopup, gID);
            }
        }

        //enabled add button
        $("#securityNameID").on('change keyup paste', function () {
            if ($("#securityNameID").val() != "") {
                $('#btn_addSecurity').removeAttr('disabled');
            }
        });


        $("#roleDescriptionID").on('change keyup paste', function () {
            if ($("#roleDescriptionID").val() != "") {
                $('#btn_addSecurity').removeAttr('disabled');
            }
        });

        // allow only 255 charcters in  security group name
        $("#securityNameID").on("keypress keyup paste", function (e) {
            var textMax = 255;
            var textLength = $('#securityNameID').val().length;
            var textRemaining = textMax - textLength;
        });

        // Restrict character on security name
        $('#securityNameID').keyup(function () {
            if (this.value.match(/[^a-zA-Z0-9`~!@#$&()|+\=;:.'",<>\{\}\[\]\\\-_/ ]/g)) {
                this.value = this.value.replace(/[^a-zA-Z0-9`~!@#$&()|+\=;:.'",<>\{\}\[\]\\\-_/ ]/g, '');
                return true;
            }
        });


        $('#modelAddSecGroupHeader').mouseup(function () {
            $("#modelAddSecGroup").draggable({ disabled: true });
        });

        $('#modelAddSecGroupHeader').mousedown(function () {
            $("#modelAddSecGroup").draggable({ disabled: false });
        });

        $('.chosen-choices').on('click', function () {
            $('#roleId_chosen .search-field input[type=text]').focus();
        });

        function checkError() {
            var retval = '';

            var securityName = $("input#securityNameID");
            securityName.val(securityName.val().replace(/^\s+/, ""));

            // validation for security name
            if ($("#securityNameID").val() == null || $("#securityNameID").val() == "") {
                retval += 'security name';
                self.SecurityGroupName(null);
                $("#securityNameVaidationID").text(i18n.t('enter_security_name'));
                $("#securityNameVaidationID").show();
            } else {
                retval += '';
            }

            if ($("#roleId").chosen().val() == null || $("#roleId").chosen().val() == "" || $("#roleId").chosen().val().length == 0) {
                retval += 'rolw for security';
                self.RoleName(null);
                $("#roleType").text(i18n.t('Please_assign_role_to_security_group'));
                $("#roleType").show();
            } else {
                retval += '';
            }

            return retval;
        };

        seti18nResourceData(document, resourceStorage);
    };



    //get role detils on add button click
    function getActiveRoleDetails(getRoledataArray) {
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data && data.rolesList) {
                        data.rolesList = $.parseJSON(data.rolesList);
                    }
                    getRoledataArray(data.rolesList);                
                }
            }
        }

        var method = 'GetActiveRoles';
        var params = '{"token":"' + TOKEN() + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getRoleArry(role) {
        var selectedRoleId = $("#roleId").chosen().val();
        var selectedRoleName = role[0];
        var roleNew = new Array();
        if (selectedRoleId && selectedRoleId.length > 0) {
            for (var i = 0; i < selectedRoleId.length; i++) {
                var eRole = new Object();
                eRole.RoleId = selectedRoleId[i];
                eRole.RoleName = selectedRoleName[i];
                roleNew.push(eRole);
            }
        }
        return roleNew;
    }

    function addSecurityGroupDetails(roleNameArr, observableModelPopup, gID) {

        var securityGroups = new Object();
        var description = $("#roleDescriptionID").val();
        var securityGroupName = $("#securityNameID").val();

        securityGroups.Description = description;
        securityGroups.SecurityGroupName = securityGroupName;

        var roles = getRoleArry(roleNameArr());

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'security_group_added_successfully');
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

        var method = 'AddSecurityGroup';
        var params = '{"token":"' + TOKEN() + '","securityGroups":' + JSON.stringify(securityGroups) + ',"roles":' + JSON.stringify(roles) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

});