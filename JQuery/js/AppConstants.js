function getUrls() {
    var returnVal;
    $.ajax({
        type: 'GET',
        async: false,
        url: "Config.json",
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            //returnVal = data;//$.parseJSON(data);
            if (typeof data === 'object') {
                returnVal = data;
            }
            else {
                returnVal = $.parseJSON(data);
            }
        },
        error: function (jqXHR, status, error) {
            if (jqXHR != null) {
                ajaxErrorHandler(jqXHR, status, error);
                if (jqXHR.status != 401) {
                    alert('URLS Configuration ERROR');
                    returnVal = '';
                }
            } else {
                alert('URLS Configuration ERROR');
                returnVal = '';
            }
        }
    });
    return returnVal;
}
configvalues = getUrls();
sess_warningMinutes = 60;
notifyTimerCall = false;
sessAliveWarningTime = sess_warningMinutes * 60000;

var AppConstants = (function () {
    var private = {
        //localization path
        'LOCALIZEDPATH': 'assets/locale/i18n',

        'SUCCESS': '1',
        "INTERNAL_ERROR": "112",
        'ACCESS_DENIED': '186',
        'ACCESS_DENIED_LOGIN': 'Access_Denied',
        'ACTION_NOT_SUPPORTED_BY_AGENT': '134',
        'TOKEN_INVALID_OR_EXPIRED': '12',
        'USER_LOGOUT_REQUIRED': '401',

        'DUPLICATE_HIERARCHY': '253',
        'PARENT_HIERARCHY_ALREADY_SELECTED': '254',
        'CHILD_HIERARCHY_ALREADY_SELECTED': '255',
        'BASE_FORMFILE_ALREADY_EXISTS': '271',
        'DEFINITIONFILE_FORMFILE_VERSION_MISMATCH': '272',
        'Hierarchy_Assigned': '273',
        "UNAUTHORIZED_ACCESS": "11",
        "UNAUTHORIZED_ACCESS_HIERARCHY": "402",
        "MODIFY_DEVICE": "147",
        "POPULATION_OF_THE_APPLICATION_PARAMETERS_IN_PROGRESS": "240",
        "EX_NO_BASE_LEVEL_CONTAINERS": "394",
        "SYSTEM_BUSY": "263",
        "LICENSE_EXPIRED_LOGIN": "LICENSE_EXPIRED",

        //Web API Status codes
        "GET_SUCCESS": "200",
        "POST_SUCCESS": "200",
        "CREATED": "201",
        "GET_NO_CONTENT": "204",
        "PATCH_NO_CONTENT": "204",
        "DELETE_NO_CONTENT": "204",
        "PARTIAL_UPDATE_1": "206",
        "PARTIAL_UPDATE_2": "207",
        "NOT_MODIFIED": "304",
        "BAD_REQUEST": "400",
        "UNAUTHORIZED": "401",
        "FORBIDDEN": "403",
        "NOT_FOUND": "404",
        "CONFLICTS": "409",
        "INTERNAL_SERVER_ERROR": "500",

        //Verify Password
        'PASSWORD_MISMATCH_ERROR': '6',
        'PASSWORD_RETRY_DELAY': '7',
        'EXCEED_MAX_LOGON_ATTEMPTS': '32',
        'VALID_PASSWORD': '34',
        'PASSWORD_USED_RECENTLY': '41',
        'INVALID_NEWPWD': '294',

        //Config URL
        'API_URL': configvalues.API_URL,
        'PHP_SERVER_URL':configvalues.PHP_SERVER_URL,
        'MONGO_API_URL':configvalues.MONGO_API_URL,
        'GATEWAY_API_URL': configvalues.GATEWAY_API_URL,
        'FILE_UPLOAD_URL': configvalues.FILE_UPLOAD_URL,
        "FILE_UPLOAD_STREAM_URL": configvalues.FILE_UPLOAD_STREAM_URL,
        'LOGOUT_URL': configvalues.LOGOUT_URL,
        'HELP_URL': configvalues.HELP_URL,
        'COMPANYCODE': configvalues.companyCode,
        'ROWSPERPAGE': configvalues.rowsPerPage,
        'REPORTSROWPERPAGE': configvalues.reportsRowPerPage,
        'DASHBOARDREFRESHFREQUENCY': configvalues.dashboardRefreshFrequency,
        'TIMEOUTFORDATASERVICESCALL': configvalues.timeOutForDataServicesCall,
        'MAXIMUMFILESIZE': configvalues.maximumFileSize,
        'HIERARCHYPERPAGE': 250,
        'DeviceProfileLiteEnabled': configvalues.loadDeviceProfileLite,

        //Screen Names
		"HOME_SCREEN" : [{ "ScreenId": 1, "ScreenName": "Dashboard" }, { "ScreenId": 2, "ScreenName": "Care Dashboard" }, { "ScreenId": 3, "ScreenName": "Device Search" }],
        "DASHBOARD": "Dashboard",
		"CARE_DASHBOARD": "Care Dashboard",
        "DEVICE_SEARCH": "Device Search",

        //Device Attributes
        'CUSTOM_SEARCH_ATTRIBUTES': 'CustomDeviceSearch',
        'DEVICE_SEARCH_ATTRIBUTES': 'DeviceSearch',
        'REFERENCE_SET_ATTRIBUTES': 'ReferenceSet',
        'IsEnabledForAutoDownload': 'Enable Automatic Download',

        //Standard Constants
        'DEFAULT_FILTER_COLUMN': 'DefaultFilterColumn',
        'SOFTWARE_PACKAGE_FILE_TYPE': 'SoftwarePackageFileTypes',
        'OPERATORS': 'Operators',
        'DOWNLOAD_JOB_STATUS': 'DownloadJobStatus',
        'SOFWARE_PACKAGE_FILE_TYPE': 'Software Package File Types',


        //Content Library
        "DEVICE_CONTENT_FILE_NAME": "DeviceContentFileName",
        "DEVICE_FILE_LOCATION": "DeviceFileLocation",
        "CONTENT_TARGET_USER_TYPES": "ContentTargetUserTypes",
        "INVALID_FILE_NAME_CONTENT_LIBRARY": "InvalidFileName",

        //User Profile
        "ALERT_EMAIL_UNIQUE_KEY_VIOLATION": "150",

        //Folders
        "FOLDER_NAME_EXISTS": "361",

        //Download library
        "PACKAGE_ASSOCIATED_TO_DEVICE_HENCE_CANNOT_BE_DELETED": "37",
        "PACKAGE_IS_ASSOCIATED_TO_REFERENCESET": "36",

        //Validate Package
        "CANNOT_CREATE_A_FILE_WHEN_ALREADY_EXISTS": "29",
        "INVALID_FILE_NAME": "30",
        "PACKAGE_UNIQUE_KEY_VIOLATION": "80",
        "PACKAGE_WITH_VERSION_EXISTS": "168",
        "PACKAGE_DOES_NOT_SUPPORT_AUTOMATEDOWNLOAD": "169",
        "PACKAGE_IS_INVALID": "170",
        "COMMON_APPLICATION_EXISTS": "188",
        "COMMON_APPLICATION_EXISTS_STATUS": "191",
        "CLONE_PACKAGE_EXISTS": "195",
        "INVALID_PACKAGES_SELECTED": "287",
        "SOURCE_PACKAGE_NOT_EXISTS": "288",
        "E_INVALID_APPLICATION_TYPE_IN_CP_PACKAGE": "328",
        "E_APK_FILE_NOT_FOUND": "329",
        "E_PACKAGE_NAME_NOT_FOUND_IN_APK": "331",
        "E_INVALID_MANIFEST_FILE": "332",
        "E_INSUFFICIENT_STORAGE": "336",
        "E_INVALID_EXTENSION_FILES_FOUND": "337",
        "E_MANIFEST_FILE_NOT_FOUND": "338",
        "E_INVALID_CONTROL_FILE": "339",
        "E_CONTROL_FILE_MISSING_IN_PACKAGE": "340",
        "E_OTA_PACKAGE_DOES_NOT_SUPPORT_AUTO_DOWNLOADS": "341",
        "EX_OTA_PACKAGE_DOES_NOT_SUPPORT_MODEL": "348",
        "EX_OTA_PACKAGE_DOES_NOT_SUPPORT_DIFFERENTIAL_DOWNLOADS": "349",
        "EX_OTA_PACKAGE_DOES_NOT_SUPPORT_THIS_VERSION": "350",
        "EX_OTA_PACKAGE_MISSING_BUILD_INFO": "351",
        "EX_OTA_PACKAGE_INVALID_STRUCTURE": "352",
        "E_APP_ID_NOT_FOUND": "355",
        "EX_INVALID_SPONSOR_NAME": "356",
        "EX_VOS2_PACKAGE_SAME_NAME_WITH_DIFF_VERSION": "357",
        "EX_VOS2_PACKAGE_CONTAIN_OS_SPECIFIC_PACKAGE": "358",
        "EX_VOS2_DUPLICATE_PACKAGE_IN_SAME_BUNDLE": "359",
        "EX_INVALID_STATE_MANIFST_FILE": "360",

        //Import Device/Hierarchy/Template
        "E_INVALID_SCHEMA_FILE": "353",
        "E_INVALID_XSD_VERSION": "354",
        "E_IMPORT_LIMIT_EXCEEDED": "399",

        //Add Package
        "EX_PACKAGE_CREATION_FAILED": "138",
        "EX_INVALID_FILE": "158",
        "EX_UPLOADED_FILE_INVALID": "187",
        "E_INVALID_FILES_WHILE_MOVING": "333",

        //Add Package Post Install Delay
        "POST_INSTALL_DELAY_MIN": "0",
        "POST_INSTALL_DELAY_MAX": "300000",

        //Key Handles Renewal Days
        "KEY_HANDLES_DAYS_MIN": "30",
        "KEY_HANDLES_DAYS_MAX": "365",

        //Add Package Content Library
        "Limit_Exceeded_For_HierarchyFullPath": "149",

        //Edit Package
        "MODEL_DOES_NOT_SUPPORT_UPLOAD": "159",
        "CANNOT_REMOVE_MODELS": "176",

        //Group
        'DUPLICATE_GROUP_NAME_FOUND': '76',

        //Reschedule Package
        "RESCHEDULE_PACKAGE_STATUS_CODE": "43",

        //Schedule Delivery
        "JOB_NAME_ALREADY_EXISTS": "151",

        //Schedule Actions GetSystemConfiguration
        "HOURLY_ID": "Max Hourly Recurrence for Scheduling",
        "DAILY_ID": "Max Daily Recurrence for Scheduling",
        "WEEKLY_ID": "Max Weekly Recurrence for Scheduling",
        "MONTHLY_ID": "Max Monthly Recurrence for Scheduling",

        //Chart types
        "BAR_CHART": "barChart",
        "STACKBAR_CHART": "stackbarChart",
        "PIE_CHART": "pieChart",
        "LINE_CHART": "lineChart",
        "DONUT_CHART": "donutChart",

        //Chart Identifiers
        "DOWNLOAD_CHART": "DOWNLOAD_CHART",
        "REPORT_CHART": "REPORT_CHART",
        "ALERT_RESULT": "ALERT_RESULT",
        "DEVICES_PER_MODEL": "DEVICES_PER_MODEL",
        "ALERT_CHART": "ALERT_CHART",

        //Device search filter group
        "FEW_DEVICES_DOES_NOT_BELONGS_TO_GROUP": '156',
        "DEVICES_DOES_NOT_BELONGS_TO_GROUP": '185',
        "SELECTED_DEVICE_MODIFIED": '147',

        //Reference set
        "REFERENCE_SET_NAME_ALREADY_EXISTS": "171",
        "CONFLICTS_IN_PACKAGE_FILE_TYPE": "178",
        "CONFLICTS_IN_PACKAGES": "177",
        "ASSOCIATED_REFERNCE_SET_CANNOT_BE_INACTIVATED": "12",//Remaining from backend
        "REFERNCE_SET_ASSIGNED_TO_DEVICE_OF_MODEL": "182",
        "NOT_COMMON_MODEL": "175",
        "E_TARGET_VERSION_MISMMATCH": "377",
        "E_DUPLICATE_SOURCE_VERSION": "378",
        "E_MULTIPLE_OTA_PACKAGES": "379",
        "E_NOTAVAILABLE_MASTERPACKAGE": "380",
        "E_MASTERPACKAGE_INVALID": "381",
        "E_MASTERPACKAGE_INVALID_MODEL": "382",
        "E_MASTERPACKAGE_CLONE_PACKAGE_EXIST": "383",
        "E_MASTERPACKAGE_INVALID_VPDX_COUNT_MORE_THAN_ONE": "384",
        "E_MASTERZIP_PACKAGE_INVALID": "385",
        "E_MASTERPACKAGE_INVALID_MORE_THAN_ONE_VPFX_ZIP_FILE": "386",
        "E_MASTERPACKAGE_INVALID_MISSING_VPDX_FILE": "387",
        "E_MASTERPACKAGE_INVALID_MISSING_VPFX_FILE": "388",
        "E_MASTERPACKAGE_INVALID_MISSING_VPFX_ZIP_FILE": "389",
        "E_MASTERPACKAGE_INVALID_VPFX_ZIP_FILE_MISSING_VPFX_FILES": "390",
        "E_MASTERPACKAGE_INVALID_MISSING_MANIFEST_FILE_IN_VPFX_ZIP": "391",
        "E_INSTANCE_MAXIMUM_LIMIT_EXCEEDED": "392",
        "E_SPONSOR_ALREADY_EXISTS": "393",
        "EX_MASTERPACKAGE_INVALID_APPLICATION_VPDX_FILE_EXISTS": "400",
        "EX_CLONE_PACKAGE_EXIST_IN_DIFFERENT_FOLDER": "410",
        "EX_MODEL_ALREADY_EXISTS_WITH_ANOTHER_REFERENCESET": "414",
        "EX_INVALID_PACKAGE_TYPE_FOR_OTA": "416",
        "EX_PACKAGE_EXISTS_WITH_AUTOMATION_DISABLED": "438",

        //Deleted devices
        "UNDELETED": "UnDeleted",
        "BLACKLISTED": "BlackListed",
        "PERMANENT_DELETE": "Permanent Delete",
        "BLACKLISTE_DEVICES_NOT_UNDELETED": "137",
        "EX_DB_ERROR_WHILE_DELETE_DEVICE": "409",

        //moment
        "SHORT_DATE_FORMAT": "MM/DD/YYYY",
        "LONG_DATETIME_FORMAT": "MM/DD/YYYY HH:mm:SS",
        "LONG_DATETIME_FORMAT_SECONDS": 'MM/DD/YYYY HH:mm:ss',
        "LONG_DATETIME_FORMAT_AMPM": "MM/DD/YYYY HH:MM:ss A",
        "LONG_DATETIME_GRID_FORMAT": "dd/MMM/yyyy HH:MM:ss tt",

        //Download Status chart
        "FIRST_WEEK": "1 Week",
        "SECOND_WEEKS": "2 Weeks",
        "THIRD_WEEKS": "3 Weeks",
        "FOURTH_WEEKS": "4 Weeks",
        "SUBTRACT_FIRST_WEEK": "6",
        "SUBTRACT_SECOND_WEEKS": "13",
        "SUBTRACT_THIRD_WEEKS": "20",
        "SUBTRACT_FOURTH_WEEKS": "27",

        //File Name on device
        "DEVICE_CONTENT_FILENAME": "DeviceContentFileName",
        "DEVICE_FILENAME_ON_DEVICE": "Device Content FileName",
        "CONTENT_FILE_NOT_EXISTS": "334",
        "CONTENT_FILE_ERROR_WHEN_DOWNLOAD": "335",
        "CONTENT_URL_FORBIDDEN": "373",

        //Group Establishment
        "ESTABLISHMENT_GROUPNAME_EDIT_SAME": "144",
        "ESTABLISHMENT_GROUPNAME_ADD_SAME": "76",
        "ESTABLISHMENT_GROUPNAME_LIMIT": "243",

        //Device Sub Status
        "DEVICE_SUB_STATUS_ADD_SAME_NAME_EXISTS": "205",
        "DEVICE_SUB_STATUS_ASSOCIATED_TO_DEVICE_CANNOT_DELETED": "241",
        "DEVICE_SUB_STATUS_ASSOCIATED_TO_DEVICE_HISTORY_CANNOT_DELETED": "327",

        //User
        "USER_NOT_IN_ACTIVE_DIRECTORY": "188",
        "E_INVALIDEMAIL": "289",
        "E_INVALIDDOMAIN": "290",
        "E_RECORD_NOT_INSERTED": "291",
        "E_DOMAIN_NOT_CREATED": "292",
        "E_DOMAIN_NOT_FOUND": "293",
        "E_WSO2USER_NOTCREATED": "295",
        "E_WSO2USER_NOTUPDATED": "296",
        "E_WS02USER_INVALIDLOGINNAME": "297",
        "E_USER_NOT_INSERTED": "298",
        "E_USER_NOT_UPDATED": "299",
        "E_CUSTOMEREMAILMAP_NOT_INSERTED": "300",
        "E_DOMAINIDP_NOT_INSERTED": "301",
        "E_WSO2TOKEN_NOT_GENERATED": "302",
        "E_DUPLICATEUSER": "303",
        "E_USER_PWD_CANNOT_BE_CHANGED": "347",
        "E_USER_PWD_COMPLEXITY": "4",
        "E_FORGEROCKUSER_NOT_CREATED": "444",
        "E_FORGEROCKUSER_NOT_UPDATED": "445",


        "ALERT_EMAIL_UNIQUE": "150",
        "UNIQUE_KEY_VIOLATION": "26",
        "HIERARCHY_LIMIT_EXCEEDED": "149",
        "INVALID_CUSTOMER_DOMAIN_MAPPING": "278",

        //Source IP Validation
        "SOURCE_IP_VALIDATION_ADD_IP_ALLREADY_EXIST": "181",

        //Security Groups
        "Security_Group_Name_Already_Exists": "162",
        "Security_Group_Details_Not_Found_In_Active_Directory": "160",
        "SECURITY_GROUPS_CANNOT_BE_DELETED": "161",
        "ADMIN_SECURITYGROUP_CANNOT_DELETED": "198",

        //Roles
        "DUPLICATE_ROLE_FOUND": "81",
        "ROLE_CANNOT_BE_DELETED": "143",
        "ATLEAT_ONE_ROLE_MANDATORY": "184",

        //Reports
        "CUSTOM_RPT_EXISTS": "230",
        "SUBSCRIPTION_EXISTS": "199",
        "REPORT_NOT_AVAILABLE": "200",

        //Reports filter source
        "ModelName": "Model",
        "Severity": "Severity",
        "AlertName": "Alerts",
        "ComputedDeviceStatus": "Device Status",
        "CompDeviceSyncStatus": "Synchronised",
        "PreviousDeviceStatus": "All Device Status",
        "PreviousDeviceSubStatus": "Device Sub Status",
        "CurrentDeviceStatus": "All Device Status",
        "CurrentDeviceSubStatus": "Device Sub Status",
        "SubStatus": "Device Sub Status",
        "EncrEnabled": "EncrEnabled",
        "ISMODIFYALLOWED": "Report Role Privileges",
        "ISDELETEALLOWED": "Report Role Privileges",
        "ISVIEWALLOWED": "Report Role Privileges",
        "MODELNAME": "Model",
        "CompJobStatus": "Download\/Content Job Status",
        "JobStatus": "Download\/Content Job Status",
        "Status": "Download\/Content Job Status",
        "ServerCommunicationType": "Server Communication",
        "DeviceCommunicationType": "Device Communication",
        "DeviceStatus": "Status",
        "STATUS": "Alert Status",
        "AlertType": "Alerts",
        "Device Status": "Status",
        "Component": "Component",
        "Synchronised": "Synchronised",
        "ModeofConnectivity": "ModeofConnectivity",
        "SoftwareAssignmentType":"SoftwareAssignmentType",
        "CreatedBy": "Created By",
        "ModifiedBy": "Modified By",
        "ScheduledBy": "Scheduled By",
        "ClosedBy": "Closed By",
        "User": "User",
        "JobPackageType": "JobPackageType",
        "IsAutoDownloadJob": "Download Types",
        "Manual": "Manual",
        "Automatic": "Automatic",
        "KeyPresent": "Key Present",

        //Advanced Search
        "DEVICESEARCH": "DeviceSearch",
        "HIERARCHY": "Hierarchy",
        "GROUPS": "Groups",

        //Hierarchy
        "HIERARCHY_LEVEL_UNIQUE_KEY": "78",
        "IMPORT_FAILED_FOR_FEW_HIERARCHY": "115",
        "EX_BLANK_TIMEZONE_FOR_HIERARCHIES": "3750",
        "IMPORT_HIERARCHY_FAILED": "118",
        "LOCATIONID_ALREADY_EXIST": "148",
        "LIMIT_EXCEDDED_FOR_HIERARCHY_FULLPATH": "149",
        "HIERARCHY_UNIQUE_KEY_VIOLATION": "77",
        "HIERARCHYNAME_ALREADY_EXISTS": "376",
        "EX_UPDATE_DEVICESTATUS_FAILED_FOR_PERIPHERAL_DEVICES": "415",

        //Edit hierarchy assignment        
        "PARAMETERTEMPLATE_VALIDATE": "VALIDATETEMPLATE",
        "PARAMETERTEMPLATE_INSERT": "INSERTTEMPLATE",

        //Assignment Types
        "Package": "PACKAGE",
        "Application": "APPLICATION",
        "None": "NONE",
        "ReferenceSet": "REFERENCESET",


        //Key Assignment
        "Assignment_Key": "Key Profile",
        "Assignment_Package": "Package",

        //Add Devices
        "DEVICEID_EXISTS_WITH_DIFFERENT_DEVICE": "224",
        "DEVICE_ALREADY_EXISTS": "256",
        "DEVICE_UNIQUE_KEY_VIOLATION": "73",
        "EX_DEVICE_COUNT_EXCEED": "235",
        "IMPORT_FAILED": "114",
        "INVALID_XMLVERSION": "282",
        "VERSION_NOT_FOUND": "283",
        "INVALID_XMLFILE_FORMAT": "228",
        "INVALID_XML": "112",
        "E_FILE_FORMAT_NOT_SUPPORTED": "234",
        "DEVICEID_EXISTS_WITH_DELETED_BLACKLISTED": "257",

        "Device_Protocol": "Protocol",
        "Protocol": "Protocol",

        "EX_INVALID_DEVICE_SELECTED": "258",
        "Cannot_Proceed_With_Delete_Operation": "276",
        "Cannot_Proceed_With_Delete_Operation_User": "277",

        //Reference Set
        "FEW_OR_ALL_DEVICES_ASSIGNED_TO_REFERENCESET": "179",
        "ReferenceSet_Mapped_To_Device": "173",
        "ReferenceSet_Mapped_To_Hierarchy": "174",

        //Device Search activate parameter
        "EX_POPULATION_IS_INPROGRESS": "240",
        "SOFTWARE_ASSIGNMENT_FAILED_FOR_FEW_DEVICES": "192",
        "Application_Assignment_Failed_For_Few_Devices": "264",
        "Applications_With_Duplicate_Name_Selected": "274",
        "SEARCH_WITH_NAME_EXISTS": "189",
        "MAX_TEMPLATE_ALLOWED_PER_DEVICE": "MaxTemplatesAllowedPerDevice",
        "E_NO_DEVICES_QUALIFIED": "325",
        "E_NO_PARAMETERS_ACTIVATED": "326",

        //Device Profile Edit Parameter
        "Invalid_Param_Value": "265",
        "PARAM_NOT_FOUND": "251",

        //Applications Library configure VPDX/VPFX
        "INVALID_PARAMETER_FORM_VIEW_FILE": "226",
        "INVALID_PARAMETER_DEFINITION_FILE": "227",
        "PARENT_FORMFILE_NOT_EXISTS": "266",
        "CHILDFORMFILE_ALREADY_EXISTS": "267",
        "FORMFILE_ALREADY_EXISTS": "269",
        "INVALID_DEFAULT_VALUE_IN_FORMFILE": "281",
        "E_REQUIRED_VPFX_MULTIINSTANCE_GRIDOPERATION": "305",
        "E_REQUIRED_VPFX_MULTIINSTANCE_SHOWINGRID": "306",
        "E_REQUIRED_VPFX_MULTIINSTANCE_PRIMARYIDENTIFIER": "307",
        "E_REQUIRED_VPFX_SEQUENCE": "310",
        "E_NO_CHANGE_IN_FILE": "363",
        "E_FORM_FILE_LEVEL_MISMATCH": "364",
        "E_FORM_FILE_PARENT_MISMATCH": "365",
        "E_CONTAINER_WITH_PRIMARY_IDENTIFIER_CANNOT_BE_MODIFIED": "366",
        "E_PRIMARY_IDENTIFIER_CANNOT_BE_MODIFIED": "367",
        "E_DEFINITION_FORM_NAME_MISMATCH": "368",
        "E_DEFINITION_FORMAT_MISMATCH": "369",
        "E_REFERENCED_INSTANCES_CANNOT_BE_DELETED": "371",
        "PARAMETERS_ARE_MODIFIED": "PARAMETERS_ARE_MODIFIED",
        "CONTAINER_MODIFIED": "CONTAINER_MODIFIED",
        "IDENTIFIER_MODIFIED": "IDENTIFIER_MODIFIED",

        "INSTANCE_ALREADY_EXISTS": "270",
        "E_REQUIRED_VPFX_MULTIINSTANCE_TEMPLATENAME": "308",
        "E_NO_PARAMETER_UPDATED": "309",
        "E_COMMON_PARAMETERS_TEMPLATE": "311",
        "E_NO_MULTIINSTANCE_FOUND": "314",
        "E_INVALID_REQUEST": "324",
        "DUPLICATE_TEMPLATE": "196",
        "SELECTED_DEVICE_MODIFIED": "147",
        "INVALID_FILE_FORMAT": "Invalid_FormFile_Format",

        //Edit DeviceID Device Profile screen
        "MODIFIED_OR_DELETED_DEVICE_ID": "147",
        "SERIAL_NUMBER_EXISTS_WITH_DIFFERENT_DEVICE": "238",
        "Download_Media_List": "DownloadMedia",
        "Add_Application_Platform": "Vx Predator,Vx eVo",
        "Application_Already_Exists": "",
        "CANNOT_DELETE_APPLICATION": "261",
        "APP_EXISTS_IN_SELECTED_DEVICES": "252",

        //Schedule
        "CREATE_JOB_FAILED": "153",
        "Create_Job_Failed_Zero_Devices_Scheduled": "157",
        "Package_Not_Found": "244",
        "No_Eligible_Device_Exists": "259",
        "No_Eligible_Device_Excluding_Inactive_Devices": "284",
        "Create_Job_Failed_Param_Not_Found": "250",
        "Param_Not_Found": "251",
        "Package_Does_Not_Support": "275",
        "Devices_With_Different_Model_Selected": "279",

        //Dashboard Widget types
        "STANDARD": "Standard",
        "COUNTER": "Counter",

        //Alerts
        "HighAlertCount": "High Alerts",
        "LowAlertCount": "Low Alerts",
        "MediumAlertCount": "Medium Alerts",

        //Job Status
        "ContentReplacedCount": "Content Replaced",
        "ContentReplaceFailedCount": "Content Replace Failed",
        "DownloadFailedCount": "Download Failed",
        "DownloadStartedCount": "Download Started",
        "DownloadSuccessfulCount": "Download Successful",
        "InstallFailedCount": "Install Failed",
        "InstallSuccessfulCount": "Install Successful",
        "InstallPostponedCount": "Install Postponed",
        "ScheduledCount": "Scheduled",
        "ScheduleSentCount": "Schedule Sent",
        "SchedulingCount": "Scheduling",
        "ScheduleConfirmedCount": "Schedule Confirmed",
        "CancelledCount": "Cancelled",
        "DownloadInProgress": "Download InProgress",
        "DownloadCompleted": "Download Completed",
        "InstallationStarted": "Installation Started",
        "InstallationInProgress": "Installation InProgress",

        "FailedCount": "Failed",
        "SuccessfulCount": "Successful",

        //Hierarchies
        "HIERARCHY_LIMIT_EXCEDDED": "149",

        //global
        "COPYRIGHT": "Copyright © 2018, Verifone Systems, Inc.",

        "VRKDownloadDetailsGrid": "VRKDownloadDetails",
        "VRKDownloadDetailsForDeviceProfileGrid": "VRKDownloadDetailsForDeviceProfile",
        "VRKJobSummaryForDeviceProfileGrid": "VRKJobSummaryForDeviceProfile",
        "reset_value": "reset",

        //VRK BUNDLE SCHEDULE TYPE
        "VRK_SCHEDULE_TYPE_NONE": "None",
        "VRK_SCHEDULE_TYPE_NOW": "Now",
        "VRK_SCHEDULE_TYPE_AFTER": "After",
        "VRK_SCHEDULE_TYPE_NEXTCONTACT": "Next Contact",
        "VRK_SCHEDULE_TYPE_NEXTMAINTANACE": "Next Maintenance Window",

        //VRK BUNDLE STATUS
        "VRK_BUNDLESTATUS_COMPLETE": "Complete",
        "VRK_BUNDLESTATUS_NOTSCHEDULED": "Not Scheduled",
        "VRK_BUNDLESTATUS_FAILED": "Failed",
        "VRK_BUNDLESTATUS_PROCESSING": "Processing",
        "VRK_BUNDLESTATUS_COMPLETEWITHFAILURE": "Complete with failure",
        "VRK_BUNDLESTATUS_SCHEDULED": "Scheduled",

        //Device Search Protocol
        "Devices_Selected_Different_Protocol": "262",
        "VEM_PROTOCOL": "VEM",
        "ZONTALK_PROTOCOL": "ZONTALK",

        //Device Family
        "MX_FAMILY": "MX",
        "VX_FAMILY": "VX",
        "CARBON_FAMILY": "CARBON",
        "CARBON_MOBILE_FAMILY": "CARBONMOBILE",
        "CARBON_AND_CARBON_MOBILE_FAMILY": "CARBONANDCARBONMOBILE",
        "PWM_FAMILY": "PWM",
        "ENGAGE_FAMILY": "ENGAGE",

        //Model Component
        "POS": "Payment Device",
        "Android": "Android",
        "POS_Android": "Payment Device & Android",

        //Package File Type
        "OTA": "OTA",
        "Install": "INSTALL",
        "Uninstall": "UNINSTALL",
        "None": "NONE",
        "ANDROID_OTA": "AndroidOTA",
        "SUPER_PACKAGE": "SuperPackage",

        //Package Mode
        "0": "None",
        "1": "Package",
        "2": "Bundle",
        "3": "MultiBundle",

        //Container Access
        "BASIC_ACCESS": "Basic",
        "ADVANCED_ACCESS": "Advanced",
        "VIEW_ACCESS": "View",
        "NONE_ACCESS": "None",

        //Container Type
        "GENERAL": "GENERAL",
        "NORMAL": "Normal",
        "GRID": "Grid",
        "DETAILS": "Details",

        //Device Template Operations
        "READONLY_OPERATION": "ReadOnly",
        "READWRITE_OPERATION": "ReadWrite",
        "NONE_OPERATION": "None",

        //Software Assignment
        "APP_EXISTS_IN_SELECTED_PACKAGE": "190",
        "APP_EXISTS_IN_SELECTED_DEVICE": "252",

        //Download Options
        "NEXT_CONTACT": "NEXT CONTACT",
        "MAINTENANCE_WINDOW": "MAINTENANCE WINDOW",
        "NEXT_MAINTENANCE_WINDOW": "NEXT MAINTENANCE WINDOW",
        "NEXT_AVAILABLE_FREE_TIME_SLOT": "NEXT AVAILABLE FREE TIME SLOT",
        "NEXT_AVAILABLE_FREE_TIME_SLOT_WITH_MAINTENANCE_WINDOW": "NEXT AVAILABLE FREE TIME SLOT WITH MAINTENANCE WINDOW",

        //Schedules
        "NOT_MORE_DEVICES": "152",
        "NONE_OF_THE_SELECTED_DEVICES_HAVE_PACKAGES_ASSIGNED": "285",
        "E_MAX_DOWNLOADS_ALLOWED_PER_JOB_LIMIT_EXCEEDED": "395",

        //SQL Injection Error
        "SQL_INJECTION_ERROR": "286",

        //Invalid Input
        "E_INVALID_INPUT_FORMAT": "304",

        //Hierarachy Assignment
        "E_ASSIGNED_TEMPLATE_CONTAINS_DUPLICATE_PT": "315",
        "E_ASSIGNED_HIERARCHY_RS_CONTAINS_DUPLICATE_PT": "312",
        "E_ASSIGNMENT_FAILED": "313",

        //Template Assignment
        "E_TEMPLATE_ASSIGNED_HIERARCHY": "319",
        "E_TEMPLATE_PARAMETER_ALREADY_EXIST": "317",
        "E_APPLICATION_TEMPLATE_REFERENCED_TO_LOOKUP_TEMPLATE": "372",
        "E_LOOKUP_TEMPLATE_REFERENCED_IN_APPLICATION_TEMPLATES": "374",
        "EX_APPLY_TEMPLATE_FAILED": "403",
        "EX_INVALID_TEMPLATE_LABEL": "404",
        "EX_DUPLICATE_MODELED_TEMPLATES": "408",

        //Merchant
        "E_MERCHANT_VALIDATION": "320",

        //Configuration names		
        'GUI_IDLE_TIMEOUT': 'GUI Idle Timeout',
        "SWAP_APPROVAL_REQUIRED": "Swap Approval Required",
        "DIRECT_PARAMETER_ACTIVATION": "Direct Parameter Activation",

        "CONFIG_NOTIFY_ALERTS_ON_UI": "Notify Alerts on UI",
        "CONFIG_ALERT_NOTIFICATION_FREQUENCY": "Alert Notification Frequency",
        "INCLUDE_INACTIVE_DEVICES_FOR_SCHEDULING": "Include Inactive Devices for Scheduling",
        "CUSTOMER_ENABLED_FOR_VERIFONE_CENTRAL":"Customer Enabled for Verifone Central",

        "MAXIMUM_HIERARCHIES_PER_USER": "Maximum Hierarchies Per User",
        "MAX_SCHEDULE_COUNT_PER_JOB": "Max Schedules Per Job",
        'MAX_VRK_FILES_ALLOWED': 'Maximum Number of VRK Files Allowed per Upload',
        "MAX_PACKAGES_PER_REFERENCESET": "Max Packages Per Referenceset",
        "MAX_REFERENCESETS_PER_HIERARCHY": "Max Referencesets Per Hierarchy",
        "DIAGNOSTIC_DOWNLOAD_FILE_SIZE_LIMIT": "Diagnostic Download File Size Limit",
        "RF_PT_LOCK_CONFIG" : "Reference Set and Parameter Template Lock",
        "DEVICE_PROFILE_COLLECTION_STAGGERING": "Device Profile Collection Staggering",

        "HOSTNAME": "HostName",
        'PASSWORD_POLICY_NOTE': 'Password Policy Note',
        "CONFIG_COMMERCE_PLATFORM_ENABLED": "Commerce Platform Enabled",
        "SOFTWARE_PACKAGE_FILE_TYPES": "Software Package File Types",
        "CONTENT_PACKAGE_FILE_TYPES": 'Content Package File Types',

        "MAX_DOWNLOADS_PER_JOB": "Maximum number of downloads allowed per Job",
        "MAX_CSV_DEVICE_SEARCH_COUNT": "CSV Device Search Limit",     
        "PACKAGE_FILE_NAME_MAX_CHARS": "Package Filename Limit",

        //AllSystemConfigurationCategories
        "DEVICE_CUSTOM_ATTRIBUTE_LABEL": "Device Custom Attribute Label",
        "MAILS": "Mails",
        "SCHEDULER": "Scheduler",
        "SCHEDULES_AND_TIMERS": "Schedules and Timers",
        "SECURITY": "Security",
        "SETCLOCK": "SetClock",
        "SETUP": "Setup",
        "SYSTEM": "System",
        "EntityType": "EntityType",
        "PERFORMANCE": "Performance",
        //EO Portal
        "EOPORTAL": "EOPortal",
        "EOPORTAL_URL": "EOPortalUrl",

        //DateTime Default Format
        "DEFAULT_DATETIME_FORMAT": "dd-mm-yyyy HH:ii P",
        //CallType
        "CATEGORY_CALLTYPE": "CallType",
        "CATEGORY_CONFIG_DAY": "Day",
        "CATEGORY_CONFIG_WEEK": "Week",
        "CATEGORY_CONFIG_MONTH": "Month",

        //Control Types
        "CONTROL_NUMERIC": "numeric",
        "CONTROL_COMBO": "combo",
        "CONTROL_TIMECONTROL": "timecontrol",
        "CONTROL_TEXTBOX": "textbox",

        //Regular Expressions
        "IP_ADDRESS_REG_EXPRESSION": /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/,

        //MarketPlace URL
        "MARKETPLACE_URL": "MarketPlaceEndpoint",

        //User Personalization
        "PRIVATE_SEARCH": "-------Private-------",
        "PUBLIC_SEARCH": "-------Public-------",
        "EMPTY_SEARCH": "Empty",

        //Customer License Info
        "DEVICE_MANAGEMENT": "DeviceManagement",
        "CONTENT_MANAGEMENT": "Content",
        "DIAGNOSTICS": "Diagnostics",
        "CARE": "Care",
        "CARE_PLUS": "CarePlus",

        //Sub Status
        "NO_SUBSTATUS": "--No-Sub-Status--",
        "BLANKS": "(Blanks)",


        "SLOT_TIMEZONE_OFFSET_DIFF": "Time Difference for slot scheduler",
        "SLOT_TIME_OFFSET": 1,

        //Tags
        "EX_ADD_TAG_EXIST": "375",

        //Parameter Type File
        "PACKAGE_FILE": "PACKAGE",
        "CONTENT_FILE": "CONTENT",

        //Care Widgets
        "HEALTH": "Health",
        "SOFTWARE": "Software",
        "DEVICES": "Devices",

        /***** Device Health Alerts Grouping *****/
        //Device Failures
        "DEVICEMOVED": "device-failures",
        "DEVICEMISSING": "device-failures",
        "DEVICESHUTDOWN": "device-failures",
        "DEVICETAMPERED": "device-failures",
        "DEVICEUNABLETOREGISTER": "device-failures",
        "DELETEDDEVICECONTACTING": "device-failures",
        "BLACKLISTEDDEVICECONTACTING": "device-failures",
        "INVALIDDEVICEIPCONTACTING": "device-failures",
        "UNAUTHORIZEDDEVICESWAPREQUEST": "device-failures",
        "SKIMTESTFAILED": "device-failures",
        "NOSKIMTESTSPERFORMED": "device-failures",
        "EMVVERSIONMISMATCH": "device-failures",
        "DEVICELOCATIONCHANGED": "device-failures",

        //Device Success
        "DEVICERE_REGISTRATIONSUCCESS": "device-success",

        //Device Reboots
        "REBOOTPCI": "device-reboots",
        "REBOOTAGENT": "device-reboots",
        "REBOOTSYSTEM": "device-reboots",
        "DEVICEREBOOTED": "device-reboots",
        "MULTIPLEDEVICEREBOOTS": "device-reboots",

        //Download/Install failures
        "FAILEDDOWNLOAD": "download-install-failed",
        "INSTALLFAILED": "download-install-failed",
        "CONTENTREPLACEFAILED": "download-install-failed",
        "DOWNLOADINSTALLHUNG": "download-install-failed",

        //Failed Transactions
        "FAILEDINSERTREAD": "failed-transactions",
        "FAILEDMSRREAD": "failed-transactions",
        "FAILEDCONTACTLESS": "failed-transactions",
        "FALLBACKTRANSACTIONOCCURRED": "failed-transactions",
        "TRANSACTIONTIMEOUT": "failed-transactions",
        "FAILEDTAPORCONTACTLESSREAD": "failed-transactions",

        //Value based
        "RAMMEMORY": "memory-alert",
        "FLASHMEMORY": "memory-alert",
        "LOWRAMMEMORY": "memory-alert",
        "LOWFLASHMEMORY": "memory-alert",
        "SYSTEMMEMORYLOW": "memory-alert",
        "FILESYSTEMSPACELOW": "memory-alert",
        "LOWBATTERY": "battery-alert",
        "BATTERYLIFE": "battery-alert",
        "BATTERYHEALTHISSUE": "battery-alert",
        "HIGHBATTERYTEMPERATURE": "battery-alert",
        "RECHARGEABLEBATTERY": "battery-alert",
        "BUILTINBATTERY": "battery-alert",
        "EXCESSIVEPLUGUNPLUG": "excessive-plug-unplug",        

        //Certificate expiry
        "CERTIFICATEEXPIRED": "certificate-expiry",
        "CERTIFICATEEXPIRING": "certificate-expiry",
        "MISSINGVRKCERTIFICATE": "certificate-expiry",

        //Miscellaneous
        "DOCKIN": "miscellaneous",
        "DOCKOUT": "miscellaneous",
        "APPLICATIONEVENT": "miscellaneous",
        "PARAMETERUPDATE": "miscellaneous",
        "DATACONNECTIONLOSS": "miscellaneous",
        "SOFTWAREVERSION": "miscellaneous",
        /***** Device Health Alerts Grouping *****/

        //Troubleshoot logs
        "TROUBLESHOOT_LOGS_COMPONENT": "DeviceLogsComponent",
        "TROUBLESHOOT_LOGS_LEVEL": "LogLevel",

        "DETAILED_DOWNLOAD_LOGS_NOT_AVAILABLE": "396",
        "OS_LOG_FILE_NOT_FOUND": "397",

        //Performance
        "DEVICEPROFILECOLLECTION_JOB_ALREADY_EXIST": "398",

        //System Configration Config Names
        "CONFIG_NAME_COMPONENT_LOGLEVEL": "Component LogLevel",
        "CONFIG_NAME_LOG_LEVEL": 'LogLevel',

        //System Configration Config Values
        "CONFIG_VALUE_LOG_LEVEL_ALL": 'ALL',

        //Masking values
        "PARTIAL_MASKING_DIRECTION_RIGHT": 'RIGHT',
        "PARTIAL_MASKING_DIRECTION_LEFT": 'LEFT',

        //import/ExportStatus
        "EXPORT_COMPLETED": 'Completed',
        "EXPORT_FAILED": 'Failed',
        "EXPORT_COMPLETED_WITH_ERRORS": 'Completed with errors',
        "IMPORT_FILETYPE_DEVICELOGFILE": 'LogFileName',
        "IMPORT_FILETYPE_PARAMETERLOGFILE": 'ParameterResultFile',

        //SAFETY NETS
        "SAFETY_NETS_DEVICE_MOVE": 'Bulk Device Move Limit',
        "SAFETY_NETS_DEVICE_SOFTWARE": 'Bulk Device Software Configuration Limit',
        "SAFETY_NETS_DEVICE_PARAMETER": 'Bulk Device Parameter Configuration Limit',

        //SFTP AWS
        "SFTP_DISTRIBUTION_CONFIGNAME": "SftpFileRepositoryFolder",

        //Support for VRKV2 keys
        "DEVICE_PROFILE_XML_KEYPAYLOAD_FOR_VRKV2_Keys": "2.0",

        // Device profile page refresh on software assignment, parameters and hierarchy changes
        "SOFTWARE_REFRESH_DATA": "Software RefreshData",
        "PARAMETERS_REFRESH_DATA": "Parameters RefreshData",
        "HIERARCHY_REFRESH_DATA": "Hierarchy RefreshData",
        "GROUP_REFRESH_DATA": "Group RefreshData",
        "JOBS_DETAILS_REFRESH_DATA": "Jobs_Details RefreshData",
        "DEVICEPROFILE_REFRESH_DATA": "DeviceProfile RefreshData",
        "CLONE_DEVICE": "Clone Device",

        //Parent Reference Sets
        "EX_PARENT_REFERENCESET_EXISTS": "411",
        "EX_PARENT_REFERENCESET_MAPPED": "413",

        //User Preference Columns
        "ACTION_GET": "Get",
        "ACTION_POST_PATCH": "Add/Edit",
        "ACTION_DELETE": "Remove",
        "FETCH_ALL": "ALL",

        //Export Diagnostic Files
        "EX_DIAGNOSTIC_FILES_SIZE_LIMIT_EXCEED": "437",
        "EX_NO_FILE_AVAILABLE_FOR_DOWNLOAD": "441",

        //License Components
        "HOSTED_PAGE": "Hosted Page",
        "DEVICE_SEARCH": "Device Search",
        "MY_SUBSCRIPTIONS": "My Subscriptions",
        "REPORTS": "Reports",
        "MY_PREFERENCES": "My Preferences",
        "ADD_DEVICE": "Add Device",
        "ADD_DEVICE_SOFTWARE_KEY_ASSIGNMENT": "Add Device Software and Key Assignment",
        "GLOBAL_SOFTWARE_KEY_ASSIGNMENT": "Global Software and Key Assignment",
        "DEVICE_SOFTWARE_KEY_ASSIGNMENT": "Device Software and Key Assignment",
        "DOWNLOAD_LIBRARY": "Download Library",
        "ADD_PACKAGE": "Add Package",
        "EDIT_PACKAGE": "Edit Package",
        "SCHEDULE_DOWNLOAD": "Schedule Download",
        "DELETED_DEVICES": "Deleted Devices",
        "ADD_REFERENCE_SET": "Add Reference Set",
        "EDIT_REFERENCE_SET": "Edit Reference Set",
        "REFERENCE_SET_DETAILS": "Reference Set View Details",
        "VHQ_FEATURES": ["User", "Hierarchy", "Device", "Manual Downloads", "Reports", "Group", "Parameter", "Content", "Online Key", "Offline Key", "Basic Diagnostics", "BasicAlerts", "AdvanceAlerts", "Notifications", "Security", "Auto Downloads", "Care", "Support", "Basic Integration Platform", "Generate Device Admin Code", "Device Initiated Downloads", "Basic Reference Set", "Software Assignment to Device"],
        "LICENSE_FEATURE_BASICALERTS": "BasicAlerts",
        "LICENSE_FEATURE_BASIC_ALERTS": "Basic Alerts",
        "LICENSE_FEATURE_ADVANCEDALERTS": "AdvanceAlerts",
        "LICENSE_FEATURE_ALERTS": "Alerts",

        //JQXTHEME
        "JQX-GRID-THEME": 'material'
    };

    return {
        get: function (name) { return private[name]; }
    };

})();


