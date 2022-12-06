var supportedModelsArray = new Array();

define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
	var lang = getSysLang();
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});
	var isCarbonMobileModelSelected = false;

	return function ContentLibraryModel() {
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
		$('#mdlEditLibraryHeader').mouseup(function () {
			$("#mdlEditLibrary").draggable({ disabled: true });
		});

		$('#mdlEditLibraryHeader').mousedown(function () {
			$("#mdlEditLibrary").draggable({ disabled: false });
		});
		/////////

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

		self.contentTabs = ko.observableArray(['generalContentEdit', 'modelsContentEdit', 'configurationsContentEdit']);
		self.breadCrumbContent = ko.observableArray(contentFileTabs);
		self.presentTab = ko.observable('generalContentEdit');
		self.previousTab = ko.observable('');
		self.nextTab = ko.observable('modelsContentEdit');
		self.models = ko.observableArray();
		self.tags = ko.observableArray();
		self.tagsOption = ko.observable();
		self.tagsNameArray = ko.observableArray();
		isCarbonMobileModelSelected = false;
		self.globalTags = [];

		var modelsArray = koUtil.rootmodels;
		supportedModelsArray = new Array();

		self.onChangeTab = function (id) {
			if (id && id != '') {
				$('#modelsContentEdit').removeClass('hide');
				$('#configurationsContentEdit').removeClass('hide');
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
				if (id == 'generalContentEdit') {
					self.showGeneralTabControls(id);
				} else if (id == 'modelsContentEdit') {
					if (_.isEmpty(supportedModelsArray)) {
						supportedModelsArray = !_.isEmpty(supportedModels) ? supportedModels.split(',') : new Array();
					}

					var selectedModelsData = new Array();
					if (supportedModelsArray && supportedModelsArray.length > 0) {
						for (j = 0; j < supportedModelsArray.length; j++) {
							var modelObject = new Object();
							modelObject.ModelName = supportedModelsArray[j];
							selectedModelsData.push(modelObject);
						}
					}
					setModelsSelection(selectedModelsData);
					self.showModelsTabControls(id);
				} else if (id == 'configurationsContentEdit') {
					$("#validateTargetUserEdit").empty();
					$("#validateFileNameEdit").empty();
					$("#validateDeviceLocationEdit").empty();
					self.showconfigurationsTabControls(id);

					var filterSourceDeviceFileLocations = _.where(self.deviceFileLocationsArray(), { ConfigName: self.DeviceFileLocationValue });
					if (filterSourceDeviceFileLocations.length > 0) {
						$('#selectDeviceFileLocationEdit').val(filterSourceDeviceFileLocations[0].ConfigValue).prop("selected", "selected");
						$('#selectDeviceFileLocationEdit').trigger('chosen:updated');
					}

					var filterSourceFileNames = _.where(self.fileNamesArray(), { ConfigName: self.FileNameValue });
					if (filterSourceFileNames.length > 0) {
						$('#selectFileNameOnDeviceEdit').val(filterSourceFileNames[0].ConfigValue).prop("selected", "selected");
						$('#selectFileNameOnDeviceEdit').trigger('chosen:updated');
					}

					//looping because target user Config Name has extra space
					for (var k = 0; k < self.targetUsersArray().length; k++) {
						if (self.TargetUserValue == self.targetUsersArray()[k].ConfigName.trim()) {
							$('#selectTargetUserEdit').val(self.targetUsersArray()[k].ConfigValue).prop("selected", "selected");
							$('#selectTargetUserEdit').trigger('chosen:updated');
						}
					}
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
			$('#btnSaveContent').addClass('hide');
			$('#btnNextContentEdit').removeClass('hide');
			$('#btnBackContentEdit').addClass('hide');
			self.presentTab('generalContentEdit');
			self.updatebreadCrumb('generalBreadCrumb');
			self.previousTab('');
			self.nextTab('modelsContentEdit');
		}

		self.showModelsTabControls = function (id) {
			$('#btnSaveContent').addClass('hide');
			$('#btnNextContentEdit').removeClass('hide');
			$('#btnBackContentEdit').removeClass('hide');
			self.presentTab('modelsContentEdit');
			self.updatebreadCrumb('modelsBreadCrumb');
			self.previousTab('generalContentEdit');
			self.nextTab('configurationsContentEdit');
		}

		self.showconfigurationsTabControls = function (id) {
			$('#btnSaveContent').removeClass('hide');
			$('#btnNextContentEdit').addClass('hide');
			$('#btnBackContentEdit').removeClass('hide');
			self.presentTab('operationsContent');
			self.updatebreadCrumb('configurationsBreadCrumb');
			self.previousTab('modelsContentEdit');
			self.nextTab('');
		}

		self.backToPrevious = function () {
			self.onChangeTab(self.previousTab());
		}

		self.moveToNext = function () {
			if (self.nextTab() == 'modelsContentEdit') {
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

				if ($('#fileVersionEdit').val() == "") {
					self.FileVersion(null);
					$("#please_enter_content_version").show();
					return;
				} else {
					$("#please_enter_content_version").hide();
				}

				self.onChangeTab(self.nextTab());
			} else if (self.nextTab() == 'configurationsContentEdit') {
				var selectedModels = _.where(self.models(), { IsSelected: true });
				if (_.isEmpty(selectedModels)) {
					openAlertpopup(1, 'please_select_model');
					return;
				}

				self.onChangeTab(self.nextTab());
			}
		}

		self.editlibrary = function (observableModelPopup, refreshPackage) {
			var retval = checkerror();
			if (retval == null || retval == "") {
				editContent(self.fileUploadDate, self.packageId, self.models, self.tagsNameArray, observableModelPopup, refreshPackage);
			}
		}


		self.PackageName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_enter_content_name', {
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

		self.FileVersion = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_enter_content_version', {
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
				$('#tagsComboEdit option').prop('selected', true);
				$('#tagsComboEdit').trigger('chosen:updated');
			}
		});

		self.ConfigName = ko.observable("").extend({
			required: {
				params: true,
				message: i18n.t('please_select_device_file_location', {
					lng: lang
				})
			}
		});

		self.ConfigValue = ko.observable("").extend({
			required: {
				params: true,
				message: i18n.t('please_select_target_user', {
					lng: lang
				})
			}
		});

		self.ConfigId = ko.observable("").extend({
			required: {
				params: true,
				message: i18n.t('please_select_stdFile', {
					lng: lang
				})
			}
		});


		//------------------------------FOCUS ON  POP UP-------------------------------------


		$('#addLibraryModal').keydown(function (e) {
			if ($('#btn_editLibraryCancel').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#btn_editLibraryClose').focus();
			}
		});

		//----------------------------------------------------------------------------------------

		function setModelsSelection(supportedModelsData) {
			if (supportedModelsData && supportedModelsData.length > 0) {
				for (var i = 0; i < modelsArray.length; i++) {
					var modelSelected = _.where(supportedModelsData, { ModelName: modelsArray[i].ModelName });
					if (modelSelected.length > 0) {
						modelsArray[i].IsSelected = true;
					} else {
						modelsArray[i].IsSelected = false;
					}
				}
				self.models(modelsArray);
			} else {
				for (var j = 0; j < modelsArray.length; j++) {
					modelsArray[j].IsSelected = false;
				}
				self.models(modelsArray);
			}
		}

		function checkerror() {
			var retval = '';
			$("#validateTargetUserEdit").empty();
			$("#validateFileNameEdit").empty();
			$("#validateDeviceLocationEdit").empty();

			var versionName = $("input#fileVersionEdit");
			versionName.val(versionName.val().replace(/^\s+/, ""));

			if ($("#selcteFileEdit").val() == "") {
				retval += 'SELECT FILE';
				self.PackageFile(null);
				$("#please_select_package_file").show();
			} else {
				retval += '';
			}

			if ($("#packageNameEdit").val() == "") {
				retval += 'login name';
				self.PackageName(null);
				$("#please_enter_content_name").show();
			} else {
				retval += '';
			}

			if ($('#fileVersionEdit').val() == "") {
				retval += 'version name';
				self.FileVersion(null);
				$("#please_enter_content_version").show();
			} else {
				retval += '';
			}

			return retval;
		}

		if (checkthumbnailview == true) {
			self.FileNameValue = globalVariableForEditContent[0].selectedFileNameOnDevice;
			self.DeviceFileLocationValue = globalVariableForEditContent[0].selectedDeviceFileLocation;
			self.TargetUserValue = globalVariableForEditContent[0].selectedTargetUser;
			self.PackageFileValue = globalVariableForEditContent[0].selectedFileName;
			self.PackageNameValue = globalVariableForEditContent[0].selectedPackageName;
			self.DescriptionValue = globalVariableForEditContent[0].selectedDescription;
			self.FileVersionValue = globalVariableForEditContent[0].selectedFileVersion;
			self.TagsValue = globalVariableForEditContent[0].selectedTags;
			self.fileUploadDate = globalVariableForEditContent[0].selectedFileUploadDate;
			self.packageId = globalVariableForEditContent[0].selectedPackageId;
			var supportedModels = globalVariableForEditContent[0].selectedModels;
		} else {
			var selectedId = getSelectedUniqueId('jqxgridContentlib');
			var source = _.where(globalVariableForEditContent, { selectedPackageId: selectedId[0] });

			self.FileNameValue = source[0].selectedFileNameOnDevice;
			self.DeviceFileLocationValue = source[0].selectedDeviceFileLocation;
			self.TargetUserValue = source[0].selectedTargetUser;
			self.PackageFileValue = source[0].selectedFileName;
			self.PackageNameValue = source[0].selectedPackageName;
			self.DescriptionValue = source[0].selectedDescription;
			self.FileVersionValue = source[0].selectedFileVersion;
			self.TagsValue = source[0].selectedTags;
			self.fileUploadDate = source[0].selectedFileUploadDate;
			self.packageId = source[0].selectedPackageId;
			var supportedModels = source[0].selectedModels;
		}

		$('#packageNameEdit').keyup(function () {
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

		$('#fileVersionEdit').keyup(function () {
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

		$("#contentDescription").on('change keyup paste', function () {
			if ($("#contentDescription").val() != "" && $("#contentDescription").val() != self.DescriptionValue) {
				$('#btnSaveContent').removeAttr('disabled');
			}
		});

		$("#fileVersionEdit").on('change keyup paste', function () {
			if ($("#fileVersionEdit").val() != "" && $("#fileVersionEdit").val() != self.FileVersionValue) {
				$('#btnSaveContent').removeAttr('disabled');
			}
		});

		$("#tagTxtEdit").on('change keyup paste', function () {
			if ($("#tagTxtEdit").val() != "" && $("#tagTxtEdit").val() != self.TagsValue) {
				$('#btnSaveContent').removeAttr('disabled');
			}
		});

		self.onChangeTags = function () {
			var selectedTags = [];
			self.tagsNameArray([]);
			if ($("#tagsComboEdit").chosen().val() == null || $("#tagsComboEdit").chosen().val() == "" || $("#tagsComboEdit").chosen().val().length == 0) {
				self.TagName(null);
			} else {
				selectedTags = [];
				var sourceTag = new Array();
				$('#tagsComboEdit :selected').each(function (i, selected) {
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

		self.targetUsersArray = ko.observableArray(targetUsers);
		self.fileNamesArray = ko.observableArray(fileNames);
		self.deviceFileLocationsArray = ko.observableArray(deviceFileLocations);

		getTags(self.tags, self.TagsValue);

		seti18nResourceData(document, resourceStorage);
	}

	function getTags(tags, selectedTags) {
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
						self.globalTags = data.getTagsResp.Tags;

						var values = selectedTags;
						var tagsArray = $('select#tagsComboEdit option');

						if (!_.isEmpty(values)) {
							$.each(values.split(','), function (index, element) {
								for (var i = 0; i < tagsArray.length; i++) {
									var tagName = tagsArray[i].text;
									var source = _.where(tags(), { TagName: tagName });
									tagName = tagName.replace(/ /g, '');
									element = element.replace(/ /g, '');
									if (tagName.trim() == element.trim()) {
										$('select#tagsComboEdit option[value=' + tagsArray[i].value + ']').prop('selected', 'selected');
										$("#tagsComboEdit").trigger('chosen:updated');
										break;
									}
								}
							});
						}
					}
				}
			}
		}

		var method = 'GetTags';
		var params = '{"token":"' + TOKEN() + '","getTagsReq":' + JSON.stringify(getTagsReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	function editContent(fileUploadDate, packageId, modelsArray, tagsArray, observableModelPopup, refreshPackage) {

		var setPackageReq = new Object();
		var packages = new Object();

		packages.Applications = null;
		packages.CreatedByUserName = null;
		packages.Description = $("#contentDescription").val();
        packages.DeviceFileLocation = $("#selectDeviceFileLocationEdit").find('option:selected').val() == "Select Device file Location" ? null : $("#selectDeviceFileLocationEdit").find('option:selected').val();
        packages.DeviceFileLocationAlias = $("#selectDeviceFileLocationEdit").find('option:selected').text() == "Select Device file Location" ? null : $("#selectDeviceFileLocationEdit").find('option:selected').text();
        packages.DeviceFileName = $("#selectFileNameOnDeviceEdit").find('option:selected').val() == "Select Filename on Device" ? null : $("#selectFileNameOnDeviceEdit").find('option:selected').val() ;
        packages.DeviceFileNameAlias = $("#selectFileNameOnDeviceEdit").find('option:selected').text() == "Select Filename on Device" ? null : $("#selectFileNameOnDeviceEdit").find('option:selected').text();
		packages.FileInfo = null;
		packages.FileName = $("#selcteFileEdit").val();
		packages.FileName = packages.FileName.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt");
		packages.FileSize = 12345;//fileSize;
		packages.FileType = 'Content';
		packages.FileUploadDate = CreatJSONDate(fileUploadDate);
		packages.FileVersion = $("#fileVersionEdit").val();
		packages.PackageName = $("#packageNameEdit").val();
		packages.Description = $("#txtDescEdit").val();
		packages.PackageType = 2;
		packages.PackageId = packageId;
		packages.IsEnabledForAutomation = false;
		packages.PackageMode = 0;
		packages.IsFileDldAllowed = false;
		packages.IsParameterDldAllowed = false;
		packages.PostInstallAction = 0;
		packages.InstallDelay = 0;
        packages.TargetUser = $("#selectTargetUserEdit").find('option:selected').val() == "Select Target User" ? null : $("#selectTargetUserEdit").find('option:selected').val();
        packages.TargetUserAlias = $("#selectTargetUserEdit").find('option:selected').text() == "Select Target User" ? null : $("#selectTargetUserEdit").find('option:selected').text();

		var selectedModels = _.where(modelsArray(), { IsSelected: true });
		var modelsDataArray = new Array();
		for (j = 0; j < selectedModels.length; j++) {
			var obj = new Object();
			obj.ModelId = selectedModels[j].ModelId;
			obj.ModelName = selectedModels[j].ModelName;
			obj.Family = selectedModels[j].Family;
			modelsDataArray.push(obj);
		}

		setPackageReq.Package = packages;
		setPackageReq.IsFileParamOptChanged = 0;
		setPackageReq.Models = modelsDataArray;
		setPackageReq.FolderId = 0;
		setPackageReq.IsMasterPackage = false;
		setPackageReq.SubPackages = [];
		setPackageReq.PackageTags = tagsArray();

		if (setPackageReq.PackageTags.length <= 0) {
			var pckTags = [];
			var selectedTags = [];
			$('#tagsComboEdit :selected').each(function (i, selected) {
				selectedTags[i] = $(selected).text();
			});
			for (j = 0; j < selectedTags.length; j++) {
				for (k = 0; k < globalTags.length; k++) {
					if (selectedTags[j] == globalTags[k].TagName) {
						var tag = { TagId: globalTags[k].TagId, TagName: globalTags[k].TagName };
						pckTags.push(tag);
					}
				}
			}
			setPackageReq.PackageTags = pckTags;
		}

		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (koUtil.isThumbnailViewActive == 1) {
						refreshPackage();
					} else {
						gridFilterClear('jqxgridContentlib');
					}
					isCarbonMobileModelSelected = false;
					$('#addLibraryModal').modal('hide');
					observableModelPopup('unloadTemplate');
					openAlertpopup(0, 'alert_file_updated_success');
					$('#draggEditLibraryID').draggable();
				} else if (data.responseStatus.StatusCode == AppConstants.get('MODEL_DOES_NOT_SUPPORT_UPLOAD')) {   //159
					openAlertpopup(1, data.responseStatus.StatusMessage);
				} else if (data.responseStatus.StatusCode == AppConstants.get('CANNOT_REMOVE_MODELS')) {            //176
					openAlertpopup(1, data.responseStatus.StatusMessage);
				}
			}
		}

		var method = 'SetPackage';
		var params = '{"token":"' + TOKEN() + '","setPackageReq":' + JSON.stringify(setPackageReq) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
	}
});

checkModelsValue = function (modelName, checked) {
	if (checked) {
		supportedModelsArray.push(modelName);
	} else {
		if (!_.isEmpty(supportedModelsArray) && supportedModelsArray.length > 0) {
			for (var i = 0; i < supportedModelsArray.length; i++) {
				if (modelName === supportedModelsArray[i]) {
					supportedModelsArray.splice(i, 1);
					break;
				}
			}
		}
	}
}
