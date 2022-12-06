define(["knockout", "koUtil", "advancedSearchUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "utility"], function (ko, koUtil, ADSearchUtil) {
	var lang = getSysLang();
	acUserSubscribedAlerts = new Array();
	selectedArr = new Array();
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	return function roleSubscriptionModel() {
		var userrData = JSON.parse(sessionStorage.getItem("userrData"));
		userGuid = userrData[0].UserGuid;

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

		$('.chosen-search').hide();
		var self = this;

		self.userGroups = ko.observableArray();
		self.userAlerts = ko.observableArray();
		self.userSubcribedAlerts = ko.observableArray();
		self.RoleName = ko.observable('');
		self.screensArray = ko.observableArray();
		self.globalSavedSearchArray = ko.observableArray();
		self.IsAdminUser = ko.observable(false);
		self.IsCareEnabledUser = ko.observable(false);
		if (isUserInAdminRole)
			self.IsAdminUser(true);

		var isAlertModifyAllowed = (!_.isEmpty(licenseSource) && !licenseSource.isNotificationsLicensed) ? false : (!_.isEmpty(rightSource) && rightSource.isAlertsModifyAllowed) ? true : false;
		var isAlertSubscriptionModified = false;
		var changeHomeScreen = false;
		var changeDeviceSearch = false;
		var isGetAlertTypes = false;
		var menuObject = new Object();
		var screensArray = new Array();

		if (!_.isEmpty(licenseSource) && !_.isEmpty(rightSource)) {
			if (((licenseSource.isBasicAlertsLicensed || licenseSource.isAdvanceAlertsLicensed) && rightSource.isAlertsViewAllowed)
				|| ((licenseSource.isManualDownloadsLicensed || licenseSource.isAutoDownloadsLicensed) && rightSource.isReportsandChartsViewAllowed)) {
				menuObject = new Object();
				menuObject.ScreenId = "1";
				menuObject.ScreenName = AppConstants.get('DASHBOARD');
				screensArray.push(menuObject);
			}
			if (licenseSource.isDeviceLicensed && rightSource.isDevicesViewAllowed) {
				menuObject = new Object();
				menuObject.ScreenId = "2";
				menuObject.ScreenName = AppConstants.get('DEVICE_SEARCH');
				screensArray.push(menuObject);
			}
			if (licenseSource.isCareLicensed && rightSource.isVerifoneCareViewAllowed) {
				self.IsCareEnabledUser(true);
				menuObject = new Object();
				menuObject.ScreenId = "3";
				menuObject.ScreenName = AppConstants.get('CARE_DASHBOARD');
				screensArray.push(menuObject);
			}
		}

		self.screensArray(screensArray);
		self.globalSavedSearchArray(globalSavedSearchArray);

		$("#basicPrefernceDiv").show();
		$("#alertSubscriptionsDiv").hide();
		$("#btnSaveUserAlerts").prop('disabled', true);
		$("#btnSaveUserPreferences").prop('disabled', true);

		$('#modelMyPreferencesHeader').mouseup(function () {
			$("#modelMyPreferences").draggable({ disabled: true });
		});

		$('#modelMyPreferencesHeader').mousedown(function () {
			$("#modelMyPreferences").draggable({ disabled: false });
		});

		$("#dropdownScreen").on('change', function () {
			if ($('#dropdownScreen').val() != "" && changeHomeScreen) {
				$("#btnSaveUserPreferences").removeAttr('disabled');
			}
		});

		$("#includeCareDataChk").on('change', function () {
			$("#btnSaveUserPreferences").removeAttr('disabled');
		});

		var includeCareDataChk = (_.isEmpty(globalUserPreferenceObject) || globalUserPreferenceObject.ShowCareDataInDeviceSearch) ? true : false;
		$("#includeCareDataChk").prop('checked', includeCareDataChk);

		var prevDefaultSrchValue = AppConstants.get('EMPTY_SEARCH');

		$("#dropdownSearch").on('change', function () {
			var searchDropDownValue = this.value;
			if (searchDropDownValue == AppConstants.get('PRIVATE_SEARCH') || searchDropDownValue == AppConstants.get('PUBLIC_SEARCH')) {
				$('#dropdownSearch').val(prevDefaultSrchValue).prop("selected", "selected");
			} else {
				prevDefaultSrchValue = this.value;
				if ($("#dropdownSearch").val() != "" && changeDeviceSearch) {
					$("#btnSaveUserPreferences").removeAttr('disabled');
				}
			}
		});

		self.showBasicDetails = function () {
			if ($("#btnSaveUserAlerts").is(':disabled')) {
				$("#tabAlertSubscriptions").removeClass('active');
				$("#tabBasic").addClass('active');
				$("#btnSaveUserAlerts").addClass('hide');
				$("#btnSaveUserPreferences").removeClass('hide');
				$("#basicPrefernceDiv").show();
				$("#alertSubscriptionsDiv").hide();
			} else {
				$("#configChangeConfirmation").modal('show');
			}
		}

		self.showAlertSubscriptions = function () {
			if ($("#btnSaveUserPreferences").is(':disabled')) {
				if (!isGetAlertTypes) {
					if (koUtil.UserData() == '') {
						getUser(self.userAlerts, self.userSubcribedAlerts, koUtil.UserData);
					} else {
						self.userGroups = koUtil.UserData().userGroups ? koUtil.UserData().userGroups : null;
						self.RoleName = self.userGroups ? ko.observable(self.userGroups[0].Role.RoleName) : ko.observable('');
						self.userSubcribedAlerts = koUtil.UserData().userSubscribedAlerts;
						if (rightSource.isAlertsViewAllowed) {
							getAlertTypes(self.userAlerts, self.userSubcribedAlerts);
						}
					}
				}

				$("#tabBasic").removeClass('active');
				$("#tabAlertSubscriptions").addClass('active');
				$("#btnSaveUserAlerts").removeClass('hide');
				$("#btnSaveUserPreferences").addClass('hide');
				$("#basicPrefernceDiv").hide();
				$("#alertSubscriptionsDiv").show();
			} else {
				$("#configChangeConfirmation").modal('show');
			}
		}

		self.onClickdropdownScreen = function () {
			changeHomeScreen = true;
			self.screensArray(screensArray);
			self.globalSavedSearchArray(globalSavedSearchArray);
		}

		self.onClickdropdownSearch = function (data) {
			changeDeviceSearch = true;
			self.screensArray(screensArray);
			self.globalSavedSearchArray(globalSavedSearchArray);
		}

		self.cancelTabChange = function () {
			$("#configChangeConfirmation").modal('hide');
		}

		self.cancelUserPreferenceChanges = function () {
			changeHomeScreen = false;
			changeDeviceSearch = false;
			$("#configChangeConfirmation").modal('hide');
			if ($("#btnSaveUserPreferences").is(':visible')) {
				$("#btnSaveUserPreferences").prop('disabled', true);
				getUserPersonalization();
				self.showAlertSubscriptions();
			} else {
				$("#btnSaveUserAlerts").prop('disabled', true);
				clearUiGridFilter('jqxgridAlertSubscriptions');
				isGetAlertTypes = false;
				self.showBasicDetails();
			}
		}

		init();
		function init() {
			setScreenControls(AppConstants.get('MY_PREFERENCES'));
			getAllSearches();
		}

		function getAllSearches() {

			function callbackFunction(data, error) {
				if (data) {

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						globalSavedSearchArray = new Array();
						var saveSearchdata = new Object();
						saveSearchdata.SearchID = 0;
						saveSearchdata.SearchName = AppConstants.get('EMPTY_SEARCH');
						saveSearchdata.SearchText = AppConstants.get('EMPTY_SEARCH');
						saveSearchdata.SearchType = 0;
						saveSearchdata.IsAdmin = true;
						globalSavedSearchArray.push(saveSearchdata);

						if (data.getAllSearchesResp) {
							data.getAllSearchesResp = $.parseJSON(data.getAllSearchesResp);
							if (data.getAllSearchesResp.Searches) {

								if (isUserInAdminRole) {
									var privateSearch = new Array();
									var publicSearch = new Array();

									for (var i = 0; i < data.getAllSearchesResp.Searches.length; i++) {
										var saveSearchdata = new Object();
										saveSearchdata.SearchID = data.getAllSearchesResp.Searches[i].SearchID;
										if (data.getAllSearchesResp.Searches[i].SearchType == 2) {
											saveSearchdata.SearchName = data.getAllSearchesResp.Searches[i].SearchText;
										} else {
											saveSearchdata.SearchName = data.getAllSearchesResp.Searches[i].SearchName;
										}
										saveSearchdata.SearchText = data.getAllSearchesResp.Searches[i].SearchText;
										saveSearchdata.SearchType = data.getAllSearchesResp.Searches[i].SearchType;
										saveSearchdata.IsPrivateSearch = data.getAllSearchesResp.Searches[i].IsPrivateSearch;
										saveSearchdata.IsAdmin = data.getAllSearchesResp.Searches[i].IsAdmin;

										if (data.getAllSearchesResp.Searches[i].IsPrivateSearch) {
											privateSearch.push(saveSearchdata);
											privateSearch.sort(function (a, b) { return a.SearchName.toLowerCase() > b.SearchName.toLowerCase() ? 1 : -1; })
										} else {
											publicSearch.push(saveSearchdata);
											publicSearch.sort(function (a, b) { return a.SearchName.toLowerCase() > b.SearchName.toLowerCase() ? 1 : -1; })
										}
									}

									var saveSearchdata = new Object();
									saveSearchdata.SearchID = 0;
									saveSearchdata.SearchName = AppConstants.get('PRIVATE_SEARCH');
									saveSearchdata.SearchText = AppConstants.get('PRIVATE_SEARCH');
									saveSearchdata.SearchType = 2;
									saveSearchdata.IsPrivateSearch = '';
									saveSearchdata.IsAdmin = false;
									globalSavedSearchArray.push(saveSearchdata);
									for (var i = 0; i < privateSearch.length; i++) {
										globalSavedSearchArray.push(privateSearch[i]);
									}

									var saveSearchdata = new Object();
									saveSearchdata.SearchID = 0;
									saveSearchdata.SearchName = AppConstants.get('PUBLIC_SEARCH');
									saveSearchdata.SearchText = AppConstants.get('PUBLIC_SEARCH');
									saveSearchdata.SearchType = 2;
									saveSearchdata.IsPrivateSearch = '';
									saveSearchdata.IsAdmin = false;
									globalSavedSearchArray.push(saveSearchdata);
									for (var i = 0; i < publicSearch.length; i++) {
										globalSavedSearchArray.push(publicSearch[i]);
									}
								}
								else {
									for (var i = 0; i < data.getAllSearchesResp.Searches.length; i++) {
										if (data.getAllSearchesResp.Searches[i].IsPrivateSearch) {
											saveSearchdata = new Object();
											saveSearchdata.SearchID = data.getAllSearchesResp.Searches[i].SearchID;
											saveSearchdata.SearchName = data.getAllSearchesResp.Searches[i].SearchName;
											saveSearchdata.SearchText = data.getAllSearchesResp.Searches[i].SearchText;
											saveSearchdata.SearchType = data.getAllSearchesResp.Searches[i].SearchType;
											saveSearchdata.IsAdmin = data.getAllSearchesResp.Searches[i].IsAdmin;

											globalSavedSearchArray.push(saveSearchdata);
										}
									}
								}
							}
							if (userPersonalization) {
								if (globalSavedSearchArray && globalSavedSearchArray.length > 0) {
									if (userPersonalization.DefaultSearchId == 0) {
										userPersonalization.DefaultSearchName = AppConstants.get('EMPTY_SEARCH');
										userPersonalization.DefaultSearchText = AppConstants.get('EMPTY_SEARCH');

										globalUserPreferenceObject.DefaultSearchName = AppConstants.get('EMPTY_SEARCH');
										globalUserPreferenceObject.DefaultSearchText = AppConstants.get('EMPTY_SEARCH');
									} else {
										for (var i = 0; i < globalSavedSearchArray.length; i++) {
											if (userPersonalization.DefaultSearchId == globalSavedSearchArray[i].SearchID) {
												userPersonalization.DefaultSearchName = globalSavedSearchArray[i].SearchName;
												userPersonalization.DefaultSearchText = globalSavedSearchArray[i].SearchText;

												globalUserPreferenceObject.DefaultSearchName = globalSavedSearchArray[i].SearchName;
												globalUserPreferenceObject.DefaultSearchText = globalSavedSearchArray[i].SearchText;
												break;
											}
										}
									}
								}
							}
						}
					}
				}
				self.screensArray(screensArray);
				self.globalSavedSearchArray(globalSavedSearchArray);
				getUserPersonalization();
			}
			var params = '{"token":"' + TOKEN() + '"}';
			ajaxJsonCall("GetAllSearches", params, callbackFunction, true, 'POST', true);
		}

		function getUserPersonalization() {
			if (!_.isEmpty(userPersonalization) && userGuid == userPersonalization.UserGuid) {
				var ScreenName = userPersonalization.HomeScreen;
				var SearchName = userPersonalization.DefaultSearchName;
				var SearchId = userPersonalization.DefaultSearchId;

				if (ScreenName == AppConstants.get('DASHBOARD') && (!_.isEmpty(licenseSource) && !_.isEmpty(rightSource)
					&& ((licenseSource.isBasicAlertsLicensed || licenseSource.isAdvanceAlertsLicensed) && rightSource.isAlertsViewAllowed)
					|| ((licenseSource.isManualDownloadsLicensed || licenseSource.isAutoDownloadsLicensed) && rightSource.isReportsandChartsViewAllowed))) {
					$('#dropdownScreen').val(AppConstants.get('DASHBOARD')).prop("selected", "selected");
					$('#dropdownScreen').trigger('chosen:updated');
				} else if (ScreenName == AppConstants.get('DEVICE_SEARCH') && (!_.isEmpty(licenseSource) && licenseSource.isDeviceLicensed) && (!_.isEmpty(rightSource) && rightSource.isDevicesViewAllowed)) {
					var selectedScreenArray = new Array();
					var selectedScreen = new Object();
					selectedScreen.ScreenId = 2;
					selectedScreen.ScreenName = AppConstants.get('DEVICE_SEARCH');
					selectedScreenArray.push(selectedScreen);
					self.screensArray(selectedScreenArray);
				} else if (ScreenName == AppConstants.get('CARE_DASHBOARD') && (!_.isEmpty(licenseSource) && licenseSource.isCareLicensed) && (!_.isEmpty(rightSource) && rightSource.isVerifoneCareViewAllowed)) {
					var selectedScreenArray = new Array();
					var selectedScreen = new Object();
					selectedScreen.ScreenId = 3;
					selectedScreen.ScreenName = AppConstants.get('CARE_DASHBOARD');
					selectedScreenArray.push(selectedScreen);
					self.screensArray(selectedScreenArray);
				} else {
					if (!_.isEmpty(licenseSource) && !_.isEmpty(rightSource) && ((licenseSource.isBasicAlertsLicensed || licenseSource.isAdvanceAlertsLicensed) && rightSource.isAlertsViewAllowed)
						|| ((licenseSource.isManualDownloadsLicensed || licenseSource.isAutoDownloadsLicensed) && rightSource.isReportsandChartsViewAllowed)) {
						$('#dropdownScreen').val(AppConstants.get('DASHBOARD')).prop("selected", "selected");
						$('#dropdownScreen').trigger('chosen:updated');
					} else if ((!_.isEmpty(licenseSource) && licenseSource.isDeviceLicensed) && (!_.isEmpty(rightSource) && rightSource.isDevicesViewAllowed)) {
						$('#dropdownScreen').val(AppConstants.get('DEVICE_SEARCH')).prop("selected", "selected");
						$('#dropdownScreen').trigger('chosen:updated');
					}
				}

				if (userPersonalization.ShowCareDataInDeviceSearch) {
					$('#includeCareDataChk').prop('checked', true);
				}
				else {
					$('#includeCareDataChk').prop('checked', false);
				}

				var selectedPrivateSearchArray = new Array();
				var selectedPrivateSearch = new Object();
				selectedPrivateSearch.DefaultSearchId = SearchId;
				selectedPrivateSearch.SearchName = SearchName;
				selectedPrivateSearchArray.push(selectedPrivateSearch);
				self.globalSavedSearchArray(selectedPrivateSearchArray);
			} else {
				self.screensArray(screensArray);
				self.globalSavedSearchArray(globalSavedSearchArray);
				$('#dropdownScreen').val('Dashboard').prop("selected", "selected");
				$("#dropdownScreen").trigger('chosen:updated');

				$('#dropdownSearch').val('Empty').prop("selected", "selected");
				$("#dropdownSearch").trigger('chosen:updated');
			}
		}

		self.saveUserPreferences = function () {
			var defaultSearchId = 0;
			if (globalSavedSearchArray && globalSavedSearchArray.length > 0) {

				var chh = $('#applyAllUsrChk').is(':checked');

				for (var i = 0; i < globalSavedSearchArray.length; i++) {
					if ($('#dropdownSearch').val() == globalSavedSearchArray[i].SearchName) {
						if (isUserInAdminRole && $('#applyAllUsrChk').is(':checked') && globalSavedSearchArray[i].IsPrivateSearch == true) {
							openAlertpopup(1, 'enable_all_users_message');
							return;
						}
						if (isUserInAdminRole && !$('#applyAllUsrChk').is(':checked') && globalSavedSearchArray[i].IsPrivateSearch == false) {
							openAlertpopup(1, 'default_search_to_user');
							return;
						}
						defaultSearchId = globalSavedSearchArray[i].SearchID;
						break;
					}
				}
			}

			var personalizationDetails = new Object();
			personalizationDetails.HomeScreen = $("#dropdownScreen").val();
			personalizationDetails.DefaultSearchId = defaultSearchId;
			personalizationDetails.ShowCareDataInDeviceSearch = $("#includeCareDataChk").is(':checked');
			if (isUserInAdminRole && $('#applyAllUsrChk').is(':checked') && globalSavedSearchArray[i].IsPrivateSearch == false)
				personalizationDetails.IsGlobalSearch = true;
			else
				personalizationDetails.IsGlobalSearch = false;
			setUserPreferences(personalizationDetails);
		}

		function setUserPreferences(personalizationDetails) {
			$("#loadingDiv").show();

			var callBackfunction = function (data, error) {
				$("#loadingDiv").hide();
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.getUserPersonalizationResp) {
							data.getUserPersonalizationResp = $.parseJSON(data.getUserPersonalizationResp);
							userPersonalization = data.getUserPersonalizationResp.UserPersonalization;
							globalUserPreferenceObject = data.getUserPersonalizationResp.UserPersonalization;

							if (userPersonalization != null && globalSavedSearchArray && globalSavedSearchArray.length > 0) {
								for (var i = 0; i < globalSavedSearchArray.length; i++) {
									if (userPersonalization.DefaultSearchId == globalSavedSearchArray[i].SearchID) {
										userPersonalization.DefaultSearchName = globalSavedSearchArray[i].SearchName;
										break;
									}
								}
							}
						}
						changeHomeScreen = false;
						changeDeviceSearch = false;
						$("#btnSaveUserPreferences").prop('disabled', true);
						$("#btnRemoveUserPreferences").prop('disabled', false);
						openAlertpopup(0, 'user_preferences_saved_successfully');
						$('#btnCancelUserPreferencesAlerts').click();
						getUserPersonalization();
						refreshDeviceSearch();
					}
				}
			}

			if (!_.isEmpty(userPersonalization) && userGuid == userPersonalization.UserGuid)
				personalizationDetails.IsUpdateUserPersonalization = true;

			var method = 'AddOrSetUserPersonalization';
			var params = '{"token":"' + TOKEN() + '", "addOrSetUserPersonalizationReq": ' + JSON.stringify(personalizationDetails) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		self.removeUserPeferencesPopup = function () {
			if (isUserInAdminRole && $('#applyAllUsrChk').is(':checked'))
				$("#removeConfirmationMsg").text(i18n.t('remove_preferences_foralluser_confirmation', { lng: lang }));
			else
				$("#removeConfirmationMsg").text(i18n.t('remove_preferences_confirmation', { lng: lang }));

			$("#RemovePreferencesConfirmPopup").modal('show');
		}

		self.removeUserPeferences = function () {
			var personalizationDetails = new Object();;
			if (userPersonalization) {
				personalizationDetails = userPersonalization;
			}

			if (isUserInAdminRole && $('#applyAllUsrChk').is(':checked'))
				personalizationDetails.IsGlobalSearch = true;
			else
				personalizationDetails.IsGlobalSearch = false;

			$("#loadingDiv").show();

			var callBackfunction = function (data, error) {
				$("#loadingDiv").hide();
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.getUserPersonalizationResp) {
							data.getUserPersonalizationResp = $.parseJSON(data.getUserPersonalizationResp);
							userPersonalization = data.getUserPersonalizationResp.UserPersonalization;
							globalUserPreferenceObject = data.getUserPersonalizationResp.UserPersonalization;

							if (userPersonalization != null && globalSavedSearchArray && globalSavedSearchArray.length > 0) {
								for (var i = 0; i < globalSavedSearchArray.length; i++) {
									if (userPersonalization.DefaultSearchId == globalSavedSearchArray[i].SearchID) {
										userPersonalization.DefaultSearchName = globalSavedSearchArray[i].SearchName;
									}
								}
							}

							getUserPersonalization();
							refreshDeviceSearch();
						}
						$("#RemovePreferencesConfirmPopup").modal('hide');
						$("#btnRemoveUserPreferences").prop('disabled', true);
						openAlertpopup(0, 'user_preferences_removed_successfully');
						$('#btnCancelUserPreferencesAlerts').click();
					}
				}
			}

			var method = 'DeleteUserPersonalization';
			var params = '{"token":"' + TOKEN() + '", "removeUserPersonalizationReq": ' + JSON.stringify(personalizationDetails) + '}';

			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		function refreshDeviceSearch() {			
			if (ADSearchUtil.AdScreenName === 'deviceSearch' && isDeviceSearchWithAdvanceSearch) {
				var gID = 'Devicejqxgrid';
				gridRefresh('Devicejqxgrid');
				if (self.IsCareEnabledUser() === true && $("#includeCareDataChk").is(':checked')) {
					$("#" + gID).jqxGrid('showcolumn', 'SoftwareStatus');
					$("#" + gID).jqxGrid('showcolumn', 'Alerts');
				} else {
					$("#" + gID).jqxGrid('hidecolumn', 'SoftwareStatus');
					$("#" + gID).jqxGrid('hidecolumn', 'Alerts');
				}
			}
		}

		//------confirm Paramter Template assignment with count------
		self.closeRemovalConfimationPopup = function () {
			$("#RemovePreferencesConfirmPopup").modal('hide');
		}

		function getUser(acUserAlerts, acUserSubscribedAlerts, UserData) {
			$("#loadingDiv").show();
			function callbackFunction(data, error) {
				$("#loadingDiv").hide();
				if (data) {
					if (data.user)
						data.user = $.parseJSON(data.user);
					$("#userfullnameId").text(data.user.FullName);
					if (data.userGroups)
						data.userGroups = $.parseJSON(data.userGroups);
					if (data.userHierarchies)
						data.userHierarchies = $.parseJSON(data.userHierarchies);
					if (data.userSubscribedAlerts) {
						data.userSubscribedAlerts = $.parseJSON(data.userSubscribedAlerts);
						acUserSubscribedAlerts = data.userSubscribedAlerts;
					}
					if (!isAlertSubscriptionModified && rightSource.isAlertsViewAllowed) {
						getAlertTypes(acUserAlerts, acUserSubscribedAlerts);
					} else {
						$("#btnSaveUserAlerts").prop('disabled', true);
					}
					isAlertSubscriptionModified = false;
					userGlobalData = data;
					UserData(data);

					self.userGroups = userGlobalData.userGroups ? userGlobalData.userGroups : null;
					self.RoleName = self.userGroups ? ko.observable(self.userGroups[0].Role.RoleName) : ko.observable('');

				}
				if (error) {
					retval = "";
				}
			}

			var method = 'GetUser';
			var params = '{"token":"' + TOKEN() + '","userGuid":"' + userGuid + '"}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		function getAlertTypes(acuserAlerts, acUserSubscribedAlerts) {

			var alertTypeReq = new Object();
			alertTypeReq.AlertStatus = ENUM.get('ALERT_STATUS_ENABLED');

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						isGetAlertTypes = true;
						if (data.alertList)
							data.alertList = $.parseJSON(data.alertList);

						for (var i = 0; i < data.alertList.length; i++) {
							var source = _.where(acUserSubscribedAlerts, { AlertTypeId: data.alertList[i].AlertTypeId });
							if (source != '') {
								data.alertList[i].isSelected = 1;
							} else {
								data.alertList[i].isSelected = 0;
							}
						}

						acuserAlerts(data.alertList);
						alertSubscriptionGrid(acuserAlerts(), 'jqxgridAlertSubscriptions');
					}
				}
			}

			var method = 'GetAlertTypes';
			var params = '{"token":"' + TOKEN() + '","alertTypeReq":' + JSON.stringify(alertTypeReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

		}

		function alertSubscriptionGrid(userAlerts, gID) {
			var count = 0;
			selectedArr = [];
			for (var i = 0; i < userAlerts.length; i++) {

				if (userAlerts[i].isSelected == 1) {
					selectedArr.push(userAlerts[i].AlertTypeId);
				} else {
					selectedArr = jQuery.grep(selectedArr, function (value) {
						return (value != userAlerts[i].AlertTypeId && value != null);
					});
					userAlerts[i].isSelected = 0;
				}
			}
			count = selectedArr.length;

			var gridStorageArr = new Array();
			var gridStorageObj = new Object();
			if (userAlerts.length == selectedArr.length) {
				gridStorageObj.checkAllFlag = 1;
			} else {
				gridStorageObj.checkAllFlag = 0;
			}

			gridStorageObj.counter = count;
			gridStorageObj.filterflage = 0;
			gridStorageObj.selectedDataArr = selectedArr;
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

			// prepare the data
			var source =
			{
				dataType: "json",
				localdata: userAlerts,
				datafields: [
					{ name: 'AlertName', map: 'AlertName' },
					{ name: 'Severity', map: 'Severity' },
					{ name: 'AlertTypeId', map: 'AlertTypeId' },
					{ name: 'isSelected', map: 'number' },
					{ name: 'IsSeverityApplicable', map: 'IsSeverityApplicable' }
				],

			};
			var dataAdapter = new $.jqx.dataAdapter(source);

			var rendered = function (element) {
				var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));
				enableUiGridFunctions(gID, 'AlertTypeId', element, gridStorage, true, null, null, isAlertModifyAllowed);
				return true;
			}

			var cellclass = function (row, columnfield, value) {
				var classname = isAlertModifyAllowed ? '' : 'disabled';
				return classname;
			}

			var cellbeginedit = function (row, datafield, columntype, value) {
				if (isAlertModifyAllowed == true) {
					return true;
				} else {
					return false;
				}
			}

			var severityRenderer = function (row, columnfield, value, defaulthtml, columnproperties, event) {
				var isSeverityApplicable = $("#" + gID).jqxGrid('getcellvalue', row, 'IsSeverityApplicable');
				if (isSeverityApplicable != null) {
					if (isSeverityApplicable == true) {
						if (value == "Low") {
							return '<div style="padding-left:5px;padding-top:0px;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Low_severity"></div></a>' + value + '</div>';
						} else if (value == "High") {
							return '<div style="padding-left:5px;padding-top:0px;"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg high_Severity"></div></a>' + value + '</div>';
						} else if (value == "Medium") {
							return '<div style="padding-left:5px;padding-top:0px;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Medium_severity"></div></a>' + value + '</div>';
						}
					}
					else {
						return '<div style="padding-left:35px; padding-top:7px;" disabled="disabled">' + "Not Applicable" + '</div>';
					}
				}
			}

			$("#" + gID).jqxGrid(
				{
					width: "99.5%",
					height: "100%",
					source: dataAdapter,
					sortable: true,
					filterable: false,
					selectionmode: 'singlerow',
					theme: AppConstants.get('JQX-GRID-THEME'),
					altrows: true,
					pagesize: userAlerts.length,
					showsortmenuitems: false,
					editable: true,
					enabletooltips: true,
					rowsheight: 32,
					columnsResize: true,
					columns: [
						{
							text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', cellbeginedit: cellbeginedit, cellclassname: cellclass, enabletooltips: false, editable: true,
							datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
								return '<div style="margin-left:10px;"><div style="margin-top: 5px;"></div></div>';
							}, rendered: rendered
						},
						{
							text: i18n.t('ALERT_NAME_user', { lng: lang }), datafield: 'AlertName', minwidth: 100, editable: false,
						},
						{
							text: i18n.t('severity_user', { lng: lang }), datafield: 'Severity', minwidth: 100, editable: false, enabletooltips: false, cellsrenderer: severityRenderer
						},
					]
				});
			getUiGridBiginEdit(gID, 'AlertTypeId', gridStorage);
			callUiGridFilter(gID, gridStorage);
			//$("#" + gID).jqxGrid('updatebounddata');
		}

		self.saveClicked = function (gId, observableModelRoleSubscription) {
			var selectedrowids = getSelectedUniqueId(gId);
			setUserAlerts(selectedrowids, observableModelRoleSubscription);
		}

		self.cancel = function (observableModelRoleSubscription) {
			observableModelRoleSubscription();
		}

		function setUserAlerts(selectedrowids) {
			var userGuid;
			var alerts = new Array();

			//Getting User Guid
			userrData = JSON.parse(sessionStorage.getItem("userrData"));
			userGuid = userrData[0].UserGuid;

			for (var i = 0; i < selectedrowids.length; i++) {
				var EAlertType = new Object();
				EAlertType.AlertTypeId = selectedrowids[i];
				alerts.push(EAlertType);
			}
			var isStatusChanged = false;
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						isAlertSubscriptionModified = true;
						openAlertpopup(0, 'role_subscription_save_success');
						getUser(self.userAlerts, self.userSubcribedAlerts, koUtil.UserData)
						$('#btnCancelUserPreferencesAlerts').click();
					} else {
						$("#pAlert").append(i18n.t('Please_provide_user_Email_ID', { lng: 'en' }));
						$("#Alermsgmodel").modal("show");
					}
				} else if (error) {
					$("#pAlert").append(i18n.t('network_error', { lng: lang }));
					$("#Alermsgmodel").modal("show");
				}
			}

			var method = 'SetUserAlerts';
			var params = '{"token":"' + TOKEN() + '","userGuid":"' + userGuid + '","alerts":' + JSON.stringify(alerts) + ',"isStatusChanged":"' + isStatusChanged + '"}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}
		seti18nResourceData(document, resourceStorage);
	}
});