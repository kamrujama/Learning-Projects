define(["knockout", "koUtil", "autho", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil, autho, ADSearchUtil) {
    var lang = getSysLang();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function getParameterValuesForResult() {


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


        paramDataArray = new Array();

        tabContainer = new Array();

        paramLevel = 0;

        DeviceParamAppGID = '';

        mainContainer = new Array();

        var self = this;
        
        var retvalForBasicParamView = false;
        var retvalForAdvParamView = false;
        var retvalForBasicParamEdit = false;
        var retvalForAdvParamEdit = false;

        self.JsonXmlData = ko.observable();
        self.templateXML = ko.observable();

        var templateID = koUtil.deviceViewParameterTemplate.TemplateId;
        var templateName = koUtil.deviceViewParameterTemplate.TemplateName;
        var applicationName = koUtil.deviceEditTemplate.ApplicationName;
        var applicationVersion = koUtil.deviceEditTemplate.ApplicationVersion;
        var applicationId = koUtil.deviceEditTemplate.ApplicationId;

    

        $('#mdlViewParamResultHeader').mouseup(function () {
            $("#mdlViewParamResult").draggable({ disabled: true });
        });

        $('#mdlViewParamResultHeader').mousedown(function () {
            $("#mdlViewParamResult").draggable({ disabled: false });
        });

        checkRights();

        function checkRights() {
            retvalForBasicParamView = autho.checkRightsBYScreen('Basic Parameter Management', 'IsviewAllowed');
            retvalForAdvParamView = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsviewAllowed');
            retvalForBasicParamEdit = autho.checkRightsBYScreen('Basic Parameter Management', 'IsModifyAllowed');
            retvalForAdvParamEdit = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsModifyAllowed');
        }

        getDeviceFormFiles(self.JsonXmlData, self.templateXML);

        //Tab Left and Right arrow Navigation 
        var left = 0;
        var contrWidth = 0;
        self.moveLeft = function () {
			contrWidth = $('#resultSectionViewParameters').width();        //When we move left
            left = moveTabsLeft("#templateTabs", "#moveVPLeft", "#moveVPRight", self.templateXML().length, left, contrWidth);
        }

        self.moveRight = function () {
			contrWidth = $('#resultSectionViewParameters').width();        //When we move right
            left = moveTabsRight("#templateTabs", "#moveVPLeft", "#moveVPRight", self.templateXML().length, left, contrWidth);
        }

       
        self.headingForViewParameter = ko.observable();

        var msgRestore = i18n.t('p_t_view_title', { lng: lang }) + " " + templateName + " " + i18n.t('p_t_view_app', { lng: lang }) + " " + applicationName + " " + i18n.t('Version_packageUpgrade', { lng: lang }) + " " + applicationVersion;
        self.headingForViewParameter(msgRestore);

        function getDeviceFormFiles(JsonXmlData, templateXML) {
            var getDeviceFormFileReq = new Object();
            var Selector = new Object();

            getDeviceFormFileReq.ApplicationId = applicationId;
            getDeviceFormFileReq.IsFromDeviceSearch = !koUtil.isDeviceProfile();
            getDeviceFormFileReq.Protocol = koUtil.Protocol;

            if (koUtil.isDeviceProfile() == true) {
                getDeviceFormFileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
                getDeviceFormFileReq.DeviceSearch = null;
                getDeviceFormFileReq.ColumnFilter = null;

                Selector.SelectedItemIds = koUtil.deviceProfileUniqueDeviceId;
                Selector.UnSelectedItemIds = null;
            } else {
                getDeviceFormFileReq.UniqueDeviceId = 0;
                getDeviceFormFileReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                getDeviceFormFileReq.ColumnFilter = koUtil.GlobalColumnFilter;

                var selectedItemIds = getSelectedUniqueId('Devicejqxgrid');
                var unSelectedItemIds = getUnSelectedUniqueId('Devicejqxgrid');
                var checkAll = checkAllSelected('Devicejqxgrid');

                if (checkAll == 1) {
                    Selector.SelectedItemIds = null;
                    if (unSelectedItemIds.length > 0) {
                        Selector.UnSelectedItemIds = unSelectedItemIds;
                    } else {
                        Selector.UnSelectedItemIds = null;
                    }
                } else {
                    Selector.SelectedItemIds = selectedItemIds;
                    Selector.UnSelectedItemIds = null;
                }
            }
            getDeviceFormFileReq.Selector = Selector;

            function callbackFunction(data, error) {
                if (data) {
                    $("#loadingDiv").hide();
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        //if (data && data.getDeviceFormFileResp) {
                        //    data.getDeviceFormFileResp = $.parseJSON(data.getDeviceFormFileResp);
                        //}

                        if (data.getDeviceFormFileResp && data.getDeviceFormFileResp.ParameterFormFiles) {
                            DeviceParamAppGID = data.getDeviceFormFileResp.AppGID;
                            koUtil.editDevicetemplateXML = data.getDeviceFormFileResp.ParameterFormFiles[0].FormFileXML;
                            var JsonXmlData1 = $.xml2json(koUtil.editDevicetemplateXML);
                            createContainerTabs(JsonXmlData, templateXML);
                            //--------get parameters values------------
                            getGetParameterValuesForTemplateDetails(templateXML);
                        }

                    } 
                }
            }
            $("#loadingDiv").show();
            var method = 'GetDeviceFormFile';
            var params = '{"token":"' + TOKEN() + '","getDeviceFormFileReq":' + JSON.stringify(getDeviceFormFileReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        function createContainerTabs(JsonXmlData, templateXML) {
            templateXML([]);
            tabContainer = [];
            var JsonXmlData1 = $.xml2json(koUtil.editDevicetemplateXML);
            JsonXmlData(JsonXmlData1);

            var MainContainer = new Array();
            var arr = new Array();
            if (JsonXmlData1.length == undefined) {
                JsonXmlData1 = $.makeArray(JsonXmlData1);
            } else {

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
                        paramLevel = 0;
                        GenerateContainerData(JsonXmlData1[i].ParameterFile[j].Container[t], tabContainer, paramLevel, DeviceParamAppGID, undefined, 1, true, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, !koUtil.isDeviceProfile(), koUtil, false);
                    }
                }
            }

            $("#templateTabs").css("width", tabContainer.length * 110 + "px");
            templateXML(tabContainer);

            setTimeout(function () {
                contrWidth = $('#paramValueForTempResultHeader').width();
                left = 0;
                updateTabsNavigation("#templateTabs", "#movePVTLeft", "#movePVTRight", tabContainer.length, left, contrWidth);
            }, 500);
        }



        //--------get parameters values------------
        //getGetParameterValuesForTemplateDetails(templateID, self.templateXML);



        function getGetParameterValuesForTemplateDetails(templateXML) {
            var getParameterValuesForTemplateReq = new Object();
            getParameterValuesForTemplateReq.TemplateId = templateID;

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data && data.getParameterValuesForTemplateResp) {
                            data.getParameterValuesForTemplateResp = $.parseJSON(data.getParameterValuesForTemplateResp);
                        }

                        if (data.getParameterValuesForTemplateResp) {
                            for (var k = 0; k < tabContainer.length; k++) {
                                for (var j = 0; j < tabContainer[k].Container.length; j++) {
                                    assignContainerValue(tabContainer[k].Container[j], data.getParameterValuesForTemplateResp.ParameterDetails);
                                }
                            }
                        }
                    } 
                }
            }

            var method = 'GetParameterValuesForTemplate';
            var params = '{"token":"' + TOKEN() + '","getParameterValuesForTemplateReq":' + JSON.stringify(getParameterValuesForTemplateReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }
        seti18nResourceData(document, resourceStorage);
    };

    function assignContainerValue(data, ParameterDetails) {
        if (data.length == undefined) {
            data = $.makeArray(data);
        }

        for (var d = 0; d < data.length; d++) {
            if (data[d].Param != undefined) {
                if (data[d].Param.length != undefined) {

                    assignParamValue(data[d].Param, ParameterDetails);
                } else {

                }
            }
            if (data[d].Container != undefined) {
                if (data[d].Container.length != undefined) {
                    for (var a = 0; a < data[d].Container.length; a++) {

                        assignContainerValue(data[d].Container[a], ParameterDetails);
                    }
                } else {
                    assignContainerValue(data[d].Container, ParameterDetails);
                }

            } else {

            }
        }

    }

    function assignParamValue(Param, ParameterDetails) {
        for (var l = 0; l < Param.length; l++) {

            var pid = parseInt(Param[l].ParamId);
            var source = _.where(ParameterDetails, { ParamId: pid })
            if (source != '') {
                if (Param[l].ValueType.Type == 'Enumeration') {
                    var id = '#templateCombo' + Param[l].ParamId;
                    $(id).val(source[0].ParamValue).prop("selected", "selected");
                    $(id).trigger('chosen:updated');
                }
                if (Param[l].ValueType.Type == 'String') {
                    var id = '#templateTxt' + Param[l].ParamId;
                    $(id).val(source[0].ParamValue);
                    if (Param[l].MaskValue && Param[l].MaskValue.toUpperCase() == 'TRUE') {
                        $(id).val('********');
                    }
                }
                if (Param[l].ValueType.Type == 'Numeric') {
                    var id = '#templateNumeric' + Param[l].ParamId;
                    $(id).val(source[0].ParamValue);
                }

                if (Param[l].ValueType.Type == 'DateTime') {
                    var id = '#templateDate' + Param[l].ParamId;
                    $(id).val(source[0].ParamValue);
                }
                if (Param[l].ValueType.Type == 'CheckBox' || Param[l].ValueType.Type == 'Boolean') {

                    var id = '#templateCheck' + source[0].ParamId;
                    if (source[0].ParamValue == 1) {
                        $(id).prop("checked", true);
                    } else {
                        $(id).prop("checked", false);
                    }

                }
            } else {
                $(".controldiv" + Param[l].ParamId).css("display", "none");
                //Param[l].Access = 'None';
            }

        }
    }



});
