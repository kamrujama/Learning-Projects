define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko) {

    var lang = getSysLang();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function addDeviceSubStatusModel() {
        var self = this;
      
        self.DeviceStatus = ko.observableArray();
        self.DeviceStatus(getMultiCoiceFilterArr('Device Status'));
        var config = {
            '.chosen-select': {},
            '.chosen-select-deselect': { allow_single_deselect: true },
            '.chosen-select-no-single': { disable_search_threshold: 10 },
            '.chosen-select-no-results': { no_results_text: 'Oops, nothing found!' },
            '.chosen-select-width': { width: "95%" }
        }


        for (var selector in config) {
            $(selector).chosen(config[selector]);
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


      
        self.observableModelPopup = ko.observable();
        self.isfocus = ko.observable(false);
        self.isfocus(true);

        self.SubStatus = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_enter_sub_status', {
                    lng: lang
                })
            }
        });

        self.DeviceStatus = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_enter_a_device_status', {
                    lng: lang
                })
            }
        });

        $('#subStatus').on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 9) {
                if ($(this).val() == "") {
                    self.SubStatus(null);
                }
            }

        });

        $('#subStatus').keyup(function () {
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

        $('#deviceStatus').on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 9) {
                if ($(this).val() == "") {
                    self.DeviceStatus(null);
                }
            }

        });

        //focus on first textbox
        $('#viewDeviceSubStatusModal').on('shown.bs.modal', function (e) {
            $('#subStatus').focus();

        });

        $('#viewDeviceSubStatusModal').keydown(function (e) {
            if ($('#cancelBtnAddDeviceSubStatus').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#closeBtnAddDevviceSubStatus').focus();
            }
        });


        function checkerror(chekVal) {
            var retval = '';
            $("#subStatusmsg").empty();
            $("#deviceStatusmsg").empty();

            //applying filter
            var subStatus = $("input#subStatus");
            subStatus.val(subStatus.val().replace(/^\s+/, ""));

            if ($("#subStatus").val().trim() == "") {
                retval += 'Sub Status';
                self.SubStatus(null);
                $("#subStatusmsg").text(i18n.t('Please enter sub Status'));
                $("#subStatusmsg").show();

            } else {
                retval += '';
            }

            if ($("#deviceStatus").val().trim() == "") {
                retval += 'deviceStatus';
                self.SubStatus(null);
                $("#deviceStatusmsg").text(i18n.t('Please enter a device Status '));
                $("#deviceStatusmsg").show();

            } else {
                retval += '';
            }


            return retval;
        };

        $('#modelAddDeviceHeader').mouseup(function () {
            $("#modelAddDevice").draggable({ disabled: true });
        });

        $('#modelAddDeviceHeader').mousedown(function () {
            $("#modelAddDevice").draggable({ disabled: false });
        });


        //enabled add button when input text cahanges
      
        self.subStatustext = ko.observable("");
        self.subStatustext.subscribe(function (newValue) {
            
            if (self.subStatustext().trim() != '') {
                $("#addGroupBtn").removeAttr('disabled');
            } else {
                $("#addGroupBtn").prop('disabled', true);
            }
        });

        $("#deviceStatus").keyup(function (e) {
            if ($(this).val() != "") {
                $('#addGroupBtn').removeAttr('disabled');
            } else if ($(this).val() == "") {
                $('#addGroupBtn').prop('disabled', true);
            }
        });



        $("#subStatus").on('change keyup paste', function () {
            if (($("#subStatus").val().trim() != "")) {
                if ($.trim($('#subStatus').val()) != '') {
                    $('#addGroupBtn').removeAttr('disabled');
                }
            }
        });

        //check empty on backspace or delete
        $("#subStatus").on("change keypress keyup paste", function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                if ($("#subStatus").val().trim() == "") {
                    $('#addGroupBtn').prop('disabled', true);
                }
            }
        });


        //unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
        };


        self.addSubDeviceStatus = function (observableModelPopup, isGridVisible) {
            var retval = checkerror();
            if (retval == null || retval == "") {
                addSubDeviceStatusCall(observableModelPopup, isGridVisible);
            } else {

            }


        }

        seti18nResourceData(document, resourceStorage);
    }
    function addSubDeviceStatusCall(observableModelPopup, isGridVisible) {
        var addDeviceSubStatusReq = new Object();
        var DeviceSubStatus = new Object();
        DeviceSubStatus.Description = $("#description").val();
        DeviceSubStatus.SubStatus = $("#subStatus").val().replace(/(^[\s]+|[\s]+$)/g, '');

        DeviceSubStatus.DeviceStatusConfigId = 39;
        DeviceSubStatus.SubStatusId = 0;
        addDeviceSubStatusReq.DeviceStatus = 'Inactive';
        addDeviceSubStatusReq.DeviceSubStatus = DeviceSubStatus;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    observableModelPopup('unloadTemplate');
                    $('#viewDeviceSubStatusModal').modal('hide');
                    gridFilterClear("jqxgridDeviceSubStatus");
                    openAlertpopup(0, 'device_sub_status_added_successfully');
                }
                else if (data.responseStatus.StatusCode == AppConstants.get('DEVICE_SUB_STATUS_ADD_SAME_NAME_EXISTS')) {
                    openAlertpopup(1, 'device_sub_status_with_ame_name_already_exists');
                }
            }
        }
        var method = 'AddDeviceSubStatus';
        var params = '{"token":"' + TOKEN() + '","addDeviceSubStatusReq":' + JSON.stringify(addDeviceSubStatusReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});