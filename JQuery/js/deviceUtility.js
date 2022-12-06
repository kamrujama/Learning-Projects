function openPopup(popupName, ko, koUtil, self) {
	self.isModelHierarchyPopup(false);
	self.isModelPopup(false);
	$('#deviceProfileModel').modal('show');
	self.observableModelPopupHierarchy('unloadTemplate');
	self.observableModelPopup('unloadTemplate');
	if (popupName === "modelSoftwareAssignment") {
		self.isModelPopup(true);
		$('#modePopupDiv').removeClass('hide');
		$('#hierarchyPopupDiv').addClass('hide');
		isFromAddDevice = false;
		loadelementModelPopUp('modelSoftwareAssignment', 'device', ko, self);
	} else if (popupName === "modelAddGroupAssignment") {
		self.isModelPopup(true);
		$('#modePopupDiv').removeClass('hide');
		$('#hierarchyPopupDiv').addClass('hide');
		loadelementModelPopUp(popupName, 'device', ko, self);
	} else if (popupName === "modalHierarchyDeviceProfile") {
		$('#hierarchyPopupDiv').removeClass('hide');
		$('#modePopupDiv').addClass('hide');
		self.isModelHierarchyPopup(true);
		loadelementModelPopUp(popupName, 'genericPopup', ko, self);
	} else if (popupName === "modelDeviceProfileEditTemplate") {
		koUtil.viewParameterTemplateOnDevice = false;
		self.isModelPopup(true);
		$('#modePopupDiv').removeClass('hide');
		$('#hierarchyPopupDiv').addClass('hide');
		loadelementModelPopUp(popupName, 'device/deviceProfileTemplates', ko, self);
	} else if (popupName === "modelDeviceProfileParameterAssignment") {
		self.isModelPopup(true);
		$('#modePopupDiv').removeClass('hide');
		$('#hierarchyPopupDiv').addClass('hide');
		loadelementModelPopUp(popupName, 'device/deviceProfileTemplates', ko, self);
	} else if (popupName === "modalCloneDevice") {
		self.isModelPopup(true);
		$('#modePopupDiv').removeClass('hide');
		$('#hierarchyPopupDiv').addClass('hide');
		loadelementModelPopUp(popupName, 'device', ko, self);
	}
}

function loadelementModelPopUp(elementname, controllerId, ko, self) {
	if (elementname !== '') {
		if (!ko.components.isRegistered(elementname)) {
			generateTemplate(elementname, controllerId, ko);
		}		
		var comp = {};
		comp.name = elementname;
		comp.params = {};		
		if (elementname === 'modalHierarchyDeviceProfile') {
			self.observableModelPopupHierarchy(comp);
		} else {
			self.observableModelPopup(comp);
		}
	}
}

function generateTemplate(tempname, controlerId, ko) {
    var htmlName = '../template/' + controlerId + '/' + tempname + '.html';
    var ViewName = 'controller/' + controlerId + '/' + tempname + '.js';
    ko.components.register(tempname, {
        viewModel: { require: ViewName },
        template: { require: 'plugin/text!' + htmlName }
    });
}

function setDeviceLiteObject(data, koUtil) {
	koUtil.DeviceProfileLite.UniqueDeviceId = data.deviceUid;
	koUtil.deviceProfileUniqueDeviceId = data.deviceUid;

	koUtil.isDeviceProfile(true);
	koUtil.serialNumber = data.serialNumber;
	koUtil.deviceId = data.deviceId;
    koUtil.ModelName = !_.isEmpty(data.model) ? data.model.ModelName : '';
    koUtil.ModelId = !_.isEmpty(data.model) ? data.model.ModelId : 0;
	koUtil.deviceFamily = !_.isEmpty(data.model) ? data.model.Family : '';	
	koUtil.Protocol = data.protocol;
	koUtil.deviceHierarchy(data.hierarchy.HierarchyFullPath);
	koUtil.deviceProfileXSDVersion(data.protocolVersion);
	
	//Edit Groups
	if(!_.isEmpty(data.groups)){
		koUtil.deviceProfileGroup = data.groups;
	}
	//View Parameter Template on Device
	koUtil.deviceEditTemplate.ApplicationId = data.applicationId;
	koUtil.deviceEditTemplate.ApplicationName = data.applicationName;
	koUtil.deviceEditTemplate.ApplicationVersion = data.applicationVersion;
	koUtil.deviceEditTemplate.IsMultiVPFXSupported = data.isMultiVPFXSupported;
	//Edit Parameter on Device
	koUtil.getEditDeviceProfile.ApplicationId = data.applicationId;
	koUtil.getEditDeviceProfile.ApplicationName = data.applicationName;
	koUtil.getEditDeviceProfile.ApplicationVersion = data.applicationVersion;
	koUtil.getEditDeviceProfile.IsMultiVPFXSupported = data.isMultiVPFXSupported;

	koUtilModel = koUtil.ModelName;
	koUtilFamily = koUtil.deviceFamily;
	koUtilProtocol = koUtil.Protocol;

	deviceLiteData = new Object();
	deviceLiteData.UniqueDeviceId = data.deviceUid;
	deviceLiteData.Source = 'deviceProfile';
}

function closePopup(self) {
	deviceLiteData = new Object();
	self.observableModelPopupHierarchy('unloadTemplate');
	self.observableModelPopup('unloadTemplate');
	$('#deviceProfileModel').modal('hide');
}

function refreshDeviceProfileLitePage(refreshType) {
    window.sessionStorage.setItem(refreshType, '1');
}

function navigateToLocation(id, ko, koUtil, self) {
	//reinitialize global variables for schedule screens
	isSearchReset = false;
	isFromDeviceSearch = false;
	isAdvancedSavedSearchApplied = false;
	isFromDownloadLibrary = false;
	isFromContentLibrary = false;

	if (id === 'troubleShoot') {
		globalDeviceDataForGetLogs = new Object();
		if (koUtil.serialNumber !== '' && koUtil.serialNumber !== 'N/A' && koUtil.serialNumber !== null) {
			globalDeviceDataForGetLogs.serialNumber = koUtil.serialNumber;
		}
		if (koUtil.deviceId !== '' && koUtil.deviceId !== 'N/A' && koUtil.deviceId !== null) {
			globalDeviceDataForGetLogs.DeviceId = koUtil.deviceId;
		}
	}

	redirectToLocation(menuJsonData, id);
}

function idleLogout(type, ko, koUtil, self, sess_warningMinutes) {
	initSession(sess_warningMinutes);
}