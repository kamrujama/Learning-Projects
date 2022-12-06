define(["knockout", "koUtil", "autho", "advancedSearchUtil", "knockout.mapping", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil, autho, ADSearchUtil, koMapping) {
    var lang = getSysLang();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    var sequenceChanged = false;
    return function editTemplateAcrossAllMultiInstance() {
   
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
        $('#editDeviceEditParameterHeader').mouseup(function () {
            $("#mdlDeviceEditParameterContent").draggable({ disabled: true });
        });

        $('#editDeviceEditParameterHeader').mousedown(function () {
            $("#mdlDeviceEditParameterContent").draggable({ disabled: false });
        });
        self.editDeviceEditParameterHeader = ko.observable();
        var applicationId = koUtil.getEditDeviceProfile.ApplicationId;
        var applicationName = koUtil.getEditDeviceProfile.ApplicationName;
        var applicationVersion = koUtil.getEditDeviceProfile.ApplicationVersion;
        var displayHeader = i18n.t('edit_parameter_for_application', { lng: lang }) + " " + applicationName + " " + i18n.t('Version_packageUpgrade', { lng: lang }) + " " + applicationVersion;
        self.editDeviceEditParameterHeader(displayHeader);
        self.parametersObservableModel = ko.observable();
        self.checkAcrossAllInstances = ko.observable(false);
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.parametersObservableModel(elementname);
        }
        if (koUtil.getEditDeviceProfile.IsMultiVPFXSupported) {
            $("#updateAcrossAllInstancesCheck").removeClass('hide');
        } else {
            $("#updateAcrossAllInstancesCheck").addClass('hide');
        }
        self.cancelPopup = function (unloadAddTemplatepopup) {
            if (arrayofeditvalue.length > 0 || sequenceChanged) {
                $("#TemplateConfirmPopup").modal('show');
            } else {
                unloadAddTemplatepopup('checkTxtValue');
            }
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
        self.onChangeAcrosssAllInstances = function () {
            self.parametersObservableModel('unloadTemplate');
            if ($("#chkValidation").is(':checked')) {
                self.checkAcrossAllInstances(true);
                loadelement('modelGlobalUpdateParameterMultiInstance', 'device');
            } else {
                self.checkAcrossAllInstances(false);
                loadelement('modelDeviceProfileEditTemplate', 'device/deviceProfileTemplates');
            }
        }
        loadelement('modelDeviceProfileEditTemplate', 'device/deviceProfileTemplates');

        seti18nResourceData(document, resourceStorage);
    }
})