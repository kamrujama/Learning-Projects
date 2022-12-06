define(["knockout", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, ADSearchUtil, koUtil) {
    var lang = getSysLang();
    userActionItem = '';
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
        var modelname = 'unloadTemplate';
        
        self.businessName = ko.observable();
        self.industryCode = ko.observable();
        self.identifier = ko.observable();
        self.businessCountry = ko.observable();
        self.addressLine1 = ko.observable();
        self.addressLine2 = ko.observable();
        self.businessWebsite = ko.observable();
        self.businessContactNumber = ko.observable();
        self.businessEmail = ko.observable();
        self.merchantSince = ko.observable();
        self.logoURL = ko.observable();
        self.merchantName = ko.observable();
        self.merchantEmail = ko.observable();
        self.accountStatus = ko.observable();
        self.updatedDate = ko.observable();
        self.userRole = ko.observable();
        koUtil.isFromViewMerchant = true;
        self.observableModelPopup = ko.observable();
        loadelement(modelname, 'genericPopup', self.observableModelPopup);

        function loadelement(elementname, controllerId, observableModelPopup) {
          
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            observableModelPopup(elementname);
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
            $('#merchantsModel').hide();
            $('#viewMerchants').show();
            koUtil.isFromViewMerchant = false;
        }
        $("#imagePreview").css("background-image", "url(assets/images/no_image.jpg)");
        self.setMerchantDetails = function (merchant) {
         //  merchant = $.parseJSON('{"Merchants":{"Id":"c3d10b02-bc31-4d92-a154-58c40d5fe6b7","BusinessName":"Tgpcaaet","MerchantName":"qaaa aa","BusinessEmail":"syed@tet.com","MerchantEmail":"nayam@gmail.com","MerchantSince":"2017-07-24T19:36:48.12+05:30","UpdatedDate":"2017-07-24T19:36:48.12+05:30","AccountStatus":"PENDING_ORACLE","LogoUrl":"https://verifonecp-qa-eo.s3-us-west-1.amazonaws.com/organizationsLogos/1500077839502.Verifone_Logo.jpg","Role":"Merchant Admin","ContactNum":"69897856","WebSite":"https://verifonetestqa.com","State":"CA","AddressLine1":"S1","AddressLine2":"s2","IndustryCode":"121442","City":"SAN FRANCISCO","ZipCode":"94128","Country":null,"mId":"asdaadfsdasd"}}');
          // merchant = merchant.Merchants;
            self.businessName(merchant.BusinessName);
            self.industryCode(merchant.IndustryCode);
            self.identifier(merchant.mId);
            self.businessCountry(merchant.Country);
            self.addressLine1(merchant.AddressLine1);
            self.addressLine2(merchant.AddressLine2);
            self.businessWebsite(merchant.WebSite);
            self.businessContactNumber(merchant.ContactNum);
            self.businessEmail(merchant.BusinessEmail);
            self.merchantSince(jsonLocalDateConversion(merchant.MerchantSince, 'DD/MMM/YYYY hh:mm:ss A'));
            self.logoURL(merchant.LogoUrl);
            self.merchantName(merchant.MerchantName);
            self.merchantEmail(merchant.MerchantEmail);
            if (merchant.AccountStatus == 'PENDING') {
                self.accountStatus('Pending');
                $('#userAccountStatus').addClass('btn-warning');
                $('#enableuserbtn').addClass('hide');
                $('#disableuserbtn').addClass('hide');
                $('#resendbtn').addClass('show');
                $('#resendhint').addClass('show');
            }else if(merchant.AccountStatus == 'ACTIVE'){
                self.accountStatus('Active');
                $('#resendhint').addClass('hide');
                $('#enableuserbtn').addClass('hide');
                $('#disableuserbtn').addClass('show');
                $('#resendbtn').addClass('hide');
                $('#userAccountStatus').addClass('btn-success');
            } else if (merchant.AccountStatus == 'DISABLED') {
                self.accountStatus('Disabled');
                $('#userAccountStatus').addClass('btn-danger');
                $('#resendhint').addClass('hide');
                $('#resendbtn').addClass('hide');
                $('#enableuserbtn').addClass('show');
                $('#disableuserbtn').addClass('hide');
            }
            self.updatedDate(jsonLocalDateConversion(merchant.MerchantSince, 'DD/MMM/YYYY hh:mm:ss A'));
            self.userRole(merchant.Role);
            $("#imagePreview").css("background-image", "url(" + merchant.LogoUrl + ")");
        }
        self.editMerchantDetails = function (observableModelPopup) {
            loadelement('modelEditMerchant', 'administration', observableModelPopup);
        }
        //self.setMerchantDetails({});
        self.openConfirmationPopup = function (action) {
            userActionItem = action;
            $('#invitationConfirmationPopup').modal('show');
            if (action == "resend") {
                $('#confirmPopupBtn').text(i18n.t('resend_btn_txt', { lng: lang }));
                $('#confirmPopupTitle').text(i18n.t('resend_invitaion_popup_title', { lng: lang }));
                $('#confirmationlabel').text(i18n.t('email_invitation_confirmation_label', { lng: lang }));
                $('#merchantInformation').text('Email: ' + self.merchantEmail());
            } else if (action == "enable") {
                $('#confirmPopupBtn').text(i18n.t('enable_user_btn_txt', { lng: lang }));
                $('#confirmPopupTitle').text(i18n.t('confirmation_enable_user_popup_title', { lng: lang }));
                $('#confirmationlabel').text(i18n.t('enable_user_confirmation_label', { lng: lang }));
                $('#merchantInformation').text('Name: ' + self.merchantName());
            } else if (action == "disable") {
                $('#confirmPopupBtn').text(i18n.t('disable_user_btn_txt', { lng: lang }));
                $('#confirmPopupTitle').text(i18n.t('confirmation_disable_user_popup_title', { lng: lang }));
                $('#confirmationlabel').text(i18n.t('disable_user_confirmation_label', { lng: lang }));
                $('#merchantInformation').text('Name: ' + self.merchantName());
            }            
        }
        self.closeConfirmation = function () {
            $("#invitationConfirmationPopup").modal('hide');
        }
        self.confirmMerchantAction = function () {          
                if (userActionItem == "resend") {
                    self.resendInvitation();
                } else if (userActionItem == "enable") {
                    self.enableMerchant();
                } else if (userActionItem == "disable") {
                    self.disableMerchant();
                }           
        }
        
       
        self.resendInvitation = function () {
            $("#loadingDiv").show();
            var resendInvitationReq = new Object();
            resendInvitationReq.PersonId = selectedMerchantId;
            function callbackFunction(data, error) {
                if (data) {                    
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {                     
                        openAlertpopup(0, 'email_invitation_was_sent');
                    }
                   
                }
                $("#loadingDiv").hide();
            }
            var method = 'ResendInvitationToMerchant';
            var params = '{"token":"' + TOKEN() + '","resendInvitationReq":"' + JSON.stringify(resendInvitationReq) + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        self.enableMerchant = function () {
            $("#loadingDiv").show();
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                      
                        openAlertpopup(0, 'user_account_enabled_success');
                    }
                   
                }
                $("#loadingDiv").hide();
            }
            var method = 'EnableMerchant';
            var params = '{"token":"' + TOKEN() + '","merchantId":"' + selectedMerchantId + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }
        self.disableMerchant = function () {
            $("#loadingDiv").show()
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(0, 'user_account_disabled_success');
                    }
                    
                }
                $("#loadingDiv").hide();
            }
            var method = 'DisableMerchant';
            var params = '{"token":"' + TOKEN() + '","merchantId":"' + selectedMerchantId + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }
        self.getEditMerchantDetails = function (merchantId) {
            $("#loadingDiv").show()
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        data.merchant = $.parseJSON(data.merchant);
                        self.setMerchantDetails(data.merchant.Merchants);
                       
                    }
                  
                }
                $("#loadingDiv").hide();
            }

            var method = 'GetMerchant';
            var params = '{"token":"' + TOKEN() + '","merchantadminId":"' + merchantId + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }
        self.getEditMerchantDetails(selectedMerchantId);

    };
});

