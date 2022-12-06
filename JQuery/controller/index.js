define(["knockout", "knockout.validation", "sammy.min", "koUtil", "autho", "moment", "constants", "globalFunction", "utility", "appEnum", "jQuery.base64", "gridUtility", "deviceUtility", "licenseUtility", "ParamUtils", "bootstrap", "bootstrapDatePicker", "spinner", "download"], function (ko, validation, Sammy, koUtil, autho, moment) {
	var lang = getSysLang();
	dateLastAlertDateTime = '';
	refreshIntervalId = '';
	autoRefreshIntervalId = '';
	sess_Alive_intervalID = '';
	userGlobalData = '';
	globalVariable = {};
	globalVariableForEditPackage = {};
	globalVariableForEditContent = {};
	globalVariableForEditAlerts = {};
	globalVariableForAlertHistory = {};
	globalVariableForDownloadSchedule = {};
	globalVariableForunselectedItems = {};
	globalVariableForSelectedPackages = {};
	globalVariableForUnselectedPackages = {};
	globalVariableForSelectedMerchants = {};
	globalVariableForSelectedMerchantUser = new Object();
	globalVariableForEmailTemplate = new Object();
	globalSchedulePackages = {};
	checkAllForSchedule = 0;
	globalVariableForDownloadJobStatus = {};
	globalVariableForContentJobStatus = {};
	globalVariableForDeletedandBlacklistedDevices = new Array();
	globalVariableForDeviceSearch = {};
	globalVariableForDeviceSearchStatus = {};
	globalVariableForEditRoles = {};
	globalmultiChoiceFilterData = new Array();
	globalVariableForEditGroup = new Object();
	globalVariableFordeleteGroupEstablishmnet = new Array();
	globalVariableForEditDeviceSubStatus = new Array();
	globalVariableFordeleteDeviceSubStatus = new Array();
	globalVariableForEditUser = new Array();
	globalVariableForEditRole = new Array();
	deviceSubStatusDataUser = new Array();
	deviceSubStatusDataAll = new Array();
	globalVariableForHierarchyAssignment = {};
	globalSoftwareAssignment = "";
	globalVariableForAssignedRights = new Array();
	globalModelId = {};
	addSoftwareAssignment = new Object();
	globalAdvancedSearch = new Object();
	globalColumnFilter = new Object();
	isFromDownloadLibrary = false;
	isFromContentLibrary = false;
	isFromDeviceSearch = false;
	isReferenceSetFromDownloadLibrary = false;
	isAdvancedSavedSearchApplied = false;
	isSearchReset = true;
	checkDril = '';
	isPackageChecked = false;
	hasData = false;
	globalVariableForDeviceStatus = new Array();
	customColumns = new Array();
	selectedColumns = new Array();
	selectedColumnsClone = new Array();
	globalSavedSearchArray = new Array();
	userPersonalization = new Object();
	globalUserPreferenceObject = new Object();
	globalFoldersArray = new Array();
	globalSelectedFolders = new Array();
	globalFoldersFilterArray = new Array();
	globalDeviceDataForGetLogs = new Object();
	globalTemplateQualifiers = new Object();
	globalSelectedFolderPackages = new Array();
	globalAdvancedOptionsApplications = new Array();
	globalPackageDownloadOptions = new Array();
	globalSelectedReferenceSet = new Object();
	globalSelectedParentReferenceSet = new Object();
	globalSelectedParentReferenceSetDetails = new Array();

	isAdpopup = '';
	isCareEnabled = false;
	isDeviceManagementEnabled = false;
	isDeviceDiagnosticsEnabled = false;
	isContentManagementEnabled = false;
	isDevicesViewAllowed = false;
	isDeviceSubStatusAllowed = false;
	isReportsandChartsAllowed = false;
	isAddButtonEnabled = false;
	isHierarchyChange = false;
	isFromAddDevice = false;
	isZontalkDevice = false;
	globalVariableForApplicationParameter = {};
	isMerchantTabVisible = true;
	isDownloadScheduleScreenLoaded = false;
	isContentScheduleScreenLoaded = false;
	isActionScheduleScreenLoaded = false;

	//Flag in user screen
	isGridChange = false;
	isGroupModified = false;
	isPieChartFilter = false;

	ClearAdSearch = 0;

	selectedMenuOption = '';
	previousSelectedMenuOption = '';
	defaultMenuOption = '';
	heirarchyGlobalCheck = 0;
	globaleHirarchyPath = new Array();
	globaleHirarchyParent = '';
	globaleUserHirarchy = '';
	hierarchyforuser = 0;
	hierarchyforAddDevice = 0;
	gridShowHideState = null;
	hideColumnsArr = new Array();
	savedGridArr = new Array();

	scheduleOption = "";

	//Global object for selected devices in Schedule Download
	deviceAttributesData = {};

	//for defaultdatefilter
	fixeddatecheck = '';
	fixeddatechecKInternal = '';
	fixeddayFilterArray = new Array();
	fixeddayFilter = '';

	EnforceVHQSecurityPolicies = '';
	userGuid = '';

	//Hierachies Level Storage
	globalLevelHierarchyObject = [];
	TotalRows = -1;
	StartRecord = 1;
	/////device Search

	//deviceSearchCheck = 0;

	heirarchyData = {};
	selectedHierarchyID = "";

	CallType = ENUM.get("CALLTYPE_WEEK");

	//Application screen
	ischanges = false;
	templateXML = '';
	ApplicationIdForTemplate = 0;
	selectedviesion = '';
	selectedApplicationName = '';
	selectedIsMultiVPFXFileSupported = false;
	vpfPDXFlag = 0;
	isMoreInfoDisplayed = false;
	//for report
	updateReportArr = new Array();
	//

	merchantOperation = '';

	//Task Notifications
	taskNotifications = new Array();
	//Hierarchy
	conflictHierarchyParameters = {};
	hierarchyLipostionArr = new Array();
	//Time Zone
	getAllTimeZones = new Array();

	//for device profile tab id
	setIdForDeviceDetailsTab = "";
	globalUniqueDeviceId = null;

	IsUserProfile = ko.observable(true);
	IsChangePassword = ko.observable(false);

	customerID = 0;
	customerGUID = '';
	loggedInUserEmail = '';
	IsAcquirerCommerceEnabled = false;
	isMerchantUserExists = false;

	//Merchant Management access
	IsMMEnabled = false;
	//SSO User
	IsVFSSOUser = false;
	//VHQ Authorization
	IsVHQAuthorizedUser = false;
	//VHQ Native Authentication
	IsVHQNativeAuthentication = false;
	//AD User
	IsADUser = false;
	//ADFS USER
	IsADFSUser = false;
	//User is From External IDP
	IsExternalIdp = false;
	//User is belongs to Support IDP
	IsSupportIdp = false;
	//User has Hiearachy Access Via ADFS
	IsHierarchyAccessViaADFS = false;
	//Is MarketPlace Enabled
	IsMarketPlaceEnabled = false;
	// MarketPlace URL
	marketPlaceURL = '';
	// Estate Manager URL
	estateManagerURL = '';
	//LogFile URL
	invalidXMLLogFileUrl = '';

	isUserInAdminRole = false;

	IsForgeRockUser = false;

	//Configurations
	hostName = "";
	passwordPolicyText = '';

	isSwapApprovalRequired = false;
	isDirectParameterActivation = false;
	includeInactiveDevicesForDownload = false;
	isCustomerEnabledforVerifoneCentral = false;
	SlotSchedulerScheduleLag = 0;

	isNotifyAlertOnUIEnabled = 0;
	noOfMinutesToNotifyAlert = 1;

	softwarePackageExtensions = '';

	contentPackageFileTypes = {};

	maximumSchedulesPerJob = 0;
	maximumHierarchiesPerUser = 0;
	maximumVRKFilesToUpload = 0;
	maximumPackagesPerReferenceSet = 0;
	maximumReferenceSetsPerHierarchy = 0;
	exportFileSizeLimit = 0;
	maximumDownloadsPerJob = 0;
	maximumcsvDeviceSearchCount = 0;
	maximumPackageNameLength = 0;

	sftpFileRepositoryLocation = "";
	totalDeviceRecords = 0;

	callTypeConfigurations = {};
	packageTypes = {};

	targetUsers = {};
	fileNames = {};
	deviceFileLocations = {};

	//Cached object
	customerData = new Object();
	userData = new Object();

	isDeviceLiteEnabled = false;
	var deviceXSDVersion;

	//Safety Net for Device Move
	var deviceMoveLimit = 0;
	//Safety Net for Device Software assignment operations
	var deviceSoftwareAssignmentLimit = 0;
	//Safety Net for Device Edit Parameters
	var deviceEditParameterLimit = 0;

	//Device Profile Lite
	deviceLiteData = new Object();

	//User Preference Column width
	globalGridColumns = new Object();
	userResizedColumns = [];

	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});
	vfCounterColors = ['vf-sec-green', 'vf-pri-blue', 'vf-ter-gray', 'vf-sec-purple'];
	// vfChartBandColors = ['#6495ED', '#D2691E', '#FFD700', '#696969', '#B22222', '#DCDCDC','#00aeef']
	//142 colors
	vfChartBandColors = ['#6495ED', '#D2691E', '#FFD700', '#78DBE2', '#B22222', '#DCDCDC', '#00CED1', '#87CEEB', '#FFDEAD', '#F08080', '#8fbc8b', "#EFDECD", "#CD9575", "#FDD9B5", '#696969', "#87A96B", "#FFA474", "#FAE7B5", "#9F8170", "#FD7C6E", "#000000", "#ACE5EE", "#1F75FE", "#A2A2D0", "#6699CC", "#0D98BA", "#7366BD", "#DE5D83", "#CB4154", "#B4674D", "#FF7F49", "#EA7E5D", "#B0B7C6", "#FFFF99", "#1CD3A2", "#FFAACC", "#DD4492", "#1DACD6", "#BC5D58", "#DD9475", "#9ACEEB", "#FFBCD9", "#FDDB6D", "#2B6CC4", "#EFCDB8", "#6E5160", "#CEFF1D", "#71BC78", "#6DAE81", "#C364C5", "#CC6666", "#E7C697", "#FCD975", "#A8E4A0", "#95918C", "#1CAC78", "#1164B4", "#F0E891", "#FF1DCE", "#B2EC5D", "#5D76CB", "#CA3767", "#3BB08F", "#FEFE22", "#FCB4D5", "#FFF44F", "#FFBD88", "#F664AF", "#AAF0D1", "#CD4A4C", "#EDD19C", "#979AAA", "#FF8243", "#C8385A", "#EF98AA", "#FDBCB4", "#1A4876", "#30BA8F", "#C54B8C", "#1974D2", "#FFA343", "#BAB86C", "#FF7538", "#FF2B2B", "#F8D568", "#E6A8D7", "#414A4C", "#FF6E4A", "#1CA9C9", "#FFCFAB", "#C5D0E6", "#FDDDE6", "#158078", "#FC74FD", "#F78FA7", "#8E4585", "#7442C8", "#9D81BA", "#FE4EDA", "#D68A59", "#714B23", "#FF48D0", "#E3256B", "#EE204D", "#FF5349", "#C0448F", "#1FCECB", "#7851A9", "#FF9BAA", "#FC2847", "#76FF7A", "#9FE2BF", "#A5694F", "#8A795D", "#45CEA2", "#FB7EFD", "#CDC5C2", "#80DAEB", "#ECEABE", "#FFCF48", "#FD5E53", "#FAA76C", "#18A7B5", "#EBC7DF", "#FC89AC", "#DBD7D2", "#17806D", "#DEAA88", "#77DDE7", "#FFFF66", "#926EAE", "#324AB2", "#F75394", "#FFA089", "#8F509D", "#FFFFFF", "#A2ADD0", "#FF43A4", "#FC6C85", "#CDA4DE", "#FCE883", "#C5E384", "#FFAE42"];
	VfModelColors = [{
		"MX 925": "#6495ED",
		"MX 915": "#D2691E",
		"MX 880": "#FFD700",
		"MX 870": "#78DBE2",
		"MX 860": "#B22222",
		"MX 850": "#DCDCDC",
		"e315": "#00CED1",
		"e335": "#87CEEB",
		"MX 760": "#FFDEAD",
		"UX 300": "#F08080",
		"VX 805": "#8fbc8b",
		"VX 820": "#EFDECD",
		"VX 520": "#CD9575",
		"VX 680": "#FDD9B5",
		"VX 690": "#696969",
		"VX 680 3G": "#87A96B",
		"VX 675": "#FFA474",
		"VX 520 3G": "#FAE7B5",
		"VX 690 3G": "#9F8170",
		"VX 675 3G": "#FD7C6E",
		"VX 675 WiFi BT": "#ACE5EE",
		"e355": "#1F75FE",
		"V200c": "#A2A2D0",
		"P400": "#6699CC",
		"MX 915(Bridge)": "#0D98BA",
		"e315M": "#7366BD",
		"V200c Plus": "#DE5D83",
		"V200c CTLS": "#CB4154",
		"P400 Plus": "#B4674D",
		"VX 520 C": "#FF7F49",
		"C520H": "#EA7E5D",
		"PP1000SE": "#B0B7C6",
		"V400M": "#FFFF99",
		"P200": "#1CD3A2",
		"E265": "#FFAACC",
		"VX 685": "#DD4492",
		"Vx 825": "#1DACD6",
		"Vx 680 WIFI BT": "#BC5D58",
		"Carbon 10": "#DD9475",
		"Stand": "#9ACEEB",
		"Carbon 8": "#FFAE42"
	}];
	modifiedCounterWidgets = new Array();
	VHQFlag = true;
	EOAccessToken = "";
	hostedPageAccessToken = "";
	var menuJSON, fullname, IsCommonUser, IsPasswordChangeAllowed, colorTheme;
	customerFullName = '';
	menuJsonData = '';
	licenseInfo = new Object();
	userRightData = new Array();
	dashboardWidgets = new Array();
	defaultLanguage = 'en';
	selectedLanguage = '';
	resourceStorage = '';
	resourceStorage = getResourceData(lang, document, resourceStorage, defaultLanguage);
	seti18nResourceData(document, resourceStorage);

	windowurl = window.location.href;
	var routeurl = windowurl.split("#/");
	if (!_.isEmpty(routeurl) && routeurl.length > 1) {
		if (routeurl[1].indexOf('deviceProfile') > -1) {
			var str = routeurl[1].split("/");
			if (!_.isEmpty(str) && str.length > 1) {
				if (typeof str[1] === "number") {
					VHQFlag = true;
				} else {
					var parameters = {};
					hostedPageAccessToken = str[1];
					try {
						var urlDataStore = atob(str[1]);
						var accessToken = urlDataStore.split(',');
						for (var keyValue in accessToken) {
							var keyvaluePairs = accessToken[keyValue].split("=");
							var key = keyvaluePairs[0].toLowerCase();
							var value = keyvaluePairs[1];
							parameters[key] = value;
						}
						if (parameters['token'] != undefined) {
							EOAccessToken = parameters['token'];
							window.sessionStorage.setItem("EOAccessToken", EOAccessToken);
							window.sessionStorage.setItem("CustomerId", parameters['customerid']);
							window.sessionStorage.setItem("externalUserName", parameters['externalusername']);
						}
					}
					catch (e) {
						$("#loadingDiv").hide();
						$("#errorDiv").show();
						$("#errorMessageDiv").text('Invalid Token. Please verify the token (DP5012).');
						VHQFlag = false;
						return;
					}
					VHQFlag = false;
				}
			}
		}
	}


	if (VHQFlag === true) {
		showNavBars();
	}

	var uri = window.location.toString();
	if (uri.indexOf("?") > 0) {
		var clean_uri = uri.substring(0, uri.indexOf("?"));
		window.history.replaceState({}, document.title, clean_uri);
	}

	try {
		if (subpath != '') {
			location.hash = subpath;
			subpath = "";
		}
	}
	catch (error) {
		subpath = '';
	}
	GetUserInformationFromToken();

	if (colorTheme == undefined || colorTheme == "") {
		changethemeColor("default", false);
	}
	else {
		changethemeColor(colorTheme, false);
	}

	return function appViewModel() {

		if (VHQFlag === false && !licenseSource.isBasicIntegrationPlatformLicensed) {
			setScreenControls(AppConstants.get('HOSTED_PAGE'));
			$("#loadingDiv").hide();
			return;
		}

		// Setting locale for moment.js
		moment.locale(lang);
		var self = this;
		self.customerFullName = ko.observable();
		self.customerFullName(customerFullName);
		self.fullUserName = ko.observable();
		self.GetUsers = ko.observable();

		self.observableModelPopup = ko.observable();
		self.observableModelPopupHierarchy = ko.observable();
		self.observableWhoseValueIsAComponentName = ko.observable();
		self.isModelPopup = ko.observable(false);
		self.isModelHierarchyPopup = ko.observable(false);

		self.obserableShowHideModel = ko.observable();
		self.menus = ko.observableArray([]);
		self.usercolortheme = ko.observable(colorTheme);

		self.menulevel1 = ko.observable();
		self.menulevel2 = ko.observable();
		self.menulevel3 = ko.observable();
		self.menulevel4 = ko.observable();
		self.menuHeader = ko.observable();
		self.contrlerId = ko.observable();
		self.templateId = ko.observable();
		self.chosenMenuId = ko.observable();
		self.AlertTypes = ko.observable();
		self.models = ko.observableArray();
		self.customers = ko.observableArray();
		self.reportName = ko.observable();
		self.enableloginname = ko.observable(false);
		self.isEmaildChanged = ko.observable(false);
		self.reportsDataCheck = ko.observable(false);
		//self.GetConfigValuebyConfigName = ko.observable();
		self.customerName = ko.observable();
		self.Version = ko.observable('');
		self.Copyright = ko.observable('');
		self.deviceHierarchy = ko.observable();

		self.menus(menuJSON);
		menuJsonData = menuJSON;

		$('.dropdown-submenu a.customermenu').on("mouseover", function (e) {
			$(this).next('ul').show();
			e.stopPropagation();
			e.preventDefault();
		});
		$('.dropdown-toggle').on("click", function (e) {
			$(".submenus").hide();
		});

		if (VHQFlag === true) {
			checkForWarningOnload();                                //License/Password expiry warning
			getVersion();                                           //Get DataService/GUI version
			getCustomers(self.customers, self.customerFullName());  //Get Customers list to display for SSO login
		}
		GetUser(self.GetUsers, koUtil.UserData, self.fullUserName);
		if (VHQFlag === true) {
			GetConfigurations();                                    //Get all configuration values
			getMultiChoiceFilterData(globalmultiChoiceFilterData);  //Get grid Multi-choice filter values
			getTimeZones();                                         //Get time zones
			getModels(self.models);                                 //Get all model data for one time           
			getFolders();
			getUserPreferencesColumnWidth(AppConstants.get('ACTION_GET'), customerGUID, '', AppConstants.get('FETCH_ALL'), [], []);
		}
		getHierarchyLevels();                                   //Get hierarchy levels data 
		$(document).ready(function () {
			setTimeout(function () {
				if (IsMarketPlaceEnabled) {
					$("#marketplaceapps").children('a').attr('href', marketPlaceURL);
				}
			}, 0);
		});
		if (VHQFlag === true && isReportsandChartsAllowed) {
			getAllReports(self.menus, menuJSON, '');
		}

		if (IsMarketPlaceEnabled) {
			marketPlaceURL = getCommonSystemConfiguration(AppConstants.get('MARKETPLACE_URL'))
		}

		$('.collapsible').on("mouseover", function (e) {

			if ($('.collapsible').hasClass('collapsible-mini')) {
				$('.collapsible').prop('title', i18n.t('expand_menu', {
					lng: lang
				}));
			} else {
				$('.collapsible').prop('title', i18n.t('collapse_menu', {
					lng: lang
				}));
			}

		});

		///for quick serach dropdown behavior


		$(document).keydown(function (objEvent) {
			if (objEvent.keyCode == 9) {  //tab pressed
				if ($("#mainPageBody").hasClass('modal-open')) {
					if ($("#loadingDiv").css('display') == 'block') {
						objEvent.preventDefault(); // stops its action
					}
				}
			}
		})

		$(document).keyup(function (objEvent) {
			if (objEvent.keyCode == 13) {  //enter pressed
				$("a:focus").click();
				$("i:focus").click();
				$("span:focus").click();
				$("#hierarchyUl>li:focus").click();
			}
		})

		$('#modelSwitchCustomerConfirmation').on('shown.bs.modal', function (e) {
			$('#btnSwitchCustomerNo').focus();

		});
		$('#modelSwitchCustomerConfirmation').keydown(function (e) {
			if ($('#btnSwitchCustomerNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#btnSwitchCustomerYes').focus();
			}
		});


		$(window).click(function (e) {
			$(".submenus").hide();
			if (koUtil.checkQuckDDL == 1) {
				if ($("#allQuickSearchUL").hasClass('hide')) {
					$("#allQuickSearchUL").removeClass('hide');
				} else {
					$("#allQuickSearchUL").addClass('hide');
				}
				if ($("#allSearchUL").hasClass('hide')) {
					$("#allSearchUL").removeClass('hide');
				} else {
					$("#allSearchUL").addClass('hide');
				}
				koUtil.checkQuckDDL = 0;
			} else {
				$("#allQuickSearchUL").addClass('hide');
				$("#allSearchUL").addClass('hide');
			}
		});

		$(window).on("beforeunload", function (event) {
			//logOut();
		});


		self.changetheme = function (theme) {
			changethemeColor(theme, true);
		}

		function checkerror(chekVal) {
			var retval = '';
			if (chekVal == 0) {
				if ($("#txtOldPsw").val() == "") {
					retval += 'old password';
					self.oldPassword(null);
					$("#enter_old_password").show();
				} else {
					retval += '';
				}
				if ($("#txtNewPasw").val() == "") {
					retval += 'new passwod';
					self.newPassword(null);
					$("#enter_new_password").show();
				} else {
					retval += '';
				}
				if ($("#txtConfirmPsw").val() == "") {
					retval += 'confirm password';
					self.confirmNewPassword(null);
					$("#enter_confirm_new_password").show();
				} else {
					retval += '';
				}

			}
			return retval;
		};

		self.help = function () {
			window.open(AppConstants.get("HELP_URL"));
		};

		self.switchCustomer = function (data) {
			self.customerName(data.Customer);
			if (self.customerName() != self.customerFullName()) {
				$("#CustomerConfirmation").text(i18n.t("switch_customer", { customerName: self.customerName() }, { lng: lang }));
				$("#modelSwitchCustomerConfirmation").modal('show');
			}
		}

		self.switchCustomerForUser = function () {
			window.location = GetVirtualPath() + '/?customername=' + self.customerName();
		}

		self.setcolumnWidth = function () {
			$("#modalResizeResetColumnsConfirmation").modal('hide');
			if (!_.isEmpty(globalGridColumns)) {
				setcolumnsWidth(globalGridColumns.gId, globalGridColumns.gridName, globalGridColumns.isColumnResized, globalGridColumns.gridColumns);
			}
		}

		function setcolumnsWidth(gId, gridName, isColumnResized, gridColumns) {
			var type = '';
			var resizedColumns = [];
			var columns = [];

			if (isColumnResized) {
				type = AppConstants.get('ACTION_POST_PATCH');
				var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
				if (!_.isEmpty(gridStorage) && gridStorage.length > 0) {
					resizedColumns = gridStorage[0].resizedColumns;
				}
				columns = gridColumns;
			} else {
				type = AppConstants.get('ACTION_DELETE');
			}

			getUserPreferencesColumnWidth(type, customerGUID, gId, gridName, resizedColumns, columns);
		}

		try {
			self.observableModelPopup('unloadTemplate');
			self.observableModelPopupHierarchy('unloadTemplate');

			loadelementModelPopUp('modelUserProfile', 'genericPopup');
			loadelementModelPopUp('modelUserPreferences', 'genericPopup');
			loadelementModelPopUp('modelChangePassword', 'genericPopup');
		}
		catch (error) {

		}

		self.openPopup = function (popupName) {
			self.isModelPopup(false);
			if (popupName != '') {
				self.isModelPopup(true);
				$('#deviceProfileModel').modal('show');
				$('#modePopupDiv').removeClass('hide');
				$('#hierarchyPopupDiv').addClass('hide');
				loadelementModelPopUp(popupName, 'genericPopup');

				if (popupName == 'modelChangePassword') {
					setTimeout(function () {
						$("#closeBtn").show();
						$("#cancel_password").show();
					}, 1000);
				}
			}
		};

		self.goToMenu = function (menu) {
			if (menu.id == 'merchants') {
				window.open(estateManagerURL);
			} else {
				self.chosenMenuId(menu.id);
				var nestedRoutePath = getRouteUrl();

				if (nestedRoutePath[0] == menu.id) {
					mainMenuSetSelection(menu.id);
					return;
				}

				$("body").removeClass("widget-panel-o");
				isFromDeviceSearch = false;
				isSearchReset = false;
				koUtil.savedSearchId = 0;
				if (menu.children.length <= 0) {
					koUtil.isDeviceProfile(false);
					self.contrlerId(menu.controlerId);
					self.menulevel1(menu.id);
					self.menulevel2('');
					self.menulevel3('');
					self.menuHeader(menu.name);
					if (menu.parentId == "deviceProfile" && menu.id == "deviceProfile") {
						if (globalUniqueDeviceId == undefined || globalUniqueDeviceId == null) {
							location.hash = menu.parentId + "/" + menu.controlerId + "/" + menu.id;
						} else {
							location.hash = menu.parentId + "/" + globalUniqueDeviceId;
						}
					} else {
						location.hash = menu.parentId + "/" + menu.controlerId + "/" + menu.id;
					}

					$("#mainMenuUl").children("li").children("ul").children("li").children("a").removeClass('active');
					$("#mainMenuUl").children("li").children("ul").children("li").each(function () {
						$(this).children("ul").children("li").children("a").removeClass('active');
					});

					mainMenuSetSelection(menu.id);
					removeSetMenuSelection(menu.id);
					filtercheckfiled = '';
				}
			}
		};



		self.goToChildMenu = function (children) {
			$("#" + children.parentId).children("ul").children("li").children("ul").children("li").children("a").removeClass('active');
			$("body").removeClass("widget-panel-o");
			if (children.Subchild.length <= 0) {
				koUtil.isDeviceProfile(false);
				if (children.id == 'marketplaceapps') {
					window.open(marketPlaceURL);
				} else {
					self.menulevel1(children.parentId);
					self.menulevel2(children.id);
					self.menulevel3('');
					self.menuHeader(children.name);
					location.hash = children.parentId + "/" + children.controlerId + "/" + children.id
					self.contrlerId(children.controlerId);
					//mainMenuSetSelection(children.parentId);
					//childMenuSetSelection(children.id);
					filtercheckfiled = '';
					if (children.id == 'scheduleDownload') {
						scheduleOption = "scheduleDownload";
					} else if (children.id == 'scheduleDelivery') {
						scheduleOption = "scheduleContent";
					} else if (children.id == 'scheduleActions') {
						scheduleOption = "scheduleAction";
					}
				}
			}
		};

		self.unloadTempPopup = function (popupname) {
			loadelement('', 'unloadTemplate', 'genericPopup');
			self.observableModelPopupHierarchy('unloadTemplate');
			self.observableModelPopup('unloadTemplate');
		}

		self.goToSubChildMenu = function (Subchild, index) {
			$("#" + Subchild.parentId).children("ul").children("li").children("ul").children("li").children("a").removeClass('active');
			//$("#" + Subchild.subChildName + "sublink").addClass('active');
			$("body").removeClass("widget-panel-o");
			self.contrlerId(Subchild.controlerId);
			if (Subchild.subChildChildern.length <= 0) {
				self.menulevel1(Subchild.parentId);
				self.menulevel2(Subchild.childParentId);
				self.menulevel3(Subchild.name);
				self.menuHeader(Subchild.name);
				location.hash = Subchild.parentId + "/" + Subchild.controlerId + "/" + Subchild.id + "/" + Subchild.childParentId;
				koUtil.isDeviceProfile(false);
				mainMenuSetSelection(Subchild.parentId);
				childMenuSetSelection(Subchild.childParentId);

				if (Subchild.id == 'scheduleDownload') {
					scheduleOption = "scheduleDownload";
				} else if (Subchild.id == 'scheduleDelivery') {
					scheduleOption = "scheduleContent";
				} else if (Subchild.id == 'scheduleActions') {
					scheduleOption = "scheduleAction";
				}
			}
			filtercheckfiled = '';
		};

		self.goToSubChildChildren = function (SubChildChildren, index) {

			koUtil.isDeviceProfile(false);
			$("#" + SubChildChildren.id).parent('li').parent('ul').each(function () {
				$(this).children('li').children('a').removeClass('active');
			});
			$("#" + SubChildChildren.id).addClass('active');
			if (!_.isEmpty(SubChildChildren.rootParentId)) {
				location.hash = SubChildChildren.reportType + "/" + SubChildChildren.controlerId + "/" + SubChildChildren.templateId + "/" + SubChildChildren.id + "/" + SubChildChildren.name.replace('/', ' ') + '/' + SubChildChildren.parentId + "/" + SubChildChildren.rootParentId;
			} else {
				location.hash = SubChildChildren.reportType + "/" + SubChildChildren.controlerId + "/" + SubChildChildren.templateId + "/" + SubChildChildren.id + "/" + SubChildChildren.name.replace('/', ' ') + '/' + SubChildChildren.parentId;
			}
			mainMenuSetSelection(SubChildChildren.parentId);
			childMenuSetSelection(SubChildChildren.childParentId);

		}

		//Back to login page after logout
		self.backToLogin = function () {
			logout(ENUM.get('NORMALLOGOUT'));
		};

		self.hideinfo = function () {

			$("#informationPopup").modal('hide');
			if (isAdpopup != '') {
				$("#mainPageBody").addClass('modal-open-appendon');
			} else {
				$("#mainPageBody").removeClass('modal-open-appendon');
			}
			var filtergridID = $('.jqx-grid').prop('id');
			if (filtergridID == undefined) {

			} else {
				$('.totxtclass').val('');
				if (filtercheckfiled != '') {
					if (dateFiltercheck == 'datefilterinfo') {
						dateFiltercheck = '';
						$("#" + filtergridID).jqxGrid('openmenu', filtercheckfiled);
						filtercheckfiled = '';
					}
				}
			}
		}
		self.hideErrorInfo = function () {
			$("#invalidSearchPopup").modal('hide');
			redirectToLocation(menuJsonData, 'deviceSearch');
		}
		//focus button when it is open
		//$('#informationPopup').on('shown.bs.modal', function () {
		//    $('#infoBtnOk').focus();
		//})
		$('#informationPopup').on('keyup', function (e) {
			if (e.keyCode == 27 || e.keyCode == 32) {
				self.hideinfo();
			}
		})

		self.clearSelections = function (gId) {
			clearSelections(gId);
		}

		self.closeWarningModal = function () {
			$("#warningPageChange").modal('hide');
		}

		////for updated report

		self.getAllUpdatedReports = function () {
			getAllReportsafterAddDelete(self.menus, menuJSON, '');
		}
		////
		self.datefilterhideinfo = function () {
			$("#datefilterPopup").modal('hide');
			var filtergridID = $('.jqx-grid').prop('id');
			if (filtergridID == undefined) {

			} else {
				$('.totxtclass').val('');
				if (filtercheckfiled != '') {
					if (dateFiltercheck == 'datefilterinfo') {
						dateFiltercheck = '';
						$("#" + filtergridID).jqxGrid('openmenu', filtercheckfiled);
					}
				}
			}
		}
		self.invalidXMLorCSVHideinfo = function () {
			$("#invalidXMLorCSVPopup").modal('hide');
		}
		self.detailedLogs = function () {
			if (isMoreInfoDisplayed == true) {
				isMoreInfoDisplayed = false;
				$("#showMoreErrorInfo").hide();
				$("#infoMarkMessage").text(i18n.t('more_details'));
			} else {
				isMoreInfoDisplayed = true;
				$("#showMoreErrorInfo").show();
				$("#infoMarkMessage").text(i18n.t('less_details'));
			}
		}

		self.hideDetailedInfoPopup = function () {
			$("#DetailedInformationPopup").modal('hide');
		}

		self.downloadLogMessage = function () {
			$.ajax({
				url: invalidXMLLogFileUrl,
				dataType: "text",
				success: function (result) {
					download(result, 'SchemaValdiationErrors.txt', "application/txt");
					invalidXMLLogFileUrl = '';
				},
				error: function (jqXHR, status, error) {
					if (jqXHR != null) {
						ajaxErrorHandler(jqXHR, status, error);
						if (jqXHR.status != 401) {
							openAlertpopup(2, 'error_occurred_while_downloading_file');
						}
					} else {
						openAlertpopup(2, 'error_occurred_while_downloading_file');
					}
					invalidXMLLogFileUrl = '';
				}
			});
		}
		self.checkRights = function (screenName, rightsFor) {

			var retval = autho.checkRightsBYScreen(screenName, rightsFor);

			return retval;
		}

		Sammy(function () {
			this.get('#:parent', function () {
				var parent = this.params.parent;
				var childParent = this.params.subChild;
				var name = this.params.parent;
				var id = this.params.submenu;
				var menuOption = getNestedObject(self.menus(), 'id', this.params.parent);
				if (!_.isEmpty(menuOption)) {
					parent = menuOption.parentId;
					name = menuOption.name;
					id = menuOption.id;
				}
				var isLicensed = getLicenseForMenu(id, parent, childParent, '', '', menuJsonData);
				if (!isLicensed) {
					loadelement('error', '', 'error');
					return;
				}

				self.menulevel1('');
				self.menulevel2('');
				self.menulevel3('');
				self.menuHeader(name);
				loadelement(this.params.parent, '', 'reports');
				previousSelectedMenuOption = selectedMenuOption;
				selectedMenuOption = this.params.submenu;
				filtercheckfiled = '';

				koUtil.isDeviceProfileScreen = "";
				schedulADApply = 0;
			});

			this.get('#:template/:id', function () {
				if (ko.components.isRegistered(this.params.template)) {
					self.observableWhoseValueIsAComponentName('unloadTemplate');
				}
				var parent = this.params.template;
				var childParent = this.params.subChild;
				var name = this.params.template;
				var id = this.params.template;
				var menuOption = getNestedObject(self.menus(), 'id', this.params.template);
				if (!_.isEmpty(menuOption)) {
					parent = menuOption.parentId;
					name = menuOption.name;
					id = menuOption.id;
				}
				var isLicensed = getLicenseForMenu(id, parent, childParent, '', '', menuJsonData);
				if (!isLicensed) {
					loadelement('error', '', 'error');
					return;
				}

				self.menulevel1('');
				self.menulevel2('');
				self.menulevel3('');

				self.menuHeader(name);
				loadelement(this.params.template, '', 'Device');

				previousSelectedMenuOption = selectedMenuOption;
				selectedMenuOption = this.params.template;
				filtercheckfiled = '';
				koUtil.isDeviceProfileScreen = "DeviceProfile";
				schedulADApply = 0;
			});

			this.get('#:parent/:menu/:submenu', function () {
				var parent = this.params.parent;
				var childParent = this.params.subChild;
				var name = this.params.submenu;
				var id = this.params.submenu;
				var menuOption = getNestedObject(self.menus(), 'id', this.params.submenu);
				if (!_.isEmpty(menuOption)) {
					parent = menuOption.parentId;
					name = menuOption.name;
					id = menuOption.id;
				}
				var isLicensed = getLicenseForMenu(id, parent, childParent, '', '', menuJsonData);
				if (!isLicensed) {
					loadelement('error', '', 'error');
					return;
				}

				self.menulevel1(this.params.parent);
				self.menulevel2(name);
				self.menulevel3('');
				self.menuHeader(name);
				if (this.params.submenu == "customReport") {
					loadelement('BlankCustomScreen', '', 'reports');
				} else if (this.params.submenu == "scheduleDelivery") {
					self.observableWhoseValueIsAComponentName('unloadTemplate');
					retval = self.checkRights('Content Schedule', 'IsModifyAllowed');
					if (retval == true) {
						retval = true;
					} else {
						retval = false;
					}
					scheduleOption = "scheduleContent";
					if (retval == false) {
						loadelement('blankSchedule', '', this.params.controller);
					} else {
						loadelement('schedule', '', this.params.menu);
					}
				} else {
					loadelement(this.params.submenu, '', this.params.menu);
				}
				previousSelectedMenuOption = selectedMenuOption;
				selectedMenuOption = this.params.submenu;
				filtercheckfiled = '';

				koUtil.isDeviceProfileScreen = "";
				schedulADApply = 0;
			});

			this.get('#:parent/:controller/:child/:subChild', function () {
				var parent = this.params.parent;
				var childParent = this.params.subChild;
				var name = this.params.child;
				var id = this.params.child;
				var menuOption = getNestedObject(self.menus(), 'id', this.params.child);
				if (!_.isEmpty(menuOption)) {
					parent = menuOption.parentId;
					name = menuOption.name;
					id = menuOption.id;
				}
				var isLicensed = getLicenseForMenu(id, parent, childParent, '', '', menuJsonData);
				if (!isLicensed) {
					loadelement('error', '', 'error');
					return;
				}

				//$("#mainPageBody").removeClass('page-sidebar-minified');
				//$("#mainPageBody").removeClass('widget-panel-o');
				//mainMenuSetSelection(this.params.parent);
				//childMenuSetSelection(this.params.subChild);
				self.menulevel1(this.params.parent);
				self.menulevel2(this.params.subChild);
				self.menulevel3(name);
				self.menuHeader(name);
				self.reportName(this.params.subChild);

				koUtil.name = '';
				if (this.params.child == 'standardReports') {
					self.observableWhoseValueIsAComponentName('unloadTemplate');
				}
				var retval = true;
				var isScheduleScreen = false;
				if (this.params.subChild == 'downloads' || this.params.subChild == 'deviceAppBundles') {
					if (this.params.child == 'scheduleDownload') {
						self.observableWhoseValueIsAComponentName('unloadTemplate');
						retval = self.checkRights('Download Schedule', 'IsModifyAllowed');
						if (retval == true) {
							retval = true
							//retval = self.checkRights('Download Schedule', 'IsDeleteAllowed');
						} else {
							retval = false;
						}
						scheduleOption = "scheduleDownload";
						isScheduleScreen = true;
					}
				}
				else if (this.params.subChild == 'manageContents') {
					if (this.params.child == 'scheduleDelivery') {
						self.observableWhoseValueIsAComponentName('unloadTemplate');
						retval = self.checkRights('Content Schedule', 'IsModifyAllowed');
						if (retval == true) {
							retval = true
							//retval = self.checkRights('Content Schedule', 'IsDeleteAllowed');
						} else {
							retval = false;
						}
						scheduleOption = "scheduleContent";
						isScheduleScreen = true;
					}
				} else if (this.params.subChild == 'diagnostics' || this.params.subChild == 'mpdiagnostics') {
					if (this.params.child == 'scheduleActions') {
						self.observableWhoseValueIsAComponentName('unloadTemplate');
						retval = self.checkRights('Diagnostic Actions', 'IsModifyAllowed');
						if (retval == true) {
							retval = true;

						} else {
							retval = false;
						}
						scheduleOption = "scheduleAction";
						isScheduleScreen = true;
					}
				} else {
					retval = true;
				}

				schedulADApply = 0;

				if (retval == false) {
					loadelement('blankSchedule', '', this.params.controller);
				} else {
					if (isScheduleScreen) {
						isScheduleScreen = false;
						loadelement('schedule', '', this.params.controller);
					} else {
						loadelement(this.params.child, '', this.params.controller);
					}
				}
				previousSelectedMenuOption = selectedMenuOption;
				selectedMenuOption = this.params.child;
				filtercheckfiled = '';

				koUtil.isDeviceProfileScreen = "";
			});

			this.get('#:parent/:controller/:child/:subChild/:name/:parentId', function () {

				self.reportName(this.params.name);
				koUtil.reportId = this.params.subChild;
				koUtil.reportName = this.params.name;
				koUtil.categoryName = this.params.parent;

				self.menulevel1(this.params.controller);
				self.menulevel2(this.params.parent);
				self.menulevel3(this.params.parentId);
				self.menulevel4(this.params.name);
				self.menuHeader(this.params.name);
				if (this.params.child == 'standardReports') {
					self.observableWhoseValueIsAComponentName('unloadTemplate');
				}
				loadelement(this.params.child, '', this.params.controller);
				previousSelectedMenuOption = selectedMenuOption;
				selectedMenuOption = this.params.name;
				filtercheckfiled = '';

				koUtil.isDeviceProfileScreen = "";
				schedulADApply = 0;
			});

			this.get('#:parent/:controller/:child/:subChild/:name/:parentId/:rootParentId', function () {
				var rootParent = this.params.rootParentId;
				var parent = this.params.parent;
				var childParent = this.params.parentId;
				var name = this.params.name;
				var id = this.params.child;
				var subchildId = this.params.subChild;
				var menuOption = getNestedObject(self.menus(), 'id', this.params.child);
				if (!_.isEmpty(menuOption)) {
					name = menuOption.name;
					id = menuOption.id;
				}
				var isLicensed = getLicenseForMenu(id, rootParent, childParent, parent, subchildId, menuJsonData);
				if (!isLicensed) {
					loadelement('error', '', 'error');
					return;
				}

				self.reportName(this.params.name);
				koUtil.reportId = this.params.subChild;
				koUtil.reportName = this.params.name;
				koUtil.categoryName = this.params.parent;

				self.menulevel1(this.params.rootParentId);
				self.menulevel2(this.params.parent);
				self.menulevel3(this.params.parentId);
				self.menulevel4(this.params.name);
				self.menuHeader(this.params.name);
				if (this.params.child == 'standardReports') {
					self.observableWhoseValueIsAComponentName('unloadTemplate');
				}
				loadelement(this.params.child, '', this.params.controller);
				previousSelectedMenuOption = selectedMenuOption;
				selectedMenuOption = this.params.name;
				filtercheckfiled = '';

				koUtil.isDeviceProfileScreen = "";
				schedulADApply = 0;
			});

			this.get('', function () {

				loadelement('', 'modelChangePassword', 'genericPopup');
				selectedMenuOption = '';
				resourceStorage = getResourceData(lang, document, resourceStorage, defaultLanguage);
				var isReportViewAllowed = userHasViewAccess("Reports and Charts");
				var isCareViewAllowed = userHasViewAccess("VerifoneCare");

				if (VHQFlag === false) {
					defaultMenuOption = 'deviceProfileLite';
					this.app.runRoute('get', '#dashboard/device/deviceProfileLite/deviceProfileLite');
					redirectToLocation(menuJsonData, 'deviceProfileLite');

					filtercheckfiled = '';
					previousSelectedMenuOption = selectedMenuOption;
					selectedMenuOption = self.menulevel1();

					koUtil.isDeviceProfileScreen = "";
					schedulADApply = 0;
					$("#loadingDiv").hide();
					return;
				}

				if (!_.isEmpty(userPersonalization)) {
					if (userPersonalization.HomeScreen == AppConstants.get('DASHBOARD') &&
						(rightSource.isAlertsViewAllowed || rightSource.isReportsandChartsViewAllowed)) {
						defaultMenuOption = 'vhq';
						this.app.runRoute('get', '#dashboard/dashboard/vhq/verifone');
						location.hash = '#verifone/dashboard/vhq';
					} else if (userPersonalization.HomeScreen == AppConstants.get('CARE_DASHBOARD') && licenseSource.isCareLicensed && rightSource.isVerifoneCareViewAllowed) {
						defaultMenuOption = 'care';
						this.app.runRoute('get', '#dashboard/dashboard/care/verifone');
						redirectToLocation(menuJsonData, 'care');
					} else if (userPersonalization.HomeScreen == AppConstants.get('DEVICE_SEARCH') && licenseSource.isDeviceLicensed && rightSource.isDevicesViewAllowed) {
						defaultMenuOption = 'deviceSearch';
						this.app.runRoute('get', '#deviceSearch/device/deviceSearch');
						redirectToLocation(menuJsonData, 'deviceSearch');
					} else {
						if (rightSource.isAlertsViewAllowed || rightSource.isReportsandChartsViewAllowed) {
							defaultMenuOption = 'vhq';
							this.app.runRoute('get', '#dashboard/dashboard/vhq/verifone');
							location.hash = '#verifone/dashboard/vhq';
						} else if (licenseSource.isDeviceLicensed && rightSource.isDevicesViewAllowed) {
							defaultMenuOption = 'deviceSearch';
							this.app.runRoute('get', '#deviceSearch/device/deviceSearch');
							redirectToLocation(menuJsonData, 'deviceSearch');
						} else if (licenseSource.isCareLicensed && rightSource.isVerifoneCareViewAllowed) {
							defaultMenuOption = 'care';
							this.app.runRoute('get', '#dashboard/dashboard/care/verifone');
							redirectToLocation(menuJsonData, 'care');
						} else {
							defaultMenuOption = 'vhq';
							$("#vhq").css("display", "none");
							this.app.runRoute('get', '#dashboard/dashboard/blankVhq/verifone');
						}
					}
				} else {
					if (rightSource.isAlertsViewAllowed || rightSource.isReportsandChartsViewAllowed) {
						defaultMenuOption = 'vhq';
						this.app.runRoute('get', '#dashboard/dashboard/vhq/verifone');
						location.hash = '#verifone/dashboard/vhq';
					} else if (licenseSource.isDeviceLicensed && rightSource.isDevicesViewAllowed) {
						defaultMenuOption = 'deviceSearch';
						this.app.runRoute('get', '#deviceSearch/device/deviceSearch');
						redirectToLocation(menuJsonData, 'deviceSearch');
					} else {
						defaultMenuOption = 'vhq';
						$("#vhq").css("display", "none");
						this.app.runRoute('get', '#dashboard/dashboard/blankVhq/verifone');
					}
				}
				filtercheckfiled = '';
				previousSelectedMenuOption = selectedMenuOption;
				selectedMenuOption = self.menulevel1();

				koUtil.isDeviceProfileScreen = "";
				schedulADApply = 0;

			});
		}).run();
		requirejs.onError = function (error) {
			if (error) {
				if (error.requireModules && error.requireModules.length > 0) {
					var extension = error.requireModules[0].substr((error.requireModules[0].lastIndexOf('.') + 1));
					extension = extension.toLowerCase();
					if (extension == 'js' || extension == 'html') {
						if (previousSelectedMenuOption == 'deviceProfile') {
							koUtil.isDeviceProfile(true);
						}
						if (error.xhr != undefined) {
							if (error.xhr.status == '500') {
								location.href = AppConstants.get('LOGOUT_URL') + '?sessionexpired=true';
							}
						}
					}
				}
				autoRefreshDownloadProgressStop();
			}
			else {
				throw error;
			}
		};

		function loadelementModelPopUp(elementname, controllerId) {
			if (elementname !== '') {
				if (!ko.components.isRegistered(elementname)) {
					generateTemplate(elementname, controllerId);
				}
				self.observableModelPopup(elementname);
			}
		}

		function loadelement(elementname, modelpopupName, controlerId) {
			if (elementname != '') {
				if (!ko.components.isRegistered(elementname)) {
					generateTemplate(elementname, controlerId);
				} else {
					nofityServer();
				}
				self.observableWhoseValueIsAComponentName(elementname);
			}
			if (modelpopupName != '') {
				if (!ko.components.isRegistered(modelpopupName)) {
					generateTemplate(modelpopupName, 'genericPopup');
				} else {
					nofityServer();
				}
				self.observableModelPopup(modelpopupName);
			}
			autoRefreshDownloadProgressStop();
		}

		$("#divsidescroll").dblclick(function (e) {
			e.preventDefault();
			e.stopPropagation();
		});

		//var notification = setInterval(getTaskNotifications, 180000);
		function getTaskNotifications() {
			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						taskNotifications = $.parseJSON(data.getTaskNotificationsResp);
						if (taskNotifications && taskNotifications.length > 0) {
							var config = {};
							config.toasterType = "info"
							config.message = taskNotifications;
							config.title = "Notification";
							config.timeOut = 60000;
							config.showClose = true;
							config.clickToClose = false;
							displayToaster(toaster, config);
						}
					}
				}
			}
			var method = 'GetTaskNotifications';
			var params = '{"token":"' + TOKEN() + '"}';
			ajaxJsonCall(method, params, callbackFunction, false, 'POST', false);
		}

		function getCommonSystemConfiguration(configName) {
			var retval;
			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						data.getCommonSystemConfigurationResp = $.parseJSON(data.getCommonSystemConfigurationResp);
						retval = data.getCommonSystemConfigurationResp.ConfigValue;
					}
				}
			}
			var method = 'GetCommonSystemConfiguration';
			var params = '{"token":"' + TOKEN() + '","configName":"' + configName + '"}';
			ajaxJsonCall(method, params, callbackFunction, false, 'POST', false);
			return retval;
		}

		function getVersion() {
			try {
				$.ajax({
					url: GetVirtualPath() + "/Home/GetVersion",
					type: "GET",
					async: false,
					cache: false,
					success: function (data) {
						self.Version = data.FileVersion;
						self.Copyright = data.Copyright;
					},
					error: function (jqXHR, status, error) {
						if (jqXHR != null) {
							ajaxErrorHandler(jqXHR, status, error);
						}
						token = '';
					}
				});
			}
			catch (error) {
				self.Version = ko.observable('');
				self.Copyright = ko.observable('');
			}

			$("#version").text(self.Version);
			$("#copyright").text(self.Copyright);
		}

		function getCustomers(customers, customerName) {
			$.ajax({
				url: GetVirtualPath() + "/Home/GetCustomers",
				type: "GET",
				cache: false,
				async: false,
				success: function (data) {
					if (data && data.Customers) {
						for (var i = 0; i < data.Customers.length; i++) {
							var customer = {};
							customer.Customer = data.Customers[i];
							if (data.Customers[i] == customerName) {
								customer.IsCurrentCustomer = true;
							} else {
								customer.IsCurrentCustomer = false;
							}
							customers.push(customer);
						}
					}
				},
				error: function (jqXHR, status, error) {
					if (jqXHR != null) {
						ajaxErrorHandler(jqXHR, status, error);
					}
				}
			});
		}

		self.newAlertClick = function () {
			redirectToLocation(menuJsonData, 'alertsOpen');
			$("#notifiCation").addClass('hide');
		}

		// code for Device profile lite code
		if (window.addEventListener) {
			window.addEventListener("message", onMessage, false);
		}
		else if (window.attachEvent) {
			window.attachEvent("onmessage", onMessage, false);
		}
		// Function to be called from iframe
		function calledByExternal(message) {
			loadelementPopUp('message', 'device');
		}
		function onMessage(event) {
			var data = event.data;
			if (data.message !== 'inactivity') {
				ko.UniqueDeviceId = data.deviceUid;
				ko.globalUniqueDeviceId = data.deviceUid;
				self.deviceHierarchy(data.hierarchy.HierarchyFullPath);

				setDeviceLiteObject(data, koUtil);
			}

			if (data.message === 'modelDeviceProfileEditTemplate') {
				getDeviceFormFiles(data);
				return;
			} else if (data.message === 'parameterSyncStatus') {
				getParameterSynchronizationDetails(data);
				return;
			}

			if (typeof (window[data.func]) === "function") {
				window[data.func].call(null, data.message, ko, koUtil, self, sessAliveWarningTime);
			}
		}

		self.unloadTempPopup = function () {
			koUtil.isFromAddDeviceforDirect(false);
			closePopup(self);
		}

		self.cancelHierarchy = function () {
			closePopup(self);
		}

		self.closeParamSyncStatusModal = function (gID) {
			$("#parameterSyncDiv").modal('hide');
			$("#parameterSyncDivContent").css('left', '');
			$("#paramSycIDContent").css('top', '');
			clearUiGridFilter(gID);
			$("#" + gID).jqxGrid('clearselection');
		}

		function checkForWarningOnload() {
			if (hasDashboardViewAccess(userRightData) == true || hasDeviceSearchViewAccess(userRightData) == true || hasMerchantManagementViewAccess(userRightData) || hasDeviceManagementViewAccess(userRightData) == true
				|| hasContentManagementViewAccess(userRightData) == true || hasReportsViewAccess(userRightData) == true || hasAdministrationViewAccess(userRightData) == true) {
				setTimeout(function () {
					var showPopup = resetPreloaderOfDashboard(self.isModelPopup);
					if (showPopup) {
						$(document).ready(function () {
							$('#model-pop-1').modal('show');
						});
					} else {
						$(document).ready(function () {
							$('#model-pop-1').modal('hide');
						});
						self.isModelPopup(true);
					}
				}, 10000);
			}
		}

		/* Edit Parameters from Device Profile */
		function getDeviceFormFiles(eventData) {
			var getDeviceFormFileReq = new Object();
			var Selector = new Object();

			getDeviceFormFileReq.ApplicationId = eventData.applicationId;
			getDeviceFormFileReq.Protocol = koUtil.Protocol;
			getDeviceFormFileReq.IsFromDeviceSearch = false;
			getDeviceFormFileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
			getDeviceFormFileReq.DeviceSearch = null;
			getDeviceFormFileReq.ColumnSortFilter = null;
			Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
			Selector.UnSelectedItemIds = null;
			getDeviceFormFileReq.Selector = Selector;

			function callbackFunction(data, error) {
				if (data) {
					$("#loadingDiv").hide();
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

						if (data.getDeviceFormFileResp && data.getDeviceFormFileResp.ParameterFormFiles && data.getDeviceFormFileResp.ParameterFormFiles.length > 0) {
							getDeviceFormFileResponse = data.getDeviceFormFileResp;

							DeviceParamAppGID = data.getDeviceFormFileResp.AppGID;
							koUtil.editDevicetemplateXML = data.getDeviceFormFileResp.ParameterFormFiles[0].FormFileXML;

							var treeObject;
							var temptreeColl = new Array();

							if (data.getDeviceFormFileResp.ParameterFormFiles && data.getDeviceFormFileResp.ParameterFormFiles.length > 0) {
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
							}

							if (temptreeColl.length > 0) {
								getDeviceFormFileResponse.temptreeColl = temptreeColl;

								if (typeof (window[eventData.func]) === "function") {
									window[eventData.func].call(null, eventData.message, ko, koUtil, self);
								}
							} else {
								openAlertpopup(1, 'you_do_not_have_access_to_the_parent_level');
							}
						}
					}
				}
			}
			$("#loadingDiv").show();
			var method = 'GetDeviceFormFile';
			var params = '{"token":"' + TOKEN() + '","getDeviceFormFileReq":' + JSON.stringify(getDeviceFormFileReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}
		/* Edit Parameters from Device Profile */

		/* View Parameter Sync Status from Device Profile */
		function getParameterSynchronizationDetails(eventData) {
			var getParameterSynchronizationDetailsReq = new Object();
			getParameterSynchronizationDetailsReq.ApplicationId = eventData.applicationId;
			getParameterSynchronizationDetailsReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						$("#parameterSyncDiv").modal('show');

						if (data && data.getParameterSynchronizationDetailsResp) {
							data.getParameterSynchronizationDetailsResp = $.parseJSON(data.getParameterSynchronizationDetailsResp);
						}
						if (data.getParameterSynchronizationDetailsResp) {
							parameterSychronizationArr = data.getParameterSynchronizationDetailsResp.ParameterContainerList;
							jqxGridforParametresSyncStatus(parameterSychronizationArr, 'jqxGridForParameterSynchronization', eventData.deviceXSDVersion);
						} else {
							jqxGridforParametresSyncStatus([], 'jqxGridForParameterSynchronization', eventData.deviceXSDVersion);
						}

					} else if (data.responseStatus.StatusCode == AppConstants.get('POPULATION_OF_THE_APPLICATION_PARAMETERS_IN_PROGRESS')) {
						openAlertpopup(1, 'Population_of_the_application_parameters_in_progress');
					} else if (data.responseStatus.StatusCode == AppConstants.get('EX_NO_BASE_LEVEL_CONTAINERS')) {
						openAlertpopup(1, 'ex_no_base_level_containers');
					}
				}
			}

			var method = 'GetParameterSynchronizationDetails';
			var params = '{"token":"' + TOKEN() + '","getParameterSynchronizationDetailsReq":' + JSON.stringify(getParameterSynchronizationDetailsReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		function jqxGridforParametresSyncStatus(parameterSychronizationArr, gID, deviceXSDVersion) {
			if (!_.isEmpty(parameterSychronizationArr)) {
				for (var i = 0; i < parameterSychronizationArr.length; i++) {
					parameterSychronizationArr[i].LastModifiedOnServer = convertToLocaltimestamp(parameterSychronizationArr[i].LastModifiedOnServer);
					parameterSychronizationArr[i].LastModifiedOnDevice = convertToLocaltimestamp(parameterSychronizationArr[i].LastModifiedOnDevice);
					parameterSychronizationArr[i].LastActivatedOn = convertToLocaltimestamp(parameterSychronizationArr[i].LastActivatedOn);
					parameterSychronizationArr[i].LastSynchronizeddOn = convertToLocaltimestamp(parameterSychronizationArr[i].LastSynchronizeddOn);
				}
			}

			var source =
			{
				dataType: "json",
				localdata: parameterSychronizationArr,
				datafields: [
					{ name: 'IsInSync', map: 'IsInSync' },
					{ name: 'ParameterFileName', map: 'ParameterFileName' },
					{ name: 'ContainerName', map: 'ContainerName' },
					{ name: 'LastModifiedOnServer', map: 'LastModifiedOnServer', type: 'date' },
					{ name: 'LastModifiedOnDevice', map: 'LastModifiedOnDevice', type: 'date' },
					{ name: 'LastActivatedOn', map: 'LastActivatedOn', type: 'date' },
					{ name: 'LastSynchronizeddOn', map: 'LastSynchronizeddOn', type: 'date' },
					{ name: 'ToolTipOnSyncStatus', map: 'ToolTipOnSyncStatus', type: 'string' }
				],

			};

			var dataAdapter = new $.jqx.dataAdapter(source);

			var isInSyncRender = function (row, columnfield, value, defaulthtml, columnproperties) {
				if (value == true) {
					var syncTooltipMessage = i18n.t('parameters_are_in_Sync', { lng: lang });
					return '<div style="padding-top:7px;text-align:center;cursor:pointer;"><i class="icon-checkmark ienable" title="' + syncTooltipMessage + '"></i></div>';
				} else {
					var rowData = $('#' + gID).jqxGrid('getrowdata', row);
					var toolTip = rowData ? rowData.ToolTipOnSyncStatus : "";
					var unSyncTooltipMessage = i18n.t('parameters_are_not_in_Sync', { lng: lang }) + " " + toolTip;
					return '<div style="padding-top:7px;text-align:center;cursor:pointer;"><i class="icon-checkmark idisabled" title=" ' + unSyncTooltipMessage + '"  ></i></div>';
				}
			}
			var isValidXSD = false;
			var xsdVersion = !_.isEmpty(deviceXSDVersion) ? deviceXSDVersion.replace(/\./g, '') : '';
			if (xsdVersion !== '' && parseInt(xsdVersion) >= parseInt("02110013")) {
				isValidXSD = true;
			} else {
				isValidXSD = false;
			}

			// create jqxgrid.
			$("#" + gID).jqxGrid(
				{
					width: "100%",
					height: 220,
					source: dataAdapter,
					sortable: true,
					filterable: false,
					selectionmode: 'singlerow',
					theme: AppConstants.get('JQX-GRID-THEME'),
					altrows: true,
					autoshowcolumnsmenubutton: false,
					showsortmenuitems: false,
					editable: true,
					enabletooltips: false,
					rowsheight: 32,
					columnsResize: true,
					columnsreorder: false,
					columns: [
						{
							text: i18n.t('status', { lng: lang }), datafield: 'IsInSync', menu: false, sortable: false, width: 50, minwidth: 47, editable: false, cellsrenderer: isInSyncRender
						},
						{
							text: i18n.t('parameter_file_name', { lng: lang }), datafield: 'ParameterFileName', menu: false, width: 190, minwidth: 175, editable: false

						},
						{
							text: i18n.t('container_name', { lng: lang }), datafield: 'ContainerName', menu: false, width: 155, minwidth: 145, editable: false

						},
						{
							text: i18n.t('last_modified_on_server', { lng: lang }), datafield: 'LastModifiedOnServer', menu: false, width: 195, minwidth: 178, editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT

						},
						{
							text: i18n.t('last_modified_on_device', { lng: lang }), datafield: 'LastModifiedOnDevice', menu: false, width: 195, minwidth: 178, editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, hidden: !isValidXSD

						},
						{
							text: i18n.t('last_activated_on', { lng: lang }), datafield: 'LastActivatedOn', menu: false, width: 180, minwidth: 178, editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT

						},
						{
							text: i18n.t('last_syncronized_date', { lng: lang }), datafield: 'LastSynchronizeddOn', menu: false, width: 190, minwidth: 184, editable: false, resizable: false, cellsformat: LONG_DATETIME_GRID_FORMAT

						}
					]
				});

			$("#" + gID).jqxGrid('updatebounddata');

			$("#columntablejqxGridForParameterSynchronization .jqx-grid-column-sortascbutton").css({ "margin-left": "14px" });
			$("#columntablejqxGridForParameterSynchronization .jqx-grid-column-sortdescbutton").css({ "margin-left": "14px" });
		}
		/* View Parameter Sync Status from Device Profile */

		seti18nResourceData(document, resourceStorage);
	};

	function showNavBars() {
		$('#navbar_head').show();
		$('#collapsibleanimatedDiv').show();
		$('#sidebarbgDiv').show();
		$('#sidebar').show();
		$("#footerX").show();
	}

	function changethemeColor(themeName, isChangedByUser) {
		$('link[rel="stylesheet"]').each(function () {
			if ($(this).prop('href').indexOf("assets/css/theme") >= 0) {
				var _link = $(this);
				(_link.prop('title') == themeName) ? _link.prop("disabled", false) : _link.prop("disabled", true);
			}
		});

		if (isChangedByUser) {
			var newUserObject = new Object();
			var currentDate = moment().format('MM/DD/YYYY');
			newUserObject.ColorTheme = themeName;
			newUserObject.UserGuid = userGuid;
			newUserObject.LastFailedLoginDate = createJSONTimeStamp(currentDate);
			newUserObject.LastLoginDate = createJSONTimeStamp(currentDate);
			newUserObject.RowInsertedDate = createJSONTimeStamp(currentDate);
			newUserObject.RowUpdatedDate = createJSONTimeStamp(currentDate);
			newUserObject.PasswordExpirationDate = createJSONTimeStamp(currentDate);
			IspasswordChangeRequired = false;
			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						//createCookie('css', css, 365);
					}
				}
			}

			var method = 'SetUser';
			var params = '{"token":"' + TOKEN() + '","user":' + JSON.stringify(newUserObject) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		if (themeName == 'green' || themeName == 'black')
			$('#img_vhq_logo').prop('src', 'assets/images/verifone.png');
		else if (themeName == 'default' || themeName == 'grey')
			$('#img_vhq_logo').prop('src', 'assets/images/verifone_logo.png');

		if (themeName == 'green')
			$('#img_default-user').prop('src', 'assets/images/user_icon_green.gif');
		else
			$('#img_default-user').prop('src', 'assets/images/user-13.jpg');

	};

	function GetUserInformationFromToken() {
		function callbackFunction(data, error) {

			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					var userArr = new Array();
					var customerArr = new Array();
					userArr.push(data.user);
					customerArr.push(data.customer);

					if (data.userRightsList && data.userRightsList.length > 0) {
						userRightData = data.userRightsList;
					}

					if (data.customer && data.customer.CustomerLicenseInfo) {
						if (data.customer.CustomerLicenseInfo.Menu && data.customer.CustomerLicenseInfo.Menu !== "[]") {
							menuJSON = $.parseJSON(data.customer.CustomerLicenseInfo.Menu);
						} else {
							menuJSON = getmenulist(false);
						}

						licenseInfo.LicenseBundle = data.customer.CustomerLicenseInfo.LicenseBundle;
						if (data.customer.CustomerLicenseInfo.Features) {
							licenseInfo.licensedFeatures = data.customer.CustomerLicenseInfo.Features;
							isCareEnabled = licenseInfo.licensedFeatures.indexOf("Care") > -1 ? true : false;
							var careLicense = isCareEnabled ? '1' : '0'
							window.sessionStorage.setItem("careEnabled", careLicense);
							getLicensedFeatures(licenseInfo.licensedFeatures);
						}
						licenseInfo.licenseExpiryDate = jsonDateConversion(data.customer.CustomerLicenseInfo.ExpiryDate, LONG_DATE_FORMAT);
						licenseInfo.licensedDeviceCount = data.customer.CustomerLicenseInfo.LicensedDeviceCount;
						licenseInfo.numberOfDeviceCount = data.customer.CustomerLicenseInfo.NumberOfDeviceCount;
						licenseInfo.customerGUID = data.customer.CustomerGUID;

						dashboardWidgets = getDashboardJSON();
					}
					userPersonalization = data.userPersonalization;
					globalUserPreferenceObject = data.userPersonalization;

					window.sessionStorage.setItem("customerData", JSON.stringify(customerArr));
					window.sessionStorage.setItem("userrData", JSON.stringify(userArr));
					window.sessionStorage.setItem("userRightData", JSON.stringify(data.userRightsList));
					window.sessionStorage.setItem("CustomerId", data.customer.CustomerId);

					isDevicesViewAllowed = userHasViewAccess("Devices");
					isDeviceSubStatusAllowed = userHasViewAccess("System Settings");
					if (isDevicesViewAllowed || isDeviceSubStatusAllowed) {
						isDeviceSubStatusAllowed = true;
					}
					isReportsandChartsAllowed = userHasViewAccess("Reports and Charts");

					customerData = JSON.parse(sessionStorage.getItem("customerData"));

					if (customerData && customerData.length > 0) {

						customerID = parseInt(customerData[0].CustomerId);
						customerGUID = customerData[0].CustomerGUID;
						IsMMEnabled = customerData[0].IsMMEnabled;
						IsAcquirerCommerceEnabled = customerData[0].IsCommerceEnabled;

						IsVFSSOUser = customerData[0].IsVFSSOIdP;
						IsForgeRockUser = customerData[0].IsForgeRockIDP;
						IsVHQAuthorizedUser = customerData[0].IsVHQAuthorization;
						IsVHQNativeAuthentication = customerData[0].IsDefault;
						IsADUser = false;
						IsADFSUser = false;
						IsExternalIdp = customerData[0].IsExternal;
						IsSupportIdp = customerData[0].IsSupportIdp;
						IsMarketPlaceEnabled = customerData[0].IsMarketPlaceEnabled;
						var LDAP = customerData[0].LDAP;
						if (!IsVFSSOUser && customerData[0].IsDefault && LDAP != '' && !IsForgeRockUser) {
							IsADUser = true;
						} else if (!IsVFSSOUser && customerData[0].IsDefault && LDAP == '' && !IsForgeRockUser) {
							IsVHQNativeAuthentication = true;
						}
						if (!IsVHQNativeAuthentication) {
							IsADFSUser = true;
						}

						customerFullName = customerData[0].CustomerFullName;
						EnforceVHQSecurityPolicies = customerData[0].EnforceVHQSecurityPolicies;
						IsPasswordChangeAllowed = customerData[0].UserPolicyInfo.IsPasswordChangeAllowed;

						IsHierarchyAccessViaADFS = customerData[0].HierarchyAccessViaADFS;
					}

					//intialize the storage
					var chartlist = sessionStorage.getItem("chartlist");
					if (chartlist == null || chartlist == '' || JSON.parse(sessionStorage.getItem("chartlist")) == null) {
						var chartlistArr = new Array();
						chartlistArr.push('jqxChart');
						window.sessionStorage.setItem('chartlist', JSON.stringify(chartlistArr));
					}
					var pagelist = sessionStorage.getItem("Pagelist");
					if (pagelist == null || pagelist == '' || JSON.parse(sessionStorage.getItem("Pagelist")) == null) {
						var PagelistArr = new Array();
						PagelistArr.push('page');
						window.sessionStorage.setItem('Pagelist', JSON.stringify(PagelistArr));
					}
					var gridlist = sessionStorage.getItem("gridlist");
					if (gridlist == null || gridlist == '' || JSON.parse(sessionStorage.getItem("gridlist")) == null) {
						var gridlistArr = new Array();
						gridlistArr.push('jqxGrid');
						window.sessionStorage.setItem('gridlist', JSON.stringify(gridlistArr));
					}
					var adlist = sessionStorage.getItem("adlist");
					if (adlist == null || adlist == '' || JSON.parse(sessionStorage.getItem("adlist")) == null) {
						var adlistArr = new Array();
						adlistArr.push('advanced');
						window.sessionStorage.setItem('adlist', JSON.stringify(adlistArr));
					}
					var filterlist = sessionStorage.getItem("filterlist");
					if (filterlist == null || filterlist == '' || JSON.parse(sessionStorage.getItem("filterlist")) == null) {
						var filterlistArr = new Array();
						filterlistArr.push('filter');
						window.sessionStorage.setItem('filterlist', JSON.stringify(filterlistArr));
					}

					if (sessionStorage.getItem("userrData") == null || sessionStorage.getItem("userrData") == "" ||
						sessionStorage.getItem("customerData") == null || sessionStorage.getItem("customerData") == "") {
						Token_Expired();
						fullname = "";
					} else {
						userData = JSON.parse(sessionStorage.getItem("userrData"));
						fullname = userData[0].FullName;
						loggedInUserEmail = userData[0].AlertEmail;
						userGuid = userData[0].UserGuid;
						IsCommonUser = userData[0].IsCommonUser;
						firstName = userData[0].LoginName;
						colorTheme = userData[0].ColorTheme;

						if (sessionStorage.getItem("userRightData") != null || sessionStorage.getItem("userRightData") != "") {
							userRightData = JSON.parse(sessionStorage.getItem("userRightData"));
							autho.rightsData(userRightData);

							SetUIAccessibilityBasedOnUserRights(autho.rightsData());
						}
					}
				} else {
					if (VHQFlag === false) {
						$("#loadingDiv").hide();
						$("#errorDiv").show();
						if (data.responseStatus.StatusCode == AppConstants.get('UNAUTHORIZED_ACCESS')) {                 //11
							$("#errorMessageDiv").text('Un-authorized access. Please contact VHQ Support team for help (DP5011).');
						} else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {    //12
							$("#errorMessageDiv").text('Token expired. Un-authorized request (DP5012).');
						} else if (data.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR')) {              //112
							$("#errorMessageDiv").text('Please contact VHQ Support team for help (DP5010).');
						} else if (data.responseStatus.StatusCode == AppConstants.get('ACCESS_DENIED')) {               //186
							$("#errorMessageDiv").text('Un-authorized access. Please contact VHQ Support team for help (DP5009).');
						} else if (data.responseStatus.StatusCode == AppConstants.get('ACCESS_DENIED_LOGIN')) {         //Access_Denied
							$("#errorMessageDiv").text('Un-authorized access. Please contact VHQ Support team for help (DP5009).');
						} else if (data.responseStatus.StatusCode == AppConstants.get('LICENSE_EXPIRED_LOGIN')) {       //LICENSE_EXPIRED
							$("#errorMessageDiv").text('License expired. Please contact VHQ Support team for help (DP5009).');
						} else if (data.responseStatus.StatusCode == AppConstants.get('SYSTEM_BUSY')) {                 //263
							$("#errorMessageDiv").text('VHQ Server not reachable. Please contact VHQ Support team for help (DP5006).');
						}
					}
				}
			}
		}

		var d = new Date()
		var n = d.getTimezoneOffset();
		var gmtDate = new Date();
		var minOffset = -1 * gmtDate.getTimezoneOffset();
		var dtformate = "dd/MMM/yyyy hh:mm:ss tt";

		var clientInfo = new Object();
		clientInfo.ClientDateFormat = dtformate;
		clientInfo.ClientTimeOffset = minOffset;
		var method = 'GetUserInformationFromToken';
		var params = '{"token":"' + TOKEN() + '","clientInfo":' + JSON.stringify(clientInfo) + '}';
		ajaxJsonCall(method, params, callbackFunction, false, 'POST', false);
	}

	function generateTemplate(tempname, controlerId) {
		//new template code
		var htmlName = '../template/' + controlerId + '/' + tempname + '.html';
		var ViewName = 'controller/' + controlerId + '/' + tempname + '.js';
		ko.components.register(tempname, {
			viewModel: { require: ViewName },
			template: { require: 'plugin/text!' + htmlName }

		});
		// end new template code     
	}

	function getTimeZones() {
		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					data.timeZonesList = $.parseJSON(data.timeZonesList);
					getAllTimeZones = data.timeZonesList;

					var timeZoneObj = new Object();
					timeZoneObj.Active = false;
					timeZoneObj.Description = '(Blank)';
					timeZoneObj.TimeOffsetInMinutesFromUTC = -1;
					timeZoneObj.TimeZoneId = -1;
					timeZoneObj.TimeZoneName = '';
					getAllTimeZones.unshift(timeZoneObj);
				}
			}
		}
		var method = 'GetTimeZones';
		var params = '{"token":"' + TOKEN() + '"}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
	}

	function getModels(models) {
		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.models)
						data.models = $.parseJSON(data.models);
					models(data.models);

					if (models) {
						models.sort(function (a, b) { return a.ModelName.toUpperCase() > b.ModelName.toUpperCase() ? 1 : -1; })
					}
					koUtil.getModelsFamily(data.models);
					koUtil.rootmodels = models();
				}
			}
		}
		var method = 'GetModels';
		var params = '{"token":"' + TOKEN() + '"}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	function getMultiChoiceFilterData(globalmultiChoiceFilterData) {
		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.multiChoiceFilterData)
						data.multiChoiceFilterData = $.parseJSON(data.multiChoiceFilterData);

					globalmultiChoiceFilterData.push(data.multiChoiceFilterData);
				}
			}
		}
		var method = 'GetMultiChoiceFilterData';
		var params = '{"token":"' + TOKEN() + '"}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}


	function GetUser(GetUsers, UserData, fullUserName) {

		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					GetUsers(data);
					if (data.user)
						data.user = $.parseJSON(data.user);
					if (data.userGroups)
						data.userGroups = $.parseJSON(data.userGroups);
					if (data.userHierarchies) {
						window.sessionStorage.setItem("userHierarchies", data.userHierarchies);
						data.userHierarchies = $.parseJSON(data.userHierarchies);
						var userHierarchyData = window.sessionStorage.getItem('userHierarchies');
					}
					if (data.userSubscribedAlerts)
						data.userSubscribedAlerts = $.parseJSON(data.userSubscribedAlerts);
					if (data.userHierarchies) {
						koUtil.hierarchyIdForScheule = data.userHierarchies[0].Id;
						if (data.userHierarchies[0].HierarchyName && data.userHierarchies[0].HierarchyName != "") {
							hierarchyName = data.userHierarchies[0].HierarchyName;
							$("#lblFilter").text(hierarchyName);
							$("#userfullnameId").text(data.user.FullName);
							fullUserName(data.user.FullName);
						} else {
							$("#lblFilter").text("No Filter Selected. All Devices Selected.");
						}
						for (i = 0; i < data.userHierarchies.length; i++) {
							if (data.userHierarchies[i].HierarchyName && data.userHierarchies[i].HierarchyName != "") {
								var row = $("<tr />")
								$("#itemTbodyUserHierarchies").append(row);
								row.append($("<td>" + data.userHierarchies[i].HierarchyName + "</td>"));
								row.append($("<td>" + data.userHierarchies[i].LevelName + "</td>"));
							}
						}
					}

					userGlobalData = data;

					//--VHQ-15873 --Enbale Global search for all users from Admin (Shows Public&Private searches to Admin users)                   
					if (data.userGroups) {
						for (i = 0; i < data.userGroups.length; i++) {
							if (data.userGroups[i].Role) {
								if (data.userGroups[i].Role.RoleName == "Administrators") {
									isUserInAdminRole = true;
									break;
								}
							}
						}
					}
					UserData(data);
				}
			}
		}

		var method = 'GetUser';
		var params = '{"token":"' + TOKEN() + '","userGuid":"' + userGuid + '"}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
	}

	function getHierarchyLevels() {
		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.hierarchyLevels)
						data.hierarchyLevels = $.parseJSON(data.hierarchyLevels);
					heirarchyData = data.hierarchyLevels;
				}
			}
		}
		var method = 'GetHierarchyLevels';
		var params = '{"token":"' + TOKEN() + '"}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
	}

	function getAllReports(menus, menuData, flag) {

		function callbackFunction(data, error) {
			if (data) {

				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.getAllReportsResp)
						data.getAllReportsResp = $.parseJSON(data.getAllReportsResp);

					koUtil.reportData = data.getAllReportsResp;

					for (var i = 0; i < menuData.length; i++) {

						if (menuData[i].id == 'reports' || menuData[i].id == 'reportsandcharts') {
							//for StandardReport
							var dupes = {};
							var singles = [];

							$.each(data.getAllReportsResp.StandardReports, function (i, el) {

								if (!dupes[el.CategoryName]) {
									dupes[el.CategoryName] = true;
									singles.push(el);
								}
							});
							singles.sort(function (a, b) { return a.CategoryName > b.CategoryName ? 1 : -1; })
							var standarReportChildArr = new Array();
							for (var j = 0; j < singles.length; j++) {
								var standarReportChildObj = new Object();
								standarReportChildObj.id = 'reports' + singles[j].CategoryName;
								standarReportChildObj.parentId = 'reports';
								standarReportChildObj.rootParentId = menuData[i].id;
								standarReportChildObj.childParentId = 'standardReport';
								standarReportChildObj.subChildParentId = 'reports' + singles[j].CategoryName;
								standarReportChildObj.controlerId = 'reports';
								standarReportChildObj.name = 'reports' + singles[j].CategoryName;
								var ChildSubChildrenArr = new Array();
								for (var k = 0; k < data.getAllReportsResp.StandardReports.length; k++) {
									if (data.getAllReportsResp.StandardReports[k].CategoryName == singles[j].CategoryName) {
										var subChildernObj = new Object();
										subChildernObj.id = data.getAllReportsResp.StandardReports[k].ReportId;
										subChildernObj.name = data.getAllReportsResp.StandardReports[k].ReportName;
										subChildernObj.controlerId = 'reports';
										subChildernObj.parentId = 'reports' + singles[j].CategoryName;
										subChildernObj.rootParentId = menuData[i].id;
										subChildernObj.reportType = data.getAllReportsResp.StandardReports[k].ReportType;
										subChildernObj.templateId = 'standardReports';

										ChildSubChildrenArr.push(subChildernObj)
										ChildSubChildrenArr.sort(function (a, b) { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1; })
									}

								}
								standarReportChildObj.subChildChildern = ChildSubChildrenArr;
								standarReportChildArr.push(standarReportChildObj);
							}


							var standarObj = new Object();
							standarObj.id = "standardReports";
							standarObj.controlerId = "reports";
							standarObj.parentId = "reports";
							standarObj.rootParentId = menuData[i].id;
							standarObj.childParentId = "subscriptionList";
							standarObj.name = "standardReports";
							standarObj.Subchild = standarReportChildArr;



							menuData[i].children.push(standarObj);

							//end StandardReport

							//for CustomeReport

							var dupes = {};
							var singles = [];

							$.each(data.getAllReportsResp.CustomReports, function (i, el) {

								if (!dupes[el.CategoryName]) {
									dupes[el.CategoryName] = true;
									singles.push(el);
								}
							});
							singles.sort(function (a, b) { return a.CategoryName > b.CategoryName ? 1 : -1; })
							var standarReportChildArr = new Array();
							for (var j = 0; j < singles.length; j++) {
								var standarReportChildObj = new Object();
								standarReportChildObj.id = 'reports' + singles[j].CategoryName;
								standarReportChildObj.parentId = 'reports';
								standarReportChildObj.rootParentId = menuData[i].id;
								standarReportChildObj.childParentId = 'customReport';
								standarReportChildObj.subChildParentId = 'reports' + singles[j].CategoryName;
								standarReportChildObj.controlerId = 'reports';
								standarReportChildObj.name = 'reports' + singles[j].CategoryName;
								var ChildSubChildrenArr = new Array();
								for (var k = 0; k < data.getAllReportsResp.CustomReports.length; k++) {
									if (data.getAllReportsResp.CustomReports[k].CategoryName == singles[j].CategoryName) {
										var subChildernObj = new Object();
										subChildernObj.id = data.getAllReportsResp.CustomReports[k].ReportId;
										subChildernObj.name = data.getAllReportsResp.CustomReports[k].ReportName;
										subChildernObj.controlerId = 'reports';
										subChildernObj.parentId = 'reports' + singles[j].CategoryName;
										subChildernObj.rootParentId = menuData[i].id;
										subChildernObj.reportType = data.getAllReportsResp.CustomReports[k].ReportType;
										subChildernObj.templateId = 'standardReports';

										ChildSubChildrenArr.push(subChildernObj)
										ChildSubChildrenArr.sort(function (a, b) { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1; })
									}

								}
								standarReportChildObj.subChildChildern = ChildSubChildrenArr;
								standarReportChildArr.push(standarReportChildObj);
							}
							var standarObj = new Object();
							standarObj.id = "customReports";
							standarObj.controlerId = "reports";
							standarObj.parentId = "reports";
							standarObj.rootParentId = menuData[i].id;
							standarObj.childParentId = "subscriptionList";
							standarObj.name = "customReport";
							standarObj.Subchild = standarReportChildArr;
							menuData[i].children.push(standarObj);
							//end CustomeReport
						}

					}

					//menus([]);
					//menus(menuData)
					//alert('');
					//menus(menuData)

					if (flag == 1) {
						//window.location.replace("#BlankCustomScreen");
						setMenuSelection();
					}

				}
			}
			menus([]);
			menus(menuData)

		}
		var params = '{"token":"' + TOKEN() + '"}';
		ajaxJsonCall('GetAllReports', params, callbackFunction, false, 'POST', true);
	}


	function getAllReportsafterAddDelete(menus, menuData, flag) {

		function callbackFunction(data, error) {
			if (data) {

				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.getAllReportsResp)
						data.getAllReportsResp = $.parseJSON(data.getAllReportsResp);

					koUtil.reportData = data.getAllReportsResp;
					var arr = menus();


					for (var i = 0; i < arr.length; i++) {
						//for CustomeReport

						var dupes = {};
						var singles = [];

						$.each(data.getAllReportsResp.CustomReports, function (i, el) {

							if (!dupes[el.CategoryName]) {
								dupes[el.CategoryName] = true;
								singles.push(el);
							}
						});

						var standarReportChildArr = new Array();
						for (var j = 0; j < singles.length; j++) {
							var standarReportChildObj = new Object();
							standarReportChildObj.id = 'reports' + singles[j].CategoryName;
							standarReportChildObj.parentId = 'reports';
							standarReportChildObj.childParentId = 'customReport';
							standarReportChildObj.subChildParentId = 'reports' + singles[j].CategoryName;
							standarReportChildObj.controlerId = 'reports';
							standarReportChildObj.name = 'reports' + singles[j].CategoryName;
							var ChildSubChildrenArr = new Array();
							for (var k = 0; k < data.getAllReportsResp.CustomReports.length; k++) {
								if (data.getAllReportsResp.CustomReports[k].CategoryName == singles[j].CategoryName) {
									var subChildernObj = new Object();
									subChildernObj.id = data.getAllReportsResp.CustomReports[k].ReportId;
									subChildernObj.name = data.getAllReportsResp.CustomReports[k].ReportName;
									subChildernObj.controlerId = 'reports';
									subChildernObj.parentId = 'reports' + singles[j].CategoryName;
									subChildernObj.reportType = data.getAllReportsResp.CustomReports[k].ReportType;
									subChildernObj.templateId = 'standardReports';

									ChildSubChildrenArr.push(subChildernObj)
									ChildSubChildrenArr.sort(function (a, b) { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1; })
								}

							}
							standarReportChildObj.subChildChildern = ChildSubChildrenArr;
							standarReportChildArr.push(standarReportChildObj);
						}
						var standarObj = new Object();
						standarObj.id = "customReport";
						standarObj.controlerId = "reports";
						standarObj.parentId = "reports";
						standarObj.childParentId = "subscriptionList";
						standarObj.name = "customReport";
						standarObj.Subchild = standarReportChildArr;
						arr[i].children.push(standarObj);
						//end CustomeReport
					}

					menus(arr);
				}
			}

		}
		var params = '{"token":"' + TOKEN() + '"}';
		ajaxJsonCall('GetAllReports', params, callbackFunction, true, 'POST', true);
	}

	function getFolders() {

		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.getFoldersResp) {
						data.getFoldersResp = $.parseJSON(data.getFoldersResp);

						globalFoldersArray = data.getFoldersResp.Folders;
						if (globalFoldersArray && globalFoldersArray.length > 0) {
							for (var i = 0; i < globalFoldersArray.length; i++) {
								var folderObject = new Object();
								folderObject.Id = globalFoldersArray[i].FolderId;
								folderObject.Name = "Folder Name";
								folderObject.ControlValue = globalFoldersArray[i].FolderName;
								folderObject.Value = globalFoldersArray[i].FolderName;
								globalFoldersFilterArray.push(folderObject);
							}
						}
					}
				}
			}
		}

		var method = 'GetFolders';
		var params = '{"token":"' + TOKEN() + '"}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
	}

	function getmenulist(IsMarketPlaceEnabled) {
		var menu = "Menu";
		if (IsMarketPlaceEnabled) {
			menu = "VerifoneConnectMenu";
		}
		var retval = "";
		$.ajax({
			type: "GET",
			url: "assets/json/" + menu + ".json",
			dataType: 'json',
			async: false,
			success: function (data) {
				retval = data;
			},
			error: function (jqXHR, status, error) {
				if (jqXHR != null) {
					ajaxErrorHandler(jqXHR, status, error);
					if (jqXHR.status != 401) {
						openAlertpopup(2, 'network_error');
					}
				} else {
					openAlertpopup(2, 'network_error');
				}
			}
		});
		return retval;
	}

});

//----------//

function onclicksavedCustomeReports(ReportName) {
	var reportSource = _.where(updateReportArr, { name: ReportName });
	var customReportObject = (!_.isEmpty(reportSource) && reportSource.length > 0) ? reportSource[0] : new Object();

	$("#" + customReportObject.id).parent('li').parent('ul').each(function () {
		$(this).children('li').children('a').removeClass('active');
	});
	$("#" + customReportObject.id).addClass('active');

	var source = _.where(menuJsonData, { id: customReportObject.controlerId });
	if (!_.isEmpty(source) && source.length > 0) {
		var childParentMenu = _.where(source[0].children, { id: 'customReports' });
		if (!_.isEmpty(childParentMenu) && childParentMenu.length > 0) {
			var subChild = _.where(childParentMenu[0].Subchild, { id: customReportObject.parentId });      //child menu
			if (!_.isEmpty(subChild) && subChild.length > 0) {
				if (subChild[0].subChildChildern != undefined && subChild[0].subChildChildern != null) {
					var customReport = _.where(subChild[0].subChildChildern, { id: customReportObject.id });
					if (_.isEmpty(customReport)) {
						subChild[0].subChildChildern.push(customReportObject);
					}
				}
			}
		}
	}

	location.hash = customReportObject.reportType + "/" + customReportObject.controlerId + "/" + customReportObject.templateId + "/" + customReportObject.id + "/" + customReportObject.name.replace('/', ' ') + '/' + customReportObject.parentId + "/" + customReportObject.rootParentId;
	mainMenuSetSelection(customReportObject.parentId);
}

function GetConfigurations() {
	var GetConfigurationsReq = new Object();
	var CategoryConfigValues = [
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('GUI_IDLE_TIMEOUT') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('SWAP_APPROVAL_REQUIRED') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('DIRECT_PARAMETER_ACTIVATION') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('CONFIG_NOTIFY_ALERTS_ON_UI') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('CONFIG_ALERT_NOTIFICATION_FREQUENCY') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('INCLUDE_INACTIVE_DEVICES_FOR_SCHEDULING') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('CUSTOMER_ENABLED_FOR_VERIFONE_CENTRAL') },

		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('MAXIMUM_HIERARCHIES_PER_USER') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('MAX_SCHEDULE_COUNT_PER_JOB') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('MAX_VRK_FILES_ALLOWED') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('MAX_PACKAGES_PER_REFERENCESET') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('MAX_REFERENCESETS_PER_HIERARCHY') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('DIAGNOSTIC_DOWNLOAD_FILE_SIZE_LIMIT') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('RF_PT_LOCK_CONFIG') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('HOSTNAME') },
		{ ConfigCategory: 'SYSTEM', Category: 'Security', ConfigName: AppConstants.get('PASSWORD_POLICY_NOTE') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('SOFTWARE_PACKAGE_FILE_TYPES') },
		//EO Portal Configurations 
		{ ConfigCategory: 'SYSTEM', Category: 'EOPortal', ConfigName: AppConstants.get('CONFIG_COMMERCE_PLATFORM_ENABLED') },
		{ ConfigCategory: 'SYSTEM', Category: 'EOPortal', ConfigName: AppConstants.get('EOPORTAL_URL') },

		{ ConfigCategory: 'CONTENT', Category: 'CONTENT', ConfigName: AppConstants.get('CONTENT_PACKAGE_FILE_TYPES') },

		{ ConfigCategory: 'GENERIC', Category: AppConstants.get('CATEGORY_CALLTYPE'), ConfigName: AppConstants.get('CATEGORY_CALLTYPE') },
		{ ConfigCategory: 'GENERIC', Category: AppConstants.get('SOFTWARE_PACKAGE_FILE_TYPE'), ConfigName: AppConstants.get('SOFTWARE_PACKAGE_FILE_TYPE') },
		{ ConfigCategory: 'GENERIC', Category: AppConstants.get('CONTENT_TARGET_USER_TYPES'), ConfigName: AppConstants.get('CONTENT_TARGET_USER_TYPES') },
		{ ConfigCategory: 'GENERIC', Category: AppConstants.get('DEVICE_CONTENT_FILE_NAME'), ConfigName: AppConstants.get('DEVICE_CONTENT_FILE_NAME') },
		{ ConfigCategory: 'GENERIC', Category: AppConstants.get('DEVICE_FILE_LOCATION'), ConfigName: AppConstants.get('DEVICE_FILE_LOCATION') },
		{ ConfigCategory: 'SYSTEM', Category: 'SafetyNets', ConfigName: AppConstants.get('SAFETY_NETS_DEVICE_MOVE') },
		{ ConfigCategory: 'SYSTEM', Category: 'SafetyNets', ConfigName: AppConstants.get('SAFETY_NETS_DEVICE_SOFTWARE') },
		{ ConfigCategory: 'SYSTEM', Category: 'SafetyNets', ConfigName: AppConstants.get('SAFETY_NETS_DEVICE_PARAMETER') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('SFTP_DISTRIBUTION_CONFIGNAME') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('MAX_DOWNLOADS_PER_JOB') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('MAX_CSV_DEVICE_SEARCH_COUNT') },
		{ ConfigCategory: 'SYSTEM', Category: 'SYSTEM', ConfigName: AppConstants.get('PACKAGE_FILE_NAME_MAX_CHARS') }
	];

	GetConfigurationsReq.CategoryConfigValues = CategoryConfigValues;

	function callbackFunction(data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				if (data.getConfigurationsResp && data.getConfigurationsResp != "null") {
					data.getConfigurationsResp = $.parseJSON(data.getConfigurationsResp);

					hostName = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('HOSTNAME')); }))[0].ConfigValue;
					passwordPolicyText = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "Security" && v["ConfigName"] == AppConstants.get('PASSWORD_POLICY_NOTE')); }))[0].ConfigValue;
					callTypeConfigurations = data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "GENERIC" && v["Category"] == AppConstants.get('CATEGORY_CALLTYPE')); });
					packageTypes = data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "GENERIC" && v["Category"] == AppConstants.get('SOFTWARE_PACKAGE_FILE_TYPE')); });
					targetUsers = data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "GENERIC" && v["Category"] == AppConstants.get('CONTENT_TARGET_USER_TYPES')); });
					fileNames = data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "GENERIC" && v["Category"] == AppConstants.get('DEVICE_CONTENT_FILE_NAME')); });
					deviceFileLocations = data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "GENERIC" && v["Category"] == AppConstants.get('DEVICE_FILE_LOCATION')); });

					//Swap Approval Required
					if (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('SWAP_APPROVAL_REQUIRED')); })[0].ConfigValue == 1) {
						isSwapApprovalRequired = true;
					} else {
						isSwapApprovalRequired = false;
					}

					//Direct Parameter Activation
					if (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('DIRECT_PARAMETER_ACTIVATION')); })[0].ConfigValue == 1) {
						isDirectParameterActivation = true;
					} else {
						isDirectParameterActivation = false;
					}

					//Customer Enabled for Verifone Central
					if (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('CUSTOMER_ENABLED_FOR_VERIFONE_CENTRAL')); })[0].ConfigValue == 1) {
						isCustomerEnabledforVerifoneCentral = true;
					} else {
						isCustomerEnabledforVerifoneCentral = false;
					}

					//EXTENSIONS

					softwarePackageExtensions = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('SOFTWARE_PACKAGE_FILE_TYPES')); }))[0].ConfigValue;
					softwarePackageExtensions = softwarePackageExtensions.replace(/\*./g, '');

					var contentFileTypes = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "Content" && v["ConfigName"] == AppConstants.get('CONTENT_PACKAGE_FILE_TYPES')); }))[0].ConfigValue;
					contentPackageFileTypes = contentFileTypes.replace(/\*./g, '').split(',');


					//Notify Alerts on UI
					isNotifyAlertOnUIEnabled = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('CONFIG_NOTIFY_ALERTS_ON_UI')); }))[0].ConfigValue;
					if (isNotifyAlertOnUIEnabled != null && isNotifyAlertOnUIEnabled != undefined && isNotifyAlertOnUIEnabled > 0) {
						noOfMinutesToNotifyAlert = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('CONFIG_ALERT_NOTIFICATION_FREQUENCY')); }))[0].ConfigValue
						SetAlertsTime();
					}

					if (IsMMEnabled) {
						estateManagerURL = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == AppConstants.get('EOPORTAL') && v["ConfigName"] == AppConstants.get('EOPORTAL_URL')); }))[0].ConfigValue;
					}

					//Include Inactive Devices for Scheduling
					includeInactiveDevicesForDownload = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('INCLUDE_INACTIVE_DEVICES_FOR_SCHEDULING')); }))[0].ConfigValue;

					//Maximum Hierarchies Per User
					maximumHierarchiesPerUser = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('MAXIMUM_HIERARCHIES_PER_USER')); }))[0].ConfigValue;
					//Maximum Schedules Per Job
					maximumSchedulesPerJob = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('MAX_SCHEDULE_COUNT_PER_JOB')); }))[0].ConfigValue;
					//Maximum VRK File to Upload
					maximumVRKFilesToUpload = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('MAX_VRK_FILES_ALLOWED')); }))[0].ConfigValue;
					//Maximum Packages Per Reference Set
					maximumPackagesPerReferenceSet = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('MAX_PACKAGES_PER_REFERENCESET')); }))[0].ConfigValue;
					//Maximum Reference Sets Per Hierarchy
					maximumReferenceSetsPerHierarchy = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('MAX_REFERENCESETS_PER_HIERARCHY')); }))[0].ConfigValue;
					//Diagnostic Download File Size Limit
					exportFileSizeLimit = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('DIAGNOSTIC_DOWNLOAD_FILE_SIZE_LIMIT')); }))[0].ConfigValue;
					// ReferenceSet and Parameter Template Lock
					referenceSetParameterTemplateLock = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('RF_PT_LOCK_CONFIG')); }))[0].ConfigValue == 1;

					if (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "EOPortal" && v["ConfigName"] == AppConstants.get('CONFIG_COMMERCE_PLATFORM_ENABLED')); })[0].ConfigValue == 0) {
						// $("#merchants").css("display", "none");
					} else {
						sess_warningMinutes = idletimeout;
						sessAliveWarningTime = sess_warningMinutes * 60000;
						initSession(sess_warningMinutes);
					}

					var idletimeout = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('GUI_IDLE_TIMEOUT')); }))[0].ConfigValue
					if (idletimeout == "0") {

					} else {
						sess_warningMinutes = idletimeout;
						sessAliveWarningTime = sess_warningMinutes * 60000;
						initSession(sess_warningMinutes);
					}
					//SFTP_DISTRIBUTION
					sftpFileRepositoryLocation = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('SFTP_DISTRIBUTION_CONFIGNAME')); }))[0].ConfigValue;

					//Safety Nets
					deviceMoveLimit = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "SafetyNets" && v["ConfigName"] == AppConstants.get('SAFETY_NETS_DEVICE_MOVE')); }))[0].ConfigValue;
					deviceSoftwareAssignmentLimit = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "SafetyNets" && v["ConfigName"] == AppConstants.get('SAFETY_NETS_DEVICE_SOFTWARE')); }))[0].ConfigValue;
					deviceEditParameterLimit = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "SafetyNets" && v["ConfigName"] == AppConstants.get('SAFETY_NETS_DEVICE_PARAMETER')); }))[0].ConfigValue;
					//Maximum number of downloads allowed per Job
					maximumDownloadsPerJob = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('MAX_DOWNLOADS_PER_JOB')); }))[0].ConfigValue;
					maximumcsvDeviceSearchCount = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('MAX_CSV_DEVICE_SEARCH_COUNT')); }))[0].ConfigValue;
					maximumPackageNameLength = (data.getConfigurationsResp.ConfigNameAndValue.filter(function (v, i) { return (v["ConfigCategory"] == "SYSTEM" && v["Category"] == "System" && v["ConfigName"] == AppConstants.get('PACKAGE_FILE_NAME_MAX_CHARS')); }))[0].ConfigValue;	

				}
			}
		}
	}

	var method = 'GetConfigurations';
	var param = new Object();
	param.token = TOKEN();
	param.getConfigurationsReq = GetConfigurationsReq;
	var params = JSON.stringify(param);
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
}

//Alert code
function SetAlertsTime() {
	if (noOfMinutesToNotifyAlert != null && noOfMinutesToNotifyAlert != undefined && noOfMinutesToNotifyAlert > 0)
		refreshIntervalId = setInterval(GetLastAlertDateTime, noOfMinutesToNotifyAlert * 60000);
	else
		refreshIntervalId = setInterval(GetLastAlertDateTime, 60000);
	function GetLastAlertDateTime() {

		var retval;
		var hierarchyId;
		var groupId;

		if (groupId > 0) {
			hierarchyId = 0;
		} else {
			hierarchyId = 0;
			groupId = 0;
		}

		function callbackFunction(data, error) {
			if (data) {
				if (data.lastAlertDateTime) {
					data.lastAlertDateTime = $.parseJSON(data.lastAlertDateTime);
				}
				var convertDate = moment.utc(moment(data.lastAlertDateTime).format('YYYY-MM-DD HH:mm:ss')).toDate();
				if (dateLastAlertDateTime == "") {
					var now = new Date();
					now = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
					dateLastAlertDateTime = moment.utc(moment(now).format('YYYY-MM-DD HH:mm:ss')).toDate();
					return;
				}

				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (convertDate.getTime() > dateLastAlertDateTime.getTime()) {
						showAlertNotification(true);
						dateLastAlertDateTime = convertDate;
					}

				}
			}
		}

		var method = 'GetLastAlertDateTime';
		var params = '{"token":"' + TOKEN() + '","hierarchyId":"' + hierarchyId + '","groupId":"' + groupId + '"}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
	}
}

function showAlertNotification(isVisible) {
	if (isVisible == true) {
		$("#notifiCation").removeClass('hide');
	} else {
		$("#notifiCation").addClass('hide');
	}
}

function SetUIAccessibilityBasedOnUserRights(UserRightsData) {

	if (UserRightsData) {
		if (!hasDashboardViewAccess(UserRightsData)) {
			$("#vhq").css("display", "none");
		}
		if (!hasDeviceSearchViewAccess(UserRightsData)) {
			$("#deviceSearch").css("display", "none");
		}
		if (!hasMerchantManagementViewAccess(UserRightsData)) {
			$("#merchants").css("display", "none");
			IsMMEnabled = false;
		}

		if (!hasDeviceManagementViewAccess(UserRightsData)) {
			$("#device").css("display", "none");
		}
		if (!hasContentManagementViewAccess(UserRightsData)) {
			$("#content").css("display", "none");
		}
		if (!hasReportsViewAccess(UserRightsData)) {

			$("#reports").css("display", "none");
		}
		if (!hasAdministrationViewAccess(UserRightsData)) {
			$("#administration").css("display", "none");
		}

		if (!hasDashboardViewAccess(UserRightsData) && hasDeviceSearchViewAccess(UserRightsData)) {
			$("#deviceSearch").addClass("active active-1");
		}
		else if (!hasDashboardViewAccess(UserRightsData) && !hasDeviceSearchViewAccess(UserRightsData) && hasMerchantManagementViewAccess(UserRightsData)) {
			$("#merchants").addClass("active active-1");
		}
		else if (!hasDashboardViewAccess(UserRightsData) && !hasDeviceSearchViewAccess(UserRightsData) && !hasMerchantManagementViewAccess(UserRightsData) && hasDeviceManagementViewAccess(UserRightsData)) {
			$("#device").addClass("active active-1 expand");
			$("#manageDevices").addClass('active active-1')
			$("#manageDevices").children('a').addClass('arrow-open');
			$("#addDevicessublink").addClass('active');
			redirectToLocation(menuJsonData, 'addDevices');

		}
		else if (!hasDashboardViewAccess(UserRightsData) && !hasDeviceSearchViewAccess(UserRightsData) && !hasMerchantManagementViewAccess(UserRightsData) && !hasDeviceManagementViewAccess(UserRightsData) && hasContentManagementViewAccess(UserRightsData)) {
			$("#content").addClass("active active-1 expand");
			$("#manageContents").addClass('active active-1')
			$("#manageContents").children('a').addClass('arrow-open');
			$("#contentLibrarysublink").addClass('active');
			redirectToLocation(menuJsonData, 'contentLibrary');
		}
		else if (!hasDashboardViewAccess(UserRightsData) && !hasDeviceSearchViewAccess(UserRightsData) && !hasMerchantManagementViewAccess(UserRightsData) && !hasDeviceManagementViewAccess(UserRightsData) && !hasContentManagementViewAccess(UserRightsData) && hasReportsViewAccess(UserRightsData)) {
			$("#reports").addClass("active active-1 expand");
			$("#subscriptionList").addClass('active active-1')
			redirectToLocation(menuJsonData, 'subscriptionList');
		}
		else if (!hasDashboardViewAccess(UserRightsData) && !hasDeviceSearchViewAccess(UserRightsData) && !hasMerchantManagementViewAccess(UserRightsData) && !hasDeviceManagementViewAccess(UserRightsData) && !hasContentManagementViewAccess(UserRightsData) && !hasReportsViewAccess(UserRightsData) && hasAdministrationViewAccess(UserRightsData)) {
			$("#administration").addClass("active active-1 expand");
			$("#userManagement").addClass('active active-1')
			$("#userManagement").children('a').addClass('arrow-open');
			$("#userssublink0").addClass('active');
			redirectToLocation(menuJsonData, 'users');
		}

	} else {
		return;
	}
}

function hasDashboardViewAccess(userRightData) {
	var source = _.where(userRightData, { RightName: "Reports and Charts" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	var source = _.where(userRightData, { RightName: "Alerts" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	return false;
}

function hasDeviceSearchViewAccess(userRightData) {
	var source = _.where(userRightData, { RightName: "Devices" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		} else {
			return false;
		}
	}
	return false;
}

function hasMerchantManagementViewAccess(userRightData) {
	var source = _.where(userRightData, { RightName: "Merchant" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		} else {
			return false;
		}
	}
	return false;
}

function hasDeviceManagementViewAccess(userRightData) {
	var source = _.where(userRightData, { RightName: "Devices" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed || source[0].IsModifyAllowed) {
			return true;
		}
	}
	var source = _.where(userRightData, { RightName: "Device Swap" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed || source[0].IsModifyAllowed) {
			return true;
		}
	}
	var source = _.where(userRightData, { RightName: "Alerts" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	var source = _.where(userRightData, { RightName: "Reports and Charts" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	var source = _.where(userRightData, { RightName: "Download Library" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	return false;
}

function hasDiagnosticsViewAccess(userRightData) {
	var source = _.where(userRightData, { RightName: "Devices" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	var source = _.where(userRightData, { RightName: "Diagnostic Actions" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	return false;
}

function hasContentManagementViewAccess(userRightData) {
	var source = _.where(userRightData, { RightName: "Reports and Charts" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	var source = _.where(userRightData, { RightName: "Content Library" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	var source = _.where(userRightData, { RightName: "Content Schedule" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {

			if (source[0].IsModifyAllowed) {

				return true;
			}
		}
	}
	return false;
}

function hasReportsViewAccess(userRightData) {
	var source = _.where(userRightData, { RightName: "Reports and Charts" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	return false;
}

function hasAdministrationViewAccess(userRightData) {
	var source = _.where(userRightData, { RightName: "Alerts" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	var source = _.where(userRightData, { RightName: "Roles and Users" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	var source = _.where(userRightData, { RightName: "Groups and Hierarchies" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	var source = _.where(userRightData, { RightName: "System Settings" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	var source = _.where(userRightData, { RightName: "Audit Logs" });
	if (source.length > 0) {
		if (source[0].IsviewAllowed) {
			return true;
		}
	}
	return false;
}

//$(window).unload(function () {$('#vhq').click(); });
function reposition() {
	var modal = $(this),
		dialog = modal.find('.modal-dialog');
	modal.css('display', 'block');
	// Dividing by two centers the modal exactly, but dividing by three 
	// or four works better for larger screens.
	dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
}
function modelReposition() {
	// Reposition when a modal is shown
	//$('.modal').on('shown.bs.modal', reposition);
	//// Reposition when the window is resized
	//$(window).on('resize', function () {
	//    $('.modal:visible').each(reposition);
	//});
}
modelReposition();