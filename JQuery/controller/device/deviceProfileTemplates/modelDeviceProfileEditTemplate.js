define(["knockout", "koUtil", "autho", "advancedSearchUtil", "knockout.mapping", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "bootstrapDateTimePicker", "chosen"], function (ko, koUtil, autho, ADSearchUtil, koMapping) {
    var lang = getSysLang();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    var treeOriginalColl;

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
        arrayForSetValue = new Array();
        arrayOfPrimaryIdentifierValue = new Array();
        arrayOfInvalidChars = new Array();
        levelInstanceDetails = new Array();
        DeviceParamAppGID = '';
        arrayofeditvalue = new Array();
        arrayOfInvalidChars = new Array();
        var self = this;
        var retvalForBasicParamView = false;
        var retvalForAdvParamView = false;
        var retvalForBasicParamEdit = false;
        var retvalForAdvParamEdit = false;
        var isGridTabSelect = false;
        var isAddInstance = false;
        isSelectedInstanceisMulti = false;

        subchildInstanceID = 0;
        var checkFlagForOnload = 1;
        koUtil.selectedLevel = 0;
        koUtil.isParamValuesChanged(false);
        koUtil.currentScreen = 'DeviceProfileEditParameters';
        self.FileCheck = ko.observable(false);
        self.editParametersDetials = ko.observable();
        var fileData = new Object();
        var applicationName, applicationVersion, applicationId;

        if (koUtil.viewParameterTemplateOnDevice == true) {
            applicationName = koUtil.deviceEditTemplate.ApplicationName;
            applicationVersion = koUtil.deviceEditTemplate.ApplicationVersion;
            applicationId = koUtil.deviceEditTemplate.ApplicationId;
        } else {
            applicationName = koUtil.getEditDeviceProfile.ApplicationName;
            applicationVersion = koUtil.getEditDeviceProfile.ApplicationVersion;
            applicationId = koUtil.getEditDeviceProfile.ApplicationId;
        }

        var msgRestore = i18n.t('edit_parameter_for_application', { lng: lang }) + " " + applicationName + " " + i18n.t('Version_packageUpgrade', { lng: lang }) + " " + applicationVersion;
        self.editParametersDetials(msgRestore);

        self.JsonXmlData = ko.observable();
        self.templateXML = ko.observable();

        self.paramId = ko.observable();
        self.SourceId = ko.observable();
        self.SourceTempId = ko.observable();
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

        self.paramFormat = ko.observable();

        self.oldtextValue = ko.observable();

        self.oldnumericValue = ko.observable();

        self.oldDateValue = ko.observable();

        self.oldBooleanValue = ko.observable();

        self.oldEnumtValue = ko.observable();

        self.editAccessValue = ko.observable();

        self.templateTxtValueNum = ko.observable();
        self.regExpression = ko.observable();
        self.textMinLength = ko.observable();
        self.templateFlag = ko.observable(false);
        self.templateFileFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();
        self.observableModelPopupFiles = ko.observable();
        self.parametersObservableModel = ko.observable();
        self.versionFlag = ko.observable(true);
        self.treeColl = ko.observableArray();
        self.breadcrumbColl = ko.observableArray([]);
        self.sequenceNavUp = ko.observable(true);
        self.sequenceNavDown = ko.observable(true);
        self.isEditTemplateAllowed = ko.observable(true);
        self.isEditTemplateNotAllowed = ko.observable(true);
        self.checkAcrossAllInstances = ko.observable(false);
        self.showMoreInfo = ko.observable(false);
        isPrimaryIdentifierExists = false;
        var isPrimaryIdContainerHidden = false;
        var isPrimaryIdContainerDisabled = false;
        var isFileIdModified = false;
        arrayOfPrimaryIdentifierValue = [];
        self.templateStoredData = ko.observable();
        var oldInstanceName = '';

        checkRights();
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        loadelementGlobalParameters(modelname, 'genericPopup');
        self.checkTxtEditInstanceName = ko.observable();
        self.checkTxtEditInstanceName.subscribe(function (newValue) {
            if (newValue != null || newValue.trim() != '') {
                if ($("#txtEditInstanceName").val().trim() != '') {
                    if (arrayOfInvalidChars.length == 0) {
                        $("#btnSaveInstance").removeAttr('disabled');
                    }
                } else {
                    $("#btnSaveInstance").prop('disabled', true);
                }
            } else {
                $("#btnSaveInstance").prop('disabled', true);
            }
        });
        if (koUtil.getEditDeviceProfile.IsMultiVPFXSupported) {
            $("#updateAcrossAllInstancesCheck").removeClass('hide');
        } else {
            $("#updateAcrossAllInstancesCheck").addClass('hide');
        }

        self.onChangeAcrosssAllInstances = function () {
            if ($("#chkValidation").is(':checked')) {
                $('#mainSplitter').hide();
                $('#SaveCancelDiv').hide();
                $('#treeBreadcrumb').hide();
                $('#globalparametertemplate').show();
                self.checkAcrossAllInstances(true);
                loadelementGlobalParameters('modelGlobalUpdateParameterMultiInstance', 'device');
            } else {
                self.parametersObservableModel('unloadTemplate');
                $('#mainSplitter').show();
                $('#SaveCancelDiv').show();
                $('#treeBreadcrumb').show();
                $('#globalparametertemplate').hide();
            }
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
            // end new template code
        }

        //For Load element
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        function loadelementPackageFiles(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopupFiles(elementname);
        }

        function loadelementGlobalParameters(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.parametersObservableModel(elementname);
        }

        self.unloadPackageFilesPopup = function (popupName) {
            self.observableModelPopupFiles('unloadTemplate');
            $("#filesModel").modal('hide');
        }

        function checkRights() {
            retvalForBasicParamView = autho.checkRightsBYScreen('Basic Parameter Management', 'IsviewAllowed');
            retvalForAdvParamView = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsviewAllowed');
            retvalForBasicParamEdit = autho.checkRightsBYScreen('Basic Parameter Management', 'IsModifyAllowed');
            retvalForAdvParamEdit = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsModifyAllowed');
            // hideControls();
        }

        function hideControls() {
            if (VHQFlag === false) {
                $('#allInstancesDiv').hide();			//update across all instances checkbox
                $('#SaveCancelDiv').hide();				//Save & Cancel footer
                $('#btnAddElement').hide();				//Add Instance button
                $('#btnEditElement').hide();			//Edit Instance button
                $('#btnDeleteElement').hide();			//Delete Instance button
                $('#btnRestoreDefaultDiv').hide();		//Slider window Restore to default button
                $('#footer').hide();					//Slider window Save & Cancel button
            }
        }

        self.openPopup = function (popupName) {
            self.templateFlag(true);
            if (popupName == "modelAddDeviceAppLevelInstance") {
                //TO Clear the Sub children instances
                if (koUtil.selectedInstance() && koUtil.selectedInstance().children().length > 0) {
                    for (var k = 0; k < koUtil.selectedInstance().children().length; k++) {
                        koUtil.selectedInstance().children()[k].dropdownCol([]);
                        koUtil.selectedInstance().children()[k].parentInstanceId(0);
                        koUtil.selectedInstance().children()[k].parentInstanceName('');
                    }
                }
                koUtil.selectedInstanceLevelDetails = getInstanceLevelDetails(true);
                updateInstanceSelection();

                loadelement(popupName, 'device/deviceProfileTemplates');
                $('#modelAddAppLevelInstance').modal('show');

            }
        }

        ///spinner
        $('[data-trigger="spinner"]').spinner();

        self.confirmInstance = ko.observable();
        self.confirmPrevInstance = ko.observable();
        self.confirmPrevTarget = ko.observable();
        self.isSequenceChanged = ko.observable(false);
        self.confirmTarget = ko.observable();
        var selectionMode = '';
        var isTreeNodeSelected = false;
        var isComboSelected = false;

        self.onClickLevel = function (instance, event) {
            if (arrayofeditvalue.length == 0) {
                self.confirmPrevInstance(instance);
                if (typeof event.target == 'undefined') { var target = event.srcElement; } else { var target = event.target; }
                self.confirmPrevTarget(target);
            }
            //$("#btnAddElement").prop('disabled', false);
            selectionMode = 'treeNode';
            isTreeNodeSelected = true;
            isComboSelected = false;
            self.confirmInstance(instance);
            koUtil.selectedInstance(instance);
            if (typeof event.target == 'undefined') { var target = event.srcElement; } else { var target = event.target; }
            self.confirmTarget(target);
            if (arrayofeditvalue.length > 0) {
                $("#EditParameterConfirmPopup").modal('show');
                return;
            }

            if (instance.Level() > 1 && instance.parentInstanceId() == 0) {
                openAlertpopup(1, 'Select_parent_level_first');
                return;
            }
            handleNodeClick(instance, event);

            var selectedDropDownId = "#treeCombo" + koUtil.selectedlevelFormFileId + "_" + koUtil.selectedLevel;
            $('#txtEditInstanceName').val($(selectedDropDownId).find('option:selected').text());
            var ddlSelectedInstanceID = $(selectedDropDownId).find('option:selected')[0] ? $(selectedDropDownId).find('option:selected')[0].index : 0;
            $('#treeSection').find("select").each(function () {
                var ddlLevel = $(this)[0].id.substr($(this)[0].id.indexOf("_") + 1);
                if (ddlLevel >= koUtil.selectedLevel) {
                    $(this).prop('selectedIndex', 0);
                    $(this).trigger('chosen:updated');
                }
            });

            $(selectedDropDownId).prop('selectedIndex', ddlSelectedInstanceID);
            $(selectedDropDownId).trigger('chosen:updated');
        }

        var previousSelectedCol = new Array();
        self.onChangeSelect = function (instance, event) {
            if (arrayofeditvalue.length == 0) {
                self.confirmPrevInstance(instance);
                if (typeof event.target == 'undefined') { var target = event.srcElement; } else { var target = event.target; }
                self.confirmPrevTarget(target);
            }
            isTreeNodeSelected = false;
            isComboSelected = true;
            selectionMode = 'comboBox';
            self.confirmInstance(instance);
            //if (typeof event.target == 'undefined') { var target = event.srcElement; } else { var target = event.target; }
            //self.confirmTarget(target);
            koUtil.selectedInstance(instance);
            if (arrayofeditvalue.length > 0) {
                $("#EditParameterConfirmPopup").modal('show');
                return;
            }

            isGridTabSelect = false;
            handleComboChange(instance);
            var selectedDropDownId = "#treeCombo" + koUtil.selectedlevelFormFileId + "_" + koUtil.selectedLevel;
            $('#txtEditInstanceName').val($(selectedDropDownId).find('option:selected').text());
            oldInstanceName = koUtil.selectedInstanceName;
            var ddlSelectedInstanceID = $(selectedDropDownId).find('option:selected')[0].index;
            $('#treeSection').find("select").each(function () {
                var ddlLevel = $(this)[0].id.substr($(this)[0].id.indexOf("_") + 1);
                if (ddlLevel >= koUtil.selectedLevel) {
                    $(this).prop('selectedIndex', 0);
                    $(this).trigger('chosen:updated');
                }
            });

            $(selectedDropDownId).prop('selectedIndex', ddlSelectedInstanceID);
            $(selectedDropDownId).trigger('chosen:updated');
        }

        self.onTabSelect = function (data) {
            if (data.Type.toUpperCase() == 'GRID') {
                //if (koUtil.selectedInstance() == undefined) {
                //    $("#btnAddElement").prop('disabled', true);
                //}
                $("#templateTabs li div span").addClass("tabMask");
                $("#btnSaveInstance").prop('disabled', true);
                $('#subContainerDivDeviceProfile').removeClass('hide');
                $('#instanceParametersDivDeviceProfile').removeClass('hide');
                $('#noContainerAccessDivDeviceProfile').addClass('hide');
                if (arrayofeditvalue.length > 0) {
                    $("#EditParameterConfirmPopup").modal('show');
                    return;
                }
            }
        }

        self.hideSuccessPopup = function () {
            gId = "jqxgridcontainerparameterdetails";
            $("#instanceSuccessPopup").modal('hide');
            if (isSelectedInstanceisMulti && koUtil.selectedLevel > 0) {
                gridRefresh(gId);
                $('#' + gId).jqxGrid('clearselection');
            }
        }

        self.cancelPopup = function (unloadAddTemplatepopup) {
            if (arrayofeditvalue.length > 0 || self.isSequenceChanged()) {
                if (isSelectedInstanceisMulti) {
                    var prevTarget = self.confirmPrevTarget();
                    self.confirmTarget(prevTarget);
                    $("#EditParameterConfirmPopup").modal('show');
                } else {
                    $("#TemplateConfirmPopup").modal('show');
                }
            } else {
                unloadAddTemplatepopup('checkTxtValue');
                refreshDeviceProfileLitePage(AppConstants.get('PARAMETERS_REFRESH_DATA'));
            }
        }

        self.cancelChangesConfirmation = function () {
            $("#TemplateConfirmPopup").modal('hide');
            $("#mainPageBody").addClass('modal-open-appendon');
        }

        function storeInstanceLevelDetails(instance) {
            var storedData = _.where(levelInstanceDetails, { Level: koUtil.selectedLevel, LevelName: koUtil.selectedLevelName, InstanceName: koUtil.selectedInstanceName });
            if (storedData.length == 0) {
                var levelDetails = new Object();
                levelDetails.Level = koUtil.selectedLevel;
                levelDetails.LevelName = koUtil.selectedLevelName;
                levelDetails.InstanceName = koUtil.selectedInstanceName;
                levelDetails.ParentInstanceId = instance.parentInstanceId();
                levelDetails.ParentInstanceName = instance.parentInstanceName();
                levelDetails.ParentLevel = instance.ParentLevel();
                levelInstanceDetails.push(levelDetails);
            } else if (storedData.length > 0) {
                var index = levelInstanceDetails.indexOf(storedData[0]);
                if (index != undefined) {
                    levelInstanceDetails[index].ParentInstanceId = instance.parentInstanceId();
                    levelInstanceDetails[index].ParentInstanceName = instance.parentInstanceName();
                    levelInstanceDetails[index].ParentLevel = instance.ParentLevel();
                }
            }
        }
        function getParentInstanceLevelDetails(levelVO, levelList) {
            var storedData = _.where(levelInstanceDetails, { Level: levelVO.Level - 1, LevelName: levelVO.ParentLevel, InstanceName: levelVO.ParentInstanceName });
            if (storedData.length > 0) {
                var levelPVO = new Object();
                levelPVO.Level = storedData[0].Level;
                levelPVO.InstanceName = storedData[0].InstanceName;
                levelList.push(levelPVO);
                if (storedData[0].Level > 1) {
                    return getParentInstanceLevelDetails(storedData[0], levelList);
                } else {
                    return levelList;
                }
            } else {
                return levelList;
            }
        }
        function getInstanceLevelDetails(addFlag) {
            var levelList = [];
            var storedData = [];
            if (addFlag) {
                storedData = _.where(levelInstanceDetails, { Level: koUtil.selectedLevel - 1, LevelName: koUtil.selectedlevelParentLevel, InstanceName: koUtil.selectedlevelParentInstanceName });
            } else {
                storedData = _.where(levelInstanceDetails, { Level: koUtil.selectedLevel, LevelName: koUtil.selectedLevelName, InstanceName: koUtil.selectedInstanceName });
            }
            if (storedData.length > 0) {
                var levelVO = new Object();
                levelVO.Level = storedData[0].Level;
                levelVO.InstanceName = storedData[0].InstanceName;
                levelList.push(levelVO);
                if (storedData[0].Level > 1) {
                    return getParentInstanceLevelDetails(storedData[0], levelList);
                } else {
                    return levelList;
                }
            } else {
                return levelList;
            }
        }

        function handleNodeClick(instance, event) {
            if (typeof event.target == 'undefined') { var target = event.srcElement; } else { var target = event.target; }
            if ($(target).prop("tagName") == 'SPAN') {
                $(target).next().find("select").prop('selectedIndex', 0);
                $(target).next().find("select").trigger('chosen:updated');
                isGridTabSelect = true;
            }
            else {
                $(target).parent().find("select").prop('selectedIndex', 0);
                $(target).parent().find("select").trigger('chosen:updated');
            }
            if (instance.children().length > 0 && instance.isMulti()) {
                clearChildDropDownColl(instance);
            }
            $(".treeNodeCntr .treeNodeActive").removeClass("treeNodeActive");
            if ($(target).prop("tagName") != 'BUTTON') { $(target).addClass("treeNodeActive"); }
            var rootItem = _.where(treeOriginalColl, { FormFileId: instance.FormFileId() });

            koUtil.selectedFormFile = rootItem;
            koUtil.selectedlevelFormFileId = instance.FormFileId();
            koUtil.selectedLevel = rootItem[0].Level;
            koUtil.selectedLevelName = rootItem[0].LevelName;
            koUtil.selectedInstanceName = rootItem[0].selectedInstanceName;
            isSelectedInstanceisMulti = instance.isMulti();

            var instanceSource = _.where(koUtil.selectedInstance().dropdownCol(), { InstanceId: instance.parentInstanceId() });
            var parentInstanceSourceId = !_.isEmpty(instanceSource) ? instanceSource[0].InstanceSourceId : 0;
            koUtil.selectedlevelParentInstanceSourceId = parentInstanceSourceId;

            koUtil.selectedlevelParentInstanceId = instance.parentInstanceId();
            koUtil.selectedlevelParentInstanceName = instance.parentInstanceName();
            koUtil.selectedlevelParentLevel = instance.ParentLevel();
            koUtil.editDevicetemplateXML = rootItem[0].FormFileXML;
            var containerData = $.xml2json(koUtil.editDevicetemplateXML);
            if (containerData && containerData.length == undefined) {
                containerData = $.makeArray(containerData);
                koUtil.selectedlevelContainerId = getParameterContainerId(containerData);
            }

            isTreeNodeSelected = false;
            isComboSelected = false;
            isAddInstance = false;
            isFileIdModified = false;
            arrayofeditvalue = [];
            arrayForSetValue = [];
            arrayOfInvalidChars = [];
            arrayOfPrimaryIdentifierValue = [];
            koUtil.selectedInstanceLevelDetails = getInstanceLevelDetails(true);
            subchildInstanceID = 0;
            if (!isSelectedInstanceisMulti && rootItem[0].Level > 0) {

                if (instance.dropdownCol().length > 0) {
                    subchildInstanceID = instance.dropdownCol()[0].InstanceId;
                    isAddInstance = false;
                } else {
                    isAddInstance = true;
                }
            }
            $('#subContainerDivDeviceProfile').removeClass('hide');
            $('#instanceParametersDivDeviceProfile').removeClass('hide');
            $('#noContainerAccessDivDeviceProfile').addClass('hide');

            self.JsonXmlData(containerData);

            if (containerData && containerData.length > 0 && rootItem[0].IsReferenceEnumeration) {		//if the selected FormFile has one or more ReferenceEnumeration Parameters
                var referenceEnumContainer = new Array();
                getReferenceEnumAttributes(containerData, referenceEnumContainer);
                getParameterValuesForReferenceEnum(instance, "", koUtil.selectedInstanceName, rootItem, containerData, referenceEnumContainer, false);
            } else {
                setNodeSelection(instance, "", koUtil.selectedInstanceName, rootItem, false);	//create container tabs for the selected FormFile with no ReferenceEnumeration Parameters
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
                            if (_.isEmpty(containerData[0].ParameterFile[i].Container[j].Type)) {
                                if (containerData[0].ParameterFile[i].Container[j].Param && containerData[0].ParameterFile[i].Container[j].Param.length > 0) {
                                    containerId = containerData[0].ParameterFile[i].Container[j].Param[0].ParamContainerId;
                                    break;
                                } else {
                                    containerId = containerData[0].ParameterFile[i].Container[j].Param.ParamContainerId;
                                    break;
                                }
                            }
                            if (containerData[0].ParameterFile[i].Container[j].Type === AppConstants.get('NORMAL')) {
                                if (containerData[0].ParameterFile[i].Container[j].Container && containerData[0].ParameterFile[i].Container[j].Container.length > 0) {
                                    //multiple main containers, only 1 sub container & only 1 parameter
                                    //multiple main container, only 1 sub container & multiple parameters
                                    //multiple main container, multiple sub containers & only 1 parameter                                    
                                    //multiple main container, multiple sub containers & multiple parameters

                                    if (containerData[0].ParameterFile[i].Container[j].Container[0].Param) {
                                        if(containerData[0].ParameterFile[i].Container[j].Container[0].Param.length > 0) {
                                            containerId = containerData[0].ParameterFile[i].Container[j].Container[0].Param[0].ParamContainerId;
                                        }
                                        else {
                                            containerId = containerData[0].ParameterFile[i].Container[j].Container[0].Param.ParamContainerId;
                                        }
                                    }    
                                } else {
                                    //only 1 main container, only 1 sub container & only 1 parameter
                                    //only 1 main container, only 1 sub container & multiple parameters
                                    //only 1 main container, multiple sub containers & only 1 parameter
                                    //only 1 main container, multiple sub containers & multiple parameters                                    

                                    if (containerData[0].ParameterFile[i].Container[j].Container.Param) {
                                        if(containerData[0].ParameterFile[i].Container[j].Container.Param.length > 0) {
                                            containerId = containerData[0].ParameterFile[i].Container[j].Container.Param[0].ParamContainerId;
                                        }
                                        else {
                                            containerId = containerData[0].ParameterFile[i].Container[j].Container.Param.ParamContainerId;
                                        }
                                    }
                                }
                            }
                        }
                    } else if (containerData[0].ParameterFile[i].Container && containerData[0].ParameterFile[i].Container.Param && containerData[0].ParameterFile[i].Container.Param.length > 0) {
                        containerId = containerData[0].ParameterFile[i].Container.Param[0].ParamContainerId;
                        break;
                    }
                }
            }
            return containerId;
        }

        function getParameterValuesForReferenceEnum(instance, instanceID, instanceName, rootItem, containerData, referenceEnumContainer, isEditInstance) {
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
            getParameterValuesForReferenceEnumReq.ParamSourceType = ENUM.get('DEVICE');
            getParameterValuesForReferenceEnumReq.ApplicationId = applicationId;

            function callbackFunction(data, Error) {
                if (data) {
                    if (data.getParameterReferenceEnumResp)
                        data.getParameterReferenceEnumResp = $.parseJSON(data.getParameterReferenceEnumResp);

                    var referenceEnumItems = data.getParameterReferenceEnumResp;
                    if (referenceEnumItems && referenceEnumItems.length > 0) {
                        setReferenceEnumValues(containerData, referenceEnumItems);
                    }
                    setNodeSelection(instance, instanceID, instanceName, rootItem, isEditInstance);
                }
            }

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

        function setNodeSelection(instance, instanceID, instanceName, rootItem, isEditInstance) {
            if (koUtil.viewParameterTemplateOnDevice && instance.Level() == 0) {
                createContainerTabs(self.JsonXmlData, self.templateXML, rootItem[0].Level, false, self.templateStoredData());
            } else {
                createContainerTabs(self.JsonXmlData, self.templateXML, rootItem[0].Level, true, self.templateStoredData());
            }

            if (isEditInstance) {		//instance selection from dropdown or node click of a FormFile with one or more ReferenceEnumeration parameters
                var instancePrimaryIdentifiers = new Array();
                instancePrimaryIdentifiers = instanceName.split(' | ');

                getDeviceApplicationParams();
                if (instance.children().length > 0) {
                    clearChildDropDownColl(instance);
                    if (instanceID == "" || instanceID == "0")
                        instanceID = 1;
                    for (var k = 0; k < instance.children().length; k++) {
                        instance.children()[k].parentInstanceId(instanceID);
                        instance.children()[k].parentInstanceName(instanceName);
                    }
                    getAppChildInstances(instance);
                }

                buildBreadCrumText(rootItem[0], false);

                if (rootItem[0].Level == 1) {
                    //To Clear The Other Level 1 Instance Childrens Dropdown Collection
                    for (var i = 0; i < self.treeColl().children().length; i++) {
                        var level1Instance = self.treeColl().children()[i];
                        if (instance.FormFileId() != level1Instance.FormFileId())
                            clearChildDropDownColl(level1Instance);
                    }
                }

                if (isGridTabSelect == false) {
                    $("#templateTabs li div .tabMask").removeClass("tabMask");
                    $('#templateTabs li:nth-child(2) a').click();
                }
                else {
                    isGridTabSelect = false;
                }
            } else {				//node click of a FormFile with no ReferenceEnumeration parameters
                if (!isSelectedInstanceisMulti && rootItem[0].Level > 0) {
                    getDeviceAppLevelInstanceDetails();
                }
                buildBreadCrumText(rootItem[0], true);

                if (rootItem[0].Level == 1 && isSelectedInstanceisMulti) {
                    //To Clear The Other Level 1 Instance Childrens Dropdown Collection
                    for (var i = 0; i < self.treeColl().children().length; i++) {
                        var level1Instance = self.treeColl().children()[i];
                        if (instance.FormFileId() != level1Instance.FormFileId())
                            clearChildDropDownColl(level1Instance);
                    }
                }

                $("#btnSaveInstance").prop('disabled', true);
            }

            sequenceChanged = false;
            self.isSequenceChanged(false);
            self.sequenceNavDown(true);
            self.sequenceNavUp(true);
            $("#jqxgridcontainerparameterdetails").bind("click", function (event) { seqControlSelect() });
            $("#jqxgridcontainerparameterdetails").on('rowselect', function (event) { seqControlSelect() });
        }

        function deleteLevelInstance(col, level) {
            var rootItem = _.where(col, { Level: level });
            col = jQuery.grep(col, function (Level, i) {
                return col[i].Level >= level;
            }, true);

            return col;
        }

        function seqControlSelect() {
            var rowCount = $('#jqxgridcontainerparameterdetails').jqxGrid('getrows').length;
            var selctedRow = $('#jqxgridcontainerparameterdetails').jqxGrid('getselectedrowindex');
            var selectedRowId = $("#jqxgridcontainerparameterdetails").jqxGrid('getrowid', selctedRow);
            var allowSequence = $('#allowSequence').text();

            if (allowSequence.toUpperCase() == 'FALSE') {
                self.isSequenceChanged(false);
                self.sequenceNavDown(true);
                self.sequenceNavUp(true);
                return;
            }

            if ($('#jqxgridcontainerparameterdetails').jqxGrid('getselectedrowindexes').length == 1) {
                if (rowCount == 1) {
                    self.sequenceNavDown(true);
                    self.sequenceNavUp(true);
                } else if (selectedRowId == rowCount - 1) {
                    self.sequenceNavDown(true);
                    self.sequenceNavUp(false);
                }
                else if (selectedRowId == 0) {
                    self.sequenceNavDown(false);
                    self.sequenceNavUp(true);
                }
                else {
                    self.sequenceNavDown(false);
                    self.sequenceNavUp(false);
                }
            }
            else if ($('#jqxgridcontainerparameterdetails').jqxGrid('getselectedrowindexes').length > 1 || $('#jqxgridcontainerparameterdetails').jqxGrid('getselectedrowindexes').length == 0) {
                self.sequenceNavDown(true);
                self.sequenceNavUp(true);
            }

        }

        function handleComboChange(instance) {
            isTreeNodeSelected = false;
            isComboSelected = false;
            isAddInstance = false;
            isFileIdModified = false;
            var rootItem = _.where(treeOriginalColl, { FormFileId: instance.FormFileId() });
            var id = "#treeCombo" + instance.FormFileId() + "_" + instance.Level();
            var instanceID = $(id).find('option:selected').val();
            var instanceName = $(id).find('option:selected').text();
            validateIsSelectedExist(id, instanceID, instanceName);
            if (instanceID != "" || (instanceName != "" && instanceName != "--Select--")) {
                arrayOfPrimaryIdentifierValue = [];
                isSelectedInstanceisMulti = true;
                $(".treeNodeCntr .treeNodeActive").removeClass("treeNodeActive");
                $(id).parent().parent().prev().addClass("treeNodeActive");
                $(".treeNodeCntr .lastLevel").removeClass("lastLevel");
                koUtil.selectedlevelFormFileId = instance.FormFileId();
                koUtil.selectedLevel = rootItem[0].Level;
                koUtil.selectedLevelName = rootItem[0].LevelName;
                koUtil.editDevicetemplateXML = rootItem[0].FormFileXML;

                var instanceSource = _.where(koUtil.selectedInstance().dropdownCol(), { InstanceId: instanceID });
                var parentInstanceSourceId = !_.isEmpty(instanceSource) ? instanceSource[0].InstanceSourceId : 0;
                koUtil.selectedlevelParentInstanceSourceId = parentInstanceSourceId;

                koUtil.selectedlevelParentInstanceId = instance.parentInstanceId();
                koUtil.selectedlevelParentInstanceName = instance.parentInstanceName();
                koUtil.selectedlevelParentLevel = instance.ParentLevel();
                koUtil.selectedlevelInstanceId = instanceID;
                koUtil.selectedInstanceName = instanceName;
                oldInstanceName = instanceName;
                storeInstanceLevelDetails(instance);
                koUtil.selectedInstanceLevelDetails = getInstanceLevelDetails(true);
                $('#subContainerDivDeviceProfile').removeClass('hide');
                $('#instanceParametersDivDeviceProfile').removeClass('hide');
                $('#noContainerAccessDivDeviceProfile').addClass('hide');

                var containerData = $.xml2json(koUtil.editDevicetemplateXML);
                if (containerData && containerData.length == undefined) {
                    containerData = $.makeArray(containerData);
                }
                self.JsonXmlData(containerData);
                if (containerData && containerData.length > 0) {
                    koUtil.selectedlevelContainerId = getParameterContainerId(containerData);
                    if (rootItem[0].IsReferenceEnumeration) {										//if the selected instance has one or more ReferenceEnumeration Parameters
                        var referenceEnumContainer = new Array();
                        getReferenceEnumAttributes(containerData, referenceEnumContainer);
                        getParameterValuesForReferenceEnum(instance, instanceID, instanceName, rootItem, containerData, referenceEnumContainer, true);
                    } else {
                        setNodeSelection(instance, instanceID, instanceName, rootItem, true);		//create container tabs for the selected instance with no ReferenceEnumeration Parameters
                    }
                }
            }
        }

        self.confirmNavigation = function (instance, target) {
            arrayForSetValue = [];
            arrayofeditvalue = [];
            arrayOfInvalidChars = [];
            arrayOfPrimaryIdentifierValue = [];

            if ((selectionMode == 'treeNode' || selectionMode == 'gridEdit') && isTreeNodeSelected == true) {
                //TO Clear the Sub children instances
                if (koUtil.selectedInstance().children() && koUtil.selectedInstance().children().length > 0) {
                    for (var k = 0; k < koUtil.selectedInstance().children().length; k++) {
                        koUtil.selectedInstance().children()[k].dropdownCol([]);
                        koUtil.selectedInstance().children()[k].parentInstanceId(0);
                        koUtil.selectedInstance().children()[k].parentInstanceName('');
                    }
                }
                handleNodeClick(instance, target);
            } else if (selectionMode == 'comboBox' && isComboSelected == true) {
                handleComboChange(instance, target);
            }
            if (target != undefined) {
                $(target).addClass("treeNodeActive");
                updateInstanceSelection();
            }
            isTreeNodeSelected = false;
            $("#EditParameterConfirmPopup").modal('hide');
        }

        self.cancelconfirmation = function (instance, target) {
            if (self.confirmPrevInstance() != undefined && self.confirmPrevInstance().LevelName() != undefined) {
                var prevInstance = self.confirmPrevInstance();
                self.confirmInstance(prevInstance);
                var prevTarget = self.confirmPrevTarget();
                self.confirmTarget(prevTarget);
            }
            if (selectionMode == 'comboBox') {
                if (isComboSelected == true) {
                    var id = "#treeCombo" + instance.FormFileId() + "_" + instance.Level();
                    var instanceID = $(id).find('option:selected').val();
                    var sourceData = _.where(previousSelectedCol, {
                        instanceID: id
                    });
                    if (previousSelectedCol && previousSelectedCol.length > 0) {
                        for (i = 1; i <= previousSelectedCol.length; i++) {
                            if (id == previousSelectedCol[i - 1].instanceID) {
                                var previnstanceID = previousSelectedCol[i - 1].instanceID;
                                var prevSel = previousSelectedCol[i - 1].selectedIndex;
                                $(id).val(prevSel).prop("selected", "selected");
                                $(id).trigger('chosen:updated');
                            }
                        }
                    }

                    $("#templateTabs li div .tabMask").removeClass("tabMask");
                    $('#templateTabs li:nth-child(2) a').click();
                } else {
                    $("#templateTabs li div .tabMask").removeClass("tabMask");
                    $('#templateTabs li:nth-child(2) a').click();
                }
            } else if (selectionMode == 'gridEdit') {
                $("#templateTabs li div .tabMask").removeClass("tabMask");
                $('#templateTabs li:nth-child(2) a').click();
            } else if (selectionMode == 'treeNode' && !isTreeNodeSelected) {
                $("#templateTabs li div .tabMask").removeClass("tabMask");
                $('#templateTabs li:nth-child(2) a').click();
            }

            if (arrayOfInvalidChars.length == 0) {
                $("#btnSaveInstance").prop('disabled', false);
            }
            isTreeNodeSelected = false;
            $("#EditParameterConfirmPopup").modal('hide');
            $("#mainPageBody").addClass('modal-open-appendon');
        }

        function updateTemplateContainer(tabContainer, primaryIdentifierValues) {
            self.templateXML(tabContainer);

            for (var k = 0; k < tabContainer.length; k++) {
                for (var j = 0; j < tabContainer[k].Container.length; j++) {
                    if (tabContainer[k].Container[j].Type == 'Details') {
                        assignContainerValue(tabContainer[k].Container[j], [], false, false, primaryIdentifierValues);
                        break;
                    }
                }
            }
        }

        self.editInstance = function (gID) {
            var arrayRowIndexes = $('#' + gID).jqxGrid('getselectedrowindexes');
            var selecteItemIds = new Array();
            for (var i = 0; i < arrayRowIndexes.length; i++) {
                var instanceData = $('#' + gID).jqxGrid('getrowdata', arrayRowIndexes[i]);
                selecteItemIds.push(instanceData);
            }
            if (selecteItemIds && selecteItemIds.length == 1) {
                isTreeNodeSelected = false;
                isComboSelected = false;
                selectionMode = 'gridEdit';
                isGridTabSelect = false;
                $("#templateTabs li div .tabMask").removeClass("tabMask");
                $('#templateTabs li:nth-child(2) a').click();
                koUtil.selectedlevelInstanceId = selecteItemIds[0].InstanceId;
                koUtil.selectedInstanceName = selecteItemIds[0].Name;


                var instance = self.confirmInstance();
                var rootItem = _.where(treeOriginalColl, { FormFileId: instance.FormFileId() });
                var instanceCol = [];
                var index = -1;
                instanceCol = _.where(instance.dropdownCol(), { InstanceId: selecteItemIds[0].InstanceId });
                index = koUtil.selectedInstance().dropdownCol().indexOf(instanceCol[0]);

                var id = "#treeCombo" + koUtil.selectedInstance().FormFileId() + "_" + koUtil.selectedInstance().Level();
                $(id).prop('selectedIndex', index + 1);
                $(id).trigger('chosen:updated');
                $('#txtEditInstanceName').val(instanceData.Name);
                oldInstanceName = koUtil.selectedInstanceName;
                var instancePrimaryIdentifiers = new Array();
                instancePrimaryIdentifiers = oldInstanceName.split(' | ');
                storeInstanceLevelDetails(instance);
                arrayOfPrimaryIdentifierValue = [];
                updateTemplateContainer(tabContainer, instancePrimaryIdentifiers);
                validateIsSelectedExist(id, koUtil.selectedlevelInstanceId, koUtil.selectedInstanceName);

                buildBreadCrumText(rootItem[0], false);
                //To Get Refresh the Data
                //self.templateXML(tabContainer);

                getDeviceApplicationParams();
                if (instance.children().length > 0) {
                    clearChildDropDownColl(instance);
                }

            } else if (selecteItemIds.length == 0) {
                openAlertpopup(1, 'please_select_a_instance_to_edit', { instanceName: koUtil.selectedLevelName });
                return;
            } else if (selecteItemIds.length > 1) {
                openAlertpopup(1, 'please_select_a_single_instance_to_edit', { instanceName: koUtil.selectedLevelName });
                return;
            }
        }

        function updateSelectedLevelInstanceDropDown(deleteInstances) {
            $("#templateTabs li div .tabMask").removeClass("tabMask");
            $('#templateTabs li:nth-child(1) a').click();
            var id = "#treeCombo" + koUtil.selectedInstance().FormFileId() + "_" + koUtil.selectedInstance().Level();
            for (var j = 0; j < deleteInstances.length; j++) {
                if ($(id)[0].children.length > 0) {
                    var childrens = $(id)[0].children;
                    for (var i = 0; i < childrens.length; i++) {
                        if (deleteInstances[j].Name == childrens[i].text) {
                            $(id)[0].remove(i);
                        }
                    }
                }
            }
            $(id).prop('selectedIndex', 0);
            $(id).trigger('chosen:updated');
            if ($(id)[0].children.length == 1) {
                koUtil.selectedInstance().dropdownCol([]);
                clearChildDropDownColl(koUtil.selectedInstance());
            }
            var rootItem = _.where(treeOriginalColl, { FormFileId: koUtil.selectedInstance().FormFileId() });
            buildBreadCrumText(rootItem[0], false);
        }
        function updateInstanceSelection() {
            $("#templateTabs li div .tabMask").removeClass("tabMask");
            $('#templateTabs li:nth-child(1) a').click();
            var id = "#treeCombo" + koUtil.selectedInstance().FormFileId() + "_" + koUtil.selectedInstance().Level();
            $(id).prop('selectedIndex', 0);
            $(id).trigger('chosen:updated');
            var rootItem = _.where(treeOriginalColl, { FormFileId: koUtil.selectedInstance().FormFileId() });
            buildBreadCrumText(rootItem[0], false);
        }

        function buildBreadCrumText(selectedInstance, isfromCLick) {

            var baseItem = _.where(self.breadcrumbColl(), { Level: 0 });

            if (baseItem.length == 0) {
                var root1Item = _.where(treeOriginalColl, { Level: 0 });
                root1Item[0].selectedInstanceName = '';
                self.breadcrumbColl.push(root1Item[0]);
            }

            //Onclick level 1
            self.breadcrumbColl(jQuery.grep(self.breadcrumbColl(), function (Level, i) {
                return self.breadcrumbColl()[i].Level >= selectedInstance.Level;
            }, true));

            var selectedDropDownId = "#treeCombo" + koUtil.selectedlevelFormFileId + "_" + koUtil.selectedLevel;
            var instanceName = $(selectedDropDownId).find('option:selected').text();
            instanceName = instanceName != '--Select--' ? instanceName : '';
            selectedInstance.selectedInstanceName = isfromCLick ? '' : instanceName;
            self.breadcrumbColl.push(selectedInstance);
        }

        self.moveItemsUP = function () {
            sequenceChanged = true;
            self.isSequenceChanged(true);
            arrayofeditvalue = new Array();
            arrayofeditvalue.push(new Object());
            if (arrayOfInvalidChars.length == 0) {
                $("#btnSaveInstance").prop('disabled', false);
            }
            var selectedRow = $('#jqxgridcontainerparameterdetails').jqxGrid('getselectedrowindex');
            var datarow = $("#jqxgridcontainerparameterdetails").jqxGrid('getrowdata', selectedRow);
            var prevdatarow = $("#jqxgridcontainerparameterdetails").jqxGrid('getrowdata', selectedRow - 1);
            var rowID = $('#jqxgridcontainerparameterdetails').jqxGrid('getrowid', selectedRow);
            var rowID1 = $('#jqxgridcontainerparameterdetails').jqxGrid('getrowid', selectedRow - 1);

            $('#jqxgridcontainerparameterdetails').jqxGrid('updaterow', [rowID, rowID1], [prevdatarow, datarow]);
            $('#jqxgridcontainerparameterdetails').jqxGrid('clearselection');
            $('#jqxgridcontainerparameterdetails').jqxGrid('unselectrow', selectedRow);
            $('#jqxgridcontainerparameterdetails').jqxGrid('selectrow', selectedRow - 1);
            seqControlSelect();
        }
        self.moveItemsDown = function () {
            sequenceChanged = true;
            self.isSequenceChanged(true);
            arrayofeditvalue = new Array();
            arrayofeditvalue.push(new Object());
            if (arrayOfInvalidChars.length == 0) {
                $("#btnSaveInstance").prop('disabled', false);
            }

            var selectedRow = $('#jqxgridcontainerparameterdetails').jqxGrid('getselectedrowindex');
            var datarow = $("#jqxgridcontainerparameterdetails").jqxGrid('getrowdata', selectedRow);
            var nextdatarow = $("#jqxgridcontainerparameterdetails").jqxGrid('getrowdata', selectedRow + 1);
            var rowID = $('#jqxgridcontainerparameterdetails').jqxGrid('getrowid', selectedRow);
            var rowID1 = $('#jqxgridcontainerparameterdetails').jqxGrid('getrowid', selectedRow + 1);

            $('#jqxgridcontainerparameterdetails').jqxGrid('updaterow', [rowID1, rowID], [datarow, nextdatarow]);
            $('#jqxgridcontainerparameterdetails').jqxGrid('clearselection');
            $('#jqxgridcontainerparameterdetails').jqxGrid('unselectrow', selectedRow);
            $('#jqxgridcontainerparameterdetails').jqxGrid('selectrow', selectedRow + 1);
            seqControlSelect();
        }
        function validateIsSelectedExist(instanceID, selectedIndex, instanceName) {
            var sourceData = _.where(previousSelectedCol, {
                instanceID: instanceID
            });
            if (sourceData != '') {
                previousSelectedCol = jQuery.grep(previousSelectedCol, function (value) {
                    var index = previousSelectedCol.indexOf(sourceData[0]);
                    return (value != previousSelectedCol[index] && value != null);
                });
            }
            var selectedObj = new Object();
            selectedObj.instanceID = instanceID;
            selectedObj.selectedIndex = selectedIndex;
            selectedObj.instanceName = instanceName;
            previousSelectedCol.push(selectedObj);
        }

        function clearChildDropDownColl(instance) {
            if (instance.children().length > 0) {
                for (var k = 0; k < instance.children().length; k++) {
                    instance.children()[k].dropdownCol([]);
                    instance.children()[k].parentInstanceId(0);
                    instance.children()[k].parentInstanceName('');
                    if (instance.children()[k].children().length > 0)
                        clearChildDropDownColl(instance.children()[k]);
                }
            }
        }


        function TreeNode(values) {
            var self = this;
            koMapping.fromJS(values, {
                children: {
                    create: createNode
                }
            }, this);
            this.expanded = ko.observable(true);
            this.collapsed = ko.computed(function () {
                return !self.expanded();
            })
        }

        //self.toggle = function(data) {
        //    data.expanded(!data.expanded());
        //}

        function createNode(options) {
            return new TreeNode(options.data);
        }

        function checkerror(editedValue) {
            var retval = '';
            $("#txtValueSpanDevProf").hide();
            $("#txtValueSpanDevProf").empty();

            var checkVal = self.validationOfRegExpression($("#txtValue").val())

            if (checkVal == false) {
                retval += 'invalid item';
                if (editedValue && editedValue.ValueType.String.ErrorOnValidationFailure && editedValue.ValueType.String.ErrorOnValidationFailure != '') {
                    $("#txtValueSpanDevProf").text(editedValue.ValueType.String.ErrorOnValidationFailure).show()
                } else {
                    $("#txtValueSpanDevProf").text(i18n.t('Invalid_Parameter_Values_VPFX', { lng: lang })).show();
                }
            } else {
                retval += '';
                $("#txtValueSpanDevProf").hide();
            }
            return retval;
        }

        self.loadInstanceLevelParameters = function () {
			setTimeout(function () {
				$("#loadingDiv").show();
			}, 500);
            if (koUtil.viewParameterTemplateOnDevice) {
                getApplicationTemplateVPFXFilesById(self.JsonXmlData, self.templateXML, self.treeColl, self.versionFlag, false, 0, self.templateStoredData);
                self.isEditTemplateAllowed(false);
                self.isEditTemplateNotAllowed(true);
                $("#btnSaveInstance").addClass('hide');
            } else {
                setTimeout(function () {
                    buildParameterContainers(self.JsonXmlData, self.templateXML, self.treeColl, self.versionFlag, true);
                }, 500);
                self.isEditTemplateAllowed(true);
                self.isEditTemplateNotAllowed(false);
                $("#btnSaveInstance").removeClass('hide');
            }
			setTimeout(function () {
				$("#loadingDiv").hide();
			}, 500);
        }

        self.focusInMaskValue = function (data) {
			var id = '#templateTxt' + data.ParamId;
			isTabKeyPressed(id);
            if ((data.MaskValue && (data.MaskValue.toUpperCase() == 'TRUE')) || (data.PartialMask && data.PartialMask.toUpperCase() == 'TRUE')) {
                $(id).val(data.ParamValue);
                //$(id).val($(id).val()).prop("type", "text");
            }

        }

        self.focusOutMaskValue = function (data) {
			var id = '#templateTxt' + data.ParamId;
			isTabKeyPressed(id);
            if (data.MaskValue && data.MaskValue.toUpperCase() == 'TRUE') {
                data.ParamValue = $(id).val();
                $(id).val('********');
                //$(id).val($(id).val()).prop("type", "password");
            }
            //Partial masking value based on Length and Direction
            if (data.PartialMask && data.PartialMask.toUpperCase() == 'TRUE') {
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

        self.focusInSlidePanel = function (data) {
            var data = editedValue;
            if ((data.MaskValue && (data.MaskValue.toUpperCase() == 'TRUE')) || (data.PartialMask && data.PartialMask.toUpperCase() == 'TRUE')) {
                var id = '#txtValue';
                $(id).val(data.ParamValue);
            }
        }

        self.focusOutSlidePanel = function () {
            var data = editedValue;
            if (data.MaskValue && data.MaskValue.toUpperCase() == 'TRUE') {
                var id = '#txtValue';
                data.ParamValue = $(id).val();
                $(id).val('********');
            }
            //Partial masking value based on Length and Direction
            if (data.PartialMask && data.PartialMask.toUpperCase() == 'TRUE') {
                var id = '#txtValue';
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

        self.hideEditPramDiv = function () {
            $(".pageMask").hide();
            self.editParams();
            setTimeout(function () {
                $("#mainPageBody").addClass('modal-open');
            }, 500);

        }

        self.checkDDLValue = ko.observable();
        self.checkDDLValue.subscribe(function (data) {
            if (arrayOfInvalidChars.length == 0) {
                $("#btnSaveInstance").prop('disabled', false);
            }
        });

        self.checkTxtValue = function (data) {
            var id = "#templateTxt" + data.ParamId;
			isTabKeyPressed(id);
            var value = $(id).val();
            $(id).removeClass("borderColor-Text");
            if (value == data.ParamValue) {
                updateEditvalue(data);
            } else {
                updateSetValue(data, value);
            }
        }

        self.checkFileValue = function () {
            data = fileData;
            var id = "#templateFile" + data.ParamId;
            var value = $(id).val();
            updateSetValue(data, value);
        }

        self.selectPackageFile = function (popupName, data) {
            if (popupName == "modelPackageFiles") {
                fileData = data;
                koUtil.parameterTypeFileId = '#templateFile' + data.ParamId;
                koUtil.parameterPackageId = data.PackageId;
                if (data.ValueType.File.Type.toUpperCase() == AppConstants.get('PACKAGE_FILE')) {
                    koUtil.isParameterTypeContent(false);
                } if (data.ValueType.File.Type.toUpperCase() == AppConstants.get('CONTENT_FILE')) {
                    koUtil.isParameterTypeContent(true);
                }
                loadelementPackageFiles(popupName, 'device/deviceProfileTemplates');
                $('#filesModel').modal('show');
            }
        }

        $('#mdlDevicePrfEditTempHeader').mouseup(function () {
            $("#mdlDevicePrfEditTemp").draggable({
                disabled: true
            });
        });

        $('#mdlDevicePrfEditTempHeader').mousedown(function () {
            $("#mdlDevicePrfEditTemp").draggable({
                disabled: false
            });
        });

        self.checkDllValue = function (data) {
            if (checkFlagForOnload == 0) {
                var id = "#templateCombo" + data.ParamId;
                var value = $(id).find('option:selected').val();
                if (value == '' || value == data.ParamValue || data.ParamValue == undefined) {
                    updateEditvalue(data);
                } else {
                    var name = $(id).find('option:selected').text();
                    updateSetValue(data, value, name);
                }
            }
        }

        self.checkReferenceEnumValue = function (data) {
            var id = "#templateReferenceCombo" + data.ParamId;
            var value = $(id).find('option:selected').val();
            if (value == '' || value == data.ParamValue || data.ParamValue == undefined) {
                updateEditvalue(data);
            } else {
                var name = $(id).find('option:selected').text();
                updateSetValue(data, value, name);
            }
        }

        self.checkCheckboxValue = function (data) {
            var id = "#templateCheck" + data.ParamId;
            var check = 0;

            if ($(id).is(':checked')) {
                check = 1;
            } else {
                check = 0;
            }

            if (check == data.ParamValue) {
                updateEditvalue(data);
            } else {
                updateSetValue(data, check);
            }
        }
        self.clearDateParameter = function (data) {
            var id = "#templateInputDate" + data.ParamId;
            var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
            if (data.ValueType.DateTime && data.ValueType.DateTime.DateFormat) {
                dateFormat = data.ValueType.DateTime.DateFormat;
            }
            updateDateTimePicker("#templateDate" + data.ParamId, dateFormat, 'today');
            $(id).val('');
            updateSetValue(data, '', '', 'User');
        }
        self.checkDateValue = function (data) {

            var id = "#templateInputDate" + data.ParamId;
            var check = '';
            if ($(id).val() != '') {
                check = $(id).val();
            }
            if (check == data.ParamValue) {
                updateEditvalue(data);
            } else {
                updateSetValue(data, check);
            }
        }

        self.validateNumber = function (data) {
            var maxValueNum = parseInt(data.ValueType.Numeric.MaxVal);
            var minValueNum = parseInt(data.ValueType.Numeric.MinVal);
            var id = "#templateNumeric" + data.ParamId;
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
            if (checkFlagForOnload == 0) {
                if (val == data.ParamValue) {
                    updateEditvalue(data);
                } else {
                    updateSetValue(data, val);
                }
            }
        }

        self.isNumberKey = function () {
            return validateNumberKey(event);
        }
		
        self.templateTxtValue = ko.observable();
        self.templateTxtValue.subscribe(function (newValue) {
            if (self.SourceType() && self.SourceType() == 'User') {
                $("#txtsourceValue").val('User');
            } else if (self.SourceType() && self.SourceType() == 'Template') {
                $("#txtsourceValue").val('User');
            } else {
                if (newValue == self.paramDefaultValue()) {
                    $("#txtsourceValue").val('Default');
                } else {
                    $("#txtsourceValue").val('User');
                }
            }


            if (newValue == self.paramValue()) {
                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {
                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }
        });


        self.validationOfRegExpression = function (newValue) {
            var regExpval = new RegExp(self.regExpression());
            if ((regExpval.test(newValue)) == false) {
                return false;
            } else {
                return true;
            }
        }

        self.validateStringLength = function (value) {
            if (value && value.length < self.textMinLength()) {
                return false;
            } else {
                return true;
            }
        }

        self.loadInstanceLevelParameters();

        function updateEditvalue(data) {
            arrayofeditvalue = jQuery.grep(arrayofeditvalue, function (value) {
                var id = "" + data.ParamId + ""
                return (value != id && value != null);
            });

            var sourceData = _.where(arrayForSetValue, {
                ParamId: data.ParamId
            });

            if (sourceData != '') {
                arrayForSetValue = jQuery.grep(arrayForSetValue, function (value) {
                    var index = arrayForSetValue.indexOf(sourceData[0]);
                    return (value != arrayForSetValue[index] && value != null);
                });
            }
			
            if (data.PrimaryIdentifier == "True") {
                var source = _.where(arrayOfPrimaryIdentifierValue, { ParamId: data.ParamId });
                if (!_.isEmpty(source) && source.length > 0) {
                    source[0].ParamValue = data.ParamValue;
                }
            }

            arrayOfInvalidChars = jQuery.grep(arrayOfInvalidChars, function (value) {
                var index = arrayOfInvalidChars.indexOf(data.ParamId);
                return (value != arrayOfInvalidChars[index] && value != null);
            });

            if (arrayofeditvalue.length <= 0 || arrayOfInvalidChars.length > 0) {
                $("#btnSaveInstance").prop('disabled', true);
            } else if (arrayofeditvalue.length > 0 && arrayOfInvalidChars.length == 0) {
                $("#btnSaveInstance").prop('disabled', false);
            }
        }

        function updateSetValue(data, value, name, sourceType) {

            if ($.inArray(data.ParamId, arrayofeditvalue) < 0) {
                arrayofeditvalue.push(data.ParamId);
            } else {
                var sourceData = _.where(arrayForSetValue, {
                    ParamId: data.ParamId
                });

                if (sourceData != '') {
                    arrayForSetValue = jQuery.grep(arrayForSetValue, function (value) {
                        var index = arrayForSetValue.indexOf(sourceData[0]);
                        return (value != arrayForSetValue[index] && value != null);
                    });
                }
            }

            if (!isSelectedInstanceisMulti && koUtil.selectedLevel > 0) {
                var sourceData = _.where(arrayForSetValue, {
                    ParamId: data.ParamId
                });

                if (sourceData != '') {
                    arrayForSetValue = jQuery.grep(arrayForSetValue, function (value) {
                        var index = arrayForSetValue.indexOf(sourceData[0]);
                        return (value != arrayForSetValue[index] && value != null);
                    });
                }
            }

            var Parameter = new Object();
            Parameter.ParamId = data.ParamId;
            Parameter.ParamValue = data.ValueType.Type == "File" ? data.ParamValue : value;
            Parameter.ParamName = data.Name;
            Parameter.TemplateId = 0;
            Parameter.IsPrimaryIdentifier = (data.PrimaryIdentifier == "True") ? 1 : 0;
            Parameter.PISequence = data.Sequence ? data.Sequence : 0;
            if (data.SourceType && data.SourceType == 'User') {
                Parameter.SourceType = 'User';
            } else if (data.SourceType && data.SourceType == 'Template') {
                Parameter.SourceType = 'User';
            } else {
                if (Parameter.ParamValue == data.Default) {
                    Parameter.SourceType = 'User';
                } else if (sourceType) {
                    Parameter.SourceType = sourceType;
                } else {
                    Parameter.SourceType = 'User';
                }
            }
            Parameter.ParamType = data.ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
            Parameter.PackageId = data.ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
            Parameter.IncludeInMP = data.IncludeInMP == "True" ? 1 : 0;
            Parameter.ValueType = data.ValueType.Type;

            if (data.ValueType.Type == "String") {
                Parameter.ValidChars = data.ValueType.String.ValidChars;
                Parameter.MinLen = data.ValueType.String.MinLen;
                var id = "#templateTxt" + data.ParamId;
                if (data.ValueType.String.ValidChars && data.ValueType.String.ValidChars != '') {
                    self.regExpression(data.ValueType.String.ValidChars)
                    var checkVal = self.validationOfRegExpression($(id).val());
                    if (checkVal == false) {
                        if ($.inArray(data.ParamId, arrayOfInvalidChars) < 0) {
                            arrayOfInvalidChars.push(data.ParamId);
                        }
                        $(id).addClass("borderColor-Text");
                        $("#btnSaveInstance").prop('disabled', true);
                        return;
                    } else {
                        arrayOfInvalidChars = jQuery.grep(arrayOfInvalidChars, function (value) {
                            var index = arrayOfInvalidChars.indexOf(data.ParamId);
                            return (value != arrayOfInvalidChars[index] && value != null);
                        });
                        if (data.ValueType.String.MinLen && data.ValueType.String.MinLen != '') {
                            self.textMinLength(data.ValueType.String.MinLen);
                            var checkTextLength = self.validateStringLength($(id).val());
                            if (checkTextLength == false) {
                                $(id).addClass("borderColor-Text");
                                $("#btnSaveInstance").prop('disabled', true);
                                return;
                            } else {
                                $(id).removeClass("borderColor-Text");
                                $("#btnSaveInstance").prop('disabled', true);
                            }
                        } else {
                            $(id).removeClass("borderColor-Text");
                            $("#btnSaveInstance").prop('disabled', true);
                        }
                    }
                } else {
                    if (data.ValueType.String.MinLen && data.ValueType.String.MinLen != '') {
                        self.textMinLength(data.ValueType.String.MinLen);
                        var checkTextLength = self.validateStringLength($(id).val());
                        if (checkTextLength == false) {
                            $(id).addClass("borderColor-Text");
                            $("#btnSaveInstance").prop('disabled', true);
                            return;
                        } else {
                            $(id).removeClass("borderColor-Text");
                            $("#btnSaveInstance").prop('disabled', true);
                        }
                    } else {
                        $(id).removeClass("borderColor-Text");
                        $("#btnSaveInstance").prop('disabled', true);
                    }
                }
            } else if (data.ValueType.Type == "File") {
                //var fileIdSource = _.where(arrayOfPrimaryIdentifierValue, { ParamName: "File Id" });
                //var PIfileIdSource = _.where(arrayForSetValue, { ParamName: "File Id" });

                //if (!_.isEmpty(fileIdSource)) {
                //	if (!_.isEmpty(PIfileIdSource)) {
                //		arrayForSetValue = jQuery.grep(arrayForSetValue, function (value) {
                //			var index = arrayForSetValue.indexOf(PIfileIdSource[0]);
                //			return (value != arrayForSetValue[index] && value != null);
                //		});
                //	}

                //	var paramFileId = new Object();
                //	paramFileId.ParamId = fileIdSource[0].ParamId;
                //	paramFileId.ParamName = fileIdSource[0].ParamName;
                //	paramFileId.ParamValue = fileIdSource[0].ParamValue;
                //	paramFileId.TemplateId = 0;
                //	paramFileId.IsPrimaryIdentifier = 1;
                //	paramFileId.PISequence = fileIdSource[0].PISequence ? fileIdSource[0].PISequence : 0;
                //	paramFileId.SourceType = 'User';
                //	paramFileId.ParamType = ENUM.get('FILE_ID');
                //	paramFileId.PackageId = 0;
                //  paramFileId.IncludeInMP = fileIdSource[0].IncludeInMP == "True" ? 1 : 0;
                //  paramFileId.ValueType = fileIdSource[0].ValueType.Type;
                //	arrayForSetValue.push(paramFileId);
                //}
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
                if (data.ValueType.Type == "Enumeration" || data.ValueType.Type == "ReferenceEnumeration") {
                    var PIParameter = new Object();
                    PIParameter.ParamId = data.ParamId;
                    PIParameter.ParamName = data.Name;
                    PIParameter.ParamValue = _.isEmpty(name) ? value : name;
                    PIParameter.TemplateId = 0;
                    PIParameter.SourceType = 'User';
                    PIParameter.IsPrimaryIdentifier = (data.PrimaryIdentifier == "True") ? 1 : 0;
                    PIParameter.PISequence = data.Sequence ? data.Sequence : 0;
                    PIParameter.ParamType = ENUM.get('DEFAULT');
                    PIParameter.PackageId = 0;
                    PIParameter.IncludeInMP = data.IncludeInMP == "True" ? 1 : 0;
                    PIParameter.ValueType = data.ValueType.Type;
                    arrayOfPrimaryIdentifierValue.push(PIParameter);
                } else {
                    arrayOfPrimaryIdentifierValue.push(Parameter);
                }
            }

            if (arrayofeditvalue.length > 0 && arrayOfInvalidChars.length == 0) {
                $("#btnSaveInstance").prop('disabled', false);
            } else {
                $("#btnSaveInstance").prop('disabled', true);
            }
        }

        $("#txtnumericValue").on('keyup', function () {
            var newValue = parseInt($(this).val());
            if (self.SourceType() && self.SourceType() == 'User') {
                $("#txtsourceValue").val('User');
            } else if (self.SourceType() && self.SourceType() == 'Template') {
                $("#txtsourceValue").val('User');
            } else {
                if (newValue == self.paramDefaultValue()) {
                    $("#txtsourceValue").val('Default');
                } else {
                    $("#txtsourceValue").val('User');
                }
            }

            if (newValue == '' || newValue == self.paramValue()) {
                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {
                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }
            if (newValue > self.maxValue()) {
                $("#txtnumericValue").val(self.maxValue());
            } else if (newValue < self.minValue()) {
                $("#txtnumericValue").val(self.minValue());
            } else {
                $("#txtnumericValue").val(newValue);
            }
            self.enableDisableSaveBtnOnEditPopUp(newValue);
        })

        self.templateCheckValue = function () {


            var id = "#checkBoxValue";//"#templateCheck" + self.paramId();

            var check = 0;
            if ($(id).is(':checked')) {

                check = 1;

            } else {
                check = 0;

            }

            if (self.SourceType() && self.SourceType() == 'User') {
                $("#txtsourceValue").val('User');
            } else if (self.SourceType() && self.SourceType() == 'Template') {
                $("#txtsourceValue").val('User');
            } else {
                if ($(id).val() == self.paramDefaultValue()) {
                    $("#txtsourceValue").val('Default');
                } else {
                    $("#txtsourceValue").val('User');
                }
            }

            if (check == self.paramValue()) {
                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {
                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }
        };

        self.templateNumericValue = ko.observable();

        self.templateNumericValue.subscribe(function (newValue) {

            var id = "#templateNumeric" + self.paramId();
            $(id).val(newValue);
            savecheck = 0;
            $("#btnSaveSelectedPvalue").prop('disabled', false);
        });

        self.selectedEnumPValue = ko.observable();

        self.selectedEnumPValue.subscribe(function (newValue) {

            //alert(JSON.stringify(data));

            var defaultv = self.paramDefaultValue();
            //alert(defaultv);
            if (self.SourceType() && self.SourceType() == 'User') {
                $("#txtsourceValue").val('User');
            } else if (self.SourceType() && self.SourceType() == 'Template') {
                $("#txtsourceValue").val('User');
            } else {
                if ($("#ddlValue").val() == self.paramDefaultValue()) {
                    $("#txtsourceValue").val('Default');
                } else {
                    $("#txtsourceValue").val('User');
                }
            }

            if ($("#ddlValue").val() == self.paramValue() || $("#ddlValue").val() == '--Select--') {

                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {
                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }
        });


        self.checkEditDllValue = function () {

            var defaultv = self.paramDefaultValue();
            if (self.SourceType() && self.SourceType() == 'User') {
                $("#txtsourceValue").val('User');
            } else if (self.SourceType() && self.SourceType() == 'Template') {
                $("#txtsourceValue").val('User');
            } else {
                if ($("#ddlValue").val() == self.paramDefaultValue()) {
                    $("#txtsourceValue").val('Default');
                } else {
                    $("#txtsourceValue").val('User');
                }
            }

            if ($("#ddlValue").val() == self.paramValue() || $("#ddlValue").val() == '--Select--') {

                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {

                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }

        }

        ///numeric steper
        self.upNumber = function (data) {
            if (data.AllowModify) {
                var id = '#templateNumeric' + data.ParamId;
                if ($(id).val() == '') {
                    var number = 0;
                } else {
                    var number = parseInt($(id).val());
                }
                if (number < data.ValueType.Numeric.MaxVal) {
                    number = number + 1;
                }
                $(id).val(number);

                if ($(id).val() == '' || $(id).val() == data.ParamValue) {
                    updateEditvalue(data);
                } else {
                    var value = $(id).val();
                    updateSetValue(data, value);
                }
            }
        }

        self.downNumber = function (data) {
            if (data.AllowModify) {
                var id = '#templateNumeric' + data.ParamId;
                if ($(id).val() == '') {
                    var number = 0;
                } else {
                    var number = parseInt($(id).val());
                }

                if (number > data.ValueType.Numeric.MinVal) {
                    number = number - 1;
                }

                $(id).val(number);

                if ($(id).val() == '' || $(id).val() == data.ParamValue) {
                    updateEditvalue(data);
                } else {
                    var value = $(id).val();
                    updateSetValue(data, value);
                }
            }

        }

        self.upNumberPval = function (data) {

            var id = '#txtnumericValue';

            if ($(id).val() == '') {
                var number = 0;
            } else {

                var number = parseInt($(id).val());

            }
            if (number < self.maxValue()) {
                number = number + 1;
            }

            $(id).val(number);

            //self.templateNumericValue(number)
            self.enableDisableSaveBtnOnEditPopUp($(id).val());
        }

        self.downNumberPval = function (data) {

            var id = '#txtnumericValue';
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
            //self.templateNumericValue(number);
            self.enableDisableSaveBtnOnEditPopUp($(id).val());
        }
        ///

        self.enableDisableSaveBtnOnEditPopUp = function (newValue) {
            if (self.SourceType() && self.SourceType() == 'User') {
                $("#txtsourceValue").val('User');
            } else if (self.SourceType() && self.SourceType() == 'Template') {
                $("#txtsourceValue").val('User');
            } else {
                if (newValue == self.paramDefaultValue()) {
                    $("#txtsourceValue").val('Default');
                } else {
                    $("#txtsourceValue").val('User');
                }
            }


            if (newValue == '' || newValue == self.paramValue()) {
                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {
                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }
        }

        var IsPrimaryIdentifier = 0;
        var editedValue;
        self.editValue = function (data) {
            editedValue = data;
            $("#txtValueSpanDevProf").hide();
            $("#txtValueSpanDevProf").empty();
            //if (VHQFlag === true) {
                self.editAccessValue(data.Access);
            //} else {
            //    self.editAccessValue(false);
            //}
            $("#btnSaveSelectedPvalue").prop('disabled', true);
            savecheck = 0;
            self.paramId(data.ParamId);

            if ($.inArray(data.ParamId, arrayofeditvalue) < 0) {
                self.SourceType(data.SourceType);
            } else {
                self.SourceType('User');
            }

            //self.SourceType(data.SourceType)
            self.SourceId(data.SourceId);
            self.SourceTempId(data.SourceId);
            self.paramValueType(data.ValueType.Type);
            self.paramValue(data.ParamValue);

            IsPrimaryIdentifier = (data.PrimaryIdentifier != undefined && data.PrimaryIdentifier == "True") ? 1 : 0;
            self.paramDefaultValue(data.Default);


            $("#editParamValueHeader").text(i18n.t('edit_param_popup_lbl', {
                lng: lang
            }) + ' ' + data.DisplayName);

            if (data.ValueType.Type == 'String') {
                self.controlType('String');
                var id = "#templateTxt" + data.ParamId;
                var value = $(id).val();
                $("#txtValue").val(value);
                if ((data.MaskValue && data.MaskValue.toUpperCase() == 'TRUE') || (data.PartialMask && data.PartialMask.toUpperCase() == 'TRUE')) {
                    value = data.ParamValue;
                }

                if (data.ValueType.String.MinLen) {
                    $("#txtValue").prop('minlength', data.ValueType.String.MinLen);
                }
                if (data.ValueType.String.MaxLen) {
                    $("#txtValue").prop('maxlength', data.ValueType.String.MaxLen);
                }

                $("#txtDiv").show();
                $("#numericDiv").hide();
                $("#ddlDiv").hide();
                $("#validationDiv").show();
                $("#CheckboxDiv").hide();
                $("#DateDiv").hide();
                //self.templateTxtValue(data.ParamValue);
                if ($("#txtValue").val() == '' || $("#txtValue").val() == data.ParamValue) {

                    $("#btnSaveSelectedPvalue").prop('disabled', true);
                } else {

                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }

                $("#txtvalidationValue").val(data.ValueType.String.ValidChars);
                $("#txtDefaultValue").val(data.Default);


                self.regExpression(data.ValueType.String.ValidChars);

            } else if (data.ValueType.Type == 'Numeric') {
                self.maxValue(data.ValueType.Numeric.MaxVal);
                self.minValue(data.ValueType.Numeric.MinVal);

                self.controlType('Numeric');
                var id = "#templateNumeric" + self.paramId();
                var value = $(id).val();
                $("#txtnumericValue").val(value);
                //    self.templateTxtValueNum(value) ;
                // self.templateTxtValueNum( $("#txtnumericValue").val())
                //   //alert(JSON.stringify(self.templateTxtValueNum()));
                $("#txtDiv").hide();
                $("#numericDiv").show();
                $("#ddlDiv").hide();
                $("#validationDiv").hide();
                $("#CheckboxDiv").hide();
                $("#DateDiv").hide();

                if ($("#txtnumericValue").val() == '' || $("#txtnumericValue").val() == data.ParamValue) {

                    $("#btnSaveSelectedPvalue").prop('disabled', true);
                } else {

                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }
                $("#txtDefaultValue").val(data.Default);

            } else if (data.ValueType.Type == 'Enumeration') {
                self.controlType('Enumeration');
                self.paramDllData(data.ValueType.Enumeration.EnumItem);
                var id = "#templateCombo" + self.paramId();
                var value = $(id).val();

                $("#ddlValue").val(value).prop("selected", "selected");
                $("#ddlValue").trigger('chosen:updated');

                $("#txtDiv").hide();
                $("#numericDiv").hide();
                $("#ddlDiv").show();
                $("#validationDiv").hide();
                $("#CheckboxDiv").hide();
                $("#DateDiv").hide();

                if ($("#ddlValue").val() == null || $("#ddlValue").val() == '' || $("#ddlValue").val() == data.ParamValue) {

                    $("#btnSaveSelectedPvalue").prop('disabled', true);
                } else {

                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }

                var enumSource = _.where(data.ValueType.Enumeration.EnumItem, {
                    Value: data.Default
                })
                if (enumSource.length > 0) {
                    $("#txtDefaultValue").val(enumSource[0].Name);
                } else {
                    $("#txtDefaultValue").val(data.Default);
                }
                //self.paramDefaultValue(data.Default);

            } else if (data.ValueType.Type == 'ReferenceEnumeration') {
                self.controlType('ReferenceEnumeration');
                self.paramDllData(data.ValueType.ReferenceEnumeration.ReferenceEnumItem);
                var id = "#templateReferenceCombo" + self.paramId();
                var value = $(id).val();

                $("#ddlValue").val(value).prop("selected", "selected");
                $("#ddlValue").trigger('chosen:updated');

                $("#txtDiv").hide();
                $("#numericDiv").hide();
                $("#ddlDiv").show();
                $("#validationDiv").hide();
                $("#CheckboxDiv").hide();
                $("#DateDiv").hide();

                if ($("#ddlValue").val() == null || $("#ddlValue").val() == '' || $("#ddlValue").val() == data.ParamValue) {

                    $("#btnSaveSelectedPvalue").prop('disabled', true);
                } else {

                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }

                var referenceEnumSource = _.where(data.ValueType.ReferenceEnumeration.ReferenceEnumItem, {
                    Value: data.Default
                })
                if (referenceEnumSource.length > 0) {
                    $("#txtDefaultValue").val(referenceEnumSource[0].Name);
                } else {
                    $("#txtDefaultValue").val(data.Default);
                }
                //self.paramDefaultValue(data.Default);

            } else if (data.ValueType.Type == 'DateTime') {
                self.controlType('DateTime');
                var id = "#templateInputDate" + self.paramId();
                var value = $(id).val();
                var date = '';
                if (value != '') {
                    date = value;
                }
                var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
                if (data.ValueType.DateTime && data.ValueType.DateTime.DateFormat) {
                    dateFormat = data.ValueType.DateTime.DateFormat;
                }
                updateDateTimePicker("#txtDateValue", dateFormat, date);
                $(id).val(value);
                $("#txtDiv").hide();
                $("#numericDiv").hide();
                $("#ddlDiv").hide();
                $("#validationDiv").hide();
                $("#CheckboxDiv").hide();
                $("#DateDiv").show();

                if ($("#templateInputDate").val() == '' || date == data.ParamValue) {

                    $("#btnSaveSelectedPvalue").prop('disabled', true);
                } else {

                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }


                $("#txtDefaultValue").val(data.Default);
                self.paramFormat(dateFormat);
            } else if (data.ValueType.Type == 'Boolean' || data.ValueType.Type == 'CheckBox') {

                $("#editCheckboxlabel").text(data.DisplayName);
                self.controlType('Boolean');
                var id = "#templateCheck" + self.paramId();

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
                if ($("#checkBoxValue").is(':checked')) {
                    check1 = 1;
                } else {
                    check1 = 0;
                }

                $("#txtDiv").hide();
                $("#numericDiv").hide();
                $("#ddlDiv").hide();
                $("#validationDiv").hide();
                $("#CheckboxDiv").show();
                $("#DateDiv").hide();

                if (check1 == data.ParamValue) {
                    $("#btnSaveSelectedPvalue").prop('disabled', true);

                } else {
                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }

                $("#txtDefaultValue").val(data.Default);

            } else {
                self.controlType('String');
                var id = "#templateTxt" + data.ParamId;
                var value = $(id).val();
                $("#txtValue").val(value);

                $("#txtDiv").show();
                $("#numericDiv").hide();
                $("#ddlDiv").hide();
                $("#validationDiv").show();
                $("#CheckboxDiv").hide();
                $("#DateDiv").hide();
                //self.templateTxtValue(data.ParamValue);
                if ($("#txtValue").val() == '' || $("#txtValue").val() == data.ParamValue) {

                    $("#btnSaveSelectedPvalue").prop('disabled', true);
                } else {

                    $("#btnSaveSelectedPvalue").prop('disabled', false);
                }

                //$("#txtvalidationValue").text(data.ValueType.String.ValidChars);
                $("#txtDefaultValue").val(data.Default);


                //self.regExpression(data.ValueType.String.ValidChars);
            }

            //$("#txtDefaultValue").val(data.Default);
            if (self.SourceType() == undefined) {
                $("#txtsourceValue").parent().hide();
                $('#btnRestTempValue').hide();
            }
            else {
                $("#txtsourceValue").parent().show();
                $('#btnRestTempValue').show();
                $("#txtsourceValue").val(self.SourceType());
            }
            $("#txtDescriptionValue").val(data.Description);

            if (IsPrimaryIdentifier == 1) {
                $('#btnRestDefault').hide();
                $('#btnRestTempValue').hide();
            } else {
                $('#btnRestDefault').show();
                $('#btnRestTempValue').show();
            }

            self.editParams();
            //$("#editParamValue").modal("show");
        }

        self.editParams = function () {
            var modalHeight = $('#editInstanceBody')[0].clientHeight;
            $('#slidePanel').height(modalHeight - 60);
            if ($('#slidePanel').hasClass('show')) {
                $("#slidePanel").animate({
                    width: "-=400"
                }, 700, function () {
                    // Animation complete.
                });
                $('#slidePanel').removeClass('show').addClass('hide');
                $('.pageMask').hide();
            }
            else {
                $('.pageMask').show();
                $("#slidePanel").animate({
                    width: "+=400"
                }, 700, function () {
                    // Animation complete.
                });
                $('#slidePanel').removeClass('hide').addClass('show');
            }
        }

        self.clearParamValue = function (data) {
            var value = "";
            if (data.ValueType.Type == 'String') {
                var id = '#templateTxt' + data.ParamId;
                $(id).val(value);
            } else if (data.ValueType.Type == 'Enumeration') {
                var id = '#templateCombo' + data.ParamId;
                $(id).val(value).prop("selected", "selected");
                $(id).trigger('chosen:updated');
            } else if (data.ValueType.Type == 'ReferenceEnumeration') {
                var id = '#templateReferenceCombo' + data.ParamId;
                $(id).val(value).prop("selected", "selected");
                $(id).trigger('chosen:updated');
            } else if (data.ValueType.Type == 'Numeric') {
                var id = '#templateNumeric' + data.ParamId;
                $(id).val(value);
            } else if (data.ValueType.Type == 'DateTime') {
                var id = '#templateInputDate' + data.ParamId;
                $(id).val(value);
            } else if (data.ValueType.Type == 'Boolean' || data.ValueType.Type == 'CheckBox') {
                var id = '#templateCheck' + data.ParamId;
                value = 0;
                $(id).val(value);
                if (value == 1) {
                    $(id).prop("checked", true);
                } else {
                    $(id).prop("checked", false);
                }
            }
            data.IsClear = true;
            if (data.ParamValue == undefined || $(id).val() == data.ParamValue) {
                $(id).removeClass("borderColor-Text");
                updateEditvalue(data);
            } else {
                updateSetValue(data, value);
            }
        }

        self.SetDeviceParameterValue = function () {

            var paramID = self.paramId();
            var paramValue = '';
            var name = '';
            if (self.controlType() == 'String') {
                var id = '#templateTxt' + paramID;
                paramValue = $("#txtValue").val();
                var retval = checkerror(editedValue);
                if (retval == null || retval == '') {
                    $(id).val($("#txtValue").val());
                } else {
                    return;
                }

            } else if (self.controlType() == 'Numeric') {
                var id = '#templateNumeric' + paramID;
                paramValue = parseInt($("#txtnumericValue").val());
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
                paramValue = $("#ddlValue").val();
                var id = '#templateCombo' + paramID;
                $(id).val(paramValue).prop("selected", "selected");
                $(id).trigger('chosen:updated');
                name = $(id).find('option:selected').text();
                //self.SourceType($("#txtsourceValue").val());
            }
            else if (self.controlType() == 'DateTime') {

                paramValue = $("#txtDateInputValue").val();
                var id = '#templateDate' + paramID;
                dateFormat = self.paramFormat();
                if (paramValue == '') {
                    updateDateTimePicker(id, dateFormat, 'today');
                } else {
                    updateDateTimePicker(id, dateFormat, paramValue);
                }
                $('#templateInputDate' + paramID).val(paramValue);

            }
            else if (self.controlType() == 'Boolean' || self.controlType() == 'CheckBox') {
                var id = '#templateCheck' + paramID;
                if ($("#checkBoxValue").is(':checked')) {
                    $(id).prop("checked", true);
                    paramValue = 1;
                } else {
                    $(id).prop("checked", false);
                    paramValue = 0;
                }
            }
            if ($("#txtsourceValue").val() && $("#txtsourceValue").val() != '') {
                self.SourceType($("#txtsourceValue").val());
            }
            $(".pageMask").hide();
            self.editParams();

            if (paramValue == editedValue.ParamValue) {

                updateEditvalue(editedValue);
            } else {

                if (name == '') {
                    updateSetValue(editedValue, paramValue, '', self.SourceType());
                } else {
                    updateSetValue(editedValue, paramValue, name, self.SourceType());
                }
            }
        }


        self.GetParameterValuesFromTemplate = function () {
            var getParameterValuesFromTemplateReq = new Object();


            getParameterValuesFromTemplateReq.ParamId = self.paramId();
            getParameterValuesFromTemplateReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        if (data && data.getParameterValuesFromTemplateResp) {
                            data.getParameterValuesFromTemplateResp = $.parseJSON(data.getParameterValuesFromTemplateResp);
                        }

                        if (data.getParameterValuesFromTemplateResp.ParameterTemplateValues == null) {
                            savecheck = 1;
                            openAlertpopup(1, 'pvalu_dose_not_exist');
                        } else {
                            savecheck = 1;
                            var paramValue = data.getParameterValuesFromTemplateResp.ParameterTemplateValues[0].ParamValue;
                            self.paramValue(paramValue);
                            $("#txtsourceValue").val(data.getParameterValuesFromTemplateResp.ParameterTemplateValues[0].SourceType);
                            self.SourceTempId(data.getParameterValuesFromTemplateResp.ParameterTemplateValues[0].SourceId);
                            self.SourceType(data.getParameterValuesFromTemplateResp.ParameterTemplateValues[0].SourceType);
                            $("#btnSaveSelectedPvalue").prop('disabled', false);
                            if (self.controlType() == 'String') {
                                $("#txtValue").val(paramValue);
                            } else if (self.controlType() == 'Numeric') {
                                $("#txtnumericValue").val(paramValue);
                            } else if (self.controlType() == 'Enumeration') {
                                $("#ddlValue").val(paramValue).prop("selected", "selected");
                                $("#ddlValue").trigger('chosen:updated');
                            } else if (self.controlType() == 'DateTime') {
                                if (paramValue != '') {
                                    var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
                                    updateDateTimePicker('#txtDateValue', dateFormat, paramValue);
                                }
                                $("#txtDateInputValue").val(paramValue);
                            } else if (self.controlType() == 'Boolean') {

                                if (paramValue == 1) {
                                    $("#checkBoxValue").prop("checked", true);
                                } else {
                                    $("#checkBoxValue").prop("checked", false);
                                }
                            }

                        }
                    }
                }
            }

            var method = 'GetParameterValuesFromTemplate';
            var params = '{"token":"' + TOKEN() + '","getParameterValuesFromTemplateReq":' + JSON.stringify(getParameterValuesFromTemplateReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        self.SetDefaultParameterValue = function () {

            if (self.controlType() == 'String') {
                $("#txtValue").val(self.paramDefaultValue());
            } else if (self.controlType() == 'Numeric') {
                $("#txtnumericValue").val(self.paramDefaultValue());
            } else if (self.controlType() == 'Enumeration') {
                $("#ddlValue").val(self.paramDefaultValue()).prop("selected", "selected");
                $("#ddlValue").trigger('chosen:updated');
            } else if (self.controlType() == 'DateTime') {
                var date = '';
                if (self.paramDefaultValue() != '') {
                    date = self.paramDefaultValue();
                    dateFormat = self.dateFormat();
                    updateDateTimePicker("#txtDateValue", dateFormat, date);
                }
                $("#txtDateInputValue").val(date);
            } else if (self.controlType() == 'Boolean') {

                if (self.paramDefaultValue() == 1) {
                    $("#checkBoxValue").prop("checked", true);
                } else {
                    $("#checkBoxValue").prop("checked", false);
                }
            }
            if (self.SourceType() && self.SourceType() == 'User') {
                $("#txtsourceValue").val('User');
            } else if (self.SourceType() && self.SourceType() == 'Template') {
                $("#txtsourceValue").val('User');
            } else {
                $("#txtsourceValue").val('Default');
            }
            if (self.paramValue() == self.paramDefaultValue()) {
                $("#btnSaveSelectedPvalue").prop('disabled', true);
            } else {
                $("#btnSaveSelectedPvalue").prop('disabled', false);
            }
        }

        self.SetDeviceParameters = function (unloadAddTemplatepopup) {
            var fileTypeParametersCount = 0;
            var isUpdateFileId = false;
            var sourceCustomParameter = _.where(arrayForSetValue, { IncludeInMP: 1 });
            if (!_.isEmpty(sourceCustomParameter)) {
                if (tabContainer && tabContainer.length > 0) {
                    for (var i = 0; i < tabContainer.length; i++) {
                        for (var j = 0; j < tabContainer[i].Container.length; j++) {
                            if (koUtil.selectedLevel == 0) {
                                if (tabContainer[i].Container[j].Type == 'GENERAL') {
                                    for (var k = 0; k < tabContainer[i].Container.length; k++) {
                                        var params = tabContainer[i].Container[j].Param;
                                        for (var n = 0; n < params.length; n++) {
                                            if (params[n].ValueType.Type == "File") {
                                                fileTypeParametersCount = fileTypeParametersCount + 1;
                                            }
                                        }
                                    }
                                }
                            } else {
                                if (tabContainer[i].Container[j].Type == 'Details') {
                                    for (var k = 0; k < tabContainer[i].Container[j].Container.length; k++) {
                                        for (var m = 0; m < tabContainer[i].Container[j].Container[k].length; m++) {
                                            var params = tabContainer[i].Container[j].Container[k][0].Param;
                                            for (var n = 0; n < params.length; n++) {
                                                if (params[n].ValueType.Type == "File") {
                                                    fileTypeParametersCount = fileTypeParametersCount + 1;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if (!_.isEmpty(arrayForSetValue)) {
                    for (var i = 0; i < arrayForSetValue.length; i++) {
                        if (arrayForSetValue[i].ValueType === "File") {
                            fileTypeParametersCount = fileTypeParametersCount + 1;
                        }
                    }
                }
            }

            if (koUtil.parameterPackageId > 0 || !_.isEmpty(sourceCustomParameter)) {
                isUpdateFileId = true;
            }

            if (isUpdateFileId) {
                getFileId(unloadAddTemplatepopup, fileTypeParametersCount, sourceCustomParameter);
            } else {
                SetDeviceParametersDeviceProfile(unloadAddTemplatepopup);
            }
        }

        //get auto generated File Id
        var fileIdCall = 0;
        var fileIds = new Array();
        function getFileId(unloadAddTemplatepopup, fileTypeParametersCount, customParameter) {

            function callbackFunction(data, Error) {
                fileIdCall = fileIdCall + 1;
                if (data) {
                    isFileIdModified = true;
                    var fileId = data.FileId;
                    fileIds.push(fileId);
                    var isFileParameterExists = false;
                    if (fileTypeParametersCount > 1 && fileTypeParametersCount > fileIdCall) {
                        getFileId(unloadAddTemplatepopup, fileTypeParametersCount, customParameter);
                        return;
                    }

                    $("#loadingDiv").hide();
                    fileIdCall = 0;
                    if (tabContainer && tabContainer.length > 0) {
                        var fileIdCount = -1;
                        for (var i = 0; i < tabContainer.length; i++) {
                            for (var j = 0; j < tabContainer[i].Container.length; j++) {
                                if (koUtil.selectedLevel == 0 && !isFileParameterExists) {
                                    if (tabContainer[i].Container[j].Type == 'GENERAL') {
                                        for (var k = 0; k < tabContainer[i].Container.length; k++) {
                                            var params = tabContainer[i].Container[j].Param;
                                            for (var n = 0; n < params.length; n++) {
                                                if (params[n].ValueType.Type == "File") {
                                                    isFileParameterExists = true;
                                                    var source = _.where(arrayForSetValue, { ParamId: params[n].ParamId });
                                                    var sourcePId = _.where(arrayOfPrimaryIdentifierValue, { ParamId: params[n].ParamId });
                                                    if (!_.isEmpty(source) && source.length > 0) {
                                                        fileIdCount = fileIdCount + 1;
                                                        params[n].PackageId = source[0].PackageId;
                                                        var parameter = generateParameterObject(params[n], fileIds[fileIdCount]);
                                                        var index = arrayForSetValue.indexOf(source[0]);
                                                        arrayForSetValue[index] = parameter;
                                                    } else if (!_.isEmpty(customParameter)) {
                                                        fileIdCount = fileIdCount + 1;
                                                        var fileParameter = generateParameterObject(params[n], fileIds[fileIdCount]);
                                                        var fileParameterIndex = arrayForSetValue.indexOf(params[n]);
                                                        if (fileParameterIndex > -1) {
                                                            arrayForSetValue[fileParameterIndex] = fileParameter;
                                                        } else {
                                                            arrayForSetValue.push(fileParameter);
                                                        }
                                                    }

                                                    if (!_.isEmpty(sourcePId) && sourcePId.length > 0) {
                                                        var pidParameter = generateParameterObject(params[n], fileIds[fileIdCount]);
                                                        var pidIndex = arrayOfPrimaryIdentifierValue.indexOf(sourcePId[0]);
                                                        arrayOfPrimaryIdentifierValue[pidIndex] = pidParameter;
                                                    }
                                                    if (fileIdCount == fileIds.length - 1) {
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (tabContainer[i].Container[j].Type == 'Details') {
                                        for (var k = 0; k < tabContainer[i].Container[j].Container.length; k++) {
                                            for (var m = 0; m < tabContainer[i].Container[j].Container[k].length; m++) {
                                                if (tabContainer[i].Container[j].Container[k][m].Container && tabContainer[i].Container[j].Container[k][m].Container.length > 0) {
                                                    for (var p = 0; p < tabContainer[i].Container[j].Container[k][m].Container.length; p++) {
                                                        var params = tabContainer[i].Container[j].Container[k][m].Container[p][0].Param;
                                                        if (!_.isEmpty(params) && params.length > 0) {
                                                            for (var q = 0; q < params.length; q++) {
                                                                if (params[q].ValueType.Type == "File") {
                                                                    if (arrayOfPrimaryIdentifierValue && arrayOfPrimaryIdentifierValue.length > 0) {
                                                                        var parameter = _.where(arrayOfPrimaryIdentifierValue, { ParamId: params[q].ParamId });
                                                                        if (!_.isEmpty(parameter) && parameter.length > 0) {
                                                                            if (parameter[0].ParamId == params[q].ParamId) {
                                                                                params[q].ParamValue = parameter[0].ParamValue;
                                                                            }
                                                                        }
                                                                    }
                                                                    var source = _.where(arrayForSetValue, { ParamId: params[q].ParamId });
                                                                    var sourcePId = _.where(arrayOfPrimaryIdentifierValue, { ParamId: params[q].ParamId });
                                                                    if (!_.isEmpty(source) && source.length > 0) {
                                                                        fileIdCount = fileIdCount + 1;
                                                                        params[q].PackageId = source[0].PackageId;
                                                                        var parameter = generateParameterObject(params[q], fileIds[fileIdCount]);
                                                                        var index = arrayForSetValue.indexOf(source[0]);
                                                                        arrayForSetValue[index] = parameter;
                                                                    } else if (!_.isEmpty(customParameter)) {
                                                                        fileIdCount = fileIdCount + 1;
                                                                        var fileParameter = generateParameterObject(params[q], fileIds[fileIdCount]);
                                                                        var fileParameterIndex = arrayForSetValue.indexOf(params[q]);
                                                                        if (fileParameterIndex > -1) {
                                                                            arrayForSetValue[fileParameterIndex] = fileParameter;
                                                                        } else {
                                                                            arrayForSetValue.push(fileParameter);
                                                                        }
                                                                    }

                                                                    if (!_.isEmpty(sourcePId) && sourcePId.length > 0) {
                                                                        var pidParameter = generateParameterObject(params[q], fileIds[fileIdCount]);
                                                                        var pidIndex = arrayOfPrimaryIdentifierValue.indexOf(sourcePId[0]);
                                                                        arrayOfPrimaryIdentifierValue[pidIndex] = pidParameter;
                                                                    }
                                                                    if (fileIdCount == fileIds.length - 1) {
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }

                                                var params = tabContainer[i].Container[j].Container[k][0].Param;
                                                if (!_.isEmpty(params) && params.length > 0) {
                                                    for (var n = 0; n < params.length; n++) {
                                                        if (params[n].ValueType.Type == "File") {
                                                            var source = _.where(arrayForSetValue, { ParamId: params[n].ParamId });
                                                            var sourcePId = _.where(arrayOfPrimaryIdentifierValue, { ParamId: params[n].ParamId });
                                                            if (!_.isEmpty(source) && source.length > 0) {
                                                                fileIdCount = fileIdCount + 1;
                                                                params[n].PackageId = source[0].PackageId;
                                                                var parameter = generateParameterObject(params[n], fileIds[fileIdCount]);
                                                                var index = arrayForSetValue.indexOf(source[0]);
                                                                arrayForSetValue[index] = parameter;
                                                            } else if (!_.isEmpty(customParameter)) {
                                                                fileIdCount = fileIdCount + 1;
                                                                var fileParameter = generateParameterObject(params[n], fileIds[fileIdCount]);
                                                                var fileParameterIndex = arrayForSetValue.indexOf(params[n]);
                                                                if (fileParameterIndex > -1) {
                                                                    arrayForSetValue[fileParameterIndex] = fileParameter;
                                                                } else {
                                                                    arrayForSetValue.push(fileParameter);
                                                                }
                                                            }

                                                            if (!_.isEmpty(sourcePId) && sourcePId.length > 0) {
                                                                var pidParameter = generateParameterObject(params[n], fileIds[fileIdCount]);
                                                                var pidIndex = arrayOfPrimaryIdentifierValue.indexOf(sourcePId[0]);
                                                                arrayOfPrimaryIdentifierValue[pidIndex] = pidParameter;
                                                            }
                                                            if (fileIdCount == fileIds.length - 1) {
                                                                break;
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
                    fileIds = new Array();

                    SetDeviceParametersDeviceProfile(unloadAddTemplatepopup);
                }
            }

            $("#loadingDiv").show();
            var method = 'GenerateFileId';
            var params = '{"token":"' + TOKEN() + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        function generateParameterObject(param, fileId) {
            var previousFileId = param.ParamValue == '' ? 0 : param.ParamValue;
            var Parameter = new Object();
            Parameter.ParamId = param.ParamId;
            Parameter.ParamName = param.Name;
            Parameter.ParamValue = fileId != undefined ? fileId : param.ParamValue;
            Parameter.TemplateId = 0;
            Parameter.IsPrimaryIdentifier = (param.PrimaryIdentifier == "True") ? 1 : 0;
            Parameter.PISequence = param.Sequence ? param.Sequence : 0;
            Parameter.SourceType = 'User';
            Parameter.ParamType = ENUM.get('FILE_ID');
            Parameter.PackageId = param.PackageId;
            Parameter.IncludeInMP = 0;
            Parameter.ValueType = param.ValueType.Type;
            Parameter.PreviousFileId = previousFileId;

            return Parameter;
        }

        function SetDeviceParametersDeviceProfile(unloadAddTemplatepopup) {

            if (self.isSequenceChanged()) {
                if (isPrimaryIdContainerHidden || isPrimaryIdContainerDisabled) {
                    var infoMoreDetails = i18n.t('more_details');
                    self.showMoreInfo(false);
                    $("#readOnlyInstanceInfoPopupProfile").modal("show");
                    $("#readOnlyInstanceInfoModalBodyProfile").prop('style', 'height: 150px !important');
                    $("#infoMessageMoreReadOnlyInstanceProfile").text(infoMoreDetails);
                    $("#infoMessageReadOnlyInstanceProfile").text(i18n.t('you_do_not_have_sufficient_privilege_change_the_instance_sequence', { lng: lang }));
                    return;
                }

                setInstancesSequence();
                return;
            }

            if (isPrimaryIdContainerHidden || isPrimaryIdContainerDisabled) {
                var infoMoreDetails = i18n.t('more_details');
                self.showMoreInfo(false);
                $("#readOnlyInstanceInfoPopupProfile").modal("show");
                $("#readOnlyInstanceInfoModalBodyProfile").prop('style', 'height: 150px !important');
                $("#infoMessageMoreReadOnlyInstanceProfile").text(infoMoreDetails);
                $("#infoMessageReadOnlyInstanceProfile").text(i18n.t('you_do_not_have_sufficient_privilege_edit_the_instance_params', { lng: lang }));
                return;
            }

            if (!isSelectedInstanceisMulti && isAddInstance && (koUtil.selectedLevel > 0)) {
                addNewInstance(unloadAddTemplatepopup);
                return;
            }

            var checkArrayTextValidation = 0;
            for (var g = 0; g < arrayForSetValue.length; g++) {
                //var checkArrayTextValidation = 0;
                var id = "#templateTxt" + arrayForSetValue[g].ParamId;
                self.regExpression(arrayForSetValue[g].ValidChars)
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

            var setDeviceParametersForDeviceProfileReq = new Object();
            var ParamList = new Array();
            for (var i = 0; i < arrayForSetValue.length; i++) {
                var Parameter = new Object();
                Parameter.ParamElementId = arrayForSetValue[i].ParamId;
                Parameter.ParamName = arrayForSetValue[i].ParamName;
                Parameter.ParamValue = arrayForSetValue[i].ParamValue;
                Parameter.TemplateId = arrayForSetValue[i].TemplateId;
                Parameter.IsPrimaryIdentifier = arrayForSetValue[i].IsPrimaryIdentifier;
                Parameter.PISequence = arrayForSetValue[i].PISequence;
                if (arrayForSetValue[i].SourceType == undefined) {
                    Parameter.SourceType = "User";
                } else {
                    Parameter.SourceType = arrayForSetValue[i].SourceType;
                }
                Parameter.ParamType = arrayForSetValue[i].ParamType;
                Parameter.PackageId = arrayForSetValue[i].PackageId;
                Parameter.IncludeInMP = arrayForSetValue[i].IncludeInMP == 1 ? 1 : 0;
                Parameter.ValueType = arrayForSetValue[i].ValueType;
                Parameter.PreviousFileId = arrayForSetValue[i].PreviousFileId;
                ParamList.push(Parameter);
            }

            var PrimaryIdentParameters = new Array();

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


            setDeviceParametersForDeviceProfileReq.ApplicationId = koUtil.getEditDeviceProfile.ApplicationId;
            setDeviceParametersForDeviceProfileReq.FormFileId = koUtil.selectedlevelFormFileId;
            setDeviceParametersForDeviceProfileReq.ContainerId = koUtil.selectedlevelContainerId;
            setDeviceParametersForDeviceProfileReq.Level = koUtil.selectedLevel;
            if (isSelectedInstanceisMulti) {
                setDeviceParametersForDeviceProfileReq.InstanceId = (koUtil.selectedLevel == 0) ? 0 : koUtil.selectedlevelInstanceId;
            } else {
                setDeviceParametersForDeviceProfileReq.InstanceId = subchildInstanceID;
            }
            setDeviceParametersForDeviceProfileReq.ParamList = ParamList;
            setDeviceParametersForDeviceProfileReq.ActionMode = isDirectParameterActivation ? ENUM.get('ACTION_MODE_SAVE_ACTIVATE') : ENUM.get('ACTION_MODE_SAVE');
            setDeviceParametersForDeviceProfileReq.IdentifiersInstances = PrimaryIdentParameters;
            setDeviceParametersForDeviceProfileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
            setDeviceParametersForDeviceProfileReq.IsFileIdModified = isFileIdModified;
            setDeviceParametersForDeviceProfileReq.InstanceDetails = koUtil.selectedInstanceLevelDetails;

            console.log(setDeviceParametersForDeviceProfileReq);

            function callbackFunction(data, error) {
                $("#loadingDiv").hide();
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        arrayForSetValue = [];
                        arrayofeditvalue = [];
                        arrayOfInvalidChars = [];
                        arrayOfPrimaryIdentifierValue = [];
                        sequenceChanged = false;
                        self.isSequenceChanged(false);
                        isFileIdModified = false;
                        koUtil.parameterPackageId = 0;
                        $("#btnSaveInstance").prop('disabled', true);

                        if (koUtil.selectedLevel == 0) {
                            getDeviceFormFiles(self.JsonXmlData, self.templateXML, self.treeColl, self.versionFlag, true);
                        } else if (koUtil.selectedLevel > 0) {
                            //TO Clear the Sub children instances
                            if (koUtil.selectedInstance() && koUtil.selectedInstance().children().length > 0) {
                                for (var k = 0; k < koUtil.selectedInstance().children().length; k++) {
                                    koUtil.selectedInstance().children()[k].dropdownCol([]);
                                    koUtil.selectedInstance().children()[k].parentInstanceId(0);
                                    koUtil.selectedInstance().children()[k].parentInstanceName('');
                                }
                            }

                            updateInstanceSelection();
                        }
                        if (isDirectParameterActivation) {
                            $("#instanceSuccessPopup").modal('show');
                            $("#instanceSuccessMessage").text(i18n.t('Parameters_successfully_updated_actviated', { lng: lang }));
                        } else {
                            $("#instanceSuccessPopup").modal('show');
                            $("#instanceSuccessMessage").text(i18n.t('Parameters_successfully_updated', { lng: lang }));
                        }

                    } else if (data.responseStatus.StatusCode == AppConstants.get('INSTANCE_ALREADY_EXISTS')) {
                        openAlertpopup(2, 'Instance_Already_Exists', { instancelevelname: koUtil.selectedLevelName });
                    } else if (data.responseStatus.StatusCode == AppConstants.get('PARAM_NOT_FOUND')) {
                        openAlertpopup(2, 'param_Not_Found');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('Invalid_Param_Value')) {
                        openAlertpopup(2, 'Invalid_Param_Value');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_NO_PARAMETER_UPDATED')) {
                        openAlertpopup(1, 'param_values_not_updated');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_INVALID_REQUEST')) {
                        $("#invalidSearchPopup").modal('show');
                    }
                }
            }

            $("#loadingDiv").show();
            var method = 'SetDeviceParametersForDeviceProfile';
            var params = '{"token":"' + TOKEN() + '","setDeviceParametersForDeviceProfileReq":' + JSON.stringify(setDeviceParametersForDeviceProfileReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        self.unloadAddTemplatepopup = function (checkTxtValue) {
            if (checkTxtValue == '') {
                $('#TemplateConfirmPopup').modal('show');
            } else {
                arrayForSetValue = [];
                arrayofeditvalue = [];
                arrayOfInvalidChars = [];
                arrayOfPrimaryIdentifierValue = [];
                self.observableModelPopup('unloadTemplate');
                $('#modelAddAppLevelInstance').modal('hide');
                koUtil.currentScreen = 'DeviceProfileEditParameters';
            }
        }

        self.hideInfoPopup = function () {
            $("#readOnlyInstanceInfoPopupProfile").modal('hide');
        }

        self.showMoreDetails = function () {
            if (self.showMoreInfo() == true) {
                var infoDetails = i18n.t('more_details');
                self.showMoreInfo(false);
                $("#readOnlyInstanceInfoModalBodyProfile").prop('style', 'height: 150px !important');
                $("#infoMessageMoreReadOnlyInstanceProfile").text(infoDetails);
            } else {
                var infoDetails = i18n.t('less_details');
                self.showMoreInfo(true);
                $("#readOnlyInstanceInfoModalBodyProfile").prop('style', 'height: 215px !important');
                $("#infoMessageMoreReadOnlyInstanceProfile").text(infoDetails);
            }
        }

        self.deleteInstances = function () {
            if (isPrimaryIdContainerHidden || isPrimaryIdContainerDisabled) {
                var infoMoreDetails = i18n.t('more_details');
                self.showMoreInfo(false);
                $("#readOnlyInstanceInfoPopupProfile").modal("show");
                $("#readOnlyInstanceInfoModalBodyProfile").prop('style', 'height: 150px !important');
                $("#infoMessageMoreReadOnlyInstanceProfile").text(infoMoreDetails);
                $("#infoMessageReadOnlyInstanceProfile").text(i18n.t('you_do_not_have_sufficient_privilege_delete_instance', { lng: lang }));
                return;
            }

            var arrayInstances = new Array();
            var arrayRowIndexes = $('#jqxgridcontainerparameterdetails').jqxGrid('getselectedrowindexes');
            for (var i = 0; i < arrayRowIndexes.length; i++) {
                var instanceData = $('#jqxgridcontainerparameterdetails').jqxGrid('getrowdata', arrayRowIndexes[i]);
                arrayInstances.push(instanceData);
            }

            if (arrayInstances.length > 0) {
                $("#DeleteInstanceText").text(i18n.t('are_you_sure_you_want_to_delete_instances', { deleteInstanceCount: arrayInstances.length }, { lng: lang }))
                $("#DeleteInstanceConfirmPopup").modal('show');
                //var paramDeleteInstances = getParamForDeleteDeviceAppLevelInstances(arrayInstances);
                //deleteDeviceAppLevelInstances(paramDeleteInstances);
            } else if (arrayInstances.length == 0) {
                openAlertpopup(1, 'please_select_a_instance_to_delete', { instanceName: koUtil.selectedLevelName });
                return;
            }
        }

        self.confirmDeleteInstance = function () {
            var arrayInstances = new Array();
            var deleteInstances = [];
            var arrayRowIndexes = $('#jqxgridcontainerparameterdetails').jqxGrid('getselectedrowindexes');
            var InstanceArrays = getInstanceLevelDetails(true);
            for (var i = 0; i < arrayRowIndexes.length; i++) {
                var instanceData = $('#jqxgridcontainerparameterdetails').jqxGrid('getrowdata', arrayRowIndexes[i]);
                var deleteInstance = new Object();
                deleteInstance.Level = koUtil.selectedLevel;
                deleteInstance.InstanceName = instanceData.Name;
                InstanceArrays.push(deleteInstance);
                arrayInstances.push(instanceData);
            }
            //koUtil.selectedLevel
            var paramDeleteInstances = getParamForDeleteDeviceAppLevelInstances(arrayInstances, InstanceArrays);
            deleteDeviceAppLevelInstances(paramDeleteInstances, arrayInstances);
            $("#DeleteInstanceConfirmPopup").modal('hide');
        }

        self.cancelDeleteInstance = function () {
            $("#DeleteInstanceConfirmPopup").modal('hide');
        }


        $('#DeleteInstanceConfirmPopup').on('shown.bs.modal', function (e) {
            $('#DeleteInstanceConfirmPopup_Confo_No').focus();

        });
        $('#DeleteInstanceConfirmPopup').keydown(function (e) {
            if ($('#DeleteInstanceConfirmPopup_Confo_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#DeleteInstanceConfirmPopup_Confo_Yes').focus();
            }
        });

        //Tab Left and Right arrow Navigation 
        var left = 0;
        var contrWidth = 0;
        self.moveLeft = function () {
            contrWidth = $('#resultSection').width();        //When we move left
            left = moveTabsLeft("#templateTabs", "#moveEPLeft", "#moveEPRight", self.templateXML().length, left, contrWidth);
        }

        self.moveRight = function () {
            contrWidth = $('#resultSection').width();        //When we move right
            left = moveTabsRight("#templateTabs", "#moveEPLeft", "#moveEPRight", self.templateXML().length, left, contrWidth);
        }

        function buildParameterContainers(JsonXmlData, templateXML, leftTreeColl, versionFlag, isUpdate) {
            var JsonXmlData1 = $.xml2json(koUtil.editDevicetemplateXML);
            if (JsonXmlData1 && JsonXmlData1.version >= 2.0) {
                versionFlag(true);
                $('#mainSplitter').jqxSplitter({ width: '99.9%', height: 700, panels: [{ size: '30%', max: 600, min: 250 }, { size: '70%', min: '50%' }] });
            } else {
                versionFlag(false);
            }

            treeOriginalColl = new Array();

            if (getDeviceFormFileResponse.AppLevel1Instances) {
                for (var l = 0; l < getDeviceFormFileResponse.AppLevel1Instances.length; l++) {
                    if (getDeviceFormFileResponse.temptreeColl.length > 0) {
                        for (var j = 0; j < getDeviceFormFileResponse.temptreeColl.length; j++) {
                            if (getDeviceFormFileResponse.temptreeColl[j].Level === 1 && getDeviceFormFileResponse.temptreeColl[j].FormFileId == getDeviceFormFileResponse.AppLevel1Instances[l].FormFileId) {
                                getDeviceFormFileResponse.temptreeColl[j].dropdownCol.push(getDeviceFormFileResponse.AppLevel1Instances[l]);
                            }
                        }
                    }
                }
            }

            var source = BuildTreeStructure(getDeviceFormFileResponse.temptreeColl);
            treeOriginalColl = getDeviceFormFileResponse.ParameterFormFiles;

            if (source && source.length > 0) {
                var root = new TreeNode(source[0]);
                leftTreeColl(root);
                buildBreadCrumText(source[0], true);
            }

            if (isUpdate == false) {
                getParameterValuesFromTemplate(JsonXmlData, templateXML, 0, isUpdate);
            } else if (getDeviceFormFileResponse.temptreeColl.length > 0) {
                koUtil.selectedlevelFormFileId = getDeviceFormFileResponse.temptreeColl[0].FormFileId;
                if (JsonXmlData1 && JsonXmlData1.length == undefined) {
                    JsonXmlData1 = $.makeArray(JsonXmlData1);
                }
                if (JsonXmlData1 && JsonXmlData1.length > 0) {
                    koUtil.selectedlevelContainerId = getParameterContainerId(JsonXmlData1);
                }
                createContainerTabs(JsonXmlData, templateXML, 0, isUpdate, []);
            }
            if (getDeviceFormFileResponse && getDeviceFormFileResponse.temptreeColl && getDeviceFormFileResponse.temptreeColl.length == 1) {
                $("#chkValidation").prop('disabled', true);
            }
            $(".treeRoot .treeNodeCntr .nodeText").first().addClass("treeNodeActive");
            $("#btnSaveInstance").prop('disabled', true);
        }

        function getDeviceFormFiles(JsonXmlData, templateXML, leftTreeColl, versionFlag, isUpdate) {
            var getDeviceFormFileReq = new Object();
            var Selector = new Object();

            getDeviceFormFileReq.ApplicationId = applicationId;
            getDeviceFormFileReq.Protocol = koUtil.Protocol;
            getDeviceFormFileReq.IsFromDeviceSearch = false;
            getDeviceFormFileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
            getDeviceFormFileReq.DeviceSearch = null;
            getDeviceFormFileReq.ColumnSortFilter = null;
            Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
            Selector.UnSelectedItemIds = null;
            getDeviceFormFileReq.Selector = Selector;
            getDeviceFormFileReq.InstanceDetails = koUtil.selectedInstanceLevelDetails;

            function callbackFunction(data, error) {
                if (data) {
                    $("#loadingDiv").hide();
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        console.log(data.getDeviceFormFileResp);

                        if (data.getDeviceFormFileResp && data.getDeviceFormFileResp.ParameterFormFiles && data.getDeviceFormFileResp.ParameterFormFiles.length > 0) {

                            DeviceParamAppGID = data.getDeviceFormFileResp.AppGID;
                            koUtil.editDevicetemplateXML = data.getDeviceFormFileResp.ParameterFormFiles[0].FormFileXML;
                            var JsonXmlData1 = $.xml2json(koUtil.editDevicetemplateXML);
                            if (JsonXmlData1 && JsonXmlData1.version >= 2.0) {
                                versionFlag(true);
                                $('#mainSplitter').jqxSplitter({ width: '99.9%', height: 700, panels: [{ size: '30%', max: 600, min: 250 }, { size: '70%', min: '50%' }] });
                            } else {
                                versionFlag(false);
                            }

                            var treeObject;
                            var temptreeColl = new Array();
                            treeOriginalColl = new Array();
                            if (data.getDeviceFormFileResp.ParameterFormFiles && data.getDeviceFormFileResp.ParameterFormFiles.length > 0) {

                                for (var i = 0; i < data.getDeviceFormFileResp.ParameterFormFiles.length; i++) {
                                    treeObject = new Object();
                                    treeObject.FormFileId = data.getDeviceFormFileResp.ParameterFormFiles[i].FormFileId;
                                    treeObject.ParentFormFileId = data.getDeviceFormFileResp.ParameterFormFiles[i].ParentFormFileId;
                                    treeObject.LevelName = data.getDeviceFormFileResp.ParameterFormFiles[i].LevelName;
                                    treeObject.FormFileXML = data.getDeviceFormFileResp.ParameterFormFiles[i].FormFileXML;
                                    treeObject.ParentVPFX = data.getDeviceFormFileResp.ParameterFormFiles[i].ParentVPFX;
                                    treeObject.Level = parseInt(data.getDeviceFormFileResp.ParameterFormFiles[i].Level);
                                    treeObject.OriginalPFX = data.getDeviceFormFileResp.ParameterFormFiles[i].OriginalPFX;
                                    treeObject.ParentLevel = data.getDeviceFormFileResp.ParameterFormFiles[i].ParentLevel;
                                    treeObject.FileName = data.getDeviceFormFileResp.ParameterFormFiles[i].FileName;
                                    treeObject.children = [];
                                    treeObject.isMulti = data.getDeviceFormFileResp.ParameterFormFiles[i].IsMultiInstance;
                                    treeObject.dropdownCol = [];
                                    treeObject.parentInstanceSourceId = 0;
                                    treeObject.parentInstanceId = 0;
                                    treeObject.parentInstanceName = '';
                                    treeObject.selectedInstanceName = '';

                                    var treeNode = buildMultiInstanceTree(data.getDeviceFormFileResp.ParameterFormFiles, treeObject.Level, treeObject.ParentLevel, treeObject.FormFileXML);
                                    data.getDeviceFormFileResp.ParameterFormFiles[i].isLevelAccess = treeNode.isLevelAccess;
                                    if (!treeNode.isParentLevelAccess)
                                        break;
                                    if (treeNode.isLevelAccess)
                                        temptreeColl.push(treeObject);
                                }
                            }

                            if (data.getDeviceFormFileResp.AppLevel1Instances) {
                                for (var l = 0; l < data.getDeviceFormFileResp.AppLevel1Instances.length; l++) {
                                    if (temptreeColl.length > 0) {
                                        for (var j = 0; j < temptreeColl.length; j++) {
                                            if (temptreeColl[j].Level === 1 && temptreeColl[j].FormFileId == data.getDeviceFormFileResp.AppLevel1Instances[l].FormFileId) {
                                                temptreeColl[j].dropdownCol.push(data.getDeviceFormFileResp.AppLevel1Instances[l]);
                                            }
                                        }
                                    }
                                }
                            }

                            var source = BuildTreeStructure(temptreeColl);
                            treeOriginalColl = data.getDeviceFormFileResp.ParameterFormFiles;

                            if (source && source.length > 0) {
                                var root = new TreeNode(source[0]);
                                leftTreeColl(root);
                            }
                            $(".treeRoot .treeNodeCntr .nodeText").first().addClass("treeNodeActive");
                        }
                        if (isUpdate == false) {
                            getParameterValuesFromTemplate(JsonXmlData, templateXML, 0, isUpdate);
                        } else if (temptreeColl.length > 0) {
                            createContainerTabs(JsonXmlData, templateXML, 0, isUpdate, []);
                        }
                        $("#btnSaveInstance").prop('disabled', true);
                    }
                }
            }
            $("#loadingDiv").show();
            var method = 'GetDeviceFormFile';
            var params = '{"token":"' + TOKEN() + '","getDeviceFormFileReq":' + JSON.stringify(getDeviceFormFileReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        function setLevelParams(selectedLevelParams, Params) {
            for (var i = 0; i < Params.length; i++) {
                var Parameter = new Object();
                Parameter.ParamId = Params[i].ParamId;
                if (Params[i].ParamValue == undefined) {
                    Parameter.ParamValue = Params[i].Default;
                } else {
                    Parameter.ParamValue = Params[i].ParamValue;
                }
                Parameter.TemplateId = koUtil.selectedTemplateId;
                Parameter.ApplicationId = ApplicationIdForTemplate;
                if (Parameter.ParamValue == Params[i].Default) {
                    Parameter.SourceType = 'User';
                }
                else {
                    Parameter.SourceType = 'User';
                }
                Parameter.ParamType = Params[i].ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
                Parameter.PackageId = Params[i].ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
                Parameter.IncludeInMP = Params[i].IncludeInMP == "True" ? 1 : 0;
                Parameter.ValueType = Params[i].ValueType.Type;
                selectedLevelParams.push(Parameter);
            }
        }
        function setLevelContainers(Container, selectedLevelParams) {
            if (Container.Param == undefined) {
                if (Container.Container != undefined) {
                    for (var l = 0; l < Container.Container.length; l++) {
                        setLevelContainers(Container.Container[l], selectedLevelParams);
                    }
                }
            } else {
                setLevelParams(selectedLevelParams, Container.Param);
                if (Container.Container != undefined) {
                    for (var k = 0; k < Container.Container.length; k++) {
                        setLevelContainers(Container.Container[k], selectedLevelParams);
                    }
                }
            }
        }
        function loadParametersByLevel(container) {
            if (container.length > 0) {
                selectedLevelParams = [];
                for (var j = 0; j < container.length; j++) {
                    setLevelContainers(container[j], selectedLevelParams);
                }

            }
        }
        function getApplicationTemplateVPFXFilesById(JsonXmlData, templateXML, leftTreeColl, versionFlag, isUpdate, templateId, templateStoredData) {

            var getParameterFormElementsReq = new Object();
            getParameterFormElementsReq.ApplicationId = koUtil.deviceEditTemplate.ApplicationId;
            getParameterFormElementsReq.TemplateId = koUtil.selectedTemplateId;
            getParameterFormElementsReq.ParameterRetrivalType = ENUM.get("FORMFILE_XML");

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        //if (data && data.getParameterFormElementsResp) {
                        //    data.getParameterFormElementsResp = $.parseJSON(data.getParameterFormElementsResp);
                        //}

                        if (data.getParameterFormElementsResp) {

                            koUtil.editDevicetemplateXML = data.getParameterFormElementsResp.FormFiles[0].FormFileXML;
                            var JsonXmlData1 = $.xml2json(koUtil.editDevicetemplateXML);
                            if (JsonXmlData1 && JsonXmlData1.version >= 2.0) {
                                versionFlag(true);
                                $('#mainSplitter').jqxSplitter({ width: '99.9%', height: 700, panels: [{ size: '30%', max: 600, min: 250 }, { size: '70%', min: '50%' }] });
                            }
                            else {
                                versionFlag(false);

                            }
                            if (JsonXmlData1.ParameterFile != undefined) {
                                loadParametersByLevel(JsonXmlData1.ParameterFile.Container)
                            }
                            var treeObject;
                            var temptreeColl = new Array();
                            treeOriginalColl = new Array();
                            if (data.getParameterFormElementsResp.FormFiles) {

                                for (var i = 0; i < data.getParameterFormElementsResp.FormFiles.length; i++) {
                                    treeObject = new Object();
                                    treeObject.FormFileId = data.getParameterFormElementsResp.FormFiles[i].FormFileId;
                                    treeObject.ParentFormFileId = data.getParameterFormElementsResp.FormFiles[i].ParentFormFileId;
                                    treeObject.LevelName = data.getParameterFormElementsResp.FormFiles[i].LevelName;
                                    treeObject.Level = data.getParameterFormElementsResp.FormFiles[i].Level;
                                    treeObject.FileName = data.getParameterFormElementsResp.FormFiles[i].FileName;
                                    treeObject.ParentVPFX = data.getParameterFormElementsResp.FormFiles[i].ParentVPFX;
                                    treeObject.OriginalPFX = data.getParameterFormElementsResp.FormFiles[i].OriginalPFX;
                                    treeObject.ParentLevel = data.getParameterFormElementsResp.FormFiles[i].ParentLevel;
                                    treeObject.children = [];
                                    treeObject.parentInstanceSourceId = 0;
                                    treeObject.parentInstanceId = 0;
                                    treeObject.FormFileXML = 'XML';
                                    treeObject.isMulti = data.getParameterFormElementsResp.FormFiles[i].IsMultiInstance;
                                    treeObject.dropdownCol = [];
                                    treeObject.selectedInstanceName = '';
                                    treeObject.parentInstanceName = '';
                                    temptreeColl.push(treeObject);

                                }
                                if (data.getParameterFormElementsResp.TemplateLevel1Instances != undefined) {
                                    for (var l = 0; l < data.getParameterFormElementsResp.TemplateLevel1Instances.length; l++) {
                                        for (var j = 0; j < temptreeColl.length; j++) {
                                            if (temptreeColl[j].Level === 1 && temptreeColl[j].FormFileId == data.getParameterFormElementsResp.TemplateLevel1Instances[l].FormFileId) {
                                                data.getParameterFormElementsResp.TemplateLevel1Instances[l].Name = data.getParameterFormElementsResp.TemplateLevel1Instances[l].InstanceName;
                                                temptreeColl[j].dropdownCol.push(data.getParameterFormElementsResp.TemplateLevel1Instances[l]);
                                                var id = "#treeCombo" + data.getParameterFormElementsResp.TemplateLevel1Instances[l].FormFileId + "_" + temptreeColl[j].Level;
                                                $(id).prop('selectedIndex', 0);
                                                $(id).trigger('chosen:updated');
                                            }
                                        }
                                    }
                                }
                                var source = BuildTreeStructure(temptreeColl);
                                treeOriginalColl = data.getParameterFormElementsResp.FormFiles;

                                var root = new TreeNode(source[0]);
                                leftTreeColl(root);
                                $(".treeRoot .treeNodeCntr .nodeText").first().addClass("treeNodeActive");
                            }

                            createContainerTabs(JsonXmlData, templateXML, 0, true, []);
                            getParameterValuesFromTemplate(JsonXmlData, templateXML, 0, isUpdate, templateStoredData);
                        } else {
                            PFXFiles = null;
                        }
                    }
                }
            }

            var params = '{"token":"' + TOKEN() + '","getParameterFormElementsReq":' + JSON.stringify(getParameterFormElementsReq) + '}'
            ajaxJsonCall('GetApplicationVPFXFiles', params, callBackfunction, true, 'POST', true);

        }
        function getParameterValuesFromTemplate(JsonXmlData, templateXML, LevelFlag, isUpdate, templateStoredData) {
            var getParameterValuesFromTemplateAtAppLevelReq = new Object();
            getParameterValuesFromTemplateAtAppLevelReq.ParamId = self.paramId();
            getParameterValuesFromTemplateAtAppLevelReq.TemplateId = koUtil.selectedTemplateId;
            getParameterValuesFromTemplateAtAppLevelReq.Level = LevelFlag;
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        if (data && data.getParameterValuesFromTemplateAtAppLevelResp) {
                            data.getParameterValuesFromTemplateAtAppLevelResp = $.parseJSON(data.getParameterValuesFromTemplateAtAppLevelResp);
                        }

                        if (data.getParameterValuesFromTemplateAtAppLevelResp.TEMPLATEPARAMETERS == null) {
                            if (LevelFlag != 0) {
                                savecheck = 1;
                                openAlertpopup(1, 'pvalu_dose_not_exist');
                            }
                        } else {
                            if (LevelFlag == 0) {
                                templateStoredData(data.getParameterValuesFromTemplateAtAppLevelResp.TEMPLATEPARAMETERS);
                                createContainerTabs(JsonXmlData, templateXML, 0, isUpdate, data.getParameterValuesFromTemplateAtAppLevelResp.TEMPLATEPARAMETERS);
                                for (var k = 0; k < tabContainer.length; k++) {
                                    for (var j = 0; j < tabContainer[k].Container.length; j++) {
                                        assignContainerValue(tabContainer[k].Container[j], data.getParameterValuesFromTemplateAtAppLevelResp.TEMPLATEPARAMETERS, false, false, []);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            var method = 'GetParameterValuesFromTemplateAtAppLevel';
            var params = '{"token":"' + TOKEN() + '","getParameterValuesFromTemplateAtAppLevelReq":' + JSON.stringify(getParameterValuesFromTemplateAtAppLevelReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }
        function setInstancesSequence() {
            var setInstanceSequenceReq = new Object();
            //setInstanceSequenceReq.ApplicationId = applicationId;
            //setInstanceSequenceReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
            setInstanceSequenceReq.Level = koUtil.selectedLevel;
            var instanceSequenceCol = new Array();
            var instance;
            var griddata = $('#jqxgridcontainerparameterdetails').jqxGrid('getdatainformation');

            for (var i = 0; i < griddata.rowscount; i++) {
                var rowdata = $("#jqxgridcontainerparameterdetails").jqxGrid('getrowdata', i);
                instance = new Object();
                instance.InstanceId = rowdata.InstanceId;
                instance.Sequence = i + 1;
                instanceSequenceCol.push(instance);
            }
            setInstanceSequenceReq.InstanceSequence = instanceSequenceCol;

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (koUtil.selectedLevel == 0)
                            unloadAddTemplatepopup();
                        arrayForSetValue = [];
                        arrayofeditvalue = [];
                        arrayOfInvalidChars = [];
                        arrayOfPrimaryIdentifierValue = [];
                        self.isSequenceChanged(false);
                        $("#btnSaveInstance").prop('disabled', true);
                        $("#btnSaveSelectedPvalue").prop('disabled', true);
                        $("#instanceSuccessPopup").modal('show');
                        $("#instanceSuccessMessage").text(i18n.t('Instances_Sequence_successfully_updated', { lng: lang }));
                    }
                }
            }

            var method = 'SetInstanceSequence';
            var params = '{"token":"' + TOKEN() + '","setInstanceSequenceReq":' + JSON.stringify(setInstanceSequenceReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        function getDeviceApplicationParams() {
            var getDeviceApplicationParamsReq = new Object();
            getDeviceApplicationParamsReq.ApplicationId = applicationId;
            getDeviceApplicationParamsReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
            getDeviceApplicationParamsReq.Level = koUtil.selectedLevel;
            getDeviceApplicationParamsReq.InstanceId = koUtil.selectedlevelInstanceId;
            getDeviceApplicationParamsReq.ContainerId = koUtil.selectedlevelContainerId;
            getDeviceApplicationParamsReq.InstanceDetails = koUtil.selectedInstanceLevelDetails;

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        if (data && data.getDeviceApplicationParamsResp) {
                            data.getDeviceApplicationParamsResp = $.parseJSON(data.getDeviceApplicationParamsResp);
                        }

                        if (data.getDeviceApplicationParamsResp && data.getDeviceApplicationParamsResp.Parameters) {
                            arrayForSetValue = [];
                            arrayofeditvalue = [];
                            arrayOfInvalidChars = [];
                            arrayOfPrimaryIdentifierValue = [];
                            sequenceChanged = false;
                            self.isSequenceChanged(false);
                            for (var k = 0; k < tabContainer.length; k++) {
                                for (var j = 0; j < tabContainer[k].Container.length; j++) {
                                    assignContainerValue(tabContainer[k].Container[j], data.getDeviceApplicationParamsResp.Parameters, true, false, []);
                                }
                            }
                        }
                    }
                }
            }

            var method = 'GetDeviceApplicationParams';
            var params = '{"token":"' + TOKEN() + '","getDeviceApplicationParamsReq":' + JSON.stringify(getDeviceApplicationParamsReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        function getDeviceAppLevelInstanceDetails() {
            var getDeviceAppLevelInstanceDetailsReq = new Object();
            getDeviceAppLevelInstanceDetailsReq.ApplicationId = applicationId;
            getDeviceAppLevelInstanceDetailsReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
            getDeviceAppLevelInstanceDetailsReq.Level = koUtil.selectedLevel;
            getDeviceAppLevelInstanceDetailsReq.ParentInstanceId = koUtil.selectedlevelParentInstanceId;
            getDeviceAppLevelInstanceDetailsReq.FormFileId = koUtil.selectedlevelFormFileId;
            getDeviceAppLevelInstanceDetailsReq.ContainerId = koUtil.selectedlevelContainerId;
            getDeviceAppLevelInstanceDetailsReq.InstanceDetails = koUtil.selectedInstanceLevelDetails;

            function callbackFunction(data, error) {
                isAddInstance = true;
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        if (data && data.getDeviceAppLevelInstanceDetailsResp) {
                            data.getDeviceAppLevelInstanceDetailsResp = $.parseJSON(data.getDeviceAppLevelInstanceDetailsResp);
                        }

                        var tempArray = new Array();
                        if (data.getDeviceAppLevelInstanceDetailsResp && !_.isEmpty(data.getDeviceAppLevelInstanceDetailsResp.Parameters)) {
                            tempArray = data.getDeviceAppLevelInstanceDetailsResp.Parameters;
                            if (!_.isEmpty(tempArray) && tempArray.length > 0) {
                                var sourceType = _.where(tempArray, { SourceType: 'Default' });
                                if (!_.isEmpty(sourceType) && sourceType.length === tempArray.length) {
                                    isAddInstance = true;
                                } else {
                                    isAddInstance = false;
                                }
                            }

                            for (var k = 0; k < tabContainer.length; k++) {
                                for (var j = 0; j < tabContainer[k].Container.length; j++) {
                                    assignContainerValue(tabContainer[k].Container[j], tempArray, false, false, []);
                                }
                            }
                        } else {
                            isAddInstance = true;
                        }
                    }
                }
            }

            var method = 'GetDeviceAppLevelInstanceDetails';
            var params = '{"token":"' + TOKEN() + '","getDeviceAppLevelInstanceDetailsReq":' + JSON.stringify(getDeviceAppLevelInstanceDetailsReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        function addNewInstance(unloadAddTemplatepopup) {
            var addDeviceAppLevelInstanceReq = new Object();
            var Parameters = new Array();
            var PrimaryIdentParameters = new Array();

            for (var i = 0; i < arrayForSetValue.length; i++) {
                if (arrayForSetValue[i].ParamId != 0) {
                    var Parameter = new Object();
                    Parameter.ParamElementId = arrayForSetValue[i].ParamId;
                    Parameter.ParamValue = arrayForSetValue[i].ParamValue;
                    Parameter.TemplateId = arrayForSetValue[i].TemplateId;
                    Parameter.IsPrimaryIdentifier = arrayForSetValue[i].IsPrimaryIdentifier;
                    Parameter.PISequence = arrayForSetValue[i].PISequence;
                    if (arrayForSetValue[i].SourceType == undefined) {
                        Parameter.SourceType = "User";
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
                    PrimaryIdentParameters.push(IdentifiersInstances);
                }
            }

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        getAppChildInstances();
                        //getDeviceAppLevelInstanceDetails();
                        arrayForSetValue = [];
                        arrayofeditvalue = [];
                        arrayOfInvalidChars = [];
                        arrayOfPrimaryIdentifierValue = [];
                        sequenceChanged = false;
                        self.isSequenceChanged(false);
                        koUtil.parameterPackageId = 0;
                        $("#btnSaveSelectedPvalue").prop('disabled', true);
                        $("#btnSaveInstance").prop('disabled', true);
                        if (isDirectParameterActivation) {
                            $("#instanceSuccessPopup").modal('show');
                            $("#instanceSuccessMessage").text(i18n.t('Parameters_successfully_updated_actviated', { lng: lang }));
                        } else {
                            $("#instanceSuccessPopup").modal('show');
                            $("#instanceSuccessMessage").text(i18n.t('Parameters_successfully_updated', { lng: lang }));
                        }
                        isAddInstance = false;
                    } else if (data.responseStatus.StatusCode == AppConstants.get('INSTANCE_ALREADY_EXISTS')) {
                        openAlertpopup(2, 'Instance_Already_Exists', { instancelevelname: koUtil.selectedLevelName });
                    }
                }

            }

            addDeviceAppLevelInstanceReq.ApplicationId = koUtil.getEditDeviceProfile.ApplicationId;
            addDeviceAppLevelInstanceReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
            addDeviceAppLevelInstanceReq.FormFileId = koUtil.selectedlevelFormFileId;
            addDeviceAppLevelInstanceReq.ContainerId = koUtil.selectedlevelContainerId;
            addDeviceAppLevelInstanceReq.Level = koUtil.selectedLevel;
            addDeviceAppLevelInstanceReq.ParentInstanceId = koUtil.selectedlevelParentInstanceId;
            addDeviceAppLevelInstanceReq.ActionMode = isDirectParameterActivation ? ENUM.get('ACTION_MODE_SAVE_ACTIVATE') : ENUM.get('ACTION_MODE_SAVE');
            addDeviceAppLevelInstanceReq.InstanceDetails = koUtil.selectedInstanceLevelDetails;

            if (Parameters != '') {
                addDeviceAppLevelInstanceReq.Parameters = Parameters;
                addDeviceAppLevelInstanceReq.IdentifiersInstances = PrimaryIdentParameters;
                var params = '{"token":"' + TOKEN() + '","addDeviceAppLevelInstanceReq":' + JSON.stringify(addDeviceAppLevelInstanceReq) + '}';
                ajaxJsonCall('AddDeviceAppLevelInstance', params, callbackFunction, true, 'POST', true);
            } else {
                openAlertpopup(1, 'p_t_add_entername');
            }
        }

        function getAppChildInstances(instance) {
            var getAppChildInstancesReq = new Object();
            var Selector = new Object();

            getAppChildInstancesReq.ApplicationId = applicationId;
            if (isSelectedInstanceisMulti)
                getAppChildInstancesReq.Level = koUtil.selectedLevel;
            else
                getAppChildInstancesReq.Level = koUtil.selectedLevel - 1;

            getAppChildInstancesReq.FormFileId = koUtil.selectedlevelFormFileId;
            getAppChildInstancesReq.IsFromDeviceSearch = false;
            getAppChildInstancesReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
            getAppChildInstancesReq.InstanceSourceId = koUtil.selectedLevel > 1 ? koUtil.selectedlevelParentInstanceSourceId : 0;
            getAppChildInstancesReq.InstanceId = koUtil.selectedlevelInstanceId;
            getAppChildInstancesReq.DeviceSearch = null;
            getAppChildInstancesReq.ColumnSortFilter = null;
            getAppChildInstancesReq.InstanceDetails = getInstanceLevelDetails(false);
            getAppChildInstancesReq.ContainerId = koUtil.selectedlevelContainerId;
            Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
            Selector.UnSelectedItemIds = null;

            getAppChildInstancesReq.Selector = Selector;

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        if (data && data.getAppChildInstancesResp) {
                            data.getAppChildInstancesResp = $.parseJSON(data.getAppChildInstancesResp);
                        }

                        if (data.getAppChildInstancesResp && data.getAppChildInstancesResp.ChildInstances) {
                            if (instance) {
                                if (instance.children().length > 0)
                                    for (var k = 0; k < instance.children().length; k++) {
                                        var childSource = _.where(data.getAppChildInstancesResp.ChildInstances, { FormFileId: instance.children()[k].FormFileId() });
                                        instance.children()[k].dropdownCol(childSource);
                                        var id = "#treeCombo" + instance.children()[k].FormFileId() + "_" + instance.children()[k].Level();
                                        $(id).prop('selectedIndex', 0);
                                        $(id).trigger('chosen:updated');
                                    }
                            }
                            //In Case of Not a Multi Next Level this Id Will be Used
                            if (data.getAppChildInstancesResp.ChildInstances.length > 0) {
                                subchildInstanceID = data.getAppChildInstancesResp.ChildInstances[0].InstanceId;
                            }
                        }

                    }
                }
            }

            var method = 'GetAppChildInstances';
            var params = '{"token":"' + TOKEN() + '","getAppChildInstancesReq":' + JSON.stringify(getAppChildInstancesReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        function deleteDeviceAppLevelInstances(paramDelete, deleteInstances) {
            function callbackFunction(data, error) {
                $("#loadingDiv").hide();
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        koUtil.isParamValuesChanged(true);
                        //koUtil.selectedInstance();
                        updateSelectedLevelInstanceDropDown(deleteInstances);
                        $("#instanceSuccessPopup").modal('show');
                        $("#instanceSuccessMessage").text(i18n.t('Instances_successfully_deleted', { lng: lang }));
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_REFERENCED_INSTANCES_CANNOT_BE_DELETED')) {	//371
                        openAlertpopup(1, 'instances_referenced_cannot_be_deleted');
                    }
                }
            }

            var method = 'DeleteDeviceAppLevelInstances';
            var params = '{"token":"' + paramDelete.token + '","deleteDeviceAppLevelInstancesReq":' + JSON.stringify(paramDelete.deleteDeviceAppLevelInstancesReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }
        function GetPrimaryIdentifiers(primaryIdentifiers, data) {

            for (var l = 0; l < data.length; l++) {
                if (primaryIdentifiers.length == 0) {
                    if (data[l][0].Param != undefined) {
                        primaryIdentifiers = _.where(data[l][0].Param, { PrimaryIdentifier: "True" });
                        if (primaryIdentifiers.length == 0) {
							primaryIdentifiers = GetPrimaryIdentifiers(primaryIdentifiers, data[l][0].Container);
						}
                    } else if (data[l][0].Container != undefined && data[l][0].Container.length > 0) {
                        primaryIdentifiers = GetPrimaryIdentifiers(primaryIdentifiers, data[l][0].Container);
                    }

                    if (primaryIdentifiers.length > 0)
                        var isEditAllowed = data[l][0].AllowModify;

                    if (primaryIdentifiers.length == 0) {
                        isPrimaryIdContainerHidden = true;
                        isPrimaryIdContainerDisabled = true;
                    } else if (primaryIdentifiers.length > 0 && !isEditAllowed) {
                        isPrimaryIdContainerHidden = false;
                        isPrimaryIdContainerDisabled = true;
                    } else {
                        isPrimaryIdContainerHidden = false;
                        isPrimaryIdContainerDisabled = false;
                    }
                }
            }
            return primaryIdentifiers;
        }
        function createContainerTabs(JsonXmlData, templateXML, level, isUpdate, templateParameters) {
            templateXML([]);
            tabContainer = [];
            if (JsonXmlData() && JsonXmlData().length > 0) {
                var JsonXmlData1 = JsonXmlData();
            } else {
                var JsonXmlData1 = $.xml2json(koUtil.editDevicetemplateXML);
            }

            if (JsonXmlData1 && JsonXmlData1.length == undefined) {
                JsonXmlData1 = $.makeArray(JsonXmlData1);
            }

            if (JsonXmlData1 && JsonXmlData1.length > 0) {
                if (isUpdate == false && level == 0) {
                    for (var k = 0; k < JsonXmlData1.length; k++) {
                        if (JsonXmlData1[k].ParameterFile.Container.length > 0) {
                            for (var j = 0; j < JsonXmlData1[k].ParameterFile.Container.length; j++) {
                                var Params = JsonXmlData1[k].ParameterFile.Container[j].Param;
                                for (var i = 0; i < JsonXmlData1[k].ParameterFile.Container[j].Param.length; i++) {
                                    var isUserEdited = false;
                                    var paramValue = "";
                                    for (var l = 0; l < templateParameters.length; l++) {
                                        if (templateParameters[l].ParamId == parseInt(JsonXmlData1[k].ParameterFile.Container[j].Param[i].ParamId)) {
                                            isUserEdited = true;
                                            paramValue = templateParameters[l].ParamValue;
                                        }
                                    }
                                    if (isUserEdited) {
                                        JsonXmlData1[k].ParameterFile.Container[j].Param[i].SourceType = 'User';
                                        JsonXmlData1[k].ParameterFile.Container[j].Param[i].ParamValue = paramValue;
                                    } else {
                                        JsonXmlData1[k].ParameterFile.Container[j].Param[i].SourceType = 'Default';
                                    }

                                }
                            }
                        } else {
                            if (JsonXmlData1[k].ParameterFile.Container.Param.length != undefined) {
                                for (var i = 0; i < JsonXmlData1[k].ParameterFile.Container.Param.length; i++) {
                                    var isUserEdited = false;
                                    for (var l = 0; l < templateParameters.length; l++) {
                                        if (templateParameters[l].ParamId == parseInt(JsonXmlData1[k].ParameterFile.Container.Param[i].ParamId)) {
                                            isUserEdited = true;
                                        }
                                    }
                                    if (isUserEdited) {
                                        JsonXmlData1[k].ParameterFile.Container.Param[i].SourceType = 'User';
                                    } else {
                                        JsonXmlData1[k].ParameterFile.Container.Param[i].SourceType = 'Default';
                                    }
                                }
                            }
                        }
                    }
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
                            GenerateContainerData(JsonXmlData1[i].ParameterFile[j].Container[t], tabContainer, paramLevel, DeviceParamAppGID, JsonXmlData1[i], 1, isUpdate, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, false, koUtil, true);
                        }
                    }
                }
            }

            $("#templateTabs").css("width", tabContainer.length * 110 + "px");
            templateXML(tabContainer);

            setTimeout(function () {
                contrWidth = $('#resultSection').width();
                left = 0;
                updateTabsNavigation("#templateTabs", "#moveEPLeft", "#moveEPRight", tabContainer.length, left, contrWidth);
            }, 500);

            if (tabContainer && tabContainer.length > 0) {
                for (var k = 0; k < tabContainer.length; k++) {
                    for (var j = 0; j < tabContainer[k].Container.length; j++) {
                        assignContainerValue(tabContainer[k].Container[j], [], false, isAddInstance, []);

                        if (tabContainer[k].Container[j].Type == 'Details') {
                            var primaryIdentifiers = []
                            IsPrimaryIdentifierExist = false;
                            var isViewAllowed = tabContainer[k].Container[j].AllowView;
                            if (tabContainer[k].Container[j].Container.length > 0) {
                                // find primary identifier //VHQ-19247 VHQ-20036
                                primaryIdentifiers = GetPrimaryIdentifiers(primaryIdentifiers, tabContainer[k].Container[j].Container);
                            } else {
                                if (isGridTabSelect) {
                                    $('#subContainerDivDeviceProfile').removeClass('hide');
                                    $('#instanceParametersDivDeviceProfile').addClass('hide');
                                    $('#noContainerAccessDivDeviceProfile').addClass('hide');
                                } else {
                                    $('#subContainerDivDeviceProfile').addClass('hide');
                                    $('#instanceParametersDivDeviceProfile').addClass('hide');
                                    $('#noContainerAccessDivDeviceProfile').removeClass('hide');

                                }
                                primaryIdentifiers = _.where(tabContainer[k].Container[j].Param, { PrimaryIdentifier: "True" });
                            }
                            if (primaryIdentifiers.length > 0 || !isViewAllowed) {
                                IsPrimaryIdentifierExist = true;
                                $('#instanceNameDivDeviceProfile').addClass('hide');
                            } else {
                                IsPrimaryIdentifierExist = false;
                                $('#instanceNameDivDeviceProfile').removeClass('hide');
                            }
                        }
                    }
                }
                if (koUtil.viewParameterTemplateOnDevice == true) {
                    $('#txtEditInstanceName').prop('disabled', true);
                }
            } else {
                $('#subContainerDivDeviceProfile').addClass('hide');
                $('#instanceParametersDivDeviceProfile').addClass('hide');
                $('#noContainerAccessDivDeviceProfile').removeClass('hide');
            }
            checkFlagForOnload = 0;
        }

        seti18nResourceData(document, resourceStorage);
    };


    function BuildTreeStructure(array, parent, tree) {

        tree = typeof tree !== 'undefined' ? tree : [];
        parent = typeof parent !== 'undefined' ? parent : {
            FormFileId: 0
        };

        var children = _.filter(array, function (child) {
            return child.ParentFormFileId == parent.FormFileId;
        });

        if (!_.isEmpty(children)) {
            if (parent.FormFileId == 0) {
                tree = children;
            } else {
                parent['children'] = children
            }
            _.each(children, function (child) { BuildTreeStructure(array, child) });
        }

        return tree;
    }

    function assignContainerValue(data, ParameterDetails, isAssignParam, isAddInstance, primaryIdentifierValues) {
        if (data.length == undefined) {
            data = $.makeArray(data);
        }

        for (var d = 0; d < data.length; d++) {
            if (isAssignParam != true && data[d].Type != undefined && data[d].Type.toUpperCase() == "GRID") {
                if (data[d].Param != undefined) {
                    if (data[d].Param.length == undefined) {
                        data[d].Param = $.makeArray(data[d].Param);
                    }
                    if (data[d].Param.length > 0) {
                        koUtil.instanceGridParameters = data[d].Param;
                        var paramAPI = getParamForDeviceAppLevelInstances();
                        assignParamValueToGrid('jqxgridcontainerparameterdetails', data[d].Param, paramAPI);
                    }
                }
            }
            else if (data[d].Type != undefined && data[d].Type.toUpperCase() != "GRID") {
                if (data[d].Param != undefined) {
                    if (data[d].Param.length == undefined) {
                        data[d].Param = $.makeArray(data[d].Param);
                    }
                    if (data[d].Param.length > 0) {
                        assignParamValue(data[d].Param, ParameterDetails, isAddInstance, primaryIdentifierValues);
                    }
                }
            }

            if (data[d].Container != undefined) {
                if (data[d].Container.length == undefined) {
                    data[d].Container = $.makeArray(data[d].Container);
                }
                if (data[d].Container.length > 0) {
                    for (var a = 0; a < data[d].Container.length; a++) {
                        assignContainerValue(data[d].Container[a], ParameterDetails, false, false, primaryIdentifierValues);
                    }
                } else {
                    if (data[d].Type == "Details") {
                        $('#subContainerDivDeviceProfile').addClass('hide');
                        $('#instanceParametersDivDeviceProfile').addClass('hide');
                        $('#noContainerAccessDivDeviceProfile').removeClass('hide');
                    }
                }
            }
        }
    }

    function assignParamValue(Param, ParameterDetails, isAddInstance, primaryIdentifierValues) {
        // arrayOfPrimaryIdentifierValue = [];
        if (ParameterDetails && ParameterDetails.length > 0) {
            for (var l = 0; l < Param.length; l++) {
                var pid = parseInt(Param[l].ParamId);
                var source = _.where(ParameterDetails, {
                    ParamId: pid
                })
                var PIParameter = new Object();
                if (source && source.length > 0) {
                    PIParameter.ParamValue = Param[l].ParamValue = source[0].ParamValue;
                    PIParameter.SourceType = Param[l].SourceType = source[0].SourceType;
                    if (Param[l].ValueType.Type == 'Enumeration') {
                        var id = '#templateCombo' + source[0].ParamId;
                        if (source[0].ParamValue != undefined) {
                            if (source[0].ParamId != 0) {

                                var sourceItem = _.where(Param[l].ValueType.Enumeration.EnumItem, { Value: source[0].ParamValue });
                                if (sourceItem != '')
                                    PIParameter.ParamValue = sourceItem[0].Name;

                                $(id).val(source[0].ParamValue).prop("selected", "selected");
                                $(id).trigger('chosen:updated');
                            }
                        }
                    } else if (Param[l].ValueType.Type == 'ReferenceEnumeration') {
                        var id = '#templateReferenceCombo' + source[0].ParamId;
                        if (source[0].ParamValue != undefined) {
                            if (source[0].ParamId != 0) {

                                var sourceItem = _.where(Param[l].ValueType.ReferenceEnumeration.ReferenceEnumItem, { Value: source[0].ParamValue });
                                if (sourceItem != '')
                                    PIParameter.ParamValue = sourceItem[0].Name;

                                $(id).val(source[0].ParamValue).prop("selected", "selected");
                                $(id).trigger('chosen:updated');
                            }
                        }
                    } else if (Param[l].ValueType.Type == 'String') {
                        var id = '#templateTxt' + source[0].ParamId;
                        $(id).val(source[0].ParamValue);
                        if (Param[l].MaskValue && Param[l].MaskValue.toUpperCase() == 'TRUE') {
                            $(id).val('********');
                        }
                        //Partial masking value based on Length and Direction
                        if (Param[l].PartialMask && Param[l].PartialMask.toUpperCase() == 'TRUE') {
                            var id = '#templateTxt' + source[0].ParamId;
                            $(id).val(source[0].ParamValue);
                            var paramValueLength = source[0].ParamValue ? source[0].ParamValue.length : 0;
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
                    } else if (Param[l].ValueType.Type == 'File') {
                        var id = '#templateFile' + source[0].ParamId;
                        $(id).val(source[0].ParamValue);
                    } else if (Param[l].ValueType.Type == 'Numeric') {
                        var id = '#templateNumeric' + source[0].ParamId;
                        $(id).val(source[0].ParamValue);
                    } else if (Param[l].ValueType.Type == 'DateTime') {

                        var id = '#templateDate' + source[0].ParamId;
                        var Inputid = '#templateInputDate' + source[0].ParamId;
                        var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
                        if (Param[l].ValueType.DateTime && Param[l].ValueType.DateTime.DateFormat) {
                            dateFormat = Param[l].ValueType.DateTime.DateFormat;
                        }
                        var paramValue = source[0].ParamValue;
                        if (paramValue != '') {
                            updateDateTimePicker(id, dateFormat, paramValue);
                        } else {
                            updateDateTimePicker(id, dateFormat, 'today');
                        }
                        $(Inputid).val(paramValue);
                    } else if (Param[l].ValueType.Type == 'Boolean' || Param[l].ValueType.Type == 'CheckBox') {
                        var id = '#templateCheck' + source[0].ParamId;
                        if (source[0].ParamValue == 1) {
                            $(id).prop("checked", true);
                        } else {
                            $(id).prop("checked", false);
                        }
                    }
                } else {
                    PIParameter.SourceType = 'User';
                    PIParameter.ParamValue = Param[l].Default;
                    if (Param[l].ValueType.Type == 'Enumeration') {
                        var sourceItem = _.where(Param[l].ValueType.Enumeration.EnumItem, { Value: Param[l].Default });
                        if (sourceItem != '')
                            PIParameter.ParamValue = sourceItem[0].Name;
                    } else if (Param[l].ValueType.Type == 'ReferenceEnumeration') {
                        var sourceItem = _.where(Param[l].ValueType.ReferenceEnumeration.ReferenceEnumItem, { Value: Param[l].Default });
                        if (sourceItem != '')
                            PIParameter.ParamValue = sourceItem[0].Name;
                    }
                }

                //Include all primary identifiers in collection
                if (Param[l].PrimaryIdentifier == "True") {
                    PIParameter.ParamId = Param[l].ParamId;
                    PIParameter.ParamName = Param[l].Name;
                    PIParameter.TemplateId = 0;
                    PIParameter.IsPrimaryIdentifier = (Param[l].PrimaryIdentifier == "True") ? 1 : 0;
                    PIParameter.PISequence = Param[l].Sequence ? Param[l].Sequence : 0;
                    PIParameter.ParamType = Param[l].ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
                    PIParameter.PackageId = Param[l].ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
                    PIParameter.IncludeInMP = Param[l].IncludeInMP == "True" ? 1 : 0;
                    PIParameter.ValueType = Param[l].ValueType.Type;
                    arrayOfPrimaryIdentifierValue.push(PIParameter);
                }

                if (!isSelectedInstanceisMulti) {

                    var Parameter = new Object();
                    Parameter.ParamId = Param[l].ParamId;
                    Parameter.ParamName = Param[l].Name;
                    Parameter.ParamValue = Param[l].ParamValue;
                    Parameter.TemplateId = 0;
                    Parameter.IsPrimaryIdentifier = (Param[l].PrimaryIdentifier == "True") ? 1 : 0;
                    Parameter.PISequence = Param[l].Sequence ? Param[l].Sequence : 0;
                    Parameter.SourceType = !_.isEmpty(Param[l].SourceType) ? Param[l].SourceType : 'User';
                    if (Param[l].ValueType == "String") {
                        Parameter.ValidChars = Param[l].ValueType.String.ValidChars;
                    }
                    Parameter.ParamType = Param[l].ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
                    Parameter.PackageId = Param[l].ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
                    Parameter.IncludeInMP = Param[l].IncludeInMP == "True" ? 1 : 0;
                    Parameter.ValueType = Param[l].ValueType.Type;
                    var sourceObject = _.where(arrayForSetValue, { ParamId: Param[l].ParamId });
                    if (sourceObject.length > 0) {
                        var index = arrayForSetValue.indexOf(sourceObject[0]);
                        arrayForSetValue[index] = Parameter;
                    } else {
                        arrayForSetValue.push(Parameter);
                    }
                }

            }
        } else {

            for (var l = 0; l < Param.length; l++) {
                var paramValue;
                if (isAddInstance) {
                    paramValue = Param[l].Default;
                    //Include all primary identifiers in collection
                    var PIParameter = new Object();
                    PIParameter.ParamValue = paramValue;
                    PIParameter.SourceType = 'User';
                    if (Param[l].ValueType.Type == 'Enumeration') {
                        if (paramValue != undefined) {
                            if (Param[l].ParamId != 0) {
                                var sourceItem = _.where(Param[l].ValueType.Enumeration.EnumItem, { Value: Param[l].Default });
                                if (sourceItem != '')
                                    PIParameter.ParamValue = sourceItem[0].Name;
                            }
                        }
                    } else if (Param[l].ValueType.Type == 'ReferenceEnumeration') {
                        if (paramValue != undefined) {
                            if (Param[l].ParamId != 0) {
                                var sourceItem = _.where(Param[l].ValueType.ReferenceEnumeration.ReferenceEnumItem, { Value: Param[l].Default });
                                if (sourceItem != '')
                                    PIParameter.ParamValue = sourceItem[0].Name;
                            }
                        }
                    }

                    if (Param[l].PrimaryIdentifier == "True") {
                        PIParameter.ParamId = Param[l].ParamId;
                        PIParameter.ParamName = Param[l].Name;
                        PIParameter.TemplateId = 0;
                        PIParameter.IsPrimaryIdentifier = (Param[l].PrimaryIdentifier == "True") ? 1 : 0;
                        PIParameter.PISequence = Param[l].Sequence ? Param[l].Sequence : 0;
                        PIParameter.ParamType = Param[l].ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
                        PIParameter.PackageId = Param[l].ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
                        PIParameter.IncludeInMP = Param[l].IncludeInMP == "True" ? 1 : 0;
                        PIParameter.ValueType = Param[l].ValueType.Type;

                        if (primaryIdentifierValues && primaryIdentifierValues.length > 0) {
                            for (var m = 0; m < primaryIdentifierValues.length; m++) {
                                var sequence = (m + 1).toLocaleString();
                                var parameter = _.where(Param, { Sequence: sequence });
                                if (parameter != "" || parameter.length > 0) {
                                    if (parameter[0].ParamId == Param[l].ParamId) {
                                        paramValue = primaryIdentifierValues[m];
                                        PIParameter.ParamValue = paramValue;
                                        break;
                                    }
                                }
                            }
                        }

                        var parameter = _.where(arrayOfPrimaryIdentifierValue, { ParamId: Param[l].ParamId });
                        if (parameter.length > 0) {
                            arrayOfPrimaryIdentifierValue = jQuery.grep(arrayOfPrimaryIdentifierValue, function (value) {
                                var index = arrayOfPrimaryIdentifierValue.indexOf(parameter[0]);
                                return (value != arrayOfPrimaryIdentifierValue[index] && value != null);
                            });
                        }
                        arrayOfPrimaryIdentifierValue.push(PIParameter);
                    }

                    if (!isSelectedInstanceisMulti) {
                        var Parameter = new Object();
                        Parameter.ParamId = Param[l].ParamId;
                        Parameter.ParamName = Param[l].Name;
                        Parameter.ParamValue = paramValue;
                        Parameter.TemplateId = 0;
                        Parameter.IsPrimaryIdentifier = (Param[l].PrimaryIdentifier == "True") ? 1 : 0;
                        Parameter.PISequence = Param[l].Sequence ? Param[l].Sequence : 0;
                        Parameter.SourceType = !_.isEmpty(Param[l].SourceType) ? Param[l].SourceType : 'User';
                        if (Param[l].ValueType == "String") {
                            Parameter.ValidChars = Param[l].ValueType.String.ValidChars;
                        }
                        Parameter.ParamType = Param[l].ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
                        Parameter.PackageId = Param[l].ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
                        Parameter.IncludeInMP = Param[l].IncludeInMP == "True" ? 1 : 0;
                        Parameter.ValueType = Param[l].ValueType.Type;

                        var source = _.where(arrayForSetValue, { ParamId: Param[l].ParamId });
                        if (source.length > 0) {
                            var index = arrayForSetValue.indexOf(source[0]);
                            arrayForSetValue[index] = Parameter;
                        } else {
                            arrayForSetValue.push(Parameter);
                        }
                    }
                } else {
                    paramValue = Param[l].ParamValue;
                }
                if (Param[l].ValueType.Type == 'String') {
                    var id = '#templateTxt' + Param[l].ParamId;
                    $(id).val(paramValue);
                    if (Param[l].MaskValue && Param[l].MaskValue.toUpperCase() == 'TRUE') {
                        $(id).val('********');
                    }
                    //Partial masking value based on Length and Direction
                    if (Param[l].PartialMask && Param[l].PartialMask.toUpperCase() == 'TRUE') {
                        var id = '#templateTxt' + Param[l].ParamId;
                        $(id).val(Param[l].ParamValue);
                        var paramValueLength = Param[l].ParamValue ? Param[l].ParamValue.length : 0;
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
                } else if (Param[l].ValueType.Type == 'File') {
                    var id = '#templateFile' + Param[l].ParamId;
                    if (paramValue == "") {
                        paramValue = 0;
                    }
                    $(id).val(paramValue);
                } else if (Param[l].ValueType.Type == 'Numeric') {
                    if (paramValue == "") {
                        paramValue = 0;
                    }
                    var id = '#templateNumeric' + Param[l].ParamId;
                    if (paramValue != undefined) {
                        $(id).val(paramValue);
                    }

                } else if (Param[l].ValueType.Type == 'Boolean' || Param[l].ValueType.Type == 'CheckBox') {
                    var id = '#templateCheck' + Param[l].ParamId;
                    if (paramValue != undefined) {
                        if (paramValue == 1) {
                            $(id).prop("checked", true);
                        } else {
                            $(id).prop("checked", false);
                        }
                    }
                } else if (Param[l].ValueType.Type == 'Enumeration') {
                    var id = '#templateCombo' + Param[l].ParamId;
                    if (paramValue != undefined) {
                        if (Param[l].ParamId != 0) {
                            if (paramValue == "") {
                                paramValue = 0;
                            }
                            $(id).val(paramValue).prop("selected", "selected");
                            $(id).trigger('chosen:updated');
                        }
                    }
                } else if (Param[l].ValueType.Type == 'ReferenceEnumeration') {
                    var id = '#templateReferenceCombo' + Param[l].ParamId;
                    if (paramValue != undefined) {
                        if (Param[l].ParamId != 0) {
                            if (paramValue == "") {
                                paramValue = 0;
                            }
                            $(id).val(paramValue).prop("selected", "selected");
                            $(id).trigger('chosen:updated');
                        }
                    }
                } else if (Param[l].ValueType.Type == 'DateTime') {
                    var id = '#templateDate' + Param[l].ParamId;
                    var Inputid = '#templateInputDate' + Param[l].ParamId;
                    var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
                    if (Param[l].ValueType.DateTime && Param[l].ValueType.DateTime.DateFormat) {
                        dateFormat = Param[l].ValueType.DateTime.DateFormat;
                    }
                    if (paramValue != undefined && paramValue != '') {
                        $(Inputid).val(paramValue)
                        updateDateTimePicker(id, dateFormat, paramValue)
                    } else {
                        updateDateTimePicker(id, dateFormat, '')
                    }
                }
            }

        }
    }

    function assignParamValueToGrid(gID, Param, paramAPI) {
        var gridColumnArr = new Array();
        var sourceDataFieldsArr = [];

        for (i = 0; i < Param.length; i++) {
            var columnObj = new Object();
            columnObj.text = Param[i].DisplayName;
            columnObj.datafield = 'Col' + Param[i].ParamId;
            columnObj.minwidth = 150;
            columnObj.editable = false;
            columnObj.sortable = false;
            columnObj.enabletooltips = true;
            columnObj.hidden = false;

            gridColumnArr.push(columnObj);
        }

        var gridStorageArr = new Array();
        var gridStorageObj = new Object();
        gridStorageObj.checkAllFlag = 0;
        gridStorageObj.counter = 0;
        gridStorageObj.filterflage = 0;
        gridStorageObj.selectedDataArr = [];
        gridStorageObj.unSelectedDataArr = [];
        gridStorageObj.singlerowData = [];
        gridStorageObj.multiRowData = [];
        gridStorageObj.TotalSelectionCount = null;
        gridStorageObj.highlightedRow = null;
        gridStorageObj.highlightedPage = null;
        gridStorageObj.dataFields = sourceDataFieldsArr;
        gridStorageArr.push(gridStorageObj);
        var gridStorage = JSON.stringify(gridStorageArr);
        window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
        var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

        var source =
        {
            dataType: "json",
            dataFields: gridStorage[0].dataFields,
            root: 'InstanceDetails',
            type: "POST",
            data: paramAPI,
            url: AppConstants.get('API_URL') + "/GetDeviceAppLevelInstances",
            contentType: 'application/json'
        };

        var request = {
                formatData: function (data) {
                    $('.all-disabled').show();
                    //disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    data = JSON.stringify(paramAPI);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    $('.all-disabled').hide();
                    //enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    if (data && data.getDeviceAppLevelInstancesResp) {
                        data.getDeviceAppLevelInstancesResp = $.parseJSON(data.getDeviceAppLevelInstancesResp);
                    }

                    if (data.getDeviceAppLevelInstancesResp) {


                        if (data.getDeviceAppLevelInstancesResp.Instances != null && data.getDeviceAppLevelInstancesResp.Instances.length > 0) {
                            if (koUtil.selectedInstance()) {
                                koUtil.selectedInstance().dropdownCol(data.getDeviceAppLevelInstancesResp.Instances);
                            }
                        } else {
                            if (koUtil.selectedInstance()) {
                                //koUtil.selectedInstance().dropdownCol([]);
                            }
                        }

                        data.getDeviceAppLevelInstancesResp.InstanceDetails = $.parseJSON(data.getDeviceAppLevelInstancesResp.InstanceDetails);
                        if (data.getDeviceAppLevelInstancesResp.InstanceDetails && data.getDeviceAppLevelInstancesResp.InstanceDetails.length > 0) {
                            sourceDataFieldsArr = [];

                            var instanceObj = data.getDeviceAppLevelInstancesResp.InstanceDetails[0];
                            var instanceArray = new Array();
                            for (var attr in instanceObj) {
                                var fieldObj = new Object();
                                fieldObj.map = fieldObj.name = attr;
                                sourceDataFieldsArr.push(fieldObj);
                            }


                            var instancedetails = data.getDeviceAppLevelInstancesResp.InstanceDetails;
                            var instances = data.getDeviceAppLevelInstancesResp.Instances;
                            for (var i = 0; i < instancedetails.length; i++) {
                                var sourceInstance = _.where(instances, { InstanceId: instancedetails[i].InstanceId });
                                if (sourceInstance.length > 0) {
                                    instancedetails[i].Name = sourceInstance[0].Name;
                                }
                            }
                            data.getDeviceAppLevelInstancesResp.InstanceDetails = instancedetails;
                            var fieldObj = new Object();
                            fieldObj.map = fieldObj.name = "Name";
                            sourceDataFieldsArr.push(fieldObj);
                            source.dataFields = sourceDataFieldsArr;
                        } else {
                            data.getDeviceAppLevelInstancesResp.InstanceDetails = [];
                        }
                    }
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                }

            }
        var dataAdapter = intializeDataAdapter(source, request);
        var gridColumns = [];
        gridColumns = gridColumnArr;

        gridStorage[0].columnsArr = gridColumns;

        $("#" + gID).jqxGrid(
            {

                width: "100%",
                pageable: false,
                editable: false,
                source: dataAdapter,
                columnsResize: true,
                selectionmode: 'checkbox',
                theme: AppConstants.get('JQX-GRID-THEME'),
                rowsheight: 32,
                columns: gridColumns
            });
    }

    function getParamForDeviceAppLevelInstances() {
        var getDeviceAppLevelInstancesReq = new Object();
        var Selector = new Object();
        getDeviceAppLevelInstancesReq.ApplicationId = koUtil.getEditDeviceProfile.ApplicationId;
        getDeviceAppLevelInstancesReq.FormFileId = koUtil.selectedlevelFormFileId;
        getDeviceAppLevelInstancesReq.Level = koUtil.selectedLevel;
        getDeviceAppLevelInstancesReq.InstanceSourceId = koUtil.selectedLevel > 1 ? koUtil.selectedlevelParentInstanceSourceId : 0;
        getDeviceAppLevelInstancesReq.InstanceId = koUtil.selectedLevel > 1 ? koUtil.selectedlevelParentInstanceId : 0;
        getDeviceAppLevelInstancesReq.IsFromDeviceSearch = false;
        getDeviceAppLevelInstancesReq.InstanceDetails = koUtil.selectedInstanceLevelDetails;
        getDeviceAppLevelInstancesReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        getDeviceAppLevelInstancesReq.DeviceSearch = null;
        getDeviceAppLevelInstancesReq.ColumnSortFilter = null;
        Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
        Selector.UnSelectedItemIds = null;
        getDeviceAppLevelInstancesReq.Selector = Selector;
        getDeviceAppLevelInstancesReq.ContainerId = koUtil.selectedlevelContainerId;

        var param = new Object();
        param.token = TOKEN();
        param.getDeviceAppLevelInstancesReq = getDeviceAppLevelInstancesReq;
        return param;
    }

    function getParamForDeleteDeviceAppLevelInstances(arrayInstances, InstanceDetails) {
        var deleteDeviceAppLevelInstancesReq = new Object();
        var Selector = new Object();

        deleteDeviceAppLevelInstancesReq.ApplicationId = koUtil.getEditDeviceProfile.ApplicationId;
        deleteDeviceAppLevelInstancesReq.Level = koUtil.selectedLevel;
        deleteDeviceAppLevelInstancesReq.IsFromDeviceSearch = false;

        var arrayInstanceIds = new Array();
        var arrayInstanceNames = new Array();
        if (arrayInstances != undefined && arrayInstances.length > 0) {
            for (var i = 0; i < arrayInstances.length; i++) {
                arrayInstanceIds.push(arrayInstances[i].InstanceId);
                arrayInstanceNames.push(arrayInstances[i].Name);

            }
        }
        deleteDeviceAppLevelInstancesReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        deleteDeviceAppLevelInstancesReq.DeviceSearch = null;
        deleteDeviceAppLevelInstancesReq.ColumnSortFilter = null;
        deleteDeviceAppLevelInstancesReq.InstanceIds = arrayInstanceIds;
        deleteDeviceAppLevelInstancesReq.InstanceDetails = InstanceDetails;
        Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
        Selector.UnSelectedItemIds = null;

        deleteDeviceAppLevelInstancesReq.Selector = Selector;

        var param = new Object();
        param.token = TOKEN();
        param.deleteDeviceAppLevelInstancesReq = deleteDeviceAppLevelInstancesReq;
        return param;
    }

});

/////
function editparamValue() {
    $("#editParamValue").modal("show")
}
