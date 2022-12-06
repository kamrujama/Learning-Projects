define(["knockout", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, ADSearchUtil, koUtil) {
    var lang = getSysLang();    
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function emailEditorViewModel() {
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
        var logoURL = '';
        var emailTemplateId = '';
        if (globalVariableForEmailTemplate) {
            emailTemplateId = globalVariableForEmailTemplate.id;
            logoURL = globalVariableForEmailTemplate.logoUrl;
        }

        $("#editor_area").ckeditor();
        $("#logoEmailEditor").on("change", function () {
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
                        $("#logoEmailEditor").prop('value', "");
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
            $("#logoEmailEditor").click();
        }

        self.cancelEmailEditor = function (observableModelPopup) {
            observableModelPopup('unloadTemplate');
            $('#modelEmailEditor').hide();
            $('#viewEmailTemplate').show();
        }

        self.previewEmail = function () {
            $('#previewModal').removeClass('hide');
            $('#previewModal').modal('show');

            $("#subjectPreview").text($("#txtSubject").val());
            $("#greetingPreviewDiv").text($("#txtGreeting").val());
            $("#emailContentPreviewDiv").html($("#editor_area").val());
            $("#btnActivatePreview").html($("#txtActivate").val());
            $("#signaturePreviewDiv").text($("#txtAreaSignature").val());

            if (logoURL != "") {
                $("#logoEmailPreview").attr("src", logoURL);
            } else {
                $("#logoEmailPreview").attr("src", "assets/images/no_image.jpg");
            }
        }

        self.closePreviewTemplate = function () {
            $('#previewModal').addClass('hide');
            $('#previewModal').modal('hide');
        }

        self.setEmailTemplate = function () {
            $("#txtSubject").val(globalVariableForEmailTemplate.subject);
            $("#txtGreeting").val(globalVariableForEmailTemplate.greeting);
            $("#editor_area").html(globalVariableForEmailTemplate.htmlBody);
            $("#txtActivate").val(globalVariableForEmailTemplate.activateButtonText);
            $("#txtAreaSignature").text(globalVariableForEmailTemplate.signature);

            if (globalVariableForEmailTemplate.logoUrl) {
                $("#imagePreview").attr("src", globalVariableForEmailTemplate.logoUrl);
            } else {
                $("#imagePreview").attr("src", "assets/images/no_image.jpg");
            }
        }

        self.setEmailTemplate(globalVariableForEmailTemplate);

        self.saveEmail = function (observableModelPopup) {
            if (fileToUpload != '') {
                uploadLogoFile(emailTemplateId, observableModelPopup);
            } else {
                self.saveEmailTemplate(emailTemplateId, observableModelPopup);
            }
        }

        function uploadLogoFile(emailTemplateId, observableModelPopup) {
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
                        self.saveEmailTemplate(emailTemplateId, observableModelPopup);
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

        self.saveEmailTemplate = function (emailTemplateId, observableModelPopup) {
            $("#loadingDiv").show();
            var emailObj = new Object();
            emailObj.activateButtonText = $("#txtActivate").val();
            emailObj.htmlBody = $("#editor_area").val();
            emailObj.plainBody = $("#editor_area").val();
            emailObj.greeting = $("#txtGreeting").val();
            emailObj.logoUrl = logoURL;
            emailObj.mailAction = "invite_merchant";
            emailObj.objectURL = '';
            emailObj.rtl = $("#chkDirection").is(":checked") ? true : false;
            emailObj.signature = $("#txtAreaSignature").val();
            emailObj.subject = $("#txtSubject").val();

            function callbackFunction(data, response) {
                $("#loadingDiv").hide();
                if (response) {
                    if (response.status == AppConstants.get('PATCH_NO_CONTENT')) {      //201
                        observableModelPopup('unloadTemplate');
                        openAlertpopup(0, 'email_template_saved_successfully');
                        getEmailTemplate();
                        $('#modelEmailEditor').hide();
                        $('#viewEmailTemplate').show();
                    }
                }
            }

            var method = "email/" + emailTemplateId + '?customerId=' + customerID;
            var params = JSON.stringify(emailObj);
            ajaxJsonCallWebAPI(method, params, callbackFunction, true, 'PATCH', false);
        }

        function getEmailTemplate() {
            $("#loadingDiv").show();
            function callbackFunction(data, response) {
                if (data) {
                    if (response.status == AppConstants.get('GET_SUCCESS')) {       //200
                        globalVariableForEmailTemplate = data;
                        setUpdatedEmailTemplate(data);
                    }
                }
                $("#loadingDiv").hide();
            }

            var method = 'email/' + customerID;
            var params = null;
            ajaxJsonCallWebAPI(method, params, callbackFunction, true, 'GET', false);
        }

        function setUpdatedEmailTemplate(emailTemplate) {
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

    }

});