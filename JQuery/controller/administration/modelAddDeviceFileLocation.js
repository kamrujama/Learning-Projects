define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
    var lang = getSysLang();

    //validation
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function addDeviceFileViewModel() {
            
        var self = this;
    

        //focus on first textbox
        $('#modelDeviceLocationID').on('shown.bs.modal', function () {
            $('#deviceFileID').focus();
        })

        //------------------------------FOCUS ON  POP PU-------------------------------------


        $('#modelDeviceLocationID').keydown(function (e) {
            if ($('#btn_cancelDevice').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#modelDeviceFileID_Close').focus();
            }
        });

        //----------------------------------------------------------------------------------------


        $('#modelAddDeviceFileHeader').mouseup(function () {
            $("#modelAddDeviceFile").draggable({ disabled: true });
        });

        $('#modelAddDeviceFileHeader').mousedown(function () {
            $("#modelAddDeviceFile").draggable({ disabled: false });
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

        var setTabindexLimit = function (x, fileLocation, y) {
            console.log(x);
            startIndex = 2;
            lastIndex = x;
            prevLastIndex = y;
            prevIndex = 6;
            disableIndex = 5;
            tabLimitInID = fileLocation;
        }
        setTabindexLimit(7, "modelDeviceFileID", 3);
        // end tabindex

        $('#deviceFileID').on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 9) {
                if ($(this).val() == "") {
                    self.ConfigValue(null);
                }
            }
        });

        $('#userNameID').on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 9) {
                if ($(this).val() == "") {
                    self.ConfigName(null);
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


        self.ConfigValue = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('locationError', {
                    lng: lang
                })
            }
        });

        self.ConfigName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('friendlyNameError', {
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

        self.addDeviceName = function (observableModelPopup, refershGridOnSuccess, gId) {
            var retVal = checkError();
            if (retVal == null || retVal == "") {
                var deviceFileNameLength = $('#deviceFileID').val().length;
                var fileNameLength = $('#userNameID').val().length;
                var descriptionLength = $('#descriptionID').val().length;

                var rows = $("#" + gId).jqxGrid('getrows');

                var deviceFileName = $('#deviceFileID').val().replace(/(^[\s]+|[\s]+$)/g, '');
                var fileName = $('#userNameID').val().replace(/(^[\s]+|[\s]+$)/g, '');

                if (deviceFileNameLength < 3) {
                    openAlertpopup(1, 'please_enter_minimum_3_characters_in_the_field');
                } else if (fileNameLength < 3) {
                    openAlertpopup(1, 'please_enter_minimum_3_characters_in_the_field');
                } else if (descriptionLength < 3) {
                    openAlertpopup(1, 'please_enter_minimum_3_characters_in_the_field');
                } else if (rows.length > 0) {
                    var flage = 0;
                    for (var i = 0; i < rows.length; i++) {
                        var configName = rows[i].ConfigName;
                        var configValue = rows[i].ConfigValue;

                        if (fileName == configName || deviceFileName == configValue) {
                            flage = 1;
                            break;
                        }
                    }
                    if (flage == 1) {
                        openAlertpopup(1, 'device_file_location_exist_alert');
                    } else {
                        $("#loadingDiv").show();
                        addDeviceFileLocation(observableModelPopup, refershGridOnSuccess);
                    }

                } else {
                    $("#loadingDiv").show();
                    addDeviceFileLocation(observableModelPopup, refershGridOnSuccess);
                }

            } else {
                return false;
            }
        }

        function checkError() {
            var retval = "";

            var deviceFileName = $("input#deviceFileID");
            var userFriendlyName = $("input#userNameID");
            var description = $("input#descriptionID");

            deviceFileName.val(deviceFileName.val().replace(/^\s+/, ""));
            userFriendlyName.val(userFriendlyName.val().replace(/^\s+/, ""));
            description.val(description.val().replace(/^\s+/, ""));

            // validation for device file location
            if ($("#deviceFileID").val() == "") {

                retval += 'device file location';
                self.ConfigValue(null);
                $("#locationError").text(i18n.t('locationError'));
                $("#locationError").show();
            } else {
                retval += '';
                $("#deviceFileNameValidationID").empty();
            }

            // validation for user friendly name
            if ($("#userNameID").val() == "") {
                retval += 'user friendly name';
                self.ConfigName(null);
                $("#friendlyNameError").text(i18n.t('friendlyNameError'));
                $("#friendlyNameError").show();
            } else {
                retval += '';
                $("#userNameValidationID").empty();
            }

            // validation for description
            if ($("#descriptionID").val() == "") {
                retval += 'description';
                self.Description(null);
                $("#descriptionError").text(i18n.t('descriptionError'));
                $("#descriptionError").show();
            } else {
                retval += '';
                $("#descriptionValidationID").empty();
            }
            return retval;
        }

        // allow only 50 charcters in device file name
        $("#deviceFileID").on("paste", function (e) {
            var textMax = 50;
            var textLength = $('#deviceFileID').val().length;
            var textRemaining = textMax - textLength;
        });

        // allow only 50 charcters in  user friendly name
        $("#userNameID").on("paste", function (e) {
            var textMax = 50;
            var textLength = $('#userNameID').val().length;
            var textRemaining = textMax - textLength;
        });

        // allow only 50 charcters in description
        $("#descriptionID").on("paste", function (e) {
            var textMax = 50;
            var textLength = $('#descriptionID').val().length;
            var textRemaining = textMax - textLength;
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

        //$("#deviceFileID").on('change keyup paste', function () {
        //    if ($("#deviceFileID").val() != "") {
        //        $('#btn_addDevice').removeAttr('disabled');
        //    }
        //});


        //$("#userNameID").on('change keyup paste', function () {
        //    if ($("#userNameID").val() != "") {
        //        $('#btn_addDevice').removeAttr('disabled');
        //    }
        //});


        //$("#descriptionID").on('change keyup paste', function () {
        //    if ($("#descriptionID").val() != "") {
        //        $('#btn_addDevice').removeAttr('disabled');
        //    }
        //});

        seti18nResourceData(document, resourceStorage);
    };

    function addDeviceFileLocation(observableModelPopup, refershGridOnSuccess) {
        var genericConfiguration = new Object();
        genericConfiguration.Category = AppConstants.get('DEVICE_FILE_LOCATION');
        genericConfiguration.ConfigId = 0;
        genericConfiguration.ConfigValue = $("#deviceFileID").val();
        genericConfiguration.ConfigName = $("#userNameID").val();
        genericConfiguration.Description = $("#descriptionID").val();
        genericConfiguration.DisplayCategoryName = 0;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'added_device_file');
                    observableModelPopup('unloadTemplate');
                    $("#modelDeviceLocationID").modal('hide');
                    refershGridOnSuccess();                    
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