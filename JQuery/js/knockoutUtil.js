define(["knockout"], function (ko) {



    function globalViewModal() {

        var self = this;
        self.name = '';
        self.reportId = 0;
        self.reportName = '';
        self.reportData = '';
        self.reportDefinationxml = '';
        self.SelectedChildReportId = '';
        self.SelectedChildGridParam = '';
        self.SelectedReportMongoEnabled = '';

        //for edit subscription list
        self.editFlag = 0;
        self.SubscriptionSelectedata = '';
        //
        self.categoryName = '';
        self.deviceNameForAddDevice = new Array();


        //for application screen

        self.applicationId = 0;
        self.addOrEditTemplate = 0;
        self.templateDataById = '';
        self.selectedTemplateId = 0;
        self.selectedTemplateName = '';
        self.selectedTemplateDescription = '';
        self.dataForCancelCheckInappliCation = '';
        self.vpfPDXUploadedDataArr = ko.observableArray();       

        //For Add device
        self.hierarchyIdForAddDevice = 0;
        self.hierarchyNameForUser = '';
        self.movedPackageArray = new Array();
        self.movedApplicationArray = new Array();
        self.hierarchiesForAdd = ko.observableArray();

        //For schedule screen
        self.isFromScheduleScreen = 0;
        self.isInitialCall = 0;
        self.isFromScheduleDownloadsScreen = 0;
        self.isFromScheduleActionScreen = 0;
        self.isAdvancedSearch = 0;
        self.jobNameVal = '';
        self.jobNameValAction = '';
        self.jobNameValContent = '';

        //for deviceprofile
        self.deviceProfileUniqueDeviceId = 0;
        self.devicetemplateXML = ko.observableArray();
		self.deviceProfileData = ko.observableArray();
		self.deviceProfileCertificatesData = ko.observableArray();
		self.deviceProfileKeyInventoryData = ko.observableArray();
        self.isDeviceProfile = ko.observable(false);
        self.deviceHierarchy = ko.observable('');
        self.deviceEditTemplate = ko.observableArray();
        self.deviceViewParameterTemplate = ko.observableArray();
		self.getEditDeviceProfile = ko.observableArray();
		self.selectedFormFile = ko.observable('');
        self.editDevicetemplateXML = ko.observableArray();
        self.editGlobalDevicetemplateXML = ko.observableArray();        
        self.deviceSponsorName = ko.observable('');
        self.deviceProfileXSDVersion = ko.observable('');
        //self.isRefereshParamfordeviceProfile = ko.observable(false);
        self.isEditHierarchy = ko.observable(false);
        self.isActivationParamEnable = ko.observable(false);

        self.deviceOut = '';
        self.tabletProfileData = '';
        self.checkQuckDDL = 0;
        self.savedSearchId = 0;
        self.deviceFamily = '';
        self.ModelName = '';
        self.deviceId = 0;
        self.serialNumber = '';
        self.deviceProfileGroup = '';
        self.IsAutoDownloadEnabled = ko.observable(false);
        self.isFromDeviceProfile = ko.observable(false);
        self.isHierarchyModified = ko.observable(false);
        self.isAttributeModified = ko.observable(false);
        self.isSearchCancelled = ko.observable(false);
        self.isSearchAdmin = ko.observable(true);
        self.deviceProfileGroup = '';
        self.collapseExpandTooltip = 0;
        self.ReferenceSetName = '';
       
        //Hierarchy reference set screen
        self.availableArr = ko.observableArray();
        self.referenceSetArr = ko.observableArray();
        self.availableParameterTemplateArray = ko.observableArray();

        //Device Serach
        self.isDeviceSearchScreen = ko.observable();
        self.selectedInstanceLevelDetails = new Array();
        //application screen
        self.pdxExistFlag = 0;

        //for scheduling
        self.isQuickSearchApplied = 0;

        //SystemConfiguration
        self.sysClockFlag = '';
        //for user data
        self.UserData = ko.observable('');

        //for download libarary
        self.getModelsFamily = ko.observableArray();
        self.rowIdDownload = ko.observable();
        self.gridIdDownload = ko.observable();

        self.rowIdDownloadChild = ko.observable();
        self.gridIdDownloadChild = ko.observable();

        self.applicationIDAppChild = ko.observable();
        self.applicationNameAppChild = ko.observable();
        self.applicationVersionAppChild = ko.observable();
        self.isParentAppOrBundle = ko.observable();

        self.isDownloadlibAddpackage = ko.observable();
        self.addPackgeId = ko.observable();
        self.addPackgeMode = ko.observable();
        self.editPackageGid = ko.observable();
        self.editPackgeId = ko.observable();
        self.editPackgeMode = ko.observable();
        self.BundleState = 1;
        //content Library
        self.isThumbnailViewActive = 1;

        self.isNewJobCreated = 0;
        self.isNewJobCreatedForContent = 0;       

        //change password
        //self.isChangePasswordrequired = 0;

        //Hierarchies
        self.isAddHierarchyFlag = false;
        self.isEditHierarchyFlag = false;

        //Rights
        self.isAdministartionRole = 0;

        //Group establishment
        self.isGroupBtnEnabled = 0;

        //schedule
        self.isSelctedDevicesChanged = 0;
        self.movedArrayFlag = 0;
        self.availableArrayFlag = 0;

        //device search
        self.isFromDeviceSearch = false;

        self.isdeviceflag = 0;

        //For Device Profile -> Software Assignment
        self.IsSoftwareAssigned = false;
        self.IsDirectAssignment = false;
        self.globalSubStatus = '';
        self.globalSubStatusId = 0;
        //

        //Hierarchy Assignment
        self.downloadAutomationHierarchy = 0;
        self.downloadOnHierarchy = 0;

        //Device profile
        self.subStatusForDeviceProfile = '';
        self.isDeviceProfileScreen = ko.observable();
        self.isDeviceDetails = ko.observable();       
        self.AssignmentType = 'None';
        self.IsSoftwareAssigned = false;
        self.IsEnabledForAutoDownload = false;
        self.IsDirectReferenceSetAssigned = false;
        self.HierarchyId = 0;
        self.ModelId = 0;
        self.InternalModelName = '';
        self.viewParameterTemplateOnDevice = false;
      
        //Device search
        self.globalSubStatusForDeviceProfile = '';
        self.globalSubStatusIdForDeviceProfile;

        self.isCheckboxEnabled = '';
        self.IsCallbackImmediate = null;
        self.IsDldSingleSession = null;
		
        //Schedule
        self.hierarchyIdForScheule = ko.observable();       

        self.selectedValueSelectApp = ko.observable(null);
        self.getSelectedApplicationValue = ko.observableArray(null);        
        self.getSelectedUniqueDeviceIdFromDeviceSearch = ko.observableArray(null);
        self.checkallFlagFromDeviceSearch = ko.observable();
        //get packages for devices
        self.getPackagesForDeviceArr = ko.observableArray();

        ////for select all change in model dropdown
        self.rootmodels = new Array();
		
        //Show Hide Columns
        self.gridColumnList = new Array();

        self.gridColumnListForPopUp = new Array();
    
        //To identify device protocol in global edit of Device Search
        self.Protocol = 'VEM';
        self.ProtocolForGrid = new Array();
        //To store column/sort filter of device search
        self.GlobalColumnFilter = ko.observableArray();

		//Parameters
        self.selectedlevelFormFileId = 0;
		self.selectedlevelInstanceId = 0;
        self.selectedlevelContainerId = 0;
        self.selectedlevelParentInstanceSourceId = 0;
        self.selectedlevelParentInstanceId = 0;
        self.selectedlevelParentInstanceName = '';
        self.selectedlevelParentLevel = '';
        self.selectedLevel = 0;
        self.selectedLevelName = 'current level';
        self.isParamValuesChanged = ko.observable(false);
		self.displayPrimaryIdentifiers = true;
		self.isParameterTypeContent = ko.observable(false);
		self.parameterTypeFileId = '';
		self.parameterPackageId = 0;
		self.minParamValue = ko.observable(0);
		self.maxParamValue = ko.observable(0);
		self.currentScreen = '';

        //GlobalEditor
        self.globalSelectedLevel = 0;
        self.globalSelectedlevelFormFileId = 0;
        self.globalSelectedInstance = ko.observable();
        self.globalSelectedLevelName = 'current level';
		self.globalSelectedlevelParentLevel = '';

        self.isFromAddDeviceforDirect = ko.observable(false);
        self.instanceGridParameters = new Array();
        self.selectedInstance = ko.observable();

        self.lastFetchedHierarchyFullPath = '';

        self.Component = '';
        self.IsFutureScheduleAllowed = false;
        //Diagnostic Profile
        self.diagnosticProfileTabs = new Array();
        //Download History
        self.downloadHistoryTabs = new Array();
        //Communication History
        self.communicationHistoryTabs = new Array();
        //Parameter Audit History
        self.parameterauditHistoryTabs = new Array();
        //VRK Bundles Library
        self.vrkBundlesLibraryTabs = new Array();
        //Diagnostic History
        self.diagnosticHistoryTabs = new Array();
        //Content History
        self.contentHistoryTabs = new Array();
        
        self.isFromViewMerchant = false;

		//Device Profile Lite
        self.DeviceProfileLite = new Object();

    }
    return new globalViewModal();
});
