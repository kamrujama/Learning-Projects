var lang = getSysLang();
var token = '';
var appViewNestedGrid = '';
var visibleColumnsList = new Array();
var visibleColumnsForScheduleList = new Array();
var visibleColumnsListForPopup = new Array();
var isPopUpOpen = false;
var deviceAttributesDataCustomSearch = {};
var deviceAttributesDataDeviceSearch = {};
var deviceAttributesDataReferenceSets = {};
grididforNestedGridFilter = new Object();
var isCustomSearchFlag = false;
ParentData = '';
isChangePasswordrequired = 0;
var isDeviceSearchWithAdvanceSearch = false;
function TOKEN() {
    if (token == '' && EOAccessToken == '') {
        var baseURL = GetVirtualPath();
		if (VHQFlag === false) {			
			if (baseURL.indexOf('VHQClient') > -1) {
				baseURL = baseURL.split('/VHQClient')[0];
			}
		}
		try {
			$.ajax({
				url: baseURL + "/Home/GetToken",
				type: "GET",
				async: false,
				cache: false,
				success: function (data) {
					token = data.Token;
					window.sessionStorage.setItem("loginResponse", token);
					window.sessionStorage.setItem("CustomerName", data.CustomerName);
					window.sessionStorage.setItem("TokenId", data.TokenId);
					if (typeof (Storage) !== "undefined") {
						localStorage.setItem("SessionStatus", "SK100");
					}
					callXHRRequestInterceptor();
				},
				error: function (jqXHR, status, error) {
					if (jqXHR != null) {
						ajaxErrorHandler(jqXHR, status, error);
					}
					token = '';
				}
			});

		} catch (e) {
			token = '';
		} finally {
		}
	} else {
		if (VHQFlag == false) {
            token = 'Bearer ' + EOAccessToken;
		}
	}
	return token;
}

var url = window.location.href;
var routeurl = url.split("#");
var selectedMenu = "";
if (routeurl != '' && routeurl != null && routeurl != undefined && routeurl.length > 1) {
	if (routeurl[1].indexOf('deviceProfileLite') > -1) {
		selectedMenu = 'deviceProfileLite';
	}
}

var mysession = sessionStorage;
var j = mysession.length;
while (j--) {
	if(mysession.key(j)){
		if (mysession.key(j).indexOf("gridStorage") > -1
		|| mysession.key(j).indexOf("adStorage") > -1
		|| mysession.key(j).indexOf("PageStorage") > -1
		|| mysession.key(j).indexOf("chartStorage") > -1
		|| mysession.key(j).indexOf("filterStorage") > -1
		|| mysession.key(j).indexOf("ShowHideCol") > -1) {
		sessionStorage.removeItem(mysession.key(j));
	}
    if (selectedMenu !== 'deviceProfileLite'){
            if (mysession.key(j)&& mysession.key(j).indexOf("DevProfileUniqueDeviceId") > -1) {
			    sessionStorage.removeItem(mysession.key(j));
		    }
	    }
    }
}
sessionStorage.setItem("chartlist", []);
sessionStorage.setItem("Pagelist", []);
sessionStorage.setItem("gridlist", []);
sessionStorage.setItem("adlist", []);
sessionStorage.setItem("filterlist", []);
sessionStorage.removeItem('statusStorage');

referencesetContainers = [
	{
		'id': 'generalBreadCrumb',
		'isActive': true,
		'menuName': 'General'
	},
	{
		'id': 'operationsBreadCrumb',
		'isActive': false,
		'menuName': 'Assignments'
	},
	{
		'id': 'modelsBreadCrumb',
		'isActive': false,
		'menuName': 'Models'
	},
	{
		'id': 'deviceAttributesBreadCrumb',
		'isActive': false,
		'menuName': 'Device Attributes'
	}
];

function getDeviceSubStatus(deviceSubStatusData, getDeviceSubStatusCallback) {
	var getDeviceSubStatusReq = new Object();
	var Export = new Object();
	var Selector = new Object();
	var Pagination = new Object();
	var coulmnfilter = new Object();
	deviceSubStatusDataAll = new Array();
	deviceSubStatusDataUser = new Array();

	Pagination.HighLightedItemId = null
	Pagination.PageNumber = 1;
	Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

	Selector.SelectedItemIds = null
	Selector.UnSelectedItemIds = null;
	Export.IsAllSelected = false;
	Export.IsExport = false;

	getDeviceSubStatusReq.Export = Export;
	getDeviceSubStatusReq.Pagination = Pagination;
	getDeviceSubStatusReq.Selector = Selector;

	coulmnfilter.FilterList = null;
	coulmnfilter.GridId = 'DeviceSubStatus';
	coulmnfilter.SortList = null;

	getDeviceSubStatusReq.ColumnSortFilter = coulmnfilter;
	getDeviceSubStatusReq.DeviceSubStatusType = ENUM.get('SUB_STATUS_ALL');
	function callbackFunction(data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				if (data && data.getDeviceSubStatusResp) {
					data.getDeviceSubStatusResp = $.parseJSON(data.getDeviceSubStatusResp);

					var subStatusObj = new Object();
					subStatusObj.CreatedByUserName = '';
					subStatusObj.CreatedOn = '';
					subStatusObj.Description = '';
					subStatusObj.DeviceStatus = 'Inactive';
					subStatusObj.DeviceStatusConfigId = 0;
					subStatusObj.ModifiedByUserName = '';
					subStatusObj.ModifiedOn = null;
					subStatusObj.SubStatus = AppConstants.get('NO_SUBSTATUS');
					subStatusObj.SubStatusId = 0;
					subStatusObj.SubStatusName = (null);
					subStatusObj.SubStatusType = '';
					deviceSubStatusDataUser.push(subStatusObj);

					var subStatusItem = new Object();
					subStatusItem.CreatedByUserName = '';
					subStatusItem.CreatedOn = '';
					subStatusItem.Description = '';
					subStatusItem.DeviceStatus = 'Inactive';
					subStatusItem.DeviceStatusConfigId = 0;
					subStatusItem.ModifiedByUserName = '';
					subStatusItem.ModifiedOn = null;
					subStatusItem.SubStatus = AppConstants.get('BLANKS');
					subStatusItem.SubStatusId = 0;
					subStatusItem.SubStatusName = (null);
					subStatusItem.SubStatusType = '';
					deviceSubStatusDataAll.push(subStatusItem);

					if (data.getDeviceSubStatusResp && data.getDeviceSubStatusResp.DeviceSubStatus != undefined) {
						for (var i = 0; i < data.getDeviceSubStatusResp.DeviceSubStatus.length; i++) {
							deviceSubStatusDataAll.push(data.getDeviceSubStatusResp.DeviceSubStatus[i]);

							if (data.getDeviceSubStatusResp.DeviceSubStatus[i].SubStatusType == 'User') {
								deviceSubStatusDataUser.push(data.getDeviceSubStatusResp.DeviceSubStatus[i]);
							}
						}
					}

					UpdateMultiChoiceFilterArray("Device Sub Status", deviceSubStatusDataAll);
					if (deviceSubStatusData != undefined && getDeviceSubStatusCallback != undefined) {
						getDeviceSubStatusCallback(deviceSubStatusData, deviceSubStatusDataUser);
					}
				}
			}
		}
	}

	var method = 'GetDeviceSubStatus';
	var params = '{"token":"' + TOKEN() + '","getDeviceSubStatusReq":' + JSON.stringify(getDeviceSubStatusReq) + '}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
}

function GetVirtualPath() {
	var lastIndex = 0;
	if (window.location.href.lastIndexOf("/#") != -1) {
		lastIndex = window.location.href.lastIndexOf("/#");
	}
	if (window.location.href.lastIndexOf("/index.html#") != -1) {
		lastIndex = window.location.href.lastIndexOf("/index.html#");
	}
	if (lastIndex == 0) {
		lastIndex = window.location.href.lastIndexOf("/")
	}
	var webFolderFullPath = window.location.href.substring(0, lastIndex);
	return webFolderFullPath;
}

function getDeviceAttributes(category, deviceAttributesCallback) {

	function callbackFunction(data, error) {

		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				if (data.searchAttributes)
					data.searchAttributes = $.parseJSON(data.searchAttributes);

				if (category == AppConstants.get('DEVICE_SEARCH_ATTRIBUTES')) {
					deviceAttributesDataDeviceSearch = data.searchAttributes;
					window.localStorage.setItem("SearchAttributes", JSON.stringify(deviceAttributesDataDeviceSearch));
				} else if (category == AppConstants.get('REFERENCE_SET_ATTRIBUTES')) {
					deviceAttributesDataReferenceSets = data.searchAttributes;
				}

				deviceAttributesCallback();
			}
		}
	}

	var method = 'GetDeviceAttributes';
	var params = '{"token":"' + TOKEN() + '","category":"' + category + '"}';
	ajaxJsonCall(method, params, callbackFunction, false, 'POST', true);
}

function GetHierarchiesOnScrollOrSearch(firstChangedHierarchyLevel, i, l, hierarchyConstructor, HierarchyLevels, HierarchiesCountByLevel) {
	if (firstChangedHierarchyLevel != null) {
		if (heirarchyData[i].Level >= firstChangedHierarchyLevel) {
			HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
			if (heirarchyData[i].Level == l) {
				if (HierarchiesCountByLevel.length > 1 && HierarchiesCountByLevel[l] != undefined) {
					HierarchiesCountByLevel[i].LevelNum = l;
					HierarchiesCountByLevel[i].HierarchisCount = (heirarchyData[i].hierarchies).length;
				}
				else {
					HierarchiesCountByLevel.push({
						LevelNum: l,
						HierarchisCount: (heirarchyData[i].hierarchies).length
					});
				}

			}
		}
	}
	else {
		HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
		if (heirarchyData[i].Level == l) {
			if (HierarchiesCountByLevel.length > 1 && HierarchiesCountByLevel[l] != undefined) {
				HierarchiesCountByLevel[i].LevelNum = l;
				HierarchiesCountByLevel[i].HierarchisCount = (heirarchyData[i].hierarchies).length;
			}
			else {
				HierarchiesCountByLevel.push({
					LevelNum: l,
					HierarchisCount: (heirarchyData[i].hierarchies).length
				});
			}
		}
	}
}

function goToHeirarchyChild(index, hid) {

	selectedHierarchyID = hid;
	var removID = '#' + index + 'ul';
	$(removID).children('li').removeClass('selected');
	var i = '#' + index + hid + 'li';

	seltextpath = $(i).text();
	globaleUserHirarchy = seltextpath
	globaleHirarchyParent = $(i).parent('ul').parent('div').prev('div').html()

	if (globaleHirarchyPath[index] == null || globaleHirarchyPath[index] == '' || globaleHirarchyPath[index] == 'undefined') {
		globaleHirarchyPath.push(seltextpath);

	} else {
		globaleHirarchyPath = jQuery.grep(globaleHirarchyPath, function (value) {
			return value != globaleHirarchyPath[index];
		});
		globaleHirarchyPath.push(seltextpath);
	}



	$(i).addClass('selected');
	index = index + 1;
	id = '#' + index + 'ul';
	GetHierarchies(hid, index, id);


}

function GetHierarchies(id, index, selectorid) {

	var hierarchy = new Object();
	hierarchy.Id = id;
	var responsefunction = function (data, error) {
		if (data) {
			if (data.hierarchyList)
				data.hierarchyList = $.parseJSON(data.hierarchyList);
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				var heirarchyArray = data.hierarchyList;
				var str = '';
				for (var i = 0; i < heirarchyArray.length; i++) {
					str += '<li id="' + index + heirarchyArray[i].Id + 'li" onclick="goToHeirarchyChild(' + index + ',' + heirarchyArray[i].Id + ')"><a >' + heirarchyArray[i].HierarchyName + ' <i class="icon-angle-right v-folder"></i></a> </li>';
				}
				$(selectorid).empty();
				$(selectorid).append(str);
			}
		}
	}
	var method = 'GetHierarchies';
	var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(hierarchy) + '}';
	ajaxJsonCall(method, params, responsefunction, true, 'POST', true);
}

function getCustomColumns(gridId, popupName, gId, customColumnsCallback) {

	var callbackFunction = function (data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				if (popupName == '') {
					data.getCustomizableHeaderResp = $.parseJSON(data.getCustomizableHeaderResp);
					var columnsSource = _.where(data.getCustomizableHeaderResp.CustomizableColumns, { IsCustomAttribute: false });
					customColumns = columnsSource;
					var customFields = data.getCustomizableHeaderResp.CustomFieldConfiguration;

					for (var i = 0; i < customFields.length; i++) {
						for (var j = 0; j < customColumns.length; j++) {
							if (customColumns[j].AttributeName.indexOf('CustomField') > -1) {
								customColumns[j].DisplayName = customFields[i].ConfigValue;
								customColumns[j + 1].DisplayName = customFields[i + 1].ConfigValue;
								customColumns[j + 2].DisplayName = customFields[i + 2].ConfigValue;
								customColumns[j + 3].DisplayName = customFields[i + 3].ConfigValue;
								customColumns[j + 4].DisplayName = customFields[i + 4].ConfigValue;
								break;
							}
						}
						break;
					}

					selectedColumns = new Array();
					for (var i = 0; i < customColumns.length; i++) {
						if (customColumns[i].IsSelected == true) {
							selectedColumns.push(customColumns[i]);
						}
					}
					selectedColumnsClone = selectedColumns;
				} else {
					customColumnsCallback(data, popupName, gId);
				}
			}
		}
	}

	var method = 'GetCustomizableHeader';
	var params = '{"token":"' + TOKEN() + '", "gridId": "' + gridId + '"}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
}

function getJobsDownloadProgress(taskIds) {

	var getJobsDownloadProgressReq = new Object();
	getJobsDownloadProgressReq.TaskIds = taskIds;

	function callbackFunction(data, error) {
		if (data) {
			if (data.getJobsDownloadProgressResp) {
				data.getJobsDownloadProgressResp = $.parseJSON(data.getJobsDownloadProgressResp);

				if (data.getJobsDownloadProgressResp && data.getJobsDownloadProgressResp.length > 0) {
					var downloadStatusArray = new Array();
					for (var i = 0; i < data.getJobsDownloadProgressResp.length; i++) {
						var taskId = data.getJobsDownloadProgressResp[i].TaskId;
						var progressValue = data.getJobsDownloadProgressResp[i].DownloadProgress;
						var downloadStatus = data.getJobsDownloadProgressResp[i].DownloadStatus;

						if (taskId) {
							if (progressValue > 0) {
								autoRefreshDownloadStatusProgress(taskId, progressValue, downloadStatus);
							}
						}

						if (downloadStatus == AppConstants.get('InstallSuccessfulCount') || downloadStatus == AppConstants.get('DownloadFailedCount')) {
							downloadStatusArray.push(downloadStatus);
						}
					}

					if (downloadStatusArray.length == data.getJobsDownloadProgressResp.length) {
						autoRefreshDownloadProgressStop();
					}
				}
			}
		}
	}

	var method = 'GetJobsDownloadProgress';
	var params = '{"token":"' + TOKEN() + '","getJobsDownloadProgressReq":' + JSON.stringify(getJobsDownloadProgressReq) + '}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
}

function getUserPreferencesColumnWidth(type, userGuid, gId, gridName, resizedColumns, columnNames) {
	var getGridColumnWidthReq = new Object();
	var columnsList = [];

	getGridColumnWidthReq.Action = type;
	getGridColumnWidthReq.GridName = gridName;
	getGridColumnWidthReq.UserGuid = userGuid;
	
	if (type === AppConstants.get('ACTION_POST_PATCH')) {
		if (!_.isEmpty(columnNames) && columnNames.length > 0) {
			for (var i = 0; i < columnNames.length; i++) {
				var index = resizedColumns.findIndex(function (item) { return item.column === columnNames[i] });
				if (index > -1) {
					var columnObj = new Object();
					var column = resizedColumns[index];
					columnObj.ColumnName = column.column;
					columnObj.Width = column.width;
					columnsList.push(columnObj);
				}
			}
		}
	}
	getGridColumnWidthReq.GridColumnList = columnsList;

	var callBackfunction = function (data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				userResizedColumns = JSON.parse(data.getUserPreferencesColumnWidthDetailsRes);
				if (type === AppConstants.get('ACTION_POST_PATCH')) {
					openAlertpopup(0, 'resize_column_success');
					getUserPreferencesColumnWidth(AppConstants.get('ACTION_GET'), customerGUID, '', AppConstants.get('FETCH_ALL'), [], []);
				} else if (type === AppConstants.get('ACTION_DELETE')) {
					openAlertpopup(0, 'resize_column_reset_success');
					var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
					if (!_.isEmpty(gridStorage) && gridStorage.length > 0 && gridStorage[0].resizedColumns && gridStorage[0].resizedColumns.length > 0) {
						gridStorage[0].resizedColumns = [];
						var updatedGridStorage = JSON.stringify(gridStorage);
						window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);
					}
					getUserPreferencesColumnWidth(AppConstants.get('ACTION_GET'), customerGUID, '', AppConstants.get('FETCH_ALL'), [], []);
				}
			}
		}
	}

	var method = 'GetUserPreferencesWidthDetails';
	var params = '{"token":"' + TOKEN() + '","getUserPreferencesColumnWidthDetailsReq":' + JSON.stringify(getGridColumnWidthReq) + '}';
	ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
}

function previewDeviceImage(url) {
	$("#picMX760").attr('src', url);
	$("#picMX850").attr('src', url);
	$("#picMX860").attr('src', url);
	$("#picMX870").attr('src', url);
	$("#picMX880").attr('src', url);
	$("#picMX915").attr('src', url);
	$("#picMX925").attr('src', url);
	$("#imagePreview").modal('show');
}

//for downloadlibrary Application view
function applicationViewPopupForEditPackage(packageId, packageMode, gId, state) {
	if (packageMode == 1) {
		$("#showHideRestBtn").show();
		var getApplicationsForPackageReq = aplicationGridModel(packageId, gId);
		getAvailablePackages(getApplicationsForPackageReq);
	} else {
		$("#showHideRestBtn").hide();
		GetBundlesForPackage(packageId, gId, true);
	}
}

function applicationViewPopupForEditPackageDownloadLib(packageId, packageMode, gId, state) {
	if (packageMode == 1 || packageMode == 'Package') {
		$("#showHideRestBtn").show();
		var getApplicationsForPackageReq = aplicationGridModel(packageId, gId);
		getAvailablePackages(getApplicationsForPackageReq);
	} else {
		$("#showHideRestBtn").hide();
		GetBundlesForPackage(packageId, gId, true);
	}
}

function AplicationViewPopup(row, gID) {

	var packageID = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageId');
	var packagemode = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageMode');
	var aplicationName = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageName');


	$("#packageNameAppln").text(aplicationName);

	if (packagemode == 'Package' || packagemode == '1') {
		$("#showHideRestBtn").show();
		var getApplicationsForPackageReq = aplicationGridModel(packageID, gID);
		getAvailablePackages(getApplicationsForPackageReq, gID, false);
	} else {
		$("#showHideRestBtn").hide();
		GetBundlesForPackage(packageID, gID, true);
	}
	$('#ApplicationView').modal('show');
}

function AplicationViewPopupFromVRK(row, gID) {

	//var packageID = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageId');
	//var packagemode = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageMode');
	//var aplicationName = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageName');


	//$("#packageNameAppln").text(aplicationName);
	//if (packagemode == 'Package') {
	//    $("#showHideRestBtn").show();
	//    var getApplicationsForPackageReq = aplicationGridModel(packageID,gID);
	//    getAvailablePackages(getApplicationsForPackageReq,gID,false);
	//} else {
	//    $("#showHideRestBtn").hide();
	//    GetBundlesForPackage(packageID,gID,true);
	//}
	$('#ApplicationView').modal('show');
}

function AplicationViewPopupFromSoftwareAssignment(row, gID, isFromReferenceSet) {
	var packageID = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageId');
	var packagemode = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageMode');
	var packageName = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageName');

	$("#packageNameApplnSofwareAssignment").text(packageName);
	if (packagemode == 'Package') {
		$("#showHideRestBtn").show();
		var getApplicationsForPackageReq = aplicationGridModel(packageID, gID);
		getAvailablePackages(getApplicationsForPackageReq, gID, isFromReferenceSet);
	} else {
		$("#showHideRestBtn").hide();
		GetBundlesForPackage(packageID, gID, true);
	}
	$('#ApplicationView').modal('show');

}

function AplicationViewPopupFromReferenceSet(row, gID, isFromReferenceSet) {
	var packageID = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageId');
	var packagemode = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageMode');
	var packageName = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageName');

	$("#packageNameApplnReferenceSet").text(packageName);
	if (packagemode == 'Package') {
		$("#showHideRestBtn").show();
		var getApplicationsForPackageReq = aplicationGridModel(packageID, gID);
		getAvailablePackages(getApplicationsForPackageReq, true);
	} else {
		$("#showHideRestBtn").hide();
		GetBundlesForPackage(packageID, gID, true);
	}
	$('#ApplicationView').modal('show');

}

function aplicationGridModel(packageID, gID) {
	var getApplicationsForPackageReq = new Object();
	getApplicationsForPackageReq.PackageId = packageID;
	if (gID == "jqxgridDownloadlib") {
		getApplicationsForPackageReq.State = 0;
	} else if (gID == 'addPackage') {
		getApplicationsForPackageReq.State = 1;
	} else if (gID == "jqxgridViewAddPackDownloadLib") {
		getApplicationsForPackageReq.State = 1;
	}
	else {
		getApplicationsForPackageReq.State = 0;
	}
	var param = new Object();
	param.getApplicationsForPackageReq = getApplicationsForPackageReq;

	return getApplicationsForPackageReq;
}

function getAvailablePackages(getApplicationsForPackageReq, isFromReferenceSet) {
	function callbackFunction(data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				availableApplicationGrid('jqxApplicationView', data.getApplicationsForPackageResp.Applications, isFromReferenceSet);
			}
		}
	}

	var method = 'GetApplicationsForPackage';
	var params = '{"token":"' + TOKEN() + '","getApplicationsForPackageReq":' + JSON.stringify(getApplicationsForPackageReq) + '}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

function availableApplicationGrid(gId, Applicationsdata, isFromReferenceSet) {

	var source =
		{
			dataType: "json",
			dataFields: [
				{ name: 'ApplicationName', map: 'ApplicationName' },
				{ name: 'ApplicationVersion', map: 'ApplicationVersion' },
				{ name: 'IsParameterizationEnabled', map: 'IsParameterizationEnabled' },
				{ name: 'ApplicationId', map: 'ApplicationId' },
			],
			root: 'Applications',
			contentType: 'application/json',
			localdata: Applicationsdata

		};

	var parameterRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
		if (value == true) {
			var applicationID = $("#" + gId).jqxGrid('getcellvalue', row, 'ApplicationId');
			var applicationName = $("#" + gId).jqxGrid('getcellvalue', row, 'ApplicationName');
			var applicationVersion = $("#" + gId).jqxGrid('getcellvalue', row, 'ApplicationVersion');
			var isParameterizationEnabled = $("#" + gId).jqxGrid('getcellvalue', row, 'IsParameterizationEnabled');
			if (isParameterizationEnabled == true) {
				var html = '<div  style="height:100px;cursor:pointer;text-align:center;padding-top: 4px;"><a  title="View Application"  onclick=ChildAplicationViewPopup(' + row + ',' + applicationID + ',"' + gId + '","' + applicationName + '","' + applicationVersion + '") role="button" style="text-decoration: underline;">VIEW</a></div>';
			} else {
				var html = '';
			}
		} else {
			return "";
		}
		return html;
	}
	var buildFilterPanel = function (filterPanel, datafield) {
		wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gId, true);
	}

	var dataAdapter = new $.jqx.dataAdapter(source);
	$("#" + gId).jqxGrid(
		{
			width: "100%",
			editable: true,
			source: dataAdapter,
			altRows: true,
			pageSize: 5,
			filterable: true,
			sortable: true,
			columnsResize: true,
			height: "200px",
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
			autoshowcolumnsmenubutton: false,
			showsortmenuitems: false,
			rowdetails: false,
			rowdetailstemplate: false,
			columns: [
				{
					text: i18n.t('app_name', { lng: lang }), filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}, dataField: 'ApplicationName', editable: false, width: 'auto'
				},
				{
					text: i18n.t('app_version', { lng: lang }), filtertype: "custom", dataField: 'ApplicationVersion', editable: false, width: 'auto',
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('ParameterDefination', { lng: lang }), filtertype: "custom", datafield: 'IsParameterizationEnabled', editable: false, filterable: false, hidden: true, sortable: false, menu: false, width: 'auto', cellsrenderer: parameterRenderer,
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
			]
		});
	if (isFromReferenceSet == true) {
		$("#" + gId).jqxGrid('hidecolumn', "IsParameterizationEnabled");
	}
}
function GetBundlesForPackage(packageID, gID, isFromReferenceSet) {
	var getBundlesForPackageReq = new Object();
	getBundlesForPackageReq.PackageId = packageID;

	if (gID == "jqxgridDownloadlib") {
		getBundlesForPackageReq.State = 0;
	} else if (gID == 'addPackage') {
		getBundlesForPackageReq.State = 1;
	} else {
		getBundlesForPackageReq.State = 0;
	}
	function callbackFunction(data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				AplicationViewGrid(data, gID, isFromReferenceSet);
			}
		}
	}
	var method = 'GetBundlesForPackage';
	var params = '{"token":"' + TOKEN() + '","getBundlesForPackageReq":' + JSON.stringify(getBundlesForPackageReq) + '}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

function ChildAplicationViewPopup(row, applicationID, gID, applicationName, applicationVersion) {
	$("#parameter_for_application").text(i18n.t('pramater_definition_for_application', { applicationName: applicationName, applicationVersion: applicationVersion }, { lng: lang }));
	$('#childApplicationView').modal('show');
	var getPDFForApplicationReq = new Object();
	getPDFForApplicationReq.ApplicationId = applicationID;
	getPDFForApplicationReq.State = 0;
	function callbackFunction(data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				var PDFFData = new Array();
				if (data.getPDFForApplicationResp)
					data.getPDFForApplicationResp = $.parseJSON(data.getPDFForApplicationResp);
				if (data.getPDFForApplicationResp.ParamDefFile) {
					var xml = data.getPDFForApplicationResp.ParamDefFile;

					var JsonXmlData = $.xml2json(xml);
					var containerArr = JsonXmlData.ParameterFile.Container;

					var count = 0;
					if (containerArr.length) {
						for (var i = 0; i < containerArr.length; i++) {
							count = count + 1;
							var parentObj = new Object();
							parentObj.Name = containerArr[i].Name;
							parentObj.Default = '';
							parentObj.ParentId = null;
							parentObj.ID = count;
							PDFFData.push(parentObj);

							for (var k = 0; k < containerArr[i].Param.length; k++) {
								count = count + 1;
								var childObj = new Object();
								childObj.Name = containerArr[i].Param[k].Name;
								childObj.Default = containerArr[i].Param[k].Default;
								childObj.ParentId = parentObj.ID;
								childObj.ID = count;
								PDFFData.push(childObj);
							}
							if (containerArr.Param) {
								for (var k = 0; k < containerArr.Param.length; k++) {
									count = count + 1;
									var childObj = new Object();
									childObj.Name = containerArr.Param[k].Name;
									childObj.Default = containerArr.Param[k].Default;
									childObj.ParentId = parentObj.ID;
									childObj.ID = count;
									PDFFData.push(childObj);
								}
							}
						}
					}
					else {
						var parentObj = new Object();
						parentObj.Name = containerArr.Name;
						parentObj.Default = '';
						parentObj.ParentId = null;
						parentObj.ID = count;
						PDFFData.push(parentObj);

						if (containerArr.Param) {
							for (var k = 0; k < containerArr.Param.length; k++) {
								count = count + 1;
								var childObj = new Object();
								childObj.Name = containerArr.Param[k].Name;
								childObj.Default = containerArr.Param[k].Default;
								childObj.ParentId = parentObj.ID;
								childObj.ID = count;
								PDFFData.push(childObj);
							}
						}
					}
				}

				generatePDATreeGrid(PDFFData, containerArr);

			}
		}
	}
	var method = 'GetPDFForApplication';
	var params = '{"token":"' + TOKEN() + '","getPDFForApplicationReq":' + JSON.stringify(getPDFForApplicationReq) + '}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

}

function generatePDATreeGrid(PDFFData, containerArr) {
	// prepare the data
	var source =
		{
			dataType: "json",
			dataFields: [
				{ name: 'ID', type: 'number' },
				{ name: 'ParentId', type: 'number' },
				{ name: 'Name', type: 'string' },
				{ name: 'Default', type: 'string' },

			],
			hierarchy:
			{
				keyDataField: { name: 'ID' },
				parentDataField: { name: 'ParentId' }
			},
			id: 'ID',
			localData: PDFFData
		};
	var dataAdapter = new $.jqx.dataAdapter(source);
	// create Tree Grid
	$("#PADTreeGrid").jqxTreeGrid(
		{
			width: 648,
			height: 400,
			source: dataAdapter,
			sortable: true,
			columnsResize: true,
			columnsReorder: true,
            selectionMode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
			filterable: false,
			sortable: false,
			ready: function () {
				for (var i = 0; i < PDFFData.length; i++) {
					$("#PADTreeGrid").jqxTreeGrid('expandRow', PDFFData[i].ID);
				}
			},
			columns: [
				{ text: 'Parameter Name', dataField: 'Name', minwidth: 323, width: 323 },
				{ text: 'Default Value', dataField: 'Default', minwidth: 323, width: 323 },
			]

		});
}

function AplicationViewGrid(data, gID, isFromReferenceSet) {
	if (data.getBundlesForPackageResp) {
		data.getBundlesForPackageResp = $.parseJSON(data.getBundlesForPackageResp);
	}
	ParentData = data.getBundlesForPackageResp.SubPackageDetails;
	if (data.getBundlesForPackageResp.SubPackageDetails) {
		var childData = data.getBundlesForPackageResp.SubPackageDetails[0].applicationDetails;
		var source =
			{
				datafields: [
					{ name: 'BundleName' },
					{ name: 'BundleVersion' },
					{ name: 'PackageId' }
				],
				root: "SubPackageDetails",
				datatype: "json",
				localdata: ParentData
			};
		var ParentAdapter = new $.jqx.dataAdapter(source);
		var childsource =
			{
				datafields: [
					{ name: 'ApplicationId', type: 'string', map: 'ApplicationId' },
					{ name: 'ApplicationName', type: 'string', map: 'ApplicationName' },
					{ name: 'ApplicationVersion', type: 'string', map: 'ApplicationVersion' },
					{ name: 'IsParameterizationEnabled', type: 'string', map: 'IsParameterizationEnabled' }
				],
				root: "ApplicationDetails",
				datatype: "json",
				localdata: childData
			};
		var childDataAdapter = new $.jqx.dataAdapter(childsource, { autoBind: true });
		appDetails = childDataAdapter.records;
		var nestedGrids = new Array();
		// create nested grid.
		var initrowdetails = function (index, parentElement, gridElement, record) {
			var id = record.uid.toString();
			var grid = $($(parentElement).children()[0]);

			nestedGrids[index] = grid;
			var appDetailsbyid = [];
			for (var m = 0; m < appDetails.length; m++) {
				appDetailsbyid.push(appDetails[m]);
			}
			var childsource = {
				datafields: [
					{ name: 'ApplicationId', type: 'string' },
					{ name: 'ApplicationName', type: 'string' },
					{ name: 'ApplicationVersion', type: 'string' },
					{ name: 'IsParameterizationEnabled', type: 'string' }
				],

				datatype: "json",
				localdata: appDetailsbyid
			}
			var nestedGridAdapter = new $.jqx.dataAdapter(childsource);
			var childAplicationrender = function (row, columnfield, value, defaulthtml, columnproperties) {
				var applicationID = $(grid).jqxGrid('getcellvalue', row, 'ApplicationId');
				var applicationName = $(grid).jqxGrid('getcellvalue', row, 'ApplicationName');
				var applicationVersion = $(grid).jqxGrid('getcellvalue', row, 'ApplicationVersion');
				var isParameterizationEnabled = $(grid).jqxGrid('getcellvalue', row, 'IsParameterizationEnabled');
				if (isParameterizationEnabled == true) {
					var html = '<div  style="height:100px;cursor:pointer;text-align:center"><a  title="View Application"  onclick=ChildAplicationViewPopup(' + row + ',' + applicationID + ',"' + gID + '","' + applicationName + '","' + applicationVersion + '") role="button" >VIEW</a></div>';
				} else {
					var html = '';
				}
				return html;
			}
			//Custom filter
			var buildFilterPanelNestedGrid = function (filterPanel, datafield) {
				wildfilterForApplicationView(filterPanel, datafield, nestedGridAdapter, grid);

			}


			if (grid != null) {

				grid.jqxGrid({
					source: nestedGridAdapter, width: 450, height: 120, sortable: true, filterable: true, autoshowcolumnsmenubutton: false, showsortmenuitems: false,
					columns: [
						{
							text: i18n.t('app_name', { lng: lang }), datafield: 'ApplicationName', width: 'auto', editable: false,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanelNestedGrid(filterPanel, datafield);
							}
						},
						{
							text: i18n.t('app_version', { lng: lang }), datafield: 'ApplicationVersion', width: 'auto', editable: false,
							filtertype: "custom",
							createfilterpanel: function (datafield, filterPanel) {
								buildFilterPanelNestedGrid(filterPanel, datafield);
							}
						},
						{ text: i18n.t('parameter_definition', { lng: lang }), datafield: 'IsParameterizationEnabled', width: 'auto', menu: false, editable: false, filterable: false, sortable: false, cellsrenderer: childAplicationrender }
					]
				});
				if (isFromReferenceSet == true) {
					$(grid).jqxGrid('hidecolumn', "IsParameterizationEnabled");
				}

				appViewNestedGrid = grid;
			}
		}

		var bundelRenderer = function (row, column, value) {
			return '<div style="float:left"><span style="margin-left: 4px; margin-top: 9px; float: left;">' + value + '</span></div><div class="btn-mg" style="float:right"><a class="btn" onclick="clearAppViewGrid(' + row + ')"  role="button"  title="Reset"><i class="icon-reset-filter"></i></a></div>';

		}

		var renderer = function (row, column, value) {
			return '<div style="float:left"><span style="margin-left: 4px; margin-top: 9px; float: left;">' + value + '</span></div>';

		}

		//Custom filter
		var buildFilterPanel = function (filterPanel, datafield) {
			genericBuildFilterPanel(filterPanel, datafield, source, 'jqxApplicationView');
		}
		$(" #gridmenujqxApplicationView ul li:first").css("display", "none")
		$(" #gridmenugridmenujqxApplicationView ul li:nth-child(2)").css("display", "none")
		$(" #gridmenugridmenujqxApplicationView ul li:nth-child(3)").css("display", "none")
		$(" #gridmenugridmenujqxApplicationView ul li:nth-child(4)").css("display", "none")
		$(" #gridmenugridmenujqxApplicationView").css("background-color", "transparent");


		// creage jqxgrid
		$("#jqxApplicationView").jqxGrid(
			{
				width: "100%",
				autoheight: true,
				source: source,
				rowdetails: true,
                selectionmode: 'none',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				sortable: true,
				initrowdetails: initrowdetails,
				rowdetailstemplate: { rowdetails: "<div id='grid' ></div>", rowdetailsheight: 150, rowdetailshidden: true },
				ready: function () {
					$("#jqxApplicationView").jqxGrid('showrowdetails', 1);
				},
				columns: [
					{
						text: i18n.t('bundle_name', { lng: lang }), datafield: 'BundleName', width: 450, sortable: false, editable: false, filterable: false, menu: false, cellsrenderer: bundelRenderer
					},
					{
						text: i18n.t('bundle_version', { lng: lang }), datafield: 'BundleVersion', width: 'auto', sortable: false, editable: false, filterable: false, menu: false, cellsrenderer: renderer,
					},
				]
			});
	}

}

function wildfilterForApplicationView(filterPanel, datafield, dataAdapter, grid) {

	grididforNestedGridFilter = grid;
	var funcGridId = !(_.isEmpty(dataAdapter._bindingUpdate)) ? dataAdapter._bindingUpdate[0].id : '';
	var filtergridid = !(_.isEmpty(dataAdapter._bindingUpdate)) ? dataAdapter._bindingUpdate[0].id : '';
	funcGridId = "'#gridmenu" + funcGridId + "'";
	var filterInfo = grid.jqxGrid('getfilterinformation');
	var storedFilterVal = '';
	for (i = 0; i < filterInfo.length; i++) {
		if (filterInfo[i].filtercolumn == datafield) {
			storedFilterVal = filterInfo[i].filter.getfilters()[0].value;
		}
	}
	var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
	var strinput = '';
	strinput += '<div class="grid-pop" style="width:194px;height: 38px;">';
	strinput += '<div class="con-area">';
	strinput += ' <div class="form-group mb0">';
	var funcfieldId = "'" + datafield + "'";
	strinput += ' <input id="txtfilter' + datafield + filtergridid + '" title="wildcard (%,*,?,_) can be used to match any sequence of chars or single char."   value="' + storedFilterVal + '" class="form-control txtfilterclass">'; //placeholder = "Test"
	strinput += ' </div>';

	strinput += ' </div>';
	//strinput += '<div class="btn-footer" style="padding: 9px; width: 194px; margin-top: -8px; margin-left: -1px;">';
	//strinput += '<button id="appgridfilterclear' + datafield + filtergridid+'" disabled=true  class="btn btn-default btnwildfilterClear ">' + i18n.t('reset', { lng: lang }) + '</button>';
	////strinput += '<button  onclick="applywildfilterForNestedGrid(' + funcfieldId + ',' + funcGridId + ',this)" class="btn btn-primary btnwildfilter ">' + i18n.t('go', { lng: lang }) + '</button>';
	//strinput += '<button id="appgridfilter' + datafield + filtergridid+ '"  class="btn btn-primary btnwildfilter ">' + i18n.t('go', { lng: lang }) + '</button>';
	//strinput += '</div>';
	strinput += ' </div>';
	inputdiv.append(strinput);
	filterPanel.append(inputdiv);

	var filtersource = _.where(filterInfo, { datafield: datafield });

	if (filtersource.length > 0) {
		$('.appgridfilterclear').attr('disabled', false);
	}
	var dataSource =
		{
			localdata: dataAdapter.records,
			async: false
		}
	var dataadapter = new $.jqx.dataAdapter(dataSource,
		{
			autoBind: false,
			autoSort: true,
			async: false,
			uniqueDataFields: [datafield]
		});
	var column = grid.jqxGrid('getcolumn', datafield);

	$("#appgridfilter" + datafield + filtergridid).on("click", function () {

		var checkvalue = $("#txtfilter" + datafield + filtergridid).val().trim();

		if (checkvalue.length > 0) {
			var filtergroup = new $.jqx.filter();
			var filter_or_operator = 1;
			var filtervalue = checkvalue;// $("#" + gId + datafield + "txtFilter").val();
			var filtercondition = 'contains';

			if (checkvalue.indexOf("*") >= 0 || checkvalue.indexOf("%") >= 0) {
				var chrArr = '';
				if (checkvalue.indexOf("%") >= 0) {
					chrArr = checkvalue.split('%');
				} else {
					chrArr = checkvalue.split('*');
				}
				if (chrArr[1] != '') {
					if (chrArr[2] != '') {
						filtercondition = 'ends_with';
						filtervalue = chrArr[1];
					} else {
						filtercondition = 'contains';
						filtervalue = chrArr[1];
					}
				} else {
					filtercondition = 'starts_with';
					filtervalue = chrArr[0];
				}
			} else {

				filtercondition = 'EQUAL';
			}

			var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
			filtergroup.addfilter(filter_or_operator, filter1);
			grid.jqxGrid('addfilter', datafield, filtergroup);
			grid.jqxGrid('applyfilters');
			grid.jqxGrid('closemenu');
			$('#appgridfilterclear' + datafield + filtergridid).attr('disabled', false);
			//appViewNestedGrid = grid;
		}
	});

	$("#appgridfilterclear" + datafield + filtergridid).on("click", function () {
		grid.jqxGrid('removefilter', datafield);
		grid.jqxGrid('closemenu');
		$("#txtfilter" + datafield + filtergridid).val('');
		$('#appgridfilterclear' + datafield + filtergridid).attr('disabled', true);

	});

	$('.txtfilterclass').keyup(function (e) {

		if (e.keyCode == 13) {

			applywildfilterForNestedGridOnEnter(datafield, filtergridid, $(this).val());
		}
	});
	$('.txtfilterclass').blur(function (e) {

		applywildfilterForNestedGridOnEnter(datafield, filtergridid, $(this).val());
	});
	setTimeout(function () {
		$("#txtfilter" + datafield + filtergridid).focus();
		$("#txtfilter" + datafield + filtergridid).val($("#txtfilter" + datafield + filtergridid).val());

	}, 200);

	$(".jqx-icon-arrow-down").on("click", function () {

		setTimeout(function () {

			$("#txtfilter" + datafield + filtergridid).focus();
			$("#txtfilter" + datafield + filtergridid).val($("#txtfilter" + datafield + filtergridid).val());
		}, 200);
	});

	$(" #gridmenugrid0").css("background-color", "transparent");
}

function applywildfilterForNestedGrid(datafield, gridid, self) {


	var control = $(self).closest('div').prev('div').children('div').children('input');
	var checkvalue = $(self).closest('div').prev('div').children('div').children('input').val().trim();


	if (checkvalue.length > 0) {
		var filtergroup = new $.jqx.filter();
		var filter_or_operator = 1;
		var filtervalue = checkvalue;
		var filtercondition = 'contains';
		if (checkvalue.indexOf("*") >= 0 || checkvalue.indexOf("%") >= 0) {
			var chrArr = '';
			if (checkvalue.indexOf("%") >= 0) {
				chrArr = checkvalue.split('%');
			} else {
				chrArr = checkvalue.split('*');
			}
			if (chrArr[1] != '') {
				if (chrArr[2] != '') {
					filtercondition = 'ends_with';
					filtervalue = chrArr[1];
				} else {
					filtercondition = 'contains';
					filtervalue = chrArr[1];
				}
			} else {
				filtercondition = 'starts_with';
				filtervalue = chrArr[0];
			}
		} else {

			filtercondition = 'EQUAL';
		}

		var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);

		//var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
		filtergroup.addfilter(filter_or_operator, filter1);
		grididforNestedGridFilter.jqxGrid('addfilter', datafield, filtergroup);
		grididforNestedGridFilter.jqxGrid('applyfilters');
		grididforNestedGridFilter.jqxGrid('closemenu');
		//$('.UIbtnwildfilterClear').attr('disabled', false);
		//$('#appgridfilterclear' + datafield).attr('disabled', false);
		$(".btnwildfilterClear").attr('disabled', false);
	} else {


	}



}

function applywildfilterForNestedGrid(datafield, gridid, self) {


	var control = $(self).closest('div').prev('div').children('div').children('input');
	var checkvalue = $(self).closest('div').prev('div').children('div').children('input').val().trim();


	if (checkvalue.length > 0) {
		var filtergroup = new $.jqx.filter();
		var filter_or_operator = 1;
		var filtervalue = checkvalue;
		var filtercondition = 'contains';
		if (checkvalue.indexOf("*") >= 0 || checkvalue.indexOf("%") >= 0) {
			var chrArr = '';
			if (checkvalue.indexOf("%") >= 0) {
				chrArr = checkvalue.split('%');
			} else {
				chrArr = checkvalue.split('*');
			}
			if (chrArr[1] != '') {
				if (chrArr[2] != '') {
					filtercondition = 'ends_with';
					filtervalue = chrArr[1];
				} else {
					filtercondition = 'contains';
					filtervalue = chrArr[1];
				}
			} else {
				filtercondition = 'starts_with';
				filtervalue = chrArr[0];
			}
		} else {

			filtercondition = 'EQUAL';
		}

		var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);

		//var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
		filtergroup.addfilter(filter_or_operator, filter1);
		grididforNestedGridFilter.jqxGrid('addfilter', datafield, filtergroup);
		grididforNestedGridFilter.jqxGrid('applyfilters');
		grididforNestedGridFilter.jqxGrid('closemenu');
		//$('.UIbtnwildfilterClear').attr('disabled', false);
		//$('#appgridfilterclear' + datafield).attr('disabled', false);
		$(".btnwildfilterClear").attr('disabled', false);
	} else {


	}



}

function applywildfilterForNestedGridOnEnter(datafield, gridid, checkvalue) {

	if (checkvalue.trim().length > 0) {
		var filtergroup = new $.jqx.filter();
		var filter_or_operator = 1;
		var filtervalue = checkvalue;
		var filtercondition = 'contains';
		if (checkvalue.indexOf("*") >= 0 || checkvalue.indexOf("%") >= 0) {
			var chrArr = '';
			if (checkvalue.indexOf("%") >= 0) {
				chrArr = checkvalue.split('%');
			} else {
				chrArr = checkvalue.split('*');
			}
			if (chrArr[1] != '') {
				if (chrArr[2] != '') {
					filtercondition = 'ends_with';
					filtervalue = chrArr[1];
				} else {
					filtercondition = 'contains';
					filtervalue = chrArr[1];
				}
			} else {
				filtercondition = 'starts_with';
				filtervalue = chrArr[0];
			}
		} else {

			filtercondition = 'EQUAL';
		}

		var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);

		//var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
		filtergroup.addfilter(filter_or_operator, filter1);
		grididforNestedGridFilter.jqxGrid('addfilter', datafield, filtergroup);
		grididforNestedGridFilter.jqxGrid('applyfilters');
		grididforNestedGridFilter.jqxGrid('closemenu');
		$(".btnwildfilterClear").attr('disabled', false);
	} else {
		grididforNestedGridFilter.jqxGrid('removefilter', datafield);
		grididforNestedGridFilter.jqxGrid('closemenu');
		$("#txtfilter" + datafield + gridid).val('');
		$('#appgridfilterclear' + datafield + gridid).attr('disabled', true);

	}

}

function clearAppViewGrid(row) {
	if ($("#grid" + row).length > 0) {
		$("#grid" + row).jqxGrid('removesort');
		$("#grid" + row).jqxGrid('clearfilters');
		$("#grid" + row).jqxGrid('updatebounddata');
		$("#grid" + row).jqxGrid('clearselection');
		appViewNestedGrid = $("#grid" + row)
	}
	else {
		if (appViewNestedGrid != '') {
			// appViewNestedGrid.jqxGrid('removesort');
			appViewNestedGrid.jqxGrid('clearfilters');
			appViewNestedGrid.jqxGrid('updatebounddata');
			appViewNestedGrid.jqxGrid('clearselection');
		}
	}


}

function getSysLang() {

	var language = navigator.language || navigator.userLanguage;//window.navigator.language;//navigator.userLanguage;
	language = language.substring(0, 2);
	return language;

}
function Token_Expired() {
	if (VHQFlag === true && location.href != "loggedOut.html") {
		location.href = AppConstants.get('LOGOUT_URL') + '?tokenexpired=true';
	}
}
function Auth_Expired() {
    clearSessionStorage(ENUM.get('INVALIDAUTHLOGOUT'));
}

isLoggedOut = false;

function logout(logoutValue) {

	var logoutReason = logoutValue;

	if (logoutValue == ENUM.get('SSOLOGOUT')) {
		clearSessionStorage(logoutReason);
		return;
	}

	function callbackFunction(data, error) {

		if (data) {

			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				clearSessionStorage(logoutReason);
			}
		}
	}
	if (refreshIntervalId != '') {
		clearInterval(refreshIntervalId);
		refreshIntervalId = '';
	}
	autoRefreshDownloadProgressStop();
	isLoggedOut = true;
	var params = '{"token":"' + TOKEN() + '","logoutReason":"' + logoutReason + '"}';
	ajaxJsonCall('Logout', params, callbackFunction, true, 'POST', true);

}

function autoRefreshDownloadProgressStop() {
	if (autoRefreshIntervalId != '') {
		window.clearInterval(autoRefreshIntervalId);
		autoRefreshIntervalId = '';
	}
}

function clearSessionStorage(logOutType) {

	var mysession = sessionStorage;
	var i = mysession.length;
	while (i--) {
		if (mysession.key(i).indexOf("gridStorage") > -1
			|| mysession.key(i).indexOf("adStorage") > -1
			|| mysession.key(i).indexOf("PageStorage") > -1
			|| mysession.key(i).indexOf("chartStorage") > -1
			|| mysession.key(i).indexOf("filterStorage") > -1
			|| mysession.key(i).indexOf("ShowHideCol") > -1
			|| mysession.key(i).indexOf("DevProfileUniqueDeviceId") > -1) {
			sessionStorage.removeItem(mysession.key(i));
		}
	}
	sessionStorage.setItem("chartlist", []);
	sessionStorage.setItem("Pagelist", []);
	sessionStorage.setItem("gridlist", []);
	sessionStorage.setItem("adlist", []);
	sessionStorage.setItem("filterlist", []);
	sessionStorage.removeItem('exportStorage');
	sessionStorage.setItem("userrData", "");
    window.localStorage.clear();

	

	if (logOutType == ENUM.get('IDLELOGOUT'))
        location.href = AppConstants.get('LOGOUT_URL') + '?timeout=true';
    else if (logOutType == ENUM.get('INVALIDAUTHLOGOUT'))
        location.href = AppConstants.get('LOGOUT_URL') + '?authexpired=true';
	else
		location.href = AppConstants.get('LOGOUT_URL');
}

function GetBundleForPackage(GetApplicationsReq) {
	packageMode = GetApplicationsReq.State;

	$.ajax({
		type: "POST",
		url: AppConstants.get('API_URL') + "/GetBundlesForPackage",
		data: '{"token":"' + TOKEN() + '","GetApplicationsForPackageReq":' + JSON.stringify(GetApplicationsReq) + '}',
		contentType: 'application/json',
		dataType: "json",
		success: function (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				acApplications = data.getBundlesForPackageResp.SubPackageDetails;
			}
		},
		error: function (jqXHR, status, error) {
			if (jqXHR != null) {
				ajaxErrorHandler(jqXHR, status, error);
				if (jqXHR.status != 401) {
					openAlertpopup(2, 'network_error');
				}
			} else {
				openAlertpopup(2, 'network_error');
			}

		}
	});
}
//
function resetPreloaderOfDashboard(modelPopup) {
	var strtext = '';
	var title = '';

	var IsVFSSO = customerData[0].IsVFSSOIdP;
	var IsDefault = customerData[0].IsDefault;
    var IsForgeRockIDP = customerData[0].IsForgeRockIDP;

	var LDAP = customerData[0].LDAP;
	var IsVHQProfile = false;
	if (!IsVFSSO && !IsForgeRockIDP && IsDefault && LDAP == '') {
		IsVHQProfile = true;
	}
	
	if (customerData[0].EnforceVHQSecurityPolicies) {
		if (customerData[0].UserPolicyInfo.NotifyUserofPasswordExpiry) //if user password is about to expire
		{
			if (userData[0].IsCommonUser) {

				strtext = generateNotificationPopup('', 7);
				title = i18n.t('warning_title')
				callgritterPopup(title, strtext, true, '', '', 'changePassword', '', '', modelPopup);
				return true;
			} else {

				strtext = generateNotificationPopup('', 7);
				title = i18n.t('confirmation_title')
				callgritterPopup(title, strtext, '', '', '', 'changePassword', true, true, modelPopup);
				return true;
			}
		} else if (customerData[0].UserPolicyInfo.IsPasswordChangeRequired && IsVHQProfile) {
			showChangePasswordPopup(modelPopup);
			changePassword();
			return false;
		}
	}
	else {
		if (customerData[0].UserPolicyInfo.IsPasswordChangeRequired && IsVHQProfile) {
			showChangePasswordPopup(modelPopup);
			changePassword();
			return false;
		}
	}

	if (customerData[0].EnforceVHQSecurityPolicies) {
		if (customerData[0].CustomerLicenseInfo.NotifyUserofLicenseExpiry && customerData[0].CustomerLicenseInfo.NotifyUserofDeviceLimitExceeds) {
			//    if (userData[0].IsCommonUser ) {
			var showPopup = userPasswordExpiryNotification("notify_license_device", modelPopup);
			if (showPopup)
				return true;
			//  }
		}
		else if (customerData[0].CustomerLicenseInfo.NotifyUserofLicenseExpiry) //licence expiry notification
		{

			var showPopup = userPasswordExpiryNotification("notify_license_expiry", modelPopup);
			if (showPopup)
				return true;
		}
		else if (customerData[0].CustomerLicenseInfo.NotifyUserofDeviceLimitExceeds) //device limit
		{
			var showPopup = userPasswordExpiryNotification("notify_device_limit", modelPopup);
			if (showPopup)
				return true;
		}
	} else {

		if (customerData[0].CustomerLicenseInfo.NotifyUserofLicenseExpiry && customerData[0].CustomerLicenseInfo.NotifyUserofDeviceLimitExceeds) {
			if (customerData[0].CustomerLicenseInfo.LicensedDeviceCount == customerData[0].CustomerLicenseInfo.NumberOfDeviceCount) {

				strtext = generateNotificationPopup('device_count_exceeded', 4);
				title = i18n.t('warning_title')
				callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
				return true;
			}
			else {

				strtext = generateNotificationPopup('device_limit_exceeded', 4);
				title = i18n.t('warning_title')
				callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
				return true;

			}
		}
		else if (customerData[0].CustomerLicenseInfo.NotifyUserofLicenseExpiry) {

			strtext = generateNotificationPopup('', 6);
			title = i18n.t('warning_title')
			callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
			return true;

		}
		else if (customerData[0].CustomerLicenseInfo.NotifyUserofDeviceLimitExceeds) {
			if (customerData[0].CustomerLicenseInfo.LicensedDeviceCount == customerData[0].CustomerLicenseInfo.NumberOfDeviceCount) {

				strtext = generateNotificationPopup('device_count_exceeded', 3);
				title = i18n.t('warning_title')
				callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
				return true;
			}
			else {

				strtext = generateNotificationPopup('device_limit_exceeded', 3);
				title = i18n.t('warning_title')
				callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
				return true;
			}
			return;
		}
	}
}

function showChangePasswordPopup(modelPopup) {
	$('#deviceProfileModel').modal('show');
	$('#modePopupDiv').removeClass('hide');
	$('#hierarchyPopupDiv').addClass('hide');
	modelPopup(true);
}

function changePassword() {
	// koUtil.isChangePasswordrequired = 1;
	if (customerData[0].UserPolicyInfo.IsPasswordChangeRequired == true) {
		$("#closeBtn").hide();
		//$("#configValueText").show();
		$("#cancel_password").hide();
		isChangePasswordrequired = 1;
	} else {
		$("#closeBtn").show();
		//$("#configValueText").hide();
		$("#cancel_password").show();
		isChangePasswordrequired = 0;
	}
}

function userPasswordExpiryNotification(str, modelPopup) {

	var strtext = '';
	var title = '';
	switch (str) {
		case "notify_license_device": //license is about to expire and device limit approaching
			{

				if (customerData[0].UserPolicyInfo.NotifyUserofPasswordExpiry) //user password & license are about to expire and device limit approaching
				{

					if (userData[0].IsCommonUser) {

						if (customerData[0].CustomerLicenseInfo.LicensedDeviceCount == customerData[0].CustomerLicenseInfo.NumberOfDeviceCount) {

							strtext = generateNotificationPopup('device_count_exceeded', 1);
							title = i18n.t('warning_title', { lng: lang });
							callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
							return true;
						}
						else {

							strtext = generateNotificationPopup('device_limit_exceeded', 1);
							title = i18n.t('warning_title', { lng: lang });
							callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
							return true;
						}
					}
					else {

						if (customerData[0].CustomerLicenseInfo.LicensedDeviceCount == customerData[0].CustomerLicenseInfo.NumberOfDeviceCount) {

							strtext = generateNotificationPopup('device_count_exceeded', 1);
							title = i18n.t('confirmation_title', { lng: lang });
							callgritterPopup(title, strtext, '', true, true, 'changePassword', '', '', modelPopup);
							return true;
						}
						else {

							strtext = generateNotificationPopup('device_limit_exceeded', 1);
							title = i18n.t('confirmation_title', { lng: lang });
							callgritterPopup(title, strtext, '', true, true, 'changePassword', '', '', modelPopup);
							return true;
						}
					}
				}
				else //license is about to expire and device limit approaching
				{

					if (customerData[0].CustomerLicenseInfo.LicensedDeviceCount == customerData[0].CustomerLicenseInfo.NumberOfDeviceCount) {

						strtext = generateNotificationPopup('device_count_exceeded', 4);
						title = i18n.t('warning_title', { lng: lang });
						callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
						return true;
					}
					else {
						strtext = generateNotificationPopup('device_limit_exceeded', 4);
						title = i18n.t('warning_title', { lng: lang });
						callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
						return true;
					}
				}
				break;
			}
		case "notify_license_expiry": //license is about to expire
			{

				if (customerData[0].UserPolicyInfo.NotifyUserofPasswordExpiry) //user password and license is about to expire
				{
					if (userData[0].IsCommonUser) {
						strtext = generateNotificationPopup('license_expiring_today', 5);
						title = i18n.t('warning_title', { lng: lang });
						callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
						return true;
					}
					else {
						strtext = generateNotificationPopup('license_expiring_today', 5);
						title = i18n.t('confirmation_title', { lng: lang });
						callgritterPopup(title, strtext, '', true, true, 'changePassword', '', '', modelPopup);
						return true;
					}
				}
				else //license is about to expire
				{
					if (customerData[0].CustomerLicenseInfo.NumberOfDaysToLicenseExpire == 0)
						strtext = generateNotificationPopup('license_expiring_today', 6);
					else
						strtext = generateNotificationPopup('', 6);
					title = i18n.t('warning_title', { lng: lang });
					callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
					return true;
				}
				break;
			}
		case "notify_device_limit": //device limit approaching
			{
				if (customerData[0].UserPolicyInfo.NotifyUserofPasswordExpiry) //user password is about to expire and device limit approaching
				{
					if (userData[0].IsCommonUser) {
						if (customerData[0].CustomerLicenseInfo.LicensedDeviceCount == customerData[0].CustomerLicenseInfo.NumberOfDeviceCount) {

							strtext = generateNotificationPopup('device_count_exceeded', 2);
							title = i18n.t('warning_title', { lng: lang });
							callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
							return true;
						}
						else {

							strtext = generateNotificationPopup('device_limit_exceeded', 2);
							title = i18n.t('warning_title', { lng: lang });
							callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
							return true;
						}
					}
					else {

						if (customerData[0].CustomerLicenseInfo.LicensedDeviceCount == customerData[0].CustomerLicenseInfo.NumberOfDeviceCount) {

							strtext = generateNotificationPopup('device_count_exceeded', 2);
							title = i18n.t('confirmation_title', { lng: lang });
							callgritterPopup(title, strtext, '', false, false, 'changePassword', true, true, modelPopup);
							return true;
						}
						else {

							strtext = generateNotificationPopup('device_limit_exceeded', 2);
							title = i18n.t('confirmation_title', { lng: lang });
							callgritterPopup(title, strtext, '', false, false, 'changePassword', true, true, modelPopup);
							return true;
						}
					}
				}
				else //device limit approaching
				{
					if (customerData[0].CustomerLicenseInfo.LicensedDeviceCount == customerData[0].CustomerLicenseInfo.NumberOfDeviceCount) {

						strtext = generateNotificationPopup('device_count_exceeded', 3);
						title = i18n.t('warning_title', { lng: lang });
						callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
						return true;
					}
					else {

						strtext = generateNotificationPopup('device_limit_exceeded', 3);
						title = i18n.t('warning_title', { lng: lang });
						callgritterPopup(title, strtext, true, '', '', 'userLicenseExpiredOrDeviceLimit', '', '', modelPopup);
						return true;
					}
				}
				break;
			}
		default:
			{
				break;
			}
	}
}

function generateNotificationPopup(exceeded, flag) {

	var strtext = '';
	if (flag == 1 || flag == 2 || flag == 5) {
		strtext += '1. ';
	}
	if (flag == 1 || flag == 4 || flag == 6) {
		if (customerData[0].CustomerLicenseInfo.NumberOfDaysToLicenseExpire == 0)
			strtext += i18n.t(exceeded, { lng: lang }) + '<br/><br/>';
		else
			strtext += i18n.t('license_expiry', { lng: lang }) + ' ' + customerData[0].CustomerLicenseInfo.NumberOfDaysToLicenseExpire + ' ' + i18n.t('expiry_days', { lng: lang }) + '<br/><br/>';
	}
	if (flag == 5) {
		if (customerData[0].CustomerLicenseInfo.NumberOfDaysToLicenseExpire == 0)
			strtext += i18n.t(exceeded, { lng: lang }) + '<br/><br/>';
		else
			strtext += i18n.t('license_expiry', { lng: lang }) + ' ' + customerData[0].CustomerLicenseInfo.NumberOfDaysToLicenseExpire + ' ' + i18n.t('expiry_days', { lng: lang }) + '<br/><br/>';
	}
	if (flag == 1 || flag == 2 || flag == 3 || flag == 4) {
		strtext += i18n.t(exceeded, { lng: lang }) + '<br/>';
	}
	if (flag == 1 || flag == 2 || flag == 3 || flag == 4) {
		strtext += '<P>' + i18n.t('license_limit', { lng: lang }) + ' ' + customerData[0].CustomerLicenseInfo.LicensedDeviceCount + ' ' + i18n.t('devices', { lng: lang }) + '<br/>';
		strtext += i18n.t('current_num_of_devices', { lng: lang }) + ' ' + customerData[0].CustomerLicenseInfo.NumberOfDeviceCount + '<br/><br/>';
	}
	if (flag == 1 || flag == 2 || flag == 3 || flag == 4 || flag == 5 || flag == 6) {
		strtext += i18n.t('license_renewal', { lng: lang }) + '<br/><br/>'
	}
	if (flag == 1 || flag == 2 || flag == 5) {
		strtext += '2. ';
	}
	if (flag == 1 || flag == 2 || flag == 5 || flag == 7) {
		if (customerData[0].UserPolicyInfo.NumberOfDaysToExpire == 0)
			strtext += i18n.t('Password_expiry_today', { lng: lang }) + ' ';
		else
			strtext += i18n.t('Password_expiry', { lng: lang }) + ' ' + customerData[0].UserPolicyInfo.NumberOfDaysToExpire + " " + i18n.t('expiry_days', { lng: lang }) + ' ';
	}
	if (flag == 1 || flag == 2 || flag == 5) {
		strtext += i18n.t('please_change_password', { lng: lang }) + '<br/>';
	}
	return strtext;
}

function callgritterPopup(title, strtext, btnOk, btnYes, btnNo, callfunction, btnChange, btnContinue, modelPopup) {
	/// model popup code
	$("#myModalLabel").empty();
	$("#myModalLabel").append(title);
	$("#msgBody").empty();
	$("#msgBody").append(strtext);

	if (btnOk) {
		$("#pbtnOK").show();
		//$("#pbtnOK").click(function () {
		//    popupcallFunction(callfunction);
		//});
	} else {
		$("#pbtnOK").hide();
	}
	if (btnYes) {
		$("#pbtnYES").show();
		$("#pbtnYES").click(function () {
			popupcallFunction(callfunction, modelPopup);
		});
	} else {
		$("#pbtnYES").hide();
	}
	if (btnNo) {
		$("#pbtnNO").focus();
		$("#pbtnNO").show();
	} else {
		$("#pbtnNO").hide();
	}
	if (btnChange) {
		$("#pbtnChange").show();
		$("#pbtnChange").click(function () {
			popupcallFunction(callfunction, modelPopup);
		});
	} else {
		$("#pbtnChange").hide();
	}

	if (btnContinue) {
		$("#pbtnContinue").show();
	} else {
		$("#pbtnContinue").hide();
	}
}

function popupcallFunction(callValue, modelPopup) {
	if (callValue == "userLicenseExpiredOrDeviceLimit") {
		if (customerData[0].UserPolicyInfo.IspasswordChangeRequired && IsVHQProfile) {
			showChangePasswordPopup(modelPopup);
		}
	} else if (callValue == "changePassword") {
		showChangePasswordPopup(modelPopup);
	}
}

function validateFileName(filename, type) {
	var contentFile = contentPackageFileTypes;
	var systemFile = softwarePackageExtensions.split(',');
	var hierarchyFile = ['csv', 'xml'];
	var applicationFile = ['vpdx'];
	var applicationFilevpf = ['vpfx'];
	var vrkFile = ['tgz', 'zip'];
	var appFile = ['zip'];
	var sponsorFile = ['crt'];
	var deviceAttributeFile = ['csv'];

	var ext = filename.split('.').pop().toLowerCase();

	if (type == 1 && $.inArray(ext, contentFile) == -1) {
		return false;
	} else if (type == 2 && $.inArray(ext, systemFile) == -1) {
		return false;
	} else if (type == 3 && $.inArray(ext, hierarchyFile) == -1) {
		return false;
	} else if (type == 4 && $.inArray(ext, applicationFile) == -1) {
		return false;
	} else if (type == 5 && $.inArray(ext, applicationFilevpf) == -1) {
		return false;
	} else if (type == 6 && $.inArray(ext, vrkFile) == -1) {
		return false;
	} else if (type == 7 && $.inArray(ext, appFile) == -1) {
		return false;
	} else if (type == 8 && $.inArray(ext, sponsorFile) == -1) {
		return false;
	} else if (type === 9 && $.inArray(ext, deviceAttributeFile) === -1) {
		return false;
	}
	return true;
}
function FindHierarchyLevelName(level) {
	switch (level) {
		case 1: return "Company";
		case 2: return "Region";
		case 3: return "District";
		case 4: return "Salon";
		default: return level;
	}
}


function columnGroupClickLinkGridStyle(gId) {

	setTimeout(function () {
		$("#columntable" + gId + " .jqx-grid-column-header:eq(1)").css({ "top": "-13px" });

		$("#columntable" + gId + " .jqx-grid-column-header:eq(2)").css({ "top": "-13px" });
		$("#columntable" + gId + " .jqx-grid-column-header:eq(3)").css({ "top": "-13px" });

		$("#columntable" + gId + " .jqx-grid-columngroup-header").css({ "border-bottom-style": "none" });

		$("#columntable" + gId + " .jqx-grid-column-header:eq(4)").css({ "bottom": "auto" });
		$("#columntable" + gId + " .jqx-grid-column-header:eq(5)").css({ "bottom": "auto" });


		$("#columntable" + gId + " .sortasc:eq(1)").css({ "margin-top": "3px" });
		$("#columntable" + gId + " .sortdesc:eq(1)").css({ "margin-top": "3px" });
		$("#columntable" + gId + " .sortasc:eq(2)").css({ "margin-top": "3px" });
		$("#columntable" + gId + " .sortdesc:eq(2)").css({ "margin-top": "3px" });


		$("#columntable" + gId + " .jqx-grid-column-menubutton jqx-icon-arrow-down").css({ "margin-top": "3px" });
		$("#columntable" + gId + ".jqx-grid-column-filterbutton").css({ "margin-top": "3px" });
		$("#menuWrappergridmenu" + gId + "").css({ "margin-top": "-9px" });
	}, 500);




}

function storeVerticalTabInSession(pageName, tabName) {
	var pageName = pageName;
	var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));

	if (PageStorage) {

		PageStorage[0].selectedVerticalTabName = tabName;

		//alert("before  "+JSON.stringify(PageStorage[0].selectedTabName));

		var updatedPageStorage = JSON.stringify(PageStorage);
		window.sessionStorage.setItem(pageName + "PageStorage", updatedPageStorage);
	}
}

function mapObjectToArray(userDataArr) {
	var widgetListParseArray = [];
	for (keyin in userDataArr) {
		var obj = new Object();
		obj.Key = keyin;
		obj.Value = userDataArr[keyin];
		widgetListParseArray.push(obj);
	}
	return widgetListParseArray;
}

$(".titleOfUser").on('click', function () {
	var textMax = 50;
	var textLength = $('#titleOfUser').val().length;
	var textRemaining = textMax - textLength;
	if ($("#titleOfUser").val() != "")
		$("#btnSave").prop('disabled', false);
});
function updateComponentsOnUserAuthentication(self, screenName) {
	if (screenName == 'users') {
		if (IsVHQAuthorizedUser) {
			$("#addUserBtn").show();
			$("#deactivateBtn").show();
		} else {
			$("#addUserBtn").hide();
			$("#deactivateBtn").hide();
		}
	} else if (screenName == 'modelAddUser') {

		if (!IsVFSSOUser && !IsForgeRockUser && customerData[0].LDAP == '') {
			self.SHOW_EMAILINFO(true);
		} else if (!IsVFSSOUser && !IsForgeRockUser && customerData[0].LDAP != '') {
			self.SHOW_EMAILINFO(false);
		}
		//AD instance enable/disable
		//Check user button is visible only if Authentication mode is AD/ADFS
		if (self.IsADProfile()) {
			$("#primaryPhoneDiv").removeClass('form-group-user');
			$("#primaryPhoneDiv").addClass('form-group-aduser');
			$("#firstName").prop("disabled", true);
			$("#lastName").prop("disabled", true);
			$("#title").prop("disabled", true);
			$("#primaryPh").prop("disabled", true);
			$("#alternatePh").prop("disabled", true);
			$("#checkUserBtn").prop('value', 'Check User');
			$("#checkUserBtn").show();
		} else {
			$("#firstName").prop("disabled", false);
			$("#lastName").prop("disabled", false);
			$("#title").prop("disabled", false);
			$("#primaryPh").prop("disabled", false);
			$("#alternatePh").prop("disabled", false);
			$("#checkUserBtn").hide();
		}

		if (self.IsVFSSOProfile()) {
			$("#hierarchyRolesDiv").removeClass('col-md-4');
			$("#hierarchyRolesDiv").addClass('col-md-6');
		}
		else if (self.IsForgeRockProfile()) {
			$("#hierarchyRolesDiv").removeClass('col-md-4');
			$("#hierarchyRolesDiv").addClass('col-md-6');
		}
		else if (self.IsVHQProfile() || self.IsADProfile()) {
			self.SHOW_VHQNATIVECONTROLS(true);
			$("#hierarchyRolesDiv").removeClass('col-md-6');
			$("#hierarchyRolesDiv").addClass('col-md-4');
		} else if (self.IsADFSProfile()) {
			self.SHOW_VHQNATIVECONTROLS(true);
			$("#selectHierarhiesDiv").hide();
			$("#hierarhiesGridDiv").hide();
		}

		//Role is visible only if Authorization mode is VHQ
		if (self.IsVHQProfile() || IsVHQAuthorizedUser) {
			$("#rolesDropdown").show();
			$("#roleLabel").show();
			$("#mandatoryRole").show();
		} else {
			$("#rolesDropdown").hide();
			$("#roleLabel").hide();
			$("#mandatoryRole").hide();
		}

		//Disable Roles and Hierarchies on flag IsHierarchyAccessViaADFS
		if (IsHierarchyAccessViaADFS) {
			$("#selectHierarhiesDiv").hide();
			$("#hierarhiesGridDiv").hide();
		} else {
			$("#selectHierarhiesDiv").show();
			$("#hierarhiesGridDiv").show();
		}

	} else if (screenName == 'modelEditUser') {

		if (IsVFSSOUser || IsForgeRockUser) {
			self.SHOW_VHQNATIVECONTROLS(false);
			self.IsReadOnly(true);
			if (IsVHQAuthorizedUser && IsExternalIdp == false) {
				self.IsReadOnly(false);
			}
		} else {
			self.SHOW_VHQNATIVECONTROLS(true);
			if (IsADFSUser || IsADUser) {
				self.IsReadOnly(true);
			} else {
				self.IsReadOnly(false);
			}
		}
		if (self.IsADProfile()) {
			$("#primaryPhoneDiv").removeClass('form-group-user');
			$("#primaryPhoneDiv").addClass('form-group-aduser');
		}
		if (self.IsVFSSOProfile()) {
			$("#hierarchyRolesDiv").removeClass('col-md-4');
			$("#hierarchyRolesDiv").addClass('col-md-6');
		} else if (self.IsForgeRockProfile()) {
			$("#hierarchyRolesDiv").removeClass('col-md-4');
			$("#hierarchyRolesDiv").addClass('col-md-6');
		} else if (self.IsVHQProfile() || self.IsADProfile()) {
			self.SHOW_VHQNATIVECONTROLS(true);
			$("#hierarchyRolesDiv").removeClass('col-md-6');
			$("#hierarchyRolesDiv").addClass('col-md-4');
		} else if (self.IsADFSProfile()) {
			self.SHOW_VHQNATIVECONTROLS(true);
			$("#selectHierarhiesDiv").hide();
			$("#hierarhiesGridDiv").hide();
		}

		//Disable Roles and Hierarchies on flag IsHierarchyAccessViaADFS
		if (IsHierarchyAccessViaADFS) {
			$("#editHierarhiesDiv").hide();
		} else {
			$("#editHierarhiesDiv").show();
		}
	} else if (screenName == 'modelUserProfile') {
		if (IsVFSSOUser || IsForgeRockUser) {
			self.SHOW_VHQNATIVECONTROLS(false);
			self.IsReadOnly(true);
			if (IsVHQAuthorizedUser && IsExternalIdp == false) {
				self.IsReadOnly(false);
			}
		} else {
			self.SHOW_VHQNATIVECONTROLS(true);
			if (IsADFSUser || IsADUser) {
				self.IsReadOnly(true);
			} else {
				self.IsReadOnly(false);
			}
		}
		if (IsExternalIdp || IsADUser) {
			self.IsReadOnly(true);
			$("#changePasswordDiv").hide();
			if (IsVFSSOUser || IsForgeRockUser) {
				$("#changePasswordWSO2Div").hide();
			}
		} else {
			$("#changePasswordDiv").show();
			if (IsVFSSOUser || IsForgeRockUser) {
				$("#changePasswordWSO2Div").show();
			}
		}
	}
}

//on redirection from Care Dashboard
function getCareData(careData) {
    var careObject = new Object();
    careObject.Identifier = careData.identifier;
    careObject.ChartValue = careData.chartValue;
    careObject.BarValue = ENUM.get(careData.barValue);
    careObject.UnassignedGroups = careData.isUnassignedGroups;

    return careObject;
}
function exportjqxcsvData(gID,name){
	$("#" + gID).jqxGrid('exportdata', 'csv', name,true,null,false,AppConstants.get('PHP_SERVER_URL')+'/dataexport.php');
}