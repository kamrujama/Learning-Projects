var State12 = null;
var referenceSetName = "";
var supportedPackages = "";
var referenceSetStatus = "";
var referenceSetId = 0;
var selectedReferenceSetId = 0;
var selectedRFSponsorName = "";

define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "bootstrap", "bootstrapDatePicker", "moment", "spinner", "utility"], function (ko, koUtil, ADSearchUtil) {
	var maxScheduleDownloadCount;
	SelectedIdOnGlobale = new Array();
	columnSortFilterForReferenceSets = new Object();
	currentSelectedDownloadScheduleOption = "";
	currentSelectedApplyScheduleOption = "";
	currentSelectedDateOption = "";
	currentSelectedDownloadPeriod = "";
	createJobId = "";

	var rowIndexForHighlighted;
	var isRightPackagesClick;
	var rowIdForHighlightedForTable;

	var lang = getSysLang();
	columnSortFilter = {};
	/// Used to read the value from the database. By calling dataservice API from customer configuration.
	var slotTimezoneOffsetDiff = 0;
	var isSlotIncludeFailure = false;

	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

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

	return function downloadLibararyAppViewModel() {

		var self = this;
		var isSelectedPaneFiltered = false; //To check filter applied on Selected Packages Pane 
		var selectedRowArrayForSwap = new Array();
		var gridSelectedDataForSwap = new Array();
		var isGetReferenceSetsForDevices = false;
		selectedReferenceSetId = 0;

		//--change collpase and expand icon------
		function toggleChevron(e) {
			$(e.target)
				.prev('.panel-heading')
				.find("i.indicator")
				.toggleClass('icon-angle-down icon-angle-up');
		}
		$('#accordion1, #accordion2').on('hidden.bs.collapse', toggleChevron);
		$('#accordion1, #accordion2').on('shown.bs.collapse', toggleChevron);

		self.selectedPackageData = ko.observableArray();
		self.packageData = ko.observableArray();
		self.movedArray = ko.observableArray();
		var packageDataClone = new Array();

		self.templateFlag = ko.observable(false);
		self.packageAlredyAssignedChkbox = ko.observable(false);
		self.isPackageAlreadyNotAssigned = ko.observable(true);
		self.isDownloadOnNextAvailableChecked = ko.observable(true);
		self.isNewJobCreatedStatus = ko.observable(false);
		self.isSelctedDevicesChanged = ko.observable(false);
		self.rbgApplyOnCheckbox = ko.observable();
		self.rbgDownloadOnCheckbox = ko.observable(true);
		self.isEnableNextAvailableSlot = ko.observable(false);
		self.rbDownloadPeriod = ko.observable();
		self.slotScheduleLagAdded = ko.observable();
		self.nextDaysValue = ko.observable('1');
		self.rbFromTimeAM = ko.observable();
		self.assignmentType = ko.observable('Packages');

		//Parameter options
		self.parameterChecked = ko.observable(false);
		self.allParameterChecked = ko.observable(false);
		self.allDownloadsChecked = ko.observable(false);
		self.parameterVisible = ko.observable(false);
		self.softwareAndParametersVisible = ko.observable(false);
		self.allSoftwareAndParametersChecked = ko.observable(false);
		self.allParameterVisible = ko.observable(false);
		self.chkFrom = ko.observable(true);
		self.chkNowAndDate = ko.observable();
		self.chkTo = ko.observable(false);

		//Download Period click
		self.dateEnableOfApply = ko.observable(false);
		self.checkedAmPmApply = ko.observable(true);
		self.fromDateEnable = ko.observable(false);
		self.amPmChk = ko.observable(true);

		self.slotAllowFailedDevicesVisible = ko.observable(false);

		//isFilterData = false;
		self.submitBtnEnable = ko.observable(false);
		self.jobName = ko.observable();
		self.isSelectPackageGridEnable = ko.observable(true);

		//Precentage of selected Devices over TotalNoOfDevices
		self.selectedDevicesPercentage = ko.observable(0);

		///Download on Enable/Visible
		self.dateVisibleOfDownload = ko.observable(false);
		self.isDownloadAMPM = ko.observable()

		///spinner
		$('[data-trigger="spinner"]').spinner();
		///
		self.rbgDownloadOnCheckbox('Maintenance window');
		currentSelectedDownloadScheduleOption = "OnNextMaintenanceWindow";
		self.rbgApplyOnCheckbox('Immediately after download');
		currentSelectedApplyScheduleOption = "Immediate";
		self.dateVisibleOfDownload(false);
		self.allselectedpackagesSelected = ko.observable(false);
		self.allavailablepackagesSelected = ko.observable(false);
		self.dateNextNumericValued = ko.observable(false);
		self.datePeriodToDatePicker = ko.observable(false);
		self.ddlFormatData = ko.observableArray([{ "dataValue": "AM", "dataTtext": "AM" }, { "dataValue": "PM", "dataTtext": "PM" }]);

		self.slotScheduleLagAdded = i18n.t(('slot_schedulelag_added'), { ScheduleLag: SlotSchedulerScheduleLag }, { lng: lang });
		$("#downloadPeriodSection").css("opacity", 0.4);
		$("#force_installation").prop("checked", false);

		$("#nextNumericValued").on('keyup mouseup', function () {
			if (parseInt($(this).val()) == 0) {
				$(this).val('1');
			} else if (parseInt($(this).val()) > 365) {
				$(this).val('365');
			}
			var nextyearval = parseInt($(this).val());
			var modifiedValue = moment(currentDate).add('days', nextyearval).format(SHORT_DATE_FORMAT);
			$("#applyDatePicker").val(modifiedValue);
		});

		self.jobName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_enter_job_name', {
					lng: lang
				})
			}
		});

		var currentDateShort = '';
		var currentDateLong = '';
		var currentDate = '';
		var currentDateShortwithLag = '';
		var currentDateLongwithLag = '';
		var currentDatewithLag = '';

		init();
		function init() {
			setScreenControls(AppConstants.get('SCHEDULE_DOWNLOAD'));
			onlytimeUpdateAllField();
			getScheduleLagValue();
			getConfigurationValues();
			getTimeZoneOffsetDifferenceConfig();
			hideDetailsOfNextAvilablabledTime();
			if (isMiddleMenuClicked) {
				clearCustomFilterInTable("avilablepackagestable");
				clearCustomFilterInTable("selectpackagestable");
				packagesGridModel('jqxgridAvailablePackage', self.packageData, self.movedArray);
			}
			setControlsOnLoad();
			setDateValues();

			$("#jobNameTxt").val(koUtil.jobNameVal);
			if ($("#tabSchedule").hasClass('active')) {
				if (checkflagForNewJob == 0) {
					fetchGenerateJobName(self.jobName, self.isNewJobCreatedStatus);
				}
			}
			if (isFromDeviceSearch) {
				columnSortFilter = koUtil.GlobalColumnFilter;
			}
		}

		function getScheduleLagValue() {
			var category = "Scheduler";
			var configName = "Average HeartBeat Frequency";
			function callbackFunction(data, error) {
				if (data) {

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.systemConfiguration)
							data.systemConfiguration = $.parseJSON(data.systemConfiguration);

						if (parseInt(data.systemConfiguration.ConfigValue) > 0) {
							SlotSchedulerScheduleLag = parseInt(data.systemConfiguration.ConfigValue) * 2;
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

		function getConfigurationValues() {
			var category = "System";
			var configName = "Include Inactive Devices for Scheduling";
			function callbackFunction(data, error) {
				if (data) {

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.systemConfiguration)
							data.systemConfiguration = $.parseJSON(data.systemConfiguration);

						if (data.systemConfiguration.ConfigValue == 0) {
							includeInactiveDevicesForDownload = false;
						} else {
							includeInactiveDevicesForDownload = true;
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

		//Getting TimeZoneOffsetDifference Config Value from customer - systemconfiguration
		//  TODO : need to check why this method is called for morenumber of times getTimeZoneOffsetDifferenceConfig();
		function getTimeZoneOffsetDifferenceConfig() {
			var category = "SlotScheduler";
			var configName = AppConstants.get('SLOT_TIMEZONE_OFFSET_DIFF');
			function callbackFunction(data) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.systemConfiguration) {
							data.systemConfiguration = $.parseJSON(data.systemConfiguration);
							slotTimezoneOffsetDiff = data.systemConfiguration.ConfigValue;
						}
					}
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
						checkflagForNewJob = 1;
						jobName(data.jobName);
						koUtil.jobNameVal = data.jobName;
						$("#jobNameTxt").val(koUtil.jobNameVal);
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

		function setControlsOnLoad() {
			//-------------------------------------------------------------FOCUS ON CONFO POP UP-----------------------------------------------
			$('#downloadScheduleModel').on('shown.bs.modal', function (e) {
				$('#downloadScheduleModel_No').focus();

			});
			$('#downloadScheduleModel').keydown(function (e) {
				if ($('#downloadScheduleModel_No').is(":focus") && (e.which || e.keyCode) == 9) {
					e.preventDefault();
					$('#downloadScheduleModel_yes').focus();
				}
			});

			$("#submitBtn").prop("disabled", true);
			$("#accordionReferenceSets").hide();
			$("#accordion1").show();
			$("#btnForMoveleft").addClass('disabled');
			$("#btnForMoveRight").addClass('disabled');
			$("#btnMoveItemUp").addClass('disabled');
			$("#btnMoveItemDown").addClass('disabled');
		}

		function setDateValues() {
			currentDateShort = moment().format(SHORT_DATE_FORMAT);
			currentDateLong = moment().format(LONG_DATETIME_FORMAT);
			currentDate = moment().format(SHORT_DATE_FORMAT);
			currentDateShortwithLag = moment().add(SlotSchedulerScheduleLag, 'minutes').format(SHORT_DATE_FORMAT);
			currentDateLongwithLag = moment().add(SlotSchedulerScheduleLag, 'minutes').format(LONG_DATETIME_FORMAT);
			currentDatewithLag = moment().add(SlotSchedulerScheduleLag, 'minutes').format(SHORT_DATE_FORMAT);

			$('#downloadDatePicker').prop('value', currentDate);
			$('#applyDatePicker').prop('value', currentDate);
			$('#periodFromDatePicker').prop('value', currentDatewithLag);
			$('#periodToDatePicker').prop('value', currentDatewithLag);

			//Date Picker 
			var date = new Date();
			date.setDate(date.getDate());
			$("#downloadDatePicker").datepicker({ startDate: date, autoclose: true, todayHighlight: true });
			$("#applyDatePicker").datepicker({ startDate: date, autoclose: true, todayHighlight: true });
			$("#periodFromDatePicker").datepicker({ startDate: date, autoclose: true, todayHighlight: true });
			$("#periodToDatePicker").datepicker({ startDate: date, autoclose: true, todayHighlight: true });
			var currentDate = moment().format('MM/DD/YYYY');
			$('#downloadDatePicker').prop('value', currentDate);
			$('#applyDatePicker').prop('value', currentDate);
			var currentdatewithlag = moment().add(SlotSchedulerScheduleLag, 'minutes').format('MM/DD/YYYY');
			$('#periodFromDatePicker').prop('value', currentdatewithlag);
			$('#periodToDatePicker').prop('value', currentdatewithlag);
		}

		//Packages Already Assigned
		self.packagesAssignedClick = function () {
			if ($("#packageChkbox").is(':checked')) {
				$("#accordionPackageBody").addClass('disabled');
				$("#accordionReferenceSetsBody").addClass('disabled');
				self.parameterChecked('Software and Parameters');
				self.packageAlredyAssignedChkbox(true);
				self.isPackageAlreadyNotAssigned(false);
				self.isSelectPackageGridEnable(false);
				self.parameterVisible(true);
				self.allParameterVisible(false);
				self.softwareAndParametersVisible(true);
				self.allSoftwareAndParametersChecked('All');
				$("#submitBtn").prop("disabled", false);
				return true;
			} else {
				$("#accordionPackageBody").removeClass('disabled');
				$("#accordionReferenceSetsBody").removeClass('disabled');
				self.packageAlredyAssignedChkbox(false);
				self.isPackageAlreadyNotAssigned(true);
				self.isSelectPackageGridEnable(true);
				self.parameterVisible(false);
				self.allParameterVisible(false);
				self.softwareAndParametersVisible(false);
				if (self.movedArray().length == 0) {
					$("#submitBtn").prop("disabled", true);
				} else {
					$("#submitBtn").prop("disabled", false);
				}
				return true;
			}
		}

		self.softwareParameterClick = function () {
			self.parameterChecked('Software and Parameters');
			self.allSoftwareAndParametersChecked('All');
			self.softwareAndParametersVisible(true);
			self.allParameterVisible(false);
			return true;
		}

		self.allDownloadsClick = function () {
			self.allSoftwareAndParametersChecked('All');
			return true;
		}

		self.differentialDownloadsClick = function () {
			self.allSoftwareAndParametersChecked('Differential');
			return true;
		}

		self.onlyParameterClick = function () {
			self.parameterChecked('Only Parameters');
			self.allParameterChecked('All Parameters');
			self.allParameterVisible(true);
			self.softwareAndParametersVisible(false);
			return true;
		}

		self.allParameterClick = function () {
			self.allParameterChecked('All Parameters');
			return true;
		}

		self.onlyChangeParameter = function () {
			self.allParameterChecked('Only Changed Parameters');
			return true;
		}

		//End of parameter option        

		//Clear Filter
		self.clearfilter = function (gId) {
			gridFilterClear(gId);
		}

		function moveItems(origin, dest) {
			$(origin).find(':selected').appendTo(dest);
		}

		function moveAllItems(origin, dest) {
			$(origin).children().appendTo(dest);
		}

		function upPackages() {
			var selected = $("#jqxgridSelectedPackageGrid").find(":selected");
			var before = selected.prev();
			if (before.length > 0)
				selected.detach().insertBefore(before);
		}

		function downPackages() {
			var selected = $("#jqxgridSelectedPackageGrid").find(":selected");
			var next = selected.next();
			if (next.length > 0)
				selected.detach().insertAfter(next);
		}

		self.selectPackages = function () {
			self.assignmentType('Packages');
			$("#rdbPackages").prop('checked', true);
			$("#rdbReferenceSets").prop('checked', false);
			$("#accordionReferenceSets").hide();
            $("#accordion1").show();
            return true;
		}

		self.selectReferenceSets = function () {
			self.assignmentType('Reference Sets');
			$("#rdbPackages").prop('checked', false);
			$("#rdbReferenceSets").prop('checked', true);			
			$("#accordion1").hide();
			$("#accordionReferenceSets").show();
			if (!isGetReferenceSetsForDevices) {
				var param = getReferenceSetsParameters('Devicejqxgrid', columnSortFilterForReferenceSets);
				referenceSetGrid('jqxgridAvailableReferenceSets', param);
            }
            return true;
		}

		//Download on->Maintainance window click
		self.maintainanceClick = function () {
			self.isEnableNextAvailableSlot(false);

			$("#fromID").find("input").prop("disabled", true);
			$("#nowDownloadID").find("input").prop("disabled", true);

			self.isDownloadOnNextAvailableChecked(true);
			setEnabledStatus_Download(false);
			self.rbgApplyOnCheckbox('Immediately after download');
			currentSelectedApplyScheduleOption = "Immediate";
			self.setEnabledStatus_Apply(false);
			currentSelectedDownloadScheduleOption = "OnNextMaintenanceWindow";
			self.fromDateEnable(false);
			self.dateNextNumericValued(false);
			self.datePeriodToDatePicker(false);
			self.dateVisibleOfDownload(false);
			$("#toCheckBox").prop("disabled", false);
			$("#chkNowAndDateID").prop("disabled", false);
			$("#nowDownloadID").prop("disabled", false);
			if (koUtil.Component == ENUM.get("POS") && koUtil.IsFutureScheduleAllowed == false) {
				$("#dateApplyId").prop("disabled", false);
			}
			hideDetailsOfNextAvilablabledTime();
			$('#nextNumericValued').val('1');

			$("#nextAvailableFreeLabel").find("input").prop("disabled", true);
			$("#downloadPeriodSection").css("opacity", 0.4);
			return true;
		}

		function hideDetailsOfNextAvilablabledTime() {
			self.rbDownloadPeriod('');
			self.chkFrom('');
			self.chkNowAndDate('');
			self.chkTo('');
			$("#maintainanceCheckbox").prop('checked', false);
		}

		self.contactClick = function () {
			self.isEnableNextAvailableSlot(false);

			$("#fromID").find("input").prop("disabled", true);
			$("#nowDownloadID").find("input").prop("disabled", true);

			self.isDownloadOnNextAvailableChecked(true);
			setEnabledStatus_Download(false);
			self.rbgApplyOnCheckbox('Immediately after download');
			self.setEnabledStatus_Apply(false);
			currentSelectedDownloadScheduleOption = "Immediate";
			self.dateNextNumericValued(false);
			self.datePeriodToDatePicker(false);
			self.dateVisibleOfDownload(false);
			self.fromDateEnable(false);
			$("#toCheckBox").prop("disabled", false);
			$("#chkNowAndDateID").prop("disabled", false);
			if (koUtil.Component == ENUM.get("POS") && koUtil.IsFutureScheduleAllowed == false) {
				$("#dateApplyId").prop("disabled", false);
			}
			$("#nowDownloadID").prop("disabled", false);
			hideDetailsOfNextAvilablabledTime();
			// $('#nextNumericValued').val('1');
			$("#nextAvailableFreeLabel").find("input").prop("disabled", true);
			var now = new Date();//update current date on click of radio button
			var dateobj = formatAMPM(now);
			//new added
			$("#nextAvailableFreeLabel").find("input").prop("disabled", true);
			$("#downloadPeriodSection").css("opacity", 0.4);
			return true;
		}
		$("#downloadHours").on('keyup', function () {
			ChkHours("downloadHours");

		})
		$("#applyOnTimeHour").on('keyup', function () {
			ChkHours("applyOnTimeHour");

		})
		$("#downloadMinutes").on('keyup', function () {
			ChkMinutes("downloadMinutes");
		})
		$("#applyOnTimeMinute").on('keyup', function () {
			ChkMinutes("applyOnTimeMinute");
		})
		function ChkHours(ids) {
			var now = new Date();
			var dateobj = formatAMPM(now);
			var downloadHours = $("#" + ids).val();
			if (downloadHours >= 0 && downloadHours <= 12)
				return true;
			else
				$("#" + ids).val(dateobj.hours);
		}
		function ChkMinutes(ids) {
			var now = new Date();
			var dateobj = formatAMPM(now);
			var downloadMinutes = $("#" + ids).val();
			if (downloadMinutes >= 0 && downloadMinutes <= 59)
				return true;
			else
				$("#" + ids).val(dateobj.minutes + 1);
		}
		self.dateClick = function () {

			self.isEnableNextAvailableSlot(false);
			$("#fromID").find("input").prop("disabled", true);
			$("#nowDownloadID").find("input").prop("disabled", true);

			self.isDownloadOnNextAvailableChecked(true);
			self.dateNextNumericValued(false);
			self.dateVisibleOfDownload(true);
			self.fromDateEnable(false);

			setEnabledStatus_Download(true);
			var currentDate = moment().format('MM/DD/YYYY');
			$('#downloadDatePicker').prop('value', currentDate);

			self.rbgApplyOnCheckbox('Immediately after download');
			currentSelectedApplyScheduleOption = "Immediate";
			self.setEnabledStatus_Apply(false);
			self.immediateApplyClick();
			currentSelectedDownloadScheduleOption = "SpecifiedDate";
			self.datePeriodToDatePicker(false);
			//  $('#nextNumericValued').val('1');
			$("#toCheckBox").prop("disabled", false);
			$("#chkNowAndDateID").prop("disabled", false);
			$("#nowDownloadID").prop("disabled", false);
			if (koUtil.Component == ENUM.get("POS") && koUtil.IsFutureScheduleAllowed == false) {
				$("#dateApplyId").prop("disabled", false);
			}
			hideDetailsOfNextAvilablabledTime();

			var now = new Date();//update current date on click of radio button
			var dateobj = formatAMPM(now);
			$("#downloadHours").val(dateobj.hours);
			if (dateobj.minutes != 59) {
				$("#downloadMinutes").val(parseInt(dateobj.minutes) + 1);
			} else {
				$("#downloadMinutes").val(0);
			}
			$("#downloadName").val(dateobj.ampm);

			$("#applyOnTimeHour").val(dateobj.hours);
			// $("#applyOnTimeMinute").val(dateobj.minutes);
			$("#dateAMPM").val(dateobj.ampm);

			//new code increase minute of apply date
			var dMinut = $("#downloadMinutes").val();

			$("#applyOnTimeMinute").val(parseInt(dMinut) + 1);

			//new added
			$("#nextAvailableFreeLabel").find("input").prop("disabled", true);

			$("#downloadPeriodSection").css("opacity", 0.4);
			return true;
		}

		function setEnabledStatus_Download(isEnabled) {
			self.dateVisibleOfDownload(isEnabled);
		}
		///Next Availavble Free slot
		$("#nextAvailableFreeLabel").find("input").prop("disabled", true);

		self.nextAvailableFreeSlot = function () {
			self.isEnableNextAvailableSlot(true);
			$("#nextAvailableFreeLabel").find("input").prop("disabled", false);
			$("#fromID").find("input").prop("disabled", false);
			$("#nowDownloadID").find("input").prop("disabled", false);
			$("#fromID").prop("disabled", true);

			self.isDownloadOnNextAvailableChecked(false);
			self.rbDownloadPeriod('Download Period');
			self.rbgApplyOnCheckbox('Immediately after download');
			currentSelectedApplyScheduleOption = "Immediate";
			self.setEnabledStatus_Apply(false);
			self.chkFrom('From');
			self.chkNowAndDate('Now');
			currentSelectedDownloadScheduleOption = "DownloadWindow";
			self.dateVisibleOfDownload(false);
			self.dateNextNumericValued(false);
			self.datePeriodToDatePicker(false);
			$("#dateApplyId").prop("disabled", true);
			$("#maintainanceCheckbox").prop('checked', true);

			$("#periodToDatePicker").prop("disabled", true);
			$("#toMinutes").prop("disabled", true);
			$("#toHours").prop("disabled", true);
			$("#toDateName").prop("disabled", true);

			$("#periodFromDatePicker").prop("disabled", true);
			$("#fromHours").prop("disabled", true);
			$("#fromMinutes").prop("disabled", true);
			$("#downloadPeriodName").prop("disabled", true);
			$("#nextNumericValued").prop("disabled", true);
			currentDateTimeupdate(currentDate);

			$('#downloadDatePicker').prop('value', currentDateShort);
			$("#downloadPeriodSection").css("opacity", 10);
			return true;
		}

		self.downloadPeriodClick = function () {
			self.rbDownloadPeriod('Download Period');
			self.dateNextNumericValued(false);
			self.datePeriodToDatePicker(false);
			self.dateVisibleOfDownload(false);
			$("#toCheckBox").prop("disabled", false);
			$("#chkNowAndDateID").prop("disabled", false);
			$("#nowDownloadID").prop("disabled", false);
			$("#dateApplyId").prop("disabled", true);
			self.chkNowAndDate('Now');
			if (self.rbDownloadPeriod('Download Period')) {
				self.chkFrom('From')
				$('#nextNumericValued').val('1');
				self.rbgApplyOnCheckbox('Immediately after download');
				currentSelectedApplyScheduleOption = "Immediate";
				self.setEnabledStatus_Apply(false);

				$("#applyDatePicker").val(currentDate);
				$("#applyOnTimeHour").val('12');
				$("#applyOnTimeMinute").val('0');
				$("#dateAMPM").val('AM');

				var now = new Date();
				var dateobj = formatAMPM(now);
				now.setMinutes(now.getMinutes() + SlotSchedulerScheduleLag);
				var dateobjwithLag = formatAMPM(now);
				$("#fromHours").val(dateobjwithLag.hours);
				//  $("#fromMinutes").val(dateobj.minutes);

				if (parseInt(dateobjwithLag.minutes) < 59) {
					$("#fromMinutes").val(parseInt(dateobjwithLag.minutes) + 1);
				} else if (parseInt(dateobjwithLag.minutes) == 59) {
					$("#fromMinutes").val('0');
				} else {
					$("#fromMinutes").val(parseInt(dateobjwithLag.minutes));
				}
				$("#downloadPeriodName").val(dateobjwithLag.ampm);
				$("#dateApplyId").prop("disabled", true);

				currentSelectedDownloadPeriod = "Download Period";
			}

			return true;
		}

		self.rbNext_clickHandler = function () {
			$("#toCheckBox").prop("disabled", true);
			$("#chkNowAndDateID").prop("disabled", true);
			$("#fromID").prop("disabled", true);
			$("#nowDownloadID").prop("disabled", true);
			if (koUtil.Component == ENUM.get("POS") && koUtil.IsFutureScheduleAllowed == false) {
				$("#dateApplyId").prop("disabled", false);
			}
			$("#inlinedRadido2").prop("disabled", false);
			$("#nextRadioButtonID").prop("disabled", false);
			$("#nextNumericValued").prop("disabled", false);
			// self.dateEnableOfApply(false);
			self.chkFrom(false);
			self.chkTo(false);
			self.dateNextNumericValued(true);
			self.dateVisibleOfDownload(false);
			self.datePeriodToDatePicker(false);
			self.fromDateEnable(false);
			self.chkNowAndDate(false);
			self.rbDownloadPeriod('Next');
			self.dateEnableOfApply(false);
			self.rbgApplyOnCheckbox('Immediately after download');
			currentSelectedApplyScheduleOption = "Immediate";
			$("#nextNumericValued").focus();
			currentSelectedDownloadPeriod = "Next";
			currentDateTimeupdate(currentDate);
			return true;
		}

		//------------------------------------------------------------ On Up And Down Arrow Click----------------------------------------------

		self.downloadOnHourclickUp = function () {

			var downloadOnHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $("#downloadName").val();

			if (parseInt(downloadOnHours) < 12) {
				downloadOnHours = parseInt(downloadOnHours) + 1;


				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), downloadOnHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
				dateCompareOnUPandDown(DownloadApplyOnDate, downloadOnHours, downloadMinutes, downloadName);
			} else if (downloadOnHours == 12) {
				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), downloadOnHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
				dateCompareOnUPandDown(0, downloadOnHours, downloadMinutes, downloadName);
			} else {
				return;
			}

		}

		self.downloadOnHourclickDown = function () {

			var downloadOnHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $("#downloadName").val();

			if (parseInt(downloadOnHours) < 12 && parseInt(downloadOnHours) != 1) {
				downloadOnHours = parseInt(downloadOnHours) - 1;


				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), downloadOnHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
				dateCompareOnUPandDown(DownloadApplyOnDate, downloadOnHours, downloadMinutes, downloadName);
			} else if (downloadOnHours == 12) {
				downloadOnHours = 11;
				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), downloadOnHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
				dateCompareOnUPandDown(DownloadApplyOnDate, downloadOnHours, downloadMinutes, downloadName);
			} else {
				return;
			}

		}

		self.downloadOnMinuteclickUp = function () {

			var downloadOnHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $("#downloadName").val();

			if (parseInt(downloadMinutes) < 59) {
				downloadMinutes = parseInt(downloadMinutes) + 1;


				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), downloadOnHours, downloadMinutes, $("#downloadName").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
				dateCompareOnUPandDown(DownloadApplyOnDate, downloadOnHours, downloadMinutes, downloadName, downloadName);
			} else if (downloadOnHours == 59) {
				downloadOnHours = 59;
				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), downloadOnHours, downloadMinutes, $("#downloadName").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
				dateCompareOnUPandDown(DownloadApplyOnDate, downloadOnHours, downloadMinutes, downloadName, downloadName);
			} else {
				return;
			}

		}

		self.downloadOnMinuteclickDown = function () {

			var downloadOnHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $("#downloadName").val();

			if (parseInt(downloadMinutes) < 59 && parseInt(downloadMinutes) != 0) {
				downloadMinutes = parseInt(downloadMinutes) - 1;


				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), downloadOnHours, downloadMinutes, $("#downloadName").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
				dateCompareOnUPandDown(DownloadApplyOnDate, downloadOnHours, downloadMinutes, downloadName);
			} else if (downloadOnHours == 59) {
				downloadOnHours == 58;
				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), downloadOnHours, $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
				dateCompareOnUPandDown(DownloadApplyOnDate, downloadOnHours, downloadMinutes, downloadName);
			} else {
				return;
			}

		}
		$("#downloadName").on('change', function (e) {
			var downloadOnHours = $("#downloadHours").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $(this).val();
			var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), downloadName, $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
			dateCompareOnUPandDown(DownloadApplyOnDate, downloadOnHours, downloadMinutes, downloadName);
		});
		function dateCompareOnUPandDown(DownloadApplyOnDate, downloadOnHours, downloadMinutes, downloadName) {
			if (DownloadApplyOnDate == 0) {

			} else {
				if (downloadMinutes != 59) {
					$("#applyOnTimeHour").val(downloadOnHours);
					$("#applyOnTimeMinute").val(parseInt(downloadMinutes) + 1);
					$('#dateAMPM').val(downloadName).prop("selected", "selected");
				} else {

					if (downloadOnHours == 12) {
						$("#applyOnTimeHour").val(1);
						$('#dateAMPM').val(downloadName).prop("selected", "selected");
					} else if (downloadOnHours == 11) {
						if ($('#downloadName :selected').text() == "PM") {
							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#dateAMPM').val("AM").prop("selected", "selected");
							var applyDatePicker = $("#applyDatePicker").val();
							updateAndSetApplyDate(applyDatePicker);

						} else {
							$('#dateAMPM').val("PM").prop("selected", "selected");
							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
						}
						$("#applyOnTimeHour").val(12);

					} else {
						$("#applyOnTimeHour").val(parseInt(downloadOnHours) + 1);
					}
					$("#applyOnTimeMinute").val(0);

				}
			}
		}
		function updateAndSetApplyDate(applyDatePicker) {
			$("#applyDatePicker").datepicker('update', applyDatePicker);
			$("#applyDatePicker").datepicker('setStartDate', applyDatePicker);
		}

		self.applyOnHourclickUp = function () {
			var applyOnTimeHour = $("#applyOnTimeHour").val();
			var downloadHours = $("#downloadHours").val();
			var applyOnTimeMinute = $("#applyOnTimeMinute").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $("#downloadName").val();

			var applyOnTimeHourSenValue = $("#downloadHours").val();
			applyOnTimeHourSenValue = parseInt(applyOnTimeHourSenValue) + 1;

			var dateAMPM = $("#dateAMPM").val();
			if (parseInt(applyOnTimeHour) < 11) {
				applyOnTimeHour = parseInt(applyOnTimeHour) + 1;

				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), applyOnTimeHour, $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
				dateCompareOnUPandDownForApply(DownloadApplyOnDate, applyOnTimeHourSenValue, applyOnTimeMinute, dateAMPM, downloadHours, downloadMinutes);

			} else if (parseInt(applyOnTimeHour) == 12 || parseInt(applyOnTimeHour) == 11) {
				applyOnTimeHour = 12;
				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), applyOnTimeHour, $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
				dateCompareOnUPandDownForApply(0, applyOnTimeHourSenValue, applyOnTimeMinute, dateAMPM, downloadHours, downloadMinutes);
			}
		}
		self.applyOnHourclickDown = function () {
			var applyOnTimeHour = $("#applyOnTimeHour").val();
			var downloadHours = $("#downloadHours").val();
			var applyOnTimeMinute = $("#applyOnTimeMinute").val();
			var dateAMPM = $("#dateAMPM").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $("#downloadName").val();

			var applyOnTimeHourSenValue = $("#applyOnTimeHour").val();
			applyOnTimeHourSenValue = parseInt(applyOnTimeHourSenValue) + 1;
			if (parseInt(applyOnTimeHour) < 12 && parseInt(applyOnTimeHour) != 1) {
				applyOnTimeHour = parseInt(applyOnTimeHour) - 1;
				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), applyOnTimeHour, $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
				dateCompareOnUPandDownForApply(DownloadApplyOnDate, applyOnTimeHourSenValue, applyOnTimeMinute, dateAMPM, downloadHours, downloadMinutes);

			} else if (applyOnTimeHour == 12) {
				applyOnTimeHour = 11;
				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), applyOnTimeHour, $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
				dateCompareOnUPandDownForApply(DownloadApplyOnDate, applyOnTimeHourSenValue, parseInt(applyOnTimeMinute) + 1, dateAMPM, downloadHours, downloadMinutes);
			}
		}

		self.applyOnMinuteclickUp = function () {
			var applyOnTimeHour = $("#applyOnTimeHour").val();
			var downloadHours = $("#downloadHours").val();
			var applyOnTimeMinute = $("#applyOnTimeMinute").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $("#downloadName").val();

			var applyTimeMinuteSenValue = $("#downloadMinutes").val();
			applyTimeMinuteSenValue = parseInt($("#applyOnTimeMinute").val()) + 1;

			var dateAMPM = $("#dateAMPM").val();
			if (parseInt(applyOnTimeHour) == 12) {

			} else {
				if (parseInt(applyOnTimeMinute) < 59) {
					applyOnTimeMinute = parseInt(applyOnTimeMinute) + 1;
					var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), applyOnTimeHour, applyOnTimeMinute, $("#dateAMPM").val());
					dateCompareOnUPandDownForApply(DownloadApplyOnDate, applyOnTimeHour, applyTimeMinuteSenValue, dateAMPM, downloadHours, downloadMinutes);

				} else if (parseInt(applyOnTimeMinute) == 59) {

					var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), applyOnTimeHour, applyOnTimeMinute, $("#dateAMPM").val());
					dateCompareOnUPandDownForApply(DownloadApplyOnDate, applyOnTimeHour, applyTimeMinuteSenValue, dateAMPM, downloadHours, downloadMinutes);
				}
			}
		}
		self.applyOnMinuteclickDown = function () {
			var applyOnTimeHour = $("#applyOnTimeHour").val();
			var downloadHours = $("#downloadHours").val();
			var applyOnTimeMinute = $("#applyOnTimeMinute").val();
			var downloadMinutes = $("#downloadMinutes").val();
			var downloadName = $("#downloadName").val();

			var applyTimeMinuteSenValue = $("#downloadMinutes").val();
			applyTimeMinuteSenValue = parseInt(applyTimeMinuteSenValue) + 1;

			var dateAMPM = $("#dateAMPM").val();
			if (parseInt(applyOnTimeHour) == 12) {
			} else {
				if (parseInt(applyOnTimeMinute) < 59 && parseInt(applyOnTimeMinute) != 0) {
					applyOnTimeMinute = parseInt(applyOnTimeMinute) - 1;
					var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), applyOnTimeHour, applyOnTimeMinute, $("#dateAMPM").val());
					dateCompareOnUPandDownForApply(DownloadApplyOnDate, applyOnTimeHour, applyTimeMinuteSenValue, dateAMPM, downloadHours, downloadMinutes);

				} else if (parseInt(applyOnTimeMinute) == 59) {
					applyOnTimeMinute = 58;
					var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), applyOnTimeHour, applyOnTimeMinute, $("#dateAMPM").val());
					dateCompareOnUPandDownForApply(DownloadApplyOnDate, applyOnTimeHour, applyTimeMinuteSenValue, dateAMPM, downloadHours, downloadMinutes);
				}
			}
		}

		function dateCompareOnUPandDownForApply(DownloadApplyOnDate, applyOnTimeHour, applyOnTimeMinute, dateAMPM, downloadHours, downloadMinutes) {
			if (DownloadApplyOnDate == 0) {

			} else {
				if (downloadMinutes != 59) {
					$("#applyOnTimeHour").val(parseInt(applyOnTimeHour));

					$("#applyOnTimeMinute").val(parseInt(applyOnTimeMinute));
					$('#dateAMPM').val($("#downloadName").val()).prop("selected", "selected");
				} else {
					if ($("#downloadHours").val() == 12) {
						$("#applyOnTimeHour").val(1);
						$('#dateAMPM').val($("#downloadName").val()).prop("selected", "selected");
					} else if ($("#downloadHours").val() == 11) {
						if ($('#downloadName :selected').text() == "PM") {
							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#dateAMPM').val("AM").prop("selected", "selected");
							var applyDatePicker = $("#applyDatePicker").val();
							updateAndSetApplyDate(applyDatePicker);

						} else {
							$('#dateAMPM').val("PM").prop("selected", "selected");
							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
						}
						$("#applyOnTimeHour").val(12);

					} else {
						$("#applyOnTimeHour").val(parseInt(downloadHours) + 1);

					}
					$("#applyOnTimeMinute").val(0);
				}
			}
		}

		//  -------------------------------------------------------------- End-On Up And Down Arrow Click--------------------------------------

		self.chkFromOnClick = function () {
			var now = new Date();
			var dateobj = formatAMPM(now);
			now.setMinutes(now.getMinutes() + SlotSchedulerScheduleLag);
			var dateobjwithLag = formatAMPM(now);
			$("#fromHours").val(dateobjwithLag.hours);
			// $("#fromMinutes").val(dateobj.minutes);
			if (parseInt(dateobjwithLag.minutes) < 59) {
				$("#fromMinutes").val(parseInt(dateobjwithLag.minutes) + 1);
			} else if (parseInt(dateobjwithLag.minutes) == 59) {
				$("#fromMinutes").val('0');
			} else {
				$("#fromMinutes").val(parseInt(dateobjwithLag.minutes));
			}

			$("#downloadPeriodName").val(dateobjwithLag.ampm);
			if ($("#fromID").is(':checked')) {
				self.chkNowAndDate('Now');
				self.rbNow_clickHandler(null);

			} else {
				self.chkNowAndDate(false);
				self.rbFromTimeAM('AM');
				self.chkFrom('');
				$('#periodFromDatePicker').prop('value', currentDateShortwithLag);

				var today = new Date();
				today.setMinutes(today.getMinutes() + SlotSchedulerScheduleLag);
				var currentHour = today.getHours() > 12 ? (today.getHours() - 12) : today.getHours();
				$('#fromHours').prop('value', currentHour == 0 ? 12 : currentHour);
				$('#fromMinutes').prop('value', today.getMinutes() + 1);
				self.fromDateEnable(false);
			}

			if ($("#chkNowAndDateID").is(':checked')) {
				self.fromDateEnable(false);
			}
			return true;
		}

		self.chkToAmPm = ko.observable(true);
		// Call api and bind the difference in time zone.	
		self.chkToOnClick = function () {

			var now = new Date();
			var dateobj = formatAMPM(now);
			now.setMinutes(now.getMinutes() + SlotSchedulerScheduleLag);
			var dateobjwithLag = formatAMPM(now);

			if ($("#toCheckBox").is(':checked')) {
				//  self.dateVisibleOfDownload(true);
				self.datePeriodToDatePicker(true);
				if (koUtil.Component == ENUM.get("POS") && koUtil.IsFutureScheduleAllowed == false) {
					$("#dateApplyId").prop("disabled", false);
				}
			} else {
				//self.dateVisibleOfDownload(false);
				self.datePeriodToDatePicker(false);
				$("#dateApplyId").prop("disabled", true);
				self.rbgApplyOnCheckbox('Immediately after download');
				currentSelectedApplyScheduleOption = "Immediate";
				self.dateEnableOfApply(false);
				$("#periodToDatePicker").val(currentDatewithLag);
				$("#applyDatePicker").val(currentDate);

				$("#toHours").val(dateobjwithLag.hours);
				//  $("#toMinutes").val(dateobj.minutes);
				if (parseInt(dateobjwithLag.minutes) < 59) {
					$("#toMinutes").val(parseInt(dateobjwithLag.minutes) + 1);
				} else if (parseInt(dateobjwithLag.minutes) == 59) {
					$("#toMinutes").val('0');
				} else {
					$("#toMinutes").val(parseInt(dateobjwithLag.minutes));
				}

				$("#toDateName").val(dateobjwithLag.ampm);

				$("#applyOnTimeHour").val(dateobj.hours);
				// $("#applyOnTimeMinute").val(dateobj.minutes);
				if (parseInt(dateobj.minutes) < 59) {
					$("#applyOnTimeMinute").val(parseInt(dateobj.minutes) + 1);
				} else if (parseInt(dateobj.minutes) == 59) {
					$("#applyOnTimeMinute").val('0');
				} else {
					$("#applyOnTimeMinute").val(parseInt(dateobj.minutes));
				}
				$("#dateAMPM").val(dateobj.ampm);
				return true;
			}

			var toDate = moment($("#periodFromDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT);
			// assigning periodToDatePicker -13 hours
			var updateDate = moment().add(-slotTimezoneOffsetDiff, 'hours').format(SHORT_DATE_FORMAT);
			$("#periodToDatePicker").datepicker('update', toDate);
			$("#periodToDatePicker").datepicker('setStartDate', $("#chkNowAndDateID").is(':checked') ? updateDate : toDate);

			$("#applyDatePicker").val(moment($("#periodToDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
			$('#applyDatePicker').prop('value', moment($("#periodToDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));

			$("#toHours").val(dateobjwithLag.hours);
			// $("#toMinutes").val(dateobj.minutes);
			if (parseInt(dateobjwithLag.minutes) < 59) {
				$("#toMinutes").val(parseInt(dateobjwithLag.minutes) + 1);
			} else if (parseInt(dateobjwithLag.minutes) == 59) {
				$("#toMinutes").val('0');
			} else {
				$("#toMinutes").val(parseInt(dateobjwithLag.minutes));
			}

			$("#toDateName").val(dateobjwithLag.ampm);

			$("#applyOnTimeHour").val(dateobj.hours);
			// $("#applyOnTimeMinute").val(dateobj.minutes);
			if (parseInt(dateobj.minutes) < 59) {
				$("#applyOnTimeMinute").val(parseInt(dateobj.minutes) + 1);
			} else if (parseInt(dateobj.minutes) == 59) {
				$("#applyOnTimeMinute").val('0');
			} else {
				$("#applyOnTimeMinute").val(parseInt(dateobj.minutes));
			}

			$("#dateAMPM").val(dateobj.ampm);


			//var today = new Date();
			//var currentHour = today.getHours() > 12 ? (today.getHours() - 12) : today.getHours();
			//$('#toHours').prop('value', moment(currentDateLong).format('HH'));
			//$('#toMinutes').prop('value', moment(currentDateLong).format('mm'));
			//    $("#toDateName").val(moment(currentDateLong).format('A'));

			return true;
		}

		self.rbNow_clickHandler = function () {
			if ($("#fromID").is(':checked') && $("#nowDownloadID").is(':checked')) {
				self.fromDateEnable(false);
				var now = new Date();//update current date on click of radio button
				var dateobj = formatAMPM(now);
				now.setMinutes(now.getMinutes() + SlotSchedulerScheduleLag);
				var dateobjwithLag = formatAMPM(now);
				$("#periodFromDatePicker").val(currentDatewithLag);
				var toDateReset = moment().add(SlotSchedulerScheduleLag, 'minutes').add('days', 1).format(SHORT_DATE_FORMAT);
				$("#periodToDatePicker").val(toDateReset);
				$("#periodToDatePicker").datepicker('setStartDate', toDateReset);
				$("#periodToDatePicker").datepicker('updatedate', toDateReset);
				$("#fromHours").val(dateobjwithLag.hours);
				//   $("#fromMinutes").val(parseInt(dateobj.minutes) + 1);
				if (parseInt(dateobjwithLag.minutes) < 59) {
					$("#fromMinutes").val(parseInt(dateobjwithLag.minutes) + 1);
				} else if (parseInt(dateobjwithLag.minutes) == 59) {
					$("#fromMinutes").val('0');
				} else {
					$("#fromMinutes").val(parseInt(dateobjwithLag.minutes));
				}
			}
		}

		self.rbStartDate_clickHandler = function () {
			currentSelectedDateOption = "Start Date"
			self.fromDateEnable(true);
			self.chkNowAndDate('Date');

			var now = new Date();
			var dateobj = formatAMPM(now);
			now.setMinutes(now.getMinutes() + SlotSchedulerScheduleLag);
			var dateobjwithLag = formatAMPM(now);
			$("#periodFromDatePicker").val(currentDatewithLag);
			$("#fromHours").val(dateobjwithLag.hours);
			//  $("#fromMinutes").val(dateobj.minutes);
			if (parseInt(dateobjwithLag.minutes) < 59) {
				$("#fromMinutes").val(parseInt(dateobjwithLag.minutes) + 1);
			} else if (parseInt(dateobjwithLag.minutes) == 59) {
				$("#fromMinutes").val('0');
			} else {
				$("#fromMinutes").val(parseInt(dateobjwithLag.minutes));
			}

			$("#downloadPeriodName").val(dateobjwithLag.ampm);

			var periodFromDatePicker = $("#periodFromDatePicker").val();
			// calculating the time difference for the timezone
			var updateDate = moment().add(-slotTimezoneOffsetDiff, 'hours').format(SHORT_DATE_FORMAT);
			$("#periodFromDatePicker").datepicker('update', periodFromDatePicker);
			$("#periodFromDatePicker").datepicker('setStartDate', $("#chkNowAndDateID").is(':checked') ? updateDate : periodFromDatePicker);
			return true;
		}

		self.dfStartDate_changeHandler = function () {
			//ToDo		
		}

		self.allPackagesMove = function () {
			var arr = self.movedArray();
			if (arr.length > 0) {
				for (i = 0; i < arr.length; i++) {
					self.movedArray([]);
					self.packageData.push(arr[i]);
				}
				selectedDownloadsActionsContent = [];
				$("#btnForMoveleft").addClass('disabled');
				$("#btnForMoveRight").addClass('disabled');
				$("#btnMoveItemUp").addClass('disabled');
				$("#btnMoveItemDown").addClass('disabled');
				$('#jqxgridAvailablePackage').jqxGrid('clearselection');
			}

			gridSelectedDataForSwap = [];
			if (State12) {
				$("#jqxgridAvailablePackage").jqxGrid('loadstate', State12);
			}

			$("#immediateId").prop("disabled", false);
			$("#dateApplyId").prop("disabled", false);
			$("#nextAvailableId").prop("disabled", false);

			selectedHighlightedRowForGrid();
			$("#submitBtn").prop("disabled", true);
		}

		//To Date


		self.setEnabledStatus_Apply = function (isEnabled) {
			self.dateEnableOfApply(isEnabled);
			//    $("#dateAMPM").val("AM");

			var now = new Date();
			var dateobj = formatAMPM(now);

			$("#applyOnTimeHour").val(dateobj.hours);
			$("#applyOnTimeMinute").val(dateobj.minutes);
			$("#dateAMPM").val(dateobj.ampm);

			return true;
		}
		//////////////Download DateTime Calculation
		self.isDateChanged = ko.observable(false)
		self.applyTimeMinimumCalculation = function () {
			if (dateCompare($("applyDatePicker").val(), $("downloadDatePicker").val()) == 0) //Apply On date is equal to Download On date
			{
				self.applyDateTimeCalculation();
			}
			else //Apply On Date is greater than Download On Date
			{

			}
		}

		self.applyTimeHour_changeHandler = function () {
			if (dateCompare($("applyDatePicker").val(), $("downloadDatePicker").val()) == 0) //Apply On date is equal to Download On date
			{
				if ($("#downloadHours").val() == $("#applyOnTimeHour").val()) {
					$("#applyOnTimeMinute").prop('min', ($("#downloadMinutes").val() + 1));
					if ($("#applyOnTimeHour").val() < $("#downloadHours").val())
						$("#applyOnTimeMinute").prop('value', ($("#downloadMinutes").val()) + 1);
				}
				else {
					$("#applyOnTimeMinute").prop('min', 0);
				}
			}
		}
		self.applyOnDateChecOnChange = function (id) {

			if ($("#applyDatePicker").val() == $("#downloadDatePicker").val()) {

				var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#dateAMPM").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val())
				if (DownloadApplyOnDate == 1) {
					if (id == 'applyOnTimeMinute') {
						$("#" + id).val(parseInt($("#downloadMinutes").val()) + 1);
					}
					if (id == 'applyOnTimeHour') {
						$("#" + id).val($("#downloadHours").val());
					}
				}
			}
		}

		self.applyDateTimeCalculation = function () {
			self.isDateChanged(true);
			rangeApply = [];
			$("#downloadHours").prop('min', 1);
			$("#downloadHours").prop('min', 0);

			var dwDate = moment($("#downloadDatePicker").val()).format('DD');
			var dwMonth = moment($("#downloadDatePicker").val()).format('MM');
			var dwYear = moment($("#downloadDatePicker").val()).format('YYYY');

			if (self.isDateChanged && dateCompare(currentDateShort, $("#downloadDatePicker").val()) == 0) {
				$("#downloadHours").prop('value', moment(currentDateLong).format('HH'));
				$("#downloadMinutes").prop('value', moment(currentDateLong).format('mm') + 1);
				$("#downloadName").val(moment(currentDateLong).format('A'));
				self.isDateChanged(false);
			}

			if (dateCompare($("#applyDatePicker").val(), $("#downloadDatePicker").val()) == -1) //Apply On Date is less than Download On Date
				dtApply.selectedDate = currentDateShort;

			if ($("#downloadMinutes").val() == 59) //Download Date is in 59th minute
			{
				if ($("#downloadHours").val() == 12) //Download Date is in 12th hour
				{
					if (dateCompare($("#applyDatePicker").val(), $("#downloadDatePicker").val()) == 1) //Apply On Date is same as Download On Date
					{
						$("#applyOnTimeHour").prop('min', 1);
						$("#applyOnTimeMinute").prop('min', 0);
						return;
					}

					$("#applyOnTimeHour").prop('min', 1);
					$("#applyOnTimeHour").prop('value', 1);
					$("#applyOnTimeMinute").prop('min', 0);
					$("#applyOnTimeMinute").prop('value', 0);
				}
				else {
					if (dateCompare($("applyDatePicker").val(), $("downloadDatePicker").val()) == 1) {
						$("#applyOnTimeHour").prop('min', 1);
						$("#applyOnTimeMinute").prop('min', 0);
						return;
					}

					if ($("#downloadHours").val() == $("#applyOnTimeHour").val()) {
						$("#applyOnTimeHour").prop('min', ($("#downloadHours").val()) + 1);
						$("#applyOnTimeHour").prop('value', ($("#downloadHours").val()) + 1);
						$("#applyOnTimeMinute").prop('min', 0);
						$("#applyOnTimeMinute").prop('value', 0);
					}
					else {
						$("#applyOnTimeMinute").prop('min', ($("#downloadHours").val()) + 1);
						$("#applyOnTimeMinute").prop('min', 0);
					}
				}
			}
			else {
				if (self.isDownloadAMPM('AM')) //Download Date is in AM
				{
					if (self.amPmChk('AM') && (dateCompare($("#applyDatePicker").val(), $("#downloadDatePicker").val()) == 0)) //Apply On Date is in AM
					{
						$("#applyOnTimeHour").prop('min', $("#downloadHours").val());
						$("#applyOnTimeMinute").prop('min', 0);
						if ($("#applyOnTimeHour").prop('value', $("#applyOnTimeHour").val())) {
							if ($("#applyOnTimeHour").val() < $("#downloadHours").val())
								$("#applyOnTimeHour").prop('value', $("#downloadHours").val());
							$("#applyOnTimeMinute").prop('min', ($("#downloadMinutes").val() + 1));
							if ($("#applyOnTimeMinute").val() < $("#downloadMinutes").val())
								$("#applyOnTimeMinute").prop('value', $("#downloadMinutes").val());
						}
					}
					else {
						if (dateCompare($("#applyDatePicker").val(), $("#downloadDatePicker").val()) == 1) {
							$("#applyOnTimeHour").prop('min', 1);
							$("#applyOnTimeMinute").prop('min', 0);
							return;
						}

						$("#applyOnTimeHour").prop('min', 1);
						$("#applyOnTimeHour").prop('value', ($("#downloadHours").val()) + 1);
						$("#applyOnTimeMinute").prop('min', 0);
						$("#applyOnTimeMinute").prop('value', ($("#downloadMinutes").val()) + 1);
					}
				}
				else //Download Date is in PM
				{
					if ($("#downloadHours").prop('value', 12)) //Download Date is in 12th hour
					{
						$("#applyOnTimeHour").prop('min', 1);
						if ($("#applyOnTimeHour").val() < $("#downloadHours").val())
							$("#applyOnTimeHour").prop('value', ($("#downloadHours").val()) + 1);

						if ($("#downloadHours").val() == $("#applyOnTimeHour").val()) {
							$("#applyOnTimeMinute").prop('value', ($("#downloadMinutes").val()) + 1);
							if ($("#applyOnTimeMinute").val() <= $("#downloadMinutes").val())
								$("#applyOnTimeMinute").prop('value', ($("#downloadMinutes").val()) + 1);
						}
						else {
							$("#applyOnTimeMinute").prop('min', 0);
							if ($("#applyOnTimeHour").val() < $("#downloadHours").val())
								$("#applyOnTimeMinute").prop('value', ($("#downloadMinutes").val()) + 1);
						}
					}
					else {
						if (dateCompare($("#applyDatePicker").val(), $("#downloadDatePicker").val()) == 1)
							$("#applyOnTimeHour").prop('min', 1);
						$("#applyOnTimeMinute").prop('min', 0);
						return;
					}

					if ($("#applyOnTimeHour").val == 12) //Apply On Date is in 12th hour
					{
						$("#applyOnTimeMinute").prop('min', $("#downloadHours").val());
						$("#applyOnTimeMinute").prop('value', $("#downloadHours").val());
					}
					else {
						$("#applyOnTimeHour").prop('min', $("#downloadHours").val());
						if ($("#applyOnTimeHour").val() < $("#downloadHours").val())
							$("#applyOnTimeHour").prop('value', $("#downloadHours").val());
					}

					if ($("#downloadHours").val() == $("#applyOnTimeHour").val()) {
						if ($("#applyOnTimeMinute").val() <= $("#downloadMinutes").val()) {
							$("#applyOnTimeMinute").prop('min', ($("#downloadMinutes").val()) + 1);
							$("#applyOnTimeMinute").prop('value', ($("#downloadMinutes").val()) + 1);
						}
					} else {
						$("#applyOnTimeMinute").prop('min', 0)
					}

				}
			}
		}

		//////////////////////////////////Am/Pm Handler////////////////////////

		self.applyTimeAMPMClick = function () {
			if ($("#downloadMinutes").val() == 59) //Download Date is in 59th minute
			{
				if ($("#downloadHours").val() == 12)//Download Date is in 12th hour
				{
					$("#applyOnTimeHour").prop('min', 1);
					$("#applyOnTimeMinute").prop('min', 0);
					return;
				}
				else {
					$("#applyOnTimeHour").prop('min', ($("#downloadHours").val()) + 1);
					$("#applyOnTimeHour").prop('value', ($("#downloadHours").val()) + 1);
				}
				$("#applyOnTimeMinute").prop('min', 0);
				$("#applyOnTimeMinute").prop('value', 0);

			}
			else {
				if (self.isDownloadAMPM('AM')) //Download Date is in AM
				{
					if (self.amPmChk('AM') && (dateCompare($("#applyDatePicker").val(), $("#downloadDatePicker").val()) == 0)) //Apply On Date is in AM
					{
						$("#applyOnTimeHour").prop('min', $("#downloadHours").val());
						if ($("#applyOnTimeHour").val() < $("#downloadHours").val())
							$("#applyOnTimeHour").prop('value', $("#downloadHours").val());
						$("#applyOnTimeMinute").prop('min', ($("#downloadMinutes").val() + 1));
						if ($("#applyOnTimeHour").val() < ($("#downloadHours").val()) && $("#applyOnTimeMinute").val() < ($("#downloadMinutes").val()))
							$("#applyOnTimeMinute").prop('value', ($("#downloadMinutes").val()) + 1);

					}
					else //Apply On Date is in PM
					{
						$("#applyOnTimeHour").prop('min', 1);
						if ($("#applyOnTimeHour").val() < $("#downloadHours").val())
							$("#applyOnTimeHour").prop('value', $("#downloadHours").val());
						$("#applyOnTimeMinute").prop('min', 0);
						if ($("#applyOnTimeHour").val() < ($("#downloadHours").val()) && $("#applyOnTimeMinute").val() < ($("#downloadMinutes").val()))
							$("#applyOnTimeMinute").prop('value', ($("#downloadMinutes").val()) + 1);
					}
				}
				else //Download Date is in PM
				{
					if ($("#downloadHours").prop('value', 12))//Download Date is in 12th hour
					{

						$("#applyOnTimeHour").prop('min', 1);
						if ($("#applyOnTimeHour").val() < $("#downloadHours").val())
							$("#applyOnTimeHour").prop('value', $("#downloadHours").val());

						if ($("#downloadHours").val() == $("#applyOnTimeHour").val()) {
							$("#applyOnTimeMinute").prop('value', ($("#downloadMinutes").val()) + 1);
							if ($("#applyOnTimeMinute").val() <= $("#downloadMinutes").val())
								$("#applyOnTimeMinute").prop('value', ($("#downloadMinutes").val()) + 1);
						}

						else {
							$("#applyOnTimeMinute").prop('min', 0);
							if ($("#applyOnTimeMinute").val() < $("#applyOnTimeMinute").val())
								$("#applyOnTimeMinute").prop('value', ($("#downloadMinutes").val()) + 1);

						}
					}
					else {
						if (dateCompare($("#applyDatePicker").val(), $("#downloadDatePicker").val()) == 1) {
							$("#applyOnTimeHour").prop('min', 1);
							$("#applyOnTimeMinute").prop('min', 0);
							return;
						}
						$("#applyOnTimeHour").prop('min', $("#downloadHours").val());

						if ($("#applyOnTimeHour").val() < $("#downloadHours").val())
							$("#applyOnTimeHour").prop('value', $("#downloadHours").val());
						if ($("#applyOnTimeMinute").val() < $("#downloadMinutes").val())
							$("#applyOnTimeMinute").prop('value', ($("#downloadMinutes").val()) + 1);
						if ($("#downloadHours").val() == $("#applyOnTimeHour").val())
							$("#applyOnTimeMinute").prop('min', ($("#downloadMinutes").val()) + 1);
						else
							$("#applyOnTimeMinute").prop('min', 0);
					}
				}
			}
		}

		self.applyTimeHour_changeHandler = function () {
			if (dateCompare($("#applyDatePicker").val(), $("#downloadDatePicker").val()) == 0) //Apply On date is equal to Download On date
			{
				if ($("#downloadHours").val() == $("#applyOnTimeHour").val()) {
					$("#applyOnTimeMinute").prop('min', ($("#downloadMinutes").val()) + 1);
					if ($("#applyOnTimeHour").val() < $("#downloadHours").val())
						$("#applyOnTimeMinute").prop('value', ($("#applyOnTimeMinute").val()) + 1);
				}
				else {
					$("#applyOnTimeMinute").prop('min', 0)
				}
			}
		}

		//Date and numeric stepper changes/////
		//new changes
		var fromvalCheck = $("#periodFromDatePicker").val();
		$("#periodFromDatePicker").datepicker().on('changeDate', function (ev) {
			//set date new code
			var fromval = $("#periodFromDatePicker").val();
			$("#periodFromDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			var curt = moment().format(SHORT_DATE_FORMAT);
			if (moment(curt).isAfter(moment($("#periodFromDatePicker").val()).format(SHORT_DATE_FORMAT))) {
				$("#periodFromDatePicker").change();
			}
		});

		$("#periodFromDatePicker").change(function () {
			//set date new code
			var fromval = $("#periodFromDatePicker").val();
			$("#periodFromDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			if (fromval == fromvalCheck) {

			} else {
				$("#periodToDatePicker").val(moment($("#periodFromDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
			}
			var toval = $("#periodToDatePicker").val();
			var updateDate = moment().add(-slotTimezoneOffsetDiff, 'hours').format(SHORT_DATE_FORMAT);
			$("#periodToDatePicker").datepicker('update', toval);
			$("#periodToDatePicker").datepicker('setStartDate', $("#chkNowAndDateID").is(':checked') ? updateDate : toval);

		});

		$("#periodToDatePicker").datepicker().on('changeDate', function (ev) {
			//set date new code
			var fromval = $("#periodToDatePicker").val();
			$("#periodToDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			var curt = moment().format(SHORT_DATE_FORMAT);
			if (moment(curt).isAfter(moment($("#periodToDatePicker").val()).format(SHORT_DATE_FORMAT))) {
				$("#periodToDatePicker").change();
			}
		});

		$("#periodToDatePicker").change(function () {
			//set date new code
			var fromval = $("#periodToDatePicker").val();
			$("#periodToDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			var applyOnDate = dateCompareForSchedule($("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val(), $("#periodToDatePicker").val(), $("#toHours").val(), $("#toMinutes").val(), $("#toDateName").val())

			if (applyOnDate == 1) {
				var periodToDatePicker = $("#periodToDatePicker").val();
				var setApplyDatePicker = moment(periodToDatePicker).add('days', 1).format(SHORT_DATE_FORMAT);
				$("#applyDatePicker").datepicker('setStartDate', setApplyDatePicker);
			}
			else {
				$("#applyDatePicker").val(moment($("#periodToDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
				var applyDatePicker = $("#applyDatePicker").val();
				$("#applyDatePicker").datepicker('update', applyDatePicker);
				$("#applyDatePicker").datepicker('setStartDate', applyDatePicker);
			}

			var periodToDatePicker = $("#periodFromDatePicker").val();
			var setApplyDatePicker = moment(periodToDatePicker).add('days', 1).format(SHORT_DATE_FORMAT);
			var updateDate = moment().add(-slotTimezoneOffsetDiff, 'hours').format(SHORT_DATE_FORMAT);
			$("#periodToDatePicker").datepicker('setStartDate', applyDatePicker);
			$("#periodToDatePicker").datepicker('setStartDate', $("#chkNowAndDateID").is(':checked') ? updateDate : setApplyDatePicker);
		});

		$("#applyDatePicker").datepicker().on('changeDate', function (ev) {
			//set date new code
			var fromval = $("#applyDatePicker").val();
			$("#applyDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			var curt = moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT);
			if (moment(curt).isAfter(moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT))) {
				$("#applyDatePicker").change();
			}

		});

		$("#applyDatePicker").change(function () {
			//set date new code
			var fromval = $("#applyDatePicker").val();
			$("#applyDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			var curt = moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT);
			if (moment(curt).isAfter(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT))) {

			} else {
				if ($("#dateId").is(':checked') && self.dateVisibleOfDownload() == true) {
					var DownloadApplyOnDate = dateCompareForSchedule($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#dateAMPM").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val())
					if (DownloadApplyOnDate == 1) {
						openAlertpopup(1, 'applyon_less_than_downloadon');
					}
				}


			}
			var periodToDatePicker = $("#periodToDatePicker").val();
			$("#periodToDatePicker").datepicker('update', periodToDatePicker);

			var periodToDatePicker = $("#periodToDatePicker").val();
			var setApplyDatePicker = moment(periodToDatePicker).add('days', 1).format(SHORT_DATE_FORMAT);
			$("#applyDatePicker").datepicker('setStartDate', setApplyDatePicker);
			var downloadDatePickerValue = $("#downloadDatePicker").val();

			if ($("#dateId").is(':checked')) {
				$('#applyDatePicker').datepicker('setStartDate', downloadDatePickerValue);
			}
		});

		$("#downloadDatePicker").datepicker().on('changeDate', function (ev) {
			//set date new code
			var fromval = $("#downloadDatePicker").val();
			$("#downloadDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			var curt = moment().format(SHORT_DATE_FORMAT);
			if (moment(curt).isAfter(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT))) {
				$("#downloadDatePicker").change();
			}
		});

		$("#downloadDatePicker").change(function () {
			//set date new code
			var fromval = $("#downloadDatePicker").val();
			$("#downloadDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			var curt = moment().format(SHORT_DATE_FORMAT);
			if ($("#downloadMinutes").val() == 59) {
				if ($("#downloadHours").val() == 12) {
					$("#applyOnTimeHour").val(1);
					$("#applyOnTimeMinute").val(0);
					if ($('#downloadName :selected').text() == "PM") {
						$('#dateAMPM').val("PM").prop("selected", "selected");
					}
				} else if ($("#downloadHours").val() == 11) {
					$("#applyOnTimeHour").val(12);
					$("#applyOnTimeMinute").val(0);
					if ($('#downloadName :selected').text() == "PM") {
						$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
						$('#dateAMPM').val("AM").prop("selected", "selected");
					} else {
						$('#dateAMPM').val("PM").prop("selected", "selected");
						$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
					}
				} else {
					$("#applyOnTimeHour").val(parseInt($("#downloadHours").val()) + 1);
					$("#applyOnTimeMinute").val(0);
				}
			} else {
				var DownloadApplyOnDate = dateCompareForSchedule($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#dateAMPM").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val())
				if (DownloadApplyOnDate == 0) {

				} else {
					$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
					$("#applyOnTimeHour").val($("#downloadHours").val());
					$("#applyOnTimeMinute").val(parseInt($("#downloadMinutes").val()) + 1);
					$('#dateAMPM').val($("#downloadName").val()).prop("selected", "selected");
				}
			}
			if ($("#dateId").is(':checked')) {
				$('#applyDatePicker').datepicker('setStartDate', fromval);
			}

		});

		$("#downloadHours").on("blur", function () {

			var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val());
			if (DownloadApplyOnDate == 0) {

			} else {

				var dHr = $("#downloadHours").val();
				var dMinut = $("#downloadMinutes").val();
				var applyOnMinute = $("#applyOnTimeMinute").val();
				if ($("#downloadMinutes").val() == 59) {
					if ($("#downloadHours").val() == 12) {
						$("#applyOnTimeHour").val(1);
						$("#applyOnTimeMinute").val(0);
						if ($('#downloadName :selected').text() == "PM") {
							$('#dateAMPM').val("PM").attr("selected", "selected");
						}
					} else if ($("#downloadHours").val() == 11) {
						$("#applyOnTimeHour").val(12);
						$("#applyOnTimeMinute").val(0);
						if ($('#downloadName :selected').text() == "PM") {
							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#dateAMPM').val("AM").attr("selected", "selected");
							var applyDatePicker = $("#applyDatePicker").val();
							updateAndSetApplyDate(applyDatePicker);
						} else {
							$('#dateAMPM').val("PM").attr("selected", "selected");
							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
						}
					} else {
						$("#applyOnTimeHour").val(parseInt(dHr) + 1);
						$("#applyOnTimeMinute").val(0);
						$('#dateAMPM').val("PM").prop("selected", "selected");
						$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
					}
				} else {
					$("#applyOnTimeHour").val($("#downloadHours").val());
					if (parseInt(applyOnMinute) > parseInt(dMinut)) {
						$("#applyOnTimeMinute").val(parseInt(applyOnMinute));
					} else {
						$("#applyOnTimeMinute").val(parseInt(dMinut) + 1);
					}
				}
			}
		});

		$("#downloadMinutes").on("blur", function () {
			var downloadMinutes = $(this).val();
			var DownloadApplyOnDate = dateCompareForScheduleIffEqual($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#dateAMPM").val(), $("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val())
			if (DownloadApplyOnDate == 0) {

			} else {
				var dHr = $("#downloadHours").val();
				var dMinut = $("#downloadMinutes").val();
				var applyOnMinute = $("#applyOnTimeMinute").val();
				if ($("#downloadMinutes").val() == 59) {
					if ($("#downloadHours").val() == 12) {
						$("#applyOnTimeHour").val(1);
						$("#applyOnTimeMinute").val(0);
						if ($('#downloadName :selected').text() == "PM") {
							$('#dateAMPM').val("PM").attr("selected", "selected");
						}
					} else if ($("#downloadHours").val() == 11) {
						$("#applyOnTimeHour").val(12);
						$("#applyOnTimeMinute").val(0);
						if ($('#downloadName :selected').text() == "PM") {
							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#dateAMPM').val("AM").attr("selected", "selected");
							var applyDatePicker = $("#applyDatePicker").val();
							updateAndSetApplyDate(applyDatePicker);
						} else {
							$('#dateAMPM').val("PM").attr("selected", "selected");
							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
						}
					} else {
						$("#applyOnTimeHour").val(parseInt(dHr) + 1);
						$("#applyOnTimeMinute").val(0);
						$('#dateAMPM').val("PM").prop("selected", "selected");
						$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
					}
				} else {
					$("#applyOnTimeHour").val($("#downloadHours").val());

					if (parseInt(applyOnMinute) > parseInt(dMinut)) {
						$("#applyOnTimeMinute").val(parseInt(applyOnMinute));
					} else {
						$("#applyOnTimeMinute").val(parseInt(dMinut) + 1);
					}

				}
			}
		});


		/////////////////////////End of date and numeric stepper////////////////////////

		//////////////////////////////////Apply On////////////////////////////////////////////////////

		self.immediateApplyClick = function () {
			self.setEnabledStatus_Apply(false);
			currentSelectedApplyScheduleOption = "Immediate";
			var now = new Date();
			var dateobj = formatAMPM(now);
			$("#applyDatePicker").val(currentDate);
			$("#applyOnTimeHour").val(dateobj.hours);
			// $("#applyOnTimeMinute").val(parseInt(dateobj.minutes));
			if (parseInt(dateobj.minutes) < 59) {
				$("#applyOnTimeMinute").val(parseInt(dateobj.minutes) + 1);
			} else if (parseInt(dateobj.minutes) == 59) {
				$("#applyOnTimeMinute").val('0');
			} else {
				$("#applyOnTimeMinute").val(parseInt(dateobj.minutes));
			}

			$("#dateAMPM").val(dateobj.ampm);
			return true;
		}

		self.rbApplyDateTime = function () {

			self.setEnabledStatus_Apply(true);
			var dateApply = moment().format('MM/DD/YYYY');
			$("#datepicker1").prop('value', dateApply)


			var setdate = moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT);
			$('#applyDatePicker').datepicker({ autoclose: true, setDate: setdate });
			//$('#applyDatePicker').datepicker('update');

			//new code
			var dMinut = $("#downloadMinutes").val();



			if (dMinut == 59) {
				if ($("#downloadHours").val() == 11) {
					$("#applyOnTimeHour").val(12);
					$("#applyOnTimeMinute").val(0);
					if ($('#downloadName :selected').text() == "AM") {
						$('#dateAMPM').val("PM").prop("selected", "selected");
					} else if ($('#downloadName :selected').text() == "PM") {
						$('#dateAMPM').val("AM").prop("selected", "selected");
						$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
					}
				} else if ($("#downloadHours").val() == 12) {
					$("#applyOnTimeHour").val(1);
					$("#applyOnTimeMinute").val(0);
					$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
				}

			} else {
				$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
				$("#applyOnTimeHour").val($("#downloadHours").val());
				$("#applyOnTimeMinute").val(parseInt(dMinut) + 1);
			}





			currentSelectedApplyScheduleOption = "SpecifiedDate";
			var periodToDatePicker = $("#periodToDatePicker").val();
			var setApplyDatePicker = moment(periodToDatePicker).add('days', 1).format(SHORT_DATE_FORMAT);
			$("#applyDatePicker").datepicker('setStartDate', setApplyDatePicker);

			var downloadDateValue = $("#downloadDatePicker").val();
			var periodToDatePicker = $("#periodToDatePicker").val();
			if ($("#dateId").is(':checked')) {
				$('#applyDatePicker').datepicker('setStartDate', downloadDateValue);
			} else if ($("#nextAvailableId").is(':checked')) {

				if ($("#toCheckBox").is(':checked')) {
					$('#applyDatePicker').datepicker('setStartDate', setApplyDatePicker);
					$('#applyDatePicker').val(setApplyDatePicker);
				}
				$('#applyDatePicker').datepicker('setStartDate', setApplyDatePicker);
				$('#applyDatePicker').val(setApplyDatePicker);
				//$("#applyOnTimeHour").val($("#toHours").val());
				//$("#applyOnTimeMinute").val($("#toMinutes").val());
				//$('#dateAMPM').val($("#toDateName").val()).attr("selected", "selected");
				if ($("#nextRadioButtonID").is(':checked')) {
					var nextNumericValued = parseInt($("#nextNumericValued").val()) + 1;
					var setApplyDatePickerByNum = moment(currentDate).add('days', nextNumericValued).format(SHORT_DATE_FORMAT);
					$('#applyDatePicker').val(setApplyDatePickerByNum);
				}

				var now = new Date();
				var dateobj = formatAMPM(now);

				//$("#applyDatePicker").val(currentDate);
				// $('#applyDatePicker').datepicker('setStartDate', setApplyDatePicker);
				$("#applyOnTimeHour").val(dateobj.hours);
				// $("#applyOnTimeMinute").val(parseInt(dateobj.minutes) + 1);
				if (parseInt(dateobj.minutes) < 59) {
					$("#applyOnTimeMinute").val(parseInt(dateobj.minutes) + 1);
				} else if (parseInt(dateobj.minutes) == 59) {
					$("#applyOnTimeMinute").val('0');
				} else {
					$("#applyOnTimeMinute").val(parseInt(dateobj.minutes));
				}

				$("#dateAMPM").val(dateobj.ampm);
			}
			return true;
		}

		/////////////////////////////////////////////////////

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

						maxScheduleDownloadCount = data.systemConfiguration.ConfigValue;
					}
				}
			}

			var method = 'GetSystemConfiguration';
			var params = '{"token":"' + TOKEN() + '","category":"' + category + '","configName":"' + configName + '"}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		self.movePackagesRight = function () {
			if (gridSelectedDataForSwap.length > 0) {
				totalpackageassignment = gridSelectedDataForSwap.length + self.movedArray().length;
				if (totalpackageassignment > maxScheduleDownloadCount) {
					openAlertpopup(1, i18n.t('maximum_of_3_packages_can_be_selected_for_schedule', { maxScheduleDownloadCount: maxScheduleDownloadCount }, { lng: lang }));
					return;
				} else {
					var isDuplicatePackageFound = false;
					for (var i = 0; i < gridSelectedDataForSwap.length; i++) {
						var duplicatePackage = _.where(self.movedArray(), { PackageId: gridSelectedDataForSwap[i].PackageId });
						if (!_.isEmpty(duplicatePackage) && duplicatePackage.length > 0) {
							isDuplicatePackageFound = true;
							openAlertpopup(1, 'same_package_different_folder_job');
							continue;
						} else {
							var dataArrayForDownload = self.movedArray();
							dataArrayForDownload = dataArrayForDownload.length + 1;
							gridSelectedDataForSwap[i].packageSelected = false;
							self.movedArray.push(gridSelectedDataForSwap[i]);

							var selectedItem = new Object();
							selectedItem.PackageId = gridSelectedDataForSwap[i].PackageId;
							selectedItem.PackageName = gridSelectedDataForSwap[i].PackageName;
							selectedItem.FolderName = gridSelectedDataForSwap[i].FolderName;
							selectedItem.FolderId = gridSelectedDataForSwap[i].FolderId;
							selectedDownloadsActionsContent.push(selectedItem);

							var selectedsource = _.where(self.packageData(), { PackageId: gridSelectedDataForSwap[i].PackageId, FolderId: gridSelectedDataForSwap[i].FolderId });
							if (!_.isEmpty(selectedsource) && selectedsource.length > 0)
								self.packageData.remove(selectedsource[0]);
						}
					}
				}

				self.allavailablepackagesSelected(false);
				if (isDuplicatePackageFound == true) {
					var duplicatePackages = _.where(gridSelectedDataForSwap, { packageSelected: true });
					gridSelectedDataForSwap = [];
					gridSelectedDataForSwap = duplicatePackages;
				} else {
					gridSelectedDataForSwap = [];
					$("#btnForMoveRight").addClass('disabled');
				}

				if (isSelectedPaneFiltered) {
					clearCustomFilterInTable("selectpackagestable");
					clearSelectedPackagesPane();
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

				var isPOS = false;
				var isTablet = false;

				for (var j = 0; j < self.movedArray().length; j++) {
					var packageName = self.movedArray()[j].PackageName;
					var folderName = self.movedArray()[j].FolderName;
					var fileName = self.movedArray()[j].FileName;
					var component = self.movedArray()[j].Component;

					$("#packagespan" + j).prop('title', packageName);
					$("#folderspan" + j).prop('title', folderName);
					$("#versionspan" + j).prop('title', fileName);

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
				if (isPOS && isTablet) {
					koUtil.Component = ENUM.get("POS_Android");
				} else if (isPOS) {
					koUtil.Component = ENUM.get("POS");
				} else if (isTablet) {
					koUtil.Component = ENUM.get("Android");
				}
				if (koUtil.IsFutureScheduleAllowed) {
					$("#immediateId").prop("disabled", false);
					$("#dateApplyId").prop("disabled", false);
					$("#nextAvailableId").prop("disabled", false);
				} else if (!koUtil.IsFutureScheduleAllowed && isPOS && !isTablet) {
					$("#immediateId").prop("disabled", false);
					$("#dateApplyId").prop("disabled", false);
					$("#nextAvailableId").prop("disabled", false);
				} else {
					$("#immediateId").prop("disabled", true);
					$("#dateApplyId").prop("disabled", true);
					self.rbgApplyOnCheckbox('Immediately after download');
					currentSelectedApplyScheduleOption = "Immediate";
					$("#nextAvailableId").prop("disabled", true);
					if ($("#nextAvailableId").is(':checked')) {
						$("#nextAvailableId").prop("checked", false);
						$("#inlinedRadido2").prop("checked", false);
						$("#nowDownloadID").prop("checked", false);
						$("#chkNowAndDateID").prop("checked", false);
						$("#toCheckBox").prop("checked", false);
						$("#rdoDownloadPeriod").prop("checked", false);
						$("#maintainanceCheckbox").prop("checked", false);

						$("#maintainanceId").prop("checked", true);
					}
				}
			} else {
				openAlertpopup(1, 'no_row_selected');
			}
			self.SubmitButtonEnableDisable();
		}

		self.rightPackages = function () {
			State12 = $("#jqxgridAvailablePackage").jqxGrid('savestate');
			if ((gridSelectedDataForSwap.length > 0) && (State12.selectedrowindex != -1)) {
				var source = _.where(self.movedArray(), { PackageName: gridSelectedDataForSwap[0].PackageName });

				if (source == '') {
					var dataArrayForDownload = self.movedArray();
					dataArrayForDownload = dataArrayForDownload.length + 1;

					//------------User is not allowed to select more than 3 content files per job----------
					if (self.movedArray().length >= maxScheduleDownloadCount) {
						openAlertpopup(1, i18n.t('maximum_of_3_packages_can_be_selected_for_schedule', { maxScheduleDownloadCount: maxScheduleDownloadCount }, { lng: lang }));
					} else {
						if (isRightPackagesClick == "No") {    //Selection row and State maintain In grid
							rowIndexForHighlighted = undefined;
						} else {
							rowIndexForHighlighted = State12.selectedrowindex;
						}
						self.movedArray.push(gridSelectedDataForSwap[0]);
						var selectedsource = _.where(self.packageData(), { PackageName: gridSelectedDataForSwap[0].PackageName });
						self.packageData.remove(selectedsource[0]);
						//$("#jqxgridAvailablePackage").jqxGrid('clear');
						var str = '';
						str += '<div id="jqxgridAvailablePackage"></div>';
						$("#AvailablePackageDiv").empty();
						$("#AvailablePackageDiv").append(str);

						PackagesGrid('jqxgridAvailablePackage', self.packageData, []);
						if (State12) {
							$("#jqxgridAvailablePackage").jqxGrid('loadstate', State12);
						}

						gridSelectedDataForSwap = [];
						selectedHighlightedRowForGrid();  //Selection row and State maintain In grid

						$("#btnForMoveRight").addClass('disabled');
						//To Enable/Disble the Up/Down Arrows----                    
						if (selectedRowArrayForSwap.length <= 0 || selectedRowArrayForSwap.length == self.movedArray().length) {
							$("#btnMoveItemUp").addClass('disabled');
							$("#btnMoveItemDown").addClass('disabled');
						} else {
							var lastIndex = self.movedArray().length - 1;
							$("#btnMoveItemDown").removeClass('disabled');
							enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#btnMoveItemUp", "#btnMoveItemDown");
						}

						var isPOS = false;
						var isTablet = false;

						for (var j = 0; j < self.movedArray().length; j++) {
							var packageName = self.movedArray()[j].PackageName;
							var folderName = self.movedArray()[j].FolderName;
							var fileName = self.movedArray()[j].FileName;
							var component = self.movedArray()[j].Component;

							$("#packagespan" + j).prop('title', packageName);
							$("#folderspan" + j).prop('title', folderName);
							$("#versionspan" + j).prop('title', fileName);

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
						if (isPOS && isTablet) {
							koUtil.Component = ENUM.get("POS_Android");
						} else if (isPOS) {
							koUtil.Component = ENUM.get("POS");
						} else if (isTablet) {
							koUtil.Component = ENUM.get("Android");
						}
						if (koUtil.IsFutureScheduleAllowed) {
							$("#immediateId").prop("disabled", false);
							$("#dateApplyId").prop("disabled", false);
							$("#nextAvailableId").prop("disabled", false);
						} else if (!koUtil.IsFutureScheduleAllowed && isPOS && !isTablet) {
							$("#immediateId").prop("disabled", false);
							$("#dateApplyId").prop("disabled", false);
							$("#nextAvailableId").prop("disabled", false);
						} else {
							$("#immediateId").prop("disabled", true);
							self.rbgApplyOnCheckbox('Immediately after download');
							currentSelectedApplyScheduleOption = "Immediate";
							$("#dateApplyId").prop("disabled", true);
							$("#nextAvailableId").prop("disabled", true);
							if ($("#nextAvailableId").is(':checked')) {
								$("#nextAvailableId").prop("checked", false);
								$("#inlinedRadido2").prop("checked", false);
								$("#nowDownloadID").prop("checked", false);
								$("#chkNowAndDateID").prop("checked", false);
								$("#toCheckBox").prop("checked", false);
								$("#rdoDownloadPeriod").prop("checked", false);
								$("#maintainanceCheckbox").prop("checked", false);

								$("#maintainanceId").prop("checked", true);
							}
						}

						clearMultiSelectedData('jqxgridAvailablePackage');
					}
				} else {
					openAlertpopup(1, 'no_row_selected');

				}
			} else {
				rowIndexForHighlighted = State12.selectedrowindex;//Selection row and State maintain In grid
				openAlertpopup(1, 'no_row_selected');
			}
			self.SubmitButtonEnableDisable();
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

			$("#btnMoveItemDown").addClass('disabled');
			$("#btnMoveItemUp").addClass('disabled');
			self.movedArray([]);
			self.movedArray(selectedpackages);
		}

		self.SelectAllAvailablePackages = function (data) {
			var availablepackages = self.packageData();

			if ($('#selectallaviailablepackages')[0].checked == true) {
				gridSelectedDataForSwap = [];
				var table = document.getElementById('avilablepackagestable');
				var tr = table.getElementsByTagName("tr");

				if (tr && tr.length > 0) {
					for (var i = 0; i < tr.length; i++) {
						if (tr[i].style.display != 'none') {
							var tdPackage = tr[i].getElementsByTagName("td")[1];
							var tdFolder = tr[i].getElementsByTagName("td")[2];
							if (tdPackage && tdFolder) {
								var spanPackage = tdPackage.getElementsByTagName("span")[0];
								var spanFolder = tdFolder.getElementsByTagName("span")[0];

								if (spanPackage && spanFolder) {
									var sourcePackage = spanPackage.innerHTML;
									var sourceFolder = spanFolder.innerHTML;
									if (!_.isEmpty(availablepackages) && availablepackages.length > 0) {
										var selectedSource = _.where(availablepackages, { PackageName: sourcePackage, FolderName: sourceFolder });
										if (!_.isEmpty(selectedSource) && selectedSource.length > 0) {
											selectedSource[0].packageSelected = true;
											gridSelectedDataForSwap.push(selectedSource[0]);
										}
										for (var l = 0; l < availablepackages.length; l++) {
											if (availablepackages[l].PackageName === sourcePackage && availablepackages[l].FolderName === sourceFolder) {
												availablepackages[l].packageSelected = true;
												break;
											}
										}
									}
								}
							}
						}
					}
				}

				if (!_.isEmpty(gridSelectedDataForSwap) && gridSelectedDataForSwap.length > 0) {
					$("#btnForMoveRight").removeClass('disabled');
					var filteredAvailablePackages = new Array();
					for (var j = 0; j < gridSelectedDataForSwap.length; j++) {
						filteredAvailablePackages.push(gridSelectedDataForSwap[j]);
					}
					self.packageData([]);
					self.packageData(filteredAvailablePackages);
				}
			} else {
				$("#btnForMoveRight").addClass('disabled');
				for (var k = 0; k < availablepackages.length; k++) {
					availablepackages[k].packageSelected = false;
					gridSelectedDataForSwap = [];
				}
				self.packageData([]);
				self.packageData(availablepackages);
			}
		}

		self.SelectPackageRow = function (data, index) {

			$("#tbodySelectedpack").children('tr').removeClass('refselection');
			$("#btnForMoveRight").removeClass('disabled');
			var id = '#packagecb' + index + '';
			if ($(id)[0].checked == true) {
				gridSelectedDataForSwap.push(data);
			} else {
				for (var i = 0; i < gridSelectedDataForSwap.length; i++) {
					if (data.PackageName == gridSelectedDataForSwap[i].PackageName) {
						gridSelectedDataForSwap.splice(i, 1);
					}
				}
				if (gridSelectedDataForSwap.length <= 0) {
					$("#btnForMoveRight").addClass('disabled');
				}
			}
		}

		self.SelectSelectedPackageRow = function (data, index) {
			$("#btnForMoveleft").removeClass('disabled');
			var id = '#selectedpackagecb' + index + '';

			if ($(id)[0].checked == true) {
				data.SelectedArrayIndex = index;
				selectedRowArrayForSwap.push(data);
			}
			else {
				for (var i = 0; i < selectedRowArrayForSwap.length; i++) {
					if (data.PackageName == selectedRowArrayForSwap[i].PackageName) {
						selectedRowArrayForSwap.splice(i, 1);
					}
				}
				if (selectedRowArrayForSwap.length == 0) {
					$("#btnForMoveleft").addClass('disabled');
				}

				//#Updating changed index into array "selectedRowArrayForSwap"
				var arr = self.movedArray();
				selectedRowArrayForSwap.forEach(function (element) {
					element.SelectedArrayIndex = getArrayIndexForKey(arr, 'PackageName', element.PackageName);
				});
			}

			if (isSelectedPaneFiltered || selectedRowArrayForSwap.length == 0 || (selectedRowArrayForSwap.length == self.movedArray().length)) {
				$("#btnMoveItemDown").addClass('disabled');
				$("#btnMoveItemUp").addClass('disabled');
				return;
			}
			//#Function call:----To Enable/Disble the Up/Down Arrows----
			var lastIndex = self.movedArray().length - 1;
			enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#btnMoveItemUp", "#btnMoveItemDown");
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

		self.leftPackages = function () {
			if (selectedRowArrayForSwap.length > 0) {
				for (var i = 0; i < selectedRowArrayForSwap.length; i++) {
					self.movedArray.remove(selectedRowArrayForSwap[i]);
					selectedRowArrayForSwap[i].packageSelected = false;
					self.packageData.push(selectedRowArrayForSwap[i]);
				}

				self.allselectedpackagesSelected(false);
				selectedRowArrayForSwap = [];
				selectedDownloadsActionsContent = [];
				$("#btnForMoveleft").addClass('disabled');
				$("#btnMoveItemUp").addClass('disabled');
				$("#btnMoveItemDown").addClass('disabled');

				if (isSelectedPaneFiltered) {
					clearCustomFilterInTable("selectpackagestable");
					clearSelectedPackagesPane();
					isSelectedPaneFiltered = false;
				}
				if (self.movedArray().length == 0) {
					$("#immediateId").prop("disabled", false);
					$("#dateApplyId").prop("disabled", false);
					return;
				}

				var isPOS = false;
				var isTablet = false;
				for (var j = 0; j < self.movedArray().length; j++) {

					var selectedItem = new Object();
					selectedItem.PackageId = self.movedArray()[j].PackageId;
					selectedItem.PackageName = self.movedArray()[j].PackageName;
					selectedItem.FolderName = self.movedArray()[j].FolderName;
					selectedItem.FolderId = self.movedArray()[j].FolderId;
					selectedDownloadsActionsContent.push(selectedItem);

					var packageName = self.movedArray()[j].PackageName;
					var folderName = self.movedArray()[j].FolderName;
					var fileName = self.movedArray()[j].FileName;
					var component = self.movedArray()[j].Component;

					$("#packagespan" + j).prop('title', packageName);
					$("#folderspan" + j).prop('title', folderName);
					$("#versionspan" + j).prop('title', fileName);

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
				if (isPOS && isTablet) {
					koUtil.Component = ENUM.get("POS_Android");
				} else if (isPOS) {
					koUtil.Component = ENUM.get("POS");
				} else if (isTablet) {
					koUtil.Component = ENUM.get("Android");
				}
				if (koUtil.IsFutureScheduleAllowed) {
					$("#immediateId").prop("disabled", false);
					$("#dateApplyId").prop("disabled", false);
					$("#nextAvailableId").prop("disabled", false);
				} else if (!koUtil.IsFutureScheduleAllowed && isPOS && !isTablet) {
					$("#immediateId").prop("disabled", false);
					$("#dateApplyId").prop("disabled", false);
					$("#nextAvailableId").prop("disabled", false);
				} else {
					$("#immediateId").prop("disabled", true);
					self.rbgApplyOnCheckbox('Immediately after download');
					currentSelectedApplyScheduleOption = "Immediate";
					$("#dateApplyId").prop("disabled", true);
					$("#nextAvailableId").prop("disabled", true);
					if ($("#nextAvailableId").is(':checked')) {
						$("#nextAvailableId").prop("checked", false);
						$("#inlinedRadido2").prop("checked", false);
						$("#nowDownloadID").prop("checked", false);
						$("#chkNowAndDateID").prop("checked", false);
						$("#toCheckBox").prop("checked", false);
						$("#rdoDownloadPeriod").prop("checked", false);
						$("#maintainanceCheckbox").prop("checked", false);

						$("#maintainanceId").prop("checked", true);
					}
				}

			} else {
				openAlertpopup(1, 'no_row_selected');
			}
			self.SubmitButtonEnableDisable();
		}

		self.clearTablefilter = function (tableid) {
			var remainingAvailablePackages = new Array();
			if (self.movedArray() && self.movedArray().length > 0) {
				for (var i = 0; i < packageDataClone.length; i++) {
					var source = _.where(self.movedArray(), { PackageId: packageDataClone[i].PackageId, FolderId: packageDataClone[i].FolderId });
					if (!source || source.length === 0) {
						remainingAvailablePackages.push(packageDataClone[i]);
					}
				}
				self.packageData(remainingAvailablePackages);
			} else {
				for (var j = 0; j < packageDataClone.length; j++) {
					remainingAvailablePackages.push(packageDataClone[j]);
					self.packageData(remainingAvailablePackages);
				}
			}
			clearCustomFilterInTable(tableid);
			if (isSelectedPaneFiltered) {
				clearSelectedPackagesPane();
				isSelectedPaneFiltered = false;
			}
		}

		self.customfilter = function (element, dataArray) {
			customTableFilter(element, dataArray, callBackOnCustomFilter);
		}

		self.customMultichoiceFilter = function (element, dataArray, gId) {
			customTableMultichoiceFilter(element, globalFoldersFilterArray, gId, callBackOnCustomFilter);
		}

		function callBackOnCustomFilter(isFilterApplied) {
			if (isFilterApplied) {
				isSelectedPaneFiltered = true;
				clearSelectedPackagesPane();
			} else {
				if (isSelectedPaneFiltered)
					clearSelectedPackagesPane();

				isSelectedPaneFiltered = false;
			}
		}

		//Removing checked array and disableing Up/Down arrows on Filter apply 
		function clearSelectedPackagesPane() {
			self.movedArray().forEach(function (element, index) {
				var id = '#selectedpackagecb' + index + '';
				$(id)[0].checked = false;
				element.actionSelected = false;
			});
			selectedRowArrayForSwap = [];
			//selectedDownloadsActionsContent = [];
			$("#btnForMoveleft").addClass('disabled');
			$("#btnMoveItemUp").addClass('disabled');
			$("#btnMoveItemDown").addClass('disabled');
		}

		self.moveItemsUP = function () {
			if (selectedRowArrayForSwap.length > 0) {
				var arr = self.movedArray();

				//#Sorting the selected array for swap, based on moved array index
				var sortedselectedRowArrayForSwap = _.sortBy(selectedRowArrayForSwap, 'SelectedArrayIndex');

				for (var i = 0; i < sortedselectedRowArrayForSwap.length; i++) {
					var index = getArrayIndexForKey(arr, 'PackageName', sortedselectedRowArrayForSwap[i].PackageName);
					arr.moveUp(arr[index]);
					self.movedArray(arr);
					selectedDownloadsActionsContent.moveUp(selectedDownloadsActionsContent[index]);
				}

				//#Updating changed index into array "selectedRowArrayForSwap"
				selectedRowArrayForSwap.forEach(function (element) {
					element.SelectedArrayIndex = getArrayIndexForKey(arr, 'PackageName', element.PackageName);
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
					var index = getArrayIndexForKey(arr, 'PackageName', sortedselectedRowArrayForSwap[i].PackageName);
					arr.moveDown(arr[index]);
					self.movedArray(arr);
					selectedDownloadsActionsContent.moveDown(selectedDownloadsActionsContent[index]);
				}

				//#Updating changed index into array "selectedRowArrayForSwap"
				selectedRowArrayForSwap.forEach(function (element) {
					element.SelectedArrayIndex = getArrayIndexForKey(arr, 'PackageName', element.PackageName);
				});

				//#Function call:----To Enable/Disble the Up/Down Arrows----
				var lastIndex = self.movedArray().length - 1;
				enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#btnMoveItemUp", "#btnMoveItemDown");
			}
			else {
				openAlertpopup(1, 'please_selct_row');
			}
		}

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
		self.SubmitButtonEnableDisable = function () {
			if (self.movedArray().length == 0) {
				$("#submitBtn").prop("disabled", true);
			} else {

				$("#submitBtn").prop("disabled", false);
				//$("#btnForMoveleft").removeClass('disabled');
			}
		}
		function packageIdsListClick(selectedPackageData) {
			var packageIdsList = new Array();
			var isPOS = false;
			var isTablet = false;

			for (i = 0; i < selectedPackageData.length; i++) {
				packageIdsList.push(selectedPackageData[i].PackageId);

				var ext = selectedPackageData[i].FileName.split('.').pop().toLowerCase();
				if (selectedPackageData[i].Component == ENUM.get("Android"))
					isTablet = true;
				else
					isPOS = true;
			}

			if (isPOS && isTablet)
				koUtil.Component = ENUM.get("POS_Android");
			else if (isPOS)
				koUtil.Component = ENUM.get("POS");
			else if (isTablet)
				koUtil.Component = ENUM.get("Android");

			return packageIdsList;
		}

		//validate Job Name
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

		////////////////////Popup//////////////////////////////////////////////////////////////////////////////////////
		self.openConfirmationPopup = function () {
			var selectedDevices = $("#jqxgridForSelectedDevices").jqxGrid('getdatainformation');
			if (selectedDevices && selectedDevices.rowscount <= 0) {
				openAlertpopup(1, 'no_devices_selected_for_scheduling_download');
				return;
			}
			$('#downloadScheduleModel').modal('show');
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

		self.previousClick = function () {
			isScheduleScreenLoadsFirstTime = false;
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
			getDownloadSelectScheduleValues();
		}

		$("#jobNameTxt").on("keyup", function () {

			if ($(this).val())
				$("#isJobNamevalidationMessage").hide();
			else
				$("#isJobNamevalidationMessage").show();
		});

		self.submitClick = function () {
			if ($("#tabSchedule").hasClass('active')) {
				var datainfo = $("#jqxgridForSelectedDevices").jqxGrid('getdatainformation');
				var scheduledownCount = datainfo.rowscount;
				var totalDevicesCount = 0;
				if ($("#nextAvailableId") != undefined && $("#nextAvailableId").is(':checked')) {
					self.slotAllowFailedDevicesVisible(true);
				}
				else {
					self.slotAllowFailedDevicesVisible(false);
				}


				var retval = checkError();
				if (datainfo.rowscount < 0) {
					openAlertpopup(1, 'no_devices_selected_for_scheduling_download');
					return;
				}

				//Get Percentage of selected devices count over TotalDevicesCount

				if (customerData[0].CustomerLicenseInfo && customerData[0].CustomerLicenseInfo.NumberOfDeviceCount) {
					if (totalDeviceRecords > 0) {
						totalDevicesCount = totalDeviceRecords;
					}
					else {
						totalDevicesCount = customerData[0].CustomerLicenseInfo.NumberOfDeviceCount;
					}
					if (scheduledownCount > 0 && totalDevicesCount > 0) {
						self.selectedDevicesPercentage(Math.round((scheduledownCount / totalDevicesCount) * 100));
					}
				}

				if (self.selectedDevicesPercentage() > 50) {
					var displayPercentage = 0;
					if (self.selectedDevicesPercentage() > 50 && self.selectedDevicesPercentage() < 75)
						displayPercentage = 50;
					else if (self.selectedDevicesPercentage() >= 75 && self.selectedDevicesPercentage() < 100)
						displayPercentage = 75;
					else if (self.selectedDevicesPercentage() == 100)
						displayPercentage = 100;

					$("#selectedDevicesCount").text(scheduledownCount);
					$("#totalDevicesCount").text(i18n.t('total_devices_count', { totalDevicesCount: totalDevicesCount }, { lng: lang }));
					$("#impactWarningMsg").text(i18n.t('create_job_IncludeInactive_download_MoreDevicesWarningMsg', { lng: lang }));
					$("#devicePercentageMsg").text(i18n.t('create_job_IncludeInactive_download_DevicesCountPercentage', { scheduledownCountPercentage: displayPercentage }, { lng: lang }));
					$("#confirmationMessage").text(i18n.t('create_job_download_confirmation_Message', { lng: lang }));
				}

				if (!($("#packageChkbox").is(':checked'))) {
					if (self.assignmentType() === "Packages" && self.movedArray().length <= 0) {
						openAlertpopup(1, 'please_select_the_package');
						return;
					} else if (self.assignmentType() === "Reference Sets" && referenceSetId <= 0) {
						openAlertpopup(1, 'please_select_a_reference_set');
						return;
					}
				}

				//------------get current date and compare with downloaded on date-----------------
				var currentDate = new Date();
				var todayDate = displayDateOnEditScheduleDownload(currentDate);

				//---------compare date for download on- Date to the current time------------
				var compareDate = dateCompareForSchedule($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(),
					todayDate.date, todayDate.hour, todayDate.min, todayDate.amPM);

				//---------Calculate the difference between the selected from date and todays date------------
				var hoursDiff = dateDifferenceForSchedule($("#periodFromDatePicker").val(), $("#fromHours").val(), $("#fromMinutes").val(), $("#downloadPeriodName").val(),
					todayDate.date, todayDate.hour, todayDate.min, todayDate.amPM);

				//---------compare date for Apply on date to the current time------------
				var applyOnDate = dateCompareForSchedule($("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val(),
					todayDate.date, todayDate.hour, todayDate.min, todayDate.amPM);

				//---------compare date for Apply on date to maintainance wondow date------------
				var dateApplyOnDate = dateCompareForSchedule($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(),
					$("#applyDatePicker").val(), $("#applyOnTimeHour").val(), $("#applyOnTimeMinute").val(), $("#dateAMPM").val());

				//--------- Calculate the time difference between the from and the to date selected. --------- //
				var timeDiff = dateDifferenceForSchedule($("#periodFromDatePicker").val(), $("#fromHours").val(), $("#fromMinutes").val(), $("#downloadPeriodName").val(),
					$("#periodToDatePicker").val(), $("#toHours").val(), $("#toMinutes").val(), $("#toDateName").val());

				var diffHours = AppConstants.get('SLOT_TIME_OFFSET');

				if (retval == null || retval == "") {
					if (includeInactiveDevicesForDownload == true) {
						if ($("#dateId").is(':checked') && compareDate == 0) {
							openAlertpopup(1, 'schedule_not_performed_for_past');
							return;
						} else
							//
							//  Compare the hours difference with slotTimezoneOffsetDiff provided from the database, 
							//  The value (hoursDiff) has to be lessthan the slotTimezoneOffsetDiff
							// 
							if (($("#chkNowAndDateID").is(':checked') && hoursDiff > slotTimezoneOffsetDiff)) {
								openAlertpopup(1, 'schedule_not_performed_for_past');
								return;
							} else
								///
								/// Check the 
								///
								if ($("#toCheckBox").is(':checked') && timeDiff < diffHours) {
									openAlertpopup(1, 'schedule_not_performed_for_past');
									return;
								} else
									if ($("#dateApplyId").is(':checked') && applyOnDate == 0) {
										openAlertpopup(1, 'installation_time_should_be_greater_than_current_time');
										return;
									} else if ($("#dateApplyId").is(':checked') && $("#dateId").is(':checked') && dateApplyOnDate == 1) {
										openAlertpopup(1, 'installation_cannot_be_scheduled_for_past_dates');
										return;
									} else {
										if (koUtil.Component == ENUM.get("POS_Android") && koUtil.IsFutureScheduleAllowed == false) {
											$("#dialogModel").modal('show');
										}
										else {
											self.openConfirmationPopup();
											$("#active").show();
											$("#inActive").hide();

											if (($("#packageChkbox").is(':checked'))) {
												$("#active").text(i18n.t('create_job_IncludeInactive_download_packages', { scheduledownCount: scheduledownCount }, { lng: lang }));
											} else {
												$("#active").text(i18n.t('create_job_IncludeInactive_download', { scheduledownCount: scheduledownCount }, { lng: lang }));
											}
										}
									}
					}
					else {
						if (($("#dateId").is(':checked') && compareDate == 0) ||
							($("#chkNowAndDateID").is(':checked') && dateDiff < slotTimezoneOffsetDiff)) {
							openAlertpopup(1, 'schedule_not_performed_for_past');
							return;
						} else if (($("#dateId").is(':checked') && compareDate == 0) ||
							($("#chkNowAndDateID").is(':checked') && dateDiff <= slotTimezoneOffsetDiff && dateDiff > diffHours)) {
							openAlertpopup(1, 'schedule_not_performed_for_past');
							return;
						} else if ($("#dateApplyId").is(':checked') && applyOnDate == 0) {
							openAlertpopup(1, 'installation_time_should_be_greater_than_current_time');
							return;
						} else if ($("#dateId").is(':checked') && dateApplyOnDate == 1) {
							openAlertpopup(1, 'installation_cannot_be_scheduled_for_past_dates');
							return;
						} else {
							if (koUtil.Component == ENUM.get("POS_Android") && koUtil.IsFutureScheduleAllowed == false) {
								$("#dialogModel").modal('show');
							}
							else {
								self.openConfirmationPopup();
								$("#active").hide();
								$("#inActive").show();
								if (($("#packageChkbox").is(':checked'))) {
									$("#inActive").text(i18n.t('create_job_exclude_inactive_devices_packages', { lng: lang }));
								} else {
									$("#inActive").text(i18n.t('create_job_exclude_inactive_devices', { lng: lang }));
								}

							}
						}
					}
				}
			}
		}


		//----------get curent datetime-------------
		function displayDateOnEditScheduleDownload(dateDetails) {
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

		self.isEndDateExists = ko.observable(false);

		self.showWarningPopup = function () {
			if (self.selectedDevicesPercentage() > 50) {
				$('#downloadScheduleModel').modal('hide');
				$('#downloadScheduleWarningModel').modal('show');
			}
			else {
				self.submitBtnClicked(false);
			}
		}

		self.submitBtnClicked = function (ignoreLimitCheck) {
			if (self.selectedDevicesPercentage() > 50)
				$('#downloadScheduleWarningModel').modal('hide');
			else
				$('#downloadScheduleModel').modal('hide');
			var downloadDateTime = new Date();
			var downloadDateTimeString = "";
			var dateApplyInDevice;
			var dateStart = new Date();
			var dateStart1 = new Date();
			var dateStartString = "";

			var time;
			var minute;
			var hour;
			var dateEnd = new Date();
			var dateEndString = "";

			var dateApply = new Date();

			//Download hours
			var downloadHoursParseInt = $("#downloadHours").val();
			var downloadHour = parseInt(downloadHoursParseInt);
			if (downloadHour == 12 && $('#downloadName :selected').text() == "AM") {
				downloadHour = 0;
			}
			else if ($('#downloadName :selected').text() == "PM") {
				if (downloadHour == 12)
					downloadHour = 12;
				else
					downloadHour = downloadHour + 12;
			}

			//From date 

			var fromHoursParseInt = $("#fromHours").val();
			var fromHour = parseInt(fromHoursParseInt);
			if (fromHour == 12 && $('#downloadPeriodName :selected').text() == "AM") {
				fromHour = 0;
			}
			else if ($('#downloadPeriodName :selected').text() == "PM") {
				if (fromHour == 12)
					fromHour = 12;
				else
					fromHour = fromHour + 12;
			}
			/////
			var date = moment().format(SHORT_DATE_FORMAT);
			var hours = moment().format('HH');
			var minutes = moment().format('mm');

			if (currentSelectedDownloadScheduleOption == "SpecifiedDate") {
				//ToDo to consider AM/PM
				downloadDateTime = getUtcDate1($("#downloadDatePicker").val(), downloadHour, $("#downloadMinutes").val());
				downloadDateTimeString = getlocaldate1($("#downloadDatePicker").val(), downloadHour, $("#downloadMinutes").val());
			} else if (currentSelectedDownloadScheduleOption == "DownloadWindow" && $("#rdoDownloadPeriod").is(':checked')) {
				dateStart = getUtcDate1(date, hours, minutes);
				dateStartString = getlocaldate1(date, hours, minutes);
			} else if (currentSelectedDownloadScheduleOption == "DownloadWindow" && $("#chkNowAndDateID").is(':checked')) {
				//ToDo to consider AM/PM
				dateStart = getUtcDate1($("#periodFromDatePicker").val(), fromHour, $("#fromMinutes").val())
				dateStartString = getlocaldate1($("#periodFromDatePicker").val(), fromHour, $("#fromMinutes").val());
				downloadDateTime = getUtcDate1(date, hours, minutes);
				downloadDateTimeString = getlocaldate1(date, hours, minutes);
			} else {
				downloadDateTime = getUtcDate1(date, hours, minutes);
				downloadDateTimeString = getlocaldate1(date, hours, minutes);
				console.log("Default downloadDateTimeString===" + downloadDateTimeString);
			}

			if ($("#toCheckBox").is(':checked') || $("#nextRadioButtonID").is(':checked')) {
				self.isEndDateExists(true);
			}

			if (self.isEndDateExists() == true) {
				var minute = 0;
				if ($("#nextRadioButtonID").is(':checked')) {
					hour = $("#fromHours").val();
					minute = $("#fromMinutes").val();
				}
				else {
					var hoursParseInt = $("#toHours").val();
					var hour = parseInt(hoursParseInt);
					if (hour == 12 && $('#toDateName :selected').text() == "AM") {
						hour = 0;
					}
					else if ($('#toDateName :selected').text() == "PM") {
						if (hour == 12)
							hour = 12;
						else
							hour = hour + 12;
					}
					minute = $("#toMinutes").val();
				}
				//hour = $("#fromHours").val();
				//minute = $("#fromMinutes").val();
				dateEnd = getUtcDate1($("#periodToDatePicker").val(), hour, minute);
				dateEndString = getlocaldate1($("#periodToDatePicker").val(), hour, minute);
			}

			if (currentSelectedApplyScheduleOption == "SpecifiedDate" && $("#applyDatePicker").val() != '') {
				//Apply hours
				var applyHoursParseInt = $("#applyOnTimeHour").val();
				var applyHour = parseInt(applyHoursParseInt);
				if (applyHour == 12 && $('#dateAMPM :selected').text() == "AM") {
					applyHour = 0;
				}
				else if ($('#dateAMPM :selected').text() == "PM") {
					if (applyHour == 12)
						applyHour = 12;
					else
						applyHour = applyHour + 12;
				}

				minute = $("#applyOnTimeMinute").val();
				dateApply = getUtcDate1($("#applyDatePicker").val(), applyHour, minute);
				dateApplyInDevice = getlocaldate1($("#applyDatePicker").val(), applyHour, minute);
			}

			if (currentSelectedApplyScheduleOption == "Immediate") {
				dateApply = downloadDateTime;
				dateApplyInDevice = downloadDateTimeString;
			}

			//var dateApplyInDevice = downloadDateTimeString;
			var scheduledReplaceDate = getUtcDate1(date, hours, minutes);
			var expirationDateInDeviceTimezone = getlocaldate1(date, hours, minutes);;
			console.log("createJSONTimeStamp(downloadDateTimeString)===" + createJSONTimeStamp(downloadDateTimeString));
			var CreateJobReq = new Object();
			CreateJobReq.ScheduledDate = CreatJSONDate(downloadDateTime);
			CreateJobReq.ScheduledDateInDevice = createJSONTimeStamp(downloadDateTimeString);
			//JIRA 4372 Fix
			//if ($("#dateId").is(':checked') && $("#downloadDatePicker").val()!=""){
			//    //download hours
			//    var downloadHoursParseInt = $("#downloadHours").val();
			//    var downloadHour = parseInt(applyHoursParseInt);
			//    if (downloadHour == 12 && $('#downloadName :selected').text() == "AM") {
			//        downloadHour = 0;
			//    }
			//    else if ($('#downloadName :selected').text() == "PM") {
			//        if (downloadHour == 12)
			//            downloadHour = 12;
			//        else
			//            downloadHour = downloadHour + 12;
			//    }

			//    var downloadminute = $("#downloadMinutes").val();
			//    dateApply = getUtcDate1($("#downloadDatePicker").val(), downloadHour, downloadminute);
			//    var downloadDatepic=  getlocaldate1($("#downloadDatePicker").val(), downloadHour, downloadminute);
			//    CreateJobReq.ScheduledDateInDevice = createJSONTimeStamp(downloadDatepic);
			//}
			var DownloadWindowInfo = new Object();
			var selector = new Object();
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
			CreateJobReq.ApplyDateInDevice = createJSONTimeStamp(dateApplyInDevice) //CreatJSONDate("2015-05-20T19:48:00");

			if ($("#packageChkbox").is(':checked')) {
				var packageIdsList = null;
			} else {
				var packageIdsList = packageIdsListClick(self.movedArray())
			}

			var ApplyScheduleOption;

			if ($("#immediateId").is(':checked')) {
				ApplyScheduleOption = ENUM.get('SCHEDULE_OPTION_IMMEDIATE');
			} if ($("#dateApplyId").is(':checked')) {
				ApplyScheduleOption = ENUM.get('SCHEDULE_OPTION_SPECIFIED_DATE');
			}

			CreateJobReq.ApplyScheduleOption = ApplyScheduleOption;
			CreateJobReq.DeviceActionTypes = null;
			CreateJobReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
			CreateJobReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

			CreateJobReq.JobName = $("#jobNameTxt").val().trim();
			CreateJobReq.JobType = ENUM.get('JOB_TYPE_DOWNLOAD');
			CreateJobReq.PackageIds = (packageIdsList && packageIdsList.length > 0) ? packageIdsList : [];
			CreateJobReq.PackageType = ENUM.get('Software');
			CreateJobReq.Packages = [];
			if (packageIdsList && packageIdsList.length > 0) {
				for (i = 0; i < packageIdsList.length; i++) {
					var packageInfo = {};
					packageInfo.PackageId = packageIdsList[i];
					packageInfo.Sequence = i + 1;
					CreateJobReq.Packages.push(packageInfo);
				}
			}
			CreateJobReq.ReccuranceOptionInfo = null;

			if ($("#maintainanceId").is(':checked')) {
				ScheduleOption = ENUM.get('SCHEDULE_OPTION_ON_NEXTMAINTAINANCE_WINDOW');
			} else if ($("#nextContactid").is(':checked')) {
				ScheduleOption = ENUM.get('SCHEDULE_OPTION_IMMEDIATE');
			} else if ($("#dateId").is(':checked')) {
				ScheduleOption = ENUM.get('SCHEDULE_OPTION_SPECIFIED_DATE');
			} else {
				ScheduleOption = ENUM.get('SCHEDULE_OPTION_AUTO_SCHEULE');
			}

			CreateJobReq.ScheduleOption = ScheduleOption;


			CreateJobReq.ScheduledReplaceDate = CreatJSONDate(scheduledReplaceDate);
			CreateJobReq.ExpirationDateInDevice = createJSONTimeStamp(expirationDateInDeviceTimezone);
			CreateJobReq.IsExpirationDateNone = false;

			CreateJobReq.Selector = selector;

			////////////////////////////Software mode and parameter mode/////////////////////////////////////
			var softwareModeParam;
			if ($("#packageChkbox").is(':checked') && $("#softwareAndParameter").is(':checked')) {
				if ($("#allDownloads").is(':checked')) {
					softwareModeParam = ENUM.get('SOFTWARE_MODE_FULL');
				} else {
					softwareModeParam = ENUM.get('SOFTWARE_MODE_PARTIAL');
				}
			} else {
				softwareModeParam = ENUM.get('SOFTWARE_MODE_NONE');
			}

			var parameterModeParam;
			if ($("#packageChkbox").is(':checked') && $("#onlyParameter").is(':checked')) {
				if ($("#allParameter").is(':checked')) {
					parameterModeParam = ENUM.get('PARAMETER_MODE_FULL');
				} else {
					parameterModeParam = ENUM.get('PARAMETER_MODE_PARTIAL');
				}
			} else {
				parameterModeParam = ENUM.get('PARAMETER_MODE_NONE');
			}

			CreateJobReq.ParameterMode = parameterModeParam;
			CreateJobReq.SoftwareMode = softwareModeParam;

			var jobCategory;
			if ($("#packageChkbox").is(':checked')) {
				jobCategory = ENUM.get('JOB_CATEGORY_ASSIGNED');
			} else {
				jobCategory = ENUM.get('JOB_CATEGORY_NORMAL');
			}

			CreateJobReq.JobCategory = jobCategory;
			CreateJobReq.Tag = $("#tagTxt").val();
			//////////////////////////// End of Software mode and parameter mode/////////////////////////////////////

			////////////////////////////////////////////////////Download window info/////////////////////////////////////
			if (currentSelectedDownloadScheduleOption == "DownloadWindow" && $("#chkNowAndDateID").is(':checked')) {
				DownloadWindowInfo.StartDate = createJSONTimeStamp(dateStartString);
			}
			//}
			if ($("#nextRadioButtonID").is(':checked') && $("#nextNumericValued").val() != 0) {
				var endDateValue = moment().add('days', $("#nextNumericValued").val()).format(LONG_DATETIME_FORMAT)
				DownloadWindowInfo.EndDate = createJSONTimeStamp(endDateValue);
			} else if (currentSelectedDownloadScheduleOption == "DownloadWindow" && $("#toCheckBox").is(':checked')) {

				minute = $("#toMinutes").val();
				DownloadWindowInfo.EndDate = createJSONTimeStamp(dateEndString);
			}

			var ISMHB;
			var NextNoOfDays
			if (currentSelectedDownloadScheduleOption == "DownloadWindow") {
				if ($("#maintainanceCheckbox").is(':checked')) {
					ISMHB = true;
				} else {
					ISMHB = false;
				}
			} else {
				ISMHB = false;
			}
			DownloadWindowInfo.IsMHB = ISMHB;

			if ($("#allowFailedDevices").is(':checked')) {
				isSlotIncludeFailure = false;
			} else {
				isSlotIncludeFailure = true;
			}
			DownloadWindowInfo.IsSlotIncludeFailure = isSlotIncludeFailure;

			if ($("#nextRadioButtonID").is(':checked')) {
				NextNoOfDays = $("#nextNumericValued").val();
			} else {
				NextNoOfDays = 0;
			}
			DownloadWindowInfo.NextNoOfDays = NextNoOfDays;
			CreateJobReq.DownloadWindowInfo = DownloadWindowInfo;
			CreateJobReq.IsFromLibrary = isFromDownloadLibrary;
			CreateJobReq.Component = (packageIdsList && packageIdsList.length > 0) ? koUtil.Component : '';
			CreateJobReq.IgnoreLimitCheck = ignoreLimitCheck;
			CreateJobReq.IsForceInstall = $('#chkForceInstall').is(':checked') ? true : false;
			CreateJobReq.ReferenceSetId = self.assignmentType() === "Reference Sets" ? referenceSetId : 0;

			function callbackFunction(data, error) {
				if (data) {

					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

						createJobId = data.createJobResp.JobId;

						failedDeviceCount = data.createJobResp.FailedDevicesCount;
						succeedDeviceCount = data.createJobResp.SucceededDevicesCount;

						koUtil.jobNameVal = '';
						self.isNewJobCreatedStatus(true);

						$("#submitBtn").prop("disabled", true);
						$("#nextBtn").hide();



						if ($("#packageChkbox").is(':checked')) {
							$("#tabSelectedDevice").removeClass('active');
							$("#tabSelectedDevice").addClass("disabled");
							$("#tabSchedule").addClass("disabled");

							$("#selectedDevicesGrid").hide();
							$("#schduleGrid").show();
							$("#packageChkbox").prop("disabled", true);
							$("#tagTxt").prop("disabled", true);
							$("#jobNameTxt").prop("disabled", true);
							$("#showOverrite").prop("disabled", true);
							$("#schduleGrid").find("input, button, submit, textarea, select").prop("disabled", true);
							$("#accordionSchedulePanel").addClass("disabled");
							$("#accordionPackagePanel").addClass("disabled");
							$("#previousBtn").addClass("disabled");
						} else {
							//$("#showHideResetExportbtn").show();
							$("#tabSelectedDevice").removeClass('active');
							$("#tabSelectedDevice").addClass("disabled");
							$("#tabSchedule").addClass("disabled");
							$("#showOverrite").prop("disabled", true);
							$("#jobNameTxt").prop("disabled", true);
							$("#tagTxt").prop("disabled", true);
							$("#packageChkbox").prop("disabled", true);
							// $("#collapseOne").prop("disabled", true);
							$("#collapseTwo").prop("disabled", true);
							$("#schduleGrid").find("input, button, submit, textarea, select").prop("disabled", true);
							$("#accordionSchedulePanel").addClass("disabled");
							$("#accordionPackagePanel").addClass("disabled");
							//("#tabSchedule").removeClass('active');
							$("#selectedDevicesGrid").hide();
							//$("#schduleGrid").hide();
							$("#previousBtn").addClass("disabled");
						}
						var message = i18n.t(('download_job_for_scheduling'), { succeedDeviceCount: succeedDeviceCount, totalDeviceCount: totalDeviceCount }, { lng: lang });
						openAlertpopup(0, i18n.t(message));
						$('#newJobBtn').removeAttr('disabled');
						return;

					} else if (data.responseStatus.StatusCode == AppConstants.get('SYSTEM_BUSY')) {
						$("#newJobBtn").prop("disabled", false);
					} else if (data.responseStatus.StatusCode == AppConstants.get('JOB_NAME_ALREADY_EXISTS')) {
						openAlertpopup(1, data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('Create_Job_Failed_Zero_Devices_Scheduled')) {
						openAlertpopup(2, data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('CREATE_JOB_FAILED')) {
						openAlertpopup(2, data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('NOT_MORE_DEVICES')) {
						openAlertpopup(2, data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Exists')) {
						openAlertpopup(2, 'No_Eligible_Device_Exists_Include_Inactive_Devices');
					} else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Excluding_Inactive_Devices')) {
						openAlertpopup(2, 'No_Eligible_Device_Exists_Exclude_Inactive_Devices');
					} else if (data.responseStatus.StatusCode == AppConstants.get('Package_Does_Not_Support')) {
						openAlertpopup(2, data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('Devices_With_Different_Model_Selected')) {
						openAlertpopup(2, data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('NONE_OF_THE_SELECTED_DEVICES_HAVE_PACKAGES_ASSIGNED')) {
						openAlertpopup(2, 'none_of_the_selected_devices_have_packages_assigned');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_MAX_DOWNLOADS_ALLOWED_PER_JOB_LIMIT_EXCEEDED')) {
						var value = maximumDownloadsPerJob;
						var message = i18n.t(('max_downloads_per_job_exceeded'), { value: value }, { lng: lang });
						$("#maxDownloadPerJobMsg").text(message);
						$("#limitExceedModel").modal('show');
					}
				}
				if (error) {
					retval = "";
				}
			}

			var method = 'CreateJob';
			var params = '{"token":"' + TOKEN() + '","createJobReq":' + JSON.stringify(CreateJobReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
			// }
		}

		//New Job
		//self.newJobClick = function () {

		//    fetchGenerateJobName(self.jobName, self.isNewJobCreatedStatus)
		//}
		//Generate Job Name




		//Popup Availavble Package Grid

		function packagesGridModel(gID, packageData, movedArray) {
			// prepare the data
			PackageType = 1;
			IsEnabledForAutomation = true;
			var getPackagesAndKeysForDevicesReq = new Object();
			var selector = new Object();

			//if Advance search is applied in schedule screen then resetting selected packages
			if (isSearchAppliedForSchedule) {
				selectedDownloadsActionsContent = [];
				globalSchedulePackages = new Array();
			}

			var ColumnSortFilterObj = new Object();
			ColumnSortFilterObj.SortList = null;
			ColumnSortFilterObj.FilterList = null;
			ColumnSortFilterObj.GridId = 'DeviceSearchFilter';
			if (koUtil.isDeviceProfile() == true) {
				selector.SelectedItemIds = koUtil.deviceProfileUniqueDeviceId == null ? null : [koUtil.deviceProfileUniqueDeviceId];
				selector.UnSelectedItemIds = null;
				getPackagesAndKeysForDevicesReq.SchedulePackages = selectedDownloadsActionsContent;
				getPackagesAndKeysForDevicesReq.DeviceSearch = koUtil.deviceProfileUniqueDeviceId == null ? ADSearchUtil.deviceSearchObj : null;
				getPackagesAndKeysForDevicesReq.ColumnSortFilter = ColumnSortFilterObj;
				getPackagesAndKeysForDevicesReq.IsFromLibrary = isFromDownloadLibrary;
			} else if (isFromDownloadLibrary) {
				selector.SelectedItemIds = null;
				selector.UnSelectedItemIds = null;
				if (selectedDownloadsActionsContent && selectedDownloadsActionsContent.length == 0 && globalSchedulePackages && globalSchedulePackages.length > 0) {
					for (var i = 0; i < globalSchedulePackages.length; i++) {
						selectedDownloadsActionsContent.push(globalSchedulePackages[i]);
					}
				}
				getPackagesAndKeysForDevicesReq.SchedulePackages = selectedDownloadsActionsContent;
				getPackagesAndKeysForDevicesReq.DeviceSearch = (selectedDownloadsActionsContent && selectedDownloadsActionsContent.length > 0) ? null : ADSearchUtil.deviceSearchObj;
				getPackagesAndKeysForDevicesReq.ColumnSortFilter = ColumnSortFilterObj;
				getPackagesAndKeysForDevicesReq.IsFromLibrary = (selectedDownloadsActionsContent && selectedDownloadsActionsContent.length > 0) ? isFromDownloadLibrary : false;
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

				getPackagesAndKeysForDevicesReq.SchedulePackages = selectedDownloadsActionsContent;
				getPackagesAndKeysForDevicesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;

				var gridStorageDeviceSearch = JSON.parse(sessionStorage.getItem("Devicejqxgrid" + "gridStorage"));
				if (gridStorageDeviceSearch && gridStorageDeviceSearch.length > 0 && gridStorageDeviceSearch[0].columnSortFilter) {
					columnSortFilter = gridStorageDeviceSearch[0].columnSortFilter;
				} else {
					columnSortFilter = new Object();
				}
				getPackagesAndKeysForDevicesReq.ColumnSortFilter = columnSortFilter;
				getPackagesAndKeysForDevicesReq.IsFromLibrary = isFromDownloadLibrary;
			}

			getPackagesAndKeysForDevicesReq.PackageType = ENUM.get('Software')
			getPackagesAndKeysForDevicesReq.DownloadType = "0";
			getPackagesAndKeysForDevicesReq.IsFromSoftwareAssignment = false;
			getPackagesAndKeysForDevicesReq.Selector = selector;

			var param = new Object();
			param.token = TOKEN();
			param.getPackagesAndKeysForDevicesReq = getPackagesAndKeysForDevicesReq;


			var callBackfunction = function (data, error) {
				$("#loadingDiv").hide();
				if (data) {
					if (data.getPackagesAndKeysForDevicesResp) {
						data.getPackagesAndKeysForDevicesResp = $.parseJSON(data.getPackagesAndKeysForDevicesResp);

						if (data.getPackagesAndKeysForDevicesResp.AvailablePackages) {
							for (var i = 0; i < data.getPackagesAndKeysForDevicesResp.AvailablePackages.length; i++) {
								data.getPackagesAndKeysForDevicesResp.AvailablePackages[i].packageSelected = false;
							}
							packageData(data.getPackagesAndKeysForDevicesResp.AvailablePackages);
							packageDataClone = data.getPackagesAndKeysForDevicesResp.AvailablePackages;
						} else {
							packageData([]);
							packageDataClone = [];
						}
						koUtil.IsFutureScheduleAllowed = false;
						if (data.getPackagesAndKeysForDevicesResp.IsFutureScheduleEnable != undefined && data.getPackagesAndKeysForDevicesResp.IsFutureScheduleEnable == true) {
							koUtil.IsFutureScheduleAllowed = true;
						}
						if (data.getPackagesAndKeysForDevicesResp.SelectedPackages) {
							for (var j = 0; j < data.getPackagesAndKeysForDevicesResp.SelectedPackages.length; j++) {
								data.getPackagesAndKeysForDevicesResp.SelectedPackages[j].packageSelected = false;
							}
							movedArray(data.getPackagesAndKeysForDevicesResp.SelectedPackages);

							$("#submitBtn").prop("disabled", false);

							var isPOS = false;
							var isTablet = false;
							for (var k = 0; k < movedArray().length; k++) {
								var packageName = movedArray()[k].PackageName;
								var folderName = movedArray()[k].FolderName;
								var fileName = movedArray()[k].FileName;
								var component = movedArray()[k].Component;

								$("#packagespan" + k).prop('title', packageName);
								$("#folderspan" + k).prop('title', folderName);
								$("#versionspan" + k).prop('title', fileName);

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
							if (isPOS && isTablet) {
								koUtil.Component = ENUM.get("POS_Android");
							} else if (isPOS) {
								koUtil.Component = ENUM.get("POS");
							} else if (isTablet) {
								koUtil.Component = ENUM.get("Android");
							}
							if (koUtil.IsFutureScheduleAllowed) {
								$("#immediateId").prop("disabled", false);
								$("#dateApplyId").prop("disabled", false);
								$("#nextAvailableId").prop("disabled", false);
							} else if (!koUtil.IsFutureScheduleAllowed && isPOS && !isTablet) {
								$("#immediateId").prop("disabled", false);
								$("#dateApplyId").prop("disabled", false);
								$("#nextAvailableId").prop("disabled", false);
							} else {
								$("#immediateId").prop("disabled", true);
								$("#dateApplyId").prop("disabled", true);
								$("#nextAvailableId").prop("disabled", true);
								if ($("#nextAvailableId").is(':checked')) {
									$("#nextAvailableId").prop("checked", false);
									$("#inlinedRadido2").prop("checked", false);
									$("#nowDownloadID").prop("checked", false);
									$("#chkNowAndDateID").prop("checked", false);
									$("#toCheckBox").prop("checked", false);
									$("#rdoDownloadPeriod").prop("checked", false);
									$("#maintainanceCheckbox").prop("checked", false);
									$("#maintainanceId").prop("checked", true);
								}
							}
						} else {
							movedArray = new Array();
							selectedDownloadsActionsContent = [];
						}
						//PackagesGrid('jqxgridAvailablePackage', packageData(), []);
						if (data.getPackagesAndKeysForDevicesResp.SelectedPackages && data.getPackagesAndKeysForDevicesResp.SelectedPackages.length > 0) {
							koUtil.movedArrayFlag = 1;
						} else {
							koUtil.movedArrayFlag = 0;
						}
						if (data.getPackagesAndKeysForDevicesResp.AvailablePackages && data.getPackagesAndKeysForDevicesResp.AvailablePackages.length > 0) {
							koUtil.availableArrayFlag = 1;
						} else {
							koUtil.availableArrayFlag = 0;
						}

						if (data.getPackagesAndKeysForDevicesResp.AvailablePackages == null && isMiddleMenuClicked == true) {
							koUtil.isFromScheduleDownloadsScreen = 1;
							isMiddleMenuClicked = false;
							openAlertpopup(1, 'no_package_qualify_for_the_selected_device_models');
						} else {
							koUtil.isFromScheduleDownloadsScreen = 0;
						}
					} else {
						var foldersFilterArray = new Array();
						if (globalFoldersArray && globalFoldersArray.length > 0) {
							for (var m = 0; m < globalFoldersArray.length; m++) {
								var folderObject = new Object();
								folderObject.Id = globalFoldersArray[m].FolderId;
								folderObject.Name = "Folder Name";
								folderObject.ControlValue = globalFoldersArray[m].FolderName;
								folderObject.Value = globalFoldersArray[m].FolderName;
								foldersFilterArray.push(folderObject);
							}
						}
						PackagesGrid('jqxgridAvailablePackage', [], foldersFilterArray);
					}
				} else if (error) {
					PackagesGrid('jqxgridAvailablePackage', [], foldersFilterArray);
				}
			}

			var method = 'GetPackagesAndKeysForDevices';
			var params = '{"token":"' + TOKEN() + '","getPackagesAndKeysForDevicesReq":' + JSON.stringify(getPackagesAndKeysForDevicesReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

		}

		function PackagesGrid(gID, PackageData, foldersFilterArray) {
			var sarr = self.movedArray();
			for (var i = 0; i < sarr.length; i++) {
				for (var j = 0; j < PackageData.length; j++) {
					if (sarr[i].PackageId == PackageData[j].PackageId) {
						PackageData.splice(j, 1);
					}
				}
			}
			var filterObj;
			var selectedArray = new Array();
			var selectedRowID;
			var HighlightedRowID;
			var rowsToColor = [];
			var RowID;
			var localData;
			var source =
			{
				dataType: "json",
				localdata: PackageData,
				root: 'AvailablePackages',
				contentType: 'application/json',
				dataFields: [
					{ name: 'PackageId', map: 'PackageId' },
					{ name: 'PackageName', map: 'PackageName' },
					{ name: 'FileName', map: 'FileName' },
					{ name: 'Component', map: 'Component' },
					{ name: 'FolderName', map: 'Folder>FolderName' },
					{ name: 'FolderId', map: 'Folder>FolderId' }
				],

			};


			$("#jqxgridAvailablePackage").on("bindingcomplete", function (event) {        // On filter if rowcount is zero
				var datainfo = $("#jqxgridAvailablePackage").jqxGrid('getdatainformation');
				if (datainfo.rowscount == 0) {
					$("#btnForMoveRight").addClass('disabled');
				}
				totalRowCount = datainfo.rowscount;
			});

			//for filter UI
			var buildFilterPanel = function (filterPanel, datafield) {
				wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
			}

			var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
				multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gID, foldersFilterArray, true);
			}

			var dataAdapter = new $.jqx.dataAdapter(source);


			this.gID = $('#jqxgridAvailablePackage');

			$("#jqxgridAvailablePackage").jqxGrid(
				{
					width: "100%",
					height: "140px",
					source: dataAdapter,
					altrows: true,
					sortable: true,
					filterable: true,
					selectionmode: 'singlerow',
					theme: AppConstants.get('JQX-GRID-THEME'),
					autoshowcolumnsmenubutton: false,
					showsortmenuitems: false,
					columnsResize: true,
					enabletooltips: true,
					rowsheight: 32,
					autoshowfiltericon: true,

					columns: [
						{
							text: '', datafield: 'PackageId', editable: false, width: 'auto', resizable: false, hidden: true, filterable: false, sortable: false, menu: false,

						},
						{
							text: 'Package Name', datafield: 'PackageName', editable: false, minwidth: 230, width: 230,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						},
						{
							text: 'Folder', datafield: 'FolderName', editable: false, minwidth: 100, width: 'auto',
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanelMultiChoice(filterPanel, datafield, foldersFilterArray);
							}
						},
						{
							text: 'File', datafield: 'FileName', editable: false, minwidth: 150, width: 'auto',
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						}
					]
				}).on({
					filter: function (e) {
						gridSelectedDataForSwap = [];
						gridSetRowDetailsforAvailGrid(e);
						rowIndexForHighlighted = undefined;
						//isFilterData = true;
					}
				});



			$("#jqxgridAvailablePackage").bind('rowselect', function (event) {

				$("#btnForMoveRight").removeClass('disabled');
				var selectedRow = new Object();
				var datainformations = $("#jqxgridAvailablePackage").jqxGrid('getdatainformation');
				var rowscounts = datainformations.rowscount;

				selectedRow.PackageId = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'PackageId');
				selectedRow.PackageName = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'PackageName');
				selectedRow.FolderName = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'FolderName');
				selectedRow.FolderId = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'FolderId');
				selectedRow.FileName = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'FileName');
				selectedRow.IsEnabledForAutomation = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'IsEnabledForAutomation');
				selectedRow.Component = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'Component');
				//var displayedRows = $("#jqxgridAvailablePackage").jqxGrid('getdisplayrows');



				gridSelectedDataForSwap = new Array();
				gridSelectedDataForSwap.push(selectedRow);
				rowIndexForHighlighted = event.args.rowindex;
				//alert(rowIndexForHighlighted);
				//if (isFilterData==true){
				//var selectedRow1 = $("#jqxgridAvailablePackage").jqxGrid('getboundrows')[rowIndexForHighlighted];
				////alert(JSON.stringify(selectedRow1));

				//var displayedRows = $("#jqxgridAvailablePackage").jqxGrid('getdisplayrows');

				//var rowVisibleIndex = -1;
				//for (var i = 0; i < displayedRows.length; i++) {
				//    if (displayedRows[i].PackageId === selectedRow1.PackageId) {
				//        rowVisibleIndex = i;
				//        //rowIndexForHighlighted = rowVisibleIndex;
				//        if (rowVisibleIndex == (displayedRows.length-1)) {

				//        } else {
				//            for (j = 0; j < totalRowCount; j++) {
				//                var packId = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', j, 'PackageId');
				//                if (displayedRows[i].PackageId == packId) {
				//                    arrayOldIndex.push(i);
				//                }
				//            }
				//        }
				//        break;
				//    }
				//}
				//    }

				if ((rowscounts - 1) == rowIndexForHighlighted) {
					isRightPackagesClick = "No";
				} else {
					isRightPackagesClick = "Yes";
				}
			});

		}
		//end grid
		seti18nResourceData(document, resourceStorage);

		///--START----Res-storing previous selected schedule value
		if (!_.isEmpty(scheduleValuesGlobalObject) && !_.isEmpty(scheduleValuesGlobalObject.scheduleDownload)) {

			if (scheduleValuesGlobalObject.scheduleDownload.tagText)
				$("#tagTxt").val(scheduleValuesGlobalObject.scheduleDownload.tagText);

			if (!_.isEmpty(scheduleValuesGlobalObject.scheduleDownload.packageParamSelection)) {
				var packageParamSelectionValues = scheduleValuesGlobalObject.scheduleDownload.packageParamSelection;
				if (packageParamSelectionValues.packageChkbox) {
					$("#packageChkbox").prop("checked", true);
					self.packagesAssignedClick();

					if (packageParamSelectionValues.softwareAndParameter) {
						self.softwareParameterClick();
					}
					else if (packageParamSelectionValues.onlyParameter) {
						self.onlyParameterClick();
						if (packageParamSelectionValues.allParameter) {
							self.allParameterClick();
						}
						else if (packageParamSelectionValues.onlyChangedParameter) {
							self.onlyChangeParameter();
						}
					}
				}
			}

			if (!_.isEmpty(scheduleValuesGlobalObject.scheduleDownload.downLoadOn)) {
				var downloadOnValues = scheduleValuesGlobalObject.scheduleDownload.downLoadOn;
				if (downloadOnValues.maintainanceId) {
					//$("#maintainanceId").prop("checked", true);
					self.rbgDownloadOnCheckbox($("#maintainanceId").val());
					self.maintainanceClick()
				}
				else if (downloadOnValues.dateId) {
					self.rbgDownloadOnCheckbox($("#dateId").val());
					self.dateClick();
					//$("#downloadDatePicker").val(downloadOnValues.downloadDatePicker);
					$('#downloadDatePicker').prop('value', downloadOnValues.downloadDatePicker);
					$("#downloadHours").val(downloadOnValues.downloadHours);
					$("#downloadMinutes").val(downloadOnValues.downloadMinutes);
					$("#downloadName").val(downloadOnValues.downloadName);
				}
				else if (downloadOnValues.nextContactid) {
					self.rbgDownloadOnCheckbox($("#nextContactid").val());
					self.contactClick();
				}
				else if (downloadOnValues.nextAvailableId) {
					self.rbgDownloadOnCheckbox($("#nextAvailableId").val());
					self.nextAvailableFreeSlot();
					if (downloadOnValues.nextRadioButtonID) {
						self.rbDownloadPeriod($("#nextRadioButtonID").val());
						self.rbNext_clickHandler();
						$("#nextNumericValued").val(downloadOnValues.nextNumericValued);
					}
					else if (downloadOnValues.inlinedRadido2) {
						self.rbDownloadPeriod($("#inlinedRadido2").val());
						//Download period
						self.downloadPeriodClick();
						if (downloadOnValues.fromID) {
							self.chkFrom($("#fromID").val());
							self.chkFromOnClick();
							if (downloadOnValues.nowDownloadID) {
								self.chkNowAndDate($("#nowDownloadID").val());
								self.rbNow_clickHandler();
							}
							else if (downloadOnValues.chkNowAndDateID) {
								self.chkNowAndDate($("#chkNowAndDateID").val());
								self.rbStartDate_clickHandler();
								$("#periodFromDatePicker").val(downloadOnValues.periodFromDatePicker);
								$("#fromHours").val(downloadOnValues.fromHours);
								$("#fromMinutes").val(downloadOnValues.fromMinutes);
								$("#downloadPeriodName").val(downloadOnValues.downloadPeriodName);
							}
						}

						if (downloadOnValues.toCheckBox) {
							self.chkTo($("#toCheckBox").val());
							self.chkToOnClick();
							$("#periodToDatePicker").val(downloadOnValues.periodToDatePicker);
							$("#toHours").val(downloadOnValues.toHours);
							$("#toMinutes").val(downloadOnValues.toMinutes);
							$("#toDateName").val(downloadOnValues.toDateName);
						}
					}

					if (downloadOnValues.maintainanceCheckbox)
						$("#maintainanceCheckbox").prop("checked", true);
					else
						$("#maintainanceCheckbox").prop("checked", false);
				}
			}

			if (!_.isEmpty(scheduleValuesGlobalObject.scheduleDownload.applyOn)) {
				var applyOnValues = scheduleValuesGlobalObject.scheduleDownload.applyOn;
				if (applyOnValues.immediateId) {
					self.rbgApplyOnCheckbox($("#immediateId").val());
					self.immediateApplyClick();
				}
				else if (applyOnValues.dateApplyId) {
					self.rbgApplyOnCheckbox($("#dateApplyId").val());
					self.rbApplyDateTime();
					$("#applyDatePicker").val(applyOnValues.applyDatePicker);
					$("#applyOnTimeHour").val(applyOnValues.applyOnTimeHour);
					$("#applyOnTimeMinute").val(applyOnValues.applyOnTimeMinute);
					$("#dateAMPM").val(applyOnValues.dateAMPM);
				}
			}
		}
		///--END----Restoring previous selected schedule value

		function getReferenceSetsParameters(parentGridID, columnSortFilterForReferenceSets) {
			var getReferenceSetsForDevicesReq = new Object();
			var Pagination = new Object();
			var Export = new Object();
			var Selector = new Object();

			Pagination.PageNumber = 1;
			Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
			Pagination.HighLightedItemId = null;

			Export.DynamicColumns = null;
			Export.ExportReportType = 5;
			Export.IsExport = false;
			Export.IsAllSelected = false;

			if (koUtil.isDeviceProfile() == false) {
				getReferenceSetsForDevicesReq.ModelId = 0;
				getReferenceSetsForDevicesReq.ParentColumnSortFilter = koUtil.GlobalColumnFilter;
				var selectedIds = getSelectedUniqueId(parentGridID);
				var unSelectedIds = getUnSelectedUniqueId(parentGridID);
				var checkAll = checkAllSelected(parentGridID);

				if (checkAll == 1) {
					Selector.SelectedItemIds = null;
					if (unSelectedIds.length > 0) {
						Selector.UnSelectedItemIds = unSelectedIds;
					} else {
						Selector.UnSelectedItemIds = null;
					}
				} else {
					Selector.SelectedItemIds = selectedIds;
					Selector.UnSelectedItemIds = null;
                }
                getReferenceSetsForDevicesReq.DeviceSearch = ADSearchUtil.deviceSearchObj ? ADSearchUtil.deviceSearchObj : null;
			} else {
				getReferenceSetsForDevicesReq.DeviceSearch = null;
				getReferenceSetsForDevicesReq.ParentColumnSortFilter = null;
				Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
				Selector.UnSelectedItemIds = null;
			}

			getReferenceSetsForDevicesReq.ClientDateTimeFormat = null;
			getReferenceSetsForDevicesReq.ColumnSortFilter = columnSortFilterForReferenceSets;
			getReferenceSetsForDevicesReq.Export = Export;
			getReferenceSetsForDevicesReq.FetchMode = ENUM.get('Page');
			getReferenceSetsForDevicesReq.IsActive = true;
			getReferenceSetsForDevicesReq.Pagination = Pagination;
			getReferenceSetsForDevicesReq.Selector = Selector;
			getReferenceSetsForDevicesReq.TimeOffsetInMinutes = 0;
			getReferenceSetsForDevicesReq.IsManualSchedule = true;

			var param = new Object();
			param.token = TOKEN();
			param.getReferenceSetsForDevicesReq = getReferenceSetsForDevicesReq;

			return param;
		}

		function referenceSetGrid(gID, param) {
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
				dataFields: [
					{ name: 'isSelected', map: 'isSelected', type: 'number' },
					{ name: 'Name', map: 'Name' },
					{ name: 'SupportedPackages', map: 'SupportedPackages' },
					{ name: 'Status', map: 'Status' },
					{ name: 'ReferenceSetId', map: 'ReferenceSetId' },
					{ name: 'SponsorName', map: 'SponsorName' }
				],
				root: 'ReferenceSets',
				type: "POST",
				data: param,

				url: AppConstants.get('API_URL') + "/GetReferenceSetsForDevices",
				contentType: 'application/json',
				beforeprocessing: function (data) {
					if (data && data.getReferenceSetsForDevicesResp)
						data.getReferenceSetsForDevicesResp = $.parseJSON(data.getReferenceSetsForDevicesResp);
					else
						data.getReferenceSetsForDevicesResp = [];

					if (data.getReferenceSetsForDevicesResp && data.getReferenceSetsForDevicesResp.PaginationResponse) {
						source.totalrecords = data.getReferenceSetsForDevicesResp.PaginationResponse.TotalRecords;
						source.totalpages = data.getReferenceSetsForDevicesResp.PaginationResponse.TotalPages;
						totalPagesGlobal = data.getReferenceSetsForDevicesResp.PaginationResponse.TotalPages;
					} else {
						source.totalrecords = 0;
						source.totalpages = 0;
					}
				},
			};

			var request = {
				formatData: function (data) {
					$('.all-disabled').show();
					columnSortFilter = new Object();
					columnSortFilter = columnSortFilterFormatedData(columnSortFilterForReferenceSets, gID, gridStorage, 'ReferenceSet');
					param.getReferenceSetsForDevicesReq.ColumnSortFilter = columnSortFilter;
					param.getReferenceSetsForDevicesReq.Pagination = getPaginationObject(param.getReferenceSetsForDevicesReq.Pagination, gID);
					data = JSON.stringify(param);
					isGetReferenceSetsForDevices = true;
					return data;
				},
				downloadComplete: function (data, status, xhr) {
					referenceSetId = 0;
					referenceSetName = "";

					if (data.getReferenceSetsForDevicesResp) {
						if (data.getReferenceSetsForDevicesResp && data.getReferenceSetsForDevicesResp.ReferenceSets) {
							referenceSetArray = data.getReferenceSetsForDevicesResp.ReferenceSets;
							if (selectedReferenceSetId > 0) {
								referenceSetId = selectedReferenceSetId;
								for (var i = 0; i < data.getReferenceSetsForDevicesResp.ReferenceSets.length; i++) {
									if (data.getReferenceSetsForDevicesResp.ReferenceSets[i].ReferenceSetId == selectedReferenceSetId) {
										data.getReferenceSetsForDevicesResp.ReferenceSets[i]["isSelected"] = 1;
										referenceSetName = data.getReferenceSetsForDevicesResp.ReferenceSets[i].Name;										
									} else {
										data.getReferenceSetsForDevicesResp.ReferenceSets[i]["isSelected"] = 0;
									}
								}
							}
						} else {
							source.totalrecords = 0;
							source.totalpages = 0;
							data.getReferenceSetsForDevicesResp = new Object();
							data.getReferenceSetsForDevicesResp.ReferenceSets = [];
						}
						if (totalPagesGlobal > 1) {
							enableDisablePagination(1);
						}
					}
					$('.all-disabled').hide();
					$("#loadingDiv").hide();
				},
				loadError: function (jqXHR, status, error) {
					$('.all-disabled').hide();
				}
			};

			var dataAdapter = intializeDataAdapter(source, request);

			var selectRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
				var selectedId = $("#jqxgridAvailableReferenceSets").jqxGrid('getcellvalue', row, 'isSelected');
				var refSetName = $("#jqxgridAvailableReferenceSets").jqxGrid('getcellvalue', row, 'Name');
				var html = '';
				if (selectedId == 1 || (refSetName == referenceSetName)) {
					html = '<div style="margin-left: 10px; margin-top: 5px;"><input name="radioOptions" type="radio" checked="true" onClick="getSelectedRFSValue(' + row + ')" value="1"></div>';
				} else if (selectedId == 0) {
					html = '<div style="margin-left: 10px; margin-top: 5px;"><input name="radioOptions" type="radio" onClick="getSelectedRFSValue(' + row + ')" value="0"></div>';
				}
				return html;
			}

			var rendered = function (element) {
				enablegridfunctions(gID, 'ReferenceSetId', element, gridStorage, true, 'pagerDivReferenceSetsForSchedule', false, 0, 'ReferenceSetId', null, null, null);
				$('.jqx-grid-pager').css("display", "none", "important");
				return true;
			}

			//Custom filter
			var buildFilterPanel = function (filterPanel, datafield) {
				genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
			}
			var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
				genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
			}

			var toolTipComputedRenderer = function (row, column, value, defaultHtml) {
				if (value == "Active") {
					defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
				} else if (value == "Inactive") {
					defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg inactive_Orange"></div></a>' + value + '</span></div>';
				}

				return defaultHtml;
			}

			$("#" + gID).jqxGrid(
				{
					height: "275px",
					width: "99%",
					pageable: true,
					editable: true,
					source: dataAdapter,
					altRows: true,
					virtualmode: true,
					pageSize: AppConstants.get('ROWSPERPAGE'),
					filterable: true,
					sortable: true,
					columnsResize: true,
					columnsreorder: true,
					selectionmode: 'singlerow',
					theme: AppConstants.get('JQX-GRID-THEME'),
					autoshowcolumnsmenubutton: false,
					autoshowloadelement: false,
					enabletooltips: true,
					autoshowfiltericon: true,
					rendergridrows: function () {
						return dataAdapter.records;
					},
					ready: function () {
						//$("#jqxgridAvailableReferenceSets").jqxGrid('updatebounddata');
					},

					columns: [
						{
							text: 'Select', menu: false, sortable: false, columnsResize: false, filterable: false, columntype: 'custom', datafield: 'isSelected', enabletooltips: false,
							minwidth: 60, maxwidth: 61, width: 'auto', cellsrenderer: selectRenderer,
						},
						{ text: '', dataField: 'ReferenceSetId', hidden: true, editable: false, minwidth: 0 },
						{
							text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, width: 40, hidden: true,
							renderer: function () {
								return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
							},
							rendered: rendered
						},
						{
							text: i18n.t('device_reference_set', { lng: lang }), datafield: 'Name', editable: false, width: 'auto', minwidth: 130,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							},
						},
						{
							text: i18n.t('device_packages', { lng: lang }), datafield: 'SupportedPackages', editable: false, width: 'auto', minwidth: 150, menu: false, filterable: false,
							sortable: false, filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							},
						},
						{
							text: i18n.t('device_status', { lng: lang }), datafield: 'Status', editable: false, width: 'auto', minwidth: 120,
							filtertype: "custom", cellsrenderer: toolTipComputedRenderer,
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanelMultiChoice(filterPanel, datafield, 'ReferenceSet Status');
							}
						},

					]
				});
			$("#" + gID).bind("bindingcomplete", function (event) {
				$("#jqxgridAvailableReferenceSetsseleceteRowSpan").text('0');
			});

			enableDisablePagination(0);
			getGridBiginEdit(gID, 'ReferenceSetId', gridStorage);
			callGridFilter(gID, gridStorage);
			callGridSort(gID, gridStorage, 'ReferenceSetId');
		}

		function enableDisablePagination(type) {
			if (type == 0) {
				$('#pagerDivReferenceSetsForSchedule').addClass('disabled').off('click');
				$('#pagerDivReferenceSetsForSchedule').prop('disabled', true);
				$("#pagerDivReferenceSetsForSchedule").find("input").prop("disabled", true);
			} else {
				$('#pagerDivReferenceSetsForSchedule').removeClass('disabled').off('click');
				$('#pagerDivReferenceSetsForSchedule').prop('disabled', false);
				$("#pagerDivReferenceSetsForSchedule").find("input").prop("disabled", false);
			}
		}
	};
});

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
function currentDateTimeupdate(currentDate) {
	var now = new Date();//update current date on click of radio button

	var dateobj = formatAMPM(now);
	now.setMinutes(now.getMinutes() + SlotSchedulerScheduleLag);
	var dateobjwithLag = formatAMPM(now);


	$("#applyDatePicker").val(currentDate);
	$("#applyDatePicker").datepicker('update', currentDate);
	$("#applyOnTimeHour").val(dateobj.hours);
	// $("#applyOnTimeMinute").val(parseInt(dateobj.minutes) + 1);
	if (parseInt(dateobj.minutes) < 59) {
		$("#applyOnTimeMinute").val(parseInt(dateobj.minutes) + 1);
	} else if (parseInt(dateobj.minutes) == 59) {
		$("#applyOnTimeMinute").val('0');
	} else {
		$("#applyOnTimeMinute").val(parseInt(dateobj.minutes));
	}

	$("#dateAMPM").val(dateobj.ampm);
	// $("#nextAvailableFreeLabel").find("input").prop("disabled", true);


	$("#periodFromDatePicker").val(currentDate);
	$("#periodFromDatePicker").datepicker('update', currentDate);
	$("#fromHours").val(dateobjwithLag.hours);
	//   $("#fromMinutes").val(parseInt(dateobj.minutes) + 1);
	if (parseInt(dateobjwithLag.minutes) < 59) {
		$("#fromMinutes").val(parseInt(dateobjwithLag.minutes) + 1);
	} else if (parseInt(dateobjwithLag.minutes) == 59) {
		$("#fromMinutes").val('0');
	} else {
		$("#fromMinutes").val(parseInt(dateobjwithLag.minutes));
	}


	$("#downloadPeriodName").val(dateobjwithLag.ampm);

	$("#periodToDatePicker").val(currentDate);
	$("#periodToDatePicker").datepicker('update', currentDate);
	$("#toHours").val(dateobjwithLag.hours);
	//  $("#toMinutes").val(dateobj.minutes);
	if (parseInt(dateobjwithLag.minutes) < 59) {
		$("#toMinutes").val(parseInt(dateobjwithLag.minutes) + 1);
	} else if (parseInt(dateobjwithLag.minutes) == 59) {
		$("#toMinutes").val('0');
	} else {
		$("#toMinutes").val(parseInt(dateobjwithLag.minutes));
	}
}

function onlytimeUpdateAllField() {
	var now = new Date();
	var dateobj = formatAMPM(now);
	now.setMinutes(now.getMinutes() + SlotSchedulerScheduleLag);
	var dateobjwithLag = formatAMPM(now);
	$("#downloadHours").val(dateobj.hours);
	//$("#downloadMinutes").val(dateobj.minutes);
	if (parseInt(dateobj.minutes) < 59) {
		$("#downloadMinutes").val(parseInt(dateobj.minutes) + 1);
		$("#fromMinutes").val(parseInt(dateobjwithLag.minutes) + 1);
		$("#toMinutes").val(parseInt(dateobjwithLag.minutes) + 1);
		$("#applyOnTimeMinute").val(parseInt(dateobj.minutes) + 1);
	} else if (parseInt(dateobj.minutes) == 59) {
		$("#downloadMinutes").val('0');
		$("#fromMinutes").val('0');
		$("#toMinutes").val('0');
		$("#applyOnTimeMinute").val('0');
	} else {
		$("#downloadMinutes").val(parseInt(dateobj.minutes));
		$("#fromMinutes").val(parseInt(dateobjwithLag.minutes));
		$("#toMinutes").val(parseInt(dateobjwithLag.minutes));
		$("#applyOnTimeMinute").val(parseInt(dateobj.minutes));
	}

	$("#downloadName").val(dateobj.ampm);

	$("#fromHours").val(dateobjwithLag.hours);


	$("#downloadPeriodName").val(dateobjwithLag.ampm);

	$("#toHours").val(dateobjwithLag.hours);


	$("#toDateName").val(dateobjwithLag.ampm);

	$("#applyOnTimeHour").val(dateobj.hours);


	$("#dateAMPM").val(dateobj.ampm);
}
var gridSetRowDetailsforAvailGrid = function (e) {
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
}

function getSelectedRFSValue(row) {
	referenceSetName = $("#jqxgridAvailableReferenceSets").jqxGrid('getcellvalue', row, 'Name');
	supportedPackages = $("#jqxgridAvailableReferenceSets").jqxGrid('getcellvalue', row, 'SupportedPackages');
	referenceSetStatus = $("#jqxgridAvailableReferenceSets").jqxGrid('getcellvalue', row, 'Status');
	referenceSetId = $("#jqxgridAvailableReferenceSets").jqxGrid('getcellvalue', row, 'ReferenceSetId');
	selectedRFSponsorName = $("#jqxgridAvailableReferenceSets").jqxGrid('getcellvalue', row, 'SponsorName');

	if (referenceSetName == '') {
		$("#jqxgridAvailableReferenceSetsseleceteRowSpan").text('0');
	} else {
		$("#jqxgridAvailableReferenceSetsseleceteRowSpan").text('1');
	}

	var rows = $("#jqxgridAvailableReferenceSets").jqxGrid('getrows');
	if (rows && rows.length > 0) {
		for (var i = 0; i < rows.length; i++) {
			var boundindex = $("#jqxgridAvailableReferenceSets").jqxGrid('getrowboundindexbyid', rows[i].uid);
			if (rows[i].ReferenceSetId == referenceSetId) {
				$("#jqxgridAvailableReferenceSets").jqxGrid('setcellvalue', boundindex, 'isSelected', 1);
				selectedReferenceSetId = referenceSetId;
			} else {
				$("#jqxgridAvailableReferenceSets").jqxGrid('setcellvalue', boundindex, 'isSelected', 0);
			}
		}
	}
	$("#jqxgridAvailableReferenceSets").jqxGrid("refresh");
}