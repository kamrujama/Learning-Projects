define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "utility"], function (ko, koUtil, autho) {
    var lang = getSysLang();
    acUserSubscribedAlerts = new Array()
    selectedArr = new Array();
    isAlertGridEditable = false;
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function roleSubscriptionModel() {
        var lang = getSysLang();
        var userrData = JSON.parse(sessionStorage.getItem("userrData"));
        userGuid = userrData[0].UserGuid;

        var self = this;

        self.userGroups = ko.observableArray();
        self.userAlerts = ko.observableArray();
        self.userSubcribedAlerts = ko.observableArray();

        self.RoleName = ko.observable('');

        var isAlertsAllowed = userHasViewAccess("Alerts");
        var isAlertSubscriptionModified = false;
        var acUserSubscribedAlerts = [];

        var customerData = JSON.parse(sessionStorage.getItem("customerData"));
        var IsVHQAuthorization = customerData[0].IsVHQAuthorization;

        checkRightsForAlert();

        function checkRightsForAlert() {
            var retval = autho.checkRightsBYScreen('Alerts', 'IsModifyAllowed');
            isAlertGridEditable = retval;
        }

        if (isAlertGridEditable) {
            $("#jqxgridAlertSubscriptions").prop("disabled", false);
            $('#jqxgridAlertSubscriptions').removeClass('disabled');
        } else {
            $("#jqxgridAlertSubscriptions").prop("disabled", true);
            $('#jqxgridAlertSubscriptions').addClass('disabled');
        }
        $("#btnSaveUserAlerts").prop('disabled', true);

        if (koUtil.UserData() == '') {
            getUser(self.userAlerts, self.userSubcribedAlerts, koUtil.UserData);
        } else {
            self.userGroups = koUtil.UserData().userGroups ? koUtil.UserData().userGroups : null;
            self.RoleName = self.userGroups ? ko.observable(self.userGroups[0].Role.RoleName) : ko.observable('');
            self.userSubcribedAlerts = koUtil.UserData().userSubscribedAlerts;
            if (isAlertsAllowed) {
                getUserProfileDetails(self.userAlerts, self.userSubcribedAlerts);
            }
        }

        function getUser(acUserAlerts, acUserSubscribedAlerts, UserData, observableModelRoleSubscription) {
            $("#loadingDiv").show();
            function callbackFunction(data, error) {
                $("#loadingDiv").hide();
                if (data) {
                    if (data.user)
                        data.user = $.parseJSON(data.user);
                    $("#userfullnameId").text(data.user.FullName);
                    if (data.userGroups)
                        data.userGroups = $.parseJSON(data.userGroups);
                    if (data.userHierarchies)
                        data.userHierarchies = $.parseJSON(data.userHierarchies);
                    if (data.userSubscribedAlerts) {
                        data.userSubscribedAlerts = $.parseJSON(data.userSubscribedAlerts);
                        acUserSubscribedAlerts = data.userSubscribedAlerts;
                    }
                    if (!isAlertSubscriptionModified && isAlertsAllowed) {
                        getUserProfileDetails(acUserAlerts, acUserSubscribedAlerts);
                    } else {
                        if (observableModelRoleSubscription)
                            observableModelRoleSubscription('unloadTemplate')
                        $("#loadRoleSubscription").modal('hide');
                    }
                    isAlertSubscriptionModified = false;
                    userGlobalData = data;
                    UserData(data);

                    self.userGroups = userGlobalData.userGroups ? userGlobalData.userGroups : null;
                    self.RoleName = self.userGroups ? ko.observable(self.userGroups[0].Role.RoleName) : ko.observable('');

                }
                if (error) {
                    retval = "";
                }
            }

            var method = 'GetUser';
            var params = '{"token":"' + TOKEN() + '","userGuid":"' + userGuid + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        }

        function getUserProfileDetails(acuserAlerts, acUserSubscribedAlerts) {

            var alertTypeReq = new Object();
            alertTypeReq.AlertStatus = ENUM.get('ALERT_STATUS_ENABLED');

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.alertList)
                            data.alertList = $.parseJSON(data.alertList);

                        for (var i = 0; i < data.alertList.length; i++) {
                            var source = _.where(acUserSubscribedAlerts, { AlertTypeId: data.alertList[i].AlertTypeId });
                            if (source != '') {
                                data.alertList[i].isSelected = 1;
                            } else {
                                data.alertList[i].isSelected = 0;
                            }
                        }

                        acuserAlerts(data.alertList);
                        alertSubscriptionGrid(acuserAlerts(), 'jqxgridAlertSubscriptions');
                    }
                }
            }

            var method = 'GetAlertTypes';
            var params = '{"token":"' + TOKEN() + '","alertTypeReq":' + JSON.stringify(alertTypeReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

        }


        function alertSubscriptionGrid(userAlerts, gID) {
            var count = 0;
            selectedArr = [];
            for (var i = 0; i < userAlerts.length; i++) {

                if (userAlerts[i].isSelected == 1) {
                    selectedArr.push(userAlerts[i].AlertTypeId);
                } else {
                    selectedArr = jQuery.grep(selectedArr, function (value) {
                        return (value != userAlerts[i].AlertTypeId && value != null);
                    });
                    userAlerts[i].isSelected = 0;
                }
            }
            count = selectedArr.length;

            var gridStorageArr = new Array();
            var gridStorageObj = new Object();
            if (userAlerts.length == selectedArr.length) {
                gridStorageObj.checkAllFlag = 1;
            } else {
                gridStorageObj.checkAllFlag = 0;
            }

            gridStorageObj.counter = count;
            gridStorageObj.filterflage = 0;
            gridStorageObj.selectedDataArr = selectedArr;
            gridStorageObj.unSelectedDataArr = [];
            gridStorageObj.singlerowData = [];
            gridStorageObj.multiRowData = [];
            gridStorageObj.TotalSelectionCount = null;
            gridStorageObj.highlightedRow = null;
            gridStorageObj.highlightedPage = null;
            gridStorageArr.push(gridStorageObj);
            var gridStorage = JSON.stringify(gridStorageArr);
            window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
            var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

            // prepare the data
            var source =
            {
                dataType: "json",
                localdata: userAlerts,
                datafields: [
                   { name: 'AlertName', map: 'AlertName' },
                   { name: 'Severity', map: 'Severity' },
                   { name: 'AlertTypeId', map: 'AlertTypeId' },
                   { name: 'isSelected', map: 'number' },
                   { name: 'IsSeverityApplicable', map: 'IsSeverityApplicable' }
                ],

            };
            var dataAdapter = new $.jqx.dataAdapter(source);

            var rendered = function (element) {
                enableUiGridFunctions(gID, 'AlertTypeId', element, gridStorage, true);
                return true;
            }

            var severityRenderer = function (row, columnfield, value, defaulthtml, columnproperties, event) {

                var isSeverityApplicable = $("#" + gID).jqxGrid('getcellvalue', row, 'IsSeverityApplicable');

                if (isSeverityApplicable != null) {
                    if (isSeverityApplicable == true) {
                        if (value == "Low") {
                            return '<div style="padding-left:5px;padding-top:0px;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Low_severity"></div></a>' + value + '</div>';
                        } else if (value == "High") {
                            return '<div style="padding-left:5px;padding-top:0px;"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg high_Severity"></div></a>' + value + '</div>';
                        } else if (value == "Medium") {
                            return '<div style="padding-left:5px;padding-top:0px;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Medium_severity"></div></a>' + value + '</div>';
                        }
                    }
                    else {
                        return '<div style="padding-left:35px; padding-top:7px;" disabled="disabled">' + "Not Applicable" + '</div>';
                    }
                }
            }

            $("#" + gID).jqxGrid(
           {
               width: "99.5%",
               height: "400px",
               source: dataAdapter,
               sortable: true,
               filterable: false,
               selectionmode: 'singlerow',
               altrows: true,
               pagesize: userAlerts.length,
               showsortmenuitems: false,
               editable: true,
               enabletooltips: true,
               rowsheight: 32,
               columnsResize: true,
               columns: [
                   {
                       text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false, editable: true,
                       datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                           return '<div style="margin-left:10px;"><div style="margin-top: 5px;"></div></div>';
                       }, rendered: rendered
                   },
                 {
                     text: i18n.t('ALERT_NAME_user', { lng: lang }), datafield: 'AlertName', minwidth: 100, editable: false,
                 },
                 {
                     text: i18n.t('severity_user', { lng: lang }), datafield: 'Severity', minwidth: 100, editable: false, enabletooltips: false, cellsrenderer: severityRenderer
                 },
               ]
           });
            getUiGridBiginEdit(gID, 'AlertTypeId', gridStorage);
            callUiGridFilter(gID, gridStorage);
            //$("#" + gID).jqxGrid('updatebounddata');
        }

        self.saveClicked = function (gId, observableModelRoleSubscription) {
            var selectedrowids = getSelectedUniqueId(gId);
            setUserAlerts(selectedrowids, observableModelRoleSubscription);
        }

        self.cancel = function (observableModelRoleSubscription) {
            if (observableModelRoleSubscription)
                observableModelRoleSubscription('unloadTemplate');
        }

        function setUserAlerts(selectedrowids, observableModelRoleSubscription) {
            var userGuid;
            var alerts = new Array();

            //Getting User Guid
            userrData = JSON.parse(sessionStorage.getItem("userrData"));
            userGuid = userrData[0].UserGuid;

            for (var i = 0; i < selectedrowids.length; i++) {
                var EAlertType = new Object();
                EAlertType.AlertTypeId = selectedrowids[i];
                alerts.push(EAlertType);
            }
            var isStatusChanged = false;
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        isAlertSubscriptionModified = true;
                        openAlertpopup(0, 'role_subscription_save_success');
                        getUser(self.userAlerts, self.userSubcribedAlerts, koUtil.UserData, observableModelRoleSubscription)
                    } else {
                        $("#pAlert").append(i18n.t('Please_provide_user_Email_ID', { lng: 'en' }));
                        $("#Alermsgmodel").modal("show");
                    }
                } else if (error) {
                    $("#pAlert").append(i18n.t('network_error', { lng: lang }));
                    $("#Alermsgmodel").modal("show");
                }
            }

            var method = 'SetUserAlerts';
            var params = '{"token":"' + TOKEN() + '","userGuid":"' + userGuid + '","alerts":' + JSON.stringify(alerts) + ',"isStatusChanged":"' + isStatusChanged + '"}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }
        seti18nResourceData(document, resourceStorage);
    }
});