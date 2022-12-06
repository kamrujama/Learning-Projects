define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {

    //validation
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function viewModelPackageDownloadQualifiers() {
        var self = this;

        //Draggable function
        $('#mdlPackageQualifiersHeader').mouseup(function () {
            $("#mdlPackageQualifiers").draggable({ disabled: true });
        });

        $('#mdlPackageQualifiersHeader').mousedown(function () {
            $("#mdlPackageQualifiers").draggable({ disabled: false });
        });

        self.chkSyncVerification = ko.observable(true);
        self.chkOptionalPackage = ko.observable(false);
        self.applicationItems = ko.observableArray([]);
        self.applicationData = ko.observableArray();
        self.removeApplicationData = ko.observableArray();
        self.postInstallActions = ko.observableArray();
        self.postInstallActionName = ko.observable();
        self.conditionalOperators = ko.observableArray();
        var selectedPackageId = qualifierPackageId;
        var selectedPackageName = qualifierPackageName;
        var selectedPackageVersion = qualifierPackageVersion;
        var isPackageDAEnabled = qualifierPackageIsDAEnabled;
        var qualifiers = new Array();

        var conditionalOperators = [
            { 'Id': '0', 'QualifierObjectType': 'ApplicationVersion', 'Name': 'Application Version =', 'Operator': 'Equal To' },
            { 'Id': '1', 'QualifierObjectType': 'Application', 'Name': 'Application Name Exists', 'Operator': 'Exists' },
            { 'Id': '2', 'QualifierObjectType': 'Application', 'Name': 'Application Name Not Exists', 'Operator': 'Not Exists' },
            { 'Id': '3', 'QualifierObjectType': 'ApplicationVersion', 'Name': 'Application Version !=', 'Operator': 'Not Equal To' },
            { 'Id': '4', 'QualifierObjectType': 'ApplicationVersion', 'Name': 'Application Version <', 'Operator': 'Less Than' },
            { 'Id': '5', 'QualifierObjectType': 'ApplicationVersion', 'Name': 'Application Version >', 'Operator': 'Greater Than' },
            { 'Id': '6', 'QualifierObjectType': 'ApplicationVersion', 'Name': 'Application Version <=', 'Operator': 'Less Than Equal To' },
            { 'Id': '7', 'QualifierObjectType': 'ApplicationVersion', 'Name': 'Application Version >=', 'Operator': 'Greater Than Equal To' },
            { 'Id': '8', 'QualifierObjectType': 'ApplicationVersion', 'Name': 'Application Name Not Exists Or Application Version <', 'Operator': 'Not Exists Or Less Than' },
            { 'Id': '9', 'QualifierObjectType': 'ApplicationVersion', 'Name': 'Application Name Not Exists Or Application Version >', 'Operator': 'Not Exists Or Greater Than' },
            { 'Id': '10','QualifierObjectType': 'ApplicationVersion', 'Name': 'Application Name Not Exists Or Application Version <=', 'Operator': 'Not Exists Or Less Than Equal To' },
            { 'Id': '11','QualifierObjectType': 'ApplicationVersion', 'Name': 'Application Name Not Exists Or Application Version >=', 'Operator': 'Not Exists Or Greater Than Equal To' },
            { 'Id': '12', 'QualifierObjectType': 'BundleVersion', 'Name': 'Bundle Version =', 'Operator': 'Equal To' },
            { 'Id': '13', 'QualifierObjectType': 'Bundle', 'Name': 'Bundle Name Exists', 'Operator': 'Exists' },
            { 'Id': '14', 'QualifierObjectType': 'Bundle', 'Name': 'Bundle Name Not Exists', 'Operator': 'Not Exists' },
            { 'Id': '15', 'QualifierObjectType': 'BundleVersion', 'Name': 'Bundle Version !=', 'Operator': 'Not Equal To' },
            { 'Id': '16', 'QualifierObjectType': 'BundleVersion', 'Name': 'Bundle Version <', 'Operator': 'Less Than' },
            { 'Id': '17', 'QualifierObjectType': 'BundleVersion', 'Name': 'Bundle Version >', 'Operator': 'Greater Than' },
            { 'Id': '18', 'QualifierObjectType': 'BundleVersion', 'Name': 'Bundle Version <=', 'Operator': 'Less Than Equal To' },
            { 'Id': '19', 'QualifierObjectType': 'BundleVersion', 'Name': 'Bundle Version >=', 'Operator': 'Greater Than Equal To' },
            { 'Id': '20', 'QualifierObjectType': 'BundleVersion', 'Name': 'Bundle Name Not Exists Or Bundle Version <', 'Operator': 'Not Exists Or Less Than' },
            { 'Id': '21', 'QualifierObjectType': 'BundleVersion', 'Name': 'Bundle Name Not Exists Or Bundle Version >', 'Operator': 'Not Exists Or Greater Than' },
            { 'Id': '22', 'QualifierObjectType': 'BundleVersion', 'Name': 'Bundle Name Not Exists Or Bundle Version <=', 'Operator': 'Not Exists Or Less Than Equal To' },
            { 'Id': '23', 'QualifierObjectType': 'BundleVersion', 'Name': 'Bundle Name Not Exists Or Bundle Version >=', 'Operator': 'Not Exists Or Greater Than Equal To' }
        ];
        var postInstallActions = [
            {
                'action': 'Default'
            },
            {
                'action': 'None'
            },
            {
                'action': 'Restart'
            },
            {
                'action': 'Reboot'
            }
        ];
        self.conditionalOperators(conditionalOperators);
        self.postInstallActions(postInstallActions);
        self.postInstallAction = ko.observableArray();

        init();
        function init() {
            if (!_.isEmpty(globalSelectedReferenceSet)) {
                setValuesAsReadOnly();
            }

            if (!qualifierPackageIsDAEnabled) {
                $('#checkboxSyncVerification').prop('disabled', true);
                self.chkSyncVerification(false);
            }
            if (!_.isEmpty(globalPackageDownloadOptions)) {
                self.chkSyncVerification(globalPackageDownloadOptions.IsSyncEnabled);
                self.chkOptionalPackage(!globalPackageDownloadOptions.IsMandatory);
                $("#loadingDiv").show();

                if (!_.isEmpty(globalPackageDownloadOptions.Qualifiers) && globalPackageDownloadOptions.Qualifiers.length > 0) {
                    qualifiers = globalPackageDownloadOptions.Qualifiers;
                    for (var i = 0; i < qualifiers.length; i++) {
                        var item = qualifiers[i];
                        var applicationObject = new Object();
                        applicationObject.QualifierObjectType = item.QualifierObjectType;
                        applicationObject.QualifierObject = item.QualifierObject;
                        applicationObject.ComparisonOperator = item.ComparisonOperator;
                        applicationObject.Value = item.Value;
                        applicationObject.isAllowed = _.isEmpty(globalSelectedReferenceSet) ? true : false;
                        self.applicationItems.push(applicationObject);
                    }
                }
                setTimeout(setValues, 1000);
            }
        }

        function setValuesAsReadOnly() {
            $('#checkboxSyncVerification').prop('disabled', true);
            $('#checkboxOptionalPackage').prop('disabled', true);
            $('#divAddconditions').hide();
            $('#btnSaveDownloadQualifiers').hide();
            $('#btnCancelDownloadQualifiers').hide();
            $('#colRemoveCondition').css('display', 'none');
            $('#divPostInstallActionddl').css('display', 'none');
            $('#divPostInstallActionLabel').css('display', 'block');
        }

        function setValues() {
            if (globalPackageDownloadOptions.PostInstallAction != 'Default') {
                $("#postInstalActionInfoTag").hide();
            }
            if (!_.isEmpty(globalSelectedReferenceSet)) {
                self.postInstallAction(globalPackageDownloadOptions.PostInstallAction);
            } else {
                $("#selectPostInstallAction").val(globalPackageDownloadOptions.PostInstallAction).prop("selected", "selected");
                $("#selectPostInstallAction").trigger('chosen:updated');
            }
            if (!_.isEmpty(globalPackageDownloadOptions.Qualifiers) && globalPackageDownloadOptions.Qualifiers.length > 0) {
                for (var i = 0; i < globalPackageDownloadOptions.Qualifiers.length; i++) {
                    var item = globalPackageDownloadOptions.Qualifiers[i];
                    var source = _.where(conditionalOperators, { Operator: item.ComparisonOperator, QualifierObjectType: item.QualifierObjectType });
                    if (!_.isEmpty(source) && source.length > 0) {
                        $("#selectComparisonOperator" + [i]).val(source[0].Id).prop("selected", "selected");
                        $("#selectComparisonOperator" + [i]).trigger('chosen:updated');
                    }
                    $("#txtAppNameValue" + [i]).val(item.QualifierObject);
                    $("#txtAppVersionValue" + [i]).val(item.Value);
                    if (item.ComparisonOperator === 'Exists' || item.ComparisonOperator === 'Not Exists') {
                        $("#txtAppVersionValue" + [i]).prop('disabled', true);
                    }

                    if (!_.isEmpty(globalSelectedReferenceSet)) {
                        $("#selectComparisonOperator" + [i]).prop('disabled', true);
                        $("#txtAppNameValue" + [i]).prop('disabled', true);
                        $("#txtAppVersionValue" + [i]).prop('disabled', true);
                    }
                }
            }
            $("#loadingDiv").hide();
        }

        self.handleCloseEvent = function (unloadTempPopup) {
            $("#modalReferenceSetAdvancedOptions").modal('hide');
            unloadTempPopup('unloadTemplate', 'modalPackageDownloadQualifiers');
        }

        self.checkSyncVerification = function () {

        }

        self.onChangeCondition = function (data, event, id, index) {
            var selectedCondition = conditionalOperators[$("#selectComparisonOperator" + index).find('option:selected').val()].Operator;
            if (!_.isEmpty(selectedCondition) && selectedCondition !== '') {
                if (selectedCondition === 'Exists' || selectedCondition === 'Not Exists') {
                    $("#txtAppVersionValue" + index).prop('disabled', true);
                    $("#txtAppVersionValue" + index).val('');
                } else {
                    $("#txtAppVersionValue" + index).prop('disabled', false);
                }
            }
        }

        self.addItems = function (item) {
            self.applicationItems.push({ QualifierObjectType: "ApplicationVersion", QualifierObject: "", ComparisonOperator: "", Value: "", isAllowed: _.isEmpty(globalSelectedReferenceSet) ? true : false });
        }

        self.removeItems = function (item) {
            //var retval = attributeValidation(self.applicationItems());
            //if (retval == null || retval == '') {
            //    $('#selectOperator').val($('#selectOperator > option:first').val()).change();
            //    $('#selectOperator').trigger("chosen:updated");
            //} else {
            //    openAlertpopup(1, 'Please enter some value');
            //}

            self.applicationItems.remove(item);
        }

        self.onChangeAction = function () {
            if ($("#selectPostInstallAction").find('option:selected').text() == "") {
                self.postInstallActionName(null);
            } else {
                if ($("#selectPostInstallAction").find('option:selected').text() == 'Default') {
                    $("#postInstalActionInfoTag").show();
                } else {
                    $("#postInstalActionInfoTag").hide();
                }
                self.postInstallActionName($("#selectPostInstallAction").find('option:selected').text());
            }
        }

        self.checkOptionalPackage = function () {

        }

        //checkerror
        function attributeValidation(items) {
            var retval = '';
            if (items.length > 0) {
                var id = '#txtAppVersionValue' + (items.length - 1) + '';
                if ($(id).val() == null || $(id).val() == '') {
                    retval = 'empty';
                } else {
                    retval = '';
                }
                if (retval == 'empty' && items[items.length - 1].QualifierObjectType == 'Application') {
                    var id = '#txtAppVersionValue' + (items.length - 1) + '';
                    if ($(id).val() == null || $(id).val() == '') {
                        retval = 'empty';
                    } else {
                        retval = '';
                    }
                }
            }
            return retval;
        }

        function checkerror() {
            var retval = '';
            var applicationItems = self.applicationItems();
            if (applicationItems.length > 0) {
                for (var i = 0; i < applicationItems.length; i++) {
                    if ($("#txtAppNameValue" + i).val().trim() == '' && $("#txtAppVersionValue" + i).val().trim() == '') {
                        retval = 'blank application details';
                        return retval;
                    }
                    if (applicationItems[i].QualifierObjectType == 'Application') {
                        if (applicationItems[i].ComparisonOperator === 'Exists' || applicationItems[i].ComparisonOperator === 'Not Exists') {
                            if ($("#txtAppNameValue" + i).val().trim() != '') {
                                retval = '';
                            } else {
                                openAlertpopup(1, 'please_enter_application_name_value');
                                retval = 'blank attribute value';
                                return retval;
                            }
                        } else {
                            if ($("#txtAppVersionValue" + i).val().trim() != '') {
                                retval = '';
                            } else {
                                openAlertpopup(1, 'please_enter_application_version_value');
                                retval = 'blank attribute value';
                                return retval;
                            }
                        }
                    }
                }
            }
            else {
                retval = '';
            }
            return retval;
        }

        function applicationsArray(items) {
            var applicationList = new Array();
            var itemObject = new Object();

            for (var i = 0; i < items.length; i++) {
                itemObject = new Object();
                var packageType = $("#selectComparisonOperator" + [i]).find('option:selected').text();
                if (!_.isEmpty(packageType) && packageType.includes('Bundle')) {
                    itemObject.QualifierObjectType = 'BundleVersion';
                } else if (!_.isEmpty(packageType) && packageType.includes('Application')) {
                    itemObject.QualifierObjectType = 'ApplicationVersion';
                }                
                itemObject.QualifierObject = $("#txtAppNameValue" + [i]).val();
                itemObject.ComparisonOperator = conditionalOperators[$("#selectComparisonOperator" + [i]).find('option:selected').val()].Operator;
                itemObject.PackageType = $("#selectComparisonOperator" + [i]).find('option:selected').text();
                
                if (itemObject.ComparisonOperator === 'Exists' || itemObject.ComparisonOperator === 'Not Exists') {
                    itemObject.QualifierObjectType = itemObject.QualifierObjectType === 'ApplicationVersion' ? 'Application' : 'Bundle';
                }
                itemObject.Value = $("#txtAppVersionValue" + [i]).val();
                applicationList.push(itemObject)
            }
            return applicationList;
        }

        self.saveDownloadQualifiers = function (unloadTempPopup) {
            var retval = checkerror();
            if (retval == null || retval == "") {
                var applications = applicationsArray(self.applicationItems());
                var downloadOptions = new Object();
                downloadOptions.IsSyncEnabled = $("#checkboxSyncVerification").is(':checked') ? true : false;
                downloadOptions.IsMandatory = $("#checkboxOptionalPackage").is(':checked') ? false : true;
                downloadOptions.PostInstallAction = $("#selectPostInstallAction").find('option:selected').text();
                downloadOptions.Qualifiers = applications;
                downloadOptions.isConditionChecked = (!_.isEmpty(applications) && applications.length > 0) ? true : false;
                downloadOptions.PackageId = selectedPackageId;
                downloadOptions.PackageName = selectedPackageName;
                downloadOptions.FileVersion = selectedPackageVersion;
                downloadOptions.IsEnabledForAutomation = isPackageDAEnabled;
                var downloadOptionSource = _.where(globalAdvancedOptionsApplications, { PackageId: selectedPackageId });
                if (_.isEmpty(downloadOptionSource)) {
                    globalAdvancedOptionsApplications.push(downloadOptions);
                } else if (!_.isEmpty(downloadOptionSource) && downloadOptionSource.length > 0) {
                    var index = globalAdvancedOptionsApplications.indexOf(downloadOptionSource[0]);
                    globalAdvancedOptionsApplications[index] = downloadOptions;
                }
                unloadTempPopup('unloadTemplate', 'modalPackageDownloadQualifiers');
                $('#btnSaveRFS').removeAttr('disabled');
                $('#btnAddRFS').removeAttr('disabled');
            } else if (retval == 'blank application details') {
                openAlertpopup(1, 'please_enter_application_details');
            } else {
                openAlertpopup(1, 'please_enter_application_version_value');
            }
        }

        seti18nResourceData(document, resourceStorage);
    }
});