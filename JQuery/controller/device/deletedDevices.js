var deviceStatusLabel = '';
isViewEnable = false;
define(["knockout", "koUtil", "autho", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho, ADSearchUtil) {
	SelectedIdOnGlobale = new Array();
	columnSortFilterForDeletedDevices = new Object();
	var isGridVisible = false;
	koUtil.GlobalColumnFilter = new Array();

	//care objects
	careDataDeletedDevices = new Object();			//care session object
	careSearchDeletedDevicesObject = new Object();	//care search object for GetDevices

	////Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	return function appViewModel() {


		var self = this;

		$("#arrowLeft").addClass("icon-arrow-left2");

		$('#unDeleteBtn').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#unDeleteBtn').click();
			}
		});

		$('#blacklistBtn').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#blacklistBtn').click();
			}
		});
		$('#actionTabDeleted').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#actionTabDeleted').click();
			}
		});

		self.templateFlag = ko.observable(false);
		self.AdvanceTemplateFlag = ko.observable(false);
		self.observableModelPopup = ko.observable();
		self.columnlist = ko.observableArray();
		self.gridIdForShowHide = ko.observable();
		var compulsoryfields = ['SerialNumber', 'ModelName', 'ComputedDeviceStatus'];

		setMenuSelection();

		ADSearchUtil.SearchForChart = false;
		ADSearchUtil.SearchForGrid = true;
		ADSearchUtil.newAddedDataFieldsArr = [];
		ADSearchUtil.newAddedgridColumns = [];
		ADSearchUtil.AdScreenName = 'deletedDevice';
		ADSearchUtil.gridIdForAdvanceSearch = 'jqxgridDeletedDevices';
		ADSearchUtil.initColumnsArr = ["isSelected", "SerialNumber", "DeviceId", "HierarchyFullPath", "ModelName", "ComputedDeviceStatus", "DeletedFullName", "DeletedOn", "BlacklistedFullName", "BlackListedOn"];

		// for open popup
		var modelName = 'unloadTemplate';
		loadelement(modelName, 'genericPopup');
		// for adv search
		self.observableCriteria = ko.observable();

		loadCriteria('modalCriteria', 'genericPopup');

		self.observableAdvancedSearchModelPopup = ko.observable();

		loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

		self.unloadAdvancedSearch = function () {
			repositionAdvanceSearchPopUp("mdlAdvancedForDeletedContent");
			ClearAdSearch = 0;
			self.observableAdvancedSearchModelPopup('unloadTemplate');
			$("#AdvanceSearchModal").modal('hide');
			$("#mainPageBody").removeClass('modal-open-appendon');
			isAdpopup = '';
		}

		self.clearAdvancedSearch = function () {
			repositionAdvanceSearchPopUp("mdlAdvancedForDeletedContent");
			self.observableAdvancedSearchModelPopup('unloadTemplate');
			loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
		}

		self.resetADSearch = function () {

			ADSearchUtil.deviceSearchObj = new Object();
			ADSearchUtil.resetAddSerchFlag = 'reset';
			var gId = ADSearchUtil.gridIdForAdvanceSearch;
			$("#" + gId).jqxGrid('updatebounddata');
			loadelement(modelName, 'genericPopup');
		}

		self.expandCriteria = function () {
			if ($("#deviceCriteriaDiv").hasClass('hide')) {
				$("#deviceCriteriaDiv").removeClass('hide');
				$("#expandQuickLinkDiv").empty();
				var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  titexpandButtonListle="Collapse"><i class="icon-angle-up"></i></a>';
				$("#expandQuickLinkDiv").append(str);
			} else {
				$("#deviceCriteriaDiv").addClass('hide');
				$("#expandQuickLinkDiv").empty();
				var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Expand"><i class="icon-angle-down"></i></a>';
				$("#expandQuickLinkDiv").append(str);
			}
		}

		self.openPopup = function (popupName, gId, status) {
			self.templateFlag(true);
			if (popupName == "modelShowHideCol") {
				self.gridIdForShowHide(gId);
				self.columnlist(null); //<!---advance search changes--->
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
						var source = _.where(ADSearchUtil.localDynamicColumns, { datafield: arr[i].columnfield });
						if (source == '') {
							self.columnlist.remove(arr[i]);
						}
					}
				}

				//advance search
				if (ADSearchUtil.resetAddSerchFlag == 'reset') {
					for (var i = 0; i < ADSearchUtil.newAddedgridColumns.length; i++) {
						var source = _.where(self.columnlist(), { columnfield: ADSearchUtil.newAddedgridColumns[i].datafield });
						if (source != '') {
							self.columnlist.remove(source[0]);
						}
					}
				}
				//
				loadelement(popupName, 'genericPopup');
				$('#deviceModel').modal('show');

			} else if (popupName == 'modelUndeletedDevices') {
				var selecteItemIds = getSelectedUniqueId(gId);
				var checkAll = checkAllSelected(gId);

				if (status === AppConstants.get('PERMANENT_DELETE') && selecteItemIds.length > 1) {
					openAlertpopup(1, 'permanent_delete_single_device_only');
					return;
				}

				if (checkAll == 1) {
					loadelement(popupName, 'device');
					$('#deviceModel').modal('show');
					deviceStatusLabel = status;
					getSelectedDeviceList(gId, status);
				} else {
					if (selecteItemIds.length == 1 || selecteItemIds.length > 1) {
						loadelement(popupName, 'device');
						$('#deviceModel').modal('show');
						getSelectedDeviceList(gId, status);
					}
					else if (selecteItemIds.length == 0) {
						openAlertpopup(1, 'please_select_device');
						return;
					}
				}
			}
			else if (popupName == 'modelAdvancedSearch') {
				self.AdvanceTemplateFlag(true);
				loadAdvancedSearchModelPopup(popupName, 'genericPopup');
				$('#AdvanceSearchModal').modal('show');
			}
		}


		$('#mdlAdvancedForDeletedHeader').mouseup(function () {
			$("#mdlAdvancedForDeletedContent").draggable({ disabled: true });
		});

		$('#mdlAdvancedForDeletedHeader').mousedown(function () {
			$("#mdlAdvancedForDeletedContent").draggable({ disabled: false });
		});


		// Unload template
		self.unloadTempPopup = function (popupName, gId, exportflage) {
			self.observableModelPopup(popupName);
			$('#deviceModel').modal('hide');
		}

		//Check Rights		
		self.checkRights = function (screenName, rightsFor) {
			var retval = autho.checkRightsBYScreen(screenName, rightsFor);
			return retval;
		}

		function checkGridVisible() {
			var retval = autho.checkRightsBYScreen('Devices', 'IsDeleteAllowed');
			if (retval == true) {
				isGridVisible = true;
			} else {
				isGridVisible = false;
			}
			return retval;
		}

		///////////////////
		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopup(elementname);
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

		self.clearfilter = function (gridId) {
			gridFilterClear(gridId);
			$(".panel-side-pop-deleted").hide();
		}

		self.refreshGrid = function (gridId) {
			gridRefresh(gridId);
		}

		//Export Parameter
		function exportDevices(isExport, columnSortFilterForDeletedDevices, selectedDeletedDevicesItems, unselectedDeletedDevicesItems, checkAll, deviceSearchObj, visibleColumns) {

			var exportDevicesReq = new Object();
			var HierarchyIdsWithChildren = new Object();
			HierarchyIdsWithChildren.long = 1;
			var Selector = new Object();
			var SchedulePackages = new Array();
			var Export = new Object();
			var Dynamic = new Array();
			Selector.ContinueDeletion = false;
			Export.DynamicColumns = Dynamic;
			Export.VisibleColumns = visibleColumns;
			if (checkAll == 1) {
				Selector.SelectedItemIds = null;
				Selector.UnSelectedItemIds = unselectedDeletedDevicesItems;
				Export.IsAllSelected = true;
				Export.IsExport = true;
			} else {
				Selector.SelectedItemIds = selectedDeletedDevicesItems;
				Selector.UnSelectedItemIds = null;
				Export.IsAllSelected = false;
				Export.IsExport = true;
			}

			var ColumnSortFilter = columnSortFilterForDeletedDevices;
			var FilterList = new Array();
			var coulmnfilter = new Object();
			coulmnfilter.FilterColumn = null;
			coulmnfilter.FilterValue = null;
			FilterList.push(coulmnfilter);

			var DeviceSearch = new Object();
			DeviceSearch.DeviceStatus = ["Deleted"];
			DeviceSearch.GroupIds = null;
			DeviceSearch.HierarchyIdsWithChildren = null;
			DeviceSearch.IsAdmin = false;
			DeviceSearch.HierarchyIdsWithoutChildren = null;
			DeviceSearch.IsHierarchiesSelected = false;
			DeviceSearch.IsOnlyDeleteBlacklisted = true;
			DeviceSearch.IsPrivateSearch = false;
			DeviceSearch.SearchCategory = false;
			DeviceSearch.SearchCriteria = null;
			DeviceSearch.SearchElements = null;
			DeviceSearch.SearchID = 0;
			DeviceSearch.SearchModels = null;
			DeviceSearch.SearchName = null;
			DeviceSearch.SearchText = null;
			DeviceSearch.SearchType = 0;

			exportDevicesReq.ColumnSortFilter = ColumnSortFilter;
			exportDevicesReq.DeviceSearch = deviceSearchObj;
			exportDevicesReq.Export = Export;
			exportDevicesReq.Selector = Selector;

			var param = new Object();
			param.token = TOKEN();
			param.exportDevicesReq = exportDevicesReq;

			return param;
		}

		//ExportToExcel 
		self.exportToExcel = function (isExport, gId) {
			var selectedDeletedDevicesItems = null;
			var unselectedDeletedDevicesItems = null;
			selectedDeletedDevicesItems = getSelectedUniqueId(gId);
			unselectedDeletedDevicesItems = getUnSelectedUniqueId(gId);
			var checkAll = checkAllSelected(gId);
			visibleColumnsList = GetExportVisibleColumn(gId);
			var param = exportDevices(true, columnSortFilterForDeletedDevices, selectedDeletedDevicesItems, unselectedDeletedDevicesItems, checkAll, ADSearchUtil.deviceSearchObj, visibleColumnsList);
			self.exportGridId = ko.observable(gId);
			self.exportSucess = ko.observable();
			self.exportflage = ko.observable();
			var datainfo = $("#" + gId).jqxGrid('getdatainformation');
			if (datainfo.rowscount > 0) {
				setExportDevices(param, gId, self.openPopup);
			} else {
				openAlertpopup(1, 'no_data_to_export');
			}
		}

		self.expandButtonList = function (gridId) {
			//gridRefresh(gridId);
			//$(".panel-two").toggleClass("panel-two-c");
			//$(".panel-one").toggleClass("panel-one-c");
			//if ($("#colapsDeleteActionPanel").hasClass("panel-two-c")) {
			//    $("#arrowLeft").addClass("icon-arrow-right2");
			//    $("#arrowLeft").removeClass("icon-arrow-left2");
			//} else {
			//    $("#arrowLeft").addClass("icon-arrow-left2");
			//    $("#arrowLeft").removeClass("icon-arrow-right2");

			//}
			$(".panel-side-pop-deleted").hide();
		}

		//Export Callback function
		function setExportDevices(param, gId, openPopup) {
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(1, 'export_Sucess');
					}
				}
			}
			var method = 'ExportDevices';
			var params = JSON.stringify(param);
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		function getSelectedDeviceList(gId, status) {
			var selectedArray = getMultiSelectedData(gId);
			var newArray = new Array();
			for (var i = 0; i < selectedArray.length; i++) {
				var DeviceStatusUpdate = new Object();
				DeviceStatusUpdate.DeviceId = selectedArray[i].DeviceId;
				DeviceStatusUpdate.ModelName = selectedArray[i].ModelName;
				DeviceStatusUpdate.SerialNumber = selectedArray[i].SerialNumber;
				DeviceStatusUpdate.UniqueDeviceId = selectedArray[i].UniqueDeviceId;
				DeviceStatusUpdate.Protocol = selectedArray[i].Protocol;
				DeviceStatusUpdate.Status = status;
				DeviceStatusUpdate.IsSoftwareAssigned = selectedArray[i].IsSoftwareAssigned;
				DeviceStatusUpdate.IsEnabledForAutoDownload = selectedArray[i].IsEnabledForAutoDownload;
				DeviceStatusUpdate.HierarchyId = selectedArray[i].HierarchyId;
				DeviceStatusUpdate.ModelId = selectedArray[i].ModelId;
				DeviceStatusUpdate.IsDirectReferenceSetAssigned = selectedArray[i].IsDirectReferenceSetAssigned;
				DeviceStatusUpdate.InternalModelName = selectedArray[i].InternalModelName;
				DeviceStatusUpdate.Family = selectedArray[i].Family;
				DeviceStatusUpdate.AssignmentType = selectedArray[i].AssignmentType;
				newArray.push(DeviceStatusUpdate);
				globalVariableForDeletedandBlacklistedDevices = newArray;
			}
			return globalVariableForDeletedandBlacklistedDevices;
		}

		init();
		function init() {
			modelReposition();
			checkGridVisible();
			setScreenControls(AppConstants.get('DELETED_DEVICES'));

			//careData session will be available only on redirection from Care Dashboard to Device Search
			if (!_.isEmpty(window.sessionStorage.getItem('careData'))) {
				careDataDeletedDevices = window.sessionStorage.getItem('careData');
				careDataDeletedDevices = JSON.parse(careDataDeletedDevices);
				//for care data, clear grid storage, if any
				var mysession = window.sessionStorage;
				if (!_.isEmpty(mysession) && mysession.length > 0) {
					for (var i = 0; i < mysession.length; i++) {
						if (mysession.key(i) === "jqxgridDeletedDevicesgridStorage") {
							window.sessionStorage.removeItem(mysession.key(i));
							break;
						}
					}
				}
			}

			if (!_.isEmpty(careDataDeletedDevices)) {
				var hierarchyIds = new Array();
				var groupIds = new Array();
				var hierarchyName = careDataDeletedDevices.hierarchyName;
				var groupName = careDataDeletedDevices.groupName;

				if (careDataDeletedDevices.groupId > 0) {
					groupIds.push(careDataDeletedDevices.groupId);
				} else if (careDataDeletedDevices.hierarchyId > 0) {
					hierarchyIds.push(careDataDeletedDevices.hierarchyId);
				}

				careSearchDeletedDevicesObject = new Object();
				careSearchDeletedDevicesObject = getCareData(careDataDeletedDevices);

				getDeviceSearchForCare('jqxgridDeletedDevices', hierarchyName, hierarchyIds, groupName, groupIds);
			} else {
				getDeviceSearch('jqxgridDeletedDevices');
			}

			var param = getDeviceParameters(ADSearchUtil.deviceSearchObj);
			deletedDeviceGrid('jqxgridDeletedDevices', param, self.observableAdvancedSearchModelPopup);
		}

		//build Device Search object to get data for VeriCare selected model
		function getDeviceSearchForCare(gId, hierarchyName, hierarchyIds, groupName, groupIds) {
			var searchText = '';
			if (!_.isEmpty(groupName) && !_.isEmpty(groupIds)) {
				searchText += 'Search Type = Group <br/>';
				searchText += 'Group = ';
				searchText += groupName + ' <br/>';
			} else if (!_.isEmpty(hierarchyName)) {
				searchText += 'Search Type = Hierarchy <br/>';
				searchText += 'Hierarchy = ';
				searchText += hierarchyName + ' <br/>';
			} 

			if (careDataDeletedDevices.chartValue !== '') {
				searchText += careDataDeletedDevices.identifier + ' = ';
				searchText += careDataDeletedDevices.chartValue + ' <br/>';
			} else if (careDataDeletedDevices.barValue !== '') {
				var identifier = careDataDeletedDevices.identifier === 'Health' ? 'Device Warnings' : (careDataDeletedDevices.identifier === 'Sofwtare' ? 'Device Versions' : 'Device State');
				searchText += identifier + ' = ';
				searchText += careDataDeletedDevices.barValue + ' <br/>';
			}

			var DeviceSearch = new Object();
			DeviceSearch.DeviceStatus = ["Deleted"];
			DeviceSearch.GroupIds = groupIds;
			DeviceSearch.HierarchyIdsWithChildren = hierarchyIds;
			DeviceSearch.HierarchyIdsWithoutChildren = new Array();
			DeviceSearch.IsHierarchiesSelected = !_.isEmpty(hierarchyIds) ? true : false;
			DeviceSearch.SelectedHeaders = selectedColumns;
			DeviceSearch.IsOnlyDeleteBlacklisted = false;
			DeviceSearch.IsPrivateSearch = true;
			DeviceSearch.SearchCriteria = null;
			DeviceSearch.SearchElements = new Array();
			DeviceSearch.SearchModels = [];
			DeviceSearch.SearchName = null;
			DeviceSearch.SearchID = 0;
			DeviceSearch.SearchText = searchText;
			DeviceSearch.SearchType = ENUM.get('ADVANCED');

			var advanceSearchStorage = getAdvanceSearchStorage(gId);
			if (!_.isEmpty(advanceSearchStorage)) {
				advanceSearchStorage[0].searchText = DeviceSearch.SearchText;
				advanceSearchStorage[0].isAdSearch = 1;
				advanceSearchStorage[0].quickSearchName = '';
			}
			setAdvanceSearchStorage(gId, advanceSearchStorage, DeviceSearch, 0);

			ADSearchUtil.deviceSearchObj = DeviceSearch;
			ADSearchUtil.SearchText = DeviceSearch.SearchText;
			ADSearchUtil.SearchCriteria = '';
			setCustomSearchStorage(gId, ADSearchUtil);

			isSearchReset = false;
		}

		//build Device Search object
		function getDeviceSearch(gId) {
			var DeviceSearch = new Object();
			DeviceSearch.DeviceStatus = ["Deleted"];
			DeviceSearch.GroupIds = [];
			DeviceSearch.HierarchyIdsWithChildren = [];
			DeviceSearch.IsAdmin = false;
			DeviceSearch.HierarchyIdsWithoutChildren = [];
			DeviceSearch.IsHierarchiesSelected = false;
			DeviceSearch.IsOnlyDeleteBlacklisted = true;
			DeviceSearch.IsPrivateSearch = false;
			DeviceSearch.SearchCategory = false;
			DeviceSearch.SearchCriteria = null;
			DeviceSearch.SearchElements = [];
			DeviceSearch.SearchID = 0;
			DeviceSearch.SearchModels = [];
			DeviceSearch.SearchName = null;
			DeviceSearch.SearchText = null;
			DeviceSearch.SearchType = 0;

			var advanceSearchStorage = getAdvanceSearchStorage(gId);
			if (!_.isEmpty(advanceSearchStorage)) {
				advanceSearchStorage[0].searchText = DeviceSearch.SearchText;
				advanceSearchStorage[0].isAdSearch = 1;
				advanceSearchStorage[0].quickSearchName = '';
			}
			setAdvanceSearchStorage(gId, advanceSearchStorage, DeviceSearch, 0);

			ADSearchUtil.deviceSearchObj = DeviceSearch;
			ADSearchUtil.SearchText = DeviceSearch.SearchText;
			ADSearchUtil.SearchCriteria = '';
		}

		//get advance search object from session storage
		function getAdvanceSearchStorage(gId) {
			var advanceSearchStorage = JSON.parse(window.sessionStorage.getItem(gId + "adStorage"));
			return advanceSearchStorage;
		}

		//update advance search object in session storage
		function setAdvanceSearchStorage(gId, adStorage, deviceSearch, type) {
			var updatedAdvanceSearchStorage = JSON.stringify(adStorage);
			window.sessionStorage.setItem(gId + 'adStorage', updatedAdvanceSearchStorage);
			updateAdSearchObj(gId, deviceSearch, type);
		}

		//get custom search object from session storage
		function getCustomSearchStorage(gId) {
			var customSearchObject = new Object();
			var customSearch = JSON.parse(window.sessionStorage.getItem(gId + "customSearch"));
			var customSearchText = window.sessionStorage.getItem(gId + "CustomSearchText");
			var customSearchCriteria = window.sessionStorage.getItem(gId + "CustomSearchCriteria");
			customSearchObject.customSearch = customSearch;
			customSearchObject.customSearchText = customSearchText;
			customSearchObject.customSearchCriteria = customSearchCriteria;

			return customSearchObject;
		}

		//set custom search object in session storage
		function setCustomSearchStorage(gId, advanceSearchUtil) {
			sessionStorage.setItem(gId + 'customSearch', JSON.stringify(advanceSearchUtil.deviceSearchObj));
			if (advanceSearchUtil.SearchText) {
				window.sessionStorage.setItem(gId + 'CustomSearchText', advanceSearchUtil.SearchText);
				window.sessionStorage.setItem("CustomSearchText", advanceSearchUtil.SearchText);
			}
			if (advanceSearchUtil.SearchCriteria) {
				window.sessionStorage.setItem(gId + 'CustomSearchCriteria', advanceSearchUtil.SearchCriteria);
			}
		}

		$("#btnRestFilter").focus();

		seti18nResourceData(document, resourceStorage);
	};

	function deletedDeviceGrid(gId, param, modelPopup) {
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
		var initfieldsArr = [];
		var DynamicColumns = [];
		var sourceDataFieldsArr = [{ name: 'isSelected', type: 'number' },
		{ name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
		{ name: 'SerialNumber', map: 'DeviceDetail>SerialNumber' },
		{ name: 'DeviceId', map: 'DeviceDetail>DeviceId' },
		{ name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath', type: 'string' },
		{ name: 'ModelName', map: 'DeviceDetail>ModelName' },
		{ name: 'ComputedDeviceStatus', map: 'DeviceDetail>ComputedDeviceStatus' },
		{ name: 'Protocol', map: 'DeviceDetail>Protocol' },
		{ name: 'DeletedFullName', map: 'DeletedFullName' },
		{ name: 'DeletedOn', map: 'DeviceDetail>DeletedOn', type: 'date' },
		{ name: 'BlacklistedFullName', map: 'BlacklistedFullName' },
		{ name: 'BlackListedOn', map: 'DeviceDetail>BlackListedOn', type: 'date' },
		{ name: 'BatteryLevel', map: 'DeviceDetail>BatteryLevel' },
		{ name: 'IsSoftwareAssigned', map: 'DeviceDetail>IsSoftwareAssigned' },
		{ name: 'IsEnabledForAutoDownload', map: 'DeviceDetail>IsEnabledForAutoDownload' },
		{ name: 'HierarchyId', map: 'DeviceDetail>HierarchyId' },
		{ name: 'ModelId', map: 'DeviceDetail>ModelId' },
		{ name: 'IsDirectReferenceSetAssigned', map: 'DeviceDetail>IsDirectReferenceSetAssigned' },
		{ name: 'InternalModelName', map: 'DeviceDetail>InternalModelName' },
		{ name: 'Family', map: 'DeviceDetail>Family' },
		{ name: 'AssignmentType', map: 'DeviceDetail>AssignmentType' }];

		var InitGridStoragObj = initGridStorageObj(gId);
		var gridStorage = InitGridStoragObj.gridStorage;

		var source =
		{
			dataType: "json",
			dataFields: [{ name: 'isSelected', type: 'number' },
			{ name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
			{ name: 'SerialNumber', map: 'DeviceDetail>SerialNumber' },
			{ name: 'DeviceId', map: 'DeviceDetail>DeviceId' },
			{ name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath', type: 'string' },
			{ name: 'ModelName', map: 'DeviceDetail>ModelName' },
			{ name: 'ComputedDeviceStatus', map: 'DeviceDetail>ComputedDeviceStatus' },
			{ name: 'Protocol', map: 'DeviceDetail>Protocol' },
			{ name: 'DeletedFullName', map: 'DeletedFullName' },
			{ name: 'DeletedOn', map: 'DeviceDetail>DeletedOn', type: 'date' },
			{ name: 'BlacklistedFullName', map: 'BlacklistedFullName' },
			{ name: 'BlackListedOn', map: 'DeviceDetail>BlackListedOn', type: 'date' },
			{ name: 'BatteryLevel', map: 'DeviceDetail>BatteryLevel' },
			{ name: 'IsSoftwareAssigned', map: 'DeviceDetail>IsSoftwareAssigned' },
			{ name: 'IsEnabledForAutoDownload', map: 'DeviceDetail>IsEnabledForAutoDownload' },
			{ name: 'HierarchyId', map: 'DeviceDetail>HierarchyId' },
			{ name: 'ModelId', map: 'DeviceDetail>ModelId' },
			{ name: 'IsDirectReferenceSetAssigned', map: 'DeviceDetail>IsDirectReferenceSetAssigned' },
			{ name: 'InternalModelName', map: 'DeviceDetail>InternalModelName' },
			{ name: 'Family', map: 'DeviceDetail>Family' },
			{ name: 'AssignmentType', map: 'DeviceDetail>AssignmentType' }],
			root: 'Devices',
			type: "POST",
			data: param,

			url: AppConstants.get('API_URL') + "/GetDevices",
			contentType: 'application/json',
			beforeprocessing: function (data) {

				if (data.getDevicesResp && data)
					data.getDevicesResp = $.parseJSON(data.getDevicesResp);
				else
					data.getDevicesResp = [];

				if (data.getDevicesResp && data.getDevicesResp.Devices && data.getDevicesResp.PaginationResponse) {
					source.totalrecords = data.getDevicesResp.PaginationResponse.TotalRecords;
					source.totalpages = data.getDevicesResp.PaginationResponse.TotalPages;
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
						$("#" + gId).jqxGrid('showloadelement');
						$('.all-disabled').show();
					} else {
						$("#" + gId).jqxGrid('hideloadelement');
					}
					disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
					var columnSortFilter = new Object();
					columnSortFilter = columnSortFilterFormatedData(columnSortFilterForDeletedDevices, gId, gridStorage, 'DeletedBlacklistedDevices');
					koUtil.GlobalColumnFilter = columnSortFilter;

					param.getDevicesReq.CareSearch = careSearchDeletedDevicesObject;
					param.getDevicesReq.ColumnSortFilter = columnSortFilter;

					var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
					if (adStorage[0].isAdSearch == 0) {
						if (adStorage[0].adSearchObj) {
							ADSearchUtil.deviceSearchObj = adStorage[0].adSearchObj;
						} else {

							var obj = new Object();
							obj.DeviceStatus = ["Deleted"];
							ADSearchUtil.deviceSearchObj = obj;
						}
					} else {
						if (adStorage[0].quickSearchObj) {
							ADSearchUtil.deviceSearchObj = adStorage[0].quickSearchObj;
						} else {

							var obj = new Object();
							obj.DeviceStatus = ["Deleted"];
							ADSearchUtil.deviceSearchObj = obj;
						}
					}

					updatepaginationOnState(gId, gridStorage, param.getDevicesReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage);

					param.getDevicesReq.Pagination = getPaginationObject(param.getDevicesReq.Pagination, gId);
					var customData = JSON.parse(sessionStorage.getItem(gId + 'customSearch'));
					if (!_.isEmpty(customData)) {
						ADSearchUtil.deviceSearchObj = JSON.parse(sessionStorage.getItem(gId + 'customSearch'));
						ADSearchUtil.SearchText = sessionStorage.getItem(gId + 'CustomSearchText');
						$("#criteriabtnDiv").css("display", "inline");
						$("#resetBtnForGrid").removeClass('hide');
						$("#deviceCriteriaDiv").empty();
						$("#deviceCriteriaDiv").append(ADSearchUtil.SearchText);
					}
					param.getDevicesReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
					data = JSON.stringify(param);
					return data;
				},
				downloadComplete: function (data, status, xhr) {
					enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

					if (data) {
						//for Ad Search
						ADSearchUtil.localDynamicColumns = [];


						if (data.getDevicesResp) {

							if (data.getDevicesResp.Devices) {
								for (var i = 0; i < data.getDevicesResp.Devices.length; i++) {
									data.getDevicesResp.Devices[i].DeviceDetail.DeletedOn = convertToLocaltimestamp(data.getDevicesResp.Devices[i].DeviceDetail.DeletedOn);
									data.getDevicesResp.Devices[i].DeviceDetail.BlackListedOn = convertToLocaltimestamp(data.getDevicesResp.Devices[i].DeviceDetail.BlackListedOn);

								}
							}
							initfieldsArr = sourceDataFieldsArr;
							if (data.getDevicesResp.DynamicColumns) {
								for (var i = 0; i < data.getDevicesResp.DynamicColumns.length; i++) {
									DynamicColumns = data.getDevicesResp.DynamicColumns;
									var FieldSource = _.where(sourceDataFieldsArr, { name: data.getDevicesResp.DynamicColumns[i].AttributeName });
									if (FieldSource == '') {
										var dynamicObj = new Object();
										dynamicObj.name = data.getDevicesResp.DynamicColumns[i].AttributeName;
										dynamicObj.map = 'DeviceDetail>' + data.getDevicesResp.DynamicColumns[i].AttributeName;
										if (data.getDevicesResp.DynamicColumns[i].ControlType == 'Date') {
											dynamicObj.type = 'date';
										}
										ADSearchUtil.newAddedDataFieldsArr.push(dynamicObj);
									}
									var ColumnSource = _.where(gridColumns, { datafield: data.getDevicesResp.DynamicColumns[i].AttributeName });
									var coulmnObj = new Object();
									coulmnObj.text = i18n.t(data.getDevicesResp.DynamicColumns[i].DisplayName, { lng: lang });//columnArr[f].DisplayName;
									coulmnObj.datafield = data.getDevicesResp.DynamicColumns[i].AttributeName;
									coulmnObj.editable = false;
									coulmnObj.minwidth = 200;
									coulmnObj.width = 'auto';
									coulmnObj.enabletooltips = true;
									if (data.getDevicesResp.DynamicColumns[i].ControlType == 'Date') {
										coulmnObj.cellsformat = LONG_DATETIME_GRID_FORMAT;
									}
									coulmnObj.filtertype = "custom";
									if (data.getDevicesResp.DynamicColumns[i].ControlType == 'TextBox') {
										coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
									} else if (data.getDevicesResp.DynamicColumns[i].ControlType == 'MultiCombo' || data.getDevicesResp.DynamicColumns[i].ControlType == 'Combo') {
										coulmnObj.createfilterpanel = function (datafield, filterPanel) {
											var FilterSource = AppConstants.get(datafield);
											buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource);
										};
									} else if (data.getDevicesResp.DynamicColumns[i].ControlType == 'Date') {
										coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanelDate(filterPanel, datafield); };
									}

									//<!---advance search changes--->
									if (ColumnSource == '') {
										ADSearchUtil.newAddedgridColumns.push(coulmnObj);
									}
									ADSearchUtil.localDynamicColumns.push(coulmnObj);
								}
							}
						}

						source.dataFields = sourceDataFieldsArr;
						///end Ad Search
						if (data.getDevicesResp && data.getDevicesResp.Devices) {
							if (data.getDevicesResp.PaginationResponse) {
								if (data.getDevicesResp.TotalSelectionCount != 'undefined') {
									gridStorage[0].TotalSelectionCount = data.getDevicesResp.TotalSelectionCount;
									var updatedGridStorage = JSON.stringify(gridStorage);
									window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);
								}
								//if (data.getDevicesResp.PaginationResponse.HighLightedItemPage > 0) {
								//    //for (var h = 0; h < data.getDevicesResp.Devices.length; h++) {
								//        //if (data.getDevicesResp.Devices[h].UniqueDeviceId == data.getDevicesResp.PaginationResponse.HighLightedItemId) {
								//    gridStorage[0].highlightedPage = data.getDevicesResp.PaginationResponse.HighLightedItemPage;
								//    var updatedGridStorage = JSON.stringify(gridStorage);
								//    window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);
								//        //}
								//    //}
								//}
							}
						} else {
							source.totalrecords = 0;
							source.totalpages = 0;
							data.getDevicesResp = new Object();
							data.getDevicesResp.Devices = [];
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
						$("#" + gId).jqxGrid('hideloadelement');
						isAdvancedSavedSearchApplied = false;
						koUtil.isSearchCancelled(false);
						window.sessionStorage.setItem('careData', "");
					}
				},
				loadError: function (jqXHR, status, error) {
					$('.all-disabled').hide();
					openAlertpopup(2, 'network_error');
				}
			}
		);
		var cellbeginedit = function (row, datafield, columntype, value) {
			var check = $("#" + gId).jqxGrid('getcellvalue', row, 'ComputedDeviceStatus');
			if (check == 'Deleted') {
				return true;
			} else {
				return false;
			}
		}

		var celldisablesrenderer = function (row, column, value, defaultHtml) {
			var text = "Status: ";
			if (value == "Blacklisted") {
				defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg blacklistedStatus"></div></a><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
			}
			if (value == "Deleted") {
				defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg deletedStatus"></div></a><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
			}
			defaultHtml = genericCellDisablesrenderer(row, column, value, defaultHtml, gId, 'ComputedDeviceStatus');
			return defaultHtml;
		}

		//Custom filter
		var buildFilterPanel = function (filterPanel, datafield) {
			genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gId);
		}

		var buildFilterPanelDate = function (filterPanel, datafield) {
			genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gId);
		}

		var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
			genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gId, name);
		}

		var rendered = function (element) {
			var retval = autho.checkRightsBYScreen('Global Operations', 'IsModifyAllowed');
			if (isGridVisible == true) {
				enablegridfunctions(gId, 'UniqueDeviceId', element, gridStorage, true, 'pagerDivDeletedDevices', false, 1, 'ComputedDeviceStatus', null, null, null, null, 'deviceSearchCheck', retval);
			} else {
				enablegridfunctions(gId, 'UniqueDeviceId', element, gridStorage, true, 'pagerDivDeletedDevices', false, 1, 'ComputedDeviceStatus', null, null, null, null, 'deviceSearchCheck', retval);
			}
			return true;
		}

		var cellclassDeletedDevices = function (row, columnfield, value) {
			var classname = genericCellDisablesrendererNew(row, columnfield, value, gId, 'ComputedDeviceStatus');
			return classname;
		}

		//for device profile
		function SerialNoRendereDeletedDevices(row, columnfield, value, defaulthtml, columnproperties) {
			var data = $("#" + gId).jqxGrid('getrowdata', row);
			if (data != undefined) {
				return '<div style="padding-left:10px;padding-top:9px;"><a onclick="gotoDeviceProfile(' + data.UniqueDeviceId + ')"  style="text-decoration:underline;" tabindex="0" title="View Profile" >' + value + '</a></div>';
			}
		}

		gridColumns = [{
			text: '', menu: false, sortable: false, filterable: false, resizable: false, draggable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false, cellbeginedit: cellbeginedit, cellclassname: cellclassDeletedDevices,
			datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
				return '<div><div style="margin-left: 10px; margin-top: 2px;"></div></div>';
			}, rendered: rendered
		},

		{
			text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 100, cellsrenderer: SerialNoRendereDeletedDevices, enabletooltips: false,
			filtertype: "custom",
			createfilterpanel: function (datafield, filterPanel) {
				buildFilterPanel(filterPanel, datafield);
			}
		},
		{
			text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 130, sortable: true, cellsrenderer: celldisablesrenderer,
			filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
			createfilterpanel: function (datafield, filterPanel) {
				buildFilterPanel(filterPanel, datafield);
			}
		},
		{
			text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 100, sortable: true, enabletooltips: false, cellsrenderer: celldisablesrenderer,
			filtertype: "custom",
			createfilterpanel: function (datafield, filterPanel) {
				buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
			}
		},
		{
			text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 150, sortable: true, enabletooltips: false, cellsrenderer: celldisablesrenderer,
			filtertype: "custom",
			createfilterpanel: function (datafield, filterPanel) {
				buildFilterPanelMultiChoice(filterPanel, datafield, 'Deleted Device Status');
			}
		},
		{ text: i18n.t('deleted_device_by', { lng: lang }), datafield: 'DeletedFullName', filterable: false, menu: false, editable: false, minwidth: 130, sortable: false, cellsrenderer: celldisablesrenderer, },
		{
			text: i18n.t('deleted_on_date_time', { lng: lang }), datafield: 'DeletedOn', filterable: true, editable: false, minwidth: 130, sortable: true, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, cellsrenderer: celldisablesrenderer,
			filtertype: "custom",
			createfilterpanel: function (datafield, filterPanel) {
				buildFilterPanelDate(filterPanel, datafield);

			}
		},
		{ text: i18n.t('blacklist_device_by', { lng: lang }), datafield: 'BlacklistedFullName', editable: false, minwidth: 130, sortable: false, filterable: false, menu: false, cellsrenderer: celldisablesrenderer, },

		{
			text: i18n.t('blacklisted_on_date_time', { lng: lang }), datafield: 'BlackListedOn', editable: false, minwidth: 160, sortable: true, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, cellsrenderer: celldisablesrenderer,
			filtertype: "custom",
			createfilterpanel: function (datafield, filterPanel) {
				buildFilterPanelDate(filterPanel, datafield);

			}
		}];

		//grid Properties and columns
		$("#" + gId).jqxGrid(
			{
				height: gridHeightFunction(gId, "60"),
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
				autoshowfiltericon: true,
				columns: gridColumns,

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
						////
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

					callOnGridReady(gId, gridStorage);

					var columns = genericHideShowColumn(gId, true, []);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsList = koUtil.gridColumnList;
				}
			});
		getGridBiginEdit(gId, 'UniqueDeviceId', gridStorage);

		callGridFilter(gId, gridStorage);
		callGridSort(gId, gridStorage, 'UniqueDeviceId');
	}

	function getDeviceParameters(deviceSearchObj) {
		var getDevicesReq = new Object();
		var Pagination = new Object();
		var Selector = new Object();

		Pagination.PageNumber = 1;
		Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

		Selector.SelectedItemIds = null;
		Selector.UnSelectedItemIds = null;

		var ColumnSortFilter = new Object();
		ColumnSortFilter.GridId = 'DeletedBlacklistedDevices';
		ColumnSortFilter.FilterList = null;
		ColumnSortFilter.SortList = null;

		getDevicesReq.CareSearch = careSearchDeletedDevicesObject;
		getDevicesReq.ColumnSortFilter = ColumnSortFilter;
		getDevicesReq.DeviceSearch = deviceSearchObj;
		getDevicesReq.Pagination = Pagination;
		getDevicesReq.Selector = Selector;

		var param = new Object();
		param.token = TOKEN();
		param.getDevicesReq = getDevicesReq;

		return param;
	}

	function generateTemplate(tempname, controllerId) {
		var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
		var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
		ko.components.register(tempname, {
			viewModel: { require: ViewName },
			template: { require: 'plugin/text!' + htmlName }
		})
	}
});