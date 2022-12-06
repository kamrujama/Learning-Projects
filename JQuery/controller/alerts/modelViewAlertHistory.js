define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function modelViewAlertHistoryModel() {
   
        var self = this;

        //Draggable function
        $('#mdlViewHeader').mouseup(function () {
            $("#mdlViewAlertHistory").draggable({ disabled: true });
        });

        $('#mdlViewHeader').mousedown(function () {
            $("#mdlViewAlertHistory").draggable({ disabled: false });
        });
        /////////

        self.severityPopup = ko.observable();
        self.PreviousNotes = ko.observable();
      
        var jsonDateValue = CreatJSONDateLocal(globalVariableForAlertsHistory.EventReceivedDate);

        self.alertName = ko.observable(globalVariableForAlertsHistory.AlertName);      
        self.modelName = ko.observable(globalVariableForAlertsHistory.ModelName);
        self.severity = ko.observable(convertSeverity(globalVariableForAlertsHistory.Severity));
        self.serialNumber = ko.observable(globalVariableForAlertsHistory.SerialNumber);
        self.deviceId = ko.observable(globalVariableForAlertsHistory.DeviceId);
        self.isNoteExists = ko.observable(globalVariableForAlertsHistory.IsNoteExists);
        self.deviceAlertId = globalVariableForAlertsHistory.DeviceAlertId;
        self.status = globalVariableForAlertsHistory.Status;
        self.eventReceivedDate = ko.observable(jsonDateConversion(jsonDateValue, LONG_DATETIME_FORMAT_AMPM));

        getAlertNotes(self.deviceAlertId, self.PreviousNotes);

        seti18nResourceData(document, resourceStorage);
    }


    function convertSeverity(inputVal) {
        retval = "";
        if (inputVal == 0) {
            retval = "Low";
        } else if (inputVal == 1) {
            retval = "Medium";
        } else if (inputVal == 2) {
            retval = "High";
        } else if (inputVal == 3) {
            retval = "All";
        }
        return retval;
    }
    function getAlertNotes(deviceAlertId, PreviousNotes) {
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.notes) {
                        data.notes = $.parseJSON(data.notes);
                    }
                    PreviousNotes(data.notes);
                    $('#PreviousNotes').prop("disabled", "disabled");
                } 
            }
        }

        var method = 'GetAlertNotes';
        var params = '{"token":"' + TOKEN() + '" ,"deviceAlertId":"' + deviceAlertId + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }
});