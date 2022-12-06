var getDeviceParameterArr = new Array();
var selectedRowArrayForSwap = new Array();
var selectedParameterTemplatesArr = new Array();
var maxScheduleContentCount;
var applicationGlobalId;
var applicationGlobalName;
var templateGlobalId;
var parameterSychronizationArr = new Array();
var UniqueParameterArr = new Array();
var staticTableArr = new Array();
var deviceProfileUniqueDeviceId;
var deviceXSDVersion;
var tableRowData;
var tableRowIndex;
var isEditParamEnable = false;
var isActivationParamEnable = false;
var isRestoreTemplate = false;
var isDeviceModifyAllowed = false;
var tampletFileForEdit = '';

getDeviceFormFileResponse = new Object();

xmlrowdataFor = '';

var gridArray = new Array();
var tableArray = new Array();
define(["knockout", "autho", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, autho, ADSearchUtil, koUtil) {
	var lang = getSysLang();
	

    return function fileNameOnDeviceViewModel() {

  

        var self = this;
        checkRights();
        $("#showParmMessage").hide();

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

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

        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#restoreDefaultId').on('shown.bs.modal', function (e) {
            $('#restoreDefaultId_No').focus();

        });
        $('#restoreDefaultId').keydown(function (e) {
            if ($('#restoreDefaultId_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#restoreDefaultId_Yes').focus();
            }
        });

        $('#activateParameterId').on('shown.bs.modal', function (e) {
            $('#activateParameterId_No').focus();

        });
        $('#activateParameterId').keydown(function (e) {
            if ($('#activateParameterId_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#activateParameterId_Yes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------


        self.templateFlag = ko.observable(false);
        self.parameterObservableModel = ko.observable();

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        modelReposition();
        self.openPopup = function (popupName) {
            self.templateFlag(true);
            if (popupName == "modelDeviceProfileEditTemplate") {
                koUtil.viewParameterTemplateOnDevice = false;
                loadelement(popupName, 'device/deviceProfileTemplates');
                $('#modelParameterId').modal('show');
            } else if (popupName == "modelDeviceProfileParameterAssignment") {
                loadelement(popupName, 'device/deviceProfileTemplates');
                $('#modelParameterId').modal('show');
            } else if (popupName == "modelDeviceProfileEditTemplateVPDX") {
                loadelement(popupName, 'device/deviceProfileTemplates');
                $('#modelParameterId').modal('show');
            } else if (popupName == "modelDeviceEditParameters") {
                loadelement(popupName, 'device');
                $('#modelParameterId').modal('show')
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
            isAdpopup = ''
            $("#mainPageBody").removeClass('modal-open-appendon');
            //$("#profiletab").addClass('vertical-tab');
            self.parameterObservableModel('unloadTemplate');
            $("#modelParameterId").modal('hide')

        };

        self.applicationData = ko.observableArray();
        UniqueParameterArr.push(koUtil.deviceProfileUniqueDeviceId);
        deviceProfileUniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        deviceXSDVersion = koUtil.deviceProfileXSDVersion()
        self.packageData = ko.observableArray();
        self.movedArray = ko.observableArray();
		getDeviceFormFileResponse = new Object();

        //------activate parameter API call------------
        self.activateParameterClicked = function (gID) {
            setActiveParameterDetails(gID, 'jqxgridForEditParameterTemplate', self.applicationData, self.openPopup);
        }

        //------- hide activate parameter confirmation popup--------
        self.closeActivateParamerte = function () {
            $("#activateParameterId").modal('hide');
            var msg = "";
            $("#activateMesgId").text(msg);
        }

        //-----Restore defualt API call------------
        self.restoreDefaultClicked = function (gID) {
            setRestoreParameterToDefault(gID, 'jqxgridForEditParameterTemplate', self.applicationData, self.openPopup);
        }

        //-----hide pop, click on NO button------
        self.closeRestoreDefualtPopup = function () {
            $("#restoreDefaultId").modal('hide');
            var msgRestore = "";
            $("#restoreDefMsgId").text(msgRestore);
        }

        //----------------------------close Parametret Sync popup--------------------
        self.closeParamSycStatus = function (gID) {
            $("#paramSycID").modal('hide');
            clearUiGridFilter(gID);
            $("#" + gID).jqxGrid('clearselection');
            $("#paramSycIDContent").css('left', '');
            $("#paramSycIDContent").css('top', '');
        }



        //Draggable function
        $('#paramSycIDHeader').mouseup(function () {
            $("#paramSycIDContent").draggable({ disabled: true });
        });

        $('#paramSycIDHeader').mousedown(function () {
            $("#paramSycIDContent").draggable({ disabled: false });
        });


        //--------------Restore UI style----------
        self.restoreGridUI = function () {
            restoreGridStyle();
            getParameterApplicationForDevice(self.applicationData, self.openPopup);
        }

        //--------- get parameter application data for particular device---------------
        getParameterApplicationForDevice(self.applicationData, self.openPopup);

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
                    { name: 'ApplicationVersion', map: 'ApplicationVersion' },
                    { name: 'IsParameterizationEnabled', map: 'IsParameterizationEnabled' },
                    { name: 'IsPFXExist', map: 'IsPFXExist' },
                    { name: 'IsPDXExist', map: 'IsPDXExist' },
                    { name: 'IsTemplateExist', map: 'IsTemplateExist' },
                    { name: 'IsPartialUnSync', map: 'IsPartialUnSync' },
                    { name: 'FormFile', map: 'FormFile' },
                    { name: 'IsTemplateAssigned', map: 'IsTemplateAssigned' },
                    { name: 'IsActivateEnabled', map: 'IsActivateEnabled' },
                    { name: 'IsSync', map: 'IsSync' },
                    { name: 'IsMultiVPFXSupported', map: 'IsMultiVPFXSupported' },
					{name:'IsContainerNotAvailable',map:'IsContainerNotAvailable'},
                ],

            };

        var dataAdapter = new $.jqx.dataAdapter(source);

        //-------------------------------Sync Render-----------------------------
        var syncRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
            if (rowData.IsPFXExist) {
				if(rowData.IsContainerNotAvailable == true){
					return '';
				}
                var syncToolipMessage = i18n.t('click_here_to_view_parameters_sync_status', { lng: lang });
                if (rowData.IsSync == true) {
                    return '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"><i class="icon-checkmark ienable"></i><a title="' + syncToolipMessage + '"  id="imageId" style="text-decoration:underline;padding-left:5px;" onClick="modelPopUpForParameterSynchronizationDetails(' + row + ')" height="60" width="50" >In Sync</a></div>'
                }
                //As per Discussion with Sourabh this is commented has part of 4507
                //else if(rowData.IsPartialUnSync == true && rowData.IsSync == false)
                //{
                //    return '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"><i class="icon-checkmark ienable"></i><a title="' + syncToolipMessage + '"  id="imageId" style="text-decoration:underline;padding-left:5px;" onClick="modelPopUpForParameterSynchronizationDetails(' + row + ')" height="60" width="50" >Is Partial Sync</a></div>'
                //}
                else {
                    return '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"><i class="icon-checkmark idisabled"></i><a title="' + syncToolipMessage + '"  id="imageId" onClick="modelPopUpForParameterSynchronizationDetails(' + row + ')" style="text-decoration:underline;padding-left:5px;" height="60" width="50" >Not in Sync</a></div>'
                }
            }
            else {
                return '';
            }
        }

        // create jqxgrid.
        $("#" + gID).jqxGrid(
            {
                width: "99%",
                source: dataAdapter,
                sortable: true,
                filterable: false,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                altrows: true,
                autoshowcolumnsmenubutton: false,
                showsortmenuitems: false,
                editable: true,
                enabletooltips: true,
                rowsheight: 32,
                columnsResize: true,
                ready: function () {
                    var gridheight = $(window).height();
                    if (gridheight > 900) {
                        if ($("#mainPageBody").hasClass("page-sidebar-minified")) {
                            $("#" + gID).jqxGrid('updatebounddata');
                            //$("#" + gID).jqxGrid('setcolumnproperty', 'ApplicationName', 'maxwidth', '800');
                        }
                        else {
                            $("#" + gID).jqxGrid('setcolumnproperty', 'ApplicationName', 'maxwidth', '600');
                        }
                        $("#horizontalScrollBarjqxgridForEditParameterTemplate").css('visibility', 'hidden');
                    }

                    gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 50;
                    if (gridheight < 300)
                        gridheight = 562;
                    $("#" + gID).jqxGrid({ height: gridheight });
                },
                columns: [
                    { text: '', datafield: 'ApplicationId', hidden: true, width: 'auto' },
                    {
                        text: i18n.t('applications_download_lib', { lng: lang }), datafield: 'ApplicationName', menu: false, editable: false, enabletooltips: true, maxwidth: 600,
                    },
                    {
                        text: i18n.t('versions_parameter', { lng: lang }), datafield: 'ApplicationVersion', menu: false, width: 'auto', minwidth: 160, maxwidth: 200, editable: false,

                    },
                    {
                        text: i18n.t('parameters_sync_status', { lng: lang }), datafield: 'IsPartialUnSync', enabletooltips: false, menu: false, sortable: false, maxwidth: 340, width: 'auto', editable: false, cellsrenderer: syncRenderer,

                    },
                    //-------------- Edit Parameters ----------------
                    {
                        text: '', datafield: 'Edit', columngroup: 'Description', menu: false, enabletooltips: false, sortable: false, minwidth: 70, width: 'auto', resizable: false, editable: false, columntype: 'number',
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
                            var parameterizeEnabled = rowData.IsParameterizationEnabled;
                            var isPFXExistFlag = rowData.IsPFXExist;
                            //var isPDXExistFlag = rowData.IsPDXExist;

                            var editToolipMessage = i18n.t('edit_parameters_device', { lng: lang });

                            if (parameterizeEnabled && isPFXExistFlag && isEditParamEnable) {
                                return '<div class="btn btn-xs btn-default" id="editTemplateId" style="margin-top:4px;cursor:pointer;margin-left:15px;padding:2px 5px !important;" title="' + editToolipMessage + '"><i class="icon-pencil"></i><a id="imageId" style="margin-left:5px;" height="60" width="50" >Edit</a></div>'
                            } else {
                                return '<div class="btn btn-xs btn-default disabled"  disabled="true" id="editTemplateId" style="margin-top:4px;cursor:default;margin-left:15px;padding:2px 5px !important;" title="' + editToolipMessage + '"><i class="icon-pencil"></i><a id="imageId" style="margin-left:5px;cursor:default"  height="60" width="50" >Edit</a></div>'

                            }
                        }
                    },
                    //-------------- Edit Template ----------------
                    {
                        text: '', datafield: 'Template', columngroup: 'Description', enabletooltips: false, menu: false, sortable: false, minwidth: 100, width: 'auto', resizable: false, editable: false, columntype: 'number',
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {

                            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
                            var isPFXExistFlag = rowData.IsPFXExist;
                            var isTemplateExist = rowData.IsTemplateExist;

                            var templateToolipMessage = i18n.t('edit_template_assignment_device', { lng: lang });

                        //-------------- Edit Parametres Templates----------------
                        if (isPFXExistFlag && isTemplateExist && isEditParamEnable) {
                            return '<div class="btn btn-xs btn-default" id="parameterId" style="margin-top:4px;cursor:pointer;margin-left:8px;padding:2px 5px !important;" title="' + templateToolipMessage + '"><i class="icon-pencil"></i><a id="imageId"  style="margin-left:5px;"  height="60" width="50" >Templates</a></div>'
                        } else {
                            return '<div class="btn btn-xs btn-default disabled" id="parameterIdone" style="margin-top:4px;cursor:default;margin-left:8px;padding:2px 5px !important;" title="' + templateToolipMessage + '"><i class="icon-pencil"></i><a id="imageId" style="margin-left:5px;cursor:default" height="60" width="50" >Templates</a></div>'
                        }
                    }
                },
                //-------------- Activate Parameters----------------
                {
                    text: '', datafield: 'Activate', columngroup: 'Description', enabletooltips: false, menu: false, sortable: false, minwidth: 85, width: 'auto', resizable: false, editable: false,
                    columntype: 'number', cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
						if (!isDirectParameterActivation) {
                            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
                            var isActivateEnabled = rowData.IsActivateEnabled;

                                var activateToolipMessage = i18n.t('activate_edited_parameters_device', { lng: lang });

                                if (isActivateEnabled) {
                                    return '<div class="btn btn-xs btn-default" id="ActivateId" style="margin-top:4px;cursor:pointer;margin-left:5px;padding:2px 5px !important;" title="' + activateToolipMessage + '"><i class="icon-checkmark ienable"></i><a id="imageId"  style="margin-left:5px;" onClick="modelPopUpForActivateParameter(' + row + ')" height="60" width="50" >Activate</a></div>'
                                } else {
                                    return '<div class="btn btn-xs btn-default disabled" id="ActivateId" style="margin-top:4px;cursor:default;margin-left:5px;padding:2px 5px !important;"><i class="icon-checkmark ienable"></i><a id="imageId" style="margin-left:5px;cursor:default" height="60" width="50" >Activate</a></div>'
                                }
                            } else {
                                $("#" + gID).jqxGrid('hidecolumn', 'Activate');
                                $("#" + gID).jqxGrid('setcolumnproperty', 'IsPartialUnSync', 'width', '30%');
                                return '';
                            }
                        }

                    },
                    //-------------- Restore Default----------------
                    {
                        text: '', datafield: 'RestoreDefault', enabletooltips: false, columngroup: 'Description', menu: false, sortable: false, minwidth: 150, width: 'auto', resizable: false, editable: false, columntype: 'number',
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
                            var isPFXExistFlag = rowData.IsPFXExist;
                            var isPDXExistFlag = rowData.IsPDXExist;
                            var parameterizeEnabled = rowData.IsParameterizationEnabled;

                            var restoreDefualtToolipMessage = i18n.t('restore_all_to_default', { lng: lang });

                            if (isDeviceModifyAllowed && parameterizeEnabled && isPFXExistFlag && isPDXExistFlag) {
                                return '<div class="btn btn-xs btn-default" style="margin-top:4px;cursor:pointer;margin-left:5px;padding:2px 5px !important;" title="' + restoreDefualtToolipMessage + '"><i class="icon-restoredefault" style="color:#00aeef"></i><a id="imageId"  style="margin-left:5px;" onClick="restoreToDefault(' + row + ')" height="60" width="50" >Restore Default</a></div>'
                            } else {
                                return '<div class="btn btn-xs btn-default disabled" style="margin-top:4px;cursor:default;margin-left:5px;padding:2px 5px !important;" title="' + restoreDefualtToolipMessage + '"><i class="icon-restoredefault" style="color:#00aeef"></i><a id="imageId" style="margin-left:5px;cursor:default" height="60" width="50" >Restore Default</a></div>'
                            }
                        }
                    },
                ],
                columngroups: [
                    { text: i18n.t('Parameter_actions', { lng: lang }), datafield: 'Description', menu: false, sortable: false, minwidth: 600, width: 'auto', resizable: false, editable: false, name: 'Description' }
                ]
            });

        $("#" + gID).on("cellclick", function (event) {
            var column = event.args.column;
            var rowindex = event.args.rowindex;
            var columnindex = event.args.columnindex;

            var rowData = $("#" + gID).jqxGrid('getrowdata', rowindex);
            var parameterizeEnabled = rowData.IsParameterizationEnabled;
            var isPFXExistFlag = rowData.IsPFXExist;
            var isPDXExistFlag = rowData.IsPDXExist;
            var isTemplateExist = rowData.IsTemplateExist;

            if (columnindex == 4) {
                if (parameterizeEnabled && isPFXExistFlag && isEditParamEnable) {
					var applicationId = rowData ? rowData.ApplicationId : 0;
					getDeviceFormFiles(applicationId, openPopup);
                    koUtil.getEditDeviceProfile = rowData;
                    koUtil.viewParameterTemplateOnDevice = false;
                }
            }
            if (columnindex == 5) {
                if (isPFXExistFlag && isTemplateExist && isEditParamEnable) {
                    openPopup('modelDeviceProfileParameterAssignment');
                    xmlrowdataFor = rowData.FormFile;
                    koUtil.deviceEditTemplate = rowData;
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
		getDeviceFormFileReq.IsFromDeviceSearch = false;
		getDeviceFormFileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
		getDeviceFormFileReq.DeviceSearch = null;
		getDeviceFormFileReq.ColumnSortFilter = null;
		Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
		Selector.UnSelectedItemIds = null;
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
                                treeObject.parentInstanceSourceId = 0;
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
							openPopup('modelDeviceProfileEditTemplate');
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

    function getParameterApplicationForDevice(applicationData, openPopup) {

        var getParameterApplicationsReq = new Object();
        //var selector = new Object();
        //var deviceProfileUniqueDeviceArr = new Array();
        //deviceProfileUniqueDeviceArr.push(koUtil.deviceProfileUniqueDeviceId);

        //var selectedDeviceSearchItems = deviceProfileUniqueDeviceArr;
        //var unselectedDeviceSearchItems = null;


        //getParameterApplicationsReq.DeviceSearch = null;
        //selector.SelectedItemIds = selectedDeviceSearchItems;
        //selector.UnSelectedItemIds = null;

        //getParameterApplicationsReq.IsFromDeviceProfile = true;
        //getParameterApplicationsReq.Selector = selector;

        getParameterApplicationsReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.getParameterApplicationsResp) {
                        data.getParameterApplicationsResp = $.parseJSON(data.getParameterApplicationsResp);
                        applicationData(data.getParameterApplicationsResp.Applications);
                        jqxgridForEditParameter(applicationData(), 'jqxgridForEditParameterTemplate', openPopup);
                    } else {
                        jqxgridForEditParameter([], 'jqxgridForEditParameterTemplate', openPopup);
                        //$("#showParmMessage").show();
                    }

                }
            }
        }

        var method = 'GetParameterApplicationsForDevice';
        var params = '{"token":"' + TOKEN() + '","getParameterApplicationsReq":' + JSON.stringify(getParameterApplicationsReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    //---------set active parameter details-----------
    function setActiveParameterDetails(gID, gridId, applicationData, openPopup) {

        var setDeviceParametersReq = new Object();
        var selector = new Object();

        var deviceProfileForActivateParametreID = new Array();
        deviceProfileForActivateParametreID.push(koUtil.deviceProfileUniqueDeviceId);

        selector.SelectedItemIds = deviceProfileForActivateParametreID;
        selector.UnSelectedItemIds = null;

        setDeviceParametersReq.ActionMode = ENUM.get('ACTION_MODE_ACTIVATE');
        setDeviceParametersReq.ApplicationId = applicationGlobalId;
        setDeviceParametersReq.DeviceSearch = null;
        setDeviceParametersReq.ParamList = null;
        setDeviceParametersReq.Selector = selector;
        setDeviceParametersReq.IsFromDeviceSearch = !koUtil.isDeviceProfile();
        setDeviceParametersReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    $("#activateParameterId").modal('hide');
                    openAlertpopup(0, 'parameters_successfully_activated');
                    getParameterApplicationForDevice(applicationData, openPopup);
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
            if (error) {
                $("#activateParameterId").modal('hide');

            }
        }

        var method = 'SetDeviceParameters';
        var params = '{"token":"' + TOKEN() + '","setDeviceParametersReq":' + JSON.stringify(setDeviceParametersReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    //-----restore parameter to defualt-----------------
    function setRestoreParameterToDefault(gID, gridId, applicationData, openPopup) {

        var restoreAllDeviceParametersReq = new Object();
        var applicationDetails = new Object();
        var selector = new Object();

        var deviceProfileForRestoreDefault = new Array();
        deviceProfileForRestoreDefault.push(koUtil.deviceProfileUniqueDeviceId);

        applicationDetails.ApplicationId = applicationGlobalId;
        applicationDetails.ApplicationName = applicationGlobalName;

        selector.SelectedItemIds = deviceProfileForRestoreDefault;
        selector.UnSelectedItemIds = null;

        restoreAllDeviceParametersReq.ApplicationDetails = applicationDetails;
        restoreAllDeviceParametersReq.DeviceSearch = null;
        restoreAllDeviceParametersReq.Selector = selector;
        restoreAllDeviceParametersReq.ColumnSortFilter = null;
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    $("#restoreDefaultId").modal('hide');
                    openAlertpopup(0, 'Parameter_values_restore_success');
                    getParameterApplicationForDevice(applicationData, openPopup);
                    //---restore grid css properties------
                    restoreGridStyle();
                } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                    $("#restoreDefaultId").modal('hide');
                    Token_Expired();
                }
            }
            if (error) {
                $("#restoreDefaultId").modal('hide');
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

});

var applicationName;
var applicationVersion;

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

//----display grid for Parameter Template Assignment for Application
function jqxGridforParametresSyncStatus(parameterSychronizationArr, gID, deviceXSDVersion) {
	if(!_.isEmpty(parameterSychronizationArr))
	{
		for (var i = 0; i < parameterSychronizationArr.length; i++) {
			parameterSychronizationArr[i].LastModifiedOnServer = convertToLocaltimestamp(parameterSychronizationArr[i].LastModifiedOnServer);
			parameterSychronizationArr[i].LastModifiedOnDevice = convertToLocaltimestamp(parameterSychronizationArr[i].LastModifiedOnDevice);
			parameterSychronizationArr[i].LastActivatedOn = convertToLocaltimestamp(parameterSychronizationArr[i].LastActivatedOn);
			parameterSychronizationArr[i].LastSynchronizeddOn = convertToLocaltimestamp(parameterSychronizationArr[i].LastSynchronizeddOn);

		}
	}

    var source =
        {
            dataType: "json",
            localdata: parameterSychronizationArr,
            datafields: [
                { name: 'IsInSync', map: 'IsInSync' },
                { name: 'ParameterFileName', map: 'ParameterFileName' },
                { name: 'ContainerName', map: 'ContainerName' },
                { name: 'LastModifiedOnServer', map: 'LastModifiedOnServer', type: 'date' },
                { name: 'LastModifiedOnDevice', map: 'LastModifiedOnDevice', type: 'date' },
                { name: 'LastActivatedOn', map: 'LastActivatedOn', type: 'date' },
                { name: 'LastSynchronizeddOn', map: 'LastSynchronizeddOn', type: 'date' },
                { name: 'ToolTipOnSyncStatus', map: 'ToolTipOnSyncStatus', type: 'string' },
            ],

        };

    var dataAdapter = new $.jqx.dataAdapter(source);

    var isInSyncRender = function (row, columnfield, value, defaulthtml, columnproperties) {
        if (value == true) {
            var syncTooltipMessage = i18n.t('parameters_are_in_Sync', { lng: lang });
            return '<div style="padding-top:7px;text-align:center;cursor:pointer;"><i class="icon-checkmark ienable" title="' + syncTooltipMessage + '"></i></div>'
        } else {
            var rowData = $('#' + gID).jqxGrid('getrowdata', row);
            var toolTip = rowData ? rowData.ToolTipOnSyncStatus : "";
            var unSyncTooltipMessage = i18n.t('parameters_are_not_in_Sync', { lng: lang }) + " " + toolTip;
            return '<div style="padding-top:7px;text-align:center;cursor:pointer;"><i class="icon-checkmark idisabled" title=" ' + unSyncTooltipMessage + '"  ></i></div>'
        }
    }
    var isValidXSD = false;   
    var xsdVersion = !_.isEmpty(deviceXSDVersion) ? deviceXSDVersion.replace(/\./g, '') : '';
    if (xsdVersion != '' && parseInt(xsdVersion) >= parseInt("02110013")) {
        isValidXSD = true;
    } else {
        isValidXSD = false;
    }

    // create jqxgrid.
    $("#" + gID).jqxGrid(
        {
            width: "100%",
            height: 220,
            source: dataAdapter,
            sortable: true,
            filterable: false,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            altrows: true,
            autoshowcolumnsmenubutton: false,
            showsortmenuitems: false,
            editable: true,
            enabletooltips: false,
            rowsheight: 32,
            columnsResize: true,
            columnsreorder: false,
            columns: [
                {
                    text: i18n.t('status', { lng: lang }), datafield: 'IsInSync', menu: false, sortable: false, width: 50, minwidth: 47, editable: false, cellsrenderer: isInSyncRender,
                },
                {
                    text: i18n.t('parameter_file_name', { lng: lang }), datafield: 'ParameterFileName', menu: false, width: 190, minwidth: 175, editable: false,

                },
                {
                    text: i18n.t('container_name', { lng: lang }), datafield: 'ContainerName', menu: false, width: 155, minwidth: 145, editable: false,

                },
                {
                    text: i18n.t('last_modified_on_server', { lng: lang }), datafield: 'LastModifiedOnServer', menu: false, width: 195, minwidth: 178, editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT,

                },
                {
                    text: i18n.t('last_modified_on_device', { lng: lang }), datafield: 'LastModifiedOnDevice', menu: false, width: 195, minwidth: 178, editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, hidden: !isValidXSD,

                },
                {
                    text: i18n.t('last_activated_on', { lng: lang }), datafield: 'LastActivatedOn', menu: false, width: 180, minwidth: 178, editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT,

                },
                {
                    text: i18n.t('last_syncronized_date', { lng: lang }), datafield: 'LastSynchronizeddOn', menu: false, width: 190, minwidth: 184, editable: false, resizable: false, cellsformat: LONG_DATETIME_GRID_FORMAT,

                },
            ]
        });

    $("#" + gID).jqxGrid('updatebounddata');

    $("#columntablejqxGridForParameterSynchronization .jqx-grid-column-sortascbutton").css({ "margin-left": "14px" });
    $("#columntablejqxGridForParameterSynchronization .jqx-grid-column-sortdescbutton").css({ "margin-left": "14px" });
}

//---------Get ParameterSynchronizationDetails--------
function modelPopUpForParameterSynchronizationDetails(row) {
    var rowData = $('#jqxgridForEditParameterTemplate').jqxGrid('getrowdata', row);
    var applicationID = rowData.ApplicationId;
    //var uniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

    var getParameterSynchronizationDetailsReq = new Object();
    getParameterSynchronizationDetailsReq.ApplicationId = applicationID;
    getParameterSynchronizationDetailsReq.UniqueDeviceId = deviceProfileUniqueDeviceId;

    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                $("#paramSycID").modal('show');

                if (data && data.getParameterSynchronizationDetailsResp) {
                    data.getParameterSynchronizationDetailsResp = $.parseJSON(data.getParameterSynchronizationDetailsResp);
                }
                if (data.getParameterSynchronizationDetailsResp) {
                    parameterSychronizationArr = data.getParameterSynchronizationDetailsResp.ParameterContainerList;
                    jqxGridforParametresSyncStatus(parameterSychronizationArr, 'jqxGridForParameterSynchronization', deviceXSDVersion);
                } else {
                    jqxGridforParametresSyncStatus([], 'jqxGridForParameterSynchronization', deviceXSDVersion);
                }

            } else if (data.responseStatus.StatusCode == AppConstants.get('POPULATION_OF_THE_APPLICATION_PARAMETERS_IN_PROGRESS')) {
                jqxGridforParametresSyncStatus([], 'jqxGridForParameterSynchronization', deviceXSDVersion);
                openAlertpopup(1, 'Population_of_the_application_parameters_in_progress');
            } else if (data.responseStatus.StatusCode == AppConstants.get('EX_NO_BASE_LEVEL_CONTAINERS')) {
				$("#paramSycID").modal('show');
                jqxGridforParametresSyncStatus([], 'jqxGridForParameterSynchronization', deviceXSDVersion);
                openAlertpopup(1, 'ex_no_base_level_containers');
            }
        }
    }

    var method = 'GetParameterSynchronizationDetails';
    var params = '{"token":"' + TOKEN() + '","getParameterSynchronizationDetailsReq":' + JSON.stringify(getParameterSynchronizationDetailsReq) + '}';
    ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

