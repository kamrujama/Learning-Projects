define(["knockout", "koUtil", "autho", "advancedSearchUtil", "knockout.mapping", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "bootstrapDateTimePicker", "chosen"], function (ko, koUtil, autho, ADSearchUtil, koMapping) {
	var lang = getSysLang();

	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});
	var treeOriginalGlobalColl;
	return function editTemplateAcrossAllMultiInstance() {

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
		$('#mdlUpdateParameterMultiInstanceHeader').mouseup(function () {
			$("#mdlUpdateParameterMultiInstanceContent").draggable({ disabled: true });
		});

		$('#mdlUpdateParameterMultiInstanceHeader').mousedown(function () {
			$("#mdlUpdateParameterMultiInstanceContent").draggable({ disabled: false });
		});

		DeviceParamAppGID = '';

		self.editMultiInstanceDetailsHeader = ko.observable();
		self.JsonXmlData = ko.observable();
        self.templateXML = ko.observable();    
		self.versionFlag = ko.observable(true);
		self.treeColl = ko.observableArray();
		self.breadcrumbColl = ko.observableArray([]);
		self.confirmInstance = ko.observable();
		self.confirmPrevInstance = ko.observable();
		self.confirmPrevTarget = ko.observable();
		self.confirmTarget = ko.observable();
		self.regExpression = ko.observable();

		//---CheckBox parameter edit from device search screen
		//self.isFromDeviceSearchScreen = ko.observable(false);
		//if (ADSearchUtil.AdScreenName == 'deviceSearch') {
		//    self.isFromDeviceSearchScreen(true);
		//}
		self.checkboxActions = ko.observableArray([{ actionName: "Select" }, { actionName: "UnSelect" }, { actionName: "Reset" }]);
		self.chekBoxParamSelectedData = ko.observable();

		arrayGlobalForSetValue = new Array();
		arrayGlobalofeditvalue = new Array();
		arrayOfInvalidChars = new Array();
		var retvalForBasicParamView = false;
		var retvalForAdvParamView = false;
		var retvalForBasicParamEdit = false;
		var retvalForAdvParamEdit = false;
		var checkFlagForOnload = 1;
		var applicationId = koUtil.getEditDeviceProfile.ApplicationId;
		var applicationName = koUtil.getEditDeviceProfile.ApplicationName;
		var applicationVersion = koUtil.getEditDeviceProfile.ApplicationVersion;
		koUtil.globalSelectedLevel = 1;
		koUtil.currentScreen = 'ParametersAcrossAllInstances';
		var displayHeader = i18n.t('edit_parameter_for_application', { lng: lang }) + " " + applicationName + " " + i18n.t('Version_packageUpgrade', { lng: lang }) + " " + applicationVersion;
		self.editMultiInstanceDetailsHeader(displayHeader);
		self.observableModelPopupFiles = ko.observable();

		function checkRights() {
			retvalForBasicParamView = autho.checkRightsBYScreen('Basic Parameter Management', 'IsviewAllowed');
			retvalForAdvParamView = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsviewAllowed');
			retvalForBasicParamEdit = autho.checkRightsBYScreen('Basic Parameter Management', 'IsModifyAllowed');
			retvalForAdvParamEdit = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsModifyAllowed');
		}

		checkRights();

		self.cancelPopup = function (unloadAddTemplatepopup) {
			if (arrayGlobalofeditvalue.length > 0) {
				$("#TemplateConfirmPopup").modal('show');
			} else {
				unloadAddTemplatepopup('checkTxtValue');
			}
		}

		self.cancelChangesConfirmation = function () {
			$("#TemplateConfirmPopup").modal('hide');
			$("#mainPageBody").addClass('modal-open-appendon');
		}
		function getSelectedTreeLevels(parentinstance, isfromClick, treeSelectionFlow) {
			var sitem = _.where(treeOriginalGlobalColl, { Level: parentinstance.Level - 1, FormFileId: parentinstance.ParentFormFileId });
			if (sitem.length > 0 && sitem[0].Level > 0) {
				treeSelectionFlow[sitem[0].Level - 1] = sitem[0];
				if (sitem[0].ParentLevel != "" && sitem[0].ParentFormFileId != 0) {
					getSelectedTreeLevels(sitem[0], isfromClick, treeSelectionFlow);
				}
			}
		}
		function buildBreadCrumText(selectedInstance, isfromCLick) {
			var treeSelectionFlow = [];
			self.breadcrumbColl([]);
			selectedInstance.selectedInstanceName = isfromCLick ? '' : instanceName;
			treeSelectionFlow[koUtil.globalSelectedLevel - 1] = selectedInstance;
			var parentinstance = _.where(treeOriginalGlobalColl, { Level: koUtil.globalSelectedLevel, FormFileId: koUtil.globalSelectedlevelFormFileId });
			getSelectedTreeLevels(parentinstance[0], isfromCLick, treeSelectionFlow);
			self.breadcrumbColl(treeSelectionFlow);
		}

		function TreeNode(values) {
			var self = this;
			koMapping.fromJS(values, {
				children: {
					create: createNode
				}
			}, this);
			this.expanded = ko.observable(true);
			this.collapsed = ko.computed(function () {
				return !self.expanded();
			})
		}

		function createNode(options) {
			return new TreeNode(options.data);
		}
		function BuildTreeStructure(array, parent, tree) {

			tree = typeof tree !== 'undefined' ? tree : [];
			parent = typeof parent !== 'undefined' ? parent : {
				FormFileId: 0
			};

			var children = _.filter(array, function (child) {
				return child.ParentFormFileId == parent.FormFileId;
			});

			if (!_.isEmpty(children)) {
				if (parent.FormFileId == 0) {
					tree = children;
				} else {
					parent['children'] = children
				}
				_.each(children, function (child) {
					BuildTreeStructure(array, child)
				});
			}

			return tree;
		}

		function loadelementPackageFiles(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopupFiles(elementname);
		}

		function generateTemplate(tempname, controllerId) {
			//new template code
			var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
			var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
			var cunanem = tempname + '1';
			ko.components.register(tempname, {
				viewModel: { require: ViewName },
				template: { require: 'plugin/text!' + htmlName }
			});
			// end new template code
		}

		self.unloadPackageFilesPopup = function (popupName) {
			self.observableModelPopupFiles('unloadTemplate');
			$("#allInstancesFilesModel").modal('hide');
		}

		self.validationOfRegExpression = function (newValue) {	
			var regExpval = new RegExp(self.regExpression());
			if ((regExpval.test(newValue)) == false) {
				return false;
			} else {
				return true;
			}
		}
		//Tab Left and Right arrow Navigation 
		var left = 0;
		var controlWidth = 0;
		self.moveLeft = function () {
			contrWidth = $('#resultSectionAllInstances').width();        //When we move left
			left = moveTabsLeft("#templateTabs", "#moveEPLeft", "#moveEPRight", self.templateXML().length, left, controlWidth);
		}

		self.moveRight = function () {
			contrWidth = $('#resultSectionAllInstances').width();        //When we move right
			left = moveTabsRight("#templateTabs", "#moveEPLeft", "#moveEPRight", self.templateXML().length, left, controlWidth);
		}

		self.onTabSelect = function (data) {
			//if (data.Type.toUpperCase() == 'GRID') {
			//    isGridTabSelect = true;               
			//    $("#templateTabs li div span").addClass("tabMask");
			//    $("#btnSaveMultiInstanceTemplate").prop('disabled', true);
			//    if (arrayGlobalofeditvalue.length > 0) {
			//        $("#EditParameterConfirmPopup").modal('show');
			//        return;
			//    }
			//}
		}

		//Component Listeners

		self.focusInMaskValue = function (data) {
			var id = '#templateGlobalTxt' + data.ParamId;
			isTabKeyPressed(id);
			if (data.MaskValue && data.MaskValue.toUpperCase() == 'TRUE') {
				$(id).val(data.ParamValue);
			}
		}

		self.focusOutMaskValue = function (data) {
			var id = '#templateGlobalTxt' + data.ParamId;
			isTabKeyPressed(id);
			if (data.MaskValue && data.MaskValue.toUpperCase() == 'TRUE') {
				data.ParamValue = $(id).val();
				$(id).val('********');
			}
		}

		self.hideEditPramDiv = function () {
			$(".pageMask").hide();
			self.editParams();
			setTimeout(function () {
				$("#mainPageBody").addClass('modal-open');
			}, 500);

		}

		self.checkDllValue = function (data) {
			if (data.AllowModify) {
				if (checkFlagForOnload == 0) {
					var id = "#templateGlobalCombo" + data.ParamId;
					var value = $(id).find('option:selected').val();
					if (value == '' || value == data.ParamValue || data.ParamValue == undefined) {
						updateEditvalue(data);
					} else {
						var name = $(id).find('option:selected').text();
						updateSetValue(data, value, name);
					}
				}
			}
		}

		self.checkReferenceEnumValue = function (data) {
			var id = "#templateGlobalReferenceCombo" + data.ParamId;
			var value = $(id).find('option:selected').val();
			if (value == '' || value == data.ParamValue || data.ParamValue == undefined) {
				updateEditvalue(data);
			} else {
				var name = $(id).find('option:selected').text();
				updateSetValue(data, value, name);
			}
		}

		self.checkCheckboxValue = function (data) {
			self.chekBoxParamSelectedData(data);    //Reatians selected checkbox param data to dropdown selection
		}

		self.checkboxParamDropDownSelect = function (nameValue) {
			var checkboxActionsList = self.checkboxActions();
			var selectedData = self.chekBoxParamSelectedData();
			var checkboxId = "#templateGlobalCheck" + selectedData.ParamId;
			if (nameValue == checkboxActionsList[0].actionName) {   //Select
				$(checkboxId).prop("checked", true);
				updateSetValue(selectedData, 1)
			}
			else if (nameValue == checkboxActionsList[1].actionName) {  //Unselect
				$(checkboxId).prop("checked", false);
				updateSetValue(selectedData, 0)
			}
			else {
				$(checkboxId).prop("checked", false);
				openDAtefilterAlertpopup(i18n.t('information_message_param_changes_discarded', { param: selectedData.DisplayName }, { lng: lang }));
				//$("#paramDiscardInfoMessage").text(i18n.t('information_message_param_changes_discarded', { param: selectedData.DisplayName }, { lng: lang }));                                
				//$("#paramDiscardInfoPopup").modal("show");
				setTimeout(function () { $("#datefilterPopup").modal("hide") }, 5000);
				updateEditvalue(selectedData);
			}
		}

		self.hideParamDiscardInfoPopup = function () {
			$("#paramDiscardInfoPopup").hide();
		}

		self.isNumberKey = function () {
			return validateNumberKey(event);
		}
		self.clearDateParameter = function (data) {
			var id = "#templateGlobalInputDate" + data.ParamId;
			var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
			if (data.ValueType.DateTime && data.ValueType.DateTime.DateFormat) {
				dateFormat = data.ValueType.DateTime.DateFormat;
			}
			updateDateTimePicker("#templateGlobalDate" + data.ParamId, dateFormat, 'today');
			$(id).val('');
			updateSetValue(data, '', '', 'User');
		}
		self.checkDateValue = function (data) {
			var id = "#templateGlobalInputDate" + data.ParamId;
			var check = '';
			if ($(id).val() != '') {
				check = $(id).val();
			}
			if (check == data.ParamValue) {
				updateEditvalue(data);
			} else {
				updateSetValue(data, check);
			}
		}
		self.checkTxtValue = function (data) {
			var id = "#templateGlobalTxt" + data.ParamId;
			isTabKeyPressed(id);
			var value = $(id).val();
			$(id).removeClass("borderColor-Text");
			if (value == data.ParamValue) {
				updateEditvalue(data);
			} else {
				updateSetValue(data, value);
			}
		}

		self.setBlankValue = function (data) {
			var id = "#chkBlank" + data.ParamId;
			var stringId = "#templateGlobalTxt" + data.ParamId;
			if ($(id).is(':checked')) {
				data.ParamValue = '';
				$(stringId).val('');
				$(stringId).prop("disabled", true);
				$(stringId).removeClass("borderColor-Text");
				$("#blankCheckBoxDiv1").attr("title", i18n.t('unAssign_blank_value', { lng: lang }));
				$("#blankCheckBoxDiv2").attr("title", i18n.t('unAssign_blank_value', { lng: lang }));
				$("#blankCheckBoxDiv3").attr("title", i18n.t('unAssign_blank_value', { lng: lang }));
				updateSetValue(data, $(stringId).val());
			} else {
				$(stringId).removeClass("borderColor-Text");
				$(stringId).prop("disabled", false);
				$("#blankCheckBoxDiv1").attr("title", i18n.t('assign_blank_value', { lng: lang }));
				$("#blankCheckBoxDiv2").attr("title", i18n.t('assign_blank_value', { lng: lang }));
				$("#blankCheckBoxDiv3").attr("title", i18n.t('assign_blank_value', { lng: lang }));
				updateEditvalue(data);
			}
		}

		self.validateGlobalNumber = function (data) {
			var maxValueNum = parseInt(data.ValueType.Numeric.MaxVal);
			var minValueNum = parseInt(data.ValueType.Numeric.MinVal);
			var id = "#templateGlobalNumeric" + data.ParamId;
			var val = parseInt($(id).val());

			if (isNaN(val)) {
				val = '';
			} else {
				if (val > maxValueNum) {
					val = maxValueNum;
				} else if (val < minValueNum) {
					val = minValueNum;
				}
			}
			$(id).val(val);

			if (val == data.ParamValue) {
				updateEditvalue(data);
			} else {
				updateSetValue(data, val);
			}
		}
		///numeric steper
		self.upNumber = function (data) {
			if (data.AllowModify) {
				var id = '#templateGlobalNumeric' + data.ParamId;
				if ($(id).val() == '') {
					var number = 0;
				} else {
					var number = parseInt($(id).val());
				}
				if (number < data.ValueType.Numeric.MaxVal) {
					number = number + 1;
				}
				$(id).val(number);

				if ($(id).val() == '' || $(id).val() == data.ParamValue) {
					updateEditvalue(data);
				} else {
					var value = $(id).val();
					updateSetValue(data, value);
				}
			}
		}

		self.downNumber = function (data) {
			if (data.AllowModify) {
				var id = '#templateGlobalNumeric' + data.ParamId;
				if ($(id).val() == '') {
					var number = 0;
				} else {
					var number = parseInt($(id).val());
				}

				if (number > data.ValueType.Numeric.MinVal) {
					number = number - 1;
				}

				$(id).val(number);

				if ($(id).val() == '' || $(id).val() == data.ParamValue) {
					updateEditvalue(data);
				} else {
					var value = $(id).val();
					updateSetValue(data, value);
				}
			}
		}

		self.upNumberPval = function (data) {
			var id = '#txtnumericValue';

			if ($(id).val() == '') {
				var number = 0;
			} else {
				var number = parseInt($(id).val());
			}
			if (number < self.maxValue()) {
				number = number + 1;
			}
			$(id).val(number);
			self.enableDisableSaveBtnOnEditPopUp($(id).val());
		}

		self.downNumberPval = function (data) {

			var id = '#txtnumericValue';
			if ($(id).val() == '') {
				var number = 0;
			} else {
				var number = parseInt($(id).val());
			}
			var max = self.maxValue();
			var min = self.maxValue();


			if (number > self.minValue()) {
				number = number - 1;
			}
			$(id).val(number);
			self.enableDisableSaveBtnOnEditPopUp($(id).val());
		}

		function updateEditvalue(data) {
			arrayGlobalofeditvalue = jQuery.grep(arrayGlobalofeditvalue, function (value) {
				var id = "" + data.ParamId + ""
				return (value != id && value != null);
			});

			var sourceData = _.where(arrayGlobalForSetValue, {
				ParamId: data.ParamId
			});

			if (sourceData != '') {
				arrayGlobalForSetValue = jQuery.grep(arrayGlobalForSetValue, function (value) {
					var index = arrayGlobalForSetValue.indexOf(sourceData[0]);
					return (value != arrayGlobalForSetValue[index] && value != null);
				});
			}
			arrayOfInvalidChars = jQuery.grep(arrayOfInvalidChars, function (value) {
				var index = arrayOfInvalidChars.indexOf(data.ParamId);
				return (value != arrayOfInvalidChars[index] && value != null);
			});

			if (arrayGlobalofeditvalue.length <= 0 || arrayOfInvalidChars.length > 0) {
				$("#btnSaveMultiInstanceTemplate").prop('disabled', true);
			}
		}

		function updateSetValue(data, value, name, sourceType) {
			if ($.inArray(data.ParamId, arrayGlobalofeditvalue) < 0) {
				arrayGlobalofeditvalue.push(data.ParamId);
			} else {
				var sourceData = _.where(arrayGlobalForSetValue, {
					ParamId: data.ParamId
				});

				if (sourceData != '') {
					arrayGlobalForSetValue = jQuery.grep(arrayGlobalForSetValue, function (value) {
						var index = arrayGlobalForSetValue.indexOf(sourceData[0]);
						return (value != arrayGlobalForSetValue[index] && value != null);
					});
				}
			}

			var Parameter = new Object();
			Parameter.ParamId = data.ParamId;
			Parameter.ParamValue = data.ValueType.Type == "File" ? data.ParamValue : value;
			Parameter.TemplateId = 0;
			Parameter.IsPrimaryIdentifier = (data.PrimaryIdentifier == "True") ? 1 : 0;
			Parameter.PISequence = data.Sequence ? data.Sequence : 0;
			if (Parameter.ParamValue == data.Default) {
				Parameter.SourceType = 'Default';
			} else if (sourceType) {
				Parameter.SourceType = sourceType;
			}
			else {
				Parameter.SourceType = 'User';
			}

			if (data.ValueType.Type == "String") {
				Parameter.ValidChars = data.ValueType.String.ValidChars;
				if (data.ValueType.String.ValidChars && data.ValueType.String.ValidChars != '') {
					var id = "#templateGlobalTxt" + data.ParamId;
					self.regExpression(data.ValueType.String.ValidChars)
					var checkVal = self.validationOfRegExpression($(id).val());
					if (checkVal == false) {
						if ($.inArray(data.ParamId, arrayOfInvalidChars) < 0) {
							arrayOfInvalidChars.push(data.ParamId);
						}
						$(id).addClass("borderColor-Text");
						$("#btnSaveMultiInstanceTemplate").prop('disabled', false);
						return;
					} else {
						arrayOfInvalidChars = jQuery.grep(arrayOfInvalidChars, function (value) {
							var index = arrayOfInvalidChars.indexOf(data.ParamId);
							return (value != arrayOfInvalidChars[index] && value != null);
						});
						$(id).removeClass("borderColor-Text");
					}
				}
			}

			arrayGlobalForSetValue.push(Parameter);

			if (arrayGlobalofeditvalue.length > 0 && arrayOfInvalidChars.length == 0) {
				$("#btnSaveMultiInstanceTemplate").prop('disabled', false);
			} else {
				$("#btnSaveMultiInstanceTemplate").prop('disabled', true);
			}
		}
		self.onClickGlobalLevel = function (instance, event) {
			self.confirmPrevInstance(instance);
			if (typeof event.target == 'undefined') { var target = event.srcElement; } else { var target = event.target; }
			self.confirmPrevTarget(target);
			self.confirmInstance(instance);
			koUtil.globalSelectedInstance(instance);
			self.confirmTarget(target);
			if ($(target).prop("tagName") == 'SPAN') {
				$(target).next().find("select").prop('selectedIndex', 0);
				$(target).next().find("select").trigger('chosen:updated');
			}
			else {
				$(target).parent().find("select").prop('selectedIndex', 0);
				$(target).parent().find("select").trigger('chosen:updated');
			}

			$(".treeNodeCntr .treeNodeActive").removeClass("treeNodeActive");
			if ($(target).prop("tagName") != 'BUTTON') { $(target).addClass("treeNodeActive"); }
			var rootItem = _.where(treeOriginalGlobalColl, { FormFileId: instance.FormFileId() });

			koUtil.globalSelectedlevelFormFileId = instance.FormFileId();
			koUtil.globalSelectedLevel = rootItem[0].Level;
			koUtil.globalSelectedLevelName = rootItem[0].LevelName;
			koUtil.globalSelectedlevelParentLevel = instance.ParentLevel();
			koUtil.editGlobalDevicetemplateXML = rootItem[0].FormFileXML;
			arrayGlobalofeditvalue = [];
			arrayGlobalForSetValue = [];
			arrayOfInvalidChars = [];
			$('#subContainerDivGlobal').removeClass('hide');
			$('#instanceParametersDivGlobal').removeClass('hide');
			$('#noContainerAccessDivGlobal').addClass('hide');
			
			buildBreadCrumText(rootItem[0], true);

			var containerData = $.xml2json(koUtil.editGlobalDevicetemplateXML);
			if (containerData && containerData.length == undefined) {
				containerData = $.makeArray(containerData);
			}

			if (containerData && containerData.length > 0) {
				koUtil.selectedlevelContainerId = getParameterContainerId(containerData);
				if (rootItem[0].IsReferenceEnumeration) {												//if the selected FormFile has one or more ReferenceEnumeration Parameters				
					var referenceEnumContainer = new Array();
					getReferenceEnumAttributes(containerData, referenceEnumContainer);
					getParameterValuesForReferenceEnum(rootItem, containerData, referenceEnumContainer);
				} else {
					createContainerTabs(self.JsonXmlData, self.templateXML, rootItem[0].Level, true);	//create container tabs for the selected FormFile with no ReferenceEnumeration Parameters
				}
			} 
		}

		function getDeviceFormFiles(JsonXmlData, templateXML, leftTreeColl, versionFlag, isUpdate, breadcrumbColl) {
			var getDeviceFormFileReq = new Object();
			var Selector = new Object();
			getDeviceFormFileReq.ApplicationId = applicationId;
			getDeviceFormFileReq.Protocol = koUtil.Protocol;
			getDeviceFormFileReq.IsFromDeviceSearch = !koUtil.isDeviceProfile();
			getDeviceFormFileReq.UniqueDeviceId = 0;
			getDeviceFormFileReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
			getDeviceFormFileReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
			var selectedItemIds = getSelectedUniqueId('Devicejqxgrid');
			var unSelectedItemIds = getUnSelectedUniqueId('Devicejqxgrid');
			var checkAll = checkAllSelected('Devicejqxgrid');
			if (checkAll == 1) {
				Selector.SelectedItemIds = null;
				if (unSelectedItemIds.length > 0) {
					Selector.UnSelectedItemIds = unSelectedItemIds;
				} else {
					Selector.UnSelectedItemIds = null;
				}
			} else {
				Selector.SelectedItemIds = selectedItemIds;
				Selector.UnSelectedItemIds = null;
			}

			getDeviceFormFileReq.Selector = Selector;

			function callbackFunction(data, error) {
				if (data) {
					$("#loadingDiv").hide();
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.getDeviceFormFileResp && data.getDeviceFormFileResp.ParameterFormFiles && data.getDeviceFormFileResp.ParameterFormFiles.length > 0) {
							DeviceParamAppGID = data.getDeviceFormFileResp.AppGID;
							if (data.getDeviceFormFileResp.ParameterFormFiles.length > 1) {
								koUtil.editGlobalDevicetemplateXML = data.getDeviceFormFileResp.ParameterFormFiles[1].FormFileXML;
								koUtil.globalSelectedlevelFormFileId = data.getDeviceFormFileResp.ParameterFormFiles[1].FormFileId;
								koUtil.globalSelectedLevel = data.getDeviceFormFileResp.ParameterFormFiles[1].Level;
								koUtil.globalSelectedLevelName = data.getDeviceFormFileResp.ParameterFormFiles[1].LevelName;
								koUtil.globalSelectedlevelParentLevel = data.getDeviceFormFileResp.ParameterFormFiles[1].ParentLevel;
							}
							var JsonXmlData1 = $.xml2json(koUtil.editGlobalDevicetemplateXML);
							if (JsonXmlData1 && JsonXmlData1.version >= 2.0) {
								versionFlag(true);
								$('#mainSplitterGlobal').jqxSplitter({ width: '99.9%', height: 700, panels: [{ size: '30%', max: 600, min: 250 }, { size: '70%', min: '50%' }] });
							} else {
								versionFlag(false);
							}

							var treeObject;
							var temptreeColl = new Array();
							treeOriginalGlobalColl = new Array();
							if (data.getDeviceFormFileResp.ParameterFormFiles) {
								for (var i = 0; i < data.getDeviceFormFileResp.ParameterFormFiles.length; i++) {
									treeObject = new Object();
									treeObject.FormFileId = data.getDeviceFormFileResp.ParameterFormFiles[i].FormFileId;
									treeObject.ParentFormFileId = data.getDeviceFormFileResp.ParameterFormFiles[i].ParentFormFileId;
									treeObject.LevelName = data.getDeviceFormFileResp.ParameterFormFiles[i].LevelName;
									treeObject.FormFileXML = data.getDeviceFormFileResp.ParameterFormFiles[i].FormFileXML;
									treeObject.ParentVPFX = data.getDeviceFormFileResp.ParameterFormFiles[i].ParentVPFX;
									treeObject.Level = parseInt(data.getDeviceFormFileResp.ParameterFormFiles[i].Level);
									treeObject.OriginalPFX = data.getDeviceFormFileResp.ParameterFormFiles[i].OriginalPFX;
									treeObject.ParentLevel = data.getDeviceFormFileResp.ParameterFormFiles[i].ParentLevel;
									treeObject.FileName = data.getDeviceFormFileResp.ParameterFormFiles[i].FileName;
									treeObject.children = [];
									treeObject.isMulti = data.getDeviceFormFileResp.ParameterFormFiles[i].IsMultiInstance;
									treeObject.dropdownCol = [];
									treeObject.parentInstanceId = 0;
									treeObject.parentInstanceName = '';
									treeObject.selectedInstanceName = '';

									var treeNode = buildMultiInstanceTree(data.getDeviceFormFileResp.ParameterFormFiles, treeObject.Level, treeObject.ParentLevel, treeObject.FormFileXML);
									data.getDeviceFormFileResp.ParameterFormFiles[i].isLevelAccess = treeNode.isLevelAccess;
									treeObject.isLevelAccess = treeNode.isLevelAccess;
									if (!treeNode.isParentLevelAccess)
										break;
									if (treeNode.isLevelAccess)
										temptreeColl.push(treeObject);
									
								}

								var source = BuildTreeStructure(temptreeColl);
								treeOriginalGlobalColl = data.getDeviceFormFileResp.ParameterFormFiles;

								if (source && source.length > 0) {
									var root = new TreeNode(source[0]);
									leftTreeColl(root);
								}
							}

							if (temptreeColl.length > 1) {
								koUtil.editGlobalDevicetemplateXML = temptreeColl[1].FormFileXML;
								var containerData = $.xml2json(koUtil.editGlobalDevicetemplateXML);
								if (containerData && containerData.length == undefined) {
									containerData = $.makeArray(containerData);
								}

								var rootItem = _.where(treeOriginalGlobalColl, { FormFileId: temptreeColl[1].FormFileId });
								if (containerData && containerData.length > 0 && (!_.isEmpty(rootItem) && rootItem[0].IsReferenceEnumeration)) {		//if the selected FormFile has one or more ReferenceEnumeration Parameters								
									var referenceEnumContainer = new Array();
									getReferenceEnumAttributes(containerData, referenceEnumContainer);
									getParameterValuesForReferenceEnum(rootItem, containerData, referenceEnumContainer);
								} else {
									createContainerTabs(JsonXmlData, templateXML, 0, isUpdate);				//create container tabs for the selected FormFile with no ReferenceEnumeration Parameters
								}
								treeSelectionFlow = [temptreeColl[1]];
								breadcrumbColl(treeSelectionFlow);
							}

							

							$("#btnSaveMultiInstanceTemplate").prop('disabled', true);
							$(".treeRoot .treeNodeCntr .nodeGText").eq(1).first().addClass("treeNodeActive");
						}
					}
				}
			}
			$("#loadingDiv").show();
			var method = 'GetDeviceFormFile';
			var params = '{"token":"' + TOKEN() + '","getDeviceFormFileReq":' + JSON.stringify(getDeviceFormFileReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		//get Container Id
		function getParameterContainerId(containerData) {
			var containerId = 0;
			if (containerData[0].ParameterFile && containerData[0].ParameterFile.length === undefined) {
				containerData[0].ParameterFile = $.makeArray(containerData[0].ParameterFile);
			}
			if (containerData[0].ParameterFile && containerData[0].ParameterFile.length > 0) {
				for (var i = 0; i < containerData[0].ParameterFile.length; i++) {
					if (containerData[0].ParameterFile[i].Container && containerData[0].ParameterFile[i].Container.length > 0) {
						for (var j = 0; j < containerData[0].ParameterFile[i].Container.length; j++) {
							if (containerData[0].ParameterFile[i].Container[j].Type === AppConstants.get('NORMAL')) {
								if (containerData[0].ParameterFile[i].Container[j].Container && containerData[0].ParameterFile[i].Container[j].Container.length > 0) {
									if (containerData[0].ParameterFile[i].Container[j].Container[0].Param) {
										if(containerData[0].ParameterFile[i].Container[j].Container[0].Param.length > 0) {
											containerId = containerData[0].ParameterFile[i].Container[j].Container[0].Param[0].ParamContainerId;
										}
										else {
											containerId = containerData[0].ParameterFile[i].Container[j].Container[0].Param.ParamContainerId;
										}
									}
								} else {
									if (containerData[0].ParameterFile[i].Container[j].Container.Param) {
										if(containerData[0].ParameterFile[i].Container[j].Container.Param.length > 0) {
											containerId = containerData[0].ParameterFile[i].Container[j].Container.Param[0].ParamContainerId;
										}
										else {
											containerId = containerData[0].ParameterFile[i].Container[j].Container.Param.ParamContainerId;
										}
									}
								}
							}
						}
					} else if (containerData[0].ParameterFile[i].Container && containerData[0].ParameterFile[i].Container.Param && containerData[0].ParameterFile[i].Container.Param.length > 0) {
						containerId = containerData[0].ParameterFile[i].Container.Param[0].ParamContainerId;
						break;
					}
				}
			}
			return containerId;
		}

		function getParameterValuesForReferenceEnum(rootItem, containerData, referenceEnumContainer) {
			var getParameterValuesForReferenceEnumReq = new Object();
			var Selector = new Object();
			if (koUtil.isDeviceProfile() == true) {
				Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
				Selector.UnSelectedItemIds = null;
			} else {
				var selectedItemIds = getSelectedUniqueId('Devicejqxgrid');
				var unSelectedItemIds = getUnSelectedUniqueId('Devicejqxgrid');
				var checkAll = checkAllSelected('Devicejqxgrid');

				if (checkAll == 1) {
					Selector.SelectedItemIds = null;
					if (unSelectedItemIds.length > 0) {
						Selector.UnSelectedItemIds = unSelectedItemIds;
					} else {
						Selector.UnSelectedItemIds = null;
					}
				} else {
					Selector.SelectedItemIds = selectedItemIds;
					Selector.UnSelectedItemIds = null;
				}
			}

			getParameterValuesForReferenceEnumReq.UniqueDeviceId = koUtil.isDeviceProfile() == true ? koUtil.deviceProfileUniqueDeviceId : 0;
			getParameterValuesForReferenceEnumReq.Level = koUtil.globalSelectedLevel;
			getParameterValuesForReferenceEnumReq.IsFromDeviceSearch = !koUtil.isDeviceProfile();
			getParameterValuesForReferenceEnumReq.DeviceSearch = koUtil.isDeviceProfile() == true ? [] : ADSearchUtil.deviceSearchObj;
			getParameterValuesForReferenceEnumReq.ColumnSortFilter = koUtil.isDeviceProfile() == true ? [] : koUtil.GlobalColumnFilter;
			getParameterValuesForReferenceEnumReq.Selector = Selector;
			getParameterValuesForReferenceEnumReq.Containers = referenceEnumContainer;
			getParameterValuesForReferenceEnumReq.ParamSourceType = ENUM.get('DEVICE');
			getParameterValuesForReferenceEnumReq.ApplicationId = applicationId;

			function callbackFunction(data, Error) {
				if (data) {
					if (data.getParameterReferenceEnumResp)
						data.getParameterReferenceEnumResp = $.parseJSON(data.getParameterReferenceEnumResp);

					var referenceEnumItems = data.getParameterReferenceEnumResp;
					if (referenceEnumItems && referenceEnumItems.length > 0) {
						setReferenceEnumValues(containerData, referenceEnumItems);
					}
					createContainerTabs(self.JsonXmlData, self.templateXML, rootItem[0].Level, true);
				}
			}

			var method = 'GetParameterValuesForReferenceEnum';
			var params = '{"token":"' + TOKEN() + '","getParameterValuesForReferenceEnumReq":' + JSON.stringify(getParameterValuesForReferenceEnumReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		//Get ReferenceEnum parameter attributes for GetParameterValuesForReferencEnum request
		function getReferenceEnumAttributes(containerData, referenceEnumContainer) {
			var referenceEnumObject = new Object();

			if (containerData && containerData.length > 0) {
				for (var i = 0; i < containerData.length; i++) {
					if (containerData && containerData[i].ParameterFile && containerData[i].ParameterFile.length === undefined) {
						containerData[i].ParameterFile = $.makeArray(containerData[i].ParameterFile);
					}
					if (containerData[i].ParameterFile && containerData[i].ParameterFile.length > 0) {
						for (var j = 0; j < containerData[i].ParameterFile.length; j++) {
							if (containerData[i].ParameterFile[j].Container && containerData[i].ParameterFile[j].Container.length > 0) {
								for (var k = 0; k < containerData[i].ParameterFile[j].Container.length; k++) {
									if (containerData[i].ParameterFile[j].Container[k].Type === AppConstants.get('NORMAL')) {
										if (containerData[i].ParameterFile[j].Container[k].Container && containerData[i].ParameterFile[j].Container[k].Container.length > 0) {
											for (var m = 0; m < containerData[i].ParameterFile[j].Container[k].Container.length; m++) {
												for (var n = 0; n < containerData[i].ParameterFile[j].Container[k].Container[m].Param.length; n++) {
													if (containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.Type === "ReferenceEnumeration") {
														referenceEnumObject = new Object();
														referenceEnumObject.ContainerId = containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ReferenceContainerId;
														referenceEnumObject.Name = containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.ReferenceEnumeration.Name;
														referenceEnumObject.Value = containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.ReferenceEnumeration.Value;
														referenceEnumContainer.push(referenceEnumObject);
													}
												}
											}
										} else {
											for (var p = 0; p < containerData[i].ParameterFile[j].Container[k].Container.Param.length; p++) {
												if (containerData[i].ParameterFile[j].Container[k].Container.Param[p].ValueType.Type === "ReferenceEnumeration") {
													referenceEnumObject = new Object();
													referenceEnumObject.ContainerId = containerData[i].ParameterFile[j].Container[k].Container.Param[p].ReferenceContainerId;
													referenceEnumObject.Name = containerData[i].ParameterFile[j].Container[k].Container.Param[p].ValueType.ReferenceEnumeration.Name;
													referenceEnumObject.Value = containerData[i].ParameterFile[j].Container[k].Container.Param[p].ValueType.ReferenceEnumeration.Value;
													referenceEnumContainer.push(referenceEnumObject);
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}

		//set ReferenceEnum parameter values from GetParameterValuesForReferencEnum response
		function setReferenceEnumValues(containerData, referenceEnumItems) {
			if (containerData[0].ParameterFile && containerData[0].ParameterFile.length > 0) {
				for (var j = 0; j < containerData[0].ParameterFile.length; j++) {
					if (containerData[0].ParameterFile[j].Container && containerData[0].ParameterFile[j].Container.length > 0) {
						for (var k = 0; k < containerData[0].ParameterFile[j].Container.length; k++) {
							if (containerData[0].ParameterFile[j].Container[k].Type === AppConstants.get('NORMAL')) {
								if (containerData[0].ParameterFile[j].Container[k].Container && containerData[0].ParameterFile[j].Container[k].Container.length > 0) {
									for (var m = 0; m < containerData[0].ParameterFile[j].Container[k].Container.length; m++) {
										for (var n = 0; n < containerData[0].ParameterFile[j].Container[k].Container[m].Param.length; n++) {
											if (containerData[0].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.Type === "ReferenceEnumeration") {
												paramContainerId = parseInt(containerData[0].ParameterFile[j].Container[k].Container[m].Param[n].ReferenceContainerId);
												var source = _.where(referenceEnumItems, {
													ContainerId: paramContainerId
												})
												if (source && source.length > 0) {
													containerData[0].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.ReferenceEnumeration.ReferenceEnumItem = source[0].ParameterReferenceEnums;
												}
											}
										}
									}
								} else {
									if (containerData[0].ParameterFile[j].Container[k].Container.Param && containerData[0].ParameterFile[j].Container[k].Container.Param.length > 0) {
										for (var p = 0; p < containerData[0].ParameterFile[j].Container[k].Container.Param.length; p++) {
											if (containerData[0].ParameterFile[j].Container[k].Container.Param[p].ValueType.Type === "ReferenceEnumeration") {
												paramContainerId = parseInt(containerData[0].ParameterFile[j].Container[k].Container.Param[p].ReferenceContainerId);
												var source = _.where(referenceEnumItems, {
													ContainerId: paramContainerId
												})
												if (source && source.length > 0) {
													containerData[0].ParameterFile[j].Container[k].Container.Param[p].ValueType.ReferenceEnumeration.ReferenceEnumItem = source[0].ParameterReferenceEnums;
												}
											}
										}
									}
								}
							}
						}
					}
				}
				self.JsonXmlData(containerData);
			}
		}

		function updateGlobalDateParameter(GlobalParameter) {
			if (GlobalParameter.ValueType.Type === "DateTime") {
				var id = '#templateGlobalDate' + GlobalParameter.ParamId;
				var Inputid = '#templateGlobalInputDate' + GlobalParameter.ParamId;
				var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
				if (GlobalParameter.ValueType.DateTime && GlobalParameter.ValueType.DateTime.DateFormat) {
					dateFormat = GlobalParameter.ValueType.DateTime.DateFormat;
				}
				updateDateTimePicker(id, dateFormat, 'today');
				$(Inputid).val('');
			}
		}
		function createContainerTabs(JsonXmlData, templateXML, level, isUpdate) {
			templateXML([]);
			tabGlobalContainer = [];
			if (JsonXmlData() && JsonXmlData().length > 0) {
				var JsonXmlData1 = JsonXmlData();
			} else {
				var JsonXmlData1 = $.xml2json(koUtil.editGlobalDevicetemplateXML);
			}
;
			if (JsonXmlData1 && JsonXmlData1.length == undefined) {
				JsonXmlData1 = $.makeArray(JsonXmlData1);
			}
			if (JsonXmlData1 && JsonXmlData1.length > 0) {
				for (var i = 0; i < JsonXmlData1.length; i++) {
					if (JsonXmlData1[i].ParameterFile.length == undefined) {

						JsonXmlData1[i].ParameterFile = $.makeArray(JsonXmlData1[i].ParameterFile);
					}
					for (var j = 0; j < JsonXmlData1[i].ParameterFile.length; j++) {

						if (JsonXmlData1[i].ParameterFile[j].Container.length == undefined) {
							JsonXmlData1[i].ParameterFile[j].Container = $.makeArray(JsonXmlData1[i].ParameterFile[j].Container);
						}
						for (var k = 0; k < JsonXmlData1[i].ParameterFile[j].Container.length; k++) {
							paramLevel = 0;
							if (JsonXmlData1[i].ParameterFile[j].Container[k].Type != "Grid") {
								koUtil.displayPrimaryIdentifiers = false;
								GenerateContainerData(JsonXmlData1[i].ParameterFile[j].Container[k], tabGlobalContainer, paramLevel, DeviceParamAppGID, JsonXmlData1[i], 1, isUpdate, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, !koUtil.isDeviceProfile(), koUtil, true);
								koUtil.displayPrimaryIdentifiers = true;
							}
						}
					}
				}
			}

			$("#templateTabs").css("width", tabGlobalContainer.length * 110 + "px");
			templateXML(tabGlobalContainer);
			checkFlagForOnload = 0;

			if (tabGlobalContainer && tabGlobalContainer.length > 0) {
				for (var k = 0; k < tabGlobalContainer.length; k++) {
					for (var j = 0; j < tabGlobalContainer[k].Container.length; j++) {
						var dateTimeComponents = []
						if (tabGlobalContainer[k].Container[j].Type == 'Details') {
							if (tabGlobalContainer[k].Container[j].Container.length > 0) {
								for (var l = 0; l < tabGlobalContainer[k].Container[j].Container.length; l++) {
									if (dateTimeComponents.length == 0) {
										if (tabGlobalContainer[k].Container[j].Container[l].length >= 0) {
											for (var m = 0; m < tabGlobalContainer[k].Container[j].Container[l][0].Param.length; m++) {
												updateGlobalDateParameter(tabGlobalContainer[k].Container[j].Container[l][0].Param[m]);
											}
										} else {
											for (var m = 0; m < tabGlobalContainer[k].Container[j].Container[l].Param.length; m++) {
												updateGlobalDateParameter(tabGlobalContainer[k].Container[j].Container[l].Param[m]);
											}
										}

									}
								}
							} else {
								$('#subContainerDivGlobal').addClass('hide');
								$('#instanceParametersDivGlobal').addClass('hide');
								$('#noContainerAccessDivGlobal').removeClass('hide');
								for (var m = 0; m < tabGlobalContainer[k].Container[j].Param.length; m++) {
									updateGlobalDateParameter(tabGlobalContainer[k].Container[j].Container[l].Param[m]);
								}
							}
						}
					}
				}
			} else {
				$('#subContainerDivGlobal').addClass('hide');
				$('#instanceParametersDivGlobal').addClass('hide');
				$('#noContainerAccessDivGlobal').removeClass('hide');
			}
		}

		getDeviceFormFiles(self.JsonXmlData, self.templateXML, self.treeColl, self.versionFlag, true, self.breadcrumbColl);

		self.setDeviceMultiInstanceParameters = function (unloadTempPopup) {
			var checkArrayTextValidation = 0;
			for (var g = 0; g < arrayGlobalForSetValue.length; g++) {
				var id = "#templateGlobalTxt" + arrayGlobalForSetValue[g].ParamId;
				self.regExpression(arrayGlobalForSetValue[g].ValidChars)
				var checkVal = self.validationOfRegExpression((arrayGlobalForSetValue[g].ParamValue));
				if (checkVal == false) {
					$(id).addClass("borderColor-Text");
					checkArrayTextValidation--;
				} else {
					$(id).removeClass("borderColor-Text");
					checkArrayTextValidation++;
				}
			}
			if (checkArrayTextValidation != arrayGlobalForSetValue.length) {
				return;
			}

			var setMultiRecordInstancesByDeviceSearchReq = new Object();
			var Selector = new Object();
			if (koUtil.isDeviceProfile() == true) {
				Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
				Selector.UnSelectedItemIds = null;
				setMultiRecordInstancesByDeviceSearchReq.Selector = Selector;
				setMultiRecordInstancesByDeviceSearchReq.DeviceSearch = null;
			} else {
				var selectedItemIds = getSelectedUniqueId('Devicejqxgrid');
				var unSelectedItemIds = getUnSelectedUniqueId('Devicejqxgrid');
				var checkAll = checkAllSelected('Devicejqxgrid');

				if (checkAll == 1) {
					Selector.SelectedItemIds = null;
					if (unSelectedItemIds.length > 0) {
						Selector.UnSelectedItemIds = unSelectedItemIds;
					} else {
						Selector.UnSelectedItemIds = null;
					}
				} else {
					Selector.SelectedItemIds = selectedItemIds;
					Selector.UnSelectedItemIds = null;
				}
				setMultiRecordInstancesByDeviceSearchReq.Selector = Selector;
				setMultiRecordInstancesByDeviceSearchReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
			}


			var ParamList = new Array();
			for (var i = 0; i < arrayGlobalForSetValue.length; i++) {
				var Parameter = new Object();
				Parameter.ParamElementId = arrayGlobalForSetValue[i].ParamId;
				Parameter.ParamValue = arrayGlobalForSetValue[i].ParamValue;
				Parameter.TemplateId = arrayGlobalForSetValue[i].TemplateId;
				Parameter.IsPrimaryIdentifier = arrayGlobalForSetValue[i].IsPrimaryIdentifier;
				Parameter.PISequence = arrayGlobalForSetValue[i].PISequence;
				if (arrayGlobalForSetValue[i].SourceType == undefined) {
					Parameter.SourceType = "Default";
				} else {
					Parameter.SourceType = arrayGlobalForSetValue[i].SourceType;
				}
				ParamList.push(Parameter);
			}
			setMultiRecordInstancesByDeviceSearchReq.ApplicationId = koUtil.getEditDeviceProfile.ApplicationId;
			setMultiRecordInstancesByDeviceSearchReq.FormFileId = koUtil.globalSelectedlevelFormFileId;
			setMultiRecordInstancesByDeviceSearchReq.ContainerId = koUtil.selectedlevelContainerId;
			setMultiRecordInstancesByDeviceSearchReq.Level = koUtil.globalSelectedLevel;
			setMultiRecordInstancesByDeviceSearchReq.Parameters = ParamList;
			setMultiRecordInstancesByDeviceSearchReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						arrayGlobalForSetValue = [];
						arrayGlobalofeditvalue = [];
						arrayOfInvalidChars = [];
						$("#btnSaveInstance").prop('disabled', true);
						if (koUtil.isDeviceProfile() == true) {
							openAlertpopup(0, 'instance_parameters_successfully_updated_in_deviceprofile');
						} else {
							openAlertpopup(0, 'instance_parameters_successfully_updated');
						}
						$("#btnSaveMultiInstanceTemplate").prop('disabled', true);
					} else if (data.responseStatus.StatusCode == AppConstants.get('PARAM_NOT_FOUND')) {
						openAlertpopup(2, 'param_Not_Found');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_NO_MULTIINSTANCE_FOUND')) {
						openAlertpopup(2, 'no_multiinstance_record_found');
					} else if (data.responseStatus.StatusCode == AppConstants.get('Invalid_Param_Value')) {
						openAlertpopup(2, 'Invalid_Param_Value');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_NO_PARAMETER_UPDATED')) {
						openAlertpopup(1, 'param_values_not_updated');
					}
				}
				$("#loadingDiv").hide();
			}

			$("#loadingDiv").show();
			var method = 'SetMultiRecordInstancesByDeviceSearch';
			var params = '{"token":"' + TOKEN() + '","setMultiRecordInstancesByDeviceSearchReq":' + JSON.stringify(setMultiRecordInstancesByDeviceSearchReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}
		seti18nResourceData(document, resourceStorage);
	}
});