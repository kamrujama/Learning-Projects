define(["knockout", "koUtil", "autho", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil, autho, ADSearchUtil) {
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function getDetailsOfEditTemplate() {
      
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

        self.editParametersDetials = ko.observable();
        var applicationName = koUtil.getEditDeviceProfile.ApplicationName;
        var applicationVersion = koUtil.getEditDeviceProfile.ApplicationVersion;

        var msgRestore = i18n.t('edit_parameter_for_application', { lng: lang }) + " " + applicationName + " " + i18n.t('Version_packageUpgrade', { lng: lang }) + " " + applicationVersion;
        self.editParametersDetials(msgRestore);

        self.JsonXmlData = ko.observable();
        self.templateXML = ko.observable();

        self.paramId = ko.observable();
        self.SourceId = ko.observable();
        self.SourceType = ko.observable();

        var savecheck = 0;

        self.paramValue = ko.observable();

        self.paramValueType = ko.observable();

        self.controlType = ko.observable();

        self.paramDllData = ko.observable();

        self.paramDefaultValue = ko.observable();

        self.oldtextValue = ko.observable();

        self.oldnumericValue = ko.observable();

        self.oldEnumtValue = ko.observable();

        //Tab Left and Right arrow Navigation 
        var left = 0;
        var contrWidth = 0;
        self.moveLeft = function () {
			contrWidth = $('#resultSectionDeviceSearchParameters').width();        //When we move left
            left = moveTabsLeft("#templateTabs", "#moveLeft", "#moveRight", self.templateXML().length, left, contrWidth);
        }

        self.moveRight = function () {
			contrWidth = $('#resultSectionDeviceSearchParameters').width();        //When we move right
            left = moveTabsRight("#templateTabs", "#moveLeft", "#moveRight", self.templateXML().length, left, contrWidth);
        }

        $('#editParamVpdxHeader').mouseup(function () {
            $("#editParamVpdx").draggable({ disabled: true });
        });

        $('#editParamVpdxHeader').mousedown(function () {
            $("#editParamVpdx").draggable({ disabled: false });
        });

        self.checkcall = function (data) {
            
        }

        self.tabArr = ko.observableArray();

        checkRights();

        function checkRights() {
            retvalForBasicParamView = autho.checkRightsBYScreen('Basic Parameter Management', 'IsviewAllowed');
            retvalForAdvParamView = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsviewAllowed');
            retvalForBasicParamEdit = autho.checkRightsBYScreen('Basic Parameter Management', 'IsModifyAllowed');
            retvalForAdvParamEdit = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsModifyAllowed');
        }

        getEditParameterForApplicationDetails(koUtil.getEditDeviceProfile.ApplicationId, self.JsonXmlData, self.templateXML, self.tabArr);
        seti18nResourceData(document, resourceStorage);
    };





    //------API call GetDeviceFormFile-------
    function getEditParameterForApplicationDetails(applicationID, JsonXmlData, templateXML, tabArr) {
        var getDeviceFormFileReq = new Object();
        var Selector = new Object();

        getDeviceFormFileReq.ApplicationId = applicationID;
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
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    //if (data && data.getDeviceFormFileResp) {
                    //    data.getDeviceFormFileResp = $.parseJSON(data.getDeviceFormFileResp);
                    //}


                    if (data.getDeviceFormFileResp) {
                        DeviceParamAppGID = data.getDeviceFormFileResp.AppGID;
                        koUtil.editDevicetemplateXML = data.getDeviceFormFileResp.ParameterFormFiles[0].FormFileXML;
                        var JsonXmlData1 = $.xml2json(koUtil.editDevicetemplateXML);

                        var MainContainer = new Array();
                        var arr = new Array();
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
                                    paramLevel = 0;
                                    GenerateContainerData(JsonXmlData1[i].ParameterFile[j].Container[t], tabContainer, paramLevel, DeviceParamAppGID, undefined, 1, true, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, !koUtil.isDeviceProfile(), koUtil, false);
                                }
                            }
                        }

                        $("#templateTabs").css("width", tabContainer.length * 110 + "px");
                        self.templateXML(tabContainer);

                        setTimeout(function () {
                            contrWidth = $('#resultSectionDeviceSearchParameters').width();
                            left = 0;
                            updateTabsNavigation("#templateTabs", "#moveLeft", "#moveRight", tabContainer.length, left, contrWidth);
                        }, 500);
                    }

                }
            }
        }

        var method = 'GetDeviceFormFile ';
        var params = '{"token":"' + TOKEN() + '","getDeviceFormFileReq":' + JSON.stringify(getDeviceFormFileReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }
});