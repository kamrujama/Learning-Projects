define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko) {

    var lang = getSysLang();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function addGroupEstabllishmentModel() {
        userrData = JSON.parse(sessionStorage.getItem("userrData"));
        userGuid = userrData[0].UserGuid;

       
        var self = this;
      
        self.observableModelPopup = ko.observable();

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

        $('#viewDeviceSubStatusModal').keydown(function (e) {
            if ($('#cancelEditDeviceSubStatus').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#closeEditDeviceSubStatus').focus();
            }
        });


        //enabled add button when input text cahanges

        self.subStatustext = ko.observable("");
        self.subStatustext.subscribe(function (newValue) {
            
            if (self.subStatustext() != '') {
                $("#addGroupBtn").removeAttr('disabled');
            } else {
                $("#addGroupBtn").prop('disabled', true);
            }
        });

        //tab key selection 
        $('#subStatus').on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 9) {
                if ($(this).val() == "") {
                    self.SubStatus(null);
                }
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

        $('#modelEditDeviceSubStatusHeader').mouseup(function () {
            $("#modelEditDeviceSubStatus").draggable({ disabled: true });
        });

        $('#modelEditDeviceSubStatusHeader').mousedown(function () {
            $("#modelEditDeviceSubStatus").draggable({ disabled: false });
        });



        function checkerror(chekVal) {
            var retval = '';
            $("#subStatusmsg").empty();

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

            return retval;
        };

        self.description = ko.observable();
        self.subStatus = ko.observable();

        var selectedId = getSelectedUniqueId('jqxgridDeviceSubStatus');
        var source = _.where(globalVariableForEditDeviceSubStatus, { "selectedSubStatusId": selectedId[0] });
        self.subStatusId = source[0].selectedSubStatusId;
        self.description = source[0].selectedDescription;        

        self.deviceStatus = source[0].selectedDeviceStatus; 
        self.subStatus = source[0].selectedSubStatus;

       

        //Enable add button when changes in input text
        var subStatusForCheck = self.subStatus;
        var descriptionForCheck = self.description;
        $("#subStatus").on('change keyup paste', function (e) {
            if ($("#subStatus").val() != "") {
                if ($("#subStatus").val().trim() != "") {
                    $('#addGroupBtn').removeAttr('disabled');
                  
                }
                if (($("#subStatus").val().trim()) == subStatusForCheck) {
                    if (($("#description").val().trim()) == descriptionForCheck) {
                        $('#addGroupBtn').prop('disabled', true);
                    } else {
                        $('#addGroupBtn').prop('disabled', false);
                    }
                   
                }

                if (e.keyCode == 8 || e.keyCode == 46) {
                    if ($("#subStatus").val().trim() == "") {
                        $('#addGroupBtn').prop('disabled', true);
                        
                    }
                }
            } else {
                if ($("#subStatus").val().trim() == "") {
                    $('#addGroupBtn').prop('disabled', true);

                }
            }
           
        });

        $("#description").on('change keyup paste', function (e) {
            

            if (($("#subStatus").val().trim()) == subStatusForCheck) {
                      
                if (($("#description").val().trim()) == descriptionForCheck) {
                    $('#addGroupBtn').prop('disabled', true);
                } else {
                    $('#addGroupBtn').prop('disabled', false);
                }
                    }

            //if ($("#description").val() != "") {
            //    if ($("#description").val().trim() != "") {
            //        $('#addGroupBtn').removeAttr('disabled');

            //    }
            //    if (($("#description").val().trim()) == descriptionForCheck) {
            //        $('#addGroupBtn').prop('disabled', true);

            //    }

            //    if (e.keyCode == 8 || e.keyCode == 46) {
            //        if ($("#description").val().trim() == "") {
            //            $('#addGroupBtn').prop('disabled', true);

            //        }
            //    }
            //} else {
            //    if ($("#description").val().trim() == "") {
            //        $('#addGroupBtn').prop('disabled', true);

            //    }
            //}



        });
        //End Enable Add Button

      
        //unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
        };

        self.editSubStatus = function (observableModelPopup, isGridVisible) {
            var retval = checkerror();
            if (retval == null || retval == "") {
               
                editDeviceSubStatus(self.subStatusId, self.deviceStatus, self.description, self.subStatus, observableModelPopup, isGridVisible);

            } else {

            }
        }

        seti18nResourceData(document, resourceStorage);
    }
    function editDeviceSubStatus(subStatusId, deviceStatus, description, subStatus, observableModelPopup, isGridVisible) {
        var setDeviceSubStatusReq = new Object(); 
        var DeviceSubStatus = new Object();
        DeviceSubStatus.Description = $("#description").val();
        DeviceSubStatus.DeviceStatusConfigId = 39;
        DeviceSubStatus.SubStatus = $("#subStatus").val().replace(/(^[\s]+|[\s]+$)/g, '');
        DeviceSubStatus.SubStatusId = subStatusId;

        setDeviceSubStatusReq.DeviceSubStatus = DeviceSubStatus;
        setDeviceSubStatusReq.PreviousDeviceSubStatus = subStatus;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					observableModelPopup('unloadTemplate');
					$('#viewDeviceSubStatusModal').modal('hide');
                    gridFilterClear("jqxgridDeviceSubStatus");
                    openAlertpopup(0, 'device_sub_status_changes_saved_successfully');
                }
            } 
        }
        var method = 'SetDeviceSubStatus';
        var params = '{"token":"' + TOKEN() + '","setDeviceSubStatusReq":' + JSON.stringify(setDeviceSubStatusReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});