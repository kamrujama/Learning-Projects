define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko) {
    var lang = getSysLang();
    fileData = new Array();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function AddpackageViewModel() {

      
        var self = this;
      

        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        function loadelement(elementname, controllerId) {

            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        function generateTemplate(tempname, controllerId) {
            //new template code
            var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
            var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';


            ko.components.register(tempname, {
                viewModel: { require: ViewName },
                template: { require: 'plugin/text!' + htmlName }
            });
            //  end new template code
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
        }

        //import button disable till file is selected
        $("#fileinput").on('change keyup paste', function () {
            if ($("#fileinput").val() != '') {
                $('#importBtn').removeAttr("disabled");
            }
        });

        $('#mdlUploadHierachyFileHeader').mouseup(function () {
            $("#mdlUploadHierachyFile").draggable({ disabled: true });
        });

        $('#mdlUploadHierachyFileHeader').mousedown(function () {
            $("#mdlUploadHierachyFile").draggable({ disabled: false });
        });

        $('#mdlUploadHierachyFileClose').keydown(function (e) {
            if ($('#mdlUploadHierachyFileClose').is(":focus") && (e.which || e.keyCode) == 9) {
                $('#fileinputBtn').focus();
                e.preventDefault();
            }

        });

        $("#fileinputBtn").keydown(function (e) {
            if (e.keyCode == 13 || e.keyCode == 32) {
                $("#fileinput").click();
            }

            if ($('#fileinputBtn').is(":focus") && (e.which || e.keyCode) == 9) {
                var isimportBtn = $('#importBtn').is(':disabled');
                if (isimportBtn == true) {
                    $('#mdlUploadHierachyFileCancelBtn').focus();
                    e.preventDefault();
                } else {
                    e.preventDefault();
                    $('#importBtn').focus();
                }
            }
        })
        $('#importBtn').keydown(function (e) {
            if ($('#importBtn').is(":focus") && (e.which || e.keyCode) == 9) {
                $('#mdlUploadHierachyFileCancelBtn').focus();
                e.preventDefault();
            }

        });

        $('#mdlUploadHierachyFileCancelBtn').keydown(function (e) {
            if ($('#mdlUploadHierachyFileCancelBtn').is(":focus") && (e.which || e.keyCode) == 9) {
                $('#mdlUploadHierachyFileClose').focus();
                e.preventDefault();
            }

        });


        //Selct file
        var fileValue = "";
        self.handleFileSelect = function () {
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {

                openAlertpopup(1, 'the_file_apis_are_not_fully_supported_in_this_browser');
                return;
            }
            input = document.getElementById('fileinput');
            if (!input) {
                openAlertpopup(1, "cannot_find_the_fileinput_element");

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
                    $("#selectFile").prop('value', file.name);
                    fileValue = file.name;
                    var fileSize = file.size / 1048576;
                    var fileSize = file.size;
                    fileValue = fileValue.replace(/\..+$/, '');
                    var maxLength = 50;   // max length
                    var maxSize = 50 * 1024 * 1024; // max size

                    // checking length of file 
                    if (fileValue.length <= maxLength) {
                        // checking size of file 
                        if (fileSize <= maxSize) {
                            if (fileValue != "") {
                                $("#PackageFile").empty();
                            }
                            fr = new FileReader();
                            fr.onload = receivedText;
                            fr.readAsText(file);
                        } else {
                            $("#selectFile").prop('value', "");
                            openAlertpopup(2, 'file_size_cannot_exceed_50MB');
                            $('#importBtn').prop("disabled", true);
                        }
                    } else {
                        $("#selectFile").prop('value', "");
                        openAlertpopup(2, 'file_name_length_should_be_less_than_or_equal_to_50_char');
                        $('#importBtn').prop("disabled", true);
                    }
                } else {
                    $("#selectFile").prop('value', '');
                    openAlertpopup(1, 'selected_file_format_not_supported');
                    $('#importBtn').prop("disabled", true);
                    // reset upload 
                    var fileopen = $("#fileinput"),
                    clone = fileopen.clone(true);
                    fileopen.replaceWith(clone);
                }
            }

        }

        function receivedText() {
            var arr = new Array();
            arr = fr.result.split(',');
            var filename = $("#fileinput").val();
            for (var i = 0; i < arr.length; i++) {
                fileData += arr[i] + ',';
            }
        }       

        self.cancelConfirm = function () {
            $("#uploadHierarchyConfirmPopup").modal('hide');
            $("#mainPageBody").addClass('modal-open-appendon');
        }
       

        self.importDevice = function (observableModelPopup,refreshData, blobOrFile,timezoneCheckForBlank) {
            $("#loadingDiv").show();
            var xhr = new XMLHttpRequest();

            //xhr.open('POST', AppConstants.get('API_URL') + "/ImportDevice", false);
            var context = this;
            var tokenString = TOKEN();

            var formData = new FormData();
            //  formData.append("myFile", blobOrFile[0].files[0]);

            for (i = 0; i < blobOrFile.files.length; i++) {
                var extension = blobOrFile.files[i].name.substr((blobOrFile.files[i].name.lastIndexOf('.') + 1));
                extension = extension.toLowerCase();
                formData.append("myFile", blobOrFile.files[i]);

            }

            if (extension == 'csv') {
                extension = extension + 'h';
            }
            var skipTimeZoneCheck = false;
            if (timezoneCheckForBlank == "YES") {
                skipTimeZoneCheck = true;
            } 
            formData.append('Authorization', tokenString);
            formData.append("fileExtension", '.' + extension);
            formData.append("SkipTimeZoneCheck", skipTimeZoneCheck);
			var addHierarchyCall = function (data) {
				$("#loadingDiv").hide();
                var jsonData = JSON.parse(xhr.responseText);
                if (jsonData.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    $('#downloadModel').modal('hide');
                    openAlertpopup(0, 'import_file_sucess_hierarchy');
                    refreshData();
                    observableModelPopup('unloadTemplate');
                } else if (jsonData.responseStatus.StatusCode == AppConstants.get('EX_BLANK_TIMEZONE_FOR_HIERARCHIES')) {		//375
                    $("#uploadHierarchyConfirmPopup").modal('show');
                }else if (jsonData.responseStatus.StatusCode == AppConstants.get('IMPORT_FAILED_FOR_FEW_HIERARCHY')) {		//115
                    openAlertpopup(2, 'some_line_not_imported');
                } else if (jsonData.responseStatus.StatusCode == AppConstants.get('IMPORT_HIERARCHY_FAILED')) {				//118
                    openAlertpopup(2, 'file_could_not_be_imported');
				} else if (jsonData.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_FORM_VIEW_FILE')) {	//226
					showMoreMessageLogs('XML', jsonData.responseStatus.StatusMessage);
				} else if (jsonData.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_DEFINITION_FILE')) {	//227
					showMoreMessageLogs('XML', jsonData.responseStatus.StatusMessage);
				} else if (jsonData.responseStatus.StatusCode == AppConstants.get('INVALID_XMLFILE_FORMAT')) {				//228
					showMoreMessageLogs('XML', jsonData.responseStatus.StatusMessage);
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
                } else if (jsonData.responseStatus.StatusCode == AppConstants.get('CANNOT_CREATE_A_FILE_WHEN_ALREADY_EXISTS')) {                  //29
                    openAlertpopup(2, "info_not_enough_disk_spack_in_server");
                }
            };
            xhr.open('POST', AppConstants.get('API_URL') + '/ImportDevice', true);
            xhr.setRequestHeader('Content-length', blobOrFile.size);           
            xhr.onload = addHierarchyCall;
            xhr.send(formData);
        }

        seti18nResourceData(document, resourceStorage);
    };
});
