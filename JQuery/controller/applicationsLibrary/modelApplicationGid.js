define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function modelViewApplicationGid() {
    
        var self = this;
        $("#mdlApplicationGrid").draggable();

        //Draggable function
        $('#mdlApplicationHeader').mouseup(function () {
            $("#mdlApplicationGrid").draggable({ disabled: true });
        });

        $('#mdlApplicationHeader').mousedown(function () {
            $("#mdlApplicationGrid").draggable({ disabled: false });
        });
        /////////
        
        self.isMXApp = globalVariableForApplications.IsMXApp;
        self.version = globalVariableForApplications.ApplicationVersion;
        self.ApplicationId = globalVariableForApplications.ApplicationId; 
        self.AppGID = globalVariableForApplications.AppGID;
       
   

        self.applicationGidSave = function () {

            var item = $("#appSelectGid").find('option:selected').text();
            var applicationId = self.ApplicationId;
            var AssignGIDForApplicationReq = new Object();
            AssignGIDForApplicationReq.AppGID = item;
            AssignGIDForApplicationReq.ApplicationId = applicationId;
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        
                    } 
                }
            }

            var method = 'AssignGIDForApplication';
            var params = '{"token":"' + TOKEN() + '","assignGIDForApplicationReq":' + JSON.stringify(AssignGIDForApplicationReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
           
        }

        seti18nResourceData(document, resourceStorage);
    }
});