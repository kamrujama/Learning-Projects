define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, ADSearchUtil) {
	var lang = getSysLang();
	columnSortFilter = new Object();
	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});
	var includeSystemCreatedJobs = false;

	return function detailActionStatusViewModel() {

		var self = this;

		//Draggable function
		$('#diagAdvancedSearchHeader').mouseup(function () {
			$("#AdvanceSearchModalContent").draggable({ disabled: true });
		});

		$('#diagAdvancedSearchHeader').mousedown(function () {
			$("#AdvanceSearchModalContent").draggable({ disabled: false });
		});
		/////////

		self.checksample = ko.observable();
		self.observableModelPopup = ko.observable();
		self.AdvanceTemplateFlag = ko.observable(false);
		self.observableCriteria = ko.observable();
		self.detailDiagnosticModelPopUp = ko.observable();
		self.templateFlag = ko.observable(false);
		self.columnlist = ko.observableArray();
		self.gridIdForShowHide = ko.observable();
		self.observableCriteria = ko.observable();
		self.observableAdvancedSearchModelPopup = ko.observable();
		self.exportDiagnosticFiles = ko.observable();
		self.exportFileValue = ko.observable("");

		//For advanced search
		ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridDetailedAction';
		ADSearchUtil.SearchForChart = false;
		ADSearchUtil.SearchForGrid = true;
		ADSearchUtil.ExportDynamicColumns = [];
		ADSearchUtil.deviceSearchObj = new Object();
		ADSearchUtil.newAddedDataFieldsArr = [];
		ADSearchUtil.newAddedgridColumns = [];
		ADSearchUtil.AdScreenName = 'diagnosticReport';
		ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "ModelName", "ComputedDeviceStatus", "HierarchyFullPath", "Component", "JobName", "JobStatus", "ComputedDeviceStatus", "DeviceActionTypeDisplayName", "Status", "StatusReceivedDate", "ScheduledDate", "OperationExecutionTimeOnDevice", "FullName", "JobCreatedOn", "ActionTasksAdditionalInfo", "LastHeartBeat", "TaskSentDate", "JobCreatedByUserName", "LoginName"];
		var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'ComputedDeviceStatus', 'HierarchyFullPath'];
		var modelName = 'unloadTemplate';

		init();
		function init() {
			setMenuSelection();
			loadelement(modelName, 'genericPopup');
			loadCriteria('modalCriteria', 'genericPopup');
			loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');			

			var param = detailedAtionStatusParameter(false, ADSearchUtil.deviceSearchObj, columnSortFilter, null, null, 0, []);
			detailedActionStatusGrid('jqxgridDetailedAction', param, self.observableAdvancedSearchModelPopup);

			seti18nResourceData(document, resourceStorage);

			if (includeSystemCreatedJobs) {
				$("#btnClearCreatedByActionJobDetails").prop('title', i18n.t('hide_system_created_jobs', { lng: lang }));
			} else {
				$("#btnClearCreatedByActionJobDetails").prop('title', i18n.t('show_system_created_jobs', { lng: lang }));
			}
		}

		//For Load element
		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopup(elementname);
		}

		//for advance search
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
				$('#actionModel').modal('show');
			}
			else if (popupName == "modelExportSucess") {
				loadelement(popupName, 'genericPopup');
				$('#actionModel').modal('show');
			} else if (popupName == 'modelAdvancedSearch') {
				self.AdvanceTemplateFlag(true);
				loadAdvancedSearchModelPopup(popupName, 'genericPopup');
				$('#AdvanceSearchModal').modal('show');
			} else if (popupName == "modelExportFiles") {
				var selectedIds = getSelectedUniqueId(gId);
				if (!_.isEmpty(selectedIds) && selectedIds.length > 0) {
					$("#txtExportFilesName").val('');
					$('#btnSaveExportFiles').prop('disabled', true);
					$("#exportFilesDiv").modal('show');
					$("#exportFilesModalLabel").text(i18n.t('export_files', { lng: lang }));
				} else {
					openAlertpopup(1, 'no_file_to_export');	
				}
			}
		}

		//Unload Template
		self.unloadTempPopup = function (popupName, gId, exportflage) {
			self.detailDiagnosticModelPopUp(popupName);
			self.observableModelPopup(popupName);
			$('#actionModel').modal('hide');
		};

		self.closeFolderModal = function () {
            $('input[name=exportFilesNameText]').val('');
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

		//unload advance serach popup
		self.unloadAdvancedSearch = function () {
			repositionAdvanceSearchPopUp("AdvanceSearchModalContent");
			ClearAdSearch = 0;
			self.observableAdvancedSearchModelPopup('unloadTemplate');
			$("#AdvanceSearchModal").modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
			isAdpopup = '';
		}

		self.clearAdvancedSearch = function () {
			repositionAdvanceSearchPopUp("AdvanceSearchModalContent");
			self.observableAdvancedSearchModelPopup('unloadTemplate');
			loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
		}

		self.showHideSystemCreatedJobs = function (gId) {
			if (includeSystemCreatedJobs) {
				includeSystemCreatedJobs = false;
				$("#btnClearCreatedByActionJobDetails").prop('title', i18n.t('show_system_created_jobs', { lng: lang }));
			} else {
				includeSystemCreatedJobs = true;
				$("#btnClearCreatedByActionJobDetails").prop('title', i18n.t('hide_system_created_jobs', { lng: lang }));
				var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
				if (!_.isEmpty(gridStorage) && gridStorage.length > 0) {
					if (!_.isEmpty(gridStorage[0].columnSortFilter) && !_.isEmpty(gridStorage[0].columnSortFilter.FilterList) && gridStorage[0].columnSortFilter.FilterList.length > 0) {
						var selectedIndex = gridStorage[0].columnSortFilter.FilterList.findIndex(function (item) { return item.FilterColumn === "FullName" && item.FilterValue === "!=System System" });
						gridStorage[0].columnSortFilter.FilterList.splice(selectedIndex, 1);
						var updatedGridStorage = JSON.stringify(gridStorage);
						window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);
					}
				}
			}
			gridRefresh(gId);
		}

		//For Clear Filter
		self.clearfilter = function (gId) {
			var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
			gridStorage[0].CallType = ENUM.get("CALLTYPE_NONE");
			CallType = gridStorage[0].CallType;
			var updatedGridStorage = JSON.stringify(gridStorage);
			window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);

			gridFilterClear(gId);
		}

		// For Refresh Grid
		self.refreshGrid = function (gId) {
			gridRefresh(gId);
		}

		self.exportFileValue.subscribe(function (newValue) {
			if (self.exportFileValue().trim() != '') {
				$("#btnSaveExportFiles").removeAttr('disabled');
			} else {
				$("#btnSaveExportFiles").prop('disabled', true);				
			} 
		})

		self.validateFileName = function (data) {
            if (!_.isEmpty($("#txtExportFilesName").val().trim())) {
                if (!validateFileName($("#txtExportFilesName").val())) {
                    $("#foldersErrorTip").show();
                    $("#characters").removeClass('hide');
					$("#characters").text('Following characters are not allowed. \\ : * ? "<>\/|');
					$('#btnSaveExportFiles').prop('disabled', true);
                } else {
                    $("#foldersErrorTip").hide();
                    $("#characters").addClass('hide');
					$("#characters").text('');
					$('#btnSaveExportFiles').prop('disabled', false);
                }
            } else {
                $("#foldersErrorTip").hide();
                $("#characters").addClass('hide');
                $("#characters").text('');
			 }
        }
		
		self.exportDiagnosticFiles = function(gId) {	
			var selectedIds = getSelectedUniqueId(gId);
			var unSelectedIds = getUnSelectedUniqueId(gId);
			var exportDiagnosticFilesReq = new Object();
			var Selector = new Object();
	
			exportDiagnosticFilesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
			if (checkAllSelected(gId) == 1) {
				Selector.SelectedItemIds = null;
				Selector.UnSelectedItemIds = unSelectedIds;
			} else {
				Selector.SelectedItemIds = selectedIds;
				Selector.UnSelectedItemIds = null;
			}
	
			exportDiagnosticFilesReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
			exportDiagnosticFilesReq.Selector = Selector;
			exportDiagnosticFilesReq.ExportedFileName = $('#txtExportFilesName').val().trim();
	
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						$('#exportFilesDiv').modal('hide');
						openAlertpopup(1, 'export_file_Sucess');
						$("#txtExportFilesName").val('');
					}
					else if (data.responseStatus.StatusCode == AppConstants.get('EX_DIAGNOSTIC_FILES_SIZE_LIMIT_EXCEED')) {
						$('#exportFilesDiv').modal('hide');
						openAlertpopup(2, i18n.t('ex_diagnostic_files_size_limit_exceed', { limit: exportFileSizeLimit }, { lng: lang }));
					}
					else if (data.responseStatus.StatusCode == AppConstants.get('EX_NO_FILE_AVAILABLE_FOR_DOWNLOAD')) {
						$('#exportFilesDiv').modal('hide');
						openAlertpopup(2, i18n.t('ex_no_file_available_for_download'));
					}
				} else if (error) {
					openAlertpopup(2, 'network_error');
				}
			}
			var method = 'ExportDiagnosticFiles';
			var params = '{"token":"' + TOKEN() + '","exportDiagnosticFilesReq":' + JSON.stringify(exportDiagnosticFilesReq) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
			gridRefresh(gId);
		}
		
		// ExportToExcel 
		self.exportToExcel = function (isExport, gId) {
			var selectedDetailedActionItems = getSelectedUniqueId(gId);
			var unselectedDetailedActionItems = getUnSelectedUniqueId(gId);
			var checkAll = checkAllSelected(gId);
			visibleColumnsList = GetExportVisibleColumn(gId);
			var param = detailedAtionStatusParameter(true, ADSearchUtil.deviceSearchObj, columnSortFilter, selectedDetailedActionItems, unselectedDetailedActionItems, checkAll, visibleColumnsList);


			self.exportGridId = ko.observable(gId);
			self.exportSucess = ko.observable();
			self.exportflage = ko.observable();
			var datainfo = $("#" + gId).jqxGrid('getdatainformation');
			if (datainfo.rowscount > 0) {
				detailedContentExport(param, gId, self.openPopup);
			} else {
				openAlertpopup(1, 'no_data_to_export');
			}
		}

		function generateTemplate(tempname, controllerId) {
			var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
			var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
			var cunanem = tempname + '1';
			ko.components.register(tempname, {
				viewModel: { require: ViewName },
				template: { require: 'plugin/text!' + htmlName }
			});
		}

		//ExportToExcel Goes To this Function
		function detailedContentExport(param, gId, openPopup) {
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(1, 'export_Sucess');
					}
				}
			}

			var params = JSON.stringify(param);;
			ajaxJsonCall('GetDiagnosticsResultDetails', params, callBackfunction, true, 'POST', true);
		}
	}

	function detailedActionStatusGrid(gID, param, modelPopup) {

		var gridheight = $(window).height();
		var percentValue;
		if (gridheight > 600) {
			percentValue = (20 / 100) * gridheight;
			gridheight = gridheight - 150;
			gridheight = gridheight - percentValue + 'px';
		} else {
			gridheight = '400px';
		}

		var gridColumns = [];
		var DynamicColumns = [];
		var initfieldsArr = [];
		var sourceDataFieldsArr = [
			{ name: 'isSelected', type: 'number' },
			{ name: 'UniqueDeviceId', map: 'UNIQUEDEVICEID' },
			{ name: 'SerialNumber', map: 'SERIALNUMBER' },
			{ name: 'DeviceId', map: 'TASKDEVICEID' },
			{ name: 'HierarchyFullPath', map: 'HIERARCHYFULLPATH', type: 'string' },
			{ name: 'ModelName', map: 'MODELNAME' },
			{ name: 'JobName', map: 'JOBNAME' },
			{ name: 'JobStatus', map: 'COMPJOBSTATUS' },
			{ name: 'ComputedDeviceStatus', map: 'COMPUTEDDEVICESTATUS' },
			{ name: 'DeviceActionTypeDisplayName', map: 'DEVICEACTIONTYPEDISPLAYNAME' },
			{ name: 'Status', map: 'STATUS' },
			{ name: 'StatusReceivedDate', map: 'STATUSRECEIVEDDATE', type: 'date' },
			{ name: 'ScheduledDate', map: 'SCHEDULEDDATE' },
			{ name: 'OperationExecutionTimeOnDevice', map: 'OPERATIONEXECUTIONTIMEONDEVICE' },
			{ name: 'JobCreatedByUserName', map: 'JOBCREATEDBYUSERNAME' },
			{ name: 'JobCreatedOn', map: 'JOBCREATEDON', type: 'date' },
			{ name: 'TaskId', map: 'TASKID' },
			{ name: 'FullName', map: 'FULLNAME' },
			{ name: 'LoginName', map: 'LOGINNAME' },
			{ name: 'Component', map: 'COMPONENT' },
			{ name: 'IsDownloadAllowed', map: 'ISDOWNLOADALLOWED' },
			{ name: 'IsCancelRequestFailed', map: 'ISCANCELREQUESTFAILED' },
			{ name: 'AdditionalStatusInfo', map: 'JOBDEVICESADDITIONALSTATUSINFO' },
			{ name: 'ActionTasksAdditionalInfo', map: 'ACTIONTASKSADDITIONALINFO' },
			{ name: 'LastHeartBeat', map: 'LASTHEARTBEAT' },
			{ name: 'TaskSentDate', map: 'TASKSENTDATE' }
		];

		var InitGridStoragObj = initGridStorageObj(gID, ENUM.get("CALLTYPE_DAY"));
		var gridStorage = InitGridStoragObj.gridStorage;
		var adStorage = InitGridStoragObj.adStorage;
		CallType = InitGridStoragObj.CallType;

		var source =
		{
			dataType: "json",
			dataFields: sourceDataFieldsArr,

			type: "POST",
			data: param,
			root: 'DiagnosticResult',
			url: AppConstants.get('API_URL') + "/GetDiagnosticsResultDetails",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data.getDiagnosticsResultDetailsResp) {
					data.getDiagnosticsResultDetailsResp = $.parseJSON(data.getDiagnosticsResultDetailsResp);
				}
				else
					data.getDiagnosticsResultDetailsResp = [];

				if (data.getDiagnosticsResultDetailsResp && data.getDiagnosticsResultDetailsResp.PaginationResponse && data.getDiagnosticsResultDetailsResp.PaginationResponse.TotalRecords > 0) {
					source.totalrecords = data.getDiagnosticsResultDetailsResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getDiagnosticsResultDetailsResp.PaginationResponse.TotalPages;
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
					disableIcons(['btnExportFiles', 'btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
					columnSortFilter = new Object();
					columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'DetailedActionStatus', 'StatusReceivedDate');
					koUtil.GlobalColumnFilter = columnSortFilter;

					param.getDiagnosticsResultDetailsReq.ColumnSortFilter = includeSystemCreatedJobs ? columnSortFilter : getDiagnosticFilter(columnSortFilter);
					param.getDiagnosticsResultDetailsReq.CallType = CallType;
					param.getDiagnosticsResultDetailsReq.Pagination = getPaginationObject(param.getDiagnosticsResultDetailsReq.Pagination, gID);

					///for staemangment
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

					updatepaginationOnState(gID, gridStorage, param.getDiagnosticsResultDetailsReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage, param.getDiagnosticsResultDetailsReq.CallType);
					var customData = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
					if (customData) {
						ADSearchUtil.deviceSearchObj = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
						ADSearchUtil.SearchText = sessionStorage.getItem(gID + 'CustomSearchText');
						$("#deviceCriteriaDiv").empty();
						$("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
					}
					param.getDiagnosticsResultDetailsReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
					data = JSON.stringify(param);
					return data;
				},
				downloadComplete: function (data, status, xhr, gId) {
					//if (data.getDiagnosticsResultDetailsResp) {
					//    data.getDiagnosticsResultDetailsResp = $.parseJSON(data.getDiagnosticsResultDetailsResp);
					//}
					if (data.getDiagnosticsResultDetailsResp && data.getDiagnosticsResultDetailsResp.DiagnosticResult) {
						for (var i = 0; i < data.getDiagnosticsResultDetailsResp.DiagnosticResult.length; i++) {
							data.getDiagnosticsResultDetailsResp.DiagnosticResult[i].SCHEDULEDDATE = convertToDeviceZonetimestamp(data.getDiagnosticsResultDetailsResp.DiagnosticResult[i].SCHEDULEDDATE);
							data.getDiagnosticsResultDetailsResp.DiagnosticResult[i].OPERATIONEXECUTIONTIMEONDEVICE = convertToDeviceZonetimestamp(data.getDiagnosticsResultDetailsResp.DiagnosticResult[i].OPERATIONEXECUTIONTIMEONDEVICE);
							data.getDiagnosticsResultDetailsResp.DiagnosticResult[i].JOBCREATEDON = convertToLocaltimestamp(data.getDiagnosticsResultDetailsResp.DiagnosticResult[i].JOBCREATEDON);
							data.getDiagnosticsResultDetailsResp.DiagnosticResult[i].STATUSRECEIVEDDATE = convertToLocaltimestamp(data.getDiagnosticsResultDetailsResp.DiagnosticResult[i].STATUSRECEIVEDDATE);
							data.getDiagnosticsResultDetailsResp.DiagnosticResult[i].LASTHEARTBEAT = convertToDeviceZonetimestamp(data.getDiagnosticsResultDetailsResp.DiagnosticResult[i].LASTHEARTBEAT);
							data.getDiagnosticsResultDetailsResp.DiagnosticResult[i].TASKSENTDATE = convertToDeviceZonetimestamp(data.getDiagnosticsResultDetailsResp.DiagnosticResult[i].TASKSENTDATE);
						}
					}
					//Start advanced search
					initfieldsArr = sourceDataFieldsArr;

					ADSearchUtil.localDynamicColumns = [];//<!---advance search changes--->
					if (data.getDiagnosticsResultDetailsResp && data.getDiagnosticsResultDetailsResp.DynamicColumns) {
						DynamicColumns = data.getDiagnosticsResultDetailsResp.DynamicColumns;
						for (var i = 0; i < data.getDiagnosticsResultDetailsResp.DynamicColumns.length; i++) {
							var FieldSource = _.where(sourceDataFieldsArr, { name: data.getDiagnosticsResultDetailsResp.DynamicColumns[i].AttributeName });
							if (FieldSource == '') {
								var dynamicObj = new Object();
								dynamicObj.name = data.getDiagnosticsResultDetailsResp.DynamicColumns[i].AttributeName;
								dynamicObj.map = data.getDiagnosticsResultDetailsResp.DynamicColumns[i].AttributeName.toUpperCase();
								if (data.getDiagnosticsResultDetailsResp.DynamicColumns[i].ControlType == 'Date') {
									dynamicObj.type = 'date';
								}
								ADSearchUtil.newAddedDataFieldsArr.push(dynamicObj);
								var exportDynamicColumns = new Object();
								exportDynamicColumns.AttributeName = data.getDiagnosticsResultDetailsResp.DynamicColumns[i].AttributeName;
								exportDynamicColumns.AttributeType = data.getDiagnosticsResultDetailsResp.DynamicColumns[i].AttributeType;
								exportDynamicColumns.ControlType = data.getDiagnosticsResultDetailsResp.DynamicColumns[i].ControlType;
								exportDynamicColumns.DisplayName = data.getDiagnosticsResultDetailsResp.DynamicColumns[i].DisplayName;
								exportDynamicColumns.FilterSource = data.getDiagnosticsResultDetailsResp.DynamicColumns[i].FilterSource;
								exportDynamicColumns.IsCustomAttribute = data.getDiagnosticsResultDetailsResp.DynamicColumns[i].IsCustomAttribute;
								exportDynamicColumns.IsInDeviceTimeZone = data.getDiagnosticsResultDetailsResp.DynamicColumns[i].IsInDeviceTimeZone;
								ADSearchUtil.ExportDynamicColumns.push(exportDynamicColumns);
							}
							var ColumnSource = _.where(gridColumns, { datafield: data.getDiagnosticsResultDetailsResp.DynamicColumns[i].AttributeName });

							var coulmnObj = new Object();
							coulmnObj.text = i18n.t(data.getDiagnosticsResultDetailsResp.DynamicColumns[i].DisplayName, { lng: lang });
							coulmnObj.datafield = data.getDiagnosticsResultDetailsResp.DynamicColumns[i].AttributeName;
							coulmnObj.editable = false;
							coulmnObj.minwidth = 200;
							coulmnObj.width = 'auto';
							coulmnObj.enabletooltips = true;
							if (data.getDiagnosticsResultDetailsResp.DynamicColumns[i].ControlType == 'Date') {
								coulmnObj.cellsformat = LONG_DATETIME_GRID_FORMAT;
							}
							coulmnObj.filtertype = "custom";
							if (data.getDiagnosticsResultDetailsResp.DynamicColumns[i].ControlType == 'TextBox') {
								coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
							} else if (data.getDiagnosticsResultDetailsResp.DynamicColumns[i].ControlType == 'MultiCombo' || data.getDiagnosticsResultDetailsResp.DynamicColumns[i].ControlType == 'Combo') {
								coulmnObj.createfilterpanel = function (datafield, filterPanel) {
									var FilterSource = AppConstants.get(datafield);
									buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource);
								};
							} else if (data.getDiagnosticsResultDetailsResp.DynamicColumns[i].ControlType == 'Date') {
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
					enableIcons(['btnExportFiles', 'btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
					if (data.getDiagnosticsResultDetailsResp && data.getDiagnosticsResultDetailsResp.DiagnosticResult) {
				        gridStorage[0].TotalSelectionCount = data.getDiagnosticsResultDetailsResp.TotalSelectionCount;
					    var updatedGridStorage = JSON.stringify(gridStorage);
					    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);			    
					} else {
						source.totalrecords = 0;
						source.totalpages = 0;
						data.getDiagnosticsResultDetailsResp = new Object();
						data.getDiagnosticsResultDetailsResp.DiagnosticResult = [];
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
				},
				loadError: function (jqXHR, status, error) {
					$('.all-disabled').hide();
				}
			}
		);

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
			var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'IsDownloadAllowed', 'TaskId');
			return classname;
		}

		//for allcheck
		var rendered = function (element) {
			enablegridfunctions(gID, 'TaskId', element, gridStorage, true, 'pagerDivDetailAction', true, 1, 'IsDownloadAllowed', null, null, null, null);
			return true;
		}

		//for device profile
		function SerialNoRendereDetailAction(row, columnfield, value, defaulthtml, columnproperties) {
			var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
			return html;
		}

		var cellbeginedit = function (row, datafield, columntype, value) {
			var check = $("#" + gID).jqxGrid('getcellvalue', row, 'IsDownloadAllowed', 'TaskId');
			if (check == true) {
				return true;
			} else {
				return false;
			}
		}

		// custom tooltip for job status
		var toolTipDetailsRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = displayTooltipAndIconRenderer(gID, row, column, value, defaultHtml, 2);
			return defaultHtml;
		}

		// tooltip for diagnostice status
		var diagnosticTooltip = function (row, column, value) {
			var rowData = $("#" + gID).jqxGrid('getrowdata', row);

			var text = "Status: ";
			var defaultHtml = '';
			var date = rowData ? (rowData.StatusReceivedDate ? rowData.StatusReceivedDate : null) : null;
			var formateddate = date ? moment(date).format(LONG_DATETIME_FORMAT_AMPM) : '';
			var actionTasksAdditionalInfo = rowData ? (rowData.ActionTasksAdditionalInfo ? rowData.ActionTasksAdditionalInfo : '') : '';
			var recivedDate = "Status Received Date: ";
			var reason = "Reason: ";

			if (value == "Success") {
				defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '\n' + recivedDate + '' + formateddate + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg  SuccessAction "></div></a>' + value + '</span></div>';
			} else {
				defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '\n' + reason + '' + actionTasksAdditionalInfo + '\n' + recivedDate + '' + formateddate + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg  Actionfailed "></div></a>' + value + '</span></div>';
			}
			return defaultHtml;
		}

		var deviceStatusRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml)
			return defaultHtml;
		}

		//ToolTip For Create by Column
		var createdBytooltip = function (row, column, value, defaultHtml) {
			var rowData = $("#" + gID).jqxGrid('getrowdata', row);
			var createdBy = rowData.JobCreatedByUserName;
			var loginName = rowData.LoginName;
			if (createdBy != null || createdBy != '') {
				return defaultHtml = '<div style="padding-left:5px;padding-top:7px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"><span style="padding-left:5px;padding-top:7px;" title="' + createdBy + '">' + value + '</span></div>';
			} else {
				return defaultHtml = '<div style="padding-left:5px;padding-top:7px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"><span style="padding-left:5px;padding-top:7px;" title="' + loginName + '">' + value + '</span></div>';
			}
		}

		var initialColumnFilter = function () {
			return initialColumnFilterBuilder(gridStorage);
		}();

		gridColumns = [
			{
				text: '', menu: false, sortable: false, filterable: false, cellbeginedit: cellbeginedit, cellclassname: cellclass, columntype: 'checkbox', enabletooltips: false,
				datafield: 'isSelected', width: 40, renderer: function () {
					return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
				}, rendered: rendered
			},
			{
				text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 120, filtertype: "custom", enabletooltips: false, cellsrenderer: SerialNoRendereDetailAction,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 120, filtertype: "custom", enabletooltips: false, cellsrenderer: SerialNoRendereDetailAction,
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
				text: i18n.t('job_name', { lng: lang }), datafield: 'JobName', editable: false, minwidth: 160,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('job_status', { lng: lang }), datafield: 'JobStatus', editable: false, minwidth: 160, enabletooltips: false, cellsrenderer: toolTipDetailsRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Diagnostic Job Status');
				}
			},
			{
				text: i18n.t('action', { lng: lang }), datafield: 'DeviceActionTypeDisplayName', editable: false, minwidth: 150,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('Diagnostic_status', { lng: lang }), datafield: 'Status', editable: false, minwidth: 180, enabletooltips: false, cellsrenderer: diagnosticTooltip,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Diagnostic Action Status');
				}
			},
			{
				text: i18n.t('status_recieved_date', { lng: lang }), editable: false, datafield: 'StatusReceivedDate', filter: initialColumnFilter, minwidth: 180, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			},
			{
				text: i18n.t('action_schedule', { lng: lang }), datafield: 'ScheduledDate', editable: false, minwidth: 140, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			},
			{
				text: i18n.t('action_executed_at', { lng: lang }), datafield: 'OperationExecutionTimeOnDevice', editable: false, minwidth: 180, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

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
				text: i18n.t('createdOn', { lng: lang }), datafield: 'JobCreatedOn', editable: false, minwidth: 180, enabletooltips: false, cellsformat: LONG_DATETIME_GRID_FORMAT,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			},
			{
				text: i18n.t('additional_info', { lng: lang }), hidden: true, datafield: 'ActionTasksAdditionalInfo', editable: false, minwidth: 130,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('last_heartBeat', { lng: lang }), hidden: true, datafield: 'LastHeartBeat', editable: false, minwidth: 150, filterable: true, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			},
			{
				text: i18n.t('last_Mgmt_plan', { lng: lang }), hidden: true, datafield: 'TaskSentDate', editable: false, minwidth: 150, filterable: true, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);
				}
			}
		];

		$("#" + gID).jqxGrid(
			{

				width: "100%",
				height: gridHeightFunction(gID, "1"),
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

							}
							var gID = ADSearchUtil.gridIdForAdvanceSearch;
							$("#" + gID).jqxGrid('showcolumn', ADSearchUtil.newAddedgridColumns[k].datafield);
						}

						//<!---advance search changes--->
						for (var i = 0; i < ADSearchUtil.localDynamicColumns.length; i++) {
							$("#" + gID).jqxGrid('showcolumn', ADSearchUtil.localDynamicColumns[i].datafield);
						}
						//<!---end--->
						for (var i = 0; i < gridColumns.length; i++) {
							if ($.inArray(gridColumns[i].datafield, ADSearchUtil.initColumnsArr) < 0) {
								if (DynamicColumns) {
									var checkSource = _.where(DynamicColumns, { AttributeName: gridColumns[i].datafield });//<!---advance search changes--->
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

					callOnGridReady(gID, gridStorage, CallType, 'StatusReceivedDate');
					//CallType = addDefaultfilter(CallType, 'StatusReceivedDate', gID);
					//CallType = addDefaultfilter(CallType, 'JobCreatedOn', gID)

					var columns = genericHideShowColumn(gID, true, ['ActionTasksAdditionalInfo', 'LastHeartBeat', 'TaskSentDate']);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsList = koUtil.gridColumnList;
					visibleColumnsList.push('LastHeartBeat');
					var gridheight = $(window).height();
					if (gridheight > 600) {
						gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 40;
					} else {
						gridheight = '400px';
					}
					$("#" + gID).jqxGrid({ height: gridheight });
				},
			});//JqxGrid End

		getGridBiginEdit(gID, 'TaskId', gridStorage);
		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'TaskId');

	}


	function detailedAtionStatusParameter(isExport, deviceSearchObj, columnSortFilter, selectedDetailedActionItems, unselectedDetailedActionItems, checkAll, visibleColumns) {
		var getDiagnosticsResultDetailsReq = new Object();

		var Export = new Object();
		var Pagination = new Object();
		var Selector = new Object();

		Pagination.HighLightedItemId = null
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

		Export.VisibleColumns = visibleColumns;
		if (checkAll == 1) {
			Selector.SelectedItemIds = null;
			Selector.UnSelectedItemIds = unselectedDetailedActionItems;
			if (isExport == true) {
				Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
				Export.IsAllSelected = true;
				Export.IsExport = true;
			} else {
				Export.IsAllSelected = false;
				Export.IsExport = false;
			}
		} else {
			Selector.SelectedItemIds = selectedDetailedActionItems;
			Selector.UnSelectedItemIds = null;
			if (isExport == true) {
				Export.IsAllSelected = false;
				Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
				Export.IsExport = true;
			} else {
				Export.IsAllSelected = false;
				Export.IsExport = false;
			}
		}

		getDiagnosticsResultDetailsReq.ColumnSortFilter = columnSortFilter;
		getDiagnosticsResultDetailsReq.Export = Export;
		getDiagnosticsResultDetailsReq.DeviceSearch = deviceSearchObj;
		getDiagnosticsResultDetailsReq.Pagination = Pagination;
		getDiagnosticsResultDetailsReq.Selector = Selector;
		getDiagnosticsResultDetailsReq.UniqueDeviceId = 0;
		getDiagnosticsResultDetailsReq.CallType = CallType;

		var param = new Object();
		param.token = TOKEN();
		param.getDiagnosticsResultDetailsReq = getDiagnosticsResultDetailsReq;

		return param;
	}
});