define(["knockout", "sammy.min", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "moment"], function (ko, Sammy, koUtil) {

    var lang = getSysLang();
    var gridDateFormat = 'dd/M/yyyy';
    var defaultFilterDateFormat = 'DD/MMM/YYYY';    

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function reprotSubscriptonViewModel() {

        var self = this;
        var gID = '';
        if (koUtil.isDeviceProfile()) {
            gID = 'reportGrid';
        } else {
            gID = 'reportGrid';
        }

        var deviceSearchObject = new Object();
        var adStorage = JSON.parse(sessionStorage.getItem(gID + "adStorage"));
        if (!_.isEmpty(adStorage) && adStorage.length > 0) {
            if (adStorage[0].adSearchObj) {
                deviceSearchObject = adStorage[0].adSearchObj;
            } else {
                deviceSearchObject = null;
            }
        }

        //Draggable function
        $('#mdlReportSubscriptionHeader').mouseup(function () {
            $("#mdlReportSubscription").draggable({
                disabled: true
            });
        });

        $('#mdlReportSubscriptionHeader').mousedown(function () {
            $("#mdlReportSubscription").draggable({
                disabled: false
            });
        });
        ////////////////
        //Set current Time in Select Schedule Section.
        var now = new Date();
        var dateobj = formatAMPM(now);
        $("#txtHourDaily").val(dateobj.hours);
        $("#txtMinuteDaily").val(dateobj.minutes);
        $("#ddlHourDaily").val(dateobj.ampm);

        $("#txtHourMonthly").val(dateobj.hours);
        $("#txtMinuteMonthly").val(dateobj.minutes);
        $("#ddlHourMonthly").val(dateobj.ampm);
        $("#txtPriodDays").val(dateobj.dayNumber);

        $("#txtHourWeekly").val(dateobj.hours);
        $("#txtMinuteWeekly").val(dateobj.minutes);
        $("#ddlHourWeekly").val(dateobj.ampm);

        $("#reprotModal").on('scroll.bs.modal', function () {
            $("#activeUserGrid").jqxGrid('closemenu');

            var t; //on Scroll calender Container will get attched to textbox
            window.clearTimeout(t);
            t = window.setTimeout(function () {
                $("#textStartDate").datepicker('place');
                $("#textEndBy").datepicker('place');
            }, 10);
        });


        self.reportName = ko.observable(koUtil.reportName);
        self.reportId = ko.observable(koUtil.reportId);
        self.childReportId = ko.observable(koUtil.SelectedChildReportId);
        self.childGridParam = ko.observable(koUtil.SelectedChildGridParam);
        self.reportMongoEnabled = ko.observable(koUtil.SelectedReportMongoEnabled);



        self.checkRecurrence = ko.observable('Hourly');
        self.DailycheckSub = ko.observable('every');
        self.checkRange = ko.observable('noEnd');
        self.activeUsers = ko.observableArray();
        self.checkAttachment = ko.observable('PDF');

        self.subscriptionValue = ko.observable();
        isAdpopup = 'open';
        if (sftpFileRepositoryLocation && sftpFileRepositoryLocation != "") {
            $("#sftpDistributionDiv").show();
        } else {
            $("#sftpDistributionDiv").hide();
        }
        self.checkSFTPDistribution = ko.observable(false);
        self.checkgZipCompression = ko.observable(false);
        self.checkSFTPPasswordProtected = ko.observable(false);
        $("#sftgZipCompressionDiv").addClass('disabled');
        $("#sftgZipCompressionDiv").prop('disabled', true);
        self.onChangeSFTPDistributions = function () {
            if ($("#chkSFTPDistributionId").is(':checked')) {
                self.checkSFTPDistribution(true);
                $("#sftgZipCompressionDiv").removeClass('disabled');
                $("#sftgZipCompressionDiv").removeAttr('disabled');
                if (self.checkgZipCompression() == true) {
                    $("#sftpasswordProtectionDiv").removeClass('disabled');
                    $("#sftpasswordProtectionDiv").removeAttr('disabled');
                }
            } else {
                self.checkSFTPDistribution(false);
                $("#sftgZipCompressionDiv").addClass('disabled');
                $("#sftgZipCompressionDiv").prop('disabled', true);
                if (self.checkgZipCompression() == true) {
                    $("#sftpasswordProtectionDiv").addClass('disabled');
                    $("#sftpasswordProtectionDiv").prop('disabled', true);
                }
            }
        }
        $("#sftpasswordProtectionDiv").addClass('disabled');
        $("#sftpasswordProtectionDiv").prop('disabled', true);

        self.onChangegZipCompression = function () {
            if ($("#chkgZipCompressionId").is(':checked')) {
                self.checkgZipCompression(true);
                $("#sftpasswordProtectionDiv").removeClass('disabled');
                $("#sftpasswordProtectionDiv").removeAttr('disabled');
            } else {
                self.checkgZipCompression(false);
                $("#protectedPWDID").val('');
                self.checkSFTPPasswordProtected(false);
                $("#sftpasswordProtectionDiv").addClass('disabled');
                $("#sftpasswordProtectionDiv").prop('disabled', true);
            }
        }

        $("#protectedPWDID").addClass('disabled');
        $("#protectedPWDID").prop('disabled', true);
        self.onChangeSFTPPasswordProtected = function () {
            if ($("#chkSFTPPwdProtectedId").is(':checked')) {
                self.checkSFTPPasswordProtected(true);
                $("#protectedPWDID").removeClass('disabled');
                $("#protectedPWDID").removeAttr('disabled');
            } else {
                $("#protectedPWDID").val('');
                self.checkSFTPPasswordProtected(false);
                $("#protectedPWDID").addClass('disabled');
                $("#protectedPWDID").prop('disabled', true);
            }
        }
        $("#hourDiv").show();
        $("#dailyDiv").hide();
        $("#weeklyDiv").hide();
        $("#MonthlyDiv").hide();
        $("#txtEndAfter").prop('disabled', true);
        $("#txtEndBy").prop('disabled', true);

        self.showRecurrenceHourly = function () {
            $("#hourDiv").show();
            $("#dailyDiv").hide();
            $("#weeklyDiv").hide();
            $("#MonthlyDiv").hide();
            return true

        };
        self.showRecurrenceDaily = function () {
            $("#dailyDiv").show();
            $("#hourDiv").hide();
            $("#weeklyDiv").hide();
            $("#MonthlyDiv").hide();
            return true

        };
        $("#textPeriodHourly").on('keyup', function (e) {
            var idCheck = "#textPeriodHourly";
            var valcheck = $(idCheck).val();
            if (valcheck != "") {
                valcheck = parseInt(valcheck);
            }
            if (e.keyCode == 37 || e.keyCode == 39) {
            } else {
                minMaxCheck(valcheck, 1, 23, idCheck);
            }

        });
        self.showRecurrenceWeekly = function () {
            var now = moment();

            var day = now.format('dddd');
            $("#weekdaysDiv").find("input:checkbox").each(function (i, ob) {

                if ($(ob).val() == day) {
                    $(ob).prop('checked', true);
                }
            });
            $("#hourDiv").hide();
            $("#dailyDiv").hide();
            $("#weeklyDiv").show();
            $("#MonthlyDiv").hide();
            return true

        };
        self.showRecurrenceMonthly = function () {
            $("#hourDiv").hide();
            $("#dailyDiv").hide();
            $("#weeklyDiv").hide();
            $("#MonthlyDiv").show();
            return true

        };
        self.showEveryDaily = function () {
            self.DailycheckSub("every");
            return true;

        };
        //for Firefox issue
        $("#rbtEveryDaily").on('click', function () {
            self.DailycheckSub('every');
            return true;
        });
        self.showEveryWeekDayDaily = function () {
            self.DailycheckSub("everyweekday");
            return true;

        };
        //for Firefox issue
        $("#rbtEveryWeekDayDaily").on('click', function () {
            self.DailycheckSub('everyweekday');
            return true;
        });
        self.showRangeNoEnd = function () {
            $("#txtEndAfter").prop('disabled', true);
            $("#txtEndBy").prop('disabled', true);
            self.checkRange("noEnd");
            return true;

        };
        //for Firefox issue
        $("#rbtNoEnd").on('click', function () {
            $("#txtEndAfter").prop('disabled', true);
            $("#txtEndBy").prop('disabled', true);
            self.checkRange("noEnd");
            return true;
        });
        self.showEndAffter = function () {
            $("#txtEndAfter").prop('disabled', false);
            $("#txtEndBy").prop('disabled', true);
            self.checkRange("EndAfter");
            return true;

        };
        //for Firefox issue
        $("#rbtEndAffter").on('click', function () {
            $("#txtEndAfter").prop('disabled', false);
            $("#txtEndBy").prop('disabled', true);
            self.checkRange("EndAfter");
            return true;
        });
        self.showEndBy = function () {
            $("#txtEndAfter").prop('disabled', true);
            $("#txtEndBy").prop('disabled', false);
            self.checkRange("EndBy");
            return true;

        };
        //for Firefox issue
        $("#rbtEndBy").on('click', function () {
            $("#txtEndAfter").prop('disabled', true);
            $("#txtEndBy").prop('disabled', false);
            self.checkRange("EndBy");
            return true;
        });
        $("#subscriptionHead").text(i18n.t('rpt_Subscription_for', {
            lng: lang
        }) + ' : ' + koUtil.reportName);
        ///spinner
        $('[data-trigger="spinner"]').spinner();
        ///


        $("#textPeriodHourly,#txtPeriodDaily,#txtHourDaily,#txtMinuteDaily,#txtPeriodWeekly,#txtHourWeekly,#txtMinuteWeekly,#txtPriodDays,#txtPeriodMonthly,#txtHourMonthly,#txtMinuteMonthly,#txtEndAfter").on("change keyup keypress paste", function (e) {
            //  if (!e) {
            var e = e || window.event;
            this.value = this.value.replace(/[^0-9]/g, '');
            // }
        });

        //Start Date & Endby textbox - Prevent typing
        $("#txtStartDate,#txtEndBy").keydown(function (e) {
            //  if (!e) {
            var e = e || window.event;
            e.preventDefault();
            return false;
            //  }
        });

        $("#txtStartDate").datepicker({
            autoclose: true, dateFormat: gridDateFormat, format: gridDateFormat
        });
        $("#txtEndBy").datepicker({
            autoclose: true, dateFormat: gridDateFormat, format: gridDateFormat
        });

        var currentDateShort = moment().format(defaultFilterDateFormat);
        var currentDate = moment().format(defaultFilterDateFormat);

        $("#txtStartDate").val(currentDate);

        //$("#txtEndBy").val(moment().add('days', 60).format(defaultFilterDateFormat));
        $("#txtEndBy").val(currentDate);

        $("#txtStartDate").datepicker().on('changeDate', function (ev) {
            var curt = moment().format(defaultFilterDateFormat);
            if (moment(curt).isAfter(moment($("#txtStartDate").val()).format(defaultFilterDateFormat))) {
                $("#txtStartDate").change();
            }
        });

        $("#txtStartDate").change(function () {
            var curt = moment().format(defaultFilterDateFormat);
            if (moment(curt).isAfter(moment($("#txtStartDate").val()).format(defaultFilterDateFormat))) {
                openAlertpopup(1, 'rpt_subscription_fromDate_check');
                $("#txtStartDate").val(moment().format(defaultFilterDateFormat));
            } else {
                //  $("#txtEndBy").val(moment($("#txtStartDate").val()).add('days', 60).format(defaultFilterDateFormat));
                $("#txtEndBy").val(currentDate);

                //var dateChageValue = $("#txtStartDate").val();
                //var newDate = moment(dateChageValue, "DD.MM.YYYY");
                //newDate = newDate.add(60, 'days');
                //var date = moment(newDate).format(defaultFilterDateFormat);
                //$("#txtEndBy").val(date);
            }

        });

        $("#txtEndBy").datepicker().on('changeDate', function (ev) {
            if (moment($("#txtStartDate").val()).isAfter($("#txtEndBy").val())) {
                $("#txtEndBy").change();
            }
        });

        $("#txtEndBy").change(function () {
            if (moment($("#txtStartDate").val()).isAfter($("#txtEndBy").val())) {
                openAlertpopup(1, 'rpt_subscription_endDate_check');
                $("#txtEndBy").val($("#txtStartDate").val());
            } else {

            }

        });

        //$("#txtSubcription").on("keypress keyup paste", function (e) {
        //    // if (!e) {
        //    var e = e || window.event;
        //    if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 32 || e.keyCode == 8)
        //        return true;
        //    //this.value = this.value.replace(/[^a-zA-Z0-9\-\._\s]/g, '');
        //    //  }
        //});


        //check only space in subscription name
        $("#txtSubcription").on('change keyup paste', function () {
            if ($.trim($('#txtSubcription').val()).length == 0) {
                $('#btnAdd').prop('disabled', true);
            } else {
                $("#btnAdd").prop('disabled', false);
            }
            var yourInput = $(this).val();
            re = /[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
            // store current positions in variables
            var start = this.selectionStart,
                end = this.selectionEnd;

            var isSplChar = re.test(yourInput);
            if (isSplChar) {
                var no_spl_char = yourInput.replace(/[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '');
                $(this).val(no_spl_char);
                // restore from variables...
                this.setSelectionRange(start - 1, end - 1);
            }
        });
        self.subscriptiontext = ko.observable("");
        self.subscriptiontext.subscribe(function (newValue) {

            if (self.subscriptiontext() != '') {
                $("#btnAdd").removeAttr('disabled');
            } else {
                $("#btnAdd").prop('disabled', true);
            }
            //newValue = newValue.replace(/[^a-zA-Z0-9\-\._\s]/g, '');
            // var yourInput = $(this).val();
            re = /[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
            // store current positions in variables
            var start = $("#txtSubcription")[0].selectionStart,
                end = $("#txtSubcription")[0].selectionEnd;

            var isSplChar = re.test(newValue);
            if (isSplChar) {
                var no_spl_char = newValue.replace(/[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '');
                //$("#txtSubcription").val(no_spl_char);
                self.subscriptiontext = ko.observable(no_spl_char);
                // restore from variables...
                $("#txtSubcription")[0].setSelectionRange(start - 1, end - 1);
            }
        });
        self.checkPeriod = function (e) {
            var e = e || window.event;
            if (e != undefined) {
                if (e.target != undefined) {
                    var id = e.target.id;
                    var valcheck = $('#' + id).val();

                    if (valcheck != "") {
                        valcheck = parseInt(valcheck);
                    }
                    if (e.keyCode == 37 || e.keyCode == 39) { } else {
                        minMaxCheck(valcheck, 1, 365, id);
                    }
                }
            }
        }

        self.checkHour = function (e) {
            var e = e || window.event;
            if (e != undefined) {
                if (e.target != undefined) {
                    var id = e.target.id;
                    var valcheck = $('#' + id).val();

                    if (valcheck != "") {
                        valcheck = parseInt(valcheck);
                    }
                    if (e.keyCode == 37 || e.keyCode == 39) { } else {
                        minMaxCheck(valcheck, 1, 12, id);
                    }
                }
            }
        }

        self.checkMinute = function (e) {
            var e = e || window.event;
            if (e != undefined) {
                if (e.target != undefined) {
                    var id = e.target.id;
                    var valcheck = $('#' + id).val();

                    if (valcheck != "") {
                        valcheck = parseInt(valcheck);
                    }
                    if (e.keyCode == 37 || e.keyCode == 39) { } else {
                        minMaxCheck(valcheck, 0, 59, id);
                    }
                }
            }
        }

        function minMaxCheck(value, min, max, id) {
            if (value < min) {
                $('#' + id).val(min);
            } else if (value > max) {
                $('#' + id).val(max);
            } else {

            }
        }

        getActiveUsers(self.activeUsers);

        $("#btnAdd").on('click', function () {
            var userInfoList = new Array();
            var selectedUserData = getMultiSelectedData('activeUserGrid');
            if (selectedUserData.length <= 0) {
                openAlertpopup(1, 'rpt_Please_select_Recepients');
                return;
            }
            for (var i = 0; i < selectedUserData.length; i++) {
                var objEUserInfo = new Object();
                objEUserInfo.LoginName = selectedUserData[i].LoginName;
                objEUserInfo.UserGuid = selectedUserData[i].UserGuid;
                objEUserInfo.UserType = selectedUserData[i].UserType;
                userInfoList.push(objEUserInfo);
            }

            var subscription = new Object();
            subscription.SubscribedforSftp = self.checkSFTPDistribution();
            subscription.ZipEnabledforSftpSubscrption = self.checkgZipCompression();
            subscription.ZipPasswordProtected = self.checkSFTPPasswordProtected();
            if (self.checkSFTPDistribution() == true && self.checkgZipCompression() == true && self.checkSFTPPasswordProtected() == true && $('#protectedPWDID').val() == "") {
                openAlertpopup(1, 'sftp_compress_to_gz_password_missing');
                return;
            } else {
                subscription.ZipPassword = $('#protectedPWDID').val();
            }
            if (self.checkRecurrence() == 'Hourly') {
                subscription.RecurPeriod = $("#textPeriodHourly").val();
                var ExecutionTimeObj = calculateDateTime($("#txtStartDate").val(), $("#txtHourDaily").val(), $("#txtMinuteDaily").val(), $('select#ddlHourDaily option:selected').val())
                subscription.ExecutionTime = ExecutionTimeObj.time;
                subscription.ExecutionTimeClient = ExecutionTimeObj.clientTime;
                subscription.StartDate = ExecutionTimeObj.time;
                subscription.StartDateClient = ExecutionTimeObj.clientTime;

                if (self.checkRange() == 'EndBy') {
                    var EndDateObj = calculateDateTime($("#txtEndBy").val(), "11", "59", "PM");
                    subscription.EndDate = EndDateObj.time;
                    subscription.EndDateClient = EndDateObj.clientTime;
                }
            }
            if (self.checkRecurrence() == 'Daily') {
                subscription.RecurPeriod = $("#txtPeriodDaily").val();
                var ExecutionTimeObj = calculateDateTime($("#txtStartDate").val(), "11", "59", "PM");
                subscription.ExecutionTime = ExecutionTimeObj.time;
                subscription.ExecutionTimeClient = ExecutionTimeObj.clientTime;
                subscription.StartDate = ExecutionTimeObj.time;
                subscription.StartDateClient = ExecutionTimeObj.clientTime;

                if (self.checkRange() == 'EndBy') {
                    var EndDateObj = calculateDateTime($("#txtEndBy").val(), "11", "59", "PM");
                    subscription.EndDate = EndDateObj.time;
                    subscription.EndDateClient = EndDateObj.clientTime;
                }
            }
            if (self.checkRecurrence() == 'Daily' && self.DailycheckSub() == 'everyweekday') {
                subscription.RecurPeriod = 0;
                subscription.RecurWeeks = '1,1,1,1,1,0,0';
            }
            if (self.checkRecurrence() == 'Weekly') {
                subscription.RecurPeriod = $("#txtPeriodWeekly").val();
                var checkrecur = recurWeeksValue(); //Returns weekdays selection for recurrence 
                if (checkrecur == '0,0,0,0,0,0,0') {
                    openAlertpopup(1, 'rpt_Recurrence_Pattern_is_invalid');
                    return;
                }
                subscription.RecurWeeks = checkrecur;
                var ExecutionTimeObj = calculateDateTime($("#txtStartDate").val(), "11", "59", "PM");
                subscription.ExecutionTime = ExecutionTimeObj.time;
                subscription.ExecutionTimeClient = ExecutionTimeObj.clientTime;
                subscription.StartDate = ExecutionTimeObj.time;
                subscription.StartDateClient = ExecutionTimeObj.clientTime;
                if (self.checkRange() == 'EndBy') {
                    var EndDateObj = calculateDateTime($("#txtEndBy").val(), "11", "59", "PM");
                    subscription.EndDate = EndDateObj.time;
                    subscription.EndDateClient = EndDateObj.clientTime;
                }

            }
            if (self.checkRecurrence() == 'Monthly') {

                subscription.RecurDay = $("#txtPriodDays").val();
                subscription.RecurPeriod = $("#txtPeriodMonthly").val();
                var ExecutionTimeObj = calculateDateTime($("#txtStartDate").val(), $("#txtHourMonthly").val(), $("#txtMinuteMonthly").val(), $('select#ddlHourMonthly option:selected').val())
                subscription.ExecutionTime = ExecutionTimeObj.time;
                subscription.ExecutionTimeClient = ExecutionTimeObj.clientTime;
                subscription.StartDate = ExecutionTimeObj.time;
                subscription.StartDateClient = ExecutionTimeObj.clientTime;
                if (self.checkRange() == 'EndBy') {
                    var EndDateObj = calculateDateTime($("#txtEndBy").val(), "11", "59", "PM");
                    subscription.EndDate = EndDateObj.time;
                    subscription.EndDateClient = EndDateObj.clientTime;
                }
            }

            if (self.checkRange() == 'noEnd') {

                subscription.IsNoEndDate = true;
            } else {
                subscription.IsNoEndDate = false;
            }
            if (self.checkRange() == 'EndAfter') {
                subscription.RepeatOccurrence = $("#txtEndAfter").val();
            }


            //subscription.AttachmentType = self.checkAttachment();
            subscription.AttachmentType = $('input[name="rbtAttachmnetGroup"]:checked').val();
            subscription.FrequencyInterval = self.checkRecurrence();
            subscription.ReportId = self.reportId();

            if (self.childReportId() != '' && self.childReportId() != undefined) {

                subscription.ChildReportId = self.childReportId();
                subscription.ChildReportParams = self.childGridParam();
                subscription.ReportMongoEnabled = self.reportMongoEnabled();
            }

            subscription.SearchCriteria = '';
            subscription.SubscriptionName = $("#txtSubcription").val();

            addSubscription(self.reportName(), subscription, userInfoList, deviceSearchObject);
        });

        $("#rbtEndBy").on('click', function () {
            $("#txtEndAfter").prop('disabled', true);
            $("#txtEndBy").prop('disabled', false);
            return true;
        });

        $("#rbtEndAffter").on('click', function () {
            $("#txtEndAfter").prop('disabled', false);
            $("#txtEndBy").prop('disabled', true);
            return true;
        });

        $("#rbtNoEnd").on('click', function () {
            $("#txtEndAfter").prop('disabled', true);
            $("#txtEndBy").prop('disabled', true);
            return true;
        });

        $("#rbtNoEnd").prop("checked", true);
        seti18nResourceData(document, resourceStorage);
    }

    function calculateDateTime(date, hours, minutes, hourFormat) {

        if (hourFormat == 'PM') {
            if (hours == 12) { } else {
                hours = 12 + parseInt(hours);
            }
        } else {
            if (hours == 12) {
                hours = 12 - parseInt(hours);
            }
        }
        var months = { 'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06', 'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12' };
        var datesplit = date.split('/');
        var date = [months[datesplit[1].toLowerCase()], datesplit[0], datesplit[2]].join('/');
        var localDate = getlocaldate1(date, hours, minutes);
        var utcDate = getUtcDate1(date, hours, minutes);
        var dateobj = new Object();
        dateobj.time = CreatJSONDate(utcDate);
        dateobj.clientTime = createJSONTimeStamp(localDate);
        return dateobj;
    }

    function recurWeeksValue() {
        var weekStr = '';
        var sunStr;
        $("#weekdaysDiv").find("input:checkbox").each(function (i, ob) {
            if (i == '0') {
                if ($(ob).is(':checked')) {
                    sunStr = 1 + ',';
                } else {
                    sunStr = 0 + ',';
                }

            } else {
                if ($(ob).is(':checked')) {
                    weekStr += 1 + ',';
                } else {
                    weekStr += 0 + ',';
                }
            }
        });

        weekStr += sunStr;
        weekStr = weekStr.substr(0, weekStr.length - 1);
        return weekStr;
    }

    function getActiveUsers(activeUsers) {
        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.getActiveUsersResp)
                        data.getActiveUsersResp = $.parseJSON(data.getActiveUsersResp);

                    activeUsers(data.getActiveUsersResp.userList);
                    generateActiveUserGrid('activeUserGrid', activeUsers());
                }
            }
        }
        var params = '{"token":"' + TOKEN() + '"}';
        ajaxJsonCall('GetActiveUsers', params, callBackfunction, true, 'POST', true);

    }

    function addSubscription(reportName, subscription, userInfoList, deviceSearchObject) {
        var addSubscriptionReq = new Object();
        addSubscriptionReq.ColumnFilterText = columnfilterstring;
        addSubscriptionReq.ColumnSortFilter = columnSortFilterforeport;
        addSubscriptionReq.DeviceSearch = deviceSearchObject;
        addSubscriptionReq.IsIncludeFilter = true;
        addSubscriptionReq.ReportName = reportName;
        addSubscriptionReq.Subscription = subscription;
        addSubscriptionReq.UnselectedItems = null;
        addSubscriptionReq.UserInfoList = userInfoList;

        addSubscriptionReq.ChildReportId = subscription.ChildReportId;
        addSubscriptionReq.ChildReportParams = subscription.ChildReportParams;


        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                    $("#mainPageBody").removeClass('modal-open-appendon');
                    isAdpopup = '';
                    $("#reprotModal").modal('hide');


                    if (self.showChildReportGrid != '') {

                        $("#openModalPopup").modal('show');

                    }

                    openAlertpopup(0, 'rpt_Report_successfully_subscribed');
                } else if (data.responseStatus.StatusCode == AppConstants.get('SUBSCRIPTION_EXISTS')) {
                    openAlertpopup(1, 'rpt_Add_Subscription_With_Exist_Name');
                } else if (data.responseStatus.StatusCode == AppConstants.get('SQL_INJECTION_ERROR')) {
                    openAlertpopup(2, 'sql_injection_error');
                }
            }
        }

        var params = '{"token":"' + TOKEN() + '","addSubscriptionReq":' + JSON.stringify(addSubscriptionReq) + '}';

        // TODO: Rohit Add the Device Communication URL
        if (subscription.ReportMongoEnabled) {

            ajaxJsonCall('AddSubscription', params, callBackfunction, true, 'POST', true, true, 'Subscription');
        }
        else {

            ajaxJsonCall('AddSubscription', params, callBackfunction, true, 'POST', true);
        }

    }

    function generateActiveUserGrid(gID, activeUsersData) {
        var gridStorageArr = new Array();
        var gridStorageObj = new Object();
        gridStorageObj.checkAllFlag = 0;
        gridStorageObj.counter = 0;
        gridStorageObj.filterflage = 0;
        gridStorageObj.selectedDataArr = [];
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
        var source = {
            dataType: "observablearray",
            localdata: activeUsersData,
            datafields: [{
                name: 'FullName',
                map: 'FullName'
            },
            {
                name: 'LoginName',
                map: 'LoginName'
            },
            {
                name: 'UserGuid',
                map: 'UserGuid'
            },
            {
                name: 'UserType',
                map: 'UserType'
            }
            ],

        };

        var dataAdapter = new $.jqx.dataAdapter(source);

        var rendered = function (element) {
            enableUiGridFunctions(gID, 'UserGuid', element, gridStorage, true);
            return true;
        }
        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID);
        }

        // create jqxgrid.
        $("#" + gID).jqxGrid({

            width: "100%",
            height: '150px',
            source: dataAdapter,
            sortable: true,
            filterable: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            altrows: true,
            pagesize: activeUsersData.length,
            autoshowcolumnsmenubutton: false,
            showsortmenuitems: false,
            editable: true,
            rowsheight: 32,
            enabletooltips: true,
            columnsResize: true,
            columns: [{
                text: '',
                menu: false,
                sortable: false,
                filterable: false,
                columntype: 'checkbox',
                enabletooltips: false,
                resizable: false,
                draggable: false,
                datafield: 'isSelected',
                width: 40,
                renderer: function () {
                    return '<div style="margin-left:10px;"><div style="margin-top: 5px;"></div></div>';
                },
                rendered: rendered
            },
            {
                text: i18n.t('rpt_user_names', {
                    lng: lang
                }),
                datafield: 'FullName',
                minwidth: 100,
                editable: false,
                resizable: false,
                draggable: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                },
            },
            {
                text: i18n.t('rpt_login_name', {
                    lng: lang
                }),
                datafield: 'LoginName',
                minwidth: 100,
                editable: false,
                resizable: false,
                draggable: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                },
            },
            ]

        });
        //  $("#" + gID).jqxGrid({ height: 150 });
        getUiGridBiginEdit(gID, 'UserGuid', gridStorage);
        callUiGridFilter(gID, gridStorage);
    }

});

function validate(e) {
    //if (!e) {
    var e = e || window.event;
    var element = e;
    element.value = element.value.replace(/[^a-zA-Z0-9@]+/, '');
    // }
};

//date separation for text box
function formatAMPM(date) {
    var dayNumber = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var dtObj = new Object();
    //alert(dayNumber)
    dtObj.dayNumber = dayNumber;
    dtObj.hours = hours;
    dtObj.minutes = minutes;
    dtObj.ampm = ampm;

    return dtObj;
}