define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
	var lang = getSysLang();

	return function parentReferenceSetDetailsModel() {

		$('#modalParentRFSDetailsHeader').mouseup(function () {
			$("#modalParentRFSDetailsContent").draggable({ disabled: true });
		});

		$('#modalParentRFSDetailsHeader').mousedown(function () {
			$("#modalParentRFSDetailsContent").draggable({ disabled: false });
		});

		var self = this;
		self.templateFlag = ko.observable(false);
		self.observableModelPopupDetails = ko.observable();
		self.ParentReferenceSetName = ko.observable('');
		self.titleText = ko.observable('');
		self.parentReferenceSetDetails = ko.observableArray();

		self.clearFilter = function (gId) {
			gridFilterClear(gId);
		}

		self.exportToExcel = function (gId) {
			var dataInfo = $("#" + gId).jqxGrid('getdatainformation');
			if (dataInfo.rowscount <= 0) {
				openAlertpopup(1, 'no_data_to_export');
			} else {
				$("#loadingDiv").show();
				exportjqxcsvData(gId, 'Parent_Reference_Set_Details');
				openAlertpopup(1, 'export_Information');
				$("#loadingDiv").hide();
			}
		}

		self.openPopup = function (popupName) {
			//self.templateFlag(true);
			if (popupName == "modalParentReferenceSetAdvancedOptions") {
				loadelement(popupName, 'referenceSets');
				$('#modalReferenceSetViewDetails').modal('show');
			}
		}

		self.unloadTempPopup = function (popupName) {
			self.observableModelPopupDetails('unloadTemplate');
			$('#modalReferenceSetViewDetails').modal('hide');
		}

		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopupDetails(elementname);
		}

		function generateTemplate(tempname, controllerId) {
			var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
			var viewName = 'controller/' + controllerId + '/' + tempname + '.js';
			ko.components.register(tempname, {
				viewModel: { require: viewName },
				template: { require: 'plugin/text!' + htmlName }
			});
		}

		init();
		function init() {
			if (!_.isEmpty(globalSelectedParentReferenceSet)) {
				self.ParentReferenceSetName = ko.observable(globalSelectedParentReferenceSet.SelectedParentRFSName);
				var message = i18n.t('reference_set_details_for', { lng: lang }) + " " + self.ParentReferenceSetName();
				self.titleText(message);
			}
			getParentReferenceSetDetails('jqxGridParentRFSDetails', self.parentReferenceSetDetails, self.openPopup);
		}

		function getParentReferenceSetDetails(gId, parentReferenceSetDetails, openPopup) {
			var getParentReferenceSetDetailsReq = new Object();
			getParentReferenceSetDetailsReq.ParentReferenceSetId = !_.isEmpty(globalSelectedParentReferenceSet) ? globalSelectedParentReferenceSet.SelectedParentRFSId : 0;

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data.getParentReferenceSetDetailsResp) {
							data.getParentReferenceSetDetailsResp = $.parseJSON(data.getParentReferenceSetDetailsResp);

							if (data.getParentReferenceSetDetailsResp.ParentReferenceSetDetails) {
								parentReferenceSetDetails(data.getParentReferenceSetDetailsResp.ParentReferenceSetDetails);
							} else {
								parentReferenceSetDetails([]);
							}

							parentReferenceSetsDetailsGrid(parentReferenceSetDetails(), gId, openPopup);
						}
					}
				}
				$("#loadingDiv").hide();
			}

			var method = 'GetParentReferenceSetDetails';
			var params = '{"token":"' + TOKEN() + '","getParentReferenceSetDetailsReq":' + JSON.stringify(getParentReferenceSetDetailsReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		function parentReferenceSetsDetailsGrid(data, gId, openPopup) {

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
			window.sessionStorage.setItem(gId + 'gridStorage', gridStorage);
			gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));

			var source =
			{
				dataType: "json",
				localdata: data,
				datafields: [
					{ name: 'ReferenceSetId', map: 'ReferenceSetId' },
					{ name: 'ReferenceSetName', map: 'ReferenceSetName', type: 'string' },
					{ name: 'Models', map: 'Models', type: 'string' }
				]
			};
			var dataAdapter = new $.jqx.dataAdapter(source);

			var buildFilterPanel = function (filterPanel, datafield) {
				wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gId, true);
			}

			var detailsRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
				return '<div style="padding-left:6px;padding-top:7px;cursor:pointer;"> <a title="Click to view Details" tabindex="0" style="text-decoration:underline;" height="60" width="50" >View Details</a></div>'
			}

			$("#" + gId).jqxGrid(
				{
					width: "100%",
					height: "450px",
					source: dataAdapter,
					pagesize: data.length,
					sortable: true,
					filterable: true,
					selectionmode: 'singlerow',
					theme: AppConstants.get('JQX-GRID-THEME'),
					altrows: true,
					autoshowcolumnsmenubutton: false,
					showsortmenuitems: false,
					editable: true,
					rowsheight: 32,
					enabletooltips: true,
					columnsResize: true,
					columns: [
						{
							text: i18n.t('reference_set_name', { lng: lang }), datafield: 'ReferenceSetName', width: 250, editable: false,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						},
						{ text: i18n.t('data_models', { lng: lang }), datafield: 'Models', editable: false, width: 'auto', filterable: false, sortable: false, menu: false, },
						{
							text: i18n.t('attribute_Details', { lng: lang }), datafield: 'Details', editable: false, minwidth: 120, resizable: true, menu: false, sortable: false, filterable: false, cellsrenderer: detailsRenderer,
						}
					]
				}).on({
					filter: function (e) {
						gridSeletedRowData = [];
					}
				});
			callUiGridFilter(gId, gridStorage);

			$("#" + gId).on("cellclick", function (event) {
				var column = event.args.column;
				var rowindex = event.args.rowindex;
				var columnindex = event.args.columnindex;
				var rowData = $("#" + gId).jqxGrid('getrowdata', rowindex);
				if (event.args.datafield === 'Details') {
					if (!_.isEmpty(rowData)) {
						globalSelectedReferenceSet = new Object();
						globalSelectedReferenceSet.Id = rowData.ReferenceSetId;
						globalSelectedReferenceSet.Name = rowData.ReferenceSetName;
					}
					openPopup('modalParentReferenceSetAdvancedOptions');
				}
			});
		}

		seti18nResourceData(document, resourceStorage);
	}
});