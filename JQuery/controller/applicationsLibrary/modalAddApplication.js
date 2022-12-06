define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, koUtil) {
    var lang = getSysLang();
    uploadedfiledata = new Array();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function AddapplicationViewModel() {
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
        var fileSize;

        //focus on second textbox
        $('#downloadModel').on('shown.bs.modal', function () {
            $('#applicationName').focus();
        })
        $('#modelAddApplicationHeader').mouseup(function () {
            $("#modelAddApplicationContent").draggable({ disabled: true });
        });

        $('#modelAddApplicationHeader').mousedown(function () {
            $("#modelAddApplicationContent").draggable({ disabled: false });
        });
        self.isEnableAddBtn = ko.observable(false);
        self.test = ko.observable();
        self.isApplicationAvailable = ko.observable(false);
        self.validetApplicationResponse = ko.observableArray();
        self.ModelNameArr = ko.observableArray();

        //Allow Download
        self.allowDownloadChkbox = ko.observable(false);
        self.allowDownloadChkboxClick = function () {
            if ($("#chkAllowDownload").is(':checked')) {
                $("#chkallowParamDwldChkbox").prop('checked', true);
                $("#chkallowParamDwldChkbox").prop('disabled', false);
        }
            else {
                $("#chkallowParamDwldChkbox").prop('checked', false);
                $("#chkallowParamDwldChkbox").prop('disabled', true);
            }
        }

        //Exlude From Multiple Application Downlaod
        self.excludeFromMADChkbox = ko.observable(false);
        self.excludeFromMADChkboxClick = function () {

        }


        //Allow Parameter Download
        self.allowParamDwldChkbox = ko.observable(false);
        self.allowParamDwldChkboxClick = function () {

        }


        //Perform Exclusive Download
        self.performExcDwldChkbox = ko.observable(false);
        self.performExcDwldChkboxClick = function () {

        }

        //Download Automation
        self.downloadAutomationChkbox = ko.observable(false);
        self.downloadAutomationChkboxClick = function () {

        }




        self.GetConfigurableValuesForDownloadMedia = ko.observableArray();
        GetConfigurableValues(self.GetConfigurableValuesForDownloadMedia);

        ///spinner
        $('[data-trigger="spinner"]').spinner();
        
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


        self.ApplicationFile = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_selct_application', {
                    lng: lang
                })
            }
        });

        self.ApplicationName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_enter_application_name', {
                    lng: lang
                })
            }
        });

        self.ApplicationVersion = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_enter_application_version', {
                    lng: lang
                })
            }
        });

        self.ModelName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_select_model', {
                    lng: lang
                })
            }
        });

        self.ConfigValue = ko.observable("").extend({
            required: {
                params: true,
                message: i18n.t('please_select_GID', {
                    lng: lang
                })
            }
        });

        self.enableAddBtnFunction = function () {
            self.isEnableAddBtn(true);
        }

        self.ValidateNumber = function (data) {
            var enteredNumber = $("#txtAttrValue" + data.ConfigId).val();
            if (enteredNumber > 120) {
                $("#txtAttrValue" + data.ConfigId).val(120);
            }
            else if (enteredNumber < 5) {
                $("#txtAttrValue" + data.ConfigId).val(5);
            }
        }

        //open upload file input dialog box on enter key
        $("#divBtnFileInput").on('keypress', function (e) {
            var keyCode = e.which || e.keyCode;
            if (keyCode == 13) {
                event.preventDefault();
                $('#fileinput').click();
            }
        });

        //end

        $("#validateGID").hide();

        function checkerror(chekVal) {
            var retval = '';
            $("#validateGID").empty();
            $("#modelType").empty();
            $("#ApplicationFile").empty();

            //applying filter
            var versionName = $("input#txtApplicationName");
            var contentName = $("input#txpAplicationVersion");
            versionName.val(versionName.val().replace(/^\s+/, ""));
            contentName.val(contentName.val().replace(/^\s+/, ""));

            if (fileValue == "") {;
                retval += 'SELECT FILE';
                $("#ApplicationFile").append(i18n.t('please_selct_application'));
            } else {
                retval += '';
                $("#ApplicationFile").empty();
            }

            if ($("#txtApplicationName").val() == "") {
                retval += 'login name';
                self.ApplicationName(null);
                $("#please_enter_application_name").show();
            } else {
                retval += '';
            }
            if ($("#txpAplicationVersion").val() == "") {
                retval += 'FILE VERSION';
                self.ApplicationVersion(null);
                $("#please_enter_file_version").show();
            } else {
                retval += '';
            }

            if ($("#modelTypeId").chosen().val() == null || $("#modelTypeId").chosen().val() == "" || $("#modelTypeId").chosen().val().length == 0) {
                retval += 'Select Model(s)';
                self.ModelName(null);
                $("#modelType").append(i18n.t('please_select_model'));
            } else {
                retval += '';
                $("#modelType").empty();

            }

            if ($("#selectApplicationGID").find('option:selected').text() == "Select GID") {
                retval += 'GID';
                self.ConfigValue(null);
                $("#please_select_GID").show();
                $("#validateGID").show();
                $("#validateGID").append(i18n.t('please_select_GID'));
            } else {
                retval += '';
                $("#validateGID").empty();
            }
            return retval;
        };

        self.modelOption = ko.observable();
        self.showSaveCancel = ko.observable(true);

        self.applicationGIDsList = ko.observableArray();
        getAppGIDs(self.applicationGIDsList);

        self.modelsByPlatformList = ko.observableArray();
        getModelsByPlatform(self.modelsByPlatformList);

        self.addApplication = function (observableModelPopup) {
            var retval = checkerror();
            if (retval == null || retval == "") {
                $("#loadingDiv").show();
                AddApplication_Soap(self.validetApplicationResponse(), self.ModelNameArr, self.GetConfigurableValuesForDownloadMedia, observableModelPopup);

            } else {

            }
        }

        // Add Application using in Enter Key
        $("#addApplication").on('keypress', 'input, textarea, select', function (e) {
            var keyCode = e.which || e.keyCode;
            if (keyCode == 13) {

                var retval = checkerror();
                if (retval == null || retval == "") {
                    $("#loadingDiv").show();
                    AddApplication_Soap(self.validetApplicationResponse(), self.ModelNameArr, self.GetConfigurableValuesForDownloadMedia, observableModelPopup);

                } else {
                    return false;
                }
            }
        });

        $('#txtApplicationName').keyup(function () {
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

        $('#txpAplicationVersion').keyup(function () {
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


        $("#fileinput").on('change keyup paste', function () {
            if ($("#fileinput").val() != "") {
                if (isAddButtonEnabled == false) {
                    $('#btn_uploadLibrary').removeAttr('disabled');
                }
            }
        });

        $("#txtApplicationName").on('change keyup paste', function () {
            if ($("#applicationName").val() != "") {
                if (isAddButtonEnabled == false) {
                    $('#btn_uploadLibrary').removeAttr('disabled');
                }
            }
        });

        $("#selectApplicationGID").on('change keyup paste', function () {
            if ($("#modelTypeId").val() != "") {
                if (isAddButtonEnabled == false) {
                    $('#btn_uploadLibrary').removeAttr('disabled');
                }
            }
        });

        $("#modelTypeId").on('change keyup paste', function () {
            if ($("#modelTypeId").val() != "") {
                if (isAddButtonEnabled == false) {
                    $('#btn_uploadLibrary').removeAttr('disabled');
                }
            }
        });

        $("#txpAplicationVersion").on('change keyup paste', function () {
            if ($("#fileVersion").val() != "") {
                if (isAddButtonEnabled == false) {
                    $('#btn_uploadLibrary').removeAttr('disabled');
                }
            }
        });

        // reset filter
        self.clearfilter = function (gridID) {
            gridFilterClear(gridID);
        }

        self.onChangeGIDEdit = function () {
            $("#validateGID").empty();
            if ($("#selectApplicationGID").find('option:selected').text() == "Select GID") {
                self.ConfigValue(null);
                $("#please_select_GID").show();
                $("#validateGID").append(i18n.t('please_select_GID'));
            } else {
                $("#validateGID").empty();
                self.isEnableAddBtn(true);
                if (isAddButtonEnabled == false)
                    $('#btn_uploadLibrary').removeAttr('disabled');
            }
        }

        self.onChangeModel = function () {
            $("#modelType").empty();
            if ($("#modelTypeId").chosen().val() == null || $("#modelTypeId").chosen().val() == "" || $("#modelTypeId").chosen().val().length == 0) {
                self.ModelName(null);
                $("#please_select_model").show();
                $("#modelType").append(i18n.t('please_select_model'));
                $("#radioID").find("input").prop("disabled", false);
            } else {
                var forselction = [];
                self.ModelNameArr([]);
                var desableflge = false;
                $('#modelTypeId :selected').each(function (i, selected) {
                    forselction[i] = $(selected).text();
                    var source = _.where(koUtil.getModelsFamily(), { ModelName: $(selected).text() });
                    if (source[0].Family == "PWM" || source[0].Family == "Vx") {
                        desableflge = true;
                    }
                });
                if (desableflge == true) {
                    $("#radioID").find("input").prop("disabled", true);
                } else {
                    $("#radioID").find("input").prop("disabled", false);
                }
                self.ModelNameArr.push(forselction);
                $("#modelType").empty();
                self.isEnableAddBtn(true);
            }
        }
        self.hideinfo = function () {
            $("#informationAddApplicationPopup").hide();
        }

        self.upNumber = function (data) {
            var id = '#txtAttrValue' + data.ConfigId;
            if ($(id).val() == '') {
                var number = 0;
            } else {
                var number = parseInt($(id).val());
            }
            if (number < 120) {
                number = number + 5;
            }
            $(id).val(number);
        }

        self.downNumber = function (data) {
            var id = '#txtAttrValue' + data.ConfigId;
            if ($(id).val() == '') {
                var number = 0;
            } else {
                var number = parseInt($(id).val());
            }
            if (number > 5) {
                number = number - 5;
            }
            $(id).val(number);
        }

        var fileValue = "";

        self.handleFileSelect = function () {

            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                openAlertpopup(1, 'the_file_apis_are_not_fully_supported_in_this_browser');
                return;
            }
            input = document.getElementById('fileinput');
            if (!input) {
                openAlertpopup(1, 'cannot_find_the_fileinput_element');

            }
            else if (!input.files) {
                openAlertpopup(1, "this_browser_doesn't_seem_to_support_the_`files`_property_of_file_inputs");
            }
            else if (!input.files[0]) {
                return;
            }
            else {
                file = input.files[0];
                fileSize = input.files[0].size;
                if (validateFileName(file.name, 7)) {
                    $("#selectFile").prop('value', file.name);
                    fileValue = file.name;
                    if (fileValue != "") {
                        $("#ApplicationFile").empty();
                    }
                    fr = new FileReader();
                    fr.onload = receivedText;
                    fr.readAsDataURL(file);
                    self.allowDownloadChkbox(true);
                    self.allowParamDwldChkbox(true);
                } else {
                    $("#selectFile").prop('value', '');
                    openAlertpopup(1, 'selected_file_format_not_supported');

                    // reset upload 
                    var fileopen = $("#fileinput"),
                    clone = fileopen.clone(true);
                    fileopen.replaceWith(clone);
                }
            }
        }

        function receivedText() {
            ValidateApplication(self.validetApplicationResponse, self.ApplicationName, self.ApplicationVersion, self.downloadAutomationChkbox);
        }

        //clear filter of application
        self.clearfilterAddApplication = function (gridId) {
            clearUiGridFilter(gridId);
        }

        seti18nResourceData(document, resourceStorage);
    };

    function openAddApplicationAlertpopup(flage, msg) {

        if (flage == 0) {

            $("#informationAddApplicationPopup").modal("show");
            $("#infoAddApplicationHead").text(i18n.t('success', { lng: lang }));
            $("#infoAddApplicationHead").addClass('c-green');
            $("#infoAddApplicationHead").removeClass('c-blue');
            $("#infoAddApplicationHead").removeClass('c-red');
            $("#infoAddApplicationicon").removeClass('icon-information c-blue');
            $("#infoAddApplicationicon").removeClass('icon-times-circle c-red');
            $("#infoAddApplicationicon").addClass('icon-checkmark c-green');
            $("#infoAddApplicationBtnOk").removeClass('btn-danger');
            $("#infoAddApplicationBtnOk").removeClass('btn-primary');
            $("#infoAddApplicationBtnOk").addClass('btn-success');
            $("#infoAddApplicationMessage").text(i18n.t(msg, { lng: lang }));
        } else if (flage == 1) {
            $("#informationAddApplicationPopup").modal("show");
            $("#infoAddApplicationHead").text(i18n.t('information_title', { lng: lang }));
            $("#infoAddApplicationHead").addClass('c-blue');
            $("#infoAddApplicationHead").removeClass('c-green');
            $("#infoAddApplicationHead").removeClass('c-red');
            $("#infoAddApplicationicon").removeClass('icon-times-circle c-red');
            $("#infoAddApplicationicon").removeClass('icon-checkmark c-green');
            $("#infoAddApplicationicon").addClass('icon-information c-blue');
            $("#infoAddApplicationBtnOk").removeClass('btn-danger');
            $("#infoAddApplicationBtnOk").removeClass('btn-success');
            $("#infoAddApplicationBtnOk").addClass('btn-primary');
            $("#infoAddApplicationMessage").text(i18n.t(msg, { lng: lang }));
        } else if (flage == 2) {
            $("#informationAddApplicationPopup").modal("show");
            $("#infoAddApplicationHead").text(i18n.t('error', { lng: lang }));
            $("#infoAddApplicationHead").addClass('c-red');
            $("#infoAddApplicationHead").removeClass('c-green');
            $("#infoAddApplicationHead").removeClass('c-blue');
            $("#infoAddApplicationicon").removeClass('icon-checkmark c-green');
            $("#infoAddApplicationicon").removeClass('icon-information c-blue');
            $("#infoAddApplicationicon").addClass('icon-times-circle c-red');
            $("#infoAddApplicationBtnOk").removeClass('btn-primary');
            $("#infoAddApplicationBtnOk").removeClass('btn-success');
            $("#infoAddApplicationBtnOk").addClass('btn-danger');
            $("#infoAddApplicationMessage").text(i18n.t(msg, { lng: lang }));
        } else if (flage == 3) {
            $("#informationAddApplicationPopup").modal("show");
            $("#infoAddApplicationHead").text(i18n.t('notification_title', { lng: lang }));
            $("#infoAddApplicationHead").addClass('c-blue');
            $("#infoAddApplicationHead").removeClass('c-green');
            $("#infoAddApplicationHead").removeClass('c-red');
            $("#infoAddApplicationicon").removeClass('icon-times-circle c-red');
            $("#infoAddApplicationicon").removeClass('icon-checkmark c-green');
            $("#infoAddApplicationicon").addClass('icon-information c-blue');
            $("#infoAddApplicationBtnOk").removeClass('btn-danger');
            $("#infoAddApplicationBtnOk").removeClass('btn-success');
            $("#infoAddApplicationBtnOk").addClass('btn-primary');
            $("#infoAddApplicationMessage").text(i18n.t(msg, { lng: lang }));
        } else if (flage == 4) {
            $("#informationAddApplicationPopup").modal("show");
            $("#infoAddApplicationHead").text(i18n.t('confirmation_title', { lng: lang }));
            $("#infoAddApplicationHead").addClass('c-blue');
            $("#infoAddApplicationHead").removeClass('c-green');
            $("#infoAddApplicationHead").removeClass('c-red');
            $("#infoAddApplicationicon").removeClass('icon-times-circle c-red');
            $("#infoAddApplicationicon").removeClass('icon-checkmark c-green');
            $("#infoAddApplicationicon").addClass('icon-information c-blue');
            $("#infoAddApplicationBtnOk").removeClass('btn-danger');
            $("#infoAddApplicationBtnOk").removeClass('btn-success');
            $("#infoAddApplicationBtnOk").addClass('btn-primary');
            $("#infoAddApplicationMessage").text(i18n.t(msg, { lng: lang }));
        }

    }

    function ValidateApplication(validetApplicationResponse, applicationName, applicationVersion, IsEnabledForAutomation) {
        $("#loader1").show();
        var xhr = new XMLHttpRequest();
        xhr.open('POST', AppConstants.get('API_URL') + "/ValidateApplication", false);
        var context = this;
        var tokenString = TOKEN();

        var formData = new FormData();
        var files = $("#fileinput").get(0).files;
        formData.append("FileName", $("#selectFile").val());
        formData.append("opmlFile", files[0]);
        formData.append('Authorization', tokenString);
        xhr.onreadystatechange = function (data) {
            var jsonData = JSON.parse(xhr.responseText);
            if (jsonData.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                if (jsonData.validateApplicationResp) {
                    ValidateBundleData = new Object();
                    ValidateBundleData.ApplicationName = jsonData.validateApplicationResp.ApplicationName;
                    applicationName(ValidateBundleData.ApplicationName);
                    ValidateBundleData.ApplicationVersion = jsonData.validateApplicationResp.ApplicationVersion;
                    applicationVersion(ValidateBundleData.ApplicationVersion);
                    ValidateBundleData.TempFilePath = jsonData.validateApplicationResp.TempFilePath;
                    ValidateBundleData.IsEnabledForAutomation = jsonData.validateApplicationResp.IsEnabledForAutomation;
                    IsEnabledForAutomation(ValidateBundleData.IsEnabledForAutomation);
                    validetApplicationResponse(ValidateBundleData);
                    if (ValidateBundleData.IsEnabledForAutomation) {
                        $('#chkdownloadAutomation').removeAttr('disabled');
                        $('#applicationName_Version').find("input").prop("disabled", true);
                        $('#downloadAutomation').find("input").prop("disabled", false);
                        $("#isDisableDownloadDuration").hide();
                    } else {
                        $('#downloadAutomation').find("input").prop("disabled", true);
                        $('#applicationName_Version').find("input").prop("disabled", false);
                        openAlertpopup(1, 'app_library_Doesnot_Support_AutomateDownloads');
                        $("#isDisableDownloadDuration").show();
                    }
                }

            } else if (jsonData.responseStatus.StatusCode == AppConstants.get('SYSTEM_BUSY')) {
                openAlertpopup(2, 'system_busy_try_again');
            } else if (jsonData.responseStatus.StatusCode == AppConstants.get('E_FILE_FORMAT_NOT_SUPPORTED')) {
                openAlertpopup(1, 'selected_file_format_not_supported');
            } else if (jsonData.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR')) {
                openAlertpopup(2, 'internal_error_api');
            }
            $("#loader1").hide();
        };
        xhr.send(formData);
    }

    function GetConfigurableValues(GetConfigurableValuesForDownloadMedia) {
        var category = AppConstants.get('Download_Media_List');

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if(data.genericConfigurations)
                    data.genericConfigurations = $.parseJSON(data.genericConfigurations);

                    GetConfigurableValuesForDownloadMedia(data.genericConfigurations);
                } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                    $("#loadingDiv").hide();
                    Token_Expired();
                }
            }
            if (error) {
                $("#loadingDiv").hide();
            }
        }

        var method = 'GetConfigurationValues';
        var params = '{"token":"' + TOKEN() + '","category":"' + category + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getAppGIDs(appGids) {

        function callbackFunction(data, error) {
            if (data && data.getApplicationGIDResp) {
                data.getApplicationGIDResp = $.parseJSON(data.getApplicationGIDResp);
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    appGids(data.getApplicationGIDResp.ApplicationGID);
                } 
            }
        }

        var method = 'GetApplicationGID';
        var params = '{"token":"' + TOKEN() + '" ,"applicationId":"' + 2 + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getModelsByPlatform(modelsList) {
        var platform = AppConstants.get('Add_Application_Platform');
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data && data.models) {
                        data.models = $.parseJSON(data.models);
                    }

                    modelsList(data.models);
                } 
            }
        }

        var method = 'GetModelsByPlatform';
        var params = '{"token":"' + TOKEN() + '" ,"platform":"' + platform + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getmodelarr(model) {
        var selectedModelId = $("#modelTypeId").chosen().val();
        var selectedModelName = model[0];
        var modelNew = new Array();
        if (selectedModelId && selectedModelId.length > 0) {
            for (var i = 0; i < selectedModelId.length; i++) {
                var EModel = new Object();
                EModel.ModelId = selectedModelId[i];
                EModel.ModelName = selectedModelName[i];
                modelNew.push(EModel);
            }
        }
        return modelNew;
    }

    function downloadMediaCol(items) {
        var attrList = new Array();
        var mediaObj;
        for (var i = 0; i < items.length; i++) {
            mediaObj = new Object();
            mediaObj.DownloadMediaId = items[i].ConfigId;
            mediaObj.Duration = $("#txtAttrValue" + items[i].ConfigId).val();
            attrList.push(mediaObj)
        }
        return attrList;
    }

    function AddApplication_Soap(ValidateApplicationData, ModelNameArr, DownloadMediaArr, observableModelPopup) {

        var addApplicationReq = new Object();
        var Models = getmodelarr(ModelNameArr());

        var DownloadMedias = new Array();
        addApplicationReq.AppGid = $("#selectApplicationGID").find('option:selected').val();
        addApplicationReq.ApplicationFileName = $("#selectFile").val();
        addApplicationReq.ApplicationName = $("#txtApplicationName").val();
        addApplicationReq.ApplicationVersion = $("#txpAplicationVersion").val();
        
        addApplicationReq.IsDACapable = ValidateApplicationData.IsEnabledForAutomation;
        addApplicationReq.IsDownloadEnabled = ($("#chkAllowDownload").is(':checked')) ? true : false;
        addApplicationReq.IsEnabledForAutomation = ($("#chkdownloadAutomation").is(':checked')) ? true : false; //ValidateApplicationData.IsEnabledForAutomation;
        addApplicationReq.IsExclusiveDownload = ($("#chkperformExcDwld").is(':checked')) ? true : false;
        addApplicationReq.IsMultiAppExcluded = ($("#chkExcludeFromMADChkbox").is(':checked')) ? true : false;
        addApplicationReq.IsParameterDldAllowed = ($("#chkallowParamDwldChkbox").is(':checked')) ? true : false;
        
        addApplicationReq.TempFilePath = ValidateApplicationData.TempFilePath;
        addApplicationReq.Models = Models;
        addApplicationReq.DownloadMedias = downloadMediaCol(DownloadMediaArr());

        var callBackfunction = function (data, error) {
            $("#loadingDiv").hide();
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                gridFilterClear('jqxgridApplications');
                observableModelPopup('unloadTemplate');
                $("#loadingDiv").hide();
                $('#applicationModel').modal('hide');
                openAlertpopup(0, 'app_library_add_success');
            } else if (data.responseStatus.StatusCode == AppConstants.get('Application_Already_Exists')) {
                openAlertpopup(1, 'A_Application_with_similar_contents_already_exists');
            }
        }
        var params = '{"token":"' + TOKEN() + '","addApplicationReq":' + JSON.stringify(addApplicationReq) + '}';
        ajaxJsonCall('AddApplication', params, callBackfunction, true, 'POST', true);
        console.log("calling addapplication-" + new Date());
    }
});

