define(["knockout", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, ADSearchUtil, koUtil) {
    var lang = getSysLang();
    uploadedfiledata = new Array();
    currentAddedUserGuid = "";
    currentTemporaryPassword = "";
    emailValue = "";
    isCompanyNameBasedLogin = false;
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function AddpackageViewModel() {
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

        var self = this;

        //$("#mdlHierarchy").draggable();

        self.observableHierarchy = ko.observable();

        ADSearchUtil.HierarchyPathArr.removeAll();

        //self.selectedHierarchiesChange

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

        ADSearchUtil.AdScreenName = 'addUser';
        var userrData = JSON.parse(sessionStorage.getItem("userrData"));
        isCompanyNameBasedLogin = userrData[0].IsCompanyNameBasedLogin;
        //focus on first textbox
        $('#downloadModel').on('shown.bs.modal', function () {
            if (isCompanyNameBasedLogin) {
                $('#loginNameCustBased').focus();
            } else {
                $('#loginName').focus();
            }
        });

        self.IsVFSSOProfile = ko.observable(IsVFSSOUser);
        self.IsForgeRockProfile = ko.observable(IsForgeRockUser);
        self.IsVHQProfile = ko.observable(IsVHQNativeAuthentication);
        self.IsADProfile = ko.observable(IsADUser);
        self.IsADFSProfile = ko.observable(IsADFSUser);
        self.SHOW_VHQNATIVECONTROLS = ko.observable(false);
        self.SHOW_EMAILINFO = ko.observable(false);
        updateComponentsOnUserAuthentication(self, 'modelAddUser');
        self.isEnableAddBtn = ko.observable(false);
        self.test = ko.observable();
        self.isApplicationAvailable = ko.observable(false);
        self.validetbundleResponse = ko.observableArray();
        self.ModelNameArr = ko.observableArray();
        self.titleValue = ko.observable();
        self.primaryPhone = ko.observable();
        self.alternatePhone = ko.observable();
        self.levelValue = ko.observable();
        self.modelOption = ko.observable();
        self.gridIdForHierarchy = ko.observable();
        self.roleArray = ko.observableArray();
        //Popu open
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        var modelname = 'unloadTemplate';
        loadHierarchy(modelname, 'genericPopup');

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

        $(".chosen-results").css("height", "130px");

        //cancel operation
        self.cancelClick = function (observableModelPopup) {
            observableModelPopup('unloadTemplate');
            $('#usersModel').show();
            $("#addUserScreen").hide();
            $('#userMainScreen').show();
        }

        if (isCompanyNameBasedLogin) {
            $("#emailComponent").removeClass('hide');
            $("#loginNameNativeDiv").removeClass('hide');
            $("#loginNameDiv").addClass('hide');
        } else {
            $("#emailComponent").addClass('hide');
            $("#loginNameNativeDiv").addClass('hide');
            $("#loginNameDiv").removeClass('hide');
        }

        $("#loginName").on('change keyup paste', function () {
            mandatoryField();
        });
        $("#loginNameCustBased").on('change keyup paste', function () {
            mandatoryField();
        });
        $("#loginNameADFS").on('change keyup paste', function () {
            mandatoryField();
        });


        $("#firstName").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#firstNameVFSSO").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#firstNameFR").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#firstNameADFS").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#lastName").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#lastNameVFSSO").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#lastNameFR").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#lastNameADFS").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#emailIdVFSSO").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#emailIdFR").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#emailInput").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#roleTypeId").on('change keyup paste', function () {
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

        $('#firstNameVFSSO').keyup(function () {
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

        $('#firstNameFR').keyup(function () {
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

        $('#firstNameADFS').keyup(function () {
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

        $('#lastNameVFSSO').keyup(function () {
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

        $('#lastNameFR').keyup(function () {
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
        $('#lastNameADFS').keyup(function () {
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

        $('#loginName').keyup(function () {
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
        $('#loginNameCustBased').keyup(function () {
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
        $('#loginNameADFS').keyup(function () {
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

        function mandatoryField() {
            if (self.IsVFSSOProfile() && IsHierarchyAccessViaADFS) {
                if ($.trim($("#firstNameVFSSO").val()).length == 0 || $.trim($("#lastNameVFSSO").val()).length == 0 || $.trim($("#emailIdVFSSO").val()).length == 0 || $("#roleTypeId").val() == null) {
                    $('#addBtn').prop('disabled', true);
                } else {
                    $('#addBtn').prop('disabled', false);
                }
            } else if (self.IsVFSSOProfile() && !IsHierarchyAccessViaADFS) {
                if ($.trim($("#firstNameVFSSO").val()).length == 0 || $.trim($("#lastNameVFSSO").val()).length == 0 || $.trim($("#emailIdVFSSO").val()).length == 0 || isHierarchyChange == false || $("#roleTypeId").val() == null) {
                    $('#addBtn').prop('disabled', true);
                } else {
                    $('#addBtn').prop('disabled', false);
                }
            } else if (self.IsForgeRockProfile() && IsHierarchyAccessViaADFS) {
                if ($.trim($("#firstNameFR").val()).length == 0 || $.trim($("#lastNameFR").val()).length == 0 || $.trim($("#emailIdFR").val()).length == 0 || $("#roleTypeId").val() == null) {
                    $('#addBtn').prop('disabled', true);
                } else {
                    $('#addBtn').prop('disabled', false);
                }
            } else if (self.IsForgeRockProfile() && !IsHierarchyAccessViaADFS) {
                if ($.trim($("#firstNameFR").val()).length == 0 || $.trim($("#lastNameFR").val()).length == 0 || $.trim($("#emailIdFR").val()).length == 0 || isHierarchyChange == false || $("#roleTypeId").val() == null) {
                    $('#addBtn').prop('disabled', true);
                } else {
                    $('#addBtn').prop('disabled', false);
                }
            } else if (self.IsADFSProfile()) {
                if ($.trim($("#loginName").val()).length == 0 || $.trim($("#firstName").val()).length == 0 || $.trim($("#lastName").val()).length == 0 || $("#roleTypeId").val() == null) {
                    $('#addBtn').prop('disabled', true);
                } else {
                    $('#addBtn').prop('disabled', false);
                }
            } else {
                if (isCompanyNameBasedLogin) {
                    if ($.trim($("#loginNameCustBased").val()).length == 0 || $.trim($("#firstName").val()).length == 0 || $.trim($("#lastName").val()).length == 0 || $.trim($("#emailInput").val()).length == 0 || isHierarchyChange == false
                        || $("#roleTypeId").val() == null) {
                        $('#addBtn').prop('disabled', true);
                    } else {
                        $('#addBtn').prop('disabled', false);
                    }
                } else {
                    if ($.trim($("#loginName").val()).length == 0 || $.trim($("#firstName").val()).length == 0 || $.trim($("#lastName").val()).length == 0 || isHierarchyChange == false
                        || $("#roleTypeId").val() == null) {
                        $('#addBtn').prop('disabled', true);
                    } else {
                        $('#addBtn').prop('disabled', false);
                    }
                }
            }
        }
        ///////////////////////////////


        $('#mdlHierarchyHeader').mouseup(function () {
            $("#mdlHierarchyContent").draggable({ disabled: true });
        });

        $('#mdlHierarchyHeader').mousedown(function () {
            $("#mdlHierarchyContent").draggable({ disabled: false });
        });

        $('.chosen-choices').on('click', function () {
            $('#roleTypeId_chosen .search-field input[type=text]').focus();
        });

        //Calling Active roles if and only if Authentication mode is VHQ
        self.getActiveRolesArray = ko.observableArray();
        if (self.IsVHQProfile() || IsVHQAuthorizedUser) {
            getActiveRoles(self.getActiveRolesArray);
        }

        function getActiveRoles(getActiveRolesArray) {
            // $("#loadingDiv").show();
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data && data.rolesList) {
                            data.rolesList = $.parseJSON(data.rolesList);
                        }

                        //$("#loadingDiv").hide();
                        getActiveRolesArray(data.rolesList);
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

        //Reset call
        self.resetCall = function () {
            if (self.IsADProfile()) {
                $("#firstName").prop("disabled", true);
                $("#lastName").prop("disabled", true);
            } else {

            }
            $("#loginName").prop("disabled", false);
            self.firstName('');
            self.lastName('');
            self.emailValue('');
            self.primaryPhone('');
            self.alternatePhone('');
            self.titleValue('');
            self.loginName('');
            $("#addBtn").prop("disabled", true);
            $("#checkUserBtn").prop('value', 'Check User');

        }

        //Check User is available in active directory 
        self.checkUser = function () {
            //Validate login name
            var retval = '';
            var userName = $("#loginName").val();
            if (isCompanyNameBasedLogin && $("#loginNameCustBased").val() != "") {
                retval += '';
                userName = $("#loginNameCustBased").val();
            } else if (!isCompanyNameBasedLogin && $("#loginName").val() != "" && validateEmail($("#loginName").val())) {
                retval += '';
                userName = $("#loginName").val();
            } else {
                if ($("#loginName").val() == "") {
                    retval += 'login name';
                    $("#loginNameErrorTip").show();
                    $("#loginNameErrorTipADFS").show();
                } else if ($("#loginName").val() != "" && (!validateEmail($("#loginName").val()))) {
                    retval += 'login name';
                    $("#loginNameErrorTip").show();
                    $("#loginNameErrorTipADFS").show();
                } else {
                    retval += '';
                }

                return;
            }

            if ($("#checkUserBtn").val() == "Reset") {
                self.resetCall();
                return;
            }


            $("#loadingDiv").show();
            var customerName = customerData[0].CustomerName;
            function callbackFunction(data, error) {
                if (data) {
                    $("#loadingDiv").hide();
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        $("#checkUserBtn").prop('value', 'Reset');
                        $("#addBtn").prop("disabled", false);

                        var userInfo = data.userInfo;
                        self.firstName(userInfo.FirstName);
                        self.lastName(userInfo.LastName);
                        self.loginName(userInfo.LoginName);
                        self.emailValue(userInfo.AlertEmail);
                        self.primaryPhone(userInfo.ContactNumber1);
                        self.alternatePhone(userInfo.ContactNumber2);
                        self.titleValue(userInfo.Title);

                        $("#loginName").prop("disabled", true);
                        $("#loginNameCustBased").prop("disabled", true);
                        $("#firstName").prop("disabled", true);
                        $("#lastName").prop("disabled", true);
                        $("#title").prop("disabled", true);
                        $("#primaryPh").prop("disabled", true);
                        $("#alternatePh").prop("disabled", true);
                        if (userInfo.FirstName == null || userInfo.FirstName == '') {
                            $("#firstName").prop("disabled", false);
                        }

                        if (userInfo.LastName == null || userInfo.LastName == '') {
                            $("#lastName").prop("disabled", false);
                        }

                    } else if (data.responseStatus.StatusCode == AppConstants.get('USER_NOT_IN_ACTIVE_DIRECTORY')) {
                        openAlertpopup(1, 'not_exist_user');
                        $("#firstName").prop("disabled", true);
                        $("#lastName").prop("disabled", true);
                        $("#addBtn").prop("disabled", true);
                    }
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'ValidateADUser';
            var params = '{"token":"' + TOKEN() + '","userName":"' + userName + '","customerName":"' + customerName + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }
        modelReposition();
        //Open popup
        self.openPopup = function (popupName, gId, status) {
            self.templateFlag(true);
            if (popupName == "modelEditHierarchy") {
                heirarchyGlobalCheck = 0;
                hierarchyforuser = 1;
                loadelement(popupName, 'device');
                $('#deviceModel').modal('show');
            } else if (popupName == "modalHierarchy") {
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

        //Changing roles dropdown
        self.RoleName = ko.observable();
        self.roleNameArr = ko.observableArray();
        self.onChangeRole = function () {
            $("#roleId").empty();
            if ($("#roleTypeId").chosen().val() == null || $("#roleTypeId").chosen().val() == "" || $("#roleTypeId").chosen().val().length == 0) {
                self.RoleName(null);
                $("#please_select_model").show();
                $("#roleType").append(i18n.t('please_select_role'));
            } else {
                self.roleNameArr([]);
                $('#roleTypeId :selected').each(function (i, selected) {
                    var forselction = new Object();
                    forselction.name = $(selected).text();
                    self.roleNameArr.push(forselction);
                });

                $("#roleType").empty();
                self.isEnableAddBtn(true);
            }
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

        //Validation on Add User screen
        self.loginName = ko.observable('').extend({
            required: {
                params: true,
                message: isCompanyNameBasedLogin ? i18n.t('Please_enter_user_name', { lng: lang }) : i18n.t('login_name_should_be_emailid', { lng: lang })
            }
        });

        self.firstName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_first_name', {
                    lng: lang
                })
            }
        });
        self.lastName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_last_name', {
                    lng: lang
                })
            }
        });

        self.emailValue = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_valid_Email_ID', {
                    lng: lang
                })
            }
        });

        //self.levelValue = ko.observable("").extend({
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

        self.validateLoginName = function (data) {
            if (data.loginName() != "") {
                validateEmail($("#loginName").val());

                if (!validateEmail($("#loginName").val())) {
                    $("#loginNameErrorTip").show();
                    $("#loginNameErrorTipADFS").show();
                } else {
                    $("#loginNameErrorTip").hide();
                    $("#loginNameErrorTipADFS").hide();
                }
            }
        }

        ////////////////////////////Validation on add user screen
        $("#validatePackageType").hide();

        function validateEmail(emailValue) {
            //var filter1 = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
            var filter = /^([\w-\.]+@([\w-]+\.)+[\w-]{1,})?$/;
            if (filter.test(emailValue)) {
                return emailValue.length < 255 ? true : false;
            } else {
                return false;
            }
        }

        function checkerror() {
            var retval = '';

            var loginName = $("input#loginName");
            var firstName = $("input#firstName");
            var lastName = $("input#lastName");

            loginName.val(loginName.val().replace(/^\s+/, ""));
            firstName.val(firstName.val().replace(/^\s+/, ""));
            lastName.val(lastName.val().replace(/^\s+/, ""));

            if (!self.IsVFSSOProfile() && !self.IsForgeRockProfile()) {
                if ($("#loginName").val() == "") {
                    retval += 'login name';
                    self.loginName(null);
                    $("#loginNameErrorTip").show();
                    $("#loginNameErrorTipADFS").show();
                }
            }

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

            if (self.IsVFSSOProfile()) {
                if ($("#emailIdVFSSO").val() != "" && validateEmail($("#emailIdVFSSO").val())) {
                    retval += '';
                } else {
                    retval += 'email id';
                    self.emailValue(null);
                    $("#Please_enter_valid_Email_ID").show();
                }
            }
            if (self.IsForgeRockProfile()) {
                if ($("#emailIdFR").val() != "" && validateEmail($("#emailIdFR").val())) {
                    retval += '';
                } else {
                    retval += 'email id';
                    self.emailValue(null);
                    $("#Please_enter_valid_Email_ID").show();
                }
            }
            if (isCompanyNameBasedLogin) {
                if ($("#loginNameCustBased").val() == "") {
                    retval += 'login name';
                    self.loginName(null);
                } else {
                    retval += '';
                }
                if ($("#emailInput").val() != "" && validateEmail($("#emailInput").val())) {
                    retval += '';
                } else {
                    retval += 'email id';
                    self.emailValue(null);
                }
            }

            if (!IsHierarchyAccessViaADFS && !self.IsADFSProfile() && koUtil.hierarchiesForAdd().length == 0) {
                retval += 'hierarchy';
                openAlertpopup(1, 'Please_assign_hierarchy');
            } else {
                retval += '';
            }

            //if ($("#valueHierarchy").val() == "") {
            //    retval += 'last name';
            //    self.levelValue(null);
            //    $("#Please_assign_hierarchy").show();
            //} else {
            //    retval += '';
            //}

            if (self.IsADProfile()) {

            } else {
                $("#roleType").empty();
                if ($("#roleTypeId").chosen().val() == null || $("#roleTypeId").chosen().val() == "" || $("#roleTypeId").chosen().val().length == 0) {
                    retval += 'roles';
                    self.RoleName(null);
                    $("#roleType").append(i18n.t('Please_assign_role_for_the_user'));
                } else {
                    retval += '';
                    $("#roleType").empty();
                }
            }
            return retval;
        };

        //Add User button click
        self.addUserClick = function (observableModelPopup) {
            self.addUser('jqxgridUsers', self.roleNameArr(), self.getActiveRolesArray(), observableModelPopup);
        }

        //Add User
        self.addUser = function (gridId, roleNameArr, getActiveRolesArray, observableModelPopup) {
            var retval = checkerror();
            if (retval == null || retval == "") {
                $("#loadingDiv").show();
                var currentDate = moment().format('MM/DD/YYYY');
                var newUserObject = new Object();
                newUserObject.FirstName = $("#firstName").val();
                newUserObject.LastName = $("#lastName").val();
                if (isCompanyNameBasedLogin) {
                    newUserObject.LoginName = $("#loginNameCustBased").val();
                    newUserObject.AlertEmail = $("#emailInput").val();
                    emailValue = $("#emailInput").val();
                } else {
                    newUserObject.LoginName = $("#loginName").val() != '' ? $("#loginName").val() : $("#emailIdVFSSO").val();
                    newUserObject.AlertEmail = $("#emailIdVFSSO").val() != '' ? $("#emailIdVFSSO").val() : $("#loginName").val();
                    emailValue = $("#emailIdVFSSO").val() != '' ? $("#emailIdVFSSO").val() : $("#loginName").val();

                    if (self.IsForgeRockProfile()) {
                        newUserObject.LoginName =  $("#emailIdFR").val();
                        newUserObject.AlertEmail = $("#emailIdFR").val();
                        emailValue = $("#emailIdFR").val();
                    }

                }
                newUserObject.ContactNumber1 = $("#primaryPh").val();
                newUserObject.ContactNumber2 = $("#alternatePh").val();
                newUserObject.Title = $("#title").val();
                newUserObject.ColorTheme = "";
                newUserObject.IsActive = true;
                newUserObject.LastFailedLoginDate = createJSONTimeStamp(currentDate);
                newUserObject.LastLoginDate = createJSONTimeStamp(currentDate);
                newUserObject.RowInsertedDate = createJSONTimeStamp(currentDate);
                newUserObject.RowUpdatedDate = createJSONTimeStamp(currentDate);
                newUserObject.PasswordExpirationDate = createJSONTimeStamp(currentDate);
                IspasswordChangeRequired = true;
                function callbackFunction(data, error) {
                    if (data) {
                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                            observableModelPopup('unloadTemplate');
                            currentAddedUserGuid = data.userGuid;
                            currentTemporaryPassword = data.temporaryPassword;
                            if (!IsHierarchyAccessViaADFS) {
                                setUserHierarchy(gridId, roleNameArr, getActiveRolesArray, observableModelPopup);
                            } else if (self.IsVHQProfile() || IsVHQAuthorizedUser) {
                                addUsersToRole(gridId, roleNameArr, getActiveRolesArray, observableModelPopup);
                            }
                            $('#usersModel').show();
                            $("#addUserScreen").hide();
                            $('#userMainScreen').show();
                            gridFilterClear('jqxgridUsers');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('E_INVALIDEMAIL')) { //289
                            openAlertpopup(2, 'invalid_email_id');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('E_INVALIDDOMAIN')) { //290
                            openAlertpopup(2, 'invalid_domain_name');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('E_RECORD_NOT_INSERTED')) { //291
                            openAlertpopup(2, 'user_creation_failed');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('E_DOMAIN_NOT_CREATED')) { //292
                            openAlertpopup(2, 'domain_not_created');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('E_DOMAIN_NOT_FOUND')) { //293
                            openAlertpopup(2, 'email_domain_not_found');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('E_WSO2USER_NOTCREATED')) { //295
                            openAlertpopup(2, 'user_creation_failed_in_WSO2');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('E_WS02USER_INVALIDLOGINNAME')) { //297
                            openAlertpopup(2, 'invalid_email_id');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('E_USER_NOT_INSERTED')) { //298
                            openAlertpopup(2, 'user_insertion_failed');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('E_CUSTOMEREMAILMAP_NOT_INSERTED')) { //300
                            openAlertpopup(2, 'user_creation_failed');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('E_DOMAINIDP_NOT_INSERTED')) { //301
                            openAlertpopup(2, 'email_domain_not_inserted');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('E_WSO2TOKEN_NOT_GENERATED')) { //302
                            openAlertpopup(2, 'user_creation_failed_WSO2_token');
                        } else if (data.responseStatus.StatusCode == AppConstants.get('E_FORGEROCKUSER_NOT_CREATED')) { //444
                            openAlertpopup(2, 'user_creation_failed_in_FORGEROCK');
                        }
                        else if (data.responseStatus.StatusCode == AppConstants.get('E_DUPLICATEUSER')) { //303
                            if (self.IsVFSSOProfile()) {
                                openAlertpopup(1, 'email_id_exist');
                            } else {
                                openAlertpopup(1, 'login_name_exist');
                            }
                        } else if (data.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR')) { //112
                            openAlertpopup(2, 'internal_error_api');
                        } else {
                            openAlertpopup(1, data.responseStatus.StatusMessage);
                        }
                    }
                    if (error) {
                        retval = "";
                    }
                    $("#loadingDiv").hide();
                }

                var method = 'AddUser';
                var params = '{"token":"' + TOKEN() + '","user":' + JSON.stringify(newUserObject) + '}';
                ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
            } else {
                return false;
            }
        }

        //Set User Hierarchy
        function setUserHierarchy(gridId, roleNameArr, getActiveRolesArray, observableModelPopup) {
            var hierarchies = koUtil.hierarchiesForAdd();
            var userHierarchies = new Array();
            var assignedHierarchies = new Array();

            //setUserHierarchiesReq.userGuid = currentAddedUserGuid;

            for (var i = 0; i < hierarchies.length; i++) {
                var Hierarchy = new Object();
                Hierarchy.Id = hierarchies[i].HierarchyId;
                Hierarchy.HierarchyName = hierarchies[i].HierarchyName;
                userHierarchies.push(Hierarchy);
            }

            assignedHierarchies = userHierarchies;
            var unAssignedHierarchies = new Array();

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        ADSearchUtil.HierarchyPathArr.removeAll();
                        koUtil.hierarchiesForAdd.removeAll();
                        if (self.IsVHQProfile() || IsVHQAuthorizedUser) {
                            addUsersToRole(gridId, roleNameArr, getActiveRolesArray, observableModelPopup);
                        } else {
                            if (self.IsADProfile() || self.IsVFSSOProfile()) {
                                openAlertpopup(0, 'User_has_been_added_successfully');
                            } else {
                                openAlertpopup(0, i18n.t('An_email_with_the_temporary_password', { emailValue: emailValue }, { lng: lang }));
                            }
                        }
                        $('#downloadModel').modal('hide');
                        $("#jqxgridUsers").jqxGrid('updatebounddata');
                    }
                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'SetUserHierarchies';
            var params = '{"token":"' + TOKEN() + '", "userGuid":"' + currentAddedUserGuid + '", "assignedHierarchies":' + JSON.stringify(assignedHierarchies) + ', "unAssignedHierarchies":' + JSON.stringify(unAssignedHierarchies) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        //GetActive roles data
        function getRolesArray(roles, getActiveRolesArray) {
            var activeRoleArray = new Array();
            for (j = 0; j < roles.length; j++) {
                var name = roles[j].name;
                var source = _.where(getActiveRolesArray, { "RoleName": name })
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
        function addUsersToRole(gridId, roleNameArr, getActiveRolesArray, observableModelPopup) {
            var user = new Object();
            var role = new Object();
            var arrAssignedUsers = new Array();
            var arrAssignedRoles = new Array();

            user.UserGuid = currentAddedUserGuid;
            user.LoginName = $("#loginName").val();
            user.FirstName = $("#firstName").val();
            user.LastName = $("#lastName").val();
            arrAssignedUsers.push(user);

            var roleArray = getRolesArray(roleNameArr, getActiveRolesArray);
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (currentTemporaryPassword == '') {
                        } else {
                            openAlertpopup(0, i18n.t('temp_password_changes', { currentTemporaryPassword: currentTemporaryPassword }, { lng: lang }));
                            return;
                        }
                        if (self.IsADProfile() || self.IsVFSSOProfile()) {
                            openAlertpopup(0, i18n.t('User_has_been_added_successfully', { emailValue: emailValue }, { lng: lang }));
                        } else {
                            observableModelPopup('unloadTemplate');
                            openAlertpopup(0, i18n.t('An_email_with_the_temporary_password', { emailValue: emailValue }, { lng: lang }));
                        }
                    }
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

});

