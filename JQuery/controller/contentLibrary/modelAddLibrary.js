define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "utility"], function (ko, koUtil) {
	var lang = getSysLang();
	var isInvalidFile = false;
	uploadedfiledata = new Array();
	fileData = new Array();

	var Type = '';
	var TempFilePath;
	var TempPackageHashId = '';
	var TruncatedSoftwareFileName = '';
	var SupportedModelFamily = '';
	var isCarbonMobileModelSelected = false;

	//validation
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	return function UploadLibraryModel() {
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

		//Draggable function
		$('#mdlAddLibHeader').mouseup(function () {
			$("#mdlAddLib").draggable({ disabled: true });
		});

		$('#mdlAddLibHeader').mousedown(function () {
			$("#mdlAddLib").draggable({ disabled: false });
		});
		/////////

		//focus on first textbox
		$('#addLibraryModal').on('shown.bs.modal', function () {
			$('#fileContentName').focus();
		});
		$('#fileContentName').focus();

		//------------------------------FOCUS ON  POP UP-------------------------------------

		$('#addLibraryModal').keydown(function (e) {

			if ($('#btnCancelContent').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#btnCloseContent').focus();
			}
			if ($('#fileContentName').is(":focus") && (e.which || e.keyCode) == 9) {

				$('#fileinput').focus();
				//$('#fileinputBtn').blur()

				$('#fileinputBtn').css('border-color', '#666');
				//  $('#fileinputBtn').css('background-color', '#fff');
			}

		});

		$('#addLibraryModal').click(function (e) {
			if ($('#fileinput').is(":focus")) {
				//  $('#fileinputBtn').css('border-color', '#666');
				//   $('#fileinputBtn').css('background-color', '#fff');
			} else {
				$('#fileinputBtn').css(' border-color', '');
				$('#fileinputBtn').css('background-color', '');
			}

		});
		
		//----------------------------------------------------------------------------------------

		var contentFileTabs = [
			{
				'id': 'generalBreadCrumb',
				'isActive': true,
				'menuName': 'General'
			},
			{
				'id': 'modelsBreadCrumb',
				'isActive': false,
				'menuName': 'Models'
			},
			{
				'id': 'configurationsBreadCrumb',
				'isActive': false,
				'menuName': 'Device Attributes'
			}
		];

		self.contentTabs = ko.observableArray(['generalContent', 'modelsContent', 'configurationsContent']);
		self.breadCrumbContent = ko.observableArray(contentFileTabs);
		self.presentTab = ko.observable('generalContent');
		self.previousTab = ko.observable('');
		self.nextTab = ko.observable('modelsContent');
		self.models = ko.observableArray();
		self.tags = ko.observableArray();
		self.tagsOption = ko.observable();
		self.tagsNameArray = ko.observableArray();
		isCarbonMobileModelSelected = false;

		var modelsArray = koUtil.rootmodels;
		if (!_.isEmpty(modelsArray)) {
			for (var i = 0; i < modelsArray.length; i++) {
				modelsArray[i].IsSelected = false;
			}
			self.models(modelsArray);
		}

		self.onChangeTab = function (id) {
			if (id && id != '') {
				$('#modelsContent').removeClass('hide');
				$('#configurationsContent').removeClass('hide');
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
				if (id == 'generalContent') {
					self.showGeneralTabControls(id);
				} else if (id == 'modelsContent') {
					self.showModelsTabControls(id);
				} else if (id == 'configurationsContent') {
					self.showConfigurationsTabControls(id);
				}
				// Show the current tab, and add an "active" class to the button that opened the tab
				document.getElementById(id).style.display = "block";
				document.getElementById(id + 'Tab').className += " active";
			}
		}

		self.updatebreadCrumb = function (id) {
			for (var i in self.breadCrumbContent()) {
				if (self.breadCrumbContent()[i].id == id) {
					$('#' + id).addClass('activateBreadcrumb');
					self.breadCrumbContent()[i].isActive = true;
				} else {
					self.breadCrumbContent()[i].isActive = false;
					$('#' + self.breadCrumbContent()[i].id).removeClass('activateBreadcrumb');
				}
			}
		}

		self.showGeneralTabControls = function (id) {
			$('#btnUploadContent').addClass('hide');
			$('#btnNextContent').removeClass('hide');
			$('#btnBackContent').addClass('hide');
			self.presentTab('generalContent');
			self.updatebreadCrumb('generalBreadCrumb');
			self.previousTab('');
			self.nextTab('modelsContent');
		}

		self.showModelsTabControls = function (id) {
			$('#btnUploadContent').addClass('hide');
			$('#btnNextContent').removeClass('hide');
			$('#btnBackContent').removeClass('hide');
			self.presentTab('modelsContent');
			self.updatebreadCrumb('modelsBreadCrumb');
			self.previousTab('generalContent');
			self.nextTab('configurationsContent');
		}

		self.showConfigurationsTabControls = function (id) {
			$('#btnUploadContent').removeClass('hide');
			$('#btnNextContent').addClass('hide');
			$('#btnBackContent').removeClass('hide');
			self.presentTab('operationsContent');
			self.updatebreadCrumb('configurationsBreadCrumb');
			self.previousTab('modelsContent');
			self.nextTab('');			
		}

		self.backToPrevious = function () {
			self.onChangeTab(self.previousTab());
		}

		self.moveToNext = function () {
			if (self.nextTab() == 'modelsContent') {
				if ($("#selectFile").val() == "") {
					$("#PackageFile").append(i18n.t('please_select_package_file'));
					return;
				} else {
					$("#PackageFile").empty();
				}

				if ($('#fileContentName').val() == "") {
					self.PackageName(null);
					$("#please_enter_content_name").show();
					return;
				} else {
					$("#please_enter_content_name").hide();
				}

				if ($('#fileVersionAdd').val() == "") {
					self.FileVersionAdd(null);
					$("#please_enter_content_version").show();
					return;
				} else {
					$("#please_enter_content_version").hide();
				}

				self.onChangeTab(self.nextTab());
			} else if (self.nextTab() == 'configurationsContent') {
				var selectedModels = _.where(self.models(), { IsSelected: true });
				if (_.isEmpty(selectedModels)) {
					openAlertpopup(1, 'please_select_model');
					return;
				}

				self.onChangeTab(self.nextTab());
			}
		}

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
				var array = new Array()
				array = file.name.split(".");
				fileExtension = array[array.length - 1];

				if (validateFileName(file.name, 1)) {
					$("#selectFile").prop('value', file.name);
					fileValue = file.name;
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
							fr.readAsDataURL(file);
						} else {
							$("#selectFile").prop('value', "");
							openAlertpopup(2, 'file_size_cannot_exceed_50MB');
						}
					} else {
						$("#selectFile").prop('value', "");
						openAlertpopup(2, 'file_name_length_should_be_less_than_or_equal_to_50_char');
					}
				} else {
					$("#selectFile").prop('value', '');
					openAlertpopup(1, 'selected_file_format_not_supported');

					// reset upload 
					var fileopen = $("#fileinput"),
						clone = fileopen.clone(true);
					fileopen.replaceWith(clone);
				}
			}

		}

		self.FileVersionAdd = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_enter_content_version', {
					lng: lang
				})
			}
		});

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
				message: i18n.t('please_enter_content_name', {
					lng: lang
				})
			}
		});

		self.TagName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_select_a_tag', {
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

		// focus on next tab index 
		lastIndex = 12;
		prevLastIndex = 3;
		$(document).keydown(function (e) {
			if (e.keyCode == 9) {
				var thisTab = +$(":focus").prop("tabindex") + 1;
				var isDisabled = $("#btnUploadContent").is(':disabled');
				if (e.shiftKey) {
					if (thisTab == prevLastIndex) {
						if (isDisabled == true) {
							$("#" + tabLimitInID).find('[tabindex=' + disableIndex + ']').focus();
							return false;
						} else {
							$("#" + tabLimitInID).find('[tabindex=' + prevIndex + ']').focus();
							return false;
						}
					}
				} else {
					if (thisTab == prevIndex) {
						if (isDisabled == true) {
							$("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
							return false;
						}

					} else if (thisTab == lastIndex) {
						$("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
						return false;
					}
				}
			}
		});

		var setTabindexLimit = function (x, conetntLibrary, y) {
			console.log(x);
			startIndex = 2;
			lastIndex = x;
			prevLastIndex = y;
			prevIndex = 11;
			disableIndex = 10;
			tabLimitInID = conetntLibrary;
		}
		setTabindexLimit(12, "addlibrary", 3);
		// end tabindex

		//open upload file input dialog box on enter key
		$("#divBtnFileInput").on('keypress', function (e) {
			var keyCode = e.which || e.keyCode;

			if (keyCode == 13) {
				$('#fileinput').click();
			}

			if (keyCode == 32) {
				$('#fileinput').click();
			}
			event.preventDefault();
		});

		self.addlibrary = function (observableModelPopup, isGridVisible, refershTileview) {
			var retval = checkerror();
			var fileinput = $("#fileinput");
			if (retval == null || retval == "") {
				$("#loadingDiv").show();
				addContent(observableModelPopup, isGridVisible, refershTileview, fileinput, self.models, self.tagsNameArray);
			} else {
				return false;
			}
		}

		// Add package using in Enter Key
		$("#addlibrary").on('keypress', 'input, textarea, select', function (e) {
			var keyCode = e.which || e.keyCode;
			if (keyCode == 13) {
				var fileinput = $("#fileinput");
				var retval = checkerror();
				if (retval == null || retval == "") {
					$("#loadingDiv").show();
					addContent(observableModelPopup, isGridVisible, refershTileview, fileinput, self.models, self.tagsNameArray);
				} else {
					return false;
				}
			}
		});


		// allow only 255 charcters in description.
		$("#txtDesc").on("keypress keyup paste", function (e) {
			var textMax = 255;
			var textLength = $('#txtDesc').val().length;
			var textRemaining = textMax - textLength;
		});

		// allow only 250 charcters in description.
		$("#tagAdd").on("keypress keyup paste", function (e) {
			var textMax = 250;
			var textLength = $('#tagAdd').val().length;
			var textRemaining = textMax - textLength;
		});

		$('#fileContentName').keyup(function () {
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

		$('#fileVersionAdd').keyup(function () {
			var yourInput = $(this).val();
			re = /[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\-_/]/gi;

			// store current positions in variables
			var start = this.selectionStart,
				end = this.selectionEnd;

			var isSplChar = re.test(yourInput);
			if (isSplChar) {
				var no_spl_char = yourInput.replace(/[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\-_/]/gi, '');
				$(this).val(no_spl_char);

				// restore from variables...
				this.setSelectionRange(start - 1, end - 1);
			}
		});

		$("#fileinput").on('change keyup paste', function () {
			if ($("#fileinput").val() != "" && isInvalidFile == false) {
				$('#btnUploadContent').removeAttr('disabled');
			}
		});

		$("#fileContentName").on('change keyup paste', function () {
			if ($("#fileContentName").val() != "" && isInvalidFile == false) {
				$('#btnUploadContent').removeAttr('disabled');
			}
		});

		$("#txtDesc").on('change keyup paste', function () {
			if ($("#txtDesc").val() != "" && isInvalidFile == false) {
				$('#btnUploadContent').removeAttr('disabled');
			}
		});


		$("#fileVersionAdd").on('change keyup paste', function () {
			if ($("#fileVersionAdd").val() != "" && isInvalidFile == false) {
				$('#btnUploadContent').removeAttr('disabled');
			}
		});

		$("#tagAdd").on('change keyup paste', function () {
			if ($("#tagAdd").val() != "" && isInvalidFile == false) {
				$('#btnUploadContent').removeAttr('disabled');
			}
		});

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

		self.onChangeFileNameEdit = function () {
		
		}

		self.onChangeTargetUserEdit = function () {
			
		}

		self.onChangeDeviceFileLocationEdit = function () {
			
		}

		function receivedText() {
			uploadedfiledata = new Array();
			uploadedfiledata = fr.result.split(',');
			var fileinput = $("#fileinput");

			var extension;
			for (i = 0; i < fileinput[0].files.length; i++) {
				extension = fileinput[0].files[i].name.substr((fileinput[0].files[i].name.lastIndexOf('.') + 1));
				extension = extension.toLowerCase();
			}

			fileData = uploadedfiledata[1];
		}

		$("#validateDeviceLocation").hide();
		$("#validateTargetUser").hide();
		$("#validateFileName").hide();

		function checkerror(chekVal) {
			var retval = '';
			$("#validateTargetUser").empty();
			$("#validateFileName").empty();
			$("#validateDeviceLocation").empty();
			$("#PackageFile").empty();


			var versionName = $("input#fileVersionAdd");
			var contentName = $("input#fileContentName");
			versionName.val(versionName.val().replace(/^\s+/, ""));
			contentName.val(contentName.val().replace(/^\s+/, ""));

			if ($("#selectFile").val() == "") {
				retval += 'SELECT FILE';
				$("#PackageFile").append(i18n.t('please_select_package_file'));
			} else {
				retval += '';
				$("#PackageFile").empty();
			}

			if ($('#fileVersionAdd').val() == "") {
				retval += 'version name';
				self.FileVersionAdd(null);
				$("#please_enter_content_version").show();
			}
			else {
				retval += '';
			}

			if ($('#fileContentName').val() == "") {

				retval += 'content name';
				self.PackageName(null);
				$("#please_enter_content_name").show();
			}
			else {
				retval += '';
			}
			
			return retval;
		}

		self.targetUsersArray = ko.observableArray(targetUsers);
		self.fileNamesArray = ko.observableArray(fileNames);
		self.deviceFileLocationsArray = ko.observableArray(deviceFileLocations);

		getTags(self.tags);

		$('#selectGeneralContentData').click();

		seti18nResourceData(document, resourceStorage);
	}

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
					}
				}
			}
		}

		var method = 'GetTags';
		var params = '{"token":"' + TOKEN() + '","getTagsReq":' + JSON.stringify(getTagsReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	function addContent(observableModelPopup, isGridVisible, refershTileview, fileinput, modelsArray, tagsArray) {

		var xhr = new XMLHttpRequest();
		var tokenString = TOKEN();

		var extension = '';
		for (i = 0; i < fileinput[0].files.length; i++) {
			extension = fileinput[0].files[i].name.substr((fileinput[0].files[i].name.lastIndexOf('.') + 1));
			extension = extension.toLowerCase();
		}

		for (i = 0; i < fileinput[0].files.length; i++) {
			extension = fileinput[0].files[i].name.substr((fileinput[0].files[i].name.lastIndexOf('.') + 1));
			extension = extension.toLowerCase();
			//formData.append("myFile", fileinput[0].files[i]);

		}

		var packages = new Object();
		var FileInfo = new Object();
		var fileUploadDate = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
		var Models = new Array();

		packages.Applications = null;
		packages.CreatedByUserName = null;
		packages.Description = $("#txtDesc").val();
		packages.Description = packages.Description.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\\/g, " ").replace(/\"/g, "&quot;").replace(/\'/g, "&apos;").replace(/\//g, " ");

        packages.DeviceFileLocation = $("#selectDeviceFileLocation").find('option:selected').val() == "Select Device file Location" ? null : $("#selectDeviceFileLocation").find('option:selected').val();
        packages.DeviceFileLocationAlias = $("#selectDeviceFileLocation").find('option:selected').text() == "Select Device file Location" ? null : $("#selectDeviceFileLocation").find('option:selected').text();
        packages.DeviceFileName = $("#selectFileNameOnDevice").find('option:selected').val() == "Select Filename on Device" ? null : $("#selectFileNameOnDevice").find('option:selected').val();
        packages.DeviceFileNameAlias = $("#selectFileNameOnDevice").find('option:selected').text() == "Select Filename on Device" ? null : $("#selectFileNameOnDevice").find('option:selected').text();
		FileInfo.DestinationPath = "/home/user1";
		packages.FileInfo = FileInfo;
		packages.FileName = $("#selectFile").val();
		packages.FileName = packages.FileName.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt");
		packages.FileSize = 0 + "";
		packages.FileType = "Content";
		packages.FileUploadDate = fileUploadDate;
		packages.FileVersion = $("#fileVersionAdd").val().replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt");
		packages.IsEnabledForAutomation = false;
		packages.IsFileDldAllowed = false;
		packages.IsParameterDldAllowed = false;
		packages.PackageId = 0;
		packages.PackageMode = 0;
		packages.PackageName = $("#fileContentName").val().replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt");
		packages.PackageType = "Content";
		packages.PostInstallAction = 0;
        packages.TargetUser = $("#selectTargetUser").find('option:selected').val() == "Select Target User" ? null : $("#selectTargetUser").find('option:selected').val();
        packages.TargetUserAlias = $("#selectTargetUser").find('option:selected').text() == "Select Target User" ? null : $("#selectTargetUser").find('option:selected').text();
		var Package = packages;

		var tempFilePathForContent;
		if (TempFilePath == undefined) {
			tempFilePathForContent = '';
		} else {
			tempFilePathForContent = TempFilePath;
		}

		var truncatedSoftwareFileNameForContent;
		if (TruncatedSoftwareFileName == '') {
			truncatedSoftwareFileNameForContent = '';
		} else {
			truncatedSoftwareFileNameForContent = TruncatedSoftwareFileName;
		}

		var typeForContent;
		if (typeForContent == '') {
			Type = "Unsigned";
		} else {
			typeForContent = Type;
		}

		var TempFileName = '';

		var selectedModels = _.where(modelsArray(), { IsSelected: true });
		var modelsDataArray = new Array();
		for (j = 0; j < selectedModels.length; j++) {
			var obj = new Object();
			obj.ModelId = selectedModels[j].ModelId;
			obj.ModelName = selectedModels[j].ModelName;
			obj.Family = selectedModels[j].Family;
			modelsDataArray.push(obj);
		}

		var formData = new FormData();
		formData.append("Package", JSON.stringify(Package));
		formData.append("Models", JSON.stringify(modelsDataArray));
		formData.append("TruncatedSoftwareFileName", truncatedSoftwareFileNameForContent);
		formData.append("TempFileName", TempFileName);
		formData.append("Type", typeForContent);
		formData.append("TempPackageHashId", TempPackageHashId);
		formData.append("TempFilePath", tempFilePathForContent);
		formData.append("myFile", fileinput[0].files[0]);
		formData.append("fileExtension", extension);
		formData.append("SupportedModelFamily", SupportedModelFamily);
		formData.append('Authorization', tokenString);		
		formData.append("IsMasterPackage", false);
		formData.append("SubPackages", []);
		formData.append("PackageTags", JSON.stringify(tagsArray()));

		var addPackageCallBack = function () {
			var result = JSON.parse(xhr.responseText);
			if (result.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				refershTileview();
				if (isGridVisible()) {
					gridFilterClear('jqxgridContentlib');
				}
				isCarbonMobileModelSelected = false;
				observableModelPopup('unloadTemplate');
				$('#addLibraryModal').modal('hide');
				$("#loadingDiv").hide();

				openAlertpopup(0, 'alert_file_update_success');
				$('#draggAddID').draggable();

			} else if (result.responseStatus.StatusCode == AppConstants.get('CANNOT_CREATE_A_FILE_WHEN_ALREADY_EXISTS')) {                  //29
				openAlertpopup(2, result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('INVALID_FILE_NAME')) {                                         //30
				openAlertpopup(2, i18n.t('invalid_file_name_characters', { invalidFileNameCharacters: result.addPackageResp.InvalidFileNameCharacters }, { lng: lang }));
			} else if (result.responseStatus.StatusCode == AppConstants.get('PACKAGE_UNIQUE_KEY_VIOLATION')) {                              //80
				openAlertpopup(2, 'duplicate_package_found');
			} else if (result.responseStatus.StatusCode == AppConstants.get('EX_PACKAGE_CREATION_FAILED')) {                                //138
				openAlertpopup(2, result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('Limit_Exceeded_For_HierarchyFullPath')) {                      //149
				openAlertpopup(1, result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('EX_INVALID_FILE')) {                                           //158
				openAlertpopup(2, 'invalid_file');
			} else if (result.responseStatus.StatusCode == AppConstants.get('PACKAGE_WITH_VERSION_EXISTS')) {                           	//168
				openAlertpopup(2, 'packge_With_Version_Exists');
			}else if (result.responseStatus.StatusCode == AppConstants.get('PACKAGE_DOES_NOT_SUPPORT_AUTOMATEDOWNLOAD')) {                 	//169
				openAlertpopup(1, result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('PACKAGE_IS_INVALID')) {                                        //170
				openAlertpopup(2, 'Package_Is_Invalid');
			} else if (result.responseStatus.StatusCode == AppConstants.get('EX_UPLOADED_FILE_INVALID')) {                                  //187
				openAlertpopup(2, result.responseStatus.StatusMessage);
			} else if (result.responseStatus.StatusCode == AppConstants.get('CLONE_PACKAGE_EXISTS')) {                                      //195
				openAlertpopup(2, 'A_Package_with_similar_contents_already_exists');
			} else if (result.responseStatus.StatusCode == AppConstants.get('E_FILE_FORMAT_NOT_SUPPORTED')) {                               //234
				openAlertpopup(1, 'selected_file_format_not_supported');
			} else if (result.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR')) {
				openAlertpopup(2, 'internal_error_api');
			} else {
				openAlertpopup(2, 'network_error');
			}
			$("#loadingDiv").hide();
		}

		xhr.open('POST', AppConstants.get('API_URL') + '/AddPackage', true);
		xhr.setRequestHeader('Content-length', fileinput.size);
		xhr.onload = addPackageCallBack;
		xhr.send(formData);
	}
});