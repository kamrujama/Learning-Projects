define(["knockout", "koUtil", "autho", "spinner"], function (ko, koUtil, autho) {
	var lang = getSysLang();

	return function sponsorsViewModel() {

		var self = this;
		columnSortFilterForSponsors = new Object();
		koUtil.GlobalColumnFilter = new Array();

		$('#btnRefreshSponsors').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btnRefreshSponsors').click();
			}
		});

		$('#btnAddSponsors').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btnAddSponsors').click();
			}
		});

		$('#btnDeleteSponsors').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btnDeleteSponsors').click();
			}
		});

		$('#btnResetSponsors').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btnResetSponsors').click();
			}
		});


		//-------------------------------------------------------------FOCUS ON CONFO POP UP-----------------------------------------------
		$('#deleteSponsorsDiv').on('shown.bs.modal', function (e) {
			$('#btnDeleteSponsors_No').focus();

		});
		$('#deleteSponsorsDiv').keydown(function (e) {
			if ($('#btnDeleteSponsors_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#btnDeleteSponsors_Yes').focus();
			}
		});
		//------------------------------------------------------------------------------------------------------------------------

		//Check rights
		self.retval = false;
		self.sponsors = ko.observableArray();
		self.templateFlag = ko.observable(false);
		self.observableModelPopup = ko.observable();

		var modelname = 'unloadTemplate';
		loadelement(modelname, 'genericPopup');

		self.checkRights = function (screenName, right) {
			var retval = autho.checkRightsBYScreen(screenName, right);
			return retval;
		}

		setMenuSelection();

		//TODO: need to check this
		self.openPopup = function (popupName, gId) {
			self.templateFlag(true);
			if (popupName == "modelAddSponsor") {
				loadelement(popupName, 'administration');
				$('#modelAddSponsorDiv').modal('show');
				$('#addFileNameID').on('shown.bs.modal', function () {
					$('#txtSponsorName').focus();
				});
			}
		}

		self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
            $('#modelAddSponsorDiv').modal('hide');
		}

		//Load grid of uesrs
		var param = getSponsorsParameters(false, columnSortFilterForSponsors, null, null, 0, []);
		sponsorsGrid('jqxgridSponsors', param);

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
			var param = getSponsorsParameters(true, columnSortFilterForSponsors, selecteItemIds, unSelectedItemIds, checkAll, visibleColumnsList);

			var datainfo = $("#" + gId).jqxGrid('getdatainformation');
			if (datainfo.rowscount > 0) {
				sponsorsExport(param, gId, self.openPopup);
			} else {
				openAlertpopup(1, 'no_data_to_export');
			}
		}

		function sponsorsExport(param, gId, openPopup) {
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(1, 'export_Sucess');
					}
				}
			}
			var method = 'GetSponsors';
			var params = JSON.stringify(param);
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		///Getting parameter of Users
		function getSponsorsParameters(isExport, columnSortFilterForSponsors, selectedTagItems, unselectedTagItems, checkAll, visibleColumns) {
			var getSponsorsReq = new Object();
			var Export = new Object();
			var Selector = new Object();
			var Pagination = new Object();

			Pagination.HighLightedItemId = null;
			Pagination.PageNumber = 1;
			Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
			Export.DynamicColumns = null;
			Export.VisibleColumns = visibleColumns;
			if (checkAll == 1) {
				Selector.SelectedItemIds = null;
				Selector.UnSelectedItemIds = unselectedTagItems;
				if (isExport == true) {
					Export.IsAllSelected = true;
					Export.IsExport = true;
				} else {
					Export.IsAllSelected = false;
					Export.IsExport = false;
				}
			} else {
				Selector.SelectedItemIds = selectedTagItems;
				Selector.UnSelectedItemIds = null;
				if (isExport == true) {
					Export.IsAllSelected = false;
					Export.IsExport = true;
				} else {
					Export.IsAllSelected = false;
					Export.IsExport = false;
				}
			}

			var ColumnSortFilter = columnSortFilterForSponsors;
			var FilterList = new Array();
			var coulmnfilter = new Object();
			coulmnfilter.FilterColumn = null;
			coulmnfilter.FilterValue = null;
			FilterList.push(coulmnfilter);
			getSponsorsReq.Pagination = Pagination;
			getSponsorsReq.ColumnSortFilter = ColumnSortFilter;
			getSponsorsReq.Export = Export;
			getSponsorsReq.Selector = Selector;
			var param = new Object();
			param.token = TOKEN();
			param.getSponsorsReq = getSponsorsReq;
			return param;
		}

		self.deleteSponsorsConfirmation = function (gId) {
			var selectedData = getMultiSelectedData(gId);
			var checkAll = checkAllSelected(gId);
			if (checkAll == 1) {
				$('#deleteSponsorsDiv').modal('show');
				$("#deleteSponsorsText").text(i18n.t('delete_multiple_sponsors', { lng: lang }));
			} else {
				if (selectedData.length == 1) {
					var sponsorName = selectedData[0].SponsorName;
					$('#deleteSponsorsDiv').modal('show');
					$("#deleteSponsorsText").text(i18n.t('delete_single_sponsor', { sponsorName: sponsorName }, { lng: lang }));
				} else if (selectedData.length > 1) {
					$('#deleteSponsorsDiv').modal('show');
					$("#deleteSponsorsText").text(i18n.t('delete_multiple_sponsors', { lng: lang }));
				} else {
					openAlertpopup(1, 'please_select_a_sponsor');
				}
			}
		}

		self.deleteSponsors = function (gId) {
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

			deleteSponsors(gId, self.sponsors, Selector);
		}

		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopup(elementname);
		}

		seti18nResourceData(document, resourceStorage);
	};

	function deleteSponsors(gId, sponsors, selector) {

		var deleteSponsorsReq = new Object();
		deleteSponsorsReq.Selector = selector;
		deleteSponsorsReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					gridRefreshClearSelection(gId);
					openAlertpopup(0, 'sponsors_delete_success');
				}
			}
		}

		var method = 'DeleteSponsors';
		var params = '{"token":"' + TOKEN() + '","deleteSponsorsReq":' + JSON.stringify(deleteSponsorsReq) + '}';
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

	function sponsorsGrid(gID, param) {
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
			//localdata: SponsorsList,
			datafields: [
				{ name: 'isSelected', type: 'number' },
				{ name: 'SponsorId', map: 'SponsorId' },
				{ name: 'SponsorName', map: 'SponsorName' },
				{ name: 'Platform', map: 'Platform' },
				{ name: 'CreatedBy', map: 'CreatedByUserName' },
				{ name: 'CreatedOn', map: 'CreatedOn', type: 'date' }
			],
			root: 'SponsorsList',
			type: "POST",
			data: param,
			url: AppConstants.get('API_URL') + "/GetSponsors",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data && data.getSponsorsResp) {
					data.getSponsorsResp = $.parseJSON(data.getSponsorsResp);
				}
				else
					data.getSponsorsResp = [];

				if (data.getSponsorsResp && data.getSponsorsResp.PaginationResponse) {
					source.totalrecords = data.getSponsorsResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getSponsorsResp.PaginationResponse.TotalPages;
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
					columnSortFilter = new Object();
					columnSortFilter = columnSortFilterFormatedData(columnSortFilterForSponsors, gID, gridStorage, 'Sponsors');
					param.getSponsorsReq.ColumnSortFilter = columnSortFilter;
					koUtil.GlobalColumnFilter = columnSortFilter;
					param.getSponsorsReq.Pagination = getPaginationObject(param.getSponsorsReq.Pagination, gID);

					updatepaginationOnState(gID, gridStorage, param.getSponsorsReq.Pagination, null, null);

					data = JSON.stringify(param);
					return data;
				},
				downloadComplete: function (data, status, xhr) {
					enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

					if (data.getSponsorsResp && data.getSponsorsResp.SponsorsList) {
						for (var i = 0; i < data.getSponsorsResp.SponsorsList.length; i++) {
							data.getSponsorsResp.SponsorsList[i].CreatedOn = convertToLocaltimestamp(data.getSponsorsResp.SponsorsList[i].CreatedOn);
							data.getSponsorsResp.SponsorsList[i].ModifiedOn = convertToLocaltimestamp(data.getSponsorsResp.SponsorsList[i].ModifiedOn);
						}
					} else {
						source.totalrecords = 0;
						source.totalpages = 0;
						data.getSponsorsResp = new Object();
						data.getSponsorsResp.SponsorsList = [];

					}
					$('.all-disabled').hide();
				},
				loadError: function (jqXHR, status, error) {
					$('.all-disabled').hide();
				}
			}
		);

		var rendered = function (element) {
			enablegridfunctions(gID, 'SponsorId', element, gridStorage, true, 'pagerDivSponsors', false, 0, 'SponsorId', null, null, null);
			return true;
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
						text: i18n.t('sponsor_name', { lng: lang }), datafield: 'SponsorName', editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('platform', { lng: lang }), datafield: 'Platform', editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('created_by', { lng: lang }), datafield: 'CreatedBy', editable: false, filterable: false, sortable: false, menu: false
					},
					{
						text: i18n.t('createdOn', { lng: lang }), datafield: 'CreatedOn', cellsformat: LONG_DATETIME_GRID_FORMAT,
						editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanelDate(filterPanel, datafield);
						}
					}
				]
			});

		getGridBiginEdit(gID, 'SponsorId', gridStorage);
		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'SponsorId');
	}
});