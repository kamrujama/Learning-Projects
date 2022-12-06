define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "bootstrap", "bootstrapDatePicker", "moment", "spinner", "utility"], function (ko, koUtil) {
    
    var lang = getSysLang();
    var uploadedfiledata = new Array();
    
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    var systemConfiguartion = new Object();

    var selecteddownloadoptionstring = AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT');
    
    return function AddVRKBundleViewModel() {
      
      
        var self = this;
        self.isEnableAddBtn = ko.observable(false);
        self.rbgDownloadOnCheckbox = ko.observable(AppConstants.get('VRK_SCHEDULE_TYPE_NOW'));
        self.showSaveCancel = ko.observable(true);
        self.chkDownloadNowContact=ko.observable(true);
        self.chkDownloadNowMaintenanace = ko.observable(false);
        self.validatedFiles = ko.observableArray();
        self.ConfigName = ko.observable();
        self.ConfigValue = ko.observable();
        self.BundleFiles = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_selct_bundle_file', {
                    lng: lang
                })
            }
        });

        self.BundleName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_enter_bundle_name', {
                    lng: lang
                })
            }
        });
        self.Tags = ko.observable();
        var IsDuplicateBundleFileExist = false;
        var IsInvalidFileExist = false;
        self.enableAddBtnFunction = function () {
            self.isEnableAddBtn(true);
        }
        self.dateEnableOfApply = ko.observable(false);

        //self.GetConfigurableValuesForVRK = ko.observableArray();
        //GetConfigurableValues(self.GetConfigurableValuesForVRK);

        var now = new Date();
        var dateobj = formatAMPM(now);

        $("#textHourDaily").val(dateobj.hours);
        $("#textMinuteDaily").val(dateobj.minutes+parseInt(1));
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
        var windowheight = $(window).height();
        windowheight = (windowheight - $("#vrkUploadProgressTable").offset().top) - $(".fixed-footer").height() - 105;
        $("#vrkUploadProgressTableBody").css("height",windowheight);

        // unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup(popupName);
            $("#mainPageBody").removeClass('modal-open-appendon');
            
        };

        self.cancelClick = function () {           
            self.removeItemsOnCancel();            
            if (IsMarketPlaceEnabled) {
                $("#mpvrkBundleLibrarysublink").click();
            } else {
                $("#vrkBundleLibrarysublink").click();
            }
        }

        //open upload file input dialog box on enter key
        $("#divBtnFileInput").on('keypress', function (e) {
            var keyCode = e.which || e.keyCode;
            if (keyCode == 13) {
                event.preventDefault();
                $('#fileinput').click();
            }
        });

        //end
        var fileNames = '';

        self.handleFileSelect = function () {
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                openAlertpopup(1, 'the_file_apis_are_not_fully_supported_in_this_browser');
                return;
            }
            input = document.getElementById('fileinput');
            if (input && input.value != "") {
                if (!input) {
                    openAlertpopup(1, 'cannot_find_the_fileinput_element');
                }
                else if (!input.files) {
                    openAlertpopup(1, "this_browser_doesn't_seem_to_support_the_`files`_property_of_file_inputs");
                }
                else if (!input.files[0]) {
                    return;
                }
                else {
                    var file;
                    var fileVO;
                    uploadedfiledata = new Array();
                    var errorFoundColl = new Array();

                    var fileList = [];

                    for (var i = 0; i < input.files.length; i++) {
                        file = input.files[i];
                        if (validateIsFileExists(input.files[i])) {
                            errorFoundColl.push(file.name + " *Duplicate");
                        } else {
                            fileList.push(file);
                        }
                    }

                    if (fileList.length >= 1) {
                        for (var i = 0, len = fileList.length; i < len; i++) {
                            // loop fileInput.files
                            file = fileList[i];
                            var validStatus = validateFile(file);
                            if (validStatus == '') {
                                fileVO = new Object();
                                fileVO.FileName = file.name;
                                fileVO.FileSize = formatFileSize(file.size);
                                fileVO.status = '';
                                fileVO.File = file;
                                fileVO.TotalKeys = "";
                                fileVO.SerialNumberCount = "";
                                fileVO.PendingSerialNumberCount = "";
                                fileVO.MissingSerialNumberCount = "";
                                fileVO.AdditionalInfo = "";
                                fileVO.IsValidated = false;
                                fileVO.progress = 0;
                                uploadedfiledata.push(fileVO);
                            } else {
                                errorFoundColl.push(file.name + " " + validStatus);
                            }
                        }

                        var totalCount = uploadedfiledata.length + self.selectedFiles().length;
                        var configValue = systemConfiguartion.ConfigValue;

                        if (totalCount > configValue) {
                            var msg = i18n.t('maximum_vrkBundles', { lng: lang }) + " " + configValue;
                            openAlertpopup(1, msg);
                            return;
                        }

                        for (var i = 0; i < uploadedfiledata.length; i++) {
                            self.selectedFiles.push(uploadedfiledata[i]);
                        }

                        fileNames = getFileNames(self.selectedFiles());
                        self.BundleFiles(fileNames);

                        var today = new Date();
                        var bundleName = moment(today).format('YYYYMMDD');
                        bundleName = 'VRK_Bundle_' + bundleName + '_' + today.getHours().toString() + today.getMinutes().toString() + today.getSeconds().toString();

                        if ($("#bundleName").val() == '') {
                            self.BundleName(bundleName);
                        }
                        self.validateVRKBundles();
                    }
                    if (errorFoundColl.length >= 1) {
                        var message = i18n.t('vrk_duplicate_file_selected', { lng: lang }) + errorFoundColl.join("\n\n, ");
                        openAlertpopup(1, message);
                    }

                }
            }
        }

        var redundantFiles, currentSelectedDownloadOnOption;
        var numCurrentUpload = 0;
        var totalFileCount = 1;
        self.validateVRKBundles = function () {
            var retval = checkerror();
            if (retval == null || retval == "") {
                redundantFiles = '';
                var today = new Date();
                totalFileCount = self.selectedFiles().length;
                numCurrentUpload = 0;
                if(totalFileCount>0){
                    $("#loadingDiv").show();
                    numberOfResponseReceived = 0;
                    $("#btn_uploadLibrary").addClass("disabled");
                    $("#btn_uploadLibrary").prop("disabled", true);
                    var validateFiles = _.where(self.selectedFiles(), { IsValidated: false });
                    uploadFiles = self.selectedFiles();
                    for (var i = 0; i < uploadFiles.length; i++) {
                        var VO = self.selectedFiles()[i];
                        if (VO.IsValidated == false) {
                            VO.FileName = uploadFiles[i].FileName;
                            VO.FileSize = uploadFiles[i].FileSize;
                            VO.TotalKeys = "";
                            VO.SerialNumberCount = "";
                            VO.PendingSerialNumberCount = "";
                            VO.MissingSerialNumberCount = "";
                            self.validatedFiles()[i] = VO;
                            fileUploadVRKBundle(redundantFiles, validateFiles.length, numCurrentUpload, self.selectedFiles(), uploadFiles[i], i);
                        }                      
                    }                  
                }
            } else {

            }
        }
        self.addVRKBundles = function (observableModelPopup) {

            // hour, minute validation
            var now = new Date();
            var currentHour = now.getHours();// % 12 || 12;
            var dateBackup = currentHour % 12 || 12;
            var currentmin = now.getMinutes()

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
            var currentDate = Date.parse(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
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
                }
            }

           
            var retval = checkerror();
            if (retval == null || retval == "") {
                vrkSessionName = redundantFiles = '';
                var today = new Date();
                vrkSessionName = today.getDate().toString()+today.getMonth().toString()+today.getFullYear().toString()+today.getHours().toString()+today.getMinutes().toString()+today.getSeconds().toString()+today.getMilliseconds().toString();
                totalFileCount = self.selectedFiles().length;
                numCurrentUpload = 0;
                var validatedFiles = getBundleFileAfterValidate(self.selectedFiles());                
                if (validatedFiles.length > 0) {
                    $("#modelAddVRKID").modal('show');
                    var invalidFiles = _.where(self.selectedFiles(), { IsInvalidBundle: true });
                    var duplicateBundleFiles = _.where(self.selectedFiles(), { IsDuplicateBundle: true });
                    if (duplicateBundleFiles.length >0 && invalidFiles.length == 0) {
                        $("#uploadAddMsgID").text(i18n.t('vrk_bundle_files_selected_with_duplicate_bundle', {lng: lang}));
                    } else if (invalidFiles.length > 0 && duplicateBundleFiles.length == 0) {
                        $("#uploadAddMsgID").text(i18n.t('vrk_bundle_files_selected_with_invalid', {lng: lang}));
                    } else if (duplicateBundleFiles.length > 0 && invalidFiles.length > 0) {
                        $("#uploadAddMsgID").text(i18n.t('vrk_bundle_files_selected_with_duplicate_invalid', {lng: lang }));
                    } else {
                        if (validatedFiles.length > 1) {
                            $("#uploadAddMsgID").text(i18n.t('vrk_bundle_files_selected', { vrkFilesCount: totalFileCount }, { lng: lang }));
                        } else {
                            $("#uploadAddMsgID").text(i18n.t('vrk_bundle_single_file_selected', { vrkFilesCount: totalFileCount }, { lng: lang }));
                        }
                    }
                    
                }
            } else {

            }
        }
        function getBundleFileAfterValidate(validateFiles) {
            var BundleFileDetails = new Array();
            for (var i = 0; i < validateFiles.length; i++) {
                if (validateFiles[i].IsDuplicateBundle == false && validateFiles[i].IsInvalidBundle == false) {
                    var fileObject = new Object();
                    fileObject.FileName = validateFiles[i].FileName;
                    fileObject.FilePath = validateFiles[i].FilePath;
                    fileObject.FileSize = validateFiles[i].FileSize;
                    BundleFileDetails.push(fileObject);
                } 
            }
            if (BundleFileDetails.length < 1) {
                $("#loadingDiv").hide();    
            } 
           return BundleFileDetails;
        }
        function getInvalidDuplicateBundleFileAfterValidate(validateFiles) {
            var InvalideFileDetails = new Array();
            for (var i = 0; i < validateFiles.length; i++) {
                if (validateFiles[i].IsDuplicateBundle == true || validateFiles[i].IsInvalidBundle == true) {
                    var fileObject = new Object();
                    fileObject.FileName = validateFiles[i].FileName;
                    fileObject.FilePath = validateFiles[i].FilePath;
                    fileObject.FileSize = validateFiles[i].FileSize;
                    InvalideFileDetails.push(fileObject);
                }
            }
            if (InvalideFileDetails.length < 1) {
                $("#loadingDiv").hide();
            }
            return InvalideFileDetails;
        }
        var validatedFiles;
        var invalidFiles;
        self.continueWithFileAdd = function (observableModelPopup) {
            $("#loadingDiv").show();
            validatedFiles = getBundleFileAfterValidate(self.selectedFiles());
            invalidFiles = getInvalidDuplicateBundleFileAfterValidate(self.selectedFiles());            
            AddValidatedVRKBundle(numCurrentUpload, currentSelectedDownloadOnOption, validatedFiles, observableModelPopup);
            CancelVRKFile(getFilePaths(invalidFiles));
        }
        
      
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



        //////////////////////////////////Download On////////////////////////////////////////////////////

        self.setEnabledStatus_Apply = function (isEnabled) {
            self.dateEnableOfApply(isEnabled);
            //    $("#dateAMPM").val("AM");

            var now = new Date();
            var dateobj = formatAMPM(now);

            $("#applyOnTimeHour").val(dateobj.hours);
            $("#applyOnTimeMinute").val(dateobj.minutes);
            $("#dateAMPM").val(dateobj.ampm);

            return true;
        }
        self.stateChangeDownloadNowOptions = function (flag) {
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
        self.stateChangeDownloadAfterOptions = function (flag) {
            if (flag == 1) {
                $("#downloadAfterSection").prop("disabled", true);
                $("#downloadAfterSection").addClass('disabled');
                $("#downloadafternextcontact").addClass('disabled');
                $("#downloadaftermaintanancewindow").addClass('disabled');
            } else if(flag==2){
                $("#downloadAfterSection").prop("disabled", false);
                $("#downloadAfterSection").removeClass('disabled');
                $("#downloadafternextcontact").removeClass('disabled');
                $("#downloadaftermaintanancewindow").removeClass('disabled');
            }
        }
        self.stateChangeDownloadAfterOptions(1);
        self.maintenanceWindowClick = function () {
            self.stateChangeDownloadNowOptions(2);
            self.stateChangeDownloadAfterOptions(1);
            self.setEnabledStatus_Apply(false);
            currentSelectedDownloadOnOption = AppConstants.get('VRK_SCHEDULE_TYPE_NOW');
            return true;
        }

        self.downloadAfterDateTime = function () {
            self.stateChangeDownloadNowOptions(1);
            self.stateChangeDownloadAfterOptions(2);
            currentSelectedDownloadOnOption = AppConstants.get('VRK_SCHEDULE_TYPE_AFTER');
            self.setEnabledStatus_Apply(true);
            return true;
        }

        self.downloadNoneClick = function () {
            self.stateChangeDownloadNowOptions(1);
            self.stateChangeDownloadAfterOptions(1);
            currentSelectedDownloadOnOption = AppConstants.get('VRK_SCHEDULE_TYPE_NONE');
            self.setEnabledStatus_Apply(false);
            return true;
        }

        self.hideinfoVRKBundle = function (id) {

            $("#"+id).modal('hide');
            if (isAdpopup != '') {
                $("#mainPageBody").addClass('modal-open-appendon');
            } else {
                $("#mainPageBody").removeClass('modal-open-appendon');
            }
            var filtergridID = $('.jqx-grid').prop('id');
            if (filtergridID == undefined) {

            } else {
                $('.totxtclass').val('');
                if (filtercheckfiled != '') {
                    if (dateFiltercheck == 'datefilterinfo') {
                        dateFiltercheck = '';
                        $("#" + filtergridID).jqxGrid('openmenu', filtercheckfiled);
                        filtercheckfiled = '';
                    }
                }
            }
            if (id == "conformationPopupVRKBundle") {
                if (IsMarketPlaceEnabled) {
                    $("#mpvrkBundleLibrarysublink").click();
                } else {
                    $("#vrkBundleLibrarysublink").click();
                }
            }
        }
        ////////////////////////////////////////End////////////////////////////////////////////////

        $("#fileinput").on('change keyup paste', function () {
            if ($("#fileinput").val() != "") {
                
                    $('#btn_uploadLibrary').removeAttr('disabled');
                
            }
        });

        $("#bundleName").on('change keyup paste', function () {
            if ($("#bundleName").val() != "") {            
                    $('#btn_uploadLibrary').removeAttr('disabled');              
            }
        });

        $("#tagTxt").on('change keyup paste', function () {
            if ($("#tagTxt").val() != "") {             
                    $('#btn_uploadLibrary').removeAttr('disabled');
                    }
        });

        
        function checkerror(chekVal) {
            var retval = '';

            $("#BundleFile").empty();
            //applying filter
            var bundleName = $("input#bundleName");
            bundleName.val(bundleName.val().replace(/^\s+/, ""));
            if (fileNames == '') {;
                retval += 'SELECT FILE';
                $("#BundleFile").append(i18n.t('please_selct_bundle_file'));
            } else {
                retval += '';
                $("#BundleFile").empty();
            }

            if ($("#bundleName").val() == "") {
                retval += 'Bundle Name';
                self.BundleName(null);
                $("#please_enter_bundle_name").show();
            } else {
                retval += '';
            }
            return retval;
        };
      
        self.selectedFiles = ko.observableArray();
        self.removeItems = function (item) {
            self.selectedFiles.remove(item);            
            fileNames = getFileNames(self.selectedFiles());
            $('#fileinput').val("");
            self.BundleFiles(fileNames);         
        }
        self.cancelItems = function (item) {
            self.selectedFiles.remove(item);
            fileNames = getFileNames(self.selectedFiles());
            self.BundleFiles(fileNames);
            FilePaths = [];
            FilePaths.push(item.FilePath);
            if (self.selectedFiles().length <= 0) {
                $("#btn_uploadLibrary").addClass("disabled");
                $("#btn_uploadLibrary").prop("disabled", true);
            }
            CancelVRKFile(FilePaths);
        }
        
        self.removeItemsOnCancel = function () {
            CancelVRKFile(getFilePaths(self.selectedFiles()));
        }
        function validateIsFileExists(file) {
            for (var i = 0, len = self.selectedFiles().length; i < len; i++) {
                if (self.selectedFiles()[i].FileName == file.name) {
                    return true;
                }
            }
            return false;
        }
        self.selectDownloadOnOption = ko.observable(AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT'));
        selecteddownloadoptionstring = AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT');
        self.onDownloadNowOptionClick = function (selecteddownloadoption) {
            selecteddownloadoptionstring = selecteddownloadoption;
            self.selectDownloadOnOption(selecteddownloadoption);
            return true;
        }
        self.selectDownloadAfterOption = ko.observable(AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT'));
        selecteddownloadAfteroptionstring = AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT');
        self.onDownloadAfterOptionClick = function (selecteddownloadoption) {
            selecteddownloadAfteroptionstring = selecteddownloadoption;
            self.selectDownloadAfterOption(selecteddownloadoption);
            return true;
        }
        self.updateValidateFiles = function (file, index) {
            if (self.selectedFiles()[index] && self.selectedFiles()[index] != null) {
                $("#FileTotalKeys" + index).text(file.TotalKeys);
                $("#FileSerialNumberCount" + index).text(file.SerialNumberCount);
                $("#FilePendingSerialNumberCount" + index).text(file.PendingSerialNumberCount);
                $("#FileMissingSerialNumberCount" + index).text(file.MissingSerialNumberCount);
                $("#FileNameProgress" + index).css("width", 100 + "%");
                $("#FileNameProg" + index).text(100 + "%");
                if (file.IsDuplicateBundle == true) {
                    self.selectedFiles()[index].AdditionalInfo = i18n.t('vrk_additional_info_duplicate_bundle', {lng: lang});
                    $("#FileAdditionalInfo" + index).text( i18n.t('vrk_additional_info_duplicate_bundle', {lng: lang}));
                    IsDuplicateBundleFileExist =true;
                } else if (file.IsInvalidBundle == true) {
                    self.selectedFiles()[index].AdditionalInfo = i18n.t('vrk_additional_info_invalid_bundle_file', { lng: lang });
                    $("#FileAdditionalInfo" + index).text(i18n.t('vrk_additional_info_invalid_bundle_file', { lng: lang }));
                    IsInvalidFileExist = true;
                } else {
                    self.selectedFiles()[index].AdditionalInfo = file.AdditionalInfo;
                    $("#FileAdditionalInfo" + index).text(file.AdditionalInfo);
                }
                self.selectedFiles()[index].FilePath = file.FilePath;
                self.selectedFiles()[index].IsDuplicateBundle = file.IsDuplicateBundle;
                self.selectedFiles()[index].IsInvalidBundle = file.IsInvalidBundle;
                self.selectedFiles()[index].TotalKeys = file.TotalKeys;
                self.selectedFiles()[index].IsValidated = true;
                self.selectedFiles()[index].SerialNumberCount = file.SerialNumberCount;
                self.selectedFiles()[index].PendingSerialNumberCount = file.PendingSerialNumberCount;
                self.selectedFiles()[index].MissingSerialNumberCount = file.MissingSerialNumberCount;               
                self.selectedFiles()[index].FileSize = file.FileSize;
            }
        }
        function AddValidatedVRKBundle(numCurrentUpload, currentSelectedDownloadOnOption, validatedFiles, observableModelPopup) {
               
            var DownloadOptions = new Object();
            var today = new Date();
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
                if (selecteddownloadAfteroptionstring == AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT')) {
                    DownloadOptions.IsMaintenance = false;
                } else {
                    DownloadOptions.IsMaintenance = true;
                }
                DownloadOptions.ScheduleType = AppConstants.get('VRK_SCHEDULE_TYPE_AFTER');
            }
            else if (currentSelectedDownloadOnOption == AppConstants.get('VRK_SCHEDULE_TYPE_NOW')) {
                downloadOn = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds());
                downloadDateTime = dateTimeToLocalDateTimeString(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes());
                if (selecteddownloadoptionstring == AppConstants.get('VRK_SCHEDULE_TYPE_NEXTCONTACT')) {
                    DownloadOptions.IsMaintenance = false;
                } else {
                    DownloadOptions.IsMaintenance = true;
                }
                DownloadOptions.ScheduleType = AppConstants.get('VRK_SCHEDULE_TYPE_NOW');
            } else if (currentSelectedDownloadOnOption == AppConstants.get('VRK_SCHEDULE_TYPE_NONE')) {
                downloadOn = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds());
                downloadDateTime = dateTimeToLocalDateTimeString(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes());
                DownloadOptions.IsMaintenance = false;
                DownloadOptions.ScheduleType = AppConstants.get('VRK_SCHEDULE_TYPE_NONE');
            }
            var utc = new Date(downloadOn.getTime() + downloadOn.getTimezoneOffset() * 60000);
            downloadDateTimeString = dateTimeToLocalDateTimeString(utc.getFullYear(),utc.getMonth(),utc.getDate(), utc.getHours(), utc.getMinutes());
            DownloadOptions.DownloadOn = createJSONTimeStamp(downloadDateTime);
            DownloadOptions.DownloadOnInUTC = createJSONTimeStamp(downloadDateTimeString);

            var addVRKBundleDetailsReq = new Object();
            addVRKBundleDetailsReq.Tags = $("#tagTxt").val();
            addVRKBundleDetailsReq.TotalCount = validatedFiles.length;
            addVRKBundleDetailsReq.CurrentCount = numCurrentUpload + 1;
            addVRKBundleDetailsReq.BundleName = $("#bundleName").val();
            addVRKBundleDetailsReq.DownloadOption = DownloadOptions;
            addVRKBundleDetailsReq.BundleFileDetails = validatedFiles;
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {                       
                        $("#loadingDiv").hide();
                        $('#bundleName').removeClass("disabled");
                        $('#bundleName').prop("disabled", false);
                        if (validatedFiles.length > 1) {
                            openAlertpopupVRKBundle(0, 'alert_bunble_VRKBundlesadded_success');
                        } else {
                            openAlertpopupVRKBundle(0, 'alert_bunble_VRKBundleadded_success');
                        }
                    } else if (data.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR')) {
                        openAlertpopup(2,'network_error');
                    } 
                }
            }
            var method = 'AddVRKBundle';
            var params = '{"token":"' + TOKEN() + '","addVRKBundleDetailsReq":' + JSON.stringify(addVRKBundleDetailsReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }
        numberOfResponseReceived = 0;
        uploadAllfilesStatusFlag= 0;
        function fileUploadVRKBundle(redundantFiles,totalnumofUploads, numCurrentUpload, selectedFileList, uploadFile, index) {
            numCurrentUpload = index;
            var formData = new FormData();           
            var tokenString = TOKEN();
            fileName = uploadFile.FileName;
            formData.append("Token", tokenString);
            formData.append("BundleName", $("#bundleName").val());
            formData.append("FileName", fileName);
            formData.append("file", uploadFile.File);

            $.ajax({
                url: AppConstants.get('FILE_UPLOAD_URL'),
                type: 'POST',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                beforeSend: function (xhr) {

                },
                progress: progressHandler,
                load: completeHandler,
                abort: abortHandler,
                xhr: function () {
                    //upload Progress
                    var xhr = $.ajaxSettings.xhr();
                    if (xhr.upload) {
                        xhr.upload.addEventListener('progress', function (event) {
                            var percent = 0;
                            var position = event.loaded || event.position;
                            var total = event.total;
                            if (event.lengthComputable) {
                                percent = Math.ceil(position / total * 100);
                            }
                            //update progressbar      
                            if (percent >= 80) {
                                percent = 80;
                            }
                            $("#FileNameProgress" + index).css("width", percent + "%");
                            $("#FileNameProg" + index).text(percent + "%");

                        }, true);
                    }
                    return xhr;
                },
                success: function (data) {
                    numberOfResponseReceived++;                 
                    responsemessage = '';
                    var responseData = data.split('|');
                    var status = responseData.length > 0 ? responseData[0] : '';
                    if (status == 'Token_Invalid_Or_Expired') {
                        uploadAllfilesStatusFlag = 1;
                        Token_Expired();
                    }
                    if (status == 'Internal_Error') {
                        uploadAllfilesStatusFlag = 1;
                        openAlertpopup(2, 'network_error');
                    }
                    if (status == "Status_OK") {
                        var responseDatalog = data.split('Status_OK|');
                        responsemessage = responseDatalog.length > 1 ? responseDatalog[1] : '';
                        if (responsemessage != '') {
                            responsemessage = $.parseJSON(decodeURIComponent(responsemessage));
                            self.updateValidateFiles(responsemessage, index)
                        }
                    } else {
                        uploadAllfilesStatusFlag = 1;
                    }

                    if (totalnumofUploads == numberOfResponseReceived) {
                        var bundles=getBundleFileAfterValidate(self.selectedFiles())
                        if (bundles.length == 0) {
                            $("#btn_uploadLibrary").addClass("disabled");
                            $("#btn_uploadLibrary").prop("disabled", true);
                        } else {
                            $("#btn_uploadLibrary").removeClass("disabled");
                            $("#btn_uploadLibrary").prop("disabled", false);
                        }      
                        $("#loadingDiv").hide();
                        $('#fileinput').val("");
                        $('#bundleName').addClass("disabled");
                        $('#bundleName').prop("disabled", true);
                        
                    }
                },
                error: errorHandler
            });
        }
        seti18nResourceData(document, resourceStorage);
    };
    function CancelVRKFile(VRKFileList) {
        if (VRKFileList.length > 0) {
            var cancelVRKBundleList = new Object();
            cancelVRKBundleList.BundlePath = VRKFileList;
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    }
                }
            }
            var method = 'CancelVRKBundle';
            var params = '{"token":"' + TOKEN() + '","cancelVRKBundleReq":' + JSON.stringify(cancelVRKBundleList) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

        }
    }

    function validateFile(file) {

        if (!validateFileName(file.name, 6))
            return "*Type not supported";

        //if (_extensions && _extensions.length > 0) {
        //    var ext = fileRef.type;

        //    if (ext)
        //        ext = ext.toUpperCase();
        //    else
        //        ext = fileRef.name.slice(fileRef.name.length - 4).toUpperCase();

        //    for (var i = 0; i < _extensions.length; i++)
        //        if (ext == _extensions[i])
        //            break;
        //    if (i == _extensions.length)
                
        //}

        var _maxSize = 150 * 1024 * 1024;

        return file.size <= _maxSize ? "" : "*Too big (" + formatFileSize(file.size) + ")";
    }

    // Called to format number to file size
    function formatFileSize(numSize) {
        var strReturn;
        numSize = Number(numSize / 1024);
        strReturn = String(numSize.toFixed(1) + " KB");
        if (numSize > 1024) {
            numSize = numSize / 1024;
            strReturn = String(numSize.toFixed(1) + " MB");
            if (numSize > 1024) {
                numSize = numSize / 1024;
                strReturn = String(numSize.toFixed(1) + " GB");
            }
        }
        return strReturn;
    }    

    function openAlertpopupVRKBundle(flage, msg, names) {

        if (flage == 0) {

            $("#conformationPopupVRKBundle").modal("show");
            $("#infoHeadVRKBundle").text(i18n.t('success', { lng: lang }));
            $("#infoHeadVRKBundle").addClass('c-green');
            $("#infoHeadVRKBundle").removeClass('c-blue');
            $("#infoHeadVRKBundle").removeClass('c-red');
            $("#infoicon").removeClass('icon-information c-blue');
            $("#infoicon").removeClass('icon-times-circle c-red');
            $("#infoicon").addClass('icon-checkmark c-green');
            $("#infoBtnOkVRKBundle").removeClass('btn-danger');
            $("#infoBtnOkVRKBundle").removeClass('btn-primary');
            $("#infoBtnOkVRKBundle").addClass('btn-success');
            $("#infoMessageVRKBundle").text(i18n.t(msg, names, { lng: lang }));
        }
        if (flage == 1) {
            $("#informationPopupVRKFileUpload").modal("show");
            $("#infoHeadVRKFileUpload").text(i18n.t('information_title', { lng: lang }));
            $("#infoMessageVRKFileUpload").text(i18n.t(msg, names, { lng: lang }));
        } 
    }

    function progressHandler(event) {
        $("#loaded_n_total").innerHTML = "Uploaded " + event.loaded + " bytes of " + event.total;
        var percent = (event.loaded / event.total) * 100;
        $("#progressBar").value = Math.round(percent);
        $("#status").innerHTML = Math.round(percent) + "% uploaded... please wait";
    }
    function completeHandler(event) {
        $("#status").innerHTML = event.target.responseText;
        $("#progressBar").value = 0;
    }
    function errorHandler(event) {
        if (event != null) {
            if (event.status == 401) {
                //location.href = AppConstants.get('LOGOUT_URL');
                var statusMessage = i18n.t('E_Statuscode_401', { lng: lang });
                console.log(statusMessage);
            } else {
                openAlertpopup(2, 'network_error');
            }
        } else {
            openAlertpopup(2, 'network_error');
        }       
        $("#loadingDiv").hide();
    }

    function abortHandler(event) {
        $("#loadingDiv").hide();
    }
  
    function getFileNames(uploadFiles) {
        var FileNames = '';
        for (var i = 0 ; i < uploadFiles.length ; i++) {
            if (FileNames == '') {
                FileNames = uploadFiles[i].FileName;
            }
            else {
                FileNames = FileNames + ',' + uploadFiles[i].FileName;
            }
        }
        return FileNames;
    }
    function getFilePaths(uploadFiles) {
		
        var FilePaths = [];
        for (var i = 0 ; i < uploadFiles.length ; i++) {           
            FilePaths.push(uploadFiles[i].FilePath);          
        }
	   
        return FilePaths;
    } 

    function clearFileUpload() {
        //self.selectedFiles.removeAll();
        numCurrentUpload = 0;
        totalFileCount = 1;
        redundantFiles = vrkSessionName = '';
    }

    function GetConfigurableValues(GetConfigurableValuesForVRK) {
        var category = AppConstants.get('SYSTEM');
        var configName = AppConstants.get('MAX_VRK_FILES_ALLOWED');

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.systemConfiguration)
                        data.systemConfiguration = $.parseJSON(data.systemConfiguration);

                    systemConfiguartion = data.systemConfiguration.ConfigValue;
                    koUtil.maxVRKFilesAllowedtoUpload = systemConfiguartion;
                }
            }
            $("#loadingDiv").hide();
        }

        var method = 'GetSystemConfiguration';
        var params = '{"token":"' + TOKEN() + '","category":"' + category + '","configName":"' + configName + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    

    //----dispaly grid for Selected Files List
    function createjqxGridforSelectedFiles(selectedFilesCOl, gID) {

        var source =
              {
                  dataType: "json",
                  localdata: selectedFilesCOl,
                  deleterow: function (rowid, commit) {
                      // synchronize with the server - send delete command
                      // call commit with parameter true if the synchronization with the server is successful 
                      //and with parameter false if the synchronization failed.
                      commit(true);
                  },
                  datafields: [
                      { name: 'Status', map: 'status' },
                      { name: 'FileName', map: 'FileName' },
                      { name: 'FileSize', map: 'FileSize' },
                      { name: 'progress', map: 'progress' },
                      { name: 'Delete', map: 'Delete' },
                  ],
              };

        var dataAdapter = new $.jqx.dataAdapter(source);

        var progressBarrenderer = function (row, column, value, defaultHtml) {
            var defaultHtml = '<div style="margin-top:5px;">';
            defaultHtml += '<div style="background: #058dc7; float: left; width: ' + value + 'px; height: 16px;"></div>';
            defaultHtml += '<div style="margin-left: 5px; float: left;">' + value.toString() + '%' + '</div>'; 
            defaultHtml += '</div>';
            return defaultHtml;
        }

        var deleteFileRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var filename = $("#" + gID).jqxGrid('getcellvalue', row, 'FileName');
            var html = '<div  style="height:30px;cursor:pointer;text-align:center;padding-top:8px;"><a class="vrkdeletebtn btn-default" role="button" onClick="deleteFile(' + row + ')" title="Remove"><i class="icon-bin"></i></a></div>';
            return html;

        }
        
      
        // create jqxgrid.
        $("#" + gID).jqxGrid(
        {
            width: "100%",
            height: 220,
            source: dataAdapter,
            sortable: true,
            filterable: false,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            altrows: true,
            autoshowcolumnsmenubutton: false,
            showsortmenuitems: false,
            editable: true,
            enabletooltips: false,
            rowsheight: 32,
            columnsResize: true,
            columnsreorder: false,
            columns: [
              {
                  text: i18n.t('vrk_file_name', { lng: lang }), datafield: 'FileName', menu: false, width: 300, minwidth: 175, editable: false,

              },
              {
                  text: i18n.t('vrk_file_size', { lng: lang }), datafield: 'FileSize', menu: false, width: 160, minwidth: 145, editable: false,

              },
              {
                  text: i18n.t('vrk_upload_progress', { lng: lang }), datafield: 'progress', menu: false, width: 180, minwidth: 178, editable: false, cellsrenderer: progressBarrenderer
              },
              {
                  text: i18n.t('vrk_file_delete', { lng: lang }), datafield: 'Delete', menu: false, width: 80, minwidth: 80, editable: false,  cellsrenderer: deleteFileRenderer
              },
            ]
        });

        $("#" + gID).jqxGrid('updatebounddata');
    }

});

function deleteFile(row) {
    //var selectedsource = _.where(self.selectedFiles(), { FileName: item.FileName });
    //self.selectedFiles.remove(selectedsource[0]);

    var selectedrowindex = $("#jqxgridForSelectedFiles").jqxGrid('getselectedrowindex');
    var rowscount = $("#jqxgridForSelectedFiles").jqxGrid('getdatainformation').rowscount;
    if (selectedrowindex >= 0 && selectedrowindex < rowscount) {
        var id = $("#jqxgridForSelectedFiles").jqxGrid('getrowid', selectedrowindex);
        var commit = $("#jqxgridForSelectedFiles").jqxGrid('deleterow', id);
    }

}

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
