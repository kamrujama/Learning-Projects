define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, koUtil) {
    var lang = getSysLang();
    uploadedfiledata = new Array();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function EditApplicationViewModel() {
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
        $("#modelAddApplication").draggable();
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

        self.modelOption = ko.observableArray();
        self.showSaveCancel = ko.observable(true);
        var Models = new Array();
        var model = new Object();
        model.ModelId = '3';
        model.ModelName = 'MX 880';
		
        Models.push(model);

        self.modelOption = Models;
        self.applicationGIDsList = ko.observableArray();
        $("#selectApplicationGID").get(0).selectedIndex = 2;
        

        self.modelsByPlatformList = ko.observableArray();
        self.selectedModelIds = ko.observableArray();
        //getModelsByPlatform(self.modelsByPlatformList, self.selectedModelIds,self.modelOption);
        var selectedId = getSelectedUniqueId('jqxgridDownloadlib');
        var source = _.where(globalVariableForEditPackage, { "selectedPackageId": selectedId[0] });

        var selectedId = getSelectedUniqueId('jqxgridApplications');
        var source = _.where(globalVariableForEditApplication, { "ApplicationId": selectedId[0] });

        var IsEnabledForAutomation = source[0].IsEnabledForAutomation;

        //if (!IsEnabledForAutomation) {
        //    $('#txtApplicationName').removeAttr('disabled');
        //    $('#txpAplicationVersion').removeAttr('disabled');
        //}

        getApplication(selectedId);


        //setIntialLoadData(self.modelsByPlatformList, self.selectedModelIds, self.modelOption);


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

        ///spinner
        $('[data-trigger="spinner"]').spinner();

        self.upNumber = function (data) {
            var id = '#txtAttrValue' + data.ConfigId;
            if ($(id).val() == '') {
                var number = 0;
            } else {
                var number = parseInt($(id).val());
            }
            if (number < 120) {
                number = number + 5;
                if (number > 120) {
                    number = 120;
                }
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
                if (number < 5) {
                    number = 5;
                }
            }
            $(id).val(number);
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

            //if (fileValue == "") {;
            //    retval += 'SELECT FILE';
            //    $("#ApplicationFile").append(i18n.t('please_selct_application'));
            //} else {
            //    retval += '';
            //    $("#ApplicationFile").empty();
            //}

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

        self.cancelconfirmation = function () {
            $("#modelConfirmation").modal('hide');
        }

        self.saveApplication = function (observableModelPopup) {
            var retval = checkerror();
            if (retval == null || retval == "") {
                $("#loadingDiv").show();
                var forselction = [];
                self.ModelNameArr([]);
                var desableflge = false;
                $('#modelTypeId :selected').each(function (i, selected) {
                    forselction[i] = $(selected).text();
                });
                self.ModelNameArr.push(forselction);

                var isExists = true;
                var Models = getmodelarr(self.ModelNameArr());
                var ModelIds = new Array();

                for (var i = 0; i < Models.length; i++) {
                    ModelIds.push(Models[i].ModelId);
                }

                for (var i = 0; i < self.selectedModelIds().length; i++) {
                    if ($.inArray(self.selectedModelIds()[i].toString(), ModelIds) == -1) {
                        isExists = false;
                        break;
                    }
                }

                if (isExists)
                    SetApplication_Soap(selectedId.toString(), self.ModelNameArr, self.GetConfigurableValuesForDownloadMedia, observableModelPopup);
                else {
                    $("#loadingDiv").hide();
                    $("#modelConfirmation").modal('show');
                }
            }
        }

        self.saveApplicationDetails = function (observableModelPopup) {
            SetApplication_Soap(selectedId.toString(), self.ModelNameArr, self.GetConfigurableValuesForDownloadMedia, observableModelPopup);
        }

        // Add Application using in Enter Key
        $("#editApplication").on('keypress', 'input, textarea, select', function (e) {
            var keyCode = e.which || e.keyCode;
            if (keyCode == 13) {

                var retval = checkerror();
                if (retval == null || retval == "") {
                    $("#loadingDiv").show();

                    var forselction = [];
                    self.ModelNameArr([]);
                    var desableflge = false;
                    $('#modelTypeId :selected').each(function (i, selected) {
                        forselction[i] = $(selected).text();
                    });
                    self.ModelNameArr.push(forselction);

                    SetApplication_Soap(selectedId.toString(), self.ModelNameArr, self.GetConfigurableValuesForDownloadMedia, observableModelPopup);

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
                $("#radioID").find("input").prop("disabled", false);
            } else {
                var forselction = [];
                self.ModelNameArr([]);
                var desableflge = false;
                $('#modelTypeId :selected').each(function (i, selected) {
                    forselction[i] = $(selected).text();
                });                
                self.ModelNameArr.push(forselction);
                $("#modelType").empty();
                self.isEnableAddBtn(true);
            }
        }

        function getApplication(applicationId) {
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        if (data && data.getApplicationResp) {
                            data.getApplicationResp = $.parseJSON(data.getApplicationResp);
                        }

                        if (data.getApplicationResp && data.getApplicationResp.Application) {
                            var application = data.getApplicationResp.Application;
                            self.ApplicationName(application.ApplicationName);
                            self.ApplicationVersion(application.ApplicationVersion);
                            $("#selcteFileEdit").prop('value', application.AppfileName);
                            self.allowDownloadChkbox(application.IsDownloadEnabled);
                            self.excludeFromMADChkbox(application.IsMultiAppExcluded);
                            self.performExcDwldChkbox(application.IsExclusiveDownload);
                            self.allowParamDwldChkbox(application.IsParameterDownload);
                            self.downloadAutomationChkbox(application.IsEnabledForAutomation);

                            if (!application.IsEnabledForAutomation)
                                $("#isdownloadAutomationEnable").show();
                            else
                                $("#isdownloadAutomationEnable").hide();

                            if (application.IsDACapable)
                                $('#chkdownloadAutomation').prop('disabled', false);
                            else
                                $('#chkdownloadAutomation').prop('disabled', true);

                            if (application.ModelIds) {
                                self.selectedModelIds(application.ModelIds);
                                getModelsByPlatform(self.modelsByPlatformList, application.ModelIds, self.modelOption);
                            }
                            if (application.AppGID) {
                                getAppGIDs(self.applicationGIDsList, application.AppGID);
                            }
                            if (application.ApplicationMedia) {
                                GetConfigurableValues(self.GetConfigurableValuesForDownloadMedia, application.ApplicationMedia);
                            }
         
                        }

                    } 
                }
            }

            var method = 'GetApplication';
            var params = '{"token":"' + TOKEN() + '" ,"applicationID":"' + applicationId + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        //clear filter of application
        self.clearfiltersaveApplication = function (gridId) {
            clearUiGridFilter(gridId);
        }

        seti18nResourceData(document, resourceStorage);
    };

    function GetConfigurableValues(GetConfigurableValuesForDownloadMedia, selectedApplicationMedia) {
        var category = AppConstants.get('Download_Media_List');

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if(data.genericConfigurations)
                    data.genericConfigurations = $.parseJSON(data.genericConfigurations);

                    var source = data.genericConfigurations;
                    for (var i = 0; i < source.length; i++) {
                        var value = _.where(selectedApplicationMedia, { "DownloadMediaId": source[i].ConfigId });
                        if (value[0])
                            source[i].ConfigValue = value[0].DownloadDuration;
                        //$("#txtAttrValue" + value[0].DownloadMediaId).prop('value', value[0].DownloadDuration);
                    }

                    GetConfigurableValuesForDownloadMedia(source);
                    
                }else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
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

    function getAppGIDs(appGids,appGID) {

        function callbackFunction(data, error) {
            if (data && data.getApplicationGIDResp) {
                data.getApplicationGIDResp = $.parseJSON(data.getApplicationGIDResp);
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    appGids(data.getApplicationGIDResp.ApplicationGID);
                    $('#selectApplicationGID').val(appGID).prop("selected", "selected");
                    $('#selectApplicationGID').trigger('chosen:updated');
                    //$("#selectApplicationGID").get(0).selectedIndex = appGID;
                }
            }
        }

        var method = 'GetApplicationGID';
        var params = '{"token":"' + TOKEN() + '" ,"applicationId":"' + 2 + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getModelsByPlatform(modelsList,modelIds,modelOption) {
        var platform = AppConstants.get('Add_Application_Platform');
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data && data.models) {
                        data.models = $.parseJSON(data.models);
                    }
                    modelsList(data.models);
                    for (var i = 0; i < modelIds.length; i++) {
                        $('select#modelTypeId option[value=' + modelIds[i] + ']').prop('selected', 'selected');
                        $("#modelTypeId").trigger('chosen:updated');
                    }
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
            mediaObj.DownloadDuration = $("#txtAttrValue" + items[i].ConfigId).val();
            attrList.push(mediaObj)
        }
        return attrList;
    }

    function getSelectedModelsCol(items, modelIds) {
        var attrList = new Array();
        if (modelIds && items) {
            for (var i = 0; i < modelIds.length; i++) {
                for (var j = 0; j < items.length; j++) {
                    if (items[j].ModelId == modelIds[i]) {
                        attrList.push(items[j]);
                    }
                }
            }
        }
        return attrList;
    }

    function SetApplication_Soap( applicationID,ModelNameArr, DownloadMediaArr, observableModelPopup) {

        var setApplicationReq = new Object();
        var Models = getmodelarr(ModelNameArr());        

        var DownloadMedias = new Array();
        setApplicationReq.AppGID = $("#selectApplicationGID").find('option:selected').val();
        setApplicationReq.AppfileName = $("#selcteFileEdit").val();
        setApplicationReq.ApplicationName = $("#txtApplicationName").val();
        setApplicationReq.ApplicationVersion = $("#txpAplicationVersion").val();
        setApplicationReq.ApplicationId = applicationID;
        setApplicationReq.IsDownloadEnabled = ($("#chkAllowDownload").is(':checked')) ? true : false;
        setApplicationReq.IsExclusiveDownload = ($("#chkperformExcDwld").is(':checked')) ? true : false;
        setApplicationReq.IsMultiAppExcluded = ($("#chkExcludeFromMADChkbox").is(':checked')) ? true : false;
        setApplicationReq.IsParameterDownload = ($("#chkallowParamDwldChkbox").is(':checked')) ? true : false;
        setApplicationReq.IsEnabledForAutomation = ($("#chkdownloadAutomation").is(':checked')) ? true : false;
        setApplicationReq.Models = Models;
        setApplicationReq.ApplicationMedia = downloadMediaCol(DownloadMediaArr());

        var callBackfunction = function (data, error) {
            $("#loadingDiv").hide();
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                gridFilterClear('jqxgridApplications');
                observableModelPopup('unloadTemplate');
                $("#loadingDiv").hide();
                $('#applicationModel').modal('hide');
                openAlertpopup(0, 'app_library_edit_success');
            } else if (data.responseStatus.StatusCode == AppConstants.get('Application_Already_Exists')) {
                openAlertpopup(1, 'A_Application_with_similar_contents_already_exists');
            } 
        }
        var params = '{"token":"' + TOKEN() + '","setApplicationReq":' + JSON.stringify(setApplicationReq) + '}';
        ajaxJsonCall('SetApplication', params, callBackfunction, true, 'POST', true);
        console.log("calling setApplication-" + new Date());
    }
});

