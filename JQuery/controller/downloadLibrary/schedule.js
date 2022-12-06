
define(["knockout", "autho", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", , "bootstrap", "bootstrapDatePicker", "moment", "spinner"], function (ko, autho, koUtil, ADSearchUtil) {
	failedDeviceCount = 0;
	succeedDeviceCount = 0;
	totalDeviceCount = 0;
	SelectedIdOnGlobale = new Array();
	columnSortFilterForScheduleDownload = new Object();
	//
	selectedDownloadsActionsContent = new Array();
	selectedGridId = "jqxgridForSelectedDevices";
	isMiddleMenuClicked = false;

	isScheduleScreenLoadsFirstTime = false;

	var lang = getSysLang();

	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	self.observableAdvancedSearchModelPopup = ko.observable();
	self.flagBlankDeviceGrid = ko.observable(false);


	ADSearchUtil.gridIdForAdvanceSearch = 'blankSchedulejqxgrid';

	return function downloadLibararyappViewModel() {
		selectedDownloadsActionsContent = [];
		isScheduleScreenLoadsFirstTime = true;
		isSearchAppliedForSchedule = false;
		var self = this;
		scheduleValuesGlobalObject = {};
		//Draggable function
		$('#advanceSearchModalHeader').mouseup(function () {
			$("#mdlScheduleContent").draggable({ disabled: true });
		});

		$('#advanceSearchModalHeader').mousedown(function () {
			$("#mdlScheduleContent").draggable({ disabled: false });
		});
		////////////////

		koUtil.isQuickSearchApplied = 0;
		succeedDeviceCount = "";
		failedDeviceCount = '';
		$("#newJobBtn").prop("disabled", true);
		checkflagForNewJob = 0;
		checkflagForNewJobAction = 0;
		checkflagForNewJobContent = 0;
		deviceSearchObjectLibrary = new Object();
		isMiddleMenuClicked = false;

		self.jobName = ko.observable();
		self.observalbeSchedule = ko.observable();


		//For advanced search functionality
		self.AdvanceTemplateFlag = ko.observable(false);
		self.observableCriteria = ko.observable();
		loadCriteria('modalCriteria', 'genericPopup');
		self.observableAdvancedSearchModelPopup = ko.observable();
		loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
		ADSearchUtil.newAddedDataFieldsArr = [];
		ADSearchUtil.newAddedgridColumns = [];
		ADSearchUtil.AdScreenName = 'schedule';

		//------------------------------------------------ALL-INITIAL-CALL---------------------------------------------------------------------------------

		if ((scheduleOption == "scheduleDownload" && !isDownloadScheduleScreenLoaded)
			|| (scheduleOption == "scheduleContent" && !isContentScheduleScreenLoaded)
			|| (scheduleOption == "scheduleAction" && !isActionScheduleScreenLoaded)) {
			ADSearchUtil.deviceSearchObj = new Object();
			blankScheduleGrid('blankSchedulejqxgrid', flagBlankDeviceGrid, self.observableAdvancedSearchModelPopup, self.AdvanceTemplateFlag);

		} else {
			if (isFromDownloadLibrary) {
				var param = getDevicesForPackageParameters('jqxgridDownloadlib', false, null, null, false, [], ENUM.get('Software'));
				scheduleDownloadGridForLibrary('jqxgridForSelectedDevices', param, self.observableAdvancedSearchModelPopup);
			}
			else if (isFromContentLibrary) {
				var param = getDevicesForPackageParameters('jqxgridContentlib', false, null, null, false, [], ENUM.get('Content'));
				scheduleDownloadGridForLibrary('jqxgridForSelectedDevices', param, self.observableAdvancedSearchModelPopup);
			}
			else {
				var param = getScheduleDevicesForJobsParameters('Devicejqxgrid', false, columnSortFilterForScheduleDownload, ADSearchUtil.deviceSearchObj, []);
				scheduleDownloadGrid('jqxgridForSelectedDevices', param, self.observableAdvancedSearchModelPopup);
			}
		}
		//-----------------------------------------------END-ALL-INITIAL-CAL--------------------------------------------------------------------------------------

		//---------------------------------ONCLICK-ON-DIFFERENT-TAB-LIKE-SELECTED-DEVICE-SUCCESS-DEVICE-FAILED-DEVICE-------------------------

		///  ------------------------

		//First Tab
		self.selectedDevicesScreen = function () {
			isScheduleScreenLoadsFirstTime = false;
			isSearchAppliedForSchedule = false;
			$("#advanceQuickSearchBtn").show();
			$("#advanceQuickSearchSearchCriteria").show();
			//koUtil.isFromScheduleScreen = 0;           
			selectedGridId = 'jqxgridForSelectedDevices';
			$("#newJobBtn").prop("disabled", true);
			$("#newJobBtn").attr("disabled", true);
			$("#selectedDevicesGrid").show();
			$("#schduleGrid").hide();
			$("#nextBtn").show();
			$("#previousBtn").hide();
			$("#nextSchedule").show();
			$("#showHideResetExportbtn").show();

			if (scheduleOption == "scheduleDownload")
				getDownloadSelectScheduleValues();
			else if (scheduleOption == "scheduleContent")
				getContentSelectScheduleValues();
			else if (scheduleOption == "scheduleAction")
				getActionSelectScheduleValues();

		}

		//Second Tab
		self.scheduleScreen = function () {
			isScheduleScreenLoadsFirstTime = false;
			isMiddleMenuClicked = true;
			koUtil.isFromScheduleDownloadsScreen = 0;
			koUtil.isFromScheduleScreen = 0;

			$("#advanceQuickSearchBtn").hide();
			$("#advanceQuickSearchSearchCriteria").hide();
			$("#tabSelectedDevice").removeClass('active');
			$("#tabSchedule").addClass('active');
			if (scheduleOption == "scheduleDownload") {
				self.templateFlagschedule(true);
				loadelement('unLoadSchedule', 'downloadLibrary', 'unLoadSchedule');
				loadelement('scheduleDownload', 'downloadLibrary', 'schedule');
				$("#schduleGrid").show();
				$("#selectedDevicesGrid").hide();
				$("#scheduleHead").text(i18n.t('downloadSchedule', { lng: lang }));
				$("#scheduleParent").text(i18n.t('device', { lng: lang }));
				$("#scheduleChild").text(i18n.t('downloads', { lng: lang }));
				$("#scheduleSubChild").text(i18n.t('downloadSchedule', { lng: lang }));
			} else if (scheduleOption == "scheduleContent") {
				self.templateFlagschedule(true);
				loadelement('unLoadSchedule', 'downloadLibrary', 'unLoadSchedule');
				loadelement('unLoadSchedule', 'contentLibrary', 'unLoadSchedule');
				loadelement('scheduleDelivery', 'contentLibrary', 'schedule');

				$("#schduleGrid").show();
				$("#selectedDevicesGrid").hide();
				$("#scheduleHead").text(i18n.t('scheduleDelivery', { lng: lang }));
				$("#scheduleParent").text(i18n.t('content', { lng: lang }));
				$("#scheduleChild").text(i18n.t('manageContents', { lng: lang }));
				$("#scheduleSubChild").text(i18n.t('scheduleDelivery', { lng: lang }));
			} else if (scheduleOption == "scheduleAction") {
				self.templateFlagschedule(true);
				loadelement('unLoadSchedule', 'downloadLibrary', 'unLoadSchedule');
				loadelement('scheduleActions', 'diagnostics', 'schedule');

				$("#schduleGrid").show();
				$("#selectedDevicesGrid").hide();
				$("#scheduleHead").text(i18n.t('scheduleActionsPage', { lng: lang }));
				$("#scheduleParent").text(i18n.t('device', { lng: lang }));
				$("#scheduleChild").text(i18n.t('diagnostics', { lng: lang }));
				$("#scheduleSubChild").text(i18n.t('scheduleActionsPage', { lng: lang }));
			}
			koUtil.isFromScheduleActionScreen = 0;

			$("#selectedDevicesGrid").hide();
			$("#schduleGrid").show();
			$("#submitBtn").show();
			$("#previousBtn").show();
			$("#nextBtn").show();
			$("#nextSchedule").hide();
			$("#showHideResetExportbtn").hide();

		}

		//-----------------------------------------END--ONCLICK-ON-DIFFERENT-TAB-LIKE-SELECTED-DEVICE-SUCCESS-DEVICE-FAILED-DEVICE-------------------------------------

		setMenuSelection();


		//For advanced search

		ADSearchUtil.SearchForChart = false;
		ADSearchUtil.SearchForGrid = true;


		$("#selectedDevicesGrid").show();
		$("#schduleGrid").hide();
		$("#nextBtn").show();
		$("#previousBtn").hide();

		$("#submitBtn").prop("disabled", false);
		$("#nextBtn").prop("disabled", false);



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

		self.alertModelPopup1 = ko.observable();
		self.checkExport = ko.observable(false);
		self.checkSucceddedDevices = ko.observable();
		self.observableModelPopup = ko.observable();
		self.columnlist = ko.observableArray();
		self.templateFlag = ko.observable(false);
		self.templateFlagschedule = ko.observable(false);
		self.gridIdForShowHide = ko.observable();
		var initialGridColumns = ["SerialNumber", "DeviceId", "HierarchyFullPath", "ModelName"];
        var compulsoryfields = ['SerialNumber', 'ModelName', 'HierarchyFullPath', 'DeviceId'];
		var modelName = 'unLoadSchedule';
		loadelement(modelName, 'downloadLibrary', null);

		var modelName = 'modelShowHideForSchedule';
		loadelementforshohide(modelName, 'genericPopup');

		if (scheduleOption == "scheduleDownload") {
			self.templateFlagschedule(true);
			loadelement('scheduleDownload', 'downloadLibrary', 'schedule');
			$("#scheduleHead").text(i18n.t('downloadSchedule', { lng: lang }))
			$("#scheduleParent").text(i18n.t('device', { lng: lang }))
			$("#scheduleChild").text(i18n.t('downloads', { lng: lang }))
			$("#scheduleSubChild").text(i18n.t('downloadSchedule', { lng: lang }))
		} else if (scheduleOption == "scheduleContent") {
			self.templateFlagschedule(true);
			loadelement('scheduleDelivery', 'contentLibrary', 'schedule');
			$("#scheduleHead").text(i18n.t('scheduleDelivery', { lng: lang }))
			$("#scheduleParent").text(i18n.t('content', { lng: lang }))
			$("#scheduleChild").text(i18n.t('manageContents', { lng: lang }))
			$("#scheduleSubChild").text(i18n.t('scheduleDelivery', { lng: lang }))
		} else if (scheduleOption == "scheduleAction") {
			self.templateFlagschedule(true);
			loadelement('scheduleActions', 'diagnostics', 'schedule');
			$("#scheduleHead").text(i18n.t('scheduleActions', { lng: lang }))
			$("#scheduleParent").text(i18n.t('device', { lng: lang }))
			$("#scheduleChild").text(i18n.t('diagnostics', { lng: lang }))
			$("#scheduleSubChild").text(i18n.t('scheduleActions', { lng: lang }))
		}

		//Check rights
		checkRights();
		function checkRights() {
			if (scheduleOption == "scheduleDownload") {
				var retval = autho.checkRightsBYScreen('Download Schedule', 'IsModifyAllowed');
				if (retval == true) {
					$("#scheduleFunction").show();
				} else {
					$("#scheduleFunction").hide();
				}
				return retval;
			} else if (scheduleOption == "scheduleContent") {
				var retval = autho.checkRightsBYScreen('Content Schedule', 'IsModifyAllowed');
				if (retval == true) {
					$("#scheduleFunction").show();
				} else {
					$("#scheduleFunction").hide();
				}
				return retval;
			} else if (scheduleOption == "scheduleAction") {
				var retval = autho.checkRightsBYScreen('Diagnostic Actions', 'IsModifyAllowed');
				if (retval == true) {
					$("#scheduleFunction").show();
				} else {
					$("#scheduleFunction").hide();
				}
				return retval;
			}
		}

		self.expandCriteria = function () {
			if ($("#deviceCriteriaDiv").hasClass('hide')) {
				$("#deviceCriteriaDiv").removeClass('hide');
				$("#expandQuickLinkDiv").empty();
				var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Collapse"><i class="icon-angle-up"></i></a>';
				$("#expandQuickLinkDiv").append(str);
			} else {
				$("#deviceCriteriaDiv").addClass('hide')
				$("#expandQuickLinkDiv").empty();
				var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Expand"><i class="icon-angle-down"></i></a>';
				$("#expandQuickLinkDiv").append(str);
			}
		}
		modelReposition();
		self.openPopup = function (popupName, gId) {
			self.templateFlag(true);
			if (popupName == "modelShowHideForSchedule") {
				self.gridIdForShowHide(selectedGridId);
				self.columnlist(genericHideShowColumn(selectedGridId, true, compulsoryfields));

				if (visibleColumnsForScheduleList.length == 0) {
					var columns = self.columnlist();
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
				}

				//For Advanced search
				if (ADSearchUtil.resetAddSerchFlag == 'reset') {
					for (var i = 0; i < ADSearchUtil.newAddedgridColumns.length; i++) {
						var source = _.where(self.columnlist(), { columnfield: ADSearchUtil.newAddedgridColumns[i].datafield });
						if (source != '') {
							self.columnlist.remove(source[0]);
						}
					}
				}

				loadelementforshohide(popupName, 'genericPopup');
				$('#downloadModel').modal('show');
			} else if (popupName == 'modelAdvancedSearch') {

				self.AdvanceTemplateFlag(true);
				loadAdvancedSearchModelPopup(popupName, 'genericPopup');
				$('#AdvanceSearchModal').modal('show');
			}
		};

		function loadelement(elementname, controllerId, schedulflag) {
			if (schedulflag != null) {
				if (!ko.components.isRegistered(elementname)) {
					generateTemplate(elementname, controllerId);
				}
				self.observalbeSchedule(elementname);
			} else {
				if (!ko.components.isRegistered(elementname)) {
					generateTemplate(elementname, controllerId);
				}
				self.alertModelPopup1(elementname);

			}
		}

		//Load function for advanced search
		function loadCriteria(elementname, controllerId) {

			if (!ko.components.isRegistered(elementname)) {
				//new template code
				var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
				var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
				ko.components.register(elementname, {
					viewModel: { require: ViewName },
					template: { require: 'plugin/text!' + htmlName }
				});
			}
			self.observableCriteria(elementname);
		}
		function loadelementforshohide(elementname, controllerId) {

			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.alertModelPopup1(elementname);


		}
		self.unloadTempPopup = function (popupName) {
            self.alertModelPopup1('unLoadSchedule');
            $('#downloadModel').modal('hide');
		};

		//unload advance serach popup
		self.unloadAdvancedSearch = function () {
			ClearAdSearch = 0;
			isSearchAppliedForSchedule = false;
            self.observableAdvancedSearchModelPopup('unLoadSchedule');
            $("#AdvanceSearchModal").modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
			isAdpopup = '';
			$("#mdlScheduleContent").css("left", "");
			$("#mdlScheduleContent").css("top", "");
		}
		self.clearAdvancedSearch = function () {
			$("#mdlScheduleContent").css("left", "");
			$("#mdlScheduleContent").css("top", "");

			self.observableAdvancedSearchModelPopup('unLoadSchedule');
			loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

		}

		function loadAdvancedSearchModelPopup(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				//new template code
				var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
				var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
				ko.components.register(elementname, {
					viewModel: { require: ViewName },
					template: { require: 'plugin/text!' + htmlName }
				});
			}
			self.observableAdvancedSearchModelPopup(elementname);
		}

		self.clearfilter = function (gId) {
			if (selectedGridId == 'jqxgridForSelectedDevices') {
				//  $("#jqxgridForSelectedDevices").jqxGrid('updatebounddata');
				$('#jqxgridForSelectedDevices').jqxGrid('clearselection');
			}
			// $("#" + selectedGridId).jqxGrid('updatebounddata');
			//gridFilterClear(selectedGridId);
			$("#criteriabtnDiv").show();
			$("#deviceCriteriaDiv").empty();
			var str = sessionStorage.getItem("CustomSearchText");
			if (str) {
				$("#deviceCriteriaDiv").append(str);
			} else {
				$("#criteriabtnDiv").hide();
			}
		}

		self.refreshGrid = function (gId) {
			gridRefresh(selectedGridId);

			$("#criteriabtnDiv").show();
			//$("#resetBtnForGrid").removeClass('hide');
			$("#deviceCriteriaDiv").empty();
			var str = sessionStorage.getItem("CustomSearchText");
			if (str) {
				$("#deviceCriteriaDiv").append(str);
			} else {
				$("#criteriabtnDiv").hide();
			}
		}

		self.refreshAvailablePackages = function (gId) {
			$("#" + gId).jqxGrid('updatebounddata');
		}

		////////////////////////
		self.exportToExcel = function (isExport, gId) {

			exportToExcelForGrid(isExport, gId, selectedGridId);
		}

		function exportToExcelForGrid(isExport, gId, selectedGridId) {
			var datainfo = $("#" + selectedGridId).jqxGrid('getdatainformation');
			if (datainfo.rowscount > 0) {
				var selectedscheduleItems = getSelectedUniqueId(gId);
				var unselectedscheduleItems = getUnSelectedUniqueId(gId);
				var checkAll = checkAllSelected(gId);
				if (selectedGridId == 'jqxgridForSelectedDevices') {
					if (isFromDownloadLibrary) {
						deviceSearchObjectLibrary = ADSearchUtil.deviceSearchObj;
						var param = getDevicesForPackageParameters('jqxgridDownloadlib', true, null, deviceSearchObjectLibrary, true, visibleColumnsForScheduleList, ENUM.get('Software'));
					}
					else if (isFromContentLibrary) {
						deviceSearchObjectLibrary = ADSearchUtil.deviceSearchObj;
						var param = getDevicesForPackageParameters('jqxgridContentlib', true, null, deviceSearchObjectLibrary, true, visibleColumnsForScheduleList, ENUM.get('Content'));
					}
					else {
						var columnSortFilterForExport = new Object();
						columnSortFilterForExport.FilterList = null;
						columnSortFilterForExport.SortList = null;
						columnSortFilterForExport.GridId = 'scheduleDownloadGrid';
						var param = getScheduleDevicesForJobsParameters('Devicejqxgrid', true, columnSortFilterForExport, ADSearchUtil.deviceSearchObj, visibleColumnsForScheduleList);
					}
				}

				self.exportGridId = ko.observable(gId);
				self.exportSucess = ko.observable();
				self.exportflage = ko.observable();
				var datainfo = $("#" + gId).jqxGrid('getdatainformation');
				if (datainfo.rowscount > 0) {
					scheduledownloadExport(param, selectedGridId, self.openPopup);
				} else {
					openAlertpopup(1, 'no_data_to_export');
				}
			} else {
				openAlertpopup(1, 'no_data_to_export');
			}
		}

		function scheduledownloadExport(param, gId, openPopup) {
			var method;
			switch (gId) {
				case 'jqxgridForSelectedDevices':
					if (isFromDownloadLibrary || isFromContentLibrary)
						method = 'GetDevicesForPackage';
					else
						method = 'GetScheduledDevicesForJob';
					break;
			}
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(1, 'export_Sucess');
					}
				}
			}
			var method = method;
			var params = JSON.stringify(param);
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}


		///////////////////////////
		//New Job

		self.newJobClick = function () {
			scheduleValuesGlobalObject = {};
			selectedDownloadsActionsContent = [];
			selectedGridId = 'jqxgridForSelectedDevices';
			if (scheduleOption == "scheduleDownload") {
				self.templateFlagschedule(true);
				loadelement('unLoadSchedule', 'downloadLibrary', 'schedule');
				loadelement('scheduleDownload', 'downloadLibrary', 'schedule');
				$("#newJobBtn").prop("disabled", true);
			} else if (scheduleOption == "scheduleContent") {
				koUtil.isNewJobCreatedForContent = 1;
				self.templateFlagschedule(true);
				loadelement('unLoadSchedule', 'downloadLibrary', 'schedule');
				loadelement('scheduleDelivery', 'contentLibrary', 'schedule');
				$("#newJobBtn").prop("disabled", true);

			} else if (scheduleOption == "scheduleAction") {
				koUtil.isNewJobCreated = 1;
				self.templateFlagschedule(true);
				loadelement('unLoadSchedule', 'downloadLibrary', 'schedule');
				loadelement('scheduleActions', 'diagnostics', 'schedule');
				$("#newJobBtn").prop("disabled", true);

			}
			checkflagForNewJob = 0;
			checkflagForNewJobAction = 0;
			checkflagForNewJobContent = 0;
			$("#advanceQuickSearchBtn").show();
			$("#advanceQuickSearchSearchCriteria").show();
			$("#showHideResetExportbtn").show();
			$("#submitBtn").prop("disabled", false);
			// $("#nextBtn").prop("disabled", true)
			$("#tabSelectedDevice").removeClass("disabled");
			$("#tabSchedule").removeClass("disabled");
			$("#previousBtn").removeClass("disabled");
			$("#newJobBtn").prop("disabled", true);
			$("#nextBtn").show();
			$("#schduleGrid").find("input, button, submit, textarea, select").prop("disabled", false);
			$("#accordionSchedulePanel").removeClass("disabled");
			$("#accordionPackagePanel").removeClass("disabled");
			if ($("#tabSchedule").hasClass('active')) {
				$("#tabSchedule").removeClass('active');
				$("#tabSelectedDevice").addClass('active');
				$("#schduleGrid").hide();
				$("#selectedDevicesGrid").show();
				$("#nextSchedule").show();
				$("#previousBtn").hide();
			}
			$("#newJobBtn").attr("disabled", true);
			//fetchGenerateJobName(self.jobName, self.isNewJobCreatedStatus);
		}


		function fetchGenerateJobName(jobName, isNewJobCreatedStatus) {
			function callbackFunction(data, error) {
				if (data) {

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						jobName(data.jobName);
						$("#jobNameTxt").val(data.jobName);
						$("#newJobBtn").prop("disabled", true);
					}
				}
				if (error) {
					retval = "";
				}
			}

			var method = 'GenerateJobName';
			var params = '{"token":"' + TOKEN() + '"}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		self.submitClick = function () {
			isScheduleScreenLoadsFirstTime = false;
			isMiddleMenuClicked = true;
			koUtil.isFromScheduleDownloadsScreen = 0;
			koUtil.isFromScheduleScreen = 0;

			$("#advanceQuickSearchBtn").hide();
			$("#advanceQuickSearchSearchCriteria").hide();
			if ($("#tabSelectedDevice").hasClass('active')) {
				selectedGridId = 'jqxgridForSelectedDevices';
				$("#tabSelectedDevice").removeClass('active')
				$("#tabSchedule").addClass('active');
				$("#selectedDevicesGrid").hide();
				$("#schduleGrid").show();
				$("#previousBtn").show();
				$("#nextBtn").show();
				$("#nextSchedule").hide();
				$("#showHideResetExportbtn").hide();

				if (scheduleOption == "scheduleDownload") {
					self.templateFlagschedule(true);
					loadelement('unLoadSchedule', 'downloadLibrary', 'unLoadSchedule');
					loadelement('scheduleDownload', 'downloadLibrary', 'schedule');
					$("#schduleGrid").show();
					$("#selectedDevicesGrid").hide();
				} else if (scheduleOption == "scheduleContent") {
					//self.unloadTempPopup('scheduleDelivery');
					loadelement('unLoadSchedule', 'downloadLibrary', 'unLoadSchedule');
					loadelement('scheduleDelivery', 'contentLibrary', 'schedule');
					$("#schduleGrid").show();
					$("#selectedDevicesGrid").hide();
				} else if (scheduleOption == "scheduleAction") {					
					loadelement('unLoadSchedule', 'downloadLibrary', 'unLoadSchedule');
					loadelement('scheduleActions', 'diagnostics', 'schedule');
					$("#schduleGrid").show();
					$("#selectedDevicesGrid").hide();
				}

			} else if ($("#tabSchedule").hasClass('active')) {
				var datainfo = $("#jqxgridForSelectedDevices").jqxGrid('getdatainformation');
				var retval = checkError();
				if (datainfo.rowscount < 0) {
					openAlertpopup(1, 'no_devices_selected_for_scheduling_download');
					return;
				}
				if (!($("#packageChkbox").is(':checked')) && self.movedArray().length <= 0) {
					openAlertpopup(1, 'please_select_the_package');
					return;
				}
				if (retval == null || retval == "") {
					if (self.includeInactiveDevices(true)) {
						self.openConfirmationPopup();
						$("#active").show();
						$("#inActive").hide();
					}
					else {
						self.openConfirmationPopup();
						$("#active").hide();
						$("#inActive").show();
					}
				}
			}
			koUtil.isFromScheduleActionScreen = 0;
		}

		self.resizeColumns = function (gId) {
			$("#modalResizeResetColumnsConfirmation").modal('show');
			$("#resizeResetColumnsConfirmationMessage").text(i18n.t('save_resized_columns_confirmation', { lng: lang }));

			globalGridColumns = new Object();
			globalGridColumns.gId = gId;
			globalGridColumns.gridName = 'ScheduleDownloads';
			globalGridColumns.isColumnResized = true;
			globalGridColumns.gridColumns = initialGridColumns;
		}

		self.resetColumns = function (gId) {
			$("#modalResizeResetColumnsConfirmation").modal('show');
			$("#resizeResetColumnsConfirmationMessage").text(i18n.t('reset_resized_columns_confirmation', { lng: lang }));

			globalGridColumns = new Object();
			globalGridColumns.gId = gId;
			globalGridColumns.gridName = 'ScheduleDownloads';
			globalGridColumns.isColumnResized = false;
			globalGridColumns.gridColumns = [];
		}

		seti18nResourceData(document, resourceStorage);
	};
	function loadAdvancedSearchModelPopup(elementname, controllerId) {
		if (!ko.components.isRegistered(elementname)) {
			//new template code
			var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
			var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
			ko.components.register(elementname, {
				viewModel: { require: ViewName },
				template: { require: 'plugin/text!' + htmlName }
			});
		}
		self.observableAdvancedSearchModelPopup(elementname);
	}
	//Empty grid construction
	function blankScheduleGrid(gID, flagBlankDeviceGrid, modelPopup, AdvanceTemplateFlag) {

		flagBlankDeviceGrid(true);
		AdvanceTemplateFlag(true);
		loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
		$('#AdvanceSearchModal').modal('show');
		ADSearchUtil.gridIdForAdvanceSearch = gID;
		var srName = getschedulscrenName();
		var strGID = "jqxgridForSelectedDevices" + srName;

		var InitGridStoragObj = initGridStorageObj(strGID);
		var gridStorage = InitGridStoragObj.gridStorage;

		var sourceDataFieldsArr = [
			{ name: 'SerialNumber', map: 'DeviceDetail>SerialNumber' },
			{ name: 'DeviceId', map: 'DeviceDetail>DeviceId' },
			{ name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath', type: 'string' },
			{ name: 'ModelName', map: 'DeviceDetail>ModelName' }];

		var source =
		{
			dataType: "json",
			dataFields: sourceDataFieldsArr,
			root: 'Devices',
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data.getDevicesResp && data)
					data.getDevicesResp = $.parseJSON(data.getDevicesResp);
				else
					data.getDevicesResp = [];

				if (data.getDevicesResp && data.getDevicesResp.PaginationResponse) {

					source.totalrecords = data.getDevicesResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getDevicesResp.PaginationResponse.TotalPages;

				} else {
					source = [];
					source.totalrecords = 0;
					source.totalpages = 0;
				}
			},

		};

		var datasource =
		{
			dataType: "json",
			dataFields: sourceDataFieldsArr,
			contentType: 'application/json',
		};

		var rendered = function (element) {
			var retval = autho.checkRightsBYScreen('Global Operations', 'IsModifyAllowed');
			enablegridfunctions(gID, 'UniqueDeviceId', element, gridStorage, true, 'pagerDiv', true, 0, 'UniqueDeviceId', null, null, null, null, 'deviceSearchCheck', retval);
			return true;
		}

		var request = {

			formatData: function (data) {
				if (isAdvancedSavedSearchApplied) {
					var param = getScheduleDevicesForJobsParameters('Devicejqxgrid', false, columnSortFilterForScheduleDownload, ADSearchUtil.deviceSearchObj, []);
					scheduleDownloadGrid('jqxgridForSelectedDevices', param, modelPopup);
					return;
				}

				disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
				return '';
			},
		}

		var dataAdapter = intializeDataAdapter(source, request);

		$("#" + gID).jqxGrid(
			{

				width: "100%",
				height: gridHeightFunction(gID, "schedule"),
				pageable: true,
				editable: false,
				source: dataAdapter,
				enabletooltips: true,
				altRows: true,
				virtualmode: true,
				pageSize: AppConstants.get('ROWSPERPAGE'),
				columnsResize: true,
				columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				rowsheight: 32,
				rendergridrows: function () {
					return dataAdapter.records;
				},
				autoshowfiltericon: true,
				columns: [
					{
						text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 90, enabletooltips: false,
					},
					{
						text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 80, enabletooltips: false,

					},
					{
						text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 130, cellsrenderer: HierarchyPathRenderer
					},
					{
						text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 80, enabletooltips: false,
					},
				]
			});

	}
	//First Tab datagrid
	function scheduleDownloadGrid(gID, param, modelPopup) {
		$("#blankSchedulejqxgrid").addClass("dn");
		$("#jqxgridForSelectedDevices").removeClass("dn");
		ADSearchUtil.gridIdForAdvanceSearch = gID;
		selectedGridId = 'jqxgridForSelectedDevices';

		var srName = getschedulscrenName();
		var strGID = gID + srName;
		var InitGridStoragObj = initGridStorageObj(strGID);
		var gridStorage = InitGridStoragObj.gridStorage;
		var adStorage = InitGridStoragObj.adStorage;
		selectedDownloadsActionsContent = new Array();


		var gridheight = $(window).height();

		var percentValue;
		if (gridheight > 600) {
			percentValue = (25 / 100) * gridheight;
			gridheight = gridheight - 150;

			gridheight = gridheight - percentValue + 'px';
		} else {
			gridheight = '400px';
		}

		var gridColumns = [];
		var source =
		{
			dataType: "json",
			dataFields: [
				{ name: 'UniqueDeviceId', map: 'UniqueDeviceId' },
				{ name: 'SerialNumber', map: 'SerialNumber' },
				{ name: 'DeviceId', map: 'DeviceId' },
				{ name: 'HierarchyFullPath', map: 'HierarchyFullPath', type: 'string' },
				{ name: 'ModelName', map: 'ModelName' },
			],
			root: 'Devices',
			type: "POST",
			data: param,

			url: AppConstants.get('API_URL') + "/GetScheduledDevicesForJob",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data.getScheduledDevicesForJobResp) {
					data.getScheduledDevicesForJobResp = $.parseJSON(data.getScheduledDevicesForJobResp);
				} else {
					data.getScheduledDevicesForJobResp = [];
				}
				if (data.getScheduledDevicesForJobResp && data.getScheduledDevicesForJobResp.PaginationResponse) {
					source.totalrecords = data.getScheduledDevicesForJobResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getScheduledDevicesForJobResp.PaginationResponse.TotalPages;
					totalDeviceRecords = data.getScheduledDevicesForJobResp.PaginationResponse.TotalDeviceRecords;
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
				}

				totalDeviceCount = source.totalrecords;
			},

		};

		var dataAdapter = new $.jqx.dataAdapter(source,
			{
				formatData: function (data) {
					if (!isAdvancedSavedSearchApplied || koUtil.isSearchCancelled() == true) {
						$("#" + gID).jqxGrid('showloadelement');
						$('.all-disabled').show();
					} else {
						$("#" + gID).jqxGrid('hideloadelement');
					}
					disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
					columnSortFilter = new Object();

					//if (!isFromDeviceSearch) {
					//    koUtil.GlobalColumnFilter = new Array();
					//    if (!isSearchReset && isAdvancedSavedSearchApplied && advancedSearchObject != null) {
					//        ADSearchUtil.deviceSearchObj = advancedSearchObject;
					//    }
					//}
					if (!isFromDeviceSearch) {
						var sessionItemName = '';

						if (scheduleOption == "scheduleDownload") {
							sessionItemName = 'jqxgridForSelectedDevicesdownloads';
						} else if (scheduleOption == "scheduleContent") {
							sessionItemName = 'jqxgridForSelectedDevicesmanageContents';
						} else if (scheduleOption == "scheduleAction") {
							sessionItemName = 'jqxgridForSelectedDevicesdiagnostics';
						}
						if (sessionItemName) {
							var adStorage = JSON.parse(sessionStorage.getItem(sessionItemName + "adStorage"));
							if (adStorage) {
								if (adStorage[0].isAdSearch == 0) {
									if (adStorage[0].adSearchObj) {
										ADSearchUtil.deviceSearchObj = adStorage[0].adSearchObj;
									} else {
										ADSearchUtil.deviceSearchObj = null;
										sessionStorage.removeItem("CustomSearchText");
									}
								}
							}
						}
					}

					var gridStorageDeviceSearch = JSON.parse(sessionStorage.getItem("Devicejqxgrid" + "gridStorage"));
					if (isFromDeviceSearch) {
						if (gridStorageDeviceSearch && gridStorageDeviceSearch.length > 0 && gridStorageDeviceSearch[0].columnSortFilter && gridStorageDeviceSearch[0].columnSortFilter.FilterList && gridStorageDeviceSearch[0].columnSortFilter.FilterList.length > 0) {
							var checkAll = checkAllSelected("Devicejqxgrid");
							if (checkAll == 1) {
								columnSortFilter = gridStorageDeviceSearch[0].columnSortFilter;
							} else {
								columnSortFilter = columnSortFilterFormatedData(columnSortFilterForScheduleDownload, gID, gridStorage, 'scheduleDownloadGrid');
							}
						}
					}
					else {
						columnSortFilter = columnSortFilterFormatedData(columnSortFilterForScheduleDownload, gID, gridStorage, 'scheduleDownloadGrid');
						//koUtil.GlobalColumnFilter = columnSortFilter;
					}
					param.getScheduledDevicesForJobReq.ColumnSortFilter = columnSortFilter;

					var CustomSearchCriteria = JSON.parse(sessionStorage.getItem('customSearchStore'));
					if (CustomSearchCriteria != null) {
						param.getScheduledDevicesForJobReq.DeviceSearch = CustomSearchCriteria;
					} else {
						if (ADSearchUtil.deviceSearchObj) {
							param.getScheduledDevicesForJobReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
						} else {
							param.getScheduledDevicesForJobReq.DeviceSearch = new Object();
						}
					}

					koUtil.isAdvancedSearch = 0;

					if (isAdvancedSavedSearchApplied || isSearchReset) {
						param.getScheduledDevicesForJobReq.Selector.SelectedItemIds = null;
						param.getScheduledDevicesForJobReq.Selector.UnSelectedItemIds = null;
					}

					var adStorage = JSON.parse(sessionStorage.getItem(strGID + "adStorage"));
					if (adStorage && adStorage.length > 0 && adStorage[0].isQuickSearchApplied == 1) {
						var pagination = new Object();
						pagination.PageNumber = 1;
						pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
						pagination.HighLightedItemId = null;
						param.getScheduledDevicesForJobReq.Pagination = getPaginationObjectforschedule(pagination, gID);
					} else {
						if (schedulADApply == 1) {

							var pagination = new Object();
							pagination.PageNumber = 1;
							pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
							pagination.HighLightedItemId = null;
							param.getScheduledDevicesForJobReq.Pagination = getPaginationObjectforschedule(pagination, gID);
						} else {
							param.getScheduledDevicesForJobReq.Pagination = getPaginationObject(param.getScheduledDevicesForJobReq.Pagination, gID);
						}

					}
					if (adStorage && adStorage.length > 0 && adStorage[0].isFromDevice != 1) {

						if (adStorage[0].isAdSearch == 0) {
							if (adStorage[0].adSearchObj) {

								ADSearchUtil.deviceSearchObj = adStorage[0].adSearchObj;
							} else {

								ADSearchUtil.deviceSearchObj = {};
							}
						} else {
							if (adStorage[0].quickSearchObj) {

								ADSearchUtil.deviceSearchObj = adStorage[0].quickSearchObj;
							} else {

								ADSearchUtil.deviceSearchObj = {};
							}
						}

						updatepaginationOnState(strGID, gridStorage, param.getScheduledDevicesForJobReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage);
					} else {
						updatepaginationOnState(strGID, gridStorage, param.getScheduledDevicesForJobReq.Pagination, null, adStorage);
					}

					data = JSON.stringify(param);
					return data;
				},
				downloadComplete: function (data, status, xhr) {

					if (scheduleOption == "scheduleDownload") {
						isDownloadScheduleScreenLoaded = true;
					} else if (scheduleOption == "scheduleContent") {
						isContentScheduleScreenLoaded = true;
					} else if (scheduleOption == "scheduleAction") {
						isActionScheduleScreenLoaded = true;
					}

					enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
					if (data.getScheduledDevicesForJobResp) {
						if (data.getScheduledDevicesForJobResp.PaginationResponse) {
							//if (data.getScheduledDevicesForJobResp.PaginationResponse.HighLightedItemPage > 0) {
							//    gridStorage[0].highlightedPage = data.getScheduledDevicesForJobResp.PaginationResponse.HighLightedItemPage;
							//    var updatedGridStorage = JSON.stringify(gridStorage);
							//    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
							//}
							if (data.getScheduledDevicesForJobResp.PaginationResponse) {
								//if (data.getScheduledDevicesForJobResp.PaginationResponse.HighLightedItemPage > 0) {
								//    //for (var h = 0; h < data.getScheduledDevicesForJobResp.Devices.length; h++) {
								//    //if (data.getScheduledDevicesForJobResp.Devices[h].UniqueDeviceId == data.getScheduledDevicesForJobResp.PaginationResponse.HighLightedItemId) {
								//    gridStorage[0].highlightedPage = data.getScheduledDevicesForJobResp.PaginationResponse.HighLightedItemPage;
								//    var updatedGridStorage = JSON.stringify(gridStorage);
								//    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
								//    // }
								//    //}
								//}
							}

						}
						else {
							source.totalrecords = 0;
							source.totalpages = 0;
							data.getScheduledDevicesForJobResp.Devices = [];
						}
					} else {
						source.totalrecords = 0;
						source.totalpages = 0;
						data.getScheduledDevicesForJobResp = new Object();
						data.getScheduledDevicesForJobResp.Devices = [];

					}

					//Global Operations Rights validation 
					var isGlobalOperationAllowed = autho.checkRightsBYScreen('Global Operations', 'IsModifyAllowed');
					var selectedDataArr = data.getScheduledDevicesForJobResp.Devices;
					if (isGlobalOperationAllowed || (!isGlobalOperationAllowed && selectedDataArr.length == 1) || (selectedDataArr.length == 0)) {
						$("#tabSchedule").removeClass('disabled')
						$("#tabSchedule").prop("disabled", false);
						$("#nextBtn").prop("disabled", false);
					} else {
						$("#tabSchedule").removeClass('active')
						$("#tabSchedule").addClass('disabled');
						$("#nextBtn").prop("disabled", true);
					}

					if (isAdvancedSavedSearchApplied && koUtil.isSearchCancelled() == false) {
						$("#searchInProgress").modal('hide');
						$("#AdvanceSearchModal").modal('hide');
						koUtil.isHierarchyModified(false);
						koUtil.isAttributeModified(false);
						modelPopup('unLoadSchedule');
					} else {
						$('.all-disabled').hide();
					}
					$("#" + gID).jqxGrid('hideloadelement');
					isAdvancedSavedSearchApplied = false;
					koUtil.isSearchCancelled(false);

					if (koUtil.isQuickSearchApplied == 1) {
						// $("#txtGoToPagejqxgridForSelectedDevices").val('1');
						gotoFirst(gID)
						koUtil.isQuickSearchApplied = 0;
					}
				},
				loadError: function (jqXHR, status, error) {
					$('.all-disabled').hide();
				}
			});

		var rendered = function (element) {
			enablegridfunctions(gID, 'UniqueDeviceId', element, gridStorage, false, 'pagerDivScheduleDownload', false, 0, 'UniqueDeviceId', null, null, null);
			return true;
		}

		var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
			genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);

		}

		gridColumns = [
			{
				text: '', menu: false, hidden: true, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false,
				datafield: 'isSelected', renderer: function () {
					return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
				}, rendered: rendered
			},
			{ text: '', datafield: 'UniqueDeviceId', hidden: true, editable: false, },
			{
				text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 90, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 80, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 130, cellsrenderer: HierarchyPathRenderer,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 80, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
				}
			},
		];
		gridColumns = setUserPreferencesColumns('ScheduleDownloads', userResizedColumns, gridColumns);

		$("#" + gID).jqxGrid(
			{

				width: "100%",
				height: gridHeightFunction(gID, "schedule"),
				pageable: true,
				editable: false,
				source: dataAdapter,
				enabletooltips: true,
				altRows: true,
				virtualmode: true,
				pageSize: AppConstants.get('ROWSPERPAGE'),
				columnsResize: true,
				columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				rowsheight: 32,
				columns: gridColumns,
				rendergridrows: function () {
					return dataAdapter.records;
				},
				autoshowfiltericon: true,
				ready: function () {
					callOnGridReadySchedule(gID, gridStorage, strGID);

					var columns = genericHideShowColumn(gID, true, []);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsForScheduleList = koUtil.gridColumnList;
				}
			});

		getGridBiginEdit(gID, 'UniqueDeviceId', gridStorage);
	}

	function getDevicesForPackageParameters(gID, isExport, columnSortFilter, deviceSearchObj, isAllSelected, visibleColumns, packageType) {
		var selectedItems = getSelectedPackageId(gID);
		var unSelectedItems = getUnSelectedPackageId(gID);
		var checkAll = checkAllSelected(gID);
		var DeviceSearch = new Object();
		var Pagination = new Object();
		var selector = new Object();
		var Export = new Object();

		Pagination.HighLightedItemId = null;
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

		Export.DynamicColumns = null;
		Export.VisibleColumns = visibleColumns;
		Export.IsAllSelected = isAllSelected;
		Export.IsExport = isExport;

		if (deviceSearchObjectLibrary.HierarchyIdsWithChildren == null || deviceSearchObjectLibrary.HierarchyIdsWithChildren == undefined) {
			DeviceSearch.DeviceStatus = null;
			DeviceSearch.GroupIds = null;

			var HierarchyIdsWithChildren = new Array();
			HierarchyIdsWithChildren.push(koUtil.hierarchyIdForScheule);

			DeviceSearch.HierarchyIdsWithChildren = HierarchyIdsWithChildren;
			DeviceSearch.HierarchyIdsWithoutChildren = null;
			DeviceSearch.IsHierarchiesSelected = false;
			DeviceSearch.IsOnlyDeleteBlacklisted = false;
			DeviceSearch.SearchCriteria = null;
			DeviceSearch.SearchElements = null;
			DeviceSearch.SearchModels = null;
			DeviceSearch.SearchName = null;
			DeviceSearch.SearchID = 0;
			DeviceSearch.SearchText = null;
			DeviceSearch.SearchType = ENUM.get('NONE');

			deviceSearchObjectLibrary = DeviceSearch;
		} else {
			DeviceSearch = deviceSearchObjectLibrary;
		}

		getDevicesForPackageReq = new Object();
		if (checkAll == 1) {
			if (globalVariableForUnselectedPackages && globalVariableForUnselectedPackages.length > 0) {
				selector.SelectedItemIds = null;
				selector.UnSelectedItemIds = globalVariableForUnselectedPackages;
			}
			else {
				selector.SelectedItemIds = null;
				selector.UnSelectedItemIds = null;
			}
		}
		else {
			selector.SelectedItemIds = globalVariableForSelectedPackages;
			selector.UnSelectedItemIds = null;
		}
		getDevicesForPackageReq.PackageType = packageType;
		getDevicesForPackageReq.Pagination = Pagination;
		getDevicesForPackageReq.DeviceSearch = DeviceSearch;
		getDevicesForPackageReq.Selector = selector;
		getDevicesForPackageReq.Export = Export;
		getDevicesForPackageReq.ParentColumnSortFilter = koUtil.GlobalColumnFilter;
		getDevicesForPackageReq.FolderIds = globalSelectedFolders;
		var param = new Object();
		param.token = TOKEN();
		param.getDevicesForPackageReq = getDevicesForPackageReq;

		return param;
	}

	function scheduleDownloadGridForLibrary(gID, param, modelPopup) {
		$("#blankSchedulejqxgrid").addClass("dn");
		$("#jqxgridForSelectedDevices").removeClass("dn");
		selectedGridId = 'jqxgridForSelectedDevices';
		ADSearchUtil.gridIdForAdvanceSearch = gID;
		var srName = getschedulscrenName();
		var strGID = gID + srName;

		var InitGridStoragObj = initGridStorageObj(strGID);
		var gridStorage = InitGridStoragObj.gridStorage;
		var adStorage = InitGridStoragObj.adStorage;

		var source =
		{
			dataType: "json",
			dataFields: [
				{ name: 'UniqueDeviceId', map: 'UniqueDeviceId' },
				{ name: 'SerialNumber', map: 'SerialNumber' },
				{ name: 'DeviceId', map: 'DeviceId' },
				{ name: 'HierarchyFullPath', map: 'HierarchyFullPath', type: 'string' },
				{ name: 'ModelName', map: 'ModelName' },
			],
			root: 'Devices',
			type: "POST",
			data: param,

			url: AppConstants.get('API_URL') + "/GetDevicesForPackage",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data && data.getDevicesForPackageResp) {
					data.getDevicesForPackageResp = $.parseJSON(data.getDevicesForPackageResp);
				}
				else
					data.getDevicesForPackageResp = [];

				if (data.getDevicesForPackageResp && data.getDevicesForPackageResp.PaginationResponse) {
					source.totalrecords = data.getDevicesForPackageResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getDevicesForPackageResp.PaginationResponse.TotalPages;
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
				}

				totalDeviceCount = source.totalrecords;
			},

		};

		var dataAdapter = new $.jqx.dataAdapter(source,
			{
				formatData: function (data) {
					if (!isAdvancedSavedSearchApplied || koUtil.isSearchCancelled() == true) {
						$("#" + gID).jqxGrid('showloadelement');
						$('.all-disabled').show();
					} else {
						$("#" + gID).jqxGrid('hideloadelement');
					}
					disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

					if (isAdvancedSavedSearchApplied || isSearchReset) {						
						param.getDevicesForPackageReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
					}
					var adStorage = JSON.parse(sessionStorage.getItem(strGID + "adStorage"));
					updatepaginationOnState(strGID, gridStorage, param.getDevicesForPackageReq.Pagination, null, adStorage);
					param.getDevicesForPackageReq.Pagination = getPaginationObject(param.getDevicesForPackageReq.Pagination, gID);					

					data = JSON.stringify(param);
					return data;
				},
				downloadComplete: function (data, status, xhr) {

					enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
					//if (data && data.getDevicesForPackageResp) {
					//    data.getDevicesForPackageResp = $.parseJSON(data.getDevicesForPackageResp);
					//}

					if (data.getDevicesForPackageResp) {
						if (data.getDevicesForPackageResp.PaginationResponse) {
							//if (data.getDevicesForPackageResp.PaginationResponse.HighLightedItemPage > 0) {
							//    gridStorage[0].highlightedPage = data.getDevicesForPackageResp.PaginationResponse.HighLightedItemPage;
							//    var updatedGridStorage = JSON.stringify(gridStorage);
							//    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
							//}
							if (data.getDevicesForPackageResp.PaginationResponse) {
								//if (data.getDevicesForPackageResp.PaginationResponse.HighLightedItemPage > 0) {
								//    //for (var h = 0; h < data.getDevicesForPackageResp.Devices.length; h++) {
								//    //if (data.getDevicesForPackageResp.Devices[h].UniqueDeviceId == data.getDevicesForPackageResp.PaginationResponse.HighLightedItemId) {
								//    gridStorage[0].highlightedPage = data.getDevicesForPackageResp.PaginationResponse.HighLightedItemPage;
								//    var updatedGridStorage = JSON.stringify(gridStorage);
								//    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
								//    // }
								//    //}
								//}
							}

						}
						else {
							source.totalrecords = 0;
							source.totalpages = 0;
							data.getDevicesForPackageResp.Devices = [];
						}
					} else {
						source.totalrecords = 0;
						source.totalpages = 0;
						data.getDevicesForPackageResp = new Object();
						data.getDevicesForPackageResp.Devices = [];

					}

					//Global Operations Rights validation 
					var isGlobalOperationAllowed = autho.checkRightsBYScreen('Global Operations', 'IsModifyAllowed');
					var selectedDataArr = data.getDevicesForPackageResp.Devices;
					if (isGlobalOperationAllowed || (!isGlobalOperationAllowed && selectedDataArr.length == 1) || (selectedDataArr.length == 0)) {
						$("#tabSchedule").removeClass('disabled')
						$("#tabSchedule").prop("disabled", false);
						$("#nextBtn").prop("disabled", false);
					} else {
						$("#tabSchedule").removeClass('active')
						$("#tabSchedule").addClass('disabled');
						$("#nextBtn").prop("disabled", true);
					}

					if (isAdvancedSavedSearchApplied && koUtil.isSearchCancelled() == false) {
						$("#searchInProgress").modal('hide');
						$("#AdvanceSearchModal").modal('hide');
						koUtil.isHierarchyModified(false);
						koUtil.isAttributeModified(false);
						modelPopup('unLoadSchedule');
					} else {
						$('.all-disabled').hide();
					}
					$("#" + gID).jqxGrid('hideloadelement');
					isAdvancedSavedSearchApplied = false;
					koUtil.isSearchCancelled(false);

					if (koUtil.isQuickSearchApplied == 1) {
						// $("#txtGoToPagejqxgridForSelectedDevices").val('1');
						gotoFirst(gID)
						koUtil.isQuickSearchApplied = 0;
					}
				},
				loadError: function (jqXHR, status, error) {
					$('.all-disabled').hide();
				}
			});

		var rendered = function (element) {
			enablegridfunctions(gID, 'UniqueDeviceId', element, gridStorage, false, 'pagerDivScheduleDownload', false, 0, 'UniqueDeviceId', null, null, null);
			return true;
		}

		var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
			genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);

		}
		$("#" + gID).jqxGrid(
			{

				width: "100%",
				height: gridHeightFunction(gID, "schedule"),
				pageable: true,
				editable: false,
				source: dataAdapter,
				altRows: true,
				virtualmode: true,
				pageSize: AppConstants.get('ROWSPERPAGE'),
				enabletooltips: true,
				columnsResize: true,
				columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				rowsheight: 32,
				rendergridrows: function () {
					return dataAdapter.records;
				},
				autoshowfiltericon: true,

				ready: function () {
					//callOnGridReady(strGID, gridStorage);
					callOnGridReadySchedule(gID, gridStorage, strGID);

					var columns = genericHideShowColumn(gID, true, []);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsForScheduleList = koUtil.gridColumnList;
				},

				columns: [
					{
						text: '', menu: false, hidden: true, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false,
						datafield: 'isSelected', minwidth: 40, width: 40, renderer: function () {
							return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
						}, rendered: rendered
					},
					{ text: '', datafield: 'UniqueDeviceId', hidden: true, editable: false, },
					{
						text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 90, width: "25%", enabletooltips: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 90, width: "25%", enabletooltips: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 130, width: "25%", cellsrenderer: HierarchyPathRenderer,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 90, width: "25%", enabletooltips: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
						}
					},
				]
			});

		getGridBiginEdit(gID, 'UniqueDeviceId', gridStorage);
	}

	function getScheduleDevicesForJobsParameters(gID, isExport, columnSortFilter, deviceSearchObj, visibleColumns) {
		var getScheduledDevicesForJobReq = new Object();
		var Export = new Object();
		var Selector = new Object();
		var checkAll = checkAllSelected(gID);

		var Pagination = new Object();
		Pagination.HighLightedItemId = null
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
		Export.DynamicColumns = null;
		Export.VisibleColumns = visibleColumns;
		if (isExport == true) {
			Export.IsAllSelected = true;
			Export.IsExport = true;
		} else {
			Export.IsAllSelected = false;
			Export.IsExport = false;
		}

		selectedGridId = 'jqxgridForSelectedDevices';
		var srName = getschedulscrenName();
		var strGID = selectedGridId + srName;

		var InitGridStoragObj = initGridStorageObj(strGID);
		var gridStorage = InitGridStoragObj.gridStorage;
		var adStorage = InitGridStoragObj.adStorage;

		if (koUtil.isDeviceProfile() == true) {
			globalVariableForDownloadSchedule = [];
			globalVariableForDownloadSchedule.push(koUtil.deviceProfileUniqueDeviceId);

			Selector.SelectedItemIds = globalVariableForDownloadSchedule;
			Selector.UnSelectedItemIds = null;
		} else {
			if (adStorage && adStorage.length > 0 && !_.isEmpty(adStorage[0].adSearchObj)) {
				Selector.SelectedItemIds = null;
				Selector.UnSelectedItemIds = null;
			} else {
				if (checkAll == 1) {
					if (globalVariableForunselectedItems && globalVariableForunselectedItems.length > 0) {
						Selector.SelectedItemIds = null;
						Selector.UnSelectedItemIds = globalVariableForunselectedItems;
					} else {
						Selector.SelectedItemIds = null;
						Selector.UnSelectedItemIds = null;
					}
				} else {
					Selector.SelectedItemIds = globalVariableForDownloadSchedule;
					Selector.UnSelectedItemIds = null;
				}
			}
		}

		var ColumnSortFilter = columnSortFilter;

		getScheduledDevicesForJobReq.ColumnSortFilter = ColumnSortFilter;
		getScheduledDevicesForJobReq.Export = Export;
		getScheduledDevicesForJobReq.Pagination = Pagination;
		getScheduledDevicesForJobReq.Selector = Selector;
		getScheduledDevicesForJobReq.DeviceSearch = deviceSearchObj;
		if (scheduleOption == "scheduleDownload") {
			getScheduledDevicesForJobReq.PackageType = 1;
		} else if (scheduleOption == "scheduleContent") {
			getScheduledDevicesForJobReq.PackageType = 2;
		} else if (scheduleOption == "scheduleAction") {
			getScheduledDevicesForJobReq.PackageType = 4;
		}

		var param = new Object();
		param.token = TOKEN();
		param.getScheduledDevicesForJobReq = getScheduledDevicesForJobReq;

		return param;
	}
	//end grid
	/////////////////////////////////////////////////////Result tab Grid//////////////////////////////////////////////////////////////////

});



//--------Keep selected schedule values of download screen
function getDownloadSelectScheduleValues() {

	scheduleValuesGlobalObject.scheduleDownload = { packageParamSelection: {}, downLoadOn: {}, applyOn: {} };

	scheduleValuesGlobalObject.scheduleDownload.tagText = $("#tagTxt").val();

	var packageParamSelectionValues = {};
	if ($("#packageChkbox").is(':checked')) {
		packageParamSelectionValues.packageChkbox = true;
		if ($("#softwareAndParameter").is(':checked')) {
			packageParamSelectionValues.softwareAndParameter = $("#softwareAndParameter").val();
		}
		else if ($("#onlyParameter").is(':checked')) {
			packageParamSelectionValues.onlyParameter = $("#onlyParameter").val();
			if ($("#allParameter").is(':checked')) {
				packageParamSelectionValues.allParameter = $("#allParameter").val();
			}
			else if ($("#onlyChangedParameter").is(':checked')) {
				packageParamSelectionValues.onlyChangedParameter = $("#onlyChangedParameter").val();
			}
		}
		if (!_.isEmpty(packageParamSelectionValues))
			scheduleValuesGlobalObject.scheduleDownload.packageParamSelection = packageParamSelectionValues;
	}

	var downloadOnValues = {};
	if ($("maintainanceId").is(':checked')) {
		downloadOnValues.maintainanceId = $("#maintainanceId").val();
	}
	else if ($("#dateId").is(':checked')) {
		downloadOnValues.dateId = $("#dateId").val();
		downloadOnValues.downloadDatePicker = $("#downloadDatePicker").val();
		downloadOnValues.downloadHours = $("#downloadHours").val();
		downloadOnValues.downloadMinutes = $("#downloadMinutes").val();
		downloadOnValues.downloadName = $("#downloadName").val();
	}
	else if ($("#nextContactid").is(':checked')) {
		downloadOnValues.nextContactid = $("#nextContactid").val();
	}
	else if ($("#nextAvailableId").is(':checked')) {
		downloadOnValues.nextAvailableId = $("#nextAvailableId").val();
		if ($("#nextRadioButtonID").is(':checked')) {
			downloadOnValues.nextRadioButtonID = $("#nextRadioButtonID").val();
			downloadOnValues.nextNumericValued = $("#nextNumericValued").val();
		}
		else if ($("#inlinedRadido2").is(':checked')) {
			//Download period
			downloadOnValues.inlinedRadido2 = $("#inlinedRadido2").val();
			if ($("#fromID").is(':checked')) {
				downloadOnValues.fromID = $("#fromID").val();
				if ($("#nowDownloadID").is(':checked')) {
					downloadOnValues.nowDownloadID = $("#nowDownloadID").val();
				}
				else if ($("#chkNowAndDateID").is(':checked')) {
					downloadOnValues.chkNowAndDateID = $("#chkNowAndDateID").val();
					downloadOnValues.periodFromDatePicker = $("#periodFromDatePicker").val();
					downloadOnValues.fromHours = $("#fromHours").val();
					downloadOnValues.fromMinutes = $("#fromMinutes").val();
					downloadOnValues.downloadPeriodName = $("#downloadPeriodName").val();
				}
			}

			if ($("#toCheckBox").is(':checked')) {
				downloadOnValues.toCheckBox = $("#toCheckBox").val();
				downloadOnValues.periodToDatePicker = $("#periodToDatePicker").val();
				downloadOnValues.toHours = $("#toHours").val();
				downloadOnValues.toMinutes = $("#toMinutes").val();
				downloadOnValues.toDateName = $("#toDateName").val();
			}
		}

		if ($("#maintainanceCheckbox").is(':checked'))
			downloadOnValues.maintainanceCheckbox = downloadOnValues;
	}

	if (!_.isEmpty(downloadOnValues))
		scheduleValuesGlobalObject.scheduleDownload.downLoadOn = downloadOnValues;

	var applyOnValues = {};
	if ($("#immediateId").is(':checked')) {
		applyOnValues.immediateId = $("#immediateId").val();
	}
	else if ($("#dateApplyId").is(':checked')) {
		applyOnValues.dateApplyId = $("#dateApplyId").val();
		applyOnValues.applyDatePicker = $("#applyDatePicker").val();
		applyOnValues.applyOnTimeHour = $("#applyOnTimeHour").val();
		applyOnValues.applyOnTimeMinute = $("#applyOnTimeMinute").val();
		applyOnValues.dateAMPM = $("#dateAMPM").val();
	}

	if (!_.isEmpty(applyOnValues))
		scheduleValuesGlobalObject.scheduleDownload.applyOn = applyOnValues;
}


//--------Keep selected schedule values of Content screen
function getContentSelectScheduleValues() {

	scheduleValuesGlobalObject.scheduleContent = { downLoadOn: {}, applyOn: {}, expireOn: {} };
	scheduleValuesGlobalObject.scheduleContent.tagText = $("#tagTxt").val();

	var downloadOnValues = {};
	if ($("rdoMaintainanceWindow").is(':checked')) {
		downloadOnValues.rdoMaintainanceWindow = $("#rdoMaintainanceWindow").val();
	}
	else if ($("#rdoNextContent").is(':checked')) {
		downloadOnValues.rdoNextContent = $("#rdoNextContent").val();
	}
	else if ($("#rdoDateId").is(':checked')) {
		downloadOnValues.rdoDateId = $("#rdoDateId").val();
		downloadOnValues.downloadDatePicker = $("#downloadDatePicker").val();
		downloadOnValues.downloadHours = $("#downloadHours").val();
		downloadOnValues.downloadMinutes = $("#downloadMinutes").val();
		downloadOnValues.downloadName = $("#downloadName").val();
	}

	if (!_.isEmpty(downloadOnValues))
		scheduleValuesGlobalObject.scheduleContent.downLoadOn = downloadOnValues;

	var applyOnValues = {};
	if ($("#rdoImmediatelyAfterDownload").is(':checked')) {
		applyOnValues.rdoImmediatelyAfterDownload = $("#rdoImmediatelyAfterDownload").val();
	}
	else if ($("#rdoApplyDate").is(':checked')) {
		applyOnValues.rdoApplyDate = $("#rdoApplyDate").val();
		applyOnValues.applyDatePicker = $("#applyDatePicker").val();
		applyOnValues.applyHours = $("#applyHours").val();
		applyOnValues.applyMinutes = $("#applyMinutes").val();
		applyOnValues.applyName = $("#applyName").val();
	}

	if (!_.isEmpty(applyOnValues))
		scheduleValuesGlobalObject.scheduleContent.applyOn = applyOnValues;

	var expireOnValues = {};
	if ($("#rdoExpiryNone").is(':checked')) {
		expireOnValues.rdoExpiryNone = $("#rdoExpiryNone").val();
	}
	else if ($("#rdoExpiryDate").is(':checked')) {
		expireOnValues.rdoExpiryDate = $("#rdoExpiryDate").val();
		expireOnValues.expiryDatePicker = $("#expiryDatePicker").val();
		expireOnValues.expiryHours = $("#expiryHours").val();
		expireOnValues.expiryMinutes = $("#expiryMinutes").val();
		expireOnValues.expiryName = $("#expiryName").val();
	}

	if (!_.isEmpty(expireOnValues))
		scheduleValuesGlobalObject.scheduleContent.expireOn = expireOnValues;
}

//--------Keep selected schedule values of Actions screen
function getActionSelectScheduleValues() {

	scheduleValuesGlobalObject.scheduleAction = { beginActionsAt: {}, actionsRecurrence: {} };
	scheduleValuesGlobalObject.scheduleAction.tagText = $("#tagTxt").val();
	var beginActionsAtValues = {};
	if ($("rdoMaintainanceWindow").is(':checked')) {
		beginActionsAtValues.rdoMaintainanceWindow = $("#rdoMaintainanceWindow").val();
	}
	else if ($("#rdoNextContent").is(':checked')) {
		beginActionsAtValues.rdoNextContent = $("#rdoNextContent").val();
	}
	else if ($("#rdoDateId").is(':checked')) {
		beginActionsAtValues.rdoDateId = $("#rdoDateId").val();
		beginActionsAtValues.downloadDatePicker = $("#downloadDatepicker").val();
		beginActionsAtValues.downloadHours = $("#downloadHours").val();
		beginActionsAtValues.downloadMinutes = $("#downloadMinutes").val();
		beginActionsAtValues.downloadName = $("#downloadName").val();

		var actionsRecurrenceValues = {};
		if ($("#noneId").is(':checked')) {
			actionsRecurrenceValues.noneId = $("#noneId").val();
		}
		else {
			if ($("#hourlyId").is(':checked')) {
				actionsRecurrenceValues.hourlyId = $("#hourlyId").val();
			}
			else if ($("#dailyId").is(':checked')) {
				actionsRecurrenceValues.dailyId = $("#dailyId").val();
			}
			else if ($("#weeklyId").is(':checked')) {
				actionsRecurrenceValues.weeklyId = $("#weeklyId").val();
			}
			else if ($("#monthlyId").is(':checked')) {
				actionsRecurrenceValues.monthlyId = $("#monthlyId").val();
			}

			actionsRecurrenceValues.recureEvery = $("#recureEvery").val();

			if ($("#inlineRadio2").is(':checked')) {
				actionsRecurrenceValues.inlineRadio2 = $("#inlineRadio2").val(); //No End Date
			}
			else if ($("#endAfter").is(':checked')) {
				actionsRecurrenceValues.endAfter = $("#endAfter").val();
				actionsRecurrenceValues.endAfterLabel = $("#endAfterLabel").val();
			}
			else if ($("#endById").is(':checked')) {
				actionsRecurrenceValues.endById = $("#endById").val();
				actionsRecurrenceValues.endByDatePicker = $("#endByDatePicker").val();
				actionsRecurrenceValues.endByHour = $("#endByHour").val();
				actionsRecurrenceValues.endByMinutes = $("#endByMinutes").val();
				actionsRecurrenceValues.endByName = $("#endByName").val();
			}
		}

		if (!_.isEmpty(actionsRecurrenceValues))
			scheduleValuesGlobalObject.scheduleAction.actionsRecurrence = actionsRecurrenceValues;
	}

	///If Date is checked then Actions Recureence will be enabled
	if (!_.isEmpty(beginActionsAtValues))
		scheduleValuesGlobalObject.scheduleAction.beginActionsAt = beginActionsAtValues;
}
