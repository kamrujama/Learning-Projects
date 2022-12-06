define(["knockout", "spinner", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "bootstrapDateTimePicker", "appEnum", "chosen", "moment"], function (ko, spinner, koUtil, autho) {

    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function modelViewApplicatonsParameterTemplate(data) {
        isIntialLoad = true;

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

        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#addTemplateConfirmPopup').on('shown.bs.modal', function (e) {
            $('#addTemplateConfirmPopup_Confo_No').focus();

        });
        $('#addTemplateConfirmPopup').keydown(function (e) {
            if ($('#addTemplateConfirmPopup_Confo_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#addTemplateConfirmPopup_Confo_Yes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------

        paramDataArray = new Array();

        tabContainer1 = new Array();

        paramLevel = 0;

        arrayForSetValue = new Array();
        arrayofeditvalue = new Array();
        arrayOfPrimaryIdentifierValue = new Array();
        isPrimaryIdentifierExist = false;
        var isPrimaryIdContainerHidden = false;
        var isPrimaryIdContainerDisabled =false;

        TemplateParamAppGID = '';

        arrayOfInstanceAddValue = new Array();

        var self = this;

        var retvalForBasicParamView = false;
        var retvalForAdvParamView = false;
        var retvalForBasicParamEdit = false;
        var retvalForAdvParamEdit = false;

        isAdpopup = 'open';
        self.showMoreInfo = ko.observable(false);
        self.observableModelPopupFiles = ko.observable();
        koUtil.currentScreen = 'TemplateAddInstance';
        var fileData = new Object();

        $('#mdlAddTemplateAppLevelInstanceHeader').mouseup(function () {
            $("#mdlAddTemplateAppLevelInstanceTemp").draggable({
                disabled: true
            });
        });

        $('#mdlAddTemplateAppLevelInstanceHeader').mousedown(function () {
            $("#mdlAddTemplateAppLevelInstanceTemp").draggable({
                disabled: false
            });
        });

        self.focusInMaskValue = function (data) {
			var id = '#templateAddTxt' + data.ParamId;
			isTabKeyPressed(id);
            if ((data.MaskValue && data.MaskValue.toUpperCase() == 'TRUE') || (data.PartialMask && data.PartialMask.toUpperCase() == 'TRUE')) {
                var paramValue = data.ParamValue;
				if (paramValue === undefined || paramValue === null || paramValue === "")
					paramValue = data.Default;
				$(id).val(paramValue);
            }
        }

        self.focusOutMaskValue = function (data) {
			var id = '#templateAddTxt' + data.ParamId;
			isTabKeyPressed(id);
            if (data.MaskValue && data.MaskValue.toUpperCase() == 'TRUE') {
                data.ParamValue = $(id).val();
                $(id).val('********');
                //$(id).val($(id).val()).prop("type", "password");
            }
            //Partial masking value based on Length and Direction
            if (data.PartialMask && data.PartialMask.toUpperCase() == 'TRUE') {
                var id = '#templateAddTxt' + data.ParamId;
                data.ParamValue = $(id).val();
                var paramValueLength = data.ParamValue ? data.ParamValue.length : 0;
                if (data.MaskLength && paramValueLength > data.MaskLength) {
                    if (data.MaskDirection && data.MaskDirection.toUpperCase() == AppConstants.get('PARTIAL_MASKING_DIRECTION_RIGHT')) {
                        var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - data.MaskLength) : '****';
                        $(id).val('****' + lastcharcters);
                    }
                    else if (data.MaskDirection && data.MaskDirection.toUpperCase() == AppConstants.get('PARTIAL_MASKING_DIRECTION_LEFT')) {
                        var Firstcharcters = $(id).val() ? $(id).val().substr(0, data.MaskLength) : '****';
                        $(id).val(Firstcharcters + '****');
                    }
                    else {
                        var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - data.MaskLength) : '****';
                        $(id).val('****' + lastcharcters);
                    }
                }
                else if (data.MaskLength && paramValueLength <= data.MaskLength) {
                    $(id).val('********');
                }
                else if (paramValueLength > 4) {
                    var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - 4) : '****';
                    $(id).val('****' + lastcharcters);

                }
                else {
                    $(id).val('********');
                }
            }
        }

        function loadelementPackageFiles(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopupFiles(elementname);
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

        self.unloadPackageFilesPopup = function (popupName) {
            self.observableModelPopupFiles('unloadTemplate');
            $("#addTemplateInstanceFilesModel").modal('hide');
            koUtil.parameterPackageId = 0;
        }

        self.JsonXmlData = ko.observable();
        self.templateXML = ko.observable();
        self.observableModelPopup = ko.observable();
        self.checkChange = ko.observable(false);
        self.templateFileFlag = ko.observable(false);
        checkRights();

        function checkRights() {
            retvalForBasicParamView = autho.checkRightsBYScreen('Basic Parameter Management', 'IsviewAllowed');
            retvalForAdvParamView = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsviewAllowed');
            retvalForBasicParamEdit = autho.checkRightsBYScreen('Basic Parameter Management', 'IsModifyAllowed');
            retvalForAdvParamEdit = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsModifyAllowed');
        }

        init();
        function init() {
            var containerData = $.xml2json(koUtil.editDevicetemplateXML);
            if (containerData && containerData.length == undefined) {
                containerData = $.makeArray(containerData);
            }
            if (containerData && containerData.length > 0) {
                koUtil.selectedlevelContainerId = getParameterContainerId(containerData);
                var fileTypeParametersCount = checkForFileId(containerData);
                if (fileTypeParametersCount > 0) {
                    getFileId(containerData, fileTypeParametersCount, null);
                    return;
                }
                if (koUtil.selectedFormFile && koUtil.selectedFormFile.length > 0 && koUtil.selectedFormFile[0].IsReferenceEnumeration) {
                    var referenceEnumContainer = new Array();
                    getReferenceEnumAttributes(containerData, referenceEnumContainer);
                    getParameterValuesForReferenceEnum(containerData, referenceEnumContainer);
                } else {
                    createContainerTabs(self.JsonXmlData);
                    $(document).ready(function () {
                        isIntialLoad = false;
                    });
                }
            }
        }

        //get Container Id
        function getParameterContainerId(containerData) {
            var containerId = 0;
            if (containerData[0].ParameterFile && containerData[0].ParameterFile.length === undefined) {
                containerData[0].ParameterFile = $.makeArray(containerData[0].ParameterFile);
            }
            if (containerData[0].ParameterFile && containerData[0].ParameterFile.length > 0) {
                for (var i = 0; i < containerData[0].ParameterFile.length; i++) {
                    if (containerData[0].ParameterFile[i].Container && containerData[0].ParameterFile[i].Container.length > 0) {
                        for (var j = 0; j < containerData[0].ParameterFile[i].Container.length; j++) {
                            if (containerData[0].ParameterFile[i].Container[j].Type === AppConstants.get('NORMAL')) {
                                if (containerData[0].ParameterFile[i].Container[j].Container && containerData[0].ParameterFile[i].Container[j].Container.length > 0) {
                                    if (containerData[0].ParameterFile[i].Container[j].Container[0].Param && containerData[0].ParameterFile[i].Container[j].Container[0].Param.length > 0) {
                                        containerId = containerData[0].ParameterFile[i].Container[j].Container[0].Param[0].ParamContainerId;
                                    } else {
                                        containerId = containerData[0].ParameterFile[i].Container[j].Container[0].Param.ParamContainerId;
                                    }
                                } else {
                                    if (containerData[0].ParameterFile[i].Container[j].Container.Param && containerData[0].ParameterFile[i].Container[j].Container.Param.length > 0) {
                                        containerId = containerData[0].ParameterFile[i].Container[j].Container.Param[0].ParamContainerId;
                                    } else {
                                        containerId = containerData[0].ParameterFile[i].Container[j].Container.Param.ParamContainerId;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return containerId;
        }

        //check if File Id parameter exists
        function checkForFileId(containerData) {
            var fileParametersCount = 0;
            if (containerData && containerData.length > 0) {
                for (var i = 0; i < containerData.length; i++) {
                    if (containerData && containerData[i].ParameterFile && containerData[i].ParameterFile.length === undefined) {
                        containerData[i].ParameterFile = $.makeArray(containerData[i].ParameterFile);
                    }
                    if (containerData[i].ParameterFile && containerData[i].ParameterFile.length > 0) {
                        for (var j = 0; j < containerData[i].ParameterFile.length; j++) {
                            if (containerData[i].ParameterFile[j].Container && containerData[i].ParameterFile[j].Container.length > 0) {
                                for (var k = 0; k < containerData[i].ParameterFile[j].Container.length; k++) {
                                    if (containerData[i].ParameterFile[j].Container[k].Type === AppConstants.get('NORMAL')) {
                                        if (containerData[i].ParameterFile[j].Container[k].Container && containerData[i].ParameterFile[j].Container[k].Container.length > 0) {
                                            for (var m = 0; m < containerData[i].ParameterFile[j].Container[k].Container.length; m++) {
                                                for (var n = 0; n < containerData[i].ParameterFile[j].Container[k].Container[m].Param.length; n++) {
                                                    if (containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.Type === "File") {
                                                        fileParametersCount = fileParametersCount + 1;
                                                    }
                                                }
                                            }
                                        } else {
                                            if (containerData[i].ParameterFile[j].Container[k].Container.Container && containerData[i].ParameterFile[j].Container[k].Container.Container.length > 0) {
                                                for (var q = 0; q < containerData[i].ParameterFile[j].Container[k].Container.Container.length; q++) {
                                                    for (var r = 0; r < containerData[i].ParameterFile[j].Container[k].Container.Container[q].Param.length; r++) {
                                                        if (containerData[i].ParameterFile[j].Container[k].Container.Container[q].Param[r].ValueType.Type === "File") {
                                                            fileParametersCount = fileParametersCount + 1;
                                                        }
                                                    }
                                                }
                                            }
                                            if (containerData[i].ParameterFile[j].Container[k].Container.Param && containerData[i].ParameterFile[j].Container[k].Container.Param.length > 0) {
                                                for (var p = 0; p < containerData[i].ParameterFile[j].Container[k].Container.Param.length; p++) {
                                                    if (containerData[i].ParameterFile[j].Container[k].Container.Param[p].ValueType.Type === "File") {
                                                        fileParametersCount = fileParametersCount + 1;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return fileParametersCount;
        }

        //get auto generated File Id
        var fileIdCall = 0;
        var fileIds = new Array();
        function getFileId(containerData, fileTypeParametersCount, unloadAddTemplatepopup) {

            function callbackFunction(data, Error) {
                $("#loadingDiv").hide();
                fileIdCall = fileIdCall + 1;
                if (data) {
                    var fileId = data.FileId;
                    fileIds.push(fileId);
                    if (fileTypeParametersCount > 1 && fileTypeParametersCount > fileIdCall) {
                        getFileId(containerData, fileTypeParametersCount, unloadAddTemplatepopup);
                        return;
                    }

                    fileIdCall = 0;
                    setFileId(containerData, fileIds);
                    //if (!isIntialLoad) {
                    //	addTemplateInstance(unloadAddTemplatepopup, 0);
                    //	return;
                    //}

                    if (koUtil.selectedFormFile && koUtil.selectedFormFile.length > 0 && koUtil.selectedFormFile[0].IsReferenceEnumeration) {
                        var referenceEnumContainer = new Array();
                        getReferenceEnumAttributes(containerData, referenceEnumContainer);
                        getParameterValuesForReferenceEnum(containerData, referenceEnumContainer);
                    } else {
                        createContainerTabs(self.JsonXmlData);
                        $(document).ready(function () {
                            isIntialLoad = false;
                        });
                    }
                }
            }

            $("#loadingDiv").show();
            var method = 'GenerateFileId';
            var params = '{"token":"' + TOKEN() + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        //set auto generated File Id
        function setFileId(containerData, fileIds) {
            var fileIdCount = -1;
            if (containerData[0].ParameterFile && containerData[0].ParameterFile.length > 0) {
                for (var j = 0; j < containerData[0].ParameterFile.length; j++) {
                    if (containerData[0].ParameterFile[j].Container && containerData[0].ParameterFile[j].Container.length > 0) {
                        for (var k = 0; k < containerData[0].ParameterFile[j].Container.length; k++) {
                            if (containerData[0].ParameterFile[j].Container[k].Type === AppConstants.get('NORMAL')) {
                                if (containerData[0].ParameterFile[j].Container[k].Container && containerData[0].ParameterFile[j].Container[k].Container.length > 0) {
                                    for (var m = 0; m < containerData[0].ParameterFile[j].Container[k].Container.length; m++) {
                                        for (var n = 0; n < containerData[0].ParameterFile[j].Container[k].Container[m].Param.length; n++) {
                                            if (containerData[0].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.Type === "File") {
                                                fileIdCount = fileIdCount + 1;
                                                containerData[0].ParameterFile[j].Container[k].Container[m].Param[n].ParamValue = fileIds[fileIdCount];
                                            }
                                        }
                                    }
                                } else {
                                    if (containerData[0].ParameterFile[j].Container[k].Container.Container && containerData[0].ParameterFile[j].Container[k].Container.Container.length > 0) {
                                        for (var q = 0; q < containerData[0].ParameterFile[j].Container[k].Container.Container.length; q++) {
                                            for (var r = 0; r < containerData[0].ParameterFile[j].Container[k].Container.Container[q].Param.length; r++) {
                                                if (containerData[0].ParameterFile[j].Container[k].Container.Container[q].Param[r].ValueType.Type === "File") {
                                                    fileIdCount = fileIdCount + 1;
                                                    containerData[0].ParameterFile[j].Container[k].Container.Container[q].Param[r].ParamValue = fileIds[fileIdCount];
                                                }
                                            }
                                        }
                                    }
                                    if (containerData[0].ParameterFile[j].Container[k].Container.Param && containerData[0].ParameterFile[j].Container[k].Container.Param.length > 0) {
                                        for (var p = 0; p < containerData[0].ParameterFile[j].Container[k].Container.Param.length; p++) {
                                            if (containerData[0].ParameterFile[j].Container[k].Container.Param[p].ValueType.Type === "File") {
                                                fileIdCount = fileIdCount + 1;
                                                containerData[0].ParameterFile[j].Container[k].Container.Param[p].ParamValue = fileIds[fileIdCount];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                self.JsonXmlData(containerData);
            }
        }

        function getParameterValuesForReferenceEnum(containerData, referenceEnumContainer) {
            var getParameterValuesForReferenceEnumReq = new Object();
            var Selector = new Object();
            Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
            Selector.UnSelectedItemIds = null;

            getParameterValuesForReferenceEnumReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
            getParameterValuesForReferenceEnumReq.Level = koUtil.selectedLevel;
            getParameterValuesForReferenceEnumReq.IsFromDeviceSearch = false;
            getParameterValuesForReferenceEnumReq.DeviceSearch = null;
            getParameterValuesForReferenceEnumReq.ColumnSortFilter = null;
            getParameterValuesForReferenceEnumReq.Selector = Selector;
            getParameterValuesForReferenceEnumReq.Containers = referenceEnumContainer;
            getParameterValuesForReferenceEnumReq.ParamSourceType = ENUM.get('TEMPLATE');
            getParameterValuesForReferenceEnumReq.ApplicationId = ApplicationIdForTemplate;

            function callbackFunction(data, Error) {
                $("#loadingDiv").hide();
                if (data) {
                    if (data.getParameterReferenceEnumResp)
                        data.getParameterReferenceEnumResp = $.parseJSON(data.getParameterReferenceEnumResp);

                    var referenceEnumItems = data.getParameterReferenceEnumResp;
                    if (referenceEnumItems && referenceEnumItems.length > 0) {
                        setReferenceEnumValues(containerData, referenceEnumItems);
                    }
                    createContainerTabs(self.JsonXmlData);
                    isIntialLoad = false;
                }
            }

            $("#loadingDiv").show();
            var method = 'GetParameterValuesForReferenceEnum';
            var params = '{"token":"' + TOKEN() + '","getParameterValuesForReferenceEnumReq":' + JSON.stringify(getParameterValuesForReferenceEnumReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        //Get ReferenceEnum parameter attributes for GetParameterValuesForReferencEnum request
        function getReferenceEnumAttributes(containerData, referenceEnumContainer) {
            var referenceEnumObject = new Object();

            if (containerData && containerData.length > 0) {
                for (var i = 0; i < containerData.length; i++) {
                    if (containerData && containerData[i].ParameterFile && containerData[i].ParameterFile.length === undefined) {
                        containerData[i].ParameterFile = $.makeArray(containerData[i].ParameterFile);
                    }
                    if (containerData[i].ParameterFile && containerData[i].ParameterFile.length > 0) {
                        for (var j = 0; j < containerData[i].ParameterFile.length; j++) {
                            if (containerData[i].ParameterFile[j].Container && containerData[i].ParameterFile[j].Container.length > 0) {
                                for (var k = 0; k < containerData[i].ParameterFile[j].Container.length; k++) {
                                    if (containerData[i].ParameterFile[j].Container[k].Type === AppConstants.get('NORMAL')) {
                                        if (containerData[i].ParameterFile[j].Container[k].Container && containerData[i].ParameterFile[j].Container[k].Container.length > 0) {
                                            for (var m = 0; m < containerData[i].ParameterFile[j].Container[k].Container.length; m++) {
                                                for (var n = 0; n < containerData[i].ParameterFile[j].Container[k].Container[m].Param.length; n++) {
                                                    if (containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.Type === "ReferenceEnumeration") {
                                                        referenceEnumObject = new Object();
                                                        referenceEnumObject.ContainerId = containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ReferenceContainerId;
                                                        referenceEnumObject.Name = containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.ReferenceEnumeration.Name;
                                                        referenceEnumObject.Value = containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.ReferenceEnumeration.Value;
                                                        referenceEnumContainer.push(referenceEnumObject);
                                                    }
                                                }
                                            }
                                        } else {
                                            for (var p = 0; p < containerData[i].ParameterFile[j].Container[k].Container.Param.length; p++) {
                                                if (containerData[i].ParameterFile[j].Container[k].Container.Param[p].ValueType.Type === "ReferenceEnumeration") {
                                                    referenceEnumObject = new Object();
                                                    referenceEnumObject.ContainerId = containerData[i].ParameterFile[j].Container[k].Container.Param[p].ReferenceContainerId;
                                                    referenceEnumObject.Name = containerData[i].ParameterFile[j].Container[k].Container.Param[p].ValueType.ReferenceEnumeration.Name;
                                                    referenceEnumObject.Value = containerData[i].ParameterFile[j].Container[k].Container.Param[p].ValueType.ReferenceEnumeration.Value;
                                                    referenceEnumContainer.push(referenceEnumObject);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        //set ReferenceEnum parameter values from GetParameterValuesForReferencEnum response
        function setReferenceEnumValues(containerData, referenceEnumItems) {
            if (containerData[0].ParameterFile && containerData[0].ParameterFile.length > 0) {
                for (var j = 0; j < containerData[0].ParameterFile.length; j++) {
                    if (containerData[0].ParameterFile[j].Container && containerData[0].ParameterFile[j].Container.length > 0) {
                        for (var k = 0; k < containerData[0].ParameterFile[j].Container.length; k++) {
                            if (containerData[0].ParameterFile[j].Container[k].Type === AppConstants.get('NORMAL')) {
                                if (containerData[0].ParameterFile[j].Container[k].Container && containerData[0].ParameterFile[j].Container[k].Container.length > 0) {
                                    for (var m = 0; m < containerData[0].ParameterFile[j].Container[k].Container.length; m++) {
                                        for (var n = 0; n < containerData[0].ParameterFile[j].Container[k].Container[m].Param.length; n++) {
                                            if (containerData[0].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.Type === "ReferenceEnumeration") {
                                                paramContainerId = parseInt(containerData[0].ParameterFile[j].Container[k].Container[m].Param[n].ReferenceContainerId);
                                                var source = _.where(referenceEnumItems, {
                                                    ContainerId: paramContainerId
                                                })
                                                if (source && source.length > 0) {
                                                    containerData[0].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.ReferenceEnumeration.ReferenceEnumItem = source[0].ParameterReferenceEnums;
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (containerData[0].ParameterFile[j].Container[k].Container.Param && containerData[0].ParameterFile[j].Container[k].Container.Param.length > 0) {
                                        for (var p = 0; p < containerData[0].ParameterFile[j].Container[k].Container.Param.length; p++) {
                                            if (containerData[0].ParameterFile[j].Container[k].Container.Param[p].ValueType.Type === "ReferenceEnumeration") {
                                                paramContainerId = parseInt(containerData[0].ParameterFile[j].Container[k].Container.Param[p].ReferenceContainerId);
                                                var source = _.where(referenceEnumItems, {
                                                    ContainerId: paramContainerId
                                                })
                                                if (source && source.length > 0) {
                                                    //containerData[0].ParameterFile[j].Container[k].Container.Param[p].Default = source[0].ParameterReferenceEnums[0].Value;
                                                    containerData[0].ParameterFile[j].Container[k].Container.Param[p].ValueType.ReferenceEnumeration.ReferenceEnumItem = source[0].ParameterReferenceEnums;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                self.JsonXmlData(containerData);
            }
        }

        function createContainerTabs(JsonXmlData) {
            if (JsonXmlData() && JsonXmlData().length > 0) {
                var JsonXmlData1 = JsonXmlData();
            } else {
                var JsonXmlData1 = $.xml2json(koUtil.editDevicetemplateXML);
            }

            if (JsonXmlData1.length == undefined) {
                JsonXmlData1 = $.makeArray(JsonXmlData1);
            }

            for (var i = 0; i < JsonXmlData1.length; i++) {
                if (JsonXmlData1[i].ParameterFile.length == undefined) {
                    JsonXmlData1[i].ParameterFile = $.makeArray(JsonXmlData1[i].ParameterFile);
                }

                for (var j = 0; j < JsonXmlData1[i].ParameterFile.length; j++) {

                    if (JsonXmlData1[i].ParameterFile[j].Container.length == undefined) {
                        JsonXmlData1[i].ParameterFile[j].Container = $.makeArray(JsonXmlData1[i].ParameterFile[j].Container);
                    }
                    for (var t = 0; t < JsonXmlData1[i].ParameterFile[j].Container.length; t++) {

                        if (JsonXmlData1[i].ParameterFile[j].Container[t].Type != undefined && (JsonXmlData1[i].ParameterFile[j].Container[t].Type).toUpperCase() != 'GRID') {
                            paramLevel = 0;
                            if ((JsonXmlData1[i].ParameterFile[j].Container[t].DisplayName).toUpperCase() == 'DETAILS') {
                                if (JsonXmlData1[i].ParameterFile[j].Container[t].Container.length == undefined) {
                                    JsonXmlData1[i].ParameterFile[j].Container[t].Container = $.makeArray(JsonXmlData1[i].ParameterFile[j].Container[t].Container);
                                }
                                for (var l = 0; l < JsonXmlData1[i].ParameterFile[j].Container[t].Container.length; l++) {
                                    GenerateContainerDataAddInstance(JsonXmlData1[i].ParameterFile[j].Container[t].Container[l], tabContainer1, paramLevel, TemplateParamAppGID, undefined, koUtil.selectedLevel, true, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, !koUtil.isDeviceProfile(), koUtil, false);
                                }
                            } else {
                                GenerateContainerDataAddInstance(JsonXmlData1[i].ParameterFile[j].Container[t], tabContainer1, paramLevel, TemplateParamAppGID, undefined, koUtil.selectedLevel, true, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, !koUtil.isDeviceProfile(), koUtil, false);
                            }
                        }
                    }
                }
            }

            self.templateXML(tabContainer1);

            if (tabContainer1 && tabContainer1.length > 0) {
                for (var k = tabContainer1.length - 1; k >= 0; k--) {
                    for (var j = 0; j < tabContainer1[k].Container.length; j++) {
                        assignContainerValue(tabContainer1[k].Container[j]);
                        if (tabContainer1[k].AllowView == false) {
                            var primaryIdentifiers = _.where(tabContainer1[k].Container[j].Param, { PrimaryIdentifier: "True" });
                            if (primaryIdentifiers && primaryIdentifiers.length > 0) {
                                isPrimaryIdContainerHidden = true;
                            }
                            tabContainer1.splice(k, 1);
                            break;
                        }else if (tabContainer1[k].AllowModify == false) {
							var primaryIdentifiers = _.where(tabContainer1[k].Container[j].Param, { PrimaryIdentifier: "True" });
							if (primaryIdentifiers && primaryIdentifiers.length > 0) {
								isPrimaryIdContainerDisabled = true;
							}
						}
                    }
                }
                if (tabContainer1.length == 0) {
                    $('#containerTabs').addClass('hide');
                    $('#containerAccessDivAddInstanceTemplate').addClass('hide');
                    $('#noContainerAccessDivAddInstanceTemplate').removeClass('hide');
                    $('#instanceNameFormAddInstanceTemplate').addClass('hide');
                    $("#btnAddInstanceTemplate").prop("disabled", true);
                }
                if (isPrimaryIdentifierExist) {
                    $('#instanceNameFormAddInstanceTemplate').addClass('hide');
                } else {
                    $('#instanceNameFormAddInstanceTemplate').removeClass('hide');
                }
            } else {
                $('#containerTabs').addClass('hide');
                $('#containerAccessDivAddInstanceTemplate').addClass('hide');
                $('#noContainerAccessDivAddInstanceTemplate').removeClass('hide');
                $('#instanceNameFormAddInstanceTemplate').addClass('hide');
                $("#btnAddInstanceTemplate").prop("disabled", true);
            }
        }

        self.checkTxtValue = function (data) {
            var id = "#templateAddTxt" + data.ParamId;
			isTabKeyPressed(id);
            var val = '';
            val = $(id).val();

            //if ($(id).val() == data.Default) {
            //    if (data.PrimaryIdentifier == 'True') {
            //        updateSetValue(data, val);
            //    } else {
            //        updateEditvalue(data);
            //    }

            //} else {
            updateSetValue(data, val);
            //}
        }

        self.checkFileValue = function () {
            data = fileData;
            var id = "#templateAddFile" + data.ParamId;
            var value = $(id).val();
            updateSetValue(data, value);
        }

        self.selectPackageFile = function (popupName, data) {
            if (popupName == "modelPackageFiles") {
                self.templateFileFlag(true);
                fileData = data;
                koUtil.parameterTypeFileId = '#templateAddFile' + data.ParamId;
                if (data.ValueType.File.Type.toUpperCase() == AppConstants.get('PACKAGE_FILE')) {
                    koUtil.isParameterTypeContent(false);
                } if (data.ValueType.File.Type.toUpperCase() == AppConstants.get('CONTENT_FILE')) {
                    koUtil.isParameterTypeContent(true);
                }
                loadelementPackageFiles(popupName, 'device/deviceProfileTemplates');
                $('#addTemplateInstanceFilesModel').modal('show');
            }
        }

        self.checkDllValue = function (data) {
            if (!isIntialLoad) {
                var id = "#templateAddCombo" + data.ParamId;
                var val = $(id).find('option:selected').val();

                //if (val == '' || val == data.Default) {
                //    if (data.PrimaryIdentifier == 'True') {
                //        var value = $(id).find('option:selected').val();
                //        var name = $(id).find('option:selected').text();
                //        updateSetValue(data, value, name);
                //    } else {
                //        updateEditvalue(data);
                //    }
                //} else {
                var value = $(id).find('option:selected').val();
                var name = $(id).find('option:selected').text();
                updateSetValue(data, value, name);
                //}
            }
        }

        self.checkReferenceEnumValue = function (data) {
            if (!isIntialLoad) {
                var id = "#paramTemplateAddReferenceCombo" + data.ParamId;
                var value = $(id).find('option:selected').val();
                if (value == '' || value == data.ParamValue || data.ParamValue == undefined) {
                    updateEditvalue(data);
                } else {
                    var name = $(id).find('option:selected').text();
                    updateSetValue(data, value, name);
                }
            }
        }

        self.checkCheckboxValue = function (data) {
            var id = "#templateAddCheck" + data.ParamId;
            var check = 0;

            if ($(id).is(':checked')) {
                check = 1;
            } else {
                check = 0;
            }

            //if (check == data.Default) {
            //    updateEditvalue(data);
            //} else {
            updateSetValue(data, check);
            //}

        }
        self.clearDateAIParameter = function (data) {
            var id = "#templateInputAddDate" + data.ParamId;
            var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
            if (data.ValueType.DateTime && data.ValueType.DateTime.DateFormat) {
                dateFormat = data.ValueType.DateTime.DateFormat;
            }
            updateDateTimePicker("#templateAddDate" + data.ParamId, dateFormat, 'today');
            $(id).val('');
            updateSetValue(data, '');
        }

        self.checkDateValue = function (data) {

            var id = "#templateInputAddDate" + data.ParamId;
            var check = '';
            if ($(id).val() != '') {
                check = $(id).val();
            }
            if (check == data.Default) {
                if (data.PrimaryIdentifier == 'True') {
                    updateSetValue(data, check);
                } else {
                    updateEditvalue(data);
                }
            } else {
                updateSetValue(data, check);
            }
        }


        self.cancelpopup = function (unloadAddTemplatepopup) {
            if (arrayOfInstanceAddValue.length > 0) {
                $("#addTemplateConfirmPopup").modal('show');
            } else {
                unloadAddTemplatepopup('checkTxtValue');
            }
            koUtil.parameterPackageId = 0;
        }

        self.cancelconfirmation = function () {

            $("#addTemplateConfirmPopup").modal('hide');

            $("#mainPageBody").addClass('modal-open-appendon');
        }

        self.upNumber = function (data) {
            if (data.AllowModify) {
                var id = '#templateAddNumeric' + data.ParamId;
                if ($(id).val() == '') {
                    var number = 0;
                } else {
                    var number = parseInt($(id).val());
                }
                if (number < data.ValueType.Numeric.MaxVal) {
                    number = number + 1;
                }
                $(id).val(number);

                changenumber(data, number);
            }
        }

        self.checkTxtInstanceName = ko.observable();
        self.checkTxtInstanceName.subscribe(function (newValue) { });


        function changenumber(data, number) {
            var val = number;

            if (val == '' || val == data.Default) {
                if (data.PrimaryIdentifier == 'True') {
                    updateSetValue(data, val);
                } else {
                    updateEditvalue(data);
                }
            } else {
                updateSetValue(data, val);
            }
        }



        self.downNumber = function (data) {
            if (data.AllowModify) {
                var id = '#templateAddNumeric' + data.ParamId;
                if ($(id).val() == '') {
                    var number = 0;
                } else {
                    var number = parseInt($(id).val());
                }
                if (number > data.ValueType.Numeric.MinVal) {
                    number = number - 1;
                }
                $(id).val(number);
                changenumber(data, number);
            }
        }

        //Code for edit functionality Starts
        self.paramId = ko.observable();
        self.SourceId = ko.observable();
        self.SourceType = ko.observable();

        self.maxValue = ko.observable();
        self.minValue = ko.observable();

        self.pramvaluforcheckbox = ko.observable();

        var savecheck = 0;
        self.paramValue = ko.observable();

        self.paramValueType = ko.observable();

        self.controlType = ko.observable();

        self.paramDllData = ko.observable();

        self.paramDefaultValue = ko.observable();

        self.oldtextValue = ko.observable();

        self.oldnumericValue = ko.observable();

        self.oldDateValue = ko.observable();

        self.oldBooleanValue = ko.observable();

        self.oldEnumtValue = ko.observable();

        self.editAccessValue = ko.observable();

        self.templateTxtValueNum = ko.observable();
        self.regExpression = ko.observable();
        self.textMinLength = ko.observable();
        self.pramvaluforcheckbox = ko.observable();
        var editedValue;

        self.editValue = function (data) {
            editedValue = data;
            $("#txtValueSpanDevProfTemp").hide();
            $("#txtValueSpanDevProfTemp").empty();

            self.editAccessValue(data.Access);
            $("#btnSaveSelectedPvalue").prop('disabled', true);
            savecheck = 0;
            self.paramId(data.ParamId);

            if ($.inArray(data.ParamId, arrayofeditvalue) < 0) {
                self.SourceType(data.SourceType)
            } else {
                self.SourceType('Default')
            }

            var IsPrimaryIdentifier = (data.PrimaryIdentifier != undefined && data.PrimaryIdentifier == "True") ? 1 : 0;

            //self.SourceType(data.SourceType)
            //self.paramValue(data.ParamValue);
            self.paramValueType(data.ValueType.Type);
            self.paramValue(data.ParamValue);
            self.paramDefaultValue(data.Default);


            $("#editTemplateParamValueHeader").text(i18n.t('edit_param_popup_lbl', {
                lng: lang
            }) + ' ' + data.DisplayName);

            if (data.ValueType.Type == 'String') {
                self.controlType('String');
                var id = "#templateAddTxt" + data.ParamId;
                var value = $(id).val();
                $("#txtAddValue").val(value);

                if (data.ValueType.String.MinLen) {
                    $("#txtAddValue").prop('minlength', data.ValueType.String.MinLen);
                }
                if (data.ValueType.String.MaxLen) {
                    $("#txtAddValue").prop('maxlength', data.ValueType.String.MaxLen);
                }

                $("#txtParamDiv").show();
                $("#numericParamDiv").hide();
                $("#ddlParamDiv").hide();
                $("#validationParamDiv").show();
                $("#CheckboxParamDiv").hide();
                $("#DateParamDiv").hide();

                if ($("#txtAddValue").val() == '' || $("#txtAddValue").val() == data.ParamValue) {
                    //self.SourceType('Default');
                    $("#btnSaveSelectedPvalue").prop('disabled', true);
                } else {
                    //self.SourceType('User');
                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }

                $("#txtvalidationAddValue").val(data.ValueType.String.ValidChars);
                $("#txtDefaultAddValue").val(data.Default);


                self.regExpression(data.ValueType.String.ValidChars);
                self.textMinLength(data.ValueType.String.MinLen);

            } else if (data.ValueType.Type == 'Numeric') {
                self.maxValue(data.ValueType.Numeric.MaxVal);
                self.minValue(data.ValueType.Numeric.MinVal);

                self.controlType('Numeric');
                var id = "#templateAddNumeric" + self.paramId();
                var value = $(id).val();
                $("#txtnumericAddValue").val(value);
                $("#txtParamDiv").hide();
                $("#numericParamDiv").show();
                $("#ddlParamDiv").hide();
                $("#validationParamDiv").hide();
                $("#CheckboxParamDiv").hide();
                $("#DateParamDiv").hide();

                if ($("#txtnumericAddValue").val() == '' || $("#txtnumericAddValue").val() == data.ParamValue) {
                    //self.SourceType('Default');
                    $("#btnSaveSelectedPvalue").prop('disabled', true);
                } else {
                    //self.SourceType('User');
                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }

                // $("#txtnumericAddValue").val(data.ParamValue);
                self.paramDefaultValue(data.Default);
                $("#txtDefaultAddValue").val(data.Default);

            } else if (data.ValueType.Type == 'Enumeration') {
                self.controlType('Enumeration');
                self.paramDllData(data.ValueType.Enumeration.EnumItem);
                var id = "#templateAddCombo" + self.paramId();
                var value = $(id).val();

                $("#ddlAddValue").val(value).prop("selected", "selected");
                $("#ddlAddValue").trigger('chosen:updated');

                $("#txtParamDiv").hide();
                $("#numericParamDiv").hide();
                $("#ddlParamDiv").show();
                $("#validationParamDiv").hide();
                $("#CheckboxParamDiv").hide();
                $("#DateParamDiv").hide();

                if ($("#ddlAddValue").val() == '' || $("#ddlAddValue").val() == data.ParamValue) {
                    //self.SourceType('Default');
                    $("#btnSaveSelectedPvalue").prop('disabled', true);
                } else {
                    //self.SourceType('User');
                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }

                var enumsoirce = _.where(data.ValueType.Enumeration.EnumItem, {
                    Value: data.Default
                })



                $("#txtDefaultAddValue").val(enumsoirce[0].Name);
                //self.paramDefaultValue(data.Default);

            }
            else if (data.ValueType.Type == 'DateTime') {
                self.controlType('DateTime');
                var id = "#templateInputAddDate" + self.paramId();

                var value = $(id).val();
                if (data.ValueType.DateTime && data.ValueType.DateTime.DateFormat) {
                    dateFormat = data.ValueType.DateTime.DateFormat;
                }
                updateDateTimePicker("#txtDateAddValue", dateFormat, value);
                $("#txtDateAddInputValue").val(value);

                $("#txtParamDiv").hide();
                $("#numericParamDiv").hide();
                $("#ddlParamDiv").hide();
                $("#validationParamDiv").hide();
                $("#CheckboxParamDiv").hide();
                $("#DateParamDiv").show();

                if ($("#txtDateAddInputValue").val() == '' || value == data.ParamValue) {
                    //self.SourceType('Default');
                    $("#btnSaveSelectedPvalue").prop('disabled', true);
                } else {
                    // self.SourceType('User');
                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }


                $("#txtDefaultAddValue").val(data.Default);

            }
            else if (data.ValueType.Type == 'Boolean' || data.ValueType.Type == 'CheckBox') {

                $("#editCheckboxlabel").text(data.DisplayName);
                self.controlType('Boolean');
                var id = "#templateAddCheck" + self.paramId();

                var check = 0;

                if ($(id).is(':checked')) {
                    check = 1;
                } else {
                    check = 0;
                }

                if (check == 1) {
                    self.pramvaluforcheckbox(1);
                } else {
                    self.pramvaluforcheckbox(0);
                }

                var check1 = 0;
                if ($("#checkBoxAddValue").is(':checked')) {
                    check1 = 1;
                } else {
                    check1 = 0;
                }



                $("#txtParamDiv").hide();
                $("#numericParamDiv").hide();
                $("#ddlParamDiv").hide();
                $("#validationParamDiv").hide();
                $("#CheckboxParamDiv").show();
                $("#DateParamDiv").hide();

                if (check1 == data.ParamValue) {
                    //self.SourceType('Default');
                    $("#btnSaveSelectedPvalue").prop('disabled', true);
                } else {
                    //self.SourceType('User');
                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }

                $("#txtDefaultAddValue").val(data.Default);

            } else {
                self.controlType('String');
                var id = "#templateAddTxt" + data.ParamId;
                var value = $(id).val();
                $("#txtAddValue").val(value);

                $("#txtParamDiv").show();
                $("#numericParamDiv").hide();
                $("#ddlParamDiv").hide();
                $("#validationParamDiv").show();
                $("#CheckboxParamDiv").hide();
                $("#DateParamDiv").hide();
                //self.templateTxtValue(data.ParamValue);
                if ($("#txtAddValue").val() == '' || $("#txtAddValue").val() == data.ParamValue) {
                    //self.SourceType('Default');
                    $("#btnSaveSelectedPvalue").prop('disabled', true);
                } else {
                    //self.SourceType('User');
                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }
                $("#txtDefaultAddValue").val(data.Default);
            }
            if (IsPrimaryIdentifier == 1) {
                $('#btnRestDefault').hide();
            } else {
                $('#btnRestDefault').show();
            }

            if (self.SourceType() == undefined) {
                $("#txtsourceAddValue").parent().hide();
            }
            else {
                $("#txtDescriptionAddValue").parent().show();
                $("#txtsourceAddValue").val(self.SourceType());
            }

            $("#txtDescriptionAddValue").val(data.Description);
            self.editParams();
        }

        self.templateTxtValue = ko.observable();
        self.templateTxtValue.subscribe(function (newValue) {


            if (newValue == self.paramDefaultValue()) {
                $("#txtsourceAddValue").val('Default');
            } else {
                $("#txtsourceAddValue").val('User');
            }


            if (newValue == self.paramValue()) {
                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {
                var retval = checkerror(editedValue);
                if (retval == null || retval == '') {
                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                } else {
                    return;
                }
            }
        });
        self.selectedEnumPValue = ko.observable();

        self.selectedEnumPValue.subscribe(function (newValue) {

            //alert(JSON.stringify(data));

            var defaultv = self.paramDefaultValue();
            //alert(defaultv);

            if ($("#ddlAddValue").val() == self.paramDefaultValue()) {
                $("#txtsourceAddValue").val('Default');
            } else {
                $("#txtsourceAddValue").val('User');
            }

            if ($("#ddlAddValue").val() == self.paramValue() || $("#ddlAddValue").val() == '--Select--') {

                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {

                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }



        });

        self.checkEditDllValue = function () {
            //alert(JSON.stringify(data));

            var defaultv = self.paramDefaultValue();
            //alert(defaultv);

            if ($("#ddlAddValue").val() == self.paramDefaultValue()) {
                $("#txtsourceAddValue").val('Default');
            } else {
                $("#txtsourceAddValue").val('User');
            }

            if ($("#ddlAddValue").val() == self.paramValue() || $("#ddlAddValue").val() == '--Select--') {

                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {

                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }

        }

        self.SetDefaultParameterValue = function () {

            if (self.controlType() == 'String') {
                $("#txtAddValue").val(self.paramDefaultValue());
            } else if (self.controlType() == 'Numeric') {
                $("#txtnumericAddValue").val(self.paramDefaultValue());
            } else if (self.controlType() == 'Enumeration') {
                $("#ddlAddValue").val(self.paramDefaultValue()).prop("selected", "selected");
                $("#ddlAddValue").trigger('chosen:updated');
            } else if (self.controlType() == 'DateTime') {
                var date = '';
                if (self.paramDefaultValue() != '') {
                    var date = self.paramDefaultValue();
                    updateDateTimePicker("#txtDateAddValue", dateFormat, date);
                }
                $("#txtDateAddInputValue").val(date);
            } else if (self.controlType() == 'Boolean') {

                if (self.paramDefaultValue() == 1) {
                    $("#checkBoxAddValue").prop("checked", true);
                } else {
                    $("#checkBoxAddValue").prop("checked", false);
                }
            }
            $("#txtsourceAddValue").val('Default');
            if (self.paramValue() == self.paramDefaultValue()) {
                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {
                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }

        }
        function checkerror(editedValue) {
            var retval = '';
            $("#txtValueSpanDevProfTemp").hide();
            $("#txtValueSpanDevProfTemp").empty();

            var checkVal = self.validationOfRegExpression($("#txtAddValue").val())

            if (checkVal == false) {
                retval += 'invalid item';
                if (editedValue && editedValue.ValueType.String.ErrorOnValidationFailure && editedValue.ValueType.String.ErrorOnValidationFailure != '') {
                    $("#txtValueSpanDevProfTemp").text(editedValue.ValueType.String.ErrorOnValidationFailure).show()
                } else {
                    $("#txtValueSpanDevProfTemp").text(i18n.t('Invalid_Parameter_Values_VPFX', { lng: lang })).show();
                }
            } else {
                retval += '';
                $("#txtValueSpanDevProfTemp").hide();
            }
            return retval;

        }
        self.validationOfRegExpression = function (newValue) {
            // regExp = "" + self.regExpression() + "/"
            var regExpval = new RegExp(self.regExpression());
            if ((regExpval.test(newValue)) == false) {
                return false;
            } else {
                return true;
            }
            //alert(JSON.stringify(self.regExpression()));
        }

        self.validateStringLength = function (value) {
            if (value && value.length < self.textMinLength()) {
                return false;
            } else {
                return true;
            }
        }
        self.templateCheckValue = function () {


            var id = "#checkBoxAddValue";//"#templateCheck" + self.paramId();

            var check = 0;
            if ($(id).is(':checked')) {

                check = 1;

            } else {
                check = 0;

            }

            if ($(id).val() == self.paramDefaultValue()) {
                $("#txtsourceAddValue").val('Default');
            } else {
                $("#txtsourceAddValue").val('User');
            }

            if (check == self.paramValue()) {
                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {
                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }
        };

        self.templateNumericValue = ko.observable();

        self.templateNumericValue.subscribe(function (newValue) {

            //var id = "#templateAddNumeric" + self.paramId();
            //$(id).val(newValue);
            savecheck = 0;
            $("#btnSaveSelectedPvalue").prop('disabled', false);
        });

        self.selectedEnumPValue = ko.observable();

        self.selectedEnumPValue.subscribe(function (newValue) {

            //alert(JSON.stringify(data));

            var defaultv = self.paramDefaultValue();
            //alert(defaultv);

            if ($("#ddlAddValue").val() == self.paramDefaultValue()) {
                $("#txtsourceAddValue").val('Default');
            } else {
                $("#txtsourceAddValue").val('User');
            }

            if ($("#ddlAddValue").val() == self.paramValue() || $("#ddlAddValue").val() == '--Select--') {

                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {

                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }



        });
        self.upNumberPval = function (data) {

            var id = '#txtnumericAddValue';

            if ($(id).val() == '') {
                var number = 0;
            } else {

                var number = parseInt($(id).val());

            }
            if (number < self.maxValue()) {
                number = number + 1;
            }

            $(id).val(number);

            self.templateNumericValue(number)
            self.enableDisableSaveBtnOnEditPopUp($(id).val());
        }



        self.downNumberPval = function (data) {

            var id = '#txtnumericAddValue';
            if ($(id).val() == '') {
                var number = 0;
            } else {
                var number = parseInt($(id).val());
            }
            var max = self.maxValue();
            var min = self.maxValue();


            if (number > self.minValue()) {
                number = number - 1;
            }
            $(id).val(number);
            self.templateNumericValue(number);
            self.enableDisableSaveBtnOnEditPopUp($(id).val());
        }
        self.enableDisableSaveBtnOnEditPopUp = function (newValue) {
            //  //alert("Default Value :" + JSON.stringify(self.paramDefaultValue()) + "\n" + "Param Value :" + JSON.stringify(self.paramValue()));

            if (newValue == self.paramDefaultValue()) {
                $("#txtsourceAddValue").val('Default');
            } else {
                $("#txtsourceAddValue").val('User');
            }


            if (newValue == '' || newValue == self.paramValue()) {
                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {
                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }
        }

        self.editParams = function () {
            var modalHeight = $('#addInstance')[0].clientHeight;
            $('#slidePanelLevel').height(modalHeight - 60);
            if ($('#slidePanelLevel').hasClass('show')) {
                $("#slidePanelLevel").animate({
                    width: "-=400"
                }, 700, function () {
                    // Animation complete.
                });
                $('#slidePanelLevel').removeClass('show').addClass('hide');
                $('.pageMask').hide();
            }
            else {
                $('.pageMask').show();
                $("#slidePanelLevel").animate({
                    width: "+=400"
                }, 700, function () {
                    // Animation complete.
                });
                $('#slidePanelLevel').removeClass('hide').addClass('show');
            }
        }
        function updateEditvalue(data) {
            arrayOfInstanceAddValue = jQuery.grep(arrayOfInstanceAddValue, function (value) {
                var id = "" + data.ParamId + ""
                return (value != id && value != null);
            });
        }

        function updateSetValue(data, value, name) {
            if ($.inArray(data.ParamId, arrayOfInstanceAddValue) < 0) {
                arrayOfInstanceAddValue.push(data.ParamId);
            }

            var sourceData = _.where(arrayForSetValue, { ParamId: data.ParamId });

            if (sourceData != '') {
                arrayForSetValue = jQuery.grep(arrayForSetValue, function (value) {
                    var index = arrayForSetValue.indexOf(sourceData[0]);
                    return (value != arrayForSetValue[index] && value != null);
                });
            }

            var Parameter = new Object();
            Parameter.ParamId = data.ParamId;
            Parameter.ParamName = data.Name;
            Parameter.ParamValue = data.ValueType.Type == "File" ? data.ParamValue : value;
            Parameter.TemplateId = 0;
            Parameter.SourceType = 'User';
            Parameter.IsPrimaryIdentifier = (data.PrimaryIdentifier == "True") ? 1 : 0;
            Parameter.PISequence = data.Sequence ? data.Sequence : 0;
            Parameter.ParamType = data.ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
            Parameter.PackageId = data.ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
            Parameter.IncludeInMP = data.IncludeInMP == "True" ? 1 : 0;
            Parameter.ValueType = data.ValueType.Type;

            if (data.ValueType.Type == "String") {
                Parameter.ValidChars = data.ValueType.String.ValidChars;
                Parameter.MinLen = data.ValueType.String.MinLen;
                var id = "#templateAddTxt" + data.ParamId;
                if (data.ValueType.String.ValidChars && data.ValueType.String.ValidChars != '') {
                    self.regExpression(data.ValueType.String.ValidChars)
                    var checkVal = self.validationOfRegExpression($(id).val());
                    if (checkVal == false) {
                        $(id).addClass("borderColor-Text");
                    } else {
                        if (data.ValueType.String.MinLen && data.ValueType.String.MinLen != '') {
                            self.textMinLength(data.ValueType.String.MinLen);
                            var checkTextLength = self.validateStringLength($(id).val());
                            if (checkTextLength == false) {
                                $(id).addClass("borderColor-Text");
                            } else {
                                $(id).removeClass("borderColor-Text");
                            }
                        } else {
                            $(id).removeClass("borderColor-Text");
                        }
                    }
                } else {
                    if (data.ValueType.String.MinLen && data.ValueType.String.MinLen != '') {
                        self.textMinLength(data.ValueType.String.MinLen);
                        var checkTextLength = self.validateStringLength($(id).val());
                        if (checkTextLength == false) {
                            $(id).addClass("borderColor-Text");
                        } else {
                            $(id).removeClass("borderColor-Text");
                        }
                    } else {
                        $(id).removeClass("borderColor-Text");
                    }
                }
            }

            arrayForSetValue.push(Parameter);

            //Include primary identifier in collection if its is Primary Identifier
            if (data.PrimaryIdentifier == "True") {
                var sourceData = _.where(arrayOfPrimaryIdentifierValue, { ParamId: data.ParamId });

                if (sourceData != '') {
                    arrayOfPrimaryIdentifierValue = jQuery.grep(arrayOfPrimaryIdentifierValue, function (value) {
                        var index = arrayOfPrimaryIdentifierValue.indexOf(sourceData[0]);
                        return (value != arrayOfPrimaryIdentifierValue[index] && value != null);
                    });
                }
                if (data.ValueType.Type == "Enumeration") {
                    var PIParameter = new Object();
                    PIParameter.ParamId = data.ParamId;
                    PIParameter.ParamValue = name;
                    PIParameter.TemplateId = 0;
                    PIParameter.SourceType = 'User';
                    PIParameter.IsPrimaryIdentifier = (data.PrimaryIdentifier == "True") ? 1 : 0;
                    PIParameter.PISequence = data.Sequence ? data.Sequence : 0;
                    arrayOfPrimaryIdentifierValue.push(PIParameter);
                } else {
                    arrayOfPrimaryIdentifierValue.push(Parameter);
                }
            }
        }
        self.SetTemplateParameterValue = function () {
            var paramID = self.paramId();
            var paramValue = '';
            var name = '';
            if (self.controlType() == 'String') {
                var id = '#templateAddTxt' + paramID;
                $(id).val($("#txtAddValue").val());
                paramValue = $("#txtAddValue").val();
                var retval = checkerror(editedValue);
                if (retval == null || retval == '') {

                } else {
                    return;
                }

            } else if (self.controlType() == 'Numeric') {
                var id = '#templateAddNumeric' + paramID;
                paramValue = parseInt($("#txtnumericAddValue").val());
                var maxValueNum = parseInt(self.maxValue());
                var minValueNum = parseInt(self.minValue());
                if (isNaN(paramValue)) {
                    paramValue = (minValueNum && minValueNum > 0) ? minValueNum : 0;
                } else {
                    if (paramValue > maxValueNum) {
                        paramValue = maxValueNum;
                    } else if (paramValue < minValueNum) {
                        paramValue = minValueNum;
                    }
                }
                $(id).val(paramValue);
            } else if (self.controlType() == 'Enumeration') {
                paramValue = $("#ddlAddValue").val();
                var id = '#templateAddCombo' + paramID;
                $(id).val(paramValue).prop("selected", "selected");
                $(id).trigger('chosen:updated');
                name = $(id).find('option:selected').text();
            }
            else if (self.controlType() == 'DateTime') {
                paramValue = $("#txtDateAddInputValue").val();
                var id = '#templateAddDate' + paramID;
                updateDateTimePicker(id, dateFormat, paramValue);
                $('#templateInputAddDate' + paramID).val(paramValue);
            }
            else if (self.controlType() == 'Boolean' || self.controlType() == 'CheckBox') {
                var id = '#templateAddCheck' + paramID;
                if ($("#checkBoxAddValue").is(':checked')) {
                    $(id).prop("checked", true);
                    paramValue = 1;
                } else {
                    $(id).prop("checked", false);
                    paramValue = 0;
                }
            }
            $(".pageMask").hide();
            self.editParams();

            if (paramValue == editedValue.ParamValue) {
                updateEditvalue(editedValue);
            } else {
                if (name == '') {
                    updateSetValue(editedValue, paramValue);
                } else {
                    updateSetValue(editedValue, paramValue, name);
                }
            }
        }

        self.hideEditPramDiv = function () {
            $(".pageMask").hide();
            self.editParams();
            setTimeout(function () {
                $("#mainPageBody").addClass('modal-open');
            }, 500);

        }

        self.hideInfoPopup = function () {
            $("#addTemplateInstanceInfoPopup").modal('hide');
        }

        self.showmoreDetails = function () {
            if (self.showMoreInfo() == true) {
                var infoDetails = i18n.t('more_details');
                self.showMoreInfo(false);
                $("#addTemplateInstanceInfoModalBody").prop('style', 'height: 150px !important');
                $("#infoMessageMoreTemplateInstance").text(infoDetails);
            } else {
                var infoDetails = i18n.t('less_details');
                self.showMoreInfo(true);
                $("#addTemplateInstanceInfoModalBody").prop('style', 'height: 215px !important');
                $("#infoMessageMoreTemplateInstance").text(infoDetails);
            }
        }

        //Code for edit functionality Ends
        self.addNewInstance = function (unloadAddTemplatepopup) {
            if (isPrimaryIdentifierExist == false) {
                if ($("#txtInstanceName").val().trim() == '') {
                    openAlertpopup(1, 'please_enter_instance_name');
                    return;
                }
            }
            if (arrayForSetValue.length == 0) {
                openAlertpopup(1, 'please_enter_parameter_details');
                return;
            }

            if (isPrimaryIdContainerHidden || isPrimaryIdContainerDisabled) {
                var infoMoreDetails = i18n.t('more_details');
                self.showMoreInfo(false);
                $("#addTemplateInstanceInfoPopup").modal("show");
                $("#addTemplateInstanceInfoModalBody").prop('style', 'height: 150px !important');
                $("#infoMessageMoreTemplateInstance").text(infoMoreDetails);
                return;
            }

            var fileSource = _.where(arrayOfPrimaryIdentifierValue, { ParamType: ENUM.get('FILE_ID') });
            if (!_.isEmpty(fileSource)) {
                for (var i = 0; i < fileSource.length; i++) {
                    if (fileSource[i].PackageId === 0) {
                        openAlertpopup(1, 'please_select_a_file');
                        return;
                    }
                }
            }
            //var containerData = $.xml2json(koUtil.editDevicetemplateXML);
            //if (containerData && containerData.length == undefined) {
            //	containerData = $.makeArray(containerData);
            //}
            //if (containerData && containerData.length > 0) {
            //	koUtil.selectedlevelContainerId = getParameterContainerId(containerData);
            //	getFileId(containerData, unloadAddTemplatepopup);
            //	return;
            //}

            var checkArrayTextValidation = 0;
            for (var g = 0; g < arrayForSetValue.length; g++) {
                //var checkArrayTextValidation = 0;
                var id = "#templateAddTxt" + arrayForSetValue[g].ParamId;
                self.regExpression(arrayForSetValue[g].ValidChars);
                var checkVal = self.validationOfRegExpression((arrayForSetValue[g].ParamValue));
                if (checkVal == false) {
                    $(id).addClass("borderColor-Text");
                    checkArrayTextValidation--;
                } else {
                    if (arrayForSetValue[g].MinLen) {
                        self.textMinLength(arrayForSetValue[g].MinLen);
                        var checkTextLength = self.validateStringLength(arrayForSetValue[g].ParamValue);
                        if (checkTextLength == false) {
                            $(id).addClass("borderColor-Text");
                            checkArrayTextValidation--;
                        } else {
                            $(id).removeClass("borderColor-Text");
                            checkArrayTextValidation++;
                        }
                    } else {
                        $(id).removeClass("borderColor-Text");
                        checkArrayTextValidation++;
                    }
                }

            }
            if (checkArrayTextValidation != arrayForSetValue.length) {
                return;
            }

            addTemplateInstance(unloadAddTemplatepopup, 0);
        }

        function addTemplateInstance(unloadAddTemplatepopup, fileId) {

            var addTemplateAppLevelInstanceReq = new Object();
            var Parameters = new Array
            var PrimaryIdentParameters = new Array();

            for (var i = 0; i < arrayForSetValue.length; i++) {
                if (arrayForSetValue[i].ParamId != 0) {
                    var Parameter = new Object();
                    Parameter.ParamElementId = arrayForSetValue[i].ParamId;
                    Parameter.ParamName = arrayForSetValue[i].ParamName;
                    //if (arrayForSetValue[i].ValueType == "File") {
                    //	Parameter.ParamValue = fileId;
                    //} else {
                    Parameter.ParamValue = arrayForSetValue[i].ParamValue;
                    //}
                    Parameter.TemplateId = arrayForSetValue[i].TemplateId;
                    Parameter.IsPrimaryIdentifier = arrayForSetValue[i].IsPrimaryIdentifier;
                    Parameter.PISequence = arrayForSetValue[i].PISequence;
                    if (arrayForSetValue[i].SourceType == undefined) {
                        Parameter.SourceType = "Default";
                    } else {
                        Parameter.SourceType = arrayForSetValue[i].SourceType;
                    }
                    Parameter.ParamType = arrayForSetValue[i].ParamType;
                    Parameter.PackageId = arrayForSetValue[i].PackageId;
                    Parameter.IncludeInMP = arrayForSetValue[i].IncludeInMP == 1 ? 1 : 0;
                    Parameter.ValueType = arrayForSetValue[i].ValueType;
                    Parameters.push(Parameter);
                }
            }

            for (var i = 0; i < arrayOfPrimaryIdentifierValue.length; i++) {
                if (arrayOfPrimaryIdentifierValue[i].ParamId != 0) {
                    var IdentifiersInstances = new Object();
                    IdentifiersInstances.Sequence = arrayOfPrimaryIdentifierValue[i].PISequence;
                    IdentifiersInstances.Value = arrayOfPrimaryIdentifierValue[i].ParamValue;
                    if (IdentifiersInstances.Value == '' || IdentifiersInstances.Value == "--Select--") {
                        openAlertpopup(1, 'please_fill_mandatory_fields_adding_instance');
                        return;
                    }
                    PrimaryIdentParameters.push(IdentifiersInstances);
                }
            }

            function callbackFunction(data, error) {
                $("#loadingDiv").hide();
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        gridRefresh('jqxgridtemplateparameterdetails');
                        $('#jqxgridtemplateparameterdetails').jqxGrid('clearselection');
                        openAlertpopup(0, 'instance_add_success');
                        unloadAddTemplatepopup('AddInstance');
                        $("#modelAddAppLevelInstance").modal('hide');
                        isAdpopup = '';
                        $("#mainPageBody").removeClass('modal-open-appendon');
                        koUtil.parameterPackageId = 0;
                        arrayForSetValue = new Array();
                    } else if (data.responseStatus.StatusCode == AppConstants.get('INSTANCE_ALREADY_EXISTS')) {
                        openAlertpopup(2, 'Instance_Already_Exists', { instancelevelname: koUtil.selectedLevelName });
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_TEMPLATE_PARAMETER_ALREADY_EXIST')) {
                        openAlertpopup(1, 'assigned_template_contains_duplicate_parameter_templates');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_INSTANCE_MAXIMUM_LIMIT_EXCEEDED')) {
                        openAlertpopup(1, 'maximum_instances_limit_reached');
                    }
                }
            }

            addTemplateAppLevelInstanceReq.ApplicationId = ApplicationIdForTemplate;
            addTemplateAppLevelInstanceReq.FormFileId = koUtil.selectedlevelFormFileId;
            addTemplateAppLevelInstanceReq.ContainerId = koUtil.selectedlevelContainerId;
            addTemplateAppLevelInstanceReq.TemplateId = koUtil.selectedTemplateId;
            addTemplateAppLevelInstanceReq.Level = koUtil.selectedLevel;
            addTemplateAppLevelInstanceReq.ParentInstanceId = koUtil.selectedlevelParentInstanceId;
            addTemplateAppLevelInstanceReq.InstanceName = $("#txtInstanceName").val();
			addTemplateAppLevelInstanceReq.IsLookupTemplate = isLookupTemplate;
            if (Parameters != '') {
                addTemplateAppLevelInstanceReq.Parameters = Parameters;
                addTemplateAppLevelInstanceReq.IdentifiersInstances = PrimaryIdentParameters;

                $("#loadingDiv").show();
                var params = '{"token":"' + TOKEN() + '","addTemplateAppLevelInstanceReq":' + JSON.stringify(addTemplateAppLevelInstanceReq) + '}';
                ajaxJsonCall('AddTemplateAppLevelInstance', params, callbackFunction, true, 'POST', true);
            } else {
                openAlertpopup(1, 'p_t_add_entername');
            }
        }


        self.validateNumber = function (data) {
            var maxValueNum = parseInt(data.ValueType.Numeric.MaxVal);
            var minValueNum = parseInt(data.ValueType.Numeric.MinVal);
            var id = "#templateAddNumeric" + data.ParamId;
            var val = parseInt($(id).val());

            if (isNaN(val)) {
                val = (minValueNum && minValueNum > 0) ? minValueNum : 0;
            } else {
                if (val > maxValueNum) {
                    val = maxValueNum;
                } else if (val < minValueNum) {
                    val = minValueNum;
                }
            }

            $(id).val(val);
            //if (val == '' || val == data.ParamValue) {
            //    if (data.PrimaryIdentifier == 'True') {
            //        updateSetValue(data, val);
            //    } else {
            //        updateEditvalue(data);
            //    }
            //} else {
            updateSetValue(data, val);
            //}
        }

        self.isNumberKey = function () {
            return validateNumberKey(event);
        }


        ///spinner
        $('[data-trigger="spinner"]').spinner();

        ///
        $("#addParamTemplateInstance").text("Add Instance for " + koUtil.selectedLevelName + ":");
        $("#btnAddInstanceTemplate").text(i18n.t('Add', { lng: lang }));

        seti18nResourceData(document, resourceStorage);
    };

    function assignContainerValue(data) {
        if (data.length == undefined) {
            data = $.makeArray(data);
        }

        for (var d = 0; d < data.length; d++) {
            if (data[d].Param != undefined) {
                if (data[d].Param.length != undefined) {
                    if (data[d].Type != undefined && data[d].Type.toUpperCase() != "GRID") {
                        assignParameterValue(data[d].Param);
                    }
                }
            }
            if (data[d].Container != undefined) {
                if (data[d].Container.length != undefined) {
                    for (var a = 0; a < data[d].Container.length; a++) {

                        assignContainerValue(data[d].Container[a]);
                    }
                } else {
                    assignContainerValue(data[d].Container);
                }
            }
        }
    }

    function assignParameterValue(Param) {
        for (var l = 0; l < Param.length; l++) {
            if (Param[l].ValueType.Type == 'Enumeration') {
                var id = '#templateAddCombo' + Param[l].ParamId;

                if (Param[l].Default != undefined) {
                    if (Param[l].ParamId != 0) {
                        var paramValue = Param[l].Default;
                        var functionCode = "this.f = function changeEnumerationValue" + Param[l].ParamId + "(){$('" + id + "').val('" + paramValue + "').prop('selected', 'selected'); $('" + id + "').trigger('chosen:updated');}";
                        setTimeout(eval(functionCode), 1000);
                    }
                }
            }
            if (Param[l].ValueType.Type == 'DateTime') {
                var id = '#templateAddDate' + Param[l].ParamId;
                var Options = {};
                Options.minView = 'hour';
                Options.startView = 'month';
                Options.dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
                if (Param[l].ValueType.DateTime && Param[l].ValueType.DateTime.DateFormat) {
                    Options.dateFormat = Param[l].ValueType.DateTime.DateFormat;
                }
                if (Options.dateFormat != undefined && Options.dateFormat != '') {
                    Options = validateDateFormat(Options);
                }
                var today = getTodayDate();
                //var functionCodeDate = "this.f = function changeDateValue" + Param[l].ParamId + "(){$('" + id + "').datetimepicker({ autoclose: true });}";
                var functionCodeDate = "this.f = function changeDateValue" + Param[l].ParamId + "(){ $('" + id + "').datetimepicker({ format:'" + Options.dateFormat + "', autoclose: true, todayBtn: true, pickerPosition: 'bottom-left',minView:'" + Options.minView + "',startView:'" + Options.startView + "', startDate: '" + today + "'});}";
                // var functionCodeDate = "this.f = function changeDateValue" + Param[l].ParamId + "(){"+updateDateTimePicker(id, dateFormat, '')+"}";
                setTimeout(eval(functionCodeDate), 1000);
            }
            Param[l].SourceType = 'Default';
            if (Param[l].PrimaryIdentifier == undefined) {
                Param[l].PrimaryIdentifier == "False";
            }
            if (Param[l].ValueType.Type == 'Boolean' || Param[l].ValueType.Type == 'CheckBox') {
                var id = '#templateAddCheck' + Param[l].ParamId;
                var checkflag = false;
                if (Param[l].Default == 1) {
                    checkflag = true;
                }
                var functionCodeCheckBox = "this.f = function changeCheckBoxValue" + Param[l].ParamId + "(){$('" + id + "').prop('checked'," + checkflag + ")}";
                setTimeout(eval(functionCodeCheckBox), 1000);
            } else if (Param[l].ValueType.Type == 'String') {
                var id = '#templateAddTxt' + Param[l].ParamId;
                if (Param[l].Default != undefined) {
                    if (Param[l].ParamId != 0) {
                        var paramValue = Param[l].Default;
                        $(id).val(paramValue);

                        if (Param[l].MaskValue && Param[l].MaskValue.toUpperCase() == 'TRUE') {
                            $(id).val('********');
                        }
                        //Partial masking value based on Length and Direction
                        if (Param[l].PartialMask && Param[l].PartialMask.toUpperCase() == 'TRUE') {
                            var id = '#templateAddTxt' + Param[l].ParamId;
                            $(id).val(paramValue);
                            var paramValueLength = paramValue ? paramValue.length : 0;
                            if (Param[l].MaskLength && paramValueLength > Param[l].MaskLength) {
                                if (Param[l].MaskDirection && Param[l].MaskDirection.toUpperCase() == AppConstants.get('PARTIAL_MASKING_DIRECTION_RIGHT')) {
                                    var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - Param[l].MaskLength) : '****';
                                    $(id).val('****' + lastcharcters);
                                }
                                else if (Param[l].MaskDirection && Param[l].MaskDirection.toUpperCase() == AppConstants.get('PARTIAL_MASKING_DIRECTION_LEFT')) {
                                    var Firstcharcters = $(id).val() ? $(id).val().substr(0, Param[l].MaskLength) : '****';
                                    $(id).val(Firstcharcters + '****');
                                }
                                else {
                                    var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - Param[l].MaskLength) : '****';
                                    $(id).val('****' + lastcharcters);
                                }
                            }
                            else if (Param[l].MaskLength && paramValueLength <= Param[l].MaskLength) {
                                $(id).val('********');
                            }
                            else if (paramValueLength > 4) {
                                var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - 4) : '****';
                                $(id).val('****' + lastcharcters);

                            }
                            else {
                                $(id).val('********');
                            }
                        }
                    }
                }
            } else if (Param[l].ValueType.Type == 'File') {
                var id = '#templateAddFile' + Param[l].ParamId;
                $(id).val(Param[l].ParamValue);
            }

            var Parameter = new Object();
            Parameter.ParamId = Param[l].ParamId;
            Parameter.ParamValue = Param[l].ValueType.Type == "File" ? Param[l].ParamValue : Param[l].Default;
            Parameter.ParamName = Param[l].Name;
            Parameter.TemplateId = 0;
            Parameter.SourceType = 'Default';
            Parameter.IsPrimaryIdentifier = (Param[l].PrimaryIdentifier == "True") ? 1 : 0;
            Parameter.PISequence = Param[l].Sequence ? Param[l].Sequence : 0;
            Parameter.ParamType = Param[l].ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
            Parameter.PackageId = Param[l].ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
            Parameter.IncludeInMP = Param[l].IncludeInMP == "True" ? 1 : 0;
            Parameter.ValueType = Param[l].ValueType.Type;
            arrayForSetValue.push(Parameter);

            //Include all primary identifiers in collection
            if (Param[l].PrimaryIdentifier == "True") {
                var PIParameter = new Object();
                PIParameter.ParamId = Param[l].ParamId;
                PIParameter.ParamName = Param[l].Name;
                PIParameter.ParamValue = Param[l].ValueType.Type == "File" ? Param[l].ParamValue : Param[l].Default;
                PIParameter.TemplateId = 0;
                PIParameter.SourceType = 'Default';
                PIParameter.IsPrimaryIdentifier = (Param[l].PrimaryIdentifier == "True") ? 1 : 0;
                PIParameter.PISequence = Param[l].Sequence ? Param[l].Sequence : 0;
                PIParameter.ParamType = Param[l].ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
                PIParameter.PackageId = Param[l].ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
                PIParameter.IncludeInMP = Param[l].IncludeInMP == "True" ? 1 : 0;
                PIParameter.ValueType = Param[l].ValueType.Type;

                if (Param[l].ValueType.Type == 'Enumeration') {
                    var sourceItem = _.where(Param[l].ValueType.Enumeration.EnumItem, { Value: Param[l].Default });
                    if (sourceItem != '')
                        PIParameter.ParamValue = sourceItem[0].Name;
                }

                arrayOfPrimaryIdentifierValue.push(PIParameter);
            }

        }
        if (arrayOfPrimaryIdentifierValue.length > 0) {
            isPrimaryIdentifierExist = true;
            $('#instanceNameFormAddInstanceTemplate').addClass('hide');
        } else {
            isPrimaryIdentifierExist = false;
            $('#instanceNameFormAddInstanceTemplate').removeClass('hide');
        }
    }

});


function ckecktxtchanges(self) {

    if ($(self).val().trim() == '') {
        ischanges = false;
    } else {
        ischanges = true;
    }
}
