define(["knockout", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, ADSearchUtil, koUtil) {
    var lang = getSysLang();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function emailTemplateViewModel() {
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

        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();
        globalVariableForEmailTemplate = new Object();

        self.openPopup = function (popupName) {
            if (popupName == "merchantEmailEditor") {
                loadelement(popupName, 'merchants');
                $('#modelEmailEditor').show();
                $('#viewEmailTemplate').hide();
            }
        }

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
            var cunanem = tempname + '1';
            ko.components.register(tempname, {
                viewModel: { require: ViewName },
                template: { require: 'plugin/text!' + htmlName }
            });
        }

        self.closeEmailTemplate = function (observableModelPopup) {
            observableModelPopup('unloadTemplate');
            $('#merchantsModel').hide();
            $('#viewMerchants').show();
        }

        self.setEmailTemplate = function (emailTemplate) {
            $("#subject").text(emailTemplate.subject);
            $("#greetingDiv").text(emailTemplate.greeting);
            $("#emailContentDiv").html(emailTemplate.htmlBody);
            $("#btnActivate").html(emailTemplate.activateButtonText);
            $("#signatureDiv").text(emailTemplate.signature);

            if (emailTemplate.logoUrl) {
                $("#logoEmailTemplate").attr("src", emailTemplate.logoUrl);
            } else {
                $("#logoEmailTemplate").attr("src", "assets/images/no_image.jpg");
            }
        }

        self.getEmailTemplate = function () {
            $("#loadingDiv").show();
            function callbackFunction(data, response) {
                if (data) {
                    if (response.status == AppConstants.get('GET_SUCCESS')) {   //200
                        globalVariableForEmailTemplate = data;
                        self.setEmailTemplate(data);
                    }
                }
                $("#loadingDiv").hide();
            }

            var method = 'email/' + customerID;
            var params = null;
            ajaxJsonCallWebAPI(method, params, callbackFunction, true, 'GET', false);
        }

        self.getEmailTemplate();
    }

});