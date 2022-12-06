var includeInactiveDevicesForContent = false;
var StateDelivery = null;
define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "bootstrap", "bootstrapDatePicker", "moment", "spinner", "utility"], function (ko, koUtil, ADSearchUtil) {

	SelectedIdOnGlobale = new Array();
	var maxScheduleContentCount;

	currentSelectedDownloadScheduleOption = "OnNextMaintenanceWindow";
	currentSelectedApplyScheduleOptionContent = "Immediate";
	currentSelectedExpiryScheduleOption = "None";
	columnSortFilter = {};

	var check = 0;

	//Result TAb global variables
	var failedDeviceCount;
	var succeedDeviceCount;
	var createJobId;

	var rowIndexForHighlighted;
	var isRightPackagesClick;
	var rowIdForHighlightedForTable;
	var isSoftAndFilter;

	var lang = getSysLang();

	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	var currentDateShort = moment().format(SHORT_DATE_FORMAT);
	var currentDateLong = moment().format(LONG_DATETIME_FORMAT);

	var isSelectedPaneFiltered = false; //To check filter applied on Selected Packages Pane 
	var selectedRowArrayForSwap = new Array();
	var gridSelectedArrayForSwap = new Array();
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


	return function downloadLibararyappViewModel() {

		var self = this;
		//ADSearchUtil.AdScreenName = 'schedulecontent';

		$("#btnForMoveleft").addClass('disabled');
		$("#btnForMoveRight").addClass('disabled');
		$("#btnMoveItemUp").addClass('disabled');
		$("#btnMoveItemDown").addClass('disabled');
		$("#submitBtn").prop("disabled", true);

		if (isFromDeviceSearch)
			columnSortFilter = koUtil.GlobalColumnFilter;

		//-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
		$('#downloadModelconfocontent').on('shown.bs.modal', function (e) {
			$('#scheduleContentConfoNo').focus();

		});
		$('#downloadModelconfocontent').keydown(function (e) {
			if ($('#scheduleContentConfoNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#scheduleContentConfoYes').focus();
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



		//Set current Time in Select Schedule Section.
		var now = new Date();
		var dateobj = formatAMPM(now);
		$("#downloadHours").val(dateobj.hours);
		// $("#downloadMinutes").val(dateobj.minutes);
		$("#downloadName").val(dateobj.ampm);

		$("#applyHours").val(dateobj.hours);
		//$("#applyMinutes").val(dateobj.minutes);
		$("#applyName").val(dateobj.ampm);

		$("#expiryHours").val(dateobj.hours);
		//  $("#expiryMinutes").val(dateobj.minutes);
		if (dateobj.minutes == 59) {
			$("#expiryMinutes").val('0');
			$("#applyMinutes").val('0');
			$("#downloadMinutes").val('0');
		} else if (dateobj.minutes < 59) {
			$("#expiryMinutes").val(parseInt(dateobj.minutes) + 1);
			$("#applyMinutes").val(parseInt(dateobj.minutes) + 1);
			$("#downloadMinutes").val(parseInt(dateobj.minutes) + 1);
		} else {
			$("#expiryMinutes").val(parseInt(dateobj.minutes));
			$("#applyMinutes").val(parseInt(dateobj.minutes));
			$("#downloadMinutes").val(parseInt(dateobj.minutes));
		}

		$("#expiryName").val(dateobj.ampm);


		self.selectedPackageData = ko.observableArray();
		self.movedArray = ko.observableArray();
		self.allselectedpackagesSelected = ko.observable(false);


		self.unloadTempPopup = function (popupName, gId, exportflage) {
			self.alertModelPopup('unloadTemplate');
		}

		//$("#selectedDevicesGrid").hide();
		//$("#schduleGrid").show();
		//$("#previousBtn").hide();
		$("#submitBtn").show();
		////Date Picker 
		var date = new Date();
		date.setDate(date.getDate());
		$("#downloadDatePicker").datepicker({ startDate: date, autoclose: true, todayHighlight: true });
		$("#applyDatePicker").datepicker({ startDate: date, autoclose: true, todayHighlight: true });
		$("#expiryDatePicker").datepicker({ startDate: date, autoclose: true, todayHighlight: true });

		var currentDate = moment(new Date()).format(SHORT_DATE_FORMAT);
		$('#downloadDatePicker').prop('value', currentDate);
		$('#applyDatePicker').prop('value', currentDate);
		$('#expiryDatePicker').prop('value', currentDate);

		//JIRA Bug FIx 4373
		//var hours = moment(new Date()).format('HH');
		//var minutes = moment(new Date()).format('mm');
		//$('#downloadHours').prop('value', hours);
		//$('#downloadMinutes').prop('value', minutes);
		//$('#applyHours').prop('value', hours);
		//$('#applyMinutes').prop('value', minutes);
		//$('#expiryHours').prop('value', hours);
		//$('#expiryMinutes').prop('value', minutes);

		///spinner
		$('[data-trigger="spinner"]').spinner();
		///
		self.jobName = ko.observable();

		self.jobName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('please_enter_job_name', {
					lng: lang
				})
			}
		});

		self.refreshAvailablePackages = function (gId) {
			$("#" + gId).jqxGrid("removesort");
			$("#" + gId).jqxGrid("clearfilters");
		}

		//Clear Filter
		self.clearfilter = function (gId) {
			clearUiGridFilter(gId);
			$('#' + gId).jqxGrid('clearselection');
			$("#btnForMoveRight").addClass('disabled');
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

		//First Tab call
		getConfigurationValues();

		//Job Name validation

		//self.jobName = ko.observable('').extend({
		//    required: {
		//        params: true,
		//        message: i18n.t('please_enter_job_name', {
		//            lng: lang
		//        })
		//    }
		//});





		//Second Tab fetching fpackages for devices
		//Swapping data functions
		self.packageData = ko.observableArray();

		if (isMiddleMenuClicked) {
			packagesGridModel(self.packageData, self.movedArray);
		}

		self.allPackagesMove = function () {
			var arr = self.movedArray();
			if (arr.length > 0) {
				for (i = 0; i < arr.length; i++) {
					self.movedArray([]);
					self.packageData.push(arr[i]);
				}
				$("#btnForMoveleft").addClass('disabled');
				$("#btnForMoveRight").addClass('disabled');
				$("#btnMoveItemUp").addClass('disabled');
				$("#btnMoveItemDown").addClass('disabled');
				selectedRowArrayForSwap = [];
				gridSelectedArrayForSwap = [];
				selectedDownloadsActionsContent = [];
				$('#jqxgridAvailablePackage').jqxGrid('clearselection');

				if (StateDelivery) {
					$("#jqxgridAvailablePackage").jqxGrid('loadstate', StateDelivery);
				}
				selectedHighlightedRowForGrid();  //Selection row and State maintain In grid
			}
			self.SubmitButtonEnableDisable();
		}

        self.rightPackages = function () {

            gridSelectedArrayForSwap = new Array();
            var selectedData = getMultiSelectedData('jqxgridAvailablePackage');

            var selectedDataArray = getSelectedUniqueId('jqxgridAvailablePackage');
            var unsupportedContentStr = '';

            if (selectedDataArray.length > 0) {
                for (k = 0; k < selectedDataArray.length; k++) {
                    var selectedsource = _.where(selectedData, { PackageId: selectedDataArray[k] });
                    if (!_.isEmpty(selectedsource) && selectedsource.length > 0) {
                        if (_.isEmpty(selectedsource[0].DeviceFileName) || _.isEmpty(selectedsource[0].DeviceFileNameAlias) || _.isEmpty(selectedsource[0].DeviceFileLocation) || _.isEmpty(selectedsource[0].DeviceFileLocationAlias) || _.isEmpty(selectedsource[0].TargetUser) || _.isEmpty(selectedsource[0].TargetUserAlias)) {
                            unsupportedContentStr += selectedData[k].PackageName + ", ";
                        }
                    }
                }
            }

            unsupportedContentStr = unsupportedContentStr.trim().slice(0, -1);
            if (!_.isEmpty(unsupportedContentStr)) {
                openAlertpopup(2, i18n.t('content_File_unsupported_for_manuel_download', { content: unsupportedContentStr }, { lng: lang }));
                return;
            }

            var selectedDataArray = getSelectedUniqueId('jqxgridAvailablePackage');
            if (selectedDataArray.length > 0) {
                for (k = 0; k < selectedDataArray.length; k++) {
                    var selectedsource = _.where(selectedData, { PackageId: selectedDataArray[k] });
                    gridSelectedArrayForSwap.push(selectedsource[0]);
                }
            } else {
                openAlertpopup(1, 'please_selct_row');
            }
			StateDelivery = $("#jqxgridAvailablePackage").jqxGrid('savestate');
			if (gridSelectedArrayForSwap.length > 0) {
				//var source = _.where(self.movedArray(), { PackageName: gridSelectedArrayForSwap[0].PackageName });
				var dataArray = self.movedArray();
				dataArray = dataArray.length + 1;
				//------------User is not allowed to select more than 3 content files per job----------
				totalpackageassignment = gridSelectedArrayForSwap.length + self.movedArray().length;
				if (totalpackageassignment > maxScheduleContentCount) {
					openAlertpopup(1, i18n.t('Maximum_of_3_contents_can_be_selected_for_schedule', { maxScheduleContentCount: maxScheduleContentCount }, { lng: lang }));
					return;
				} else {
					//if (isRightPackagesClick == "No") {    //Selection row and State maintain In grid
					//    rowIndexForHighlighted = undefined;
					//} else {
					//    rowIndexForHighlighted = StateDelivery.selectedrowindex;
					//}

					for (var i = 0; i < gridSelectedArrayForSwap.length; i++) {
						if (gridSelectedArrayForSwap[i] != null) {
							gridSelectedArrayForSwap[i].packageSelected = false;
							self.movedArray.push(gridSelectedArrayForSwap[i]);
							selectedDownloadsActionsContent.push(gridSelectedArrayForSwap[i]);
							var selectedsource = _.where(self.packageData(), { PackageName: gridSelectedArrayForSwap[i].PackageName });
							self.packageData.remove(selectedsource[0]);
							clearMultiSelectedData('jqxgridAvailablePackage');
						}
					}

					$("#jqxgridAvailablePackage").jqxGrid('clear');
					var str = '';
					str += '<div id="jqxgridAvailablePackage"></div>';
					$("#AvailablePackageDiv").empty();
					$("#AvailablePackageDiv").append(str);
					PackagesGrid(self.packageData, 'jqxgridAvailablePackage');

					if (StateDelivery) {
						$("#jqxgridAvailablePackage").jqxGrid('loadstate', StateDelivery);
					}
					gridSelectedArrayForSwap = [];
					selectedHighlightedRowForGrid();  //Selection row and State maintain In grid

					$("#btnForMoveRight").addClass('disabled');
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
					var tootipArr = self.movedArray()
					for (var j = 0; j < tootipArr.length; j++) {
						var packageName = tootipArr[j].PackageName;
						var fileName = tootipArr[j].FileName;
						$("#packagespan" + j).prop('title', packageName);
						$("#versionspan" + j).prop('title', fileName);
					}
				}
			} else {
				openAlertpopup(1, 'no_row_selected');
			}
			self.SubmitButtonEnableDisable();
		}

		self.SelectSelectedPackageRow = function (data, index) {
			$("#tbodySelectedpack").children('tr').removeClass('refselection');
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

			$("#btnMoveItemUp").addClass('disabled');
			$("#btnMoveItemDown").addClass('disabled');
			self.movedArray([]);
			self.movedArray(selectedpackages);
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
			$("#btnMoveItemUp").addClass('disabled');
			$("#btnMoveItemDown").addClass('disabled');
		}

		self.leftPackages = function () {
			self.allselectedpackagesSelected(false);
			if (selectedRowArrayForSwap.length > 0) {
				for (var i = 0; i < selectedRowArrayForSwap.length; i++) {
					selectedRowArrayForSwap[i].packageSelected = false;
					self.movedArray.remove(selectedRowArrayForSwap[i]);
					self.packageData.push(selectedRowArrayForSwap[i]);
				}
				$("#jqxgridAvailablePackage").jqxGrid('clear');
				var str = '';
				str += '<div id="jqxgridAvailablePackage"></div>';
				$("#AvailablePackageDiv").empty();
				$("#AvailablePackageDiv").append(str);
				PackagesGrid(self.packageData, 'jqxgridAvailablePackage');
				selectedRowArrayForSwap = [];
				gridSelectedArrayForSwap = [];
				selectedDownloadsActionsContent = [];

				if (StateDelivery) {
					$("#jqxgridAvailablePackage").jqxGrid('loadstate', StateDelivery);
				}
				selectedHighlightedRowForGrid();
				$("#btnForMoveleft").addClass('disabled');
				$("#btnMoveItemUp").addClass('disabled');
				$("#btnMoveItemDown").addClass('disabled');

				if (isSelectedPaneFiltered) {
					clearCustomFilterInTable("selectpackagestable");
					clearSelectedPackagesPane();
					isSelectedPaneFiltered = false;
				}
				if (self.movedArray().length > 0) {
					for (var j = 0; j < self.movedArray().length; j++) {
						selectedDownloadsActionsContent.push(self.movedArray()[j]);
					}
				}
			} else {
				openAlertpopup(1, 'no_row_selected');
			}
			self.SubmitButtonEnableDisable();
		}

		function selectedHighlightedRowForGrid() {   //Selection row and State maintain In grid
			var datainformations = $("#jqxgridAvailablePackage").jqxGrid('getdatainformation');
			var rowscounts = datainformations.rowscount;

			if (rowscounts > 0) {
				//rowIndexForHighlighted = rowscounts + 1;
				if (rowIndexForHighlighted == rowscounts || rowIndexForHighlighted == undefined || rowIndexForHighlighted == -1) {
					// $('#jqxgridAvailablePackage').jqxGrid('selectrow', 0);
					$('#jqxgridAvailablePackage').jqxGrid('clearselection');
					gridSelectedArrayForSwap = [];
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

		$("#jqxgridAvailablePackage").bind("filter", function (event) {
			isSoftAndFilter = false;
			$('#jqxgridAvailablePackage').jqxGrid('clearselection');
			gridSelectedArrayForSwap = [];

			rowIndexForHighlighted = undefined;
			var results = $('#jqxgridAvailablePackage').jqxGrid('getrows').length;
			if (results == 0) {
				$("#btnForMoveRight").addClass('disabled');
			}

			$('#jqxgridAvailablePackage').jqxGrid('resumeupdate');
			StateDelivery = $("#jqxgridAvailablePackage").jqxGrid('savestate');
		});

		$("#jqxgridAvailablePackage").bind("sort", function (event) {
			isSoftAndFilter = false;

			$('#jqxgridAvailablePackage').jqxGrid('clearselection');
			gridSelectedArrayForSwap = [];
			rowIndexForHighlighted = undefined;
		});

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

		self.SubmitButtonEnableDisable = function () {
			if (self.movedArray().length == 0) {
				$("#submitBtn").prop("disabled", true);
			} else {
				$("#submitBtn").prop("disabled", false);
				//$("#btnForMoveleft").removeClass('disabled');
			}
		}

		//new changes

		$("#expiryDatePicker").datepicker().on('changeDate', function (ev) {
			var fromval = $("#expiryDatePicker").val();
			$("#expiryDatePicker").datepicker({ autoclose: true, setDate: fromval });

			var curt = moment($("#expiryDatePicker").val()).format(SHORT_DATE_FORMAT);
			if (moment(curt).isAfter(moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT))) {
				$("#expiryDatePicker").change();
			}

		});

		$("#expiryDatePicker").change(function () {
			var fromval = $("#expiryDatePicker").val();
			$("#expiryDatePicker").datepicker({ autoclose: true, setDate: fromval });

			var applyDatePicker = $("#applyDatePicker").val();
			$("#expiryDatePicker").datepicker('setStartDate', applyDatePicker);

			var curt = moment($("#expiryDatePicker").val()).format(SHORT_DATE_FORMAT);
			if (moment(curt).isAfter(moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT))) {

			} else {
				if (moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT) == moment($("#expiryDatePicker").val()).format(SHORT_DATE_FORMAT)) {
				} else {
					openAlertpopup(1, 'expire_later');
					if ($("#applyMinutes").val() == 59) {
						if ($("#applyHours").val() == 12) {
							if ($('#applyName :selected').text() == "PM") {
								$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
								$('#expiryName').val("AM").prop("selected", "selected");
							}
						}
					} else {
						$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT));
					}
				}

			}
		});


		$("#applyDatePicker").datepicker().on('changeDate', function (ev) {
			//sect date new code
			var fromval = $("#applyDatePicker").val();
			$("#applyDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//

			var downloadDatePicker = $("#downloadDatePicker").val();
			$("#applyDatePicker").datepicker('setStartDate', downloadDatePicker);

			var curt = moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT);
			if (moment(curt).isAfter(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT))) {
				$("#applyDatePicker").change();
			}

		});

		$("#applyDatePicker").change(function () {
			//sect date new code
			var downloadDatePicker = $("#downloadDatePicker").val();
			var fromval = $("#applyDatePicker").val();
			$("#applyDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			$("#applyDatePicker").datepicker('setStartDate', downloadDatePicker);
			$("#expiryDatePicker").datepicker('setStartDate', fromval);
			var applyExpireOnDate = dateCompareForSchedule($("#applyDatePicker").val(), $("#applyHours").val(), $("#applyMinutes").val(), $("#applyName").val(), $("#expiryDatePicker").val(), $("#expiryHours").val(), $("#expiryMinutes").val(), $("#expiryName").val())

			if (applyExpireOnDate == 1) {
				$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT));
				$('#expiryDatePicker').datepicker({ autoclose: true, setDate: $("#expiryDatePicker").val() });
				$('#expiryDatePicker').datepicker('update');
				var curt = moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT);
				if (moment(curt).isAfter(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT))) {

				} else {
					//alert('else' + moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT) + '===' + moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT));
					if (moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT) == moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT)) {

					} else {
						openAlertpopup(1, 'applyon_less_than_downloadon');
						var dHr = $("#applyHours").val();
						var dMinut = $("#applyMinutes").val();
						if ($("#applyMinutes").val() == 59) {
							if ($("#applyHours").val() == 12) {
								$("#expiryHours").val(1);
								$("#expiryMinutes").val(0);
								if ($('#applyName :selected').text() == "AM") {
									$('#expiryName').val("PM").prop("selected", "selected");
								} else {
									$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
									$('#expiryName').val("AM").prop("selected", "selected");
								}
							} else if ($("#applyHours").val() == 11) {
								$("#expiryHours").val(12);
								$("#expiryMinutes").val(0);

								if ($('#applyName :selected').text() == "AM") {

									$('#expiryName').val("PM").prop("selected", "selected");
								} else if ($('#applyName :selected').text() == "PM") {
									$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
									$('#expiryName').val("AM").prop("selected", "selected");
								}
							} else {
								$("#expiryHours").val(parseInt(dHr) + 1);
								$("#expiryMinutes").val(0);
							}
						} else {
							$("#expiryHours").val($("#applyHours").val());
							$("#expiryMinutes").val(parseInt(dMinut) + 1);
						}
						//if ($("#downloadMinutes").val() == 59) {
						//    if ($("#downloadHours").val() == 12) {
						//        if ($('#downloadName :selected').text() == "PM") {
						//            $("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
						//            $('#applyName').val("AM").prop("selected", "selected");
						//        }
						//    }
						//} else {
						//    $("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
						//}
					}

				}
			}
		});

		$("#downloadName").change(function () {
			//if ($('#downloadName :selected').text() == "PM") {
			//    $('#applyName').val("PM").prop("selected", "selected");
			//} else if ($('#downloadName :selected').text() == "AM") {
			//    $('#applyName').val("AM").prop("selected", "selected");
			//}
		});

		$("#applyName").change(function () {
			if ($("#applyDatePicker").val() == $("#expiryDatePicker").val()) {
				//if ($('#applyName :selected').text() == "PM") {
				//    $('#expiryName').val("PM").prop("selected", "selected");
				//} else if ($('#applyName :selected').text() == "AM") {
				//    $('#expiryName').val("AM").prop("selected", "selected");
				//}
			}
		});

		$("#downloadDatePicker").datepicker().on('changeDate', function (ev) {
			//sect date new code
			var fromval = $("#downloadDatePicker").val();
			$("#downloadDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			var curt = moment().format(SHORT_DATE_FORMAT);
			if (moment(curt).isAfter(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT))) {
				$("#downloadDatePicker").change();
			}
		});

		$("#downloadDatePicker").change(function () {
			//sect date new code
			var fromval = $("#downloadDatePicker").val();
			$("#downloadDatePicker").datepicker({ autoclose: true, setDate: fromval });
			//
			var DownloadApplyOnDate = dateCompareForSchedule($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), $("#applyHours").val(), $("#applyMinutes").val(), $("#applyName").val())
			if (DownloadApplyOnDate == 1) {
				$("#expiryDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
				var curt = moment().format(SHORT_DATE_FORMAT);
				if ($("#downloadMinutes").val() == 59) {
					if ($("#downloadHours").val() == 11) {
						$("#applyHours").val(12);
						$("#applyMinutes").val(0);
						$("#expiryHours").val(12);
						$("#expiryMinutes").val(1);
						if ($('#downloadName :selected').text() == "PM") {
							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#applyName').val("AM").prop("selected", "selected");
							$('#expiryName').val("AM").prop("selected", "selected");

						} else {
							$('#applyName').val("PM").prop("selected", "selected");
							$('#expiryName').val("PM").prop("selected", "selected");
						}
					} else if ($("#downloadHours").val() == 12) {
						$("#applyHours").val(1);
						$("#applyMinutes").val(0);
						$("#expiryHours").val(1);
						$("#expiryMinutes").val(1);
						$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
					} else {
						$("#applyHours").val(parseInt(($("#downloadHours").val()) + 1));
						$("#applyMinutes").val(0);
						$("#expiryHours").val($("#applyHours").val());
						$("#expiryMinutes").val(1);
					}
				} else {
					$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
					$('#applyDatePicker').datepicker({ autoclose: true, setDate: $("#applyDatePicker").val() });
					$('#applyDatePicker').datepicker('update');
				}
			} else {

			}
			$("#applyDatePicker").datepicker('setStartDate', fromval);
			$("#expiryDatePicker").datepicker('setStartDate', fromval);
		});

		self.ddlFormatData = ko.observableArray([{ "dataValue": "AM", "dataTtext": "AM" }, { "dataValue": "PM", "dataTtext": "PM" }]);


		$("#downloadHours").on("blur", function () {
			if (self.compareDownloadApply() == true) {

			} else {
				var dHr = $("#downloadHours").val();
				var dMinut = $("#downloadMinutes").val();
				if ($("#downloadMinutes").val() == 59) {
					if ($("#downloadHours").val() == 12) {
						$("#applyHours").val(1);
						$("#applyMinutes").val(0);
						$("#expiryMinutes").val(1);
						if ($('#downloadName :selected').text() == "AM") {

							$('#applyName').val("PM").prop("selected", "selected");
						} else {

							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#applyName').val("AM").prop("selected", "selected");

						}
					} else if ($("#downloadHours").val() == 11) {
						$("#applyHours").val(12);
						$("#applyMinutes").val(0);
						$("#expiryHours").val(12);
						$("#expiryMinutes").val(1);
						if ($('#downloadName :selected').text() == "AM") {
							$('#expiryName').val("PM").prop("selected", "selected");
							$('#applyName').val("PM").prop("selected", "selected");
						} else if ($('#downloadName :selected').text() == "PM") {
							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$("#expiryDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#applyName').val("AM").prop("selected", "selected");
							$('#expiryName').val("AM").prop("selected", "selected");
						}
					} else {

						$("#applyHours").val(parseInt(dHr) + 1);
						$("#expiryHours").val(parseInt(dHr) + 1);
						$("#applyMinutes").val(0);
						$("#expiryMinutes").val(1);
					}
				} else {
					$("#applyHours").val($("#downloadHours").val());
					$("#expiryHours").val($("#downloadHours").val());
					$("#applyMinutes").val(parseInt(dMinut) + 1);
					$("#expiryMinutes").val(parseInt(dMinut) + 1);
				}

				var dHr = $("#applyHours").val();
				var dMinut = $("#applyMinutes").val();
				if ($("#applyMinutes").val() == 59) {
					if ($("#applyHours").val() == 12) {
						$("#expiryHours").val(1);
						$("#expiryMinutes").val(0);
						//  $("#expiryHours").val(1);
						if ($('#applyName :selected').text() == "AM") {
							$('#expiryName').val("PM").prop("selected", "selected");
						} else {

							$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#expiryName').val("AM").prop("selected", "selected");

						}
					} else {

						$("#expiryHours").val(parseInt(dHr) + 1);
						$("#expiryMinutes").val(0);
					}
				} else {
					$("#expiryHours").val($("#applyHours").val());
					$("#expiryMinutes").val(parseInt(dMinut) + 1);
				}
			}
		});

		$("#downloadMinutes").on("blur", function () {
			if (self.compareDownloadApply() == true) {

			} else {
				var dHr = $("#downloadHours").val();
				var dMinut = $("#downloadMinutes").val();
				if ($("#downloadMinutes").val() == 59) {
					if ($("#downloadHours").val() == 12) {
						$("#applyHours").val(1);
						$("#applyMinutes").val(0);
						$("#expiryHours").val(1);
						$("#expiryMinutes").val(1);
						if ($('#downloadName :selected').text() == "AM") {

							$('#applyName').val("PM").prop("selected", "selected");
						} else {

							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#applyName').val("AM").prop("selected", "selected");

						}
					} else if ($("#downloadHours").val() == 11) {
						$("#applyHours").val(12);
						$("#applyMinutes").val(0);
						$("#expiryHours").val(12);
						$("#expiryMinutes").val(1);
						if ($('#downloadName :selected').text() == "AM") {
							$('#expiryName').val("PM").prop("selected", "selected");
							$('#applyName').val("PM").prop("selected", "selected");
						} else if ($('#downloadName :selected').text() == "PM") {
							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$("#expiryDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#applyName').val("AM").prop("selected", "selected");
							$('#expiryName').val("AM").prop("selected", "selected");
						}
					} else {

						$("#applyHours").val(parseInt(dHr) + 1);
						$("#expiryHours").val(parseInt(dHr) + 2);
						$("#applyMinutes").val(0);
						$("#expiryMinutes").val(1);
					}
				} else {
					var aMinut = $("#applyMinutes").val();
					$("#applyHours").val($("#downloadHours").val());
					$("#applyMinutes").val(parseInt(dMinut) + 1);
				}


				///
				var dHr = $("#applyHours").val();
				var dMinut = $("#applyMinutes").val();
				if ($("#applyMinutes").val() == 59) {
					if ($("#applyHours").val() == 12) {
						$("#expiryHours").val(1);
						$("#expiryMinutes").val(0);
						if ($('#applyName :selected').text() == "AM") {

							$('#expiryName').val("PM").prop("selected", "selected");
						} else {

							$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#expiryName').val("AM").prop("selected", "selected");

						}
					} else {
						$("#expiryHours").val(parseInt(dHr) + 1);
						$("#expiryMinutes").val(0);
					}
				} else {
					$("#expiryHours").val($("#applyHours").val());
					$("#expiryMinutes").val(parseInt(dMinut) + 1);

				}
				///
			}

		});
		self.compareDownloadApply = function () {
			var DownloadApplyOnDate = dateCompareForSchedule($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), $("#applyHours").val(), $("#applyMinutes").val(), $("#applyName").val())
			if (DownloadApplyOnDate == 0) {
				return true;
			} else {
				return false;
			}
		}

		$("#applyHours").on("blur", function () {
			if (self.compareApplyExpire() == true) {

			} else {
				var dHr = $("#applyHours").val();
				var dMinut = $("#applyMinutes").val();
				if ($("#applyMinutes").val() == 59) {
					if ($("#applyHours").val() == 12) {
						$("#expiryHours").val(1);
						$("#expiryMinutes").val(0);
						if ($('#applyName :selected').text() == "AM") {
							$('#expiryName').val("PM").prop("selected", "selected");
						} else {
							$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#expiryName').val("AM").prop("selected", "selected");
						}
					} else if ($("#applyHours").val() == 11) {
						$("#expiryHours").val(12);
						$("#expiryMinutes").val(0);

						if ($('#applyName :selected').text() == "AM") {

							$('#expiryName').val("PM").prop("selected", "selected");
						} else if ($('#applyName :selected').text() == "PM") {
							$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#expiryName').val("AM").prop("selected", "selected");
						}
					} else {
						$("#expiryHours").val(parseInt(dHr) + 1);
						$("#expiryMinutes").val(0);
					}
				} else {
					$("#expiryHours").val($("#applyHours").val());
					$("#expiryMinutes").val(parseInt(dMinut) + 1);
				}
			}
		});

		$("#applyMinutes").on("blur", function () {
			if (self.compareApplyExpire() == true) {

			} else {
				var dHr = $("#applyHours").val();
				var dMinut = $("#applyMinutes").val();
				if ($("#applyMinutes").val() == 59) {
					if ($("#applyHours").val() == 12) {
						$("#expiryHours").val(1);
						$("#expiryMinutes").val(0);
						if ($('#applyName :selected').text() == "AM") {

							$('#expiryName').val("PM").prop("selected", "selected");
						} else {

							$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#expiryName').val("AM").prop("selected", "selected");

						}
					} else if ($("#applyHours").val() == 11) {
						$("#expiryHours").val(12);
						$("#expiryMinutes").val(0);

						if ($('#applyName :selected').text() == "AM") {

							$('#expiryName').val("PM").prop("selected", "selected");
						} else if ($('#applyName :selected').text() == "PM") {
							$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							$('#expiryName').val("AM").prop("selected", "selected");
						}
					} else {

						$("#expiryHours").val(parseInt(dHr) + 1);
						$("#expiryMinutes").val(0);
					}
				} else {
					$("#expiryHours").val($("#downloadHours").val());
					$("#expiryMinutes").val(parseInt(dMinut) + 1);
				}
			}
		});

		self.compareApplyExpire = function () {
			var DownloadApplyOnDate = dateCompareForSchedule($("#applyDatePicker").val(), $("#applyHours").val(), $("#applyMinutes").val(), $("#applyName").val(), $("#expiryDatePicker").val(), $("#expiryHours").val(), $("#expiryMinutes").val(), $("#expiryName").val())
			if (DownloadApplyOnDate == 0) {
				return true;
			} else {
				return false;
			}
		}

		self.applyOnDateChecOnChange = function (id) {
			var dMinut = $("#downloadMinutes").val();
			if ($("#applyDatePicker").val() == $("#downloadDatePicker").val()) {

				var DownloadApplyOnDate = dateCompareForSchedule($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(), $("#applyDatePicker").val(), $("#applyHours").val(), $("#applyMinutes").val(), $("#applyName").val())
				if (DownloadApplyOnDate == 1) {

					//$("#" + id).val(parseInt($("#downloadMinutes").val()) + 1);
					if ($("#downloadMinutes").val() == 59) {
						if ($("#downloadHours").val() == 11) {
							$("#applyHours").val(12);
							$("#applyMinutes").val(0);
							if ($('#downloadName :selected').text() == "AM") {
								$('#applyName').val("PM").prop("selected", "selected");
							} else if ($('#downloadName :selected').text() == "PM") {
								$('#applyName').val("AM").prop("selected", "selected");
								$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							}
						} else if ($("#downloadHours").val() == 12) {
							$("#applyHours").val(1);
							$("#applyMinutes").val(0);
							$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
						}

					} else {
						$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));

						if (id == 'applyMinutes') {
							$("#applyMinutes").val(parseInt(dMinut) + 1);
						}
						if (id == 'applyHours') {
							$("#" + id).val($("#downloadHours").val());
						}
						if ($('#downloadName :selected').text() == "AM") {
							$('#applyName').val("AM").prop("selected", "selected");
						} else if ($('#downloadName :selected').text() == "PM") {
							$('#applyName').val("PM").prop("selected", "selected");
						}
					}


				}
			}
		}


		self.expireOnDateChecOnChange = function (id) {
			var dMinut = $("#applyMinutes").val();
			if ($("#applyDatePicker").val() == $("#expiryDatePicker").val()) {

				var DownloadApplyOnDate = dateCompareForSchedule($("#applyDatePicker").val(), $("#applyHours").val(), $("#applyMinutes").val(), $("#applyName").val(), $("#expiryDatePicker").val(), $("#expiryHours").val(), $("#expiryMinutes").val(), $("#expiryName").val())
				if (DownloadApplyOnDate == 1) {

					//$("#" + id).val(parseInt($("#applyMinutes").val()) + 1);

					if ($("#applyMinutes").val() == 59) {
						if ($("#applyHours").val() == 11) {
							$("#expiryHours").val(12);
							$("#expiryMinutes").val(0);
							if ($('#applyName :selected').text() == "AM") {
								$('#expiryName').val("PM").prop("selected", "selected");
							} else if ($('#applyName :selected').text() == "PM") {
								$('#expiryName').val("AM").prop("selected", "selected");
								$("#expiryDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
							}
						} else if ($("#applyHours").val() == 12) {
							$("#expiryHours").val(1);
							$("#expiryMinutes").val(0);
							$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT));
						}

					} else {

						if (id == 'expiryMinutes') {
							$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT));
							//$("#expiryHours").val($("#applyHours").val());
							$("#expiryMinutes").val(parseInt(dMinut) + 1);
						}
						if (id == 'expiryHours') {
							$("#" + id).val($("#applyHours").val());
						}
						if ($('#applyName :selected').text() == "AM") {
							$('#expiryName').val("AM").prop("selected", "selected");
						} else if ($('#applyName :selected').text() == "PM") {
							$('#expiryName').val("PM").prop("selected", "selected");
						}
					}



				}
			}
		}
		///////////////////////////////////////////Second Tab////////////////////////////////////////////////////////////////////////////////
		self.isNewJobCreatedStatus = ko.observable(false);

		self.newJobClick = function () {
			$("#advanceQuickSearchBtn").show();// Advance search
			$("#advanceQuickSearchSearchCriteria").show();
			$("#showHideResetExportbtn").show();

			//fetchGenerateJobName(self.jobName, self.isNewJobCreatedStatus);
		}

		//Generate Job Name
		$("#jobNameTxt").prop('value', koUtil.jobNameValContent);

		if ($("#tabSchedule").hasClass('active')) {
			if (checkflagForNewJobContent == 0) {
				fetchGenerateJobName(self.jobName, self.isNewJobCreatedStatus);
			} else {

			}
		}


		function fetchGenerateJobName(jobName, isNewJobCreatedStatus) {
			if ($("#jobNameTxt").val().trim() != '' && isNewJobCreatedStatus(true))
				return;

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						jobName(data.jobName);
						checkflagForNewJobContent = 1;
						koUtil.jobNameValContent = data.jobName;
						$("#jobNameTxt").val(koUtil.jobNameValContent);
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

		//Download variables
		self.chkDownloadOn = ko.observable();
		self.chkDownloadOn('Maintenance window');

		//Apply on Variables
		self.chkApplyOn = ko.observable();
		self.chkApplyOn('Immediately after download');

		//Expiry on Variables
		self.chkExpiryOn = ko.observable();
		self.chkExpiryOn('None');

		self.scheduleScreen = function () {
			$("#advanceQuickSearchBtn").hide();// Advance search
			$("#advanceQuickSearchSearchCriteria").hide();

			$("#selectedDevicesGrid").hide();
			$("#schduleGrid").show();
			$("#previousBtn").show();
			$("#submitBtn").show();
			$("#filterButtons").hide();

			var currentDate = moment(new Date()).format(currentDateShort);
			$('#downloadDatePicker').prop('value', currentDate);
			$('#applyDatePicker').prop('value', currentDate);
			$('#expiryDatePicker').prop('value', currentDate);
			$("#downloadDatePicker").datepicker({ minDate: 0 });
		}

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

		function packageIdsListClick(movedArray) {
			var packageIdsList = new Array();
			for (i = 0; i < movedArray.length; i++) {
				packageIdsList.push(movedArray[i].PackageId);
			}
			return packageIdsList;
		}

		//////////////////////////////////////////////////////////Download On Radio Button click///////////////////////////////////////
		self.dateDownload = ko.observable();
		self.chkDownloadAmPm = ko.observable(true);
		self.rbDownloadNextMaintenanceClick = function () {
			setEnabledStatusDownload(false);
			currentSelectedDownloadScheduleOption = "OnNextMaintenanceWindow";

			var now = new Date();              //update New time hwen click on radio button
			var dateobj = formatAMPM(now);
			$("#downloadDatePicker").val(currentDate);
			$("#downloadHours").val(dateobj.hours);
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
			setEnabledStatusDownload(false);
			currentSelectedDownloadScheduleOption = "Immediate";

			var now = new Date();              //update New time hwen click on radio button
			var dateobj = formatAMPM(now);
			$("#downloadDatePicker").val(currentDate);
			$("#downloadHours").val(dateobj.hours);
			//   $("#downloadMinutes").val(dateobj.minutes);
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
			ChkHours("downloadHours");

		})
		$("#applyHours").on('keyup', function () {
			ChkHours("applyHours");
		})

		$("#expiryHours").on('keyup', function () {
			ChkHours("expiryHours");
		})
		$("#downloadMinutes").on('keyup', function () {
			ChkMinutes("downloadMinutes");
		})
		$("#applyMinutes").on('keyup', function () {
			ChkMinutes("applyMinutes");
		})
		$("#expiryMinutes").on('keyup', function () {
			ChkMinutes("expiryMinutes");
		})

		$("#jobNameTxt").on("keyup", function () {

			if ($(this).val())
				$("#isJobNamevalidationMessage").hide();
			else
				$("#isJobNamevalidationMessage").show();
		});

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
		function setEnabledStatusDownload(isEnabled) {
			self.dateDownload(isEnabled);
			$("#downloadName").val("AM");
			$('#downloadDatePicker').prop('value', currentDateShort);
		}

		self.rbDownloadDateTimeclick = function () {
			setEnabledStatusDownload(true);
			$('#downloadDatePicker').prop('value', currentDateShort);
			self.chkApplyOn('Immediately after download');
			self.immediatelyAfterDownloadClick();
			self.chkExpiryOn('None');
			self.expiryNoneClick();
			currentSelectedDownloadScheduleOption = "SpecifiedDate";
			$("#downloadName").val(dateobj.ampm);

			return true;
		}

		//////////////////////////////////////////////////////////Start Apply On Radio Button click///////////////////////////////////////
		self.chkApplyAmPm = ko.observable(false);
		self.dateApply = ko.observable();

		self.immediatelyAfterDownloadClick = function () {
			setEnabledStatus_Apply(false);
			currentSelectedApplyScheduleOptionContent = "Immediate";
			var now = new Date();              //update New time hwen click on radio button
			var dateobj = formatAMPM(now);
			$("#applyDatePicker").val(currentDate);
			$("#applyHours").val(dateobj.hours);
			//  $("#applyMinutes").val(dateobj.minutes);
			if (dateobj.minutes == 59) {
				$("#applyMinutes").val('0');
			} else if (dateobj.minutes < 59) {
				$("#applyMinutes").val(parseInt(dateobj.minutes) + 1);
			} else {
				$("#applyMinutes").val(parseInt(dateobj.minutes));
			}

			$("#applyName").val(dateobj.ampm);

			return true;
		}

		self.rbApplyDateTimeclick = function () {

			setEnabledStatus_Apply(true);
			//ToDo
			currentSelectedApplyScheduleOptionContent = "SpecifiedDate";

			//new code 
			selectedDDLValue();
			var dMinut = $("#downloadMinutes").val();

			if (dMinut == 59) {
				if ($("#downloadHours").val() == 11) {
					$("#applyHours").val(12);
					$("#applyMinutes").val(0);
					if ($('#downloadName :selected').text() == "AM") {
						$('#applyName').val("PM").prop("selected", "selected");
					} else if ($('#downloadName :selected').text() == "PM") {
						$('#applyName').val("AM").prop("selected", "selected");
						$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
					}
				} else if ($("#downloadHours").val() == 12) {
					$("#applyHours").val(1);
					$("#applyMinutes").val(0);
					$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
				}

			} else {
				$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).format(SHORT_DATE_FORMAT));
				$("#applyHours").val($("#downloadHours").val());
				$("#applyMinutes").val(parseInt(dMinut) + 1);
			}
			var setdate = moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT);
			$('#applyDatePicker').datepicker({ autoclose: true, setDate: setdate });
			$('#applyDatePicker').datepicker('update');

			return true;
		}


		function setEnabledStatus_Apply(isEnabled) {
			self.dateApply(isEnabled);
			//$("#applyName").val("AM");
			var currentDate = moment(new Date()).format(currentDateShort);
			$('#applyDatePicker').prop('value', currentDate);
		}

		////////////////////////////////////////Expiry date Radio button click/////////////////////////
		self.dateExpiry = ko.observable();
		self.chkExpiryAmPm = ko.observable();
		self.expiryNoneClick = function () {
			setEnabledStatusExpiry(false);
			currentSelectedExpiryScheduleOption = "None";

			var now = new Date();              //update New time hwen click on radio button
			var dateobj = formatAMPM(now);
			$("#expiryDatePicker").val(currentDate);
			$("#expiryHours").val(dateobj.hours);
			//   $("#expiryMinutes").val(dateobj.minutes);
			if (dateobj.minutes == 59) {
				$("#expiryMinutes").val('0');
			} else if (dateobj.minutes < 59) {
				$("#expiryMinutes").val(parseInt(dateobj.minutes) + 1);
			} else {
				$("#expiryMinutes").val(parseInt(dateobj.minutes));
			}


			$("#expiryName").val(dateobj.ampm);

			return true;
		}

		function setEnabledStatusExpiry(isEnabled) {
			self.dateExpiry(isEnabled);
			var currentDate = moment(new Date()).format(currentDateShort);
			$('#expiryDatePicker').prop('value', currentDate);
			//$("#expiryName").val("AM");
		}

		self.rbExpiryDateTimeclick = function () {
			setEnabledStatusExpiry(true);
			//ToDo
			currentSelectedExpiryScheduleOption = "SpecifiedDate";

			//new code
			var dMinut = $("#applyMinutes").val();


			if (dMinut == 59) {
				if ($("#applyHours").val() == 11) {
					$("#expiryHours").val(12);
					$("#expiryMinutes").val(0);
					if ($('#applyName :selected').text() == "AM") {
						$('#expiryName').val("PM").prop("selected", "selected");
					} else if ($('#applyName :selected').text() == "PM") {
						$('#expiryName').val("AM").prop("selected", "selected");
						$("#expiryDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
					}
				} else if ($("#applyHours").val() == 12) {
					$("#expiryHours").val(1);
					$("#expiryMinutes").val(0);
					$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT));
				}

			} else {
				$("#expiryDatePicker").val(moment($("#applyDatePicker").val()).format(SHORT_DATE_FORMAT));
				$("#expiryHours").val($("#applyHours").val());
				$("#expiryMinutes").val(parseInt(dMinut) + 1);
			}


			var setdate = moment($("#expiryDatePicker").val()).format(SHORT_DATE_FORMAT);
			$('#expiryDatePicker').datepicker({ autoclose: true, setDate: setdate });
			$('#expiryDatePicker').datepicker('update');

			return true;

		}

		////////////////////Popup//////////////////////////////////////////////////////////////////////////////////////
		self.openConfirmationPopup = function () {
			var selectedDevices = $("#jqxgridForSelectedDevices").jqxGrid('getdatainformation');
			if (selectedDevices && selectedDevices.rowscount <= 0) {
				openAlertpopup(1, 'no_devices_for_content');
				return;
			}
			$('#downloadModelconfocontent').modal('show');
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
				$("#tabSchedule").removeClass('active');
				$("#tabSelectedDevice").addClass('active');
				$("#tabSelectedDevice").removeClass("disabled");
				$("#tabSchedule").removeClass("disabled");
				$("#selectedDevicesGrid").show();
				$("#schduleGrid").hide();
				$("#submitBtn").show();
				$("#nextSchedule").show();
			}
			$("#newJobBtn").attr("disabled", true);
			getContentSelectScheduleValues();
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
						maxScheduleContentCount = data.systemConfiguration.ConfigValue;
					}
				}
			}

			var method = 'GetSystemConfiguration';
			var params = '{"token":"' + TOKEN() + '","category":"' + category + '","configName":"' + configName + '"}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		self.submitClick = function () {
			//$("#newJobBtn").prop("disabled", true);
			if ($("#tabSchedule").hasClass('active')) {

				var datainfo = $("#jqxgridForSelectedDevices").jqxGrid('getdatainformation');
				var scheduledownCount = datainfo.rowscount;
				var retval = checkError();
				if (datainfo.rowscount < 0) {
					openAlertpopup(1, 'no_devices_for_content');
					return;
				}
				if (self.movedArray().length <= 0) {
					openAlertpopup(1, 'please_selct_content');
					return;
				}
				var returnValue = dateCompareForSchedule($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(),
					$("#expiryDatePicker").val(), $("#expiryHours").val(), $("#expiryMinutes").val(), $("#expiryName").val());

				var returnValueOfApply = dateCompareForSchedule($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(),
					$("#applyDatePicker").val(), $("#applyHours").val(), $("#applyMinutes").val(), $("#applyName").val());

				var returnValueDate = dateCompareForSchedule($("#applyDatePicker").val(), $("#applyHours").val(), $("#applyMinutes").val(), $("#applyName").val(),
					$("#expiryDatePicker").val(), $("#expiryHours").val(), $("#expiryMinutes").val(), $("#expiryName").val());

				//------------get current date and compare with downloaded on date-----------------
				var currentDate = new Date();
				var todayDate = displayDateOnEditScheduleDelivery(currentDate);
				var compareDate = dateCompareForSchedule($("#downloadDatePicker").val(), $("#downloadHours").val(), $("#downloadMinutes").val(), $("#downloadName").val(),
					todayDate.date, todayDate.hour, todayDate.min, todayDate.amPM);

				if (retval == null || retval == "") {
					if (includeInactiveDevicesForContent == true) {
						if ($('#rdoDateId').is(':checked') || $('#rdoExpiryDate').is(':checked') || $('#rdoApplyDate').is(':checked')) {
							if ($('#rdoDateId').is(':checked') && compareDate == 0) {
								openAlertpopup(1, 'schedule_not_performed_for_past');
								return;
							} else if ($('#rdoDateId').is(':checked') && $('#rdoApplyDate').is(':checked') && returnValueOfApply == 1) {
								openAlertpopup(1, 'installation_greter_than_downlaod');
								return;
							} else if (($('#rdoDateId').is(':checked') && $('#rdoExpiryDate').is(':checked') && returnValue == 1)
								|| $('#rdoApplyDate').is(':checked') && $('#rdoExpiryDate').is(':checked') && returnValueDate == 1) {
								openAlertpopup(1, 'expiration_date_cannot_be_past_apply');
								return;
							} else {
								self.openConfirmationPopup();
							}
						} else {
							self.openConfirmationPopup();
						}
						$("#active").show();
						$("#inActive").hide();
						$("#active").text(i18n.t('create_job_IncludeInactive_content', { scheduledownCount: scheduledownCount }, { lng: lang }));
					}
					else {
						if ($('#rdoDateId').is(':checked') || $('#rdoExpiryDate').is(':checked') || $('#rdoApplyDate').is(':checked')) {
							if ($('#rdoDateId').is(':checked') && compareDate == 0) {
								openAlertpopup(1, 'schedule_not_performed_for_past');
								return;
							} else if ($('#rdoDateId').is(':checked') && $('#rdoApplyDate').is(':checked') && returnValueOfApply == 1) {
								openAlertpopup(1, 'installation_greter_than_downlaod');
								return;
							} else if (($('#rdoDateId').is(':checked') && $('#rdoExpiryDate').is(':checked') && returnValue == 1)
								|| $('#rdoApplyDate').is(':checked') && $('#rdoExpiryDate').is(':checked') && returnValueDate == 1) {
								openAlertpopup(1, 'expiration_date_cannot_be_past_apply');
								return;
							} else {
								self.openConfirmationPopup();
							}
						} else {
							self.openConfirmationPopup();
						}
						$("#active").hide();
						$("#inActive").show();
						$("#inActive").text(i18n.t('create_job_exclude_inactive_devices', { lng: lang }));

					}

				}
			}
		}

		//----------get curent datetime-------------
		function displayDateOnEditScheduleDelivery(dateDetails) {
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

		self.submitBtnClicked = function () {
			var dateApply = new Date();
			var dateApplyInDevice = "";

			var downloadDateTime = new Date();
			var downloadDateTimeString = "";

			var scheduledReplaceDate = new Date();
			var expirationDateInDeviceTimezone = "";

			var time;
			var hours;
			var minutes;

			var isExpirationDateNone;

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

			//Apply hour
			var applyParseInt = $("#applyHours").val();
			var applyHour = parseInt(applyParseInt);
			if (applyHour == 12 && $('#applyName :selected').text() == "AM") {
				applyHour = 0;
			}
			else if ($('#applyName :selected').text() == "PM") {
				if (applyHour == 12)
					applyHour = 12;
				else
					applyHour = applyHour + 12;
			}

			//expiration hour
			var expiryParseInt = $("#expiryHours").val();
			var expiryHour = parseInt(expiryParseInt);
			if (expiryHour == 12 && $('#expiryName :selected').text() == "AM") {
				expiryHour = 0;
			}
			else if ($('#expiryName :selected').text() == "PM") {
				if (expiryHour == "12")
					expiryHour = 12;
				else
					expiryHour = expiryHour + 12;
			}

			/////////////////////////////////////////////////////////
			var date = moment().format(SHORT_DATE_FORMAT);
			var hours = moment().format('HH');
			var minutes = moment().format('mm');

			if (currentSelectedDownloadScheduleOption == "SpecifiedDate" && $("#downloadDatePicker").val() != '') {
				downloadDateTime = getUtcDate1($("#downloadDatePicker").val(), downloadHour, $("#downloadMinutes").val());
				downloadDateTimeString = getlocaldate1($("#downloadDatePicker").val(), downloadHour, $("#downloadMinutes").val());
			} else {

				downloadDateTime = getUtcDate1(date, hours, minutes);
				downloadDateTimeString = getlocaldate1(date, hours, minutes);
				console.log("Default downloadDateTimeString===" + downloadDateTimeString);
			}
			////////////////////////////////////////////////////////

			if (currentSelectedApplyScheduleOptionContent == "SpecifiedDate") {
				dateApply = getUtcDate1($("#applyDatePicker").val(), applyHour, $("#applyMinutes").val());
				dateApplyInDevice = getlocaldate1($("#applyDatePicker").val(), applyHour, $("#applyMinutes").val());
			} else {
				dateApply = getUtcDate1(date, hours, minutes);
				dateApplyInDevice = getlocaldate1(date, hours, minutes);
			}
			if (currentSelectedApplyScheduleOptionContent == "Immediate") {
				dateApply = downloadDateTime;
			}

			////////////////////////////////////////////////////////
			if ($('#rdoExpiryDate').is(':checked')) {
				scheduledReplaceDate = getUtcDate1($("#expiryDatePicker").val(), expiryHour, $("#expiryMinutes").val());
				expirationDateInDeviceTimezone = getlocaldate1($("#expiryDatePicker").val(), expiryHour, $("#expiryMinutes").val());
				isExpirationDateNone = false;
			}
			else if (self.chkExpiryOn('None')) {
				scheduledReplaceDate = getUtcDate1(date, hours, minutes);
				expirationDateInDeviceTimezone = getlocaldate1(date, hours, minutes);
				isExpirationDateNone = true;
			}

			///////////////////////////////////////////////////
			$('#downloadModelconfocontent').modal('hide');
			var CreateJobReq = new Object();
			var DownloadWindowInfo = new Object();
			var selector = new Object();
			var hour = 0;
			var ScheduleOption;
			var selector = new Object();

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

			var packageIdsList = packageIdsListClick(self.movedArray());

			var ApplyScheduleOption;

			if ($("#rdoImmediatelyAfterDownload").is(':checked')) {
				ApplyScheduleOption = ENUM.get('SCHEDULE_OPTION_IMMEDIATE');
			} else {
				ApplyScheduleOption = ENUM.get('SCHEDULE_OPTION_SPECIFIED_DATE');
			}

			CreateJobReq.ApplyScheduleOption = ApplyScheduleOption;
			CreateJobReq.DeviceActionTypes = null;
			CreateJobReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
			CreateJobReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

			DownloadWindowInfo.StartDate = null;
			DownloadWindowInfo.EndDate = null;
			DownloadWindowInfo.IsMHB = false;
			DownloadWindowInfo.NextNoOfDays = 0;
			CreateJobReq.DownloadWindowInfo = DownloadWindowInfo;
			CreateJobReq.IsExpirationDateNone = isExpirationDateNone;

			CreateJobReq.JobCategory = ENUM.get('JOB_CATEGORY_NORMAL');
			CreateJobReq.JobName = $("#jobNameTxt").val().trim();
			CreateJobReq.JobType = ENUM.get('JOB_TYPE_DOWNLOAD');
            CreateJobReq.PackageIds = packageIdsList;
            CreateJobReq.Packages = [];
            if (packageIdsList && packageIdsList.length > 0) {
                for (i = 0; i < packageIdsList.length; i++) {
                    var packageInfo = {};
                    packageInfo.PackageId = packageIdsList[i];
                    packageInfo.Sequence = i + 1;
                    CreateJobReq.Packages.push(packageInfo);
                }
            }
			CreateJobReq.PackageType = ENUM.get('Content');
			CreateJobReq.ParameterMode = ENUM.get('PARAMETER_MODE_NONE');
			CreateJobReq.SoftwareMode = ENUM.get('SOFTWARE_MODE_NONE');
			CreateJobReq.ReccuranceOptionInfo = null;
			CreateJobReq.Selector = selector;

			if ($("#rdoMaintainanceWindow").is(':checked')) {
				ScheduleOption = ENUM.get('SCHEDULE_OPTION_ON_NEXTMAINTAINANCE_WINDOW');
			} else if ($("#rdoNextContent").is(':checked')) {
				ScheduleOption = ENUM.get('SCHEDULE_OPTION_IMMEDIATE');
			} else {
				ScheduleOption = ENUM.get('SCHEDULE_OPTION_SPECIFIED_DATE');
			}
			console.log("createJSONTimeStamp(downloadDateTimeString)===" + createJSONTimeStamp(downloadDateTimeString));
			CreateJobReq.ScheduleOption = ScheduleOption;
			CreateJobReq.ScheduledDate = CreatJSONDate(downloadDateTime);
			CreateJobReq.ScheduledDateInDevice = createJSONTimeStamp(downloadDateTimeString);

			CreateJobReq.ScheduledReplaceDate = CreatJSONDate(scheduledReplaceDate);
			CreateJobReq.ExpirationDateInDevice = createJSONTimeStamp(expirationDateInDeviceTimezone);

			CreateJobReq.Tag = $("#tagTxt").val();
			CreateJobReq.IsFromLibrary = isFromContentLibrary;
			CreateJobReq.Component = ENUM.get("POS");

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						createJobId = data.createJobResp.JobId;
						failedDeviceCount = data.createJobResp.FailedDevicesCount;
						succeedDeviceCount = data.createJobResp.SucceededDevicesCount;

						koUtil.jobNameValContent = '';

						self.isNewJobCreatedStatus(true);

						$("#submitBtn").prop("disabled", true);

						$("#advanceQuickSearchBtn").hide();// Advance search
						$("#advanceQuickSearchSearchCriteria").hide();

						//$("#showHideResetExportbtn").show();
						$("#jobNameTxt").prop("disabled", true);
						$("#tagTxt").prop("disabled", true);
						$("#tabSelectedDevice").removeClass('active');
						$("#tabSelectedDevice").addClass("disabled");
						$("#tabSchedule").addClass("disabled");
						$("#previousBtn").addClass("disabled");
						//$("#tabSchedule").removeClass('active');
						$("#selectedDevicesGrid").hide();
						//$("#schduleGrid").hide();
						//$("#previousBtn").hide();

						//self.leftPackages();
						self.chkDownloadOn('Maintenance window');
						self.chkApplyOn('Immediately after download');
						self.chkExpiryOn('None');
						$("#schduleGrid").find("input, button, submit, textarea, select").prop("disabled", true);
						$("#accordionSchedulePanel").addClass("disabled");
						$("#accordionPackagePanel").addClass("disabled");
						var message = i18n.t(('content_job_for_scheduling'), { succeedDeviceCount: succeedDeviceCount, totalDeviceCount: totalDeviceCount }, { lng: lang });
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

				  //Maximum number of devices selected for scheduling the job exceeded the permitted limit (<Limit value>). Select fewer devices and try again.
					  var Limitvalue = maximumDownloadsPerJob;
					  var message = i18n.t(('max_scheduled_content_per_job_exceeded'), { Limitvalue: Limitvalue }, { lng: lang });
					  openAlertpopup(2, message);
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

		/////////////////////////////////////////////////Export and clear

		//Open poup
		self.alertModelPopup = ko.observable();
		self.checkExport = ko.observable(false);
		self.columnlist = ko.observableArray();
		self.templateFlag = ko.observable(false);
		var modelName = 'unloadTemplate';
		loadelement(modelName, 'genericPopup');


		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.alertModelPopup(elementname);
		}

		seti18nResourceData(document, resourceStorage);

		///--START----Res-storing previous selected schedule value
		if (!_.isEmpty(scheduleValuesGlobalObject) && !_.isEmpty(scheduleValuesGlobalObject.scheduleContent)) {
			if (!_.isEmpty(scheduleValuesGlobalObject.scheduleContent.downLoadOn)) {

				if (scheduleValuesGlobalObject.scheduleContent.tagText)
					$("#tagTxt").val(scheduleValuesGlobalObject.scheduleContent.tagText);

				var downloadOnValues = scheduleValuesGlobalObject.scheduleContent.downLoadOn;
				if (downloadOnValues.rdoMaintainanceWindow) {
					//$("#rdoMaintainanceWindow").prop("checked", true);
					self.chkDownloadOn($("#rdoMaintainanceWindow").val());
					self.rbDownloadNextMaintenanceClick()
				}
				else if (downloadOnValues.rdoNextContent) {
					self.chkDownloadOn($("#rdoNextContent").val());
					self.rbDownloadNextContactclick();
				}
				else if (downloadOnValues.rdoDateId) {
					self.chkDownloadOn($("#rdoDateId").val());
					self.rbDownloadDateTimeclick();
					$("#downloadDatePicker").val(downloadOnValues.downloadDatePicker);
					$("#downloadHours").val(downloadOnValues.downloadHours);
					$("#downloadMinutes").val(downloadOnValues.downloadMinutes);
					$("#downloadName").val(downloadOnValues.downloadName);
				}
			}

			if (!_.isEmpty(scheduleValuesGlobalObject.scheduleContent.applyOn)) {
				var applyOnValues = scheduleValuesGlobalObject.scheduleContent.applyOn;
				if (applyOnValues.rdoImmediatelyAfterDownload) {
					self.chkApplyOn($("#rdoImmediatelyAfterDownload").val());
					self.immediatelyAfterDownloadClick();
				}
				else if (applyOnValues.rdoApplyDate) {
					self.chkApplyOn($("#rdoApplyDate").val());
					self.rbApplyDateTimeclick();
					$("#applyDatePicker").val(applyOnValues.applyDatePicker);
					$("#applyHours").val(applyOnValues.applyHours);
					$("#applyMinutes").val(applyOnValues.applyMinutes);
					$("#applyName").val(applyOnValues.applyName);
				}
			}

			if (!_.isEmpty(scheduleValuesGlobalObject.scheduleContent.expireOn)) {
				var expireOnValues = scheduleValuesGlobalObject.scheduleContent.expireOn;
				if (expireOnValues.rdoExpiryNone) {
					self.chkExpiryOn($("#rdoExpiryNone").val());
					self.expiryNoneClick();
				}
				else if (expireOnValues.rdoExpiryDate) {
					self.chkExpiryOn($("#rdoExpiryDate").val());
					self.rbExpiryDateTimeclick();
					$("#expiryDatePicker").val(expireOnValues.expiryDatePicker);
					$("#expiryHours").val(expireOnValues.expiryHours);
					$("#expiryMinutes").val(expireOnValues.expiryMinutes);
					$("#expiryName").val(expireOnValues.expiryName);
				}
			}
		}
		///--END----Res-storing previous selected schedule value
	};

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
						includeInactiveDevicesForContent = false;
					} else {
						includeInactiveDevicesForContent = true;
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

	//Start Grid SECOND TAB Fetching data of selected packages in grid
	function packagesGridModel(packageData, movedArray) {
		// prepare the data
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
			getPackagesAndKeysForDevicesReq.IsFromLibrary = isFromContentLibrary;
		} else if (isFromContentLibrary) {
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
			getPackagesAndKeysForDevicesReq.IsFromLibrary = (selectedDownloadsActionsContent && selectedDownloadsActionsContent.length > 0) ? isFromContentLibrary : false;
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
			getPackagesAndKeysForDevicesReq.IsFromLibrary = isFromContentLibrary;
		}

		getPackagesAndKeysForDevicesReq.PackageType = ENUM.get('Content');
		getPackagesAndKeysForDevicesReq.DownloadType = "0";
		getPackagesAndKeysForDevicesReq.IsFromSoftwareAssignment = false;
		getPackagesAndKeysForDevicesReq.Selector = selector;
		

		var param = new Object();
		param.token = TOKEN();
		param.getPackagesAndKeysForDevicesReq = getPackagesAndKeysForDevicesReq;


		var callBackfunction = function (data, error) {
			$("#loadingDiv").hide();
			if (data && data.getPackagesAndKeysForDevicesResp) {
				data.getPackagesAndKeysForDevicesResp = $.parseJSON(data.getPackagesAndKeysForDevicesResp);
				if (data.getPackagesAndKeysForDevicesResp.AvailablePackages) {
					for (var i = 0; i < data.getPackagesAndKeysForDevicesResp.AvailablePackages.length; i++) {
						data.getPackagesAndKeysForDevicesResp.AvailablePackages[i].packageSelected = false;
					}
					packageData(data.getPackagesAndKeysForDevicesResp.AvailablePackages);
				}
				if (data.getPackagesAndKeysForDevicesResp.SelectedPackages) {
					for (var j = 0; j < data.getPackagesAndKeysForDevicesResp.SelectedPackages.length; j++) {
						data.getPackagesAndKeysForDevicesResp.SelectedPackages[j].packageSelected = false;
					}
					movedArray(data.getPackagesAndKeysForDevicesResp.SelectedPackages);

					$("#submitBtn").prop("disabled", false);
				}
				else {
					movedArray = new Array();
					selectedDownloadsActionsContent = [];
				}

				PackagesGrid(packageData(), 'jqxgridAvailablePackage');

				if (data.getPackagesAndKeysForDevicesResp.AvailablePackages == null && isMiddleMenuClicked == true) {
					koUtil.isFromScheduleScreen = 1;
					isMiddleMenuClicked = false;
					openAlertpopup(1, 'no_contents_qualify_for_the_selected_device_models');
				} else {
					koUtil.isFromScheduleScreen = 0;
				}
			} else if (error) {
				packageData(null);
			}
		}

		var method = 'GetPackagesAndKeysForDevices';
		var params = '{"token":"' + TOKEN() + '","getPackagesAndKeysForDevicesReq":' + JSON.stringify(getPackagesAndKeysForDevicesReq) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

	}

	function PackagesGrid(PackageData, gID) {
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
			localdata: PackageData,
			root: 'AvailablePackages',
			contentType: 'application/json',

			dataFields: [
				{ name: 'PackageId', map: 'PackageId' },
				{ name: 'PackageName', map: 'PackageName' },
				{ name: 'FileName', map: 'FileName' },
				{ name: 'isSelected', type: 'number' },
				{ name: 'DeviceFileName', map: 'DeviceFileName' },
				{ name: 'DeviceFileNameAlias', map: 'DeviceFileNameAlias' },
				{ name: 'DeviceFileLocation', map: 'DeviceFileLocation' },
				{ name: 'DeviceFileLocationAlias', map: 'DeviceFileLocationAlias' },
				{ name: 'TargetUser', map: 'TargetUser' },
				{ name: 'TargetUserAlias', map: 'TargetUserAlias' },
				],

		};


		//for filter UI
		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		}

		var rendered = function (element) {
			enableUiGridFunctions(gID, 'PackageId', element, gridStorage, true);
			return true;
		}
		var dataAdapter = new $.jqx.dataAdapter(source);

		this.gID = $('#jqxgridAvailablePackage');

		$("#jqxgridAvailablePackage").jqxGrid(
			{

				width: "100%",
				height: "400px",
				source: dataAdapter,
				altrows: true,
				sortable: true,
				filterable: true,
				editable: true,
				autoshowloadelement: true,
				pageSize: 1000,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				rowsheight: 32,
				showsortmenuitems: false,
				columnsResize: true,
				enabletooltips: true,
				autoshowfiltericon: true,

				columns: [
					{
						text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
						datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
							return '<div style="margin-left:0px;margin-top:0px"><div style="margin-top: 5px;"></div></div>';
						}, rendered: rendered
					},
					{
						text: '', datafield: 'PackageId', hidden: true, editable: false, minwidth: 50, filterable: false, sortable: false, menu: false,
					},
					{
						text: i18n.t('content_name', { lng: lang }), datafield: 'PackageName', editable: false, minwidth: 50,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('content_file', { lng: lang }), datafield: 'FileName', editable: false, minwidth: 50,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
				]
			}).on({
				filter: function (e) {
					gridSelectedArrayForSwap = [];
					gridSetRowDetailsforAvailGridDelivery(e);
					rowIndexForHighlighted = undefined;
					//isFilterData = true;
				},
				sort: function (e) {
					if (e.args.sortinformation.sortcolumn == null) {

					} else {
						gridSelectedArrayForSwap = [];
						$('#jqxgridAvailablePackage').jqxGrid('clearselection');
						rowIndexForHighlighted = undefined;
					}
				}
			});
		getUiGridBiginEdit('jqxgridAvailablePackage', 'PackageId', gridStorage);
	}
	//end grid Second Tab Fetching data of selected packages in grid
});

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

var gridSetRowDetailsforAvailGridDelivery = function (e) {
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

function selectedDDLValue() {

	var dHr = $("#downloadHours").val();
	var dMinut = $("#downloadMinutes").val();
	if ($("#downloadMinutes").val() == 59) {
		if ($("#downloadHours").val() == 12) {
			$("#applyHours").val(1);
			$("#applyMinutes").val(0);

			if ($('#downloadName :selected').text() == "AM") {

				$('#applyName').val("PM").prop("selected", "selected");
			} else {

				$("#applyDatePicker").val(moment($("#downloadDatePicker").val()).add('days', 1).format(SHORT_DATE_FORMAT));
				$('#applyName').val("AM").prop("selected", "selected");

			}
		} else {

			$("#applyHours").val(parseInt(dHr) + 1);
			$("#applyMinutes").val(0);
		}
	} else {
		$("#applyHours").val($("#downloadHours").val());
		$("#applyMinutes").val(parseInt(dMinut) + 1);
	}
};
