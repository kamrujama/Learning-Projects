var uniqueDeviceIdForDeviceProfile;
var isViewAllowedForAlert = false;
isInactive = false;
isScheduleTabAllowed = false;
isScheduleTabAllowedForAction = false;
isScheduleTabAllowedForDownload = false;
statusAllowed = false;
var ComputedDeviceStatus = '';
var isPaymentTabletFlashDiv = false;

define(["knockout", "autho", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "utility", "appEnum"], function (ko, autho, koUtil, ADSearchUtil) {

	var lang = getSysLang();
	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	isDeviceIdChanged = false;
	isSerialNumberChanged = false;

	return function DeviceSearchdViewModel() {


		$('.grid-pop').css("display", "none");

		var self = this;

		$('#btnHierarchy').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btnHierarchy').click();
			}
		});

		//$('#btnDownloadSettings').bind('keyup', function (e) {
		//    if (e.keyCode === 13) {
		//        $('#btnDownloadSettings').click();
		//    }
		//});

		$('#btnEditGroup').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btnEditGroup').click();
			}
		});

		$('#btndelete').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btndelete').click();
			}
		});

		$('#btnBlacklist').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btnBlacklist').click();
			}
		});

		$('#btnRefresh').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btnRefresh').click();
			}
		});



		$("#deviceDockInCountDiv").hide();
		koUtil.isDeviceProfile(true);
		koUtil.savedSearchId = 0;
		isRelocationStatusHistoryFilter = false;
		iscommunicationHistoryGridFilter = false;
		iscontactDetailsGridFilter = false;
		isDownloadJobGridFilter = false;
		isdetailedDownloadStatusGridFilter = false;
		issystemKeysGridFilter = false;
		isdiagnosticGridFilter = false;
		isprocessGridFilter = false;
		isdetailedActionStatusGridFilter = false;
		isInformationGridCustomIdentifiersFilter = false;
		isInformationGridConnectivityFilter = false;
		isInformationGridProtectionFilter = false;
		isVCLDiagPageGridFilter = false;
		isContentJobGridDetailsFilter = false;
		isdetailedContentStatusGridFilter = false;
		ischangeHistoryGridFilter = false;
		isparameterAuditHistoryGridFilter = false;
		isAlertGridDetailsFilter = false;
		isDiagnosticGridResultFilter = false;
		isswapHistoryGridFilter = false;
		isdetailedVRKDownloadStatusGridFilter = false;
		isVRKDownloadJobGridDetailsFilter = false;
		isdatagridHardwareProfileGridFilter = false;
		isdatagridSimCardFilter = false;
		issoftwareGridFilter = false;
		isdatagridCertificateGridFilter = false;
		isdatagridJSONCertificateGridFilter = false;
		isdatagridPortsFilter = false;
		isdatagridIOModulesFilter = false;
		isdatagridEncryptionKeyFilter = false;
		isdatagridJSONKeyFilter = false;
		isfileHandlerGridFilter = false;
		XML_KeyPayloadVersion = "";

		ADSearchUtil.AdScreenName = 'deviceProfile';

		self.isbattery = ko.observable(false);
		self.observableModelPopupForDeviceProfile = ko.observable();
		self.observableHierarchyModelPopup = ko.observable();
		self.templateFlag = ko.observable(false);
		self.hierarchyFlag = ko.observable(true);

		self.observableDeviceProfileTempalte = ko.observable();

		loadelement('unloadTemplate', 'genericPopup');
		loadelementPopUp('unloadTemplate', 'genericPopup');
		loadHierarchyModelPopup('unloadTemplate', 'genericPopup');

		self.deviceModel = ko.observable();
		self.deviceReferenceSets = ko.observable();
		self.IsAutoDownloadEnabled = ko.observable();
		self.dockInCounter = ko.observable();
		self.isProfileStatusFailed = ko.observable(false);
		self.protocolName = ko.observable();
		self.serialNumber = ko.observable();
		self.txtdeviceIDValidate = ko.observable();
		self.deviceProfile = ko.observable();
		self.deviceProfileTemplateXml = ko.observableArray();
		self.deviceProfileData = ko.observable();
		self.deviceOut = ko.observable();
		self.schedule = ko.observableArray();
		self.software = ko.observableArray();
		self.deviceStatus = ko.observableArray();
		self.txtSerialNumber = ko.observable();
		self.device_Id = ko.observable();
		self.batteryLevel = ko.observable();

		oldSerialNumber = '';
		oldDeviceID = '';

		koUtil.isDeviceSearchScreen = null;

		self.CommunicationInfo = ko.observableArray();
		self.deviceHierarchyArr = ko.observableArray();
		self.deviceHierarchy = ko.observable();

		self.LastProfileDataReceivedDate = ko.observable('N/A');
		self.LastDiagnosticsProfileDataReceivedDate = ko.observable('N/A');
		self.LastHeartBeatReceived = ko.observable('N/A');
		self.AutomaticUpdateSchedule = ko.observable('N/A');
		self.veriShieldEncryption = ko.observable('N/A');

		self.timeZoneValue = ko.observable();
		self.ComputedDeviceStatus = ko.observable();
		self.selectedStatus = ko.observable();
		self.deviceProfileTabData = ko.observableArray();
		self.isBlankDeviceProfile = ko.observable(false);
		self.isNotBlankDeviceProfile = ko.observable(true);
		self.EnableSwapChkbox = ko.observable(false);

		//Care
		self.isCareEnabled = ko.observable(false);
		self.careData = ko.observable();
		self.modelStatus = ko.observable('');
		self.softwareStatus = ko.observable('');
		self.healthStatus = ko.observable('');
		self.healthAlerts = ko.observableArray();
		self.softwareVersions = ko.observable();

		//Rights related changes
		checkRights();
		checkRightsForAlerts();
		checkRightsForSchdule();

		//Check rights
		self.checkRights = function (screenName, rightsFor) {
			var retval = autho.checkRightsBYScreen(screenName, rightsFor);
			return retval;
		}

		//Check rights
		self.checkBlacklistRights = function () {
			var retval = checkRights('Devices', 'IsDeleteAllowed');
			return retval;
		}

		function checkRightsForAlerts() {
			var retval = autho.checkRightsBYScreen('Alerts', 'IsviewAllowed');
			isViewAllowedForAlert = retval;
		}

		//checkRightsForSchdule
		function checkRightsForSchdule() {
			var contentScheduleInfo = autho.checkRightsBYScreen('Content Schedule', 'IsModifyAllowed');
			var contentLibraryAllowed = autho.checkRightsBYScreen('Content Library', 'IsviewAllowed');
			var downloadLibraryAllowed = autho.checkRightsBYScreen('Download Library', 'IsviewAllowed');
			statusAllowed = autho.checkRightsBYScreen('Devices', 'IsModifyAllowed');
			if (statusAllowed == true) {
				$("#btncomputedStatus").removeClass('disabled');
			} else {
				$("#btncomputedStatus").addClass('disabled');
			}
			if (contentScheduleInfo == true && contentLibraryAllowed == true) {
				isScheduleTabAllowed = true;
			} else {
				isScheduleTabAllowed = false;
			}

			var diagnosticScheduleInfo = autho.checkRightsBYScreen('Diagnostic Actions', 'IsModifyAllowed');
			if (diagnosticScheduleInfo == true) {
				isScheduleTabAllowedForAction = true;
			} else {
				isScheduleTabAllowedForAction = false;
			}

			var downloadScheduleInfo = autho.checkRightsBYScreen('Download Schedule', 'IsModifyAllowed');
			if (downloadScheduleInfo == true && downloadLibraryAllowed == true) {
				isScheduleTabAllowedForDownload = true;
			} else {
				isScheduleTabAllowedForDownload = false;
			}
		}


		var nestedRoutePath = getRouteUrl();
		var routeurl = nestedRoutePath[1];
		if (routeurl.indexOf('?') != -1) {
			deviceId = routeurl.substring(0, routeurl.indexOf('?'));
		} else {
			deviceId = routeurl;
		}
		koUtil.deviceProfileUniqueDeviceId = deviceId;


		// globalUniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
		mainMenuSetSelection("deviceProfile");
		removeSetMenuSelection("deviceProfile");

		if (globalUniqueDeviceId == undefined || globalUniqueDeviceId == null || koUtil.deviceProfileUniqueDeviceId == 0 || koUtil.deviceProfileUniqueDeviceId == "Device") {

			if (isNumeric(koUtil.deviceProfileUniqueDeviceId)) {
				self.isBlankDeviceProfile(false);
				self.isNotBlankDeviceProfile(true);

				globalUniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
			} else {
				self.isBlankDeviceProfile(true);
				self.isNotBlankDeviceProfile(false);
			}
		} else {
			if (koUtil.deviceProfileUniqueDeviceId == "device") {
				koUtil.deviceProfileUniqueDeviceId = globalUniqueDeviceId;
			}

			self.isBlankDeviceProfile(false);
			self.isNotBlankDeviceProfile(true);
		}

		var sessionDevProfileUniqueDeviceId = JSON.parse(sessionStorage.getItem("DevProfileUniqueDeviceId"));
		if (sessionDevProfileUniqueDeviceId != null || sessionDevProfileUniqueDeviceId != "" || sessionDevProfileUniqueDeviceId != undefined) {
			if (sessionDevProfileUniqueDeviceId == null || sessionDevProfileUniqueDeviceId == "null") {

			} else {
				self.isBlankDeviceProfile(false);
				self.isNotBlankDeviceProfile(true);
				globalUniqueDeviceId = sessionDevProfileUniqueDeviceId;
				koUtil.deviceProfileUniqueDeviceId = globalUniqueDeviceId;
			}
		} else {
			self.isBlankDeviceProfile(true);
			self.isNotBlankDeviceProfile(false);
		}

		var hasEditDIDRights = true;
		var hasSoftwareEditRights = true;
		var isUserAllowedToEdit = true;
		var isDownloadsScheduleAvailable = false;
		var isDownloadsActionAvailable = false;
		var isContentScheduleAvailable = false;
		$("#enableForSwapId").hide();

		if (self.isNotBlankDeviceProfile() == true) {
			GetDevice();
			if (isDirectParameterActivation == true) {
				$("#activateParam").hide();
			} else {
				$("#activateParam").show();
			}
			//getSystemConfigurationForValidateActivateParameters();
			//getSystemConfigurationForSwapApprovalStatus();
		} else {
			var blankDevProfileHeight = $(window).height() - $(".fixed-footer").height() - 140;
			$("#blankDevProfile").css("min-height", blankDevProfileHeight);
		}

		//Set tab to initial state/////
		var pageName = "deviceProfile";
		var initpagObj = initPageStorageObj(pageName);
		var PageStorage = initpagObj.PageStorage;

		if (PageStorage) {
			if (PageStorage[0].selectedTabName && PageStorage[0].selectedTabName != '') {
				PageStorage[0].selectedTabName = null;
				var updatedPageStorage = JSON.stringify(PageStorage);
				window.sessionStorage.setItem(pageName + "PageStorage", updatedPageStorage);
			}
		}

		var pageNameArray = ["deviceDetails", "communicationHistory", "downloadHistory", "diagnosticDetails", "diagnosticHistory", "contentHistory", "vrkBundlesLibrary"];
		for (var i = 0; i < pageNameArray.length; i++) {
			var initpagObj = initPageStorageObj(pageNameArray[i]);
			var PageStorage = initpagObj.PageStorage;
			if (PageStorage) {
				if (PageStorage[0].selectedVerticalTabName && PageStorage[0].selectedVerticalTabName != '') {
					PageStorage[0].selectedVerticalTabName = null;
					var updatedPageStorage = JSON.stringify(PageStorage);
					window.sessionStorage.setItem(pageNameArray[i] + "PageStorage", updatedPageStorage);
				}
			}
		}
		////////////////////
		function getDeviceSubStatusForDeviceProfile(deviceProfileTemplateXml) {
			var getDeviceSubStatusReq = new Object();
			var Export = new Object();
			var Selector = new Object();
			var Pagination = new Object();
			var coulmnfilter = new Object();
			deviceSubStatusDataUser = new Array();

			Pagination.HighLightedItemId = null;
			Pagination.PageNumber = 1;
			Pagination.RowsPerPage = 500;

			Selector.SelectedItemIds = null;
			Selector.UnSelectedItemIds = null;
			Export.IsAllSelected = false;
			Export.IsExport = false;

			getDeviceSubStatusReq.Export = Export;
			getDeviceSubStatusReq.Pagination = Pagination;
			getDeviceSubStatusReq.Selector = Selector;

			coulmnfilter.FilterList = null;
			coulmnfilter.GridId = 'DeviceSubStatus';
			coulmnfilter.SortList = null;

			getDeviceSubStatusReq.ColumnSortFilter = coulmnfilter;
			getDeviceSubStatusReq.DeviceSubStatusType = ENUM.get('SUB_STATUS_NON_INTERNAL');
			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

						if (data && data.getDeviceSubStatusResp) {
							data.getDeviceSubStatusResp = $.parseJSON(data.getDeviceSubStatusResp);
						}

						if (data.getDeviceSubStatusResp) {
							var subStatusobj = new Object();
							subStatusobj.CreatedByUserName = '';
							subStatusobj.CreatedOn = '';
							subStatusobj.Description = '';
							subStatusobj.DeviceStatus = 'Inactive';
							subStatusobj.DeviceStatusConfigId = 0;
							subStatusobj.ModifiedByUserName = '';
							subStatusobj.ModifiedOn = null;
							subStatusobj.SubStatus = '--No-Sub-Status--'
							subStatusobj.SubStatusId = 0;
							subStatusobj.SubStatusName = (null)
							subStatusobj.SubStatusType = '';

							deviceSubStatusDataUser.push(subStatusobj);
							if (data.getDeviceSubStatusResp.DeviceSubStatus != undefined) {
								for (var i = 0; i < data.getDeviceSubStatusResp.DeviceSubStatus.length; i++) {
									deviceSubStatusDataUser.push(data.getDeviceSubStatusResp.DeviceSubStatus[i]);
								}
							}
							showHideControl(deviceProfileTemplateXml);
						}
					}
				}
			}

			var method = 'GetDeviceSubStatus';
			var params = '{"token":"' + TOKEN() + '","getDeviceSubStatusReq":' + JSON.stringify(getDeviceSubStatusReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		//-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
		$('#modelChangestatusConfirmation').on('shown.bs.modal', function (e) {
			$('#btnChangStatusNo').focus();

		});
		$('#modelChangestatusConfirmation').keydown(function (e) {
			if ($('#btnChangStatusNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#btnChangStatusYes').focus();
			}
		});

		$('#blacklistModel').on('shown.bs.modal', function (e) {
			$('#btnChangStatusNo').focus();

		});
		$('#blacklistModel').keydown(function (e) {
			if ($('#btnChangStatusNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#btnChangStatusYes').focus();
			}
		});
		$('#enableSwapIsCheck').on('shown.bs.modal', function (e) {
			$('#enableSwapIsCheck_Confo_No').focus();

		});
		$('#enableSwapIsCheck').keydown(function (e) {
			if ($('#enableSwapIsCheck_Confo_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#enableSwapIsCheck_Conf_Yes').focus();
			}
		});
		$('#enableSwapModel').on('shown.bs.modal', function (e) {
			$('#enableSwapModel_Confo_No').focus();

		});
		$('#enableSwapModel').keydown(function (e) {
			if ($('#enableSwapModel_Confo_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#enableSwapModel_Confo_Yes').focus();
			}
		});
		$('#deleteModel').on('shown.bs.modal', function (e) {
			$('#deleteModel_Confo_No').focus();

		});
		$('#deleteModel').keydown(function (e) {
			if ($('#deleteModel_Confo_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#deleteModel_Confo_Yes').focus();
			}
		});
		//------------------------------------------------------------------------------------------------------------------------


		$('#deviceIdEditPopupHeader').mouseup(function () {
			$("#deviceIdEditPopupContent").draggable({ disabled: true });
		});

		$('#deviceIdEditPopupHeader').mousedown(function () {
			$("#deviceIdEditPopupContent").draggable({ disabled: false });
		});

		function checkRights() {
			SetUserInputAccessForEdit(false);
			//   $("#btncomputedStatus").prop("disabled", false);
			$("#btndelete").prop("disabled", true);
			$("#btnBlacklist").prop("disabled", true);
			$("#softwareBtn").prop("disabled", true);
			$("#btnSchedule").prop("disabled", false);
			var retval = autho.checkRightsBYScreen('Devices', 'IsModifyAllowed');
			if (retval == true) {
				//    $("#btncomputedStatus").prop("disabled", false);
				SetUserInputAccessForEdit(true);
			}

			var retvalDelete = autho.checkRightsBYScreen('Devices', 'IsDeleteAllowed');
			if (retvalDelete == true) {
				$("#btndelete").prop("disabled", false);
				$("#btnBlacklist").prop("disabled", false);
			}

			var retvalDownloadSchedule = autho.checkRightsBYScreen('Download Schedule', 'IsModifyAllowed');
			if (retvalDownloadSchedule == true) {
				isDownloadsScheduleAvailable = true;
			}

			var retvalDiagnosticAction = autho.checkRightsBYScreen('Diagnostic Actions', 'IsModifyAllowed');
			if (retvalDiagnosticAction == true) {
				isDownloadsActionAvailable = true;
			}

			var retvalContentSchedule = autho.checkRightsBYScreen('Content Schedule', 'IsModifyAllowed');
			if (retvalContentSchedule == true) {
				isContentScheduleAvailable = true;
			}

			if (retvalDownloadSchedule == false && retvalDiagnosticAction == false && retvalContentSchedule == false) {
				$("#btnSchedule").prop("disabled", true);
			}

			if (isDownloadsScheduleAvailable == true) {
				$("#softwareBtn").prop("disabled", false);

			}
		}

		//Enable swap

		self.updateDeviceForSwapOut = function () {
			$('#enableSwapModel').modal('show');
			if ($("#swapCheckBox").is(':checked')) {
				$("#swapLabel").text(i18n.t('enable_swap_out', { lng: lang }));
			} else {
				$("#swapLabel").text(i18n.t('disable_swap_out', { lng: lang }));
			}
		}

		self.checkboxCancel = function () {
			if (koUtil.isCheckboxEnabled == ENUM.get('SWAP_ENABLED')) {
				self.EnableSwapChkbox(true);
			} else {
				self.EnableSwapChkbox(false);
			}
		}

		self.updateDeviceFunction = function () {
			$('#enableSwapModel').modal('hide');


			if ($("#swapCheckBox").is(':checked')) {
				var deviceSwapStatus = ENUM.get('SWAP_ENABLED');
			} else {
				var deviceSwapStatus = ENUM.get('SWAP_DISABLED');
			}

			self.swapCheckBoxCall(deviceSwapStatus, null);
		}


		self.swapCheckBoxCall = function (deviceSwapStatus, isdevIdModalide) {
			var updateDeviceReq = new Object();
			var Device = new Object();
			Device.Status = ENUM.get(self.ComputedDeviceStatus());

			var Selector = new Object();

			Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
			Selector.UnSelectedItemIds = null;

			var SubStatus = new Object();
			SubStatus.SubStatusId = koUtil.globalSubStatusIdForDeviceProfile;
			SubStatus.SubStatusName = koUtil.globalSubStatusForDeviceProfile;

			updateDeviceReq.Device = Device;
			updateDeviceReq.DeviceSearch = null;
			updateDeviceReq.Selector = Selector;
			updateDeviceReq.SubStatus = SubStatus;
			Device.DeviceSwapStatus = deviceSwapStatus;
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (isdevIdModalide == "true") {
							$("#deviceIdEditPopup").modal('hide');
						} else {
							if ($("#swapCheckBox").is(':checked')) {
								openAlertpopup(0, 'swap_success');

							} else {
								openAlertpopup(0, 'disabled_swap_success');
							}
						}
						GetDevice();
					}
				}
			}
			var method = 'UpdateDevice';
			var params = '{"token":"' + TOKEN() + '","updateDeviceReq":' + JSON.stringify(updateDeviceReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true)
		}
		function SetUserInputAccessForEdit(state) {
			$("#saveCustomAttribute").prop("disabled", state);
			//   $("#btncomputedStatus").prop("disabled", state);
			$("#editBtnForSerialNumber").prop("visible", state);
			hasEditDIDRights = state;
			hasSoftwareEditRights = state;
			if (state == true) {
				isUserAllowedToEdit = true;
				$("#editBtnForSerialNumber").prop("disabled", false);
			} else {
				$("#editBtnForSerialNumber").prop("disabled", true);
			}
		}
		//Blcklist click
		self.blacklistBtnClick = function () {
			$('#blacklistModel').modal('show');
		}
		//Delete click
		self.deleteBtnClick = function () {
			if (koUtil.serialNumber == '') {
				$("#delete").text(i18n.t('delete_Single_Device_Confirmation_without_SerialNumber', { lng: lang }));
			} else {
				$("#delete").text(i18n.t('delete_device_alert_in_deviceProfile', { lng: lang }));
			}

			$('#deleteModel').modal('show');
		}

		self.blacklistClicked = function () {
			$('#blacklistModel').modal('hide');
			var deleteDeviceReq = new Object();
			var DeviceStatusUpdate = new Object();
			var deviceStatusArr = new Array();
			DeviceStatusUpdate.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
			DeviceStatusUpdate.Status = "Blacklisted";
			DeviceStatusUpdate.SerialNumber = koUtil.serialNumber;
			DeviceStatusUpdate.ModelName = koUtil.ModelName;
			DeviceStatusUpdate.DeviceId = koUtil.deviceId;
			DeviceStatusUpdate.Protocol = koUtil.Protocol;
			DeviceStatusUpdate.IsSoftwareAssigned = koUtil.IsSoftwareAssigned;
			DeviceStatusUpdate.IsEnabledForAutoDownload = koUtil.IsEnabledForAutoDownload;
			DeviceStatusUpdate.IsDirectReferenceSetAssigned = koUtil.IsDirectReferenceSetAssigned;
			DeviceStatusUpdate.HierarchyId = koUtil.HierarchyId;
			DeviceStatusUpdate.ModelId = koUtil.ModelId;
			DeviceStatusUpdate.InternalModelName = koUtil.InternalModelName;
			DeviceStatusUpdate.Family = koUtil.deviceFamily;
			DeviceStatusUpdate.AssignmentType = koUtil.AssignmentType;
			deviceStatusArr.push(DeviceStatusUpdate);

			deleteDeviceReq.Status = "Blacklisted";
			deleteDeviceReq.DeviceList = deviceStatusArr;
			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(0, 'alert_device_black_success');
						GetDevice();
					} else if (data.responseStatus.StatusCode == AppConstants.get('SELECTED_DEVICE_MODIFIED')) {
						openAlertpopup(1, 'selected_device_modified');
					}
				}
				if (error) {
					retval = "";
				}
			}

			var method = 'DeleteDevice';
			var params = '{"token":"' + TOKEN() + '","deleteDeviceReq":' + JSON.stringify(deleteDeviceReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		self.deleteClicked = function (continueFlag) {
			$('#deleteModel').modal('hide');
			var deleteDeviceReq = new Object();
			var DeviceStatusUpdate = new Object();
			var deviceStatusArr = new Array();
			DeviceStatusUpdate.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
			DeviceStatusUpdate.Status = "Deleted";
			DeviceStatusUpdate.SerialNumber = koUtil.serialNumber;
			DeviceStatusUpdate.ModelName = koUtil.ModelName;
			DeviceStatusUpdate.DeviceId = koUtil.deviceId;
			DeviceStatusUpdate.Protocol = koUtil.Protocol;
			DeviceStatusUpdate.IsSoftwareAssigned = koUtil.IsSoftwareAssigned;
			DeviceStatusUpdate.IsEnabledForAutoDownload = koUtil.IsEnabledForAutoDownload;
			DeviceStatusUpdate.IsDirectReferenceSetAssigned = koUtil.IsDirectReferenceSetAssigned;
			DeviceStatusUpdate.HierarchyId = koUtil.HierarchyId;
			DeviceStatusUpdate.ModelId = koUtil.ModelId;
			DeviceStatusUpdate.InternalModelName = koUtil.InternalModelName;
			DeviceStatusUpdate.Family = koUtil.deviceFamily;
			DeviceStatusUpdate.AssignmentType = koUtil.AssignmentType;
			deviceStatusArr.push(DeviceStatusUpdate);

			deleteDeviceReq.Status = "Deleted";
			deleteDeviceReq.DeviceList = deviceStatusArr;
			deleteDeviceReq.IsContinue = continueFlag;
			function callbackFunction(data, error) {
				if (data) {

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(0, 'alert_device_delete_success');
						redirectToLocation(menuJsonData, 'deviceSearch');
						globalUniqueDeviceId = null;
						koUtil.deviceProfileUniqueDeviceId = "Device";
						window.sessionStorage.setItem("DevProfileUniqueDeviceId", null);
					} else if (data.responseStatus.StatusCode == AppConstants.get('SELECTED_DEVICE_MODIFIED')) {
						openAlertpopup(1, 'selected_device_modified');
					}
				}
				if (error) {
					retval = "";
				}
			}

			var method = 'DeleteDevice';
			var params = '{"token":"' + TOKEN() + '","deleteDeviceReq":' + JSON.stringify(deleteDeviceReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		self.undeleteClicked = function () {
			$('#undeleteModel').modal('hide');
			var updateDeviceStatusReq = new Object();
			var DeviceStatusUpdate = new Object();
			var deviceStatusArr = new Array();
			DeviceStatusUpdate.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
			DeviceStatusUpdate.Status = "Undeleted";
			DeviceStatusUpdate.SerialNumber = koUtil.serialNumber;
			DeviceStatusUpdate.ModelName = koUtil.ModelName;
			DeviceStatusUpdate.DeviceId = koUtil.deviceId;
			DeviceStatusUpdate.IsSoftwareAssigned = koUtil.IsSoftwareAssigned;
			DeviceStatusUpdate.IsEnabledForAutoDownload = koUtil.IsEnabledForAutoDownload;
			DeviceStatusUpdate.IsDirectReferenceSetAssigned = koUtil.IsDirectReferenceSetAssigned;
			DeviceStatusUpdate.HierarchyId = koUtil.HierarchyId;
			DeviceStatusUpdate.ModelId = koUtil.ModelId;

			deviceStatusArr.push(DeviceStatusUpdate);

			updateDeviceStatusReq.Status = "Undeleted";
			updateDeviceStatusReq.DeviceList = deviceStatusArr;
			updateDeviceStatusReq.IsContinue = false;

			function callbackFunction(data, error) {
				if (data) {

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(0, 'alert_device_undelete_success');
						GetDevice();
					} else if (data.responseStatus.StatusCode == AppConstants.get('SELECTED_DEVICE_MODIFIED')) {
						openAlertpopup(1, 'selected_device_modified');
					}
				}
				if (error) {
					retval = "";
				}
			}

			var method = 'UpdateDeviceStatus';
			var params = '{"token":"' + TOKEN() + '","updateDeviceStatusReq":' + JSON.stringify(updateDeviceStatusReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}
		modelReposition();
		
		self.redirectToDeviceLogs=function(){			
			globalDeviceDataForGetLogs=new Object();
			if (koUtil.deviceOut.SerialNumber != '' && koUtil.deviceOut.SerialNumber != null) {
				globalDeviceDataForGetLogs.serialNumber=koUtil.deviceOut.SerialNumber;
			}
			if(koUtil.deviceOut.DeviceId != "" && koUtil.deviceOut.DeviceId != 'N/A' && koUtil.deviceOut.DeviceId != null){
				globalDeviceDataForGetLogs.DeviceId=koUtil.deviceOut.DeviceId;
			}							
			redirectToLocation(menuJsonData, 'troubleShoot');
		}
		
		//Open Pop ups
		self.openPopup = function (popupName) {
			self.templateFlag(true);
			if (popupName == "modelSoftwareAssignment") {
				self.observableModelPopupForDeviceProfile('unloadTemplate');
				isFromAddDevice = false;
				loadelementPopUp('modelSoftwareAssignment', 'device');
				$('#deviceProfileModel').modal('show');
			} else if (popupName == "modalHierarchy") {
				koUtil.isEditHierarchy(true);
				self.hierarchyFlag(true);
				loadHierarchyModelPopup(popupName, 'genericPopup');
				$('#deviceProfileHierachyModal').modal('show');
			} else if (popupName == "modelAddGroupAssignment") {
				loadelementPopUp(popupName, 'device');
				$('#deviceProfileModel').modal('show');
			} else if (popupName == "modelDownloadSettings") {
				loadelementPopUp(popupName, 'device');
				$('#deviceProfileModel').modal('show');
			} else if (popupName == "modelDeviceProfileEditTemplate") {
				koUtil.viewParameterTemplateOnDevice = false;
				loadelement(popupName, 'device/deviceProfileTemplates');
				$('#modelParameterId').modal('show');
			} else if (popupName == "modelDeviceProfileParameterAssignment") {
				loadelement(popupName, 'device/deviceProfileTemplates');
				$('#modelParameterId').modal('show');
			} else if (popupName == "modelDeviceProfileEditTemplateVPDX") {
				loadelement(popupName, 'device/deviceProfileTemplates');
				$('#modelParameterId').modal('show');
			}
		}


		//Cancel Popup
		self.cancelPopup = function (observableModelPopup) {
			self.observableModelPopupForDeviceProfile('unloadTemplate');
			$('#deviceProfileModel').modal('hide');
		}

		self.unloadTempPopup = function (popupName) {

			self.observableModelPopupForDeviceProfile('unloadTemplate');
			$("#deviceProfileModel").modal('hide');
			koUtil.isFromAddDeviceforDirect(false);
		}

		self.gridIdForShowHide = ko.observable();
		self.gridIdForShowHide(null);

		//unload Hierarchy popup



		$('#deviceProfileHierachyModalHeader').mouseup(function () {
			$("#deviceProfileHierachyModalContent").draggable({ disabled: true });
		});

		$('#deviceProfileHierachyModalHeader').mousedown(function () {
			$("#deviceProfileHierachyModalContent").draggable({ disabled: false });
		});


		//Cancel Hierarchy 
		self.cancelHierarchy = function () {
			self.observableHierarchyModelPopup('unloadTemplate');
			$('#deviceProfileHierachyModal').modal('hide');
			$("#deviceProfileHierachyModalContent").css('left', '');
			$("#deviceProfileHierachyModalContent").css('top', '');
		}


		self.generateModelName = function (modelname) {
			var str = modelname;
			str = str.replace(/[\/ ]/g, '');
			if (str.indexOf("+")) {
				str = str.replace('+', 'Plus');
			}
			return str;

		}

		self.getModelStatus = function (name) {
            var str = !_.isEmpty(name()) ? name().toLowerCase() : '';
			return str;
		}

		self.getSoftwareStatus = function (name) {
            var str = !_.isEmpty(name()) ? name().toLowerCase() : '';
			return str;
		}

        self.getHealthStatus = function (name) {
            var str = !_.isEmpty(name()) ? name().toLowerCase() : '';
			return str;
		}

		self.applicationData = ko.observableArray();
		self.refereshHierarchyfordeviceProfile = function () {
			GetDevice();
		}
		function CheckUndefined(res) {
			if (res)
				return res + ' KB';
			else
				return "-";
		}
		function CheckNaN(res) {
			if (res)
				return res + ' %';
			else
				return "Not available";
		}
		function GetDevice() {
			$("#loadingDiv").show();
			var deviceId = koUtil.deviceProfileUniqueDeviceId;
			var deviceIn = new Object();
			deviceIn.UniqueDeviceId = deviceId;

			var callBackfunction = function (data, error) {
				$("#loadingDiv").hide();
				if (data) {

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						koUtil.deviceProfileKeyInventoryData = new Array();
						if (data.deviceOut && data.deviceOut != "null") {
							data.deviceOut = $.parseJSON(data.deviceOut);

							XML_KeyPayloadVersion = data.deviceOut.XML_KeyPayloadVersion;
							self.batteryLevel(data.batteryLevel);
							ComputedDeviceStatus = data.deviceOut.ComputedDeviceStatus;
							self.deviceOut(data.deviceOut);
							self.ComputedDeviceStatus(data.deviceOut.ComputedDeviceStatus);
							koUtil.deviceSponsorName("");
							if (data.deviceOut.DeviceInfo.SponsorName) {
								koUtil.deviceSponsorName(data.deviceOut.DeviceInfo.SponsorName);
							}
							uniqueDeviceIdForDeviceProfile = koUtil.deviceProfileUniqueDeviceId;
							koUtil.deviceOut = data.deviceOut;
							koUtil.tabletProfileData = data.deviceOut.TabletProfileData;
							if (data.deviceOut.Model.ModelName == '' || data.deviceOut.Model.ModelName == null) {
								data.deviceOut.Model.ModelName = 'N/A';
								self.deviceModel(data.deviceOut.Model);
							} else {
								self.deviceModel(data.deviceOut.Model);
							}
							if (data.deviceOut.DeviceDownloadOptions.IsEnabledForAutoDownload) {
								self.IsAutoDownloadEnabled('Y');
							} else {
								self.IsAutoDownloadEnabled('N');
							}

							if (data.groups)
								koUtil.deviceProfileGroup = $.parseJSON(data.groups);
							else
								koUtil.deviceProfileGroup = [];
							koUtil.deviceFamily = data.deviceOut.Model.Family;
							koUtil.iPAddress = data.deviceOut.IPAddress;
							koUtil.subStatusForDeviceProfile = data.deviceOut.SubStatus;
							koUtil.ModelName = data.deviceOut.Model.ModelName;

							koUtil.IsSoftwareAssigned = data.deviceOut.IsSoftwareAssigned;
							koUtil.IsEnabledForAutoDownload = data.deviceOut.DeviceDownloadOptions.IsEnabledForAutoDownload;
							koUtil.IsDirectReferenceSetAssigned = data.deviceOut.IsDirectReferenceSetAssigned;
							koUtil.HierarchyId = data.deviceOut.Hierarchy.Id;
							koUtil.ModelId = data.deviceOut.Model.ModelId;
							koUtil.InternalModelName = data.deviceOut.Model.InternalModelName;

							if (koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_FAMILY'))
								isPaymentTabletFlashDiv = true;
							else
								isPaymentTabletFlashDiv = false;

							koUtil.isCheckboxEnabled = data.deviceOut.DeviceSwapStatus;
							koUtil.Protocol = data.deviceOut.Protocol;
							koUtil.IsCallbackImmediate = data.deviceOut.IsCallbackImmediate;
							koUtil.IsDldSingleSession = data.deviceOut.IsDldSingleSession;
							koUtil.IsAutoDownloadEnabled = data.deviceOut.DeviceDownloadOptions.IsEnabledForAutoDownload;

							//if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
							//    $("#rowThree").show();
							//    $("#btnDownloadSettings").show();
							//}
							//else {
							//    $("#rowThree").hide();
							//    $("#btnDownloadSettings").hide();
							//}

							if (data.deviceOut.DeviceSwapStatus == ENUM.get('SWAP_ENABLED')) {
								self.EnableSwapChkbox(true);
							} else {
								self.EnableSwapChkbox(false);
							}

							if (data.deviceOut.DeviceReferenceSets.ReferenceSetId == 0) {
								data.deviceOut.DeviceReferenceSets.ReferenceSetName = "N/A";
								self.deviceReferenceSets(data.deviceOut.DeviceReferenceSets);
								koUtil.ReferenceSetName = '';
								$("#idReferenceSetName").attr('title', "");
							} else {
								koUtil.ReferenceSetName = data.deviceOut.DeviceReferenceSets.ReferenceSetName;
								self.deviceReferenceSets(data.deviceOut.DeviceReferenceSets);
								if (data.deviceOut.DeviceReferenceSets.IsDirectAssignment) {
									$("#idReferenceSetName").attr('title', 'Direct Assignment');
								} else {
									$("#idReferenceSetName").attr('title', data.deviceOut.DeviceReferenceSets.ReferenceSetHierarchyPath);
								}
							}

							if (data.deviceOut.DockInCount >= 0) {
								data.deviceOut.DockInCount = JSON.stringify(data.deviceOut.DockInCount);
								self.dockInCounter(data.deviceOut.DockInCount);
							}
							else if (data.deviceOut.DockInCount == "" || data.deviceOut.DockInCount == null) {
								data.deviceOut.DockInCount = "N/A";
								self.dockInCounter(data.deviceOut.DockInCount);
							}

							if (data.deviceOut.Protocol != '') {
								self.protocolName(data.deviceOut.Protocol);
							}

							if (data.deviceOut.SerialNumber == '' || data.deviceOut.SerialNumber == null) {
								//self.serialNumber('N/A');
								self.serialNumber();
								self.txtSerialNumber('N/A');
							} else {
								self.serialNumber(data.deviceOut.SerialNumber);
								self.txtSerialNumber(data.deviceOut.SerialNumber);
							}
							if (data.deviceOut.DeviceId == "" || data.deviceOut.DeviceId == 'N/A' || data.deviceOut.DeviceId == null) {
								self.txtdeviceIDValidate('');
							} else {
								self.txtdeviceIDValidate(data.deviceOut.DeviceId);
							}
							oldSerialNumber = data.deviceOut.SerialNumber;
							oldDeviceID = data.deviceOut.DeviceId;
							koUtil.serialNumber = data.deviceOut.SerialNumber;
							if (data.deviceOut.DeviceId == "" || data.deviceOut.DeviceId == null) {

								self.device_Id("N/A");
								koUtil.deviceId = data.deviceOut.DeviceId;

							} else {
								koUtil.deviceId = data.deviceOut.DeviceId;
								self.device_Id(data.deviceOut.DeviceId);
							}

							if (data.isKeyExist == true) {
								$('#txtSerialNumber').prop('disabled', true);
							} else {
								$('#txtSerialNumber').prop('disabled', false);
							}

							//Software Assignment
							koUtil.IsSoftwareAssigned = data.deviceOut.IsSoftwareAssigned;
							koUtil.AssignmentType = data.deviceOut.AssignmentType;
							koUtil.IsDirectAssignment = data.deviceOut.DeviceReferenceSets.IsDirectAssignment;

							self.deviceHierarchyArr(data.deviceOut.Hierarchy);
							self.deviceHierarchy(data.deviceOut.Hierarchy.HierarchyFullPath);

							var timeZoneId = data.deviceOut.Hierarchy.TimeZoneId;
							var source = _.where(getAllTimeZones, { TimeZoneId: timeZoneId });

							if (source != '') {
								self.timeZoneValue(source[0].Description);
							}
							koUtil.deviceHierarchy(data.deviceOut.Hierarchy.HierarchyFullPath);
						}

						if (!_.isEmpty(data.careData)) {							
							data.careData = $.parseJSON(data.careData);
							self.careData(data.careData);

							self.isCareEnabled(true);
							$("#imgModelStatus").removeClass('hide');
							$("#softwareStatusDiv").removeClass('hide');
							$("#healthStatusDiv").removeClass('hide');

							//Model
							self.modelStatus(data.careData.ModelStatus);

							//Software
							if (!_.isEmpty(data.careData.Software)) {
								self.softwareStatus(data.careData.Software.Status);
								var softwareVersions = new Array();
								softwareVersions = data.careData.Software.Versions;
								if (!_.isEmpty(softwareVersions)) {
									for (var p = 0; p < softwareVersions.length; p++) {
										softwareVersions[p].Version = softwareVersions[p].Key + ' : ' + softwareVersions[p].Value;
									}
								}
								self.softwareVersions(softwareVersions);
							}

							//Health
							if (!_.isEmpty(data.careData.Health)) {
								self.healthStatus(data.careData.Health.Status);
								var healthAlerts = data.careData.Health.Alerts;
								var alerts = new Array();
								if (!_.isEmpty(healthAlerts)) {
									for (var q = 0; q < healthAlerts.length; q++) {
										var alertToolTip = healthAlerts[q].toLowerCase();
										var alertIcon = AppConstants.get(healthAlerts[q].toUpperCase());
										var healthObject = new Object();
										healthObject.Alert = alertIcon;
										healthObject.Description = i18n.t(alertToolTip, { lng: lang });
										alerts.push(healthObject);
									}
									self.healthAlerts(alerts);
								}
							}							
						}

						if (data.deviceProfile != null) {
							//$("#nodataDiv").hide();

							if (data.deviceProfile.ProfileStatus == "Failed") {
								self.isProfileStatusFailed(true);
								$("#profileIncomplete").attr('title', i18n.t('Device_Profile_Incomplete_Tooltip', { lng: lang }));
							} else {
								self.isProfileStatusFailed(false);
							}							
							
							self.deviceProfileData($.xml2json(data.deviceProfile.ProfileData));
							koUtil.deviceProfileData([]);
							koUtil.deviceProfileData(self.deviceProfileData());
							var deviceProfileData1 = self.deviceProfileData();
							if (deviceProfileData1.DataSet) {
								for (var i = 0; i < deviceProfileData1.DataSet.length; i++) {

									if (deviceProfileData1.DataSet[i].Identifier == 'VCLInfo') {

										if (deviceProfileData1.DataSet[i].DataSetContent.VCLInfo.EncrEnabled == 0) {
											self.veriShieldEncryption('Off');
										} else {
											self.veriShieldEncryption('On');
										}
									} else {
										self.veriShieldEncryption('N/A');
									}

									if (deviceProfileData1.DataSet[i].Identifier == 'MemoryProfile') {
										var memoryDataSetContent = deviceProfileData1.DataSet[i].DataSetContent.MemoryProfile;

										if (deviceProfileData1.DataSet[i].DataSetContent.MemoryProfile != null) {

											var flashPer = calculatePercentage(memoryDataSetContent.FlashFreeSpace, memoryDataSetContent.TotalFlashSize);
										} else {
											//var memoryDataSetContent = "N/A";
											var flashPer = '-';
											memoryDataSetContent.FlashFreeSpace = "-";
											memoryDataSetContent.TotalFlashSize = "-";
										}

										if (isPaymentTabletFlashDiv == false) {

											$("#flashPer").text(CheckNaN(flashPer));
											$("#flashFree").text(i18n.t('free', { lng: lang }) + CheckUndefined(memoryDataSetContent.FlashFreeSpace));
											$("#flashTotal").text(i18n.t('total', { lng: lang }) + CheckUndefined(memoryDataSetContent.TotalFlashSize));
										}
										else {
											//--- for tablet 
											var Tablet_flashPer = (data.deviceProfile.TabletAvailableFlashMemory / data.deviceProfile.TabletTotalFlashMemory) * 100;
											$("#TabletflashPer").text(CheckNaN(Math.round(Tablet_flashPer)));
											$("#TabletflashFree").text(i18n.t('free', { lng: lang }) + CheckUndefined(data.deviceProfile.TabletAvailableFlashMemory));
											$("#TabletflashTotal").text(i18n.t('total', { lng: lang }) + CheckUndefined(data.deviceProfile.TabletTotalFlashMemory));

											//-- payment
											var Payment_flashPer = (memoryDataSetContent.FlashFreeSpace / memoryDataSetContent.TotalFlashSize) * 100;
											$("#PaymentflashPer").text(CheckNaN(Math.round(Payment_flashPer)));
											$("#PaymentflashFree").text(i18n.t('free', { lng: lang }) + CheckUndefined(memoryDataSetContent.FlashFreeSpace));
											$("#PaymentflashTotal").text(i18n.t('total', { lng: lang }) + CheckUndefined(memoryDataSetContent.TotalFlashSize));
										}

										if (deviceProfileData1.DataSet[i].DataSetContent.MemoryProfile != null) {

											var ramPer = calculatePercentage(memoryDataSetContent.RamFreeSpace, memoryDataSetContent.TotalRamSize);

										} else {
											var ramPer = '-';
											memoryDataSetContent.RamFreeSpace = '-';
											memoryDataSetContent.TotalRamSize = '-';
										}
										if (isPaymentTabletFlashDiv == false) {
											$("#ramPer").text(CheckNaN(ramPer));
											$("#ramFree").text(i18n.t('free', { lng: lang }) + CheckUndefined(memoryDataSetContent.RamFreeSpace));
											$("#ramTotal").text(i18n.t('total', { lng: lang }) + CheckUndefined(memoryDataSetContent.TotalRamSize));
										}
										else {
											//--- for tablet 
											var Tablet_ramPer = (data.deviceProfile.TabletAvailableRAMMemory / data.deviceProfile.TabletTotalRAMMemory) * 100;
											$("#TabletramPer").text(CheckNaN(Math.round(Tablet_ramPer)));
											$("#TabletramFree").text(i18n.t('free', { lng: lang }) + CheckUndefined(data.deviceProfile.TabletAvailableRAMMemory));
											$("#TabletramTotal").text(i18n.t('total', { lng: lang }) + CheckUndefined(data.deviceProfile.TabletTotalRAMMemory));

											//-- payment
											var Payment_ramPer = (memoryDataSetContent.RamFreeSpace / memoryDataSetContent.TotalRamSize) * 100;
											$("#PaymentramPer").text(CheckNaN(Math.round(Payment_ramPer)));
											$("#PaymentramFree").text(i18n.t('free', { lng: lang }) + CheckUndefined(memoryDataSetContent.RamFreeSpace));
											$("#PaymentramTotal").text(i18n.t('total', { lng: lang }) + CheckUndefined(memoryDataSetContent.TotalRamSize));
										}
									}

								}
							}
						} else {
							koUtil.deviceProfileData([]);
							self.veriShieldEncryption('N/A');

							var flashPer = '';
							var flashFreeSpace = undefined;
							var totalFlashSize = undefined;

							if (isPaymentTabletFlashDiv == false) {
								// $("#flashPer").text(flashPer + ' %');
								$("#flashFree").text(i18n.t('free', { lng: lang }) + CheckUndefined(flashFreeSpace));
								$("#flashTotal").text(i18n.t('total', { lng: lang }) + CheckUndefined(totalFlashSize));
							} else {
								//------------- for tablet
								$("#TabletflashFree").text(i18n.t('free', { lng: lang }) + CheckUndefined(flashFreeSpace));
								$("#TabletflashTotal").text(i18n.t('total', { lng: lang }) + CheckUndefined(totalFlashSize));

								//-- payment
								$("#PaymentflashFree").text(i18n.t('free', { lng: lang }) + CheckUndefined(flashFreeSpace));
								$("#PaymentflashTotal").text(i18n.t('total', { lng: lang }) + CheckUndefined(totalFlashSize));

							}
							var ramPer = '-';
							var ramFreeSpace = undefined;
							var totalRamSize = undefined;

							if (isPaymentTabletFlashDiv == false) {
								// $("#ramPer").text(ramPer + ' %');
								$("#ramFree").text(i18n.t('free', { lng: lang }) + CheckUndefined(ramFreeSpace));
								$("#ramTotal").text(i18n.t('total', { lng: lang }) + CheckUndefined(totalRamSize));
							}
							else {
								//--------------- for tablet
								$("#TabletramFree").text(i18n.t('free', { lng: lang }) + CheckUndefined(ramFreeSpace));
								$("#TabletramTotal").text(i18n.t('total', { lng: lang }) + CheckUndefined(totalRamSize));
								//-- payment
								$("#PaymentramFree").text(i18n.t('free', { lng: lang }) + CheckUndefined(ramFreeSpace));
								$("#PaymentramTotal").text(i18n.t('total', { lng: lang }) + CheckUndefined(totalRamSize));
							}
							//$("#nodataDiv").show();
						}

						if (!_.isEmpty(data.deviceKeyData)) {
							data.deviceKeyData = $.parseJSON(data.deviceKeyData);
							var paymentKeys = data.deviceKeyData.payment_keys;
							var warrantiedKeys = data.deviceKeyData.warrantied_keys;
							var genericKeys = data.deviceKeyData.generic_keys;
							var expectedKeys = data.deviceKeyData.expected_keys;
							var missingKeys = data.deviceKeyData.missing_keys;

							if (!_.isEmpty(paymentKeys)) {
								for (var j = 0; j < paymentKeys.length; j++) {
									paymentKeys[j].key_type = i18n.t('payment_keys', { lng: lang });
								}
							}
							if (!_.isEmpty(warrantiedKeys)) {
								for (var k = 0; k < warrantiedKeys.length; k++) {
									warrantiedKeys[k].key_type = i18n.t('warrantied_keys', { lng: lang });
									warrantiedKeys[k].user_id = warrantiedKeys[k].info.user_id;
									warrantiedKeys[k].key_id = warrantiedKeys[k].info.key_id;
									warrantiedKeys[k].status = warrantiedKeys[k].info.status;
									warrantiedKeys[k].type = warrantiedKeys[k].info.type;
									warrantiedKeys[k].ts = warrantiedKeys[k].info.ts;
								}
							}
							if (!_.isEmpty(genericKeys)) {
								for (var l = 0; l < genericKeys.length; l++) {
									genericKeys[l].key_type = i18n.t('generic_keys', { lng: lang });
									genericKeys[l].user_id = genericKeys[l].info.user_id;
									genericKeys[l].key_id = genericKeys[l].info.key_id;
									genericKeys[l].status = genericKeys[l].info.status;
									genericKeys[l].type = genericKeys[l].info.type;
									genericKeys[l].ts = genericKeys[l].info.ts;
								}
							}
							if (!_.isEmpty(expectedKeys)) {
								for (var m = 0; m < expectedKeys.length; m++) {
									expectedKeys[m].key_type = i18n.t('expected_keys', { lng: lang });
								}
							}
							if (!_.isEmpty(missingKeys)) {
								for (var n = 0; n < missingKeys.length; n++) {
									missingKeys[n].key_type = i18n.t('missing_keys', { lng: lang });
								}
							}

							koUtil.deviceProfileKeyInventoryData = data.deviceKeyData.payment_keys.concat(data.deviceKeyData.warrantied_keys, data.deviceKeyData.generic_keys, data.deviceKeyData.expected_keys, data.deviceKeyData.missing_keys);
							koUtil.deviceProfileCertificatesData = data.deviceKeyData.certificates;
						}

						getDeviceProfileTemplate(self.deviceProfileTemplateXml, data.deviceOut.Model, self.deviceProfileData, self.deviceProfileTabData);

						if (data.deviceOut && data.deviceOut != "null") {
							if (data.deviceOut.CommunicationInfo.LastProfileDataReceivedDate) {
								//self.LastProfileDataReceivedDate(jsonDateConversion(data.deviceOut.CommunicationInfo.LastProfileDataReceivedDate, 'DD/MMM/YYYY hh:mm:ss A'));
								self.LastProfileDataReceivedDate(jsonLocalDateConversion(data.deviceOut.CommunicationInfo.LastProfileDataReceivedDate, 'DD/MMM/YYYY hh:mm:ss A'));
							} else {
								self.LastProfileDataReceivedDate('N/A');
							}
							if (data.deviceOut.CommunicationInfo.LastDiagnosticsProfileDataReceivedDate) {
								self.LastDiagnosticsProfileDataReceivedDate(jsonLocalDateConversion(data.deviceOut.CommunicationInfo.LastDiagnosticsProfileDataReceivedDate, 'DD/MMM/YYYY hh:mm:ss A'));
							} else {
								self.LastDiagnosticsProfileDataReceivedDate('N/A');
							}
							if (data.deviceOut.CommunicationInfo.LastHeartBeatReceived != null) {
								self.LastHeartBeatReceived(moment(data.deviceOut.CommunicationInfo.LastHeartBeatReceived).format('DD/MMM/YYYY hh:mm:ss A'));
							}
							if (data.downloadSchedule != null && data.downloadSchedule != '') {
								self.AutomaticUpdateSchedule(jsonLocalDateConversion(data.downloadSchedule, 'DD/MMM/YYYY hh:mm:ss A'));
							}
						}
						$("#loadingDiv").hide();

					}
				} else if (error) {
					$("#loadingDiv").hide();
				}
			}


			var params = '{"token":"' + TOKEN() + '","deviceIn":' + JSON.stringify(deviceIn) + '}';
			ajaxJsonCall('GetDevice', params, callBackfunction, true, 'POST', '');
		};

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
					{ name: 'IsMultiVPFXSupported', map: 'IsMultiVPFXSupported' },

				],
			};

			var dataAdapter = new $.jqx.dataAdapter(source);

			//-------------------------------Sync Render-----------------------------
			var syncRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
				var syncToolipMessage = i18n.t('click_here_to_view_parameters_sync_status', { lng: lang });
				if (value == true) {
					return '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"><i class="icon-checkmark idisabled"></i><a title="' + syncToolipMessage + '"  id="imageId" style="text-decoration:underline;padding-left:5px;" onClick="modelPopUpForParameterSynchronizationDetails(' + row + ')" height="60" width="50" >Not in Sync</a></div>'
				} else {
					return '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"><i class="icon-checkmark ienable"></i><a title="' + syncToolipMessage + '"  id="imageId" style="text-decoration:underline;padding-left:5px;" onClick="modelPopUpForParameterSynchronizationDetails(' + row + ')" height="60" width="50" >In Sync</a></div>'
				}
			}


			// create jqxgrid.
			$("#" + gID).jqxGrid(
				{
					width: '100%',
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
					columns: [
						{ text: '', datafield: 'ApplicationId', hidden: true, width: 'auto' },
						{
							text: i18n.t('applications_download_lib', { lng: lang }), datafield: 'ApplicationName', menu: false, width: '23%', editable: false, enabletooltips: true,
						},
						{
							text: i18n.t('versions_parameter', { lng: lang }), datafield: 'ApplicationVersion', menu: false, width: '15%', editable: false,

						},
						{
							text: i18n.t('parameters_sync_status', { lng: lang }), datafield: 'IsPartialUnSync', enabletooltips: false, menu: false, sortable: false, width: '25%', minwidth: 180, editable: false, cellsrenderer: syncRenderer,

						},
						{
							text: '', datafield: 'Edit', columngroup: 'Description', menu: false, enabletooltips: false, sortable: false, width: 53, resizable: false, editable: false, columntype: 'number', cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
								var rowData = $("#" + gID).jqxGrid('getrowdata', row);
								var parameterizeEnabled = rowData.IsParameterizationEnabled;
								var isPFXExistFlag = rowData.IsPFXExist;
								//var isPDXExistFlag = rowData.IsPDXExist;

								var editToolipMessage = i18n.t('edit_parameters_device', { lng: lang });

								//-------------- Edit Parametres----------------
								if (parameterizeEnabled && isPFXExistFlag && isEditParamEnable) {
									return '<div class="btn btn-xs btn-default" id="editTemplateId" style="margin-top:5px;cursor:pointer;margin-left:2px;" title="' + editToolipMessage + '"><i class="icon-pencil"></i><a id="imageId"  style="margin-left:5px;"  height="60" width="50" >Edit</a></div>'
								} else {
									return '<div class="btn btn-xs btn-default disabled"  disabled="true" id="editTemplateId" style="margin-top:5px;cursor:pointer;margin-left:2px;" title="' + editToolipMessage + '"><i class="icon-pencil"></i><a id="imageId"  style="margin-left:5px;"  height="60" width="50" >Edit</a></div>'

								}
							}
						},
						{
							text: '', datafield: 'Template', columngroup: 'Description', enabletooltips: false, menu: false, sortable: false, width: 93, resizable: false, editable: false, columntype: 'number', cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {

								var rowData = $("#" + gID).jqxGrid('getrowdata', row);
								var isPFXExistFlag = rowData.IsPFXExist;
								var isTemplateExist = rowData.IsTemplateExist;

								var templateToolipMessage = i18n.t('edit_template_assignment_device', { lng: lang });

								//-------------- Edit Parametres Templates----------------
								if (isPFXExistFlag && isTemplateExist && isEditParamEnable) {
									return '<div class="btn btn-xs btn-default" id="parameterId" style="margin-top:5px;cursor:pointer;margin-left:5px;" title="' + templateToolipMessage + '"><i class="icon-pencil"></i><a id="imageId"  style="margin-left:5px;"  height="60" width="50" >Templates</a></div>'
								} else {
									return '<div class="btn btn-xs btn-default disabled" id="parameterIdone" style="margin-top:5px;cursor:pointer;margin-left:5px;" title="' + templateToolipMessage + '"><i class="icon-pencil"></i><a id="imageId"  style="margin-left:5px;"  height="60" width="50" >Templates</a></div>'
								}
							}
						},
						{
							text: '', datafield: 'Activate', columngroup: 'Description', enabletooltips: false, menu: false, sortable: false, width: 78, resizable: false, editable: false,
							columntype: 'number', cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
								if (!isDirectParameterActivation) {
									var rowData = $("#" + gID).jqxGrid('getrowdata', row);
									var isPFXExistFlag = rowData.IsPFXExist;
									var isPartialUnSync = rowData.IsPartialUnSync;

									var activateToolipMessage = i18n.t('activate_edited_parameters_device', { lng: lang });

									//-------------- Activate Parameters----------------
									if (isPFXExistFlag && isPartialUnSync) {
										return '<div class="btn btn-xs btn-default" id="ActivateId" style="margin-top:5px;cursor:pointer;margin-left:5px;" title="' + activateToolipMessage + '"><i class="icon-checkmark ienable"></i><a id="imageId"  style="margin-left:5px;" onClick="modelPopUpForActivateParameter(' + row + ')" height="60" width="50" >Activate</a></div>'
									} else {
										return '<div class="btn btn-xs btn-default disabled" id="ActivateId" style="margin-top:5px;cursor:pointer;margin-left:5px;" title="' + activateToolipMessage + '"><i class="icon-checkmark ienable"></i><a id="imageId"  style="margin-left:5px;" onClick="modelPopUpForActivateParameter(' + row + ')" height="60" width="50" >Activate</a></div>'
									}
								} else {
									$("#" + gID).jqxGrid('hidecolumn', 'Activate');
									return '';
								}
							}

						},
						{
							text: '', datafield: 'RestoreTemplate', enabletooltips: false, columngroup: 'Description', menu: false, sortable: false, width: 134, resizable: false, editable: false,
							columntype: 'number', cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
								var rowData = $("#" + gID).jqxGrid('getrowdata', row);
								var isPFXExistFlag = rowData.IsPFXExist;
								var isTemplateAssigned = rowData.IsTemplateAssigned;

								var restoreTemplateToolipMessage = i18n.t('restore_all_to_template', { lng: lang });

								//-------------- Restore Template----------------
								if (isPFXExistFlag == true && isTemplateAssigned) {
									return '<div class="btn btn-xs btn-default" style="margin-top:5px;cursor:pointer;margin-left:5px;" title="' + restoreTemplateToolipMessage + '"><i class="icon-restoredefault" style="color:#00aeef"></i><a id="imageId"  style="margin-left:5px;" onClick="modelPopupForRestoreTemplate(' + row + ')" height="60" width="50" >Restore Template</a></div>'
								} else {
									return '<div class="btn btn-xs btn-default disabled" style="margin-top:5px;cursor:pointer;margin-left:5px;" title="' + restoreTemplateToolipMessage + '"><i class="icon-restoredefault" style="color:#00aeef"></i><a id="imageId"  style="margin-left:5px;" onClick="modelPopupForRestoreTemplate(' + row + ')" height="60" width="50" >Restore Template</a></div>'
								}
							}
						},
						{
							text: '', datafield: 'RestoreDefault', enabletooltips: false, columngroup: 'Description', menu: false, sortable: false, width: 123, resizable: false, editable: false, columntype: 'number', cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
								var rowData = $("#" + gID).jqxGrid('getrowdata', row);
								var isPFXExistFlag = rowData.IsPFXExist;
								var isPDXExistFlag = rowData.IsPDXExist;
								var parameterizeEnabled = rowData.IsParameterizationEnabled;

								var restoreDefualtToolipMessage = i18n.t('restore_all_to_default', { lng: lang });

								//-------------- Restore Default----------------
								if (parameterizeEnabled && isPFXExistFlag && isPDXExistFlag) {
									return '<div class="btn btn-xs btn-default" style="margin-top:5px;cursor:pointer;margin-left:5px;" title="' + restoreDefualtToolipMessage + '"><i class="icon-restoredefault" style="color:#00aeef"></i><a id="imageId"  style="margin-left:5px;" onClick="restoreToDefault(' + row + ')" height="60" width="50" >Restore Default</a></div>'
								} else {
									return '<div class="btn btn-xs btn-default disabled" style="margin-top:5px;cursor:pointer;margin-left:5px;" title="' + restoreDefualtToolipMessage + '"><i class="icon-restoredefault" style="color:#00aeef"></i><a id="imageId"  style="margin-left:5px;" onClick="restoreToDefault(' + row + ')" height="60" width="50" >Restore Default</a></div>'
								}
							}
						},
					],
					columngroups:
						[
							{ text: i18n.t('Parameter_actions', { lng: lang }), datafield: 'Description', menu: false, sortable: false, width: 'auto', minwidth: 485, resizable: false, editable: false, name: 'Description' }
						]
				});

			//$("#" + gID).on("cellclick", function (event) {
			//    var column = event.args.column;
			//    var rowindex = event.args.rowindex;
			//    var columnindex = event.args.columnindex;

			//    var rowData = $("#" + gID).jqxGrid('getrowdata', rowindex);
			//    var parameterizeEnabled = rowData.IsParameterizationEnabled;
			//    var isPFXExistFlag = rowData.IsPFXExist;
			//    var isPDXExistFlag = rowData.IsPDXExist;
			//    var isTemplateExist = rowData.IsTemplateExist;

			//    if (columnindex == 4) {
			//        if ((parameterizeEnabled == true) && (isPFXExistFlag == true || isPDXExistFlag == true) && isEditParamEnable == true) {

			//            if (isPFXExistFlag == false) {

			//                openPopup('modelDeviceProfileEditTemplateVPDX');
			//            } else {

			//                openPopup('modelDeviceProfileEditTemplate');
			//            }

			//            //$("#profiletab").removeClass('vertical-tab');
			//            koUtil.getEditDeviceProfile = rowData;

			//        } else {

			//        }
			//    }

			//    if (columnindex == 5) {
			//        if ((isPFXExistFlag == true) && (isTemplateExist == true)) {
			//            openPopup('modelDeviceProfileParameterAssignment');
			//            //$("#profiletab").removeClass('vertical-tab');

			//            xmlrowdataFor = rowData.FormFile;
			//            koUtil.deviceEditTemplate = rowData;
			//        } else {

			//        }
			//    }

			//});

			//---restore grid css properties------
			restoreGridStyle();
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
							$("#jqxgridForEditParameterTemplate").show();
							$("#showParmMessage").hide();
						} else {
							applicationData([]);
							jqxgridForEditParameter(applicationData(), 'jqxgridForEditParameterTemplate', openPopup);
							//$("#jqxgridForEditParameterTemplate").hide();
							//$("#showParmMessage").show();
							//$("#showNoDataMessage").hide();
						}

					}
				}
			}

			var method = 'GetParameterApplicationsForDevice';
			var params = '{"token":"' + TOKEN() + '","getParameterApplicationsReq":' + JSON.stringify(getParameterApplicationsReq) + '}';
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

		self.selectedTab = function (data) {
			autoRefreshDownloadProgressStop();
			var pageName = "deviceProfile";
			// var initpagObj = initPageStorageObj(pageName);

			// var PageStorage = initpagObj.PageStorage;

			var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));

			if (PageStorage) {

				PageStorage[0].selectedTabName = data.name;

				//alert("before  "+JSON.stringify(PageStorage[0].selectedTabName));

				var updatedPageStorage = JSON.stringify(PageStorage);
				window.sessionStorage.setItem(pageName + "PageStorage", updatedPageStorage);
			}


			var PageStorage1 = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));


			var id = '#' + data.name + 'tabLi';
			$("#tabHeader").each(function () {
				$(this).children('li').removeClass('active');
			});
			$(id).addClass('active');
			self.observableDeviceProfileTempalte('unloadTemplate');
			loadelement(data.name, 'device/deviceProfileTemplates');

			if (id == "#Device_detailstabLi") {
				koUtil.isDeviceDetails = "DeviceDetails";
			} else if (id == "#Dignositc_ProfiletabLi") {
				koUtil.isDeviceDetails = "DiagnosticProfile";
				setIdForDeviceDetailsTab = "diagnosticGrid";
			} else {
				koUtil.isDeviceDetails = "";
			}

		}
		var left = 0;
		self.moveLeft = function () {
			var width = 0;
			$("#tabHeader").children('li').each(function () {
				width = width + $(this).width();
			});
			var menuwidth = $('#dpmenutab').width();
			//When we move left
			if (width > menuwidth) {
				var maxleft = menuwidth - width;
				if (left < 0) {
					left = left + 50;
					$("#tabHeader").css("margin-left", left + "px")
				}
				//for  Disable left right Button
				if (left >= 0) {
					left = 0;
					$("#moveLeft").prop('disabled', true);
				} else if (left <= 0 && left >= maxleft) {
					$("#moveLeft").prop('disabled', false);
					$("#moveRight").prop('disabled', false);
				} else if (left <= maxleft) {

					$("#moveRight").prop('disabled', true);
				}
			}
		}

		self.moveRight = function () {
			var width = 0;
			$("#tabHeader").children('li').each(function () {
				width = width + $(this).width();
			});
			//When we move right
			var menuwidth = $('#dpmenutab').width();
			if (width > menuwidth) {
				var maxleft = menuwidth - width;
				if (left >= maxleft - 50) {
					left = left - 50;
					if (left <= maxleft) {
						left = left - 80;
					}
					$("#tabHeader").css("margin-left", left + "px")
				}

				//for  Disable left right Button
				if (left == 0) {
					$("#moveLeft").prop('disabled', true);
				} else if (left <= 0 && left >= maxleft) {
					$("#moveLeft").prop('disabled', false);
					$("#moveRight").prop('disabled', false);
				} else if (left <= maxleft) {

					$("#moveRight").prop('disabled', true);
				}

			}


		}

		if (left == 0) {
			$("#moveLeft").prop('disabled', true);
			$("#moveRight").prop('disabled', false);
		} else if (left >= -550 && left <= 0) {
			$("#moveLeft").prop('disabled', false);
			$("#moveRight").prop('disabled', false);
		} else if (left <= -550) {
			$("#moveLeft").prop('disabled', false);
			$("#moveRight").prop('disabled', true);
		}

		self.scheduleDropdownClick = function (scheduleName) {
			isFromDeviceSearch = true;
			isAdvancedSavedSearchApplied = false;
			isSearchReset = false;
			if (scheduleName == "Downloads") {
				var strGID = 'jqxgridForSelectedDevicesdownloads';

				updateAdSearchObj(strGID, null, 2);

				koUtil.isFromDeviceProfile = true;
				scheduleOption = "scheduleDownload";
				koUtil.isFromScheduleDownloadsScreen = 0;
				koUtil.GlobalColumnFilter = new Array();

				//Routing
				isFromDownloadLibrary = false;
				isFromContentLibrary = false;
				redirectToLocation(menuJsonData, 'scheduleDownload');

			} else if (scheduleName == "Content") {
				koUtil.isFromScheduleScreen = 0;
				var strGID = 'jqxgridForSelectedDevicesmanageContents';
				updateAdSearchObj(strGID, null, 2);

				koUtil.isFromDeviceProfile = true;
				koUtil.isFromScheduleScreen = 0;
				scheduleOption = "scheduleContent";
				koUtil.GlobalColumnFilter = new Array();

				//Routing
				isFromDownloadLibrary = false;
				isFromContentLibrary = false;
				redirectToLocation(menuJsonData, 'scheduleDelivery');
			} else if (scheduleName == "Diagnostic Actions") {
				koUtil.isFromScheduleActionScreen = 0;
				var strGID = 'jqxgridForSelectedDevicesdiagnostics';
				updateAdSearchObj(strGID, null, 2);

				koUtil.isFromScheduleActionScreen = 0;
				koUtil.isFromDeviceProfile = true;
				scheduleOption = "scheduleAction";
				koUtil.GlobalColumnFilter = new Array();
				redirectToLocation(menuJsonData, 'scheduleActions');
			}
		}

		self.softwareAssignment = function () {
			self.templateFlag(true);
			self.observableModelPopupForDeviceProfile('unloadTemplate');
			isFromAddDevice = false;
			loadelementPopUp('modelSoftwareAssignment', 'device');
			$('#deviceProfileModel').modal('show');
		}

		$("#toggleBtn").prop("title", "Expand");
		$(".btn-expand").click(function () {

			$(".dp-sh-row").slideToggle("slow");
			$(".btn-expand").toggleClass("btn-ex-rotate");
			if ($(".btn-expand").hasClass("btn-ex-rotate")) {
				$("#toggleBtn").prop("title", "Collapse");
			} else {
				$("#toggleBtn").prop("title", "Expand");

			}
			var refreshDetailsGrid = function () {
				if ($("#datagridHardwareProfileGridDiv").length) {
					refreshUiGrid("datagridHardwareProfileGridDiv");
				}
				if ($("#datagridTabletDetailsGridDiv").length) {
					refreshUiGrid("datagridTabletDetailsGridDiv");
				}
				if ($("#softwareGridDiv").length) {
					refreshUiGrid("softwareGridDiv");
				}
				if ($("#datagridConnectivityBluetoothGridDiv")) {
					refreshUiGrid("datagridConnectivityBluetoothGridDiv");
				}
				if ($("#datagridConnectivityWiFiGridDiv").length) {
					refreshUiGrid("datagridConnectivityWiFiGridDiv");
				}
				if ($("#datagridIOModulesGridDiv").length) {
					refreshUiGrid("datagridIOModulesGridDiv");
				}
				if ($("#datagridDownloadAutomationGridDiv").length) {
					refreshUiGrid("datagridDownloadAutomationGridDiv");
				}
				if ($("#Verishield_ProtectGridDiv").length) {
					refreshUiGrid("Verishield_ProtectGridDiv");
				}
				if ($("#datagridCustomIdentifierGridDiv").length) {
					refreshUiGrid("datagridCustomIdentifierGridDiv");
				}
				if ($("#datagridCertificateGridDiv").length) {
					refreshUiGrid("datagridCertificateGridDiv");
				}
				if ($("#ParametersGridDiv").length) {
					refreshUiGrid("ParametersGridDiv");
				}
				if ($("#softwareStatus_tablet_dataGridDiv").length) {
					refreshUiGrid("softwareStatus_tablet_dataGridDiv");
				}
				if ($("#datagridDownloadAutomationCarbonGridDiv").length) {
					refreshUiGrid("datagridDownloadAutomationCarbonGridDiv");
				}
				if ($("#softwareCarbonGridDiv").length) {
					refreshUiGrid("softwareCarbonGridDiv");
				}
				if ($("#software_tablet_dataGridDiv").length) {
					refreshUiGrid("software_tablet_dataGridDiv");
				}
				if ($("#datagridEncryptionKeyGridDiv").length) {
					refreshUiGrid("datagridEncryptionKeyGridDiv");
				}
				if ($("#datagridPortsGridDiv").length) {
					refreshUiGrid("datagridPortsGridDiv");
				}
				if ($("#datagridTabletDetailsGridDiv").length) {
					refreshUiGrid("datagridTabletDetailsGridDiv");
				}
			}
			setTimeout(refreshDetailsGrid, 1000);
		});

		var deviceProfileTempTabData;

		function getDeviceProfileTemplate(deviceProfileTemplateXml, Model, deviceProfileData, deviceProfileTabData) {

			var deviceProfileData1 = deviceProfileData();
			var getDeviceProfileTemplateReq = new Object();
			getDeviceProfileTemplateReq.Family = Model != null ? Model.Family : '';
			getDeviceProfileTemplateReq.ModelId = Model != null ? Model.ModelId : '';
			getDeviceProfileTemplateReq.Protocol = koUtil.Protocol;
			if (deviceProfileData1 != null && !$.isEmptyObject(deviceProfileData1)) {
				getDeviceProfileTemplateReq.ProtocolVersion = deviceProfileData1.DataSet[0].Version;
			} else {
				getDeviceProfileTemplateReq.ProtocolVersion = '';
			}
			self.deviceProfileTabData([]);
			deviceProfileTempTabData = [];
			koUtil.diagnosticProfileTabs = new Array();
			koUtil.downloadHistoryTabs = new Array();
			koUtil.communicationHistoryTabs = new Array();
			koUtil.parameterauditHistoryTabs = new Array();
			koUtil.vrkBundlesLibraryTabs = new Array();
			koUtil.diagnosticHistoryTabs = new Array();
			koUtil.contentHistoryTabs = new Array();
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.getDeviceProfileTemplateResp) {
							data.getDeviceProfileTemplateResp = $.parseJSON(data.getDeviceProfileTemplateResp);
							koUtil.devicetemplateXML($.xml2json(data.getDeviceProfileTemplateResp.TemplateXML));
							deviceProfileTemplateXml($.xml2json(data.getDeviceProfileTemplateResp.TemplateXML));
							var deviceProfile = deviceProfileTemplateXml();
							for (var i = 0; i < deviceProfile.Tabs.Tab.length; i++) {
								if (deviceProfile.Tabs.Tab[i].visible == 1) {

									deviceProfile.Tabs.Tab[i]["displayValue"] = i18n.t(deviceProfile.Tabs.Tab[i].name, { lng: lang });
									deviceProfileTempTabData.push(deviceProfile.Tabs.Tab[i]);

									if (deviceProfile.Tabs.Tab[i].name == "Dignositc_Profile") {
										for (var j = 0; j < deviceProfile.Tabs.Tab[i].grid.length; j++) {
											deviceProfile.Tabs.Tab[i].grid[j]["displayValue"] = i18n.t(deviceProfile.Tabs.Tab[i].grid[j].name, { lng: lang });
											koUtil.diagnosticProfileTabs.push(deviceProfile.Tabs.Tab[i].grid[j]);
										}
									}
									if (deviceProfile.Tabs.Tab[i].name == "Download_Histroy") {
										if (deviceProfile.Tabs.Tab[i].grid != undefined) {
											for (var j = 0; j < deviceProfile.Tabs.Tab[i].grid.length; j++) {
												deviceProfile.Tabs.Tab[i].grid[j]["displayValue"] = i18n.t(deviceProfile.Tabs.Tab[i].grid[j].name, { lng: lang });
												koUtil.downloadHistoryTabs.push(deviceProfile.Tabs.Tab[i].grid[j]);
											}
										}
									}
									if (deviceProfile.Tabs.Tab[i].name == "Communication_History") {
										if (deviceProfile.Tabs.Tab[i].grid != undefined) {
											for (var j = 0; j < deviceProfile.Tabs.Tab[i].grid.length; j++) {
												deviceProfile.Tabs.Tab[i].grid[j]["displayValue"] = i18n.t(deviceProfile.Tabs.Tab[i].grid[j].name, { lng: lang });
												koUtil.communicationHistoryTabs.push(deviceProfile.Tabs.Tab[i].grid[j]);
											}
										}
									}

									if (deviceProfile.Tabs.Tab[i].name == "VRK_Bundles_Library") {
										if (deviceProfile.Tabs.Tab[i].grid != undefined) {
											for (var j = 0; j < deviceProfile.Tabs.Tab[i].grid.length; j++) {
												deviceProfile.Tabs.Tab[i].grid[j]["displayValue"] = i18n.t(deviceProfile.Tabs.Tab[i].grid[j].name, { lng: lang });
												koUtil.vrkBundlesLibraryTabs.push(deviceProfile.Tabs.Tab[i].grid[j]);
											}
										}
									}
									if (deviceProfile.Tabs.Tab[i].name == "Dignositc_Histroy") {
										if (deviceProfile.Tabs.Tab[i].grid != undefined) {
											for (var j = 0; j < deviceProfile.Tabs.Tab[i].grid.length; j++) {
												deviceProfile.Tabs.Tab[i].grid[j]["displayValue"] = i18n.t(deviceProfile.Tabs.Tab[i].grid[j].name, { lng: lang });
												koUtil.diagnosticHistoryTabs.push(deviceProfile.Tabs.Tab[i].grid[j]);
											}
										}
									}
									if (deviceProfile.Tabs.Tab[i].name == "Content_Histroy") {
										if (deviceProfile.Tabs.Tab[i].grid != undefined) {
											for (var j = 0; j < deviceProfile.Tabs.Tab[i].grid.length; j++) {
												deviceProfile.Tabs.Tab[i].grid[j]["displayValue"] = i18n.t(deviceProfile.Tabs.Tab[i].grid[j].name, { lng: lang });
												koUtil.contentHistoryTabs.push(deviceProfile.Tabs.Tab[i].grid[j]);
											}
										}
									}

									if (deviceProfile.Tabs.Tab[i].name == "Alert") {
										if (isViewAllowedForAlert == true) {
											$("#AlerttabLi").show();
										} else {
											$("#AlerttabLi").hide();
										}
									}
								}
							}


							if (isDeviceSubStatusAllowed && deviceSubStatusDataUser && deviceSubStatusDataUser.length == 0) {
								getDeviceSubStatusForDeviceProfile(deviceProfileTemplateXml);
							} else {
								showHideControl(deviceProfileTemplateXml);
							}

							//if (deviceProfileData1 != null) {
							var pageName = "deviceProfile";
							var initpagObj = initPageStorageObj(pageName);

							var PageStorage = initpagObj.PageStorage;

							if (PageStorage) {

								if (PageStorage[0].selectedTabName && PageStorage[0].selectedTabName != '') {
									var id = '#' + PageStorage[0].selectedTabName + 'tabLi';
									$("#tabHeader").each(function () {
										$(this).children('li').removeClass('active');
									});
									$(id).addClass('active');
									self.observableDeviceProfileTempalte('unloadTemplate');
									loadelement(PageStorage[0].selectedTabName, 'device/deviceProfileTemplates');

									if (id == "#Device_detailstabLi") {
										koUtil.isDeviceDetails = "DeviceDetails";
									} else if (id == "#Dignositc_ProfiletabLi") {
										koUtil.isDeviceDetails = "DiagnosticProfile";
										setIdForDeviceDetailsTab = "diagnosticGrid";
									} else {
										koUtil.isDeviceDetails = "";
									}

								} else {
									self.observableDeviceProfileTempalte('unloadTemplate');
									loadelement('Device_details', 'device/deviceProfileTemplates');
								}
							} else {
								self.observableDeviceProfileTempalte('unloadTemplate');
								loadelement('Device_details', 'device/deviceProfileTemplates');
							}
							//if (koUtil.isRefereshParamfordeviceProfile()) {
							//    if ($("#jqxgridForEditParameterTemplate") && $("#jqxgridForEditParameterTemplate").length > 0) {
							//        setTimeout(getParameterApplicationForDevice(self.applicationData, self.openPopup), 3000);
							//    }
							//    koUtil.isRefereshParamfordeviceProfile(false);
							//}
						}
					}
				} else if (error) {
					$("#loadingDiv").hide();
				}
			}
			var params = '{"token":"' + TOKEN() + '","getDeviceProfileTemplateReq":' + JSON.stringify(getDeviceProfileTemplateReq) + '}';
			ajaxJsonCall('GetDeviceProfileTemplate', params, callBackfunction, true, 'POST', '');

		}

		function showHideControl(deviceProfileTemplateXml) {

			var arr = deviceProfileTemplateXml();
			$("#serialDidDiv").hide();
			for (var i = 0; i < arr.DeviceDetails.Detail.length; i++) {
				if (arr.DeviceDetails.Detail[i].name == 'imgDevice') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#deviceImgDiv").show();

					} else {
						$("#deviceImgDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'model_name') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#deviceModelDiv").show();

					} else {
						$("#deviceModelDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'model_name') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#deviceModelDiv").show();

					} else {
						$("#deviceModelDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'serial_number') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#serialDidDiv").show();
						$("#serialNumberDiv").show();
					} else {
						$("#serialDidDiv").hide();
						$("#serialNumberDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'device_id') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#serialDidDiv").show();
						$("#deviceIdDiv").show();

					} else {
						$("#serialDidDiv").hide();
						$("#deviceIdDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'Reference_Set_Name_filter') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#deviceReferenceSetDiv").show();

					} else {
						$("#deviceReferenceSetDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'Dock_In_Counter') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#deviceDockInCountDiv").show();

					} else {
						$("#deviceDockInCountDiv").hide();
					}
				};
				//if (arr.DeviceDetails.Detail[i].name == 'Protocol_Name') {
				//    if (arr.DeviceDetails.Detail[i].visible == 1) {
				//        $("#deviceProtocolName").show();

				//    } else {
				//        $("#deviceProtocolName").hide();
				//    }
				//};
				if (arr.DeviceDetails.Detail[i].name == 'veriShield_encryption') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#veriShieldDiv").show();

					} else {
						$("#veriShieldDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'time_zone') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#timeZoneDiv").show();

					} else {
						$("#timeZoneDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'hierarchy') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#hierarchyDiv").show();

					} else {
						$("#hierarchyDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'device_profile_updated_date') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#deviceProfileUpdatedDiv").show();

					} else {
						$("#deviceProfileUpdatedDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'diagnostic_profile_updated_date') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#diagnosticProfileUpdatedDiv").show();
					} else {
						$("#diagnosticProfileUpdatedDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'last_heartbeat_received_date') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#lastHeartbeatReceivedDiv").show();
					} else {
						$("#lastHeartbeatReceivedDiv").hide();
					}
				};

				///-------------- start flash contener for tablet/payment -------------------
				if (isPaymentTabletFlashDiv) {

					$("#FlashDiv").hide();
					$("#ramDiv").hide();
					if (arr.DeviceDetails.Detail[i].name == 'tablet_flash_memory_container') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#TabletFlashDiv").show();
						} else {
							$("#TabletFlashDiv").hide();
						}
					};

					if (arr.DeviceDetails.Detail[i].name == 'Tablet_free_flash') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#TabletflashFree").show();
						} else {
							$("#TabletflashFree").hide();
						}
					};

					if (arr.DeviceDetails.Detail[i].name == 'Tablet_total_flash') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#TabletflashTotal").show();
						} else {
							$("#TabletflashTotal").hide();
						}
					};

					if (arr.DeviceDetails.Detail[i].name == 'Tablet_flash_memory_status') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#TabletflashPer").show();
							$("#TabletflashSp").text('Flash ' + i18n.t('Available_filter', { lng: lang }));
						} else {
							$("#TabletflashPer").hide();
							$("#TabletflashSp").text('Flash');
						}
					};


					// --payment
					if (arr.DeviceDetails.Detail[i].name == 'Payment_flash_memory_container') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#PaymentFlashDiv").show();
						} else {
							$("#PaymentFlashDiv").hide();
						}
					};

					if (arr.DeviceDetails.Detail[i].name == 'Payment_free_flash') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#PaymentflashFree").show();
						} else {
							$("#PaymentflashFree").hide();
						}
					};

					if (arr.DeviceDetails.Detail[i].name == 'Payment_total_flash') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#PaymentflashTotal").show();
						} else {
							$("#PaymentflashTotal").hide();
						}
					};

					if (arr.DeviceDetails.Detail[i].name == 'Payment_flash_memory_status') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#PaymentflashPer").show();
							$("#PaymentflashSp").text('Flash ' + i18n.t('Available_filter', { lng: lang }));
						} else {
							$("#PaymentflashPer").hide();
							$("#PaymentflashSp").text('Flash');
						}
					};

					///-------------- END flash contener for tablet -------------------
					//------------Start Ram COntaner (tablet) --------------

					if (arr.DeviceDetails.Detail[i].name == 'Tablet_ram_memory_container') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#TabletramDiv").show();
						} else {
							$("#TabletramDiv").hide();
						}
					};


					if (arr.DeviceDetails.Detail[i].name == 'Tablet_free_ram') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#TabletramFree").show();
						} else {
							$("#TabletramFree").hide();
						}
					};

					if (arr.DeviceDetails.Detail[i].name == 'Tablet_total_ram') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#TabletramTotal").show();
						} else {
							$("#TabletramTotal").hide();
						}
					};
					if (arr.DeviceDetails.Detail[i].name == 'Tablet_ram_memory_status') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#TabletramPer").show();
							$("#TabletramSp").text('RAM ' + i18n.t('Available_filter', { lng: lang }));
						} else {
							$("#TabletramPer").hide();
							$("#TabletramSp").text('RAM');
						}
					};

					//-- payment

					if (arr.DeviceDetails.Detail[i].name == 'Payment_ram_memory_container') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#PaymentramDiv").show();
						} else {
							$("#PaymentramDiv").hide();
						}
					};


					if (arr.DeviceDetails.Detail[i].name == 'Payment_free_ram') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#PaymentramFree").show();
						} else {
							$("#PaymentramFree").hide();
						}
					};

					if (arr.DeviceDetails.Detail[i].name == 'Payment_total_ram') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#PaymentramTotal").show();
						} else {
							$("#PaymentramTotal").hide();
						}
					};
					if (arr.DeviceDetails.Detail[i].name == 'Payment_ram_memory_status') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#PaymentramPer").show();
							$("#PaymentramSp").text('RAM ' + i18n.t('Available_filter', { lng: lang }));
						} else {
							$("#PaymentramPer").hide();
							$("#PaymentramSp").text('RAM');
						}
					};

				}
				//------------- END Ram COntaner (tablet)----------------


				else {
					$("#PaymentramDiv").hide();
					$("#TabletramDiv").hide();
					$("#PaymentFlashDiv").hide();
					$("#TabletFlashDiv").hide();
					////flash contener
					if (arr.DeviceDetails.Detail[i].name == 'flash_memory_container') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#FlashDiv").show();
						} else {
							$("#FlashDiv").hide();
						}
					};


					if (arr.DeviceDetails.Detail[i].name == 'free_flash') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#flashFree").show();
						} else {
							$("#flashFree").hide();
						}
					};

					if (arr.DeviceDetails.Detail[i].name == 'total_flash') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#flashTotal").show();
						} else {
							$("#flashTotal").hide();
						}
					};

					if (arr.DeviceDetails.Detail[i].name == 'flash_memory_status') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#flashPer").show();
							$("#flashSp").text('Flash ' + i18n.t('Available_filter', { lng: lang }));
						} else {
							$("#flashPer").hide();
							$("#flashSp").text('Flash');
						}
					};

					//// for Ram COntaner
					if (arr.DeviceDetails.Detail[i].name == 'ram_memory_container') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#ramDiv").show();
						} else {
							$("#ramDiv").hide();
						}
					};


					if (arr.DeviceDetails.Detail[i].name == 'free_ram') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#ramFree").show();
						} else {
							$("#ramFree").hide();
						}
					};

					if (arr.DeviceDetails.Detail[i].name == 'total_ram') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#ramTotal").show();
						} else {
							$("#ramTotal").hide();
						}
					};
					if (arr.DeviceDetails.Detail[i].name == 'ram_memory_status') {
						if (arr.DeviceDetails.Detail[i].visible == 1) {
							$("#ramPer").show();
							$("#ramSp").text('RAM ' + i18n.t('Available_filter', { lng: lang }));
						} else {
							$("#ramPer").hide();
							$("#ramSp").text('RAM');
						}
					};

				}

				if (arr.DeviceDetails.Detail[i].name == 'battery_level_container') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#batteryDiv").show();
						self.isbattery(true);
					} else {
						$("#batteryDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'battery_image_container') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#battAvailable").show();
						self.isbattery(true);
					} else {
						$("#battAvailable").hide();
					}
				};


				if (arr.DeviceDetails.Detail[i].name == 'battery_level_status') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						$("#batteryPercentage").show();
						self.isbattery(true);

						if (self.batteryLevel() == '') {
							$("#batteryPercentage").text('0%');
						} else {
							$("#batteryPercentage").text(self.batteryLevel() + '%');
							$(".progress-bar-profile").css('width', self.batteryLevel() + '%');
						}
					} else {
						$("#batteryPercentage").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'enable_for_swap') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {

						if (koUtil.deviceId == null || koUtil.deviceId == '' || koUtil.deviceId == "N/A") {
							$("#enableForSwapId").hide();
						} else if (isSwapApprovalRequired == false) {
							$("#enableForSwapId").hide();
						} else {
							$("#enableForSwapId").show();
						}
					} else {
						$("#enableForSwapId").hide();
					}
				}

				if (arr.DeviceDetails.Detail[i].name == 'scheduleOptions') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						if (VHQFlag == false) {
							$("#scheduleDDLDiv").hide();
						} else {
							$("#scheduleDDLDiv").show();
						}

						arr.DeviceDetails.Detail[i].Option.sort(function (a, b) { return a.value.toLowerCase() > b.value.toLowerCase() ? 1 : -1; });
						var scheduleDispValueArr = [];
						scheduleDispValueArr = arr.DeviceDetails.Detail[i].Option;

						for (var j = 0; j < scheduleDispValueArr.length; j++) {
							if (scheduleDispValueArr[j].displayName == "Schedule_Content") {
								scheduleDispValueArr[j].value = "Content";
							} else if (scheduleDispValueArr[j].displayName == "Schedule_Action") {
								scheduleDispValueArr[j].value = "Diagnostic Actions";
							} else if (scheduleDispValueArr[j].displayName == "Schedule_Download") {
								scheduleDispValueArr[j].value = "Downloads";
							}
						}

						var SwapArrayForPos = scheduleDispValueArr[0];              ////swap array for position in dropdown
						scheduleDispValueArr[0] = scheduleDispValueArr[1];
						scheduleDispValueArr[1] = SwapArrayForPos;

						var scheduleOptions = new Array();
						for (var option = 0; option < scheduleDispValueArr.length; option++) {
							if (scheduleDispValueArr[option].displayName == "Schedule_Content") {
								if (koUtil.deviceFamily.toUpperCase() != AppConstants.get('CARBON_MOBILE_FAMILY') && isContentManagementEnabled && isScheduleTabAllowed == true && scheduleDispValueArr[option].visible == "1") {
									scheduleOptions.push(scheduleDispValueArr[option]);
								}
							} else if (scheduleDispValueArr[option].displayName == "Schedule_Action" && scheduleDispValueArr[option].visible == "1") {
								if (isDeviceManagementEnabled && isDeviceDiagnosticsEnabled && isScheduleTabAllowedForAction == true) {
									scheduleOptions.push(scheduleDispValueArr[option]);
								}
							} else if (scheduleDispValueArr[option].displayName == "Schedule_Download" && scheduleDispValueArr[option].visible == "1") {
								if (isDeviceManagementEnabled && isScheduleTabAllowedForDownload == true) {
									scheduleOptions.push(scheduleDispValueArr[option]);
								}
							}
						}

						self.schedule(scheduleOptions);
					} else {
						$("#scheduleDDLDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'softwareAssignment') {
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						arr.DeviceDetails.Detail[i].Option.sort(function (a, b) { return a.value.toLowerCase() > b.value.toLowerCase() ? 1 : -1; })
						self.software(arr.DeviceDetails.Detail[i].Option);
					} else {
						$("#softwareDDLDiv").hide();
					}
				};

				if (arr.DeviceDetails.Detail[i].name == 'devicestatus') {
					var statusArr = [];
					if (arr.DeviceDetails.Detail[i].visible == 1) {
						if (self.ComputedDeviceStatus() == "Active") {
							$("#btnHierarchy").removeClass('disabled');
							$("#btnEditGroup").removeClass('disabled');
							$("#btndelete").removeClass('disabled');
							$("#btnBlacklist").removeClass('disabled');

							$("#btnSchedule").removeClass('disabled');
							$("#softwareDDLDiv").show();
							$("#editBtnForSerialNumber").show();
							$("#btncomputedStatus").empty();
							//  if (statusAllowed == true) {
							//$("#btncomputedStatus").removeClass('disabled');
							// }
							$("#btncomputedStatus").append("Active <span class='caret'></span>");
							if (String(koUtil.Protocol).toUpperCase() != AppConstants.get('ZONTALK_PROTOCOL')) {
								$("#btncomputedStatus").removeClass('disabled');
								statusArr.push({ "ControlValue": "Inactive", "Value": "Inactive" });
								statusArr.push({ "ControlValue": "PendingRegistration", "Value": "Pending Registration" });
							} else {
								$("#btncomputedStatus").addClass('disabled');
							}

							$("#btnEditGroup").removeClass('disabled');
							$("#btnHierarchy").removeClass('disabled');
							$("#btndelete").removeClass('disabled');
							$("#btnBlacklist").removeClass('disabled');

							if (statusAllowed == false) {
								$("#btncomputedStatus").addClass('disabled');
							}

						}
						else if (self.ComputedDeviceStatus() == "Inactive") {
							$("#btnHierarchy").removeClass('disabled');
							$("#btnEditGroup").removeClass('disabled');
							$("#btndelete").removeClass('disabled');
							$("#btnBlacklist").removeClass('disabled');

							$("#btnSchedule").removeClass('disabled');
							$("#softwareDDLDiv").show();
							$("#editBtnForSerialNumber").show();
							$("#btncomputedStatus").empty();
							if (koUtil.deviceOut.SubStatus != "" || koUtil.deviceOut.SubStatus) {
								if (koUtil.deviceOut.SubStatus == "") {
									$("#btncomputedStatus").append("Inactive <span class='caret'></span>");
								} else {
									$("#btncomputedStatus").append("Inactive - " + koUtil.deviceOut.SubStatus + " <span class='caret'></span>");
								}
							} else {
								$("#btncomputedStatus").append("Inactive <span class='caret'></span>");
							}

							statusArr.push({ "ControlValue": "Active", "Value": "Active" });
							statusArr.push({ "ControlValue": "PendingRegistration", "Value": "Pending Registration" });
							statusArr.push({ "ControlValue": "Inactive", "Value": "Inactive" });
							$("#btncomputedStatus").removeClass('disabled');
							$("#btnEditGroup").removeClass('disabled');
							$("#btnHierarchy").removeClass('disabled');
							$("#btndelete").removeClass('disabled');
							$("#btnBlacklist").removeClass('disabled');

							if (statusAllowed == false) {
								$("#btncomputedStatus").addClass('disabled');
							}

						}
						else if (self.ComputedDeviceStatus() == "PendingRegistration") {
							$("#btnHierarchy").removeClass('disabled');
							$("#btnEditGroup").removeClass('disabled');
							$("#btndelete").removeClass('disabled');
							$("#btnBlacklist").removeClass('disabled');

							$("#btnSchedule").removeClass('disabled');
							$("#softwareDDLDiv").show();
							$("#editBtnForSerialNumber").show();
							$("#btncomputedStatus").empty();
							$("#btncomputedStatus").addClass('disabled');
							$("#btncomputedStatus").append("Pending Registration <span class='caret'></span>");

							$("#btnEditGroup").removeClass('disabled');
							$("#btnHierarchy").removeClass('disabled');
							$("#btndelete").removeClass('disabled');
							$("#btnBlacklist").removeClass('disabled');
						}
						else if (self.ComputedDeviceStatus() == "PendingHierarchyAssignment") {

							$("#btnHierarchy").removeClass('disabled');
							$("#btnEditGroup").removeClass('disabled');
							$("#btndelete").removeClass('disabled');
							$("#btnBlacklist").removeClass('disabled');

							$("#btnSchedule").removeClass('disabled');
							$("#softwareDDLDiv").show();
							$("#editBtnForSerialNumber").show();
							$("#btncomputedStatus").empty();
							if (statusAllowed == true) {
								$("#btncomputedStatus").removeClass('disabled');
							} else {
								$("#btncomputedStatus").addClass('disabled');
							}
							$("#btncomputedStatus").append("Pending Hierarchy Assignment <span class='caret'></span>");
							statusArr.push({ "ControlValue": "Active", "Value": "Active" });
							statusArr.push({ "ControlValue": "PendingRegistration", "Value": "Pending Registration" });
							statusArr.push({ "ControlValue": "Inactive", "Value": "Inactive" });

							$("#btnEditGroup").removeClass('disabled');
							$("#btnHierarchy").removeClass('disabled');
							$("#btndelete").removeClass('disabled');
							$("#btnBlacklist").removeClass('disabled');
						}
						else if (self.ComputedDeviceStatus() == "Deleted") {
							$("#btnSchedule").addClass('disabled');
							$("#softwareDDLDiv").hide();
							$("#editBtnForSerialNumber").hide();
							$("#btncomputedStatus").empty();
							$("#btncomputedStatus").append("Deleted <span class='caret'></span>");
							statusArr.push({ "ControlValue": "Undelete", "Value": "UnDeleted" });
							//$("#btncomputedStatus").addClass('disabled');

							$("#btnEditGroup").removeClass('disabled');
							$("#btnHierarchy").removeClass('disabled');
							$("#btndelete").addClass('disabled');
							$("#btnBlacklist").removeClass('disabled');
							//$("#btnDownloadSettings").prop('disabled', true);
						}
						else if (self.ComputedDeviceStatus() == "BlackListed") {
							$("#btnSchedule").addClass('disabled');
							$("#softwareDDLDiv").hide();
							$("#editBtnForSerialNumber").hide();
							$("#btncomputedStatus").empty();
							$("#btncomputedStatus").append("BlackListed <span class='caret'></span>");
							$("#btncomputedStatus").addClass('disabled');
							$("#btnEditGroup").addClass('disabled');
							$("#btnHierarchy").addClass('disabled');
							$("#btndelete").addClass('disabled');
							$("#btnBlacklist").addClass('disabled');
							//$("#btnDownloadSettings").prop('disabled', true);
						}
						$("#deviceStatusDDLDiv").show();
						self.deviceStatus([]);
						for (var j = 0; j < statusArr.length; j++) {
							if (statusArr[j].Value == 'Inactive') {
								var obj = new Object();
								obj.Value = statusArr[j].Value;
								obj.SubChild = deviceSubStatusDataUser ? (deviceSubStatusDataUser.length > 0 ? deviceSubStatusDataUser : []) : [];
								self.deviceStatus.push(obj);

							} else {
								var obj = new Object();
								obj.Value = statusArr[j].Value;
								obj.SubChild = [];
								self.deviceStatus.push(obj);
							}
						}
						//self.deviceStatus(statusArr);
					} else {
						$("#deviceStatusDDLDiv").hide();
					}
				};
				if (koUtil.serialNumber == '') {
					$("#btnBlacklist").addClass('disabled');
				}
				self.deviceProfileTabData(deviceProfileTempTabData);
			}
			$("#loadingDiv").hide();
		}


		self.ChangStatusModelOpen = function (data) {
			self.selectedStatus(data);
			if (isInactive == false && data.SubChild.length == 0) {
				if (data.Value == "Pending Registration" && String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
					openAlertpopup(1, 'device_status_cannot_be_changed_to_pending_registration');
					return;
				}
				var value = data.Value;
				if (value == "UnDeleted") {
					$("#undeleteModel").modal('show');
				}
				else {
					$("#StatusMsg").text(i18n.t("changeStausOfDeviceForDeviceProfile", { value: value }, { lng: lang }));
					$("#modelChangestatusConfirmation").modal('show');
				}
			}
			isInactive = false;
		}

		self.ChangStatusModelOpenForInactive = function (data) {
			isInactive = true;
			var deviceSubStatusName = koUtil.subStatusForDeviceProfile;
			var dataStatus = data.SubStatus;

			koUtil.globalSubStatusForDeviceProfile = data.SubStatus;
			koUtil.globalSubStatusIdForDeviceProfile = data.SubStatusId;

			if (data.SubStatus == koUtil.subStatusForDeviceProfile) {
				openAlertpopup(1, i18n.t('device_already_in_inactive_substatus_state', { deviceSubStatusName: deviceSubStatusName }, { lng: lang }));
				return;
			} else if (dataStatus == "--No-Sub-Status--" && deviceSubStatusName != '') {
				$("#StatusMsg").text(i18n.t("change_device_status_to_inactive", { lng: lang }));
				$("#modelChangestatusConfirmation").modal('show');
			}
			//else if (dataStatus == "--No-Sub-Status--" && deviceSubStatusName == '') {
			//    openAlertpopup(1, 'Selected Device is already in Inactive State.');
			//}
			else {
				$("#StatusMsg").text(i18n.t("changeStausOfDeviceForDeviceProfileInactive", { dataStatus: dataStatus }, { lng: lang }));
				$("#modelChangestatusConfirmation").modal('show');
			}

		}

		function loadelement(elementname, controlerId) {
			if (elementname != '') {
				if (!ko.components.isRegistered(elementname)) {
					generateTemplate(elementname, controlerId);
				}
				self.observableDeviceProfileTempalte(elementname);
			}
		}

		function loadelementPopUp(elementname, controlerId) {
			if (elementname != '') {
				if (!ko.components.isRegistered(elementname)) {
					generateTemplate(elementname, controlerId);
				}
				self.observableModelPopupForDeviceProfile(elementname);
			}
		}
		function loadHierarchyModelPopup(elementname, controllerId) {// Hierarchy Model Pop up

			if (!ko.components.isRegistered(elementname)) {
				//new template code
				var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
				var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
				ko.components.register(elementname, {
					viewModel: { require: ViewName },
					template: { require: 'plugin/text!' + htmlName }
				});
			}
			self.observableHierarchyModelPopup(elementname);
		}

		self.refreshData = function () {
			GetDevice();
		}

		self.openEditDeviceIdPopup = function () {
			$("#deviceIdEditPopup").modal('show');
			$("#saveDevProfDetails").prop('disabled', true);
		}

		self.isSwapCheckConfoYes = function () {
			self.editDeviceIdFinalCall();

			self.swapCheckBoxCall("2", "true")// For Disble Swap Enable Checkbox
		}

		self.editDeviceId = function (isCheckEnableSwap) {
			if ($("#swapCheckBox").is(':checked')) {
				if ($("#txtDeviceId").val().trim() == '') {
					$("#enableSwapIsCheck").modal('show');
				} else {
					self.editDeviceIdFinalCall();
				}

			} else {
				self.editDeviceIdFinalCall();
			}
		}

		////
		self.serialNumberChange = function () {
			if ($("#txtSerialNumber").val() == '' && $("#txtDeviceId").val() == '') {
				$("#saveDevProfDetails").prop('disabled', true);
			}
		}


		self.editDeviceIdFinalCall = function () {
			var model = self.deviceModel();
			var updateDeviceDetailsReq = new Object();
			updateDeviceDetailsReq.DeviceId = $("#txtDeviceId").val().trim();

			if ($("#txtSerialNumber").val().trim() != koUtil.serialNumber) {
				isSerialNumberChanged = true;
				$("#saveDevProfDetails").removeAttr('disabled', false);
			} else {
				isSerialNumberChanged = false;
				$("#saveDevProfDetails").prop('disabled', true);
			}

			//-----------send device update mode depend on value--------
			if (isSerialNumberChanged == true && isDeviceIdChanged == false) {
				updateDeviceDetailsReq.DeviceUpdateMode = ENUM.get('DEVICE_MODE_SERIAL_NUMBER');
			} else if (isSerialNumberChanged == false && isDeviceIdChanged == true) {
				updateDeviceDetailsReq.DeviceUpdateMode = ENUM.get('DEVICE_MODE_DEVICEID');
			} else if (isSerialNumberChanged == true && isDeviceIdChanged == true) {
				updateDeviceDetailsReq.DeviceUpdateMode = ENUM.get('DEVICE_MODE_BOTH');
			} else {
				updateDeviceDetailsReq.DeviceUpdateMode = ENUM.get('DEVICE_MODE_NONE');
			}

			//updateDeviceDetailsReq.DeviceUpdateMode = ENUM.get('DEVICE_MODE_DEVICEID');
			updateDeviceDetailsReq.ModelId = model.ModelId;
			updateDeviceDetailsReq.ModelName = model.ModelName;
			updateDeviceDetailsReq.InternalModelName = model.InternalModelName;
			updateDeviceDetailsReq.OldDeviceId = oldDeviceID;
			updateDeviceDetailsReq.OldSerialNumber = oldSerialNumber;
			updateDeviceDetailsReq.SerialNumber = $("#txtSerialNumber").val().trim();
			updateDeviceDetailsReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
			updateDeviceDetailsReq.Family = koUtil.deviceFamily;
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(0, 'device_details_successfully_updated');
						$("#deviceIdEditPopup").modal('hide');
						$("#deviceIdEditPopupContent").css('left', '');
						$("#deviceIdEditPopupContent").css('top', '');
						GetDevice();
					}
					else if (data.responseStatus.StatusCode == AppConstants.get('MODIFIED_OR_DELETED_DEVICE_ID')) {
						openAlertpopup(1, data.responseStatus.StatusMessage);
					}
					else if (data.responseStatus.StatusCode == AppConstants.get('DEVICEID_EXISTS_WITH_DIFFERENT_DEVICE')) {
						openAlertpopup(1, data.responseStatus.StatusMessage);
					}
					else if (data.responseStatus.StatusCode == AppConstants.get('SERIAL_NUMBER_EXISTS_WITH_DIFFERENT_DEVICE')) {
						openAlertpopup(1, 'serial_number_already_exists');
					}

					isDeviceIdChanged = false;
					isSerialNumberChanged = false;
				}

			}
			var params = '{"token":"' + TOKEN() + '","updateDeviceDetailsReq":' + JSON.stringify(updateDeviceDetailsReq) + '}';
			ajaxJsonCall('UpdateDeviceDetails', params, callBackfunction, true, 'POST', true)
		}

		self.UpdateDevice = function (data) {
			var updateDeviceReq = new Object();
			var Device = new Object();
			Device.Status = ENUM.get(data.Value);
			var Selector = new Object();

			Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
			Selector.UnSelectedItemIds = null;

			var SubStatus = new Object();
			SubStatus.SubStatusId = koUtil.globalSubStatusIdForDeviceProfile;
			SubStatus.SubStatusName = koUtil.globalSubStatusForDeviceProfile;

			updateDeviceReq.Device = Device;
			updateDeviceReq.DeviceSearch = null;
			updateDeviceReq.Selector = Selector;
			updateDeviceReq.SubStatus = SubStatus;
			isInactive = false;
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(0, 'alert_device_updated_success');
						GetDevice();
					}
				}
			}
			var method = 'UpdateDevice';
			var params = '{"token":"' + TOKEN() + '","updateDeviceReq":' + JSON.stringify(updateDeviceReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		//function GetTimeZones(deviceTimeZoneArr) {
		//    var callBackfunction = function (data, error) {
		//        if (data) {
		//            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
		//                if (data.timeZonesList)
		//                    data.timeZonesList = $.parseJSON(data.timeZonesList);

		//                deviceTimeZoneArr(data.timeZonesList);
		//                GetDevice();
		//            }
		//        }
		//    }
		//    var params = '{"token":"' + TOKEN() + '"}';
		//    ajaxJsonCall('GetTimeZones', params, callBackfunction, true, 'POST', '');
		//}

		self.txtdeviceIDValidate.subscribe(function (newValue) {

			if ($("#txtDeviceId").val() == undefined || $("#txtSerialNumber").val() == undefined || ($("#txtSerialNumber").val().trim() == '' && $("#txtDeviceId").val().trim() == '')) {
				$("#saveDevProfDetails").prop('disabled', true);
				return;
			}


			if ($("#txtDeviceId").val().trim() != koUtil.deviceId) {
				if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('VEM_PROTOCOL')) {
					$("#saveDevProfDetails").removeAttr('disabled', false);
					isDeviceIdChanged = true;
				}
				else if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
					if ($("#txtDeviceId").val().trim() != '') {
						$("#saveDevProfDetails").removeAttr('disabled', false);
						isDeviceIdChanged = true;
					}
					else {
						$("#saveDevProfDetails").prop('disabled', true);
					}
				}
			} else if ($("#txtDeviceId").val().trim() == koUtil.deviceId) {
				$("#saveDevProfDetails").prop('disabled', true);
				isDeviceIdChanged = false;
			} else {
				$("#saveDevProfDetails").prop('disabled', true);
			}

		});


		self.serialNumber.subscribe(function (newValue) {
			//self.serialNumAndDevID()
			if ($("#txtSerialNumber").val() == undefined ||
				$("#txtDeviceId").val() == undefined ||
				($("#txtSerialNumber").val().trim() == '' && $("#txtDeviceId").val().trim() == '')) {
				$("#saveDevProfDetails").prop('disabled', true);
				return;
			}

			if ($("#txtSerialNumber").val().trim() != koUtil.serialNumber) {
				self.serialNumAndDevID();
				isSerialNumberChanged = true;
				$("#saveDevProfDetails").removeAttr('disabled', false);
			} else {
				isSerialNumberChanged = false;
				$("#saveDevProfDetails").prop('disabled', true);
			}
		});

		self.serialNumAndDevID = function () {
			if (self.serialNumber().trim() == '' && self.txtdeviceIDValidate().trim() == '') {
				$("#saveDevProfDetails").prop('disabled', true);
			} else {
				$("#saveDevProfDetails").prop('disabled', false);
			}
		}

		self.deviceIdEditCancel = function () {
			$("#deviceIdEditPopup").modal('hide');
			self.txtdeviceIDValidate(koUtil.deviceId);
			$("#saveDevProfDetails").prop('disabled', true);

			isDeviceIdChanged = false;
			isSerialNumberChanged = false;
			self.serialNumber(koUtil.serialNumber);
			$("#deviceIdEditPopupContent").css('left', '');
			$("#deviceIdEditPopupContent").css('top', '');

		}

		seti18nResourceData(document, resourceStorage);
	};
	////////////////////////////////////////////////////Activate parameter/////////////////////////////////////////////////////////////   
	function getSystemConfigurationForValidateActivateParameters() {
		var category = "System";
		var configName = "Direct Parameter Activation"
		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.systemConfiguration)
						data.systemConfiguration = $.parseJSON(data.systemConfiguration);

					if (data.systemConfiguration.ConfigValue == 1) {
						$("#activateParam").hide();
						isDirectParameterActivation = true;
					} else {
						$("#activateParam").show();
						isDirectParameterActivation = false;
					}
				}
			}
		}

		var method = 'GetSystemConfiguration';
		var params = '{"token":"' + TOKEN() + '","category":"' + category + '","configName":"' + configName + '"}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
	}

	function getSystemConfigurationForSwapApprovalStatus() {
		var category = "System";
		var configName = "Swap Approval Required"
		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.systemConfiguration)
						data.systemConfiguration = $.parseJSON(data.systemConfiguration);

					if (data.systemConfiguration.ConfigValue == 1) {
						koUtil.isAllowSwapRequests(true);
					} else {
						koUtil.isAllowSwapRequests(false);
					}
				}
			}
		}

		var method = 'GetSystemConfiguration';
		var params = '{"token":"' + TOKEN() + '","category":"' + category + '","configName":"' + configName + '"}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
	}



	function generateTemplate(tempname, controlerId) {
		//new template code
		var htmlName = '../template/' + controlerId + '/' + tempname + '.html';
		var ViewName = 'controller/' + controlerId + '/' + tempname + '.js';
		ko.components.register(tempname, {
			viewModel: { require: ViewName },
			template: { require: 'plugin/text!' + htmlName }

		});
		// end new template code
	}



	function calculatePercentage(input1, input2) {
		var retVal = 0;
		retVal = parseFloat((input1 / input2) * 100);
		retVal = Math.round(retVal);
		return retVal;
	}
});

