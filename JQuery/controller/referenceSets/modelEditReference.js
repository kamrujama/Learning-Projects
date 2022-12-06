define(["knockout", "autho", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, autho, koUtil) {
	selectedModelsEdit = new Array();
	var lang = getSysLang();
	var statusStr = "";
	var backUpStatusStr = "";
	var packagesArr = new Array();
	var keysArr = new Array();
	var backUpPackagesArray = new Array();
	var backUpKeysArray = new Array();
	var deviceAttributeArr = new Array();
	var backUpDeviceAttributeArr = new Array();
	var modelsArr = new Array();
	var backUpModelsArr = new Array();
	var referenceSetIdValue = "";
	var statusActive = "";
	var keysGridWidth = '480px';
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});



	var rowIndexForHighlighted;// highlighted package selection
	var isRightPackagesClick;
	var rowIdForHighlightedForTable;

	var isKeysDataLoaded = false;
	var isSelectedPaneFiltered = false; //To check filter applied on Selected Packages Pane 
	var selectedRowArrayForSwap = new Array();


	var gridSelectedRowArray = new Array();
	qualifierPackageId = 0;
	qualifierPackageName = '';
	qualifierPackageVersion = '';
	qualifierPackageIsDAEnabled = false;

	//function for move element in Array
	Array.prototype.moveUp = function (value) {
		var index = this.indexOf(value),
			newPos = index - 1;

		if (index === -1)
			throw new Error("Element not found in array");

		this.splice(index, 1);
		if (index === 0)
			newPos = this.length;
		this.splice(newPos, 0, value);
	};

	Array.prototype.moveDown = function (value) {
		var index = this.indexOf(value),
			newPos = index + 1;

		if (index === -1)
			throw new Error("Element not found in array");

		this.splice(index, 1);
		if (index >= this.length)
			newPos = 0;
		this.splice(newPos, 0, value);
	};
	///

	return function UserProfileViewModel() {
		var initialAttributeData = [];
		var config = {
			'.chosen-select': {},
			'.chosen-select-deselect': { allow_single_deselect: true },
			'.chosen-select-no-single': { disable_search_threshold: 10 },
			'.chosen-select-no-results': { no_results_text: 'Oops, nothing found!' },
			'.chosen-select-width': { width: "95%" },
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

		//Enable buttons
		$("#btnForMoveleft").addClass('disabled');
		$("#btnForMoveRight").addClass('disabled');
		$("#moveUpBtn").addClass('disabled');
		$("#moveDownBtn").addClass('disabled');

		self.packageData = ko.observableArray();
		self.ReferenceSetModels = ko.observableArray();
		self.modelData = ko.observableArray();
		self.checksample = ko.observable();
		self.observableModelPopup = ko.observable();
		self.observableModelPopupParentViewEditRef = ko.observable();
		self.templateFlag = ko.observable(false);
		self.accordionPanel = ko.observable('Packages');
		if (!_.isEmpty(globalVariableForEditReferenceSet) && globalVariableForEditReferenceSet.length > 0) {
			self.referenceNameValue = globalVariableForEditReferenceSet[0].selectedReferenceSetName;
			self.referenceSetId = globalVariableForEditReferenceSet[0].selectedReferenceSetId;
			self.isLocked = globalVariableForEditReferenceSet[0].selectedReferenceSetLockStatus;
			if (globalVariableForEditReferenceSet.isEditReferenceset && !globalVariableForEditReferenceSet[0].selectedReferenceSetLockStatus) {
				$("#btnSaveRFS").css('display', 'inline');
			}
			if (globalVariableForEditReferenceSet.isCopyReferenceset) {
				$("#btnCopyRFS").css('display', 'inline');
			}
		}
		
		self.movedArray = ko.observableArray();
		self.AttributeData = ko.observableArray();
		self.removeAttributeData = ko.observableArray();
		self.visibleAttDLL = ko.observable(false);
		self.allselectedpackagesSelected = ko.observable(false);
		self.checkTxtAttrval = ko.observable();
		self.checkTxtAttrval.subscribe(function (newValue) {
			if (newValue) {
				$("#btnCopyRFS").removeAttr('disabled');
				$('#btnSaveRFS').removeAttr('disabled');
			}
		});
		self.referencsetTabs = ko.observableArray(['generalContent', 'operationsContent', 'modelsContent', 'deviceAttributesContent']);
		self.breadCrumbReferenceSet = ko.observableArray(referencesetContainers);
		self.presentTab = ko.observable('generalContent');
		self.previousTab = ko.observable('');
		self.nextTab = ko.observable('operationsContent');
		self.statusChk = ko.observable(false);
		self.isRFSTemplateLockEnabled = ko.observable(referenceSetParameterTemplateLock);
		self.referenceDescription = ko.observable();
		self.referenceSetEnabledCheckbox = ko.observable(false);
		self.keysData = ko.observableArray();
		self.rightKeyData = ko.observableArray();
		self.allmovedkeysSelected = ko.observable(false);
		self.parentReferenceSetName = ko.observable('');
		self.parentReferenceSets = ko.observableArray();
		self.parentReferenceSetsOption = ko.observable();
		self.parentReferenceSetsArray = ko.observableArray();
		self.selectedParentReferenceSet = ko.observable();
		self.selectedPackages = ko.observableArray([]);

		isAdpopup = 'open';
		var modelname = 'unloadTemplate';
		loadelement(modelname, 'genericPopup');
		isKeysDataLoaded = false;
		globalAdvancedOptionsApplications = [];
		var referenceSetModels = new Array();
		var parentReferenceSet = new Object();
		parentReferenceSetId = 0;

		self.openPopup = function (popupName, gId) {
			self.templateFlag(true);
			if (popupName == "modelViewParentDownloadLibrary") {
				loadelement(popupName, 'genericPopup');
				$('#editreferenceSetParentViewModel').modal('show');
			} else if (popupName === "modalPackageDownloadQualifiers") {
				globalSelectedReferenceSet = new Object();
				loadelement(popupName, 'referenceSets');
				$('#editreferenceSetParentViewModel').modal('show');
			}
		}
		self.unloadTempPopup = function (popupName) {
			self.observableModelPopupParentViewEditRef('unloadTemplate');
			$('#editreferenceSetParentViewModel').modal('hide');
			checkIsPopUpOPen();
		}

		//-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
		$('#forceEditReferenceSetConfirmation').on('shown.bs.modal', function (e) {
			$('#setRefereceSetModel_No').focus();

		});
		$('#forceEditReferenceSetConfirmation').keydown(function (e) {
			if ($('#setRefereceSetModel_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#setRefereceSetModel_Yes').focus();
			}
		});

		$('#editReferenceSetConfo').on('shown.bs.modal', function (e) {
			$('#editReferenceSetConfo_No').focus();

		});
		$('#editReferenceSetConfo').keydown(function (e) {
			if ($('#editReferenceSetConfo_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#editReferenceSetConfo_Yes').focus();
			}
		});
		//------------------------------------------------------------------------------------------------------------------------


		///  Draggable function
		$('#mdlEdtRefSetHeader').mouseup(function () {
			$("#mdlEdtRefSet").draggable({ disabled: true });
		});

		$('#mdlEdtRefSetHeader').mousedown(function () {
			$("#mdlEdtRefSet").draggable({ disabled: false });
		});
		////////////////

		init();
		function init() {
			setScreenControls(AppConstants.get('EDIT_REFERENCE_SET'));
			initialAttributeData = deviceAttributesDataReferenceSets;
			$('#btnNextEditRFS').addClass('disabled');			
			if (_.isEmpty(deviceAttributesDataReferenceSets)) {
				getDeviceAttributes(AppConstants.get('REFERENCE_SET_ATTRIBUTES'), getDeviceAttributesCallback);
			} else {
				packagesGridModel(self.packageData, self.ReferenceSetModels, self.parentReferenceSetsOption, self.openPopup);
			}
			getParentReferenceSets(self.parentReferenceSets);
		}

		function getDeviceAttributesCallback() {
			packagesGridModel(self.packageData, self.ReferenceSetModels, self.parentReferenceSetsOption, self.openPopup);
		}

		function getParentReferenceSets(parentReferenceSets) {
			var getParentReferenceSetReq = new Object();
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
			ColumnSortFilter.GridId = 'ParentReferenceSet';

			getParentReferenceSetReq.Pagination = Pagination;
			getParentReferenceSetReq.ColumnSortFilter = ColumnSortFilter;
			getParentReferenceSetReq.Export = Export;
			getParentReferenceSetReq.Selector = Selector;

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.getParentReferenceSetResp) {
							data.getParentReferenceSetResp = $.parseJSON(data.getParentReferenceSetResp);
							parentReferenceSets(data.getParentReferenceSetResp.ParentReferenceSets);
							if (!_.isEmpty(parentReferenceSets()) && parentReferenceSets().length > 0 && parentReferenceSetId > 0) {
								setParentReferenceSet();
							}
						}
					}
				}
			}

			var method = 'GetParentReferenceSet';
			var params = '{"token":"' + TOKEN() + '","getParentReferenceSetReq":' + JSON.stringify(getParentReferenceSetReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		self.onChangeParentReferenceSet = function () {
			if ($("#ddlParentReferenceSetsEdit").find('option:selected').text() == "") {
				self.parentReferenceSetsOption(null);
			} else {
				self.parentReferenceSetsOption($("#ddlParentReferenceSetsEdit").find('option:selected').text());
				var sourceParentReferenceSet = _.where(self.parentReferenceSets(), { Name: self.parentReferenceSetsOption() });
				if (!_.isEmpty(sourceParentReferenceSet) && sourceParentReferenceSet.length > 0) {

					parentReferenceSet = new Object();
					parentReferenceSet.ID = sourceParentReferenceSet[0].ID;
					self.selectedParentReferenceSet(parentReferenceSet);
					$("#btnSaveRFS").removeAttr('disabled');
				}
			}
		}

		self.onChangeTab = function (id) {
			if (id && id != '') {
				$('#operationsContent').removeClass('hide');
				$('#modelsContent').removeClass('hide');
				$('#deviceAttributesContent').removeClass('hide');
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
					self.showCompsInGeneralTab(id);
				} else if (id == 'operationsContent') {
					self.showCompsInOperationsTab(id);
				} else if (id == 'modelsContent') {
					self.showCompsInModelsTab(id);
				} else if (id == 'deviceAttributesContent') {
					self.showCompsInAttributesTab(id);
				}
				// Show the current tab, and add an "active" class to the button that opened the tab
				document.getElementById(id).style.display = "block";
				document.getElementById(id + 'Tab').className += " active";
			}
		}
		self.updatebreadCrumb = function (id) {
			for (var i in self.breadCrumbReferenceSet()) {
				if (self.breadCrumbReferenceSet()[i].id == id) {
					$('#' + id).addClass('activateBreadcrumb');
					self.breadCrumbReferenceSet()[i].isActive = true;
				} else {
					self.breadCrumbReferenceSet()[i].isActive = false;
					$('#' + self.breadCrumbReferenceSet()[i].id).removeClass('activateBreadcrumb');
				}
			}
		}
		self.showCompsInGeneralTab = function (id) {
			$('#btnCopyRFS').addClass('hide');
			$('#btnNextEditRFS').removeClass('disabled');
			$('#btnNextEditRFS').removeClass('hide');
			$('#btnBackEditRFS').addClass('hide');
			self.presentTab('generalContent');
			self.updatebreadCrumb('generalBreadCrumb');
			self.previousTab('');
			self.nextTab('operationsContent');
		}
		self.showCompsInOperationsTab = function (id) {
			$('#btnCopyRFS').addClass('hide');
			$('#btnNextEditRFS').removeClass('disabled');
			$('#btnNextEditRFS').removeClass('hide');
			$('#btnBackEditRFS').removeClass('hide');
			self.presentTab('operationsContent');
			self.updatebreadCrumb('operationsBreadCrumb');
			self.previousTab('generalContent');
			self.nextTab('modelsContent');
		}
		self.showCompsInModelsTab = function (id) {
			$('#btnCopyRFS').removeClass('hide');
			$('#btnCopyRFS').removeClass('disabled');
			$('#btnBackEditRFS').removeClass('hide');
			self.presentTab('modelsContent');
			self.updatebreadCrumb('modelsBreadCrumb');
			self.previousTab('operationsContent');
			if (licenseSource.isAutoDownloadsLicensed) {
				$('#btnNextEditRFS').removeClass('hide');
				$('#btnNextEditRFS').removeClass('disabled');
				self.nextTab('deviceAttributesContent');
			} else if (licenseSource.isBasicReferenceSetLicensed) {
				$('#btnNextEditRFS').addClass('hide');
				self.nextTab('');
			}
		}
		self.showCompsInAttributesTab = function (id) {
			$('#btnCopyRFS').removeClass('hide');
			$('#btnNextEditRFS').addClass('hide');
			$('#btnBackEditRFS').removeClass('hide');
			self.presentTab('deviceAttributesContent');
			self.updatebreadCrumb('deviceAttributesBreadCrumb');
			self.previousTab('modelsContent');
			self.nextTab('');
		}

		//--change collpase and expand icon------        
		function toggleAccordian(e) {
			$(e.target)
				.prev('.panel-heading')
				.find("i.indicator")
				.toggleClass('icon-angle-down icon-angle-up');
			if (!isKeysDataLoaded && e.target.id == "PKcollapseTwo") {
				keysGridModel(self.keysData, self.openPopup, self.movedArray);
			}
			if (e.target.className.indexOf('collapse in') == -1) {
				if (e.target.id == 'PKcollapseOne') {
					$('#AccordionKeys').click();
					self.accordionPanel('Keys');
					if (self.keysData().length > 0) {
						$("#btnForAllMoveright").removeClass('disabled');
					} else {
						$("#btnForAllMoveright").addClass('disabled');
					}
					$("#jqxgridAvailableKeys").jqxGrid({ width: keysGridWidth + 19 });
				} else {
					$('#AccordionPackages').click();
					self.accordionPanel('Packages');
					if (self.packageData().length > 0) {
						$("#btnForAllMoveright").removeClass('disabled');
					} else {
						$("#btnForAllMoveright").addClass('disabled');
					}
				}
			}
		}
		$('#accordionPackageandKeys').on('hidden.bs.collapse', toggleAccordian);
		$('#accordionPackageandKeys').on('shown.bs.collapse', toggleAccordian);

		self.backToPrevious = function () {
			self.onChangeTab(self.previousTab());
		}

		function setModelsSelection(modelsArr) {
			var allModels = koUtil.rootmodels;
			if (modelsArr.length > 0) {
				for (var i = 0; i < allModels.length; i++) {
					var modelSelected = _.where(modelsArr, { ModelId: allModels[i].ModelId });
					if (modelSelected.length > 0) {
						allModels[i].IsSelected = true;
					} else {
						allModels[i].IsSelected = false;
					}
				}
				self.modelData(allModels);
			} else {
				for (var i = 0; i < allModels.length; i++) {
					allModels[i].IsSelected = false;
				}
				self.modelData(allModels);
			}
		}
		self.moveToNext = function () {
			if (self.nextTab() == 'operationsContent') {
				if (globalVariableForEditReferenceSet.isCopyReferenceset && $('#referenceName').val().trim() == '' && $('#referenceName').val().trim().length <= 0) {
					self.referenceName(' ');
				} else {
					self.onChangeTab(self.nextTab());
				}
			} else if (self.nextTab() == 'modelsContent') {
				if (self.movedArray().length <= 0) {
					openAlertpopup(1, 'select_the_packages_or_keys');
				} else {
					var keysSelected = _.where(self.movedArray(), { Type: AppConstants.get('Assignment_Key') });
					if (keysSelected.length != self.movedArray().length) {
						if (self.modelData().length <= 0) {
							openAlertpopup(2, 'Common_Models_Does_Not_Exist');
						} else {
							self.onChangeTab(self.nextTab());
						}
					} else if (keysSelected.length == self.movedArray().length) {
						var allModels = koUtil.rootmodels;
						//for (var i = 0; i < allModels.length; i++) {
						//    allModels[i].IsSelected = false;
						//}
						self.modelData(allModels);
						self.onChangeTab(self.nextTab());
					}
				}

			} else {
				self.onChangeTab(self.nextTab());
			}
		}

		///Close popup of Application
		self.closeApplicationView = function () {
			$("#childApplicationView").modal('hide');
		}

		self.showAttDLL = function () {
			self.visibleAttDLL(true);
		}

		self.referenceName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_enter_RS_name', {
					lng: lang
				})
			}
		});

		$("#referenceName").on("keypress keyup paste", function (e) {
			var textMax = 50;
			var textLength = $('#referenceName').val().length;
			var textRemaining = textMax - textLength;
		});

		self.closeAppView = function () {
			$("#ApplicationView").modal('hide');
			if (isAdpopup != '') {
				$("#mainPageBody").addClass('modal-open-appendon');
			} else {
				$("#mainPageBody").removeClass('modal-open-appendon');
			}
		}

		$('#referenceName').keyup(function () {
			var yourInput = $(this).val();
			re = /[`~!#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
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

		//reset Functionality

		self.clearfilterApplication = function (gId) {
			clearUiGridFilter(gId);

		}
		//Export To Excel
		self.exportToExcelApplication = function (gId) {
			var dataInfo = $("#" + gId).jqxGrid('getdatainformation');
			if (dataInfo.rowscount <= 0) {
				openAlertpopup(1, 'no_data_to_export');
			} else {
				$("#loadingDiv").show();
				exportjqxcsvData(gId, 'Applications');
				openAlertpopup(1, 'export_Information');
				$("#loadingDiv").hide();
			}
		}

		///GetReferenceSetId initially
		function getReferenceSetId(packagesArr, deviceAttributeArr, modelsArr, statusStr, referenceSetIdValue, packageData, ReferenceSetModels, parentReferenceSetsOption) {
			var referenceSetId = self.referenceSetId;
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.referenceSetdetails)
						data.referenceSetdetails = $.parseJSON(data.referenceSetdetails);

					if (!_.isEmpty(data.referenceSetdetails)) {
						parentReferenceSetId = data.referenceSetdetails.ParentReferenceSetId;
						if (!_.isEmpty(self.parentReferenceSets()) && self.parentReferenceSets().length > 0 && parentReferenceSetId > 0) {
							setParentReferenceSet();
						}

						if (data.referenceSetdetails.Packages) {
							packagesArr = data.referenceSetdetails.Packages;
							backUpPackagesArray = data.referenceSetdetails.Packages;
						} else {
							packagesArr = [];
						}

						if (data.referenceSetdetails.Keys && data.referenceSetdetails.Keys != '') {
							keysArr = [];
							backUpKeysArray = [];
							for (var l = 0; l < data.referenceSetdetails.Keys.length; l++) {
								var keyObj = new Object();
								keyObj.packageSelected = false;
								keyObj.Type = AppConstants.get('Assignment_Key');
								var KeyType = data.referenceSetdetails.Keys[l].KeyType;
								if (!KeyType || KeyType == null || KeyType == undefined) {
									KeyType = '';
								}
								var Destination = data.referenceSetdetails.Keys[l].Destination;
								if (!Destination || Destination == null || Destination == undefined) {
									Destination = '';
								}
								keyObj.Details = "Name: " + data.referenceSetdetails.Keys[l].Name + ' , Key Type: ' + KeyType + ' , Destination: ' + Destination;
								keyObj.KeyHandleId = data.referenceSetdetails.Keys[l].KeyHandleId;
								keyObj.Name = data.referenceSetdetails.Keys[l].Name;
								keyObj.KeyType = data.referenceSetdetails.Keys[l].KeyType;
								keyObj.Sequence = data.referenceSetdetails.Keys[l].Sequence;
								keyObj.Destination = data.referenceSetdetails.Keys[l].Destination;
								keyObj.VrkCustomerid = data.referenceSetdetails.Keys[l].VrkCustomerid;
								keysArr.push(keyObj);
							}
							backUpKeysArray = data.referenceSetdetails.Keys;
						} else {
							keysArr = [];
							backUpKeysArray = [];
						}

						var initialAttributeData = setDeviceSearchAttributes();
						if (!_.isEmpty(initialAttributeData)) {
							for (var j = 0; j < initialAttributeData.length; j++) {
								self.AttributeData().push(initialAttributeData[j]);
							}
						}

						if (!_.isEmpty(self.AttributeData)) {
							self.AttributeData.sort(function (a, b) { return a.DisplayName > b.DisplayName ? 1 : -1; });
						}
						if (data.referenceSetdetails.ReferenceSetDeviceAttributes) {

							deviceAttributeArr = data.referenceSetdetails.ReferenceSetDeviceAttributes;
							backUpDeviceAttributeArr = data.referenceSetdetails.ReferenceSetDeviceAttributes;


							for (var i = 0; i < deviceAttributeArr.length; i++) {

								var arr = self.AttributeData();
								var selectedsource = _.where(initialAttributeData, { AttributeName: deviceAttributeArr[i].DeviceSearchAttributeName });

								var ControlType = true;
								if (!_.isEmpty(selectedsource)) {
									if (selectedsource[0].ControlType == 'MultiCombo') {
										ControlType = true;
									} else if (selectedsource[0].ControlType == 'TextBox') {
										ControlType = false;
									}
									if (selectedsource[0].IsMultiUse == false) {
										self.AttributeData.remove(selectedsource[0]);
										self.removeAttributeData.push(selectedsource[0]);
									}
									var IsMultifield = false;
									if (selectedsource[0].DisplayName == 'Application') {
										IsMultifield = true;
									}
									self.items.push({ name: selectedsource[0].AttributeName, ControlType: ControlType, deviceId: selectedsource[0].DeviceSearchAttributeOperators[0].DeviceSearchAttributesId, DeviceSearchAttributeOperators: selectedsource[0].DeviceSearchAttributeOperators, DisplayName: selectedsource[0].DisplayName, IsMultifield: IsMultifield });
								}
								$("#contorlId" + [i]).val(deviceAttributeArr[i].Operators).prop("selected", "selected");
								$("#contorlId" + [i]).trigger('chosen:updated');
								$("#txtAttrValue" + [i]).prop('value', deviceAttributeArr[i].Value);
								$("#txtAttrVersion" + [i]).prop('value', deviceAttributeArr[i].ValueOptional);

								//---------attribute which is presen in table list but not display in dropdown-----------
								var existArr = self.AttributeData();
								var selectedsourceedit = _.where(existArr, { AttributeName: deviceAttributeArr[i].DeviceSearchAttributeName });
								if (selectedsourceedit != '') {
									if (selectedsourceedit[0].IsMultiUse == false) {
										self.AttributeData.remove(selectedsourceedit[0]);
										self.removeAttributeData.push(selectedsourceedit[0]);
									}
								}
							}
						}
						if (data.referenceSetdetails.ReferenceSetModels) {
							modelsArr = data.referenceSetdetails.ReferenceSetModels;
							backUpModelsArr = data.referenceSetdetails.ReferenceSetModels;
						} else {
							modelsArr = [];
						}
						statusStr = data.referenceSetdetails.Status;
						backUpStatusStr = data.referenceSetdetails.Status;
						referenceSetIdValue = data.referenceSetdetails.ReferenceSetId;
						self.referenceDescription(data.referenceSetdetails.Description);
						SetDataForEdit(statusStr, packagesArr, keysArr, packageData, modelsArr);

					}
					$("#loadingDiv").hide();
				} else if (error) {
					modelData(null);
					$("#loadingDiv").hide();
				}
			}

			var method = 'GetReferenceSetByID';
			var params = '{"token":"' + TOKEN() + '","referenceSetId":' + referenceSetId + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
		}

		function setTooltipForAssignments(index, tooltipValue) {
			$("#typespan" + index).prop('title', tooltipValue);
			$("#detailspan" + index).prop('title', tooltipValue);
		}

		function SetDataForEdit(status, packagesArr, keysArr, packageData, modelsArr) {
			if ((packagesArr && packagesArr.length > 0) || (keysArr && keysArr.length > 0)) {
				var isPOS = false;
				var isTablet = false;
				var assignmentsArray = [];
				if (packagesArr.length > 0) {
					for (var i = 0; i < packagesArr.length; i++) {
						packagesArr[i].packageSelected = false;
						packagesArr[i].Type = AppConstants.get('Assignment_Package');
						packagesArr[i].Details = "Name: " + packagesArr[i].PackageName + ' , Version: ' + packagesArr[i].FileVersion + ' , Folder: ' + packagesArr[i].FolderName;
						packagesArr[i].isAllowed = licenseSource.isAutoDownloadsLicensed ? (rightSource.isAdvancedSoftwareManagementModifyAllowed ? true : false) : false;
						var selectedsource = _.where(self.packageData(), { "PackageName": packagesArr[i].PackageName });
						if (!_.isEmpty(selectedsource) && selectedsource.length === 1) {
							packagesArr[i].SponsorName = selectedsource[0].SponsorName;
							self.packageData.remove(selectedsource[0]);
						} else if (!_.isEmpty(selectedsource) && selectedsource.length > 1) {
							var selectedsourceFolder = _.where(selectedsource, { FolderId: packagesArr[i].FolderId });
							self.packageData.remove(selectedsourceFolder[0]);
						}
						assignmentsArray[packagesArr[i].Sequence - 1] = packagesArr[i];
						var component = packagesArr[i].Component;
						if (component == ENUM.get("POS_Android")) {
							isPOS = true;
							isTablet = true;
						}
						else if (component == ENUM.get("POS")) {
							isPOS = true;
						}
						else if (component == ENUM.get("Android")) {
							isTablet = true;
						}
					}

					$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
					//$("#jqxgridAvailablePackage").jqxGrid('clearselection');
				}
				if (keysArr.length > 0) {
					for (var i = 0; i < keysArr.length; i++) {
						keysArr[i].packageSelected = false;
						keysArr[i].Type = AppConstants.get('Assignment_Key');
						if (!keysArr[i].KeyType || keysArr[i].KeyType == null || keysArr[i].KeyType == undefined) {
							keysArr[i].KeyType = '';
						}
						if (!keysArr[i].Destination || keysArr[i].Destination == null || keysArr[i].Destination == undefined) {
							keysArr[i].Destination = '';
						}
						keysArr[i].Details = "Name: " + keysArr[i].Name + ' , Key type: ' + keysArr[i].KeyType + ' , Destination: ' + keysArr[i].Destination;
						keysArr[i].UniqueKeyId = keysArr[i].VrkCustomerid + '_' + keysArr[i].Name;
						keysArr[i].isAllowed = licenseSource.isAutoDownloadsLicensed ? (rightSource.isAdvancedSoftwareManagementModifyAllowed ? true : false) : false;
						assignmentsArray[keysArr[i].Sequence - 1] = keysArr[i];
						if (self.keysData().length > 0) {
							var selectedsource = _.where(self.keysData(), { KeyProfileId: keysArr[i].KeyProfileId });
							self.keysData.remove(selectedsource[0]);
						}
					}
					$("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
					//$("#jqxgridAvailableKeys").jqxGrid('clearselection');
				}
				if (assignmentsArray.length > 0) {
					self.movedArray(assignmentsArray);
				}
				for (var k = 0; k < self.movedArray().length; k++) {
					if (self.movedArray()[k].Type == AppConstants.get('Assignment_Package')) {
						var packeagetooltip = self.movedArray()[k].Details + '\n' + i18n.t('File_name', { lng: lang }) + ' : ' + self.movedArray()[k].FileName;
						setTooltipForAssignments(k, packeagetooltip);
					} else if (self.movedArray()[k].Type == AppConstants.get('Assignment_Key')) {
						var keytooltip = i18n.t('referenceSet_description', { lng: lang }) + ' : ' + self.movedArray()[k].Details;
						setTooltipForAssignments(k, keytooltip);
					}
				}
				if (isPOS && isTablet)
					koUtil.Component = ENUM.get("POS_Android");
				else if (isPOS)
					koUtil.Component = ENUM.get("POS");
				else if (isTablet)
					koUtil.Component = ENUM.get("Android");

				if (packagesArr.length > 0) {
					getModel(self.movedArray, self.modelData, true, koUtil.rootmodels, modelsArr, self.packageData, []);
				} else if (keysArr.length > 0) {
					setModelsSelection(modelsArr);
				}
				//change for bug not show all selected package fixed
				packagesArr = [];
				keysArr = [];
			}
			setStatus(status);
		}

		// reset filter
		self.clearfilter = function (gridID) {
			clearUiGridFilter(gridID);
			$('#' + gridID).jqxGrid('clearselection');
			$("#btnForMoveRight").addClass('disabled');
		}

		function setStatus(status) {
			if (status == "Active") {
				self.statusChk(true);
				statusStr = "Active";
			}
			else {
				self.statusChk(false);
				statusStr = "Inactive";
			}
		}

		function setParentReferenceSet() {
			var sourceParentReferenceSet = _.where(self.parentReferenceSets(), { ID: parentReferenceSetId });
			if (!_.isEmpty(sourceParentReferenceSet) && sourceParentReferenceSet.length > 0) {
				parentReferenceSet = new Object();
				parentReferenceSet.ID = sourceParentReferenceSet[0].ID;
				self.selectedParentReferenceSet(parentReferenceSet);
				$('#ddlParentReferenceSetsEdit').val(sourceParentReferenceSet[0].Name).prop("selected", "selected");
				$("#ddlParentReferenceSetsEdit").removeAttr('disabled').trigger('chosen:updated');
			} else {
				$('#ddlParentReferenceSetsEdit').val('-Select-').prop("selected", "selected");
				$('#ddlParentReferenceSetsEdit').trigger('chosen:updated');
			}
		}

		var itemsdata = [];
		self.items = ko.observableArray(itemsdata);
		self.selectedOption = ko.observable();
		self.selectedOption.subscribe(function (newValue) {
			if (newValue) {
				var retval = attributValidation(self.items());
				if (retval == null || retval == '') {
					var arr = self.AttributeData();

					var selectedsource = _.where(arr, { DisplayName: newValue });
					if (selectedsource.length > 0) {
						if (!selectedsource[0].IsMultiUse) {
							self.AttributeData.remove(selectedsource[0]);
							self.removeAttributeData.push(selectedsource[0]);
						}
						$('#deviceAttributDDL').val($('#deviceAttributDDL > option:first').val()).change();
						$('#deviceAttributDDL').trigger("chosen:updated");
						var IsMultifield = false;
						if (selectedsource[0].DisplayName == 'Application') {
							IsMultifield = true;
						}
						if (selectedsource[0].ControlType == 'MultiCombo') {
							self.items.push({ name: selectedsource[0].AttributeName, ControlType: true, deviceId: selectedsource[0].DeviceSearchAttributeOperators[0].DeviceSearchAttributesId, DeviceSearchAttributeOperators: selectedsource[0].DeviceSearchAttributeOperators, DisplayName: selectedsource[0].DisplayName, IsMultifield: IsMultifield });
						} else if (selectedsource[0].ControlType == 'TextBox') {

							self.items.push({ name: selectedsource[0].AttributeName, ControlType: false, deviceId: selectedsource[0].DeviceSearchAttributeOperators[0].DeviceSearchAttributesId, DeviceSearchAttributeOperators: selectedsource[0].DeviceSearchAttributeOperators, DisplayName: selectedsource[0].DisplayName, IsMultifield: IsMultifield });
						}
						var width = $("#deviceAttributDDL").parent().width();
						if (width == '160') {
							$("#deviceAttributDDL").parent().css("width", "161px");
						} else {
							$("#deviceAttributDDL").parent().css("width", "160px");
						}
					}
				} else {
					$('#deviceAttributDDL').val($('#deviceAttributDDL > option:first').val()).change();
					$('#deviceAttributDDL').trigger("chosen:updated");
					openAlertpopup(1, 'Please enter some value');
				}

			} else {

			}
			self.enableSaveButton();
		});

		self.removeItems = function (item) {
			self.items.remove(item);
			var iName = 'AttributeName';
			var selectedsource = _.where(self.removeAttributeData(), { AttributeName: item.name });
			if (selectedsource.length > 0) {
				self.removeAttributeData.remove(selectedsource[0]);
				self.AttributeData.push(selectedsource[0]);
			}
			var sotesArray = self.AttributeData();
			sotesArray.sort(function (a, b) { return a.AttributeName.toLowerCase() > b.AttributeName.toLowerCase() ? 1 : -1; });
			self.AttributeData(null);
			self.AttributeData(sotesArray);
			$("#btnSaveRFS").removeAttr('disabled');
			$("#btnCopyRFS").removeAttr('disabled');
		}

		self.addItem = function () {
			this.items.push({ name: "New item", operator: 'vhqnew' });
		};

		//checkerror
		function attributValidation(items) {
			var retval = '';
			if (items.length > 0) {
				var id = '#txtAttrValue' + (items.length - 1) + '';
				if ($(id).val() == null || $(id).val() == '') {
					retval = 'empty';
				} else {
					retval = '';
				}
				if (retval == 'empty' && items[items.length - 1].DisplayName == 'Application') {
					var id = '#txtAttrVersion' + (items.length - 1) + '';
					if ($(id).val() == null || $(id).val() == '') {
						retval = 'empty';
					} else {
						retval = '';
					}
				}

			}
			return retval;
		}

		function checkerror(chekVal) {
			var retval = '';
			if ($("#referenceName").val().trim() == "") {
				retval += 'reference name';
				self.referenceName(null);
				$("#please_enter_reference_set_name").show();
			}
			else {
				retval += '';
			}
			return retval;
		}

		function selectedList(movedArray) {
			var packageIdsList = new Array();
			var packageIdObj;
			for (var i = 0; i < movedArray.length; i++) {
				packageIdObj = new Object();
				packageIdObj.PackageId = movedArray[i].PackageId;
				packageIdObj.PackageName = movedArray[i].PackageName;
				packageIdObj.TotalRows = 0;
				packageIdsList.push(packageIdObj);
			}

			return packageIdsList;
		}


		function modelListFunction(selectedModelsEdit) {

			var referenceSetModels = new Array();
			for (j = 0; j < selectedModelsEdit.length; j++) {
				var obj = new Object();
				obj.ModelId = selectedModelsEdit[j].ModelId;
				obj.ModelName = selectedModelsEdit[j].ModelName;
				referenceSetModels.push(obj);
			}
			return referenceSetModels;
		}

		function attributeArrayClick(items, attributeData) {
			var attrList = new Array();
			var modelObj;
			for (var i = 0; i < items.length; i++) {
				modelObj = new Object();
				var id = "#attributeName" + [i];
				var attributeName = $(id).text();
				modelObj.AttributeId = items[i].deviceId;
				modelObj.AttributeName = items[i].name;
				modelObj.ComparsionOperator = $("#contorlId" + [i]).find('option:selected').text();//$("#attributeValue" + [i]).val();
				modelObj.AttributeValue = $("#txtAttrValue" + [i]).val();
				modelObj.AttributeValueOptional1 = $("#txtAttrVersion" + [i]).val();
				attrList.push(modelObj)
			}
			return attrList;
		}
		//Confirmation Pop pup Open
		self.saveEditReferenceset = function () {
			var arr = self.items();
			var flag = false;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].DisplayName == 'Application') {
					if ($("#txtAttrValue" + i).val().trim() != '' || $("#txtAttrVersion" + i).val().trim() != '') {
						flag = false;
					} else {
						flag = true;
						openAlertpopup(1, 'please_enter_attribute_val');
						return;
					}
				} else {
					if ($("#txtAttrValue" + i).val().trim() == '') {
						flag = true;
						openAlertpopup(1, 'please_enter_attribute_val');
						return;
					}
				}
			}
			$('#editReferenceSetConfo').modal('show');
		}
		//Confirmation Cancel
		self.cancelEditReferenceSetConfo = function () {
			$('#editReferenceSetConfo').modal('hide');
		}

		self.cancelForceEditReferenceSetConfirmation = function () {
			$('#forceEditReferenceSetConfirmation').modal('hide');
		}

		self.showWarning = function (observableModelPopup, gId) {
			if (self.movedArray().length <= 0) {
				openAlertpopup(1, 'select_the_packages_or_keys');
				return;
			}

			var selectedData = _.where(self.modelData(), { IsSelected: true });
			referenceSetModels = new Array();
			if (!_.isEmpty(selectedData) && selectedData.length > 0) {
				for (j = 0; j < selectedData.length; j++) {
					var obj = new Object();
					obj.ModelId = selectedData[j].ModelId;
					obj.ModelName = selectedData[j].ModelName;
					referenceSetModels.push(obj);
				}
			}
			if (referenceSetModels.length <= 0) {
				openAlertpopup(1, 'please_select_model');
				return;
			}

var attributesArray = self.items();
			if (!_.isEmpty(attributesArray) && attributesArray.length > 0) {
				for (var i = 0; i < attributesArray.length; i++) {
					if (attributesArray[i].DisplayName == 'Application') {
						if ($("#txtAttrValue" + i).val().trim() === '' && $("#txtAttrVersion" + i).val().trim() === '') {
							openAlertpopup(1, 'please_enter_attribute_val');
							return;
						}
					} else {
						if ($("#txtAttrValue" + i).val().trim() === '') {
							openAlertpopup(1, 'please_enter_attribute_val');
							return;
						}
					}
				}
			}

			var downloadAutomationDisabledPackages = _.where(self.movedArray(), { IsEnabledForAutomation: false });
			var advancedOptionsDADisabledPckages = new Array();
			var advancedOptionsDAEnabledPackages = new Array();
			var selectedPackagesArray = new Array();
			self.selectedPackages([]);

			//No Advance Options for any selected packages
			if (_.isEmpty(globalAdvancedOptionsApplications)) {
				if (!_.isEmpty(downloadAutomationDisabledPackages) && downloadAutomationDisabledPackages.length > 0) {
					selectedPackagesArray = getDownloadAutomationDisabledPackages(downloadAutomationDisabledPackages, self.selectedPackages());
					self.selectedPackages(selectedPackagesArray);
				}
			}

			//Advance Options for one of the selected packages
			else if (!_.isEmpty(globalAdvancedOptionsApplications) && globalAdvancedOptionsApplications.length > 0) {
				var isDADisabledPackages = _.where(globalAdvancedOptionsApplications, { IsEnabledForAutomation: false });
				var isDAEnabledPackages = _.where(globalAdvancedOptionsApplications, { IsEnabledForAutomation: true });

				//Download Automation Disabled Packages
				if (!_.isEmpty(isDADisabledPackages) && isDADisabledPackages.length > 0) {
					var nonConditionalPackages = _.where(isDADisabledPackages, { isConditionChecked: false });				//Additional Conditions
					if (!_.isEmpty(nonConditionalPackages) && nonConditionalPackages.length > 0) {
						advancedOptionsDADisabledPckages = nonConditionalPackages;
					}
				}

				//Download Automation Enabled Packages
				if (!_.isEmpty(isDAEnabledPackages) && isDAEnabledPackages.length > 0) {
					var isSyncDisabledPackages = _.where(globalAdvancedOptionsApplications, { IsSyncEnabled: false });
					if ((!_.isEmpty(isSyncDisabledPackages) && isSyncDisabledPackages.length > 0)) {
						var nonConditionalPackages = _.where(isSyncDisabledPackages, { isConditionChecked: false });		//Additional Conditions
						if (!_.isEmpty(nonConditionalPackages) && nonConditionalPackages.length > 0) {
							advancedOptionsDAEnabledPackages = nonConditionalPackages;
						}
					}
				}
				selectedPackagesArray = $.merge($.merge([], advancedOptionsDADisabledPckages), advancedOptionsDAEnabledPackages)
				self.selectedPackages(selectedPackagesArray);

				//Download Automation Disabled Packages not in Advanced Options
				if (!_.isEmpty(downloadAutomationDisabledPackages) && downloadAutomationDisabledPackages.length > 0) {
					selectedPackagesArray = getDownloadAutomationDisabledPackages(downloadAutomationDisabledPackages, self.selectedPackages());
					self.selectedPackages(selectedPackagesArray);
				}
			}

			if (licenseSource.isAutoDownloadsLicensed && !_.isEmpty(self.selectedPackages()) && self.selectedPackages().length > 0) {
				$("#editReferenceSetWarning").modal('show');
			} else {
				if (globalVariableForEditReferenceSet.isCopyReferenceset) {
					self.addReferenceSet(observableModelPopup, gId);
				} else {
					self.setReferenceSet(observableModelPopup, gId, false);
				}	
			}
		}

		function getDownloadAutomationDisabledPackages(downloadAutomationDisabledPackages, selectedPackages) {
			for (var i = 0; i < downloadAutomationDisabledPackages.length; i++) {
				var item = downloadAutomationDisabledPackages[i];
				var disabledPackages = _.where(globalAdvancedOptionsApplications, { PackageId: item.PackageId });
				var source = _.where(self.selectedPackages(), { PackageId: item.PackageId });
				if (_.isEmpty(disabledPackages) && _.isEmpty(source)) {
					var packageSource = new Object();
					packageSource.IsSyncEnabled = true;
					packageSource.IsMandatory = false;
					packageSource.PostInstallAction = 'Default';
					packageSource.Qualifiers = [];
					packageSource.isConditionChecked = false;
					packageSource.PackageId = item.PackageId;
					packageSource.PackageName = item.PackageName;
					packageSource.FileVersion = item.FileVersion;
					packageSource.IsEnabledForAutomation = false;
					selectedPackages.push(packageSource);
				}
			}
			return selectedPackages;
		}

		self.cancelWarning = function () {
			$("#editReferenceSetWarning").modal('hide');
		}

		//Set reference on button click
		self.setReferenceSet = function (observableModelPopup, gridId, isContinue) {
			$('#editReferenceSetConfo').modal('hide');
			$("#editReferenceSetWarning").modal('hide');
			if ($("#statusCheckbox").is(':checked')) {
				statusActive = "Active";
			} else {
				statusActive = "Inactive";
			}
			var strCriteria = '';
			$("#itemTbody").find('tr').each(function (i) {

				strCriteria += $("#attributeName" + i).text() + ' ' + $("#contorlId" + i).find('option:selected').text() + ' ' + $("#txtAttrValue" + i).val() + ';';

			});
			var retval = checkerror();
			var referenceSetPackages = new Array();
			var referenceSetKeys = new Array();
			var movedArray = self.movedArray();
			var SponsorName = "";
			for (i = 0; i < movedArray.length; i++) {
				if (movedArray[i].Type == AppConstants.get('Assignment_Package')) {
					var packageLite = new Object();
					packageLite.PackageId = movedArray[i].PackageId;
					packageLite.FolderId = movedArray[i].FolderId;
					packageLite.Sequence = i + 1;
					packageLite.PackageName = movedArray[i].PackageName;
					if (movedArray[i].SponsorName && movedArray[i].SponsorName != '') {
						SponsorName = movedArray[i].SponsorName;
					}
					packageLite.SponsorName = SponsorName;
					var sourceDownloadOption = _.where(globalAdvancedOptionsApplications, { PackageId: movedArray[i].PackageId });
					if (!_.isEmpty(sourceDownloadOption) && sourceDownloadOption.length > 0) {
						packageLite.PackageDownloadOption = sourceDownloadOption[0];
					} else {
						packageLite.PackageDownloadOption = movedArray[i].PackageDownloadOption ? movedArray[i].PackageDownloadOption : [];
					}
					referenceSetPackages.push(packageLite);
				} else if (movedArray[i].Type == AppConstants.get('Assignment_Key')) {
					var KeyObj = new Object();
					KeyObj.VrkCustomerid = movedArray[i].VrkCustomerid;
					KeyObj.Destination = movedArray[i].Destination;
					KeyObj.KeyType = movedArray[i].KeyType;
					KeyObj.Name = movedArray[i].Name;
					KeyObj.Sequence = i + 1;
					referenceSetKeys.push(KeyObj);
				}
			}
			var selectedModelList = _.where(self.modelData(), { IsSelected: true });
			referenceSetModels = modelListFunction(selectedModelList);
			var attributeArray = attributeArrayClick(self.items(), self.AttributeData());
			//code logic for rsChangeType
			var isPackageandKeyChanged = false;
			var isCriteriaChanged = false;

			//checking package change
			var difference = $.grep(referenceSetPackages, function (x) {
				var duplicate = _.where(backUpPackagesArray, { PackageId: x.PackageId });
				if (duplicate == '') {
					return x;
				}
			})
			if (difference != '') {
				isPackageandKeyChanged = true;
			} else {
				var oppositedifference = $.grep(backUpPackagesArray, function (x) {
					var duplicate = _.where(referenceSetPackages, { PackageId: x.PackageId });
					if (duplicate == '') {
						return x;
					}
				})
				if (oppositedifference != '') {
					isPackageandKeyChanged = true;
				}
			}

			//checking keys changed
			var keydifference = $.grep(referenceSetKeys, function (x) {
				var duplicate = _.where(backUpKeysArray, { KeyProfileId: x.KeyProfileId });
				if (duplicate == '') {
					return x;
				}
			})
			if (keydifference != '') {
				isPackageandKeyChanged = true;
			} else {
				var oppositedifference = $.grep(backUpKeysArray, function (x) {
					var duplicate = _.where(referenceSetKeys, { KeyProfileId: x.KeyProfileId });
					if (duplicate == '') {
						return x;
					}
				})
				if (oppositedifference != '') {
					isPackageandKeyChanged = true;
				}
			}

			//checking model change
			var modelDifference = $.grep(referenceSetModels, function (x) {
				var duplicate = _.where(backUpModelsArr, { ModelId: x.ModelId });
				if (duplicate == '') {
					return x;
				}
			})
			if (modelDifference != '') {
				isCriteriaChanged = true;
			} else {
				var oppositemodelDifference = $.grep(backUpModelsArr, function (x) {
					var duplicate = _.where(referenceSetModels, { ModelId: x.ModelId });
					if (duplicate == '') {
						return x;
					}
				})
				if (oppositemodelDifference != '') {
					isCriteriaChanged = true;
				}
			}

			//checking device attribute change
			if (isCriteriaChanged == false) {
				var attributeDifference = $.grep(attributeArray, function (x) {
					var duplicate = _.where(backUpDeviceAttributeArr, { DeviceSearchAttributesId: x.AttributeId });
					if (duplicate == '') {
						return x;
					}
				})
				if (attributeDifference != '') {
					isCriteriaChanged = true;
				} else {
					var oppositeattributeDifference = $.grep(backUpDeviceAttributeArr, function (x) {
						var duplicate = _.where(attributeArray, { AttributeId: x.DeviceSearchAttributesId });
						if (duplicate == '') {
							return x;
						}
					})
					if (oppositeattributeDifference != '') {
						isCriteriaChanged = true;
					}
				}
			}

			//checking reference set status change
			if (isCriteriaChanged == false) {
				if (statusActive != backUpStatusStr) {
					isCriteriaChanged = true;
				}
			}

			var referenceSet = new Object();
			referenceSet.Name = $("#referenceNameEdit").val();
			referenceSet.Criteria = strCriteria;
			referenceSet.Status = statusActive;
			referenceSet.ReferenceSetId = self.referenceSetId;
			referenceSet.SponsorName = SponsorName;
			referenceSet.Description = self.referenceDescription();
			deviceAttributes = attributeArray;

			//code logic for rsChangeType
			if (isPackageandKeyChanged && !isCriteriaChanged) {
				rSChangeType = ENUM.get('RS_PACKAGE');
			}
			else if (!isPackageandKeyChanged && isCriteriaChanged) {
				rSChangeType = ENUM.get('RS_CRITERIA');
			}
			else if (isPackageandKeyChanged && isCriteriaChanged) {
				rSChangeType = ENUM.get('RS_BOTH');
			}
			else {
				rSChangeType = ENUM.get('RS_NONE');
			}

			//var isContinue = false;
			if (self.selectedParentReferenceSet()) {
				parentReferenceSet = self.selectedParentReferenceSet();
			}

			var callBackfunction = function (data, error) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					openAlertpopup(0, 'ReferenceSetSaved');
					gridFilterClear(gridId);
					observableModelPopup('unloadTemplate');
					$("#mainPageBody").removeClass('modal-open-appendon');
					isAdpopup = '';
					$('#addReference').modal('hide');
					globalAdvancedOptionsApplications = [];
				} else if (data.responseStatus.StatusCode == AppConstants.get('REFERENCE_SET_NAME_ALREADY_EXISTS')) {
					openAlertpopup(2, 'ReferenceSetDuplicate');
				} else if (data.responseStatus.StatusCode == AppConstants.get('ASSOCIATED_REFERNCE_SET_CANNOT_BE_INACTIVATED')) {
					openAlertpopup(2, 'ReferenceSetCantInactive');
				} else if (data.responseStatus.StatusCode == AppConstants.get('CONFLICTS_IN_PACKAGE_FILE_TYPE')) {
					openAlertpopup(2, 'RefConflictFiletype');
				} else if (data.responseStatus.StatusCode == AppConstants.get('SQL_INJECTION_ERROR')) {
					openAlertpopup(2, 'sql_injection_error');
				} else if (data.responseStatus.StatusCode == AppConstants.get('CONFLICTS_IN_PACKAGES')) {
					var packageStr = '';
					if (data.assignSoftwareToDevicesResp && data.assignSoftwareToDevicesResp.PackageNames && data.assignSoftwareToDevicesResp.PackageNames.length > 0) {
						var arrayPackages = new Array();
						for (var i = 0; i < data.assignSoftwareToDevicesResp.PackageNames.length; i++) {
							arrayPackages.push(data.assignSoftwareToDevicesResp.PackageNames[i]);
							packageStr += data.assignSoftwareToDevicesResp.PackageNames[i] + ", ";
						}
						packageStr = packageStr.trim();
						packageStr = packageStr.slice(0, -1);
					}
					var applicationStr = '';
					if (data.assignSoftwareToDevicesResp && data.assignSoftwareToDevicesResp.ApplicationNames && data.assignSoftwareToDevicesResp.ApplicationNames.length > 0) {
						var arrayApplications = new Array();
						for (var j = 0; j < data.assignSoftwareToDevicesResp.ApplicationNames.length; j++) {
							arrayApplications.push(data.assignSoftwareToDevicesResp.ApplicationNames[j]);
							applicationStr += data.assignSoftwareToDevicesResp.ApplicationNames[j] + ", ";
						}
						applicationStr = applicationStr.trim();
						applicationStr = applicationStr.slice(0, -1);
					}

					message = "Package (s) " + packageStr + " " + "share common application (s)" + " " + applicationStr + ".";
					openAlertpopup(2, message);

				} else if (data.responseStatus.StatusCode == AppConstants.get('REFERNCE_SET_ASSIGNED_TO_DEVICE_OF_MODEL')) {
					$('#forceEditReferenceSetConfirmation').modal('show');
				} else if (data.responseStatus.StatusCode == AppConstants.get('EX_MODEL_ALREADY_EXISTS_WITH_ANOTHER_REFERENCESET')) {				//414
					openAlertpopup(2, 'ex_model_already_exists_with_another_referenceset');
				}
			}

			var method = 'SetReferenceSet';
			var params = '{"token":"' + TOKEN() + '","referenceSet":' + JSON.stringify(referenceSet) + ',"parentReferenceSet": ' + JSON.stringify(parentReferenceSet) + ',"referenceSetPackages":' + JSON.stringify(referenceSetPackages) + ',"referenceSetKeys":' + JSON.stringify(referenceSetKeys) + ',"referenceSetModels":' + JSON.stringify(referenceSetModels) +
				',"deviceAttributes":' + JSON.stringify(deviceAttributes) + ',"RSChangeType":"' + rSChangeType + '","isContinue":"' + isContinue + '"}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}


		//Add reference on button click
		self.addReferenceSet = function (observableModelPopup, gId) {
			$("#editReferenceSetWarning").modal('hide');
			if ($("#statusCheckbox").is(':checked')) {
				statusActive = "Active";
			} else {
				statusActive = "Inactive";
			}
			var retval = checkerror();
			var selectedModelList = _.where(self.modelData(), { IsSelected: true });
			referenceSetModels = modelListFunction(selectedModelList);
			var attributeArray = attributeArrayClick(self.items(), self.AttributeData());
			var movedArray = self.movedArray();
			var referenceSetPackages = new Array();
			var referenceSetKeys = new Array();
			var SponsorName = "";
			for (i = 0; i < movedArray.length; i++) {
				if (movedArray[i].Type == AppConstants.get('Assignment_Package')) {
					var packageLite = new Object();
					packageLite.PackageId = movedArray[i].PackageId;
					packageLite.FolderId = movedArray[i].FolderId;
					packageLite.Sequence = i + 1;
					packageLite.PackageName = movedArray[i].PackageName;
					if (movedArray[i].SponsorName && movedArray[i].SponsorName != '') {
						SponsorName = movedArray[i].SponsorName;
					}
					packageLite.SponsorName = SponsorName;
					referenceSetPackages.push(packageLite);
				} else if (movedArray[i].Type == AppConstants.get('Assignment_Key')) {
					var KeyObj = new Object();
					KeyObj.VrkCustomerid = movedArray[i].VrkCustomerid;
					KeyObj.Destination = movedArray[i].Destination;
					KeyObj.KeyType = movedArray[i].KeyType;
					KeyObj.Name = movedArray[i].Name;
					KeyObj.Sequence = i + 1;
					referenceSetKeys.push(KeyObj);
				}
			}
			var strCriteria = '';
			$("#itemTbody").find('tr').each(function (i) {
				strCriteria += $("#attributeName" + i).text() + ' ' + $("#contorlId" + i).find('option:selected').text() + ' ' + $("#txtAttrValue" + i).val() + ';';
			});


			if (referenceSetPackages.length <= 0 && referenceSetKeys.length <= 0) {
				openAlertpopup(1, 'select_the_packages');
				return;
			}

			var arr = self.items();
			var flag = false;
			for (var i = 0; i < arr.length; i++) {
				if ($("#txtAttrValue" + i).val().trim() == '') {
					flag = true;
				}
			}
			if (flag == true) {
				openAlertpopup(1, 'please_enter_attribute_val');
				return;
			}

			if (retval == null || retval == "") {
				var addReferenceSetReq = new Object();
				var referenceSet = new Object();
				referenceSet.Name = $("#referenceName").val().trim();
				referenceSet.Criteria = strCriteria;
				referenceSet.SponsorName = SponsorName;
				referenceSet.Description = self.referenceDescription();
				deviceAttributes = attributeArray

				var callBackfunction = function (data, error) {
					if (data) {
						if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
							openAlertpopup(0, 'ReferenceSetadded');
							observableModelPopup('unloadTemplate');
							gridFilterClear(gId);

							$("#mainPageBody").removeClass('modal-open-appendon');
							isAdpopup = '';
							$('#addReference').modal('hide');
						} else if (data.responseStatus.StatusCode == AppConstants.get('REFERENCE_SET_NAME_ALREADY_EXISTS')) {
							openAlertpopup(2, 'ReferenceSetDuplicate');
							self.onChangeTab('generalContent');
						} else if (data.responseStatus.StatusCode == AppConstants.get('SQL_INJECTION_ERROR')) {
							openAlertpopup(2, 'sql_injection_error');
						} else if (data.responseStatus.StatusCode == AppConstants.get('CONFLICTS_IN_PACKAGE_FILE_TYPE')) {
							openAlertpopup(2, 'RefConflictFiletype');
							self.onChangeTab('operationsContent');
							self.modelData([]);
						} else if (data.responseStatus.StatusCode == AppConstants.get('EX_MODEL_ALREADY_EXISTS_WITH_ANOTHER_REFERENCESET')) {	//414
							openAlertpopup(2, 'ex_model_already_exists_with_another_referenceset');
						} else if (error) {
							self.modelData([]);
						}
					}
				}

				var method = 'AddReferenceSet';
				var params = '{"token":"' + TOKEN() + '","referenceSet":' + JSON.stringify(referenceSet) + ',"parentReferenceSet": ' + JSON.stringify(parentReferenceSet) + ',"referenceSetPackages":' + JSON.stringify(referenceSetPackages) + ',"referenceSetKeys":' + JSON.stringify(referenceSetKeys) + ',"referenceSetModels":' + JSON.stringify(referenceSetModels) + ',"deviceAttributes":' + JSON.stringify(deviceAttributes) + '}';
				ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
			}
		}

		//Swapping data functions

		$("#referenceDescription").on('change keyup paste', function () {
			self.enableSaveButton();
		});

		self.enableSaveButton = function () {
			$('#btnSaveRFS').removeAttr('disabled');
			$('#btnCopyRFS').removeAttr('disabled');
		}

		$("#referenceName").on('change keyup paste', function () {
			if ($("#referenceName").val().trim() != "") {
				$('#btnCopyRFS').removeAttr('disabled');
			}
		});


		self.activeChange = function () {
			$('#btnSaveRFS').removeAttr('disabled');
			$('#btnCopyRFS').removeAttr('disabled');

			if ($("#statusCheckbox").is(':checked')) {
				statusActive = "Active";
				return true;
			} else {
				statusActive = "Inactive";
				return false;
			}

		}
		self.modelChange = function (data, index) {
			$('#btnSaveRFS').removeAttr('disabled');
			$('#btnCopyRFS').removeAttr('disabled');
		}

		self.advancedOptions = function (data) {
			qualifierPackageId = data.PackageId;
			qualifierPackageName = data.PackageName;
			qualifierPackageVersion = data.FileVersion;
			qualifierPackageIsDAEnabled = data.IsEnabledForAutomation ? true : false;
			var packageSource = _.where(backUpPackagesArray, { PackageId: qualifierPackageId });
			var packageDownloadOptionSource = _.where(globalAdvancedOptionsApplications, { PackageId: qualifierPackageId });
			globalPackageDownloadOptions = [];
			if (!_.isEmpty(packageSource) && packageSource.length > 0 && _.isEmpty(packageDownloadOptionSource)) {
				globalPackageDownloadOptions = packageSource[0].PackageDownloadOption;
			} else if (!_.isEmpty(packageDownloadOptionSource) && packageDownloadOptionSource.length > 0) {
				globalPackageDownloadOptions = packageDownloadOptionSource[0];
			}
			self.openPopup('modalPackageDownloadQualifiers');
		}

		self.allPackagesMoveLeft = function () {
			var arr = self.movedArray();
			var keysExistInAssignment = false;
			if (arr.length > 0) {
				for (i = 0; i < arr.length; i++) {
					self.movedArray([]);
					arr[i].packageSelected = false;
					arr[i].isSelected = false;
					if (arr[i].Type == AppConstants.get('Assignment_Package')) {
						self.packageData.push(arr[i]);
					} else if (arr[i].Type == AppConstants.get('Assignment_Key')) {
						self.keysData.push(arr[i]);
						keysExistInAssignment = true;
					}
				}
			}

			$("#btnForMoveleft").addClass('disabled');
			$("#moveUpBtn").addClass('disabled');
			$("#moveDownBtn").addClass('disabled');
			$("#btnForMoveRight").removeClass('disabled');

			if (self.packageData().length > 0) {
				$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
				$("#jqxgridAvailablePackage").jqxGrid('clearselection');
			}
			if (!isKeysDataLoaded && keysExistInAssignment) {
				self.keysData([])
				keysGridModel(self.keysData, self.openPopup, self.movedArray);
			} else if (self.keysData().length > 0) {
				$("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
				$("#jqxgridAvailableKeys").jqxGrid('clearselection');
			}
			$("#btnForMoveRight").addClass('disabled');
			$("#btnForAllMoveright").removeClass('disabled');
			$("#btnForAllMoveleft").addClass('disabled');
			self.modelData([]);
			self.enableSaveButton();
			gridSelectedRowArray = [];
			selectedRowArrayForSwap = [];
			koUtil.Component = ENUM.get("POS");
		}

		self.allPackagesMoveRight = function () {
			if (self.accordionPanel() == 'Packages') {
				var arr = JSON.parse(JSON.stringify(self.packageData()));
				if (valdiateSponsorName(self.packageData()) == false) {
					openAlertpopup(1, 'no_common_sponsorname');
					return;
				}
				if (arr.length > 0) {
					for (i = 0; i < arr.length; i++) {
						var packageData = arr[i];
						packageData.packageSelected = false;
						packageData.isSelected = false;
						packageData.Type = AppConstants.get('Assignment_Package');
						packageData.Details = "Name: " + packageData.PackageName + ' , Version: ' + packageData.FileVersion + ' , Folder: ' + packageData.FolderName;
						packageData.isAllowed = licenseSource.isAutoDownloadsLicensed ? (rightSource.isAdvancedSoftwareManagementModifyAllowed ? true : false) : false;
						self.movedArray.push(packageData);
						var selectedsource = _.where(self.packageData(), { PackageName: arr[i].PackageName });
						self.packageData.remove(selectedsource[0]);
					}
					getModel(self.movedArray, self.modelData, 1, koUtil.rootmodels, modelsArr, self.packageData, gridSelectedRowArray);
					clearMultiSelectedData('jqxgridAvailablePackage');
					$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
					$("#jqxgridAvailablePackage").jqxGrid('clearselection');
				}
			} else if (self.accordionPanel() == 'Keys') {
				var keysarray = JSON.parse(JSON.stringify(self.keysData()));
				if (keysarray.length > 0) {
					for (i = 0; i < keysarray.length; i++) {
						var keysData = keysarray[i];
						keysData.packageSelected = false;
						keysData.isSelected = false;
						keysData.Type = AppConstants.get('Assignment_Key');
						if (!keysData.KeyType || keysData.KeyType == null || keysData.KeyType == undefined) {
							keysData.KeyType = '';
						}
						if (!keysData.Destination || keysData.Destination == null || keysData.Destination == undefined) {
							keysData.Destination = '';
						}
						keysData.Details = "Name: " + keysData.Name + ' , Key type: ' + keysData.KeyType + ' , Destination: ' + keysData.Destination;
						keysData.isAllowed = licenseSource.isAutoDownloadsLicensed ? (rightSource.isAdvancedSoftwareManagementModifyAllowed ? true : false) : false;
						self.movedArray.push(keysData);
						var selectedsource = _.where(self.keysData(), { KeyProfileId: parseInt(keysarray[i].KeyProfileId) });
						self.keysData.remove(selectedsource[0]);
					}
					clearMultiSelectedData('jqxgridAvailableKeys');
					$("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
					$("#jqxgridAvailableKeys").jqxGrid('clearselection');
				}
			}
			if (self.movedArray().length > 0) {
				$("#btnForAllMoveright").addClass('disabled');
				$("#btnForAllMoveleft").removeClass('disabled');
			}
			gridSelectedArryForSwap = [];
		}

		self.clearTablefilter = function (tableid) {
			clearCustomFilterInTable(tableid);
			if (isSelectedPaneFiltered) {
				clearSelectedPackagesPane();
				isSelectedPaneFiltered = false;
			}
		}

		self.customfilter = function (element, dataArray) {
			customTableFilter(element, dataArray, callBackOnCustomFilter);
		}

		function callBackOnCustomFilter(isFilterApplied) {
			if (isFilterApplied) {
				isSelectedPaneFiltered = true;
				clearSelectedPackagesPane();
			}
			else {
				if (isSelectedPaneFiltered)
					clearSelectedPackagesPane();

				isSelectedPaneFiltered = false;
			}
		}

		//Removing checked array and disbleing Up/Down arrows on Filter apply 
		function clearSelectedPackagesPane() {
			self.movedArray().forEach(function (element, index) {
				var id = '#selectedpackagecb' + index + '';
				$(id)[0].checked = false;
				element.actionSelected = false;
			});
			selectedRowArrayForSwap = [];
			//selectedDownloadsActionsContent = [];
			$("#btnForMoveleft").addClass('disabled');
			$("#moveUpBtn").addClass('disabled');
			$("#moveDownBtn").addClass('disabled');
		}
		self.SelectAllSelectedPackages = function () {
			var selectedpackages = self.movedArray();
			if ($('#selectallselectedpackages')[0].checked == true) {
				if (selectedpackages.length > 0) {
					$("#btnForMoveleft").removeClass('disabled');
					for (var i = 0; i < selectedpackages.length; i++) {
						selectedpackages[i].packageSelected = true;
						selectedRowArrayForSwap.push(selectedpackages[i]);
					}
				}
			} else {
				$("#btnForMoveleft").addClass('disabled');
				selectedRowArrayForSwap = [];
				for (var i = 0; i < selectedpackages.length; i++) {
					selectedpackages[i].packageSelected = false;
				}
			}

			$("#moveUpBtn").addClass('disabled');
			$("#moveDownBtn").addClass('disabled');
			self.movedArray([]);
			self.movedArray(selectedpackages);
		}
		function getSponsorName(selectedList) {
			var sponsorName = "";
			for (var i = 0; i < selectedList.length; i++) {
				if (selectedList[i].Type == AppConstants.get('Assignment_Package')) {
					if (selectedList[i].SponsorName && selectedList[i].SponsorName != '') {
						sponsorName = selectedList[i].SponsorName;
					}
				}
			}
			return sponsorName;
		}

		function valdiateSponsorName(packagelist) {
			var sponsorName = "";
			for (var i = 0; i < packagelist.length; i++) {
				if (packagelist[i].SponsorName && packagelist[i].SponsorName != '') {
					if (sponsorName != '' && sponsorName != packagelist[i].SponsorName) {
						return false;
					} else {
						sponsorName = packagelist[i].SponsorName;
					}
				}
			}
			return true;
		}
		self.rightPackages = function () {

			var referenceArr = self.movedArray();
			var configValue = maximumPackagesPerReferenceSet;
			var isPOS = false;
			var isTablet = false;
			gridSelectedRowArray = new Array();
			if (self.accordionPanel() == 'Packages') {
				var selectedData = getMultiSelectedData('jqxgridAvailablePackage');
				var selectedDataArray = getSelectedUniqueId('jqxgridAvailablePackage');
				for (k = 0; k < selectedDataArray.length; k++) {
					var SponsorName = '';
					if (self.movedArray().length > 0) {
						var duplicatePackage = _.where(self.movedArray(), { PackageId: selectedDataArray[k] });
						if (!_.isEmpty(duplicatePackage) && duplicatePackage.length > 0) {
							openAlertpopup(1, 'same_package_different_folder');
							continue;
						}
						SponsorName = getSponsorName(self.movedArray());
					} else if (gridSelectedRowArray.length > 0) {
						SponsorName = getSponsorName(gridSelectedRowArray);
					}

					var selectedsource = _.where(selectedData, { PackageId: selectedDataArray[k] });
					if ((!_.isEmpty(selectedsource) && selectedsource.length > 0) && SponsorName != '' && selectedsource[0].SponsorName != '' && (SponsorName != selectedsource[0].SponsorName)) {
						openAlertpopup(1, 'no_common_sponsorname');
						return;
					}

					var selectedRow = new Object();
					if (selectedsource && selectedsource.length > 0) {
						selectedRow.FileName = selectedsource[0].FileName;
						selectedRow.PackageId = selectedsource[0].PackageId;
						selectedRow.FolderId = selectedsource[0].FolderId;
						selectedRow.PackageName = selectedsource[0].PackageName;
						selectedRow.PackageMode = selectedsource[0].PackageMode;
						selectedRow.IsEnabledForAutomation = selectedsource[0].IsEnabledForAutomation;
						selectedRow.FileVersion = selectedsource[0].FileVersion;
						selectedRow.SponsorName = selectedsource[0].SponsorName;
						selectedRow.FolderName = selectedsource[0].FolderName;
						selectedRow.FolderId = selectedsource[0].FolderId;
						selectedRow.Type = AppConstants.get('Assignment_Package');
						selectedRow.Details = "Name: " + selectedsource[0].PackageName + ' , Version: ' + selectedsource[0].FileVersion + ' , Folder: ' + selectedsource[0].FolderName;
						selectedRow.Component = selectedsource[0].Component;
						gridSelectedRowArray.push(selectedRow);
					}
				}
			} else if (self.accordionPanel() == 'Keys') {
				var selectedKeyData = getMultiSelectedData('jqxgridAvailableKeys');
				var selectedKeyDataArray = getSelectedUniqueId('jqxgridAvailableKeys');
				for (k = 0; k < selectedKeyDataArray.length; k++) {
					var selectedkeysource = _.where(selectedKeyData, { KeyHandleId: selectedKeyDataArray[k] });
					var selectedRow = new Object();
					if (selectedkeysource.length > 0) {
						var keysData = selectedkeysource[0];
						keysData.packageSelected = false;
						keysData.IsSelected = false;
						keysData.Type = AppConstants.get('Assignment_Key');
						if (!keysData.KeyType || keysData.KeyType == null || keysData.KeyType == undefined) {
							keysData.KeyType = '';
						}
						if (!keysData.Destination || keysData.Destination == null || keysData.Destination == undefined) {
							keysData.Destination = '';
						}
						keysData.Details = "Name: " + keysData.Name + ' , Key Type: ' + keysData.KeyType + ' , Destination: ' + keysData.Destination;
						keysData.isAllowed = licenseSource.isAutoDownloadsLicensed ? (rightSource.isAdvancedSoftwareManagementModifyAllowed ? true : false) : false;
						gridSelectedRowArray.push(keysData);
					}
				}
			}

			if (gridSelectedRowArray.length > 0) {
				totalpackageassignment = gridSelectedRowArray.length + referenceArr.length;
				if (totalpackageassignment > configValue) {
					openAlertpopup(1, i18n.t('maximum_packages_for_device_reference_set', { maxSoftwareAssignment: configValue }, { lng: lang }));
				} else {
					var iskeysUpdated = false;
					for (var i = 0; i < gridSelectedRowArray.length; i++) {
						if (gridSelectedRowArray[i] != null) {
							gridSelectedRowArray[i].packageSelected = false;
							gridSelectedRowArray[i].isAllowed = licenseSource.isAutoDownloadsLicensed ? (rightSource.isAdvancedSoftwareManagementModifyAllowed ? true : false) : false;
							self.movedArray.push(gridSelectedRowArray[i]);
							if (gridSelectedRowArray[i].Type == AppConstants.get('Assignment_Key')) {
								var selectedkeysource = _.where(self.keysData(), { KeyProfileId: parseInt(gridSelectedRowArray[i].KeyProfileId) });
								self.keysData.remove(selectedkeysource[0]);
								iskeysUpdated = true;
							} else if (gridSelectedRowArray[i].Type == AppConstants.get('Assignment_Package')) {
								var selectedsource = _.where(self.packageData(), { PackageName: gridSelectedRowArray[i].PackageName });
								if (!_.isEmpty(selectedsource) && selectedsource.length === 1) {
									self.packageData.remove(selectedsource[0]);
								} else if (!_.isEmpty(selectedsource) && selectedsource.length > 1) {
									var selectedsourceFolder = _.where(selectedsource, { FolderId: gridSelectedRowArray[i].FolderId });
									self.packageData.remove(selectedsourceFolder[0]);
								}
							}
						}
					}
					if (self.accordionPanel() == 'Packages') {
						clearMultiSelectedData('jqxgridAvailablePackage');
						$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
						$("#jqxgridAvailablePackage").jqxGrid('clearselection');
						if (self.packageData().length <= 0) {
							$("#btnForAllMoveright").addClass('disabled');
						}
						getModel(self.movedArray, self.modelData, 1, koUtil.rootmodels, modelsArr, self.packageData, gridSelectedRowArray);
					}
					if (iskeysUpdated) {
						clearMultiSelectedData('jqxgridAvailableKeys');
						$("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
						$("#jqxgridAvailableKeys").jqxGrid('clearselection');
						if (self.keysData().length <= 0) {
							$("#btnForAllMoveright").addClass('disabled');
						}
					}
					if (self.movedArray().length > 0) {
						$("#btnForAllMoveleft").removeClass('disabled');
					}
					gridSelectedRowArray = [];
					$("#btnForMoveRight").addClass('disabled');
					if (isSelectedPaneFiltered) {
						clearCustomFilterInTable("selectpackagestable");
						clearSelectedPackagesPane();
						isSelectedPaneFiltered = false;
					}
					else {
						//To Enable/Disble the Up/Down Arrows----                    
						if (selectedRowArrayForSwap.length <= 0 || selectedRowArrayForSwap.length == self.movedArray().length) {
							$("#moveUpBtn").addClass('disabled');
							$("#moveDownBtn").addClass('disabled');
						} else {
							var lastIndex = self.movedArray().length - 1;
							$("#moveDownBtn").removeClass('disabled');
							enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#moveUpBtn", "#moveDownBtn");
						}
					}

					if (isRightPackagesClick == "No") {    //Selection row and State maintain In grid
						rowIndexForHighlighted = undefined;
					} else {
						rowIndexForHighlighted = rowIndexForHighlighted;
					}
					selectedHighlightedRowForGrid();  //Selection row and State maintain In grid

					for (var j = 0; j < self.movedArray().length; j++) {
						if (self.movedArray()[j].Type == AppConstants.get('Assignment_Package')) {
							var component = self.movedArray()[j].Component;
							var packeagetooltip = self.movedArray()[j].Details + '\n' + i18n.t('File_name', { lng: lang }) + ' : ' + self.movedArray()[j].FileName;
							setTooltipForAssignments(j, packeagetooltip);
							if (component == ENUM.get("POS_Android")) {
								isPOS = true;
								isTablet = true;
							}
							else if (component == ENUM.get("POS")) {
								isPOS = true;
							}
							else if (component == ENUM.get("Android")) {
								isTablet = true;
							}
						} else if (self.movedArray()[j].Type == AppConstants.get('Assignment_Key')) {
							var keytooltip = i18n.t('referenceSet_description', { lng: lang }) + ' : ' + self.movedArray()[j].Details;
							setTooltipForAssignments(j, keytooltip);
						}
					}
					if (isPOS && isTablet)
						koUtil.Component = ENUM.get("POS_Android");
					else if (isPOS)
						koUtil.Component = ENUM.get("POS");
					else if (isTablet)
						koUtil.Component = ENUM.get("Android");

					self.enableSaveButton();
				}
			} else if (_.isEmpty(selectedDataArray)) {
				openAlertpopup(1, 'please_selct_row');
			}
		}


		self.SelectSelectedPackageRow = function (data, index) {
			$("#tbodySelectedpack").children('tr').removeClass('refselection');
			$("#btnForMoveleft").removeClass('disabled');
			var id = '#selectedpackagecb' + index + '';
			if ($(id)[0].checked == true) {
				if (selectedRowArrayForSwap.length > 0) {
					for (var j = 0; j < selectedRowArrayForSwap.length; j++) {
						if (selectedRowArrayForSwap[j].Type == AppConstants.get('Assignment_Key')) {
							if (data.KeyHandleId == selectedRowArrayForSwap[j].KeyHandleId) {
								selectedRowArrayForSwap.splice(j, 1);
								break;
							}
						} else if (selectedRowArrayForSwap[j].Type == AppConstants.get('Assignment_Package')) {
							if (data.PackageId == selectedRowArrayForSwap[j].PackageId) {
								selectedRowArrayForSwap.splice(j, 1);
								break;
							}
						}

					}
				}
				data.SelectedArrayIndex = index;
				selectedRowArrayForSwap.push(data);
			} else {
				for (var i = 0; i < selectedRowArrayForSwap.length; i++) {
					if (selectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Key')) {
						if (data.KeyHandleId == selectedRowArrayForSwap[i].KeyHandleId) {
							selectedRowArrayForSwap.splice(i, 1);
						}
					} else if (selectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Package')) {
						if (data.PackageId == selectedRowArrayForSwap[i].PackageId) {
							selectedRowArrayForSwap.splice(i, 1);
						}
					}
				}
				if (selectedRowArrayForSwap.length == 0) {
					$("#btnForMoveleft").addClass('disabled');
				}
				//#Updating changed index into array "selectedRowArrayForSwap"
				var arr = self.movedArray();
				selectedRowArrayForSwap.forEach(function (element) {
					if (element.Type == AppConstants.get('Assignment_Key')) {
						element.SelectedArrayIndex = getArrayIndexForKey(arr, 'PackageId', element.PackageId);
					} else if (element.Type == AppConstants.get('Assignment_Package')) {
						element.SelectedArrayIndex = getArrayIndexForKey(arr, 'KeyHandleId', element.KeyHandleId);
					}
				});
			}

			rowIdForHighlightedForTable = index;
			if (isSelectedPaneFiltered || selectedRowArrayForSwap.length == 0 || (selectedRowArrayForSwap.length == self.movedArray().length)) {
				$("#moveUpBtn").addClass('disabled');
				$("#moveDownBtn").addClass('disabled');
				return;
			}

			//#Function call:----To Enable/Disble the Up/Down Arrows----
			var lastIndex = self.movedArray().length - 1;
			enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#moveUpBtn", "#moveDownBtn");
		}

		self.leftPackages = function () {

			if (selectedRowArrayForSwap.length > 0) {
				var isPOS = false;
				var isTablet = false;
				var isKeysUpdated = false;
				var isPackagesSelected = false;
				for (var i = 0; i < selectedRowArrayForSwap.length; i++) {
					selectedRowArrayForSwap[i].packageSelected = false;
					selectedRowArrayForSwap[i].isSelected = false;
					self.movedArray.remove(selectedRowArrayForSwap[i]);
					if (selectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Key')) {
						self.keysData.push(selectedRowArrayForSwap[i]);
						if (!isKeysDataLoaded) {
							self.keysData([])
							keysGridModel(self.keysData, self.openPopup, self.movedArray);
						}
						isKeysUpdated = true;
					} else if (selectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Package')) {
						self.packageData.push(selectedRowArrayForSwap[i]);
						isPackagesSelected = true;
					}
				}
				self.allselectedpackagesSelected(false);
				selectedRowArrayForSwap = [];
				gridSelectedRowArray = [];
				if (isPackagesSelected) {
					$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
					$("#jqxgridAvailablePackage").jqxGrid('clearselection');
					if (self.movedArray().length > 0) {
						var selectedsource = _.where(self.movedArray(), { Type: AppConstants.get('Assignment_Package') });
						if (selectedsource.length > 0) {
							getModel(self.movedArray, self.modelData, 0, koUtil.rootmodels, modelsArr, self.packageData, selectedRowArrayForSwap);
						}
					} else {
						self.modelData([]);
					}
				}

				if (isKeysUpdated) {
					$("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
					$("#jqxgridAvailableKeys").jqxGrid('clearselection');
				}

				$("#btnForMoveleft").addClass('disabled');
				$("#moveUpBtn").addClass('disabled');
				$("#moveDownBtn").addClass('disabled');

				if (isSelectedPaneFiltered) {
					clearCustomFilterInTable("selectpackagestable");
					clearSelectedPackagesPane();
					isSelectedPaneFiltered = false;
				}

				selectedHighlightedRowForGrid();

				for (var i = 0; i < self.movedArray().length; i++) {
					var component = self.movedArray()[i].Component;

					if (component == ENUM.get("POS_Android")) {
						isPOS = true;
						isTablet = true;
					}
					else if (component == ENUM.get("POS")) {
						isPOS = true;
					}
					else if (component == ENUM.get("Android")) {
						isTablet = true;
					}
				}

				if (isPOS && isTablet)
					koUtil.Component = ENUM.get("POS_Android");
				else if (isPOS)
					koUtil.Component = ENUM.get("POS");
				else if (isTablet)
					koUtil.Component = ENUM.get("Android");

			} else {
				openAlertpopup(1, 'please_selct_row');
			}
			self.enableSaveButton();
		}

		self.moveItemsUP = function () {
			if (selectedRowArrayForSwap.length > 0) {
				var arr = self.movedArray();

				//#Sorting the selected array for swap, based on moved array index
				var sortedselectedRowArrayForSwap = _.sortBy(selectedRowArrayForSwap, 'SelectedArrayIndex');

				for (var i = 0; i < sortedselectedRowArrayForSwap.length; i++) {
					var index = 0;
					if (sortedselectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Key')) {
						index = getArrayIndexForKey(arr, 'KeyHandleId', sortedselectedRowArrayForSwap[i].KeyHandleId);
					} else if (sortedselectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Package')) {
						index = getArrayIndexForKey(arr, 'PackageName', sortedselectedRowArrayForSwap[i].PackageName);
					}
					arr.moveUp(arr[index]);
					self.movedArray(arr);
				}

				//#Updating changed index into array "selectedRowArrayForSwap"
				selectedRowArrayForSwap.forEach(function (element) {
					if (element.Type == AppConstants.get('Assignment_Key')) {
						element.SelectedArrayIndex = getArrayIndexForKey(arr, 'KeyHandleId', element.KeyHandleId);
					} else if (element.Type == AppConstants.get('Assignment_Package')) {
						element.SelectedArrayIndex = getArrayIndexForKey(arr, 'PackageName', element.PackageName);
					}
				});

				//#Function call:----To Enable/Disble the Up/Down Arrows----
				var lastIndex = self.movedArray().length - 1;
				enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#moveUpBtn", "#moveDownBtn");
			}
			else {
				openAlertpopup(1, 'please_selct_row');
			}
			self.enableSaveButton();
		}
		self.moveItemsDown = function () {
			if (selectedRowArrayForSwap.length > 0) {
				var arr = self.movedArray();

				//#Sorting the selected array for swap, based on moved array index
				var sortedselectedRowArrayForSwap = _.sortBy(selectedRowArrayForSwap, 'SelectedArrayIndex');

				for (var i = sortedselectedRowArrayForSwap.length - 1; i >= 0; i--) {
					var index = 0;
					if (sortedselectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Key')) {
						index = getArrayIndexForKey(arr, 'KeyHandleId', sortedselectedRowArrayForSwap[i].KeyHandleId);
					} else if (sortedselectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Package')) {
						index = getArrayIndexForKey(arr, 'PackageName', sortedselectedRowArrayForSwap[i].PackageName);
					}
					arr.moveDown(arr[index]);
					self.movedArray(arr);
				}

				//#Updating changed index into array "selectedRowArrayForSwap"
				selectedRowArrayForSwap.forEach(function (element) {
					if (element.Type == AppConstants.get('Assignment_Key')) {
						element.SelectedArrayIndex = getArrayIndexForKey(arr, 'KeyHandleId', element.KeyHandleId);
					} else if (element.Type == AppConstants.get('Assignment_Package')) {
						element.SelectedArrayIndex = getArrayIndexForKey(arr, 'PackageName', element.PackageName);
					}
				});

				//#Function call:----To Enable/Disble the Up/Down Arrows----
				var lastIndex = self.movedArray().length - 1;
				enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#moveUpBtn", "#moveDownBtn");
			} else {
				openAlertpopup(1, 'please_selct_row');
			}
			self.enableSaveButton();
		}
		///

		function selectedHighlightedRowForGrid() {   //Selection row and State maintain In grid
			var datainformations = $("#jqxgridAvailablePackage").jqxGrid('getdatainformation');
			var rowscounts = datainformations.rowscount;

			if (rowscounts > 0) {
				//rowIndexForHighlighted = rowscounts + 1;
				if (rowIndexForHighlighted == rowscounts || rowIndexForHighlighted == undefined || rowIndexForHighlighted == -1) {
					// $('#jqxgridAvailablePackage').jqxGrid('selectrow', 0);
					$('#jqxgridAvailablePackage').jqxGrid('clearselection');
					gridSelectedDataForSwap = [];
				} else {
					$('#jqxgridAvailablePackage').jqxGrid('selectrow', rowIndexForHighlighted);

				}

			} else {
				$("#btnForMoveRight").addClass('disabled');
				rowIndexForHighlighted = undefined;
			}
		}

		function tableSelectedRow() {
			var arrayTableSelection = new Array();
			arrayTableSelection = self.movedArray();
			//$(rowIdForHighlightedForTable).addClass('refselection');
			if (self.movedArray().length == 0) {

			} else {

				if (rowIdForHighlightedForTable == self.movedArray().length || rowIdForHighlightedForTable == undefined) {
					if (rowIdForHighlightedForTable == self.movedArray().length) {
						$("#btnForMoveleft").addClass('disabled');
					}
				} else {
					var id = '#SelectPackrow' + rowIdForHighlightedForTable + '';
					$(id).addClass('refselection');
					selectedRowArrayForSwap.push(arrayTableSelection[rowIdForHighlightedForTable]);
				}
			}
		}

		function packagesGridModel(packageData, ReferenceSetModels, parentReferenceSetsOption, openPopup) {
			$("#loadingDiv").show();
			PackageType = 1;
			IsEnabledForAutomation = false;

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.packages && data.packages.length > 0) {
						data.packages = $.parseJSON(data.packages);

						for (var i = 0; i < data.packages.length; i++) {
							data.packages[i].FolderName = data.packages[i].Folder.FolderName;
							data.packages[i].FolderId = data.packages[i].Folder.FolderId;
						}
						packageData(data.packages);
						$("#btnForAllMoveright").removeClass('disabled');
						$("#btnForAllMoveright").prop("disabled", false);
					} else {
						packageData([]);
					}
					getReferenceSetId(packagesArr, deviceAttributeArr, modelsArr, statusStr, referenceSetIdValue, packageData(), ReferenceSetModels, parentReferenceSetsOption);
					AvailablePackageGrid(packageData(), 'jqxgridAvailablePackage', openPopup);
					$('#selectGeneralContentData').click();
				} else if (error) {
					packageData(null);
					$("#loadingDiv").hide();
				}
				$('#btnNextEditRFS').removeClass('disabled');
				$("#loadingDiv").hide();
			}

			var method = 'GetAllPackagesLite';
			var params = '{"token":"' + TOKEN() + '","PackageType":"' + PackageType + '","IsEnabledForAutomation":"' + IsEnabledForAutomation + '"}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
		}

		function AvailablePackageGrid(packageData, gID, openPopup) {
			var filterObj;
			var selectedArray = new Array();
			var selectedRowID;
			var HighlightedRowID;
			var rowsToColor = [];
			var RowID;
			var localData;
			var gridStorageArr = new Array();
			var gridStorageObj = new Object();
			gridStorageObj.checkAllFlag = 0;
			gridStorageObj.counter = 0;
			gridStorageObj.filterflage = 0;
			gridStorageObj.selectedDataArr = [];
			gridStorageObj.unSelectedDataArr = [];
			gridStorageObj.singlerowData = [];
			gridStorageObj.multiRowData = [];
			gridStorageObj.TotalSelectionCount = null;
			gridStorageObj.highlightedRow = null;
			gridStorageObj.highlightedPage = null;
			gridStorageArr.push(gridStorageObj);
			var gridStorage = JSON.stringify(gridStorageArr);
			window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
			var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));
			var source =
			{
				datatype: "json",
				localdata: packageData,
				root: 'packages',
				contentType: 'application/json',
				dataFields: [
					{ name: 'isSelected', type: 'number' },
					{ name: 'PackageId', map: 'PackageId' },
					{ name: 'PackageName', map: 'PackageName' },
					{ name: 'PackageMode', map: 'PackageMode' },
					{ name: 'FileName', map: 'FileName' },
					{ name: 'FileVersion', map: 'FileVersion' },
					{ name: 'Component', map: 'Component' },
					{ name: 'SponsorName', map: 'SponsorName' },
					{ name: 'FolderId', map: 'FolderId' },
					{ name: 'FolderName', map: 'FolderName' },
					{ name: 'IsEnabledForAutomation', map: 'IsEnabledForAutomation' }
				],

			};

			var dataAdapter = new $.jqx.dataAdapter(source);
			var buildFilterPanel = function (filterPanel, datafield) {
				wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
			}

			var buildFilterPanelMultiChoice = function (filterPanel, datafield, filterArray) {
				multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gID, filterArray, true);
			}

			var packageRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
				var filename = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'FileName');
				var packagetooltip = i18n.t('File_name', { lng: lang }) + ' : ' + filename
				defaulthtml = '<div  style="height:100px;cursor:pointer;text-align:center;padding-left: 5px;padding-top:7px;float:left;" ><span  title="' + packagetooltip + '" >' + value + '</a></div>';
				return defaulthtml;
			}

			var versionRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
				var filename = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'FileName');
				var versiontooltip = i18n.t('File_name', { lng: lang }) + ' : ' + filename
				defaulthtml = '<div  style="height:100px;cursor:pointer;text-align:center;padding-left: 5px;padding-top:7px;float:left;" ><span  title="' + versiontooltip + '" >' + value + '</a></div>';
				return defaulthtml;
			}

			var enableDownloadAutomation = function (row, columnfield, value, defaulthtml, columnproperties) {
				if (value == true) {
					return '<div style="padding-left:5px;padding-top:7px">Allowed</div>';
				} else {
					return '<div style="padding-left:5px;padding-top:7px">Not Allowed</div>';
				}
			}

			var applicationRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
				var isAutomation = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'IsEnabledForAutomation');
				var packageID = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'PackageId');
				var packagemode = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'PackageMode');
				var packageName = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'PackageName');
				var isFromReferenceSet = true;
				var gID = "jqxgridAvailablePackage";
				if (isAutomation == true) {
					var appdetaltooltip = i18n.t('app_details_tooltip', { lng: lang })
					defaulthtml = '<div  style="height:100px;cursor:pointer;text-align:center;padding-left: 5px;padding-top:7px;float:left;"><a style="text-decoration: underline"  title="' + appdetaltooltip + '"   role="button" >View</a></div>';
					return defaulthtml;
				} else {
					return " ";
				}
			}
			var rendered = function (element) {
				enableUiGridFunctions(gID, 'PackageId', element, gridStorage, true);
				return true;
			}
			this.gID = $('#jqxgridAvailablePackage');
			$("#" + gID).jqxGrid(
				{
					width: "100%",
					height: '320px',
					source: dataAdapter,
					sortable: true,
					filterable: true,
					selectionmode: 'singlerow',
					theme: AppConstants.get('JQX-GRID-THEME'),
					altrows: true,
					pagesize: packageData.length,
					autoshowcolumnsmenubutton: false,
					showsortmenuitems: false,
					editable: true,
					rowsheight: 32,
					enabletooltips: true,
					columnsResize: true,
					pageSize: 1000,
					ready: function () {
						var datainformations = $("#jqxgridAvailablePackage").jqxGrid('getdatainformation');
						if (datainformations && datainformations.rowscount == 0) {
							$("#jqxgridAvailablePackage").find('.jqx-grid-column-header:first').fadeTo('slow', .6);
							$("#jqxgridAvailablePackage").find('.jqx-grid-column-header:first').append('<div style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
						}
					},
					columns: [
						{
							text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
							datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
								return '<div style="margin-left:10px;margin-top:0px"><div style="margin-top: 5px;"></div></div>';
							}, rendered: rendered
						},
						{
							text: 'Package Name', dataField: 'PackageName', editable: false, cellsrenderer: packageRenderer, minwidth: 100,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						},
						{
							text: 'Folder', datafield: 'FolderName', editable: false, minwidth: 80, width: 'auto',
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanelMultiChoice(filterPanel, datafield, globalFoldersFilterArray);
							}
						},
						{
							text: 'File Version', dataField: 'FileVersion', editable: false, cellsrenderer: versionRenderer, minwidth: 80,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						},
						{
							text: i18n.t('Automatic_Downloads', { lng: lang }), datafield: 'IsEnabledForAutomation', enabletooltips: false, editable: false, minwidth: 160, cellsrenderer: enableDownloadAutomation,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								var filterArray = [{ ControlValue: "true", Value: "Allowed" }, { ControlValue: "false", Value: "Not Allowed" }];
								buildFilterPanelMultiChoice(filterPanel, datafield, filterArray);
							}
						},
						{ text: i18n.t('applications_download_lib', { lng: lang }), filterable: false, sortable: false, menu: false, datafield: 'PackageMode', resizable: false, editable: false, width: 100, cellsrenderer: applicationRenderer },
					],
				}).on({
					filter: function (e) {
						gridSelectedDataForSwap = [];
						gridSetRowDetailsforAvailGridSoftAssignEditRefer(e);
						rowIndexForHighlighted = undefined;
					}
				});
			getUiGridBiginEdit(gID, 'PackageId', gridStorage);

			$("#jqxgridAvailablePackage").on("cellclick", function (event) {
				var column = event.args.column;
				var rowindex = event.args.rowindex;
				var columnindex = event.args.columnindex;
				var rowData = $("#jqxgridAvailablePackage").jqxGrid('getrowdata', rowindex);
				if (event.args.datafield == 'PackageMode') {
					koUtil.isDownloadlibAddpackage = 0;
					openPopup('modelViewParentDownloadLibrary');
					koUtil.rowIdDownload = rowindex;
					koUtil.gridIdDownload = 'jqxgridAvailablePackage';
				}
			});
		}

		function keysGridModel(keysData, openPopup, movedArray) {
			$("#loadingDiv").show();

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.getKeyProfilesResp) {
							data.getKeyProfilesResp = $.parseJSON(data.getKeyProfilesResp);
							var keyslist = data.getKeyProfilesResp.Keys;
							var selectedKeys = _.where(movedArray(), { Type: AppConstants.get('Assignment_Key') });
							if (!_.isEmpty(keyslist)) {
								for (var i = 0; i < keyslist.length; i++) {
									keyslist[i].UniqueKeyId = keyslist[i].VrkCustomerid + '_' + keyslist[i].Name;
									var existKeys = _.where(selectedKeys, { UniqueKeyId: keyslist[i].UniqueKeyId });
									if (existKeys && existKeys.length == 0) {
										keysData.push(keyslist[i]);
									}
								}
								$("#btnForAllMoveright").removeClass('disabled');
								$("#btnForAllMoveright").prop("disabled", false);
							}
							KeysGrid(keysData(), openPopup);
							isKeysDataLoaded = true;
						} else {
							keysData([]);
							KeysGrid(keysData(), openPopup);
							isKeysDataLoaded = true;
						}
					} else {
						keysData([]);
						KeysGrid(keysData(), openPopup);
						isKeysDataLoaded = true;
					}
				} else {
					keysData([]);
					KeysGrid(keysData(), openPopup);
					isKeysDataLoaded = true;
				}
				$("#loadingDiv").hide();
			}

			var method = 'GetKeyProfiles';
			var params = '{"token":"' + TOKEN() + '"}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		function KeysGrid(KeysData, openPopup) {
			var gID = "jqxgridAvailableKeys";
			var gridStorageArr = new Array();
			var gridStorageObj = new Object();
			gridStorageObj.checkAllFlag = 0;
			gridStorageObj.counter = 0;
			gridStorageObj.filterflage = 0;
			gridStorageObj.selectedDataArr = [];
			gridStorageObj.unSelectedDataArr = [];
			gridStorageObj.singlerowData = [];
			gridStorageObj.multiRowData = [];
			gridStorageObj.TotalSelectionCount = null;
			gridStorageObj.highlightedRow = null;
			gridStorageObj.highlightedPage = null;
			gridStorageArr.push(gridStorageObj);
			var gridStorage = JSON.stringify(gridStorageArr);
			window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
			var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));
			var source =
			{
				dataType: "observablearray",
				localdata: KeysData,
				dataFields: [
					{ name: 'VrkCustomerid', map: 'VrkCustomerid' },
					{ name: 'Name', map: 'Name' },
					{ name: 'KeyType', map: 'KeyType' },
					{ name: 'Destination', map: 'Destination' },
					{ name: 'KeyHandleId', map: 'KeyProfileId' }
				],
			};
			//Custom filter
			var buildFilterPanel = function (filterPanel, datafield) {
				wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
			}
			var rendered = function (element) {
				enableUiGridFunctions(gID, 'KeyHandleId', element, gridStorage, false);
				return true;
			}
			var dataAdapter = new $.jqx.dataAdapter(source);

			this.gID = $('#' + gID);
			$("#jqxgridAvailableKeys").jqxGrid(
				{
					width: "100%",
					height: "320px",
					editable: true,
					source: dataAdapter,
					altRows: true,
					filterable: true,
					sortable: true,
					columnsResize: true,
					autoshowcolumnsmenubutton: false,
					pageSize: 1000,
					autoshowfiltericon: true,
					enabletooltips: true,
					autoshowloadelement: false,
					showsortmenuitems: false,
					enabletooltips: true,
					rowsheight: 32,
					selectionmode: 'singlerow',
					theme: AppConstants.get('JQX-GRID-THEME'),
					columns: [
						{
							text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
							datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
								return '<div style="margin-left:10px"><div style="margin-top: 5px;"></div></div>';
							}, rendered: rendered
						},
						{
							text: i18n.t('key_name', { lng: lang }), dataField: 'Name', editable: false, minwidth: 150, filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						},
						{
							text: i18n.t('key_type', { lng: lang }), dataField: 'KeyType', editable: false, minwidth: 150,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						},
						{
							text: i18n.t('key_destination', { lng: lang }), dataField: 'Destination', editable: false, minwidth: 100,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						}
					]
				});
			getUiGridBiginEdit('jqxgridAvailableKeys', 'KeyHandleId', gridStorage);
			setTimeout(function () {
				keysGridWidth = $('#contentjqxgridAvailableKeys').width();
				if (keysGridWidth < 460) {
					keysGridWidth = 460;
				}
				var datainformations = $("#jqxgridAvailableKeys").jqxGrid('getdatainformation');
				if (datainformations && datainformations.rowscount == 0) {
					$("#jqxgridAvailableKeys").find('.jqx-grid-column-header:first').fadeTo('slow', .6);
					$("#jqxgridAvailableKeys").find('.jqx-grid-column-header:first').append('<div style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
				}
			}, 100);
		}


		//end grid

		function packageIdsListClick(movedArray) {
			var packageIdsList = new Array();
			var packageIdObj;
			var movedArray = _.where(movedArray, { Type: AppConstants.get('Assignment_Package') })
			for (var i = 0; i < movedArray.length; i++) {
				packageIdObj = new Object();
				packageIdObj.PackageId = movedArray[i].PackageId;
				packageIdsList.push(packageIdObj);
			}

			return packageIdsList;
		}

		function getModel(movedArray, modelData, initialCall, allModels, modelsArr, packageData, selectedRowArrayForSwap) {

			// prepare the data
			var packageIds = packageIdsListClick(movedArray());


			var callBackfunction = function (data, error) {
				if (data) {
					if (data && data.models) {
						packageModels = $.parseJSON(data.models);
						for (var i = 0; i < packageModels.length; i++) {
							var modelSelected = _.where(modelsArr, { ModelId: packageModels[i].ModelId });
							if (modelSelected.length > 0) {
								packageModels[i].IsSelected = true;
							} else {
								packageModels[i].IsSelected = false;
							}
						}
					} else {
						packageModels = [];
						for (var i = 0; i < allModels.length; i++) {
							var modelSelected = _.where(modelsArr, { ModelId: allModels[i].ModelId });
							if (modelSelected.length > 0) {
								allModels[i].IsSelected = true;
							} else {
								allModels[i].IsSelected = false;
							}
						}
					}

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (packageModels) {
							modelData(packageModels);
						} else {
							modelData(allModels);
						}
					} else if (data.responseStatus.StatusCode == AppConstants.get('NOT_COMMON_MODEL')) {
						if (initialCall == 1) {
							openAlertpopup(2, 'Common_Models_Does_Not_Exist');
						}
						$("#loadingDiv").hide();
						if (selectedRowArrayForSwap.length > 0) {
							var isDataUpdated = false;
							for (k = 0; k < packageIds.length; k++) {
								var selectedsource = _.where(selectedRowArrayForSwap, { PackageId: packageIds[k].PackageId });
								if (selectedsource && selectedsource.length > 0) {
									packageData.push(selectedsource[0]);
									movedArray.remove(selectedsource[0]);
									isDataUpdated = true;
								}
							}
							if (isDataUpdated) {
								$("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
							}
						}
					}

				} else if (error) {
					modelData(null);
					$("#loadingDiv").hide();
				}
			}

			var method = 'GetModelsForPackages';
			var params = '{"token":"' + TOKEN() + '","packages":' + JSON.stringify(packageIds) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

		}
		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopupParentViewEditRef(elementname);
		}
		seti18nResourceData(document, resourceStorage);

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


	function setDeviceSearchAttributes() {
		$('#selectGeneralContentData').click();
		if (deviceAttributesDataReferenceSets && deviceAttributesDataReferenceSets.length > 0) {
			for (var i = 0; i < deviceAttributesDataReferenceSets.length; i++) {
				if (deviceAttributesDataReferenceSets[i].DisplayName == "VHQ Version") {
					deviceAttributesDataReferenceSets[i].DisplayName = "Agent Version";
					break;
				}
			}
			deviceAttributesDataReferenceSets.sort(function (a, b) { return a.DisplayName > b.DisplayName ? 1 : -1; });
		}
		return deviceAttributesDataReferenceSets;
	}

});


function checkval(self) {
	$('#btnSaveRFS').removeAttr('disabled');
	$("#btnCopyRFS").removeAttr('disabled');

}

var gridSetRowDetailsforAvailGridSoftAssignEditRefer = function (e) {
	var self = this;
	this.gID.jqxGrid('beginupdate');
	var results = self.gID.jqxGrid('getrows').length;
	if (results == 0) {
		$("#btnForMoveRight").addClass('disabled');
	}

	this.gID.jqxGrid('resumeupdate');
	State12 = $("#jqxgridAvailablePackage").jqxGrid('savestate');
	$('#jqxgridAvailablePackage').jqxGrid('clearselection');
	//isFilterData = true;
	return;

};

function onModelSelection() {
	$('#btnSaveRFS').removeAttr('disabled');
	$('#btnCopyRFS').removeAttr('disabled');
}