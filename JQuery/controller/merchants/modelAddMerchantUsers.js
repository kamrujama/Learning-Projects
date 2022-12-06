define(["knockout", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, ADSearchUtil, koUtil) {
    var lang = getSysLang();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function addMerchantUsersViewModel() {
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

        var selectedMerchantId = globalVariableForSelectedMerchants[0].id;

        //focus on first textbox
        $('#downloadModel').on('shown.bs.modal', function () {
            $('#userFirstName').focus();
        })
                
        //Popup open
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        self.modelOption = ko.observable();

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

        self.isNumeric = function () {
            return validateNumberKey(event);
        }

        self.isAlphaKeys = function () {
            return validateAlphaKey(event);
        }

        $("#userFirstName").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#userLastName").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#userEmail").on('keyup', function (event) {
            mandatoryField();
        });

        function isString(event) {
            var theEvent = event || window.event;
            var key = theEvent.key;
            var regex = /^[a-zA-Z\s]+$/;
            if (!regex.test(key)) {
                $(event.target).val($(event.target).val().replace(key, ""));
            }
        }

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

        self.validateUserFirstName = function (data) {
            if (data.userFirstName() != "") {
                if (!validateMerchantUserName($("#userFirstName").val())) {
                    $("#merchantUserAddFirstNameErrorTip").show();
                } else {
                    $("#merchantUserAddFirstNameErrorTip").hide();
                }
            } else {
                $("#merchantUserAddFirstNameErrorTip").hide();
            }
        }

        self.validateUserLastName = function (data) {
            if (data.userLastName() != "") {
                if (!validateMerchantUserName($("#userLastName").val())) {
                    $("#merchantUserAddLastNameErrorTip").show();
                } else {
                    $("#merchantUserAddLastNameErrorTip").hide();
                }
            } else {
                $("#merchantUserAddLastNameErrorTip").hide();
            }
        }

        self.validateUserEmail = function (data) {
            if (data.userEmail() != "") {
                if (!validateEmail($("#userEmail").val())) {
                    $("#merchantUserAddEmailErrorTip").show();
                } else {
                    $("#merchantUserAddEmailErrorTip").hide();
                }
            } else {
                $("#merchantUserAddEmailErrorTip").hide();
            }
        }

        function mandatoryField() {
            if ($.trim($("#userFirstName").val()).length == 0 || $.trim($("#userLastName").val()).length == 0 || $.trim($("#userEmail").val()).length == 0) {
                $("#addMerchantUser").prop("disabled", true);
            } else {
                $('#addMerchantUser').prop("disabled", false);
            }
        }        

        //Reset call
        self.resetCall = function () {
            self.userFirstName('');
            self.userLastName('');
            self.userEmail('');
            $("#addMerchantUser").prop("disabled", true);
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
                
        

        function checkerror() {
            var retval = '';
            if ($("#userEmail").val() != "" && validateEmail($("#userEmail").val())) {
                retval += '';
                $("#merchantUserAddEmailErrorTip").hide();
            } else {
                retval += 'email Id';
                $("#merchantUserAddEmailErrorTip").show();
            }
            return retval;
        };

        self.addMerchantUser = function (gId, observableModelPopup) {
            var retval = checkerror();
            if (retval == null || retval == "") {
                $("#loadingDiv").show();
                self.addMerchantUserDetails(gId, observableModelPopup);
            }
        }

        self.addMerchantUserDetails = function (gId, observableModelPopup) {
            var merchantUserObj = new Object();
            merchantUserObj.firstName = $("#userFirstName").val();
            merchantUserObj.lastName = $("#userLastName").val();
            merchantUserObj.email = $("#userEmail").val();
            merchantUserObj.role = "Merchant Admin";
            merchantUserObj.createdBy = loggedInUserEmail;
            merchantUserObj.modifiedBy = loggedInUserEmail;

            function callbackFunction(data, response) {
                $("#loadingDiv").hide();                
                if (response) {
                    if (response.status == AppConstants.get('CREATED')) {               //201
                        observableModelPopup('unloadTemplate');
                        openAlertpopup(0, 'Merchant_user_has_been_added_successfully');
                        $('#merchantUsersView').hide();
                        $('#editMerchantsView').show();
                        globalVariableForSelectedMerchants[0].commerceEnabled = "Yes";
                        $("#chkCommerceEnabled").prop("disabled", true);
                        isMerchantUserExists = true;
                        gridFilterClear(gId);                        
                    } else if (response.status == AppConstants.get('CONFLICTS')) {      //409
                        openAlertpopup(1, 'Merchant_user_already_exists');
                    }
                }                
            }

            var method = 'merchants/' + selectedMerchantId + '/users?customerId=' + customerID;
            var params = JSON.stringify(merchantUserObj);
            ajaxJsonCallWebAPI(method, params, callbackFunction, true, 'POST', false);
        }
        
    };
});

