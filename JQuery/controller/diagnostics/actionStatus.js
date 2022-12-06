var localData;
define(["knockout", "koUtil", "autho", "advancedSearchUtil"], function (ko, koUtil, autho, ADSearchUtil) {
	var lang = getSysLang();
	columnSortFilterActionJob = new Object();
	columnSortFilterActionJobBackUp = new Object();
	columnSortFilterModelActionJob = new Object();
	koUtil.GlobalColumnFilter = new Array();
	jobDevicesId = 0;
	jobName = 0;
	var includeSystemCreatedJobs = false;

	return function DashBoardViewModel() {

		var self = this;

		//Draggable function
		$('#modelActionPopupHeader').mouseup(function () {
			$("#modelActionPopupContent").draggable({ disabled: true });
		});

		$('#modelActionPopupHeader').mousedown(function () {
			$("#modelActionPopupContent").draggable({ disabled: false });
		});

		$('#advanceSearchModalHeader').mouseup(function () {
			$("#AdvanceSearchModalContent").draggable({ disabled: true });
		});

		$('#advanceSearchModalHeader').mousedown(function () {
			$("#AdvanceSearchModalContent").draggable({ disabled: false });
		});
		/////////


		$('#cancelbtn').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#cancelbtn').click();
			}
		});

		//Check Rights
		self.checkRights = function (screenName, rightsFor) {
			var retval = autho.checkRightsBYScreen(screenName, rightsFor);
			return retval;
		}

		self.templateFlag = ko.observable(false);
		self.observableModelComponent = ko.observable();
		self.observableModelPopup = ko.observable();
		self.gridIdForShowHide = ko.observable();
		self.AdvanceTemplateFlag = ko.observable(false);
		self.observableCriteria = ko.observable();
		self.observableAdvancedSearchModelPopup = ko.observable();
		self.columnlist = ko.observableArray();

		ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridActionJob';
		ADSearchUtil.SearchForChart = false;
		ADSearchUtil.SearchForGrid = true;
		ADSearchUtil.ExportDynamicColumns = [];
		ADSearchUtil.deviceSearchObj = new Object();
		ADSearchUtil.newAddedDataFieldsArr = [];
		ADSearchUtil.newAddedgridColumns = [];
		ADSearchUtil.AdScreenName = 'Action Job Status';
		ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "ModelName", "ComputedDeviceStatus", "HierarchyFullPath", "Component", "JobName", "JobStatus", "Tags", "Actions", "ScheduleDate", "BeginActionAt", "Recurrence", "JobCreatedBy", "JobCreatedOn", "results", "ActionType", "OperationExecutionTimeOnDevice", "Status", "RecievedOn", "FileUrl", "FullName"];
		var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'ComputedDeviceStatus', 'HierarchyFullPath', 'ActionType', 'results'];
		var modelName = "unloadTemplate";

		init();
		function init() {
			setMenuSelection();
			loadelement(modelName, 'genericPopup', 1);
			loadelement(modelName, 'genericPopup', 2);
			loadCriteria('modalCriteria', 'genericPopup');
			loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');			

			var param = getDiagnosticDetails(false, columnSortFilterActionJob, null, null, 0, ADSearchUtil.deviceSearchObj, []);
			getDiagnosticGridResult('jqxgridActionJob', param, self.observableAdvancedSearchModelPopup);
			
			seti18nResourceData(document, resourceStorage);

			if (includeSystemCreatedJobs) {
				$("#btnClearCreatedByActionJob").prop('title', i18n.t('hide_system_created_jobs', { lng: lang }));
			} else {
				$("#btnClearCreatedByActionJob").prop('title', i18n.t('show_system_created_jobs', { lng: lang }));
			}
		}

		function loadelement(elementname, controllerId, flag) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			if (flag == 2) {
				self.observableModelPopup(elementname);
			} else {
				self.observableModelComponent(elementname);
			}
		}

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
					if ($.inArray(arr[i].columnfield, ADSearchUtil.initColumnsArr) < 0) {
						var source = _.where(ADSearchUtil.localDynamicColumns, { datafield: arr[i].columnfield });//////
						if (source == '') {
							self.columnlist.remove(arr[i]);
						}
					}
				}

				if (ADSearchUtil.resetAddSerchFlag == 'reset') {
					for (var i = 0; i < ADSearchUtil.newAddedgridColumns.length; i++) {
						var source = _.where(self.columnlist(), { columnfield: ADSearchUtil.newAddedgridColumns[i].datafield });
						if (source != '') {
							self.columnlist.remove(source[0]);
						}
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
			} else if (popupName == 'modelAdvancedSearch') {// Advance Search
				self.AdvanceTemplateFlag(true);
				loadAdvancedSearchModelPopup(popupName, 'genericPopup');
				$('#AdvanceSearchModal').modal('show');
			}
		}

		//unload template
		self.unloadTempPopup = function (popupName, gId, exportflage) {
			self.observableModelComponent('unloadTemplate');
			self.observableModelPopup('unloadTemplate');
			if (gId === 'modelActionJobStatus' || gId === 'modelCancelActionJobStatus') {
				$('#modelActionID').modal('hide');
			} else {
				$('#modelActionPopupID').modal('hide');
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

		//close popup
		self.closeOpenModel = function (gridID, modelPopup) {
			$('#' + gridID).jqxGrid('render');
			$('#' + modelPopup).modal('hide');
			isPopUpOpen = false;
			$("#modelActionPopupContent").css('left', '');
			$("#modelActionPopupContent").css('top', '');
		}

		self.showHideSystemCreatedJobs = function (gridID) {
			if (includeSystemCreatedJobs) {
				includeSystemCreatedJobs = false;
				$("#btnClearCreatedByActionJob").prop('title', i18n.t('show_system_created_jobs', { lng: lang }));
			} else {
				includeSystemCreatedJobs = true;
				$("#btnClearCreatedByActionJob").prop('title', i18n.t('hide_system_created_jobs', { lng: lang }));
				var gridStorage = JSON.parse(sessionStorage.getItem(gridID + "gridStorage"));
				if (!_.isEmpty(gridStorage) && gridStorage.length > 0) {
					if (!_.isEmpty(gridStorage[0].columnSortFilter) && !_.isEmpty(gridStorage[0].columnSortFilter.FilterList) && gridStorage[0].columnSortFilter.FilterList.length > 0) {
						var selectedIndex = gridStorage[0].columnSortFilter.FilterList.findIndex(function (item) { return item.FilterColumn === "FullName" && item.FilterValue === "!=System System" });
						gridStorage[0].columnSortFilter.FilterList.splice(selectedIndex, 1);
						var updatedGridStorage = JSON.stringify(gridStorage);
						window.sessionStorage.setItem(gridID + 'gridStorage', updatedGridStorage);
					}
				}
			}
			gridRefresh(gridID);
		}

		//reset fillter
		self.clearFilter = function (gridID) {
			var gridStorage = JSON.parse(sessionStorage.getItem(gridID + "gridStorage"));
			gridStorage[0].CallType = ENUM.get("CALLTYPE_NONE");
			CallType = gridStorage[0].CallType;
			var updatedGridStorage = JSON.stringify(gridStorage);
			window.sessionStorage.setItem(gridID + 'gridStorage', updatedGridStorage);
			///end
			//CallType = ENUM.get("CALLTYPE_NONE");
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

			if (gridID == "jqxgridActionJob") {
				var param = getDiagnosticDetails(isExport, columnSortFilterActionJobBackUp, selectedActionJobItems, unselectedActionJobItems, checkAll, ADSearchUtil.deviceSearchObj, visibleColumnsList);
				if (datainfo.rowscount > 0) {
					actionJobExport(param, gridID, self.openPopup);
				} else {
					openAlertpopup(1, 'no_data_to_export');
				}
			} else {
				var param = getModelActionJobStatusParameters(isExport, columnSortFilterModelActionJob, jobDevicesId, jobName, visibleColumnsListForPopup);
				if (datainfo.rowscount > 0) {
					modelActionJobExport(param);
				}
				else {
					openAlertpopup(1, 'no_data_to_export');
				}
			}
		}
	}

	function generateTemplate(tempname, controllerId) {
		var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
		var viewName = 'controller/' + controllerId + '/' + tempname + '.js';
		ko.components.register(tempname, {
			viewModel: { require: viewName },
			template: { require: 'plugin/text!' + htmlName }
		});
	}

	function actionJobExport(param, gridID, openPopup) {
		var callbackFunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					openAlertpopup(1, 'export_Sucess');
				}
			}
		}

		var method = 'GetDiagnosticsJobSummary';
		var params = JSON.stringify(param);
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	function getDiagnosticGridResult(gID, param, modelPopup) {
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
			{ name: 'JobDevicesId', map: 'JOBDEVICESID' },
			{ name: 'SerialNumber', map: 'SERIALNUMBER' },
			{ name: 'DeviceId', map: 'TASKDEVICEID' },
			{ name: 'Component', map: 'COMPONENT' },
			{ name: 'HierarchyFullPath', map: 'HIERARCHYFULLPATH', type: 'string' },
			{ name: 'ModelName', map: 'MODELNAME' },
			{ name: 'ComputedDeviceStatus', map: 'COMPUTEDDEVICESTATUS' },
			{ name: 'JobName', map: 'JOBNAME' },
			{ name: 'JobStatus', map: 'COMPJOBSTATUS' },
			{ name: 'Tags', map: 'TAGS' },
			{ name: 'Actions', map: 'ACTIONSVERBOSE' },
			{ name: 'ScheduleDate', map: 'SCHEDULEDDATE', type: 'date' },
			{ name: 'BeginActionAt', map: 'BEGINACTIONAT' },
			{ name: 'Recurrence', map: 'SCHEDULERECCURANCEVERBOSE' },
			{ name: 'JobCreatedBy', map: 'JOBCREATEDBY' },
			{ name: 'JobCreatedOn', map: 'JOBCREATEDON', type: 'date' },
			{ name: 'FullName', map: 'FULLNAME' },
			{ name: 'IsJobCancelAllowed', map: 'ISJOBCANCELALLOWED' },
			{ name: 'IsCancelRequestFailed', map: 'ISCANCELREQUESTFAILED' },
			{ name: 'LastHeartBeat', map: 'LASTHEARTBEAT', type: 'date' },
			{ name: 'AdditionalStatusInfo', map: 'ADDITIONALSTATUSINFO' },
		];

		var InitGridStoragObj = initGridStorageObj(gID, ENUM.get("CALLTYPE_DAY"));
		var gridStorage = InitGridStoragObj.gridStorage;
		var adStorage = InitGridStoragObj.adStorage;
		CallType = InitGridStoragObj.CallType;

		var source = {
			dataType: 'json',
			datafields: sourceDataFieldsArr,
			root: 'DiagnosticsJobs',
			type: 'POST',
			data: param,
			url: AppConstants.get('API_URL') + "/GetDiagnosticsJobSummary",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data.getDiagnosticsJobSummaryResp) {
					data.getDiagnosticsJobSummaryResp = $.parseJSON(data.getDiagnosticsJobSummaryResp);
					if (data.getDiagnosticsJobSummaryResp.PaginationResponse && data.getDiagnosticsJobSummaryResp.PaginationResponse.TotalRecords > 0) {
						source.totalrecords = data.getDiagnosticsJobSummaryResp.PaginationResponse.TotalRecords;
						source.totalpages = data.getDiagnosticsJobSummaryResp.PaginationResponse.TotalPages;
					} else {
						source.totalrecords = 0;
						source.totalpages = 0;
					}
				}
				else
					data.getDiagnosticsJobSummaryResp = [];
			},
		}
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
					columnSortFilterActionJob = new Object();
					columnSortFilterActionJob = columnSortFilterFormatedData(columnSortFilterActionJob, gID, gridStorage, 'ActionStatus', 'JobCreatedOn');
					koUtil.GlobalColumnFilter = columnSortFilterActionJob;

					param.getDiagnosticsJobSummaryReq.ColumnSortFilter = includeSystemCreatedJobs ? columnSortFilterActionJob : getDiagnosticFilter(columnSortFilterActionJob);
					param.getDiagnosticsJobSummaryReq.CallType = CallType;
					param.getDiagnosticsJobSummaryReq.Pagination = getPaginationObject(param.getDiagnosticsJobSummaryReq.Pagination, gID);

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

					updatepaginationOnState(gID, gridStorage, param.getDiagnosticsJobSummaryReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage, param.getDiagnosticsJobSummaryReq.CallType);

					var customData = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
					if (customData) {
						ADSearchUtil.deviceSearchObj = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
						ADSearchUtil.SearchText = sessionStorage.getItem(gID + 'CustomSearchText');
						$("#deviceCriteriaDiv").empty();
						$("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
					}
					param.getDiagnosticsJobSummaryReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
					data = JSON.stringify(param);
					return data;
				},
				downloadComplete: function (data, status, xhr) {
					if (data) {
						//if (data.getDiagnosticsJobSummaryResp) {
						//    data.getDiagnosticsJobSummaryResp = $.parseJSON(data.getDiagnosticsJobSummaryResp);
						//}
						if (data.getDiagnosticsJobSummaryResp && data.getDiagnosticsJobSummaryResp.DiagnosticsJobs) {
							for (var i = 0; i < data.getDiagnosticsJobSummaryResp.DiagnosticsJobs.length; i++) {
								data.getDiagnosticsJobSummaryResp.DiagnosticsJobs[i].SCHEDULEDATE = convertToDeviceZonetimestamp(data.getDiagnosticsJobSummaryResp.DiagnosticsJobs[i].SCHEDULEDATE);
								//data.getDiagnosticsJobSummaryResp.DiagnosticsJobs[i].BEGINACTIONAT = convertToDeviceZonetimestamp(data.getDiagnosticsJobSummaryResp.DiagnosticsJobs[i].BEGINACTIONAT);
								data.getDiagnosticsJobSummaryResp.DiagnosticsJobs[i].JOBCREATEDON = convertToLocaltimestamp(data.getDiagnosticsJobSummaryResp.DiagnosticsJobs[i].JOBCREATEDON);
								data.getDiagnosticsJobSummaryResp.DiagnosticsJobs[i].LASTHEARTBEAT = convertToDeviceZonetimestamp(data.getDiagnosticsJobSummaryResp.DiagnosticsJobs[i].LASTHEARTBEAT);
							}
						}
						enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
						initfieldsArr = sourceDataFieldsArr;

						ADSearchUtil.localDynamicColumns = [];//<!---advance search changes--->
						if (data.getDiagnosticsJobSummaryResp && data.getDiagnosticsJobSummaryResp.DynamicColumns) {
							DynamicColumns = data.getDiagnosticsJobSummaryResp.DynamicColumns;
							for (var i = 0; i < data.getDiagnosticsJobSummaryResp.DynamicColumns.length; i++) {
								var FieldSource = _.where(sourceDataFieldsArr, { name: data.getDiagnosticsJobSummaryResp.DynamicColumns[i].AttributeName });
								if (FieldSource == '') {
									var dynamicObj = new Object();
									dynamicObj.name = data.getDiagnosticsJobSummaryResp.DynamicColumns[i].AttributeName;
									dynamicObj.map = data.getDiagnosticsJobSummaryResp.DynamicColumns[i].AttributeName.toUpperCase();
									if (data.getDiagnosticsJobSummaryResp.DynamicColumns[i].ControlType == 'Date') {
										dynamicObj.type = 'date';
									}
									ADSearchUtil.newAddedDataFieldsArr.push(dynamicObj);
									var exportDynamicColumns = new Object();
									exportDynamicColumns.AttributeName = data.getDiagnosticsJobSummaryResp.DynamicColumns[i].AttributeName;
									exportDynamicColumns.AttributeType = data.getDiagnosticsJobSummaryResp.DynamicColumns[i].AttributeType;
									exportDynamicColumns.ControlType = data.getDiagnosticsJobSummaryResp.DynamicColumns[i].ControlType;
									exportDynamicColumns.DisplayName = data.getDiagnosticsJobSummaryResp.DynamicColumns[i].DisplayName;
									exportDynamicColumns.FilterSource = data.getDiagnosticsJobSummaryResp.DynamicColumns[i].FilterSource;
									exportDynamicColumns.IsCustomAttribute = data.getDiagnosticsJobSummaryResp.DynamicColumns[i].IsCustomAttribute;
									exportDynamicColumns.IsInDeviceTimeZone = data.getDiagnosticsJobSummaryResp.DynamicColumns[i].IsInDeviceTimeZone;
									ADSearchUtil.ExportDynamicColumns.push(exportDynamicColumns);
								}
								var ColumnSource = _.where(gridColumns, { datafield: data.getDiagnosticsJobSummaryResp.DynamicColumns[i].AttributeName });

								var coulmnObj = new Object();
								coulmnObj.text = i18n.t(data.getDiagnosticsJobSummaryResp.DynamicColumns[i].DisplayName, { lng: lang });
								coulmnObj.datafield = data.getDiagnosticsJobSummaryResp.DynamicColumns[i].AttributeName;
								coulmnObj.editable = false;
								coulmnObj.minwidth = 200;
								coulmnObj.width = 'auto';
								coulmnObj.enabletooltips = true;
								if (data.getDiagnosticsJobSummaryResp.DynamicColumns[i].ControlType == 'Date') {
									coulmnObj.cellsformat = LONG_DATETIME_GRID_FORMAT;
								}
								coulmnObj.filtertype = "custom";
								if (data.getDiagnosticsJobSummaryResp.DynamicColumns[i].ControlType == 'TextBox') {
									coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
								} else if (data.getDiagnosticsJobSummaryResp.DynamicColumns[i].ControlType == 'MultiCombo' || data.getDiagnosticsJobSummaryResp.DynamicColumns[i].ControlType == 'Combo') {
									coulmnObj.createfilterpanel = function (datafield, filterPanel) {
										var FilterSource = AppConstants.get(datafield);
										buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource);
									};
								} else if (data.getDiagnosticsJobSummaryResp.DynamicColumns[i].ControlType == 'Date') {
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
						//End Advance search

						if (data.getDiagnosticsJobSummaryResp && data.getDiagnosticsJobSummaryResp.DiagnosticsJobs) {
							if (data.getDiagnosticsJobSummaryResp.TotalSelectionCount != 'undefined') {
								gridStorage[0].TotalSelectionCount = data.getDiagnosticsJobSummaryResp.TotalSelectionCount;
								var updatedGridStorage = JSON.stringify(gridStorage);
								window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
							}
							if (data.getDiagnosticsJobSummaryResp.PaginationResponse) {
								//if (data.getDiagnosticsJobSummaryResp.PaginationResponse.HighLightedItemPage > 0) {
								//    //for (var h = 0; h < data.getDiagnosticsJobSummaryResp.DiagnosticsJobs.length; h++) {
								//        //if (data.getDiagnosticsJobSummaryResp.DiagnosticsJobs[h].JOBDEVICESID == data.getDiagnosticsJobSummaryResp.PaginationResponse.HighLightedItemId) {
								//    gridStorage[0].highlightedPage = data.getDiagnosticsJobSummaryResp.PaginationResponse.HighLightedItemPage;
								//    var updatedGridStorage = JSON.stringify(gridStorage);
								//    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
								//        //}
								//    //}
								//}
							} else {

							}
						} else {
							data.getDiagnosticsJobSummaryResp = new Object();
							data.getDiagnosticsJobSummaryResp.DiagnosticsJobs = [];
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

		//for allcheck
		var rendered = function (element) {
			enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, true, 'pagerDivActionJobStatus', true, 1, 'IsJobCancelAllowed', null, null, null);
			return true;
		}

		//for device profile
		function SerialNoRendereActionJob(row, columnfield, value, defaulthtml, columnproperties) {
			var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
			return html;
		}

		var deviceStatusRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml);
			return defaultHtml;
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
			return '<div style="padding-left:5px;padding-top:7px; cursor:pointer"> <a title="Click to view Action Details" id="imageId" tabindex="0" style="text-decoration:underline;" onClick="openIconPopupActionstatus(' + row + ')" height="60" width="50">View Results</a></div>'
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
		var initialColumnFilter = function () {
			return initialColumnFilterBuilder(gridStorage);
		}();
		//for ad Search
		gridColumns = [
			{
				text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclass, resizable: false, draggable: false,
				datafield: 'isSelected', width: 40, renderer: function () {
					return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
				}, rendered: rendered
			},
			{ text: '', datafield: 'JobDevicesId', hidden: true, editable: false, minwidth: 0 },
			{ text: '', datafield: 'UniqueDeviceId', hidden: true, editable: false, minwidth: 0 },
			{ text: '', datafield: 'AdditionalStatusInfo', hidden: true, editable: false, minwidth: 0 },
			{ text: '', datafield: 'IsCancelRequestFailed', hidden: true, editable: false, minwidth: 0 },
			{
				text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 120, enabletooltips: false,
				filtertype: "custom", cellsrenderer: SerialNoRendereActionJob,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 120, enabletooltips: false,
				filtertype: "custom", cellsrenderer: SerialNoRendereActionJob,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 100,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
				}
			},
			{
				text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 150, width: 'auto', enabletooltips: false,
				filtertype: "custom", cellsrenderer: deviceStatusRenderer,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
				}
			},
			{
				text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 180, cellsrenderer: HierarchyPathRenderer,
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
				text: i18n.t('job_name', { lng: lang }), datafield: 'JobName', editable: false, enabletooltips: false, minwidth: 160,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('job_status', { lng: lang }), datafield: 'JobStatus', editable: false, minwidth: 160, cellsrenderer: toolTipRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Diagnostic Job Status');
				}
			},
			{
				text: i18n.t('createdOn', { lng: lang }), datafield: 'JobCreatedOn', filter: initialColumnFilter, editable: false, minwidth: 180, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('Tags_downl_lib', { lng: lang }), datafield: 'Tags', editable: false, minwidth: 90,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('action(s)', { lng: lang }), datafield: 'Actions', sortable: false, menu: false, filterable: false, editable: false, minwidth: 150,
			},
			{
				text: i18n.t('action(s)_schedule', { lng: lang }), datafield: 'ScheduleDate', enabletooltips: false, cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 180, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			},
			{ text: i18n.t('begin_action_at', { lng: lang }), datafield: 'BeginActionAt', sortable: false, menu: false, filterable: false, editable: false, minwidth: 130, },
			{
				text: i18n.t('recurrence', { lng: lang }), datafield: 'Recurrence', editable: false, minwidth: 100,
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
			{ text: i18n.t('results', { lng: lang }), datafield: 'results', enabletooltips: false, editable: false, minwidth: 90, resizable: false, menu: false, sortable: false, filterable: false, cellsrenderer: resultsRender },
		];
		//end Grid Advance search

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
				rowsheight: 32,
				enabletooltips: true,
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
					callOnGridReady(gID, gridStorage, CallType, 'JobCreatedOn');
					//CallType = addDefaultfilter(CallType, 'JobCreatedOn', gID)

					var columns = genericHideShowColumn(gID, true, []);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsList = koUtil.gridColumnList;
					visibleColumnsList.push('LastHeartBeat');
				},
			});

		getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'JobDevicesId');
	}

	function getDiagnosticDetails(isExport, columnSortFilter, selectedActionJobItems, unselectedActionJobItems, checkAll, deviceSearchObj, visibleColumns) {

		var getDiagnosticsJobSummaryReq = new Object();
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

		getDiagnosticsJobSummaryReq.DeviceId = null;
		getDiagnosticsJobSummaryReq.ColumnSortFilter = columnSortFilterActionJob;
		getDiagnosticsJobSummaryReq.DeviceSearch = deviceSearchObj;
		getDiagnosticsJobSummaryReq.UniqueDeviceId = 0;
		getDiagnosticsJobSummaryReq.CallType = CallType;
		getDiagnosticsJobSummaryReq.Export = Export;
		getDiagnosticsJobSummaryReq.Pagination = Pagination;
		getDiagnosticsJobSummaryReq.Selector = Selector;
		var param = new Object();
		param.token = TOKEN();
		param.getDiagnosticsJobSummaryReq = getDiagnosticsJobSummaryReq;

		return param;

	}

});

// click on view result open popup for action job status
function openIconPopupActionstatus(row) {
	$('#modelActionResults').modal('show');
	$('#actionResultsDiv').empty();
	$('#actionResultsDiv').html('<div id="jqxGridActionResults"></div><div id="pagerDivActionResults"></div>')
	GetActionResults(row);
}

function GetActionResults(row) {

	var self = this;

	self.serialNumber = $("#jqxgridActionJob").jqxGrid('getcellvalue', row, 'SerialNumber');
	self.modelName = $("#jqxgridActionJob").jqxGrid('getcellvalue', row, 'ModelName');
	jobDevicesId = $("#jqxgridActionJob").jqxGrid('getcellvalue', row, 'JobDevicesId');
	self.isCancelRequestFailed = $("#jqxgridActionJob").jqxGrid('getcellvalue', row, 'IsCancelRequestFailed');
	jobName = $("#jqxgridActionJob").jqxGrid('getcellvalue', row, 'JobName');
	self.uniqueDeviceId = $("#jqxgridActionJob").jqxGrid('getcellvalue', row, 'UniqueDeviceId');

	$("#modelName").empty();
	$("#serialNumber").empty();
	$("#modelName").append(self.modelName);
	$("#serialNumber").append(self.serialNumber);
	visibleDetailsColumnsList = new Array();
	//grid display
	var param = getModelActionJobStatusParameters(false, columnSortFilterModelActionJob, jobDevicesId, jobName, visibleDetailsColumnsList);
	getModalActionJobResults('jqxGridActionResults', param);

}

function modelActionJobExport(param) {
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

function getModalActionJobResults(gID, param) {
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
			{ name: 'AdditiionalStatusIfo', map: 'AdditiionalStatusIfo' },
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
				disableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
				var columnSortFilter = new Object();
				columnSortFilter = columnSortFilterFormatedData(columnSortFilterModelActionJob, gID, gridStorage, 'modelActionJobStatus');
				param.getDiagnosticsResultsReq.ColumnSortFilter = columnSortFilter;
				param.getDiagnosticsResultsReq.Pagination = getPaginationObject(param.getDiagnosticsResultsReq.Pagination, gID);
				param.getDiagnosticsResultsReq.JobDevicesId = jobDevicesId;
				param.getDiagnosticsResultsReq.JobName = jobName;
				data = JSON.stringify(param);
				return data;
			},
			downloadComplete: function (data, status, xhr) {

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
				enableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
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
				$('.all-disabled').hide();
			},
			loadError: function (jqXHR, status, error) {
				$('.all-disabled').hide();
			}
		}
	);
	//for allcheck
	var rendered = function (element) {
		enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, false, 'pagerDivActionResults', true, 0, 'JobDevicesId', null, null, null);
		$('.jqx-grid-pager').css("display", "none");
		return true;
	}

	//click on result column link
	var modelResultRender = function (row, columnfield, value, defaulthtml, columnproperties) {
		var rowData = $("#" + gID).jqxGrid('getrowdata', row);
		var message = rowData.IsMessage;
		if (message == false) {
			if (value != "")
				return '<div style="padding-left:5px;padding-top:7px; cursor:pointer"> <a id="imageId" tabindex="0" style="text-decoration:underline;" onClick="downloadResultData(' + row + ')" height="60" width="50">View Results</a></div>'
			else
				return "";
		}
		else {
			return '<div style="padding-left:5px;padding-top:7px; cursor:pointer"> <a id="imageId" tabindex="0" style="text-decoration:underline;" onClick="downloadResultDataForMessage(' + row + ')" height="60" width="50">View Message</a></div>'
		}

	}
	var viewActionjobStatusTooltipRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
		defaultHtml = displayTooltipIconRendererForViewResults(gID, row, columnfield, value, defaulthtml);
		return defaultHtml;
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
				var columns = genericHideShowColumn(gID, true, ['FileUrl']);
				for (var i = 0; i < columns.length; i++) {
					visibleDetailsColumnsList.push(columns[i].columnfield);
				}
				visibleColumnsListForPopup = visibleDetailsColumnsList;
			},
			columns: [
				{
					text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox', resizable: false, draggable: false,
					datafield: 'isSelected', width: 40, rendered: rendered, hidden: true
				},
				{ text: '', dataField: 'JobDevicesId', hidden: true, editable: false, minwidth: 0, },
				{
					text: i18n.t('action', { lng: lang }), dataField: 'ActionType', editable: false, minwidth: 90,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}

				},
				{
					text: i18n.t('executed_at', { lng: lang }), dataField: 'OperationExecutionTimeOnDevice', editable: false, minwidth: 100, cellsformat: LONG_DATETIME_GRID_FORMAT,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanelDate(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('rs_statsus', { lng: lang }), dataField: 'Status', editable: false, minwidth: 90, cellsrenderer: viewActionjobStatusTooltipRenderer,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanelMultiChoice(filterPanel, datafield, 'Diagnostic Action Status');
					}
				},
				{
					text: i18n.t('received_date', { lng: lang }), dataField: 'RecievedOn', editable: false, minwidth: 130, cellsformat: LONG_DATETIME_GRID_FORMAT,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanelDate(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('results', { lng: lang }), dataField: 'FileUrl', filterable: false, menu: false, sortable: false, enabletooltips: false, editable: false, minwidth: 90, cellsrenderer: modelResultRender,
				}
			],
		});


	getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
	callGridFilter(gID, gridStorage);
	callGridSort(gID, gridStorage, 'JobDevicesId');
}

function getModelActionJobStatusParameters(isExport, columnSortFilterModelActionJob, jobDevicesId, jobName, visibleColumns) {

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

	getDiagnosticsResultsReq.CallType = ENUM.get("CALLTYPE_WEEK");
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
	var Value = $("#jqxGridActionResults").jqxGrid('getcellvalue', row, 'FileUrl');
	//redirect to another page based on File url
	window.open(Value);
}
function downloadResultDataForMessage(row) {
	var rowData = $("#jqxGridActionResults").jqxGrid('getrowdata', row);
	var title = rowData.Title;
	var message = rowData.MessageInfo;
	$("#title").html('<b>' + "Title : " + '</b>' + ' ' + title);
	$("#message").html('<b>' + "Message : " + '</b>' + ' ' + message);
	$("#modelMessagePopupID").modal('show');
}
