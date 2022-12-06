isViewEnable = false;
define(["knockout", "koUtil", "autho", "knockout.mapping", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho, koMapping) {

    columnSortFilter = new Object();
    packageNameApplication = "";
    var lang = getSysLang();
    koUtil.GlobalColumnFilter = new Array();
    var sourceFolder = new Object();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function downloadLibararyappViewModel() {

        var self = this;
        self.checksample = ko.observable();
        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['PackageName', 'FileType', 'PackageMode'];
        self.columnlist = ko.observableArray();
        self.treeColl = ko.observableArray();
        self.folders = ko.observableArray();
        self.folderValue = ko.observable("");
        var folderIds = new Array();
        var foldersFilterArray = new Array();
        var destinationFolder = new Object;
        var packagesArray = new Array();

        setMenuSelection();

        self.clearfilter = function (gId) {
            gridFilterClear(gId);
            globalSelectedFolderPackages = [];
        }
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }

        self.deletePackage = function (popupName, gridId) {
            self.openPopup(popupName, gridId);
        }

        $('#btnRefresh').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnRefresh').click();
            }
        });

        $('#btnAddPackage').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnAddPackage').click();
            }
        });

        $('#btnEditPackage').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnEditPackage').click();
            }
        });

        $('#btnDeletePackage').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnDeletePackage').click();
            }
        });

        $('#btnScheduleFile').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnScheduleFile').click();
            }
        });

        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#infoAllDeleted').on('shown.bs.modal', function (e) {
            $('#infoAllDeleted_No').focus();

        });
        $('#infoAllDeleted').keydown(function (e) {
            if ($('#infoAllDeleted_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#infoAllDeleted_Yes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------

        //draggable
        $('#applnViewHeader').mouseup(function () {
            $("#mdlApplication").draggable({ disabled: true });
        });

        $('#applnViewHeader').mousedown(function () {
            $("#mdlApplication").draggable({ disabled: false });
        });

        //
        checkRightsForSchedule();

        function checkRightsForSchedule() {
            var retval = autho.checkRightsBYScreen('Download Library', 'IsviewAllowed');
            var retvalFOrSchedule = autho.checkRightsBYScreen('Download Schedule', 'IsModifyAllowed');
            var retvalForDevice = autho.checkRightsBYScreen('Devices', 'IsviewAllowed');
            if (retval == true && retvalFOrSchedule == true && retvalForDevice == true) {
                $('#btnScheduleFile').prop('disabled', false);
            } else {
                $('#btnScheduleFile').prop('disabled', true);
            }
        }
        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        //view link rights
        viewRights();
        function viewRights() {
            var retvalForDlbView = autho.checkRightsBYScreen('Download Library', 'IsviewAllowed');
            var retvalForDeviceView = autho.checkRightsBYScreen('Devices', 'IsviewAllowed');
            if (retvalForDlbView == true && retvalForDeviceView == true) {
                isViewEnable = true;
            }
        }

        //clear filter of application
        self.clearfilterApplication = function (gridId) {
            clearUiGridFilter(gridId);
            $('#' + gridId).jqxGrid('clearselection');
        }

        //export application 
        self.exportToExcelApplication = function (gridId) {
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

        self.schedulePackage = function (gId) {
            sessionStorage.removeItem("CustomSearchText");
            sessionStorage.removeItem("customSearchStore");
            koUtil.isFromScheduleDownloadsScreen = 0;
            var selecteItemIds = getSelectedUniqueId(gId);
            var count = parseInt(maximumSchedulesPerJob);
            var selectedCount = parseInt($("#jqxgridDownloadlibseleceteRowSpan").text());

            if (selecteItemIds.length == 0) {
                openAlertpopup(1, 'select_the_packages');
                $("#draggScheduleID").draggable();
                return;
            }
            else if (selectedCount > count) {
                openAlertpopup(1, i18n.t('maximum_of_3_package_can_be_selected_for_schedule_global', { count: count }, { lng: lang }));
            }
            else {
                getDevicesForPackage(gId, folderIds);
            }
        }

        function loadelement(elementname, controllerId) {

            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));

                if (visibleColumnsList.length == 0) {
                    var columns = self.columnlist();
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                }
                loadelement(popupName, 'genericPopup');
                $('#downloadModel').modal('show');
            } else if (popupName == "modelEditpackage") {
                $('#btn_editPackage').prop('disabled', true);
                var selecteItemIds = getSelectedUniqueId(gId);
                var checkAll = checkAllSelected(gId);
                var unSelecteItemIds = getUnSelectedUniqueId(gId);
                var datacount = getTotalRowcount(gId);
                if (checkAll == 1) {
                    if (unSelecteItemIds.length == datacount - 1) {
                        loadelement(popupName, 'downloadLibrary');
                        $('#downloadModel').modal('show');
                        editButtonClick(gId);
                    }
                    else {
                        openAlertpopup(1, 'select_single_file_device');
                        return;
                    }
                } else {
                    if (selecteItemIds.length == 1) {
                        loadelement(popupName, 'downloadLibrary');
                        $('#downloadModel').modal('show');
                        editButtonClick(gId);
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'select_the_packages');
                        return;
                    } else if (selecteItemIds.length > 1) {
                        openAlertpopup(1, 'select_single_file_device');
                        return;
                    }
                }
            } else if (popupName == "modelAddpackage") {
                var folderSource = new Array();
                folderSource.push(sourceFolder);
                globalVariableForEditPackage = folderSource;
                isAddButtonEnabled = false;
                loadelement(popupName, 'downloadLibrary');
                $('#downloadModel').modal('show');
            } else if (popupName == "modelDeleteDownloadLibrary") {
                var selecteItemIds = getSelectedUniqueId(gId);
                var deleteCount = getAllSelectedDataCount(gId);
                var checkAll = checkAllSelected(gId);
                if (checkAll == 1) {
                    if (deleteCount < 1) {
                        openAlertpopup(1, 'select_the_packages');
                    } else {
                        loadelement(popupName, 'downloadLibrary');
                        $('#downloadModel').modal('show');
                        deleteButtonClick(gId, 1);
                    }
                } else {
                    if (selecteItemIds.length >= 1) {
                        loadelement(popupName, 'downloadLibrary');
                        $('#downloadModel').modal('show');
                        deleteButtonClick(gId, 1);
                    } else {
                        openAlertpopup(1, 'select_the_packages');
                        $("#draggDeleteID").draggable();
                        return;
                    }
                }
            } else if (popupName == "modelViewParentDownloadLibrary") {
                loadelement(popupName, 'genericPopup');
                $('#downloadModel').modal('show');
            } else if (popupName == "modelViewConflictDetails") {
                loadelement(popupName, 'genericPopup');
                $('#downloadModel').modal('show');
            } else if (popupName == "modelAddFolder") {
                $("#folderDiv").modal('show');
                $("#folderModalLabel").text(i18n.t('add_folder', { lng: lang }));
                $("#btnFolderSave").addClass('hide');
                $("#btnFolderAdd").removeClass('hide');
                $("#btnFolderAdd").prop('disabled', true);
                $("#txtFolderName").val('');
                $("#folderErrorTip").hide();
                $("#characters").addClass('hide');
                $("#characters").text('');
            } else if (popupName == "modelEditFolder") {
                if (sourceFolder.FolderName == "Root") {
                    openAlertpopup(1, 'cannot_edit_root_folder');
                    return;
                } else if (sourceFolder.FolderId == 0) {
                    openAlertpopup(1, 'cannot_edit_all_folders');
                    return;
                }
                $("#folderDiv").modal('show');
                $("#folderModalLabel").text(i18n.t('edit_folder', { lng: lang }));
                $("#btnFolderAdd").addClass('hide');
                $("#btnFolderSave").removeClass('hide');
                $("#btnFolderSave").prop('disabled', true);
                $("#txtFolderName").val(sourceFolder.FolderName);
                $("#folderErrorTip").hide();
                $("#characters").addClass('hide');
                $("#characters").text('');
            } else if (popupName == "modelDeleteFolder") {
                if (sourceFolder.FolderName == "Root") {
                    openAlertpopup(1, 'cannot_delete_root_folder');
                    return;
                } else if (sourceFolder.FolderId == 0) {
                    openAlertpopup(1, 'cannot_delete_all_folders');
                    return;
                }
                var message = i18n.t('delete_folder_confirmation', { foldername: sourceFolder.FolderName }, { lng: lang });
                $("#deleteFolderConfirmationMsg").text(message);
                $("#deleteFolderConfirmationDiv").modal('show');
            } else if (popupName === "modelAddReference") {
                var selectedItemsData = getMultiSelectedData(gId);
                if (!_.isEmpty(selectedItemsData) && selectedItemsData.length > 0) {
                    globalSelectedFolderPackages = selectedItemsData;
                    isReferenceSetFromDownloadLibrary = true;
                    loadelement(popupName, 'referenceSets');
                    $('#downloadModel').modal('show');
                } else {
                    openAlertpopup(1, 'select_the_packages');
                }
            }
        }
        modelReposition();
        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
            $('#downloadModel').modal('hide');
            checkIsPopUpOPen();
        }

        self.closeFolderModal = function () {
            $("#folderDiv").modal('hide');
            $("#txtFolderName").text = '';
        }

        self.exportToExcel = function (isExport, gId, exportflage) {
            var selectedDownloadLibraryItems = getSelectedUniqueId(gId);
            var unselectedDownloadLibraryItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getDownloadParameters(true, columnSortFilter, selectedDownloadLibraryItems, unselectedDownloadLibraryItems, checkAll, visibleColumnsList, folderIds);

            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                downloadLibraryExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function downloadLibraryExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetPackages';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }


        //Edit button click
        function editButtonClick(gID) {
            var selectedItem = getMultiSelectedData(gID);
            var selectedarr = new Array();
            if (selectedItem && selectedItem.length > 0) {
                var editPackage = new Object();
                editPackage.selectedFileName = selectedItem[0].FileName;
                editPackage.selectedPackageName = selectedItem[0].PackageName;
                editPackage.selectedFileVersion = selectedItem[0].FileVersion;
                editPackage.selectedTags = selectedItem[0].Tags;
                editPackage.selectedSupportedModels = selectedItem[0].SupportedModels;
                editPackage.selectedPostinstallAction = selectedItem[0].PostInstallAction;
                editPackage.InstallDelay = selectedItem[0].InstallDelay;
                editPackage.selectedFIleType = selectedItem[0].FileType;
                editPackage.selectedFileSizeInMB = selectedItem[0].FileSizeInMB;
                editPackage.selectedPackageMode = selectedItem[0].PackageMode;
                editPackage.selectedFileUploadDate = selectedItem[0].FileUploadDate;
                editPackage.selectedEnabledForAutomation = selectedItem[0].IsEnabledForAutomation;
                editPackage.selectedPackageId = selectedItem[0].PackageId;
                editPackage.selectedSupportedModelFamily = selectedItem[0].SupportedModelFamily;
                editPackage.selectedComponent = selectedItem[0].Component;
                editPackage.IsModelEditAllowed = selectedItem[0].IsModelEditAllowed;
                editPackage.FolderId = selectedItem[0].FolderId;
				editPackage.FolderName = selectedItem[0].FolderName;
				editPackage.IsMasterPackage = selectedItem[0].IsMasterPackage;
				editPackage.ReferenceSets = selectedItem[0].ReferenceSets;
                selectedarr.push(editPackage);
                globalVariableForEditPackage = selectedarr;
                globalVariableForEditPackage.gID = gID;
            }
        }

        function deleteButtonClick(gID, check) {
            var selectedItemIds = getSelectedUniqueId(gID);
            var selectedItemsData = getMultiSelectedData(gID);
            var unSelectedItemIds = getUnSelectedUniqueId(gID);
            var checkAll = checkAllSelected(gID);
            var selectedarr = new Array();
            var editPackage = new Object();
            var selectedPackageFolderIds = new Array();
            var unSelectedPackageFolderIds = new Array();
            for (var i = 0; i < selectedItemsData.length; i++) {
                var itemId = selectedItemsData[i].PackageFolderId;
                if ($.inArray(itemId, selectedPackageFolderIds) < 0) {
                    selectedPackageFolderIds.push(itemId);
                }
            }

            if (checkAll == 1) {
                for (var j = 0; j < unSelectedItemIds.length; j++) {
                    var unSelectedPackage = _.where(packagesArray, { PackageId: unSelectedItemIds[j] });
                    var itemId = unSelectedPackage[0].PackageFolder.PackageFolderId;
                    if ($.inArray(itemId, unSelectedPackageFolderIds) < 0) {
                        unSelectedPackageFolderIds.push(itemId);
                    }
                }
                editPackage.selectedRowID = null;
                editPackage.unSelecedRowID = unSelectedPackageFolderIds;
                editPackage.selectedData = selectedItemsData;
                editPackage.folderIds = folderIds;
                editPackage.packageName = (!_.isEmpty(selectedItemsData) && selectedItemsData.length === 1) ? selectedItemsData[0].PackageName : '';
            } else {
                if (!_.isEmpty(selectedItemIds) && selectedItemIds.length === 1) {
                    var selectedsource = _.where(selectedItemsData, { PackageId: selectedItemIds[0] });
                    editPackage.packageName = !_.isEmpty(selectedItemIds) ? selectedsource[0].PackageName : '';
                    editPackage.selectedRowID = selectedPackageFolderIds;
                    editPackage.unSelecedRowID = null;
                    editPackage.folderIds = null;
                } else {
                    editPackage.packageName = '';
                    editPackage.selectedRowID = selectedPackageFolderIds;
                    editPackage.unSelecedRowID = null;
                    editPackage.folderIds = null;
                }
            }

            editPackage.checkAll = checkAll;
            selectedarr.push(editPackage);
            globalVariableForEditPackage = selectedarr;
        }

        // package is associated to device. Hence, cannot be deleted
        self.deleteAllLibrary = function (gId) {
            var selecteItemIds = getSelectedUniqueId(gId);
            var unSelectedIds = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            var selecteDeleteIds;
            var unSelectedDeleteIds;

            if (checkAll == 1) {
                selecteDeleteIds = null;
                unSelectedDeleteIds = unSelectedIds;
            }
            else {
                selecteDeleteIds = selecteItemIds;
                unSelectedDeleteIds = null;
            }
            deletePackage(gId, selecteDeleteIds, unSelectedDeleteIds, folderIds)
        }


        self.folderValue.subscribe(function (newValue) {
            if (self.folderValue().trim() != '') {
                if ($("#btnFolderAdd").is(':visible')) {
                    $("#btnFolderAdd").removeAttr('disabled');
                } else {
                    $("#btnFolderSave").removeAttr('disabled');
                }
            } else {
                if ($("#btnFolderAdd").is(':visible')) {
                    $("#btnFolderAdd").prop('disabled', true);
                } else {
                    $("#btnFolderSave").prop('disabled', true);
                }
            }
        })

        self.validateFolderName = function (data) {
            if (!_.isEmpty($("#txtFolderName").val())) {
                if (!validateFolderName($("#txtFolderName").val())) {
                    $("#folderErrorTip").show();
                    $("#characters").removeClass('hide');
                    $("#characters").text('Following characters are not allowed. \\ : * ? "<>\/|');
                } else {
                    $("#folderErrorTip").hide();
                    $("#characters").addClass('hide');
                    $("#characters").text('');
                }
            } else {
                $("#folderErrorTip").hide();
                $("#characters").addClass('hide');
                $("#characters").text('');
            }
        }

        self.AddSaveFolder = function (gId) {
            var folderName = $("#txtFolderName").val().trim();
            if (!validateFolderName(folderName)) {
                return;
            }
            if (folderName.toUpperCase() == i18n.t('root_folder', { lng: lang })) {
                openAlertpopup(1, 'folder_name_exists');
                return;
            }
            if ($("#btnFolderAdd").is(':visible')) {
                saveFolder(gId, 0, folderName, 1);
            } else {
                saveFolder(gId, sourceFolder.FolderId, folderName, 2);
            }
        }

        function saveFolder(gId, folderId, folderName, type) {
            $("#loadingDiv").show();
            var folderObject = new Object();
            if (folderId > 0) {
                folderObject.FolderId = folderId;
            }
            folderObject.FolderName = folderName;

            var callBackfunction = function (data, error) {
                $("#loadingDiv").hide();
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        $("#folderDiv").modal('hide');
                        if (type == 1) {
                            openAlertpopup(0, 'folder_created_successfully');
                        } else {
                            openAlertpopup(0, 'folder_saved_successfully');
                            sourceFolder.FolderName = folderName;
                        }
                        getFolders(gId, self.treeColl, self.folders, 1);
                    } else if (data.responseStatus.StatusCode == AppConstants.get('FOLDER_NAME_EXISTS')) {
                        openAlertpopup(1, 'folder_name_exists');
                    }
                }
            }

            if (type == 1) {
                var method = 'AddFolder';
                var params = '{"token":"' + TOKEN() + '", "addFolderReq": ' + JSON.stringify(folderObject) + '}';
            } else {
                var method = 'SetFolder';
                var params = '{"token":"' + TOKEN() + '", "setFolderReq": ' + JSON.stringify(folderObject) + '}';
            }
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        self.deleteFolder = function (gId) {
            $("#loadingDiv").show();
            $("#deleteFolderConfirmationDiv").modal('hide');
            var deleteFolderReq = new Object();
            var deleteFolderIds = new Array();
            deleteFolderIds.push(sourceFolder.FolderId);
            deleteFolderReq.FolderIds = deleteFolderIds;

            var callBackfunction = function (data, error) {
                $("#loadingDiv").hide();
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(0, 'folder_deleted_successfully');
                        getFolders(gId, self.treeColl, self.folders, 2);
                    }
                }
            }

            var method = 'DeleteFolders';
            var params = '{"token":"' + TOKEN() + '", "deleteFolderReq": ' + JSON.stringify(deleteFolderReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        self.selectSourceFolder = function (selectedFolder, gId) {
            var previousSelectedFolderId = sourceFolder.FolderId;
            if (selectedFolder.FolderId() != sourceFolder.FolderId) {
                $('.treeviewactive').removeClass('treeviewactive');
                $("#" + selectedFolder.FolderId() + "Div").addClass('treeviewactive');
                $("#" + sourceFolder.FolderId + "icon").removeClass('icon-folder-open');
                $("#" + sourceFolder.FolderId + "icon").addClass('icon-folder');
                $("#" + selectedFolder.FolderId() + "icon").removeClass('icon-folder');
                $("#" + selectedFolder.FolderId() + "icon").addClass('icon-folder-open');

                sourceFolder.FolderId = selectedFolder.FolderId();
                sourceFolder.FolderName = selectedFolder.FolderName();
                folderIds = new Array();
                folderIds.push(sourceFolder.FolderId);
                if (sourceFolder.FolderId == 0 || previousSelectedFolderId == 0) {
                    reCreateGrid(gId);
                } else {
                    gridFilterClear(gId);
                }

                getDestinationFolders(sourceFolder.FolderId, globalFoldersArray, self.folders);
            }
        }

        self.selectDestinationFolder = function (self, gId) {
            if (!_.isEmpty(destinationFolder) && self.FolderId == destinationFolder.FolderId) {
                return;
            }

            $("#" + destinationFolder.FolderId + "moveDiv").removeClass('treeviewactive');
            $("#" + self.FolderId + "moveDiv").addClass('treeviewactive');
            $("#" + destinationFolder.FolderId + "moveicon").removeClass('icon-folder-open');
            $("#" + destinationFolder.FolderId + "moveicon").addClass('icon-folder');
            $("#" + self.FolderId + "moveicon").removeClass('icon-folder');
            $("#" + self.FolderId + "moveicon").addClass('icon-folder-open');

            destinationFolder.FolderId = self.FolderId;
            destinationFolder.FolderName = self.FolderName;
            $("#btnMoveFolder").removeAttr('disabled');
        }

        self.movePackageConfirmation = function () {
            var selecteItemIds = getSelectedUniqueId('jqxgridDownloadlib');
            var datacount = getAllSelectedDataCount('jqxgridDownloadlib');
            var checkAll = checkAllSelected('jqxgridDownloadlib');
            if (checkAll == 1) {
                if (datacount < 1) {
                    openAlertpopup(1, 'select_the_packages');
                    return;
                }
            } else {
                if (selecteItemIds.length < 1) {
                    openAlertpopup(1, 'select_the_packages');
                    return;
                }
            }

            $("#" + destinationFolder.FolderId + "moveDiv").removeClass('treeviewactive');
            $("#" + destinationFolder.FolderId + "moveicon").removeClass('icon-folder-open');
            $("#" + destinationFolder.FolderId + "moveicon").addClass('icon-folder');
            $("#movePackageDiv").addClass('hide');
            var message = i18n.t('move_package_confirmation', { foldername: destinationFolder.FolderName }, { lng: lang });
            $("#movePackageConfirmationMsg").text(message);
            $("#movePackagesConfirmationDiv").modal('show');
        }

        self.cancelMovePackage = function () {
            if (!_.isEmpty(destinationFolder)) {
                $("#" + destinationFolder.FolderId + "moveDiv").removeClass('treeviewactive');
                $("#" + destinationFolder.FolderId + "moveicon").removeClass('icon-folder-open');
                $("#" + destinationFolder.FolderId + "moveicon").addClass('icon-folder');
            }
            $("#movePackageDiv").addClass('hide');
        }

        self.showFoldersListToMove = function (gId) {
            var selecteItemIds = getSelectedUniqueId(gId);
            var datacount = getAllSelectedDataCount(gId);
            var checkAll = checkAllSelected(gId);
            if (checkAll == 1) {
                if (datacount >= 1) {
                    if ($("#movePackageDiv").hasClass('hide')) {
                        destinationFolder = new Object;
                        $("#movePackageDiv").removeClass('hide');
                        $("#btnCancelMoveFolder").focus();
                        $("#btnMoveFolder").prop('disabled', true);
                    } else {
                        self.cancelMovePackage();
                    }
                } else {
                    openAlertpopup(1, 'select_the_packages');
                }
            } else {
                if (selecteItemIds.length >= 1) {
                    if ($("#movePackageDiv").hasClass('hide')) {
                        destinationFolder = new Object;
                        $("#movePackageDiv").removeClass('hide');
                        $("#btnCancelMoveFolder").focus();
                        $("#btnMoveFolder").prop('disabled', true);
                    } else {
                        self.cancelMovePackage();
                    }
                } else {
                    openAlertpopup(1, 'select_the_packages');
                    return;
                }
            }
        }

        Array.prototype.distinct = function (folderIds) {
            selectedFolders = new Array();
            for (var i = 0; i < folderIds.length; i++) {
                if (selectedFolders.indexOf(folderIds[i]) < 0) {
                    selectedFolders.push(folderIds[i]);
                }
            }
            return selectedFolders;
        };

        self.movePackage = function (gId) {
            $("#loadingDiv").show();
            $("#movePackagesConfirmationDiv").modal('hide');
            var selectedItemIds = getSelectedUniqueId(gId);
            var selectedItemsData = getMultiSelectedData(gId);
            var unSelectedItemIds = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            var selectedPackageFolderIds = new Array();
            var unSelectedPackageFolderIds = new Array();
            var selectedData = getMultiSelectedData(gId);
            var selectedFolderIds = new Array();
            if (selectedData && selectedData.length > 0) {
                for (var i = 0; i < selectedData.length; i++) {
                    selectedFolderIds.push(selectedData[i].FolderId);
                }
            }
            selectedFolderIds = selectedFolderIds.distinct(selectedFolderIds);

            if (checkAll == 1) {
                selectedPackageFolderIds = [];
                for (var j = 0; j < unSelectedItemIds.length; j++) {
                    var unSelectedPackage = _.where(packagesArray, { PackageId: unSelectedItemIds[j] });
                    var itemId = unSelectedPackage[0].PackageFolder.PackageFolderId;
                    if ($.inArray(itemId, unSelectedPackageFolderIds) < 0) {
                        unSelectedPackageFolderIds.push(itemId);
                    }
                }
            } else {
                for (var i = 0; i < selectedItemsData.length; i++) {
                    var itemId = selectedItemsData[i].PackageFolderId;
                    if ($.inArray(itemId, selectedPackageFolderIds) < 0) {
                        selectedPackageFolderIds.push(itemId);
                    }
                }
            }

            var setPackageFolderReq = new Object();
            var Selector = new Object();
            Selector.SelectedItemIds = selectedPackageFolderIds;
            Selector.UnSelectedItemIds = unSelectedPackageFolderIds;

            setPackageFolderReq.Selector = Selector;
            setPackageFolderReq.SourceFolderIds = selectedFolderIds;
            setPackageFolderReq.DestinationFolderId = destinationFolder.FolderId;
            setPackageFolderReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

            var callBackfunction = function (data, error) {
                $("#loadingDiv").hide();
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        $("#folderDiv").modal('hide');
                        var message = i18n.t('packages_moved_successfully', { foldername: destinationFolder.FolderName }, { lng: lang });
                        openAlertpopup(0, message);
                        gridRefreshClearSelection(gId, self.treeColl, 1);
                    }
                }
            }

            var method = 'SetPackageFolder';
            var params = '{"token":"' + TOKEN() + '", "setPackageFolderReq": ' + JSON.stringify(setPackageFolderReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        function getDestinationFolders(folderId, globalFoldersArray, folders) {
            //destination folders collection apart from the source folder
            if (folderId > 0) {
                var unSelectedFolders = globalFoldersArray;
                var sourceData = _.where(globalFoldersArray, { FolderId: folderId });
                if (sourceData && sourceData.length > 0) {
                    unSelectedFolders = jQuery.grep(unSelectedFolders, function (value) {
                        var index = unSelectedFolders.indexOf(sourceData[0]);
                        return (value != unSelectedFolders[index] && value != null)
                    });
                }
                self.folders(unSelectedFolders);
            } else {
                self.folders(globalFoldersArray);
            }
        }

        setScreenControls(AppConstants.get('DOWNLOAD_LIBRARY'));
        getFolders('jqxgridDownloadlib', self.treeColl, self.folders, 0);
        function getFolders(gId, treeColl, folders, type) {

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.getFoldersResp) {
                            data.getFoldersResp = $.parseJSON(data.getFoldersResp);
                            var object = new Object();
                            object.Level = -1;
                            object.FolderId = 0;
                            object.FolderName = "All Folders";
                            object.children = [];
                            var treeObject = new Object();
                            var temptreeColl = new Array();
                            temptreeColl.push(object);
                            folders(data.getFoldersResp.Folders);				//list of folders for package mapping
                            globalFoldersArray = data.getFoldersResp.Folders;	//list of folders for Add/Edit Package popup							

                            foldersFilterArray = new Array();
                            if (data.getFoldersResp.Folders && data.getFoldersResp.Folders.length > 0) {
                                for (var i = 0; i < data.getFoldersResp.Folders.length; i++) {
                                    treeObject = new Object();
                                    treeObject = data.getFoldersResp.Folders[i];
                                    treeObject.Level = 0;
                                    treeObject.children = [];
                                    temptreeColl.push(treeObject);

                                    var folderObject = new Object();
                                    folderObject.Id = data.getFoldersResp.Folders[i].FolderId;
                                    folderObject.Name = "Folder Name";
                                    folderObject.ControlValue = data.getFoldersResp.Folders[i].FolderName;
                                    folderObject.Value = data.getFoldersResp.Folders[i].FolderName;
                                    foldersFilterArray.push(folderObject);
                                }
                                globalFoldersFilterArray = foldersFilterArray;		//list of folders for multi choice filter
                            }

                            var source = BuildTreeStructure(temptreeColl);
                            var root = new TreeNode(source[0]);
                            treeColl(root);										//list of folders to select to get packages

                            if (type == 0) {		//on load
                                if (_.isEmpty(sourceFolder)) {
                                    sourceFolder.FolderId = globalFoldersArray[0].FolderId;
                                    sourceFolder.FolderName = globalFoldersArray[0].FolderName;
                                }
                                $("#" + sourceFolder.FolderId + "Div").addClass('treeviewactive');
                                $("#" + sourceFolder.FolderId + "icon").addClass('icon-folder-open');
                                folderIds.push(sourceFolder.FolderId);

                                getDestinationFolders(sourceFolder.FolderId, globalFoldersArray, folders);

                                var param = getDownloadParameters(false, columnSortFilter, null, null, 0, [], folderIds);
                                downloadLibraryGrid(gId, param, self.openPopup, sourceFolder.FolderId);

                            } else if (type == 1) {	//after add/save
                                $("#" + sourceFolder.FolderId + "Div").addClass('treeviewactive');
                                $("#" + sourceFolder.FolderId + "icon").addClass('icon-folder-open');
                                gridRefresh(gId);
                            } else {				//after delete
                                sourceFolder.FolderId = globalFoldersArray[0].FolderId;
                                sourceFolder.FolderName = globalFoldersArray[0].FolderName;
                                $("#" + sourceFolder.FolderId + "Div").addClass('treeviewactive');
                                $("#" + sourceFolder.FolderId + "icon").addClass('icon-folder-open');
                                folderIds = new Array();
                                folderIds.push(sourceFolder.FolderId);

                                reCreateGrid(gId);
                            }
                        }
                    }
                }
            }

            var method = 'GetFolders';
            var params = '{"token":"' + TOKEN() + '"}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        function BuildTreeStructure(array, parent, tree) {

            tree = typeof tree !== 'undefined' ? tree : [];
            parent = typeof parent !== 'undefined' ? parent : {
                FolderId: -1
            };

            var children = _.filter(array, function (child) {
                return child.Level == parent.FolderId;
            });

            if (!_.isEmpty(children)) {
                if (parent.FolderId == -1) {
                    tree = children;
                } else {
                    parent['children'] = children
                }
                _.each(children, function (child) { BuildTreeStructure(array, child) });
            }

            return tree;
        }

        function TreeNode(values) {
            var self = this;
            koMapping.fromJS(values, {
                children: {
                    create: createNode
                }
            }, this);
            this.expanded = ko.observable(true);
            this.collapsed = ko.computed(function () {
                return !self.expanded();
            })
        }

        function createNode(options) {
            return new TreeNode(options.data);
        }

        var panelHeight = gridHeightFunction('jqxgridDownloadlib', "60");
        if (window.innerWidth >= 1800) {
            $('#screenSplitter').jqxSplitter({ width: '99.9%', height: panelHeight + 120, panels: [{ size: '15%', max: '30%', min: '15%' }, { size: '85%', min: '70%' }] });
        } else if (window.innerWidth < 1799 && window.innerWidth >= 1440) {
            $('#screenSplitter').jqxSplitter({ width: '99.9%', height: panelHeight + 120, panels: [{ size: '20%', max: '30%', min: '20%' }, { size: '80%', min: '70%' }] });
        } else {
            $('#screenSplitter').jqxSplitter({ width: '99.9%', height: panelHeight + 120, panels: [{ size: '25%', max: '35%', min: '25%' }, { size: '75%', min: '65%' }] });
        }


        //reconstruct the grid to get all folders in Folder Name filter list
        function reCreateGrid(gId) {
            $('#downloadLibraryGridDiv').empty();
            $('#downloadLibraryGridDiv').html('<div id="jqxgridDownloadlib"></div><div id="pagerDivDownloadlib"></div>');

            globalSelectedFolderPackages = [];
            var gridStorageArr = new Array();
            var gridStorageObj = new Object();
            gridStorageObj.checkAllFlag = 0;
            gridStorageObj.counter = 0;
            gridStorageObj.filterflage = 0;
            gridStorageObj.selectedDataArr = [];
            gridStorageObj.unSelectedDataArr = [];
            gridStorageObj.singlerowData = [];
            gridStorageObj.multiRowData = [];
            gridStorageObj.TotalSelectionCount = null;
            gridStorageObj.highlightedRow = null;
            gridStorageObj.highlightedPage = null;

            gridStorageArr.push(gridStorageObj);
            var gridStorage = JSON.stringify(gridStorageArr);
            window.sessionStorage.setItem(gId + 'gridStorage', gridStorage);

            var param = getDownloadParameters(false, columnSortFilter, null, null, 0, [], folderIds);
            downloadLibraryGrid(gId, param, self.openPopup, folderIds[0]);
        }

        function downloadLibraryGrid(gID, param, openPopup, folderId) {

            var InitGridStoragObj = initGridStorageObj(gID);
            var gridStorage = InitGridStoragObj.gridStorage;
            var adStorage = InitGridStoragObj.adStorage;

            var gridheight = $(window).height();
            var percentValue;
            if (gridheight > 600) {
                percentValue = (20 / 100) * gridheight;
                gridheight = gridheight - 150;
                gridheight = gridheight - percentValue + 'px';
            } else {
                gridheight = '400px';
            }

            var source =
                {
                    dataType: "json",
                    dataFields: [
                        { name: 'isSelected', type: 'number' },
                        { name: 'PackageName', map: 'PackageName' },
                        { name: 'SupportedModels', map: 'SupportedModels' },
                        { name: 'FileName', map: 'FileName' },
                        { name: 'FileSizeInMB', map: 'FileSizeInMB' },
                        { name: 'FileType', map: 'FileType' },
                        { name: 'FileVersion', map: 'FileVersion' },
                        { name: 'PackageTypeString', map: 'PackageTypeString' },
						{ name: 'PostInstallAction', map: 'PostInstallAction' },
						{ name: 'InstallDelay', map: 'InstallDelay'},
                        { name: 'Tags', map: 'Tags' },
                        { name: 'IsEnabledForAutomation', map: 'IsEnabledForAutomation' },
                        { name: 'userName', map: 'userName' },
                        { name: 'FileUploadDate', map: 'FileUploadDate', type: 'date' },
                        { name: 'PackageMode', map: 'PackageMode' },
                        { name: 'PackageId', map: 'PackageId' },
                        { name: 'FullName', map: 'UserInfo>FullName' },
                        { name: 'DownloadUrl', map: 'DownloadUrl' },
                        { name: 'Component', map: 'Component' },
                        { name: 'SupportedModelFamily', map: 'SupportedModelFamily' },
                        { name: 'IsModelEditAllowed', map: 'IsModelEditAllowed' },
                        { name: 'FolderId', map: 'Folder>FolderId' },
                        { name: 'FolderName', map: 'Folder>FolderName' },
                        { name: 'PackageFolderId', map: 'PackageFolder>PackageFolderId' },
						{ name: 'ReferenceSets', map: 'ReferenceSets' }
                    ],
                    root: 'Packages',
                    type: "POST",
                    data: param,

                url: AppConstants.get('API_URL') + "/GetPackages",
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data.getPackagesResp && data)
                        data.getPackagesResp = $.parseJSON(data.getPackagesResp);
                    else
                        data.getPackagesResp = [];

                    if (data.getPackagesResp && data.getPackagesResp.PaginationResponse) {
                        source.totalrecords = data.getPackagesResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getPackagesResp.PaginationResponse.TotalPages;
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;

                    }
                },
            };

            var dataAdapter = new $.jqx.dataAdapter(source,
                {
                    formatData: function (data) {
                        $('.all-disabled').show();
                        disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                        param.getPackagesReq.FolderIds = folderIds;
                        columnSortFilter = new Object();
                        columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'DownloadLibrary');

                        koUtil.GlobalColumnFilter = columnSortFilter;

                        param.getPackagesReq.ColumnSortFilter = columnSortFilter;
                        param.getPackagesReq.Pagination = getPaginationObject(param.getPackagesReq.Pagination, gID);

                        updatepaginationOnState(gID, gridStorage, param.getPackagesReq.Pagination, null, null);

                        data = JSON.stringify(param);
                        return data;
                    },
                    downloadComplete: function (data, status, xhr) {
                        enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                        if (data) {
                            if (data && data.getPackagesResp) {
                                if (data.getPackagesResp && data.getPackagesResp.Packages) {
                                    packagesArray = data.getPackagesResp.Packages;
                                    for (var i = 0; i < data.getPackagesResp.Packages.length; i++) {
                                        data.getPackagesResp.Packages[i].FileUploadDate = convertToLocaltimestamp(data.getPackagesResp.Packages[i].FileUploadDate);
                                    }
                                } else {
                                    source.totalrecords = 0;
                                    source.totalpages = 0;
                                    data.getPackagesResp = new Object();
                                    data.getPackagesResp.Packages = [];
                                    packagesArray = [];
                                }
                                //if (data.getPackagesResp.PaginationResponse && data.getPackagesResp.PaginationResponse.HighLightedItemPage > 0) {
                                //    //for (var h = 0; h < data.getPackagesResp.Packages.length; h++) {
                                //    //if (data.getPackagesResp.Packages[h].PackageId == data.getPackagesResp.PaginationResponse.HighLightedItemId) {
                                //    gridStorage[0].highlightedPage = data.getPackagesResp.PaginationResponse.HighLightedItemPage;
                                //    var updatedGridStorage = JSON.stringify(gridStorage);
                                //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                                //    //}
                                //    //}
                                //}

                            } else {
                                source.totalrecords = 0;
                                source.totalpages = 0;
                                data.getPackagesResp = new Object();
                                data.getPackagesResp.Packages = [];

                            }
                            $('.all-disabled').hide();
                        }
                    },
                    loadError: function (jqXHR, status, error) {
                        $('.all-disabled').hide();
                        openAlertpopup(2, 'network_error');
                    }
                }
            );

            var enableDownloadAutomation = function (row, columnfield, value, defaulthtml, columnproperties) {

                if (value == true) {
                    return '<div style="padding-left:5px;padding-top:7px">Allowed</div>';
                } else {
                    return '<div style="padding-left:5px;padding-top:7px">Not Allowed</div>';
                }
            }

            var Applicationrender = function (row, columnfield, value, defaulthtml, columnproperties) {
                var isAutomation = $("#" + gID).jqxGrid('getcellvalue', row, 'IsEnabledForAutomation');
                var packageID = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageId');
                var packagemode = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageMode');
                packageNameApplication = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageName');

                if (isAutomation == true) {
                    if (isViewEnable == true) {
                        var html = '<div  style="height:100px;cursor:pointer;text-align:center;padding-left:5px;padding-top:7px;float:left;"><a style="text-decoration: underline"  title="Click to view Applications"  role="button" >View</a></div>';
                    } else {
                        var html = '<div disabled="true" class="btn disabled"   style="height:100px;cursor:pointer;text-align:center;padding-top:7px;float:left;"><a style="text-decoration: underline"  title="Click to view Applications"  role="button" >View</a></div>';
                    }
                    return html;
                } else if (isAutomation == false) {
                    return " ";
                }
            }

            var postRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
                if (value == 0) {
                    return '<div style="padding-left:5px;padding-top:7px">None</div>';
                } else if (value == 1) {
                    return '<div style="padding-left:5px;padding-top:7px">Reboot</div>';
                } else if (value == 2) {
                    return '<div style="padding-left:5px;padding-top:7px">Restart App(s)</div>';
                } else if (value == 3) {
                    return '<div style="padding-left:5px;padding-top:7px">Delay</div>';
                }
            }

            var rendered = function (element) {
                enablegridfunctions(gID, 'PackageId', element, gridStorage, true, 'pagerDivDownloadlib', false, 0, 'PackageId', null, null, null);
                return true;
            }

            var downloadPackage = function (row, columnfield, value, defaulthtml, columnproperties) {
                var filename = $("#" + gID).jqxGrid('getcellvalue', row, 'FileName');
                var downloadurl = $("#" + gID).jqxGrid('getcellvalue', row, 'DownloadUrl');

                if (value != null) {
                    return '<div class="vf-downloadpackage-file"><a  id="imageId" tabindex="0" title="Download" width="50" onClick="downloadlinkPackage(' + row + ')"><i class="icon-download3" style="padding-right:5px;"></i></a>&nbsp;<span class="downloadLibrary-name-txt" >' + value + '</span></div>';
                }
            }

            var buildFilterPanel = function (filterPanel, datafield) {
                genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
            }
            var buildFilterPanelDate = function (filterPanel, datafield) {
                genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

            }
            var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
                genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name, false, foldersFilterArray);
            }

            $("#" + gID).jqxGrid(
                {
                    width: "100%",
                    height: gridHeightFunction(gID, "60"),
                    pageable: true,
                    editable: true,
                    source: dataAdapter,
                    altRows: true,
                    virtualmode: true,
                    pageSize: AppConstants.get('ROWSPERPAGE'),
                    filterable: true,
                    sortable: true,
                    columnsResize: true,
                    columnsreorder: true,
                    selectionmode: 'singlerow',
                    theme: AppConstants.get('JQX-GRID-THEME'),
                    autoshowcolumnsmenubutton: false,
                    enabletooltips: true,
                    rowsheight: 32,
                    rendergridrows: function () {
                        return dataAdapter.records;
                    },

                    ready: function () {
                        if (!licenseSource.isParameterLicensed) {
                            $("#" + gID).jqxGrid('hidecolumn', 'PackageMode');
                        }
                        callOnGridReady(gID, gridStorage);
                        var columns = genericHideShowColumn(gID, true, ['PackageMode']);
                        koUtil.gridColumnList = new Array();
                        for (var i = 0; i < columns.length; i++) {
                            koUtil.gridColumnList.push(columns[i].columnfield);
                        }
                        visibleColumnsList = koUtil.gridColumnList;
                        if (folderId == 0) {
                            $("#" + gID).jqxGrid('setcolumnproperty', 'FolderName', 'filterable', true);
                            $("#" + gID).jqxGrid('setcolumnproperty', 'FolderName', 'sortable', true);
                            $("#" + gID).jqxGrid('setcolumnproperty', 'FolderName', 'menu', true);
                            $("#" + gID).jqxGrid('setcolumnproperty', 'FolderName', 'autoshowfiltericon', true);
                        } else {
                            $("#" + gID).jqxGrid('setcolumnproperty', 'FolderName', 'filterable', false);
                            $("#" + gID).jqxGrid('setcolumnproperty', 'FolderName', 'sortable', false);
                            $("#" + gID).jqxGrid('setcolumnproperty', 'FolderName', 'menu', false);
                            $("#" + gID).jqxGrid('setcolumnproperty', 'FolderName', 'autoshowfiltericon', false);
                        }
                    },

                    columns: [
                        {
                            text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false,
                            datafield: 'isSelected', width: 40, renderer: function () {
                                return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                            }, rendered: rendered
                        },
                        { text: '', dataField: 'PackageId', hidden: true, editable: false, minwidth: 0, },
                        {
                            text: i18n.t('package_nm', { lng: lang }), dataField: 'PackageName', editable: false, minwidth: 120,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        { text: i18n.t('data_models', { lng: lang }), datafield: 'SupportedModels', editable: false, minwidth: 90, filterable: false, sortable: false, menu: false, },
                        {
                            text: i18n.t('folder_name', { lng: lang }), datafield: 'FolderName', editable: false, minwidth: 150,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelMultiChoice(filterPanel, datafield, 'Folder Name', foldersFilterArray);
                            },
                        },
                        {
                            text: i18n.t('filename', { lng: lang }), datafield: 'FileName', editable: false, minwidth: 100, filterable: true, cellsrenderer: downloadPackage,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            },
                        },
                        {
                            text: i18n.t('filesize', { lng: lang }), dataField: 'FileSizeInMB', editable: false, minwidth: 120, filterable: true,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('packagetype', { lng: lang }), dataField: 'FileType', editable: false, minwidth: 120,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelMultiChoice(filterPanel, datafield, 'Package Type');
                            }
                        },
                        {
                            text: i18n.t('fileversion', { lng: lang }), dataField: 'FileVersion', editable: false, minwidth: 100, filterable: true,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('package_category', { lng: lang }), dataField: 'PackageTypeString', editable: false, minwidth: 140, filterable: true,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelMultiChoice(filterPanel, datafield, 'Package Category');
                            }
                        },
                        {
                            text: i18n.t('component', { lng: lang }), dataField: 'Component', editable: false, minwidth: 120, enabletooltips: false,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelMultiChoice(filterPanel, datafield, 'Component');
                            }
                        },
                        {
                            text: i18n.t('post_install_actn', { lng: lang }), dataField: 'PostInstallAction', enabletooltips: false, editable: false, minwidth: 120, cellsrenderer: postRenderer,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelMultiChoice(filterPanel, datafield, 'Post Installtion Action');
                            }
                        },
						{
                            text: i18n.t('tag_device', { lng: lang }), dataField: 'Tags', editable: false, minwidth: 100, filterable: true,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
						{
                            text: i18n.t('package_reference_sets', { lng: lang }), dataField: 'ReferenceSets', editable: false, minwidth: 130, filterable: false, sortable: false, menu: false 
                        },
                        {
                            text: i18n.t('Automatic_Downloads', { lng: lang }), datafield: 'IsEnabledForAutomation', enabletooltips: false, editable: false, minwidth: 160, cellsrenderer: enableDownloadAutomation,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelMultiChoice(filterPanel, datafield, 'Automatic Download');
                            }
                        },
                        { text: i18n.t('uploaded_by', { lng: lang }), sortable: false, datafield: 'FullName', filterable: false, minwidth: 100, editable: false, menu: false, },
                        {
                            text: i18n.t('date_uploaded_DownloadLib', { lng: lang }), datafield: 'FileUploadDate', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 160, filterable: true, editable: false,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelDate(filterPanel, datafield);

                            }
                        },
                        { text: i18n.t('applications_download_lib', { lng: lang }), filterable: false, sortable: false, menu: false, datafield: 'PackageMode', editable: false, minwidth: 100, cellsrenderer: Applicationrender }

                    ]
                });
            getGridBiginEdit(gID, 'PackageId', gridStorage);
            callGridFilter(gID, gridStorage);
            callGridSort(gID, gridStorage, 'PackageId');

            $("#" + gID).on("cellclick", function (event) {
                var column = event.args.column;
                var rowindex = event.args.rowindex;
                var columnindex = event.args.columnindex;
                var rowData = $("#" + gID).jqxGrid('getrowdata', rowindex);
                if (event.args.datafield == 'PackageMode' && rowData.IsEnabledForAutomation == true) {
                    openPopup('modelViewParentDownloadLibrary');
                    koUtil.isDownloadlibAddpackage = 0;
                    koUtil.rowIdDownload = rowindex;
                    koUtil.gridIdDownload = gID;
                }
            });
        }
        seti18nResourceData(document, resourceStorage);
    };



    function getDownloadParameters(isExport, columnSortFilter, selectedDownloadLibraryItems, unselectedDownloadLibraryItems, checkAll, visibleColumns, folderIds) {
        var getPackagesReq = new Object();
        var Export = new Object();
        var Selector = new Object();
        var FolderIds = new Array();

        var Pagination = new Object();
        Pagination.HighLightedItemId = null;
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
        Export.DynamicColumns = null;
        Export.ExportReportType = 5;
        Export.VisibleColumns = visibleColumns;

        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedDownloadLibraryItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedDownloadLibraryItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        }

        var ColumnSortFilter = columnSortFilter;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getPackagesReq.ColumnSortFilter = ColumnSortFilter;
        getPackagesReq.Export = Export;
        getPackagesReq.PackageType = 1;
        getPackagesReq.Pagination = Pagination;
        getPackagesReq.Selector = Selector;
        getPackagesReq.FolderIds = folderIds;

        var param = new Object();
        param.token = TOKEN();
        param.getPackagesReq = getPackagesReq;

        return param;
    }
    //end grid

    function generateTemplate(tempname, controllerId) {
        //new template code
        var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
        var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
        var cunanem = tempname + '1';
        ko.components.register(tempname, {
            viewModel: { require: ViewName },
            template: { require: 'plugin/text!' + htmlName }
        });
        // end new template code
    }

    // force delete packages(s) associated to device(s)
    function deletePackage(gId, selecteDeleteIds, unSelectedDeleteIds, folderIds) {
        var deletePackageReq = new Object();
        var Selector = new Object();
        var selectedFolderIds = new Array();
        var checkAll = checkAllSelected(gId);

        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unSelectedDeleteIds;
            selectedFolderIds = (koUtil.GlobalColumnFilter.FilterList && koUtil.GlobalColumnFilter.FilterList.length > 0) ? null : folderIds;
        } else {
            Selector.SelectedItemIds = selecteDeleteIds;
            Selector.UnSelectedItemIds = null;
            selectedFolderIds = null;
        }

        deletePackageReq.PackageType = 1;
        deletePackageReq.Selector = Selector;
        deletePackageReq.FolderIds = selectedFolderIds;
        deletePackageReq.IsDeleteAssociated = true;
        deletePackageReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    gridRefreshClearSelection(gId);
                    $('#downloadModel').modal('hide');
                    openAlertpopup(0, 'alert_package_delete_success');
                } else if (data.responseStatus.StatusCode == AppConstants.get('PACKAGE_ASSOCIATED_TO_DEVICE_HENCE_CANNOT_BE_DELETED')) {                //37
                    openAlertpopup(2, 'package_associated_to_device_hence_cannot_be_deleted');
                } else if (data.responseStatus.StatusCode == AppConstants.get('E_TEMPLATE_ASSIGNED_HIERARCHY')) {                                       //319
                    conflictHierarchyParameters.TemplateHierarchyReferenceSet = data.deletePackageResp.TemplateHierarchyReferenceSet;
                    conflictHierarchyParameters.ActionMode = "DeletePackage";
                    conflictHierarchyParameters.InfoMessage = i18n.t("template_of_this_app_or_package_assigned_hierarchy_del_template", { lng: lang });
                    self.openPopup('modelViewConflictDetails');
                }
            }
        }
        var method = 'DeletePackage';
        var params = '{"token":"' + TOKEN() + '","deletePackageReq":' + JSON.stringify(deletePackageReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }

    function getDevicesForPackage(gId, folderIds) {
        var selectedItemData = getMultiSelectedData(gId);
        var selectedItems = getSelectedPackageId(gId);
        var unSelectedItems = getUnSelectedPackageId(gId);
        var checkAll = checkAllSelected(gId);
        var DeviceSearch = new Object();
        var Pagination = new Object();
        var selector = new Object();
        var Export = new Object();
        var EPackage = new Object();

        var packageIds = new Array();
        var schedulePackages = new Object();
        globalSchedulePackages = new Array();
        globalSelectedFolders = folderIds;

        DeviceSearch.DeviceStatus = null;
        DeviceSearch.GroupIds = null;

        var HierarchyIdsWithChildren = new Array();
        HierarchyIdsWithChildren.push(koUtil.hierarchyIdForScheule);

        DeviceSearch.HierarchyIdsWithChildren = HierarchyIdsWithChildren;
        DeviceSearch.HierarchyIdsWithoutChildren = null;
        DeviceSearch.IsHierarchiesSelected = false;
        DeviceSearch.IsOnlyDeleteBlacklisted = false;
        DeviceSearch.SearchCriteria = null;
        DeviceSearch.SearchElements = null;
        DeviceSearch.SearchModels = null;
        DeviceSearch.SearchName = null;
        DeviceSearch.SearchID = 0;
        DeviceSearch.SearchText = null;
        DeviceSearch.SearchType = ENUM.get('NONE');

        Pagination.HighLightedItemId = null;
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Export.DynamicColumns = null;
        Export.VisibleColumns = [];
        Export.IsAllSelected = false;
        Export.IsExport = false;
        globalVariableForSelectedPackages = new Array();
        globalVariableForUnselectedPackages = new Array();

        getDevicesForPackageReq = new Object();

        if (selectedItemData && selectedItemData.length > 0) {
            for (var i = 0; i < selectedItemData.length; i++) {
                EPackage = new Object();
                EPackage.PackageId = selectedItemData[i].PackageId;
                EPackage.PackageName = selectedItemData[i].PackageName;
                EPackage.FolderName = selectedItemData[i].FolderName;
                packageIds.push(EPackage);
            }
        }

        if (checkAll == 1) {
            if (unSelectedItems.length > 0) {
                selector.SelectedItemIds = null;
                selector.UnSelectedItemIds = unSelectedItems;
                globalVariableForSelectedPackages = null;
                globalVariableForUnselectedPackages = unSelectedItems;
            }
            else {
                selector.SelectedItemIds = null;
                selector.UnSelectedItemIds = null;
                globalVariableForSelectedPackages = null;
                globalVariableForUnselectedPackages = null;
            }
        }
        else {
            selector.SelectedItemIds = selectedItems;
            selector.UnSelectedItemIds = null;
            globalVariableForSelectedPackages = selectedItems;
            globalVariableForUnselectedPackages = null;
        }

        globalSchedulePackages = packageIds;
        getDevicesForPackageReq.ParentColumnSortFilter = koUtil.GlobalColumnFilter;
        getDevicesForPackageReq.PackageType = ENUM.get('Software');
        getDevicesForPackageReq.Pagination = Pagination;
        getDevicesForPackageReq.DeviceSearch = DeviceSearch;
        getDevicesForPackageReq.Selector = selector;
        getDevicesForPackageReq.Export = Export;
        getDevicesForPackageReq.FolderIds = globalSelectedFolders;

        function callBackfunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    setscheduleAdstorageFromDeviceSearch('jqxgridForSelectedDevicesdownloads');
                    scheduleOption = "scheduleDownload";
                    isFromDownloadLibrary = true;
                    isFromContentLibrary = false;
                    redirectToLocation(menuJsonData, 'scheduleDownload');
                }
                else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Exists')) {
                    openAlertpopup(1, "selected_packages_do_not_have_common_models");
                }
            }
        }

        var method = 'GetDevicesForPackage';
        var params = '{"token":"' + TOKEN() + '", "getDevicesForPackageReq":' + JSON.stringify(getDevicesForPackageReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});
function displayWaitDownloadToaster(toaster) {
    var config = {};
    config.toasterType = "wait"
    config.message = "Download initiated, please wait a moment";
    config.title = "Downloading...";
    config.timeOut = 0;
    config.showClose = false;
    config.clickToClose = false;
    displayToaster(toaster, config);
}

function displaySuccessDownloadToaster(toaster) {
    var config = {};
    config.toasterType = "success"
    config.message = i18n.t('file_successfully_downloaded', { lng: lang });
    config.title = "Success";
    config.timeOut = 5000;
    config.showClose = true;
    config.clickToClose = true;
    displayToaster(toaster, config);
}
//---downloaded Packages-----
function downloadlinkPackage(row) {
    var logFileUrl = $("#jqxgridDownloadlib").jqxGrid('getcellvalue', row, 'DownloadUrl');
    logFileUrl = replaceIpAddressByHostName(logFileUrl);  //Replacing IP address by the domain name If Download File URL contains IP  
    displayWaitDownloadToaster(toaster)
    $.ajax({
        url: logFileUrl,
        success: function (result) {
            var downloadResult = window.open(logFileUrl, '_blank');
            if (downloadResult != "") {
                removeToaster(toaster);
                setTimeout(function () {
                    displaySuccessDownloadToaster(toaster);
                }, 1000);
            }
        },
        error: function (jqXHR, status, error) {
            removeToaster(toaster);
            if (jqXHR != null) {
                ajaxErrorHandler(jqXHR, status, error)
                if (jqXHR.status != 401) {
                    openAlertpopup(2, 'internal_server_error_downloading_file');
                }
            } else {
                openAlertpopup(2, 'internal_server_error_downloading_file');
            }
        }
    });
}