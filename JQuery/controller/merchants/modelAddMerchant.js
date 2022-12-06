define(["knockout", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, ADSearchUtil, koUtil) {
    var lang = getSysLang();
    uploadlogo = new Array();
    currentAddedUserGuid = "";
    currentTemporaryPassword = "";
    emailValue = "";

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function addMerchantsViewModel() {
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

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
        }

        //focus on first textbox
        $('#downloadModel').on('shown.bs.modal', function () {
            $('#businessName').focus();
        })

        uploadlogo = new Array();
        var fileToUpload = '';
        var logoURL = "";
        self.isEnableAddBtn = ko.observable(false);
        //Popup open
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        self.modelOption = ko.observable();
        self.businessCountry = ko.observable();
        self.businessStreet2 = ko.observable();
        self.businessWebsite = ko.observable();

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
            $('#merchantsModel').hide();
            $('#viewMerchants').show();
        }

        self.isNumeric = function () {
            return validateNumberKey(event);
        }

        self.isAlphaKeys = function () {
            return validateAlphaKey(event);
        }

        self.isPostalCode = function () {
            return validateZipCode(event);
        }

        $("#businessName").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#identifier").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#industryCode").on('change keyup paste', function () {
            mandatoryField();
        });
        
        $("#businessStreet1").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#businessStreet2").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#businessTownCity").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#businessState").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#businessContactNumber").on('blur', function (event) {
            if (validateUSNumber(event)) {

            }
        });

        $("#businessContactCode").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#businessContactNumber").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#businessPostalCode").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#businessEmail").on('change keyup paste', function () {
            mandatoryField();
        });

        $("#businessWebsite").on('change keyup paste', function () {
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

        self.validateBusinessName = function (data) {
            if (data.businessName() != "" && data.businessName() != undefined) {
                if (!validateName($("#businessName").val())) {
                    $("#merchantAddNameErrorTip").show();
                } else {
                    $("#merchantAddNameErrorTip").hide();
                }
            } else {
                $("#merchantAddNameErrorTip").hide();
            }
        }

        self.validateIndustryCode = function (data) {
            if (data.industryCode() != "" && data.industryCode() != undefined) {
                if (!validateIsNumber($("#industryCode").val())) {
                    $("#merchantAddIndustryCodeErrorTip").show();
                } else {
                    $("#merchantAddIndustryCodeErrorTip").hide();
                }
            } else {
                $("#merchantAddIndustryCodeErrorTip").hide();
            }
        }

        self.validateIdentifier = function (data) {
            if (data.identifier() != "" && data.identifier() != undefined) {
                if (!validateIdentifier($("#identifier").val())) {
                    $("#merchantIdentifierErrorTip").show();
                } else {
                    $("#merchantIdentifierErrorTip").hide();
                    }
                } else {
                    $("#merchantIdentifierErrorTip").hide();
            }
        }

        self.validatePostalCode = function (data) {
            if (data.businessPostalCode() != "" && data.businessPostalCode() != undefined) {
                if (!validatePostalCode($("#businessPostalCode").val())) {
                    $("#merchantAddPostalCodeErrorTip").show();
                } else {
                    $("#merchantAddPostalCodeErrorTip").hide();
                }
            } else {
                $("#merchantAddPostalCodeErrorTip").hide();
            }
        }

        self.validateContactNumber = function (data) {
            if (data.businessContactNumber() != "" && data.businessContactNumber() != undefined) {
                if (!validateIsNumber($("#businessContactNumber").val())) {
                    $("#merchantAddContactNumErrorTip").show();
                } else {
                    $("#merchantAddContactNumErrorTip").hide();
                }
            } else {
                $("#merchantAddContactNumErrorTip").hide();
            }
        }

        self.validateBusinessEmail = function (data) {
            if (data.businessEmail() != "" && data.businessEmail() != undefined) {
                if (!validateEmail($("#businessEmail").val())) {
                    $("#merchantAddEmailErrorTip").show();
                } else {
                    $("#merchantAddEmailErrorTip").hide();
                }
            } else {
                $("#merchantAddEmailErrorTip").hide();
            }
        }

        self.validateBusinessWebsite = function (data) {
            if (data.businessWebsite() != "" && data.businessWebsite() != undefined) {
                if (!validateWebsite($("#businessWebsite").val())) {
                    $("#merchantAddWebsiteErrorTip").show();
                } else {
                    $("#merchantAddWebsiteErrorTip").hide();
                }
            } else {
                $("#merchantAddWebsiteErrorTip").hide();
            }
        }

        function mandatoryField() {
            if ($.trim($("#businessName").val()).length == 0 || $.trim($("#identifier").val()).length == 0 || $.trim($("#industryCode").val()).length == 0
                || $.trim($("#businessStreet1").val()).length == 0 || $.trim($("#businessTownCity").val()).length == 0 || $.trim($("#businessState").val()).length == 0
                || $.trim($("#businessContactCode").val()).length < 2 || $.trim($("#businessContactNumber").val()).length < 4 || $.trim($("#businessPostalCode").val()).length < 2 || $.trim($("#businessEmail").val()).length == 0) {
                $('#addBtn').prop('disabled', true);
            } else {
                $('#addBtn').prop('disabled', false);
            }
        }

        $("#logoAddMerchant").on("change", function () {
            uploadlogo = new Array();
            var files = !!this.files ? this.files : [];
            if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support

            if (/^image/.test(files[0].type)) { // only image file

                var fileSize = files[0].size;
                var maxSize = 3 * 1024 * 1024;
                var array = new Array()
                array = files[0].name.split(".");
                var fileExtension = array[array.length - 1];
                if (fileExtension.toLowerCase() == "jpg" || fileExtension.toLowerCase() == "png") {
                    if (fileSize <= maxSize) {
                        var reader = new FileReader(); // instance of the FileReader
                        reader.readAsDataURL(files[0]); // read the local file
                        fileToUpload = files[0];
                        uploadlogo = files[0].slice(0, files[0].size);
                        reader.onloadend = function () { // set image data as background of div
                            $("#imagePreview").css("background-image", "url(" + this.result + ")");
                        }
                    } else {
                        $("#logoAddMerchant").prop('value', "");
                        $("#imagePreview").css("background-image", "url(assets/images/no_image.jpg)");
                        openAlertpopup(1, 'image_size_cannot_exceed_3MB');
                    }
                } else {
                    $("#logoPreviewAddMerchant").prop('value', "");
                    openAlertpopup(1, 'image_type_should_be_jpg_or_png');
                }
            } else {
                openAlertpopup(1, 'please_select_an_image_file');
            }
        });

        $("#imagePreview").css("background-image", "url(assets/images/no_image.jpg)");
        self.browseFile = function () {
            $("#logoAddMerchant").click();
        }

        //Reset call
        self.resetCall = function () {
            self.businessName('');
            self.identifier('');
            self.industryCode('');
            self.businessStreet1('');
            self.businessStreet2('');
            self.businessTownCity('');
            self.businessState('');
            self.businessContactNumber('');
            self.businessContactCode('');
            self.businessPostalCode('');
            self.businessEmail('');
            $("#addBtn").prop("disabled", true);
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
        self.businessName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_business_name', {
                    lng: lang
                })
            }
        });

        self.businessTownCity = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_town_city', {
                    lng: lang
                })
            }
        });
        self.identifier = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_mid', {
                    lng: lang
                })
            }
        });
        self.industryCode = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_industrycode', {
                    lng: lang
                })
            }
        });

        self.businessStreet1 = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_street1', {
                    lng: lang
                })
            }
        });

        self.businessState = ko.observable("").extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_state_province', {
                    lng: lang
                })
            }
        });

        self.businessContactCode = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_contact_code', {
                    lng: lang
                })
            }
        });

        self.businessContactNumber = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_contact_number', {
                    lng: lang
                })
            }
        });
        self.businessPostalCode = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_postal_code', {
                    lng: lang
                })
            }
        });
        self.businessEmail = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('Please_enter_valid_Email_ID', {
                    lng: lang
                })
            }
        });



        function checkerror() {
            var retval = '';

            var businessName = $("input#businessName");
            var identifier = $("input#identifier");

            businessName.val(businessName.val().replace(/^\s+/, ""));
            identifier.val(identifier.val().replace(/^\s+/, ""));
            
            if (($("#businessEmail").val() && $("#businessEmail").val() != "" && !validateEmail($("#businessEmail").val()))) {
                retval += 'email Id';
                $("#merchantAddEmailErrorTip").show();
            } else {
                retval = '';
                $("#merchantAddEmailErrorTip").hide();
            }
            if (($("#businessWebsite").val() && $("#businessWebsite").val() != "" && !validateWebsite($("#businessWebsite").val()))) {
                retval += 'website';
                $("#merchantAddWebsiteErrorTip").show();
            } else {
                retval = '';
                $("#merchantAddWebsiteErrorTip").hide();
            }

            return retval;
        };

        self.addMerchant = function (gId, observableModelPopup) {
            var retval = checkerror();
            if (retval == null || retval == "") {
                if (fileToUpload != '') {
                    uploadLogoFile(gId, observableModelPopup);
                } else {
                    self.addMerchantDetails(gId, observableModelPopup);
                }
            }
        }

        function uploadLogoFile(gId, observableModelPopup) {
            $("#loadingDiv").show();
            var xhr = new XMLHttpRequest();
            var formData = new FormData();
            formData.append("opmlFile", fileToUpload);

            var callbackFunction = function () {
                $("#loadingDiv").hide();
                if (xhr) {
                    if (xhr.status == AppConstants.get('POST_SUCCESS')) {       //200
                        logoURL = xhr.response;
                        logoURL = logoURL.replace(/"/g, "");
                        self.addMerchantDetails(gId, observableModelPopup);
                        fileToUpload = '';
                    }
                }
            }

            var params = formData;
            xhr.open('POST', AppConstants.get('GATEWAY_API_URL') + '/merchants/' + 0 + '/logo?customerId=' + customerID, true);
            xhr.setRequestHeader('Content-length', uploadlogo.size);
            xhr.setRequestHeader("Authorization", TOKEN());
            xhr.onload = callbackFunction;
            xhr.send(formData);
        }

        self.addMerchantDetails = function (gId, observableModelPopup) {
            $("#loadingDiv").show();
            var merchantObj = new Object();
            merchantObj.name = $("#businessName").val();
            merchantObj.industryCode = $("#industryCode").val();
            merchantObj.merchantIdentifier = $("#identifier").val();
            merchantObj.country = "US";
            merchantObj.street1 = $("#businessStreet1").val();
            merchantObj.street2 = $("#businessStreet2").val();
            merchantObj.city = $("#businessTownCity").val();
            merchantObj.state = $("#businessState").val();
            merchantObj.postalCode = $("#businessPostalCode").val();
            merchantObj.countryCode = $("#businessContactCode").val();
            merchantObj.contactPhone = $("#businessContactNumber").val();
            merchantObj.email = $("#businessEmail").val();
            merchantObj.website = $("#businessWebsite").val();
            merchantObj.createdBy = loggedInUserEmail;
            merchantObj.modifiedBy = loggedInUserEmail;
            merchantObj.commerceEnabled = false;
            merchantObj.logo = logoURL;

            function callbackFunction(data, response) {
                $("#loadingDiv").hide();
                if (response) {
                    if (response.status == AppConstants.get('CREATED')) {               //201
                        var merchantId = response.responseText;
                        openAlertpopup(0, 'Merchant_has_been_added_successfully');
                        globalVariableForSelectedMerchants = new Array();
                        var merchantObject = new Object();
                        merchantObject.id = merchantId;
                        globalVariableForSelectedMerchants.push(merchantObject);
                        globalVariableForSelectedMerchants.gId = gId;
                        observableModelPopup('unloadTemplate');
                        $('#merchantsModel').hide();
                        $('#viewMerchants').show();
                        //loadelement('modelEditMerchant', 'merchants');
                        //$('#viewMerchants').hide();
                        //$('#merchantsModel').show();
                        gridFilterClear(gId);
                    } else if (response.status == AppConstants.get('CONFLICTS')) {      //409
                        openAlertpopup(1, 'Merchant_already_exists');
                    }
                }
            }

            var method = 'merchants?customerId=' + customerID;
            var params = JSON.stringify(merchantObj);
            ajaxJsonCallWebAPI(method, params, callbackFunction, true, 'POST', false);
        }

    };
});

