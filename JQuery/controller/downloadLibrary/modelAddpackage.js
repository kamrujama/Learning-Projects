var globalFileInput = '';
var file;
define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient", "utility"], function (ko, koUtil) {
	var lang = getSysLang();
	uploadedfiledata = new Array();
	var isInvalidFileOfDownload = false;
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});
	validateFileDetails = '';
	var currentDateLong = moment().format(LONG_DATETIME_FORMAT);
	var validatePackageData = new Object();
	var selectedModelFamily = "";
	var tagsMasterData = new Array();
	var selectedFolderId = 0;
	var selectedFolderName = '';

	return function AddpackageViewModel() {
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

		var self = this;


		//Draggable function
		$('#modelAddPackageHeader').mouseup(function () {
			$("#modelAddPackage").draggable({ disabled: true });
		});

		$('#modelAddPackageHeader').mousedown(function () {
			$("#modelAddPackage").draggable({ disabled: false });
		});
		////////////////

		var fileSize;
		var fileValue = "";
		var modelname = 'unloadTemplate';
		var validatePackageIsContinue = false;
		selectedModelFamily = "";
		var isAddDuplicatePackage = false;

		self.observableModelPopupParentAddPackage = ko.observable();
		self.templateFlag = ko.observable(false);
		self.templateFlagAdd = ko.observable(false);
		self.templateFlagChild = ko.observable(false);
		self.showMoreInfo = ko.observable(false);
		self.isAppView = ko.observable(false);
		self.isEnableAddBtn = ko.observable(false);
		self.checkedModelAll = ko.observable(false);
		self.checkValidationForDA = ko.observable(true);
		self.enableDelay = ko.observable(false);

		self.models = ko.observableArray();
		self.ModelNameArr = ko.observableArray();
		self.folders = ko.observableArray(globalFoldersArray);
		self.packageTypes = ko.observableArray(packageTypes);
		self.PostInstall = ko.observable();
		self.modelOption = ko.observable();
		self.observableModelChildEditPackage = ko.observable();
		self.folderName = ko.observable('');
		self.isAllFoldersSelected = ko.observable(false);
		self.TagName = ko.observable('');
		self.tags = ko.observableArray();
		self.tagsOption = ko.observable();
		self.tagsNameArray = ko.observableArray();
		self.masterPackages = ko.observableArray();
		tagsMasterData = new Array();
		loadelement(modelname, 'genericPopup');

		selectedFolderId = 0;
		selectedFolderName = '';
		if (!_.isEmpty(globalVariableForEditPackage) && globalVariableForEditPackage.length > 0) {
			self.folderName = globalVariableForEditPackage[0].FolderName;
			selectedFolderName = globalVariableForEditPackage[0].FolderName;
			selectedFolderId = globalVariableForEditPackage[0].FolderId;
			if (selectedFolderId === 0) {
				self.isAllFoldersSelected(true);
				$("#txtFolderDiv").addClass('hide');
            }
		}

		self.unloadTempPopup = function (popupName) {
			self.observableModelPopupParentAddPackage('unloadTemplate');
			$('#addPackageDownloadParentViewModel').modal('hide');

			checkIsPopUpOPen();
		}

		self.unloadTempPopupParent = function (popupName) {
			self.observableModelChildEditPackage('unloadTemplate');
			$('#editPackageDownloadParentView').modal('hide');
			checkIsPopUpOPen();
		}

		//focus on second textbox
		$('#downloadModel').on('shown.bs.modal', function () {
			$('#packageName').focus();
		})

		self.showmoreDetails = function () {
			if (self.showMoreInfo() == true) {
				self.showMoreInfo(false);
				$("#validatePackageMarkMessage").text(i18n.t('more_details'));
			} else {
				self.showMoreInfo(true);
				$("#validatePackageMarkMessage").text(i18n.t('less_details'));
			}
		}

		self.hideInfoPopup = function () {
			$("#validatePackageInformationPopup").modal('hide');
		}

		//------------------------------FOCUS ON CONFIRMATION POPUP-------------------------------------

		$('#downloadModel').keydown(function (e) {
			if ($('#btn_uploadLibCancel').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#addpackageCloseBtn').focus();
			}
		});

		$('#fileinputBtn').keydown(function (e) {
			if ($('#fileinputBtn').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#packageName').focus();
			}
		});

		$('#addpackageCloseBtn').keydown(function (e) {
			if ($('#addpackageCloseBtn').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#fileinputBtn').focus();
			}
		});

		//------------------------------FOCUS ON CONFIRMATION POPUP-------------------------------------

		$('#commonPackageId').on('shown.bs.modal', function (e) {
			$('#btnStandardFileNo').focus();

		});
		$('#commonPackageId').keydown(function (e) {
			if ($('#btnStandardFileNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#commonPackageId_Confo_Yes').focus();
			}
		});

		$('#duplicateMasterPackagesDiv').on('shown.bs.modal', function (e) {
			$('#btnMasterPackageStandardFileNo').focus();

		});
		$('#duplicateMasterPackagesDiv').keydown(function (e) {
			if ($('#btnMasterPackageStandardFileNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#masterPackageId_Confo_Yes').focus();
			}
		});

		$('#resetFieldsDiv').on('shown.bs.modal', function (e) {
			$('#btnResetNo').focus();

		});
		$('#resetFieldsDiv').keydown(function (e) {
			if ($('#btnResetNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#btnResetYes').focus();
			}
		});

		$('#modalForceAddPackage').on('shown.bs.modal', function (e) {
			$('#btnNoAddPackage').focus();

		});
		$('#modalForceAddPackage').keydown(function (e) {
			if ($('#btnNoAddPackage').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#btnYesAddPackage').focus();
			}
		});
		//------------------------------------------------------------------------------------------------------------------------

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

		self.PackageFile = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_select_package_file', {
					lng: lang
				})
			}
		});

		self.PackageName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_enter_package_name', {
					lng: lang
				})
			}						
		});

		self.ModelName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_select_model', {
					lng: lang
				})
			}
		});

		self.FolderName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_select_folder', {
					lng: lang
				})
			}
		});

		self.FileVersion = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_enter_file_version', {
					lng: lang
				})
			}
		});

		self.ConfigValue = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_select_package_type', {
					lng: lang
				})
			}
		});

		self.tagsOption.subscribe(function (newValue) {
			if (newValue == 0) {
				$('#tagsCombo option').prop('selected', true);
				$('#tagsCombo').trigger('chosen:updated');
			}
		});

		modelReposition();
		self.openPopup = function (popupName, gId) {
			self.templateFlagChild(true);
			if (popupName == "modelViewChildDownloadLibrary") {
				loadelementchild(popupName, 'genericPopup');
				$('#editPackageDownloadParentView').modal('show');
			}
		}

		// focus on next tab index 
		lastIndex = 13;
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

		var setTabindexLimit = function (x, formID, y) {
			console.log(x);
			startIndex = 2;
			lastIndex = x;
			prevLastIndex = y;
			prevIndex = 12;
			tabLimitInID = formID;
		}
		setTabindexLimit(13, "addPackage", 3);
		//tabeindex end

		//open upload file input dialog box on enter key
		$("#divBtnFileInput").on('keypress', function (e) {
			var keyCode = e.which || e.keyCode;
			if (keyCode == 13) {
				event.preventDefault();
				$('#fileinput').click();
			}
		});

		//end

		$("#checkForAll").prop('disabled', true);
		$("#modelTypeId").prop('disabled', true);

		function checkerror(chekVal) {
			var retval = '';

			//applying filter
			var versionName = $("input#packageName");
			var contentName = $("input#fileVersion");
			versionName.val(versionName.val().replace(/^\s+/, ""));
			contentName.val(contentName.val().replace(/^\s+/, ""));

			if (fileValue == "") {
				retval += 'SELECT FILE';
				$("#PackageFile").append(i18n.t('please_select_package_file'));
			} else {
				retval += '';
				$("#PackageFile").empty();
			}

			if ($("#modelTypeId").chosen().val() == null || $("#modelTypeId").chosen().val() == "" || $("#modelTypeId").chosen().val().length == 0) {
				retval += 'Select Model(s)';
				self.ModelName(null);
			} else {
				retval += '';
			}

			if (!validatePackageData.IsMasterPackage) {
				if ($("#packageName").val() == "") {
					retval += 'login name';
					self.PackageName(null);
				} else {
					retval += '';
				}

				if ($("#selectPackageType").find('option:selected').text() == "") {
					retval += 'FILE VERSION';
					self.ConfigValue(null);
				} else {
					retval += '';
				}
			}

			if (self.isAllFoldersSelected() === true) {
				if ($("#selectFolder").chosen().val() == null || $("#selectFolder").chosen().val() == "" || $("#selectFolder").chosen().val().length == 0) {
					retval += 'Select Folder';
					self.FolderName(null);
				} else {
					retval += '';
				}
			}

			if ($("#fileVersion").val() == "") {
				retval += 'FILE VERSION';
				self.FileVersion(null);
			} else {
				retval += '';
			}
			return retval;
		};

		self.modelOption.subscribe(function (newValue) {
			if (newValue == 0) {
				$('#modelTypeId option').prop('selected', true);
				$('#modelTypeId').trigger('chosen:updated');
			}
		});

		self.addDuplicatePackage = function () {
			isAddDuplicatePackage = true;
			self.PackageName(validatePackageData.PackageName);
			self.TagName(null);
			self.tags([]);

			$("#modalForceAddPackage").modal('hide');
			$("#packageName").prop('disabled', true);
			$("#fileVersion").prop('disabled', true);
			$("#selectPackageType").prop('disabled', true);
			$("#selectPackageType").addClass('disabled').trigger('chosen:updated');			
			$('#tagsCombo').val('Select Tags').prop("selected", "selected");
			$('#tagsCombo').trigger('chosen:updated');
			$("#tagsCombo").prop('disabled', true);
			$("#tagsCombo").addClass('disabled');
			$("#radioID").find("input").prop("disabled", true);
			$("#radioDelay").find("input").prop("disabled", true);
			enableDisableDelay(0);
		}

		self.cancelForceAddPackage = function () {
			isAddDuplicatePackage = false;
			$("#modalForceAddPackage").modal('hide');
			$('#btn_uploadLibrary').prop('disabled', true);
			$('#chkValidation').prop('disabled', false);
			self.checkValidationForDA(true);
			//clear uploaded file
			var getValue = $("#selectFile").val();
			getValue = "";
			$("#selectFile").prop('value', getValue);
			$fileInput = $("#fileinput");
			$fileInput.removeClass('hide')
			$("#fileSelectedInput").addClass('hide');
			$fileInput.replaceWith($fileInput = $fileInput.clone(true));
		}

		$('#btnNoAddPackage').on('click', function () {
			self.cancelForceAddPackage();
		});

		self.addPackage = function (observableModelPopup) {			
			if (!isAddDuplicatePackage) {
				var retval = checkerror();
				if (retval != null && retval != "")
					return;
			}

			$("#loadingDiv").show();				
			$("#modalForceAddPackage").modal('hide');
			AddPackage(uploadedfiledata[1], self.ModelNameArr, observableModelPopup, fileSize, self.tagsNameArray, isAddDuplicatePackage);
		}

		// Add package using in Enter Key
		$("#addPackage").on('keypress', 'input, textarea, select', function (e) {
			var keyCode = e.which || e.keyCode;
			if (keyCode == 13) {
				e.preventDefault();
				var retval = checkerror();
				if (retval == null || retval == "") {
					$("#loadingDiv").show();
					AddPackage(uploadedfiledata[1], self.ModelNameArr, null, fileSize, self.tagsNameArray, false);
				} else {
					return false;
				}
			}
		});

		$('#packageName').keyup(function () {
			var yourInput = $(this).val();
			re = /[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
			// store current positions in variables
			var start = this.selectionStart,
				end = this.selectionEnd;

			var isSplChar = re.test(yourInput);
			if (isSplChar) {
				var no_spl_char = yourInput.replace(/[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '');
				$(this).val(no_spl_char);

				// restore from variables...
				this.setSelectionRange(start - 1, end - 1);
			}
		});

		$('#fileVersion').keyup(function () {
			var yourInput = $(this).val();
			re = /[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
			// store current positions in variables
			var start = this.selectionStart,
				end = this.selectionEnd;

			var isSplChar = re.test(yourInput);
			if (isSplChar) {
				var no_spl_char = yourInput.replace(/[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '');
				$(this).val(no_spl_char);

				// restore from variables...
				this.setSelectionRange(start - 1, end - 1);
			}
		});

		$("#fileinput").on('change keyup paste', function () {
			if ($("#fileinput").val() != "" && isInvalidFileOfDownload == false) {
				if (isAddButtonEnabled == false) {
					//$('#btn_uploadLibrary').removeAttr('disabled');
				}
			}
		});

		$("#packageName").on('change keyup paste', function () {
			if ($("#packageName").val() != "" && isInvalidFileOfDownload == false) {
				if (isAddButtonEnabled == false) {
					//$('#btn_uploadLibrary').removeAttr('disabled');
				}
			}
		});

		$("#modelTypeId").on('change keyup paste', function () {
			if ($("#modelTypeId").val() != "" && isInvalidFileOfDownload == false) {
				if (isAddButtonEnabled == false) {
					//$('#btn_uploadLibrary').removeAttr('disabled');
				}
			}
		});

		$("#fileVersion").on('change keyup paste', function () {
			if ($("#fileVersion").val() != "" && isInvalidFileOfDownload == false) {
				if (isAddButtonEnabled == false) {
					//$('#btn_uploadLibrary').removeAttr('disabled');
				}
			}
		});

		$("#inlineRadio1").on('change', function () {
			if ($("#inlineRadio1").val() != "") {
				enableDisableDelay(0);
			}
		});
		$("#inlineRadio2").on('change', function () {
			if ($("#inlineRadio2").val() != "") {
				enableDisableDelay(0);
			}
		});
		$("#inlineRadio3").on('change', function () {
			if ($("#inlineRadio3").val() != "") {
				enableDisableDelay(0);
			}
		});
		$("#inlineRadio4").on('change', function () {
			if ($("#inlineRadio4").val() != "") {
				enableDisableDelay(1);
			}
		});

        $('#modelTypeId_chosen .chosen-choices').on('click', function () {
			$('#modelTypeId_chosen .search-field input[type=text]').focus();
        });

        $('#tagsCombo_chosen .chosen-choices').on('click', function () {
            $('#tagsCombo_chosen .search-field input[type=text]').focus();
        });
        

		//show package details
		self.packageDetails = function () {
			$("#footerAddPackage").removeClass('disabled');
			self.templateFlagAdd(false);
		}

		// reset filter
		self.clearfilter = function (gridID) {
			gridFilterClear(gridID);
		}

		self.onChangeValidateDA = function () {
			if ($("#chkValidation").is(':checked')) {
				self.checkValidationForDA(true);
			} else {
				self.checkValidationForDA(false);
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
			}
			else if (!input.files) {
				openAlertpopup(1, "this_browser_doesn't_seem_to_support_the_`files`_property_of_file_inputs");
			}
			else if (!input.files[0]) {     //when the uploaded file was duplicate, user tries to upload a different file but decides to 'Cancel'
				return;
			}
			else if (input.files[0].size > parseInt(AppConstants.get('MAXIMUMFILESIZE'))) {
				openAlertpopup(1, "package_exceeds_maximum_size_to_upload");
			}
			else {
				file = input.files[0];
				var extension = file.name.split('.').pop().toLowerCase();
				var fileName = file.name.split('.' + extension)[0];
				if (fileName.length > parseInt(maximumPackageNameLength)) {
					openAlertpopup(1, i18n.t('package_file_name_limit_exceeds', { maximumPackageNameLength : maximumPackageNameLength }, { lng: lang }));
					return;
				}

				fileSize = input.files[0].size;
				if (validateFileNameFormat(file.name) == false) {
					$("#selectFile").prop('value', '');
					openAlertpopup(1, 'invalid_file_name');
					var fileopen = $("#fileinput"),
						clone = fileopen.clone(true);
					fileopen.replaceWith(clone);
					$("#fileinput").removeClass('hide')
					$("#fileSelectedInput").addClass('hide');
				} else if (validateFileName(file.name, 2)) {
					$("#selectFile").prop('value', file.name);
					fileValue = file.name;
					if (fileValue != "") {
						$("#PackageFile").empty();
					}
					receivedTextSlice(file);
					$("#fileinput").addClass('hide')
					$("#fileSelectedInput").removeClass('hide');
				} else {
					$("#selectFile").prop('value', '');
					openAlertpopup(1, 'selected_file_format_not_supported');
					var fileopen = $("#fileinput"),
						clone = fileopen.clone(true);
					fileopen.replaceWith(clone);
					$("#fileinput").removeClass('hide')
					$("#fileSelectedInput").addClass('hide');
				}
			}
		}

		self.onChangeModel = function () {
			selectedModelFamily = '';
			if ($("#modelTypeId").chosen().val() == null || $("#modelTypeId").chosen().val() == "" || $("#modelTypeId").chosen().val().length == 0) {

				$('#checkForAll').prop("checked", false);
				self.ModelName(null);
				if (validatePackageData.Component == AppConstants.get('Android') && validatePackageData.SupportedModelFamily.toUpperCase() != AppConstants.get('CARBON_MOBILE_FAMILY')) {
					$("#radioID").find("input").prop("disabled", true);
					$("#inlineRadio1").prop("checked", true);
				} else {
					$("#radioID").find("input").prop("disabled", false);
				}
			} else {
				var forselction = [];
				self.ModelNameArr([]);
				var disableflag = false;
				$('#modelTypeId :selected').each(function (i, selected) {
					forselction[i] = $(selected).text();
					var source = _.where(koUtil.getModelsFamily(), { ModelName: $(selected).text() });
					if (validatePackageData.Component == AppConstants.get('Android')) {
						if (source && source != '' && source.length > 0) {
							if (selectedModelFamily == '') {
								selectedModelFamily = source[0].Family;
							}
							if (source[0].Family.toUpperCase() == AppConstants.get('CARBON_FAMILY')) {
								disableflag = true;
								if (selectedModelFamily != source[0].Family) {
									selectedModelFamily = AppConstants.get('CARBON_AND_CARBON_MOBILE_FAMILY');
								}
							} else if (source[0].Family.toUpperCase() == AppConstants.get('CARBON_MOBILE_FAMILY')) {
								if (selectedModelFamily != source[0].Family) {
									selectedModelFamily = AppConstants.get('CARBON_AND_CARBON_MOBILE_FAMILY');
								}
							}
						}
					} else if (source && source != '') {
						if (source[0].Family.toUpperCase() == AppConstants.get('PWM_FAMILY') || source[0].Family.toUpperCase() == AppConstants.get('VX_FAMILY')) {
							disableflag = true;
						}
					}
				});
				if (disableflag == true) {
					$("#radioID").find("input").prop("disabled", true);
					$("#inlineRadio1").prop("checked", true);
				} else {
					$("#radioID").find("input").prop("disabled", false);
				}
				self.ModelNameArr.push(forselction);
				self.ModelName($("#modelTypeId").find('option:selected').text());
				self.isEnableAddBtn(true);
				var baseArray = self.ModelNameArr();
				var selectedArray = self.models();
				var dataselected = baseArray[0];

				if (dataselected.length == selectedArray.length) {
					self.checkedModelAll(true);
				} else {
					self.checkedModelAll(false);

				}
			}

			if (validatePackageData.IsMasterPackage) {
				$("#radioID").find("input").prop("disabled", true);
				$("#radioDelay").find("input").prop("disabled", true);
			}
			if ($('input[name="inlineRadioOptions"]:checked').val() == "Delay") {
				enableDisableDelay(1);
			} else {
				enableDisableDelay(0);
			}
		}

		self.onChangeTags = function () {
			var selectedTags = [];
			self.tagsNameArray([]);
			if ($("#tagsCombo").chosen().val() == null || $("#tagsCombo").chosen().val() == "" || $("#tagsCombo").chosen().val().length == 0) {
				self.TagName(null);
			} else {
				selectedTags = [];
				var sourceTag = new Array();
				$('#tagsCombo :selected').each(function (i, selected) {
					selectedTags[i] = $(selected).text();
				});

				for (var j = 0; j < selectedTags.length; j++) {
					sourceTag = _.where(self.tags(), { TagName: selectedTags[j] });

					if (!_.isEmpty(sourceTag)) {
						var tagsObject = new Object();
						tagsObject.TagId = sourceTag[0].TagId;
						tagsObject.TagName = sourceTag[0].TagName;
						self.tagsNameArray.push(tagsObject);
					}
				}
			}
		}

		self.onChangeFolder = function () {
			if ($("#selectFolder").find('option:selected').text() == "") {
				self.FolderName(null);
			} else {
				self.FolderName($("#selectFolder").find('option:selected').text());
			}
		}

		self.onChangePackageType = function () {
			if ($("#selectPackageType").find('option:selected').text() == "") {
				self.ConfigValue(null);
			} else {
				self.ConfigValue($("#selectPackageType").find('option:selected').text());
				self.isEnableAddBtn(true);
			}
		}

		self.increaseDelay = function () {
			if (self.enableDelay() == true) {
				var delay = $("#txtDelay").val();

				if (parseInt(delay) < parseInt(AppConstants.get("POST_INSTALL_DELAY_MAX"))) {
					$("#txtDelay").val(parseInt(delay) + 1);
				}
			}
		}

		self.decreaseDelay = function () {
			if (self.enableDelay() == true) {
				var delay = $("#txtDelay").val();

				if (parseInt(delay) > parseInt(AppConstants.get("POST_INSTALL_DELAY_MIN"))) {
					$("#txtDelay").val(parseInt(delay) - 1);
				}
			}
		}

		$("#txtDelay").on('keyup', function () {
			$("#txtDelay").val();
			if ($("#txtDelay").val() >= parseInt(AppConstants.get("POST_INSTALL_DELAY_MIN")) && $("#txtDelay").val() <= parseInt(AppConstants.get("POST_INSTALL_DELAY_MAX"))) {
				return true;
			} else if ($("#txtDelay").val() < parseInt(AppConstants.get("POST_INSTALL_DELAY_MIN"))) {
				$("#txtDelay").val(parseInt(AppConstants.get("POST_INSTALL_DELAY_MIN")));
			} else if ($("#txtDelay").val() > parseInt(AppConstants.get("POST_INSTALL_DELAY_MAX"))) {
				$("#txtDelay").val(parseInt(AppConstants.get("POST_INSTALL_DELAY_MAX")));
			}
		})

		$("#fileSelectedInput").click(function () {
			if ($("#selectFile").val() != '') {
				$("#resetFieldsDiv").modal('show');
			}
		});

		//------cancel commom package confirmation modal-------
		self.CancelConfirmation = function () {
			$("#commonPackageId").modal('hide');
			self.checkValidationForDA(true);
			//clear uploaded file
			var getValue = $("#selectFile").val();
			getValue = "";
			$("#selectFile").prop('value', getValue);
			$fileInput = $("#fileinput");
			$fileInput.removeClass('hide')
			$("#fileSelectedInput").addClass('hide');
			$fileInput.replaceWith($fileInput = $fileInput.clone(true));
		}

		//------cancel Master package confirmation modal-------
		self.cancelMasterPackage = function () {
			$("#duplicateMasterPackagesDiv").modal('hide');
			self.checkValidationForDA(true);
			//clear uploaded file
			var getValue = $("#selectFile").val();
			getValue = "";
			$("#selectFile").prop('value', getValue);
			$fileInput = $("#fileinput");
			$fileInput.removeClass('hide')
			$("#fileSelectedInput").addClass('hide');
			$fileInput.replaceWith($fileInput = $fileInput.clone(true));
		}

		//-----------add commom package-----------
		self.addCommonPackage = function () {
			self.checkValidationForDA(false);
			validatePackageIsContinue = true;
			$("#commonPackageId").modal('hide');
			if (validateFileDetails != '') {
				ValidatePackage(validatePackageIsContinue, responsemessage, false);
			} else {
				UploadPackage(validatePackageIsContinue);
			}
		}

		//-----------add Master package-----------
		self.addMasterPackage = function () {
			validatePackageIsContinue = false;
			$("#duplicateMasterPackagesDiv").modal('hide');
			if (validateFileDetails != '') {
				ValidatePackage(validatePackageIsContinue, responsemessage, true);
			} else {
				UploadPackage(validatePackageIsContinue);
			}
		}

		self.clearFields = function () {
			$("#selectFile").prop('value', '');
			var input = $("#fileinput");
			input.replaceWith(input.val('').clone(true));
			self.PackageName(null);
			self.ModelName(null);
			self.FolderName(null);
			self.FileVersion(null);
			self.ConfigValue(null);
			self.TagName(null);
			self.checkValidationForDA(true);
			validatePackageIsContinue = false;
			self.PostInstall('None');
			$("#inlineRadioOptions").val('None');
			$("#inlineRadio1").prop('checked', true);
			$("#txtDelay").val(0);
			$('#chkValidation').prop('disabled', false);
			$("#btn_uploadLibrary").prop("disabled", true);

			$("#checkForAll").prop('checked', false);
			$("#checkForAll").prop('disabled', true);
			$('#modelTypeId').val('-Select-').prop("selected", "selected");
			$('#modelTypeId').trigger('chosen:updated');
			$("#modelTypeId").prop('disabled', true);
			$("#modelTypeId").addClass('disabled');

			$('#selectFolder').val(self.FolderName()).prop("selected", "selected");
			$('#selectFolder').trigger('chosen:updated');

			$('#selectPackageType').val('Select Package Type').prop("selected", "selected");
			$('#selectPackageType').trigger('chosen:updated');

			$('#tagsCombo').val('Select Tags').prop("selected", "selected");
			$('#tagsCombo').trigger('chosen:updated');

			$("#fileinput").removeClass('hide');
			$("#fileSelectedInput").addClass('hide');

			$("#resetFieldsDiv").modal('hide');
			$("#applicationTab").hide();
		}

		self.cancelReset = function () {
			$("#resetFieldsDiv").modal('hide');
		}

		function receivedText() {
			uploadedfiledata = new Array();
			if (fr.result) {
				uploadedfiledata = fr.result.split(',');
				var filename = $("#fileinput").val();
				UploadPackage(validatePackageIsContinue);
			} else {
				openAlertpopup(1, 'cannot_find_the_fileinput_element');
			}

		}
		function receivedTextSlice(file) {
			var filedata = file.slice(0, file.size);
			UploadPackage(validatePackageIsContinue);
		}

		self.applicationGridDetails = function (gID) {
			$("#footerAddPackage").addClass('disabled');
			koUtil.editPackageGid = 'jqxgridViewAddPackDownloadLib';
			koUtil.BundleState = 1;
			self.isAppView(true);

			var packageID = koUtil.editPackgeId;
			var packagemode = koUtil.editPackgeMode;
			var editPackageGid = koUtil.editPackageGid;
			if (packagemode == 'Package' || packagemode == '1') {
				$("#showHideRestBtnParentModel").show();
				var getApplicationsForPackageReq = aplicationGridModel(packageID, editPackageGid);
				getAvailablePackages1(getApplicationsForPackageReq, editPackageGid, false, self.openPopup);
			} else {
				$("#showHideRestBtnParentModel").hide();
				GetBundlesForPackage1(packageID, editPackageGid, false, self.openPopup);
			}

		}

		// Export to excel
		self.exportToExcelAddPack = function (gID) {
            exportjqxcsvData(gID,'Applications'); 
			openAlertpopup(1, 'export_Information');
		}
		//clear filter of application
		self.clearfilterAddApplication = function (gridId) {
			clearUiGridFilter(gridId);
			$('#' + gridId).jqxGrid('clearselection');
		}

		self.exportToExcelApplicationParent = function (gridId) {
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

		self.clearfilterApplicationParent = function (gridId) {
			clearUiGridFilter(gridId);
			$('#' + gridId).jqxGrid('clearselection');
		}

		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopupParentAddPackage(elementname);
		}


		function loadelementchild(elementname, controllerId) {

			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}

			self.observableModelChildEditPackage(elementname);
		}

		//for allselect
		$('.select').click(function (e) {

		});
		$('.deselect').click(function (e) {

		})
		$('#checkForAll').change(function (e) {

			if ($('#checkForAll').is(':checked')) {
				$('#modelTypeId option').prop('selected', true);
				$('#modelTypeId').trigger('chosen:updated');
				e.preventDefault();
			} else {
				$('#modelTypeId option').prop('selected', false);
				$('#modelTypeId').trigger('chosen:updated');
				e.preventDefault();
			}
			//$('#modelTypeId option').prop('selected', true);
			//$('#modelTypeId').trigger('chosen:updated');
			//e.preventDefault();
		});

		$(".chosen-results").css("max-height", "122px");
		$(".chosen-choices").css("max-height", "300px");
		$(".chosen-choices").css("overflow", "auto");

		function updateModelList(Models, isSelectAll) {
			var supportedModels = [];
			if (!_.isEmpty(Models) && Models.length > 0) {
				for (var i = 0; i < Models.length; i++) {
					for (var j = 0; j < koUtil.rootmodels.length; j++) {
						if (koUtil.rootmodels[j].ModelId == Models[i].ModelId) {
							supportedModels.push(Models[i]);
							break;
						}
					}
				}
			}
			self.models(supportedModels);

			if (supportedModels.length == 1 || isSelectAll) {
				var modelsArray = $('select#modelTypeId option');
				if (modelsArray && modelsArray.length > 0) {
					for (var i = 0; i < modelsArray.length; i++) {
						$('select#modelTypeId option[value=' + modelsArray[i].value + ']').prop('selected', 'selected');
					}
					$("#modelTypeId").trigger('chosen:updated');
					$('#checkForAll').prop("checked", true);
					self.onChangeModel();
				}
			} else {
				$('#modelTypeId').val('-Select-').prop("selected", "selected");
				$('#modelTypeId').trigger('chosen:updated');
				$("#checkForAll").prop('disabled', false);
				$("#checkForAll").removeAttr('disabled').trigger('chosen:updated');
				$("#modelTypeId").prop('disabled', false);
				$("#modelTypeId").removeClass('disabled');
				$("#modelTypeId").removeAttr('disabled').trigger('chosen:updated');
			}
		}

		function fillValidateResponseData(validatePackageData, result, fileDetails, files, status) {
			validatePackageData.PackageMode = result.validatePackageResp.PackageMode;
			validatePackageData.TempFilePath = fileDetails.FileLocation;
			validatePackageData.TempPackageHashId = result.validatePackageResp.TempPackageHashId;
			validatePackageData.TruncatedSoftwareFileName = fileDetails.TruncatedFileName;
			validatePackageData.ModelSupports = result.validatePackageResp.ModelSupports;
			validatePackageData.PackageFileType = result.validatePackageResp.PackageFileType;
			validatePackageData.ProtocolForSupportedModelFamily = result.validatePackageResp.ProtocolForSupportedModelFamily;
			validatePackageData.SupportedModelFamily = result.validatePackageResp.SupportedModelFamily;
			validatePackageData.Component = result.validatePackageResp.Component;
			validatePackageData.UninstallPackageId = result.validatePackageResp.UninstallPackageId;
			validatePackageData.IsModelEditAllowed = result.validatePackageResp.IsModelEditAllowed;
			validatePackageData.IsSingleMFT = result.validatePackageResp.IsSingleMFT;
			validatePackageData.SponsorName = result.validatePackageResp.SponsorName;
			validatePackageData.files = files;
			validatePackageData.IsEnabledForAutomation = result.validatePackageResp.IsEnabledForAutomation;
			validatePackageData.TempPackageId = result.validatePackageResp.TempPackageId;
			validatePackageData.ExistingPackageId = result.validatePackageResp.ExistingPackageId;
			validatePackageData.Type = result.validatePackageResp.Type;
			validatePackageData.SourceVersion = result.validatePackageResp.SourceVersion;
			validatePackageData.TargetVersion = result.validatePackageResp.TargetVersion;
			validatePackageData.IsMasterPackage = result.validatePackageResp.IsMasterPackage;
			validatePackageData.SubPackages = result.validatePackageResp.SubPackages;
			validatePackageData.PlatformName = result.validatePackageResp.PlatformName;
			validatePackageData.PackageName = (!_.isEmpty(result.validatePackageResp.CustomMessages) && result.validatePackageResp.CustomMessages.length > 0) ? result.validatePackageResp.CustomMessages[0] : '';

			if (result.validatePackageResp.VhqInfo) {
				if (result.validatePackageResp.VhqInfo.Models != '') {
					updateModelList(validatePackageData.ModelSupports, true);
				} else {
					updateModelList(validatePackageData.ModelSupports, false);
				}
				if (result.validatePackageResp.VhqInfo.Type && result.validatePackageResp.VhqInfo.Type != '') {
					$('#selectPackageType').val(result.validatePackageResp.VhqInfo.Type).prop("selected", "selected");
					$("#selectPackageType").prop('disabled', true);
					$("#selectPackageType").addClass('disabled').trigger('chosen:updated');
				}
				if (result.validatePackageResp.VhqInfo.Name && result.validatePackageResp.VhqInfo.Name != '') {
					self.PackageName(result.validatePackageResp.VhqInfo.Name);
				}
				if (result.validatePackageResp.VhqInfo.Version && result.validatePackageResp.VhqInfo.Version != '') {
					self.FileVersion(result.validatePackageResp.VhqInfo.Version);
				}
				if (result.validatePackageResp.VhqInfo.Tags && result.validatePackageResp.VhqInfo.Tags.length > 0) {
					self.tags(result.validatePackageResp.VhqInfo.Tags);
				}
			} else {
				if (!_.isEmpty(validatePackageData.ModelSupports)) {
					updateModelList(validatePackageData.ModelSupports, false);
				}
			}

			//Master zip
			if (validatePackageData.IsMasterPackage) {
				if (!_.isEmpty(validatePackageData.SubPackages)) {
					updateModelList(validatePackageData.SubPackages[0].ModelSupports, false);
				}
				$("#packageName").prop('disabled', true);
				$("#radioID").find("input").prop("disabled", true);
				$("#radioDelay").find("input").prop("disabled", true);

				$('#selectPackageType').val('-Select-').prop("selected", "selected");
				$("#selectPackageType").prop('disabled', true);
				$("#selectPackageType").addClass('disabled');

				$("#checkForAll").prop('checked', false);
				$("#checkForAll").prop('disabled', true);
				//$('#modelTypeId').val('-Select-').prop("selected", "selected");
				//$('#modelTypeId').trigger('chosen:updated');
				//$("#modelTypeId").prop('disabled', true);
				//$("#modelTypeId").addClass('disabled');

				$('#tagsCombo').val('-Select-').prop("selected", "selected");
				$("#tagsCombo").prop('disabled', true);
				$("#tagsCombo").addClass('disabled');

				self.packageTypes([]);
				self.tags([]);
			} else {
				$("#packageName").prop('disabled', false);
				$("#selectPackageType").prop('disabled', false);
				$("#selectPackageType").removeClass('disabled');
				$("#tagsCombo").prop('disabled', false);
				$("#tagsCombo").removeClass('disabled');

				self.packageTypes(packageTypes);
				self.tags(tagsMasterData);
			}

			$('#btn_uploadLibrary').prop('disabled', false);
			$('#chkValidation').prop('disabled', true);
			if (status == false) {
				self.checkValidationForDA(false);
			}
			//Post install action is disbled for carbon family not for carbonmobile
			if (validatePackageData.Component == AppConstants.get('Android') && validatePackageData.SupportedModelFamily.toUpperCase() != AppConstants.get('CARBON_MOBILE_FAMILY')) {
				$("#radioID").find("input").prop("disabled", true);
				$("#inlineRadio1").prop("checked", true);
			}
			selectedModelFamily = "";
		}

		function UploadPackage(validatePackageIsContinue) {
			$("#loader1").show();
			// grab your file object from a file input
			var files = $("#fileinput").get(0).files;

			var uploadRequestObj = new Object();
			uploadRequestObj.PackageType = "Software";
			uploadRequestObj.fileName = files[0].name;
			uploadRequestObj.file = files[0];

			var callBackuploadfunction = function (data, error) {
				$("#loader1").hide();
				if (data) {
					var responseData = data.split('|');
					var status = responseData.length > 0 ? responseData[0] : '';
					if (status == 'Token_Invalid_Or_Expired') {
						Token_Expired();
					} else if (status == 'Internal_Error') {
						openAlertpopup(2, 'internal_error_api');
					} else if (status == "Status_OK") {
						var responseDatalog = data.split('Status_OK|');
						responsemessage = responseDatalog.length > 1 ? responseDatalog[1] : '';
						if (responsemessage != '') {
							responsemessage = $.parseJSON(decodeURIComponent(responsemessage));
							ValidatePackage(validatePackageIsContinue, responsemessage, false);
						}
					} else if (status == "InvalidFileName") {
						openAlertpopup(2, result.responseStatus.StatusMessage);
						isInvalidFileOfDownload = true;
					} else if (status == "E_FILE_FORMAT_NOT_SUPPORTED") {
						openAlertpopup(1, 'selected_file_format_not_supported');
					} else if (status == "UNAUTHORIZED_ACCESS") {
						openAlertpopup(1, 'User_does_not_have_sufficient_privileges');
					} else if (status == 'E_INSUFFICIENT_STORAGE') {
						openAlertpopup(2, 'File_Cannot_Upload_Insufficient_space_on_Server');
					}
				}
			}
			var method = 'UploadFile';
			ajaxFileUploadStream(method, uploadRequestObj, callBackuploadfunction, true, 'POST', true);
		}

		function ValidatePackage(validatePackageIsContinue, fileDetails, validateMasterPackageIsContinue) {
			validateFileDetails = fileDetails;
			$("#loader1").show();
			var xhr = new XMLHttpRequest();

			var context = this;
			var tokenString = TOKEN();

			var formData = new FormData();
			var validatePackageReq = new Object();
			validatePackageReq.FileName = $("#selectFile").val();
			validatePackageReq.PackageType = "Software";
			validatePackageReq.IsContinue = validatePackageIsContinue;
			validatePackageReq.IsValidateforDownloadAutomationRequired = self.checkValidationForDA();
			validatePackageReq.FileLocation = fileDetails.FileLocation;
			validatePackageReq.FilePath = fileDetails.FilePath;
			validatePackageReq.TruncatedFileName = fileDetails.TruncatedFileName;
			validatePackageReq.IsValidateContinue = validateMasterPackageIsContinue;
			validatePackageReq.FolderId = self.isAllFoldersSelected() === true ? $('#selectFolder').val() : selectedFolderId;
			var files = $("#fileinput").get(0).files;

			//formData.append("opmlFile", files[0]);
			formData.append("ValidatePackageReq", JSON.stringify(validatePackageReq));
			formData.append('Authorization', tokenString);

			var ValidatePackageCallback = function () {
				$("#loader1").hide();
				$("#loadingDiv").hide();
				isInvalidFileOfDownload = false;
				var result;
				try {
					result = JSON.parse(xhr.responseText);
					validatePackageData = new Object();
					$("#radioID").find("input").prop("disabled", false);
					$("#radioDelay").find("input").prop("disabled", false);
					if ($('input[name="inlineRadioOptions"]:checked').val() == "Delay") {
						enableDisableDelay(1);
					} else {
						enableDisableDelay(0);
					}
					$("#btn_uploadLibrary").prop("disabled", true);

					if (result.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (result.validatePackageResp) {
							fillValidateResponseData(validatePackageData, result, fileDetails, files, true);
							var extension = validatePackageData.TempFilePath.split('.').pop().toLowerCase();
							isAddButtonEnabled = false;
							var GetApplicationsReq = new Object();
							GetApplicationsReq.PackageId = tempPackageId = result.validatePackageResp.TempPackageId;
							var PackageMode = result.validatePackageResp.PackageMode;
							if (PackageMode && PackageMode != "None") {
								GetApplicationsReq.State = ENUM.get('PACKAGE_MODE_TEMP');
								setScreenControls(AppConstants.get('ADD_PACKAGE'));
							}
							validateFileDetails = '';
						}
						koUtil.editPackgeId = validatePackageData.TempPackageId;
						koUtil.editPackgeMode = validatePackageData.PackageMode;
					} else if (result.responseStatus.StatusCode == AppConstants.get('CANNOT_CREATE_A_FILE_WHEN_ALREADY_EXISTS')) {              //29
						openAlertpopup(2, "e_file_format_not_supported");
					} else if (result.responseStatus.StatusCode == AppConstants.get('INVALID_FILE_NAME')) {                                     //30
						openAlertpopup(2, "e_invalid_filename");
						isInvalidFileOfDownload = true;
					} else if (result.responseStatus.StatusCode == AppConstants.get('PACKAGE_UNIQUE_KEY_VIOLATION')) {                          //80
						openAlertpopup(2, 'duplicate_package_found');
					} else if (result.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR')) {                                        //112
						openAlertpopup(2, 'internal_error_api');
					} else if (result.responseStatus.StatusCode == AppConstants.get('PACKAGE_WITH_VERSION_EXISTS')) {                           //168
						openAlertpopup(2, 'packge_With_Version_Exists');
					} else if (result.responseStatus.StatusCode == AppConstants.get('PACKAGE_DOES_NOT_SUPPORT_AUTOMATEDOWNLOAD')) {  			//169
						openAlertpopup(1, 'Package_Doesnot_Support_AutomateDownloads');
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
					} else if (result.responseStatus.StatusCode == AppConstants.get('PACKAGE_IS_INVALID')) {                                    //170
						openAlertpopup(2, 'Package_Is_Invalid');
					} else if (result.responseStatus.StatusCode == AppConstants.get('COMMON_APPLICATION_EXISTS_STATUS')) {                      //191                        
						if (result.validatePackageResp.CustomMessages && result.validatePackageResp.CustomMessages.length > 0) {
							var msg = i18n.t('e_package_does_not_support_auto_downloads', { CommonFileNamesList: result.validatePackageResp.CustomMessages[0], CommonApplicationsList: result.validatePackageResp.CustomMessages[1] }, { lng: lang });
							$("#commonPackageId").modal('show');
							$("#showCommonMessageId").text(msg);
						}
					} else if (result.responseStatus.StatusCode == AppConstants.get('CLONE_PACKAGE_EXISTS')) {                                  //195
						if (result.validatePackageResp.CustomMessages && result.validatePackageResp.CustomMessages.length > 0) {
							openAlertpopup(2, i18n.t('e_clone_package_exists_already', { PackageName: result.validatePackageResp.CustomMessages[0] }, { lng: lang }));
						}
						$("#fileinput").removeClass('hide')         //show original file input
						$("#fileSelectedInput").addClass('hide');   //hide clear fields file input
					} else if (result.responseStatus.StatusCode == AppConstants.get('INVALID_PACKAGES_SELECTED')) {                             //287
						openAlertpopup(2, "e_invalid_packages_selected");
					} else if (result.responseStatus.StatusCode == AppConstants.get('SOURCE_PACKAGE_NOT_EXISTS')) {                             //288
						openAlertpopup(2, "e_source_package_not_exists");
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_INVALID_APPLICATION_TYPE_IN_CP_PACKAGE')) {              //328
						openAlertpopup(2, "e_invalid_application_type_in_cp_package");
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_APK_FILE_NOT_FOUND')) {                                  //329
						openAlertpopup(2, "e_apk_file_not_found");
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_PACKAGE_NAME_NOT_FOUND_IN_APK')) {                       //331
						openAlertpopup(2, "e_package_name_not_found_in_apk");
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_INVALID_MANIFEST_FILE')) {                               //332
						if (result.validatePackageResp.CustomMessages && result.validatePackageResp.CustomMessages.length > 0) {
							openAlertpopup(1, i18n.t('e_invalid_manifest_file', { ManifestFileName: result.validatePackageResp.CustomMessages[0], ApplicationName: result.validatePackageResp.CustomMessages[1] }, { lng: lang }));
						} else {
							openAlertpopup(1, 'Package_Doesnot_Support_AutomateDownloads');
						}
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						$('#btn_uploadLibrary').prop('disabled', false);
						$('#chkValidation').prop('disabled', true);
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_INSUFFICIENT_STORAGE')) {                                //336
						openAlertpopup(2, "e_insufficient_storage");
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_INVALID_EXTENSION_FILES_FOUND')) {                       //337
						openAlertpopup(2, "e_invalid_extension_files_found");
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_MANIFEST_FILE_NOT_FOUND')) {                             //338
						if (result.validatePackageResp.CustomMessages && result.validatePackageResp.CustomMessages.length > 0) {
							openAlertpopup(1, i18n.t('e_manifest_file_not_found', { ApplicationName: result.validatePackageResp.CustomMessages[0] }, { lng: lang }));
						} else {
							openAlertpopup(1, 'Package_Doesnot_Support_AutomateDownloads');
						}
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						$('#btn_uploadLibrary').prop('disabled', false);
						$('#chkValidation').prop('disabled', true);
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_INVALID_CONTROL_FILE')) {                                //339
						if (result.validatePackageResp.CustomMessages && result.validatePackageResp.CustomMessages.length > 0) {
							openAlertpopup(1, i18n.t('e_invalid_control_file', { ControlFileName: result.validatePackageResp.CustomMessages[0], ApplicationName: result.validatePackageResp.CustomMessages[1] }, { lng: lang }));
						} else {
							openAlertpopup(1, 'Package_Doesnot_Support_AutomateDownloads');
						}
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						$('#btn_uploadLibrary').prop('disabled', false);
						$('#chkValidation').prop('disabled', true);
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_CONTROL_FILE_MISSING_IN_PACKAGE')) {                      //340
						if (result.validatePackageResp.CustomMessages && result.validatePackageResp.CustomMessages.length > 0) {
							openAlertpopup(1, i18n.t('e_control_file_missing_in_package', { ApplicationName: result.validatePackageResp.CustomMessages[0] }, { lng: lang }));
						} else {
							openAlertpopup(1, 'Package_Doesnot_Support_AutomateDownloads');
						}
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						$('#btn_uploadLibrary').prop('disabled', false);
						$('#chkValidation').prop('disabled', true);
					} else if (result.responseStatus.StatusCode == AppConstants.get('EX_OTA_PACKAGE_DOES_NOT_SUPPORT_MODEL')) {                 //348
						openAlertpopup(1, "ex_ota_package_does_not_support_model");
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						$('#btn_uploadLibrary').prop('disabled', false);
						$('#chkValidation').prop('disabled', true);
					} else if (result.responseStatus.StatusCode == AppConstants.get('EX_OTA_PACKAGE_DOES_NOT_SUPPORT_DIFFERENTIAL_DOWNLOADS')) {//349
						openAlertpopup(1, "ex_ota_package_does_not_support_differential_downloads");
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						$('#btn_uploadLibrary').prop('disabled', false);
						$('#chkValidation').prop('disabled', true);
					} else if (result.responseStatus.StatusCode == AppConstants.get('EX_OTA_PACKAGE_DOES_NOT_SUPPORT_THIS_VERSION')) {          //350
						openAlertpopup(1, "ex_ota_package_does_not_support_this_version");
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						$('#btn_uploadLibrary').prop('disabled', false);
						$('#chkValidation').prop('disabled', true);
					} else if (result.responseStatus.StatusCode == AppConstants.get('EX_OTA_PACKAGE_MISSING_BUILD_INFO')) {                     //351
						openAlertpopup(1, "ex_ota_package_missing_build_info");
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						$('#btn_uploadLibrary').prop('disabled', false);
						$('#chkValidation').prop('disabled', true);
					} else if (result.responseStatus.StatusCode == AppConstants.get('EX_OTA_PACKAGE_INVALID_STRUCTURE')) {                     //352
						openAlertpopup(1, "ex_ota_package_invalid_structure");
					} else if (result.responseStatus.StatusCode == AppConstants.get('EX_INVALID_SPONSOR_NAME')) {
						if (result.validatePackageResp.CustomMessages && result.validatePackageResp.CustomMessages.length > 0) {
							openAlertpopup(2, i18n.t('ex_invalid_sponsor_name', { sponsorname: result.validatePackageResp.CustomMessages[0] }, { lng: lang }));
						} else {
							openAlertpopup(2, 'ex_invalid_sponsor_name_default');
						}
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_APP_ID_NOT_FOUND')) {                                   //355
						openAlertpopup(2, "e_app_id_not_found");
					} else if (result.responseStatus.StatusCode == AppConstants.get('EX_VOS2_PACKAGE_SAME_NAME_WITH_DIFF_VERSION')) {          //357
						if (result.validatePackageResp.CustomMessages && result.validatePackageResp.CustomMessages.length > 0) {
							openAlertpopup(1, i18n.t('ex_vos2_package_same_name_with_diff_version', { FileList: result.validatePackageResp.CustomMessages[0], ApplicationName: result.validatePackageResp.CustomMessages[1] }, { lng: lang }));
						} else {
							openAlertpopup(1, 'Package_Doesnot_Support_AutomateDownloads');
						}
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						$('#btn_uploadLibrary').prop('disabled', false);
						$('#chkValidation').prop('disabled', true);
					} else if (result.responseStatus.StatusCode == AppConstants.get('EX_VOS2_PACKAGE_CONTAIN_OS_SPECIFIC_PACKAGE')) {        //358
						openAlertpopup(1, 'ex_vos2_package_contain_os_specific_package');
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						$('#btn_uploadLibrary').prop('disabled', false);
						$('#chkValidation').prop('disabled', true);
					} else if (result.responseStatus.StatusCode == AppConstants.get('EX_VOS2_DUPLICATE_PACKAGE_IN_SAME_BUNDLE')) {        //359
						if (result.validatePackageResp.CustomMessages && result.validatePackageResp.CustomMessages.length > 0) {
							openAlertpopup(1, i18n.t('ex_vos2_duplicate_package_in_same_bundle', { FileList: result.validatePackageResp.CustomMessages[0] }, { lng: lang }));
						} else {
							openAlertpopup(1, 'Package_Doesnot_Support_AutomateDownloads');
						}
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						$('#btn_uploadLibrary').prop('disabled', false);
						$('#chkValidation').prop('disabled', true);
					} else if (result.responseStatus.StatusCode == AppConstants.get('EX_INVALID_STATE_MANIFST_FILE')) {        //360
						if (result.validatePackageResp.CustomMessages && result.validatePackageResp.CustomMessages.length > 0) {
							var errmsg = i18n.t('ex_invalid_state_manifst_file');
							self.showMoreInfo(false);
							$("#validatePackageInformationPopup").modal("show");
							$("#validatePackageInfoMessage").text(errmsg);
							$("#validatePackageMarkMessage").text(i18n.t('more_details'));
							$("#validatePackageInfoMoreMessage").text(result.validatePackageResp.CustomMessages);
						} else {
							openAlertpopup(1, 'Package_Doesnot_Support_AutomateDownloads');
						}
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						$('#btn_uploadLibrary').prop('disabled', false);
						$('#chkValidation').prop('disabled', true);
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_NOTAVAILABLE_MASTERPACKAGE')) {                      //380
						openAlertpopup(2, "e_notavailable_masterpackage");
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_MASTERPACKAGE_INVALID')) {							//381
						openAlertpopup(2, "e_masterpackage_invalid");
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_MASTERPACKAGE_INVALID_MODEL')) {					    //382
						openAlertpopup(2, "e_masterpackage_invalid_model");
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_MASTERPACKAGE_CLONE_PACKAGE_EXIST')) {				//383
						self.masterPackages([]);
						if (result.validatePackageResp.existingPackages && result.validatePackageResp.existingPackages.length > 0) {
							self.masterPackages(result.validatePackageResp.existingPackages);
							var msg = i18n.t('e_masterpackage_clone_package_exist', { folderName: selectedFolderName }, { lng: lang });
							$("#duplicateMasterPackagesDiv").modal('show');
							$("#duplicateMasterPackagesMessage").text(msg);
						}
					} else if (result.responseStatus.StatusCode == AppConstants.get('E_MASTERZIP_PACKAGE_INVALID')) {					    //385
						if (result.validatePackageResp.CustomMessages && result.validatePackageResp.CustomMessages.length > 0) {
							openAlertpopup(2, i18n.t('e_masterzip_package_invalid', { MasterPackageError: result.validatePackageResp.CustomMessages[0] }, { lng: lang }));
						}
					} else if (result.responseStatus.StatusCode == AppConstants.get('EX_CLONE_PACKAGE_EXIST_IN_DIFFERENT_FOLDER')) {		//410
						fillValidateResponseData(validatePackageData, result, fileDetails, files, false);
						if (result.validatePackageResp.existingPackages && result.validatePackageResp.existingPackages.length > 0) {
							var folders = result.validatePackageResp.existingPackages[0].folderNames;
							$("#modalForceAddPackage").modal('show');
							var msg = i18n.t('package_with_similar_content_already_exists_force_add', { folders: folders, folderName: selectedFolderName }, { lng: lang });
							$("#forceAddPackageMessage").text(msg);
						}
					} else if (result.responseStatus.StatusCode == AppConstants.get('EX_PACKAGE_EXISTS_WITH_AUTOMATION_DISABLED')) {	//438
						if (result.validatePackageResp.CustomMessages && result.validatePackageResp.CustomMessages.length > 0) {
							openAlertpopup(2, i18n.t('ex_package_exists_with_automation_disabled', { PackageName: result.validatePackageResp.CustomMessages[0], Version: result.validatePackageResp.CustomMessages[1] }, { lng: lang }));
						}
					}

				} catch (e) {
					var selectedfile = $("#selectFile").val();
					updateModelList(koUtil.rootmodels, false);
				}
			}
			xhr.open('POST', AppConstants.get('API_URL') + "/ValidatePackage", true);
			xhr.onload = ValidatePackageCallback;
			xhr.send(formData);

		}

		getTags(self.tags);

		function enableDisableDelay(type) {
			if (type == 0) {
				self.enableDelay(false);
				$("#txtDelay").prop('disabled', true);
			} else {
				self.enableDelay(true);
				$("#txtDelay").prop('disabled', false);
			}
		}

		seti18nResourceData(document, resourceStorage);
	};

	function getTags(tags) {
		var getTagsReq = new Object();
		var Export = new Object();
		var Selector = new Object();
		var Pagination = new Object();

		Pagination.HighLightedItemId = null;
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = 250;

		Export.DynamicColumns = null;
		Export.VisibleColumns = [];
		Export.IsAllSelected = false;
		Export.IsExport = false;

		Selector.SelectedItemIds = null;
		Selector.UnSelectedItemIds = null;

		var ColumnSortFilter = new Object();
		ColumnSortFilter.FilterList = null;
		ColumnSortFilter.SortList = null;
		ColumnSortFilter.GridId = 'Tags';

		getTagsReq.Pagination = Pagination;
		getTagsReq.ColumnSortFilter = ColumnSortFilter;
		getTagsReq.Export = Export;
		getTagsReq.Selector = Selector;

		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.getTagsResp) {
						data.getTagsResp = $.parseJSON(data.getTagsResp);
						tags(data.getTagsResp.Tags);
						tagsMasterData = data.getTagsResp.Tags;
					}
				}
			}
		}

		var method = 'GetTags';
		var params = '{"token":"' + TOKEN() + '","getTagsReq":' + JSON.stringify(getTagsReq) + '}';
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

	function manageApplicationTab(Request, isApplicationAvailable) {
		if (Request == true) {
			isApplicationAvailable(true);
			if (PackageMode == ENUM.get('PACKAGEMODE_PACKAGE')) {
				getApplicationforPackages(GetApplicationsReq);
			} else {
				if (PackageMode == ENUM.get('PACKAGEMODE_BUNDLE') || PackageMode == ENUM.get('PACKAGEMODE_MULTIBUNDLE')) {
					getApplicationforBundles(GetApplicationsReq);
				}
			}
		} else {
			isApplicationAvailable(false);
		}
	}

	function getApplicationforBundles(GetApplicationsReq) {
		GetBundleForPackage(GetApplicationsReq)
	}

	function getApplicationforPackages(GetApplicationsReq) {
		PackageApplication(GetApplicationsReq)
	}

	function availableApplicationGrid(applicationData, gID) {
		var filterObj;
		var selectedArray = new Array();
		var selectedRowID;
		var HighlightedRowID;
		var rowsToColor = [];
		var RowID;
		var localData;

		var source =
		{
			dataType: "observablearray",
			localdata: applicationData,
			dataFields: [
				{ name: 'ApplicationName', map: 'ApplicationName' },
				{ name: 'ApplicationVersion', map: 'ApplicationVersion' },
				{ name: 'IsParameterizationEnabled', map: 'IsParameterizationEnabled' },
			],

		};

		var cellclass = function (row, columnfield, value) {
			if (value == HighlightedRowID) {
				RowID = row;
				return 'red';
			}
		}
		var cellclassSub = function (row, columnfield, value) {
			if (row == RowID) {
				return 'red';
			}
		}
		var rowColorFormatter = function (cellValue, options, rowObject) {
			if (cellValue == HighlightedRowID)
				rowsToColor[rowsToColor.length] = options.rowId;
			return cellValue;
		}
		var buildFilterPanel = function (filterPanel, datafield) {
			genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
		}
		var dataAdapter = new $.jqx.dataAdapter(source);
		$("#" + gID).jqxGrid(
			{
				width: "100%",
				editable: true,
				source: dataAdapter,
				altRows: true,
				pageSize: 5,
				filterable: true,
				sortable: true,
				rowsheight: 32,
				columnsResize: true,
				height: "200px",
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,

				columns: [
					{
						text: i18n.t('app_name', { lng: lang }), filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}, dataField: 'ApplicationName', editable: false, minwidth: 100,
					},
					{
						text: i18n.t('app_version', { lng: lang }), filtertype: "custom", dataField: 'ApplicationVersion', editable: false, minwidth: 100,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},

				]
			});
	}

	function GetBundleForPackage(GetApplicationsReq) {
		packageMode = GetApplicationsReq.State;

		var callBackfunction = function (data, error) {
			acApplications = [];
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.getBundlesForPackageResp) {
						data.getBundlesForPackageResp = $.parseJSON(data.getBundlesForPackageResp);
					}
					acApplications = data.getBundlesForPackageResp.SubPackageDetails;
				}
			}
		}

		var method = 'GetBundlesForPackage';
		var params = '{"token":"' + TOKEN() + '","GetApplicationsForPackageReq":' + JSON.stringify(GetApplicationsReq) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
	}

	function getmodelarr(model) {
		var selectedModelId = $("#modelTypeId").chosen().val();
		var selectedModelName = model[0];
		var modelNew = new Array();
		if (selectedModelId && selectedModelId.length > 0) {
			for (var i = 0; i < selectedModelId.length; i++) {
				var EModel = new Object();
				EModel.ModelId = selectedModelId[i];
				if (selectedModelName == undefined) {

				} else {
					EModel.ModelName = selectedModelName[i];
				}
				modelNew.push(EModel);
			}
		}
		return modelNew;
	}

	function AddPackage(upfiledata, ModelNameArr, observableModelPopup, fileSize, tagsArray, isContinue) {
		var fileinput = $("#fileinput");
		var xhr = new XMLHttpRequest();
		var context = this;
		var tokenString = TOKEN();

		var extension = '';
		if (validatePackageData.files && validatePackageData.files.length > 0) {
			for (i = 0; i < validatePackageData.files.length; i++) {
				extension = validatePackageData.files[i].name.substr((validatePackageData.files[i].name.lastIndexOf('.') + 1));
				extension = extension.toLowerCase();
			}
		}

		var packages = new Object();
		var FileInfo = new Object();
		var Applicatioin = new Array();
		var PostInstallAction = new Object();
		var fileUploadDate = moment.utc().format('YYYY-MM-DDTHH:mm:ss');

		packages.Applications = null;
		packages.CreatedByUserName = null;
		packages.Description = null;
		packages.DeviceFileLocation = null;
		packages.DeviceFileLocationAlias = null;
		packages.DeviceFileName = null;
		packages.DeviceFileNameAlias = null;
		FileInfo.DestinationPath = "/home/user1";
		packages.FileInfo = FileInfo;
		packages.FileName = $("#selectFile").val();
		packages.FileSize = fileSize;
		packages.FileType = $("#selectPackageType").find('option:selected').text();
		packages.FileUploadDate = fileUploadDate;
		packages.FileVersion = $("#fileVersion").val();
		packages.IsEnabledForAutomation = validatePackageData.IsEnabledForAutomation;
		packages.IsFileDldAllowed = true;
		packages.SourceVersion = validatePackageData.SourceVersion;
		packages.TargetVersion = validatePackageData.TargetVersion;
		packages.PlatformName=validatePackageData.PlatformName;
		//carbon family devices are not supported for postinstall action and parameterdownload
		if (selectedModelFamily == AppConstants.get('CARBON_FAMILY') && extension == "apk") {
			packages.IsParameterDldAllowed = false;
			packages.PostInstallAction = 'None';
			packages.InstallDelay = 0;
		} else {
			packages.IsParameterDldAllowed = true;
			packages.PostInstallAction = $('input[name="inlineRadioOptions"]:checked').val();
			packages.InstallDelay = $('input[name="inlineRadioOptions"]:checked').val() == "Delay" ? $("#txtDelay").val() : 0;
		}

		packages.PackageId = validatePackageData.TempPackageId;		
		packages.PackageMode = AppConstants.get(validatePackageData.PackageMode);
		packages.PackageName = $("#packageName").val();
		packages.PackageType = "Software";
		packages.UninstallPackageId = validatePackageData.UninstallPackageId;
		packages.IsModelEditAllowed = validatePackageData.IsModelEditAllowed;
		packages.SponsorName = validatePackageData.SponsorName;
		packages.IsSingleMFT = validatePackageData.IsSingleMFT;
		packages.TargetUser = null;
		packages.TargetUserAlias = null;

		var Package = packages;
		var model = getmodelarr(ModelNameArr());
		var TempPackageHashId = validatePackageData.TempPackageHashId;
		var TempFilePath = validatePackageData.TempFilePath;
		var TruncatedSoftwareFileName = validatePackageData.TruncatedSoftwareFileName;
		var Type = validatePackageData.Type;
		var PackageFileType = validatePackageData.PackageFileType;
		var SupportedModelFamily = validatePackageData.SupportedModelFamily;
		var ProtocolForSupportedModelFamily = validatePackageData.ProtocolForSupportedModelFamily;
		var IsMasterPackage = validatePackageData.IsMasterPackage;
        var subPackages = validatePackageData.SubPackages;
		subPackages = !_.isEmpty(subPackages) ? JSON.stringify(subPackages).replace(/\/Date/g, "\\\/Date").replace(/\)\//g, "\)\\\/") : JSON.stringify(subPackages);
		var existingPackageId = validatePackageData.ExistingPackageId;
		var folderId = selectedFolderId > 0 ? selectedFolderId : $('#selectFolder').val();

		var formData = new FormData();
		formData.append("Package", JSON.stringify(Package));
		formData.append("Models", JSON.stringify(model));
		formData.append("FolderId", folderId);
		formData.append("TruncatedSoftwareFileName", TruncatedSoftwareFileName);
		formData.append("Type", Type);
		formData.append("TempPackageHashId", TempPackageHashId);
		formData.append("TempFilePath", TempFilePath);
		formData.append("myFile", []);
		formData.append("fileExtension", extension);
		formData.append("PackageFileType", PackageFileType);
		formData.append("SupportedModelFamily", SupportedModelFamily);
		formData.append("ProtocolForSupportedModelFamily", ProtocolForSupportedModelFamily);
		formData.append('Authorization', tokenString);
        formData.append("IsMasterPackage", IsMasterPackage);
        formData.append("SubPackages", subPackages);
		formData.append("PackageTags", JSON.stringify(tagsArray()));
		formData.append("IsContinue", isContinue);
		formData.append("ExistingPackageId", existingPackageId);

		var addPackageCallback = function () {
			$("#loadingDiv").hide();
			var result = JSON.parse(xhr.responseText);
			if (result.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				gridFilterClear('jqxgridDownloadlib');
				if (observableModelPopup) {
					observableModelPopup('unloadTemplate');
				}
				$("#loadingDiv").hide();
				$('#downloadModel').modal('hide');
				openAlertpopup(0, 'alert_file_update_success_device');
				$("#draggAddID").draggable();
			} else if (result.responseStatus.StatusCode == AppConstants.get('CANNOT_CREATE_A_FILE_WHEN_ALREADY_EXISTS')) {      //29
				openAlertpopup(2, "e_file_format_not_supported");
			} else if (result.responseStatus.StatusCode == AppConstants.get('INVALID_FILE_NAME')) {                             //30				
				if (!_.isNull(result.responseStatus.AdditionalInfo)) {
					showMoreMessageLogs('package', result.responseStatus.AdditionalInfo);
				} else {
					openAlertpopup(2, "e_invalid_filename");
				}
			} else if (result.responseStatus.StatusCode == AppConstants.get('PACKAGE_UNIQUE_KEY_VIOLATION')) {                  //80
				openAlertpopup(2, 'duplicate_package_found');
			} else if (result.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR')) {                                //112
				openAlertpopup(2, 'internal_error_api');
			} else if (result.responseStatus.StatusCode == AppConstants.get('EX_PACKAGE_CREATION_FAILED')) {                    //138
				if (result.addPackageResp.CustomMessages) {
					var MDMErrorString = result.addPackageResp.CustomMessages.length > 0 ? (": '" + result.addPackageResp.CustomMessages[0] + "'") : "";
					openAlertpopup(2, i18n.t('e_package_creation_failed_message', { MDMErrorMessage: MDMErrorString }, { lng: lang }));
				} else {
					if (!_.isNull(result.responseStatus.AdditionalInfo)) {
						showMoreMessageLogs('package', result.responseStatus.AdditionalInfo);
					} else {
						openAlertpopup(2, "e_package_creation_failed");
					}
				}
				$('#btn_uploadLibrary').prop('disabled', true);
			} else if (result.responseStatus.StatusCode == AppConstants.get('EX_INVALID_FILE')) {                               //158
				openAlertpopup(2, 'invalid_file');
			} else if (result.responseStatus.StatusCode == AppConstants.get('PACKAGE_WITH_VERSION_EXISTS')) {                   //168
				if (!_.isNull(result.responseStatus.AdditionalInfo)) {
					showMoreMessageLogs('package', result.responseStatus.AdditionalInfo);
				} else {
					openAlertpopup(2, 'packge_With_Version_Exists');
				}
			} else if (result.responseStatus.StatusCode == AppConstants.get('PACKAGE_DOES_NOT_SUPPORT_AUTOMATEDOWNLOAD')) {     //169
				openAlertpopup(1, 'Package_Doesnot_Support_AutomateDownloads');
			} else if (result.responseStatus.StatusCode == AppConstants.get('PACKAGE_IS_INVALID')) {                            //170
				if (!_.isNull(result.responseStatus.AdditionalInfo)) {
					showMoreMessageLogs('package', result.responseStatus.AdditionalInfo);
				} else {
					openAlertpopup(2, 'Package_Is_Invalid');
				}
			} else if (result.responseStatus.StatusCode == AppConstants.get('EX_UPLOADED_FILE_INVALID')) {                      //187
				openAlertpopup(2, "e_uploaded_file_invalid");
			} else if (result.responseStatus.StatusCode == AppConstants.get('CLONE_PACKAGE_EXISTS')) {                          //195
				if (!_.isNull(result.responseStatus.AdditionalInfo)) {
					showMoreMessageLogs('package', result.responseStatus.AdditionalInfo);
				} else {
					openAlertpopup(2, 'A_Package_with_similar_contents_already_exists');
				}
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_INVALID_FILES_WHILE_MOVING')) {                  //333
				if (!_.isNull(result.responseStatus.AdditionalInfo)) {
					showMoreMessageLogs('package', result.responseStatus.AdditionalInfo);
				} else {
					openAlertpopup(2, 'e_invalid_files_while_moving');
				}
			}

			//Parameter error code handling
			else if (result.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_FORM_VIEW_FILE')) {				//226
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('INVALID_PARAMETER_DEFINITION_FILE')) {				//227
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('INVALID_XMLFILE_FORMAT')) {						//228
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('PARENT_FORMFILE_NOT_EXISTS')) {					//266
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('CHILDFORMFILE_ALREADY_EXISTS')) {					//267
				openAlertpopup(1, 'ChildFormFile_Already_Exists');
			} else if (result.responseStatus.StatusCode == AppConstants.get('FORMFILE_ALREADY_EXISTS')) {						//269
				openAlertpopup(1, 'FormFile_Already_Exists');
			} else if (result.responseStatus.StatusCode == AppConstants.get('BASE_FORMFILE_ALREADY_EXISTS')) {					//271
				openAlertpopup(1, 'Base_FormFile_Already_Exists');
			} else if (result.responseStatus.StatusCode == AppConstants.get('DEFINITIONFILE_FORMFILE_VERSION_MISMATCH')) {		//272
				openAlertpopup(1, 'DefinitionFile_FormFile_Version_Mismatch');
			} else if (result.responseStatus.StatusCode == AppConstants.get('INVALID_DEFAULT_VALUE_IN_FORMFILE')) {				//281
				openAlertpopup(1, 'Invalid_Default_Value_In_FormFile');
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_MULTIINSTANCE_GRIDOPERATION')) {	//305
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_MULTIINSTANCE_SHOWINGRID')) {		//306
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_MULTIINSTANCE_PRIMARYIDENTIFIER')) {//307
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_SEQUENCE')) {						//310
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_INVALID_XSD_VERSION')) {							//354
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_MASTERPACKAGE_INVALID_VPDX_COUNT_MORE_THAN_ONE')) {			//384
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_MASTERPACKAGE_INVALID_MORE_THAN_ONE_VPFX_ZIP_FILE')) {		//386
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_MASTERPACKAGE_INVALID_MISSING_VPDX_FILE')) {					//387
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_MASTERPACKAGE_INVALID_MISSING_VPFX_FILE')) {					//388
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_MASTERPACKAGE_INVALID_MISSING_VPFX_ZIP_FILE')) {				//389
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_MASTERPACKAGE_INVALID_VPFX_ZIP_FILE_MISSING_VPFX_FILES')) {	//390
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_MASTERPACKAGE_INVALID_MISSING_MANIFEST_FILE_IN_VPFX_ZIP')) {	//391
				showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
            } else if (result.responseStatus.StatusCode == AppConstants.get('EX_MASTERPACKAGE_INVALID_APPLICATION_VPDX_FILE_EXISTS')) {	    //400
                showMoreMessageLogs('masterPackage', result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('EX_CLONE_PACKAGE_EXIST_IN_DIFFERENT_FOLDER')) {				//410
				$("#modalForceAddPackage").modal('show');
			} else if (result.responseStatus.StatusCode == AppConstants.get('EX_INVALID_PACKAGE_TYPE_FOR_OTA')) {				//416
				openAlertpopup(1, 'ex_invalid_package_type_for_ota');
			} else {
				openAlertpopup(2, 'network_error');
            }
            //$("#btn_uploadLibrary").prop('disabled', true);
		}
		xhr.open('POST', AppConstants.get('API_URL') + '/AddPackage', true);
		xhr.setRequestHeader('Content-length', fileinput.size);
		xhr.onload = addPackageCallback;
		xhr.send(formData);
	}

	function getAvailablePackages1(getApplicationsForPackageReq, gId, isFromReferenceSet, openPopup) {
		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data && data.getApplicationsForPackageResp) {
						data.getApplicationsForPackageResp = $.parseJSON(data.getApplicationsForPackageResp);
					}
					else
						data.getApplicationsForPackageResp = [];
					availableApplicationGrid1(gId, data.getApplicationsForPackageResp.Applications, isFromReferenceSet, openPopup);
				}
			}
		}

		var method = 'GetApplicationsForPackage';
		var params = '{"token":"' + TOKEN() + '","getApplicationsForPackageReq":' + JSON.stringify(getApplicationsForPackageReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	function GetBundlesForPackage1(packageID, gId, isFromReferenceSet, openPopup) {
		var getBundlesForPackageReq = new Object();
		getBundlesForPackageReq.PackageId = packageID;
		getBundlesForPackageReq.State = koUtil.BundleState;

		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					AplicationViewGrid1(data, gId, isFromReferenceSet, openPopup);
				}
			}
		}
		var method = 'GetBundlesForPackage';
		var params = '{"token":"' + TOKEN() + '","getBundlesForPackageReq":' + JSON.stringify(getBundlesForPackageReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	function availableApplicationGrid1(gId, Applicationsdata, isFromReferenceSet, openPopup) {
		var source =
		{
			dataType: "json",
			dataFields: [
				{ name: 'ApplicationName', map: 'ApplicationName' },
				{ name: 'ApplicationVersion', map: 'ApplicationVersion' },
				{ name: 'IsParameterizationEnabled', map: 'IsParameterizationEnabled' },
				{ name: 'ApplicationId', map: 'ApplicationId' },
			],
			root: 'Applications',
			contentType: 'application/json',
			localdata: Applicationsdata

		};

		var parameterRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (value == true) {
				var applicationID = $("#" + gId).jqxGrid('getcellvalue', row, 'ApplicationId');
				var applicationName = $("#" + gId).jqxGrid('getcellvalue', row, 'ApplicationName');
				var applicationVersion = $("#" + gId).jqxGrid('getcellvalue', row, 'ApplicationVersion');
				var isParameterizationEnabled = $("#" + gId).jqxGrid('getcellvalue', row, 'IsParameterizationEnabled');
				if (isParameterizationEnabled == true) {
					var html = '<div style="padding-left:5px;padding-top:7px;cursor:pointer"><a title="View Application" style="text-decoration: underline">View</a></div>';
				} else {
					var html = '';
				}
			} else {
				return "";
			}
			return html;
		}
		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gId, true);
		}

		var dataAdapter = new $.jqx.dataAdapter(source);
		$("#" + gId).jqxGrid(
			{
				width: "100%",
				editable: true,
				source: dataAdapter,
				altRows: true,
				pageSize: 5,
				filterable: true,
				sortable: true,
				columnsResize: true,
				height: "200px",
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				rowdetails: false,
				rowdetailstemplate: false,
				columns: [
					{
						text: i18n.t('app_name', { lng: lang }), filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}, dataField: 'ApplicationName', editable: false, width: 'auto'
					},
					{
						text: i18n.t('app_version', { lng: lang }), filtertype: "custom", dataField: 'ApplicationVersion', editable: false, minwidth: 100,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('ParameterDefination', { lng: lang }), filtertype: "custom", datafield: 'IsParameterizationEnabled', editable: false, filterable: false, sortable: false, menu: false, minwidth: 120, cellsrenderer: parameterRenderer,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
				]
			});
		if (isFromReferenceSet == true) {
			$("#" + gId).jqxGrid('hidecolumn', "IsParameterizationEnabled");
		}

		$("#" + gId).on("cellclick", function (event) {
			var column = event.args.column;
			var rowindex = event.args.rowindex;
			var columnindex = event.args.columnindex;
			var rowData = $("#" + gId).jqxGrid('getrowdata', rowindex);
			if (columnindex == 2) {

				//$('#downloadModel').modal('show');
				koUtil.rowIdDownloadChild = rowindex;
				koUtil.gridIdDownloadChild = "#" + gId;

				koUtil.applicationIDAppChild = rowData.ApplicationId;
				koUtil.applicationNameAppChild = rowData.ApplicationName;
				koUtil.applicationVersionAppChild = rowData.ApplicationVersion;
				koUtil.isParentAppOrBundle = 1;
				openPopup('modelViewChildDownloadLibrary')
				//  var isParameterizationEnabled = $("#" + gId).jqxGrid('getcellvalue', row, 'IsParameterizationEnabled');

			}
		});
	}

	//Bundle Call
	function AplicationViewGrid1(data, gId, isFromReferenceSet, openPopup) {
		if (data.getBundlesForPackageResp) {
			data.getBundlesForPackageResp = $.parseJSON(data.getBundlesForPackageResp);
		}
		ParentData = data.getBundlesForPackageResp.SubPackageDetails;
		var childData;
		if (data.getBundlesForPackageResp.SubPackageDetails) {
			childData = data.getBundlesForPackageResp.SubPackageDetails[0].applicationDetails;
		}

		var source =
		{
			datafields: [
				{ name: 'BundleName' },
				{ name: 'BundleVersion' },
				{ name: 'PackageId' }
			],
			root: "SubPackageDetails",
			datatype: "json",
			localdata: ParentData
		};
		var ParentAdapter = new $.jqx.dataAdapter(source);
		var childsource =
		{
			datafields: [
				{ name: 'ApplicationId', type: 'string', map: 'ApplicationId' },
				{ name: 'ApplicationName', type: 'string', map: 'ApplicationName' },
				{ name: 'ApplicationVersion', type: 'string', map: 'ApplicationVersion' },
				{ name: 'IsParameterizationEnabled', type: 'string', map: 'IsParameterizationEnabled' }
			],
			root: "ApplicationDetails",
			datatype: "json",
			localdata: childData
		};
		var childDataAdapter = new $.jqx.dataAdapter(childsource, { autoBind: true });
		appDetails = childDataAdapter.records;
		var nestedGrids = new Array();
		// create nested grid.
		var initrowdetails = function (index, parentElement, gridElement, record) {
			var id = record.uid.toString();
			var grid = $($(parentElement).children()[0]);

			nestedGrids[index] = grid;
			var appDetailsbyid = data.getBundlesForPackageResp.SubPackageDetails[id].applicationDetails;
			//for (var m = 0; m < appDetails.length; m++) {
			//    appDetailsbyid.push(appDetails[m]);
			//}
			var childsource = {
				datafields: [
					{ name: 'ApplicationId', type: 'string' },
					{ name: 'ApplicationName', type: 'string' },
					{ name: 'ApplicationVersion', type: 'string' },
					{ name: 'IsParameterizationEnabled', type: 'string' }
				],

				datatype: "json",
				localdata: appDetailsbyid
			}
			var nestedGridAdapter = new $.jqx.dataAdapter(childsource);
			var childAplicationrender = function (row, columnfield, value, defaulthtml, columnproperties) {
				var applicationID = $(grid).jqxGrid('getcellvalue', row, 'ApplicationId');
				var applicationName = $(grid).jqxGrid('getcellvalue', row, 'ApplicationName');
				var applicationVersion = $(grid).jqxGrid('getcellvalue', row, 'ApplicationVersion');
				var isParameterizationEnabled = $(grid).jqxGrid('getcellvalue', row, 'IsParameterizationEnabled');
				if (isParameterizationEnabled == true) {
					var html = '<div style="text-align:center;" ><a style="height:100px;cursor:pointer;text-align:center;text-decoration: underline;"   title="View Application"   role="button" >View</a></div>';
				} else {
					var html = '';
				}
				return html;
			}
			//Custom filter
			var buildFilterPanelNestedGrid = function (filterPanel, datafield) {
				wildfilterForApplicationView(filterPanel, datafield, nestedGridAdapter, grid);

			}


			if (grid != null) {

				grid.jqxGrid({
					source: nestedGridAdapter, width: 450, height: 100, sortable: true, filterable: true, autoshowcolumnsmenubutton: false, showsortmenuitems: false,
					columns: [
						{
							text: i18n.t('app_name', { lng: lang }), datafield: 'ApplicationName', minwidth: 100, editable: false,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanelNestedGrid(filterPanel, datafield);
							}
						},
						{
							text: i18n.t('app_version', { lng: lang }), datafield: 'ApplicationVersion', minwidth: 100, editable: false,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanelNestedGrid(filterPanel, datafield);
							}
						},
						{ text: i18n.t('parameter_definition', { lng: lang }), datafield: 'IsParameterizationEnabled', minwidth: 100, menu: false, editable: false, filterable: false, sortable: false, cellsrenderer: childAplicationrender }
					]
				});
				if (isFromReferenceSet == true) {
					$(grid).jqxGrid('hidecolumn', "IsParameterizationEnabled");
				}

				appViewNestedGrid = grid;
				$(grid).on("cellclick", function (event) {
					koUtil.isParentAppOrBundle = 1;
					var column = event.args.column;
					var rowindex = event.args.rowindex;
					var columnindex = event.args.columnindex;
					var rowData = $(grid).jqxGrid('getrowdata', rowindex);
					if (columnindex == 2) {

						//$('#downloadModel').modal('show');


						koUtil.applicationIDAppChild = rowData.ApplicationId;
						koUtil.applicationNameAppChild = rowData.ApplicationName;
						koUtil.applicationVersionAppChild = rowData.ApplicationVersion;

						openPopup('modelViewChildDownloadLibrary');

					} else {
					}
				});

				$("#" + gId).on("cellclick", function (event) {
					// koUtil.isParentAppOrBundle = 0;
					var column = event.args.column;
					var rowindex = event.args.rowindex;
					var columnindex = event.args.columnindex;
					var rowData = $(grid).jqxGrid('getrowdata', rowindex);
					if (columnindex == 2) {
						var modelname = 'unloadTemplate';
						loadelement(modelname, 'genericPopup');
						openPopup('modelViewChildDownloadLibrary')
						//$('#downloadModel').modal('show');
						koUtil.rowIdDownloadChild = rowindex;
						koUtil.gridIdDownloadChild = "#" + gId;

						koUtil.applicationIDAppChild = rowData.ApplicationId;
						koUtil.applicationNameAppChild = rowData.ApplicationName;
						koUtil.applicationVersionAppChild = rowData.ApplicationVersion;

					} else {
					}
				});
			}
		}

		var bundelRenderer = function (row, column, value) {
			return '<div style="float:left"><span style="margin-left: 4px; margin-top: 9px; float: left;">' + value + '</span></div><div class="btn-mg" style="float:right"><a class="btn" onclick="clearAppViewGrid()"  role="button"  title="Reset"><i class="icon-reset-filter"></i></a></div>';

		}

		var renderer = function (row, column, value) {
			return '<div style="float:left"><span style="margin-left: 4px; margin-top: 9px; float: left;">' + value + '</span></div>';

		}

		//Custom filter
		var buildFilterPanel = function (filterPanel, datafield) {
			genericBuildFilterPanel(filterPanel, datafield, source, gId);
		}
		$(" #gridmenu" + gId + " ul li:first").css("display", "none")
		$(" #gridmenugridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
		$(" #gridmenugridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
		$(" #gridmenugridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
		$(" #gridmenugridmenu" + gId + "").css("background-color", "transparent");


		// creage jqxgrid
		$("#" + gId).jqxGrid(
			{
				width: "100%",
				autoheight: true,
				source: source,
				rowdetails: true,
                selectionmode: 'none',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				sortable: true,
				initrowdetails: initrowdetails,
				rowdetailstemplate: { rowdetails: "<div id='grid' ></div>", rowdetailsheight: 150, rowdetailshidden: true },
				ready: function () {
					$("#" + gId).jqxGrid('showrowdetails', 0);
				},
				columns: [
					{
						text: i18n.t('bundle_name', { lng: lang }), datafield: 'BundleName', width: 250, sortable: false, editable: false, filterable: false, menu: false, cellsrenderer: bundelRenderer
					},
					{
						text: i18n.t('bundle_version', { lng: lang }), datafield: 'BundleVersion', minwidth: 100, sortable: false, editable: false, filterable: false, menu: false, cellsrenderer: renderer,
					},
				]
			});
	}
});

