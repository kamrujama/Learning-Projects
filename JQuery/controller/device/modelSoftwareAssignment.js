var referenceSetName = "";
var selectedRFSponsorName = "";
var parentReferenceSetName = "";
var parentReferenceSetDescription = "";
var supportedPackages = "";
var referenceSetStatus = "";
var referenceSetId = 0;
var parentReferenceSetId = 0;
var selectedReferenceSetId = 0;
var isDirectDeviceAssignChanged = false;
var isOnlyDownloadChange = false;
var isDownloadAutomationChanged = false;
var isDownloadOptionsChanged = false;
var isDirectAssignment = false;
var isUnassignSoftwareResult = false;
var isAutomationResult = false;
var isReferenceSetChanged = false;
var isPackageChanged = false;
var isTemplateChanged = false;
var isTemplatesDisabled = false;
var isTemplateChangesOnly = false;
var isParentReferenceSetSelected = false;
var modelId;

var totalPagesGlobal;

var isEnabledValue = false;
var isInherit = false;
var arr = new Array();
var referenceSetArray = new Array();
var isGetReferenceSetsForDevices = false; //true when GetReferenceSetsForDevices API is called
var isGetParentReferenceSetsForDevices = false; //true when GetParentReferenceSetsForDevices API is called
var isCheckAutoDownloadStatus = false; //true when CheckAutoDownloadStatus API is called
var isGetSystemConfiguration = false; //true when GetSystemConfiguration API is called
var isGetPackagesForDevices = false; //true when GetPackagesForDevices API is called
var isKeysDataLoaded = false; //true when GetKeyProfiles API is called

define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, ADSearchUtil) {
	var maxSoftwareAssignment;
	var isSelectedPaneFiltered = false; //To check filter applied on Selected Packages Pane 
	var selectedRowArrayForSwap = new Array();
	var gridSelectedArryForSwap = new Array();
	columnSortFilterForReferenceSet = new Object();
	columnSortFilterForParentReferenceSet = new Object();

	checkRadioState = '';
	var movedPackages = [];
	var rowIndexForHighlighted;// row index for highlighted packges
	var highlightedIndexAvailableTemplates = -1;
	var highlightedIndexAssignedTemplates = -1;
	var isRightPackagesClick = '';
	var isRightTemplatesClick = '';
	var rowIdForHighlightedForTable;
	var selectedRowAvailableTemplates = new Array();
	var selectedRowAssignedTemplates = new Array();
	var isSelectedUpdated = false;
	var downloadOptionValue = '';
	var autoDownloadOnValue = '';
	var isAutoSchedulingEnabledValue = false;
	var isAutoSchedulingDuringMHBValue = false;
	var keysGridWidth = '480px';

	//applied templates to the device
	var assignedApplicationTemplateIds = new Array();

	//function for move element in Array
	Array.prototype.moveUp = function (value) {
		var index = this.indexOf(value),
			newPos = index - 1;

		if (index === -1)
			throw new Error("Element not found in array");
		this.splice(index, 1);
		if (index === 0)
			newPos = this.length;
		this.splice(newPos, 0, value);
	};

	Array.prototype.moveDown = function (value) {
		var index = this.indexOf(value),
			newPos = index + 1;

		if (index === -1)
			throw new Error("Element not found in array");

		this.splice(index, 1);
		if (index >= this.length)
			newPos = 0;
		this.splice(newPos, 0, value);
	};

	return function SoftwareAssignmentViewModel() {

		ko.validation.init({
			decorateElement: true,
			errorElementClass: 'err',
			insertMessages: false
		});

		var self = this;
		checkRadioState = '';
		koUtilUniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
		koUtilDeviceFamily = koUtil.deviceFamily;
		koUtilModel = koUtil.ModelName;

		ADSearchUtil.AdScreenName = !_.isEmpty(deviceLiteData) ? deviceLiteData.Source : ADSearchUtil.AdScreenName;
		screenName = ADSearchUtil.AdScreenName;
		IsSequnceUpdatePackages = false;
		IsSequnceUpdateApplications = false;
		packageIndex = -1;
		ApplicationIndex = -1;
		isGetReferenceSetsForDevices = false;
		isGetParentReferenceSetsForDevices = false;
		isCheckAutoDownloadStatus = false;
		isGetSystemConfiguration = false;
		isGetPackagesForDevices = false;
		isUnassignSoftwareResult = false;
		isAutomationResult = false;
		isSelectedUpdated = false;
		isDownloadAutomationChanged = false;
		isDownloadOptionsChanged = false;
		self.observableModelPopupParentView = ko.observable();
		self.templateFlag = ko.observable(false);
		var modelname = 'unloadTemplate';
		loadelement(modelname, 'genericPopup');
		var templatesGridState = new Object();

		//Assignment Type
		self.assignmentTypeChkbox = ko.observable(false);

		//Initial 
		self.rbgDownloadAutomation = ko.observable();
		self.rbgDownloadAutomationForAddDevice = ko.observable('DownloadAutomation');
		self.rbgAssignmentType = ko.observable(true);
		self.rbgReferenceSetType = ko.observable(true);
		self.isSoftwareAssigned = ko.observable();
		self.isPackagesAvailable = ko.observable(false);
		self.isReferenceSetAvailable = ko.observable(true);
		self.DownloadAutomationChkbox = ko.observable(false);
		self.packageData = ko.observableArray();
		self.movedArray = ko.observableArray();
		self.rightPackageData = ko.observableArray();
		self.referenceData = ko.observableArray();
		self.addDeviceVisible = ko.observable(false);
		self.saveBtnVisible = ko.observable(false);
		self.isEnableDownloadCheckboxForAddDevice = ko.observable(true);
		self.downloadedOn = ko.observable('');
		self.autoSchedulingDuringMHB = ko.observable(false);
		self.applicatonTemplate = ko.observableArray();
		downloadOptionValue = '';
		autoDownloadOnValue = '';
		isAutoSchedulingEnabledValue = false;
		isAutoSchedulingDuringMHBValue = false;
		isPackageChanged = false;
		isReferenceSetChanged = false;
		isTemplateChanged = false;
		isTemplatesDisabled = false;
		isTemplateChangesOnly = false;
		isParentReferenceSetSelected = false;
		var isAssignedHierarchyTemplate = false;

		//keys
		self.keysData = ko.observableArray();
		self.rightKeyData = ko.observableArray();
		self.allmovedkeysSelected = ko.observable(false);
		self.accordionPanel = ko.observable('Packages');
		isKeysDataLoaded = false;

		//templates
		self.availableApplicationTemplates = ko.observableArray();
		self.selectedApplicationTemplates = ko.observableArray();
		self.assignedHierarchyTemplate = ko.observableArray();

		//--change collpase and expand icon------
		function toggleAccordian(e) {
			if (ADSearchUtil.AdScreenName != 'deviceSearch') {
				$(e.target)
					.prev('.panel-heading')
					.find("i.indicator")
					.toggleClass('icon-angle-down icon-angle-up');
				if (!isKeysDataLoaded && e.target.id == "PKcollapseTwo") {
					keysGridModel(self.keysData, self.openPopup, self.movedArray);
				}
				if (e.target.className.indexOf('collapse in') == -1) {
					if (e.target.id == 'PKcollapseOne') {
						$('#AccordionKeys').click();
						self.accordionPanel('Keys');
						if (self.keysData().length > 0) {
							$("#btnForAllMoveright").removeClass('disabled');
						} else {
							$("#btnForAllMoveright").addClass('disabled');
						}
						$("#jqxgridAvailableKeys").jqxGrid({ width: keysGridWidth });
					} else {
						$('#AccordionPackages').click();
						self.accordionPanel('Packages');
						if (self.packageData().length > 0) {
							$("#btnForAllMoveright").removeClass('disabled');
						} else {
							$("#btnForAllMoveright").addClass('disabled');
						}
					}
				}
			}
		}
		$('#accordionPackageandKeys').on('hidden.bs.collapse', toggleAccordian);
		$('#accordionPackageandKeys').on('shown.bs.collapse', toggleAccordian);

		$('#mdlSoftwareUpgradeHeader').mouseup(function () {
			$("#modelSoftwareContent").draggable({ disabled: true });
		});

		$('#mdlSoftwareUpgradeHeader').mousedown(function () {
			$("#modelSoftwareContent").draggable({ disabled: false });
		});

		$('#ApplicationViewHeader').mouseup(function () {
			$("#ApplicationViewHeaderContent").draggable({ disabled: true });
		});

		$('#ApplicationViewHeader').mousedown(function () {
			$("#ApplicationViewHeaderContent").draggable({ disabled: false });
		});


		$('#childApplicationViewHeader').mouseup(function () {
			$("#childApplicationViewContent").draggable({ disabled: true });
		});

		$('#childApplicationViewHeader').mousedown(function () {
			$("#childApplicationViewContent").draggable({ disabled: false });
		});

		//Zontalk related
		self.selectedApplicationName = ko.observable('');
		self.protocolVEMVisibility = ko.observable(true);
		self.protocolZTVisibility = ko.observable(false);
		self.movedApplicationsArray = ko.observableArray();
		self.applicationsData = ko.observableArray();
		self.rightApplicationsData = ko.observableArray();
		self.allselectedpackagesSelected = ko.observable(false);
		self.existPackages = ko.observableArray();
		self.showKeysDiv = ko.observable(true);
		self.inheritedReferenceSet = ko.observable('');
		selectedRFSponsorName = "";

		init();
		function init() {
			if (ADSearchUtil.AdScreenName === 'deviceSearch') {
				setScreenControls(AppConstants.get('GLOBAL_SOFTWARE_KEY_ASSIGNMENT'));
			} else if (ADSearchUtil.AdScreenName === 'addDeviceManually') {
				setScreenControls(AppConstants.get('ADD_DEVICE_SOFTWARE_KEY_ASSIGNMENT'));
			} else {
				setScreenControls(AppConstants.get('DEVICE_SOFTWARE_KEY_ASSIGNMENT'));
			}
			modelReposition();
			disableAllNavigation();
			setInitialView();
			setInitialSelection();
			getSystemConfigurationForSchedule();
		}

		self.getTimeSlotValue = function () {
			if (self.downloadedOn() == "Next Available Free Time Slot") {
				self.downloadedOn('Next Available Free Time Slot');
				self.autoSchedulingDuringMHB(true);
				$("#chkMaintaince").addClass("maintainceCheckbox");
				$("#chkMaintaince").removeClass("maintainceCheckbox disabled");
				$("#chkMaintaince").prop('disabled', false);
			} else {
				self.autoSchedulingDuringMHB(false);
				$("#chkMaintaince").removeClass("maintainceCheckbox");
				$("#chkMaintaince").addClass("maintainceCheckbox disabled");
				$("#chkMaintaince").prop('disabled', true);
			}

			downloadOptionValue = self.downloadedOn().toUpperCase();
			isDownloadOptionsChanged = true;
			if ($("#rbtnReferenceSet").is(':checked') && isDirectAssignment && (checkRadioState == '' && checkRadioState == 0)) {
				enableDisableSaveButton(0);
			} else {
				enableDisableSaveButton(1);
			}
			return true;
		}

		$(":input[type='checkbox']").on("change", function () {
			if ($("#timeSlotId").is(':checked')) {
				downloadOptionValue = AppConstants.get('NEXT_AVAILABLE_FREE_TIME_SLOT');
				enableDisableSaveButton(1);
				isDownloadOptionsChanged = true;
			}
		});

		self.saveBtnEnableDisable = function () {
			var checkSamePackages = 0;
			var moveArraylatest = new Array();
			moveArraylatest = self.movedArray();
			if (movedPackages.length !== moveArraylatest.length) {
				checkSamePackages = 1;
				isPackageChanged = true;
			} else {
				for (var j = 0; j < moveArraylatest.length; j++) {
					if (moveArraylatest[j].Type == AppConstants.get('Assignment_Package')) {
						if (movedPackages[j].PackageId == moveArraylatest[j].PackageId) {
							checkSamePackages++;
						} else {
							checkSamePackages--;
						}
					} else if (moveArraylatest[j].Type == AppConstants.get('Assignment_Key')) {
						if (movedPackages[j].KeyHandleId == moveArraylatest[j].KeyHandleId) {
							checkSamePackages++;
						} else {
							checkSamePackages--;
						}
					}
				}
				if (moveArraylatest.length == checkSamePackages) {
					checkSamePackages = 0;
				} else {
					checkSamePackages = 1;
					isPackageChanged = true;
				}
			}

			if (isDownloadAutomationChanged || isDownloadOptionsChanged) {
				enableDisableSaveButton(1);
				return;
			}

			if (moveArraylatest.length == 0) {
				enableDisableLoadTemplates(0);
				enableDisableSaveButton(0);
				return;
			} else {
				enableDisableLoadTemplates(1);
			}

			if (checkSamePackages == 1) {
				enableDisableTemplatesGrid(0);
				enableDisableSaveButton(1);
			} else {
				enableDisableTemplatesGrid(1);
				enableDisableSaveButton(0);
			}
		}

		self.referenceSetShow = function () {
			$("#noKeySupportMessageDiv").hide();
			if (!isGetReferenceSetsForDevices) {
				if (!licenseSource.isAutoDownloadsLicensed) {
					$("#rdoBtnDirect").prop('checked', true);
					self.DirectAssignment();
				} else {
					$('#rdoBtnHierarchy').prop('checked', true);
				}
				var param = getReferenceSetModel('Devicejqxgrid', false, columnSortFilterForReferenceSet, null, null, 0);
				referenceSetGrid('jqxgridSAReferenceSet', param, self.inheritedReferenceSet, self.availableApplicationTemplates, self.selectedApplicationTemplates, self.assignedHierarchyTemplate);
			} else if (isSelectedUpdated) {
				gridRefresh('jqxgridSAReferenceSet');
			}
			isSelectedUpdated = false;
			isParentReferenceSetSelected = false;
			if (isDirectAssignment == true) {
				$("#rdoBtnDirect").prop('checked', true);
			}
			var selectedDeviceSearchItems = getSelectedUniqueId('Devicejqxgrid');
			if ($("#rbtnReferenceSet").is(':checked')) {
				$("#showOverrite").hide();
				$("#parentReferenceSetResetFilterDiv").hide();
				$("#parentReferenceSetDiv").hide();
				$("#packagesGrid").hide();
				$("#none").hide();
				$("#refernceSetGrid").show();
				$("#referenceSetDiv").show();
				$("#resetFilterDiv").show();
				$("#refernceSetGrid").removeClass('disabled');
				$("#refernceSetGrid").css({ "display": "block" });
				$("#rdbDirectlabel").removeClass("disabled");
				$("#rdoBtnDirect").prop('disabled', false);
				$("#rdbInheritlabel").removeClass("disabled");
				$("#rdoBtnHierarchy").prop('disabled', false);
				self.isEnableDownloadCheckboxForAddDevice(true);
				$("#inheriDirectAssgnmnt").removeAttr('disabled');
				$("#inheriDirectAssgnmnt").find("input").prop("disabled", false);
				//$('#cbAssignmentType').prop('checked', true);
				$("#rdoBtnHierarchy").removeAttr('disabled');
				$("#rdoBtnDirect").removeAttr('disabled');
				if (($("#rbtnReferenceSet").is(':checked') && $("#rdoBtnHierarchy").is(':checked'))) {
					if (isFromAddDevice == true) {
						$('#btnAdd').prop("disabled", false);
					} else {
						//previously Inherit from hierarchy
						if (koUtil.IsDirectAssignment == false && koUtil.AssignmentType && koUtil.AssignmentType.toUpperCase() == AppConstants.get('ReferenceSet')) {
							//if Download Automation changed
							if (isDownloadAutomationChanged) {
								enableDisableSaveButton(1);
							} else {
								enableDisableSaveButton(0);
							}
						} else {
							$("#resetFilterDiv").addClass('hide');
							$("#referenceSetGridDiv").addClass('hide');
							$("#inheritDiv").removeClass('hide');
							showHideTemplates(1);
							enableDisableSaveButton(1);
						}
						if (selectedReferenceSetId === 0) {
							enableDisableLoadTemplates(0);
						} else {
							enableDisableLoadTemplates(1);
						}
					}
					enableDisableDownloadOptions(0);
					enableDisableReferenceSetGrid(0);
					enableDisableResetFilter(0);
					enableDisablePagination(0);
				} else if (($("#rbtnReferenceSet").is(':checked') && $("#rdoBtnDirect").is(':checked'))) {
					if (checkRadioState != '' && checkRadioState != 0) {
						if (isFromAddDevice == true) {
							$('#btnAdd').prop("disabled", false);
						} else {
							enableDisableSaveButton(1);
						}
					} else {
						if (!isDownloadAutomationChanged) {
							enableDisableSaveButton(0);
						}
					}
					if (isFromAddDevice == true || ADSearchUtil.AdScreenName == 'deviceProfile') {
						if ($("#rdoEnabledValue").is(':checked')) {
							enableDisableDownloadOptions(1);
						} else {
							enableDisableDownloadOptions(0);
						}
					} else {
						if (selectedDeviceSearchItems && selectedDeviceSearchItems.length > 1 && !$("#downloadAutomationCheckbox").is(':checked') && $("#rdoEnabled").is(':checked')) {
							enableDisableDownloadOptions(0);
						} else if ($("#rdoEnabled").is(':checked')) {
							enableDisableDownloadOptions(1);
						} else {
							enableDisableDownloadOptions(0);
						}
					}
					if (referenceSetId === 0) {
						enableDisableLoadTemplates(0);
					} else {
						enableDisableLoadTemplates(1);
					}
					enableDisableReferenceSetGrid(1);
					enableDisableResetFilter(1);
					enableDisablePagination(1);
				}
				enableDisableTemplatesGrid(0);
				showHideTemplates(1);
				return true;
			}
		}

		self.parentReferenceSetShow = function () {
			$("#noKeySupportMessageDiv").hide();
			if (!isGetParentReferenceSetsForDevices) {
				var param = getParentReferenceSetsParameters('Devicejqxgrid', columnSortFilterForParentReferenceSet);
				getParentReferenceSetsForDevices('jqxgridSAParentReferenceSet', param);
			} else if (isSelectedUpdated) {
				gridRefresh('jqxgridSAParentReferenceSet');
			}
			isParentReferenceSetSelected = true;
			isSelectedUpdated = false;
			$("#rdbDirectlabel").addClass("disabled");
			$("#rdoBtnDirect").prop('checked', true);
			$("#rdoBtnDirect").prop('disabled', true);
			$("#rdbInheritlabel").addClass("disabled");
			$("#rdoBtnHierarchy").prop('disabled', true);
			var selectedDeviceSearchItems = getSelectedUniqueId('Devicejqxgrid');
			$("#showOverrite").hide();
			$("#resetFilterDiv").hide();
			$("#referenceSetDiv").hide();
			$("#packagesGrid").hide();
			$("#none").hide();
			$("#refernceSetGrid").show();
			$("#parentReferenceSetResetFilterDiv").show();
			$("#parentReferenceSetDiv").show();
			self.isEnableDownloadCheckboxForAddDevice(true);
			$("#inheriDirectAssgnmnt").removeAttr('disabled');
			$("#inheriDirectAssgnmnt").find("input").prop("disabled", false);
			if (parentReferenceSetId > 0) {
				if (isFromAddDevice == true) {
					$('#btnAdd').prop("disabled", false);
				} else {
					enableDisableSaveButton(1);
				}
			} else {
				if (!isDownloadAutomationChanged) {
					enableDisableSaveButton(0);
				}
			}
			if (isFromAddDevice == true || ADSearchUtil.AdScreenName == 'deviceProfile') {
				if ($("#rdoEnabledValue").is(':checked')) {
					enableDisableDownloadOptions(1);
				} else {
					enableDisableDownloadOptions(0);
				}
			} else {
				if (selectedDeviceSearchItems && selectedDeviceSearchItems.length > 1 && !$("#downloadAutomationCheckbox").is(':checked') && $("#rdoEnabled").is(':checked')) {
					enableDisableDownloadOptions(0);
				} else if ($("#rdoEnabled").is(':checked')) {
					enableDisableDownloadOptions(1);
				} else {
					enableDisableDownloadOptions(0);
				}
			}
			if (parentReferenceSetId === 0) {
				enableDisableLoadTemplates(0);
			} else {
				enableDisableLoadTemplates(1);
			}
			enableDisableTemplatesGrid(0);
			showHideTemplates(1);
			return true;
		}

		self.packageShow = function () {
			if (ADSearchUtil.AdScreenName == 'deviceSearch') {
				setScreenControls(AppConstants.get('GLOBAL_SOFTWARE_KEY_ASSIGNMENT'));

				var selectedDeviceSearchItems = getSelectedUniqueId('Devicejqxgrid');
				if (selectedDeviceSearchItems.length > 1) {
					$("#showOverrite").show();
				} else {
					$("#showOverrite").hide();
				}

				//Download Options
				if (selectedDeviceSearchItems && selectedDeviceSearchItems.length > 1 && !$("#downloadAutomationCheckbox").is(':checked') && $("#rdoEnabled").is(':checked')) {
					enableDisableDownloadOptions(0);
				} else if ($("#rdoEnabled").is(':checked')) {
					enableDisableDownloadOptions(1);
				} else {
					enableDisableDownloadOptions(0);
				}
				getPackages();
			} else {
				$("#noKeySupportMessageDiv").hide();
				if (!licenseSource.isSoftwareAssignmenttoDeviceLicensed && licenseSource.isOnlineKeyLicensed) {
					keysGridModel(self.keysData, self.openPopup, self.movedArray);
				} else {
					if ($("#rdoEnabledValue").is(':checked')) {
						enableDisableDownloadOptions(1);
					} else {
						enableDisableDownloadOptions(0);
					}
					getPackages();
				}
			}
			isParentReferenceSetSelected = false;
			self.saveBtnEnableDisable();
			$("#packagesGrid").show();
			$("#packagesGrid").removeClass('disabled');
			$("#packagesGrid").css({ "display": "block" });
			$("#none").hide();
			$("#refernceSetGrid").hide();
			showHideTemplates(1);
			enableDisableTemplatesGrid(0);

			return true;
		}

		function getPackages() {
			if (!isGetPackagesForDevices) {
				if (isFromAddDevice == true)
					getPackagesForModel(self.packageData, self.movedArray, 'Devicejqxgrid', self.openPopup);
				else
					packagesGridModel('Devicejqxgrid', self.packageData, self.movedArray, self.rbgAssignmentType, self.rbgReferenceSetType, self.openPopup, self.isSoftwareAssigned, self.availableApplicationTemplates, self.selectedApplicationTemplates);
			}
		}

		//Package application
		self.closeAppView = function () {
			//$("#ApplicationView").modal('hide');
		}

		function disableAllNavigation() {
			//Packages
			$("#btnForMoveRight").addClass('disabled');
			$("#btnForMoveRight").prop('disabled', true);
			$("#btnForAllMoveright").addClass('disabled');
			$("#btnForAllMoveright").prop('disabled', true);
			$("#btnForMoveleft").addClass('disabled');
			$("#btnForMoveleft").prop('disabled', true);
			$("#btnForAllMoveleft").addClass('disabled');
			$("#btnForAllMoveleft").prop('disabled', true);
			$("#btnMoveItemsUPID").addClass('disabled');
			$("#btnMoveItemsUPID").prop("disabled", true);
			$("#btnMoveItemsDown").addClass('disabled');
			$("#btnMoveItemsDown").prop("disabled", true);

			//Templates
			$("#btnMoveRightSoftwareTemplate").addClass('disabled');
			$("#btnMoveRightSoftwareTemplate").prop('disabled', true);
			$("#btnMoveLeftSoftwareTemplate").addClass('disabled');
			$("#btnMoveLeftSoftwareTemplate").prop('disabled', true);

			//$("#packagesGrid").addClass('disabled').off('click');

			$("#inheriDirectAssgnmnt").find("input").prop("disabled", true);
		}

		//////////////////////////////////////ADD DEVICE CODE/////////////////////////////////

		function setInitialView() {
			//Getting ModelId from Add Device screen
			if (isFromAddDevice == true) {
				$("#cancelBtnAddDevice").show();
				$("#cancelBtn").hide();
				$("#closeBtnAddDevice").show();
				$("#closeBtn").hide();
				$("#deviceSearchFilterDiv").hide();
				$("#addDeviceDiv").show();
				self.addDeviceVisible(true);
				self.saveBtnVisible(false);
				$("#noneLabelShow").hide();
				$("#downloadAutomationCheckbox").hide();
				showHideTemplates(0);
				modelId = globalModelId[0].ModelId;
				$("#assignmentOptionsDiv").css('width', '50%');
				$("#referenceSetRadioButton").css('width', '45%');
				$("#rdblabelPackagesAndKeys").css('width', '45%');
			} else if (ADSearchUtil.AdScreenName == 'deviceProfile') {
				$("#cancelBtnAddDevice").hide();
				$("#cancelBtn").show();
				$("#closeBtnAddDevice").hide();
				$("#closeBtn").show();
				$("#deviceSearchFilterDiv").hide();
				$("#addDeviceDiv").show();
				self.addDeviceVisible(false);
				self.saveBtnVisible(true);
				$("#downloadAutomationCheckbox").hide();
				$("#downloadAutomationCheckbox").prop('disabled', true);
				$("#noneLabelShow").show();
				$("#assignmentOptionsDiv").css('width', '75%');
				$("#referenceSetRadioButton").css('width', '35%');
				$("#rdblabelPackagesAndKeys").css('width', '35%');
			} else {
				$("#AccordionPackages").removeAttr("href").css("cursor", "pointer");
				$("#resetFilterSwPkg").css("margin-right", "0px");
				$("#selectedAssignmentsGrid").css("height", "320px");

				$("#cancelBtnAddDevice").hide();
				$("#cancelBtn").show();
				$("#closeBtnAddDevice").hide();
				$("#closeBtn").show();
				$("#deviceSearchFilterDiv").show();
				$("#addDeviceDiv").hide();
				$("#assignmentOptionsDiv").css('width', '100%');
				$("#referenceSetRadioButton").css('width', '25%');
				$("#rdblabelPackagesAndKeys").css('width', '25%');
				self.addDeviceVisible(false);
				self.saveBtnVisible(true);

				var checkAll = checkAllSelected('Devicejqxgrid');
				if (checkAll == 1) {
					$("#downloadAutomationCheckbox").show();
					$("#deviceSearchFilterDiv").find("input").prop("disabled", true);
				} else {
					var selectedIds = getSelectedUniqueId('Devicejqxgrid');
					if (selectedIds.length == 1) {
						$("#downloadAutomationCheckbox").hide();
						$("#deviceSearchFilterDiv").find("input").prop("disabled", false);
					}
					else {
						$("#downloadAutomationCheckbox").show();
						$("#deviceSearchFilterDiv").find("input").prop("disabled", true);
					}
				}

				$("#noneLabelShow").show();
			}
		}

		function setInitialSelection() {
			if (isFromAddDevice == true && hasData == true) {
				// $("#assignmentDiv").find("input").prop("disabled", false);
				if (isEnabledValue == true) {
					$('#rdoEnabledValue').prop('checked', true);
					self.rbgDownloadAutomation('DownloadAutomation');
					self.rbgDownloadAutomationForAddDevice('DownloadAutomation');
				} else {
					$('#rdoDisabledValue').prop('checked', true);
					self.rbgDownloadAutomation('NotDownloadAutomation');
					self.rbgDownloadAutomationForAddDevice('NotDownloadAutomation');
				}

				if (isPackageChecked == true) {
					$("#btnForMoveRight").removeClass('disabled');
					$("#btnForMoveRight").prop("disabled", false);
					$("#btnForMoveleft").removeClass('disabled');
					$("#btnForMoveleft").prop("disabled", false);
					$("#btnMoveItemsUPID").removeClass('disabled');
					$("#btnMoveItemsUPID").prop("disabled", true);
					$("#btnMoveItemsDown").removeClass('disabled');
					$("#btnMoveItemsDown").prop("disabled", true);

					self.assignmentTypeChkbox(true)
					$('#rbtnPackages').prop('checked', true);
					self.rbgAssignmentType('optiond3')
					self.packageShow();
				} else if (isPackageChecked == false) {
					self.assignmentTypeChkbox(true);

					self.rbgAssignmentType('optiond2');
					$('#rbtnReferenceSet').prop('checked', true);

					if (isDirectAssignment == true) {
						$("#inheriDirectAssgnmnt").find("input").prop("disabled", false);
						self.isEnableDownloadCheckboxForAddDevice(true);
						self.rbgReferenceSetType('optiond2');
						$('#rdoBtnDirect').prop('checked', true);

						self.referenceSetShow();
					} else if (isInherit == true) {
						self.rbgReferenceSetType('optiond3');
						self.referenceSetShow();
					}
				}
			} else if (isFromAddDevice == true && hasData == false) {
				//$("#assignmentDiv").find("input").prop("disabled", true);
				if (!licenseSource.isSoftwareAssignmenttoDeviceLicensed && licenseSource.isOnlineKeyLicensed) {
					$('#rbtnPackages').prop('checked', true);
					self.rbgAssignmentType('optiond3');
					showPackages();
					keysGridModel(self.keysData, self.openPopup, self.movedArray);
					return;
				} else {
					self.rbgAssignmentType('optiond2');
					$('#rbtnReferenceSet').prop('checked', true);
					licenseSource.isAutoDownloadsLicensed ? self.rbgReferenceSetType('optiond3') : self.rbgReferenceSetType('optiond2');
					if (!isGetReferenceSetsForDevices) {
						modelId = globalModelId[0].ModelId;
						var param = getReferenceSetModel('Devicejqxgrid', false, columnSortFilterForReferenceSet, null, null, 0);
						referenceSetGrid('jqxgridSAReferenceSet', param, self.inheritedReferenceSet, self.availableApplicationTemplates, self.selectedApplicationTemplates, self.assignedHierarchyTemplate);
					}
					showInheritFromHierarchy();
				}
			} else {
				if (!licenseSource.isSoftwareAssignmenttoDeviceLicensed) {
					showKeys();
					return;
				}
				if (!licenseSource.isAutoDownloadsLicensed) {
					self.rbgDownloadAutomationForAddDevice('NotDownloadAutomation');
				}
				$("#none").hide();
				$("#packagesGrid").hide();
				$("#showOverrite").hide();
				$("#refernceSetGrid").show();
				//$("#assignmentDiv").find("input").prop("disabled", true);
			}
		}

		function getSystemConfigurationForSchedule() {
			var category = AppConstants.get('SYSTEM');
			var configName = AppConstants.get('MAX_SCHEDULE_COUNT_PER_JOB');

			function callbackFunction(data, error) {
				if (data) {
					isGetSystemConfiguration = true;
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.systemConfiguration)
							data.systemConfiguration = $.parseJSON(data.systemConfiguration);

						maxSoftwareAssignment = data.systemConfiguration.ConfigValue;
					}

					if (self.protocolVEMVisibility()) {
						if (isFromAddDevice == false) {
							isDirectAssignment = false;
							CheckAutoDownloadStatus('Devicejqxgrid', self.rbgDownloadAutomation, self.isSoftwareAssigned, self.protocolVEMVisibility, self.protocolZTVisibility);
						}
					}
				}
			}

			var method = 'GetSystemConfiguration';
			var params = '{"token":"' + TOKEN() + '","category":"' + category + '","configName":"' + configName + '"}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		self.openPopup = function (popupName, gId) {
			self.templateFlag(true);
			if (popupName == "modelViewParentDownloadLibrary") {
				loadelement(popupName, 'genericPopup');
				$('#softwareAssignmentParentViewModel').modal('show');
			}
		}
		self.unloadTempPopup = function (popupName) {
			self.observableModelPopupParentView('unloadTemplate');

			$('#softwareAssignmentParentViewModel').modal('hide');
			//$("#deviceProfileModel").modal('hide');
			$("#rdoBtnDirect").prop("checked", false);

			var childrenContent = $("#mainScrenContent").children().attr("id");

			checkIsPopUpOPen();
		}

		if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
			self.protocolVEMVisibility(false);
			self.protocolZTVisibility(true);
		}

		///Close popup of Application
		self.closeApplicationView = function () {
			$("#childApplicationView").modal('hide');
		}

		//clear filter of application
		self.clearfilterApplication = function (gridId) {
			clearUiGridFilter(gridId);
			$('#' + gridId).jqxGrid('clearselection');
		}

		//export application 
		self.exportToExcelApplication = function (gridId) {
			var dataInfo = $("#" + gridId).jqxGrid('getdatainformation');
			if (dataInfo.rowscount <= 0) {
				openAlertpopup(1, 'no_data_to_export');
			} else {
				$("#loadingDiv").show();
				$("#" + gridId).jqxGrid('exportdata', 'csv', 'Application');
				openAlertpopup(1, 'export_Information');
				$("#loadingDiv").hide();
			}
		}

		//unload popup for add device
		self.cancelForAddDevice = function (unloadTempPopup) {
			if ($("#txtSoftwareAssignment").val() == '') {
				unloadTempPopup('unloadTemplate');
			} else {
				unloadTempPopup('unloadTemplate');
				//$('#deviceModelFormanually').modal('hide');
			}
		}

		function moveItems(origin, dest) {
			$(origin).find(':selected').appendTo(dest);
		}

		function moveAllItems(origin, dest) {
			$(origin).children().appendTo(dest);
		}

		function upPackages() {
			var selected = $("#jqxgridSelectedPackageGrid").find(":selected");
			var before = selected.prev();
			if (before.length > 0)
				selected.detach().insertBefore(before);
		}

		function downPackages() {
			var selected = $("#jqxgridSelectedPackageGrid").find(":selected");
			var next = selected.next();
			if (next.length > 0)
				selected.detach().insertAfter(next);
		}

		// enabled save button on enabled radio button
		$("#rdoEnabled").on('change keyup paste', function () {
			if ($("#rdoEnabled").val() != "") {
				if (isFromAddDevice == true) {
					$("#btnAdd").prop("disabled", false);
				} else {
					enableDisableSaveButton(1);
				}
			}
		});

		// enabled save button on disabled radio button
		$("#rdoDisabled").on('change keyup paste', function () {
			if ($("#rdoDisabled").val() != "") {
				if (isFromAddDevice == true) {
					$("#btnAdd").prop("disabled", false);
				} else {
					enableDisableSaveButton(1);
				}
			}
		});

		// Clear filter for Reference set grid
		self.clearfilter = function (gridID) {
			gridFilterClear(gridID);
			checkRadioState = '';
		}

		self.clearWildcardFilter = function (gId) {
			clearUiGridFilter(gId);
			$('#' + gId).jqxGrid('clearselection');
			if (gId === 'jqxGridAvailableParameterTemplates') {
				$("#btnMoveRightSoftwareTemplate").addClass('disabled');
				$("#btnMoveRightSoftwareTemplate").prop('disabled', true);
			} else if (gId === 'jqxGridAssignedParameterTemplates') {
				$("#btnMoveLeftSoftwareTemplate").addClass('disabled');
				$("#btnMoveLeftSoftwareTemplate").prop('disabled', true);
			}
		}

		//clear filter for avilable referset grid
		self.clearFilterForModel = function (gId) {
			isSelectedUpdated = true;
			clearUiGridFilter(gId);
			$('#' + gId).jqxGrid('clearselection');
			$("#btnForMoveRight").addClass('disabled');
			$("#btnForMoveRight").prop('disabled', true);
		}

		self.downloadAutomationClickEvent = function () {
			isDownloadAutomationChanged = false;
			if ($("#downloadAutomationCheckbox").is(':checked')) {
				$("#deviceSearchFilterDiv").find("input").prop("disabled", false);
				if ($("#rdoEnabled").is(':checked') && !$("#rdoBtnHierarchy").is(':checked')) {
					enableDisableDownloadOptions(1);
				}
				return true;
			} else {
				enableDisableSaveButton(0);
				$("#deviceSearchFilterDiv").find("input").prop("disabled", true);
				enableDisableDownloadOptions(0);
				return false;
			}
		}

		self.enableClick = function () {
			isEnabledValue = true;
			isAutomationResult = false;
			if (isFromAddDevice == true) {
				//if ($("#cbAssignmentType").is(':checked')) {
				if ($("#rbtnReferenceSet").is(':checked')) {
					if (isDirectAssignment) {
						enableDisableDownloadOptions(1);
						if (isDirectSoftAssignMent == 0) {
							$("#btnAdd").prop("disabled", true);
						} else if (isDirectSoftAssignMent == 1) {
							$("#btnAdd").prop("disabled", false);
						}
					} else if (isInherit) {
						$("#btnAdd").prop("disabled", false);
					}
				} else if ($("#rbtnPackages").is(':checked')) {
					enableDisableDownloadOptions(1);
					if (movedPackages && movedPackages.length > 0) {
						$("#btnAdd").prop("disabled", false);
					}
				}
				//}
				//else {
				//    $("#btnAdd").prop("disabled", false);
				//}
				return true;
			} else {
				isDownloadAutomationChanged = true;
				enableDisableDownloadOptions(1);
				//if ($("#cbAssignmentType").is(':checked')) {
				if ($("#rbtnPackages").is(':checked')) {
					self.saveBtnEnableDisable();
					if (self.movedArray().length > 0) {
						enableDisableSaveButton(1);
					}
				} else if ($("#rbtnReferenceSet").is(':checked')) {
					if ($('#rdoBtnHierarchy').is(':checked')) {
						enableDisableDownloadOptions(0);
						enableDisableSaveButton(1);
					} else if (checkRadioState != '' && checkRadioState != 0) {
						enableDisableSaveButton(1);
					} else if (referenceSetId != '' && referenceSetId != 0) {
						enableDisableSaveButton(1);
					} else if (isDownloadAutomationChanged) {
						enableDisableSaveButton(1);
					} else {
						enableDisableSaveButton(0);
					}
				} else if ($("#rbtnNone").is(':checked')) {
					enableDisableDownloadOptions(0);
					enableDisableSaveButton(1);
				}
				//} else {
				//    enableDisableSaveButton(1);
				//}
				return true;
			}
		}

		self.disableClick = function () {
			isEnabledValue = false;
			isAutomationResult = false;
			enableDisableDownloadOptions(0);
			if (isFromAddDevice == true) {
				//if ($("#cbAssignmentType").is(':checked')) {
				if ($("#rbtnReferenceSet").is(':checked')) {
					if (isDirectAssignment) {
						if (isDirectSoftAssignMent == 0) {
							$("#btnAdd").prop("disabled", true);
						} else if (isDirectSoftAssignMent == 1) {
							$("#btnAdd").prop("disabled", false);
						}
					} else if (isInherit) {
						$("#btnAdd").prop("disabled", false);
					}
				} else if ($("#rbtnPackages").is(':checked')) {
					if (movedPackages && movedPackages.length > 0) {
						$("#btnAdd").prop("disabled", false);
					}
				}
				//}
				//else {
				//    $("#btnAdd").prop("disabled", false);
				//}
				return true;
			} else {
				isDownloadAutomationChanged = true;
				//if ($("#cbAssignmentType").is(':checked')) {

				if ($("#rbtnPackages").is(':checked')) {
					self.saveBtnEnableDisable();
					if (self.movedArray().length > 0) {
						enableDisableSaveButton(1);
					}
				} else if ($("#rbtnReferenceSet").is(':checked')) {
					if ($('#rdoBtnHierarchy').is(':checked')) {
						enableDisableSaveButton(1);
					} else if (checkRadioState != '' && checkRadioState != 0) {
						enableDisableSaveButton(1);
					} else if (referenceSetId != '' && referenceSetId != 0) {
						enableDisableSaveButton(1);
					} else if (isDownloadAutomationChanged) {
						enableDisableSaveButton(1);
					} else {
						enableDisableSaveButton(0);
					}
				} else if ($("#rbtnNone").is(':checked')) {
					enableDisableSaveButton(1);
				}
				//} else {
				//    enableDisableSaveButton(1);
				//}
				return true;
			}
		}

		self.cancelClick = function () {
			$("#childApplicationView").modal('hide');
		}
		self.clearTablefilter = function (tableid) {
			isSelectedUpdated = true;
			clearCustomFilterInTable(tableid);
			if (isSelectedPaneFiltered) {
				clearSelectedPackagesPane();
				isSelectedPaneFiltered = false;
			}
		}

		self.customfilter = function (element, dataArray) {
			customTableFilter(element, dataArray, callBackOnCustomFilter);
		}

		function callBackOnCustomFilter(isFilterApplied) {
			if (isFilterApplied) {
				isSelectedPaneFiltered = true;
				clearSelectedPackagesPane();
			}
			else {
				if (isSelectedPaneFiltered)
					clearSelectedPackagesPane();

				isSelectedPaneFiltered = false;
			}
		}

		//Removing checked array and disabling Up/Down arrows on Filter apply 
		function clearSelectedPackagesPane() {
			self.movedArray().forEach(function (element, index) {
				var id = '#selectedpackagecb' + index + '';
				$(id)[0].checked = false;
				element.actionSelected = false;
			});
			selectedRowArrayForSwap = [];
			//selectedDownloadsActionsContent = [];
			$("#btnForMoveleft").addClass('disabled');
			$("#btnForMoveleft").prop('disabled', true);
			$("#btnMoveItemsUPID").addClass('disabled');
			$("#btnMoveItemsDown").addClass('disabled');
			$("#btnMoveItemsUPID").prop('disabled', true);
			$("#btnMoveItemsDown").prop('disabled', true);
		}

		self.SelectSelectedPackageRowTest = function (data, index) {
			$("#btnForMoveleft").removeClass('disabled');
			var id = '#selectedpackagecb' + index + '';
			if ($(id)[0].checked == true) {
				selectedRowArrayForSwap.push(data);
			} else {
				for (var i = 0; i < selectedRowArrayForSwap.length; i++) {
					if (data.PackageName == selectedRowArrayForSwap[i].PackageName) {
						selectedRowArrayForSwap.splice(i, 1);
					}
				}
				if (selectedRowArrayForSwap.length <= 0) {
					$("#btnForMoveleft").addClass('disabled');
				}
			}
			//-----button enabled/disabled depend on index and length of array------
			var arr = self.movedArray();
			var selid = arr.length;
			selid = selid - 1;

			if (index == 0) {
				if (selid == 0) {
					$("#btnMoveItemsDown").addClass('disabled');
					$("#btnMoveItemsUPID").addClass('disabled');
				} else {
					$("#btnMoveItemsDown").removeClass('disabled');
					$("#btnMoveItemsUPID").addClass('disabled');
				}
			} else if (index == selid) {
				$("#btnMoveItemsDown").addClass('disabled');
				$("#btnMoveItemsUPID").removeClass('disabled');

			} else {
				$("#btnMoveItemsDown").removeClass('disabled');
				$("#btnMoveItemsUPID").removeClass('disabled');
			}
		}

		self.SelectAllSelectedPackages = function () {
			var selectedpackages = self.movedArray();
			if ($('#selectallselectedpackages')[0].checked == true) {
				if (selectedpackages.length > 0) {
					$("#btnForMoveleft").removeClass('disabled');
					$("#btnForMoveleft").prop('disabled', false);
					selectedRowArrayForSwap = [];
					for (var i = 0; i < selectedpackages.length; i++) {
						selectedpackages[i].packageSelected = true;
						selectedRowArrayForSwap.push(selectedpackages[i]);
					}

				}
			} else {
				$("#btnForMoveleft").addClass('disabled');
				$("#btnForMoveleft").prop('disabled', true);
				selectedRowArrayForSwap = [];
				for (var i = 0; i < selectedpackages.length; i++) {
					selectedpackages[i].packageSelected = false;
				}
			}

			$("#btnMoveItemsUPID").addClass('disabled');
			$("#btnMoveItemsDown").addClass('disabled');
			$("#btnMoveItemsUPID").prop('disabled', true);
			$("#btnMoveItemsDown").prop('disabled', true);
			self.movedArray([]);
			self.movedArray(selectedpackages);
		}

		function getSponsorName(selectedList) {
			var sponsorName = "";
			for (var i = 0; i < selectedList.length; i++) {
				if (selectedList[i].Type == AppConstants.get('Assignment_Package')) {
					if (selectedList[i].SponsorName && selectedList[i].SponsorName != '') {
						sponsorName = selectedList[i].SponsorName
					}
				}
			}
			return sponsorName;
		}

		function valdiateSponsorName(packagelist) {
			var sponsorName = "";
			for (var i = 0; i < packagelist.length; i++) {
				if (packagelist[i].SponsorName && packagelist[i].SponsorName != '') {
					if (sponsorName != '' && sponsorName != packagelist[i].SponsorName) {
						return false;
					} else {
						sponsorName = packagelist[i].SponsorName
					}
				}
			}
			return true;
		}
		///////////////////////////////////////////////////////////// start Left/Right/Up/Down Packages///////////////////////////////////////

		self.rightPackages = function (unloadTempPopup) {
			gridSelectedArryForSwap = new Array();
			if (self.accordionPanel() == 'Packages') {
				var selectedData = getMultiSelectedData('jqxgridAvailablePackage');
				var selectedDataArray = getSelectedUniqueId('jqxgridAvailablePackage');
				for (k = 0; k < selectedDataArray.length; k++) {
					var SponsorName = '';
					if (self.movedArray().length > 0) {
						SponsorName = getSponsorName(self.movedArray());
						var duplicatePackage = _.where(self.movedArray(), { PackageId: selectedDataArray[k] });
						if (!_.isEmpty(duplicatePackage) && duplicatePackage.length > 0) {
							openAlertpopup(1, 'same_package_different_folder_job');
							continue;
						}
					} else if (gridSelectedArryForSwap.length > 0) {
						SponsorName = getSponsorName(gridSelectedArryForSwap);
					}

					var selectedsource = _.where(selectedData, { PackageId: selectedDataArray[k] });
					if (selectedsource && SponsorName != '' && selectedsource.length > 0 && selectedsource[0].SponsorName != '' && (SponsorName != selectedsource[0].SponsorName)) {
						openAlertpopup(1, 'no_common_sponsorname');
						return;
					}

					var selectedRow = new Object();
					if (selectedsource && selectedsource.length > 0) {
						selectedRow.FileName = selectedsource[0].FileName;
						selectedRow.PackageId = selectedsource[0].PackageId;
						selectedRow.PackageName = selectedsource[0].PackageName;
						selectedRow.PackageMode = selectedsource[0].PackageMode;
						selectedRow.IsEnabledForAutomation = selectedsource[0].IsEnabledForAutomation;
						selectedRow.FileVersion = selectedsource[0].FileVersion;
						selectedRow.SponsorName = selectedsource[0].SponsorName;
						selectedRow.FolderName = selectedsource[0].FolderName;
						selectedRow.Type = AppConstants.get('Assignment_Package');
						selectedRow.Details = "Name: " + selectedsource[0].PackageName + ' , Version: ' + selectedsource[0].FileVersion + ' , Folder: ' + selectedsource[0].FolderName;
						selectedRow.IsEnabledForAutomation = selectedsource[0].IsEnabledForAutomation;
						gridSelectedArryForSwap.push(selectedRow);
					}
				}
				if (valdiateSponsorName(gridSelectedArryForSwap) == false) {
					openAlertpopup(1, 'no_common_sponsorname');
					return;
				}
			} else if (self.accordionPanel() == 'Keys') {
				var selectedKeyData = getMultiSelectedData('jqxgridAvailableKeys');
				var selectedKeyDataArray = getSelectedUniqueId('jqxgridAvailableKeys');
				for (k = 0; k < selectedKeyDataArray.length; k++) {
					var selectedkeysource = _.where(selectedKeyData, { KeyHandleId: selectedKeyDataArray[k] });
					var selectedRow = new Object();
					if (selectedkeysource.length > 0) {
						var keysData = selectedkeysource[0];
						keysData.packageSelected = false;
						keysData.Type = AppConstants.get('Assignment_Key');
						if (!keysData.KeyType || keysData.KeyType == null || keysData.KeyType == undefined) {
							keysData.KeyType = '';
						}
						if (!keysData.Destination || keysData.Destination == null || keysData.Destination == undefined) {
							keysData.Destination = '';
						}
						keysData.Details = "Name: " + keysData.Name + ' , Key Type: ' + keysData.KeyType + ' , Destination: ' + keysData.Destination;
						gridSelectedArryForSwap.push(keysData);
					}
				}
			}
			if (gridSelectedArryForSwap.length > 0) {
				totalpackageassignment = gridSelectedArryForSwap.length + self.movedArray().length;
				if (totalpackageassignment > maxSoftwareAssignment) {
					openAlertpopup(1, i18n.t('maximum_of_3_packages_can_be_selected_for_assignment', { maxSoftwareAssignment: maxSoftwareAssignment }, { lng: lang }));
					return;
				} else {
					isSelectedUpdated = true;
					var iskeysUpdated = false;
					for (i = 0; i < gridSelectedArryForSwap.length; i++) {
						gridSelectedArryForSwap[i].packageSelected = false;
						self.movedArray.push(gridSelectedArryForSwap[i]);
						if (gridSelectedArryForSwap[i].Type == AppConstants.get('Assignment_Key')) {
							var selectedkeysource = _.where(self.keysData(), { KeyProfileId: parseInt(gridSelectedArryForSwap[i].KeyHandleId) });
							self.keysData.remove(selectedkeysource[0]);
							iskeysUpdated = true;
						} else if (gridSelectedArryForSwap[i].Type == AppConstants.get('Assignment_Package')) {
							var selectedsource = _.where(self.packageData(), { PackageName: gridSelectedArryForSwap[i].PackageName });
							self.packageData.remove(selectedsource[0]);
						}

					}
					if (iskeysUpdated) {
						clearMultiSelectedData('jqxgridAvailableKeys');
						$("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
						$("#jqxgridAvailableKeys").jqxGrid('clearselection');
					}
				}

				var arr = self.packageData();
				var unselectedPackagesId = new Array();
				for (var j = 0; j < arr.length; j++) {
					unselectedPackagesId[j] = arr[j].PackageId;
				}
				if (isFromAddDevice == true) {
					self.completePackageMoveRight(false);
				}
				if (self.accordionPanel() == 'Packages') {
					assignSoftwareToDevices(self.movedArray(), 'Devicejqxgrid', unloadTempPopup, unselectedPackagesId, false, true);
					clearMultiSelectedData('jqxgridAvailablePackage');
					self.selectedApplicationName(gridSelectedArryForSwap[0].PackageName);
					if (self.packageData().length <= 0) {
						$("#btnForAllMoveright").addClass('disabled');
					}
				} else {
					if (self.keysData().length <= 0) {
						$("#btnForAllMoveright").addClass('disabled');
					}
				}
				if (self.movedArray().length > 0) {
					$("#btnForAllMoveleft").removeClass('disabled');
				}
				if (isSelectedPaneFiltered) {
					clearCustomFilterInTable("selectpackagestable");
					clearSelectedPackagesPane();
					isSelectedPaneFiltered = false;
				}
				else {
					//To Enable/Disble the Up/Down Arrows----
					if (selectedRowArrayForSwap.length > 0) {
						var lastIndex = self.movedArray().length - 1;
						$("#btnMoveItemsDown").addClass('disabled');
						$("#btnMoveItemsDown").prop('disabled', true);
						enableDisableUpDownArrowsInPopUp(selectedRowArrayForSwap, lastIndex, "#btnMoveItemsUPID", "#btnMoveItemsDown");
					}
				}
			}
			else if (_.isEmpty(selectedDataArray)) {
				openAlertpopup(1, 'please_selct_row');
			}
			self.saveBtnEnableDisable();
		}

		function selectedHighlightedRowForGrid(gId) {   //Selection row and State maintain In grid
			var datainformations = $("#" + gId).jqxGrid('getdatainformation');
			if (datainformations != null && datainformations != undefined) {
				var rowscounts = datainformations.rowscount;
				if (rowscounts > 0) {
					if (gId === 'jqxGridAvailableParameterTemplates') {
						if (highlightedIndexAvailableTemplates == undefined || highlightedIndexAvailableTemplates == -1) {
							$('#' + gId).jqxGrid('clearselection');
							gridSelectedDataForSwap = [];
						} else if (highlightedIndexAvailableTemplates == rowscounts) {
							highlightedIndexAvailableTemplates = highlightedIndexAvailableTemplates - 1;
							$('#' + gId).jqxGrid('selectrow', highlightedIndexAvailableTemplates);
						} else {
							$('#' + gId).jqxGrid('selectrow', highlightedIndexAvailableTemplates);
						}
						$("#btnMoveRightSoftwareTemplate").removeClass('disabled');
						$("#btnMoveRightSoftwareTemplate").prop('disabled', false);
					} else if (gId === 'jqxGridAssignedParameterTemplates') {
						if (highlightedIndexAssignedTemplates == undefined || highlightedIndexAssignedTemplates == -1) {
							$('#' + gId).jqxGrid('clearselection');
							gridSelectedDataForSwap = [];
						} else if (highlightedIndexAssignedTemplates == rowscounts) {
							highlightedIndexAssignedTemplates = highlightedIndexAssignedTemplates - 1;
							$('#' + gId).jqxGrid('selectrow', highlightedIndexAssignedTemplates);
						} else {
							$('#' + gId).jqxGrid('selectrow', highlightedIndexAssignedTemplates);
						}
						$("#btnMoveLeftSoftwareTemplate").removeClass('disabled');
						$("#btnMoveLeftSoftwareTemplate").prop('disabled', false);
					} else {
						if (rowIndexForHighlighted == undefined || rowIndexForHighlighted == -1) {
							$('#' + gId).jqxGrid('clearselection');
							gridSelectedDataForSwap = [];
						} else if (rowIndexForHighlighted == rowscounts) {
							rowIndexForHighlighted = rowIndexForHighlighted - 1;
							$('#' + gId).jqxGrid('selectrow', rowIndexForHighlighted);
						} else {
							$('#' + gId).jqxGrid('selectrow', rowIndexForHighlighted);
						}
					}
				} else {
					if (gId === 'jqxGridAvailableParameterTemplates') {
						$("#btnMoveRightSoftwareTemplate").addClass('disabled');
						$("#btnMoveRightSoftwareTemplate").prop('disabled', true);
						highlightedIndexAvailableTemplates = -1;
					} else if (gId === 'jqxGridAssignedParameterTemplates') {
						$("#btnMoveLeftSoftwareTemplate").addClass('disabled');
						$("#btnMoveLeftSoftwareTemplate").prop('disabled', true);
						highlightedIndexAssignedTemplates = -1;
					} else {
						$("#btnForMoveRight").addClass('disabled');
						$("#btnForMoveRight").prop('disabled', true);
						rowIndexForHighlighted = undefined;
					}
				}
			}
		}

		self.selectMovedPackageRow = function (data, index) {
			$("#btnForMoveleft").removeClass('disabled');
			$("#btnForMoveleft").prop("disabled", false);
			var id = '#selectedpackagecb' + index + '';
			if ($(id)[0].checked == true) {
				var isExists = false;
				if (selectedRowArrayForSwap.length > 0) {
					for (var j = 0; j < selectedRowArrayForSwap.length; j++) {
						if (selectedRowArrayForSwap[j].Type == AppConstants.get('Assignment_Key')) {
							if (data.KeyHandleId == selectedRowArrayForSwap[j].KeyHandleId) {
								selectedRowArrayForSwap.splice(j, 1);
								break;
							}
						} else if (selectedRowArrayForSwap[j].Type == AppConstants.get('Assignment_Package')) {
							if (data.PackageId == selectedRowArrayForSwap[j].PackageId) {
								selectedRowArrayForSwap.splice(j, 1);
								break;
							}
						}
					}
				}
				data.SelectedArrayIndex = index;
				selectedRowArrayForSwap.push(data);
			} else {
				for (var i = 0; i < selectedRowArrayForSwap.length; i++) {
					if (selectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Key')) {
						if (data.KeyHandleId == selectedRowArrayForSwap[i].KeyHandleId) {
							selectedRowArrayForSwap.splice(i, 1);
						}
					} else if (selectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Package')) {
						if (data.PackageId == selectedRowArrayForSwap[i].PackageId) {
							selectedRowArrayForSwap.splice(i, 1);
						}
					}

				}
				if (selectedRowArrayForSwap.length == 0) {
					$("#btnForMoveleft").addClass('disabled');
				}
				//#Updating changed index into array "selectedRowArrayForSwap"
				var arr = self.movedArray();
				selectedRowArrayForSwap.forEach(function (element) {
					if (element.Type == AppConstants.get('Assignment_Key')) {
						element.SelectedArrayIndex = getArrayIndexForKey(arr, 'PackageId', element.PackageId);
					} else if (element.Type == AppConstants.get('Assignment_Package')) {
						element.SelectedArrayIndex = getArrayIndexForKey(arr, 'KeyHandleId', element.KeyHandleId);
					}
				});
			}

			rowIdForHighlightedForTable = index;
			if (isSelectedPaneFiltered || selectedRowArrayForSwap.length == 0 || (selectedRowArrayForSwap.length == self.movedArray().length)) {
				$("#btnMoveItemsUPID").addClass('disabled');
				$("#btnMoveItemsDown").addClass('disabled');
				$("#btnMoveItemsUPID").prop('disabled', true);
				$("#btnMoveItemsDown").prop('disabled', true);
				return;
			}

			var selectedIds = getSelectedUniqueId('Devicejqxgrid');
			if (selectedIds.length > 1 && (!$("#overrideCheckbox").is(':checked')))
				return;

			//To Enable/Disble the Up/Down Arrows---- 
			var lastIndex = self.movedArray().length - 1;
			enableDisableUpDownArrowsInPopUp(selectedRowArrayForSwap, lastIndex, "#btnMoveItemsUPID", "#btnMoveItemsDown");
		}

		self.allPackagesMoveLeft = function () {
			var arr = self.movedArray();
			var keysExistInAssignment = false;
			if (arr.length > 0) {
				for (i = 0; i < arr.length; i++) {
					self.movedArray([]);
					arr[i].packageSelected = false;
					arr[i].isSelected = false;
					if (arr[i].Type == AppConstants.get('Assignment_Package')) {
						self.packageData.push(arr[i]);
					} else if (arr[i].Type == AppConstants.get('Assignment_Key')) {
						self.keysData.push(arr[i]);
						keysExistInAssignment = true;
					}
				}
			}
			if (self.packageData().length > 0) {
				$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
				$("#jqxgridAvailablePackage").jqxGrid('clearselection');
			}
			if (!isKeysDataLoaded && keysExistInAssignment) {
				self.keysData([]);
				keysGridModel(self.keysData, self.openPopup, self.movedArray);
			}
			if (self.keysData().length > 0) {
				$("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
				$("#jqxgridAvailableKeys").jqxGrid('clearselection');
			}
			$("#btnForMoveleft").addClass('disabled');
			$("#btnForMoveleft").prop('disabled', true);
			$("#btnForMoveRight").addClass('disabled');
			$("#btnForMoveRight").prop('disabled', true);
			$("#btnMoveItemsUPID").addClass('disabled');
			$("#btnMoveItemsUPID").prop('disabled', true);
			$("#btnMoveItemsDown").addClass('disabled');
			$("#btnMoveItemsDown").prop("disabled", true);

			$("#btnAdd").prop("disabled", true);
			$("#btn_SaveAssignmentId").prop('disabled', true);
			$("#overrideCheckbox").prop('disabled', false);

			gridSelectedArryForSwap = [];
			selectedRowArrayForSwap = [];
			self.saveBtnEnableDisable();
		}
		self.allPackagesMoveRight = function (unloadTempPopup) {
			if (self.accordionPanel() == 'Packages') {
				var arr = JSON.parse(JSON.stringify(self.packageData()));
				if (valdiateSponsorName(self.packageData()) == false) {
					openAlertpopup(1, 'no_common_sponsorname');
					return;
				}
				if (arr.length > 0) {
					for (i = 0; i < arr.length; i++) {
						var packageData = arr[i];
						packageData.packageSelected = false;
						packageData.isSelected = false;
						packageData.Type = AppConstants.get('Assignment_Package');
						packageData.Details = "Name: " + packageData.PackageName + ' , Version: ' + packageData.FileVersion + ' , Folder: ' + packageData.FolderName;
						self.movedArray.push(packageData);
						var selectedsource = _.where(self.packageData(), { PackageName: arr[i].PackageName });
						self.packageData.remove(selectedsource[0]);
					}
					var arr = self.packageData();
					var unselectedPackagesId = new Array();
					for (var j = 0; j < arr.length; j++) {
						unselectedPackagesId[j] = arr[j].PackageId;
					}
					assignSoftwareToDevices(self.movedArray(), 'Devicejqxgrid', unloadTempPopup, unselectedPackagesId, false, true);
					clearMultiSelectedData('jqxgridAvailablePackage');
					$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
					$("#jqxgridAvailablePackage").jqxGrid('clearselection');
				}
			} else if (self.accordionPanel() == 'Keys') {
				var keysarray = JSON.parse(JSON.stringify(self.keysData()));
				if (keysarray.length > 0) {
					for (i = 0; i < keysarray.length; i++) {
						var keysData = keysarray[i];
						keysData.packageSelected = false;
						keysData.Type = AppConstants.get('Assignment_Key');
						if (!keysData.KeyType || keysData.KeyType == null || keysData.KeyType == undefined) {
							keysData.KeyType = '';
						}
						if (!keysData.Destination || keysData.Destination == null || keysData.Destination == undefined) {
							keysData.Destination = '';
						}
						keysData.Details = "Name: " + keysData.Name + ' , Key type: ' + keysData.KeyType + ' , Destination: ' + keysData.Destination;
						self.movedArray.push(keysData);
						var selectedsource = _.where(self.keysData(), { KeyProfileId: parseInt(keysarray[i].KeyProfileId) });
						self.keysData.remove(selectedsource[0]);
					}
					clearMultiSelectedData('jqxgridAvailableKeys');
					$("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
					$("#jqxgridAvailableKeys").jqxGrid('clearselection');
				}
			}
			$("#btnForMoveleft").addClass('disabled');
			$("#btnForMoveleft").prop('disabled', true);
			$("#btnForMoveRight").addClass('disabled');
			$("#btnForMoveRight").prop('disabled', true);
			$("#btnMoveItemsUPID").addClass('disabled');
			$("#btnMoveItemsUPID").prop('disabled', true);
			$("#btnMoveItemsDown").addClass('disabled');
			$("#btnMoveItemsDown").prop("disabled", true);

			$("#btnAdd").prop("disabled", true);
			$("#btn_SaveAssignmentId").prop('disabled', true);
			$("#overrideCheckbox").prop('disabled', false);

			gridSelectedArryForSwap = [];
			self.saveBtnEnableDisable();
		}

		self.leftPackages = function () {
			self.allselectedpackagesSelected(false);
			if (selectedRowArrayForSwap.length > 0) {
				isSelectedUpdated = true;
				var isKeysSelected = false;
				var isPackagesSelected = false;
				for (var i = 0; i < selectedRowArrayForSwap.length; i++) {
					self.movedArray.remove(selectedRowArrayForSwap[i]);
					selectedRowArrayForSwap[i].packageSelected = false;
					selectedRowArrayForSwap[i].isSelected = false;
					if (selectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Key')) {
						self.keysData.push(selectedRowArrayForSwap[i]);
						if (!isKeysDataLoaded) {
							self.keysData([]);
							keysGridModel(self.keysData, self.openPopup, self.movedArray);
						}
						$("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
						$("#jqxgridAvailableKeys").jqxGrid('clearselection');
						isKeysSelected = true;
					} else if (selectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Package')) {
						self.packageData.push(selectedRowArrayForSwap[i]);
						$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
						$("#jqxgridAvailablePackage").jqxGrid('clearselection');
						isPackagesSelected = true;
					}
				}
				selectedRowArrayForSwap = [];
				gridSelectedArryForSwap = [];
				if (isKeysSelected) {
					selectedHighlightedRowForGrid('jqxgridAvailableKeys');
				}
				if (isPackagesSelected) {
					selectedHighlightedRowForGrid('jqxgridAvailablePackage');
				}
				//$("#btnForMoveleft").addClass('disabled');
				if (self.movedArray().length <= 0) {
					//$("#btnForMoveleft").prop("disabled", true);
					$("#btnForAllMoveleft").addClass('disabled');
					$("#btnForAllMoveleft").prop("disabled", true);
					if (isFromAddDevice == true) {
						$("#btnAdd").prop("disabled", true);
					} else {
						$("#btn_SaveAssignmentId").prop('disabled', true);
					}
				} else {
					$("#btnForAllMoveleft").removeClass('disabled');
					$("#btnForAllMoveleft").prop("disabled", false);
				}

				$("#tbodySelectedpack").children('tr').removeClass('refselection');
				// $("#SelectPackrow" + l).addClass('refselection');

				$("#btnForMoveleft").addClass('disabled');
				$("#btnForMoveleft").prop("disabled", true);
				$("#btnMoveItemsUPID").addClass('disabled');
				$("#btnMoveItemsUPID").prop("disabled", true);
				$("#btnMoveItemsDown").addClass('disabled');
				$("#btnMoveItemsDown").prop("disabled", true);
				if (isSelectedPaneFiltered) {
					clearCustomFilterInTable("selectpackagestable");
					clearSelectedPackagesPane();
					isSelectedPaneFiltered = false;
				}

				if (self.movedArray().length == 0) {
					enableDisableSaveButton(0);
				} else {
					enableDisableSaveButton(1);
				}
			} else {
				openAlertpopup(1, 'please_selct_row');
			}
			self.saveBtnEnableDisable();
		}

		self.moveItemsUP = function () {
			if (selectedRowArrayForSwap.length > 0) {
				isSelectedUpdated = true;
				var arr = self.movedArray();
				//#Sorting the selected array for swap, based on moved array index
				var sortedselectedRowArrayForSwap = _.sortBy(selectedRowArrayForSwap, 'SelectedArrayIndex');

				for (var i = 0; i < sortedselectedRowArrayForSwap.length; i++) {
					var index = 0;
					if (sortedselectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Key')) {
						index = getArrayIndexForKey(arr, 'KeyHandleId', sortedselectedRowArrayForSwap[i].KeyHandleId);
					} else if (sortedselectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Package')) {
						index = getArrayIndexForKey(arr, 'PackageName', sortedselectedRowArrayForSwap[i].PackageName);
					}
					arr.moveUp(arr[index]);
					self.movedArray(arr);
				}

				//#Updating changed index into array "selectedRowArrayForSwap"
				selectedRowArrayForSwap.forEach(function (element) {
					if (element.Type == AppConstants.get('Assignment_Key')) {
						element.SelectedArrayIndex = getArrayIndexForKey(arr, 'KeyHandleId', element.KeyHandleId);
					} else if (element.Type == AppConstants.get('Assignment_Package')) {
						element.SelectedArrayIndex = getArrayIndexForKey(arr, 'PackageName', element.PackageName);
					}
				});

				//To Enable/Disble the Up/Down Arrows----
				var lastIndex = self.movedArray().length - 1;
				enableDisableUpDownArrowsInPopUp(selectedRowArrayForSwap, lastIndex, "#btnMoveItemsUPID", "#btnMoveItemsDown");


			} else {
				openAlertpopup(1, 'please_selct_row');
			}
			self.saveBtnEnableDisable();
		}

		self.moveItemsDown = function () {
			if (selectedRowArrayForSwap.length > 0) {
				isSelectedUpdated = true;
				var arr = self.movedArray();
				//#Sorting the selected array for swap, based on moved array index
				var sortedselectedRowArrayForSwap = _.sortBy(selectedRowArrayForSwap, 'SelectedArrayIndex');

				for (var i = sortedselectedRowArrayForSwap.length - 1; i >= 0; i--) {
					var index = 0;
					if (sortedselectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Key')) {
						index = getArrayIndexForKey(arr, 'KeyHandleId', sortedselectedRowArrayForSwap[i].KeyHandleId);
					} else if (sortedselectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Package')) {
						index = getArrayIndexForKey(arr, 'PackageName', sortedselectedRowArrayForSwap[i].PackageName);
					}
					arr.moveDown(arr[index]);
					self.movedArray(arr);
				}

				//#Updating changed index into array "selectedRowArrayForSwap"
				selectedRowArrayForSwap.forEach(function (element) {
					if (element.Type == AppConstants.get('Assignment_Key')) {
						element.SelectedArrayIndex = getArrayIndexForKey(arr, 'KeyHandleId', element.KeyHandleId);
					} else if (element.Type == AppConstants.get('Assignment_Package')) {
						element.SelectedArrayIndex = getArrayIndexForKey(arr, 'PackageName', element.PackageName);
					}
				});

				//#Function call:----To Enable/Disble the Up/Down Arrows----
				var lastIndex = self.movedArray().length - 1;
				enableDisableUpDownArrowsInPopUp(selectedRowArrayForSwap, lastIndex, "#btnMoveItemsUPID", "#btnMoveItemsDown");

			} else {
				openAlertpopup(1, 'please_selct_row');
			}
			self.saveBtnEnableDisable();
		}

		///////////////////////////////////////////////////////////// End Left/Right/Up/Down Packages///////////////////////////////////////

		self.cancelReset = function () {
			$('#assignReferenceSet').modal('hide');
			$('#overrideReferenceSet').modal('hide');
			$('#noneAssignment').modal('hide');
			$('#assignSoftware').modal('hide');
		}

		self.DirectAssignment = function () {
			if (isFromAddDevice) {
				if (isDirectSoftAssignMent == 0) {
					$("#btnAdd").prop("disabled", true);
				} else if (isDirectSoftAssignMent == 1) {
					$("#btnAdd").prop("disabled", false);
				}
			} else {
				$("#btnAdd").prop("disabled", true);
			}
			var selectedDeviceSearchItems = getSelectedUniqueId('Devicejqxgrid');
			if ((koUtil.AssignmentType && koUtil.AssignmentType.toUpperCase() == AppConstants.get('ReferenceSet')) && koUtil.IsDirectAssignment == false) {
				isReferenceSetChanged = true;
			}
			isDirectAssignment = true;
			isInherit = false;
			if (isFromAddDevice == true || ADSearchUtil.AdScreenName == 'deviceProfile') {
				if ($("#rdoEnabledValue").is(':checked')) {
					enableDisableDownloadOptions(1);
				} else {
					enableDisableDownloadOptions(0);
				}
			} else {
				if (selectedDeviceSearchItems && selectedDeviceSearchItems.length > 1 && !$("#downloadAutomationCheckbox").is(':checked') && $("#rdoEnabled").is(':checked')) {
					enableDisableDownloadOptions(0);
				} else if ($("#rdoEnabled").is(':checked')) {
					enableDisableDownloadOptions(1);
				} else {
					enableDisableDownloadOptions(0);
				}
			}
			enableDisableReferenceSetGrid(1);
			enableDisableResetFilter(1);
			enableDisablePagination(1);
			enableDisableTemplatesGrid(0);
			koUtil.isFromAddDeviceforDirect(true);
			if ($("#rdoEnabled").is(':checked')) {
				$("#inheriDirectAssgnmnt").find("input").prop("disabled", false);
			} else {
				$("#inheriDirectAssgnmnt").find("input").prop("disabled", false);
			}
			if (isDownloadAutomationChanged || isDownloadOptionsChanged) {
				//$("#btn_SaveAssignmentId").prop("disabled", false);
				enableDisableSaveButton(1);
			} else if (checkRadioState == '' || checkRadioState == 0) {
				//$("#btn_SaveAssignmentId").prop("disabled", true);
				enableDisableSaveButton(0);
			}
			$("#inheritDiv").addClass('hide');
			$("#resetFilterDiv").removeClass('hide');
			$("#referenceSetGridDiv").removeClass('hide');
			showHideTemplates(1);
			return true;
		}

		self.InheritFromHierarchy = function () {
			isInherit = true;
			isDirectAssignment = false;
			isDownloadOptionsChanged = false;
			if (isFromAddDevice == true) {
				$("#btnAdd").prop("disabled", false);
			} else {
				//previously Inherit from hierarchy
				if (koUtil.IsDirectAssignment == false && koUtil.AssignmentType && koUtil.AssignmentType.toUpperCase() == AppConstants.get('ReferenceSet')) {
					if (selectedReferenceSetId > 0) {
						showInheritDetails('Detailed');
						enableDisableLoadTemplates(1);
					} else {
						showInheritDetails('InProgress');
						enableDisableLoadTemplates(0);
					}
					//if Download Automation changed
					if (isDownloadAutomationChanged) {
						enableDisableSaveButton(1);
					} else {
						enableDisableSaveButton(0);
					}
				} else {
					showInheritDetails('InProgress');
					enableDisableLoadTemplates(0);
					enableDisableSaveButton(1);
				}
			}
			enableDisableDownloadOptions(0);
			enableDisableReferenceSetGrid(0);
			enableDisableResetFilter(0);
			enableDisablePagination(0);
			enableDisableTemplatesGrid(0);

			$("#resetFilterDiv").addClass('hide');
			$("#referenceSetGridDiv").addClass('hide');
			$("#inheritDiv").removeClass('hide');
			showHideTemplates(1);

			return true;
		}

		self.blankShow = function () {
			isDownloadOptionsChanged = false;
			isParentReferenceSetSelected = false;
			enableDisableSaveButton(1);
			$("#showOverrite").hide();
			$("#none").show();
			$("#none").css({ "display": "block" });
			$("#packagesGrid").hide();
			$("#refernceSetGrid").hide();
			$("#noKeySupportMessageDiv").hide();
			showHideTemplates(0);
			enableDisableDownloadOptions(0);
			return true;
		}
		////////////////////////////////////////////Add button code for ADD DEVICE///////////////////////////////
		self.addBtnClicked = function (unloadTempPopup) {
			hasData = true;
			var automaticDownloadEnabled = "";
			var autoDownloadOn = '';
			var isAutoSchedulingEnabled = false;
			var isAutoSchedulingDuringMHB = false;

			if ($("#rdoBtnDirect").is(':checked')) {
				isDirectAssignment = true;
			} else if ($("#rdoBtnHierarchy").is(':checked')) {
				isInherit = true;
			}
			$("#txtSoftwareAssignment").val('');
			if ($("#rdoEnabledValue").is(':checked')) {
				automaticDownloadEnabled = "Enabled";
			} else if ($("#rdoDisabledValue").is(':checked')) {
				automaticDownloadEnabled = "Disabled";
			}

			if (downloadOptionValue == AppConstants.get('NEXT_AVAILABLE_FREE_TIME_SLOT')) {
				if ($("#chkautoSchedulingDuringMHB").is(':checked')) {
					autoDownloadOn = 'Next available free time slot with Maintenance Window'
					isAutoSchedulingEnabled = true;
					isAutoSchedulingDuringMHB = true;
				} else {
					autoDownloadOn = 'Next available free time slot'
					isAutoSchedulingEnabled = true;
					isAutoSchedulingDuringMHB = false;
				}
			} else if (downloadOptionValue == AppConstants.get('NEXT_MAINTENANCE_WINDOW')) {
				autoDownloadOn = 'Maintenance Window';
				isAutoSchedulingEnabled = false;
				isAutoSchedulingDuringMHB = false;
			} else if (downloadOptionValue == AppConstants.get('NEXT_CONTACT')) {
				autoDownloadOn = 'Next Contact';
				isAutoSchedulingEnabled = false;
				isAutoSchedulingDuringMHB = false;
			} else {
				autoDownloadOn = '';
				isAutoSchedulingEnabled = false;
				isAutoSchedulingDuringMHB = false;
			}

			addSoftwareAssignment.AutomationEnabled = (automaticDownloadEnabled == 'Enabled' ? ENUM.get("DAMODEIFIED_TRUE") : (automaticDownloadEnabled == 'Disabled' ? ENUM.get("DAMODEIFIED_FALSE") : ENUM.get("DAMODIFIED_NONE")));
			addSoftwareAssignment.AutoDownloadOn = autoDownloadOn;
			addSoftwareAssignment.IsAutoSchedulingEnabled = isAutoSchedulingEnabled;
			addSoftwareAssignment.IsAutoSchedulingDuringMHB = isAutoSchedulingDuringMHB;

			if ($("#rbtnReferenceSet").is(':checked')) {
				isPackageChecked = false;
				if ($("#rdoBtnHierarchy").is(':checked')) {
					addSoftwareAssignment.ReferencesetDirect = 2;
					$("#txtSoftwareAssignment").val('Reference Set: Inherit from Hierarchy');
					$("#txtSoftwareAssignment").prop({ 'title': 'Reference Set: Inherit from Hierarchy' });
				} else if ($("#rdoBtnDirect").is(':checked')) {
					var referenceSetDirect = 'Reference Set: ' + referenceSetName;
					addSoftwareAssignment.ReferencesetDirect = 1;
					$("#txtSoftwareAssignment").val(referenceSetDirect);
					$("#txtSoftwareAssignment").prop({ 'title': referenceSetDirect });
				} else {
					addSoftwareAssignment.ReferencesetDirect = 0;
				}
			} else if ($("#rbtnPackages").is(':checked')) {
				isPackageChecked = true;
				var packages = self.selectedPackages(self.movedArray())
				$("#txtSoftwareAssignment").val(packages);
			} else if ($("#rbtnApplications").is(':checked')) {
				var applications = self.selectedApplications(self.movedApplicationsArray())
				$("#txtSoftwareAssignment").val(applications);
				$("#txtSoftwareAssignment").prop({ 'title': packages });
			}

			unloadTempPopup('unloadTemplate');
			$('#deviceModelFormanually').modal('hide');
		}

		self.selectedPackages = function (movedArray) {
			//   koUtil.movedPackageArray = movedArray;
			var softwareAssignment = '';
			for (i = 0; i < movedArray.length; i++) {
				var assignmentname = '';
				if (movedArray[i].Type == AppConstants.get('Assignment_Package')) {
					assignmentname = movedArray[i].PackageName;
				} else if (movedArray[i].Type == AppConstants.get('Assignment_Key')) {
					assignmentname = movedArray[i].Name
				}
				if (softwareAssignment == '') {
					softwareAssignment = 'Assignments: ' + assignmentname;
				} else {
					softwareAssignment = softwareAssignment + ',' + assignmentname;
				}
			}
			koUtil.movedPackageArray = movedArray;
			return softwareAssignment;
		}


		//////////////////////////////////////////// End Add button code for ADD DEVICE///////////////////////////////

		//Cancel Popup
		self.cancelPopup = function (unloadTempPopup) {
			unloadTempPopup();
		}

		//Save btn code
		self.saveBtnClicked = function (parentGridID, unloadTempPopup) {
			if (self.protocolVEMVisibility()) {
				//if ($("#cbAssignmentType").is(':checked')) {
				isOnlyDownloadChange = false;
				isTemplateChangesOnly = false;

				//RFS selection
				if (($("#rbtnReferenceSet").is(':checked') && $("#rdoBtnHierarchy").is(':checked')) ||
					($("#rbtnReferenceSet").is(':checked') && $("#rdoBtnDirect").is(':checked'))) {
					if (isTemplateChanged && !isReferenceSetChanged) {
						isTemplateChangesOnly = true;
					}
					//Direct RFS
					if ($("#rbtnReferenceSet").is(':checked') && $("#rdoBtnDirect").is(':checked')) {
						//No RFS selected
						if (checkRadioState == '' || checkRadioState == 0) {
							//either Download Automation and/or Download Options are selected
							if ((isDownloadAutomationChanged || isDownloadOptionsChanged) && !isTemplateChanged) {
								isOnlyDownloadChange = true;
								SetDownloadOptions(parentGridID, unloadTempPopup);
							} else if (isTemplateChanged) {
								showAssignmentConfirmation(AppConstants.get('ReferenceSet'), isTemplateChanged, isTemplateChangesOnly);
							} else {
								openAlertpopup(1, 'select_item_referce_set');
							}
						} else {        //if a RFS is selected
							showAssignmentConfirmation(AppConstants.get('ReferenceSet'), isTemplateChanged, isTemplateChangesOnly);
						}
					}
					//Inherit from Hierarchy
					else if ($("#rbtnReferenceSet").is(':checked') && $("#rdoBtnHierarchy").is(':checked')) {
						//In Device Search AssignmentType will be null
						if (_.isEmpty(koUtil.AssignmentType)) {
							showAssignmentConfirmation(AppConstants.get('ReferenceSet'), isTemplateChanged, isTemplateChangesOnly);
						} else {
							if (koUtil.IsDirectAssignment == true && koUtil.AssignmentType && koUtil.AssignmentType.toUpperCase() == AppConstants.get('ReferenceSet')) {
								showAssignmentConfirmation(AppConstants.get('ReferenceSet'), isTemplateChanged, isTemplateChangesOnly);
							} else if (koUtil.IsDirectAssignment == false && koUtil.AssignmentType && (koUtil.AssignmentType.toUpperCase() == AppConstants.get('Package') || koUtil.AssignmentType.toUpperCase() == AppConstants.get('None'))) {
								showAssignmentConfirmation(AppConstants.get('ReferenceSet'), isTemplateChanged, isTemplateChangesOnly);
							} else {
								showAssignmentConfirmation(AppConstants.get('ReferenceSet'), isTemplateChanged, isTemplateChangesOnly);
							}
						}
					} else if ($("#downloadAutomationCheckbox").is(':checked')) {
						isOnlyDownloadChange = true;
						SetDownloadOptions(parentGridID, unloadTempPopup);
					}
				}
				//Parent Reference Sets
				else if ($("#rbtnParentReferenceSet").is(':checked')) {
					//No Parent RFS selected
					if (parentReferenceSetId === '' || parentReferenceSetId === 0) {
						//either Download Automation and/or Download Options are selected
						if ((isDownloadAutomationChanged || isDownloadOptionsChanged) && !isTemplateChanged) {
							isOnlyDownloadChange = true;
							SetDownloadOptions(parentGridID, unloadTempPopup);
						} else if (isTemplateChanged) {
							showAssignmentConfirmation(AppConstants.get('ReferenceSet'), isTemplateChanged, isTemplateChangesOnly);
						} else {
							openAlertpopup(1, 'select_item_referce_set');
						}
					} else {        //if a RFS is selected
						showAssignmentConfirmation(AppConstants.get('ReferenceSet'), isTemplateChanged, isTemplateChangesOnly);
					}
				}
				//Packages
				else if ($("#rbtnPackages").is(':checked') && self.movedArray() != null && self.movedArray().length > 0) {
					if (isTemplateChanged && !isPackageChanged) {
						isTemplateChangesOnly = true;
					}
					showAssignmentConfirmation(AppConstants.get('Package'), isTemplateChanged, isTemplateChangesOnly);
				}
				//None
				else if ($("#rbtnNone").is(':checked')) {
					showAssignmentConfirmation(AppConstants.get('None'), isTemplateChanged, isTemplateChangesOnly);
				}
				else {
					isOnlyDownloadChange = true;
					SetDownloadOptions(parentGridID, unloadTempPopup);
				}
			}
		}

		function showAssignmentConfirmation(assignmentType, isTemplateChanged, isOnlyTemplateChanged) {
			if (assignmentType === AppConstants.get('None')) {
				$('#noneAssignment').modal('show');
			} else {
				if (isTemplateChanged) {
					var isTemplateOverride = false;
					self.applicatonTemplate([]);
					var source = _.where(self.selectedApplicationTemplates(), { IsOverride: true });
					if (!_.isEmpty(source) && source.length > 0) {
						setAlertStyle(1);
						self.applicatonTemplate(source);
						isTemplateOverride = true;
					} else {
						setAlertStyle(0);
					}
				} else {
					setAlertStyle(0);
				}
				$('#assignSoftware').modal('show');
			}

			var deviceText = '';
			if (ADSearchUtil.AdScreenName == 'deviceProfile') {
				deviceText = 'this device';
			} else {
				deviceText = 'the selected devices';
			}
			if (assignmentType === AppConstants.get('ReferenceSet') || assignmentType === AppConstants.get('Package')) {
				if (isTemplateChanged && isOnlyTemplateChanged) {
					if (isTemplateOverride)
						$("#assignSoftwareText").text(i18n.t('software_assignment_only_template_override', { device: deviceText }, { lng: lang }));
					else
						$("#assignSoftwareText").text(i18n.t('software_assignment_only_template', { device: deviceText }, { lng: lang }));
				} else if (isTemplateChanged) {
					if (isTemplateOverride)
						$("#assignSoftwareText").text(i18n.t('software_assignmment_with_template_override', { device: deviceText }, { lng: lang }));
					else
						$("#assignSoftwareText").text(i18n.t('software_assignmment_with_template', { device: deviceText }, { lng: lang }));
				} else {
					$("#assignSoftwareText").text(i18n.t('software_assignment_without_template', { device: deviceText }, { lng: lang }));
				}
			} else if (assignmentType === AppConstants.get('None')) {
				$("#noneAssignmentText").text(i18n.t('software_assignment_none', { device: deviceText }, { lng: lang }));
			}
		}

		function setAlertStyle(type) {
			if (type === 0) {           //confirmation
				$("#alertIcon").removeClass('icon-warning c-red');
				$("#alertIcon").addClass('icon-confirmation c-green');
				$("#titleText").removeClass('c-red');
				$("#titleText").addClass('c-green');
				$("#btnYesAssignSoftware").removeClass('btn-danger');
				$("#btnYesAssignSoftware").addClass('btn-success');
				$("#titleText").text(i18n.t('confirmation_title', { lng: lang }));
				$("#overrideTemplateTableDiv").addClass('hide');
			} else {                    //warning
				$("#alertIcon").removeClass('icon-confirmation c-green');
				$("#alertIcon").addClass('icon-warning c-red');
				$("#titleText").removeClass('c-green');
				$("#titleText").addClass('c-red');
				$("#btnYesAssignSoftware").removeClass('btn-success');
				$("#btnYesAssignSoftware").addClass('btn-danger');
				$("#titleText").text(i18n.t('warning_title', { lng: lang }));
				$("#overrideTemplateTableDiv").removeClass('hide');
			}
		}

		self.assignReferenceSetToDevices = function (parentGridID, unloadTempPopup, callSetDownload, isContinue) {
			$("#assignSoftware").modal('hide');
			$("#loadingDiv").show();
			var assignReferenceSetToDevicesReq = new Object();
			var setDownloadOptionsReq = new Object();
			var DeviceLite = new Object();
			var ReferenceSetLite = new Object();
			var parentReferenceSetLite = new Object();
			var templates = new Object();
			var assignedTemplates = new Array();
			var unAssignedTemplateIds = new Array();
			var isTemplateChangesOnly = false;
            parentReferenceSetLite.ParentReferenceSetId = parentReferenceSetId;
			parentReferenceSetLite.Name = parentReferenceSetName;

			ReferenceSetLite.Name = referenceSetName;
			ReferenceSetLite.ReferenceSetId = referenceSetId;
			ReferenceSetLite.Sequence = 0;
			ReferenceSetLite.Status = referenceSetStatus;
			ReferenceSetLite.SupportedPackages = supportedPackages;
			ReferenceSetLite.SponsorName = selectedRFSponsorName;
			if ($("#downloadAutomationCheckbox").is(':checked')) {
				callSetDownload = true;
			}
			var isTemplatesEnabled = getTemplateGridsState();
			if (isTemplateChanged) {
				if (self.selectedApplicationTemplates() && self.selectedApplicationTemplates().length > 0) {
					for (j = 0; j < self.selectedApplicationTemplates().length; j++) {
						var templateObject = new Object();
						var isLatest = (!_.isEmpty(assignedApplicationTemplateIds) && assignedApplicationTemplateIds.indexOf(self.selectedApplicationTemplates()[j].TemplateId) > -1) ? false : true;
						templateObject.Isoverride = self.selectedApplicationTemplates()[j].IsOverride ? true : false;
						templateObject.TemplateId = self.selectedApplicationTemplates()[j].TemplateId;
						templateObject.IsLatest = isLatest;
						assignedTemplates.push(templateObject);
					}
				}

				if (!_.isEmpty(assignedApplicationTemplateIds) && assignedApplicationTemplateIds.length > 0) {
					for (k = 0; k < assignedApplicationTemplateIds.length; k++) {
						var source = _.where(self.selectedApplicationTemplates(), { TemplateId: assignedApplicationTemplateIds[k] });
						if (_.isEmpty(source)) {
							unAssignedTemplateIds.push(assignedApplicationTemplateIds[k]);
						}
					}
				}

				if (isTemplateChanged && !isReferenceSetChanged && !isParentReferenceSetSelected) {
					isTemplateChangesOnly = true;
				}

				templates.IsTemplateOnly = isTemplateChangesOnly;
				templates.AssignTemplates = assignedTemplates;
				templates.UnAssignTemplates = unAssignedTemplateIds;
			}

			if (ADSearchUtil.AdScreenName == 'deviceSearch') {
				var selectedIdsDeviceLite = getMultiSelectedData(parentGridID);
				var checkAll = checkAllSelected(parentGridID);

				deviceLiteList = new Array();
				for (i = 0; i < selectedIdsDeviceLite.length; i++) {
					var DeviceLite = new Object();
					DeviceLite.DeviceId = selectedIdsDeviceLite[i].DeviceId;
					DeviceLite.ModelName = selectedIdsDeviceLite[i].ModelName;
					DeviceLite.SerialNumber = selectedIdsDeviceLite[i].SerialNumber;
					DeviceLite.UniqueDeviceId = selectedIdsDeviceLite[i].UniqueDeviceId;
					DeviceLite.SponsorName = selectedIdsDeviceLite[i].VSRSponsor;
					deviceLiteList.push(DeviceLite);
				}

				if (checkAll == 1) {
					var unselectedDeviceSearchItems = getUnSelectedUniqueId(parentGridID);
					assignReferenceSetToDevicesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
					assignReferenceSetToDevicesReq.DeviceLite = null;
					assignReferenceSetToDevicesReq.UnSelectedItemIds = unselectedDeviceSearchItems;
				} else {
					assignReferenceSetToDevicesReq.DeviceSearch = null;
					assignReferenceSetToDevicesReq.DeviceLite = deviceLiteList;
					assignReferenceSetToDevicesReq.UnSelectedItemIds = null;
				}
			} else if (ADSearchUtil.AdScreenName == 'deviceProfile') {
				if (koUtil.deviceSponsorName() == '' || selectedRFSponsorName == '' || selectedRFSponsorName == koUtil.deviceSponsorName()) {
					var DeviceLite = new Object();
					DeviceLite.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
					DeviceLite.ModelName = koUtil.ModelName;
					DeviceLite.SerialNumber = koUtil.serialNumber;
					DeviceLite.DeviceId = koUtil.deviceId;
					DeviceLite.IsAutoDownloadEnabled = koUtil.IsAutoDownloadEnabled;
					DeviceLite.SponsorName = koUtil.deviceSponsorName();
					deviceLiteList = new Array();
					deviceLiteList.push(DeviceLite);
				} else {
					$("#loadingDiv").hide();
					openAlertpopup(1, 'mismatch_sponsor_name_referenceset_assignment');
					return;
				}
				assignReferenceSetToDevicesReq.DeviceSearch = null;
				assignReferenceSetToDevicesReq.DeviceLite = deviceLiteList;
				assignReferenceSetToDevicesReq.UnSelectedItemIds = null;
			}

			var assignmentMode = '';
			if ($("#rbtnParentReferenceSet").is(':checked')) {
				assignmentMode = ENUM.get('Direct');
			} else {
				if ($("#rdoBtnDirect").is(':checked')) {
					assignmentMode = ENUM.get('Direct');
				} else if ($("#rdoBtnHierarchy").is(':checked')) {
					assignmentMode = ENUM.get('Hierarchy');
				} else {
					assignmentMode = ENUM.get('None');
				}
			}
			var AutoDownloadConfiguration = new Object();
			AutoDownloadConfiguration.IsParentReferenceSet = $("#rbtnParentReferenceSet").is(':checked') ? true : false;
			AutoDownloadConfiguration.ParentReferenceSet = $("#rbtnParentReferenceSet").is(':checked') ? parentReferenceSetLite : new Object();
			AutoDownloadConfiguration.ReferenceSetAssignmentMode = assignmentMode;
			if ($("#rbtnReferenceSet").is(':checked') && assignmentMode == ENUM.get('Direct')) {
				AutoDownloadConfiguration.ReferenceSetLite = ReferenceSetLite;
			} else {
				AutoDownloadConfiguration.ReferenceSetLite = null;
			}

			assignReferenceSetToDevicesReq.AutoDownloadConfiguration = AutoDownloadConfiguration;
			assignReferenceSetToDevicesReq.IsAuditLogRequired = false;
			assignReferenceSetToDevicesReq.IsContinue = isTemplateChangesOnly ? true : isContinue;
			assignReferenceSetToDevicesReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
			assignReferenceSetToDevicesReq.Templates = templates;

			if (callSetDownload)
				setDownloadOptionsReq = getDownloadOptionsParameters(parentGridID);

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						$('#assignReferenceSet').modal('hide');
						if (isContinue) {
							$('#overrideReferenceSet').modal('hide');
						}
						if (ADSearchUtil.AdScreenName == 'deviceSearch') {
							if (!isParentReferenceSetSelected && !_.isEmpty(assignReferenceSetToDevicesReq.DeviceLite) && assignReferenceSetToDevicesReq.DeviceLite.length === 1) {
								openAlertpopup(0, 'reference_set_assigned_device_profile');
							} else {
								openAlertpopup(1, 'reference_set_assigned_device_search');
							}
							gridRefresh(parentGridID);
						} else {
							openAlertpopup(0, 'reference_set_assigned_device_profile');
							refreshDeviceProfileLitePage(AppConstants.get('SOFTWARE_REFRESH_DATA'));
							refreshDeviceProfileLitePage(AppConstants.get('JOBS_DETAILS_REFRESH_DATA'));
							refreshDeviceProfileLitePage(AppConstants.get('DEVICEPROFILE_REFRESH_DATA'));
							refreshDeviceProfileLitePage(AppConstants.get('PARAMETERS_REFRESH_DATA'));
						}
						unloadTempPopup('unloadTemplate');
						$('#deviceProfileModel').modal('hide');
						$('#deviceModel').modal('hide');
					} else if (data.responseStatus.StatusCode == AppConstants.get('FEW_OR_ALL_DEVICES_ASSIGNED_TO_REFERENCESET')) {
						$('#assignReferenceSet').modal('hide');
						if (deviceLiteList.length == 1) {
							$('#overrideReferenceSet').modal('show');
							isContinue = true;
							$("#overrideRefTextSingle").text(i18n.t('singledevie_assignconfirm', { lng: lang }));
						} else {
							$('#overrideReferenceSet').modal('show');
							isContinue = true;
							$("#overrideRefTextMultiple").text(i18n.t('multidevie_assignconfirm', { lng: lang }));
						}

					} else if (data.responseStatus.StatusCode == AppConstants.get('SOFTWARE_ASSIGNMENT_FAILED_FOR_FEW_DEVICES')) {
						$('#assignReferenceSet').modal('hide');
						if (isContinue) {
							$('#overrideReferenceSet').modal('hide');
						}
						unloadTempPopup('unloadTemplate');
						if (ADSearchUtil.AdScreenName == "deviceSearch") {
							var failedDevicecount = 0;
							var successDeviceCount = 0;
							var globalSelectedDeviceIds = getAllSelectedDataCount(parentGridID)
							failedDevicecount = data.failedDeviceCount;
							successDeviceCount = (globalSelectedDeviceIds - failedDevicecount);
							openAlertpopup(1, i18n.t('referenceset_successfully_assigned_for', { successDeviceCount: successDeviceCount, globalSelectedDeviceIds: globalSelectedDeviceIds }, { lng: lang }));
							gridRefresh(parentGridID);
						}
						else if (ADSearchUtil.AdScreenName == "deviceProfile") {
							openAlertpopup(1, "referenceset_assignment_failed");
							refreshDeviceProfileLitePage(AppConstants.get('SOFTWARE_REFRESH_DATA'));
							refreshDeviceProfileLitePage(AppConstants.get('JOBS_DETAILS_REFRESH_DATA'));
							refreshDeviceProfileLitePage(AppConstants.get('DEVICEPROFILE_REFRESH_DATA'));
							refreshDeviceProfileLitePage(AppConstants.get('PARAMETERS_REFRESH_DATA'));
						}
						$('#deviceModel').modal('hide');
						$('#deviceProfileModel').modal('hide');
					}
					$("#loadingDiv").hide();
				}
			}

			var method = 'AssignReferenceSetToDevices';
			var params = '{"token":"' + TOKEN() + '","assignReferenceSetToDevicesReq":' + JSON.stringify(assignReferenceSetToDevicesReq) + ',"setDownloadOptionsReq":'+JSON.stringify(setDownloadOptionsReq)+'}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
		}

		self.unAssignDeviceSoftwares = function (parentGridID, unloadTempPopup) {
			$('#noneAssignment').modal('hide');
			$("#loadingDiv").show();
			var unAssignDeviceSoftwaresReq = new Object();
			var DeviceLite = new Object();

			var selectedIdsDeviceLite = getMultiSelectedData(parentGridID);
			if (ADSearchUtil.AdScreenName == 'deviceSearch') {

				var checkAll = checkAllSelected(parentGridID);
				if (checkAll == 1) {
					var unselectedDeviceSearchItems = getUnSelectedUniqueId(parentGridID);
					unAssignDeviceSoftwaresReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
					unAssignDeviceSoftwaresReq.DeviceLite = null;
					unAssignDeviceSoftwaresReq.UnSelectedItemIds = unselectedDeviceSearchItems;
				} else {
					deviceLiteList = new Array();
					for (i = 0; i < selectedIdsDeviceLite.length; i++) {
						var DeviceLite = new Object();
						DeviceLite.DeviceId = selectedIdsDeviceLite[i].DeviceId;
						DeviceLite.ModelName = selectedIdsDeviceLite[i].ModelName;
						DeviceLite.SerialNumber = selectedIdsDeviceLite[i].SerialNumber;
						DeviceLite.UniqueDeviceId = selectedIdsDeviceLite[i].UniqueDeviceId;
						deviceLiteList.push(DeviceLite);
					}

					unAssignDeviceSoftwaresReq.DeviceSearch = null;
					unAssignDeviceSoftwaresReq.DeviceLite = deviceLiteList;
					unAssignDeviceSoftwaresReq.UnSelectedItemIds = null;
				}
			} else if (ADSearchUtil.AdScreenName == 'deviceProfile') {
				var DeviceLite = new Object();
				DeviceLite.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
				DeviceLite.ModelName = koUtil.ModelName;
				DeviceLite.SerialNumber = koUtil.serialNumber;
				DeviceLite.DeviceId = koUtil.deviceId;
				deviceLiteList = new Array();
				deviceLiteList.push(DeviceLite);

				unAssignDeviceSoftwaresReq.DeviceSearch = null;
				unAssignDeviceSoftwaresReq.DeviceLite = deviceLiteList;
				unAssignDeviceSoftwaresReq.UnSelectedItemIds = null;
			}
			unAssignDeviceSoftwaresReq.Protocol = koUtil.Protocol;
			unAssignDeviceSoftwaresReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

			if (isDownloadAutomationChanged)
				SetDownloadOptions(parentGridID, unloadTempPopup);

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						isUnassignSoftwareResult = true;
						if (ADSearchUtil.AdScreenName == 'deviceSearch') {
							gridRefresh(parentGridID);
						} else {
							refreshDeviceProfileLitePage(AppConstants.get('SOFTWARE_REFRESH_DATA'));
							refreshDeviceProfileLitePage(AppConstants.get('JOBS_DETAILS_REFRESH_DATA'));
							refreshDeviceProfileLitePage(AppConstants.get('DEVICEPROFILE_REFRESH_DATA'));
							refreshDeviceProfileLitePage(AppConstants.get('PARAMETERS_REFRESH_DATA'));
						}
						closePopup(unloadTempPopup);
					}
				}
			}

			var method = 'UnAssignDeviceSoftwares';
			var params = '{"token":"' + TOKEN() + '","unAssignDeviceSoftwaresReq":' + JSON.stringify(unAssignDeviceSoftwaresReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
		}

		//Assign packages to devices
		self.assignSoftwareToDevicesCall = function (parentGridID, unloadTempPopup) {
			var callSetDownload = false;
			//either Download Automation and/or Download Options are selected
			if (isDownloadAutomationChanged || isDownloadOptionsChanged)
				callSetDownload = true;

			if ($("#rbtnPackages").is(':checked')) {
				//-------------unselected packages IDs---------------------
				var arr = self.packageData();
				var unselectedPackagesIds = new Array();
				for (var i = 0; i < arr.length; i++) {
					unselectedPackagesIds[i] = arr[i].PackageId;
				}
				assignSoftwareToDevices(self.movedArray(), parentGridID, unloadTempPopup, unselectedPackagesIds, callSetDownload, false);
			} else {
				self.assignReferenceSetToDevices(parentGridID, unloadTempPopup, callSetDownload, false);
			}
		}

		self.hideinfoyesno = function () {
			$("#informationAssignmentYesNoPopup").modal('hide');
			var selectedsource = _.where(self.movedArray(), { PackageName: gridSelectedArryForSwap[0].PackageName });
			self.movedArray.remove(selectedsource[0]);
			self.packageData.push(selectedsource[0]);
			$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
			$("#jqxgridAvailablePackage").jqxGrid('clearselection');
		}

		$("#infoBtnOk").unbind().click(function () {
			$("#informationPopup").modal('hide');
			$("#loadingDiv").show();
			var existpackages = self.existPackages();
			for (var j = 0; j < existpackages.length; j++) {
				var selectedpackage = _.where(gridSelectedArryForSwap, { PackageId: existpackages[j].PackageId + "" });
				if (selectedpackage[0] != undefined) {
					self.movedArray.remove(selectedpackage[0]);
					self.packageData.push(selectedpackage[0]);
				}
			}
			//To Enable/Disble the Up/Down Arrows----
			if (selectedRowArrayForSwap.length > 0) {
				var lastIndex = self.movedArray().length - 1;
				$("#btnMoveItemsDown").addClass('disabled');
				$("#btnMoveItemsDown").prop('disabled', true);
				enableDisableUpDownArrowsInPopUp(selectedRowArrayForSwap, lastIndex, "#btnMoveItemsUPID", "#btnMoveItemsDown");
			}
			//self.saveBtnEnableDisable();
			try {
				$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
				$("#jqxgridAvailablePackage").jqxGrid('clearselection');
			}
			catch (err) { }
			$("#loadingDiv").hide();
		});

		self.completePackageMoveRight = function (isFromYesClick) {
			$("#informationAssignmentYesNoPopup").modal('hide');
			$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
			$("#jqxgridAvailablePackage").jqxGrid('clearselection');
			//gridSelectedArryForSwap = [];
			$("#btnForMoveRight").addClass('disabled');
			$("#btnForMoveRight").prop('disabled', true);

			if (self.packageData().length <= 0) {
				var selectedid = self.movedArray().length - 1;
				$("#tbodySelectedpack").children('tr').removeClass('refselection');
				var id = '#SelectPackrow' + selectedid + '';
				$(id).addClass('refselection');
			} else {
				if (isRightPackagesClick == "No") {    //Selection row and State maintain In grid
					rowIndexForHighlighted = undefined;
				} else {
					rowIndexForHighlighted = rowIndexForHighlighted;
				}

				var selectedid = self.movedArray().length - 1;
				$("#tbodySelectedpack").children('tr').removeClass('refselection');
				var id = '#SelectPackrow' + selectedid + '';
				$(id).addClass('refselection');
			}

			var tootipArr = self.movedArray();
			showToolTip(tootipArr);

			if (self.movedArray().length == 0) {
				enableDisableSaveButton(0);
			} else {
				enableDisableSaveButton(1);
			}

			if (isFromYesClick) {
				if (ADSearchUtil.AdScreenName == 'deviceSearch') {
					var selectedDeviceSearchItems = getSelectedUniqueId('Devicejqxgrid');
					if (selectedDeviceSearchItems && selectedDeviceSearchItems.length > 1) {
						$("#showOverrite").show();
						$("#overrideCheckbox").prop('checked', true);
						$("#overrideCheckbox").prop('disabled', true);
					} else {
						$("#showOverrite").hide();
					}
				}
			}
			selectedHighlightedRowForGrid('jqxgridAvailablePackage');  //Selection row and State maintain In grid
		}

		self.overwriteAssignment = function () {
			if (self.movedArray() && self.movedArray().length == 0)
				return;

			$("#btnMoveItemsUPID").addClass('disabled');
			$("#btnMoveItemsUPID").prop("disabled", true);
			$("#btnMoveItemsDown").addClass('disabled');
			$("#btnMoveItemsDown").prop("disabled", true);

			if ($("#overrideCheckbox").is(':checked')) {

				if (packageIndex >= 0) {
					if (rowIdForHighlightedForTable == 0) {
						if (packageIndex == 0) {
							$("#btnMoveItemsUPID").addClass('disabled');
							$("#btnMoveItemsUPID").prop("disabled", true);
							$("#btnMoveItemsDown").addClass('disabled');
							$("#btnMoveItemsDown").prop("disabled", true);
						} else {
							$("#btnMoveItemsUPID").addClass('disabled');
							$("#btnMoveItemsUPID").prop("disabled", true);
							$("#btnMoveItemsDown").removeClass('disabled');
							$("#btnMoveItemsDown").prop("disabled", false);

						}
					} else if (rowIdForHighlightedForTable == packageIndex) {
						$("#btnMoveItemsUPID").removeClass('disabled');
						$("#btnMoveItemsUPID").prop("disabled", false);
						$("#btnMoveItemsDown").addClass('disabled');
						$("#btnMoveItemsDown").prop("disabled", true);
					} else {
						$("#btnMoveItemsUPID").removeClass('disabled');
						$("#btnMoveItemsUPID").prop("disabled", false);
						$("#btnMoveItemsDown").removeClass('disabled');
						$("#btnMoveItemsDown").prop("disabled", false);
					}
				}
			}
		}

		//Assign packages to devices
		function assignSoftwareToDevices(movedArray, parentGridID, unloadTempPopup, unselectedPackagesIds, callSetDownload, IsCommonAppCheck) {
			$('#assignSoftware').modal('hide');
			$("#loadingDiv").show();
			var assignSoftwareToDevicesReq = new Object();
			var setDownloadOptionsReq = new Object();
			var DeviceLite = new Object();
			var templates = new Object();
			var packageIds = new Array();
			var assignedTemplates = new Array();
			var unAssignedTemplateIds = new Array();
			var isTemplateChangesOnly = false;
			var overrideText = "";
			var movedPackages = _.where(self.movedArray(), { Type: AppConstants.get('Assignment_Package') });
			packageIds = movedData(movedPackages);

			var isTemplatesEnabled = getTemplateGridsState();
			if (isTemplateChanged) {
				if (self.selectedApplicationTemplates() && self.selectedApplicationTemplates().length > 0) {
					for (j = 0; j < self.selectedApplicationTemplates().length; j++) {
						var templateObject = new Object();
						var isLatest = (!_.isEmpty(assignedApplicationTemplateIds) && assignedApplicationTemplateIds.indexOf(self.selectedApplicationTemplates()[j].TemplateId) > -1) ? false : true;
						templateObject.Isoverride = self.selectedApplicationTemplates()[j].IsOverride ? true : false;
						templateObject.TemplateId = self.selectedApplicationTemplates()[j].TemplateId;
						templateObject.IsLatest = isLatest;
						assignedTemplates.push(templateObject);
					}
				}
				if (!_.isEmpty(assignedApplicationTemplateIds) && assignedApplicationTemplateIds.length > 0) {
					for (k = 0; k < assignedApplicationTemplateIds.length; k++) {
						var source = _.where(self.selectedApplicationTemplates(), { TemplateId: assignedApplicationTemplateIds[k] });
						if (_.isEmpty(source)) {
							unAssignedTemplateIds.push(assignedApplicationTemplateIds[k]);
						}
					}
				}
				if (isTemplateChanged && !isPackageChanged && !isParentReferenceSetSelected) {
					isTemplateChangesOnly = true;
				}
				templates.IsTemplateOnly = isTemplateChangesOnly;
				templates.AssignTemplates = assignedTemplates;
				templates.UnAssignTemplates = unAssignedTemplateIds;
			}

			if (ADSearchUtil.AdScreenName == 'deviceSearch') {
				var selectedIdsDeviceLite = getMultiSelectedData(parentGridID);
				var selectedItemIds = getSelectedUniqueId(parentGridID);
				var unSelectedItemIds = getUnSelectedUniqueId(parentGridID);

				var checkAll = checkAllSelected(parentGridID);

				if (checkAll == 1) {
					assignSoftwareToDevicesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
					assignSoftwareToDevicesReq.SelectedItemIds = null;
					assignSoftwareToDevicesReq.UnSelectedItemIds = unSelectedItemIds;
				} else {
					deviceLiteList = new Array();
					for (i = 0; i < selectedIdsDeviceLite.length; i++) {
						var DeviceLite = new Object();
						DeviceLite.DeviceId = selectedIdsDeviceLite[i].DeviceId;
						DeviceLite.ModelName = selectedIdsDeviceLite[i].ModelName;
						DeviceLite.SerialNumber = selectedIdsDeviceLite[i].SerialNumber;
						DeviceLite.UniqueDeviceId = selectedIdsDeviceLite[i].UniqueDeviceId;
						DeviceLite.IsEnabledForAutoDownload = selectedIdsDeviceLite[i].IsEnabledForAutoDownload;
						DeviceLite.ComputedDeviceStatus = selectedIdsDeviceLite[i].ComputedDeviceStatus;
						DeviceLite.SponsorName = selectedIdsDeviceLite[i].VSRSponsor;
						deviceLiteList.push(DeviceLite);
					}

					assignSoftwareToDevicesReq.DeviceSearch = null;
					assignSoftwareToDevicesReq.SelectedItemIds = deviceLiteList;
					assignSoftwareToDevicesReq.UnSelectedItemIds = null;
				}
				assignSoftwareToDevicesReq.IsFromDeviceProfile = false;
				if (selectedItemIds.length > 1) {
					if ($("#overrideCheckbox").is(':checked')) {
						overrideText = ENUM.get('PACKAGEASSIGNMENT_OVERWRITE');
					} else if (!$("#overrideCheckbox").is(':checked')) {
						overrideText = ENUM.get('PACKAGEASSIGNMENT_APPEND');
					}
				} else {
					overrideText = ENUM.get('PACKAGEASSIGNMENT_DEFAULT');
				}
			} else {
				deviceLiteList = new Array();
				var DeviceLite = new Object();
				if (ADSearchUtil.AdScreenName == 'addDeviceManually') {
					DeviceLite.UniqueDeviceId = 0;
					DeviceLite.ModelName = "";
					DeviceLite.SerialNumber = "";
					DeviceLite.DeviceId = 0;
					DeviceLite.SponsorName = "";
				} else {
					DeviceLite.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
					DeviceLite.ModelName = koUtil.ModelName;
					DeviceLite.SerialNumber = koUtil.serialNumber;
					DeviceLite.DeviceId = koUtil.deviceId;
					DeviceLite.SponsorName = koUtil.deviceSponsorName();
				}
				deviceLiteList.push(DeviceLite);

				assignSoftwareToDevicesReq.DeviceSearch = null;
				assignSoftwareToDevicesReq.SelectedItemIds = deviceLiteList;
				assignSoftwareToDevicesReq.UnSelectedItemIds = null;
				assignSoftwareToDevicesReq.IsFromDeviceProfile = true;

				overrideText = ENUM.get('PACKAGEASSIGNMENT_DEFAULT');
			}
			assignSoftwareToDevicesReq.AssignmentOperation = overrideText;
			assignSoftwareToDevicesReq.IsCommonAppCheck = IsCommonAppCheck;
			assignSoftwareToDevicesReq.PackageIds = packageIds;
			assignSoftwareToDevicesReq.Templates = templates;

			packageLiteList = new Array();
			keyList = new Array();
			var sponsorname = '';
			for (i = 0; i < movedArray.length; i++) {
				if (movedArray[i].Type == AppConstants.get('Assignment_Package')) {
					var packageLite = new Object();
					packageLite.PackageId = movedArray[i].PackageId;
					packageLite.Sequence = i + 1;
					packageLite.PackageName = movedArray[i].PackageName;
					packageLite.SponsorName = movedArray[i].SponsorName;
					if (packageLite.SponsorName && packageLite.SponsorName != '') {
						sponsorname = packageLite.SponsorName;
					}
					packageLiteList.push(packageLite);
				} else if (movedArray[i].Type == AppConstants.get('Assignment_Key')) {
					var KeyObj = new Object();
					KeyObj.VrkCustomerid = movedArray[i].VrkCustomerid;
					KeyObj.Destination = movedArray[i].Destination;
					KeyObj.KeyType = movedArray[i].KeyType;
					KeyObj.Name = movedArray[i].Name;
					KeyObj.Sequence = i + 1;
					keyList.push(KeyObj);
				}
			}

			assignSoftwareToDevicesReq.Packages = packageLiteList;
			assignSoftwareToDevicesReq.Keys = keyList;
			if (ADSearchUtil.AdScreenName == 'deviceProfile') {
				if (koUtil.deviceSponsorName() == '' || sponsorname == '' || sponsorname == koUtil.deviceSponsorName()) {
					assignSoftwareToDevicesReq.CommonSponsorNameForPackages = sponsorname;
				} else {
					openAlertpopup(1, 'mismatch_sponsor_name_package_assignment');
					return;
				}
			}
			assignSoftwareToDevicesReq.UnSelectedPackageIds = unselectedPackagesIds;
			assignSoftwareToDevicesReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
			assignSoftwareToDevicesReq.IsSequnceUpdate = IsSequnceUpdatePackages;
			assignSoftwareToDevicesReq.Templates = templates;

			if (callSetDownload)
				setDownloadOptionsReq = getDownloadOptionsParameters(parentGridID);

			var callBackfunction = function (data, error) {
				if (data) {
					isSelectedUpdated = true;
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (!IsCommonAppCheck) {
                            if (ADSearchUtil.AdScreenName == 'deviceSearch') {                             
                                if (!_.isEmpty(assignSoftwareToDevicesReq.SelectedItemIds) && assignSoftwareToDevicesReq.SelectedItemIds.length === 1) {
									openAlertpopup(0, 'assigned_packages_to_devices');
									gridRefresh(parentGridID);
								} else {
									openAlertpopup(1, 'assigned_packages_to_devices_deviceSearch');
									gridRefresh(parentGridID);
								}
                            } else {                             
								if (packageLiteList.length > 0 && keyList.length > 0) {
									openAlertpopup(0, 'assigned_packages_and_keys_to_devices');
								} else if (packageLiteList.length > 0 && keyList.length <= 0) {
									openAlertpopup(0, 'assigned_packages_to_devices');
								} else if (packageLiteList.length <= 0 && keyList.length > 0) {
									openAlertpopup(0, 'assigned_keys_to_devices');
								}
								refreshDeviceProfileLitePage(AppConstants.get('SOFTWARE_REFRESH_DATA'));
								refreshDeviceProfileLitePage(AppConstants.get('JOBS_DETAILS_REFRESH_DATA'));
								refreshDeviceProfileLitePage(AppConstants.get('DEVICEPROFILE_REFRESH_DATA'));
								refreshDeviceProfileLitePage(AppConstants.get('PARAMETERS_REFRESH_DATA'));
							}
							unloadTempPopup('unloadTemplate');
							$('#deviceProfileModel').modal('hide');
							$('#deviceModel').modal('hide');
						} else {
							self.completePackageMoveRight(false);
						}
					} else if (data.responseStatus.StatusCode == AppConstants.get('APP_EXISTS_IN_SELECTED_DEVICES')) {
						var packages = new Array();
						var packageStr = '';
						var applications = new Array();
						if (data.assignSoftwareToDevicesResp && data.assignSoftwareToDevicesResp.PackageNames && data.assignSoftwareToDevicesResp.PackageNames.length > 0) {
							for (var i = 0; i < data.assignSoftwareToDevicesResp.PackageNames.length; i++) {
								packages.push(data.assignSoftwareToDevicesResp.PackageNames[i]);
								packageStr += data.assignSoftwareToDevicesResp.PackageNames[i] + ", ";
							}
							packageStr = packageStr.trim();
							packageStr = packageStr.slice(0, -1);
						}
						var applicationStr = '';
						if (data.assignSoftwareToDevicesResp && data.assignSoftwareToDevicesResp.ApplicationNames && data.assignSoftwareToDevicesResp.ApplicationNames.length > 0) {
							for (var j = 0; j < data.assignSoftwareToDevicesResp.ApplicationNames.length; j++) {
								applications.push(data.assignSoftwareToDevicesResp.ApplicationNames[j]);
								applicationStr += data.assignSoftwareToDevicesResp.ApplicationNames[j] + ", ";
							}
							applicationStr = applicationStr.trim();
							applicationStr = applicationStr.slice(0, -1);
						}

						openAlertYesNopopup(i18n.t('packages_share_common_applications', { packages: packageStr, applications: applicationStr }, { lng: lang }));

					} else if (data.responseStatus.StatusCode == AppConstants.get('APP_EXISTS_IN_SELECTED_PACKAGE')) {
						//var selectedsource = _.where(self.movedArray(), { PackageName: gridSelectedArryForSwap[0].PackageName });
						//self.movedArray.remove(selectedsource[0]);
						//self.packageData.push(selectedsource[0]);
						$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
						$("#jqxgridAvailablePackage").jqxGrid('clearselection');

						var arrayPackages = new Array();
						var arrayApplications = new Array();
						var packageStr = '';
						if (data.assignSoftwareToDevicesResp && data.assignSoftwareToDevicesResp.DuplicatePackages && data.assignSoftwareToDevicesResp.DuplicatePackages.length > 0) {
							self.existPackages(data.assignSoftwareToDevicesResp.DuplicatePackages);
							for (var i = 0; i < data.assignSoftwareToDevicesResp.DuplicatePackages.length; i++) {
								// existPackages.push(data.assignSoftwareToDevicesResp.DuplicatePackages[i]);
								arrayPackages.push(data.assignSoftwareToDevicesResp.DuplicatePackages[i].PackageName);
								packageStr += data.assignSoftwareToDevicesResp.DuplicatePackages[i].PackageName + ", ";
							}
							packageStr = packageStr.trim();
							packageStr = packageStr.slice(0, -1);
						}
						var applicationStr = '';
						if (data.assignSoftwareToDevicesResp && data.assignSoftwareToDevicesResp.ApplicationNames && data.assignSoftwareToDevicesResp.ApplicationNames.length > 0) {
							for (var j = 0; j < data.assignSoftwareToDevicesResp.ApplicationNames.length; j++) {
								arrayApplications.push(data.assignSoftwareToDevicesResp.ApplicationNames[j]);
								applicationStr += data.assignSoftwareToDevicesResp.ApplicationNames[j] + ", ";
							}
							applicationStr = applicationStr.trim();
							applicationStr = applicationStr.slice(0, -1);
						}

						message = "Package (s) " + packageStr + " " + "share common application (s)" + " " + applicationStr + ".";
						openAlertpopup(2, message);
						$("#btnForMoveRight").addClass('disabled');
						$("#btnForMoveRight").prop('disabled', true);

					} else if (data.responseStatus.StatusCode == AppConstants.get('SOFTWARE_ASSIGNMENT_FAILED_FOR_FEW_DEVICES')) {
						if (ADSearchUtil.AdScreenName == "deviceSearch") {
							var failedDevicecount = 0;
							var successDeviceCount = 0;
							var globalSelectedDeviceIds = getAllSelectedDataCount(parentGridID)
							failedDevicecount = data.assignSoftwareToDevicesResp.AssignmentFailedDeviceCount;
							successDeviceCount = (globalSelectedDeviceIds - failedDevicecount);
							openAlertpopup(1, i18n.t('packages_successfully_assigned_for', { successDeviceCount: successDeviceCount, globalSelectedDeviceIds: globalSelectedDeviceIds }, { lng: lang }));
						}
						else if (ADSearchUtil.AdScreenName == "deviceProfile") {
							openAlertpopup(1, "package_assignment_failed");
						}
					}
				}
				$("#loadingDiv").hide();
				IsSequnceUpdatePackages = false;
			}

			var method = 'AssignSoftwareToDevices';
			var params = '{"token":"' + TOKEN() + '","assignSoftwareToDevicesReq":' + JSON.stringify(assignSoftwareToDevicesReq) + ',"setDownloadOptionsReq": ' + JSON.stringify(setDownloadOptionsReq)+'}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
		}

		function openAlertYesNopopup(msg) {
			$("#informationAssignmentYesNoPopup").modal("show");
			if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('VEM_PROTOCOL')) {
				$("#infoAssignmentYesNoMessage").text(i18n.t(msg));
			} else if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
				$("#infoAssignmentYesNoMessage").text(i18n.t(msg, { AppName: self.selectedApplicationName() }, { lng: lang }));
			}
		}

		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopupParentView(elementname);
		}

		function CheckAutoDownloadStatus(parentGridID, rbgDownloadAutomation, isSoftwareAssigned, protocolVEMVisibility, protocolZTVisibility) {
			$("#loadingDiv").show();
			var CheckAutoDownloadStatusReq = new Object();
			var Selector = new Object();
			if (ADSearchUtil.AdScreenName == 'deviceSearch') {
				koUtil.ReferenceSetName = '';
				CheckAutoDownloadStatusReq.ParentColumnSortFilter = koUtil.GlobalColumnFilter;
				var selectedIds = getSelectedUniqueId(parentGridID);
				var unselectedDeviceSearchItems = getUnSelectedUniqueId(parentGridID);
				var checkAll = checkAllSelected(parentGridID);
				if (checkAll == 1) {
					CheckAutoDownloadStatusReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
					Selector.SelectedItemIds = null;
					if (unselectedDeviceSearchItems.length > 0) {
						Selector.UnSelectedItemIds = unselectedDeviceSearchItems;
					} else {
						Selector.UnSelectedItemIds = null;
					}
				} else {
					Selector.SelectedItemIds = selectedIds;
					CheckAutoDownloadStatusReq.DeviceSearch = null;
					Selector.UnSelectedItemIds = null;
				}
			} else {
				Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
				Selector.UnSelectedItemIds = null;
				CheckAutoDownloadStatusReq.ParentColumnSortFilter = null;
			}
			CheckAutoDownloadStatusReq.Selector = Selector;

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.checkAutoDownloadStatusResp)
						data.checkAutoDownloadStatusResp = $.parseJSON(data.checkAutoDownloadStatusResp);

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						isCheckAutoDownloadStatus = true;

						koUtil.AssignmentType = data.checkAutoDownloadStatusResp.AssignmentType;
						if (!licenseSource.isSoftwareAssignmenttoDeviceLicensed) {
							if (koUtil.AssignmentType && koUtil.AssignmentType.toUpperCase() == AppConstants.get('Package')) {
								keysGridModel(self.keysData, self.openPopup, self.movedArray);
								$('#rbtnPackages').prop('checked', true);
								self.rbgAssignmentType('optiond3');
							} else {
								$('#rbtnNone').prop('checked', true);
								self.rbgAssignmentType('optiond5');
								showNone();
								$('.all-disabled').hide();
								$("#loadingDiv").hide();
							}
							return;
						}

						if (data.checkAutoDownloadStatusResp.DeviceScheduleOptions) {
							if (data.checkAutoDownloadStatusResp.DeviceScheduleOptions.AutoDownload == ENUM.get('DAMODEIFIED_NONE')) {
								rbgDownloadAutomation('');
								enableDisableDownloadOptions(0);
							} else if (data.checkAutoDownloadStatusResp.DeviceScheduleOptions.AutoDownload == ENUM.get('DAMODEIFIED_TRUE')) {
								rbgDownloadAutomation('DownloadAutomation');
								if (ADSearchUtil.AdScreenName == 'deviceSearch') {
									$('#rdoEnabled').prop('checked', true);
								} else {
									$('#rdoEnabledValue').prop('checked', true);
								}
							} else if (data.checkAutoDownloadStatusResp.DeviceScheduleOptions.AutoDownload == ENUM.get('DAMODEIFIED_FALSE')) {
								rbgDownloadAutomation('NotDownloadAutomation');
								if (ADSearchUtil.AdScreenName == 'deviceSearch') {
									$('#rdoDisabled').prop('checked', true);
								} else {
									$('#rdoDisabledValue').prop('checked', true);
								}
							}
							autoDownloadOnValue = data.checkAutoDownloadStatusResp.DeviceScheduleOptions.AutoDownloadOn;
							isAutoSchedulingEnabledValue = data.checkAutoDownloadStatusResp.DeviceScheduleOptions.IsAutoSchedulingEnabled;
							isAutoSchedulingDuringMHBValue = data.checkAutoDownloadStatusResp.DeviceScheduleOptions.IsAutoSchedulingDuringMHB;
						}
						isSoftwareAssigned(data.checkAutoDownloadStatusResp.IsSoftwareAssigned);

						//------set value to radio buttons depends on DownloadedOn value.------
						downloadOptionValue = autoDownloadOnValue ? autoDownloadOnValue.toUpperCase() : '';
						if (downloadOptionValue == AppConstants.get('NEXT_CONTACT') && isAutoSchedulingEnabledValue == false) {
							self.downloadedOn('Next Contact');
							$("#chkMaintaince").prop('disabled', true);
							$("#chkMaintaince").addClass("maintainceCheckbox disabled");
						} else if (downloadOptionValue == AppConstants.get('MAINTENANCE_WINDOW')) {
							self.downloadedOn('Next Maintenance Window');
							$("#chkMaintaince").prop('disabled', true);
							$("#chkMaintaince").addClass("maintainceCheckbox disabled");
						} else if ((downloadOptionValue == AppConstants.get('NEXT_AVAILABLE_FREE_TIME_SLOT_WITH_MAINTENANCE_WINDOW') || downloadOptionValue == AppConstants.get('NEXT_AVAILABLE_FREE_TIME_SLOT')) && (isAutoSchedulingEnabledValue == true)) {
							self.downloadedOn('Next Available Free Time Slot');
							$("#chkMaintaince").prop('disabled', false);
							$("#chkMaintaince").removeClass("maintainceCheckbox disabled");
							if (isAutoSchedulingDuringMHBValue == true) {
								self.autoSchedulingDuringMHB(true);
							} else if (isAutoSchedulingDuringMHBValue == false) {
								self.autoSchedulingDuringMHB(false);
							}
						}

						if (protocolVEMVisibility()) {
							if (koUtil.AssignmentType && koUtil.AssignmentType.toUpperCase() == AppConstants.get('Package')) {
								packagesGridModel(parentGridID, self.packageData, self.movedArray, self.rbgAssignmentType, self.rbgReferenceSetType, self.openPopup, self.isSoftwareAssigned, self.availableApplicationTemplates, self.selectedApplicationTemplates);
							} else if (koUtil.AssignmentType && koUtil.AssignmentType.toUpperCase() == AppConstants.get('ReferenceSet')) {
								var param = getReferenceSetModel(parentGridID, false, columnSortFilterForReferenceSet, null, null, 0);
								referenceSetGrid('jqxgridSAReferenceSet', param, self.inheritedReferenceSet, self.availableApplicationTemplates, self.selectedApplicationTemplates, self.assignedHierarchyTemplate);
							} else {
								setUpView([], 3);
								$('.all-disabled').hide();
								$("#loadingDiv").hide();
							}
						}
					}

					if (koUtil.isDeviceProfileScreen == "DeviceProfile") {
						if ((isGetReferenceSetsForDevices || isGetParentReferenceSetsForDevices || isGetPackagesForDevices) && isCheckAutoDownloadStatus && isGetSystemConfiguration) {
							$('.all-disabled').hide();
							$("#loadingDiv").hide();
						}
					} else {
						$('.all-disabled').hide();
						$("#loadingDiv").hide();
					}
				} else if (error) {
					$("#loadingDiv").hide();
				}
			}

			var method = 'CheckAutoDownloadStatus';
			var params = '{"token":"' + TOKEN() + '","checkAutoDownloadStatusReq":' + JSON.stringify(CheckAutoDownloadStatusReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
		}

		self.loadTemplates = function () {
			getTemplatesForDevice('Devicejqxgrid', self.movedArray, self.availableApplicationTemplates, self.selectedApplicationTemplates);
		}

		/********** Parameter Templates navigation starts **********/

		//move parameter template from available to selected one at a time
		self.rightTemplateMove = function (gID) {
			templatesGridState = $("#" + gID).jqxGrid('savestate');
			if (!_.isEmpty(selectedRowAvailableTemplates) && selectedRowAvailableTemplates.length > 0 && (!_.isEmpty(templatesGridState) && templatesGridState.selectedrowindex != -1)) {
				var selectedSource = _.where(self.availableApplicationTemplates(), { TemplateId: selectedRowAvailableTemplates[0].TemplateId });
				var selectedtemplateSource = _.where(self.selectedApplicationTemplates(), { ApplicationId: selectedRowAvailableTemplates[0].ApplicationId });

				if (!_.isEmpty(selectedtemplateSource) && selectedtemplateSource.length > 0) {
					openAlertpopup(1, 'template_already_assigned');
					return;
				}

				isTemplateChanged = false;
				selectedRowAvailableTemplates[0].IsOverride = false;
				self.availableApplicationTemplates.remove(selectedSource[0]);
				self.selectedApplicationTemplates.push(selectedRowAvailableTemplates[0]);
				if (isRightTemplatesClick == "No") {    //row selection and grid state maintainence 
					rowIndexForHighlighted = undefined;
				} else {
					rowIndexForHighlighted = templatesGridState.selectedrowindex;
				}

				fetchTemplates(self.availableApplicationTemplates, self.selectedApplicationTemplates);
				if (!_.isEmpty(templatesGridState)) {
					$("#" + gID).jqxGrid('loadstate', templatesGridState);
				}
				selectedRowAvailableTemplates = [];
				selectedHighlightedRowForGrid(gID);

				var selectedApplicationTemplateIds = new Array();
				if (self.selectedApplicationTemplates().length > 0) {
					for (i = 0; i < self.selectedApplicationTemplates().length; i++) {
						selectedApplicationTemplateIds.push(self.selectedApplicationTemplates()[i].TemplateId);
					}
				}

				if (self.availableApplicationTemplates().length <= 0) {
					$("#btnMoveRightSoftwareTemplate").addClass('disabled');
				}

				var diffArray = self.compareArrays(assignedApplicationTemplateIds, selectedApplicationTemplateIds);
				if (diffArray && diffArray.length > 0) {
					isTemplateChanged = true;
					enableDisableSaveButton(1);
				}
			} else {
				openAlertpopup(1, 'please_selct_row');
			}
		}

		//move parameter templates from selected to available one at a time
		self.leftTemplateMove = function (gID) {
			if (!_.isEmpty(selectedRowAssignedTemplates) && selectedRowAssignedTemplates.length > 0) {
				isTemplateChanged = false;
				var selectedIndex = self.selectedApplicationTemplates().map(function (item) { return item.TemplateId; }).indexOf(selectedRowAssignedTemplates[0].TemplateId);
				self.selectedApplicationTemplates.splice(selectedIndex, 1);
				self.availableApplicationTemplates.push(selectedRowAssignedTemplates[0]);

				fetchTemplates(self.availableApplicationTemplates, self.selectedApplicationTemplates);
				selectedRowAssignedTemplates = [];

				$("#btnMoveLeftSoftwareTemplate").addClass('disabled');
				$("#btnMoveLeftSoftwareTemplate").prop('disabled', true);
				if (!_.isEmpty(templatesGridState)) {
					$("#" + gID).jqxGrid('loadstate', templatesGridState);
				}
				selectedHighlightedRowForGrid(gID);

				var selectedApplicationTemplateIds = new Array();
				if (self.selectedApplicationTemplates().length > 0) {
					for (i = 0; i < self.selectedApplicationTemplates().length; i++) {
						selectedApplicationTemplateIds.push(self.selectedApplicationTemplates()[i].TemplateId);
					}
				}

				var diffArray = self.compareArrays(assignedApplicationTemplateIds, selectedApplicationTemplateIds);
				if (diffArray && diffArray.length > 0) {
					isTemplateChanged = true;
					enableDisableSaveButton(1);
				}
			} else {
				openAlertpopup(1, 'please_selct_row');
			}
		}

		//------selected row highlighted and get row data------
		self.selectedTemplateRow = function (data, index, selectedId) {
			$("#" + selectedId).children('tr').removeClass('refselection');
			$("#btnMoveLeftSoftwareTemplate").removeClass('disabled');
			$("#btnMoveLeftSoftwareTemplate").prop('disabled', false);

			var id = '';
			id = '#SelectedTemplateRow' + index + '';
			$(id).addClass('refselection');
			selectedRowAssignedTemplates = [];
			selectedRowAssignedTemplates.push(data);
			rowIdForHighlightedForTable = index;
		}

		self.compareArrays = function (assignedTemplates, selectedTemplates) {
			var newArray = new Array();
			var diffArray = new Array();
			if (assignedTemplates && assignedTemplates.length > 0) {
				for (var index = 0; index < assignedTemplates.length; index++) {
					newArray[assignedTemplates[index]] = true;
				}
			}
			if (selectedTemplates && selectedTemplates.length > 0) {
				for (var index = 0; index < selectedTemplates.length; index++) {
					if (newArray[selectedTemplates[index]]) {
						delete newArray[selectedTemplates[index]];
					} else {
						newArray[selectedTemplates[index]] = true;
					}
				}
			}

			for (var k in newArray) {
				diffArray.push(k);
			}

			return diffArray;
		}

		/********** Parameter Templates navigation starts **********/

		self.viewAssignedHierarchyTemplate = function (gId) {
			if ($("#iconAssignedHierarchyTemplate").hasClass('icon-angle-down')) {
				$("#assignedHierarchyTemplateDiv").removeClass('hide');
				$("#iconAssignedHierarchyTemplate").removeClass('icon-angle-down');
				$("#iconAssignedHierarchyTemplate").addClass('icon-angle-up');
				if (isAssignedHierarchyTemplate == false) {
					gridAssignedHierarchyTemplates(self.assignedHierarchyTemplate(), gId);
					isAssignedHierarchyTemplate = true;
				}
			} else if ($("#iconAssignedHierarchyTemplate").hasClass('icon-angle-up')) {
				$("#assignedHierarchyTemplateDiv").addClass('hide');
				$("#iconAssignedHierarchyTemplate").removeClass('icon-angle-up')
				$("#iconAssignedHierarchyTemplate").addClass('icon-angle-down')
			}


		}

		seti18nResourceData(document, resourceStorage);
	};


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

	//For Add device package grid
	function getPackagesForModel(packageData, movedArray, gId, openPopup) {
		$("#loadingDiv").show();
		var getPackagesForModelReq = new Object();
		getPackagesForModelReq.ModelId = modelId;
		var param = new Object();
		param.token = TOKEN();
		param.getPackagesForModelReq = getPackagesForModelReq;
		getPackagesForModelReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
		var callBackfunction = function (data, error) {
			$("#loadingDiv").hide();
			isSelectedUpdated = true;
			if (data) {
				if (data && data.getPackagesForModelResp) {
					data.getPackagesForModelResp = $.parseJSON(data.getPackagesForModelResp);

					if (data.getPackagesForModelResp.Packages && data.getPackagesForModelResp.Packages.length > 0) {
						for (var k = 0; k < data.getPackagesForModelResp.Packages.length; k++) {
							data.getPackagesForModelResp.Packages[k].FolderName = data.getPackagesForModelResp.Packages[k].Folder.FolderName;
						}
						packageData(data.getPackagesForModelResp.Packages);
						var arr = packageData();
						if (koUtil.movedPackageArray && koUtil.movedPackageArray != '') {
							for (i = 0; i < arr.length; i++) {
								for (j = 0; j < koUtil.movedPackageArray.length; j++) {
									if (arr[i].PackageId == parseInt(koUtil.movedPackageArray[j].PackageId)) {
										packageData.remove(arr[i]);
									}
								}
							}
						}
					} else {
						packageData([]);
					}

					movedArray(koUtil.movedPackageArray);
					PackagesGrid(packageData(), globalFoldersFilterArray, openPopup);
				} else {
					PackagesGrid([], globalFoldersFilterArray, openPopup);
				}
			} else if (error) {
				packageData([]);
			}
		}

		var method = 'GetPackagesForModel';
		var params = '{"token":"' + TOKEN() + '","getPackagesForModelReq":' + JSON.stringify(getPackagesForModelReq) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
	}

	//for Device search filter grid
	function packagesGridModel(parentGridID, packageData, movedArray, rbgAssignmentType, rbgReferenceSetType, openPopup, isSoftwareAssigned, availableApplicationTemplates, selectedApplicationTemplates) {
		$("#loadingDiv").show();
		PackageType = 1;
		IsEnabledForAutomation = true;
		var getPackagesAndKeysForDevicesReq = new Object();


		var Selector = new Object();
		if (ADSearchUtil.AdScreenName == 'deviceProfile') {
			var arr = new Array();
			arr.push(koUtil.deviceProfileUniqueDeviceId);
			Selector.SelectedItemIds = arr;
			Selector.UnSelectedItemIds = null;
			getPackagesAndKeysForDevicesReq.DeviceSearch = null;
		} else if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			var selectedIds = getSelectedUniqueId(parentGridID);
			var unSelectedIds = getUnSelectedUniqueId(parentGridID);
			var checkAll = checkAllSelected(parentGridID);

			if (checkAll == 1) {
				Selector.SelectedItemIds = null;
				Selector.UnSelectedItemIds = unSelectedIds;
				getPackagesAndKeysForDevicesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
			} else {
				Selector.SelectedItemIds = selectedIds;
				Selector.UnSelectedItemIds = null;
				getPackagesAndKeysForDevicesReq.DeviceSearch = null;
			}
		}

		getPackagesAndKeysForDevicesReq.PackageType = ENUM.get('Software');
		getPackagesAndKeysForDevicesReq.DownloadType = "0";
		getPackagesAndKeysForDevicesReq.IsFromSoftwareAssignment = true;
		getPackagesAndKeysForDevicesReq.Selector = Selector;
		getPackagesAndKeysForDevicesReq.SchedulePackages = null;
		getPackagesAndKeysForDevicesReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
		getPackagesAndKeysForDevicesReq.IsFromLibrary = false;
		getPackagesAndKeysForDevicesReq.AssignmentType = koUtil.AssignmentType;

		var callBackfunction = function (data, error) {
			movedPackages = [];
			isSelectedUpdated = true;

			if (data && data.getPackagesAndKeysForDevicesResp) {
				data.getPackagesAndKeysForDevicesResp = $.parseJSON(data.getPackagesAndKeysForDevicesResp);
				if (data.getPackagesAndKeysForDevicesResp.AvailablePackages && data.getPackagesAndKeysForDevicesResp.AvailablePackages.length > 0) {
					packageData(data.getPackagesAndKeysForDevicesResp.AvailablePackages);
					$("#btnForAllMoveright").removeClass('disabled');
					$("#btnForAllMoveright").prop("disabled", false);
				}
				isGetPackagesForDevices = true;
				if (data.getPackagesAndKeysForDevicesResp.SelectedPackages && data.getPackagesAndKeysForDevicesResp.SelectedPackages != '') {
					for (var k = 0; k < data.getPackagesAndKeysForDevicesResp.SelectedPackages.length; k++) {
						data.getPackagesAndKeysForDevicesResp.SelectedPackages[k].packageSelected = false;
						data.getPackagesAndKeysForDevicesResp.SelectedPackages[k].Type = AppConstants.get('Assignment_Package');
						data.getPackagesAndKeysForDevicesResp.SelectedPackages[k].Details = "Name: " + data.getPackagesAndKeysForDevicesResp.SelectedPackages[k].PackageName + ' , Version: ' + data.getPackagesAndKeysForDevicesResp.SelectedPackages[k].FileVersion + ' , Folder: ' + data.getPackagesAndKeysForDevicesResp.SelectedPackages[k].FolderName;
						if (ADSearchUtil.AdScreenName == 'deviceProfile') {
							movedPackages[data.getPackagesAndKeysForDevicesResp.SelectedPackages[k].Sequence - 1] = data.getPackagesAndKeysForDevicesResp.SelectedPackages[k];
						} else {
							movedPackages[k] = data.getPackagesAndKeysForDevicesResp.SelectedPackages[k];
						}
					}
				}

				//template data
				availableApplicationTemplates(data.getPackagesAndKeysForDevicesResp.AvailableApplicationTemplates);
				selectedApplicationTemplates(data.getPackagesAndKeysForDevicesResp.SelectedApplicationTemplates);

				assignedApplicationTemplateIds = [];
				if (data.getPackagesAndKeysForDevicesResp.SelectedApplicationTemplates.length > 0) {
					for (i = 0; i < data.getPackagesAndKeysForDevicesResp.SelectedApplicationTemplates.length; i++) {
						assignedApplicationTemplateIds.push(data.getPackagesAndKeysForDevicesResp.SelectedApplicationTemplates[i].TemplateId);
					}
				}

				fetchTemplates(availableApplicationTemplates, selectedApplicationTemplates);
				if (data.getPackagesAndKeysForDevicesResp.SelectedKeys && data.getPackagesAndKeysForDevicesResp.SelectedKeys != '') {
					for (var l = 0; l < data.getPackagesAndKeysForDevicesResp.SelectedKeys.length; l++) {

						var keyObj = new Object();
						keyObj.packageSelected = false;
						keyObj.Type = AppConstants.get('Assignment_Key');
						var KeyType = data.getPackagesAndKeysForDevicesResp.SelectedKeys[l].Type;
						if (!KeyType || KeyType == null || KeyType == undefined) {
							KeyType = '';
						}
						var Destination = data.getPackagesAndKeysForDevicesResp.SelectedKeys[l].Destination;
						if (!Destination || Destination == null || Destination == undefined) {
							Destination = '';
						}

						keyObj.Details = "Name: " + data.getPackagesAndKeysForDevicesResp.SelectedKeys[l].KeyProfileName + ' , Key Type: ' + KeyType + ' , Destination: ' + Destination;
						keyObj.KeyHandleId = data.getPackagesAndKeysForDevicesResp.SelectedKeys[l].KeyHandleId;
						keyObj.UniqueKeyId = data.getPackagesAndKeysForDevicesResp.SelectedKeys[l].VRKCustomerId + '_' + data.getPackagesAndKeysForDevicesResp.SelectedKeys[l].KeyProfileName;
						keyObj.Name = data.getPackagesAndKeysForDevicesResp.SelectedKeys[l].KeyProfileName;
						keyObj.KeyType = data.getPackagesAndKeysForDevicesResp.SelectedKeys[l].Type;
						keyObj.Sequence = data.getPackagesAndKeysForDevicesResp.SelectedKeys[l].Sequence;
						keyObj.Destination = data.getPackagesAndKeysForDevicesResp.SelectedKeys[l].Destination;
						keyObj.VrkCustomerid = data.getPackagesAndKeysForDevicesResp.SelectedKeys[l].VRKCustomerId;
						if (ADSearchUtil.AdScreenName == 'deviceProfile') {
							movedPackages[data.getPackagesAndKeysForDevicesResp.SelectedKeys[l].Sequence - 1] = keyObj;
						}
					}
				}
				movedArray([]);
				if (movedPackages.length > 0) {
					for (var i = 0; i < movedPackages.length; i++) {
						movedArray.push(movedPackages[i]);
					}
					$("#btnForAllMoveleft").removeClass('disabled');
					$("#btnForAllMoveleft").prop("disabled", false);
				} else {
					movedArray([]);
				}
				PackagesGrid(packageData(), globalFoldersFilterArray, openPopup);
				if (isUnassignSoftwareResult && isAutomationResult)
					$("#loadingDiv").hide();

				if (!isGetReferenceSetsForDevices) {
					if (ADSearchUtil.AdScreenName == 'deviceProfile')
						setUpView(movedArray, 2);
					else if (ADSearchUtil.AdScreenName == 'deviceSearch') {
						var selectedIds = getSelectedUniqueId('Devicejqxgrid');
						if (selectedIds.length == 1) {
							setUpView(movedArray, 2);
						}
					}
				}
				var tootipArr = movedArray();
				showToolTip(tootipArr);

			} else if (error) {
				packageData([]);
				$("#loadingDiv").hide();
			}

			if (koUtil.isDeviceProfileScreen == "DeviceProfile") {
				if ((isGetReferenceSetsForDevices || isGetParentReferenceSetsForDevices || isGetPackagesForDevices) && isCheckAutoDownloadStatus && isGetSystemConfiguration) {
					$('.all-disabled').hide();
					$("#loadingDiv").hide();
				}
			} else {
				$('.all-disabled').hide();
				$("#loadingDiv").hide();
			}
		}

		var method = 'GetPackagesAndKeysForDevices';
		var params = '{"token":"' + TOKEN() + '","getPackagesAndKeysForDevicesReq":' + JSON.stringify(getPackagesAndKeysForDevicesReq) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
	}

	function PackagesGrid(PackageData, globalFoldersFilterArray, openPopup) {
		var gID = "jqxgridAvailablePackage";
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
			dataType: "observablearray",
			localdata: PackageData,
			dataFields: [
				{ name: 'isSelected', type: 'number' },
				{ name: 'PackageId', map: 'PackageId' },
				{ name: 'PackageName', map: 'PackageName' },
				{ name: 'PackageMode', map: 'PackageMode' },
				{ name: 'FileName', map: 'FileName' },
				{ name: 'FileVersion', map: 'FileVersion' },
				{ name: 'SponsorName', type: 'SponsorName' },
				{ name: 'FolderName', map: 'FolderName' },
				{ name: 'IsEnabledForAutomation', map: 'IsEnabledForAutomation' }
			],
		};

		var rendered = function (element) {
			enableUiGridFunctions(gID, 'PackageId', element, gridStorage, true);
			return true;
		}

		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		}

		var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
			multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gID, globalFoldersFilterArray, true);
		}

		//var versionRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
		//    var filename = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'FileName');
		//    var versiontooltip = i18n.t('File_name', { lng: lang }) + ' : ' + filename
		//    defaulthtml = '<div  style="height:100px;cursor:pointer;text-align:center;padding-top:7px;float:left;" ><span  title="' + versiontooltip + '" >' + value + '</a></div>';
		//    return defaulthtml;
		//}

		//var packageRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
		//    var filename = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'FileName');
		//    var packagetooltip = i18n.t('File_name', { lng: lang }) + ' : ' + filename
		//    defaulthtml = '<div  style="height:100px;cursor:pointer;text-align:center;padding-top:7px;float:left;" ><span  title="' + packagetooltip + '" >' + value + '</a></div>';
		//    return defaulthtml;
		//}

		var applicationRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var isAutomation = $("#" + gID).jqxGrid('getcellvalue', row, 'IsEnabledForAutomation');
			if (isAutomation == 'true') {
				var appDetailsTooltip = i18n.t('app_details_tooltip', { lng: lang })
				defaulthtml = '<div id="innerDiv" style="height:100px;cursor:pointer;text-align:center;padding-top:7px;padding-left:5px;float:left;" ><a style="text-decoration: underline" title="' + appDetailsTooltip + '"   role="button" >View</a></div>';
				return defaulthtml;
			} else {
				return " ";
			}
		}

		var dataAdapter = new $.jqx.dataAdapter(source);

		$("#" + gID).jqxGrid(
			{
				width: "100%",
				height: "320px",
				editable: true,
				source: dataAdapter,
				altRows: true,
				filterable: true,
				sortable: true,
				columnsResize: true,
				autoshowcolumnsmenubutton: false,
				pageSize: 1000,
				autoshowfiltericon: true,
				enabletooltips: true,
				autoshowloadelement: false,
				showsortmenuitems: false,
				enabletooltips: true,
				rowsheight: 32,
				selectionmode: 'singlerow',
				theme: AppConstants.get('JQX-GRID-THEME'),
				ready: function () {
					var packageDataList = $("#jqxgridAvailablePackage").jqxGrid('getdatainformation');
					if (packageDataList && packageDataList.rowscount == 0) {
						$("#jqxgridAvailablePackage").find('.jqx-grid-column-header:first').fadeTo('slow', .6);
						$("#jqxgridAvailablePackage").find('.jqx-grid-column-header:first').append('<div style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
					}
				},
				columns: [
					{
						text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
						datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
							return '<div style="margin-left:10px;margin-top:0px"><div style="margin-top: 5px;"></div></div>';
						}, rendered: rendered
					},
					{
						text: 'Packages', dataField: 'PackageName', editable: false, minwidth: 100,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: 'Folder', datafield: 'FolderName', editable: false, minwidth: 80, width: 'auto',
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanelMultiChoice(filterPanel, datafield, globalFoldersFilterArray);
						}
					},
					{
						text: 'Version', dataField: 'FileVersion', editable: false, minwidth: 80,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{ text: i18n.t('applications_download_lib', { lng: lang }), filterable: false, sortable: false, menu: false, columntype: 'number', resizable: false, datafield: 'PackageMode', editable: false, enabletooltips: false, width: 100, cellsrenderer: applicationRenderer },
				],
			})
			.on({
				filter: function (e) {
					gridSelectedDataForSwap = [];
					gridSetRowDetailsforAvailGridSoftAssign(e, 'jqxgridAvailablePackage');
					rowIndexForHighlighted = undefined;
				}
			});
		getUiGridBiginEdit('jqxgridAvailablePackage', 'PackageId', gridStorage);
		//$("#jqxgridAvailablePackage").bind('rowselect', function (event) {
		//    $("#btnForMoveRight").removeClass('disabled');
		//    $("#btnForMoveRight").prop("disabled", false);
		//    var selectedRow = new Object();
		//    var datainformations = $("#jqxgridAvailablePackage").jqxGrid('getdatainformation');
		//    var rowscounts = datainformations.rowscount;

		//    selectedRow.fileName = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'FileName');
		//    selectedRow.PackageId = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'PackageId');
		//    selectedRow.PackageName = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'PackageName');
		//    selectedRow.FileVersion = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'FileVersion');
		//    selectedRow.IsEnabledForAutomation = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'IsEnabledForAutomation');
		//    gridSelectedArryForSwap = new Array();
		//    gridSelectedArryForSwap.push(selectedRow);

		//    rowIndexForHighlighted = event.args.rowindex;

		//    if (rowscounts == 1 && (rowscounts - 1) == rowIndexForHighlighted) {
		//        isRightPackagesClick = "No";
		//    } else {
		//        isRightPackagesClick = "Yes";
		//    }

		//});

		$("#jqxgridAvailablePackage").on("cellclick", function (event) {
			var column = event.args.column;
			var rowindex = event.args.rowindex;
			var columnindex = event.args.columnindex;
			if (event.args.datafield == 'PackageMode') {
				koUtil.isDownloadlibAddpackage = 0;
				openPopup('modelViewParentDownloadLibrary');
				koUtil.rowIdDownload = rowindex;
				koUtil.gridIdDownload = 'jqxgridAvailablePackage';
			}
		});
	}

	//for Device search filter grid
	function keysGridModel(keysData, openPopup, movedArray) {

		customerID = parseInt(customerData[0].CustomerId);
		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.getKeyProfilesResp) {
						data.getKeyProfilesResp = $.parseJSON(data.getKeyProfilesResp);
						var keyslist = data.getKeyProfilesResp.Keys;
						var selectedKeys = _.where(movedArray(), { Type: AppConstants.get('Assignment_Key') });
						if (!_.isEmpty(keyslist)) {
							for (var i = 0; i < keyslist.length; i++) {
								keyslist[i].UniqueKeyId = keyslist[i].VrkCustomerid + '_' + keyslist[i].Name;
								var existKeys = _.where(selectedKeys, { UniqueKeyId: keyslist[i].UniqueKeyId });
								if (existKeys && existKeys.length == 0) {
									keysData.push(keyslist[i]);
								}
							}
							$("#btnForAllMoveright").removeClass('disabled');
							$("#btnForAllMoveright").prop("disabled", false);
						}
						KeysGrid(keysData(), openPopup);
						isKeysDataLoaded = true;
					} else {
						keysData([]);
						KeysGrid(keysData(), openPopup);
						isKeysDataLoaded = true;
					}
				} else {
					keysData([]);
					KeysGrid(keysData(), openPopup);
					isKeysDataLoaded = true;
				}
			} else {
				keysData([]);
				KeysGrid(keysData(), openPopup);
				isKeysDataLoaded = true;
			}
			$("#loadingDiv").hide();
		}
		var method = 'GetKeyProfiles';
		var params = '{"token":"' + TOKEN() + '"}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
	}

	function KeysGrid(KeysData, openPopup) {
		var gID = "jqxgridAvailableKeys";
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
			dataType: "observablearray",
			localdata: KeysData,
			dataFields: [
				{ name: 'VrkCustomerid', map: 'VrkCustomerid' },
				{ name: 'Name', map: 'Name' },
				{ name: 'KeyType', map: 'KeyType' },
				{ name: 'Destination', map: 'Destination' },
				{ name: 'KeyHandleId', map: 'KeyProfileId' }
			],
		};
		//Custom filter
		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		}
		var rendered = function (element) {
			enableUiGridFunctions(gID, 'KeyHandleId', element, gridStorage, true);
			return true;
		}
		var dataAdapter = new $.jqx.dataAdapter(source);

		this.gID = $('#' + gID);
		$("#jqxgridAvailableKeys").jqxGrid(
			{
				width: "100%",
				height: "320px",
				editable: true,
				source: dataAdapter,
				altRows: true,
				filterable: true,
				sortable: true,
				columnsResize: true,
				autoshowcolumnsmenubutton: false,
				pageSize: 1000,
				autoshowfiltericon: true,
				enabletooltips: true,
				autoshowloadelement: false,
				showsortmenuitems: false,
				enabletooltips: true,
				rowsheight: 32,
				selectionmode: 'singlerow',
				theme: AppConstants.get('JQX-GRID-THEME'),
				columns: [
					{
						text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
						datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
							return '<div style="margin-left:10px"><div style="margin-top: 5px;"></div></div>';
						}, rendered: rendered
					},
					{
						text: i18n.t('key_name', { lng: lang }), dataField: 'Name', editable: false, minwidth: 150, filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					//{
					//   text: i18n.t('key_vrk_customer', { lng: lang }), dataField: 'VrkCustomerid', editable: false, minwidth: 100,
					//   filtertype: "custom",
					//   createfilterpanel: function (datafield, filterPanel) {
					//           buildFilterPanel(filterPanel, datafield);
					//   }
					// },
					{
						text: i18n.t('key_type', { lng: lang }), dataField: 'KeyType', editable: false, minwidth: 150,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('key_destination', { lng: lang }), dataField: 'Destination', editable: false, minwidth: 100,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					}
				]
			});
		getUiGridBiginEdit('jqxgridAvailableKeys', 'KeyHandleId', gridStorage);
		setTimeout(function () {
			keysGridWidth = $('#contentjqxgridAvailableKeys').width();
			if (keysGridWidth && keysGridWidth < 480) {
				keysGridWidth = 480;
			}
			var datainformations = $("#jqxgridAvailableKeys").jqxGrid('getdatainformation');
			$("#jqxgridAvailableKeys").find('.jqx-grid-header').css("visibility", "visible");
			if (datainformations && datainformations.rowscount == 0) {
				$("#jqxgridAvailableKeys").find('.jqx-grid-column-header:first').fadeTo('slow', .6);
				$("#jqxgridAvailableKeys").find('.jqx-grid-column-header:first').append('<div style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
			}
		}, 100);
	}

	function getReferenceSetModel(parentGridID, isExport, columnSortFilterForReferenceSet, selectedDownloadLibraryItems, unselectedDownloadLibraryItems, checkAll) {

		var getReferenceSetsForDevicesReq = new Object();
		var Pagination = new Object();
		var Export = new Object();
		var Selector = new Object();
		var ColumnSortFilter = new Object();
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
		Pagination.HighLightedItemId = null

		Export.DynamicColumns = null;
		Export.ExportReportType = 5;
		Export.IsExport = false;
		Export.IsAllSelected = false;

		if (isFromAddDevice == true) {
			Selector.SelectedItemIds = null;
			Selector.UnSelectedItemIds = null;
			getReferenceSetsForDevicesReq.ModelId = modelId;
		} else if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			getReferenceSetsForDevicesReq.ModelId = 0;
			getReferenceSetsForDevicesReq.ParentColumnSortFilter = koUtil.GlobalColumnFilter;
			var selectedIds = getSelectedUniqueId(parentGridID);
			var unSelectedIds = getUnSelectedUniqueId(parentGridID);
			var checkAll = checkAllSelected(parentGridID);

			if (checkAll == 1) {
				Selector.SelectedItemIds = null;
				if (unSelectedIds.length > 0) {
					Selector.UnSelectedItemIds = unSelectedIds;
				} else {
					Selector.UnSelectedItemIds = null;
				}
				getReferenceSetsForDevicesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
			} else {
				Selector.SelectedItemIds = selectedIds;
				Selector.UnSelectedItemIds = null;
				getReferenceSetsForDevicesReq.DeviceSearch = null;
			}
		}

		if (ADSearchUtil.AdScreenName == 'deviceProfile') {
			getReferenceSetsForDevicesReq.DeviceSearch = null;
			getReferenceSetsForDevicesReq.ParentColumnSortFilter = null;
			var arr = new Array();
			arr.push(koUtil.deviceProfileUniqueDeviceId);
			Selector.SelectedItemIds = arr;
			Selector.UnSelectedItemIds = null;
		}

		//ColumnSortFilter.FilterList = null;
		//ColumnSortFilter.SortList = null;

		var ColumnSortFilter = columnSortFilterForReferenceSet;

		getReferenceSetsForDevicesReq.ClientDateTimeFormat = null;
		getReferenceSetsForDevicesReq.ColumnSortFilter = ColumnSortFilter;
		getReferenceSetsForDevicesReq.Export = Export;
		getReferenceSetsForDevicesReq.FetchMode = ENUM.get('Page');
		getReferenceSetsForDevicesReq.IsActive = true;

		getReferenceSetsForDevicesReq.Pagination = Pagination;
		getReferenceSetsForDevicesReq.Selector = Selector;
		getReferenceSetsForDevicesReq.TimeOffsetInMinutes = 0;

		var param = new Object();
		param.token = TOKEN();
		param.getReferenceSetsForDevicesReq = getReferenceSetsForDevicesReq;

		return param;

	}

	//////////////////////////Start reference set grid////////////////////////////////////////////////////
	function referenceSetGrid(gID, param, inheritedReferenceSet, availableApplicationTemplates, selectedApplicationTemplates, assignedHierarchyTemplate) {

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
			dataType: "json",
			dataFields: [
				{ name: 'isSelected', map: 'isSelected', type: 'number' },
				{ name: 'Name', map: 'Name' },
				{ name: 'SupportedPackages', map: 'SupportedPackages' },
				{ name: 'Status', map: 'Status' },
				{ name: 'ReferenceSetId', map: 'ReferenceSetId' },
				{ name: 'SponsorName', map: 'SponsorName' }

			],
			root: 'ReferenceSets',
			type: "POST",
			data: param,

			url: AppConstants.get('API_URL') + "/GetReferenceSetsForDevices",
			contentType: 'application/json',
			beforeprocessing: function (data) {

				if (data && data.getReferenceSetsForDevicesResp)
					data.getReferenceSetsForDevicesResp = $.parseJSON(data.getReferenceSetsForDevicesResp);
				else
					data.getReferenceSetsForDevicesResp = [];

				if (data.getReferenceSetsForDevicesResp && data.getReferenceSetsForDevicesResp.PaginationResponse) {
					source.totalrecords = data.getReferenceSetsForDevicesResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getReferenceSetsForDevicesResp.PaginationResponse.TotalPages;
					totalPagesGlobal = data.getReferenceSetsForDevicesResp.PaginationResponse.TotalPages;
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;

				}
			},
		};

		var request = {
			formatData: function (data) {
				$('.all-disabled').show();
				disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
				columnSortFilter = new Object();
				columnSortFilter = columnSortFilterFormatedData(columnSortFilterForReferenceSet, gID, gridStorage, 'ReferenceSet');
				param.getReferenceSetsForDevicesReq.ColumnSortFilter = columnSortFilter;
				param.getReferenceSetsForDevicesReq.Pagination = getPaginationObject(param.getReferenceSetsForDevicesReq.Pagination, gID);
				data = JSON.stringify(param);
				isGetReferenceSetsForDevices = true;
				return data;
			},
			downloadComplete: function (data, status, xhr) {
				enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
				koUtil.IsDirectAssignment = false;
				referenceSetId = 0;
				selectedReferenceSetId = 0
				referenceSetName = "";
				inheritedReferenceSet('');

				if (data.getReferenceSetsForDevicesResp) {
					koUtil.IsDirectAssignment = data.getReferenceSetsForDevicesResp.DirectAssignment == 1 ? true : false;

					if (data.getReferenceSetsForDevicesResp && data.getReferenceSetsForDevicesResp.ReferenceSets) {
						referenceSetArray = data.getReferenceSetsForDevicesResp.ReferenceSets;
						referenceSetId = data.getReferenceSetsForDevicesResp.SelectedReferenceSetId;
						selectedReferenceSetId = data.getReferenceSetsForDevicesResp.SelectedReferenceSetId;
						inheritedReferenceSet(data.getReferenceSetsForDevicesResp.SelectedReferenceSetName);
						for (var i = 0; i < data.getReferenceSetsForDevicesResp.ReferenceSets.length; i++) {
							if (data.getReferenceSetsForDevicesResp.ReferenceSets[i].ReferenceSetId == referenceSetId) {
								data.getReferenceSetsForDevicesResp.ReferenceSets[i]["isSelected"] = 1;
								referenceSetName = data.getReferenceSetsForDevicesResp.ReferenceSets[i].Name;
								inheritedReferenceSet(data.getReferenceSetsForDevicesResp.ReferenceSets[i].Name);
							} else {
								data.getReferenceSetsForDevicesResp.ReferenceSets[i]["isSelected"] = 0;
							}
						}
					} else {
						source.totalrecords = 0;
						source.totalpages = 0;
						data.getReferenceSetsForDevicesResp = new Object();
						data.getReferenceSetsForDevicesResp.ReferenceSets = [];
					}
					if (totalPagesGlobal > 1) {
						enableDisablePagination(1);
					}

					//template data
					availableApplicationTemplates(data.getReferenceSetsForDevicesResp.AvailableApplicationTemplates);
					selectedApplicationTemplates(data.getReferenceSetsForDevicesResp.SelectedApplicationTemplates);
					if (data.getReferenceSetsForDevicesResp.AssignedHierachryTemplate && data.getReferenceSetsForDevicesResp.AssignedHierachryTemplate.length > 0) {
						assignedHierarchyTemplate(data.getReferenceSetsForDevicesResp.AssignedHierachryTemplate);
					} else {
						assignedHierarchyTemplate([]);
					}

					assignedApplicationTemplateIds = [];

					if (data.getReferenceSetsForDevicesResp.SelectedApplicationTemplates && data.getReferenceSetsForDevicesResp.SelectedApplicationTemplates.length > 0) {
						for (i = 0; i < data.getReferenceSetsForDevicesResp.SelectedApplicationTemplates.length; i++) {
							assignedApplicationTemplateIds.push(data.getReferenceSetsForDevicesResp.SelectedApplicationTemplates[i].TemplateId);
						}
					}
				}

				fetchTemplates(availableApplicationTemplates, selectedApplicationTemplates);

				if (!isGetPackagesForDevices && !isDirectAssignment) {
					if (ADSearchUtil.AdScreenName == 'deviceProfile')
						setUpView([], 1);
					else if (ADSearchUtil.AdScreenName == 'deviceSearch') {
						var selectedIds = getSelectedUniqueId('Devicejqxgrid');
						if (selectedIds.length == 1) {
							setUpView([], 1);
						}
					}
				}

				if (koUtil.isDeviceProfileScreen == "DeviceProfile") {
					if ((isGetReferenceSetsForDevices || isGetParentReferenceSetsForDevices || isGetPackagesForDevices) && isCheckAutoDownloadStatus && isGetSystemConfiguration) {
						$('.all-disabled').hide();
						$("#loadingDiv").hide();
					}
				} else {
					$('.all-disabled').hide();
					$("#loadingDiv").hide();
				}

			},
			loadError: function (jqXHR, status, error) {
				$('.all-disabled').hide();
			}
		};

		var dataAdapter = intializeDataAdapter(source, request);
		var selectRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var selectedId = $("#jqxgridSAReferenceSet").jqxGrid('getcellvalue', row, 'isSelected');
			var refSetName = $("#jqxgridSAReferenceSet").jqxGrid('getcellvalue', row, 'Name');
			var html = '';
			if (selectedId == 1 || (refSetName == referenceSetName)) {
				html = '<div style="margin-left: 10px; margin-top: 5px;"><input name="radioOptions" type="radio" checked="true" onClick="getRSRadioButtonValue(' + row + ')" value="1"></div>';
			} else if (selectedId == 0) {
				html = '<div style="margin-left: 10px; margin-top: 5px;"><input name="radioOptions" type="radio" onClick="getRSRadioButtonValue(' + row + ')" value="0"></div>';
			}

			//if (refSetName == koUtil.ReferenceSetName) {
			//    html = '<div style="margin-left: 10px; margin-top: 5px;"><input name="radioOptions" type="radio" checked="true"  value="1"></div>';
			//}

			return html;
		}

		var rendered = function (element) {
			enablegridfunctions(gID, 'ReferenceSetId', element, gridStorage, true, 'pagerDivReferenceSetForDevices', false, 0, 'ReferenceSetId', null, null, null);
			$('.jqx-grid-pager').css("display", "none", "important");
			return true;
		}

		//Custom filter
		var buildFilterPanel = function (filterPanel, datafield) {
			genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
		}
		var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
			genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
		}

		var toolTipComputedRenderer = function (row, column, value, defaultHtml) {
			if (value == "Active") {
				defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
			} else if (value == "Inactive") {
				defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg inactive_Orange"></div></a>' + value + '</span></div>';
			}

			return defaultHtml;
		}

		$("#" + gID).jqxGrid(
			{
				height: "275px",
				width: "99%",
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
				autoshowloadelement: false,
				enabletooltips: true,
				rendergridrows: function () {
					return dataAdapter.records;
				},
				ready: function () {
					if (koUtil.isFromAddDeviceforDirect() == true) {
						$("#jqxgridSAReferenceSet").jqxGrid('updatebounddata');
					}
				},
				autoshowfiltericon: true,

				columns: [
					{
						text: 'Select', menu: false, sortable: false, columnsResize: false, filterable: false, columntype: 'custom', datafield: 'isSelected', enabletooltips: false,
						minwidth: 60, maxwidth: 61, width: 'auto', cellsrenderer: selectRenderer,
					},
					{ text: '', dataField: 'ReferenceSetId', hidden: true, editable: false, minwidth: 0 },
					{
						text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, width: 40, hidden: true,
						renderer: function () {
							return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
						},
						rendered: rendered,
					},
					{
						text: i18n.t('device_reference_set', { lng: lang }), datafield: 'Name', editable: false, width: 'auto', minwidth: 400,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						},
					},
					{
						text: i18n.t('device_packages', { lng: lang }), datafield: 'SupportedPackages', editable: false, width: 'auto', minwidth: 400, menu: false, filterable: false,
						sortable: false, filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						},
					},
					{
						text: i18n.t('device_status', { lng: lang }), datafield: 'Status', minwidth: 120, editable: false,
						filtertype: "custom", cellsrenderer: toolTipComputedRenderer,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanelMultiChoice(filterPanel, datafield, 'ReferenceSet Status');
						}
					},

				]
			});
		$("#" + gID).bind("bindingcomplete", function (event) {
			//generateGenericPager('pagerDivReferenceSetForDevices', gID, true, false);
			$("#jqxgridSAReferenceSetseleceteRowSpan").text('0');
		});

		enableDisablePagination(0);
		//$('.jqx-grid-pager').css("display", "none");
		getGridBiginEdit(gID, 'ReferenceSetId', gridStorage);
		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'ReferenceSetId');
	}
	//////////////////////////end grid////////////////////////////////////////////////////

	function getParentReferenceSetsParameters(parentGridID, columnSortFilterForParentReferenceSet) {

		var getParentReferenceSetsForDevicesReq = new Object();
		var Pagination = new Object();
		var Export = new Object();
		var Selector = new Object();
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
		Pagination.HighLightedItemId = null

		Export.DynamicColumns = null;
		Export.ExportReportType = 5;
		Export.IsExport = false;
		Export.IsAllSelected = false;

		if (isFromAddDevice == true) {
			Selector.SelectedItemIds = null;
			Selector.UnSelectedItemIds = null;
			getParentReferenceSetsForDevicesReq.ModelId = modelId;
		} else if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			getParentReferenceSetsForDevicesReq.ModelId = 0;
			getParentReferenceSetsForDevicesReq.ParentColumnSortFilter = koUtil.GlobalColumnFilter;
			var selectedIds = getSelectedUniqueId(parentGridID);
			var unSelectedIds = getUnSelectedUniqueId(parentGridID);
			var checkAll = checkAllSelected(parentGridID);

			if (checkAll == 1) {
				Selector.SelectedItemIds = null;
				if (unSelectedIds.length > 0) {
					Selector.UnSelectedItemIds = unSelectedIds;
				} else {
					Selector.UnSelectedItemIds = null;
				}
				getParentReferenceSetsForDevicesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
			} else {
				Selector.SelectedItemIds = selectedIds;
				Selector.UnSelectedItemIds = null;
				getParentReferenceSetsForDevicesReq.DeviceSearch = null;
			}
		}

		if (ADSearchUtil.AdScreenName == 'deviceProfile') {
			getParentReferenceSetsForDevicesReq.ModelId = 0;
			getParentReferenceSetsForDevicesReq.DeviceSearch = null;
			getParentReferenceSetsForDevicesReq.ParentColumnSortFilter = null;
			var arr = new Array();
			arr.push(koUtil.deviceProfileUniqueDeviceId);
			Selector.SelectedItemIds = arr;
			Selector.UnSelectedItemIds = null;
		}

		getParentReferenceSetsForDevicesReq.ClientDateTimeFormat = null;
		getParentReferenceSetsForDevicesReq.ColumnSortFilter = columnSortFilterForParentReferenceSet;
		getParentReferenceSetsForDevicesReq.Export = Export;
		getParentReferenceSetsForDevicesReq.FetchMode = ENUM.get('Page');
		getParentReferenceSetsForDevicesReq.IsActive = true;
		getParentReferenceSetsForDevicesReq.Pagination = Pagination;
		getParentReferenceSetsForDevicesReq.Selector = Selector;
		getParentReferenceSetsForDevicesReq.TimeOffsetInMinutes = 0;

		return getParentReferenceSetsForDevicesReq;
	}

	function getParentReferenceSetsForDevices(gID, param) {
		isGetParentReferenceSetsForDevices = true;
		parentReferenceSetId = 0;
		parentReferenceSetName = "";

		var getParentReferenceSetsForDevicesReq = param;
		var parentReferenceSets = new Array();

		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {					
					if (data.getParentReferenceSetsForDevicesResp) {
						data.getParentReferenceSetsForDevicesResp = $.parseJSON(data.getParentReferenceSetsForDevicesResp);

						if (!_.isEmpty(data.getParentReferenceSetsForDevicesResp)) {
							parentReferenceSets = data.getParentReferenceSetsForDevicesResp;
							if (!_.isEmpty(parentReferenceSets) && parentReferenceSets.length > 0) {
								for (var i = 0; i < parentReferenceSets.length; i++) {
									parentReferenceSets[i]["isSelected"] = 0;
								}
							}
						} else {
							parentReferenceSets = [];
						}

						parentReferenceSetsGrid(parentReferenceSets, gID);
					}
				}
			}
			$("#loadingDiv").hide();
		}

		var method = 'GetParentReferenceSetsForDevices';
		var params = '{"token":"' + TOKEN() + '","getParentReferenceSetsForDevicesReq":' + JSON.stringify(getParentReferenceSetsForDevicesReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	function parentReferenceSetsGrid(data, gID) {

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
			dataType: "json",
			localdata: data,
			datafields: [
				{ name: 'isSelected', map: 'isSelected', type: 'number' },
				{ name: 'ID', map: 'ID' },
				{ name: 'Name', map: 'Name' },
				{ name: 'Description', map: 'Description' }
			]
		};
		var dataAdapter = new $.jqx.dataAdapter(source);

		var rendered = function (element) {
			enableUiGridFunctions(gID, 'ID', element, gridStorage, true);
			return true;
		}

		var selectRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var selectedId = $("#jqxgridSAParentReferenceSet").jqxGrid('getcellvalue', row, 'isSelected');
			var parentRFSName = $("#jqxgridSAParentReferenceSet").jqxGrid('getcellvalue', row, 'Name');
			var html = '';
			if (selectedId == 1 || (parentRFSName === parentReferenceSetName)) {
				html = '<div style="margin-left: 10px; margin-top: 5px;"><input name="radioOptions" type="radio" checked="true" value="1"></div>';
			} else {
				html = '<div style="margin-left: 10px; margin-top: 5px;"><input name="radioOptions" type="radio" value="0"></div>';
			}
			return html;
		}

		//Custom filter
		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, 'jqxgridSAParentReferenceSet', true);
		}

		$("#" + gID).jqxGrid(
			{
				width: "99%",
				height: "275px",
				source: dataAdapter,
				pagesize: data.length,
				sortable: true,
				filterable: true,
				selectionmode: 'singlerow',
				theme: AppConstants.get('JQX-GRID-THEME'),
				altrows: true,
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				editable: true,
				rowsheight: 32,
				enabletooltips: true,
				columnsResize: true,
				columns: [
					{
						text: 'Select', menu: false, sortable: false, columnsResize: false, filterable: false, columntype: 'custom', datafield: 'isSelected', enabletooltips: false,
						minwidth: 60, maxwidth: 61, width: 'auto', cellsrenderer: selectRenderer
					},
					{
						text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, width: 40, hidden: true,
						renderer: function () {
							return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
						},
						rendered: rendered
					},
					{
						text: i18n.t('parent_reference_set_name', { lng: lang }), datafield: 'Name', editable: false, width: 510,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('description', { lng: lang }), datafield: 'Description', editable: false, width: 510,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					}
				]
			}).on({
				filter: function (e) {
					gridSeletedRowData = [];
				}
			});

		$("#" + gID).bind("bindingcomplete", function (event) {
			//generateGenericPager('pagerDivReferenceSetForDevices', gID, true, false);
			$("#jqxgridSAParentReferenceSetseleceteRowSpan").text('0');
		});

		getGridBiginEdit(gID, 'ID', gridStorage);
		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'ID');

		$("#" + gID).on("cellclick", function (event) {
			var column = event.args.column;
			var rowindex = event.args.rowindex;
			var columnindex = event.args.columnindex;
			var rowData = $("#" + gID).jqxGrid('getrowdata', rowindex);
			if (event.args.datafield === 'isSelected') {
				if (!_.isEmpty(rowData)) {
					getParentReferenceSetRadioButtonValue(rowData);
				}
			}
		});
	}

	function movedData(movedArray) {
		packageIdsList = new Array();
		for (i = 0; i < movedArray.length; i++) {
			packageIdsList.push(movedArray[i].PackageId);
		}
		return packageIdsList;
	}

	function showToolTip(tootipArr) {
		for (var j = 0; j < tootipArr.length; j++) {
			var filename = tootipArr[j].FileName;
			var packeagetooltip = i18n.t('File_name', { lng: lang }) + ' : ' + filename;
			$("#typespan" + j).prop('title', packeagetooltip);
			$("#detailspan" + j).prop('title', packeagetooltip);
		}
	}

	function SetDownloadOptions(parentGridID, unloadTempPopup) {
		$("#loadingDiv").show();
		setDownloadOptionsReq = getDownloadOptionsParameters(parentGridID);

		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					isAutomationResult = true;

					if (isOnlyDownloadChange) {
						$('#deviceProfileModel').modal('hide');
						$('#deviceModel').modal('hide');
						$("#loadingDiv").hide();
						unloadTempPopup('unloadTemplate');
						openAlertpopup(0, 'sa_succefullysaved');

						if (ADSearchUtil.AdScreenName == 'deviceSearch') {
							gridRefresh(parentGridID);
						} else {
							refreshDeviceProfileLitePage(AppConstants.get('SOFTWARE_REFRESH_DATA'));
							refreshDeviceProfileLitePage(AppConstants.get('JOBS_DETAILS_REFRESH_DATA'));
							refreshDeviceProfileLitePage(AppConstants.get('DEVICEPROFILE_REFRESH_DATA'));
							refreshDeviceProfileLitePage(AppConstants.get('PARAMETERS_REFRESH_DATA'));
						}
					} else {
						closePopup(unloadTempPopup);
					}
					isDownloadAutomationChanged = false;
				}
			}
		}

		var method = 'SetDownloadOptions';
		var params = '{"token":"' + TOKEN() + '","setDownloadOptionsReq":' + JSON.stringify(setDownloadOptionsReq) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
	}

	function getDownloadOptionsParameters(parentGridID){
		var setDownloadOptionsReq = new Object();
		var DaModified;
		var deviceLiteList = new Array();
		var deviceSheduleOptions = new Object();
		var autoDownloadOn = '';
		var isAutoSchedulingEnabled = false;
		var isAutoSchedulingDuringMHB = false;

		if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			if ($("#rdoEnabled").is(':checked')) {
				DaModified = ENUM.get("DAMODIFIED_TRUE");
			} else if ($("#rdoDisabled").is(':checked')) {
				DaModified = ENUM.get("DAMODIFIED_FALSE");
			} else {
				DaModified = ENUM.get("DAMODIFIED_NONE");
				return;
			}

			var DeviceLite = new Object();
			var checkAll = checkAllSelected(parentGridID);
			var selectedIdsDeviceLite = getMultiSelectedData(parentGridID);
			var unselectedDeviceSearchItems = getUnSelectedUniqueId(parentGridID);

			if (checkAll == 1) {
				deviceLiteList = new Array();
				setDownloadOptionsReq.UnSelectedItemIds = unselectedDeviceSearchItems;
			} else {
				for (i = 0; i < selectedIdsDeviceLite.length; i++) {
					var DeviceLite = new Object();
					DeviceLite.DeviceId = selectedIdsDeviceLite[i].DeviceId;
					DeviceLite.ModelName = selectedIdsDeviceLite[i].ModelName;
					DeviceLite.SerialNumber = selectedIdsDeviceLite[i].SerialNumber;
					DeviceLite.UniqueDeviceId = selectedIdsDeviceLite[i].UniqueDeviceId;
					deviceLiteList.push(DeviceLite);
				}
				setDownloadOptionsReq.UnSelectedItemIds = null;
			}
		} else {
			if ($("#rdoEnabledValue").is(':checked')) {
				DaModified = ENUM.get("DAMODIFIED_TRUE");
			} else if ($("#rdoDisabledValue").is(':checked')) {
				DaModified = ENUM.get("DAMODIFIED_FALSE");
			} else {
				DaModified = ENUM.get("DAMODIFIED_NONE");
				return;
			}
			var DeviceLite = new Object();
			DeviceLite.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
			DeviceLite.ModelName = koUtil.ModelName;
			DeviceLite.SerialNumber = koUtil.serialNumber;
			DeviceLite.DeviceId = koUtil.deviceId;
			setDownloadOptionsReq.UnSelectedItemIds = null;
			deviceLiteList.push(DeviceLite);
		}

		if (downloadOptionValue == AppConstants.get('NEXT_AVAILABLE_FREE_TIME_SLOT')) {
			if ($("#chkautoSchedulingDuringMHB").is(':checked')) {
				autoDownloadOn = 'Next available free time slot with Maintenance Window';
				isAutoSchedulingEnabled = true;
				isAutoSchedulingDuringMHB = true;
			} else {
				autoDownloadOn = 'Next available free time slot';
				isAutoSchedulingEnabled = true;
				isAutoSchedulingDuringMHB = false;
			}
		} else if (downloadOptionValue == AppConstants.get('NEXT_MAINTENANCE_WINDOW')) {
			autoDownloadOn = 'Maintenance Window';
			isAutoSchedulingEnabled = false;
			isAutoSchedulingDuringMHB = false;
		} else if (downloadOptionValue == AppConstants.get('NEXT_CONTACT')) {
			autoDownloadOn = 'Next Contact';
			isAutoSchedulingEnabled = false;
			isAutoSchedulingDuringMHB = false;
		} else {
			autoDownloadOn = '';
			isAutoSchedulingEnabled = false;
			isAutoSchedulingDuringMHB = false;
		}

		deviceSheduleOptions.AutoDownload = DaModified;
		if ($("#downloadOptionsDiv").hasClass("disabled")) {
			deviceSheduleOptions.AutoDownloadOn = autoDownloadOnValue ? autoDownloadOnValue : '';
			deviceSheduleOptions.IsAutoSchedulingDuringMHB = isAutoSchedulingDuringMHBValue;
			deviceSheduleOptions.IsAutoSchedulingEnabled = isAutoSchedulingEnabledValue;
		} else {
			deviceSheduleOptions.AutoDownloadOn = autoDownloadOn;
			deviceSheduleOptions.IsAutoSchedulingDuringMHB = isAutoSchedulingDuringMHB;
			deviceSheduleOptions.IsAutoSchedulingEnabled = isAutoSchedulingEnabled;
		}

		setDownloadOptionsReq.DeviceLite = deviceLiteList;
		setDownloadOptionsReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
		setDownloadOptionsReq.DeviceSheduleOptions = deviceSheduleOptions;
		setDownloadOptionsReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
		setDownloadOptionsReq.OnlySetDownloadOptions = isOnlyDownloadChange;

		return setDownloadOptionsReq;
	}
	function closePopup(unloadTempPopup) {
		//if ($("#downloadAutomationCheckbox").is(':checked')) {
		if ((isUnassignSoftwareResult && isAutomationResult) || (isUnassignSoftwareResult && !isDownloadAutomationChanged)) {
			isUnassignSoftwareResult = false;
			isAutomationResult = false;
			unloadTempPopup('unloadTemplate');
			$('#deviceProfileModel').modal('hide');
			$('#deviceModel').modal('hide');
			$("#loadingDiv").hide();
			openAlertpopup(0, 'removed_packages_refset');
		}
	}

	function showDirectReferenceSet() {
		$('#rbtnReferenceSet').prop('checked', true);
		$('#rdoBtnDirect').prop('checked', true);
		$("#none").hide();
		$("#packagesGrid").hide();
		$("#showOverrite").hide();
		var functionReferenceSetGridShow = function () {
			if ($("#rdoEnabled").is(':checked'))
				$("#inheriDirectAssgnmnt").find("input").prop("disabled", false);
			else
				$("#inheriDirectAssgnmnt").find("input").prop("disabled", false);

			if (isFromAddDevice == true || ADSearchUtil.AdScreenName == 'deviceProfile') {
				if ($("#rdoEnabledValue").is(':checked')) {
					enableDisableDownloadOptions(1);
				} else {
					enableDisableDownloadOptions(0);
				}
			} else {
				if ($("#rdoEnabled").is(':checked')) {
					enableDisableDownloadOptions(1);
				} else {
					enableDisableDownloadOptions(0);
				}
			}
			if (referenceSetId === 0) {
				enableDisableLoadTemplates(0);
			} else {
				enableDisableLoadTemplates(1);
			}
			enableDisableReferenceSetGrid(1);
			enableDisableResetFilter(1);
			enableDisablePagination(1);
			enableDisableTemplatesGrid(1);
		}
		$("#refernceSetGrid").show();
		$("#refernceSetGrid").css({ "display": "block" });
		$("#inheritDiv").addClass('hide');
		$("#resetFilterDiv").removeClass('hide');
		$("#referenceSetGridDiv").removeClass('hide');
		showHideTemplates(1);
		setTimeout(functionReferenceSetGridShow, 10);
	}

	function showInheritFromHierarchy() {
		if (!licenseSource.isAutoDownloadsLicensed) {
			showDirectReferenceSet();
			return;
		}
		$('#rbtnReferenceSet').prop('checked', true);
		$('#rdoBtnHierarchy').prop('checked', true);
		$("#none").hide();
		$("#packagesGrid").hide();
		$("#refernceSetGrid").show();
		$("#refernceSetGrid").css({ "display": "block" });
		$("#showOverrite").hide();
		$("#inheriDirectAssgnmnt").find("input").prop("disabled", false);
		$("#inheritDiv").removeClass('hide');
		$("#resetFilterDiv").addClass('hide');
		$("#referenceSetGridDiv").addClass('hide');
		showHideTemplates(1);
		enableDisableDownloadOptions(0);
		enableDisableReferenceSetGrid(0);
		enableDisableResetFilter(0);
		enableDisablePagination(0);

		if (selectedReferenceSetId > 0) {
			showInheritDetails('Detailed');
			enableDisableLoadTemplates(1);
			enableDisableTemplatesGrid(1);
		} else {
			showInheritDetails('InProgress');
			enableDisableLoadTemplates(0);
			enableDisableTemplatesGrid(0);
		}
	}

	function showPackages() {
		$('#rbtnPackages').prop('checked', true);
		$("#none").hide();
		$("#refernceSetGrid").hide();
		$("#packagesGrid").show();
		$("#packagesGrid").css({ "display": "block" });
		showHideTemplates(1);
		if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			setScreenControls(AppConstants.get('GLOBAL_SOFTWARE_KEY_ASSIGNMENT'));
		} else {
			$("#noKeySupportMessageDiv").hide();
		}
		if (isFromAddDevice == true || ADSearchUtil.AdScreenName == 'deviceProfile') {
			if ($("#rdoEnabledValue").is(':checked')) {
				enableDisableDownloadOptions(1);
			} else {
				enableDisableDownloadOptions(0);
			}
		} else {
			if ($("#rdoEnabled").is(':checked')) {
				enableDisableDownloadOptions(1);
			} else {
				enableDisableDownloadOptions(0);
			}
		}
		enableDisableTemplatesGrid(1);
	}

	function showKeys() {
		$('#rbtnPackages').prop('checked', true);
		$("#none").hide();
		$("#refernceSetGrid").hide();
		$("#packagesGrid").show();
		showHideTemplates(0);
	}

	function showNone() {
		$('#rbtnNone').prop('checked', true);
		$("#none").show();
		$("#none").css({ "display": "block" });
		$("#showOverrite").hide();
		$("#packagesGrid").hide();
		$("#refernceSetGrid").hide();
		showHideTemplates(0);
		enableDisableDownloadOptions(0);
	}

	function showInheritDetails(type) {
		if (type === 'Detailed') {
			$("#inheritInProgressDiv").hide();
			$("#inheritDetailsDiv").show();
			$("#assignedHierarchyTemplatePanel").show();
		} else if (type === 'InProgress') {
			$("#assignedHierarchyTemplatePanel").hide();
			$("#inheritDetailsDiv").hide();
			$("#inheritInProgressDiv").show();
		}
	}

	function fetchTemplates(availableApplicationTemplates, selectedApplicationTemplates) {
		var availableTemplateComponent = '';
		availableTemplateComponent += '<div id="jqxGridAvailableParameterTemplates"></div>';
		$("#availableParameterTemplatesDiv").empty();
		$("#availableParameterTemplatesDiv").append(availableTemplateComponent);
		if (availableApplicationTemplates() && availableApplicationTemplates().length > 0) {
			gridAvailableParameterTemplates(availableApplicationTemplates(), 'jqxGridAvailableParameterTemplates');
		} else {
			gridAvailableParameterTemplates([], 'jqxGridAvailableParameterTemplates');
		}

		var assignedTemplateComponent = '';
		assignedTemplateComponent += '<div id="jqxGridAssignedParameterTemplates"></div>';
		$("#assignedParameterTemplatesDiv").empty();
		$("#assignedParameterTemplatesDiv").append(assignedTemplateComponent);
		if (selectedApplicationTemplates() && selectedApplicationTemplates().length > 0) {
			gridAssignedParameterTemplates(selectedApplicationTemplates(), 'jqxGridAssignedParameterTemplates');
		} else {
			gridAssignedParameterTemplates([], 'jqxGridAssignedParameterTemplates');
		}
		enableDisableTemplatesGrid(1);
	}

	function showHideTemplates(type) {
		if (type === 0) {
			$("#templatesDiv").addClass('hide');
			$("#loadTemplatesDiv").addClass('hide');
		} else {
			if (ADSearchUtil.AdScreenName !== 'addDeviceManually') {
				if (licenseSource.isParameterLicensed) {
					$("#templatesDiv").removeClass('hide');
					$("#loadTemplatesDiv").removeClass('hide');
				}
			}
		}
	}

	function enableDisableDownloadOptions(type) {
		if (type == 0) {
			$("#downloadOptionsDiv").addClass("disabled");
			$("#downloadOptionsDiv").prop('disabled', true);
		} else {
			$("#downloadOptionsDiv").removeClass("disabled");
			$("#downloadOptionsDiv").prop('disabled', false);
		}
	}

	function enableDisableReferenceSetGrid(type) {
		if (type == 0) {
			$("#referenceSetGridDiv").find("input").prop("disabled", true);
			$("#jqxgridSAReferenceSet").jqxGrid("disabled", true);
			$("#jqxgridSAReferenceSet").prop("disabled", true);
		} else {
			$("#referenceSetGridDiv").find("input").prop("disabled", false);
			$("#jqxgridSAReferenceSet").jqxGrid("disabled", false);
			$("#jqxgridSAReferenceSet").prop("disabled", false);
		}
	}

	function enableDisableResetFilter(type) {
		if (type == 0) {
			$("#resetFilter").addClass('disabled').off('click');
		} else {
			$("#resetFilter").removeClass('disabled').off('click');
			$("#resetFilter").on('click', function () {
				gridFilterClear('jqxgridSAReferenceSet');
				checkRadioState = '';
			});
		}
	}

	function enableDisablePagination(type) {
		if (type == 0) {
			$('#pagerDivReferenceSetForDevices').addClass('disabled').off('click');
			$('#pagerDivReferenceSetForDevices').prop('disabled', true);
			$("#pagerDivReferenceSetForDevices").find("input").prop("disabled", true);
		} else {
			$('#pagerDivReferenceSetForDevices').removeClass('disabled').off('click');
			$('#pagerDivReferenceSetForDevices').prop('disabled', false);
			$("#pagerDivReferenceSetForDevices").find("input").prop("disabled", false);
		}
	}

	//Check values for Software Assingnment
	function setUpView(selectedPackagesApplicationsArray, type) {
		if (koUtil.AssignmentType && koUtil.AssignmentType.toUpperCase() == AppConstants.get('Package')) {
			showPackages();
		} else if (koUtil.AssignmentType && koUtil.AssignmentType.toUpperCase() == AppConstants.get('None')) {
			if (type == 1) {
				showInheritFromHierarchy();
			} else if (type == 2) {
				showPackages();
			} else {
				showNone();
			}
		} else if (koUtil.AssignmentType && koUtil.AssignmentType.toUpperCase() == AppConstants.get('ReferenceSet')) {
			if (referenceSetId > 0 || isDirectAssignment) {
				if (koUtil.IsDirectAssignment == true || isDirectAssignment) {
					showDirectReferenceSet();
				} else {
					showInheritFromHierarchy();
				}
			} else {
				showInheritFromHierarchy();
			}
		} else {
			$("#refernceSetGrid").show();
			$("#none").hide();
			$("#packagesGrid").hide();
			$("#showOverrite").hide();
			isDownloadOptionsChanged = false;
			enableDisableDownloadOptions(0);
			enableDisableResetFilter(0);
		}
	}

	function getTemplatesForDevice(parentGridId, selectedPackages, availableParameterTemplates, selectedParameterTemplates) {
		var selectedItems = getMultiSelectedData(parentGridId);
		var selectedItemIds = getSelectedUniqueId(parentGridId);
		var unSelectedItemIds = getUnSelectedUniqueId(parentGridId);
		var selector = new Object();

		if (ADSearchUtil.AdScreenName == 'deviceProfile') {
			selector.SelectedItemIds = [koUtilUniqueDeviceId];
			selector.UnSelectedItemIds = null;
		} else if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			var checkAll = checkAllSelected(parentGridId);
			if (checkAll == 1) {
				selector.SelectedItemIds = null;
				selector.UnSelectedItemIds = !_.isEmpty(unSelectedItemIds) ? unSelectedItemIds : null;
			} else {
				selector.SelectedItemIds = selectedItemIds;
				selector.UnSelectedItemIds = null;
			}
		}

		var isReferenceSetSelected = false;
		var isInherit = false;
		if ($("#rbtnReferenceSet").is(':checked')) {
			isReferenceSetSelected = true;
			if ($("#rdoBtnHierarchy").is(':checked')) {
				isInherit = true;
			}
		} else {
			var packages = _.where(selectedPackages(), { Type: AppConstants.get('Assignment_Package') });
			var packageIds = new Array();
			for (var i = 0; i < packages.length; i++) {
				packageIds.push(parseInt(packages[i].PackageId));
			}
		}

		var getTemplateAssignedToDeviceReq = new Object();
		getTemplateAssignedToDeviceReq.IsReferenceSet = isReferenceSetSelected ? true : (isParentReferenceSetSelected ? true :false);
		getTemplateAssignedToDeviceReq.ReferenceSetId = isReferenceSetSelected ? (isInherit ? selectedReferenceSetId : referenceSetId) : 0;
		getTemplateAssignedToDeviceReq.IsParentReferenceSet = isParentReferenceSetSelected ? true : false;
		getTemplateAssignedToDeviceReq.ParentReferenceSetId = isParentReferenceSetSelected ? parentReferenceSetId : 0;
		getTemplateAssignedToDeviceReq.PackageIds = !isReferenceSetSelected ? packageIds : [];
		getTemplateAssignedToDeviceReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
		getTemplateAssignedToDeviceReq.ParentColumnSortFilter = ADSearchUtil.AdScreenName === 'deviceSearch' ? koUtil.GlobalColumnFilter : new Object();
		getTemplateAssignedToDeviceReq.Selector = selector;
		getTemplateAssignedToDeviceReq.IsInherit = isInherit;

		function callbackFunction(data, error) {
			$("#loadingDiv").hide();
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.getTemplatesAssignedToDeviceResp) {
						data.getTemplatesAssignedToDeviceResp = $.parseJSON(data.getTemplatesAssignedToDeviceResp);

						availableParameterTemplates([]);
						selectedParameterTemplates([]);

						if (!_.isEmpty(data.getTemplatesAssignedToDeviceResp.AvailableApplicationTemplates) && data.getTemplatesAssignedToDeviceResp.AvailableApplicationTemplates.length > 0) {
							availableParameterTemplates(data.getTemplatesAssignedToDeviceResp.AvailableApplicationTemplates);
						}
						if (!_.isEmpty(data.getTemplatesAssignedToDeviceResp.SelectedApplicationTemplates) && data.getTemplatesAssignedToDeviceResp.SelectedApplicationTemplates.length > 0) {
							selectedParameterTemplates(data.getTemplatesAssignedToDeviceResp.SelectedApplicationTemplates);
						}

						fetchTemplates(availableParameterTemplates, selectedParameterTemplates);
						enableDisableTemplatesGrid(1);
					}
				}
			}
		}

		var method = 'GetTemplatesAssignedToDevice';
		var params = '{"token":"' + TOKEN() + '","getTemplatesAssignedToDeviceReq":' + JSON.stringify(getTemplateAssignedToDeviceReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	function gridAvailableParameterTemplates(availableParameterTemplates, gID) {
		var source =
		{
			dataType: "json",
			localdata: availableParameterTemplates,
			datafields: [
				{ name: 'TemplateId', map: 'TemplateId' },
				{ name: 'ReferenceSetId', map: 'ReferenceSetId' },
				{ name: 'TemplateName', map: 'TemplateName' },
				{ name: 'PackageName', map: 'PackageName' },
				{ name: 'ApplicationId', map: 'ApplicationId' },
				{ name: 'ApplicationName', map: 'ApplicationName' },
				{ name: 'ApplicationVersion', map: 'ApplicationVersion' },
				{ name: 'ReferenceSetName', map: 'ReferenceSetName' },
				{ name: 'ModelId', map: 'ModelId' }
			],

		};
		var dataAdapter = new $.jqx.dataAdapter(source);

		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		}

		$("#" + gID).jqxGrid(
			{
				width: "100%",
				height: "180px",
				source: dataAdapter,
				sortable: true,
				filterable: true,
				selectionmode: 'singlerow',
				theme: AppConstants.get('JQX-GRID-THEME'),
				altrows: true,
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				editable: true,
				rowsheight: 32,
				enabletooltips: true,
				columnsResize: true,
				columns: [
					{
						text: i18n.t('pt_template', { lng: lang }), datafield: 'TemplateName', width: 140, minwidth: 140, editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('pt_templatepackage', { lng: lang }), datafield: 'PackageName', width: 140, minwidth: 80, editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('pt_templateapplication', { lng: lang }), datafield: 'ApplicationName', width: 140, minwidth: 80, editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('pt_templateversion', { lng: lang }), datafield: 'ApplicationVersion', width: 140, minwidth: 80, editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					}
				]
			}).on({
				filter: function (e) {
					selectedRowAvailableTemplates = [];
					gridSetRowDetailsforAvailableTemplates(e, gID);
					highlightedIndexAvailableTemplates = -1;
				}
			});


		$("#" + gID).bind('rowselect', function (event) {
			$("#btnMoveRightSoftwareTemplate").removeClass('disabled');
			$("#btnMoveRightSoftwareTemplate").prop('disabled', false);

			var selectedRow = new Object();
			var datainformations = $("#" + gID).jqxGrid('getdatainformation');
			var rowscounts = datainformations.rowscount;
			selectedRow.TemplateId = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'TemplateId');
			selectedRow.ReferenceSetId = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ReferenceSetId');
			selectedRow.TemplateName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'TemplateName');
			selectedRow.PackageName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'PackageName');
			selectedRow.ApplicationId = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ApplicationId');
			selectedRow.ApplicationName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ApplicationName');
			selectedRow.ApplicationVersion = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ApplicationVersion');
			selectedRow.ReferenceSetName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ReferenceSetName');
			selectedRow.IsOverride = false;
			selectedRowAvailableTemplates = new Array();
			selectedRowAvailableTemplates.push(selectedRow);
			highlightedIndexAvailableTemplates = event.args.rowindex;
			if ((rowscounts - 1) == highlightedIndexAvailableTemplates) {
				isRightTemplatesClick = "No";
			} else {
				isRightTemplatesClick = "Yes";
			}
		});
	}

	function gridAssignedParameterTemplates(assignedParameterTemplates, gID) {
		var source =
		{
			dataType: "json",
			localdata: assignedParameterTemplates,
			datafields: [
				{ name: 'TemplateId', map: 'TemplateId' },
				{ name: 'ReferenceSetId', map: 'ReferenceSetId' },
				{ name: 'TemplateName', map: 'TemplateName' },
				{ name: 'PackageName', map: 'PackageName' },
				{ name: 'ApplicationId', map: 'ApplicationId' },
				{ name: 'ApplicationName', map: 'ApplicationName' },
				{ name: 'ApplicationVersion', map: 'ApplicationVersion' },
				{ name: 'ReferenceSetName', map: 'ReferenceSetName' },
				{ name: 'ModelId', map: 'ModelId' },
				{ name: 'IsOverride', map: 'IsOverride' }
			],

		};
		var dataAdapter = new $.jqx.dataAdapter(source);

		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		}

		$("#" + gID).jqxGrid(
			{
				width: "100%",
				height: "180px",
				source: dataAdapter,
				sortable: true,
				filterable: true,
				selectionmode: 'singlerow',
				theme: AppConstants.get('JQX-GRID-THEME'),
				altrows: true,
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				editable: true,
				rowsheight: 32,
				enabletooltips: true,
				columnsResize: true,
				columns: [
					{
						text: i18n.t('pt_template', { lng: lang }), datafield: 'TemplateName', width: 140, minwidth: 140, editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('pt_templatepackage', { lng: lang }), datafield: 'PackageName', width: 140, minwidth: 80, editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('pt_templateapplication', { lng: lang }), datafield: 'ApplicationName', width: 140, minwidth: 80, editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('pt_templateversion', { lng: lang }), datafield: 'ApplicationVersion', width: 140, minwidth: 80, editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('Override', { lng: lang }), datafield: 'IsOverride', columntype: 'checkbox', width: 60, menu: false, cellsalign: 'left', align: 'center', editable: true
					}
				]
			}).on({
				filter: function (e) {
					selectedRowAssignedTemplates = [];
					gridSetRowDetailsforAssignedTemplates(e, gID);
				}
			});

		$("#" + gID).bind('rowselect', function (event) {
			$("#btnMoveLeftSoftwareTemplate").removeClass('disabled');
			$("#btnMoveLeftSoftwareTemplate").prop('disabled', false);

			var selectedRow = new Object();
			var datainformations = $("#" + gID).jqxGrid('getdatainformation');
			var rowscounts = datainformations.rowscount;
			selectedRow.TemplateId = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'TemplateId');
			selectedRow.ReferenceSetId = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ReferenceSetId');
			selectedRow.TemplateName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'TemplateName');
			selectedRow.PackageName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'PackageName');
			selectedRow.ApplicationId = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ApplicationId');
			selectedRow.ApplicationName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ApplicationName');
			selectedRow.ApplicationVersion = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ApplicationVersion');
			selectedRow.ReferenceSetName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ReferenceSetName');
			selectedRow.IsOverride = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'IsOverride');
			selectedRowAssignedTemplates = new Array();
			selectedRowAssignedTemplates.push(selectedRow);
			highlightedIndexAssignedTemplates = event.args.rowindex;
		});

		$("#" + gID).bind('cellendedit', function (event) {
			var IsOverride = false;
			if (event.args.value == false) {
				IsOverride = false;
			} else {
				IsOverride = true;
			}
			if (event.args.row) {
				updateAssignedTemplates(assignedParameterTemplates, event.args.row.ApplicationId, IsOverride);
				enableDisableSaveButton(1);
			}
		});
	}

	function gridAssignedHierarchyTemplates(assignedHierarchyTemplate, gID) {
		var source =
		{
			dataType: "json",
			localdata: assignedHierarchyTemplate,
			datafields: [
				{ name: 'TemplateId', map: 'TemplateId' },
				{ name: 'ReferenceSetId', map: 'ReferenceSetId' },
				{ name: 'TemplateName', map: 'TemplateName' },
				{ name: 'PackageName', map: 'PackageName' },
				{ name: 'ApplicationId', map: 'ApplicationId' },
				{ name: 'ApplicationName', map: 'ApplicationName' },
				{ name: 'ApplicationVersion', map: 'ApplicationVersion' },
				{ name: 'ReferenceSetName', map: 'ReferenceSetName' },
				{ name: 'ModelId', map: 'ModelId' }
			],

		};
		var dataAdapter = new $.jqx.dataAdapter(source);

		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		}

		$("#" + gID).jqxGrid(
			{
				width: "100%",
				height: "180px",
				source: dataAdapter,
				sortable: true,
				filterable: true,
				selectionmode: 'singlerow',
				theme: AppConstants.get('JQX-GRID-THEME'),
				altrows: true,
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				editable: true,
				rowsheight: 32,
				enabletooltips: true,
				columnsResize: true,
				columns: [
					{
						text: i18n.t('pt_template', { lng: lang }), datafield: 'TemplateName', width: 'auto', minwidth: 140, editable: false, menu: false, sortable: false, filterable: false
					},
					{
						text: i18n.t('pt_templatepackage', { lng: lang }), datafield: 'PackageName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false
					},
					{
						text: i18n.t('pt_templateapplication', { lng: lang }), datafield: 'ApplicationName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false
					},
					{
						text: i18n.t('pt_templateversion', { lng: lang }), datafield: 'ApplicationVersion', width: 140, minwidth: 80, editable: false, menu: false, sortable: false, filterable: false
					}
				]
			}).on({
				filter: function (e) {

				}
			});
	}

});

function updateAssignedTemplates(assignedParameterTemplates, applicationId, isOverride) {
	if (assignedParameterTemplates && assignedParameterTemplates.length > 0) {
		var source = _.where(assignedParameterTemplates, { ApplicationId: applicationId });
		if (!_.source && source.length > 0) {
			source[0].IsOverride = isOverride;
			isTemplateChanged = true;
		}
	}
}

function enableDisableSaveButton(type) {
	if (type == 0) {
		if (isFromAddDevice == true) {
			$("#btnAdd").prop("disabled", true);
		} else {
			$("#btn_SaveAssignmentId").prop("disabled", true);
		}
	} else {
		if (isFromAddDevice == true) {
			$("#btnAdd").prop("disabled", false);
		} else {
			$("#btn_SaveAssignmentId").prop("disabled", false);
		}
	}
}

function enableDisableLoadTemplates(type) {
	if (type === 0) {
		$("#btnLoadTemplatesSoftware").prop('disabled', true);
	} else {
		$("#btnLoadTemplatesSoftware").prop('disabled', false);
	}
}

function enableDisableTemplatesGrid(type) {
	if (type === 0) {
		$("#jqxGridAvailableParameterTemplates").jqxGrid("disabled", true);
		$("#jqxGridAvailableParameterTemplates").prop("disabled", true);
		$("#jqxGridAssignedParameterTemplates").jqxGrid("disabled", true);
		$("#jqxGridAssignedParameterTemplates").prop("disabled", true);
		$("#btnMoveRightSoftwareTemplate").addClass('disabled');
		$("#btnMoveRightSoftwareTemplate").prop('disabled', true);
		$("#btnMoveLeftSoftwareTemplate").addClass('disabled');
		$("#btnMoveLeftSoftwareTemplate").prop('disabled', true);
		isTemplateChanged = false;
		isTemplatesDisabled = true;
	} else {
		$("#jqxGridAvailableParameterTemplates").jqxGrid("disabled", false);
		$("#jqxGridAvailableParameterTemplates").prop("disabled", false);
		$("#jqxGridAssignedParameterTemplates").jqxGrid("disabled", false);
		$("#jqxGridAssignedParameterTemplates").prop("disabled", false);
		isTemplatesDisabled = false;
	}
}

function getTemplateGridsState() {
	if (isTemplatesDisabled) {
		return false;
	} else {
		return true;
	}
}

function getRSRadioButtonValue(row) {
	isDirectDeviceAssignChanged = true;
	isDirectSoftAssignMent = 1;
	//$("#btnAdd").prop("disabled", false);
	//$("#btn_SaveAssignmentId").prop("disabled", false);
	referenceSetName = $("#jqxgridSAReferenceSet").jqxGrid('getcellvalue', row, 'Name');
	supportedPackages = $("#jqxgridSAReferenceSet").jqxGrid('getcellvalue', row, 'SupportedPackages');
	referenceSetStatus = $("#jqxgridSAReferenceSet").jqxGrid('getcellvalue', row, 'Status');
	referenceSetId = $("#jqxgridSAReferenceSet").jqxGrid('getcellvalue', row, 'ReferenceSetId');
	selectedRFSponsorName = $("#jqxgridSAReferenceSet").jqxGrid('getcellvalue', row, 'SponsorName');
	checkRadioState = referenceSetId;

	if (referenceSetName == '') {
		$("#jqxgridSAReferenceSetseleceteRowSpan").text('0');
	} else {
		$("#jqxgridSAReferenceSetseleceteRowSpan").text('1');
	}

	if (isDirectAssignment == true) {
		if (referenceSetName == '') {
			$("#jqxgridSAReferenceSetseleceteRowSpan").text('0');
			$("#btnAdd").prop("disabled", true);
		} else {
			$("#jqxgridSAReferenceSetseleceteRowSpan").text('1');
		}
	}

	var rows = $("#jqxgridSAReferenceSet").jqxGrid('getrows');
	if (rows && rows.length > 0) {
		for (var i = 0; i < rows.length; i++) {
			var boundindex = $("#jqxgridSAReferenceSet").jqxGrid('getrowboundindexbyid', rows[i].uid);
			if (rows[i].ReferenceSetId == referenceSetId) {
				$("#jqxgridSAReferenceSet").jqxGrid('setcellvalue', boundindex, 'isSelected', 1);
			} else {
				$("#jqxgridSAReferenceSet").jqxGrid('setcellvalue', boundindex, 'isSelected', 0);
			}
		}
	}
	$("#jqxgridSAReferenceSet").jqxGrid("refresh");
	if (referenceSetId !== selectedReferenceSetId) {
		isReferenceSetChanged = true;
	} else {
		isReferenceSetChanged = false;
	}
	enableDisableLoadTemplates(1);
	enableDisableTemplatesGrid(0);
	enableDisableSaveButton(1);
}

function getParentReferenceSetRadioButtonValue(row) {
	var gId = "#jqxgridSAParentReferenceSet";
	isDirectDeviceAssignChanged = true;
	isDirectSoftAssignMent = 1;
	parentReferenceSetId = $(gId).jqxGrid('getcellvalue', row, 'ID');
	parentReferenceSetName = $(gId).jqxGrid('getcellvalue', row, 'Name');
	parentReferenceSetDescription = $(gId).jqxGrid('getcellvalue', row, 'Description');

	if (parentReferenceSetName == '') {
		$(gId + "seleceteRowSpan").text('0');
	} else {
		$(gId + "seleceteRowSpan").text('1');
	}

	var rows = $(gId).jqxGrid('getrows');
	if (rows && rows.length > 0) {
		for (var i = 0; i < rows.length; i++) {
			var boundindex = $(gId).jqxGrid('getrowboundindexbyid', rows[i].uid);
			if (rows[i].ID == parentReferenceSetId) {
				$(gId).jqxGrid('setcellvalue', boundindex, 'isSelected', 1);
			} else {
				$(gId).jqxGrid('setcellvalue', boundindex, 'isSelected', 0);
			}
		}
	}
	$(gId).jqxGrid("refresh");
	enableDisableLoadTemplates(1);
	enableDisableTemplatesGrid(0);
	enableDisableSaveButton(1);
}

var gridSetRowDetailsforAvailGridSoftAssign = function (e, gID) {
	$("#" + gID).jqxGrid('beginupdate');
	var results = $("#" + gID).jqxGrid('getrows').length;
	if (results == 0) {
		$("#btnForMoveRight").addClass('disabled');
		$("#btnForMoveRight").prop("disabled", true);
	}

	$("#" + gID).jqxGrid('resumeupdate');
	State12 = $("#" + gID).jqxGrid('savestate');
	$("#" + gID).jqxGrid('clearselection');
	return;

};

var gridSetRowDetailsforAvailableTemplates = function (e, gID) {
	$("#" + gID).jqxGrid('beginupdate');
	var results = $("#" + gID).jqxGrid('getrows').length;
	if (results == 0) {
		$("#btnMoveRightSoftwareTemplate").addClass('disabled');
		$("#btnMoveRightSoftwareTemplate").prop("disabled", true);
	}

	$("#" + gID).jqxGrid('resumeupdate');
	State12 = $("#" + gID).jqxGrid('savestate');
	$("#" + gID).jqxGrid('clearselection');
	return;

};

var gridSetRowDetailsforAssignedTemplates = function (e, gID) {
	$("#" + gID).jqxGrid('beginupdate');
	var results = $("#" + gID).jqxGrid('getrows').length;
	if (results == 0) {
		$("#btnMoveLeftSoftwareTemplate").addClass('disabled');
		$("#btnMoveLeftSoftwareTemplate").prop("disabled", true);
	}

	$("#" + gID).jqxGrid('resumeupdate');
	State12 = $("#" + gID).jqxGrid('savestate');
	$("#" + gID).jqxGrid('clearselection');
	return;

};