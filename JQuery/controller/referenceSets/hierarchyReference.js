
define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho) {
	var lang = getSysLang();
	var columnSortFilterForHierarchyAssignment = new Object();

	return function DashBoardViewModel() {

		var self = this;

		//Draggable function
		$('#modelPopupHierarchyAssignmentIDHeader').mouseup(function () {
			$("#modelPopupHierarchyAssignmentID").draggable({ disabled: true });
		});

		$('#modelPopupHierarchyAssignmentIDHeader').mousedown(function () {
			$("#modelPopupHierarchyAssignmentID").draggable({ disabled: false });
		});
		////////////////

		checkRight();

		//Rights changes
		function checkRight() {
			var isDownloadScheduleAllowed = autho.checkRightsBYScreen('Download Schedule', 'IsModifyAllowed');
			var isGlobalOperationsAllowed = autho.checkRightsBYScreen('Global Operations', 'IsModifyAllowed');
			retval = false;

			if (isDownloadScheduleAllowed && isGlobalOperationsAllowed)
				retval = true;

			if (retval) {
				$("#btnEditRef").prop("disabled", false);
				$("#btnUnAssign").prop("disabled", false);
			} else {
				$("#btnEditRef").prop("disabled", true);
				$("#btnUnAssign").prop("disabled", true);
			}
			return retval;
		}

		$('#btnRefresh').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btnRefresh').click();
			}
		});

		$('#btnEditRef').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btnEditRef').click();
			}
		});

		self.observableModelPopup = ko.observable();
		self.observableModelPopupShowHide = ko.observable();
		self.columnlist = ko.observableArray();
		self.templateFlag = ko.observable(false);
		self.gridIdForShowHide = ko.observable();
		var initialGridColumns = ["isSelected", "HierarchyFullPath", "AssignmentType", "EnableAutoDownload", "DownloadedOn", "IsChildExists"];
		var compulsoryfields = ['HierarchyFullPath', 'QualifiedReferenceSets', 'AssignedReferenceSets', 'Details', 'SourceHierarchy', 'ReferenceSet'];
		var modelName = 'unloadTemplate';
		loadelement(modelName, 'genericPopup', 1);
		loadelement(modelName, 'genericPopup', 2);

		setMenuSelection();
		modelReposition();
		self.onChangeTab = function (id) {
			var i, tabcontent, tablinks;
			// Get all elements with class="tabcontent" and hide them
			tabcontent = document.getElementsByClassName("tab-content");
			for (i = 0; i < tabcontent.length; i++) {
				tabcontent[i].style.display = "none";
			}
			// Get all elements with class="tablinks" and remove the class "active"
			tablinks = document.getElementsByClassName("tablinks");
			for (i = 0; i < tablinks.length; i++) {
				tablinks[i].className = tablinks[i].className.replace(" active", "");
			}
			// Show the current tab, and add an "active" class to the button that opened the tab
			document.getElementById(id).style.display = "block";
			document.getElementById(id + 'Tab').className += " active";
		}
		self.openPopup = function (popupName, gID) {
			self.templateFlag(true);
			if (popupName == "modelShowHideCol") {
				self.gridIdForShowHide(gID);
				self.columnlist(genericHideShowColumn(gID, true, compulsoryfields));

				if (visibleColumnsList.length == 0) {
					var columns = self.columnlist();
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
				}

				loadelement(popupName, 'genericPopup', 2);
				$('#modalShowHideHierarchyID').modal('show');
			} else if (popupName == "modelEditHierarchyAssignment") {
				var selectedItemIds = getSelectedUniqueId(gID);
				var selectedHierarchies = getMultiSelectedData(gID);
				if (selectedHierarchies && selectedHierarchies.length >= 1) {
					if (selectedHierarchies.length == 1) {
						globalVariableForHierarchyAssignment = selectedHierarchies[0];
						globalVariableForHierarchyAssignment.HierarchyIds = selectedItemIds;
						globalVariableForHierarchyAssignment.IsMultiEdit = false;
					} else {
						globalVariableForHierarchyAssignment = new Object();
						globalVariableForHierarchyAssignment.IsMultiEdit = true;
						globalVariableForHierarchyAssignment.selectedCount = getAllSelectedDataCount(gID);
						globalVariableForHierarchyAssignment.unselectedCount = getUnSelectedUniqueId(gID);
						globalVariableForHierarchyAssignment.checkAll = checkAllSelected(gID);
						globalVariableForHierarchyAssignment.HierarchyIds = selectedItemIds;
					}
					loadelement(popupName, 'referenceSets', 1);
					$('#modelHierarchyAssignmentID').modal('show');
				} else {
					openAlertpopup(1, 'please_select_a_hierachy_reference_set');
				}
			} else if (popupName == "modelUnassignReferenceSet") {
				var selectedHierarchies = getMultiSelectedData(gID)
				if (selectedHierarchies.length >= 1) {
					loadelement(popupName, 'referenceSets', 1);
					$('#modelHierarchyAssignmentID').modal('show');
					if (selectedHierarchies.length == 1) {
						globalVariableForHierarchyAssignment = selectedHierarchies[0];
						globalVariableForHierarchyAssignment.IsMultiEdit = false;
					} else {
						globalVariableForHierarchyAssignment = [];
						globalVariableForHierarchyAssignment.IsMultiEdit = true;
						globalVariableForHierarchyAssignment.selectedCount = getAllSelectedDataCount(gID);
						globalVariableForHierarchyAssignment.unselectedCount = getUnSelectedUniqueId(gID);
						globalVariableForHierarchyAssignment.checkAll = checkAllSelected(gID);
					}
				} else {
					openAlertpopup(1, 'please_select_a_hierachy_reference_set');
				}
			}
		}

		function loadelement(elementname, controllerId, flage) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}

			if (flage == 2) {
				self.observableModelPopupShowHide(elementname);
			} else {
				self.observableModelPopup(elementname);
			}
		}

		//unload template
		self.unloadTempPopup = function (popupName, modelId) {
			self.observableModelPopup(popupName);
			self.observableModelPopupShowHide(popupName);
			$('#' + modelId).modal('hide');
			checkIsPopUpOPen();

		}

		//unload View Result model
		self.closeModelAssginment = function () {
			$("#modelPopupHierarchyAssignmentID").modal('hide');
			checkIsPopUpOPen();
		}

		// reset filter
		self.clearfilter = function (gID) {
			gridFilterClear(gID);
		}

		// refresh grid
		self.refreshGrid = function (gID) {
			gridRefresh(gID);
		}

		//ExportToExcel 
		self.exportToExcel = function (isExport, gID) {
			visibleColumnsList = GetExportVisibleColumn(gID);
			var param = getHierarchyAssignmentDetails(isExport, gID, columnSortFilterForHierarchyAssignment, visibleColumnsList);

			var datainfo = $("#" + gID).jqxGrid('getdatainformation');
			if (datainfo.rowscount > 0) {
				exportHierarchyAssignmentDetails(param);
			} else {
				openAlertpopup(1, 'no_data_to_export');
			}
		}

		self.resizeColumns = function (gId) {
			$("#modalResizeResetColumnsConfirmation").modal('show');
			$("#resizeResetColumnsConfirmationMessage").text(i18n.t('save_resized_columns_confirmation', { lng: lang }));

			globalGridColumns = new Object();
			globalGridColumns.gId = gId;
			globalGridColumns.gridName = 'HierarchyAssignment';
			globalGridColumns.isColumnResized = true;
			globalGridColumns.gridColumns = initialGridColumns;
		}

		self.resetColumns = function (gId) {
			$("#modalResizeResetColumnsConfirmation").modal('show');
			$("#resizeResetColumnsConfirmationMessage").text(i18n.t('reset_resized_columns_confirmation', { lng: lang }));

			globalGridColumns = new Object();
			globalGridColumns.gId = gId;
			globalGridColumns.gridName = 'HierarchyAssignment';
			globalGridColumns.isColumnResized = false;
			globalGridColumns.gridColumns = [];
		}

		var param = getHierarchyAssignmentDetails(false, 'jqxgridHierarchyAssignment', columnSortFilterForHierarchyAssignment, []);
		setJqxGridHierarchyAssignmentDetails(param, 'jqxgridHierarchyAssignment', self.openPopup);
		seti18nResourceData(document, resourceStorage);
	};

	// export jqxGrid data
	function exportHierarchyAssignmentDetails(param) {
		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					openAlertpopup(1, 'export_Sucess');
				}
			}
		}

		var method = 'GetHierarchyQualifiedReferenceSets';
		var params = JSON.stringify(param);
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
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

	//set grid data
	function setJqxGridHierarchyAssignmentDetails(param, gID, openPopup) {

		var InitGridStoragObj = initGridStorageObj(gID);
		var gridStorage = InitGridStoragObj.gridStorage;
		var adStorage = InitGridStoragObj.adStorage;

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
		var source = {
			dataType: 'json',
			dataFields: [
				{ name: 'HierarchyFullPath', map: 'HierarchyFullPath', type: 'string' },
				{ name: 'QualifiedReferenceSets', map: 'QualifiedReferenceSets' },
				{ name: 'AssignedReferenceSets', map: 'AssignedReferenceSets' },
				{ name: 'AssignmentType', map: 'AssignmentType' },
				{ name: 'EnableAutoDownload', map: 'EnableAutoDownload' },
				{ name: 'DownloadedOn', map: 'DownloadedOn' },
				{ name: 'HierarchyId', map: 'HierarchyId' },
				{ name: 'isSelected', type: 'number' },
				{ name: 'IsAutoSchedulingDuringMHB', map: 'IsAutoSchedulingDuringMHB' },
				{ name: 'IsAutoSchedulingEnabled', map: 'IsAutoSchedulingEnabled' },
				{ name: 'HierarchyName', map: 'HierarchyName' },
				{ name: 'IsInheritReferenceSet', map: 'IsInheritReferenceSet' },
				{ name: 'HierarchyLevel', map: 'HierarchyLevel' },
				{ name: 'IsChildExists', map: 'IsChildExists' }
			],
			root: 'hierarchyReferenceSet',
			type: 'POST',
			data: param,

			url: AppConstants.get('API_URL') + "/GetHierarchyQualifiedReferenceSets",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data.getHierarchyQualifiedReferenceSetsResp && data.getHierarchyQualifiedReferenceSetsResp) {
					data.getHierarchyQualifiedReferenceSetsResp = $.parseJSON(data.getHierarchyQualifiedReferenceSetsResp);
					if (data.getHierarchyQualifiedReferenceSetsResp.PaginationResponse) {
						source.totalrecords = data.getHierarchyQualifiedReferenceSetsResp.PaginationResponse.TotalRecords;
						source.totalpages = data.getHierarchyQualifiedReferenceSetsResp.PaginationResponse.TotalPages;
					} else {
						source.totalrecords = 0;
						source.totalpages = 0;
						data.getHierarchyQualifiedReferenceSetsResp.hierarchyReferenceSet = [];
					}
				}
				else {
					data.getHierarchyQualifiedReferenceSetsResp = [];
				}
			},
		}

		var dataAdapter = new $.jqx.dataAdapter(source,
			{
				formatData: function (data) {
					$('.all-disabled').show();
					disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
					var columnSortFilter = new Object();
					columnSortFilter = columnSortFilterFormatedData(columnSortFilterForHierarchyAssignment, gID, gridStorage, 'HierarchyAssignment');

					koUtil.GlobalColumnFilter = columnSortFilter;
					param.getHierarchyQualifiedReferenceSetsReq.ColumnSortFilter = columnSortFilter;
					param.getHierarchyQualifiedReferenceSetsReq.Pagination = getPaginationObject(param.getHierarchyQualifiedReferenceSetsReq.Pagination, gID);

					updatepaginationOnState(gID, gridStorage, param.getHierarchyQualifiedReferenceSetsReq.Pagination, null, null);
					data = JSON.stringify(param);
					return data;
				},
				downloadComplete: function (data, status, xhr) {

					enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
					if (data) {
						//if (data && data.getHierarchyQualifiedReferenceSetsResp)
						//    data.getHierarchyQualifiedReferenceSetsResp = $.parseJSON(data.getHierarchyQualifiedReferenceSetsResp);

						if (data.getHierarchyQualifiedReferenceSetsResp && data.getHierarchyQualifiedReferenceSetsResp.hierarchyReferenceSet != null) {
							//for (var i = 0; i < data.getHierarchyQualifiedReferenceSetsResp.hierarchyReferenceSet.length; i++) {
							//    data.getHierarchyQualifiedReferenceSetsResp.hierarchyReferenceSet[i].DownloadedOn = convertToLocaltimestamp(data.getHierarchyQualifiedReferenceSetsResp.hierarchyReferenceSet[i].DownloadedOn);
							//}
							if (data.getHierarchyQualifiedReferenceSetsResp.TotalSelectionCount != 'undefined') {
								gridStorage[0].TotalSelectionCount = data.getHierarchyQualifiedReferenceSetsResp.TotalSelectionCount;
								var updatedGridStorage = JSON.stringify(gridStorage);
								window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
							}

							if (data.getHierarchyQualifiedReferenceSetsResp.PaginationResponse) {
								//if (data.getHierarchyQualifiedReferenceSetsResp.PaginationResponse.HighLightedItemPage > 0) {
								//    //for (var h = 0; h < data.getHierarchyQualifiedReferenceSetsResp.hierarchyReferenceSet.length; h++) {
								//    //if (data.getHierarchyQualifiedReferenceSetsResp.hierarchyReferenceSet[h].HierarchyId == data.getHierarchyQualifiedReferenceSetsResp.PaginationResponse.HighLightedItemId) {
								//    gridStorage[0].highlightedPage = data.getHierarchyQualifiedReferenceSetsResp.PaginationResponse.HighLightedItemPage;
								//    var updatedGridStorage = JSON.stringify(gridStorage);
								//    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
								//    //}
								//    //}
								//}
							}
						} else {

							data.getHierarchyQualifiedReferenceSetsResp = new Object();
							data.getHierarchyQualifiedReferenceSetsResp.hierarchyReferenceSet = [];
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

		var rendered = function (element) {
			var retval = autho.checkRightsBYScreen('Global Operations', 'IsModifyAllowed');
			enablegridfunctions(gID, 'HierarchyId', element, gridStorage, true, 'pagerDivHierarchyAssignment', false, 0, 'HierarchyId', null, null, null);
			return true;
		}

		// click on view details open popup window 
		var detailsRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			return '<div style="padding-left:6px;padding-top:7px;cursor:pointer;"> <a title="Click to view Details"  id="imageId" tabindex="0" style="text-decoration:underline;" onClick="openPopupForHierarchyReference(' + row + ')" height="60" width="50" >View Details</a></div>'
		}

		// 
		var downloadEnableRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var dataValue;
			if (value == true) {
				dataValue = "Yes";
				return '<div style="padding-left:6px;padding-top:7px;cursor:pointer;">' + dataValue + '</div>'
			} else {
				dataValue = "No";
				return '<div style="padding-left:6px;padding-top:7px;cursor:pointer;">' + dataValue + '</div>'
			}
		}

		var buildFilterPanel = function (filterPanel, datafield) {
			genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
		}
		var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
			genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
		}

		gridColumns = [
			{
				text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false,
				datafield: 'isSelected', width: 40,
				renderer: function () {
					return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
				},
				rendered: rendered,
			},
			{
				text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 150, cellsrenderer: HierarchyPathRenderer,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('qualified_ref_sets', { lng: lang }), datafield: 'QualifiedReferenceSets', editable: false, minwidth: 150, hidden: true,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('direct_ref_sets', { lng: lang }), datafield: 'AssignedReferenceSets', editable: false, minwidth: 150, hidden: true,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanel(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('assign_type', { lng: lang }), datafield: 'AssignmentType', editable: false, minwidth: 120, enabletooltips: false,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Hierarchy Assignment Type');
				}
			},
			{
				text: i18n.t('auto_download_enabled', { lng: lang }), datafield: 'EnableAutoDownload', editable: false, minwidth: 160, enabletooltips: false, cellsrenderer: downloadEnableRenderer,
				filtertype: "custom", enabletooltips: false,
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Enable Automatic Download');
				}
			},
			{
				text: i18n.t('download_on', { lng: lang }), datafield: 'DownloadedOn', editable: false, minwidth: 160, enabletooltips: true,
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelMultiChoice(filterPanel, datafield, 'Download On');
				}
			},
			{
				text: i18n.t('attribute_Details', { lng: lang }), datafield: 'Details', editable: false, minwidth: 120, resizable: true, menu: false, sortable: false, filterable: false, cellsrenderer: detailsRenderer,
			},
		];
		gridColumns = setUserPreferencesColumns('HierarchyAssignment', userResizedColumns, gridColumns);

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
				enabletooltips: true,
				selectionmode: 'singlerow',
				theme: AppConstants.get('JQX-GRID-THEME'),
				rowsheight: 32,
				autoshowcolumnsmenubutton: false,
				autoshowfiltericon: true,
				columns: gridColumns,
				rendergridrows: function () {
					return dataAdapter.records;
				},
				ready: function () {
					callOnGridReady(gID, gridStorage);

					var columns = genericHideShowColumn(gID, true, ['Details']);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsList = koUtil.gridColumnList;
				}				
			});

		getGridBiginEdit(gID, 'HierarchyId', gridStorage);
		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'HierarchyId');

		// open popup on row double click
		//$("#" + gID).on('rowdoubleclick', function (event) {
		//    openPopup('modelEditHierarchyAssignment', 'jqxgridHierarchyAssignment');
		//});
	}

	// get data
	function getHierarchyAssignmentDetails(isExport, gID, columnSortFilterForHierarchyAssignment, visibleColumns) {

		var getHierarchyQualifiedReferenceSetsReq = new Object();
		var Export = new Object();
		var Pagination = new Object();
		var Selector = new Object();

		Export.DynamicColumns = null;
		Export.VisibleColumns = visibleColumns;

		if (isExport == true) {
			Export.IsAllSelected = false;
			Export.IsExport = true;
		} else {
			Export.IsAllSelected = false;
			Export.IsExport = false;
		}

		Pagination.HighLightedItemId = null
		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

		var selectedItems = getSelectedUniqueId(gID);
		var unselectedItems = getUnSelectedUniqueId(gID);
		var checkAll = checkAllSelected(gID);

		Selector.SelectedItemIds = selectedItems;
		Selector.UnSelectedItemIds = null;
		
		var ColumnSortFilter = columnSortFilterForHierarchyAssignment;

		getHierarchyQualifiedReferenceSetsReq.ColumnSortFilter = ColumnSortFilter;
		getHierarchyQualifiedReferenceSetsReq.Export = Export;
		getHierarchyQualifiedReferenceSetsReq.Pagination = Pagination;
		getHierarchyQualifiedReferenceSetsReq.Selector = Selector;
		var param = new Object();
		param.token = TOKEN();
		param.getHierarchyQualifiedReferenceSetsReq = getHierarchyQualifiedReferenceSetsReq;
		return param;
	};

});

function openPopupForHierarchyReference(row) {

	$("#modelPopupHierarchyAssignmentID").modal('show');

	var self = this;
	self.hierarchyID = $("#jqxgridHierarchyAssignment").jqxGrid('getcellvalue', row, 'HierarchyId');
	self.hierarchyPath = '';
	self.hierarchyPath = $("#jqxgridHierarchyAssignment").jqxGrid('getcellvalue', row, 'HierarchyFullPath');

	$("#hierarchyPath").empty();
	$("#hierarchyPath").append(self.hierarchyPath);
	$("#hierarchyPath").prop("title", self.hierarchyPath);

	//reset filter
	self.clearfilterModel = function (gID) {
		$("#" + gID).jqxGrid('clearselection');
		$("#" + gID).jqxGrid('updatebounddata');
		$('#' + gID).jqxGrid('clearselection');
	}

	// export to excel
	self.exportToExcelModel = function (gID) {
		var datainfo = $("#" + gID).jqxGrid('getdatainformation');
		if (datainfo.rowscount > 0) {
			exportjqxcsvData(gID, 'Hierarchy_RefereSet_Assignment_Details');
			openAlertpopup(1, 'export_Information');
		} else {
			openAlertpopup(1, 'no_data_to_export');
		}
	}

	//get model hierarchy data
	viewHierarchyReferenceSetDetails(self.hierarchyID);
	viewQualifiedHierarchyReferenceSetTemplates(self.hierarchyID);
	$('#viewHierarchyReferencesetData').click();
}

function modalSetJqxGridHierarchyAssignmentDetails(fileNameOnHierarchyAssignment, gID) {

	// prepare the data
	var source =
	{
		datatype: "json",
		localdata: fileNameOnHierarchyAssignment[0],
		root: 'HierarchyReferenceSetDetails',
		contentType: 'application/json',
		datafields: [
			{ name: 'SourceHierarchy', map: 'SourceHierarchy', type: 'string' },
			{ name: 'ReferenceSet', map: 'ReferenceSet', type: 'string' },
			{ name: 'AssignedPackages', map: 'AssignedPackages', type: 'string' },
			{ name: 'Models', map: 'Models', type: 'string' },
			{ name: 'MatchingCriteria', map: 'MatchingCriteria', type: 'string' },
		],

	};
	var dataAdapter = new $.jqx.dataAdapter(source);

	var buildFilterPanel = function (filterPanel, datafield) {
		wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
	}

	// create jqxgrid.
	$("#" + gID).jqxGrid(
		{
			width: "100%",
			source: dataAdapter,
			sortable: true,
			filterable: true,
			selectionmode: 'singlerow',
			theme: AppConstants.get('JQX-GRID-THEME'),
			altrows: true,
			pagesize: fileNameOnHierarchyAssignment.length,
			autoshowcolumnsmenubutton: false,
			showsortmenuitems: false,
			editable: true,
			rowsheight: 32,
			enabletooltips: true,
			columnsResize: true,
			columns: [
				{
					text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'SourceHierarchy', editable: false, minwidth: 130, cellsrenderer: HierarchyPathRenderer,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('referenceSet', { lng: lang }), datafield: 'ReferenceSet', editable: false, minwidth: 100,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('assigned_packages', { lng: lang }), datafield: 'AssignedPackages', sortable: false, filterable: false, menu: false, editable: false, minwidth: 120,
				},
				{
					text: i18n.t('rs_models', { lng: lang }), datafield: 'Models', sortable: false, filterable: false, menu: false, editable: false, minwidth: 90,
				},
				{
					text: i18n.t('matching_criteria', { lng: lang }), datafield: 'MatchingCriteria', editable: false, minwidth: 100, resizable: true,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
			]
		});
}

function modalSetJqxGridQualifiedParameterTemplateDetails(fileNameOnHierarchyAssignment, gID) {
	// prepare the data
	var source =
	{
		datatype: "json",
		localdata: fileNameOnHierarchyAssignment[0],
		root: 'HierarchyParameterTemplateDetails',
		contentType: 'application/json',
		datafields: [
			{ name: 'ParameterTemplateName', map: 'ParameterTemplateName', type: 'string' },
			{ name: 'HierarchyPath', map: 'HierarchyPath', type: 'string' },
			{ name: 'ReferenceSet', map: 'ReferenceSet', type: 'string' },
			{ name: 'Package', map: 'Package', type: 'string' },
			{ name: 'Application', map: 'Application', type: 'string' },
			{ name: 'Version', map: 'Version', type: 'string' },
		],

	};
	var dataAdapter = new $.jqx.dataAdapter(source);

	var buildFilterPanel = function (filterPanel, datafield) {
		wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
	}

	// create jqxgrid.
	$("#" + gID).jqxGrid(
		{
			width: "100%",
			source: dataAdapter,
			sortable: true,
			filterable: true,
			selectionmode: 'singlerow',
			theme: AppConstants.get('JQX-GRID-THEME'),
			altrows: true,
			pagesize: fileNameOnHierarchyAssignment.length,
			autoshowcolumnsmenubutton: false,
			showsortmenuitems: false,
			editable: true,
			rowsheight: 32,
			enabletooltips: true,
			columnsResize: true,
			columns: [
				{
					text: i18n.t('qpt_parametertemplatename', { lng: lang }), datafield: 'ParameterTemplateName', editable: false, minwidth: 100, cellsrenderer: HierarchyPathRenderer,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('qpt_hierarchypath', { lng: lang }), datafield: 'HierarchyPath', editable: false, width: 'auto', minwidth: 130,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('qpt_refereceset', { lng: lang }), datafield: 'ReferenceSet', sortable: false, filterable: false, menu: false, editable: false, width: 'auto', minwidth: 100,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('qpt_package', { lng: lang }), datafield: 'Package', sortable: false, filterable: false, menu: false, editable: false, width: 'auto', minwidth: 100,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('qpt_application', { lng: lang }), datafield: 'Application', editable: false, width: 'auto', minwidth: 100, resizable: true,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('qpt_version', { lng: lang }), datafield: 'Version', width: 'auto', minwidth: 60, editable: false, menu: false, sortable: false, filterable: false,
				},
			]
		});
}

function viewHierarchyReferenceSetDetails(hierarchyID) {
	var getHierarchyReferenceSetDetailsReq = new Object();
	var fileNameOnHierarchyAssignment = new Array();
	getHierarchyReferenceSetDetailsReq.HierarchyId = hierarchyID;
	getHierarchyReferenceSetDetailsReq.IsEdit = false;

	function callbackFunction(data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				if (data.getHierarchyReferenceSetDetailsResp)
					data.getHierarchyReferenceSetDetailsResp = $.parseJSON(data.getHierarchyReferenceSetDetailsResp);

				if (data.getHierarchyReferenceSetDetailsResp && data.getHierarchyReferenceSetDetailsResp.HierarchyReferenceSetDetails) {
					fileNameOnHierarchyAssignment.push(data.getHierarchyReferenceSetDetailsResp.HierarchyReferenceSetDetails);
					modalSetJqxGridHierarchyAssignmentDetails(fileNameOnHierarchyAssignment, 'jqxGridModalHierarchyAssignment');
					//clearUiGridFilter('jqxGridModalHierarchyAssignment');
				} else {
					modalSetJqxGridHierarchyAssignmentDetails([], 'jqxGridModalHierarchyAssignment');
				}
			} else if (data.responseStatus.StatusCode == AppConstants.get('SYSTEM_BUSY')) {
				openAlertpopup(2, 'system_busy_try_again');
			} else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
				Token_Expired();
			} else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHY_LIMIT_EXCEEDED')) {
				fileNameOnHierarchyAssignment = new Array();
				modalSetJqxGridHierarchyAssignmentDetails(fileNameOnHierarchyAssignment, 'jqxGridModalHierarchyAssignment');
				openAlertpopup(1, data.responseStatus.StatusMessage);
				//clearUiGridFilter('jqxGridModalHierarchyAssignment');                
			}
		}
	}

	var method = 'GetHierarchyReferenceSetDetails';
	var params = '{"token":"' + TOKEN() + '","getHierarchyReferenceSetDetailsReq":' + JSON.stringify(getHierarchyReferenceSetDetailsReq) + '}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}
function viewQualifiedHierarchyReferenceSetTemplates(hierarchyID) {
	var getHierarchyParameterTemplateDetailsReq = new Object();
	var fileNameOnHierarchyAssignment = new Array();
	getHierarchyParameterTemplateDetailsReq.HierarchyId = hierarchyID;
	getHierarchyParameterTemplateDetailsReq.IsEdit = false;

	function callbackFunction(data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				if (data.qualifiedHierarchyReferenceSetTemplatesResp)
					data.qualifiedHierarchyReferenceSetTemplatesResp = $.parseJSON(data.qualifiedHierarchyReferenceSetTemplatesResp);

				if (data.qualifiedHierarchyReferenceSetTemplatesResp && data.qualifiedHierarchyReferenceSetTemplatesResp) {
					data.qualifiedHierarchyReferenceSetTemplatesResp.HierarchyParameterTemplateDetails = data.qualifiedHierarchyReferenceSetTemplatesResp;
					fileNameOnHierarchyAssignment.push(data.qualifiedHierarchyReferenceSetTemplatesResp.HierarchyParameterTemplateDetails);
					modalSetJqxGridQualifiedParameterTemplateDetails(fileNameOnHierarchyAssignment, 'qualifiedParamenterTemplateDetailsGrid');
				} else {
					modalSetJqxGridQualifiedParameterTemplateDetails([], 'qualifiedParamenterTemplateDetailsGrid');
				}
			} else if (data.responseStatus.StatusCode == AppConstants.get('SYSTEM_BUSY')) {
				openAlertpopup(2, 'system_busy_try_again');
			} else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
				Token_Expired();
			} else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHY_LIMIT_EXCEEDED')) {
				modalSetJqxGridQualifiedParameterTemplateDetails([], 'jqxGridModalRSHAssignment');
				openAlertpopup(1, data.responseStatus.StatusMessage);
			}
		}
	}

	var method = 'GetQualifiedHierarchyReferenceSetTemplates';
	var params = '{"token":"' + TOKEN() + '","qualifiedHierarchyReferenceSetTemplatesReq":' + JSON.stringify(getHierarchyParameterTemplateDetailsReq) + '}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}