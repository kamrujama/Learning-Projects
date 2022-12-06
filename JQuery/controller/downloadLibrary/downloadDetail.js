define(["knockout", "koUtil", "autho", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho, ADSearchUtil) {

	SelectedIdOnGlobale = new Array();
	columnSortFilterForDownload = new Object();
	isPackagenotFound = new Object();
	koUtil.GlobalColumnFilter = new Array();

	var lang = getSysLang();
	var reschuleBtnFlag = false;

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

		//Draggable function
		$('#mdlAdvanceSearchForDwdDetailHeader').mouseup(function () {
			$("#mdlAdvanceSearchForDwdDetailContent").draggable({ disabled: true });
		});

		$('#mdlAdvanceSearchForDwdDetailHeader').mousedown(function () {
			$("#mdlAdvanceSearchForDwdDetailContent").draggable({ disabled: false });
		});
		////////////////

		//Check rights
		self.checkRights = function (screenName, rightsFor) {
			var retval = autho.checkRightsBYScreen(screenName, rightsFor);
			//  reschuleBtnFlag = retval;
			return retval;
		}

		$('#rescheduleBtn').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#rescheduleBtn').click();
			}
		});

		//-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
		$('#modalScheduleID').on('shown.bs.modal', function (e) {
			$('#modalScheduleID_Confo_No').focus();

		});
		$('#modalScheduleID').keydown(function (e) {
			if ($('#modalScheduleID_Confo_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#modalScheduleID_Confo_Yes').focus();
			}
		});
		//------------------------------------------------------------------------------------------------------------------------

		self.checksample = ko.observable();
		self.observableModelPopup = ko.observable();

		//For advanced search
		ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridDetailedDownload';
		ADSearchUtil.SearchForChart = false;
		ADSearchUtil.SearchForGrid = true;

		setMenuSelection();

		//For Clear Filter
		self.clearfilter = function (gId) {

			var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
			gridStorage[0].CallType = ENUM.get("CALLTYPE_NONE");
			CallType = gridStorage[0].CallType;
			var updatedGridStorage = JSON.stringify(gridStorage);
			window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);
			///end

			//CallType = ENUM.get("CALLTYPE_NONE");
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
				var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Collapse"><i class="icon-angle-up"></i></a>';
				$("#expandQuickLinkDiv").append(str);
			} else {
				$("#deviceCriteriaDiv").addClass('hide')
				$("#expandQuickLinkDiv").empty();
				var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Expand"><i class="icon-angle-down"></i></a>';
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
		var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'ComputedDeviceStatus', 'HierarchyFullPath'];
		var modelName = 'unloadTemplate';
		loadelement(modelName, 'genericPopup');

		//For advanced search popup
		self.observableCriteria = ko.observable();
		loadCriteria('modalCriteria', 'genericPopup');
		ADSearchUtil.deviceSearchObj = new Object();

		ADSearchUtil.newAddedDataFieldsArr = [];
		ADSearchUtil.newAddedgridColumns = [];
		ADSearchUtil.AdScreenName = 'downloadDetails';
		ADSearchUtil.ExportDynamicColumns = [];
		self.observableAdvancedSearchModelPopup = ko.observable();
		loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

		ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "ModelName", "ComputedDeviceStatus", "HierarchyFullPath", "JobName", "JobStatus", "PackageName", "PackageVersion", "Component", "Description", "ComputedDeviceStatus", "Status", "DownloadProgress", "ScheduledDownloadDate", "StartDate", "DownloadDuration", "ActualInstalledDate", "FileName", "FileSize", "FullName", "TaskCreatedDate", "StatusAdditionalInfo", "LastHeartBeat", "TaskSentDate"];
		modelReposition();
		self.openPopup = function (popupName, gId) {
			self.templateFlag(true);
			if (popupName == "modelShowHideCol") {
				self.gridIdForShowHide(gId);
				self.columnlist(''); //<!---advance search changes--->
				self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));

				if (visibleColumnsList.length == 0) {
					var columns = self.columnlist();
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
				}

				//<!---advance search changes--->
				var arr = self.columnlist();
				for (var i = 0; i < arr.length; i++) {
					if ($.inArray(arr[i].columnfield, ADSearchUtil.initColumnsArr) < 0) {
						var source = _.where(ADSearchUtil.localDynamicColumns, { datafield: arr[i].columnfield });//////
						if (source == '') {
							self.columnlist.remove(arr[i]);
						}
					}
				}

				//For advanced search popup
				if (ADSearchUtil.resetAddSerchFlag == 'reset') {
					for (var i = 0; i < ADSearchUtil.newAddedgridColumns.length; i++) {
						var source = _.where(self.columnlist(), { columnfield: ADSearchUtil.newAddedgridColumns[i].datafield });
						if (source != '') {
							self.columnlist.remove(source[0]);
						}
					}
				}

				loadelement(popupName, 'genericPopup');
				$('#viewDetailDownload').modal('show');
			} else if (popupName == "modelExportSucess") {
				loadelement(popupName, 'genericPopup');
				$('#viewDetailDownload').modal('show');
			} else if (popupName == 'modelAdvancedSearch') {
				self.AdvanceTemplateFlag(true);
				loadAdvancedSearchModelPopup(popupName, 'genericPopup');
				$('#AdvanceSearchModal').modal('show');
			}
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
			$('#viewDetailDownload').modal('hide');
			if (gId != null) {
				if (exportflage != null && exportflage != false) {
					gridFilterClear(gId);
				}
			}
		};

		//unload advance serach popup
		self.unloadAdvancedSearch = function () {
			repositionAdvanceSearchPopUp("mdlAdvanceSearchForDwdDetailContent");
			ClearAdSearch = 0;
			self.observableAdvancedSearchModelPopup('unloadTemplate');
			$("#AdvanceSearchModal").modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
			isAdpopup = '';
		}
		self.clearAdvancedSearch = function () {
			repositionAdvanceSearchPopUp("mdlAdvanceSearchForDwdDetailContent");
			self.observableAdvancedSearchModelPopup('unloadTemplate');
			loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
		}

		//focus on first textbox
		$('#scheduleConfId').on('shown.bs.modal', function () {
			$('#scheduleConfoNo').focus();
		});

		$('#scheduleConfId').keydown(function (e) {
			if ($('#scheduleConfoNo').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#scheduleConfoYes').focus();
			}
		});

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
			ajaxJsonCall('GetDownloadResultsDetails', params, callBackfunction, true, 'POST', true);
		}

		//Reschedule declare
		self.downloadDetailReschedule = function (gId) {
			var selectedIds = getSelectedUniqueId(gId);
			if ((selectedIds.length == 1) || (selectedIds.length > 1)) {
				$("#scheduleConfId").modal('show');
				$("#draggConfID").draggable();
			} else {
				if (checkAllSelected('jqxgridDetailedDownload') == 1) {
					$("#scheduleConfId").modal('show');
					$("#draggConfID").draggable();
				} else {
					openAlertpopup(1, 'there_are_no_downloads_selected_to_reschedule');
					$("#draggInfoID").draggable();
				}
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

		self.resizeColumns = function (gId) {
			$("#modalResizeResetColumnsConfirmation").modal('show');
			$("#resizeResetColumnsConfirmationMessage").text(i18n.t('save_resized_columns_confirmation', { lng: lang }));

			globalGridColumns = new Object();
			globalGridColumns.gId = gId;
			globalGridColumns.gridName = 'DetailedDownloadStatus';
			globalGridColumns.isColumnResized = true;
			globalGridColumns.gridColumns = ADSearchUtil.initColumnsArr;
		}

		self.resetColumns = function (gId) {
			$("#modalResizeResetColumnsConfirmation").modal('show');
			$("#resizeResetColumnsConfirmationMessage").text(i18n.t('reset_resized_columns_confirmation', { lng: lang }));

			globalGridColumns = new Object();
			globalGridColumns.gId = gId;
			globalGridColumns.gridName = 'DetailedDownloadStatus';
			globalGridColumns.isColumnResized = false;
			globalGridColumns.gridColumns = [];
		}

		//Grid Call
		var param = detailedDownloadStatusParameter(false, columnSortFilterForDownload, ADSearchUtil.deviceSearchObj, null, null, 0, []);
		detailedDownloadStatusGrid('jqxgridDetailedDownload', param, self.observableAdvancedSearchModelPopup);
		seti18nResourceData(document, resourceStorage);
	}// ModelView End

	// Reschedule Function call
	function detailedDownloadParameterReschedule(selectedMultiDataItems, unselectedItemIds, deviceSearchObj, checkALL, gId, packageName, isContinue) {
		createRescheduleJobReq = new Object();
		var UnselectedItemIds = new Array();
		var Selector = new Object();
		var schedule = new Array();

		if (checkALL == 1) {
			schedule = null;
			if (unselectedItemIds.length > 0)
				UnselectedItemIds = unselectedItemIds;
			else
				UnselectedItemIds = null;
		}
		else {
			for (var i = 0; i < selectedMultiDataItems.length; i++) {
				var eDownloadJob = new Object();
				UnselectedItemIds = null;
				eDownloadJob = selectedMultiDataItems[i].TaskId;
				schedule.push(eDownloadJob);
			}
		}
		createRescheduleJobReq.CallType = CallType;
		createRescheduleJobReq.DeviceSearch = deviceSearchObj;
		createRescheduleJobReq.IsContinue = isContinue;
		createRescheduleJobReq.PackageType = ENUM.get("Software");
		createRescheduleJobReq.TaskDetails = schedule;
		createRescheduleJobReq.UnselectedItemIds = UnselectedItemIds;
		createRescheduleJobReq.DeviceId = null;
		createRescheduleJobReq.ModelName = null;
		createRescheduleJobReq.UniqueDeviceId = 0;

		createRescheduleJobReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

		var callbackFunction = function (data, error, IsContinue) {
			self.isPackagenotFound = ko.observable(false);

			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					openAlertpopup(0, 'software_downloads_successfully_rescheduled');
					$('#draggDetailID').draggable();
					//  gridRefresh('jqxgridDetailedDownload');
					gridRefreshClearSelection('jqxgridDetailedDownload');
				} else if (data.responseStatus.StatusCode == AppConstants.get('RESCHEDULE_PACKAGE_STATUS_CODE') && (data.createRescheduleJobResp.PackageNames == null)) {
					openAlertpopup(2, 'unable_to_reschedule_as_packages_associated_with_the_selected_job_are_removed_from_download_library');
				} else if (data.responseStatus.StatusCode == AppConstants.get('Package_Not_Found')) {
					openAlertpopup(2, data.responseStatus.StatusMessage);
				} else if (data.responseStatus.StatusCode == AppConstants.get('RESCHEDULE_PACKAGE_STATUS_CODE')) {
					packageName(data.createRescheduleJobResp.PackageNames);
					$("#modalScheduleID").modal('show');
				} else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Exists')) {
					openAlertpopup(2, 'No_Eligible_Device_Exists_Include_Inactive_Devices');
				} else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Excluding_Inactive_Devices')) {
					openAlertpopup(2, 'No_Eligible_Device_Exists_Exclude_Inactive_Devices');
				} else if (data.responseStatus.StatusCode == AppConstants.get('RESCHEDULE_PACKAGE_STATUS_CODE')) {
					openAlertpopup(2, 'Unable to Reschedule as Packages associated with the selected job are removed from Download Library.');
				}
			}
		}

		var method = 'CreateRescheduleJob';
		var params = '{"token":"' + TOKEN() + '" ,"createRescheduleJobReq":' + JSON.stringify(createRescheduleJobReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}



	// Calling Jqxgrid
	function detailedDownloadStatusGrid(gID, param, modelPopup) {

		var gridheight = $(window).height();
		var percentValue;
		if (gridheight > 600) {
			percentValue = (20 / 100) * gridheight;
			gridheight = gridheight - 150;

			gridheight = gridheight - percentValue + 'px';


		} else {
			gridheight = '400px';
		}


		//For Advanced search
		var gridColumns = [];
		var DynamicColumns = [];
		var initfieldsArr = [];
		var sourceDataFieldsArr = [
			{ name: 'isSelected', type: 'number' },
			{ name: 'UniqueDeviceId', map: 'UNIQUEDEVICEID' },
			{ name: 'SerialNumber', map: 'SERIALNUMBER' },
			{ name: 'TaskId', map: 'TASKID' },
			{ name: 'DeviceId', map: 'TASKDEVICEID' },
			{ name: 'Component', map: 'COMPONENT' },
			{ name: 'HierarchyFullPath', map: 'HIERARCHYFULLPATH', type: 'string' },
			{ name: 'ModelName', map: 'MODELNAME' },
			{ name: 'JobName', map: 'JOBNAME' },
			{ name: 'JobStatus', map: 'COMPJOBSTATUS' },
			{ name: 'StatusAdditionalInfo', map: 'STATUSADDITIONALINFO' },
			{ name: 'PackageName', map: 'PACKAGENAME' },
			{ name: 'PackageVersion', map: 'VERSION' },
			{ name: 'Description', map: 'DESCRIPTION' },
			{ name: 'ComputedDeviceStatus', map: 'COMPUTEDDEVICESTATUS' },
			{ name: 'Status', map: 'STATUS' },
			{ name: 'DownloadProgress', map: 'PERCENTAGEOFDOWNLOAD' },
			{ name: 'ScheduledDownloadDate', map: 'SCHEDULEDDOWNLOADDATE' },
			{ name: 'StartDate', map: 'STARTDATE' },
			{ name: 'DownloadDuration', map: 'DOWNLOADDURATION' },
			{ name: 'ActualInstalledDate', map: 'INSTALLEDDATE' },
			{ name: 'FileName', map: 'FILENAME' },
			{ name: 'FileSize', map: 'FILESIZEINMB' },
			{ name: 'FullName', map: 'DWCREATEDBYUSERNAME' },
			{ name: 'LOGINNAME', map: 'LOGINNAME' },
			{ name: 'TaskCreatedDate', map: 'TASKCREATEDDATE', type: 'date' },
			{ name: 'Protocol', map: 'PROTOCOL' },
			{ name: 'TaskSentDate', map: 'TASKSENTDATE' },
			{ name: 'LastHeartBeat', map: 'LASTHEARTBEAT' },
			{ name: 'IsResheduleAllowed', map: 'ISRESHEDULEALLOWED' },
			{ name: 'IsRescheduled', map: 'ISRESCHEDULED' },
			{ name: 'PackageFileType', map: 'PACKAGEFILETYPE' },
			{ name: 'IsAutoDownloadJob', map: 'ISAUTODOWNLOADJOB' },
			{ name: 'DownloadFailedReason', map: 'DOWNLOADFAILEDREASON' },
			{ name: 'IsCancelRequestFailed', map: 'ISCANCELREQUESTFAILED' },
			{ name: 'AdditionalStatusInfo', map: 'ADDITIONALSTATUSINFO' }
		];

		var InitGridStoragObj = initGridStorageObj(gID, ENUM.get("CALLTYPE_DAY"));
		var gridStorage = InitGridStoragObj.gridStorage;
		var adStorage = InitGridStoragObj.adStorage;
		CallType = InitGridStoragObj.CallType;

		var source =
		{
			dataType: "json",
			dataFields: sourceDataFieldsArr,
			root: 'DownloadResultsDetails',
			type: "POST",
			data: param,

			url: AppConstants.get('API_URL') + "/GetDownloadResultsDetails",
			contentType: 'application/json',
			beforeprocessing: function (data) {

				if (data.getDownloadResultsDetailsResp)
					data.getDownloadResultsDetailsResp = $.parseJSON(data.getDownloadResultsDetailsResp);
				else
					data.getDownloadResultsDetailsResp = [];
				if (data.getDownloadResultsDetailsResp && data.getDownloadResultsDetailsResp.PaginationResponse && data.getDownloadResultsDetailsResp.PaginationResponse.TotalRecords > 0) {
					source.totalrecords = data.getDownloadResultsDetailsResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getDownloadResultsDetailsResp.PaginationResponse.TotalPages;
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
				}
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
					//disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh', 'rescheduleBtn']);
					columnSortFilter = new Object();
					columnSortFilter = columnSortFilterFormatedData(columnSortFilterForDownload, gID, gridStorage, 'DetailedDownloadStatus', 'TaskCreatedDate');

					koUtil.GlobalColumnFilter = columnSortFilter;
					param.getDownloadResultsDetailsReq.ColumnSortFilter = columnSortFilter;

					param.getDownloadResultsDetailsReq.CallType = CallType;

					param.getDownloadResultsDetailsReq.Pagination = getPaginationObject(param.getDownloadResultsDetailsReq.Pagination, gID);

					var adStorage = JSON.parse(sessionStorage.getItem(gID + "adStorage"));
					if (adStorage[0].isAdSearch == 0) {
						if (adStorage[0].adSearchObj) {
							ADSearchUtil.deviceSearchObj = adStorage[0].adSearchObj;
						} else {
							ADSearchUtil.deviceSearchObj = null;
						}
					} else {
						if (adStorage[0].quickSearchObj) {
							ADSearchUtil.deviceSearchObj = adStorage[0].quickSearchObj;
						} else {
							ADSearchUtil.deviceSearchObj = null;
						}
					}

					updatepaginationOnState(gID, gridStorage, param.getDownloadResultsDetailsReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage, param.getDownloadResultsDetailsReq.CallType);

					var customData = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
					if (customData) {
						ADSearchUtil.deviceSearchObj = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
						ADSearchUtil.SearchText = sessionStorage.getItem(gID + 'CustomSearchText');
						$("#deviceCriteriaDiv").empty();
						$("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
					}
					param.getDownloadResultsDetailsReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
					data = JSON.stringify(param);
					return data;
				},
				downloadComplete: function (data, status, xhr) {
					if (data) {
						$('.all-disabled').hide();

						if (data.getDownloadResultsDetailsResp && data.getDownloadResultsDetailsResp.DownloadResultsDetails) {
							if (data.getDownloadResultsDetailsResp.DownloadResultsDetails.length > 0) {
								var taskIds = new Array();
								for (var i = 0; i < data.getDownloadResultsDetailsResp.DownloadResultsDetails.length; i++) {
									data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].SCHEDULEDDOWNLOADDATE = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].SCHEDULEDDOWNLOADDATE);
									data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].INSTALLEDDATE = convertToLocaltimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].INSTALLEDDATE);
									data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].STARTDATE = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].STARTDATE);
									data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].TASKCREATEDDATE = convertToLocaltimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].TASKCREATEDDATE);

									var downloadStatus = data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].STATUS;
									var packageFileType = data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].PACKAGEFILETYPE;
									if ((downloadStatus != AppConstants.get('InstallSuccessfulCount') && downloadStatus != AppConstants.get('DownloadFailedCount'))) {
										var taskId = new Object();
										taskId = data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].TASKID;
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

						//Start advanced search
						initfieldsArr = sourceDataFieldsArr;

						ADSearchUtil.localDynamicColumns = [];//<!---advance search changes--->
						if (data.getDownloadResultsDetailsResp && data.getDownloadResultsDetailsResp.DynamicColumns) {
							DynamicColumns = data.getDownloadResultsDetailsResp.DynamicColumns;
							for (var i = 0; i < data.getDownloadResultsDetailsResp.DynamicColumns.length; i++) {
								var FieldSource = _.where(sourceDataFieldsArr, { name: data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeName });
								if (FieldSource == '') {
									var dynamicObj = new Object();
									dynamicObj.name = data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeName;
									dynamicObj.map = data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeName.toUpperCase();
									if (data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType == 'Date') {
										dynamicObj.type = 'date';
									}
									ADSearchUtil.newAddedDataFieldsArr.push(dynamicObj);
									var exportDynamicColumns = new Object();
									exportDynamicColumns.AttributeName = data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeName;
									exportDynamicColumns.AttributeType = data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeType;
									exportDynamicColumns.ControlType = data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType;
									exportDynamicColumns.DisplayName = data.getDownloadResultsDetailsResp.DynamicColumns[i].DisplayName;
									exportDynamicColumns.FilterSource = data.getDownloadResultsDetailsResp.DynamicColumns[i].FilterSource;
									exportDynamicColumns.IsCustomAttribute = data.getDownloadResultsDetailsResp.DynamicColumns[i].IsCustomAttribute;
									exportDynamicColumns.IsInDeviceTimeZone = data.getDownloadResultsDetailsResp.DynamicColumns[i].IsInDeviceTimeZone;
									ADSearchUtil.ExportDynamicColumns.push(exportDynamicColumns);
								}
								var ColumnSource = _.where(gridColumns, { datafield: data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeName });

								var coulmnObj = new Object();
								coulmnObj.text = i18n.t(data.getDownloadResultsDetailsResp.DynamicColumns[i].DisplayName, { lng: lang });
								coulmnObj.datafield = data.getDownloadResultsDetailsResp.DynamicColumns[i].AttributeName;
								coulmnObj.editable = false;
								coulmnObj.minwidth = 200;
								coulmnObj.width = 'auto';
								coulmnObj.enabletooltips = true;
								if (data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType == 'Date') {
									coulmnObj.cellsformat = LONG_DATETIME_GRID_FORMAT;
								}
								coulmnObj.filtertype = "custom";
								if (data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType == 'TextBox') {
									coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
								} else if (data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType == 'MultiCombo' || data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType == 'Combo') {
									coulmnObj.createfilterpanel = function (datafield, filterPanel) {
										var FilterSource = AppConstants.get(datafield);
										buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource);
									};
								} else if (data.getDownloadResultsDetailsResp.DynamicColumns[i].ControlType == 'Date') {
									coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanelDate(filterPanel, datafield); };

								}
								//<!---advance search changes--->
								if (ColumnSource == '') {
									ADSearchUtil.newAddedgridColumns.push(coulmnObj);

								}
								ADSearchUtil.localDynamicColumns.push(coulmnObj);
								//<!---End--->
							}
						}

						source.dataFields = sourceDataFieldsArr;
						///end Ad Search
						//  enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh', 'rescheduleBtn']);

						//if (reschuleBtnFlag == 'true') {
						//    $('#rescheduleBtn').prop('disabled', false);
						//} else {
						//    $('#rescheduleBtn').prop('disabled', true);
						//}
						if (data.getDownloadResultsDetailsResp && data.getDownloadResultsDetailsResp.DownloadResultsDetails) {
							if (data.getDownloadResultsDetailsResp.TotalSelectionCount != 'undefined') {
								gridStorage[0].TotalSelectionCount = data.getDownloadResultsDetailsResp.TotalSelectionCount;
								var updatedGridStorage = JSON.stringify(gridStorage);
								window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
							}
							if (data.getDownloadResultsDetailsResp.PaginationResponse) {
								//if (data.getDownloadResultsDetailsResp.PaginationResponse.HighLightedItemPage > 0) {
								//    //for (var h = 0; h < data.getDownloadResultsDetailsResp.DownloadResultsDetails.length; h++) {
								//        //if (data.getDownloadResultsDetailsResp.DownloadResultsDetails[h].TaskId == data.getDownloadResultsDetailsResp.PaginationResponse.HighLightedItemId) {
								//            gridStorage[0].highlightedPage = data.getDownloadResultsDetailsResp.PaginationResponse.HighLightedItemPage;
								//            var updatedGridStorage = JSON.stringify(gridStorage);
								//            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
								//        //}
								//    //}
								//}
							} else {

							}
						} else {
							source.totalrecords = 0;
							source.totalpages = 0;
							data.getDownloadResultsDetailsResp = new Object();
							data.getDownloadResultsDetailsResp.DownloadResultsDetails = [];
						}
						if (isAdvancedSavedSearchApplied && koUtil.isSearchCancelled() == false) {
							$("#searchInProgress").modal('hide');
							$("#AdvanceSearchModal").modal('hide');
							koUtil.isHierarchyModified(false);
							koUtil.isAttributeModified(false);
							modelPopup('unloadTemplate');
						} else {
							$('.all-disabled').hide();
						}
						$("#" + gID).jqxGrid('hideloadelement');
						isAdvancedSavedSearchApplied = false;
						koUtil.isSearchCancelled(false);
					}
				},
				loadError: function (jqXHR, status, error) {
					$('.all-disabled').hide();
					openAlertpopup(2, 'network_error');
				}
			}
		);

		var statusColor = "";

		var enableDownloadAutomation = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (value == true) {
				return "Allowed";
			} else {
				return "Not Allowed";
			}

		}

		//for allcheck
		var rendered = function (element) {
			enablegridfunctions(gID, 'TaskId', element, gridStorage, true, 'pagerDivDetailDownload', false, 2, 'JobStatus', 'JobStatus', 'IsAutoDownloadJob', 'IsRescheduled', 'Protocol', null, null, 'IsResheduleAllowed');
			return true;
		}

		//for device profile
		function SerialNoRendereDownloadDetail(row, columnfield, value, defaulthtml, columnproperties) {
			var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
			return html;
		}

		var deviceStatusRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml);
			return defaultHtml;
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
		var toolTipDetailsRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = displayTooltipAndIconRenderer(gID, row, column, value, defaultHtml, 2);

			if (_.isEmpty(defaultHtml)) {
				return "";
			}

			if (defaultHtml.includes("red")) {
				statusColor = "red";
			} else if (defaultHtml.includes("brown")) {
				statusColor = "brown";
			} else if (defaultHtml.includes("green")) {
				statusColor = "green";
			} else if (defaultHtml.includes("orange")) {
				statusColor = "orange";
			} else {
				statusColor = "black";
			}
			return defaultHtml;
		}

		var jobReasonToolTipRenderer = function (row, column, value, defaultHtml) {
			if (statusColor) {
				defaultHtml = '<div class="jqx-grid-cell-left-align" style="padding-left:5px;padding-top:7px;overflow:hidden"><span style="color:' + statusColor + '">' + value + '</span></div>';
				statusColor = "";
			}
			return defaultHtml;
		}

		var toolTipDownStatusloadRenderer = function (row, column, value, defaultHtml) {
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

		var unixdateRendererLastHeartBeat = function (row, columnfield, value, defaulthtml, columnproperties) {

			if (value != "") {
				var localTime1 = moment(value)
				localTime1 = moment(localTime1).format(LONG_DATETIME_FORMAT_AMPM);
				return '<div style="padding-left:5px;padding-top:7px;text-overflow: ellipsis;overflow:hidden;"><span style="padding-left:5px;padding-top:7px;">' + localTime1 + '</span></div>';
			}
			else {
				return '';
			}
		}

		var unixdateRendererLastManagementPlanSent = function (row, columnfield, value, defaulthtml, columnproperties) {

			if (value != "") {
				var localTime1 = moment(value)
				localTime1 = moment(localTime1).format(LONG_DATETIME_FORMAT_AMPM);
				return '<div style="padding-left:5px;padding-top:7px;text-overflow: ellipsis;overflow:hidden;"><span style="padding-left:5px;padding-top:7px;">' + localTime1 + '</span></div>';
			}
			else {
				return '';
			}
		}



		var Installed_at_cellrender = function (row, columnfield, value, defaulthtml, columnproperties) {
			var protocol = $("#" + gID).jqxGrid('getcellvalue', row, 'Protocol');

			if (protocol == 'Zontalk') {
				return '<div style="padding-left:5px;padding-top:7px;text-overflow: ellipsis;overflow:hidden;"><span style="padding-left:5px;padding-top:7px;">Not Applicable</span></div>';
			}
			else {
				if (value != "") {
					var localTime1 = moment(value)
					localTime1 = moment(localTime1).format(LONG_DATETIME_FORMAT_AMPM);
					return '<div style="padding-left:5px;padding-top:7px;text-overflow: ellipsis;overflow:hidden;"><span style="padding-left:5px;padding-top:7px;">' + localTime1 + '</span></div>';
				}
				else {
					return '';
				}
			}


			return '';
		}

		//ToolTip For Create by Column
		var createdBytooltip = function (row, column, value, defaultHtml) {
			var cellvalue = $("#" + gID).jqxGrid('getcellvalue', row, 'LOGINNAME');
			defaultHtml = '<div style="padding-left:5px;padding-top:7px;text-overflow: ellipsis;overflow:hidden;"><span style="padding-left:5px;padding-top:7px;" title="' + cellvalue + '">' + value + '</span></div>';
			return defaultHtml;
		}
		var initialColumnFilter = function () {
			return initialColumnFilterBuilder(gridStorage);
		}();
		//For Advanced search
		gridColumns = [
			{
				text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclass,
				datafield: 'isSelected', width: 40, renderer: function () {
					return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
				}, rendered: rendered
			},

			{
				text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 120, filtertype: "custom", enabletooltips: false, cellsrenderer: SerialNoRendereDownloadDetail,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 120, filtertype: "custom", enabletooltips: false, cellsrenderer: SerialNoRendereDownloadDetail,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 100, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
				}
			},
			{
				text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 150, enabletooltips: false, cellsrenderer: deviceStatusRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
				}
			},
			{
				text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 180, filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
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
				text: i18n.t('job_name', { lng: lang }), datafield: 'JobName', editable: false, minwidth: 160, filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('job_status', { lng: lang }), datafield: 'JobStatus', editable: false, minwidth: 160, enabletooltips: false, cellsrenderer: toolTipDetailsRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Download\/Content Job Status');
				}
			},
			{
				text: i18n.t('job_reason', { lng: lang }), datafield: 'StatusAdditionalInfo', editable: false, sortable: false, filterable: false, menu: false, minwidth: 180, cellsrenderer: jobReasonToolTipRenderer,
			},
			{
				text: i18n.t('createdOn', { lng: lang }), datafield: 'TaskCreatedDate', filter: initialColumnFilter, editable: false, minwidth: 180, cellsformat: LONG_DATETIME_GRID_FORMAT,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('package_application_nm', { lng: lang }), datafield: 'PackageName', editable: false, minwidth: 120,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('package_application_version', { lng: lang }), datafield: 'PackageVersion', editable: false, minwidth: 150, filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('description', { lng: lang }), datafield: 'Description', sortable: false, editable: false, minwidth: 130, filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},

			{
				text: i18n.t('Download_Status_lbl', { lng: lang }), datafield: 'Status', editable: false, minwidth: 200, enabletooltips: false, cellsrenderer: toolTipDownStatusloadRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Software Job Task Status');
				}
			},
			{
				text: 'Progress', datafield: 'DownloadProgress', editable: false, sortable: false, filterable: false, menu: false, minwidth: 150, enabletooltips: false, cellsrenderer: downloadProgressRenderer,
			},
			{
				text: i18n.t('download_scheduled_col', { lng: lang }), datafield: 'ScheduledDownloadDate', editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 130, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			},
			{
				text: i18n.t('download_started_at', { lng: lang }), datafield: 'StartDate', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 130, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}

			},
			{
				text: i18n.t('download_duration', { lng: lang }), datafield: 'DownloadDuration', editable: false, minwidth: 140, cellsrenderer: downloadDurationRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('installed_at', { lng: lang }), datafield: 'ActualInstalledDate', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false,
				minwidth: 150, enabletooltips: false, filtertype: "custom", cellsrenderer: Installed_at_cellrender,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}

			},
			{
				text: i18n.t('content_file', { lng: lang }), datafield: 'FileName', editable: false, minwidth: 150,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('fileSize_mb', { lng: lang }), datafield: 'FileSize', editable: false, minwidth: 120,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('created_by', { lng: lang }), datafield: 'FullName', editable: false, minwidth: 100, enabletooltips: false, cellsrenderer: createdBytooltip,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('last_heartBeat', { lng: lang }), datafield: 'LastHeartBeat', cellsformat: LONG_DATETIME_GRID_FORMAT, hidden: true, editable: false, minwidth: 180,
				filterable: true, enabletooltips: false, filtertype: "custom", cellsrenderer: unixdateRendererLastHeartBeat,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}

			},
			{
				text: i18n.t('last_Mgmt_plan', { lng: lang }), datafield: 'TaskSentDate', cellsformat: LONG_DATETIME_GRID_FORMAT, hidden: true, editable: false, minwidth: 180,
				filterable: true, enabletooltips: false, filtertype: "custom", cellsrenderer: unixdateRendererLastManagementPlanSent,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			}
		];
		gridColumns = setUserPreferencesColumns('DetailedDownloadStatus', userResizedColumns, gridColumns);

		$("#" + gID).jqxGrid(
			{
				width: "100%",
				height: gridHeightFunction(gID, "60"),
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
				enabletooltips: true,
				rowsheight: 32,
				autoshowfiltericon: true,
				columns: gridColumns,
				rendergridrows: function () {
					return dataAdapter.records;
				},

				ready: function () {
					if (ADSearchUtil.resetAddSerchFlag == '') {
						var gID = ADSearchUtil.gridIdForAdvanceSearch;

						for (var k = 0; k < initfieldsArr.length; k++) {
							var FieldSource = _.where(sourceDataFieldsArr, { name: initfieldsArr[k].name });
							if (FieldSource == '') {
								sourceDataFieldsArr.push(initfieldsArr[k]);
							}
						}
						for (var k = 0; k < ADSearchUtil.newAddedDataFieldsArr.length; k++) {
							var FieldSource = _.where(sourceDataFieldsArr, { name: ADSearchUtil.newAddedDataFieldsArr[k].name });
							if (FieldSource == '') {
								sourceDataFieldsArr.push(ADSearchUtil.newAddedDataFieldsArr[k]);
							}
						}

						for (var k = 0; k < ADSearchUtil.newAddedgridColumns.length; k++) {
							var FieldSource = _.where(gridColumns, { datafield: ADSearchUtil.newAddedgridColumns[k].datafield });
							if (FieldSource == '') {
								gridColumns.push(ADSearchUtil.newAddedgridColumns[k]);
							};
						}

						//<!---advance search changes--->
						for (var i = 0; i < ADSearchUtil.localDynamicColumns.length; i++) {
							$("#" + gID).jqxGrid('showcolumn', ADSearchUtil.localDynamicColumns[i].datafield);
						}
						//<!---end--->

						for (var i = 0; i < gridColumns.length; i++) {
							if ($.inArray(gridColumns[i].datafield, ADSearchUtil.initColumnsArr) < 0) {
								if (DynamicColumns) {
									var checkSource = _.where(DynamicColumns, { AttributeName: gridColumns[i].datafield });
									if (checkSource == '') {
										$("#" + gID).jqxGrid('hidecolumn', gridColumns[i].datafield);
									}
								}
							}
						}

					} else if (ADSearchUtil.resetAddSerchFlag == 'reset') {
						var gID = ADSearchUtil.gridIdForAdvanceSearch;
						for (var init = 0; init < gridColumns.length; init++) {
							if ($.inArray(gridColumns[init].datafield, ADSearchUtil.initColumnsArr) < 0) {
								$("#" + gID).jqxGrid('hidecolumn', gridColumns[init].datafield);
							}
						}

						for (var k = 0; k < ADSearchUtil.newAddedDataFieldsArr.length; k++) {
							sourceDataFieldsArr = jQuery.grep(sourceDataFieldsArr, function (value) {
								var l = sourceDataFieldsArr.indexOf(ADSearchUtil.newAddedDataFieldsArr[k]);
								return (value != sourceDataFieldsArr[l] && value != null);
							});
						}
					}
					callOnGridReady(gID, gridStorage, CallType, 'TaskCreatedDate');
					//CallType = addDefaultfilter(CallType, 'TaskCreatedDate', gID)

					var columns = genericHideShowColumn(gID, true, ['StatusAdditionalInfo', 'LastHeartBeat', 'TaskSentDate']);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsList = koUtil.gridColumnList;
					visibleColumnsList.push('LastHeartBeat');
				},
			});//JqxGrid End

		getGridBiginEdit(gID, 'TaskId', gridStorage);
		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'TaskId');
	} //Grid Function End

	//Grid parameter
	function detailedDownloadStatusParameter(isExport, columnSortFilterForDownload, deviceSearchObj, selectedDetailedDownloadItems, unselectedDetailedDownloadItems, checkAll, visibleColumns) {

		var getDownloadResultsDetailsReq = new Object();
		var Export = new Object();
		var Selector = new Object();
		var Pagination = new Object();
		var UniqueDeviceId = new Object();
		var coulmnfilter = new Object();

		Pagination.HighLightedItemId = null
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

		Export.ExportReportType = ENUM.get("DownloadStatus");
		Export.VisibleColumns = visibleColumns;
		Export.DynamicColumns = null;

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
		getDownloadResultsDetailsReq.ColumnSortFilter = ColumnSortFilter;
		getDownloadResultsDetailsReq.Export = Export;
		getDownloadResultsDetailsReq.PackageType = ENUM.get("Software");
		getDownloadResultsDetailsReq.Pagination = Pagination;
		getDownloadResultsDetailsReq.Selector = Selector;
		getDownloadResultsDetailsReq.DeviceSearch = deviceSearchObj;
		getDownloadResultsDetailsReq.UniqueDeviceId = 0;
		getDownloadResultsDetailsReq.DownloadStatus = ENUM.get("DETAILED_DOWNLOAD_STATUS");

		var param = new Object();
		param.token = TOKEN();
		param.getDownloadResultsDetailsReq = getDownloadResultsDetailsReq;

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