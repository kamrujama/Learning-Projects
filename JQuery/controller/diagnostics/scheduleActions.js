var includeInactiveDevices = false;
var StateSchedule = null;
define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "bootstrap", "bootstrapDatePicker", "moment", "spinner", "utility"], function (ko, koUtil, ADSearchUtil) {

	var maxActionCount;
	SelectedIdOnGlobale = new Array();
	var lang = getSysLang();

	columnSortFilter = {};
	currentSelectedActionOption = "OnNextMaintenanceWindow";

	var check = 0;

	selectedRecurrenceIntervalStr = "None";
	recurrenceOptionStr = "";


	var rowIndexForHighlighted;
	var rowIdForHighlightedForTable;
	StateSchedule = null;

	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});


	var isSelectedPaneFiltered = false; //To check filter applied on Selected Actions Pane 
	var selectedRowArrayForSwap = new Array();
	var gridSelectedArrayForSwap = new Array();
	var isShowPopup = false;
    var isShowNotifyPopup = false;
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

	return function downloadLibararyappViewModel() {
		var currentDateShort = moment().format(SHORT_DATE_FORMAT);
		var currentDateLong = moment().format(LONG_DATETIME_FORMAT);
		var self = this;
		//ADSearchUtil.AdScreenName = 'scheduleactions';
		$("#btnForMoveleft").addClass('disabled');
		$("#btnForMoveRight").addClass('disabled');
		$("#btnMoveItemUp").addClass('disabled');
		$("#btnMoveItemDown").addClass('disabled');
		$("#submitBtn").prop("disabled", true);
		//$("#selectedDevicesGrid").show();
		//$("#schduleGrid").hide();
		// $("#previousBtn").hide();
		$("#nextBtn").show();

		var now = new Date();
		var dateobj = formatAMPM(now);
		$("#downloadHours").val(dateobj.hours);
		//    $("#downloadMinutes").val(dateobj.minutes);
		$("#downloadName").val(dateobj.ampm);
		$("#endByHour").val(dateobj.hours);
		//  $("#endByMinutes").val(dateobj.minutes);
		$("#endByName").val(dateobj.ampm);

		if (dateobj.minutes == 59) {
			$("#downloadMinutes").val('0');
			$("#endByMinutes").val('0');
		} else if (dateobj.minutes < 59) {
			$("#downloadMinutes").val(parseInt(dateobj.minutes) + 1);
			$("#endByMinutes").val(parseInt(dateobj.minutes) + 1);
		} else {
			$("#downloadMinutes").val(parseInt(dateobj.minutes));
			$("#endByMinutes").val(parseInt(dateobj.minutes));
		}

		if (isFromDeviceSearch) {
			columnSortFilter = koUtil.GlobalColumnFilter;
		} else {
			var srName = getschedulscrenName();
			var strGID = 'jqxgridForSelectedDevices' + srName;

			var InitGridStoragObj = initGridStorageObj(strGID);
			var gridStorage = InitGridStoragObj.gridStorage;

			columnSortFilter = columnSortFilterFormatedData(columnSortFilter, 'jqxgridForSelectedDevices', gridStorage, 'scheduleDownloadGrid');
		}

		$("#jobNameTxt").on("keyup", function () {

			if ($(this).val())
				$("#isJobNamevalidationMessage").hide();
			else
				$("#isJobNamevalidationMessage").show();
		});

		//-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
		$('#downloadModelconfo').on('shown.bs.modal', function (e) {
			$('#downloadModelconfo_No').focus();

		});
		$('#downloadModelconfo').keydown(function (e) {
			if ($('#downloadModelconfo_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#downloadModelconfo_Yes').focus();
			}
		});
		//------------------------------------------------------------------------------------------------------------------------

		//--change collpase and expand icon------
		function toggleChevron(e) {
			$(e.target)
				.prev('.panel-heading')
				.find("i.indicator")
				.toggleClass('icon-angle-down icon-angle-up');
		}
		$('#accordion, #accordion1').on('hidden.bs.collapse', toggleChevron);
		$('#accordion, #accordion1').on('shown.bs.collapse', toggleChevron);
		//--end--

		self.isDateVisible = ko.observable(false);
		self.isRecureTextVisible = ko.observable(true);

		var date = new Date();
		date.setDate(date.getDate());

		$("#downloadDatepicker").datepicker({ startDate: date, autoclose: true, todayHighlight: true });
		$("#endByDatePicker").datepicker({ startDate: date, autoclose: true, todayHighlight: true });

		var currentDate = moment().format(currentDateShort);
		$('#downloadDatepicker').prop('value', currentDate);
		$('#endByDatePicker').prop('value', currentDate);

		//JIRA Bug FIx 4373
		//var hours = moment().format('HH');
		//var minutes = moment().format('mm');
		//$('#endByHour').prop('value', hours);
		//$('#endByMinutes').prop('value', minutes);
		//$('#downloadHours').prop('value', hours);
		//$('#downloadMinutes').prop('value', minutes);

		///spinner
		$('[data-trigger="spinner"]').spinner();
		///

		//Download variables
		self.chkDownloadOn = ko.observable();
		self.chkDownloadOn('Maintenance window');
		self.chkRecureence = ko.observable('None');
		self.dateDownload = ko.observable(false);
		self.chkDownloadAmPm = ko.observable(true);
		self.selectedRecurrenceInterval = ko.observable()
		self.selectedRecurrenceInterval(ENUM.get('RECCURANCE_NONE'));
		self.isNewJobCreatedStatus = ko.observable(false);
		self.chkInterval = ko.observable(true);
		self.endAfterEnable = ko.observable(true);
		self.alertModelPopup = ko.observable();
		self.checkExport = ko.observable(false);
		self.checkSucceddedDevices = ko.observable();
		self.columnlist = ko.observableArray();
		self.templateFlag = ko.observable(false);
		self.gridIdForShowHide = ko.observable();
		self.movedArray = ko.observableArray();
		self.actionData = ko.observableArray();
		self.maxRecurrence = ko.observable();
		self.chkEndByAmPm = ko.observable(false);
		self.ddlFormatData = ko.observableArray([{ "dataValue": "AM", "dataTtext": "AM" }, { "dataValue": "PM", "dataTtext": "PM" }]);
		self.allselectedactionsSelected = ko.observable(false);
        isShowPopup = false;
        isShowNotifyPopup = false;
		$("#noRecureId").show();
		$("#recureId").hide();

		//Job Name validation
		self.jobName = ko.observable();
		self.jobName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_enter_job_name', {
					lng: lang
				})
			}
		});


		self.newJobClick = function () {
			$("#advanceQuickSearchBtn").hide();// Advance search
			$("#advanceQuickSearchSearchCriteria").hide();

			$("#showHideResetExportbtn").hide();///Hide show/hide buttons

			//  fetchGenerateJobName(self.jobName, self.isNewJobCreatedStatus)


		}

		//Clear Filter
		self.clearfilter = function (gId) {
			clearUiGridFilter(gId);
			$('#' + gId).jqxGrid('clearselection');
			$("#btnForMoveRight").addClass('disabled');

			$('#jqxgridAvailableActions').jqxGrid('clearselection');
			gridSelectedArrayForSwap = [];
			rowIndexForHighlighted = undefined;
		}
		// initialization call Generate Job Name
		// koUtil.isNewJobCreated = 0;

		//if (koUtil.isNewJobCreated == 1) {
		//} else {

		// }

		//if ($('#rdoDateId').is(':checked')) {
		//    $("#endAfterLabel").focus();
		//}

		$("#jobNameTxt").val(koUtil.jobNameValAction);

		if ($("#tabSchedule").hasClass('active')) {
			if (checkflagForNewJobAction == 0) {
				fetchGenerateJobName(self.jobName, self.isNewJobCreatedStatus);
			} else {

			}
		}

		//First Tab call



		getConfigurationValues();
		self.chkInterval('No end date');
		self.chkRecureence('None');


		self.allPackagesMove = function () {
			var arr = self.movedArray();
			if (arr.length > 0) {
				for (i = 0; i < arr.length; i++) {
					self.movedArray([]);
					self.actionData.push(arr[i]);

				}
				selectedDownloadsActionsContent = [];
				$("#btnForMoveleft").addClass('disabled');
				$("#btnForMoveRight").addClass('disabled');
				$("#btnMoveItemUp").addClass('disabled');
				$("#btnMoveItemDown").addClass('disabled');
				selectedRowArrayForSwap = [];
				gridSelectedArrayForSwap = [];
				$('#jqxgridAvailableActions').jqxGrid('clearselection');

			}
			self.SubmitButtonEnableDisable();

			if (rowIndexForHighlighted != undefined) {
				if (rowIndexForHighlighted >= 0) {
					$('#jqxgridAvailableActions').jqxGrid('selectrow', rowIndexForHighlighted);
				}
			}

		}


		//Getting Config Value for Inactive devices
		function getConfigurationValues() {
			var category = "System";
			var configName = "Include Inactive Devices for Scheduling";
			function callbackFunction(data, error) {
				if (data) {

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.systemConfiguration)
							data.systemConfiguration = $.parseJSON(data.systemConfiguration);

						if (data.systemConfiguration.ConfigValue == 0) {
							includeInactiveDevices = false;
						} else {
							includeInactiveDevices = true;
						}
					}
				}
				if (error) {
					retval = "";
				}
			}

			var method = 'GetSystemConfiguration';
			var params = '{"token":"' + TOKEN() + '","category":"' + category + '","configName":"' + configName + '"}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		function fetchGenerateJobName(jobName, isNewJobCreatedStatus) {

			if ($("#jobNameTxt").val().trim() != '' && isNewJobCreatedStatus(true))
				return;

			function callbackFunction(data, error) {
				if (data) {

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						self.rbReccuranceIntervalclick('None');
						jobName(data.jobName);
						checkflagForNewJobAction = 1;
						koUtil.jobNameValAction = data.jobName;
						$("#jobNameTxt").val(koUtil.jobNameValAction);
						$("#jobNameTxt").prop('value', data.jobName)
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

		//// unload template
		self.unloadTempPopup = function (popupName) {
			self.alertModelPopup(popupName);
		};

		self.closeUserLogsPopup = function () {
			$("#UserLogsDiv").modal('hide');
		}
       
		$("#rbtAll").on('change', function () {
			$("#txtUserLogs").prop('disabled', true);
			$("#filePathErrorTip").hide();
		})

		$("#rbtSpecific").on('change', function () {
			$("#txtUserLogs").prop('disabled', false);
		})

		self.validateFilePath = function (data) {
			if ($("#txtUserLogs").val().trim() != '') {
				$("#filePathErrorTip").hide();
			}
		}

		self.saveUserLogFileName = function () {
			if ($("#txtUserLogs").is(':disabled')) {
				var userLogFileName = '';
			} else {
				if ($("#txtUserLogs").val().trim() == '') {
					$("#filePathErrorTip").show();
					return;
				}
				var userLogFileName = $("#txtUserLogs").val();
			}
			$("#UserLogsDiv").modal('hide');
			var selectedData = getMultiSelectedData('jqxgridAvailableActions');
			var selectedDataArray = getSelectedUniqueId('jqxgridAvailableActions');

			gridSelectedArrayForSwap = new Array();
			if (selectedDataArray.length > 0) {
				for (k = 0; k < selectedDataArray.length; k++) {
					var selectedsource = _.where(selectedData, { DeviceActionId: selectedDataArray[k] });
					if (selectedsource && selectedsource.length > 0) {
						if (selectedsource[0].DeviceActionTypeName == "GetUserLogs") {
							selectedsource[0].LogFilePathInDevice = userLogFileName;
						} else {
							selectedsource[0].LogFilePathInDevice = '';
						}
						gridSelectedArrayForSwap.push(selectedsource[0]);
					}
				}
			}
			pushSelectedActions();
        }


        self.isfocus = ko.observable(false);
        self.isfocus(true);
        self.sendMessageTitle = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_enter_message_Title', {
                    lng: lang
                })
            }
        });
        self.sendMessageDescription = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_enter_message_Description', {
                    lng: lang
                })
            }
        });
        function validateSendMessageForm() {
            if ($("#sendMessageTitleId").val().trim() != '' && $("#sendMessageDescriptionId").val().trim() != '') {
                $("#saveMessageDiagnosticAction").removeAttr('disabled');
            } else {
                $("#saveMessageDiagnosticAction").prop('disabled', true);
            }
        }
         //Message Action Title Validation
        self.sendMessageTitle.subscribe(function (newValue) {
            validateSendMessageForm();
        });
      
        $("#sendMessageTitleId").on('change keypress keyup paste', function () {
            validateSendMessageForm();    
        });

        $('#sendMessageTitleId').on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 9) {
                if ($(this).val() == "") {
                    self.sendMessageTitle(null);
                }
            }
        });
        //Message Action Description Validation
        self.sendMessageDescription.subscribe(function (newValue) {
            validateSendMessageForm();
        });

        $("#sendMessageDescriptionId").on('change keypress keyup paste', function () {
            validateSendMessageForm();
        });

        $('#sendMessageDescriptionId').on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 9) {
                if ($(this).val() == "") {
                    self.sendMessageDescription(null);
                }
            }
        });     
        self.closeSendMessagePopup = function () {
            $("#sendMessageContainer").modal('hide');
        }

       
        self.saveActionMessage = function () {            
            $("#sendMessageContainer").modal('hide');
            var selectedData = getMultiSelectedData('jqxgridAvailableActions');
            var selectedDataArray = getSelectedUniqueId('jqxgridAvailableActions');
            gridSelectedArrayForSwap = new Array();
            if (selectedDataArray.length > 0) {
                for (k = 0; k < selectedDataArray.length; k++) {
                    var selectedsource = _.where(selectedData, { DeviceActionId: selectedDataArray[k] });
                    if (selectedsource && selectedsource.length > 0) {
                        var selectedsource = _.where(selectedData, { DeviceActionId: selectedDataArray[k] });
                        if (selectedsource && selectedsource.length > 0) {
                            selectedsource[0].Title = self.sendMessageTitle();
                            selectedsource[0].MessageInfo = self.sendMessageDescription();
                        }
                        gridSelectedArrayForSwap.push(selectedsource[0]);
                    }
                }
            }
            pushSelectedActions();            
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

		//Open poup

		var compulsoryfields = ['SerialNumber', 'ModelName'];
		var modelName = 'unloadTemplate';
		loadelement(modelName, 'genericPopup');

		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.alertModelPopup(elementname);
		}


		////////////////////////////////Second


		self.scheduleScreen = function () {
			$("#advanceQuickSearchBtn").hide();// Advance search
			$("#advanceQuickSearchSearchCriteria").hide();
			$("#showHideResetExportbtn").hide();

			$("#selectedDevicesGrid").hide();
			$("#schduleGrid").show();
			$("#previousBtn").show();
			$("#nextBtn").show();
			$("#filterButtons").hide();
			var currentDate = moment(new Date()).format(currentDateShort);
			$('#downloadDatepicker').prop('value', currentDate);
			$('#endByDatePicker').prop('value', currentDate);
			fetchDiagnosticsActionsbyModelList(self.actionData, self.movedArray);
			self.rbReccuranceIntervalclick("None");
			check = 1;
		}

		if (isMiddleMenuClicked) {
			fetchDiagnosticsActionsbyModelList(self.actionData, self.movedArray);
		}
		/////////////////////////////////////////////////////////Begin action at Radio Button click///////////////////////////////////////

		$("#recurrenceSection").addClass('disabled');

		self.rbDownloadNextMaintenanceClick = function () {
			self.chkRecureence('None');
			self.dateDownload(false);
			setEnabledStatusDownload();
			currentSelectedActionOption = "OnNextMaintenanceWindow";
			self.chkInterval('No end date');
			var now = new Date();              //update New time hwen click on radio button
			var dateobj = formatAMPM(now);
			$('#downloadDatepicker').val(currentDate);
			$("#downloadHours").val(dateobj.hours);
			//$("#downloadMinutes").val(dateobj.minutes);

			if (dateobj.minutes == 59) {
				$("#downloadMinutes").val('0');
			} else if (dateobj.minutes < 59) {
				$("#downloadMinutes").val(parseInt(dateobj.minutes) + 1);
			} else {
				$("#downloadMinutes").val(parseInt(dateobj.minutes));
			}

			$("#downloadName").val(dateobj.ampm);

			return true;
		}

		self.rbDownloadNextContactclick = function () {
			self.chkRecureence('None');
			self.dateDownload(false);
			setEnabledStatusDownload();
			currentSelectedActionOption = "Immediate";
			self.chkInterval('No end date');
			var now = new Date();              //update New time hwen click on radio button
			var dateobj = formatAMPM(now);
			$('#downloadDatepicker').val(currentDate);
			$("#downloadHours").val(dateobj.hours);
			// $("#downloadMinutes").val(dateobj.minutes);
			if (dateobj.minutes == 59) {
				$("#downloadMinutes").val('0');
			} else if (dateobj.minutes < 59) {
				$("#downloadMinutes").val(parseInt(dateobj.minutes) + 1);
			} else {
				$("#downloadMinutes").val(parseInt(dateobj.minutes));
			}

			$("#downloadName").val(dateobj.ampm);
			return true;
		}

		$("#downloadHours").on('keyup', function () {
			var now = new Date();
			var dateobj = formatAMPM(now);
			var downloadHours = $("#downloadHours").val();
			if (downloadHours >= 0 && downloadHours <= 12)
				return true;
			else
				$("#downloadHours").val(dateobj.hours);

		})

		$("#downloadMinutes").on('keyup', function () {
			var now = new Date();
			var dateobj = formatAMPM(now);
			var downloadMinutes = $("#downloadMinutes").val();
			if (downloadMinutes >= 0 && downloadMinutes <= 59)
				return true;
			else
				$("#downloadMinutes").val(dateobj.minutes + 1);


		})

		function setEnabledStatusDownload() {
			$("#noneId").prop("disabled", true);
			$("#hourlyId").prop("disabled", true);
			$("#dailyId").prop("disabled", true);
			$("#weeklyId").prop("disabled", true);
			$("#monthlyId").prop("disabled", true);
			$("#recurrenceSection").prop("disabled", true);
			$("#recurrenceSection").addClass('disabled');

			var now = new Date();              //update New time hwen click on radio button
			var dateobj = formatAMPM(now);

			//$("#downloadName").val(dateobj.ampm);
			if (self.dateDownload()) {
                if ((koUtil.Component == ENUM.get("POS")) || koUtil.Component == ENUM.get("POS_Android")) {
					$("#noneId").prop("disabled", false);
					$("#hourlyId").prop("disabled", false);
					$("#dailyId").prop("disabled", false);
					$("#weeklyId").prop("disabled", false);
					$("#monthlyId").prop("disabled", false);
					$("#recurrenceSection").prop("disabled", false);
					$("#recurrenceSection").removeClass('disabled');
				}
			}
			self.rbReccuranceIntervalclick();
		}

		self.rbDownloadDateTimeclick = function () {
			self.dateDownload(true);
			setEnabledStatusDownload();
			var currentDate = moment(new Date()).format(currentDateShort);
			$('#downloadDatepicker').prop('value', currentDate);
			currentSelectedActionOption = "SpecifiedDate";

			var now = new Date();              //update New time hwen click on radio button
			var dateobj = formatAMPM(now);
			$("#downloadHours").val(dateobj.hours);
			//$("#downloadMinutes").val(dateobj.minutes);

			if (dateobj.minutes == 59) {
				$("#downloadMinutes").val('0');
			} else if (dateobj.minutes < 59) {
				$("#downloadMinutes").val(parseInt(dateobj.minutes) + 1);
			} else {
				$("#downloadMinutes").val(parseInt(dateobj.minutes));
			}

			$("#downloadName").val(dateobj.ampm);

			return true;
		}


		function GetSystemConfigurationForExtensions(selectedRecurrenceIntCode, maxRecurrence) {
			var category = "Schedules and Timers";
			var configName = selectedRecurrenceIntCode;
			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.systemConfiguration)
							data.systemConfiguration = $.parseJSON(data.systemConfiguration);

						maxRecurrence(data.systemConfiguration.ConfigValue);
					}
				}
				if (error) {
					retval = "";
				}
			}

			var method = 'GetSystemConfiguration';
			var params = '{"token":"' + TOKEN() + '","category":"' + category + '","configName":"' + configName + '"}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}


		///////////////////////Action recurrences click/////

		self.rbReccuranceIntervalclick = function (reccuranceInterval) {
			selectedRecurrenceIntervalStr = reccuranceInterval;
			$('#recureEvery').prop('value', 1);
			self.isDateVisible(false);
			self.isRecureTextVisible(true);
			self.chkRecureence('None');
			$("#endByName").val(dateobj.ampm);

			if (selectedRecurrenceIntervalStr == 'None') {
				dateDisabled();
				//self.chkInterval('No end date');
				self.isDateVisible(false);
				self.isRecureTextVisible(true);
				function intervalFunction4() {
					self.chkRecureence('None');
					$("#noneId").prop("checked", true)
				}
				setTimeout(intervalFunction4, 500);

			} else if (selectedRecurrenceIntervalStr == 'Hourly') {
				dateDisabled();
				self.isRecureTextVisible(false);
				self.isDateVisible(true);
				$("#hoursId").show();
				$("#daysId").hide();
				$("#weeksId").hide();
				$("#monthsId").hide();
				//self.chkInterval('No end date');
				function intervalFunction() {
					self.chkRecureence('Hourly');
				}
				setTimeout(intervalFunction, 500);
				GetSystemConfigurationForExtensions(AppConstants.get('HOURLY_ID'), self.maxRecurrence);
			} else if (selectedRecurrenceIntervalStr == 'Daily') {
				dateDisabled();
				self.isRecureTextVisible(false);
				self.isDateVisible(true);
				$("#hoursId").hide();
				$("#daysId").show();
				$("#weeksId").hide();
				$("#monthsId").hide();
				//self.chkInterval('No end date');
				function intervalFunction1() {
					self.chkRecureence('Daily');
				}
				setTimeout(intervalFunction1, 500);
				GetSystemConfigurationForExtensions(AppConstants.get('DAILY_ID'), self.maxRecurrence);
			} else if (selectedRecurrenceIntervalStr == 'Weekly') {
				dateDisabled();
				self.isRecureTextVisible(false);
				self.isDateVisible(true);
				$("#hoursId").hide();
				$("#daysId").hide();
				$("#weeksId").show();
				$("#monthsId").hide();
				//self.chkInterval('No end date');
				function intervalFunction2() {
					self.chkRecureence('Weekly');
				}
				setTimeout(intervalFunction2, 500);
				GetSystemConfigurationForExtensions(AppConstants.get('WEEKLY_ID'), self.maxRecurrence);
			} else if (selectedRecurrenceIntervalStr == 'Monthly') {
				dateDisabled();
				self.isRecureTextVisible(false);
				self.isDateVisible(true);
				$("#hoursId").hide();
				$("#daysId").hide();
				$("#weeksId").hide();
				$("#monthsId").show();
				//self.chkInterval('No end date');
				function intervalFunction3() {
					self.chkRecureence('Monthly');
				}
				setTimeout(intervalFunction3, 500);
				GetSystemConfigurationForExtensions(AppConstants.get('MONTHLY_ID'), self.maxRecurrence);
			}
			self.reccureenceClick(self.chkInterval());
		}

		self.reccureenceClick = function (reccuranceDate) {
			recurrenceOptionStr = reccuranceDate;
			if (!$('#endAfterLabel').val())
				$('#endAfterLabel').prop('value', 1);
			if (reccuranceDate == 'No end date' && $("#inlineRadio2").is(':checked')) {
				$('#endAfterLabel').prop('value', 1);
				self.endAfterEnable(false);
				setEnabledStatus_ReccuranceInterval(false);
			} else if (reccuranceDate == 'End after' && $("#endAfter").is(':checked')) {
				self.endAfterEnable(true);
				setEnabledStatus_ReccuranceInterval(false);
			} else if (reccuranceDate == 'End by' && $("#endById").is(':checked')) {
				$('#endAfterLabel').prop('value', 1);
				self.endAfterEnable(false);
				setEnabledStatus_ReccuranceInterval(true);
			}

			var now = new Date();              //update New time hwen click on radio button
			var dateobj = formatAMPM(now);




			if (reccuranceDate == "End by") {

				var beginSectionAt = dateCompareForSchedule($("#downloadDatepicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
				if (beginSectionAt == 0) {
					if ($('#rdoDateId').is(':checked')) {
						if ($("#downloadMinutes").val() != 59) {
							$("#endByDatePicker").val($("#downloadDatepicker").val());
							$("#endByHour").val($("#downloadHours").val());
							$("#endByMinutes").val(parseInt($("#downloadMinutes").val()) + 1);
							$("#endByName").val($("#downloadName").val());

						} else {
							if ($("#downloadMinutes").val() == 59) {
								if ($("#downloadHours").val() == 11) {
									$("#endByHour").val(1);
									$("#endByMinutes").val(0);
									if ($('#downloadName :selected').text() == "PM") {
										$("#endByDatePicker").val(moment($("#downloadDatepicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
										$('#endByName').val("AM").prop("selected", "selected");
									} else {
										$('#endByName').val("PM").prop("selected", "selected");
									}
								} else if ($("#downloadHours").val() == 12) {
									$("#endByDatePicker").val($("#downloadDatepicker").val());
									$("#endByHour").val(1);
									$("#endByMinutes").val(0);
									$("#endByName").val($("#downloadName").val());

								} else {
									$("#endByDatePicker").val($("#downloadDatepicker").val());
									$("#endByHour").val(parseInt($("#downloadHours").val()) + 1);
									$("#endByMinutes").val(0);
									$("#endByName").val($("#downloadName").val());

								}
							}
						}
					}
				} else {
					if ($("#downloadMinutes").val() != 59) {
						$("#endByDatePicker").val($("#downloadDatepicker").val());
						$("#endByHour").val($("#downloadHours").val());
						$("#endByMinutes").val(parseInt($("#downloadMinutes").val()) + 1);
						$("#endByName").val($("#downloadName").val());

					} else {
						if ($("#downloadMinutes").val() == 59) {
							if ($("#downloadHours").val() == 11) {
								$("#endByHour").val(1);
								$("#endByMinutes").val(0);
								if ($('#downloadName :selected').text() == "PM") {
									$("#endByDatePicker").val(moment($("#downloadDatepicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
									$('#endByName').val("AM").prop("selected", "selected");
								} else {
									$('#endByName').val("PM").prop("selected", "selected");
								}
							} else if ($("#downloadHours").val() == 12) {
								$("#endByDatePicker").val($("#downloadDatepicker").val());
								$("#endByHour").val(1);
								$("#endByMinutes").val(0);
								$("#endByName").val($("#downloadName").val());

							} else {
								$("#endByDatePicker").val($("#downloadDatepicker").val());
								$("#endByHour").val(parseInt($("#downloadHours").val()) + 1);
								$("#endByMinutes").val(0);
								$("#endByName").val($("#downloadName").val());

							}
						}
					}
				}
			} else {
				$("#endByDatePicker").val(currentDate);

				// $("#endByMinutes").val(dateobj.minutes);

				if (dateobj.minutes == 59) {
					$("#endByMinutes").val('0');
					if (parseInt(dateobj.hours) == 12) {
						$("#endByHour").val(1);
					} else if (parseInt(dateobj.hours) == 11) {
						$("#endByHour").val(12);
					} else {

						$("#endByHour").val(parseInt(dateobj.hours) + 1);
					}
				} else if (dateobj.minutes < 59) {
					$("#endByMinutes").val(parseInt(dateobj.minutes) + 1);
					$("#endByHour").val(parseInt(dateobj.hours));
				} else {
					$("#endByMinutes").val(parseInt(dateobj.minutes));
				}

				$("#endByName").val(dateobj.ampm);

			}

			if (!_.isEmpty(scheduleValuesGlobalObject) && !_.isEmpty(scheduleValuesGlobalObject.scheduleAction)) {
				if (reccuranceDate == 'End by' && $("#endById").is(':checked')) {
					if (!_.isEmpty(scheduleValuesGlobalObject.scheduleAction.actionsRecurrence)) {
						var actionsRecurrenceValues = scheduleValuesGlobalObject.scheduleAction.actionsRecurrence;
						if (actionsRecurrenceValues.endById) {
							$('#endByDatePicker').prop('value', actionsRecurrenceValues.endByDatePicker);
							$("#endByHour").val(actionsRecurrenceValues.endByHour);
							$("#endByMinutes").val(actionsRecurrenceValues.endByMinutes);
							$("#endByName").val(actionsRecurrenceValues.endByName);
						}
					}
				}
			}
		}
		setEnabledStatusDownload();

		$("#endByDatePicker").prop("disabled", true);
		$("#endByHour").prop("disabled", true);
		$("#endByMinutes").prop("disabled", true);
		$("#endByName").prop("disabled", true);

		function dateEnabled() {
			$("#endByDatePicker").prop("disabled", false);
			$("#endByHour").prop("disabled", false);
			$("#endByMinutes").prop("disabled", false);
			$("#endByName").prop("disabled", false);
		}

		function dateDisabled() {
			$("#endByDatePicker").prop("disabled", true);
			$("#endByHour").prop("disabled", true);
			$("#endByMinutes").prop("disabled", true);
			$("#endByName").prop("disabled", true);
		}
		function setEnabledStatus_ReccuranceInterval(isEnabled) {
			if (isEnabled == true) {
				dateEnabled();
			} else {
				dateDisabled();
			}

			var currentDate = moment(new Date()).format(currentDateShort);
			//$('#endByDatePicker').prop('value', currentDate);
			//$('#endByHour').prop('value', 12);
			//$('#endByMinutes').prop('value', 0);
			//$("#endByName").val("AM");
			//alert($("#endByName").val() + "7");
		}

		//////////////////////////////////////////////
		self.openConfirmationPopup = function () {
			$('#downloadModelconfo').modal('show');
		}

		self.agCancel = function () {
			agCancel();
		}

		function addgroup() {
			$(".confirmationTitle").addClass("confirmationShow");
		}
		function agCancel() {

			$(".confirmationTitle").removeClass("confirmationShow");
		}

		//New changes////
		$("#endByDatePicker").datepicker().on('changeDate', function (ev) {
			//set date new code
			var fromval = $("#endByDatePicker").val();
			$("#endByDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			var curt = moment($("#endByDatePicker").val()).format(SHORT_DATE_FORMAT);
			if (moment(curt).isAfter(moment($("#downloadDatepicker").val()).format(SHORT_DATE_FORMAT))) {
				$("#endByDatePicker").change();
			}

		});

		$("#endByDatePicker").change(function () {
			//set date new code
			var fromval = $("#endByDatePicker").val();
			$("#endByDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			var beginSectionAt = dateCompareForSchedule($("#downloadDatepicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
			if (beginSectionAt == 0) {
				var curt = moment($("#endByDatePicker").val()).format(SHORT_DATE_FORMAT);
				if (moment(curt).isAfter(moment($("#downloadDatepicker").val()).format(SHORT_DATE_FORMAT))) {

				} else {
					if (beginSectionAt == 0) {

					} else {
						openAlertpopup(1, 'end_by_date');
					}
					if ($("#downloadMinutes").val() == 59) {
						if ($("#downloadHours").val() == 11) {
							if ($('#downloadName :selected').text() == "PM") {
								$("#endByDatePicker").val(moment($("#downloadDatepicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
								$('#endByName').val("AM").prop("selected", "selected");

							}
						} else if ($("#downloadHours").val() == 12) {
							$("#endByHour").val(1);
							$("#endByMinutes").val(0);
						}
					} else {
						$("#endByDatePicker").val(moment($("#downloadDatepicker").val()).format(SHORT_DATE_FORMAT));
					}
				}

			} else {

			}
		});

		$("#downloadDatepicker").datepicker().on('changeDate', function (ev) {
			//set date new code
			var fromval = $("#downloadDatepicker").val();
			$("#downloadDatepicker").datepicker({ autoclose: true, setDate: fromval });
			//
			var curt = moment().format(SHORT_DATE_FORMAT);
			if (moment(curt).isAfter(moment($("#downloadDatepicker").val()).format(SHORT_DATE_FORMAT))) {
				$("#downloadDatepicker").change();
			}
		});

		$("#downloadDatepicker").change(function () {
			//set date new code
			var fromval = $("#downloadDatepicker").val();
			$("#downloadDatepicker").datepicker({ autoclose: true, setDate: fromval });
			$("#downloadDatepicker").datepicker('setStartDate', currentDate);
			//

			var beginSectionAt = dateCompareForSchedule($("#downloadDatepicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
			var curt = moment().format(SHORT_DATE_FORMAT);
			if (beginSectionAt == 0) {
				if (($("#downloadDatepicker").val() == $("#endByDatePicker").val()) && ($("#downloadHours").val() == $("#endByHour").val()) && ($("#downloadName").val() == $("#endByName").val())) {
					$("#endByMinutes").val(parseInt($("#downloadMinutes").val()) + 1);
				}
			} else {
				if ($("#downloadMinutes").val() == 59) {
					if ($("#downloadHours").val() == 12) {
						$("#endByHour").val(1);
						$("#endByMinutes").val(0);
					}
					if ($("#downloadHours").val() == 11) {
						$("#endByHour").val(12);
						$("#endByMinutes").val(0);

						if ($('#downloadName :selected').text() == "AM") {
							$('#endByName').val("PM").prop("selected", "selected");

						} else if ($('#downloadName :selected').text() == "PM") {
							$("#endByDatePicker").val(moment($("#downloadDatepicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#endByName').val("AM").prop("selected", "selected");
						}
					} else {

						$("#endByDatePicker").val(moment($("#downloadDatepicker").val()).format(SHORT_DATE_FORMAT));
						$("#endByMinutes").val(0);
					}

				} else {

					$("#endByDatePicker").val(moment($("#downloadDatepicker").val()).format(SHORT_DATE_FORMAT));
					$("#endByMinutes").val(parseInt($("#downloadMinutes").val()) + 1);
					$("#endByHour").val(parseInt($("#downloadHours").val()));
				}
			}

			var endByDateAfterChange = $("#endByDatePicker").val();
			$("#endByDatePicker").datepicker('setStartDate', fromval);
			$("#endByDatePicker").datepicker('update', endByDateAfterChange);
		});


		//----------------------------------------------------START----------ON Arrow Up and Down (Numeric Stepper)------------------------------------
		self.downloadHoursOnUpClick = function () {
			var downloadHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $('#downloadName').val();
			if (parseInt(downloadHours) < 12) {
				downloadHours = parseInt(downloadHours) + 1;
				var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
				beginActionAtEndByDateCompareUpDown(beginSectionAt, downloadHours, downloadMinutes, downloadName)
			} else if (parseInt(downloadHours) == 12) {
				downloadHours = 12;
				var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
				beginActionAtEndByDateCompareUpDown(beginSectionAt, downloadHours, downloadMinutes, downloadName)
			}


		}

		self.downloadHoursOnDownClick = function () {
			var downloadHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $('#downloadName').val();
			if (parseInt(downloadHours) < 12 && parseInt(downloadHours) != 1) {
				downloadHours = parseInt(downloadHours) - 1;
				var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
				beginActionAtEndByDateCompareUpDown(beginSectionAt, $("#downloadHours").val(), downloadMinutes, downloadName)
			} else if (parseInt(downloadHours) == 12) {
				downloadHours = 11;
				var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
				beginActionAtEndByDateCompareUpDown(beginSectionAt, $("#downloadHours").val(), downloadMinutes, downloadName)
			}


		}

		self.downloadMinuteOnUpClick = function () {
			var downloadHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $('#downloadName').val();
			if (parseInt(downloadMinutes) < 59) {
				downloadMinutes = parseInt(downloadMinutes) + 1;
				var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, downloadMinutes, $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
				beginActionAtEndByDateCompareUpDown(beginSectionAt, downloadHours, downloadMinutes, downloadName)
			} else if (parseInt(downloadMinutes) == 59) {
				downloadMinutes = 59;
				var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, downloadMinutes, $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
				beginActionAtEndByDateCompareUpDown(beginSectionAt, downloadHours, downloadMinutes, downloadName)
			}

		}

		self.downloadMinuteOnDownClick = function () {
			var downloadHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $('#downloadName').val();
			if (parseInt(downloadMinutes) < 59 && parseInt(downloadMinutes) != 0) {
				downloadMinutes = parseInt(downloadMinutes) - 1;
				var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, downloadMinutes, $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
				beginActionAtEndByDateCompareUpDown(beginSectionAt, $("#downloadHours").val(), $("#downloadMinutes").val(), downloadName)
			} else if (parseInt(downloadMinutes) == 59) {
				downloadMinutes = 58;
				var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, downloadMinutes, $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
				beginActionAtEndByDateCompareUpDown(beginSectionAt, $("#downloadHours").val(), $("#downloadMinutes").val(), downloadName)
			}


		}

		self.EndByHoursOnUpClick = function () {
			var downloadHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $('#downloadName').val();

			var endByHour = $("#endByHour").val();
			var endByMinutes = $("#endByMinutes").val();
			var dateAMPM = $('#dateAMPM').val();

			var EndByTimeHourSenValue = $("#endByHour").val();
			EndByTimeHourSenValue = parseInt(EndByTimeHourSenValue) + 1;
			if (parseInt(endByHour) == 12) {

			} else
				if (parseInt(endByHour) < 12 && parseInt(endByHour) != 0) {
					endByHour = parseInt(endByHour) + 1;
					var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), endByHour, $("#endByMinutes").val(), $("#endByName").val())
					beginActionAtEndByDateCompareUpDownEndBy(beginSectionAt, EndByTimeHourSenValue, endByMinutes, dateAMPM, downloadHours, downloadMinutes, downloadName)
				} else if (parseInt(endByHour) == 12) {
					endByHour = 12;
					var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), endByHour, $("#endByMinutes").val(), $("#endByName").val())
					beginActionAtEndByDateCompareUpDownEndBy(beginSectionAt, EndByTimeHourSenValue, endByMinutes, dateAMPM, downloadHours, downloadMinutes, downloadName)
				} else {

				}


		}

		self.EndByHoursOnDownClick = function () {
			var downloadHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $('#downloadName').val();

			var endByHour = $("#endByHour").val();
			var endByMinutes = $("#endByMinutes").val();
			var dateAMPM = $('#dateAMPM').val();

			var EndByTimeHourSenValue = $("#endByHour").val();
			EndByTimeHourSenValue = parseInt(EndByTimeHourSenValue) + 1;

			if (parseInt(endByHour) < 12 && parseInt(endByHour) != 1) {
				endByHour = parseInt(endByHour) - 1;
				var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), endByHour, $("#endByMinutes").val(), $("#endByName").val())
				beginActionAtEndByDateCompareUpDownEndBy(beginSectionAt, EndByTimeHourSenValue, endByMinutes, dateAMPM, downloadHours, downloadMinutes, downloadName)
			} else if (parseInt(endByHour) == 12) {
				endByHour = 11;
				var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), endByHour, $("#endByMinutes").val(), $("#endByName").val())
				beginActionAtEndByDateCompareUpDownEndBy(beginSectionAt, EndByTimeHourSenValue, endByMinutes, dateAMPM, downloadHours, downloadMinutes, downloadName)
			}


		}

		self.EndByMinuteOnUpClick = function () {
			var downloadHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $('#downloadName').val();

			var endByHour = $("#endByHour").val();
			var endByMinutes = $("#endByMinutes").val();
			var dateAMPM = $('#dateAMPM').val();

			var EndByTimeMinuteSenValue = $("#downloadMinutes").val();
			EndByTimeMinuteSenValue = parseInt(EndByTimeMinuteSenValue) + 1;
			if (parseInt(endByHour) == 12) {

			} else
				if (parseInt(endByMinutes) < 59 && parseInt(endByMinutes) != 0) {
					endByMinutes = parseInt(endByMinutes) + 1;
					var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), endByHour, endByMinutes, $("#endByName").val())
					beginActionAtEndByDateCompareUpDownEndBy(beginSectionAt, endByHour, EndByTimeMinuteSenValue, dateAMPM, downloadHours, EndByTimeMinuteSenValue, downloadName)
				} else if (parseInt(endByMinutes) == 59) {
					endByMinutes = 58;
					var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), endByHour, endByMinutes, $("#endByName").val())
					beginActionAtEndByDateCompareUpDownEndBy(beginSectionAt, endByHour, EndByTimeMinuteSenValue, dateAMPM, downloadHours, EndByTimeMinuteSenValue, downloadName)
				}


		}

		self.EndByMinuteOnDownClick = function () {
			var downloadHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $('#downloadName').val();

			var endByHour = $("#endByHour").val();
			var endByMinutes = $("#endByMinutes").val();
			var dateAMPM = $('#dateAMPM').val();

			var EndByTimeMinuteSenValue = $("#downloadMinutes").val();
			EndByTimeMinuteSenValue = parseInt(EndByTimeMinuteSenValue) + 1;
			if (parseInt(endByHour) == 12) {

			} else
				if (parseInt(endByMinutes) < 59 && parseInt(endByMinutes) != 0) {
					endByMinutes = parseInt(endByMinutes) - 1;
					var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), endByHour, endByMinutes, $("#endByName").val())
					beginActionAtEndByDateCompareUpDownEndBy(beginSectionAt, endByHour, EndByTimeMinuteSenValue, dateAMPM, downloadHours, EndByTimeMinuteSenValue, downloadName);
				} else if (parseInt(endByMinutes) == 59) {
					endByMinutes = 58;
					var beginSectionAt = dateCompareForScheduleIffEqual($("#downloadDatepicker").val(), downloadHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), endByHour, endByMinutes, $("#endByName").val())
					beginActionAtEndByDateCompareUpDownEndBy(beginSectionAt, endByHour, EndByTimeMinuteSenValue, dateAMPM, downloadHours, EndByTimeMinuteSenValue, downloadName)
				}


		}


		function beginActionAtEndByDateCompareUpDown(beginSectionAt, downloadHours, downloadMinutes, downloadName) {
			if (beginSectionAt == 0) {

			} else {
				if (downloadMinutes != 59) {
					$("#endByHour").val(downloadHours);

					var endByMinutes = $("#endByMinutes").val();

					if (parseInt(endByMinutes) > parseInt(downloadMinutes)) {
						$("#endByMinutes").val(parseInt(endByMinutes));
					} else {
						$("#endByMinutes").val(parseInt(downloadMinutes) + 1);
					}

					$('#endByName').val(downloadName).prop("selected", "selected");
				} else {
					if (downloadHours == 12) {
						$("#endByHour").val(1);
						$('#endByName').val(downloadName).prop("selected", "selected");
					} else if (downloadHours == 11) {
						if ($('#downloadName :selected').text() == "PM") {
							$("#endByDatePicker").val(moment($("#downloadDatepicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#endByName').val("AM").prop("selected", "selected");
							var endByDatePicker = $("#endByDatePicker").val();
							updateAndSetApplyDate(endByDatePicker);

						} else {
							$('#endByName').val("PM").prop("selected", "selected");
							$("#endByDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
						}
						$("#endByHour").val(12);
					} else {

						$("#endByHour").val(parseInt(downloadHours) + 1);
					}
					$("#endByMinutes").val(0);
				}
			}
		}
		function updateAndSetApplyDate(applyDatePicker) {
			$("#endByDatePicker").datepicker('update', applyDatePicker);
			$("#endByDatePicker").datepicker('setStartDate', applyDatePicker);
		}
		function beginActionAtEndByDateCompareUpDownEndBy(beginSectionAt, endByHour, endByMinutes, dateAMPM, downloadHours, downloadMinutes, downloadName) {
			if (beginSectionAt == 0) {

			} else {

				if (downloadMinutes != 59) {
					var endByMinutes = $("#endByMinutes").val();
					$("#endByHour").val(parseInt(endByHour));

					if (parseInt(endByMinutes) > parseInt(downloadMinutes)) {
						$("#endByMinutes").val(parseInt(endByMinutes));
					} else {
						$("#endByMinutes").val(parseInt(downloadMinutes) + 1);
					}

					$('#dateAMPM').val($("#downloadName").val()).prop("selected", "selected");
				} else {
					if ($("#downloadHours").val() == 12) {
						$("#endByHour").val(1);
						$('#dateAMPM').val($("#downloadName").val()).prop("selected", "selected");
					} else if ($("#downloadHours").val() == 11) {
						if ($('#downloadName :selected').text() == "PM") {
							$("#endByDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#dateAMPM').val("AM").prop("selected", "selected");
							var endByDatePicker = $("#endByDatePicker").val();
							updateAndSetApplyDate(endByDatePicker);

						} else {
							$('#dateAMPM').val("PM").prop("selected", "selected");
							$("#endByDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
						}
						$("#endByHour").val(12);

					} else {
						$("#endByHour").val(parseInt(downloadHours) + 1);

					}
					$("#endByMinutes").val(0);
				}

			}
		}
		//----------------------------------------------------END----------ON Arrow Up and Down (Numeric Stepper)------------------------------------
		$("#downloadHours").on("blur", function () {
			var fromval = $("#downloadDatepicker").val();
			var dHr = $("#downloadHours").val();
			var dMinut = $("#downloadMinutes").val();
			var endByMin = $("#endByMinutes").val();

			var beginSectionAt = dateCompareForSchedule($("#downloadDatepicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
			if (beginSectionAt == 0) {
				if (($("#downloadDatepicker").val() == $("#endByDatePicker").val()) && ($("#downloadHours").val() == $("#endByHour").val()) && ($("#downloadName").val() == $("#endByName").val())) {
					if (parseInt(endByMin) > parseInt(dMinut)) {
						$("#endByMinutes").val(parseInt(endByMin));
					} else {
						$("#endByMinutes").val(parseInt(dMinut) + 1);
					}

				}
			} else {
				if ($("#downloadMinutes").val() == 59) {
					if ($("#downloadHours").val() == 12) {
						$("#endByHour").val(1);
						$("#endByMinutes").val(0);
						if ($('#downloadName :selected').text() == "AM") {

							$('#endByName').val("AM").prop("selected", "selected");
						} else {

							$('#endByName').val("PM").prop("selected", "selected");

						}
					} else if ($("#downloadHours").val() == 11) {
						$("#endByHour").val(12);
						$("#endByMinutes").val(0);

						if ($('#downloadName :selected').text() == "AM") {
							$('#endByName').val("PM").prop("selected", "selected");

						} else if ($('#downloadName :selected').text() == "PM") {

							$("#endByDatePicker").val(moment($("#downloadDatepicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#endByName').val("AM").prop("selected", "selected");
						}
					} else {

						$("#endByHour").val(parseInt(dHr) + 1);
						$("#endByMinutes").val(0);
						$("#endByDatePicker").val(moment($("#downloadDatepicker").val()).format(SHORT_DATE_FORMAT));
					}
				} else {
					$("#endByHour").val($("#downloadHours").val());

					if (parseInt(endByMin) > parseInt(dMinut)) {
						$("#endByMinutes").val(parseInt(endByMin));
					} else {
						$("#endByMinutes").val(parseInt(dMinut) + 1);
					}


				}
			}
			var endByDateAfterChange = $("#endByDatePicker").val();
			$("#endByDatePicker").datepicker('setStartDate', fromval);
			//$("#endByDatePicker").datepicker('setDate', endByDateAfterChange);
		});

		$("#downloadMinutes").on("blur", function () {
			var fromval = $("#downloadDatepicker").val();
			var dHr = $("#downloadHours").val();
			var dMinut = $("#downloadMinutes").val();
			var endByMin = $("#endByMinutes").val();

			var beginSectionAt = dateCompareForSchedule($("#downloadDatepicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())
			if (beginSectionAt == 0) {
				if (($("#downloadDatepicker").val() == $("#endByDatePicker").val()) && ($("#downloadHours").val() == $("#endByHour").val()) && ($("#downloadName").val() == $("#endByName").val())) {
					if (parseInt(endByMin) > parseInt(dMinut)) {
						$("#endByMinutes").val(parseInt(endByMin));
					} else {
						$("#endByMinutes").val(parseInt(dMinut) + 1);
					}

				}
			} else {
				if ($("#downloadMinutes").val() == 59) {
					if ($("#downloadHours").val() == 12) {
						$("#endByHour").val(1);
						$("#endByMinutes").val(0);
						if ($('#downloadName :selected').text() == "AM") {
							$('#endByName').val("AM").prop("selected", "selected");
						} else {
							$('#endByName').val("PM").prop("selected", "selected");
						}
					} else if ($("#downloadHours").val() == 11) {
						$("#endByHour").val(12);
						$("#endByMinutes").val(0);

						if ($('#downloadName :selected').text() == "AM") {
							$('#endByName').val("PM").prop("selected", "selected");

						} else if ($('#downloadName :selected').text() == "PM") {
							$("#endByDatePicker").val(moment($("#downloadDatepicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#endByName').val("AM").prop("selected", "selected");
						}
					} else {
						$("#endByDatePicker").val(moment($("#downloadDatepicker").val()).format(SHORT_DATE_FORMAT));
						$("#endByHour").val(parseInt(dHr) + 1);
						$("#endByMinutes").val(0);
					}
				} else {
					$("#endByHour").val($("#downloadHours").val());

					if (parseInt(endByMin) > parseInt(dMinut)) {
						$("#endByMinutes").val(parseInt(endByMin));
					} else {
						$("#endByMinutes").val(parseInt(dMinut) + 1);
					}
				}
			}
			var endByDateAfterChange = $("#endByDatePicker").val();
			$("#endByDatePicker").datepicker('setStartDate', fromval);
			// $("#endByDatePicker").datepicker('setDate', endByDateAfterChange);
		});



		$("#endByHour").on("blur", function () {
			var dHr = $("#endByHour").val();
			var dMinut = $("#endByMinutes").val();

			var beginSectionAt = dateCompareForSchedule($("#downloadDatepicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())

			if (beginSectionAt == 1) {
				$("#endByHour").val(parseInt($("#downloadHours").val()));
				$("#endByMinutes").val(parseInt($("#downloadMinutes").val()) + 1);
			}

			//if ($("#endByMinutes").val() == 0) {
			//    if ($("#endByHour").val() == 1) {
			//        $("#downloadHours").val(12);
			//        $("#downloadMinutes").val(59);
			//        if ($('#endByName :selected').text() == "AM") {
			//            $('#downloadName').val("PM").prop("selected", "selected");
			//        } else {

			//            $("#downloadDatepicker").val(moment($("#endByDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
			//            $('#downloadName').val("AM").prop("selected", "selected");

			//        }
			//    } else {

			//        $("#downloadHours").val(parseInt(dHr) - 1);
			//        $("#downloadMinutes").val(0);
			//    }
			//} else {
			//    $("#downloadHours").val($("#endByHour").val());
			//    $("#downloadMinutes").val(parseInt(dMinut) - 1);
			//}
		});

		$("#endByMinutes").on("blur", function () {
			var dHr = $("#downloadHours").val();
			var dMinut = $("#downloadMinutes").val();

			var beginSectionAt = dateCompareForSchedule($("#downloadDatepicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val())

			if (beginSectionAt == 1) {
				if ($("#downloadMinutes").val() == 59) {
					$("#endByMinutes").val(0);
				} else {
					$("#endByMinutes").val(parseInt($("#downloadMinutes").val()) + 1);
				}
			} else {
				if (($("#downloadDatepicker").val() == $("#endByDatePicker").val()) && ($("#downloadHours").val() == $("#endByHour").val()) && ($("#downloadName").val() == $("#endByName").val())) {
					$("#endByMinutes").val(parseInt($("#downloadMinutes").val()) + 1);
				}
			}


			//if ($("#endByMinutes").val() < $("#downloadMinutes").val()) {
			//    if ($("#endByMinutes").val() == 59) {
			//        $("#endByHour").val(parseInt($("#downloadHours").val()) + 1);
			//        $("#endByMinutes").val(0);
			//    } else {
			//        $("#endByMinutes").val(parseInt($("#downloadMinutes").val()));
			//    }
			//}



			//if ($("#endByMinutes").val() == 59) {
			//    if ($("#endByHour").val() == 12) {
			//        $("#downloadHours").val(1);
			//        $("#downloadMinutes").val(0);
			//        if ($('#endByName :selected').text() == "AM") {
			//            $('#downloadName').val("PM").prop("selected", "selected");
			//        } else {
			//            $("#endByDatePicker").val(moment($("#downloadDatepicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
			//            $('#endByName').val("AM").prop("selected", "selected");

			//        }
			//    } else {

			//        $("#endByHour").val(parseInt(dHr) + 1);
			//        $("#endByMinutes").val(0);
			//    }
			//} else {
			//    $("#endByHour").val($("#downloadHours").val());
			//    $("#endByMinutes").val(parseInt(dMinut) + 1);
			//}
		});

		///End of new changes///
		function checkError() {
			var retval = '';
			if ($("#jobNameTxt").val().trim() == "") {
				retval += 'login name';
				self.jobName(null);
				$("#please_enter_job_name").show();
			} else {
				retval += '';
			}
			return retval;
		}

		self.previousClick = function () {
			isSearchAppliedForSchedule = false;
			$("#advanceQuickSearchBtn").show();// Advance search
			$("#advanceQuickSearchSearchCriteria").show();

			$("#showHideResetExportbtn").show();
			$("#newJobBtn").prop("disabled", true);
			if ($("#tabSchedule").hasClass('active')) {
				$("#tabSchedule").removeClass('active')
				$("#tabSelectedDevice").addClass('active');
				$("#tabSelectedDevice").removeClass("disabled");
				$("#tabSchedule").removeClass("disabled");
				$("#selectedDevicesGrid").show();
				$("#schduleGrid").hide();
				$("#nextBtn").show();
				$("#nextSchedule").show();
			}
			$("#newJobBtn").attr("disabled", true);
			//To retain selected schedule values when go to previous tab
			getActionSelectScheduleValues();
		}

		self.submitClick = function () {
			$("#advanceQuickSearchBtn").hide();// Advance search
			$("#advanceQuickSearchSearchCriteria").hide();
			//$("#newJobBtn").prop("disabled", true);
			$("#showHideResetExportbtn").hide();
			if ($("#tabSchedule").hasClass('active')) {

				$("#filterButtons").show();
				var datainfo = $("#jqxgridForSelectedDevices").jqxGrid('getdatainformation');
				var scheduledownCount = datainfo.rowscount;
				var retval = checkError();
				if (datainfo.rowscount < 0) {
					openAlertpopup(1, 'device_not_selected_for_action');
					return;
				}
				if (self.movedArray().length <= 0) {
					openAlertpopup(1, 'select_actions');
					return;
				}

				//--------------for End By date--------------------------
				var returnValue = dateCompareForSchedule($("#downloadDatepicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(),
					$("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val());


				//------------get current date and compare with downloaded on date-----------------
				var currentDate = new Date();
				var todayDate = displayDateOnEditScheduleAction(currentDate);

				//--------------Begin Action date--------------------------
				var compareDate = dateCompareForSchedule($("#downloadDatepicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(),
					todayDate.date, todayDate.hour, todayDate.min, todayDate.amPM);

				var compareEndByDate = dateCompareForSchedule($("#endByDatePicker").val(), $("#endByHour").val(), $("#endByMinutes").val(), $("#endByName").val(),
					todayDate.date, todayDate.hour, todayDate.min, todayDate.amPM);

				if (retval == null || retval == "") {
					if (includeInactiveDevices == true) {
						if ($('#endById').is(':checked') && $('#rdoDateId').is(':checked')) {
							if ($('#rdoDateId').is(':checked') && compareDate == 0 || $('#endById').is(':checked') && compareEndByDate == 0) {
								openAlertpopup(1, 'schedule_not_performed_for_past');
							} else if ($('#endById').is(':checked') && $('#rdoDateId').is(':checked') && returnValue == 1) {
								openAlertpopup(1, 'end_date_cannot_be_less_than_action_date');
								return;
							} else {
								self.openConfirmationPopup();
							}
						} else {
							if ($('#rdoDateId').is(':checked') && compareDate == 0) {
								openAlertpopup(1, 'schedule_not_performed_for_past');
								return;
							} else {
								self.openConfirmationPopup();
							}
						}
						$("#active").show();
						$("#inActive").hide();
						$("#active").text(i18n.t('create_job_IncludeInactive_action', { scheduledownCount: scheduledownCount }, { lng: lang }))
					}
					else {
						if ($('#endById').is(':checked') && $('#rdoDateId').is(':checked')) {
							if ($('#rdoDateId').is(':checked') && compareDate == 0 || $('#endById').is(':checked') && compareEndByDate == 0) {
								openAlertpopup(1, 'schedule_not_performed_for_past');
							} else if ($('#endById').is(':checked') && $('#rdoDateId').is(':checked') && returnValue == 1) {
								openAlertpopup(1, 'end_date_cannot_be_less_than_action_date');
								return;
							} else {
								self.openConfirmationPopup();
							}
						} else {
							if ($('#rdoDateId').is(':checked') && compareDate == 0) {
								openAlertpopup(1, 'schedule_not_performed_for_past');
								return;
							} else {
								self.openConfirmationPopup();
							}
						}
						$("#active").hide();
						$("#inActive").show();
						$("#inActive").text(i18n.t('create_job_exclude_inactive_devices', { lng: lang }));
					}
				}
			}
		}

		//----------get curent datetime-------------
		function displayDateOnEditScheduleAction(dateDetails) {
			if (dateDetails && dateDetails != 'undefined') {
				var localTime = moment(dateDetails).format('YYYY-MM-DD HH:mm:ss');
				var date = moment(localTime).format('MM/DD/YYYY');
				var hour = moment(localTime).format('hh');
				var min = moment(localTime).format('mm');
				var amPM = moment(localTime).format('A');

				var dateEdit = new Object();
				dateEdit.date = date;
				dateEdit.hour = hour;
				dateEdit.min = min;
				dateEdit.amPM = amPM;


			}
			return dateEdit;
		}

		function actionIdsListClick(movedArray) {
			var actionIdsList = new Array();
			for (var i = 0; i < movedArray.length; i++) {
				var actionList = new Object();
				actionList.DeviceActionId = movedArray[i].DeviceActionId;
				actionList.DeviceActionTypeName = movedArray[i].DeviceActionTypeName;
				actionList.DeviceActionTypeDisplayName = movedArray[i].DeviceActionTypeDisplayName;
				actionList.Component = movedArray[i].Component;
                actionList.LogFilePathInDevice = movedArray[i].LogFilePathInDevice;
                actionList.Title = movedArray[i].Title;
                actionList.MessageInfo = movedArray[i].MessageInfo;
				actionIdsList.push(actionList);
			}
			return actionIdsList;
		}

		////////////////////////Recurence object fill////////////////////////////////
		function createReccuranceOptionInfoObject(downloadDateTime) {
			var reccuranceOptionInfo = new Object();
			var intervalStr = ENUM.get('RECCURANCE_NONE');
			if (selectedRecurrenceIntervalStr == '' || selectedRecurrenceIntervalStr == "None") {
				intervalStr = ENUM.get('RECCURANCE_NONE');
			} else if (selectedRecurrenceIntervalStr == "Hourly") {
				intervalStr = ENUM.get('RECCURANCE_HOURLY');
			} else if (selectedRecurrenceIntervalStr == "Daily") {
				intervalStr = ENUM.get('RECCURANCE_DAILY');
			} else if (selectedRecurrenceIntervalStr == "Weekly") {
				intervalStr = ENUM.get('RECCURANCE_WEEKLY');
			} else if (selectedRecurrenceIntervalStr == "Monthly") {
				intervalStr = ENUM.get('RECCURANCE_MONTHLY');
			}
			reccuranceOptionInfo.Interval = intervalStr;
			reccuranceOptionInfo.NoEndDate = false;
			if (selectedRecurrenceIntervalStr != "None" && selectedRecurrenceIntervalStr != undefined) {
				//No end date
				if ($('#inlineRadio2').is(':checked')) {   // No end Date
					reccuranceOptionInfo.NoEndDate = true;
				} else if ($('#endAfter').is(':checked')) { // End After
					reccuranceOptionInfo.NoEndDate = false;
				} else if ($('#endBy').is(':checked')) {
					reccuranceOptionInfo.NoEndDate = false;
				}
			}
			reccuranceOptionInfo.Period = $('#recureEvery').val();
			if ($('#endAfter').is(':checked')) {
				reccuranceOptionInfo.Repeat = $('#endAfterLabel').val();
			} else {
				reccuranceOptionInfo.Repeat = 0;
			}


			dateEndBy = "01/02/1900 00:00:00"
			reccuranceOptionInfo.EndByDate = createJSONTimeStamp(dateEndBy);

			//Date
			if ($('#endById').is(':checked')) {
				var hoursParseInt = $("#endByHour").val();
				var hour = parseInt(hoursParseInt);
				if (hour == 12 && $('#endByName :selected').text() == "AM") {
					hour = 0;
				}
				else if ($('#endByName :selected').text() == "PM") {
					if (hour == 12)
						hour = 12;
					else
						hour = hour + 12;
				}
				var dateEndByString = getlocaldate1($("#endByDatePicker").val(), hour, $("#endByMinutes").val());
				reccuranceOptionInfo.EndByDate = createJSONTimeStamp(dateEndByString);
			}
			return reccuranceOptionInfo;
		}

		self.submitBtnClicked = function (isContinue) {
			var downloadDateTime = moment(new Date()).format(currentDateShort);
			var downloadDateTimeString = "";

			var scheduledReplaceDate;

			var time;
			var hours;
			var minutes;

			var isExpirationDateNone;
			var reccuranceOptionInfoVO;

			/////Download Hour
			var hoursParseInt = $("#downloadHours").val();
			var downloadHour = parseInt(hoursParseInt);
			if (downloadHour == 12 && $('#downloadName :selected').text() == "AM") {
				downloadHour = 0;
			}
			else if ($('#downloadName :selected').text() == "PM") {
				if (downloadHour == 12)
					downloadHour = 12;
				else
					downloadHour = downloadHour + 12;
			}

			////////////////////////////////Recureence related code//////////////////////////////////
			var reccuranceOptionInfo = createReccuranceOptionInfoObject(downloadDateTime);

			/////////////////////////////////////////////////////////
			var actionIdsList = actionIdsListClick(self.movedArray())
			if (currentSelectedActionOption == "SpecifiedDate" && $("#downloadDatepicker").val() != '') {
				downloadDateTime = getUtcDate1($("#downloadDatepicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val());
				downloadDateTimeString = getlocaldate1($("#downloadDatepicker").val(), downloadHour, $("#downloadMinutes").val());
				console.log("SpecifiedDate downloadDateTimeString===" + downloadDateTimeString);
			} else {
				var date = moment().format(SHORT_DATE_FORMAT);
				var hours = moment().format('HH');
				var minutes = moment().format('mm');
				downloadDateTime = getUtcDate1(date, hours, minutes);
				downloadDateTimeString = getlocaldate1(date, hours, minutes);
				console.log("Default downloadDateTimeString===" + downloadDateTimeString);
			}

			var dateApply = "01/31/1900 11:30:00";
			var dateApplyInDevice = "01/31/1900 11:30:00";
			scheduledReplaceDate = "01/31/1900 11:30:00";

			expirationDateInDeviceTimezone = dateApplyInDevice;
			///////////////////////////////////////////////////
			$('#downloadModelconfo').modal('hide');
			$('#jobParamFilesConfirmation').modal('hide');
			var CreateJobReq = new Object();

			var DownloadWindowInfo = new Object();
			var selector = new Object();
			var hour = 0;
			var ScheduleOption;

			if (koUtil.isDeviceProfile() == true) {

				selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
				selector.UnSelectedItemIds = null
			} else {

				var checkAll = checkAllSelected('Devicejqxgrid');

				if (checkAll == 1) {
					selector.SelectedItemIds = null;
					if (globalVariableForunselectedItems.length == 0) {
						selector.UnSelectedItemIds = null;
					} else {
						selector.UnSelectedItemIds = globalVariableForunselectedItems;
					}
				}
				else {
					selector.SelectedItemIds = globalVariableForDownloadSchedule;
					selector.UnSelectedItemIds = null;
				}
			}

			CreateJobReq.ApplyDate = CreatJSONDate(dateApply);
			CreateJobReq.ApplyDateInDevice = createJSONTimeStamp(dateApplyInDevice);

			var ApplyScheduleOption = ENUM.get('SCHEDULE_OPTION_IMMEDIATE');

			CreateJobReq.ApplyScheduleOption = ApplyScheduleOption;
			CreateJobReq.DeviceActionTypes = actionIdsList;
			CreateJobReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
			CreateJobReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
			CreateJobReq.DownloadWindowInfo = null;


			CreateJobReq.IsExpirationDateNone = isExpirationDateNone;

			CreateJobReq.JobCategory = ENUM.get('JOB_CATEGORY_NORMAL');
			CreateJobReq.JobName = $("#jobNameTxt").val().trim();
			CreateJobReq.JobType = ENUM.get('JOB_TYPE_ACTION');
            CreateJobReq.PackageIds = [];
            CreateJobReq.Packages = [];
			CreateJobReq.PackageType = ENUM.get('None');
			CreateJobReq.ParameterMode = ENUM.get('PARAMETER_MODE_NONE');
			CreateJobReq.SoftwareMode = ENUM.get('SOFTWARE_MODE_NONE');
			CreateJobReq.ReccuranceOptionInfo = reccuranceOptionInfo;

			if ($("#rdoMaintainanceWindow").is(':checked')) {
				ScheduleOption = ENUM.get('SCHEDULE_OPTION_ON_NEXTMAINTAINANCE_WINDOW');
			} else if ($("#rdoNextContent").is(':checked')) {
				ScheduleOption = ENUM.get('SCHEDULE_OPTION_IMMEDIATE');
			} else {
				ScheduleOption = ENUM.get('SCHEDULE_OPTION_SPECIFIED_DATE');
			}

			CreateJobReq.ScheduleOption = ScheduleOption;
			console.log("createJSONTimeStamp(downloadDateTimeString)===" + createJSONTimeStamp(downloadDateTimeString));
			CreateJobReq.ScheduledDate = CreatJSONDate(downloadDateTime);
			CreateJobReq.ScheduledDateInDevice = createJSONTimeStamp(downloadDateTimeString);

			CreateJobReq.ScheduledReplaceDate = CreatJSONDate(scheduledReplaceDate);
			CreateJobReq.ExpirationDateInDevice = createJSONTimeStamp(expirationDateInDeviceTimezone);

			CreateJobReq.Selector = selector;

			CreateJobReq.Tag = $("#tagTxt").val();
			CreateJobReq.IsContinue = isContinue;
			CreateJobReq.IsFromLibrary = false;
			CreateJobReq.Component = koUtil.Component;

			function callbackFunction(data, error) {
				if (data) {

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

						failedDeviceCount = data.createJobResp.FailedDevicesCount;
						succeedDeviceCount = data.createJobResp.SucceededDevicesCount;

						koUtil.jobNameValAction = ''
						self.isNewJobCreatedStatus(true);

						$("#submitBtn").prop("disabled", true);
						$("#nextBtn").hide();

						$("#advanceQuickSearchBtn").hide();// Advance search
						$("#advanceQuickSearchSearchCriteria").hide();

						//$("#showHideResetExportbtn").show();
						$("#jobNameTxt").prop("disabled", true);
						$("#tagTxt").prop("disabled", true);
						$("#tabSelectedDevice").removeClass('active');
						$("#tabSelectedDevice").addClass("disabled");
						$("#tabSchedule").addClass("disabled");
						$("#previousBtn").addClass("disabled");
						//$("#tabSchedule").removeClass('active')
						$("#selectedDevicesGrid").hide();
						//$("#schduleGrid").hide();
						//$("#previousBtn").hide();

						//self.movedArray([]);       
						$("#schduleGrid").find("input, button, submit, textarea, select").prop("disabled", true);
						$("#accordionSchedulePanel").addClass("disabled");
						$("#accordionPackagePanel").addClass("disabled");
						var message = i18n.t(('action_job_for_scheduling'), { succeedDeviceCount: succeedDeviceCount, totalDeviceCount: totalDeviceCount }, { lng: lang });
						openAlertpopup(0, i18n.t(message));
						$('#newJobBtn').removeAttr('disabled');
						return;

					} else if (data.responseStatus.StatusCode == AppConstants.get('CREATE_JOB_FAILED')) {
						openAlertpopup(2, data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('JOB_NAME_ALREADY_EXISTS')) {
						openAlertpopup(1, data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('Create_Job_Failed_Zero_Devices_Scheduled')) {
						openAlertpopup(2, data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('NOT_MORE_DEVICES')) {
						openAlertpopup(2, data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Exists')) {
						openAlertpopup(2, 'No_Eligible_Device_Exists_Include_Inactive_Devices');
					} else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Excluding_Inactive_Devices')) {
						openAlertpopup(2, 'No_Eligible_Device_Exists_Exclude_Inactive_Devices');
					} else if (data.responseStatus.StatusCode == AppConstants.get('Create_Job_Failed_Param_Not_Found')) {
						openAlertpopup(2, 'job_creation_failed_param_not_found');
					} else if (data.responseStatus.StatusCode == AppConstants.get('Param_Not_Found')) {
						$("#jobParamFilesConfirmation").modal('show');
					} else if (data.responseStatus.StatusCode == AppConstants.get('Package_Does_Not_Support')) {
						openAlertpopup(2, data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('NONE_OF_THE_SELECTED_DEVICES_HAVE_PACKAGES_ASSIGNED')) {
						openAlertpopup(2, 'none_of_the_selected_devices_have_packages_assigned');
					}
				}
				if (error) {
					retval = "";
				}
			}

			var method = 'CreateJob';
			var params = '{"token":"' + TOKEN() + '","createJobReq":' + JSON.stringify(CreateJobReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		//Allowing to transfer only ;imited no of devices
		getSystemConfigurationForSchedule();
		function getSystemConfigurationForSchedule() {
			var category = AppConstants.get('SYSTEM');
			var configName = AppConstants.get('MAX_SCHEDULE_COUNT_PER_JOB');


			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.systemConfiguration)
							data.systemConfiguration = $.parseJSON(data.systemConfiguration);

						maxActionCount = data.systemConfiguration.ConfigValue;
					}
				}
			}

			var method = 'GetSystemConfiguration';
			var params = '{"token":"' + TOKEN() + '","category":"' + category + '","configName":"' + configName + '"}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		self.clearTablefilter = function (tableid) {
			clearCustomFilterInTable(tableid);
			if (isSelectedPaneFiltered) {
				clearSelectedActionsPane();
				isSelectedPaneFiltered = false;
			}
		}

		self.customfilter = function (element, dataArray) {
			customTableFilter(element, dataArray, callBackOnCustomFilter);
		}

		function callBackOnCustomFilter(isFilterApplied) {
			if (isFilterApplied) {
				isSelectedPaneFiltered = true;
				clearSelectedActionsPane();
			}
			else {
				if (isSelectedPaneFiltered)
					clearSelectedActionsPane();

				isSelectedPaneFiltered = false;
			}
		}

		//Removing checked array and disbleing Up/Down arrows on Filter apply 
		function clearSelectedActionsPane() {
			self.movedArray().forEach(function (element, index) {
				var id = '#selectedpackagecb' + index + '';
				$(id)[0].checked = false;
				element.actionSelected = false;
			});
			selectedRowArrayForSwap = [];
			//selectedDownloadsActionsContent[];
			$("#btnForMoveleft").addClass('disabled');
			$("#btnMoveItemUp").addClass('disabled');
			$("#btnMoveItemDown").addClass('disabled');
		}

		self.SelectAllSelectedActions = function () {
			var selectedpackages = self.movedArray();
			if ($('#selectallselectedactions')[0].checked == true) {
				if (selectedpackages.length > 0) {
					$("#btnForMoveleft").removeClass('disabled');
					$("#btnForMoveleft").prop('disabled', false);
					for (var i = 0; i < selectedpackages.length; i++) {
						selectedpackages[i].actionSelected = true;
						selectedRowArrayForSwap.push(selectedpackages[i]);
					}
				}
			} else {
				$("#btnForMoveleft").addClass('disabled');
				selectedRowArrayForSwap = [];
				for (var i = 0; i < selectedpackages.length; i++) {
					selectedpackages[i].actionSelected = false;
				}
			}

			$("#btnMoveItemUp").addClass('disabled');
			$("#btnMoveItemDown").addClass('disabled');
			self.movedArray([]);
			self.movedArray(selectedpackages);
		}

		self.rightPackages = function () {
			var selectedData = getMultiSelectedData('jqxgridAvailableActions');
			var selectedItemIds = getSelectedUniqueId('jqxgridAvailableActions');
			var unselectedItemIds = getUnSelectedUniqueId('jqxgridAvailableActions');
            var checkAll = checkAllSelected('jqxgridAvailableActions');
            var dataArrayForActions = self.movedArray();
            if (dataArrayForActions.length > 0) {
                var movedData = _.where(dataArrayForActions, { DeviceActionTypeName: "Message" });
                var swappingData = _.where(selectedData, { DeviceActionTypeName: "Message" });
                if (selectedData && selectedData.length==1 && movedData && movedData.length > 0 && swappingData.length > 0) {
                    openAlertpopup(1, 'info_multiple_message_diagnostic_action');
                    return;
                }        
                if (movedData && movedData.length > 0) {
                    openAlertpopup(1, 'info_message_diagnostic_action_cannot_select_with_otherdiagnostics');
                    return;
                }
            } 
			if (checkAll == 1 && unselectedItemIds.length == 0) {
				$("#rbtAll").prop('checked', true);
				$("#txtUserLogs").val('');
				$("#txtUserLogs").prop('disabled', true);
                $("#filePathErrorTip").hide();                              
				$("#UserLogsDiv").modal('show');
				return;
			} else {
				gridSelectedArrayForSwap = new Array();
				if (selectedItemIds.length > 0) {
					for (k = 0; k < selectedItemIds.length; k++) {
						var selectedsource = _.where(selectedData, { DeviceActionId: selectedItemIds[k] });
                        if (selectedsource && selectedsource.length > 0 && selectedsource[0].DeviceActionTypeName == "GetUserLogs") {
                            $("#rbtAll").prop('checked', true);
                            $("#txtUserLogs").val('');
                            $("#txtUserLogs").prop('disabled', true);
                            $("#filePathErrorTip").hide();
                            $("#UserLogsDiv").modal('show');
                            return;
                        } else if (selectedsource && selectedsource.length > 0 && selectedsource[0].DeviceActionTypeName == "Message") {     
                            
                            if (dataArrayForActions && dataArrayForActions.length == 0) {
                                $("#sendMessageTitle").val('');
                                $("#sendMessageDescription").val('');
                                $("#titleErrorMessage").hide();
                                $("#descriptionErrorMessage").hide();
                                $("#sendMessageContainer").modal('show');
                                return;
                            } else {
                                openAlertpopup(1, 'info_message_diagnostic_action_cannot_select_with_otherdiagnostics');
                                return;
                            }
                           
                        }
						if (!isShowPopup && selectedsource && selectedsource.length > 0) {
							selectedsource[0].LogFilePathInDevice = '';
							gridSelectedArrayForSwap.push(selectedsource[0]);							
						}
					}
				}
			}
			pushSelectedActions();
		}

		function pushSelectedActions() {
			StateSchedule = $("#jqxgridAvailableActions").jqxGrid('savestate');
			if (gridSelectedArrayForSwap.length > 0) {
				totalpackageassignment = gridSelectedArrayForSwap.length + self.movedArray().length;
				if (totalpackageassignment > maxActionCount) {
					openAlertpopup(1, i18n.t('maximum_of_3_actions_can_be_selected_for_schedule', { maxActionCount: maxActionCount }, { lng: lang }));
					return;
				} else {					
					for (i = 0; i < gridSelectedArrayForSwap.length; i++) {
						//------------User is not allowed to select more than 3 content files per job----------
						var newPackageObj = new Object();
						newPackageObj.indexId = self.movedArray().length;
						if (gridSelectedArrayForSwap[i] != null) {
							newPackageObj.DeviceActionId = gridSelectedArrayForSwap[i].DeviceActionId;
                            newPackageObj.DeviceActionTypeName = gridSelectedArrayForSwap[i].DeviceActionTypeName;                          
							newPackageObj.DeviceActionTypeDisplayName = gridSelectedArrayForSwap[i].DeviceActionTypeDisplayName;
							newPackageObj.Component = gridSelectedArrayForSwap[i].Component;
                            newPackageObj.LogFilePathInDevice = gridSelectedArrayForSwap[i].LogFilePathInDevice;
                            newPackageObj.Title = gridSelectedArrayForSwap[i].Title;
                            newPackageObj.MessageInfo = gridSelectedArrayForSwap[i].MessageInfo;                            
                            newPackageObj.actionSelected = false;
                            if (newPackageObj.DeviceActionTypeName == "Message" && gridSelectedArrayForSwap.length > 1) {
                                openAlertpopup(1, 'info_message_diagnostic_action_selectall_diagnosticactions');
                            } else {
                                self.movedArray.push(newPackageObj);
                                selectedDownloadsActionsContent.push(newPackageObj);
                            }
						
						}
					}
				}
				if (isSelectedPaneFiltered) {
					clearCustomFilterInTable("selectactionstable");
					clearSelectedActionsPane();
					isSelectedPaneFiltered = false;
				}
				else {
					//To Enable/Disble the Up/Down Arrows----                    
					if (selectedRowArrayForSwap.length <= 0 || selectedRowArrayForSwap.length == self.movedArray().length) {
						$("#btnMoveItemUp").addClass('disabled');
						$("#btnMoveItemDown").addClass('disabled');
					} else {
						var lastIndex = self.movedArray().length - 1;
						$("#btnMoveItemDown").removeClass('disabled');
						enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#btnMoveItemUp", "#btnMoveItemDown");
					}
				}
				selectedPackagesComponent(self.movedArray());
			} else {
				openAlertpopup(1, 'no_row_selected');
			}
			self.SubmitButtonEnableDisable();

			$('.refselection').each(function () {
				var idOfSelectionTable = this.id;
				var selectionIndex = parseFloat(idOfSelectionTable.substring(13, idOfSelectionTable.length));
				upAndDown(selectionIndex);

			});
			var b = $("#downloadMinutes").val();
		}

		self.SelectSelectedActionRow = function (data, index) {
			$("#tbodySelectedpack").children('tr').removeClass('refselection');
			$("#btnForMoveleft").removeClass('disabled');
			var id = '#selectedpackagecb' + index + '';
			if ($(id)[0].checked == true) {
				data.SelectedArrayIndex = index;
				selectedRowArrayForSwap.push(data);
			} else {
				for (var i = 0; i < selectedRowArrayForSwap.length; i++) {
					if (data.DeviceActionId == selectedRowArrayForSwap[i].DeviceActionId) {
						selectedRowArrayForSwap.splice(i, 1);
					}
				}
				if (selectedRowArrayForSwap.length == 0) {
					$("#btnForMoveleft").addClass('disabled');
				}
				//#Updating changed index into array "selectedRowArrayForSwap"
				var arrAfterMov = self.movedArray();
				selectedRowArrayForSwap.forEach(function (element) {
					element.SelectedArrayIndex = getArrayIndexForKey(arrAfterMov, 'indexId', element.indexId);
				});
			}

			rowIdForHighlightedForTable = index;

			if (isSelectedPaneFiltered || selectedRowArrayForSwap.length == 0 || selectedRowArrayForSwap.length == self.movedArray().length) {
				$("#btnMoveItemDown").addClass('disabled');
				$("#btnMoveItemUp").addClass('disabled');
				return;
			}

			//#Function call:----To Enable/Disble the Up/Down Arrows----
			var lastIndex = self.movedArray().length - 1;
			enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#btnMoveItemUp", "#btnMoveItemDown");
		}

		self.leftPackages = function () {
			self.allselectedactionsSelected(false);
			if (selectedRowArrayForSwap.length > 0) {
				for (var i = 0; i < selectedRowArrayForSwap.length; i++) {
					self.movedArray.remove(selectedRowArrayForSwap[i]);
				}

				selectedRowArrayForSwap = [];
				gridSelectedArrayForSwap = [];
				selectedDownloadsActionsContent = [];

				//tableSelectedRow();
				$("#btnForMoveleft").addClass('disabled');
				$("#btnMoveItemUp").addClass('disabled');
				$("#btnMoveItemDown").addClass('disabled');
				if (self.movedArray().length > 0) {
					for (var j = 0; j < self.movedArray().length; j++) {
						var selectedItem = new Object();
						selectedItem.indexId = selectedDownloadsActionsContent.length;
						selectedItem.DeviceActionId = self.movedArray()[j].DeviceActionId;
						selectedItem.DeviceActionTypeName = self.movedArray()[j].DeviceActionTypeName;
						selectedItem.DeviceActionTypeDisplayName = self.movedArray()[j].DeviceActionTypeDisplayName;
						selectedItem.Component = self.movedArray()[j].Component;
						selectedItem.LogFilePathInDevice = self.movedArray()[j].LogFilePathInDevice;
						selectedItem.actionSelected = true;
						selectedDownloadsActionsContent.push(selectedItem);
					}
				}

				selectedPackagesComponent(self.movedArray());
				setEnabledStatusDownload();
				if (isSelectedPaneFiltered) {
					clearCustomFilterInTable("selectactionstable");
					clearSelectedActionsPane();
					isSelectedPaneFiltered = false;
				}
			} else {
				openAlertpopup(1, 'no_row_selected');
			}
			self.SubmitButtonEnableDisable();
		}

		function selectedPackagesComponent(movedArray) {
			var isPOS = false;
			var isTablet = false;

			for (var i = 0; i < movedArray.length; i++) {
				var component = movedArray[i].Component;
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

			setEnabledStatusDownload();
		}

		function upAndDown(index) {
			var arr = self.movedArray();
			var selid = arr.length;
			selid = selid - 1;

			if (index == 0) {
				if (selid == 0) {
					$("#btnMoveItemDown").addClass('disabled');
					$("#btnMoveItemUp").addClass('disabled');
				} else {
					$("#btnMoveItemDown").removeClass('disabled');
					$("#btnMoveItemUp").addClass('disabled');
				}
			} else if (index == selid) {
				$("#btnMoveItemDown").addClass('disabled');
				$("#btnMoveItemUp").removeClass('disabled');

			} else {
				$("#btnMoveItemDown").removeClass('disabled');
				$("#btnMoveItemUp").removeClass('disabled');
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
						//$("#btnForMoveleft").addClass('disabled');
						if (self.movedArray().length > 0 && rowIdForHighlightedForTable > 0) {
							rowIdForHighlightedForTable = rowIdForHighlightedForTable - 1;
							var id = '#SelectPackrow' + rowIdForHighlightedForTable + '';
							$(id).addClass('refselection');
							selectedRowArrayForSwap.push(arrayTableSelection[rowIdForHighlightedForTable]);
							$("#btnMoveItemDown").addClass('disabled');
							$("#btnMoveItemUp").removeClass('disabled');
						}
						if (self.movedArray().length == 0) {
							$("#btnForMoveleft").addClass('disabled');
						}
					}
				} else {
					var id = '#SelectPackrow' + rowIdForHighlightedForTable + '';
					$(id).addClass('refselection');
					selectedRowArrayForSwap.push(arrayTableSelection[rowIdForHighlightedForTable]);
					if (rowIdForHighlightedForTable == 0) {
						$("#btnMoveItemDown").removeClass('disabled');
						$("#btnMoveItemUp").addClass('disabled');

					} else if (rowIdForHighlightedForTable > 0 && rowIdForHighlightedForTable < self.movedArray().length) {
						$("#btnMoveItemDown").removeClass('disabled');
						$("#btnMoveItemUp").removeClass('disabled');
					}
				}
			}

			if (rowIndexForHighlighted != undefined) {
				if (rowIndexForHighlighted >= 0) {
					$('#jqxgridAvailableActions').jqxGrid('selectrow', rowIndexForHighlighted);
				}
			}


		}

		$("#jqxgridAvailableActions").on("filter", function (event) {
			$('#jqxgridAvailableActions').jqxGrid('clearselection');
			gridSelectedArrayForSwap = [];
		});

		$("#jqxgridAvailableActions").on("sort", function (event) {
			$('#jqxgridAvailableActions').jqxGrid('clearselection');
			gridSelectedArrayForSwap = [];
		});



		self.moveItemsUP = function () {
			if (selectedRowArrayForSwap.length > 0) {
				var arr = self.movedArray();

				//#Sorting the selected array for swap, based on moved array index
				var sortedselectedRowArrayForSwap = _.sortBy(selectedRowArrayForSwap, 'SelectedArrayIndex');

				for (var i = 0; i < sortedselectedRowArrayForSwap.length; i++) {
					var index = getArrayIndexForKey(arr, 'indexId', sortedselectedRowArrayForSwap[i].indexId);
					arr.moveUp(arr[index]);
					self.movedArray(arr);
					selectedDownloadsActionsContent.moveUp(selectedDownloadsActionsContent[index]);
				}

				//#Updating changed index into array "selectedRowArrayForSwap"
				var arrAfterMov = self.movedArray();
				selectedRowArrayForSwap.forEach(function (element) {
					element.SelectedArrayIndex = getArrayIndexForKey(arrAfterMov, 'indexId', element.indexId);
				});

				//#Function call:----To Enable/Disble the Up/Down Arrows----
				var lastIndex = self.movedArray().length - 1;
				enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#btnMoveItemUp", "#btnMoveItemDown");
			}
			else {
				openAlertpopup(1, 'please_selct_row');
			}
		}

		self.moveItemsDown = function () {
			if (selectedRowArrayForSwap.length > 0) {
				var arr = self.movedArray();

				//#Sorting the selected array for swap, based on moved array index
				var sortedselectedRowArrayForSwap = _.sortBy(selectedRowArrayForSwap, 'SelectedArrayIndex');

				for (var i = sortedselectedRowArrayForSwap.length - 1; i >= 0; i--) {
					var index = getArrayIndexForKey(arr, 'indexId', sortedselectedRowArrayForSwap[i].indexId);
					arr.moveDown(arr[index]);
					self.movedArray(arr);
					selectedDownloadsActionsContent.moveDown(selectedDownloadsActionsContent[index]);
				}

				//#Updating changed index into array "selectedRowArrayForSwap"
				var arrAfterMov = self.movedArray();
				selectedRowArrayForSwap.forEach(function (element) {
					element.SelectedArrayIndex = getArrayIndexForKey(arrAfterMov, 'indexId', element.indexId);
				});

				//#Function call:----To Enable/Disble the Up/Down Arrows----
				var lastIndex = self.movedArray().length - 1;
				enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#btnMoveItemUp", "#btnMoveItemDown");
			}
			else {
				openAlertpopup(1, 'please_selct_row');
			}
		}

		self.SubmitButtonEnableDisable = function () {
			if (self.movedArray().length == 0) {
				$("#submitBtn").prop("disabled", true);
			} else {
				$("#submitBtn").prop("disabled", false);
				//$("#btnForMoveleft").removeClass('disabled');
			}
		}
		seti18nResourceData(document, resourceStorage);


		///--START----Re-storing previous selected schedule value
		if (!_.isEmpty(scheduleValuesGlobalObject) && !_.isEmpty(scheduleValuesGlobalObject.scheduleAction)) {

			if (scheduleValuesGlobalObject.scheduleAction.tagText)
				$("#tagTxt").val(scheduleValuesGlobalObject.scheduleAction.tagText);

			if (!_.isEmpty(scheduleValuesGlobalObject.scheduleAction.beginActionsAt)) {
				var beginActionsAtValues = scheduleValuesGlobalObject.scheduleAction.beginActionsAt;
				if (beginActionsAtValues.rdoMaintainanceWindow) {
					//$("#rdoMaintainanceWindow").prop("checked", true);
					self.chkDownloadOn($("#rdoMaintainanceWindow").val());
					self.rbDownloadNextMaintenanceClick()
				}
				else if (beginActionsAtValues.rdoNextContent) {
					self.chkDownloadOn($("#rdoNextContent").val());
					self.rbDownloadNextContactclick();
				}
				else if (beginActionsAtValues.rdoDateId) {
					self.chkDownloadOn($("#rdoDateId").val());
					self.rbDownloadDateTimeclick();
					$('#downloadDatepicker').prop('value', beginActionsAtValues.downloadDatePicker);
					$("#downloadHours").val(beginActionsAtValues.downloadHours);
					$("#downloadMinutes").val(beginActionsAtValues.downloadMinutes);
					$("#downloadName").val(beginActionsAtValues.downloadName);
				}
			}

			if (!_.isEmpty(scheduleValuesGlobalObject.scheduleAction.actionsRecurrence)) {
				var actionsRecurrenceValues = scheduleValuesGlobalObject.scheduleAction.actionsRecurrence;

				if (actionsRecurrenceValues.noneId) {
					self.chkRecureence($("#noneId").val());
					self.rbReccuranceIntervalclick('None');
				}
				else {
					if (actionsRecurrenceValues.hourlyId) {
						self.chkRecureence($("#hourlyId").val());
						self.rbReccuranceIntervalclick('Hourly');
					}
					else if (actionsRecurrenceValues.dailyId) {
						self.chkRecureence($("#dailyId").val());
						self.rbReccuranceIntervalclick('Daily');
					}
					else if (actionsRecurrenceValues.weeklyId) {
						self.chkRecureence($("#weeklyId").val());
						self.rbReccuranceIntervalclick('Weekly');
					}
					else if (actionsRecurrenceValues.monthlyId) {
						self.chkRecureence($("#monthlyId").val());
						self.rbReccuranceIntervalclick('Monthly');
					}

					$("#recureEvery").val(actionsRecurrenceValues.recureEvery);

					if (actionsRecurrenceValues.inlineRadio2) {
						self.chkInterval($("#inlineRadio2").val()); //No End Date
						self.reccureenceClick('No end date');
					}
					else if (actionsRecurrenceValues.endAfter) {
						self.chkInterval($("#endAfter").val());
						self.reccureenceClick('End after');
						$("#endAfterLabel").val(actionsRecurrenceValues.endAfterLabel);
					}
					else if (actionsRecurrenceValues.endById) {
						self.chkInterval($("#endById").val());
						self.reccureenceClick('End by');
						$('#endByDatePicker').prop('value', actionsRecurrenceValues.endByDatePicker);
						$("#endByHour").val(actionsRecurrenceValues.endByHour);
						$("#endByMinutes").val(actionsRecurrenceValues.endByMinutes);
						$("#endByName").val(actionsRecurrenceValues.endByName);
					}
				}
			}
		}
		///--END----Re-storing previous selected schedule value
	};

	//////////////////////////////Second tab GetDiagnosticsActionByModel////////////////////////////////////////////
	//date separation for text box
	function formatAMPM(date) {
		var dayNumber = date.getDay();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? '0' + minutes : minutes;
		var dtObj = new Object();
		dtObj.dayNumber = dayNumber;
		dtObj.hours = hours;
		dtObj.minutes = minutes;
		dtObj.ampm = ampm;

		return dtObj;
	}

	function fetchDiagnosticsActionsbyModelList(actionData, movedArray) {

		// prepare the data
		var getDiagnosticsActionsbyModelReq = new Object();

		var Selector = new Object();
		var Export = new Object();

		//if Advance search is applied in schedule screen then resetting selected packages
		if (isSearchAppliedForSchedule)
			selectedDownloadsActionsContent = [];

		if (koUtil.isDeviceProfile() == true) {
			Selector.SelectedItemIds = koUtil.deviceProfileUniqueDeviceId == null ? null : [koUtil.deviceProfileUniqueDeviceId];
			Selector.UnSelectedItemIds = null;
		} else {
			var checkAll = checkAllSelected('Devicejqxgrid');

			if (checkAll == 1) {
				Selector.SelectedItemIds = null;
				if (globalVariableForunselectedItems.length == 0) {
					Selector.UnSelectedItemIds = null;
				} else {
					Selector.UnSelectedItemIds = globalVariableForunselectedItems;
				}
			}
			else {
				Selector.SelectedItemIds = globalVariableForDownloadSchedule;
				Selector.UnSelectedItemIds = null;
			}
		}
		Export.IsExport = false;
		getDiagnosticsActionsbyModelReq.Export = Export;
		getDiagnosticsActionsbyModelReq.Selector = Selector;
		getDiagnosticsActionsbyModelReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
		

        var gridStorageDeviceSearch = JSON.parse(sessionStorage.getItem("Devicejqxgrid" + "gridStorage"));
        if (gridStorageDeviceSearch && gridStorageDeviceSearch.length > 0 && gridStorageDeviceSearch[0].columnSortFilter) {
            columnSortFilter = gridStorageDeviceSearch[0].columnSortFilter;
        }
        else {
            columnSortFilter = new Object();
        }
        getDiagnosticsActionsbyModelReq.ColumnSortFilter = columnSortFilter;
        


		var param = new Object();
		param.token = TOKEN();
		param.getDiagnosticsActionsbyModelReq = getDiagnosticsActionsbyModelReq;



		var callBackfunction = function (data, error) {
			if (data) {
				if (data.getDiagnosticsActionsbyModelResp) {
					data.getDiagnosticsActionsbyModelResp = $.parseJSON(data.getDiagnosticsActionsbyModelResp);
					if (data.getDiagnosticsActionsbyModelResp.DeviceActionTypes) {
						for (var k = 0; k < data.getDiagnosticsActionsbyModelResp.DeviceActionTypes.length; k++) {
							data.getDiagnosticsActionsbyModelResp.DeviceActionTypes[k].actionSelected = false;
						}
					}
					for (i = 0; i < selectedDownloadsActionsContent.length; i++) {
						var selectedActions = new Object();
						if (selectedDownloadsActionsContent[i] != null) {
							selectedActions.indexId = movedArray().length;
							selectedActions.DeviceActionId = selectedDownloadsActionsContent[i].DeviceActionId;
							selectedActions.DeviceActionTypeName = selectedDownloadsActionsContent[i].DeviceActionTypeName;
							selectedActions.DeviceActionTypeDisplayName = selectedDownloadsActionsContent[i].DeviceActionTypeDisplayName;
							selectedActions.Component = selectedDownloadsActionsContent[i].Component;
							selectedActions.LogFilePathInDevice = selectedDownloadsActionsContent[i].LogFilePathInDevice;
							selectedActions.MessageInfo = selectedDownloadsActionsContent[i].MessageInfo;
							selectedActions.Title = selectedDownloadsActionsContent[i].Title;
							selectedActions.actionSelected = false;
							movedArray.push(selectedActions);
						}
					}
					actionData(data.getDiagnosticsActionsbyModelResp.DeviceActionTypes);
					actionAvailableGrid(actionData(), 'jqxgridAvailableActions');
					if (data.getDiagnosticsActionsbyModelResp.DeviceActionTypes == null) {
						koUtil.isFromScheduleActionScreen = 1;
						isMiddleMenuClicked = false;
						openAlertpopup(1, 'no_action_qualify_for_the_selected_device_models');
					} else {
						koUtil.isFromScheduleActionScreen = 0;
					}

					if (movedArray().length == 0) {
						$("#submitBtn").prop("disabled", true);
					} else {
						$("#submitBtn").prop("disabled", false);
					}
				}
			} else if (error) {
				actionData([]);
			}
		}

		var method = 'GetDiagnosticsActionsbyModel';
		var params = '{"token":"' + TOKEN() + '","getDiagnosticsActionsbyModelReq":' + JSON.stringify(getDiagnosticsActionsbyModelReq) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

	}

	function defaultSelection() {
		$("#idIsRecureTextVisible").css("display", 'block');
		$("#idIsDateVisible").css("display", 'none');
		$("#noneId").prop('checked', true);
	}

	function actionAvailableGrid(actionData, gID) {
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

				dataType: "json",
				localdata: actionData,
				root: 'DeviceActionTypes',
				contentType: 'application/json',

				dataFields: [
					{ name: 'DeviceActionTypeName', map: 'DeviceActionTypeName' },
					{ name: 'DeviceActionId', map: 'DeviceActionId' },
					{ name: 'DeviceActionTypeDisplayName', map: 'DeviceActionTypeDisplayName' },
					{ name: 'Component', map: 'Component' },
					{ name: 'isSelected', type: 'number' },
				],

			};



		//for filter UI
		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		}
		var rendered = function (element) {
			enableUiGridFunctions(gID, 'DeviceActionId', element, gridStorage, true);
			return true;
		}
		var cellbeginedit = function (row, datafield, columntype, value) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
            var selectedItemIds = getSelectedUniqueId('jqxgridAvailableActions');
            if (value == false  && rowData.DeviceActionTypeName == "GetUserLogs") {
				isShowPopup = true;
			} else if (value == true && rowData.DeviceActionTypeName == "GetUserLogs") {
				isShowPopup = false;
            }
            if (value == false && rowData.DeviceActionTypeName == "Message") {                
                if (selectedItemIds != undefined && selectedItemIds.length == 0) {
                    isShowNotifyPopup = true;
                } else {
                    isShowNotifyPopup = false;
                    openAlertpopup(1, 'info_message_diagnostic_action_cannot_select_with_otherdiagnostics');
                    return false;
                }
            } else if (value == true && rowData.DeviceActionTypeName == "Message") {
                isShowNotifyPopup = false;                
            }       
            if (isShowNotifyPopup == true && rowData.DeviceActionTypeName != "Message") {
                openAlertpopup(1, 'info_message_diagnostic_action_cannot_select_with_otherdiagnostics');
                return false;
            }
		}
		var dataAdapter = new $.jqx.dataAdapter(source);

		$("#jqxgridAvailableActions").jqxGrid(
			{
				width: "100%",
				height: "466px",
				source: dataAdapter,
				altrows: true,
				sortable: true,
				filterable: true,
				autoshowcolumnsmenubutton: false,
				pageSize: 1000,
				showsortmenuitems: false,
				columnsResize: true,
				rowsheight: 32,
				enabletooltips: true,
				editable: true,
				autoshowloadelement: false,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowfiltericon: true,
				ready: function () {
					var columns = genericHideShowColumn(gID, true, []);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsList = koUtil.gridColumnList;
					//defaultSelection();
				},

				columns: [
					{
						text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit,
						datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
							return '<div style="margin-left:0px;margin-top:0px"><div style="margin-top: 5px;"></div></div>';
						}, rendered: rendered
					},
					{
						text: '', datafield: 'DeviceActionTypeName', hidden: true, editable: false, minwidth: 0, filterable: false, sortable: false, menu: false,

					},
					{
						text: '', datafield: 'DeviceActionId', hidden: true, editable: false, minwidth: 0,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}

					},
					{
						text: i18n.t('action_name', { lng: lang }), datafield: 'DeviceActionTypeDisplayName', editable: false, minwidth: 100,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
				]
			});
		getUiGridBiginEdit('jqxgridAvailableActions', 'DeviceActionId', gridStorage);
	}
});
