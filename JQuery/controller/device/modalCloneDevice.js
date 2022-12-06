define(["knockout", "koUtil"], function (ko, koUtil) {
	var lang = getSysLang();
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	return function cloneDevice() {
		var self = this;

		$('#modalCloneDevice').keydown(function (e) {
			if ($('#addDeviceman_CancelBtn').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#addDeviceman_CloseBtn').focus();
			}
		});

		$('#modalCloneDeviceHeader').mouseup(function () {
			$("#modalCloneDevice").draggable({ disabled: true });
		});

		$('#modalCloneDeviceHeader').mousedown(function () {
			$("#modalCloneDevice").draggable({ disabled: false });
		});

		// allow only 30 charcters in  Serial #
		$("#txtNewSerialNumber").on("keypress keyup paste", function (e) {
			var textMax = 30;
			var textLength = $('#txtNewDeviceId').val().length;
			var textRemaining = textMax - textLength;
		});

		// allow only 30 charcters in  Device Id
		$("#txtNewDeviceId").on("keypress keyup paste", function (e) {
			var textMax = 30;
			var textLength = $('#txtNewDeviceId').val().length;
			var textRemaining = textMax - textLength;
		});

		self.onChangeCopyDownloadOptions = function () {

		}

		self.onChangeCopySoftware = function (event) {
			if ($("#chkCopySoftware").is(':checked')) {
				$("#chkCopyParameters").prop('disabled', false);
			} else {
				$("#chkCopyParameters").prop('disabled', true);
				$("#chkCopyParameters").prop('checked', false);
			}
		}

		self.onChangeCopyParameters = function () {

		}

		// validation on add button click
		function checkError() {
			var retVal = "";

			var serialID = $("input#txtNewSerialNumber");
			var deviceID = $("input#txtNewDeviceId");
			serialID.val(serialID.val().replace(/^\s+/, ""));
			deviceID.val(deviceID.val().replace(/^\s+/, ""));

			if ($("#txtNewSerialNumber").val() == "" && $("#txtNewDeviceId").val() == "") {
				retVal += 'serial or device Id';
				openAlertpopup(1, 'either_Serial_or_device_id_is_mandatory');
			} else {
				retVal += '';
			}
			return retVal;
		}

		self.cloneDevice = function (observableModelPopup, parentGridId) {
			var retVal = checkError();
			if (retVal == null || retVal == "") {
				$("#loadingDiv").show();
				copyDevice(observableModelPopup, parentGridId);
			}			
		}

		function copyDevice(observableModelPopup, gId) {
			var copyDevice = new Object();
			var copyOptions = new Object();
			copyOptions.CopyDownloadOptions = $("#chkCopyDownloadOptions").is(':checked') ? true : false;
			copyOptions.CopySoftware = $("#chkCopySoftware").is(':checked') ? true : false;
			copyOptions.CopySoftwareAndParameters = $("#chkCopyParameters").is(':checked') ? true : false;

			var sourceUniqueDeviceId = 0;
			if (!_.isEmpty(deviceLiteData) && deviceLiteData.Source === 'deviceProfile') {
				sourceUniqueDeviceId = deviceLiteData.UniqueDeviceId;
			} else {
				var selectedIds = getSelectedUniqueId(gId);
				var unSelectedIds = getUnSelectedUniqueId(gId);
				var totalDevices = getTotalRowcount(gId);

				if (!_.isEmpty(unSelectedIds) && unSelectedIds.length == totalDevices - 1) {
					sourceUniqueDeviceId = unSelectedIds[0];
				} else if (!_.isEmpty(selectedIds) && selectedIds.length) {
					sourceUniqueDeviceId = selectedIds[0];
				}
			}

			copyDevice.SourceDeviceUid = sourceUniqueDeviceId;
			copyDevice.TargetSerialNumber = $("#txtNewSerialNumber").val();
			copyDevice.TargetDeviceId = $("#txtNewDeviceId").val();
			copyDevice.CopyOptions = copyOptions;

			function callback(data, error) {
				$("#loadingDiv").hide();
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(0, 'device_cloned_successfully');
						if (!_.isEmpty(deviceLiteData) && deviceLiteData.Source === 'deviceProfile') {
							$('#deviceProfileModel').modal('hide');
							//var uniqueDeviceId = data.copyDeviceRes ? data.copyDeviceRes.uniqueDeviceId : koUtil.uniqueDeviceId;
							//window.sessionStorage.setItem("DevProfileUniqueDeviceId", uniqueDeviceId);
							//refreshDeviceProfileLitePage(AppConstants.get('CLONE_DEVICE'));
						} else {
							observableModelPopup('unloadTemplate');
							$("#deviceModel").modal('hide');
							gridFilterClear(gId);
						}
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
					}
				}
			}

			var method = 'CopyDevice';
			var params = '{"token":"' + TOKEN() + '","copyDeviceReq":' + JSON.stringify(copyDevice) + '}';
			ajaxJsonCall(method, params, callback, true, 'POST', true);
		}

		seti18nResourceData(document, resourceStorage);
	}
});