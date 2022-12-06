define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();

    return function modelDeleteContentLibrary() {
       
        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#downloadModel').on('shown.bs.modal', function (e) {
            $('#deleteDownloadBtn_No').focus();

        });
        $('#downloadModel').keydown(function (e) {
            if ($('#deleteDownloadBtn_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#deleteDownloadBtn_Yes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------



        var self = this;
        self.packageName = ko.observable();
        self.packageCount = ko.observable();
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var deleteCount = getAllSelectedDataCount('jqxgridDownloadlib');
        if (deleteCount > 1) {
            $("#deleteCountId").text(i18n.t('are_you_sure_you_want_to_delete_these_package(s)', { packageCount: deleteCount }, { lng: lang }))
            self.packageCount = deleteCount;
		} else {
			if (!_.isEmpty(globalVariableForEditPackage)) {
				self.packageName = globalVariableForEditPackage[0].packageName;
				var displayPackageName = self.packageName;
				$("#deleteMsgId").text(i18n.t('delete_lib_file_alert_device', { packageName: displayPackageName }, { lng: lang }));
			}
		}

        self.openPopup = function (popupName, observableModelPopup, templateFlag) {

            templateFlag(true);
            if (popupName == "modelViewConflictDetails") {
                loadelement(popupName, 'genericPopup', observableModelPopup);
                $('#downloadModel').modal('show');
            }
        }
        //Generate template
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
        //Load Template
        function loadelement(elementname, controllerId, observableModelPopup) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            observableModelPopup(elementname);
        }
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
            $('#downloadModel').modal('hide');
        }
        //click on yes button to delete library
        self.deleteLibrary = function (observableModelPopup, templateFlag) {
			var selectedItemIds = new Array();
			var unSelectedItemIds = new Array();
			var selectedFolderIds = new Array();
			if (!_.isEmpty(globalVariableForEditPackage)) {
				if (globalVariableForEditPackage[0].checkAll == 1) {
					selectedItemIds = null;
					unSelectedItemIds = globalVariableForEditPackage[0].unSelecedRowID;
					selectedFolderIds = (koUtil.GlobalColumnFilter.FilterList && koUtil.GlobalColumnFilter.FilterList.length > 0) ? null : globalVariableForEditPackage[0].folderIds;
				} else {
					selectedItemIds = globalVariableForEditPackage[0].selectedRowID;
					unSelectedItemIds = null;
					selectedFolderIds = null;
				}
				deletePackage(selectedItemIds, unSelectedItemIds, observableModelPopup, self.openPopup, templateFlag, selectedFolderIds);
			}
        }
        seti18nResourceData(document, resourceStorage);
    };

    // for delete library
	function deletePackage(selectedItemIds, unSelectedItemIds, observableModelPopup, openPopup, templateFlag, folderIds) {
        var deletePackageReq = new Object();
        var Selector = new Object();
        deletePackageReq.PackageType = 1;
		Selector.SelectedItemIds = selectedItemIds;
		Selector.UnSelectedItemIds = unSelectedItemIds;
		deletePackageReq.Selector = Selector;
		deletePackageReq.FolderIds = folderIds;
        deletePackageReq.IsDeleteAssociated = false;
        deletePackageReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

        var callBackfunction = function (data, error) {
            if (data) {
                $('#downloadModel').modal('hide');
                observableModelPopup('unloadTemplate');
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    gridFilterClear('jqxgridDownloadlib');                    
                    openAlertpopup(0, 'alert_package_delete_success');
                } else if (data.responseStatus.StatusCode == AppConstants.get('PACKAGE_IS_ASSOCIATED_TO_REFERENCESET')) {                   //36
                    openAlertpopup(1, 'package_which_are_associated_with_reference_sets_cannot_be_deleted');
                } else if (data.responseStatus.StatusCode == AppConstants.get('PACKAGE_ASSOCIATED_TO_DEVICE_HENCE_CANNOT_BE_DELETED')) {    //37
                    openAlertpopup(2, 'package_associated_to_device_hence_cannot_be_deleted');
                } else if (data.responseStatus.StatusCode == AppConstants.get('E_TEMPLATE_ASSIGNED_HIERARCHY')) {                           //319
                    conflictHierarchyParameters.TemplateHierarchyReferenceSet = data.deletePackageResp.TemplateHierarchyReferenceSet;
                    conflictHierarchyParameters.ActionMode = "DeletePackage";
                    conflictHierarchyParameters.InfoMessage = i18n.t("template_of_this_app_or_package_assigned_hierarchy_del_template", { lng: lang });
                    openPopup('modelViewConflictDetails', observableModelPopup, templateFlag);
                }
            }
        }
        var method = 'DeletePackage';
        var params = '{"token":"' + TOKEN() + '","deletePackageReq":' + JSON.stringify(deletePackageReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});