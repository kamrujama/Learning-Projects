define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();
    var chosenName = [];
    var chosenValue = [];
    //validation
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    var subDetails = new Object();
    var UserInfoListArray = new Array();
    var gridDateFormat = 'dd/M/yyyy';
    var defaultFilterDateFormat = 'DD/MMM/YYYY';
    var selectedDataArr = new Array();
    var editDateDispaly;
    return function addSubscriptionViewModel() {

        var config = {
            '.chosen-select': {},
            '.chosen-select-deselect': { allow_single_deselect: true },
            '.chosen-select-no-single': { disable_search_threshold: 10 },
            '.chosen-select-no-results': { no_results_text: 'Oops, nothing found!' },
            '.chosen-select-width': { width: "95%" }
        }

        //Chosen dropdown
        ko.bindingHandlers.chosen = {
            init: function (element) {
                ko.bindingHandlers.options.init(element);
                $(element).chosen({ disable_search_threshold: 10 });
            },
            update: function (element, valueAccessor, allBindings) {
                ko.bindingHandlers.options.update(element, valueAccessor, allBindings);
                $(element).trigger('chosen:updated');
            }
        };

        var self = this;

        //Draggable function
        $('#mdlAddSubscriptionHeader').mouseup(function () {
            $("#mdlAddSubscription").draggable({ disabled: true });
        });

        $('#mdlAddSubscriptionHeader').mousedown(function () {
            $("#mdlAddSubscription").draggable({ disabled: false });
        });

        $('#mdlEditSubscriptionHeader').mouseup(function () {
            $("#mdlAddSubscription").draggable({ disabled: true });
        });

        $('#mdlEditSubscriptionHeader').mousedown(function () {
            $("#mdlAddSubscription").draggable({ disabled: false });
        });
        ////////////////

        self.subNameHeader = ko.observable();
        self.subNameArr = ko.observableArray();
        self.activeUserSubscription = ko.observableArray();
        self.getSubscriptionTypeArray = ko.observableArray();
        self.checkRecurrence = ko.observable('Hourly');
        self.checkRange = ko.observable('noEndDateSelected');
        self.endByDate = ko.observable();
        //Attachment type
        self.radioSelectAttachment = ko.observable('PDF');

        self.DailycheckSub = ko.observable('every');
        self.observableModelPopup = ko.observable();



        isAdpopup = 'open';

        self.editflage = ko.observable(false);
        self.addflage = ko.observable(false);
        self.reportName = ko.observable();
        self.subscriptionName = ko.observable();
		self.checkSFTPDistribution = ko.observable(false);
		self.checkgZipCompression = ko.observable(false);
		self.checkSFTPPasswordProtected = ko.observable(false);
		$("#sftgZipCompressionDiv").addClass('disabled');
		$("#sftgZipCompressionDiv").prop('disabled', true);
		$("#sftpasswordProtectionDiv").addClass('disabled');
        $("#sftpasswordProtectionDiv").prop('disabled', true);
		$("#protectedPWDID").addClass('disabled');
        $("#protectedPWDID").prop('disabled', true);
        if (koUtil.editFlag == 1) {
            self.editflage(true);
            self.addflage(false);

            //Set report name 
            self.reportName(koUtil.SubscriptionSelectedata[0].ReportName);

            var subsName = koUtil.SubscriptionSelectedata[0].SubscriptionName;
            self.subNameHeader('Edit Subscription:' + subsName);

            var subId = koUtil.SubscriptionSelectedata[0].SubscriptionId;
            getSubscriptionDetails(subId, subDetails, self.checkRecurrence, self.DailycheckSub, self.radioSelectAttachment, self.checkRange,self.checkSFTPDistribution,self.checkgZipCompression,self.checkSFTPPasswordProtected );
        } else {
            self.editflage(false);
            self.addflage(true);
			
        }
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        getSubscriptionTypes(self.getSubscriptionTypeArray);

        //focus on subscription name textbox
        $('#modelAddSubcription').on('shown.bs.modal', function () {
            $('#subNameID').focus();
        })

        ////for Calender

        $("#modelAddSubcription").on('scroll.bs.modal', function () {

            var t;
            window.clearTimeout(t);
            t = window.setTimeout(function () {
                $("#textStartDate").datepicker('place');
                $("#textEndBy").datepicker('place');
            }, 10);
        });

        //on change of choosen
        self.onChangeSubscriptionType = function () {
            $('#selectSubType').empty();
            if (($("#selectSubId").chosen().val() == null) || $("#selectSubId").chosen().val() == "" || $("#selectSubId").chosen().val() == '0' || $("#selectSubId").chosen().val().length == 0) {
                $('#addModelSubscription').prop('disabled', true);
            } else {
                self.subNameArr([]);
                $('#selectSubId :selected').each(function (i, selected) {
                    chosenName[i] = $(selected).text();
                    chosenValue[i] = $(selected).val();
                });
                self.subNameArr.push(chosenName);
                $("#selectSubType").empty();
            }
        }

        if (sftpFileRepositoryLocation && sftpFileRepositoryLocation != "") {
            $("#sftpDistributionDiv").show();
        } else {
            $("#sftpDistributionDiv").hide();
        }
  
        self.onChangeSFTPDistribution = function () {
            if ($("#chkSFTPDistributionId").is(':checked')) {
                self.checkSFTPDistribution(true);
                $("#sftgZipCompressionDiv").removeClass('disabled');
                $("#sftgZipCompressionDiv").removeAttr('disabled');
                if (self.checkgZipCompression() == true) {
                    $("#sftpasswordProtectionDiv").removeClass('disabled');
                    $("#sftpasswordProtectionDiv").removeAttr('disabled');
                }
            } else {
				$("#protectedPWDID").val('');
                self.checkSFTPPasswordProtected(false);
                self.checkgZipCompression(false);
                $("#sftpasswordProtectionDiv").addClass('disabled');
                $("#sftpasswordProtectionDiv").prop('disabled', true);
                self.checkSFTPDistribution(false);
                $("#sftgZipCompressionDiv").addClass('disabled');
                $("#sftgZipCompressionDiv").prop('disabled', true);
            }
        }        

        self.onChangegZipCompression = function () {
            if ($("#chkgZipCompressionId").is(':checked')) {
                self.checkgZipCompression(true);
                $("#sftpasswordProtectionDiv").removeClass('disabled');
                $("#sftpasswordProtectionDiv").removeAttr('disabled');
            } else {
        		$("#protectedPWDID").val('');
                self.checkSFTPPasswordProtected(false);
                self.checkgZipCompression(false);
                $("#sftpasswordProtectionDiv").addClass('disabled');
                $("#sftpasswordProtectionDiv").prop('disabled', true);
            }
        }
        
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

        getActiveUsersDetails(self.activeUserSubscription, 'jqxGridActiveUsers');

        //datePicker
        $("#textStartDate").datepicker({ autoclose: true, dateFormat: gridDateFormat, format: gridDateFormat });
        $("#textEndBy").datepicker({ autoclose: true, dateFormat: gridDateFormat, format: gridDateFormat });



        var now = new Date();
        var dateobj = formatAMPM(now);
        var defaultDate = moment().format(defaultFilterDateFormat);//calDate(now);

        $("#txtPriodDays").val(dateobj.dayNumber);
        $("#textStartDate").val(defaultDate);

        //Weekday checkbox selection
        var dayValue = dateobj.weekDayNumber;
        if (dayValue == 1) {
            $("#Checkbox0").prop('checked', true)
        } else if (dayValue == 2) {
            $("#Checkbox1").prop('checked', true)
        } else if (dayValue == 3) {
            $("#Checkbox2").prop('checked', true)
        } else if (dayValue == 4) {
            $("#Checkbox3").prop('checked', true)
        } else if (dayValue == 5) {
            $("#Checkbox4").prop('checked', true)
        } else if (dayValue == 6) {
            $("#Checkbox5").prop('checked', true)
        } else if (dayValue == 7) {
            $("#Checkbox6").prop('checked', true)
        }

        //Day,Week,Month Recurrence Pattern
        $("#hourID").show();
        $("#dayID").hide();
        $("#textHourDaily").val(dateobj.hours);
        $("#textMinuteDaily").val(dateobj.minutes);
        $("#ddlHourDaily").val(dateobj.ampm);
        $("#weekID").hide();
        $("#MonthID").hide();

        $(":input[type='radio']").on("change", function () {

            var value = $(this).val();

            if (koUtil.editFlag == 0) {
                if (value == 'Hourly') {
                    $("#hourID").show();
                    $("#dayID").hide();
                    $("#weekID").hide();
                    $("#MonthID").hide();
                }
                if (value == 'Daily') {
                    $("#hourID").hide();
                    $("#dayID").show();
                    $("#textHourDaily").val(dateobj.hours);
                    $("#textMinuteDaily").val(dateobj.minutes);
                    $("#ddlHourDaily").val(dateobj.ampm);
                    $("#weekID").hide();
                    $("#MonthID").hide();
                } else if (value == 'Weekly') {
                    $("#hourID").hide();
                    $("#weekID").show();
                    $("#txtHourWeekly").val(dateobj.hours);
                    $("#txtMinuteWeekly").val(dateobj.minutes);
                    $("#ddlHourWeekly").val(dateobj.ampm);
                    $("#dayID").hide();
                    $("#MonthID").hide();
                } else if (value == 'Monthly') {
                    $("#hourID").hide();
                    $("#MonthID").show();
                    $("#txtHourMonthly").val(dateobj.hours);
                    $("#txtMinuteMonthly").val(dateobj.minutes);
                    $("#ddlHourMonthly").val(dateobj.ampm);
                    $("#dayID").hide();
                    $("#weekID").hide();
                }
            } else {
                var d = displayDateOnEditSubscription(editDateDispaly);
                if (value == 'Hourly') {
                    $("#hourID").show();
                    $("#dayID").hide();
                    $("#textHourDaily").val(d.hour);
                    $("#textMinuteDaily").val(d.min);
                    $("#ddlHourDaily").val(d.amPM);
                    $("#weekID").hide();
                    $("#MonthID").hide();
                } else if (value == 'Daily') {
                    $("#hourID").hide();
                    $("#dayID").show();
                    $("#textHourDaily").val(d.hour);
                    $("#textMinuteDaily").val(d.min);
                    $("#ddlHourDaily").val(d.amPM);
                    $("#weekID").hide();
                    $("#MonthID").hide();
                } else if (value == 'Weekly') {
                    $("#hourID").hide();
                    $("#weekID").show();
                    $("#txtHourWeekly").val(d.hour);
                    $("#txtMinuteWeekly").val(d.min);
                    $("#ddlHourWeekly").val(d.amPM);
                    $("#dayID").hide();
                    $("#MonthID").hide();
                } else if (value == 'Monthly') {
                    $("#hourID").hide();
                    $("#MonthID").show();
                    $("#txtHourMonthly").val(d.hour);
                    $("#txtMinuteMonthly").val(d.min);
                    $("#ddlHourMonthly").val(d.amPM);
                    $("#dayID").hide();
                    $("#weekID").hide();
                }

            }

        });


        self.checkMinMax = function (id, min, max) {
            //var idCheck = "#" + id;
            //var valcheck = $(idCheck).val();
            //if (valcheck != "") {
            //    valcheck = parseInt(valcheck);
            //}
            //minMaxCheck(valcheck, min, max, id)
        }
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
        $("#textPeriodDaily").on('keyup', function (e) {
            var idCheck = "#textPeriodDaily";
            var valcheck = $(idCheck).val();
            if (valcheck != "") {
                valcheck = parseInt(valcheck);
            }
            if (e.keyCode == 37 || e.keyCode == 39) {
            } else {
                minMaxCheck(valcheck, 1, 365, idCheck);
            }

        });

        $("#textHourDaily").on('keyup', function (e) {
            var idCheck = "#textHourDaily";
            var valcheck = $(idCheck).val();
            if (valcheck != "") {
                valcheck = parseInt(valcheck);
            }
            if (e.keyCode == 37 || e.keyCode == 39) {
            } else {
                minMaxCheck(valcheck, 1, 12, idCheck);
            }

        });


        $("#textMinuteDaily").on('keyup', function (e) {
            var idCheck = "#textMinuteDaily";
            var valcheck = $(idCheck).val();
            if (valcheck != "") {
                valcheck = parseInt(valcheck);
            }
            if (e.keyCode == 37 || e.keyCode == 39) {
            } else {
                minMaxCheck(valcheck, 0, 59, idCheck);
            }

        });

        function minMaxCheck(value, min, max, id) {
            if (value < min) {
                $(id).val(min);
            } else if (value > max) {
                $(id).val(max);
            } else {

            }
        }


        // unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup(popupName);
            $("#mainPageBody").removeClass('modal-open-appendon');
            isAdpopup = '';
        };


        //spinner
        $('[data-trigger="spinner"]').spinner();
        //
        //Set min Value on blur  
        $("#textPeriodHourly").on('blur', function () {
            if ($("#textPeriodHourly").val() == "") {
                $("#textPeriodHourly").val('1');
            }
        });
        $("#textPeriodDaily").on('blur', function () {
            if ($("#textPeriodDaily").val() == "") {
                $("#textPeriodDaily").val('1');
            }
        });
        $("#textHourDaily").on('blur', function () {
            if ($("#textHourDaily").val() == "") {
                $("#textHourDaily").val('1');
            }
        });
        $("#textMinuteDaily").on('blur', function () {
            if ($("#textMinuteDaily").val() == "") {
                $("#textMinuteDaily").val('0');
            }
        });
        $("#txtPeriodWeekly").on('blur', function () {
            if ($("#txtPeriodWeekly").val() == "") {
                $("#txtPeriodWeekly").val('1');
            }
        });
        $("#txtHourWeekly").on('blur', function () {
            if ($("#txtHourWeekly").val() == "") {
                $("#txtHourWeekly").val('1');
            }
        });
        $("#txtMinuteWeekly").on('blur', function () {
            if ($("#txtMinuteWeekly").val() == "") {
                $("#txtMinuteWeekly").val('0');
            }
        });
        $("#txtPriodDays").on('blur', function () {
            if ($("#txtPriodDays").val() == "") {
                $("#txtPriodDays").val('1');
            }
        });
        $("#txtPeriodMonthly").on('blur', function () {
            if ($("#txtPeriodMonthly").val() == "") {
                $("#txtPeriodMonthly").val('1');
            }
        });
        $("#txtHourMonthly").on('blur', function () {
            if ($("#txtHourMonthly").val() == "") {
                $("#txtHourMonthly").val('1');
            }
        });
        $("#txtMinuteMonthly").on('blur', function () {
            if ($("#txtMinuteMonthly").val() == "") {
                $("#txtMinuteMonthly").val('0');
            }
        });

        //disable add button on only space
        $("#subNameID").on('change keyup paste', function () {
            if ($.trim($('#subNameID').val()).length == 0) {
                $('#addModelSubscription').prop('disabled', true);
            }
        });

        //enable add button
        $("#selectSubId, #subNameID").on('change keyup paste', function () {
            if (($("#selectSubId").val() != "") && ($("#subNameID").val() != "")) {
                if ($.trim($('#subNameID').val()) != '') {
                    $('#addModelSubscription').removeAttr('disabled');
                }
            }
        });



        //check empty on backspace or delete
        $("#subNameID").on("change keypress keyup paste", function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                if ($("#subNameID").val() == "") {
                    $('#addModelSubscription').prop('disabled', true);
                }
            }
        });

        $("#textPeriodHourly,#textPeriodDaily,#textHourDaily,#textMinuteDaily,#txtPeriodWeekly,#txtHourWeekly,#txtMinuteWeekly,#txtPriodDays,#txtPeriodMonthly,#txtHourMonthly,#txtMinuteMonthly,#endAfterSpinner").on("change keyup keypress paste", function (e) {
            if (e.keyCode == 37 || e.keyCode == 39) {

            } else {
                this.value = this.value.replace(/[^0-9]/g, '');
            }
        });

        // check if an “enter” key is pressed inside a  spinner textbox
        $('#textPeriodHourly,#textPeriodDaily,#textHourDaily,#textMinuteDaily,#txtPeriodWeekly,#txtHourWeekly,#txtMinuteWeekly,#txtPriodDays,#txtPeriodMonthly,#txtHourMonthly,#txtMinuteMonthly').keypress(function (event) {

            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                return true;
            }

        });

        //Start Date & Endby textbox - Prevent typing
        $("#textStartDate,#textEndBy").keydown(function (e) {
            e.preventDefault();
            return false;
        });


        // allow only 50 charcters in  subscription name
        $("#subNameID").on("keypress keyup paste", function (e) {
            var textMax = 50;
            var textLength = $('#subNameID').val().length;
            var textRemaining = textMax - textLength;
        });

        //Text End By And Start Date On change behaviour

        var currentDateShort = moment().format(defaultFilterDateFormat);
        var currentDate = moment().format(defaultFilterDateFormat);

        $("#textStartDate").val(currentDate);
        $("#textStartDate").datepicker('update', currentDate);
        $('#textStartDate').datepicker('setStartDate', currentDate);

        var setEndDateToDisp = moment($("#textStartDate").val()).add('days', 1).format(defaultFilterDateFormat);

        $("#textEndBy").val(moment().add('days', 60).format(defaultFilterDateFormat));
        $("#textEndBy").datepicker('update', $("#textEndBy").val());
        $('#textEndBy').datepicker('setStartDate', setEndDateToDisp);

        $("#textStartDate").datepicker().on('changeDate', function (ev) {
            var curt = moment().format(defaultFilterDateFormat);
            if (moment(curt).isAfter(moment($("#txtStartDate").val()).format(defaultFilterDateFormat))) {
                $("#textStartDate").change();
            }
        });

        $("#textStartDate").change(function () {
            var curt = moment().format(defaultFilterDateFormat);
            if (moment(curt).isAfter(moment($("#txtStartDate").val()).format(defaultFilterDateFormat))) {
                openAlertpopup(1, 'rpt_subscription_fromDate_check');
                $("#textStartDate").val(moment().format(defaultFilterDateFormat));
            } else {
                //var dateChageValue = $("#textStartDate").val();
                //var newDate = moment(dateChageValue, "DD.MM.YYYY");
                //newDate = newDate.add(60, 'days');
                //var date = moment(newDate).format(defaultFilterDateFormat);
                //$("#textEndBy").val(date);
                $("#textEndBy").val(moment($("#textStartDate").val()).add('days', 60).format(defaultFilterDateFormat));
                $("#textEndBy").datepicker('update', $("#textEndBy").val());
                var setEndDateToDisp = moment($("#textStartDate").val()).add('days', 1).format(defaultFilterDateFormat);
                $('#textEndBy').datepicker('setStartDate', setEndDateToDisp);
            }

        });

        $("#textEndBy").datepicker().on('changeDate', function (ev) {
            if (moment($("#textStartDate").val()).isAfter($("#textEndBy").val())) {
                $("#textEndBy").change();
            }
        });

        $("#textEndBy").change(function () {
            if (moment($("#textStartDate").val()).isAfter($("#textEndBy").val())) {
                openAlertpopup(1, 'rpt_subscription_endDate_check');
                $("#textEndBy").val($("#textStartDate").val());
            } else {

            }

        });
        //


        $('#subNameID').keyup(function () {
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



        $("#radio_noEnd, #radio_endAfter, #radio_endBy").on("click", function () {
            if ($("input:radio[id=radio_noEnd]").is(":checked")) {
                $('#endAfterSpinner').prop("disabled", true);
                $('#textEndBy').prop("disabled", true);
            }
            else if ($("input:radio[id=radio_endAfter]").is(":checked")) {
                $('#endAfterSpinner').removeAttr('disabled');
                $('#textEndBy').prop("disabled", true);
            }
            else if ($("input:radio[id=radio_endBy]").is(":checked")) {
                $('#textEndBy').removeAttr('disabled');
                $('#endAfterSpinner').prop("disabled", true);
            }
        });

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }



        //Add Subscription noEndDateSelected
        self.addSubList = function (gId, observableModelPopup, refreshGrid) {
            var userInfoList = new Array();
            var selectedUserData = getMultiSelectedData(gId);
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
                var ExecutionTimeObj = calculateDateTime($("#textStartDate").val(), $("#textHourDaily").val(), $("#textMinuteDaily").val(), $('select#ddlHourDaily option:selected').val())
                subscription.ExecutionTime = ExecutionTimeObj.time;
                subscription.ExecutionTimeClient = ExecutionTimeObj.clientTime;
                subscription.StartDate = ExecutionTimeObj.time;
                subscription.StartDateClient = ExecutionTimeObj.clientTime;

                if (self.checkRange() == 'EndBy') {
                    var EndDateObj = calculateDateTime($("#textEndBy").val(), 00, 00, 'AM')
                    subscription.EndDate = EndDateObj.time;
                    subscription.EndDateClient = EndDateObj.clientTime;
                }

            }
            if (self.checkRecurrence() == 'Daily') {
                subscription.RecurPeriod = $("#textPeriodDaily").val();
                var ExecutionTimeObj = calculateDateTime($("#textStartDate").val(), $("#textHourDaily").val(), $("#textMinuteDaily").val(), $('select#ddlHourDaily option:selected').val())
                subscription.ExecutionTime = ExecutionTimeObj.time;
                subscription.ExecutionTimeClient = ExecutionTimeObj.clientTime;
                subscription.StartDate = ExecutionTimeObj.time;
                subscription.StartDateClient = ExecutionTimeObj.clientTime;

                if (self.checkRange() == 'EndBy') {
                    var EndDateObj = calculateDateTime($("#textEndBy").val(), 00, 00, 'AM')
                    subscription.EndDate = EndDateObj.time;
                    subscription.EndDateClient = EndDateObj.clientTime;
                }

            }
            if (self.checkRecurrence() == 'Daily' && self.DailycheckSub() == 'everyweekday') {
                subscription.RecurPeriod = 0;
                subscription.RecurWeeks = '1,1,1,1,1,0,0';
            } else if (self.checkRecurrence() == 'Weekly') {
                var checkrecur = recurWeeksValue();
                if (checkrecur == '0,0,0,0,0,0,0') {
                    openAlertpopup(1, 'rpt_Recurrence_Pattern_is_invalid');
                    return;
                }
            }
            if (self.checkRecurrence() == 'Weekly') {

                subscription.RecurPeriod = $("#txtPeriodWeekly").val();

                var checkrecur = recurWeeksValue(); //Returns weekdays selection for recurrence 
                if (checkrecur == '0,0,0,0,0,0,0') {
                    openAlertpopup(1, 'rpt_Recurrence_Pattern_is_invalid');
                    return;
                }
                subscription.RecurWeeks = checkrecur;

                var ExecutionTimeObj = calculateDateTime($("#textStartDate").val(), $("#txtHourWeekly").val(), $("#txtMinuteWeekly").val(), $('select#ddlHourWeekly option:selected').val())
                subscription.ExecutionTime = ExecutionTimeObj.time;
                subscription.ExecutionTimeClient = ExecutionTimeObj.clientTime;
                subscription.StartDate = ExecutionTimeObj.time;
                subscription.StartDateClient = ExecutionTimeObj.clientTime;
                if (self.checkRange() == 'EndBy') {
                    var EndDateObj = calculateDateTime($("#textEndBy").val(), 00, 00, 'AM')
                    subscription.EndDate = EndDateObj.time;
                    subscription.EndDateClient = EndDateObj.clientTime;
                }

            }
            if (self.checkRecurrence() == 'Monthly') {
                subscription.RecurDay = $("#txtPriodDays").val();
                subscription.RecurPeriod = $("#txtPeriodMonthly").val();
                var ExecutionTimeObj = calculateDateTime($("#textStartDate").val(), $("#txtHourMonthly").val(), $("#txtMinuteMonthly").val(), $('select#ddlHourMonthly option:selected').val())
                subscription.ExecutionTime = ExecutionTimeObj.time;
                subscription.ExecutionTimeClient = ExecutionTimeObj.clientTime;
                subscription.StartDate = ExecutionTimeObj.time;
                subscription.StartDateClient = ExecutionTimeObj.clientTime;
                if (self.checkRange() == 'EndBy') {
                    var EndDateObj = calculateDateTime($("#textEndBy").val(), 00, 00, 'AM')
                    subscription.EndDate = EndDateObj.time;
                    subscription.EndDateClient = EndDateObj.clientTime;
                }
            }

            if (self.checkRange() == 'noEndDateSelected') {

                subscription.IsNoEndDate = true;
            } else {
                subscription.IsNoEndDate = false;
            }
            if (self.checkRange() == 'EndAfter') {
                subscription.RepeatOccurrence = $("#endAfterSpinner").val();
            }
            subscription.AttachmentType = self.radioSelectAttachment();//($('input[name=inlineRadioOptionsAttachment]:checked').val());
            subscription.FrequencyInterval = self.checkRecurrence();
            subscription.ReportId = chosenValue[0];
            subscription.SearchCriteria = '';
            subscription.SubscriptionName = $('#subNameID').val();
            addSubscriptionListDetails(gId, subscription, userInfoList, observableModelPopup, refreshGrid);
        }


        //Edit Subscription
        self.editSubList = function (gId, observableModelPopup, refreshGrid, subDetails) {
            var userInfoList = new Array();
            var selectedUserData = getMultiSelectedData(gId);
            var selectedIds = getSelectedUniqueId(gId);

            if (selectedIds.length <= 0) {
                openAlertpopup(1, 'rpt_Please_select_Recepients');
                return;
            }
            //alert(JSON.stringify(selectedUserData));
            /// TODO : Need to check : how to read the selected userdata from the grid.
            for (var i = 0; i < selectedIds.length; i++) {
                var objEUserInfo = new Object();
                objEUserInfo.LoginName = '';
                objEUserInfo.UserGuid = selectedIds[i];
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
                var ExecutionTimeObj = calculateDateTime($("#textStartDate").val(), $("#textHourDaily").val(), $("#textMinuteDaily").val(), $('select#ddlHourDaily option:selected').val())
                subscription.ExecutionTime = ExecutionTimeObj.time;
                subscription.ExecutionTimeClient = ExecutionTimeObj.clientTime;
                subscription.StartDate = ExecutionTimeObj.time;
                subscription.StartDateClient = ExecutionTimeObj.clientTime;

                if (self.checkRange() == 'EndBy') {
                    var EndDateObj = calculateDateTime($("#textEndBy").val(), 00, 00, 'AM')
                    subscription.EndDate = EndDateObj.time;
                    subscription.EndDateClient = EndDateObj.clientTime;
                }
            }
            if (self.checkRecurrence() == 'Daily') {
                subscription.RecurPeriod = $("#textPeriodDaily").val();
                var ExecutionTimeObj = calculateDateTime($("#textStartDate").val(), $("#textHourDaily").val(), $("#textMinuteDaily").val(), $('select#ddlHourDaily option:selected').val())
                subscription.ExecutionTime = ExecutionTimeObj.time;
                subscription.ExecutionTimeClient = ExecutionTimeObj.clientTime;
                subscription.StartDate = ExecutionTimeObj.time;
                subscription.StartDateClient = ExecutionTimeObj.clientTime;

                if (self.checkRange() == 'EndBy') {
                    var EndDateObj = calculateDateTime($("#textEndBy").val(), 00, 00, 'AM')
                    subscription.EndDate = EndDateObj.time;
                    subscription.EndDateClient = EndDateObj.clientTime;
                }
            }
            if (self.checkRecurrence() == 'Daily' && self.DailycheckSub() == 'everyweekday') {
                subscription.RecurPeriod = 0;
                subscription.RecurWeeks = '1,1,1,1,1,0,0';
            } else if (self.checkRecurrence() == 'Weekly') {
                var checkrecur = recurWeeksValue();
                subscription.RecurWeeks = checkrecur;
                if (checkrecur == '0,0,0,0,0,0,0') {
                    openAlertpopup(1, 'rpt_Recurrence_Pattern_is_invalid');
                    return;
                }
            }
            if (self.checkRecurrence() == 'Weekly') {
                subscription.RecurPeriod = $("#txtPeriodWeekly").val();
                var ExecutionTimeObj = calculateDateTime($("#textStartDate").val(), $("#txtHourWeekly").val(), $("#txtMinuteWeekly").val(), $('select#ddlHourWeekly option:selected').val())
                subscription.ExecutionTime = ExecutionTimeObj.time;
                subscription.ExecutionTimeClient = ExecutionTimeObj.clientTime;
                subscription.StartDate = ExecutionTimeObj.time;
                subscription.StartDateClient = ExecutionTimeObj.clientTime;
                if (self.checkRange() == 'EndBy') {
                    var EndDateObj = calculateDateTime($("#textEndBy").val(), 00, 00, 'AM')
                    subscription.EndDate = EndDateObj.time;
                    subscription.EndDateClient = EndDateObj.clientTime;
                }

            }
            if (self.checkRecurrence() == 'Monthly') {

                subscription.RecurDay = $("#txtPriodDays").val();
                subscription.RecurPeriod = $("#txtPeriodMonthly").val();
                var ExecutionTimeObj = calculateDateTime($("#textStartDate").val(), $("#txtHourMonthly").val(), $("#txtMinuteMonthly").val(), $('select#ddlHourMonthly option:selected').val())
                subscription.ExecutionTime = ExecutionTimeObj.time;
                subscription.ExecutionTimeClient = ExecutionTimeObj.clientTime;
                subscription.StartDate = ExecutionTimeObj.time;
                subscription.StartDateClient = ExecutionTimeObj.clientTime;
                if (self.checkRange() == 'EndBy') {
                    var EndDateObj = calculateDateTime($("#textEndBy").val(), 00, 00, 'AM');
                    subscription.EndDate = EndDateObj.time;
                    subscription.EndDateClient = EndDateObj.clientTime;
                }
            }

            if (self.checkRange() == 'noEndDateSelected') {
                subscription.IsNoEndDate = true;
            } else {
                subscription.IsNoEndDate = false;
            }
            if (self.checkRange() == 'EndAfter') {
                subscription.RepeatOccurrence = $("#endAfterSpinner").val();
            }

            var subsName = koUtil.SubscriptionSelectedata[0].SubscriptionName;
            var subsId = koUtil.SubscriptionSelectedata[0].SubscriptionId;


            subscription.AttachmentType = self.radioSelectAttachment();

            subscription.FrequencyInterval = self.checkRecurrence();
            subscription.ReportId = koUtil.SubscriptionSelectedata[0].ReportId;
            subscription.SearchCriteria = null;
            subscription.SubscriptionId = subsId;
            subscription.SubscriptionName = subsName;
            editSubscriptionListDetails(gId, subscription, userInfoList, observableModelPopup, refreshGrid);
        }
        seti18nResourceData(document, resourceStorage);
    }//addSubscriptionViewModel end

    function setSubDetails(subDetails, checkRecurrence, dailycheckSub, radioSelectAttachment, checkRange,checkSFTPDistribution,checkgZipCompression,checkSFTPPasswordProtected) {
        $("#subNameID").val(subDetails.SubscriptionName);
        $("#subNameID").prop('disabled', true);
        var freqInt = subDetails.FrequencyInterval;
        var attachmentType = subDetails.AttachmentType;
        var endAfter = subDetails.RepeatOccurrence;
        var recurPeriod = subDetails.RecurPeriod;
        var everyWeekDay = jsonLocalDateConversion(subDetails.ExecutionTime);
        var recurDay = subDetails.RecurDay;
        var isNoEndDate = subDetails.IsNoEndDate;
        var repeatOccurrence = subDetails.RepeatOccurrence;
        editDateDispaly = subDetails.ExecutionTime;

        var d = displayDateOnEditSubscription(subDetails.ExecutionTime);

        //-------- Recurrence pattern for daily, weekly, monthly-------------
        if (freqInt == 'Hourly') {
            checkRecurrence('Hourly');
            $("#hourID").show();
            $("#dayID").hide();
            $("#weekID").hide();
            $("#MonthID").hide();

            $("#textPeriodHourly").val(recurPeriod);
            $("#textHourDaily").val(d.hour);
            $("#textMinuteDaily").val(d.min);
            $("#ddlHourDaily").val(d.amPM);

        } else if (freqInt == 'Daily') {
            checkRecurrence('Daily');
            if (recurPeriod > 0) {
                dailycheckSub('every');
            } else {
                recurPeriod = 1;
                dailycheckSub('everyweekday');
            }
            $("#hourID").hide();
            $("#dayID").show();
            $("#weekID").hide();
            $("#MonthID").hide();

            $("#textPeriodDaily").val(recurPeriod);
            $("#textHourDaily").val(d.hour);
            $("#textMinuteDaily").val(d.min);
            $("#ddlHourDaily").val(d.amPM);

        } else if (freqInt == 'Weekly') {

            checkRecurrence('Weekly');
            $("#hourID").hide();
            $("#dayID").hide();
            $("#weekID").show();
            $("#MonthID").hide();

            $("#txtPeriodWeekly").val(recurPeriod);
            $("#txtHourWeekly").val(d.hour);
            $("#txtMinuteWeekly").val(d.min);
            $("#ddlHourWeekly").val(d.amPM);

            var recuWeeks = new Array();
            recuWeeks = subDetails.RecurWeeks.split(',');
            for (var i = 0; i < recuWeeks.length; i++) {
                var x = recuWeeks[i];
                if (x == 1) {
                    $("#Checkbox" + i).prop("checked", true);
                } else {
                    $("#Checkbox" + i).prop("checked", false);
                }
            }


        } else {
            checkRecurrence('Monthly');
            $("#hourID").hide();
            $("#dayID").hide();
            $("#weekID").hide();
            $("#MonthID").show();

            $("#txtPriodDays").val(recurDay);
            $("#txtPeriodMonthly").val(recurPeriod);
            $("#txtHourMonthly").val(d.hour);
            $("#txtMinuteMonthly").val(d.min);
            $("#ddlHourMonthly").val(d.amPM);
        }


        //-------- Attachment Format-------------
        if (attachmentType == 'PDF') {
            radioSelectAttachment('PDF');
        } else if (attachmentType == 'CSV') {
            radioSelectAttachment('CSV');
        } else {
            radioSelectAttachment('Excel');
        }


        //------------Range Of Recurrence---------------

        //------ start date------------------
        if (subDetails.StartDate) {
            var localTime = moment.utc(moment(subDetails.StartDate).format('YYYY-MM-DD HH:mm:ss')).toDate();
            var satrtDate = moment(localTime).format(defaultFilterDateFormat);
            $("#textStartDate").val(satrtDate);
        } else {
            var currentDate = moment().format(defaultFilterDateFormat);
            $("#textStartDate").val(currentDate);
        }


        if (isNoEndDate == false) {

            if (repeatOccurrence != '0') {
                $("#endAfterSpinner").prop('disabled', false);
                $("#textEndBy").prop('disabled', true);
                $("#endAfterSpinner").val(repeatOccurrence);
                checkRange("EndAfter");
            } else {
                $("#endAfterSpinner").prop('disabled', true);
                $("#endAfterSpinner").val('10');
                checkRange("EndBy");
                $("#textEndBy").prop('disabled', false);
                var localTime = moment.utc(moment(subDetails.EndDate).format('YYYY-MM-DD HH:mm:ss')).toDate();
                var endByDate = moment(localTime).format(defaultFilterDateFormat);
                $("#textEndBy").val(endByDate);
                $('#textEndBy').datepicker('update', endByDate);
            }
        } else {
            checkRange("noEndDateSelected");
            $("#endAfterSpinner").val('10');
            var currentDateShort = moment().format(AppConstants.get('defaultFilterDateFormat'));
            $("#textEndBy").val(moment().add('days', 60).format(defaultFilterDateFormat));
        }
		
		//SFTP Distribution changes
	
		
		if(subDetails.SubscribedforSftp&&subDetails.SubscribedforSftp==true){
			checkSFTPDistribution(true);
			$("#sftgZipCompressionDiv").removeClass('disabled');
			$("#sftgZipCompressionDiv").removeAttr('disabled');
			if(subDetails.ZipEnabledforSftpSubscrption&&subDetails.ZipEnabledforSftpSubscrption==true)
			{
				$("#sftpasswordProtectionDiv").removeClass('disabled');
				$("#sftpasswordProtectionDiv").removeAttr('disabled');		
				checkgZipCompression(true);				
			}else{
				$("#sftpasswordProtectionDiv").addClass('disabled');
				$("#sftpasswordProtectionDiv").prop('disabled', true);
				checkgZipCompression(false);			
			}
		}else{
			checkSFTPDistribution(false);
			$("#sftgZipCompressionDiv").addClass('disabled');
			$("#sftgZipCompressionDiv").prop('disabled', true);
			$("#sftpasswordProtectionDiv").addClass('disabled');
			$("#sftpasswordProtectionDiv").prop('disabled', true);
		}
		if(subDetails.ZipPassword&&subDetails.ZipPassword!=''){			
			$("#protectedPWDID").removeClass('disabled');
            $("#protectedPWDID").removeAttr('disabled');			
			$("#protectedPWDID").val(subDetails.ZipPassword);
			checkSFTPPasswordProtected(true);
		}else{
			 $("#protectedPWDID").addClass('disabled');
             $("#protectedPWDID").prop('disabled', true);
			checkSFTPPasswordProtected(false);
		}
    }


    //----------dispaly date in edit subscription textbox-------------
    function displayDateOnEditSubscription(dateDetails) {
        if (dateDetails && dateDetails != 'undefined') {
            var localTime = moment.utc(moment(dateDetails).format('YYYY-MM-DD HH:mm:ss')).toDate();
            var hour = moment(localTime).format('hh');
            var min = moment(localTime).format('mm');
            var amPM = moment(localTime).format('A');

            var dateEdit = new Object();
            dateEdit.hour = hour;
            dateEdit.min = min;
            dateEdit.amPM = amPM;


        }
        return dateEdit;
    }

    //date separation for text box
    function formatAMPM(date) {
        var dayNumber = date.getDate();
        var weekDayNumber = date.getDay();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var dtObj = new Object();
        dtObj.dayNumber = dayNumber;
        dtObj.hours = hours;
        dtObj.minutes = minutes;
        dtObj.ampm = ampm;
        dtObj.weekDayNumber = weekDayNumber;

        return dtObj;
    }

    function calDate(date) {

        var dd = date.getDate();
        var mm = date.getMonth() + 1; //January is 0!

        var yyyy = date.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        var today = mm + '/' + dd + '/' + yyyy;
        return today;
    }


    function generateTemplate(tempname, controllerId) {
        //new template code
        var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
        var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
        var cunanem = tempname + '1';
        ko.components.register(tempname, {
            viewModel: { require: ViewName },
            template: { require: 'plugin/text!' + htmlName }
        });
        // end new template code
    }

    function calculateDateTime(date, hours, minutes, hourFormat) {

        if (hourFormat == 'PM') {
            if (hours == 12) {
            } else {
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
        $("#weekID").find("input:checkbox").each(function (i, ob) {
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


    function getSubscriptionTypes(getSubscriptionTypeArray) {
        function callbackFunction(data, error) {
            var stArray = new Array();
            var cutArray = new Array();
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.getAllReportsResp)
                        data.getAllReportsResp = $.parseJSON(data.getAllReportsResp);

                    stArray = data.getAllReportsResp.StandardReports;
                    stArray.sort(function (a, b) { return a.ReportName.toUpperCase() > b.ReportName.toUpperCase() ? 1 : -1; })
                    for (var i = 0; i < stArray.length; i++) {
                        var obj = new Object();
                        obj.ReportName = stArray[i].ReportName;
                        obj.ReportId = stArray[i].ReportId;
                        getSubscriptionTypeArray.push(obj);
                        //getSubscriptionTypeArray.sort(function (a, b) { return a.ReportName.toUpperCase() > b.ReportName.toUpperCase() ? 1 : -1; })
                    }
                    var obj = new Object();
                    obj.ReportName = '----Custom Report----';
                    obj.ReportId = 0;
                    data.getAllReportsResp.CustomReports.splice(0, 0, obj);
                    cutArray = data.getAllReportsResp.CustomReports;
                    cutArray.sort(function (a, b) { return a.ReportName.toUpperCase() > b.ReportName.toUpperCase() ? 1 : -1; })
                    for (var i = 0; i < cutArray.length; i++) {
                        var obj = new Object();
                        obj.ReportName = cutArray[i].ReportName;
                        obj.ReportId = cutArray[i].ReportId;
                        getSubscriptionTypeArray.push(obj);
                        //getSubscriptionTypeArray.sort(function (a, b) { return a.ReportName.toUpperCase() > b.ReportName.toUpperCase() ? 1 : -1; })
                    }
                }
            }
        }

        var method = 'GetAllReports';
        var params = '{"token":"' + TOKEN() + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function getSubscriptionDetails(subscriptionID, subDetails, checkRecurrence, dailycheckSub, radioSelectAttachment, checkRange,checkSFTPDistribution,checkgZipCompression,checkSFTPPasswordProtected) {
        var getSubscriptionDetailsReq = new Object();
        getSubscriptionDetailsReq.SubscriptionId = subscriptionID;
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data && data.getSubscriptionDetailsResp) {
                        data.getSubscriptionDetailsResp = $.parseJSON(data.getSubscriptionDetailsResp);
                    }

                    subDetails = data.getSubscriptionDetailsResp.Subscription;
                    setSubDetails(subDetails, checkRecurrence, dailycheckSub, radioSelectAttachment, checkRange,checkSFTPDistribution,checkgZipCompression,checkSFTPPasswordProtected);
                    UserInfoListArray = data.getSubscriptionDetailsResp.UserInfoList;
                }
            }
        }

        var method = 'GetSubscriptionDetails';
        var params = '{"token":"' + TOKEN() + '","getSubscriptionDetailsReq":' + JSON.stringify(getSubscriptionDetailsReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }


    //start Active Users Grid
    function jqxgridActiveUsers(activeUserSubscription, gID) {

        if (koUtil.editFlag == 1) {
            selectedDataArr = [];
            var gridStorageArr = new Array();
            var gridStorageObj = new Object();

            for (var i = 0; i < UserInfoListArray.length; i++) {
                var temp = UserInfoListArray[i].UserGuid;
                selectedDataArr.push(temp);
            }
            gridStorageObj.checkAllFlag = 0;
            gridStorageObj.counter = UserInfoListArray.length;
            gridStorageObj.filterflage = 0;
            gridStorageObj.selectedDataArr = selectedDataArr;
            gridStorageObj.unSelectedDataArr = [];
            gridStorageObj.singlerowData = [];//UserInfoListArray;
            gridStorageObj.multiRowData = [];//UserInfoListArray;
            gridStorageObj.TotalSelectionCount = UserInfoListArray.length;
            gridStorageObj.highlightedRow = null;
            gridStorageObj.highlightedPage = null;
            gridStorageArr.push(gridStorageObj);
            var gridStorage = JSON.stringify(gridStorageArr);
            window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
            var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));


        } else {
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
        }



        // prepare the data
        var source =
            {
                dataType: "observablearray",
                localdata: activeUserSubscription,
                datafields: [
                    { name: 'FullName', map: 'FullName' },
                    { name: 'LoginName', map: 'LoginName' },
                    { name: 'UserGuid', map: 'UserGuid' },
                    { name: 'UserType', map: 'UserType' }
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
        $("#" + gID).jqxGrid(
            {

                width: "100%",
                height: "138px",
                source: dataAdapter,
                sortable: true,
                filterable: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                altrows: true,
                pagesize: activeUserSubscription.length,
                autoshowcolumnsmenubutton: false,
                showsortmenuitems: false,
                editable: true,
                enabletooltips: true,
                rowsheight: 32,
                columnsResize: true,
                columns: [
                    {
                        text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div style="margin-left:10px;"><div style="margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    {
                        text: i18n.t('rpt_user_names', { lng: lang }), datafield: 'FullName', minwidth: 100, editable: false, resizable: false, draggable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                    {
                        text: i18n.t('rpt_login_name', { lng: lang }), datafield: 'LoginName', minwidth: 100, editable: false, resizable: false, draggable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },
                    },
                ]
            });
        getUiGridBiginEdit(gID, 'UserGuid', gridStorage);
        callUiGridFilter(gID, gridStorage);
    }

    function getActiveUsersDetails(activeUserSubscription, gID) {
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.getActiveUsersResp)
                        data.getActiveUsersResp = $.parseJSON(data.getActiveUsersResp);
                    activeUserSubscription(data.getActiveUsersResp.userList);
                    jqxgridActiveUsers(activeUserSubscription(), gID);
                }
            }
        }
        var method = 'GetActiveUsers';
        var params = '{"token":"' + TOKEN() + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function addSubscriptionListDetails(gId, subscription, userInfoList, observableModelPopup) {

        var addSubscriptionReq = new Object();
        var ColumnSortFilter = new Object();
        var DeviceSearch = new Object();
        var IsIncludeFilter = new Object();
        addSubscriptionReq.ColumnSortFilter = null;
        addSubscriptionReq.DeviceSearch = null;
        addSubscriptionReq.IsIncludeFilter = true;
        addSubscriptionReq.ReportName = 'Add Subscription';
        addSubscriptionReq.Subscription = subscription;
        addSubscriptionReq.UserInfoList = userInfoList;


        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'subscription_successfully_added');
                    observableModelPopup('unloadTemplate');
                    $("#mainPageBody").removeClass('modal-open-appendon');
                    isAdpopup = '';
                    $("#modelAddSubcription").modal('hide');
                    gridFilterClear('jqxGridSubscriptionList');
                } else if (data.responseStatus.StatusCode == AppConstants.get('SUBSCRIPTION_EXISTS')) {
                    openAlertpopup(2, data.responseStatus.StatusMessage);
                } else if (data.responseStatus.StatusCode == AppConstants.get('SQL_INJECTION_ERROR')) {
                    openAlertpopup(2, 'sql_injection_error');
                }
            }
            $("#loadingDiv").hide();
        }

        var method = 'AddSubscription';
        var params = '{"token":"' + TOKEN() + '","addSubscriptionReq":' + JSON.stringify(addSubscriptionReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function editSubscriptionListDetails(gId, subscription, userInfoList, observableModelPopup) {

        var editSubscriptionReq = new Object();
        var ColumnSortFilter = new Object();
        var DeviceSearch = new Object();
        var IsIncludeFilter = new Object();

        editSubscriptionReq.ReportName = '';
        editSubscriptionReq.Subscription = subscription;
        editSubscriptionReq.UserInfoList = userInfoList;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'rpt_Subscription_successfully_updated');
                    observableModelPopup('unloadTemplate');
                    $("#mainPageBody").removeClass('modal-open-appendon');
                    isAdpopup = '';
                    $("#modelAddSubcription").modal('hide');
                    gridFilterClear('jqxGridSubscriptionList');
                    $('#textEndBy').datepicker('update', $('#textEndBy').val());
                }
            }
            $("#loadingDiv").hide();
        }

        var method = 'EditSubscription';
        var params = '{"token":"' + TOKEN() + '","editSubscriptionReq":' + JSON.stringify(editSubscriptionReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

    }
});