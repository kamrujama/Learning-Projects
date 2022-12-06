define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko) {
    var lang = getSysLang();
    uploadedfiledata = new Array();
    currentAddedUserGuid = "";
    currentTemporaryPassword = "";
    emailValue = "";

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function AddpackageViewModel() {
  
        var self = this;
       
        //focus on first textbox
        $('#downloadModel').on('shown.bs.modal', function () {
            $('#roleNameId').focus();
        })
		
        self.test = ko.observable();
        self.ModelNameArr = ko.observableArray();
        self.roleName = ko.observable();
        self.description = ko.observable();
        //Popu open
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        function loadelement(elementname, controllerId) {

            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        function generateTemplate(tempname, controllerId) {
            //new template code
            var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
            var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';


            ko.components.register(tempname, {
                viewModel: { require: ViewName },
                template: { require: 'plugin/text!' + htmlName }
            });
            // end new template code
        }

        self.cancel = function () {
            $("#roleNameId").val('');
            $("#descriptionId").val('');
            $("#roleMain").show();
            $('#rolesModel').hide();
        }

        //////Enable/Disable button
        $("#roleNameId").on('change keyup paste', function () {
            if ($("#roleNameId").val() != "") {
                $('#addBtn').removeAttr('disabled');
            }
        });

        $("#descriptionId").on('change keyup paste', function () {
            if ($("#descriptionId").val() != "") {
                $('#addBtn').removeAttr('disabled');
            }
        });

        $('#roleNameId').keyup(function () {
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
        
        //Validation on role name field
        self.roleName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('enter_role_name', {
                    lng: lang
                })
            }
        });

        function checkerror(chekVal) {
            var retval = '';

            var roleName = $("input#roleNameId");
            var roleDescription = $("input#descriptionId");
            roleName.val(roleName.val().replace(/^\s+/, ""));
            roleDescription.val(roleDescription.val().replace(/^\s+/, ""));

            if ($("#roleNameId").val() == "") {
                retval += 'role name';
                self.roleName(null);
                $("#enter_role_name").show();
            } else {
                retval += '';
            }
            return retval;
        };

        //Add Role API call
        self.addRole = function (observableModelPopup) {
            var retval = checkerror();
            if (retval == null || retval == "") {
                var role = new Object();
                $("#loadingDiv").show();
                role.RoleName = $("#roleNameId").val();
                role.Description = $("#descriptionId").val();

                function callbackFunction(data, error) {
                    if (data) {
                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                            gridFilterClear('jqxgridRoles');
                            observableModelPopup('unloadTemplate');
                            $("#roleMain").show();
                            $('#downloadModel').modal('hide');
                            openAlertpopup(0, 'role_added_successfully');
                        }
                        else if (data.responseStatus.StatusCode == AppConstants.get('DUPLICATE_ROLE_FOUND')) {
                            openAlertpopup(2, 'role_name_exists');
                        }
                        $("#loadingDiv").hide();
                    }
                    if (error) {
                        retval = "";
                    }
                }

                var method = 'AddRole';
                var params = '{"token":"' + TOKEN() + '","role":' + JSON.stringify(role) + '}';
                ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
            } else {
                return false;
            }
        }

        seti18nResourceData(document, resourceStorage);
    };

});

