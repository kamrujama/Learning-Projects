define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
    var lang = getSysLang();

    //validation
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function addStandardFileViewModel() {
     
        var self = this;
        
        self.ConfigName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('friendlyNameError', {
                    lng: lang
                })
            }
        });

        self.ConfigValue = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('terminalFileNameError', {
                    lng: lang
                })
            }
        });

        self.Description = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('descriptionError', {
                    lng: lang
                })
            }
        });

        //focus on first textbox
        $('#modelFileNameId').on('shown.bs.modal', function () {
            $('#userNameID').focus();
        })
        //------------------------------FOCUS ON  POP PU-------------------------------------
     

        $('#modelFileNameId').keydown(function (e) {
            if ($('#modelStandardfileID_Cancel_Btn').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#modelStandardfileID_Close_Btn').focus();
            }
        });

        //----------------------------------------------------------------------------------------

        $('#modelAddStdFileHeader').mouseup(function () {
            $("#modelAddStdFile").draggable({ disabled: true });
        });

        $('#modelAddStdFileHeader').mousedown(function () {
            $("#modelAddStdFile").draggable({ disabled: false });
        });


        $('#userNameID').keyup(function () {
            var yourInput = $(this).val();
            re = /[`~!#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
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

        $('#fileNameID').keyup(function () {
            var yourInput = $(this).val();
            re = /[`~!#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
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


        // focus on next tab index 
        lastIndex = 7;
        prevLastIndex = 3;        
        $(document).keydown(function (e) {
            if (e.keyCode == 9) {
                var thisTab = +$(":focus").prop("tabindex") + 1;
                var isDisabled = $("#btn_addDevice").is(':disabled');
                if (e.shiftKey) {
                    if (thisTab == prevLastIndex) {
                        if (isDisabled == true) {
                            $("#" + tabLimitInID).find('[tabindex=' + disableIndex + ']').focus();
                            return false;
                        } else {
                            $("#" + tabLimitInID).find('[tabindex=' + prevIndex + ']').focus();
                            return false;
                        }
                    }
                } else {
                    if (thisTab == prevIndex) {
                        if (isDisabled == true) {
                            $("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
                            return false;
                        }

                    } else if (thisTab == lastIndex) {                      
                        $("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
                        return false;
                    }
                }
            }
        });

        var setTabindexLimit = function (x, fileName, y) {
            console.log(x);
            startIndex = 2;
            lastIndex = x;
            prevLastIndex = y;
            prevIndex = 6;
            disableIndex = 5;
            tabLimitInID = fileName;
        }
        setTabindexLimit(7, "modelStandardfileID", 3);

        // end tabindex

        $('#userNameID').on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 9) {
                if ($(this).val() == "") {
                    self.ConfigName(null);
                }
            }

        });
        $('#fileNameID').on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 9) {
                if ($(this).val() == "") {
                    self.ConfigValue(null);
                }
            }
        });

        $('#descriptionID').on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 9) {
                if ($(this).val() == "") {
                    self.Description(null);
                }
            }
        });

        //enabled add button
        self.ConfigName.subscribe(function (newValue) {
            $('#btn_addDevice').removeAttr('disabled');
        })

        self.ConfigValue.subscribe(function (newValue) {
            $('#btn_addDevice').removeAttr('disabled');
        })

        self.Description.subscribe(function (newValue) {
            $('#btn_addDevice').removeAttr('disabled');
        })

       
        self.addFileName = function (observableModelPopup, refershgridonsuccess, gId) {            
           
            var retVal = checkError();

            if (retVal == null || retVal == "") {

                var userLength = $('#userNameID').val().length;
                var terminalLength = $('#fileNameID').val().length;
                var descriptionLength = $('#descriptionID').val().length;

                var rows = $("#" + gId).jqxGrid('getrows');              

                var userValue = $('#userNameID').val().replace(/(^[\s]+|[\s]+$)/g, '');
                var terminalValue = $('#fileNameID').val().replace(/(^[\s]+|[\s]+$)/g, '');

                if (userLength < '3') {
                    openAlertpopup(1, 'please_enter_minimum_3_characters_in_the_field');
                } else if (terminalLength < 3) {
                    openAlertpopup(1, 'please_enter_minimum_3_characters_in_the_field');
                } else if (descriptionLength < 3) {
                    openAlertpopup(1, 'please_enter_minimum_3_characters_in_the_field');
                } else if (rows.length > 0) {
                    var flage = 0;
                    for (var i = 0; i < rows.length; i++) {
                        var configName = rows[i].ConfigName;
                        var configValue = rows[i].ConfigValue;

                        if (userValue == configName || terminalValue == configValue) {
                            flage = 1;
                            break;
                        }
                    }
                    if (flage == 1) {
                        openAlertpopup(1, 'file_name_on_device_name_exist_alert');
                    } else {
                        $("#loadingDiv").show();
                        addFileNameOnDevice(observableModelPopup, refershgridonsuccess);
                    }
                } else {
                    addFileNameOnDevice(observableModelPopup, refershgridonsuccess);
                }
            } else {
                return false;                
            }

        }

        function checkError() {
            var retval = "";

            var userNameID = $("input#userNameID");
            var fileNameID = $("input#fileNameID");
            var descriptionID = $("input#descriptionID");

            userNameID.val(userNameID.val().replace(/^\s+/, ""));
            fileNameID.val(fileNameID.val().replace(/^\s+/, ""));
            descriptionID.val(descriptionID.val().replace(/^\s+/, ""));


            // validation for user friendly name
            if ($("#userNameID").val() == null || $("#userNameID").val() == "") {
                retval += 'user friendly name';
                self.ConfigName(null);
                $("#friendlyNameError").text(i18n.t('friendlyNameError'));
                $("#friendlyNameError").show();
            } else {
                retval += '';
            }

            // validation for file name on terminal
            if ($("#fileNameID").val() == null || $("#fileNameID").val() == "") {
                retval += 'file name on terminal';
                self.ConfigValue(null);
                $("#terminalFileNameError").text(i18n.t('terminalFileNameError'));
                $("#terminalFileNameError").show();
            } else {
                retval += '';
            }

            // validation for description
            if ($("#descriptionID").val() == null || $("#descriptionID").val() == "") {
                retval += 'description';
                self.Description(null);
                $("#descriptionError").text(i18n.t('descriptionError'));
                $("#descriptionError").show();
            } else {
                retval += '';
            }

            return retval;
        }

        // allow only 50 charcters in  user friendly name
        $("#userNameID").on("paste", function (e) {
            var textMax = 50;
            var textLength = $('#userNameID').val().length;
            var textRemaining = textMax - textLength;            
        });

        // allow only 50 charcters in file name on terminal
        $("#fileNameID").on("paste", function (e) {
            var textMax = 50;
            var textLength = $('#fileNameID').val().length;
            var textRemaining = textMax - textLength;
        });

        // allow only 50 charcters in description
        $("#descriptionID").on("paste", function (e) {
            var textMax = 50;
            var textLength = $('#descriptionID').val().length;
            var textRemaining = textMax - textLength;
        });
     
        seti18nResourceData(document, resourceStorage);
    };

    function addFileNameOnDevice(observableModelPopup, refershgridonsuccess) {
        var genericConfiguration = new Object();

        genericConfiguration.Category = AppConstants.get('DEVICE_CONTENT_FILENAME');
        genericConfiguration.ConfigId = 0;
        genericConfiguration.ConfigName = $("#userNameID").val();
        genericConfiguration.ConfigValue = $("#fileNameID").val();
        genericConfiguration.Description = $("#descriptionID").val();
        genericConfiguration.DisplayCategoryName = AppConstants.get('DEVICE_FILENAME_ON_DEVICE');


        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'added_std_file');
                    observableModelPopup('unloadTemplate');
                    $("#modelFileNameId").modal('hide');
                    refershgridonsuccess();
                    GetConfigurations();
                }
            }
            $("#loadingDiv").hide();
        }

        var method = 'AddConfigurationValue';
        var params = '{"token":"' + TOKEN() + '","genericConfiguration":' + JSON.stringify(genericConfiguration) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }
});