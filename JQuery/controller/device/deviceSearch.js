searchIdFromAdd = 0;
isFilterApplied = false;
istemppopup = false;
var isResetApply = false;
var isDefaultSearchApplied = false;
var subStatusData = new Array();

define(["knockout", "autho", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "chosen", "appEnum",], function (ko, autho, ADSearchUtil, koUtil) {

	SelectedIdOnGlobale = new Array();
	columnSortFilterDevice = new Array();
	koUtil.GlobalColumnFilter = new Array();
	var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'SoftwareStatus', 'Alerts', 'ComputedDeviceStatus', 'LastHeartBeat', 'HierarchyFullPath'];
	confirmationFlage = 0;
	var lang = getSysLang();

	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	//care objects
	careData = new Object();			//care session object
	careSearchObject = new Object();	//care search object for GetDevices
	var careModelData = new Object();	//care Device Models object

	return function DeviceSearchdViewModel() {

		var self = this;
		checkloadingforDeviceSearch = 0;

		var config = {
			'.chosen-select': {},
			'.chosen-select-deselect': { allow_single_deselect: true },
			'.chosen-select-no-single': { disable_search_threshold: 10 },
			'.chosen-select-no-results': { no_results_text: 'Oops, nothing found!' },
			'.chosen-select-width': { width: "95%" },
			//'.chosen-results-height': { height: "10%" }
		}
		var SelectedModel = {
			ModelId: '',
			ModelName: ''
		};


		if ($("#idCustomSearch").val() == "")
			$("#deviceCriteriaDiv").hide();

		$("#txtQuickSearchDevice").keydown(function (objEvent) {
			if (objEvent.keyCode == 32) {  //spacebar pressed
				$("#txtQuickSearchDevice").click();
			}
		});

		$("#txtQuickSearchDevice").click(function (e) {
			$("#txtQuickSearchDevice").val('');
		});

		$("#CustomSearchReset").hide();
		var GlobalCustomSearch = {
			ControlType: 0,
			DeviceSearchAttributeId: '',
			DeviceSearchOperatorId: '',
			SearchElementSeqNo: 0,
			SearchId: 0,
			SearchValue: ''
		};
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
		$("#SaveSearchReset").hide();
		$(".chosen-results").css("max-height", "122px");

		////






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
		$('#deleteSearchConfirmationPopup').on('shown.bs.modal', function (e) {
			$('#deleteSearchConfirmationPopup_No').focus();

		});
		$('#deleteSearchConfirmationPopup').keydown(function (e) {
			if ($('#deleteSearchConfirmationPopup_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#deleteSearchConfirmationPopup_Yes').focus();
			}
		});
		$('#activateParameter').on('shown.bs.modal', function (e) {
			$('#activateParameter_NO').focus();

		});
		$('#activateParameter').keydown(function (e) {
			if ($('#activateParameter_NO').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#activateParameter_Yes').focus();
			}
		});

		//focus button when it is open
		//$('#AdInformationPopup').on('shown.bs.modal', function () {
		//    $('#AdInfoBtnOk').focus();
		//})
		$('#AdInformationPopup').on('keyup', function (e) {
			if (e.keyCode == 27 || e.keyCode == 32) {
				self.hideinfo();
			}
		})

		//------------------------------------------------------------------------------------------------------------------------


		var currentDateShort = moment().format(AppConstants.get('SHORT_DATE_FORMAT'));
		var currentDate = moment().format('MM/DD/YYYY');

		self.SearchId = ko.observable(0);
		self.criteriaGroups = ko.observableArray();
		self.deviceSubStatusData = ko.observableArray();

		ADSearchUtil.attributeType = AppConstants.get('DEVICESEARCH');
		self.AttributeData = ko.observableArray();

		self.backupAttributeData = ko.observableArray();

		self.backupAttributeData1 = ko.observableArray();

		self.privateSearch = ko.observableArray();
		self.publicSearch = ko.observableArray();
		self.allSearches = ko.observableArray();
		self.observableHierarchyAd = ko.observable();
		self.oldAttrSelectedVal = ko.observable();

		self.oldSvaeSearch = ko.observable(0);
		//for advance search
		self.AdvanceTemplateFlag = ko.observable(false);
		self.observableCriteria = ko.observable();
		self.observableAdvancedSearchModelPopup = ko.observable();
		loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
		self.flagBlankDeviceGrid = ko.observable(false);
		ADSearchUtil.AdScreenName = 'deviceSearch';
		koUtil.isDeviceProfile(false);

		self.applyForChart = ko.observable();
		self.applyForChart(ADSearchUtil.SearchForChart);

		if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			$("#SearchDDLdiv").css('display', 'inline');
		} else {
			$("#SearchDDLdiv").css('display', 'none');
		}

		self.SearchDataFordelete = ko.observable();

		self.selectionConfirmation = ko.observable();

		self.checkaddAttr = ko.observable(false);

		self.applyForChart = ko.observable();
		self.applyForChart(ADSearchUtil.SearchForChart);
		self.applyForGrid = ko.observable();
		self.applyForGrid(ADSearchUtil.SearchForGrid);
		loadHierarchyAd('modalHierarchy', 'genericPopup');

		self.hierarchyPathStorage = ko.observableArray();
		self.attrbuteCriteriaArr = ko.observableArray();
		self.attrbuteCriteriaArr([]);
		self.backupAttrbuteCriteriaArr = ko.observableArray(ADSearchUtil.backupAttrbuteCriteriaArr);
		if (self.backupAttrbuteCriteriaArr() != null && self.backupAttrbuteCriteriaArr().length > 0 && isFilterApplied) {
			self.attrbuteCriteriaArr(self.backupAttrbuteCriteriaArr());
		}
		if (ADSearchUtil.backupAttrbuteCriteriaArr != null && ADSearchUtil.backupAttrbuteCriteriaArr.length > 0) {
			ADSearchUtil.attributeDataArr = ADSearchUtil.backupAttrbuteCriteriaArr;
		} else {
			ADSearchUtil.attributeDataArr = [];
		}
		self.checkTxtSearchName = ko.observable();

		self.flageForEdit = ko.observable(false);
		self.flageForCopy = ko.observable(false);

		self.hierarchyPathStorage([]);
		ADSearchUtil.HierarchyPathStorage([]);

		var gId = ADSearchUtil.gridIdForAdvanceSearch;
		var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
		if (adStorage) {
			if (adStorage[0].isWithGroup == 1) {
				self.searchCheck = ko.observable(AppConstants.get('GROUPS'));
			} else {
				self.searchCheck = ko.observable(AppConstants.get('HIERARCHY'));
			}
			if (adStorage[0].adSearchObj || adStorage[0].adSearchObj != '') {
				checkloadingforDeviceSearch = 1;
			}
		} else {
			self.searchCheck = ko.observable(AppConstants.get('HIERARCHY'));
		}

		ClearAdSearch = 0;

		self.checkAccessType = ko.observable('Private');
		self.checkAttrValue = ko.observable('');

		self.hierarchyPathStorage = ADSearchUtil.HierarchyPathStorage;
		var popupScreen = '';
		var param = new Object();
		deviceLiteData = new Object();
		var isIncludeConnectedDevices = false;

		////////////////////
		self.checkAccessType.subscribe(function (newValue) {
			if (newValue) {
				if ($("#txtSearchName").val() != '') {
					var checkGroupArr = self.criteriaGroups();
					var checkAttrArr = self.attrbuteCriteriaArr();
					var checkHierarchyArr = self.hierarchyPathStorage();
					if (checkGroupArr.length > 0 || checkAttrArr.length > 0 || checkHierarchyArr.length > 0) {
						$("#btnSave").removeAttr('disabled');
					}

				} else {
					$("#btnSave").prop('disabled', true);
				}

			}
		});



		$('#mdlHierarchyHeader').mouseup(function () {
			$("#hierarchyModelContent").draggable({ disabled: true });
		});

		$('#mdlHierarchyHeader').mousedown(function () {
			$("#hierarchyModelContent").draggable({ disabled: false });
		});

		//Draggable function
		$('#advanceSearchModalHeader').mouseup(function () {
			$("#mdlDeviceSearchContent").draggable({ disabled: true });
		});

		$('#advanceSearchModalHeader').mousedown(function () {
			$("#mdlDeviceSearchContent").draggable({ disabled: false });
		});

		if (isDirectParameterActivation == true) {
			$("#activateParameters").hide();
		} else {
			$("#activateParameters").show();
		}
		//change function of private/public
		self.changeAccessType = function () {
			if ($("#txtSearchName").val().trim() != '') {
				if (self.hierarchyPathStorage().length > 0 || self.attrbuteCriteriaArr().length > 0 || self.criteriaGroups().length > 0) {
					$("#btnSave").removeAttr('disabled');
				}
			}
		}
		self.observableHierarchy = ko.observable();

		//Cancel Hierarchy 
		self.cancelHierarchy = function () {

			ADSearchUtil.AdScreenName = 'deviceSearch';
			loadHierarchyAd('modalHierarchy', 'genericPopup');
			self.observableHierarchy('unloadTemplate');
			$("#hierarchyModel").modal('hide');


			$("#hierarchyModelContent").css('left', '');
			$("#hierarchyModelContent").css('top', '');

		}

		//for advanced serach
		self.expandCriteria = function () {
			if ($("#deviceCriteriaDiv").hasClass('hide')) {
				$("#deviceCriteriaDiv").removeClass('hide');
				$("#expandQuickLinkDiv").empty();
				var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Collapse"><i class="icon-angle-up"></i></a>';
				$("#expandQuickLinkDiv").append(str);
			} else {
				$("#deviceCriteriaDiv").addClass('hide')
				$("#expandQuickLinkDiv").empty();
				var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Expand"><i class="icon-angle-down"></i></a>';
				$("#expandQuickLinkDiv").append(str);
			}
		}

		///new code for expand result pannel after apply ad serach
		self.setAutoGridHeight = function (gridId) {
			var gridheight = $(window).height();
			if (gridheight > 600) {
				gridheight = (gridheight - $("#" + gridId).offset().top) - $(".fixed-footer").height() - 37;
			} else {
				gridheight = '400px';
			}
			$("#" + gridId).jqxGrid({ height: gridheight });
		}
		self.expandCriteriaOfResult = function () {

			if ($("#ResultCriteriaDiv").hasClass('hide')) {

				$("#ResultCriteriaDiv").removeClass('hide');
				$("#resutExpandButtonDiv").empty();
				var str = '<a class="btn btn-default btn-xs" style="padding:1px 5px !important" tabindex="0" role="button"  title="Collapse"><i class="icon-angle-up"></i></a>';
				$("#resutExpandButtonDiv").append(str);
				self.setAutoGridHeight('Devicejqxgrid');
			} else {

				$("#ResultCriteriaDiv").addClass('hide')
				$("#resutExpandButtonDiv").empty();
				var str = '<a class="btn btn-default btn-xs" style="padding:1px 5px !important" tabindex="0" role="button"  title="Expand"><i class="icon-angle-down"></i></a>';
				$("#resutExpandButtonDiv").append(str);
				self.setAutoGridHeight('Devicejqxgrid');
			}

			if ($("#deviceCriteriaDiv").hasClass('hide')) {
				$("#deviceCriteriaDiv").removeClass('hide');
				$("#expandQuickLinkDiv").empty();
				var str = '<a class="btn btn-default btn-xs" style="padding:1px 5px !important" tabindex="0"  role="button"  title="Collapse"><i class="icon-angle-up"></i></a>';
				$("#expandQuickLinkDiv").append(str);
			} else {
				$("#deviceCriteriaDiv").addClass('hide')
				$("#expandQuickLinkDiv").empty();
				var str = '<a class="btn btn-default btn-xs" style="padding:1px 5px !important" tabindex="0"  role="button"  title="Expand"><i class="icon-angle-down"></i></a>';
				$("#expandQuickLinkDiv").append(str);
			}
		}

		///

		self.observableAdvancedSearch = ko.observable();
		self.observableCriteria = ko.observable();

		//loadAdvancesearch('modelAdvancedSearch', 'genericPopup');
		loadCriteria('modalCriteria', 'genericPopup');

		self.unloadAdvancedSearch = function () {
			self.observableAdvancedSearchModelPopup('unloadTemplate');
			$("#AdvanceSearchModal").modal('hide');
			koUtil.isHierarchyModified(false);
			koUtil.isAttributeModified(false);
			ClearAdSearch = 0;
		}

		self.observableModelPopup = ko.observable();
		self.templateFlag = ko.observable(false);
		self.columnlist = ko.observableArray();
		self.gridIdForShowHide = ko.observable();
		self.gridIdForHierarchy = ko.observable();
		//  $("body").addClass("page-sidebar-minified");
		// $(".collapsible").addClass("collapsible-mini");
		$("#sidebar").removeClass("scrolloverflow");

		var modelname = 'unloadTemplate';
		loadelement(modelname, 'genericPopup');
		loadHierarchy(modelname, 'genericPopup');

		//new code Device Search
		globalAdvancedSearch = null;
		ADSearchUtil.deviceSearchObj = null;
		ADSearchUtil.newAddedDataFieldsArr = [];
		ADSearchUtil.newAddedgridColumns = [];
		ADSearchUtil.ExportDynamicColumns = [];
		ADSearchUtil.AdScreenName = 'deviceSearch';

		ADSearchUtil.SearchForChart = false;
		ADSearchUtil.SearchForGrid = true;

		self.applyForGrid(ADSearchUtil.SearchForGrid);
		self.applyForChart(ADSearchUtil.SearchForChart);

		setMenuSelection();

		ADSearchUtil.initColumnsArr = [
			"isSelected", "SerialNumber", "DeviceId", "HierarchyFullPath", "LastBootDateTime",
			"ModelName", "ComputedDeviceStatus", "GroupNames", "LastHeartBeat", "IPAddress",
			"MACAddress", "PartNumber", "VHQVersion", "LocationId", "SoftwareStatus", "Alerts"
		];

		function panelheight(ID, isGrid) {

			var windowheight = $(window).height();
			windowheight = (windowheight - $("#" + ID).offset().top) - $(".fixed-footer").height() - 50;
			var advanceCriteria = $("#advanceCriteria").height();
			if (isGrid == true) {
				$("#" + ID).jqxGrid({ height: windowheight });
			} else {

				$("#hideAdvanceSearchIdPanel").css('height', windowheight);

			}

		}

		modelReposition();
		self.openPopup = function (popupName, gId, status, data) {
			self.templateFlag(true);
			if (popupName == "modelShowHideColUserPreferences") {
				self.gridIdForShowHide(gId);
				if (gId == "blankDevicejqxgrid") {
					for (var i = 0; i < customColumns.length; i++) {
						customColumns[i].IsSelected = false;
					}
					if (selectedColumns.length > 0) {
						for (var j = 0; j < selectedColumns.length; j++) {
							for (var k = 0; k < customColumns.length; k++) {
								if (selectedColumns[j].AttributeName == customColumns[k].AttributeName) {
									customColumns[k].IsSelected = true;
									break;
								}
							}
						}
					}

					self.columnlist(null);
					self.columnlist(genericShowHideColumnUserPreference(gId));

					loadelement(popupName, 'genericPopup');
					$('#deviceModel').modal('show');
				} else {
					getCustomColumns('DeviceSearchFilter', 'modelShowHideColUserPreferences', gId, customColumnsCallback);
				}
			} else if (popupName == "modelAdvancedSearch") {
				self.AdvanceTemplateFlag(true);
				loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
				$('#AdvanceSearchModal').modal('show');
				//getCustomColumns('DeviceSearchFilter', 'modelAdvancedSearch', gId, customColumnsCallback);
			} else if (popupName == "modelExportSucess") {
				loadelement(popupName, 'genericPopup');
				$('#deviceModel').modal('show');
				var GlobalSelectedDeviceIds = getSelectedUniqueId(gId)
				self.gridIdForShowHide(gId);
				if (GlobalSelectedDeviceIds.length > 0) {
					loadelement(popupName, 'device');
					$('#deviceModel').modal('show');
				}
				else {
					openAlertpopup(1, 'no_device_Selected');
				}

			} else if (popupName == "modelDeleteGroupAssignment") {
				var GlobalSelectedDeviceIds = getSelectedUniqueId(gId);
				if (GlobalSelectedDeviceIds.length > 0) {
					loadelement(popupName, 'device');
					$('#deviceModel').modal('show');
				}
				else {
					openAlertpopup(1, 'no_device_Selected');
				}
			} else if (popupName == "modelEditParameterTemplate") {
				var GlobalSelectedDeviceIds = getSelectedUniqueId(gId);
				koUtil.deviceProfileUniqueDeviceId = GlobalSelectedDeviceIds[0];
				var GlobalSelectedDeviceIdsForWarning = getTotalRowcount(gId);
				var countPT = 0;
				var unSelectedIds = getUnSelectedUniqueId(gId);
				var checkAll = checkAllSelected(gId);

				if (checkAll == 1) {
					countPT = unSelectedIds.length > 0 ? (GlobalSelectedDeviceIdsForWarning - unSelectedIds.length) : GlobalSelectedDeviceIdsForWarning;
				} else {
					countPT = (!_.isEmpty(GlobalSelectedDeviceIds)) ? GlobalSelectedDeviceIds.length : 0;
				}

				var deviceEPLimit = parseInt(deviceEditParameterLimit);
				if ((deviceEPLimit != 0) && (countPT > deviceEPLimit)) {
					openAlertpopup(2, 'Device_count_is_more', { DeviceCount: deviceEPLimit });
					return;
				}

				if (checkAll == 1) {
					SelectedItemIds = null;
					UnSelectedItemIds = unSelectedIds;
					popupScreen = 'EditParameters';
					//getProtocolForSelectedDevices(gId);
					temporaryPopUpSpecificFunction(popupScreen);
				} else {
					if (GlobalSelectedDeviceIds.length > 0) {
						SelectedItemIds = GlobalSelectedDeviceIds;
						UnSelectedItemIds = null;
						popupScreen = 'EditParameters';
						//getProtocolForSelectedDevices(gId);
						temporaryPopUpSpecificFunction(popupScreen);
					} else {
						openAlertpopup(1, 'no_device_Selected');
					}
				}

			} else if (popupName == "modelAddGroupAssignment") {
				var GlobalSelectedDeviceIds = getSelectedUniqueId(gId)
				if (GlobalSelectedDeviceIds.length > 0) {
					loadelement(popupName, 'device');
					$('#deviceModel').modal('show');
				}
				else {
					openAlertpopup(1, 'no_device_Selected');
				}
			} else if (popupName == "modelSoftwareAssignment") {
				isFromAddDevice = false;
				var GlobalSelectedDeviceIds = getSelectedUniqueId(gId)

				var GlobalSelectedDeviceIdsForWarning = getTotalRowcount(gId);
				var countSA = 0;
				var unSelectedIds = getUnSelectedUniqueId(gId);
				var checkAll = checkAllSelected(gId);

				if (checkAll == 1) {
					countSA = unSelectedIds.length > 0 ? (GlobalSelectedDeviceIdsForWarning - unSelectedIds.length) : GlobalSelectedDeviceIdsForWarning;
				} else {
					countSA = (!_.isEmpty(GlobalSelectedDeviceIds)) ? GlobalSelectedDeviceIds.length : 0;
				}

				var deviceEPLimit = parseInt(deviceSoftwareAssignmentLimit);
				if ((deviceEPLimit != 0) && (countSA > deviceEPLimit)) {
					openAlertpopup(2, 'Device_count_is_more', { DeviceCount: deviceEPLimit });
					return;
				}
				if (GlobalSelectedDeviceIds.length > 0) {
					popupScreen = 'SoftwareAssignment';
					//getProtocolForSelectedDevices(gId);
					temporaryPopUpSpecificFunction(popupScreen);
				}
				else {
					openAlertpopup(1, 'no_device_Selected');
				}

			} else if (popupName == "modelExportToXML") {
				var selectedIds = getSelectedUniqueId(gId);
				var unSelectedIds = getUnSelectedUniqueId(gId);
				var checkcount = new Array();
				if (checkAllSelected(gId) == 1) {
					checkcount = ["allcheck"];
				} else {
					checkcount = selectedIds;
				}
				var GlobalSelectedDeviceIds = getSelectedUniqueId(gId)
				self.gridIdForShowHide(gId);

				//if (checkcount.length > 0) {
				//    loadelement(popupName, 'device');
				//    $('#deviceModel').modal('show');
				//}
				//else {
				//    openAlertpopup(1, 'no_device_Selected');
				//}

				loadelement(popupName, 'device');
				$('#deviceModel').modal('show');

			} else if (popupName == "modelExportToRSACert") {
				var selectedIds = getSelectedUniqueId(gId);
				var unSelectedIds = getUnSelectedUniqueId(gId);
				var checkcount = new Array();
				if (checkAllSelected(gId) == 1) {
					checkcount = ["allcheck"];
				} else {
					checkcount = selectedIds;
				}
				var GlobalSelectedDeviceIds = getSelectedUniqueId(gId)
				self.gridIdForShowHide(gId);

				loadelement(popupName, 'device');
				$('#deviceModel').modal('show');

			} else if (popupName == "modelDownloadSettings") {
				var selectedIds = getSelectedUniqueId(gId);
				var unSelectedIds = getUnSelectedUniqueId(gId);
				var checkcount = new Array();
				if (checkAllSelected(gId) == 1) {
					checkcount = ["allcheck"];
				} else {
					checkcount = selectedIds;
				}
				var GlobalSelectedDeviceIds = getSelectedUniqueId(gId)
				self.gridIdForShowHide(gId);
				if (checkcount.length > 0) {
					popupScreen = "DownloadSettings";
					getProtocolForSelectedDevices(gId);
				}
				else {
					openAlertpopup(1, 'no_device_Selected');
				}


			} else if (popupName == 'modelDeleteAndBlacklist') {
				var selecteItemIds = getSelectedUniqueId(gId);
				var checkAll = checkAllSelected(gId);

				if (checkAll == 1) {
					loadelement(popupName, 'device');
					$('#deviceModel').modal('show');
					getSelectedDeviceList(gId, status);

				} else {
					if (selecteItemIds.length > 0) {
						loadelement(popupName, 'device');
						$('#deviceModel').modal('show');
						getSelectedDeviceList(gId, status);
					} else if (selecteItemIds.length == 0) {
						openAlertpopup(1, 'please_select_device');
						return;
					}
				}
			} else if (popupName == 'modelDeviceStatus') {
				self.gridIdForShowHide(gId);
				var selecteItemIds = getSelectedUniqueId(gId);
				popupScreen = "DeviceStatus";
				var checkAll = checkAllSelected(gId);
				if (checkAll == 1) {
					updateDeviceSearchStatus(gId, status, data);
				} else {
					if (selecteItemIds.length == 1 || selecteItemIds.length > 1) {
						updateDeviceSearchStatus(gId, status, data);
					}
					else if (selecteItemIds.length == 0) {
						openAlertpopup(1, 'please_select_device');
						return;
					}
				}
			} else if (popupName == "modalHierarchy") {
				self.gridIdForShowHide(gId);

				var selectedDevices = 0;
				var checkAll = checkAllSelected(gId);
				var selectedIds = getSelectedUniqueId('Devicejqxgrid');
				var unSelectedIds = getUnSelectedUniqueId(gId);
				var totalDevices = getTotalRowcount(gId);

				if (checkAll == 1) {
					selectedDevices = (!_.isEmpty(unSelectedIds) && unSelectedIds.length > 0) ? (totalDevices - unSelectedIds.length) : totalDevices;
				} else {
					selectedDevices = (!_.isEmpty(selectedIds) && selectedIds.length > 0) ? selectedIds.length : 0;
				}

				if ((parseInt(deviceMoveLimit) > 0) && (selectedDevices > (parseInt(deviceMoveLimit)))) {
					openAlertpopup(2, 'Device_count_is_more', { DeviceCount: deviceMoveLimit });
					return;
				}
				if (selectedDevices > 0) {
					self.observableHierarchyAd('unloadTemplate');
					ADSearchUtil.AdScreenName = 'editHierarchy';
					loadHierarchy('modalHierarchy', 'genericPopup');
					$('#hierarchyModel').modal('show');
				} else {
					openAlertpopup(1, 'no_device_Selected');
				}
			} else if (popupName === "modalCloneDevice") {
				self.gridIdForShowHide(gId);
				var selectedItemIds = getSelectedUniqueId(gId);
				var unSelecteItemIds = getUnSelectedUniqueId(gId);
				var checkAll = checkAllSelected(gId);
				var totalDevices = getTotalRowcount(gId);

				if (checkAll == 1) {
					if (!_.isEmpty(unSelecteItemIds) && unSelecteItemIds.length == totalDevices - 1) {
						loadelement(popupName, 'device');
						$('#deviceModel').modal('show');
					} else {
						openAlertpopup(1, 'clone_single_device');
					}
				} else {
					if (!_.isEmpty(selectedItemIds) && selectedItemIds.length === 1) {
						loadelement(popupName, 'device');
						$('#deviceModel').modal('show');
					} else if (!_.isEmpty(selectedItemIds) && selectedItemIds.length === 0) {
						openAlertpopup(1, 'please_select_a_group');
					} else if (!_.isEmpty(selectedItemIds) && selectedItemIds.length > 1) {
						openAlertpopup(1, 'clone_single_device');
					}
				}
			} else {
				loadelement(popupName, 'device');
				$('#deviceModel').modal('show');
			}
		};

		function getDeviceAttributesCallback() {
			getCustomColumns('DeviceSearchFilter', 'deviceSearch', 'blankDevicejqxgrid', customColumnsCallback);
		}

		function customColumnsCallback(data, popupName, gId) {
			if (data.getCustomizableHeaderResp) {
				data.getCustomizableHeaderResp = $.parseJSON(data.getCustomizableHeaderResp);
				var columnsSource = _.where(data.getCustomizableHeaderResp.CustomizableColumns, { IsCustomAttribute: false });
				customColumns = columnsSource;
				var customFields = data.getCustomizableHeaderResp.CustomFieldConfiguration;

				for (var i = 0; i < customFields.length; i++) {
					for (var j = 0; j < customColumns.length; j++) {
						if (customColumns[j].AttributeName.indexOf('CustomField') > -1) {
							customColumns[j].DisplayName = customFields[i].ConfigValue;
							customColumns[j + 1].DisplayName = customFields[i + 1].ConfigValue;
							customColumns[j + 2].DisplayName = customFields[i + 2].ConfigValue;
							customColumns[j + 3].DisplayName = customFields[i + 3].ConfigValue;
							customColumns[j + 4].DisplayName = customFields[i + 4].ConfigValue;
							break;
						}
					}
					break;
				}

				selectedColumns = new Array();
				ADSearchUtil.userPreferenceColumns([]);
				for (var k = 0; k < customColumns.length; k++) {
					if (customColumns[k].IsSelected == true) {
						selectedColumns.push(customColumns[k]);
						ADSearchUtil.userPreferenceColumns.push(customColumns[k]);
					}
				}
				selectedColumnsClone = selectedColumns;

				if (popupName == 'modelAdvancedSearch') {
					self.AdvanceTemplateFlag(true);
					loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
					$('#AdvanceSearchModal').modal('show');
				} else if (popupName == 'modelShowHideColUserPreferences') {
					self.columnlist(null);
					self.columnlist(genericShowHideColumnUserPreference(gId));

					loadelement(popupName, 'genericPopup');
					$('#deviceModel').modal('show');
				} else if (popupName == 'deviceSearch') {
					getSearchObject(self.hierarchyPathStorage, self.attrbuteCriteriaArr, self.criteriaGroups);
					setDeviceSearchAttributes('Devicejqxgrid', self.AttributeData, ADSearchUtil.attributeType, self.backupAttributeData, self.backupAttributeData1);
					blankDeviceGrid('blankDevicejqxgrid', param, self.hierarchyPathStorage, self.attrbuteCriteriaArr, self.criteriaGroups, self.observableAdvancedSearchModelPopup, self.flagBlankDeviceGrid, self.multiselctedModels, self.multiselctedDeviceStatus, self.multiselctedSubStatus, self.multiSelectedModeOfConnectivity, self.multiSelectedVTPEncryptionStatus, self.AdvanceTemplateFlag, self.deviceSubStatusData, self.multiSelectedAutoDownloadEnbaled, careSearchObject, self.multiSelectedSoftwareAssignmentType);
				}
			}
		}

		self.onClickInactiveStatus = function () {
			var gId = 'Devicejqxgrid';
			if (self.deviceSubStatusData().length == 0) {
				var selecteItemIds = getSelectedUniqueId(gId);
				popupScreen = "DeviceStatus";
				var checkAll = checkAllSelected(gId);
				if (checkAll == 1) {
					updateDeviceSearchStatus(gId, "2", null);
				} else {
					if (selecteItemIds.length == 1 || selecteItemIds.length > 1) {
						updateDeviceSearchStatus(gId, "2", null);
					}
					else if (selecteItemIds.length == 0) {
						openAlertpopup(1, 'please_select_device');
						return;
					}
				}
			}

		}
		function updateDeviceSearchStatus(gId, status, data) {
			var arr = new Array();
			selectedArr = getMultiSelectedData(gId);
			for (var i = 0; i < selectedArr.length; i++) {
				var DeviceStatusUpdate = new Object();
				DeviceStatusUpdate.Status = status;
				DeviceStatusUpdate.ComputedDeviceStatus = selectedArr[i].ComputedDeviceStatus;
				arr.push(DeviceStatusUpdate);
				globalVariableForDeviceSearchStatus = arr;
			}

			popUpModelDeviceStatus(gId, status, data);

		}

		function popUpModelDeviceStatus(gId, status, data) {

			var selectedDevicesCount = getAllSelectedDataCount('Devicejqxgrid');
			var arr = getMultiSelectedData(gId);
			var computedDeviceStatus = arr[0].ComputedDeviceStatus;
			popupName = 'modelDeviceStatus';

			if (selectedDevicesCount == 1) {
				if (status == "1") {
					if (computedDeviceStatus == "Active") {
						openAlertpopup(1, 'Selected Device is already an Active Device.');
					} else if (computedDeviceStatus == "Pending Registration") {
						openAlertpopup(1, 'cannot_change_device_status_from_pending_registartion');
					} else {
						loadelement(popupName, 'device');
						$("#countMsgId").text(i18n.t('change_device_status_to_active', { lng: lang }));
						$('#deviceModel').modal('show');
					}
				} else if (status == "2") {
					var arr = new Array();
					var selectedArr = getMultiSelectedData(gId);
					subStatusData = self.deviceSubStatusData();

					if (self.deviceSubStatusData().length == 0) {
						//deviceSubStatusData = data.getDeviceSubStatusResp.DeviceSubStatus;
						//  $("#statusDropdown").removettr("href", "");
						if (computedDeviceStatus == "Inactive") {
							openAlertpopup(1, 'Selected Device is already in Inactive State.');
						} else if (computedDeviceStatus == "Active") {
							//self.unloadTempPopup('unloadTemplate')
							self.templateFlag(true)
							loadelement(popupName, 'device');
							$('#deviceModel').modal('show');
						} else if (computedDeviceStatus == "Pending Registration") {
							openAlertpopup(1, 'cannot_change_device_status_from_pending_registartion');
						} else {
							loadelement(popupName, 'device');
							$('#deviceModel').modal('show');
						}
					} else {
						//   $("#statusDropdown").prop("href", "#inactiveCollapse");
						var dataId = data.SubStatus;
						var deviceSubStatusName = selectedArr[0].SubStatus;
						var source = _.where(selectedArr, { "SubStatus": dataId });

						koUtil.globalSubStatus = data ? data.SubStatus : '';
						koUtil.globalSubStatusId = data ? data.SubStatusId : 0;
						if (computedDeviceStatus == "Inactive" && data.SubStatus == "--No-Sub-Status--" && deviceSubStatusName == '') {
							openAlertpopup(1, 'Selected Device is already in Inactive State.');
						} else if (computedDeviceStatus == "Inactive" && data.SubStatus == deviceSubStatusName) {
							openAlertpopup(1, i18n.t('device_already_in_inactive_substatus_state', { deviceSubStatusName: deviceSubStatusName }, { lng: lang }));
							return;
						} else if (computedDeviceStatus == "Pending Registration") {
							openAlertpopup(1, 'cannot_change_device_status_from_pending_registartion');
						} else {
							loadelement(popupName, 'device');
							$('#deviceModel').modal('show');
						}
					}
				} else if (status == "3") {
					if (computedDeviceStatus == "Pending Registration") {
						openAlertpopup(1, 'Selected Device is already in Pending Registration State.');
					}
					else {
						//getProtocolForSelectedDevices(gId);
						temporaryPopUpSpecificFunction(popupScreen);
					}
				}
			} else {
				if (status == 3) {
					//getProtocolForSelectedDevices(gId);
					temporaryPopUpSpecificFunction(popupScreen);
				} else {
					koUtil.globalSubStatus = data ? data.SubStatus : '';
					koUtil.globalSubStatusId = data ? data.SubStatusId : 0;
					loadelement(popupName, 'device');
					$("#countMsgId").text(i18n.t('change_device_status_for_multiple_devices', { lng: lang }));
					$('#deviceModel').modal('show');
				}
			}

		}

		//unload hierarchy popup Edit Hierarchy
		self.unloadHierarchy = function () {
			self.observableHierarchy('unloadTemplate');
		}

		function loadHierarchyAd(elementname, controllerId) {

			if (!ko.components.isRegistered(elementname)) {
				//new template code
				var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
				var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
				ko.components.register(elementname, {
					viewModel: { require: ViewName },
					template: { require: 'plugin/text!' + htmlName }
				});
			}
			self.observableHierarchyAd(elementname);
		}

		self.unloadTempPopup = function (popupName) {
			self.observableModelPopup('unloadTemplate');
			$("#deviceModel").modal('hide');
			koUtil.isFromAddDeviceforDirect(false);
			$("#mainPageBody").removeClass('modal-open-appendon');
			checkIsPopUpOPen();
		};
		//For Clear Filter
		self.clearfilterforGroup = function (gId) {

			self.criteriaGroups([]);
			$('span').removeClass('jqx-checkbox-check-checked');
			gridFilterClear(gId);
			$(".UItxtfilterclass").val("");

		}
		///////////////////////////Edit Hierarchy/////////////////////////
		self.blankgridDescription = function (gridId) {
			var localizationObj = {};
			localizationObj.emptydatastring = i18n.t(" ", { lng: lang });
			$("#" + gridId).jqxGrid('localizestrings', localizationObj);
			setTimeout(function () {
				var localizationObj = {};
				localizationObj.emptydatastring = i18n.t("no_default_data_for_deviceSearch", { lng: lang });
				$("#" + gridId).jqxGrid('localizestrings', localizationObj);
			}, 1000);
		}

		self.resizeColumns = function (gId) {
			$("#modalResizeResetColumnsConfirmation").modal('show');
			$("#resizeResetColumnsConfirmationMessage").text(i18n.t('save_resized_columns_confirmation', { lng: lang }));

			globalGridColumns = new Object();
			globalGridColumns.gId = gId;
			globalGridColumns.gridName = 'DeviceSearch';
			globalGridColumns.isColumnResized = true;
			globalGridColumns.gridColumns = ADSearchUtil.initColumnsArr;
		}

		self.resetColumns = function (gId) {
			$("#modalResizeResetColumnsConfirmation").modal('show');
			$("#resizeResetColumnsConfirmationMessage").text(i18n.t('reset_resized_columns_confirmation', { lng: lang }));

			globalGridColumns = new Object();
			globalGridColumns.gId = gId;
			globalGridColumns.gridName = 'DeviceSearch';
			globalGridColumns.isColumnResized = false;
			globalGridColumns.gridColumns = [];
		}

		self.clearfilter = function (gridId) {
			gridFilterClear(gridId);
			$(".panel-side-pop").hide();

			if ($("#idCustomSearch").val() != "") {
				var isCustomSearchCriteria = sessionStorage.getItem('CustomSearchCriteria');

				if (isCustomSearchCriteria)
					$("#deviceCriteriaDiv").empty().show().html(isCustomSearchCriteria);
			}

			if (isDeviceSearchWithAdvanceSearch == false) {
				self.blankgridDescription(gridId);
			}
		}
		self.refreshGrid = function (gId) {
			gridRefresh(gId);

			if ($("#idCustomSearch").val() != "") {
				var isCustomSearchCriteria = sessionStorage.getItem('CustomSearchCriteria');

				if (isCustomSearchCriteria)
					$("#deviceCriteriaDiv").empty().show().html(isCustomSearchCriteria);
			}
			if (isDeviceSearchWithAdvanceSearch == false) {
				self.blankgridDescription(gId);
			}

			function fnHeaderCheck() {
				//$("#" + gId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-checked');
			}
			try {
				var datainformations = $("#" + gId).jqxGrid("getdatainformation");
				var gStorage = $.parseJSON(window.sessionStorage.getItem(gId + 'gridStorage'));

				if (gStorage[0].counter > 0) {
					if (datainformations.rowscount == gStorage[0].counter)
						setTimeout(fnHeaderCheck, 1000);
				}
			}
			catch (err) { }

		}

		// clear filter for Save search
		self.clearfilterforSaveSearch = function (gID) {
			self.applyAdvanceFilterLocal();
			$("#SaveSearchReset").hide();
			$("#txtQuickSearchDevice").val('');
			$("#allSearchUL").each(function () {
				$(this).children('li').css("background-color", "");

			});
			$("#advanceCriteria").addClass("quickCriHide");
			$("#deviceCriteriaDiv").css("display", "none");

			self.hierarchyPathStorage([]);
			ADSearchUtil.attributeDataArr = [];
			self.attrbuteCriteriaArr([]);
			self.criteriaGroups([]);
		}

		// clear filter for custom search

		self.clearfilterforCustomSearch = function (gridId) {
			self.applyAdvanceFilterLocal();
			$("#deviceCriteriaDiv").empty();
			$("#idCustomSearch").val('');
			$("#CustomSearchReset").hide();
			$("#advanceCriteria").hide();
			sessionStorage.removeItem('CustomSearchCriteria');
			sessionStorage.removeItem('CustomSearchText');
			sessionStorage.removeItem('GlobalCustomSearch');

			self.hierarchyPathStorage([]);
			ADSearchUtil.attributeDataArr = [];
			self.attrbuteCriteriaArr([]);
			self.criteriaGroups([]);
		}

		self.activateParameterPopup = function () {
			$('#activateParameter').modal('show');
			$("#activateParameterText").text(i18n.t('activate_parameters_confirmation_DeviceSearch', { lng: lang }));
			$("#activateParameterTextNext").text(i18n.t('activate_parameters_confirmation_DeviceSearch_next', { lng: lang }));
		}

		self.activateParameter = function (gId) {
			$('#activateParameter').modal('hide');
			var insertActivationQueueReq = new Object();
			var Selector = new Object();

			var selectedDeviceSearchItems = getSelectedUniqueId(gId);
			var unselectedDeviceSearchItems = getUnSelectedUniqueId(gId);
			var checkAll = checkAllSelected(gId);

			if (checkAll == 1) {
				insertActivationQueueReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
				Selector.SelectedItemIds = null;
				Selector.UnSelectedItemIds = unselectedDeviceSearchItems;
			} else {
				insertActivationQueueReq.DeviceSearch = null;
				Selector.SelectedItemIds = selectedDeviceSearchItems;
				Selector.UnSelectedItemIds = null;
			}

			insertActivationQueueReq.Selector = Selector;

			insertActivationQueueReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						gridFilterClear(gId);
						$('#activateParameter').modal('hide');
						openAlertpopup(0, 'activate_parameters_success');
					} else if (data.responseStatus.StatusCode == AppConstants.get('EX_POPULATION_IS_INPROGRESS')) {
						openAlertpopup(1, 'parameter_population_in_progress');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_NO_PARAMETERS_ACTIVATED')) {
						openAlertpopup(2, 'e_no_parameters_activated');
					}
				}
			}

			var method = 'InsertActivationQueue';
			var params = '{"token":"' + TOKEN() + '","insertActivationQueueReq":' + JSON.stringify(insertActivationQueueReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		//////////////////////////////////////////////////End of Activate Parameter/////////////////////////////////////////////

		self.updateDevice = function (status, gId) {
			var selectedIds = getSelectedUniqueId(gId);
			var unSelectedIds = getUnSelectedUniqueId(gId);
			var updateDeviceReq = new Object();
			var Selector = new Object();
			var Device = new Object();
			Device.Status = status;
			var checkcount = new Array();
			if (checkAllSelected(gId) == 1) {

				Selector.SelectedItemIds = null;
				Selector.UnSelectedItemIds = unSelectedIds;
				checkcount = ["allcheck"];
				updateDeviceReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
			} else {

				Selector.SelectedItemIds = selectedIds;
				Selector.UnSelectedItemIds = null;
				checkcount = selectedIds;
				updateDeviceReq.DeviceSearch = null;
			}
			if (checkcount.length > 0) {
				updateDeviceReq.Device = Device;
				updateDeviceReq.Selector = Selector;
				UpdateDevice(status, updateDeviceReq, gId);
			} else {
				openAlertpopup(1, 'no_device_Selected');
			}

		}

		self.UpdateDeviceStatus = function (status, gId) {

			var updateDeviceStatusReq = new Object();
			var Selector = new Object();
			var DeviceList = new Object();
			var selectedIds = getSelectedUniqueId(gId);
			var unSelectedItemIds = getUnSelectedUniqueId(gId);
			var checkcount = new Array()
			if (checkAllSelected(gId) == 1) {
				Selector.SelectedItemIds = null;
				Selector.UnSelectedItemIds = unSelectedItemIds;
				checkcount = [""];
			} else {
				Selector.SelectedItemIds = selectedIds;
				Selector.UnSelectedItemIds = null;
				checkcount = selectedIds;
				updateDeviceStatusReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
			}

			if (checkcount.length > 0) {
				updateDeviceStatusReq.DeviceList = getSelectedDeviceList(gId, status);
				updateDeviceStatusReq.IsContinue = false;
				updateDeviceStatusReq.Status = status;
				updateDeviceStatusReq.UnSelectedItemIds = unSelectedItemIds;

				UpdateDeviceStatus(status, updateDeviceStatusReq, gId);


			} else {


				openAlertpopup(1, 'no_device_Selected');
			}
		}
		self.ExportDevices = function (gId) {
			var exportDevicesReq = new Object();
			var Selector = new Object();
			var SchedulePackages = new Array();
			var Export = new Object();

			Export.IsExport = true;
			Export.DynamicColumns = null;
			var selectedIds = getSelectedUniqueId(gId);
			var unSelectedItemIds = getUnSelectedUniqueId(gId);
			var checkcount = new Array()
			if (checkAllSelected(gId) == 1) {
				Selector.SelectedItemIds = null;
				Selector.UnSelectedItemIds = unSelectedItemIds;
				Export.IsAllSelected = true;
				checkcount = [""];
			} else {
				Selector.SelectedItemIds = selectedIds;
				Selector.UnSelectedItemIds = null;
				Export.IsAllSelected = false;
				checkcount = selectedIds;
			}

			Selector.ContinueDeletion = false;
			exportDevicesReq.ColumnSortFilter = null;
			exportDevicesReq.DeviceSearch = null;
			exportDevicesReq.Export = Export;
			exportDevicesReq.Selector = Selector;
			setExportDevices(exportDevicesReq);
		}
		//ExportToExcel 
		self.exportToExcel = function (isExport, gId) {
			var selectedDevices = getSelectedUniqueId(gId);
			var unselectedDevices = getUnSelectedUniqueId(gId);
			var checkall = checkAllSelected(gId);
			visibleColumnsList = GetExportVisibleColumn(gId);
			var param = getDeviceforExport(true, koUtil.GlobalColumnFilter, selectedDevices, unselectedDevices, checkall, visibleColumnsList, careSearchObject);
			self.exportGridId = ko.observable(gId);
			var datainfo = $("#" + gId).jqxGrid('getdatainformation');
			if (datainfo.rowscount > 0) {
				deviceExport(param, gId, self.openPopup);
			} else {
				openAlertpopup(1, 'no_data_to_export');
			}
		}

		self.exportToExcelForADGroup = function (gId) {
			//$("#" + gId).jqxGrid('exportdata', 'csv', 'ADSearchGroups');
			$("#loadingDiv").show();
			$("#" + gId).jqxGrid('exportdata', 'csv', AppConstants.get('GROUPS'), true, null, false, AppConstants.get('PHP_SERVER_URL') + 'JqxGrid/dataexport.php');
			openAlertpopup(1, 'export_Information');
			$("#loadingDiv").hide();
		}

		self.resetADSearch = function () {
			$('#advanceCriteria').css('display', 'none');
			careData = new Object();
			careSearchObject = new Object();
			globalAdvancedSearch = new Object();
			ADSearchUtil.deviceSearchObj = new Object();
			self.hierarchyPathStorage([]);
			ADSearchUtil.attributeDataArr = [];
			self.attrbuteCriteriaArr([]);
			self.criteriaGroups([]);
			ADSearchUtil.resetAddSerchFlag = 'reset';
			koUtil.isHierarchyModified(false);
			koUtil.isAttributeModified(false);
			koUtil.savedSearchId = 0;
			isAdvancedSavedSearchApplied = false;
			isSearchReset = true;
			var gId = ADSearchUtil.gridIdForAdvanceSearch;
			var gridheight = $(window).height();
			if (gridheight > 600) {
				gridheight = (gridheight - $("#" + gId).offset().top) - $(".fixed-footer").height() - 37;
			} else {
				gridheight = '400px';
			}
			$("#" + gId).jqxGrid({ height: gridheight });
			sessionStorage.removeItem("CustomSearchText");
			sessionStorage.removeItem("customSearchStore");
			isReset = true;
			sessionStorage.removeItem(gId + 'customSearch');
			sessionStorage.removeItem(gId + 'CustomSearchText');
			sessionStorage.removeItem(gId + 'CustomSearchCriteria');
			var DeviceSearch = new Object();
			DeviceSearch.SelectedHeaders = selectedColumnsClone;
			updateAdSearchObj(gId, DeviceSearch, 2);
			self.observableAdvancedSearchModelPopup('unloadTemplate');
			self.clearfilter('Devicejqxgrid');
		}

		function deviceExport(param, gId, openPopup) {
			var callbackFunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(1, 'export_Sucess');
					}
				}
			}
			var params = JSON.stringify(param);
			ajaxJsonCall('ExportDevices', params, callbackFunction, true, 'POST', true);
		}

		self.ScheduleAction = function (check, gID) {
			koUtil.isFromDeviceProfile = false;
			globalVariableForDownloadSchedule = getSelectedUniqueId(gID);
			globalVariableForunselectedItems = getUnSelectedUniqueId(gID);
			checkAllForSchedule = checkAllSelected(gID);
			sessionStorage.removeItem("CustomSearchText");
			sessionStorage.removeItem("customSearchStore");
			if (globalVariableForDownloadSchedule.length > 0) {
				isFromDeviceSearch = true;
				isAdvancedSavedSearchApplied = false;
				isSearchReset = false;
				$("#deviceSearch").removeClass('active');
				if (check == 0) {
					//getProtocolForSelectedDevices(gID);
					isFromDownloadLibrary = false;
					isFromContentLibrary = false;
					popupScreen = 'ScheduleDownload';
					temporaryPopUpSpecificFunction(popupScreen);
				} else if (check == 1) {
					//getProtocolForSelectedDevices(gID);
					isFromDownloadLibrary = false;
					isFromContentLibrary = false;
					popupScreen = 'ScheduleContent';
					temporaryPopUpSpecificFunction(popupScreen);
				} else if (check == 2) {
					//getProtocolForSelectedDevices(gID);
					popupScreen = 'ScheduleDiagnostics';
					temporaryPopUpSpecificFunction(popupScreen);
				}
			} else {
				openAlertpopup(1, 'no_device_Selected');
			}
		}

		self.ScheduleJob = function () {
			istemppopup = false;
			$("#scheduleContentConfirmation").modal('hide');
			if (popupScreen == "ScheduleDownload") {
				scheduleOption = "scheduleDownload";
				redirectToLocation(menuJsonData, 'scheduleDownload');
			}
			else if (popupScreen == "ScheduleContent") {
				scheduleOption = "scheduleContent";
				redirectToLocation(menuJsonData, 'scheduleDelivery');
			}
			else if (popupScreen == "ScheduleDiagnostics") {
				scheduleOption = "scheduleAction";
				redirectToLocation(menuJsonData, 'scheduleActions');
			}
		}

		self.scheduleContent = function () {
			if (istemppopup) {
				koUtil.isFromScheduleScreen = 0;
				setscheduleAdstorageFromDeviceSearch('jqxgridForSelectedDevicesmanageContents', globalVariableForDownloadSchedule, globalVariableForunselectedItems);
			}
			scheduleOption = "scheduleContent";
			redirectToLocation(menuJsonData, 'scheduleDelivery');
		}

		self.cancelReset = function () {
			istemppopup = false;
			$("#scheduleContentConfirmation").modal('hide');
		}

		function loadAdvancesearch(elementname, controllerId) {

			if (!ko.components.isRegistered(elementname)) {
				//new template code
				var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
				var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
				ko.components.register(elementname, {
					viewModel: { require: ViewName },
					template: { require: 'plugin/text!' + htmlName }
				});
			}
			self.observableAdvancedSearch(elementname);
		}


		function loadCriteria(elementname, controllerId) {

			if (!ko.components.isRegistered(elementname)) {
				//new template code
				var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
				var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
				ko.components.register(elementname, {
					viewModel: { require: ViewName },
					template: { require: 'plugin/text!' + htmlName }
				});
			}
			self.observableCriteria(elementname);
		}
		function loadelement(elementname, controllerId) {

			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopup(elementname);
		}
		function loadAdvancedSearchModelPopup(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				//new template code
				var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
				var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
				ko.components.register(elementname, {
					viewModel: { require: ViewName },
					template: { require: 'plugin/text!' + htmlName }
				});
			}
			self.observableAdvancedSearchModelPopup(elementname);
		}

		//---confirmation popup on Edit hierarchy------
		self.refreshEditHierarchy = function (observableHierarchy) {
			$('#hierarchyModel').modal('hide');
			$("#updateDeviceId").modal('hide');
			gridFilterClear('Devicejqxgrid');
			observableHierarchy('unloadTemplate');
		}

		//----cancel confirmation popup on edit hierarchy----
		self.cancelEditHierarchyPopUp = function () {
			$("#updateDeviceId").modal('hide');
		}

		//-----FOCUS ON CONFO POP UP ON EDIT HIERARCHY------
		$('#updateDeviceId').on('shown.bs.modal', function (e) {
			$('#updateDevice_ConfoNo').focus();

		});
		$('#updateDeviceId').keydown(function (e) {
			if ($('#updateDevice_ConfoNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#updateDevice_ConfoYes').focus();
			}
		});
		//------End--------

		self.expandButtonList = function (gridId) {
			//gridRefresh(gridId);
			//$(".panel-two").toggleClass("panel-two-c");
			//$(".panel-one").toggleClass("panel-one-c");
			//gridFilterClear(gridId);
			//$("#" + gridId).jqxGrid('clearselection');
			//$("#" + gridId).jqxGrid('updatebounddata');

			$(".panel-side-pop").hide();
		};



		////adserach new code

		self.checkTxtSearchName.subscribe(function (newValue) {
			var checkGroupArr = self.criteriaGroups();
			var checkHierarchyArr = self.hierarchyPathStorage();
			var checkAttrArr = self.attrbuteCriteriaArr();

			if (self.checkTxtSearchName().trim() != '') {
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
			} else {
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

		$("#hierarchyDiv").show();
		$("#GroupDiv").hide();

		//self.showHierarchy = function () {
		//    if (self.criteriaGroups().length > 0) {
		//        self.selectionConfirmation(i18n.t('Confirm_Messgae_From_Group_to_Hierarchy', { lng: lang }));
		//        $("#advancedSearchConfirmationPopup").modal('show');
		//    } else {
		//        self.searchCheck(AppConstants.get('HIERARCHY'));
		//        self.criteriaGroups([]);
		//        loadHierarchyAd('modalHierarchy', 'genericPopup');
		//        $("#hierarchyDiv").show();
		//        $("#GroupDiv").hide();
		//    }
		//    return true;
		//}

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

		if (adStorage) {
			if (adStorage[0].isWithGroup == 1) {
				//self.showGroups();
			}
		}

		self.removeHierarchyPathFromCriteriaSearch = function (data, flag) {

			ADSearchUtil.checkexistParent = jQuery.grep(ADSearchUtil.checkexistParent, function (value) {
				return (value != data.HierarchyId && value != null);
			});

			var source = _.where(self.hierarchyPathStorage(), { HierarchyFullPath: data.HierarchyFullPath });

			self.hierarchyPathStorage.remove(source[0]);
			if (flag == 1) {
				if (self.hierarchyPathStorage().length == 0 && self.attrbuteCriteriaArr().length == 0 && self.criteriaGroups().length == 0) {
					$("#A1").hide();
				}
				self.applyAdvanceFilterLocal();
			} else {
				self.validateAdStorage(2)
			}
			$(".panel-side-pop").hide();
			$("#attrDllDiv").css('width', "280px");
			self.observableAdvancedSearchModelPopup('unloadTemplate');
		}


		self.DeviceSearchAttributeOperators = ko.observableArray();
		self.monoOperator = ko.observable();
		self.multiComboData = ko.observableArray();
		self.comboData = ko.observableArray();

		self.comboType = ko.observable(false);
		self.multiComboType = ko.observable(false);
		self.dateType = ko.observable(false);
		self.textType = ko.observable(false);
		self.applicationType = ko.observable(false);

		self.ismodel = ko.observable(false);
		self.isdeviceStatus = ko.observable(false);
		self.issubStatus = ko.observable(false);
		self.isModeOfConnectivity = ko.observable(false);
		self.isSoftwareAssignmentType = ko.observable(false);
		self.isVTPEncryptionStatus = ko.observable(false);
		self.isAutoDownloadEnabledStatus = ko.observable(false);


		self.showTodatetxt = ko.observable(true);
		//if (ADSearchUtil.backupAttrbuteCriteriaArr != null && ADSearchUtil.backupAttrbuteCriteriaArr.length > 0) {
		//    ADSearchUtil.attributeDataArr = ADSearchUtil.backupAttrbuteCriteriaArr;
		//} else {
		//    ADSearchUtil.attributeDataArr = [];
		//}
		self.items = ko.observableArray();
		self.selectedOption = ko.observable();
		self.selectedOperator = ko.observable();

		self.checkoperator = ko.observable(false);

		self.multiselctedModels = ko.observableArray();
		self.multiselctedDeviceStatus = ko.observableArray();
		self.multiselctedSubStatus = ko.observableArray();
		self.multiSelectedModeOfConnectivity = ko.observableArray();
		self.multiSelectedSoftwareAssignmentType = ko.observableArray();
		self.multiSelectedAutoDownloadEnbaled = ko.observableArray();
		self.multiSelectedVTPEncryptionStatus = ko.observableArray();
		self.attributeValue = ko.observable();
		self.attributeVersion = ko.observable();
		//--------------------------------- Custom Search Start ------------------------------------------------------------------
		var isCustomSearchCriteria = sessionStorage.getItem('CustomSearchCriteria');
		var customSearchText = sessionStorage.getItem('CustomSearchText');

		var CustomAttributeData = new Array();
		if (deviceAttributesDataCustomSearch && deviceAttributesDataCustomSearch.length != undefined) {
			for (var i = 0; i < deviceAttributesDataCustomSearch.length; i++) {
				CustomAttributeData.push(deviceAttributesDataCustomSearch[i].AttributeName);
			}
		}

		self.CustomData = ko.observableArray(CustomAttributeData);
		self.selectedValueFlag = ko.observable(true);
		self.selectedAttOperator = ko.observable();
		self.SelectedModelNameList = ko.observableArray();
		self.multiComboDataBackUp = ko.observableArray()
		// back to search search page 
		if (isCustomSearchCriteria) {
			$("#deviceCriteriaDiv").empty().show().html(isCustomSearchCriteria);
			$("#advanceCriteria").css('display', 'block');
			$("#ResultCriteriaDiv").hide();
			$("#CustomSearchReset").show();
			$("#idCustomSearch").val(customSearchText);
			GlobalCustomSearch = [];
			GlobalCustomSearch = JSON.parse(sessionStorage.getItem('GlobalCustomSearch'));

		}


		var selectedsource = '';
		// using JQX       
		$("#idCustomSearch").jqxInput({
			source: function (query, response) {
				var item = query.split(/ \s*/).pop();
				// update the search query.
				$("#idCustomSearch").jqxInput({ query: item });

				if (self.selectedValue && $.trim(query) != "") {

					var CustomeData = new Array();
					var newValue = self.selectedValue();

					var textData = $.trim($("#idCustomSearch").val());
					var textD1 = textData.split(' ');
					var isAttribute = _.where(deviceAttributesDataCustomSearch, { AttributeName: textD1[0] });
					if (isAttribute.length < 1) {
						self.CustomData(CustomAttributeData);
					}
					else {
						selectedsource = _.where(deviceAttributesDataCustomSearch, { AttributeName: textD1[0] });
						if (textD1[1]) {
							self.CustomData([]);
							self.selectedValue(undefined);

							if (self.multiComboData().length > 0 && textD1[0] == "ModelName") {
								var modelData = self.multiComboData();
								var modelList = new Array();
								for (var i = 0; i < modelData.length; i++) {
									modelList.push(modelData[i].Value);
								}
								self.CustomData(modelList);
							}
						}
						else if (selectedsource.length != 0) {
							for (var i = 0; i < selectedsource[0].DeviceSearchAttributeOperators.length; i++) {
								CustomeData.push(selectedsource[0].DeviceSearchAttributeOperators[i].Operator);
							}
							self.CustomData(CustomeData);
						}
					}

				}

				if (self.selectedValue)
					if (self.selectedValue() == undefined && self.selectedValueFlag())
						self.CustomData(CustomAttributeData);

				response(self.CustomData());
			},
			renderer: function (itemValue, inputValue) {

				if (selectedsource.length != 0) {
					var selectedsourceOperator = _.where(selectedsource[0].DeviceSearchAttributeOperators, { Operator: itemValue });
					if (selectedsourceOperator.length > 0) {
						self.selectedAttOperator(itemValue);
						GlobalCustomSearch.DeviceSearchAttributeId = selectedsourceOperator[0].DeviceSearchAttributesId;
						GlobalCustomSearch.DeviceSearchOperatorId = selectedsourceOperator[0].DeviceSearchOperatorId;
					}
				}


				var textData = $.trim($("#idCustomSearch").val());
				var textD1 = textData.split(' ');
				var isAttribute = _.where(deviceAttributesDataCustomSearch, { AttributeName: textD1[0] });
				if (isAttribute.length < 1)
					$("#idCustomSearch").val("");


				// for custom Model 
				var valueModelName;
				if (textD1[0] == "ModelName") {
					var Modeltrm = inputValue.trim().split(self.selectedAttOperator());
					if (Modeltrm[1] && Modeltrm[1] != "") {
						var Modelterms = Modeltrm[1];

						var a1 = Modelterms.split(/ \s*/);
						var p = a1[a1.length - 1];
						if (p.length < 3)
							a1.pop();
						a1 = a1.join(" ");
						if (a1)
							Modelterms = a1 + ", " + itemValue;
						else
							Modelterms = " " + itemValue;

						valueModelName = Modeltrm[0] + self.selectedAttOperator() + Modelterms;
					}
				}

				var terms = inputValue.split(/ \s*/);
				terms.pop();
				terms.push(itemValue);

				// terms.push("");


				var value = terms.join(" ");

				if (textD1[0] == "ModelName" && valueModelName) {
					value = valueModelName;
				}

				self.selectedValue = ko.observable(itemValue);
				self.selectedValueFlag(false);


				// device Model Name 
				if (itemValue == "ModelName") {
					var arr = getMultiCoiceFilterArr("Model");
					self.multiComboData(arr);
					self.multiComboDataBackUp(arr);
				}

				if (self.multiComboData().length > 0) {

					if (textD1[0] == "ModelName") {
						var SelectedcustomInput = inputValue.split(self.selectedAttOperator());
						if (valueModelName) {
							SelectedcustomInput = valueModelName.split(self.selectedAttOperator());
						}

						if (SelectedcustomInput[1]) {
							var selectedModelNames = SelectedcustomInput[1].trim().split(',');
							//selectedModelNames.push(itemValue);
							var SelectedModelData = new Array();
							// var multiComboDataTemp = self.multiComboDataBackUp();
							if (!selectedModelNames[0]) {
								selectedModelNames[0] = itemValue;
							}
							if (selectedModelNames[0]) {
								for (var i = 0; i < selectedModelNames.length; i++) {
									var NewVal = selectedModelNames[i].trim();
									var selectedModel = _.where(self.multiComboDataBackUp(), { Value: NewVal });
									if (selectedModel.length > 0) {
										var SelectedModelReq = {
											ModelId: selectedModel[0].Id,
											ModelName: selectedModel[0].Value
										};
										SelectedModelData.push(SelectedModelReq);

										//for (var j = 0; j < self.multiComboDataBackUp().length; j++) {
										//    if (multiComboDataTemp[j].Value)
										//        if (multiComboDataTemp[j].Value == NewVal) {
										//            multiComboDataTemp.splice(j, 1);
										//        }
										//}
										//self.multiComboData(multiComboDataTemp);
									}
								}

							}
							if (SelectedModelData.length > 0) {
								self.SelectedModelNameList(SelectedModelData);
							}
						}

						// remove selected value from device Model list                               
						//if (GlobalCustomSearch.DeviceSearchAttributeId == 50) {
						//    var multiComboDataTemp = self.multiComboDataBackUp();
						//    for (var i = 0; i < self.SelectedModelNameList().length; i++) {
						//        for (var j = 0; j < self.multiComboDataBackUp().length; j++) {
						//            if (multiComboDataTemp[j].Value)
						//                if (multiComboDataTemp[j].Value == self.SelectedModelNameList()[i].ModelName) {
						//                    multiComboDataTemp.splice(j, 1);
						//                }
						//        }
						//        self.multiComboData(multiComboDataTemp);
						//    }

						//}
					}

				}


				return value;
			}
		});

		$("#idCustomSearch")
			.bind("keydown", function (event) {

				if ($(this).val() == "") {
					self.selectedValueFlag(true);
					$(this).val(null).trim();
				}
			});


		$("#idCustomSearch").keypress(function (e) {
			if (e.keyCode == 13) {
				var customVal = $("#idCustomSearch").val().trim();
				if (customVal) {
					var str = customVal.split(' ');
					var selectedsource = _.where(deviceAttributesDataCustomSearch, { AttributeName: str[0] });
					if (selectedsource.length == 0)
						AdvancedOpenAlertPopup(1, 'please_select_Valid_attr');

					if (GlobalCustomSearch.DeviceSearchAttributeId == "" && selectedsource.length != 0)
						AdvancedOpenAlertPopup(1, 'please_select_Valid_operator');

					else if (selectedsource.length != 0 && str[1] == undefined)
						AdvancedOpenAlertPopup(1, 'please_select_Valid_operator');

					else if (selectedsource.length != 0) {
						var searchValue = str[str.length - 1];
						if (searchValue != "") {
							GlobalCustomSearch.SearchValue = searchValue;
							var cusData = new Array();
							cusData.push(GlobalCustomSearch);

							applyCustomFilter(cusData);
							isCustomSearchFlag = false;
							var customStr = "  <strong>Search Type : </strong> Custom Search <br /><strong>Attribute = </strong><span>" + customVal + "</span>";
							$("#deviceCriteriaDiv").empty().show().html(customStr);
							$("#advanceCriteria").css('display', 'block');
							$("#ResultCriteriaDiv").hide();
							$("#CustomSearchReset").show();
							sessionStorage.setItem('CustomSearchCriteria', customStr);
							sessionStorage.setItem('CustomSearchText', customVal);
							sessionStorage.setItem('GlobalCustomSearch', JSON.stringify(GlobalCustomSearch));

						}
						else
							AdvancedOpenAlertPopup(1, 'please_select_attr_value');
					}
				}
				else
					AdvancedOpenAlertPopup(1, 'please_select_Valid_attr');
			}

		});


		self.addCustomSearch = function () {
			var customVal = $("#idCustomSearch").val().trim();
			if (customVal) {
				var str = customVal.split(' ');
				var selectedsource = _.where(deviceAttributesDataCustomSearch, { AttributeName: str[0] });
				if (selectedsource.length == 0)
					AdvancedOpenAlertPopup(1, 'please_select_Valid_attr');

				if (GlobalCustomSearch.DeviceSearchAttributeId == "" && selectedsource.length != 0)
					AdvancedOpenAlertPopup(1, 'please_select_Valid_operator');

				else if (selectedsource.length != 0 && str[1] == undefined)
					AdvancedOpenAlertPopup(1, 'please_select_Valid_operator');

				else if (selectedsource.length != 0) {
					var searchValue = str[str.length - 1];
					if (searchValue != "") {
						GlobalCustomSearch.SearchValue = searchValue;
						var cusData = new Array();
						cusData.push(GlobalCustomSearch);

						applyCustomFilter(cusData);
						isCustomSearchFlag = false;
						var customStr = "  <strong>Search Type : </strong> Custom Search <br /><strong>Attribute = </strong><span>" + customVal + "</span>";

						$("#deviceCriteriaDiv").empty().show().html(customStr);
						$("#advanceCriteria").css('display', 'block');
						$("#ResultCriteriaDiv").hide();
						$("#CustomSearchReset").show();
						sessionStorage.setItem('CustomSearchCriteria', customStr);
						sessionStorage.setItem('CustomSearchText', customVal);
						sessionStorage.setItem('GlobalCustomSearch', JSON.stringify(GlobalCustomSearch));
					}
					else
						AdvancedOpenAlertPopup(1, 'please_select_attr_value');
				}
			}
			else
				AdvancedOpenAlertPopup(1, 'please_select_Valid_attr');

		}
		//----------------------------------Custom Search End --------------------------------------------------------------------
		self.removeAttrfromCriteriaSearch = function (item, flag) {
			panelheight("Devicejqxgrid", true);

			if (!item.IsMultiUse) {
				var duplicate = _.where(self.AttributeData(), { AttributeName: item.AttributeName });
				if (duplicate == '') {
					self.AttributeData.push(item);
				}
			}

			self.attrbuteCriteriaArr.remove(item);
			ADSearchUtil.backupAttrbuteCriteriaArr = self.attrbuteCriteriaArr();

			for (var i = 0; i < koUtil.gridColumnList.length; i++) {
				if (koUtil.gridColumnList[i] == item.AttributeName)
					koUtil.gridColumnList.splice(i, 1);
			}
			visibleColumnsList = koUtil.gridColumnList;

			var blanckArr = new Array()//self.multiselctedDeviceStatus();
			//if (self.ismodel() == true) {
			var modelArray = self.multiselctedModels();

			if (item.AttributeName == 'ModelName') {
				for (var i = 0; i < modelArray.length; i++) {

					var source = _.where(self.attrbuteCriteriaArr(), { ControlValues: modelArray[i].Name })

					if (source == '') {
						//self.multiselctedModels.remove(modelArray[i]);
						self.multiselctedModels([]);
					}
				}
			}

			//self.multiselctedModels(blanckArr);

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
			var softwareAssignmentType = self.multiSelectedSoftwareAssignmentType();
			if (item.AttributeName == 'SoftwareAssignmentType') {
				for (var i = 0; i < softwareAssignmentType.length; i++) {
					var source = _.where(self.attrbuteCriteriaArr(), { ControlValues: softwareAssignmentType[i].Name })

					if (source == '') {
						self.multiSelectedSoftwareAssignmentType([]);
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

			var vtpautodownloadenabledsarr = self.multiSelectedAutoDownloadEnbaled();
			if (item.AttributeName == 'Enable Automatic Download') {
				for (var i = 0; i < vtpautodownloadenabledsarr.length; i++) {
					var source = _.where(self.attrbuteCriteriaArr(), { ControlValues: vtpautodownloadenabledsarr[i].Name })

					if (source == '') {
						self.multiSelectedAutoDownloadEnbaled([]);
					}
				}
			}

			//self.multiselctedDeviceStatus(blanckArr);
			//}

			$('#deviceAttributDDL').val('-Select-').prop("selected", "selected");
			$('#deviceAttributDDL').trigger('chosen:updated');
			$('#ddlAttrName').trigger('chosen:updated');
			$('#ddlCombo').val('-Select-').prop("selected", "selected");
			$('#ddlCombo').trigger('chosen:updated');
			$('#ddlMultiCombo').val('-Select-').prop("selected", "selected");
			$('#ddlMultiCombo').trigger('chosen:updated');
			$("#txtAttrValue").val('');
			$("#txtappversion").val('');
			$("#txtAttrFromDate").val('');
			$("#txtAttrToDate").val('');
			$(".panel-side-pop").hide();
			self.checkoperator(false);
			self.comboType(false);
			self.textType(false);
			self.multiComboType(false);
			self.dateType(false);
			self.applicationType(false);
			self.checkaddAttr(false);
			if (flag == 1) {
				if (self.hierarchyPathStorage().length == 0 && self.attrbuteCriteriaArr().length == 0 && self.criteriaGroups().length == 0) {
					$("#A1").hide();
				}
				self.applyAdvanceFilterLocal();
			} else {
				self.validateAdStorage(2);

			}
			self.selectedOption(undefined);

			var displayAttrName = new Array();
			displayAttrName = self.AttributeData();

			if (displayAttrName.length != null) {
				displayAttrName.sort(function (a, b) { return a.DisplayName > b.DisplayName ? 1 : -1; })
			}

			self.AttributeData(displayAttrName);

			$(".panel-side-pop").hide();
			$("#attrDllDiv").css('width', "280px");
			self.observableAdvancedSearchModelPopup('unloadTemplate');

			// Pune Team code, need to check
			//$("#Devicejqxgrid").jqxGrid({ height: gridHeightFunction("Devicejqxgrid", "DevSearch") });

		}

		self.removeGroupsfromCriteriaSearch = function (item, flag) {
			self.criteriaGroups.remove(item);
			var arr = self.criteriaGroups();
			var selArr = [];
			for (var i = 0; i < arr.length; i++) {
				selArr.push(arr[i].GroupId);
			}

			var gridStorageArr = new Array();
			var gridStorageObj = new Object();
			gridStorageObj.checkAllFlag = 0;
			gridStorageObj.counter = 0;
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

			//var state = $("#groupsGrid").jqxGrid('savestate');

			//$("#groupContainer").empty();
			//var str = '<div id="groupsGrid"></div>';
			//  $("#groupContainer").append(str);

			//groupData = data.getGroupsResp.Groups
			//  groupsGrid(groupData, 'groupsGrid', self.criteriaGroups);

			//if (state != null) {
			//    $("#groupsGrid").jqxGrid('loadstate', state);
			//}
			//if (arr.length <= 0) {

			//    $("#columntablegroupsGrid").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
			//    $("#columntablegroupsGrid").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');
			//} else if (arr.length < groupData.length) {

			//    $("#columntablegroupsGrid").children('div').children('div').children('div').children('div').children('div').children('span').addClass('partial-selection');
			//    $("#columntablegroupsGrid").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');

			//} else if (arr.length == groupData.length) {

			//    $("#columntablegroupsGrid").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
			//    $("#columntablegroupsGrid").children('div').children('div').children('div').children('div').children('div').children('span').addClass('jqx-checkbox-check-checked');
			//}

			if (flag == 1) {
				if (self.hierarchyPathStorage().length == 0 && self.attrbuteCriteriaArr().length == 0 && self.criteriaGroups().length == 0) {
					$("#A1").hide();
				}
				self.applyAdvanceFilterLocal();
			} else {
				self.validateAdStorage(2)
			}

			$(".panel-side-pop").hide();
			$("#attrDllDiv").css('width', "280px");
			self.observableAdvancedSearchModelPopup('unloadTemplate');
		}

		self.selectedGroupsForAdSearch = ko.observableArray();
		ADSearchUtil.selectedGroupsForAdSearch = getMultiSelectedData('groupsGrid');
		self.selectedGroupsForAdSearch(ADSearchUtil.selectedGroupsForAdSearch);

		function attributValidation(textType, multiComboType, comboType, checkoperator, dateType) {
			var retval = '';
			if (checkoperator == true) {
				if ($("#ddlAttrName").find('option:selected').text() == null || $("#ddlAttrName").find('option:selected').text() == '-Select Operator-') {
					retval = 'operator';
				} else {
					if (textType == true) {
						if (($("#txtAttrValue").val().trim() == null || $("#txtAttrValue").val().trim() == '') && ($("#txtappversion").val().trim() == null || $("#txtappversion").val().trim() == '')) {
							retval = 'empty';
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

		self.hideinfo = function () {
			$("#AdInformationPopup").modal('hide');
			if (ADSearchUtil.AdScreenName == 'deviceSearch') {
			} else {
				$("#mainPageBody").addClass('modal-open-appendon');
			}
		}

		// custom search
		function applyCustomFilter(custom) {

			isResetApply = false;

			//$("#hideAdvanceSearchId").collapse('hide'); //------collapse/expand---

			$("#quickcriteria").addClass('quickCriHide');
			$("#advanceCriteria").removeClass('quickCriHide');
			koUtil.isQuickSearchApplied = 1;
			$("#txtQuickSearchDevice").val('');
			$("#deviceCriteriaDiv").removeClass('hide');
			$("#resetBtnForChart").addClass('hide');

			$("#resetBtnForAdSearch").removeClass('hide');
			var retval = attributValidation(self.textType(), self.multiComboType(), self.comboType(), self.checkoperator(), self.dateType());

			if (self.textType() == true || self.dateType() == true || self.multiComboType() == true || self.comboType() == true || self.applicationType() == true) {
				AdvancedOpenAlertPopup(1, 'please_add_selected_attribute_value');
			} else {
				$("#hideAdvanceSearchId").collapse('hide');//------collapse/expand---
				if (ADSearchUtil.AdScreenName == 'deviceSearch') {

					//  $(".advance-searchh").addClass("dn");
					//  $(".advance-search-result").removeClass("dn");

					$("#resetBtnForAdSearch").css("display", "none");
				} else {
					$('#AdvanceSearchModal').modal('hide');
					if (ADSearchUtil.AdScreenName == 'deviceSearch') {
					} else {
						$("#mainPageBody").removeClass('modal-open-appendon');
					}
				}
				CallType = ENUM.get("CALLTYPE_NONE");


				//for dynamic
				var DeviceSearch = new Object();

				///for device status
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
				}
				///

				///for groupsids       

				gId = ADSearchUtil.gridIdForAdvanceSearch;

				var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));

				var GroupArr = new Array();
				var selectedGroupData = self.criteriaGroups();
				if (adStorage && adStorage[0] && adStorage[0].AdvancedSearchFlag) {
					self.searchCheck(adStorage[0].AdvancedSearchFlag);
				}
				if (self.searchCheck() == AppConstants.get('GROUPS')) {
					for (var i = 0; i < selectedGroupData.length; i++) {
						GroupArr.push(selectedGroupData[i].GroupId);
					}
					adStorage[0].AdvancedSearchGroup = self.criteriaGroups();
					adStorage[0].AdvancedSearchHierarchy = null;
					adStorage[0].isWithGroup = 1;
				}
				else {

					adStorage[0].AdvancedSearchGroup = null;
					adStorage[0].isWithGroup = 0;
				}

				var updatedadStorage = JSON.stringify(adStorage);
				window.sessionStorage.setItem(gId + 'adStorage', updatedadStorage);

				DeviceSearch.GroupIds = GroupArr;

				//for hierarchy
				var HierarchyIdsWithChildren = new Array();
				var HierarchyIdsWithoutChildren = new Array();
				var HierarchyPathStorage = self.hierarchyPathStorage();
				for (var i = 0; i < HierarchyPathStorage.length; i++) {
					if (HierarchyPathStorage[i].IsChildExists) {
						if (HierarchyPathStorage[i].IncludeChildren) {
							HierarchyIdsWithChildren.push(HierarchyPathStorage[i].HierarchyId);
						} else {
							HierarchyIdsWithoutChildren.push(HierarchyPathStorage[i].HierarchyId);
						}
					} else {
						HierarchyIdsWithoutChildren.push(HierarchyPathStorage[i].HierarchyId);
					}
				}


				gId = ADSearchUtil.gridIdForAdvanceSearch;


				var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
				if (adStorage && adStorage[0] && adStorage[0].AdvancedSearchFlag) {
					self.searchCheck(adStorage[0].AdvancedSearchFlag);
				}
				if (self.searchCheck() == AppConstants.get('HIERARCHY')) {
					adStorage[0].AdvancedSearchHierarchy = HierarchyPathStorage;
					adStorage[0].AdvancedSearchGroup = null;
					adStorage[0].isWithGroup = 0;
				} else {
					adStorage[0].AdvancedSearchHierarchy = null;
				}

				var updatedadStorage = JSON.stringify(adStorage);
				window.sessionStorage.setItem(gId + 'adStorage', updatedadStorage);

				DeviceSearch.HierarchyIdsWithChildren = HierarchyIdsWithChildren;
				DeviceSearch.HierarchyIdsWithoutChildren = HierarchyIdsWithoutChildren;
				if (self.hierarchyPathStorage() == '') {
					DeviceSearch.IsHierarchiesSelected = false;
				} else {
					DeviceSearch.IsHierarchiesSelected = true;
				}

				DeviceSearch.SelectedHeaders = selectedColumns;
				DeviceSearch.IsOnlyDeleteBlacklisted = false;
				DeviceSearch.SearchCriteria = null;
				DeviceSearch.SearchElements = custom;

				// for model Name 
				var textData = $.trim($("#idCustomSearch").val());
				var textD1 = textData.split(' ');
				if (textD1[0] == "ModelName") {
					DeviceSearch.SearchElements = null;
				}


				///for display criteria
				var SearchText = '';
				if (HierarchyPathStorage.length > 0) {
					SearchText += 'Search Type = Hierarchy <br/>';

				}
				for (var i = 0; i < HierarchyPathStorage.length; i++) {
					SearchText += 'Hierarchy = ';
					SearchText += HierarchyPathStorage[i].HierarchyFullPath + ' <br/>';
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

				for (var i = 0; i < attrArr.length; i++) {

					SearchText += ' ' + attrArr[i].DisplayName;
					SearchText += ' ' + attrArr[i].OperatorValue;
					if (attrArr[i].AttributeName == 'ModelName') {
						var arr = self.multiselctedModels();
						for (var k = 0; k < arr.length; k++) {
							SearchText += ' ' + arr[k].displaytext + ','

						}
						SearchText = SearchText.slice(0, -1);
						SearchText += ';'
					} else if (attrArr[i].AttributeName == 'ComputedDeviceStatus') {
						var arr = self.multiselctedDeviceStatus();
						for (var j = 0; j < arr.length; j++) {

							SearchText += ' ' + arr[j].displaytext + ','
						}
						SearchText = SearchText.slice(0, -1);
						SearchText += ';'
					} else if (attrArr[i].AttributeName == 'SubStatus') {
						var arr = self.multiselctedSubStatus();
						for (var j = 0; j < arr.length; j++) {

							SearchText += ' ' + arr[j].displaytext + ','
						}
						SearchText = SearchText.slice(0, -1);
						SearchText += ';'
					} else if (attrArr[i].AttributeName == 'ModeofConnectivity') {
						var arr = self.multiSelectedModeOfConnectivity();
						for (var j = 0; j < arr.length; j++) {

							SearchText += ' ' + arr[j].displaytext + ','
						}
						SearchText = SearchText.slice(0, -1);
						SearchText += ';'
					} else if (attrArr[i].AttributeName == 'SoftwareAssignmentType') {
						var arr = self.multiSelectedSoftwareAssignmentType();
						for (var j = 0; j < arr.length; j++) {

							SearchText += ' ' + arr[j].displaytext + ','
						}
						SearchText = SearchText.slice(0, -1);
						SearchText += ';'
					} else if (attrArr[i].AttributeName == 'EncrEnabled') {
						var arr = self.multiSelectedVTPEncryptionStatus();
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

				//$("#deviceCriteriaDiv").empty();
				//$("#deviceCriteriaDiv").append(SearchText);
				///

				///for models
				var searchModels = new Array();
				var arr1 = self.multiselctedModels();

				for (var i = 0; i < arr1.length; i++) {
					var SearchModel = new Object();
					if (arr1[i].id != undefined) {
						SearchModel.ModelId = arr1[i].id;
					} else {
						SearchModel.ModelId = arr1[i].Id;
					}
					SearchModel.ModelName = arr1[i].Name;
					searchModels.push(SearchModel);
				}

				DeviceSearch.SearchModels = searchModels;
				var textData = $.trim($("#idCustomSearch").val());
				var textD1 = textData.split(' ');
				if (textD1[0] == "ModelName") {
					DeviceSearch.SearchModels = self.SelectedModelNameList();
				}

				///
				DeviceSearch.SearchID = 0;
				DeviceSearch.SearchName = null;
				DeviceSearch.SearchText = SearchText;
				DeviceSearch.SearchType = ENUM.get('CUSTOM');

				gId = ADSearchUtil.gridIdForAdvanceSearch;
				if (self.hierarchyPathStorage().length == 0 && self.attrbuteCriteriaArr().length == 0 && self.criteriaGroups().length == 0) {
					ADSearchUtil.deviceSearchObj = null;
					globalAdvancedSearch = null;
				} else {
					ADSearchUtil.deviceSearchObj = DeviceSearch;
					globalAdvancedSearch = DeviceSearch;
				}

				updateAdSearchObj(gId, DeviceSearch, 0);

				ADSearchUtil.resetAddSerchFlag = '';
				ADSearchUtil.newAddedDataFieldsArr = [];
				ADSearchUtil.newAddedgridColumns = [];
				ADSearchUtil.ExportDynamicColumns = [];
				if (gId == 'jqxgridForSelectedDevices') {
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
					$("#" + gId).jqxGrid('updatebounddata');
					//gridFilterClear(gId);
				} else {
					gridFilterClear(gId, 0);
				}

				$("#mainPageBody").removeClass('modal-open-appendon');
				isAdpopup = '';
			}

			$("#criteriabtnDiv").css("display", "inline");
			$("#resetBtnForChart").addClass('hide');

			$("#resetBtnForAdSearch").removeClass('hide');
			$("#txtSearchName").val('');
			self.checkTxtSearchName('');

			if (self.hierarchyPathStorage().length != 0 || self.attrbuteCriteriaArr().length != 0 || self.criteriaGroups().length != 0) {
				$("#advanceCriteria").show();
			} else {
				$("#advanceCriteria").hide();
			}
		}

		self.validateAdStorage = function (flag) {
			CallType = ENUM.get("CALLTYPE_NONE");
			//for dynamic
			var DeviceSearch = new Object();

			///for device status
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
			}
			///

			///for groupsids       

			gId = ADSearchUtil.gridIdForAdvanceSearch;

			var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));

			var GroupArr = new Array();
			var selectedGroupData = self.criteriaGroups();
			if (adStorage && adStorage[0] && adStorage[0].AdvancedSearchFlag) {
				self.searchCheck(adStorage[0].AdvancedSearchFlag);
			}
			if (self.searchCheck() == AppConstants.get('GROUPS')) {
				for (var i = 0; i < selectedGroupData.length; i++) {
					GroupArr.push(selectedGroupData[i].GroupId);
				}
				if (adStorage && adStorage.length > 0) {
					adStorage[0].AdvancedSearchGroup = self.criteriaGroups();
					adStorage[0].AdvancedSearchHierarchy = null;
					adStorage[0].isWithGroup = 1;
				}
			}
			else {
				if (adStorage && adStorage.length > 0) {
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
			var HierarchyPathStorage = self.hierarchyPathStorage();
			for (var i = 0; i < HierarchyPathStorage.length; i++) {
				if (HierarchyPathStorage[i].IsChildExists) {
					if (HierarchyPathStorage[i].IncludeChildren) {
						HierarchyIdsWithChildren.push(HierarchyPathStorage[i].HierarchyId);
					} else {
						HierarchyIdsWithoutChildren.push(HierarchyPathStorage[i].HierarchyId);
					}

				} else {
					HierarchyIdsWithoutChildren.push(HierarchyPathStorage[i].HierarchyId);
				}
			}


			gId = ADSearchUtil.gridIdForAdvanceSearch;


			var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));

			if (self.searchCheck() == AppConstants.get('HIERARCHY')) {
				if (adStorage && adStorage.length > 0) {
					adStorage[0].AdvancedSearchHierarchy = HierarchyPathStorage;
					adStorage[0].AdvancedSearchGroup = null;
					adStorage[0].isWithGroup = 0;
				}
			} else {
				if (adStorage && adStorage.length > 0) {
					adStorage[0].AdvancedSearchHierarchy = null;
				}
			}

			var updatedadStorage = JSON.stringify(adStorage);
			window.sessionStorage.setItem(gId + 'adStorage', updatedadStorage);

			DeviceSearch.HierarchyIdsWithChildren = HierarchyIdsWithChildren;
			DeviceSearch.HierarchyIdsWithoutChildren = HierarchyIdsWithoutChildren;
			if (self.hierarchyPathStorage() == '') {
				DeviceSearch.IsHierarchiesSelected = false;
			} else {
				DeviceSearch.IsHierarchiesSelected = true;
			}

			DeviceSearch.SelectedHeaders = selectedColumns;
			DeviceSearch.IsOnlyDeleteBlacklisted = false;
			DeviceSearch.SearchCriteria = null;

			var searchElements = new Array();
			var arr = self.attrbuteCriteriaArr();
			var source = _.where(self.attrbuteCriteriaArr(), { DisplayName: 'Connected Devices' })
			isIncludeConnectedDevices = (!_.isEmpty(source) && source.length > 0) ? true : false;

			for (var i = 0; i < arr.length; i++) {
				if (arr[i].DisplayName == 'Model' || arr[i].DisplayName == 'Device Status') {

				}
				else {
					var DeviceSearchElement = new Object();
					if (arr[i].ControlType != undefined) {
						DeviceSearchElement.ControlType = ENUM.get(arr[i].ControlType.toUpperCase());
						DeviceSearchElement.DeviceSearchAttributeId = arr[i].DeviceSearchAttributeId;
						DeviceSearchElement.DeviceSearchOperatorId = arr[i].SelectedDeviceSearchOperatorId;
						DeviceSearchElement.SearchElementSeqNo = i;
						DeviceSearchElement.SearchId = 0;
						if (arr[i].DisplayName == 'Sub Status') {
							DeviceSearchElement.SearchValue = subStatus.toString();
						} else if (arr[i].DisplayName == 'Mode of Connectivity') {
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
						} else if (arr[i].DisplayName == 'Enable Automatic Download') {
							var searchValAutoDwnloadStatus = self.multiSelectedAutoDownloadEnbaled();
							var searchValString = '';
							if (searchValAutoDwnloadStatus && searchValAutoDwnloadStatus.length > 0) {
								for (var j = 0; j < searchValAutoDwnloadStatus.length; j++) {
									searchValString += searchValAutoDwnloadStatus[j].Name + ",";
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
			}

			DeviceSearch.SearchElements = searchElements;
			DeviceSearch.IsIncludeConnectedDevices = isIncludeConnectedDevices;

			///for display criteria
			var SearchText = '';
			if (HierarchyPathStorage.length > 0) {
				SearchText += 'Search Type = Hierarchy <br/>';

			}
			for (var i = 0; i < HierarchyPathStorage.length; i++) {
				SearchText += 'Hierarchy = ';
				SearchText += HierarchyPathStorage[i].HierarchyFullPath + ' <br/>';
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
				if (attrArr[0].OperatorValue == undefined) {
					attrArr = [];
					self.attrbuteCriteriaArr([]);
				} else {
					SearchText += 'Attribute =';
				}
			}

			for (var i = 0; i < attrArr.length; i++) {

				SearchText += ' ' + attrArr[i].DisplayName;
				SearchText += ' ' + attrArr[i].OperatorValue;
				if (attrArr[i].AttributeName == 'ModelName') {
					var arr = self.multiselctedModels();
					for (var k = 0; k < arr.length; k++) {
						SearchText += ' ' + arr[k].displaytext + ','

					}
					SearchText = SearchText.slice(0, -1);
					SearchText += ';'
				} else if (attrArr[i].AttributeName == 'ComputedDeviceStatus') {
					var arr = self.multiselctedDeviceStatus();
					for (var j = 0; j < arr.length; j++) {

						SearchText += ' ' + arr[j].displaytext + ','
					}
					SearchText = SearchText.slice(0, -1);
					SearchText += ';'
				} else if (attrArr[i].AttributeName == 'SubStatus') {
					var arr = self.multiselctedSubStatus();
					for (var j = 0; j < arr.length; j++) {

						SearchText += ' ' + arr[j].displaytext + ','
					}
					SearchText = SearchText.slice(0, -1);
					SearchText += ';'
				} else if (attrArr[i].AttributeName == 'ModeofConnectivity') {
					var arr = self.multiSelectedModeOfConnectivity();
					for (var j = 0; j < arr.length; j++) {

						SearchText += ' ' + arr[j].displaytext + ','
					}
					SearchText = SearchText.slice(0, -1);
					SearchText += ';'
				} else if (attrArr[i].AttributeName == 'SoftwareAssignmentType') {
					var arr = self.multiSelectedSoftwareAssignmentType();
					for (var j = 0; j < arr.length; j++) {

						SearchText += ' ' + arr[j].displaytext + ','
					}
					SearchText = SearchText.slice(0, -1);
					SearchText += ';'
				} else if (attrArr[i].AttributeName == 'EncrEnabled') {
					var arr = self.multiSelectedVTPEncryptionStatus();
					for (var j = 0; j < arr.length; j++) {

						SearchText += ' ' + arr[j].displaytext + ','
					}
					SearchText = SearchText.slice(0, -1);
					SearchText += ';'
				} else if (attrArr[i].AttributeName == 'Enable Automatic Download') {
					var arr = self.multiSelectedAutoDownloadEnbaled();
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

			//$("#deviceCriteriaDiv").empty();
			//$("#deviceCriteriaDiv").append(SearchText);
			///

			///for models
			var searchModels = new Array();
			var arr1 = self.multiselctedModels();



			for (var i = 0; i < arr1.length; i++) {
				var SearchModel = new Object();
				if (arr1[i].id != undefined) {
					SearchModel.ModelId = arr1[i].id;
				} else {
					SearchModel.ModelId = arr1[i].Id;
				}
				SearchModel.ModelName = arr1[i].Name;
				searchModels.push(SearchModel);
			}
			DeviceSearch.SearchModels = searchModels;
			///
			DeviceSearch.SearchID = 0;
			DeviceSearch.SearchName = null;
			DeviceSearch.SearchText = SearchText;
			DeviceSearch.SearchType = ENUM.get('ADVANCED');
			//end dyn

			gId = ADSearchUtil.gridIdForAdvanceSearch;



			if (self.hierarchyPathStorage().length == 0 && self.attrbuteCriteriaArr().length == 0 && self.criteriaGroups().length == 0) {
				ADSearchUtil.deviceSearchObj = null;
				globalAdvancedSearch = null;
				updateAdSearchObj(gId, DeviceSearch, 2);
			} else {
				ADSearchUtil.deviceSearchObj = DeviceSearch;
				globalAdvancedSearch = DeviceSearch;
				updateAdSearchObj(gId, DeviceSearch, 0);
			}
			adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
			var updatedadStorage = JSON.stringify(adStorage);
			window.sessionStorage.setItem(gId + 'adStorage', updatedadStorage);
		}

		self.applyAdvanceFilterLocal = function () {

			isResetApply = false;
			isFilterApplied = true;

			//$("#hideAdvanceSearchId").collapse('hide'); //------collapse/expand---

			sessionStorage.removeItem('CustomSearchCriteria');
			sessionStorage.removeItem('CustomSearchText');
			sessionStorage.removeItem('GlobalCustomSearch');


			$("#ResultCriteriaDiv").show();
			$("#deviceCriteriaDiv").empty();
			$("#idCustomSearch").val('');
			$("#CustomSearchReset").hide();

			$("#quickcriteria").addClass('quickCriHide');
			$("#advanceCriteria").removeClass('quickCriHide');
			koUtil.isQuickSearchApplied = 1;
			$("#txtQuickSearchDevice").val('');
			$("#SaveSearchReset").hide();
			// $("#deviceCriteriaDiv").removeClass('hide');
			$("#resetBtnForChart").addClass('hide');

			$("#resetBtnForAdSearch").removeClass('hide');
			var retval = attributValidation(self.textType(), self.multiComboType(), self.comboType(), self.checkoperator(), self.dateType());

			if (self.textType() == true || self.dateType() == true || self.multiComboType() == true || self.comboType() == true || self.applicationType() == true) {
				AdvancedOpenAlertPopup(1, 'please_add_selected_attribute_value');
			} else {
				$("#hideAdvanceSearchId").collapse('hide');//------collapse/expand---
				if (ADSearchUtil.AdScreenName == 'deviceSearch') {

					// $(".advance-searchh").addClass("dn");
					// $(".advance-search-result").removeClass("dn");

					$("#resetBtnForAdSearch").css("display", "none");
				} else {
					$('#AdvanceSearchModal').modal('hide');
					if (ADSearchUtil.AdScreenName == 'deviceSearch') {
					} else {
						$("#mainPageBody").removeClass('modal-open-appendon');
					}
				}



				self.validateAdStorage(1);

				ADSearchUtil.resetAddSerchFlag = '';
				ADSearchUtil.newAddedDataFieldsArr = [];
				ADSearchUtil.newAddedgridColumns = [];
				ADSearchUtil.ExportDynamicColumns = [];
				if (gId == 'jqxgridForSelectedDevices') {
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
					$("#" + gId).jqxGrid('updatebounddata');
					//gridFilterClear(gId);
				} else {
					gridFilterClear(gId, 0);
				}

				$("#mainPageBody").removeClass('modal-open-appendon');
				isAdpopup = '';
			}

			$("#criteriabtnDiv").css("display", "inline");
			$("#resetBtnForChart").addClass('hide');

			$("#resetBtnForAdSearch").removeClass('hide');
			$("#txtSearchName").val('');
			self.checkTxtSearchName('');

			if (self.hierarchyPathStorage().length != 0 || self.attrbuteCriteriaArr().length != 0 || self.criteriaGroups().length != 0) {
				$("#advanceCriteria").show();
			} else {
				$("#advanceCriteria").hide();
			}
			$("#deviceCriteriaDiv").hide();
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

		self.expandUL = function () {
			koUtil.checkQuckDDL = 1;
			self.allSearches(ADSearchUtil.ADAllSearches());
		}

		$("#txtQuickSearchDevice").keyup(function (e) {
			//alert($(this).val());
			var filter = $(this).val();
			$("#allSearchUL li").each(function () {

				if ($(this).text().search(new RegExp(filter, "i")) < 0) {
					if ($(this).text().indexOf("-------Last Searches-------") < 0) {
						if ($(this).text().indexOf("-------Private-------") < 0) {
							if ($(this).text().indexOf("-------Public-------") < 0) {
								$(this).hide();
							}
						}
					}
				} else {
					$(this).show()
				}
			});

			//-------------when filter value is blank background color reset---------
			if (filter == '') {
				$("#allSearchUL").each(function () {
					$(this).children('li').css("background-color", "");
				});
			}


			//if (e.keyCode == 13) {
			//    koUtil.checkQuckDDL = 0;
			//    $("#allQuickSearchUL").addClass('hide');
			//    $("#allSearchUL").addClass('hide');
			//    self.addQuickSearch();

			//}
		});
		$("#txtQuickSearchDevice").keyup(function (e) {
			//if (e.keyCode == 13) {
			//    koUtil.checkQuckDDL = 0;
			//    $("#allQuickSearchUL").addClass('hide');
			//    $("#allSearchUL").addClass('hide');
			//    self.addQuickSearch();

			//}

		})
		$("#txtQuickSearchDevice").on("click", function () {
			var filter = $(this).val();
			$("#allSearchUL li").each(function () {

				if ($(this).text().search(new RegExp(filter, "i")) < 0) {
					if ($(this).text().indexOf("-------Last Searches-------") < 0) {
						if ($(this).text().indexOf("-------Private-------") < 0) {
							if ($(this).text().indexOf("-------Public-------") < 0) {
								$(this).hide();
							}
						}
					}
				} else {
					$(this).show();
				}
			});
		});

		init();
		function init() {
			setScreenControls(AppConstants.get('DEVICE_SEARCH'));
			param = getDeviceParameters(false, columnSortFilterDevice, null, null, 0, ADSearchUtil.deviceSearchObj, careSearchObject);
			if (_.isEmpty(deviceAttributesDataDeviceSearch)) {
				getDeviceAttributes(AppConstants.get('DEVICESEARCH'), getDeviceAttributesCallback);
			} else {
				getCustomColumns('DeviceSearchFilter', 'deviceSearch', 'blankDevicejqxgrid', customColumnsCallback);
			}
		}

		function getProtocolForSelectedDevices(gId) {

			getProtocolForSelectedDevicesReq = new Object();
			var Selector = new Object();
			var selectedDeviceSearchItems = getSelectedUniqueId(gId);
			var unselectedDeviceSearchItems = getUnSelectedUniqueId(gId);
			var checkAll = checkAllSelected(gId);

			if (checkAll == 1) {
				Selector.SelectedItemIds = null;
				if (unselectedDeviceSearchItems.length > 0) {
					Selector.UnSelectedItemIds = unselectedDeviceSearchItems;
				} else {
					Selector.UnSelectedItemIds = null;
				}
			} else {
				Selector.SelectedItemIds = selectedDeviceSearchItems;
				Selector.UnSelectedItemIds = null;
			}
			getProtocolForSelectedDevicesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
			getProtocolForSelectedDevicesReq.Selector = Selector;
			getProtocolForSelectedDevicesReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

			var param = new Object();
			param.token = TOKEN();
			param.getProtocolForSelectedDevicesReq = getProtocolForSelectedDevicesReq;

			function callbackFunction(data, error) {
				koUtil.Protocol = '';
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data && data.Protocol) {
							data.Protocol = $.parseJSON(data.Protocol);
						}

						koUtil.Protocol = data.protocol;

						if (popupScreen == "DeviceStatus") {
							if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('VEM_PROTOCOL')) {
								loadelement(popupName, 'device');
								$("#countMsgId").text(i18n.t('change_device_status_for_multiple_devices', { lng: lang }));
								$('#deviceModel').modal('show');
							} else if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
								openAlertpopup(1, 'select_VEM_devices');
							}
						}
						else if (popupScreen == "ScheduleDownload") {
							koUtil.isFromScheduleDownloadsScreen = 0;
							if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
								openAlertpopup(1, 'select_VEM_devices');
								return;
							}
							setscheduleAdstorageFromDeviceSearch('jqxgridForSelectedDevicesdownloads', globalVariableForDownloadSchedule, globalVariableForunselectedItems);
							scheduleOption = "scheduleDownload";
							redirectToLocation(menuJsonData, 'scheduleDownload');
						}
						else if (popupScreen == "ScheduleContent") {
							koUtil.isFromScheduleScreen = 0;

							if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
								openAlertpopup(1, 'select_VEM_devices');
								return;
							}
							setscheduleAdstorageFromDeviceSearch('jqxgridForSelectedDevicesmanageContents', globalVariableForDownloadSchedule, globalVariableForunselectedItems);
							scheduleOption = "scheduleContent";
							redirectToLocation(menuJsonData, 'scheduleDelivery');
						}
						else if (popupScreen == "ScheduleDiagnostics") {
							koUtil.isFromScheduleActionScreen = 0;
							if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
								openAlertpopup(1, 'select_VEM_devices');
								return;
							}
							setscheduleAdstorageFromDeviceSearch('jqxgridForSelectedDevicesdiagnostics', globalVariableForDownloadSchedule, globalVariableForunselectedItems);
							scheduleOption = "scheduleAction";
							redirectToLocation(menuJsonData, 'scheduleActions');
						}
						else if (popupScreen == "EditParameters") {
							loadelement('modelEditParameterTemplate', 'device');
							$('#deviceModel').modal('show');
						}
						else if (popupScreen == "SoftwareAssignment") {
							loadelement('modelSoftwareAssignment', 'device');
							$('#deviceModel').modal('show');
						}
						else if (popupScreen == "DownloadSettings") {
							if (data.protocol.toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
								loadelement('modelDownloadSettings', 'device');
								$('#deviceModel').modal('show');
							}
							else {
								openAlertpopup(1, 'select_zontalk_devices');
							}
						}
					}
					//else if (data.responseStatus.StatusCode == AppConstants.get("Devices_Selected_Different_Protocol")) {
					//    if (popupScreen == "ScheduleDownload") {
					//        $("#scheduleConfirmationPopup").modal('show');
					//    }
					//    else if (popupScreen == "ScheduleContent") {
					//        $("#scheduleConfirmationPopup").modal('show');
					//    }
					//    else if (popupScreen == "ScheduleDiagnostics") {
					//        $("#scheduleConfirmationPopup").modal('show');
					//    }
					//    else if (popupScreen == "DownloadSettings") {
					//        openAlertpopup(1, 'select_zontalk_devices');
					//    }
					//    else if (popupScreen == "DeviceStatus") {
					//        openAlertpopup(1, 'select_VEM_devices');
					//    }
					//    else {
					//        openAlertpopup(1, 'select_zontalk_or_vem_devices');
					//    }
					//}
				}
				if (error) {
					//AdvancedOpenAlertPopup(2, 'network_error');
				}
			}

			var method = 'GetProtocolForSelectedDevices';
			var params = '{"token":"' + TOKEN() + '","getProtocolForSelectedDevicesReq":' + JSON.stringify(getProtocolForSelectedDevicesReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		//On Vericentre change implementation, this function call has to be removed
		//getProtocolForSelectedDevices function call will be uncommented from all the places
		function temporaryPopUpSpecificFunction(popupScreen) {
			istemppopup = false;
			if (popupScreen == "DeviceStatus") {
				loadelement(popupName, 'device');
				$("#countMsgId").text(i18n.t('change_device_status_for_multiple_devices', { lng: lang }));
				$('#deviceModel').modal('show');
			}
			else if (popupScreen == "ScheduleDownload") {
				koUtil.isFromScheduleDownloadsScreen = 0;
				setscheduleAdstorageFromDeviceSearch('jqxgridForSelectedDevicesdownloads', globalVariableForDownloadSchedule, globalVariableForunselectedItems);
				scheduleOption = "scheduleDownload";
				redirectToLocation(menuJsonData, 'scheduleDownload');
			}
			else if (popupScreen == "ScheduleContent") {
				koUtil.isFromScheduleScreen = 0;
				setscheduleAdstorageFromDeviceSearch('jqxgridForSelectedDevicesmanageContents', globalVariableForDownloadSchedule, globalVariableForunselectedItems);
				scheduleOption = "scheduleContent";
				redirectToLocation(menuJsonData, 'scheduleDelivery');
			}
			else if (popupScreen == "ScheduleDiagnostics") {
				koUtil.isFromScheduleActionScreen = 0;
				setscheduleAdstorageFromDeviceSearch('jqxgridForSelectedDevicesdiagnostics', globalVariableForDownloadSchedule, globalVariableForunselectedItems);
				scheduleOption = "scheduleAction";
				redirectToLocation(menuJsonData, 'scheduleActions');
			}
			else if (popupScreen == "EditParameters") {
				loadelement('modelEditParameterTemplate', 'device');
				$('#deviceModel').modal('show');
			}
			else if (popupScreen == "SoftwareAssignment") {
				loadelement('modelSoftwareAssignment', 'device');
				$('#deviceModel').modal('show');
			}
		}

		///
		$(".search-choice").prop('title', 'goood');
		var chosen = "";
		var liscrollpos = 10;
		var childIdx = 0;
		selectedtextforupdown = '';
		checkenter = 0;
		$(document).keydown(function (e) {

			if (e.keyCode == 13) {

				if (ADSearchUtil.AdScreenName == 'deviceSearch') {
					if ($(".advance-search-result").hasClass("dn")) {

						if ($("#allSearchUL").hasClass('hide')) {
							//alert('hide  ' +JSON.stringify( $("#txtQuickSearchDevice").focus()));

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

					} else {

					}
				}

				//alert('koUtil.checkQuckDDL     ' + koUtil.checkQuckDDL);


			}

		});

		//}

		var adStorage = JSON.parse(sessionStorage.getItem(ADSearchUtil.gridIdForAdvanceSearch + "adStorage"));

		if (adStorage && adStorage[0]) {


			// if (adStorage[0].adSearchObj || adStorage[0].quickSearchObj) {
			$("#hideAdvanceSearchId").collapse('hide');
			$("#deviceCriteriaDiv").removeClass('hide');
			$("#resetBtnForChart").addClass('hide');

			//   $(".advance-searchh").addClass("dn");
			//   $(".advance-search-result").removeClass("dn");
			$("#criteriabtnDiv").css("display", "inline");


			if (adStorage[0].adSearchObj) {

				// $("#resetBtnForAdSearch").css('display', "none");
				$("#resetBtnForAdSearch").removeClass('hide');
				$("#txtSearchName").val('');
			} else if (adStorage[0].quickSearchObj || (adStorage[0].quickSearchName && adStorage[0].quickSearchName != "")) {
				// $("#quickcriteria").removeClass('quickCriHide');
				$("#advanceCriteria").removeClass('quickCriHide');


				//self.applyForGrid(false);

				//$("#resetBtnForAdSearch").addClass('hide');
				$("#resetBtnForAdSearch").css('display', "inline");
				$("#A1").css('display', "");
			} else {
				$("#advanceCriteria").addClass('quickCriHide');
				$("#quickcriteria").addClass('quickCriHide');
			}


			//} else {
			//     $("#hideAdvanceSearchId").collapse('show');
			// }
			//generateAdvanceForSaveState(0, self.hierarchyPathStorage, self.criteriaGroups, self.attrbuteCriteriaArr, self.AttributeData, self.checkAccessType, self.flageForEdit, self.multiselctedModels, self.multiselctedDeviceStatus, self.flageForCopy, self.backupAttributeData1, adStorage[0]);
		}

		//alert($(window).height());
		//if ($(window).height() > 650) {

		var winheight = $(window).height() - 120;
		var intwinheight = winheight;
		//        winheight = winheight + 'px';
		//        if ($("#hideAdvanceSearchId").height() == 0) {

		//        }else
		//        if (intwinheight > $("#hideAdvanceSearchId").height()) {
		//            $("#hideAdvanceSearchId").css('height', winheight);
		//            $(".resultsection").css('height', winheight);
		//        }


		//}


		// corectWindowHeight();

		function corectWindowHeight() {
			var windowHeight = $(window).height();
			var hideAdvanceSearchIdHeight = $("#hideAdvanceSearchId").height();
			var resultsectionHeight = $("#resultsection").height();


			if (windowHeight > 650) {
				var winheight = windowHeight - 120;
				var intwinheight = winheight;
				winheight = winheight + 'px';
				if (hideAdvanceSearchIdHeight == 0) {
					if (resultsectionHeight == 0) {
						if (windowHeight > 700) {
							setHeightToDevContent(winheight)
						}

					} else if (intwinheight > resultsectionHeight) {
						if (hideAdvanceSearchIdHeight == 0) {

						} else {
							setHeightToDevContent(winheight);
						}
					}
				} else
					if (intwinheight > hideAdvanceSearchIdHeight) {
						setHeightToDevContent(winheight);
					}


			}
		}


		function setHeightToDevContent(winheight) {
			setTimeout(function () {
				$("#hideAdvanceSearchId").css('height', winheight);
				$("#resultsection").css('height', winheight);
			}, 500)
		}


		function getAdvancedSearch(searchId, hierarchyPathStorage, criteriaGroups, attrbuteCriteriaArr, AttributeData, checkAccessType, flageForEdit, multiselctedModels, multiselctedDeviceStatus, multiselectedSubStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, flageForCopy, backupAttributeData, flag, searchCheck, multiSelectedAutoDownloadEnbaled, multiSelectedSoftwareAssignmentType) {

			var arr = hierarchyPathStorage();
			var getAdvanedSearchReq = new Object();
			getAdvanedSearchReq.SearchId = searchId;
			function callbackFunction(data, error) {
				if (data) {
					if ($("#txtSearchName").val() == '') {
						$("#btnSave").attr('disabled', true);
					}
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						hierarchyPathStorage([]);
						ADSearchUtil.HierarchyPathStorage([]);

						ADSearchUtil.attributeDataArr = [];

						attrbuteCriteriaArr([]);

						ADSearchUtil.selectedGroupsForAdSearch = [];
						criteriaGroups([]);
						var harray = new Array();
						if (data.getAdvanedSearchResp) {
							data.getAdvanedSearchResp = $.parseJSON(data.getAdvanedSearchResp);
							if (data.getAdvanedSearchResp.AdvancedSearch) {
								if (data.getAdvanedSearchResp.AdvancedSearch.IsPrivateSearch == false) {
									checkAccessType('Public');
								} else {
									checkAccessType('Private')
								}

								if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchHierarcy) {
									if (flag == true) {
										$("#hierarchyDiv").show();
										$("#GroupDiv").hide();
										searchCheck(AppConstants.get('HIERARCHY'));
										criteriaGroups([]);
										$("#groupContainer").empty();
										var str = "<div id='groupsGrid'></div>";
										$("#groupContainer").append(str);
										getGroups(self.criteriaGroups);
										loadHierarchyAd('modalHierarchy', 'genericPopup');
										$("#hierarchyDiv").show();
										$("#GroupDiv").hide();
									}
									var hierarchyeditData = data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchHierarcy;
									for (var i = 0; i < hierarchyeditData.length; i++) {

										var EAdvancedSearchHierarchy = new Object();
										EAdvancedSearchHierarchy.HierarchyFullPath = hierarchyeditData[i].HierarchyFullPath;
										EAdvancedSearchHierarchy.HierarchyId = hierarchyeditData[i].HierarchyId;
										EAdvancedSearchHierarchy.IncludeChildren = hierarchyeditData[i].IncludeChildren;
										EAdvancedSearchHierarchy.IsChildExists = hierarchyeditData[i].IsChildExists;
										EAdvancedSearchHierarchy.SearchId = searchId;
										ADSearchUtil.HierarchyPathStorage.push(EAdvancedSearchHierarchy);
									}
									hierarchyPathStorage = ADSearchUtil.HierarchyPathStorage;
									var arr = hierarchyPathStorage();

								}
								if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchGroup) {
									if (flag == true) {
										self.searchCheck(AppConstants.get('GROUPS'));
										getGroups(self.criteriaGroups);
										self.hierarchyPathStorage([])
										ADSearchUtil.HierarchyPathStorage([]);
										ADSearchUtil.hierarchyFullPath = self.hierarchyPathStorage();
										self.observableHierarchyAd('unloadTemplate');
										self.hierarchyPathStorage();

										$("#hierarchyDiv").hide();
										$("#GroupDiv").show();
										var str = '';
										str += '<div id="groupsGrid"></div>';
										$("#groupContainer").empty();
										$("#groupContainer").append(str);
										$("#groupsGrid").jqxGrid('updatebounddata');
									}

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
									EAdvancedSearchModel.ControlType = 'MultiCombo';
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

										objModel.displaytext = selectedSource[0].Value;

										multiselctedModels.push(objModel);

									}
									EAdvancedSearchModel.toolTip = tooltip;
									//ADSearchUtil.attributeDataArr.push(EAdvancedSearchModel);
									//attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);
									//var attrdataArray = AttributeData();
									//alert('AttributeData==' + JSON.stringify(attrdataArray))

									//var statussource = _.where(attrdataArray, { DeviceSearchAttributeId: elementArr[i].DeviceSearchAttributeId });

									var check = multiselctedModels();


								}
								if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchStatus) {
									var fetchedstatusArr = data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchStatus;
									var EAdvancedSearchstatus = new Object();

									EAdvancedSearchstatus.DeviceSearchAttributeId = 0;
									EAdvancedSearchstatus.SelectedDeviceSearchOperatorId = 0;
									EAdvancedSearchstatus.SearchElementSeqNo = 0;
									EAdvancedSearchstatus.SearchId = 0;
									EAdvancedSearchstatus.ControlType = 'MultiCombo';
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
										objstatus.displaytext = selectedSource[0].Value;

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
										objsubstatus.displaytext = selectedSource[0].Value;

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
										objmodeofconnectivity.displaytext = selectedSource[0].Value;

										multiSelectedModeOfConnectivity.push(objmodeofconnectivity);

									}
									EAdvancedSearchstatus.toolTip = tooltip;
									//ADSearchUtil.attributeDataArr.push(EAdvancedSearchstatus);

									//attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);


								}

								if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchSoftwareAssignmentType) {
									var fetchedSoftwareAssignmentTypeArr = data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchSoftwareAssignmentType;
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
									for (var i = 0; i < fetchedSoftwareAssignmentTypeArr.length; i++) {
										tooltip += fetchedSoftwareAssignmentTypeArr[i].DisplayName + ', ';

										var objSoftwareAssignmentType = new Object();
										objSoftwareAssignmentType.Name = fetchedSoftwareAssignmentTypeArr[i].Name;

										var multichoiceSource = getMultiCoiceFilterArr('SoftwareAssignmentType');
										var selectedSource = _.where(multichoiceSource, { ControlValue: fetchedSoftwareAssignmentTypeArr[i].SearchValue });
										objSoftwareAssignmentType.displaytext = selectedSource[0].Value;

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
										objvtpencryptionstatus.displaytext = selectedSource[0].Value;

										multiSelectedVTPEncryptionStatus.push(objvtpencryptionstatus);

									}
									EAdvancedSearchstatus.toolTip = tooltip;
									//ADSearchUtil.attributeDataArr.push(EAdvancedSearchstatus);

									//attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);
								}

								if (data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchAutoDownloadStatus) {
									var fetchedautodwnloadstatusArr = data.getAdvanedSearchResp.AdvancedSearch.AdvancedSearchAutoDownloadStatus;
									var EAdvancedSearchAutoDownload = new Object();

									EAdvancedSearchAutoDownload.DeviceSearchAttributeId = 0;
									EAdvancedSearchAutoDownload.SelectedDeviceSearchOperatorId = 0;
									EAdvancedSearchAutoDownload.SearchElementSeqNo = 0;
									EAdvancedSearchAutoDownload.SearchId = 0;
									EAdvancedSearchAutoDownload.ControlType = 'MultiCombo';
									EAdvancedSearchAutoDownload.ControlValues = '0';
									EAdvancedSearchAutoDownload.OperatorValue = 'Equal To';
									EAdvancedSearchAutoDownload.DisplayName = "Enable Automatic Download";
									EAdvancedSearchAutoDownload.AttributeName = "Enable Automatic Download";
									var tooltip = 'Equal To ';
									multiSelectedAutoDownloadEnbaled([]);
									for (var i = 0; i < fetchedautodwnloadstatusArr.length; i++) {
										tooltip += fetchedautodwnloadstatusArr[i].DisplayName + ', ';

										var objautodownloadstatus = new Object();
										objautodownloadstatus.Name = fetchedautodwnloadstatusArr[i].Name;

										var multichoiceSource = getMultiCoiceFilterArr('Enable Automatic Download');
										var selectedSource = _.where(multichoiceSource, { ControlValue: fetchedautodwnloadstatusArr[i].SearchValue });
										objautodownloadstatus.displaytext = selectedSource[0].Value;

										multiSelectedAutoDownloadEnbaled.push(objautodownloadstatus);

									}
									EAdvancedSearchstatus.toolTip = tooltip;
									//ADSearchUtil.attributeDataArr.push(EAdvancedSearchstatus);

									//attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);
								}

								//var tattr = AttributeData();
								//for (var i = 0; i < tattr.length; i++) {
								//    //alert('check===' + JSON.stringify(tattr[i]));
								//}
								if (data.getAdvanedSearchResp.AdvancedSearch.AdvanedSearchElement) {
									var elementArr = data.getAdvanedSearchResp.AdvancedSearch.AdvanedSearchElement;

									// var attrsourc1e = _.where(AttributeData(), { DeviceSearchAttributeId: elementArr[i].DeviceSearchAttributeId });


									for (var i = 0; i < elementArr.length; i++) {
										//var tattr = AttributeData();
										//for (var j = 0; j < tattr.length; j++) {
										//    //alert('check===' + JSON.stringify(tattr[j]));
										//}
										//var source1 = _.where(AttributeData(), { DeviceSearchAttributeId: 44 });
										//var source2 = _.where(AttributeData(), { DeviceSearchAttributeId: elementArr[i].DeviceSearchAttributeId });
										//alert( elementArr[i].DeviceSearchAttributeId);
										//alert('source2==' + JSON.stringify(source2[0]));

										var attrsource = _.where(backupAttributeData(), { DeviceSearchAttributeId: elementArr[i].DeviceSearchAttributeId });
										//alert('rrrrr==' + JSON.stringify(attrsource));
										//if (elementArr[i].DeviceSearchAttributeId == 44 || elementArr[i].DeviceSearchAttributeId==46) {
										//} else {
										//alert('in');
										//alert('attrsource===' + JSON.stringify(attrsource));
										var DeviceSearchElement = new Object();
										if (attrsource != '') {
											DeviceSearchElement.AttributeName = attrsource[0].AttributeName;
											DeviceSearchElement.IsMultiUse = attrsource[0].IsMultiUse;
											DeviceSearchElement.ControlType = attrsource[0].ControlType;
											DeviceSearchElement.DeviceSearchAttributeOperators = attrsource[0].DeviceSearchAttributeOperators;
											var opsource = _.where(attrsource[0].DeviceSearchAttributeOperators, { DeviceSearchOperatorId: elementArr[i].DeviceSearchOperatorId });
											//alert('opsource' + JSON.stringify(opsource))
											DeviceSearchElement.OperatorValue = opsource[0].Operator;
											if (attrsource[0].AttributeName == 'Name' || attrsource[0].AttributeName == 'PaymentAppName') {
												DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' Name : ' + elementArr[i].SearchValue + ' Version : ' + elementArr[i].SearchValueOptional1;
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



										//alert('DeviceSearchElement===' + JSON.stringify(DeviceSearchElement));

										ADSearchUtil.attributeDataArr.push(DeviceSearchElement);

										attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);

										//}


									}
									for (var i = 0; i < elementArr.length; i++) {
										var attrsource = _.where(backupAttributeData(), { DeviceSearchAttributeId: elementArr[i].DeviceSearchAttributeId });
										//alert('====' + JSON.stringify(attrsource));
										if (attrsource[0].IsMultiUse == false) {
											//alert('for remove');                                      

											var implementedArr = AttributeData();
											implementedArr = _.reject(implementedArr, function (el) { return el.AttributeName === attrsource[0].AttributeName; });

											//AttributeData.remove(attrsource[0]);
											AttributeData(implementedArr);

										}
									}

								}
							}

							$("#txtSearchName").val(data.getAdvanedSearchResp.AdvancedSearch.SearchName);

							if (flageForEdit() == false) {
								$("#txtSearchName").val('');
								// $("#btnSave").removeAttr('disabled');
							}
							//flageForCopy(false);
							flageForEdit(false);

						}

					} else if (data.responseStatus.StatusCode == AppConstants.get('SYSTEM_BUSY')) {
						openAlertpopup(2, 'system_busy_try_again');
					} else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
						Token_Expired();
					}
				}
				if (error) {
					AdvancedOpenAlertPopup(2, 'network_error');
				}
			}


			var params = '{"token":"' + TOKEN() + '","getAdvanedSearchReq":' + JSON.stringify(getAdvanedSearchReq) + '}';
			ajaxJsonCall("GetAdvancedSearch", params, callbackFunction, true, 'POST', true);
		}

		function setDeviceSearchAttributes(gId, AttributeData, attributeType, backupAttributeData, backupAttributeData1) {
			if (_.isEmpty(deviceAttributesDataDeviceSearch)) {
				deviceAttributesDataDeviceSearch = JSON.parse(window.localStorage.getItem("SearchAttributes"));
			}
			var category = attributeType;
			var attributeArray = new Array();
			attributeArray = deviceAttributesDataDeviceSearch;
			if (deviceAttributesDataDeviceSearch && deviceAttributesDataDeviceSearch.length > 0) {
				attributeArray.sort(function (a, b) { return a.DisplayName.toUpperCase() > b.DisplayName.toUpperCase() ? 1 : -1; });
				ADSearchUtil.deviceAttributesData = new Array();

				//Advanced Search
				for (var i = 0; i < deviceAttributesDataDeviceSearch.length; i++) {
					if (ADSearchUtil.AdScreenName == 'deletedDevice' && (deviceAttributesDataDeviceSearch[i].DisplayName == 'Device Status' || deviceAttributesDataDeviceSearch[i].DisplayName == 'Sub Status')) {
						continue;
					} else {
						ADSearchUtil.deviceAttributesData.push(attributeArray[i]);
						if (attributeArray[i].DisplayName == "VHQ Version")
							attributeArray[i].DisplayName = "Agent Version";

						// CustomAttributeData.push(attributeArray[i].DisplayName);

						backupAttributeData.push(attributeArray[i]);
						backupAttributeData1.push(attributeArray[i]);
					}
				}
				ADSearchUtil.deviceAttributesData.sort(function (a, b) { return a.DisplayName > b.DisplayName ? 1 : -1; });
				backupAttributeData.sort(function (a, b) { return a.DisplayName > b.DisplayName ? 1 : -1; });
				backupAttributeData1.sort(function (a, b) { return a.DisplayName > b.DisplayName ? 1 : -1; });
			}
			var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
			if (adStorage && adStorage.length > 0)
				generateAdvanceForSaveState(0, self.hierarchyPathStorage, self.criteriaGroups, self.attrbuteCriteriaArr, self.AttributeData, self.checkAccessType, self.flageForEdit, self.multiselctedModels, self.multiselctedDeviceStatus, self.flageForCopy, self.backupAttributeData1, adStorage[0]);
			AttributeData([]);
			AttributeData(ADSearchUtil.deviceAttributesData);
		}
		seti18nResourceData(document, resourceStorage);
	};




	///end viewmodel

	function getSelectedDeviceList(gId, status) {
		var arr = new Array();
		selectedArr = getMultiSelectedData(gId);
		for (var i = 0; i < selectedArr.length; i++) {
			var DeviceStatusUpdate = new Object();
			DeviceStatusUpdate.DeviceId = selectedArr[i].DeviceId;
			DeviceStatusUpdate.ModelName = selectedArr[i].ModelName;
			DeviceStatusUpdate.SerialNumber = selectedArr[i].SerialNumber;
			DeviceStatusUpdate.Protocol = selectedArr[i].Protocol;
			DeviceStatusUpdate.Status = status;
			DeviceStatusUpdate.UniqueDeviceId = selectedArr[i].UniqueDeviceId;
			DeviceStatusUpdate.IsSoftwareAssigned = selectedArr[i].IsSoftwareAssigned;
			DeviceStatusUpdate.IsEnabledForAutoDownload = selectedArr[i].IsEnabledForAutoDownload;
			DeviceStatusUpdate.HierarchyId = selectedArr[i].HierarchyId;
			DeviceStatusUpdate.ModelId = selectedArr[i].ModelId;
			DeviceStatusUpdate.IsDirectReferenceSetAssigned = selectedArr[i].IsDirectReferenceSetAssigned;
			DeviceStatusUpdate.InternalModelName = selectedArr[i].InternalModelName;
			DeviceStatusUpdate.Family = selectedArr[i].Family;
			DeviceStatusUpdate.AssignmentType = selectedArr[i].AssignmentType;
			arr.push(DeviceStatusUpdate);
			globalVariableForDeviceSearch = arr;
		}

		return globalVariableForDeviceSearch;
	}

	function UpdateDevice(status, updateDeviceReq, gId) {

		// New Added
		updateDeviceReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					openAlertpopup(0, 'alert_device_updated_success');
					gridFilterClear(gId);
				}
			}
		}
		var method = 'UpdateDevice';
		var params = '{"token":"' + TOKEN() + '","updateDeviceReq":' + JSON.stringify(updateDeviceReq) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', true)

	}

	function UpdateDeviceStatus(status, updateDeviceStatusReq, gId) {


		updateDeviceStatusReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (status == 5) {
						openAlertpopup(0, 'alert_device_delete_success');
					}
					if (status == 6) {
						openAlertpopup(0, 'alert_device_black_success');
					}
					gridFilterClear(gId);
				}
			}
		}
		var method = 'UpdateDeviceStatus';
		var params = '{"token":"' + TOKEN() + '","updateDeviceStatusReq":' + JSON.stringify(updateDeviceStatusReq) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', true)

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

	function setExportDevices(exportDevicesReq) {
		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

				}
			}
		}
		var method = 'ExportDevices';
		var params = '{"token":"' + TOKEN() + '","ExportDevicesReq":' + JSON.stringify(exportDevicesReq) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
	}

	//for grid
	function genericBuildFilterPanelFordateDevice(filterPanel, datafield, dataAdapter, gId) {
		var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');
		var storedFilterVal = new Object();
		for (i = 0; i < filterInfo.length; i++) {
			if (filterInfo[i].filtercolumn == datafield) {
				var source = filterInfo[i].filter.getfilters()[0].value;
				storedFilterVal.FilterDays = source[0].FilterDays;
				storedFilterVal.FilterValue = source[0].FilterValue;
				storedFilterVal.FilterValueOptional = source[0].FilterValueOptional;
			}
		}
		var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
		var strinput = '';
		strinput += '<div class="grid-pop" style="width:189px;">';
		strinput += '<div class="con-area" style="padding:5px">';
		strinput += '<form class="form-inline">';
		strinput += '<div class="form-group">';
		strinput += '<label class="inline-adjust">' + i18n.t('last', { lng: lang }) + '</label>';
		strinput += '</div>';
		strinput += '<div class="input-group spinner" style="padding-left:5px;padding-right:5px" data-trigger="spinner">';
		if (storedFilterVal.FilterDays == null || storedFilterVal.FilterDays == 'undefined') {
			strinput += '<input type="text" id=' + gId + datafield + "fixedrangeInput" + ' data-bind="enable:dateDownload" style="width:46px;" class="form-control" value="1" data-rule="hour">';
		} else {
			strinput += '<input type="text" id=' + gId + datafield + "fixedrangeInput" + ' data-bind="enable:dateDownload" style="width:46px;" class="form-control" value="' + storedFilterVal.FilterDays + '" data-rule="hour">';
		}
		strinput += '<div class="input-group-addon">';
		strinput += '<a href="javascript:;" class="spin-up" data-spin="up"><i class="icon-angle-up"></i></a>';
		strinput += '<a href="javascript:;" class="spin-down" data-spin="down"><i class="icon-angle-down"></i></a>';
		strinput += '</div>';
		strinput += '</div>';
		strinput += '<div class="form-group" >';
		strinput += '<label class="inline-adjust">' + i18n.t('license_password_expiry_days', { lng: lang }) + '</label>';
		strinput += '</div>';
		strinput += '</form>';
		strinput += '<div style="padding-top:6px">';
		strinput += '<label>';
		var fixedrangeid = "'" + gId + datafield + "'";
		var funcGridId = "'" + gId + "'";
		var funcfieldId = "'" + datafield + "'";
		strinput += '<input class="checkbox" id=' + gId + datafield + "fixedrange" + ' onchange="enableTextbox(' + fixedrangeid + ')"  type="checkbox" value="0"> ' + i18n.t('fixed_date_range', { lng: lang }) + '';
		strinput += '</label>';
		strinput += '</div>';
		strinput += '<div class="form-group"  >';
		strinput += ' <label>' + i18n.t('frmDate', { lng: lang }) + '</label>';
		strinput += ' <input type="text" id=' + gId + datafield + "frmDate" + ' disabled=true class="form-control datepics" placeholder="MM-DD-YYYY">';
		strinput += '</div>';
		strinput += '<div class="form-group">';
		strinput += '<label>' + i18n.t('toDate', { lng: lang }) + '</label>';
		strinput += '<input type="text" id=' + gId + datafield + "toDate" + ' disabled=true class="form-control datepics" placeholder="MM-DD-YYYY">';
		strinput += ' </div>';
		strinput += '</div>';
		strinput += '<div class="btn-footer" style="padding:9px">';
		strinput += '<button id="' + gId + datafield + 'btndateClear" disabled=true class="btn btn-default">' + i18n.t('reset', { lng: lang }) + '</button>';
		strinput += '<button id="' + gId + datafield + 'btndateFilter" onclick="applydatefilter(' + funcfieldId + ',' + funcGridId + ',' + fixedrangeid + ')"  class="btn btn-primary">' + i18n.t('go', { lng: lang }) + '</button>';
		strinput += '</div>';
		strinput += '</div>';
		inputdiv.append(strinput);
		filterPanel.append(inputdiv);
		$('[data-trigger="spinner"]').spinner();

		$("#" + gId + datafield + "toDate").datepicker({ autoclose: true, dateFormat: currentDateShort });
		$("#" + gId + datafield + "frmDate").datepicker({ autoclose: true, dateFormat: currentDateShort });

		$("#" + gId + datafield + "toDate").prop('value', storedFilterVal.FilterValueOptional);
		$("#" + gId + datafield + "frmDate").prop('value', storedFilterVal.FilterValue);
		if (filterInfo.length > 0) {
			$("#" + gId + datafield + "btndateClear").prop('disabled', false);
		}
		var dataSource =
		{
			localdata: dataAdapter.records,
			async: false
		}
		var dataadapter = new $.jqx.dataAdapter(dataSource,
			{
				autoBind: false,
				autoSort: true,
				async: false,
				uniqueDataFields: [datafield]
			});
		var column = $("#" + gId).jqxGrid('getcolumn', datafield);
		$("#" + gId + datafield + "frmDate").datepicker().on('changeDate', function (ev) {
			if (moment().isAfter($("#" + gId + datafield + "frmDate").val())) {
				$("#" + gId + datafield + "frmDate").change();
			}
		});

		$("#" + gId + datafield + "frmDate").change(function () {
			if (moment().isAfter($("#" + gId + datafield + "frmDate").val())) {
				$("#" + gId).jqxGrid('openmenu', datafield);
			}

		});

		$("#" + gId + datafield + "btndateClear").on("click", function () {
			$("#" + gId).jqxGrid('removefilter', datafield);
			$("#" + gId).jqxGrid('closemenu');
		});
		$(" #gridmenu" + gId + " ul li:first").css("display", "none")
		$(" #gridmenu" + gId + " ul li:nth-child(1)").css("display", "none")
		$(" #gridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
		$(" #gridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
		$(" #gridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
		$(" #gridmenu" + gId).css("background-color", "transparent");

	}

	//get advance search object from session storage
	function getAdvanceSearchStorage(gId) {
		var advanceSearchStorage = JSON.parse(window.sessionStorage.getItem(gId + "adStorage"));
		return advanceSearchStorage;
	}

	//update advance search object in session storage
	function setAdvanceSearchStorage(gId, adStorage, deviceSearch, type) {
		var updatedAdvanceSearchStorage = JSON.stringify(adStorage);
		window.sessionStorage.setItem(gId + 'adStorage', updatedAdvanceSearchStorage);
		updateAdSearchObj(gId, deviceSearch, type);
	}

	//get advance search object from session storage
	function getGridStorage(gId) {
		var gridStorage = JSON.parse(window.sessionStorage.getItem(gId + "gridStorage"));
		return gridStorage;
	}

	//get custom search object from session storage
	function getCustomSearchStorage(gId) {
		var customSearchObject = new Object();
		var customSearch = JSON.parse(window.sessionStorage.getItem(gId + "customSearch"));
		var customSearchText = window.sessionStorage.getItem(gId + "CustomSearchText");
		var customSearchCriteria = window.sessionStorage.getItem(gId + "CustomSearchCriteria");
		customSearchObject.customSearch = customSearch;
		customSearchObject.customSearchText = customSearchText;
		customSearchObject.customSearchCriteria = customSearchCriteria;

		return customSearchObject;
	}

	//set custom search object in session storage
	function setCustomSearchStorage(gId, advanceSearchUtil) {
		sessionStorage.setItem(gId + 'customSearch', JSON.stringify(advanceSearchUtil.deviceSearchObj));
		if (advanceSearchUtil.SearchText) {
			window.sessionStorage.setItem(gId + 'CustomSearchText', advanceSearchUtil.SearchText);
			window.sessionStorage.setItem("CustomSearchText", advanceSearchUtil.SearchText);
		}
		if (advanceSearchUtil.SearchCriteria) {
			window.sessionStorage.setItem(gId + 'CustomSearchCriteria', advanceSearchUtil.SearchCriteria);
		}
	}

	//build Device Search object to get data for VeriCare selected model
	function getDeviceSearchForCare(gId, models, hierarchyName, hierarchyIds, groupName, groupIds) {
		var searchText = '';
		if (!_.isEmpty(groupName) && !_.isEmpty(groupIds)) {
			searchText += 'Search Type = Group <br/>';
			searchText += 'Group = ';
			searchText += groupName + ' <br/>';
		} else if (!_.isEmpty(hierarchyName)) {
			searchText += 'Search Type = Hierarchy <br/>';
			searchText += 'Hierarchy = ';
			searchText += hierarchyName + ' <br/>';
		}

		if (careData.chartValue !== '') {
			searchText += careData.identifier + ' = ';
			searchText += careData.chartValue + ' <br/>';
		} else if (careData.barValue !== '') {
			var identifier = careData.identifier === 'Health' ? 'Device Warnings' : (careData.identifier === 'Software' ? 'Device Versions' : 'Device State');
			searchText += identifier + ' = ';
			searchText += careData.barValue + ' <br/>';
		}

		var DeviceSearch = new Object();
		DeviceSearch.DeviceStatus = new Array();
		DeviceSearch.GroupIds = groupIds;
		DeviceSearch.HierarchyIdsWithChildren = hierarchyIds;
		DeviceSearch.HierarchyIdsWithoutChildren = new Array();
		DeviceSearch.IsHierarchiesSelected = !_.isEmpty(hierarchyIds) ? true : false;
		DeviceSearch.SelectedHeaders = selectedColumns;
		DeviceSearch.IsOnlyDeleteBlacklisted = false;
		DeviceSearch.IsPrivateSearch = true;
		DeviceSearch.SearchCriteria = null;
		DeviceSearch.SearchElements = new Array();
		DeviceSearch.SearchModels = models;
		DeviceSearch.SearchName = null;
		DeviceSearch.SearchID = 0;
		DeviceSearch.SearchText = searchText;
		DeviceSearch.SearchType = ENUM.get('ADVANCED');

		var advanceSearchStorage = getAdvanceSearchStorage(gId);
		if (!_.isEmpty(advanceSearchStorage)) {
			advanceSearchStorage[0].searchText = DeviceSearch.SearchText;
			advanceSearchStorage[0].isAdSearch = 1;
			advanceSearchStorage[0].quickSearchName = '';
		}
		setAdvanceSearchStorage(gId, advanceSearchStorage, DeviceSearch, 0);

		ADSearchUtil.deviceSearchObj = DeviceSearch;
		ADSearchUtil.SearchText = DeviceSearch.SearchText;
		ADSearchUtil.SearchCriteria = '';
		setCustomSearchStorage(gId, ADSearchUtil);

		isSearchReset = false;
	}

	//build Device Search object to get data for User Personalized search
	function getDeviceSearchForPersonalization(gId, globalUserPreferenceObject) {
		var DeviceSearch = new Object();
		DeviceSearch.DeviceStatus = new Array();
		DeviceSearch.GroupIds = new Array();
		DeviceSearch.HierarchyIdsWithChildren = new Array();
		DeviceSearch.HierarchyIdsWithoutChildren = new Array();
		DeviceSearch.IsHierarchiesSelected = false;
		DeviceSearch.SelectedHeaders = selectedColumns;
		DeviceSearch.IsOnlyDeleteBlacklisted = false;
		DeviceSearch.IsPrivateSearch = true;
		DeviceSearch.SearchCriteria = null;
		DeviceSearch.SearchElements = new Array();
		DeviceSearch.SearchModels = new Array();
		DeviceSearch.SearchName = null;
		DeviceSearch.SearchID = globalUserPreferenceObject.DefaultSearchId;
		DeviceSearch.SearchText = globalUserPreferenceObject.DefaultSearchText;
		DeviceSearch.SearchType = ENUM.get('ADVANCED');

		var advanceSearchStorage = getAdvanceSearchStorage(gId);
		if (!_.isEmpty(advanceSearchStorage)) {
			advanceSearchStorage[0].searchText = DeviceSearch.SearchText;
			advanceSearchStorage[0].isAdSearch = 1;
			advanceSearchStorage[0].quickSearchName = '';
		}
		setAdvanceSearchStorage(gId, advanceSearchStorage, DeviceSearch, 1);

		ADSearchUtil.deviceSearchObj = DeviceSearch;
		ADSearchUtil.SearchText = globalUserPreferenceObject.DefaultSearchText;
		ADSearchUtil.SearchCriteria = globalUserPreferenceObject.DefaultSearchText;
		setCustomSearchStorage(gId, ADSearchUtil);

		isSearchReset = false;
	}

	//build Device Search object for saved search
	function getDeviceSearchForSavedSearch(gId, advanceSearchStorage) {
		var DeviceSearch = new Object();
		DeviceSearch.DeviceStatus = new Array();
		DeviceSearch.GroupIds = new Array();
		DeviceSearch.HierarchyIdsWithChildren = new Array();
		DeviceSearch.HierarchyIdsWithoutChildren = new Array();
		DeviceSearch.IsHierarchiesSelected = false;
		DeviceSearch.SelectedHeaders = selectedColumns;
		DeviceSearch.IsOnlyDeleteBlacklisted = false;
		DeviceSearch.IsPrivateSearch = true;
		DeviceSearch.SearchCriteria = null;
		DeviceSearch.SearchElements = new Array();
		DeviceSearch.SearchModels = new Array();
		DeviceSearch.SearchName = null;
		DeviceSearch.SearchID = 0;
		DeviceSearch.SearchText = '';
		DeviceSearch.SearchType = ENUM.get('ADVANCED');

		advanceSearchStorage[0].searchText = DeviceSearch.SearchText;
		advanceSearchStorage[0].isAdSearch = 1;
		advanceSearchStorage[0].quickSearchName = '';
		setAdvanceSearchStorage(gId, advanceSearchStorage, DeviceSearch, 0);

		ADSearchUtil.deviceSearchObj = DeviceSearch;
		ADSearchUtil.SearchText = !_.isEmpty(globalUserPreferenceObject) ? globalUserPreferenceObject.DefaultSearchText : '';
		ADSearchUtil.SearchCriteria = !_.isEmpty(globalUserPreferenceObject) ? globalUserPreferenceObject.DefaultSearchText : '';
		setCustomSearchStorage(gId, ADSearchUtil);

		isSearchReset = false;
	}

	function getSearchObject(hierarchyPath, attrbutes, criteriaGroups) {
		//careData session will be available only on redirection from Care Dashboard to Device Search
		if (!_.isEmpty(window.sessionStorage.getItem('careData'))) {
			careData = window.sessionStorage.getItem('careData');
			careData = JSON.parse(careData);
			clearPreviousCareSearch(hierarchyPath, attrbutes, criteriaGroups);
		}

		initGridStorageObj("Devicejqxgrid");
		if (!_.isEmpty(careData)) {
			var hierarchyIds = new Array();
			var groupIds = new Array();
			var hierarchyName = careData.hierarchyName;
			var groupName = careData.groupName;

			if (careData.groupId > 0) {
				groupIds.push(careData.groupId);
			} else if (careData.hierarchyId > 0) {
				hierarchyIds.push(careData.hierarchyId);
			}

			careSearchObject = new Object();
			careSearchObject = getCareData(careData);

			var models = new Array();
			if (careSearchObject.Identifier == 'model') {
				careSearchObject.Identifier = AppConstants.get('DEVICES');
				careModelData = careSearchObject.ChartValue;

				if (!_.isEmpty(careModelData)) {		//if devices donut chart is clicked
					var careModels = new Array();
					if (careModelData.indexOf(',') > -1) {
						careModels = careModelData.split(',');
					} else {
						careModels.push(careModelData);
					}
					for (var i = 0; i < careModels.length; i++) {
						//var source = _.where(koUtil.rootmodels, { ModelName.toUpperCase() : careModels[i].toUpperCase() });
						var source = _.filter(koUtil.rootmodels, function (item) {
							return item.ModelName.toUpperCase() == careModels[i].toUpperCase();
						});
						var model = new Object();
						model.ModelId = !_.isEmpty(source) ? source[0].ModelId : 0;
						model.ModelName = !_.isEmpty(source) ? source[0].ModelName : '';
						models.push(model);
					}

				}
			}

			isDeviceSearchWithAdvanceSearch = true;
			getDeviceSearchForCare('Devicejqxgrid', models, hierarchyName, hierarchyIds, groupName, groupIds);
		} else if (!isDefaultSearchApplied && !_.isEmpty(globalUserPreferenceObject) && globalUserPreferenceObject.DefaultSearchId > 0) {	//if user personalized landing screen/search
			getDeviceSearchForPersonalization('Devicejqxgrid', globalUserPreferenceObject);
		}
	}

	//clear careData filter, if previously applied
	function clearPreviousCareSearch(hierarchyPath, attrbutes, criteriaGroups) {
		globalAdvancedSearch = new Object();
		ADSearchUtil.deviceSearchObj = new Object();
		hierarchyPath([]);
		ADSearchUtil.attributeDataArr = [];
		attrbutes([]);
		criteriaGroups([]);
		ADSearchUtil.resetAddSerchFlag = 'reset';
		koUtil.isHierarchyModified(false);
		koUtil.isAttributeModified(false);
		koUtil.savedSearchId = 0;
		isAdvancedSavedSearchApplied = false;
		isSearchReset = true;
		isReset = true;

		//for care data, clear grid storage, if any
		var mysession = window.sessionStorage;
		if (!_.isEmpty(mysession) && mysession.length > 0) {
			for (var i = 0; i < mysession.length; i++) {
				if (mysession.key(i) === "DevicejqxgridgridStorage") {
					window.sessionStorage.removeItem(mysession.key(i));
					break;
				}
			}
		}
		var DeviceSearch = new Object();
		DeviceSearch.SelectedHeaders = selectedColumnsClone;
		updateAdSearchObj('Devicejqxgrid', DeviceSearch, 2);
	}

	function blankDeviceGrid(gID, param, hierarchyPathStorage, attributeArray, criteriaGroups, modelPopup, flagBlankDeviceGrid, multiselctedModels, multiselctedDeviceStatus, multiselctedSubStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, AdvanceTemplateFlag, deviceSubStatusData, multiSelectedAutoDownloadEnbaled, careSearch, multiSelectedSoftwareAssignmentType) {
		flagBlankDeviceGrid(true);
		ADSearchUtil.gridIdForAdvanceSearch = gID;
		var gridColumns = [];
		var sourceDataFieldsArr = [{ name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
		{ name: 'SerialNumber', map: 'DeviceDetail>SerialNumber' },
		{ name: 'DeviceId', map: 'DeviceDetail>DeviceId' },
		{ name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath', type: 'string' },
		{ name: 'ModelName', map: 'DeviceDetail>ModelName' },
		{ name: 'ComputedDeviceStatus', map: 'DeviceDetail>ComputedDeviceStatus' },
		{ name: 'LastHeartBeat', map: 'DeviceDetail>LastHeartBeat', type: 'date' },
		{ name: 'ModelStatus', map: 'DeviceDetail>ModelStatus' },
		{ name: 'SoftwareStatus', map: 'DeviceDetail>SoftwareStatus' },
		{ name: 'HealthStatus', map: 'DeviceDetail>HealthStatus' },
		{ name: 'HealthAlerts', map: 'DeviceDetail>HealthAlerts' },
		{ name: 'isSelected', type: 'number' }];

		var gridStorage = getGridStorage("Devicejqxgrid");

		var source =
		{
			dataType: "json",
			dataFields: sourceDataFieldsArr,
			root: 'Devices',
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data.getDevicesResp && data)
					data.getDevicesResp = $.parseJSON(data.getDevicesResp);
				else
					data.getDevicesResp = [];

				if (data.getDevicesResp && data.getDevicesResp.PaginationResponse) {

					source.totalrecords = data.getDevicesResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getDevicesResp.PaginationResponse.TotalPages;

				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
				}
			},

		};

		var datasource =
		{
			dataType: "json",
			dataFields: sourceDataFieldsArr,
			contentType: 'application/json'
		};


		var request = {

			formatData: function (data) {

				if (!isAdvancedSavedSearchApplied || koUtil.isSearchCancelled() == true) {
					$('.all-disabled').show();
				}
				disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
				var columnSortFilter = new Object();
				columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'DeviceSearchFilter');
				koUtil.GlobalColumnFilter = columnSortFilter;
				globalColumnFilter = columnSortFilter;

				param.getDevicesReq.ColumnSortFilter = columnSortFilter;
				param.getDevicesReq.Pagination = getPaginationObject(param.getDevicesReq.Pagination, gID);
				param.getDevicesReq.IsIncludeCareData = isCareEnabled ? (!_.isEmpty(globalUserPreferenceObject) ? globalUserPreferenceObject.ShowCareDataInDeviceSearch : true) : false;

				$("#resetBtnForAdSearch").css("display", "none");
				var advanceSearchStorage = getAdvanceSearchStorage("Devicejqxgrid");
				//if (!_.isEmpty(advanceSearchStorage)) {
				//	if (advanceSearchStorage[0].adSearchObj) {
				//		checkloadingforDeviceSearch = 1;
				//		if (advanceSearchStorage[0].isAdSearch == 0) {
				//			if (advanceSearchStorage[0].adSearchObj) {
				//				ADSearchUtil.deviceSearchObj = advanceSearchStorage[0].adSearchObj;
				//				attributeArray(ADSearchUtil.attributeDataArr);

				//				if (ADSearchUtil.deviceSearchObj.SearchText != null && ADSearchUtil.deviceSearchObj.SearchText != "<br/>") {
				//					$("#advanceCriteria").removeClass('quickCriHide');
				//					$("#advanceCriteria").css("display", "block");
				//					$("#resetBtnForAdSearch").css("display", "inline");
				//				}
				//			} else {
				//				ADSearchUtil.deviceSearchObj = null;
				//			}
				//			if (advanceSearchStorage[0].AdvancedSearchGroup) {
				//				criteriaGroups(advanceSearchStorage[0].AdvancedSearchGroup);
				//				$("#advanceCriteria").removeClass('quickCriHide');
				//				$("#advanceCriteria").css("display", "block");
				//			}
				//		} else if (advanceSearchStorage[0].quickSearchObj || (advanceSearchStorage[0].quickSearchName && advanceSearchStorage[0].quickSearchName != "")) {
				//			ADSearchUtil.deviceSearchObj = advanceSearchStorage[0].quickSearchObj;
				//			$("#advanceCriteria").removeClass('quickCriHide');
				//			$("#resetBtnForAdSearch").css("display", "inline");
				//			$("#deviceCriteriaDiv").css("display", "block");
				//			$("#deviceCriteriaDiv").removeClass('hide');
				//		} else {
				//			ADSearchUtil.deviceSearchObj = null;
				//		}

				//		var customSearchStorage = getCustomSearchStorage(gID);
				//		if (_.isEmpty(customSearchStorage)) {
				//			var searchtext = "";
				//			if (customSearchStorage.customSearchText)
				//				searchtext = customSearchText;
				//			else if (customSearchStorage.customSearchCriteria)
				//				searchtext = customSearchCriteria;
				//			$("#deviceCriteriaDiv").empty().show().html(searchtext);
				//		}
				//	} else {
				//		$("#advanceCriteria").removeClass('quickCriHide');
				//		$("#resetBtnForAdSearch").css("display", "inline");
				//		$("#deviceCriteriaDiv").css("display", "block");
				//		$("#deviceCriteriaDiv").removeClass('hide');
				//		$("#deviceCriteriaDiv").empty();
				//		$("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
				//	}
				//}
				updatepaginationOnState("Devicejqxgrid", gridStorage, param.getDevicesReq.Pagination, ADSearchUtil.deviceSearchObj, advanceSearchStorage);
				param.getDevicesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
				data = JSON.stringify(param);
				$(".advance-search-result").removeClass("dn");
				if (isDeviceSearchWithAdvanceSearch == true || (!isDefaultSearchApplied && globalUserPreferenceObject && globalUserPreferenceObject.DefaultSearchId > 0)) {
					isDeviceSearchWithAdvanceSearch = true;
					flagBlankDeviceGrid(false);
					DeviceGrid("Devicejqxgrid", param, hierarchyPathStorage, attributeArray, criteriaGroups, modelPopup, multiselctedModels, multiselctedDeviceStatus, multiselctedSubStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, deviceSubStatusData, multiSelectedAutoDownloadEnbaled, careSearch, multiSelectedSoftwareAssignmentType);
				} else {
					$('.all-disabled').hide();

					if (selectedColumns.length > 0) {
						for (var i = 0; i < selectedColumns.length; i++) {
							var columnObj = new Object();
							columnObj.text = i18n.t(selectedColumns[i].DisplayName, { lng: lang });
							columnObj.datafield = selectedColumns[i].AttributeName;
							columnObj.editable = false;
							columnObj.minwidth = 200;
							columnObj.width = 'auto';
							columnObj.enabletooltips = true;
							columnObj.filterable = false;
							columnObj.sortable = false;
							columnObj.menu = false;

							gridColumns.push(columnObj);
						}
					}
					gridColumns = setUserPreferencesColumns('DeviceSearch', userResizedColumns, gridColumns);

					setTimeout(function () {
						AdvanceTemplateFlag(true);
						var controllerId = "genericPopup";
						var elementname = "modelAdvancedSearch";

						if (!ko.components.isRegistered(elementname)) {
							var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
							var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
							ko.components.register(elementname, {
								viewModel: { require: ViewName },
								template: { require: 'plugin/text!' + htmlName }
							});
						}
						modelPopup(elementname);
						$(document).ready(function () {
							$('#AdvanceSearchModal').modal('show');
						});
					}, 1000);
				}
				isDefaultSearchApplied = true;
				return data;
			}
		}
		var dataAdapter = intializeDataAdapter(source, request);

		var rendered = function (element) {
			var retval = autho.checkRightsBYScreen('Global Operations', 'IsModifyAllowed');
			enablegridfunctions(gID, 'UniqueDeviceId', element, gridStorage, true, 'pagerDiv', true, 0, 'UniqueDeviceId', null, null, null, null, 'deviceSearchCheck', retval);
			return true;
		}

		//for device profile
		var SerialNoRendereDeviceSearch = function (row, columnfield, value, defaulthtml, columnproperties) {
			var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
			return html;
		}

		gridColumns = [
			{
				text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false, draggable: false,
				datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
					return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
				}, rendered: rendered
			},

			{
				text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 130, width: 'auto', enabletooltips: false,
				cellsrenderer: SerialNoRendereDeviceSearch, filterable: false, sortable: false, menu: false
			},
			{
				text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 130, width: 'auto', enabletooltips: false,
				cellsrenderer: SerialNoRendereDeviceSearch, filterable: false, sortable: false, menu: false
			},
			{
				text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 100, width: 'auto', enabletooltips: false,
				filterable: false, sortable: false, menu: false
			},
			{
				text: i18n.t('software', { lng: lang }), datafield: 'SoftwareStatus', editable: false, minwidth: 100, width: 'auto', enabletooltips: false,
				filterable: false, sortable: false, menu: false, hidden: true
			},
			{
				text: i18n.t('health_alerts', { lng: lang }), datafield: 'HealthAlerts', editable: false, minwidth: 100, width: 'auto', enabletooltips: false,
				filterable: false, sortable: false, menu: false, hidden: true
			},
			{
				text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 220, width: 'auto', enabletooltips: false,
				filterable: false, sortable: false, menu: false
			},
			{
				text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 180, width: 'auto',
				filterable: false, sortable: false, menu: false
			},
			{
				text: i18n.t('last_heartBeat', { lng: lang }), datafield: 'LastHeartBeat', editable: false, minwidth: 180, width: 'auto', cellsformat: LONG_DATETIME_GRID_FORMAT,
				filterable: false, sortable: false, menu: false
			}
		];
		$("#" + gID).on('bindingcomplete', function (event) {
			var columns = GetExportVisibleColumn(gID);
			visibleColumnsList = columns;
			$("#" + gID).jqxGrid('focus');
		});
		$("#" + gID).jqxGrid(
			{
				width: "100%",
				pageable: true,
				editable: true,
				source: dataAdapter,
				altRows: true,
				virtualmode: true,
				pageSize: AppConstants.get('ROWSPERPAGE'),
				filterable: false,
				sortable: false,
				columnsResize: true,
				columnsreorder: true,
				selectionmode: 'singlerow',
				theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				autoshowloadelement: false,
				enablekeyboarddelete: false,
				enabletooltips: true,
				rowsheight: 32,
				autoshowfiltericon: false,
				columns: gridColumns,
				rendergridrows: function () {
					return dataAdapter.records;
				},
				ready: function () {
					var columns = GetExportVisibleColumn(gID);
					visibleColumnsList = columns;

					// custom search
					if ($("#idCustomSearch").val() != "") {
						var isCustomSearchCriteria = sessionStorage.getItem('CustomSearchCriteria');

						if (isCustomSearchCriteria)
							$("#deviceCriteriaDiv").empty().show().html(isCustomSearchCriteria);

					}

					if (isDeviceSearchWithAdvanceSearch == false) {
						$('.all-disabled').hide();
						$("#loader1").hide();
					}
					var gridheight = $(window).height();
					if (gridheight > 600) {
						gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 68;
					} else {
						gridheight = '400px';
					}

					var showHideColList = sessionStorage.getItem(gID + "ShowHideCol");
					if (showHideColList) {
						var showHide = $.parseJSON(showHideColList);
						for (var i = 0; i < showHide.length; i++) {
							$("#" + gID).jqxGrid('hidecolumn', showHide[i]);
						}
					}
					if (isCareEnabled && (_.isEmpty(globalUserPreferenceObject) || globalUserPreferenceObject.ShowCareDataInDeviceSearch)) {
						$("#" + gID).jqxGrid('showcolumn', 'SoftwareStatus');
						$("#" + gID).jqxGrid('showcolumn', 'HealthAlerts');
					}

					$("#" + gID).jqxGrid({ height: gridheight });
					if ($("#txtQuickSearchDevice").val() != "")
						$("#SaveSearchReset").show();
					if (isDeviceSearchWithAdvanceSearch == false) {
						setTimeout(function () {
							var localizationObj = {};
							localizationObj.emptydatastring = i18n.t("no_default_data_for_deviceSearch", { lng: lang });
							$("#" + gID).jqxGrid('localizestrings', localizationObj);
						}, 1000);

					}
				},
			});

		var retval = autho.checkRightsBYScreen('Global Operations', 'IsModifyAllowed');
		getGridBiginEdit(gID, 'UniqueDeviceId', gridStorage, 'deviceSearchCheck', retval);

		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'UniqueDeviceId');
		globalGridIdForState = { "gName": gID };

		var localizationObj = {};
		localizationObj.emptydatastring = i18n.t(" ", { lng: lang });
		$("#" + gID).jqxGrid('localizestrings', localizationObj);
		if (isDeviceSearchWithAdvanceSearch == false) {
			setTimeout(function () {
				var localizationObj = {};
				localizationObj.emptydatastring = i18n.t("no_default_data_for_deviceSearch", { lng: lang });
				$("#" + gID).jqxGrid('localizestrings', localizationObj);

			}, 1000);

		}
	}

	function DeviceGrid(gID, param, hierarchyPathStorage, attributeArray, criteriaGroups, modelPopup, multiselctedModels, multiselctedDeviceStatus, multiselctedSubStatus, multiSelectedModeOfConnectivity, multiSelectedVTPEncryptionStatus, deviceSubStatusData, multiSelectedAutoDownloadEnbaled, careSearch, multiSelectedSoftwareAssignmentType) {
		$("#Devicejqxgrid").removeClass("dn");
		$("#blankDevicejqxgrid").addClass("dn");
		ADSearchUtil.gridIdForAdvanceSearch = gID;
		var gridColumns = [];
		var DynamicColumns = [];
		var initfieldsArr = [];
		var sourceDataFieldsArr = [{ name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
		{ name: 'SerialNumber', map: 'DeviceDetail>SerialNumber' },
		{ name: 'DeviceId', map: 'DeviceDetail>DeviceId' },
		{ name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath', type: 'string' },
		{ name: 'LastBootDateTime', map: 'DeviceDetail>LastBootDateTime', type: 'date' },
		{ name: 'ModelName', map: 'DeviceDetail>ModelName' },
		{ name: 'ComputedDeviceStatus', map: 'DeviceDetail>ComputedDeviceStatus' },
		{ name: 'Protocol', map: 'DeviceDetail>Protocol' },
		{ name: 'IsCallbackImmediate', map: 'DeviceDetail>IsCallBackImmediate' },
		{ name: 'IsDldSingleSession', map: 'DeviceDetail>IsDldSingleSession' },
		{ name: 'GroupNames', map: 'DeviceDetail>GroupNames' },
		{ name: 'IPAddress', map: 'DeviceDetail>IPAddress' },
		{ name: 'MACAddress', map: 'DeviceDetail>MACAddress' },
		{ name: 'PartNumber', map: 'DeviceDetail>PartNumber' },
		{ name: 'VHQVersion', map: 'DeviceDetail>VHQVersion' },
		{ name: 'Location', map: 'DeviceDetail>Location' },
		{ name: 'LocationId', map: 'DeviceDetail>LocationId' },
		{ name: 'EncrEnabled', map: 'DeviceDetail>EncrEnabled' },
		{ name: 'GUIManagerVersion', map: 'DeviceDetail>GUIMgrVer' },
		{ name: 'SecurityPolicy', map: 'DeviceDetail>SecurityPolicy' },
		{ name: 'OSVersion', map: 'DeviceDetail>OSVersion' },
		{ name: 'VSRSponsor', map: 'DeviceDetail>VSRSponsor' },
		{ name: 'AutoDownloadOn', map: 'DeviceDetail>AutoDownloadOn' },
		{ name: 'LastHeartBeat', map: 'DeviceDetail>LastHeartBeat', type: 'date' },
		{ name: 'CreatedBy', map: 'DeviceDetail>CreatedByUserName' },
		{ name: 'CreatedOn', map: 'DeviceDetail>CreatedOn', type: 'date' },
		{ name: 'ManufactureDate', map: 'DeviceDetail>ManufactureDate', type: 'date' },
		{ name: 'SubStatus', map: 'DeviceDetail>SubStatus' },
		{ name: 'SubStatusId', map: 'DeviceDetail>SubStatusId' },
		{ name: 'ModeofConnectivity', map: 'DeviceDetail>NetworkConfiguration' },
		{ name: 'IsSoftwareAssigned', map: 'DeviceDetail>IsSoftwareAssigned' },
		{ name: 'IsEnabledForAutoDownload', map: 'DeviceDetail>IsEnabledForAutoDownload' },
		{ name: 'HierarchyId', map: 'DeviceDetail>HierarchyId' },
		{ name: 'ModelId', map: 'DeviceDetail>ModelId' },
		{ name: 'IsDirectReferenceSetAssigned', map: 'DeviceDetail>IsDirectReferenceSetAssigned' },
		{ name: 'InternalModelName', map: 'DeviceDetail>InternalModelName' },
		{ name: 'Family', map: 'DeviceDetail>Family' },
		{ name: 'AssignmentType', map: 'DeviceDetail>AssignmentType' },
		{ name: 'FreeRAM', map: 'DeviceDetail>FreeRAM' },
		{ name: 'FreeFlash', map: 'DeviceDetail>FreeFlash' },
		{ name: 'TotalFlashSize', map: 'DeviceDetail>TotalFlash' },
		{ name: 'TotalRamSize', map: 'DeviceDetail>TotalRam' },
		{ name: 'BatteryLevel', map: 'DeviceDetail>BatteryLevel' },
		{ name: 'ClockSetting', map: 'DeviceDetail>ClockSetting', type: 'date' },
		{ name: 'StylusVersion', map: 'DeviceDetail>StylusVer' },
		{ name: 'LastDeviceProfileUpdateDateTime', map: 'DeviceDetail>LastProfileDataReceivedDate', type: 'date' },
		{ name: 'LastDiagnosticProfileUpdateDateTime', map: 'DeviceDetail>LastDiagnosticsProfileDataReceivedDate', type: 'date' },
		{ name: 'LastCommunicationReceived', map: 'DeviceDetail>LastCommunicationReceived', type: 'date' },
		{ name: 'LastManagementPlanSent', map: 'DeviceDetail>LastManagementPlanSent', type: 'date' },
		{ name: 'HBFrequency', map: 'DeviceDetail>HBFrequency' },
		{ name: 'DeviceTimeZone', map: 'DeviceDetail>DeviceTimeZone' },
		{ name: 'DockInCount', map: 'DeviceDetail>DockInCount' },
		{ name: 'Synchronised', map: 'DeviceDetail>Synchronised' },
		{ name: 'TabletId', map: 'DeviceDetail>TabletId' },
		{ name: 'ModifiedBy', map: 'DeviceDetail>ModifiedByUserName' },
		{ name: 'ModifiedOn', map: 'DeviceDetail>ModifiedOn', type: 'date' },
		{ name: 'FormAgentVersion', map: 'DeviceDetail>FormAgentVersion' },
		{ name: 'ModelStatus', map: 'DeviceDetail>ModelStatus' },
		{ name: 'SoftwareStatus', map: 'DeviceDetail>SoftwareStatus' },
		{ name: 'HealthStatus', map: 'DeviceDetail>HealthStatus' },
		{ name: 'HealthAlerts', map: 'DeviceDetail>HealthAlerts' },
		{ name: 'PaymentAppName', map: 'DeviceDetail>PaymentAppName' },
		{ name: 'PaymentAppVersion', map: 'DeviceDetail>PaymentAppVersion' },
		{ name: 'isSelected', type: 'number' }
		];

		var gridStorage = getGridStorage(gID);

		var source =
		{
			dataType: "json",
			dataFields: sourceDataFieldsArr,
			root: 'Devices',
			type: "POST",
			data: param,
			url: AppConstants.get('API_URL') + "/GetDevices",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data.getDevicesResp && data)
					data.getDevicesResp = $.parseJSON(data.getDevicesResp);
				else
					data.getDevicesResp = [];

				if (data.getDevicesResp && data.getDevicesResp.PaginationResponse) {

					source.totalrecords = data.getDevicesResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getDevicesResp.PaginationResponse.TotalPages;

				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
				}
			},

		};
		var toolTipComputedRenderer = function (row, column, value, defaultHtml) {

			var rowData = $("#" + gID).jqxGrid('getrowdata', row);
			if (value == "Pending Hierarchy Assignment") {
				defaultHtml = '<div style="padding-left:8px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-checkmark iPanding" ></i></span><span style="padding-left:12px;padding-top:7px;" title="' + value + '">' + value + '</span></div>';
			}
			if (value == "Pending Registration" || value == "PendingRegistration") {
				defaultHtml = '<div style="margin-left:-4px; padding-left:0px;padding-top:3px;overflow:hidden;text-overflow: ellipsis;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="30"><div class="iconImg registration"></div></a><span style="padding-left:0px;padding-top:3px;" title="' + value + '">' + value + '</span></div>';
			}

			if (value == "Active") {
				defaultHtml = '<div style="padding-left:8px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-checkmark" style="color:green"></i></span><span style="padding-left:12px;padding-top:7px;" title="' + value + '">' + value + '</span></div>';
			}
			if (value == "Inactive") {
				defaultHtml = '<div style="padding-left:8px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-cross" style="color:red"></i></span><span style="padding-left:12px;padding-top:7px;" title="' + value + '">' + value + '</span></div>';
			}

			return defaultHtml;
		};

		var request = {

			formatData: function (data) {
				var advanceSearchStorage = getAdvanceSearchStorage(gID);
				checkloadingforDeviceSearch = 1;

				if (!isAdvancedSavedSearchApplied || koUtil.isSearchCancelled() == true) {
					$('.all-disabled').show();
					$("#loader1").show();
				}

				disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
				var columnSortFilter = new Object();
				columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'DeviceSearchFilter');

				var selectedHeaders = [], preferenceColumns = [];
				if (!_.isEmpty(advanceSearchStorage) && advanceSearchStorage.length > 0) {
					selectedHeaders = advanceSearchStorage[0].SelectedHeaders;
					preferenceColumns = advanceSearchStorage[0].userPreferenceColumns;
					if (!_.isEmpty(preferenceColumns) && preferenceColumns.length > 0) {
						selectedHeaders = preferenceColumns;
					}
					if (!_.isEmpty(columnSortFilter.SortList) && columnSortFilter.SortList.length > 0) {
						var source = _.where(selectedHeaders, { AttributeName: columnSortFilter.SortList[0].SortColumn });
						if (_.isEmpty(source) || source.length == 0) {
							var index = compulsoryfields.indexOf(columnSortFilter.SortList[0].SortColumn);
							if (index < 0) {
								columnSortFilter.SortList = null;
							}
						}
					}
				}

				koUtil.GlobalColumnFilter = columnSortFilter;
				globalColumnFilter = columnSortFilter;

				param.getDevicesReq.CareSearch = careSearchObject;
				param.getDevicesReq.ColumnSortFilter = columnSortFilter;
				param.getDevicesReq.Pagination = getPaginationObject(param.getDevicesReq.Pagination, gID);
				param.getDevicesReq.IsIncludeCareData = isCareEnabled ? (!_.isEmpty(globalUserPreferenceObject) ? globalUserPreferenceObject.ShowCareDataInDeviceSearch : true) : false;

				if (!_.isEmpty(advanceSearchStorage)) {
					if (advanceSearchStorage[0].isAdSearch == 0) {
						hierarchyPathStorage([]);
						criteriaGroups([]);
						//hierarchies
						if (advanceSearchStorage[0].AdvancedSearchHierarchy && advanceSearchStorage[0].AdvancedSearchHierarchy.length > 0) {
							var hierarchyeditData = advanceSearchStorage[0].AdvancedSearchHierarchy;
							for (var i = 0; i < hierarchyeditData.length; i++) {

								var EAdvancedSearchHierarchy = new Object();
								EAdvancedSearchHierarchy.HierarchyFullPath = hierarchyeditData[i].HierarchyFullPath;
								EAdvancedSearchHierarchy.HierarchyId = hierarchyeditData[i].HierarchyId;
								EAdvancedSearchHierarchy.IncludeChildren = hierarchyeditData[i].IncludeChildren;
								EAdvancedSearchHierarchy.IsChildExists = hierarchyeditData[i].IsChildExists;
								//EAdvancedSearchHierarchy.SearchId = searchId;
								ADSearchUtil.HierarchyPathStorage.push(EAdvancedSearchHierarchy);
							}
							hierarchyPathStorage = ADSearchUtil.HierarchyPathStorage;
						}
						//groups
						if (advanceSearchStorage[0].AdvancedSearchGroup && advanceSearchStorage[0].AdvancedSearchGroup.length > 0) {
							criteriaGroups(advanceSearchStorage[0].AdvancedSearchGroup);
							$("#advanceCriteria").removeClass('quickCriHide');
							$("#advanceCriteria").css("display", "block");
							$("#ResultCriteriaDiv").css("display", "block");
							$("#deviceCriteriaDiv").css("display", "none");
						}

						if (advanceSearchStorage[0].adSearchObj) {
							ADSearchUtil.deviceSearchObj = advanceSearchStorage[0].adSearchObj;
							if (ADSearchUtil.deviceSearchObj.IsFileSearch === true) {
								$("#deviceAttributesCriteriaDiv").css("display", "none");
								ADSearchUtil.attributeDataArr = [];
							}
							attributeArray(ADSearchUtil.attributeDataArr);
							if (!_.isEmpty(attributeArray) && attributeArray().length > 0) {
								$("#deviceAttributesCriteriaDiv").css("display", "block");
							}
							if (ADSearchUtil.searchAttributeArray) {
								multiselctedModels([]);
								multiselctedDeviceStatus([]);
								multiselctedSubStatus([]);
								multiSelectedModeOfConnectivity([]);
								multiSelectedVTPEncryptionStatus([]);
								multiSelectedSoftwareAssignmentType([]);

								if (ADSearchUtil.searchAttributeArray.multiselctedModels) {
									multiselctedModels(ADSearchUtil.searchAttributeArray.multiselctedModels);
								}
								if (ADSearchUtil.searchAttributeArray.multiselctedDeviceStatus) {
									multiselctedDeviceStatus(ADSearchUtil.searchAttributeArray.multiselctedDeviceStatus);
								}
								if (ADSearchUtil.searchAttributeArray.multiselctedSubStatus) {
									multiselctedSubStatus(ADSearchUtil.searchAttributeArray.multiselctedSubStatus);
								}
								if (ADSearchUtil.searchAttributeArray.multiSelectedModeOfConnectivity) {
									multiSelectedModeOfConnectivity(ADSearchUtil.searchAttributeArray.multiSelectedModeOfConnectivity);
								}
								if (ADSearchUtil.searchAttributeArray.multiSelectedSoftwareAssignmentType) {
									multiSelectedSoftwareAssignmentType(ADSearchUtil.searchAttributeArray.multiSelectedSoftwareAssignmentType);
								}
								if (ADSearchUtil.searchAttributeArray.multiSelectedVTPEncryptionStatus) {
									multiSelectedVTPEncryptionStatus(ADSearchUtil.searchAttributeArray.multiSelectedVTPEncryptionStatus);
								}
							}
							ADSearchUtil.searchAttributeArray = null;
							if (ADSearchUtil.deviceSearchObj.SearchText != null && ADSearchUtil.deviceSearchObj.SearchText != "<br/>") {
								if (!_.isEmpty(careData) && careData.identifier != 'model') {
									$("#advanceCriteria").removeClass('quickCriHide');
									$("#resetBtnForAdSearch").css("display", "inline");
									$("#criteriabtnDiv").addClass("display", "none");
									$("#deviceCriteriaDiv").css("display", "block");
									$("#deviceCriteriaDiv").removeClass('hide');
									$("#deviceCriteriaDiv").empty();
									$("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
								} else {
									$("#advanceCriteria").removeClass('quickCriHide');
									$("#advanceCriteria").css("display", "block");
									$("#resetBtnForAdSearch").css("display", "inline");
								}
							}
						} else {
							getDeviceSearchForSavedSearch(gID, advanceSearchStorage);
						}
					} else if (advanceSearchStorage[0].quickSearchObj) {
						ADSearchUtil.deviceSearchObj = advanceSearchStorage[0].quickSearchObj;
						$("#advanceCriteria").removeClass('quickCriHide');
						$("#resetBtnForAdSearch").css("display", "inline");
						$("#criteriabtnDiv").addClass("display", "none");
						$("#deviceCriteriaDiv").css("display", "block");
						$("#deviceCriteriaDiv").removeClass('hide');
						$("#deviceCriteriaDiv").empty();
						$("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
					} else {
						getDeviceSearchForSavedSearch(gID, advanceSearchStorage);
					}
				}

				if (isSearchReset || (ADSearchUtil.deviceSearchObj && ADSearchUtil.deviceSearchObj.SearchText == "<br/>"))
					$("#resetBtnForAdSearch").css("display", "none");

				updatepaginationOnState(gID, gridStorage, param.getDevicesReq.Pagination, ADSearchUtil.deviceSearchObj, advanceSearchStorage);
				param.getDevicesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
				data = JSON.stringify(param);

				return data;
			},

			downloadComplete: function (data, status, xhr) {
				if (data) {
					if (data.getDevicesResp && data.getDevicesResp.Devices) {

						for (var i = 0; i < data.getDevicesResp.Devices.length; i++) {
							data.getDevicesResp.Devices[i].DeviceDetail.DeletedOn = convertToLocaltimestamp(data.getDevicesResp.Devices[i].DeviceDetail.DeletedOn);
							data.getDevicesResp.Devices[i].DeviceDetail.BlackListedOn = convertToLocaltimestamp(data.getDevicesResp.Devices[i].DeviceDetail.BlackListedOn);
							data.getDevicesResp.Devices[i].DeviceDetail.LastHeartBeat = convertToDeviceZonetimestamp(data.getDevicesResp.Devices[i].DeviceDetail.LastHeartBeat);
							data.getDevicesResp.Devices[i].DeviceDetail.ClockSetting = convertToDeviceZonetimestamp(data.getDevicesResp.Devices[i].DeviceDetail.ClockSetting);
							data.getDevicesResp.Devices[i].DeviceDetail.CreatedOn = convertToLocaltimestamp(data.getDevicesResp.Devices[i].DeviceDetail.CreatedOn);
							data.getDevicesResp.Devices[i].DeviceDetail.LastBootDateTime = convertToDeviceZonetimestamp(data.getDevicesResp.Devices[i].DeviceDetail.LastBootDateTime);
							data.getDevicesResp.Devices[i].DeviceDetail.LastCommunicationReceived = convertToLocaltimestamp(data.getDevicesResp.Devices[i].DeviceDetail.LastCommunicationReceived);
							data.getDevicesResp.Devices[i].DeviceDetail.LastDiagnosticsProfileDataReceivedDate = convertToLocaltimestamp(data.getDevicesResp.Devices[i].DeviceDetail.LastDiagnosticsProfileDataReceivedDate);
							data.getDevicesResp.Devices[i].DeviceDetail.LastManagementPlanSent = convertToDeviceZonetimestamp(data.getDevicesResp.Devices[i].DeviceDetail.LastManagementPlanSent);
							data.getDevicesResp.Devices[i].DeviceDetail.LastProfileDataReceivedDate = convertToLocaltimestamp(data.getDevicesResp.Devices[i].DeviceDetail.LastProfileDataReceivedDate);
							data.getDevicesResp.Devices[i].DeviceDetail.ManufactureDate = convertToDeviceZonetimestamp(data.getDevicesResp.Devices[i].DeviceDetail.ManufactureDate);
							data.getDevicesResp.Devices[i].DeviceDetail.ModifiedOn = convertToLocaltimestamp(data.getDevicesResp.Devices[i].DeviceDetail.ModifiedOn);
						}
					}
				}

				enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
				initfieldsArr = sourceDataFieldsArr;

				ADSearchUtil.localDynamicColumns = [];

				var convertTrueFalseRendered = function (row, columnfield, value, defaulthtml, columnproperties) {
					if (value == true) {
						return '<div style="margin-left: 10px; margin-top: 5px;">True</div>';
					} else if (value == false) {
						return '<div style="margin-left: 10px; margin-top: 5px;">False</div>';
					}
				}

				var synchronisedRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
                    if (value == 'Sync') {
                        return '<div style="padding-left:5px;padding-top:7px"><span><i class="icon-checkmark ienable"></i></span><span style="padding-left:5px;padding-top:7px"> Sync </span></div>';
                    } else if (value == 'Not in Sync') {
                        return '<div style="padding-left:5px;padding-top:7px"><span><i class="icon-checkmark idisabled"></i></span><span style="padding-left:5px;padding-top:7px"> Not in Sync </span></div>';
                    } else{
                        return '<div style="padding-left:5px;padding-top:7px"><span><i class="icon-checkmark igrayedOut"></i></span><span style="padding-left:5px;padding-top:7px"> NA </span></div>';
                    }
				}

				var AutoDownloadRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
					if (value == 1) {
						return '<div style="padding-left:5px;padding-top:7px"><span style="padding-left:5px;padding-top:7px"> Yes </span></div>';
					}if (value == 0) {
						return '<div style="padding-left:5px;padding-top:7px"><span style="padding-left:5px;padding-top:7px"> No </span></div>';
					}if (value == 2) {
						return '<div style="padding-left:5px;padding-top:7px"><span style="padding-left:5px;padding-top:7px"> No (Disabled by System) </span></div>';
					}
				}

				var gID = ADSearchUtil.gridIdForAdvanceSearch;				
				if (data.getDevicesResp && data.getDevicesResp.SelectedColumns) {
					var customFields = data.getDevicesResp.CustomFieldConfiguration;

					var cols = $("#" + gID).jqxGrid("columns");
					var columnsCount = cols ? (cols.records ? cols.records.length : cols.length) : 0;
					if (!_.isEmpty(gridColumns) && gridColumns.length > 0) {
						for (var x = columnsCount; x > 1; x--) {
							if ($.inArray(gridColumns[x - 1].datafield, compulsoryfields) > -1) {
								continue;
							} else {
								var columnField = _.where(data.getDevicesResp.SelectedColumns, {
									AttributeName: gridColumns[x - 1].datafield
								});

								var filterInfo = $("#" + gID).jqxGrid('getfilterinformation');
								var sortInfo = $("#" + gID).jqxGrid('getsortinformation');

								var filterField = _.where(filterInfo, {
									datafield: gridColumns[x - 1].datafield
								});

								var sortField = _.where(sortInfo, {
									datafield: gridColumns[x - 1].datafield
								});

								if ((filterField && filterField.length > 0) || (sortField && sortField.length > 0)) {
									continue;
								} else {
									if (!columnField || (columnField && columnField.length == 0)) {
										gridColumns.splice(x - 1, 1);
									}
								}

							}
						}
					}

					for (var j = 0; j < data.getDevicesResp.SelectedColumns.length; j++) {

						var FieldSource = _.where(sourceDataFieldsArr, {
							name: data.getDevicesResp.SelectedColumns[j].AttributeName
						});
						if (FieldSource != '') {
							var dynamicObj = new Object();
							dynamicObj.name = data.getDevicesResp.SelectedColumns[j].AttributeName;
							dynamicObj.map = 'DeviceDetail>' + data.getDevicesResp.SelectedColumns[j].AttributeName;
							if (data.getDevicesResp.SelectedColumns[j].ControlType == 'Date') {
								dynamicObj.type = 'date';
							}
							ADSearchUtil.newAddedDataFieldsArr.push(dynamicObj);
							var exportDynamicColumns = new Object();
							exportDynamicColumns.AttributeName = data.getDevicesResp.SelectedColumns[j].AttributeName;
							exportDynamicColumns.ControlType = data.getDevicesResp.SelectedColumns[j].ControlType;
							exportDynamicColumns.DisplayName = data.getDevicesResp.SelectedColumns[j].DisplayName;
							exportDynamicColumns.IsCustomAttribute = data.getDevicesResp.SelectedColumns[j].IsCustomAttribute;
							ADSearchUtil.ExportDynamicColumns.push(exportDynamicColumns);
						} else {
							var object = new Object();
							object.name = data.getDevicesResp.SelectedColumns[j].AttributeName;
							object.map = 'DeviceDetail>' + data.getDevicesResp.SelectedColumns[j].AttributeName;
							if (data.getDevicesResp.SelectedColumns[j].ControlType == 'Date') {
								object.type = 'date';
							}
							ADSearchUtil.newAddedDataFieldsArr.push(object);
							sourceDataFieldsArr.push(object);
							initfieldsArr.push(object);
						}

						var columnSource = _.where(gridColumns, {
							datafield: data.getDevicesResp.SelectedColumns[j].AttributeName
						});

						if (data.getDevicesResp.Devices) {
							if (data.getDevicesResp.SelectedColumns[j].IsCustomAttribute == true) {
								for (var k = 0; k < data.getDevicesResp.Devices.length; k++) {
									if (data.getDevicesResp.Devices && data.getDevicesResp.Devices[k].DeviceDetail && data.getDevicesResp.Devices[k].DeviceDetail.CustomAttributeList) {
										for (var l = 0; l < data.getDevicesResp.Devices[k].DeviceDetail.CustomAttributeList.length; l++) {
											if (data.getDevicesResp.SelectedColumns[j].AttributeName == data.getDevicesResp.Devices[k].DeviceDetail.CustomAttributeList[l].AttributeName) {
												var obj = new Object();
												obj.name = data.getDevicesResp.Devices[k].DeviceDetail.CustomAttributeList[l].AttributeName;
												obj.map = 'DeviceDetail>' + data.getDevicesResp.Devices[k].DeviceDetail.CustomAttributeList[l].AttributeName;
												sourceDataFieldsArr.push(obj);
												initfieldsArr.push(obj);
												data.getDevicesResp.Devices[k].DeviceDetail[data.getDevicesResp.SelectedColumns[j].AttributeName] = data.getDevicesResp.Devices[k].DeviceDetail.CustomAttributeList[l].AttributeValue;
											}
										}
									}
								}
							}
						}

						var columnObj = new Object();
						var attributeName = data.getDevicesResp.SelectedColumns[j].AttributeName;
						if (attributeName.indexOf("CustomField") > -1) {
							for (var x = 0; x < customFields.length; x++) {
								var configName = customFields[x].ConfigName;
								if (attributeName.substr(attributeName.length - 1) == configName.substr(configName.length - 1)) {
									columnObj.text = customFields[x].ConfigValue;
									break;
								}
							}
						} else {
							columnObj.text = i18n.t(data.getDevicesResp.SelectedColumns[j].DisplayName, { lng: lang });
						}
						columnObj.datafield = data.getDevicesResp.SelectedColumns[j].AttributeName;
						columnObj.editable = false;
						columnObj.minwidth = 200;
						columnObj.width = 'auto';
						columnObj.menu = true;
						columnObj.hidden = false;
						columnObj.sortable = true;
						columnObj.filterable = true;
						columnObj.columnsResize = true;
						columnObj.enabletooltips = true;
						if (data.getDevicesResp.SelectedColumns[j].AttributeName == "IsCallbackImmediate" || data.getDevicesResp.SelectedColumns[j].AttributeName == "IsDldSingleSession") {
							columnObj.cellsrenderer = convertTrueFalseRendered;
						} else if (data.getDevicesResp.SelectedColumns[j].AttributeName == "Synchronised") {
							columnObj.cellsrenderer = synchronisedRenderer;
						}
						else if (data.getDevicesResp.SelectedColumns[j].AttributeName == "IsEnabledForAutoDownload") {
							columnObj.cellsrenderer = AutoDownloadRenderer;
						}

						if (data.getDevicesResp.SelectedColumns[j].ControlType == 'Date') {
							columnObj.columnType = 'Date';
							if (data.getDevicesResp.SelectedColumns[j].AttributeName == "ManufactureDate") {
								columnObj.cellsformat = SHORT_DATE_FORMAT_M;
							} else {
								columnObj.cellsformat = LONG_DATETIME_GRID_FORMAT;
							}
						}
						columnObj.filtertype = "custom";

						if (data.getDevicesResp.SelectedColumns[j].ControlType == 'MultiCombo' || data.getDevicesResp.SelectedColumns[j].ControlType == 'Combo') {
							columnObj.createfilterpanel = function (datafield, filterPanel) {
								var FilterSource = AppConstants.get(datafield);
								buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource);
							};
						} else if (data.getDevicesResp.SelectedColumns[j].ControlType == 'Date') {
							columnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanelDate(filterPanel, datafield); };
						} else {
							columnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
						}

						if (!_.isEmpty(columnSource) && columnSource.length > 0) {
							columnSource[0].hidden = false;
						} else {
							gridColumns.push(columnObj);
							var uncheckedString = sessionStorage.getItem(gID + "ShowHideCol");
							if(uncheckedString)
							{
								unchecked = $.parseJSON(uncheckedString);
								var index = unchecked.indexOf(columnObj.datafield);
								if (index > -1) {
									unchecked.splice(index, 1);
								}
								sessionStorage.setItem(gID + "ShowHideCol",JSON.stringify(unchecked));
							}
						}
						$("#" + gID).jqxGrid("refresh");

						var index = ADSearchUtil.initColumnsArr.findIndex(function (item) { return item === attributeName });
						if (index <= -1) {
							ADSearchUtil.initColumnsArr.push(attributeName);
						}
						ADSearchUtil.localDynamicColumns.push(columnObj);
					}
					if (data.getDevicesResp.SelectedColumns) {
						DynamicColumns = data.getDevicesResp.SelectedColumns;
					}

					if (!_.isEmpty(gridColumns) && gridColumns.length > 0) {
						gridColumns.sort(function (a, b) {
							if ($.inArray(a.datafield, compulsoryfields) > -1) {
								return 0;
							} else if ($.inArray(b.datafield, compulsoryfields) > -1) {
								return 0;
							} else {
								return a.text > b.text ? 1 : -1;
							}
						});
						gridColumns = setUserPreferencesColumns('DeviceSearch', userResizedColumns, gridColumns);

						$("#" + gID).jqxGrid('beginupdate', true);
						$("#" + gID).jqxGrid({ columns: gridColumns });
						$("#" + gID).jqxGrid('endupdate');
						$("#" + gID).jqxGrid("refresh");
					}
				}



				source.dataFields = sourceDataFieldsArr;
				if (data.getDevicesResp && data.getDevicesResp.Devices) {
					if (data.getDevicesResp.PaginationResponse) {
						//if (data.getDevicesResp.PaginationResponse.HighLightedItemPage > 0) {
						//    //for (var h = 0; h < data.getDevicesResp.Devices.length; h++) {
						//    //    if (data.getDevicesResp.Devices[h].UniqueDeviceId == data.getDevicesResp.PaginationResponse.HighLightedItemId) {
						//    gridStorage[0].highlightedPage = data.getDevicesResp.PaginationResponse.HighLightedItemPage;
						//    var updatedGridStorage = JSON.stringify(gridStorage);
						//    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
						//    //    }
						//    //}
						//}
					}
				} else if (data.getDevicesResp) {
					data.getDevicesResp.Devices = [];
				}

				if (isDeviceSubStatusAllowed && deviceSubStatusDataAll && deviceSubStatusDataAll.length == 0) {
					getDeviceSubStatus(deviceSubStatusData, getDeviceSubStatusCallback);
				} else {
					deviceSubStatusData(deviceSubStatusDataUser);
				}

				var gridheight = $(window).height();
				if (gridheight > 600) {
					gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 37;
				} else {
					gridheight = '400px';
				}
				$("#" + gID).jqxGrid({ height: gridheight });
				if (isAdvancedSavedSearchApplied && koUtil.isSearchCancelled() == false) {
					$("#searchInProgress").modal('hide');
					$("#AdvanceSearchModal").modal('hide');
					koUtil.isHierarchyModified(false);
					koUtil.isAttributeModified(false);
					modelPopup('unloadTemplate');
					ClearAdSearch = 0;
				} else {
					$('.all-disabled').hide();
					$("#loader1").hide();
				}
				isAdvancedSavedSearchApplied = false;
				koUtil.isSearchCancelled(false);
				window.sessionStorage.setItem('careData', "");
				careModelData = new Object();
			},
			loadError: function (jqXHR, status, error) {
				$('.all-disabled').hide();
				openAlertpopup(2, 'network_error');
			}
		}

		var dataAdapter = intializeDataAdapter(source, request);

		var buildFilterPanel = function (filterPanel, datafield) {
			genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
		}
		var buildFilterPanelDate = function (filterPanel, datafield) {
			genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);
		}
		var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
			genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
		}

		var rendered = function (element) {
			var retval = autho.checkRightsBYScreen('Global Operations', 'IsModifyAllowed');
			enablegridfunctions(gID, 'UniqueDeviceId', element, gridStorage, true, 'pagerDiv', true, 0, 'UniqueDeviceId', null, null, null, null, 'deviceSearchCheck', retval);
			return true;
		}

		var SerialNoRendereDeviceSearch = function (row, columnfield, value, defaulthtml, columnproperties) {
			var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
			return html;
		}

		//var ManufactureDateRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
		//    if (value) {
		//        var localTime1 = convertToLocaltimestamp(value);// moment(localTime1).format(LONG_DATE_FORMAT);
		//        var DateRender = localTime1.split(' ');
		//        return '<div style="padding-left:6px;padding-top:7px;cursor:pointer;" title=' + DateRender[0] + '>' + DateRender[0] + '</div>'
		//    }
		//    else
		//        return '';
		//}

		var modelRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var rowData = $("#" + gID).jqxGrid('getrowdata', row);
			var modelStatus = '';
			if (!_.isEmpty(rowData)) {
				modelStatus = rowData.ModelStatus ? rowData.ModelStatus.toLowerCase() : '';
			}
			if (modelStatus !== '') {
				return '<div style="padding-left:5px;padding-top:0px"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px; display:inline-flex"><div title="' + rowData.ModelStatus + '" class="iconImg ' + modelStatus + '"></div></a>' + value + '</div>';
			} else {
				return;
			}
		}

		var softwareStatusRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var rowData = $("#" + gID).jqxGrid('getrowdata', row);
			var softwareStatus = '';
			if (!_.isEmpty(rowData)) {
				softwareStatus = rowData.SoftwareStatus ? rowData.SoftwareStatus.toLowerCase() : '';
			}

			return '<div style="padding-left:5px;padding-top:0px;"><a  tabindex="0" class="btn default" title=' + value + ' style="padding-left: 0px; height="60" width="50"><div title="' + value + '" class="iconImg ' + softwareStatus + '"></div></a></div>';
		}

		var alertStatusRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var rowData = $("#" + gID).jqxGrid('getrowdata', row);
			if (!_.isEmpty(rowData)) {
				var healthStatus = rowData.HealthStatus ? rowData.HealthStatus.toLowerCase() : '';
				var healthStatusToolTip = rowData.HealthStatus ? rowData.HealthStatus : '';
				var healthAlerts = rowData.HealthAlerts;
			}
			var html = '';
			if (!_.isEmpty(healthAlerts)) {
				var healthAlert_1 = '';
				if (healthAlerts.length == 1) {
					healthAlert_1 = AppConstants.get(healthAlerts[0].toUpperCase());
					html = '<div style="padding-left:5px;padding-top:0px"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px; display:inline-flex"><div title="' + healthStatusToolTip + '" class="icons_inline ' + healthStatus + '"></div><img src="assets/css/careImages/' + healthAlert_1 + '.png" height="16px" width="16px" style="cursor: pointer;margin-left: 5px;" title="' + i18n.t(healthAlerts[0].toLowerCase(), { lng: lang }) + '" /></a></div>';
				} else if (healthAlerts.length == 2) {
					healthAlert_1 = AppConstants.get(healthAlerts[0].toUpperCase());
					var healthAlert_2 = AppConstants.get(healthAlerts[1].toUpperCase());
					html = '<div style="padding-left:5px;padding-top:0px"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px; display:inline-flex"><div title="' + healthStatusToolTip + '" class="icons_inline ' + healthStatus + '"></div><img src="assets/css/careImages/' + healthAlert_1 + '.png" height="16px" width="16px" style="cursor: pointer;margin-left: 5px;" title="' + i18n.t(healthAlerts[0].toLowerCase(), { lng: lang }) + '" /><img src="assets/css/careImages/' + healthAlert_2 + '.png" height="16px" width="16px" style="cursor: pointer;margin-left: 5px;" title="' + i18n.t(healthAlerts[1].toLowerCase(), { lng: lang }) + '" /></a></div>';
				} else {
					var healthAlertsToolTip = new Array();
					for (var i = 0; i < healthAlerts.length; i++) {
						healthAlertsToolTip.push(i18n.t(healthAlerts[i].toLowerCase(), { lng: lang }));
					}
					var healthAlerts_all = healthAlertsToolTip.toString();
					var healthAlerts_more = 'more-alerts';
					html = '<div style="padding-left:5px;padding-top:0px"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px; display:inline-flex"><div title="' + healthStatusToolTip + '" class="icons_inline ' + healthStatus + '"></div><img src="assets/css/careImages/' + healthAlerts_more + '.png" height="16px" width="16px" style="cursor: pointer;margin-left: 5px;" title="' + healthAlerts_all + '" /></a></div>';
				}
			} else if (!_.isEmpty(healthStatus)) {
				html = '<div style="padding-left:5px;padding-top:0px"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px; display:inline-flex"><div title="' + healthStatusToolTip + '" class="icons_inline ' + healthStatus + '"></div></a></div>';
			}
			return html;
		}

		gridColumns = [
			{
				text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false, draggable: false,
				datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
					return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
				}, rendered: rendered
			},
			{
				text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 130, enabletooltips: false,
				filtertype: "custom", cellsrenderer: SerialNoRendereDeviceSearch,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 130, enabletooltips: false,
				filtertype: "custom", cellsrenderer: SerialNoRendereDeviceSearch,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 150, enabletooltips: false, cellsrenderer: modelRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
				}
			},
			{
				text: i18n.t('software', { lng: lang }), datafield: 'SoftwareStatus', editable: false, minwidth: 100, width: 'auto', enabletooltips: false,
				filterable: false, sortable: false, menu: false, hidden: true, cellsrenderer: softwareStatusRenderer
			},
			{
				text: i18n.t('health_alerts', { lng: lang }), datafield: 'Alerts', editable: false, minwidth: 100, enabletooltips: false,
				filterable: false, sortable: false, menu: false, hidden: true, cellsrenderer: alertStatusRenderer
			},
			{
				text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 180, enabletooltips: false,
				filtertype: "custom", cellsrenderer: toolTipComputedRenderer,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
				}
			},
			{
				text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 180, width: 'auto',
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('last_heartBeat', { lng: lang }), datafield: 'LastHeartBeat', editable: false, minwidth: 180, cellsformat: LONG_DATETIME_GRID_FORMAT,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);
				}
			}

		];

		$("#" + gID).on('bindingcomplete', function (event) {
			var columns = GetExportVisibleColumn(gID);
			visibleColumnsList = columns;
			$("#" + gID).jqxGrid('focus');
		});
		$("#" + gID).jqxGrid(
			{
				width: "100%",
				height: gridHeightFunction(gID, "DevSearch"),
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
				enablekeyboarddelete: false,
				enabletooltips: true,
				rowsheight: 32,
				autoshowfiltericon: true,
				columns: gridColumns,
				rendergridrows: function () {
					return dataAdapter.records;
				},
				ready: function () {
					if (ADSearchUtil.resetAddSerchFlag == '') {

						gID = ADSearchUtil.gridIdForAdvanceSearch;
						for (var m = 0; m < initfieldsArr.length; m++) {
							var FieldSource = _.where(sourceDataFieldsArr, { name: initfieldsArr[m].name });
							if (FieldSource == '') {
								sourceDataFieldsArr.push(initfieldsArr[m]);
							}
						}
						for (var n = 0; n < ADSearchUtil.newAddedDataFieldsArr.length; n++) {
							var FieldSource = _.where(sourceDataFieldsArr, { name: ADSearchUtil.newAddedDataFieldsArr[n].name });
							if (FieldSource == '') {
								sourceDataFieldsArr.push(ADSearchUtil.newAddedDataFieldsArr[n]);
							}
						}

						for (var p = 0; p < ADSearchUtil.localDynamicColumns.length; p++) {
							if (ADSearchUtil.localDynamicColumns[p].datafield != "Protocol")
								$("#" + gID).jqxGrid('showcolumn', ADSearchUtil.localDynamicColumns[p].datafield);

						}

						for (var q = 0; q < gridColumns.length; q++) {
							if ($.inArray(gridColumns[q].datafield, ADSearchUtil.initColumnsArr) < 0) {
								if (DynamicColumns) {
									var checkSource = _.where(DynamicColumns, {
										AttributeName: gridColumns[q].datafield
									});

									if (checkSource == '') {
										if (gridColumns[q].datafield != "Protocol")
											$("#" + gID).jqxGrid('hidecolumn', gridColumns[q].datafield);
									}
								}
							}
						}
					} else if (ADSearchUtil.resetAddSerchFlag == 'reset') {
						gID = ADSearchUtil.gridIdForAdvanceSearch;

						for (var r = 0; r < ADSearchUtil.newAddedDataFieldsArr.length; r++) {
							sourceDataFieldsArr = jQuery.grep(sourceDataFieldsArr, function (value) {
								var index = sourceDataFieldsArr.indexOf(ADSearchUtil.newAddedDataFieldsArr[r]);
								return (value != sourceDataFieldsArr[index] && value != null);
							});
						}
					}
					callOnGridReady(gID, gridStorage, null, null, 1);
					var columns = GetExportVisibleColumn(gID);
					visibleColumnsList = columns;

					// custom search
					if ($("#idCustomSearch").val() != "") {
						var isCustomSearchCriteria = sessionStorage.getItem('CustomSearchCriteria');

						if (isCustomSearchCriteria)
							$("#deviceCriteriaDiv").empty().show().html(isCustomSearchCriteria);

					}
					var gridheight = $(window).height();
					if (gridheight > 600) {
						gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 37;
					} else {
						gridheight = '400px';
					}
					$("#" + gID).jqxGrid({ height: gridheight });

					var showHideColList = sessionStorage.getItem(gID + "ShowHideCol");
					if (showHideColList) {
						var showHide = $.parseJSON(showHideColList);
						for (var i = 0; i < showHide.length; i++) {
							$("#" + gID).jqxGrid('hidecolumn', showHide[i]);
						}
					}
					if (isCareEnabled && (_.isEmpty(globalUserPreferenceObject) || globalUserPreferenceObject.ShowCareDataInDeviceSearch)) {
						$("#" + gID).jqxGrid('showcolumn', 'SoftwareStatus');
						$("#" + gID).jqxGrid('showcolumn', 'Alerts');
					}
					if ($("#txtQuickSearchDevice").val() != "")
						$("#SaveSearchReset").show();

					function fnHeaderCheck() {
						//$("#" + gID).find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-checked');
					}
					var datainformations = $("#" + gID).jqxGrid("getdatainformation");
					if (gridStorage[0].counter > 0) {
						if (datainformations.rowscount == gridStorage[0].counter)
							setTimeout(fnHeaderCheck, 1000);
					}

				}
			});

		var retval = autho.checkRightsBYScreen('Global Operations', 'IsModifyAllowed');
		getGridBiginEdit(gID, 'UniqueDeviceId', gridStorage, 'deviceSearchCheck', retval);

		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'UniqueDeviceId');
		globalGridIdForState = { "gName": gID };
	}

	function getDeviceSubStatusCallback(deviceSubStatusData, subStatusData) {
		deviceSubStatusData(subStatusData);
	}

	function getDeviceParameters(isExport, columnSortFilterDevice, selectedDevices, unselectedDevices, checkAll, deviceSearchObj, careSearchObject) {
		var getDevicesReq = new Object();
		var Pagination = new Object();
		var Selector = new Object();
		var DeviceSearch = new Object();
		var HierarchyIdsWithChildren = new Object();

		HierarchyIdsWithChildren.long = 0;

		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE'),

			Selector.SelectedItemIds = null;
		Selector.UnSelectedItemIds = null;

		var ColumnSortFilter = new Object();
		var FilterList = new Array();
		var coulmnfilter = new Object();
		coulmnfilter.FilterColumn = null;
		coulmnfilter.FilterValue = null;
		FilterList.push(coulmnfilter);
		ColumnSortFilter.FilterList = FilterList;
		ColumnSortFilter.SortList = null;

		koUtil.GlobalColumnFilter = ColumnSortFilter;
		globalColumnFilter = ColumnSortFilter;
		getDevicesReq.ColumnSortFilter = ColumnSortFilter;
		getDevicesReq.DeviceSearch = deviceSearchObj;
		getDevicesReq.CareSearch = careSearchObject;
		getDevicesReq.Pagination = Pagination;
		getDevicesReq.Selector = Selector;
		getDevicesReq.IsIncludeCareData = isCareEnabled ? (!_.isEmpty(globalUserPreferenceObject) ? globalUserPreferenceObject.ShowCareDataInDeviceSearch : true) : false;

		var param = new Object();
		param.token = TOKEN();
		param.getDevicesReq = getDevicesReq;

		return param;
	}

	function getDeviceforExport(isExport, columnSortFilterDevice, selectedDevices, unselectedDevices, checkAll, visibleColumns, careSearchObject) {
		var exportDevicesReq = new Object();
		var Pagination = new Object();
		var Selector = new Object();
		var DeviceSearch = new Object();
		var HierarchyIdsWithChildren = new Object();
		var Export = new Object();
		HierarchyIdsWithChildren.long = 0;
		Pagination.HighLightedItemId = null;
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
		DeviceSearch.DeviceStatus = null;
		DeviceSearch.GroupIds = null;
		DeviceSearch.HierarchyIdsWithChildren = HierarchyIdsWithChildren;
		DeviceSearch.HierarchyIdsWithoutChildren = null;
		DeviceSearch.IsHierarchiesSelected = false;
		DeviceSearch.SelectedHeaders = selectedColumns;
		DeviceSearch.IsOnlyDeleteBlacklisted = false;
		DeviceSearch.SearchCriteria = null;
		DeviceSearch.SearchElements = null;
		DeviceSearch.SearchID = 0;
		DeviceSearch.SearchModels = null;
		DeviceSearch.SearchName = null;
		DeviceSearch.SearchText = null;
		DeviceSearch.SearchType = 0;
		var Dynamic = new Array();
		Export.VisibleColumns = visibleColumns;
		if (checkAll == 1) {
			Selector.SelectedItemIds = null;
			Selector.UnSelectedItemIds = unselectedDevices;
			if (isExport == true) {
				Export.IsAllSelected = true;
				Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
				Export.IsExport = true;

			} else {
				Export.IsAllSelected = false;
				Export.IsExport = false;
			}
		} else {
			Selector.SelectedItemIds = selectedDevices;
			Selector.UnSelectedItemIds = null;
			if (isExport == true) {
				Export.IsAllSelected = false;
				Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
				Export.IsExport = true;

			} else {
				Export.IsAllSelected = false;

				Export.IsExport = false;
			}
		}

		var ColumnSortFilter = columnSortFilterDevice;
		exportDevicesReq.ColumnSortFilter = ColumnSortFilter;
		exportDevicesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
		exportDevicesReq.CareSearch = careSearchObject;
		exportDevicesReq.Pagination = Pagination;
		exportDevicesReq.Selector = Selector;
		exportDevicesReq.Export = Export;

		var param = new Object();
		param.token = TOKEN();
		param.exportDevicesReq = exportDevicesReq;

		return param;
	}
	//end grid

	///code for advance search and for state save

	function generateAdvanceForSaveState(searchId, hierarchyPathStorage, criteriaGroups, attrbuteCriteriaArr, AttributeData, checkAccessType, flageForEdit, multiselctedModels, multiselctedDeviceStatus, flageForCopy, backupAttributeData, data) {

		if (data) {
			hierarchyPathStorage([]);
			ADSearchUtil.HierarchyPathStorage([]);
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
			if (data.AdvancedSearchHierarchy) {
				var hierarchyeditData = data.AdvancedSearchHierarchy;
				for (var i = 0; i < hierarchyeditData.length; i++) {

					var EAdvancedSearchHierarchy = new Object();
					EAdvancedSearchHierarchy.HierarchyFullPath = hierarchyeditData[i].HierarchyFullPath;
					EAdvancedSearchHierarchy.HierarchyId = hierarchyeditData[i].HierarchyId;
					EAdvancedSearchHierarchy.IncludeChildren = hierarchyeditData[i].IncludeChildren;
					EAdvancedSearchHierarchy.IsChildExists = hierarchyeditData[i].IsChildExists;
					EAdvancedSearchHierarchy.SearchId = searchId;
					ADSearchUtil.HierarchyPathStorage.push(EAdvancedSearchHierarchy);
				}
				hierarchyPathStorage = ADSearchUtil.HierarchyPathStorage;
			}
			//groups
			if (data.AdvancedSearchGroup) {
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
				//models
				if (data.adSearchObj.SearchModels && data.adSearchObj.SearchModels.length > 0) {
					var modelArray = data.adSearchObj.SearchModels;
					var attrsource = _.where(backupAttributeData(), { AttributeName: 'ModelName' });
					if (!_.isEmpty(attrsource)) {
						var EAdvancedSearchModel = new Object();
						EAdvancedSearchModel.AttributeName = attrsource[0].AttributeName;
						EAdvancedSearchModel.ControlType = attrsource[0].ControlType;
						EAdvancedSearchModel.DeviceSearchAttributeOperators = attrsource[0].DeviceSearchAttributeOperators;

						var opsource = attrsource[0].DeviceSearchAttributeOperators;
						EAdvancedSearchModel.OperatorValue = opsource[0].Operator;
						EAdvancedSearchModel.DeviceSearchAttributeId = opsource[0].DeviceSearchOperatorId;
						EAdvancedSearchModel.SelectedDeviceSearchOperatorId = opsource[0].DeviceSearchOperatorId;
						EAdvancedSearchModel.DisplayName = "Model";

						var tooltip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' ';
						multiselctedModels([]);
						if (!_.isEmpty(modelArray)) {
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
				if (data.adSearchObj.DeviceStatus && data.adSearchObj.DeviceStatus.length > 0) {
					var deviceStatusArray = data.adSearchObj.DeviceStatus;
					var attrsource = _.where(backupAttributeData(), { AttributeName: 'ComputedDeviceStatus' });
					if (!_.isEmpty(attrsource)) {
						var EAdvancedSearchstatus = new Object();
						EAdvancedSearchstatus.AttributeName = attrsource[0].AttributeName;
						EAdvancedSearchstatus.ControlType = attrsource[0].ControlType;
						EAdvancedSearchstatus.DeviceSearchAttributeOperators = attrsource[0].DeviceSearchAttributeOperators;

						var opsource = attrsource[0].DeviceSearchAttributeOperators;
						EAdvancedSearchstatus.OperatorValue = opsource[0].Operator;
						EAdvancedSearchstatus.DeviceSearchAttributeId = opsource[0].DeviceSearchOperatorId;
						EAdvancedSearchstatus.SelectedDeviceSearchOperatorId = opsource[0].DeviceSearchOperatorId;
						EAdvancedSearchstatus.DisplayName = attrsource[0].DisplayName;

						var tooltip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' ';
						multiselctedDeviceStatus([]);
						if (!_.isEmpty(deviceStatusArray)) {
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
				if (data.adSearchObj.SearchElements && data.adSearchObj.SearchElements.length > 0) {
					var elementArray = data.adSearchObj.SearchElements;
					for (var p = 0; p < elementArray.length; p++) {

						var attrsource = _.where(backupAttributeData(), { DeviceSearchAttributeId: elementArray[p].DeviceSearchAttributeId });
						if (!_.isEmpty(attrsource)) {
							var DeviceSearchElement = new Object();
							DeviceSearchElement.AttributeName = attrsource[0].AttributeName;
							DeviceSearchElement.ControlType = attrsource[0].ControlType;
							DeviceSearchElement.DeviceSearchAttributeOperators = attrsource[0].DeviceSearchAttributeOperators;
							var opid = parseInt(elementArray[p].DeviceSearchOperatorId);

							var opsource = _.where(attrsource[0].DeviceSearchAttributeOperators, { DeviceSearchOperatorId: opid });
							DeviceSearchElement.OperatorValue = opsource[0].Operator;
							if (elementArray[p].SearchValueOptional1 == null) {
								elementArray[p].SearchValueOptional1 = '';
							}
							if (attrsource[0].AttributeName == 'Name' || attrsource[0].AttributeName == 'PaymentAppName') {
								DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' Name : ' + elementArray[p].SearchValue + ' version : ' + elementArray[p].SearchValueOptional1;
							} else if (attrsource[0].ControlType == 'Date') {

								DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' From : ' + elementArray[p].SearchValue + ' To : ' + elementArray[p].SearchValueOptional1;

							} else {
								DeviceSearchElement.toolTip = attrsource[0].DisplayName + ' ' + opsource[0].Operator + ' ' + elementArray[p].SearchValue + '  ' + elementArray[p].SearchValueOptional1;
							}
							DeviceSearchElement.DisplayName = attrsource[0].DisplayName;

							DeviceSearchElement.DeviceSearchAttributeId = elementArray[p].DeviceSearchAttributeId;
							DeviceSearchElement.SelectedDeviceSearchOperatorId = elementArray[p].DeviceSearchOperatorId;
							DeviceSearchElement.SearchElementSeqNo = elementArray[p].SearchElementSeqNo;
							DeviceSearchElement.SearchId = elementArray[p].SearchId;
							DeviceSearchElement.ControlValues = elementArray[p].SearchValue;
							DeviceSearchElement.OptionalValue = elementArray[p].SearchValueOptional1;

							ADSearchUtil.attributeDataArr.push(DeviceSearchElement);
							attrbuteCriteriaArr(ADSearchUtil.attributeDataArr);
						}
					}
					if (!_.isEmpty(elementArray)) {
						for (var q = 0; q < elementArray.length; q++) {
							var attrsource = _.where(backupAttributeData(), { DeviceSearchAttributeId: elementArray[q].DeviceSearchAttributeId });
							if (attrsource && attrsource.length > 0 && attrsource[0].IsMultiUse == false) {
								AttributeData.remove(attrsource[0]);
							}
						}
					}
				}
			}
		}
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
					if (data.getGroupsResp)
						data.getGroupsResp = $.parseJSON(data.getGroupsResp);

					var selectedArr = new Array();

					if (ClearAdSearch == 0) {

						storedGId = ADSearchUtil.gridIdForAdvanceSearch;
						var adStorage = JSON.parse(sessionStorage.getItem(storedGId + "adStorage"));
						if (adStorage) {
							if (adStorage[0].AdvancedSearchGroup && adStorage[0].AdvancedSearchGroup != undefined && adStorage[0].AdvancedSearchGroup != '') {
								for (var g = 0; g < data.getGroupsResp.Groups.length; g++) {
									var gsource = _.where(adStorage[0].AdvancedSearchGroup, { GroupId: data.getGroupsResp.Groups[g].GroupId })
									if (gsource != '') {
										data.getGroupsResp.Groups[g]["isSelected"] = 1;
										selectedArr.push(data.getGroupsResp.Groups[g].GroupId);
										//criteriaGroups.push(data.getGroupsResp.Groups[g]);
									} else {
										data.getGroupsResp.Groups[g]["isSelected"] = 0;
									}
								}
							}
						}
					}

					var gridStorageArr = new Array();
					var gridStorageObj = new Object();
					gridStorageObj.checkAllFlag = 0;
					gridStorageObj.counter = 0;
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
			enableUiGridFunctions(gID, 'GroupId', element, gridStorage, true, 'GroupId', criteriaGroups);
			return true;
		}

		if (groupsData) {
			var records = groupsData.length;
		} else {
			var records = 0;
		}
		var windowWidth = $(window).width();
		var gridwidth = "97.5%";
		if (windowWidth < 1300) {
			gridwidth = "95.9%";
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
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				enabletooltips: true,
				editable: true,

				columns: [
					{
						text: '', menu: false, sortable: false, filterable: false, exportable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
						datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
							if (ADSearchUtil.AdScreenName == 'deviceSearch') {
								return '<div><div style="margin-left:10px;margin-top: 5px;"></div></div>';
							} else {
								return '<div style="margin-left:10px;"><div style="margin-top: 5px;"></div></div>';
							}
						}, rendered: rendered
					},
					{ text: '', datafield: 'GroupId', hidden: true, minwidth: 0, exportable: false },
					{

						text: i18n.t('Group_Name_headertext', { lng: lang }), datafield: 'GroupName', editable: false, width: gridwidth,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					}

				]
			});

		getUiGridBiginEdit(gID, 'GroupId', gridStorage, criteriaGroups);
		callUiGridFilter(gID, gridStorage);
		$("#loadingDiv").hide();
	}

	function split(val) {
		return val.split(/ \s*/);
	}
	function extractLast(term) {
		var a = $("#idCustomSearch").val();
		var b = a.split(' ');

		if (b[0])
			return split(term).pop();
		else
			return false;
	}

	function AdvancedOpenAlertPopup(flage, msg) {
		$("#AdInformationPopup").css('z-index', '9999999');
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

	function getDeviceCoulmnArr(gID) {
		var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));
		var arr = gridStorage[0].columnsArr;
		gridStorage[0].columnsArr = [];
		var rendered = function (element) {
			enablegridfunctions(gID, 'UniqueDeviceId', element, gridStorage, true);
			return true;
		}
		gridStorage[0].columnsArr.push({
			text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox',
			datafield: 'isSelected', width: 40, rendered: rendered
		});
		for (var i = 1; i < arr.length; i++) {
			gridStorage[0].columnsArr.push(arr[i]);
		}

		gridStorage[0].columnsArr.push({ text: i18n.t('serial', { lng: lang }), dataField: 'SerialNumber', editable: false, width: 150 });

		var updatedGridStorage = JSON.stringify(gridStorage);
		window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);

		$("#" + gID).jqxGrid({
			columns: gridStorage[0].columnsArr
		});
		$("#" + gID).jqxGrid('updatebounddata');
	}
	function getDeviceFieldsArr(gID) {
		var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));
		gridStorage[0].dataFields.push({ name: 'SerialNumber', map: 'DeviceDetail>SerialNumber' });
		var updatedGridStorage = JSON.stringify(gridStorage);
		window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);

		$("#" + gID).jqxGrid('updatebounddata');
	}



});
