﻿var merchantUserActionType = '';
var merchantStatusActive = false;
define(["knockout", "advancedSearchUtil", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, ADSearchUtil, koUtil, autho) {
    var lang = getSysLang();
    selectedMerchantUserId = 0;    

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function editMerchantViewModel() {
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

        var uploadlogo = new Array();
        var fileToUpload = '';
        var logoURL = "";
        var selectedMerchantId = globalVariableForSelectedMerchants[0].id;
        var selectedTab = "merchantBusinessInfo";
        self.IsModified = ko.observable(false);
        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();
        self.observableModelPopupShowHide = ko.observable();        
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        loadelementForShowHide(modelname, 'genericPopup');
        self.modelOption = ko.observable();
        self.gridIdForShowHide = ko.observable();
        self.columnlist = ko.observableArray();
        self.businessCountry = ko.observable();
        self.businessStreet2 = ko.observable();
        self.businessWebsite = ko.observable();
        var compulsoryfields = ['email', 'status'];
        var isUserExists = false;
        isMerchantUserExists = false;

        if (IsAcquirerCommerceEnabled) {
            $("#commerceEnabledDiv").removeClass('hide');
        }
        if (globalVariableForSelectedMerchants[0].commerceEnabled == "Yes") {
            isMerchantUserExists = true;
            self.isCommerceEnabled = ko.observable(true);
        } else {
            self.isCommerceEnabled = ko.observable(false);
        }

        if (self.isCommerceEnabled() == true) {
            $("#liMerchantUsers").removeClass('hide');
            $("#chkCommerceEnabled").prop('disabled', true);
        } else {
            $("#liMerchantUsers").addClass('hide');
        }

        //Clear filter
        self.clearfilter = function (gId) {
            gridFilterClear(gId);
        }

        //Refresh Grid
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }

        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));

                if (visibleColumnsList.length == 0) {
                    var columns = self.columnlist();
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                }
                loadelementForShowHide(popupName, 'genericPopup');
                $('#modelShowHide').modal('show');
            } else if (popupName == "modelAddMerchantUsers") {
                loadelement(popupName, 'merchants');
                $('#editMerchantsView').hide();
                $('#merchantUsersView').show();

            } else if (popupName == "modelEditMerchantUsers") {     //Edit Merchant User not supported
                koUtil.isFromViewMerchant = false;
                var checkAll = checkAllSelected(gId);
                var selecteItemIds = getSelectedUniqueId(gId);
                var unSelecteItemIds = getUnSelectedUniqueId(gId);
                var datacount = getTotalRowcount(gId);

                if (checkAll == 1) {
                    if (unSelecteItemIds.length == datacount - 1) {
                        loadelement(popupName, 'merchants');
                        $('#editMerchantsView').hide();
                        $('#merchantUsersView').show();                        
                        editButtonClick(gId);
                    } else {
                        openAlertpopup(1, 'select_single_merchant_user_to_edit');
                        return;
                    }
                } else {
                    if (selecteItemIds.length == 1) {
                        loadelement(popupName, 'merchants');
                        $('#editMerchantsView').hide();
                        $('#merchantUsersView').show();
                        editButtonClick(gId);
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'Please_select_merchant_user.');
                        return;
                    } else if (selecteItemIds.length > 1) {
                        openAlertpopup(1, 'select_single_merchant_user_to_edit');
                        return;
                    }
                }
            }
        }

        //Edit button click
        function editButtonClick(gId) {
            globalVariableForSelectedMerchantUser = new Object();
            var selectedId = getMultiSelectedData(gId);
            globalVariableForSelectedMerchantUser = selectedId;
        }

        self.cancelSaveConfirmation = function () {
            $("#saveChangeConfirmation").modal('hide');
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(selectedTab + 'Tab').className += " active";
        }

        self.cancelMerchantUserAction = function () {
            $("#merchantUserActionConfirmation").modal('hide');
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

        self.merchantUserAction = function (gId) {
            $("#merchantUserActionConfirmation").modal('hide');
            $("#loadingDiv").show();

            function callbackFunction(data, response) {
                $("#loadingDiv").hide();
                if (response) {
                    if (response.status == AppConstants.get('PATCH_NO_CONTENT')) {      //204
                        if (merchantUserActionType == "Resend") {
                            openAlertpopup(0, 'merchant_resend_activation_email_success');
                        } else if (merchantUserActionType == "Disable") {
                            openAlertpopup(0, 'merchant_user_status_updated');
                        }
                        merchantUserActionType = '';
                        merchantStatusActive = false;
                        gridFilterClear(gId);
                    }
                }
            }
            if (merchantUserActionType == "Resend")
                var method = "merchants/" + selectedMerchantId + "/users/" + selectedMerchantUserId + "/resend/email"+'?customerId=' + customerID;
            else if (merchantUserActionType == "Disable")
                var method = "merchants/" + selectedMerchantId + "/users/" + selectedMerchantUserId + "/status/" + merchantStatusActive+'?customerId=' + customerID;
            var params = null;
            ajaxJsonCallWebAPI(method, params, callbackFunction, true, 'PATCH', false);
        }

        //Load Template
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        //Load element for show/hide
        function loadelementForShowHide(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopupShowHide(elementname);
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId) {
            self.observableModelPopup('unloadTemplate');
        }

        self.unloadTempPopup = function (popupName, gId) {
            self.observableModelPopupShowHide('unloadTemplate');
        }

        //focus on first textbox
        $('#downloadModel').on('shown.bs.modal', function () {
            $('#businessName').focus();
        })

        self.exportToExcel = function(gID) {
            var dataInfo = $("#" +gID).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                $("#" +gID).jqxGrid('exportdata', 'csv', 'Merchant Users');
                openAlertpopup(1, 'export_Information');
                $("#loadingDiv").hide();
            }
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

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            if (retval == true) {
                return false;
            } else {
                return true;
            }
        }

        self.cancelClick = function (observableModelPopup) {
            if (selectedTab == "merchantUsers" && isMerchantUserExists) {
                gridFilterClear("jqxgridMerchant");
            }
            observableModelPopup('unloadTemplate');
            $('#merchantsModel').hide();
            $('#viewMerchants').show();
        }

        self.nextClick = function (id) {
            $("#liMerchantUsers").removeClass('hide');
            self.tabSwitch(id);
        }

        self.previousClick = function(id) {
            $("#liMerchantUsers").addClass('hide');
            self.tabSwitch(id);
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
                    $("#merchantEditNameErrorTip").show();
                } else {
                    $("#merchantEditNameErrorTip").hide();
                }
            } else {
                $("#merchantEditNameErrorTip").hide();
            }
        }

        self.validateIndustryCode = function (data) {
            if (data.industryCode() != "" && data.industryCode() != undefined) {
                if (!validateIsNumber($("#industryCode").val())) {
                    $("#merchantEditIndustryCodeErrorTip").show();
                } else {
                    $("#merchantEditIndustryCodeErrorTip").hide();
                }
            } else {
                $("#merchantEditIndustryCodeErrorTip").hide();
            }
        }

        self.validatePostalCode = function (data) {
            if (data.businessPostalCode() != "" && data.businessPostalCode() != undefined) {
                if (!validatePostalCode($("#businessPostalCode").val())) {
                    $("#merchantEditPostalCodeErrorTip").show();
                } else {
                    $("#merchantEditPostalCodeErrorTip").hide();
                }
            } else {
                $("#merchantEditPostalCodeErrorTip").hide();
            }
        }

        self.validateContactNumber = function (data) {
            if (data.businessContactNumber() != "" && data.businessContactNumber() != undefined) {
                if (!validateIsNumber($("#businessContactNumber").val())) {
                    $("#merchantEditContactNumErrorTip").show();
                } else {
                    $("#merchantEditContactNumErrorTip").hide();
                }
            } else {
                $("#merchantEditContactNumErrorTip").hide();
            }
        }

        self.validateBusinessEmail = function (data) {
            if (data.businessEmail() != "" && data.businessEmail() != undefined) {
                if (!validateEmail($("#businessEmail").val())) {
                    $("#merchantEditEmailErrorTip").show();
                } else {
                    $("#merchantEditEmailErrorTip").hide();
                }
            } else {
                $("#merchantEditEmailErrorTip").hide();
            }
        }

        self.validateBusinessWebsite = function (data) {
            if (data.businessWebsite() != "" && data.businessWebsite() != undefined) {
                if (!validateWebsite($("#businessWebsite").val())) {
                    $("#merchantEditWebsiteErrorTip").show();
                } else {
                    $("#merchantEditWebsiteErrorTip").hide();
                }
            } else {
                $("#merchantEditWebsiteErrorTip").hide();
            }
        }

        function mandatoryField() {
            if ($.trim($("#businessName").val()).length == 0 || $.trim($("#identifier").val()).length == 0 || $.trim($("#industryCode").val()).length == 0
                || $.trim($("#businessStreet1").val()).length == 0 || $.trim($("#businessTownCity").val()).length == 0 || $.trim($("#businessState").val()).length == 0
                || $.trim($("#businessContactCode").val()).length < 2 || $.trim($("#businessContactNumber").val()).length < 4 || $.trim($("#businessPostalCode").val()).length < 2 || $.trim($("#businessEmail").val()).length == 0) {
                $('#editBtn').prop('disabled', true);
            } else {
                $('#editBtn').prop('disabled', false);
            }
        }
        ///////////////////////////////
        $("#logoEditMerchant").on("change", function () {
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
                            $("#logoPreviewEditMerchant").attr("src", this.result);
                            $('#editBtn').prop('disabled', false);
                        }
                    } else {
                        $("#logoEditMerchant").prop('value', "");
                        $("#logoPreviewEditMerchant").attr("src", "assets/images/no_image.jpg");
                        openAlertpopup(1, 'image_size_cannot_exceed_3MB');
                    }
                } else {
                    $("#logoEditMerchant").prop('value', "");
                    openAlertpopup(1, 'image_type_should_be_jpg_or_png');
                }
            }
        });
        
        self.browseFile = function () {
            $("#logoEditMerchant").click();
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
            $("#editBtn").prop("disabled", true);
        }

        self.changeCommerceEnabled = function () {
            if ($("#chkCommerceEnabled").is(':checked')) {
                $("#liMerchantUsers").removeClass('hide');
                self.isCommerceEnabled(true);
            } else {
                $("#liMerchantUsers").addClass('hide');
                self.isCommerceEnabled(false);
            }
            $('#editBtn').prop('disabled', false);
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
                
        self.tabChangeCheckforChanges = function (id, gId) {
            if (self.IsModified() == false) {
                self.tabSwitch(id, gId);
            } else if (self.IsChangesMadeToSave() == true) {
                $("#saveChangeConfirmation").modal('show');
            }
        }

        self.tabSwitch = function (id, gId) {
            var i, tabcontent, tablinks;
            // Get all elements with class="tabcontent" and hide them
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            // Get all elements with class="tablinks" and remove the class "active"
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            // Show the current tab, and add an "active" class to the button that opened the tab
            document.getElementById(id).style.display = "block";
            document.getElementById(id + 'Tab').className += "active";

            if (id == "merchantUsers") {
                //$("#btnMerchantNext").addClass('hide');
                //$("#btnMerchantPrev").removeClass('hide');
                
                if (globalVariableForSelectedMerchants[0].commerceEnabled == "Yes") {
                    $("#merchantUsersDiv").empty();
                    $('#merchantUsersDiv').html('<div id="jqxgridMerchantUsers"></div><div id="pagerDivMerchantUsers"></div>');
                    merchantUsersGrid(gId);
                } else {
                    blankMerchantUsersGrid(gId);
                }                
            } else if (id == "merchantBusinessInfo") {
                //$("#btnMerchantPrev").addClass('hide');
                //$("#btnMerchantNext").removeClass('hide');
            }

            selectedTab = id;
        }

        self.discardChanges = function () {
            if (selectedTab == 'merchantBusinessInfo') {

            } else if (selectedTab == 'merchantVenues') {

            } else if (selectedTab == 'merchantUsers') {

            }            
            
            $("#saveChangeConfirmation").modal('hide');
            self.IsModified(false);
        }

        self.setMerchantDetails = function (merchant) {
            self.businessName(merchant.name);
            self.industryCode(merchant.industryCode);
            self.identifier(merchant.merchantIdentifier);
            self.businessCountry(merchant.country);
            self.businessStreet1(merchant.street1);
            self.businessStreet2(merchant.street2);
            self.businessTownCity(merchant.city);
            self.businessState(merchant.state);
            self.businessWebsite(merchant.website);
            self.businessContactNumber(merchant.contactPhone);
            self.businessPostalCode(merchant.postalCode);
            self.businessContactCode(merchant.countryCode);
            self.businessEmail(merchant.email);
            logoURL = merchant.logo;

            if (merchant.logo) {
                $("#logoPreviewEditMerchant").attr("src", merchant.logo);
            } else {
                $("#logoPreviewEditMerchant").attr("src", "assets/images/no_image.jpg");
            }
        }

        self.getEditMerchantDetails = function (merchantId) {
            $("#loadingDiv").show();
            function callbackFunction(data, response) {
                if (data) {
                    if (response.status == AppConstants.get('GET_SUCCESS')) {   //200
                        self.setMerchantDetails(data);
                    }
                }
                $("#loadingDiv").hide();
            }

            var method = 'merchants/' + merchantId + '?customerId=' + customerID;
            var params = null;
            ajaxJsonCallWebAPI(method, params, callbackFunction, true, 'GET', false);
        }
        
        self.getEditMerchantDetails(selectedMerchantId);
        
        function checkerror() {
            var retval = '';

            var businessName = $("input#businessName");
            var identifier = $("input#identifier");

            businessName.val(businessName.val().replace(/^\s+/, ""));
            identifier.val(identifier.val().replace(/^\s+/, ""));

            if (($("#businessEmail").val() && $("#businessEmail").val() != "" && !validateEmail($("#businessEmail").val()))) {
                retval += 'email Id';
                $("#merchantEditEmailErrorTip").show();
            } else {
                retval = '';
                $("#merchantEditEmailErrorTip").hide();
            }
            if (($("#businessWebsite").val() && $("#businessWebsite").val() != "" && !validateWebsite($("#businessWebsite").val()))) {
                retval += 'website';
                $("#merchantEditWebsiteErrorTip").show();
            } else {
                retval = '';
                $("#merchantEditWebsiteErrorTip").hide();
            }
            return retval;
        };

        self.saveMerchant = function (gId, observableModelPopup) {
            //if (uploadlogo.size !=undefined) {
            //    self.uploadLogoFile(selectedMerchantId);
            //}
            var retval = checkerror();
            if (retval == null || retval == "") {
                if (globalVariableForSelectedMerchants[0].commerceEnabled == "No" && self.isCommerceEnabled()) {
                    openAlertpopup(1, "commerce_enabled_merchant_should_have_atleast_one_user");
                    return;
                }
                
                if (fileToUpload != '') { 
                    uploadLogoFile(gId, selectedMerchantId, observableModelPopup);
                } else {
                    self.saveMerchantDetails(gId, observableModelPopup, selectedMerchantId, self.isCommerceEnabled());
                }
            }
        }

        function uploadLogoFile(gId, merchantId, observableModelPopup) {
            $("#loadingDiv").show();
            var xhr = new XMLHttpRequest();
            var formData = new FormData();
            formData.append("opmlFile", fileToUpload);

            function callbackFunction() {
                $("#loadingDiv").hide();
                if (xhr) {
                    if (xhr.status == AppConstants.get('POST_SUCCESS')) {       //200
                        logoURL = xhr.response;
                        logoURL = logoURL.replace(/"/g, "");
                        self.saveMerchantDetails('jqxgridMerchant', observableModelPopup, selectedMerchantId, self.isCommerceEnabled());
                        fileToUpload = '';
                    }
                }                
            }

            var params = formData;
            xhr.open('POST', AppConstants.get('GATEWAY_API_URL') + '/merchants/' + merchantId + '/logo?customerId=' + customerID, true);
            xhr.setRequestHeader('Content-length', uploadlogo.size);
            xhr.setRequestHeader("Authorization", TOKEN());
            xhr.onload = callbackFunction;
            xhr.send(formData);
        }

        self.saveMerchantDetails = function (gId, observableModelPopup, selectedMerchantId, isCommerceEnabled) {
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
            merchantObj.logo = logoURL;

            function callbackFunction(data, response) {
                $("#loadingDiv").hide();
                if (response) {
                    if (response.status == AppConstants.get('PATCH_NO_CONTENT')) {      //201
                        observableModelPopup('unloadTemplate');
                        openAlertpopup(0, 'Merchant_changes_saved_successfully');
                        $('#merchantsModel').hide();
                        $('#viewMerchants').show();
                        gridFilterClear(gId);
                    } else if (response.status == AppConstants.get('CONFLICTS')) {
                        openAlertpopup(1, 'Merchant_already_exists');
                    }
                }                
            }

            var method = "merchants/" + selectedMerchantId + "?customerId=" + customerID;
            var params = JSON.stringify(merchantObj);
            ajaxJsonCallWebAPI(method, params, callbackFunction, true, 'PATCH', false);
        }

        
        /////////////////////////////////////////// Merchant Users /////////////////////////////////////////////////////

        function blankMerchantUsersGrid(gID) {

            //calculate height of grid
            var gridheight = $(window).height();
            var percentValue;
            if (gridheight > 600) {
                percentValue = (20 / 100) * gridheight;
                gridheight = gridheight - 150;

                gridheight = gridheight - percentValue + 'px';
            } else {
                gridheight = '400px';
            }
            ////////////////

            var InitGridStoragObj = initGridStorageObj(gID);
            var gridStorage = InitGridStoragObj.gridStorage;
            var adStorage = InitGridStoragObj.adStorage;
            var source =
            {
                dataType: "json",
                dataFields: [
                         { name: 'isSelected', type: 'number' },
                         { name: 'id', map: 'id' },
                         { name: 'firstname', map: 'firstname' },
                         { name: 'lastname', map: 'lastname' },
                         { name: 'email', map: 'email' },
                         { name: 'status', map: 'status' },
                         { name: 'action', map: 'action' },
                ],

                root: 'data',
                type: "GET",
                cache: true,
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                    data = [];
                },
            };

            var dataAdapter = new $.jqx.dataAdapter(source,
                {
                    formatData: function (data) {
                        disableIcons(['btnRestFilterUsers', 'btnShowHideUsers', 'btnExportToexcelUsers', 'btnRefreshUsers']);
                        if (isMerchantUserExists) {
                            merchantUsersGrid('jqxgridMerchantUsers');
                        }
                        return "";
                    },
                }
            );

            var buildFilterPanel = function (filterPanel, datafield) {
                genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
            }

            var buildFilterPanelMultiChoice = function (filterPanel, datafield, checkArr) {
                genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, checkArr);
            }

            $("#" + gID).jqxGrid(
            {
                height: gridHeightFunction(gID, "60"),
                width: "100%",
                pageable: true,
                editable: true,
                source: dataAdapter,
                altRows: true,
                virtualmode: true,
                pageSize: AppConstants.get('ROWSPERPAGE'),
                filterable: true,
                sortable: true,
                columnsResize: true,
                columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                rowsheight: 32,
                enabletooltips: true,
                autoshowfiltericon: true,
                rendergridrows: function () {
                    return dataAdapter.records;
                },

                ready: function () {
                    //callOnGridReady(gID, gridStorage);

                    var columns = genericHideShowColumn(gID, true, []);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                },

                columns: [
                        {
                            text: i18n.t('merchant_user_firstname', { lng: lang }), datafield: 'firstname', editable: false, minwidth: 100, filterable: false, sortable: false, menu: false
                        },
                        {
                            text: i18n.t('merchant_user_lastname', { lng: lang }), datafield: 'lastname', editable: false, minwidth: 100, filterable: false, sortable: false, menu: false
                        },
                        {
                            text: i18n.t('merchant_user_email', { lng: lang }), datafield: 'email', enabletooltips: false, editable: false, minwidth: 150, filterable: false, sortable: false, menu: false
                        },
                        {
                            text: i18n.t('merchant_user_status', { lng: lang }), datafield: 'status', editable: false, minwidth: 100, filterable: false, sortable: false, menu: false

                        },
                        {
                            text: i18n.t('merchant_user_action', { lng: lang }), datafield: '', enabletooltips: false, editable: false, minwidth: 100,
                            filterable: false, sortable: false, menu: false
                        }
                ]
            });
            getGridBiginEdit(gID, 'id', gridStorage);
            callGridFilter(gID, gridStorage);
            callGridSort(gID, gridStorage, 'id');
        }

        function merchantUsersGrid(gID) {

            //calculate height of grid
            var gridheight = $(window).height();
            var percentValue;
            if (gridheight > 600) {
                percentValue = (20 / 100) * gridheight;
                gridheight = gridheight - 150;

                gridheight = gridheight - percentValue + 'px';
            } else {
                gridheight = '400px';
            }
            ////////////////

            var InitGridStoragObj = initGridStorageObj(gID);
            var gridStorage = InitGridStoragObj.gridStorage;
            var adStorage = InitGridStoragObj.adStorage;
            var source =
            {
                dataType: "json",
                dataFields: [
                         { name: 'isSelected', type: 'number' },
                         { name: 'id', map: 'id' },
                         { name: 'firstName', map: 'firstName', type: 'string' },
                         { name: 'lastName', map: 'lastName', type: 'string' },
                         { name: 'email', map: 'email', type: 'string' },
                         { name: 'status', map: 'status', type: 'string' },
                ],

                root: 'data',
                type: "GET",
                cache: true,
                url: AppConstants.get('GATEWAY_API_URL') + "/merchants/" + selectedMerchantId + "/users?customerId=" + customerID,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", TOKEN());
                },
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data && data.metadata) {
                        source.totalrecords = data.metadata.count;
                        source.totalpages = (data.metadata.count % data.metadata.limit) == 0 ? (data.metadata.count / data.metadata.limit): Math.floor((data.metadata.count / data.metadata.limit) + 1);
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                    }
                },
            };

            var dataAdapter = new $.jqx.dataAdapter(source,
                {
                    formatData: function (data) {
                        $('.all-disabled').show();
                        disableIcons(['btnRestFilterUsers', 'btnShowHideUsers', 'btnExportToexcelUsers', 'btnRefreshUsers']);

                        var param = '';
                        var columnSortFilter = '';
                        columnSortFilter = getColumnSortFilterQuery(columnSortFilter, gID, gridStorage);
                        var paginationObject = new Object();
                        var pagination = getPaginationObject(paginationObject, gID);
                        var recordsPerPage = AppConstants.get('ROWSPERPAGE');
                        var skipIndex = 0;
                        if (pagination.PageNumber == 1) {
                            skipIndex = 0;
                        } else {
                            skipIndex = (pagination.PageNumber * recordsPerPage) - (recordsPerPage);
                        }
                        if (columnSortFilter == '') {
                            param = columnSortFilter + "limit=" + recordsPerPage + "&offset=" + skipIndex;
                        } else {
                            param = columnSortFilter + "&limit=" + recordsPerPage + "&offset=" + skipIndex;
                        }
                        updatepaginationOnState(gID, gridStorage, pagination.PageNumber, null, null);
                        return param;
                    },
                    downloadComplete: function (data, status, xhr) {
                        enableIcons(['btnRestFilterUsers', 'btnShowHideUsers', 'btnExportToexcelUsers', 'btnRefreshUsers']);
                        if (data && data.data && data.data.length > 0) {
                            isUserExists = true;                            
                            for (var i = 0; i < data.data.length; i++) {
                                data.data[i].status = data.data[i].status == 1 ? 'Pending Activation' : (data.data[i].status == 2 ? 'Activated' : (data.data[i].status == 3 ? 'Inactive' : ''));
                            }
                        } else {
                            source.totalrecords = 0;
                            source.totalpages = 0;
                            data = [];
                        }

                        if (isUserExists) {
                            $("#btnAddMerchantUser").addClass("disabled");
                            $("#btnAddMerchantUser").prop("disabled", true);
                        } else {
                            $("#btnAddMerchantUser").removeClass("disabled");
                            $("#btnAddMerchantUser").prop("disabled", false);
                        }
                        $('.all-disabled').hide();
                        $("#loadingDiv").hide();
                    },
                    loadError: function (jqXHR, status, error) {
                        $('.all-disabled').hide();
                        $("#loadingDiv").hide();
                        ajaxErrorHandlerForWebAPI(jqXHR, status, error);
                        enableIcons(['btnRestFilterUsers', 'btnShowHideUsers', 'btnExportToexcelUsers', 'btnRefreshUsers']);
                        if (jqXHR.status == AppConstants.get('GET_NO_CONTENT')) {                           //204
                            source.totalrecords = 0;
                            source.totalpages = 0;
                            dataAdapter.totalrecords = 0;
                        }
                        if (isUserExists) {
                            $("#btnAddMerchantUser").addClass("disabled");
                            $("#btnAddMerchantUser").prop("disabled", true);
                        } else {
                            $("#btnAddMerchantUser").removeClass("disabled");
                            $("#btnAddMerchantUser").prop("disabled", false);
                        }
                    }
                }
            );

            var buildFilterPanel = function (filterPanel, datafield) {
                genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
            }

            var buildFilterPanelMultiChoice = function (filterPanel, datafield, checkArr) {
                genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, 'status', false, checkArr);
            }

            var rendered = function (element) {
                enablegridfunctions(gID, 'id', element, gridStorage, true, 'pagerDivMerchantUsers', false, 0, 'id', null, null, null);
                return true;
            }

            var actionRenderer = function (row, columnField, value, defaulthtml) {
                var rowData = $("#" +gID).jqxGrid("getrowdata", row);
                var status = rowData ? rowData.status: '';

                if (status == "Pending Activation") {
                    return '<div class="btn btn-xs btn-default" id="btnPendingActivation" style="margin-top:5px;cursor:pointer;margin-left:10px;padding:2px 5px !important;"><a style="margin-left:5px;" height="60" width="50"onClick="resendActivationEmail(' + row + ')">Resend Activation Email</a></div>'
                } else if (status == "Activated") {
                    return '<div class="btn btn-xs btn-default" id="btnDisable" style="margin-top:5px;cursor:pointer;margin-left:10px;padding:2px 5px !important;"><a style="margin-left:5px;" height="60" width="50" onClick="changeMerchantUserStatus(' + row + ')">Disable</a></div>'
                } else if (status == "Inactive") {
                    return '<div class="btn btn-xs btn-default" id="btnDisable" style="margin-top:5px;cursor:pointer;margin-left:10px;padding:2px 5px !important;"><a style="margin-left:5px;" height="60" width="50" onClick="changeMerchantUserStatus(' + row + ')">Enable</a></div>'
                }
            }

            $("#" + gID).jqxGrid(
            {
                height: gridHeightFunction(gID, "60"),
                width: "100%",
                pageable: true,
                editable: true,
                source: dataAdapter,
                altRows: true,
                virtualmode: true,
                pageSize: AppConstants.get('ROWSPERPAGE'),
                filterable: true,
                sortable: true,
                columnsResize: true,
                columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                rowsheight: 32,
                enabletooltips: true,
                autoshowfiltericon: true,
                rendergridrows: function () {
                    return dataAdapter.records;
                },

                ready: function () {
                    //callOnGridReady(gID, gridStorage);

                    var columns = genericHideShowColumn(gID, true, []);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                },

                columns: [
                        {
                            text: '', menu: false, sortable: false, filterable: false, hidden: true, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false, exportable: false,
                            datafield: 'isSelected', minwidth: 0, maxwidth: 0, renderer: function () {
                                return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                            }, rendered: rendered
                        },
                        {
                            text: i18n.t('merchant_user_firstname', { lng: lang }), datafield: 'firstName', editable: false, minwidth: 100, filterable: true, filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('merchant_user_lastname', { lng: lang }), datafield: 'lastName', editable: false, minwidth: 100, filterable: true, filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },                        
                        {
                            text: i18n.t('merchant_user_email', { lng: lang }), datafield: 'email', enabletooltips: false, editable: false, minwidth: 150, filterable: true, filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('merchant_user_status', { lng: lang }), datafield: 'status', editable: false, minwidth: 100, filterable: true, filtertype: "custom",
                                createfilterpanel: function (datafield, filterPanel) {
                                    var statusArray =[{ Id: "1", Name: "Merchant User Status", ControlValue: "PENDINGACTIVATION", Value: "Pending Activation"
                                    },{ Id: "2", Name: "Merchant User Status", ControlValue: "ACTIVE", Value: "Activated" }, { Id: "3", Name: "Merchant User Status", ControlValue: "INACTIVE", Value: "Inactive"}];
                                    buildFilterPanelMultiChoice(filterPanel, datafield, statusArray);
                                }
                        },
                        {
                            text: i18n.t('merchant_user_action', { lng: lang }), datafield: '', enabletooltips: false, editable: false, minwidth: 100,
                                filterable: false, sortable: false, menu: false, exportable: false, cellsrenderer: actionRenderer
                        }
                ]
            });
            getGridBiginEdit(gID, 'id', gridStorage);
            callGridFilter(gID, gridStorage);
            callGridSort(gID, gridStorage, 'id');
        }

    };
});

function resendActivationEmail(row) {
    var rowData = $("#jqxgridMerchantUsers").jqxGrid("getrowdata", row);
    selectedMerchantUserId = rowData.id;
    merchantUserActionType = "Resend";
    $("#merchantUserActionConfirmation").modal('show');
    $("#merchantUserActionMsg").text(i18n.t("merchant_user_resend_activation_email_confirmation", { lng: lang }));
}

function changeMerchantUserStatus(row) {
    var rowData = $("#jqxgridMerchantUsers").jqxGrid("getrowdata", row);
    selectedMerchantUserId = rowData.id;
    merchantUserActionType = "Disable";
    merchantStatusActive = rowData.status == 'Activated' ? false : true;
    $("#merchantUserActionConfirmation").modal('show');
    if (rowData.status == "Activated")
        $("#merchantUserActionMsg").text(i18n.t("merchant_user_disable_confirmation", { lng: lang }));
    else if (rowData.status == "Inactive")
        $("#merchantUserActionMsg").text(i18n.t("merchant_user_enable_confirmation", { lng: lang }));
}