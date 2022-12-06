var VHQFeatures = new Array();
var licenseSource = new Object();
var rightSource = new Object();

function getLicensedFeatures(features) {
    VHQFeatures = AppConstants.get('VHQ_FEATURES');
    if (!_.isEmpty(VHQFeatures) && VHQFeatures.length > 0 && !_.isEmpty(features) && features.length > 0) {
        licenseSource = new Object();
        for (var i = 0; i < VHQFeatures.length; i++) {
            var featureName = 'is' + VHQFeatures[i].split(' ').join('');
            var featureValue = (featureName + 'Licensed');

            licenseSource[featureValue] = false;
            if (features.indexOf(VHQFeatures[i]) > -1) {
                licenseSource[featureValue] = true;
            }
        }
        getUserRights();
    }
}

function getUserRights() {
    rightSource = new Object();
    if (!_.isEmpty(userRightData) && userRightData.length > 0) {
        for (var i = 0; i < userRightData.length; i++) {
            var rightName = 'is' + userRightData[i].RightName.split(' ').join('');
            var viewRight = (rightName + 'ViewAllowed');
            var modifyRight = (rightName + 'ModifyAllowed');
            var deleteRight = (rightName + 'DeleteAllowed');

            rightSource[viewRight] = userRightData[i]['IsviewAllowed'];
            rightSource[modifyRight] = userRightData[i]['IsModifyAllowed'];
            rightSource[deleteRight] = userRightData[i]['IsDeleteAllowed'];
        }
    }
}

function getLicenseForMenu(id, rootParent, childParent, parent, childId, menu) {
    var source = _.where(menu, { id: id });                                              //main menu
    if (_.isEmpty(source)) {
        if (rootParent === 'BlankCustomScreen')
            return true;

        var parentMenu = _.where(menu, { parentId: rootParent });
        if (!_.isEmpty(parentMenu) && parentMenu.length > 0) {
            source = _.where(parentMenu[0].children, { id: id });
            if (!_.isEmpty(source) && id !== "standardReports") {                       //sub menu
                return true;
            } else {
                if (id !== "standardReports") {
                    var childParentMenu = _.where(parentMenu[0].children, { childParentId: childParent });
                    if (!_.isEmpty(childParentMenu) && childParentMenu.length > 0) {
                        source = _.where(childParentMenu[0].Subchild, { id: id });      //child menu
                        if (!_.isEmpty(source)) {
                            return true;
                        }
                    }
                } else {                        //Standard & Custom Reports
                    if (parent === 'Custom') {    //for Custom Reports, routing id is standardReports, so changing here
                        id = "customReports";
                    }
                    var childParentMenu = _.where(parentMenu[0].children, { id: id });
                    if (!_.isEmpty(childParentMenu) && childParentMenu.length > 0) {
                        var subChild = _.where(childParentMenu[0].Subchild, { id: childParent });
                        if (!_.isEmpty(subChild) && subChild.length > 0) {
                            source = _.where(subChild[0].subChildChildern, { id: parseInt(childId) });
                            if (!_.isEmpty(source)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
    return true;
}

function getDashboardJSON() {
    var retval = new Array();
    $.ajax({
        type: "GET",
        url: "assets/json/DyanamicDashbrod(new).json",
        dataType: 'json',
        async: false,
        success: function (data) {
            if (data)
                retval = data.DashboardWidgets;
        },
        error: function (jqXHR, status, error) {
            if (jqXHR != null) {
                ajaxErrorHandler(jqXHR, status, error);
                if (jqXHR.status != 401) {
                    null;
                }
            } else {
                null;
            }
        }
    });
    return retval;
}

function getDashboardWidgets(dashboardWidgets) {
    if (!_.isEmpty(licenseSource)) {
        if (!licenseSource.isDeviceLicensed || (!licenseSource.isBasicAlertsLicensed && !licenseSource.isAdvanceAlertsLicensed) || !licenseSource.isManualDownloadsLicensed || !licenseSource.isAutoDownloadsLicensed) {
            if (!_.isEmpty(dashboardWidgets) && dashboardWidgets.length > 0) {
                for (var i = 0; i < dashboardWidgets.length; i++) {
                    if (dashboardWidgets[i].Widget.Feature === 'Device') {
                        if (!licenseSource.isDeviceLicensed || !rightSource.isDevicesViewAllowed) {     //Device License & Right check
                            dashboardWidgets.splice(i, 1);
                            i--;
                        }
                    } else if (dashboardWidgets[i].Widget.Feature === 'Alert') {
                        if ((!licenseSource.isBasicAlertsLicensed && !licenseSource.isAdvanceAlertsLicensed) || !rightSource.isAlertsViewAllowed) {       //Alert License & Right check
                            dashboardWidgets.splice(i, 1);
                            i--;
                        }
                    } else if (dashboardWidgets[i].Widget.Feature === 'Downloads') {                    //Manual/Auto Downloads License & Download Schedule Right check
                        if ((!licenseSource.isManualDownloadsLicensed && !licenseSource.isAutoDownloadsLicensed) || !rightSource.isDownloadScheduleViewAllowed) {
                            dashboardWidgets.splice(i, 1);
                            i--;
                        }
                    }
                }
            }
        }
    }
    return dashboardWidgets;
}

function setScreenControls(screen) {
    switch (screen) {
        case AppConstants.get('DEVICE_SEARCH'): {
            if (!rightSource.isDevicesDeleteAllowed) {
                $("#actionLabel").hide();
                $("#deleteMenu").hide();
            }

            if (!rightSource.isDevicesModifyAllowed) {
                //Actions
                $("#copyMenu").hide();

                //Device Status
                $("#statusMenu").hide();
                $("#statusActiveTag").hide();
                $("#statusInactiveTag").hide();
                $("#statusPendingTag").hide();

                //Hierarchy
                $("#hierarchyMenu").hide();

                //Groups
                $("#groupsMenu").hide();
                $("#groupAssign").hide();
                $("#groupUnassign").hide();

                //Parameters
                $("#parametersMenu").hide();
                $("#editParameters").hide();
                $("#activateParameters").hide();

                //Software & Key Assignment
                $("#softwareAssignmentDiv").hide();

                //Export
                $("#exportMenu").hide();
                $("#exportToXmlBtn").hide();
                $("#exportToRSACertBtn").hide();
            }

            //Schedule
            if (!rightSource.isContentScheduleModifyAllowed && !rightSource.isDiagnosticActionsModifyAllowed
                && (!rightSource.isDownloadLibraryViewAllowed || !rightSource.isDownloadScheduleModifyAllowed)) {
                $("#scheduleMenu").hide();
            }

            if (!rightSource.isDevicesModifyAllowed && !rightSource.isDevicesDeleteAllowed && !rightSource.isContentScheduleModifyAllowed
                && !rightSource.isDiagnosticActionsModifyAllowed && (!rightSource.isDownloadLibraryViewAllowed
                || !rightSource.isDownloadScheduleModifyAllowed)) {
                $("#noPrivilegeSpan").show();
                break;
            }

            if (!_.isEmpty(licenseSource)) {
                //Schedule
                if (!licenseSource.isContentLicensed && !licenseSource.isBasicDiagnosticsLicensed && !licenseSource.isManualDownloadsLicensed) {
                    $("#scheduleMenu").hide();
                } else {                    
                    if (!licenseSource.isContentLicensed || (!rightSource.isContentScheduleModifyAllowed)) {
                        $("#contentScheduleMenu").hide();
                    }
                    if (!licenseSource.isBasicDiagnosticsLicensed || (!rightSource.isDiagnosticActionsModifyAllowed)) {
                        $("#diagnosticScheduleMenu").hide();
                    }
                    if ((!licenseSource.isManualDownloadsLicensed) || (!rightSource.isDownloadLibraryViewAllowed || !rightSource.isDownloadScheduleModifyAllowed)) {
                        $("#downloadScheduleMenu").hide();
                    }
                }

                //Hierarchy
                if (!licenseSource.isHierarchyLicensed || !rightSource.isGroupsandHierarchiesModifyAllowed) {
                    $("#hierarchyMenu").hide();
                }

                //Groups
                if (!licenseSource.isGroupLicensed || !rightSource.isGroupsandHierarchiesModifyAllowed) {
                    $("#groupsMenu").hide();
                    $("#groupAssign").hide();
                    $("#groupUnassign").hide();
                }

                //Parameter
                if (!licenseSource.isParameterLicensed) {
                    $("#parametersMenu").hide();
                    $("#editParameters").hide();
                    $("#activateParameters").hide();
                }

                //Software & Key Assignment
                if (!licenseSource.isSoftwareAssignmenttoDeviceLicensed) {
                    $("#softwareAssignmentDiv").hide();
                } else {
                    if (licenseSource.isOnlineKeyLicensed) {
                        $("#spanSoftwareAndKeys").text(i18n.t('software_key_assignment', { lng: lang }));
                        $("#assignmentTitle").text(i18n.t('software_key_assignment', { lng: lang }));
                    } else {
                        $("#spanSoftwareAndKeys").text(i18n.t('software_assignment', { lng: lang }));
                        $("#assignmentTitle").text(i18n.t('software_assignment', { lng: lang }));
                    }

                }
            }
            break;
        }

        case AppConstants.get('MY_SUBSCRIPTIONS'): {
            if (!licenseSource.isNotificationsLicensed) {
                $("#liMySubscriptions").hide();
                $("#btnUnsubscribe").hide();
            }
            break;
        }

        case AppConstants.get('REPORTS'): {
            if (!licenseSource.isNotificationsLicensed) {
                $("#btnSubscribe").hide()
            }
            break;
        }

        case AppConstants.get('MY_PREFERENCES'): {
            if ((!licenseSource.isBasicAlertsLicensed && !licenseSource.isAdvanceAlertsLicensed) || !rightSource.isAlertsViewAllowed) {
                $("#tabAlertSubscriptions").hide();
            }
            break;
        }

        case AppConstants.get('ADD_DEVICE'): {
            if (!licenseSource.isSoftwareAssignmenttoDeviceLicensed) {
                $("#formAssignment").hide();
                break;
            }            
            if (!licenseSource.isSoftwareAssignmenttoDeviceLicensed && !licenseSource.isOnlineKeyLicensed) {
                $("#formAssignment").hide();
            } else if (!licenseSource.isSoftwareAssignmenttoDeviceLicensed && licenseSource.isOnlineKeyLicensed) {
                $("#formAssignment").show();
                $("#lblAssignment").text(i18n.t('key_assignment', { lng: lang }));
                $("#anchorAssignmentID").text(i18n.t('key_assignment', { lng: lang }));
            } else if (licenseSource.isSoftwareAssignmenttoDeviceLicensed && !licenseSource.isOnlineKeyLicensed) {
                $("#formAssignment").show();
                $("#lblAssignment").text(i18n.t('software_assignment', { lng: lang }));
                $("#anchorAssignmentID").text(i18n.t('software_assignment', { lng: lang }));
            } else {
                $("#formAssignment").show();
                $("#lblAssignment").text(i18n.t('software_key_assignment', { lng: lang }));
                $("#anchorAssignmentID").text(i18n.t('software_key_assignment', { lng: lang }));
            }
            break;
        }

        case AppConstants.get('ADD_DEVICE_SOFTWARE_KEY_ASSIGNMENT'): {
            $("#noKeySupportMessageDiv").hide();
            if (!licenseSource.isAutoDownloadsLicensed) {
                $("#downloadAutomationDiv").hide();
                $("#downloadScheduleOptionsDiv").hide();
                $("#rdbInheritDiv").hide();
            }
            if (!licenseSource.isSoftwareAssignmenttoDeviceLicensed && licenseSource.isOnlineKeyLicensed) {
                $("#assignmentTitle").text(i18n.t('key_assignment', { lng: lang }));
                $("#radioPackagesAndKeys").text(i18n.t('key_profiles', { lng: lang }));                
                $("#referenceSetRadioButton").hide();
                $("#refernceSetGrid").hide();
                $("#packagesGrid").show();
                $("#accordionSoftwarePackages").hide();

                $("#PKcollapseOne").removeClass("in");
                $("#PKcollapseTwo").addClass("in");
                $("#PKcollapseOne").attr("aria-expanded", "false");
                $("#PKcollapseTwo").attr("aria-expanded", "true");
            } else if (licenseSource.isSoftwareAssignmenttoDeviceLicensed && !licenseSource.isOnlineKeyLicensed) {
                $("#assignmentTitle").text(i18n.t('software_assignment', { lng: lang }));
                $("#radioPackagesAndKeys").text(i18n.t('packages', { lng: lang }));
                $("#accordionKeyProfiles").hide();
            } else {
                $("#assignmentTitle").text(i18n.t('software_key_assignment', { lng: lang }));
                $("#radioPackagesAndKeys").text(i18n.t('packages_and_key_profiles', { lng: lang }));
            }
            break;
        }

        case AppConstants.get('GLOBAL_SOFTWARE_KEY_ASSIGNMENT'): {
            if (!licenseSource.isSoftwareAssignmenttoDeviceLicensed) {
                $("#softwareAssignmentDiv").hide();
                break;
            }
            if (!licenseSource.isAutoDownloadsLicensed) {
                $("#downloadAutomationDiv").hide();
                $("#downloadScheduleOptionsDiv").hide();
                $("#rdbInheritDiv").hide();
            }
            if (licenseSource.isSoftwareAssignmenttoDeviceLicensed && licenseSource.isDeviceInitiatedDownloadsLicensed) {
                $("#rdblabelParentReferenceSet").show();
            }
            if (licenseSource.isSoftwareAssignmenttoDeviceLicensed && !licenseSource.isOnlineKeyLicensed) {
                $("#assignmentTitle").text(i18n.t('software_assignment', { lng: lang }));
                $("#radioPackagesAndKeys").text(i18n.t('packages', { lng: lang }));
                $("#accordionKeyProfiles").hide();
                $("#noKeySupportMessageDiv").hide();
            } else {
                $("#assignmentTitle").text(i18n.t('software_key_assignment', { lng: lang }));
                $("#radioPackagesAndKeys").text(i18n.t('packages_and_key_profiles', { lng: lang }));
                $("#accordionKeyProfiles").hide();
                $("#noKeySupportMessageDiv").show();
            }
            break;
        }

        case AppConstants.get('DEVICE_SOFTWARE_KEY_ASSIGNMENT'): {
            $("#noKeySupportMessageDiv").hide();
            if (!licenseSource.isAutoDownloadsLicensed) {
                $("#downloadAutomationDiv").hide();
                $("#downloadScheduleOptionsDiv").hide();
                $("#rdbInheritDiv").hide();
            }            
            if (!licenseSource.isSoftwareAssignmenttoDeviceLicensed && licenseSource.isOnlineKeyLicensed) {
                $("#assignmentTitle").text(i18n.t('key_assignment', { lng: lang }));
                $("#radioPackagesAndKeys").text(i18n.t('key_profiles', { lng: lang }));
                $("#referenceSetRadioButton").hide();
                $("#refernceSetGrid").hide();

                $("#packagesGrid").show();
                $("#accordionSoftwarePackages").hide();

                $("#PKcollapseOne").removeClass("in");
                $("#PKcollapseTwo").addClass("in");
                $("#PKcollapseOne").attr("aria-expanded", "false");
                $("#PKcollapseTwo").attr("aria-expanded", "true");
            } else if (licenseSource.isSoftwareAssignmenttoDeviceLicensed && !licenseSource.isOnlineKeyLicensed) {
                $("#assignmentTitle").text(i18n.t('software_assignment', { lng: lang }));
                $("#radioPackagesAndKeys").text(i18n.t('packages', { lng: lang }));
                $("#accordionKeyProfiles").hide();
            } else {
                $("#assignmentTitle").text(i18n.t('software_key_assignment', { lng: lang }));
                $("#radioPackagesAndKeys").text(i18n.t('packages_and_key_profiles', { lng: lang }));
            }
            break;
        }

        case AppConstants.get('DOWNLOAD_LIBRARY'): {
            if (!licenseSource.isBasicReferenceSetLicensed) {
                $("#btnConfigureReferenceSet").hide();
            }
            break;
        }

        case AppConstants.get('ADD_PACKAGE'): {
            if (licenseSource.isParameterLicensed) {                
                $("#applicationsTabAddPackage").css("display", "block");
            }
            break;
        }

        case AppConstants.get('EDIT_PACKAGE'): {
            if (licenseSource.isParameterLicensed) {
                $("#applicationsTabEditPackage").css("display", "block");
            }
            break;
        }

        case AppConstants.get('SCHEDULE_DOWNLOAD'): {
            if (licenseSource.isSoftwareAssignmenttoDeviceLicensed) {
                $("#assignedFlowDiv").css("display", "block");
                if (licenseSource.isAutoDownloadsLicensed) {
                    $("#allSoftwareAndParameters").css("display", "block");
                    $("#differentialSoftwareAndParameters").css("display", "block");
                }
                if (licenseSource.isParameterLicensed) {
                    $("#onlyParametersDiv").css("display", "block");
                }
            }
            break;
        }

        case AppConstants.get('DELETED_DEVICES'): {
            if (rightSource.isDeviceHardDeleteDeleteAllowed) {
                $("#permanentDeleteMenu").css("display", "block");
            }
            break;
        }

        case AppConstants.get('ADD_REFERENCE_SET'): {
            if (licenseSource.isBasicReferenceSetLicensed && !licenseSource.isAutoDownloadsLicensed) {
                var source = _.where(referencesetContainers, { id: "deviceAttributesBreadCrumb" });
                if (!_.isEmpty(source) && source.length > 0) {
                    referencesetContainers.splice(referencesetContainers.indexOf(source[0]), 1);
                }
            }
            if (!licenseSource.isOnlineKeyLicensed) {
                $("#accordionKeyProfilesAddRFS").hide();
            }
            if (!licenseSource.isAutoDownloadsLicensed || !rightSource.isAdvancedSoftwareManagementModifyAllowed) {
                $("#colActionAddRFS").css("display", "none");
            }
            if (licenseSource.isDeviceInitiatedDownloadsLicensed && rightSource.isAdvancedSoftwareManagementModifyAllowed) {
                $("#parentReferenceSetTitleAddRFS").css("display", "block");
                $("#parentReferenceSetddlAddRFS").css("display", "block");
            }
            break;
        }

        case AppConstants.get('EDIT_REFERENCE_SET'): {
            if (licenseSource.isBasicReferenceSetLicensed && !licenseSource.isAutoDownloadsLicensed) {
                var source = _.where(referencesetContainers, { id: "deviceAttributesBreadCrumb" });
                if (!_.isEmpty(source) && source.length > 0) {
                    referencesetContainers.splice(referencesetContainers.indexOf(source[0]), 1);
                }
            }
            if (!licenseSource.isOnlineKeyLicensed) {
                $("#accordionKeyProfilesEditRFS").hide();
            }
            if (!licenseSource.isAutoDownloadsLicensed || !rightSource.isAdvancedSoftwareManagementModifyAllowed) {
                $("#colActionEditRFS").css("display", "none");
            }
            if (licenseSource.isDeviceInitiatedDownloadsLicensed && rightSource.isAdvancedSoftwareManagementModifyAllowed) {
                $("#parentReferenceSetTitleEditRFS").css("display", "block");
                $("#parentReferenceSetddlEditRFS").css("display", "block");
                $("#parentReferenceSetlabelEditRFS").css("display", "none");
            } else if (licenseSource.isDeviceInitiatedDownloadsLicensed && !rightSource.isAdvancedSoftwareManagementModifyAllowed) {
                $("#parentReferenceSetTitleEditRFS").css("display", "block");
                $("#parentReferenceSetlabelEditRFS").css("display", "block");
                $("#parentReferenceSetddlEditRFS").css("display", "none");                
            } else {
                $("#parentReferenceSetTitleEditRFS").css("display", "none");
                $("#parentReferenceSetddlEditRFS").css("display", "none");
                $("#parentReferenceSetlabelEditRFS").css("display", "none");
            }
            break;
        }

        case AppConstants.get('REFERENCE_SET_DETAILS'): {
            if (!licenseSource.isAutoDownloadsLicensed) {
                $("#colActionRFS").css("display", "none");
            }
            break;
        }

        default: {
            $("#errorDiv").show();
            $("#errorMessageDiv").text('Un-authorized access. Please contact VHQ Support team for help (DP5013).');
        }
    }
}