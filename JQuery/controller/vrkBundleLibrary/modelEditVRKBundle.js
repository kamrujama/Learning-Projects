define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
    var lang = getSysLang();

    return function modelDeleteContentLibrary() {
     
        var self = this;

        self.BundleName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_enter_bundle_name', {
                    lng: lang
                })
            }
        });
        $("#modelAddVRKBundle").draggable();
        self.Tags = ko.observable();

        self.enableAddBtnFunction = function () {
            self.isEnableAddBtn(true);
        }
        self.EnableOfApply = ko.observable(false);
        self.showSaveCancel = ko.observable(true);
        self.selectedDownloadOn = ko.observable();
        self.selectedDownloadOnOption = ko.observable();
        var selecteddownloadoptionstring = AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT');
        var selecteddownloadAfteroptionstring = AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT');
        self.IsDateChanged=ko.observable(false);
        var now = new Date();
        var dateobj = formatAMPM(now);

        $("#textHourDaily").val(dateobj.hours);
        $("#textMinuteDaily").val(dateobj.minutes);
        $("#dateAMPM").val(dateobj.ampm);


        //Date Picker 
        var date = new Date();
        date.setDate(date.getDate());
        $("#downloadDatePicker").datepicker({ startDate: date, autoclose: true });

        currentSelectedDownloadOnOption = AppConstants.get('VRK_SCHEDULE_TYPE_NOW');

        $('#downloadDatePicker').prop('value', currentDate);

        var currentDate = moment().format(SHORT_DATE_FORMAT);
        var currentDate = moment().format('MM/DD/YYYY');
        $('#downloadDatePicker').prop('value', currentDate);


        ///spinner
        $('[data-trigger="spinner"]').spinner();


        $("#bundleName").on('change keyup paste', function () {
            if ($("#bundleName").val() != "") {                
                    $('#btn_editLibrary').removeAttr('disabled');               
            }
        });

        $("#tagTxt").on('change keyup paste', function () {
            if ($("#tagTxt").val() != globalVariableForEditBundle[0].selectedData[0].Tags) {              
                    $('#btn_editLibrary').removeAttr('disabled');               
            }
            else {
                $('#btn_editLibrary').prop('disabled', true);
            }
        });
        //focus on first textbox
        $('#modelpopup').on('shown.bs.modal', function () {
            $('#bundleName').focus();
        });

        $('#modelpopup').keydown(function (e) {
            if ($('#btn_cancelEdit').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#bundleName').focus();
            }
        });
        self.getVRKBundleRequestObject = function () {
            
            var setVRKBundleReq = new Object();
            setVRKBundleReq.VRKUpdateBundleDetails = new Object();
            setVRKBundleReq.VRKUpdateBundleDetails.BundleFile = selectedBundle.BundleFile;
            setVRKBundleReq.VRKUpdateBundleDetails.BundleId = selectedBundle.VRKBundleId;

            if (selectedBundle.BundleName != $("#bundleName").val()) {
                setVRKBundleReq.VRKUpdateBundleDetails.NewBundleName = $("#bundleName").val();
            }
            else {
                setVRKBundleReq.VRKUpdateBundleDetails.NewBundleName = '';
            }
            setVRKBundleReq.VRKUpdateBundleDetails.OldBundleName = selectedBundle.BundleName;
            //setVRKBundleReq.VRKUpdateBundleDetails.DownloadOn = dteDwldOn.selectedDate;
            setVRKBundleReq.VRKUpdateBundleDetails.Tags = $("#tagTxt").val();

            var today = new Date()
            var downloadDateTime;
            var downloadOn;
            //Download hours
            var downloadHoursParseInt = $("#textHourDaily").val();
            var downloadHour = parseInt(downloadHoursParseInt);
            if (downloadHour == 12 && $('#dateAMPM :selected').text() == "AM") {
                downloadHour = 0;
            }
            else if ($('#dateAMPM :selected').text() == "PM") {
                if (downloadHour == 12)
                    downloadHour = 12;
                else
                    downloadHour = downloadHour + 12;
            }
            if (currentSelectedDownloadOnOption == AppConstants.get('VRK_SCHEDULE_TYPE_AFTER')) {
                var date1picker = new Date(Date.parse(($("#downloadDatePicker").val())));
                downloadOn = new Date(date1picker.getFullYear(), date1picker.getMonth(), date1picker.getDate(), downloadHour, $("#textMinuteDaily").val(), 0, 0);
                downloadDateTime = dateTimeToLocalDateTimeStringDate($("#downloadDatePicker").val(), downloadHour, $("#textMinuteDaily").val());
                if (selecteddownloadAfteroptionstring== AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT')) {
                    setVRKBundleReq.VRKUpdateBundleDetails.IsMaintenance = false;
                } else {
                    setVRKBundleReq.VRKUpdateBundleDetails.IsMaintenance = true;
                }
                setVRKBundleReq.VRKUpdateBundleDetails.ScheduleType = AppConstants.get('VRK_SCHEDULE_TYPE_AFTER');
            }
            else if (currentSelectedDownloadOnOption == AppConstants.get('VRK_SCHEDULE_TYPE_NOW')) {
                downloadOn = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds());
                downloadDateTime = dateTimeToLocalDateTimeString(today.getFullYear(),today.getMonth(), today.getDate(), today.getHours(), today.getMinutes());
                if (selecteddownloadoptionstring ==  AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT')) {
                    setVRKBundleReq.VRKUpdateBundleDetails.IsMaintenance = false;
                } else {
                    setVRKBundleReq.VRKUpdateBundleDetails.IsMaintenance = true;
                }
                setVRKBundleReq.VRKUpdateBundleDetails.ScheduleType = AppConstants.get('VRK_SCHEDULE_TYPE_NOW');
            } else if (currentSelectedDownloadOnOption == AppConstants.get('VRK_SCHEDULE_TYPE_NONE')) {
                downloadOn = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds());
                downloadDateTime = dateTimeToLocalDateTimeString(today.getFullYear(),today.getMonth(), today.getDate(), today.getHours(), today.getMinutes());
                setVRKBundleReq.VRKUpdateBundleDetails.IsMaintenance = false;
                setVRKBundleReq.VRKUpdateBundleDetails.ScheduleType = AppConstants.get('VRK_SCHEDULE_TYPE_NONE');
            }
            if (selectedBundle.ScheduleType == AppConstants.get('VRK_SCHEDULE_TYPE_NOW') || selectedBundle.ScheduleType == AppConstants.get('VRK_SCHEDULE_TYPE_AFTER')) {
                setVRKBundleReq.VRKUpdateBundleDetails.IsDownloadModified = false;
            } else {
                setVRKBundleReq.VRKUpdateBundleDetails.IsDownloadModified = true;
            }
            var utc = new Date(downloadOn.getTime() + downloadOn.getTimezoneOffset() * 60000);
            downloadDateTimeString = dateTimeToLocalDateTimeString(utc.getFullYear(), utc.getMonth(), utc.getDate(), utc.getHours(), utc.getMinutes());
            setVRKBundleReq.VRKUpdateBundleDetails.DownloadOn = createJSONTimeStamp(downloadDateTime);
            setVRKBundleReq.VRKUpdateBundleDetails.DownloadOnUTC = createJSONTimeStamp(downloadDateTimeString);
            setVRKBundleReq.VRKUpdateBundleDetails.IsDateChanged = self.IsDateChanged();
            return setVRKBundleReq;
        }
        self.validateDate=function(){
            var today = new Date();
            var currentHour = today.getHours();// % 12 || 12;
            var dateBackup = currentHour % 12 || 12;
            var currentmin = today.getMinutes()

            var downloadHour = $("#textHourDaily").val();
            var pmin = $("#textMinuteDaily").val();

            if (downloadHour == 12 && $('#dateAMPM :selected').text() == "AM") {
                downloadHour = 0;
            }
            else if ($('#dateAMPM :selected').text() == "PM") {
                if (downloadHour == 12)
                    downloadHour = 12;
                else
                    downloadHour = parseInt(downloadHour) + 12;
            }
            var currentDate = Date.parse(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0));
            var selectedDate = $("#downloadDatePicker").datepicker('getDate');
            var convertedSelectedDate = Date.parse(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0));
            if (currentSelectedDownloadOnOption == AppConstants.get('VRK_SCHEDULE_TYPE_AFTER') && currentDate == convertedSelectedDate) {
                if (downloadHour < currentHour) {
                    $("#textHourDaily").val(dateBackup);
                    openAlertpopup(1, 'future_time');
                    return false;
                }
                else if (pmin < currentmin && currentHour >= downloadHour) {
                    $("#textMinuteDaily").val(currentmin + parseInt(1));
                    openAlertpopup(1, 'future_time');
                    return false;
                }else{
                    return true;
                }
            }else{
                return true;
            }
        }
        // Add package using in Enter Key
        $("#editVRKBundles").on('keypress', 'input, textarea, select', function (e) {
            var keyCode = e.which || e.keyCode;
            if (keyCode == 13) {

                var retval = checkerror();
                if (retval == null || retval == "") {
                    var validate = self.validateDate();
                    if (validate == true) {
                        setVRKBundle(self.getVRKBundleRequestObject(), observableModelPopup);
                    }                   
                } else {
                    return false;
                }
            }
        });

        $('#bundleName').keyup(function () {
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
        self.setStatus_Apply = function (isEnabled) {
            self.EnableOfApply(isEnabled);
            //    $("#dateAMPM").val("AM");
            var now = new Date();
            var dateobj = formatAMPM(now);
            $("#applyOnTimeHour").val(dateobj.hours);
            $("#applyOnTimeMinute").val(dateobj.minutes);
            $("#dateAMPM").val(dateobj.ampm);
            return true;
        }
        self.SelectedOnDownloadNowOptionClick = function (selecteddownloadoption) {
            selecteddownloadoptionstring = selecteddownloadoption;
            self.selectedDownloadOnOption(selecteddownloadoption);
            return true;
        }
        self.editselectDownloadAfterOption = ko.observable(AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT'));
        self.onEditDownloadAfterOptionClick = function (selecteddownloadoption) {
            selecteddownloadAfteroptionstring = selecteddownloadoption;
            self.editselectDownloadAfterOption(selecteddownloadoption);
            return true;
        }
        self.stateEditChangeDownloadNowOptions = function (flag) {
            if (flag == 1) {
                $("#downloadNowSection").prop("disabled", true);
                $("#downloadNowSection").addClass('disabled');
                $("#downloadonnextcontact").addClass('disabled');
                $("#downloadonmaintanancewindow").addClass('disabled');
            } else if (flag == 2) {
                $("#downloadNowSection").prop("disabled", false);
                $("#downloadNowSection").removeClass('disabled');
                $("#downloadonnextcontact").removeClass('disabled');
                $("#downloadonmaintanancewindow").removeClass('disabled');
            }

        }
        self.stateEditChangeDownloadAfterOptions = function (flag) {
            if (flag == 1) {
                $("#editdownloadAfterSection").prop("disabled", true);
                $("#editdownloadAfterSection").addClass('disabled');
                $("#editdownloadafternextcontact").addClass('disabled');
                $("#editdownloadaftermaintanancewindow").addClass('disabled');
            } else if (flag == 2) {
                $("#editdownloadAfterSection").prop("disabled", false);
                $("#editdownloadAfterSection").removeClass('disabled');
                $("#editdownloadafternextcontact").removeClass('disabled');
                $("#editdownloadaftermaintanancewindow").removeClass('disabled');
            }
        }
        self.stateEditChangeDownloadNowOptions(1);
        self.stateEditChangeDownloadAfterOptions(1);
        
        self.selectedMaintenanceWindowClick = function () {
            $('#btn_editLibrary').removeAttr('disabled');
            self.stateEditChangeDownloadNowOptions(2);
            self.stateEditChangeDownloadAfterOptions(1);
            self.setStatus_Apply(false);
            self.IsDateChanged(true);
            currentSelectedDownloadOnOption = AppConstants.get('VRK_SCHEDULE_TYPE_NOW');
            return true;
        }

        self.selectedDownloadAfterDateTime = function () {
            $('#btn_editLibrary').removeAttr('disabled');
            self.stateEditChangeDownloadNowOptions(1);
            self.stateEditChangeDownloadAfterOptions(2);
            currentSelectedDownloadOnOption = AppConstants.get('VRK_SCHEDULE_TYPE_AFTER');
            self.setStatus_Apply(true);
            self.IsDateChanged(true);
            return true;
        }

        self.selectedDownloadNoneClick = function () {
            self.stateEditChangeDownloadNowOptions(1);
            self.stateEditChangeDownloadAfterOptions(1);
            currentSelectedDownloadOnOption = AppConstants.get('VRK_SCHEDULE_TYPE_NONE');
            self.setStatus_Apply(false);
            return true;
        }

        var selectedBundle = globalVariableForEditBundle[0].selectedData[0];
       
        self.BundleName = selectedBundle.BundleName;
        self.Tags = selectedBundle.Tags;
        self.stateChangeDownloadOptions = function (flag) {
            if (flag == 'disable') {
                $("#SelectedDownloadOptions").addClass('disabled');
                $("#SelectedDownloadOptions").prop("disabled", true);
            } else if(flag=='enable') {
                $("#SelectedDownloadOptions").removeClass('disabled');
                $("#SelectedDownloadOptions").prop("disabled", false);
            }
           
        }
       
        self.selectedDownloadOnOption(AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT'));
        if (selectedBundle.ScheduleType == AppConstants.get('VRK_SCHEDULE_TYPE_NOW')) {
            if (selectedBundle.IsMaintenance == true) {
                selecteddownloadoptionstring = AppConstants.get('VRK_SCHEDULE_TYPE_NEXTMAINTANACE');;               
                self.selectedDownloadOnOption(AppConstants.get('VRK_SCHEDULE_TYPE_NEXTMAINTANACE'));
            } else if (selectedBundle.IsMaintenance == false) {
                selecteddownloadoptionstring = AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT');
                self.selectedDownloadOnOption( AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT'));
            }
            currentSelectedDownloadOnOption = AppConstants.get('VRK_SCHEDULE_TYPE_NOW');
            self.selectedDownloadOn(AppConstants.get('VRK_SCHEDULE_TYPE_NOW'));
            self.stateChangeDownloadOptions('disable');
        } else if (selectedBundle.ScheduleType == AppConstants.get('VRK_SCHEDULE_TYPE_AFTER')) {
            var newDate = new Date(selectedBundle.DownloadOn);
            var offsetMilliseconds = newDate.getTimezoneOffset() * 60 * 1000;
            newDate.setTime(newDate.getTime() + offsetMilliseconds);

            var downloadOn = moment(newDate).format(SHORT_DATE_FORMAT);
            $("#downloadDatePicker").val(downloadOn);
            var dateobj = formatAMPM(newDate);
            $("#textHourDaily").val(dateobj.hours);
            $("#textMinuteDaily").val(dateobj.minutes);
            $("#dateAMPM").val(dateobj.ampm);            
            if (selectedBundle.IsMaintenance == true) {
                selecteddownloadAfteroptionstring = AppConstants.get('VRK_SCHEDULE_TYPE_NEXTMAINTANACE');
                self.editselectDownloadAfterOption(AppConstants.get('VRK_SCHEDULE_TYPE_NEXTMAINTANACE'));
            } else if (selectedBundle.IsMaintenance == false) {
                selecteddownloadAfteroptionstring = AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT');
                self.editselectDownloadAfterOption( AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT'));
            }
            currentSelectedDownloadOnOption = AppConstants.get('VRK_SCHEDULE_TYPE_AFTER');
            self.selectedDownloadOn(AppConstants.get('VRK_SCHEDULE_TYPE_AFTER'));
            self.stateChangeDownloadOptions('disable');
        } else if (selectedBundle.ScheduleType == AppConstants.get('VRK_SCHEDULE_TYPE_NONE')) {
            currentSelectedDownloadOnOption = AppConstants.get('VRK_SCHEDULE_TYPE_NONE');
            self.selectedDownloadOn(AppConstants.get('VRK_SCHEDULE_TYPE_NONE'));
            self.stateChangeDownloadOptions('enable');
        }
       

        //unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
        };

        self.editVRKBundle = function (observableModelPopup) {
            var retval = checkerror();
            if (retval == null || retval == "") {
                var validate = true;
                if (selectedBundle.ScheduleType == AppConstants.get('VRK_SCHEDULE_TYPE_NONE') && currentSelectedDownloadOnOption == AppConstants.get('VRK_SCHEDULE_TYPE_AFTER')) {
                     validate = self.validateDate();
                }               
                if (validate == true) {
                    setVRKBundle(self.getVRKBundleRequestObject(), observableModelPopup);
                }
            } else {
                return false;
            }
        }

        //click on yes button to delete library
        function checkerror(chekVal) {
            var retval = '';
            //applying filter
            var bundleName = $("input#bundleName");
            bundleName.val(bundleName.val().replace(/^\s+/, ""));
            if ($("#bundleName").val() == "") {
                retval += 'Bundle Name';
                self.BundleName(null);
                $("#please_enter_bundle_name").show();
            } else {
                retval += '';
            }
            return retval;
        };
        seti18nResourceData(document, resourceStorage);
    };

    function setVRKBundle(setVRKBundleVO, observableModelPopup) {
        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    observableModelPopup('unloadTemplate');
                    $("#modelpopup").modal('hide');
                    gridFilterClear('jqxgridVRKBundlesLib');
                    openAlertpopup(0, 'vrk_changes_successfully_saved');
                }
                else if (data.responseStatus.StatusCode == AppConstants.get('ESTABLISHMENT_GROUPNAME_EDIT_SAME')) {
                    openAlertpopup(2, data.responseStatus.StatusMessage);
                } 
            }
        }
        var method = 'SetVRKBundle';
        var params = '{"token":"' + TOKEN() + '","setVRKBundleReq":' + JSON.stringify(setVRKBundleVO) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
   
});

function formatAMPM(date) {
    var dayNumber = date.getDay();
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

    return dtObj;
}
