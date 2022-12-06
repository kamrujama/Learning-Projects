var PopupRow;
var protocolName = '';
var ModelName = '';
var IsTablet = false;
rowOfDownloadAutomation = 0;
var isAutoDownload = '';
var isAutoDownloadStatus = true;
define(["knockout", "autho", "koUtil", "constants", "globalFunction", "appEnum", "download",], function (ko, autho, koUtil) {

	applicationDetailsArray = new Array();
	var lang = getSysLang();
	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});
	var gidForExportShowHideAndReset;
	var exportFileName = 'Device Detail';
	GridIDBoundlesApp = 0;
	columnSortFilterKeyProfiles = new Object();

	koUtil.GlobalColumnFilter = new Array();
	var compulsoryfields = [];

	return function deviceProfileInfoViewModel() {

		protocolName = koUtil.Protocol;
		ModelName = koUtil.ModelName;
		$("#showNoDataMessage").hide();
		koUtil.isDeviceDetails = 'DeviceDetails';
		setIdForDeviceDetailsTab = "datagridHardwareProfileGridDiv";
		koUtilUniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
		koUtilProtocol = koUtil.Protocol;
		koUtilFamily = koUtil.deviceFamily;
		isEdit = true;
		that = this;
		isEnableForAutomation = false;
		isEnableForAutomationBtnChk = false;
		isSoftwareStatusGridLoaded = false;
		var self = this;

		var deviceprofilDataSetContent = '';
		var memoryprofileDataSetContent = '';
		var ApplicationDataSetContent = '';
		var WifiProfileDataSetContent = '';
		var BlueToothProfileDataSetContent = '';
		var EncryptionKeyDataSetContent = [];
		var keyInventoryJsonData = [];
		var datagridCertificateDataSetContent = [];
		var certificatesJsonData = [];
		var datagridCustomIdentifierDataSetContent = [];
		var Verishield_ProtectDataSetContent = [];
		var deviceDataArr = koUtil.deviceProfileData();
		koUtil.deviceProfileXSDVersion('');

		self.templateXML = ko.observableArray();
		self.templateXML(koUtil.devicetemplateXML());

		var deviceProfile = self.templateXML();
		self.vlcDetailCheckDataforTxtbox = ko.observable(true);
		self.VCLDiagPageDivDataIsCheck = ko.observable(false);

		self.Details = ko.observableArray();
		self.deviceProfileInformationData = ko.observableArray();
		self.deviceProfileTabletInformation = ko.observableArray();
		self.carbonDeviceProfileInformation = ko.observableArray();
		self.infoGridSourceArr = ko.observableArray();
		self.infoGridColumnArr = ko.observableArray();
		self.downloadApps = ko.observableArray();
		self.downloadBundles = ko.observableArray();
		self.bundlesApps = ko.observableArray();
		self.packageFiles = ko.observableArray();
		self.softwareApplications = ko.observableArray();
		self.softwareApplicationsData = ko.observableArray();
		self.vclDetails = ko.observable();
		self.VCLDiagPage = ko.observableArray();
		self.verishildProtectData = ko.observableArray();
		self.wifiProfileData = ko.observableArray();
		self.blueToothProfileData = ko.observableArray();

		//for pop up
		self.observableModelPopup = ko.observable();
		self.deviceDetailPopUpComponent = ko.observable();
		self.templateFlag = ko.observable(false);
		self.columnlist = ko.observableArray();
		self.gridIdForShowHide = ko.observable();

		var modelName = 'unloadTemplate';
		loadelement(modelName, 'genericPopup');

		//self.showhidfroVLCGrid = function () {
		//    self.gridIdForShowHide(gidForExportShowHideAndReset);
		//    self.columnlist(genericHideShowColumn(gidForExportShowHideAndReset, true, compulsoryfields));
		//    loadelement(popupName, 'genericPopup');
		//    $('#deviceDatail').modal('show');
		//}

		self.observableParamConponent = ko.observableArray();
		var parammodel = 'unloadTemplate';
		loadelementParam(parammodel, 'genericPopup');

		compulsoryfields = [];
		//--------------------------------------SHOW HIDE COLUMN----------RESET FILTER-----------AND---EXPORT -FILTER----------------  
		self.verishieldProtectVlcShowHide = function (data) {
			self.templateFlag(true);
			compulsoryfields = ['Name'];
			var gridId = "VCLDiagPageGrid" + data;
			self.gridIdForShowHide(gridId);
			self.columnlist(genericHideShowColumn(gridId, true, compulsoryfields));
			loadelement('modelShowHideCol', 'genericPopup');
			$('#deviceDatail').modal('show');
		}

		self.verishieldProtectVlcclearfilter = function (data) {
			var gridId = "VCLDiagPageGrid" + data;
			clearUiGridFilter(gridId);
		}

		//Export to excel
		self.verishieldProtectVlcExportToXls = function (data) {
			var verishieldProtectVlcExportFileName = Verishield_ProtectDataSetContent[0].VCLDiagPage[data].Title;
			var gridId = "VCLDiagPageGrid" + data;
			var dataInfo = $("#" + gridId).jqxGrid('getdatainformation');
			if (dataInfo.rowscount <= 0) {

				openAlertpopup(1, 'no_data_to_export');
			} else {
				$("#loadingDiv").show();
				$("#" + gridId).jqxGrid('exportdata', 'csv', verishieldProtectVlcExportFileName);
				openAlertpopup(1, 'export_Information');
				$("#loadingDiv").hide();
			}
		}

		self.exportToExcelVeriShieldProtectVclDetailInfo = function () {

			var DisplayText = document.getElementById('txtvclDetail').value.trim();
			DisplayText.trim;
			if (DisplayText == "" || DisplayText == null || $("#txtvclDetail").val().trim() == '') {
				openAlertpopup(1, 'no_data_to_export');
			} else {
				DisplayText = 'VclDetails' + "\n" + DisplayText;
				download(DisplayText, 'VCL_Details.csv', "application/csv");
				setTimeout(function () {
					openAlertpopup(1, 'export_Information');
				}, 1000);
			}
		}

		//--------------------------------------END-----------------------------------------------------------------------------
		self.unloadTempPopup = function (popupName, gId, exportflage) {
			self.observableModelPopup(popupName);
			self.deviceDetailPopUpComponent('unloadTemplate');
		};

		modelReposition();
		self.openPopup = function (popupName) {
			self.templateFlag(true);
			if (popupName == "modelShowHideCol") {
				self.gridIdForShowHide(gidForExportShowHideAndReset);
				self.columnlist(genericHideShowColumn(gidForExportShowHideAndReset, true, compulsoryfields));
				loadelement(popupName, 'genericPopup');
				$('#deviceDatail').modal('show');
			}
		}

		self.openPopupBluetoothProfile = function (popupName) {
			self.templateFlag(true);
			if (popupName == "modelShowHideCol") {
				self.gridIdForShowHide('datagridConnectivityBluetoothGridDiv');
				self.columnlist(genericHideShowColumn('datagridConnectivityBluetoothGridDiv', true, compulsoryfields));
				loadelement(popupName, 'genericPopup');
				$('#deviceDatail').modal('show');
			}
		}

		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopup(elementname);
		}

		function loadelementParam(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableParamConponent(elementname);
			$("#showNoDataMessage").hide();
		}

		for (var i = 0; i < deviceProfile.Tabs.Tab.length; i++) {

			if (deviceProfile.Tabs.Tab[i].visible == 1) {
				if (deviceProfile.Tabs.Tab[i].name == 'Device_details') {
					var sourceJSONCerts = _.where(deviceProfile.Tabs.Tab[i].grid, { id: 'datagridJSONCertificates' });
					var sourceJSONKeys = _.where(deviceProfile.Tabs.Tab[i].grid, { id: 'datagridJSONKey' });
					for (var j = 0; j < deviceProfile.Tabs.Tab[i].grid.length; j++) {
						if (deviceProfile.Tabs.Tab[i].grid[j].visible == 1) {
							deviceProfile.Tabs.Tab[i].grid[j]["displayvalue"] = i18n.t(deviceProfile.Tabs.Tab[i].grid[j].displayName, { lng: lang });
							//#JIRA 2851 FIX 
							//if (deviceProfile.Tabs.Tab[i].grid[j].id == 'Parameters' && !koUtil.IsAutoDownloadEnabled) {

							//}
							if (XML_KeyPayloadVersion==AppConstants.get('DEVICE_PROFILE_XML_KEYPAYLOAD_FOR_VRKV2_Keys')) {
								if (deviceProfile.Tabs.Tab[i].grid[j].id == 'datagridCertificate') {
									if(!_.isEmpty(sourceJSONCerts)) {
										continue;
									}
								} else if(deviceProfile.Tabs.Tab[i].grid[j].id == 'datagridEncryptionKey') {
									if(!_.isEmpty(sourceJSONKeys)) {
										continue;
									}
								}
							} else {
								if (deviceProfile.Tabs.Tab[i].grid[j].id == 'datagridJSONCertificates' || deviceProfile.Tabs.Tab[i].grid[j].id == 'datagridJSONKey') {
									continue;
								}
							}
							if (deviceProfile.Tabs.Tab[i].grid[j].id != 'CustomParameters') {
								self.Details.push(deviceProfile.Tabs.Tab[i].grid[j]);
							}
						}
					}

					if (deviceProfile.Tabs.Tab[i].container.length == undefined) {      //for only one container -- Verishield Protect or Connectivity
						if (deviceProfile.Tabs.Tab[i].container.visible == 1) {
							deviceProfile.Tabs.Tab[i].container["displayvalue"] = i18n.t(deviceProfile.Tabs.Tab[i].container.displayName, { lng: lang });
							self.Details.push(deviceProfile.Tabs.Tab[i].container);
						}
					}
					else {      //for multiple containers -- Verishield Protect, Connectivity
						for (var k = 0; k < deviceProfile.Tabs.Tab[i].container.length; k++) {
							if (deviceProfile.Tabs.Tab[i].container[k].visible == 1) {
								deviceProfile.Tabs.Tab[i].container[k]["displayvalue"] = i18n.t(deviceProfile.Tabs.Tab[i].container[k].displayName, { lng: lang });
								self.Details.push(deviceProfile.Tabs.Tab[i].container[k]);
							}
						}
					}
				}
				break;
			}
		}

		if (deviceDataArr != '' && deviceDataArr.DataSet != null) {
			for (var i = 0; i < deviceDataArr.DataSet.length; i++) {
				if (deviceDataArr.DataSet[i].Identifier == "Keys") {
					if (deviceDataArr.DataSet[i].DataSetContent.Key == null || deviceDataArr.DataSet[i].DataSetContent.Key.length == undefined) {
						EncryptionKeyDataSetContent.push(deviceDataArr.DataSet[i].DataSetContent.Key);
					} else {
						EncryptionKeyDataSetContent = deviceDataArr.DataSet[i].DataSetContent.Key;
					}
				}
				if (deviceDataArr.DataSet[i].Identifier == "Applications") {
					ApplicationDataSetContent = deviceDataArr.DataSet[i].DataSetContent.Application;
					ApplicationDataSetContent = $.makeArray(ApplicationDataSetContent);

					if (ApplicationDataSetContent.length > 0) {
						for (var x = 0; x < ApplicationDataSetContent.length; x++) {
							ApplicationDataSetContent[x].Component = i18n.t("payment_device_component", { lng: lang });
							if (ApplicationDataSetContent[x].Type == i18n.t("CPApplication", { lng: lang })) {
								ApplicationDataSetContent[x].Type = i18n.t("Commerce_App", { lng: lang });
							}
						}
					}
				}
				if (deviceDataArr.DataSet[i].Identifier == "VSRCertTree") {
					datagridCertificateDataSetContent = deviceDataArr.DataSet[i].DataSetContent.VSRCert;
				}
				if (deviceDataArr.DataSet[i].Identifier == "Identifier") {
					datagridCustomIdentifierDataSetContent = deviceDataArr.DataSet[i].DataSetContent.Identifier;
				}
				if (deviceDataArr.DataSet[i].Identifier == "VCLInfo") {
					Verishield_ProtectDataSetContent = deviceDataArr.DataSet[i].DataSetContent.VCLInfo;
					Verishield_ProtectDataSetContent = $.makeArray(Verishield_ProtectDataSetContent);
					$("#VCLDiagPageDiv").empty();
					str = '';
					if (Verishield_ProtectDataSetContent[0].VCLDiagPage != undefined) {
						self.vlcDetailCheckDataforTxtbox(false);
						self.VCLDiagPageDivDataIsCheck(true);
						for (var t = 0; t < Verishield_ProtectDataSetContent[0].VCLDiagPage.length; t++) {


							self.VCLDiagPage.push(Verishield_ProtectDataSetContent[0].VCLDiagPage[t]);
							str += '<div>';
							//str += '<label >' + Verishield_ProtectDataSetContent[0].VCLDiagPage[t].Title + '</label>';
							str += '<div class="col-md-12">';
							str += '<label class="col-md-8" style="margin-left:-30px; font-size:medium; padding-top:10px;">' + Verishield_ProtectDataSetContent[0].VCLDiagPage[t].Title + '</label>';
							str += '<div class="pull-right btn-mg" style="padding-bottom:12px;">';
							str += ' <a class="btn btn-default"  id="reset" role="button" data-i18n="[title]show_all_data" data-bind="click:function(){verishieldProtectVlcclearfilter(' + t + ')}"  ><i class="icon-reset-filter"></i></a>';

							str += ' <a class="btn btn-default" id="btnShowHide' + t + '" role="button" data-i18n="[title]show_hide" data-bind="click:function(){verishieldProtectVlcShowHide(' + t + ')}"  ><i class="icon-hide-column"></i></a>';
							str += ' <a class="btn btn-default" id="export" role="button" data-i18n="[title]exportToXls" data-bind="click:function(){verishieldProtectVlcExportToXls(' + t + ')}"><i class="icon-export-excel"></i></a>';
							var id = 'VCLDiagPageGrid' + t;

							str += ' </div>';
							str += '</div>';
							str += '<div id=' + id + '>';

							str += '</div>';
							str += '</div>';
						}

						$("#VCLDiagPageDiv").append(str);
						for (var t = 0; t < Verishield_ProtectDataSetContent[0].VCLDiagPage.length; t++) {
							var data = '';
							if (Verishield_ProtectDataSetContent[0].VCLDiagPage[t].VCLDiagPageDetail != undefined) {
								data = Verishield_ProtectDataSetContent[0].VCLDiagPage[t].VCLDiagPageDetail;
								for (var y = 0; y < data.length; y++) {
									var str = data[y].Value;
									if (isDate(str)) {
										data[y].Value = getFormatedDate(str);
									}
								}
							} else {
								data = [];
							}
							VCLDiagPageGrid('VCLDiagPageGrid' + t, data);
						}
					}

					var templateDataDetails = self.Details();
					for (var k = 0; k < templateDataDetails.length; k++) {

						if (templateDataDetails[k].id == "Verishield_Protect") {

							if (templateDataDetails[k].grid.id == "datagridVclInfo") {
								for (var iRow = 0; iRow < templateDataDetails[k].grid.rows.row.length; iRow++) {
									var obj = new Object();
									obj.attribute = templateDataDetails[k].grid.rows.row[iRow].displayName;
									obj.value = Verishield_ProtectDataSetContent[0][templateDataDetails[k].grid.rows.row[iRow].displayName];
									self.verishildProtectData.push(obj);

								}
							}
							else if (templateDataDetails[k].grid[0].id == "datagridVclInfo") {
								for (var iRow = 0; iRow < templateDataDetails[k].grid[0].rows.row.length; iRow++) {
									var obj = new Object();
									obj.attribute = templateDataDetails[k].grid[0].rows.row[iRow].displayName;
									obj.value = Verishield_ProtectDataSetContent[0][templateDataDetails[k].grid[0].rows.row[iRow].displayName];
									self.verishildProtectData.push(obj);

								}
							}
						}
					}
				}
				if (deviceDataArr.DataSet[i].Identifier == "DeviceProfile" && deviceDataArr.DataSet[i].Subdevice != undefined) {
					if (deviceDataArr.DataSet[i].DataSetContent.DeviceProfile.DTName != undefined) {
						deviceprofilDataSetContent.DTName = deviceDataArr.DataSet[i].DataSetContent.DeviceProfile.DTName;
					} else {
						deviceprofilDataSetContent.DTName = '';
					}
					if (deviceDataArr.DataSet[i].DataSetContent.DeviceProfile.OSName != undefined) {
						deviceprofilDataSetContent.OSName = deviceDataArr.DataSet[i].DataSetContent.DeviceProfile.OSName;
					} else {
						deviceprofilDataSetContent.OSName = '';
					}
					if (deviceDataArr.DataSet[i].DataSetContent.DeviceProfile.OSVersion != undefined) {
						deviceprofilDataSetContent.OSVersion = deviceDataArr.DataSet[i].DataSetContent.DeviceProfile.OSVersion;
					} else {
						deviceprofilDataSetContent.OSVersion = '';
					}
					if (deviceDataArr.DataSet[i].DataSetContent.DeviceProfile.SOCRevision != undefined) {
						deviceprofilDataSetContent.SOCRevision = deviceDataArr.DataSet[i].DataSetContent.DeviceProfile.SOCRevision;
					} else {
						deviceprofilDataSetContent.SOCRevision = '';
					}
					if (deviceDataArr.DataSet[i].DataSetContent.DeviceProfile.VSRSponsor != undefined) {
						deviceprofilDataSetContent.VSRSponsor = deviceDataArr.DataSet[i].DataSetContent.DeviceProfile.VSRSponsor;
					} else {
						deviceprofilDataSetContent.VSRSponsor = '';
					}
				} else if (deviceDataArr.DataSet[i].Identifier == "DeviceProfile") {
					deviceprofilDataSetContent = deviceDataArr.DataSet[i].DataSetContent.DeviceProfile;
					if (koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_MOBILE_FAMILY')) {
						koUtil.tabletProfileData = JSON.parse(JSON.stringify(deviceDataArr.DataSet[i].DataSetContent.DeviceProfile));
						deviceprofilDataSetContent.DTName = '';
						deviceprofilDataSetContent.OSName = '';
						deviceprofilDataSetContent.OSVersion = '';
						deviceprofilDataSetContent.SOCRevision = '';
						deviceprofilDataSetContent.VSRSponsor = '';
					}
					if (deviceDataArr.DataSet[i].Version) {
						koUtil.deviceProfileXSDVersion(deviceDataArr.DataSet[i].Version);
					}
				}
				if (deviceDataArr.DataSet[i].Identifier == "MemoryProfile") {
					memoryprofileDataSetContent = deviceDataArr.DataSet[i].DataSetContent.MemoryProfile;
				}
				if (i == deviceDataArr.DataSet.length - 1) {
					jQuery.extend(deviceprofilDataSetContent, memoryprofileDataSetContent);
					var templateDataDetails = self.Details();
					for (var k = 0; k < templateDataDetails.length; k++) {
						if (templateDataDetails[k].id == "datagridHardwareProfile") {
							for (var iRow = 0; iRow < templateDataDetails[k].rows.row.length; iRow++) {
								var xpath = '';
								var batteryLevelObject = '';
								if (templateDataDetails[k].rows.row[iRow].valueType !== "field") {
									xpath = templateDataDetails[k].rows.row[iRow].xpath;

									if (xpath.indexOf('DataSetContent.MemoryProfile.') > -1) {
										xpath = xpath.replace('DataSetContent.MemoryProfile.', '');
									} else if (xpath.indexOf('DataSetContent.DeviceProfile.') > -1) {
										xpath = xpath.replace('DataSetContent.DeviceProfile.', '');
									} else {
										batteryLevelObject = "deviceOut";
									}

								}
								deviceprofilDataSetContent = $.makeArray(deviceprofilDataSetContent);
								var obj = new Object();
								obj.Attrib = templateDataDetails[k].rows.row[iRow].displayName;
								if (templateDataDetails[k].rows.row[iRow].displayName == "VHQ Version")
									obj.Attrib = "Agent Version";
								if (templateDataDetails[k].rows.row[iRow].valueType == "xpath") {
									if (templateDataDetails[k].rows.row[iRow].displayName == "IP Address") {
										obj.Value = koUtil.iPAddress;
									}
									if (templateDataDetails[k].rows.row[iRow].displayName == "HW Device") {
										if (deviceprofilDataSetContent[0].HWDevice != undefined) {
											if (deviceprofilDataSetContent[0].HWDevice.length > 1) {
												var stringHWDevices = '';
												for (var j = 0; j < deviceprofilDataSetContent[0].HWDevice.length; j++) {
													if (stringHWDevices == '') {
														stringHWDevices = deviceprofilDataSetContent[0].HWDevice[j].DeviceName + " (" + deviceprofilDataSetContent[0].HWDevice[j].FirmwareVersion + ")";
													} else {
														stringHWDevices += ", " + deviceprofilDataSetContent[0].HWDevice[j].DeviceName + " (" + deviceprofilDataSetContent[0].HWDevice[j].FirmwareVersion + ")";
													}
												}
												obj.Value = stringHWDevices;
											} else {
												obj.Value = deviceprofilDataSetContent[0].HWDevice.DeviceName + " (" + deviceprofilDataSetContent[0].HWDevice.FirmwareVersion + ")";
											}
										}
									} else {
										if (templateDataDetails[k].rows.row[iRow].datatype == "date") {
											var date = Date.parse(obj.Value);
											var localDate = jsonLocalDateConversion(date, LONG_DATETIME_FORMAT_AMPM);
											obj.Value = localDate;
										} else {
											//obj.Value = moment(localDate).format(LONG_DATETIME_FORMAT_AMPM);
											if (xpath.indexOf("BatteryInfo") > -1) {
												xpath = xpath.replace('BatteryInfo.', '');
												obj.Value = deviceprofilDataSetContent[0].BatteryInfo ? deviceprofilDataSetContent[0].BatteryInfo[xpath] : '';
											} else {
												obj.Value = deviceprofilDataSetContent[0][xpath];
											}
										}
									}
								} else if (templateDataDetails[k].rows.row[iRow].valueType == "Function" || templateDataDetails[k].rows.row[iRow].valueType == "function") {
									if (xpath.indexOf("BatteryInfo") > -1) {
										xpath = xpath.replace('BatteryInfo.', '');
										var val = deviceprofilDataSetContent[0].BatteryInfo ? deviceprofilDataSetContent[0].BatteryInfo[xpath] : '';
									}
									else {
										var val = batteryLevelObject == "deviceOut" ? koUtil.deviceOut[xpath] : deviceprofilDataSetContent[0][xpath];
									}
									var functionName = templateDataDetails[k].rows.row[iRow].Function;

									obj.Value = getfunctionvalue(val, functionName, templateDataDetails[k].rows.row[iRow], deviceprofilDataSetContent, ApplicationDataSetContent);

								} else if (templateDataDetails[k].rows.row[iRow].valueType == "field") {
									//koUtil.deviceOut = $.makeArray(koUtil.deviceOut);
									var field = templateDataDetails[k].rows.row[iRow].value;
									if (field == "LocationID")
										field = "LocationId";
									obj.Value = koUtil.deviceOut[field];

								}
								self.deviceProfileInformationData.push(obj);
							}
							self.deviceProfileInformationData.sort(function (a, b) { return a.Attrib > b.Attrib ? 1 : -1; });

							if (templateDataDetails[k].grid && templateDataDetails[k].grid.id == "datagridTabletProfile") {
								for (var iRow = 0; iRow < templateDataDetails[k].grid.row.length; iRow++) {
									if (templateDataDetails[k].grid.row[iRow].valueType == "field") {
										koUtil.tabletProfileData = $.makeArray(koUtil.tabletProfileData);
										var item = new Object();
										item.Attrib = templateDataDetails[k].grid.row[iRow].displayName;
										var field = templateDataDetails[k].grid.row[iRow].value;
										if (field == "UpdatedTime") {
											if (koUtil.tabletProfileData.length > 0) {
												var fieldValue = '';
												if (koUtil.tabletProfileData[0][field] != undefined) {
													fieldValue = koUtil.tabletProfileData[0][field]
												}
												if (fieldValue.indexOf("T") > -1) {
													var array1 = fieldValue.split("T");
													fieldValue = array1.join(" ");
												}
												if (fieldValue.indexOf("Z") > -1) {
													var array2 = fieldValue.split("Z");
													fieldValue = array2.join(" ");
												}
												koUtil.tabletProfileData[0][field] = fieldValue;
											}
										}
										if (koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_MOBILE_FAMILY')) {
											if (field == "OSVersion") {
												field = "OSName";
											}
											if (field == "SSID" && koUtil.tabletProfileData.length > 0) {
												item.Value = (koUtil.tabletProfileData[0].WifiProfile != undefined && koUtil.tabletProfileData[0].WifiProfile.SSID != undefined) ? koUtil.tabletProfileData[0].WifiProfile.SSID : "";
											} else if (field == "PluggedIn") {
												item.Value = item.Value == true ? i18n.t('battery_power_adapter', { lng: lang }) : i18n.t('battery_plugged_in', { lng: lang });
											} else if (field == "CPUUsage") {
												item.Value = koUtil.tabletProfileData.length > 0 ? koUtil.tabletProfileData[0]["CPUUtilization"] + "%" : "";
											} else {
												item.Value = koUtil.tabletProfileData.length > 0 ? koUtil.tabletProfileData[0][field] : "";
											}
										} else {
											if (field == "PluggedIn") {
												item.Value = item.Value == true ? i18n.t('battery_power_adapter', { lng: lang }) : i18n.t('battery_plugged_in', { lng: lang });
											} else {
												item.Value = koUtil.tabletProfileData.length > 0 ? koUtil.tabletProfileData[0][field] : "";
											}
										}
									}
									self.deviceProfileTabletInformation.push(item);
								}
								var item = new Object();
								item.Attrib = "Android Details";
								item.Value = "";
								var tabletDetailsArray = new Array();
								tabletDetailsArray.push(item);

								self.deviceProfileTabletInformation.sort(function (a, b) { return a.Attrib > b.Attrib ? 1 : -1; });
								self.deviceProfileTabletInformation = $.merge($.merge([], tabletDetailsArray), self.deviceProfileTabletInformation());
							}

							var isFilter;
							if (isdatagridHardwareProfileGridFilter == undefined || isdatagridHardwareProfileGridFilter == false) {
								isFilter = false;
							} else {
								isFilter = true;
							}
							isdatagridHardwareProfileGridFilter = true;

							var pageName = "deviceDetails";
							var initpagObj = initPageStorageObj(pageName);
							var PageStorage = initpagObj.PageStorage;
							if (PageStorage && PageStorage[0].selectedVerticalTabName && PageStorage[0].selectedVerticalTabName != '') {
								var tabChangeFunction = function () {
									var id = '#' + PageStorage[0].selectedVerticalTabName;
									$("#profiletabHeader").each(function () {
										$(this).children('li').removeClass('active');
									});
									$(id).parent().addClass('active');
									$("#ShowDetailsMainDiv>.row:nth-child(2)>.tab-content").each(function () {
										$(this).children('div.tab-pane').removeClass("active")
									});
									$(id + 'Div').addClass('active');
									$(id).parent().click();
								}
								setTimeout(tabChangeFunction, 1000);
							}
							else {
								$("#datagridHardwareProfileDiv").children().css({ 'overflow-y': 'hidden' });
								if (koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_MOBILE_FAMILY')) {
									self.carbonDeviceProfileInformation = $.merge($.merge([], self.deviceProfileInformationData()), self.deviceProfileTabletInformation);
									InformationGrid('datagridHardwareProfileGridDiv', templateDataDetails[k], self.infoGridSourceArr, self.infoGridColumnArr, self.carbonDeviceProfileInformation, isFilter);
								}
								else {
									InformationGrid('datagridHardwareProfileGridDiv', templateDataDetails[k], self.infoGridSourceArr, self.infoGridColumnArr, self.deviceProfileInformationData(), isFilter);
								}
							}
						}
					}
				}
			}
		}

		if (deviceDataArr == '') {

			var indata = [];
			var isFilter;
			if (isdatagridHardwareProfileGridFilter == undefined || isdatagridHardwareProfileGridFilter == false) {
				isFilter = false;
			} else {
				isFilter = true;
			}
			isdatagridHardwareProfileGridFilter = true;
			var pageName = "deviceDetails";
			var initpagObj = initPageStorageObj(pageName);
			var PageStorage = initpagObj.PageStorage;
			if (PageStorage && PageStorage[0].selectedVerticalTabName && PageStorage[0].selectedVerticalTabName != '') {
				var tabChangeFunction = function () {
					var id = '#' + PageStorage[0].selectedVerticalTabName;
					$("#profiletabHeader").each(function () {
						$(this).children('li').removeClass('active');
					});

					if ($(id).parent().length == 0) {
						storeVerticalTabInSession('deviceDetails', self.Details()[0].id);
						id = '#' + self.Details()[0].id;
					}

					$(id).parent().addClass('active');

					$("#ShowDetailsMainDiv>.row:nth-child(2)>.tab-content").each(function () {
						$(this).children('div.tab-pane').removeClass("active");
					});
					$(id + 'Div').addClass('active');
					$(id).parent().click();
				}
				setTimeout(tabChangeFunction, 1000);
			}
			else {
				$("#datagridHardwareProfileDiv").children().css({ 'overflow-y': 'hidden' });
				if (koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_MOBILE_FAMILY')) {
					self.carbonDeviceProfileInformation = $.merge($.merge([], self.deviceProfileInformationData()), self.deviceProfileTabletInformation);
					InformationGrid('datagridHardwareProfileGridDiv', indata, self.infoGridSourceArr, self.infoGridColumnArr, self.carbonDeviceProfileInformation, isFilter);
				}
				else {
					InformationGrid('datagridHardwareProfileGridDiv', indata, self.infoGridSourceArr, self.infoGridColumnArr, self.deviceProfileInformationData(), isFilter);
				}
			}
		}

		if (XML_KeyPayloadVersion==AppConstants.get('DEVICE_PROFILE_XML_KEYPAYLOAD_FOR_VRKV2_Keys')) {
			keyInventoryJsonData = koUtil.deviceProfileKeyInventoryData;
			certificatesJsonData = koUtil.deviceProfileCertificatesData;
		}

		//for software Status
		$("#profilDeviceDetailApplicationView").on('scroll.bs.modal', function () {
			$("#jqxDevProfDetailBundle").jqxGrid('closemenu');
		});

		function isDate(value) {
			if ((Date.parse(value) > 0 || Date.parse(value) < 0) && value.indexOf(":") > 0)
				return true;
			else if (Date.parse(value) == Number(NaN))
				return false;
			return false;
		}

		function getFormatedDate(date) {
			if (date != null && date.fullYear > 2001) {
				var localDate = jsonLocalDateConversion(date, LONG_DATETIME_FORMAT_AMPM);
				return localDate;
			} else {
				return "";
			}
		}

		self.clearfilterDeviceDetailGrid = function () {
			clearUiGridFilter(gidForExportShowHideAndReset);
		}

		//Export to excel
		self.exportToExcelDeviceDetailgrids = function (data) {
			var dataInfo = $("#" + gidForExportShowHideAndReset).jqxGrid('getdatainformation');
			if (dataInfo.rowscount <= 0) {
				openAlertpopup(1, 'no_data_to_export');
			} else {
				$("#loadingDiv").show();
				$("#" + gidForExportShowHideAndReset).jqxGrid('exportdata', 'xls', exportFileName);
				openAlertpopup(1, 'export_Information');
				$("#loadingDiv").hide();
			}
		}

		self.exportToExcelBluetoothgrid = function (data) {
			var dataInfo = $("#" + 'datagridConnectivityBluetoothGridDiv').jqxGrid('getdatainformation');
			if (dataInfo.rowscount <= 0) {

				openAlertpopup(1, 'no_data_to_export');
			} else {
				$("#loadingDiv").show();
				$("#" + 'datagridConnectivityBluetoothGridDiv').jqxGrid('exportdata', 'csv', 'Bluetooth Connectivity');
				openAlertpopup(1, 'export_Information');
				$("#loadingDiv").hide();
			}
		}

		//
		self.clearFilterSoftwareStatusModelView = function (gId) {
			clearUiGridFilter(gId);
		}

		//Export to excel
		self.exportToExcelSoftwareStatusModelView = function (gId) {
			var dataInfo = $("#" + gId).jqxGrid('getdatainformation');
			if (dataInfo.rowscount <= 0) {

				openAlertpopup(1, 'no_data_to_export');
			} else {
				$("#loadingDiv").show();
				exportjqxcsvData(gId,'Applications'); 
				openAlertpopup(1, 'export_Information');
				$("#loadingDiv").hide();
			}
		}

		self.clearfilter = function (gridId) {
			gridFilterClear(gridId);

		}

		self.showdetails = function (data) {
			var isFilter;
			$("#showNoDataMessage").hide();
			$("#showHideResetExportDiv").hide();
			$("#btnShowHide").show();
			$("#btnExport").show();
			storeVerticalTabInSession('deviceDetails', data.id);

			//koUtil.isRefereshParamfordeviceProfile(false);

			//Information
			if (data.id == "datagridHardwareProfile") {
				$("#showHideResetExportDiv").show();
				if (isdatagridHardwareProfileGridFilter == undefined || isdatagridHardwareProfileGridFilter == false) {
					isFilter = false;
				} else {
					isFilter = true;
				}
				isdatagridHardwareProfileGridFilter = true;

				$("#datagridHardwareProfileDiv").children().css({ 'overflow-y': 'hidden' });
				if (koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_MOBILE_FAMILY')) {
					self.carbonDeviceProfileInformation = $.merge($.merge([], self.deviceProfileInformationData()), self.deviceProfileTabletInformation);
					InformationGrid('datagridHardwareProfileGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, self.carbonDeviceProfileInformation, isFilter);
				}
				else {
					InformationGrid('datagridHardwareProfileGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, self.deviceProfileInformationData(), isFilter);
				}
				setIdForDeviceDetailsTab = "datagridHardwareProfileGridDiv";
			}
			else if (data.id == "datagridSimCard") {
				$("#showHideResetExportDiv").show();
				if (isdatagridSimCardFilter == undefined || isdatagridSimCardFilter == false) {
					isFilter = false;
				} else {
					isFilter = true;
				}
				isdatagridSimCardFilter = true;
				var simCardDetails = new Array();
				if (deviceDataArr != '') {

					if (!_.isEmpty(deviceprofilDataSetContent) && !_.isEmpty(deviceprofilDataSetContent[0].SIMProfile)) {
						if (deviceprofilDataSetContent[0].SIMProfile.length > 1)
							simCardDetails = deviceprofilDataSetContent[0].SIMProfile;
						else
							simCardDetails.push(deviceprofilDataSetContent[0].SIMProfile);
					}
				}
				InformationGrid('datagridSimCardGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, simCardDetails, isFilter);

				setIdForDeviceDetailsTab = "datagridSimCardGridDiv";
			}
			//Custom Identifiers
			else if (data.id == "datagridCustomIdentifier") {
				$("#showHideResetExportDiv").show();
				getCustomIdentifiers(data, self.infoGridSourceArr, self.infoGridColumnArr);

				setIdForDeviceDetailsTab = "datagridCustomIdentifierGridDiv";
			}
			//Software Status
			else if (data.id == "datagridDownloadAutomation") {
				$("#loadingDiv").show();
				if (!isSoftwareStatusGridLoaded) {
					getDownloadBundlesForDevice(data, 'datagridDownloadAutomationGridDiv', false);
				}

				getFileStatus('datagridFileStatusGridDiv');
				getKeysOnDevice();

				setIdForDeviceDetailsTab = "datagridDownloadAutomationGridDiv";
				$("#loadingDiv").hide();
			}
			//Software
			else if (data.id == "software") {
				$("#showHideResetExportDiv").show();
				if (issoftwareGridFilter == undefined || issoftwareGridFilter == false) {
					isFilter = false;
				} else {
					isFilter = true;
				}
				issoftwareGridFilter = true;

				getApplicationsOnDevice(data, self.infoGridSourceArr, self.infoGridColumnArr, isFilter);

				setIdForDeviceDetailsTab = "softwareGridDiv";
			}
			//Parameters
			else if (data.id == "Parameters") {
				//koUtil.isRefereshParamfordeviceProfile(true);
				loadelementParam('deviceProfile_Parameter', 'device/deviceProfileTemplates');
				setIdForDeviceDetailsTab = "jqxgridForEditParameterTemplate";
			}
			//VeriShield Retain
			else if (data.id == "datagridCertificate") {
				$("#showHideResetExportDiv").show();
				if (isdatagridCertificateGridFilter == undefined || isdatagridCertificateGridFilter == false) {
					isFilter = false;
				} else {
					isFilter = true;
				}
				isdatagridCertificateGridFilter = true;
				if (deviceDataArr != '') {
					InformationGrid('datagridCertificateGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, datagridCertificateDataSetContent, isFilter);
				} else {
					InformationGrid('datagridCertificateGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, [], isFilter);
				}

				setIdForDeviceDetailsTab = "datagridCertificateGridDiv";
			}
			//VeriShield Retain for JSON data
			else if (data.id == "datagridJSONCertificates") {
				$("#showHideResetExportDiv").show();
				if (isdatagridJSONCertificateGridFilter == undefined || isdatagridJSONCertificateGridFilter == false) {
					isFilter = false;
				} else {
					isFilter = true;
				}
				isdatagridJSONCertificateGridFilter = true;
				InformationGrid('datagridJSONCertificatesGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, certificatesJsonData, isFilter);

				setIdForDeviceDetailsTab = "datagridJSONCertificatesGridDiv";
			}
			//Ports
			else if (data.id == "datagridPorts") {
				$("#showHideResetExportDiv").show();
				if (isdatagridPortsFilter == undefined || isdatagridPortsFilter == false) {
					isFilter = false;
				} else {
					isFilter = true;
				}
				isdatagridPortsFilter = true;
				if (deviceDataArr != '') {
					var portsData = new Array();
					if (!_.isEmpty(deviceprofilDataSetContent) && !_.isEmpty(deviceprofilDataSetContent[0].Ports)) {
						if (deviceprofilDataSetContent[0].Ports.Port.length > 1)
							portsData = deviceprofilDataSetContent[0].Ports.Port;
						else
							portsData.push(deviceprofilDataSetContent[0].Ports.Port);
					}
					InformationGrid('datagridPortsGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, portsData, isFilter);
				} else {

					InformationGrid('datagridPortsGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, [], isFilter);
				}

				setIdForDeviceDetailsTab = "datagridPortsGridDiv";
			}
			//IO Modules
			else if (data.id == "datagridIOModules") {
				$("#showHideResetExportDiv").show();
				if (isdatagridIOModulesFilter == undefined || isdatagridIOModulesFilter == false) {
					isFilter = false;
				} else {
					isFilter = true;
				}
				isdatagridIOModulesFilter = true;
				if (deviceprofilDataSetContent && deviceprofilDataSetContent[0].IOModules && deviceprofilDataSetContent[0].IOModules.IOModule) {
					if (deviceprofilDataSetContent[0].IOModules.IOModule.length == undefined) {
						var array = new Array();
						array.push(deviceprofilDataSetContent[0].IOModules.IOModule);
						InformationGrid('datagridIOModulesDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, array, isFilter);
					}
					else {
						InformationGrid('datagridIOModulesDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, deviceprofilDataSetContent[0].IOModules.IOModule, isFilter);
					}
				}
				else {
					InformationGrid('datagridIOModulesDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, [], isFilter);
				}

				setIdForDeviceDetailsTab = "datagridIOModulesDiv";
			}
			//Encryption Keys
			else if (data.id == "datagridEncryptionKey") {
				$("#showHideResetExportDiv").show();
				if (isdatagridEncryptionKeyFilter == undefined || isdatagridEncryptionKeyFilter == false) {
					isFilter = false;
				} else {
					isFilter = true;
				}
				isdatagridEncryptionKeyFilter = true;
				if (deviceDataArr != '') {
					InformationGrid('datagridEncryptionKeyGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, EncryptionKeyDataSetContent, isFilter);
				} else {
					InformationGrid('datagridEncryptionKeyGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, [], isFilter);
				}

				setIdForDeviceDetailsTab = "datagridEncryptionKeyGridDiv";
			}
			//Keys for JSON data
			else if (data.id == "datagridJSONKey") {
				$("#showHideResetExportDiv").show();
				if (isdatagridJSONKeyFilter == undefined || isdatagridJSONKeyFilter == false) {
					isFilter = false;
				} else {
					isFilter = true;
				}
				isdatagridJSONKeyFilter = true;
				InformationGrid('datagridJSONKeyGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, keyInventoryJsonData, isFilter);

				setIdForDeviceDetailsTab = "datagridEncryptionKeyGridDiv";
			}
			//Verishield Protect
			else if (data.id == "Verishield_Protect") {
				$("#showHideResetExportDiv").show();
				//if(deviceDataArr!=''){
				Verishield_ProtectDataSetContent = $.makeArray(Verishield_ProtectDataSetContent);
				InformationGridProtection('Verishield_ProtectGridDiv', data.grid, self.infoGridSourceArr, self.infoGridColumnArr, self.verishildProtectData());
				if (Verishield_ProtectDataSetContent[0] != null) {
					self.vclDetails(Verishield_ProtectDataSetContent[0].DiagInfo);
				}
				//}
				//else {
				//    InformationGridProtection('Verishield_ProtectGridDiv', data.grid, self.infoGridSourceArr, self.infoGridColumnArr, self.verishildProtectData());
				//}

				setIdForDeviceDetailsTab = "Verishield_ProtectGridDiv";
			}
			//Connectivity
			else if (data.id == "Connectivity") {
				$("#showHideResetExportDiv").hide();
				$("#WifiProfilediv").hide();
				$("#datagridConnectivityWiFiGridDiv").hide();
				$("#BluetoothProfileDiv").hide();
				$("#datagridConnectivityBluetoothGridDiv").hide();

				if (deviceDataArr != '' && !$.isEmptyObject(deviceDataArr)) {
					var source = _.where(deviceDataArr.DataSet, { Identifier: 'DeviceProfile' });
					if (source && source.length > 0) {
						if (!$.isEmptyObject(source[0].DataSetContent.DeviceProfile.WifiProfile)) {
							WifiProfileDataSetContent = $.makeArray(source[0].DataSetContent.DeviceProfile.WifiProfile);
						}

						if (!$.isEmptyObject(source[0].DataSetContent.DeviceProfile.BlueToothProfile)) {
							BlueToothProfileDataSetContent = $.makeArray(source[0].DataSetContent.DeviceProfile.BlueToothProfile);
						}

					}

				}

				if (templateDataDetails == null)
					templateDataDetails = self.Details();

				if (templateDataDetails.length > 0) {
					for (var k = 0; k < templateDataDetails.length; k++) {
						if (templateDataDetails[k].id == "Connectivity") {
							for (var i = 0; i < templateDataDetails[k].grid.length; i++)
								if (templateDataDetails[k].grid[i].id == "datagridConnectivityWiFi" && templateDataDetails[k].grid[i].visible == "1") {
									$("#showHideResetExportDiv").show();
									$("#WifiProfilediv").show();
									$("#datagridConnectivityWiFiGridDiv").show();
									for (var iRow = 0; iRow < templateDataDetails[k].grid[0].rows.row.length; iRow++) {
										var obj = new Object();
										obj.attribute = templateDataDetails[k].grid[0].rows.row[iRow].displayName;
										obj.value = WifiProfileDataSetContent.length > 0 ? WifiProfileDataSetContent[0][templateDataDetails[k].grid[0].rows.row[iRow].xmlAttribute] : '';
										self.wifiProfileData.push(obj);
									}

									if (deviceDataArr != '') {
										InformationGridConnectivity('datagridConnectivityWiFiGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, self.wifiProfileData(), 0);
									} else {
										InformationGridConnectivity('datagridConnectivityWiFiGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, [], 0);
									}

									setIdForDeviceDetailsTab = "datagridConnectivityWiFiGridDiv";
								}
								else if (templateDataDetails[k].grid[i].id == "datagridConnectivityBluetooth" && templateDataDetails[k].grid[i].visible == "1") {
									$("#BluetoothProfileDiv").show();
									$("#datagridConnectivityBluetoothGridDiv").show();
									for (var iRow = 0; iRow < templateDataDetails[k].grid[1].rows.row.length; iRow++) {
										var obj = new Object();
										obj.attribute = templateDataDetails[k].grid[1].rows.row[iRow].displayName;
										obj.value = BlueToothProfileDataSetContent.length > 0 ? BlueToothProfileDataSetContent[0][templateDataDetails[k].grid[1].rows.row[iRow].xmlAttribute] : '';
										self.blueToothProfileData.push(obj);
									}

									if (deviceDataArr != '') {
										InformationGridConnectivity('datagridConnectivityBluetoothGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, self.blueToothProfileData(), 1);
									} else {
										InformationGridConnectivity('datagridConnectivityBluetoothGridDiv', data, self.infoGridSourceArr, self.infoGridColumnArr, [], 1);
									}

									setIdForDeviceDetailsTab = "datagridConnectivityBluetoothGridDiv";
								}
							break;
						}
					}
				}
			}

			$("#loadingDiv").hide();
		}


		self.cancelReset = function () {
			$("#IsEnableConfirmMsg").modal('hide');

			if (koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_MOBILE_FAMILY')) {

				$("#datagridDownloadAutomationGridDiv").parent('div').css({ 'z-index': 1 });

				var b = $('#datagridDownloadAutomationGridDiv').jqxGrid('getcellvalue', rowOfDownloadAutomation, "IsEnableForAutomation");
				$('#datagridDownloadAutomationGridDiv').jqxGrid('setcellvalue', rowOfDownloadAutomation, "IsEnableForAutomation", !b);
				$(".jqx-widget-header").removeClass('jqx-grid-header');
			}
			else {
				var a = $('#datagridDownloadAutomationGridDiv').jqxGrid('getcellvalue', rowOfDownloadAutomation, "IsEnableForAutomation");
				$('#datagridDownloadAutomationGridDiv').jqxGrid('setcellvalue', rowOfDownloadAutomation, "IsEnableForAutomation", !a);
				$("#columntabledatagridDownloadAutomationGridDiv").parent('div').removeClass('jqx-grid-header');
			}

			return false;
		}

		$('#scheduleConfirmationPopUp_YES').click(function () {
            saveDeviceAppAutomation('datagridDownloadAutomationGridDiv', PopupRow);
			$("#IsEnableConfirmMsg").modal('hide');
		});


		$('#scheduleConfirmationPopUp_NO').click(function () {
			self.cancelReset();
		});

		self.EnableDisableAutomation = function () {
            saveDeviceAppAutomation('datagridDownloadAutomationGridDiv', PopupRow);
			$("#IsEnableConfirmMsg").modal('hide');
		}

		//editIsEnableForAutomation
		function saveDeviceAppAutomation(gId, row) {
			that.editrow = -1;
            var rowData = $("#" + gId).jqxGrid('getrowdata', row);
			var updateDeviceAppAutomationFlagReq = new Object();
			updateDeviceAppAutomationFlagReq.UniqueDeviceId = koUtilUniqueDeviceId;

            if (String(protocolName).toUpperCase() == AppConstants.get('ZONTALK_PROTOCOL')) {
                updateDeviceAppAutomationFlagReq.ApplicationId = !_.isEmpty(rowData) ? rowData.ApplicationId : 0;
				updateDeviceAppAutomationFlagReq.PackageId = 0;
			} else {
				updateDeviceAppAutomationFlagReq.ApplicationId = 0;
                updateDeviceAppAutomationFlagReq.PackageId = !_.isEmpty(rowData) ? rowData.PackageId : 0;
			}
			updateDeviceAppAutomationFlagReq.IsEnableForAutomation = isEnableForAutomation;

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(0, 'DeviceAppAutomationFlag_updated_successfully');
						getDownloadBundlesForDevice(null, 'datagridDownloadAutomationGridDiv', false);
					} else {
						$("#datagridDownloadAutomationGridDiv").jqxGrid('setcellvalue', rowOfDownloadAutomation, datafieldOfDownloadAutomation, oldvalueOfDownloadAutomation);
						$('#datagridDownloadAutomationGridDiv').jqxGrid('render');
						$('#datagridDownloadAutomationGridDiv').jqxGrid('showrowdetails', rowOfDownloadAutomation);
						$("#columntabledatagridDownloadAutomationGridDiv").parent('div').removeClass('jqx-grid-header');
					}
				}
				if (error) {
					retval = "";
					$("#datagridDownloadAutomationGridDiv").jqxGrid('setcellvalue', rowOfDownloadAutomation, datafieldOfDownloadAutomation, oldvalueOfDownloadAutomation);
					$('#datagridDownloadAutomationGridDiv').jqxGrid('render');
					$('#datagridDownloadAutomationGridDiv').jqxGrid('showrowdetails', rowOfDownloadAutomation);
					$("#columntabledatagridDownloadAutomationGridDiv").parent('div').removeClass('jqx-grid-header');
				}

				$("#loadingDiv").hide();
			}

			var method = 'UpdateDeviceAppAutomationFlag';
			var params = '{"token":"' + TOKEN() + '","updateDeviceAppAutomationFlagReq":' + JSON.stringify(updateDeviceAppAutomationFlagReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		}

		seti18nResourceData(document, resourceStorage);
	};

	function CheckGridForExportAndReset(gId) {                                              // Assigning a grid id for show hide column, Export to Excel and Reset Filter
		//$("#showHideResetExportDiv").show();
		if (gId == 'datagridHardwareProfileGridDiv') {
			gidForExportShowHideAndReset = 'datagridHardwareProfileGridDiv';                //Information
			compulsoryfields = ['Attrib'];
			exportFileName = 'Information';
		} else if (gId == 'datagridSimCardGridDiv') {
			gidForExportShowHideAndReset = 'datagridSimCardGridDiv';						//Sim Card
			compulsoryfields = ['SlotIndex', 'Status', 'IMEINumber'];
			exportFileName = 'Sim Card';
		} else if (gId == 'datagridPortsGridDiv') {
			gidForExportShowHideAndReset = 'datagridPortsGridDiv';                          //Ports
			compulsoryfields = ['PortName'];
			exportFileName = 'Ports';
		} else if (gId == 'datagridEncryptionKeyGridDiv') {
			gidForExportShowHideAndReset = 'datagridEncryptionKeyGridDiv';                  //Encryption Keys
			compulsoryfields = ['Type'];
			exportFileName = 'Encryption Keys';
		} else if (gId == 'datagridJSONKeyGridDiv') {
			gidForExportShowHideAndReset = 'datagridJSONKeyGridDiv';						//Encryption Keys JSON data
			compulsoryfields = ['Type'];
			exportFileName = 'Encryption Keys';
		} else if (gId == 'softwareGridDiv') {
			gidForExportShowHideAndReset = 'softwareGridDiv';                               //Software
			compulsoryfields = ['Name'];
			exportFileName = 'Software';
		} else if (gId == 'datagridCertificateGridDiv') {
			gidForExportShowHideAndReset = 'datagridCertificateGridDiv';                    //Verishield Retain
			compulsoryfields = ['ID'];
			exportFileName = 'Verishield_retain_certificate';
		} else if (gId == 'datagridJSONCertificatesGridDiv') {
			gidForExportShowHideAndReset = 'datagridJSONCertificatesGridDiv';               //Verishield Retain JSON data
			compulsoryfields = ['ID'];
			exportFileName = 'Verishield_retain_certificate';
		} else if (gId == 'datagridCustomIdentifierGridDiv') {
			gidForExportShowHideAndReset = 'datagridCustomIdentifierGridDiv';               //Custom Identifier
			compulsoryfields = ['Attrib'];
			exportFileName = 'Custom Identifier';
		} else if (gId == 'Verishield_ProtectGridDiv') {
			gidForExportShowHideAndReset = 'Verishield_ProtectGridDiv';                     //Verishield Protect  
			compulsoryfields = ['Attrib'];
			exportFileName = 'Verishield Protect';
		} else if (gId == 'datagridIOModulesDiv') {
			gidForExportShowHideAndReset = 'datagridIOModulesDiv';                          //IO Modules
			compulsoryfields = ['Attrib'];
			exportFileName = 'IO Modules';
		} else if (gId == 'datagridConnectivityWiFiGridDiv') {
			gidForExportShowHideAndReset = 'datagridConnectivityWiFiGridDiv';               //Wifi Connectivity
			compulsoryfields = ['Attrib'];
			exportFileName = 'Wifi Connectivity';
		} /*else if (gId == 'datagridConnectivityBluetoothGridDiv') {
                gidForExportShowHideAndReset = 'datagridConnectivityBluetoothGridDiv';      //Bluetooth Connectivity
                compulsoryfields = ['Attrib'];
                exportFileName = 'Bluetooth Connectivity';
        }*/ else if (gId == 'datagridDownloadAutomationGridDiv') {
			gidForExportShowHideAndReset = 'datagridDownloadAutomationGridDiv';
		}
	}

	function VCLDiagPageGrid(gID, data) {
		var isFilter;
		if (isVCLDiagPageGridFilter == undefined || isVCLDiagPageGridFilter == false) {
			isFilter = false;
		} else {
			isFilter = true;
		}
		isVCLDiagPageGridFilter = true;
		var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
		CallType = InitGridStoragObj.CallType;
		var source =
		{
			datatype: "Array",
			localdata: data,
			datafields: [
				{ name: 'Name', type: 'string' },
				{ name: 'Value', type: 'string' },
			],

		};
		var dataAdapter = new $.jqx.dataAdapter(source);
		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		};
		$("#" + gID).jqxGrid(
			{


				width: '100%',
				height: '200px',
				source: dataAdapter,
				sortable: true,
				filterable: true,
				columnsResize: true,
				columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				enabletooltips: true,
				rowsheight: 32,
				pagesize: 20,
				altrows: true,

				columns: [
					{
						text: i18n.t('Name', { lng: lang }), dataField: 'Name', enabletooltips: false, editable: false, minwidth: 150,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('Value', { lng: lang }), dataField: 'Value', enabletooltips: false, editable: false, minwidth: 150,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					}

				]

			});
	}

	function InformationGrid(gID, templateData, infoGridSourceArr, infoGridColumnArr, data, isFilter) {
		if ($.isEmptyObject(data)) {
			data = new Array();
		}
		isSortable = true;
		if (gID == "datagridHardwareProfileGridDiv" && (koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_FAMILY') || koUtil.deviceFamily.toUpperCase() == AppConstants.get('CARBON_MOBILE_FAMILY')))
			isSortable = false;

		infoGridSourceArr([]);
		infoGridColumnArr([]);
		$("#showNoDataMessage").hide();
		CheckGridForExportAndReset(gID);
		var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
		var gridStorage = InitGridStoragObj.gridStorage;
		CallType = InitGridStoragObj.CallType;
		if (templateData == '') {

			var sourcobj = new Object();
			sourcobj.name = 'Attributes';
			sourcobj.type = 'string';
			infoGridSourceArr.push(sourcobj);
			var sourcobj = new Object();
			sourcobj.name = 'Value';
			sourcobj.type = 'string';
			infoGridSourceArr.push(sourcobj);

			var columnObj = new Object();
			columnObj.text = 'Attribute'
			columnObj.datafield = 'Attributes';
			columnObj.editable = false;
			columnObj.minwidth = 130;
			columnObj.width = 'auto';
			columnObj.enabletooltips = false;
			columnObj.filtertype = "custom";
			columnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
			infoGridColumnArr.push(columnObj);

			var columnObj = new Object();
			columnObj.text = 'Value';
			columnObj.datafield = 'Value';
			columnObj.editable = false;
			columnObj.minwidth = 130;
			columnObj.width = 'auto';
			columnObj.enabletooltips = false;
			columnObj.filtertype = "custom";
			columnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
			infoGridColumnArr.push(columnObj);
		} else {

			for (var i = 0; i < templateData.columns.column.length; i++) {
				var sourcobj = new Object();

				if (templateData.columns.column[i].dataField == 'RS-485') {
					templateData.columns.column[i].dataField = 'RS_485';
					sourcobj.name = 'RS_485';
				} else {
					sourcobj.name = templateData.columns.column[i].dataField;
				}
				sourcobj.type = 'string';
				infoGridSourceArr.push(sourcobj);

				var columnObj = new Object();

				columnObj.text = i18n.t(templateData.columns.column[i].columnName, { lng: lang });

				columnObj.datafield = templateData.columns.column[i].dataField;
				columnObj.editable = false;
				columnObj.minwidth = 100;
				//columnObj.width = 'auto';
				columnObj.cellsrenderer = cellsrenderer;
				//columnObj.enabletooltips = false;
				columnObj.filtertype = "custom";
				if (gridStorage && gridStorage.length > 0 && gridStorage[0].isgridState && gridStorage[0].isgridState['columns']) {
					var gridcolumn = gridStorage[0].isgridState['columns'][templateData.columns.column[i].dataField];
					if (gridcolumn != undefined) {
						columnObj.hidden = gridcolumn.hidden;
					} else {
						columnObj.hidden = false;
					}
				}
				else {
					columnObj.hidden = false;
				}

				if (columnObj.datafield == "Component") {
					columnObj.createfilterpanel = function (datafield, filterPanel) {
						checkArr = getMultiCoiceFilterArr('Component');
						buildFilterPanelMultiChoice(filterPanel, datafield, checkArr, 'Component');
					}
				} else if (columnObj.datafield == "ActivationStatus") {
					columnObj.createfilterpanel = function (datafield, filterPanel) {
						var checkArr = [{ ControlValue: "Active", Value: "Active" }, { ControlValue: "Inactive", Value: "Inactive" }];
						buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
					}
				} else if (columnObj.datafield == "key_type") {
					columnObj.createfilterpanel = function (datafield, filterPanel) {
						var checkArr = [{ ControlValue: "Payment Keys", Value: "Payment Keys" }, { ControlValue: "Warrantied Keys", Value: "Warrantied Keys" }, { ControlValue: "Generic Keys", Value: "Generic Keys" },
						{ ControlValue: "Expected Keys", Value: "Expected Keys" }, { ControlValue: "Missing Keys", Value: "Missing Keys" }];
						buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
					}
				} else {
					columnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
				}
				infoGridColumnArr.push(columnObj);
			}
		}

		var source =
		{
			datatype: "Array",
			localdata: data,
			datafields: infoGridSourceArr(),

		};
		var dataAdapter = new $.jqx.dataAdapter(source);
		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		};

		var buildFilterPanelMultiChoice = function (filterPanel, datafield, checkArr, name) {
			multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gID, checkArr, true);
		}

		function cellsrenderer(row, columnfield, value, defaulthtml, columnproperties) {
			if (value == "Android Details")
				return '<div style="font-weight:bold;font-size:15px;padding-left:5px; padding-top:7px;">Android Details</div>';
			else if (value == "Active")
				return '<div style="padding-left:5px;padding-top:7px"><span><i class="icon-checkmark" style="color:green"></i></span><span style="padding-left:5px;padding-top:7px">' + value + '</span></div>';
			else if (value == "Inactive")
				return '<div style="padding-left:5px;padding-top:7px"><span><i class="icon-cross" style="color:red"></i></span><span style="padding-left:5px;padding-top:7px">' + value + '</span></div>';
			else
				return '<div style="padding-left:5px; padding-top:7px;">' + value + '</div>';
		}

		$("#" + gID).jqxGrid(
			{

				width: "99%",
				source: dataAdapter,
				sortable: isSortable,
				filterable: true,
				columnsResize: true,
				columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				enabletooltips: true,
				rowsheight: 32,
				pagesize: data.length,
				altrows: true,
				ready: function () {
					$('#jqxScrollWraphorizontalScrollBardatagridHardwareProfileGridDiv').css('visibility', 'hidden');
					var gridheight = $(window).height();
					gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 50;
					if (gridheight < 300)
						gridheight = 562;
					$("#" + gID).jqxGrid({ height: gridheight });


				},

				columns: infoGridColumnArr()

			});
	}

	function InformationGridProtection(gID, templateData, infoGridSourceArr, infoGridColumnArr, data) {
		if ($.isEmptyObject(data)) {
			data = new Array();
		}
		var gridHeight;
		if (data.length > 0) {
			gridHeight = 332;
		}
		else {
			gridHeight = 100;
		}

		infoGridSourceArr([]);
		infoGridColumnArr([]);
		CheckGridForExportAndReset(gID);
		var isFilter;
		if (isInformationGridProtectionFilter == undefined || isInformationGridProtectionFilter == false) {
			isFilter = false;
		} else {
			isFilter = true;
		}
		isInformationGridProtectionFilter = true;
		var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
		var gridStorage = InitGridStoragObj.gridStorage;
		CallType = InitGridStoragObj.CallType;

		if (templateData.length) {
			vclInfo = templateData[0];
		}
		else {
			vclInfo = templateData;
		}

		for (var i = 0; i < vclInfo.columns.column.length; i++) {
			var sourcobj = new Object();
			sourcobj.name = vclInfo.columns.column[i].dataField;
			sourcobj.type = 'string';
			infoGridSourceArr.push(sourcobj);

			var columnObj = new Object();
			columnObj.text = i18n.t(vclInfo.columns.column[i].columnName, { lng: lang });

			columnObj.datafield = vclInfo.columns.column[i].dataField;
			columnObj.editable = false;
			columnObj.minwidth = 130;
			columnObj.width = 'auto';
			columnObj.enabletooltips = false;
			columnObj.filtertype = "custom";
			if (gridStorage && gridStorage.length && gridStorage[0].isgridState['columns']) {
				var gridcolumn = gridStorage[0].isgridState['columns'][vclInfo.columns.column[i].dataField];
				columnObj.hidden = gridcolumn.hidden;
			}
			else
				columnObj.hidden = false;
			columnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
			infoGridColumnArr.push(columnObj);
		}

		var source =
		{
			datatype: "Array",
			localdata: data,
			datafields: infoGridSourceArr()
		};
		var dataAdapter = new $.jqx.dataAdapter(source);
		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		};
		$("#" + gID).jqxGrid(
			{

				width: "100%",
				height: gridHeight,
				source: dataAdapter,
				sortable: true,
				filterable: true,
				columnsResize: true,
				columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				enabletooltips: true,
				rowsheight: 32,
				pagesize: 20,
				altrows: true,
				columns: infoGridColumnArr()

			});
	}

	function InformationGridConnectivity(gID, templateData, infoGridSourceArr, infoGridColumnArr, data, gridId) {
		if ($.isEmptyObject(data)) {
			data = new Array();
		}
		infoGridSourceArr([]);
		infoGridColumnArr([]);
		CheckGridForExportAndReset(gID);
		var isFilter;
		if (isInformationGridConnectivityFilter == undefined || isInformationGridConnectivityFilter == false) {
			isFilter = false;
		} else {
			isFilter = true;
		}
		isInformationGridConnectivityFilter = true;
		var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
		var gridStorage = InitGridStoragObj.gridStorage;
		CallType = InitGridStoragObj.CallType;
		for (var i = 0; i < templateData.grid[gridId].columns.column.length; i++) {
			var sourcobj = new Object();
			sourcobj.name = templateData.grid[gridId].columns.column[i].dataField;
			sourcobj.type = 'string';
			infoGridSourceArr.push(sourcobj);

			var columnObj = new Object();
			columnObj.text = i18n.t(templateData.grid[gridId].columns.column[i].columnName, { lng: lang });

			columnObj.datafield = templateData.grid[gridId].columns.column[i].dataField;
			columnObj.editable = false;
			columnObj.minwidth = 130;
			columnObj.width = 'auto';
			columnObj.enabletooltips = false;
			columnObj.filtertype = "custom";
			if (gridStorage && gridStorage.length && gridStorage[0].isgridState['columns']) {
				var gridcolumn = gridStorage[0].isgridState['columns'][templateData.grid[gridId].columns.column[i].dataField];
				columnObj.hidden = gridcolumn.hidden;
			}
			else
				columnObj.hidden = false;
			columnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
			infoGridColumnArr.push(columnObj);
		}

		var source =
		{
			datatype: "Array",
			localdata: data,
			datafields: infoGridSourceArr()
		};
		var dataAdapter = new $.jqx.dataAdapter(source);
		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		};
		$("#" + gID).jqxGrid(
			{

				width: "100%",
				source: dataAdapter,
				sortable: true,
				filterable: true,
				columnsResize: true,
				columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				enabletooltips: true,
				rowsheight: 32,
				pagesize: 20,
				altrows: true,
				ready: function () {

					if (data.length > 0) {
						if (gridId == 0) {
							var gridheight = $(window).height();
							gridheight = ((gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 100) / 2;
							$("#" + gID).jqxGrid({ height: gridheight });

							gridHeight = gridheight;
						} else {
							$("#" + gID).jqxGrid({ height: gridHeight });
						}
					} else {
						$("#" + gID).jqxGrid({ height: 100 });
					}
				},
				columns: infoGridColumnArr()

			});
	}

	function getfunctionvalue(val, functionName, xmlobj, deviceprofilDataSetContent, ApplicationDataSetContent) {
		if ((functionName == "calculateVolts" || functionName == "calculateBatteryVoltage") && val != null && val != "") {
			var voltage = 0;
			voltage = parseFloat(val);
			voltage = voltage / 10;
			return voltage + " Volts";
		} else if (functionName == "calculateBatteryPercentage" && val != null && val != "") {
			var batteryPercentage = parseFloat(val);
			return batteryPercentage + "%";
		}

		//} else if ((functionName == "calculateBatteryVoltage" || functionName == "calculateBatteryPercentage") && val != null && val != "") {
		//    var batteryVoltage = parseFloat(val);
		//    return batteryVoltage + "mV";

		//  } 
		else if (functionName == "calculateBatteryCapacity" && val != null && val != "") {
			var batteryCapacity = parseFloat(val);
			return batteryCapacity + "mAh";

		} else if (functionName == "calculateBatteryRemainingCapacity" && val != null && val != "") {
			var batteryRemainingCapacity = parseFloat(val);
			return batteryRemainingCapacity + "mAh";

		} else if (functionName == "calculateBatteryTemperature" && val != null && val != "") {
			var batteryTemperature = parseFloat(val);
			return batteryTemperature + " °C";

		} else if (functionName == "getBatteryStatus" && val != null && val != "") {

			var builtInbattery = "No";
			if (val == "True") {
				builtInbattery = "Yes";
			}
			return builtInbattery;

		} else if (functionName == "getVerAvailabilty" && val != null && val != "") {
			var stylusPresent = "No";
			if (val > 0) {
				stylusPresent = "Yes";
			}
			return stylusPresent;
		}

		if (xmlobj.xmlAttribute == "VHQVersion" && val != null && val != "") {

			for (var i = 0; i < xmlobj.option.length; i++) {
				if (xmlobj.option[i].xmlAttribute == "VHQVersion") {

					return deviceprofilDataSetContent[0].VHQVersion;


				} else if (xmlobj.option[i].xmlAttribute == "vhq_sys") {
					return ApplicationDataSetContent[0].vhq_sys;

				} else if (xmlobj.option[i].xmlAttribute == "vhq") {
					return ApplicationDataSetContent[0].vhq;

				}
			}
		}
	}

	function getCustomIdentifiers(data, infoGridSourceArr, infoGridColumnArr) {
		var uniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
		var callBackfunction = function (data, error) {
			var dataArr = [];
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data.customIdentifiers)
						data.customIdentifiers = $.parseJSON(data.customIdentifiers);
					if (data.GetCustomIdentifiersResult) {
						if (data.customIdentifiers != "" || data.customIdentifiers != null) {
							if (data.customIdentifiers.length != 0) {
								dataArr = data.customIdentifiers;
							} else {
								dataArr = [];
							}
							InformationGridCustomIdentifiersTabletDetails('datagridCustomIdentifierGridDiv', data, infoGridSourceArr, infoGridColumnArr, dataArr);
						} else {
							InformationGridCustomIdentifiersTabletDetails('datagridCustomIdentifierGridDiv', data, infoGridSourceArr, infoGridColumnArr, []);
						}
					}
				}
			}
		}


		var params = '{"token":"' + TOKEN() + '","uniqueDeviceId":' + uniqueDeviceId + '}';
		ajaxJsonCall('GetCustomIdentifiers', params, callBackfunction, true, 'POST', true);
	}

	function CheckAutoDownloadStatus() {
		var CheckAutoDownloadStatusReq = new Object();
		var Selector = new Object();
		var arr = new Array();
		arr.push(koUtil.deviceProfileUniqueDeviceId);
		var selectedIds = arr;
		var unselectedDeviceSearchItems = null;

		Selector.SelectedItemIds = selectedIds;
		Selector.UnSelectedItemIds = null;

		CheckAutoDownloadStatusReq.Selector = Selector;

		var callBackfunction = function (data, error) {
			if (data) {
				if (data.checkAutoDownloadStatusResp)
					data.checkAutoDownloadStatusResp = $.parseJSON(data.checkAutoDownloadStatusResp);
				isAutoDownload = data.checkAutoDownloadStatusResp.AutoDownload;
				if (isAutoDownload) {
					if (isAutoDownload == 2)
						isAutoDownloadStatus = false;
					else if (isAutoDownload == 1)
						isAutoDownloadStatus = true;
				}
			}
		}

		var method = 'CheckAutoDownloadStatus';
		var params = '{"token":"' + TOKEN() + '","checkAutoDownloadStatusReq":' + JSON.stringify(CheckAutoDownloadStatusReq) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
	}

	function InformationGridCustomIdentifiersTabletDetails(gID, templateData, infoGridSourceArr, infoGridColumnArr, data, gridId) {
		if ($.isEmptyObject(data)) {
			data = new Array();
		}
		infoGridSourceArr([]);
		infoGridColumnArr([]);
		CheckGridForExportAndReset(gID);
		var isFilter;
		if (isInformationGridCustomIdentifiersFilter == undefined || isInformationGridCustomIdentifiersFilter == false) {
			isFilter = false;
		} else {
			isFilter = true;
		}
		isInformationGridCustomIdentifiersFilter = true;
		var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
		var gridStorage = InitGridStoragObj.gridStorage;
		CallType = InitGridStoragObj.CallType;
		//for (var i = 0; i < templateData.customIdentifiers.length; i++) {
		//    var sourcobj = new Object();
		//    sourcobj.AttributeName = templateData.customIdentifiers[i].AttributeName;
		//    sourcobj.Value = templateData.customIdentifiers[i].Value;
		//    sourcobj.type = 'string';
		//    infoGridSourceArr.push(sourcobj);
		//}

		//var arr = infoGridColumnArr();
		$("#showNoDataMessage").hide();
		var source =
		{
			datatype: "Array",
			localdata: data,
			dataFields: [
				{ name: 'AttributeName', map: 'AttributeName', type: 'string' },
				{ name: 'Value', map: 'Value', type: 'string' }
			],

		};
		var dataAdapter = new $.jqx.dataAdapter(source);
		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		};
		$("#" + gID).jqxGrid(
			{

				width: "100%",

				height: gridHeightFunction(gID, "50"),
				source: dataAdapter,
				sortable: true,
				filterable: true,
				columnsResize: true,
				columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				enabletooltips: true,
				rowsheight: 32,
				pagesize: 20,
				altrows: true,
				autoshowfiltericon: true,
				rendergridrows: function () {
					return dataAdapter.records;
				},
				ready: function () {
					callOnGridReady(gID, gridStorage, CallType, '');
					var gridheight = $(window).height();
					gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 50;
					if (gridheight < 300)
						gridheight = 562;
					$("#" + gID).jqxGrid({ height: gridheight });
				},
				columns: [
					{
						text: 'Attribute', dataField: 'AttributeName', editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: 'Value', dataField: 'Value', editable: false,
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					}

				]
			});
	}

	function getDownloadBundlesForDevice(templateData, gID, isTablet) {

		var getDownloadBundlesForDeviceReq = new Object();

		getDownloadBundlesForDeviceReq.UniquedeviceId = koUtil.deviceProfileUniqueDeviceId;
		getDownloadBundlesForDeviceReq.Family = koUtil.deviceFamily;
		getDownloadBundlesForDeviceReq.Protocol = koUtil.Protocol;

		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					self.downloadBundles = [];
					self.downloadApps = [];
					self.bundlesApps = [];

					if (data.downloadBundles && data.downloadBundles != "null") {
						data.downloadBundles = $.parseJSON(data.downloadBundles);

						self.downloadBundles = data.downloadBundles;

					} if (data.downloadApps && data.downloadApps != "null") {
						data.downloadApps = $.parseJSON(data.downloadApps);

						self.downloadApps = data.downloadApps;
					}

					self.bundlesApps = $.merge($.merge([], self.downloadBundles), self.downloadApps);
					self.bundlesApps.sort(function (a, b) { return a.Sequence > b.Sequence ? 1 : -1; });
					softwareStatusGrid(gID, self.downloadBundles, self.downloadApps, self.bundlesApps);
				}
			}
		}

		var params = '{"token":"' + TOKEN() + '","getDownloadBundlesForDeviceReq":' + JSON.stringify(getDownloadBundlesForDeviceReq) + '}';
		ajaxJsonCall('GetDownloadBundlesForDevice', params, callBackfunction, true, 'POST', true);
	}

	function softwareStatusGrid(gID, downloadBundles, downloadApps, bundlesApps) {

		if (String(koUtil.Protocol).toUpperCase() == AppConstants.get('VEM_PROTOCOL')) {
			isSoftwareStatusGridLoaded = true;
			if (ComputedDeviceStatus.toUpperCase() != "DELETED" && ComputedDeviceStatus.toUpperCase() != "BLACKLISTED") {
				CheckAutoDownloadStatus();
			}

			if (bundlesApps && bundlesApps.length > 0) {
				NestedPackageApplicationGrid(gID, bundlesApps, koUtil.ModelName);
				$("#showNoDataMessage").hide();
			}
			else {
				NestedPackageApplicationGrid(gID, [], koUtil.ModelName);
			}
		}
	}

	function getFileStatus(gID) {
		var getFileStatusReq = new Object();

		getFileStatusReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
		getFileStatusReq.Family = koUtil.deviceFamily;
		getFileStatusReq.Protocol = koUtil.Protocol;

		var callBackfunction = function (data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					self.packageFiles = [];
					if (data.GetFileStatusResp.PackageFiles) {
						self.packageFiles = data.GetFileStatusResp.PackageFiles;
					}

					NestedPackageFileStatusGrid(gID, self.packageFiles, koUtil.ModelName);
				}
			}
		}

		var params = '{"token":"' + TOKEN() + '","getFileStatusReq":' + JSON.stringify(getFileStatusReq) + '}';
		ajaxJsonCall('GetFileStatus', params, callBackfunction, true, 'POST', true);
	}

	function softwareApplicationsGrid(gID, data, infoGridSourceArr, infoGridColumnArr, isFilter) {
		infoGridSourceArr([]);
		infoGridColumnArr([]);
		$("#showNoDataMessage").hide();
		CheckGridForExportAndReset(gID);
		var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
		var gridStorage = InitGridStoragObj.gridStorage;
		CallType = InitGridStoragObj.CallType;
		// prepare the data
		var source =
		{
			datatype: "json",
			localdata: data,
			datafields: [
				{ name: 'Name', map: 'Name', type: 'string' },
				{ name: 'Id', map: 'Id', type: 'string' },
				{ name: 'Type', map: 'Type', type: 'string' },
				{ name: 'Version', map: 'Version', type: 'string' },
				{ name: 'BundleName', map: 'BundleName', type: 'string' },
				{ name: 'BundleVersion', map: 'BundleVersion', type: 'string' },
				{ name: 'Component', map: 'Component', type: 'string' },
				{ name: 'ActivationStatus', map: 'ActivationStatus', type: 'string' },
				{ name: 'Location', map: 'Location', type: 'string' }
			],

			contentType: 'application/json',
		};
		var dataAdapter = new $.jqx.dataAdapter(source);

		var buildFilterPanel = function (filterPanel, datafield) {
			wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
		}

		var buildFilterPanelMultiChoice = function (filterPanel, datafield, checkArr, name) {
			multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gID, checkArr, true);
		}

		function cellsrenderer(row, columnfield, value, defaulthtml, columnproperties) {
			if (value == "Android Details")
				return '<div style="font-weight:bold;font-size:15px;padding-left:5px; padding-top:7px;">Android Details</div>';
			else if (value == "Active")
				return '<div style="padding-left:5px;padding-top:7px"><span><i class="icon-checkmark" style="color:green"></i></span><span style="padding-left:5px;padding-top:7px">' + value + '</span></div>';
			else if (value == "Inactive")
				return '<div style="padding-left:5px;padding-top:7px"><span><i class="icon-cross" style="color:red"></i></span><span style="padding-left:5px;padding-top:7px">' + value + '</span></div>';
			else
				return '<div style="padding-left:5px; padding-top:7px;">' + value + '</div>';
		}
		// create jqxgrid.
		$("#" + gID).jqxGrid(
			{
				width: "100%",
				source: dataAdapter,
				sortable: true,
				filterable: true,
				columnsResize: true,
				columnsreorder: false,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				showsortmenuitems: false,
				enabletooltips: true,
				rowsheight: 32,
				altrows: true,
				ready: function () {
					callOnGridReady(gID, gridStorage);
					var columns = genericHideShowColumn(gID, true, []);
					koUtil.gridColumnList = new Array();
					for (var i = 0; i < columns.length; i++) {
						koUtil.gridColumnList.push(columns[i].columnfield);
					}
					visibleColumnsList = koUtil.gridColumnList;

					var gridheight = $(window).height();
					gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 50;
					if (gridheight < 300)
						gridheight = 562;
					$("#" + gID).jqxGrid({ height: gridheight });
				},
				columns: [
					{
						text: i18n.t('sw_app_name', { lng: lang }), datafield: 'Name', minwidth: 150, width: 'auto',
						filtertype: "custom", cellsrenderer: cellsrenderer,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('sw_app_version', { lng: lang }), datafield: 'Version', minwidth: 100, width: 'auto',
						filtertype: "custom", cellsrenderer: cellsrenderer,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('sw_app_type', { lng: lang }), datafield: 'Type', minwidth: 100, width: 'auto',
						filtertype: "custom", cellsrenderer: cellsrenderer,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('sw_app_id', { lng: lang }), datafield: 'Id', minwidth: 100, width: 'auto',
						filtertype: "custom", cellsrenderer: cellsrenderer,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},

					{
						text: i18n.t('sw_app_bundlename', { lng: lang }), datafield: 'BundleName', minwidth: 100, width: 'auto',
						filtertype: "custom", cellsrenderer: cellsrenderer,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('sw_app_bundleversion', { lng: lang }), datafield: 'BundleVersion', minwidth: 100, width: 'auto',
						filtertype: "custom", cellsrenderer: cellsrenderer,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('sw_app_component', { lng: lang }), datafield: 'Component', minwidth: 100, width: 'auto',
						filtertype: "custom", cellsrenderer: cellsrenderer,
						createfilterpanel: function (datafield, filterPanel) {
							checkArr = getMultiCoiceFilterArr('Component');
							buildFilterPanelMultiChoice(filterPanel, datafield, checkArr, 'Component');
						}
					},
					{
						text: i18n.t('sw_app_activationstatus', { lng: lang }), datafield: 'ActivationStatus', minwidth: 100, width: 'auto',
						filtertype: "custom", cellsrenderer: cellsrenderer,
						createfilterpanel: function (datafield, filterPanel) {
							var checkArr = [{ ControlValue: "Active", Value: "Active" }, { ControlValue: "Inactive", Value: "Inactive" }];
							buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
						}
					},
					{
						text: i18n.t('sw_app_location', { lng: lang }), datafield: 'Location', minwidth: 100, width: 'auto',
						filtertype: "custom", cellsrenderer: cellsrenderer,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					}
				]
			});
		callUiGridFilter(gID, gridStorage);
	}

	function toggleAccordian(e) {
		if (!$.isEmptyObject(e)) {
			$(e.target)
				.prev('.panel-heading')
				.find("i.indicator")
				.toggleClass('icon-angle-down icon-angle-up');
			if (e.target.className.indexOf('collapse in') == -1) {
				if (e.target.id == 'InstalledPKcollapseOne') {
					$('#AccordionInstalledKeys').click();
				} else if (e.target.id == 'InstalledPKcollapseTwo') {
					$('#AccordionFileStatus').click();
				} else {
					$('#AccordionInstalledPackages').click();
				}
			}
		}
	}

	function keysApplicationsGrid(gID, param) {
		var InitGridStoragObj = initGridStorageObj(gID);
		var gridStorage = InitGridStoragObj.gridStorage;

		var source =
		{
			dataType: "json",
			datafields: [
				{ name: 'Sync', map: 'Sync', type: 'string' },
				{ name: 'Name', map: 'Name', type: 'string' },
				{ name: 'KeyType', map: 'KeyType', type: 'string' },
				{ name: 'Destination', map: 'Destination', type: 'string' },
				{ name: 'Status', map: 'Status', type: 'string' },
				{ name: 'AdditionalInfo', map: 'AdditionalInfo', type: 'string' },
				{ name: 'InstallDate', map: 'InstallDate', type: 'date' },
				{ name: 'KeyHandleId', map: 'KeyHandleId', type: 'string' },
			],
			root: 'getDownloadJobSummaryResp',
			type: "POST",
			data: param,

			url: AppConstants.get('API_URL') + "/GetDeviceKeysStatus",
			contentType: 'application/json',
			beforeprocessing: function (data) {
				if (data && data.getDownloadJobSummaryResp) {
					data.getDownloadJobSummaryResp = $.parseJSON(data.getDownloadJobSummaryResp);
				}
				else
					data.getDownloadJobSummaryResp = [];
			},
		};

		var dataAdapter = new $.jqx.dataAdapter(source,
			{
				formatData: function (data) {
					$('.all-disabled').show();
					columnSortFilter = new Object();
					columnSortFilter = columnSortFilterFormatedData(columnSortFilterKeyProfiles, gID, gridStorage, 'KeyStatus');
					param.getDeviceKeysStatusReq.ColumnSortFilter = columnSortFilter;
					param.getDeviceKeysStatusReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
					koUtil.GlobalColumnFilter = columnSortFilter;
					data = JSON.stringify(param);
					return data;
				},
				downloadComplete: function (data, status, xhr) {
					if (data.getDownloadJobSummaryResp && data.getDownloadJobSummaryResp) {
						for (var i = 0; i < data.getDownloadJobSummaryResp.length; i++) {
							data.getDownloadJobSummaryResp[i].InstallDate = convertToLocaltimestamp(data.getDownloadJobSummaryResp[i].InstallDate);
						}
					} else {
						data.getDownloadJobSummaryResp = new Object();
						data.getDownloadJobSummaryResp = [];

					}
					$('.all-disabled').hide();
				},
				loadError: function (jqXHR, status, error) {
					$('.all-disabled').hide();
				}
			}
		);

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

		var syncRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var status = $("#" + gID).jqxGrid('getcellvalue', row, 'Status');
			if (status == 'Install Successful') {
				return '<div style="color: green; margin-left: 50%; left: -15px; top: 7px; position: relative;"><span style="color: green;" title="Sync"><i class="icon-checkmark"></i></span></div>';
			}
			else {
				return '<div style="color: orange; margin-left: 50%; left: -15px; top: 7px; position: relative;"><span style="color: orange;" title="Not in Sync"><i class="icon-cross"></i></span></div>';
			}
		}

		var dateRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			var status = $("#" + gID).jqxGrid('getcellvalue', row, 'Status');
			var installDate = $("#" + gID).jqxGrid('getcellvalue', row, 'InstallDate');
			if (status != 'Install Successful') {
				return '<span></span>';
			}
		}

		//  Tootip renderer for download status
		var toolTipDownStatusloadRenderer = function (row, column, value, defaultHtml) {
			defaultHtml = displayTooltipAndIconRendererForVRK(gID, row, column, value, defaultHtml);
			return defaultHtml;
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

				autoshowfiltericon: true,
				columns: [
					{
						text: i18n.t('sync', { lng: lang }), datafield: 'Sync', width: 40, menu: false,
						cellsrenderer: syncRenderer, filterable: false, sortable: false, columnsResize: false
					},
					{
						text: i18n.t('sw_app_name', { lng: lang }), datafield: 'Name', width: 'auto',
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('key_type', { lng: lang }), datafield: 'KeyType', width: 'auto',
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('destination', { lng: lang }), datafield: 'Destination', minwidth: 100, width: 'auto',
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('Status', { lng: lang }), datafield: 'Status', minwidth: 100, width: 'auto',
						filtertype: "custom", enabletooltips: false, cellsrenderer: toolTipDownStatusloadRenderer,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanelMultiChoice(filterPanel, datafield, 'Key Status');
						}
					},
					{
						text: i18n.t('additional_info', { lng: lang }), datafield: 'AdditionalInfo', minwidth: 120, width: 'auto',
						filtertype: "custom",
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanel(filterPanel, datafield);
						}
					},
					{
						text: i18n.t('Installed On', { lng: lang }), datafield: 'InstallDate', editable: false, minwidth: 120,
						width: 'auto', cellsformat: LONG_DATETIME_GRID_FORMAT, filtertype: "custom", cellsrenderer: dateRenderer,
						createfilterpanel: function (datafield, filterPanel) {
							buildFilterPanelDate(filterPanel, datafield);
						}
					},
					{
						text: 'Refresh', datafield: 'Refresh', menu: false, enabletooltips: false, sortable: false, minwidth: 70, width: 'auto', editable: false,
						cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
							var rowData = $("#" + gID).jqxGrid('getrowdata', row);
							var status = rowData.Status;
							var editToolipMessage = i18n.t('refresh_keys_tooltip', { lng: lang });
							var label = i18n.t('refresh_keys_label', { lng: lang });
							if (status == 'Download Failed' || status == 'Error' || status == 'Failed' || status == 'Install Failed' || status == 'Install Successful') {
								return '<div class="btn btn-xs btn-default" style="margin-top:4px;cursor:pointer;margin-left:15px;padding:2px 5px !important;" title="' + editToolipMessage + '"><a id="imageId" style="margin-left:5px;" height="60" width="50"  onClick="refreshKeysInDevice(' + row + ')">' + label + '</a></div>'
							} else {
								return '<div class="btn btn-xs btn-default disabled"  disabled="true" style="margin-top:4px;cursor:default;margin-left:15px;padding:2px 5px !important;" title="' + editToolipMessage + '"><i class="icon-pencil"></i><a id="imageId" style="margin-left:5px;cursor:default"  height="60" width="50" >' + label + '</a></div>'

							}
						}
					}
				]
			});

		callGridFilter(gID, gridStorage);
		callGridSort(gID, gridStorage, 'Name');
		$('#accordionInstalledPackageandKeys').on('hidden.bs.collapse', toggleAccordian);
		$('#accordionInstalledPackageandKeys').on('shown.bs.collapse', toggleAccordian);

	}


	function getKeysOnDevice() {

		var param = getKeysOnDeviceParameters(columnSortFilterKeyProfiles);
		keysApplicationsGrid('installedkeysGridDiv', param);
	}

	function getKeysOnDeviceParameters(columnSortFilterDeviceKeysStatus) {

		var getDeviceKeysStatusReq = new Object();

		var ColumnSortFilter = columnSortFilterDeviceKeysStatus;
		ColumnSortFilter.GridId = "KeyStatus";
		var FilterList = new Array();
		var columnfilter = new Object();
		columnfilter.FilterColumn = null;
		columnfilter.FilterValue = null;
		FilterList.push(columnfilter);

		getDeviceKeysStatusReq.ColumnSortFilter = ColumnSortFilter;
		getDeviceKeysStatusReq.UniqueDeviceId = koUtil.UniqueDeviceId;

		var param = new Object();
		param.token = TOKEN();
		param.getDeviceKeysStatusReq = getDeviceKeysStatusReq;
		return param;
	}

	function getApplicationsOnDevice(templateData, infoGridSourceArr, infoGridColumnArr, isFilter) {
		$("#loadingDiv").show();
		var getApplicationsOnDeviceReq = new Object();
		getApplicationsOnDeviceReq.uniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

		var callBackfunction = function (data, error) {
			$("#loadingDiv").hide();
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					if (data && data.getApplicationsOnDeviceResp) {
						data.getApplicationsOnDeviceResp = $.parseJSON(data.getApplicationsOnDeviceResp);
						self.softwareApplications = data.getApplicationsOnDeviceResp.Applications;
						$('#softwareDiv').empty();
						$('#softwareDiv').html('<div id="softwareGridDiv"></div>');
						if (self.softwareApplications && self.softwareApplications.length > 0) {
							softwareApplicationsGrid('softwareGridDiv', self.softwareApplications, infoGridSourceArr, infoGridColumnArr, isFilter);
						} else {
							softwareApplicationsGrid('softwareGridDiv', [], infoGridSourceArr, infoGridColumnArr, isFilter);
						}
					}
				}
			}
		}

		var params = '{"token":"' + TOKEN() + '","getApplicationsOnDeviceReq":' + JSON.stringify(getApplicationsOnDeviceReq) + '}';
		ajaxJsonCall('GetApplicationsOnDevice', params, callBackfunction, true, 'POST', true);
	}
	function generateTemplate(tempname, controllerId) {
		//new template code
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
		// end new template code
	}

});

var source;
var childsource;

function ApplicationViewGridforZontalkDevices(gID, data) {
	GridIDBoundlesApp = 2;
	$('#datagridDownloadAutomationDiv').empty();
	$('#datagridDownloadAutomationDiv').html('<div id="datagridDownloadAutomationGridDiv"></div>');
	source =
		{
			datatype: "Array",
			localdata: data,
			datafields: [
				{ name: 'ApplicationId', type: 'string' },
				{ name: 'AppNameOnDevice', type: 'string' },
				{ name: 'AppNameOnServer', type: 'string' },
				{ name: 'AppVersionOnDevice', type: 'string' },
				{ name: 'AppVersionOnServer', type: 'string' },
				{ name: 'SyncStatus', type: 'string' },
				{ name: 'IsEnableForAutomation', type: 'bool' },
			],

		};
	var dataAdapter = new $.jqx.dataAdapter(source);
	var buildFilterPanel = function (filterPanel, datafield) {
		wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
	};
	var syncRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
		value = source.localdata[row].SyncStatus;
		if (value == 'Sync') {
			return '<div style="color: green; margin-left: 50%; left: -15px; top: 7px; position: relative;"><span style="color: green;" title="Sync"><div class="iconImg inactive_Orange" ></div></i></span></div>'
		}
		else if (protocolName.toLowerCase() == "zontalk" && source.localdata[row].IsEnableForAutomation == false) {
			return '<div style="color: black; margin-left: 50%; left: -15px; top: 7px; position: relative;"><span style="color: black;" title="Not Applicable"><i class="icon-minus"></i></span></div>'
		}
		else {
			return '<div style="color: orange; margin-left: 50%; left: -15px; top: 7px; position: relative;"><span style="color: orange;" title="Not in Sync"><div class="iconImg statusActive-success"></div></span></div>'
		}
	}

	var applicationNameServer = function (row, columnfield, value, defaulthtml, columnproperties) {
		var dataValue = source.localdata[row].AppNameOnServer;
		var type = 'Server';
		return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + dataValue + '</span></div>'

	}
	var applicationNameDevice = function (row, columnfield, value, defaulthtml, columnproperties) {
		var dataValue = source.localdata[row].AppNameOnDevice;
		var type = 'Device';
		return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + dataValue + '</span></div>'

	}

	var applicationVersionDevice = function (row, columnfield, value, defaulthtml, columnproperties) {
		var dataValue = source.localdata[row].AppVersionOnDevice;
		var type = 'Device';
		return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + dataValue + '</span></div>'

	}

	var applicationVersionServer = function (row, columnfield, value, defaulthtml, columnproperties) {
		var dataValue = source.localdata[row].AppVersionOnServer;
		var type = 'Device';
		return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + dataValue + '</span></div>'

	}

	var resultsRender = function (row, columnfield, value, defaulthtml, columnproperties) {
		var data = $("#" + gID).jqxGrid('getrowdata', row);
		var appName = "'" + source.localdata[row].AppNameOnServer + "'";
		var appId = "'" + source.localdata[row].ApplicationId + "'";
		return '<div style="padding-left:5x;padding-top:7px;cursor:pointer;"> <a title="Click to view Application Details"  id="imageId" style="text-decoration:underline;" onClick="openIconPopupApplicationDetails(' + appName + ',' + appId + ')" height="60" width="50" >View Details</a></div>'
	}

	$("#" + gID).jqxGrid(
		{
			width: "100%",
			height: "100%",
			source: dataAdapter,
			editable: true,


			columns: [
				{
					text: i18n.t('ApplicationId', { lng: lang }), datafield: 'ApplicationId', cellsalign: 'center', align: 'center', minwidth: 130, hidden: true
				},
				{
					text: i18n.t('Download Automation', { lng: lang }), datafield: 'IsEnableForAutomation', columntype: 'checkbox', width: 250, menu: false, cellsalign: 'left', align: 'center'
				},
				{
					text: i18n.t('status', { lng: lang }), cellsalign: 'center', align: 'center', datafield: 'SyncStatus', editable: false, minwidth: 130, menu: false, cellsrenderer: syncRenderer,
					filtertype: "custom"
				},
				{
					text: i18n.t('AppNameOnServer', { lng: lang }), columngroup: 'onServer', cellsalign: 'center', editable: false, align: 'center', datafield: 'AppNameOnServer', minwidth: 130, cellsrenderer: applicationNameServer,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('AppVersionOnServer', { lng: lang }), columngroup: 'onServer', editable: false, datafield: 'AppVersionOnServer', cellsalign: 'center', align: 'center', minwidth: 130, cellsrenderer: applicationVersionServer,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('AppNameOnDevice', { lng: lang }), columngroup: 'onDevice', editable: false, datafield: 'AppNameOnDevice', cellsalign: 'center', align: 'center', minwidth: 130, cellsrenderer: applicationNameDevice,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('AppVersionOnDevice', { lng: lang }), columngroup: 'onDevice', editable: false, cellsalign: 'center', align: 'center', datafield: 'AppVersionOnDevice', minwidth: 130, cellsrenderer: applicationVersionDevice,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				},
				{
					text: i18n.t('attribute_Details', { lng: lang }), columngroup: 'onDevice', editable: false, cellsalign: 'center', align: 'center', minwidth: 100, sortable: false, columnsResize: false, filterable: false, cellsrenderer: resultsRender,
					filtertype: "custom"
				}

			],
			columngroups:
				[
					{ text: 'On Server', align: 'center', name: 'onServer' },
					{ text: 'On Device', align: 'center', name: 'onDevice' }
				]

		});


	$("#" + gID).bind('cellendedit', function (event) {
		rowOfDownloadAutomation = event.args.rowindex;
		datafieldOfDownloadAutomation = event.args.datafield;
		oldvalueOfDownloadAutomation = event.args.oldvalue;
		var status;
		if (event.args.value == false) {
			isEnableForAutomation = false;
			status = " disable Download Automation ?";
		}
		else {
			isEnableForAutomation = true;
			status = " enable Download Automation ?";
		}

		PopupRow = rowOfDownloadAutomation;
		var msg = i18n.t('enable_disable_download_automation', { lng: lang });
		$("#confirmation").text(msg + status);
		$("#IsEnableConfirmMsg").modal('show');

	});
	$("#columntable" + gID).parent('div').removeClass('jqx-grid-header');
}

function NestedPackageApplicationGrid(gID, data, model) {
	GridIDBoundlesApp = 1;
	//$('#datagridDownloadAutomationDiv').empty();
	//$('#datagridDownloadAutomationDiv').html('<div id="datagridDownloadAutomationGridDiv"></div>');

	ParentData = data;
	if (data) {
		var childData = new Array();
		for (var i = 0; i < data.length; i++) {
			if (data[i].DownloadBundles) {
				for (var j = 0; j < data[i].DownloadBundles.length; j++) {
					data[i].DownloadBundles[j].Component = data[i].Component;
					data[i].DownloadBundles[j].PackageMode = data[i].PackageMode;
				}
				childData.push(data[i].DownloadBundles);
			} else {
				if (data[i].DownloadApps) {
					for (var j = 0; j < data[i].DownloadApps.length; j++) {
						data[i].DownloadApps[j].Component = data[i].Component;
						data[i].DownloadApps[j].PackageMode = data[i].PackageMode;
					}
				}
				childData.push(data[i].DownloadApps);
			}
		}
	}
	source =
		{
			datafields: [
				{ name: 'PackageId' },
				{ name: 'PackageName' },
				{ name: 'FileVersion' },
				{ name: 'Component' },
				{ name: 'IsEnableForAutomation' },
				{ name: 'AdditionalInfo' },
				{ name: 'PackageFileType' },
				{ name: 'PackageMode' }
			],
			root: "downloadBundles",
			datatype: "json",
			localdata: ParentData
		};
	var ParentAdapter = new $.jqx.dataAdapter(source);
	appDetails = childData;
	var nestedGrids = new Array();
	// create nested grid.
	var initrowdetails = function (index, parentElement, gridElement, record) {
		var id = record.uid.toString();
		var grid = $($(parentElement).children()[0]);

		nestedGrids[index] = grid;
		var appDetailsbyid = [];
		isBundle = false;
		for (var m = 0; m < appDetails.length; m++) {
			if (m == index && appDetails[m] && appDetails[m].length > 0) {
				for (var n = 0; n < appDetails[m].length; n++) {
					if (appDetails[m][n].PackageMode == AppConstants.get('2') || appDetails[m][n].PackageMode == AppConstants.get('3')) {
						isBundle = true;
					}
					appDetailsbyid.push(appDetails[m][n]);
				}
			}
		}
		childsource = {
			datafields: [
				{ name: 'BundleNameOnServer', type: 'string' },
				{ name: 'BundleVersionOnServer', type: 'string' },
				{ name: 'LocationOnServer', type: 'string' },
				{ name: 'BundleNameOnDevice', type: 'string' },
				{ name: 'BundleVersionOnDevice', type: 'string' },
				{ name: 'LocationOnDevice', type: 'string' },
				{ name: 'AppNameOnServer', type: 'string' },
				{ name: 'AppVersionOnServer', type: 'string' },
				{ name: 'AppNameOnDevice', type: 'string' },
				{ name: 'AppVersionOnDevice', type: 'string' },
				{ name: 'Component', type: 'string' },
				{ name: 'PackageMode', type: 'string' },
				{ name: 'SyncStatus', type: 'string' }
			],

			datatype: "json",
			localdata: appDetailsbyid
		}
		var nestedGridAdapter = new $.jqx.dataAdapter(childsource, { autoBind: true });

		var syncRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				value = childsource.localdata[row].SyncStatus;
				if (value == 'Sync') {
					return '<div style="color: green; margin-left: 50%; left: -15px; top: 7px; position: relative;"><span style="color: green;" title="Sync"><i class="icon-checkmark"></i></span></div>'
				} else {
					return '<div style="color: orange; margin-left: 50%; left: -15px; top: 7px; position: relative;"><span style="color: orange;" title="Not in Sync"><i class="icon-cross"></i></span></div>'
				}
			}
		}

		//for bundles
		var bundleNameServer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var uniqueDeviceId = koUtilUniqueDeviceId;
				var type = 'Server';
				var valueData = childsource.localdata[row].BundleNameOnServer;
				var childGid = this.owner.element.id;
				if (childsource.localdata[row].Component == "Device")
					return '<div style="padding-top:6px"><a><span style="text-decoration:underline;padding-left:15px;text-overflow:ellipsis;" title="Click to view Application" onClick= devProfBundle(' + row + ',"' + type + '","Bundle","' + childGid + '","' + uniqueDeviceId + '") >' + valueData + '</span></a></div>';
				else
					return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>';
			}
		}

		var bundleVersionServer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].BundleVersionOnServer;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>';
			}
		}

		var LocationOnServer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].LocationOnServer;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>';
			}
		}

		var bundleNameDevice = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var uniqueDeviceId = koUtilUniqueDeviceId;
				var type = 'Device';
				var childGid = this.owner.element.id;
				var valueData = childsource.localdata[row].BundleNameOnDevice;
				if (childsource.localdata[row].Component == "Device")
					return '<div style="padding-top:6px"><a><span style="text-decoration:underline;padding-left:15px;text-overflow:ellipsis;"title="Click to view Application" onClick= devProfBundle(' + row + ',"' + type + '","Bundle","' + childGid + '","' + uniqueDeviceId + '") >' + valueData + '</span></a></div>';
				else
					return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>';
			}
		}

		var bundleVersionDevice = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].BundleVersionOnDevice;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>'
			}
		}
		var LocationOnDevice = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].LocationOnDevice;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>';
			}
		}
		//for applications
		var appNameServer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].AppNameOnServer;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>';
			}
		}

		var appVersionServer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].AppVersionOnServer;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>';
			}
		}

		var appNameDevice = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].AppNameOnDevice;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>';
			}
		}

		var appVersionDevice = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].AppVersionOnDevice;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>'
			}
		}

		var bundleColumns = [
			{
				text: i18n.t('status', { lng: lang }), cellsalign: 'center', align: 'center', sortable: false, filterable: false, editable: false, menu: false, datafield: 'SyncStatus', minwidth: 60, width: 60, cellsrenderer: syncRenderer
			},
			{
				text: i18n.t('bundle_name', { lng: lang }), columngroup: 'onServer', cellsalign: 'center', align: 'center', menu: false, sortable: false, editable: false, filterable: false,
				datafield: 'BundleNameOnServer', minwidth: 100, width: 'auto', cellsrenderer: bundleNameServer
			},
			{
				text: i18n.t('Bundle_Version', { lng: lang }), columngroup: 'onServer', datafield: 'BundleVersionOnServer', editable: false, menu: false, cellsalign: 'center', align: 'center',
				sortable: false, filterable: false, minwidth: 100, width: 'auto', cellsrenderer: bundleVersionServer
			},
			{
				text: i18n.t('bundle_location', { lng: lang }), columngroup: 'onServer', datafield: 'LocationOnServer', editable: false, menu: false, cellsalign: 'center', align: 'center',
				sortable: false, filterable: false, minwidth: 100, width: 'auto', cellsrenderer: LocationOnServer
			},
			{
				text: i18n.t('bundle_name', { lng: lang }), columngroup: 'onDevice', datafield: 'BundleNameOnDevice', editable: false, menu: false, cellsalign: 'center', align: 'center', sortable: false,
				filterable: false, minwidth: 100, width: 'auto', cellsrenderer: bundleNameDevice
			},
			{
				text: i18n.t('Bundle_Version', { lng: lang }), columngroup: 'onDevice', cellsalign: 'center', editable: false, menu: false, align: 'center', sortable: false, filterable: false,
				datafield: 'BundleVersionOnDevice', minwidth: 100, width: 'auto', cellsrenderer: bundleVersionDevice
			},
			{
				text: i18n.t('bundle_location', { lng: lang }), columngroup: 'onDevice', datafield: 'LocationOnDevice', editable: false, menu: false, cellsalign: 'center', align: 'center',
				sortable: false, filterable: false, minwidth: 100, width: 'auto', cellsrenderer: LocationOnDevice
			}
		]

		var applicationColumns = [
			{
				text: i18n.t('status', { lng: lang }), cellsalign: 'center', align: 'center', sortable: false, filterable: false, editable: false, menu: false, datafield: 'SyncStatus', minwidth: 60, width: 60, cellsrenderer: syncRenderer
			},
			{
				text: i18n.t('application_name', { lng: lang }), columngroup: 'onServer', cellsalign: 'center', align: 'center', menu: false, sortable: false, editable: false, filterable: false,
				datafield: 'AppNameOnServer', minwidth: 100, width: 'auto', cellsrenderer: appNameServer
			},
			{
				text: i18n.t('application_version', { lng: lang }), columngroup: 'onServer', datafield: 'AppVersionOnServer', editable: false, menu: false, cellsalign: 'center', align: 'center',
				sortable: false, filterable: false, minwidth: 100, width: 'auto', cellsrenderer: appVersionServer
			},
			{
				text: i18n.t('application_location', { lng: lang }), columngroup: 'onServer', datafield: 'LocationOnServer', editable: false, menu: false, cellsalign: 'center', align: 'center',
				sortable: false, filterable: false, minwidth: 100, width: 'auto', cellsrenderer: LocationOnServer
			},
			{
				text: i18n.t('application_name', { lng: lang }), columngroup: 'onDevice', datafield: 'AppNameOnDevice', editable: false, menu: false, cellsalign: 'center', align: 'center', sortable: false,
				filterable: false, minwidth: 100, width: 'auto', cellsrenderer: appNameDevice
			},
			{
				text: i18n.t('application_version', { lng: lang }), columngroup: 'onDevice', cellsalign: 'center', editable: false, menu: false, align: 'center', sortable: false, filterable: false,
				datafield: 'AppVersionOnDevice', minwidth: 100, width: 'auto', cellsrenderer: appVersionDevice
			},
			{
				text: i18n.t('application_location', { lng: lang }), columngroup: 'onDevice', datafield: 'LocationOnDevice', editable: false, menu: false, cellsalign: 'center', align: 'center',
				sortable: false, filterable: false, minwidth: 100, width: 'auto', cellsrenderer: LocationOnDevice
			}
		]

		if (grid != null) {

			grid.jqxGrid({
                source: childsource, width: "81%", selectionmode: 'none', theme: AppConstants.get('JQX-GRID-THEME'), height: 150, sortable: true, filterable: true, autoshowcolumnsmenubutton: false, showsortmenuitems: false, columnsResize: true, columnsreorder: false,
				columns: isBundle ? bundleColumns : applicationColumns,
				columngroups:
					[
						{ text: 'On Server', align: 'center', name: 'onServer' },
						{ text: 'On Device', align: 'center', name: 'onDevice' }
					]
			});
		}
	}

	//Custom filter
	var buildFilterPanel = function (filterPanel, datafield) {
		genericBuildFilterPanel(filterPanel, datafield, source, gID);
	}

	if ($("#" + gID) != null && $("#" + gID).length != null && $("#" + gID).length > 0) {
		// create tooltip.
		$("#" + gID).jqxTooltip();
		// create jqxgrid
		$("#" + gID).jqxGrid(
			{
				width: "99%",
				source: source,
				rowdetails: true,
				editable: true,
				columnsResize: true,
				columnsreorder: false,
                selectionmode: 'none',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				autosavestate: false,
				sortable: true,
				initrowdetails: initrowdetails,
				rowdetailstemplate: { rowdetails: "<div id='grid' style='margin:0px 0px 0px 18%'></div>", rowdetailsheight: 160, rowdetailshidden: true },
				ready: function () {
					//$("#" + gID).jqxGrid('showrowdetails', 0);                         
					$("#" + gID).jqxGrid('editable', isAutoDownloadStatus);
					var gridheight = $(window).height();
					gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 50;
					if (gridheight < 300)
						gridheight = 562;
					$("#" + gID).jqxGrid({ height: gridheight });
				},
				// trigger cell hover.
				cellhover: function (element, pageX, pageY) {
					// update tooltip.
					$("#" + gID).jqxTooltip('destroy');
					var cell = $("#" + gID).jqxGrid('getcellatposition', pageX, pageY);
					if (cell.column == 'IsEnableForAutomation') {
						var row = cell.row;
						var data = $("#" + gID).jqxGrid('getrowdata', row);
						var tooltipContent = '';
						if (data != undefined && data.AdditionalInfo != '') {
							tooltipContent = data.AdditionalInfo;
						}
						if (tooltipContent) {
							$("#" + gID).jqxTooltip({ content: tooltipContent, position: 'bottom' });
							// open tooltip.
							$("#" + gID).jqxTooltip('open', pageX + 15, pageY + 15);
						} else {
							$("#" + gID).jqxTooltip('destroy');
						}
					} else {
						$("#" + gID).jqxTooltip('destroy');
					}
				},
				columns: [
					{
						text: i18n.t('PackageName', { lng: lang }), cellsalign: 'left', align: 'left', sortable: false, filterable: false, menu: false, datafield: 'PackageName', minwidth: '18%', width: '18%', editable: false,
					},
					{
						text: i18n.t('package_version', { lng: lang }), cellsalign: 'left', align: 'left', sortable: false, filterable: false, menu: false, datafield: 'FileVersion', minwidth: 130, width: 'auto', editable: false,
					},
					{
						text: i18n.t('component', { lng: lang }), cellsalign: 'left', align: 'left', sortable: false, filterable: false, editable: false, menu: false, datafield: 'Component', minwidth: 130, width: 'auto',
					},
					{
						text: i18n.t('app_library_download_auto', { lng: lang }), datafield: 'IsEnableForAutomation', columntype: 'checkbox', width: 180, menu: false, cellsalign: 'left', align: 'center'
					}
				]
			});
		$("#" + gID).on("bindingcomplete", function (event) {
			//  $("#" + gID).jqxGrid('showrowdetails', rowOfDownloadAutomation);

		});
		$("#" + gID).bind('cellendedit', function (event) {
			rowOfDownloadAutomation = event.args.rowindex;
			datafieldOfDownloadAutomation = event.args.datafield;
            oldvalueOfDownloadAutomation = event.args.oldvalue;            
			var status;
			if (event.args.value == false) {
				isEnableForAutomation = false;
				status = " disable Download Automation ?";
			}
			else {
				isEnableForAutomation = true;
				status = " enable Download Automation ?";
			}

			PopupRow = rowOfDownloadAutomation;
			var msg = i18n.t('enable_disable_download_automation', { lng: lang });
			$("#confirmation").text(msg + status);
			$("#IsEnableConfirmMsg").modal('show');

		});
		$(".sortdesc").css('height', '30px');
		$(".sortasc").css('height', '30px');

		//jqx-widget-header 
		if (gID == "datagridDownloadAutomationGridDiv") {
			$(".jqx-widget-header").removeClass('jqx-grid-header');
			$("#contenttable" + gID).parent('div').css({ 'z-index': 1 });
		}
		else
			$("#columntable" + gID).parent('div').removeClass('jqx-grid-header');
	}

}

function NestedPackageFileStatusGrid(gID, data, model) {
	ParentData = data;
	if (data) {
		var childDataFileStatus = new Array();
		for (var i = 0; i < data.length; i++) {
			if (!_.isEmpty(data[i].Files)) {
				for (var j = 0; j < data[i].Files.length; j++) {
					if (!_.isEmpty(data[i].Files[j])) {
						data[i].Files[j].ParentIndex = i;
						childDataFileStatus.push(data[i].Files[j]);
					}
				}
			}
		}
	}
	source =
		{
			datafields: [
				{ name: 'PackageId' },
				{ name: 'PackageName' },
				{ name: 'PackageVersion' },
				{ name: 'Component' },
				{ name: 'IsEnableForAutomation' }
			],
			root: "PackageFiles",
			datatype: "json",
			localdata: ParentData
		};
	var ParentAdapter = new $.jqx.dataAdapter(source);
	appDetailsFileStatus = childDataFileStatus;
	var nestedGrids = new Array();
	// create nested grid.
	var initrowdetails = function (index, parentElement, gridElement, record) {
		var id = record.uid.toString();
		var grid = $($(parentElement).children()[0]);

		nestedGrids[index] = grid;
		var appDetailsbyid = [];
		if (appDetailsFileStatus && appDetailsFileStatus.length > 0) {
			for (var m = 0; m < appDetailsFileStatus.length; m++) {
				if (index == appDetailsFileStatus[m].ParentIndex) {
					appDetailsbyid.push(appDetailsFileStatus[m]);
				}
			}
		}

		childsource = {
			datafields: [
				{ name: 'ApplicationName' },
				{ name: 'ApplicationVersion' },
				{ name: 'FileId', type: 'string' },
				{ name: 'Purpose', type: 'string' },
				{ name: 'FileName', type: 'string' },
				{ name: 'SyncStatus', type: 'string' }
			],

			datatype: "json",
			localdata: appDetailsbyid
		}
		var nestedGridAdapter = new $.jqx.dataAdapter(childsource, { autoBind: true });

		var buildFilterPanelNestedGrid = function (filterPanel, datafield) {
			wildfilterForApplicationView(filterPanel, datafield, nestedGridAdapter, grid);
		}

		var applicationNameRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].ApplicationName;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>';
			}
		}

		var applicationVerisonRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].ApplicationVersion;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>';
			}
		}

		var fileIdRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].FileId;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>';
			}
		}

		var purposeRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].Purpose;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>';
			}
		}

		var fileNameRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				var valueData = childsource.localdata[row].FileName;
				return '<div style="padding-top:6px"><span style="padding-left:15px;text-overflow:ellipsis;">' + valueData + '</span></div>'
			}
		}

		var syncRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (childsource.localdata[row]) {
				value = childsource.localdata[row].SyncStatus;
				if (value == 'Sync') {
					return '<div style="color: green; margin-left: 50%; left: -15px; top: 7px; position: relative;"><span style="color: green;" title="Sync"><i class="icon-checkmark"></i></span></div>'
				} else {
					return '<div style="color: orange; margin-left: 50%; left: -15px; top: 7px; position: relative;"><span style="color: orange;" title="Not in Sync"><i class="icon-cross"></i></span></div>'
				}
			}
		}

		var applicationColumns = [
			{
				text: i18n.t('Application Name', { lng: lang }), datafield: 'ApplicationName', editable: false, sortable: true, filterable: false, menu: false,
				minwidth: 100, width: 'auto',
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelNestedGrid(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('application_version', { lng: lang }), datafield: 'ApplicationVersion', editable: false, sortable: true, filterable: false, menu: false,
				minwidth: 60, width: 'auto',
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelNestedGrid(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('File Id', { lng: lang }), datafield: 'FileId', editable: false, sortable: true, filterable: false, menu: false,
				minwidth: 80, width: 'auto',
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelNestedGrid(filterPanel, datafield);
				}
			},
			{
				text: i18n.t('File Name', { lng: lang }), datafield: 'FileName', editable: false, sortable: true, filterable: false, menu: false,
				minwidth: 100, width: 'auto',
				filtertype: "custom",
				createfilterpanel: function (datafield, filterPanel) {
					buildFilterPanelNestedGrid(filterPanel, datafield);
				}
			},
			//{
			//	text: i18n.t('Purpose', { lng: lang }), datafield: 'Purpose', editable: false, sortable: true, filterable: false, menu: false,
			//	minwidth: 100, width: 'auto', cellsrenderer: purposeRenderer,
			//	filtertype: "custom",
			//	createfilterpanel: function (datafield, filterPanel) {
			//		buildFilterPanelNestedGrid(filterPanel, datafield);
			//	}
			//},
			{
				text: i18n.t('status', { lng: lang }), datafield: 'SyncStatus', sortable: false, filterable: false, editable: false, menu: false,
				minwidth: 80, width: 60, cellsrenderer: syncRenderer
			}
		]

		if (grid != null) {

			grid.jqxGrid({
                source: childsource, width: "81%", selectionmode: 'none', theme: AppConstants.get('JQX-GRID-THEME'),height: 150, sortable: true, filterable: true, autoshowcolumnsmenubutton: false, showsortmenuitems: false, columnsResize: true, columnsreorder: false,
				columns: applicationColumns
			});
		}
	}

	if ($("#" + gID) != null && $("#" + gID).length != null && $("#" + gID).length > 0) {
		// create tooltip.
		$("#" + gID).jqxTooltip();

		var automationRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
			if (value == true) {
				return '<div style="margin-left: 10px; margin-top: 5px;">Yes</div>';
			} else {
				return '<div style="margin-left: 10px; margin-top: 5px;">No</div>';
			}
		}
		// create jqxgrid
		$("#" + gID).jqxGrid(
			{
				width: "99%",
				source: source,
				rowdetails: true,
				editable: true,
				columnsResize: true,
				columnsreorder: false,
                selectionmode: 'none',
                theme: AppConstants.get('JQX-GRID-THEME'),
				autoshowcolumnsmenubutton: false,
				autosavestate: false,
				sortable: true,
				initrowdetails: initrowdetails,
				rowdetailstemplate: { rowdetails: "<div id='grid' style='margin:0px 0px 0px 18%'></div>", rowdetailsheight: 160, rowdetailshidden: true },
				ready: function () {
					//$("#" + gID).jqxGrid('showrowdetails', 0);                         
					$("#" + gID).jqxGrid('editable', isAutoDownloadStatus);
					var gridheight = $(window).height();
					gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 50;
					if (gridheight < 300)
						gridheight = 562;
					$("#" + gID).jqxGrid({ height: gridheight });
				},

				columns: [
					{
						text: i18n.t('PackageName', { lng: lang }), cellsalign: 'left', align: 'left', sortable: false, filterable: false, menu: false, datafield: 'PackageName', minwidth: '18%', width: '18%', editable: false
					},
					{
						text: i18n.t('package_version', { lng: lang }), cellsalign: 'left', align: 'left', sortable: false, filterable: false, menu: false, datafield: 'PackageVersion', minwidth: 130, width: 'auto', editable: false
					},
					{
						text: i18n.t('component', { lng: lang }), cellsalign: 'left', align: 'left', sortable: false, filterable: false, editable: false, menu: false, datafield: 'Component', minwidth: 130, width: 'auto'
					},
					{
						text: i18n.t('app_library_download_auto', { lng: lang }), datafield: 'IsEnableForAutomation', width: 180, menu: false, cellsalign: 'left', align: 'center', cellsrenderer: automationRenderer
					}
				]
			});
		$("#" + gID).on("bindingcomplete", function (event) {
			//$("#" + gID).jqxGrid('showrowdetails', rowOfDownloadAutomation);

		});
		$(".sortdesc").css('height', '30px');
		$(".sortasc").css('height', '30px');

		$(".jqx-widget-header").removeClass('jqx-grid-header');
		$("#contenttable" + gID).parent('div').css({ 'z-index': 1 });
	}

}

function devProfBundle(row, type, packageType, gID, uniqueDeviceId) {

	if (packageType == 'Bundle') {
		if (type == 'Device') {
			var BundleNameOnDevice = $("#" + gID).jqxGrid('getcellvalue', row, 'BundleNameOnDevice');
			var BundleVersionOnDevice = $("#" + gID).jqxGrid('getcellvalue', row, 'BundleVersionOnDevice');

			softwareStatusCallForAppBundleReq(BundleNameOnDevice, BundleVersionOnDevice, type, uniqueDeviceId)
		}
		if (type == 'Server') {
			var BundleNameOnServer = $("#" + gID).jqxGrid('getcellvalue', row, 'BundleNameOnServer');
			var BundleVersionOnServer = $("#" + gID).jqxGrid('getcellvalue', row, 'BundleVersionOnServer');

			softwareStatusCallForAppBundleReq(BundleNameOnServer, BundleVersionOnServer, type, uniqueDeviceId)
		}
	}

}


function softwareStatusCallForAppBundleReq(bundleName, bundleVersion, type, uniqueDeviceId) {

	var getApplicationsForBundleReq = new Object();
	getApplicationsForBundleReq.BundleName = bundleName;
	getApplicationsForBundleReq.BundleVersion = bundleVersion;
	getApplicationsForBundleReq.Type = type;
	getApplicationsForBundleReq.UniqueDeviceId = uniqueDeviceId;

	function callbackFunction(data, error) {

		if (data) {

			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

				if (data && data.getApplicationsForBundleResp) {
					data.getApplicationsForBundleResp = $.parseJSON(data.getApplicationsForBundleResp);
				}

				if (data.getApplicationsForBundleResp) {
					if (data.getApplicationsForBundleResp) {
						$("#profilDeviceDetailApplicationView").modal('show');
						$("#devProfSofStatViewModelHead").text(bundleName);
						jqxgridDeviceProfDetailSoftStatusView(data.getApplicationsForBundleResp.Applications, 'jqxDevProfDetailBundle')

					}
				}
			}
		}
	}

	var method = 'GetApplicationsForBundle';
	var params = '{"token":"' + TOKEN() + '","getApplicationsForBundleReq":' + JSON.stringify(getApplicationsForBundleReq) + '}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

function jqxgridDeviceProfDetailSoftStatusView(deviceProfileDetailSoftStatusviewData, gID) {

	// prepare the data
	var source =
	{
		datatype: "json",
		localdata: deviceProfileDetailSoftStatusviewData,
		datafields: [
			{ name: 'ApplicationName', map: 'ApplicationName', type: 'string' },
			{ name: 'ApplicationVersion', map: 'ApplicationVersion', type: 'string' }
		],

		contentType: 'application/json'
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
			columnsResize: true,
			columnsreorder: false,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
			autoshowcolumnsmenubutton: false,
			showsortmenuitems: false,
			enabletooltips: true,
			rowsheight: 32,
			altrows: true,

			columns: [

				{
					text: i18n.t('app_name', { lng: lang }), datafield: 'ApplicationName', minwidth: 300,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}

				},
				{
					text: i18n.t('app_version', { lng: lang }), datafield: 'ApplicationVersion', minwidth: 300,
					filtertype: "custom",
					createfilterpanel: function (datafield, filterPanel) {
						buildFilterPanel(filterPanel, datafield);
					}
				}
			]
		})

}


function openIconPopupApplicationDetails(appName, appId) {
	GetApplicationDownloadDetails(appName, appId);
}

function GetApplicationDownloadDetails(appName, appId) {

	var getApplicationDownloadDetailsReq = new Object();
	getApplicationDownloadDetailsReq.ApplicationId = appId;
	getApplicationDownloadDetailsReq.UniqueDeviceId = koUtilUniqueDeviceId;

	function callbackFunction(data, error) {

		if (data) {
			applicationDetailsArray = [];
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

				if (data && data.getApplicationDownloadDetailsResp) {
					data.getApplicationDownloadDetailsResp = $.parseJSON(data.getApplicationDownloadDetailsResp);
				}

				if (data.getApplicationDownloadDetailsResp) {
					//applicationDetailsArray = data.getApplicationDownloadDetailsResp;
					var applicationDetailData = new Object();//
					applicationDetailData.FieldName = i18n.t('last_full_download', { lng: lang });
					applicationDetailData.FieldValue = jsonLocalDateConversion(data.getApplicationDownloadDetailsResp.Lastfulldldon, 'DD/MMM/YYYY hh:mm:ss A');
					applicationDetailsArray.push(applicationDetailData);

					var applicationDetailData = new Object();//
					applicationDetailData.FieldName = i18n.t('last_partial_download', { lng: lang });
					applicationDetailData.FieldValue = jsonLocalDateConversion(data.getApplicationDownloadDetailsResp.Lastpartialdldon, 'DD/MMM/YYYY hh:mm:ss A');
					applicationDetailsArray.push(applicationDetailData);

					var applicationDetailData = new Object();//
					applicationDetailData.FieldName = i18n.t('status_of_last_attempted_download', { lng: lang });
					applicationDetailData.FieldValue = data.getApplicationDownloadDetailsResp.Lastdldstatus;
					applicationDetailsArray.push(applicationDetailData);

					var applicationDetailData = new Object();//
					applicationDetailData.FieldName = i18n.t('date_time_of_last_attempted_download', { lng: lang });
					applicationDetailData.FieldValue = jsonLocalDateConversion(data.getApplicationDownloadDetailsResp.Lastattempteddldon, 'DD/MMM/YYYY hh:mm:ss A');
					applicationDetailsArray.push(applicationDetailData);

					var applicationDetailData = new Object();//
					applicationDetailData.FieldName = i18n.t('last_file_download_date', { lng: lang });
					applicationDetailData.FieldValue = jsonLocalDateConversion(data.getApplicationDownloadDetailsResp.Lastfiledldon, 'DD/MMM/YYYY hh:mm:ss A');
					applicationDetailsArray.push(applicationDetailData);

					var applicationDetailData = new Object();//
					applicationDetailData.FieldName = i18n.t('last_parameter_download_date', { lng: lang });
					applicationDetailData.FieldValue = jsonLocalDateConversion(data.getApplicationDownloadDetailsResp.Lastparamdldon, 'DD/MMM/YYYY hh:mm:ss A');
					applicationDetailsArray.push(applicationDetailData);

					var applicationDetailData = new Object();//
					applicationDetailData.FieldName = i18n.t('last_parameter_modify_date', { lng: lang });
					applicationDetailData.FieldValue = jsonLocalDateConversion(data.getApplicationDownloadDetailsResp.Lastparamtemplatemodifiedon, 'DD/MMM/YYYY hh:mm:ss A');
					applicationDetailsArray.push(applicationDetailData);

					var applicationDetailData = new Object();//
					applicationDetailData.FieldName = i18n.t('date_time_of_last_update_check', { lng: lang });
					applicationDetailData.FieldValue = jsonLocalDateConversion(data.getApplicationDownloadDetailsResp.Lastcheckupdaterecieved, 'DD/MMM/YYYY hh:mm:ss A');
					applicationDetailsArray.push(applicationDetailData);

					var applicationDetailData = new Object();//
					applicationDetailData.FieldName = i18n.t('status_of_last_update_check', { lng: lang });
					applicationDetailData.FieldValue = data.getApplicationDownloadDetailsResp.Lastcheckupdatestatus;
					applicationDetailsArray.push(applicationDetailData);
				}
				$("#applicationDetails").modal('show');
				applicationDetailsGrid('jqxgridApplicationDetails', applicationDetailsArray);
				$("#applicationDetailsHeaderText").text(i18n.t('applications_details_of_appname', { AppName: appName }, { lng: lang }));
			}
		}
	}

	var method = 'GetApplicationDownloadDetails';
	var params = '{"token":"' + TOKEN() + '","getApplicationDownloadDetailsReq":' + JSON.stringify(getApplicationDownloadDetailsReq) + '}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}

function applicationDetailsGrid(gID, data) {

	var source =
	{
		dataType: "json",
		dataFields: [

			{ name: 'FieldName', map: 'FieldName' },
			{ name: 'FieldValue', map: 'FieldValue' }

		],
		localData: data,
		contentType: 'application/json'
	};

	var showValue = function (row, datafield, value) {
		fieldValue = $("#" + gID).jqxGrid('getcellvalue', row, 'FieldValue');
		fieldName = $("#" + gID).jqxGrid('getcellvalue', row, 'FieldName');
		//if (fieldValue == true && fieldName == "Device Management") {
		//    return '<div  style="height:100px;cursor:pointer;padding-left:7px;margin-top: 21px">Yes</div>';
		//} else if (fieldValue == true && fieldName == "Device Diagnostics") {
		//    return '<div  style="height:100px;cursor:pointer;padding-left:7px;margin-top: 21px">Yes</div>';
		//} else if (fieldValue == true && fieldName == "Content Management") {
		//    return '<div  style="height:100px;cursor:pointer;padding-left:7px;margin-top: 21px">Yes</div>';
		//} else if (fieldName == "Number Of Devices") {
		//    return '<div  style="height:100px;cursor:pointer;padding-left:7px;">' + fieldValue + '</div>';
		//}
		//else if (fieldName == "Validity") {
		//    return '<div  style="height:100px;cursor:pointer;padding-left:7px;margin-top: 21px">' + fieldValue + '</div>';
		//}
	}

	var dataAdapter = new $.jqx.dataAdapter(source);

	$("#" + gID).jqxGrid(
		{
			width: "100%",
			source: dataAdapter,
			altRows: true,
			sortable: true,
			columnsResize: false,
			columnsreorder: false,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
			autoshowcolumnsmenubutton: false,
			showsortmenuitems: false,
			rowsheight: 30,
			enabletooltips: false,
			showheader: false,
			autoshowfiltericon: true,

			columns: [
				{
					dataField: 'FieldName', editable: false, minwidth: 350, width: 350, filterable: false, menu: false
				},
				{
					dataField: 'FieldValue', editable: false, width: 250, filterable: false, menu: false, cellsrenderer: showValue
				}
			]
		});
}

function refreshKeysInDevice(row) {
	var rowData = $("#installedkeysGridDiv").jqxGrid('getrowdata', row);
	var keyHandleId = (rowData && rowData.KeyHandleId) ? rowData.KeyHandleId : 0;

	function callbackFunction(data, error) {
		if (data) {
			if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
				var config = {};
				config.toasterType = "wait"
				config.message = "Refreshing Keys in device";
				config.title = "Refresh Keys...";
				config.timeOut = 2000;
				config.showClose = true;
				config.clickToClose = true;
				displayToaster(toaster, config);
			}
			gridRefresh("installedkeysGridDiv");
		}
	}
	var method = 'RefreshKeyDownload';
	var params = '{"token":"' + TOKEN() + '","uniqueDeviceId":' + koUtilUniqueDeviceId + ',"keyHandleId":' + keyHandleId + '}';
	ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
}