define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "bootstrapDateTimePicker", "chosen"], function (ko, koUtil, autho) {


	columnSortFilter = new Object();
	var lang = getSysLang();
	koUtil.GlobalColumnFilter = new Array();

	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});
	return function troubleShootViewModel() {
		var config = {
			'.chosen-select': {},
			'.chosen-select-deselect': {
				allow_single_deselect: true
			},
			'.chosen-select-no-single': {
				disable_search_threshold: 10
			},
			'.chosen-select-no-results': {
				no_results_text: 'Oops, nothing found!'
			},
			'.chosen-select-width': {
				width: "95%"
			}
		}
		for (var selector in config) {
			$(selector).chosen(config[selector]);
		}
		//Chosen dropdown
		ko.bindingHandlers.chosen = {
			init: function (element) {
				ko.bindingHandlers.options.init(element);
				$(element).chosen({
					disable_search_threshold: 10
				});
			},
			update: function (element, valueAccessor, allBindings) {
				ko.bindingHandlers.options.update(element, valueAccessor, allBindings);
				$(element).trigger('chosen:updated');
			}
		};

		$(".chosen-results").css("max-height", "122px");
		$('#btnRefresh').bind('keyup', function (e) {
			if (e.keyCode === 13) { // 13 is enter key                                
				$('#btnRefresh').click();
			}
		});
		$("#ts-grid-area").hide();
		checkALlPageId = 0;
		pagechangedcheck = 0;
		totalselectedRowCount = 0;

		var self = this;
		//Check rights
		self.checkRights = function (screenName, rightsFor) {
			var retval = autho.checkRightsBYScreen(screenName, rightsFor);
			if (retval == true) {
				return false;
			} else {
				return true;
			}
		}

		var date = new Date();
		var currentDate = moment().format('MM/DD/YYYY');
		var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
		var FromDate = getLogDateTime("from", 60);
		var ToDate = getLogDateTime("to", 60);
		var componentArray = [];
		var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'Message', 'Component', 'Logs', 'EntryDate', 'Level'];
		var listOfTimeRanges = [{ rangeId: "1", rangeValue: "15", rangeDisplayValue: "Last 15 minutes" },
		{ rangeId: "2", rangeValue: "30", rangeDisplayValue: "Last 30 minutes" },
		{ rangeId: "3", rangeValue: "60", rangeDisplayValue: "Last 1 hour" },
		{ rangeId: "4", rangeValue: "240", rangeDisplayValue: "Last 4 hours" },
		{ rangeId: "5", rangeValue: "720", rangeDisplayValue: "Last 12 hours" },
		{ rangeId: "6", rangeValue: "1440", rangeDisplayValue: "Last 24 hours" },
		{ rangeId: "7", rangeValue: "2880", rangeDisplayValue: "Last 2 days" },
		{ rangeId: "7", rangeValue: "10080", rangeDisplayValue: "Last 7 days" },
		{ rangeId: "7", rangeValue: "43200", rangeDisplayValue: "Last 30 days" },
		{ rangeId: "7", rangeValue: "86400", rangeDisplayValue: "Last 60 days" }];
		
		self.templateFlag = ko.observable(false);
		self.observableModelPopup = ko.observable();
		self.observableModelPopupShowHide = ko.observable();
		self.selectedComponent = ko.observable();
		self.selectedTimeRange = ko.observable();
		self.selectTimeRange = ko.observable('QuickTR');
		self.SerialNumber = ko.observable();
		self.DeviceID = ko.observable();
		self.ErrorName = ko.observable();
		self.multiselectedComponents = ko.observableArray();
		self.logComponentsList = ko.observableArray();
		self.timeRangeList = ko.observableArray(listOfTimeRanges);
		self.gridIdForShowHide = ko.observable();
		self.columnlist = ko.observableArray();

		$("#fromLogDate").addClass('disabled');
		$("#fromLogDate").prop("disabled", true);
		$("#toLogDate").addClass('disabled');
		$("#toLogDate").prop("disabled", true);

		self.updateTimeRangeOptions = function () {
			if (self.selectTimeRange() == "QuickTR") {
				$("#tsComponentSection").removeClass('disabled');
				$("#tsComponentSection").prop("disabled", false);
				$("#fromLogDate").addClass('disabled');
				$("#fromLogDate").prop("disabled", true);
				$("#toLogDate").addClass('disabled');
				$("#toLogDate").prop("disabled", true);
			} else if (self.selectTimeRange() == "AbsoluteTR") {
				$("#fromLogDate").removeClass('disabled');
				$("#fromLogDate").prop("disabled", false);
				$("#toLogDate").removeClass('disabled');
				$("#toLogDate").prop("disabled", false);
				$("#tsComponentSection").addClass('disabled');
				$("#tsComponentSection").prop("disabled", true);
			}
			return true;
		}

		//Date Picker        
		$("#logFromDate").datepicker({
			endDate: date,
			autoclose: true
		});
		$('#logFromDate').prop('value', currentDate);

		$("#logToDate").datepicker({
			endDate: date,
			autoclose: true
		});
		$('#logToDate').prop('value', currentDate);
		//Clear filter

		function getLogDateTime(flag, timeRange) {
			var d = new Date();
			if (flag == "from") {
				d = new Date(Date.now() - timeRange * 1000 * 60);
			}
			var hours = '' + d.getHours(),
				minutes = '' + d.getMinutes(),
				month = '' + (d.getMonth() + 1),
				day = '' + d.getDate(),
				year = d.getFullYear();

			if (month.length < 2) month = '0' + month;
			if (day.length < 2) day = '0' + day;
			if (hours.length < 2) hours = '0' + hours;
			if (minutes.length < 2) minutes = '0' + minutes;

			return [year, month, day].join('-') + " " + hours + ":" + minutes + ":00";
		}

		updateDateTimePicker("#fromLogDate", dateFormat, FromDate);
		updateDateTimePicker("#toLogDate", dateFormat, ToDate);

		self.clearfilter = function (gId) {
			gridFilterClear(gId);
		}

		self.refreshGrid = function (gId) {
			gridRefresh(gId);
		}

		//on change of choosen
		self.onChangeComponent = function () {
			if ($(".chosen-choices").height() > 64) {
				$(".chosen-choices").addClass('vf_ts_chosen-choices');
			}
			$('.chosen-choices').children('.search-choice').each(function () {
				$(this).prop('title', $(this).children('span').text());
			});
		}

		//on change of choosen
		self.onChangeTimeRange = function () {
			$('#quickTimeRange :selected').each(function (i, selected) {
				var timeRangeText = $(selected).text();
				var timeRangeValue = $(selected).val();
				self.selectedTimeRange(timeRangeValue);
			});
		}
		setTimeout(function () {
			$('#quickTimeRange').val("60").prop("selected", "selected");
			$('#quickTimeRange').trigger('chosen:updated');
		}, 100);

		var modelname = 'unloadTemplate';
		loadelement(modelname, 'genericPopup');
		loadelementForShowHide(modelname, 'genericPopup');
		setMenuSelection();

		//Load Template
		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopup(elementname);
		}

		self.openPopup = function (popupName, gId) {
			self.templateFlag(true);
			if (popupName == "modelShowHideCol") {
				self.gridIdForShowHide(gId);
				self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));

				if (visibleColumnsList.length == 0) {
					var columns = self.columnlist();
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
				}
				loadelementForShowHide(popupName, 'genericPopup');
				$('#troubleShootModelShowHide').modal('show');
			}
		}
		//Load element for show/hide
		function loadelementForShowHide(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopupShowHide(elementname);
		}
		//unload template
		self.unloadTempPopup = function (popupName, gId) {
			self.observableModelPopup('unloadTemplate');
		}
		//unload template for show/hide
		self.unloadTempPopup = function (popupName, gId) {
			self.observableModelPopupShowHide('unloadTemplate');
		}

		function generateTemplate(tempname, controllerId) {
			var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
			var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
			ko.components.register(tempname, {
				viewModel: {
					require: ViewName
				},
				template: {
					require: 'plugin/text!' + htmlName
				}
			});
		}
		
		self.exportToExcel = function (isExport, gId, exportflage) {
			var selectedLogItems = getSelectedUniqueId(gId);
			var unselectedLogItems = getUnSelectedUniqueId(gId);
			var checkAll = checkAllSelected(gId);
			visibleColumnsList = GetExportVisibleColumn(gId);
			var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
			var columnSortFilter = constructElasticColumnSortFilter(columnSortFilter, gId, gridStorage);
			var param = getTroubleShootParameters('jqxgridTroubleShoot', true, columnSortFilter, visibleColumnsList, gridStorage);
			self.exportGridId = ko.observable(gId);
			self.exportSucess = ko.observable();
			self.exportflage = ko.observable();
			var datainfo = $("#" + gId).jqxGrid('getdatainformation');
			if (datainfo.rowscount > 0) {
				logsExport(param, gId, self.openPopup);
			} else {
				openAlertpopup(1, 'no_data_to_export');
			}
		}

		self.searchLogs = function () {
			$('#logsSearchButton').addClass('disabled');
			self.multiselectedComponents([]);
			$('#componentDiv :selected').each(function (i, selected) {
				var obj = new Object();
				obj.id = $(selected).val();
				obj.displaytext = $(selected).text();
				var multichoiceSource = getMultiCoiceFilterArr('DeviceLogsComponent');
				var selectedSource = _.where(multichoiceSource, { Value: $(selected).text() });
				obj.Name = selectedSource[0].ControlValue;
				var sr = _.where(self.multiselectedComponents(), { Name: selectedSource[0].ControlValue });
				if (sr == '') {
					self.multiselectedComponents.push(obj);
				}
			});

			//reconstruct the grid
			$("#gridAreaTroubleShootDiv").empty();
			$('#gridAreaTroubleShootDiv').html('<div id="jqxgridTroubleShoot"></div><div id="pagerDivTroubleShoot"></div>');

			//clear grid state, if any
			columnSortFilter = new Object();
			var gridStorage = JSON.parse(sessionStorage.getItem("jqxgridTroubleShootgridStorage"));
			if (!_.isEmpty(gridStorage)) {
				var pagination = new Object();
				pagination.HighLightedItemId = null;
				pagination.PageNumber = 1;
				pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

				gridStorage[0].columnSortFilter = null;
				gridStorage[0].Pagination = pagination;
				gridStorage[0].isgridState = '';
				var updatedGridStorage = JSON.stringify(gridStorage);
				window.sessionStorage.setItem('jqxgridTroubleShootgridStorage', updatedGridStorage);
			}			

			troubleShootGrid('jqxgridTroubleShoot', param, false);
			$('#btnTSRestFilter').removeClass('disabled');
			$('#btnTSExportToexcel').removeClass('disabled');
			$('#btnTSRefresh').removeClass('disabled');
			$('#btnTSShowHide').removeClass('disabled');
		}
		
		function getComponentValues() {
			var category = AppConstants.get('TROUBLESHOOT_LOGS_COMPONENT');

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.genericConfigurations) {
							data.genericConfigurations = $.parseJSON(data.genericConfigurations);
							self.logComponentsList(data.genericConfigurations);
						}
					}
				}
			}

			var method = 'GetConfigurationValues';
			var params = '{"token":"' + TOKEN() + '","category":"' + category + '"}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		function logsExport(param, gId, openPopup) {

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(1, 'export_Sucess');
					}
				}
			}
			var method = 'GetLogs';
			var params = JSON.stringify(param);
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
		}

		getComponentValues();
		var param = getTroubleShootParameters('blankTroubleShootGrid', false, columnSortFilter, [], 'None');
		
		if(!_.isEmpty(globalDeviceDataForGetLogs)){
			isCanSearch=false;
			if(globalDeviceDataForGetLogs.serialNumber!=undefined &&globalDeviceDataForGetLogs.serialNumber!=null){
				self.SerialNumber(globalDeviceDataForGetLogs.serialNumber);
				isCanSearch=true;
			}
			
			if(globalDeviceDataForGetLogs.DeviceId!=undefined &&globalDeviceDataForGetLogs.DeviceId!=null){
				self.DeviceID(globalDeviceDataForGetLogs.DeviceId);
				isCanSearch=true;
			}
			if(isCanSearch){
				
				setTimeout(function () {
						self.searchLogs ();
				}, 200);				
				globalDeviceDataForGetLogs=new Object();
			}				
		}else{
			troubleShootGrid('blankTroubleShootGrid', param, true);
		}
			
		function troubleShootGrid(gID, param, isBlankGrid) {
			//calculate height of grid
			var gridheight = $(window).height();
			var percentValue;
			if (gridheight > 600) {
				percentValue = (20 / 100) * gridheight;
				gridheight = gridheight - 150;

				gridheight = gridheight - percentValue + 'px';

			} else {
				gridheight = '400px';
			}
			var InitGridStoragObj = initGridStorageObj(gID);
			var gridStorage = InitGridStoragObj.gridStorage;
			var adStorage = InitGridStoragObj.adStorage;
			var logDataFields = [
				{ name: 'isSelected', type: 'number' },
				{ name: 'UniqueDeviceId', map: 'deviceuid' },
				{ name: 'SerialNumber', map: 'serialnumber', type: 'string' },
				{ name: 'DeviceId', map: 'deviceid', type: 'string' },
				{ name: 'CustomerName', map: 'customername', type: 'string' },
				{ name: 'ModelName', map: 'model', type: 'string' },
				{ name: 'Message', map: 'message', type: 'string' },
				{ name: 'Component', map: 'Component', type: 'string' },
				{ name: 'Application', map: 'Application', type: 'string' },
				{ name: 'Logs', type: 'string' },
				{ name: 'EntryDate', map: 'EntryDate', type: 'date' },
				{ name: 'Level', map: 'level', type: 'string' },
				{ name: 'JobId', map: 'jobid', type: 'string' },
				{ name: 'HostName', map: 'HostName', type: 'string' },
				{ name: 'Method', map: 'method', type: 'string' },
				{ name: 'ClassName', map: 'classname', type: 'string' },
				{ name: 'DeviceApplicationName', map: 'deviceapplicationname', type: 'string' },
				{ name: 'correlationid', map: 'correlationid', type: 'string' }
			];

			var source = {
				dataType: "json",
				datafields: logDataFields,
				root: 'Logs',
				type: "POST",
				data: param,
				url: AppConstants.get('API_URL') + "/GetLogs",
				contentType: 'application/json',
				beforeprocessing: function (data) {
					if (data.getLogResp) {
						data.getLogResp = $.parseJSON(data.getLogResp);
					} else {
						data.getLogResp = [];
					}

					if (data.getLogResp && data.getLogResp.PaginationResponse) {
						source.totalrecords = data.getLogResp.PaginationResponse.TotalRecords;
						source.totalpages = data.getLogResp.PaginationResponse.TotalPages;
					} else {
						source.totalrecords = 0;
						source.totalpages = 0;

					}
				}

			};

			var dataAdapter;
			if (isBlankGrid) {
				var blankSource = { dataType: "local", localdata: [], dataFields: logDataFields };
				dataAdapter = new $.jqx.dataAdapter(blankSource);
			} else {
				dataAdapter = new $.jqx.dataAdapter(source,
					{
						formatData: function (data) {

							$('#blankTroubleShootGrid').hide();
							$('#jqxgridTroubleShoot').show();
							disableIcons(['btnTSRestFilter', 'btnTSShowHide', 'btnTSExportToexcel', 'btnTSRefresh']);
							columnSortFilter = new Object();
							columnSortFilter = constructElasticColumnSortFilter(columnSortFilter, gID, gridStorage);
							param.getLogsReq.ColumnSortFilter = columnSortFilter;
							koUtil.GlobalColumnFilter = columnSortFilter;
							param.getLogsReq.Pagination = getPaginationObject(param.getLogsReq.Pagination, gID);
							updatepaginationOnState(gID, gridStorage, param.getLogsReq.Pagination, null, null);
							data = JSON.stringify(param);
							return data;
						},
						downloadComplete: function (data, status, xhr) {

							enableIcons(['btnTSRestFilter', 'btnTSShowHide', 'btnTSExportToexcel', 'btnTSRefresh']);

							if (data.getLogResp && data.getLogResp.Logs) {
								for (var i = 0; i < data.getLogResp.Logs.length; i++) {
									data.getLogResp.Logs[i].id = "log#" + i;
									var entrydate = data.getLogResp.Logs[i].EntryDate;
									data.getLogResp.Logs[i].EntryDate = entrydate.replace(" ", "T").replace(",", ".");
								}
							} else {
								source.totalrecords = 0;
								source.totalpages = 0;
								data.getLogResp = new Object();
								data.getLogResp.Logs = [];
							}
							$('.all-disabled').hide();
						},
						loadError: function (jqXHR, status, error) {
							$('.all-disabled').hide();
						}
					}
				);
			}

			var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
				genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name, false, []);
			}

			var SerialNoRendere = function (row, columnfield, value, defaulthtml, columnproperties) {
				var html = "";
				if (value != "(null)") {
					html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
				}
				return html;
			}
			var rendered = function (element) {
				if (!isBlankGrid) {
					enablegridfunctions(gID, 'id', element, gridStorage, false, 'pagerDivTroubleShoot', false, 0, 'id', null, null, null);
				}
				return true;
			}
			var downloadLogsRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
				var jobID = $("#" + gID).jqxGrid('getcellvalue', row, 'JobId');
				if (jobID && jobID != undefined && jobID != "" && jobID != "(null)" && jobID != "0") {
					return '<a  id="imageId" tabindex="0" class="btn default" style="margin-left: 5px;" height="60" title="Download" width="50" onClick="downloadOSLogs(' + row + ')"><i class="icon-download3"></i></a>';
				} else {
					return '';
				}
			}


			$("#" + gID).jqxGrid({
				height: gridHeightFunction(gID, "80"),
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
				rowsheight: 32,
				enabletooltips: true,
				autoshowfiltericon: true,
				rendergridrows: function () {
					return dataAdapter.records;
				},
				ready: function () {
					$('#logsSearchButton').removeClass('disabled');
					callOnGridReady(gID, gridStorage);
					var columns = genericHideShowColumn(gID, true, []);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsList = koUtil.gridColumnList;
					if (isBlankGrid) {
						setTimeout(function () {
							$(".jqx-grid-empty-cell span").addClass("vf_ts_defaultGridText");
							$(".jqx-grid-empty-cell span").html('<div>' + i18n.t("no_default_data_for_troubleshooting", { lng: lang }) + '</div>');
						}, 1000);
						$(".jqx-grid-empty-cell span").html('<div>' + i18n.t("no_default_data_for_troubleshooting", { lng: lang }) + '</div>');
					}
				},
				columns: [
					{
						text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, hidden: true, columntype: 'checkbox', enabletooltips: false,
						datafield: 'isSelected', width: 40, renderer: function () {
							return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
						}, rendered: rendered
					},
					{ text: '', dataField: 'id', hidden: true, editable: false, },
					{
						text: i18n.t('Component', { lng: lang }),
						datafield: 'Component',
						minwidth: 100,
						width: 160,
						editable: false,
						filterable: false,
						sortable: false,
						menu: false
					},
					{
						text: i18n.t('Date', { lng: lang }),
						datafield: 'EntryDate',
						minwidth: 150,
						editable: false,
						cellsformat: LONG_DATETIME_GRID_FORMAT,
						enabletooltips: false,
						filterable: false,
						sortable: false,
						menu: false
					},
					{
						text: i18n.t('serial', { lng: lang }),
						datafield: 'SerialNumber',
						minwidth: 80,
						width: 160,
						editable: false,
						filterable: false,
						sortable: false,
						menu: false,
						cellsrenderer: SerialNoRendere
					},
					{
						text: i18n.t('device_id', { lng: lang }),
						datafield: 'DeviceId',
						width: 120,
						minwidth: 80,
						editable: false,
						filterable: false,
						sortable: false,
						menu: false
					},
					{
						text: i18n.t('model', { lng: lang }),
						datafield: 'ModelName',
						minwidth: 80,
						width: 120,
						editable: false,
						sortable: false,
						filtertype: isBlankGrid ? false : "custom",
						menu: isBlankGrid ? false : true,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
						}
					},
					{
						text: i18n.t('Message', { lng: lang }),
						datafield: 'Message',
						autoheight: true,
						minwidth: 220,
						editable: false,
						filterable: false,
						sortable: false,
						menu: false
					},
					{
						text: i18n.t('Level', { lng: lang }),
						datafield: 'Level',
						autoheight: true,
						minwidth: 80,
						width: 120,
						editable: false,
						sortable: false,
						filtertype: isBlankGrid ? false : "custom",
						menu: isBlankGrid ? false : true,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanelMultiChoice(filterPanel, datafield, 'LogLevel');
						}
					},
					{
						text: i18n.t('Application', { lng: lang }),
						datafield: 'Application',
						autoheight: true,
						minwidth: 80,
						width: 140,
						editable: false,
						filterable: false,
						sortable: false,
						menu: false,
						hidden: true
					},
					{
						text: i18n.t('HostName', { lng: lang }),
						datafield: 'HostName',
						autoheight: true,
						minwidth: 80,
						width: 140,
						editable: false,
						filterable: false,
						sortable: false,
						menu: false,
						hidden: true
					},
					{
						text: i18n.t('ClassName', { lng: lang }),
						datafield: 'ClassName',
						autoheight: true,
						minwidth: 80,
						width: 140,
						editable: false,
						filterable: false,
						sortable: false,
						menu: false,
						hidden: true
					},
					{
						text: i18n.t('Method', { lng: lang }),
						datafield: 'Method',
						autoheight: true,
						minwidth: 80,
						width: 140,
						editable: false,
						filterable: false,
						sortable: false,
						menu: false,
						hidden: true
					},
					{
						text: i18n.t('DeviceApplicationName', { lng: lang }),
						datafield: 'DeviceApplicationName',
						autoheight: true,
						minwidth: 80,
						width: 140,
						editable: false,
						filterable: false,
						sortable: false,
						menu: false,
						hidden: true
					},
					{
						text: i18n.t('correlationid', { lng: lang }),
						datafield: 'correlationid',
						autoheight: true,
						minwidth: 80,
						width: 140,
						editable: false,
						filterable: false,
						sortable: false,
						menu: false,
						hidden: true
					},
					{
						text: i18n.t('Additional Logs', { lng: lang }),
						filterable: false,
						sortable: false,
						menu: false,
						editable: false,
						datafield: 'Logs',
						minwidth: 60,
						width: 140,
						cellsrenderer: downloadLogsRenderer
					}
				]
			});
			if (!isBlankGrid) {
				getGridBiginEdit(gID, 'id', gridStorage);
				callGridFilter(gID, gridStorage);
				callGridSort(gID, gridStorage, 'id');
			} else {
				$('#jqxgridTroubleShoot').hide();
			}

		}

		function convertDateToESFormat(dateValue) {
			var dateArray = dateValue.split(" ");
			var newdate = '';
			if (!_.isEmpty(dateArray[0])) {
				newdate = dateArray[0].split("-").reverse().join("-");
			}

			var formattedDate = new Date(newdate + " " + dateArray[1] + ":00" + " " + dateArray[2]);
			if (formattedDate == undefined || formattedDate == '') {
				formattedDate = new Date();
			}
			var hours = '' + formattedDate.getHours(),
				minutes = '' + formattedDate.getMinutes(),
				month = '' + (formattedDate.getMonth() + 1),
				day = '' + formattedDate.getDate(),
				year = formattedDate.getFullYear();
			if (month.length < 2) month = '0' + month;
			if (day.length < 2) day = '0' + day;
			if (hours.length < 2) hours = '0' + hours;
			if (minutes.length < 2) minutes = '0' + minutes;
			return [year, month, day].join('-') + " " + hours + ":" + minutes + ":00";
		}

		function constructElasticColumnSortFilter(columnSortFilter, gID, gridStorage) {
			if (columnSortFilter == undefined) {
				columnSortFilter = new Object();
			}
			columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'Logs');
			var FilterList = new Array();
			if (columnSortFilter.FilterList) {
				FilterList = columnSortFilter.FilterList;
			}
			//Component Selection
			if (self.multiselectedComponents() && self.multiselectedComponents().length > 0) {
				var componentList = self.multiselectedComponents();
				var selectedModelValue = '';
				for (i = 0; i < componentList.length; i++) {
					selectedModelValue += componentList[i].Name + '^';
				}
				if (selectedModelValue != '') {
					selectedModelValue = selectedModelValue.substring(0, selectedModelValue.length - 1)
				}
				var columnfilter = new Object();
				columnfilter.FilterColumn = 'Component';
				console.log(self.multiselectedComponents());
				console.log(selectedModelValue);
				columnfilter.FilterValue = selectedModelValue;
				FilterList.push(columnfilter);
			}

			//Date Message Selection	
			if (self.ErrorName() && self.ErrorName() != undefined) {
				var columnfilter = new Object();
				columnfilter.FilterColumn = 'Message';
				columnfilter.FilterValue = self.ErrorName();
				FilterList.push(columnfilter);
			}
			//serialNumber
			if (self.SerialNumber() && self.SerialNumber() != undefined) {
				var columnfilter = new Object();
				columnfilter.FilterColumn = 'SerialNumber';
				columnfilter.FilterValue = self.SerialNumber();
				FilterList.push(columnfilter);
			}

			//DeviceId
			if (self.DeviceID() && self.DeviceID() != undefined) {
				var columnfilter = new Object();
				columnfilter.FilterColumn = 'DeviceId';
				columnfilter.FilterValue = self.DeviceID();
				FilterList.push(columnfilter);
			}
			//FromDatetime
			//ToDatetime
			if (self.selectTimeRange() == "AbsoluteTR") {
				var columnfilter = new Object();
				columnfilter.FilterColumn = 'EntryDate';
				var fromValue = $('#logFromValue').val();
				var toValue = $('#logToValue').val();
				if (!_.isEmpty(fromValue)) {
					columnfilter.FilterValue = convertDateToESFormat(fromValue);
				}
				if (!_.isEmpty(toValue)) {
					columnfilter.FilterValueOptional = convertDateToESFormat(toValue);
				}
				FilterList.push(columnfilter);
			} else if (self.selectTimeRange() == "QuickTR") {
				var columnfilter = new Object();
				columnfilter.FilterColumn = 'EntryDate';
				var timeSpanValue = $("#quickTimeRange").find('option:selected').val();
				columnfilter.FilterValue = getLogDateTime("from", timeSpanValue);
				columnfilter.FilterValueOptional = getLogDateTime("to", 60);
				FilterList.push(columnfilter);
			}
			columnSortFilter.FilterList = FilterList;
			return columnSortFilter;
		}
		seti18nResourceData(document, resourceStorage);
	};
	///Getting parameter of Troubleshoot
	function getTroubleShootParameters(gID, isExport, columnSortFilter, visibleColumns, gridStorage) {
		var getLogsReq = new Object();
		var Export = new Object();
		var Pagination = new Object();
		Pagination.HighLightedItemId = null;
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
		Export.DynamicColumns = null;
		Export.VisibleColumns = visibleColumns;
		if (isExport == true) {
			Export.IsAllSelected = true;
			Export.ExportReportType = 7;
			Export.IsExport = true;
		} else {
			Export.IsAllSelected = false;
			Export.ExportReportType = 7;
			Export.IsExport = false;
		}
		getLogsReq.Pagination = Pagination;
		getLogsReq.ColumnSortFilter = columnSortFilter;
		if (gID == 'blankTroubleShootGrid') {
			disableIcons(['btnTSRestFilter', 'btnTSShowHide', 'btnTSExportToexcel', 'btnTSRefresh']);
			$('#btnTSRestFilter').addClass('disabled');
			$('#btnTSExportToexcel').addClass('disabled');
			$('#btnTSRefresh').addClass('disabled');
			$('#btnTSShowHide').addClass('disabled');
		}
		getLogsReq.Export = Export;
		var param = new Object();
		param.token = TOKEN();
		if (isExport == true) {
			param.isExport = true;
		} else {
			param.isExport = false;
		}
		param.token = TOKEN();
		param.getLogsReq = getLogsReq;
		return param;
	}

});
function displayWaitDownloadToaster(toaster) {
	var config = {};
	config.toasterType = "wait"
	config.message = "Download initiated, please wait a moment";
	config.title = "Downloading...";
	config.timeOut = 0;
	config.showClose = false;
	config.clickToClose = false;
	displayToaster(toaster, config);
}

function displaySuccessDownloadToaster(toaster) {
	var config = {};
	config.toasterType = "success"
	config.message = i18n.t('file_successfully_downloaded', { lng: lang });
	config.title = "Success";
	config.timeOut = 5000;
	config.showClose = true;
	config.clickToClose = true;
	displayToaster(toaster, config);
}
function downloadOSLogs(row) {
	$("#loadingDiv").show();
	displayWaitDownloadToaster(toaster);
	var JobId = $("#jqxgridTroubleShoot").jqxGrid('getcellvalue', row, 'JobId');
	if (JobId && JobId != undefined) {
		var getDeviceLogReq = new Object();
		getDeviceLogReq.JobId = JobId;
		var param = new Object();
		param.token = TOKEN();
		param.getDeviceLogReq = getDeviceLogReq;
		var callBackfunction = function (data, error) {
			$("#loadingDiv").hide();
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					removeToaster(toaster);
					if (data.getDeviceLogResp) {
						data.getDeviceLogResp = $.parseJSON(data.getDeviceLogResp);
						displaySuccessDownloadToaster(toaster)
						var b64Data = data.getDeviceLogResp.byteArray;
						var contentType = getContentTypeFromExtension("null");
						var blob = b64toBlob(b64Data, contentType);
						var blobUrl = URL.createObjectURL(blob);
						var a = $("<a>").attr("href", blobUrl)
							.attr("download", data.getDeviceLogResp.filename)
							.appendTo("body");
						try {
							a[0].click();
						} catch (e) {
							saveFileOnAccessDenied(data.getDeviceLogResp.filename, blob);
						}
						a.remove();
					}
				} else if (data.responseStatus.StatusCode == AppConstants.get('DETAILED_DOWNLOAD_LOGS_NOT_AVAILABLE')) {
					openAlertpopup(1, 'Detailed_Download_Logs_Not_Available');
					removeToaster(toaster);
				} else if (data.responseStatus.StatusCode == AppConstants.get('OS_LOG_FILE_NOT_FOUND')) {
					openAlertpopup(1, 'OS_Download_Log_File_Not_Found');
					removeToaster(toaster);
				}
			}
		}
		var method = 'GetDeviceLogURL';
		var params = JSON.stringify(param);
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
	} else {
		openAlertpopup(2, 'Job Id not found');
	}
}