var StateEditHierarchy = new Object();
var assignedReferenceSets = new Array();
var isReferenceSetAssignmentChanged = false;
var isPTAssignmentChanged = false;
define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
	var lang = getSysLang();

	var selectedRowAvailableReferenceSets = new Array();
	var selectedRowAssignedReferenceSets = new Array();
	var selectedRowAvailableTemplates = new Array();
	var selectedRowAssignedTemplates = new Array();
	var referenceSetArrayTocheck = [];
	var parameterTemplateArrayToCheck = [];

	var highlightedIndexAvailableReferenceSets = -1;
	var highlightedIndexAssignedReferenceSets = -1;
	var highlightedIndexAvailableTemplates = -1;
	var highlightedIndexAssignedTemplates = -1;
	var isRightPackagesClick;
	var rowIdForHighlightedForTable;

	var isReferenceSetTemplateChanged = false;
	var warningFlag = false;

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

	return function viewModelForEditHierarchyAssignment() {

		var self = this;

		//Draggable function
		$('#mdlEditHierarchyAssgnmtHeader').mouseup(function () {
			$("#mdlEditHierarchyAssgnmt").draggable({ disabled: true });
		});

		$('#mdlEditHierarchyAssgnmtHeader').mousedown(function () {
			$("#mdlEditHierarchyAssgnmt").draggable({ disabled: false });
		});
		////////////////

		self.hierarchyFullPath = ko.observable();
		self.downloadAutomation = ko.observable();
		self.downloadedOn = ko.observable();
		self.autoSchedulingDuringMHB = ko.observable();
		self.hierarchyId = ko.observable();
		self.availableReferenceSet = ko.observableArray();
		self.availableParameterTemplates = ko.observableArray();
		self.duplicateParameters = ko.observableArray();
		self.invalidParameters = ko.observableArray();
		self.hierarchyName = ko.observable();
		self.referenceSetModel = ko.observableArray();
		self.checkedFromHierarchy = ko.observable(false);
		self.checkedOverriteAssignment = ko.observable(true);
		self.IsInheritReferenceSet = ko.observable(false);
		self.ParmeterTemplateModel = ko.observableArray();
		koUtil.downloadAutomationHierarchy = 0;
		koUtil.downloadOnHierarchy = 0;
		self.IsChangesMadeToSave = ko.observable(false);
		self.isAvailablePTExist = ko.observable(false);
		self.isDuplicateTemplateAssignment = ko.observable(false);
		self.qualifiedReferenceSets = ko.observableArray();
		self.qualifiedReferenceSetsText = ko.observable('');
		self.assignedPramenterTemplatesText = ko.observable('');
		if (self.hierarchyLevel == 1)
			self.isRootHierarchy = true;
		else
			self.isRootHierarchy = false;

		var downloadAutomationValue = globalVariableForHierarchyAssignment.EnableAutoDownload ? true : false;
		var downloadedOn = globalVariableForHierarchyAssignment.DownloadedOn;
		var autoSchedulingDuringMHB = globalVariableForHierarchyAssignment.IsAutoSchedulingDuringMHB ? true : false;
		self.hierarchyFullPath = globalVariableForHierarchyAssignment.HierarchyFullPath;
		self.hierarchyName = globalVariableForHierarchyAssignment.HierarchyName;
		self.hierarchyId = globalVariableForHierarchyAssignment.HierarchyId;
		self.hierarchyIds = globalVariableForHierarchyAssignment.HierarchyIds;
		self.hierarchyLevel = globalVariableForHierarchyAssignment.HierarchyLevel;
		self.IsInheritReferenceSet = globalVariableForHierarchyAssignment.IsInheritReferenceSet ? true : false;
		self.IsMultiEdit = ko.observable(globalVariableForHierarchyAssignment.IsMultiEdit)();
		self.selectedCount = ko.observable(globalVariableForHierarchyAssignment.selectedCount)();
		self.unselectedCount = ko.observable(globalVariableForHierarchyAssignment.unselectedCount)();
		self.checkAll = ko.observable(globalVariableForHierarchyAssignment.checkAll)();

		///-----------------------FLAGS FOR ENABLE DISABLE FUNCTIONALITY----------------------------
		var inheritFromParentHierarchyChanged = false;
		var isDownloadAutomationChanged = false;
		var isDownloadOnChanged = false;
		var isQualifiedReferenceSetDetailsExist = false;
		var isQualifiedParameterTemplateDetailsExist = false;

		//Enable buttons
		$("#btnMoveRightReferenceSet").addClass('disabled');
		$("#btnMoveRightReferenceSet").prop('disabled', true);
		$("#btnMoveLeftReferenceSet").addClass('disabled');
		$("#btnMoveLeftReferenceSet").prop('disabled', true);
		$("#btnMoveLeftAllReferenceSets").addClass('disabled');
		$("#btnMoveLeftAllReferenceSets").prop('disabled', true);
		$("#btnMoveUpReferenceSet").addClass('disabled');
		$("#btnMoveUpReferenceSet").prop('disabled', true);
		$("#btnMoveDownReferenceSet").addClass('disabled');
		$("#btnMoveDownReferenceSet").prop("disabled", true);
		$("#chkoverwriteassignmentLbl").addClass('disabled');
		$("#chkoverwriteassignmentLbl").prop("disabled", true);
		$("#btnMoveRightHierarchyTemplate").addClass('disabled');
		$("#btnMoveRightHierarchyTemplate").prop('disabled', true);
		$("#btnMoveLeftHierarchyTemplate").addClass('disabled');
		$("#btnMoveLeftHierarchyTemplate").prop('disabled', true);
		$('#modelHierarchyAssignmentID').keydown(function (e) {
			if ($('#cancelEditHierarchyRefer').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#editHIerarchyAssignCloseBtn').focus();
			}
		});

		$('#warningHierarchyAssignment').on('shown.bs.modal', function (e) {
			$('#hierarchyPopup_ConfoNo').focus();

		});
		$('#warningHierarchyAssignment').keydown(function (e) {
			if ($('#hierarchyPopup_ConfoNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#hierarchyPopup_ConfoYes').focus();
			}
		});
		$('#confirmationPTPopup').on('shown.bs.modal', function (e) {
			$('#templatePopup_ConfoNo').focus();

		});
		$('#confirmationPTPopup').keydown(function (e) {
			if ($('#hierarchyPopup_ConfoNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#templatePopup_ConfoYes').focus();
			}
		});
		//------reset filter------
		self.clearWildcardFilter = function (gId) {
			clearUiGridFilter(gId);
			$('#' + gId).jqxGrid('clearselection');
			if (gId === 'jqxGridAvailableHierarchyReferenceSets') {
				$("#btnMoveRightReferenceSet").GetaddClass('disabled');
				$("#btnMoveRightReferenceSet").prop('disabled', true);
			} else if (gId === 'jqxGridAssignedHierarchyReferenseSets') {
				$("#btnMoveLeftReferenceSet").addClass('disabled');
				$("#btnMoveLeftReferenceSet").prop('disabled', true);
			} else if (gId === 'jqxGridAssignedHierarchyTemplates') {
				$("#btnMoveRightHierarchyTemplate").addClass('disabled');
				$("#btnMoveRightHierarchyTemplate").prop('disabled', true);
			} else if (gId === 'jqxGridAssignedHierarchyTemplates') {
				$("#btnMoveLeftHierarchyTemplate").addClass('disabled');
				$("#btnMoveLeftHierarchyTemplate").prop('disabled', true);
			}
		}

		//----- hide only confirmation popup click on No button-------
		self.confirmationHierarchy = function () {
			$("#warningHierarchyAssignment").modal('hide');
		}
		//----- hide only confirmation popup click on No button-------
		self.closeConfirmationParameter = function () {
			$("#confirmationPTPopup").modal('hide');
		}
		//----- hide only confirmation save popup click on No button-------
		self.closeConfirmationSaveParameter = function () {
			$("#confirmationPTSavePopup").modal('hide');
		}
		var selectedHierarchyAssignmentEditTab = "editAssignmentHierarchy";
		var presentSelectTab = "";
		self.cancelconfirmation = function () {
			$("#ParameterConfirmPopup").modal('hide');
			tablinks = document.getElementsByClassName("tablinks");
			for (i = 0; i < tablinks.length; i++) {
				tablinks[i].className = tablinks[i].className.replace(" active", "");
			}
			document.getElementById(selectedHierarchyAssignmentEditTab + 'Tab').className += " active";

		}
		self.cancelWarningForHierarchyAssignment = function () {
			$("#warningHierarchyAssignment").modal('hide');
		}

		function enableDisableInheritFromParent(type) {
			if (type == 0) {
				$("#inheritRadioDiv").addClass('disabled');
				$("#inheritRadioDiv").addClass('disabled');
				$("#inheritYes").prop('disabled', true);
				$("#inheritNo").prop('disabled', true);
				$("#inheritYes").prop('checked', false);
				$("#inheritNo").prop('checked', false);
			} else {
				$("#inheritRadioDiv").removeClass('disabled');
				$("#inheritRadioDiv").removeClass('disabled');
				$("#inheritYes").prop('disabled', false);
				$("#inheritNo").prop('disabled', false);
			}
		}

		function enableDisableDownloadAutomation(type) {
			if (type == 0) {
				$("#downloadAutomationRadioDiv").addClass('disabled');
				$("#downloadTrueId").prop('disabled', true);
				$("#downloadFalseId").prop('disabled', true);
			} else {
				$("#downloadAutomationRadioDiv").removeClass('disabled');
				$("#downloadTrueId").prop('disabled', false);
				$("#downloadFalseId").prop('disabled', false);
			}
		}

		function enableDisableDownloadOnCheckBox(type) {
			if (type == 0) {
				$("#downloadOnDiv").addClass("disabled");
				$("#chkDownloadOn").prop('disabled', true);
			} else {
				$("#downloadOnDiv").removeClass("disabled");
				$("#chkDownloadOn").prop('disabled', false);
			}
		}

		function enableDisableDownloadOnRadio(type) {
			if (type == 0) {
				$("#downloadOnDisabledId").removeClass("disbaledDownload");
				$("#downloadOnDisabledId").addClass("disbaledDownload disabled");
				$("#downloadOnDisabledId").prop('disabled', true);
			} else {
				$("#downloadOnDisabledId").addClass("disbaledDownload");
				$("#downloadOnDisabledId").removeClass("disbaledDownload disabled");
				$("#downloadOnDisabledId").prop('disabled', false);
				$("#chkMaintaince").prop('disabled', true);
				$("#chkMaintaince").addClass("maintainceCheckbox disabled");
			}
		}

		function enableDisableReferenceSets(type) {
			if (type == 0) {
				$("#availabledReferenceSetId").removeClass("availabledReference");
				$("#availabledReferenceSetId").addClass("availabledReference disabled");

				$("#btnMoveRightReferenceSet").addClass('disabled');
				$("#btnMoveRightReferenceSet").prop('disabled', true);
				$("#btnMoveLeftReferenceSet").addClass('disabled');
				$("#btnMoveLeftReferenceSet").prop('disabled', true);
				$("#btnMoveLeftAllReferenceSets").addClass('disabled');
				$("#btnMoveLeftAllReferenceSets").prop('disabled', true);
				$("#btnMoveUpReferenceSet").addClass('disabled');
				$("#btnMoveUpReferenceSet").prop('disabled', true);
				$("#btnMoveDownReferenceSet").addClass('disabled');
				$("#btnMoveDownReferenceSet").prop("disabled", true);
			} else {
				$("#availabledReferenceSetId").addClass("availabledReference");
				$("#availabledReferenceSetId").removeClass("availabledReference disabled");
				if (self.referenceSetModel().length > 0) {
					$("#btnMoveLeftReferenceSet").removeClass('disabled');
					$("#btnMoveLeftReferenceSet").prop("disabled", false);
					$("#btnMoveLeftAllReferenceSets").removeClass('disabled');
					$("#btnMoveLeftAllReferenceSets").prop("disabled", false);
					$("#btnMoveUpReferenceSet").removeClass('disabled');
					$("#btnMoveUpReferenceSet").prop("disabled", false);
					$("#btnMoveDownReferenceSet").removeClass('disabled');
					$("#btnMoveDownReferenceSet").prop("disabled", false);
				};
				if (self.availableReferenceSet().length > 0) {
					$("#btnMoveRightReferenceSet").removeClass('disabled');
					$("#btnMoveRightReferenceSet").prop("disabled", false);
				}
			}
		}

		initializeHierarchyTab();
		function initializeHierarchyTab() {
			var downloadAutomationValue = globalVariableForHierarchyAssignment.EnableAutoDownload;
			var downloadedOn = globalVariableForHierarchyAssignment.DownloadedOn;
			var autoSchedulingDuringMHB = globalVariableForHierarchyAssignment.IsAutoSchedulingDuringMHB;
			var autoSchedulingEnabled = globalVariableForHierarchyAssignment.IsAutoSchedulingEnabled;
			//showing checkbox as check/uncheck
			if (globalVariableForHierarchyAssignment.IsInheritReferenceSet == true) {
				self.checkedFromHierarchy('true');
			} else if (globalVariableForHierarchyAssignment.IsInheritReferenceSet == false) {
				self.checkedFromHierarchy('false');
			} else {
				self.checkedFromHierarchy('');
			}
			if (globalVariableForHierarchyAssignment.HierarchyLevel == 1) {
				$("#inheritDiv").hide();
			} else {
				$("#inheritDiv").show();
			}
			//---- show tooltip on Hierarchy name -------
			$("#hierarchyFullPathID").prop("title", self.hierarchyFullPath);

			//------ set value to radio buttons depened on EnableAutoDownload value.------
			if (downloadAutomationValue == true) {
				self.downloadAutomation('true');
			} else if (downloadAutomationValue == false) {
				self.downloadAutomation('false');
			}
			//------set value to radio buttons depends on DownloadedOn value.------
			if (downloadedOn == "Next Contact" && autoSchedulingEnabled == false) {
				self.downloadedOn('Next Contact');
				$("#chkMaintaince").prop('disabled', true);
				$("#chkMaintaince").addClass("maintainceCheckbox disabled");
			} else if (downloadedOn == "Maintenance Window") {
				self.downloadedOn('Next Maintenance Window');
				$("#chkMaintaince").prop('disabled', true);
				$("#chkMaintaince").addClass("maintainceCheckbox disabled");
			} else if ((downloadedOn == "Next available free time slot with Maintenance Window" || downloadedOn == "Next available free time slot") && (autoSchedulingEnabled == true)) {
				self.downloadedOn('Next Available Free Time Slot');
				$("#chkMaintaince").removeAttr('disabled', true);
				$("#chkMaintaince").removeClass("maintainceCheckbox disabled");
				if (autoSchedulingDuringMHB == true) {
					self.autoSchedulingDuringMHB(true);
				} else if (autoSchedulingDuringMHB == false) {
					self.autoSchedulingDuringMHB(false);
				}
			}

			//------disabled or show div based on EnableAutoDownload value------
			if (self.downloadAutomation() == "false") {
				$("#downloadOnDisabledId").removeClass("disbaledDownload");
				$("#downloadOnDisabledId").addClass("disbaledDownload disabled");
				$("#availabledReferenceSetId").removeClass("availabledReference");
				$("#availabledReferenceSetId").addClass("availabledReference disabled");
				$("#downloadOnDisabledId").prop('disabled', true);
			}

			//for multiple hierarchy selection
			if (self.IsMultiEdit) {
				enableDisableInheritFromParent(0);
				enableDisableDownloadAutomation(0);
				enableDisableDownloadOnCheckBox(0);
				enableDisableDownloadOnRadio(0);

				$("#chkDownloadAutomation").prop('checked', false);
				$("#chkDownloadAutomation").prop('disabled', true);
				$("#chkFromHierarchy").prop('checked', false);
				$("#inheritYes").prop('checked', false);
				$("#inheritNo").prop('checked', false);
				$("#downloadTrueId").prop('checked', false);
				$("#downloadFalseId").prop('checked', false);
				$("#qualifiedReferenceSetPanel").addClass('hide');

				if (globalVariableForHierarchyAssignment.IsInheritReferenceSet == true) {
					$("#chkDownloadAutomation").prop('disabled', true);
					$("#chkDownloadAutomation").prop('checked', false);
					enableDisableReferenceSets(1);
				} else {
					$("#chkDownloadAutomation").prop('disabled', false);
					$("#chkDownloadAutomation").prop('checked', true);
					enableDisableDownloadAutomation(1);
					enableDisableDownloadOnCheckBox(1);
					enableDisableDownloadOnRadio(1);
					enableDisableReferenceSets(1);
				}
			} else {
				$("#qualifiedReferenceSetPanel").removeClass('hide');

				if (globalVariableForHierarchyAssignment.IsInheritReferenceSet == true) {
					$("#chkDownloadAutomation").prop('disabled', true);
					enableDisableDownloadAutomation(0);
					enableDisableDownloadOnCheckBox(0);
					enableDisableDownloadOnRadio(0);
					enableDisableReferenceSets(1);
				} else {
					$("#chkDownloadAutomation").prop('disabled', false);
					enableDisableDownloadAutomation(1);
					enableDisableDownloadOnCheckBox(1);
					if (self.downloadAutomation() == "false") {
						enableDisableDownloadOnRadio(0);
					}
					else {
						enableDisableDownloadOnRadio(1);
					}
					enableDisableReferenceSets(1);
				}
			}
		}

		//Reference Sets
		function initializeReferenceSets() {
			if (koUtil.availableArr() && koUtil.availableArr().length > 0) {
				gridAvailableReferenceSets(koUtil.availableArr(), 'jqxGridAvailableHierarchyReferenceSets');
			} else {
				gridAvailableReferenceSets([], 'jqxGridAvailableHierarchyReferenceSets');
			}

			if (referenceSetArrayTocheck && referenceSetArrayTocheck.length > 0) {
				self.referenceSetModel([]);
				for (var k = 0; k < referenceSetArrayTocheck.length; k++) {
					self.referenceSetModel.push(referenceSetArrayTocheck[k])
				}
				gridAssignedReferenceSets(self.referenceSetModel(), 'jqxGridAssignedHierarchyReferenseSets');
			} else {
				self.referenceSetModel([]);
				gridAssignedReferenceSets([], 'jqxGridAssignedHierarchyReferenseSets');
			}
		}

		//Parameter Templates
		function initializeTemplates() {
			if (koUtil.availableParameterTemplateArray() && koUtil.availableParameterTemplateArray().length > 0) {
				gridAvailableHierarchyTemplates(koUtil.availableParameterTemplateArray(), 'jqxGridAvailableHierarchyTemplates');
			} else {
				gridAvailableHierarchyTemplates([], 'jqxGridAvailableHierarchyTemplates');
			}

			if (parameterTemplateArrayToCheck && parameterTemplateArrayToCheck.length > 0) {
				gridAssignedHierarchyTemplates(parameterTemplateArrayToCheck, 'jqxGridAssignedHierarchyTemplates');
			} else {
				gridAssignedHierarchyTemplates([], 'jqxGridAssignedHierarchyTemplates');
			}
		}

		self.onChangeAssignmentTab = function (id) {
			if (self.IsChangesMadeToSave() == false) {
				self.tabChange(id);
			} else if (self.IsChangesMadeToSave() == true) {
				presentSelectTab = id;
				$("#ParameterConfirmPopup").modal('show');
			}
		}

		self.tabChange = function (id) {
			var i, tabcontent, tablinks;
			// Get all elements with class="tabcontent" and hide them
			tabcontent = document.getElementsByClassName("tab-content");
			for (i = 0; i < tabcontent.length; i++) {
				tabcontent[i].style.display = "none";
			}
			// Get all elements with class="tablinks" and remove the class "active"
			tablinks = document.getElementsByClassName("tablinks");
			for (i = 0; i < tablinks.length; i++) {
				tablinks[i].className = tablinks[i].className.replace(" active", "");
			}
			// Show the current tab, and add an "active" class to the button that opened the tab
			document.getElementById(id).style.display = "block";
			document.getElementById(id + 'Tab').className += " active";
			selectedHierarchyAssignmentEditTab = id;

			if (id === "editReferenceSetsTemplates") {              //Reference Sets & Templates
				getReferenceSets(self.hierarchyId, self.availableReferenceSet, self.referenceSetModel, self.qualifiedReferenceSets, self.qualifiedReferenceSetsText, self.isAvailablePTExist, self.ParmeterTemplateModel, self.availableParameterTemplates, self.assignedPramenterTemplatesText);
			} else if (id == "editAssignmentHierarchy") {
				warningFlag = false;
			} else {
				warningFlag = true;
			}
		}

		self.revertTabChanges = function () {
			if (selectedHierarchyAssignmentEditTab == 'editReferenceSetsTemplates') {
				initializeReferenceSets();
				initializeTemplates();
			}
			isDownloadAutomationChanged = false;
			inheritFromParentHierarchyChanged = false;
			isDownloadOnChanged = false;
			isReferenceSetAssignmentChanged = false;
			initializeHierarchyTab();
			self.tabChange(presentSelectTab);
			$("#ParameterConfirmPopup").modal('hide');
			$("#btnSaveHierarchyAssignment").prop('disabled', true);
			self.IsChangesMadeToSave(false);
		}
		self.handleCloseEvent = function (unloadTempPopup) {
			isReferenceSetAssignmentChanged = false;
			unloadTempPopup('unloadTemplate', 'modelHierarchyAssignmentID');
			if (isReferenceSetTemplateChanged) {
				gridFilterClear("jqxgridHierarchyAssignment");
			} else {
				$("#jqxgridHierarchyAssignment").jqxGrid('updatebounddata');
			}
			isReferenceSetTemplateChanged = false;
		}
		self.hideErrorMessage = function (id) {
			$("#" + id).modal('hide');
		}
		//------view duplicate parameters-------
		self.viewDuplicateReferenceSetDetails = function () {
			$("#informationPopupParameter").modal('hide');
			$("#duplicateParameterTemplates").removeClass('hide');
			jqxgridDuplicateParameterTemplates(self.duplicateParameters, 'duplicateParameterTemplateGrid', self.isDuplicateTemplateAssignment);
		}
		self.viewInvalidParameterDetails = function () {
			$("#informationPopupParameter").modal('hide');
			$("#invalidParameterTemplate").removeClass('hide');
			jqxgridValidateParameterTemplates(self.invalidParameters, 'invalidParameterTemplateGrid');
		}

		self.isConfoPopUpActive = function (isConfo) {
			var downloadedOnConfoPopUpCheck = self.downloadedOn();
			var downloadAutomationConfoPopUpCheck = self.downloadAutomation();
			var autoSchedulingDuringMHBConfoPopUpCheck = self.autoSchedulingDuringMHB();

			var downloadAutomationConfoPopUpCheck = self.downloadAutomation();
			if (downloadedOnConfoPopUpCheck == "Next Maintenance Window") {
				downloadedOnConfoPopUpCheck = "Maintenance Window";
			} else if (downloadedOnConfoPopUpCheck == "Next Available Free Time Slot") {
				if (autoSchedulingDuringMHBConfoPopUpCheck == true) {
					downloadedOnConfoPopUpCheck = "Next available free time slot with Maintenance Window";
				} else if (autoSchedulingDuringMHBConfoPopUpCheck == false) {
					downloadedOnConfoPopUpCheck = "Next available free time slot";
				}
			} else if (downloadedOnConfoPopUpCheck == "Next Contact") {
				downloadedOnConfoPopUpCheck = "Next Contact";
			}

			// if (downloadAutomationConfoPopUpCheck == "true") {
			// downloadAutomationConfoPopUpCheck = true;
			// } else if (downloadAutomationConfoPopUpCheck == "false") {
			// downloadAutomationConfoPopUpCheck = false;
			// } 
			downloadAutomationConfoPopUpCheck = (downloadAutomationConfoPopUpCheck == "true") ? true : false;

			// if ((isChildExits == true) && ((downloadAutomationConfoPopUpCheck != downloadAutomationValue) || (downloadedOnConfoPopUpCheck != downloadedOn))) {
			// return true;
			// } else {
			// return false;
			// }
			if ((downloadAutomationConfoPopUpCheck != downloadAutomationValue) || (downloadedOnConfoPopUpCheck != downloadedOn)) {
				return true;
			} else {
				return false;
			}
		}

		//change function change from hierarchy
		self.chkFromHierarchyChange = function () {
			if ($("#chkFromHierarchy").is(':checked')) {
				self.checkedFromHierarchy(true);
				enableDisableInheritFromParent(1);
			} else if (!$("#chkFromHierarchy").is(':checked')) {
				inheritFromParentHierarchyChanged = false;
				$("#chkDownloadAutomation").prop('disabled', true);
				$("#chkDownloadAutomation").prop('checked', false);

				self.checkedFromHierarchy(false);
				enableDisableInheritFromParent(0);
				$("#btnSaveHierarchyAssignment").prop('disabled', true);
				self.IsChangesMadeToSave(false);
			}
			if (self.IsMultiEdit) {
				self.enableDisableSaveForMultiEdit();
			} else {
				self.enableDisableSaveButton();
			}

			if (!$("#chkFromHierarchy").is(':checked') && self.IsMultiEdit) {
				enableDisableDownloadAutomation(0);
				enableDisableDownloadOnCheckBox(0);
				enableDisableDownloadOnRadio(0);
			}
		}

		//self.changeInheritFromHierarchy = function () {
		//    inheritFromParentHierarchyChanged = true;
		//    if ($("#chkInheritFromHierarchy").is(':checked')) {
		//        enableDisableDownloadAutomation(1);
		//    } else if (!$("#chkInheritFromHierarchy").is(':checked')) {
		//    }
		//    if (self.IsMultiEdit) {
		//        self.enableDisableSaveForMultiEdit();
		//    } else {
		//        self.enableDisableSaveButton();
		//    }
		//}


		// On change
		$("#inheritYes").change(function () {
			if (self.IsMultiEdit) {
				if ($("#inheritYes").is(':checked')) {
					$("#chkDownloadAutomation").prop('disabled', true);
					$("#chkDownloadAutomation").prop('checked', false);
					enableDisableDownloadAutomation(0);
					enableDisableDownloadOnCheckBox(0);
					enableDisableDownloadOnRadio(0);
					enableDisableReferenceSets(1);
				}
			} else {
				if ($("#inheritYes").is(':checked')) {
					$("#chkDownloadAutomation").prop('disabled', true);
					enableDisableDownloadAutomation(0);
					enableDisableDownloadOnCheckBox(0);
					enableDisableDownloadOnRadio(0);
					enableDisableReferenceSets(1);
				}
			}

		});

		$("#inheritNo").change(function () {
			if (self.IsMultiEdit) {
				if ($("#inheritNo").is(':checked')) {
					$("#chkDownloadAutomation").prop('disabled', false);
					$("#chkDownloadAutomation").prop('checked', true);
					enableDisableDownloadAutomation(1);
					enableDisableDownloadOnCheckBox(1);
					enableDisableDownloadOnRadio(1);
					enableDisableReferenceSets(1);
				}
			} else {
				if ($("#inheritNo").is(':checked')) {
					$("#chkDownloadAutomation").prop('disabled', false);
					enableDisableDownloadAutomation(1);
					enableDisableDownloadOnCheckBox(1);
					enableDisableDownloadOnRadio(1);
					enableDisableReferenceSets(1);
				}
			}

		});

		self.inheritFromHierarchySelect = function () {
			if (self.IsMultiEdit) {
				inheritFromParentHierarchyChanged = true;
				self.enableDisableSaveForMultiEdit();
			} else {
				if ($("#inheritYes").is(':checked')) {
					validateIsInheritFromParent(self.hierarchyId, self.invalidParameters, self.IsChangesMadeToSave, inheritFromParentHierarchyChanged, self.enableDisableSaveButton);
				} else {
					inheritFromParentHierarchyChanged = true;
					self.enableDisableSaveButton();
					$('#invalidParameterTemplate').addClass('hide');
				}
			}
		}
		self.changeDownloadAutomation = function () {
			if ($("#chkDownloadAutomation").is(':checked')) {
				enableDisableDownloadAutomation(1);
			} else if (!$("#chkDownloadAutomation").is(':checked')) {
				enableDisableDownloadAutomation(0);
				self.downloadAutomation('');
				isDownloadAutomationChanged = false;
				isDownloadOnChanged = false;
				isReferenceSetAssignmentChanged = false;

				enableDisableDownloadOnCheckBox(0);
				enableDisableDownloadOnRadio(0);
				enableDisableReferenceSets(0);
				self.downloadedOn('')
				$("#chkDownloadOn").prop('checked', false);
				self.autoSchedulingDuringMHB(false);
			}
			if (self.IsMultiEdit) {
				self.enableDisableSaveForMultiEdit();
			} else {
				self.enableDisableSaveButton();
			}
		}

		//------get radiobutton checked value and show/disabled div------
		self.getValue = function () {
			if (self.downloadAutomation() == "true") {
				enableDisableDownloadOnCheckBox(1);
				enableDisableDownloadOnRadio(1);
				enableDisableReferenceSets(1);
				self.enableDisableOnOverWriteButton();
			} else if (self.downloadAutomation() == "false") {
				enableDisableDownloadOnCheckBox(0);
				enableDisableDownloadOnRadio(0);
				enableDisableReferenceSets(0);
				$("#chkoverwriteassignmentLbl").addClass('disabled');
				$("#chkoverwriteassignmentLbl").prop("disabled", true);
				$("#chkDownloadOn").prop('checked', false);
				isDownloadOnChanged = false;
				isReferenceSetAssignmentChanged = false;
			}

			//-----set hierarchyDAModified-------
			var downloadAutomation = self.downloadAutomation();
			if (downloadAutomation == "true") {
				downloadAutomation = true;
			} else {
				downloadAutomation = false;
			}

			if (downloadAutomationValue == downloadAutomation) {
				koUtil.downloadAutomationHierarchy = 0;
			} else {
				koUtil.downloadAutomationHierarchy = 1;
			}
			if (self.IsMultiEdit) {
				self.enableDisableSaveForMultiEdit();
			} else {
				self.enableDisableSaveButton();
			}
			return true;
		}

		self.changeDownloadOn = function () {
			if ($("#chkDownloadOn").is(':checked')) {
				enableDisableDownloadOnRadio(1);
			} else {
				enableDisableDownloadOnRadio(0);
			}
		}

		//------if Next Available Free Time Slot radio button is checked then checkbox is enabled.------
		self.getTimeSlotValue = function () {
			if (self.downloadedOn() == "Next Available Free Time Slot") {
				self.downloadedOn('Next Available Free Time Slot');
				self.autoSchedulingDuringMHB(true);
				$("#chkMaintaince").addClass("maintainceCheckbox");
				$("#chkMaintaince").removeClass("maintainceCheckbox disabled");
				$('#chkMaintaince').removeAttr('disabled');
			} else {
				self.autoSchedulingDuringMHB(false);
				$("#chkMaintaince").removeClass("maintainceCheckbox");
				$("#chkMaintaince").addClass("maintainceCheckbox disabled");
				$("#chkMaintaince").prop('disabled', true);
			}

			//-----set hierarchyDAModified-------
			var downloadOnValue = self.downloadedOn();
			if (downloadOnValue == 'Next Available Free Time Slot') {
				downloadOnValue = "Next available free time slot with Maintenance Window";
			} else if (downloadOnValue == 'Next Maintenance Window') {
				downloadOnValue = "Maintenance Window";
			} else {
				downloadOnValue = "Next Contact";
			}

			if (downloadedOn == downloadOnValue) {
				koUtil.downloadOnHierarchy = 0;
			} else {
				koUtil.downloadOnHierarchy = 1;
			}
			if (self.IsMultiEdit) {
				self.enableDisableSaveForMultiEdit();
			} else {
				self.enableDisableSaveButton();
			}
			return true;
		}
		//----------------------------------------------ENABLE-DISABLE-FUNCTIONALITY--------------------
		self.enableDisableSaveButton = function () {
			var downloadOnChangedValue = self.downloadedOn();

			if (downloadOnChangedValue == 'Next Available Free Time Slot') {
				downloadOnChangedValue = "Next available free time slot with Maintenance Window";
			} else if (downloadOnChangedValue == 'Next Maintenance Window') {
				downloadOnChangedValue = "Maintenance Window";
			} else {
				downloadOnChangedValue = "Next Contact";
			}
			var downloadAutomationEnableDisableSaveButton = self.downloadAutomation();// getting Current Value of Radio button

			var inheritFlagcheckboxEnableDisableSaveButton = self.checkedFromHierarchy();
			var downloadedOnEnableDisable = downloadedOn;
			var downloadAutomationValueEnableDisable = JSON.stringify(downloadAutomationValue);

			if (downloadAutomationValueEnableDisable == downloadAutomationEnableDisableSaveButton) {//For Downloaded Automation
				isDownloadAutomationChanged = false;
			} else {
				isDownloadAutomationChanged = true;
			}

			if (downloadedOnEnableDisable == downloadOnChangedValue) {//For Downloaded on
				isDownloadOnChanged = false;
			} else {
				isDownloadOnChanged = true;
			}

			if (globalVariableForHierarchyAssignment.IsInheritReferenceSet == inheritFlagcheckboxEnableDisableSaveButton) { //For inherit Reference from  parent Hierarchy 
				inheritFromParentHierarchyChanged = false;
			} else {
				inheritFromParentHierarchyChanged = true;
			}

			if (isDownloadAutomationChanged || isDownloadOnChanged || inheritFromParentHierarchyChanged || isReferenceSetAssignmentChanged || isPTAssignmentChanged) {
				$("#btnSaveHierarchyAssignment").prop('disabled', false);
				self.IsChangesMadeToSave(true);
			} else {
				$("#btnSaveHierarchyAssignment").prop('disabled', true);
				self.IsChangesMadeToSave(false);
			}
		}

		self.enableDisableSaveForMultiEdit = function () {
			if ($("#inheritYes").is(':checked') || $("#inheritNo").is(':checked')) {
				inheritFromParentHierarchyChanged = true;
			}

			if ($("#chkDownloadAutomation").is(':checked') && (self.downloadAutomation() == "true" || self.downloadAutomation() == "false")) {
				isDownloadAutomationChanged = true;
			}

			if ($("#chkDownloadOn").is(':checked') && (self.downloadedOn() == "Next Contact" || self.downloadedOn() == "Next Maintenance Window" || self.downloadedOn() == "Next Available Free Time Slot" || self.downloadedOn() == "Next available free time slot with Maintenance Window")) {
				isDownloadOnChanged = true;
			}

			if (isDownloadAutomationChanged || isDownloadOnChanged || inheritFromParentHierarchyChanged || isReferenceSetAssignmentChanged || isPTAssignmentChanged) {
				$("#btnSaveHierarchyAssignment").prop('disabled', false);
				self.IsChangesMadeToSave(true);
			} else {
				$("#btnSaveHierarchyAssignment").prop('disabled', true);
				self.IsChangesMadeToSave(false);
			}

		}

		self.enableDisableOnOverWriteButton = function () {
			if (self.referenceSetModel().length > 0) {
				$("#chkoverwriteassignmentLbl").removeClass('disabled');
				$("#chkoverwriteassignmentLbl").prop("disabled", false);
			} else {
				$("#chkoverwriteassignmentLbl").addClass('disabled');
				$("#chkoverwriteassignmentLbl").prop("disabled", true);

			}
		}

		//------set hierarchyDAmodified Flag on checkbox change value----------- 
		$(":input[type='checkbox']").on("change", function () {
			var autoSchedulingValue = $('#chkautoSchedulingDuringMHB').prop('checked');
			if (koUtil.downloadOnHierarchy == 0) {
				if (autoSchedulingDuringMHB == autoSchedulingValue) {
					koUtil.downloadOnHierarchy = 0;
				} else {
					koUtil.downloadOnHierarchy = 1;
				}
			}
			if (autoSchedulingValue) {
				downloadOnChangedValue = "Next available free time slot with Maintenance Window";
			} else {
				downloadOnChangedValue = "Next available free time slot";
			}

			if (!self.IsMultiEdit) {
				if (downloadedOn == downloadOnChangedValue) {
					isDownloadOnChanged = false;
				} else {
					isDownloadOnChanged = true;
				}
			}

			if (isDownloadOnChanged || isDownloadAutomationChanged || inheritFromParentHierarchyChanged || isReferenceSetAssignmentChanged || isPTAssignmentChanged) {
				$("#btnSaveHierarchyAssignment").prop('disabled', false);
				self.IsChangesMadeToSave(true);
			} else {
				$("#btnSaveHierarchyAssignment").prop('disabled', true);
				self.IsChangesMadeToSave(false);
			}
		});
		self.changeoverwriteassignment = function () {
			if ($("#chkoverwriteassignment").is(':checked')) {
				self.checkedOverriteAssignment(true);
			} else if (!$("#chkoverwriteassignment").is(':checked')) {
				self.checkedOverriteAssignment(false);
			}
		}

		self.cancelHierarchyChanges = function () {
			$('#warningHierarchyAssignment').modal('hide');
		}

		// Save parent hierarchy changes and show confirmation
		self.saveHierarchyAssignmentChanges = function (observableModelPopup) {
			if (selectedHierarchyAssignmentEditTab === 'editAssignmentHierarchy') {
				if ($("#inheritYes").is(':checked')) {
					$('#warningHierarchyAssignment').modal('show');
					$("#warningHierarchyAssignmentMsg").text(i18n.t('hierarchy_assignment_inherit_from_parent', { lng: lang }));
				} else {
					if ((isDownloadAutomationChanged || isDownloadOnChanged)) {
						if ((warningFlag == false)) {
							self.addHierarchyAssignmentClick(observableModelPopup);
						}
					} else {
						$('#warningHierarchyAssignment').modal('show');
						$("#warningHierarchyAssignmentMsg").text(i18n.t('hierarchy_assignment_warning', { lng: lang }));
					}
				}
			} else if (selectedHierarchyAssignmentEditTab === 'editReferenceSetsTemplates') {
				getAffectedDeviceCountByHierarchy(self.hierarchyIds, self.referenceSetModel(), self.IsMultiEdit, self.checkAll, self.selectedCount, self.unselectedCount, self.checkedOverriteAssignment());
			}
		}

		//Confirmation click
		self.addHierarchyAssignmentClick = function (observableModelPopup) {
			$('#warningHierarchyAssignment').modal('hide');
			var checkConfoPopup = self.isConfoPopUpActive();
			if ((checkConfoPopup === true && warningFlag === false) || self.IsMultiEdit) {
				$('#warningHierarchyAssignment').modal('show');
				$("#warningHierarchyAssignmentMsg").text(i18n.t('hierarchy_assignment_warning', { lng: lang }));
			} else {
				self.addHierarchyAssignment('jqxgridHierarchyAssignment', observableModelPopup);
			}
		}

		//IsOverWrite
		//------edit hierarchy assignment------
		self.addHierarchyAssignment = function (gID, observableModelPopup) {
			var tempArrayforSavedHierarchy = self.referenceSetModel();
			referenceSetArrayTocheck = [];
			for (var i = 0; i < tempArrayforSavedHierarchy.length; i++) {
				referenceSetArrayTocheck.push(tempArrayforSavedHierarchy[i]);
			}

			//if only Template changed
			if (!isReferenceSetAssignmentChanged && isPTAssignmentChanged === true) {
				AssignTemplateToHierarchy(selectedRowAvailableTemplates[0], self.hierarchyId, self.availableParameterTemplates, self.duplicateParameters, self.ParmeterTemplateModel, AppConstants.get('PARAMETERTEMPLATE_INSERT'), self.IsChangesMadeToSave, self.isDuplicateTemplateAssignment, self.referenceSetModel(), self.assignedPramenterTemplatesText, self.qualifiedReferenceSets());
			}
			else {
				//if RFS changed
				if ($("#downloadTrueId").is(':checked')) {
					downloadAutomationValue = true;
				}
				else if ($("#downloadFalseId").is(':checked')) {
					downloadAutomationValue = false;
				}
				if ($("#inheritYes").is(':checked')) {
					globalVariableForHierarchyAssignment.IsInheritReferenceSet = true;
				}
				else if ($("#inheritNo").is(':checked')) {
					globalVariableForHierarchyAssignment.IsInheritReferenceSet = false;
				}
				if ($("#contactId").is(':checked')) {
					downloadedOn = "Next Contact";
				}
				else if ($("#windowId").is(':checked')) {
					downloadedOn = "Maintenance Window";
				}
				else if ($("#timeSlotId").is(':checked')) {
					downloadedOn = "Next available free time slot";
				}
				setDetailsOfHierarchyAssignment(gID, observableModelPopup, self.hierarchyFullPath, self.hierarchyName, self.hierarchyId, self.downloadAutomation(), self.downloadedOn(), self.autoSchedulingDuringMHB(), self.referenceSetModel(), self.checkedOverriteAssignment(), self.IsMultiEdit, self.IsChangesMadeToSave, self.isAvailablePTExist, self.availableReferenceSet, self.referenceSetModel, self.qualifiedReferenceSets, self.qualifiedReferenceSetsText, selectedRowAvailableTemplates[0], self.availableParameterTemplates, self.duplicateParameters, self.ParmeterTemplateModel, AppConstants.get('PARAMETERTEMPLATE_INSERT'), self.isDuplicateTemplateAssignment, self.assignedPramenterTemplatesText);
			}

		}
		//------confirm Paramter Template assignment with count------
		self.closeInformationPopup = function () {
			$("#informationPTSavePopup").modal('hide');
		}
		//------confirm Paramter Template unassignment------
		self.unAssignParameterTemplate = function (gID, observableModelPopup) {
			unAssignTemplateToHierarchy(selectedRowAssignedTemplates[0], self.hierarchyId, self.availableParameterTemplates, self.ParmeterTemplateModel, 1);
		}

		/********** Reference Sets navigation starts **********/

		//move reference set from available to selected one at a time
		self.rightReferenceSetMove = function (gID) {
			StateEditHierarchy = $("#" + gID).jqxGrid('savestate');
			var referenceArr = self.referenceSetModel();
			var configValue = maximumReferenceSetsPerHierarchy;
			self.IsChangesMadeToSave(true);
			if (!_.isEmpty(selectedRowAvailableReferenceSets) && selectedRowAvailableReferenceSets.length > 0 && (StateEditHierarchy.selectedrowindex != -1)) {
				if (referenceArr.length >= configValue) {
					var msg = i18n.t('maximum_refrence', { lng: lang }) + " " + configValue;
					openAlertpopup(1, msg);
				} else {
					if (isRightPackagesClick == "No") {    //Selection row and State maintain In grid
						highlightedIndexAvailableReferenceSets = -1;
					} else {
						highlightedIndexAvailableReferenceSets = StateEditHierarchy.selectedrowindex;
					}

					self.referenceSetModel.push(selectedRowAvailableReferenceSets[0]);
					var selectedSource = _.where(self.availableReferenceSet(), { Name: selectedRowAvailableReferenceSets[0].Name });
					self.availableReferenceSet.remove(selectedSource[0]);

					fetchReferenceSets(self.availableReferenceSet, self.referenceSetModel);
					if (StateEditHierarchy) {
						$("#" + gID).jqxGrid('loadstate', StateEditHierarchy);
					}
					selectedRowAvailableReferenceSets = [];
					$("#btnMoveLeftAllReferenceSets").removeClass('disabled');
					$("#btnMoveLeftAllReferenceSets").prop('disabled', false);
					if (self.availableReferenceSet().length <= 0) {
						$("#btnMoveRightReferenceSet").addClass('disabled');
						$("#btnMoveRightReferenceSet").prop('disabled', true);
						$("#btnMoveUpReferenceSet").removeClass('disabled');
						$("#btnMoveUpReferenceSet").prop('disabled', false);
						$("#btnMoveDownReferenceSet").removeClass('disabled');
						$("#btnMoveDownReferenceSet").prop("disabled", false);
					} else {
						$("#btnMoveRightReferenceSet").removeClass('disabled');
						$("#btnMoveRightReferenceSet").prop('disabled', false);
					}

					selectedHighlightedRowForGrid(gID);  //Selection row and State maintain In grid
					self.enableDisableReferenceSetsNavigation();
				}
			} else {
				openAlertpopup(1, 'please_selct_row');
				self.enableDisableReferenceSetsNavigation();
			}
			self.enableDisableOnOverWriteButton();
		}

		//move reference set from selected to available one at a time
		self.leftReferenceSetMove = function (gID) {
			if (selectedRowAssignedReferenceSets.length > 0) {
				var selectedIndex = self.referenceSetModel().map(function (item) { return item.ReferenceSetId; }).indexOf(selectedRowAssignedReferenceSets[0].ReferenceSetId);
				self.referenceSetModel.splice(selectedIndex, 1);
				self.availableReferenceSet.push(selectedRowAssignedReferenceSets[0]);

				fetchReferenceSets(self.availableReferenceSet, self.referenceSetModel);
				selectedRowAssignedReferenceSets = [];

				if (self.referenceSetModel().length <= 0) {
					$("#btnMoveLeftReferenceSet").addClass('disabled');
					$("#btnMoveLeftReferenceSet").prop('disabled', true);
					$("#btnMoveLeftAllReferenceSets").addClass('disabled');
					$("#btnMoveLeftAllReferenceSets").prop('disabled', false);
					$("#btnMoveUpReferenceSet").addClass('disabled');
					$("#btnMoveUpReferenceSet").prop('disabled', true);
					$("#btnMoveDownReferenceSet").addClass('disabled');
					$("#btnMoveDownReferenceSet").prop("disabled", true);
				}

				if (self.referenceSetModel().length >= 2) {
					$("#btnMoveUpReferenceSet").removeClass('disabled');
					$("#btnMoveUpReferenceSet").prop('disabled', false);
					$("#btnMoveDownReferenceSet").removeClass('disabled');
					$("#btnMoveDownReferenceSet").prop("disabled", false);
				} else {
					$("#btnMoveUpReferenceSet").addClass('disabled');
					$("#btnMoveUpReferenceSet").prop('disabled', true);
					$("#btnMoveDownReferenceSet").addClass('disabled');
					$("#btnMoveDownReferenceSet").prop("disabled", true);
				}

				if (self.availableReferenceSet().length <= 0) {
					$("#btnMoveRightReferenceSet").addClass('disabled');
					$("#btnMoveRightReferenceSet").prop('disabled', true);
				} else {
					$("#btnMoveRightReferenceSet").removeClass('disabled');
					$("#btnMoveRightReferenceSet").prop('disabled', false);
				}

				if (StateEditHierarchy) {
					$("#" + gID).jqxGrid('loadstate', StateEditHierarchy);
				}
				selectedHighlightedRowForGrid(gID);
				self.enableDisableReferenceSetsNavigation();
			} else {
				openAlertpopup(1, 'please_selct_row');
				self.enableDisableReferenceSetsNavigation();
			}
			self.enableDisableOnOverWriteButton();
		}

		//move all reference sets from selected to available
		self.allReferenceSetsMove = function (gID) {
			var arr = self.referenceSetModel();
			if (arr.length > 0) {
				for (i = 0; i < arr.length; i++) {
					self.referenceSetModel([]);
					self.availableReferenceSet.push(arr[i]);
				}
				fetchReferenceSets(self.availableReferenceSet, self.referenceSetModel);

				$("#btnMoveLeftReferenceSet").addClass('disabled');
				$("#btnMoveLeftReferenceSet").prop('disabled', true);
				$("#btnMoveLeftAllReferenceSets").addClass('disabled');
				$("#btnMoveLeftAllReferenceSets").prop('disabled', true);
				$("#btnMoveUpReferenceSet").addClass('disabled');
				$("#btnMoveUpReferenceSet").prop('disabled', true);
				$("#btnMoveDownReferenceSet").addClass('disabled');
				$("#btnMoveDownReferenceSet").prop("disabled", true);
				$('#btnSaveHierarchyAssignment').removeAttr('disabled');
				self.IsChangesMadeToSave(true);
				isReferenceSetAssignmentChanged = true;
			}

			$('#' + gID).jqxGrid('updatebounddata');
			$('#' + gID).jqxGrid('clearselection');
			self.enableDisableReferenceSetsNavigation();
			self.enableDisableOnOverWriteButton();
			selectedRowAssignedReferenceSets = [];

			if (StateEditHierarchy) {
				$("#" + gID).jqxGrid('loadstate', StateEditHierarchy);
			}

			selectedHighlightedRowForGrid(gID);
		}

		//move selected reference set up
		self.moveItemsUP = function () {
			if (selectedRowAssignedReferenceSets.length > 0) {
				var arr = self.referenceSetModel();
				for (var i = 0; i < selectedRowAssignedReferenceSets.length; i++) {
					var index = getArrayIndexForKey(arr, 'Name', selectedRowAssignedReferenceSets[i].Name);
					arr.moveUp(arr[index]);
					self.referenceSetModel(arr);
				}
				gridAssignedReferenceSets(self.referenceSetModel(), 'jqxGridAssignedHierarchyReferenseSets');

				//-----buttom enabled/disabled depend on index and length of array------
				var arr = self.referenceSetModel();
				var selid = arr.length;
				//selid = selid - 1;               

				if (index == 1) {
					if (selid == 1) {
						$("#btnMoveDownReferenceSet").addClass('disabled');
						$("#btnMoveDownReferenceSet").prop("disabled", true);
						$("#btnMoveUpReferenceSet").addClass('disabled');
						$("#btnMoveUpReferenceSet").prop('disabled', true);
					} else {
						$("#btnMoveDownReferenceSet").removeClass('disabled');
						$("#btnMoveDownReferenceSet").prop("disabled", false);
						$("#btnMoveUpReferenceSet").addClass('disabled');
						$("#btnMoveUpReferenceSet").prop('disabled', true);
					}
				} else if (index == selid) {
					$("#btnMoveDownReferenceSet").addClass('disabled');
					$("#btnMoveDownReferenceSet").prop("disabled", true);
					$("#btnMoveUpReferenceSet").removeClass('disabled');
					$("#btnMoveUpReferenceSet").prop('disabled', false);

				} else {
					$("#btnMoveDownReferenceSet").removeClass('disabled');
					$("#btnMoveDownReferenceSet").prop("disabled", false);
					$("#btnMoveUpReferenceSet").removeClass('disabled');
					$("#btnMoveUpReferenceSet").prop('disabled', false);
				}
				self.enableDisableReferenceSetsNavigation();
			} else {
				openAlertpopup(1, 'please_selct_row');
			}
		}

		//move selected reference set down
		self.moveItemsDown = function () {
			if (selectedRowAssignedReferenceSets.length > 0) {
				var arr = self.referenceSetModel();
				for (var i = selectedRowAssignedReferenceSets.length - 1; i >= 0; i--) {
					var index = getArrayIndexForKey(arr, 'Name', selectedRowAssignedReferenceSets[i].Name);
					arr.moveDown(arr[index]);
					self.referenceSetModel(arr);
				}
				gridAssignedReferenceSets(self.referenceSetModel(), 'jqxGridAssignedHierarchyReferenseSets');

				//-----buttom enabled/disabled depend on index and length of array------
				var arr = self.referenceSetModel();
				var selid = arr.length;
				selid = selid - 1;
				index = index + 1;

				if (index == 0) {
					if (selid == 1) {
						$("#btnMoveDownReferenceSet").addClass('disabled');
						$("#btnMoveDownReferenceSet").prop("disabled", true);
						$("#btnMoveUpReferenceSet").addClass('disabled');
						$("#btnMoveUpReferenceSet").prop('disabled', true);
					} else {
						$("#btnMoveDownReferenceSet").removeClass('disabled');
						$("#btnMoveDownReferenceSet").prop("disabled", false);
						$("#btnMoveUpReferenceSet").addClass('disabled');
						$("#btnMoveUpReferenceSet").prop('disabled', true);
					}
				} else if (index == selid) {
					$("#btnMoveDownReferenceSet").addClass('disabled');
					$("#btnMoveDownReferenceSet").prop("disabled", true);
					$("#btnMoveUpReferenceSet").removeClass('disabled');
					$("#btnMoveUpReferenceSet").prop('disabled', false);

				} else {
					$("#btnMoveDownReferenceSet").removeClass('disabled');
					$("#btnMoveDownReferenceSet").prop("disabled", false);
					$("#btnMoveUpReferenceSet").removeClass('disabled');
					$("#btnMoveUpReferenceSet").prop('disabled', false);
				}
				self.enableDisableReferenceSetsNavigation();
			} else {
				openAlertpopup(1, 'please_selct_row');
			}
		}
		/********** Reference Sets navigation ends **********/

		/********** Parameter Templates navigation starts **********/

		//move parameter template from available to selected one at a time
		self.rightTemplateMove = function (gID) {
			StateEditHierarchy = $("#" + gID).jqxGrid('savestate');
			if (selectedRowAvailableTemplates.length > 0 && (StateEditHierarchy.selectedrowindex != -1)) {
				if (isRightPackagesClick == "No") {    //Selection row and State maintain In grid
					highlightedIndexAvailableTemplates = undefined;
				} else {
					highlightedIndexAvailableTemplates = StateEditHierarchy.selectedrowindex;
				}
				$("#duplicateParameterTemplates").addClass('hide');
				AssignTemplateToHierarchy(selectedRowAvailableTemplates[0], self.hierarchyId, self.availableParameterTemplates, self.duplicateParameters, self.ParmeterTemplateModel, AppConstants.get('PARAMETERTEMPLATE_VALIDATE'), self.IsChangesMadeToSave, self.isDuplicateTemplateAssignment, self.referenceSetModel(), self.assignedPramenterTemplatesText, self.qualifiedReferenceSets());
				if (StateEditHierarchy) {
					$("#" + gID).jqxGrid('loadstate', StateEditHierarchy);
				}
				selectedRowAvailableTemplates = [];
				selectedHighlightedRowForGrid(gID);
			} else {
				openAlertpopup(1, 'please_selct_row');
				self.enableDisableTemplateNavigation();
			}
			self.enableDisableOnOverWriteButton();
		}

		//move parameter templates from selected to available one at a time
		self.leftTemplateMove = function (gID) {
			if (selectedRowAssignedTemplates.length > 0) {
				//unAssignTemplateToHierarchy(selectedRowAssignedTemplates[0], self.hierarchyId, self.availableParameterTemplates, self.ParmeterTemplateModel, 0);
				selectedRowAssignedTemplates[0].IsUnAssigned = true;
				var selectedTemplate = _.where(self.ParmeterTemplateModel(), { TemplateId: selectedRowAssignedTemplates[0].TemplateId, ReferenceSetId: selectedRowAssignedTemplates[0].ReferenceSetId });
				if (!_.isEmpty(selectedTemplate) && selectedTemplate.length > 0) { //different template for same or different RFS
					var selectedIndex = self.ParmeterTemplateModel().findIndex(function (item) { return item.TemplateId === selectedTemplate[0].TemplateId && item.ReferenceSetId === selectedTemplate[0].ReferenceSetId });
					self.availableParameterTemplates.push(selectedRowAssignedTemplates[0]);
					self.ParmeterTemplateModel.splice(selectedIndex, 1);
				} else {
					return;
				}

				fetchTemplates(self.availableParameterTemplates, self.ParmeterTemplateModel);
				selectedRowAssignedTemplates = [];

				$("#btnMoveLeftHierarchyTemplate").addClass('disabled');
				$("#btnMoveLeftHierarchyTemplate").prop('disabled', true);
				if (StateEditHierarchy) {
					$("#" + gID).jqxGrid('loadstate', StateEditHierarchy);
				}
				selectedHighlightedRowForGrid(gID);
				self.enableDisableTemplateNavigation();
			} else {
				openAlertpopup(1, 'please_selct_row');
				self.enableDisableTemplateNavigation();

			}
			self.enableDisableOnOverWriteButton();
		}
		/********** Parameter Templates navigation ends **********/

		//------selected row highlighted and get row data------
		self.selectedRowData = function (data, index, selectedid) {
			//$("#selectedAssignmentId").children('tr').css('background-color', '');
			$("#" + selectedid).children('tr').removeClass('refselection');
			$("#btnMoveLeftReferenceSet").removeClass('disabled');
			$("#btnMoveLeftReferenceSet").prop('disabled', false);
			$("#btnMoveLeftHierarchyTemplate").removeClass('disabled');
			$("#btnMoveLeftHierarchyTemplate").prop('disabled', false);
			var id = '';
			if (selectedid == 'selectedParameterAssignmentId') {
				id = '#SelectTemplatePackrow' + index + '';
			} else {
				id = '#SelectPackrow' + index + '';
			}

			$(id).addClass('refselection');
			selectedRowAssignedReferenceSets = [];
			selectedRowAssignedReferenceSets.push(data);
			rowIdForHighlightedForTable = index;
			//-----buttom enabled/disabled depend on index and length of array------
			var arr = self.referenceSetModel();
			var selid = arr.length;
			selid = selid - 1;

			if (index == 0) {
				if (selid == 0) {
					$("#btnMoveDownReferenceSet").addClass('disabled');
					$("#btnMoveDownReferenceSet").prop("disabled", true);
					$("#btnMoveUpReferenceSet").addClass('disabled');
					$("#btnMoveUpReferenceSet").prop('disabled', true);
				} else {
					$("#btnMoveDownReferenceSet").removeClass('disabled');
					$("#btnMoveDownReferenceSet").prop("disabled", false);
					$("#btnMoveUpReferenceSet").addClass('disabled');
					$("#btnMoveUpReferenceSet").prop('disabled', true);
				}
			} else if (index == selid) {
				$("#btnMoveDownReferenceSet").addClass('disabled');
				$("#btnMoveDownReferenceSet").prop("disabled", true);
				$("#btnMoveUpReferenceSet").removeClass('disabled');
				$("#btnMoveUpReferenceSet").prop('disabled', false);

			} else {
				$("#btnMoveDownReferenceSet").removeClass('disabled');
				$("#btnMoveDownReferenceSet").prop("disabled", false);
				$("#btnMoveUpReferenceSet").removeClass('disabled');
				$("#btnMoveUpReferenceSet").prop('disabled', false);
			}
		}

		self.viewQualifiedReferenceSetDetails = function () {
			if ($("#qualifiedDetails").hasClass('icon-angle-down')) {
				$("#qualifiedReferencesetDetails").removeClass('hide');
				$("#qualifiedDetails").removeClass('icon-angle-down');
				$("#qualifiedDetails").addClass('icon-angle-up');
				if (isQualifiedReferenceSetDetailsExist == false) {
					modalGetQualifiedRefereceSetDetails(self.hierarchyId, koUtil.GlobalColumnFilter);
					isQualifiedReferenceSetDetailsExist = true;
				}
			} else if ($("#qualifiedDetails").hasClass('icon-angle-up')) {
				$("#qualifiedReferencesetDetails").addClass('hide');
				$("#qualifiedDetails").removeClass('icon-angle-up')
				$("#qualifiedDetails").addClass('icon-angle-down')
			}
		}
		self.viewQualifiedParameterTemplateDetails = function () {
			if ($("#qualifiedPTDetails").hasClass('icon-angle-down')) {
				$("#qualifiedParamenterTemplateDetails").removeClass('hide');
				$("#qualifiedPTDetails").removeClass('icon-angle-down');
				$("#qualifiedPTDetails").addClass('icon-angle-up');
				if (isQualifiedParameterTemplateDetailsExist == false) {
					modalGetQualifiedParameterTemplateDetails(self.hierarchyId, koUtil.GlobalColumnFilter);
					isQualifiedParameterTemplateDetailsExist = true;
				}
			} else if ($("#qualifiedPTDetails").hasClass('icon-angle-up')) {
				$("#qualifiedParamenterTemplateDetails").addClass('hide');
				$("#qualifiedPTDetails").removeClass('icon-angle-up')
				$("#qualifiedPTDetails").addClass('icon-angle-down')
			}
		}

		//--------------------------------------------------ENABLE DISABLE ON LEFT MOVE RIGHT MOVE AND ALL LEFT MOVE REFERENCESET ASSIGNMENT------------------------------

		self.enableDisableReferenceSetsNavigation = function () {

			var CheckSameRefId = 0;
			var referenceSetArray = self.referenceSetModel();
			if (referenceSetArrayTocheck.length != referenceSetArray.length) {
				isReferenceSetAssignmentChanged = true;
			} else {
				for (var i = 0; i < referenceSetArray.length; i++) {
					if (referenceSetArrayTocheck[i].ReferenceSetId == referenceSetArray[i].ReferenceSetId) {
						CheckSameRefId++;
					} else {
						CheckSameRefId = 0;
					}
				}
				if (referenceSetArrayTocheck.length == CheckSameRefId)
					isReferenceSetAssignmentChanged = false;
				else
					isReferenceSetAssignmentChanged = true;
			}

			if (isDownloadOnChanged || isDownloadAutomationChanged || inheritFromParentHierarchyChanged || isReferenceSetAssignmentChanged) {
				self.IsChangesMadeToSave(true);
				$("#btnSaveHierarchyAssignment").removeAttr('disabled');
			} else {
				self.IsChangesMadeToSave(false);
				$("#btnSaveHierarchyAssignment").prop('disabled', true);
			}
		}
		//--------------------------------------------------ENABLE DISABLE ON LEFT MOVE RIGHT MOVE AND ALL LEFT MOVE FOR PARAMETER ASSIGNMENT------------------------------

		self.enableDisableTemplateNavigation = function () {

			var CheckSameRefId = 0;
			var parmetersSetArray = self.ParmeterTemplateModel();
			if (parameterTemplateArrayToCheck.length != parmetersSetArray.length) {
				isPTAssignmentChanged = true;
			} else {
				for (var i = 0; i < parmetersSetArray.length; i++) {
					if (parameterTemplateArrayToCheck[i].TemplateId == parmetersSetArray[i].TemplateId) {
						CheckSameRefId++;
					} else {
						CheckSameRefId = 0;
					}
				}
				if (parameterTemplateArrayToCheck.length == CheckSameRefId) {
					isPTAssignmentChanged = false;
				} else {
					isPTAssignmentChanged = true;
				}

			}
			if (isPTAssignmentChanged) {
				$("#btnSaveHierarchyAssignment").prop('disabled', false);
				self.IsChangesMadeToSave(true);
			} else {
				$("#btnSaveHierarchyAssignment").prop('disabled', true);
				self.IsChangesMadeToSave(false);
			}
		}

		function fetchReferenceSets(availableReferenceSets, assignedReferenceSets) {
			if (availableReferenceSets() && availableReferenceSets().length > 0) {
				gridAvailableReferenceSets(availableReferenceSets(), 'jqxGridAvailableHierarchyReferenceSets');
			} else {
				gridAvailableReferenceSets([], 'jqxGridAvailableHierarchyReferenceSets');
			}

			if (assignedReferenceSets() && assignedReferenceSets().length > 0) {
				gridAssignedReferenceSets(assignedReferenceSets(), 'jqxGridAssignedHierarchyReferenseSets');
			} else {
				gridAssignedReferenceSets([], 'jqxGridAssignedHierarchyReferenseSets');
			}

			self.loadTemplates();
		}

		self.loadTemplates = function () {
			getAvailableParameterTemplates(self.referenceSetModel(), self.hierarchyId, self.availableParameterTemplates, self.ParmeterTemplateModel, self.assignedPramenterTemplatesText, self.qualifiedReferenceSets());
		}

		seti18nResourceData(document, resourceStorage);
	};

	function selectedRowDataAvailable(gId, data) {
		if (gId === 'jqxGridAvailableHierarchyReferenceSets') {
			selectedRowAvailableReferenceSets = [];
			selectedRowAvailableReferenceSets.push(data);

			$("#btnMoveRightReferenceSet").removeClass('disabled');
			$("#btnMoveRightReferenceSet").prop('disabled', false);
		} else if (gId === 'jqxGridAvailableHierarchyTemplates') {
			selectedRowAvailableTemplates = [];
			selectedRowAvailableTemplates.push(data);

			$("#btnMoveRightHierarchyTemplate").removeClass('disabled');
			$("#btnMoveRightHierarchyTemplate").prop('disabled', false);
		}
	}

	function selectedRowDataAssigned(gId, assignedReferenceSets, data) {
		if (gId === 'jqxGridAssignedHierarchyReferenseSets') {
			selectedRowAssignedReferenceSets = [];
			selectedRowAssignedReferenceSets.push(data);

			$("#btnMoveLeftReferenceSet").removeClass('disabled');
			$("#btnMoveLeftReferenceSet").prop('disabled', false);

			//-----buttom enabled/disabled depend on index and length of array------
			var selid = assignedReferenceSets.length;
			selid = selid - 1;
			if (highlightedIndexAvailableReferenceSets == 0) {
				if (selid == 0) {
					$("#btnMoveDownReferenceSet").addClass('disabled');
					$("#btnMoveDownReferenceSet").prop("disabled", true);
					$("#btnMoveUpReferenceSet").addClass('disabled');
					$("#btnMoveUpReferenceSet").prop('disabled', true);
				} else {
					$("#btnMoveDownReferenceSet").removeClass('disabled');
					$("#btnMoveDownReferenceSet").prop("disabled", false);
					$("#btnMoveUpReferenceSet").addClass('disabled');
					$("#btnMoveUpReferenceSet").prop('disabled', true);
				}
			} else if (highlightedIndexAvailableReferenceSets == selid) {
				$("#btnMoveDownReferenceSet").addClass('disabled');
				$("#btnMoveDownReferenceSet").prop("disabled", true);
				$("#btnMoveUpReferenceSet").removeClass('disabled');
				$("#btnMoveUpReferenceSet").prop('disabled', false);

			} else {
				$("#btnMoveDownReferenceSet").removeClass('disabled');
				$("#btnMoveDownReferenceSet").prop("disabled", false);
				$("#btnMoveUpReferenceSet").removeClass('disabled');
				$("#btnMoveUpReferenceSet").prop('disabled', false);
			}
		} else if (gId === 'jqxGridAssignedHierarchyTemplates') {
			selectedRowAssignedTemplates = [];
			selectedRowAssignedTemplates.push(data);

			$("#btnMoveLeftHierarchyTemplate").removeClass('disabled');
			$("#btnMoveLeftHierarchyTemplate").prop('disabled', false);
		}
	}

	//------ Function Selection of Highlighted element------For Grid
	function selectedHighlightedRowForGrid(gID) {   //Selection row and State maintain In grid
		var datainformations = $("#" + gID).jqxGrid('getdatainformation');
		var rowscounts = datainformations.rowscount;
		if (rowscounts > 0) {
			if (gID === 'jqxGridAvailableHierarchyReferenceSets') {
				if (highlightedIndexAvailableReferenceSets == undefined || highlightedIndexAvailableReferenceSets == -1) {
					$('#' + gID).jqxGrid('clearselection');
					selectedRowAvailableReferenceSets = [];
				} else if (highlightedIndexAvailableReferenceSets == rowscounts) {
					highlightedIndexAvailableReferenceSets = highlightedIndexAvailableReferenceSets - 1;
					$('#' + gID).jqxGrid('selectrow', highlightedIndexAvailableReferenceSets);
				} else {
					$('#' + gID).jqxGrid('selectrow', highlightedIndexAvailableReferenceSets);
				}

				$("#btnMoveRightReferenceSet").removeClass('disabled');
				$("#btnMoveRightReferenceSet").prop('disabled', false);
			} else if (gID === 'jqxGridAssignedHierarchyReferenseSets') {
				if (highlightedIndexAssignedReferenceSets == undefined || highlightedIndexAssignedReferenceSets == -1) {
					$('#' + gID).jqxGrid('clearselection');
					selectedRowAssignedReferenceSets = [];
				} else if (highlightedIndexAssignedReferenceSets == rowscounts) {
					highlightedIndexAssignedReferenceSets = highlightedIndexAssignedReferenceSets - 1;
					$('#' + gID).jqxGrid('selectrow', highlightedIndexAssignedReferenceSets);
				} else {
					$('#' + gID).jqxGrid('selectrow', highlightedIndexAssignedReferenceSets);
				}

				$("#btnMoveLeftReferenceSet").removeClass('disabled');
				$("#btnMoveLeftReferenceSet").prop('disabled', false);
				$("#btnMoveLeftAllReferenceSets").removeClass('disabled');
				$("#btnMoveLeftAllReferenceSets").prop('disabled', false);
			} else if (gID === 'jqxGridAvailableHierarchyTemplates') {
				if (highlightedIndexAvailableTemplates == undefined || highlightedIndexAvailableTemplates == -1) {
					$('#' + gID).jqxGrid('clearselection');
					selectedRowAvailableTemplates = [];
				} else if (highlightedIndexAvailableTemplates == rowscounts) {
					highlightedIndexAvailableTemplates = highlightedIndexAvailableTemplates - 1;
					$('#' + gID).jqxGrid('selectrow', highlightedIndexAvailableTemplates);
				} else {
					$('#' + gID).jqxGrid('selectrow', highlightedIndexAvailableTemplates);
				}

				$("#btnMoveRightHierarchyTemplate").removeClass('disabled');
				$("#btnMoveRightHierarchyTemplate").prop('disabled', false);
			} else if (gID === 'jqxGridAssignedHierarchyTemplates') {
				if (highlightedIndexAssignedTemplates == undefined || highlightedIndexAssignedTemplates == -1) {
					$('#' + gID).jqxGrid('clearselection');
					selectedRowAssignedTemplates = [];
				} else if (highlightedIndexAssignedTemplates == rowscounts) {
					highlightedIndexAssignedTemplates = highlightedIndexAssignedTemplates - 1;
					$('#' + gID).jqxGrid('selectrow', highlightedIndexAssignedTemplates);
				} else {
					$('#' + gID).jqxGrid('selectrow', highlightedIndexAssignedTemplates);
				}

				$("#btnMoveLeftHierarchyTemplate").removeClass('disabled');
				$("#btnMoveLeftHierarchyTemplate").prop('disabled', false);
			}
		} else {
			if (gID === 'jqxGridAvailableHierarchyReferenceSets') {
				$("#btnMoveRightReferenceSet").addClass('disabled');
				$("#btnMoveRightReferenceSet").prop('disabled', true);
			} else if (gID === 'jqxGridAssignedHierarchyReferenseSets') {
				$("#btnMoveLeftReferenceSet").addClass('disabled');
				$("#btnMoveLeftReferenceSet").prop('disabled', true);
				$("#btnMoveLeftAllReferenceSets").addClass('disabled');
				$("#btnMoveLeftAllReferenceSets").prop('disabled', true);
			} else if (gID === 'jqxGridAvailableHierarchyTemplates') {
				$("#btnMoveRightHierarchyTemplate").addClass('disabled');
				$("#btnMoveRightHierarchyTemplate").prop('disabled', true);
			} else if (gID === 'jqxGridAssignedHierarchyTemplates') {
				$("#btnMoveLeftHierarchyTemplate").addClass('disabled');
				$("#btnMoveLeftHierarchyTemplate").prop('disabled', true);
			}
		}
	}

	function fetchTemplates(availableHierarchyTemplates, assignedHierarchyTemplates) {
		var availableTemplateComponent = '';
		availableTemplateComponent += '<div id="jqxGridAvailableHierarchyTemplates"></div>';
		$("#availableHierarchyTemplatesDiv").empty();
		$("#availableHierarchyTemplatesDiv").append(availableTemplateComponent);
		if (availableHierarchyTemplates() && availableHierarchyTemplates().length > 0) {
			gridAvailableHierarchyTemplates(availableHierarchyTemplates(), 'jqxGridAvailableHierarchyTemplates');
		} else {
			gridAvailableHierarchyTemplates([], 'jqxGridAvailableHierarchyTemplates');
		}
		selectedHighlightedRowForGrid('jqxGridAvailableHierarchyTemplates');

		var assignedTemplateComponent = '';
		assignedTemplateComponent += '<div id="jqxGridAssignedHierarchyTemplates"></div>';
		$("#assignedHierarchyTemplatesDiv").empty();
		$("#assignedHierarchyTemplatesDiv").append(assignedTemplateComponent);
		if (assignedHierarchyTemplates() && assignedHierarchyTemplates().length > 0) {
			gridAssignedHierarchyTemplates(assignedHierarchyTemplates(), 'jqxGridAssignedHierarchyTemplates');
		} else {
			gridAssignedHierarchyTemplates([], 'jqxGridAssignedHierarchyTemplates');
		}
	}


	//------display available reference set data------
	function gridAvailableReferenceSets(availableReferenceSet, gID) {
		var source =
		{
			dataType: "json",
			localdata: availableReferenceSet,
			datafields: [
				{ name: 'ReferenceSetId', map: 'ReferenceSetId' },
				{ name: 'Name', map: 'Name' },
				{ name: 'SupportedPackages', map: 'SupportedPackages' },
				{ name: 'Status', map: 'Status' }
			]
		};
		var dataAdapter = new $.jqx.dataAdapter(source);

		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		}

		var buildFilterPanelMultiChoice = function (filterPanel, datafield, checkArr) {
			multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gID, checkArr, true);
		}

		var statusCellRenderer = function (row, column, value, defaultHtml) {
			var rowData = $("#" + gID).jqxGrid('getrowdata', row);
			var text = "Status: ";
			if (value == "Active") {
				defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
			}
			if (value == "Inactive") {
				defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg inactive_Orange"></div></a>' + value + '</span></div>';
			}
			return defaultHtml;
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
						text: i18n.t('rs_refrence_set', { lng: lang }), datafield: 'Name', width: 140, minwidth: 140, editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('rs_packages', { lng: lang }), datafield: 'SupportedPackages', width: 140, minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('rs_statsus', { lng: lang }), datafield: 'Status', resizable: false, minwidth: 80, editable: false, cellsrenderer: statusCellRenderer,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							var checkArr = getMultiCoiceFilterArr('ReferenceSet Status');
							buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
						}
					},
				]
			}).on({
				filter: function (e) {
					selectedRowAvailableReferenceSets = [];
					gridSetRowDetailsAssignedReferenceSets(e, gID);
					highlightedIndexAvailableReferenceSets = -1;
				}
			});


		$("#" + gID).bind('rowselect', function (event) {
			var selectedRow = new Object();
			var datainformations = $("#" + gID).jqxGrid('getdatainformation');
			var rowscounts = datainformations.rowscount;

			selectedRow.ReferenceSetId = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ReferenceSetId');
			selectedRow.Name = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'Name');
			selectedRow.SupportedPackages = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'SupportedPackages');
			selectedRow.Status = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'Status');
			highlightedIndexAvailableReferenceSets = event.args.rowindex;
			if ((rowscounts - 1) == highlightedIndexAvailableReferenceSets) {
				isRightPackagesClick = "No";
			} else {
				isRightPackagesClick = "Yes";
			}

			selectedRowDataAvailable(gID, selectedRow);
		});
	}

	function gridAssignedReferenceSets(assignedReferenceSets, gID) {
		var source =
		{
			dataType: "json",
			localdata: assignedReferenceSets,
			datafields: [
				{ name: 'ReferenceSetId', map: 'ReferenceSetId' },
				{ name: 'Name', map: 'Name' },
				{ name: 'SupportedPackages', map: 'SupportedPackages' },
				{ name: 'Status', map: 'Status' }
			]
		};
		var dataAdapter = new $.jqx.dataAdapter(source);

		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		}

		var buildFilterPanelMultiChoice = function (filterPanel, datafield, checkArr) {
			multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gID, checkArr, true);
		}

		var statusCellRenderer = function (row, column, value, defaultHtml) {
			var rowData = $("#" + gID).jqxGrid('getrowdata', row);
			var text = "Status: ";
			if (value == "Active") {
				defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
			}
			if (value == "Inactive") {
				defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg inactive_Orange"></div></a>' + value + '</span></div>';
			}
			return defaultHtml;
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
						text: i18n.t('rs_refrence_set', { lng: lang }), datafield: 'Name', width: 140, minwidth: 140, editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('rs_packages', { lng: lang }), datafield: 'SupportedPackages', width: 140, minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('rs_statsus', { lng: lang }), datafield: 'Status', resizable: false, minwidth: 80, editable: false, cellsrenderer: statusCellRenderer,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							var checkArr = getMultiCoiceFilterArr('ReferenceSet Status');
							buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
						}
					}
				]
			}).on({
				filter: function (e) {
					selectedRowAvailable = [];
					gridSetRowDetailsAvailableReferenceSets(e, gID);
					highlightedIndexAssignedReferenceSets = -1;
				}
			});

		$("#" + gID).bind('rowselect', function (event) {
			var selectedRow = new Object();
			var datainformations = $("#" + gID).jqxGrid('getdatainformation');
			var rowscounts = datainformations.rowscount;

			selectedRow.ReferenceSetId = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ReferenceSetId');
			selectedRow.Name = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'Name');
			selectedRow.SupportedPackages = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'SupportedPackages');
			selectedRow.Status = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'Status');
			highlightedIndexAssignedReferenceSets = event.args.rowindex;
			if ((rowscounts - 1) == highlightedIndexAssignedReferenceSets) {
				isRightPackagesClick = "No";
			} else {
				isRightPackagesClick = "Yes";
			}
			selectedRowDataAssigned(gID, assignedReferenceSets, selectedRow);
		});
	}

	function getReferenceSets(hierarchyId, availableReferenceSet, referenceSetModel, qualifiedReferenceSets, qualifiedReferenceSetsText, isAvailablePTExist, parmeterTemplateModel, availableParameterTemplates, assignedPramenterTemplatesText) {
		var getReferenceSetsReq = new Object();
		var Export = new Object();
		var Pagination = new Object();
		var Selector = new Object();
		var ColumnSortFilter = new Object();

		Export.DynamicColumns = null;
		Export.IsAllSelected = false;
		Export.IsExport = false;

		Pagination.HighLightedItemId = null;
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

		var selectedItems = getSelectedUniqueId('jqxgridHierarchyAssignment');
		var unselectedItems = getUnSelectedUniqueId('jqxgridHierarchyAssignment');
		var checkAll = checkAllSelected('jqxgridHierarchyAssignment');

		Selector.SelectedItemIds = selectedItems;
		Selector.UnSelectedItemIds = null;

		ColumnSortFilter.GridId = "ReferenceSet";

		getReferenceSetsReq.ColumnSortFilter = ColumnSortFilter;
		getReferenceSetsReq.Export = Export;
		getReferenceSetsReq.FetchMode = ENUM.get('All');
		getReferenceSetsReq.HierarchyId = hierarchyId;
		getReferenceSetsReq.IsActive = false;
		getReferenceSetsReq.ModelId = null;
		getReferenceSetsReq.Pagination = Pagination;
		getReferenceSetsReq.Selector = Selector;

		function callbackFunction(data, error) {
			$("#loadingDiv").hide();
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.getReferenceSetsResp) {
						data.getReferenceSetsResp = $.parseJSON(data.getReferenceSetsResp);

						koUtil.availableArr([]);
						availableReferenceSet([]);
						if (data.getReferenceSetsResp.ReferenceSets && data.getReferenceSetsResp.ReferenceSets.length > 0) {
							for (var k = 0; k < data.getReferenceSetsResp.ReferenceSets.length; k++) {
								koUtil.availableArr()[k] = data.getReferenceSetsResp.ReferenceSets[k];
							}
							availableReferenceSet(data.getReferenceSetsResp.ReferenceSets);
						}

						// ------ for reference set tabel --------
						referenceSetModel([]);
						referenceSetArrayTocheck = [];
						if (data.getReferenceSetsResp.HierarchyReferenceSets && data.getReferenceSetsResp.HierarchyReferenceSets.length > 0) {
							koUtil.referenceSetArr = data.getReferenceSetsResp.HierarchyReferenceSets;
							assignedReferenceSets = new Array();
							for (var k = 0; k < data.getReferenceSetsResp.HierarchyReferenceSets.length; k++) {
								referenceSetArrayTocheck[k] = data.getReferenceSetsResp.HierarchyReferenceSets[k];
								assignedReferenceSets.push(data.getReferenceSetsResp.HierarchyReferenceSets[k].ReferenceSetId);
							}
							referenceSetModel(data.getReferenceSetsResp.HierarchyReferenceSets);
							$("#btnMoveLeftAllReferenceSets").prop('disabled', false);
							$("#btnMoveLeftAllReferenceSets").removeClass('disabled');
						}

						var qualifiedrfstext = '';
						if (data.getReferenceSetsResp.QualifiedReferenceSets && data.getReferenceSetsResp.QualifiedReferenceSets.length > 0) {
							qualifiedReferenceSets(data.getReferenceSetsResp.QualifiedReferenceSets);
							for (var k = 0; k < data.getReferenceSetsResp.QualifiedReferenceSets.length; k++) {
								qualifiedrfstext = qualifiedrfstext + ',' + data.getReferenceSetsResp.QualifiedReferenceSets[k].Name;
							}
							qualifiedrfstext = qualifiedrfstext.substring(1, qualifiedrfstext.length);
							qualifiedReferenceSetsText(qualifiedrfstext);
						}

						gridAvailableReferenceSets(availableReferenceSet(), 'jqxGridAvailableHierarchyReferenceSets');
						gridAssignedReferenceSets(referenceSetModel(), 'jqxGridAssignedHierarchyReferenseSets');
						if (isAvailablePTExist() === false) {
							getAvailableParameterTemplates(referenceSetModel(), hierarchyId, availableParameterTemplates, parmeterTemplateModel, assignedPramenterTemplatesText, qualifiedReferenceSets());
							isAvailablePTExist(true);
						}
					}
				}
			}
		}

		var method = 'GetReferenceSets';
		var params = '{"token":"' + TOKEN() + '","getReferenceSetsReq":' + JSON.stringify(getReferenceSetsReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	function setDetailsOfHierarchyAssignment(gID, observableModelPopup, hierarchyFullPath, hierarchyName, hierarchyId, downloadAutomation, downloadedOn, autoSchedulingDuringMHB, referenceSetModel, isOverwriteRSAssignment, IsMultiEdit, IsChangesMadeToSave, isAvailablePTExist, availableReferenceSet, referenceSetModelArray, qualifiedReferenceSets, qualifiedReferenceSetsText, selectedRowAvailableTemplates, availableParameterTemplates, duplicateParameters, ParmeterTemplateModel, Operation, isDuplicateTemplateAssignment, assignedPramenterTemplatesText) {
		$('#warningHierarchyAssignment').modal('hide');
		var autoDownloadOn;
		var isAutoSchedulingEnabled;
		var hierarchy = new Object();
		var referenceSetLite = new Array();
		var Selector = new Object();

		if (downloadedOn == "Next Available Free Time Slot") {
			autoDownloadOn = 'Next Contact'
			isAutoSchedulingEnabled = true;
		} else if (downloadedOn == "Next Maintenance Window") {
			autoDownloadOn = 'Maintenance Window';
			isAutoSchedulingEnabled = false;
		} else if (downloadedOn == "Next Contact") {
			autoDownloadOn = 'Next Contact';
			isAutoSchedulingEnabled = false;
		} else {
			autoDownloadOn = 'Next Contact';
			isAutoSchedulingEnabled = false;
			autoSchedulingDuringMHB = false;
		}

		hierarchy.AutoDownloadOn = autoDownloadOn;
		hierarchy.HierarchyFullPath = hierarchyFullPath;
		hierarchy.HierarchyName = hierarchyName;
		hierarchy.Id = hierarchyId;
		hierarchy.IsAutoDownloadEnabled = (downloadAutomation == undefined || downloadAutomation == '') ? false : downloadAutomation;
		hierarchy.IsAutoSchedulingDuringMHB = autoSchedulingDuringMHB;
		hierarchy.IsAutoSchedulingEnabled = isAutoSchedulingEnabled;

		if (isReferenceSetAssignmentChanged) {
			for (var i = 0; i < referenceSetModel.length; i++) {
				var EGenericConfigurations = new Object();
				EGenericConfigurations.Name = referenceSetModel[i].Name;
				EGenericConfigurations.ReferenceSetId = referenceSetModel[i].ReferenceSetId;
				EGenericConfigurations.Sequence = i + 1;
				referenceSetLite.push(EGenericConfigurations);
			}
		}

		var inheritReferenceSetMode = 0;
		if ($("#inheritYes").is(':checked')) {
			inheritReferenceSetMode = 1;
		} else if ($("#inheritNo").is(':checked')) {
			inheritReferenceSetMode = 2;
		}

		var hierarchyDAModified;
		if (koUtil.downloadOnHierarchy == 0 && koUtil.downloadAutomationHierarchy == 0) {
			hierarchyDAModified = ENUM.get('HIERARCHYDA_NONE');
		} else if (koUtil.downloadOnHierarchy == 1 && koUtil.downloadAutomationHierarchy == 1) {
			hierarchyDAModified = ENUM.get('HIERARCHYDA_BOTH');
		} else if (koUtil.downloadOnHierarchy == 1 && koUtil.downloadAutomationHierarchy == 0) {
			hierarchyDAModified = ENUM.get('HIERARCHYDA_DOWNLOADEDON');
		} else {
			hierarchyDAModified = ENUM.get('HIERARCHYDA_AUTOMATICDOWNLOAD');
		}

		var selectedItems = getSelectedUniqueId(gID);
		var unselectedItems = getUnSelectedUniqueId(gID);
		var checkAll = checkAllSelected(gID);
		var isAllSelected = false;

		Selector.SelectedItemIds = selectedItems;
		Selector.UnSelectedItemIds = null;

		//Identify is Sequence of selected items modified 
		var referenceIdsInSequence = new Array();
		if (!IsMultiEdit && isReferenceSetAssignmentChanged) {
			for (var k = 0; k < referenceSetModel.length; k++) {
				referenceIdsInSequence.push(referenceSetModel[k].ReferenceSetId);
			}
		}

		assignReferencesetToHierarchyReq = new Object();
		assignReferencesetToHierarchyReq.Selector = Selector;
		assignReferencesetToHierarchyReq.IsAllSelected = isAllSelected;
		assignReferencesetToHierarchyReq.HierarchyDownloadOption = hierarchy;
		assignReferencesetToHierarchyReq.ReferenceSetLiteList = referenceSetLite;
		assignReferencesetToHierarchyReq.HierarchyDAModified = hierarchyDAModified;
		assignReferencesetToHierarchyReq.IsRSAssignmentModified = isReferenceSetAssignmentChanged;
		assignReferencesetToHierarchyReq.InheritReferenceSetMode = inheritReferenceSetMode;
		assignReferencesetToHierarchyReq.ReferenceIdsInSequence = referenceIdsInSequence;
		assignReferencesetToHierarchyReq.IsOverWrite = IsMultiEdit ? isOverwriteRSAssignment : true;
		assignReferencesetToHierarchyReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

		function callbackFunction(data, error) {
			$("#loadingDiv").hide();
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					isReferenceSetAssignmentChanged = false;
					isReferenceSetTemplateChanged = true;
					isAvailablePTExist(false);
					$("#btnSaveHierarchyAssignment").prop('disabled', true);
					openAlertpopup(0, 'hierarchy_reference_set_changes_saved_successfully');
					IsChangesMadeToSave(false);
					if (isPTAssignmentChanged === true) {
						AssignTemplateToHierarchy(selectedRowAvailableTemplates, hierarchyId, availableParameterTemplates, duplicateParameters, ParmeterTemplateModel, Operation, IsChangesMadeToSave, isDuplicateTemplateAssignment, referenceSetModel, assignedPramenterTemplatesText, qualifiedReferenceSets);
					}
					getReferenceSets(hierarchyId, availableReferenceSet, referenceSetModelArray, qualifiedReferenceSets, qualifiedReferenceSetsText, isAvailablePTExist, ParmeterTemplateModel, availableParameterTemplates, assignedPramenterTemplatesText);
					modalGetQualifiedRefereceSetDetails(hierarchyId, koUtil.GlobalColumnFilter);
					modalGetQualifiedParameterTemplateDetails(self.hierarchyId, koUtil.GlobalColumnFilter);
				}
			}
		}
		var method = 'AssignReferenceSetToHierarchy';
		var params = '{"token":"' + TOKEN() + '","assignReferencesetToHierarchyReq":' + JSON.stringify(assignReferencesetToHierarchyReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	// Parameter Templates
	//get Available Parameter Templates
	function getAvailableParameterTemplates(referenceSets, hierarchyId, availableParameterTemplates, ParmeterTemplateModel, assignedPramenterTemplatesText, qualifiedReferenceSets) {
		$("#loadingDiv").show();
		var referenceSetIds = [];
		if (!_.isEmpty(referenceSets) && referenceSets.length > 0) {
			for (var i = 0; i < referenceSets.length; i++) {
				referenceSetIds.push(referenceSets[i].ReferenceSetId);
			}
		}
		if (!_.isEmpty(qualifiedReferenceSets) && qualifiedReferenceSets.length > 0) {
			for (var j = 0; j < qualifiedReferenceSets.length; j++) {
				var item = qualifiedReferenceSets[j];
				if (!item.IsDirectAssigned) {
					referenceSetIds.push(qualifiedReferenceSets[j].ReferenceSetId);
				}
			}
		}

		var selector = new Object();
		var selectedItems = getSelectedUniqueId('jqxgridHierarchyAssignment');
		var unselectedItems = getUnSelectedUniqueId('jqxgridHierarchyAssignment');
		var checkAll = checkAllSelected('jqxgridHierarchyAssignment');

		selector.SelectedItemIds = selectedItems;
		selector.UnSelectedItemIds = null;

		var getAvailableParameterTemplatesReq = new Object();
		getAvailableParameterTemplatesReq.ReferencesetId = referenceSetIds;
		getAvailableParameterTemplatesReq.HierarchyId = hierarchyId;
		getAvailableParameterTemplatesReq.Selector = selector;
		getAvailableParameterTemplatesReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

		function callbackFunction(data, error) {
			$("#loadingDiv").hide();
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.getAvailableParameterTemplatesReqResp) {
						data.getAvailableParameterTemplatesReqResp = $.parseJSON(data.getAvailableParameterTemplatesReqResp);
						if (data.getAvailableParameterTemplatesReqResp.TemplateNamesWithTemplateId && data.getAvailableParameterTemplatesReqResp.TemplateNamesWithTemplateId.length > 0) {
							for (var k = 0; k < data.getAvailableParameterTemplatesReqResp.TemplateNamesWithTemplateId.length; k++) {
								koUtil.availableParameterTemplateArray()[k] = data.getAvailableParameterTemplatesReqResp.TemplateNamesWithTemplateId[k];
							}
							availableParameterTemplates(data.getAvailableParameterTemplatesReqResp.TemplateNamesWithTemplateId);
						} else {
							koUtil.availableParameterTemplateArray([]);
							availableParameterTemplates([]);
						}
					}

					gridAvailableHierarchyTemplates(availableParameterTemplates(), 'jqxGridAvailableHierarchyTemplates');
					GetAssignedParameterTemplates(referenceSets, hierarchyId, availableParameterTemplates, ParmeterTemplateModel, assignedPramenterTemplatesText, qualifiedReferenceSets);
				}
			}
		}

		var method = 'GetAvailableParameterTemplates';
		var params = '{"token":"' + TOKEN() + '","getAvailableParameterTemplatesReq":' + JSON.stringify(getAvailableParameterTemplatesReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	//Get Assigned Parameter Templates
	function GetAssignedParameterTemplates(referenceSets, hierarchyId, availableParameterTemplates, ParmeterTemplateModel, assignedPramenterTemplatesText, qualifiedReferenceSets) {
		$("#loadingDiv").show();
		var referenceSetIds = [];
		if (!_.isEmpty(referenceSets) && referenceSets.length > 0) {
			for (var i = 0; i < referenceSets.length; i++) {
				referenceSetIds.push(referenceSets[i].ReferenceSetId);
			}
		}
		if (!_.isEmpty(qualifiedReferenceSets) && qualifiedReferenceSets.length > 0) {
			for (var j = 0; j < qualifiedReferenceSets.length; j++) {
				var item = qualifiedReferenceSets[j];
				if (!item.IsDirectAssigned) {
					referenceSetIds.push(qualifiedReferenceSets[j].ReferenceSetId);
				}
			}
		}

		var selector = new Object();
		var selectedItems = getSelectedUniqueId('jqxgridHierarchyAssignment');
		var unselectedItems = getUnSelectedUniqueId('jqxgridHierarchyAssignment');
		var checkAll = checkAllSelected('jqxgridHierarchyAssignment');

		selector.SelectedItemIds = selectedItems;
		selector.UnSelectedItemIds = null;

		var getAssignedParameterTemplatesReq = new Object();
		getAssignedParameterTemplatesReq.ReferencesetId = referenceSetIds;
		getAssignedParameterTemplatesReq.HierarchyId = hierarchyId;
		getAssignedParameterTemplatesReq.Selector = selector;
		getAssignedParameterTemplatesReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

		function callbackFunction(data, error) {
			$("#loadingDiv").hide();
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.getAssignedParameterTemplateNamesResp) {
						data.getAssignedParameterTemplateNamesResp = $.parseJSON(data.getAssignedParameterTemplateNamesResp);

						if (data.getAssignedParameterTemplateNamesResp.TemplateNames && data.getAssignedParameterTemplateNamesResp.TemplateNames.length > 0) {
							for (var k = 0; k < data.getAssignedParameterTemplateNamesResp.TemplateNames.length; k++) {
								parameterTemplateArrayToCheck[k] = data.getAssignedParameterTemplateNamesResp.TemplateNames[k];
							}
							ParmeterTemplateModel(data.getAssignedParameterTemplateNamesResp.TemplateNames);
							for (var i = 0; i < ParmeterTemplateModel().length > 0; i++) {
								var availableTemplate = _.where(availableParameterTemplates(), { TemplateId: ParmeterTemplateModel()[i].TemplateId, ReferenceSetId: ParmeterTemplateModel()[i].ReferenceSetId });
								if (availableTemplate.length > 0) {
									availableParameterTemplates.remove(availableTemplate[0]);
								}
							}
							gridAvailableHierarchyTemplates(availableParameterTemplates(), 'jqxGridAvailableHierarchyTemplates');
						} else {
							parameterTemplateArrayToCheck = [];
							ParmeterTemplateModel([]);
						}

						assignedPramenterTemplatesText(data.getAssignedParameterTemplateNamesResp.QualifiedTemplates);
						gridAssignedHierarchyTemplates(ParmeterTemplateModel(), 'jqxGridAssignedHierarchyTemplates');
					}
				}
			}
		}

		var method = 'GetAssignedParameterTemplates';
		var params = '{"token":"' + TOKEN() + '","getAssignedParameterTemplatesReq":' + JSON.stringify(getAssignedParameterTemplatesReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}
	//Assign Parameter Templates
	function AssignTemplateToHierarchy(selectedTemplate, hierarchyId, availableParameterTemplates, duplicateParameters, ParmeterTemplateModel, Operation, IsChangesMadeToSave, isDuplicateTemplateAssignment, referenceSetModel, assignedPramenterTemplatesText, qualifiedReferenceSets) {
		$('#warningHierarchyAssignment').modal('hide');
		var referenceTemplateSetDetails = [];
		for (var i = 0; i < ParmeterTemplateModel().length; i++) {
			var referenceSetTemplate = new Object();
			referenceSetTemplate.TemplateId = ParmeterTemplateModel()[i].TemplateId
			referenceSetTemplate.ReferenceSetId = ParmeterTemplateModel()[i].ReferenceSetId;
			if (ParmeterTemplateModel()[i].IsUnAssigned == true) {
				referenceSetTemplate.IsUnAssigned = ParmeterTemplateModel()[i].IsUnAssigned;
			} else {
				referenceSetTemplate.IsUnAssigned = false;
			}
			referenceTemplateSetDetails.push(referenceSetTemplate);
		}
		if (Operation == AppConstants.get('PARAMETERTEMPLATE_VALIDATE') && selectedTemplate != undefined && selectedTemplate.TemplateId != undefined) {
			var selectedSource = _.where(referenceTemplateSetDetails, { TemplateId: selectedTemplate.TemplateId, ReferenceSetId: selectedTemplate.ReferenceSetId });
			if (selectedSource.length == 0) {
				var referenceSetTemplate = new Object();
				referenceSetTemplate.TemplateId = selectedTemplate.TemplateId
				referenceSetTemplate.ReferenceSetId = selectedTemplate.ReferenceSetId
				if (selectedTemplate.ReferenceSetId == true) {
					referenceSetTemplate.IsUnAssigned = selectedTemplate.ReferenceSetId;
				} else {
					referenceSetTemplate.IsUnAssigned = false;
				}
				referenceSetTemplate.IsLatest = true;
				referenceTemplateSetDetails.push(referenceSetTemplate);
			};
		}
		//unAssignTemplates
		if (parameterTemplateArrayToCheck.length > 0) {
			for (var j = 0; j < parameterTemplateArrayToCheck.length; j++) {
				var selectedsource = _.where(referenceTemplateSetDetails, { TemplateId: parameterTemplateArrayToCheck[j].TemplateId, ReferenceSetId: parameterTemplateArrayToCheck[j].ReferenceSetId });
				if (selectedsource.length == 0) {
					var referenceSetTemplate = new Object();
					referenceSetTemplate.TemplateId = parameterTemplateArrayToCheck[j].TemplateId
					referenceSetTemplate.ReferenceSetId = parameterTemplateArrayToCheck[j].ReferenceSetId;
					referenceSetTemplate.IsUnAssigned = true;
					referenceTemplateSetDetails.push(referenceSetTemplate);
				}
			}
		}

		var selector = new Object();
		var selectedItems = getSelectedUniqueId('jqxgridHierarchyAssignment');
		var unselectedItems = getUnSelectedUniqueId('jqxgridHierarchyAssignment');
		var checkAll = checkAllSelected('jqxgridHierarchyAssignment');

		selector.SelectedItemIds = selectedItems;
		selector.UnSelectedItemIds = null;

		var assignTemplateToHierarchyReq = new Object();
		assignTemplateToHierarchyReq.HierarchyId = hierarchyId;
		assignTemplateToHierarchyReq.ReferenceSetTemplate = referenceTemplateSetDetails;
		assignTemplateToHierarchyReq.Operation = Operation;
		assignTemplateToHierarchyReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
		assignTemplateToHierarchyReq.Selector = selector;

		function callbackFunction(data, error) {
			$("#loadingDiv").hide();
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.assignTemplateToHierarchyResp) {
						data.assignTemplateToHierarchyResp = $.parseJSON(data.assignTemplateToHierarchyResp);
					}
					if (Operation == AppConstants.get('PARAMETERTEMPLATE_VALIDATE')) {
						isPTAssignmentChanged = true;
						IsChangesMadeToSave(true);
						ParmeterTemplateModel.push(selectedTemplate);
						var selectedSource = _.where(availableParameterTemplates(), { TemplateId: selectedTemplate.TemplateId, ReferenceSetId: selectedTemplate.ReferenceSetId });
						availableParameterTemplates.remove(selectedSource[0]);

						fetchTemplates(availableParameterTemplates, ParmeterTemplateModel);
						$("#btnSaveHierarchyAssignment").prop('disabled', false);
					} else {
						isPTAssignmentChanged = false;
						IsChangesMadeToSave(false);
						isReferenceSetTemplateChanged = true;
						$("#btnSaveHierarchyAssignment").prop('disabled', true);
						openAlertpopup(0, 'hierarchy_parameter_template_changes_saved_successfully');
						GetAssignedParameterTemplates(referenceSetModel, hierarchyId, availableParameterTemplates, ParmeterTemplateModel, assignedPramenterTemplatesText, qualifiedReferenceSets)
						modalGetQualifiedParameterTemplateDetails(hierarchyId, koUtil.GlobalColumnFilter);
					}
				} else if (data.responseStatus.StatusCode == AppConstants.get('E_ASSIGNED_TEMPLATE_CONTAINS_DUPLICATE_PT')) {
					if (data.assignTemplateToHierarchyResp) {
						data.assignTemplateToHierarchyResp = $.parseJSON(data.assignTemplateToHierarchyResp);
					}
					if (IsChangesMadeToSave() == false) {
						$("#btnSaveHierarchyAssignment").prop('disabled', true);
					}
					isDuplicateTemplateAssignment(true);
					duplicateParameters(data.assignTemplateToHierarchyResp);
					$("#informationPopupParameter").modal("show");
					$("#infoMessageParameter").text(i18n.t('pt_assigned_tempalte_contains_duplicate_parameter_templates', { lng: lang }));
					$("#invalidParametersViewDetails").addClass('hide');
					$("#duplicateParametersViewDetails").removeClass('hide');
				} else if (data.responseStatus.StatusCode == AppConstants.get('E_ASSIGNED_HIERARCHY_RS_CONTAINS_DUPLICATE_PT')) {
					if (data.assignTemplateToHierarchyResp) {
						data.assignTemplateToHierarchyResp = $.parseJSON(data.assignTemplateToHierarchyResp);
					}
					if (IsChangesMadeToSave() == false) {
						$("#btnSaveHierarchyAssignment").prop('disabled', true);
					}
					isDuplicateTemplateAssignment(false);
					duplicateParameters(data.assignTemplateToHierarchyResp)
					$("#informationPopupParameter").modal("show");
					$("#infoMessageParameter").text(i18n.t('pt_assigned_tempalte_contains_duplicate_parameter_templates', { lng: lang }));
					$("#invalidParametersViewDetails").addClass('hide');
					$("#duplicateParametersViewDetails").removeClass('hide');
				} else if (data.responseStatus.StatusCode == AppConstants.get('E_ASSIGNMENT_FAILED')) {
					openAlertpopup(2, i18n.t('pt_assignment_failed_to_hierarchy_and_referenceset', { lng: lang }));
				} else if (data.responseStatus.StatusCode == AppConstants.get('EX_DUPLICATE_MODELED_TEMPLATES')) {      //408
					openAlertpopup(2, i18n.t('ex_duplicate_modeled_templates', { lng: lang }));
				}
			}
		}

		var method = 'AssignTemplateToHierarchy';
		var params = '{"token":"' + TOKEN() + '","assignTemplateToHierarchyReq":' + JSON.stringify(assignTemplateToHierarchyReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	//UnAssign Parameter Templates
	function unAssignTemplateToHierarchy(selectedTemplate, hierarchyId, availableParameterTemplates, ParmeterTemplateModel, isConfirmUnassign) {
		var referenceTemplateSetDetails = [];
		for (var i = 0; i < ParmeterTemplateModel().length; i++) {
			var referenceSetTemplate = new Object();
			referenceSetTemplate.TemplateId = ParmeterTemplateModel()[i].TemplateId
			referenceSetTemplate.ReferenceSetId = ParmeterTemplateModel()[i].ReferenceSetId;
			if (ParmeterTemplateModel()[i].ReferenceSetId == true) {
				referenceSetTemplate.IsUnAssigned = ParmeterTemplateModel()[i].ReferenceSetId;
			} else {
				referenceSetTemplate.IsUnAssigned = false;
			}
			referenceTemplateSetDetails.push(referenceSetTemplate);
		}
		if (selectedTemplate != undefined && selectedTemplate.TemplateId != undefined) {
			var referenceSetTemplate = new Object();
			referenceSetTemplate.TemplateId = selectedTemplate.TemplateId
			referenceSetTemplate.ReferenceSetId = selectedTemplate.ReferenceSetId
			if (selectedTemplate.ReferenceSetId == true) {
				referenceSetTemplate.IsUnAssigned = selectedTemplate.ReferenceSetId;
			} else {
				referenceSetTemplate.IsUnAssigned = false;
			}
			referenceSetTemplate.IsUnAssigned = selectedTemplate.IsUnAssigned;
			referenceTemplateSetDetails.push(referenceSetTemplate);
		}

		var selector = new Object();
		var selectedItems = getSelectedUniqueId('jqxgridHierarchyAssignment');
		var unselectedItems = getUnSelectedUniqueId('jqxgridHierarchyAssignment');
		var checkAll = checkAllSelected('jqxgridHierarchyAssignment');

		selector.SelectedItemIds = selectedItems;
		selector.UnSelectedItemIds = null;

		var unAssignHierarchyTemplateReq = new Object();
		unAssignHierarchyTemplateReq.HierarchyId = hierarchyId;
		unAssignHierarchyTemplateReq.referenceSetTemplate = referenceTemplateSetDetails;
		unAssignHierarchyTemplateReq.IsUnAssignHierarchyTemplate = isConfirmUnassign;
		unAssignHierarchyTemplateReq.Selector = selector;
		unAssignHierarchyTemplateReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

		function callbackFunction(data, error) {
			$("#loadingDiv").hide();
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.unAssignHierarchyTemplateResp) {
						data.unAssignHierarchyTemplateResp = $.parseJSON(data.unAssignHierarchyTemplateResp);
					}
					if (data.unAssignHierarchyTemplateResp.IsUnAssignHierarchyTemplate == 0) {
						$('#confirmationPTPopup').modal('hide');
						selectedTemplate.IsUnAssigned = true;
						ParmeterTemplateModel.remove(selectedTemplate);
						availableParameterTemplates.push(selectedTemplate);
						$("#jqxGridAssignedHierarchyTemplates").jqxGrid('clear');
						var str = '';
						str += '<div id="jqxGridAssignedHierarchyTemplates"></div>';
						$("#availableHierarchyTemplatesDiv").empty();
						$("#availableHierarchyTemplatesDiv").append(str);
						gridAvailableHierarchyTemplates(availableParameterTemplates, 'jqxGridAvailableHierarchyTemplates')
					} else {
						$('#confirmationPTPopup').modal('show');
						$("#confirmationText").text(i18n.t('unassign_reference_sets_from_single_hierarchy', { lng: lang }));
					}
				}
			}
		}

		var method = 'UnAssignHierarchyTemplate';
		var params = '{"token":"' + TOKEN() + '","unAssignHierarchyTemplateReq":' + JSON.stringify(unAssignHierarchyTemplateReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	//------get affected device count by hierarchy
	function getAffectedDeviceCountByHierarchy(hierarchyIds, referenceSets, isMultiEdit, checkAll, selectedCount, unselectedCount, isOverriteAssignment) {
		var referenceSetIds = [];
		if (!_.isEmpty(referenceSets) && referenceSets.length > 0) {
			for (var i = 0; i < referenceSets.length; i++) {
				referenceSetIds.push(referenceSets[i].ReferenceSetId);
			}
		}

		var selector = new Object();
		var selectedItems = getSelectedUniqueId('jqxgridHierarchyAssignment');
		var unselectedItems = getUnSelectedUniqueId('jqxgridHierarchyAssignment');
		var checkAll = checkAllSelected('jqxgridHierarchyAssignment');

		selector.SelectedItemIds = selectedItems;
		selector.UnSelectedItemIds = null;

		var getAffectedDeviceCountByHierarchyReq = new Object();
		getAffectedDeviceCountByHierarchy.IsAllSelected = checkAll === 1 ? true : false;
		getAffectedDeviceCountByHierarchyReq.HierarchyIds = checkAll === 1 ? [] : hierarchyIds;
		getAffectedDeviceCountByHierarchyReq.ReferenceSetIds = referenceSetIds;
		getAffectedDeviceCountByHierarchyReq.Selector = selector;
		getAffectedDeviceCountByHierarchyReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

		function callbackFunction(data, error) {
			$("#loadingDiv").hide();
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.getAffectedDeviceCountByHierarchyResp) {
						data.getAffectedDeviceCountByHierarchyResp = $.parseJSON(data.getAffectedDeviceCountByHierarchyResp);
						$("#warningHierarchyAssignmentMsg").html(i18n.t('hierarchy_assignment_reference_set_warning_multiple_devices', { devicecount: data.getAffectedDeviceCountByHierarchyResp.DeviceCount, hierarchycount: data.getAffectedDeviceCountByHierarchyResp.HierarchyCount }, { lng: lang }));
						$('#warningHierarchyAssignment').modal('show');
					}
				}
			}
		}

		var method = 'GetAffectedDeviceCountByHierarchy';
		var params = '{"token":"' + TOKEN() + '","getAffectedDeviceCountByHierarchyReq":' + JSON.stringify(getAffectedDeviceCountByHierarchyReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	//------Validate IsInheritFromParent -----
	function validateIsInheritFromParent(hierarchyId, invalidParameters, IsChangesMadeToSave, inheritFromParentHierarchyChanged, enableDisableSaveButton) {
		var validateIsInheritFromParentReq = new Object();
		validateIsInheritFromParentReq.HierarchyId = hierarchyId;
		validateIsInheritFromParentReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

		function callbackFunction(data, error) {
			$("#loadingDiv").hide();
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

					inheritFromParentHierarchyChanged = true;
					enableDisableSaveButton();
				} else if (data.responseStatus.StatusCode == AppConstants.get('E_ASSIGNED_TEMPLATE_CONTAINS_DUPLICATE_PT')) {
					if (IsChangesMadeToSave() == false) {
						$("#btnSaveHierarchyAssignment").prop('disabled', true);
					}
					if (data.ValidateIsInheritFromParentResp) {
						data.ValidateIsInheritFromParentResp = $.parseJSON(data.ValidateIsInheritFromParentResp);
					}
					invalidParameters(data.ValidateIsInheritFromParentResp);
					$("#informationPopupParameter").modal("show");
					$("#infoMessageParameter").text(i18n.t('validate_inherit_from_parent_hierarchy', { lng: lang }));
					$("#invalidParametersViewDetails").removeClass('hide');
					$("#duplicateParametersViewDetails").addClass('hide');
				}
			}
		}

		var method = 'ValidateIsInheritFromParent';
		var params = '{"token":"' + TOKEN() + '","validateIsInheritFromParentReq":' + JSON.stringify(validateIsInheritFromParentReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}
	//------display available reference set data------
	function gridAvailableHierarchyTemplates(availableParameterTemplates, gID) {
		var source =
		{
			dataType: "json",
			localdata: availableParameterTemplates,
			datafields: [
				{ name: 'TemplateId', map: 'TemplateId' },
				{ name: 'ReferenceSetId', map: 'ReferenceSetId' },
				{ name: 'TemplateName', map: 'TemplateName' },
				{ name: 'ApplicationName', map: 'ApplicationName' },
				{ name: 'PackageName', map: 'PackageName' },
				{ name: 'ApplicationVersion', map: 'ApplicationVersion' },
				{ name: 'ReferenceSetName', map: 'ReferenceSetName' },
			]
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
						text: i18n.t('pt_templatereferenceset', { lng: lang }), datafield: 'ReferenceSetName', width: 140, minwidth: 80, editable: false,
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
					gridSetRowDetailsAvailableTemplates(e, gID);
					highlightedIndexAvailableTemplates = -1;
				}
			});

		$("#" + gID).bind('rowselect', function (event) {
			var selectedRow = new Object();
			var datainformations = $("#" + gID).jqxGrid('getdatainformation');
			var rowscounts = datainformations.rowscount;

			selectedRow.TemplateId = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'TemplateId');
			selectedRow.ReferenceSetId = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ReferenceSetId');
			selectedRow.TemplateName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'TemplateName');
			selectedRow.PackageName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'PackageName');
			selectedRow.ApplicationName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ApplicationName');
			selectedRow.ApplicationVersion = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ApplicationVersion');
			selectedRow.ReferenceSetName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'ReferenceSetName');
			highlightedIndexAvailableTemplates = event.args.rowindex;
			if ((rowscounts - 1) == highlightedIndexAvailableTemplates) {
				isRightPackagesClick = "No";
			} else {
				isRightPackagesClick = "Yes";
			}

			selectedRowDataAvailable(gID, selectedRow);
		});
	}

	function gridAssignedHierarchyTemplates(assignedParameterTemplates, gID) {
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
				{ name: 'ModelId', map: 'ModelId' }
			]
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
						text: i18n.t('pt_templatereferenceset', { lng: lang }), datafield: 'ReferenceSetName', width: 140, minwidth: 80, editable: false,
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
					selectedRowAssignedTemplates = [];
					gridSetRowDetailsAssignedTemplates(e, gID);
					highlightedIndexAssignedTemplates = -1;
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
			highlightedIndexAssignedTemplates = event.args.rowindex;

			selectedRowDataAssigned(gID, [], selectedRow);
		});
	}

	//------display duplicate parameters data------
	function jqxgridDuplicateParameterTemplates(duplicateTemplates, gID, isDuplicateTemplateAssignment) {
		var source =
		{
			dataType: "json",
			localdata: duplicateTemplates,
			datafields: [
				{ name: 'ConflictTemplateName', map: 'ConflictTemplateName' },
				{ name: 'ConflictParamName', map: 'ConflictParamName' },
				{ name: 'ReferenceSet', map: 'ReferenceSet' },
				{ name: 'TemplateName', map: 'TemplateName' },
				{ name: 'ApplicationName', map: 'ApplicationName' },
				{ name: 'PackageName', map: 'PackageName' },
				{ name: 'ApplicationVersion', map: 'ApplicationVersion' },
				{ name: 'HierarchyPath', map: 'HierarchyPath' },
				{ name: 'ParamName', map: 'ParamName' },
				{ name: 'ParameterValue', map: 'ParameterValue' },
			]
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
						text: i18n.t('pt_dp_conflict_parametername', { lng: lang }), datafield: 'ParamName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_dp_conflict_template', { lng: lang }), datafield: 'TemplateName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_dp_parametername', { lng: lang }), datafield: 'ConflictParamName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_dp_template', { lng: lang }), datafield: 'ConflictTemplateName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_dp_hierarchypath', { lng: lang }), datafield: 'HierarchyPath', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_dp_referenceset', { lng: lang }), datafield: 'ReferenceSet', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_dp_package', { lng: lang }), datafield: 'PackageName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_dp_application', { lng: lang }), datafield: 'ApplicationName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_dp_version', { lng: lang }), datafield: 'ApplicationVersion', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
				]
			}).on({
				filter: function (e) {

				}
			});
	}

	//------display invalide parameters data------
	function jqxgridValidateParameterTemplates(invalidTemplates, gID) {
		var source =
		{
			dataType: "json",
			localdata: invalidTemplates,
			datafields: [
				{ name: 'ParentChild', map: 'ParentChild' },
				{ name: 'ParamName', map: 'ParamName' },
				{ name: 'TemplateName', map: 'TemplateName' },
				{ name: 'ApplicationName', map: 'ApplicationName' },
				{ name: 'ApplicationVersion', map: 'ApplicationVersion' },
				{ name: 'PackageName', map: 'PackageName' },
				{ name: 'ReferenceSetName', map: 'ReferenceSetName' },
				{ name: 'HierarchyPath', map: 'HierarchyPath' },
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
						text: i18n.t('pt_hierarchy_paramname', { lng: lang }), datafield: 'ParamName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_hierarchy_templatename', { lng: lang }), datafield: 'TemplateName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_hierarchy_hierarchypath', { lng: lang }), datafield: 'HierarchyPath', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_hierarchy_referencesetname', { lng: lang }), datafield: 'ReferenceSetName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_hierarchy_applicationname', { lng: lang }), datafield: 'ApplicationName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_hierarchy_applicationversion', { lng: lang }), datafield: 'ApplicationVersion', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
					{
						text: i18n.t('pt_hierarchy_packagename', { lng: lang }), datafield: 'PackageName', width: 'auto', minwidth: 80, editable: false, menu: false, sortable: false, filterable: false,
					},
				]
			})

	}

	function compareArrays(arr1, arr2) {
		return $(arr1).not(arr2).length == 0 && $(arr2).not(arr1).length == 0
	};

});

function modalSetJqxGridQualifiedReferenceSetDetails(fileNameOnHierarchyAssignment, gID) {
	var source =
	{
		datatype: "json",
		localdata: fileNameOnHierarchyAssignment[0],
		root: 'HierarchyReferenceSetDetails',
		contentType: 'application/json',
		datafields: [
			{ name: 'SourceHierarchy', map: 'SourceHierarchy', type: 'string' },
			{ name: 'ReferenceSet', map: 'ReferenceSet', type: 'string' },
			{ name: 'AssignedPackages', map: 'AssignedPackages', type: 'string' },
			{ name: 'Models', map: 'Models', type: 'string' },
			{ name: 'MatchingCriteria', map: 'MatchingCriteria', type: 'string' },
		]
	};
	var dataAdapter = new $.jqx.dataAdapter(source);

	var buildFilterPanel = function (filterPanel, datafield) {
		wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
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
			pagesize: fileNameOnHierarchyAssignment.length,
			autoshowcolumnsmenubutton: false,
			showsortmenuitems: false,
			editable: true,
			rowsheight: 32,
			enabletooltips: true,
			columnsResize: true,
			columns: [
				{
					text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'SourceHierarchy', editable: false, minwidth: 130, cellsrenderer: HierarchyPathRenderer,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('referenceSet', { lng: lang }), datafield: 'ReferenceSet', editable: false, minwidth: 100,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('assigned_packages', { lng: lang }), datafield: 'AssignedPackages', sortable: false, filterable: false, menu: false, editable: false, minwidth: 120,
				},
				{
					text: i18n.t('rs_models', { lng: lang }), datafield: 'Models', sortable: false, filterable: false, menu: false, editable: false, minwidth: 90,
				},
				{
					text: i18n.t('matching_criteria', { lng: lang }), datafield: 'MatchingCriteria', editable: false, minwidth: 100, resizable: true,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
			]
		});
}
function modalSetJqxGridQualifiedParameterTemplateDetails(fileNameOnHierarchyAssignment, gID) {
	var source =
	{
		datatype: "json",
		localdata: fileNameOnHierarchyAssignment[0],
		root: 'HierarchyParameterTemplateDetails',
		contentType: 'application/json',
		datafields: [
			{ name: 'ParameterTemplateName', map: 'ParameterTemplateName', type: 'string' },
			{ name: 'HierarchyPath', map: 'HierarchyPath', type: 'string' },
			{ name: 'ReferenceSet', map: 'ReferenceSet', type: 'string' },
			{ name: 'Package', map: 'Package', type: 'string' },
			{ name: 'Application', map: 'Application', type: 'string' },
			{ name: 'Version', map: 'Version', type: 'string' },
		]
	};
	var dataAdapter = new $.jqx.dataAdapter(source);

	var buildFilterPanel = function (filterPanel, datafield) {
		wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
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
			pagesize: fileNameOnHierarchyAssignment.length,
			autoshowcolumnsmenubutton: false,
			showsortmenuitems: false,
			editable: true,
			rowsheight: 32,
			enabletooltips: true,
			columnsResize: true,
			columns: [
				{
					text: i18n.t('qpt_parametertemplatename', { lng: lang }), datafield: 'ParameterTemplateName', editable: false, minwidth: 100, cellsrenderer: HierarchyPathRenderer,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('qpt_hierarchypath', { lng: lang }), datafield: 'HierarchyPath', editable: false, minwidth: 130,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('qpt_refereceset', { lng: lang }), datafield: 'ReferenceSet', editable: false, minwidth: 80,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('qpt_package', { lng: lang }), datafield: 'Package', editable: false, minwidth: 100,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('qpt_application', { lng: lang }), datafield: 'Application', editable: false, minwidth: 100, resizable: true,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('qpt_version', { lng: lang }), datafield: 'Version', minwidth: 60, editable: false,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
			]
		});
}
function modalGetQualifiedRefereceSetDetails(hierarchyID, columnSortFilter) {
	var getHierarchyReferenceSetDetailsReq = new Object();
	var fileNameOnHierarchyAssignment = new Array();
	getHierarchyReferenceSetDetailsReq.HierarchyId = hierarchyID;
	getHierarchyReferenceSetDetailsReq.IsEdit = true;
	getHierarchyReferenceSetDetailsReq.ColumnSortFilter = columnSortFilter;

	function callbackFunction(data, error) {
		$("#loadingDiv").hide();
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				if (data.getHierarchyReferenceSetDetailsResp)
					data.getHierarchyReferenceSetDetailsResp = $.parseJSON(data.getHierarchyReferenceSetDetailsResp);

				if (data.getHierarchyReferenceSetDetailsResp && data.getHierarchyReferenceSetDetailsResp.HierarchyReferenceSetDetails) {
					fileNameOnHierarchyAssignment.push(data.getHierarchyReferenceSetDetailsResp.HierarchyReferenceSetDetails);
					modalSetJqxGridQualifiedReferenceSetDetails(fileNameOnHierarchyAssignment, 'jqxGridQualifiedReferencesets');
				} else {
					modalSetJqxGridQualifiedReferenceSetDetails([], 'jqxGridQualifiedReferencesets');
				}
			} else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHY_LIMIT_EXCEEDED')) {
				fileNameOnHierarchyAssignment = new Array();
				modalSetJqxGridQualifiedReferenceSetDetails(fileNameOnHierarchyAssignment, 'jqxGridModalRSHAssignment');
				openAlertpopup(1, data.responseStatus.StatusMessage);
			}
		}
	}

	var method = 'GetHierarchyReferenceSetDetails';
	var params = '{"token":"' + TOKEN() + '","getHierarchyReferenceSetDetailsReq":' + JSON.stringify(getHierarchyReferenceSetDetailsReq) + '}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

function modalGetQualifiedParameterTemplateDetails(hierarchyID, columnSortFilter) {
	var getHierarchyParameterTemplateDetailsReq = new Object();
	var fileNameOnHierarchyAssignment = new Array();

	var selector = new Object();
	var selectedItems = getSelectedUniqueId('jqxgridHierarchyAssignment');
	var unselectedItems = getUnSelectedUniqueId('jqxgridHierarchyAssignment');
	var checkAll = checkAllSelected('jqxgridHierarchyAssignment');

	selector.SelectedItemIds = selectedItems;
	selector.UnSelectedItemIds = null;

	getHierarchyParameterTemplateDetailsReq.HierarchyId = hierarchyID;
	getHierarchyParameterTemplateDetailsReq.IsEdit = true;
	getHierarchyParameterTemplateDetailsReq.ColumnSortFilter = columnSortFilter;
	getHierarchyParameterTemplateDetailsReq.Selector = selector;

	function callbackFunction(data, error) {
		$("#loadingDiv").hide();
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				if (data.qualifiedHierarchyReferenceSetTemplatesResp)
					data.qualifiedHierarchyReferenceSetTemplatesResp = $.parseJSON(data.qualifiedHierarchyReferenceSetTemplatesResp);

				if (data.qualifiedHierarchyReferenceSetTemplatesResp && data.qualifiedHierarchyReferenceSetTemplatesResp) {
					data.qualifiedHierarchyReferenceSetTemplatesResp.HierarchyParameterTemplateDetails = data.qualifiedHierarchyReferenceSetTemplatesResp;
					fileNameOnHierarchyAssignment.push(data.qualifiedHierarchyReferenceSetTemplatesResp.HierarchyParameterTemplateDetails);
					modalSetJqxGridQualifiedParameterTemplateDetails(fileNameOnHierarchyAssignment, 'jqxGridQualifiedParameterTemplates');
				} else {
					modalSetJqxGridQualifiedParameterTemplateDetails([], 'jqxGridQualifiedParameterTemplates');
				}
			} else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHY_LIMIT_EXCEEDED')) {
				modalSetJqxGridQualifiedParameterTemplateDetails([], 'jqxGridModalRSHAssignment');
				openAlertpopup(1, data.responseStatus.StatusMessage);
			}
		}
	}

	var method = 'GetQualifiedHierarchyReferenceSetTemplates';
	var params = '{"token":"' + TOKEN() + '","qualifiedHierarchyReferenceSetTemplatesReq":' + JSON.stringify(getHierarchyParameterTemplateDetailsReq) + '}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

var gridSetRowDetailsAvailableReferenceSets = function (e, gID) {
	$("#" + gID).jqxGrid('beginupdate');
	var results = $("#" + gID).jqxGrid('getrows').length;
	if (results == 0) {
		$("#btnMoveRightReferenceSet").addClass('disabled');
		$("#btnMoveRightReferenceSet").prop('disabled', true);
	}

	$("#" + gID).jqxGrid('resumeupdate');
	State12 = $("#" + gID).jqxGrid('savestate');
	$("#" + gID).jqxGrid('clearselection');
	return;
};

var gridSetRowDetailsAssignedReferenceSets = function (e, gID) {
	$("#" + gID).jqxGrid('beginupdate');
	var results = $("#" + gID).jqxGrid('getrows').length;
	if (results == 0) {
		$("#btnMoveLeftReferenceSet").addClass('disabled');
		$("#btnMoveLeftReferenceSet").prop('disabled', true);
		$("#btnMoveLeftAllReferenceSets").addClass('disabled');
		$("#btnMoveLeftAllReferenceSets").prop('disabled', true);
	}

	$("#" + gID).jqxGrid('resumeupdate');
	State12 = $("#" + gID).jqxGrid('savestate');
	$("#" + gID).jqxGrid('clearselection');
	return;
};

var gridSetRowDetailsAvailableTemplates = function (e, gID) {
	$("#" + gID).jqxGrid('beginupdate');
	var results = $("#" + gID).jqxGrid('getrows').length;
	if (results == 0) {
		$("#btnMoveRightHierarchyTemplate").addClass('disabled');
		$("#btnMoveRightHierarchyTemplate").prop('disabled', true);
	}

	$("#" + gID).jqxGrid('resumeupdate');
	State12 = $("#" + gID).jqxGrid('savestate');
	$("#" + gID).jqxGrid('clearselection');
	return;
};

var gridSetRowDetailsAssignedTemplates = function (e, gID) {
	$("#" + gID).jqxGrid('beginupdate');
	var results = $("#" + gID).jqxGrid('getrows').length;
	if (results == 0) {
		$("#btnMoveLeftHierarchyTemplate").addClass('disabled');
		$("#btnMoveLeftHierarchyTemplate").prop('disabled', true);
	}

	$("#" + gID).jqxGrid('resumeupdate');
	State12 = $("#" + gID).jqxGrid('savestate');
	$("#" + gID).jqxGrid('clearselection');
	return;
};