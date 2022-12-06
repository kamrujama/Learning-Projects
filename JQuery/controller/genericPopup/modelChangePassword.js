define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil) {
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });


    return function UserProfileViewModel() {
        userrData = JSON.parse(sessionStorage.getItem("userrData"));
        fullname = userrData[0].FullName;
        userGuid = userrData[0].UserGuid;
        isCommonUser = userrData[0].IsCommonUser;
        firstName = userrData[0].LoginName;

        enforceVHQSecurityPolicies = customerData[0].EnforceVHQSecurityPolicies;
        isPasswordChangeAllowed = customerData[0].UserPolicyInfo.IsPasswordChangeAllowed;

        var self = this;


        if (isChangePasswordrequired == 1) {
            $("#closeBtn").hide();
            $("#cancel_password").hide();
            // $("#configValueText").hide();
        } else {
            $("#closeBtn").show();
            $("#cancel_password").show();
            //   $("#configValueText").show();
        }
        $("#changePasswordvalues").empty();
        self.enableLoginName = ko.observable(false);
        self.userName = firstName;
        self.oldPassword = ko.observable().extend({
            required: {
                params: true,
                message: i18n.t('enter_old_password', {
                    lng: lang
                })
            }
        });

        self.getConfigValue = ko.observable();
        self.isEnableAddBtn = ko.observable(false);
        self.enforceVHQSecurityPolicies = ko.observable(false);

        if (enforceVHQSecurityPolicies == true) {
            self.enforceVHQSecurityPolicies(true);
            self.getConfigValue(passwordPolicyText);
        }


        self.newPassword = ko.observable().extend({
            required: {
                params: true,
                message: i18n.t('enter_new_password', {
                    lng: lang
                })
            }
        });

        self.confirmNewPassword = ko.observable().extend({
            required: {
                params: true,
                message: i18n.t('enter_confirm_new_password', {
                    lng: lang
                })
            }
        });



        //Enable save button
        //$("#txtOldPsw,#txtNewPasw,#txtConfirmPsw").on('change keydown paste input', function () {
        //    if (($("#txtOldPsw").val() != "") && ($("#txtNewPasw").val() != "") && ($("#txtConfirmPsw").val() != "")) {
        //        $('#request_password').removeAttr('disabled');
        //        $('#request_password').prop('disabled', false);
        //    } else {
        //        $('#request_password').attr('disabled');
        //        $('#request_password').prop('disabled', true);
        //    }
        //});

        //Save Password
        self.savePassword = function () {
            setUserPassword(self.cancel);
            //var retval = checkError(0);
            //if (retval == null || retval == "") {
            //    if ($("#txtOldPsw").val() != '' && $("#txtNewPasw").val() != '' && $("#txtConfirmPsw").val() != '') {
            //        if ($("#txtLoginNames").val() == $("#txtNewPasw").val()) {
            //            //$("#changePasswordvalues").append(i18n.t('new_password_same_as_username'));
            //            openAlertpopup(1, 'new_password_same_as_username');
            //            return;
            //        }
            //    }
            //    validatePassword(self.cancel);
            //    //verifyPassword(self.cancel);
            //}
        }

        self.hideinfoOKpopup = function () {
            $("#infoExceedMaxAttemptsDiv").modal('hide');
            clearPasswordValues();
            logout(ENUM.get('NORMALLOGOUT'));
        }

        $('#mdlChangePwdHeader').mouseup(function () {
            $("#mdlChangePwd").draggable({ disabled: true });
        });

        $('#mdlChangePwdHeader').mousedown(function () {
            $("#mdlChangePwd").draggable({ disabled: false });
        });

        //focus on cancel button by default
        $('#deviceProfileModel').on('shown.bs.modal', function () {
            $('#cancel_password').focus();
        })

        function checkError(chekVal) {
            var retval = '';

            if ($("#txtOldPsw").val() == "") {
                retval += 'old password';
                self.oldPassword(null);
                $("#enter_old_password").show();
            } else {
                retval += '';
            }

            if ($("#txtNewPasw").val() == "") {
                retval += 'New passwoed';
                self.newPassword(null);
                $("#enter_new_password").show();
            } else {
                retval += '';
            }

            if ($("#txtConfirmPsw").val() == "") {
                retval += 'confirm password';
                self.confirmNewPassword(null);
                $("#enter_confirm_new_password").show();
            } else {
                retval += '';
            }

            return retval;
        };

        self.changePassword = function () {
            $('#changePass').modal('show');
            $("#changePasswordvalues").empty();
        };

        self.cancel = function () {
            clearPasswordValues();
        }

        function clearPasswordValues() {
            $("#request_password").prop("disabled", true);
            self.newPassword("");
            self.oldPassword("");
            self.confirmNewPassword("");
            $("#txtNewPasw").prop('value', '');
            $("#txtConfirmPsw").prop('value', '');
            $("#txtOldPsw").prop('value', '');
            $("#userNameID").empty();
            $("#oldPasswordID").empty();
            $("#newPasswordID").empty();
            $("#confirmNewPasswordID").empty();
            $("#mdlChangePwd").css('left', '');
            $("#mdlChangePwd").css('top', '');

        };
        seti18nResourceData(document, resourceStorage);
    };

    function verifyPassword(cancel) {
        var userrData;
        var userGuid = "";
        if (sessionStorage.getItem("userrData") == null || sessionStorage.getItem("userrData") == "") {
            userGuid = "";
        } else {
            userrData = JSON.parse(sessionStorage.getItem("userrData"));
            userGuid = userrData[0].UserGuid;
        }

        var maxims = new Object();
        var guid = userGuid;

        var encoderP = $.base64Encode(guid);
        Maxim1 = encoderP.toString();

        var encoderP1 = $.base64Encode($("#txtOldPsw").val());
        Maxim2 = encoderP1.toString();

        maxims.Maxim1 = Maxim1;
        maxims.Maxim2 = Maxim2;
        $("#changePasswordvalues").empty();

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS') || data.responseStatus.StatusCode == AppConstants.get('VALID_PASSWORD')) {
                    if ($("#txtNewPasw").val() == $("#txtOldPsw").val()) {
                        //$("#changePasswordvalues").append(i18n.t('new_pass_not_same_as_old'));
                        openAlertpopup(1, 'new_pass_not_same_as_old');
                        $('#txtOldPsw').val('');
                        $('#txtNewPasw').val('');
                        $('#txtConfirmPsw').val('');
                        $('#request_password').prop('disabled', true);
                        return;
                    }

                    if ($("#txtNewPasw").val() == $("#txtConfirmPsw").val()) {
                        setUserPassword(cancel);
                    } else {
                        // $("#changePasswordvalues").append(i18n.t('passwords_entered_do_not_match'));    
                        openAlertpopup(1, 'passwords_entered_do_not_match');
                        $('#txtOldPsw').val('');
                        $('#txtNewPasw').val('');
                        $('#txtConfirmPsw').val('');
                        $('#request_password').prop('disabled', true);
                        return;
                    }
                } else if (data.responseStatus.StatusCode == AppConstants.get('PASSWORD_MISMATCH_ERROR')) {
                    // $("#changePasswordvalues").append(i18n.t('password_invalid'));
                    openAlertpopup(1, 'password_invalid');
                    $('#txtOldPsw').val('');
                    $('#txtNewPasw').val('');
                    $('#txtConfirmPsw').val('');
                    $('#request_password').prop('disabled', true);

                    return;
                } else {
                    //$("#changePasswordvalues").append(i18n.t('pass_not_set'));
                    //openAlertpopup(1, 'pass_not_set');
                    $('#txtOldPsw').val('');
                    $('#txtNewPasw').val('');
                    $('#txtConfirmPsw').val('');
                    $('#request_password').prop('disabled', true);

                }
            }
        }

        var method = 'VerifyPassword';
        var params = '{"token":"' + TOKEN() + '","maxim":' + JSON.stringify(maxims) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }

    function validatePassword(cancel) {
        if ($("#txtNewPasw").val() == $("#txtOldPsw").val()) {
            openAlertpopup(1, 'new_pass_not_same_as_old');
            $('#txtOldPsw').val('');
            $('#txtNewPasw').val('');
            $('#txtConfirmPsw').val('');
            $('#request_password').prop('disabled', true);
            return;
        }

        if ($("#txtNewPasw").val() == $("#txtConfirmPsw").val()) {
            setUserPassword(cancel);
        } else {
            openAlertpopup(1, 'passwords_entered_do_not_match');
            $('#txtOldPsw').val('');
            $('#txtNewPasw').val('');
            $('#txtConfirmPsw').val('');
            $('#request_password').prop('disabled', true);
            return;
        }
    }

    function setUserPassword(cancel) {

        var userrData;
        var userGuid = "";
        if (sessionStorage.getItem("userrData") == null || sessionStorage.getItem("userrData") == "") {
            userGuid = "";
        } else {
            userrData = JSON.parse(sessionStorage.getItem("userrData"));
            userGuid = userrData[0].UserGuid;
        }

        var maxims = new Object();
        var guid = userGuid;

        var encoderP = $.base64Encode(guid);
        Maxim1 = encoderP.toString();

        var encoderP1 = $.base64Encode($("#txtNewPasw").val());
        Maxim2 = encoderP1.toString();

        var encoderP2 = $.base64Encode($("#txtOldPsw").val());
        Maxim3 = encoderP2.toString();

        maxims.Maxim1 = Maxim1;
        maxims.Maxim2 = Maxim2;
        maxims.Maxim3 = Maxim3;

        $("#changePasswordvalues").empty();

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    $("#mdlChangePwd").css('left', '');
                    $("#mdlChangePwd").css('top', '');
                    openAlertpopup(0, 'new_pass_save_success');
                    $('#deviceProfileModel').modal('hide');
                    cancel();

                } else if (data.responseStatus.StatusCode == AppConstants.get('PASSWORD_USED_RECENTLY')) {
                    openAlertpopup(1, 'password_used_recently');
                } else if (data.responseStatus.StatusCode == AppConstants.get('EXCEED_MAX_LOGON_ATTEMPTS')) {
                    $("#infoExceedMaxAttemptsDiv").modal("show");
                    $("#infoExceedMaxAttemptsMessage").text(i18n.t('exceeded_max_login', { lng: lang }));
                } else if (data.responseStatus.StatusCode == AppConstants.get('PASSWORD_MISMATCH_ERROR')) {
                    openAlertpopup(1, 'password_invalid');
                } else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_NEWPWD')) {
                    openAlertpopup(1, 'password_provided_does_not_meet_password_complexity');
                } else if (data.responseStatus.StatusCode == AppConstants.get('E_USER_PWD_COMPLEXITY')) {
                    openAlertpopup(1, 'password_provided_does_not_meet_policy_requirements');
                } else if (data.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR')) {
                    openAlertpopup(2, 'network_error');
                }
            } else if (error) {
                $("#pAlert").append(i18n.t('network_error', { lng: 'en' }));
                $("#Alermsgmodel").modal("show");
            }
        }

        var method = 'SetUserPassword';
        var params = '{"token":"' + TOKEN() + '","maxim":' + JSON.stringify(maxims) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});