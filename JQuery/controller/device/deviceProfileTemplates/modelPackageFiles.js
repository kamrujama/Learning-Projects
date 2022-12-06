var selectedPackage = new Object();

define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
	var lang = getSysLang();
	columnSortFilter = new Object();

	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	return function packageFilesViewModel() {

		var self = this;

		$('#modelPackageFileHeader').mouseup(function () {
			$("#modelPackageFile").draggable({ disabled: true });
		});

		$('#modelPackageFileHeader').mousedown(function () {
			$("#modelPackageFile").draggable({ disabled: false });
		});

		self.observableModelPopupFiles = ko.observable();

		//----disbale buttons---
		$("#btnSavePackageFile").addClass('disabled');
		selectedPackage = new Object();
		var modelname = 'unloadTemplate';
		loadelement(modelname, 'genericPopup');

		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopupFiles(elementname);
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

		self.clearFilter = function (gID) {
			gridFilterClear(gID);
			$('#' + gID).jqxGrid('clearselection');
			columnGroupClickLinkGridStyle(gID);
		}

		self.savePackageFile = function (observableModelPopupFiles, checkFileValue) {
			koUtil.parameterPackageId = selectedPackage.PackageId;
			observableModelPopupFiles('unloadTemplate');
			if (koUtil.currentScreen == 'DeviceProfileAddInstance') {
				$("#addInstanceFilesModel").modal('hide');
			} else if (koUtil.currentScreen == 'DeviceProfileEditParameters') {
				$("#filesModel").modal('hide');
			} else if (koUtil.currentScreen == 'DeviceSearchEditParameters') {
				$("#globalEditFilesModel").modal('hide');
			} else if (koUtil.currentScreen == 'ParametersAcrossAllInstances') {
				$("#allInstancesFilesModel").modal('hide');
			} else if (koUtil.currentScreen == 'TemplateAddInstance') {
				$("#addTemplateInstanceFilesModel").modal('hide');
			} else if (koUtil.currentScreen == 'TemplateEditInstance') {
				$("#modelAddAppLevelInstance").modal('hide');
			}

			if (koUtil.currentScreen != 'ParametersAcrossAllInstances') {
				checkFileValue();
			}
		}

		if (koUtil.isParameterTypeContent() == false) {
			var param = getPackagesParam(columnSortFilter, 1);
		} else {
			var param = getPackagesParam(columnSortFilter, 2);
		}
		softwarePackagesGrid('jqxgridPackageFiles', param);

		function softwarePackagesGrid(gID, param) {

			var InitGridStoragObj = initGridStorageObj(gID);
			var gridStorage = InitGridStoragObj.gridStorage;

			var gridheight = $(window).height();
			var percentValue;
			if (gridheight > 600) {
				percentValue = (20 / 100) * gridheight;
				gridheight = gridheight - 150;
				gridheight = gridheight - percentValue + 'px';
			} else {
				gridheight = '400px';
			}

			var source =
			{
				dataType: "json",
				dataFields: [
					{ name: 'isSelected', type: 'number' },
					{ name: 'PackageId', map: 'PackageId' },
					{ name: 'PackageName', map: 'PackageName' },
					{ name: 'FolderName', map: 'Folder>FolderName' },
					{ name: 'FileName', map: 'FileName' },
					{ name: 'FileSizeInMB', map: 'FileSizeInMB' },
					{ name: 'FileType', map: 'FileType' },
					{ name: 'FileVersion', map: 'FileVersion' },
					{ name: 'PackageMode', map: 'PackageMode' },
					{ name: 'Tags', map: 'Tags' },
					{ name: 'ThumbnailLocationURL', map: 'ThumbnailLocationURL' }
				],
				root: 'Packages',
				type: "POST",
				data: param,

				url: AppConstants.get('API_URL') + "/GetPackages",
				contentType: 'application/json',
				beforeprocessing: function (data) {
					if (data.getPackagesResp && data)
						data.getPackagesResp = $.parseJSON(data.getPackagesResp);
					else
						data.getPackagesResp = [];

					if (data.getPackagesResp && data.getPackagesResp.PaginationResponse) {
						source.totalrecords = data.getPackagesResp.PaginationResponse.TotalRecords;
						source.totalpages = data.getPackagesResp.PaginationResponse.TotalPages;
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
						columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'DownloadLibrary');

						koUtil.GlobalColumnFilter = columnSortFilter;

						param.getPackagesReq.ColumnSortFilter = columnSortFilter;
						param.getPackagesReq.Pagination = getPaginationObject(param.getPackagesReq.Pagination, gID);

						updatepaginationOnState(gID, gridStorage, param.getPackagesReq.Pagination, null, null);

						data = JSON.stringify(param);
						return data;
					},
					downloadComplete: function (data, status, xhr) {
						enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

						if (data) {
							if (data && data.getPackagesResp && _.isEmpty(data.getPackagesResp.Packages)) {
								source.totalrecords = 0;
								source.totalpages = 0;
								data.getPackagesResp = new Object();
								data.getPackagesResp.Packages = [];
							}
						} else {
							source.totalrecords = 0;
							source.totalpages = 0;
							data.getPackagesResp = new Object();
							data.getPackagesResp.Packages = [];
						}
						$('.all-disabled').hide();
					},
					loadError: function (jqXHR, status, error) {
						$('.all-disabled').hide();
						openAlertpopup(2, 'network_error');
					}
				}
			);

			var selectRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
				var packageId = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageId');
				var packageName = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageName');
				var selectedpackageId = $("#jqxgridPackageFiles").jqxGrid('getcellvalue', row, 'isSelected');
				var selectedPackageName = !_.isEmpty(selectedPackage) ? selectedPackage.PackageName : '';				
				
				if (selectedpackageId === 1 || (packageName === selectedPackageName))
					html = '<div style="margin-left: 10px; margin-top: 5px;"><input id="packageFile' + packageId + '"  name="radioOptions" type="radio" checked="true" onClick="getSelectedPackageFile(' + row + ', event)" value="1"></div>';
				else
					html = '<div style="margin-left: 10px; margin-top: 5px;"><input id="packageFile' + packageId + '"  name="radioOptions" type="radio" onClick="getSelectedPackageFile(' + row + ', event)" value="0"></div>';
				return html;
			}

			var rendered = function (element) {
				enablegridfunctions(gID, 'PackageId', element, gridStorage, true, 'pagerDivPackageFiles', false, 0, 'PackageId', null, null, null);
				$('.jqx-grid-pager').css("display", "none", "important");
				return true;
			}

			var imagerenderer = function (row, datafield, value) {
				var selectedFileName = $("#" + gID).jqxGrid('getcellvalue', row, "FileName");
				if (selectedFileName) {
					var fileExt = selectedFileName.split('.').pop();
					if (fileExt == "mp3" || fileExt == "wav" || fileExt == "eet" || fileExt == "frm" || fileExt == "tgz") {
						return '<img id="imageId" style="margin-left: 5px; width:50px; height:32px" src="assets/images/no_image.jpg"/>';
					} else {
						return '<img id="imageId" style="margin-left: 5px; width:50px; height:32px" src="' + value + '"/>';
					}
				}
			}

			var enableDownloadAutomation = function (row, columnfield, value, defaulthtml, columnproperties) {
				if (value == true) {
					return '<div style="padding-left:5x;padding-top:7px">Allowed</div>';
				} else {
					return '<div style="padding-left:5x;padding-top:7px">Not Allowed</div>';
				}
			}

			var buildFilterPanel = function (filterPanel, datafield) {
				genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
			}

			var buildFilterPanelMultiChoice = function (filterPanel, datafield, name, foldersFilterArray) {
				genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name, false, foldersFilterArray);
			}

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
					rendergridrows: function () {
						return dataAdapter.records;
					},
					ready: function () {
						if (koUtil.isParameterTypeContent() === true) {
							$("#" + gID).jqxGrid('hidecolumn', 'FolderName');
							$("#" + gID).jqxGrid('hidecolumn', 'FileType');
							$("#" + gID).jqxGrid('hidecolumn', 'IsEnabledForAutomation');
						} else {
							$("#" + gID).jqxGrid('hidecolumn', 'ThumbnailLocationURL');
						}
					},

					columns: [
						{ text: '', dataField: 'PackageId', hidden: true, editable: false, width: 'auto' },
						{
							text: 'Select', menu: false, sortable: false, columnsResize: false, filterable: false, columntype: 'custom', datafield: 'isSelected', enabletooltips: false,
							minwidth: 60, maxwidth: 61, width: 'auto', cellsrenderer: selectRenderer
						},
						{
							text: null, menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, width: 40, hidden: true,
							renderer: function () {
								return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
							},
							rendered: rendered
						},
						{
							text: i18n.t('thumbnail', { lng: lang }), datafield: 'ThumbnailLocationURL', editable: false, minwidth: 100, menu: false, sortable: false, filterable: false, resizable: false,
							cellsrenderer: imagerenderer
						},
						{
							text: i18n.t('folder_name', { lng: lang }), datafield: 'FolderName', editable: false, minwidth: 150,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanelMultiChoice(filterPanel, datafield, 'Folder Name', globalFoldersFilterArray);
							}
						},
						{
							text: i18n.t('package_nm', { lng: lang }), dataField: 'PackageName', editable: false, minwidth: 100,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						},
						{
							text: i18n.t('tag_device', { lng: lang }), dataField: 'Tags', editable: false, minwidth: 100, filterable: true,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						},
						{
							text: i18n.t('filename', { lng: lang }), datafield: 'FileName', editable: false, minwidth: 100, filterable: true,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						},
						{
							text: i18n.t('fileversion', { lng: lang }), dataField: 'FileVersion', editable: false, minwidth: 100, filterable: true,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						},
						{
							text: i18n.t('filesize', { lng: lang }), dataField: 'FileSizeInMB', editable: false, minwidth: 120, filterable: true,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanel(filterPanel, datafield);
							}
						},
						{
							text: i18n.t('packagetype', { lng: lang }), dataField: 'FileType', editable: false, minwidth: 120,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanelMultiChoice(filterPanel, datafield, 'Package Type');
							}
						},
						{
							text: i18n.t('Automatic_Downloads', { lng: lang }), datafield: 'IsEnabledForAutomation', enabletooltips: false, editable: false, minwidth: 140, cellsrenderer: enableDownloadAutomation,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanelMultiChoice(filterPanel, datafield, 'Automatic Download');
							}
						}

					]
				});
			getGridBiginEdit(gID, 'PackageId', gridStorage);
			callGridFilter(gID, gridStorage);
			callGridSort(gID, gridStorage, 'PackageId');
		}

		function getPackagesParam(columnSortFilter, type) {
			var getPackagesReq = new Object();
			var Export = new Object();
			var Selector = new Object();

			var Pagination = new Object();
			Pagination.HighLightedItemId = null;
			Pagination.PageNumber = 1;
			Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

			Export.DynamicColumns = null;
			Export.ExportReportType = 5;
			Export.VisibleColumns = [];
			Export.IsAllSelected = false;
			Export.IsExport = false;

			Selector.SelectedItemIds = null;
			Selector.UnSelectedItemIds = null;

			var folderIds = [0];

			var ColumnSortFilter = columnSortFilter;
			var FilterList = new Array();
			var columnfilter = new Object();
			columnfilter.FilterColumn = null;
			columnfilter.FilterValue = null;
			FilterList.push(columnfilter);

			getPackagesReq.ColumnSortFilter = ColumnSortFilter;
			getPackagesReq.Export = Export;
			getPackagesReq.PackageType = type;
			getPackagesReq.Pagination = Pagination;
			getPackagesReq.Selector = Selector;
            getPackagesReq.FolderIds = folderIds;
            getPackagesReq.ModelId = koUtil.ModelId;

			var param = new Object();
			param.token = TOKEN();
			param.getPackagesReq = getPackagesReq;

			return param;
		}

		seti18nResourceData(document, resourceStorage);
	}

});

function getSelectedPackageFile(row, event) {
	selectedPackage = new Object();
	selectedPackage.PackageId = $("#jqxgridPackageFiles").jqxGrid('getcellvalue', row, 'PackageId');
	selectedPackage.PackageName = $("#jqxgridPackageFiles").jqxGrid('getcellvalue', row, 'PackageName');
	$("#btnSavePackageFile").removeClass('disabled');

	if (selectedPackage && (selectedPackage.PackageId !== '' || selectedPackage.PackageId !== null && selectedPackage.PackageId !== undefined)) {
		var rows = $("#jqxgridPackageFiles").jqxGrid('getrows');
		if (rows && rows.length > 0) {
			for (var i = 0; i < rows.length; i++) {
				var boundindex = $("#jqxgridPackageFiles").jqxGrid('getrowboundindexbyid', rows[i].uid);
				if (rows[i].PackageId == selectedPackage.PackageId) {
					$("#jqxgridPackageFiles").jqxGrid('setcellvalue', boundindex, 'isSelected', 1);
				} else {
					$("#jqxgridPackageFiles").jqxGrid('setcellvalue', boundindex, 'isSelected', 0);
				}
			}
		}
		$("#jqxgridPackageFiles").jqxGrid("refresh");
	}
}