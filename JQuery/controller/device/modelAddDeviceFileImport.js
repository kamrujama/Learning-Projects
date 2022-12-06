define(["knockout", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, autho) {
	var lang = getSysLang();
	uploadedfiledata = new Array();

	return function viewModelForAddDeviceFileImport() {

		var self = this;
		$("#mdlAddDeviceImport").draggable();

		if (selectedMenuOption == "addDevices") {
			$("#modalTitle").text(i18n.t('add_device_via_File_Import', { lng: lang }));
			$("#fileInputDeviceID").prop("accept", ".xml,.csv");
			if (!$("#sampleFileDiv").hasClass('hide')) {
				$("#sampleFileDiv").addClass('hide');
			}
		} else if (selectedMenuOption == "applicationsLibrary") {
			$("#modalTitle").text(i18n.t('import_parameter_templates_for_applications', { lng: lang }));
			$("#fileInputDeviceID").prop("accept", ".xml");
			if ($("#sampleFileDiv").hasClass('hide')) {
				$("#sampleFileDiv").removeClass('hide');
			}
		}

		var deviceValue = "";


		//check rights
		self.checkRights = function (screenName, rightsFor) {
			var retval = autho.checkRightsBYScreen(screenName, rightsFor);
			return retval;
		}

		//click on browse button import button is enabled
		$("#fileInputDeviceID").on('change keyup', function () {
			if ($("#fileInputDeviceID").val() != "") {
				$('#btn_import').removeAttr('disabled');
			}
		});


		$('#mdlAddDeviceImportHeader').mouseup(function () {
			$("#mdlAddDeviceImport").draggable({ disabled: true });
		});

		$('#mdlAddDeviceImportHeader').mousedown(function () {
			$("#mdlAddDeviceImport").draggable({ disabled: false });
		});

		//-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------

		if (selectedMenuOption == "addDevices") {
			$('#modelAddDeviceID').keydown(function (e) {
				if ($('#btn_import_Cancel').is(":focus") && (e.which || e.keyCode) == 9) {
					e.preventDefault();
					$('#addDeviceCloseBtn').focus();
				}
			});
		} else {
			$('#applicationModel').keydown(function (e) {
				if ($('#btn_import_Cancel').is(":focus") && (e.which || e.keyCode) == 9) {
					e.preventDefault();
					$('#addDeviceCloseBtn').focus();
				}
			});
		}

		$('#addDeviceCloseBtn').keydown(function (e) {
			if ($('#addDeviceCloseBtn').is(":focus") && (e.which || e.keyCode) == 9) {

				$('#fileInputDeviceID').focus();

				$('#fileInputDeviceIDBtn').css('border-color', '#FFF');
				//  $('#fileInputDeviceIDBtn').css('border-color', '#666');
				//$('#fileInputDeviceIDBtn').css('background-color', '#fff');
			}
		});
		//------------------------------------------------------------------------------------------------------------------------

		// get uploaded file       
		self.handleDeviceSelect = function () {
			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				openAlertpopup(1, 'the_file_apis_are_not_fully_supported_in_this_browser');
				return;
			}

			input = document.getElementById('fileInputDeviceID');

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
				if (validateFileName(file.name, 3)) {
					$("#selectDeviceID").prop('value', file.name);
					deviceValue = file.name;
					if (deviceValue != "") {
					}
					fr = new FileReader();
					fr.onload = receivedText;
					fr.readAsText(file);
				} else {
					$("#selectDeviceID").prop('value', '');
					openAlertpopup(1, 'selected_file_format_not_supported');
					// reset upload 
					var fileopen = $("#fileInputDeviceID"),
						clone = fileopen.clone(true);
					fileopen.replaceWith(clone);
				}
			}
		}

		// get content of xml or csv file
		function receivedText() {
			var arr = new Array();
			arr = fr.result.split(',');
			var filename = $("#fileInputDeviceID").val();
			for (var i = 0; i < arr.length; i++) {
				uploadedfiledata += arr[i] + ',';
			}
        }

        self.cancelConfirm = function () {
            $("#addDeviceImportConfirmPopup").modal('hide');
            $("#mainPageBody").addClass('modal-open-appendon');
        }

		extension = "xml";
		//import device on button click
        self.importAddDevice = function (observableModelPopup, blobOrFile, timezoneCheckForBlank) {
			$("#loadingDiv").show();
			var xhr = new XMLHttpRequest();

			var context = this;
			var tokenString = TOKEN();

			var formData = new FormData();
			//  formData.append("myFile", blobOrFile[0].files[0]);

			for (i = 0; i < blobOrFile.files.length; i++) {
				extension = blobOrFile.files[i].name.substr((blobOrFile.files[i].name.lastIndexOf('.') + 1));
				extension = extension.toLowerCase();
				formData.append("myFile", blobOrFile.files[i]);
			}

            if (extension == 'csv') {
                extension=extension+'d';
            }
            var skipTimeZoneCheck = false;
            if (timezoneCheckForBlank == "YES") {
                skipTimeZoneCheck = true;
            }
            formData.append('Authorization', tokenString);
			formData.append("fileExtension", '.' + extension);
            formData.append("SkipTimeZoneCheck", skipTimeZoneCheck);
            var addDeviceCall = function () {
                $("#loadingDiv").hide();
                var jsonData = JSON.parse( xhr.responseText);
                if (jsonData.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'request_to_import_the_data_has_been_submitted');                    
					observableModelPopup('unloadTemplate');
					if (selectedMenuOption == "addDevices") {
						$("#modelAddDeviceID").modal('hide');
					} else if (selectedMenuOption == "applicationsLibrary") {
						$("#applicationModel").modal('hide');
					}
                } else if (jsonData.responseStatus.StatusCode == AppConstants.get('EX_BLANK_TIMEZONE_FOR_HIERARCHIES')) {		//375
                    $("#addDeviceImportConfirmPopup").modal('show');
                } else if (jsonData.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_FORM_VIEW_FILE')) {	//226
					showMoreMessageLogs('XML', jsonData.responseStatus.StatusMessage);
				} else if (jsonData.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_DEFINITION_FILE')) {	//227
					showMoreMessageLogs('XML', jsonData.responseStatus.StatusMessage);
				} else if (jsonData.responseStatus.StatusCode == AppConstants.get('INVALID_XMLFILE_FORMAT')) {				//228
					showMoreMessageLogs('XML', jsonData.responseStatus.StatusMessage);
                } else if (jsonData.responseStatus.StatusCode == AppConstants.get('INVALID_XML')) {							//112
                    if (extension == 'csv') {
                        openAlertpopup(6, jsonData.responseStatus.StatusMessage);
                    } else {
                        openAlertpopup(5, jsonData.responseStatus.StatusMessage);
                    }                    
                } else if (jsonData.responseStatus.StatusCode == AppConstants.get('E_FILE_FORMAT_NOT_SUPPORTED')) {			//234
                     openAlertpopup(5, 'file_format_not_supported'); 
				} else if (jsonData.responseStatus.StatusCode == AppConstants.get('INVALID_XMLVERSION')) {					//282
					openAlertpopup(5, jsonData.responseStatus.StatusMessage);
				} else if (jsonData.responseStatus.StatusCode == AppConstants.get('VERSION_NOT_FOUND')) {					//283
                    openAlertpopup(5, 'vhqdata_version_is_missing');
                } else if (jsonData.responseStatus.StatusCode == AppConstants.get('E_INVALID_SCHEMA_FILE')) {				//353
                    openinvalidXMLorCSVPopup('ex_Invalid_schema_file', jsonData.responseStatus.AdditionalInfo);
                } else if (jsonData.responseStatus.StatusCode == AppConstants.get('E_INVALID_XSD_VERSION')){				//354
                    openAlertpopup(2, i18n.t('ex_Invalid_xsd_version_deviceimport', { schemaVersion: jsonData.responseStatus.AdditionalInfo }, { lng: lang }));
				} else if (jsonData.responseStatus.StatusCode == AppConstants.get('E_IMPORT_LIMIT_EXCEEDED')) {				//399
					openAlertpopup(2, i18n.t('e_import_limit_exceeded'));
                } else if (jsonData.responseStatus.StatusCode == AppConstants.get('CANNOT_CREATE_A_FILE_WHEN_ALREADY_EXISTS')) {                  //29
                    openAlertpopup(2, "info_not_enough_disk_spack_in_server");
                }
            };
          
            xhr.open('POST', AppConstants.get('API_URL') + '/ImportDevice', true);
            xhr.setRequestHeader('Content-length', blobOrFile.size);
            xhr.onload = addDeviceCall;
            xhr.send(formData);
        }

		seti18nResourceData(document, resourceStorage);
	};
});
