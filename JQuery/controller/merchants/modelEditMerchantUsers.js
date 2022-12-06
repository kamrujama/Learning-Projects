define(["knockout", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, ADSearchUtil, koUtil) {
    var lang = getSysLang();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function editMerchantUsersViewModel() {
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
        i18n.init({
            "lng": lang,
            "debug": true,
            "fallbackLang": 'en',
            "resGetPath": AppConstants.get('LOCALIZEDPATH') + '/__ns__-__lng__.json',
            ns: {
                namespaces: ['resource'],
                defaultNs: 'resource'
            }
        }, function (call) {
            $(document).i18n();
        });

        var self = this;

        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        self.modelOption = ko.observable();
        var selectedMerchantId = globalVariableForSelectedMerchants[0].id;
        var selectedMerchantUserId = globalVariableForSelectedMerchantUser[0].id;

        //focus on first textbox
        $('#downloadModel').on('shown.bs.modal', function () {
            $('#userFirstName').focus();
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

        $(".chosen-results").css("height", "130px");

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
        }

        //cancel operation
        self.cancelClick = function (observableModelPopup) {
            observableModelPopup('unloadTemplate');
            $('#merchantUsersView').hide();
            $('#editMerchantsView').show();
        }

        $("#userFirstName").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#userLastName").on('change keyup paste', function () {
            mandatoryField();
        });

        function validateString(self) {
            var yourInput = $(self).val();
            re = /[`~!#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
            // store current positions in variables
            var start = self.selectionStart,
                end = self.selectionEnd;

            var isSplChar = re.test(yourInput);
            if (isSplChar) {
                var no_spl_char = yourInput.replace(/[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '');
                $(self).val(no_spl_char);

                // restore from variables...
                self.setSelectionRange(start - 1, end - 1);
            }
        }

        function mandatoryField() {
            if ($.trim($("#userFirstName").val()).length == 0 || $.trim($("#userLastName").val()).length == 0 || $.trim($("#userEmail").val()).length == 0) {
                $("#editMerchantUser").prop("disabled", true);
            } else {
                $("#editMerchantUser").prop("disabled", false);
            }
        }

        //Reset call
        self.resetCall = function () {
            self.userFirstName('');
            self.userLastName('');
            self.userEmail('');
            $("#editMerchantUser").prop("disabled", true);
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

        self.userFirstName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_merchant_user_first_name', {
                    lng: lang
                })
            }
        });

        self.userLastName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_merchant_user_last_name', {
                    lng: lang
                })
            }
        });

        self.userEmail = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_valid_Email_ID', {
                    lng: lang
                })
            }
        });

        self.validateBusinessEmail = function (data) {
            if (data.businessEmail() != "") {
                validateEmail($("#userEmail").val());

                if (!validateEmail($("#userEmail").val())) {
                    $("#merchantUserEditEmailErrorTip").show();
                } else {
                    $("#merchantUserEditEmailErrorTip").hide();
                }
            }
        }
        function validateEmail(emailValue) {
            var filter = /^([\w-\.]+@([\w-]+\.)+[\w-]{1,})?$/;
            if (filter.test(emailValue)) {
                return emailValue.length < 255 ? true : false;
            } else {
                return false;
            }
        }

        self.setMerchantUserDetails = function (merchantUser) {
            self.userFirstName(merchantUser.firstName);
            self.userLastName(merchantUser.lastName);
            self.userEmail(merchantUser.email);
            self.userRole(merchantUser.role);
        }

        self.getEditMerchantUserDetails = function (merchantId, merchantUserId) {
            $("#loadingDiv").show();
            function callbackFunction(data, response) {
                if (data) {
                    if (response.status == AppConstants.get('GET_SUCCESS')) {
                        self.setMerchantUserDetails(data);
                    }
                }
                $("#loadingDiv").hide();
            }

            var method = 'merchants/' + merchantId + '/users/' + merchantUserId + '?customerId=' + customerID;
            var params = null;
            ajaxJsonCallWebAPI(method, params, callbackFunction, true, 'GET', false);
        }

        self.getEditMerchantUserDetails(selectedMerchantId, selectedMerchantUserId);

        function checkerror() {
            var retval = '';
            if ($("#userEmail").val() != "" && validateEmail($("#userEmail").val())) {
                retval += '';
                $("#emailErrorTip").hide();
            } else {
                retval += 'email Id';
                $("#emailErrorTip").show();
            }
            return retval;
        };

        self.editMerchantUser = function (gId, observableModelPopup) {
            var retval = checkerror();
            if (retval == null || retval == "") {
                $("#loadingDiv").show();
                self.editMerchantUserDetails(gId, observableModelPopup, selectedMerchantUserId);
            }
        }
                
        self.editMerchantUserDetails = function (gId, observableModelPopup, selectedMerchantUserId) {
            var merchantUserObj = new Object();
            merchantUserObj.merchantId = selectedMerchantUserId;
            merchantUserObj.firstName = $("#userFirstName").val();
            merchantUserObj.lastName = $("#userLastName").val();
            merchantUserObj.email = $("#userEmail").val();
            merchantUserObj.role = "Merchant Admin";
            merchantUserObj.modifiedBy = loggedInUserEmail;

            function callbackFunction(data, response) {
                $("#loadingDiv").hide();
                if (response) {
                    if (response.status == AppConstants.get('PATCH_NO_CONTENT')) {      //201
                        observableModelPopup('unloadTemplate');
                        openAlertpopup(0, 'Merchant_user_changes_saved_successfully');
                        $('#merchantUsersView').hide();
                        $('#editMerchantsView').show();
                        gridFilterClear(gId);
                    } else if (response.status == AppConstants.get('CONFLICTS')) {      //409
                        openAlertpopup(1, 'Merchant_user_already_exists');
                    }
                }                
            }

            var method = 'merchants/' + merchantId + '/users/' + merchantUserId + '?customerId=' + customerID;
            var params = JSON.stringify(merchantUserObj);
            ajaxJsonCallWebAPI(method, params, callbackFunction, true, 'PATCH', false);
        }

    };
});

