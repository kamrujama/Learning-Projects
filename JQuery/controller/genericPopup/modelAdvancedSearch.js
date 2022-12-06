define(["knockout", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "chosen", "appEnum", "maxlength"], function (ko, ADSearchUtil, koUtil) {

	SelectedIdOnGlobale = new Array();
	columnSortFilterDevice = new Array();
	confirmationFlage = 0;
	var isSearchAdmin = koUtil.isSearchAdmin();
	var lang = getSysLang();
	var lastEventType = '';
	isSearchAppliedForSchedule = false;

	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	return function AdvancedSearchdViewModel() {
		groupData = [];

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

		ko.bindingHandlers.executeOnEnter = {
			init: function (element, valueAccessor, allBindings, viewModel) {
				var callback = valueAccessor();
				$(element).keypress(function (event) {
					var keyCode = (event.which ? event.which : event.keyCode);
					if (keyCode === 13) {
						callback.call(viewModel);
						return false;
					}
					return true;
				});
			}
		};

		$(".chosen-results").css("max-height", "90px");
		//-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
		$('#advancedSearchConfirmationPopup').on('shown.bs.modal', function (e) {
			$('#advancedSearchConfirmationPopup_No').focus();

		});
		$('#advancedSearchConfirmationPopup').keydown(function (e) {
			if ($('#advancedSearchConfirmationPopup_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#advancedSearchConfirmationPopup_Yes').focus();
			}
		});
		$('#deleteSavedSearchConfirmation').on('shown.bs.modal', function (e) {
			$('#deleteSearchConfirmationPopup_No').focus();

		});
		$('#deleteSavedSearchConfirmation').keydown(function (e) {
			if ($('#deleteSearchConfirmationPopup_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#deleteSearchConfirmationPopup_Yes').focus();
			}
		});

		//focus button when it is open
		$('#AdInformationPopup').on('shown.bs.modal', function () {
			$('#AdInfoBtnOk').focus();
		});

		$("#txtQuickSearchDevice").keydown(function (objEvent) {
			if (objEvent.keyCode == 32) {  //spacebar pressed
				$("#txtQuickSearchDevice").click();
			}
		});

		$("#txtQuickSearchDevice").click(function (e) {
			//  $("#txtQuickSearchDevice").val('');
		});

		$("#txtAttrValue").on('change keyup paste blur', function (event) {
			if (event.type == 'blur') {
				$(this).css("border-color", "");
			}
			var txtMaxLength = 1000;
			if ($(this).val().length > txtMaxLength) {
				$(this).css("border-color", "red");
				var $txtMaxLengthToolTip = $("#txtAttrValueErrorTip");
				if (!$txtMaxLengthToolTip.is(":visible")) {
					$txtMaxLengthToolTip.text(i18n.t('warning_more_than_maxLength_char_are_truncated', { txtMaxLength: txtMaxLength }, { lng: lang }));
					$txtMaxLengthToolTip.show(0).delay(1000 * 6).hide(0);
				}
				if (lastEventType == 'paste') {
					$(this).val('');
				}
				setformfieldsize($(this), txtMaxLength, '');
			}
			lastEventType = event.type;
		});
		//------------------------------------------------------------------------------------------------------------------------


		ADSearchUtil.attributeType = AppConstants.get('DEVICESEARCH');
		var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'ComputedDeviceStatus', 'LastHeartBeat', 'HierarchyFullPath'];

		isGroupModified = false;
		koUtil.isSearchAdmin(true);
		koUtil.isHierarchyModified(false);
		koUtil.isAttributeModified(false);
		koUtil.isSearchCancelled(false);
		if ($("#criteriabtnDiv").is(':hidden')) {
			koUtil.savedSearchId = 0;
		} else {
			koUtil.savedSearchId = !_.isEmpty(ADSearchUtil.deviceSearchObj) ? (ADSearchUtil.deviceSearchObj.SearchID ? ADSearchUtil.deviceSearchObj.SearchID : 0) : 0;
		}

		var self = this;

		self.SearchId = ko.observable(koUtil.savedSearchId);
		self.criteriaGroups = ko.observableArray();
		self.AttributeData = ko.observableArray();
		self.backUpAttributeData = ko.observableArray();
		self.issubStatus = ko.observable(false);
		self.privateSearch = ko.observableArray();
		self.publicSearch = ko.observableArray();
		self.issaveSearch = ko.observable(false);
		self.allSearches = ko.observableArray();
		self.observableHierarchy = ko.observable();
		self.oldAttrSelectedVal = ko.observable();
		self.oldSvaeSearch = ko.observable(0);
		self.oldSearchid = ko.observable();
		self.isFromSaveSearch = ko.observable(false);
		self.isNotSearchAdmin = ko.observable(false);
		self.isSelectedColumns = ko.observable(false);
		deviceLiteData = new Object();		//modalHierarchy checks for device profile data. But from this screen, it should not check. Hence clearing

		if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			isAdpopup = '';
			self.isSelectedColumns(true);
		} else {
			isAdpopup = 'open';
		}

		self.applyForChart = ko.observable();
		self.applyForChart(ADSearchUtil.SearchForChart);

		if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			$("#SearchDDLdiv").css('display', 'inline');
		} else {
			$("#SearchDDLdiv").css('display', 'block');
		}

		self.SearchDataFordelete = ko.observable();

		self.selectionConfirmation = ko.observable();

		self.checkaddAttr = ko.observable(false);

		self.applyForChart = ko.observable();
		self.applyForChart(ADSearchUtil.SearchForChart);
		self.applyForGrid = ko.observable();
		self.applyForGrid(ADSearchUtil.SearchForGrid);
		loadHierarchy('modalHierarchy', 'genericPopup');

		self.selectedGridColumns = ko.observableArray();
		self.hierarchyFullPath = ko.observableArray();
		self.attrbuteCriteriaArr = ko.observableArray();
		self.backupAttrbuteCriteriaArr = ko.observableArray(ADSearchUtil.backupAttrbuteCriteriaArrAdvSearch);
		self.checkTxtSearchName = ko.observable();
		self.attributeValue = ko.observable();
		self.attributeVersion = ko.observable();

		self.isEditMode = ko.observable(true);
		self.isCopyMode = ko.observable(false);
		self.isDeleteMode = ko.observable(false);

		ADSearchUtil.HierarchyPathArr([]);
		var gId = '';
		if (ADSearchUtil.gridIdForAdvanceSearch == 'jqxgridForSelectedDevices') {
			gId = getschedulscrenName();
			gId = ADSearchUtil.gridIdForAdvanceSearch + gId;
		} else if (ADSearchUtil.gridIdForAdvanceSearch == 'blankSchedulejqxgrid') {
			gId = getschedulscrenName();
			gId = 'jqxgridForSelectedDevices' + gId;
		} else if (ADSearchUtil.gridIdForAdvanceSearch == "blankDevicejqxgrid") {
			gId = "Devicejqxgrid";
		} else {
			gId = ADSearchUtil.gridIdForAdvanceSearch;
		}

		var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
		if (adStorage && adStorage.length > 0 && adStorage[0].isWithGroup == 1) {
			self.searchCheck = ko.observable(AppConstants.get('GROUPS'));
		} else {
			self.searchCheck = ko.observable(AppConstants.get('HIERARCHY'));
		}

		self.checkAccessType = ko.observable('Private');
		self.checkAttrValue = ko.observable('');
		self.checkConnectedDevices = ko.observable(false);
		self.checkSearchType = ko.observable('Attributes');
		self.isVisible = ko.observable(false);
		$("#hierarchyDiv").show();
		$("#GroupDiv").hide();

		var selectedAttribute = new Object();
		selectedColumns = selectedColumns.length > 0 ? selectedColumns.sort(function (a, b) { return a.DisplayName > b.DisplayName ? 1 : -1; }) : selectedColumns;
		selectedColumnsClone = selectedColumnsClone.length > 0 ? selectedColumnsClone.sort(function (a, b) { return a.DisplayName > b.DisplayName ? 1 : -1; }) : selectedColumnsClone;
		ADSearchUtil.userPreferenceColumns([]);

		if (isDeviceSearchWithAdvanceSearch == false) {
			for (var i = 0; i < selectedColumns.length; i++) {
				self.selectedGridColumns().push(selectedColumns[i]);
				ADSearchUtil.userPreferenceColumns.push(selectedColumns[i]);
			}
		} else {
			for (var i = 0; i < selectedColumnsClone.length; i++) {
				self.selectedGridColumns().push(selectedColumnsClone[i]);
				ADSearchUtil.userPreferenceColumns.push(selectedColumnsClone[i]);
			}
		}
		self.hierarchyFullPath = ADSearchUtil.HierarchyPathArr;

		VHQFlag === true ? self.isVisible(true) : self.isVisible(false);
		var isFileSearch = false;
		var fr = new FileReader();
		var fileData = new Array();
		var customFileName = "";
		var customSearchVersion = 'version=1.0';
		var customSearchColumns = ['REM Serial Number', 'Device Id', 'Custom Attribute 1', 'Custom Attribute 2', 'Custom Attribute 3', 'Custom Attribute 4', 'Custom Attribute 5'];
		var customAttributesFields = ['SerialNumber', 'DeviceId', 'CustomField1', 'CustomField2', 'CustomField3', 'CustomField4', 'CustomField5']
		var fileSearchElements = new Array();

		if (_.isEmpty(deviceAttributesDataDeviceSearch)) {
			getDeviceAttributes(AppConstants.get('DEVICESEARCH'), getDeviceAttributesCallback);
		} else {
			setDeviceSearchAttributes(self.AttributeData, ADSearchUtil.attributeType, self.backUpAttributeData);
		}

		function getDeviceAttributesCallback() {
			setDeviceSearchAttributes(self.AttributeData, ADSearchUtil.attributeType, self.backUpAttributeData);
			if (isDeviceSubStatusAllowed && deviceSubStatusDataAll && deviceSubStatusDataAll.length == 0) {
				getDeviceSubStatus();
			}
		}

		function enableDisableSaveOptions(type) {
			if (type == 0) {
				$("#rbtPrivate").prop('disabled', true);
				$("#rbtPublic").prop('disabled', true);
				$("#chkDefaultSearch").prop('disabled', true);
			} else {
				$("#rbtPrivate").prop('disabled', false);
				$("#rbtPublic").prop('disabled', false);
				if ($("#rbtPrivate").is(':checked')) {
					$("#chkDefaultSearch").prop('disabled', false);
				}
			}
		}

		self.checkTxtSearchName.subscribe(function (newValue) {

			var checkGroupArr = self.criteriaGroups();
			var checkHierarchyArr = self.hierarchyFullPath();
			var checkAttrArr = self.attrbuteCriteriaArr();

			if (self.checkTxtSearchName().trim() != '') {
				if (self.searchCheck() == AppConstants.get('HIERARCHY')) {
					if (checkHierarchyArr.length > 0 || checkAttrArr.length > 0) {
						if ($("#txtSearchName").val().trim() != '') {
							enableDisableSaveOptions(1);
							$("#btnSave").removeAttr('disabled');
						}
					} else {
						enableDisableSaveOptions(0);
						$("#btnSave").prop('disabled', true);
					}
				} else {
					if (checkGroupArr.length > 0 || checkAttrArr.length > 0) {
						if ($("#txtSearchName").val().trim() != '') {
							enableDisableSaveOptions(1);
							$("#btnSave").removeAttr('disabled');
						}
					} else {
						enableDisableSaveOptions(0);
						$("#btnSave").prop('disabled', true);
					}
				}
			} else {
				enableDisableSaveOptions(0);
				$("#btnSave").prop('disabled', true);
			}
		});


		self.checkAttrValue.subscribe(function (newValue) {
			if (self.checkAttrValue() != '') {
				$("#btnAddAttr").removeClass('disabled');
			} else {
				$("#btnAddAttr").addClass('disabled');
			}
		});

		self.attributeValue.subscribe(function (newValue) {
			if (self.attributeValue() == 'null') {
				self.attributeValue('');
			}
		});

		self.attributeVersion.subscribe(function (newValue) {
			if (self.attributeVersion() == 'null') {
				self.attributeVersion('');
			}
		});

		self.showHierarchy = function () {
			if (self.criteriaGroups().length > 0) {
				self.selectionConfirmation(i18n.t('Confirm_Messgae_From_Group_to_Hierarchy', { lng: lang }));
				$("#advancedSearchConfirmationPopup").modal('show');
			} else {
				self.searchCheck(AppConstants.get('HIERARCHY'));
				self.criteriaGroups([]);
				loadHierarchy('modalHierarchy', 'genericPopup');
				$("#hierarchyDiv").show();
				$("#GroupDiv").hide();
			}
			return true;
		}

		self.closedConfirmantion = function () {
			$("#advancedSearchConfirmationPopup").modal('hide');
			if (self.searchCheck() == AppConstants.get('HIERARCHY')) {
				self.searchCheck(AppConstants.get('GROUPS'));
			} else if (self.searchCheck() == AppConstants.get('GROUPS')) {
				self.searchCheck(AppConstants.get('HIERARCHY'));
			}
			if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			} else {
				$("#mainPageBody").addClass('modal-open-appendon');
			}
		}

		self.showGroups = function () {
			if (self.hierarchyFullPath().length > 0) {
				self.selectionConfirmation(i18n.t('Confirm_Messgae_From_Hierarchy_to_Group', { lng: lang }));
				$("#advancedSearchConfirmationPopup").modal('show');
			} else {
				var str = '';
				str += '<div id="groupsGrid"></div>';
				$("#groupContainer").empty();
				$("#groupContainer").append(str);
				getGroups(self.criteriaGroups);
				self.hierarchyFullPath([])
				ADSearchUtil.HierarchyPathArr([]);
				ADSearchUtil.hierarchyFullPath = self.hierarchyFullPath();
				self.observableHierarchy('unloadTemplate');
				self.hierarchyFullPath();
				self.searchCheck(AppConstants.get('GROUPS'));
				$("#hierarchyDiv").hide();
				$("#GroupDiv").show();
				$("#groupsGrid").jqxGrid('updatebounddata');
			}
			return true;
		}

		self.exportToExcelGroups = function (gId) {
			var dataInfo = $("#" + gId).jqxGrid('getdatainformation');
			if (dataInfo.rowscount <= 0) {

				openAlertpopup(1, 'no_data_to_export');
			} else {
				$("#loadingDiv").show();
				exportjqxcsvData(gId, AppConstants.get('GROUPS'));
				openAlertpopup(1, 'export_Information');
				$("#loadingDiv").hide();
			}
		}

		//For Clear Filter
		self.clearfilterforGroup = function (gId) {
			self.criteriaGroups([]);
			$('span').removeClass('jqx-checkbox-check-checked');
			gridFilterClear(gId);
			$(".UItxtfilterclass").val("");
			self.showGroups();
		}

		if (adStorage && adStorage.length > 0 && adStorage[0].isWithGroup == 1) {
			self.showGroups();
		}

		self.confirmChangeSelectionTab = function () {
			if (self.searchCheck() == AppConstants.get('HIERARCHY')) {

				self.searchCheck(AppConstants.get('HIERARCHY'));
				self.criteriaGroups([]);
				$("#groupContainer").empty();
				var str = "<div id='groupsGrid'></div>";
				$("#groupContainer").append(str);
				getGroups(self.criteriaGroups);
				loadHierarchy('modalHierarchy', 'genericPopup');
				$("#hierarchyDiv").show();
				$("#GroupDiv").hide();

			} if (self.searchCheck() == AppConstants.get('GROUPS')) {
				self.searchCheck(AppConstants.get('GROUPS'));
				getGroups(self.criteriaGroups);
				self.hierarchyFullPath([])
				ADSearchUtil.HierarchyPathArr([]);
				ADSearchUtil.hierarchyFullPath = self.hierarchyFullPath();
				self.observableHierarchy('unloadTemplate');
				self.hierarchyFullPath();

				$("#hierarchyDiv").hide();
				$("#GroupDiv").show();
				$("#groupsGrid").jqxGrid('updatebounddata');
			}
			$("#advancedSearchConfirmationPopup").modal('hide');
			if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			} else {
				$("#mainPageBody").addClass('modal-open-appendon');
			}

		}

		self.removeColumnsFromGrid = function (data) {
			var source = _.where(self.selectedGridColumns(), { AttributeName: data.AttributeName });
			if (source && source.length > 0) {
				self.selectedGridColumns.remove(source[0]);
				ADSearchUtil.userPreferenceColumns.remove(source[0]);
			}
		}

		self.removeHierarchyPathFromCriteria = function (data) {
			ADSearchUtil.checkexistParent = jQuery.grep(ADSearchUtil.checkexistParent, function (value) {
				return (value != data.HierarchyId && value != null);
			});

			var source = _.where(self.hierarchyFullPath(), { HierarchyFullPath: data.HierarchyFullPath });
			koUtil.isHierarchyModified(true);
			self.hierarchyFullPath.remove(source[0]);
		}

		self.includeChildHierarchies = function (data) {
			if (koUtil.isSearchAdmin() == false)
				return;

			if (data) {
				if (data.IncludeChildren) {
					$('#labelCheckbox' + data.HierarchyId).attr('title', 'Include child hierarchies');
				} else {
					$('#labelCheckbox' + data.HierarchyId).attr('title', 'Exclude child hierarchies');
				}
				koUtil.isHierarchyModified(true);
				if ($("#txtSearchName").val().trim() != '') {
					enableDisableSaveOptions(1);
					$("#btnSave").removeAttr('disabled');
				}
				$("#btnApplyFilter").removeAttr('disabled');
				$("#btnApplyFilterChart").removeAttr('disabled');
			}
		};

		self.checkAutoSelect = function () {
			if ($("#txtSearchName").val() != '') {
				enableDisableSaveOptions(1);
				$("#btnSave").removeAttr('disabled');
			} else {
				enableDisableSaveOptions(0);
				$("#btnSave").prop('disabled', true);
			}
		}

		self.DeviceSearchAttributeOperators = ko.observableArray();
		self.monoOperatorAdv = ko.observable();
		self.multiComboData = ko.observableArray();
		self.comboData = ko.observableArray();

		self.comboType = ko.observable(false);
		self.multiComboType = ko.observable(false);
		self.dateType = ko.observable(false);
		self.textType = ko.observable(false);
		self.applicationType = ko.observable(false);
		self.isPaymentApp = ko.observable(false);

		self.ismodel = ko.observable(false);
		self.isdeviceStatus = ko.observable(false);
		self.isModeOfConnectivity = ko.observable(false);
		self.isSoftwareAssignmentType = ko.observable(false);
		self.isVTPEncryptionStatus = ko.observable(false);
		self.isAutoDownloadEnabledStatus = ko.observable(false);

		self.showTodatetxt = ko.observable(true);
		ADSearchUtil.attributeDataArr = [];
		self.items = ko.observableArray();
		self.selectedOption = ko.observable();
		self.selectedOperator = ko.observable();

		self.checkoperator = ko.observable(false);

		self.multiselctedModels = ko.observableArray();
		self.multiselctedDeviceStatus = ko.observableArray();
		self.multiSelectedModeOfConnectivity = ko.observableArray();
		self.multiSelectedSoftwareAssignmentType = ko.observableArray();
		self.multiSelectedVTPEncryptionStatus = ko.observableArray();
		self.multiselctedSubStatus = ko.observableArray();
		self.multiSelectedAutoDownloadEnbaled = ko.observableArray();
		getAllSearches(self.allSearches, self.hierarchyFullPath, self.criteriaGroups, self.attrbuteCriteriaArr, self.AttributeData, self.checkAccessType, self.isEditMode, self.multiselctedModels, self.multiselctedDeviceStatus, self.multiSelectedModeOfConnectivity, self.multiSelectedVTPEncryptionStatus, self.isCopyMode, self.backUpAttributeData, self.searchCheck, self.SearchId, self.multiSelectedSoftwareAssignmentType);

		//for dateicker
		$("#txtAttrFromDate").val(moment().subtract('days', 1).format('MM/DD/YYYY'));
		$("#txtAttrToDate").val(currentDate);
		$('#txtAttrFromDate').datepicker({ autoclose: true, setDate: $("#txtAttrFromDate").val() });
		//$('#txtAttrFromDate').datepicker('update', $("#txtAttrFromDate").val());


		$("#txtAttrToDate").datepicker({ autoclose: true });
		var currentDateShort = moment().format(AppConstants.get('SHORT_DATE_FORMAT'));
		var currentDate = moment().format('MM/DD/YYYY');

		$("#txtAttrFromDate").val(moment().subtract('days', 1).format('MM/DD/YYYY'));

		$("#txtAttrToDate").val(currentDate);

		$("#txtAttrFromDate").datepicker().on('changeDate', function (ev) {
			$("#txtAttrFromDate").change();
		});

		$("#txtAttrFromDate").change(function () {
			var curt = moment().format('MM/DD/YYYY');
			if (self.showTodatetxt() == true) {
				if (moment($("#txtAttrFromDate").val()).isAfter(moment($("#txtAttrToDate").val()).format('MM/DD/YYYY'))) {
					AdvancedOpenAlertPopup(1, 'to_date_frmDate');
					$("#txtAttrFromDate").val(moment().format('MM/DD/YYYY'));
				}
			}

		});

		$("#txtAttrToDate").datepicker().on('changeDate', function (ev) {
			$("#txtAttrToDate").change();
		});

		$("#txtAttrToDate").change(function () {
			if (moment($("#txtAttrFromDate").val()).isAfter($("#txtAttrToDate").val())) {
				AdvancedOpenAlertPopup(1, 'to_date_frmDate');
				$("#txtAttrToDate").val($("#txtAttrFromDate").val());
			}

		});

		self.selectSearchType = function () {
			if ($("#rbtAttributes").is(':checked')) {
				self.checkAccessType('Attributes');
				$("#selectCustomFileDiv").css('display', 'none');
				$("#selectAttributesDiv").css('display', 'block');
				$("#attributesControlDiv").css('display', 'block');
				$("#attributesCritertaDiv").css('display', 'block');
				VHQFlag === true ? self.isVisible(true) : self.isVisible(false);
				isFileSearch = false;
			} else {
				self.checkAccessType('Files');
				$("#selectAttributesDiv").css('display', 'none');
				$("#attributesControlDiv").css('display', 'none');
				$("#attributesCritertaDiv").css('display', 'none');
				$("#selectCustomFileDiv").css('display', 'block');
				$("#btnApplyFilter").removeAttr('disabled');
				self.isVisible(false);
				isFileSearch = true;
			}
			return true;
		}

		self.validateIsCommaExistForAppVer = function (data) {

			var appVersion = data.attributeVersion();

			if (appVersion != "" && appVersion != undefined) {
				if (validateIsCommaExist(appVersion)) {
					$("#appVersionErrorTip").show();
				} else {
					$("#appVersionErrorTip").hide();
				}
			} else {
				$("#appVersionErrorTip").hide();
			}
		}

		$(document).on('click', '.chosen-choices', function () {
			$('#ddlMultiCombo_chosen .search-field input[type=text]').focus();
		});

		self.selectedOperator.subscribe(function (newValue) {
			var selectedOperatorSource = _.where(self.DeviceSearchAttributeOperators(), { DeviceSearchOperatorId: newValue });
			if (!_.isEmpty(selectedOperatorSource) && selectedOperatorSource.length > 0) {
				selectedAttribute.Operator = selectedOperatorSource[0].Operator;
			}

			if ((selectedAttribute.AttributeName === "SerialNumber" || selectedAttribute.AttributeName === "DeviceId") && selectedAttribute.Operator === "Equal To") {         //Equal To
				$("#divFileSelect").show();
			} else {
				$("#divFileSelect").hide();
				$("#txtAttrValue").prop('disabled', false);
			}
			if (newValue == 99) {
				$("#txtAttrFromDate").val(moment().subtract('days', 1).format('MM/DD/YYYY'));
				$("#txtAttrToDate").val(currentDate);
				$("#fromLabelDiv").show();
				$('#txtAttrFromDate').datepicker({ autoclose: true, setDate: $("#txtAttrFromDate").val() });
				$('#txtAttrFromDate').datepicker('update');
			} else if (newValue == 100 || newValue == 101 || newValue == 102) {
				$("#txtAttrFromDate").val(currentDate);
				$("#fromLabelDiv").hide();
				$('#txtAttrFromDate').datepicker({ autoclose: true, setDate: $("#txtAttrFromDate").val() });
				$('#txtAttrFromDate').datepicker('update');
			}
			if (newValue) {
				if (newValue == 99 || ($("#ddlAttrName").find('option:selected').text() == 'Between')) {
					self.showTodatetxt(true);
				} else {
					self.showTodatetxt(false);
				}
			}
		});
		//end datepicker

		self.selectedcomb = ko.observable();
		self.selectedcomb.subscribe(function () {

		});

		self.multiSelection = ko.observable();
		self.onChangeMultiSelection = function () {

			$('.chosen-choices').children('.search-choice').each(function () {
				//var titletext = $(this).children('span').text();
				$(this).prop('title', $(this).children('span').text());
				$(this).children('span').css('height', '17px');
			});
			//$('#ddlMultiCombo :selected').each(function (i, selected) {
			//    var obj = new Object();
			//    obj.id = $(selected).val();
			//    obj.Name = $(selected).text();
			//    if (self.ismodel() == true) {
			//        var sr = _.where(self.multiselctedModels(), { Name: $(selected).text() });
			//        if (sr == '') {
			//            self.multiselctedModels.push(obj);
			//        }
			//    }
			//    if (self.isdeviceStatus() == true) {
			//        var sr = _.where(self.multiselctedDeviceStatus(), { Name: $(selected).text() });
			//        if (sr == '') {
			//            self.multiselctedDeviceStatus.push(obj);
			//        }
			//    }

			//});
		};

		//On selection of Device Attributes
		self.selectedOption.subscribe(function (newValue) {
			$('#appVersionErrorTip').hide();
			$('#appNameErrorTip').hide();
			$("#btnApplyFilter").prop('disabled', true);
			$("#btnApplyFilterChart").prop('disabled', true);
			// $("#btnClear").prop('disabled', true);
			$("#divFileSelect").hide();
			selectedAttribute = new Object();
			if (newValue) {
				var criteriaCount = 0;
				var retval = '';
				if (retval == null || retval == '') {
					if (ADSearchUtil.AdScreenName == "deviceSearch") {			//Device Search grid is restricted to only 21 columns
						var isContinue = false;
						for (var k = 0; k < compulsoryfields.length; k++) {
							if (newValue == compulsoryfields[k]) {
								isContinue = true;
								break;
							}
						}

						if (!isContinue) {
							self.selectedGridColumns().sort(function (a, b) { return a.DisplayName > b.DisplayName ? 1 : -1; });
							var source = _.where(self.selectedGridColumns(), { AttributeName: newValue });
							var sourceSelectedAttribute = _.where(self.attrbuteCriteriaArr(), { AttributeName: newValue });
							if ((!source || source.length == 0) && (!sourceSelectedAttribute || sourceSelectedAttribute.length == 0)) {
								if (self.selectedGridColumns().length >= 15) {
									$("#informationPopupForSelectedColumns").modal('show');
								} else {
									if (self.criteriaGroups().length > 0) {
										var sourceGroup = _.where(self.selectedGridColumns(), { AttributeName: "GroupNames" });
										if (!sourceGroup || sourceGroup.length == 0) {
											criteriaCount++;
										}
									}

									if (self.attrbuteCriteriaArr().length > 0) {
										for (var j = 0; j < self.attrbuteCriteriaArr().length; j++) {
											var sourceAttribute = _.where(self.selectedGridColumns(), { AttributeName: self.attrbuteCriteriaArr()[j].AttributeName });
											if (!sourceAttribute || sourceAttribute.length == 0) {
												criteriaCount++;
											}
										}
									}

									if ((self.selectedGridColumns().length + criteriaCount) >= 15) {
										$("#informationPopupForSelectedColumns").modal('show');
									}
								}
							}
						}
					}

					self.checkaddAttr(true);
					self.checkoperator(true);
					$("#txtAttrValue").val('');
					$("#txtappversion").val('');
					self.oldAttrSelectedVal(newValue);
					var selectedsource = _.where(self.AttributeData(), { AttributeName: newValue });
					if (!_.isEmpty(selectedsource) && selectedsource.length > 0) {
						selectedAttribute.AttributeName = selectedsource[0].AttributeName;
						self.items.push(selectedsource[0]);

						if (selectedsource[0].ControlType == 'Combo') {
							var arr = new Array();
							if (selectedsource[0].AttributeName == 'SubStatus') {
								if (deviceSubStatusDataAll && deviceSubStatusDataAll.length > 0) {
									for (var i = 0; i < deviceSubStatusDataAll.length; i++) {
										var obj = new Object();
										obj.ControlValue = deviceSubStatusDataAll[i].SubStatus;
										obj.Id = deviceSubStatusDataAll[i].SubStatusId;
										obj.Name = deviceSubStatusDataAll[i].SubStatus;
										obj.Value = deviceSubStatusDataAll[i].SubStatus;
										arr.push(obj);
									}
								}
							} else {
								arr = getMultiCoiceFilterArr(selectedsource[0].AttributeName);
							}

							self.comboData(arr);
							self.comboType(true);
							self.textType(false);
							self.multiComboType(false);
							self.dateType(false);
							self.applicationType(false);

						} else if (selectedsource[0].ControlType == 'TextBox') {
							self.comboType(false);
							self.textType(true);
							self.multiComboType(false);
							self.dateType(false);
							if (selectedsource[0].AttributeName == 'Name' || selectedsource[0].AttributeName == 'PaymentAppName') {
								$('#txtAttrValue').on('focusout', validateIsCommaExistForAppName);
								self.applicationType(true);
								$("#txtAttrValue").prop('placeholder', 'Name');
								if (selectedsource[0].AttributeName == 'PaymentAppName') {
									self.isPaymentApp(true);
								}
							} else {
								$('#txtAttrValue').unbind('focusout');
								self.applicationType(false);
								$("#txtAttrValue").prop('placeholder', 'Control Value');
							}

						} else if (selectedsource[0].ControlType == 'MultiCombo') {
							self.comboType(false);
							self.textType(false);
							if (selectedsource[0].DisplayName == "Sub Status")
								var arr = getMultiCoiceFilterArr("Device Sub Status");
							else if (selectedsource[0].DisplayName == "Mode of Connectivity")
								var arr = getMultiCoiceFilterArr("ModeofConnectivity");
							else if (selectedsource[0].DisplayName == "Software Assignment Type")
								var arr = getMultiCoiceFilterArr("SoftwareAssignmentType");
							else if (selectedsource[0].DisplayName == "VTP Encryption Status")
								var arr = getMultiCoiceFilterArr("EncrEnabled");
							else
								var arr = getMultiCoiceFilterArr(selectedsource[0].DisplayName);

							self.multiComboData(arr);
							self.multiComboType(true);
							self.dateType(false);
							self.applicationType(false);
							self.issubStatus(false);
							self.isModeOfConnectivity(false);
							self.isSoftwareAssignmentType(false);
							self.isVTPEncryptionStatus(false);
							self.isAutoDownloadEnabledStatus(false);


							if (selectedsource[0].DisplayName == 'Model') {
								self.ismodel(true);
								self.isdeviceStatus(false);
								self.issubStatus(false);
								self.isModeOfConnectivity(false);
								self.isSoftwareAssignmentType(false);
								self.isVTPEncryptionStatus(false);
								self.isAutoDownloadEnabledStatus(false);

								$("#ddlMultiCombo").prop("data-placeholder", "Select Model(s)");
								$("#ddlMultiCombo").trigger('chosen:updated');
							} else if (selectedsource[0].DisplayName == 'Device Status') {
								self.ismodel(false);
								self.isdeviceStatus(true);
								self.issubStatus(false);
								self.isModeOfConnectivity(false);
								self.isSoftwareAssignmentType(false);
								self.isVTPEncryptionStatus(false);
								self.isAutoDownloadEnabledStatus(false);

								$("#ddlMultiCombo").prop("data-placeholder", "Select Device Status");
								$("#ddlMultiCombo").trigger('chosen:updated');
							} else if (selectedsource[0].DisplayName == 'Sub Status') {
								self.issubStatus(true);
								self.ismodel(false);
								self.isdeviceStatus(false);
								self.isModeOfConnectivity(false);
								self.isSoftwareAssignmentType(false);
								self.isVTPEncryptionStatus(false);
								self.isAutoDownloadEnabledStatus(false);
							} else if (selectedsource[0].DisplayName == 'Mode of Connectivity') {
								$("#ddlMultiCombo").prop("data-placeholder", "Mode of Connectivity");
								$("#ddlMultiCombo").trigger('chosen:updated');

								self.issubStatus(false);
								self.ismodel(false);
								self.isdeviceStatus(false);
								self.isModeOfConnectivity(true);
								self.isSoftwareAssignmentType(false);
								self.isVTPEncryptionStatus(false);
								self.isAutoDownloadEnabledStatus(false);
							} else if (selectedsource[0].DisplayName == 'Software Assignment Type') {
								$("#ddlMultiCombo").prop("data-placeholder", "Software Assignment Type");
								$("#ddlMultiCombo").trigger('chosen:updated');

								self.issubStatus(false);
								self.ismodel(false);
								self.isdeviceStatus(false);
								self.isModeOfConnectivity(false);
								self.isSoftwareAssignmentType(true);
								self.isVTPEncryptionStatus(false);
								self.isAutoDownloadEnabledStatus(false);
							} else if (selectedsource[0].DisplayName == 'VTP Encryption Status') {

								$("#ddlMultiCombo").prop("data-placeholder", "VTP Encryption Status");
								$("#ddlMultiCombo").trigger('chosen:updated');

								self.issubStatus(false);
								self.ismodel(false);
								self.isdeviceStatus(false);
								self.isModeOfConnectivity(false);
								self.isSoftwareAssignmentType(false);
								self.isVTPEncryptionStatus(true);
								self.isAutoDownloadEnabledStatus(false);
							}
							else if (selectedsource[0].DisplayName == 'Enable Automatic Download') {

								$("#ddlMultiCombo").prop("data-placeholder", "Enable Automatic Download");
								$("#ddlMultiCombo").trigger('chosen:updated');

								self.issubStatus(false);
								self.ismodel(false);
								self.isdeviceStatus(false);
								self.isModeOfConnectivity(false);
								self.isSoftwareAssignmentType(false);
								self.isVTPEncryptionStatus(false);
								self.isAutoDownloadEnabledStatus(true);
							} else {
								self.issubStatus(false);
								self.ismodel(false);
								self.isdeviceStatus(false);
								self.isModeOfConnectivity(false);
								self.isSoftwareAssignmentType(false);
								self.isVTPEncryptionStatus(false);
								self.isAutoDownloadEnabledStatus(false);
							}
							$(".chosen-choices").children('li').children('input').css("width", "150px");
						} else if (selectedsource[0].ControlType == 'Date') {
							self.comboType(false);
							self.textType(false);
							self.multiComboType(false);
							self.dateType(true);
							self.applicationType(false);

							if (self.showTodatetxt() == true) {
								$("#txtAttrFromDate").val(moment().subtract('days', 1).format('MM/DD/YYYY'));
								$("#txtAttrToDate").val(currentDate);
								$("#fromLabelDiv").show();
								$('#txtAttrFromDate').datepicker({ autoclose: true, setDate: $("#txtAttrFromDate").val() });
								$('#txtAttrFromDate').datepicker('update');

							} else {
								$("#txtAttrFromDate").val(currentDate);
								$("#txtAttrFromDate").datepicker('update', currentDate);
								$("#fromLabelDiv").hide();
								$('#txtAttrFromDate').datepicker({ autoclose: true, setDate: $("#txtAttrFromDate").val() });
								$('#txtAttrFromDate').datepicker('update');
							}
						}

						self.DeviceSearchAttributeOperators(selectedsource[0].DeviceSearchAttributeOperators);
						if (self.DeviceSearchAttributeOperators().length == 1) {
							self.monoOperatorAdv(selectedsource[0].DeviceSearchAttributeOperators[0].Operator);
							var deferFunction = function () {
								$("#ddlAttrName").val(selectedsource[0].DeviceSearchAttributeOperators[0].DeviceSearchOperatorId).trigger("chosen:updated");
								self.selectedOperator(selectedsource[0].DeviceSearchAttributeOperators[0].DeviceSearchOperatorId);
							}
							setTimeout(deferFunction, 1000);
						} else {
							self.monoOperatorAdv();
						}
					}
				} else {
					if (retval == 'initials') {
					} else {
						$('#deviceAttributDDL').val(self.oldAttrSelectedVal()).prop("selected", "selected");
						AdvancedOpenAlertPopup(1, 'please_select_attr_value');
						self.checkaddAttr(false);
						self.checkoperator(false);

					}
				}
			} else {
				self.comboType(false);
				self.textType(false);
				self.multiComboType(false);
				self.dateType(false);
				self.applicationType(false);
				self.checkaddAttr(false);
				self.checkoperator(false);
				var checkAttrArr = self.attrbuteCriteriaArr();
				var checkHierarchyArr = self.hierarchyFullPath();
				var checkGroupArr = self.criteriaGroups();

				if (checkHierarchyArr.length > 0 || checkAttrArr.length > 0 || checkGroupArr.length > 0) {
					$("#btnApplyFilterChart").removeAttr('disabled');
					$("#btnApplyFilter").removeAttr('disabled');
					$("#btnClear").removeAttr('disabled');
					if ($("#txtSearchName").val().trim() != '') {
						enableDisableSaveOptions(1);
						$("#btnSave").removeAttr('disabled');
					}
				}
			}
		});


		self.attrbuteCriteriaArr.subscribe(function (newValue) {

			var checkHierarchyArr = self.hierarchyFullPath();
			var checkGroupArr = self.criteriaGroups();
			if (newValue.length > 0) {
				if (koUtil.savedSearchId == 0 || koUtil.isAttributeModified() == true) {
					$("#btnApplyFilter").removeAttr('disabled');
					$("#btnApplyFilterChart").removeAttr('disabled');
				}
				$("#btnClear").removeAttr('disabled');
				if ($("#txtSearchName").val().trim() != '') {
					enableDisableSaveOptions(1);
					$("#btnSave").removeAttr('disabled');
				} else {
					enableDisableSaveOptions(0);
					$("#btnSave").prop('disabled', true);
				}
			} else {
				if (checkHierarchyArr.length > 0 || checkGroupArr.length > 0) {
					if (koUtil.savedSearchId == 0 || koUtil.isAttributeModified() == true) {
						$("#btnApplyFilter").removeAttr('disabled');
						$("#btnApplyFilterChart").removeAttr('disabled');
					}
					$("#btnClear").removeAttr('disabled');
					if ($("#txtSearchName").val().trim() != '') {
						enableDisableSaveOptions(1);
						$("#btnSave").removeAttr('disabled');
					} else {
						enableDisableSaveOptions(0);
						$("#btnSave").prop('disabled', true);
					}
				} else {
					enableDisableSaveOptions(0);
					$("#btnApplyFilter").prop('disabled', true);
					$("#btnApplyFilterChart").prop('disabled', true);
					$("#btnClear").prop('disabled', true);
					$("#btnSave").prop('disabled', true);
				}
			}

		});

		self.criteriaGroups.subscribe(function (newValue) {

			var checkHierarchyArr = self.hierarchyFullPath();
			var checkAttrArr = self.attrbuteCriteriaArr();
			if (newValue.length > 0) {
				if (koUtil.savedSearchId == 0 || isGroupModified) {
					$("#btnApplyFilter").removeAttr('disabled');
					$("#btnApplyFilterChart").removeAttr('disabled');
				}
				$("#btnClear").removeAttr('disabled');
				if ($("#txtSearchName").val() != '') {
					enableDisableSaveOptions(1);
					$("#btnSave").removeAttr('disabled');
				} else {
					enableDisableSaveOptions(0);
					$("#btnSave").prop('disabled', true);
				}
			} else {
				if (checkAttrArr.length > 0) {
					if (koUtil.savedSearchId == 0 || isGroupModified) {
						$("#btnApplyFilter").removeAttr('disabled');
						$("#btnApplyFilterChart").removeAttr('disabled');
					}
					$("#btnClear").removeAttr('disabled');
					if ($("#txtSearchName").val().trim() != '') {
						enableDisableSaveOptions(1);
						$("#btnSave").removeAttr('disabled');
					} else {
						enableDisableSaveOptions(0);
						$("#btnSave").prop('disabled', true);
					}
				} else {
					enableDisableSaveOptions(0);
					$("#btnApplyFilter").prop('disabled', true);
					$("#btnApplyFilterChart").prop('disabled', true);
					$("#btnClear").prop('disabled', true);
					$("#btnSave").prop('disabled', true);
				}
			}

		});

		self.hierarchyFullPath.subscribe(function (newValue) {

			var checkGroupArr = self.criteriaGroups();
			var checkAttrArr = self.attrbuteCriteriaArr();
			if (newValue.length > 0) {
				if (koUtil.savedSearchId == 0 || koUtil.isHierarchyModified() == true) {
					$("#btnApplyFilter").removeAttr('disabled');
					$("#btnApplyFilterChart").removeAttr('disabled');
				}
				$("#btnClear").removeAttr('disabled');
				if ($("#txtSearchName").val() != '') {
					enableDisableSaveOptions(1);
					$("#btnSave").removeAttr('disabled');
				} else {
					enableDisableSaveOptions(0);
					$("#btnSave").prop('disabled', true);
				}
			} else {
				if (checkGroupArr.length > 0 || checkAttrArr.length > 0) {
					if (koUtil.savedSearchId == 0 || koUtil.isHierarchyModified() == true) {
						$("#btnApplyFilter").removeAttr('disabled');
						$("#btnApplyFilterChart").removeAttr('disabled');
					}
					$("#btnClear").removeAttr('disabled');
					if ($("#txtSearchName").val() != undefined && $("#txtSearchName").val().trim() != '') {
						enableDisableSaveOptions(1);
						$("#btnSave").removeAttr('disabled');
					} else {
						enableDisableSaveOptions(0);
						$("#btnSave").prop('disabled', true);
					}
				} else {
					enableDisableSaveOptions(0);
					$("#btnApplyFilter").prop('disabled', true);
					$("#btnApplyFilterChart").prop('disabled', true);
					$("#btnClear").prop('disabled', true);
					$("#btnSave").prop('disabled', true);
				}
			}

		});

		self.handleFileSelect = function () {
			var fileSize = 0;
			$("#txtAttrValue").prop('value', '');
			var fileValue = "";
			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				openAlertpopup(1, 'the_file_apis_are_not_fully_supported_in_this_browser');
				return;
			}
			input = document.getElementById('inputSelectFile');
			if (!input) {
				openAlertpopup(1, 'cannot_find_the_fileinput_element');
			}
			else if (!input.files) {
				openAlertpopup(1, "this_browser_doesn't_seem_to_support_the_`files`_property_of_file_inputs");
			}
			else if (!input.files[0]) {     //when the uploaded file was duplicate, user tries to upload a different file but decides to 'Cancel'
				return;
			} else {
				file = input.files[0];
				var extension = file.name.split('.').pop().toLowerCase();
				var fileName = file.name.split('.' + extension)[0];
				if (fileName.length > parseInt(AppConstants.get("FILE_NAME_MAX_CHARS"))) {
					openAlertpopup(1, "package_file_name_limit_exceeds");
					return;
				}

				fileSize = input.files[0].size;
				if (validateFileNameFormat(file.name) == false) {
					$("#txtAttrValue").prop('value', '');
					openAlertpopup(1, 'invalid_file_name');
					var fileopen = $("#inputSelectFile"),
						clone = fileopen.clone(true);
					fileopen.replaceWith(clone);
				} else if (validateFileName(file.name, 9)) {
					fileValue = file.name;
					if (fileValue != "") {
						$("#PackageFile").empty();
					}
					fr = new FileReader();
					fr.onload = receivedText;
					fr.readAsText(file);

				} else {
					$("#txtAttrValue").prop('value', '');
					openAlertpopup(1, 'selected_file_format_not_supported');
					var fileopen = $("#inputSelectFile"),
						clone = fileopen.clone(true);
					fileopen.replaceWith(clone);
				}
			}
		}

		self.handleCustomFileSelect = function () {
			var fileSize = 0;
			$("#txtCustomFile").prop('value', '');
			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				openAlertpopup(1, 'the_file_apis_are_not_fully_supported_in_this_browser');
				return;
			}
			input = document.getElementById('txtCustomFileInput');
			if (!input) {
				openAlertpopup(1, 'cannot_find_the_fileinput_element');
				return;
			} else if (!input.files) {
				openAlertpopup(1, "this_browser_doesn't_seem_to_support_the_`files`_property_of_file_inputs");
				return;
			} else if (!input.files[0]) {     //when the uploaded file was duplicate, user tries to upload a different file but decides to 'Cancel'
				return;
			} else {
				file = input.files[0];
				var extension = file.name.split('.').pop().toLowerCase();
				var fileName = file.name.split('.' + extension)[0];
				if (fileName.length > parseInt(AppConstants.get("FILE_NAME_MAX_CHARS"))) {
					openAlertpopup(1, "package_file_name_limit_exceeds");
					return;
				}

				fileSize = input.files[0].size;
				if (validateFileNameFormat(file.name) == false) {
					$("#txtCustomFile").prop('value', '');
					openAlertpopup(1, 'invalid_file_name');
					var fileopen = $("#txtCustomFileInput"),
						clone = fileopen.clone(true);
					fileopen.replaceWith(clone);
				} else if (validateFileName(file.name, 9)) {
					customFileName = file.name;
					fr = new FileReader();
					fr.onload = receivedFileText;
					fr.readAsText(file);

				} else {
					$("#txtCustomFile").prop('value', '');
					openAlertpopup(1, 'selected_file_format_not_supported');
					var fileopen = $("#txtCustomFileInput"),
						clone = fileopen.clone(true);
					fileopen.replaceWith(clone);
				}
			}
		}

		function receivedText() {
			var array = new Array();
			fileData = new Array();
			if (!_.isEmpty(fr.result)) {
				array = fr.result.split("\r\n");
				if (!_.isEmpty(array) && ((array.length - 1) > parseInt(maximumcsvDeviceSearchCount))) {
					openAlertpopup(1, i18n.t('csv_file_count_exceeded', { limit: maximumcsvDeviceSearchCount }, { lng: lang }));
					return;
				}

				if (!_.isEmpty(array) && array[0].indexOf(',') > -1) {
					openAlertpopup(2, i18n.t('custom_csv_invalid_search_file'));
					return;
				}
				for (var i = 0; i < array.length - 1; i++) {
					fileData += array[i] + ',';
				}
				$("#txtAttrValue").prop('value', fileData);
				$("#txtAttrValue").prop('disabled', true);
			}
		}
		
		function receivedFileText() {
			var array = new Array();
			fileData = new Array();
			fileSearchElements = new Array();
			array = fr.result.split("\r\n");
			if (!_.isEmpty(array) && ((array.length -1) > (parseInt(maximumcsvDeviceSearchCount) + 2))) {
				openAlertpopup(1, i18n.t('csv_file_count_exceeded', { limit: maximumcsvDeviceSearchCount }, { lng: lang }));
				return;
			}
			if (array.length === 3) {
				openAlertpopup(2, i18n.t('custom_csv_empty_file_content'));
				return;
			}

			if (array[0].split(',')[0] !== customSearchVersion) {
				openAlertpopup(2, i18n.t('custom_csv_file_version_mismatch'));
				return;
			}
			var columnHeaders = array[1].split(',')
			if (!_.isEmpty(columnHeaders) && columnHeaders.length > 0) {
				for (var i = 0; i < columnHeaders.length; i++) {
					if (columnHeaders[i] !== customSearchColumns[i]) {
						openAlertpopup(2, i18n.t('custom_csv_incorrect_column_header', { columnHeader: customSearchColumns[i] }, { lng: lang }));
						break;
						return;
					}
				}
			}

			var attributesArray = getCustomAttributes();
			for (var j = 2; j < array.length - 1; j++) {
				var cellValues = array[j].split(',');
				if (!_.isEmpty(cellValues)) {
					var source = otherThanNull(cellValues);
					if (!_.isEmpty(source) && source.length > 1) {
						openAlertpopup(2, i18n.t('custom_csv_row_number_multiple_values', { rowNumber: j+1 }, { lng: lang }));
						return;
					} else if (!_.isEmpty(source) && source.length === 1) {
						var cellIndex = getCellIndex(cellValues);
						var customAttribute = attributesArray[cellIndex];

						setSearchElement(customAttribute, source[0]);
					} else {
						openAlertpopup(2, i18n.t('custom_csv_row_number_no_value', { rowNumber: j + 1 }, { lng: lang }));
						return;
					}
				}
			}

			$("#txtCustomFile").prop('value', customFileName);
			$("#txtCustomFile").prop('disabled', true);
			$("#btnApplyFilter").removeAttr('disabled');
		}

		function otherThanNull(cellValues) {
			var cellArray = new Array();
			for (var k = 0; k < cellValues.length; k++) {
				if (cellValues[k] !== "") {
					cellArray.push(cellValues[k]);
				}
			}
			return cellArray;
		}

		function getCustomAttributes() {
			var customAttributes = new Array();
			var serialNumberAttribute = _.where(deviceAttributesDataDeviceSearch, { AttributeName: 'SerialNumber' });
			var deviceIdAttribute = _.where(deviceAttributesDataDeviceSearch, { AttributeName: 'DeviceId' });
			customAttributes.push(serialNumberAttribute[0]);
			customAttributes.push(deviceIdAttribute[0]);
			var customFields = _.where(deviceAttributesDataDeviceSearch, { IsVisible: false });
			customAttributes = customFields;
			customAttributes.unshift(serialNumberAttribute[0], deviceIdAttribute[0]);

			return customAttributes;
		}

		function getCellIndex(cellValues) {
			for (var n = 0; n < cellValues.length; n++) {
				if (cellValues[n] !== "") {
					break;					
				}
			}
			return n;
		}

		function setSearchElement(customAttribute, value) {
			var searchElement = _.where(fileSearchElements, { DeviceSearchAttributeId: customAttribute.DeviceSearchAttributeId });
			if (!_.isEmpty(searchElement) && searchElement.length > 0) {
				for (var p = 0; p < fileSearchElements.length; p++) {
					if (fileSearchElements[p].DeviceSearchAttributeId === customAttribute.DeviceSearchAttributeId) {
						fileSearchElements[p].SearchValue = fileSearchElements[p].SearchValue + ',' + value;
						break;
					}
				}
			} else {
				var operatorSource = customAttribute.DeviceSearchAttributeOperators;
				var operatorId = 0;
				if (!_.isEmpty(operatorSource) && operatorSource.length === 1) {
					operatorId = operatorSource[0].DeviceSearchOperatorId;
				} else if (!_.isEmpty(operatorSource) && operatorSource.length > 1) {
					var operatorIdSource = _.where(operatorSource, { Operator: 'Equal To' });
					operatorId = operatorIdSource[0].DeviceSearchOperatorId;
				} else {
					return;
				}

				var DeviceSearchElement = new Object();
				DeviceSearchElement.ControlType = ENUM.get(customAttribute.ControlType.toUpperCase());
				DeviceSearchElement.DeviceSearchAttributeId = customAttribute.DeviceSearchAttributeId;
				DeviceSearchElement.DeviceSearchOperatorId = operatorId;
				DeviceSearchElement.SearchElementSeqNo = customAttribute.AttributeSequence;
				DeviceSearchElement.SearchId = 0;
				DeviceSearchElement.SearchValue = value;
				DeviceSearchElement.SearchValueOptional1 = "";
				fileSearchElements.push(DeviceSearchElement);
			}
		}

		self.clearAttr = function () {
			$('#deviceAttributDDL').val('-Select-').prop("selected", "selected");
			$('#deviceAttributDDL').trigger('chosen:updated');
			$("#attrDllDiv").css('width', "280px");
			$('#ddlAttrName').val('-Select-').prop("selected", "selected");
			$("#ddlAttrName").trigger('chosen:updated');
			self.selectedOperator(0);
			$('#ddlMultiCombo').val('-Select-').prop("selected", "selected");
			$("#ddlMultiCombo").trigger('chosen:updated');
			$('#ddlCombo').val('-Select-').prop("selected", "selected");
			$("#ddlCombo").trigger('chosen:updated');
			self.comboType(false);
			self.textType(false);
			self.multiComboType(false);
			self.dateType(false);
			self.applicationType(false);
			self.checkoperator(false);
			self.checkaddAttr(false);
			$("#txtAttrValue").val('');
			$("#txtappversion").val('');
			$("#txtAttrFromDate").val('');
			$("#txtAttrToDate").val('');
			self.selectedOption(undefined);
		}

		self.addAttrToCriteria = function (item) {
			var retval = attributValidation(self.textType(), self.multiComboType(), self.comboType(), self.checkoperator(), self.dateType());

			if (retval == null || retval == '') {

				self.checkaddAttr(false);
				self.checkoperator(false);
				var r = self.items();
				var selectedsource = new Array();
				selectedsource = _.where(self.items(), { AttributeName: $("#deviceAttributDDL").find('option:selected').val() });

				var obj = new Object();
				obj.AttributeName = selectedsource[0].AttributeName;
				obj.ControlType = selectedsource[0].ControlType;
				obj.DeviceSearchAttributeId = selectedsource[0].DeviceSearchAttributeId;
				obj.DeviceSearchAttributeOperators = selectedsource[0].DeviceSearchAttributeOperators;
				obj.DisplayName = selectedsource[0].DisplayName;
				obj.IsMultiUse = selectedsource[0].IsMultiUse;
				if (selectedsource[0].ControlType == 'TextBox') {
					obj.ControlValues = $("#txtAttrValue").val().trim();
				} else if (selectedsource[0].ControlType == 'Combo') {
					obj.ControlValues = $("#ddlCombo").find('option:selected').text();
				} else if (selectedsource[0].ControlType == 'MultiCombo') {
					var CValue = '';
					$('#ddlMultiCombo :selected').each(function (i, selected) {
						var obj = new Object();
						obj.id = $(selected).val();

						obj.displaytext = $(selected).text();
						//obj.Name = $(selected).text();

						if (self.ismodel() == true) {
							var multichoiceSource1 = getMultiCoiceFilterArr('Model');
							var selectedSource1 = _.where(multichoiceSource1, { Value: $(selected).text() });

							CValue = selectedSource1[0].ControlValue;
							obj.Name = selectedSource1[0].ControlValue;

							var sr = _.where(self.multiselctedModels(), { Name: selectedSource1[0].ControlValue });
							if (sr == '') {
								self.multiselctedModels.push(obj);
							}
						}
						else if (self.isdeviceStatus() == true) {
							var multichoiceSource = getMultiCoiceFilterArr('Device Status');
							var selectedSource = _.where(multichoiceSource, { Value: $(selected).text() });

							CValue = selectedSource[0].ControlValue;
							obj.Name = selectedSource[0].ControlValue;

							var sr = _.where(self.multiselctedDeviceStatus(), { Name: selectedSource[0].ControlValue });
							if (sr == '') {
								self.multiselctedDeviceStatus.push(obj);
							}
						}
						else if (self.issubStatus() == true) {
							var multichoiceSource = getMultiCoiceFilterArr('Device Sub Status');
							var selectedSource = _.where(multichoiceSource, { Value: $(selected).text() });

							CValue = selectedSource[0].ControlValue;
							obj.Name = selectedSource[0].ControlValue;
							var sr = _.where(self.multiselctedSubStatus(), { Name: selectedSource[0].ControlValue });
							if (sr == '') {

								self.multiselctedSubStatus.push(obj);
							}
						}
						else if (self.isModeOfConnectivity() == true) {
							var multichoiceSource = getMultiCoiceFilterArr('ModeofConnectivity');
							var selectedSource = _.where(multichoiceSource, { Value: $(selected).text() });

							CValue = selectedSource[0].ControlValue;
							obj.Name = selectedSource[0].ControlValue;
							var sr = _.where(self.multiSelectedModeOfConnectivity(), { Name: selectedSource[0].ControlValue });
							if (sr == '') {

								self.multiSelectedModeOfConnectivity.push(obj);
							}
						}
						else if (self.isSoftwareAssignmentType() == true) {
							var multichoiceSource = getMultiCoiceFilterArr('SoftwareAssignmentType');
							var selectedSource = _.where(multichoiceSource, { Value: $(selected).text() });

							CValue = selectedSource[0].ControlValue;
							obj.Name = selectedSource[0].ControlValue;
							var sr = _.where(self.multiSelectedSoftwareAssignmentType(), { Name: selectedSource[0].ControlValue });
							if (sr == '') {

								self.multiSelectedSoftwareAssignmentType.push(obj);
							}
						}
						else if (self.isVTPEncryptionStatus() == true) {
							var multichoiceSource = getMultiCoiceFilterArr('EncrEnabled');
							var selectedSource = _.where(multichoiceSource, { Value: $(selected).text() });

							CValue = selectedSource[0].ControlValue;
							obj.Name = selectedSource[0].ControlValue;
							var sr = _.where(self.multiSelectedVTPEncryptionStatus(), { Name: selectedSource[0].ControlValue });
							if (sr == '') {

								self.multiSelectedVTPEncryptionStatus.push(obj);
							}
						}
						else if (self.isAutoDownloadEnabledStatus() == true) {
							var multichoiceSource = getMultiCoiceFilterArr('Enable Automatic Download');
							var selectedSource = _.where(multichoiceSource, { Value: $(selected).text() });

							CValue = selectedSource[0].ControlValue;
							obj.Name = selectedSource[0].ControlValue;
							var sr = _.where(self.multiSelectedAutoDownloadEnbaled(), { Name: selectedSource[0].ControlValue });
							if (sr == '') {

								self.multiSelectedAutoDownloadEnbaled.push(obj);
							}
						}

					});
					obj.ControlValues = CValue;//$("#ddlMultiCombo").find('option:selected').text();


				} else if (selectedsource[0].ControlType == 'Date') {

					obj.ControlValues = moment($("#txtAttrFromDate").val().trim()).format('MM/DD/YYYY');//00:00:00';//CreatJSONDate($("#txtAttrFromDate").val());

				}
				obj.OperatorValue = $("#ddlAttrName").find('option:selected').text();


				if (self.showTodatetxt() == true) {

					obj.OptionalValue = moment($("#txtAttrToDate").val().trim()).format('MM/DD/YYYY');// + ' 23:59:59';//CreatJSONDate($("#txtAttrToDate").val());

					obj.toolTip = selectedsource[0].DisplayName + ' ' + obj.OperatorValue + ' From : ' + obj.ControlValues + ' To : ' + obj.OptionalValue;
				} else if (self.applicationType() == true) {
					obj.OptionalValue = $("#txtappversion").val();
					if (validateIsCommaExist(obj.ControlValues) || validateIsCommaExist(obj.OptionalValue)) {
						self.checkaddAttr(true);
						self.checkoperator(true);
						return;
					}
					obj.toolTip = selectedsource[0].DisplayName + ' ' + obj.OperatorValue + ' Name : ' + obj.ControlValues + ' Version : ' + obj.OptionalValue;

				}
				else if (selectedsource[0].ControlType == 'MultiCombo') {

					obj.OptionalValue = null;
					var str = '';
					str = selectedsource[0].DisplayName + ' ' + obj.OperatorValue + ' ';
					if (self.ismodel() == true) {
						var arr = self.multiselctedModels();
					} else if (self.isdeviceStatus() == true) {
						var arr = self.multiselctedDeviceStatus();
					} else if (self.issubStatus() == true) {
						var arr = self.multiselctedSubStatus();
					} else if (self.isModeOfConnectivity() == true) {
						var arr = self.multiSelectedModeOfConnectivity();
					} else if (self.isSoftwareAssignmentType() == true) {
						var arr = self.multiSelectedSoftwareAssignmentType();
					} else if (self.isVTPEncryptionStatus() == true) {
						var arr = self.multiSelectedVTPEncryptionStatus();
					}
					else if (self.isAutoDownloadEnabledStatus() == true) {
						var arr = self.multiSelectedAutoDownloadEnbaled();
					}

					for (var i = 0; i < arr.length; i++) {
						str += arr[i].displaytext + ',';
					}
					str = str.slice(0, -1);
					obj.toolTip = str;//selectedsource[0].DisplayName + ' ' + obj.OperatorValue + ' ' + obj.ControlValues;
				}
				else {
					if (selectedsource[0].ControlType == 'Date') {
						if (self.showTodatetxt() == false) {

							if (obj.OperatorValue == 'Equal To') {
								obj.OptionalValue = moment($("#txtAttrFromDate").val().trim()).format('MM/DD/YYYY');// + ' 23:59:59';
								obj.toolTip = selectedsource[0].DisplayName + ' ' + obj.OperatorValue + ' ' + obj.ControlValues;
							} else if (obj.OperatorValue == 'Greater Than' || obj.OperatorValue == 'Less Than') {
								obj.toolTip = selectedsource[0].DisplayName + ' ' + obj.OperatorValue + ' ' + obj.ControlValues;
							}
						}
					} else {
						// Added code to correct the tool tip -- Start
						var controlArray = obj.ControlValues.split(',');
						var controlText = '';
						for (var i = 0; i < controlArray.length; i++) {
							var element = controlArray[i];
							if (element !== null && element.match(/^ *$/) === null) {
								controlText += controlArray[i].trim() + ',';
							}
						}
						obj.ControlValues = controlText.replace(/.$/, "");
						// Added code to correct the tool tip -- End

						obj.OptionalValue = null;
						obj.toolTip = selectedsource[0].DisplayName + ' ' + obj.OperatorValue + ' ' + obj.ControlValues;
					}
					//obj.toolTip = selectedsource[0].DisplayName + ' ' + obj.OperatorValue + ' ' + obj.ControlValues;
				}
				obj.SelectedDeviceSearchOperatorId = $("#ddlAttrName").find('option:selected').val();
				ADSearchUtil.attributeDataArr.push(obj);
				self.attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);
				ADSearchUtil.backupAttrbuteCriteriaArrAdvSearch.push(obj);
				var arr = self.attrbuteCriteriaArr();
				if (selectedsource[0].IsMultiUse) {
					var add = self.AttributeData();
					self.AttributeData([]);
					self.AttributeData(add);
				} else {

					self.AttributeData.remove(selectedsource[0]);
				}
				self.items.remove(selectedsource[0]);
				$("#txtAttrValue").val('');
				self.comboType(false);
				self.textType(false);
				self.multiComboType(false);
				self.dateType(false);
				self.applicationType(false);
				self.tettt = ko.observable();
				$('#ddlAttrName').val('-Select-').prop("selected", "selected");
				$("#ddlAttrName").trigger('chosen:updated');
				$('#ddlMultiCombo').val('-Select-').prop("selected", "selected");
				$("#ddlMultiCombo").trigger('chosen:updated');
				$('#ddlCombo').val('-Select-').prop("selected", "selected");
				$("#ddlCombo").trigger('chosen:updated');
				$("#btnApplyFilter").removeAttr('disabled');
				$("#btnApplyFilterChart").removeAttr('disabled');
				$("#btnClear, .modal-body").removeAttr('disabled');
			} else {

				if (retval == 'initials') {
				} else if (retval == 'operator') {

					AdvancedOpenAlertPopup(1, 'Please select operator');
				} else {
					//$('#deviceAttributDDL').trigger('chosen:updated');
					AdvancedOpenAlertPopup(1, 'please_select_attr_value');
					self.checkaddAttr(true);
					self.checkoperator(true);

				}
			}
			var width = $("#deviceAttributDDL").parent().width();
			if (width == '312') {
				$("#deviceAttributDDL").parent().css("width", "311px");
			} else {
				$("#deviceAttributDDL").parent().css("width", "312px");
			}

			if ($("#txtSearchName").val() == '') {
				enableDisableSaveOptions(0);
				$("#btnSave").prop('disabled', true);
			}

		}

		self.removeAttrfromCriteria = function (item) {
			if (!item.IsMultiUse) {
				var duplicate = _.where(self.AttributeData(), { AttributeName: item.AttributeName });
				if (duplicate == '') {
					self.AttributeData.push(item);
				}
			}

			koUtil.isAttributeModified(true);
			self.attrbuteCriteriaArr.remove(item);

			//if (self.ismodel() == true) {
			var modarr = self.multiselctedModels();
			if (item.AttributeName == 'ModelName') {
				for (var i = 0; i < modarr.length; i++) {

					var source = _.where(self.attrbuteCriteriaArr(), { ControlValues: modarr[i].Name })

					if (source == '') {
						//self.multiselctedModels.remove(modarr[i]);
						self.multiselctedModels([]);
					}
				}
			}

			//} else if (self.isdeviceStatus() == true) {
			var devicearr = self.multiselctedDeviceStatus();
			if (item.AttributeName == 'ComputedDeviceStatus') {
				for (var i = 0; i < devicearr.length; i++) {
					var source = _.where(self.attrbuteCriteriaArr(), { ControlValues: devicearr[i].Name })

					if (source == '') {
						//self.multiselctedDeviceStatus.remove(devicearr[i]);
						self.multiselctedDeviceStatus([]);
					}
				}
			}
			var substatusarr = self.multiselctedSubStatus();
			if (item.AttributeName == 'SubStatus') {
				for (var i = 0; i < substatusarr.length; i++) {
					var source = _.where(self.attrbuteCriteriaArr(), { ControlValues: substatusarr[i].Name })

					if (source == '') {
						self.multiselctedSubStatus([]);
					}
				}
			}

			var modeofconnectivityarr = self.multiSelectedModeOfConnectivity();
			if (item.AttributeName == 'ModeofConnectivity') {
				for (var i = 0; i < modeofconnectivityarr.length; i++) {
					var source = _.where(self.attrbuteCriteriaArr(), { ControlValues: modeofconnectivityarr[i].Name })

					if (source == '') {
						self.multiSelectedModeOfConnectivity([]);
					}
				}
			}

			var softwareAssignmentTypearr = self.multiSelectedSoftwareAssignmentType();
			if (item.AttributeName == 'SoftwareAssignmentType') {
				for (var i = 0; i < softwareAssignmentTypearr.length; i++) {
					var source = _.where(self.attrbuteCriteriaArr(), { ControlValues: softwareAssignmentTypearr[i].Name })

					if (source == '') {
						self.multiSelectedSoftwareAssignmentType([]);
					}
				}
			}

			var vtpautodownloadsarr = self.multiSelectedAutoDownloadEnbaled();
			if (item.AttributeName == 'Enable Automatic Download') {
				for (var i = 0; i < vtpautodownloadsarr.length; i++) {
					var source = _.where(self.attrbuteCriteriaArr(), { ControlValues: vtpautodownloadsarr[i].Name })

					if (source == '') {
						self.multiSelectedAutoDownloadEnbaled([]);
					}
				}
			}

			var vtpencryptionstatusarr = self.multiSelectedVTPEncryptionStatus();
			if (item.AttributeName == 'EncrEnabled') {
				for (var i = 0; i < vtpencryptionstatusarr.length; i++) {
					var source = _.where(self.attrbuteCriteriaArr(), { ControlValues: vtpencryptionstatusarr[i].Name })

					if (source == '') {
						self.multiSelectedVTPEncryptionStatus([]);
					}
				}
			}
		}

		self.removeGroupsfromCriteria = function (item) {
			$("#loadingDiv").show();
			isGroupModified = true;
			self.criteriaGroups.remove(item);
			var arr = self.criteriaGroups();
			var selArr = [];
			for (var i = 0; i < arr.length; i++) {
				selArr.push(arr[i].GroupId);
			}

			var gridStorageArr = new Array();
			var gridStorageObj = new Object();
			gridStorageObj.checkAllFlag = 0;
			gridStorageObj.counter = selArr.length;
			gridStorageObj.filterflage = 0;
			gridStorageObj.selectedDataArr = selArr;
			gridStorageObj.unSelectedDataArr = [];
			gridStorageObj.singlerowData = [];
			gridStorageObj.multiRowData = [];
			gridStorageObj.TotalSelectionCount = null;
			gridStorageObj.highlightedRow = null;
			gridStorageObj.highlightedPage = null;
			gridStorageArr.push(gridStorageObj);
			var gridStorage = JSON.stringify(gridStorageArr);
			window.sessionStorage.setItem('groupsGrid' + 'gridStorage', gridStorage);

			var state = $("#groupsGrid").jqxGrid('savestate');

			$("#groupContainer").empty();
			var str = '<div id="groupsGrid"></div>';
			$("#groupContainer").append(str);

			//groupData = data.getGroupsResp.Groups
			groupsGrid(groupData, 'groupsGrid', self.criteriaGroups);

			if (state != null) {
				$("#groupsGrid").jqxGrid('loadstate', state);
			}
			if (arr.length <= 0) {
				$("#columntablegroupsGrid").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
				$("#columntablegroupsGrid").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');
			} else if (arr.length < groupData.length) {
				$("#columntablegroupsGrid").children('div').children('div').children('div').children('div').children('div').children('span').addClass('partial-selection');
				$("#columntablegroupsGrid").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');

			}
			if (arr.length == groupData.length) {
				$("#columntablegroupsGrid").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
				$("#columntablegroupsGrid").children('div').children('div').children('div').children('div').children('div').children('span').addClass('jqx-checkbox-check-checked');
			}

		}

		self.selectedGroupsForAdSearch = ko.observableArray();
		ADSearchUtil.selectedGroupsForAdSearch = getMultiSelectedData('groupsGrid');
		self.selectedGroupsForAdSearch(ADSearchUtil.selectedGroupsForAdSearch);

		//change function of private/public
		self.changeAccessType = function () {
			if ($("#txtSearchName").val().trim() != '') {
				if (self.hierarchyFullPath().length > 0 || self.attrbuteCriteriaArr().length > 0 || self.criteriaGroups().length > 0) {
					if ($("#txtSearchName").val().trim() != '') {
						enableDisableSaveOptions(1);
						$("#btnSave").removeAttr('disabled');
					}
				}
			}
		}

		function attributValidation(textType, multiComboType, comboType, checkoperator, dateType) {
			var retval = '';
			if (checkoperator == true) {
				if ($("#ddlAttrName").find('option:selected').text() == null || $("#ddlAttrName").find('option:selected').text() == '-Select Operator-') {
					retval = 'operator';
				} else {
					if (textType == true) {
						if ($("#txtAttrValue").val().trim() == null || $("#txtAttrValue").val().trim() == '') {
							retval = 'empty';
							if (self.isPaymentApp() && $("#txtappversion").val().trim() != null && $("#txtappversion").val().trim() != '') {
								retval = '';
							}
						} else {
							retval = '';
						}

					}
					if (dateType == true) {
						if ($("#txtAttrFromDate").val().trim() == null || $("#txtAttrFromDate").val().trim() == '') {
							retval = 'empty';
						} else {

							if ($("#ddlAttrName").find('option:selected').text() == 'Between') {
								if ($("#txtAttrToDate").val().trim() == null || $("#txtAttrToDate").val().trim() == '') {
									retval = 'empty';
								} else {
									retval = '';
								}
							} else {
								retval = '';
							}
						}

					}
					if (multiComboType == true) {
						if ($("#ddlMultiCombo").find('option:selected').text() == null || $("#ddlMultiCombo").find('option:selected').text() == '' || $("#ddlMultiCombo").find('option:selected').text() == '-Select ControlValue-') {
							retval = 'empty';
						} else {
							retval = '';
						}

					}
					if (comboType == true) {
						if ($("#ddlCombo").find('option:selected').text() == null || $("#ddlCombo").find('option:selected').text() == '' || $("#ddlCombo").find('option:selected').text() == '-Select ControlValue-' || $("#ddlCombo").find('option:selected').text() == '-Select value-') {

							retval = 'empty';
						} else {
							retval = '';
						}

					}
				}
			}
			return retval;
		}

		function loadHierarchy(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				//new template code
				var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
				var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
				ko.components.register(elementname, {
					viewModel: { require: ViewName },
					template: { require: 'plugin/text!' + htmlName }
				});
			}
			self.observableHierarchy(elementname);

		}

		self.selectSavedSearchType = function () {
			if ($("#rbtPrivate").is(':checked')) {
				self.checkAccessType('Private');
				$("#chkDefaultSearch").prop('disabled', false);
			} else {
				self.checkAccessType('Public');
				$("#chkDefaultSearch").prop('checked', false);
				$("#chkDefaultSearch").prop('disabled', true);
			}
			return true;
		}

		self.setAsDefaultSearch = function () {
			var checkGroupArr = self.criteriaGroups();
			var checkHierarchyArr = self.hierarchyFullPath();
			var checkAttrArr = self.attrbuteCriteriaArr();

			if ($("#chkDefaultSearch").is(':checked')) {
				if (self.searchCheck() == AppConstants.get('HIERARCHY')) {
					if (checkHierarchyArr.length > 0 || checkAttrArr.length > 0) {
						if ($("#txtSearchName").val().trim() != '') {
							$("#btnSave").removeAttr('disabled');
						}
					}
				} else {
					if (checkGroupArr.length > 0 || checkAttrArr.length > 0) {
						if ($("#txtSearchName").val().trim() != '') {
							$("#btnSave").removeAttr('disabled');
						}
					}
				}
			}
			return true;
		}

		self.confirmUpdateSavedSearch = function () {
			var accessType = self.checkAccessType();
			var searchId = self.SearchId();
			var allSearchesList = self.allSearches();
			var selectedSearch = _.findWhere(allSearchesList, { SearchID: searchId });

			if (selectedSearch && ((selectedSearch.IsPrivateSearch == true && accessType == 'Private') || (selectedSearch.IsPrivateSearch == false && accessType == 'Public'))) {
				self.saveAdvancedSearch('groupsGrid');
			}
			else {
				if (selectedSearch && selectedSearch.IsPrivateSearch) {
					if (userPersonalization && searchId == userPersonalization.DefaultSearchId) {
						$("#updateSaveSearchConfirmationPopup").modal('hide');
						openAlertpopup(1, 'default_search_message_onmodify_search');
					}
					else {
						self.saveAdvancedSearch('groupsGrid');
					}
				}
				else {
					checkIsSavedSearchSetAsDefaultAndSave(searchId);
				}
			}
		}

		function checkIsSavedSearchSetAsDefaultAndSave(searchId) {
			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.getUserPersonalizationResp) {
							data.getUserPersonalizationResp = $.parseJSON(data.getUserPersonalizationResp);
						}

						if (data.getUserPersonalizationResp.UserPersonalization && data.getUserPersonalizationResp.UserPersonalization.DefaultSearchId > 0) {
							$("#updateSaveSearchConfirmationPopup").modal('hide');
							openAlertpopup(1, 'default_search_message_onmodify_search');
						}
						else {
							self.saveAdvancedSearch('groupsGrid');
						}
					}
				}
			}
			var params = '{"token":"' + TOKEN() + '","searchId":' + searchId + '}';
			ajaxJsonCall("GetUserPersonalizationBySerachId", params, callbackFunction, true, 'POST', true);
		}

		self.declineUpdateSavedSeach = function () {
			$("#updateSaveSearchConfirmationPopup").modal('hide');
		}

		self.closeInfo = function () {
			$("#informationPopupForSelectedColumns").modal('hide');
			self.clearAttr();
		}

		self.saveAdvanceSearchOnPopup = function () {
			if (self.hierarchyFullPath().length > 0 || self.criteriaGroups().length > 0 || self.attrbuteCriteriaArr().length > 0) {
				if (self.SearchId() != 0) {
					if (self.isCopyMode() == true) {

						self.isEditMode(false);
					} else {

						self.isEditMode(true);
					}
				} else {
					self.isEditMode(false);
					self.SearchId(0);
					koUtil.savedSearchId = 0;
				}

			}
			if (self.isEditMode() == true) {
				//$("#savedSeachNameDescription").val(addAdvancedSearchReq.AdvancedSearch.SearchName);
				$("#updateSaveSearchConfirmationPopup").modal('show');
			} else {
				self.saveAdvancedSearch('groupsGrid');
			}
		}

		self.saveAdvancedSearch = function (gId) {
			if (ADSearchUtil.AdScreenName == "deviceSearch") {		//Device Search grid is restricted to only 21 columns
				var criteriaCount = 0;
				if (self.criteriaGroups().length > 0) {
					criteriaCount++;
				}

				if (self.attrbuteCriteriaArr().length > 0) {
					criteriaCount++;
				}

				if (criteriaCount > 15) {
					$("#informationPopupForSelectedColumns").modal('show');
					return;
				}
			}

			self.issaveSearch(true);
			if (self.hierarchyFullPath().length > 0 || self.criteriaGroups().length > 0 || self.attrbuteCriteriaArr().length > 0) {
				if (self.SearchId() != 0) {
					if (self.isCopyMode() == true) {
						self.isEditMode(false);
					} else {
						self.isEditMode(true);
					}
				} else {
					self.isEditMode(false);
					self.SearchId(0);
					koUtil.savedSearchId = 0;
				}

				var addAdvancedSearchReq = new Object();
				var AdvancedSearch = new Object();
				var AdvancedSearchGroup = new Array();
				var selectedGroupData = self.criteriaGroups();
				if (self.searchCheck() == AppConstants.get('GROUPS')) {
					for (var i = 0; i < selectedGroupData.length; i++) {
						var EAdvancedSearchGroup = new Object();
						EAdvancedSearchGroup.GroupId = selectedGroupData[i].GroupId;
						EAdvancedSearchGroup.GroupName = selectedGroupData[i].GroupName;
						EAdvancedSearchGroup.SearchId = self.SearchId();
						AdvancedSearchGroup.push(EAdvancedSearchGroup);
						ADSearchUtil.selectedGroupsForAdSearch.push(EAdvancedSearchGroup);
					}
				}

				var AdvancedSearchHierarchy = new Array();
				var HierarchyPathArr = self.hierarchyFullPath();
				for (var i = 0; i < HierarchyPathArr.length; i++) {
					var EAdvancedSearchHierarchy = new Object();
					EAdvancedSearchHierarchy.HierarchyFullPath = HierarchyPathArr[i].HierarchyFullPath;
					EAdvancedSearchHierarchy.HierarchyId = HierarchyPathArr[i].HierarchyId;
					EAdvancedSearchHierarchy.IncludeChildren = HierarchyPathArr[i].IncludeChildren;
					EAdvancedSearchHierarchy.IsChildExists = HierarchyPathArr[i].IsChildExists;
					EAdvancedSearchHierarchy.SearchId = self.SearchId();
					AdvancedSearchHierarchy.push(EAdvancedSearchHierarchy);
				}
				var substatusSearchvalue = '';
				var modelsearchvalue = '';
				var devicestatusSearchvalue = '';
				var modeofconnectivitySearchvalue = '';
				var softwareAssignmentTypeSearchvalue = '';
				var vtpEncryptionStatusSearchvalue = ''
				var AutoDwnLoadStatusSearchvalue = ''

				var AdvancedSearchModel = new Array();
				var arrayModels = self.multiselctedModels();
				for (var i = 0; i < arrayModels.length; i++) {
					var SearchModel = new Object();
					if (arrayModels[i].Id == undefined) {
						SearchModel.ModelId = arrayModels[i].id;
					} else {
						SearchModel.ModelId = arrayModels[i].Id;
					}
					SearchModel.ModelName = arrayModels[i].Name;
					modelsearchvalue += arrayModels[i].displaytext + ',';
					AdvancedSearchModel.push(SearchModel);
				}
				modelsearchvalue = modelsearchvalue.substr(0, modelsearchvalue.length - 1);

				var AdvancedSearchStatus = new Array();
				var arrayDeviceStatus = self.multiselctedDeviceStatus();
				for (var i = 0; i < arrayDeviceStatus.length; i++) {

					var EAdvancedSearchStatus = new Object();
					EAdvancedSearchStatus.DeviceStatus = arrayDeviceStatus[i].Name;
					devicestatusSearchvalue += arrayDeviceStatus[i].displaytext + ',';
					AdvancedSearchStatus.push(EAdvancedSearchStatus);
				}
				devicestatusSearchvalue = devicestatusSearchvalue.substr(0, devicestatusSearchvalue.length - 1);

				var arraySubStatus = self.multiselctedSubStatus();
				var AdvancedSearchSubStatus = new Array();
				for (var i = 0; i < arraySubStatus.length; i++) {

					var EAdvancedSearchSubStatus = new Object();
					EAdvancedSearchSubStatus.SubStatus = arraySubStatus[i].Name;
					substatusSearchvalue += arraySubStatus[i].displaytext + ',';
					AdvancedSearchSubStatus.push(EAdvancedSearchSubStatus);
				}
				substatusSearchvalue = substatusSearchvalue.substr(0, substatusSearchvalue.length - 1);

				var arrayModeOfConnectivity = self.multiSelectedModeOfConnectivity();
				var AdvancedSearchModeOfConnectivity = new Array();
				for (var i = 0; i < arrayModeOfConnectivity.length; i++) {

					var EAdvancedSearchModeOfConnectivity = new Object();
					EAdvancedSearchModeOfConnectivity.ModeOfConnectivity = arrayModeOfConnectivity[i].Name;
					modeofconnectivitySearchvalue += arrayModeOfConnectivity[i].displaytext + ',';
					AdvancedSearchModeOfConnectivity.push(EAdvancedSearchModeOfConnectivity);
				}
				modeofconnectivitySearchvalue = modeofconnectivitySearchvalue.substr(0, modeofconnectivitySearchvalue.length - 1);

				var arraySoftwareAssignmentType = self.multiSelectedSoftwareAssignmentType();
				var AdvancedSoftwareAssignmentType = new Array();
				for (var i = 0; i < arraySoftwareAssignmentType.length; i++) {

					var EAdvancedSearchSoftwareAssignmentType = new Object();
					EAdvancedSearchSoftwareAssignmentType.SoftwareAssignmentType = arraySoftwareAssignmentType[i].Name;
					softwareAssignmentTypeSearchvalue += arraySoftwareAssignmentType[i].displaytext + ',';
					AdvancedSoftwareAssignmentType.push(EAdvancedSearchSoftwareAssignmentType);
				}
				softwareAssignmentTypeSearchvalue = softwareAssignmentTypeSearchvalue.substr(0, softwareAssignmentTypeSearchvalue.length - 1);


				var arrayVTPEncryption = self.multiSelectedVTPEncryptionStatus();
				var AdvancedSearchVTPEncryptionStatus = new Array();
				for (var i = 0; i < arrayVTPEncryption.length; i++) {

					var EAdvancedSearchVTPEncryptionStatus = new Object();
					EAdvancedSearchVTPEncryptionStatus.VTPEncryptionStatus = arrayVTPEncryption[i].Name;
					vtpEncryptionStatusSearchvalue += arrayVTPEncryption[i].displaytext + ',';
					AdvancedSearchVTPEncryptionStatus.push(EAdvancedSearchVTPEncryptionStatus);
				}
				vtpEncryptionStatusSearchvalue = vtpEncryptionStatusSearchvalue.substr(0, vtpEncryptionStatusSearchvalue.length - 1);

				var arrayAutoDownload = self.multiSelectedAutoDownloadEnbaled();
				var AdvancedSearchAutoDownloadStatus = new Array();
				for (var i = 0; i < arrayAutoDownload.length; i++) {

					var EAdvancedSearchAutoDwnloadEnbaled = new Object();
					EAdvancedSearchAutoDwnloadEnbaled.AutoDwnLoad = arrayAutoDownload[i].Name;
					AutoDwnLoadStatusSearchvalue += arrayAutoDownload[i].displaytext + ',';
					AdvancedSearchAutoDownloadStatus.push(EAdvancedSearchAutoDwnloadEnbaled);
				}
				AutoDwnLoadStatusSearchvalue = AutoDwnLoadStatusSearchvalue.substr(0, AutoDwnLoadStatusSearchvalue.length - 1);

				var AdvanedSearchElement = new Array();
				var arrayAttributes = self.attrbuteCriteriaArr();
				for (var i = 0; i < arrayAttributes.length; i++) {
					var EAdvancedSearchElement = new Object();
					EAdvancedSearchElement.DeviceSearchAttributeId = arrayAttributes[i].DeviceSearchAttributeId;
					EAdvancedSearchElement.DeviceSearchOperatorId = arrayAttributes[i].SelectedDeviceSearchOperatorId;
					EAdvancedSearchElement.SearchElementSeqNo = i;
					EAdvancedSearchElement.SearchId = self.SearchId();
					if (arrayAttributes[i].DisplayName == 'Model') {
						EAdvancedSearchElement.SearchValue = modelsearchvalue;
					} else if (arrayAttributes[i].DisplayName == 'Device Status') {
						EAdvancedSearchElement.SearchValue = devicestatusSearchvalue;
					} else if (arrayAttributes[i].DisplayName == 'Sub Status') {
						EAdvancedSearchElement.SearchValue = substatusSearchvalue;
					} else if (arrayAttributes[i].DisplayName == 'ModeofConnectivity') {
						EAdvancedSearchElement.SearchValue = modeofconnectivitySearchvalue;
					} else if (arrayAttributes[i].DisplayName == 'Software Assignment Type') {
						EAdvancedSearchElement.SearchValue = !_.isEmpty(softwareAssignmentTypeSearchvalue) ? softwareAssignmentTypeSearchvalue : arrayAttributes[i].ControlValues;
					} else if (arrayAttributes[i].DisplayName == 'VTP Encryption Status') {
						EAdvancedSearchElement.SearchValue = vtpEncryptionStatusSearchvalue;
					} else if (arrayAttributes[i].DisplayName == 'Enable Automatic Download') {
						EAdvancedSearchElement.SearchValue = AutoDwnLoadStatusSearchvalue;
					} else {
						EAdvancedSearchElement.SearchValue = arrayAttributes[i].ControlValues;
					}

					EAdvancedSearchElement.SearchValueOptional1 = arrayAttributes[i].OptionalValue;
					AdvanedSearchElement.push(EAdvancedSearchElement);
				}

				var SearchText = '';
				if (HierarchyPathArr.length > 0) {
					SearchText += 'Search Type = Hierarchy <br/>';

					for (var i = 0; i < HierarchyPathArr.length; i++) {
						SearchText += 'Hierarchy = ';
						SearchText += HierarchyPathArr[i].HierarchyFullPath + ' <br/>';
					}
				}

				if (selectedGroupData.length > 0) {
					SearchText += 'Search Type = Group <br/>';
					SearchText += 'Group = ';

					for (var i = 0; i < selectedGroupData.length; i++) {
						SearchText += selectedGroupData[i].GroupName + ',';
						SearchText += '<br/>';
					}
				}

				var attrArr = self.attrbuteCriteriaArr();
				if (attrArr && attrArr.length > 0) {
					SearchText += 'Attribute =';

					for (var i = 0; i < attrArr.length; i++) {
						SearchText += ' ' + attrArr[i].DisplayName;
						SearchText += ' ' + attrArr[i].OperatorValue;

						if (attrArr[i].AttributeName == 'ModelName') {
							var arraySelectedModels = self.multiselctedModels();
							for (var k = 0; k < arraySelectedModels.length; k++) {

								SearchText += ' ' + arraySelectedModels[k].displaytext + ','
							}
							SearchText = SearchText.slice(0, -1);
							SearchText += ';'
						} else if (attrArr[i].AttributeName == 'ComputedDeviceStatus') {
							var arraySelectedDeviceStatus = self.multiselctedDeviceStatus();
							for (var j = 0; j < arraySelectedDeviceStatus.length; j++) {

								SearchText += ' ' + arraySelectedDeviceStatus[j].displaytext + ','
							}
							SearchText = SearchText.slice(0, -1);
							SearchText += ';'
						} else if (attrArr[i].AttributeName == 'SubStatus') {
							var arraySelectedSubStatus = self.multiselctedSubStatus();
							for (var j = 0; j < arraySelectedSubStatus.length; j++) {

								SearchText += ' ' + arraySelectedSubStatus[j].displaytext + ','
							}
							SearchText = SearchText.slice(0, -1);
							SearchText += ';'
						} else if (attrArr[i].AttributeName == 'ModeofConnectivity') {
							var arraySelectedModeOfConnectivity = self.multiSelectedModeOfConnectivity();
							for (var j = 0; j < arraySelectedModeOfConnectivity.length; j++) {

								SearchText += ' ' + arraySelectedModeOfConnectivity[j].displaytext + ','
							}
							SearchText = SearchText.slice(0, -1);
							SearchText += ';'
						} else if (attrArr[i].AttributeName == 'SoftwareAssignmentType') {
							var arraySelectedSoftwareAssignmentType = self.multiSelectedSoftwareAssignmentType();
							if (!_.isEmpty(arraySelectedSoftwareAssignmentType)) {
								for (var j = 0; j < arraySelectedSoftwareAssignmentType.length; j++) {
									SearchText += ' ' + arraySelectedSoftwareAssignmentType[j].displaytext + ','
								}
								SearchText = SearchText.slice(0, -1);
								SearchText += ';'
							} else {
								SearchText += ' ' + attrArr[i].ControlValues + ';';
							}
						} else if (attrArr[i].AttributeName == 'EncrEnabled') {
							var arraySelectedVTPEncryptionStatus = self.multiSelectedVTPEncryptionStatus();
							for (var j = 0; j < arraySelectedVTPEncryptionStatus.length; j++) {

								SearchText += ' ' + arraySelectedVTPEncryptionStatus[j].displaytext + ','
							}
							SearchText = SearchText.slice(0, -1);
							SearchText += ';'
						} else if (attrArr[i].AttributeName == 'Enable Automatic Download') {
							var arraySelectedAutoDownloadStatus = self.multiSelectedAutoDownloadEnbaled();
							for (var j = 0; j < arraySelectedAutoDownloadStatus.length; j++) {

								SearchText += ' ' + arraySelectedAutoDownloadStatus[j].displaytext + ','
							}
							SearchText = SearchText.slice(0, -1);
							SearchText += ';'
						} else if (attrArr[i].AttributeName == 'Name' || attrArr[i].AttributeName == 'PaymentAppName') {
							SearchText += ' Name: ' + attrArr[i].ControlValues;
							SearchText += ' Version: ' + attrArr[i].OptionalValue + ';';
						} else if (attrArr[i].ControlType == 'Date') {
							if (attrArr[i].OptionalValue == null) {
								SearchText += ' ' + attrArr[i].ControlValues + ';';
							} else {
								SearchText += ' From: ' + attrArr[i].ControlValues;
								SearchText += ' To: ' + attrArr[i].OptionalValue + ';';
							}
						} else {
							SearchText += ' ' + attrArr[i].ControlValues + ';';
						}
					}
					if ($("#chkAutoSelectConnected").is(':checked') === true) {
						SearchText += ' Include Connected Devices';
					}
				} else {
					if ($("#chkAutoSelectConnected").is(':checked') === true) {
						SearchText += 'Attribute = Include Connected Devices';
					}
				}
				AdvancedSearch.AdvancedSearchGroup = AdvancedSearchGroup;
				AdvancedSearch.AdvancedSearchHierarchy = AdvancedSearchHierarchy;
				AdvancedSearch.AdvancedSearchModel = AdvancedSearchModel;

				AdvancedSearch.AdvancedSearchStatus = AdvancedSearchStatus;// [{ "EAdvancedSearchStatus": [2] }];
				AdvancedSearch.AdvanedSearchElement = AdvanedSearchElement;
				if (self.checkAccessType() == 'Private') {
					AdvancedSearch.IsPrivateSearch = true;
				} else {
					AdvancedSearch.IsPrivateSearch = false;
				}

				AdvancedSearch.SearchId = self.SearchId();
				AdvancedSearch.SearchName = $("#txtSearchName").val().trim();
				AdvancedSearch.SearchText = SearchText;
				AdvancedSearch.IsIncludeConnectedDevices = $("#chkAutoSelectConnected").is(':checked') ? true : false;
				addAdvancedSearchReq.AdvancedSearch = AdvancedSearch;
				saveAdvancedSearch(self.clearAdvancedSearch, addAdvancedSearchReq, gId, self.allSearches, self.hierarchyFullPath, self.criteriaGroups, self.attrbuteCriteriaArr, self.AttributeData, self.checkAccessType, self.isEditMode, self.multiselctedModels, self.multiselctedDeviceStatus, self.multiSelectedModeOfConnectivity, self.multiSelectedVTPEncryptionStatus, self.isCopyMode, self.backUpAttributeData, self.searchCheck, self.SearchId, self.multiSelectedSoftwareAssignmentType);
			}
		}

		self.hideinfo = function () {
			$("#AdInformationPopup").modal('hide');
			//if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			//} else {
			$("#mainPageBody").addClass('modal-open-appendon');
			//}
		}

		self.applyAdvanceFilter = function (parent) {
			if (ADSearchUtil.AdScreenName == "deviceSearch") {		//Device Search grid is restricted to only 21 columns
				var criteriaCount = 0;
				if (self.criteriaGroups().length > 0) {
					var source = _.where(self.selectedGridColumns(), { AttributeName: "GroupNames" });
					if (!source || source.length == 0) {
						criteriaCount++;
					}
				}

				if ((self.selectedGridColumns().length + criteriaCount) > 15) {
					$("#informationPopupForSelectedColumns").modal('show');
					return;
				}
			}

			if (isFileSearch === true) {
				if (_.isEmpty(fileSearchElements) && fileSearchElements.length === 0) {
					openAlertpopup(2, i18n.t('custom_csv_invalid_search_file'));
					return;
				}
			}

			if (ADSearchUtil.AdScreenName == "schedule")
				isSearchAppliedForSchedule = true;

			isFromDeviceSearch = false;
			isAdvancedSavedSearchApplied = true;
			isSearchReset = false;

			koUtil.isFromScheduleDownloadsScreen = 0;
			koUtil.isFromScheduleScreen = 0;
			koUtil.isFromScheduleActionScreen = 0;
			koUtil.isQuickSearchApplied = 1;
			koUtil.isAdvancedSearch = 1;
			koUtil.savedSearchId = 0;

			//$("#txtQuickSearchDevice, #idCustomSearchModalCriteria").val('');
			if (ADSearchUtil.AdScreenName == "deviceSearch") {
				$("#deviceCriteriaDiv").addClass('hide');
				careData = new Object();
				careSearchObject = new Object();
			} else {
				$("#deviceCriteriaDiv").removeClass('hide');
			}
			$("#resetBtnForChart").addClass('hide');
			$("#resetBtnForGrid").removeClass('hide');
			window.sessionStorage.removeItem("CustomSearchText");
			window.sessionStorage.removeItem("customSearchStore");
			var retval = attributValidation(self.textType(), self.multiComboType(), self.comboType(), self.checkoperator(), self.dateType());

			if (self.textType() == true || self.dateType() == true || self.multiComboType() == true || self.comboType() == true || self.applicationType() == true) {
				AdvancedOpenAlertPopup(1, 'please_add_selected_attribute_value');
				$("#resetBtnForGrid").addClass('hide');
			} else {
				if (ADSearchUtil.AdScreenName == 'deviceSearch') {
					$("#advanceCriteria").removeClass("quickCriHide");
					$("#deviceCriteriaDiv").css("display", "none");
					$("#ResultCriteriaDiv").css("display", "block");
				}

				$("#searchInProgress").modal('show');
				$("#mainPageBody").removeClass('modal-open-appendon');

				CallType = ENUM.get("CALLTYPE_NONE");

				if (isDeviceSearchWithAdvanceSearch == false) {
					isDeviceSearchWithAdvanceSearch = true;
				}

				//prepare Device Search object
				var DeviceSearch = new Object();

				//Device Status
				if (ADSearchUtil.AdScreenName == 'deletedDevice') {
					careDataDeletedDevices = new Object();
					careSearchDeletedDevicesObject = new Object();
					DeviceSearch.DeviceStatus = ["Deleted"];
				} else {
					var deviceStatus = new Array();
					var arr = self.multiselctedDeviceStatus();
					if (arr && arr.length > 0) {
						for (var i = 0; i < arr.length; i++) {
							deviceStatus.push(arr[i].Name);
						}
					}
					DeviceSearch.DeviceStatus = deviceStatus;
					var subStatus = new Array();
					var arr = self.multiselctedSubStatus();
					if (arr && arr.length > 0) {
						for (var i = 0; i < arr.length; i++) {
							subStatus.push(arr[i].Name);
						}
					}
				}

				var HierarchyIdsWithChildren = new Array();
				var HierarchyIdsWithoutChildren = new Array();
				var HierarchyPathArr = self.hierarchyFullPath();
				var selectedGroupData = self.criteriaGroups();
				var GroupArr = new Array();

				var adStorage = JSON.parse(window.sessionStorage.getItem(gId + "adStorage"));
				if (self.searchCheck() == AppConstants.get('HIERARCHY')) {
					for (var i = 0; i < HierarchyPathArr.length; i++) {
						if (HierarchyPathArr[i].IsChildExists) {
							if (HierarchyPathArr[i].IncludeChildren) {
								HierarchyIdsWithChildren.push(HierarchyPathArr[i].HierarchyId);
							} else {
								HierarchyIdsWithoutChildren.push(HierarchyPathArr[i].HierarchyId);
							}

						} else {
							HierarchyIdsWithoutChildren.push(HierarchyPathArr[i].HierarchyId);
						}
					}
					if (adStorage && adStorage.length > 0) {
						adStorage[0].AdvancedSearchFlag = AppConstants.get('HIERARCHY');
						adStorage[0].AdvancedSearchHierarchy = HierarchyPathArr;
						adStorage[0].AdvancedSearchGroup = null;
						adStorage[0].isWithGroup = 0;
					}
				} else if (self.searchCheck() == AppConstants.get('GROUPS')) {
					if (adStorage && adStorage.length > 0) {
						adStorage[0].AdvancedSearchFlag = AppConstants.get('GROUPS');
						if (selectedGroupData && selectedGroupData.length > 0) {
							for (var i = 0; i < selectedGroupData.length; i++) {
								GroupArr.push(selectedGroupData[i].GroupId);
							}
						}
						adStorage[0].AdvancedSearchGroup = self.criteriaGroups();
						adStorage[0].AdvancedSearchHierarchy = null;
						adStorage[0].isWithGroup = 1;
					}
				}

				DeviceSearch.HierarchyIdsWithChildren = HierarchyIdsWithChildren;
				DeviceSearch.HierarchyIdsWithoutChildren = HierarchyIdsWithoutChildren;
				if (self.hierarchyFullPath() == '') {
					DeviceSearch.IsHierarchiesSelected = false;
				} else {
					DeviceSearch.IsHierarchiesSelected = true;
				}
				DeviceSearch.GroupIds = GroupArr;
				DeviceSearch.IsIncludeConnectedDevices = $("#chkAutoSelectConnected").is(':checked') ? true : false;

				var updatedadStorage = JSON.stringify(adStorage);
				window.sessionStorage.setItem(gId + 'adStorage', updatedadStorage);

				if (ADSearchUtil.AdScreenName == "deviceSearch") {
					selectedColumnsClone = new Array();
					for (var m = 0; m < self.selectedGridColumns().length; m++) {
						selectedColumnsClone.push(self.selectedGridColumns()[m]);
					}
					DeviceSearch.SelectedHeaders = selectedColumnsClone;			//custom columns only for Device Search grid
				} else {
					DeviceSearch.SelectedHeaders = [];
				}
				DeviceSearch.IsOnlyDeleteBlacklisted = false;
				DeviceSearch.SearchCriteria = null;
				DeviceSearch.IsFileSearch = isFileSearch;

				//File Search
				if (isFileSearch === true) {
					DeviceSearch.SearchElements = fileSearchElements;
				} else {
					//Device Attributes
					var searchElements = new Array();
					var arr = self.attrbuteCriteriaArr();
					if (arr && arr.length > 0) {
						for (var i = 0; i < arr.length; i++) {
							if (arr[i].DisplayName == 'Model' || arr[i].DisplayName == 'Device Status') {
								continue;
							} else {
								var DeviceSearchElement = new Object();

								DeviceSearchElement.ControlType = ENUM.get(arr[i].ControlType.toUpperCase());
								DeviceSearchElement.DeviceSearchAttributeId = arr[i].DeviceSearchAttributeId;
								DeviceSearchElement.DeviceSearchOperatorId = arr[i].SelectedDeviceSearchOperatorId;
								DeviceSearchElement.SearchElementSeqNo = i;
								DeviceSearchElement.SearchId = 0;
								if (arr[i].DisplayName == 'Mode of Connectivity') {
									var searchValModeofConnectivity = self.multiSelectedModeOfConnectivity();
									var searchValString = '';
									if (searchValModeofConnectivity && searchValModeofConnectivity.length > 0) {
										for (var j = 0; j < searchValModeofConnectivity.length; j++) {
											searchValString += searchValModeofConnectivity[j].Name + ",";
										}
										searchValString = searchValString.slice(0, -1);
									}
									DeviceSearchElement.SearchValue = searchValString;
								} else if (arr[i].DisplayName == 'Software Assignment Type') {
									var searchValSoftwareAssignmentType = self.multiSelectedSoftwareAssignmentType();
									var searchValString = '';
									if (searchValSoftwareAssignmentType && searchValSoftwareAssignmentType.length > 0) {
										for (var j = 0; j < searchValSoftwareAssignmentType.length; j++) {
											searchValString += searchValSoftwareAssignmentType[j].Name + ",";
										}
										searchValString = searchValString.slice(0, -1);
									}
									DeviceSearchElement.SearchValue = searchValString;
								} else if (arr[i].DisplayName == 'VTP Encryption Status') {
									var searchValVTPEncryptionStatus = self.multiSelectedVTPEncryptionStatus();
									var searchValString = '';
									if (searchValVTPEncryptionStatus && searchValVTPEncryptionStatus.length > 0) {
										for (var j = 0; j < searchValVTPEncryptionStatus.length; j++) {
											searchValString += searchValVTPEncryptionStatus[j].Name + ",";
										}
										searchValString = searchValString.slice(0, -1);
									}
									DeviceSearchElement.SearchValue = searchValString;
								} else if (arr[i].DisplayName == 'Sub Status') {
									var searchmultiselctedSubStatus = self.multiselctedSubStatus();
									var searchValString = '';
									if (searchmultiselctedSubStatus && searchmultiselctedSubStatus.length > 0) {
										for (var j = 0; j < searchmultiselctedSubStatus.length; j++) {
											searchValString += searchmultiselctedSubStatus[j].Name + ",";
										}
										searchValString = searchValString.slice(0, -1);
									}
									DeviceSearchElement.SearchValue = searchValString;
								}
								else {
									DeviceSearchElement.SearchValue = arr[i].ControlValues;
								}
								DeviceSearchElement.SearchValueOptional1 = arr[i].OptionalValue;
								searchElements.push(DeviceSearchElement);
							}
						}
					}
					if (ADSearchUtil.AdScreenName === 'deviceSearch' && $("#chkAutoSelectConnected").is(':checked') === true) {
						var booleanAttributeItem = new Object();
						var booleanAttributeOperator = new Object();
						booleanAttributeOperator.OperatorValue = 'Equal To';
						booleanAttributeOperator.DeviceSearchAttributeId = 0;
						booleanAttributeOperator.SelectedDeviceSearchOperatorId = 0;
						booleanAttributeOperator.DisplayName = "Connected Devices";

						booleanAttributeItem.AttributeName = 'ConnectedDevices';
						booleanAttributeItem.ControlType = 'checkbox';
						booleanAttributeItem.DeviceSearchAttributeId = 0;
						booleanAttributeItem.DeviceSearchAttributeOperators = [booleanAttributeOperator];
						booleanAttributeItem.DisplayName = "Connected Devices";
						booleanAttributeItem.OperatorValue = 'Equal To';
						booleanAttributeItem.OptionalValue = "";
						booleanAttributeItem.SearchElementSeqNo = 0;
						booleanAttributeItem.SearchId = 0;
						booleanAttributeItem.SelectedDeviceSearchOperatorId = 0;
						booleanAttributeItem.toolTip = 'Include Connected Devices';

						ADSearchUtil.attributeDataArr.push(booleanAttributeItem);
						self.attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);
					}

					DeviceSearch.SearchElements = searchElements;
					//Device Attributes
				}
				
				//display search criteria
				var SearchText = '';
				if (HierarchyPathArr.length > 0) {
					SearchText += 'Search Type = Hierarchy <br/>';
					for (var i = 0; i < HierarchyPathArr.length; i++) {
						SearchText += 'Hierarchy = ';
						SearchText += HierarchyPathArr[i].HierarchyFullPath + ' <br/>';
					}
				}

				if (selectedGroupData.length > 0) {
					SearchText += 'Search Type = Group <br/>';
					SearchText += 'Group = ';

					for (var i = 0; i < selectedGroupData.length; i++) {
						SearchText += selectedGroupData[i].GroupName + ',';
					}
					SearchText += '<br/>';
				}

				var attrArr = self.attrbuteCriteriaArr();
				if (attrArr && attrArr.length > 0) {
					SearchText += 'Attribute =';
					ADSearchUtil.searchAttributeArray = {};
					for (var i = 0; i < attrArr.length; i++) {

						SearchText += ' ' + attrArr[i].DisplayName;
						SearchText += ' ' + attrArr[i].OperatorValue;
						if (attrArr[i].AttributeName == 'ModelName') {
							var arr = self.multiselctedModels();
							ADSearchUtil.searchAttributeArray.multiselctedModels = arr;
							for (var k = 0; k < arr.length; k++) {
								SearchText += ' ' + arr[k].displaytext + ','

							}
							SearchText = SearchText.slice(0, -1);
							SearchText += ';'
						} else if (attrArr[i].AttributeName == 'ComputedDeviceStatus') {
							var arr = self.multiselctedDeviceStatus();
							ADSearchUtil.searchAttributeArray.multiselctedDeviceStatus = arr;
							for (var j = 0; j < arr.length; j++) {

								SearchText += ' ' + arr[j].displaytext + ','
							}
							SearchText = SearchText.slice(0, -1);
							SearchText += ';'
						} else if (attrArr[i].AttributeName == 'SubStatus') {
							var arr = self.multiselctedSubStatus();
							ADSearchUtil.searchAttributeArray.multiselctedSubStatus = arr;
							for (var j = 0; j < arr.length; j++) {

								SearchText += ' ' + arr[j].displaytext + ','
							}
							SearchText = SearchText.slice(0, -1);
							SearchText += ';'
						} else if (attrArr[i].AttributeName == 'ModeofConnectivity') {

							var arr = self.multiSelectedModeOfConnectivity();
							ADSearchUtil.searchAttributeArray.multiSelectedModeOfConnectivity = arr;
							for (var j = 0; j < arr.length; j++) {

								SearchText += ' ' + arr[j].displaytext + ','
							}
							SearchText = SearchText.slice(0, -1);
							SearchText += ';'
						} else if (attrArr[i].AttributeName == 'SoftwareAssignmentType') {

							var arr = self.multiSelectedSoftwareAssignmentType();
							ADSearchUtil.searchAttributeArray.multiSelectedSoftwareAssignmentType = arr;
							for (var j = 0; j < arr.length; j++) {

								SearchText += ' ' + arr[j].displaytext + ','
							}
							SearchText = SearchText.slice(0, -1);
							SearchText += ';'
						} else if (attrArr[i].AttributeName == 'EncrEnabled') {
							var arr = self.multiSelectedVTPEncryptionStatus();
							ADSearchUtil.searchAttributeArray.multiSelectedVTPEncryptionStatus = arr;
							for (var j = 0; j < arr.length; j++) {

								SearchText += ' ' + arr[j].displaytext + ','
							}
							SearchText = SearchText.slice(0, -1);
							SearchText += ';'
						} else if (attrArr[i].AttributeName == 'Name' || attrArr[i].AttributeName == 'PaymentAppName') {
							SearchText += ' Name: ' + attrArr[i].ControlValues;
							SearchText += ' Version: ' + attrArr[i].OptionalValue + ';';
						} else if (attrArr[i].ControlType == 'Date') {
							if (attrArr[i].OptionalValue) {
								SearchText += ' ' + attrArr[i].ControlValues + ';';
							} else {
								SearchText += ' From: ' + attrArr[i].ControlValues;
								SearchText += ' To: ' + attrArr[i].OptionalValue + ';';
							}
						}
						else {
							SearchText += ' ' + attrArr[i].ControlValues + ';';
						}
						if ($("#chkAutoSelectConnected").is(':checked') === true) {
							SearchText += ' Include Connected Devices';
						}
					}
				} else {
					if ($("#chkAutoSelectConnected").is(':checked') === true) {
						SearchText += 'Attribute = Include Connected Devices';
					}
				}
				//display search criteria

				if (gId != "Devicejqxgrid") {
					ADSearchUtil.searchAttributeArray = {};
				}
				ADSearchUtil.SearchText = SearchText;
				ADSearchUtil.SearchCriteria = SearchText;

				window.sessionStorage.setItem(gId + 'CustomSearchText', ADSearchUtil.SearchText);
				window.sessionStorage.setItem(gId + 'CustomSearchCriteria', ADSearchUtil.SearchCriteria);
				window.sessionStorage.setItem("CustomSearchText", SearchText);
				$("#deviceCriteriaDiv").empty();
				$("#deviceCriteriaDiv").append(SearchText);

				//Models
				var searchModels = new Array();
				var arr = self.multiselctedModels();
				if (arr && arr.length > 0) {
					for (var i = 0; i < arr.length; i++) {
						var SearchModel = new Object();

						if (arr[i].id != undefined) {
							SearchModel.ModelId = arr[i].id;
						} else {
							SearchModel.ModelId = arr[i].Id;
						}
						SearchModel.ModelName = arr[i].Name;
						searchModels.push(SearchModel);
					}
				}
				DeviceSearch.SearchModels = searchModels;
				DeviceSearch.SearchID = 0;
				DeviceSearch.SearchName = null;

				if (self.checkAccessType() == 'Private') {
					DeviceSearch.IsPrivateSearch = true;
				} else {
					DeviceSearch.IsPrivateSearch = false;
				}

				DeviceSearch.SearchText = SearchText;
				DeviceSearch.SearchType = ENUM.get('ADVANCED');
				//Device Search object created all required fields

				ADSearchUtil.deviceSearchObj = DeviceSearch;
				window.sessionStorage.setItem(gId + 'customSearch', JSON.stringify(DeviceSearch));
				updateAdSearchObj(gId, DeviceSearch, 0);

				ADSearchUtil.resetAddSerchFlag = '';
				ADSearchUtil.newAddedDataFieldsArr = [];
				ADSearchUtil.newAddedgridColumns = [];
				ADSearchUtil.ExportDynamicColumns = [];

				if (ADSearchUtil.gridIdForAdvanceSearch == 'jqxgridForSelectedDevices') {
					globalVariableForDownloadSchedule = null;
					koUtil.deviceProfileUniqueDeviceId = null;
					$("#newJobBtn").prop("disabled", true);
					$("#selectedDevicesGrid").show();
					$("#schduleGrid").hide();
					$("#nextBtn").show();
					$("#previousBtn").hide();
					$("#nextSchedule").show();
					$("#showHideResetExportbtn").show();
					$("#tabUL").each(function () {
						$(this).children('li').removeClass('active');
					});
					$("#tabSelectedDevice").addClass('active');
					$("#jqxgridForSelectedDevices").jqxGrid('updatebounddata');
				} else if (ADSearchUtil.gridIdForAdvanceSearch == 'blankSchedulejqxgrid') {
					$("#blankSchedulejqxgrid").jqxGrid('updatebounddata');
				} else if (ADSearchUtil.gridIdForAdvanceSearch == 'blankDevicejqxgrid') {
					$("#blankDevicejqxgrid").jqxGrid('updatebounddata');
				} else {
					gridFilterClear(gId, 0);
				}

				$("#mainPageBody").removeClass('modal-open-appendon');
				isAdpopup = '';
				$(".modalContentReposition").css("left", "");
				$(".modalContentReposition").css("top", "");

				$("#criteriabtnDiv").css("display", "inline");
				$("#resetBtnForChart").addClass('hide');
				$("#resetBtnForGrid").removeClass('hide');
			}
		};

		self.cancelSearch = function () {
			$("#searchInProgress").modal('hide');
			koUtil.isSearchCancelled(true);
		}

		$("#txtQuickSearchDevice").keydown(function (e) {

			if (e.keyCode == 13) {

				//    if (ADSearchUtil.AdScreenName == 'deviceSearch') {


				if ($("#allSearchUL").hasClass('hide')) {
					if ($("#txtQuickSearchDevice").is(":focus")) {
						if ($("#txtQuickSearchDevice").val() != '') {
							//alert('call quick serach')
							$("#allQuickSearchUL").addClass('hide');
							$("#allSearchUL").addClass('hide');

							koUtil.checkQuckDDL = 0;
							self.addQuickSearch();
						} else {
							if ($("#txtQuickSearchDevice").is(":focus")) {

								if (checkenter == 1) {

									checkenter = 0;
									$("#txtQuickSearchDevice").val(selectedtextforupdown);

								} else {

									koUtil.checkQuckDDL = 0;
									self.addQuickSearch();
								}
							}
							$("#allSearchUL").addClass('hide')
						}
					}

				} else {
					if (selectedtextforupdown != AppConstants.get('PRIVATE_SEARCH') && selectedtextforupdown != AppConstants.get('PUBLIC_SEARCH') && selectedtextforupdown != '-------Last Searches-------') {
						//$("#txtQuickSearchDevice").val(selectedtextforupdown);
						//$("#allSearchUL").addClass('hide')
						if ($("#txtQuickSearchDevice").is(":focus")) {

							if (checkenter == 1) {

								checkenter = 0;
								$("#txtQuickSearchDevice").val(selectedtextforupdown);

							} else {

								koUtil.checkQuckDDL = 0;
								self.addQuickSearch();
							}
						}
						$("#allSearchUL").addClass('hide')

					}

				}

			}

		});

		self.editAdvancedSearch = function (data, index) {
			$("#allSearchUL").each(function () {
				$(this).children('li').css("background-color", "");
			});
			$("#selectedQuickSearchLi" + index).css("background-color", "#00aeef");
			self.SearchId(data.SearchID);
			koUtil.isSearchAdmin(data.IsAdmin);
			isSearchAdmin = koUtil.isSearchAdmin();
			self.isNotSearchAdmin = !isSearchAdmin;
			self.observableHierarchy('unloadTemplate');
			loadHierarchy('modalHierarchy', 'genericPopup');

			getAdvancedSearch(data.SearchID, self.hierarchyFullPath, self.criteriaGroups, self.attrbuteCriteriaArr, self.AttributeData, self.checkAccessType, self.isEditMode, self.multiselctedModels, self.multiselctedDeviceStatus, self.multiSelectedModeOfConnectivity, self.multiSelectedVTPEncryptionStatus, self.isCopyMode, self.backUpAttributeData, self.searchCheck, self.multiSelectedSoftwareAssignmentType);
		}

		self.copyAdvancedSearch = function (data, index) {
			$("#allSearchUL").each(function () {
				$(this).children('li').css("background-color", "");
			});
			$("#selectedQuickSearchLi" + index).css("background-color", "#00aeef");
			self.isEditMode(false);
			self.isCopyMode(true);
			self.SearchId(data.SearchID);
			enableDisableSaveOptions(0);
			$("#btnSave").prop('disabled', true);
			getAdvancedSearch(data.SearchID, self.hierarchyFullPath, self.criteriaGroups, self.attrbuteCriteriaArr, self.AttributeData, self.checkAccessType, self.isEditMode, self.multiselctedModels, self.multiselctedDeviceStatus, self.multiSelectedModeOfConnectivity, self.multiSelectedVTPEncryptionStatus, self.isCopyMode, self.backUpAttributeData, self.searchCheck, self.multiSelectedSoftwareAssignmentType);
		}

		self.confirmDelete = function (data) {
			self.isDeleteMode(true);
			self.isEditMode(false);
			$("#sNameForDelete").text(data.SearchName);
			$("#deleteSavedSearchConfirmation").modal('show').css('z-index', '999999');

			self.SearchDataFordelete(data);
			sessionStorage.setItem("SearchDataFordelete", JSON.stringify(data));
		}

		self.closedDeleteConfirmantion = function () {
			$("#deleteSavedSearchConfirmation").modal('hide');
			self.SearchDataFordelete(null);
			self.isDeleteMode(false);
			self.isEditMode(true);
		}

		self.deleteAdvancedSearch = function () {
			var data = self.SearchDataFordelete();
			var searchId = data.SearchID

			if (data.IsPrivateSearch == true && userPersonalization && searchId == userPersonalization.DefaultSearchId) {
				$("#deleteSavedSearchConfirmation").modal('hide');
				openAlertpopup(1, 'default_search_message_delete_search');
			} else if (data.IsPrivateSearch == false) {
				checkIsSavedSearchSetAsDefaultAndDelete(searchId, data.SearchName);
			}
			else {
				$("#txtQuickSearchDevice").val('');
				$("#txtSearchName").val('');
				deleteSaveSearch(searchId, self.allSearches, data.SearchName, self.SearchId, self.isDeleteMode, self.hierarchyFullPath, self.criteriaGroups, self.attrbuteCriteriaArr, self.AttributeData, self.checkAccessType, self.isEditMode, self.multiselctedModels, self.multiselctedDeviceStatus, self.multiselctedSubStatus, self.multiSelectedModeOfConnectivity, self.multiSelectedVTPEncryptionStatus, self.isCopyMode, self.backUpAttributeData, self.searchCheck, self.multiSelectedSoftwareAssignmentType);
				$("#deleteSavedSearchConfirmation").modal('hide');
			}
		}

		function checkIsSavedSearchSetAsDefaultAndDelete(searchId, searchName) {
			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.getUserPersonalizationResp) {
							data.getUserPersonalizationResp = $.parseJSON(data.getUserPersonalizationResp);
						}

						if (data.getUserPersonalizationResp.UserPersonalization && data.getUserPersonalizationResp.UserPersonalization.DefaultSearchId > 0) {
							openAlertpopup(1, 'default_search_message_delete_search');
						}
						else {
							$("#txtQuickSearchDevice").val('');
							$("#txtSearchName").val('');
							deleteSaveSearch(searchId, self.allSearches, searchName, self.SearchId, self.isDeleteMode, self.hierarchyFullPath, self.criteriaGroups, self.attrbuteCriteriaArr, self.AttributeData, self.checkAccessType, self.isEditMode, self.multiselctedModels, self.multiselctedDeviceStatus, self.multiselctedSubStatus, self.multiSelectedModeOfConnectivity, self.multiSelectedVTPEncryptionStatus, self.isCopyMode, self.backUpAttributeData, self.searchCheck, self.multiSelectedSoftwareAssignmentType);
						}

						$("#deleteSavedSearchConfirmation").modal('hide');
					}
				}
			}
			var params = '{"token":"' + TOKEN() + '","searchId":' + searchId + '}';
			ajaxJsonCall("GetUserPersonalizationBySerachId", params, callbackFunction, true, 'POST', true);
		}

		self.selectSearchquick = function (data, index) {
			var searchiid = data.SearchID;
			if (searchiid == 0)
				return;

			var deletedid = "";//self.oldSearchid();
			istypeedquick = 1;
			isGroupModified = false;
			koUtil.isHierarchyModified(false);
			koUtil.isAttributeModified(false);
			koUtil.isSearchCancelled(false);
			koUtil.savedSearchId = data.SearchID;

			if ((self.isCopyMode() == false && self.isDeleteMode() == false) || self.isEditMode() == true) {
				self.isEditMode(true);
				$("#btnApplyFilter").prop('disabled', true);
				$("#btnApplyFilterChart").prop('disabled', true);
				self.editAdvancedSearch(data, index);
			}
		}

		function applyQuickSearch(parent, isQuickSearchAdd, quickSearchText) {
			if (ADSearchUtil.AdScreenName == "deviceSearch") {					//Device Search grid is restricted to only 21 columns
				var criteriaCount = 0;
				if (self.criteriaGroups().length > 0) {
					var source = _.where(self.selectedGridColumns(), { AttributeName: "GroupNames" });
					if (!source || source.length == 0) {
						criteriaCount++;
					}
				}

				if (self.attrbuteCriteriaArr().length > 0) {
					for (var j = 0; j < self.attrbuteCriteriaArr().length; j++) {
						var source = _.where(self.selectedGridColumns(), { AttributeName: self.attrbuteCriteriaArr()[j].AttributeName });
						if (!source || source.length == 0) {
							criteriaCount++;
						}
					}
				}

				if ((self.selectedGridColumns().length + criteriaCount) > 15) {
					$("#informationPopupForSelectedColumns").modal('show');
					return;
				}
			}

			if (ADSearchUtil.AdScreenName == "schedule")
				isSearchAppliedForSchedule = true;

			$("#searchInProgress").modal('show');
			$("#quickcriteria").removeClass('quickCriHide');
			$("#advanceCriteria").addClass('quickCriHide');
			koUtil.isQuickSearchApplied = 1;
			var deletedid = self.oldSearchid();
			$("#td" + deletedid).removeClass('disabled');

			if (isDeviceSearchWithAdvanceSearch == false) {
				isDeviceSearchWithAdvanceSearch = true;
			}

			//prepare Device Search object
			var DeviceSearch = new Object();

			//Device Status
			if (ADSearchUtil.AdScreenName == 'deletedDevice') {
				careDataDeletedDevices = new Object();
				careSearchDeletedDevicesObject = new Object();
				DeviceSearch.DeviceStatus = ["Deleted"];
			} else {
				DeviceSearch.DeviceStatus = new Array();
			}

			DeviceSearch.GroupIds = new Array();
			DeviceSearch.HierarchyIdsWithChildren = new Array();
			DeviceSearch.HierarchyIdsWithoutChildren = new Array();
			DeviceSearch.IsHierarchiesSelected = false;
			DeviceSearch.IsIncludeConnectedDevices = $("#chkAutoSelectConnected").is(':checked') ? true : false;

			if (ADSearchUtil.AdScreenName == "deviceSearch") {
				careData = new Object();
				careSearchObject = new Object();
				selectedColumnsClone = new Array();
				for (var m = 0; m < self.selectedGridColumns().length; m++) {
					selectedColumnsClone.push(self.selectedGridColumns()[m]);
				}
				DeviceSearch.SelectedHeaders = selectedColumnsClone;			//custom columns only for Device Search grid
			} else {
				DeviceSearch.SelectedHeaders = [];
			}

			if (ADSearchUtil.AdScreenName == 'deletedDevice') {
				DeviceSearch.IsOnlyDeleteBlacklisted = true;
			} else {
				DeviceSearch.IsOnlyDeleteBlacklisted = false;
			}
			DeviceSearch.IsFileSearch = isFileSearch;
			DeviceSearch.SearchCriteria = null;
			DeviceSearch.SearchElements = null;
			DeviceSearch.SearchModels = null;
			DeviceSearch.SearchName = null;

			var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
			if (isQuickSearchAdd == 0) {
				if (adStorage && adStorage.length > 0) {
					if (quickSearchText && quickSearchText != '' && quickSearchText != undefined) {
						adStorage[0].searchText = quickSearchText;
					}
					if (gId == "Devicejqxgrid") {
						if (isDeviceSearchWithAdvanceSearch == false) {
							adStorage[0].isAdSearch = 1;
						}
					}
					adStorage[0].quickSearchName = $("#txtQuickSearchDevice").val().trim();
					var updatedAdStorage = JSON.stringify(adStorage);
					window.sessionStorage.setItem(gId + 'adStorage', updatedAdStorage);
				}

				DeviceSearch.SearchID = self.SearchId();
				DeviceSearch.SearchText = $("#txtQuickSearchDevice").val().trim();//self.selectedSearchText();//
				DeviceSearch.SearchType = ENUM.get('ADVANCED');
			} else {
				if (adStorage && adStorage.length > 0) {
					adStorage[0].searchText = $("#txtQuickSearchDevice").val().trim();
					adStorage[0].quickSearchName = $("#txtQuickSearchDevice").val().trim();
					var updatedAdStorage = JSON.stringify(adStorage);
					window.sessionStorage.setItem(gId + 'adStorage', updatedAdStorage);
				}

				DeviceSearch.SearchID = 0;
				DeviceSearch.SearchText = $("#txtQuickSearchDevice").val().trim();//self.selectedSearchText();//
				DeviceSearch.SearchType = ENUM.get('QUICK');
			}

			ADSearchUtil.deviceSearchObj = DeviceSearch;
			ADSearchUtil.SearchText = quickSearchText;
			ADSearchUtil.SearchCriteria = quickSearchText;
			sessionStorage.setItem(gId + 'customSearch', JSON.stringify(DeviceSearch));
			if (ADSearchUtil.SearchText) {
				sessionStorage.setItem(gId + 'CustomSearchText', ADSearchUtil.SearchText);
				sessionStorage.setItem("CustomSearchText", ADSearchUtil.SearchText);
				$("#deviceCriteriaDiv").empty();
				$("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
				$("#deviceCriteriaDiv").attr('title', ADSearchUtil.SearchText);
			}
			if (ADSearchUtil.SearchCriteria) {
				sessionStorage.setItem(gId + 'CustomSearchCriteria', ADSearchUtil.SearchCriteria);
			}
			ADSearchUtil.newAddedDataFieldsArr = [];
			ADSearchUtil.newAddedgridColumns = [];
			ADSearchUtil.ExportDynamicColumns = [];
			ADSearchUtil.resetAddSerchFlag = '';
			CallType = ENUM.get("CALLTYPE_NONE");

			updateAdSearchObj(gId, DeviceSearch, 1);

			if (ADSearchUtil.gridIdForAdvanceSearch == 'jqxgridForSelectedDevices') {
				$("#newJobBtn").prop("disabled", true);
				$("#selectedDevicesGrid").show();
				$("#schduleGrid").hide();
				$("#nextBtn").show();
				$("#previousBtn").hide();
				$("#nextSchedule").show();
				$("#showHideResetExportbtn").show();
				$("#tabUL").each(function () {
					$(this).children('li').removeClass('active');
				});
				$("#tabSelectedDevice").addClass('active');
				$("#jqxgridForSelectedDevices").jqxGrid('updatebounddata');
			} else if (ADSearchUtil.gridIdForAdvanceSearch == 'blankSchedulejqxgrid') {
				$("#blankSchedulejqxgrid").jqxGrid('updatebounddata');
			} else if (ADSearchUtil.gridIdForAdvanceSearch == 'blankDevicejqxgrid') {
				$("#blankDevicejqxgrid").jqxGrid('updatebounddata');
			} else {
				gridFilterClear(gId, 0);
			}

			if (isQuickSearchAdd == 1) {
				var str = '<div class="panel-body">';
				str += '<div class="row">';
				str += '<span>';
				str += '' + $("#txtQuickSearchDevice").val() + '';
				str += '</span>';
				str += '</div>';
				str += '</div>';
				$("#deviceCriteriaDiv").empty();
				$("#deviceCriteriaDiv").append(str);
			}

			$("#criteriabtnDiv").css("display", "inline");
			$("#resetBtnForChart").addClass('hide');
			$("#resetBtnForGrid").removeClass('hide');

			if (ADSearchUtil.AdScreenName == 'deviceSearch') {
				$("#resetBtnForGrid").css('display', "none");
				$("#A1").css('display', "");
			} else {
				$("#resetBtnForGrid").css('display', "");
				$("#A1").css('display', "none");
			}

			self.oldSearchid(self.SearchId());
			var deleteid = self.SearchId();
			$("#td" + deleteid).addClass('disabled');
		}

		if (ADSearchUtil.adEdit()) {
			ADSearchUtil.adEdit(false);
			self.editAdvancedSearch(ADSearchUtil.selectedADData(), ADSearchUtil.selectedADIndex());
		}
		if (ADSearchUtil.adCopy()) {
			ADSearchUtil.adCopy(false);
			self.copyAdvancedSearch(ADSearchUtil.selectedADData(), ADSearchUtil.selectedADIndex());
		}
		if (ADSearchUtil.adDelet()) {
			ADSearchUtil.adDelet(false);
		}

		self.addQuickSearch = function (parent) {
			if ($("#txtQuickSearchDevice").val().trim() != '') {
				$("#allQuickSearchUL").addClass('hide');
				$("#allSearchUL").addClass('hide');
				if (self.SearchId() != 0) {
					isFromDeviceSearch = false;
					isAdvancedSavedSearchApplied = true;
					isSearchReset = false;
					koUtil.savedSearchId = self.SearchId();
					//var str = '<div class="panel-body">';
					//str += '<div class="row">';
					//str += '<span>';
					//str += '' + $("#txtQuickSearchDevice").val() + '';
					//str += '</span>';
					//str += '</div>';
					//str += '</div>';
					//$("#deviceCriteriaDiv").empty();
					//$("#deviceCriteriaDiv").append(str);
					$(".panel-side-pop").hide();

					var quickSearchSource = _.where(self.allSearches(), { SearchName: $("#txtQuickSearchDevice").val().trim() });
					if (quickSearchSource == '' || quickSearchSource == undefined) {
						openAlertpopup(1, 'please_select_valid_search');
						return;
					}

					if (quickSearchSource != '' && quickSearchSource[0].SearchType != 2) {
						self.SearchId(quickSearchSource[0].SearchID);
						var str = '<div class="panel-body">';
						str += '<div class="row">';
						str += '<span>';
						str += '' + quickSearchSource[0].SearchText + '';
						str += '</span>';
						str += '</div>';
						str += '</div>';
						//$("#deviceCriteriaDiv").empty();
						//$("#deviceCriteriaDiv").append(str);
						applyQuickSearch(parent, 0, quickSearchSource[0].SearchText);
						$("#advanceCriteria").removeClass("quickCriHide");
						$("#advanceCriteria").show();
						$("#deviceCriteriaDiv").css("display", "block");
						$("#ResultCriteriaDiv").css("display", "none");
						self.hierarchyFullPath([]);
						ADSearchUtil.attributeDataArr = [];
						self.attrbuteCriteriaArr([]);
						self.criteriaGroups([]);
					} else {
						var addQuickSearchReq = new Object();
						var quickSearch = new Object();
						quickSearch.SearchId = 0;
						quickSearch.SearchText = $("#txtQuickSearchDevice").val().trim();
						addQuickSearchReq.QuickSearch = quickSearch;

						function callbackFunction(data) {
							if (data) {
								if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
									applyQuickSearch(parent, 1, null);
									getAllSearches(self.allSearches, self.hierarchyFullPath, self.criteriaGroups, self.attrbuteCriteriaArr, self.AttributeData, self.checkAccessType, self.isEditMode, self.multiselctedModels, self.multiselctedDeviceStatus, self.multiSelectedModeOfConnectivity, self.multiSelectedVTPEncryptionStatus, self.isCopyMode, self.backUpAttributeData, self.searchCheck, self.SearchId, self.multiSelectedSoftwareAssignmentType);
								}
							}
						}
						var params = '{"token":"' + TOKEN() + '","addQuickSearchReq":' + JSON.stringify(addQuickSearchReq) + '}';
						ajaxJsonCall("AddQuickSearch", params, callbackFunction, true, 'POST', true);
					}
				}
			}

		}

		$("#rbtPrivate").on('click', function () {
			self.checkAccessType('Private');
			var checkGroupArr = self.criteriaGroups();
			var checkHierarchyArr = self.hierarchyFullPath();
			var checkAttrArr = self.attrbuteCriteriaArr();

			if ($("#txtSearchName").val().trim() != '') {
				if (self.searchCheck() == AppConstants.get('HIERARCHY')) {
					if (checkHierarchyArr.length > 0 || checkAttrArr.length > 0) {
						$("#btnSave").removeAttr('disabled');
					} else {
						$("#btnSave").prop('disabled', true);
					}
				} else {
					if (checkGroupArr.length > 0 || checkAttrArr.length > 0) {
						$("#btnSave").removeAttr('disabled');
					} else {
						$("#btnSave").prop('disabled', true);
					}
				}
			}
		})

		$("#rbtPublic").on('click', function () {
			self.checkAccessType('Public');
			var checkGroupArr = self.criteriaGroups();
			var checkHierarchyArr = self.hierarchyFullPath();
			var checkAttrArr = self.attrbuteCriteriaArr();

			if ($("#txtSearchName").val().trim() != '') {
				if (self.searchCheck() == AppConstants.get('HIERARCHY')) {
					if (checkHierarchyArr.length > 0 || checkAttrArr.length > 0) {
						$("#btnSave").removeAttr('disabled');
					} else {
						$("#btnSave").prop('disabled', true);
					}
				} else {
					if (checkGroupArr.length > 0 || checkAttrArr.length > 0) {
						$("#btnSave").removeAttr('disabled');
					} else {
						$("#btnSave").prop('disabled', true);
					}
				}
			}
		})

		self.applyAdvanceForChart = function (applyAdvancedSearchForChart) {
			isAdvancedSavedSearchApplied = true;
			isSearchReset = false;

			$("#txtQuickSearchDevice").val('');
			$("#deviceCriteriaDiv").removeClass('hide');
			$("#resetBtnForChart").removeClass('hide');
			$("#resetBtnForGrid").addClass('hide');
			//  if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			//    $(".advance-searchh").addClass("dn");
			//    $(".advance-search-result").removeClass("dn");
			//} else {

			$("#searchInProgress").modal('show');
			//if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			//} else {
			$("#mainPageBody").removeClass('modal-open-appendon');
			//    }
			//}

			//prepare Device Search object
			var DeviceSearch = new Object();

			//Device Status
			if (ADSearchUtil.AdScreenName == 'deletedDevice') {
				DeviceSearch.DeviceStatus = ["Deleted"];
			} else {
				var deviceStatus = new Array();

				var arr = self.multiselctedDeviceStatus();
				for (var i = 0; i < arr.length; i++) {
					deviceStatus.push(arr[i].Name);
				}
				DeviceSearch.DeviceStatus = deviceStatus;
				var subStatus = new Array();
				var arr = self.multiselctedSubStatus();
				for (var i = 0; i < arr.length; i++) {
					subStatus.push(arr[i].Name);
				}
				DeviceSearch.SubStatus = subStatus;
			}
			var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
			var GroupArr = new Array();
			var selectedGroupData = self.criteriaGroups();
			if (self.searchCheck() == AppConstants.get('GROUPS')) {
				if (adStorage && adStorage.length > 0) {
					adStorage[0].AdvancedSearchFlag = AppConstants.get('GROUPS');
					if (selectedGroupData && selectedGroupData.length > 0) {
						for (var i = 0; i < selectedGroupData.length; i++) {
							GroupArr.push(selectedGroupData[i].GroupId);
						}
					}
					adStorage[0].AdvancedSearchGroup = self.criteriaGroups();
					adStorage[0].AdvancedSearchHierarchy = null;
					adStorage[0].isWithGroup = 1;
				}
			} else {
				if (adStorage && adStorage.length > 0) {
					adStorage[0].AdvancedSearchFlag = AppConstants.get('HIERARCHY');
					adStorage[0].AdvancedSearchGroup = null;
					adStorage[0].isWithGroup = 0;
				}
			}

			var updatedadStorage = JSON.stringify(adStorage);
			window.sessionStorage.setItem(gId + 'adStorage', updatedadStorage);
			DeviceSearch.GroupIds = GroupArr;

			//for hierarchy
			var HierarchyIdsWithChildren = new Array();
			var HierarchyIdsWithoutChildren = new Array();
			var HierarchyPathArr = self.hierarchyFullPath();
			for (var i = 0; i < HierarchyPathArr.length; i++) {
				if (HierarchyPathArr[i].IsChildExists) {
					if (HierarchyPathArr[i].IncludeChildren) {
						HierarchyIdsWithChildren.push(HierarchyPathArr[i].HierarchyId);
					} else {
						HierarchyIdsWithoutChildren.push(HierarchyPathArr[i].HierarchyId);
					}

				} else {
					HierarchyIdsWithoutChildren.push(HierarchyPathArr[i].HierarchyId);
				}
			}

			var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
			if (adStorage && adStorage.length > 0) {
				if (self.searchCheck() == AppConstants.get('HIERARCHY')) {
					adStorage[0].AdvancedSearchHierarchy = HierarchyPathArr;
					adStorage[0].AdvancedSearchGroup = null;
					adStorage[0].isWithGroup = 0;
				} else {
					adStorage[0].AdvancedSearchHierarchy = null;
				}
			}

			var updatedadStorage = JSON.stringify(adStorage);
			window.sessionStorage.setItem(gId + 'adStorage', updatedadStorage);

			DeviceSearch.HierarchyIdsWithChildren = HierarchyIdsWithChildren;
			DeviceSearch.HierarchyIdsWithoutChildren = HierarchyIdsWithoutChildren;
			if (self.hierarchyFullPath() == '') {
				DeviceSearch.IsHierarchiesSelected = false;
			} else {
				DeviceSearch.IsHierarchiesSelected = true;
			}
			DeviceSearch.IsIncludeConnectedDevices = $("#chkAutoSelectConnected").is(':checked') ? true : false;

			DeviceSearch.SelectedHeaders = selectedColumnsClone;
			DeviceSearch.IsOnlyDeleteBlacklisted = false;
			DeviceSearch.IsFileSearch = isFileSearch;
			DeviceSearch.SearchCriteria = null;

			//File Search
			if (isFileSearch === true) {
				if (_.isEmpty(fileSearchElements) && fileSearchElements.length === 0) {
					openAlertpopup(2, i18n.t('custom_csv_invalid_search_file'));
					return;
				}
				DeviceSearch.SearchElements = fileSearchElements;
			} else {
				//for attributes
				var searchElements = new Array();

				var arr = self.attrbuteCriteriaArr();
				for (var i = 0; i < arr.length; i++) {
					if (arr[i].DisplayName == 'Model' || arr[i].DisplayName == 'Device Status') {

					} else {
						var DeviceSearchElement = new Object();
						DeviceSearchElement.ControlType = ENUM.get(arr[i].ControlType);
						DeviceSearchElement.DeviceSearchAttributeId = arr[i].DeviceSearchAttributeId;
						DeviceSearchElement.DeviceSearchOperatorId = arr[i].SelectedDeviceSearchOperatorId;
						DeviceSearchElement.SearchElementSeqNo = i;
						DeviceSearchElement.SearchId = self.SearchId();
						if (arr[i].DisplayName == 'Mode of Connectivity') {
							var searchValModeofConnectivity = self.multiSelectedModeOfConnectivity();
							var searchValString = '';
							if (searchValModeofConnectivity && searchValModeofConnectivity.length > 0) {
								for (var j = 0; j < searchValModeofConnectivity.length; j++) {
									searchValString += searchValModeofConnectivity[j].Name + ",";
								}
								searchValString = searchValString.slice(0, -1);
							}
							DeviceSearchElement.SearchValue = searchValString;
						} else if (arr[i].DisplayName == 'Software Assignment Type') {
							var searchValSoftwareAssignmentType = self.multiSelectedSoftwareAssignmentType();
							var searchValString = '';
							if (searchValSoftwareAssignmentType && searchValSoftwareAssignmentType.length > 0) {
								for (var j = 0; j < searchValSoftwareAssignmentType.length; j++) {
									searchValString += searchValSoftwareAssignmentType[j].Name + ",";
								}
								searchValString = searchValString.slice(0, -1);
							}
							DeviceSearchElement.SearchValue = searchValString;
						} else if (arr[i].DisplayName == 'VTP Encryption Status') {
							var searchValVTPEncryptionStatus = self.multiSelectedVTPEncryptionStatus();
							var searchValString = '';
							if (searchValVTPEncryptionStatus && searchValVTPEncryptionStatus.length > 0) {
								for (var j = 0; j < searchValVTPEncryptionStatus.length; j++) {
									searchValString += searchValVTPEncryptionStatus[j].Name + ",";
								}
								searchValString = searchValString.slice(0, -1);
							}
							DeviceSearchElement.SearchValue = searchValString;
						} else {
							DeviceSearchElement.SearchValue = arr[i].ControlValues;
						}
						DeviceSearchElement.SearchValueOptional1 = arr[i].OptionalValue;
						searchElements.push(DeviceSearchElement);
					}

				}
				DeviceSearch.SearchElements = searchElements;
			}

			//Models
			var searchModels = new Array();

			var arr = self.multiselctedModels();
			for (var i = 0; i < arr.length; i++) {
				var SearchModel = new Object();
				//SearchModel.ModelId = arr[i].id;
				if (arr[i].id != undefined) {
					SearchModel.ModelId = arr[i].id;
				} else {
					SearchModel.ModelId = arr[i].Id;
				}
				SearchModel.ModelName = arr[i].Name;
				searchModels.push(SearchModel);
			}
			DeviceSearch.SearchModels = searchModels;
			///
			DeviceSearch.SearchID = self.SearchId();
			DeviceSearch.SearchName = null;
			DeviceSearch.SearchText = null;
			DeviceSearch.SearchType = ENUM.get('ADVANCED');
			//end dyn

			///for display criteria
			var SearchText = '';
			if (HierarchyPathArr.length > 0) {
				SearchText += 'Search Type = Hierarchy <br/>';

			}
			for (var i = 0; i < HierarchyPathArr.length; i++) {
				SearchText += 'Hierarchy = ';
				SearchText += HierarchyPathArr[i].HierarchyFullPath + ' <br/>';
			}

			if (selectedGroupData.length > 0) {
				SearchText += 'Search Type = Group <br/>';
				SearchText += 'Group = ';
			}
			for (var i = 0; i < selectedGroupData.length; i++) {
				SearchText += selectedGroupData[i].GroupName + ',';
			}
			SearchText += '<br/>';
			var attrArr = self.attrbuteCriteriaArr();

			if (attrArr.length > 0) {
				SearchText += 'Attribute =';
			}
			ADSearchUtil.searchAttributeArray = {};
			for (var i = 0; i < attrArr.length; i++) {
				SearchText += ' ' + attrArr[i].DisplayName;
				SearchText += ' ' + attrArr[i].OperatorValue;
				if (attrArr[i].AttributeName == 'ModelName') {

					var arr = self.multiselctedModels();
					ADSearchUtil.searchAttributeArray.multiselctedModels = arr;
					for (var k = 0; k < arr.length; k++) {

						SearchText += ' ' + arr[k].Name + ','
					}
					SearchText = SearchText.slice(0, -1);
					SearchText += ';'


				} else if (attrArr[i].AttributeName == 'ComputedDeviceStatus') {

					var arr = self.multiselctedDeviceStatus();
					ADSearchUtil.searchAttributeArray.multiselctedDeviceStatus = arr;
					for (var j = 0; j < arr.length; j++) {

						SearchText += ' ' + arr[j].Name + ','
					}
					SearchText = SearchText.slice(0, -1);
					SearchText += ';'
				} else if (attrArr[i].AttributeName == 'SubStatus') {

					var arr = self.multiselctedSubStatus();
					ADSearchUtil.searchAttributeArray.multiselctedSubStatus = arr;
					for (var j = 0; j < arr.length; j++) {

						SearchText += ' ' + arr[j].displaytext + ','
					}
					SearchText = SearchText.slice(0, -1);
					SearchText += ';'
				} else if (attrArr[i].AttributeName == 'ModeofConnectivity') {

					var arr = self.multiSelectedModeOfConnectivity();
					ADSearchUtil.searchAttributeArray.multiSelectedModeOfConnectivity = arr;
					for (var j = 0; j < arr.length; j++) {

						SearchText += ' ' + arr[j].displaytext + ','
					}
					SearchText = SearchText.slice(0, -1);
					SearchText += ';'
				} else if (attrArr[i].AttributeName == 'SoftwareAssignmentType') {

					var arr = self.multiSelectedSoftwareAssignmentType();
					ADSearchUtil.searchAttributeArray.multiSelectedSoftwareAssignmentType = arr;
					for (var j = 0; j < arr.length; j++) {

						SearchText += ' ' + arr[j].displaytext + ','
					}
					SearchText = SearchText.slice(0, -1);
					SearchText += ';'
				} else if (attrArr[i].AttributeName == 'EncrEnabled') {
					var arr = self.multiSelectedVTPEncryptionStatus();
					ADSearchUtil.searchAttributeArray.multiSelectedVTPEncryptionStatus = arr;
					for (var j = 0; j < arr.length; j++) {

						SearchText += ' ' + arr[j].displaytext + ','
					}
					SearchText = SearchText.slice(0, -1);
					SearchText += ';'
				} else if (attrArr[i].AttributeName == 'Name' || attrArr[i].AttributeName == 'PaymentAppName') {
					SearchText += ' Name: ' + attrArr[i].ControlValues;
					SearchText += ' Version: ' + attrArr[i].OptionalValue + ';';
				} else if (attrArr[i].ControlType == 'Date') {
					if (attrArr[i].OptionalValue == null) {
						SearchText += ' ' + attrArr[i].ControlValues + ';';
					} else {
						SearchText += ' From: ' + attrArr[i].ControlValues;
						SearchText += ' To: ' + attrArr[i].OptionalValue + ';';
					}
				}
				else {
					SearchText += ' ' + attrArr[i].ControlValues + ';';
				}
			}
			if (gId != "Devicejqxgrid") {
				ADSearchUtil.searchAttributeArray = {};
			}
			$("#deviceCriteriaDiv").empty();
			$("#deviceCriteriaDiv").append(SearchText);

			ADSearchUtil.SearchText = SearchText;
			ADSearchUtil.SearchCriteria = SearchText;

			DeviceSearch.SearchText = SearchText;

			gId = ADSearchUtil.gridIdForAdvanceSearch;
			ADSearchUtil.deviceSearchObj = DeviceSearch;


			$(".modalContentReposition").css("left", "");
			$(".modalContentReposition").css("top", "");
			///
			updateAdSearchObj(gId, DeviceSearch, 0);
			applyAdvancedSearchForChart();
			$("#criteriabtnDiv").css("display", "inline");
			$("#btnApplyFilterChart").prop('disabled', true);
			$("#btnApplyFilter").prop('disabled', true);
			$("#btnClear").prop('disabled', true);
			$("#resetBtnForChart").removeClass('hide');
			$("#resetBtnForGrid").addClass('hide');

		};


		self.applyQuickSearchForChart = function (applyAdvancedSearchForChart) {
			//if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			//    $(".advance-searchh").addClass("dn");
			//    $(".advance-search-result").removeClass("dn");
			//} else {

			isAdvancedSavedSearchApplied = true;
			isSearchReset = false;
			koUtil.savedSearchId = self.SearchId();

			$("#searchInProgress").modal('show');
			//if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			//} else {
			$("#mainPageBody").removeClass('modal-open-appendon');
			//    }
			//}
			var deletedid = self.oldSearchid();
			$("#td" + deletedid).removeClass('disabled');
			if ($("#txtQuickSearchDevice").val().trim() != '') {
				var str = '<div class="panel-body">';
				str += '<div class="row">';
				str += '<span>';
				str += '' + $("#txtQuickSearchDevice").val() + '';
				str += '</span>';
				str += '</div>';
				str += '</div>';
				$("#deviceCriteriaDiv").empty();
				$("#deviceCriteriaDiv").append(str);
				$("#deviceCriteriaDiv").removeClass('hide');
				var DeviceSearch = new Object();
				if (ADSearchUtil.AdScreenName == 'deletedDevice') {
					DeviceSearch.DeviceStatus = ["Deleted"];
				} else {
					DeviceSearch.DeviceStatus = null;
				}
				DeviceSearch.GroupIds = null;
				DeviceSearch.HierarchyIdsWithChildren = null;
				DeviceSearch.HierarchyIdsWithoutChildren = null;
				DeviceSearch.IsHierarchiesSelected = false;
				DeviceSearch.SelectedHeaders = selectedColumnsClone;
				DeviceSearch.IsOnlyDeleteBlacklisted = false;
				DeviceSearch.IsFileSearch = isFileSearch;
				DeviceSearch.SearchCriteria = null;
				DeviceSearch.SearchElements = null;
				DeviceSearch.SearchModels = null;
				DeviceSearch.SearchName = null;
				DeviceSearch.IsIncludeConnectedDevices = $("#chkAutoSelectConnected").is(':checked') ? true : false;

				var quickSearchSource = _.where(self.allSearches(), { SearchName: $("#txtQuickSearchDevice").val() });
				if (quickSearchSource != '' && quickSearchSource[0].SearchType != 2) {
					DeviceSearch.SearchID = self.SearchId();
					DeviceSearch.SearchText = $("#txtQuickSearchDevice").val();
					DeviceSearch.SearchType = ENUM.get('ADVANCED');
				} else {
					var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
					if (adStorage && adStorage.length > 0) {
						adStorage[0].searchText = $("#txtQuickSearchDevice").val();
						adStorage[0].quickSearchName = $("#txtQuickSearchDevice").val();
						var updatedAdStorage = JSON.stringify(adStorage);
						window.sessionStorage.setItem(gId + 'adStorage', updatedAdStorage);
					}

					DeviceSearch.SearchID = 0;
					DeviceSearch.SearchText = $("#txtQuickSearchDevice").val();
					DeviceSearch.SearchType = ENUM.get('QUICK');
				}
				ADSearchUtil.deviceSearchObj = DeviceSearch;
				updateAdSearchObj(gId, DeviceSearch, 1);

				applyAdvancedSearchForChart();
				$("#criteriabtnDiv").css("display", "inline");
				$("#resetBtnForChart").removeClass('hide');

				$("#resetBtnForGrid").addClass('hide');

				var deleteid = self.SearchId();
				$("#td" + deleteid).addClass('disabled');
			}
		}

		$("#btnApplyFilterChart").prop('disabled', true);
		$("#btnApplyFilter").prop('disabled', true);
		$("#btnClear").prop('disabled', true);

		self.expandUL = function () {
			koUtil.checkQuckDDL = 1;
			self.allSearches(ADSearchUtil.ADAllSearches());
		}

		$("#txtQuickSearchDevice").keyup(function () {
			var filter = $(this).val();
			$("#allSearchUL li").each(function () {

				if ($(this).text().search(new RegExp(filter, "i")) < 0) {
					if ($(this).text().indexOf("-------Last Searches-------") < 0) {
						if ($(this).text().indexOf(AppConstants.get('PRIVATE_SEARCH')) < 0) {
							if ($(this).text().indexOf(AppConstants.get('PUBLIC_SEARCH')) < 0) {
								$(this).hide();
							}
						}
					}
				} else {
					$(this).show()
				}
			});
		});

		if (ADSearchUtil.AdScreenName == 'reportsScreen') {
			if (ClearAdSearchObjForReport != 0) {
				generateAdvanceForSaveReport(0, self.hierarchyFullPath, self.criteriaGroups, self.attrbuteCriteriaArr, self.AttributeData, self.checkAccessType, self.isEditMode, self.multiselctedModels, self.multiselctedDeviceStatus, self.multiSelectedModeOfConnectivity, self.multiSelectedVTPEncryptionStatus, self.isCopyMode, self.backUpAttributeData, AdSearchObjForCustomeSavedReport, self.multiSelectedSoftwareAssignmentType, self.checkConnectedDevices);
			}
		} else {
			if (ClearAdSearch == 0) {
				var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
				if (adStorage && adStorage.length > 0 && adStorage[0].adSearchObj) {
					generateAdvanceForSaveState(0, self.hierarchyFullPath, self.criteriaGroups, self.attrbuteCriteriaArr, self.AttributeData, self.checkAccessType, self.isEditMode, self.multiselctedModels, self.multiselctedDeviceStatus, self.multiSelectedModeOfConnectivity, self.multiSelectedVTPEncryptionStatus, self.isCopyMode, self.backUpAttributeData, adStorage[0], self.multiSelectedSoftwareAssignmentType, self.multiselctedSubStatus, self.checkConnectedDevices);
				}
			}
		}

		self.clearAdvancedSearch = function () {
			ClearAdSearch = 1;
			isFilterApplied = false;
			isGroupModified = false;
			koUtil.isSearchAdmin(true);
			koUtil.isHierarchyModified(false);
			koUtil.isAttributeModified(false);

			$("#hierarchyDiv").removeClass('disabled');
			$("#hierarchyDiv").css("opacity", 1);
			$("#groupContainer").removeClass('disabled');
			$("#deviceAttributDDL").prop('disabled', false);
			$("#deviceAttributDDL").css({ 'pointer-events': 'all', 'cursor': 'pointer' });
			$("#selectedHierarchies").removeClass('disabled');
			$("#childHCheckbox").removeClass('disabled');
			$("#childHCheckbox").prop("disabled", false);
			$("#chkAutoSelectConnected").prop("checked", false);
			$("#selectedAttributes").removeClass('disabled');
			$("#selectedGroups").removeClass('disabled');
			$("#txtSearchName").prop('disabled', false);
			$("#rbtPrivate").prop('disabled', false);
			$("#rbtPublic").prop('disabled', false);

			$('#deviceAttributDDL').val('-Select-').prop("selected", "selected");
			$('#deviceAttributDDL').trigger('chosen:updated');
			$('#ddlAttrName').val('-Select-').prop("selected", "selected");
			$("#ddlAttrName").trigger('chosen:updated');
			self.selectedOperator(0);
			$('#ddlCombo').val('-Select-').prop("selected", "selected");
			$('#ddlCombo').trigger('chosen:updated');
			$('#ddlMultiCombo').val('-Select-').prop("selected", "selected");
			$('#ddlMultiCombo').trigger('chosen:updated');
			$("#txtAttrValue").val('');
			$("#txtappversion").val('');
			$("#txtAttrFromDate").val('');
			$("#txtAttrToDate").val('');
			self.checkConnectedDevices(false);
			self.checkoperator(false);
			self.comboType(false);
			self.textType(false);
			self.multiComboType(false);
			self.dateType(false);
			self.applicationType(false);
			self.checkaddAttr(false);
			$("#attrDllDiv").css('width', "280px");

			var attrArray = self.attrbuteCriteriaArr();
			for (var i = 0; i < attrArray.length; i++) {
				if (attrArray[i].IsMultiUse) {

				} else {

					self.AttributeData.push(attrArray[i]);
				}
			}

			self.AttributeData.sort(function (a, b) { return a.DisplayName.toUpperCase() > b.DisplayName.toUpperCase() ? 1 : -1; })

			self.multiselctedModels([]);
			self.multiselctedDeviceStatus([]);
			self.multiselctedSubStatus([]);
			self.multiSelectedModeOfConnectivity([]);
			self.multiSelectedVTPEncryptionStatus([]);
			self.multiSelectedSoftwareAssignmentType([]);


			//self.observableAdvancedSearch('unloadTemplate');
			//loadAdvancesearch('modelAdvancedSearch', 'genericPopup');

			//---------unload list view hierarchy and tree view hierarchy-----
			self.observableHierarchy('unloadTemplate');
			loadHierarchy('modalHierarchy', 'genericPopup');

			self.hierarchyFullPath([]);
			ADSearchUtil.attributeDataArr = [];
			self.attrbuteCriteriaArr([]);
			self.criteriaGroups([]);
			// $("#deviceCriteriaDiv").empty();
			// $("#criteriabtnDiv").css("display", "none");
			$("#btnApplyFilterChart").prop('disabled', true);
			$("#btnApplyFilter").prop('disabled', true);
			$("#CustomSearchReset").hide();

			self.selectedOption(undefined);
			self.showHierarchy();
			self.issaveSearch(false);
			//-----------quick search----------------
			if (self.isFromSaveSearch() == false) {
				$("#txtQuickSearchDevice").val('');
				self.SearchId(0);
			} else {
				self.isFromSaveSearch(false);
			}

			//------------save search reset-------------
			$("#txtSearchName").val('');
			self.checkAccessType('Private');

			//-----clear quick search dropdown selection-----
			$("#allSearchUL").each(function () {
				$(this).children('li').css("background-color", "");

			});

		}
		seti18nResourceData(document, resourceStorage);
	};


	function generateAdvanceForSaveState(searchId, hierarchyFullPath, criteriaGroups, attrbuteCriteriaArr, AttributeData, checkAccessType, isEditMode, multiselctedModels, multiselctedDeviceStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, isCopyMode, backupAttributeData, data, multiSelectedSoftwareAssignmentType, multiselctedSubStatus, checkConnectedDevices) {

		if (data) {
			hierarchyFullPath([]);
			ADSearchUtil.HierarchyPathArr([]);
			ADSearchUtil.attributeDataArr = [];
			attrbuteCriteriaArr([]);
			ADSearchUtil.selectedGroupsForAdSearch = [];
			criteriaGroups([]);

			if (data.IsPrivateSearch == false) {
				checkAccessType('Public');
			} else {
				checkAccessType('Private');
			}

			//hierarchies
			if (!_.isEmpty(data.AdvancedSearchHierarchy) && data.AdvancedSearchHierarchy.length > 0) {
				var hierarchyeditData = data.AdvancedSearchHierarchy;
				for (var i = 0; i < hierarchyeditData.length; i++) {
					var EAdvancedSearchHierarchy = new Object();
					EAdvancedSearchHierarchy.HierarchyFullPath = hierarchyeditData[i].HierarchyFullPath;
					EAdvancedSearchHierarchy.HierarchyId = hierarchyeditData[i].HierarchyId;
					EAdvancedSearchHierarchy.IncludeChildren = hierarchyeditData[i].IncludeChildren;
					EAdvancedSearchHierarchy.IsChildExists = hierarchyeditData[i].IsChildExists;
					EAdvancedSearchHierarchy.SearchId = searchId;
					ADSearchUtil.HierarchyPathArr.push(EAdvancedSearchHierarchy);
				}
				hierarchyFullPath = ADSearchUtil.HierarchyPathArr;
			}
			//groups
			if (!_.isEmpty(data.AdvancedSearchGroup) && data.AdvancedSearchGroup.length > 0) {
				var fetchedGroupArr = data.AdvancedSearchGroup;
				for (var j = 0; j < fetchedGroupArr.length; j++) {
					var EAdvancedSearchGroup = new Object();
					EAdvancedSearchGroup.GroupId = fetchedGroupArr[j].GroupId;
					EAdvancedSearchGroup.GroupName = fetchedGroupArr[j].GroupName;
					EAdvancedSearchGroup.SearchId = searchId;

					ADSearchUtil.selectedGroupsForAdSearch.push(EAdvancedSearchGroup);
					criteriaGroups.push(EAdvancedSearchGroup);
				}
			}

			if (!_.isEmpty(data.adSearchObj)) {
				if (data.adSearchObj.IsIncludeConnectedDevices) {
					checkConnectedDevices(true);
					$("#chkAutoSelectConnected").prop('checked', true);
				}
				if (data.adSearchObj.IsFileSearch === true) {
					return;
				}
				//models
				if (data.adSearchObj.SearchModels && data.adSearchObj.SearchModels != undefined && data.adSearchObj.SearchModels != '') {
					var modelArray = data.adSearchObj.SearchModels;
					var attrsource = _.where(backupAttributeData(), { AttributeName: 'ModelName' });

					if (!_.isEmpty(attrsource) && attrsource.length > 0) {
						var EAdvancedSearchModel = new Object();
						EAdvancedSearchModel.AttributeName = attrsource[0].AttributeName;
						EAdvancedSearchModel.ControlType = attrsource[0].ControlType;
						EAdvancedSearchModel.DeviceSearchAttributeOperators = attrsource[0].DeviceSearchAttributeOperators;

						var opsource = attrsource[0].DeviceSearchAttributeOperators;
						if (!_.isEmpty(opsource)) {
							EAdvancedSearchModel.OperatorValue = opsource[0].Operator;
							EAdvancedSearchModel.DeviceSearchAttributeId = opsource[0].DeviceSearchAttributesId;
							EAdvancedSearchModel.SelectedDeviceSearchOperatorId = opsource[0].DeviceSearchOperatorId;
							EAdvancedSearchModel.DisplayName = "Model";
							var tooltip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' ';
						}
						multiselctedModels([]);
						if (!_.isEmpty(modelArray) && modelArray.length > 0) {
							for (var k = 0; k < modelArray.length; k++) {
								var objModel = new Object();
								objModel.Id = modelArray[k].ModelId;
								objModel.Name = modelArray[k].ModelName;

								var multichoiceSource = getMultiCoiceFilterArr('Model');
								var selectedSource = _.where(multichoiceSource, { ControlValue: modelArray[k].ModelName });
								if (!_.isEmpty(selectedSource)) {
									objModel.displaytext = selectedSource[0].Value;
									multiselctedModels.push(objModel);
									tooltip += ' ' + selectedSource[0].Value + ',';
								}
							}
						}
						tooltip = tooltip.substring(0, tooltip.length - 1);
						EAdvancedSearchModel.toolTip = tooltip;
						ADSearchUtil.attributeDataArr.push(EAdvancedSearchModel);
						attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);

						var attrsource = _.where(backupAttributeData(), { AttributeName: 'ModelName' });
						if (attrsource[0].IsMultiUse == false) {
							AttributeData.remove(attrsource[0]);
						}
					}
				}
				//device status
				if (data.adSearchObj.DeviceStatus && data.adSearchObj.DeviceStatus != undefined && data.adSearchObj.DeviceStatus != '') {
					var deviceStatusArray = data.adSearchObj.DeviceStatus;
					var attrsource = _.where(backupAttributeData(), { AttributeName: 'ComputedDeviceStatus' });
					if (!_.isEmpty(attrsource) && attrsource.length > 0) {
						var EAdvancedSearchstatus = new Object();

						EAdvancedSearchstatus.AttributeName = attrsource[0].AttributeName;
						EAdvancedSearchstatus.ControlType = attrsource[0].ControlType;
						EAdvancedSearchstatus.DeviceSearchAttributeOperators = attrsource[0].DeviceSearchAttributeOperators;

						var opsource = attrsource[0].DeviceSearchAttributeOperators;
						if (!_.isEmpty(opsource)) {
							EAdvancedSearchstatus.OperatorValue = opsource[0].Operator;
							EAdvancedSearchstatus.DeviceSearchAttributeId = opsource[0].DeviceSearchAttributesId;
							EAdvancedSearchstatus.SelectedDeviceSearchOperatorId = opsource[0].DeviceSearchOperatorId;
							EAdvancedSearchstatus.DisplayName = attrsource[0].DisplayName;
							var tooltip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' ';
						}
						multiselctedDeviceStatus([]);
						if (!_.isEmpty(deviceStatusArray) && deviceStatusArray.length > 0) {
							for (var m = 0; m < deviceStatusArray.length; m++) {
								var objstatus = new Object();
								objstatus.Name = deviceStatusArray[m];

								var multichoiceSource = getMultiCoiceFilterArr('Device Status');
								var selectedSource = _.where(multichoiceSource, { ControlValue: deviceStatusArray[m] });
								objstatus.displaytext = selectedSource[0].Value;

								multiselctedDeviceStatus.push(objstatus);
								tooltip += ' ' + selectedSource[0].Value + ',';
							}
						}
						tooltip = tooltip.substring(0, tooltip.length - 1);
						EAdvancedSearchstatus.toolTip = tooltip;
						ADSearchUtil.attributeDataArr.push(EAdvancedSearchstatus);
						attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);

						var attrsource = _.where(backupAttributeData(), { AttributeName: 'ComputedDeviceStatus' });
						if (attrsource[0].IsMultiUse == false) {
							AttributeData.remove(attrsource[0]);
						}
					}
				}
				//attributes
				if (data.adSearchObj.SearchElements && data.adSearchObj.SearchElements != undefined && data.adSearchObj.SearchElements != '') {
					var elementsArray = data.adSearchObj.SearchElements;
					if (!_.isEmpty(elementsArray) && elementsArray.length > 0) {
						for (var n = 0; n < elementsArray.length; n++) {
							var attrsource = _.where(backupAttributeData(), { DeviceSearchAttributeId: elementsArray[n].DeviceSearchAttributeId });
							var DeviceSearchElement = new Object();
							if (!_.isEmpty(attrsource) && attrsource.length > 0) {
								DeviceSearchElement.AttributeName = attrsource[0].AttributeName;
								DeviceSearchElement.ControlType = attrsource[0].ControlType;
								DeviceSearchElement.DeviceSearchAttributeOperators = attrsource[0].DeviceSearchAttributeOperators;
								DeviceSearchElement.DisplayName = attrsource[0].DisplayName;
								DeviceSearchElement.IsMultiUse = attrsource[0].IsMultiUse;
								DeviceSearchElement.DeviceSearchAttributeId = elementsArray[n].DeviceSearchAttributeId;
								DeviceSearchElement.SelectedDeviceSearchOperatorId = elementsArray[n].DeviceSearchOperatorId;
								DeviceSearchElement.SearchElementSeqNo = elementsArray[n].SearchElementSeqNo;
								DeviceSearchElement.SearchId = elementsArray[n].SearchId;
								DeviceSearchElement.ControlValues = elementsArray[n].SearchValue;
								DeviceSearchElement.OptionalValue = elementsArray[n].SearchValueOptional1;

								var opid = parseInt(elementsArray[n].DeviceSearchOperatorId);
								var opsource = _.where(attrsource[0].DeviceSearchAttributeOperators, { DeviceSearchOperatorId: opid });
								if (opsource.length > 0) {
									DeviceSearchElement.OperatorValue = opsource[0].Operator;
									if (elementsArray[n].SearchValueOptional1 == null) {
										elementsArray[n].SearchValueOptional1 = '';
									}
									if (attrsource[0].AttributeName == 'Name' || attrsource[0].AttributeName == 'PaymentAppName') {
										DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' Name : ' + elementsArray[n].SearchValue + ' version : ' + elementsArray[n].SearchValueOptional1;
									} else if (attrsource[0].ControlType == 'Date') {
										DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' From : ' + elementsArray[n].SearchValue + ' To : ' + elementsArray[n].SearchValueOptional1;
									} else {
										DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' ' + elementsArray[n].SearchValue + '  ' + elementsArray[n].SearchValueOptional1;
										if (attrsource[0].AttributeName === 'SubStatus') {
											var subStatusArray = getMultiCoiceFilterArr("Device Sub Status");
											var subStatusValue = new Array();
											subStatusValue = !_.isEmpty(elementsArray[n].SearchValue) ? elementsArray[n].SearchValue.split(',') : '';
											if (!_.isEmpty(subStatusValue) && subStatusValue.length > 0) {
												for (var p = 0; p < subStatusValue.length; p++) {
													var source = _.where(subStatusArray, { ControlValue: subStatusValue[p] });
													if (!_.source && source.length > 0) {
														var item = new Object();
														item.Id = source[0].Id;
														item.displaytext = source[0].ControlValue;
														item.Name = source[0].ControlValue;
														multiselctedSubStatus.push(item);
													}
												}
											}
										} else if (attrsource[0].AttributeName === 'ModeofConnectivity') {
											var modeOfConnectivityArray = getMultiCoiceFilterArr("ModeofConnectivity");
											var modeOfConnectivityValue = new Array();
											modeOfConnectivityValue = !_.isEmpty(elementsArray[n].SearchValue) ? elementsArray[n].SearchValue.split(',') : '';
											if (!_.modeOfConnectivityValue && modeOfConnectivityValue.length > 0) {
												for (var q = 0; q < modeOfConnectivityValue.length; q++) {
													var source = _.where(modeOfConnectivityArray, { ControlValue: modeOfConnectivityValue[q] });
													if (!_.source && source.length > 0) {
														var item = new Object();
														item.Id = source[0].Id;
														item.displaytext = source[0].ControlValue;
														item.Name = source[0].ControlValue;
														multiSelectedModeOfConnectivity.push(item);
													}
												}
											}
										} else if (attrsource[0].AttributeName === 'SoftwareAssignmentType') {
											var softwareAssignmentArray = getMultiCoiceFilterArr("SoftwareAssignmentType");
											var softwareAssignmentValue = new Array();
											softwareAssignmentValue = !_.isEmpty(elementsArray[n].SearchValue) ? elementsArray[n].SearchValue.split(',') : '';
											if (!_.softwareAssignmentValue && softwareAssignmentValue.length > 0) {
												for (var r = 0; r < softwareAssignmentValue.length; r++) {
													var source = _.where(softwareAssignmentArray, { ControlValue: softwareAssignmentValue[r] });
													if (!_.source && source.length > 0) {
														var item = new Object();
														item.Id = source[0].Id;
														item.displaytext = source[0].ControlValue;
														item.Name = source[0].ControlValue;
														multiSelectedSoftwareAssignmentType.push(item);
													}
												}
											}
										} else if (attrsource[0].AttributeName == 'EncrEnabled') {
											var vtpEncryptionArray = getMultiCoiceFilterArr("EncrEnabled");
											var vtpEncryptionValue = new Array();
											vtpEncryptionValue = !_.isEmpty(elementsArray[n].SearchValue) ? elementsArray[n].SearchValue.split(',') : '';
											if (!_.isEmpty(vtpEncryptionValue) && vtpEncryptionValue.length > 0) {
												for (var s = 0; s < vtpEncryptionValue.length; s++) {
													var source = _.where(vtpEncryptionArray, { ControlValue: vtpEncryptionValue[s] });
													if (!_.source && source.length > 0) {
														var item = new Object();
														item.Id = source[0].Id;
														item.displaytext = source[0].ControlValue;
														item.Name = source[0].ControlValue;
														multiSelectedVTPEncryptionStatus.push(item);
													}
												}
											}
										}
									}
								}
								ADSearchUtil.attributeDataArr.push(DeviceSearchElement);
								attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);
							}
						}
					}

					if (!_.isEmpty(elementsArray)) {
						for (var t = 0; t < elementsArray.length; t++) {
							var attrsource = _.where(backupAttributeData(), { DeviceSearchAttributeId: elementsArray[t].DeviceSearchAttributeId });
							if (!_.isEmpty(attrsource) && attrsource.length > 0) {
								if (attrsource[0].IsMultiUse == false) {
									AttributeData.remove(attrsource[0]);
								}
							}
						}
					}
				}
			}
		}
	}

	function generateAdvanceForSaveReport(searchId, hierarchyFullPath, criteriaGroups, attrbuteCriteriaArr, AttributeData, checkAccessType, isEditMode, multiselctedModels, multiselctedDeviceStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, isCopyMode, backupAttributeData, data, multiSelectedSoftwareAssignmentType, checkConnectedDevices) {

		if (data) {
			hierarchyFullPath([]);
			ADSearchUtil.HierarchyPathArr([]);
			ADSearchUtil.attributeDataArr = [];
			attrbuteCriteriaArr([]);
			ADSearchUtil.selectedGroupsForAdSearch = [];
			criteriaGroups([]);
			if (data) {
				if (data.IsPrivateSearch == false) {
					checkAccessType('Public');
				} else {
					checkAccessType('Private');
				}

				if (data.IsIncludeConnectedDevices) {
					checkConnectedDevices(true);
					$("#chkAutoSelectConnected").prop('checked', true);
				}

				if (data.AdvancedSearchHierarchy) {
					var hierarchyeditData = data.AdvancedSearchHierarchy;
					for (var i = 0; i < hierarchyeditData.length; i++) {
						var EAdvancedSearchHierarchy = new Object();
						EAdvancedSearchHierarchy.HierarchyFullPath = hierarchyeditData[i].HierarchyFullPath;
						EAdvancedSearchHierarchy.HierarchyId = hierarchyeditData[i].HierarchyId;
						EAdvancedSearchHierarchy.IncludeChildren = hierarchyeditData[i].IncludeChildren;
						EAdvancedSearchHierarchy.IsChildExists = hierarchyeditData[i].IsChildExists;
						EAdvancedSearchHierarchy.SearchId = searchId;
						ADSearchUtil.HierarchyPathArr.push(EAdvancedSearchHierarchy);
					}
					hierarchyFullPath = ADSearchUtil.HierarchyPathArr;
				}

				if (data.AdvancedSearchGroup) {
					var fetchedGroupArr = data.AdvancedSearchGroup;
					for (var i = 0; i < fetchedGroupArr.length; i++) {
						var EAdvancedSearchGroup = new Object();
						EAdvancedSearchGroup.GroupId = fetchedGroupArr[i].GroupId;
						EAdvancedSearchGroup.GroupName = fetchedGroupArr[i].GroupName;
						EAdvancedSearchGroup.SearchId = searchId;
						ADSearchUtil.selectedGroupsForAdSearch.push(EAdvancedSearchGroup);
						criteriaGroups.push(EAdvancedSearchGroup);
					}
				}

				if (data.AdvancedSearchModel) {
					var fetchedModelArr = data.AdvancedSearchModel;
					var attrsource = _.where(backupAttributeData(), { AttributeName: 'ModelName' });
					var EAdvancedSearchModel = new Object();

					EAdvancedSearchModel.AttributeName = attrsource[0].AttributeName;
					EAdvancedSearchModel.ControlType = attrsource[0].ControlType;
					EAdvancedSearchModel.DeviceSearchAttributeOperators = attrsource[0].DeviceSearchAttributeOperators;

					var opsource = attrsource[0].DeviceSearchAttributeOperators

					EAdvancedSearchModel.OperatorValue = opsource[0].Operator;
					EAdvancedSearchModel.DeviceSearchAttributeId = opsource[0].DeviceSearchAttributesId;
					EAdvancedSearchModel.SelectedDeviceSearchOperatorId = opsource[0].DeviceSearchOperatorId;
					EAdvancedSearchModel.DisplayName = "Model";

					var tooltip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' ';
					multiselctedModels([]);
					for (var i = 0; i < fetchedModelArr.length; i++) {
						var objModel = new Object();
						objModel.Id = fetchedModelArr[i].ModelId;
						objModel.Name = fetchedModelArr[i].ModelName;

						var multichoiceSource = getMultiCoiceFilterArr('Model');
						var selectedSource = _.where(multichoiceSource, { ControlValue: fetchedModelArr[i].ModelName });

						objModel.displaytext = selectedSource[0].Value;
						multiselctedModels.push(objModel);
						tooltip += ' ' + selectedSource[0].Value + ',';
					}

					tooltip = tooltip.substring(0, tooltip.length - 1);
					EAdvancedSearchModel.toolTip = tooltip;
					ADSearchUtil.attributeDataArr.push(EAdvancedSearchModel);
					attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);

					for (var i = 0; i < fetchedModelArr.length; i++) {
						var attrsource = _.where(backupAttributeData(), { AttributeName: 'ModelName' });
						if (attrsource[0].IsMultiUse == false) {
							AttributeData.remove(attrsource[0]);
						}
					}

				}

				if (data.AdvancedSearchStatus) {
					var fetchedstatusArr = data.AdvancedSearchStatus;
					var attrsource = _.where(backupAttributeData(), { AttributeName: 'ComputedDeviceStatus' });
					var EAdvancedSearchstatus = new Object();

					EAdvancedSearchstatus.AttributeName = attrsource[0].AttributeName;
					EAdvancedSearchstatus.ControlType = attrsource[0].ControlType;
					EAdvancedSearchstatus.DeviceSearchAttributeOperators = attrsource[0].DeviceSearchAttributeOperators;

					var opsource = attrsource[0].DeviceSearchAttributeOperators;

					EAdvancedSearchstatus.OperatorValue = opsource[0].Operator;
					EAdvancedSearchstatus.DeviceSearchAttributeId = opsource[0].DeviceSearchAttributesId;
					EAdvancedSearchstatus.SelectedDeviceSearchOperatorId = opsource[0].DeviceSearchOperatorId;
					EAdvancedSearchstatus.DisplayName = attrsource[0].DisplayName;

					var tooltip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' ';
					multiselctedDeviceStatus([]);
					for (var i = 0; i < fetchedstatusArr.length; i++) {
						var objstatus = new Object();
						objstatus.Name = fetchedstatusArr[i].DeviceStatus;

						var multichoiceSource = getMultiCoiceFilterArr('Device Status');
						var selectedSource = _.where(multichoiceSource, { ControlValue: fetchedstatusArr[i].DeviceStatus });
						if (selectedSource && selectedSource.length > 0) {
							objstatus.displaytext = selectedSource[0].Value;

							multiselctedDeviceStatus.push(objstatus);
							tooltip += ' ' + selectedSource[0].Value + ',';
						}
					}

					tooltip = tooltip.substring(0, tooltip.length - 1);
					EAdvancedSearchstatus.toolTip = tooltip;
					ADSearchUtil.attributeDataArr.push(EAdvancedSearchstatus);
					attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);

					for (var i = 0; i < fetchedstatusArr.length; i++) {
						var attrsource = _.where(backupAttributeData(), { AttributeName: 'ComputedDeviceStatus' });
						if (attrsource[0].IsMultiUse == false) {
							AttributeData.remove(attrsource[0]);
						}
					}
				}

				if (data.AdvanedSearchElement) {
					var elementArr = data.AdvanedSearchElement;
					for (var i = 0; i < elementArr.length; i++) {
						var attrsource = _.where(backupAttributeData(), { DeviceSearchAttributeId: elementArr[i].DeviceSearchAttributeId });
						var DeviceSearchElement = new Object();
						if (attrsource != '') {
							DeviceSearchElement.AttributeName = attrsource[0].AttributeName;
							DeviceSearchElement.ControlType = attrsource[0].ControlType;
							DeviceSearchElement.DeviceSearchAttributeOperators = attrsource[0].DeviceSearchAttributeOperators;
							var opsource = _.where(attrsource[0].DeviceSearchAttributeOperators, { DeviceSearchOperatorId: elementArr[i].DeviceSearchOperatorId });

							DeviceSearchElement.OperatorValue = opsource[0].Operator;
							if (attrsource[0].AttributeName == 'Name' || attrsource[0].AttributeName == 'PaymentAppName') {
								DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' Name : ' + elementArr[i].SearchValue + ' version : ' + elementArr[i].SearchValueOptional1;
							} else if (attrsource[0].ControlType == 'Date') {
								DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' From : ' + elementArr[i].SearchValue + ' To : ' + elementArr[i].SearchValueOptional1;
							} else {
								DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' ' + elementArr[i].SearchValue + '  ' + elementArr[i].SearchValueOptional1;
							}
							DeviceSearchElement.DisplayName = attrsource[0].DisplayName;
						}

						DeviceSearchElement.DeviceSearchAttributeId = elementArr[i].DeviceSearchAttributeId;
						DeviceSearchElement.SelectedDeviceSearchOperatorId = elementArr[i].DeviceSearchOperatorId;
						DeviceSearchElement.SearchElementSeqNo = elementArr[i].SearchElementSeqNo;
						DeviceSearchElement.SearchId = elementArr[i].SearchId;
						DeviceSearchElement.ControlValues = elementArr[i].SearchValue;
						DeviceSearchElement.OptionalValue = elementArr[i].SearchValueOptional1;
						ADSearchUtil.attributeDataArr.push(DeviceSearchElement);
						attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);
					}

					for (var i = 0; i < elementArr.length; i++) {
						var attrsource = _.where(backupAttributeData(), { DeviceSearchAttributeId: elementArr[i].DeviceSearchAttributeId });
						if (attrsource[0].IsMultiUse == false) {
							AttributeData.remove(attrsource[0]);
						}
					}

				}
			}

			$("#txtSearchName").val(data.SearchName);
			if ($("#txtSearchName").val().trim() != '') {
				$("#rbtPrivate").prop('disabled', false);
				$("#rbtPublic").prop('disabled', false);
				if ($("#rbtPrivate").is(':checked')) {
					$("#chkDefaultSearch").prop('disabled', false);
				}
				$("#btnSave").removeAttr('disabled');
			}
			if (isEditMode() == false) {
				$("#txtSearchName").val('');
				$("#rbtPrivate").prop('disabled', true);
				$("#rbtPublic").prop('disabled', true);
				$("#chkDefaultSearch").prop('disabled', true);
			}
			//isCopyMode(false);
			isEditMode(false);

		}
	}


	function deleteSaveSearch(searchId, allSearches, searchName, oldSearchID, isDeleteMode, hierarchyFullPath, criteriaGroups, attrbuteCriteriaArr, AttributeData, checkAccessType, isEditMode, multiselctedModels, multiselctedDeviceStatus, multiselctedSubStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, isCopyMode, backUpAttributeData, searchCheck, multiSelectedSoftwareAssignmentType) {
		$("#txtQuickSearchDevice").val('');
		$("#txtSearchName").val('');
		isDeleteMode(false);
		var deleteAdvanedSearchReq = new Object();
		deleteAdvanedSearchReq.SearchId = searchId;
		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					oldSearchID(0);
					ADSearchUtil.attributeDataArr = [];
					hierarchyFullPath([]);
					attrbuteCriteriaArr([]);
					criteriaGroups([]);
					multiselctedModels([]);
					multiselctedDeviceStatus([]);
					multiselctedSubStatus([]);
					multiSelectedModeOfConnectivity([]);
					multiSelectedVTPEncryptionStatus([]);
					multiSelectedSoftwareAssignmentType([]);

					if (userPersonalization && searchId == userPersonalization.DefaultSearchId) {
						saveUserPreferences(null, 0);
					}

					var msg = i18n.t('search_delete_success', { lng: lang, deletedsearchname: searchName })
					AdvancedOpenAlertPopup(0, msg);
					setDeviceSearchAttributes(AttributeData, ADSearchUtil.attributeType, backUpAttributeData);
					getAllSearches(allSearches, hierarchyFullPath, criteriaGroups, attrbuteCriteriaArr, AttributeData, checkAccessType, isEditMode, multiselctedModels, multiselctedDeviceStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, isCopyMode, backUpAttributeData, searchCheck, oldSearchID, multiSelectedSoftwareAssignmentType);
				}
			}
		}

		var params = '{"token":"' + TOKEN() + '","deleteAdvanedSearchReq":' + JSON.stringify(deleteAdvanedSearchReq) + '}';
		ajaxJsonCall('DeleteAdvancedSearch', params, callbackFunction, true, 'POST', true);
	}


	function getAdvancedSearch(searchId, hierarchyFullPath, criteriaGroups, attrbuteCriteriaArr, AttributeData, checkAccessType, isEditMode, multiselctedModels, multiselctedDeviceStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, isCopyMode, backupAttributeData, searchCheck, multiSelectedSoftwareAssignmentType) {

		var getAdvanedSearchReq = new Object();
		getAdvanedSearchReq.SearchId = searchId;
		function callbackFunction(data) {
			if (data) {

				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					hierarchyFullPath([]);
					ADSearchUtil.HierarchyPathArr([]);

					ADSearchUtil.attributeDataArr = [];

					attrbuteCriteriaArr([]);

					ADSearchUtil.selectedGroupsForAdSearch = [];
					criteriaGroups([]);

					if (data.getAdvanedSearchResp) {
						data.getAdvanedSearchResp = $.parseJSON(data.getAdvanedSearchResp);
						if (data.getAdvanedSearchResp.AdvancedSearch) {
							if (data.getAdvanedSearchResp.AdvancedSearch.IsPrivateSearch == false) {
								checkAccessType('Public');
								$("#chkDefaultSearch").prop('checked', false);
								$("#chkDefaultSearch").prop('disabled', true);
							} else {
								checkAccessType('Private');
								$("#chkDefaultSearch").prop('disabled', false);
							}

							if (data.getAdvanedSearchResp.AdvancedSearch.IsIncludeConnectedDevices) {
								$("#chkAutoSelectConnected").prop("checked", true);
							} else {
								$("#chkAutoSelectConnected").prop("checked", false);
							}

							if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchHierarchy) {
								searchCheck(AppConstants.get('HIERARCHY'));
								$("#hierarchyDiv").show();
								$("#GroupDiv").hide();
								var hierarchyeditData = data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchHierarchy;
								for (var i = 0; i < hierarchyeditData.length; i++) {

									var EAdvancedSearchHierarchy = new Object();
									EAdvancedSearchHierarchy.HierarchyFullPath = hierarchyeditData[i].HierarchyFullPath;
									EAdvancedSearchHierarchy.HierarchyId = hierarchyeditData[i].HierarchyId;
									EAdvancedSearchHierarchy.IncludeChildren = hierarchyeditData[i].IncludeChildren;
									EAdvancedSearchHierarchy.IsChildExists = hierarchyeditData[i].IsChildExists;
									EAdvancedSearchHierarchy.SearchId = searchId;
									ADSearchUtil.HierarchyPathArr.push(EAdvancedSearchHierarchy);
								}
								hierarchyFullPath = ADSearchUtil.HierarchyPathArr;
								var arr = hierarchyFullPath();

							} else if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchGroup) {
								searchCheck(AppConstants.get('GROUPS'));
								getGroups(criteriaGroups);
								$("#hierarchyDiv").hide();
								$("#GroupDiv").show();
								var fetchedGroupArr = data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchGroup;
								for (var i = 0; i < fetchedGroupArr.length; i++) {
									var EAdvancedSearchGroup = new Object();
									EAdvancedSearchGroup.GroupId = fetchedGroupArr[i].GroupId;
									EAdvancedSearchGroup.GroupName = fetchedGroupArr[i].GroupName;
									EAdvancedSearchGroup.SearchId = searchId;

									ADSearchUtil.selectedGroupsForAdSearch.push(EAdvancedSearchGroup);
									criteriaGroups.push(EAdvancedSearchGroup);
								}

							}

							if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchModel) {
								var fetchedModelArr = data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchModel;
								var EAdvancedSearchModel = new Object();

								EAdvancedSearchModel.DeviceSearchAttributeId = 0;
								EAdvancedSearchModel.SelectedDeviceSearchOperatorId = 0;
								EAdvancedSearchModel.SearchElementSeqNo = 0;
								EAdvancedSearchModel.SearchId = 0;
								EAdvancedSearchModel.ControlValues = '0';
								EAdvancedSearchModel.OperatorValue = 'Equal To';
								EAdvancedSearchModel.DisplayName = "Model";
								EAdvancedSearchModel.AttributeName = "ModelName";

								var tooltip = 'Equal To ';
								multiselctedModels([]);
								for (var i = 0; i < fetchedModelArr.length; i++) {
									tooltip += fetchedModelArr[i].ModelName + ', ';

									var objModel = new Object();
									objModel.Id = fetchedModelArr[i].ModelId;
									objModel.Name = fetchedModelArr[i].ModelName;

									var multichoiceSource = getMultiCoiceFilterArr('Model');
									var selectedSource = _.where(multichoiceSource, { ControlValue: fetchedModelArr[i].ModelName });
									if (selectedSource.length > 0) {
										objModel.displaytext = selectedSource[0].Value;
									}

									multiselctedModels.push(objModel);
								}
								EAdvancedSearchModel.toolTip = tooltip;
								//ADSearchUtil.attributeDataArr.push(EAdvancedSearchModel);
								//attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);

							}
							if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchStatus) {
								var fetchedstatusArr = data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchStatus;
								var EAdvancedSearchstatus = new Object();

								EAdvancedSearchstatus.DeviceSearchAttributeId = 0;
								EAdvancedSearchstatus.SelectedDeviceSearchOperatorId = 0;
								EAdvancedSearchstatus.SearchElementSeqNo = 0;
								EAdvancedSearchstatus.SearchId = 0;
								EAdvancedSearchstatus.ControlValues = '0';
								EAdvancedSearchstatus.OperatorValue = 'Equal To';
								EAdvancedSearchstatus.DisplayName = "Device Status";
								EAdvancedSearchstatus.AttributeName = "ComputedDeviceStatus";
								var tooltip = 'Equal To ';
								multiselctedDeviceStatus([]);
								for (var i = 0; i < fetchedstatusArr.length; i++) {
									tooltip += fetchedstatusArr[i].DeviceStatus + ', ';

									var objstatus = new Object();
									objstatus.Name = fetchedstatusArr[i].DeviceStatus;

									var multichoiceSource = getMultiCoiceFilterArr('Device Status');
									var selectedSource = _.where(multichoiceSource, { ControlValue: fetchedstatusArr[i].DeviceStatus });
									if (selectedSource.length > 0) {
										objstatus.displaytext = selectedSource[0].Value;
									}

									multiselctedDeviceStatus.push(objstatus);
								}
								EAdvancedSearchstatus.toolTip = tooltip;
								//ADSearchUtil.attributeDataArr.push(EAdvancedSearchstatus);

								//attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);

							}
							if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchSubStatus) {
								var fetchedstatusArr = data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchSubStatus;
								var EAdvancedSearchSubStatus = new Object();

								EAdvancedSearchSubStatus.DeviceSearchAttributeId = 0;
								EAdvancedSearchSubStatus.SelectedDeviceSearchOperatorId = 0;
								EAdvancedSearchSubStatus.SearchElementSeqNo = 0;
								EAdvancedSearchSubStatus.SearchId = 0;
								EAdvancedSearchSubStatus.ControlType = 'MultiCombo';
								EAdvancedSearchSubStatus.ControlValues = '0';
								EAdvancedSearchSubStatus.OperatorValue = 'Equal To';
								EAdvancedSearchSubStatus.DisplayName = "Sub Status";
								EAdvancedSearchSubStatus.AttributeName = "SubStatus";
								var tooltip = 'Equal To ';
								multiselectedSubStatus([]);
								for (var i = 0; i < fetchedstatusArr.length; i++) {
									tooltip += fetchedstatusArr[i].DeviceStatus + ', ';

									var objsubstatus = new Object();
									objsubstatus.Name = fetchedstatusArr[i].DeviceStatus;

									var multichoiceSource = getMultiCoiceFilterArr('Sub Status');
									var selectedSource = _.where(multichoiceSource, { ControlValue: fetchedstatusArr[i].SubStatus });
									if (selectedSource.length > 0) {
										objsubstatus.displaytext = selectedSource[0].Value;
									}

									multiselectedSubStatus.push(objsubstatus);
								}
								EAdvancedSearchstatus.toolTip = tooltip;
								//ADSearchUtil.attributeDataArr.push(EAdvancedSearchstatus);
								//attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);
							}

							if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchModeofConnectivity) {
								var fetchedmodeofconnectivityArr = data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchModeofConnectivity;
								var EAdvancedSearchModeofConnectivity = new Object();

								EAdvancedSearchModeofConnectivity.DeviceSearchAttributeId = 0;
								EAdvancedSearchModeofConnectivity.SelectedDeviceSearchOperatorId = 0;
								EAdvancedSearchModeofConnectivity.SearchElementSeqNo = 0;
								EAdvancedSearchModeofConnectivity.SearchId = 0;
								EAdvancedSearchModeofConnectivity.ControlType = 'MultiCombo';
								EAdvancedSearchModeofConnectivity.ControlValues = '0';
								EAdvancedSearchModeofConnectivity.OperatorValue = 'Equal To';
								EAdvancedSearchModeofConnectivity.DisplayName = "Mode of Connectivity";
								EAdvancedSearchModeofConnectivity.AttributeName = "ModeofConnectivity";
								var tooltip = 'Equal To ';
								multiSelectedModeOfConnectivity([]);
								for (var i = 0; i < fetchedmodeofconnectivityArr.length; i++) {
									tooltip += fetchedmodeofconnectivityArr[i].DisplayName + ', ';

									var objmodeofconnectivity = new Object();
									objmodeofconnectivity.Name = fetchedmodeofconnectivityArr[i].Name;

									var multichoiceSource = getMultiCoiceFilterArr('ModeofConnectivity');
									var selectedSource = _.where(multichoiceSource, { ControlValue: fetchedmodeofconnectivityArr[i].SearchValue });
									if (selectedSource.length > 0) {
										objmodeofconnectivity.displaytext = selectedSource[0].Value;
									}

									multiSelectedModeOfConnectivity.push(objmodeofconnectivity);
								}
								EAdvancedSearchstatus.toolTip = tooltip;
								//ADSearchUtil.attributeDataArr.push(EAdvancedSearchstatus);
								//attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);
							}

							if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchSoftwareAssignmentType) {
								var fetchedsoftwareAssignmentTypArr = data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchSoftwareAssignmentType;
								var EAdvancedSearchSoftwareAssignmentType = new Object();

								EAdvancedSearchSoftwareAssignmentType.DeviceSearchAttributeId = 0;
								EAdvancedSearchSoftwareAssignmentType.SelectedDeviceSearchOperatorId = 0;
								EAdvancedSearchSoftwareAssignmentType.SearchElementSeqNo = 0;
								EAdvancedSearchSoftwareAssignmentType.SearchId = 0;
								EAdvancedSearchSoftwareAssignmentType.ControlType = 'MultiCombo';
								EAdvancedSearchSoftwareAssignmentType.ControlValues = '0';
								EAdvancedSearchSoftwareAssignmentType.OperatorValue = 'Equal To';
								EAdvancedSearchSoftwareAssignmentType.DisplayName = "Software Assignment Type";
								EAdvancedSearchSoftwareAssignmentType.AttributeName = "SoftwareAssignmentType";
								var tooltip = 'Equal To ';
								multiSelectedSoftwareAssignmentType([]);
								for (var i = 0; i < fetchedsoftwareAssignmentTypArr.length; i++) {
									tooltip += fetchedsoftwareAssignmentTypArr[i].DisplayName + ', ';

									var objSoftwareAssignmentType = new Object();
									objSoftwareAssignmentType.Name = fetchedsoftwareAssignmentTypArr[i].Name;

									var multichoiceSource = getMultiCoiceFilterArr('Software Assignment Type');
									var selectedSource = _.where(multichoiceSource, { ControlValue: fetchedsoftwareAssignmentTypArr[i].SearchValue });
									if (selectedSource.length > 0) {
										objSoftwareAssignmentType.displaytext = selectedSource[0].Value;
									}

									multiSelectedSoftwareAssignmentType.push(objSoftwareAssignmentType);
								}
								EAdvancedSearchstatus.toolTip = tooltip;

							}

							if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchVTPEncryptionStatus) {
								var fetchedvtpencryptionstatusArr = data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchVTPEncryptionStatus;
								var EAdvancedSearchModeofConnectivity = new Object();

								EAdvancedSearchModeofConnectivity.DeviceSearchAttributeId = 0;
								EAdvancedSearchModeofConnectivity.SelectedDeviceSearchOperatorId = 0;
								EAdvancedSearchModeofConnectivity.SearchElementSeqNo = 0;
								EAdvancedSearchModeofConnectivity.SearchId = 0;
								EAdvancedSearchModeofConnectivity.ControlType = 'MultiCombo';
								EAdvancedSearchModeofConnectivity.ControlValues = '0';
								EAdvancedSearchModeofConnectivity.OperatorValue = 'Equal To';
								EAdvancedSearchModeofConnectivity.DisplayName = "Mode of Connectivity";
								EAdvancedSearchModeofConnectivity.AttributeName = "ModeofConnectivity";
								var tooltip = 'Equal To ';
								multiSelectedVTPEncryptionStatus([]);
								for (var i = 0; i < fetchedvtpencryptionstatusArr.length; i++) {
									tooltip += fetchedvtpencryptionstatusArr[i].DisplayName + ', ';

									var objvtpencryptionstatus = new Object();
									objvtpencryptionstatus.Name = fetchedvtpencryptionstatusArr[i].Name;

									var multichoiceSource = getMultiCoiceFilterArr('EncrEnabled');
									var selectedSource = _.where(multichoiceSource, { ControlValue: fetchedvtpencryptionstatusArr[i].SearchValue });
									if (selectedSource.length > 0) {
										objvtpencryptionstatus.displaytext = selectedSource[0].Value;
									}

									multiSelectedVTPEncryptionStatus.push(objvtpencryptionstatus);

								}
								EAdvancedSearchstatus.toolTip = tooltip;
								//ADSearchUtil.attributeDataArr.push(EAdvancedSearchstatus);
								//attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);
							}
							if (data.getAdvanedSearchResp.AdvancedSearch.AdvanedSearchElement) {
								var elementArr = data.getAdvanedSearchResp.AdvancedSearch.AdvanedSearchElement;
								for (var i = 0; i < elementArr.length; i++) {
									var attrsource = _.where(backupAttributeData(), { DeviceSearchAttributeId: elementArr[i].DeviceSearchAttributeId });

									var DeviceSearchElement = new Object();

									//DeviceSearchElement.ControlType = attrsource[0].ControlType;
									//DeviceSearchElement.DeviceSearchAttributeId = elementArr[i].DeviceSearchAttributeId;
									//DeviceSearchElement.SelectedDeviceSearchOperatorId = elementArr[i].DeviceSearchOperatorId;
									//DeviceSearchElement.SearchElementSeqNo = elementArr[i].SearchElementSeqNo;
									//DeviceSearchElement.SearchId = elementArr[i].SearchId;
									//DeviceSearchElement.ControlValues = elementArr[i].SearchValue;
									//var opsource = _.where(attrsource[0].DeviceSearchAttributeOperators, { DeviceSearchOperatorId: elementArr[i].DeviceSearchOperatorId });

									//DeviceSearchElement.OperatorValue = opsource[0].Operator;
									//DeviceSearchElement.OptionalValue = elementArr[i].SearchValueOptional1;
									//DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + elementArr[i].SearchValue + '  ' + elementArr[i].SearchValueOptional1;
									//DeviceSearchElement.DisplayName = attrsource[0].DisplayName;
									if (attrsource.length > 0) {
										DeviceSearchElement.AttributeName = attrsource[0].AttributeName;
										DeviceSearchElement.ControlType = attrsource[0].ControlType;
										DeviceSearchElement.DeviceSearchAttributeOperators = attrsource[0].DeviceSearchAttributeOperators;
										var opsource = _.where(attrsource[0].DeviceSearchAttributeOperators, { DeviceSearchOperatorId: elementArr[i].DeviceSearchOperatorId });

										DeviceSearchElement.OperatorValue = opsource[0].Operator;
										if (attrsource[0].AttributeName == 'Name' || attrsource[0].AttributeName == 'PaymentAppName') {
											DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' Name : ' + elementArr[i].SearchValue + ' Version : ' + elementArr[i].SearchValueOptional1;
										} else if (attrsource[0].ControlType == 'Date') {

											DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' From : ' + elementArr[i].SearchValue + ' To : ' + elementArr[i].SearchValueOptional1;

										} else {
											DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' ' + elementArr[i].SearchValue + '  ' + elementArr[i].SearchValueOptional1;
										}
										DeviceSearchElement.DisplayName = attrsource[0].DisplayName;
									} else {
										DeviceSearchElement.DisplayName = '';
										DeviceSearchElement.toolTip = '';
									}

									DeviceSearchElement.DeviceSearchAttributeId = elementArr[i].DeviceSearchAttributeId;
									DeviceSearchElement.SelectedDeviceSearchOperatorId = elementArr[i].DeviceSearchOperatorId;
									DeviceSearchElement.SearchElementSeqNo = elementArr[i].SearchElementSeqNo;
									DeviceSearchElement.SearchId = elementArr[i].SearchId;
									DeviceSearchElement.ControlValues = elementArr[i].SearchValue;

									DeviceSearchElement.OptionalValue = elementArr[i].SearchValueOptional1;

									ADSearchUtil.attributeDataArr.push(DeviceSearchElement);
									attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);
								}

								for (var i = 0; i < elementArr.length; i++) {
									var attrsource = _.where(backupAttributeData(), { DeviceSearchAttributeId: elementArr[i].DeviceSearchAttributeId });

									if (attrsource && attrsource.length > 0) {
										if (attrsource[0].IsMultiUse == false) {
											AttributeData.remove(attrsource[0]);
										}
									}
								}
							}
						}

						if (isEditMode() == true) {
							$("#txtSearchName").val(data.getAdvanedSearchResp.AdvancedSearch.SearchName);
							$("#txtQuickSearchDevice").val(data.getAdvanedSearchResp.AdvancedSearch.SearchName);

							if (isSearchAdmin == false) {
								$("#groupContainer").addClass('disabled');
								$("#deviceAttributDDL").prop('disabled', true);
								$("#deviceAttributDDL").css({ 'pointer-events': 'none', 'cursor': 'default' });
								$('#deviceAttributDDL').val('-Select-').prop("selected", "selected");
								$('#deviceAttributDDL').trigger('chosen:updated');
								$("#selectedHierarchies").addClass('disabled');
								$("#childHCheckbox").addClass('disabled');
								$("#childHCheckbox").prop("disabled", true);
								$("#selectedAttributes").addClass('disabled');
								$("#selectedGroups").addClass('disabled');
								$("#txtSearchName").prop('disabled', true);
								$("#rbtPrivate").prop('disabled', true);
								$("#rbtPublic").prop('disabled', true);
								$("#chkDefaultSearch").prop('disabled', true);
							} else {
								$("#groupContainer").removeClass('disabled');
								$("#deviceAttributDDL").prop('disabled', false);
								$("#deviceAttributDDL").css({ 'pointer-events': 'all', 'cursor': 'pointer' });
								$('#deviceAttributDDL').val('-Select-').prop("selected", "selected");
								$('#deviceAttributDDL').trigger('chosen:updated');
								$("#selectedHierarchies").removeClass('disabled');
								$("#childHCheckbox").removeClass('disabled');
								$("#childHCheckbox").prop("disabled", false);
								$("#selectedAttributes").removeClass('disabled');
								$("#selectedGroups").removeClass('disabled');
								$("#txtSearchName").prop('disabled', false);
								$("#rbtPrivate").prop('disabled', false);
								$("#rbtPublic").prop('disabled', false);
								if ($("#rbtPrivate").is(':checked')) {
									$("#chkDefaultSearch").prop('disabled', false);
								}
							}
						} else {
							$("#txtSearchName").val('');
							$("#txtQuickSearchDevice").val('');
						}
						$("#btnSave").prop('disabled', true);
						//isCopyMode(false);
						//isEditMode(true);

					}
				}
			}
		}

		var params = '{"token":"' + TOKEN() + '","getAdvanedSearchReq":' + JSON.stringify(getAdvanedSearchReq) + '}';
		ajaxJsonCall("GetAdvancedSearch", params, callbackFunction, true, 'POST', true);
	}

	function saveAdvancedSearch(clearAdvancedSearch, addAdvancedSearchReq, gId, allSearches, hierarchyFullPath, criteriaGroups, attrbuteCriteriaArr, AttributeData, checkAccessType, isEditMode, multiselctedModels, multiselctedDeviceStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, isCopyMode, backUpAttributeData, searchCheck, SearchId, multiSelectedSoftwareAssignmentType) {

		function callbackFunction(data, error) {
			if (data) {

				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (isEditMode() == false) {
						SearchId(data.addAdvancedSearchResp.SearchId);
					}
					AdvancedOpenAlertPopup(0, 'Advance_Search_Saved_successfully');
					$("#txtQuickSearchDevice").val($("#txtSearchName").val());
					$("#btnSave").prop('disabled', true);
					$("#btnApplyFilter").prop('disabled', true);
					$("#btnApplyFilterChart").prop('disabled', true);
					isGroupModified = false;
					koUtil.isHierarchyModified(false);
					koUtil.isAttributeModified(false);
					if ($("#chkDefaultSearch").is(':checked')) {
						saveUserPreferences(addAdvancedSearchReq.AdvancedSearch.SearchText, SearchId());
					}
					getAllSearches(allSearches, hierarchyFullPath, criteriaGroups, attrbuteCriteriaArr, AttributeData, checkAccessType, isEditMode, multiselctedModels, multiselctedDeviceStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, isCopyMode, backUpAttributeData, searchCheck, SearchId, multiSelectedSoftwareAssignmentType);
					// clearAdvancedSearch();
					//unloadAdvancedSearch();
				} else if (data.responseStatus.StatusCode == AppConstants.get('SEARCH_WITH_NAME_EXISTS')) {
					AdvancedOpenAlertPopup(2, 'Search_With_Name_Exists');
				} else if (data.responseStatus.StatusCode == AppConstants.get('ACCESS_DENIED')) {
					openAlertpopup(1, data.responseStatus.StatusMessage);
				}
			}
		}

		if (isEditMode() == true) {
			$("#updateSaveSearchConfirmationPopup").modal('hide');
			var params = '{"token":"' + TOKEN() + '","setAdvancedSearchReq":' + JSON.stringify(addAdvancedSearchReq) + '}';
			ajaxJsonCall("SetAdvancedSearch", params, callbackFunction, true, 'POST', true);
		} else {

			var params = '{"token":"' + TOKEN() + '","addAdvancedSearchReq":' + JSON.stringify(addAdvancedSearchReq) + '}';
			ajaxJsonCall("AddAdvancedSearch", params, callbackFunction, true, 'POST', true);
		}
	};

	function saveUserPreferences(searchText, searchId) {
		var personalizationDetails = new Object();
		personalizationDetails.HomeScreen = userPersonalization ? userPersonalization.HomeScreen : AppConstants.get('DASHBOARD');
		personalizationDetails.DefaultSearchId = searchId;

		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.getUserPersonalizationResp) {
						data.getUserPersonalizationResp = $.parseJSON(data.getUserPersonalizationResp);
						userPersonalization = data.getUserPersonalizationResp.UserPersonalization;
						globalUserPreferenceObject = data.getUserPersonalizationResp.UserPersonalization;

						if (userPersonalization != null && globalSavedSearchArray && globalSavedSearchArray.length > 0) {
							for (var i = 0; i < globalSavedSearchArray.length; i++) {
								if (userPersonalization.DefaultSearchId == globalSavedSearchArray[i].SearchID) {
									userPersonalization.DefaultSearchName = globalSavedSearchArray[i].SearchName;
									break;
								}
							}
						}
					}
					userPersonalization.DefaultSearchName = searchId > 0 ? $("#txtSearchName").val().trim() : AppConstants.get('EMPTY_SEARCH');
					userPersonalization.DefaultSearchText = searchText;
				}
			}
		}

		if (!_.isEmpty(userPersonalization) && userGuid == userPersonalization.UserGuid)
			personalizationDetails.IsUpdateUserPersonalization = true;

		var method = 'AddOrSetUserPersonalization';
		var params = '{"token":"' + TOKEN() + '", "addOrSetUserPersonalizationReq": ' + JSON.stringify(personalizationDetails) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
	}

	function getGroups(criteriaGroups) {
		var getGroupsReq = new Object();
		var Export = new Object();
		var Pagination = new Object();
		var Selector = new Object();
		var ColumnSortFilter = new Object();

		Pagination.HighLightedItemId = null
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

		Selector.SelectedItemIds = null;
		Selector.UnSelectedItemIds = null;

		ColumnSortFilter.FilterList = null;
		ColumnSortFilter.SortList = null;

		Export.DynamicColumns = null;
		Export.ExportReportType = 5;
		Export.IsAllSelected = false;
		Export.IsExport = false;

		getGroupsReq.ColumnSortFilter = ColumnSortFilter;
		getGroupsReq.Pagination = Pagination;
		getGroupsReq.Selector = Selector;
		getGroupsReq.ShowAllRecords = true;
		getGroupsReq.Export = Export;

		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					var selectedArr = new Array();
					if (data.getGroupsResp)
						data.getGroupsResp = $.parseJSON(data.getGroupsResp);

					if (ClearAdSearch == 0) {

						var storedGId = ADSearchUtil.gridIdForAdvanceSearch;
						if (ADSearchUtil.gridIdForAdvanceSearch == 'jqxgridForSelectedDevices') {
							var screenname = getschedulscrenName();
							storedGId = ADSearchUtil.gridIdForAdvanceSearch + screenname;
						}
						var adStorage = JSON.parse(sessionStorage.getItem(storedGId + "adStorage"));
						if (adStorage && adStorage.length > 0) {
							if (adStorage[0].AdvancedSearchGroup && adStorage[0].AdvancedSearchGroup != undefined && adStorage[0].AdvancedSearchGroup != '') {
								for (var g = 0; g < data.getGroupsResp.Groups.length; g++) {
									var gsource = _.where(adStorage[0].AdvancedSearchGroup, { GroupId: data.getGroupsResp.Groups[g].GroupId });
									if (gsource != '') {
										data.getGroupsResp.Groups[g]["isSelected"] = 1;
										selectedArr.push(data.getGroupsResp.Groups[g].GroupId);
									} else {
										data.getGroupsResp.Groups[g]["isSelected"] = 0;
									}
								}
							}
						}
					} else {
						for (var g = 0; g < data.getGroupsResp.Groups.length; g++) {
							data.getGroupsResp.Groups[g]["isSelected"] = 0;
						}
					}

					var gridStorageArr = new Array();
					var gridStorageObj = new Object();
					gridStorageObj.checkAllFlag = 0;
					gridStorageObj.counter = selectedArr.length;
					gridStorageObj.filterflage = 0;
					gridStorageObj.selectedDataArr = selectedArr;
					gridStorageObj.unSelectedDataArr = [];
					gridStorageObj.singlerowData = [];
					gridStorageObj.multiRowData = [];
					gridStorageObj.TotalSelectionCount = null;
					gridStorageObj.highlightedRow = null;
					gridStorageObj.highlightedPage = null;
					gridStorageArr.push(gridStorageObj);

					var gridStorage = JSON.stringify(gridStorageArr);
					window.sessionStorage.setItem('groupsGrid' + 'gridStorage', gridStorage);
					groupData = data.getGroupsResp.Groups
					groupsGrid(data.getGroupsResp.Groups, 'groupsGrid', criteriaGroups);
				}
			} else if (error) {
				//AdvancedOpenAlertPopup(2, 'network_error');
			}
		}

		var params = '{"token":"' + TOKEN() + '","getGroupsReq":' + JSON.stringify(getGroupsReq) + '}';
		ajaxJsonCall('GetGroups', params, callBackfunction, true, 'POST', true);
	}

	function groupsGrid(groupsData, gID, criteriaGroups) {

		$("#loadingDiv").show();
		var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));
		if (groupsData) {
			groupsData.sort(function (a, b) { return a.GroupName > b.GroupName ? 1 : -1; })
		}

		// prepare the data
		var source =
		{
			datatype: "array",
			localdata: groupsData,
			datafields: [
				{ name: 'GroupName', map: 'GroupName', type: 'string' },
				{ name: 'isSelected', type: 'number' },
				{ name: 'GroupId', type: 'number' }

			],

		};
		var dataAdapter = new $.jqx.dataAdapter(source);
		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID);
		}
		var rendered = function (element) {

			enableUiGridFunctions(gID, 'GroupId', element, gridStorage, isSearchAdmin, 'GroupId', criteriaGroups);

			return true;
		}

		if (groupsData) {
			var records = groupsData.length;
		} else {
			var records = 0;
		}
		$("#" + gID).jqxGrid(
			{
				width: "100%",
				height: '150px',
				source: dataAdapter,
				sortable: true,
				filterable: true,
				selectionmode: 'singlerow',
				theme: AppConstants.get('JQX-GRID-THEME'),
				pagesize: records,
				columnsresize: true,
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				enabletooltips: true,
				editable: true,
				columns: [
					{
						text: '', menu: false, sortable: false, filterable: false, exportable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
						datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
							return '<div style="margin-left:10px"><div style="margin-top: 5px"></div></div>';
						}, rendered: rendered
					},
					{ text: '', datafield: 'GroupId', hidden: true, minwidth: 0, exportable: false },
					{

						text: i18n.t('Group_Name_headertext', { lng: lang }), datafield: 'GroupName', editable: false, minwidth: 120,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						},
					},

				]
			});

		$("#" + gID).on('columnresized', function (event) {
			var args = event.args;
			var column = args.column;
			var modifiedWidth = args.newwidth - args.oldwidth;
			var newGridSize = $('#contentgroupsGrid').width() + modifiedWidth + 20;
			// Resize grid with column.
			$("#" + gID).jqxGrid({ width: newGridSize });
		});
		try {
			$("#" + gID).jqxGrid('autoresizecolumn', 'isSelected');
		} catch (err) {
			console.log("Error on autosizecolumn");
		}


		getUiGridBiginEdit(gID, 'GroupId', gridStorage, criteriaGroups);
		callUiGridFilter(gID, gridStorage);
		$("#loadingDiv").hide();
	}

	function getAllSearches(allSearches, hierarchyFullPath, criteriaGroups, attrbuteCriteriaArr, AttributeData, checkAccessType, isEditMode, multiselctedModels, multiselctedDeviceStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, isCopyMode, backUpAttributeData, searchCheck, searchId, multiSelectedSoftwareAssignmentType) {

		function callbackFunction(data, error) {
			if (data) {

				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					allSearches([]);
					var privateSearch = new Array();
					var publicSearch = new Array();
					var quickSearch = new Array();
					if (data.getAllSearchesResp) {
						data.getAllSearchesResp = $.parseJSON(data.getAllSearchesResp);
						if (data.getAllSearchesResp.Searches) {

							for (var i = 0; i < data.getAllSearchesResp.Searches.length; i++) {
								var saveSearchdata = new Object();
								saveSearchdata.SearchID = data.getAllSearchesResp.Searches[i].SearchID;
								if (data.getAllSearchesResp.Searches[i].SearchType == 2) {
									saveSearchdata.SearchName = data.getAllSearchesResp.Searches[i].SearchText;
								} else {
									saveSearchdata.SearchName = data.getAllSearchesResp.Searches[i].SearchName;
								}
								saveSearchdata.SearchText = data.getAllSearchesResp.Searches[i].SearchText;
								saveSearchdata.SearchType = data.getAllSearchesResp.Searches[i].SearchType;
								saveSearchdata.IsPrivateSearch = data.getAllSearchesResp.Searches[i].IsPrivateSearch;
								saveSearchdata.IsAdmin = data.getAllSearchesResp.Searches[i].IsAdmin;

								if (data.getAllSearchesResp.Searches[i].SearchType == 2) {
									//ADSearchUtil.quickSearch = saveSearchdata;
									//quickSearch.push(saveSearchdata);
									//quickSearch.sort(function (a, b) { return a.SearchName.toLowerCase() > b.SearchName.toLowerCase() ? 1 : -1; })
								} else {
									if (data.getAllSearchesResp.Searches[i].IsPrivateSearch) {
										ADSearchUtil.privateSearch = saveSearchdata;
										privateSearch.push(saveSearchdata);
										privateSearch.sort(function (a, b) { return a.SearchName.toLowerCase() > b.SearchName.toLowerCase() ? 1 : -1; })
									} else {
										ADSearchUtil.publicSearch = saveSearchdata;
										publicSearch.push(saveSearchdata);
										publicSearch.sort(function (a, b) { return a.SearchName.toLowerCase() > b.SearchName.toLowerCase() ? 1 : -1; })
									}
								}
							}

							var saveSearchdata = new Object();
							saveSearchdata.SearchID = 0;
							saveSearchdata.SearchName = AppConstants.get('PRIVATE_SEARCH');
							saveSearchdata.SearchText = AppConstants.get('PRIVATE_SEARCH');
							saveSearchdata.SearchType = 2;
							saveSearchdata.IsPrivateSearch = '';
							saveSearchdata.IsAdmin = false;
							allSearches.push(saveSearchdata);
							for (var i = 0; i < privateSearch.length; i++) {
								allSearches.push(privateSearch[i]);
							}

							var saveSearchdata = new Object();
							saveSearchdata.SearchID = 0;
							saveSearchdata.SearchName = AppConstants.get('PUBLIC_SEARCH');
							saveSearchdata.SearchText = AppConstants.get('PUBLIC_SEARCH');
							saveSearchdata.SearchType = 2;
							saveSearchdata.IsPrivateSearch = '';
							saveSearchdata.IsAdmin = false;
							allSearches.push(saveSearchdata);
							for (var i = 0; i < publicSearch.length; i++) {
								allSearches.push(publicSearch[i]);
							}

							ADSearchUtil.ADAllSearches(allSearches());
							koUtil.savedSearchId = searchId();

							//----Global private search used in MyPreferences screen
							globalSavedSearchArray = new Array();
							var saveSearchObject = new Object();
							saveSearchObject.SearchID = 0;
							saveSearchObject.SearchName = AppConstants.get('EMPTY_SEARCH');
							saveSearchObject.SearchText = AppConstants.get('EMPTY_SEARCH');
							saveSearchObject.SearchType = 0;
							saveSearchObject.IsAdmin = true;
							globalSavedSearchArray.push(saveSearchObject);

							if (isUserInAdminRole) {
								//--For admin both public & private searches shown to set global search
								for (var i = 0; i < allSearches().length; i++) {
									globalSavedSearchArray.push(allSearches()[i]);
								}
							}
							else {
								for (var i = 0; i < privateSearch.length; i++) {
									globalSavedSearchArray.push(privateSearch[i]);
								}
							}

							if (userPersonalization) {
								if (globalSavedSearchArray && globalSavedSearchArray.length > 0) {
									if (userPersonalization.DefaultSearchId == 0) {
										userPersonalization.DefaultSearchName = AppConstants.get('EMPTY_SEARCH');
										userPersonalization.DefaultSearchText = AppConstants.get('EMPTY_SEARCH');
									} else {
										for (var i = 0; i < globalSavedSearchArray.length; i++) {
											if (userPersonalization.DefaultSearchId == globalSavedSearchArray[i].SearchID) {
												userPersonalization.DefaultSearchName = globalSavedSearchArray[i].SearchName;
												userPersonalization.DefaultSearchText = globalSavedSearchArray[i].SearchText;
												isMatch = true;
												break;
											}
										}
									}
								}
							}

							if (koUtil.savedSearchId > 0) {
								var savedSearch = new Object();
								var index = -1;

								for (var k = 0; k < allSearches().length; k++) {
									if (koUtil.savedSearchId == allSearches()[k].SearchID) {
										savedSearch = allSearches()[k];
										index = k;
										break;
									}
								}
								$("#txtQuickSearchDevice").val(savedSearch.SearchName);

								$("#allSearchUL").each(function () {
									$(this).children('li').css("background-color", "");
								});
								$("#selectedQuickSearchLi" + index).css("background-color", "#00aeef");
								isEditMode(true);
								isCopyMode(false);
								searchId(savedSearch.SearchID);
								$("#btnSave").prop('disabled', true);
								getAdvancedSearch(searchId(), hierarchyFullPath, criteriaGroups, attrbuteCriteriaArr, AttributeData, checkAccessType, isEditMode, multiselctedModels, multiselctedDeviceStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, isCopyMode, backUpAttributeData, searchCheck, multiSelectedSoftwareAssignmentType);
							} else {
								isEditMode(true);
								isCopyMode(false);
							}
						} else {
							globalSavedSearchArray = new Array();
							var saveSearchObject = new Object();
							saveSearchObject.SearchID = 0;
							saveSearchObject.SearchName = AppConstants.get('EMPTY_SEARCH');
							saveSearchObject.SearchText = AppConstants.get('EMPTY_SEARCH');
							saveSearchObject.SearchType = 0;
							saveSearchObject.IsAdmin = true;
							globalSavedSearchArray.push(saveSearchObject);

							userPersonalization.DefaultSearchId = 0;
							userPersonalization.DefaultSearchName = AppConstants.get('EMPTY_SEARCH');
							userPersonalization.DefaultSearchText = AppConstants.get('EMPTY_SEARCH');
						}
					}
				}
			}
			if (error) {
				//AdvancedOpenAlertPopup(2, 'network_error');
			}
		}
		var params = '{"token":"' + TOKEN() + '"}';
		ajaxJsonCall("GetAllSearches", params, callbackFunction, true, 'POST', true);
	}

	function setDeviceSearchAttributes(AttributeData, attributeType, backUpAttributeData) {
		if (deviceAttributesDataDeviceSearch == null || deviceAttributesDataDeviceSearch.length == 0) {
			deviceAttributesDataDeviceSearch = JSON.parse(window.localStorage.getItem("SearchAttributes"));
		}
		var attributeArray = new Array();
		attributeArray = deviceAttributesDataDeviceSearch;
		ADSearchUtil.deviceAttributesDataAdvSearch = new Array();
		if (attributeArray != null && attributeArray.length > 0) {
			attributeArray.sort(function (a, b) { return a.DisplayName.toUpperCase() > b.DisplayName.toUpperCase() ? 1 : -1; });
			for (var i = 0; i < deviceAttributesDataDeviceSearch.length; i++) {
				if (deviceAttributesDataDeviceSearch[i].IsVisible === true) {
					if (ADSearchUtil.AdScreenName == 'deletedDevice' && (deviceAttributesDataDeviceSearch[i].DisplayName == 'Device Status' || deviceAttributesDataDeviceSearch[i].DisplayName == 'Sub Status')) {

					} else {
						if (attributeArray[i].DisplayName == "VHQ Version")
							attributeArray[i].DisplayName = "Agent Version";

						ADSearchUtil.deviceAttributesDataAdvSearch.push(attributeArray[i]);
						backUpAttributeData.push(attributeArray[i]);
					}
				}
			}
		}
		ADSearchUtil.deviceAttributesDataAdvSearch.sort(function (a, b) { return a.DisplayName > b.DisplayName ? 1 : -1; });
		backUpAttributeData.sort(function (a, b) { return a.DisplayName > b.DisplayName ? 1 : -1; });
		AttributeData(ADSearchUtil.deviceAttributesDataAdvSearch);
	}

	function AdvancedOpenAlertPopup(flage, msg) {
		$("#AdInformationPopup").css('z-index', '999999');
		if (flage == 0) {
			$("#AdInformationPopup").modal("show");
			$("#AdInfoHead").text(i18n.t('success', { lng: lang }));
			$("#AdInfoHead").addClass('c-green');
			$("#AdInfoHead").removeClass('c-blue');
			$("#AdInfoHead").removeClass('c-red');
			$("#AdInfoicon").removeClass('icon-information c-blue');
			$("#AdInfoicon").removeClass('icon-times-circle c-red');
			$("#AdInfoicon").addClass('icon-checkmark c-green');
			$("#AdInfoBtnOk").removeClass('btn-danger');
			$("#AdInfoBtnOk").removeClass('btn-primary');
			$("#AdInfoBtnOk").addClass('btn-success');
			$("#AdInfoMessage").text(i18n.t(msg, { lng: lang }));
		} else if (flage == 1) {
			$("#AdInformationPopup").modal("show");
			$("#AdInfoHead").text(i18n.t('information_title', { lng: lang }));
			$("#AdInfoHead").addClass('c-blue');
			$("#AdInfoHead").removeClass('c-green');
			$("#AdInfoHead").removeClass('c-red');
			$("#AdInfoicon").removeClass('icon-times-circle c-red');
			$("#AdInfoicon").removeClass('icon-checkmark c-green');
			$("#AdInfoicon").addClass('icon-information c-blue');
			$("#AdInfoBtnOk").removeClass('btn-danger');
			$("#AdInfoBtnOk").removeClass('btn-success');
			$("#AdInfoBtnOk").addClass('btn-primary');
			$("#AdInfoMessage").text(i18n.t(msg, { lng: lang }));
		} else if (flage == 2) {
			$("#AdInformationPopup").modal("show");
			$("#AdInfoHead").text(i18n.t('error', { lng: lang }));
			$("#AdInfoHead").addClass('c-red');
			$("#AdInfoHead").removeClass('c-green');
			$("#AdInfoHead").removeClass('c-blue');
			$("#AdInfoicon").removeClass('icon-checkmark c-green');
			$("#AdInfoicon").removeClass('icon-information c-blue');
			$("#AdInfoicon").addClass('icon-times-circle c-red');
			$("#AdInfoBtnOk").removeClass('btn-primary');
			$("#AdInfoBtnOk").removeClass('btn-success');
			$("#AdInfoBtnOk").addClass('btn-danger');
			$("#AdInfoMessage").text(i18n.t(msg, { lng: lang }));
		} else if (flage == 3) {
			$("#AdInformationPopup").modal("show");
			$("#AdInfoHead").text(i18n.t('notification_title', { lng: lang }));
			$("#AdInfoHead").addClass('c-blue');
			$("#AdInfoHead").removeClass('c-green');
			$("#AdInfoHead").removeClass('c-red');
			$("#AdInfoicon").removeClass('icon-times-circle c-red');
			$("#AdInfoicon").removeClass('icon-checkmark c-green');
			$("#AdInfoicon").addClass('icon-information c-blue');
			$("#AdInfoBtnOk").removeClass('btn-danger');
			$("#AdInfoBtnOk").removeClass('btn-success');
			$("#AdInfoBtnOk").addClass('btn-primary');
			$("#AdInfoMessage").text(i18n.t(msg, { lng: lang }));
		}
	}

	function validateIsCommaExistForAppName() {
		var appName = $('#txtAttrValue').val();

		if (appName != "" && appName != undefined) {
			if (validateIsCommaExist(appName)) {
				$("#appNameErrorTip").show();
			} else {
				$("#appNameErrorTip").hide();
			}
		} else {
			$("#appNameErrorTip").hide();
		}
	}

});