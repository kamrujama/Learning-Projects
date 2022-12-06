define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {

	//validation
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});
	return function addTagsModel() {

		var self = this;

		//focus on first textbox
		$('#modelAddSponsor').on('shown.bs.modal', function () {
			$('#txtSponsorName').focus();
		})
		//------------------------------FOCUS ON  POP UP-------------------------------------


		$('#modelAddSponsor').keydown(function (e) {
			if ($('#btnCancelSponsor').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#modelAddSponsorClose').focus();
			}
		});

		//----------------------------------------------------------------------------------------

		$('#modelAddSponsorHeader').mouseup(function () {
			$("#modelAddSponsorClose").draggable({ disabled: true });
		});

		$('#modelAddSponsorHeader').mousedown(function () {
			$("#modelAddSponsorClose").draggable({ disabled: false });
		});

		self.checkFileSelection = ko.observable(true);
		self.sponsorNameInput = ko.observable('');
		self.platformInfoInput = ko.observable('');

		self.sponsorNameInput.subscribe(function () {
			if ($("#txtSponsorName").val().trim() != '') {
				$('#btnAddSponsor').removeAttr('disabled');
				$("#sponsorMsg").empty();				
			} else {
				$('#btnAddSponsor').prop('disabled', true);
			}
		});

		self.platformInfoInput.subscribe(function () {
			if ($("#txtPlatformInfo").val().trim() != '') {
				$('#btnAddSponsor').removeAttr('disabled');
				$("#platFormMsg").empty();
			} else {
				$('#btnAddSponsor').prop('disabled', true);
			}
		});

		self.sponsorName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_enter_a_sponsor_name', {
					lng: lang
				})
			}
		});

		self.platformInfo = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_enter_platform', {
					lng: lang
				})
			}
		});

		self.onChangeFileSelect = function () {
			if ($("#chkFileSelect").is(':checked')) {
				self.checkFileSelection(true);
				enableDisableControls(0);
			} else {
				self.checkFileSelection(false);
				enableDisableControls(1);
			}
		}

		self.handleFileSelect = function () {
			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				openAlertpopup(1, 'the_file_apis_are_not_fully_supported_in_this_browser');
				return;
			}
			input = document.getElementById('fileinput');
			if (!input) {
				openAlertpopup(1, 'cannot_find_the_fileinput_element');
			} else if (!input.files) {
				openAlertpopup(1, "this_browser_doesn't_seem_to_support_the_`files`_property_of_file_inputs");
			} else if (!input.files[0]) {     //when the uploaded file was duplicate, user tries to upload a different file but decides to 'Cancel'
				return;
			} else {
				file = input.files[0];
				var fileName = file.name.split('.')[0];
				if (fileName.length > parseInt(AppConstants.get("FILE_NAME_MAX_CHARS"))) {
					openAlertpopup(1, "package_file_name_limit_exceeds");
					return;
				}

				fileSize = input.files[0].size;
				if (validateFileNameFormat(file.name) == false) {
					$("#selectFile").prop('value', '');
					openAlertpopup(1, 'invalid_file_name');
					var fileopen = $("#fileinput"),
						clone = fileopen.clone(true);
					fileopen.replaceWith(clone);
					$('#btnAddSponsor').prop('disabled', true);
				} else if (validateFileName(file.name, 8)) {
					$("#selectFile").prop('value', file.name);
					fileValue = file.name;
					if (fileValue != "") {
						$("#sponsorFile").empty();
					}
					$('#btnAddSponsor').removeAttr('disabled');
				} else {
					$("#selectFile").prop('value', '');
					openAlertpopup(1, 'selected_file_format_not_supported');
					var fileopen = $("#fileinput"),
						clone = fileopen.clone(true);
					fileopen.replaceWith(clone);
					$('#btnAddSponsor').prop('disabled', true);
				}
			}
		}

		function enableDisableControls(type) {
			if (type == 0) {			//enable file selection
				$("#btnFileSelect").removeClass('btn-default');
				$("#btnFileSelect").addClass('btn-primary');
				$("#fileinput").removeClass('hide');
				$("#fileSelectedInput").addClass('hide');
				$("#txtSponsorName").prop('disabled', true);
				$("#txtPlatformInfo").prop('disabled', true);
			} else {					//disable file selection
				$("#btnFileSelect").removeClass('btn-primary');
				$("#btnFileSelect").addClass('btn-default');
				$("#fileinput").addClass('hide');
				$("#fileSelectedInput").removeClass('hide');
				$("#txtSponsorName").prop('disabled', false);
				$("#txtPlatformInfo").prop('disabled', false);
			}
		}

		function checkerror(chekVal) {
			var retval = '';
			$("#sponsorMsg").empty();
			$("#platFormMsg").empty();

			if (!$("#chkFileSelect").is(':checked')) {
				var sponsorName = $("input#txtSponsorName");
				sponsorName.val(sponsorName.val().replace(/^\s+/, ""));

				if ($("#txtSponsorName").val().trim() == "") {
					retval += 'Sponsor Name';
					self.sponsorName(null);
					$("#sponsorMsg").text(i18n.t('please_enter_a_sponsor_name'));
					$("#sponsorMsg").show();
				} else {
					retval += '';
				}

				if ($("#txtPlatformInfo").val().trim() == "") {
					retval += 'PlatForm';
					self.platformInfo(null);
					$("#platFormMsg").text(i18n.t('please_enter_platform'));
					$("#platFormMsg").show();
				} else {
					retval += '';
				}
			}

			return retval;
		};

		self.addSponsor = function (observableModelPopup, gId) {
			if ($("#chkFileSelect").is(':checked')) {
				if (!input && !input.files && !input.files[0]) {
					return;
				}
			} else {
				var retval = checkerror();
				if (retval != null && retval != "") {
					return;
				}
			}
			$("#loadingDiv").show();
			var xhr = new XMLHttpRequest();
			var file = null;
			var extension = '';
			var sponsorName = '';
			var platformInfo = '';
			var tokenString = TOKEN();
			
			if ($("#chkFileSelect").is(':checked')) {
				if (input && input.files && input.files[0]) {
					file = input.files[0];
					extension = file.name.substr((file.name.lastIndexOf('.') + 1));
					extension = extension.toLowerCase();
				}
			}

			file = ($("#chkFileSelect").is(':checked')) ? file = input.files[0] : null;
			extension = ($("#chkFileSelect").is(':checked')) ? extension : '';
			sponsorName = ($("#chkFileSelect").is(':checked')) ? '' : $("#txtSponsorName").val();
			platformInfo = ($("#chkFileSelect").is(':checked')) ? '' : $("#txtPlatformInfo").val();

			var formData = new FormData();
			formData.append("myFile", file);
			formData.append("FileExtension", extension);
			formData.append("SponsorName", sponsorName);
			formData.append("PlatForm", platformInfo);
			formData.append('Authorization', tokenString);

			var callbackFunction = function () {
				$("#loadingDiv").hide();
				var result = JSON.parse(xhr.responseText);
				if (result.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					$("#modelAddSponsorDiv").modal('hide');
					observableModelPopup('unloadTemplate');
					gridFilterClear(gId);
					openAlertpopup(0, 'sponsor_add_success');
				} else if (result.responseStatus.StatusCode == AppConstants.get('E_SPONSOR_ALREADY_EXISTS')) {		//393
					openAlertpopup(1, 'sponsor_add_duplicate');
				} else if (data.responseStatus.StatusCode == AppConstants.get('UNAUTHORIZED_ACCESS')) {				//11
					openAlertpopup(1, 'User_does_not_have_sufficient_privileges');
				}
			}

			xhr.open('POST', AppConstants.get('API_URL') + '/AddSponsor', true);
			xhr.setRequestHeader('Content-length', fileinput.size);
			xhr.onload = callbackFunction;
			xhr.send(formData);
		}

		enableDisableControls(0);
		seti18nResourceData(document, resourceStorage);
	};


});