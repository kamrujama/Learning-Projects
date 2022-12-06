define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
	var lang = getSysLang();

	return function parentReferenceSetDetailsModel() {

		var self = this;

		self.ReferenceSetName = ko.observable('');
		self.movedArray = ko.observableArray();
		self.titleText = ko.observable('');
		self.observableModelPopupAdvancedOptions = ko.observable();
		self.templateFlag = ko.observable(false);

		var isSelectedPaneFiltered = false;
		var packagesArray = new Array();
		qualifierPackageId = 0;
		qualifierPackageName = '';
		qualifierPackageVersion = '';
		qualifierPackageIsDAEnabled = false;

		init()
		function init() {
			setScreenControls(AppConstants.get('REFERENCE_SET_DETAILS'));
			if (!_.isEmpty(globalSelectedReferenceSet)) {
				self.ReferenceSetName = ko.observable(globalSelectedReferenceSet.Name);
				var message = i18n.t('reference_set_details_for', { lng: lang }) + " " + self.ReferenceSetName();
				self.titleText(message);
			}
			getReferenceSetId(packagesArray, globalSelectedReferenceSet.Id);
		}

		self.openPopup = function (popupName) {
			//self.templateFlag(true);
			if (popupName == "modalPackageDownloadQualifiers") {
				loadelement(popupName, 'referenceSets');
				$('#modalReferenceSetAdvancedOptions').modal('show');
			}
		}

		self.unloadTempPopup = function (popupName) {
			self.observableModelPopupAdvancedOptions('unloadTemplate');
			$('#modalReferenceSetAdvancedOptions').modal('hide');
		}

		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopupAdvancedOptions(elementname);
		}

		function generateTemplate(tempname, controllerId) {
			var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
			var viewName = 'controller/' + controllerId + '/' + tempname + '.js';
			ko.components.register(tempname, {
				viewModel: { require: viewName },
				template: { require: 'plugin/text!' + htmlName }
			});
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
			//if (isFilterApplied) {
			//	isSelectedPaneFiltered = true;
			//	clearSelectedPackagesPane();
			//} else {
			//	if (isSelectedPaneFiltered)
			//		clearSelectedPackagesPane();

			//	isSelectedPaneFiltered = false;
			//}
		}

		//function clearSelectedPackagesPane() {
		//	self.movedArray().forEach(function (element, index) {
		//		var id = '#selectedpackagecb' + index + '';
		//		$(id)[0].checked = false;
		//		element.actionSelected = false;
		//	});
		//	selectedRowArrayForSwap = [];
		//	//selectedDownloadsActionsContent = [];
		//	$("#btnForMoveleft").addClass('disabled');
		//	$("#moveUpBtn").addClass('disabled');
		//	$("#moveDownBtn").addClass('disabled');
		//}

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

		function getReferenceSetId(packagesArray, Id) {
			var referenceSetId = Id;

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.referenceSetdetails)
						data.referenceSetdetails = $.parseJSON(data.referenceSetdetails);

					if (!_.isEmpty(data.referenceSetdetails)) {

						if (data.referenceSetdetails.Packages) {
							packagesArray = data.referenceSetdetails.Packages;
							backUpPackagesArray = data.referenceSetdetails.Packages;
						} else {
							packagesArray = [];
						}

						if (data.referenceSetdetails.Keys && data.referenceSetdetails.Keys != '') {
							keysArray = [];
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
								keysArray.push(keyObj);
							}
							backUpKeysArray = data.referenceSetdetails.Keys;
						} else {
							keysArray = [];
							backUpKeysArray = [];
						}
						setValues(packagesArray, keysArray);
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

		function setValues(packagesArray, keysArray) {
			if ((packagesArray && packagesArray.length > 0) || (keysArray && keysArray.length > 0)) {
				var assignmentsArray = [];
				if (packagesArray.length > 0) {
					for (var i = 0; i < packagesArray.length; i++) {
						packagesArray[i].packageSelected = false;
						packagesArray[i].Type = AppConstants.get('Assignment_Package');
						packagesArray[i].Details = "Name: " + packagesArray[i].PackageName + ' , Version: ' + packagesArray[i].FileVersion + ' , Folder: ' + packagesArray[i].FolderName;
						packagesArray[i].isAllowed = licenseSource.isAutoDownloadsLicensed ? (rightSource.isAdvancedSoftwareManagementModifyAllowed ? (!_.isEmpty(packagesArray[i].PackageDownloadOption) ? true : false) : false) : false;
						assignmentsArray[packagesArray[i].Sequence - 1] = packagesArray[i];
					}
				}
				if (keysArray.length > 0) {
					for (var i = 0; i < keysArray.length; i++) {
						keysArray[i].packageSelected = false;
						keysArray[i].Type = AppConstants.get('Assignment_Key');
						if (!keysArray[i].KeyType || keysArray[i].KeyType == null || keysArray[i].KeyType == undefined) {
							keysArray[i].KeyType = '';
						}
						if (!keysArray[i].Destination || keysArray[i].Destination == null || keysArray[i].Destination == undefined) {
							keysArray[i].Destination = '';
						}
						keysArray[i].Details = "Name: " + keysArray[i].Name + ' , Key type: ' + keysArray[i].KeyType + ' , Destination: ' + keysArray[i].Destination;
						keysArray[i].UniqueKeyId = keysArray[i].VrkCustomerid + '_' + keysArray[i].Name;
						keysArray[i].isAllowed = licenseSource.isAutoDownloadsLicensed ? (rightSource.isAdvancedSoftwareManagementModifyAllowed ? (!_.isEmpty(packagesArray[i].PackageDownloadOption) ? true : false) : false) : false;
						assignmentsArray[keysArray[i].Sequence - 1] = keysArray[i];
						if (self.keysData().length > 0) {
							var selectedsource = _.where(self.keysData(), { KeyProfileId: keysArray[i].KeyProfileId });
							self.keysData.remove(selectedsource[0]);
						}
					}
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
				packagesArray = [];
				keysArray = [];
			}
		}

		function setTooltipForAssignments(index, tooltipValue) {
			$("#typespan" + index).prop('title', tooltipValue);
			$("#detailspan" + index).prop('title', tooltipValue);
		}

		seti18nResourceData(document, resourceStorage);
	}
});