define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil) {

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function customAttributeViewModel() {
  
        var self = this;
        self.dataArray = ko.observableArray();        
    
        GetConfigurableValues();
        //----------------------------For Label-----------

        function GetConfigurableValues() {
           
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.genericConfigurations)
                            data.genericConfigurations = $.parseJSON(data.genericConfigurations);
                        for (var i = 0; i < data.genericConfigurations.length; i++) {
                            $("#label" + i).text(data.genericConfigurations[i].ConfigValue)
                        }
                    } 
                }
            }

            var method = 'GetConfigurationValues';
            var params = '{"category":"DeviceCustomAttributeLabel","token":"' + TOKEN() + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);


        }
        //----------------------------------------------

        var forCancelCheckObj = new Object();
        forCancelCheckObj.CustomField1 = koUtil.deviceOut.CustomField1;
        forCancelCheckObj.CustomField2 = koUtil.deviceOut.CustomField2;
        forCancelCheckObj.CustomField3 = koUtil.deviceOut.CustomField3;
        forCancelCheckObj.CustomField4 = koUtil.deviceOut.CustomField4;
        forCancelCheckObj.CustomField5 = koUtil.deviceOut.CustomField5;

        if (koUtil.deviceOut.length == 1) {
            forCancelCheckObj.CustomField1 = koUtil.deviceOut[0].CustomField1;
            forCancelCheckObj.CustomField2 = koUtil.deviceOut[0].CustomField2;
            forCancelCheckObj.CustomField3 = koUtil.deviceOut[0].CustomField3;
            forCancelCheckObj.CustomField4 = koUtil.deviceOut[0].CustomField4;
            forCancelCheckObj.CustomField5 = koUtil.deviceOut[0].CustomField5;
        }

        self.CustomField1 = ko.observable(forCancelCheckObj.CustomField1);
        self.CustomField2 = ko.observable(forCancelCheckObj.CustomField2);
        self.CustomField3 = ko.observable(forCancelCheckObj.CustomField3);
        self.CustomField4 = ko.observable(forCancelCheckObj.CustomField4);
        self.CustomField5 = ko.observable(forCancelCheckObj.CustomField5);

        self.dataArray(koUtil.deviceOut);
        var checkChangesFlg = 0;

        $("#customField1").on('change keyup paste', function () {
            if ($("#customField1").val() != forCancelCheckObj.CustomField1) {
                $('#saveCustomAttribute').removeAttr('disabled');
                $('#cancel').removeAttr('disabled');
            } else {
                checkCustomField();
            }
        });

        $("#customField2").on('change keyup paste', function () {
            if ($("#customField2").val() != forCancelCheckObj.CustomField2) {
                $('#saveCustomAttribute').removeAttr('disabled');
                $('#cancel').removeAttr('disabled');
            } else {
                checkCustomField();
            }
        });

        $("#customField3").on('change keyup paste', function () {
            if ($("#customField3").val() != forCancelCheckObj.CustomField3) {
                $('#saveCustomAttribute').removeAttr('disabled');
                $('#cancel').removeAttr('disabled');
            } else {
                checkCustomField();
            }
        });

        $("#customField4").on('change keyup paste', function () {
            if ($("#customField4").val() != forCancelCheckObj.CustomField4) {
                $('#saveCustomAttribute').removeAttr('disabled');
                $('#cancel').removeAttr('disabled');
            } else {
                checkCustomField();
            }
        });

        $("#customField5").on('change keyup paste', function () {
            if ($("#customField5").val() != forCancelCheckObj.CustomField5) {
                $('#saveCustomAttribute').removeAttr('disabled');
                $('#cancel').removeAttr('disabled');
            } else {
                checkCustomField();
            }
        });

        function checkCustomField() {
            if (($("#customField1").val() != forCancelCheckObj.CustomField1) || ($("#customField2").val() != forCancelCheckObj.CustomField2) || ($("#customField3").val() != forCancelCheckObj.CustomField3) || ($("#customField4").val() != forCancelCheckObj.CustomField4) || ($("#customField5").val() != forCancelCheckObj.CustomField5)) {
                $('#saveCustomAttribute').removeAttr('disabled');
                $('#cancel').removeAttr('disabled');
                return true;
            } else {
                $('#saveCustomAttribute').prop('disabled', true);
                $('#cancel').prop('disabled', true);
                return false;
            }
        }
                
        self.cancelCustomAttr = function () {
           
            $("#customField1").val(forCancelCheckObj.CustomField1);
            $("#customField2").val(forCancelCheckObj.CustomField2);
            $("#customField3").val(forCancelCheckObj.CustomField3);
            $("#customField4").val(forCancelCheckObj.CustomField4);
            $("#customField5").val(forCancelCheckObj.CustomField5);

            $('#saveCustomAttribute').prop('disabled', true);
            $('#cancel').prop('disabled', true);
        }
        self.customAttrSaveClick = function () {
            var checkChangesFlg = 0;
           
            if (($("#customField1").val() != forCancelCheckObj.CustomField1) || ($("#customField2").val() != forCancelCheckObj.CustomField2) || ($("#customField3").val() != forCancelCheckObj.CustomField3) || ($("#customField4").val() != forCancelCheckObj.CustomField4) || ($("#customField5").val() != forCancelCheckObj.CustomField5)) {
                    var checkChangesFlg = 1;
                }
            if (checkChangesFlg == 1) {
                var updateDeviceReq = new Object();
                var SelectedItemIds = '';
                var selectedItemIds = koUtil.deviceProfileUniqueDeviceId;
                var Device = new Object();
                Device.CustomField1 = $("#customField1").val();
                Device.CustomField2 = $("#customField2").val();
                Device.CustomField3 = $("#customField3").val();
                Device.CustomField4 = $("#customField4").val();
                Device.CustomField5 = $("#customField5").val();

                Device.DeviceSwapStatus = koUtil.deviceOut.DeviceSwapStatus;
                Device.Status = koUtil.deviceOut.Status;

                Device.HierarchyId = koUtil.HierarchyId;
                var serialNumber = koUtil.SerialNumber;
                Device.SerialNumber = serialNumber;
                Device.UniqueDeviceId = 0;

                Device.DeviceSearch = null;
                var Selector = new Object();//newo

                Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];

                Selector.UnSelectedItemIds = null
                var SubStatus = new Object(); //

                SubStatus.SubStatusId = koUtil.deviceOut.SubStatusId;

                SubStatus.SubStatusName = null;

                updateDeviceReq.SubStatus = SubStatus;
                updateDeviceReq.Selector = Selector;
                updateDeviceReq.Device = Device;
                function callbackFunction(data, error) {

                    if (data) {

                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                            openAlertpopup(0, 'custom_attributes_success');
                            checkChangesFlg = 0;
                            forCancelCheckObj.CustomField1 = $("#customField1").val();
                            forCancelCheckObj.CustomField2 = $("#customField2").val();
                            forCancelCheckObj.CustomField3 = $("#customField3").val();
                            forCancelCheckObj.CustomField4 = $("#customField4").val();
                            forCancelCheckObj.CustomField5 = $("#customField5").val();

                            koUtil.deviceOut.CustomField1 = forCancelCheckObj.CustomField1;
                            koUtil.deviceOut.CustomField2 = forCancelCheckObj.CustomField2;
                            koUtil.deviceOut.CustomField3 = forCancelCheckObj.CustomField3;
                            koUtil.deviceOut.CustomField4 = forCancelCheckObj.CustomField4;
                            koUtil.deviceOut.CustomField5 = forCancelCheckObj.CustomField5;
                            // UI refresh
                            if (koUtil.deviceOut.length == 1) {
                                koUtil.deviceOut[0].CustomField1 = forCancelCheckObj.CustomField1;
                                koUtil.deviceOut[0].CustomField2 = forCancelCheckObj.CustomField2;
                                koUtil.deviceOut[0].CustomField3 = forCancelCheckObj.CustomField3;
                                koUtil.deviceOut[0].CustomField4 = forCancelCheckObj.CustomField4;
                                koUtil.deviceOut[0].CustomField5 = forCancelCheckObj.CustomField5;
                            }

                            $('#saveCustomAttribute').prop('disabled', true);
                            $('#cancel').prop('disabled', true);
                        } else if (data.responseStatus.StatusCode == AppConstants.get('MODIFIED_OR_DELETED_DEVICE_ID')) {
                            openAlertpopup(1, data.responseStatus.StatusMessage);
                        }
                    }
                }

                var method = 'UpdateDevice';
                var params = '{"token":"' + TOKEN() + '","updateDeviceReq":' + JSON.stringify(updateDeviceReq) + '}';
                ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
            } else {

            }
        };

        seti18nResourceData(document, resourceStorage);
    }
});