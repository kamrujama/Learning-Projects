define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, koUtil) {
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    var selectedModelFamily = "";
    var sourceFolderId = 0;

    return function EditpackageViewModel() {
        var config = {
            '.chosen-select': {},
            '.chosen-select-deselect': { allow_single_deselect: true },
            '.chosen-select-no-single': { disable_search_threshold: 10 },
            '.chosen-select-no-results': { no_results_text: 'Oops, nothing found!' },
            '.chosen-select-width': { width: "95%" }
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

        for (var selector in config) {
            $(selector).chosen(config[selector]);
        }

        var self = this;


        //Draggable function
        $('#mdlEditPackageHeader').mouseup(function () {
            $("#mdlEditPackageContent").draggable({ disabled: true });
        });

        $('#mdlEditPackageHeader').mousedown(function () {
            $("#mdlEditPackageContent").draggable({ disabled: false });
        });
        ////////////////
        selectedModelFamily = "";
        sourceFolderId = 0;
        self.observableModelPopupParentEditPackage = ko.observable();
        self.observableModelPopupChildEditPackage = ko.observable();
        self.observableModelChildEditPackage = ko.observable();
        self.templateFlag = ko.observable(false);
        self.templateFlagAdd = ko.observable(false);
        self.templateFlagChild = ko.observable(false);
        self.checkedModelAll = ko.observable(false);
        self.isAppView = ko.observable(false);
        self.enableDelay = ko.observable(false);

        self.PostInstall = ko.observable();
        self.postInstallAction = ko.observable();
        self.modelOption = ko.observable();
        self.ModelNameArr = ko.observableArray();
        self.models = ko.observableArray(koUtil.rootmodels);
        self.folders = ko.observableArray(globalFoldersArray);
        self.folderName = ko.observable();
        self.tags = ko.observableArray();
        self.tagsOption = ko.observable();
        self.tagsNameArray = ko.observableArray();
        self.Tags = ko.observable();
        self.validetbundleResponse = ko.observableArray();

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup', 1);

        self.unloadTempPopup = function (popupName) {
            self.observableModelPopupChildEditPackage('unloadTemplate');
            $('#editPackageDownloadParentViewModel').modal('hide');
        }

        self.unloadTempPopupParent = function (popupName) {
            self.observableModelChildEditPackage('unloadTemplate');
            $('#editPackageDownloadParentView').modal('hide');
        }

        if (globalVariableForEditPackage && globalVariableForEditPackage.length > 0) {
            self.ConfigValue = globalVariableForEditPackage[0].selectedFIleType;
            self.selectedSupportedModels = globalVariableForEditPackage[0].selectedSupportedModels;
            self.packageTypes = ko.observableArray(packageTypes);
            self.PackageFileValue = globalVariableForEditPackage[0].selectedFileName;
            self.fileExtension = self.PackageFileValue.split('.').pop().toLowerCase();
            self.PackageNameValue = globalVariableForEditPackage[0].selectedPackageName;
            self.FileVersionValue = globalVariableForEditPackage[0].selectedFileVersion;
            self.TagsValue = globalVariableForEditPackage[0].selectedTags;
            self.modelOption = globalVariableForEditPackage[0].selectedSupportedModels;
            self.FolderId = globalVariableForEditPackage[0].FolderId;
            self.folderName = globalVariableForEditPackage[0].FolderName;
            self.fileSize = globalVariableForEditPackage[0].selectedFileSizeInMB;
            self.packageMode = globalVariableForEditPackage[0].selectedPackageMode;
            self.fileUploadDate = globalVariableForEditPackage[0].selectedFileUploadDate;
            self.isEnableForAutomation = globalVariableForEditPackage[0].selectedEnabledForAutomation;
            self.packageId = globalVariableForEditPackage[0].selectedPackageId;
            self.SupportedModelFamily = globalVariableForEditPackage[0].selectedSupportedModelFamily;
            self.Component = globalVariableForEditPackage[0].selectedComponent;
            self.IsMasterPackage = globalVariableForEditPackage[0].IsMasterPackage;
            self.checkValidationForDA = ko.observable(globalVariableForEditPackage[0].selectedEnabledForAutomation);
            sourceFolderId = globalVariableForEditPackage[0].FolderId;

            if (self.isEnableForAutomation == true) {
                setScreenControls(AppConstants.get('EDIT_PACKAGE'));
            }

            var gridID = globalVariableForEditPackage.gID;
            $("#selectPackageTypeEdit").get(0).selectedIndex = globalVariableForEditPackage[0].selectedFIleType;
            $("#modelTypeEdit").hide();

            var valueOfPostinstall = globalVariableForEditPackage[0].selectedPostinstallAction;
            if (valueOfPostinstall == 0) {
                self.postInstallAction('0');
            } else if (valueOfPostinstall == 1) {
                self.postInstallAction('1');
            } else if (valueOfPostinstall == 2) {
                self.postInstallAction('2');
            } else if (valueOfPostinstall == 3) {
                self.postInstallAction('3');
            }
            self.InstallDelay = globalVariableForEditPackage[0].InstallDelay;

            if (self.ConfigValue === AppConstants.get('ANDROID_OTA') || self.ConfigValue === AppConstants.get('SUPER_PACKAGE')) {
                $("#selectPackageTypeEdit").prop('disabled', true);
                $("#selectPackageTypeEdit").addClass('disabled').trigger('chosen:updated');
            }

            if (globalVariableForEditPackage[0].IsModelEditAllowed) {
                getModelsforPackage(self.SupportedModelFamily, self.fileExtension, self.ConfigValue, self.FolderName);
            } else {
                var supportedModel = new Object();
                var modelArray = new Array();
				var modelDetails = new Array();
                self.models([]);
                modelArray = globalVariableForEditPackage[0].selectedSupportedModels ? globalVariableForEditPackage[0].selectedSupportedModels.split(',') : [];

                if (modelArray && modelArray.length > 0) {
                    for (var i = 0; i < modelArray.length; i++) {
                        supportedModel = new Object();
                        supportedModel.ModelName = modelArray[i];
						modelDetails = _.where(koUtil.rootmodels, { ModelName: modelArray[i] });
                        if (!_.isEmpty(modelDetails))
						{
							supportedModel.ModelId = modelDetails[0].ModelId;
						}
						else
						{
							supportedModel.ModelId = i + 1;
						}
                        self.models().push(supportedModel);
                    }
                }

                $('#modelTypesIdEdit').val('-Select-').prop("selected", "selected");
                $("#modelTypesIdEdit").prop('disabled', true);
                $("#modelTypesIdEdit").addClass('disabled');
                $("#checkForAll").prop('disabled', true);
                $("#checkForAll").addClass('disabled');

                getTags(self.tags, self.TagsValue, self.ConfigValue, self.FolderName);
            }
        }

        function getModelsforPackage(supportedModelFamily, fileExtension, configValue, folder) {
            var getModelsForPackageReq = new Object();
            getModelsForPackageReq.SupportedModelFamily = supportedModelFamily;
            getModelsForPackageReq.FileExtension = fileExtension;

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.getModelsForPackageResp)
                            data.getModelsForPackageResp = $.parseJSON(data.getModelsForPackageResp);
                        self.models(data.getModelsForPackageResp.SupportedModels);

                        $('#modelTypesIdEdit').val('-Select-').prop("selected", "selected");
                        $('#modelTypesIdEdit').trigger('chosen:updated');
                        $("#checkForAll").prop('disabled', false);
                        $("#checkForAll").removeAttr('disabled').trigger('chosen:updated');
                        $("#modelTypesIdEdit").prop('disabled', false);
                        $("#modelTypesIdEdit").removeAttr('disabled').trigger('chosen:updated');

                        getTags(self.tags, self.TagsValue, configValue, folder);
                    }
                }
            }
            var method = 'GetModelsForPackage';
            var params = '{"token":"' + TOKEN() + '", "getModelsForPackageReq": ' + JSON.stringify(getModelsForPackageReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        function getTags(tags, selectedTags, configValue, folder) {
            var getTagsReq = new Object();
            var Export = new Object();
            var Selector = new Object();
            var Pagination = new Object();

            Pagination.HighLightedItemId = null;
            Pagination.PageNumber = 1;
            Pagination.RowsPerPage = 250;

            Export.DynamicColumns = null;
            Export.VisibleColumns = [];
            Export.IsAllSelected = false;
            Export.IsExport = false;

            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = null;

            var ColumnSortFilter = new Object();
            ColumnSortFilter.FilterList = null;
            ColumnSortFilter.SortList = null;
            ColumnSortFilter.GridId = 'Tags';

            getTagsReq.Pagination = Pagination;
            getTagsReq.ColumnSortFilter = ColumnSortFilter;
            getTagsReq.Export = Export;
            getTagsReq.Selector = Selector;

            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.getTagsResp) {
                            data.getTagsResp = $.parseJSON(data.getTagsResp);
                            tags(data.getTagsResp.Tags);

                            var values = selectedTags;
                            var tagsArray = $('select#tagsComboEdit option');

                            $.each(values.split(','), function (index, element) {
                                for (var i = 0; i < tagsArray.length; i++) {
                                    var tagName = tagsArray[i].text;
                                    var source = _.where(tags(), { TagName: tagName });
                                    tagName = tagName.replace(/ /g, '');
                                    element = element.replace(/ /g, '');
                                    if (tagName.trim() == element.trim()) {
                                        $('select#tagsComboEdit option[value=' + tagsArray[i].value + ']').prop('selected', 'selected');
                                        $("#tagsComboEdit").trigger('chosen:updated');
                                        break;
                                    }
                                }
                            });

                            setValues(self.models, configValue, folder);
                        }
                    }
                }
            }

            var method = 'GetTags';
            var params = '{"token":"' + TOKEN() + '","getTagsReq":' + JSON.stringify(getTagsReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
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

        $('#packageNameEdit').keyup(function () {
            var yourInput = $(this).val();
            re = /[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
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

        self.hideApplicationPopup = function () {
            $("#childApplicationView").modal('hide');
        }

        modelReposition();
        self.openPopup = function (popupName, gId) {
            self.templateFlagChild(true);
            if (popupName == "modelViewChildDownloadLibrary") {
                loadelementchild(popupName, 'genericPopup');
                $('#editPackageDownloadParentView').modal('show');
            }
        }


        //model Edit Clear filter Application
        self.clearfilterApplication = function (gId) {
            clearUiGridFilter(gId);
            $('#' + gId).jqxGrid('clearselection');
        }
        self.exportToExcelApplication = function (gId) {
            var dataInfo = $("#" + gId).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {

                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                exportjqxcsvData(gId,'AddIPRange_view_import');
                openAlertpopup(1, 'export_Information');
                $("#loadingDiv").hide();
            }
        }



        $('#mdlEditPackage').keydown(function (e) {
            if ($('#btn_editPackageCancel').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#btn_editPackage_Close').focus();
            }
        });

        $('#btn_editPackage_Close').keydown(function (e) {
            if ((e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#checkForAll').focus();
            }
        });

        $('#selcteFileEdit').keydown(function (e) {
            if ((e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#checkForAll').focus();
            }
        });
        $('#packageNameEdit').keydown(function (e) {
            if ((e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#checkForAll').focus();
            }
        });



        $('#fileVersionEdit').keyup(function () {
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

        $("#selectPackageTypeEdit").on('change keyup paste', function () {
            if ($("#selectPackageTypeEdit").val() != "") {
                $('#btn_editPackage').removeAttr('disabled');
            }
        });

        $("#fileVersionEdit").on('change keyup paste', function () {
            if ($("#fileVersionEdit").val() != "") {
                $('#btn_editPackage').removeAttr('disabled');
            }
        });

        $("#tagTxtEdit").on('change keyup paste', function () {
            if ($("#tagTxtEdit").val() != "") {
                $('#btn_editPackage').removeAttr('disabled');
            }
        });

        $("#inlineRadio1Edit").on('change keyup paste', function () {
            if ($("#inlineRadio1Edit").val() != "") {
                self.enableDelay(false);
                $('#btn_editPackage').removeAttr('disabled');
            }
        });

        $("#inlineRadio2Edit").on('change keyup paste', function () {
            if ($("#inlineRadio2Edit").val() != "") {
                self.enableDelay(false);
                $('#btn_editPackage').removeAttr('disabled');
            }
        });

        $("#inlineRadio3Edit").on('change keyup paste', function () {
            if ($("#inlineRadio3Edit").val() != "") {
                self.enableDelay(false);
                $('#btn_editPackage').removeAttr('disabled');
            }
        });

        $("#inlineRadio4Edit").on('change keyup paste', function () {
            if ($("#inlineRadio4Edit").val() != "") {
                self.enableDelay(true);
                $('#btn_editPackage').removeAttr('disabled');
            }
        });

        $('#modelTypesIdEdit_chosen .chosen-choices').on('click', function () {
            $('#modelTypesIdEdit_chosen .search-field input[type=text]').focus();
        });
        $('#tagsComboEdit_chosen .chosen-choices').on('click', function () {
            $('#tagsComboEdit_chosen .search-field input[type=text]').focus();
        });
        self.PackageFile = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_select_package_file', {
                    lng: lang
                })
            }
        });

        self.PackageNameEdit = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_enter_package_name', {
                    lng: lang
                })
            }
        });
        self.ModelName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_select_model', {
                    lng: lang
                })
            }
        });

        self.FolderName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_select_folder', {
                    lng: lang
                })
            }
        });

        self.FileVersion = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_enter_file_version', {
                    lng: lang
                })
            }
        });

        self.ConfigValue = ko.observable("").extend({
            required: {
                params: true,
                message: i18n.t('please_select_package_type', {
                    lng: lang
                })
            }
        });

        self.TagName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_select_a_tag', {
                    lng: lang
                })
            }
        });

        self.tagsOption.subscribe(function (newValue) {
            if (newValue == 0) {
                $('#tagsComboEdit option').prop('selected', true);
                $('#tagsComboEdit').trigger('chosen:updated');
            }
        });

        //show package details
        self.packageDetails = function () {
            $("#footerEditPackage").removeClass('disabled');
            self.templateFlagAdd(false);
        }

        self.clearfilter = function (gridID) {
            gridFilterClear(gridID);
        }

        //Edit packages		
        self.applicationGridDetails = function (gID) {
            $("#footerEditPackage").addClass('disabled');
            //  applicationViewPopupForEditPackageDownloadLib( self.packageId,self.packageMode,0,'');
            //self.templateFlag(true);AplicationViewPopupFromSoftwareAssignment
            koUtil.editPackageGid = 'jqxgridViewEditPackDownloadLib';
            koUtil.editPackgeId = self.packageId;
            koUtil.editPackgeMode = self.packageMode;
            koUtil.BundleState = 0;

            // koUtil.isDownloadlibAddpackage = 2;
            //self.templateFlagAdd(true);
            //loadelement('unloadTemplate', 'genericPopup', 1);
            //loadelement('modelAddPackageViewParam', 'downloadLibrary', 1);
            self.isAppView(true);

            var packageID = koUtil.editPackgeId;
            var packagemode = koUtil.editPackgeMode;
            var editPackageGid = koUtil.editPackageGid;
            if (packagemode == 'Package' || packagemode == '1') {
                $("#showHideRestBtnParentModel").show();
                var getApplicationsForPackageReq = aplicationGridModel(packageID, editPackageGid);
                getAvailablePackages(getApplicationsForPackageReq, editPackageGid, false, self.openPopup);
            } else {
                $("#showHideRestBtnParentModel").hide();
                getBundlesForPackage(packageID, editPackageGid, false, self.openPopup);
            }
        }

        // Export to excel
        self.exportToExcel = function (gID) {
            exportjqxcsvData(gID,'Applications');
            openAlertpopup(1, 'export_Information');
        }

        function availableApplicationGrid(applicationData, gID) {
            var filterObj;
            var selectedArray = new Array();
            var selectedRowID;
            var HighlightedRowID;
            var rowsToColor = [];
            var RowID;
            var localData;

            var source =
                {
                    dataType: "observablearray",
                    localdata: applicationData,
                    dataFields: [
                        { name: 'ApplicationName', map: 'ApplicationName' },
                        { name: 'ApplicationVersion', map: 'ApplicationVersion' },
                        { name: 'IsParameterizationEnabled', map: 'IsParameterizationEnabled' },
                    ],

                };

            var cellclass = function (row, columnfield, value) {
                if (value == HighlightedRowID) {
                    RowID = row;
                    return 'red';
                }
            }
            var cellclassSub = function (row, columnfield, value) {
                if (row == RowID) {
                    return 'red';
                }
            }
            var rowColorFormatter = function (cellValue, options, rowObject) {
                if (cellValue == HighlightedRowID)
                    rowsToColor[rowsToColor.length] = options.rowId;
                return cellValue;
            }
            var dataAdapter = new $.jqx.dataAdapter(source);
            var buildFilterPanel = function (filterPanel, datafield) {
                genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
            }
            $("#" + gID).jqxGrid(
                {
                    width: "100%",
                    editable: true,
                    source: dataAdapter,
                    altRows: true,
                    //showfilterrow: true,
                    pageSize: 5,
                    filterable: true,
                    sortable: true,
                    columnsResize: true,
                    rowsheight: 32,
                    height: "200px",
                    selectionmode: 'singlerow',
                    theme: AppConstants.get('JQX-GRID-THEME'),
                    columns: [
                        {
                            text: i18n.t('app_name', { lng: lang }), filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }, dataField: 'ApplicationName', editable: false, minwidth: 100,
                        },
                        {
                            text: i18n.t('app_version', { lng: lang }), filtertype: "custom", dataField: 'ApplicationVersion', editable: false, minwidth: 100,
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('ParameterDefination', { lng: lang }), filtertype: "custom", datafield: 'IsParameterizationEnabled', editable: false, minwidth: 100,
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        }
                    ]
                });
        }

        self.savePackage = function (observableModelPopup) {
            var retval = checkerror();
            if (retval == null || retval == "") {                
                $("#editPackageConfirmationDiv").modal('show');
            }
        }

        self.updatePackage = function (observableModelPopup) {
            var folderSource = _.where(self.folders(), { FolderName: self.folderName });
            var folderId = 0;
            if (folderSource && folderSource.length > 0) {
                folderId = folderSource[0].FolderId;
            }
            $("#editPackageConfirmationDiv").modal('hide');
            setPackage(self.packageId, self.fileSize, self.packageMode, self.fileUploadDate, self.ModelNameArr, self.tagsNameArray, gridID, observableModelPopup, folderId);
        }

        self.cancelUpdatePackage = function () {
            $("#editPackageConfirmationDiv").modal('hide');
        }

        self.onChangeFileType = function () {
            $("#validatePackageType").empty();
            if ($("#selectPackageTypeEdit").find('option:selected').text() == "") {
                self.ConfigValue = null;
                $("#please_select_package_type").show();
                $("#validatePackageType").append(i18n.t('please_select_package_type'));
            } else {
                $("#validatePackageType").empty();
            }
        }

        self.onChangeModel = function () {
            $("#modelTypeEdit").empty();
            selectedModelFamily = '';
            if ($("#modelTypesIdEdit").chosen().val() == null || $("#modelTypesIdEdit").chosen().val() == "" || $("#modelTypesIdEdit").chosen().val().length == 0) {

                $('#checkForAll').prop("checked", false);
                self.ModelName = null;
                $("#modelTypeEdit").append(i18n.t('please_select_model'));
                if (self.Component == AppConstants.get('Android')) {
                    var disableFlag = false;
                    disableFlag = updateSelectedModelFamily(self.SupportedModelFamily, disableFlag);
                    if (disableFlag) {
                        $("#radioEditPackageID").find("input").prop("disabled", true);
                        self.postInstallAction('0');
                        self.enableDelay(false);
                    }
                } else {
                    $("#radioEditPackageID").find("input").prop("disabled", false);
                }
            } else {
                var forselection = [];
                self.ModelNameArr([]);
                var disableFlag = false;
                $('#modelTypesIdEdit :selected').each(function (i, selected) {
                    var selectionObj = new Object();
                    selectionObj.id = $(selected).val();
                    selectionObj.Name = $(selected).text();
                    forselection.push(selectionObj);
                    var source = _.where(self.models(), { ModelName: $(selected).text() });
                    if (self.Component == AppConstants.get('Android')) {
                        if (source && source != '' && source.length > 0) {
                            disableFlag = updateSelectedModelFamily(source[0].Family, disableFlag);
                        }
                    } else if (source && source != '') {
                        if (source[0].Family.toUpperCase() == AppConstants.get('PWM_FAMILY') || source[0].Family.toUpperCase() == AppConstants.get('VX_FAMILY')) {
                            disableFlag = true;
                        }
                    }
                });
                if (disableFlag == true) {
                    $("#radioEditPackageID").find("input").prop("disabled", true);
                    self.postInstallAction('0');
                    self.enableDelay(false);
                } else {
                    $("#radioEditPackageID").find("input").prop("disabled", false);
                }
                if (forselection.length > 0) {
                    self.ModelNameArr.push(forselection);
                }
                $("#modelTypeEdit").empty();
                $('#btn_editPackage').removeAttr('disabled');

                var selectedArray = self.models();
                var dataselected = forselection;
                if (dataselected.length == selectedArray.length) {
                    self.checkedModelAll(true);
                } else {
                    self.checkedModelAll(false);
                }
            }

            checkDelay();
        }

        self.onChangeTags = function () {
            var selectedTags = [];
            self.tagsNameArray([]);
            if ($("#tagsComboEdit").chosen().val() == null || $("#tagsComboEdit").chosen().val() == "" || $("#tagsComboEdit").chosen().val().length == 0) {
                self.TagName(null);
            } else {
                selectedTags = [];
                var sourceTag = new Array();
                $('#tagsComboEdit :selected').each(function (i, selected) {
                    selectedTags[i] = $(selected).text();
                });

                for (var j = 0; j < selectedTags.length; j++) {
                    sourceTag = _.where(self.tags(), { TagName: selectedTags[j] });

                    if (!_.isEmpty(sourceTag)) {
                        var tagsObject = new Object();
                        tagsObject.TagId = sourceTag[0].TagId;
                        tagsObject.TagName = sourceTag[0].TagName;
                        self.tagsNameArray.push(tagsObject);
                    }
                }
            }
        }

        self.increaseDelay = function () {
            if (self.enableDelay() == true) {
                var delay = $("#txtDelayEdit").val();

                if (parseInt(delay) < parseInt(AppConstants.get("POST_INSTALL_DELAY_MAX"))) {
                    $("#txtDelayEdit").val(parseInt(delay) + 1);
                }
            }
        }

        self.decreaseDelay = function () {
            if (self.enableDelay() == true) {
                var delay = $("#txtDelayEdit").val();

                if (parseInt(delay) > parseInt(AppConstants.get("POST_INSTALL_DELAY_MIN"))) {
                    $("#txtDelayEdit").val(parseInt(delay) - 1);
                }
            }
        }

        function checkerror(chekVal) {
            var retval = '';
            $("#modelTypeEdit").empty();
            $("#validatePackageType").empty();
            if ($("#selcteFileEdit").val() == "") {
                retval += 'SELECT FILE';
                self.PackageFile(null);
                $("#please_select_package_file").show();
            } else {
                retval += '';
            }

            if ($("#modelTypesIdEdit").chosen().val() == null || $("#modelTypesIdEdit").chosen().val() == "" || $("#modelTypesIdEdit").chosen().val().length == 0) {
                retval += 'Select Model(s)';
                self.ModelName = null;
                $("#modelTypeEdit").show();
                $("#modelTypeEdit").append(i18n.t('please_select_model'));
            } else {
                retval += '';
                $("#modelTypeEdit").empty();
            }

            if (!globalVariableForEditPackage[0].IsMasterPackage) {
                if ($("#packageNameEdit").val() == "") {
                    retval += 'login name';
                    self.PackageNameEdit(null);
                    $("#please_enter_package_name").show();
                } else {
                    retval += '';
                }

                if ($("#selectPackageTypeEdit").find('option:selected').text() == "") {
                    retval += 'FILE VERSION';
                    self.ConfigValue = null;
                    $("#please_select_package_type").show();
                    $("#validatePackageType").append(i18n.t('please_select_package_type'));
                } else {
                    retval += '';
                    $("#validatePackageType").empty();
                }
            }

            if ($("#txtEditFolder").val() == "") {
                retval += 'Enter Folder Name';
                self.FolderName(null);
            } else {
                retval += '';
            }

            if ($("#fileVersionEdit").val() == "") {
                retval += 'FILE VERSION';
                self.FileVersion(null);
                $("#please_enter_file_version").show();
            } else {
                retval += '';
            }
            return retval;
        }

        function loadelement(elementname, controllerId, isAddpack) {

            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            if (isAddpack == 1) {
                self.observableModelPopupParentEditPackage(elementname);
            }
            self.observableModelChildEditPackage(elementname);
        }

        function loadelementchild(elementname, controllerId) {

            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }

            self.observableModelChildEditPackage(elementname);
        }

        $('#checkForAll').change(function (e) {

            if ($('#checkForAll').is(':checked')) {
                $('#btn_editPackage').removeAttr('disabled');
                $('#modelTypesIdEdit option').prop('selected', true);
                $('#modelTypesIdEdit').trigger('chosen:updated');
                ////for all selcted formed arra
                var forselection = [];
                self.ModelNameArr([]);
                var disableFlag = false;
                selectedModelFamily = '';
                $('#modelTypesIdEdit :selected').each(function (i, selected) {
                    var selectionObj = new Object();
                    selectionObj.id = $(selected).val();
                    selectionObj.Name = $(selected).text();
                    forselection.push(selectionObj);
                    var source = _.where(self.models(), { ModelName: $(selected).text() });
                    if (self.Component == AppConstants.get('Android')) {
                        if (source && source != '' && source.length > 0) {
                            disableFlag = updateSelectedModelFamily(source[0].Family, disableFlag);
                        }
                    } else if (source && source != '') {
                        if (source[0].Family.toUpperCase() == AppConstants.get('PWM_FAMILY') || source[0].Family.toUpperCase() == AppConstants.get('VX_FAMILY')) {
                            disableFlag = true;
                        }
                    }
                });

                if (disableFlag == true) {
                    $("#radioEditPackageID").find("input").prop("disabled", true);
                    self.postInstallAction('0');
                    self.enableDelay(false);
                } else {
                    $("#radioEditPackageID").find("input").prop("disabled", false);
                }
                if (forselection.length > 0) {
                    self.ModelNameArr.push(forselection);
                }
                e.preventDefault();
            } else {
                $('#btn_editPackage').prop('disabled', true);
                $('#modelTypesIdEdit option').prop('selected', false);
                $('#modelTypesIdEdit').trigger('chosen:updated');
                if (self.Component == AppConstants.get('Android')) {
                    $("#radioEditPackageID").find("input").prop("disabled", true);
                    self.postInstallAction('0');
                    self.enableDelay(false);
                } else {
                    $("#radioEditPackageID").find("input").prop("disabled", false);
                }
                e.preventDefault();
            }

        });

        self.exportToExcelApplicationParent = function (gridId) {
            var dataInfo = $("#" + gridId).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                $("#" + gridId).jqxGrid('exportdata', 'csv', 'Application');
                openAlertpopup(1, 'export_Information');
                $("#loadingDiv").hide();
            }
        }

        self.clearfilterApplicationParent = function (gridId) {
            clearUiGridFilter(gridId);
            $('#' + gridId).jqxGrid('clearselection');
        }

        $(".chosen-results").css("max-height", "122px");
        $(".chosen-choices").css("max-height", "300px");
        $(".chosen-choices").css("overflow", "auto");

        function setValues(models, configValue, folder) {
            //Package Type selection
            $('#selectPackageTypeEdit').val(configValue).prop("selected", "selected");
            $('#selectPackageTypeEdit').trigger('chosen:updated');

            //Model selection
            var checkArr = self.selectedSupportedModels.split(',');
            var values = self.selectedSupportedModels;
            var modelsArray = $('select#modelTypesIdEdit option');

            if (models().length == checkArr.length) {
                $("#checkForAll").prop('checked', true);
            }
            var disableFlag = false;
            $.each(values.split(','), function (index, element) {
                for (var i = 0; i < modelsArray.length; i++) {
                    var modelName = modelsArray[i].text;
                    var source = _.where(koUtil.getModelsFamily(), { ModelName: modelName });
                    modelName = modelName.replace(/ /g, '');
                    element = element.replace(/ /g, '');
                    if (modelName.trim() == element.trim()) {
                        $('select#modelTypesIdEdit option[value=' + modelsArray[i].value + ']').prop('selected', 'selected');
                        $("#modelTypesIdEdit").trigger('chosen:updated');
                        break;
                    }
                }

                //disable radio button when model family is PWM or Vx
                if (self.Component == AppConstants.get('Android')) {
                    if (source && source != '' && source.length > 0) {
                        disableFlag = updateSelectedModelFamily(source[0].Family, disableFlag);
                    }
                } else if (source && source != '') {
                    if (source[0].Family.toUpperCase() == AppConstants.get('PWM_FAMILY') || source[0].Family.toUpperCase() == AppConstants.get('VX_FAMILY')) {
                        disableFlag = true;
                    }
                }

            });

            if ((models().length == checkArr.length) === 1) {
                $("#modelTypesIdEdit").prop('disabled', true);
                $("#modelTypesIdEdit").addClass('disabled');
                $("#checkForAll").prop('disabled', true);
                $("#checkForAll").addClass('disabled');
            }

            if (disableFlag == true) {
                $("#radioEditPackageID").find("input").prop("disabled", true);
                self.postInstallAction('0');
                self.enableDelay(false);
            } else {
                $("#radioEditPackageID").find("input").prop("disabled", false);
            }

            checkDelay();
        }

        function checkDelay() {
            if (globalVariableForEditPackage[0].selectedPostinstallAction == 3) {
                self.postInstallAction('3');
                if ($('input[name="inlineRadioOptions"]:checked').val() == "3") {
                    self.enableDelay(true);
                } else {
                    self.enableDelay(false);
                }
            }
        }

        seti18nResourceData(document, resourceStorage);
    };

    function updateSelectedModelFamily(Family, disableflag) {
        if (Family && Family != '' && Family.length > 0) {
            if (selectedModelFamily == '') {
                selectedModelFamily = Family
            }
            if (Family.toUpperCase() == AppConstants.get('CARBON_FAMILY')) {
                disableflag = true;
                if (selectedModelFamily != Family) {
                    selectedModelFamily = AppConstants.get('CARBON_AND_CARBON_MOBILE_FAMILY');
                }
            } else if (Family.toUpperCase() == AppConstants.get('CARBON_MOBILE_FAMILY')) {
                if (selectedModelFamily != Family) {
                    selectedModelFamily = AppConstants.get('CARBON_AND_CARBON_MOBILE_FAMILY');
                }
            }
        }
        return disableflag;
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



    function getmodelarr(model) {
        var modelNew = new Array();
        if (model.length <= 0) {
            $("#modelTypesIdEdit :selected").each(function (i, selected) {
                var EModel = new Object();
                EModel.ModelId = $(selected).val();
                EModel.ModelName = $(selected).text();
                modelNew.push(EModel);
            });
        } else {
            var selectedModelId = $("#modelTypesIdEdit").chosen().val();
            var selectedModelName = model[0];
            if (selectedModelId && selectedModelId.length > 0) {
                for (var i = 0; i < selectedModelId.length; i++) {
                    var EModel = new Object();
                    EModel.ModelId = selectedModelId[i];
                    EModel.ModelName = selectedModelName[i].Name;
                    modelNew.push(EModel);
                }
            }
        }
        return modelNew;
    }

    function setPackage(packageId, fileSize, packageMode, fileUploadDate, ModelsArray, tagsArray, gridID, observableModelPopup, folderId) {
        $("#loadingDiv").show();
        var setPackageReq = new Object();
        var packages = new Object();
        var FileInfo = new Object();
        FileInfo.DestinationPath = "";

        packages.Applications = null;
        packages.CreatedByUserName = null;
        packages.Description = null;
        packages.DeviceFileLocation = null;
        packages.DeviceFileName = null;
        packages.DeviceFileNameAlias = null;
        packages.DeviceFileLocationAlias = null;
        packages.FileInfo = FileInfo;
        packages.FileName = $("#selcteFileEdit").val();
        packages.FileName = packages.FileName.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt");
        packages.FileSize = 12345;//fileSize;
        packages.FileType = $("#selectPackageTypeEdit").find('option:selected').text();
        packages.FileUploadDate = CreatJSONDate(fileUploadDate);
        packages.FileVersion = $("#fileVersionEdit").val();
        packages.PackageName = $("#packageNameEdit").val();
        packages.PackageType = 1;
        packages.PackageId = packageId;
        packages.IsEnabledForAutomation = false;
        packages.PackageMode = packageMode;
        packages.IsFileDldAllowed = true;
        packages.IsParameterDldAllowed = true;
        packages.PostInstallAction = $('input[name="inlineRadioOptions"]:checked').val();
        packages.InstallDelay = $('input[name="inlineRadioOptions"]:checked').val() == "3" ? $("#txtDelayEdit").val() : 0;
        packages.TargetUser = null;
        packages.TargetUserAlias = null;

        var model = getmodelarr(ModelsArray());
        setPackageReq.Package = packages;
        setPackageReq.IsFileParamOptChanged = 0;
        setPackageReq.Models = model;
        setPackageReq.SourceFolderId = sourceFolderId;
        setPackageReq.FolderId = folderId;
        setPackageReq.IsMasterPackage = false;
        setPackageReq.SubPackages = [];
        setPackageReq.PackageTags = tagsArray();

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    gridFilterClear(gridID);
                    $("#downloadModel").modal('hide');
                    observableModelPopup('unloadTemplate');
                    openAlertpopup(0, 'alert_file_updat_success_device');
                } else if (data.responseStatus.StatusCode == AppConstants.get('MODEL_DOES_NOT_SUPPORT_UPLOAD')) {   //159
                    openAlertpopup(1, data.responseStatus.StatusMessage);
                } else if (data.responseStatus.StatusCode == AppConstants.get('CANNOT_REMOVE_MODELS')) {            //176
                    openAlertpopup(1, data.responseStatus.StatusMessage);
                }
            }
            $("#loadingDiv").hide();
        }

        var method = 'SetPackage';
        var params = '{"token":"' + TOKEN() + '","setPackageReq":' + JSON.stringify(setPackageReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }

    function getAvailablePackages(getApplicationsForPackageReq, gId, isFromReferenceSet, openPopup) {
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data && data.getApplicationsForPackageResp) {
                        data.getApplicationsForPackageResp = $.parseJSON(data.getApplicationsForPackageResp);
                    }
                    availableApplicationGrid1(gId, data.getApplicationsForPackageResp.Applications, isFromReferenceSet, openPopup);
                }
            }
        }

        var method = 'GetApplicationsForPackage';
        var params = '{"token":"' + TOKEN() + '","getApplicationsForPackageReq":' + JSON.stringify(getApplicationsForPackageReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    //For Bundle
    function getBundlesForPackage(packageID, gId, isFromReferenceSet, openPopup) {
        var getBundlesForPackageReq = new Object();
        getBundlesForPackageReq.PackageId = packageID;
        getBundlesForPackageReq.State = koUtil.BundleState;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    applicationsGrid(data, gId, isFromReferenceSet, openPopup);
                }
            }
        }
        var method = 'GetBundlesForPackage';
        var params = '{"token":"' + TOKEN() + '","getBundlesForPackageReq":' + JSON.stringify(getBundlesForPackageReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function availableApplicationGrid1(gId, Applicationsdata, isFromReferenceSet, openPopup) {
        var source =
            {
                dataType: "json",
                dataFields: [
                    { name: 'ApplicationName', map: 'ApplicationName' },
                    { name: 'ApplicationVersion', map: 'ApplicationVersion' },
                    { name: 'IsParameterizationEnabled', map: 'IsParameterizationEnabled' },
                    { name: 'ApplicationId', map: 'ApplicationId' },
                ],
                root: 'Applications',
                contentType: 'application/json',
                localdata: Applicationsdata

            };

        var parameterRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            if (value == true) {
                var applicationID = $("#" + gId).jqxGrid('getcellvalue', row, 'ApplicationId');
                var applicationName = $("#" + gId).jqxGrid('getcellvalue', row, 'ApplicationName');
                var applicationVersion = $("#" + gId).jqxGrid('getcellvalue', row, 'ApplicationVersion');
                var isParameterizationEnabled = $("#" + gId).jqxGrid('getcellvalue', row, 'IsParameterizationEnabled');
                if (isParameterizationEnabled == true) {
                    var html = '<div style="padding-left:5px;padding-top:7px"><a title="View Application" style="text-decoration: underline;cursor:pointer">View</a></div>';
                } else {
                    var html = '';
                }
            } else {
                return "";
            }
            return html;
        }
        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gId, true);
        }

        var dataAdapter = new $.jqx.dataAdapter(source);
        $("#" + gId).jqxGrid(
            {
                width: "100%",
                editable: true,
                source: dataAdapter,
                altRows: true,
                pageSize: 5,
                filterable: true,
                sortable: true,
                columnsResize: true,
                height: "200px",
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                showsortmenuitems: false,
                rowdetails: false,
                rowdetailstemplate: false,
                ready: function () {
                    $("#horizontalScrollBarjqxgridViewEditPackDownloadLib").css('display', 'none');

                },
                columns: [
                    {
                        text: i18n.t('app_name', { lng: lang }), filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }, dataField: 'ApplicationName', editable: false, width: 'auto'
                    },
                    {
                        text: i18n.t('app_version', { lng: lang }), filtertype: "custom", dataField: 'ApplicationVersion', editable: false, minwidth: 100,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('ParameterDefination', { lng: lang }), filtertype: "custom", datafield: 'IsParameterizationEnabled', editable: false, filterable: false, sortable: false, menu: false, minwidth: 100, cellsrenderer: parameterRenderer,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                ]
            });
        if (isFromReferenceSet == true) {
            $("#" + gId).jqxGrid('hidecolumn', "IsParameterizationEnabled");
        }

        $("#" + gId).on("cellclick", function (event) {
            var column = event.args.column;
            var rowindex = event.args.rowindex;
            var columnindex = event.args.columnindex;
            var rowData = $("#" + gId).jqxGrid('getrowdata', rowindex);
            if (columnindex == 2) {

                //$('#downloadModel').modal('show');
                koUtil.rowIdDownloadChild = rowindex;
                koUtil.gridIdDownloadChild = "#" + gId;

                koUtil.applicationIDAppChild = rowData.ApplicationId;
                koUtil.applicationNameAppChild = rowData.ApplicationName;
                koUtil.applicationVersionAppChild = rowData.ApplicationVersion;
                koUtil.isParentAppOrBundle = 1;
                openPopup('modelViewChildDownloadLibrary')
                //  var isParameterizationEnabled = $("#" + gId).jqxGrid('getcellvalue', row, 'IsParameterizationEnabled');

            }
        });
    }

    //Bundle Call
    function applicationsGrid(data, gId, isFromReferenceSet, openPopup) {
        if (data.getBundlesForPackageResp) {
            data.getBundlesForPackageResp = $.parseJSON(data.getBundlesForPackageResp);
        }
        ParentData = data.getBundlesForPackageResp.SubPackageDetails;

        var source =
            {
                datafields: [
                    { name: 'BundleName' },
                    { name: 'BundleVersion' },
                    { name: 'PackageId' }
                ],
                root: "SubPackageDetails",
                datatype: "json",
                localdata: ParentData
            };
        var ParentAdapter = new $.jqx.dataAdapter(source);
        var nestedGrids = new Array();

        // create nested grid
        var initrowdetails = function (index, parentElement, gridElement, record) {
            var id = record.uid.toString();
            var grid = $($(parentElement).children()[0]);
            var childData;
            if (data.getBundlesForPackageResp.SubPackageDetails) {
                childData = data.getBundlesForPackageResp.SubPackageDetails[index].applicationDetails;
            }

            var childsource = {
                datafields: [
                    { name: 'ApplicationId', type: 'string', map: 'ApplicationId' },
                    { name: 'ApplicationName', type: 'string', map: 'ApplicationName' },
                    { name: 'ApplicationVersion', type: 'string', map: 'ApplicationVersion' },
                    { name: 'IsParameterizationEnabled', type: 'string', map: 'IsParameterizationEnabled' }
                ],
                root: "ApplicationDetails",
                datatype: "json",
                localdata: childData
            };
            var childDataAdapter = new $.jqx.dataAdapter(childsource, { autoBind: true });
            appDetails = childDataAdapter.records;

            nestedGrids[index] = grid;
            var appDetailsbyid = [];
            for (var m = 0; m < appDetails.length; m++) {
                appDetailsbyid.push(appDetails[m]);
            }
            var childsource = {
                datafields: [
                    { name: 'ApplicationId', type: 'string' },
                    { name: 'ApplicationName', type: 'string' },
                    { name: 'ApplicationVersion', type: 'string' },
                    { name: 'IsParameterizationEnabled', type: 'string' }
                ],

                datatype: "json",
                localdata: appDetailsbyid
            }
            var nestedGridAdapter = new $.jqx.dataAdapter(childsource);
            var childAplicationrender = function (row, columnfield, value, defaulthtml, columnproperties) {
                var applicationID = $(grid).jqxGrid('getcellvalue', row, 'ApplicationId');
                var applicationName = $(grid).jqxGrid('getcellvalue', row, 'ApplicationName');
                var applicationVersion = $(grid).jqxGrid('getcellvalue', row, 'ApplicationVersion');
                var isParameterizationEnabled = $(grid).jqxGrid('getcellvalue', row, 'IsParameterizationEnabled');
                if (isParameterizationEnabled == true) {
                    var html = '<div style = "padding-left:5px;padding-top:7px" > <a title="View Application" style="text-decoration: underline;cursor:pointer">View</a></div>';
                } else {
                    var html = '';
                }
                return html;
            }
            //Custom filter
            var buildFilterPanelNestedGrid = function (filterPanel, datafield) {
                wildfilterForApplicationView(filterPanel, datafield, nestedGridAdapter, grid);
            }

            if (grid != null) {

                grid.jqxGrid({
                    source: nestedGridAdapter, width: 600, height: 100, sortable: true, filterable: true, autoshowcolumnsmenubutton: false, showsortmenuitems: false, enabletooltips: true,
                    columns: [
                        {
                            text: i18n.t('app_name', { lng: lang }), datafield: 'ApplicationName', width:'auto', editable: false, enabletooltips: true,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelNestedGrid(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('app_version', { lng: lang }), datafield: 'ApplicationVersion', width:'auto', editable: false, enabletooltips: true,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelNestedGrid(filterPanel, datafield);
                            }
                        },
                        { text: i18n.t('parameter_definition', { lng: lang }), datafield: 'IsParameterizationEnabled', width:'auto', menu: false, editable: false, filterable: false, sortable: false, enabletooltips: false, cellsrenderer: childAplicationrender }
                    ]
                });
                if (isFromReferenceSet == true) {
                    $(grid).jqxGrid('hidecolumn', "IsParameterizationEnabled");
                }

                appViewNestedGrid = grid;
                $(grid).on("cellclick", function (event) {
                    koUtil.isParentAppOrBundle = 1;
                    var column = event.args.column;
                    var rowindex = event.args.rowindex;
                    var columnindex = event.args.columnindex;
                    var rowData = $(grid).jqxGrid('getrowdata', rowindex);
                    if (columnindex == 2) {

                        //$('#downloadModel').modal('show');
                        if (event.args.value == true) {

                            koUtil.applicationIDAppChild = rowData.ApplicationId;
                            koUtil.applicationNameAppChild = rowData.ApplicationName;
                            koUtil.applicationVersionAppChild = rowData.ApplicationVersion;

                            openPopup('modelViewChildDownloadLibrary');
                        }
                    }
                });

                $("#" + gId).on("cellclick", function (event) {
                    // koUtil.isParentAppOrBundle = 0;
                    var column = event.args.column;
                    var rowindex = event.args.rowindex;
                    var columnindex = event.args.columnindex;
                    var rowData = $(grid).jqxGrid('getrowdata', rowindex);
                    if (columnindex == 2) {

                        if (event.args.column.datafield == "BundleVersion") {

                        } else {
                            var modelname = 'unloadTemplate';
                            loadelement(modelname, 'genericPopup');

                            //$('#downloadModel').modal('show');
                            koUtil.rowIdDownloadChild = rowindex;
                            koUtil.gridIdDownloadChild = "#" + gId;

                            koUtil.applicationIDAppChild = rowData.ApplicationId;
                            koUtil.applicationNameAppChild = rowData.ApplicationName;
                            koUtil.applicationVersionAppChild = rowData.ApplicationVersion;
                            openPopup('modelViewChildDownloadLibrary');
                        }
                    }
                });
            }
        }

        var bundelRenderer = function (row, column, value) {
            return '<div style="float:left"><span style="margin-left: 4px; margin-top: 9px; float: left;">' + value + '</span></div><div class="btn-mg" style="float:right"><a class="btn" onclick="clearAppViewGrid()"  role="button"  title="Reset"><i class="icon-reset-filter"></i></a></div>';
        }

        var renderer = function (row, column, value) {
            return '<div style="float:left"><span style="margin-left: 4px; margin-top: 9px; float: left;">' + value + '</span></div>';
        }

        //Custom filter
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, source, gId);
        }
        $(" #gridmenu" + gId + " ul li:first").css("display", "none")
        $(" #gridmenugridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
        $(" #gridmenugridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
        $(" #gridmenugridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
        $(" #gridmenugridmenu" + gId + "").css("background-color", "transparent");


        // creage jqxgrid
        $("#" + gId).jqxGrid(
            {
                width: "100%",
                autoheight: true,
                source: source,
                rowdetails: true,
                enabletooltips: true,
                selectionmode: 'none',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                sortable: true,
                initrowdetails: initrowdetails,
                rowdetailstemplate: { rowdetails: "<div id='grid' ></div>", rowdetailsheight: 150, rowdetailshidden: true },
                ready: function () {
                    $("#" + gId).jqxGrid('showrowdetails', 0);                    
                },
                columns: [
                    {
                        text: i18n.t('bundle_name', { lng: lang }), datafield: 'BundleName', minwidth: 250, sortable: false, editable: false, filterable: false, menu: false, cellsrenderer: bundelRenderer
                    },
                    {
                        text: i18n.t('bundle_version', { lng: lang }), datafield: 'BundleVersion', minwidth: 100, sortable: false, editable: false, filterable: false, menu: false, cellsrenderer: renderer,
                    }
                ]
            });
    }
});
