isErrorOccured = false;
define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko) {
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function DashBoardViewModel() {

       
        uploadedfiledata = new Array();

        var self = this;
       
        self.isApplicationAvailable = ko.observable(false);
        self.validetbundleResponse = ko.observableArray();
        self.observableModelPopupViewModel = ko.observable();
        var modelName = "unloadTemplate";
        loadelement(modelName, 'genericPopup');


        //focus on first textbox
        $('#viewModelAddIP').on('shown.bs.modal', function () {
            $('#startIpAdd').focus();
        });

        $('#viewModelAddIP').keydown(function (e) {
            if ($('#cancelIpBtn').is(":focus") && (e.which || e.keyCode) == 9) {
                //e.preventDefault();
                $('#closeAddSourceIp').focus();
                e.preventDefault();
            }

        });


        $('#closeAddSourceIp').keydown(function (e) {
            if ($('#closeAddSourceIp').is(":focus") && (e.which || e.keyCode) == 9) {
                // e.preventDefault();
                $('#filbtn').focus();
                e.preventDefault();
            }
        });


        $("#filbtn").keydown(function (e) {
            if (e.keyCode == 13 || e.keyCode == 32) {
                $("#fileinput").click();
            }
        })


        if ($('#filbtn').is(":focus") && (e.which || e.keyCode) == 9) {
            var isimportBtn = $('#importBtn').is(':disabled');
            if (isimportBtn == false) {
                $('#importBtn').focus();
                e.preventDefault();
            } else {
                //e.preventDefault();
                $('#linkViewIpSource').focus();
                //e.preventDefault();
            }
        }


        //enabled add button when input text changes
        $("#startIpAdd").on('change keyup paste', function () {
            if ($("#startIpAdd").val() != "") {
                $('#addIpBtn').removeAttr('disabled');
            }
        });

        $("#endIpAdd").on('change keyup paste', function () {
            if ($("#endIpAdd").val() != "") {
                $('#addIpBtn').removeAttr('disabled');
            }
        });

        $('#startIpAdd').keyup(function () {
            var yourInput = $(this).val();
            re = /[`~!@#$%^&*()|+\=?;:'",^a-zA-Z<>\{\}\[\]\\\-_/]/gi;

            // store current positions in variables
            var start = this.selectionStart,
                end = this.selectionEnd;

            var isSplChar = re.test(yourInput);
            if (isSplChar) {
                var no_spl_char = yourInput.replace(/[`~!@#$%^&*()|+\=?;:'",^a-zA-Z<>\{\}\[\]\\\-_/]/gi, '');
                $(this).val(no_spl_char);

                // restore from variables...
                this.setSelectionRange(start - 1, end - 1);
            }
        });

        $('#endIpAdd').keyup(function () {
            var yourInput = $(this).val();
            re = /[`~!@#$%^&*()|+\=?;:'",^a-zA-Z<>\{\}\[\]\\\-_/]/gi;

            // store current positions in variables
            var start = this.selectionStart,
                end = this.selectionEnd;

            var isSplChar = re.test(yourInput);
            if (isSplChar) {
                var no_spl_char = yourInput.replace(/[`~!@#$%^&*()|+\=?;:'",^a-zA-Z<>\{\}\[\]\\\-_/]/gi, '');
                $(this).val(no_spl_char);

                // restore from variables...
                this.setSelectionRange(start - 1, end - 1);
            }
        });

        //click on browse button import button is enabled
        $("#fileinput").on('change keyup', function () {
            if ($("#fileinput").val() != "") {
                $('#importBtn').removeAttr('disabled');
            }
        });

        $('#modelAddSourceIpHeader').mouseup(function () {
            $("#modelAddSourceIp").draggable({ disabled: true });
        });

        $('#modelAddSourceIpHeader').mousedown(function () {
            $("#modelAddSourceIp").draggable({ disabled: false });
        });


        //unload template
        self.unloadTempPopup = function (popupName, gridID, exportflage) {
            self.observableModelPopupViewModel('unloadTemplate');
            var x = document.getElementById("viewSourceIpValidationModal").previousSibling.innerHTML;
            checkIsPopUpOPen();
        };



        self.singleAddISourceIp = function (observableModelPopupViewModel, refreshGrid) {

            convertIp(observableModelPopupViewModel, refreshGrid);


        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopupViewModel(elementname);
        }
        // Browse Button functionality
        var fileValue = "";
        self.handleFileSelect = function () {

            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                openAlertpopup(1, 'the_file_apis_are_not_fully_supported_in_this_browser');
                return;
            }
            input = document.getElementById('fileinput');
            if (!input) {
                openAlertpopup(1, 'cannot_find_the_fileinput_element');

            }
            else if (!input.files) {
                openAlertpopup(1, "this_browser_doesn't_seem_to_support_the_`files`_property_of_file_inputs");
            }
            else if (!input.files[0]) {
                if (isErrorOccured == true) {
                    openAlertpopup(2, 'some_error_encountered_ip');
                    isErrorOccured = false;
                } else {
                    return;
                }
              
            }
            else {
                file = input.files[0];


                $("#selectFile").prop('value', file.name);
                fileValue = file.name;

                fr = new FileReader();
                fr.onload = receivedText;
                fr.readAsDataURL(file);

            }
        }

        self.valImport = function (observableModelPopupViewModel, fileinput, refreshGrid) {
            var filename = $("#fileinput").val();
            ipRangeBulkImport(observableModelPopupViewModel, fileinput, refreshGrid);

        }

        seti18nResourceData(document, resourceStorage);
    }

    function receivedText() {
        var arr = new Array();
        arr = fr.result.split(',');
        var filename = $("#fileinput").val();
        uploadedfiledata = arr[1];

    }

    function generateTemplate(tempname, controllerId) {
        //new template code
        var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
        var viewName = 'controller/' + controllerId + '/' + tempname + '.js';
        ko.components.register(tempname, {
            viewModel: { require: viewName },

            template: { require: 'plugin/text!' + htmlName }
        });
        // end new template code
    }
    //--------------------------
    function ajaxRequest() {
        var activexmodes = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"] //activeX versions to check for in IE
        if (window.ActiveXObject) { //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
            for (var i = 0; i < activexmodes.length; i++) {
                try {
                    return new ActiveXObject(activexmodes[i])
                }
                catch (e) {
                    //suppress error
                }
            }
        }
        else if (window.XMLHttpRequest) // if Mozilla, Safari etc
            return new XMLHttpRequest()
        else
            return false
    }

    //import device on button click
    function ipRangeBulkImport(observableModelPopupViewModel, blobOrFile, refreshGrid) {
        $("#loadingDiv").show();
        var xhr = new XMLHttpRequest();
        var context = this;
        var tokenString = TOKEN();

        var formData = new FormData();

        for (i = 0; i < blobOrFile.files.length; i++) {
            var extension = blobOrFile.files[i].name.substr((blobOrFile.files[i].name.lastIndexOf('.') + 1));
            extension = extension.toLowerCase();
            formData.append("opmlFile", blobOrFile.files[i]);
        }
        formData.append('Authorization', tokenString);
        formData.append("fileExtension", '.' + extension);
        var addIpRangesCall = function (data) {
            var jsonData = JSON.parse(xhr.responseText);
            if (jsonData.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                openAlertpopup(0, 'import_IPRangefile_successfully');
                observableModelPopupViewModel('unloadTemplate');
                $("#viewModelAddIP").modal('hide');
                refreshGrid();
            } else if (jsonData.responseStatus.StatusCode == AppConstants.get('INVALID_XMLFILE_FORMAT')) {
                openAlertpopup(2, 'invalid_format_found_in_selected_file');
                $('#importBtn').prop('disabled', true);
                $("#selectFile").prop('value', '');
            } else if (jsonData.responseStatus.StatusCode == AppConstants.get('E_FILE_FORMAT_NOT_SUPPORTED')) {
                openAlertpopup(1, 'selected_file_format_not_supported');
                $('#importBtn').prop('disabled', true);
                $("#selectFile").prop('value', '');
            }
            else if (jsonData.responseStatus.StatusCode == AppConstants.get('SYSTEM_BUSY')) {
                openAlertpopup(2, 'system_busy_try_again');
            } else if (jsonData.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                Token_Expired()
            } else {
                isErrorOccured = true;
                openAlertpopup(2, 'some_error_encountered_ip');
                $('#importBtn').prop('disabled', true);
               // input = document.getElementById('fileinput');
                // document.getElementById("fileinput").value = "";
                var input = $("#fileinput");
                input.replaceWith(input.val('').clone(true));

                //$("#selectFile").val('');
                $("#selectFile").prop('value', '');
                
            }
            $("#loadingDiv").hide();
        };

        xhr.open('POST', AppConstants.get('API_URL') + '/IPRangesBulkImport', true);
        xhr.setRequestHeader('Content-length', blobOrFile.size);     
        xhr.onload = addIpRangesCall;
        xhr.send(formData);
    }
});

   
function addSourceIP(ipStartRangeNum, ipEndRangeNum, observableModelPopupViewModel, refreshGrid) {
    var validIPRanges = new Object();

    validIPRanges.EndRange = $("#endIpAdd").val();
    validIPRanges.EndRangeNumeric = ipEndRangeNum;
    validIPRanges.StartRange = $("#startIpAdd").val();
    validIPRanges.StartRangeNumeric = ipStartRangeNum;

    function callbackFunction(data, error) {
        if (data) {

            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                openAlertpopup(0, 'ip_ranges_added_successfully');
                observableModelPopupViewModel('unloadTemplate');
                $("#viewModelAddIP").modal('hide');
                refreshGrid();
            }else if (data.responseStatus.StatusCode == AppConstants.get('SOURCE_IP_VALIDATION_ADD_IP_ALLREADY_EXIST')) {
                openAlertpopup(2, data.responseStatus.StatusMessage);
            }
        }
    }

    var method = 'AddValidIPRanges';
    var params = '{"token":"' + TOKEN() + '","validIPRanges":' + JSON.stringify(validIPRanges) + '}';
    ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

}



function convertIp(observableModelPopup, refreshGrid) {
    var startIpString = new Array();
    var endIpString = new Array();
    var startIp = $("#startIpAdd").val();
    var endIp = $("#endIpAdd").val();

    startIpString = startIp.split(".");
    endIpString = endIp.split(".");
    //Conversion Ip string into integer
    var ipStartRangeNum = 16777216 * parseInt(startIpString[0]) + 65536 * parseInt(startIpString[1]) + 256 * parseInt(startIpString[2]) + parseInt(startIpString[3]);

    var ipEndRangeNum = 16777216 * parseInt(endIpString[0]) + 65536 * parseInt(endIpString[1]) + 256 * parseInt(endIpString[2]) + parseInt(endIpString[3]);

    // Regular Expression for check ip value is ip string or not
    var regForIp = /^(([0-9]|[0-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[0-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;


    if (startIp != null && endIp != null) {

        if ((regForIp.test(startIp)) == false) {
            openAlertpopup(1, 'Please enter valid Start/From IP address');
            return;
        }
        if ((regForIp.test(endIp)) == false) {
            openAlertpopup(1, 'please_enter_valid_end_to_ip_address');
            return;
        }

        if ((startIpString.length < 4 || startIpString.length > 4) && (regForIp.test(startIpString) == false)) {
            openAlertpopup(1, 'Please enter valid Start/From IP address');
            return;
        } else
            //For  startIpString length
            if ((endIpString.length < 4 || endIpString.length > 4) && (regForIp.test(endIpString) == false)) {
                openAlertpopup(1, 'please_enter_valid_end_to_ip_address');
                return;
            } else
                if (ipStartRangeNum < 1) {
                    openAlertpopup(2, 'Please enter valid Start/From IP address');
                    return;
                }
        if (ipEndRangeNum < 1) {
            openAlertpopup(1, 'please_enter_valid_end_to_ip_address');
            return;
        }
        //if strat ip address is greater than end or to ip address
        if (ipStartRangeNum > ipEndRangeNum) {
            openAlertpopup(1, 'The Start/From IP address must be less than or equal to the  End/To IP Address.');
            return;
        } else {
            var isStartIpAddress = regForIp.test(startIp);
            var isEndIpAddress = regForIp.test(endIp);

            if (isStartIpAddress == false && isEndIpAddress == true) {             //if start Ip Address is in valid and end ip address is valid
                openAlertpopup(1, 'Please enter valid Start/From IP address');
            } else if (isStartIpAddress == true && isEndIpAddress == false) {
                openAlertpopup(1, 'Please enter a valid To IP Address.');
            } else if (isStartIpAddress == false && isEndIpAddress == false) {
                openAlertpopup(1, 'Please enter valid Start/From IP address.');
            } else {
                addSourceIP(ipStartRangeNum, ipEndRangeNum, observableModelPopup, refreshGrid);
            }
        }
    } else

        if (startIp == '') {
            openAlertpopup(1, 'Please enter valid Start/From IP address');
            return;
        } else
            if (endIp == '') {
                openAlertpopup(1, 'Please enter a valid To IP Address.');
                return;
            }

}