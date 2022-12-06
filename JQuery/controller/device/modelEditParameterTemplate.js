var applicationGlobalId;
var applicationGlobalName;
tampletFileForEdit = '';
var isEditParamEnable = false;
var isActivationParamEnable = false;
var isRestoreTemplate = false;
var isDeviceModifyAllowed = false;
define(["knockout", "autho", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, autho, ADSearchUtil, koUtil) {
    var lang = getSysLang();

    return function fileNameOnDeviceViewModel() {

        var self = this;
        //$("#modelEditparamTemp").draggable();

        $("#btn_ParameterTemplate").addClass('disabled');

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }


        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#activateParameterId').on('shown.bs.modal', function (e) {
            $('#activateParameterId_NoBtn').focus();

        });
        $('#activateParameterId').keydown(function (e) {
            if ($('#activateParameterId_NoBtn').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#activateParameterId_YesBtn').focus();
            }
        });

        $('#restoreDefaultId').on('shown.bs.modal', function (e) {
            $('#restoreDefaultId_NoBtn').focus();

        });
        $('#restoreDefaultId').keydown(function (e) {
            if ($('#restoreDefaultId_NoBtn').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#restoreDefaultId_YesBtn').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------

        $('#modelEditparamTempHeader').mouseup(function () {
            $("#modelEditparamTemp").draggable({ disabled: true });
        });

        $('#modelEditparamTempHeader').mousedown(function () {
            $("#modelEditparamTemp").draggable({ disabled: false });
        });



        self.templateFlag = ko.observable(false);
        self.parameterObservableModel = ko.observable();

        $("#commonApplicationId").hide();


        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        modelReposition();
        self.openPopup = function (popupName) {
            self.templateFlag(true);
            if (popupName == "modelGetDeviceParameterTemplates") {
                loadelement(popupName, 'device');
                $('#modelDeviceParameterId').modal('show');
            } else if (popupName == "modelDeviceSearchEditParameter") {
                koUtil.viewParameterTemplateOnDevice = false;
                loadelement(popupName, 'device');
                $('#modelDeviceParameterId').modal('show');
            } else if (popupName == "modelDeviceProfileEditParameterVPDX") {
                loadelement(popupName, 'device');
                $('#modelDeviceParameterId').modal('show')
            } else if (popupName == "modelGlobalUpdateParameterMultiInstance") {
                loadelement(popupName, 'device');
                $('#modelDeviceParameterId').modal('show')
            } else if (popupName == "modelDeviceEditParameters") {
                loadelement(popupName, 'device');
                $('#modelDeviceParameterId').modal('show')
            }

        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.parameterObservableModel(elementname);
        }

        function generateTemplate(tempname, controllerId) {
            //new template code
            var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
            var viewName = 'controller/' + controllerId + '/' + tempname + '.js';
            ko.components.register(tempname, {
                viewModel: { require: viewName },
                template: { require: 'plugin/text!' + htmlName }
            });
            // end new template code
        }


        //unload template
        self.unloadTempPopup = function (popupName) {
            self.parameterObservableModel('unloadTemplate');
            $('#modelDeviceParameterId').modal('hide');
            // $("#mainPageBody").removeClass('modal-open-appendon');
        };

        self.applicationData = ko.observableArray();

        //------activate parameter API call------------
        self.activateParameterClicked = function (gID) {
            setActiveParameterDetails(gID, 'jqxgridForEditParameterTemplate', ADSearchUtil.deviceSearchObj, koUtil);
        }

        //------- hide activate parameter confirmation popup--------
        self.closeActivateParamerte = function () {
            $("#activateParameterId").modal('hide');
            var msg = "";
            $("#activateMesgId").text(msg);
        }

        //-----Restore defualt API call------------
        self.restoreDefaultClicked = function (gID) {
            setRestoreParameterToDefault(gID, 'jqxgridForEditParameterTemplate', ADSearchUtil.deviceSearchObj, koUtil);
        }

        //-----hide pop, click on NO button------
        self.closeRestoreDefualtPopup = function () {
            $("#restoreDefaultId").modal('hide');
            var msgRestore = "";
            $("#restoreDefMsgId").text(msgRestore);
        }

        checkRights();
        //--------- get parameter application data for particular device---------------
        function checkRights() {
            var retvalForAdvParam = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsModifyAllowed');
            var retvalForBasicParam = autho.checkRightsBYScreen('Basic Parameter Management', 'IsModifyAllowed');
            var retvalForActivationParam = autho.checkRightsBYScreen('Activation', 'IsModifyAllowed');
            var retvalForDevices = autho.checkRightsBYScreen('Devices', 'IsModifyAllowed');

            isDeviceModifyAllowed = retvalForDevices;

            //Edit Parameter
            if (retvalForDevices == true && (retvalForAdvParam == true || retvalForBasicParam == true)) {
                isEditParamEnable = true;
            } else {
                isEditParamEnable = false;
            }

            //Activate Parameter
            if (retvalForDevices && retvalForActivationParam) {
                isActivationParamEnable = true;
                koUtil.isActivationParamEnable(true);
            } else {
                isActivationParamEnable = false;
                koUtil.isActivationParamEnable(false);
            }

            //Restore Template
            if (retvalForDevices && (retvalForBasicParam || retvalForAdvParam)) {
                isRestoreTemplate = true;
            } else {
                isRestoreTemplate = false;
            }
        }

        getParameterApplicationForDevice(self.applicationData, 'Devicejqxgrid', self.openPopup);
        seti18nResourceData(document, resourceStorage);
    };

    //-----display grid--------
    function jqxgridForEditParameter(applicationData, gID, openPopup) {


        var source =
        {
            dataType: "json",
            localdata: applicationData,
            datafields: [
                { name: 'ApplicationId', map: 'ApplicationId' },
                { name: 'ApplicationName', map: 'ApplicationName' },
                { name: 'FormFile', map: 'FormFile' },
                { name: 'ApplicationVersion', map: 'ApplicationVersion' },
                { name: 'IsParameterizationEnabled', map: 'IsParameterizationEnabled' },
                { name: 'IsPFXExist', map: 'IsPFXExist' },
                { name: 'IsPDXExist', map: 'IsPDXExist' },
                { name: 'IsTemplateExist', map: 'IsTemplateExist' },
                { name: 'IsPartialUnSync', map: 'IsPartialUnSync' },
                { name: 'IsTemplateAssigned', map: 'IsTemplateAssigned' },
                { name: 'IsMultiVPFXSupported', map: 'IsMultiVPFXSupported' },

            ],

        };

        var dataAdapter = new $.jqx.dataAdapter(source);

        $("#" + gID).jqxGrid(
            {
                width: "100%",
                source: dataAdapter,
                sortable: true,
                filterable: false,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                virtualmode: true,
                altrows: true,
                autoshowcolumnsmenubutton: false,
                showsortmenuitems: false,
                editable: true,
                enabletooltips: true,
                rowsheight: 32,
                columnsResize: true,
                rendergridrows: function () {
                    return dataAdapter.records;
                },
                columns: [
                    { text: '', datafield: 'ApplicationId', hidden: true, width: 'auto' },
                    {
                        text: i18n.t('applications', { lng: lang }), datafield: 'ApplicationName', menu: false, width: 380, minwidth: 180, editable: false, align: 'left', renderer: function (text, align) {
                            return '<div style="margin-top: 20px; margin-left: 8px; text-align: ' + align + ';">' + text + '</div>';
                        }
                    },
                    {
                        text: i18n.t('versions_parameter', { lng: lang }), datafield: 'ApplicationVersion', menu: false, minwidth: 120, width: 200, editable: false, align: 'left', renderer: function (text, align) {
                            return '<div style="margin-top: 20px; margin-left: 8px; text-align: ' + align + ';">' + text + '</div>';
                        }
                    },
                    {
                        text: '', datafield: 'Edit', columngroup: 'Description', menu: false, sortable: false, enabletooltips: false, minwidth: 70, width: 'auto', resizable: false, editable: false, columntype: 'number', cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
                            if (!_.isEmpty(rowData)) {
                                if (rowData.ApplicationId <= 0)
                                    return '';

                                var parameterizeEnabled = rowData.IsParameterizationEnabled;
                                var isPFXExistFlag = rowData.IsPFXExist;
                                var isPDXExistFlag = rowData.IsPDXExist;

                                var editToolipMessage = i18n.t('edit_parameters_device', { lng: lang });

                                //-------------- Edit Parametres----------------
                                if (parameterizeEnabled && isPFXExistFlag && isEditParamEnable) {
                                    return '<div class="btn btn-xs btn-default" id="editTemplateId" style="margin-top:4px;cursor:pointer;margin-left:15px;padding:2px 5px !important;" title="' + editToolipMessage + '"><i class="icon-pencil"></i><a id="imageId" style="margin-left:5px;" height="60" width="50" >Edit</a></div>'
                                } else {
                                    return '<div class="btn btn-xs btn-default disabled"  disabled="true" id="editTemplateId" style="margin-top:4px;cursor:default;margin-left:15px;padding:2px 5px !important;" title="' + editToolipMessage + '"><i class="icon-pencil"></i><a id="imageId" style="margin-left:5px;cursor:default"  height="60" width="50" >Edit</a></div>'

                                }
                            }
                        }
                    },
                    {
                        text: '', datafield: 'Activate', columngroup: 'Description', menu: false, sortable: false, minwidth: 85, width: 'auto', enabletooltips: false, resizable: false, editable: false,
                        columntype: 'number', cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (!isDirectParameterActivation) {
                                var rowData = $("#" + gID).jqxGrid('getrowdata', row);
                                if (!_.isEmpty(rowData)) {
                                    if (rowData.ApplicationId <= 0)
                                        return '';
                                    
                                    var isPFXExistFlag = rowData.IsPFXExist;
                                    var isPartialUnSync = rowData.IsPartialUnSync;

                                    var activateToolipMessage = i18n.t('activate_edited_parameters_device', { lng: lang });

                                    //-------------- Activate Parameters----------------
                                    //JIRA Bug Fix 4507
                                    if (isPFXExistFlag && isActivationParamEnable) {
                                        return '<div class="btn btn-xs btn-default" id="ActivateId" style="margin-top:4px;cursor:pointer;margin-left:5px;padding:2px 5px !important;" title="' + activateToolipMessage + '"><i class="icon-checkmark ienable"></i><a id="imageId"  style="margin-left:5px;" onClick="modelPopUpForActivateParameter(' + row + ')" height="60" width="50" >Activate</a></div>'
                                    } else {
                                        return '<div class="btn btn-xs btn-default disabled" id="ActivateId" style="margin-top:4px;cursor:default;margin-left:5px;padding:2px 5px !important;" title="' + activateToolipMessage + '"><i class="icon-checkmark ienable"></i><a id="imageId"  style="margin-left:5px;" onClick="modelPopUpForActivateParameter(' + row + ')" height="60" width="50" >Activate</a></div>'
                                    }
                                }
                            }
                            else {
                                $("#" + gID).jqxGrid('hidecolumn', 'Activate');
                                return '';
                            }
                        }
                    },
                    {
                        text: '', datafield: 'RestoreDefault', columngroup: 'Description', menu: false, sortable: false, width: 130, enabletooltips: false, resizable: false, editable: false, columntype: 'number', cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
                            if (!_.isEmpty(rowData)) {
                                if (rowData.ApplicationId <= 0)
                                    return '';

                                var isPFXExistFlag = rowData.IsPFXExist;
                                var isPDXExistFlag = rowData.IsPDXExist;
                                var parameterizeEnabled = rowData.IsParameterizationEnabled;

                                var restoreDefualtToolipMessage = i18n.t('restore_all_to_default', { lng: lang });

                                //-------------- Restore Default----------------
                                if (parameterizeEnabled && isPFXExistFlag && isDeviceModifyAllowed) {
                                    return '<div class="btn btn-xs btn-default" style="margin-top:4px;cursor:pointer;margin-left:5px;padding:2px 5px !important;" title="' + restoreDefualtToolipMessage + '"><i class="icon-restoredefault" style="color:#00aeef"></i><a id="imageId"  style="margin-left:5px;" onClick="restoreToDefault(' + row + ')" height="60" width="50" >Restore Default</a></div>'
                                } else {
                                    return '<div class="btn btn-xs btn-default disabled" style="margin-top:4px;cursor:default;margin-left:5px;padding:2px 5px !important;" title="' + restoreDefualtToolipMessage + '"><i class="icon-restoredefault" style="color:#00aeef"></i><a id="imageId"  style="margin-left:5px;" onClick="restoreToDefault(' + row + ')" height="60" width="50" >Restore Default</a></div>'
                                }
                            }
                        }
                    },
                ],
                columngroups:
                    [
                        {
                            text: i18n.t('Parameter_actions', { lng: lang }), datafield: 'Description', menu: false, sortable: false, enabletooltips: false, width: 'auto', resizable: false, minwidth: 485, editable: false, name: 'Description', align: 'left', renderer: function (text, align) {
                                return '<div style="margin-top: 8px; margin-left: 8px; text-align: ' + align + ';">' + text + '</div>';
                            }}
                    ]
            });

        $("#" + gID).on("cellclick", function (event) {
            var column = event.args.column;
            var rowindex = event.args.rowindex;
            var columnindex = event.args.columnindex;

            var rowData = $("#" + gID).jqxGrid('getrowdata', rowindex);
            var parameterizeEnabled = rowData.IsParameterizationEnabled;
            var isPFXExistFlag = rowData.IsPFXExist;

            if (columnindex == 3) {
                if ((parameterizeEnabled == true) && (isPFXExistFlag == true) && isEditParamEnable == true) {
                    if (isPFXExistFlag == false) {
                        openPopup('modelDeviceProfileEditParameterVPDX');
                    } else {
                        var applicationId = rowData ? rowData.ApplicationId : 0;
                        getDeviceFormFiles(applicationId, openPopup);
                    }

                    koUtil.getEditDeviceProfile = rowData;
                }
            }

        });

        //---restore grid css properties------
        restoreGridStyle();
    }

    function getDeviceFormFiles(applicationId, openPopup) {
        var getDeviceFormFileReq = new Object();
        var Selector = new Object();

        getDeviceFormFileReq.ApplicationId = applicationId;
        getDeviceFormFileReq.Protocol = koUtil.Protocol;
        getDeviceFormFileReq.IsFromDeviceSearch = true;
        getDeviceFormFileReq.UniqueDeviceId = 0;
        getDeviceFormFileReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
        getDeviceFormFileReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
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

        getDeviceFormFileReq.Selector = Selector;

        console.log(getDeviceFormFileReq);

        function callbackFunction(data, error) {
            if (data) {
                $("#loadingDiv").hide();
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                    console.log(data.getDeviceFormFileResp);

                    if (data.getDeviceFormFileResp && data.getDeviceFormFileResp.ParameterFormFiles && data.getDeviceFormFileResp.ParameterFormFiles.length > 0) {
                        getDeviceFormFileResponse = data.getDeviceFormFileResp;

                        DeviceParamAppGID = data.getDeviceFormFileResp.AppGID;
                        koUtil.editDevicetemplateXML = data.getDeviceFormFileResp.ParameterFormFiles[0].FormFileXML;

                        var treeObject;
                        var temptreeColl = new Array();

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
                                treeObject.parentInstanceId = 0;
                                treeObject.parentInstanceName = '';
                                treeObject.selectedInstanceName = '';

                                var treeNode = buildMultiInstanceTree(data.getDeviceFormFileResp.ParameterFormFiles, treeObject.Level, treeObject.ParentLevel, treeObject.FormFileXML);
                                data.getDeviceFormFileResp.ParameterFormFiles[i].isLevelAccess = treeNode.isLevelAccess;
                                treeObject.isLevelAccess = treeNode.isLevelAccess;
                                if (!treeNode.isParentLevelAccess)
                                    break;
                                if (treeNode.isLevelAccess)
                                    temptreeColl.push(treeObject);

                            }
                        }

                        if (temptreeColl.length > 0) {
                            getDeviceFormFileResponse.temptreeColl = temptreeColl;
                            openPopup('modelDeviceSearchEditParameter');
                        } else {
                            openAlertpopup(1, 'you_do_not_have_access_to_the_parent_level');
                        }
                    }
                }
            }
        }
        $("#loadingDiv").show();
        var method = 'GetDeviceFormFile';
        var params = '{"token":"' + TOKEN() + '","getDeviceFormFileReq":' + JSON.stringify(getDeviceFormFileReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getParameterApplicationForDevice(applicationData, gID, openPopup) {

        var getParameterApplicationsForDeviceSearchReq = new Object();
        var selector = new Object();

        var selectedDeviceSearchItems = getSelectedUniqueId(gID);
        var unselectedDeviceSearchItems = getUnSelectedUniqueId(gID);
        var checkAll = checkAllSelected(gID);
        var isFromDeviceProfile = false;

        if (checkAll == 1) {
            getParameterApplicationsForDeviceSearchReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
            selector.SelectedItemIds = null;
            selector.UnSelectedItemIds = unselectedDeviceSearchItems;
        } else {
            getParameterApplicationsForDeviceSearchReq.DeviceSearch = null;//ADSearchUtil.deviceSearchObj 
            selector.SelectedItemIds = selectedDeviceSearchItems;
            selector.UnSelectedItemIds = null;
        }
        //getParameterApplicationsReq.IsFromDeviceProfile = false;
        getParameterApplicationsForDeviceSearchReq.Selector = selector;
        getParameterApplicationsForDeviceSearchReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
        getParameterApplicationsForDeviceSearchReq.Export = new Object();

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.getParameterApplicationsForDeviceSearchResp) {
                        data.getParameterApplicationsForDeviceSearchResp = $.parseJSON(data.getParameterApplicationsForDeviceSearchResp);
                        applicationData(data.getParameterApplicationsForDeviceSearchResp.Applications);
                        jqxgridForEditParameter(applicationData(), 'jqxgridForEditParameterTemplate', openPopup);
                    } else {
                        if (selectedDeviceSearchItems.length > 1) {
                            $("#commonApplicationId").show();
                            $("#showPrameterMessageId").text(i18n.t('no_common_applications_found', { lng: lang }));
                        } else {
                            jqxgridForEditParameter([], 'jqxgridForEditParameterTemplate', openPopup);

                            //$("#commonApplicationId").show();
                            //$("#showPrameterMessageId").text(i18n.t('no_parameters_defined', { lng: lang }));
                        }
                    }

                } else if (data.responseStatus.StatusCode == AppConstants.get('POPULATION_OF_THE_APPLICATION_PARAMETERS_IN_PROGRESS')) {
                    //openAlertpopup(1, 'Population_of_the_application_parameters_in_progress');
                    $("#commonApplicationId").show();
                    $("#showPrameterMessageId").text(i18n.t('Population_of_the_application_parameters_in_progress', { lng: lang }));
                } else if (data.responseStatus.StatusCode == AppConstants.get('E_NO_DEVICES_QUALIFIED')) {
                    openAlertpopup(1, 'e_no_devices_qualified');
                }
            }
        }

        var method = 'GetParameterApplicationsForDeviceSearch';
        var params = '{"token":"' + TOKEN() + '","getParameterApplicationsForDeviceSearchReq":' + JSON.stringify(getParameterApplicationsForDeviceSearchReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }


});

//------open confirmation popup for activate parametre----------------
function modelPopUpForActivateParameter(row) {
    var rowData = $('#jqxgridForEditParameterTemplate').jqxGrid('getrowdata', row);
    var applicationName = rowData.ApplicationName;
    applicationGlobalId = rowData.ApplicationId;

    //----open confirmation popup----
    $("#activateParameterId").modal('show');
    var msg = i18n.t('are_you_sure_you_want_to_activate_parameters_of', { lng: lang }) + " " + applicationName + " " + "?";
    $("#activateMesgId").text(msg);
}

//---------set active parameter details-----------
function setActiveParameterDetails(gID, gridId, deviceSearchObj, koUtil) {

    var setDeviceParametersReq = new Object();
    var selector = new Object();
    var selectedDeviceSearchItems = getSelectedUniqueId(gID);
    var unselectedDeviceSearchItems = getUnSelectedUniqueId(gID);
    var checkAll = checkAllSelected(gID);
    if (checkAll == 1) {
        setDeviceParametersReq.DeviceSearch = deviceSearchObj;
        selector.SelectedItemIds = null;
        selector.UnSelectedItemIds = unselectedDeviceSearchItems;
    } else {
        setDeviceParametersReq.DeviceSearch = null;
        selector.SelectedItemIds = selectedDeviceSearchItems;
        selector.UnSelectedItemIds = null;
    }
    setDeviceParametersReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
    setDeviceParametersReq.ActionMode = ENUM.get('ACTION_MODE_ACTIVATE');
    setDeviceParametersReq.ApplicationId = applicationGlobalId;
    setDeviceParametersReq.ParamList = null;
    setDeviceParametersReq.Selector = selector;
    setDeviceParametersReq.IsFromDeviceSearch = !koUtil.isDeviceProfile();
    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                $("#activateParameterId").modal('hide');
                openAlertpopup(0, 'parameters_successfully_activated');
                clearUiGridFilter(gridId);
                $("#" + gridId).jqxGrid('clearselection');
                //---restore grid css properties------
                restoreGridStyle();
            } else if (data.responseStatus.StatusCode == AppConstants.get('Invalid_Param_Value')) {
                openAlertpopup(2, 'Invalid_Param_Value');
            } else if (data.responseStatus.StatusCode == AppConstants.get('E_NO_PARAMETER_UPDATED')) {
                openAlertpopup(1, 'param_values_not_updated');
            } else if (data.responseStatus.StatusCode == AppConstants.get('E_INVALID_REQUEST')) {
                $("#invalidSearchPopup").modal('show');
            }
        }
    }

    var method = 'SetDeviceParameters';
    var params = '{"token":"' + TOKEN() + '","setDeviceParametersReq":' + JSON.stringify(setDeviceParametersReq) + '}';
    ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

//----------restore to default--------------------
function restoreToDefault(row) {
    var rowData = $('#jqxgridForEditParameterTemplate').jqxGrid('getrowdata', row);
    applicationGlobalName = rowData.ApplicationName;
    applicationGlobalId = rowData.ApplicationId;

    //----open confirmation popup----
    $("#restoreDefaultId").modal('show');
    var msgRestore = i18n.t('are_you_sure_you_want_to_restore_the_values_of_parameters_of', { lng: lang }) + " " + applicationGlobalName + " " + i18n.t('to_default', { lng: lang });
    $("#restoreDefMsgId").text(msgRestore);
}

//-----restore parameter to defualt-----------------
function setRestoreParameterToDefault(gID, gridId, deviceSearchObj, koUtil) {

    var restoreAllDeviceParametersReq = new Object();
    var applicationDetails = new Object();
    var selector = new Object();

    applicationDetails.ApplicationId = applicationGlobalId;
    applicationDetails.ApplicationName = applicationGlobalName;

    var selectedDeviceSearchItems = getSelectedUniqueId(gID);
    var unselectedDeviceSearchItems = getUnSelectedUniqueId(gID);
    var checkAll = checkAllSelected(gID);

    if (checkAll == 1) {
        restoreAllDeviceParametersReq.DeviceSearch = deviceSearchObj;
        selector.SelectedItemIds = null;
        selector.UnSelectedItemIds = unselectedDeviceSearchItems;
    } else {
        restoreAllDeviceParametersReq.DeviceSearch = null;
        selector.SelectedItemIds = selectedDeviceSearchItems;
        selector.UnSelectedItemIds = null;
    }

    restoreAllDeviceParametersReq.ApplicationDetails = applicationDetails;
    restoreAllDeviceParametersReq.Selector = selector;
    restoreAllDeviceParametersReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                $("#restoreDefaultId").modal('hide');
                openAlertpopup(0, 'Parameter_values_restore_success');
                clearUiGridFilter(gridId);
                $("#" + gridId).jqxGrid('clearselection');
                //---restore grid css properties------
                restoreGridStyle();
            }
        }
    }

    var method = 'RestoreAllDeviceParameters';
    var params = '{"token":"' + TOKEN() + '","restoreAllDeviceParametersReq":' + JSON.stringify(restoreAllDeviceParametersReq) + '}';
    ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

function restoreGridStyle() {

    $("#columntablejqxgridForEditParameterTemplate .jqx-grid-column-header:eq(1)").css({ "top": "-13px" });
    $("#columntablejqxgridForEditParameterTemplate .jqx-grid-column-header:eq(2)").css({ "top": "-13px" });
    $("#columntablejqxgridForEditParameterTemplate .jqx-grid-column-header:eq(3)").css({ "top": "-13px" });

    $("#columntablejqxgridForEditParameterTemplate .jqx-grid-columngroup-header").css({ "border-bottom-style": "none" });

    $("#columntablejqxgridForEditParameterTemplate .jqx-grid-column-header:eq(4)").css({ "bottom": "auto" });
    $("#columntablejqxgridForEditParameterTemplate .jqx-grid-column-header:eq(5)").css({ "bottom": "auto" });
    $("#columntablejqxgridForEditParameterTemplate .jqx-grid-column-header:eq(6)").css({ "bottom": "auto" });
    $("#columntablejqxgridForEditParameterTemplate .jqx-grid-column-header:eq(7)").css({ "bottom": "auto" });

    $("#columntablejqxgridForEditParameterTemplate .sortasc:eq(1)").css({ "margin-top": "3px" });
    $("#columntablejqxgridForEditParameterTemplate .sortdesc:eq(1)").css({ "margin-top": "3px" });
    $("#columntablejqxgridForEditParameterTemplate .sortasc:eq(2)").css({ "margin-top": "3px" });
    $("#columntablejqxgridForEditParameterTemplate .sortdesc:eq(2)").css({ "margin-top": "3px" });

    $("#columntablejqxgridForEditParameterTemplate .jqx-grid-column-sortascbutton").css({ "margin-left": "14px" });
    $("#columntablejqxgridForEditParameterTemplate .jqx-grid-column-sortdescbutton").css({ "margin-left": "14px" });

}

