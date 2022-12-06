var localData;
define(["knockout", "autho", "advancedSearchUtil", "koUtil"], function (ko, autho, ADSearchUtil, koUtil) {

	var lang = getSysLang();
	columnSortFilterActionJob = new Object();
	columnSortFilterModelActionJob = new Object();
	jobDevicesId = 0;
	jobName = 0;

	return function DashBoardViewModel() {

		var self = this;
		//Check Rights
		self.checkRights = function (screenName, rightsFor) {
			var retval = autho.checkRightsBYScreen(screenName, rightsFor);
			return retval;
		}

		self.templateFlag = ko.observable(false);
		self.observableModelComponent = ko.observable();
		self.observableModelPopup = ko.observable();

		self.gridIdForShowHide = ko.observable();
		var compulsoryfields = ['SerialNumber', 'results', 'ActionType'];
		self.columnlist = ko.observableArray();
		var modelName = "unloadTemplate";
		loadelement(modelName, 'genericPopup', 1);
		loadelement(modelName, 'genericPopup', 2);

		ADSearchUtil.ExportDynamicColumns = [];

		setMenuSelection();
		
		modelReposition();

		self.openPopup = function (popupName, gridID) {
			self.templateFlag(true);
			if (popupName == "modelShowHideCol") {
				self.gridIdForShowHide(gridID);
				self.columnlist(''); //<!---advance search changes--->
				self.columnlist(genericHideShowColumn(gridID, true, compulsoryfields));

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
					if ((koUtil.deviceFamily.toUpperCase() == AppConstants.get('MX_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('VX_FAMILY')) && arr[i].columnfield == "Component") {
						self.columnlist.remove(arr[i]);
					}
				}

				loadelement(popupName, 'genericPopup', 2);
				$('#modelActionPopupID').modal('show');
			}
			else if (popupName == "modelActionJobStatus") {
				loadelement(popupName, 'diagnostics', 1);
				$('#modelActionID').modal('show');
			}
			else if (popupName == "modelCancelActionJobStatus") {
				loadelement(popupName, 'diagnostics', 1);
				$('#modelActionID').modal('show');
			}
		}

		function loadelement(elementname, controllerId, flage) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			if (flage == 2) {
				self.observableModelPopup(elementname);
			} else {
				self.observableModelComponent(elementname);
			}
		}

		//unload template
		self.unloadTempPopup = function (popupName, gId, exportflage) {
			self.observableModelComponent('unloadTemplate');
			self.observableModelPopup('unloadTemplate');
			$("#modelActionPopupContent").css('left', '');
			$("#modelActionPopupContent").css('top', '');
		}

		$('#modelActionPopupHeader').mouseup(function () {
			$("#modelActionPopupContent").draggable({ disabled: true });
		});

		$('#modelActionPopupHeader').mousedown(function () {
			$("#modelActionPopupContent").draggable({ disabled: false });
		});


		self.closeOpenModel = function (gridID, modelPopup) {
			gridRefresh(gridID);
			$('#' + modelPopup).modal('hide');
			isPopUpOpen = false;			
		}

		//reset fillter
		self.clearFilter = function (gridID) {
			CallType = ENUM.get("CALLTYPE_NONE");
			gridFilterClear(gridID);
		}



		// refresh grid
		self.refreshGrid = function (gridID) {
			gridRefresh(gridID);
		}
		//close action status
		self.cancelJobStatus = function (popupName, gridID) {
			var selectedCount = parseInt($("#" + gridID + "seleceteRowSpan").text());
			if (selectedCount == 0) {
				openAlertpopup(1, 'please_select_atleast_one_job_for_cancellation');
			} else {
				self.openPopup(popupName, gridID);
			}
		}

		//Expot to Excel
		self.exportToExcel = function (isExport, gridID) {
			var selectedActionJobItems = getSelectedUniqueId(gridID);
			var unselectedActionJobItems = getUnSelectedUniqueId(gridID);
			var checkAll = checkAllSelected(gridID);
			var datainfo = $("#" + gridID).jqxGrid('getdatainformation');

			if (gridID == "jqxgridActionJobProfile") {
				visibleColumnsList = GetExportVisibleColumn(gridID);
				var param = getDiagnosticDetails(isExport, columnSortFilterActionJob, selectedActionJobItems, unselectedActionJobItems, checkAll, ADSearchUtil.deviceSearchObj, visibleColumnsList);
				if (datainfo.rowscount > 0) {
					actionJobExport(param, gridID, self.openPopup);
				} else {
					openAlertpopup(1, 'no_data_to_export');
				}
			} else {
				var param = getModelActionJobStatusParametersdeviceprofile(isExport, columnSortFilterModelActionJob, jobDevicesId, jobName, visibleColumnsListForPopup);
				if (datainfo.rowscount > 0) {
					modelActionJobExportdeviceprofile(param);
				}
				else {
					openAlertpopup(1, 'no_data_to_export');
				}
			}
		}

		var param = getDiagnosticDetails(false, columnSortFilterActionJob, null, null, 0, ADSearchUtil.deviceSearchObj);
		getDiagnosticGridResult('jqxgridActionJobProfile', param);

		seti18nResourceData(document, resourceStorage);
	}

	function generateTemplate(tempname, controllerId) {
		//new template code
		var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
		var viewName = 'controller/' + controllerId + '/' + tempname + '.js';
		ko.components.register(tempname, {
			viewModel: { require: viewName },
			template: { require: 'plugin/text!' + htmlName }
		});
		// end new template code
	}

	function actionJobExport(param, gridID, openPopup) {
		var callbackFunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					openAlertpopup(1, 'export_Sucess');
				}
			}
		}
		var method = 'GetDiagnosticsJobSummaryForDeviceProfile';
		var params = JSON.stringify(param);
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	function getDiagnosticGridResult(gID, param) {
		var gridColumns = [];

		CallType = ENUM.get("CALLTYPE_WEEK");
		var isFilter;
		if (isDiagnosticGridResultFilter == undefined || isDiagnosticGridResultFilter == false) {
			isFilter = false;
		} else {
			isFilter = true;
		}
		isDiagnosticGridResultFilter = true;
		var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
		var gridStorage = InitGridStoragObj.gridStorage;
		var adStorage = InitGridStoragObj.adStorage;
		//  CallType = InitGridStoragObj.CallType;

		var source = {
			dataType: 'json',
			datafields: [
				{ name: 'JobDevicesId', map: 'JobDevicesId' },
				{ name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
				{ name: 'SerialNumber', map: 'DeviceDetail>SerialNumber' },
				{ name: 'DeviceId', map: 'TaskDeviceId' },
				{ name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath', type: 'string' },
				{ name: 'ModelName', map: 'DeviceDetail>ModelName' },
				{ name: 'JobName', map: 'JobName' },
				{ name: 'JobStatus', map: 'JobStatus' },
				{ name: 'Tags', map: 'Tags' },
				{ name: 'Actions', map: 'Actions' },
				{ name: 'ScheduleDate', map: 'ScheduleDate' },
				{ name: 'BeginActionAt', map: 'BeginActionAt' },
				{ name: 'Recurrence', map: 'Recurrence' },
				{ name: 'JobCreatedBy', map: 'JobCreatedBy' },
				{ name: 'JobCreatedOn', map: 'JobCreatedOn', type: 'date' },
				{ name: 'IsCancelRequestFailed', map: 'IsCancelRequestFailed' },
				{ name: 'isSelected', type: 'number' },
				{ name: 'IsJobCancelAllowed', type: 'bool' },
				{ name: 'AdditionalStatusInfo', map: 'AdditionalStatusInfo' },
				{ name: 'FullName', map: 'FullName' },
				{ name: 'IsCancelRequestFailed', map: 'IsCancelRequestFailed' },
				{ name: 'Component', map: 'Component' }
			],
			root: 'DiagnosticsJobs',
			type: 'POST',
			data: param,
			url: AppConstants.get('API_URL') + "/GetDiagnosticsJobSummaryForDeviceProfile ",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data.getDiagnosticsJobSummaryForDeviceProfileResp)
					data.getDiagnosticsJobSummaryForDeviceProfileResp = $.parseJSON(data.getDiagnosticsJobSummaryForDeviceProfileResp);
				else
					data.getDiagnosticsJobSummaryForDeviceProfileResp = [];

				if (data.getDiagnosticsJobSummaryForDeviceProfileResp && data.getDiagnosticsJobSummaryForDeviceProfileResp.PaginationResponse && data.getDiagnosticsJobSummaryForDeviceProfileResp.PaginationResponse.TotalRecords > 0) {
					source.totalrecords = data.getDiagnosticsJobSummaryForDeviceProfileResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getDiagnosticsJobSummaryForDeviceProfileResp.PaginationResponse.TotalPages;
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
				}
			},
		}
		var request =
		{
			formatData: function (data) {
				$("#cancelbtn").prop("disabled", true);
				$('.all-disabled').show();
				disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
				var columnSortFilter = new Object();
				columnSortFilter = columnSortFilterFormatedData(columnSortFilterActionJob, gID, gridStorage, 'DiagnosticsActionJobs');
				param.getDiagnosticsJobSummaryForDeviceProfileReq.ColumnSortFilter = columnSortFilter;
				param.getDiagnosticsJobSummaryForDeviceProfileReq.Pagination = getPaginationObject(param.getDiagnosticsJobSummaryForDeviceProfileReq.Pagination, gID);
				data = JSON.stringify(param);
				return data;
			},
			downloadComplete: function (data, status, xhr) {

				if (data.getDiagnosticsJobSummaryForDeviceProfileResp && data.getDiagnosticsJobSummaryForDeviceProfileResp.DiagnosticsJobs) {
					for (var i = 0; i < data.getDiagnosticsJobSummaryForDeviceProfileResp.DiagnosticsJobs.length; i++) {

						data.getDiagnosticsJobSummaryForDeviceProfileResp.DiagnosticsJobs[i].JobCreatedOn = convertToLocaltimestamp(data.getDiagnosticsJobSummaryForDeviceProfileResp.DiagnosticsJobs[i].JobCreatedOn);
						// data.getDiagnosticsJobSummaryForDeviceProfileResp.DiagnosticsJobs[i].BeginActionAt = convertToDeviceZonetimestamp(data.getDiagnosticsJobSummaryForDeviceProfileResp.DiagnosticsJobs[i].BeginActionAt);
						data.getDiagnosticsJobSummaryForDeviceProfileResp.DiagnosticsJobs[i].ScheduleDate = convertToDeviceZonetimestamp(data.getDiagnosticsJobSummaryForDeviceProfileResp.DiagnosticsJobs[i].ScheduleDate);
						$("#cancelbtn").prop("disabled", false);
					}
				}
				enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

				if (data.getDiagnosticsJobSummaryForDeviceProfileResp && data.getDiagnosticsJobSummaryForDeviceProfileResp.DiagnosticsJobs) {
					if (data.getDiagnosticsJobSummaryForDeviceProfileResp.TotalSelectionCount != 'undefined') {
						gridStorage[0].TotalSelectionCount = data.getDiagnosticsJobSummaryForDeviceProfileResp.TotalSelectionCount;
						var updatedGridStorage = JSON.stringify(gridStorage);
						window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
						$("#cancelbtn").prop("disabled", false);
					}
					if (data.getDiagnosticsJobSummaryForDeviceProfileResp.PaginationResponse) {
						//if (data.getDiagnosticsJobSummaryForDeviceProfileResp.PaginationResponse.HighLightedItemPage > 0) {
						//    gridStorage[0].highlightedPage = data.getDiagnosticsJobSummaryForDeviceProfileResp.PaginationResponse.HighLightedItemPage;
						//    var updatedGridStorage = JSON.stringify(gridStorage);
						//    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
						//    $("#cancelbtn").prop("disabled", false);
						//}
					} else {

					}
				} else {
					data.getDiagnosticsJobSummaryForDeviceProfileResp = new Object();
					data.getDiagnosticsJobSummaryForDeviceProfileResp.DiagnosticsJobs = [];
					$("#cancelbtn").prop("disabled", true);
				}
				if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
					$("#cancelbtn").prop("disabled", true);
				}
				$('.all-disabled').hide();
			}
		}
		var dataAdapter = intializeDataAdapter(source, request);

		//for allcheck
		var rendered = function (element) {
			enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, true, 'pagerDivActionJobStatus', true, 1, 'IsJobCancelAllowed', null, null, null, 'Protocol');
			return true;
		}


		//for device profile
		function SerialNoRendereActionJob(row, columnfield, value, defaulthtml, columnproperties) {
			var data = $("#" + gID).jqxGrid('getrowdata', row);

			var href = null;
			return '<div style="padding-left:10px;padding-top:9px;"><a href="index.html#deviceProfile/' + data.UniqueDeviceId + '" style="text-decoration:underline;" title="View Profile" >' + value + '</a></div>'
		}

		var cellbeginedit = function (row, datafield, columntype, value) {
			var check = $("#" + gID).jqxGrid('getcellvalue', row, 'IsJobCancelAllowed');
			if (check == true) {
				return true;
			} else {
				return false;
			}
		}

		var resultsRender = function (row, columnfield, value, defaulthtml, columnproperties) {
			return '<div style="padding-left:5px;padding-top:7px; cursor:pointer"> <a title="Click to view Action Details" id="imageId" style="text-decoration:underline;" onClick="openIconPopupActionstatusDeviceprfile(' + row + ')" height="60" width="50">View Results</a></div>'
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

		var cellclass = function (row, columnfield, value) {
			var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'IsJobCancelAllowed');
			return classname;
		}

		var toolTipRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = displayTooltipAndIconRenderer(gID, row, column, value, defaultHtml, 2);
			return defaultHtml;
		}

		//for ad Search
		gridColumns = [
			{
				text: '', menu: false, sortable: false, filterable: false, resizable: false, draggable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclass,
				datafield: 'isSelected', width: 40, renderer: function () {
					return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
				}, rendered: rendered
			},
			{ text: '', datafield: 'JobDevicesId', hidden: true, editable: false, minwidth: 0, },
			{ text: '', datafield: 'UniqueDeviceId', hidden: true, editable: false, minwidth: 0, },
			{ text: '', datafield: 'AdditionalStatusInfo', hidden: true, editable: false, minwidth: 0, },
			{ text: '', datafield: 'IsCancelRequestFailed', hidden: true, editable: false, minwidth: 0, },
			{
				text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 100, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('component', { lng: lang }), dataField: 'Component', editable: false, minwidth: 100, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Component');
				}
			},
			{
				text: i18n.t('job_name', { lng: lang }), datafield: 'JobName', editable: false, enabletooltips: false, minwidth: 100,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('job_status', { lng: lang }), datafield: 'JobStatus', editable: false, minwidth: 100, cellsrenderer: toolTipRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Diagnostic Job Status');
				}
			},


			{
				text: i18n.t('action(s)', { lng: lang }), datafield: 'Actions', sortable: false, menu: false, filterable: false, editable: false, minwidth: 100,
			},
			{
				text: i18n.t('action(s)_schedule', { lng: lang }), datafield: 'ScheduleDate', enabletooltips: false, cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 160, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			},
			{ text: i18n.t('begin_action_at', { lng: lang }), datafield: 'BeginActionAt', enabletooltips: false, sortable: false, menu: false, filterable: false, editable: false, minwidth: 130, },
			{
				text: i18n.t('recurrence', { lng: lang }), datafield: 'Recurrence', enabletooltips: false, editable: false, minwidth: 100,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('created_by', { lng: lang }), datafield: 'FullName', enabletooltips: false, editable: false, minwidth: 100,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('createdOn', { lng: lang }), datafield: 'JobCreatedOn', editable: false, minwidth: 150, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			},
			{ text: i18n.t('results', { lng: lang }), datafield: 'results', enabletooltips: false, editable: false, minwidth: 90, menu: false, sortable: false, filterable: false, cellsrenderer: resultsRender },
		];
		//end Grid Advance search

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
				rowsheight: 32,
				autoshowcolumnsmenubutton: false,
				enabletooltips: true,
				rendergridrows: function () {
					return dataAdapter.records;
				},
				ready: function () {
					callOnGridReady(gID, gridStorage, undefined, '');
					var columns = genericHideShowColumn(gID, true, ['results']);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					koUtil.gridColumnList.push('LastHeartBeat');
					visibleColumnsList = koUtil.gridColumnList;

					if (koUtil.deviceFamily.toUpperCase() == AppConstants.get('MX_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('VX_FAMILY')) {
						$("#" + gID).jqxGrid('hidecolumn', 'Component');
					}
				},
				autoshowfiltericon: true,

				columns: gridColumns,

			});

		getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'JobDevicesId');
	}

	function getDiagnosticDetails(isExport, columnSortFilterActionJob, selectedActionJobItems, unselectedActionJobItems, checkAll, deviceSearchObj, visibleColumns) {

		var getDiagnosticsJobSummaryForDeviceProfileReq = new Object();
		var Export = new Object();
		var Pagination = new Object();
		var Selector = new Object();

		Pagination.HighLightedItemId = null
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

		Export.DynamicColumns = null;
		Export.VisibleColumns = visibleColumns;
		if (checkAll == 1) {
			Selector.SelectedItemIds = null;
			Selector.UnSelectedItemIds = unselectedActionJobItems;
			if (isExport == true) {
				Export.IsAllSelected = true;
				Export.IsExport = true;
				Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
			} else {
				Export.IsAllSelected = false;
				Export.IsExport = false;
			}
		} else {
			Selector.SelectedItemIds = selectedActionJobItems;
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

		var ColumnSortFilter = columnSortFilterActionJob;
		var FilterList = new Array();
		var coulmnfilter = new Object();
		coulmnfilter.FilterColumn = null;
		coulmnfilter.FilterValue = null;
		FilterList.push(coulmnfilter);

		getDiagnosticsJobSummaryForDeviceProfileReq.DeviceId = koUtil.deviceId;
		getDiagnosticsJobSummaryForDeviceProfileReq.ColumnSortFilter = ColumnSortFilter;
		getDiagnosticsJobSummaryForDeviceProfileReq.ModelName = koUtil.ModelName;
		getDiagnosticsJobSummaryForDeviceProfileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
		getDiagnosticsJobSummaryForDeviceProfileReq.Export = Export;
		getDiagnosticsJobSummaryForDeviceProfileReq.Pagination = Pagination;
		getDiagnosticsJobSummaryForDeviceProfileReq.Selector = Selector;

		var param = new Object();
		param.token = TOKEN();
		param.getDiagnosticsJobSummaryForDeviceProfileReq = getDiagnosticsJobSummaryForDeviceProfileReq;

		return param;

	}

});

// click on view result open popup for action job status
function openIconPopupActionstatusDeviceprfile(row) {
	$('#modelProfileActionResults').modal('show');
	$('#profileActionResultsDiv').empty();
	$('#profileActionResultsDiv').html('<div id="jqxGridProfileActionResults"></div><div id="pagerDivProfileActionResults"></div>');
	GetActionResultsdeviceprofile(row);
}

function GetActionResultsdeviceprofile(row) {

	var self = this;

	self.serialNumber = $("#jqxgridActionJobProfile").jqxGrid('getcellvalue', row, 'SerialNumber');
	self.modelName = $("#jqxgridActionJobProfile").jqxGrid('getcellvalue', row, 'ModelName');
	jobDevicesId = $("#jqxgridActionJobProfile").jqxGrid('getcellvalue', row, 'JobDevicesId');
	self.isCancelRequestFailed = $("#jqxgridActionJobProfile").jqxGrid('getcellvalue', row, 'IsCancelRequestFailed');
	jobName = $("#jqxgridActionJobProfile").jqxGrid('getcellvalue', row, 'JobName');
	self.uniqueDeviceId = $("#jqxgridActionJobProfile").jqxGrid('getcellvalue', row, 'UniqueDeviceId');

	$("#modelName").empty();
	$("#serialNumber").empty();
	$("#modelName").append(self.modelName);
	$("#serialNumber").append(self.serialNumber);

	//grid display
	var param = getModelActionJobStatusParametersdeviceprofile(false, columnSortFilterModelActionJob, jobDevicesId, jobName);
	getModalActionJobResultsdeviceProfile('jqxGridProfileActionResults', param);
}

function modelActionJobExportdeviceprofile(param) {
	var callbackFunction = function (data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				openAlertpopup(1, 'export_Sucess');
			}
		}
	}

	var method = 'GetDiagnosticsResults ';
	var params = JSON.stringify(param);
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}
function getModalActionJobResultsdeviceProfile(gID, param) {
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

	var source = {
		dataType: 'json',
		dataFields: [
			{ name: 'ActionType', map: 'ActionType' },
			{ name: 'OperationExecutionTimeOnDevice', map: 'OperationExecutionTimeOnDevice' },
			{ name: 'Status', map: 'Status' },
			{ name: 'RecievedOn', map: 'RecievedOn', type: 'date' },
			{ name: 'FileUrl', map: 'FileUrl' },
			{ name: 'IsMessage', map: 'IsMessage' },
			{ name: 'Title', map: 'Title' },
			{ name: 'MessageInfo', map: 'MessageInfo' }
		],
		root: 'DiagnosticsResult',
		type: 'POST',
		data: param,
		url: AppConstants.get('API_URL') + "/GetDiagnosticsResults",
		contentType: 'application/json',
		beforeprocessing: function (data) {
			if (data.getDiagnosticsResultsResp && data.getDiagnosticsResultsResp) {
				data.getDiagnosticsResultsResp = $.parseJSON(data.getDiagnosticsResultsResp);
				if (data.getDiagnosticsResultsResp.PaginationResponse) {
					source.totalrecords = data.getDiagnosticsResultsResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getDiagnosticsResultsResp.PaginationResponse.TotalPages;
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
				}
			}
			else
				data.getDiagnosticsResultsResp = [];
		},
	}
	var dataAdapter = new $.jqx.dataAdapter(source,
		{
			formatData: function (data) {
				$('.all-disabled').show();
				var columnSortFilter = new Object();
				columnSortFilter = columnSortFilterFormatedData(columnSortFilterModelActionJob, gID, gridStorage, 'modelActionJobStatus');

				param.getDiagnosticsResultsReq.ColumnSortFilter = columnSortFilter;
				param.getDiagnosticsResultsReq.Pagination = getPaginationObject(param.getDiagnosticsResultsReq.Pagination, gID);
				param.getDiagnosticsResultsReq.JobDevicesId = jobDevicesId;
				data = JSON.stringify(param);
				return data;
			},
			downloadComplete: function (data, status, xhr) {
				$('.all-disabled').hide();

				isPopUpOpen = true;
				if (data.getDiagnosticsResultsResp && data.getDiagnosticsResultsResp.DiagnosticsResult) {
					localData = data.getDiagnosticsResultsResp.DiagnosticsResult;
					for (var i = 0; i < data.getDiagnosticsResultsResp.DiagnosticsResult.length; i++) {
						if (data.getDiagnosticsResultsResp.DiagnosticsResult[i].OperationExecutionTimeOnDevice) {
							data.getDiagnosticsResultsResp.DiagnosticsResult[i].OperationExecutionTimeOnDevice = convertToDeviceZonetimestamp(data.getDiagnosticsResultsResp.DiagnosticsResult[i].OperationExecutionTimeOnDevice);
						}
						data.getDiagnosticsResultsResp.DiagnosticsResult[i].RecievedOn = convertToLocaltimestamp(data.getDiagnosticsResultsResp.DiagnosticsResult[i].RecievedOn);
					}
				}
				if (data.getDiagnosticsResultsResp && data.getDiagnosticsResultsResp.DiagnosticsResult) {
					if (data.getDiagnosticsResultsResp.TotalSelectionCount != 'undefined') {
						gridStorage[0].TotalSelectionCount = data.getDiagnosticsResultsResp.TotalSelectionCount;
						var updatedGridStorage = JSON.stringify(gridStorage);
						window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
					}
					if (data.getDiagnosticsResultsResp.PaginationResponse) {
						//if (data.getDiagnosticsResultsResp.PaginationResponse.HighLightedItemPage > 0) {
						//    gridStorage[0].highlightedPage = data.getDiagnosticsResultsResp.PaginationResponse.HighLightedItemPage;
						//    var updatedGridStorage = JSON.stringify(gridStorage);
						//    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
						//}
					} else {

					}
				} else {
					data.getDiagnosticsResultsResp = new Object();
					data.getDiagnosticsResultsResp.DiagnosticsResult = [];
				}
			},
			loadError: function (jqXHR, status, error) {
				$('.all-disabled').hide();
			}
		}
	);
	//for allcheck
	var rendered = function (element) {
		enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, false, 'pagerDivProfileActionResults', true, 0, 'JobDevicesId', null, null, null);
		$('.jqx-grid-pager').css("display", "none");
		return true;
	}

	var statusTooltipRenderer = function (row, column, value, defaultHtml) {
		defaultHtml = displayTooltipIconRendererForViewResults(gID, row, column, value, defaultHtml);
		return defaultHtml;
	}

	//click on result column link
	var modelResultRender = function (row, columnfield, value, defaulthtml, columnproperties) {
		var rowData = $("#" + gID).jqxGrid('getrowdata', row);
		var message = rowData.IsMessage;
		if (message == false) {
			if (value != "") {
				return '<div style="padding-left:5px;padding-top:7px; cursor:pointer"> <a id="imageId" style="text-decoration:underline;" onClick="downloadResultData(' + row + ')" height="60" width="50">View Results</a></div>'
			} else {
				return "";
			}
		}
		else {
			return '<div style="padding-left:5px;padding-top:7px; cursor:pointer"> <a id="imageId" style="text-decoration:underline;" onClick="downloadResultDataForMessage(' + row + ')" height="60" width="50">View Message</a></div>'
		}
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

	$("#" + gID).jqxGrid(
		{
			width: "100%",
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
			rendergridrows: function () {
				return dataAdapter.records;
			},
			autoshowfiltericon: true,

			ready: function () {
				visibleColumnsListForPopup = new Array();
				var columns = genericHideShowColumn(gID, true, []);

				for (var i = 0; i < columns.length; i++) {
					visibleColumnsListForPopup.push(columns[i].columnfield);
				}
			},

			columns: [
				{
					text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox',
					datafield: 'isSelected', width: 40, rendered: rendered, hidden: true
				},
				{ text: '', datafield: 'JobDevicesId', hidden: true, editable: false, minwidth: 0, },
				{
					text: i18n.t('action', { lng: lang }), datafield: 'ActionType', editable: false, minwidth: 100,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}

				},
				{
					text: i18n.t('executed_at', { lng: lang }), datafield: 'OperationExecutionTimeOnDevice', editable: false, minwidth: 150, cellsformat: LONG_DATETIME_GRID_FORMAT,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanelDate(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('rs_statsus', { lng: lang }), datafield: 'Status', editable: false, minwidth: 100, cellsrenderer: statusTooltipRenderer,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanelMultiChoice(filterPanel, datafield, 'Diagnostic Action Status');
					}
				},
				{
					text: i18n.t('received_date', { lng: lang }), datafield: 'RecievedOn', editable: false, minwidth: 160, cellsformat: LONG_DATETIME_GRID_FORMAT,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanelDate(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('results', { lng: lang }), datafield: 'FileUrl', filterable: false, menu: false, sortable: false, enabletooltips: false, editable: false, minwidth: 100, cellsrenderer: modelResultRender,
				}
			],
		});


	getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
	callGridFilter(gID, gridStorage);
	callGridSort(gID, gridStorage, 'JobDevicesId');
}

function getModelActionJobStatusParametersdeviceprofile(isExport, columnSortFilterModelActionJob, jobDevicesId, jobName, visibleColumns) {

	var getDiagnosticsResultsReq = new Object();
	var Export = new Object();
	var Pagination = new Object();

	Pagination.HighLightedItemId = null
	Pagination.PageNumber = 1;
	Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

	Export.DynamicColumns = null;
	Export.VisibleColumns = visibleColumns;

	if (isExport == true) {
		Export.IsAllSelected = false;
		Export.IsExport = true;
	} else {
		Export.IsAllSelected = false;
		Export.IsExport = false;
	}

	var ColumnSortFilter = columnSortFilterModelActionJob;
	var FilterList = new Array();
	var coulmnfilter = new Object();
	coulmnfilter.FilterColumn = null;
	coulmnfilter.FilterValue = null;
	FilterList.push(coulmnfilter);

	getDiagnosticsResultsReq.CallType = ENUM.get("CALLTYPE_NONE");
	getDiagnosticsResultsReq.ColumnSortFilter = ColumnSortFilter;
	getDiagnosticsResultsReq.Export = Export;
	getDiagnosticsResultsReq.JobDevicesId = jobDevicesId;
	getDiagnosticsResultsReq.JobName = jobName;
	getDiagnosticsResultsReq.Pagination = Pagination;

	var param = new Object();
	param.token = TOKEN();
	param.getDiagnosticsResultsReq = getDiagnosticsResultsReq;
	return param;
}

function downloadResultData(row) {
	var Value = $("#jqxGridProfileActionResults").jqxGrid('getcellvalue', row, 'FileUrl');

	//redirect to another page based on File url
	window.open(Value);
}

function downloadResultDataForMessage(row) {
	var rowData = $("#jqxGridProfileActionResults").jqxGrid('getrowdata', row);
	var title = rowData.Title;
	var message = rowData.MessageInfo;
	$("#title").html('<b>' + "Title : " + '</b>' + ' ' + title);
	$("#message").html('<b>' + "Message : " + '</b>' + ' ' + message);
	$("#modelMessagePopupID").modal('show');
}