define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "utility"], function (ko, koUtil, autho) {
    var lang = getSysLang();
    acUserSubscribedAlerts = new Array()
    selectedArr = new Array();
    var isUserProfileModified = false;

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function UserProfileViewModel() {
        var lang = getSysLang();
        var userrData = JSON.parse(sessionStorage.getItem("userrData"));
        userGuid = userrData[0].UserGuid;

        var self = this;

        IsUserProfile(true);
        IsChangePassword(false);
        self.GetUsers = ko.observable();
        self.acUserRoles = ko.observableArray();
        self.LoginName = ko.observable('');
        self.FirstName = ko.observable('');
        self.LastName = ko.observable('');
        self.Title = ko.observable('');
        self.AlertEmail = ko.observable('');
        self.ContactNumber1 = ko.observable('');
		self.ContactNumber2 = ko.observable('');
		self.RoleName = ko.observable('');

        //var customerData = JSON.parse(sessionStorage.getItem("customerData"));
        userrData = JSON.parse(sessionStorage.getItem("userrData"));
        self.IsVFSSOProfile = ko.observable(IsVFSSOUser);
        self.IsForgeRockProfile = ko.observable(IsForgeRockUser);

        self.IsVHQProfile = ko.observable(IsVHQNativeAuthentication);
        self.IsADProfile = ko.observable(IsADUser);
        self.IsADFSProfile = ko.observable(IsADFSUser);
        self.SHOW_VHQNATIVECONTROLS = ko.observable(false);
        self.IsReadOnly = ko.observable(false);
        updateComponentsOnUserAuthentication(self, 'modelUserProfile');
        ////////////////////////////////////////// Change Password //////////////////////////////////////////////////////
        fullname = userrData[0].FullName;
        userGuid = userrData[0].UserGuid;
        isCommonUser = userrData[0].IsCommonUser;
        firstName = userrData[0].LoginName;
        isCompanyNameBasedLogin = userrData[0].IsCompanyNameBasedLogin;
        enforceVHQSecurityPolicies = customerData[0].EnforceVHQSecurityPolicies;
        isPasswordChangeAllowed = customerData[0].UserPolicyInfo.IsPasswordChangeAllowed;
      
        if (isChangePasswordrequired == 1) {
            $("#closeBtn").hide();
            $("#cancelBtn").hide();
        } else {
            $("#closeBtn").show();
            $("#cancelBtn").show();
        }
        $("#changePasswordvalues").empty();
        self.enableLoginName = ko.observable(false);
        self.userName = ko.observable(firstName);
        self.oldPassword = ko.observable().extend({
            required: {
                params: true,
                message: i18n.t('enter_old_password', {
                    lng: lang
                })
            }
        });

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

        self.getConfigValue = ko.observable();
        self.enforceVHQSecurityPolicies = ko.observable(false);

        //Enable save button        
        $("#txtPasswordOld,#txtPasswordNew,#txtPasswordNewConfirm").on('change keydown paste input', function () {
            if (($("#txtPasswordOld").val() != "") && ($("#txtPasswordNew").val() != "") && ($("#txtPasswordNewConfirm").val() != "")) {
                $('#btnSaveChangePwd').prop('disabled', false);
                $('#btnSaveChangePwd').removeClass('disabled');
            } else {
                $('#btnSaveChangePwd').prop('disabled', true);
                $('#btnSaveChangePwd').addClass('disabled');
            }
        });

        //Save Password
        self.savePassword = function (observableModelUserProfile) {
            var retval = checkError(0);
            if (retval == null || retval == "") {
                if ($("#txtPasswordOld").val() != '' && $("#txtPasswordNew").val() != '' && $("#txtPasswordNewConfirm").val() != '') {
                    if ($("#txtLoginNames").val() == $("#txtPasswordNew").val()) {
                        //$("#changePasswordvalues").append(i18n.t('new_password_same_as_username'));
                        openAlertpopup(1, 'new_password_same_as_username');
                        return;
                    }
                }
                validatePassword(observableModelUserProfile);
            }
        }

        self.hideinfoOKpopup = function () {
            $("#infoExceedMaxAttemptsDiv").modal('hide');
            clearPasswordValues(self.oldPassword(), self.newPassword(), self.confirmNewPassword());
            logout(ENUM.get('NORMALLOGOUT'));
        }

        $('#mdlChangePwdHeader').mouseup(function () {
            $("#mdlChangePwd").draggable({ disabled: true });
        });

        $('#mdlChangePwdHeader').mousedown(function () {
            $("#mdlChangePwd").draggable({ disabled: false });
        });

        ////////////////////////////////////////// Change Password //////////////////////////////////////////////////////

		self.getConfigValue(passwordPolicyText);

        if (isCompanyNameBasedLogin) {
            $("#alertEmailComponent").removeClass('hide');
        } else {
            $("#alertEmailComponent").addClass('hide');
        }       
        if (koUtil.UserData() == '') {
            getUser(self.acUserRoles, self.GetUsers, koUtil.UserData);
        } else {
            var userData = koUtil.UserData().user;
			var userGroups = koUtil.UserData().userGroups;

            self.LoginName = userData ? ko.observable(userData.LoginName) : ko.observable('');
            self.FirstName = userData ? ko.observable(userData.FirstName) : ko.observable('');
            self.LastName = userData ? ko.observable(userData.LastName) : ko.observable('');
            self.Title = userData ? ko.observable(userData.Title) : ko.observable('');
            self.AlertEmail = userData ? ko.observable(userData.AlertEmail) : ko.observable('');
            self.ContactNumber1 = userData ? ko.observable(userData.ContactNumber1) : ko.observable('');
            self.ContactNumber2 = userData ? ko.observable(userData.ContactNumber2) : ko.observable('');            
			self.RoleName = userGroups ? ko.observable(userGroups[0].Role.RoleName) : ko.observable('');
        }

        function getUser(acUserRoles, GetUsers, UserData, observableModelUserProfile) {
            $("#loadingDiv").show();
            function callbackFunction(data, error) {
                $("#loadingDiv").hide();
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        GetUsers(data);

                        if (data.user) {
                            data.user = $.parseJSON(data.user);
                            $("#userfullnameId").text(data.user.FullName);
                        }
                        if (data.userGroups)
                            data.userGroups = $.parseJSON(data.userGroups);
                        if (data.userSubscribedAlerts)
                            data.userSubscribedAlerts = $.parseJSON(data.userSubscribedAlerts);
                        if (data.userHierarchies) {
                            data.userHierarchies = $.parseJSON(data.userHierarchies);
                            if (data.userHierarchies[0].HierarchyName && data.userHierarchies[0].HierarchyName != "") {
                                koUtil.hierarchyIdForScheule = data.userHierarchies[0].Id;
                                hierarchyName = data.userHierarchies[0].HierarchyName;
                                $("#lblFilter").text(hierarchyName);

                                for (i = 0; i < data.userHierarchies.length; i++) {
                                    if (data.userHierarchies[i].HierarchyName && data.userHierarchies[i].HierarchyName != "") {
                                        var row = $("<tr />")
                                        $("#itemTbodyUserHierarchies").append(row);
                                        row.append($("<td>" + data.userHierarchies[i].HierarchyName + "</td>"));
                                        row.append($("<td>" + data.userHierarchies[i].LevelName + "</td>"));
                                    }
                                }

                            } else {
                                $("#lblFilter").text("No Filter Selected.  All Devices Selected.");
                            }
                        }

                        if (isUserProfileModified) {
                            observableModelUserProfile();
							$("#deviceProfileModel").modal('hide');
                        }
                        isUserProfileModified = false;
                        userGlobalData = data;
                        UserData(data);

                        userData = userGlobalData.user;

                        self.LoginName = userData ? ko.observable(userData.LoginName) : ko.observable('');
                        self.FirstName = userData ? ko.observable(userData.FirstName) : ko.observable('');
                        self.LastName = userData ? ko.observable(userData.LastName) : ko.observable('');
                        self.Title = userData ? ko.observable(userData.Title) : ko.observable('');
                        self.AlertEmail = userData ? ko.observable(userData.AlertEmail) : ko.observable('');
                        self.ContactNumber1 = userData ? ko.observable(userData.ContactNumber1) : ko.observable('');
                        self.ContactNumber2 = userData ? ko.observable(userData.ContactNumber2) : ko.observable('');
                    }
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'GetUser';
            var params = '{"token":"' + TOKEN() + '","userGuid":"' + userGuid + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        profileFieldsValidation();

        function profileFieldsValidation() {
            if (self.SHOW_VHQNATIVECONTROLS()) {
                $("#loginNameVHQAD").prop("disabled", true);
                $("#firstNameVHQAD").prop("disabled", self.IsReadOnly());
                $("#lastNameVHQAD").prop("disabled", self.IsReadOnly());
                $("#titleOfUser").prop("disabled", self.IsReadOnly());
                $("#contactNumber1").prop("disabled", self.IsReadOnly());
                $("#contactNumber2").prop("disabled", self.IsReadOnly());
            } else if (self.IsVFSSOProfile()) {
                $("#firstNameWSO2").prop("disabled", self.IsReadOnly());
                $("#alertEmailWSO2").prop("disabled", self.IsReadOnly());
                $("#lastNameWSO2").prop("disabled", self.IsReadOnly());
            }
            else if (self.IsForgeRockProfile()) {
                $("#firstNameFR").prop("disabled", self.IsReadOnly());
                $("#lastNameFR").prop("disabled", self.IsReadOnly());
            }
            $("#btnSaveUserProfile").prop('disabled', true);
            $("#btnSaveUserProfile").addClass("disabled");
        }

        showHideChangePassword();

        function showHideChangePassword() {
            //var customerData = JSON.parse(sessionStorage.getItem("customerData"));
            userrData = JSON.parse(sessionStorage.getItem("userrData"));

            var IsCommonUser = userrData[0].IsCommonUser;
            var EnforceVHQSecurityPolicies = customerData[0].EnforceVHQSecurityPolicies;
            var IsPasswordChangeAllowed = customerData[0].UserPolicyInfo.IsPasswordChangeAllowed;

            if (self.IsADProfile() || self.IsADFSProfile()) {
                $("#changePasswordDiv").hide();
            } else {
                if ((EnforceVHQSecurityPolicies == true && IsPasswordChangeAllowed == false)) {
                    $("#changePasswordDiv").hide();
                } else {
                    $("#changePasswordDiv").show();
                }
            }
        }


        self.showChangePassword = function () {
            if (enforceVHQSecurityPolicies == true) {
                self.enforceVHQSecurityPolicies(true);
            }

            IsChangePassword(true);
            IsUserProfile(false);
            $("#titlePopup").text(i18n.t('change_pwd', { lng: lang }));
        }

        self.navigateToSSO = function () {
            var vhqURL = "#" + window.location.href.split('#')[1];
            if (window.location.href.split('#')[1] == undefined) {
                vhqURL = '';
            }
            getSSOChangePasswordUrl(vhqURL);
        }

        function getSSOChangePasswordUrl(vhqURL) {

            $("#loadingDiv").show();
            $.ajax({
                url: GetVirtualPath() + "/Home/GetSSOChangePasswordUrl",
                type: "GET",
                cache: false,
                async: false,
                data: { subPath: vhqURL },
                success: function (data) {
                    window.location = data.Path;
                    $("#loadingDiv").hide();
                },
                error: function (jqXHR, status, error) {
                    if (jqXHR != null) {
                        ajaxErrorHandler(jqXHR, status, error);
                    }
                    $("#loadingDiv").hide();
                }
            });

        }


        // allow only 50 charcters for first name
        $("#firstNameVHQAD").on("keypress keyup paste", function (e) {
            var textMax = 50;
            var textLength = $('#firstNameVHQAD').val().length;
            var textRemaining = textMax - textLength;
            mandatoryField();
        });

        // allow only 50 charcters for first name
        $("#firstNameWSO2").on("keypress keyup paste", function (e) {
            var textMax = 50;
            var textLength = $('#firstNameWSO2').val().length;
            var textRemaining = textMax - textLength;
            mandatoryField();
        });

        // allow only 20 charcters for contact number
        $("#contactNumber1").on("keypress keyup paste", function (e) {
            var textMax = 20;
            var textLength = $('#contactNumber1').val().length;
            var textRemaining = textMax - textLength;
            mandatoryField();
        });

        // allow only 255 charcters for email id
        $("#alertEmailWSO2").on("keypress keyup paste", function (e) {
            var textMax = 255;
            var textLength = $('#alertEmailWSO2').val().length;
            var textRemaining = textMax - textLength;
            mandatoryField();
        });

        // allow only 50 charcters for title
        $("#titleOfUser").on("keypress keyup paste", function (e) {
            var textMax = 50;
            var textLength = $('#titleOfUser').val().length;
            var textRemaining = textMax - textLength;
            mandatoryField();
        });

        // allow only 50 charcters in  last name
        $("#lastNameVHQAD").on("keypress keyup paste", function (e) {
            var textMax = 50;
            var textLength = $('#lastNameVHQAD').val().length;
            var textRemaining = textMax - textLength;
            mandatoryField();
        });

        // allow only 50 charcters in  last name
        $("#lastNameWSO2").on("keypress keyup paste", function (e) {
            var textMax = 50;
            var textLength = $('#lastNameWSO2').val().length;
            var textRemaining = textMax - textLength;
            mandatoryField();
        });

        // allow only 50 charcters in alternate content number
        $("#contactNumber2").on("keypress keyup paste", function (e) {
            var textMax = 20;
            var textLength = $('#contactNumber2').val().length;
            var textRemaining = textMax - textLength;
            mandatoryField();
        });


        $('#mdlUserProfileHeader').mouseup(function () {
            $("#mdlUserProfile").draggable({ disabled: true });
        });

        $('#mdlUserProfileHeader').mousedown(function () {
            $("#mdlUserProfile").draggable({ disabled: false });
        });

        /////////////////////////////////Enable/Disable button/////////////////////////////////////////
        $("#firstNameVHQAD").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#firstNameWSO2").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#firstNameFR").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#lastNameVHQAD").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#lastNameWSO2").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#lastNameFR").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#alertEmailWSO2").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#titleOfUser").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#contactNumber1").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#contactNumber2").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#alertEmailInput").on('change keyup paste', function () {
            mandatoryField();
        });
        

        $('#firstNameVHQAD').keyup(function () {
            var yourInput = $(this).val();
            re = /[`~!#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
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

        $('#lastNameVHQAD').keyup(function () {
            var yourInput = $(this).val();
            re = /[`~!#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
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


        $('#titleOfUser').keyup(function () {
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

        $('#contactNumber1').keyup(function () {
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

        $('#contactNumber2').keyup(function () {
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

        function mandatoryField() {
            if ($.trim($("#loginNameVHQAD").val()).length == 0 || $.trim($("#firstNameVHQAD").val()).length == 0 || $.trim($("#lastNameVHQAD").val()).length == 0) {
                $('#btnSaveUserProfile').prop('disabled', true);
                $("#btnSaveUserProfile").addClass("disabled");
            } else {
                if (isCompanyNameBasedLogin) {
                    var emailValue = $("#alertEmailInput").val();
                    var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
                    if (filter.test(emailValue)) {
                        if (($("#firstNameVHQAD").val()) != self.FirstName() || ($("#firstNameWSO2").val()) != self.FirstName() || ($("#lastNameVHQAD").val()) != self.LastName() ||
                                            ($("#lastNameWSO2").val()) != self.LastName() || ($("#titleOfUser").val()) != self.Title() || ($("#alertEmailInput").val()) != self.AlertEmail() || ($("#contactNumber1").val()) != self.ContactNumber1() || ($("#contactNumber2").val()) != self.ContactNumber2()) {
                            $('#btnSaveUserProfile').prop('disabled', false);
                            $("#btnSaveUserProfile").removeClass("disabled");
                        }
                    } else {
                        $('#btnSaveUserProfile').prop('disabled', true);
                        $("#btnSaveUserProfile").addClass("disabled");
                    }                  
                } else {
                    if (($("#firstNameVHQAD").val()) != self.FirstName() || ($("#firstNameWSO2").val()) != self.FirstName() || ($("#firstNameFR").val()) != self.FirstName() || ($("#lastNameVHQAD").val()) != self.LastName() ||
                        ($("#lastNameWSO2").val()) != self.LastName() || ($("#lastNameFR").val()) != self.LastName() || ($("#titleOfUser").val()) != self.Title() || ($("#alertEmailWSO2").val()) != self.AlertEmail() || ($("#contactNumber1").val()) != self.ContactNumber1() || ($("#contactNumber2").val()) != self.ContactNumber2()) {
                        $('#btnSaveUserProfile').prop('disabled', false);
                        $("#btnSaveUserProfile").removeClass("disabled");
                    }
                }               
            }
        }

        self.saveClicked = function (observableModelUserProfile) {
            var retVal = checkError();
            if (retVal == null || retVal == "") {
                setUser(self.acUserRoles, self.GetUsers, observableModelUserProfile);
            }
        }

        self.cancelUserProfile = function (observableModelUserProfile) {
            observableModelUserProfile();
            IsUserProfile(true);
            IsChangePassword(false);
        }

        self.cancelChangePassword = function () {
            IsUserProfile(true);
            IsChangePassword(false);
            clearPasswordValues(self.oldPassword, self.newPassword, self.confirmNewPassword);
            $("#titlePopup").text(i18n.t('my_profile', { lng: lang }));
        }

        function setUser(acUserRoles, GetUsers, observableModelUserProfile) {
            var alertEmail = $("#loginNameVHQAD").val();
            if (isCompanyNameBasedLogin) {               
                alertEmail = $("#alertEmailInput").val();
            }
            var retval;
            var colorTheme = "";
            var user = new Object({
                UserGuid: userGuid, FirstName: $("#firstNameVHQAD").val(), LastName: $("#lastNameVHQAD").val(), AlertEmail: alertEmail, ContactNumber1: $("#contactNumber1").val(),
                ContactNumber2: $("#contactNumber2").val(), ColorTheme: colorTheme, Title: $("#titleOfUser").val()
            });

            var alerts = new Object();
            alerts.AlertTypeId = 14;

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        isUserProfileModified = true;
                        openAlertpopup(0, 'user_profile_save_success');
                        getUser(acUserRoles, GetUsers, koUtil.UserData, observableModelUserProfile);
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_FORGEROCKUSER_NOT_UPDATED')) { //444
                        openAlertpopup(2, 'user_update_failed_in_FORGEROCK');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('ALERT_EMAIL_UNIQUE_KEY_VIOLATION')) {
                        $("#pAlert").append(i18n.t('Duplicate_Email_Id', { lng: 'en' }));
                        $("#Alermsgmodel").modal("show");
                    }
                } else if (error) {
                    $("#pAlert").append(i18n.t('network_error', { lng: 'en' }));
                    $("#Alermsgmodel").modal("show");
                }
            }

            var method = 'SetUser';
            var params = '{"token":"' + TOKEN() + '","user":' + JSON.stringify(user) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        //validation for first name and last name
        function checkError() {
            var retval = '';
            var firstName = $("input#firstNameVHQAD");
            var lastName = $("input#lastNameVHQAD");
            firstName.val(firstName.val().replace(/^\s+/, ""));
            lastName.val(lastName.val().replace(/^\s+/, ""));

            // validation for first name
            if ($("#firstNameVHQAD").val() == null || $("#firstNameVHQAD").val() == "") {
                retval += 'first name';
                openAlertpopup(1, 'Please_enter_first_name');
            } else {
                retval += '';
            }

            // validation for last name
            if ($("#lastNameVHQAD").val() == null || $("#lastNameVHQAD").val() == "") {
                retval += 'last name';
                openAlertpopup(1, 'Please_enter_last_name');
            } else {
                retval += '';
            }
            return retval;
        }

        //ValidateEmailFunction Call
        function validateEmail(emailValue) {
            var filter = /^([\w-\.]+@([\w-]+\.)+[\w-]{1,})?$/;
            if (filter.test(emailValue)) {
                return emailValue.length < 255 ? true : false;
            } else {
                return false;
            }
        }
        seti18nResourceData(document, resourceStorage);
    };

    function checkError(chekVal) {
        var retval = '';

        if ($("#txtPasswordOld").val() == "") {
            retval += 'old password';
            self.oldPassword(null);
            $("#enter_old_password").show();
        } else {
            retval += '';
        }

        if ($("#txtPasswordNew").val() == "") {
            retval += 'New passwoed';
            self.newPassword(null);
            $("#enter_new_password").show();
        } else {
            retval += '';
        }

        if ($("#txtPasswordNewConfirm").val() == "") {
            retval += 'confirm password';
            self.confirmNewPassword(null);
            $("#enter_confirm_new_password").show();
        } else {
            retval += '';
        }

        return retval;
    };

    function clearPasswordValues(oldPassword, newPassword, confirmNewPassword) {
        $("#btnSaveChangePwd").prop("disabled", true);
        $('#btnSaveChangePwd').attr('disabled');
        oldPassword("");
        newPassword("");
        confirmNewPassword("");
        $("#txtPasswordNew").prop('value', '');
        $("#txtPasswordNewConfirm").prop('value', '');
        $("#txtPasswordOld").prop('value', '');
        $("#userNameID").empty();
        $("#oldPasswordID").empty();
        $("#newPasswordID").empty();
        $("#confirmNewPasswordID").empty();
        $("#mdlChangePwd").css('left', '');
        $("#mdlChangePwd").css('top', '');

    };

    function validatePassword(observableModelUserProfile) {
        if ($("#txtPasswordNew").val() == $("#txtPasswordOld").val()) {
            openAlertpopup(1, 'new_pass_not_same_as_old');
            $('#txtPasswordOld').val('');
            $('#txtPasswordNew').val('');
            $('#txtPasswordNewConfirm').val('');
            $('#btnSaveChangePwd').prop('disabled', true);
            $('#btnSaveChangePwd').attr('disabled');
            return;
        }

        if ($("#txtPasswordNew").val() == $("#txtPasswordNewConfirm").val()) {
            setUserPassword(observableModelUserProfile);
        } else {
            openAlertpopup(1, 'passwords_entered_do_not_match');
            $('#txtPasswordOld').val('');
            $('#txtPasswordNew').val('');
            $('#txtPasswordNewConfirm').val('');
            $('#btnSaveChangePwd').prop('disabled', true);
            $('#btnSaveChangePwd').attr('disabled');
            return;
        }
    }

    function setUserPassword(observableModelUserProfile) {

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

        var encoderP1 = $.base64Encode($("#txtPasswordNew").val());
        Maxim2 = encoderP1.toString();

        var encoderP2 = $.base64Encode($("#txtPasswordOld").val());
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
                    observableModelUserProfile();
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