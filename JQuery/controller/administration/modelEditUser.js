var isAlertGridEnable = false;
alertSelectedCount = 0;
define(["knockout", "autho", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, autho, ADSearchUtil, koUtil) {
    var lang = getSysLang();
    uploadedfiledata = new Array();
    currentAddedUserGuid = "";
    currentTemporaryPassword = "";
    editUserGuid = "";
    isCompanyNameBasedLogin = false;
    acUserSubscribedAlerts = new Array();
    var selectedDataArr = new Array();
    gID = '';

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function AddpackageViewModel() {
        alertSelectedCount = 0;
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

        //Declare self variables
        var self = this;
        var isHierarchyAllowed = false;
        var isRolesChange = false;
        var isUserAlertsChange = false;
        self.observableHierarchy = ko.observable();
        self.modelOption = ko.observableArray();
        //Cancel Hierarchy 
        self.cancelHierarchy = function () {
            self.observableHierarchy('unloadTemplate');
            $("#hierarchyModel").modal('hide');
            repositionAdvanceSearchPopUp("mdlHierarchyContent");
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
        }

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }
        //------------------------------------------------FOCUS FOR BTN ON POP UP----------------------------------------------------------

        $('#userActivateModel').on('shown.bs.modal', function (e) {
            $('#userActivateModelBtn_No').focus();

        });

        $('#userActivateModel ').keydown(function (e) {
            if ($('#userActivateModelBtn_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#userActivateModelBtn_Yes').focus();
            }
        });

        $('#userDeleteModelChild').on('shown.bs.modal', function (e) {
            $('#userDeleteModelChild_No').focus();

        });

        $('#userDeleteModelChild').keydown(function (e) {
            if ($('#userDeleteModelChild_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#userDeleteModelChild_Yes').focus();
            }
        });

        //--------------------------------------------------------------------------------------------------------------------------------

        $('#mdlHierarchyHeader').mouseup(function () {
            $("#mdlHierarchyContent").draggable({ disabled: true });
        });

        $('#mdlHierarchyHeader').mousedown(function () {
            $("#mdlHierarchyContent").draggable({ disabled: false });
        });


        ADSearchUtil.AdScreenName = 'editUserScreen';
        self.hierarchyLevel = ko.observable();
        $("#resetPasswordBtn").hide();
        var userData = JSON.parse(sessionStorage.getItem("userrData"));
        isCompanyNameBasedLogin = userData[0].IsCompanyNameBasedLogin;
        var selectedId = getSelectedUniqueId('jqxgridUsers');
        var source = _.where(globalVariableForEditUser, { "selectedUserGuid": selectedId[0] });
        isHierarchyChange = false;
        var hierarchyLevel = source[0].selectedHierarchyLevel
        var levelNumber = _.where(heirarchyData, { "Level": hierarchyLevel });
        if (levelNumber && levelNumber.length > 0)
            self.hierarchyLevel(levelNumber[0].Name);
        self.IsCustomerBasedLogin = ko.observable(isCompanyNameBasedLogin);
        self.loginName = ko.observable(source[0].selectedLoginName);
        self.titleValue = ko.observable(source[0].selectedTitle);
        self.primaryPhone = ko.observable(source[0].selectedPrimaryPhone);
        self.alternatePhone = ko.observable(source[0].selectedalternatePhone);
        editUserGuid = source[0].selectedUserGuid;

        self.isEnableAddBtn = ko.observable(false);
        self.test = ko.observable();

        var loginNameText = source[0].selectedLoginName;
        //Set header
        $("#editUserLabel").text(i18n.t('edit_user_text', { loginNameText: loginNameText }, { lng: lang }));

        self.IsVFSSOProfile = ko.observable(IsVFSSOUser);
        self.IsForgeRockProfile = ko.observable(IsForgeRockUser);
        self.IsVHQProfile = ko.observable(IsVHQAuthorizedUser);
        self.IsADProfile = ko.observable(IsADUser);
        self.IsADFSProfile = ko.observable(IsADFSUser);

        //Show or Hide Components for VHQNATIVE,AD and ADFS
        self.SHOW_VHQNATIVECONTROLS = ko.observable(false);

        //enable or disable Componets for VHQ Authenticated or Authorized users
        self.IsReadOnly = ko.observable(false);

        updateComponentsOnUserAuthentication(self, 'modelEditUser');
        if ((licenseSource.isBasicAlertsLicensed || licenseSource.isAdvanceAlertsLicensed) && licenseSource.isNotificationsLicensed) {
            if (self.SHOW_VHQNATIVECONTROLS() === true) {
                $("#userAlertsDiv").show();
            } else if (self.IsVFSSOProfile() === true) {
                $("#userAlertsLabelVFSSO").show();
                $("#userAlertsDivVFSSO").show();
            }
            else if (self.IsForgeRockProfile() === true) {
                $("#userAlertsLabelFR").show();
                $("#userAlertsDivFR").show();
            }
        }
        var loggedinUserGuid = userData[0].UserGuid;

        if (IsVFSSOUser) {
            gID = 'jqxgridAlertVFSSO';
        } else if (IsForgeRockUser) {
            gID = 'jqxgridAlertFR';
        }
        else {
            gID = 'jqxgridAlertVHQAD';
        }

        //Alert rights
        function checkRightsForAlert() {
            var retval = autho.checkRightsBYScreen('Alerts', 'IsModifyAllowed');
            isAlertGridEnable = retval;
        }

        userFieldsValidation();

        function userFieldsValidation() {
            $("#loginName").prop("disabled", true);
            $("#firstName").prop("disabled", self.IsReadOnly());
            $("#lastName").prop("disabled", self.IsReadOnly());
            $("#title").prop("disabled", self.IsReadOnly());
            $("#emailId").prop("disabled", true);
            $("#primaryPh").prop("disabled", self.IsReadOnly());
            $("#alternatePh").prop("disabled", self.IsReadOnly());
            checkRightsForAlert();
            checkRightsForResetPwd();
        }
        function validateUserDetails() {
            if ($("#loginName").val() != source[0].selectedLoginName || $("#firstName").val() != source[0].selectedFirstName || $("#lastName").val() != source[0].selectedLastName ||
                $("#title").val() != source[0].selectedTitle || $("#emailId").val() != source[0].selectedEmailId || $("#primaryPh").val() != source[0].selectedPrimaryPhone ||
                $("#alternatePh").val() != source[0].selectedalternatePhone) {
                return true;
            } else {
                return false;
            }
        }
        function validateUserAlerts() {
            var selecteItemIds = getSelectedUniqueId(gID);
            var isAlertsUpdated = false;
            if (selecteItemIds.length == acUserSubscribedAlerts.length) {
                for (var i = 0; i < selecteItemIds.length; i++) {
                    var source = _.where(acUserSubscribedAlerts, { "AlertTypeId": selecteItemIds[i] })
                    if (source == '') {
                        isAlertsUpdated = true;
                    }
                }
            } else {
                isAlertsUpdated = true;
            }
            return isAlertsUpdated;
        }
        //Enable/Dsable depend on status
        $("#roleSetdiv").hide();
        $("#rolesEditDropdown").hide();
        //"#lblNote").show();
        $("#rolesList").show();

        if (self.IsVHQProfile() || self.IsVFSSOProfile() || self.IsForgeRockProfile()) {
            //$("#editLabelSection").css("opacity", 10);
            //$("#levelDiv").css("opacity", 10);
            //$("#valueDiv").css("opacity", 10);
            $("#hierarchyBtnDiv").css("opacity", 10);
            $("#selectHierarchyBtn").prop("disabled", false);
            $("#saveBtn").show();
            $("#activateBtn").hide();
            if (isAlertGridEnable) {
                $("#" + gID).prop("disabled", false);
                $("#" + gID).removeClass('disabled');
            } else {
                $("#" + gID).prop("disabled", true);
                $("#" + gID).addClass('disabled');
            }

            if (source[0].selectedStatus == "Inactive") {
                $("#firstName").prop("disabled", true);
                $("#lastName").prop("disabled", true);
                $("#title").prop("disabled", true);
                $("#emailId").prop("disabled", true);
                $("#primaryPh").prop("disabled", true);
                $("#alternatePh").prop("disabled", true);
                $("#hierarchyBtnDiv").css("opacity", 0.4);
                $("#selectHierarchyBtn").prop("disabled", true);
                $("#" + gID).prop("disabled", true);
                $("#" + gID).addClass('disabled');
                $("#saveBtn").hide();
                $("#activateBtn").show();
            }
        } else {
            //$("#editLabelSection").css("opacity", 0.4);
            //$("#levelDiv").css("opacity", 0.4);
            //$("#valueDiv").css("opacity", 0.4);
            $("#hierarchyBtnDiv").css("opacity", 0.4);
            $("#activateBtn").hide();
        }
        if (source[0].selectedStatus == "Active") {
            if (self.IsADProfile() || self.IsADFSProfile()) {
                isHierarchyAllowed = !IsHierarchyAccessViaADFS;
            } else {
                isHierarchyAllowed = true;
            }

            $("#selectHierarchyBtn").prop("disabled", !isHierarchyAllowed);
            if (isHierarchyAllowed)
                $("#hierarchyBtnDiv").css("opacity", 10);
        }

        //Check rights for reset button
        function checkRightsForResetPwd() {
            var retval = autho.checkRightsBYScreen('Roles and Users', 'IsModifyAllowed');
            if (retval == true && source[0].selectedStatus == "Active") {
                if (IsExternalIdp || IsADUser) {
                    $("#resetPasswordBtn").hide();
                } else {
                    $("#resetPasswordBtn").show();
                }
            } else {
                $("#resetPasswordBtn").hide();
            }
        }

        //Popup open
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        var modelname = 'unloadTemplate';
        loadHierarchy(modelname, 'genericPopup');

        //For Hierarchy
        //var modelname = 'unloadTemplate';
        //loadHierarchy(modelname, 'genericPopup');

        self.RoleName = ko.observable();
        self.roleNameArr = ko.observableArray();

        //Open alert grid
        self.alertData = ko.observableArray();
        self.acUserRoles = ko.observableArray();
        self.acUserHierarchies = ko.observableArray();
        originalUserHierarchies = new Array();
        modelReposition();
        self.openPopup = function (popupName, gId, status) {
            self.templateFlag(true);
            if (popupName == "modelEditHierarchy") {
                heirarchyGlobalCheck = 0;
                hierarchyforuser = 1;
                loadelement(popupName, 'device');
                $('#deviceModel').modal('show');
            } else if (popupName == "modalHierarchy") {
                if (self.acUserHierarchies() != null && self.acUserHierarchies().length > 0) {
                    //ADSearchUtil.HierarchyPathArr.removeAll();
                    ADSearchUtil.HierarchyPathArr(self.acUserHierarchies());
                }
                loadHierarchy('modalHierarchy', 'genericPopup');
                $('#hierarchyModel').modal('show');
            }
        }


        //unload hierarchy popup
        self.unloadHierarchy = function () {
            self.observableHierarchy('unloadTemplate');
        }

        function loadHierarchy(elementname, controllerId) {

            if (!ko.components.isRegistered(elementname)) {
                //new template code
                var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
                var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
                ko.components.register(elementname, {
                    viewModel: { require: ViewName },
                    template: { require: 'plugin/text!' + htmlName }
                });
            }
            self.observableHierarchy(elementname);
        }



        //Load popup
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

        //cancel operation
        self.cancelClick = function (observableModelPopup) {
            observableModelPopup('unloadTemplate');
            $('#usersModel').hide();
            $('#userMainScreen').show();
            koUtil.hierarchiesForAdd.removeAll();
        }

        /////////////////////////////////Enable/Disable button/////////////////////////////////////////        
        $("#firstName").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#lastName").on('change keyup paste', function () {
            mandatoryField();
        });


        $("#emailId").on('change keyup paste', function () {
            mandatoryField();
        });



        $("#editRoleTypeId").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#title").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#primaryPh").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#alternatePh").on('change keyup paste', function () {
            mandatoryField();
        });


        $('#firstName').keyup(function () {
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

        $('#lastName').keyup(function () {
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


        $('#title').keyup(function () {
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

        $('#primaryPh').keyup(function () {
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

        $('#alternatePh').keyup(function () {
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

        $('.chosen-choices').on('click', function () {
            $('#editRoleTypeId_chosen .search-field input[type=text]').focus();
        });

        function mandatoryField() {
            if (isCompanyNameBasedLogin) {
                if ($.trim($("#loginName").val()).length == 0 || $.trim($("#firstName").val()).length == 0 || $.trim($("#lastName").val()).length == 0 || $.trim($("#emailId").val()).length == 0 ||
                    !validateEmail($("#emailId").val()) || ($("#rolesEditDropdown").is(':visible') && $("#editRoleTypeId").val() == null)) {
                    $('#saveBtn').prop('disabled', true);
                } else {
                    $('#saveBtn').prop('disabled', false);
                }
            } else {
                if ($.trim($("#loginName").val()).length == 0 || $.trim($("#firstName").val()).length == 0 || $.trim($("#lastName").val()).length == 0 ||
                    ($("#rolesEditDropdown").is(':visible') && $("#editRoleTypeId").val() == null)) {
                    $('#saveBtn').prop('disabled', true);
                } else {
                    $('#saveBtn').prop('disabled', false);
                }
            }
        }

        self.getEditActiveRolesArray = ko.observableArray();

        function getActiveRoles(getEditActiveRolesArray) {
            // $("#loadingDiv").show();
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data && data.rolesList) {
                            data.rolesList = $.parseJSON(data.rolesList);
                        }
                        //$("#loadingDiv").hide();
                        getEditActiveRolesArray(data.rolesList);
                    }
                }
                if (error) {
                    retval = "";
                }
                //$("#loadingDiv").hide();
            }

            var method = 'GetActiveRoles';
            var params = '{"token":"' + TOKEN() + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        self.onChangeRole = function () {
            if ($("#editRoleTypeId").chosen().val() == null || $("#editRoleTypeId").chosen().val() == "" || $("#editRoleTypeId").chosen().val().length == 0) {
                self.RoleName(null);
                $("#please_select_model").show();
                $("#editRoleType").append(i18n.t('please_select_role'));
                $('#saveBtn').prop('disabled', true);
            } else {
                self.roleNameArr([]);
                $('#editRoleTypeId :selected').each(function (i, selected) {
                    var forselction = new Object();
                    forselction.name = $(selected).text();
                    self.roleNameArr.push(forselction);
                    isRolesChange = true;
                });

                $("#editRoleType").empty();
                if (self.acUserHierarchies().length == 0 && koUtil.hierarchiesForAdd().length == 0) {
                    $('#saveBtn').prop('disabled', true);
                    return;
                }
                $('#saveBtn').prop('disabled', false);
            }
        }

        ///validation on edit user
        self.firstName = ko.observable(source[0].selectedFirstName).extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_first_name', {
                    lng: lang
                })
            }
        });
        self.lastName = ko.observable(source[0].selectedLastName).extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_last_name', {
                    lng: lang
                })
            }
        });

        self.emailValue = ko.observable(source[0].selectedEmailId).extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_valid_Email_ID', {
                    lng: lang
                })
            }
        });

        //self.hierarchyName = ko.observable(source[0].selectedHierarchyName).extend({
        //    required: {
        //        params: true,
        //        message: i18n.t('Please_assign_hierarchy', {
        //            lng: lang
        //        })
        //    }
        //});


        self.RoleName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_assign_role_for_the_user', {
                    lng: lang
                })
            }
        });

        self.enableAddBtnFunction = function () {
            self.isEnableAddBtn(true);
        }

        $("#validatePackageType").hide();

        function validateEmail(emailValue) {
            var filter = /^([\w-\.]+@([\w-]+\.)+[\w-]{1,})?$/;
            if (filter.test(emailValue)) {
                return emailValue.length < 255 ? true : false;
            } else {
                return false;
            }
        }

        function checkerror() {
            var retval = '';

            var firstName = $("input#firstName");
            var lastName = $("input#lastName");
            var loginName = $("input#loginName");
            var emailId = $("input#emailId");

            firstName.val(firstName.val().replace(/^\s+/, ""));
            lastName.val(lastName.val().replace(/^\s+/, ""));
            loginName.val(loginName.val().replace(/^\s+/, ""));
            emailId.val(emailId.val().replace(/^\s+/, ""));

            if ($("#firstName").val() == "") {
                retval += 'first name';
                self.firstName(null);
                $("#Please_enter_first_name").show();
            } else {
                retval += '';
            }

            if ($("#lastName").val() == "") {
                retval += 'last name';
                self.lastName(null);
                $("#Please_enter_last_name").show();
            } else {
                retval += '';
            }

            if (isHierarchyChange == true) {
                if (koUtil.hierarchiesForAdd().length == 0) {
                    retval += 'hierarchy';
                    openAlertpopup(1, 'Please_assign_hierarchy');
                } else {
                    retval += '';
                }
            }

            $("#editRoleType").empty();

            if ($("#editRoleTypeId").find('option:selected').text() == "Select Roles") {
                retval += 'roles';
                self.modelOption(null);
                $("#Please_assign_role_for_the_user").show();
                $("#editRoleType").show();
                $("#editRoleType").append(i18n.t('Please_assign_role_for_the_user'));
            } else {
                retval += '';
                $("#editRoleType").empty();
            }

            return retval;
        };


        //Fething roles, alerts and hierarchies of selected users

        getUser(self.acUserRoles, self.alertData, self.acUserHierarchies, self.IsVFSSOProfile(), false);
        $("#loadingDiv").show();


        function getUser(acUserRoles, alertData, acUserHierarchies, IsVFSSOProfile, isLoggedInUser) {
            $("#loadingDiv").hide();
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.user)
                            data.user = $.parseJSON(data.user);
                        if (data.userGroups)
                            data.userGroups = $.parseJSON(data.userGroups);
                        if (data.userHierarchies)
                            data.userHierarchies = $.parseJSON(data.userHierarchies);
                        if (data.userSubscribedAlerts)
                            data.userSubscribedAlerts = $.parseJSON(data.userSubscribedAlerts);

                        if (isLoggedInUser) {
                            koUtil.UserData(data);
                            return;
                        }

                        acUserSubscribedAlerts = data.userSubscribedAlerts;
                        acUserRoles(data.userGroups);
                        var assignedRoles = new Array();
                        if (acUserRoles() != null && acUserRoles().length > 0) {
                            for (var i = 0; i < acUserRoles().length; i++) {
                                assignedRoles.push(acUserRoles()[i].Role.RoleId);
                            }
                            self.modelOption = ko.observableArray(assignedRoles);
                            $("#editRoleType").empty();
                            var setEditRoleFunction = function () {
                                $("#editRoleTypeId").val(self.modelOption());
                                $("#editRoleTypeId").trigger("chosen:updated");
                                //$('#saveBtn').removeAttr('disabled');
                            }
                            setTimeout(setEditRoleFunction, 1000);
                        }
                        if (data.userHierarchies && data.userHierarchies.length > 0) {
                            for (var i = 0; i < data.userHierarchies.length; i++) {
                                var Hierarchy = new Object();
                                Hierarchy.HierarchyId = data.userHierarchies[i].Id;
                                Hierarchy.HierarchyName = data.userHierarchies[i].HierarchyName;
                                Hierarchy.HierarchyFullPath = data.userHierarchies[i].HierarchyFullPath;
                                Hierarchy.IncludeChildren = data.userHierarchies[i].IsChildExists;
                                Hierarchy.IsChildExists = data.userHierarchies[i].IsChildExists;
                                Hierarchy.Level = data.userHierarchies[i].Level;
                                Hierarchy.LevelName = data.userHierarchies[i].LevelName;
                                Hierarchy.ParentId = data.ParentId;
                                acUserHierarchies.push(Hierarchy);
                                originalUserHierarchies.push(data.userHierarchies[i]);
                            }
                        }

                        if (IsVHQAuthorizedUser) {
                            if (source[0].selectedStatus == "Active") {
                                $("#roleSetdiv").show();
                                $("#rolesEditDropdown").show();
                                //"#lblNote").hide();
                                $("#rolesList").hide();
                                getActiveRoles(self.getEditActiveRolesArray);
                            }
                            else {
                                $("#roleSetdiv").hide();
                                $("#rolesEditDropdown").hide();
                                //"#lblNote").hide();
                                $("#rolesList").show();
                            }
                        }
                        else {
                            $("#roleSetdiv").hide();
                            $("#rolesEditDropdown").hide();
                            //$("#lblNote").show();
                            $("#rolesList").show();
                        }

                        getAlertDetails(alertData, acUserSubscribedAlerts, IsVFSSOProfile);
                    }
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'GetUser';
            var params = '{"token":"' + TOKEN() + '","userGuid":"' + editUserGuid + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);

        }

        //Edit user button click
        self.editUser = function (observableModelPopup) {
            if (!IsHierarchyAccessViaADFS && self.acUserHierarchies().length == 0 && koUtil.hierarchiesForAdd().length == 0) {
                openAlertpopup(1, 'Please_assign_hierarchy');
                return;
            }

            if (self.modelOption() == undefined || (self.modelOption().length == 0 && self.roleNameArr().length == 0)) {
                openAlertpopup(1, 'Please_assign_role_for_the_user');
                return;
            }

            var retval = checkerror();
            if (retval == null || retval == "") {
                $("#loadingDiv").show();
                isUserInfoChanged = validateUserDetails();
                isUserAlertsChange = validateUserAlerts();
                if (isUserInfoChanged) {
                    self.editUserClick(observableModelPopup, 'jqxgridUsers');
                }
                if (isUserAlertsChange) {
                    self.setUserAlert(observableModelPopup);
                }
                if (isHierarchyChange) {
                    self.setUserHierarchy(observableModelPopup);
                }
                if (isRolesChange) {
                    addUsersToRole(self.roleNameArr(), self.getEditActiveRolesArray(), observableModelPopup);
                }
            }
        }
        function loadEditUsers(observableModelPopup, isActivate) {
            gridFilterClear('jqxgridUsers');
            observableModelPopup('unloadTemplate');
            $('#usersModel').hide();
            $('#userMainScreen').show();
            if (loggedinUserGuid == editUserGuid) {
                getUser(self.acUserRoles, self.alertData, self.acUserHierarchies, self.IsVFSSOProfile(), true);
            }
            if (isActivate) {
                openAlertpopup(0, 'User_Activated_successfully');
            } else {
                openAlertpopup(0, 'User_Changes_successfully');
            }
        }
        //Set User
        self.editUserClick = function (observableModelPopup, gridId) {
            var currentDate = moment().format('MM-DD-YYYY');
            var newUserObject = new Object();
            newUserObject.LoginName = self.loginName();
            newUserObject.FirstName = $("#firstName").val();
            newUserObject.LastName = $("#lastName").val();
            newUserObject.AlertEmail = self.emailValue();
            newUserObject.ContactNumber1 = $("#primaryPh").val();
            newUserObject.ContactNumber2 = $("#alternatePh").val();
            newUserObject.Title = $("#title").val();
            newUserObject.ColorTheme = "";
            newUserObject.UserGuid = editUserGuid;
            newUserObject.LastFailedLoginDate = CreatJSONDateLocal(currentDate, LONG_DATETIME_FORMAT);
            newUserObject.LastLoginDate = CreatJSONDateLocal(currentDate, LONG_DATETIME_FORMAT);
            newUserObject.RowInsertedDate = CreatJSONDateLocal(currentDate, LONG_DATETIME_FORMAT);
            newUserObject.RowUpdatedDate = CreatJSONDateLocal(currentDate, LONG_DATETIME_FORMAT);
            newUserObject.PasswordExpirationDate = CreatJSONDateLocal(currentDate, LONG_DATETIME_FORMAT);
            IspasswordChangeRequired = true;
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (!isUserAlertsChange && !isRolesChange && !isHierarchyChange) {
                            loadEditUsers(observableModelPopup, false);
                        }
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_WSO2USER_NOTUPDATED')) { //296
                        openAlertpopup(2, 'user_update_failed_in_WSO2');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_USER_NOT_UPDATED')) { //299
                        openAlertpopup(2, 'user_update_failed');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_FORGEROCKUSER_NOT_UPDATED')) { //444
                        openAlertpopup(2, 'user_update_failed_in_FORGEROCK');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR')) { //112
                        openAlertpopup(2, 'internal_error_api');
                    } else {
                        openAlertpopup(1, data.responseStatus.StatusMessage);
                    }
                    $("#loadingDiv").hide();
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'SetUser';
            var params = '{"token":"' + TOKEN() + '","user":' + JSON.stringify(newUserObject) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);

        }

        self.setUserAlertClick = function (observableModelPopup) {
            if (self.acUserHierarchies().length == 0 && koUtil.hierarchiesForAdd().length == 0) {
                if (self.modelOption() == undefined || (self.modelOption().length == 0 && self.roleNameArr().length == 0)) {
                    openAlertpopup(1, 'Please_assign_hierarchy_role_for_the_user');
                    $("#hierarchyBtnDiv").css("opacity", 10);
                    $("#selectHierarchyBtn").prop("disabled", false);

                    $("#roleSetdiv").show();
                    $("#rolesEditDropdown").show();
                    $("#rolesList").hide();
                    getActiveRoles(self.getEditActiveRolesArray);
                    return;
                }
                openAlertpopup(1, 'Please_assign_hierarchy');
                $("#hierarchyBtnDiv").css("opacity", 10);
                $("#selectHierarchyBtn").prop("disabled", false);
                return;
            }

            if (self.modelOption() == undefined || (self.modelOption().length == 0 && self.roleNameArr().length == 0)) {
                openAlertpopup(1, 'Please_assign_role_for_the_user');
                $("#roleSetdiv").show();
                $("#rolesEditDropdown").show();
                $("#rolesList").hide();
                getActiveRoles(self.getEditActiveRolesArray);
                return;
            }

            $('#userActivateModel').modal('show');
            var loginName = source[0].selectedLoginName;
            $("#activate").text(i18n.t('activate_user_alert', { loginName: loginName }, { lng: lang }));
        }

        //set alerts to user
        self.setUserAlert = function (observableModelPopup) {
            if (isAlertGridEnable == true) {
                var selecteItemIds = getSelectedUniqueId(gID);
                var alerts = new Array();

                for (var i = 0; i < selecteItemIds.length; i++) {
                    var EAlertType = new Object();
                    EAlertType.AlertTypeId = selecteItemIds[i];
                    var source = _.where(alerts, { AlertTypeId: parseInt(selecteItemIds[i]) })
                    if (source == '') {
                        alerts.push(EAlertType);
                    }
                }

                var isStatusChanged = false;
                function callbackFunction(data, error) {
                    if (data) {
                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                            if (!isRolesChange && !isHierarchyChange) {
                                loadEditUsers(observableModelPopup, false);
                            } else if (isActivate) {
                                $('#userActivateModel').modal('hide');
                                loadEditUsers(observableModelPopup, false);
                            }
                        } else if (data.responseStatus.StatusCode != AppConstants.get('SUCCESS')) {
                            // openAlertpopup(2, 'please_provide_email_subscribe');
                        }
                        $("#loadingDiv").hide();
                    }
                    if (error) {
                        retval = "";
                    }
                }
                var method = 'SetUserAlerts';
                var params = '{"token":"' + TOKEN() + '","userGuid":"' + editUserGuid + '","alerts":' + JSON.stringify(alerts) + '}';
                ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
            }
        }

        //Confirmation delete cllick
        self.activateUser = function (observableModelPopup) {
            var selectedActivateIds = [];
            selectedActivateIds.push(editUserGuid);
            var activateDeactivateUsersReq = new Object();
            var selector = new Object();
            selector.SelectedItemIds = selectedActivateIds;
            selector.UnSelectedItemIds = null;
            activateDeactivateUsersReq.IncludeInternal = false;
            activateDeactivateUsersReq.Selector = selector;
            activateDeactivateUsersReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
            function callbackFunction(data, error) {
                if (data) {

                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        $('#userActivateModel').modal('hide');
                        loadEditUsers(observableModelPopup, true);
                    }
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'ActivateDeactivateUsers';
            var params = '{"token":"' + TOKEN() + '","activateDeactivateUsersReq":' + JSON.stringify(activateDeactivateUsersReq) + ',"isActive":"' + true + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }
        //Cancel reset
        self.cancelReset = function () {
            $('#userDeleteModelChild').modal('hide');
            $('#userActivateModel').modal('hide');
        }

        //Reset password of user
        self.resetPasswordClick = function (gId) {
            $('#userDeleteModelChild').modal('show');
            $("#resetPassword").text(i18n.t('are_you_sure_reset_password', { lng: lang }));
        }

        //Reset password API call
        self.resetPasswordCall = function () {
            $("#loadingDiv").show();
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        $('#userDeleteModelChild').modal('hide');
                        if (data.temporaryPassword == "") {
                            openAlertpopup(1, 'email_with_temp_send_to_registerd');
                        }
                        else {
                            var tempPassword = data.temporaryPassword;
                            openAlertpopup(1, i18n.t('temp_pass', { tempPassword: tempPassword }, { lng: lang }));
                        }
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_USER_PWD_CANNOT_BE_CHANGED')) {
                        openAlertpopup(2, 'user_password_cannot_be_changed');
                    }
                }
                if (error) {
                    retval = "";
                }
                $("#loadingDiv").hide();
                $('#userDeleteModelChild').modal('hide');
            }

            var method = 'ResetUserPassword';
            var params = '{"token":"' + TOKEN() + '","userGuid":' + JSON.stringify(editUserGuid) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        //Set hiearchy to user
        self.setUserHierarchy = function (observableModelPopup) {
            var hierarchies = koUtil.hierarchiesForAdd();
            var userHierarchies = new Array();
            var assignedHierarchies = new Array();
            var unAssignedHierarchies = new Array();

            for (var i = 0; i < hierarchies.length; i++) {
                var Hierarchy = new Object();
                Hierarchy.Id = hierarchies[i].HierarchyId;
                Hierarchy.HierarchyName = hierarchies[i].HierarchyName;
                userHierarchies.push(Hierarchy);
            }

            //setUserHierarchiesReq.userGuid = currentAddedUserGuid;

            var isExistingInOriginal = false;
            var isExistingInCurrent = false;

            for (var i = 0; i < userHierarchies.length; i++) {
                isExistingInOriginal = false;

                for (var j = 0; j < originalUserHierarchies.length; j++) {
                    if (userHierarchies[i].Id == originalUserHierarchies[j].Id) {
                        isExistingInOriginal = true;
                    }
                }

                if (isExistingInOriginal == false) {
                    assignedHierarchies.push(userHierarchies[i]);
                }
            }

            for (var i = 0; i < originalUserHierarchies.length; i++) {
                isExistingInCurrent = false;

                for (var j = 0; j < userHierarchies.length; j++) {
                    if (originalUserHierarchies[i].Id == userHierarchies[j].Id) {
                        isExistingInCurrent = true;
                    }
                }

                if (isExistingInCurrent == false) {
                    var Hierarchy = new Object();
                    Hierarchy.Id = originalUserHierarchies[i].Id;
                    Hierarchy.HierarchyName = originalUserHierarchies[i].HierarchyName;
                    unAssignedHierarchies.push(Hierarchy);
                }
            }



            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        ADSearchUtil.HierarchyPathArr.removeAll();
                        koUtil.hierarchiesForAdd.removeAll();
                        if (!isRolesChange) {
                            loadEditUsers(observableModelPopup, false);
                        }
                    }
                    $("#loadingDiv").hide();
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'SetUserHierarchies';
            var params = '{"token":"' + TOKEN() + '", "userGuid":' + JSON.stringify(editUserGuid) + ', "assignedHierarchies":' + JSON.stringify(assignedHierarchies) + ', "unAssignedHierarchies":' + JSON.stringify(unAssignedHierarchies) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        //GetActive roles data
        function getRolesArray(roles, getEditActiveRolesArray) {
            var activeRoleArray = new Array();
            for (j = 0; j < roles.length; j++) {
                var name = roles[j].name;
                var source = _.where(getEditActiveRolesArray, { "RoleName": name })
                if (source != '') {
                    var roleObj = new Object();
                    roleObj.RoleDescription = source[0].Description;
                    roleObj.RoleId = source[0].RoleId;
                    roleObj.RoleName = source[0].RoleName;
                    activeRoleArray.push(roleObj)
                }
            }
            return activeRoleArray;
        }

        //Adding roles to user
        function addUsersToRole(roleNameArr, getEditActiveRolesArray, observableModelPopup) {
            var user = new Object();
            var role = new Object();
            var arrAssignedUsers = new Array();
            var arrAssignedRoles = new Array();

            user.UserGuid = editUserGuid;
            user.LoginName = self.loginName();
            user.FirstName = $("#firstName").val();
            user.LastName = $("#lastName").val();
            arrAssignedUsers.push(user);

            var roleArray = getRolesArray(roleNameArr, getEditActiveRolesArray);
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        loadEditUsers(observableModelPopup, false);
                    }
                    $("#loadingDiv").hide();
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'AddUsersToRole';
            var params = '{"token":"' + TOKEN() + '","users":' + JSON.stringify(arrAssignedUsers) + ', "roles":' + JSON.stringify(roleArray) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        seti18nResourceData(document, resourceStorage);
    };

    //Fetching alerts of users
    function alertGrid(gId, alertData, acUserSubscribedAlerts, IsVFSSOProfile) {

        for (var j = 0; j < acUserSubscribedAlerts.length; j++) {
            alertSelectedCount = alertSelectedCount + 1
        }
        var gridStorageArr = new Array();
        var gridStorageObj = new Object();

        gridStorageObj.checkAllFlag = 0;
        gridStorageObj.counter = acUserSubscribedAlerts.length;
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
        window.sessionStorage.setItem(gId + 'gridStorage', gridStorage);
        var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));

        // prepare the data

        var source =
        {
            dataType: "local",
            localdata: alertData,
            dataFields: [
                { name: 'isSelected', type: 'number' },
                { name: 'AlertName', map: 'AlertName' },
                { name: 'Severity', map: 'Severity' },
                { name: 'IsEnabled', map: 'IsEnabled' },
                { name: 'AlertTypeId', map: 'AlertTypeId' },
                { name: 'IsSeverityApplicable', map: 'IsSeverityApplicable' }

            ],

        };

        var severityRenderer = function (row, columnfield, value, defaulthtml, columnproperties, event) {

            var isSeverityApplicable = $("#" + gID).jqxGrid('getcellvalue', row, 'IsSeverityApplicable');

            if (isSeverityApplicable == "true") {
                if (value == "High") {
                    return '<div style="padding-left:5px;padding-top:0px;"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg high_Severity"></div></a>' + value + '</div>';
                } else if (value == "Medium") {
                    return '<div style="padding-left:5px;padding-top:0px;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Medium_severity"></div></a>' + value + '</div>';
                } if (value == "Low") {
                    return '<div style="padding-left:5px;padding-top:0px;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Low_severity"></div></a>' + value + '</div>';
                }
            }
            else {
                return '<div style="padding-left:35px; padding-top:7px;" disabled="disabled">' + "Not Applicable" + '</div>';
            }
        }

        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gId);
        }

        var buildFilterPanelMultiChoice = function (filterPanel, datafield, checkArr) {
            multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gId, checkArr);
        }

        var dataAdapter = new $.jqx.dataAdapter(source);

        var rendered = function (element) {
            enableUiGridFunctions(gId, 'AlertTypeId', element, gridStorage, true);
            return true;
        }

        $("#" + gID).jqxGrid(
            {
                width: IsVFSSOProfile ? "99%" : "49%",
                height: IsVFSSOProfile ? "450px" : "300px",
                source: dataAdapter,
                sortable: true,
                filterable: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                altrows: true,
                pageSize: alertData.length,
                autoshowcolumnsmenubutton: false,
                rowsheight: 32,
                showsortmenuitems: false,
                enabletooltips: true,
                editable: true,
                columnsResize: true,
                columns: [
                    {
                        text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    {
                        text: '', dataField: 'AlertTypeId', hidden: true, editable: false, width: 'auto'
                    },
                    {
                        text: i18n.t('alert_Name_EditUser', { lng: lang }), datafield: 'AlertName', editable: false, width: 'auto', minwidth: 250, filterable: false, menu: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                    {
                        text: i18n.t('Severity_EditUser', { lng: lang }), datafield: 'Severity', resizable: false, editable: false, enabletooltips: false, width: 'auto', minwidth: 250, filterable: false, menu: false,
                        cellsrenderer: severityRenderer, filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                ]
            });




        var arr = alertData;
        for (i = 0; i < arr.length; i++) {
            var id = parseInt(arr[i].AlertTypeId);
            var source = _.where(acUserSubscribedAlerts, { "AlertTypeId": id })
            if (source != '') {
                gridStorage[0].selectedDataArr.push(id);
                $("#" + gID).jqxGrid('setcellvalue', i, 'isSelected', 1);
            }
            //
        }
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);
        var datainfo = $("#" + gID).jqxGrid('getdatainformation');
        if (datainfo.rowscount == acUserSubscribedAlerts.length) {
            $("#" + gID).find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-checked');
        } else if (acUserSubscribedAlerts.length == 0) {
            $("#" + gID).find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-checked');
            $("#" + gID).find('.jqx-grid-column-header:first').find('span').removeClass('partial-selection');
        } else if (datainfo.rowscount > acUserSubscribedAlerts.length) {
            $("#" + gID).find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-checked');
            $("#" + gID).find('.jqx-grid-column-header:first').find('span').addClass('partial-selection');
        }

        $("#" + gId).on('cellbeginedit', function (event) {
            var args = event.args;
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (args.value) {
                alertSelectedCount = alertSelectedCount - 1;
            } else {
                $("#" + gId).jqxGrid('setcellvalue', args.rowindex, 'isSelected', 1);
                alertSelectedCount = alertSelectedCount + 1;
            }
        });

        getUiGridBiginEdit(gId, 'AlertTypeId', gridStorage);
        callUiGridFilter(gId, gridStorage);
    }

    //Getting details of role
    function getAlertDetails(alertData, acUserSubscribedAlerts, IsVFSSOProfile) {
        var role = new Object();
        $("#loadingDiv").show();

        var alertTypeReq = new Object();
        alertTypeReq.AlertStatus = ENUM.get('ALERT_STATUS_ENABLED');

        function callBackfunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.alertList)
                        data.alertList = $.parseJSON(data.alertList);

                    alertData(data.alertList);
                    alertGrid(gID, alertData(), acUserSubscribedAlerts, IsVFSSOProfile);
                }
                $("#loadingDiv").hide();
            }
            if (error) {
                retval = "";
            }
        }

        var method = 'GetAlertTypes';
        var params = '{"token":"' + TOKEN() + '","alertTypeReq":' + JSON.stringify(alertTypeReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});

