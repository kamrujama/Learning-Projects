define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {

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
     
        self.GroupName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_enter_a_group_name', {
                    lng: lang
                })
            }
        });
        $('#groupName').on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 9) {
                if ($(this).val() == "") {
                    self.GroupName(null);
                }
            }

        });

        $('#groupName').keyup(function () {
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


        //focus on first textbox
        $('#viewgroupEstablishMentModal').on('shown.bs.modal', function () {
            $('#groupName').focus();
        })

        $('#viewgroupEstablishMentModal').keydown(function (e) {
            if ($('#cancelBtnGroup').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#closeBtnGroupPopUp').focus();
            }
        });

        //enabled add button
        $("#groupName").on('change keyup paste', function () {
            if ($("#groupName").val() != "") {
                $('#addGroupBtn').removeAttr('disabled');
            }
        });

        $("#description").on('change keyup paste', function () {
            if ($("#description").val() != "") {
                $('#addGroupBtn').removeAttr('disabled');
            }
        });


        $('#modelAddGropEstabishmntHeader').mouseup(function () {
            $("#modelAddGropEstabishmnt").draggable({ disabled: true });
        });

        $('#modelAddGropEstabishmntHeader').mousedown(function () {
            $("#modelAddGropEstabishmnt").draggable({ disabled: false });
        });

        function checkerror() {
            var retval = '';
            $("#groupNamemsg").empty();
           
            //applying filter
            var groupName = $("input#groupName");
           
            groupName.val(groupName.val().replace(/^\s+/, ""));

            if ($("#groupName").val() == "") {
                retval += 'Group Name';
                self.GroupName(null);
                $("#groupNamemsg").text(i18n.t('please_enter_a_group_name'));
                $("#groupNamemsg").show();

            } else {
                retval += '';
            }

            return retval;
        };

        //unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
        };

        self.addGroup = function (observableModelPopup, isGridVisible) {
            var retval = checkerror();
            if (retval == null || retval == "") {
               
                addGroupCall(observableModelPopup, isGridVisible);
            } else {

            }

        }

        seti18nResourceData(document, resourceStorage);
    }
    function addGroupCall(observableModelPopup, isGridVisible) {
       
        var addGroupEstablishmentReq = new Object();
        var group = new Object();
        var currentApplyDate = moment().format(SHORT_DATE_FORMAT);
       
        group.AddedBy = userGuid;
        group.Description = $("#description").val();
        group.AddedOn = CreatJSONDate(currentApplyDate);
        group.GroupId = 0;
        group.GroupName = $("#groupName").val().replace(/(^[\s]+|[\s]+$)/g, '');
        group.Tags = null;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    observableModelPopup('unloadTemplate');
                    $('#viewgroupEstablishMentModal').modal('hide');
                    openAlertpopup(0, 'group_has_been_added_successfully');
                    gridFilterClear("jqxgridGroupEstablishment");
                } else if (data.responseStatus.StatusCode == AppConstants.get('ESTABLISHMENT_GROUPNAME_ADD_SAME')) {
                    openAlertpopup(2, 'group_name_already_exist');
                } else if (data.responseStatus.StatusCode == AppConstants.get('ESTABLISHMENT_GROUPNAME_LIMIT')) {
                    openAlertpopup(1, data.responseStatus.StatusMessage);
                }
                else if (data.responseStatus.StatusCode == AppConstants.get('CUSTOMFIELD_EXCEED_LIMIT_GROUPNAME_LIMIT')) {
                    openAlertpopup(1, data.responseStatus.StatusMessage);
                }
            } 
        }
        var method = 'AddGroup';
        var params = '{"token":"' + TOKEN() + '","group":' + JSON.stringify(group) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});