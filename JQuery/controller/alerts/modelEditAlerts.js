define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {

    var lang = getSysLang();
    //validation
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function modelEditAlertsOpen() {

    
        var self = this;
       

        //Check Rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        //Draggable function
        $('#mdlEditAlertHeader').mouseup(function () {
            $("#mdlEditAlert").draggable({ disabled: true });
        });

        $('#mdlEditAlertHeader').mousedown(function () {
            $("#mdlEditAlert").draggable({ disabled: false });
        });
        ////////////////

        self.previousNotes = ko.observable();
        self.showPreviousNote = ko.observable();

        var jsonDateValue = CreatJSONDateLocal(globalVariableForEditAlerts.EventReceivedDate);

        self.alertName = globalVariableForEditAlerts.AlertName;        
        self.eventReceivedDate = jsonDateConversion(jsonDateValue, LONG_DATETIME_FORMAT_AMPM);
        self.modelName = globalVariableForEditAlerts.ModelName;
        self.severity = globalVariableForEditAlerts.Severity;
        self.serialNumber = globalVariableForEditAlerts.SerialNumber;
        self.deviceId = globalVariableForEditAlerts.DeviceId;
        self.notes = globalVariableForEditAlerts.Notes;
        self.UniqueDeviceId = globalVariableForEditAlerts.UniqueDeviceId;
        self.DeviceAlertId = globalVariableForEditAlerts.DeviceAlertId;
        self.AlertTypeId = globalVariableForEditAlerts.AlertTypeId;
        self.IsNoteExists = globalVariableForEditAlerts.IsNoteExists;
        var gridId = globalVariableForEditAlerts.gID;
        getAlertNotes(self.DeviceAlertId, self.previousNotes);

        if (self.IsNoteExists == true) {
            self.showPreviousNote(true);
        }
        else {
            self.showPreviousNote(false);
        }

        function getAlertNotes(DeviceAlertId, previousNotes) {
            var deviceAlertId = DeviceAlertId;
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.notes) {
                            data.notes = $.parseJSON(data.notes);
                        }
                        previousNotes(data.notes);
                    } 
                }
            }

            var method = 'GetAlertNotes';
            var params = '{"token":"' + TOKEN() + '" ,"deviceAlertId":"' + deviceAlertId + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        // save and closed alert
        self.closeAlert = function (alertModelComponent) {
            var setAlertReq = new Object();
            var deviceAlerts = new Array();
            var eDeviceAlert = new Object();

            eDeviceAlert.DeviceAlertId = self.DeviceAlertId;
            eDeviceAlert.Notes = $("#newNotes").val();
            eDeviceAlert.Status = 1;
            eDeviceAlert.UniqueDeviceId = self.UniqueDeviceId;
            deviceAlerts.push(eDeviceAlert);

            setAlertReq.AlertTypeId = self.AlertTypeId;
            setAlertReq.CallType = ENUM.get("CALLTYPE_NONE");
            setAlertReq.DeviceId = self.deviceId;
            setAlertReq.DeviceSearch = null;
            setAlertReq.UnSelectedItemIds = null;
            setAlertReq.Notes = $("#newNotes").val();
            setAlertReq.Status = "Closed";
            setAlertReq.UniqueDeviceId = 0;
            setAlertReq.DeviceAlerts = deviceAlerts;

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        //hide poup                       
                        gridFilterClear(gridId);
                        $("#alertModel").modal('hide');
                        alertModelComponent('unloadTemplate');
                        openAlertpopup(0, 'alert_changes_saved_successfully');
                    } 
                }
            }

            var method = 'SetAlert';
            var params = '{"token":"' + TOKEN() + '" ,"setAlertReq":' + JSON.stringify(setAlertReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        // Save Changes
        self.saveAlert = function (alertModelComponent) {
            var setAlertReq = new Object();
            var deviceAlerts = new Array();
            var eDeviceAlert = new Object();
            var UnSelectedItemIds = new Object();
            eDeviceAlert.DeviceAlertId = self.DeviceAlertId;
            eDeviceAlert.Notes = $("#newNotes").val();
            eDeviceAlert.Status = 0;
            eDeviceAlert.UniqueDeviceId = self.UniqueDeviceId;
            deviceAlerts.push(eDeviceAlert);

            setAlertReq.AlertTypeId = self.AlertTypeId;
            setAlertReq.CallType = ENUM.get("CALLTYPE_NONE");
            setAlertReq.DeviceId = null;
            setAlertReq.DeviceSearch = null;
            setAlertReq.UnSelectedItemIds = UnSelectedItemIds;
            setAlertReq.Notes = $("#newNotes").val();
            setAlertReq.Status = "Open";
            setAlertReq.UniqueDeviceId = 0;
            setAlertReq.DeviceAlerts = deviceAlerts;

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        //hide poup
                        gridFilterClear(gridId);
                        alertModelComponent('unloadTemplate');
                        $("#alertModel").modal('hide');
                        openAlertpopup(0, 'alert_changes_saved_successfully');
                    } 
                }
            }

            var method = 'SetAlert';
            var params = '{"token":"' + TOKEN() + '" ,"setAlertReq":' + JSON.stringify(setAlertReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

        }

        // convert severity value
        function getSeverity(value) {
            retval = "";
            if (value == 0) {
                retval = "Low";
            } else if (value == 1) {
                retval = "Medium";
            } else if (value == 2) {
                retval = "High";
            } else if (value == 3) {
                retval = "All";
            }

            return retval;
        }

        seti18nResourceData(document, resourceStorage);
    }
});