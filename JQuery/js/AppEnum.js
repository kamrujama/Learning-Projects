var ENUM = (function () {
    var private = {

        //Logout Reason
        'NORMALLOGOUT': '0',
        'IDLELOGOUT': '1',
        'SSOLOGOUT': '2',
        'INVALIDAUTHLOGOUT': '3',


        //reset mode
        'NONE': '0',
        'CONTACT_ADMINISTRATOR': '1',
        'EMAIL_SENT': '1',
        'PASSWORD_RETURNED': '2',

        //Authentication Mode
        'VHQ': '0',
        'AD': '1',
        'ADFS': '2',
        'AUTH_NONE': '3',

        //Category
        'DEFAULT_FILTER_COLUMN': '0',



        //Alert Status
        'Enabled': '0',
        'ALERT_STATUS_ALL': '0',
        'ALERT_STATUS_ENABLED': '1',
        'ALERT_STATUS_DISABLED': '2',

        //Export
        'None': '0',
        'ScheduleDownloads': '1',
        'DownloadStatus': '2',
        'OpenAlerts': '3',
        'ContentDeliveryStatus': '4',
        'DownloadLibrary': '5',
        'AlertHistory': '6',
        'Users': '7',
        'AuditLogReport': '8',
        'DeviceStatusReport': '9',
        'DiagnosticProfileReport': '10',
        'DeviceProfileCoreDataReport': '11',
        'DeviceProfileSoftwareReport': '12',
        'DeviceProfileEncryptionKeysReport': '13',
        'DockingHistoryReport': '14',
        'ContentLibrary': '15',
        'AlertResultDetailsForDashboard': '16',

        //PackageType
        'ALL_PACKAGETYPE': '0',
        'Software': '1',
        'Content': '2',
        'VRKPayLoad' : '3',
        'None_Package_Type': '4',
        'External' : '5',

        //Package Mode
        "PACKAGEMODE_NONE": "0",
        "PACKAGEMODE_PACKAGE": "1",
        "PACKAGEMODE_BUNDLE": "2",
        "PACKAGEMODE_MULTIBUNDLE": "3",
        "PACKAGE_MODE_TEMP": "1",
        "PACKAGE_MODE_ACTIVE": "0",

        //Device Status

        "None": "0",
        "Active": "1",
        "Inactive": "2",
        "Pending Registration": "3",
        "PendingRegistration": "3",
        "PendingHierarchyAssignment": "4",
        "Deleted": "5",
        "BlackListed": "6",
        "UnDeleted": "7",
        "Swapped": "8",


        //Fetch Mode
        "Page": "0",
        "All": "1",
        "Export": "2",

        //Assignment Mode
        "None": "0",
        "Direct": "1",
        "Hierarchy": "2",

        //Assignment operation 
        "PACKAGEASSIGNMENT_APPEND": "0",
        "PACKAGEASSIGNMENT_OVERWRITE": "1",
        "PACKAGEASSIGNMENT_DEFAULT": "2",

        //AlertSeverity  SEVERITY
        "SEVERITY_NA": "0",
        "SEVERITY_LOW": "1",
        "SEVERITY_MEDIUM": "2",
        "SEVERITY_HIGH": "3",
        "SEVERITY_ALL": "4",

        //AlertStatus
        "STATUS_OPEN": "0",
        "STATUS_CLOSED": "1",
        "STATUS_ALL": "2",

        //CallType
        "CALLTYPE_NONE": "0",
        "CALLTYPE_MONTH": "1",
        "CALLTYPE_DAY": "2",
        "CALLTYPE_WEEK": "3",

        //Download type

        "DOWNLOAD_TYPE_ALL": "0",
        "DOWNLOAD_TYPE_MANUAL": "1",
        "DOWNLOAD_TYPE_AUTOMATIC": "2",

        ///////////////////Schedule Download/////////////////////////

        //Schedule Option
        "SCHEDULE_OPTION_NONE": "0",
        "SCHEDULE_OPTION_IMMEDIATE": "1",
        "SCHEDULE_OPTION_ON_NEXTMAINTAINANCE_WINDOW": "2",
        "SCHEDULE_OPTION_SPECIFIED_DATE": "3",
        "SCHEDULE_OPTION_AUTO_SCHEULE": "4",

        //Job Category

        "JOB_CATEGORY_NORMAL": "0",
        "JOB_CATEGORY_ASSIGNED": "1",
        "JOB_CATEGORY_AUTO": "2",
        "JOB_CATEGORY_RESCHEDULE": "3",
        "JOB_CATEGORY_CANCEL": "4",

        //Job Type

        "JOB_TYPE_DOWNLOAD": "0",
        "JOB_TYPE_ACTION": "1",
        "JOB_TYPE_CANCEl": "2",

        //Parameter Mode
        "PARAMETER_MODE_NONE": "0",
        "PARAMETER_MODE_FULL": "1",
        "PARAMETER_MODE_PARTIAL": "2",

        //Sofware Mode
        "SOFTWARE_MODE_NONE": "0",
        "SOFTWARE_MODE_FULL": "1",
        "SOFTWARE_MODE_PARTIAL": "2",

        //Job Schedule Status
        "JOB_SUCCESSFUL": "0",
        "JOB_FAILED": "1",

        //
        //Detailed Download Status
        "DETAILED_DOWNLOAD_STATUS": "15",
        "DETAILED_CONTENT_DOWNLOAD_STATUS":"15",

        "RECCURANCE_NONE": "0",
        "RECCURANCE_HOURLY": "1",
        "RECCURANCE_DAILY": "2",
        "RECCURANCE_WEEKLY": "3",
        "RECCURANCE_MONTHLY": "4",

        //Rs change Type
        "RS_PACKAGE": "0",
        "RS_CRITERIA": "1",
        "RS_BOTH": "2",
        "RS_NONE": "3",

        //Ip Source Validation

        "IPRANGEVALIDATION_DEVICE": "0",
        "IPRANGEVALIDATION_GUI": "1",
        "IPRANGEVALIDATION_BOTH": "2",

        "IMPORT_LOG_TYPE_DeviceImport": "0",
        "IMPORT_LOG_TYPE_HIERACHY_IMPORT": "1",
        "IMPORT_LOG_TYPE_IP_RANGES_IMPORT": "2",
        "IMPORT_LOG_TYPE_ADD_OPERATION": "3",

        //Device Assignment Report 
        "DEVICE_ASSIGNMENT_REPORT_NONE": "0",
        "DEVICE_ASSIGNMENT_REPORT_ADVANCED": "1",
        "DEVICE_ASSIGNMENT_REPORT_QUICK": "2",

        //Inherit From Parent Hierarchy
        "INHERIT_FROM_PARENT_NONE": "0",
        "INHERIT_FROM_PARENT_YES": "1",
        "INHERIT_FROM_PARENT_NO": "2",

        //HierarchyDA Modified 
        "HIERARCHYDA_NONE": "0",
        "HIERARCHYDA_BOTH": "1",
        "HIERARCHYDA_AUTOMATICDOWNLOAD": "2",
        "HIERARCHYDA_DOWNLOADEDON": "3",

        //DAModified
        "DAMODEIFIED_NONE": "0",
        "DAMODEIFIED_TRUE": "1",
        "DAMODEIFIED_FALSE": "2",

        //ControlType
        "TEXTBOX": "0",
        "COMBO": "1",
        "NUMERIC": "2",
        "DATE": "3",
        "MULTICOMBO": "4",


        //SearchType
        "NONE": "0",
        "ADVANCED": "1",
        "QUICK": "2",
        "CUSTOM": "3",

        //Software Assignment
        "DAMODIFIED_NONE": "0",
        "DAMODIFIED_TRUE": "1",
        "DAMODIFIED_FALSE": "2",

        //Application Screen FormImportType
        
        "NEW": "0",
        "REUSE": "1",
        //Device Profile
        "SELECTED_DEVICE_MODIFIED": "147",
        //CUstom Attribute
        "DEVICESWAPSTATUS_NONE": '0',
        "DEVICESWAPSTATUS_ENABLED": '1',
        "DEVICESWAPSTATUS_DISABLED": '2',
        //Custom Attr Device Status
        "DEVICE_STATUS_NONE": '0',
        "DEVICE_STATUS_ACTIVE": '1',
        "DEVICE_STATUS_INACTIVE": '2',
        "DEVICE_STATUS_PENDING_REGISTRATION": '3',
        "DEVICE_STATUS_PENDING_HIERARCHY_ASSIGNMENT": '4',
        "DEVICE_STATUS_DELETED": '5',
        "DEVICE_STATUS_BLACKLISTED": '6',
        "DEVICE_STATUS_UNDELETED": '7',
        "DEVICE_STATUS_SWAPED": '8',

        //Device Mode
        "DEVICE_MODE_NONE": '0',
        "DEVICE_MODE_SERIAL_NUMBER": '1',
        "DEVICE_MODE_DEVICEID": '2',
        "DEVICE_MODE_BOTH": '3',

        //Action Mode
       
        "ACTION_MODE_SAVE": "0",
        "ACTION_MODE_SAVE_ACTIVATE": "1",
        "ACTION_MODE_ACTIVATE": "2",


        //Device sub sttaus type
        "SUB_STATUS_ALL": "0",
        "SUB_STATUS_NON_INTERNAL": "1",

        //Filter reset mode
         "FILTER_RESET_MODE_NONE": "0",
         "FILTER_RESET_MODE_ALL": "1",
         "FILTER_RESET_MODE_DEVICE_SEARCH": "2",
         "FILTER_RESET_MODE_COLUMNFILTER": "3",

        //swap status
         "SWAP_NONE": "0",
         "SWAP_ENABLED": "1",
         "SWAP_DISABLED": "2",

        //FilterResetMode

         "NONE": "0",
         "ALL": "1",
         "DEVICESEARCH": "2",
         "COLUMNSORTFILTER": "3",
        //Download Settings
        "Disable_DownloadSettings": "0",
        "Enable_DownloadSettings": "1",
        "None_DownloadSettings" : "2",

        //ParameterRetrivalType
        "NAME_AND_DESCRIPTION_PAIR": "0",
        "ORIGINAL_FORMFILE": "1",
        "FORMFILE_XML": "2",

        //Model Component
        "POS": "Payment Device",
        "Android": "Android",
		"POS_Android": "Payment Device & Android",

		//Parameter Reference Enumeration
		"DEVICE": "Device",
		"GLOBAL": "Global",
		"TEMPLATE": "Template",

		"DEFAULT": "0",
		"FILE_ID": "1",

		//Care Bar Widgets
		"NONE": "0",
		"CURRENT": "1",
		"ATTENTION": "2",
		"ALERTS": "3",
		"MINOR_ISSUES": "4",
		"CONCERNS": "5",
		"FAULTS": "6",
		"DELETE_BLACKLISTED": "7"
    };

    return {
        get: function (name) { return private[name]; }
    };

})();
