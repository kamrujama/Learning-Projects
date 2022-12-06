var isDirectSoftAssignMent;
define(["knockout", "autho", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, autho, koUtil, ADSearchUtil) {
	var lang = getSysLang();
	modelId = new Array();
	ConfigurableValuesForProtocol = new Array();
	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	return function viewModelForAddDeviceManually() {

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

		//Chosen dropdown
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



		var self = this;


		self.softwareAssignment = ko.observable();
		self.addDeviceArr = ko.observableArray();
		self.modelDevice = ko.observable();
		self.selectedProtocol = ko.observable();
		self.observableHierarchy = ko.observable();
		self.isZontalkModel = ko.observable(false);
		var autoDownloadOn = '';
		var isAutoSchedulingEnabled = false;
		var isAutoSchedulingDuringMHB = false;
		addSoftwareAssignment = new Object();

		ADSearchUtil.AdScreenName = 'addDeviceManually';
        deviceLiteData = new Object();		//modalHierarchy checks for device profile data. But from this screen, it should not check. Hence clearing
		setScreenControls(AppConstants.get('ADD_DEVICE'));

		self.checkRights = function (screenName, rightsFor) {
			var retval = autho.checkRightsBYScreen(screenName, rightsFor);
			return retval;
		}


		self.softwareAssignment(globalSoftwareAssignment);

		//focus on second textbox
		$('#modelAddDeviceID').on('shown.bs.modal', function () {
			$('#serialID').focus();
		})


		$('#modelAddDeviceID').keydown(function (e) {
			if ($('#addDeviceman_CancelBtn').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#addDeviceman_CloseBtn').focus();
			}
		});

		$('#mdlAddDeviceManuallyHeader').mouseup(function () {
			$("#mdlAddDeviceManually").draggable({ disabled: true });
		});

		$('#mdlAddDeviceManuallyHeader').mousedown(function () {
			$("#mdlAddDeviceManually").draggable({ disabled: false });
		});


		$('#hierarchyModelHeader').mouseup(function () {
			$("#hierarchyModelContent").draggable({ disabled: true });
		});

		$('#hierarchyModelHeader').mousedown(function () {
			$("#hierarchyModelContent").draggable({ disabled: false });
		});

		$('#anchorAssignmentID').addClass('disabled');
		$('#anchorAssignmentID').prop('disabled', true);
		$('#anchorAssignmentID').css({ cursor: "default" });

		//Cancel Hierarchy 
		self.cancelHierarchy = function () {

			$("#hierarchyModel").modal('hide');
			$("#hierarchyModelContent").css('left', '');
			$("#hierarchyModelContent").css('top', '');
			self.observableHierarchy('unloadTemplate');
			checkIsPopUpOPen();
		}

		//TO Clear the previous selected Collection
		koUtil.movedPackageArray = [];
		koUtil.movedApplicationArray = [];

		//For Hierarchy
		var modelname = 'unloadTemplate';
		loadHierarchy(modelname, 'genericPopup');

		self.hierarchyName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('hierarchy_is_mandatory', {
					lng: lang
				})
			}
		});

		self.ModelName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('model_is_mandatory', {
					lng: lang
				})
			}
		});

		self.Protocol = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('protocol_is_mandatory', {
					lng: lang
				})
			}
		});

		self.modelDevice.subscribe(function (data) {
			var tempProtocol = new Array();
			var source = _.where(koUtil.getModelsFamily(), { ModelId: data });

			if (source[0]) {
				var VEMObj = _.where(ConfigurableValuesForProtocol, { ConfigValue: 'VEM' });
				var Zontalk = _.where(ConfigurableValuesForProtocol, { ConfigValue: 'Zontalk' });
				var platformArray = source[0].Platform;
				platformArray = platformArray.split(',');

				self.isZontalkModel(false);
				if (($.inArray("Vx eVo", platformArray) >= 0) || ($.inArray(" Vx eVo", platformArray) >= 0)) {
					tempProtocol.push(VEMObj[0]);
					tempProtocol.push(Zontalk[0]);
				}
				if (($.inArray("Vx Predator", platformArray) >= 0) || ($.inArray(" Vx Predator", platformArray) >= 0)) {
					tempProtocol.push(Zontalk[0]);
					//self.isZontalkModel(true);
				}
				if (($.inArray("V/OS", platformArray) >= 0) || ($.inArray(" V/OS", platformArray) >= 0)) {
					tempProtocol.push(VEMObj[0]);
				}
			}

			self.GetConfigurableValuesForProtocol(tempProtocol);
		});

		self.selectedProtocol.subscribe(function (data) {
			self.isZontalkModel(false);
			if (data == 'Zontalk') {
				self.isZontalkModel(true);
			}
		});

		//
		self.GetConfigurableValuesForProtocol = ko.observableArray();
		//Protocol API call
		//GetConfigurableValues(self.GetConfigurableValuesForProtocol);

		// allow only 30 charcters in  Serial #
		$("#serialID").on("keypress keyup paste", function (e) {
			var textMax = 30;
			var textLength = $('#serialID').val().length;
			var textRemaining = textMax - textLength;
		});

		// allow only 30 charcters in  Device Id
		$("#deviceID").on("keypress keyup paste", function (e) {
			var textMax = 30;
			var textLength = $('#deviceID').val().length;
			var textRemaining = textMax - textLength;
		});

		// all popup values stored in grid when we click on add button.
		self.addDeviceManually = function (observableModelPopup, addDatatoGrid, unloadTempPopup) {
			var retVal = checkError();
			if (retVal == null || retVal == "") {
				$("#loadingDiv").show();
				getAddDeviceManually(observableModelPopup, self.addDeviceArr, addDatatoGrid, unloadTempPopup);
			} else {

			}
		}


		// focus on next tab index 
		lastIndex = 9;
		prevLastIndex = 3;

		$(document).keydown(function (e) {
			if (e.keyCode == 9) {
				var thisTab = +$(":focus").prop("tabindex") + 1;
				if (e.shiftKey) {
					if (thisTab == prevLastIndex) {
						$("#" + tabLimitInID).find('[tabindex=' + prevIndex + ']').focus();
						return false;
					}
				} else {
					if (thisTab == lastIndex) {
						$("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
						return false;
					}
				}
			}
		});

		var setTabindexLimit = function (x, fancyID, y) {
			console.log(x);
			startIndex = 2;
			lastIndex = x;
			prevLastIndex = y;
			prevIndex = 8;
			tabLimitInID = fancyID;
			$("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
		}
		setTabindexLimit(9, "addManually", 3);

		//open upload file input dialog box on enter key
		$("#inputGroupHierarchy").on('keypress', function (e) {
			var keyCode = e.which || e.keyCode;
			if (keyCode == 13) {
				$('#hierarchyId').click();
			}
			if (keyCode == 32) {
				$('#hierarchyId').click();
			}
			event.preventDefault();
		});
		//end

		//open upload file input dialog box on enter key
		$("#inputGroupAssignment").on('keypress', function (e) {
			var keyCode = e.which || e.keyCode;
			if (keyCode == 13) {
				var value = $("#modelDeviceID").find('option:selected').val();
				if (value.length != 0) {
					$('#anchorAssignmentID').click();
				}
			}
			if (keyCode == 32) {
				var value = $("#modelDeviceID").find('option:selected').val();
				if (value.length != 0) {
					$('#anchorAssignmentID').click();
				}
			}
			event.preventDefault();
		});

		//end

		// validation on add button click
		function checkError() {
			var retVal = "";

			var serialID = $("input#serialID");
			var deviceID = $("input#deviceID");
			serialID.val(serialID.val().replace(/^\s+/, ""));
			deviceID.val(deviceID.val().replace(/^\s+/, ""));
			//if ($("#protocolID").val().toUpperCase() == AppConstants.get('VEM_PROTOCOL')) {
			//    self.isZontalkModel(false);
			//}
			//else if ($("#protocolID").val().toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
			//    self.isZontalkModel(true);
			//}

			if (self.isZontalkModel() && $("#deviceID").val() == "") {
				retVal += 'device Id';
				openAlertpopup(1, 'did_is_mandatory');
			}

			if ($("#serialID").val() == "" && $("#deviceID").val() == "") {
				retVal += 'serial or device Id';
				openAlertpopup(1, 'either_Serial_or_device_id_is_mandatory');
			} else {
				retVal += '';
			}

			if ($("#hierarchyValue").val() == "") {
				retVal += 'hierarchy name';
				$("#hierarchyValidationID").text(i18n.t('hierarchy_is_mandatory'));
				$("#hierarchyValidationID").show();
				self.hierarchyName(null);
			} else {
				retVal += '';
				$("#hierarchyValidationID").hide();
			}

			if ($("#modelDeviceID").chosen().val() == null || $("#modelDeviceID").chosen().val() == "" || $("#modelDeviceID").chosen().val().length == 0) {
				retVal += 'Select Model';
				self.ModelName(null);
				$("#validationModelID").text(i18n.t('model_is_mandatory'));
				$("#validationModelID").show();
			} else {
				retVal += '';
				$("#validationModelID").hide();
			}

			//if ($("#protocolID").chosen().val() == null) {
			//    retVal += 'Select Protocol';
			//    self.selectedProtocol(null);
			//    $("#validationProtocolID").append(i18n.t('protocol_is_mandatory'));
			//} else {
			//    retVal += '';
			//    $("#validationProtocolID").empty();

			//}

			return retVal;
		}

		self.onChangeModel = function () {

			$("#validationModelID").empty();
			if ($("#modelDeviceID").chosen().val() == null || $("#modelDeviceID").chosen().val() == "" || $("#modelDeviceID").chosen().val().length == 0) {
				self.ModelName(null);
				$("#model_is_mandatory").show();
				$("#validationModelID").append(i18n.t('model_is_mandatory'));
			} else {
				var forselction = [];
				self.addDeviceArr([]);
				$('#modelDeviceID :selected').each(function (i, selected) {
					forselction[i] = $(selected).text();
				});
				self.addDeviceArr.push(forselction);
				$("#validationModelID").empty();
				koUtil.movedApplicationArray = [];
				//enable or disabled software assignment button 
				var value = $("#modelDeviceID").find('option:selected').val();
				if (value.length != 0) {
					$('#anchorAssignmentID').removeClass('disabled');
					$('#anchorAssignmentID').prop('disabled', false);
					$('#anchorAssignmentID').css({ cursor: "pointer" });
				} else {
					$('#anchorAssignmentID').addClass('disabled');
					$('#anchorAssignmentID').prop('disabled', true);
					$('#anchorAssignmentID').css({ cursor: "default" });
				}
			}
		}

		//self.onChangeProtocol = function () {
		//    $("#validationProtocolID").empty();
		//    if ($("#protocolID").chosen().val() == null) {
		//        self.Protocol(null);
		//        $("#protocol_is_mandatory").show();
		//        $("#validationProtocolID").append(i18n.t('protocol_is_mandatory'));
		//    } else {
		//        var forselction = [];
		//        self.addDeviceArr([]);
		//        $('#modelDeviceID :selected').each(function (i, selected) {
		//            forselction[i] = $(selected).text();
		//        });
		//        self.addDeviceArr.push(forselction);
		//        $("#validationProtocolID").empty();
		//    }

		//    $("#txtSoftwareAssignment").val('');
		//    koUtil.movedPackageArray = [];
		//}

		//open software assginment popup
		self.templateFlag = ko.observable(false);
		self.hierarchyTemplateFlag = ko.observable(false);
		self.observableModelPopupForManually = ko.observable();

		//for open popup
		var modelName = 'unloadTemplate';
		loadelement(modelName, 'genericPopup');
		modelReposition();
		self.openPopup = function (popupName) {
			self.templateFlag(true);
			if (popupName == "modelSoftwareAssignment") {
				if ($("#txtSoftwareAssignment").val() == '') {
					hasData = false;
				} else {
					hasData = true;
				}
				isFromAddDevice = true;
				isDirectSoftAssignMent = 0;
				isZontalkDevice = self.isZontalkModel();
				//koUtil.Protocol = self.selectedProtocol();
				koUtil.movedPackageArray = [];
				koUtil.movedApplicationArray = [];
				loadelement(popupName, 'device');
				$('#deviceModelFormanually').modal('show');
				//globalModelId = getmodelarrFunction();
				columnGroupClickLinkGridStyle('jqxgridAvailablePackage ');
				$("#btnAdd").prop('disabled', true);
				globalModelId = getmodelarr(self.addDeviceArr());
			} else if (popupName == "modalHierarchy") {
				hierarchyforAddDevice = 1;
				self.hierarchyTemplateFlag(true);
				loadHierarchy('modalHierarchy', 'genericPopup');
				$('#hierarchyModel').modal('show');
			}
		}

		//unload hierarchy popup
		self.unloadHierarchy = function () {
			self.observableHierarchy('unloadTemplate');
			checkIsPopUpOPen();
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

		self.unloadTempPopup = function (popupName) {
			self.observableModelPopupForManually('unloadTemplate');
			$("#deviceModelFormanually").modal('hide');
			checkIsPopUpOPen();
		};

		function getmodelarrFunction() {
			var selectedModelId = $("#modelDeviceID").chosen().val();
			//var modelNew = new Array();
			//for (var i = 0; i < selectedModelId.length; i++) {
			//    var EModel = new Object();
			//    EModel.ModelId = selectedModelId[i];
			//    modelNew.push(EModel);
			//}
			var convertToInt = parseInt(selectedModelId);
			return convertToInt;
		}


		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopupForManually(elementname);
		}

		seti18nResourceData(document, resourceStorage);
	}

	function GetConfigurableValues(GetConfigurableValuesForProtocol) {
		var category = AppConstants.get('Device_Protocol');

		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.genericConfigurations)
						data.genericConfigurations = $.parseJSON(data.genericConfigurations);

					GetConfigurableValuesForProtocol(data.genericConfigurations);
					ConfigurableValuesForProtocol = data.genericConfigurations;
				} else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
					$("#loadingDiv").hide();
					Token_Expired();
				}
			}
			if (error) {
				$("#loadingDiv").hide();
			}
		}

		var method = 'GetConfigurationValues';
		var params = '{"token":"' + TOKEN() + '","category":"' + category + '"}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
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

	function getmodelarr(model) {
		var selectedModelId = $("#modelDeviceID").chosen().val();
		var selectedModelName = model[0];
		var selectedModelNameArray = selectedModelName[0];
		var modelNew = new Array();
		var convertToInt = parseInt(selectedModelId);
		var EModel = new Object();
		EModel.ModelId = convertToInt;
		EModel.ModelName = selectedModelNameArray;
		modelNew.push(EModel);
		return modelNew;
	}



	function createPackageIdsList(movedPackageArray) {
		var packageList = new Array();
		var keyList = new Array();
		var packageIdsList = new Array();
		for (i = 0; i < movedPackageArray.length; i++) {
			if (movedPackageArray[i].Type == AppConstants.get('Assignment_Package')) {
				var packageLite = new Object();
				packageLite.PackageId = movedPackageArray[i].PackageId;
				packageLite.Sequence = i + 1;
				packageLite.PackageName = movedPackageArray[i].PackageName;
				packageList.push(packageLite);
				packageIdsList.push(movedPackageArray[i].PackageId);
			} else if (movedPackageArray[i].Type == AppConstants.get('Assignment_Key')) {
				var KeyObj = new Object();
                KeyObj.VrkCustomerid = movedPackageArray[i].VrkCustomerid;
                KeyObj.Destination = movedPackageArray[i].Destination;
                KeyObj.KeyType = movedPackageArray[i].KeyType;
                KeyObj.Name = movedPackageArray[i].Name;
				KeyObj.Sequence = i + 1;
				keyList.push(KeyObj);
			}
		}
		var packageandkeysassigned = new Object();
		packageandkeysassigned.PackageIds = packageIdsList;
		packageandkeysassigned.Packages = packageList;
		packageandkeysassigned.Keys = keyList;
		return packageandkeysassigned;
	}

	function createApplicationIdsList(movedApplicationArray) {
		var appIdsList = new Array();
		for (var i = 0; i < movedApplicationArray.length; i++) {
			appIdsList.push(movedApplicationArray[i].ApplicationId);
		}
		return appIdsList;
	}

	function getAddDeviceManually(observableModelPopup, addDeviceArr, addDatatoGrid, unloadTempPopup) {
		var addDeviceReq = new Object();
		var Device = new Object();
		var model = getmodelarr(addDeviceArr());
		var AutoDownloadConfiguration = new Object();
		var deviceScheduleOptions = new Object();
		var ReferenceSetLite = new Object();

		Device.DeviceId = $("#deviceID").val();
		Device.HierarchyId = koUtil.hierarchyIdForAddDevice;
		Device.SerialNumber = $("#serialID").val();
		Device.Status = ENUM.get('PendingRegistration');
		Device.ModelId = model[0].ModelId;
		Device.ModelName = model[0].ModelName;
		Device.Protocol = koUtil.Protocol;
		addDeviceReq.AutoDownloadConfiguration = null;

		// set data to grid
		var addDeviceManuallyData = new Object();
		addDeviceManuallyData.DeviceId = $("#deviceID").val();
		addDeviceManuallyData.SerialNumber = $("#serialID").val();
		addDeviceManuallyData.ModelName = model[0].ModelName;
		addDeviceManuallyData.HierarchyFullPath = $("#hierarchyValue").val();
		addDeviceManuallyData.Protocol = koUtil.Protocol;
		//end

		addDeviceReq.Device = Device;
		addDeviceReq.PackageIds = null;
		addDeviceReq.Packages = null;
		addDeviceReq.Keys = null;


		if (isPackageChecked == false) {
			AutoDownloadConfiguration.ReferenceSetAssignmentMode = _.isEmpty(addSoftwareAssignment) ? 0 : addSoftwareAssignment.ReferencesetDirect;
			if (AutoDownloadConfiguration.ReferenceSetAssignmentMode == 1) {
				ReferenceSetLite.Name = referenceSetName;
				ReferenceSetLite.ReferenceSetId = referenceSetId;
			} else {
				ReferenceSetLite = null;
			}
			AutoDownloadConfiguration.ReferenceSetLite = ReferenceSetLite;
			addDeviceReq.AutoDownloadConfiguration = AutoDownloadConfiguration;
		} else {
			ReferenceSetLite = null;
			addDeviceReq.AutoDownloadConfiguration = null;
		}

		if (_.isEmpty(addSoftwareAssignment)) {
			deviceScheduleOptions.AutoDownload = ENUM.get("DAMODEIFIED_TRUE");
			deviceScheduleOptions.AutoDownloadOn = '';
			deviceScheduleOptions.IsAutoSchedulingEnabled = false;
			deviceScheduleOptions.IsAutoSchedulingDuringMHB = false;
		} else {
			deviceScheduleOptions.AutoDownload = addSoftwareAssignment.AutomationEnabled;
			deviceScheduleOptions.AutoDownloadOn = addSoftwareAssignment.AutoDownloadOn;
			deviceScheduleOptions.IsAutoSchedulingEnabled = addSoftwareAssignment.IsAutoSchedulingEnabled;
			deviceScheduleOptions.IsAutoSchedulingDuringMHB = addSoftwareAssignment.IsAutoSchedulingDuringMHB;
		}

		addDeviceReq.DeviceScheduleOptions = deviceScheduleOptions;
		// if Package Option is selected
		if (koUtil.movedPackageArray && koUtil.movedPackageArray.length > 0) {
			var packagesandkeys = createPackageIdsList(koUtil.movedPackageArray);
			addDeviceReq.PackageIds = packagesandkeys.PackageIds;
			addDeviceReq.Packages = packagesandkeys.Packages;
			addDeviceReq.Keys = packagesandkeys.Keys;
		}

		// if Application Option is selected
		if (koUtil.movedApplicationArray && koUtil.movedApplicationArray.length > 0)
			addDeviceReq.ApplicationIds = createApplicationIdsList(koUtil.movedApplicationArray);

		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					$("#modelAddDeviceID").modal('hide');
					openAlertpopup(0, 'device_added_successfully');
					observableModelPopup('unloadTemplate');
					unloadTempPopup('unloadTemplate');
					addDeviceManuallyData.UniqueDeviceId = data.addDeviceResp.UniqueDeviceId;
					koUtil.deviceNameForAddDevice.push(addDeviceManuallyData);
					addDatatoGrid();
				} else if (data.responseStatus.StatusCode == AppConstants.get('DEVICEID_EXISTS_WITH_DIFFERENT_DEVICE')) {
					openAlertpopup(1, 'device_id_already_exists');
				} else if (data.responseStatus.StatusCode == AppConstants.get('DEVICE_UNIQUE_KEY_VIOLATION') || data.responseStatus.StatusCode == AppConstants.get('SERIAL_NUMBER_EXISTS_WITH_DIFFERENT_DEVICE')) {
					openAlertpopup(1, 'serial_number_already_exists');
				} else if (data.responseStatus.StatusCode == AppConstants.get('DEVICE_ALREADY_EXISTS')) {
					openAlertpopup(1, data.responseStatus.StatusMessage);
				} else if (data.responseStatus.StatusCode == AppConstants.get('DEVICEID_EXISTS_WITH_DELETED_BLACKLISTED')) {
					openAlertpopup(1, 'deviceid_exists_with_deleted_blacklisted');
				} else if (data.responseStatus.StatusCode == AppConstants.get('EX_DEVICE_COUNT_EXCEED')) {
					openAlertpopup(1, 'please_contact_verifone_to_renew_the_license');
				} else if (data.responseStatus.StatusCode == AppConstants.get('IMPORT_FAILED')) {
					openAlertpopup(1, 'device_import_failed');
				}
			}
			$("#loadingDiv").hide();
		}

		var method = 'AddDevice';
		var params = '{"token":"' + TOKEN() + '","addDeviceReq":' + JSON.stringify(addDeviceReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}
});

