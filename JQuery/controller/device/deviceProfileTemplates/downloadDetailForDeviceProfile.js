define(["knockout", "advancedSearchUtil", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, ADSearchUtil, koUtil, autho) {

	SelectedIdOnGlobale = new Array();
	columnSortFilterForDownload = new Object();
	isPackagenotFound = new Object();
	var lang = getSysLang();
	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	return function detailDownloadStatusViewModel() {


		SelectedIdOnGlobale = new Array();
		checkALlPageId = 0;
		pagechangedcheck = 0;
		totalselectedRowCount = 0;

		var self = this;
		self.checksample = ko.observable();
		self.observableModelPopup = ko.observable();

		//For advanced search
		ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridDetailedDownloadProfile';
		ADSearchUtil.SearchForChart = false;
		ADSearchUtil.SearchForGrid = true;

		setMenuSelection();

		//For Clear Filter
		self.clearfilter = function (gId) {
			CallType = ENUM.get("CALLTYPE_NONE");
			gridFilterClear(gId);
		}

		// For Refresh Grid
		self.refreshGrid = function (gId) {
			gridRefresh(gId);
		}

		self.expandCriteria = function () {
			if ($("#deviceCriteriaDiv").hasClass('hide')) {
				$("#deviceCriteriaDiv").removeClass('hide');
				$("#expandQuickLinkDiv").empty();
				var str = '<a class="btn btn-default"  role="button" tabindex="0"  title="collapse"><i class="icon-angle-up"></i></a>';
				$("#expandQuickLinkDiv").append(str);
			} else {
				$("#deviceCriteriaDiv").addClass('hide')
				$("#expandQuickLinkDiv").empty();
				var str = '<a class="btn btn-default"  role="button" tabindex="0"  title="expand"><i class="icon-angle-down"></i></a>';
				$("#expandQuickLinkDiv").append(str);
			}
		}

		//Function For Get selected
		function getSelectedIds() {
			return SelectedIdOnGlobale;
		}

		//PopUp Functions
		self.packageName = ko.observableArray();
		self.downloadDetailModelPopUp = ko.observable();
		self.templateFlag = ko.observable(false);
		self.AdvanceTemplateFlag = ko.observable(false);
		self.columnlist = ko.observableArray();
		self.gridIdForShowHide = ko.observable();
		var compulsoryfields = ['SerialNumber', 'ScheduledDownloadDate', 'PackageName'];
		var modelName = 'unloadTemplate';
		loadelement(modelName, 'genericPopup');

		//For advanced search popup
		self.observableCriteria = ko.observable();
		loadCriteria('modalCriteria', 'genericPopup');
		ADSearchUtil.deviceSearchObj = new Object();

		ADSearchUtil.newAddedDataFieldsArr = [];
		ADSearchUtil.newAddedgridColumns = [];
		// ADSearchUtil.AdScreenName = 'downloadDetails';
		ADSearchUtil.ExportDynamicColumns = [];
		self.observableAdvancedSearchModelPopup = ko.observable();
		loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

		ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "Component", "HierarchyFullPath", "ModelName", "JobName", "JobStatus", "PackageName", "PackageVersion", "Description", "ComputedDeviceStatus", "Status", "DownloadProgress", "ScheduledDownloadDate", "StartDate", "DownloadDuration", "ActualInstalledDate", "FileName", "FileSize", "FullName", "JobCreatedOn", "StatusAdditionalInfo", "LastHeartBeat", "TaskSentDate"];
		modelReposition();
		self.openPopup = function (popupName, gId) {
			self.templateFlag(true);
			if (popupName == "modelShowHideCol") {
				self.gridIdForShowHide(gId);
				self.columnlist(''); //<!---advance search changes--->
				self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));

				for (var i = 0; i < self.columnlist().length; i++) {
					if ((koUtil.deviceFamily.toUpperCase() == AppConstants.get('MX_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('VX_FAMILY')) && self.columnlist()[i].columnfield == "Component") {
						self.columnlist.remove(self.columnlist()[i]);
						break;
					}
				}

				if (visibleColumnsList.length == 0) {
					var columns = self.columnlist();
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
				}

				loadelement(popupName, 'genericPopup');
				$('#viewDetailDownload').modal('show');
			} else if (popupName == "modelExportSucess") {
				loadelement(popupName, 'genericPopup');
				$('#viewDetailDownload').modal('show');;
			} else if (popupName == 'modelAdvancedSearch') {
				self.AdvanceTemplateFlag(true);
				loadAdvancedSearchModelPopup(popupName, 'genericPopup');
				$('#AdvanceSearchModal').modal('show');
			}
		}

		//Check rights
		self.checkRights = function (screenName, rightsFor) {
			var retval = autho.checkRightsBYScreen(screenName, rightsFor);
			//  reschuleBtnFlag = retval;
			return retval;
		}


		//For Load element
		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopup(elementname);
		}

		//for load criteria component 
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
		function loadAdvancedSearchModelPopup(elementname, controllerId) {// Advance Search

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


		//Unload Template
		self.unloadTempPopup = function (popupName, flage, gId, exportflage) {
			if (flage == 1) {
				for (var i = 0; i < hideColumnsArr.length; i++) {
					$("#" + hideColumnsArr[i].gridId).jqxGrid('hidecolumn', hideColumnsArr[i].column);
				}
				hideColumnsArr = [];
			}
			self.downloadDetailModelPopUp(popupName);
			self.observableModelPopup(popupName);
			if (gId != null) {
				if (exportflage != null && exportflage != false) {
					gridFilterClear(gId);
				}
			}
		};

		//unload advance serach popup
		self.unloadAdvancedSearch = function () {
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            $("#AdvanceSearchModal").modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
			isAdpopup = '';
		}
		self.clearAdvancedSearch = function () {
			self.observableAdvancedSearchModelPopup('unloadTemplate');
			loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
		}



		//-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
		$('#scheduleConfId').on('shown.bs.modal', function (e) {
			$('#btnStandardFileNo').focus();

		});
		$('#scheduleConfId').keydown(function (e) {
			if ($('#scheduleConfoNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#scheduleConfoYes').focus();
			}
		});

		$('#scheduleConfId').on('shown.bs.modal', function (e) {
			$('#scheduleConfoNo').focus();

		});
		$('#scheduleConfId').keydown(function (e) {
			if ($('#scheduleConfoNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#scheduleConfoYes').focus();
			}
		});
		//------------------------------------------------------------------------------------------------------------------------

		// focus on next tab index 
		lastIndex = 4;
		prevLastIndex = 3;
		$(document).keydown(function (e) {
			if (e.keyCode == 9) {
				var thisTab = +$(":focus").prop("tabindex") + 1;
				if (e.shiftKey) {
					if (thisTab == prevLastIndex) {
						$("#" + tabLimitInID).find('[tabindex=' + prevLastIndex + ']').focus();
						return false;
					}
				} else {
					if (thisTab == lastIndex) {
						$("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
						return false;
					}
				}
			}
		});

		var setTabindexLimit = function (x, standardFile, y) {
			console.log(x);
			startIndex = 2;
			lastIndex = x;
			prevLastIndex = y;
			tabLimitInID = standardFile;
		}
		setTabindexLimit(4, "scheduleConfId", 3);
		// end tabindex

		//ExportToExcel 
		self.exportToExcel = function (isExport, gId) {
			var selectedDetailedDownloadItems = getSelectedUniqueId(gId);
			var unselectedDetailedDownloadItems = getUnSelectedUniqueId(gId);
			var checkAll = checkAllSelected(gId);
			visibleColumnsList = GetExportVisibleColumn(gId);
			var param = detailedDownloadStatusParameter(true, columnSortFilterForDownload, ADSearchUtil.deviceSearchObj, selectedDetailedDownloadItems, unselectedDetailedDownloadItems, checkAll, visibleColumnsList);

			self.exportGridId = ko.observable(gId);
			self.exportSucess = ko.observable();
			self.exportflage = ko.observable();
			var datainfo = $("#" + gId).jqxGrid('getdatainformation');
			if (datainfo.rowscount > 0) {
				detailedDownloadExport(param, gId, self.openPopup);
			} else {
				openAlertpopup(1, 'no_data_to_export');
			}
		}
		//ExportToExcel Goes To this Function
		function detailedDownloadExport(param, gId, openPopup) {
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(1, 'export_Sucess');
					}
				}
			}

			var params = JSON.stringify(param);;
			ajaxJsonCall('GetDownloadResultsDetailsForDeviceProfile', params, callBackfunction, true, 'POST', true);
		}

		//Reschedule declare
		self.downloadDetailReschedule = function (gId) {
			var selectedIds = getSelectedUniqueId(gId);
			if ((selectedIds.length == 1) || (selectedIds.length > 1)) {
				$("#scheduleConfId").modal('show');
				$("#draggConfID").draggable();
			} else {
				openAlertpopup(1, 'there_are_no_downloads_selected_to_reschedule');
				$("#draggInfoID").draggable();
			}
		}

		//reschedule on jobstatus
		self.rescheduleDownload = function (gId) {
			var selectedMultiDataItems = getMultiSelectedData(gId);
			var unselectedItemIds = getUnSelectedUniqueId(gId);
			var checkALL = checkAllSelected(gId);
			var isContinue = false;

			detailedDownloadParameterReschedule(selectedMultiDataItems, unselectedItemIds, ADSearchUtil.deviceSearchObj, checkALL, gId, self.packageName, isContinue);
		}

		//reschedule when package not found
		self.reschedulePackage = function (gId, isContinue, observableModelPopup) {
			var selectedMultiDataItems = getMultiSelectedData(gId);
			var unselectedItemIds = getUnSelectedUniqueId(gId);
			var checkALL = checkAllSelected(gId);

			detailedDownloadParameterReschedule(selectedMultiDataItems, unselectedItemIds, ADSearchUtil.deviceSearchObj, checkALL, gId, self.packageName, isContinue);
		}

		//Grid Call
		var param = detailedDownloadStatusParameter(false, columnSortFilterForDownload, ADSearchUtil.deviceSearchObj, null, null, 0, []);
		detailedDownloadStatusGrid('jqxgridDetailedDownloadProfile', param);

		seti18nResourceData(document, resourceStorage);
	}// ModelView End

	// Reschedule Function call
	function detailedDownloadParameterReschedule(selectedMultiDataItems, unselectedItemIds, deviceSearchObj, checkALL, gId, packageName, isContinue) {
		createRescheduleJobReq = new Object();
		var UnselectedItemIds = new Array();
		var Selector = new Object();
		var schedule = new Array();

		for (var i = 0; i < selectedMultiDataItems.length; i++) {
			var eDownloadJob = new Object();
			if (checkALL == 1) {
				UnselectedItemIds = unselectedItemIds;
				eDownloadJob = null;
			} else {
				UnselectedItemIds = null;
				eDownloadJob = selectedMultiDataItems[i].TaskId;
			}
			schedule.push(eDownloadJob);
		}

		createRescheduleJobReq.CallType = ENUM.get("CALLTYPE_NONE");
		createRescheduleJobReq.DeviceSearch = deviceSearchObj;
		createRescheduleJobReq.IsContinue = isContinue;
		createRescheduleJobReq.PackageType = ENUM.get("Software");
		createRescheduleJobReq.TaskDetails = schedule;
		createRescheduleJobReq.UnselectedItemIds = UnselectedItemIds;
		createRescheduleJobReq.DeviceId = null;
		createRescheduleJobReq.ModelName = null;
		createRescheduleJobReq.UniqueDeviceId = 0;


		var callbackFunction = function (data, error, IsContinue) {
			self.isPackagenotFound = ko.observable(false);

			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					openAlertpopup(0, 'software_downloads_successfully_rescheduled');
					$('#draggDetailID').draggable();
					gridRefresh('jqxgridDetailedDownloadProfile');
				} else if (data.responseStatus.StatusCode == AppConstants.get('RESCHEDULE_PACKAGE_STATUS_CODE') && (data.createRescheduleJobResp.PackageNames == null)) {
					openAlertpopup(2, 'unable_to_reschedule_as_packages_associated_with_the_selected_job_are_removed_from_download_library');
				} else if (data.responseStatus.StatusCode == AppConstants.get('Package_Not_Found')) {
					openAlertpopup(2, data.responseStatus.StatusMessage);
				} else if (data.responseStatus.StatusCode == AppConstants.get('RESCHEDULE_PACKAGE_STATUS_CODE')) {
					packageName(data.createRescheduleJobResp.PackageNames);
					$("#modalScheduleID").modal('show');
				} else if (data.responseStatus.StatusCode == AppConstants.get('RESCHEDULE_PACKAGE_STATUS_CODE')) {
					openAlertpopup(2, 'Unable to Reschedule as Packages associated with the selected job are removed from Download Library.');
				} else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Exists')) {
					openAlertpopup(2, 'No_Eligible_Device_Exists_Include_Inactive_Devices');
				} else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Excluding_Inactive_Devices')) {
					openAlertpopup(2, 'No_Eligible_Device_Exists_Exclude_Inactive_Devices');
				}
			}
		}

		var method = 'CreateRescheduleJob';
		var params = '{"token":"' + TOKEN() + '" ,"createRescheduleJobReq":' + JSON.stringify(createRescheduleJobReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}



	// Calling Jqxgrid
	function detailedDownloadStatusGrid(gID, param) {

		//For Advanced search
		var gridColumns = [];
		CallType = ENUM.get("CALLTYPE_WEEK");
		var isFilter;
		if (isdetailedDownloadStatusGridFilter == undefined || isdetailedDownloadStatusGridFilter == false) {
			isFilter = false;
		} else {
			isFilter = true;
		}
		isdetailedDownloadStatusGridFilter = true;
		var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
		var gridStorage = InitGridStoragObj.gridStorage;
		var adStorage = InitGridStoragObj.adStorage;
		//CallType = InitGridStoragObj.CallType;

		var source =
		{
			dataType: "json",
			dataFields: [
				{ name: 'SerialNumber', map: 'DeviceDetail>SerialNumber' },
				{ name: 'TaskId', map: 'TaskId' },
				{ name: 'DeviceId', map: 'TaskDeviceId' },
				{ name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath', type: 'string' },
				{ name: 'ModelName', map: 'DeviceDetail>ModelName' },
				{ name: 'JobName', map: 'JobName' },
				{ name: 'JobStatus', map: 'JobStatus' },
				{ name: 'PackageName', map: 'PackageName' },
				{ name: 'PackageVersion', map: 'PackageVersion' },
				{ name: 'Description', map: 'Description' },
				{ name: 'ComputedDeviceStatus', map: 'DeviceDetail>ComputedDeviceStatus' },
				{ name: 'Status', map: 'Status' },
				{ name: 'ScheduledDownloadDate', map: 'ScheduledDownloadDate' },
				{ name: 'StartDate', map: 'StartDate' },
				{ name: 'DownloadDuration', type: 'DownloadDuration' },
				{ name: 'ActualInstalledDate', map: 'ActualInstalledDate' },
				{ name: 'FileName', map: 'FileName' },
				{ name: 'FileSize', map: 'FileSize' },
				{ name: 'FullName', map: 'CreatedBy' },
				{ name: 'TaskCreatedDate', map: 'TaskCreatedDate', type: 'date' },
				{ name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
				{ name: 'StatusAdditionalInfo', map: 'StatusAdditionalInfo' },
				{ name: 'LastHeartBeat', map: 'DeviceDetail>LastHeartBeat' },
				{ name: 'TaskSentDate', map: 'TaskSentDate' },
				{ name: 'isSelected', type: 'number' },
				{ name: 'IsAutoDownloadJob', map: 'IsAutoDownloadJob' },
				{ name: 'IsResheduleAllowed', map: 'ISRESHEDULEALLOWED' },
				{ name: 'IsRescheduled', map: 'IsRescheduled' },
				{ name: 'JobDownloadFailedReason', map: 'JobDownloadFailedReason' },
				{ name: 'DownloadFailedReason', map: 'DownloadFailedReason' },
				{ name: 'Protocol', map: 'Protocol' },
				{ name: 'IsCancelRequestFailed', map: 'IsCancelRequestFailed' },
				{ name: 'Component', map: 'Component' },
				{ name: 'DownloadAttempts', map: 'DownloadAttempts' },
				{ name: 'DownloadProgress', map: 'DownloadProgress' },
				{ name: 'PackageFileType', map: 'PackageFileType' }

			],
			root: 'DownloadResultsDetails',
			type: "POST",
			data: param,

			url: AppConstants.get('API_URL') + "/GetDownloadResultsDetailsForDeviceProfile",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data.getDownloadResultsDetailsForDeviceProfileResp)
					data.getDownloadResultsDetailsForDeviceProfileResp = $.parseJSON(data.getDownloadResultsDetailsForDeviceProfileResp);
				else
					data.getDownloadResultsDetailsForDeviceProfileResp = [];
				if (data.getDownloadResultsDetailsForDeviceProfileResp && data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse && data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse.TotalRecords > 0) {
					source.totalrecords = data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse.TotalPages;
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
				}
			},

		};


		var request =
		{
			formatData: function (data) {
				$('.all-disabled').show();
				disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh', 'rescheduleBtn']);
				columnSortFilter = new Object();
				columnSortFilter = columnSortFilterFormatedData(columnSortFilterForDownload, gID, gridStorage, 'DownloadDetailsForDeviceProfile', 'TaskCreatedDate');
				param.getDownloadResultsDetailsForDeviceProfileReq.ColumnSortFilter = columnSortFilter;
				param.getDownloadResultsDetailsForDeviceProfileReq.Pagination = getPaginationObject(param.getDownloadResultsDetailsForDeviceProfileReq.Pagination, gID);
				data = JSON.stringify(param);
				return data;
			},
			downloadComplete: function (data, status, xhr) {

				if (data.getDownloadResultsDetailsForDeviceProfileResp && data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails) {
					if (data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails.length > 0) {
						var taskIds = new Array();
						$("#rescheduleBtn").prop('disabled', false);
						for (var i = 0; i < data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails.length; i++) {
							data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].ScheduledDownloadDate = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].ScheduledDownloadDate);
							data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].StartDate = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].StartDate);
							data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].ActualInstalledDate = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].ActualInstalledDate);
							data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].TaskSentDate = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].TaskSentDate);
							data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].TaskCreatedDate = convertToLocaltimestamp(data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].TaskCreatedDate);

							var downloadStatus = data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].Status;
							var packageFileType = data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].PackageFileType;
							if (packageFileType == AppConstants.get('OTA') && (downloadStatus != AppConstants.get('InstallSuccessfulCount') && downloadStatus != AppConstants.get('DownloadFailedCount'))) {
								var taskId = new Object();
								taskId = data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails[i].TaskId;
								taskIds.push(taskId);
							}
						}

						if (taskIds.length > 0) {
							autoRefreshDownloadProgress(taskIds);
						} else {
							autoRefreshDownloadProgressStop();
						}
					}
				}

				enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh', 'rescheduleBtn']);
				if (data.getDownloadResultsDetailsForDeviceProfileResp && data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails) {
					if (data.getDownloadResultsDetailsForDeviceProfileResp.TotalSelectionCount != 'undefined') {
						gridStorage[0].TotalSelectionCount = data.getDownloadResultsDetailsForDeviceProfileResp.TotalSelectionCount;
						var updatedGridStorage = JSON.stringify(gridStorage);
						window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
					}
					if (data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse) {
						//if (data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse.HighLightedItemPage > 0) {
						//    gridStorage[0].highlightedPage = data.getDownloadResultsDetailsForDeviceProfileResp.PaginationResponse.HighLightedItemPage;
						//    var updatedGridStorage = JSON.stringify(gridStorage);
						//    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
						//}
					} else {

					}
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
					data.getDownloadResultsDetailsForDeviceProfileResp = new Object();
					data.getDownloadResultsDetailsForDeviceProfileResp.DownloadResultsDetails = [];
					$("#rescheduleBtn").prop('disabled', true);
				}
				$('.all-disabled').hide();
			}
		}
		var dataAdapter = intializeDataAdapter(source, request);

		var enableDownloadAutomation = function (row, columnfield, value, defaulthtml, columnproperties) {

			if (value == true) {
				return "Allowed";
			} else {
				return "Not Allowed";
			}

		}

		//for allcheck
		var rendered = function (element) {
			enablegridfunctions(gID, 'TaskId', element, gridStorage, true, 'pagerDivDetailDownload', true, 2, 'JobStatus', 'JobStatus', 'IsAutoDownloadJob', 'IsRescheduled', 'Protocol', null, null, 'IsResheduleAllowed');
			return true;
		}

		//for device profile
		function SerialNoRendereDownloadDetail(row, columnfield, value, defaulthtml, columnproperties) {
			var data = $("#" + gID).jqxGrid('getrowdata', row);

			var href = null;
			return '<div style="padding-left:10px;padding-top:9px;"><a href="index.html#deviceProfile/' + data.UniqueDeviceId + '" style="text-decoration:underline;" title="View Profile" >' + value + '</a></div>'
		}


		var cellbeginedit = function (row, datafield, columntype, value) {
			var datafield1 = $("#" + gID).jqxGrid('getcellvalue', row, 'JobStatus');
			var datafield2 = $("#" + gID).jqxGrid('getcellvalue', row, 'IsAutoDownloadJob');
			var datafield3 = $("#" + gID).jqxGrid('getcellvalue', row, 'IsResheduleAllowed');
			var datafield4 = $("#" + gID).jqxGrid('getcellvalue', row, 'IsRescheduled');
			var datafield5 = $("#" + gID).jqxGrid('getcellvalue', row, 'Protocol');

			if (datafield1 == 'Failed' && datafield2 == false && datafield3 == true && datafield4 == false && datafield5 == AppConstants.get('VEM_PROTOCOL')) {
				return true;
			} else {
				return false;
			}
		}

		var cellclass = function (row, columnfield, value) {
			var classname = genericCellClassDisablesrendererForDetails(row, columnfield, gID, 'JobStatus', 'IsAutoDownloadJob', 'IsResheduleAllowed', 'IsRescheduled', 'Protocol');
			return classname;
		}

		//Custom filter
		var buildFilterPanel = function (filterPanel, datafield) {
			genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
		}
		var buildFilterPanelDate = function (filterPanel, datafield) {
			genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

		}
		var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
			genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
		}

		// tootip renderer for job status
		var jobStatusToolTipRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = displayTooltipAndIconRenderer(gID, row, column, value, defaultHtml, 1);
			return defaultHtml;
		}

		var deviceStatusToolTipRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml)
			return defaultHtml;
		}

		var downStatusToolTiploadRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = dispalyTooltipIcon_DownloadStatus(gID, row, column, value, defaultHtml, 0);
			return defaultHtml;
		}

		var downloadProgressRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = downloadProgressRendererForJobs(gID, row, column, value, defaultHtml);
			return defaultHtml;
		}

		var downloadDurationRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = displayTooltipForDownloadDuration(gID, row, column, value, defaultHtml);
			return defaultHtml;
		}

		//For Advanced search
		gridColumns = [
			{
				text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit,
				cellclassname: cellclass, datafield: 'isSelected', width: 40, renderer: function () {
					return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
				}, rendered: rendered
			},

			{
				text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 100, filtertype: "custom", enabletooltips: false,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('component', { lng: lang }), dataField: 'Component', editable: false, minwidth: 120, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Component');
				}
			},

			{
				text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 130, filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},

			{
				text: i18n.t('job_name', { lng: lang }), datafield: 'JobName', editable: false, minwidth: 100, filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('job_status', { lng: lang }), datafield: 'JobStatus', editable: false, minwidth: 100, enabletooltips: false, cellsrenderer: jobStatusToolTipRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Download\/Content Job Status');
				}
			},
			{
				text: i18n.t('package_application_nm', { lng: lang }), datafield: 'PackageName', editable: false, minwidth: 160,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('package_application_version', { lng: lang }), datafield: 'PackageVersion', editable: false, minwidth: 160, filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 130, enabletooltips: false, cellsrenderer: deviceStatusToolTipRenderer,

				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
				}
			},
			{
				text: i18n.t('Download_Status_lbl', { lng: lang }), datafield: 'Status', editable: false, minwidth: 130, enabletooltips: false, cellsrenderer: downStatusToolTiploadRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Software Job Task Status');
				}
			},
			{
				text: 'Progress', datafield: 'DownloadProgress', editable: false, sortable: false, filterable: false, menu: false, minwidth: 150, enabletooltips: false, cellsrenderer: downloadProgressRenderer,
			},
			{
				text: i18n.t('download_scheduled_col', { lng: lang }), datafield: 'ScheduledDownloadDate', editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 160, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			},
			{
				text: i18n.t('download_started_at', { lng: lang }), datafield: 'StartDate', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 160, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}

			},
			{
				text: i18n.t('download_duration', { lng: lang }), datafield: 'DownloadDuration', editable: false, minwidth: 120, cellsrenderer: downloadDurationRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('installed_at', { lng: lang }), datafield: 'ActualInstalledDate', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 160, enabletooltips: false, filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}

			},
			{
				text: i18n.t('content_file', { lng: lang }), datafield: 'FileName', editable: false, minwidth: 100,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('fileSize_mb', { lng: lang }), datafield: 'FileSize', editable: false, minwidth: 100,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('created_by', { lng: lang }), datafield: 'FullName', editable: false, minwidth: 100,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('createdOn', { lng: lang }), datafield: 'TaskCreatedDate', editable: false, minwidth: 150, cellsformat: LONG_DATETIME_GRID_FORMAT,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}

			},
			{
				text: i18n.t('additional_info', { lng: lang }), datafield: 'StatusAdditionalInfo', hidden: true, editable: false, minwidth: 120, filterable: true,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},

			{
				text: i18n.t('last_Mgmt_plan', { lng: lang }), datafield: 'TaskSentDate', cellsformat: LONG_DATETIME_GRID_FORMAT, hidden: true, editable: false, minwidth: 160, filterable: true, enabletooltips: false, filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			}
		];

		$("#" + gID).jqxGrid(
			{
				width: "100%",
				height: gridHeightFunction(gID, "50"),
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
				rowsheight: 32,
				enabletooltips: true,
				rendergridrows: function () {
					return dataAdapter.records;
				},
				ready: function () {
					callOnGridReady(gID, gridStorage, CallType, 'JobCreatedOn');
					//CallType = addDefaultfilter(CallType, 'JobCreatedOn', gID);

					var columns = genericHideShowColumn(gID, true, ['StatusAdditionalInfo', 'TaskSentDate']);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					koUtil.gridColumnList.push('LastHeartBeat');
					visibleColumnsList = koUtil.gridColumnList;
					if (koUtil.Protocol == 'Zontalk') {
						$("#" + gID).jqxGrid('hidecolumn', 'ActualInstalledDate');
					}
					if (koUtil.deviceFamily.toUpperCase() == AppConstants.get('MX_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('VX_FAMILY')) {
						$("#" + gID).jqxGrid('hidecolumn', 'Component');
					}
				},
				autoshowfiltericon: true,
				columns: gridColumns

			});//JqxGrid End

		getGridBiginEdit(gID, 'TaskId', gridStorage);
		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'TaskId');




	} //Grid Function End

	//Grid parameter
	function detailedDownloadStatusParameter(isExport, columnSortFilterForDownload, deviceSearchObj, selectedDetailedDownloadItems, unselectedDetailedDownloadItems, checkAll, visibleColumns) {


		var getDownloadResultsDetailsForDeviceProfileReq = new Object();
		var Export = new Object();
		var Selector = new Object();
		var Pagination = new Object();
		var UniqueDeviceId = new Object();
		var coulmnfilter = new Object();

		Pagination.HighLightedItemId = null
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
		Export.ExportReportType = ENUM.get("DownloadStatus");

		Export.DynamicColumns = null;
		Export.VisibleColumns = visibleColumns;
		if (checkAll == 1) {
			Selector.SelectedItemIds = null;
			Selector.UnSelectedItemIds = unselectedDetailedDownloadItems;
			if (isExport == true) {
				Export.IsAllSelected = true;
				Export.IsExport = true;
				Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
			} else {
				Export.IsAllSelected = false;
				Export.IsExport = false;
			}
		} else {
			Selector.SelectedItemIds = selectedDetailedDownloadItems;
			Selector.UnSelectedItemIds = null;
			if (isExport == true) {
				Export.IsAllSelected = false;
				Export.IsExport = true;
				Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
			} else {
				Export.IsAllSelected = false;
				Export.IsExport = false;
			}
		}

		var ColumnSortFilter = columnSortFilterForDownload;
		FilterList = new Array();
		coulmnfilter.ColumnType = null;
		coulmnfilter.FilterColumn = null;
		coulmnfilter.FilterDays = null;
		coulmnfilter.FilterValue = null;
		coulmnfilter.FilterValueOptional = null;

		FilterList.push(coulmnfilter);


		getDownloadResultsDetailsForDeviceProfileReq.ColumnSortFilter = ColumnSortFilter;
		getDownloadResultsDetailsForDeviceProfileReq.DeviceId = koUtil.deviceId;
		getDownloadResultsDetailsForDeviceProfileReq.ModelName = koUtil.ModelName;
		getDownloadResultsDetailsForDeviceProfileReq.Export = Export;
		getDownloadResultsDetailsForDeviceProfileReq.PackageType = ENUM.get("Software");
		getDownloadResultsDetailsForDeviceProfileReq.Pagination = Pagination;
		getDownloadResultsDetailsForDeviceProfileReq.Selector = Selector;
		getDownloadResultsDetailsForDeviceProfileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

		var param = new Object();
		param.token = TOKEN();
		param.getDownloadResultsDetailsForDeviceProfileReq = getDownloadResultsDetailsForDeviceProfileReq;

		return param;
	}
	//end grid parameter

	function autoRefreshDownloadProgress(taskIds) {
		window.clearInterval(autoRefreshIntervalId);
		autoRefreshIntervalId = setInterval(function () {
			getJobsDownloadProgress(taskIds);
		}, 10000);
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

});