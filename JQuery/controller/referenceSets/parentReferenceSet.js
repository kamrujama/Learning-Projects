define(["knockout", "koUtil", "autho", "spinner"], function (ko, koUtil, autho) {
	var lang = getSysLang();
	columnSortFilterForParentReferenceSets = new Object();

	return function parentReferenceSetViewModel() {

		var self = this;

		$('#btnRefreshParentReferenceSets').bind('keyup', function (e) {
			if (e.keyCode === 13) {     //enter key
				$('#btnRefreshParentReferenceSets').click();
			}
		});

		$('#btnAddParentReferenceSets').bind('keyup', function (e) {
			if (e.keyCode === 13) {     //enter key
				$('#btnAddParentReferenceSets').click();
			}
		});

		$('#btnDeleteParentReferenceSets').bind('keyup', function (e) {
			if (e.keyCode === 13) {     //enter key
				$('#btnDeleteParentReferenceSets').click();
			}
		});

		$('#btnResetParentReferenceSets').bind('keyup', function (e) {
			if (e.keyCode === 13) {     //enter key
				$('#btnResetParentReferenceSets').click();
			}
		});


		//-------------------------------------------------------------FOCUS ON CONFIRMATION POP UP-----------------------------------------------
		$('#deleteParentReferenceSetsDiv').on('shown.bs.modal', function (e) {
			$('#btnDeleteParentReferenceSets_No').focus();

		});
		$('#deleteParentReferenceSetsDiv').keydown(function (e) {
			if ($('#btnDeleteParentReferenceSets_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#btnDeleteParentReferenceSets_Yes').focus();
			}
		});
		//------------------------------------------------------------------------------------------------------------------------

		//Check rights
		self.retval = false;
		self.parentReferenceSets = ko.observableArray();
		self.templateFlag = ko.observable(false);
		self.observableModelPopup = ko.observable();
		var modelname = 'unloadTemplate';
		loadelement(modelname, 'genericPopup');

		function checkRights() {
			self.retval = autho.checkRightsBYScreen('Advanced Software Management', 'IsModifyAllowed');
			return self.retval;
		}

		self.openPopup = function (popupName, gId) {
			self.templateFlag(true);
			if (popupName == "modalAddParentReferenceSet") {
				loadelement(popupName, 'referenceSets');
				$('#modalParentReferenceSet').modal('show');
				$('#modalParentReferenceSet').on('shown.bs.modal', function () {
					$('#txtParentReferenceSetName').focus();
				});
			} else if (popupName == "modalEditParentReferenceSet") {
				var selecteItemIds = getSelectedUniqueId('jqxgridParentReferenceSets');
				var checkAll = checkAllSelected('jqxgridParentReferenceSets');
				var unSelecteItemIds = getUnSelectedUniqueId('jqxgridParentReferenceSets');
				var datacount = getTotalRowcount('jqxgridParentReferenceSets');
				if (checkAll == 1) {
					if (!_.isEmpty(unSelecteItemIds) && unSelecteItemIds.length > datacount - 1) {
						openAlertpopup(1, 'please_select_a_single_sub_status_to_edit');
						return;
					}
				} else {
					if (!_.isEmpty(selecteItemIds) && selecteItemIds.length == 0) {
						openAlertpopup(1, 'please_select_a_parent_reference_set_to_edit');
						return;
					} else if (!_.isEmpty(selecteItemIds) && selecteItemIds.length > 1) {
						openAlertpopup(1, 'please_select_a_single_parent_reference_set_to_edit');
						return;
					}
				}

				loadelement(popupName, 'referenceSets');
				$('#modalParentReferenceSet').modal('show');
				$('#modalParentReferenceSet').on('shown.bs.modal', function () {
					$('#txtAreaEditParentRFSDescription').focus();
				});
				setSelectedParentReferenceSetDetails('jqxgridParentReferenceSets');
			} else if (popupName == "modalParentReferenceSetDetails") {				
				setSelectedParentReferenceSetDetails('jqxgridParentReferenceSets');
				globalSelectedParentReferenceSetDetails = [];
				loadelement(popupName, 'referenceSets');
				$('#modalParentReferenceSet').modal('show');
			}
		}

		self.unloadTempPopup = function (popupName) {
			self.observableModelPopup('unloadTemplate');
			$('#modalParentReferenceSet').modal('hide');
		}

		self.clearFilter = function (gId) {
			gridFilterClear(gId);
		}

		self.refreshGrid = function (gId) {
			gridRefresh(gId);
		}

		self.exportToExcel = function (gId) {
			var selecteItemIds = getSelectedUniqueId(gId);
			var unSelectedItemIds = getUnSelectedUniqueId(gId);
			var checkAll = checkAllSelected(gId);
			visibleColumnsList = GetExportVisibleColumn(gId);
			var param = getParentReferenceSetsParameters(true, columnSortFilterForParentReferenceSets, selecteItemIds, unSelectedItemIds, checkAll, visibleColumnsList);

			var datainfo = $("#" + gId).jqxGrid('getdatainformation');
			if (!_.isEmpty(datainfo) && datainfo.rowscount > 0) {
				parentReferenceSetsExport(param);
			} else {
				openAlertpopup(1, 'no_data_to_export');
			}
		}

		init();
		function init() {
			setMenuSelection();
			checkRights();
			var param = getParentReferenceSetsParameters(false, columnSortFilterForParentReferenceSets, null, null, 0, []);
			parentReferenceSetsGrid('jqxgridParentReferenceSets', param, self.openPopup);
		}

		function parentReferenceSetsExport(param) {
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(1, 'export_Sucess');
					}
				}
			}
			var method = 'GetParentReferenceSet';
			var params = JSON.stringify(param);
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		///Getting parameter of Users
		function getParentReferenceSetsParameters(isExport, columnSortFilterForParentReferenceSets, selectedItems, unselectedItems, checkAll, visibleColumns) {
			var getParentReferenceSetParametersReq = new Object();
			var Export = new Object();
			var Selector = new Object();
			var Pagination = new Object();

			Pagination.HighLightedItemId = null
			Pagination.PageNumber = 1;
			Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
			Export.DynamicColumns = null;
			Export.VisibleColumns = visibleColumns;
			if (checkAll == 1) {
				Selector.SelectedItemIds = null;
				Selector.UnSelectedItemIds = unselectedItems;
				if (isExport == true) {
					Export.IsAllSelected = true;
					Export.IsExport = true;
				} else {
					Export.IsAllSelected = false;
					Export.IsExport = false;
				}
			} else {
				Selector.SelectedItemIds = selectedItems;
				Selector.UnSelectedItemIds = null;
				if (isExport == true) {
					Export.IsAllSelected = false;
					Export.IsExport = true;
				} else {
					Export.IsAllSelected = false;
					Export.IsExport = false;
				}
			}

			var columnSortFilter = columnSortFilterForParentReferenceSets;
			getParentReferenceSetParametersReq.Pagination = Pagination;
			getParentReferenceSetParametersReq.ColumnSortFilter = columnSortFilter;
			getParentReferenceSetParametersReq.Export = Export;
			getParentReferenceSetParametersReq.Selector = Selector;
			var param = new Object();
			param.token = TOKEN();
			param.getParentReferenceSetReq = getParentReferenceSetParametersReq;
			return param;
		}

		function setSelectedParentReferenceSetDetails(gId) {
			var selectedData = getMultiSelectedData(gId);
			if (!_.isEmpty(selectedData) && selectedData.length > 0) {
				globalSelectedParentReferenceSet = new Object();
				globalSelectedParentReferenceSet.SelectedParentRFSId = selectedData[i].ID;
				globalSelectedParentReferenceSet.SelectedParentRFSName = selectedData[i].Name;
				globalSelectedParentReferenceSet.SelectedParentRFSDescription = selectedData[i].Description;
				globalSelectedParentReferenceSet.gId = gId;
			}
		}

		self.deleteParentReferenceSetsConfirmation = function (gId) {
			var selectedData = getMultiSelectedData(gId);
			var checkAll = checkAllSelected(gId);
			if (checkAll == 1) {
				$('#deleteParentReferenceSetsDiv').modal('show');
				$("#deleteParentReferenceSetsText").text(i18n.t('delete_multiple_parent_reference_sets', { lng: lang }));
			} else {
				if (!_.isEmpty(selectedData) && selectedData.length == 1) {
					var parentReferenceSetName = selectedData[0].Name;
					$('#deleteParentReferenceSetsDiv').modal('show');
					$("#deleteParentReferenceSetsText").text(i18n.t('delete_single_parent_reference_set', { parentReferenceSetName: parentReferenceSetName }, { lng: lang }));
				} else if (!_.isEmpty(selectedData) && selectedData.length > 1) {
					$('#deleteParentReferenceSetsDiv').modal('show');
					$("#deleteParentReferenceSetsText").text(i18n.t('delete_multiple_parent_reference_sets', { lng: lang }));
				} else {
					openAlertpopup(1, 'please_select_a_parent_reference_set');
				}
			}
		}

		self.deleteParentReferenceSets = function (gId) {
			var selecteItemIds = getSelectedUniqueId(gId);
			var unSelectedItemIds = getUnSelectedUniqueId(gId);
			var checkAll = checkAllSelected(gId);

			var Selector = new Object();
			if (checkAll == 1) {
				Selector.SelectedItemIds = null;
				Selector.UnSelectedItemIds = unSelectedItemIds;
			} else {
				Selector.SelectedItemIds = selecteItemIds;
				Selector.UnSelectedItemIds = null;
			}

			deleteParentReferenceSets(gId, self.parentReferenceSets, Selector, checkAll);
		}

		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopup(elementname);
		}

		seti18nResourceData(document, resourceStorage);
	};

	function deleteParentReferenceSets(gId, parentReferenceSets, selector, checkAll) {

		var deleteParentReferenceSetReq = new Object();
		deleteParentReferenceSetReq.Selector = selector;
		deleteParentReferenceSetReq.IsAllSelected = false;
		if (checkAll == 1) {
			deleteParentReferenceSetReq.IsAllSelected = true;
		}

		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					gridRefreshClearSelection(gId);
					openAlertpopup(0, 'parent_reference_set_delete_success');
				}
				else if (data.responseStatus.StatusCode == AppConstants.get('EX_PARENT_REFERENCESET_MAPPED')) {
					openAlertpopup(1, 'parent_reference_delete_mapped');
				}
			}
		}

		var method = 'DeleteParentReferenceSet';
		var params = '{"token":"' + TOKEN() + '","deleteParentReferenceSetReq":' + JSON.stringify(deleteParentReferenceSetReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}

	function generateTemplate(tempname, controllerId) {
		var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
		var viewName = 'controller/' + controllerId + '/' + tempname + '.js';
		ko.components.register(tempname, {
			viewModel: { require: viewName },
			template: { require: 'plugin/text!' + htmlName }
		});
	}

	function parentReferenceSetsGrid(gID, param, openPopup) {
		var gridheight = $(window).height();
		var percentValue;
		if (gridheight > 600) {
			percentValue = (25 / 100) * gridheight;
			gridheight = gridheight - 150;
			gridheight = gridheight - percentValue + 'px';
		} else {
			gridheight = '400px';
		}

		var InitGridStoragObj = initGridStorageObj(gID);
		var gridStorage = InitGridStoragObj.gridStorage;
		var source =
		{
			dataType: "json",
			datafields: [
				{ name: 'isSelected', type: 'number' },
				{ name: 'ID', map: 'ID' },
				{ name: 'Name', map: 'Name' },
				{ name: 'Description', map: 'Description' },
				{ name: 'CreatedBy', map: 'CreatedByUserName' },
				{ name: 'CreatedOn', map: 'CreatedOn', type: 'date' },
				{ name: 'ModifiedOn', map: 'ModifiedOn', type: 'date' },
				{ name: 'ModifiedByUserName', map: 'ModifiedByUserName' }
			],
			root: 'ParentReferenceSets',
			type: "POST",
			data: param,
			url: AppConstants.get('API_URL') + "/GetParentReferenceSet",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data && data.getParentReferenceSetResp) {
					data.getParentReferenceSetResp = $.parseJSON(data.getParentReferenceSetResp);
				}
				else
					data.getParentReferenceSetResp = [];

				if (data.getParentReferenceSetResp && data.getParentReferenceSetResp.PaginationResponse) {
					source.totalrecords = data.getParentReferenceSetResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getParentReferenceSetResp.PaginationResponse.TotalPages;
				} else {
					source.totalrecords = 0;
					source.totalpages = 0;

				}
			},
		};
		var dataAdapter = new $.jqx.dataAdapter(source,
			{
				formatData: function (data) {
					$('.all-disabled').show();
					disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
					var columnSortFilter = new Object();
					columnSortFilter = columnSortFilterFormatedData(columnSortFilterForParentReferenceSets, gID, gridStorage, 'ParentReferenceSet');
					param.getParentReferenceSetReq.ColumnSortFilter = columnSortFilter;
					koUtil.GlobalColumnFilter = columnSortFilter;
					param.getParentReferenceSetReq.Pagination = getPaginationObject(param.getParentReferenceSetReq.Pagination, gID);

					updatepaginationOnState(gID, gridStorage, param.getParentReferenceSetReq.Pagination, null, null);

					data = JSON.stringify(param);
					return data;
				},
				downloadComplete: function (data, status, xhr) {
					enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

					if (data.getParentReferenceSetResp && data.getParentReferenceSetResp.ParentReferenceSets) {
						for (var i = 0; i < data.getParentReferenceSetResp.ParentReferenceSets.length; i++) {
							data.getParentReferenceSetResp.ParentReferenceSets[i].CreatedOn = convertToLocaltimestamp(data.getParentReferenceSetResp.ParentReferenceSets[i].CreatedOn);
							data.getParentReferenceSetResp.ParentReferenceSets[i].ModifiedOn = convertToLocaltimestamp(data.getParentReferenceSetResp.ParentReferenceSets[i].ModifiedOn);
						}
					} else {
						source.totalrecords = 0;
						source.totalpages = 0;
						data.getParentReferenceSetResp = new Object();
						data.getParentReferenceSetResp.ParentReferenceSets = [];

					}
					$('.all-disabled').hide();
				},
				loadError: function (jqXHR, status, error) {
					$('.all-disabled').hide();
				}
			}
		);

		var rendered = function (element) {
			enablegridfunctions(gID, 'ID', element, gridStorage, true, 'pagerDivjqxgridParentReferenceSets', false, 0, 'ID', null, null, null);
			return true;
		}

		var detailsRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			return '<div style="padding-left:6px;padding-top:7px;cursor:pointer;"> <a title="Click to view Details" tabindex="0" style="text-decoration:underline;" height="60" width="50" >View Details</a></div>'
		}

		//Custom filter
		var buildFilterPanel = function (filterPanel, datafield) {
			genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
		}
		var buildFilterPanelDate = function (filterPanel, datafield) {
			genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);
		}

		$("#" + gID).jqxGrid(
			{
				height: gridHeightFunction(gID),
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
				rendergridrows: function () {
					return dataAdapter.records;
				},
				ready: function () {
					callOnGridReady(gID, gridStorage);

					var columns = genericHideShowColumn(gID, true, []);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsList = koUtil.gridColumnList;
				},
				autoshowfiltericon: true,
				columns: [
					{
						text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
						datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
							return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
						}, rendered: rendered
					},
					{
						text: i18n.t('parent_reference_set_name', { lng: lang }), datafield: 'Name', editable: false, width: 350,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('description', { lng: lang }), datafield: 'Description', editable: false, width: 350,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('p_t_copy_modifiedon', { lng: lang }), datafield: 'ModifiedOn', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, width: 'auto',
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanelDate(filterPanel, datafield);
						}
					},
					{ text: i18n.t('p_t_copy_modifiedby', { lng: lang }), datafield: 'ModifiedByUserName', editable: false, minwidth: 150, menu: false, sortable: false, filterable: false, },
					{
						text: i18n.t('attribute_Details', { lng: lang }), datafield: 'Details', editable: false, minwidth: 120, resizable: true, menu: false, sortable: false, filterable: false, cellsrenderer: detailsRenderer,
					}
				]
			});

		getGridBiginEdit(gID, 'ID', gridStorage);
		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'ID');

		$("#" + gID).on("cellclick", function (event) {
			var column = event.args.column;
			var rowindex = event.args.rowindex;
			var columnindex = event.args.columnindex;
			var rowData = $("#" + gID).jqxGrid('getrowdata', rowindex);
			if (event.args.datafield == 'Details') {
				if (!_.isEmpty(rowData)) {
					globalSelectedParentReferenceSet = new Object();
					globalSelectedParentReferenceSet.SelectedParentRFSId = rowData.ID;
					globalSelectedParentReferenceSet.SelectedParentRFSName = rowData.Name;
					globalSelectedParentReferenceSet.SelectedParentRFSDescription = rowData.Description;
					globalSelectedParentReferenceSet.gId = gID;
				}
				openPopup('modalParentReferenceSetDetails');
			}
		});
	}
});