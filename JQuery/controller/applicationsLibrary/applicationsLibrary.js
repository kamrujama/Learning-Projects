var PFXFiles = new Array();
var selectedFormFileId = 0;
var selectedFormFileLevel = '';
var selectedApplicationId = '';
var isLookupTemplate = false;
define(["knockout", "koUtil", "autho", "i18next", "download"], function (ko, koUtil, autho) {

	columnSortFilterforApplication = new Object();
	var lang = getSysLang();

	var selectedApplicationName = '';
	var selectedApplicationVersion = '';
	var selectedVPDXVersion = ''
	var isConfigureAllowed = false;
	var isDownloadAllowed = false;
	var isFlagFortemplate = false;
	globalVariableForApplications = new Object();
	appGids = new Array();
	isReuseAppSelected = false;
	copytemplateSelection = 0;
	isDownloadAllowedFlag = '';
	koUtil.GlobalColumnFilter = new Array();

	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	return function applicationsViewModel() {

		isReuseAppSelected = false;

		checkForbrowsFile = 0;

		APPGridIdForTemplate = '';

		ApplicationXML = '';
		var self = this;

		//Draggable function
		$('#childApplicationViewHeader').mouseup(function () {
			$("#childApplicationViewContent").draggable({ disabled: true });
		});

		$('#childApplicationViewHeader').mousedown(function () {
			$("#childApplicationViewContent").draggable({ disabled: false });
		});

		$('#parameterTemplatePopupHeader').mouseup(function () {
			$("#parameterTemplatePopupHeaderContent").draggable({ disabled: true });
		});

		$('#parameterTemplatePopupHeader').mousedown(function () {
			$("#parameterTemplatePopupHeaderContent").draggable({ disabled: false });
		});


		$('#modalViewParameterHeader').mouseup(function () {
			$("#modalViewParameterContent").draggable({ disabled: true });
		});

		$('#modalViewParameterHeader').mousedown(function () {
			$("#modalViewParameterContent").draggable({ disabled: false });
		});

		$('#editGIDHeader').mouseup(function () {
			$("#editGIDContent").draggable({ disabled: true });
		});

		$('#editGIDHeader').mousedown(function () {
			$("#editGIDContent").draggable({ disabled: false });
		});

		$('#parameterDefinitionHeader').mouseup(function () {
			$("#parameterDefinitionContent").draggable({ disabled: true });
		});

		$('#parameterDefinitionHeader').mousedown(function () {
			$("#parameterDefinitionContent").draggable({ disabled: false });
		});

		$('#parameterFormViewHeader').mouseup(function () {
			$("#parameterFormViewContent").draggable({ disabled: true });
		});

		$('#parameterFormViewHeader').mousedown(function () {
			$("#parameterFormViewContent").draggable({ disabled: false });
		});

		$('#btnCloseParameterDefinitionFile').keydown(function (e) {
			if ($('#btnCloseParameterDefinitionFile').is(":focus") && (e.which || e.keyCode) == 9) {
				$('#fileInputPDX').focus();

				$('#fileInputPDXBtn').css('border-color', '#fff');
				//$('#fileInputPDXBtn').css('background-color', '#fff');
			}
		});

		$('#fileInputPDX').keydown(function (e) {
			if ($('#fileInputPDX').is(":focus") && (e.which || e.keyCode) == 9) {
				$('#fileInputPDXBtn').css('border-color', '');
				$('#fileInputPDXBtn').css('background-color', '');
			}
		});

		$('#fileInputPDXBtn').keydown(function (e) {
			$('#fileInputPDXBtn').css('border-color', '');
			$('#fileInputPDXBtn').css('background-color', '');
		});

		$('#parameterDefinitionPopup').click(function (e) {
			if ($('#fileInputPDX').is(":focus")) {
				$('#fileInputPDXBtn').css('border-color', '#666');
				$('#fileInputPDXBtn').css('background-color', '#fff');
			} else {
				$('#fileInputPDXBtn').css('border-color', '');
				$('#fileInputPDXBtn').css('background-color', '');
			}
		});

		$('#btnCancelParameterDefinitionFile').keydown(function (e) {
			if ($('#btnCancelParameterDefinitionFile').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#btnCloseParameterDefinitionFile').focus();

			}
		});

		//close edit GID popup
		self.closeAppEditPopup = function () {
			$("#editGIDPopup").modal('hide');
			$("#editGIDContent").css('left', '');
			$("#editGIDContent").css('top', '');
		}

		self.checkRightsForDelete = function (screenName, rightsFor) {
			var retval = autho.checkRightsBYScreen(screenName, rightsFor);
			return retval;
		}

		self.checkRights = function () {
			var retval = autho.checkRightsBYScreen('Download Schedule', 'IsModifyAllowed');
			if (retval == true) {
				isConfigureAllowed = true;
			} else {
				isConfigureAllowed = false;
			}
			return retval;
		}

		self.checkRights();
		checkRightsForDownload();
		checkRightsForTemplate();

		function checkRightsForDownload() {
			var basicParamFlag = autho.checkRightsBYScreen('Basic Parameter Management', 'IsModifyAllowed');
			var advanceParamFlag = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsModifyAllowed');
			if (basicParamFlag == true && advanceParamFlag == true) {
				isDownloadAllowed = true;
			} else {
				isDownloadAllowed = false;
			}
		}

		function checkRightsForTemplate() {
			var retval = autho.checkRightsBYScreen('Download Schedule', 'IsModifyAllowed');
			var deviceView = autho.checkRightsBYScreen('Download Library', 'IsModifyAllowed');
			if (retval == true && deviceView == true) {
				isFlagFortemplate = true;
			} else {
				isFlagFortemplate = false;
			}
			return retval;
		}

		selectedMenuOption = 'applicationsLibrary';
		self.observableModelPopup = ko.observable();
		self.columnlist = ko.observableArray();
		self.gridIdForShowHide = ko.observable();
		var compulsoryfields = ['ApplicationName', 'ParameterDefinitionFile', 'ParameterFormFile', 'IsParameterizationEnabled', 'AppGID'];
		self.appGid = ko.observableArray();
		self.version = ko.observable();

		this.isLock =  ko.observable(false);
        if(!referenceSetParameterTemplateLock)
        {
            $('#btnLockPT').hide();
			$('#btnUnlockPT').hide();
        }

		setMenuSelection();

		///new changes
		selectedRowIndex = 0;
		selectedDefintionFileName = '';
		selectedFormViewFileName = '';

		var VPDXFileData = new Array();
		var VPFXFileData = new Array();
		self.showParamLink = ko.observable(false);
		self.fileinputReset = ko.observable(false);
		var deviceApplicationCount = 0;

		self.clearfilter = function (gId) {
			gridFilterClear(gId);
		}

		self.refreshGrid = function (gId) {
			gridRefresh(gId);
			var hideSelect = function () {
				$("#columntablejqxgridApplications").find('.jqx-grid-column-header:first').hide();
			}
			setTimeout(hideSelect, 1000);
		}

		self.copyTemplateOptions = ko.observableArray([{ displayOption: i18n.t('copy_from_existing_templates', { lng: lang }), value: 1 }, { displayOption: i18n.t('copy_from_another_version', { lng: lang }), value: 2 }]);
		self.createTemplateOptions = ko.observableArray([{ displayOption: i18n.t('create_lookup_template', { lng: lang }), value: 1 }, { displayOption: i18n.t('create_parameter_template', { lng: lang }), value: 2 }]);

		self.templateOptionSelection = function (popupName, gId, selection) {
			copytemplateSelection = selection;
			self.templateFlag(true);
			switch (popupName) {
				case "modelCopyParameterTemplate":
					if (selection == '2') {
						loadelement(popupName, 'applicationsLibrary');
						$('#applicationModel').modal('show');
						break;
					} else {
						var datainfo = $("#" + gId).jqxGrid('getdatainformation');
						if (datainfo.rowscount > 0) {
							loadelement(popupName, 'applicationsLibrary');
							$('#applicationModel').modal('show');
							break;
						} else {
							openAlertpopup(1, 'no_existing_templates_exist_for_selected_application');
							break;
						}
					}

				case "modalAddTemplatFile":
					koUtil.selectedIsLocked = false;
					if (selection == '1') {
						isLookupTemplate = true;
					} else {
						isLookupTemplate = false;
						globalTemplateQualifiers.SelectedModelIds = [];
						globalTemplateQualifiers.IsAssignedToHierarchy = false;						
					}
					koUtil.addOrEditTemplate = 0;
					loadelement(popupName, 'applicationsLibrary');
					$('#applicationModel').modal('show');
					break;
			}

		}

		//for spinner
		$('[data-trigger="spinner"]').spinner();

		self.resetFileInput = function (id) {
			self.fileinputReset(true);
			$fileInput = $("#" + id);
			$fileInput.replaceWith($fileInput = $fileInput.val('').clone(true));
		}

		//-------------------------------------------------------------FOCUS ON CONFIRMATION POPUP-----------------------------------------------
		$('#PDFSaveConfirmation').on('shown.bs.modal', function (e) {
			$('#PDFSave_No').focus();

		});
		$('#PDFSaveConfirmation').keydown(function (e) {
			if ($('#PDFSave_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#PDFSave_Yes').focus();
			}
		});

		$('#deleteTemplate').on('shown.bs.modal', function (e) {
			$('#deleteTemplate_No').focus();

		});
		$('#deleteTemplate').keydown(function (e) {
			if ($('#deleteTemplate_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#deleteTemplate_Yes').focus();
			}
		});

		$('#nonePFXConfirmation').on('shown.bs.modal', function (e) {
			$('#nonePFX_No').focus();

		});
		$('#nonePFXConfirmation').keydown(function (e) {
			if ($('#nonePFX_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#nonePFX_Yes').focus();
			}
		});
		$('#nonePDXConfirmation').on('shown.bs.modal', function (e) {
			$('#nonePDX_No').focus();

		});
		$('#nonePDXConfirmation').keydown(function (e) {
			if ($('#nonePDX_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#nonePDX_Yes').focus();
			}
		});
		//------------------------------------------------------------------------------------------------------------------------

		$("#PDFSaveConfirmation").on('keydown', function (e) {
			if (e.keyCode == 27) {
				self.cancelParameterDefinitionFileSave();
			}
		});
		$("#appSelectGid").on('change', function (e) {
			var item = $("#appSelectGid").find('option:selected').text();
			if (item != 'Select') {
				$("#gidSave").attr('disabled', false);
			} else {
				$("#gidSave").attr('disabled', true);
			}
		});

		self.resetReuseGrid = function (gID) {
			clearUiGridFilter(gID);
			$('#' + gID).jqxGrid('clearselection');
		}

		// get uploaded file       
		self.handleFileSelect = function (fileType) {
			var validationflage = 0;
			if (fileType == 'vpdx') {
				validationflage = 4;
			} else if (fileType == 'vpfx') {
				validationflage = 5;
			}
			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				openAlertpopup(1, 'the_file_apis_are_not_fully_supported_in_this_browser');
				return;
			}
			if (fileType == 'vpdx') {
				input = document.getElementById('fileInputPDX');
			} else if (fileType == 'vpfx') {
				input = document.getElementById('fileInputVPF');
			}

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
				if (validateFileName(file.name, validationflage)) {
					if (fileType == 'vpdx') {
						$("#txtPDX").prop('value', file.name);
					} else if (fileType == 'vpfx') {
						$("#txtVPF").prop('value', file.name);
					}

					fr = new FileReader();
					if (fileType == 'vpdx') {
						fr.onload = receivedVPDXText;
					} else if (fileType == 'vpfx') {
						fr.onload = receivedVPFXText;
					}
					fr.readAsText(file);
					//fr.readAsArrayBuffer(file);
				} else {
					$("#txtPDX").prop('value', '');
					openAlertpopup(1, 'selected_file_format_not_supported');
				}
			}
			self.fileinputReset(false);
		}

		function receivedVPDXText() {
			checkForbrowsFile = 1;
			VPDXFileData = new Array();
			VPDXFileData.push(fr.result);//JIRA BUG FIx 4592 .split(',');
			var filename = $("#fileInputPDX").val();
			koUtil.vpfPDXUploadedDataArr = VPDXFileData;
			$("#showParamLinkDiv").show();
		}

		function receivedVPFXText() {
			VPFXFileData = new Array();
			VPFXFileData.push(fr.result);
			koUtil.vpfPDXUploadedDataArr = VPFXFileData;
			var filename = $("#fileInputVPF").val();
		}

		//--------------------------------- Zontalk Support -------------------------------------------
		// Delete Application
		self.deleteApplications = function (popupName, gridId) {
			self.openPopup(popupName, gridId);
		}

		self.deleteApplicationsClick = function (gId) {
			var selecteItemIds = getSelectedUniqueId(gId);
			if (selecteItemIds.length >= 1) {
				$('#deleteConfirmationPopup').modal('show');
			} else if (selecteItemIds.length == 0) {
				openAlertpopup(1, 'app_library_app_file');
				return;
			}
		}

		self.hideSuccessPopup = function (gId) {
			$("#applicationActionSuccessPopup").modal('hide');
			$("#" + gId).jqxGrid('updatebounddata');
		}

		self.deleteApplications = function (gId, isContinue) {

			var deleteApplicationsReq = new Object();
			var Selector = new Object();
			var selecteItemIds = getSelectedUniqueId(gId);
			var unSelectedItemIds = getUnSelectedUniqueId(gId);
			var checkAll = checkAllSelected(gId);

			if (checkAll == 1) {
				Selector.SelectedItemIds = null;
				if (unSelectedItemIds.length > 0) {
					Selector.UnSelectedItemIds = unSelectedItemIds;
				} else {
					Selector.UnSelectedItemIds = null;
				}
			} else {
				Selector.SelectedItemIds = selecteItemIds;
				Selector.UnSelectedItemIds = null;
			}

			deleteApplicationsReq.Selector = Selector;
			deleteApplicationsReq.IsDeleteApp = isContinue;
			deleteApplicationsReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						gridFilterClear('jqxgridApplications');
						openAlertpopup(0, 'app_library_delete_success');
					} else if (data.responseStatus.StatusCode == AppConstants.get('CANNOT_DELETE_APPLICATION')) {
						$('#forceDeleteApp').modal('show');
					}
				}
			}
			var method = 'DeleteApplications';
			var params = '{"token":"' + TOKEN() + '","deleteApplicationsReq":' + JSON.stringify(deleteApplicationsReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}
		//--------------------------------- Zontalk Support -------------------------------------------

		function viewParameters(xml) {

			var PDFData = new Array();
			var JsonXmlData = $.xml2json(xml);

			var containerArr = JsonXmlData.ParameterFile.Container;
			var count = 0;
			if (!_.isEmpty(containerArr) && containerArr.length > 0) {
				for (var i = 0; i < containerArr.length; i++) {
					count = count + 1;
					var parentObj = new Object();
					parentObj.Name = containerArr[i].Name;
					parentObj.Default = '';
					parentObj.ParentId = null;
					parentObj.ID = count;
					PDFData.push(parentObj);

					if (containerArr[i].Param && containerArr[i].Param.length > 0) {
						for (var k = 0; k < containerArr[i].Param.length; k++) {
							count = count + 1;
							var childObj = new Object();
							childObj.Name = containerArr[i].Param[k].Name;
							childObj.Default = containerArr[i].Param[k].Default;
							childObj.ParentId = parentObj.ID;
							childObj.ID = count;
							PDFData.push(childObj);
						}
					}
				}
			}

			if ($("#ViewPDXTreeGrid").hasClass('jqx-grid')) {
				$("#PDXTreeGridMainDiv").empty();
				var gridDiv = '<div id="ViewPDXTreeGrid"></div>'
				$("#PDXTreeGridMainDiv").append(gridDiv);
			}
			generatePDATreeGrid(PDFData);
		}

		function generatePDATreeGrid(PDFData) {
			var source =
			{
				dataType: "json",
				dataFields: [
					{ name: 'ID', type: 'number' },
					{ name: 'ParentId', type: 'number' },
					{ name: 'Name', type: 'string' },
					{ name: 'Default', type: 'string' }
				],
				hierarchy:
				{
					keyDataField: { name: 'ID' },
					parentDataField: { name: 'ParentId' }
				},
				id: 'ID',
				localData: PDFData
			};
			var dataAdapter = new $.jqx.dataAdapter(source);

			$("#ViewPDXTreeGrid").jqxTreeGrid(
				{
					width: 648,
					source: dataAdapter,
					sortable: true,
					columnsResize: true,
					columnsReorder: true,
                    selectionMode: 'singlerow',
                    theme: AppConstants.get('JQX-GRID-THEME'),
					filterable: false,
					sortable: false,
					ready: function () {
						for (var i = 0; i < PDFData.length; i++) {
							$("#ViewPDXTreeGrid").jqxTreeGrid('expandRow', PDFData[i].ID);
						}
					},
					columns: [
						{ text: i18n.t('Name', { lng: lang }), dataField: 'Name', minwidth: 323, width: 323 },
						{ text: i18n.t('default', { lng: lang }), dataField: 'Default', minwidth: 323, width: 323 },
					]

				});
		}

		self.viewParameter = function (popupName) {
			self.templateFlag(true);
			if (popupName == "modelViewParameter") {
				loadelement(popupName, 'applicationsLibrary');
				$('#applicationModel').modal('show');
			}
		}

		function getPDFForApplication(applicationId) {

			var getPDFForApplicationReq = new Object();
			getPDFForApplicationReq.ApplicationId = applicationId;
			getPDFForApplicationReq.State = 0;//ENUM.get('Active');
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.getPDFForApplicationResp && data.getPDFForApplicationResp) {
							data.getPDFForApplicationResp = $.parseJSON(data.getPDFForApplicationResp);
							if (data.getPDFForApplicationResp.ParamDefFile) {
								viewParameters(data.getPDFForApplicationResp.ParamDefFile);
								$('#modalViewParameter').modal('show');
							}
						}
					}
				}
			}

			var params = '{"token":"' + TOKEN() + '","getPDFForApplicationReq":' + JSON.stringify(getPDFForApplicationReq) + '}'
			ajaxJsonCall('GetPDFForApplication', params, callBackfunction, true, 'POST', true);
		}

		//For Load element
		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopup(elementname);
		}

		self.unloadAddTemplatepopup = function (checkTxtValue) {
			if (checkTxtValue == '') {
				$('#TemplateConfirmPopup').modal('show');
			} else {
				self.observableModelPopup('unloadTemplate');
				$('#applicationModel').modal('hide');
			}
			$("#mainPageBody").addClass('modal-open-appendon');
			checkIsPopUpOPen();
		}

		self.closemodalViewParameter = function () {
			$("#modalViewParameter").modal('hide');
			$("#modalViewParameterContent").css('left', '');
			$("#modalViewParameterContent").css('top', '');
		}

		//PopUp Functions
		self.templateFlag = ko.observable(false);
		self.columnlist = ko.observableArray();
		self.gridIdForShowHide = ko.observable();
		self.checkParameterDefinitionFile = ko.observable('newParameterDefinitionFile');
		self.checkParameterFormFile = ko.observable('newParameterFormFile');
		var modelName = 'unloadTemplate';
		loadelement(modelName, 'genericPopup');

		//unload template
		self.unloadTempPopup = function () {
			clearQualifiersObject();
			self.observableModelPopup('unloadTemplate');
			$('#applicationModel').modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
		}

		modelReposition();
		self.openPopup = function (popupName, gId, addOrEdit) {
			self.templateFlag(true);
			switch (popupName) {
				case "modelShowHideCol":
					self.gridIdForShowHide(gId);
					self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));

					if (visibleColumnsList.length == 0) {
						var columns = self.columnlist();
						koUtil.gridColumnList = new Array();
						for (var i = 0; i < columns.length; i++) {
							koUtil.gridColumnList.push(columns[i].columnfield);
						}
					}


					loadelement(popupName, 'genericPopup');
					$('#applicationModel').modal('show');
					break;
				case "modelApplicationGid":
				case "modelApplicationParameterTemplate":
				case "modelApplicationParameterDefination":
				case "modelApplicationParameterFormViewFile":
				case "modelApplicationParameterDefination":
				case "modalAddApplication":
					loadelement(popupName, 'applicationsLibrary');
					$('#applicationModel').modal('show');
					break;
				case "modelExportSucess":
					loadelement(popupName, 'genericPopup');
					$('#applicationModel').modal('show');
					break;
				case "modalAddTemplatFile":
					koUtil.addOrEditTemplate = addOrEdit;
					koUtil.viewParameterTemplateOnDevice = false;
					koUtil.selectedIsLocked = false;
					if (addOrEdit == 0) {
						globalTemplateQualifiers.SelectedModelIds = [];
						globalTemplateQualifiers.IsAssignedToHierarchy = false;
						loadelement(popupName, 'applicationsLibrary');
						$('#applicationModel').modal('show');
					} else if (addOrEdit == 1) {
						var selectedtemplate = getMultiSelectedData('templateGrid');
						if (!_.isEmpty(selectedtemplate) && selectedtemplate.length === 0) {
							openAlertpopup(1, 'please_select_a_parameter_template'); // Please select at least on records
						} else if (!_.isEmpty(selectedtemplate) && selectedtemplate.length > 1) {
							openAlertpopup(1, 'select_single_parameter_template_to_edit');
						} else if (isParameterTemplateLocked('templateGrid', 1, selectedtemplate)) {
							return;
						} else if (!_.isEmpty(selectedtemplate) && selectedtemplate.length === 1) {
							koUtil.selectedTemplateId = selectedtemplate[0].TemplateId;
							koUtil.selectedTemplateName = selectedtemplate[0].TemplateName;
							koUtil.selectedTemplateDescription = selectedtemplate[0].Description;
							koUtil.selectedIsLocked = selectedtemplate[0].IsLocked;
							globalTemplateQualifiers.SelectedModelIds = selectedtemplate[0].SelectedModels;
							globalTemplateQualifiers.IsAssignedToHierarchy = selectedtemplate[0].IsAssignedToHierarchy;
							isLookupTemplate=selectedtemplate[0].IsLookupTemplate;
							loadelement(popupName, 'applicationsLibrary');
							$('#applicationModel').modal('show');
						}
					}
					break;
				case "modelEditApplication":
					var selecteItemIds = getSelectedUniqueId('jqxgridApplications');
					var checkAll = checkAllSelected('jqxgridApplications');
					var unSelecteItemIds = getUnSelectedUniqueId('jqxgridApplications');
					var datacount = getTotalRowcount('jqxgridApplications');
					if (checkAll == 1) {
						if (unSelecteItemIds.length == datacount - 1) {
							loadelement(popupName, 'applicationsLibrary');
							$('#applicationModel').modal('show');
							editButtonClick('jqxgridApplications');
						}
						else {
							openAlertpopup(1, 'select_single_application');
							return;
						}

					} else {
						if (selecteItemIds.length == 1) {
							loadelement(popupName, 'applicationsLibrary');
							$('#applicationModel').modal('show');
							editButtonClick('jqxgridApplications');
						} else if (selecteItemIds.length == 0) {
							openAlertpopup(1, 'please_selct_application');
							return;
						} else if (selecteItemIds.length > 1) {
							openAlertpopup(1, 'select_single_application');
							return;
						}
					}
					break;
				case "modelDeleteApplication":
					var selecteItemIds = getSelectedUniqueId('jqxgridApplications');
					var deleteCount = getAllSelectedDataCount('jqxgridApplications');
					var checkAll = checkAllSelected('jqxgridApplications');
					if (checkAll == 1) {
						if (deleteCount < 1) {
							openAlertpopup(1, 'select_item');
						} else {
							loadelement(popupName, 'applicationsLibrary');
							$('#applicationModel').modal('show');
							deleteButtonClick(gId, 1);
						}

					} else {
						if (selecteItemIds.length == 1 || selecteItemIds.length > 1) {
							loadelement(popupName, 'applicationsLibrary', 2);
							$('#applicationModel').modal('show');
							deleteButtonClick(gId, 1);
						} else if (selecteItemIds.length == 0) {
							openAlertpopup(1, 'please_selct_application');
							$("#draggDeleteID").draggable();
							return;
						}
					}
					break;
				case "modelViewConflictDetails":
					loadelement(popupName, 'genericPopup');
					$('#applicationModel').modal('show');
					break;
				case "modelAddDeviceFileImport":
					loadelement(popupName, 'device');
					$('#applicationModel').modal('show');
					break;
			}
		}

		self.saveApplicationGID = function () {

			var item = $("#appSelectGid").find('option:selected').text();
			var AssignGIDForApplicationReq = new Object();
			AssignGIDForApplicationReq.AppGID = item;
			AssignGIDForApplicationReq.ApplicationId = selectedApplicationId;
			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						$("#applicationActionSuccessPopup").modal('show');
						$("#infoMessageSuccess").text(i18n.t('application_GID_updated', { lng: lang }));
						$("#editGIDPopup").modal('hide');
						$("#editGIDContent").css('left', '');
						$("#editGIDContent").css('top', '');
						$("#mainPageBody").removeClass('modal-open-appendon');

					}
				}
			}

			var method = 'AssignGIDForApplication';
			var params = '{"token":"' + TOKEN() + '","assignGIDForApplicationReq":' + JSON.stringify(AssignGIDForApplicationReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		//ExportToExcel 
		self.exportToExcel = function (isExport, gId) {
			var selectedApplicationItems = getSelectedUniqueId(gId);
			visibleColumnsList = GetExportVisibleColumn(gId);
			var param = applicationsParameters(true, columnSortFilterforApplication, selectedApplicationItems, visibleColumnsList);
			var datainfo = $("#" + gId).jqxGrid('getdatainformation');
			if (datainfo.rowscount > 0) {
				applicationExport(param, gId, self.openPopup);
			} else {
				openAlertpopup(1, 'no_data_to_export');
			}
		}

		function applicationExport(param, gId, openPopup) {
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(1, 'export_Sucess');
					}
				}
			}

			var params = JSON.stringify(param);;
			ajaxJsonCall('GetApplications', params, callBackfunction, true, 'POST', true);
		}

		//------------------------- Zontalk support ----------------------------
		//edit application
		function editButtonClick(gID) {
			var selectedIds = getMultiSelectedData(gID);
			globalVariableForEditApplication = selectedIds;
		}

		//delete application
		function deleteButtonClick(gID, check) {
			var selectedDeleteIds = getSelectedUniqueId(gID);
			var selectedData = getMultiSelectedData(gID);
			var unSelecedRowID = getUnSelectedUniqueId(gID);
			var checkAll = checkAllSelected(gID);
			var selectedarr = new Array();
			var deleteApplication = new Object();
			var selectedsource = _.where(selectedData, { ApplicationId: selectedDeleteIds[0] });
			if (checkAll == 1) {
				deleteApplication.selectedRowID = null;
				deleteApplication.unSelecedRowID = unSelecedRowID;
				deleteApplication.selectedData = selectedData;
			}
			else {
				deleteApplication.Application = selectedsource[0].ApplicationName;
				deleteApplication.selectedData = selectedData;
				deleteApplication.selectedRowID = selectedDeleteIds;
				deleteApplication.unSelecedRowID = null;
			}
			deleteApplication.checkAll = checkAll;
			selectedarr.push(deleteApplication);
			globalVariableForEditApplication = selectedarr;
		}

		$("#fileInputPDX").on('change keyup paste', function () {
			if ($("#fileInputPDX").val().trim() != "") {
				$("#btnSaveParameterDefinitionFile").prop("disabled", false);
			}
		});

		//-------------------------------- Parameter Definition File start --------------------------------
		self.showNewParameterDefinitionFile = function () {
			$("#reuseDiv").hide();
			$("#newparamDiv").show();
			self.checkParameterDefinitionFile('newParameterDefinitionFile');
			if ($("#txtPDX").val() == "")
				$("#btnSaveParameterDefinitionFile").prop("disabled", true);
			else
				$("#btnSaveParameterDefinitionFile").prop("disabled", false);
			return true;
		}

		self.showReuseParameterDefinitionFile = function () {
			$("#newparamDiv").hide();
			$("#reuseDiv").show();
			self.checkParameterDefinitionFile('reuseParameterDefinitionFile');
			if (isReuseAppSelected)
				$("#btnSaveParameterDefinitionFile").prop("disabled", false);
			else
				$("#btnSaveParameterDefinitionFile").prop("disabled", true);
			return true;
		}

		self.showReplaceParameterDefinitionFile = function () {
			$("#newparamDiv").show();
			$("#reuseDiv").hide();
			self.checkParameterDefinitionFile('replaceParameterDefinitionFile');
			if ($("#txtPDX").val() == "")
				$("#btnSaveParameterDefinitionFile").prop("disabled", true);
			else
				$("#btnSaveParameterDefinitionFile").prop("disabled", false);
			return true;
		}

		self.showNoneParameterDefinitionFile = function () {
			$("#newparamDiv").hide();
			$("#reuseDiv").hide();
			self.checkParameterDefinitionFile('noneParameterDefinitionFile');
			$("#btnSaveParameterDefinitionFile").prop("disabled", false);
			return true;
		}

		self.saveParameterDefinitionFile = function () {
			if ($("#rbtnNone").is(':checked')) {
				$('#nonePDXConfirmation').modal('show');
				$("#nonePDXMsg").text(i18n.t('parameter_definition_file_unassign_confirmation', { selectedApplicationName: globalVariableForApplicationParameter }, { lng: lang }));
			} else if ($("#rbtnNew").is(':checked')) {
				if (isDownloadAllowedFlag == false) {
					isDownloadAllowedFlag = '';
					self.assignVPDXForApplication(self.observableModelPopup);
				} else {
					isDownloadAllowedFlag = '';
					$("#PDFSaveConfirmationMsg").text(i18n.t('parameter_defination_confirmation_message', { selectedversion: selectedApplicationVersion, selectedApplicationName: selectedApplicationName }, { lng: lang }));
					$("#PDFSaveConfirmation").modal('show');
				}
			} else if ($("#rbtnReuseFromOther").is(':checked')) {
				$("#reuseConfirmationPopup").modal('show');
			} else if ($("#rbtnReplaceDefinitionFile").is(':checked')) {
				var isPFXExists = rowdata ? rowdata.IsPFXExists : false;
				if (isPFXExists) {
					getAffectedDevicesCount('vpdx', isPFXExists);
				} else {
					var newFileName = $("#txtPDX").val();
					showReplaceWarningMessage(0, 0, 'vpdx', newFileName, []);
				}
			}
		}

		self.closeParameterDefinitionFilePopup = function () {
			koUtil.vpfPDXUploadedDataArr = [];
			checkForbrowsFile = 0;
			isReuseAppSelected = false;

			//clear all values & grid
			$("#paramDefFilenamevalue").empty();
			$("#txtPDX").prop('value', '');
			$('#jqxgridParameterDefinition').jqxGrid('clear');
			$("#ViewPDXTreeGrid").jqxTreeGrid('clear');
			$("#showParamLinkDiv").hide();

			//reset radio button selection
			self.checkParameterDefinitionFile('newParameterDefinitionFile');
			self.showNewParameterDefinitionFile();

			//reset file input
			self.resetFileInput('fileInputPDX');

			$("#parameterDefinitionPopup").modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
			$("#parameterDefinitionContent").css('left', '');
			$("#parameterDefinitionContent").css('top', '');

			checkIsPopUpOPen();
		}

		self.cancelParameterDefinitionFileSave = function () {
			$("#PDFSaveConfirmation").modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
			isDownloadAllowedFlag = isDownloadAllowed;
		}

		self.replaceXMLForApplication = function (observableModelPopup) {
			if ($("#rbtnReplaceDefinitionFile").is(':checked')) {
				replaceVPDXForApplication(0, 0, true);
			} else if ($("#rbtnReplaceFormView").is(':checked')) {
				replaceVPFXForApplication();
			}
		}

		self.assignVPDXForApplication = function (observableModelPopup) {
			$("#PDFSaveConfirmation").modal('hide');
			$("#reuseConfirmationPopup").modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');

			var assignPDXForApplicationReq = new Object();
			if ($("#rbtnNew").is(':checked')) {
				assignPDXForApplicationReq.ApplicationId = selectedApplicationId;
				assignPDXForApplicationReq.FormImportType = 0;
				assignPDXForApplicationReq.PDXFileName = $("#txtPDX").val();
				assignPDXForApplicationReq.ReuseApplicationId = 0;
				var ParamDefinitionFile = VPDXFileData[0];
				assignPDXForApplicationReq.ParamDefinitionFile = ParamDefinitionFile;

			} else if ($("#rbtnReuseFromOther").is(':checked')) {
				assignPDXForApplicationReq.ApplicationId = selectedApplicationId;
				assignPDXForApplicationReq.PDXFileName = '';
				assignPDXForApplicationReq.ParamDefinitionFile = null;
				assignPDXForApplicationReq.FormImportType = ENUM.get('REUSE');
				assignPDXForApplicationReq.ReuseApplicationId = reuseApplicationId;
			}

			var callBackfunction = function (data, error) {
				self.resetFileInput('fileInputPDX');
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						checkForbrowsFile = 0;
						$("#applicationActionSuccessPopup").modal('show');
						$("#infoMessageSuccess").text(i18n.t('parameter_definition_file_success', { lng: lang }));
						self.closeParameterDefinitionFilePopup();
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_FORM_VIEW_FILE')) {	//226
						showMoreMessageLogs('vpdx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_DEFINITION_FILE')) {	//227
						showMoreMessageLogs('vpdx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_XMLFILE_FORMAT')) {				//228
						showMoreMessageLogs('vpdx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_TEMPLATE_ASSIGNED_HIERARCHY')) {		//319
						data.overWritePDXResp = $.parseJSON(data.overWritePDXResp);
						conflictHierarchyParameters.TemplateHierarchyReferenceSet = data.overWritePDXResp.TemplateHierarchyReferenceSet;
						conflictHierarchyParameters.ActionMode = "AssignPDXForApplication";
						conflictHierarchyParameters.InfoMessage = i18n.t("assign_template_of_this_app_or_package_assigned_hierarchy_vpdx", { lng: lang });
						self.openPopup('modelViewConflictDetails');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_INVALID_XSD_VERSION')) {				//354
						openAlertpopup(2, i18n.t('ex_Invalid_xsd_version_deviceimport', { schemaVersion: data.responseStatus.AdditionalInfo }, { lng: lang }));
					} else if (data.responseStatus.StatusCode == AppConstants.get('CANNOT_CREATE_A_FILE_WHEN_ALREADY_EXISTS')) {                  //29
						openAlertpopup(2, "info_not_enough_disk_spack_in_server");
					}
				}
			}

			var params = '{"token":"' + TOKEN() + '","assignPDXForApplicationReq":' + JSON.stringify(assignPDXForApplicationReq) + '}';
			ajaxJsonCall('AssignPDXForApplication', params, callBackfunction, true, 'POST', true);
		}

		function replaceVPDXForApplication(deviceApplicationCount, totalDevicesCount, isContinue) {
			$("#replaceWarningPopup").modal('hide');
			var newFileName = $("#txtPDX").val();

			var replacePDXForApplicationReq = new Object();
			replacePDXForApplicationReq.ApplicationId = selectedApplicationId;
			replacePDXForApplicationReq.ParamDefinitionFile = VPDXFileData[0];
			replacePDXForApplicationReq.PDXFileName = $("#txtPDX").val();
			replacePDXForApplicationReq.IsContinue = isContinue;

			var callBackfunction = function (data, error) {
				$("#loadingDiv").hide();
				self.resetFileInput('fileInputPDX');
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SYSTEM_BUSY') || data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED') ||
						data.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR') || data.responseStatus.StatusCode == AppConstants.get('UNAUTHORIZED_ACCESS') ||
						data.responseStatus.StatusCode == AppConstants.get('E_INVALID_INPUT_FORMAT')) {
						return;
					}

					if (!isContinue) {
						if (data.overWritePDXResp) {
							data.overWritePDXResp = $.parseJSON(data.overWritePDXResp);

							var errorList = data.overWritePDXResp.Errors;
						} else {
							var errorList = [];
						}
						showReplaceWarningMessage(deviceApplicationCount, totalDevicesCount, 'vpdx', newFileName, errorList);
						return;
					}

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						$("#applicationActionSuccessPopup").modal('show');
						if (selectedDefintionFileName == newFileName) {
							$("#infoMessageSuccess").text(i18n.t('replace_vpdx_success_same_file', { currentFileName: selectedDefintionFileName }, { lng: lang }));
						} else {
							$("#infoMessageSuccess").text(i18n.t('replace_vpdx_success_different_file', { currentFileName: selectedDefintionFileName, newFileName: newFileName }, { lng: lang }));
						}
						$('#parameterDefinitionPopup').modal('hide');
						$("#mainPageBody").removeClass('modal-open-appendon');
						self.observableModelPopup('unloadTemplate');
						self.closeParameterDefinitionFilePopup();
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_FORM_VIEW_FILE')) {			//226
						showMoreMessageLogs('vpdx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_DEFINITION_FILE')) {			//227
						showMoreMessageLogs('vpdx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_XMLFILE_FORMAT')) {						//228
						showMoreMessageLogs('vpdx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('PARENT_FORMFILE_NOT_EXISTS')) {					//266
						openAlertpopup(1, 'Parent_FormFile_Not_Exists');
					} else if (data.responseStatus.StatusCode == AppConstants.get('BASE_FORMFILE_ALREADY_EXISTS')) {				//271
						openAlertpopup(1, 'Base_FormFile_Already_Exists');
					} else if (data.responseStatus.StatusCode == AppConstants.get('DEFINITIONFILE_FORMFILE_VERSION_MISMATCH')) {	//272
						openAlertpopup(1, 'DefinitionFile_FormFile_Version_Mismatch');
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_DEFAULT_VALUE_IN_FORMFILE')) {			//281
						openAlertpopup(1, 'Invalid_Default_Value_In_FormFile');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_INVALID_XSD_VERSION')) {						//354
						openAlertpopup(2, i18n.t('ex_Invalid_xsd_version_deviceimport', { schemaVersion: data.responseStatus.AdditionalInfo }, { lng: lang }));
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_NO_CHANGE_IN_FILE')) {							//363
						openAlertpopup(1, 'e_replace_vpdx_same_content');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_DEFINITION_FORM_NAME_MISMATCH')) {				//368
						openAlertpopup(1, 'e_definition_form_name_mismatch');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_DEFINITION_FORMAT_MISMATCH')) {				//369
						openAlertpopup(1, 'e_definition_format_mismatch');
					} else if (data.responseStatus.StatusCode == AppConstants.get('CANNOT_CREATE_A_FILE_WHEN_ALREADY_EXISTS')) {                  //29
						openAlertpopup(2, "info_not_enough_disk_spack_in_server");
					}
				}
			}
			var params = '{"token":"' + TOKEN() + '","replacePDXForApplicationReq":' + JSON.stringify(replacePDXForApplicationReq) + '}';
			ajaxJsonCall('ReplacePDXForApplication', params, callBackfunction, true, 'POST', true);
		}

		self.unAssignVPDXForApplication = function (gId, observableModelPopup) {
			$('#nonePDXConfirmation').modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
			$("#loadingDiv").show();
			var unAssignPDXReq = new Object();
			unAssignPDXReq.ApplicationId = selectedApplicationId;
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						$("#applicationActionSuccessPopup").modal('show');
						$("#infoMessageSuccess").text(i18n.t('parameter_definition_file_unassign_success', { lng: lang }));
						$('#parameterDefinitionPopup').modal('hide');
						isReuseAppSelected = false;
						$("#mainPageBody").removeClass('modal-open-appendon');
						self.closeParameterDefinitionFilePopup();
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_TEMPLATE_ASSIGNED_HIERARCHY')) {		//319
						conflictHierarchyParameters.TemplateHierarchyReferenceSet = data.unAssignPDXResp.TemplateHierarchyReferenceSet;
						conflictHierarchyParameters.ActionMode = "UnAssignPDX";
						conflictHierarchyParameters.InfoMessage = i18n.t("template_of_this_app_or_package_assigned_hierarchy_vpdx", { lng: lang });
						self.openPopup('modelViewConflictDetails');
					}
					$("#loadingDiv").hide();
				}
			}

			var method = 'UnAssignPDX';
			var params = '{"token":"' + TOKEN() + '","unAssignPDXReq":' + JSON.stringify(unAssignPDXReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		//-------------------------------- Parameter Definition File end --------------------------------


		//-------------------------------- Parameter Form File start --------------------------------

		$("#fileInputVPF").on('change keyup paste', function () {
			if ($("#fileInputVPF").val() != "") {
				if (self.checkParameterFormFile() == "newParameterFormFile") {
					$("#btnSaveParameterFormFile").prop("disabled", false);
				} else if (self.checkParameterFormFile() == "replaceParameterFormFile" && selectedFormFileId > 0) {
					$("#btnSaveParameterFormFile").prop("disabled", false);
				}
			}
		});

		self.showNewParameterFormFile = function () {
			$("#reuseDivFormFile").hide();
			$("#newparamFormFileDiv").show();
			$("#noneFormFile").hide();
			self.checkParameterFormFile('newParameterFormFile');
			if ($("#txtVPF").val() == "")
				$("#btnSaveParameterFormFile").prop("disabled", true);
			else
				$("#btnSaveParameterFormFile").prop("disabled", false);

			if (PFXFiles && PFXFiles.length > 1) {
				for (var i = 0; i < PFXFiles.length; i++) {
					$("#rbtnRow" + i).addClass('disabled');
				}
			}
			return true;
		}

		self.showReuseParameterFormFile = function () {
			$("#newparamFormFileDiv").hide();
			$("#reuseDivFormFile").show();
			$("#noneFormFile").hide();
			self.checkParameterFormFile('reuseParameterFormFile');
			if (isReuseAppSelected)
				$("#btnSaveParameterFormFile").prop("disabled", false);
			else
				$("#btnSaveParameterFormFile").prop("disabled", true);

			if (PFXFiles && PFXFiles.length > 1) {
				for (var i = 0; i < PFXFiles.length; i++) {
					$("#rbtnRow" + i).addClass('disabled');
				}
			}
			return true;
		}

		self.showReplaceParameterFormFile = function () {
			$("#newparamFormFileDiv").show();
			$("#reuseDivFormFile").hide();
			$("#noneFormFile").hide();
			self.checkParameterFormFile('replaceParameterFormFile');
			if ($("#txtVPF").val() != "" && selectedFormFileId > 0)
				$("#btnSaveParameterFormFile").prop("disabled", false);
			else
				$("#btnSaveParameterFormFile").prop("disabled", true);

			if (PFXFiles && PFXFiles.length > 1) {
				for (var i = 0; i < PFXFiles.length; i++) {
					$("#rbtnRow" + i).removeClass('disabled');
				}
			}
			return true;
		}

		self.showNoneParameterFormFile = function () {
			$("#newparamFormFileDiv").hide();
			$("#reuseDivFormFile").hide();
			$("#noneFormFile").show();
			self.checkParameterFormFile('noneParameterFormFile');
			$("#btnSaveParameterFormFile").prop("disabled", false);
			var arr = getSelectedData('jqxgridApplications');
			if (arr.FormFileId == 0) {
				$("#btnSaveParameterFormFile").prop("disabled", true);
			}

			if (PFXFiles && PFXFiles.length > 1) {
				for (var i = 0; i < PFXFiles.length; i++) {
					$("#rbtnRow" + i).addClass('disabled');
				}
			}
			return true;
		}

		self.closeParameterFormFilePopup = function () {
			isReuseAppSelected = false;

			//clear all values & grid
			selectedFormFileId = 0;
			$("#txtVPF").prop('value', '');
			$("#vpfxFileName").empty();
			$("#vpfxDescription").empty();
			$("#descriptionParameterViewFile").empty();
			$("#descriptionParameterViewFile").val("");
			$('#jqxgridFormViewFile').jqxGrid('clear');

			//reset radio button selection
			self.checkParameterFormFile('newParameterFormFile');
			self.showNewParameterFormFile();

			//reset file input
			self.resetFileInput('fileInputVPF');

			$("#parameterFormViewPopup").modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
			$("#parameterFormViewContent").css('left', '');
			$("#parameterFormViewContent").css('top', '');
		}

		self.saveParameterFormFile = function () {
			if ($("#rbtnNoneFormView").is(':checked')) {
				$('#nonePFXConfirmation').modal('show');
				$("#nonePFXMsg").text(i18n.t('parameters_of_application', { selectedApplicationName: selectedApplicationName }, { lng: lang }));
			} else if ($("#rbtnNewFormView").is(':checked')) {
				self.assignVPFXForApplication();
			} else if ($("#rbtnReuseFormView").is(':checked')) {
				$("#reuseConfirmationPopup").modal('show');
			} else if ($("#rbtnReplaceFormView").is(':checked')) {
				getAffectedDevicesCount('vpfx', true);
			}
		}

		self.saveForReuse_PDX_PFX = function () {
			if ($("#rbtnReuseFromOther").is(':checked')) {
				self.assignVPDXForApplication(self.observableModelPopup);
			} else if ($("#rbtnReuseFormView").is(':checked')) {
				self.reuseVPFXForApplication();
			}
		}

		self.assignVPFXForApplication = function () {
			var assignPFXForApplicationReq = new Object();
			assignPFXForApplicationReq.ApplicationId = selectedApplicationId;
			assignPFXForApplicationReq.VPDXVersion = selectedVPDXVersion;
			assignPFXForApplicationReq.Description = $("#descriptionParameterViewFile").val();
			assignPFXForApplicationReq.FileName = $("#txtVPF").val();
			var PFXXml = VPFXFileData[0];
			assignPFXForApplicationReq.PFXXml = PFXXml;

			var callBackfunction = function (data, error) {
				self.resetFileInput('fileInputVPF');
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						$("#applicationActionSuccessPopup").modal('show');
						$("#infoMessageSuccess").text(i18n.t('form_view_file_added', { lng: lang }));
						$('#parameterFormViewPopup').modal('hide');
						isReuseAppSelected = false;
						$("#mainPageBody").removeClass('modal-open-appendon');
						self.observableModelPopup('unloadTemplate');
						$("#descriptionParameterViewFile").empty();
						self.closeParameterFormFilePopup();
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_FORM_VIEW_FILE')) {				//226
						showMoreMessageLogs('vpfx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_DEFINITION_FILE')) {				//227
						showMoreMessageLogs('vpfx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_XMLFILE_FORMAT')) {							//228
						showMoreMessageLogs('vpfx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('PARENT_FORMFILE_NOT_EXISTS')) {						//266
						openAlertpopup(1, 'Parent_FormFile_Not_Exists');
					} else if (data.responseStatus.StatusCode == AppConstants.get('CHILDFORMFILE_ALREADY_EXISTS')) {					//267
						openAlertpopup(1, 'ChildFormFile_Already_Exists');
					} else if (data.responseStatus.StatusCode == AppConstants.get('FORMFILE_ALREADY_EXISTS')) {							//269
						openAlertpopup(1, 'FormFile_Already_Exists');
					} else if (data.responseStatus.StatusCode == AppConstants.get('BASE_FORMFILE_ALREADY_EXISTS')) {					//271
						openAlertpopup(1, 'Base_FormFile_Already_Exists');
					} else if (data.responseStatus.StatusCode == AppConstants.get('DEFINITIONFILE_FORMFILE_VERSION_MISMATCH')) {		//272
						openAlertpopup(1, 'DefinitionFile_FormFile_Version_Mismatch');
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_DEFAULT_VALUE_IN_FORMFILE')) {				//281
						openAlertpopup(1, 'Invalid_Default_Value_In_FormFile');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_MULTIINSTANCE_GRIDOPERATION')) {		//305
						showMoreMessageLogs('vpfx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_MULTIINSTANCE_SHOWINGRID')) {		//306
						showMoreMessageLogs('vpfx', i18n.t('e_required_vpfx_multiinstance_showingrid'));
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_MULTIINSTANCE_PRIMARYIDENTIFIER')) {	//307
						showMoreMessageLogs('vpfx', i18n.t('e_required_vpfx_multiinstance_primaryidentifier'));
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_SEQUENCE')) {						//310
						showMoreMessageLogs('vpfx', i18n.t('e_required_vpfx_sequence'));
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_INVALID_XSD_VERSION')) {							//354
						openAlertpopup(2, i18n.t('ex_Invalid_xsd_version_deviceimport', { schemaVersion: data.responseStatus.AdditionalInfo }, { lng: lang }));
					} else if (data.responseStatus.StatusCode == AppConstants.get('CANNOT_CREATE_A_FILE_WHEN_ALREADY_EXISTS')) {                  //29
						openAlertpopup(2, "info_not_enough_disk_spack_in_server");
					}
				}
			}
			var params = '{"token":"' + TOKEN() + '","assignPFXForApplicationReq":' + JSON.stringify(assignPFXForApplicationReq) + '}';
			ajaxJsonCall('AssignPFXForApplication', params, callBackfunction, true, 'POST', true);
		}

		self.reuseVPFXForApplication = function () {
			$("#reuseConfirmationPopup").modal('hide');

			var reusePFXForApplicationReq = new Object();
			reusePFXForApplicationReq.ApplicationId = selectedApplicationId;
			reusePFXForApplicationReq.ReuseApplicationId = reuseApplicationId;

			var callBackfunction = function (data, error) {
				self.resetFileInput('fileInputVPF');
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						$("#applicationActionSuccessPopup").modal('show');
						$("#infoMessageSuccess").text(i18n.t('form_view_file_added', { lng: lang }));
						$('#parameterFormViewPopup').modal('hide');
						isReuseAppSelected = false;
						$("#mainPageBody").removeClass('modal-open-appendon');
						self.observableModelPopup('unloadTemplate');
						$("#descriptionParameterViewFile").empty();
						self.closeParameterFormFilePopup();
					} else if (data.responseStatus.StatusCode == AppConstants.get('PARENT_FORMFILE_NOT_EXISTS')) {					//266
						openAlertpopup(1, 'Parent_FormFile_Not_Exists');
					} else if (data.responseStatus.StatusCode == AppConstants.get('CHILDFORMFILE_ALREADY_EXISTS')) {				//267
						openAlertpopup(1, 'ChildFormFile_Already_Exists');
					} else if (data.responseStatus.StatusCode == AppConstants.get('FORMFILE_ALREADY_EXISTS')) {						//269
						openAlertpopup(1, 'FormFile_Already_Exists');
					} else if (data.responseStatus.StatusCode == AppConstants.get('BASE_FORMFILE_ALREADY_EXISTS')) {				//271
						openAlertpopup(1, 'Base_FormFile_Already_Exists');
					} else if (data.responseStatus.StatusCode == AppConstants.get('DEFINITIONFILE_FORMFILE_VERSION_MISMATCH')) {	//272
						openAlertpopup(1, 'DefinitionFile_FormFile_Version_Mismatch');
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_DEFAULT_VALUE_IN_FORMFILE')) {			//281
						openAlertpopup(1, 'Invalid_Default_Value_In_FormFile');
					}
				}
			}
			var params = '{"token":"' + TOKEN() + '","reusePFXForApplicationReq":' + JSON.stringify(reusePFXForApplicationReq) + '}';
			ajaxJsonCall('ReusePFXForApplication', params, callBackfunction, true, 'POST', true);
		}

		function getAffectedDevicesCount(fileType, isPFXExists) {
			$("#loadingDiv").show();
			function callbackFunction(data, error) {
				$("#loadingDiv").hide();
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						deviceApplicationCount = data.affectedDeviceCount;

						if (deviceApplicationCount > 0) {
							var totalDevicesCount = 0;
							if (customerData && customerData.length > 0) {
								if (customerData[0].CustomerLicenseInfo && customerData[0].CustomerLicenseInfo.NumberOfDeviceCount) {
									totalDevicesCount = customerData[0].CustomerLicenseInfo.NumberOfDeviceCount;
								}
							}
						}

						if (fileType == "vpdx") {
							var newFileName = $("#txtPDX").val();
							if (isPFXExists) {
								replaceVPDXForApplication(deviceApplicationCount, totalDevicesCount, false);
								return;
							}
						} else {
							var newFileName = $("#txtVPF").val();
						}


						showReplaceWarningMessage(deviceApplicationCount, totalDevicesCount, fileType, newFileName, []);
					}
				}
			}

			var method = 'GetDeviceApplicationCount';
			var params = '{"token":"' + TOKEN() + '","applicationId":"' + selectedApplicationId + '"}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		function showReplaceWarningMessage(deviceApplicationCount, totalDevicesCount, fileType, newFileName, errorList) {
			$("#additionalInfoMsg").hide();
			$("#additionalInfoMsgNoAffectedDevice").hide();
			$("#replaceWarningDiv").hide();
			$("#replaceConfirmationDiv").hide();
			$("#additionalInfoMsg").html('');
			$("#additionalInfoMsgNoAffectedDevice").html('');
			$("#replaceWarningPopup").modal('show');

			if (errorList && errorList.length > 0) {
				var additionalInfo = '';
				for (var i = 0; i < errorList.length; i++) {
					if (i >= 0 && i <= errorList.length) {
						additionalInfo += "&#9632 ";
					}

					var containerName = errorList[i].AdditionalInfo ? errorList[i].AdditionalInfo : '';
					if (errorList[i].ErrorCode == AppConstants.get('PARAMETERS_ARE_MODIFIED')) {
						additionalInfo += i18n.t('replace_vpdx_parameter_changes', { containerName: "<strong>" + containerName + "</strong>" }, { lng: lang });
					} else if (errorList[i].ErrorCode == AppConstants.get('CONTAINER_MODIFIED')) {
						additionalInfo += i18n.t('replace_vpdx_container_removed', { containerName: "<strong>" + containerName + "</strong>" }, { lng: lang });
					} else if (errorList[i].ErrorCode == AppConstants.get('IDENTIFIER_MODIFIED')) {
						additionalInfo += i18n.t('replace_vpdx_parameter_identifier_changes', { containerName: "<strong>" + containerName + "</strong>" }, { lng: lang });
					}

					if (i >= 0 && i < errorList.length - 1) {
						additionalInfo += '</br>';
					}
				}
				if (deviceApplicationCount > 0) {
					$("#additionalInfoMsg").show();
					$("#additionalInfoMsg").html(additionalInfo);
				} else {
					$("#additionalInfoMsgNoAffectedDevice").show();
					$("#additionalInfoMsgNoAffectedDevice").html(additionalInfo);
				}
			}

			if (deviceApplicationCount > 0) {								//if one or more devices affected
				$("#replaceWarningDiv").show();
				$("#affectedDevicesCount").text(deviceApplicationCount);
				$("#totalDevicesCountApplications").html(i18n.t('replace_total_devices_count', { totalDevicesCount: "<strong>" + totalDevicesCount + "</strong>" }, { lng: lang }));
				if (fileType == "vpdx") {									//if file type is VPDX
					if (selectedDefintionFileName == newFileName) {			//replacing with same file name
						$("#replaceWarningMsg").html(i18n.t('replace_vpdx_warning_same_file', { currentFileName: "<strong>" + selectedDefintionFileName + "</strong>" }, { lng: lang }));
					} else {
						$("#replaceWarningMsg").html(i18n.t('replace_vpdx_warning_different_file', { currentFileName: "<strong>" + selectedDefintionFileName + "</strong>", newFileName: "<strong>" + newFileName + "</strong>" }, { lng: lang }));
					}
				} else {
					if (selectedIsMultiVPFXFileSupported) {					//for multi instances
						if (selectedFormViewFileName == newFileName) {		//replacing with same file name
							$("#replaceWarningMsg").html(i18n.t('replace_vpfx_warning_multi_instance_same_file', { level: "<strong>" + selectedFormFileLevel + "</strong>", currentFileName: "<strong>" + selectedFormViewFileName + "</strong>" }, { lng: lang }));
						} else {
							$("#replaceWarningMsg").html(i18n.t('replace_vpfx_warning_multi_instance_different_file', { level: "<strong>" + selectedFormFileLevel + "</strong>", currentFileName: "<strong>" + selectedFormViewFileName + "</strong>", newFileName: "<strong>" + newFileName + "</strong>" }, { lng: lang }));
						}
					} else {
						if (selectedFormViewFileName == newFileName) {		//replacing with same file name
							$("#replaceWarningMsg").html(i18n.t('replace_vpfx_warning_same_file', { currentFileName: "<strong>" + selectedFormViewFileName + "</strong>" }, { lng: lang }));
						} else {
							$("#replaceWarningMsg").html(i18n.t('replace_vpfx_warning_different_file', { currentFileName: "<strong>" + selectedFormViewFileName + "</strong>", newFileName: "<strong>" + newFileName + "</strong>" }, { lng: lang }));
						}
					}
				}
			} else {
				$("#replaceConfirmationDiv").show();
				if (fileType == "vpdx") {									//if file type is VPFX
					if (selectedDefintionFileName == newFileName) {			//replacing with same file name
						$("#replaceConfirmationMsg").html(i18n.t('replace_vpdx_confirmation_same_file', { currentFileName: "<strong>" + selectedDefintionFileName + "</strong>" }, { lng: lang }));
					} else {
						$("#replaceConfirmationMsg").html(i18n.t('replace_vpdx_confirmation_different_file', { currentFileName: "<strong>" + selectedDefintionFileName + "</strong>", newFileName: "<strong>" + newFileName + "</strong>" }, { lng: lang }));
					}
				} else {
					if (selectedIsMultiVPFXFileSupported) {					//for multi instances
						if (selectedFormViewFileName == newFileName) {		//replacing with same file name
							$("#replaceConfirmationMsg").html(i18n.t('replace_vpfx_confirmation_multi_instance_same_file', { level: "<strong>" + selectedFormFileLevel + "</strong>", currentFileName: "<strong>" + selectedFormViewFileName + "</strong>" }, { lng: lang }));
						} else {
							$("#replaceConfirmationMsg").html(i18n.t('replace_vpfx_confirmation_multi_instance_different_file', { level: "<strong>" + selectedFormFileLevel + "</strong>", currentFileName: "<strong>" + selectedFormViewFileName + "</strong>", newFileName: "<strong>" + newFileName + "</strong>" }, { lng: lang }));
						}
					} else {
						if (selectedFormViewFileName == newFileName) {		//replacing with same file name
							$("#replaceConfirmationMsg").html(i18n.t('replace_vpfx_confirmation_same_file', { currentFileName: "<strong>" + selectedFormViewFileName + "</strong>" }, { lng: lang }));
						} else {
							$("#replaceConfirmationMsg").html(i18n.t('replace_vpfx_confirmation_different_file', { currentFileName: "<strong>" + selectedFormViewFileName + "</strong>", newFileName: "<strong>" + newFileName + "</strong>" }, { lng: lang }));
						}
					}
				}
			}
		}

		function replaceVPFXForApplication() {
			$("#replaceWarningPopup").modal('hide');
			var newFileName = $("#txtVPF").val();

			var replacePFXForApplicationReq = new Object();
			replacePFXForApplicationReq.ApplicationId = selectedApplicationId;
			replacePFXForApplicationReq.PFXXml = VPFXFileData[0];
			replacePFXForApplicationReq.FileName = $("#txtVPF").val();
			replacePFXForApplicationReq.Description = $("#descriptionParameterViewFile").val();
			replacePFXForApplicationReq.FormFileId = selectedFormFileId;

			var callBackfunction = function (data, error) {
				$("#loadingDiv").hide();
				self.resetFileInput('fileInputVPF');
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						$("#applicationActionSuccessPopup").modal('show');
						if (selectedFormViewFileName == newFileName) {
							$("#infoMessageSuccess").text(i18n.t('replace_vpfx_success_same_file', { currentFileName: selectedFormViewFileName }, { lng: lang }));
						} else {
							$("#infoMessageSuccess").text(i18n.t('replace_vpfx_success_different_file', { currentFileName: selectedFormViewFileName, newFileName: newFileName }, { lng: lang }));
						}
						$('#parameterFormViewPopup').modal('hide');
						$("#descriptionParameterViewFile").empty();
						$("#mainPageBody").removeClass('modal-open-appendon');
						self.observableModelPopup('unloadTemplate');
						self.closeParameterFormFilePopup();
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_FORM_VIEW_FILE')) {					//226
						showMoreMessageLogs('vpfx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_DEFINITION_FILE')) {					//227
						showMoreMessageLogs('vpfx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_XMLFILE_FORMAT')) {								//228
						showMoreMessageLogs('vpfx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('PARENT_FORMFILE_NOT_EXISTS')) {							//266
						openAlertpopup(1, 'Parent_FormFile_Not_Exists');
					} else if (data.responseStatus.StatusCode == AppConstants.get('BASE_FORMFILE_ALREADY_EXISTS')) {						//271
						openAlertpopup(1, 'Base_FormFile_Already_Exists');
					} else if (data.responseStatus.StatusCode == AppConstants.get('DEFINITIONFILE_FORMFILE_VERSION_MISMATCH')) {			//272
						openAlertpopup(1, 'DefinitionFile_FormFile_Version_Mismatch');
					} else if (data.responseStatus.StatusCode == AppConstants.get('INVALID_DEFAULT_VALUE_IN_FORMFILE')) {					//281
						openAlertpopup(1, 'Invalid_Default_Value_In_FormFile');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_MULTIINSTANCE_GRIDOPERATION')) {			//305
						showMoreMessageLogs('vpfx', data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_MULTIINSTANCE_SHOWINGRID')) {			//306
						showMoreMessageLogs('vpfx', i18n.t('e_required_vpfx_multiinstance_showingrid'));
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_MULTIINSTANCE_PRIMARYIDENTIFIER')) {		//307
						showMoreMessageLogs('vpfx', i18n.t('e_required_vpfx_multiinstance_primaryidentifier'));
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_SEQUENCE')) {							//310
						showMoreMessageLogs('vpfx', i18n.t('e_required_vpfx_sequence'));
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_INVALID_XSD_VERSION')) {								//354
						openAlertpopup(2, i18n.t('ex_Invalid_xsd_version_deviceimport', { schemaVersion: data.responseStatus.AdditionalInfo }, { lng: lang }));
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_NO_CHANGE_IN_FILE')) {									//363
						openAlertpopup(1, 'e_replace_vpfx_same_content');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_FORM_FILE_LEVEL_MISMATCH')) {							//364
						openAlertpopup(1, 'e_form_file_level_mismatch');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_FORM_FILE_PARENT_MISMATCH')) {							//365
						openAlertpopup(1, 'e_form_file_parent_mismatch');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_CONTAINER_WITH_PRIMARY_IDENTIFIER_CANNOT_BE_MODIFIED')) {//366
						openAlertpopup(1, 'e_container_with_primary_identifier_cannot_be_modified');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_PRIMARY_IDENTIFIER_CANNOT_BE_MODIFIED')) {				//367
						openAlertpopup(1, 'e_primary_identifier_cannot_be_modified');
					} else if (data.responseStatus.StatusCode == AppConstants.get('CANNOT_CREATE_A_FILE_WHEN_ALREADY_EXISTS')) {                  //29
						openAlertpopup(2, "info_not_enough_disk_spack_in_server");
					}
				}
			}
			var params = '{"token":"' + TOKEN() + '","replacePFXForApplicationReq":' + JSON.stringify(replacePFXForApplicationReq) + '}';
			ajaxJsonCall('ReplacePFXForApplication', params, callBackfunction, true, 'POST', true);
		}

		//None
		self.unAssignVPFXForApplication = function (gId, observableModelPopup) {
			$('#nonePFXConfirmation').modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
			$("#loadingDiv").show();
			var unAssignFXReq = new Object();
			unAssignFXReq.ApplicationId = selectedApplicationId;
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						$("#applicationActionSuccessPopup").modal('show');
						$("#infoMessageSuccess").text(i18n.t('parameter_form_view_file_unassign_success', { lng: lang }));
						$('#parameterFormViewPopup').modal('hide');
						isReuseAppSelected = false;
						$("#mainPageBody").removeClass('modal-open-appendon');
						self.closeParameterFormFilePopup();
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_TEMPLATE_ASSIGNED_HIERARCHY')) {		//319
						conflictHierarchyParameters.TemplateHierarchyReferenceSet = data.unAssignPFXResp.TemplateHierarchyReferenceSet;
						conflictHierarchyParameters.ActionMode = "UnAssignPFX";
						conflictHierarchyParameters.InfoMessage = i18n.t("template_of_this_app_or_package_assigned_hierarchy_vpfx", { lng: lang });
						self.openPopup('modelViewConflictDetails');
					}
					$("#loadingDiv").hide();
				}
			}

			var method = 'UnAssignPFX';
			var params = '{"token":"' + TOKEN() + '","unAssignPFXReq":' + JSON.stringify(unAssignFXReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		//-------------------------------- Parameter Form File end --------------------------------

		//-------------------------------- Parameter Template start --------------------------------

		self.closeParameterTemplatePopup = function () {
			$("#mainPageBody").removeClass('modal-open-appendon');

			//clear grid and hide popup
			$("#parameterTemplatePopup").modal('hide');
			gridFilterClear('templateGrid');
			isLookupTemplate = false;

			$("#parameterTemplatePopupHeaderContent").css('left', '');
			$("#parameterTemplatePopupHeaderContent").css('top', '');

		}
		self.cancelReset = function () {
			$('#deleteTemplateConfirmation').modal('hide');
			$('#deleteTemplateLookupConfirmation').modal('hide');
			$('#nonePDXConfirmation').modal('hide');
			$('#nonePFXConfirmation').modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
		}

		self.deleteTemplateClick = function () {
			var selectedtemplate = getMultiSelectedData('templateGrid');
			if (!_.isEmpty(selectedtemplate) && selectedtemplate.length === 0) {
				openAlertpopup(1, 'select_a_parameter_template_to_delete');
			} else if (isParameterTemplateLocked('templateGrid', 2, selectedtemplate)) {
				return;
			} else {
				$('#deleteTemplateConfirmation').modal('show');
			}
		}

		self.deleteTemplate = function (gId, observableModelPopup, isContinue) {
			$('#deleteTemplateConfirmation').modal('hide');
			$('#deleteTemplateLookupConfirmation').modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
			var selectedDeleteIds = getSelectedUniqueId(gId);
			var unSelecedDeleteIds = getUnSelectedUniqueId(gId);
			var checkAll = checkAllSelected(gId);
			var deleteApplicationParameterTemplateReq = new Object();

			var Selector = new Object();
			if (checkAll == 1) {
				deleteApplicationParameterTemplateReq.IsAllSelected = true;
				Selector.SelectedItemIds = null;
				Selector.UnSelectedItemIds = unSelecedDeleteIds;
			}
			else {
				deleteApplicationParameterTemplateReq.IsAllSelected = false;
				Selector.SelectedItemIds = selectedDeleteIds;
				Selector.UnSelectedItemIds = null;
			}
			deleteApplicationParameterTemplateReq.ApplicationId = selectedApplicationId;
			deleteApplicationParameterTemplateReq.Selector = Selector;
			deleteApplicationParameterTemplateReq.IsCanceled = false;
			deleteApplicationParameterTemplateReq.IsContinue = isContinue;

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						gridFilterClear(gId);
						var count = data.deleteApplicationParameterTemplateResp.DeletedParameterTemplatesCount;
						if (count == 0) {
							openAlertpopup(1, 'p_t_add_delete_unsuccess');
						} else {
							openAlertpopup(0, 'p_t_add_delete');
						}
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_APPLICATION_TEMPLATE_REFERENCED_TO_LOOKUP_TEMPLATE')) {	//372
						$('#deleteTemplateLookupConfirmation').modal('show');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_LOOKUP_TEMPLATE_REFERENCED_IN_APPLICATION_TEMPLATES')) {	//374
						openAlertpopup(1, 'p_t_lookup_delete_unsuccess');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_TEMPLATE_ASSIGNED_HIERARCHY')) {							//319
						conflictHierarchyParameters.TemplateHierarchyReferenceSet = data.deleteApplicationParameterTemplateResp.TemplateHierarchyReferenceSet;
						conflictHierarchyParameters.ActionMode = "DeleteApplicationParameterTemplate";
						conflictHierarchyParameters.InfoMessage = i18n.t("template_of_this_app_or_package_assigned_hierarchy_del_package", { lng: lang });
						self.openPopup('modelViewConflictDetails');
					}
				}
			}

			var method = 'DeleteApplicationParameterTemplate';
			var params = '{"token":"' + TOKEN() + '","deleteApplicationParameterTemplateReq":' + JSON.stringify(deleteApplicationParameterTemplateReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}
		///////////////////////end of delete template

		self.lockParameterTemplateClick = function (gridId, isLock) {

            var selecteItemIds = getSelectedUniqueId(gridId);
			if (selecteItemIds.length == 1) {
				var pageinfo = $("#" + gridId).jqxGrid('getpaginginformation');
				var startrow = Number(pageinfo.pagenum) * Number(pageinfo.pagesize);
				for (var i = startrow; i < startrow + pageinfo.pagesize; i++) {
					var value = $("#" + gridId).jqxGrid('getcellvalue', i, "isSelected");
					if (value > 0) {
						var selectedParameterTemplateLockStatus = $("#" + gridId).jqxGrid('getcellvalue', i, "IsLocked");
						if(selectedParameterTemplateLockStatus == isLock)
						{
							openAlertpopup(1, isLock ? 'already_unlock_parameter_template' : 'already_lock_parameter_template');
							return;
						}
					}
				}
			}
			
			self.isLock(isLock);

            if (selecteItemIds.length >= 1) {     
                if(isLock)
                {
                    $('#UnlockPTConfirmMsg').hide();
                    $('#LockPTConfirmMsg').show();    
                }
                else
                {
                    $('#UnlockPTConfirmMsg').show();
                    $('#LockPTConfirmMsg').hide();  
                }       
                $('#lockPTConfirmation').modal('show');
            } else if (selecteItemIds.length == 0) {
                openAlertpopup(1, 'please_select_a_parameter_template');
                return;
            }
        }

		self.lockTemplate = function (gridId) {
            var selectedTemplateItems = getSelectedUniqueId(gridId);
            var unselectedTemplateItems = getUnSelectedUniqueId(gridId);
            var checkAll = checkAllSelected(gridId);
            var lockUnlockApplicationParameterTemplateReq = new Object();
            var Selector = new Object();

            if (checkAll == 1) {
                Selector.SelectedItemIds = null;
                Selector.UnSelectedItemIds = unselectedTemplateItems;
            } else {
                Selector.SelectedItemIds = selectedTemplateItems;
                Selector.UnSelectedItemIds = null;
            }

            lockUnlockApplicationParameterTemplateReq.Selector = Selector;
            lockUnlockApplicationParameterTemplateReq.IsLock =  self.isLock();

			lockUnlockApplicationParameterTemplateReq.SelectedApplicationName = $('#applicationName').val();
			lockUnlockApplicationParameterTemplateReq.SelectedApplicationVersion = $('#applicationVersion').val();

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        gridFilterClear(gridId);
                        $('#lockPTConfirmation').modal('hide');
                        openAlertpopup(0, self.isLock() ? 'parameter_template_lock' : 'parameter_template_unlock');
                    }
                }
            }

            var method = 'LockUnlockApplicationParameterTemplate';
            var params = '{"token":"' + TOKEN() + '","lockUnlockApplicationParameterTemplateReq":' + JSON.stringify(lockUnlockApplicationParameterTemplateReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

		//Copy template////////////////////////
		self.exportToExceltemplate = function (isExport, gId) {
			var checkAll = checkAllSelected(gId);
			visibleColumnsListForPopup = GetExportVisibleColumn(gId);
			var param = templateGridParam(true, columnSortFilter, selectedApplicationId, visibleColumnsListForPopup);
			var datainfo = $("#" + gId).jqxGrid('getdatainformation');
			if (datainfo.rowscount > 0) {
				templateGridExport(param, gId, self.openPopup);
			} else {
				openAlertpopup(1, 'no_data_to_export');
			}
		}

		self.exportParameterTemplatesToXML = function (gId) {
			var Selector = new Object();
			var selecteItemIds = getSelectedUniqueId(gId);
			var unSelectedItemIds = getUnSelectedUniqueId(gId);
			var checkAll = checkAllSelected(gId);

			if (checkAll == 1) {
				exportTemplatesToXML(gId, selecteItemIds, unSelectedItemIds);
			} else if (selecteItemIds && selecteItemIds.length > 0) {
				exportTemplatesToXML(gId, selecteItemIds, unSelectedItemIds);
			} else {
				openAlertpopup(1, 'please_selct_row');
			}
		}

		function exportTemplatesToXML(gId, selecteItemIds, unSelectedItemIds) {

			var exportParameterTemplatesToXMLReq = new Object();
			var Selector = new Object();
			var checkAll = checkAllSelected(gId);
			if (checkAll == 1) {
				Selector.SelectedItemIds = null;
				if (unSelectedItemIds.length > 0) {
					Selector.UnSelectedItemIds = unSelectedItemIds;
				} else {
					Selector.UnSelectedItemIds = null;
				}
			} else {
				Selector.SelectedItemIds = selecteItemIds;
				Selector.UnSelectedItemIds = null;
			}

			exportParameterTemplatesToXMLReq.Selector = Selector;
			exportParameterTemplatesToXMLReq.ApplicationId = selectedApplicationId;
			exportParameterTemplatesToXMLReq.ColumnSortFilter = columnSortFilter;

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(1, 'export_Sucess');
					}
				}
			}
			var method = 'ExportParameterTemplatesToXML';
			var params = '{"token":"' + TOKEN() + '","exportParametersTemplateToXMLReq":' + JSON.stringify(exportParameterTemplatesToXMLReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		//Grid Call
		var param = applicationsParameters(false, columnSortFilterforApplication, null, []);
		applicationsGrid('jqxgridApplications', param, self.openPopup, self.appGid, self.createTemplateOptions);

		seti18nResourceData(document, resourceStorage);
	};

	function applicationsGrid(gID, param, openPopup, appGid, createTemplateOptions) {
		var InitGridStoragObj = initGridStorageObj(gID);
		var gridStorage = InitGridStoragObj.gridStorage;
		var adStorage = InitGridStoragObj.adStorage;

		var gridheight = $(window).height();

		var source =
		{
			dataType: "json",
			dataFields: [
				{ name: 'isSelected', type: 'number' },
				{ name: 'ApplicationId', map: 'ApplicationId' },
				{ name: 'ApplicationName', map: 'ApplicationName' },
				{ name: 'ApplicationVersion', map: 'ApplicationVersion' },
				{ name: 'PackageNames', map: 'PackageNames' },
				{ name: 'ParameterDefinitionFile', map: 'ParameterDefinitionFile' },
				{ name: 'ParameterFormFile', map: 'ParamFormFiles' },
				{ name: 'AppGID', map: 'AppGID' },
				{ name: 'IsParameterizationEnabled', map: 'IsParameterizationEnabled' },
				{ name: 'ParamDefinitionId', map: 'ParamDefinitionId' },
				{ name: 'FormFileId', map: 'FormFileId' },
				{ name: 'IsPDXExists', map: 'IsPDXExists' },
				{ name: 'IsPFXExists', map: 'IsPFXExists' },
				{ name: 'IsDirectApplication', map: 'IsDirectApplication' },
				{ name: 'PDXFileName', map: 'PDXFileName' },
				{ name: 'FileName', map: 'FileName' },
				{ name: 'ParamFormFiles', map: 'ParamFormFiles' },
				{ name: 'Description', map: 'Description' },
				{ name: 'IsMultiVPFXSupported', map: 'IsMultiVPFXSupported' },
				{ name: 'VPDXVersion', map: 'VPDXVersion' },
				{ name: 'OriginalPDXFile', map: 'OriginalPDXFile' },
				{ name: 'Component', map: 'Component' },
				{ name: 'Family', map: 'Family' },
			],
			root: 'Applications',
			type: "POST",
			data: param,

			url: AppConstants.get('API_URL') + "/GetApplications",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data.GetApplicationsResult == true) {
					if (data.getApplicationsResp.PaginationResponse && data.getApplicationsResp.PaginationResponse.TotalRecords > 0) {
						source.totalrecords = data.getApplicationsResp.PaginationResponse.TotalRecords;
						source.totalpages = data.getApplicationsResp.PaginationResponse.TotalPages;
					} else {
						source.totalrecords = 0;
						source.totalpages = 0;
						data.getApplicationsResp.Applications = [];
					}
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
					//data.getApplicationsResp.Applications = [];
				}
			},

		};


		var dataAdapter = new $.jqx.dataAdapter(source,
			{
				formatData: function (data) {
					$('.all-disabled').show();
					disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
					columnSortFilter = new Object();
					columnSortFilter = columnSortFilterFormatedData(columnSortFilterforApplication, gID, gridStorage, 'Application');
					koUtil.GlobalColumnFilter = columnSortFilter;

					param.getApplicationsReq.ColumnSortFilter = columnSortFilter;
					param.getApplicationsReq.Pagination = getPaginationObject(param.getApplicationsReq.Pagination, gID);

					updatepaginationOnState(gID, gridStorage, param.getApplicationsReq.Pagination, null, null);

					data = JSON.stringify(param);
					return data;
				},
				downloadComplete: function (data, status, xhr) {

					enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
					if (data) {

						if (data.getApplicationsResp) {

							for (var i = 0; i < data.getApplicationsResp.Applications.length; i++) {
								if (data.getApplicationsResp.Applications[i].IsDirectApplication == true) {
									data.getApplicationsResp.Applications[i].PackageNames = 'Not Applicable';
								}
							}
							if (data.getApplicationsResp.TotalSelectionCount != 'undefined') {
								gridStorage[0].TotalSelectionCount = data.getApplicationsResp.TotalSelectionCount;
								var updatedGridStorage = JSON.stringify(gridStorage);
								window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
							}

							//if (data.getApplicationsResp.PaginationResponse && data.getApplicationsResp.PaginationResponse.HighLightedItemPage > 0) {
							//    gridStorage[0].highlightedPage = data.getApplicationsResp.PaginationResponse.HighLightedItemPage;
							//    var updatedGridStorage = JSON.stringify(gridStorage);
							//    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
							//    //}
							//    //}
							//}



						} else {
							source.totalrecords = 0;
							source.totalpages = 0;
							data.getApplicationsResp = new Object();
							data.getApplicationsResp.Applications = [];

						}
						$('.all-disabled').hide();
					} else {
						data.getApplicationsResp.Applications = [];
					}
					var hideSelect = function () {
						$("#columntablejqxgridApplications").find('.jqx-grid-column-header:first').hide();
					}
					setTimeout(hideSelect, 1000);
				},
				loadError: function (jqXHR, status, error) {
					$('.all-disabled').hide();
					openAlertpopup(2, 'network_error');
				}
			}
		);

		//for allcheck
		var rendered = function (element) {
			enablegridfunctions(gID, 'ApplicationId', element, gridStorage, false, 'pagerDivApplication', false, 1, 'IsDirectApplication', null, null, null);
			return true;
		}

		var cellclass = function (row, columnfield, value) {
			var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'IsDirectApplication');
			return classname;
		}

		var cellbeginedit = function (row, datafield, columntype, value) {
			var check = $("#" + gID).jqxGrid('getcellvalue', row, 'IsDirectApplication');
			if (check == true) {
				return true;
			} else {
				return false;
			}
		}

		var parameterDefinitionRenderer = function (row, column, value) {
			var applicationId = $("#" + gID).jqxGrid('getcellvalue', row, 'ApplicationId');
			var IsPDXExists = $("#" + gID).jqxGrid('getcellvalue', row, 'IsPDXExists');
			var Component = $("#" + gID).jqxGrid('getcellvalue', row, 'Component');
			var Family = $("#" + gID).jqxGrid('getcellvalue', row, 'Family');

			var html = '<div>';
			if (Component == ENUM.get("Android") && (Family && Family.toUpperCase() == AppConstants.get('CARBON_FAMILY')))
				return '';

			if (isConfigureAllowed == true) {
				if (IsPDXExists == true) {
					if (isDownloadAllowed == false) {
						html += '<a disabled="true" tabindex="0" class="btn disabled" style="margin-left: 5px;" height="60" title="Download" width="50"><i class="icon-download3"></i></a>';
					} else {
						html += '<a onClick="getApplicationParameterFile(' + applicationId + ',' + 0 + ',' + -1 + ')" tabindex="0" class="btn default" style="margin-left: 5px;" height="60" title="Download" width="50"><i class="icon-download3"></i></a>';
					}
					html += '<a onClick="configureParameterDefinitionFile(' + row + ',' + IsPDXExists + ')" tabindex="0" style="text-decoration:underline; margin-left: 5%; left: -15px; top: 0px; position: relative;" title="Click to configure Parameter Definitions" /><span>Configure</span></a></div>';
				} else {
					if (isDownloadAllowed == false) {
						html += '<a disabled="true" id="imageId"  class="btn disabled" style="margin-left: 15px;" height="60" title="Download" width="50"></a>';
					} else {
						html += '<a  id="imageId" class="btn default" style="margin-left: 15px;" height="60" title="Download" width="50"></a>';
					}
					IsPDXExists = false;
					html += '<a tabindex="0" onClick="configureParameterDefinitionFile(' + row + ',' + IsPDXExists + ')" style="text-decoration:underline; margin-left: 7%; left: -15px; top: 7px; position: relative;"  title="Click to configure Parameter Definitions" /><span>Configure</span></a></div>';
				}
			} else {
				if (IsPDXExists == true) {
					if (isDownloadAllowed == false) {
						html += '<a tabindex="0" disabled="true" class="btn disabled" style="margin-left: 5px;" height="60" title="Download" width="50"><i class="icon-download3"></i></a>';
					} else {
						html += '<a tabindex="0" onClick="getApplicationParameterFile(' + applicationId + ',' + 0 + ',' + -1 + ')"class="btn default" style="margin-left: 5px;" height="60" title="Download" width="50"><i class="icon-download3"></i></a>';
					}
					html += '<a tabindex="0" disabled="true" class="btn disabled" style="text-decoration:underline; margin-left: 5%; left: -15px; top: 0px; position: relative;" title="Click to configure Parameter Definitions" /><span>Configure</span></a></div>';

				} else {
					if (isDownloadAllowed == false) {

						html += '<a disabled="true"  id="imageId" class="btn disabled"  style="margin-left: 15px;" height="60" title="Download" width="50">    </a>';
					} else {

						html += '<a  id="imageId" class="btn default" style="margin-left: 15px;" height="60" title="Download" width="50">    </a>';
					}
					IsPDXExists = false;
					html += '<a disabled="true" tabindex="0" class="btn disabled" style="text-decoration:underline; margin-left: 7%; left: -15px; position: relative;"  title="Click to configure Parameter Definitions" /><span>Configure</span></a></div>';

				}
			}
			return html;
		}

		var parameterFormFileRenderer = function (row, column, value) {
			var IsPFXExists = $("#" + gID).jqxGrid('getcellvalue', row, 'IsPFXExists');
			var IsPDXExists = $("#" + gID).jqxGrid('getcellvalue', row, 'IsPDXExists');
			var Component = $("#" + gID).jqxGrid('getcellvalue', row, 'Component');
			var Family = $("#" + gID).jqxGrid('getcellvalue', row, 'Family');
			var html = '<div>';

			if (Component == ENUM.get("Android") && (Family && Family.toUpperCase() == AppConstants.get('CARBON_FAMILY')))
				return '';

			if (isConfigureAllowed == true) {
				if (IsPFXExists == true) {
					if (isDownloadAllowed == false) {
						html += '<a disabled="true" tabindex="0" class="btn disabled" style="margin-left: 5px;" height="60" title="Download" width="50" ><i class="icon-download3"></i></a>';
					} else {
						html += '<a tabindex="0" onClick="downloadParameterFormViewFile(' + row + ')" class="btn default" style="margin-left: 5px;" height="60" title="Download" width="50" ><i class="icon-download3"></i></a>';
					}
					html += '<a tabindex="0" onClick="configureParameterFormViewFile(' + row + ',' + IsPFXExists + ')" style="text-decoration:underline; margin-left: 5%; left: -15px; top: 0px; position: relative;"  title="Click to configure Parameter Form View  File" /><span>Configure</span></a></div>';
				} else if (IsPDXExists == true) {
					if (isDownloadAllowed == false) {
						html += '<a disabled="true"  id="imageId" class="btn disabled" style="margin-left: 15px;" height="60" title="Download" width="50">    </a>';
					} else {
						html += '<a  id="imageId" class="btn default" style="margin-left: 15px;" height="60" title="Download" width="50">    </a>';
					}
					html += '<a tabindex="0" onClick="configureParameterFormViewFile(' + row + ',' + IsPFXExists + ')" style="text-decoration:underline; margin-left: 7%; left: -15px; top: 7px; position: relative;" title="Click to configure Parameter Form View  File" /><span>Configure</span></a></div>';
				}
			} else {
				if (IsPFXExists == true) {
					if (isDownloadAllowed == false) {
						html += '<a tabindex="0" disabled="true" class="btn disabled" style="margin-left: 5px;" height="60" title="Download" width="50" ><i class="icon-download3"></i></a>';
					} else {
						html += '<a tabindex="0" onClick="downloadParameterFormViewFile(' + row + ')"class="btn default" style="margin-left: 5px;" height="60" title="Download" width="50" ><i class="icon-download3"></i></a>';
					}
					html += '<a tabindex="0" disabled="true" class="btn disabled" style="text-decoration:underline; margin-left: 5%; left: -15px; top: 0px; position: relative;"  title="Click to configure Parameter Form View  File" /><span>Configure</span></a></div>';
				} else if (IsPDXExists == true) {
					if (isDownloadAllowed == false) {
						html += '<a disabled="true" id="imageId" class="btn disabled" style="margin-left: 15px;" height="60" title="Download" width="50">    </a>';
					} else {
						html += '<a id="imageId" class="btn default" style="margin-left: 15px;" height="60" title="Download" width="50">    </a>';
					}
					html += '<a tabindex="0" disabled="true" class="btn disabled" style="text-decoration:underline; margin-left: 7%; left: -15px; position: relative;" title="Click to configure Parameter Form View  File" /><span>Configure</span></a></div>';
				}
			}
			if (isDownloadAllowed == false) {
				html += '<a disabled="true"  id="imageId" class="btn default" style="margin-left: 15px;" height="60" title="Download" width="50">    </a>';
			}
			return html;
		}

		var parameterizationRenderer = function (row, column, value) {
			var ParamDefinitionId = $("#" + gID).jqxGrid('getcellvalue', row, 'ParamDefinitionId');
			var Component = $("#" + gID).jqxGrid('getcellvalue', row, 'Component');
			var Family = $("#" + gID).jqxGrid('getcellvalue', row, 'Family');

			if (Component == ENUM.get("Android") && (Family && Family.toUpperCase() == AppConstants.get('CARBON_FAMILY')))
				return '';

			if (ParamDefinitionId && ParamDefinitionId > 0) {
				if (isFlagFortemplate == true) {
					var IsPFXExists = $("#" + gID).jqxGrid('getcellvalue', row, 'IsPFXExists');
					if (IsPFXExists == true) {
						return '<div><a tabindex="0" style="text-decoration:underline; margin-left:21px;; top: 7px; position: relative;" title="Click to configure Parameter Templates" /><span>Configure</span></a></div>';
					} else {
						return '';
					}
				} else {
					var IsPFXExists = $("#" + gID).jqxGrid('getcellvalue', row, 'IsPFXExists');
					if (IsPFXExists == true) {
						return '<div><a  disabled="true" class="btn disabled"  style="text-decoration:underline; margin-left:21px; position: relative;" title="Click to configure Parameter Templates" /><span>Configure</span></a></div>';
					} else {
						return '';
					}
				}
			} else {
				return '';
			}
		}

		var appEditRenderer = function (row, column, value) {
			var Component = $("#" + gID).jqxGrid('getcellvalue', row, 'Component');
			var Family = $("#" + gID).jqxGrid('getcellvalue', row, 'Family');

			if (Component == ENUM.get("Android") && (Family && Family.toUpperCase() == AppConstants.get('CARBON_FAMILY')))
				return '';

			if (isConfigureAllowed == true) {
				var appid = '';
				var AppGID = $("#" + gID).jqxGrid('getcellvalue', row, 'AppGID');
				if (AppGID == 0) {
					appid = '';
				} else {
					appid = AppGID;
				}
				var appVersion = $("#" + gID).jqxGrid('getcellvalue', row, 'ApplicationVersion');
				return "<a tabindex='0' style='color: inherit; margin-left: 15px; top: 7px; position: relative;' href='javascript:;' onclick='editApplicationGID(" + row + ")'><i class='icon-pencil btn btn-xs btn-default' style='padding-right:5px;'></i>  " + appid + "</a>";
			} else {
				var appid = '';
				var AppGID = $("#" + gID).jqxGrid('getcellvalue', row, 'AppGID');
				if (AppGID == 0) {
					appid = '';
				} else {
					appid = AppGID;
				}
				var appVersion = $("#" + gID).jqxGrid('getcellvalue', row, 'ApplicationVersion');
				return "<a tabindex='0' disabled='true' class='btn disabled'  style='color: inherit; margin-left: 21px; top: 7px; position: relative;' href='javascript:;' onclick='editApplicationGID(" + row + ")'><i class='icon-pencil btn btn-xs btn-default' style='padding-right:5px;'></i>  " + appid + "</a>";
			}
		}

		var downloadEnableRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var dataValue;
			if (value == true) {
				dataValue = "Yes";
				return '<div style="padding-left:6px;padding-top:7px;cursor:pointer;">' + dataValue + '</div>'
			} else {
				dataValue = "No";
				return '<div style="padding-left:6px;padding-top:7px;cursor:pointer;">' + dataValue + '</div>'
			}
		}

		//Custom filter
		var buildFilterPanel = function (filterPanel, datafield) {
			genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);

		}
		var buildFilterPanelDate = function (filterPanel, datafield) {
			genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

		}
		var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
			genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
		}


		$("#" + gID).jqxGrid(
			{
				width: "100%",
				pageable: true,
				editable: true,
				source: dataAdapter,
				altRows: true,
				virtualmode: true,
				pageSize: AppConstants.get('ROWSPERPAGE'),
				filterable: true,
				sortable: true,
				columnsResize: true,
				columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				rowsheight: 32,
				enabletooltips: true,
				rendergridrows: function () {
					return dataAdapter.records;
				},
				autoshowfiltericon: true,

				ready: function () {
					callOnGridReady(gID, gridStorage);
					var columns = genericHideShowColumn(gID, true, ['ParameterDefinitionFile', 'ParameterFormFile', 'IsParameterizationEnabled']);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsList = koUtil.gridColumnList;
					$("#" + gID).jqxGrid('hidecolumn', 'isSelected');
				},

				columns: [
					// Zontalk supported
					{
						text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, hidden: true, resizable: false, draggable: false,
						datafield: 'isSelected', width: 40, renderer: function () {
							return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
						}, rendered: rendered
					},
					{ text: '', dataField: 'ApplicationId', hidden: true, editable: false, width: 'auto' },
					{
						text: i18n.t('app_name', { lng: lang }), dataField: 'ApplicationName', editable: false, minwidth: 160, width: 'auto',
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('p_t_copy_appversion', { lng: lang }), dataField: 'ApplicationVersion', editable: false, minwidth: 150, width: 'auto',
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('src_packages', { lng: lang }), dataField: 'PackageNames', editable: false, minwidth: 150, width: 'auto',
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					// Zontalk supported
					//{
					//    text: i18n.t('Models_Name', { lng: lang }), dataField: 'ModelsName', editable: false, filterable: false, sortable: false, menu: false, minwidth: 150, width: 'auto',
					//    filtertype: "custom",
					//    createfilterpanel: function (datafield, filterPanel) {
					//        buildFilterPanel(filterPanel, datafield);
					//    }
					//},
					{
						text: i18n.t('parameter_definition_file_head', { lng: lang }), menu: false, datafield: 'ParameterDefinitionFile', editable: false,
						minwidth: 150, width: 'auto', enabletooltips: false, filterable: false, sortable: false,
						cellsrenderer: parameterDefinitionRenderer

					},
					{
						text: i18n.t('parameter_form_file', { lng: lang }), menu: false, dataField: 'ParameterFormFile', editable: false, sortable: false,
						filterable: false, minwidth: 170, width: 'auto', enabletooltips: false, cellsrenderer: parameterFormFileRenderer

					},
					{
						text: i18n.t('param_templates', { lng: lang }), menu: false, dataField: 'IsParameterizationEnabled', editable: false,
						filterable: false, sortable: false, minwidth: 150, width: 'auto', enabletooltips: false,
						cellsrenderer: parameterizationRenderer

					},
					{
						text: i18n.t('gid', { lng: lang }), menu: false, dataField: 'AppGID', editable: false, sortable: false,
						minwidth: 100, width: 'auto', filterable: false,
						enabletooltips: false, cellsrenderer: appEditRenderer

					},
					// Zontalk supported
					//{
					//    text: i18n.t('is_direct_application', { lng: lang }), dataField: 'IsDirectApplication', editable: false, minwidth: 160, width: 'auto',
					//    filtertype: "custom", cellsrenderer: downloadEnableRenderer,
					//    createfilterpanel: function (datafield, filterPanel) {
					//        buildFilterPanelMultiChoice(filterPanel, datafield, 'Enable Automatic Download');
					//    }
					//},
					//{
					//    text: i18n.t('is_enabled_for_automation', { lng: lang }), dataField: 'IsEnabledForAutomation', editable: false, cellsrenderer: downloadEnableRenderer,
					//    minwidth: 170, width: 'auto', filtertype: "custom",
					//    createfilterpanel: function (datafield, filterPanel) {
					//        buildFilterPanelMultiChoice(filterPanel, datafield, 'Enable Automatic Download');
					//    }

					//}

				]

			});

		$("#" + gID).on("cellclick", function (event) {
			var rowindex = event.args.rowindex;

			if (event.args.datafield == 'IsParameterizationEnabled') {
				koUtil.viewParameterTemplateOnDevice = false;
				configureParameterTemplate(rowindex, createTemplateOptions);
			}
		});

		getGridBiginEdit(gID, 'ApplicationId', gridStorage);
		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'ApplicationId');

	}//Grid Function End

	//Grid parameter
	function applicationsParameters(isExport, columnSortFilterforApplication, selectedApplicationItems, visibleColumns) {
		var getApplicationsReq = new Object();

		var Export = new Object();
		var Pagination = new Object();

		Pagination.HighLightedItemId = null
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

		var ColumnSortFilter = columnSortFilterforApplication;
		Export.DynamicColumns = null;
		Export.VisibleColumns = visibleColumns;

		if (isExport == true) {
			Export.IsAllSelected = false;
			Export.IsExport = true;
		} else {
			Export.IsAllSelected = false;
			Export.IsExport = false;
		}

		getApplicationsReq.ColumnSortFilter = ColumnSortFilter;
		getApplicationsReq.Pagination = Pagination;
		getApplicationsReq.Export = Export;

		var param = new Object();
		param.token = TOKEN();
		param.getApplicationsReq = getApplicationsReq;
		return param;
	}    // end of grid parameter

	function generateTemplate(tempname, controllerId) {
		var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
		var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
		var cunanem = tempname + '1';
		ko.components.register(tempname, {
			viewModel: { require: ViewName },
			template: { require: 'plugin/text!' + htmlName }
		});
	}
});

function clearQualifiersObject() {
	globalTemplateQualifiers.SelectedModels = [];
}

function templateGridExport(param, gId, openPopup) {
	var callBackfunction = function (data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				openAlertpopup(1, 'export_Sucess');
			}
		}
	}
	var method = 'GetApplicationParameterTemplates';
	var params = JSON.stringify(param);
	ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
}

function templateGrid(gID, param, createTemplateOptions) {
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
	gridStorageArr.push(gridStorageObj);
	var gridStorage = JSON.stringify(gridStorageArr);
	window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
	gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

	var source =
	{
		dataType: "json",
		dataFields: [
			{ name: 'TemplateName', map: 'TemplateName', type: 'string' },
			{ name: 'TemplateId', map: 'TemplateId' },
			{ name: 'Description', map: 'Description', type: 'string' },
			{ name: 'HierarchyNames', map: 'HierarchyNamesCSV', type: 'string' },
			{ name: 'IsLookupTemplate', map: 'IsLookupTemplate' },
			{ name: 'IsLocked', map: 'IsLocked' },
			{ name: 'IsAssignedToHierarchy', map: 'IsAssignedToHierarchy' },
			{ name: 'SelectedModels', map: 'SelectedModels' },
			{ name: 'isSelected', type: 'number' }
		],
		root: 'ApplicationParamterTemplates',
		type: "POST",
		data: param,

		url: AppConstants.get('API_URL') + "/GetApplicationParameterTemplates",
		contentType: 'application/json',
		beforeprocessing: function (data) {

			if (data && data.getApplicationParameterTemplatesResp) {
				data.getApplicationParameterTemplatesResp = $.parseJSON(data.getApplicationParameterTemplatesResp);

				if (data.getApplicationParameterTemplatesResp.PaginationResponse && data.getApplicationParameterTemplatesResp.PaginationResponse.TotalRecords > 0) {
					source.totalrecords = data.getApplicationParameterTemplatesResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getApplicationParameterTemplatesResp.PaginationResponse.TotalPages;
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
					//data.getApplicationParameterTemplatesResp.ApplicationParamterTemplates = [];
				}
			}
		},

	};


	var dataAdapter = new $.jqx.dataAdapter(source,
		{
			formatData: function (data) {
				$('.all-disabled').show();
				columnSortFilter = new Object();
				columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'ApplicationTemplate');

				param.getApplicationParameterTemplatesReq.ColumnSortFilter = columnSortFilter;
				param.getApplicationParameterTemplatesReq.Pagination = getPaginationObject(param.getApplicationParameterTemplatesReq.Pagination, gID);
				param.getApplicationParameterTemplatesReq.ApplicationId = selectedApplicationId;
				ApplicationIdForTemplate = selectedApplicationId;
				data = JSON.stringify(param);
				return data;
			},
			downloadComplete: function (data, status, xhr) {

				if (data) {
					if (data.getApplicationParameterTemplatesResp) {
						formFileXML = data.getApplicationParameterTemplatesResp.FormFileOrPDFXML;
						var formFileData = $.xml2json(formFileXML);
						globalTemplateQualifiers = new Object();
						globalTemplateQualifiers.SupportedModels = data.getApplicationParameterTemplatesResp.QualifiedModel;

						if (data.getApplicationParameterTemplatesResp.ApplicationParamterTemplates) {
							if (data.getApplicationParameterTemplatesResp.ApplicationParamterTemplates && data.getApplicationParameterTemplatesResp.ApplicationParamterTemplates.length > 0) {
								if (formFileData && (formFileData.version >= 11.23)) {			//allow to create Lookup Template

									if (selectedIsMultiVPFXFileSupported) {
										if ($("#btnAddLookupParameterTemplate").hasClass('hide')) {
											$("#btnAddParameterTemplate").addClass("hide");
											$("#btnAddLookupParameterTemplate").removeClass("hide");
										}
									} else {
										if ($("#btnAddParameterTemplate").hasClass('hide')) {
											$("#btnAddLookupParameterTemplate").addClass("hide");
											$("#btnAddParameterTemplate").removeClass("hide");
										}
									}

									var isLookupExists = false;
									for (var i = 0; i < data.getApplicationParameterTemplatesResp.ApplicationParamterTemplates.length; i++) {
										if (data.getApplicationParameterTemplatesResp.ApplicationParamterTemplates[i].IsLookupTemplate == true) {
											isLookupExists = true;
											createTemplateOptions([{ displayOption: i18n.t('create_parameter_template', { lng: lang }), value: 2 }]);
											break;
										}
									}
									if (!isLookupExists) {
										createTemplateOptions([{ displayOption: i18n.t('create_lookup_template', { lng: lang }), value: 1 }, { displayOption: i18n.t('create_parameter_template', { lng: lang }), value: 2 }]);
									}
								} else {
									if ($("#btnAddParameterTemplate").hasClass('hide')) {
										$("#btnAddLookupParameterTemplate").addClass("hide");
										$("#btnAddParameterTemplate").removeClass("hide");
									}
								}
							}
						} else {
							source.totalrecords = 0;
							source.totalpages = 0;
							data.getApplicationParameterTemplatesResp = new Object();
							data.getApplicationParameterTemplatesResp.ApplicationParamterTemplates = [];

							if (formFileData && (formFileData.version >= 11.23)) {			//allow to create Lookup Template
								if ($("#btnAddLookupParameterTemplate").hasClass('hide')) {
									$("#btnAddParameterTemplate").addClass("hide");
									$("#btnAddLookupParameterTemplate").removeClass("hide");
								}
								createTemplateOptions([{ displayOption: i18n.t('create_lookup_template', { lng: lang }), value: 1 }, { displayOption: i18n.t('create_parameter_template', { lng: lang }), value: 2 }]);
							} else {
								if ($("#btnAddParameterTemplate").hasClass('hide')) {
									$("#btnAddLookupParameterTemplate").addClass("hide");
									$("#btnAddParameterTemplate").removeClass("hide");
								}
							}
						}
					}
					$('.all-disabled').hide();
				}
			},
			loadError: function (jqXHR, status, error) {
				$('.all-disabled').hide();
				openAlertpopup(2, 'network_error');
			}
		}
	);

	//for allcheck
	var rendered = function (element) {
		enablegridfunctions(gID, 'TemplateId', element, gridStorage, true, 'pagerDivTemplate', false, 0, 'TemplateId', null, null, null);
		return true;
	}

	function templateNameRenderer(row, columnfield, value, defaulthtml, columnproperties) {
		return '<span style="margin: 4px; margin-top:7px; float: ' + columnproperties.cellsalign + ';">' + value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
	}

	function lookupTemplateRenderer(row, columnfield, value, defaulthtml, columnproperties) {
		var rowData = $("#templateGrid").jqxGrid('getrowdata', row);
		if (rowData && rowData.IsLookupTemplate) {
			return '<div style="padding-left:6px;padding-top:7px;cursor:pointer;">Yes</div>';
		} else {
			return '<div style="padding-left:6px;padding-top:7px;cursor:pointer;">No</div>';
		}
	}

	//Custom filter
	var buildFilterPanel = function (filterPanel, datafield) {
		genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
	}
	var buildFilterPanelDate = function (filterPanel, datafield) {
		genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

	}
	var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
		genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
	}

	var cellbeginedit = function (row, datafield, columntype, value) {
		var rowData = $("#templateGrid").jqxGrid('getrowdata', row);
		if (rowData && rowData.IsLookupTemplate) {
			isLookupTemplate = true;
		} else {
			isLookupTemplate = false;
		}
	}

	$("#" + gID).jqxGrid(
		{

			width: "100%",
			pageable: true,
			editable: true,
			source: dataAdapter,
			altRows: true,
			virtualmode: true,
			pageSize: AppConstants.get('ROWSPERPAGE'),
			filterable: true,
			sortable: true,
			columnsResize: true,
			columnsreorder: true,
			enabletooltips: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
			autoshowcolumnsmenubutton: false,
			rowsheight: 32,
			rendergridrows: function () {
				return dataAdapter.records;
			},
			autoshowfiltericon: true,
			ready: function () {
				var columns = genericHideShowColumn(gID, true, []);
				var gridColumnListForPopUp = new Array();
				for (var i = 0; i < columns.length; i++) {
					gridColumnListForPopUp.push(columns[i].columnfield);
				}
				visibleColumnsListForPopup = gridColumnListForPopUp;
			},
			columns: [
				{
					text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', cellbeginedit: cellbeginedit, enabletooltips: false, resizable: false, draggable: false,
					datafield: 'isSelected', width: 40,
					renderer: function () {
						return '<div style="margin-left: 10px; margin-top: 5px;"><div></div></div>';
					}, rendered: rendered
				},
				{ text: '', dataField: 'TemplateId', hidden: true, editable: false, width: 'auto' },
				{
					text: i18n.t('p_t_name', { lng: lang }), dataField: 'TemplateName', editable: false, minwidth: 160, width: 'auto',
					filtertype: "custom", cellsrenderer: templateNameRenderer,
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('create_lookup_template', { lng: lang }), dataField: 'IsLookupTemplate', editable: false, minwidth: 160, width: 'auto',
					filtertype: "custom", cellsrenderer: lookupTemplateRenderer,
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanelMultiChoice(filterPanel, datafield, 'Lookup Template');
					}
				},
				{
					text: i18n.t('p_t_hierachy_name', { lng: lang }), dataField: 'HierarchyNames', editable: false, minwidth: 240, width: 'auto',
					filtertype: "custom", cellsrenderer: templateNameRenderer,
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('description', { lng: lang }), dataField: 'Description', editable: false, minwidth: 160, width: 'auto',
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('rs_locked', { lng: lang }), datafield: 'IsLocked', editable: false, width: 100, cellsrenderer: lockRenderer,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanelMultiChoice(filterPanel, datafield, 'Lock Status');
					}
				}
			]
		});

	getGridBiginEdit(gID, 'TemplateId', gridStorage);
	callGridFilter(gID, gridStorage);
	callGridSort(gID, gridStorage, 'TemplateId');
}

function templateGridParam(isExport, columnSortFilter, selectedApplicationId, visibleColumns) {
	var getApplicationParameterTemplatesReq = new Object();

	var Export = new Object();
	var Pagination = new Object();
	var Selector = new Object();

	Selector.SelectedItemIds = null;
	Selector.UnSelectedItemIds = null;

	Pagination.HighLightedItemId = null
	Pagination.PageNumber = 1;
	Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

	var ColumnSortFilter = columnSortFilter;
	Export.DynamicColumns = null;
	Export.VisibleColumns = visibleColumns;
	if (isExport == true) {
		Export.IsAllSelected = false;
		Export.IsExport = true;
	} else {
		Export.IsAllSelected = false;
		Export.IsExport = false;
	}
	getApplicationParameterTemplatesReq.ApplicationId = selectedApplicationId;
	getApplicationParameterTemplatesReq.ColumnSortFilter = ColumnSortFilter;
	getApplicationParameterTemplatesReq.Pagination = Pagination;
	getApplicationParameterTemplatesReq.Export = Export;
	getApplicationParameterTemplatesReq.Selector = Selector;
	var param = new Object();
	param.token = TOKEN();
	param.getApplicationParameterTemplatesReq = getApplicationParameterTemplatesReq;
	return param;
}

function editApplicationGID(rowindex) {
	$("#appEditPopup_save").attr('disabled', true);
	rowdata = $("#jqxgridApplications").jqxGrid('getrowdata', rowindex);
	var cellValue = $("#jqxgridApplications").jqxGrid('getcellvalue', rowindex, 'AppGID');
	getAppGID(rowdata.ApplicationId, appGids, cellValue);
	var appFileName = rowdata.ApplicationName;
	var appVersion = rowdata.ApplicationVersion;
	$("#appVersion").text(i18n.t('gid_for_application', { appFileName: appFileName, appVersion: appVersion }, { lng: lang }));
}

function getAppGID(applicationId, appGids, cellValue) {

	function callbackFunction(data, error) {
		if (data && data.getApplicationGIDResp) {
			data.getApplicationGIDResp = $.parseJSON(data.getApplicationGIDResp);
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				appGids = data.getApplicationGIDResp.ApplicationGID;
				selectedApplicationId = applicationId;
				var str = '"<option value="0" selected>Select</option>"';

				for (var i = 0; i < appGids.length; i++) {
					if (cellValue == appGids[i].GIDValue) {
						cellValue == appGids[i].GIDValue
						str += "<option value='" + appGids[i].AppGID + "' selected>" + appGids[i].GIDValue + "</option>";
					} else {
						str += "<option value='" + appGids[i].AppGID + "'>" + appGids[i].GIDValue + "</option>";
					}
				}
				$("#appSelectGid").empty();
				$("#appSelectGid").append(str);

			}
		}
		$("#editGIDPopup").modal('show');
	}

	var method = 'GetApplicationGID';
	var params = '{"token":"' + TOKEN() + '" ,"applicationId":"' + applicationId + '"}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

//Download Parameter Definition File
function downloadParameterDefinitionFile(PDXFileName, PDXFile) {
	//var PDXFileName = $("#jqxgridApplications").jqxGrid('getcellvalue', rowindex, 'PDXFileName');
	//var PDXFile = $("#jqxgridApplications").jqxGrid('getcellvalue', rowindex, 'OriginalPDXFile');
	var str = '';
	if (!_.isEmpty(PDXFile)) {
		for (var j = 0; j < PDXFile.length; j++) {
			var chr1 = String.fromCharCode(PDXFile[j]);
			str += chr1;
		}
		str = formatXml(str);
		var downloadResult = download(str, PDXFileName, "application/vpdx");
		if (downloadResult == true) {
			openAlertpopup(0, 'file_successfully_downloaded');
		}
	} else {
		openAlertpopup(2, 'error_occurred_while_downloading_file');
	}
}

function buildParameterDefinitionFormFilesTableData(applicationId, ParamterFiles, TableName) {
	$(TableName).empty();
	if (TableName == "#itemTbodyPFXFilesConfigure") {
		$("#descriptionParameterViewFile").empty();
		for (var i = 0; i < ParamterFiles.length; i++) {
			var row = $("<tr/>")
			$(TableName).append(row);
			if (ParamterFiles.length > 1) {
				row.append($("<td id='rbtnRow" + i + "' class='disabled'><input id='rdbtn" + ParamterFiles[i].LevelName + "' type='radio' name='inlineTableRadioOptions' onChange='getRadioButtonValueFormFilesLevel(" + ParamterFiles[i].FormFileId + ',' + ParamterFiles[i].Level + ")'></td>"));
			}
			row.append($("<td>" + ParamterFiles[i].FileName + "</td>"));
			row.append($("<td>" + ParamterFiles[i].Description + "</td>"));
		}
	} else if (TableName == "#itemTbodyPFXFilesDownload") {
		for (var i = 0; i < ParamterFiles.length; i++) {
			var row = $("<tr/>")
			$("#itemTbodyPFXFilesDownload").append(row);
			row.append($("<td style='padding:0px;'>" + ParamterFiles[i].FileName + "</td>"));
			row.append($("<td><a tabindex='0' onClick='getApplicationParameterFile(" + applicationId + "," + 1 + "," + i + ")' class='btn default' style='margin-left: 5px;padding:0px;' height='60' title='Download' width='50'><i class='icon-download3'></i></a></td>"));
		}
		$("#appSelectParamFile").modal('show');
	}
}

function formatXml(xml) {
	var formatted = '';
	var reg = /(>)(<)(\/*)/g;
	xml = xml.replace(reg, '$1\r\n$2$3');
	var pad = 0;
	jQuery.each(xml.split('\r\n'), function (index, node) {
		var indent = 0;
		if (node.match(/.+<\/\w[^>]*>$/)) {
			indent = 0;
		}
		else if (node.match(/^<\/\w/)) {
			if (pad != 0) {
				pad -= 1;
			}
		}
		else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
			indent = 1;
		}
		else {
			indent = 0;
		}
		var padding = '';
		for (var i = 0; i < pad; i++) {
			padding += '  ';
		}
		formatted += padding + node + '\r\n';
		pad += indent;
	});
	return formatted;
}

//get byte array to download PDF/PFX in XML format
function getApplicationParameterFile(applicationId, fileType, fileIndex) {
	var getApplicationParameterFileReq = new Object();
	var formFileId = fileIndex >= 0 ? PFXFiles[fileIndex].FormFileId : 0;

	getApplicationParameterFileReq.ApplicationId = applicationId;
	getApplicationParameterFileReq.ParameterFileType = fileType == 0 ? 'VPDX' : 'VPFX';
	getApplicationParameterFileReq.FormFileId = formFileId;

	var callBackfunction = function (data) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				if (data.getApplicationParameterFileResp) {
					data.getApplicationParameterFileResp = data.getApplicationParameterFileResp;
					var fileName = data.getApplicationParameterFileResp.ParameterFileName;
					var file = data.getApplicationParameterFileResp.ParameterFile;
					if (fileType == 0) {
						downloadParameterDefinitionFile(fileName, file);
					} else {
						downloadMultipleParameterFormFiles(fileName, file);
					}
				}
			}
		}
	}

	method = 'GetApplicationParameterFile';
	var params = '{"token":"' + TOKEN() + '","getApplicationParameterFileReq":' + JSON.stringify(getApplicationParameterFileReq) + '}'
	ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
}

//Download Parameter Form View File
function downloadParameterFormViewFile(rowindex) {
	PFXFiles = new Array();
	var selectedApplicationId = $("#jqxgridApplications").jqxGrid('getcellvalue', rowindex, 'ApplicationId');
	getApplicationVPFXFilesById(selectedApplicationId, "#itemTbodyPFXFilesDownload", ENUM.get("NAME_AND_DESCRIPTION_PAIR"));

	rowdata = $("#jqxgridApplications").jqxGrid('getrowdata', rowindex);
	var appFileName = rowdata.ApplicationName;
	var appVersion = rowdata.ApplicationVersion;
	$("#appVersionParameter").text(i18n.t('pfx_for_application', { appFileName: appFileName, appVersion: appVersion }, { lng: lang }));
}

//Download multiple Parameter Form View Files
function downloadMultipleParameterFormFiles(PFXFileName, PFXFile) {
	//var PFXFileName = PFXFiles[FileIndex].FileName;
	//var PFXFile = PFXFiles[FileIndex].OgininalPFX;
	var str = '';
	if (!_.isEmpty(PFXFile)) {
		for (var j = 0; j < PFXFile.length; j++) {
			var chr1 = String.fromCharCode(PFXFile[j]);
			str += chr1;
		}
		str = formatXml(str);
		var downloadResult = download(str, PFXFileName, "application/vpfx");
		if (downloadResult == true) {
			openAlertpopup(0, 'file_successfully_downloaded');
		}
	} else {
		openAlertpopup(2, 'error_occurred_while_downloading_file');
	}
}

//Configure Parameter Definition File
function configureParameterDefinitionFile(rowindex, IsPDXExists) {

	isDownloadAllowedFlag = IsPDXExists;
	rowdata = $("#jqxgridApplications").jqxGrid('getrowdata', rowindex);
	selectedRowIndex = rowindex;
	selectedApplicationId = rowdata ? rowdata.ApplicationId : 0;
	selectedApplicationName = rowdata ? rowdata.ApplicationName : '';
	selectedApplicationVersion = rowdata ? rowdata.ApplicationVersion : '';
	selectedVPDXVersion = rowdata ? rowdata.VPDXVersion : '';

	$("#parameterDefinitionFileTitle").text('Parameter Definitions for Application :' + " " + selectedApplicationName + " " + '  Version :' + " " + selectedApplicationVersion);

	APPGridIdForTemplate = $("#jqxgridApplications").jqxGrid('getcellvalue', rowindex, 'AppGID');

	//store application name data
	globalVariableForApplicationParameter = rowdata ? rowdata.ApplicationName : '';

	if (IsPDXExists == true) {
		$("#showParamLinkDiv").show();
		vpfPDXFlag = 1;
		$("#rbtnReplaceDefinitionFile").removeAttr('disabled');
		$("#rbtnNone").removeAttr('disabled');
		selectedDefintionFileName = rowdata ? rowdata.PDXFileName : '';
		$("#paramDefFilenamevalue").text(selectedDefintionFileName);
	} else {
		$("#showParamLinkDiv").hide();
		vpfPDXFlag = 0;
		$("#rbtnReplaceDefinitionFile").prop('disabled', true);
		$("#rbtnNone").attr('disabled', true);
		$("#paramDefFilenamevalue").text(i18n.t("no_parameter_file_found", { lng: lang }));
	}
	$("#parameterDefinitionPopup").modal('show');
	getPDXByApplicationName(selectedApplicationId, selectedApplicationName);
}

//Configure Parameter Form View File
function configureParameterFormViewFile(rowindex, IsPFXExists) {
	rowdata = $("#jqxgridApplications").jqxGrid('getrowdata', rowindex);
	$("#reuseDivFormFile").hide();
	selectedApplicationId = rowdata ? rowdata.ApplicationId : 0;
	selectedApplicationName = rowdata ? rowdata.ApplicationName : '';
	selectedApplicationVersion = rowdata ? rowdata.ApplicationVersion : '';
	selectedVPDXVersion = rowdata ? rowdata.VPDXVersion : '';
	selectedIsMultiVPFXFileSupported = rowdata ? rowdata.IsMultiVPFXSupported : false;

	if (!selectedIsMultiVPFXFileSupported && IsPFXExists) {
		$("#rbtnNewFormView").prop('checked', false);
		$("#rbtnReuseFormView").prop('checked', true);
		$("#rbtnNewFormView").prop('disabled', true);
		$("#rbtnReuseFormView").trigger('click');
	} else {
		$("#rbtnNewFormView").prop('checked', true);
		$("#rbtnReuseFormView").prop('checked', false);
		$("#rbtnNewFormView").prop('disabled', false);
	}
	$("#itemTbodyPFXFilesConfigure").empty();
	$("#parameterFormViewTitle").text(i18n.t('parameter_form_file_for_app', { lng: lang }) + " : " + selectedApplicationName + " " + i18n.t('version_colon', { lng: lang }) + " " + selectedApplicationVersion);
	$("#descVPFX").text(rowdata.Description);
	$("#tableHeaderSelect").hide();

	if (IsPFXExists) {
		$("#rbtnReplaceFormView").removeAttr('disabled');
		$("#rbtnNoneFormView").removeAttr('disabled');
		getApplicationVPFXFilesById(selectedApplicationId, "#itemTbodyPFXFilesConfigure", ENUM.get("NAME_AND_DESCRIPTION_PAIR"));
	} else {
		$("#rbtnReplaceFormView").prop('disabled', true);
		$("#rbtnNoneFormView").prop('disabled', true);
	}
	$("#descriptionParameterViewFile").val("");
	$("#parameterFormViewPopup").modal('show');
	getPFXByApplicationName(selectedApplicationId, selectedApplicationName, selectedVPDXVersion);
}

//Configure Template
function configureParameterTemplate(rowindex, createTemplateOptions) {	
	rowdata = $("#jqxgridApplications").jqxGrid('getrowdata', rowindex);
	selectedRowIndex = rowindex;
	selectedApplicationId = rowdata ? rowdata.ApplicationId : 0;
	selectedApplicationName = rowdata ? rowdata.ApplicationName : '';
	selectedApplicationVersion = rowdata ? rowdata.ApplicationVersion : '';
	selectedVPDXVersion = rowdata ? rowdata.VPDXVersion : '';
	selectedIsMultiVPFXFileSupported = rowdata ? rowdata.IsMultiVPFXSupported : false;

	if ($("#templateGrid").hasClass('jqx-grid')) {
		$("#templateGrid").jqxGrid('updatebounddata');
	} else {
		var param = templateGridParam(false, null, selectedApplicationId);
		templateGrid('templateGrid', param, createTemplateOptions);
	}

	$("#parameterTemplatePopup").modal('show');
	$("#paramTemplateHead").text("Parameter Templates for Application :" + " " + selectedApplicationName + " " + "Version :" + " " + selectedApplicationVersion)

	$('#applicationName').val(selectedApplicationName);
	$('#applicationVersion').val(selectedApplicationVersion);

	APPGridIdForTemplate = $("#jqxgridApplications").jqxGrid('getcellvalue', rowindex, 'AppGID');
}

function reuseParameterDefinitionFileGrid(gID, PDXApplications) {
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
	gridStorageArr.push(gridStorageObj);
	var gridStorage = JSON.stringify(gridStorageArr);
	window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
	var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

	var source =
	{
		datatype: "json",
		localdata: PDXApplications,
		datafields: [
			{ name: 'ApplicationId', map: 'ApplicationId' },
			{ name: 'ApplicationName', map: 'ApplicationName' },
			{ name: 'ApplicationVersion', map: 'ApplicationVersion' },
			{ name: 'IsParameterizationEnabled', map: 'IsParameterizationEnabled' }
		],

	};
	var dataAdapter = new $.jqx.dataAdapter(source);
	var buildFilterPanel = function (filterPanel, datafield) {
		wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID);
	}

	var rendered = function (row, columnfield, value, defaulthtml, columnproperties) {
		return '<div style="margin-left: 10px; margin-top: 5px;"><input name="radioOptions" type="radio" onChange="getRadioButtonValueDefinitionFile(' + row + ')"></div>'
	}
	var parametersRender = function (row, columnfield, value, defaulthtml, columnproperties) {
		var applicationID = $("#" + gID).jqxGrid('getcellvalue', row, 'ApplicationId');
		var applicationName = $("#" + gID).jqxGrid('getcellvalue', row, 'ApplicationName');
		var applicationVersion = $("#" + gID).jqxGrid('getcellvalue', row, 'ApplicationVersion');
		var html = '<div style="height:100px;cursor:pointer;padding-top:7px;padding-left:5px;float:left"><a style="text-decoration:underline" title="View Application" onclick=ChildAplicationViewPopup(' + row + ',' + applicationID + ',"' + gID + '","' + applicationName + '","' + applicationVersion + '") role="button"><span>View</span></a></div>';
		return html;
	}

	$("#" + gID).jqxGrid(
		{
			width: "100%",
			height: "200px",
			source: dataAdapter,
			sortable: true,
			filterable: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
			altrows: true,
			autoshowcolumnsmenubutton: false,
			rowsheight: 32,
			showsortmenuitems: false,
			enabletooltips: true,
			editable: true,
			columnsResize: true,
			columns: [
				{
					text: 'Select', menu: false, sortable: false, columnsResize: false, filterable: false, columntype: 'custom', datafile: 'isSelected', enabletooltips: false,
					minwidth: 60, maxwidth: 61, cellsrenderer: rendered
				},
				{ text: '', datafield: 'ApplicationId', hidden: true, width: 'auto' },
				{

					text: i18n.t('app_name', { lng: lang }), datafield: 'ApplicationName', editable: false, width: 'auto', minwidth: 200,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					},
				},
				{
					text: i18n.t('app_version', { lng: lang }), datafield: 'ApplicationVersion', editable: false, width: 'auto', minwidth: 200,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					},
				},
				{
					text: i18n.t('parameters_definations', { lng: lang }), datafield: 'IsParameterizationEnabled', cellsrenderer: parametersRender, width: 'auto',
					filterable: false, menu: false, sortable: false, resizable: false, minwidth: 80, editable: false,
				},
			]
		});

	getUiGridBiginEdit(gID, 'ApplicationId', gridStorage);
	callUiGridFilter(gID, gridStorage);
}

function reuseParameterFormViewFileGrid(gID, PFXApplications) {
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
	gridStorageArr.push(gridStorageObj);
	var gridStorage = JSON.stringify(gridStorageArr);
	window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
	var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

	var source =
	{
		datatype: "json",
		localdata: PFXApplications,
		datafields: [
			{ name: 'ApplicationId', map: 'ApplicationId' },
			{ name: 'ApplicationName', map: 'ApplicationName' },
			{ name: 'ApplicationVersion', map: 'ApplicationVersion' },
			{ name: 'isSelected', type: 'number' }
		],

	};
	var dataAdapter = new $.jqx.dataAdapter(source);
	var buildFilterPanel = function (filterPanel, datafield) {
		wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
	}

	var rendered = function (row, columnfield, value, defaulthtml, columnproperties) {
		return '<div style="margin-left: 10px; margin-top: 5px;"><input name="radioOptions" type="radio" onChange="getRadioButtonValueFormViewFile(' + row + ')"></div>'
	}

	$("#" + gID).jqxGrid(
		{
			width: "100%",
			height: "200px",
			source: dataAdapter,
			sortable: true,
			filterable: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
			altrows: true,
			autoshowcolumnsmenubutton: false,
			rowsheight: 32,
			showsortmenuitems: false,
			enabletooltips: true,
			editable: true,
			columnsResize: true,
			columns: [
				{
					text: 'Select', menu: false, sortable: false, columnsResize: false, filterable: false, columntype: 'custom', datafile: 'isSelected', enabletooltips: false,
					minwidth: 60, maxwidth: 61, cellsrenderer: rendered
				},
				{ text: '', datafield: 'ApplicationId', hidden: true, width: 'auto' },
				{

					text: i18n.t('app_name', { lng: lang }), datafield: 'ApplicationName', editable: false, width: 'auto', minwidth: 350,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					},
				},

				{
					text: i18n.t('app_version', { lng: lang }), datafield: 'ApplicationVersion', editable: false, width: 'auto', minwidth: 350, resizable: false,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					},
				},

			]
		});

	getUiGridBiginEdit(gID, 'ApplicationId', gridStorage);
	callUiGridFilter(gID, gridStorage);
}

function getPDXByApplicationName(applicationId, applicationName) {

	var getPDXByApplicationNameReq = new Object();
	getPDXByApplicationNameReq.ApplicationId = applicationId;
	getPDXByApplicationNameReq.ApplicationName = applicationName;
	var callBackfunction = function (data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				var PDXApplications = new Array();
				if (data.getPDXByApplicationNameResp) {
					data.getPDXByApplicationNameResp = $.parseJSON(data.getPDXByApplicationNameResp);
					var PDXApplications = data.getPDXByApplicationNameResp.Applications;
				}
				reuseParameterDefinitionFileGrid('jqxgridParameterDefinition', PDXApplications);
			}
		}
	}

	var params = '{"token":"' + TOKEN() + '","getPDXByApplicationNameReq":' + JSON.stringify(getPDXByApplicationNameReq) + '}'
	ajaxJsonCall('GetPDXByApplicationName', params, callBackfunction, true, 'POST', true);
}

function getPFXByApplicationName(applicationId, applicationName, VPDXVersion) {

	var getPFXByApplicationNameReq = new Object();
	getPFXByApplicationNameReq.ApplicationId = applicationId;
	getPFXByApplicationNameReq.ApplicationName = applicationName;
	getPFXByApplicationNameReq.VPDXVersion = VPDXVersion;

	var callBackfunction = function (data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				var PFXApplications = new Array();
				if (data && data.getPFXByApplicationNameResp) {
					data.getPFXByApplicationNameResp = $.parseJSON(data.getPFXByApplicationNameResp);
					var PFXApplications = data.getPFXByApplicationNameResp.Applications;
				}
				reuseParameterFormViewFileGrid('jqxgridFormViewFile', PFXApplications);
			}
		}
	}

	var params = '{"token":"' + TOKEN() + '","getPFXByApplicationNameReq":' + JSON.stringify(getPFXByApplicationNameReq) + '}'
	ajaxJsonCall('GetPFXByApplicationName', params, callBackfunction, true, 'POST', true);
}

function getApplicationVPFXFilesById(applicationId, TableName, ParameterRetrivalType) {

	var getParameterFormElementsReq = new Object();
	getParameterFormElementsReq.ApplicationId = applicationId;
	getParameterFormElementsReq.TemplateId = 0;
	getParameterFormElementsReq.ParameterRetrivalType = ParameterRetrivalType;

	var callBackfunction = function (data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				if (data.getParameterFormElementsResp) {
					PFXFiles = data.getParameterFormElementsResp.FormFiles;
					if (PFXFiles && PFXFiles.length > 0) {
						if (PFXFiles.length == 1) {
							selectedFormViewFileName = PFXFiles[0].FileName;
							selectedFormFileLevel = PFXFiles[0].Level;
							selectedFormFileId = PFXFiles[0].FormFileId;
						} else {
							$("#tableHeaderSelect").show();
						}
						buildParameterDefinitionFormFilesTableData(applicationId, PFXFiles, TableName);
					}
				} else {
					PFXFiles = null;
				}
			}
		}
	}

	var params = '{"token":"' + TOKEN() + '","getParameterFormElementsReq":' + JSON.stringify(getParameterFormElementsReq) + '}'
	ajaxJsonCall('GetApplicationVPFXFiles', params, callBackfunction, true, 'POST', true);
}

function getRadioButtonValueDefinitionFile(row) {
	isReuseAppSelected = true;
	$("#btnSaveParameterDefinitionFile").prop("disabled", false);
	reuseApplicationId = $("#jqxgridParameterDefinition").jqxGrid('getcellvalue', row, 'ApplicationId');
}

function getRadioButtonValueFormViewFile(row) {
	isReuseAppSelected = true;
	$("#btnSaveParameterFormFile").prop("disabled", false);
	reuseApplicationId = $("#jqxgridFormViewFile").jqxGrid('getcellvalue', row, 'ApplicationId');
}

function getRadioButtonValueFormFilesLevel(formFileId, level) {
	selectedFormFileId = formFileId;
	selectedFormFileLevel = level;
	if ($("#fileInputVPF").val() != "") {
		$("#btnSaveParameterFormFile").prop("disabled", false);
	}
}

var lockRenderer = function (row, columnfield, value, columnproperties) {
	var defaultHtml = '<div><span></span></div>';  
	var lockToolTip = i18n.t('parameter_template_locked_tooltip', { lng: lang })
	var unLockToolTip = i18n.t('parameter_template_unlocked_tooltip', { lng: lang })
	if (value == true) {                
		defaultHtml = '<div style="padding-left:20px;padding-top:5px;font-size:20px;"><span  title="' + lockToolTip +'"><i class="icon icon-lock2" style="color: #696969"></i></span><span style="padding-left:7px;padding-top:7px;"></span></div>';
	} else {
		defaultHtml = '<div style="padding-left:20px;padding-top:5px;font-size:20px;"><span  title="' + unLockToolTip+'"><i class="icon icon-unlocked" style="color: #696969"></i></span><span style="padding-left:7px;padding-top:7px;"></span></div>';
	}           
	return defaultHtml;
}

function isParameterTemplateLocked(gID, operationType, seletedItemIds) {
	var pageinfo = $("#" + gID).jqxGrid('getpaginginformation');
	var startrow = Number(pageinfo.pagenum) * Number(pageinfo.pagesize);
	var count = 0;
	for (var i = startrow; i < startrow + pageinfo.pagesize; i++) {
		var value = $("#" + gID).jqxGrid('getcellvalue', i, "isSelected");
		if (value > 0) {
			var data = $("#" + gID).jqxGrid('getrowdata', i);
			count++;
			if (!_.isEmpty(data) && data.IsLocked) {
				if (operationType == 1) {
					return false;
				} else if (operationType == 2) {
					if (seletedItemIds.length > 1 ) {
						openAlertpopup(1, 'parameter_template_delete_Locked_multipledevices');
					} else {
						openAlertpopup(1, 'parameter_template_delete_Locked');
					}
				}                      
				return true;
			} else {
				if (count == seletedItemIds.length) {
					 return false;
				} 
			}                 
		}
	}
}