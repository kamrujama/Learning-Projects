define(["knockout", "koUtil", "autho", "advancedSearchUtil", "utility"], function (ko, koUtil, autho, ADSearchUtil) {

	var lang = getSysLang();
	columnSortFilterDownloadJob = new Object();
	columnSortFilterModelJob = new Object();
	koUtil.GlobalColumnFilter = new Array();
	jobDevicesId = 0;
	isCancelRequestFailed = '';

	return function DownloadjobViewModel() {


		var self = this;

		//Draggable function
		$('#mdlAdvanceSearchHeader').mouseup(function () {
			$("#mdlAdvanceSearchContent").draggable({ disabled: true });
		});

		$('#mdlAdvanceSearchHeader').mousedown(function () {
			$("#mdlAdvanceSearchContent").draggable({ disabled: false });
		});

		$('#openModalPopupHeader').mouseup(function () {
			$("#openModalPopupContent").draggable({ disabled: true });
		});

		$('#openModalPopupHeader').mousedown(function () {
			$("#openModalPopupContent").draggable({ disabled: false });
		});
		////////////////

		$('#btnCancelDownload').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btnCancelDownload').click();
			}
		});


		//Check rights
		self.checkRights = function (screenName, rightsFor) {
			var retval = autho.checkRightsBYScreen(screenName, rightsFor);
			return retval;
		}

		self.serialNumber = ko.observable();
		self.modelName = ko.observable();

		self.templateFlag = ko.observable(false);
		self.AdvanceTemplateFlag = ko.observable(false);

		self.observableCriteria = ko.observable();
		loadCriteria('modalCriteria', 'genericPopup');
		ADSearchUtil.deviceSearchObj = new Object();// Advance Search

		ADSearchUtil.newAddedDataFieldsArr = [];
		ADSearchUtil.newAddedgridColumns = [];
		ADSearchUtil.AdScreenName = 'downloadJob';
		ADSearchUtil.ExportDynamicColumns = [];
		ADSearchUtil.SearchForChart = false;
		ADSearchUtil.SearchForGrid = true;
		self.observableAdvancedSearchModelPopup = ko.observable();
		loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

		setMenuSelection();

		ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "ModelName", "ComputedDeviceStatus", "HierarchyFullPath", "JobName", "JobStatus", "JobDownloadFailedReason", "Package", "JobPackageType", "Component", "Tags", "ScheduleDate", "ScheduledInstallDate", "ScheduleInformation", "JobCreatedBy", "JobCreatedOn", "DownloadTypes", "ReferenceSetName", "ReferenceSetHierarchyPath", "IsProcessed", "PackageName", "Status", "Description", "StartTime", "DownloadDuration", "InstalledDate", "File", "FileSize"];

		self.observableModelComponent = ko.observable();
		self.observableModelpopup = ko.observable();

		self.gridIdForShowHide = ko.observable();
		self.columnlist = ko.observableArray();
		var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'ComputedDeviceStatus', 'HierarchyFullPath', 'PackageName', 'FileSize', 'IsProcessed'];

		var modelName = "unloadTemplate";
		loadelement(modelName, 'genericPopup', 1);
		loadelement(modelName, 'genericPopup', 2);
		modelReposition();
		//open popup
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
						var source = _.where(ADSearchUtil.localDynamicColumns, { datafield: arr[i].columnfield });//<!---advance search changes--->
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
				$('#modelpopup').modal('show');
			} else if (popupName == "modelDownloadJob") {
				loadelement(popupName, 'downloadLibrary', 1);
				$('#jobStautsView').modal('show');
			} else if (popupName == "modelCancelDownloadJob") {
				loadelement(popupName, 'downloadLibrary', 1);
				$('#jobStautsView').modal('show');
			} else if (popupName == 'modelAdvancedSearch') {
				self.AdvanceTemplateFlag(true);
				loadAdvancedSearchModelPopup(popupName, 'genericPopup', 2);
				$('#AdvanceSearchModal').modal('show');
			}

		}

		//unload advance serach popup
		self.unloadAdvancedSearch = function () {
			repositionAdvanceSearchPopUp("mdlAdvanceSearchContent");
			ClearAdSearch = 0;
			self.observableAdvancedSearchModelPopup('unloadTemplate');
			$("#AdvanceSearchModal").modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
			isAdpopup = '';
		}
		self.clearAdvancedSearch = function () {
			reppositionPopUp("mdlAdvanceSearchContent");
			self.observableAdvancedSearchModelPopup('unloadTemplate');
			loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
		}

		//unload template
		self.unloadTempPopup = function (popupName) {
			self.observableModelComponent(popupName);
			self.observableModelpopup(popupName);
			$('#jobStautsView').modal('hide');

		};

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

		function loadelement(elementname, controllerId, flage) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);

			}
			if (flage == 2) {
				self.observableModelpopup(elementname);
			} else {
				self.observableModelComponent(elementname);
			}
		}

		function loadAdvancedSearchModelPopup(elementname, controllerId) {// Advance search
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

		function loadCriteria(elementname, controllerId) {// Advance Search
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

		// reset filter
		self.clearfilter = function (gridID) {

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

		//open popup model
		self.closeOpenModel = function (gridID, modelPopup) {
			$('#' + gridID).jqxGrid('render');
			repositionAdvanceSearchPopUp("openModalPopupContent");
			$('#' + modelPopup).modal('hide');
			isPopUpOpen = false;
			autoRefreshDownloadProgressStop();
		}

		//export to excel
		self.exportToExcel = function (isExport, gridID) {

			var selectedDownloadJobItems = getSelectedUniqueId(gridID);
			var unselectedDownloadJobItems = getUnSelectedUniqueId(gridID);
			var checkAll = checkAllSelected(gridID);
			var datainfo = $("#" + gridID).jqxGrid('getdatainformation');
			if (gridID == "jqxgridDownloadJob") {
				visibleColumnsList = GetExportVisibleColumn(gridID);
				var param = getDownloadJobStatusParameters(true, columnSortFilterDownloadJob, selectedDownloadJobItems, ADSearchUtil.deviceSearchObj, unselectedDownloadJobItems, checkAll, visibleColumnsList);

				if (datainfo.rowscount > 0) {
					downloadJobExport(param, gridID, self.openPopup);
				} else {
					openAlertpopup(1, 'no_data_to_export');
				}
			} else {
				var param = getModelDownloadResultDetials(true, columnSortFilterModelJob, jobDevicesId, visibleDetailsColumnsList);
				if (datainfo.rowscount > 0) {
					modelDownloadJobExport(param);
				}
				else {
					openAlertpopup(1, 'no_data_to_export');
				}
			}
		}

		// cancel job status
		self.cancelJobStatus = function (popupName, gridID) {
			var selectedJobID = getMultiSelectedData(gridID);
			var checkAll = checkAllSelected(gridID);
			if (checkAll == 1) {
				self.openPopup(popupName, gridID);
			} else {
				if (selectedJobID.length == 1 || selectedJobID.length > 1) {
					self.openPopup(popupName, gridID);
				} else if (selectedJobID.length == 0) {
					openAlertpopup(1, 'please_select_atleast_one_job_for_cancellation');
					return;
				}
			}
		}

		self.resizeColumns = function (gId) {
			$("#modalResizeResetColumnsConfirmation").modal('show');
			$("#resizeResetColumnsConfirmationMessage").text(i18n.t('save_resized_columns_confirmation', { lng: lang }));

			globalGridColumns = new Object();
			globalGridColumns.gId = gId;
			globalGridColumns.gridName = 'DownloadJobs';
			globalGridColumns.isColumnResized = true;
			globalGridColumns.gridColumns = ADSearchUtil.initColumnsArr;
		}

		self.resetColumns = function (gId) {
			$("#modalResizeResetColumnsConfirmation").modal('show');
			$("#resizeResetColumnsConfirmationMessage").text(i18n.t('reset_resized_columns_confirmation', { lng: lang }));

			globalGridColumns = new Object();
			globalGridColumns.gId = gId;
			globalGridColumns.gridName = 'DownloadJobs';
			globalGridColumns.isColumnResized = false;
			globalGridColumns.gridColumns = [];
		}

		var param = getDownloadJobStatusParameters(false, columnSortFilterDownloadJob, null, ADSearchUtil.deviceSearchObj, null, 0, []);
		getDownloadJobGridDetails('jqxgridDownloadJob', param, self.observableAdvancedSearchModelPopup, self.columnlist);
		ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridDownloadJob';
		seti18nResourceData(document, resourceStorage);
	}

	function downloadJobExport(param, gridID, openPopup) {

		var callbackFunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					openAlertpopup(1, 'export_Sucess');
				}
			}
		}

		var method = 'GetDownloadJobSummary';
		var params = JSON.stringify(param);
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
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

	function getDownloadJobGridDetails(gID, param, modelPopup, columnlist) {
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
		var initfieldsArray = [{ name: 'JobDevicesId', map: 'JOBDEVICESID' },
		{ name: 'UniqueDeviceId', map: 'UNIQUEDEVICEID' },
		{ name: 'SerialNumber', map: 'SERIALNUMBER' },
		{ name: 'DeviceId', map: 'TASKDEVICEID' },
		{ name: 'HierarchyFullPath', map: 'HIERARCHYFULLPATH', type: 'string' },
		{ name: 'ModelName', map: 'MODELNAME' },
		{ name: 'ComputedDeviceStatus', map: 'COMPUTEDDEVICESTATUS' },
		{ name: 'JobName', map: 'JOBNAME' },
		{ name: 'JobStatus', map: 'COMPJOBSTATUS' },
		{ name: 'Package', map: 'ACTIONSVERBOSE' },
		{ name: 'JobPackageType', map: 'JOBPACKAGETYPE' },
		{ name: 'Tags', map: 'TAGS' },
		{ name: 'ScheduleDate', map: 'SCHEDULEDDATE' },
		{ name: 'ScheduledInstallDate', map: 'SCHEDULEDINSTALLDATE' },
		{ name: 'ScheduleInformation', map: 'SCHEDULEINFORMATION' },
		{ name: 'JobCreatedBy', map: 'JOBCREATEDBYUSERNAME' },
		{ name: 'JobCreatedOn', map: 'JOBCREATEDON', type: 'date' },
		{ name: 'LastHeartBeat', map: 'LASTHEARTBEAT', type: 'date' },
		{ name: 'DownloadTypes', map: 'DOWNLOADTYPES' },
		{ name: 'ReferenceSetName', map: 'REFERENCESETNAME' },
		{ name: 'ReferenceSetHierarchyPath', map: 'REFERENCESETHIERARCHYPATH' },
		{ name: 'IsProcessed', map: 'ISPROCESSED' },
		{ name: 'isSelected', type: 'number' },
		{ name: 'JobDownloadFailedReason', map: 'JOBDEVICESADDITIONALSTATUSINFO' },
		{ name: 'IsJobCancelAllowed', map: 'ISJOBCANCELALLOWED' },
		{ name: 'IsCancelRequestFailed', map: 'ISCANCELREQUESTFAILED' },
		{ name: 'Component', map: 'COMPONENT' }
		];

		var sourceDataFieldsArr = JSON.parse(JSON.stringify(initfieldsArray));
		var InitGridStoragObj = initGridStorageObj(gID, ENUM.get("CALLTYPE_DAY"));
		var gridStorage = InitGridStoragObj.gridStorage;
		var adStorage = InitGridStoragObj.adStorage;
		CallType = InitGridStoragObj.CallType;

		var source = {
			dataType: 'json',
			dataFields: initfieldsArray,
			root: 'DownloadJobs',
			type: 'POST',
			data: param,
			url: AppConstants.get('API_URL') + "/GetDownloadJobSummary",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data.getDownloadJobSummaryResp)
					data.getDownloadJobSummaryResp = $.parseJSON(data.getDownloadJobSummaryResp);
				else
					data.getDownloadJobSummaryResp = [];

				if (data.getDownloadJobSummaryResp && data.getDownloadJobSummaryResp.PaginationResponse) {
					source.totalrecords = data.getDownloadJobSummaryResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getDownloadJobSummaryResp.PaginationResponse.TotalPages;
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
				}
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
					var columnSortFilter = new Object();
					columnSortFilter = columnSortFilterFormatedData(columnSortFilterDownloadJob, gID, gridStorage, 'downloadJob', 'JobCreatedOn');

					koUtil.GlobalColumnFilter = columnSortFilter;
					param.getDownloadJobSummaryReq.ColumnSortFilter = columnSortFilter;

					param.getDownloadJobSummaryReq.CallType = CallType;



					param.getDownloadJobSummaryReq.Pagination = getPaginationObject(param.getDownloadJobSummaryReq.Pagination, gID);

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

					updatepaginationOnState(gID, gridStorage, param.getDownloadJobSummaryReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage, param.getDownloadJobSummaryReq.CallType);

					var customData = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));

					if (customData) {
						ADSearchUtil.deviceSearchObj = JSON.parse(sessionStorage.getItem(gID + 'customSearch'));
						ADSearchUtil.SearchText = sessionStorage.getItem(gID + 'CustomSearchText');
						$("#deviceCriteriaDiv").empty();
						$("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
					}
					param.getDownloadJobSummaryReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
					data = JSON.stringify(param);
					return data;
				},
				downloadComplete: function (data, status, xhr) {
					if (data) {
						koUtil.ProtocolForGrid = new Array();
						//if (data.getDownloadJobSummaryResp)
						//    data.getDownloadJobSummaryResp = $.parseJSON(data.getDownloadJobSummaryResp);

						if (data.getDownloadJobSummaryResp && data.getDownloadJobSummaryResp.DownloadJobs) {
							for (var i = 0; i < data.getDownloadJobSummaryResp.DownloadJobs.length; i++) {
								data.getDownloadJobSummaryResp.DownloadJobs[i].SCHEDULEDDATE = convertToDeviceZonetimestamp(data.getDownloadJobSummaryResp.DownloadJobs[i].SCHEDULEDDATE);
								koUtil.ProtocolForGrid[i] = data.getDownloadJobSummaryResp.DownloadJobs[i].PROTOCOL;
								data.getDownloadJobSummaryResp.DownloadJobs[i].SCHEDULEDINSTALLDATE = convertToDeviceZonetimestamp(data.getDownloadJobSummaryResp.DownloadJobs[i].SCHEDULEDINSTALLDATE);
								data.getDownloadJobSummaryResp.DownloadJobs[i].LASTHEARTBEAT = convertToDeviceZonetimestamp(data.getDownloadJobSummaryResp.DownloadJobs[i].LASTHEARTBEAT);
								data.getDownloadJobSummaryResp.DownloadJobs[i].JOBCREATEDON = convertToLocaltimestamp(data.getDownloadJobSummaryResp.DownloadJobs[i].JOBCREATEDON);
							}
						}


						enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
						if (data.getDownloadJobSummaryResp) {


							ADSearchUtil.localDynamicColumns = [];//<!---advance search changes--->
							if (data.getDownloadJobSummaryResp) {
								if (data.getDownloadJobSummaryResp.DynamicColumns) {
									DynamicColumns = data.getDownloadJobSummaryResp.DynamicColumns;
									for (var i = 0; i < data.getDownloadJobSummaryResp.DynamicColumns.length; i++) {
										var FieldSource = _.where(sourceDataFieldsArr, { name: data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeName });
										if (FieldSource == '') {
											var dynamicObj = new Object();
											dynamicObj.name = data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeName;
											dynamicObj.map = data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeName.toUpperCase();
											if (data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType == 'Date') {
												dynamicObj.type = 'date';
											}
											ADSearchUtil.newAddedDataFieldsArr.push(dynamicObj);
											var exportDynamicColumns = new Object();
											exportDynamicColumns.AttributeName = data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeName;
											exportDynamicColumns.AttributeType = data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeType;
											exportDynamicColumns.ControlType = data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType;
											exportDynamicColumns.DisplayName = data.getDownloadJobSummaryResp.DynamicColumns[i].DisplayName;
											exportDynamicColumns.FilterSource = data.getDownloadJobSummaryResp.DynamicColumns[i].FilterSource;
											exportDynamicColumns.IsCustomAttribute = data.getDownloadJobSummaryResp.DynamicColumns[i].IsCustomAttribute;
											exportDynamicColumns.IsInDeviceTimeZone = data.getDownloadJobSummaryResp.DynamicColumns[i].IsInDeviceTimeZone;
											ADSearchUtil.ExportDynamicColumns.push(exportDynamicColumns);
										}

										var ColumnSource = _.where(gridColumns, { datafield: data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeName });

										var coulmnObj = new Object();
										coulmnObj.text = i18n.t(data.getDownloadJobSummaryResp.DynamicColumns[i].DisplayName, { lng: lang });
										coulmnObj.datafield = data.getDownloadJobSummaryResp.DynamicColumns[i].AttributeName;
										coulmnObj.editable = false;
										coulmnObj.minwidth = 200;
										coulmnObj.width = 'auto';
										coulmnObj.enabletooltips = true;
										if (data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType == 'Date') {
											coulmnObj.cellsformat = LONG_DATETIME_GRID_FORMAT;
										}
										coulmnObj.filtertype = "custom";
										if (data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType == 'TextBox') {
											coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
										} else if (data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType == 'MultiCombo' || data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType == 'Combo') {
											coulmnObj.createfilterpanel = function (datafield, filterPanel) {
												var FilterSource = AppConstants.get(datafield);
												buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource);
											};
										} else if (data.getDownloadJobSummaryResp.DynamicColumns[i].ControlType == 'Date') {
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
							}
							source.dataFields = sourceDataFieldsArr;
						}
						if (data.getDownloadJobSummaryResp && data.getDownloadJobSummaryResp.DownloadJobs) {
							if (data.getDownloadJobSummaryResp.TotalSelectionCount != 'undefined') {
								gridStorage[0].TotalSelectionCount = data.getDownloadJobSummaryResp.TotalSelectionCount;
								var updatedGridStorage = JSON.stringify(gridStorage);
								window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
							}
						} else {
							data.getDownloadJobSummaryResp = new Object();
							data.getDownloadJobSummaryResp.DownloadJobs = [];
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

		// display image when IsNoteExist true
		var resultsRender = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (value == true) {
				return '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"> <a title="Click to view Download Details" tabindex="0" id="imageId" style="text-decoration:underline;" onClick="openIconPopupdownloadjob(' + row + ')" height="60" width="50" >View Results</a></div>'
			} else if (value == false) {
				return " ";
			}
		}

		//for allcheck
		var rendered = function (element) {
			enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, true, 'pagerDivDownloadJob', true, 1, 'IsJobCancelAllowed', null, null, null);
			return true;
		}

		//for device profile
		function SerialNoRendereDownloadJobStatus(row, columnfield, value, defaulthtml, columnproperties) {
			var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
			return html;
		}

		var deviceStatusRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml);
			return defaultHtml;
		}

		var cellclass = function (row, columnfield, value) {
			var classname = genericCellDisablesrendererNew(row, columnfield, value, gID, 'IsJobCancelAllowed');
			return classname;
		}


		//row is enabled when IsJobCancelAllowed true
		var cellbeginedit = function (row, datafield, columntype, value) {
			var check = $("#" + gID).jqxGrid('getcellvalue', row, 'IsJobCancelAllowed');
			if (check == true) {
				return true;
			} else {
				return false;
			}

		}
		//download type renderer
		var downloadtyperenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var html = '<div><span></span></div>';
			if (value == 0) {
				html = '<div style="padding-left:5px;padding-top:5px"><span>All</span></div>';
			}
			else if (value == 1) {
				html = '<div style="padding-left:5px;padding-top:5px"><span>Manual</span></div>';
			}
			else if (value == 2) {
				html = '<div style="padding-left:5px;padding-top:5px"><span>Automatic</span></div>';
			}
			else if (value == 3) {
				html = '<div style="padding-left:5px;padding-top:5px"><span>Device-Initiated</span></div>';
			}
			return html;
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

		var statusColor = "";
		var toolTipRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = displayTooltipAndIconRenderer(gID, row, column, value, defaultHtml, 1);
			if (defaultHtml.includes("red")) {
				statusColor = "red";
			} else if (defaultHtml.includes("brown")) {
				statusColor = "brown";
			} else if (defaultHtml.includes("green")) {
				statusColor = "green";
			} else if (defaultHtml.includes("black")) {
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

		var Scheduled_Installed_Date = function (row, columnfield, value, defaulthtml, columnproperties) {
			var protocolName = koUtil.ProtocolForGrid[row];

			if (protocolName == 'Zontalk') {
				return '<div style="padding-left:5px;padding-top:7px;"><span style="padding-left:5px;padding-top:7px;">Not Applicable</span></div>';
			}
			else if (protocolName != "") {
				if (value != "") {
					return '<div style="padding-left:5px;padding-top:7px;text-overflow: ellipsis;overflow:hidden;"><span style="padding-left:5px;padding-top:7px;">' + value + '</span></div>';
				}
				else {
					return '';
				}
			}


			return '';
		}


		var ReferenceSetNamerenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var protocolName = koUtil.ProtocolForGrid[row];

			if (protocolName == 'Zontalk') {
				return '<div style="padding-left:5px;padding-top:7px;"><span style="padding-left:5px;padding-top:7px;">Not Applicable</span></div>';
			}
			else if (protocolName != "") {
				if (value != "") {
					return '<div style="padding-left:5px;padding-top:7px;text-overflow: ellipsis;overflow:hidden;"><span style="padding-left:5px;padding-top:7px;">' + value + '</span></div>';
				}
				else {
					return '';
				}
			}


			return '';
		}

		var ReferenceSetHierarchyPathrenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var protocolName = koUtil.ProtocolForGrid[row];

			if (protocolName == 'Zontalk') {
				return '<div style="padding-left:5px;padding-top:7px;"><span style="padding-left:5px;padding-top:7px;">Not Applicable</span></div>';
			}
			else if (protocolName != "") {
				if (value != "") {
					return '<div style="padding-left:5px;padding-top:7px;text-overflow: ellipsis;overflow:hidden;"><span style="padding-left:5px;padding-top:7px;">' + value + '</span></div>';
				}
				else {
					return '';
				}
			}

			return '';
		}

		var initialColumnFilter = function () {
			return initialColumnFilterBuilder(gridStorage);
		}();


		gridColumns = [
			{
				text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclass, resizable: false, draggable: false,
				datafield: 'isSelected', width: 40, renderer: function () {
					return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
				}, rendered: rendered
			},
			{
				text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 120, enabletooltips: false, cellsrenderer: SerialNoRendereDownloadJobStatus,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 120, enabletooltips: false, cellsrenderer: SerialNoRendereDownloadJobStatus,
				filtertype: "custom",
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
				text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 150, enabletooltips: false,
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
				text: i18n.t('component', { lng: lang }), dataField: 'Component', editable: false, minwidth: 130, enabletooltips: false,
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
				text: i18n.t('job_status', { lng: lang }), datafield: 'JobStatus', editable: false, minwidth: 160, enabletooltips: false, cellsrenderer: toolTipRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Download\/Content Job Status');
				}
			},
			{
				text: i18n.t('job_reason', { lng: lang }), datafield: 'JobDownloadFailedReason', editable: false, minwidth: 180, menu: false, sortable: false, filterable: false,
				cellsrenderer: jobReasonToolTipRenderer
			},
			{
				text: i18n.t('createdOn', { lng: lang }), datafield: 'JobCreatedOn', filter: initialColumnFilter, editable: false, minwidth: 180, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);
				}
			},
			{ text: i18n.t('packages_applications', { lng: lang }), dataField: 'Package', editable: false, minwidth: 150, menu: false, sortable: false, filterable: false },
			{
				text: i18n.t('package_category', { lng: lang }), dataField: 'JobPackageType', editable: false, minwidth: 140, filterable: true,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Package Category');
				}
			},
			{
				text: i18n.t('Tags_downl_lib', { lng: lang }), datafield: 'Tags', editable: false, minwidth: 150,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('download_scheduled_col', { lng: lang }), datafield: 'ScheduleDate', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 180,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			},
			{
				text: i18n.t('install_schedule', { lng: lang }), dataField: 'ScheduledInstallDate', enabletooltips: false, editable: false, minwidth: 180, cellsformat: LONG_DATETIME_GRID_FORMAT,
				filtertype: "custom", cellsrenderer: Scheduled_Installed_Date,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelDate(filterPanel, datafield);

				}
			},
			{ text: i18n.t('schedule_information', { lng: lang }), datafield: 'ScheduleInformation', editable: false, minwidth: 140, menu: false, sortable: false, filterable: false },
			{
				text: i18n.t('created_by', { lng: lang }), datafield: 'JobCreatedBy', editable: false, minwidth: 100,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('download_types', { lng: lang }), datafield: 'DownloadTypes', editable: false, minwidth: 140, cellsrenderer: downloadtyperenderer, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Download Types');
				}
			},
			{
				text: i18n.t('rs_refrence_set', { lng: lang }), datafield: 'ReferenceSetName', editable: false, minwidth: 150,
				filtertype: "custom", cellsrenderer: ReferenceSetNamerenderer,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('reference_set_hierarchy_path', { lng: lang }), datafield: 'ReferenceSetHierarchyPath', editable: false, minwidth: 160,
				filtertype: "custom", cellsrenderer: ReferenceSetHierarchyPathrenderer,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},

			{ text: i18n.t('results', { lng: lang }), datafield: 'IsProcessed', editable: false, minwidth: 80, menu: false, sortable: false, enabletooltips: false, resizable: false, filterable: false, cellsrenderer: resultsRender },
		];
		gridColumns = setUserPreferencesColumns('DownloadJobs', userResizedColumns, gridColumns);

		$("#" + gID).jqxGrid(
			{
				height: gridHeightFunction(gID, "60"),
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
				autoshowfiltericon: true,
				columns: gridColumns,
				rendergridrows: function () {
					return dataAdapter.records;
				},

				ready: function () {
					if (ADSearchUtil.resetAddSerchFlag == '') {
						var gID = ADSearchUtil.gridIdForAdvanceSearch;
						for (var k = 0; k < initfieldsArray.length; k++) {
							var FieldSource = _.where(sourceDataFieldsArr, { name: initfieldsArray[k].name });
							if (FieldSource == '') {
								sourceDataFieldsArr.push(initfieldsArray[k]);
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

					var columns = genericHideShowColumn(gID, true, ['IsProcessed']);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsList = koUtil.gridColumnList;
					visibleColumnsList.push("LastHeartBeat");
				},
			});

		getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'JobDevicesId');
	}

	function getDownloadJobStatusParameters(isExport, columnSortFilterDownloadJob, selectedDownloadJobItems, deviceSearchObj, unselectedDownloadJobItems, checkAll, visibleColumns) {

		var getDownloadJobSummaryReq = new Object();
		var Export = new Object();
		var Pagination = new Object();
		var Selector = new Object();
		var DeviceSearch = new Object();

		Pagination.HighLightedItemId = null
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
		Export.VisibleColumns = visibleColumns;
		if (checkAll == 1) {
			Selector.SelectedItemIds = null;
			Selector.UnSelectedItemIds = unselectedDownloadJobItems;
			if (isExport == true) {
				Export.IsAllSelected = true;
				Export.IsExport = true;
				Export.DynamicColumns = ADSearchUtil.ExportDynamicColumns;
			} else {
				Export.IsAllSelected = false;
				Export.IsExport = false;
			}
		} else {
			Selector.SelectedItemIds = selectedDownloadJobItems;
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

		var ColumnSortFilter = columnSortFilterDownloadJob;
		var FilterList = new Array();
		var coulmnfilter = new Object();
		coulmnfilter.FilterColumn = null;
		coulmnfilter.FilterValue = null;
		FilterList.push(coulmnfilter);

		getDownloadJobSummaryReq.DeviceId = null
		getDownloadJobSummaryReq.ColumnSortFilter = ColumnSortFilter;
		getDownloadJobSummaryReq.DeviceSearch = deviceSearchObj;
		getDownloadJobSummaryReq.PackageType = ENUM.get("Software");
		getDownloadJobSummaryReq.UniqueDeviceId = 0;
		getDownloadJobSummaryReq.CallType = CallType;
		getDownloadJobSummaryReq.Export = Export;
		getDownloadJobSummaryReq.Pagination = Pagination;
		getDownloadJobSummaryReq.Selector = Selector;
		var param = new Object();
		param.token = TOKEN();
		param.getDownloadJobSummaryReq = getDownloadJobSummaryReq;

		return param;
	}

});

// click on view result open popup for download job status
function openIconPopupdownloadjob(row) {
	$('#modelDownloadResults').modal('show');
	$('#downloadResultsDiv').empty();
	$('#downloadResultsDiv').html('<div id="jqxGridDownloadResults"></div><div id="pagerDivDownloadResults"></div>');
	GetDownloadResults(row);
}

function GetDownloadResults(row) {
	var self = this;
	self.serialNumber = $("#jqxgridDownloadJob").jqxGrid('getcellvalue', row, 'SerialNumber');
	self.modelName = $("#jqxgridDownloadJob").jqxGrid('getcellvalue', row, 'ModelName');
	jobDevicesId = $("#jqxgridDownloadJob").jqxGrid('getcellvalue', row, 'JobDevicesId');
	var InstalledDate = $("#jqxgridDownloadJob").jqxGrid('getcellvalue', row, 'ScheduledInstallDate');
	isCancelRequestFailed = $("#jqxgridDownloadJob").jqxGrid('getcellvalue', row, 'IsCancelRequestFailed');

	$("#modelName").empty();
	$("#serialNumber").empty();
	$("#modelName").append(self.modelName);
	$("#serialNumber").append(self.serialNumber);

	visibleDetailsColumnsList = new Array();
	visibleDetailsColumnsList = visibleColumnsListForPopup;
	//grid display
	var param = getModelDownloadResultDetials(false, columnSortFilterModelJob, jobDevicesId, visibleDetailsColumnsList);
	getModalJobResults('jqxGridDownloadResults', param, InstalledDate);
	if (InstalledDate == null || $.inArray("InstalledDate", visibleDetailsColumnsList) < 0) {
		$("#jqxGridDownloadResults").jqxGrid('hidecolumn', 'InstalledDate');
	} else {
		$("#jqxGridDownloadResults").jqxGrid('showcolumn', 'InstalledDate');
	}
}

function modelDownloadJobExport(param) {

	var callbackFunction = function (data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				openAlertpopup(1, 'export_Sucess');
			}
		}
	}

	var method = 'GetDownloadResults ';
	var params = JSON.stringify(param);
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

function getModalJobResults(gID, param, InstalledDate) {
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
			{ name: 'PackageName', map: 'PackageName' },
			{ name: 'Status', map: 'Status' },
			{ name: 'Description', map: 'Description' },
			{ name: 'StartTime', map: 'StartTime' },
			{ name: 'DownloadDuration', map: 'DownloadDuration' },
			{ name: 'InstalledDate', map: 'InstalledDate' },
			{ name: 'File', map: 'File' },
			{ name: 'FileSize', map: 'FileSize' },
			{ name: 'JobDevicesId', map: 'JobDevicesId' },
			{ name: 'isSelected', type: 'number' },
			{ name: 'AdditiionalStatusIfo', map: 'AdditiionalStatusIfo' },
			{ name: 'DownloadAttempts', map: 'DownloadAttempts' },
			{ name: 'DownloadProgress', map: 'DownloadProgress' },
			{ name: 'TaskId', map: 'TaskId' },
			{ name: 'PackageFileType', map: 'PackageFileType' }
		],
		root: 'DownloadJobResults',
		type: 'POST',
		data: param,
		url: AppConstants.get('API_URL') + "/GetDownloadResults",
		contentType: 'application/json',
		beforeprocessing: function (data) {
			if (data.getDownloadResultsResp) {
				data.getDownloadResultsResp = $.parseJSON(data.getDownloadResultsResp);
			}
			else
				data.getDownloadResultsResp = [];
			if (data.getDownloadResultsResp) {
				if (data.getDownloadResultsResp.PaginationResponse) {
					source.totalrecords = data.getDownloadResultsResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getDownloadResultsResp.PaginationResponse.TotalPages;
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;
				}
			}
		},
	}
	var dataAdapter = new $.jqx.dataAdapter(source,
		{
			formatData: function (data) {
				$('.all-disabled').show();
				disableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
				var columnSortFilter = new Object();
				columnSortFilter = columnSortFilterFormatedData(columnSortFilterModelJob, gID, gridStorage, 'modelDownloadJob');
				param.getDownloadResultsReq.ColumnSortFilter = columnSortFilter;
				param.getDownloadResultsReq.Pagination = getPaginationObject(param.getDownloadResultsReq.Pagination, gID);
				param.getDownloadResultsReq.JobDevicesId = jobDevicesId;
				data = JSON.stringify(param);
				return data;
			},
			downloadComplete: function (data, status, xhr) {
				if (data) {

					isPopUpOpen = true;
					if (data.getDownloadResultsResp && data.getDownloadResultsResp.DownloadJobResults) {
						if (data.getDownloadResultsResp.DownloadJobResults.length > 0) {
							var taskIds = new Array();
							for (var i = 0; i < data.getDownloadResultsResp.DownloadJobResults.length; i++) {
								data.getDownloadResultsResp.DownloadJobResults[i].StartTime = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].StartTime);
								data.getDownloadResultsResp.DownloadJobResults[i].InstalledDate = convertToDeviceZonetimestamp(data.getDownloadResultsResp.DownloadJobResults[i].InstalledDate);

								var downloadStatus = data.getDownloadResultsResp.DownloadJobResults[i].Status;
								var packageFileType = data.getDownloadResultsResp.DownloadJobResults[i].PackageFileType;
								if ((downloadStatus != AppConstants.get('InstallSuccessfulCount') && downloadStatus != AppConstants.get('DownloadFailedCount'))) {
									var taskId = new Object();
									taskId = data.getDownloadResultsResp.DownloadJobResults[i].TaskId;
									taskIds.push(taskId);
								}
							}
						}

						if (taskIds.length > 0) {
							autoRefreshDownloadProgress(taskIds);
						} else {
							autoRefreshDownloadProgressStop();
						}
					}
					enableIcons(['btnModelRestFilterId', 'btnModelShowHideId', 'btnModelExportToexcelId', 'btnModelRefreshId']);
					if (data.getDownloadResultsResp && data.getDownloadResultsResp.DownloadJobResults) {
						if (data.getDownloadResultsResp.TotalSelectionCount != 'undefined') {
							gridStorage[0].TotalSelectionCount = data.getDownloadResultsResp.TotalSelectionCount;
							var updatedGridStorage = JSON.stringify(gridStorage);
							window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
						}
						if (data.getDownloadResultsResp.PaginationResponse) {
							//if (data.getDownloadResultsResp.PaginationResponse.HighLightedItemPage > 0) {
							//    gridStorage[0].highlightedPage = data.getDownloadResultsResp.PaginationResponse.HighLightedItemPage;
							//    var updatedGridStorage = JSON.stringify(gridStorage);
							//    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
							//}
						} else {

						}
					} else {
						data.getDownloadResultsResp = new Object();
						data.getDownloadResultsResp.DownloadJobResults = [];
					}
					$('.all-disabled').hide();
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
		enablegridfunctions(gID, 'JobDevicesId', element, gridStorage, false, 'pagerDivDownloadResults', true, 0, 'JobDevicesId', null, null, null);
		$('.jqx-grid-pager').css("display", "none")
		return true;
	}

	var statusTooltipRenderer = function (row, column, value, defaultHtml) {
		defaultHtml = displayTooltipIconRendererForViewResults(gID, row, column, value, defaultHtml);
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

	//Custom filter
	var buildFilterPanel = function (filterPanel, datafield) {
		genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
	}

	var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
		genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
	}

	var buildFilterPanelDate = function (filterPanel, datafield) {
		genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

	}

	$("#" + gID).jqxGrid(
		{
			width: "100%",
			pageable: true,
			editable: true,
			source: dataAdapter,
			altRows: true,
			autoshowcolumnsmenubutton: false,
			virtualmode: true,
			pageSize: AppConstants.get('ROWSPERPAGE'),
			filterable: true,
			sortable: true,
			columnsResize: true,
			columnsreorder: true,
			selectionmode: 'singlerow',
			theme: AppConstants.get('JQX-GRID-THEME'),
			autoshowfiltericon: true,
			rowsheight: 32,
			enabletooltips: true,
			rendergridrows: function () {
				return dataAdapter.records;
			},
			ready: function () {
				var columns = genericHideShowColumn(gID, true, ['IsProcessed']);
				for (var i = 0; i < columns.length; i++) {
					visibleDetailsColumnsList.push(columns[i].columnfield);
				}
				if (InstalledDate == null) {
					$("#jqxGridDownloadResults").jqxGrid('hidecolumn', 'InstalledDate');
				} else {
					$("#jqxGridDownloadResults").jqxGrid('showcolumn', 'InstalledDate');
				}
			},

			columns: [
				{
					text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', resizable: false, draggable: false,
					datafield: 'isSelected', width: 40, renderer: function () {
						return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
					}, rendered: rendered, hidden: true
				},
				{
					text: i18n.t('packages_applications', { lng: lang }), dataField: 'PackageName', editable: false, minwidth: 120,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('rs_statsus', { lng: lang }), dataField: 'Status', enabletooltips: false, editable: false, minwidth: 200, cellsrenderer: statusTooltipRenderer,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanelMultiChoice(filterPanel, datafield, 'Software Job Task Status');
					}
				},
				{
					text: 'Progress', datafield: 'DownloadProgress', editable: false, sortable: false, filterable: false, menu: false, minwidth: 150, enabletooltips: false, cellsrenderer: downloadProgressRenderer,
				},
				{
					text: i18n.t('content_description', { lng: lang }), dataField: 'Description', editable: false, minwidth: 130, menu: false, sortable: false, filterable: false,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('download_started_at', { lng: lang }), dataField: 'StartTime', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 130, enabletooltips: false,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanelDate(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('download_duration', { lng: lang }), dataField: 'DownloadDuration', editable: false, minwidth: 100, enabletooltips: false, cellsrenderer: downloadDurationRenderer,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('installed_at', { lng: lang }), dataField: 'InstalledDate', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 130, enabletooltips: false,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanelDate(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('content_file_name', { lng: lang }), dataField: 'File', editable: false, minwidth: 90,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('fileSize_mb', { lng: lang }), dataField: 'FileSize', editable: false, minwidth: 100, enabletooltips: false,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
			],
		});

	getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
	callGridFilter(gID, gridStorage);
	callGridSort(gID, gridStorage, 'JobDevicesId');
}

function getModelDownloadResultDetials(isExport, columnSortFilterModelJob, jobDevicesId, visibleColumns) {

	var getDownloadResultsReq = new Object();
	var Export = new Object();
	var Pagination = new Object();

	Pagination.HighLightedItemId = null
	Pagination.PageNumber = 1;
	Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

	Export.DynamicColumns = null;
	if (isExport == true) {
		Export.IsAllSelected = false;
		Export.IsExport = true;

	} else {
		Export.IsAllSelected = false;
		Export.IsExport = false;
	}
	Export.VisibleColumns = visibleColumns;

	var ColumnSortFilter = columnSortFilterModelJob;
	var FilterList = new Array();
	var coulmnfilter = new Object();
	coulmnfilter.FilterColumn = null;
	coulmnfilter.FilterValue = null;
	FilterList.push(coulmnfilter);

	getDownloadResultsReq.CallType = ENUM.get("CALLTYPE_WEEK");
	getDownloadResultsReq.ColumnSortFilter = ColumnSortFilter;
	getDownloadResultsReq.Export = Export;
	getDownloadResultsReq.JobDevicesId = jobDevicesId;
	getDownloadResultsReq.PackageType = ENUM.get("Software");
	getDownloadResultsReq.Pagination = Pagination;

	var param = new Object();
	param.token = TOKEN();
	param.getDownloadResultsReq = getDownloadResultsReq;

	return param;
}

function autoRefreshDownloadProgress(taskIds) {
	window.clearInterval(autoRefreshIntervalId);
	autoRefreshIntervalId = setInterval(function () {
		getJobsDownloadProgress(taskIds);
	}, 10000);
}
