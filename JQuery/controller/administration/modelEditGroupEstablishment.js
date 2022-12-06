define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, koUtil,autho) {
    var sourceGroup;
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
      
        
        //Check rights
        function checkRights() {
            var retval = autho.checkRightsBYScreen('Groups and Hierarchies', 'IsModifyAllowed');
            if (retval == true && koUtil.isGroupBtnEnabled==1) {
                $('#addGroupBtn').removeAttr('disabled');
            } else {
                $('#addGroupBtn').addAttr('disabled');
            }
            return retval;
        }

        self.GroupName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_enter_a_group_name', {
                    lng: lang
                })
            }
        });

        $('#groupNameForEdit').on('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 9) {
                if ($(this).val() == "") {
                    self.GroupName(null);
                }
            }

        });

        $('#groupNameForEdit').keyup(function () {
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
            $('#groupNameForEdit').focus();
        });

        $('#viewgroupEstablishMentModal').keydown(function (e) {
            if ($('#cancelEditGroupBtn').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#closeBtnEditGroup').focus();
            }
        });

        //enabled add button
        $("#groupNameForEdit").on('change keyup paste', function () {
            if ($("#groupNameForEdit").val() != "") {
                $('#addGroupBtn').removeAttr('disabled');
                koUtil.isGroupBtnEnabled = 1;
                checkRights();
            }
        });

        $("#description").on('change keyup paste', function () {
            if ($("#description").val() != "") {
                $('#addGroupBtn').removeAttr('disabled');
                koUtil.isGroupBtnEnabled = 1;
                checkRights();
            }
        });

        $('#modelEditGrpEstablishmntHeader').mouseup(function () {
            $("#modelEditGrpEstablishmnt").draggable({ disabled: true });
        });

        $('#modelEditGrpEstablishmntHeader').mousedown(function () {
            $("#modelEditGrpEstablishmnt").draggable({ disabled: false });
        });


        function checkerror(chekVal) {
            var retval = '';
            $("#groupNamemsg").empty();

            //applying filter
            var groupName = $("input#groupNameForEdit");
            groupName.val(groupName.val().replace(/^\s+/, ""));

            if ($("#groupNameForEdit").val() == "") {
                retval += 'Group Name';
                self.GroupName(null);
                $("#groupNamemsg").text(i18n.t('please_enter_a_group_name'));
                $("#groupNamemsg").show();
               
            } else {
                retval += '';
            }

            return retval;
        };

        self.observableModelPopup=ko.observable();
       
        var selectedId = getSelectedUniqueId('jqxgridGroupEstablishment');
        sourceGroup = _.where(globalVariableForEditGroup, { selectedGroupId: selectedId[0] });

        self.groupId = sourceGroup[0].selectedGroupId;
        self.description = sourceGroup[0].selectedDescription;
        self.groupName = sourceGroup[0].selectedGroupName;

        //unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
        };

        self.editGroup = function (observableModelPopup, isGridVisible) {
            var retval = checkerror();
            if (retval == null || retval == "") {
              
                editGroupEstablishMent(self.groupName, self.groupId, self.description, observableModelPopup, isGridVisible);

            } else {

            }
        }

        seti18nResourceData(document, resourceStorage);
    }
    function editGroupEstablishMent(groupName, groupId, description, observableModelPopup) {
        var group = new Object();
        if (sourceGroup[0].selectedGroupName != $("#groupNameForEdit").val()) {
            group.GroupName = $("#groupNameForEdit").val().replace(/(^[\s]+|[\s]+$)/g, '');
        } else {
            group.GroupName = '';
        }
        group.Description = $("#description").val();
        group.GroupId = groupId;
      
        group.Tags = null;
        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    observableModelPopup('unloadTemplate');
                    gridFilterClear("jqxgridGroupEstablishment");
                    $('#viewgroupEstablishMentModal').modal('hide');
                    openAlertpopup(0, 'group_changes_successfully_saved');
                }
                else if (data.responseStatus.StatusCode == AppConstants.get('ESTABLISHMENT_GROUPNAME_EDIT_SAME')) {
                    openAlertpopup(2, data.responseStatus.StatusMessage);
                }
            } 
        }
        var method = 'SetGroup';
        var params = '{"token":"' + TOKEN() + '","group":' + JSON.stringify(group) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});