closeVideoPopup = 0;
closeAudioPopup = 0;
player = '';
isPaused = "";
audioPlayer = "";
define(["knockout", "autho", "koUtil", "video", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "bootstrap", "bootstrapDatePicker", "chosen"], function (ko, autho, koUtil) {
    SelectedIdOnGlobale = new Array();
    columnSortFilterForContent = new Object();
    filterobjforContent = '';
    previewFileName = "";
    var lang = getSysLang();
    selectedRowID = new Array();
    cntrlIsPressed = false;
    tileViewSelectedArray = new Array();
    tileViewSelectedDataArray = new Array();
    koUtil.GlobalColumnFilter = new Array();
    var isRefresh = 1;

    var savedfilterObj = new Array();

    previewImg = '';
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    checkthumbnailview = true;
    return function LibararyViewModel() {
        filtercheckfiled = '';


        var self = this;

        checkloadingforContent = 0;
        checktileviewforloading = 0;

        tileViewSelectedArray = [];
        tileViewSelectedDataArray = [];

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        //focus on first textbox
        $('#modelDeviceLocationID').on('shown.bs.modal', function () {
            $('#deviceFileID').focus();
        })



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

		self.GetConfigurableValuesForDevicefileLocationLibrary = ko.observableArray(deviceFileLocations);
        //GetConfigurationValuesForDeviceFileLocationLibrary(AppConstants.get('DEVICE_FILE_LOCATION'), self.GetConfigurableValuesForDevicefileLocationLibrary);

        function GetConfigurationValuesForDeviceFileLocationLibrary(category, GetConfigurableValuesForDevicefileLocationLibrary) {
            $("#loadingDiv").hide();
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        if (data.genericConfigurations) {
                            data.genericConfigurations = $.parseJSON(data.genericConfigurations);
                            GetConfigurableValuesForDevicefileLocationLibrary(data.genericConfigurations);
                        }
                    }
                }
            }

            var method = 'GetConfigurationValues';
            var params = '{"token":"' + TOKEN() + '","category":"' + category + '"}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        self.contentTilesData = ko.observableArray();
        self.tilevisibleRow = ko.observableArray();
        self.tilepaginationData = ko.observableArray();
        self.totalTilerow = ko.observable();
        self.totalTilePage = ko.observable();

        var pageName = "ContentLibrary";
        var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
        if (PageStorage) {
            self.tilePageNo = ko.observable(PageStorage[0].PagNo);
        } else {
            self.tilePageNo = ko.observable(1);
        }
        self.totalselectedTileView = ko.observable(0);

        setMenuSelection();

        self.lastUsedDateChange = function () {
            if ($("#datepickerfromlastused").val() == null) {
                $('#datepickerTolastused').addAttr('disabled');
            } else {
                $('#datepickerTolastused').removeAttr('disabled');
            }
        }

        self.fromDateChange = function () {
            if ($("#datepickerfrom").val() == null) {
                $('#datepickerTo').addAttr('disabled');
            } else {
                $('#datepickerTo').removeAttr('disabled');
            }
        }

        var gID = "jqxgridContentlib";
        var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

        if (gridStorage) {
            //alert(JSON.stringify(gridStorage))

            //alert('iscontentGrid is  ' + gridStorage[0].iscontentGrid)
        }

        self.tileshowing = ko.computed(function () {
            var rowsperpage = parseInt(AppConstants.get('ROWSPERPAGE'));
            var endpage = rowsperpage - 1;
            var recordsInCurrentPage = self.tilePageNo() * rowsperpage;
            if (self.tilePageNo() == 0) {
                return (0) + " - " + (0);
            } else {
                if (self.totalTilerow() == 1) {
                    return (1) + " - " + (1);
                } else {

                    if (self.tilevisibleRow() < AppConstants.get('ROWSPERPAGE')) {

                        var newcount = ((recordsInCurrentPage) - endpage) + (self.tilevisibleRow() - 1);
                        return ((recordsInCurrentPage) - endpage) + " - " + (newcount);
                    } else {

                        return ((recordsInCurrentPage) - endpage) + " - " + (self.tilePageNo() * rowsperpage);
                    }
                }
            }
        }, self);

        //if (gridStorage) {
        //    if (gridStorage[0].iscontentGrid != 1) {

        getContentLibraryData(filterobjforContent, self.contentTilesData, self.tilepaginationData, self.totalTilerow, self.totalTilePage, self.tilePageNo, self.tileshowing, self.tilevisibleRow);
        //    }
        //}
        self.downloadtileView = function (data) {
            //window.open(data.DownloadUrl, '_blank');

            $.ajax({
                url: data.DownloadUrl,
                success: function (result) {
                    var downloadResult = window.open(data.DownloadUrl, '_blank');
                    if (downloadResult != "") {
                        openAlertpopup(0, 'file_successfully_downloaded');
                    }
                },
                error: function (jqXHR, status, error) {
                    if (jqXHR != null) {
                        ajaxErrorHandler(jqXHR, status, error);
                        if (jqXHR.status != 401) {
                            openAlertpopup(2, 'error_occurred_while_downloading_file');
                        }
                    } else {
                        openAlertpopup(2, 'error_occurred_while_downloading_file');
                    }
                }
            });
        }

        // Download a file form a url.
        self.saveFile = function (data) {
            var extension = data.FileName.substr((data.FileName.lastIndexOf('.') + 1));
            extension = extension.toLowerCase();
            downloadContentFile(data.DownloadUrl, data.FileName, extension);
        }

        self.tileGotoNext = function () {
            var pg = self.tilePageNo()
            self.tilePageNo(parseInt(pg) + (1));

            var pageName = "ContentLibrary";
            var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
            if (PageStorage) {
                PageStorage[0].PagNo = self.tilePageNo();

                var updatedPageStorage = JSON.stringify(PageStorage);
                window.sessionStorage.setItem(pageName + 'PageStorage', updatedPageStorage);
            }


            getContentLibraryData(filterobjforContent, self.contentTilesData, self.tilepaginationData, self.totalTilerow, self.totalTilePage, self.tilePageNo, self.tileshowing, self.tilevisibleRow);
        }
        self.tileGotoLast = function () {

            self.tilePageNo(self.totalTilePage());

            var pageName = "ContentLibrary";
            var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
            if (PageStorage) {
                PageStorage[0].PagNo = self.tilePageNo();

                var updatedPageStorage = JSON.stringify(PageStorage);
                window.sessionStorage.setItem(pageName + 'PageStorage', updatedPageStorage);
            }

            getContentLibraryData(filterobjforContent, self.contentTilesData, self.tilepaginationData, self.totalTilerow, self.totalTilePage, self.tilePageNo, self.tileshowing, self.tilevisibleRow);
        }
        self.tileGotoPer = function () {
            var pg = self.tilePageNo()
            self.tilePageNo(parseInt(pg) - (1));

            var pageName = "ContentLibrary";
            var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
            if (PageStorage) {
                PageStorage[0].PagNo = self.tilePageNo();

                var updatedPageStorage = JSON.stringify(PageStorage);
                window.sessionStorage.setItem(pageName + 'PageStorage', updatedPageStorage);
            }

            getContentLibraryData(filterobjforContent, self.contentTilesData, self.tilepaginationData, self.totalTilerow, self.totalTilePage, self.tilePageNo, self.tileshowing, self.tilevisibleRow);
        }
        self.tileGotoFirst = function () {

            self.tilePageNo('1');
            var pageName = "ContentLibrary";
            var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
            if (PageStorage) {
                PageStorage[0].PagNo = self.tilePageNo();

                var updatedPageStorage = JSON.stringify(PageStorage);
                window.sessionStorage.setItem(pageName + 'PageStorage', updatedPageStorage);
            }
            getContentLibraryData(filterobjforContent, self.contentTilesData, self.tilepaginationData, self.totalTilerow, self.totalTilePage, self.tilePageNo, self.tileshowing, self.tilevisibleRow);
        }

        self.refershTileview = function () {

            self.tilePageNo(1);
            tileViewSelectedArray = [];
            self.totalselectedTileView(0);
            getContentLibraryData(filterobjforContent, self.contentTilesData, self.tilepaginationData, self.totalTilerow, self.totalTilePage, self.tilePageNo, self.tileshowing, self.tilevisibleRow);
        }
        var compulsoryfields = ['PackageName', 'FileType', 'LastUsedDate'];
        self.gridIdForShowHide = ko.observable();
        self.columnlist = ko.observableArray();

        self.goToPage = function (data, event) {

            if (event.keyCode === 13) {

                pageno = $("#txtGoToPagetilwView").val();
                if (isNumeric(pageno)) {
                    if (pageno == 0 || pageno > self.totalTilePage()) {
                        $("#txtGoToPagetilwView").val(self.tilePageNo());
                        var msg = i18n.t('enter_valid_page_number', { lng: lang }) + self.totalTilePage() + '.';
                        openAlertpopup(1, msg);
                    } else {
                        self.tilePageNo(pageno);
                        var pageName = "ContentLibrary";
                        var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
                        if (PageStorage) {
                            PageStorage[0].PagNo = self.tilePageNo();

                            var updatedPageStorage = JSON.stringify(PageStorage);
                            window.sessionStorage.setItem(pageName + 'PageStorage', updatedPageStorage);
                        }
                        getContentLibraryData(filterobjforContent, self.contentTilesData, self.tilepaginationData, self.totalTilerow, self.totalTilePage, self.tilePageNo, self.tileshowing, self.tilevisibleRow);
                    }
                } else {
                    $("#txtGoToPagetilwView").val(self.tilePageNo());
                    var msg = i18n.t('enter_valid_page_number', { lng: lang }) + self.totalTilePage() + '.';
                    openAlertpopup(1, msg);
                }
            }
            return true;
        }
        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
        $("#datepickerfrom").datepicker({ autoclose: true });
        $("#datepickerTo").datepicker({ autoclose: true });
        $("#datepickerfromlastused").datepicker({ autoclose: true });
        $("#datepickerTolastused").datepicker({ autoclose: true });

        $("#datepickerTo").datepicker().on('changeDate', function (ev) {
            if (moment($("#datepickerfrom").val()).isAfter($("#datepickerTo").val())) {
                $("#datepickerTo").change();
            }
        });

        $("#datepickerTo").change(function () {
            if (moment($("#datepickerfrom").val()).isAfter($("#datepickerTo").val())) {
                openAlertpopup(1, 'to_filterdate_greater');
                $("#datepickerTo").val('');
            }
        });


        $("#datepickerfrom").datepicker().on('changeDate', function (ev) {
            if ($("#datepickerfrom").val() != '') {
                if (moment($("#datepickerfrom").val()).isAfter($("#datepickerTo").val())) {
                    $("#datepickerfrom").change();
                }
            }
        });

        $("#datepickerfrom").change(function () {
            if ($("#datepickerfrom").val() != '') {
                if (moment($("#datepickerfrom").val()).isAfter($("#datepickerTo").val())) {
                    openAlertpopup(1, 'to_filterdate_greater');
                    $("#datepickerfrom").val('');
                }
            }

        });

        $("#datepickerTolastused").datepicker().on('changeDate', function (ev) {
            if (moment($("#datepickerfromlastused").val()).isAfter($("#datepickerTolastused").val())) {
                $("#datepickerTolastused").change();
            }
        });

        $("#datepickerTolastused").change(function () {
            if (moment($("#datepickerfromlastused").val()).isAfter($("#datepickerTolastused").val())) {
                openAlertpopup(1, 'to_filterdate_greater');
                $("#datepickerTolastused").val('');
            }
        });

        $("#datepickerfromlastused").datepicker().on('changeDate', function (ev) {
            if ($("#datepickerfromlastused").val() != '') {
                if (moment($("#datepickerfromlastused").val()).isAfter($("#datepickerTolastused").val())) {
                    $("#datepickerfromlastused").change();
                }
            }
        });

        $("#datepickerfromlastused").change(function () {
            if ($("#datepickerfromlastused").val() != '') {
                if (moment($("#datepickerfromlastused").val()).isAfter($("#datepickerTolastused").val())) {
                    openAlertpopup(1, 'to_filterdate_greater');
                    $("#datepickerfromlastused").val('');
                }
            }
        });


        //Draggable function

        $('#filtterPopupHeader').mouseup(function () {
            //$("#filtterPopup").draggable({ disabled: true });
            $("#filterpopupcantainer").draggable({ disabled: true });

        });

        $('#filtterPopupHeader').mousedown(function () {
            //$("#filtterPopup").draggable({ disabled: false });
            $("#filterpopupcantainer").draggable({ disabled: false });
        });


        $('#imagePreviewHeader').mouseup(function () {
            //$("#filtterPopup").draggable({ disabled: true });
            $("#imagePreviewContent").draggable({ disabled: true });

        });

        $('#imagePreviewHeader').mousedown(function () {
            //$("#filtterPopup").draggable({ disabled: false });
            $("#imagePreviewContent").draggable({ disabled: false });
        });

        ////////////////

        $("#gridView").hide();
        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');
        self.isGridVisible = ko.observable(false);
        self.isTilesVisible = ko.observable(true);

        self.switchViewClicked = function () {

            if (self.isGridVisible()) {

                var gID = "jqxgridContentlib";
                var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));
                if (gridStorage) {
                    //alert('tile');
                    gridStorage[0].iscontentGrid = 0;
                    var updatedGridStorage = JSON.stringify(gridStorage);
                    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                }

                checkloadingforContent = 0;
                checktileviewforloading = 0;
                $("#gridView").hide();
                $("#tileView").show();
                self.isGridVisible(false);
                self.isTilesVisible(true);
                checkthumbnailview = true;
                self.tilePageNo(1);
                $('.tileswrapper').children('li').removeClass('selected');
                self.totalselectedTileView(0)
                tileViewSelectedArray = [];
                tileViewSelectedDataArray = [];
                koUtil.isThumbnailViewActive = 1;
                filterobjforContent = '';

                var pageName = "ContentLibrary";
                var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
                if (PageStorage) {
                    PageStorage[0].columnSortFilter = filterobjforContent;
                    PageStorage[0].selectedDataArr = [];
                    var updatedPageStorage = JSON.stringify(PageStorage);
                    window.sessionStorage.setItem(pageName + 'PageStorage', updatedPageStorage);
                }

                savedfilterObj = [];
                self.clearfilter();
                $("#filterThumbnail").prop('title', 'Change Filter');
                $("#iconFilter").removeClass('thumbnail-icon-color');

                //hide div user switch to tile view
                $("#audioDiv").hide();
                $("#videoDiv").hide();
                $("#imgDiv").hide();

                getContentLibraryData(filterobjforContent, self.contentTilesData, self.tilepaginationData, self.totalTilerow, self.totalTilePage, self.tilePageNo, self.tileshowing, self.tilevisibleRow);
            } else {
                var gID = "jqxgridContentlib";
                var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));
                if (gridStorage) {
                    //alert('grid');
                    gridStorage[0].iscontentGrid = 1;
                    var updatedGridStorage = JSON.stringify(gridStorage);
                    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                }

                checkloadingforContent = 1;
                checktileviewforloading = 1;
                $("#tileView").hide();
                $("#gridView").show();
                self.isGridVisible(true);
                self.isTilesVisible(false);
                checkthumbnailview = false;
                koUtil.isThumbnailViewActive = 0;
                //self.clearFilter('jqxgridContentlib');
                $("#jqxgridContentlib").jqxGrid('updatebounddata');

                //hide div user switch to grid view
                self.fileVideo(false);
                self.fileAudio(false);
                self.fileImg(false);
            }
        }

        //unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
            $('#addLibraryModal').modal('hide');
        };
        modelReposition();
        //open popup
        self.openPopup = function (popupName, girdID) {
            self.templateFlag(true);
            if (popupName == "modelEditLibrary") {
                $('#btn_editLibrary').prop('disabled', true);
                if (self.isGridVisible()) {
                    var selecteItemIds = getSelectedUniqueId('jqxgridContentlib');
                    var unSelecteItemIds = getUnSelectedUniqueId('jqxgridContentlib');
                    var checkAll = checkAllSelected('jqxgridContentlib');
                    var datacount = getTotalRowcount('jqxgridContentlib');
                    if (checkAll == 1) {
                        if (unSelecteItemIds.length == datacount - 1) {
                            loadelement(popupName, 'contentLibrary');
                            $('#addLibraryModal').modal('show');
                            editButtonClick('jqxgridContentlib');
                        } else {
                            openAlertpopup(1, 'pease_select_single_file_to_edit');
                            $("#draggEditContentID").draggable();

                            return;
                        }
                    } else {
                        if (selecteItemIds.length == 1) {
                            loadelement(popupName, 'contentLibrary');
                            $('#addLibraryModal').modal('show');
                            editButtonClick('jqxgridContentlib');
                        } else if (selecteItemIds.length <= 0) {
                            openAlertpopup(1, 'select_item');
                            $("#draggEditID").draggable();
                            return;
                        } else if (selecteItemIds.length > 1) {
                            openAlertpopup(1, 'pease_select_single_file_to_edit');
                            $("#draggEditContentID").draggable();
                            return;
                        }
                    }
                } else {
                    if (tileViewSelectedArray.length <= 0) {
                        openAlertpopup(1, 'select_item');
                        $("#draggEditID").draggable();
                        return;
                    } else if (tileViewSelectedArray.length == 1) {
                        loadelement(popupName, 'contentLibrary');
                        $('#addLibraryModal').modal('show');
                        TileList();
                    } else if (tileViewSelectedArray.length != 0 && tileViewSelectedArray.length > 1) {
                        openAlertpopup(1, 'pease_select_single_file_to_edit');
                        $("#draggEditContentID").draggable();
                        return;
                    }
                }
            } else if (popupName == "modelAddLibrary") {
                loadelement(popupName, 'contentLibrary');
                $('#addLibraryModal').modal('show');
            } else if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(girdID);
                self.columnlist(genericHideShowColumn(girdID, true, compulsoryfields));
                loadelement(popupName, 'genericPopup');
                $('#addLibraryModal').modal('show');
            } else if (popupName == "modelDeleteLibrary") {
                if (self.isGridVisible()) {
                    var selecteItemIds = getSelectedUniqueId('jqxgridContentlib');
                    var deleteCount = getAllSelectedDataCount('jqxgridContentlib');
                    var checkAll = checkAllSelected('jqxgridContentlib');
                    if (checkAll == 1) {
                        if (deleteCount < 1) {
                            openAlertpopup(1, 'select_item');
                        }
                        else {
                            loadelement(popupName, 'contentLibrary');
                            $('#addLibraryModal').modal('show');
                            deleteButtonClick('jqxgridContentlib', 1);
                        }
                    } else {
                        if (selecteItemIds.length == 1 || selecteItemIds.length > 1) {
                            loadelement(popupName, 'contentLibrary');
                            $('#addLibraryModal').modal('show');
                            deleteButtonClick('jqxgridContentlib', 1);
                        } else if (selecteItemIds.length == 0) {
                            openAlertpopup(1, 'select_item');
                            $("#draggDeleteID").draggable();
                            return;
                        }
                    }

                } else {
                    if (tileViewSelectedArray.length <= 0) {
                        openAlertpopup(1, 'select_item');
                        $("#draggDeleteID").draggable();
                        return;
                    } else if (tileViewSelectedArray.length >= 1) {
                        loadelement(popupName, 'contentLibrary');
                        $('#addLibraryModal').modal('show');
                        deleteTileList(tileViewSelectedDataArray);
                    }
                }
            } else if (popupName == "modelExportSucess") {
                loadelement(popupName, 'genericPopup');
                $('#addLibraryModal').modal('show');

            }
        }

        ///fro set ctrl key
        $(document).keydown(function (event) {
            if (event.which == "17") {
                cntrlIsPressed = true;
            }
        });

        $(document).keyup(function () {
            cntrlIsPressed = false;
        });

        // refresh grid
        self.refreshGrid = function (gridID) {
            gridRefresh(gridID);
        }

        // reset filter
        self.clearFilter = function (gridID) {
            gridFilterClear(gridID);

        }

        self.refreshPackage = function () {

            isRefresh = 0;
            filterobjforContent = '';

            var pageName = "ContentLibrary";
            var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
            if (PageStorage) {
                PageStorage[0].columnSortFilter = filterobjforContent;

                var updatedPageStorage = JSON.stringify(PageStorage);
                window.sessionStorage.setItem(pageName + 'PageStorage', updatedPageStorage);
            }

            savedfilterObj = [];
            self.clearfilter();
            $("#iconFilter").removeClass('thumbnail-icon-color');
            $("#filterThumbnail").prop('title', 'Change Filter');
            self.tilePageNo('1');
            getContentLibraryData(filterobjforContent, self.contentTilesData, self.tilepaginationData, self.totalTilerow, self.totalTilePage, self.tilePageNo, self.tileshowing, self.tilevisibleRow, isRefresh);
        }

        //schedule
        //self.schedulePackage = function () {
        //    isRefresh = 0;
        //    var scheduleDataCount = getAllSelectedDataCount('jqxgridContentlib');

        //    if (self.isGridVisible()) {
        //        var checkAll = checkAllSelected('jqxgridContentlib');
        //        var selecteItemIds = getSelectedUniqueId('jqxgridContentlib');

        //        var selectedCount = parseInt($("#jqxgridContentlibseleceteRowSpan").text());
        //        var count = parseInt(maximumSchedulesPerJob);
        //        if (selectedCount > count) {
        //            openAlertpopup(1, i18n.t('maximum_of_3_contents_can_be_selected_for_schedule_global', { count: count }, { lng: lang }));
        //        } else if (checkAll == 1) {
        //            globalVariable = null;
        //            globalVariable = selecteItemIds;
        //            scheduleOption = "scheduleContent";
        //            location.href = "index.html#content/downloadLibrary/schedule/scheduleDelivery";
        //        } else {
        //            if (selecteItemIds.length == 1 || selecteItemIds.length > 1) {
        //                setscheduleAdstorageFromDeviceSearch('jqxgridForSelectedDevicesmanageContents');
        //                globalVariable = null;
        //                globalVariable = selecteItemIds;
        //                scheduleOption = "scheduleContent";
        //                location.href = "index.html#content/downloadLibrary/schedule/scheduleDelivery";
        //            } else if (selecteItemIds.length == 0) {
        //                openAlertpopup(1, 'select_item');
        //                $("#draggScheduleID").draggable();
        //                return;
        //            } else {
        //                return false;
        //            }
        //        }
        //    } else {
        //        var selectedCount = parseInt($("#tileViewseleceteRowSpan").text());
        //        var count = parseInt(maximumSchedulesPerJob);
        //        if (selectedCount > count) {
        //            openAlertpopup(1, i18n.t('maximum_of_3_contents_can_be_selected_for_schedule_global', { count: count }, { lng: lang }));
        //        } else if (tileViewSelectedArray.length == 1 || tileViewSelectedArray.length > 1) {
        //            globalVariable = null;
        //            globalVariable = tileViewSelectedArray;

        //            scheduleOption = "scheduleContent";
        //            location.href = "index.html#content/downloadLibrary/schedule/scheduleDelivery";
        //        } else if (tileViewSelectedArray.length == 0) {
        //            openAlertpopup(1, 'select_item');
        //            $("#draggScheduleID").draggable();
        //            return;
        //        } else {
        //            return false;
        //        }

        //    }
        //}

        self.schedulePackage = function (gId) {
            sessionStorage.removeItem("CustomSearchText");
            sessionStorage.removeItem("customSearchStore");
            if (self.isGridVisible()) {
                var selecteItemIds = getSelectedUniqueId(gId);
				var count = parseInt(maximumSchedulesPerJob);
                var selectedCount = parseInt($("#jqxgridContentlibseleceteRowSpan").text());

                if (selecteItemIds.length == 0) {
                    openAlertpopup(1, 'select_item');
                    $("#draggScheduleID").draggable();
                    return;
                }
                else if (selectedCount > count) {
                    openAlertpopup(1, i18n.t('maximum_of_3_contents_can_be_selected_for_schedule_global', { count: count }, { lng: lang }));
                }
                else {
                    getDevicesForPackage(gId);
                }
            }
            else {
                var selectedCount = parseInt($("#tileViewseleceteRowSpan").text());
				var count = parseInt(maximumSchedulesPerJob);
                if (selectedCount > count) {
                    openAlertpopup(1, i18n.t('maximum_of_3_contents_can_be_selected_for_schedule_global', { count: count }, { lng: lang }));
                } else if (tileViewSelectedArray.length == 0) {
                    openAlertpopup(1, 'select_item');
                    $("#draggScheduleID").draggable();
                    return;
                } else if (tileViewSelectedArray.length >= 1) {
                    getDevicesForPackage(gId);
                } else {
                    return false;
                }
            }
        }

        function getSelectedIds() {
            return SelectedIdOnGlobale;
        }

        self.ContentInfo = ko.observable();
        self.fileName = ko.observable();
        self.previewImage = ko.observable();
        self.DownloadUrl = ko.observable();
        self.fileVideo = ko.observable(false);
        self.fileAudio = ko.observable(false);
        self.fileImg = ko.observable(false);
        self.openContentInfo = function (data) {
            var fileSizeKb = (data.FileSize) / 1024;
            var fileSizeKbDisp = (fileSizeKb.toFixed(2)) + "KB";
            data.fileSizeKbDisp = fileSizeKbDisp;
            self.ContentInfo(data);
            $('#contentInfo').modal('show');

            $('#mdlContentInfoItemHeader').mouseup(function () {
                $("#mdlContentInfoItem").draggable({ disabled: true });
            });

            $('#mdlContentInfoItemHeader').mousedown(function () {
                $("#mdlContentInfoItem").draggable({ disabled: false });
            });
        }
        self.stoppreview = function () {
            if (closeAudioPopup == 1) {
                var audioPlayer = document.getElementById('audioplayer');
                audioPlayer.pause();
                var t = '0';
                audioPlayer.setCurrentTime(t);
            }
        }

        //unload image preview on close icon
        self.stopImagePreview = function () {
            $("#carouselOneId").removeClass('active');
            $("#carouselTwoId").removeClass('active');
            $("#carouselThreeId").removeClass('active');
            $("#carouselFourId").removeClass('active');
            $("#carouselFiveId").removeClass('active');
            $("#carouselSixId").removeClass('active');
            $("#carouselSevenId").removeClass('active');
            $("#carouselEightId").removeClass('active');
            $("#carouselNineId").removeClass('active');
            $("#carouselTenId").removeClass('active');
            $("#carouselZeroId").addClass('active');

            $("#activeMX850Id").removeClass('active');
            $("#activeMX860Id").removeClass('active');
            $("#activeMX870Id").removeClass('active');
            $("#activeMX880Id").removeClass('active');
            $("#activeMX915Id").removeClass('active');
            $("#activeMX925Id").removeClass('active');
            $("#activeCarbonId").removeClass('active');
            $("#activeP200Id").removeClass('active');
            $("#activeP400Id").removeClass('active');
            $("#activeV200Id").removeClass('active');
            $("#activeMX760Id").addClass('active');

            $("#imagePreviewContent").css('left', '');
            $("#imagePreviewContent").css('top', '');
        }

        self.checkext = function (FileName) {
            var extension = FileName.substr((FileName.lastIndexOf('.') + 1));
            if (extension == "eet" || extension == "frm" || extension == "tgz") {
                return false;
            }
            else {
                return true;
            }
        }


        self.previewContentImg = function (data) {
            self.previewImage([]);
            self.fileName(previewFileName);
            $("#previewImageName").text(data.FileName);

            var extension = data.FileName.substr((data.FileName.lastIndexOf('.') + 1));
            extension = extension.toLowerCase();

            if (data.PreviewFileLocationURL != null && data.PreviewFileLocationURL != "") {
                self.previewImage(data.PreviewFileLocationURL);

                if (extension == 'mp3' || extension == 'wav') {
                    self.fileAudio(true);
                    self.fileImg(false);
                    self.fileVideo(false);

                    // audio player
                    audioPlayer = new MediaElementPlayer("#audioplayer", {
                        features: ['playpause', 'stop', 'current', 'progress', 'duration', 'volume'],
                        audioWidth: 567,
                        audioHeight: 60,
                        startVolume: 0.5,
                    });

                    audioPlayer.load();
                    audioPlayer.play();
                    closeAudioPopup = 1;
                    closeVideoPopup = 0;

                } else if (extension == 'wmv' || extension == 'avi' || extension == 'mpg' || extension == 'mp4') {
                    self.fileAudio(false);
                    self.fileImg(false);
                    self.fileVideo(true);
                    dispalyVideoOnPreview(data.PreviewFileLocationURL);
                    closeVideoPopup = 1;
                    closeAudioPopup = 0;
                }
                else if (extension == 'jpg' || extension == 'png' || extension == 'tiff' || extension == 'gif' || extension == 'bmp' || extension == 'pam') {
                    self.fileAudio(false);
                    self.fileImg(true);
                    self.fileVideo(false);
                    closeAudioPopup = 0;
                    closeVideoPopup = 0;
                } else {
                    return false;
                }
            } else {
                if (extension == 'jpg' || extension == 'png' || extension == 'tiff' || extension == 'gif' || extension == 'bmp' || extension == 'pam') {
                    self.fileAudio(false);
                    self.fileImg(true);
                    self.fileVideo(false);
                    closeAudioPopup = 0;
                    closeVideoPopup = 0;
                    self.previewImage('assets/images/no_image.jpg');
                } else {
                    openAlertpopup(1, 'preview_is_not_available_for_this_file');
                    return true;
                }
            }

            $('#imageContentPreview').modal('show');
        }

        //play video when click on preview    
        function dispalyVideoOnPreview(data) {
            $("#ID1").empty();
            var str = '<video id="videoShowID" class="video-js vjs-default-skin video-MX760" controls preload="auto" width="170" height="119"></video>';
            $("#ID1").append(str);
            player = videojs('videoShowID', {
                techOrder: ['flash', 'html5'],
                autoplay: true,
                components: { 'playToggle': {} },
                sources: [{
                    type: "video/flv",
                    src: data,
                }],
            });

            player.on("ended", function () {
                player.posterImage.show();
                player.currentTime(0).trigger('loadstart');
                player.pause();
            });
        }

        self.modelName = ko.observable('MX760');

        //click on button images change in video tab
        $("li").click(function () {
            var btnValue = $(this).val();
            if (btnValue == 0) {
                self.modelName('MX760');
                $("#modelTwo").removeClass('active');
                $("#modelThree").removeClass('active');
                $("#modelFour").removeClass('active');
                $("#modelFive").removeClass('active');
                $("#modelSix").removeClass('active');
                $("#modelSeven").removeClass('active');
                $("#modelEight").removeClass('active');
                $("#modelNine").removeClass('active');
                $("#modelTen").removeClass('active');
                $("#modelEleven").removeClass('active');
                $("#modelOne").addClass('active');

                $("#videoShowID").removeClass('video-MX850');
                $("#videoShowID").removeClass('video-MX860');
                $("#videoShowID").removeClass('video-MX870');
                $("#videoShowID").removeClass('video-MX880');
                $("#videoShowID").removeClass('video-MX915');
                $("#videoShowID").removeClass('video-MX925');
                $("#videoShowID").removeClass('video-V200C');
                $("#videoShowID").removeClass('video-P400');
                $("#videoShowID").removeClass('video-P200');
                $("#videoShowID").removeClass('video-CARBON10');              
                $("#videoShowID").addClass('video-MX760');
                $('#showImgID').prop('src', 'assets/images/sample-pic/device-img/760.jpg');
            }

            else if (btnValue == 1) {
                self.modelName('MX850');
                $("#modelOne").removeClass('active');
                $("#modelThree").removeClass('active');
                $("#modelFour").removeClass('active');
                $("#modelFive").removeClass('active');
                $("#modelSix").removeClass('active');
                $("#modelSeven").removeClass('active');
                $("#modelEight").removeClass('active');
                $("#modelNine").removeClass('active');
                $("#modelTen").removeClass('active');
                $("#modelEleven").removeClass('active');
                $("#modelTwo").addClass('active');

                $("#videoShowID").removeClass('video-MX760');
                $("#videoShowID").removeClass('video-MX860');
                $("#videoShowID").removeClass('video-MX870');
                $("#videoShowID").removeClass('video-MX880');
                $("#videoShowID").removeClass('video-MX915');
                $("#videoShowID").removeClass('video-MX925');
                $("#videoShowID").removeClass('video-V200C');
                $("#videoShowID").removeClass('video-P400');
                $("#videoShowID").removeClass('video-P200');
                $("#videoShowID").removeClass('video-CARBON10');           
                $("#videoShowID").addClass('video-MX850');
                $('#showImgID').prop('src', 'assets/images/sample-pic/device-img/850.jpg');
            }

            else if (btnValue == 2) {
                self.modelName('MX860');
                $("#modelOne").removeClass('active');
                $("#modelTwo").removeClass('active');
                $("#modelFour").removeClass('active');
                $("#modelFive").removeClass('active');
                $("#modelSix").removeClass('active');
                $("#modelSeven").removeClass('active');
                $("#modelEight").removeClass('active');
                $("#modelNine").removeClass('active');
                $("#modelTen").removeClass('active');
                $("#modelEleven").removeClass('active');
                $("#modelThree").addClass('active');

                $("#videoShowID").removeClass('video-MX760');
                $("#videoShowID").removeClass('video-MX870');
                $("#videoShowID").removeClass('video-MX880');
                $("#videoShowID").removeClass('video-MX915');
                $("#videoShowID").removeClass('video-MX925');
                $("#videoShowID").removeClass('video-MX850');
                $("#videoShowID").removeClass('video-V200C');
                $("#videoShowID").removeClass('video-P400');
                $("#videoShowID").removeClass('video-P200');
                $("#videoShowID").removeClass('video-CARBON10');         
                $("#videoShowID").addClass('video-MX860');
                $('#showImgID').prop('src', 'assets/images/sample-pic/device-img/860.jpg');
            }

            else if (btnValue == 3) {
                self.modelName('MX870');
                $("#modelOne").removeClass('active');
                $("#modelTwo").removeClass('active');
                $("#modelThree").removeClass('active');
                $("#modelFive").removeClass('active');
                $("#modelSix").removeClass('active');
                $("#modelSeven").removeClass('active');
                $("#modelEight").removeClass('active');
                $("#modelNine").removeClass('active');
                $("#modelTen").removeClass('active');
                $("#modelEleven").removeClass('active');
                $("#modelFour").addClass('active');

                $("#videoShowID").removeClass('video-MX760');
                $("#videoShowID").removeClass('video-MX880');
                $("#videoShowID").removeClass('video-MX915');
                $("#videoShowID").removeClass('video-MX925');
                $("#videoShowID").removeClass('video-MX850');
                $("#videoShowID").removeClass('video-MX860');
                $("#videoShowID").removeClass('video-V200C');
                $("#videoShowID").removeClass('video-P400');
                $("#videoShowID").removeClass('video-P200');
                $("#videoShowID").removeClass('video-CARBON10');            
                $("#videoShowID").addClass('video-MX870');
                $('#showImgID').prop('src', 'assets/images/sample-pic/device-img/870.jpg');
            }

            else if (btnValue == 4) {
                self.modelName('MX880');
                $("#modelOne").removeClass('active');
                $("#modelTwo").removeClass('active');
                $("#modelThree").removeClass('active');
                $("#modelFour").removeClass('active');
                $("#modelSix").removeClass('active');
                $("#modelSeven").removeClass('active');
                $("#modelEight").removeClass('active');
                $("#modelNine").removeClass('active');
                $("#modelTen").removeClass('active');
                $("#modelEleven").removeClass('active');
                $("#modelFive").addClass('active');

                $("#videoShowID").removeClass('video-MX760');
                $("#videoShowID").removeClass('video-MX870');
                $("#videoShowID").removeClass('video-MX915');
                $("#videoShowID").removeClass('video-MX925');
                $("#videoShowID").removeClass('video-MX850');
                $("#videoShowID").removeClass('video-MX860');
                $("#videoShowID").removeClass('video-V200C');
                $("#videoShowID").removeClass('video-P400');
                $("#videoShowID").removeClass('video-P200');
                $("#videoShowID").removeClass('video-CARBON10');               
                $("#videoShowID").addClass('video-MX880');
                $('#showImgID').prop('src', 'assets/images/sample-pic/device-img/880.jpg');
            }

            else if (btnValue == 5) {
                self.modelName('MX915');
                $("#modelOne").removeClass('active');
                $("#modelTwo").removeClass('active');
                $("#modelThree").removeClass('active');
                $("#modelFour").removeClass('active');
                $("#modelFive").removeClass('active');
                $("#modelSeven").removeClass('active');
                $("#modelEight").removeClass('active');
                $("#modelNine").removeClass('active');
                $("#modelTen").removeClass('active');
                $("#modelEleven").removeClass('active');
                $("#modelSix").addClass('active');

                $("#videoShowID").removeClass('video-MX760');
                $("#videoShowID").removeClass('video-MX870');
                $("#videoShowID").removeClass('video-MX925');
                $("#videoShowID").removeClass('video-MX850');
                $("#videoShowID").removeClass('video-MX860');
                $("#videoShowID").removeClass('video-MX880');
                $("#videoShowID").removeClass('video-V200C');
                $("#videoShowID").removeClass('video-P400');
                $("#videoShowID").removeClass('video-P200');
                $("#videoShowID").removeClass('video-CARBON10');              
                $("#videoShowID").addClass('video-MX915');
                $('#showImgID').prop('src', 'assets/images/sample-pic/device-img/915.jpg');
            }

            else if (btnValue == 6) {
                self.modelName('MX925');
                $("#modelOne").removeClass('active');
                $("#modelTwo").removeClass('active');
                $("#modelThree").removeClass('active');
                $("#modelFour").removeClass('active');
                $("#modelFive").removeClass('active');
                $("#modelSix").removeClass('active');
                $("#modelEight").removeClass('active');
                $("#modelNine").removeClass('active');
                $("#modelTen").removeClass('active');
                $("#modelEleven").removeClass('active');
                $("#modelSeven").addClass('active');

                $("#videoShowID").removeClass('video-MX760');
                $("#videoShowID").removeClass('video-MX870');
                $("#videoShowID").removeClass('video-MX880');
                $("#videoShowID").removeClass('video-MX860');
                $("#videoShowID").removeClass('video-MX850');
                $("#videoShowID").removeClass('video-MX915');
                $("#videoShowID").removeClass('video-V200C');
                $("#videoShowID").removeClass('video-P400');
                $("#videoShowID").removeClass('video-P200');
                $("#videoShowID").removeClass('video-CARBON10');
                $("#videoShowID").addClass('video-MX925');
                $('#showImgID').prop('src', 'assets/images/sample-pic/device-img/925.jpg');
            }

            else if (btnValue == 7) {
                self.modelName('Carbon10');
                $("#modelOne").removeClass('active');
                $("#modelTwo").removeClass('active');
                $("#modelThree").removeClass('active');
                $("#modelFour").removeClass('active');
                $("#modelFive").removeClass('active');
                $("#modelSix").removeClass('active');
                $("#modelSeven").removeClass('active');
                $("#modelNine").removeClass('active');
                $("#modelTen").removeClass('active');
                $("#modelEleven").removeClass('active');
                $("#modelEight").addClass('active');

                $("#videoShowID").removeClass('video-MX760');
                $("#videoShowID").removeClass('video-MX870');
                $("#videoShowID").removeClass('video-MX880');
                $("#videoShowID").removeClass('video-MX860');
                $("#videoShowID").removeClass('video-MX850');
                $("#videoShowID").removeClass('video-MX915');
                $("#videoShowID").removeClass('video-MX925');
                $("#videoShowID").removeClass('video-V200C');
                $("#videoShowID").removeClass('video-P400');
                $("#videoShowID").removeClass('video-P200'); 
                $("#videoShowID").addClass('video-CARBON10');                
                $('#showImgID').prop('src', 'assets/images/sample-pic/device-img/Carbon10.png');
            }

            else if (btnValue == 8) {
                self.modelName('P200');
                $("#modelOne").removeClass('active');
                $("#modelTwo").removeClass('active');
                $("#modelThree").removeClass('active');
                $("#modelFour").removeClass('active');
                $("#modelFive").removeClass('active');
                $("#modelSix").removeClass('active');
                $("#modelSeven").removeClass('active');
                $("#modelEight").removeClass('active');
                $("#modelTen").removeClass('active');
                $("#modelEleven").removeClass('active');
                $("#modelNine").addClass('active');

                $("#videoShowID").removeClass('video-MX760');
                $("#videoShowID").removeClass('video-MX870');
                $("#videoShowID").removeClass('video-MX880');
                $("#videoShowID").removeClass('video-MX860');
                $("#videoShowID").removeClass('video-MX850');
                $("#videoShowID").removeClass('video-MX915');
                $("#videoShowID").removeClass('video-MX925');
                $("#videoShowID").removeClass('video-CARBON10');
                $("#videoShowID").removeClass('video-V200C');
                $("#videoShowID").removeClass('video-P400');
                $("#videoShowID").addClass('video-P200'); 
                $('#showImgID').prop('src', 'assets/images/sample-pic/device-img/P200.png');
            }

            else if (btnValue == 9) {
                self.modelName('P400');
                $("#modelOne").removeClass('active');
                $("#modelTwo").removeClass('active');
                $("#modelThree").removeClass('active');
                $("#modelFour").removeClass('active');
                $("#modelFive").removeClass('active');
                $("#modelSix").removeClass('active');
                $("#modelSeven").removeClass('active');
                $("#modelEight").removeClass('active');
                $("#modelNine").removeClass('active');
                $("#modelEleven").removeClass('active');
                $("#modelTen").addClass('active');

                $("#videoShowID").removeClass('video-MX760');
                $("#videoShowID").removeClass('video-MX870');
                $("#videoShowID").removeClass('video-MX880');
                $("#videoShowID").removeClass('video-MX860');
                $("#videoShowID").removeClass('video-MX850');
                $("#videoShowID").removeClass('video-MX915');
                $("#videoShowID").removeClass('video-MX925');
                $("#videoShowID").removeClass('video-CARBON10'); 
                $("#videoShowID").removeClass('video-P200'); 
                $("#videoShowID").removeClass('video-V200C'); 
                $("#videoShowID").addClass('video-P400'); 
                $('#showImgID').prop('src', 'assets/images/sample-pic/device-img/P400.png');
            }

            else if (btnValue == 10) {
                self.modelName('V200c');
                $("#modelOne").removeClass('active');
                $("#modelTwo").removeClass('active');
                $("#modelThree").removeClass('active');
                $("#modelFour").removeClass('active');
                $("#modelFive").removeClass('active');
                $("#modelSix").removeClass('active');
                $("#modelSeven").removeClass('active');
                $("#modelEight").removeClass('active');
                $("#modelNine").removeClass('active');
                $("#modelTen").removeClass('active');
                $("#modelEleven").addClass('active');

                $("#videoShowID").removeClass('video-MX760');
                $("#videoShowID").removeClass('video-MX870');
                $("#videoShowID").removeClass('video-MX880');
                $("#videoShowID").removeClass('video-MX860');
                $("#videoShowID").removeClass('video-MX850');
                $("#videoShowID").removeClass('video-MX915');
                $("#videoShowID").removeClass('video-MX925');
                $("#videoShowID").removeClass('video-CARBON10');
                $("#videoShowID").removeClass('video-P200');
                $("#videoShowID").removeClass('video-P400'); 
                $("#videoShowID").addClass('video-V200C'); 

                $('#showImgID').prop('src', 'assets/images/sample-pic/device-img/V200c.png');
            }
        });

        // close video tab on close button
        self.stopVideo = function () {
            if (closeVideoPopup == 1) {
                //close video player               
                var oldPlayer = document.getElementById('videoShowID');
                videojs(oldPlayer).dispose();

                self.modelName('MX760');
                $("#modelTwo").removeClass('active');
                $("#modelThree").removeClass('active');
                $("#modelFour").removeClass('active');
                $("#modelFive").removeClass('active');
                $("#modelSix").removeClass('active');
                $("#modelSeven").removeClass('active');
                $("#modelEight").removeClass('active');
                $("#modelNine").removeClass('active');
                $("#modelTen").removeClass('active');
                $("#modelEleven").addClass('active');
                $("#modelOne").addClass('active');

                $("#videoShowID").removeClass('video-MX850');
                $("#videoShowID").removeClass('video-MX860');
                $("#videoShowID").removeClass('video-MX870');
                $("#videoShowID").removeClass('video-MX880');
                $("#videoShowID").removeClass('video-MX915');
                $("#videoShowID").removeClass('video-MX925');
                $("#videoShowID").addClass('video-MX760');
                $('#showImgID').prop('src', 'assets/images/sample-pic/device-img/760.jpg');
            }

        }

        editData = {};
        self.selectContent = function (data, packageid, index) {
            var id = '#contentLI' + index + '';
            if (cntrlIsPressed) {
                if ($(id).hasClass('selected')) {
                    self.totalselectedTileView(self.totalselectedTileView() - 1)
                    $(id).removeClass('selected');
                    tileViewSelectedArray = jQuery.grep(tileViewSelectedArray, function (value) {
                        return value != packageid;

                    });
                    tileViewSelectedDataArray = jQuery.grep(tileViewSelectedDataArray, function (value) {
                        return value != data;
                    });
                    //one
                } else {
                    self.totalselectedTileView(self.totalselectedTileView() + 1)
                    $(id).addClass('selected');
                    if ($.inArray(packageid, tileViewSelectedArray) < 0) {
                        tileViewSelectedArray.push(packageid);
                        //one
                    }
                    if ($.inArray(data, tileViewSelectedDataArray) < 0) {
                        tileViewSelectedDataArray.push(data);
                        //one
                    }
                }

            } else {

                if ($(id).hasClass('selected')) {
                    $(id).removeClass('selected');
                    $('.tileswrapper').children('li').removeClass('selected');
                    self.totalselectedTileView(0)
                    tileViewSelectedArray = [];
                    tileViewSelectedDataArray = [];
                } else {
                    $('.tileswrapper').children('li').removeClass('selected');
                    $(id).addClass('selected');
                    self.totalselectedTileView(0)
                    self.totalselectedTileView(self.totalselectedTileView() + 1)
                    tileViewSelectedArray = [];
                    tileViewSelectedArray.push(packageid);
                    //one
                    tileViewSelectedDataArray = [];
                    tileViewSelectedDataArray.push(data);

                }
            }

            var pageName = "ContentLibrary";
            var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
            if (PageStorage) {
                PageStorage[0].selectedDataArr = tileViewSelectedArray;
                PageStorage[0].multiRowData = tileViewSelectedDataArray;

                var updatedPageStorage = JSON.stringify(PageStorage);
                window.sessionStorage.setItem(pageName + 'PageStorage', updatedPageStorage);
            }

            globalVariableForEditContent = tileViewSelectedDataArray;
            selectedRowID.push(packageid);
			editData = data;
        }

        if (gridStorage) {
            if (gridStorage[0].iscontentGrid != 1) {



                checkloadingforContent = 0;
                checktileviewforloading = 0;
                $("#gridView").hide();
                $("#tileView").show();
                self.isGridVisible(false);
                self.isTilesVisible(true);
                checkthumbnailview = true;
                //self.tilePageNo(1);
                $('.tileswrapper').children('li').removeClass('selected');
                var pageName = "ContentLibrary";
                var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
                if (PageStorage) {
                    if (PageStorage[0].selectedDataArr != undefined) {
                        self.totalselectedTileView(PageStorage[0].selectedDataArr.length);
                    }
                } else {

                    self.totalselectedTileView(0);
                }
                tileViewSelectedArray = [];
                tileViewSelectedDataArray = [];
                koUtil.isThumbnailViewActive = 1;
                filterobjforContent = '';

                //var pageName = "ContentLibrary";
                //var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
                //if (PageStorage) {
                //    PageStorage[0].columnSortFilter = filterobjforContent;

                //    var updatedPageStorage = JSON.stringify(PageStorage);
                //    window.sessionStorage.setItem(pageName + 'PageStorage', updatedPageStorage);
                //}

                savedfilterObj = [];
                $("#filterThumbnail").prop('title', 'Change Filter');
                $("#iconFilter").removeClass('thumbnail-icon-color');

                //hide div user switch to tile view
                $("#audioDiv").hide();
                $("#videoDiv").hide();
                $("#imgDiv").hide();

            } else {
                checkloadingforContent = 1;
                checktileviewforloading = 1;
                $("#tileView").hide();
                $("#gridView").show();
                self.isGridVisible(true);
                self.isTilesVisible(false);
                checkthumbnailview = false;
                koUtil.isThumbnailViewActive = 0;
                //self.clearFilter('jqxgridContentlib');
                //$("#jqxgridContentlib").jqxGrid('updatebounddata');

                //hide div user switch to grid view
                self.fileVideo(false);
                self.fileAudio(false);
                self.fileImg(false);
            }
        } else {
        }


        var param = getContentParameters(false, columnSortFilterForContent, null, null, 0);
        contentLibraryGrid('jqxgridContentlib', param);



        function TileList() {
            var editPackage = new Object();
            var selectedarr = new Array();
            editPackage.selectedFileNameOnDevice = editData.DeviceFileNameAlias;
            editPackage.selectedDeviceFileLocation = editData.DeviceFileLocationAlias;
            editPackage.selectedTargetUser = editData.TargetUserAlias;
            editPackage.selectedDescription = editData.Description;
            editPackage.selectedFileName = editData.FileName;
            editPackage.selectedPackageName = editData.PackageName;
            editPackage.selectedFileVersion = editData.FileVersion;
			editPackage.selectedTags = editData.Tags;
            editPackage.selectedModels = editData.SupportedModels;
            editPackage.selectedFileUploadDate = editData.FileUploadDate;
            editPackage.selectedPackageId = editData.PackageId;
            selectedarr.push(editPackage);
            globalVariableForEditContent = selectedarr;
        }

        self.clearfilter = function () {
            $("#txtcontentName").val('');
            $("#txtfile").val('');
            $("#txtuploadedBy").val('');
            $("#txtfiletype").val('');
            $("#txtTags").val('');
            $("#txtFilesize").val('');
            $("#txtDescription").val('');
            $("#txtVersion").val('');
            $("#datepickerfrom").val('');
            $("#datepickerTo").val('');
            $("#datepickerfromlastused").val('');
            $("#datepickerTolastused").val('');
            $('#selectDeviceFileLocationLibrary').val('None').prop("selected", "selected");
            $('#selectDeviceFileLocationLibrary').trigger('chosen:updated');

        }
        // export to excel
        self.exportToExcel = function (isExport, gId) {
            var selectedContentItems = getSelectedUniqueId(gId);
            var unselectedContentItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getContentParameters(true, columnSortFilterForContent, selectedContentItems, unselectedContentItems, checkAll, visibleColumnsList);

            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.filterCheckTileView = ko.observable(false);
            self.exportflage = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                contentLibraryExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function contentLibraryExport(param, gId, openPopup) {
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


        $("#datepickerfrom").on('change', function () {
            if ($("#datepickerfrom").val() != null || $("#datepickerfrom").val() != '') {
                $("#datepickerTo").prop('disabled', false);
            } else {
                $("#datepickerTo").prop('disabled', true);
            }
        })
        $("#datepickerfromlastused").on('change', function () {
            if ($("#datepickerfromlastused").val() != null || $("#datepickerfromlastused").val() != '') {
                $("#datepickerTolastused").prop('disabled', false);
            } else {
                $("#datepickerTolastused").prop('disabled', true);
            }
        })

        self.Setfilter = function () {
            var FilterList = new Array();
            if ($("#txtcontentName").val() != '') {
                var ColumnFilter = new Object();
                ColumnFilter.FilterColumn = 'PackageName';
                ColumnFilter.FilterValue = $("#txtcontentName").val();
                FilterList.push(ColumnFilter);
            }
            //
            if ($("#txtfile").val() != '') {
                var ColumnFilter = new Object();
                ColumnFilter.FilterColumn = 'FileName';
                ColumnFilter.FilterValue = $("#txtfile").val();
                FilterList.push(ColumnFilter);
            }
            //

            //
            if ($("#txtfiletype").val() != '') {
                var ColumnFilter = new Object();
                ColumnFilter.FilterColumn = 'FileType';
                ColumnFilter.FilterValue = $("#txtfiletype").val();
                FilterList.push(ColumnFilter);
            }
            //
            if ($("#txtTags").val() != '') {
                var ColumnFilter = new Object();
                ColumnFilter.FilterColumn = 'Tags';
                ColumnFilter.FilterValue = $("#txtTags").val();
                FilterList.push(ColumnFilter);
            }
            //
            if ($("#txtFilesize").val() != '') {
                var ColumnFilter = new Object();
                ColumnFilter.FilterColumn = 'FileSizeInMB';
                ColumnFilter.FilterValue = $("#txtFilesize").val();
                FilterList.push(ColumnFilter);
            }
            //
            if ($("#txtDescription").val() != '') {
                var ColumnFilter = new Object();
                ColumnFilter.FilterColumn = 'Description';
                ColumnFilter.FilterValue = $("#txtDescription").val();
                FilterList.push(ColumnFilter);
            }
            //
            if ($("#selectDeviceFileLocationLibrary").find('option:selected').text() == 'None' || $("#selectDeviceFileLocationLibrary").find('option:selected').text() == '') {

            } else {

                var ColumnFilter = new Object();
                ColumnFilter.FilterColumn = 'DeviceFileLocationAlias';
                ColumnFilter.FilterValue = $("#selectDeviceFileLocationLibrary").find('option:selected').val();
                FilterList.push(ColumnFilter);
            }
            //

            if ($("#txtVersion").val() != '') {
                var ColumnFilter = new Object();
                ColumnFilter.FilterColumn = 'FileVersion';
                ColumnFilter.FilterValue = $("#txtVersion").val();
                FilterList.push(ColumnFilter);
            }

            if ($("#datepickerfrom").val() == '' && $("#datepickerTo").val() == '') {
            } else if ($("#datepickerfrom").val() != '' && $("#datepickerTo").val() == '') {

                var dateTo = $("#datepickerfrom").val();
                $("#datepickerTo").val(dateTo);

                var ColumnFilter = new Object();
                ColumnFilter.ColumnType = 'Date';
                ColumnFilter.FilterColumn = 'FileUploadDate';
                ColumnFilter.FilterValue = $("#datepickerfrom").val();
                ColumnFilter.FilterValueOptional = $("#datepickerTo").val();
                ColumnFilter.IsFixedDateRange = true;
                FilterList.push(ColumnFilter);
            } else if ($("#datepickerfrom").val() == '' && $("#datepickerTo").val() != '') {
                var fromDate = $("#datepickerTo").val();
                $("#datepickerfrom").val(fromDate);

                var ColumnFilter = new Object();
                ColumnFilter.ColumnType = 'Date';
                ColumnFilter.FilterColumn = 'FileUploadDate';
                ColumnFilter.FilterValue = $("#datepickerfrom").val();
                ColumnFilter.FilterValueOptional = $("#datepickerTo").val();
                ColumnFilter.IsFixedDateRange = true;
                FilterList.push(ColumnFilter);
            } else {
                var ColumnFilter = new Object();
                ColumnFilter.ColumnType = 'Date';
                ColumnFilter.FilterColumn = 'FileUploadDate';
                ColumnFilter.FilterValue = $("#datepickerfrom").val();
                ColumnFilter.FilterValueOptional = $("#datepickerTo").val();
                ColumnFilter.IsFixedDateRange = true;
                FilterList.push(ColumnFilter);
            }

            //
            if ($("#datepickerfromlastused").val() == '' && $("#datepickerTolastused").val() == '') {
            } else if ($("#datepickerfromlastused").val() != '' && $("#datepickerTolastused").val() == '') {

                var dateTo = $("#datepickerfromlastused").val();
                $("#datepickerTolastused").val(dateTo);

                var ColumnFilter = new Object();
                ColumnFilter.ColumnType = 'Date';
                ColumnFilter.FilterColumn = 'LastUsedDate';
                ColumnFilter.FilterValue = $("#datepickerfromlastused").val();
                ColumnFilter.FilterValueOptional = $("#datepickerTolastused").val();
                ColumnFilter.IsFixedDateRange = true;
                FilterList.push(ColumnFilter);
            } else if ($("#datepickerfromlastused").val() == '' && $("#datepickerTolastused").val() != '') {

                var fromDate = $("#datepickerTolastused").val();
                $("#datepickerfromlastused").val(fromDate);

                var ColumnFilter = new Object();
                ColumnFilter.ColumnType = 'Date';
                ColumnFilter.FilterColumn = 'LastUsedDate';
                ColumnFilter.FilterValue = $("#datepickerfromlastused").val();
                ColumnFilter.FilterValueOptional = $("#datepickerTolastused").val();
                ColumnFilter.IsFixedDateRange = true;
                FilterList.push(ColumnFilter);
            } else {
                var ColumnFilter = new Object();
                ColumnFilter.ColumnType = 'Date';
                ColumnFilter.FilterColumn = 'LastUsedDate';
                ColumnFilter.FilterValue = $("#datepickerfromlastused").val();
                ColumnFilter.FilterValueOptional = $("#datepickerTolastused").val();
                ColumnFilter.IsFixedDateRange = true;
                FilterList.push(ColumnFilter);
            }
            //d
            filterobjforContent = FilterList;

            var str = '';
            if (FilterList && FilterList.length > 0) {
                if ($("#txtcontentName").val() != null && $("#txtcontentName").val() != '')
                    str += 'Content Name=' + $("#txtcontentName").val();
                if ($("#txtfile").val() != null && $("#txtfile").val() != '')
                    str += '\n File Name=' + $("#txtfile").val();
                if ($("#txtuploadedBy").val() != null && $("#txtuploadedBy").val() != '')
                    str += '\n Uploaded By=' + $("#txtuploadedBy").val();
                if ($("#txtfiletype").val() != null && $("#txtfiletype").val() != '')
                    str += '\n File Type=' + $("#txtfiletype").val();
                if ($("#txtTags").val() != null && $("#txtTags").val() != '')
                    str += '\n Tags=' + $("#txtTags").val();
                if ($("#txtDescription").val() != null && $("#txtDescription").val() != '')
                    str += '\n Description=' + $("#txtDescription").val();
                if ($("#txtVersion").val() != null && $("#txtVersion").val() != '')
                    str += '\n File Version=' + $("#txtVersion").val();
                if ($("#txtFilesize").val() != null && $("#txtFilesize").val() != '')
                    str += '\n File Size=' + $("#txtFilesize").val();
                if ($("#selectDeviceFileLocationLibrary").find('option:selected').val() != null && $("#selectDeviceFileLocationLibrary").find('option:selected').val() != '')
                    str += '\n Device File location=' + $("#selectDeviceFileLocationLibrary").find('option:selected').val();
                if ($("#datepickerfrom").val() != null && $("#datepickerfrom").val() != '')
                    str += '\n Date Uploaded From=' + $("#datepickerfrom").val();
                if ($("#datepickerTo").val() != null && $("#datepickerTo").val() != '')
                    str += '\n Date Uploaded To=' + $("#datepickerTo").val();
                if ($("#datepickerfromlastused").val() != null && $("#datepickerfromlastused").val() != '')
                    str += '\n Last Used Date From=' + $("#datepickerfromlastused").val();
                if ($("#datepickerTolastused").val() != null && $("#datepickerTolastused").val() != '')
                    str += '\n Last Used Date To=' + $("#datepickerTolastused").val();

                $("#filterThumbnail").prop('title', str);
            } else {
                $("#filterThumbnail").prop('title', 'Change Filter');
            }

            var pageName = "ContentLibrary";
            var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
            if (PageStorage) {
                PageStorage[0].columnSortFilter = FilterList;

                var updatedPageStorage = JSON.stringify(PageStorage);
                window.sessionStorage.setItem(pageName + 'PageStorage', updatedPageStorage);
            }

            if (filterobjforContent != '') {
                $("#iconFilter").addClass('thumbnail-icon-color');
                self.tilePageNo(1);
                getContentLibraryData(filterobjforContent, self.contentTilesData, self.tilepaginationData, self.totalTilerow, self.totalTilePage, self.tilePageNo, self.tileshowing, self.tilevisibleRow);
            } else {
                $("#iconFilter").removeClass('thumbnail-icon-color');
                self.tilePageNo(1);
                getContentLibraryData(null, self.contentTilesData, self.tilepaginationData, self.totalTilerow, self.totalTilePage, self.tilePageNo, self.tileshowing, self.tilevisibleRow);
            }
            $("#filtterPopup").modal('hide');
            savedfilterObj = FilterList;
            repositionAdvanceSearchPopUp("filterpopupcantainer");

        }

        $("#filterThumbnail").prop('title', 'Change Filter');

        self.setfiterobjforpopup = function () {

            var pageName = "ContentLibrary";
            var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
            if (PageStorage) {
                savedfilterObj = PageStorage[0].columnSortFilter;

            }


            if (savedfilterObj) {
                for (var i = 0; i < savedfilterObj.length; i++) {

                    if (savedfilterObj[i].FilterColumn == 'PackageName') {
                        $("#txtcontentName").val(savedfilterObj[i].FilterValue);
                    }
                    if (savedfilterObj[i].FilterColumn == 'FileName') {
                        $("#txtfile").val(savedfilterObj[i].FilterValue);
                    }
                    if (savedfilterObj[i].FilterColumn == 'FileType') {
                        $("#txtfiletype").val(savedfilterObj[i].FilterValue);
                    }
                    if (savedfilterObj[i].FilterColumn == 'Tags') {
                        $("#txtTags").val(savedfilterObj[i].FilterValue);
                    }
                    if (savedfilterObj[i].FilterColumn == 'FileSizeInMB') {
                        $("#txtFilesize").val(savedfilterObj[i].FilterValue);
                    }
                    if (savedfilterObj[i].FilterColumn == 'Description') {
                        $("#txtDescription").val(savedfilterObj[i].FilterValue);
                    }
                    if (savedfilterObj[i].FilterColumn == 'DeviceFileLocationAlias') {
                        //$("#selectDeviceFileLocationLibrary").find('option:selected').val(savedfilterObj[i].FilterValue);
                        $('#selectDeviceFileLocationLibrary').val(savedfilterObj[i].FilterValue).prop("selected", "selected");
                        $("#selectDeviceFileLocationLibrary").trigger('chosen:updated');
                    }
                    if (savedfilterObj[i].FilterColumn == 'FileVersion') {
                        $("#txtVersion").val(savedfilterObj[i].FilterValue);
                    }
                    if (savedfilterObj[i].FilterColumn == 'FileUploadDate') {
                        $("#datepickerfrom").val(savedfilterObj[i].FilterValue);
                        $("#datepickerTo").val(savedfilterObj[i].FilterValueOptional);
                        $("#datepickerTo").removeAttr('disabled');
                    }
                    if (savedfilterObj[i].FilterColumn == 'LastUsedDate') {
                        $("#datepickerfromlastused").val(savedfilterObj[i].FilterValue);
                        $("#datepickerTolastused").val(savedfilterObj[i].FilterValueOptional);
                        $("#datepickerTolastused").removeAttr('disabled');
                    }

                    //


                }
            }

        }

        self.closedFilterdata = function () {
            $("#filtterPopup").modal('hide');
            $("#datepickerTolastused").prop('disabled', true);
            $("#datepickerTo").prop('disabled', true);
            $("#filtterPopup").css('left', '');
            $("#filtterPopup").css('top', '');
            self.clearfilter();
            repositionAdvanceSearchPopUp("filterpopupcantainer");
        }

        function editButtonClick(gID) {
            var source = getMultiSelectedData(gID);
            var selectedarr = new Array();
            for (var i = 0; i < source.length; i++) {
                var editPackage = new Object();
                editPackage.selectedFileNameOnDevice = source[i].DeviceFileNameAlias
                editPackage.selectedDeviceFileLocation = source[i].DeviceFileLocationAlias;
                editPackage.selectedTargetUser = source[i].TargetUserAlias;
                editPackage.selectedDescription = source[i].Description;
                editPackage.selectedFileName = source[i].FileName;
                editPackage.selectedPackageName = source[i].PackageName;
                editPackage.selectedFileVersion = source[i].FileVersion;
                editPackage.selectedTags = source[i].Tags;
                editPackage.selectedFileUploadDate = source[i].FileUploadDate;
				editPackage.selectedPackageId = source[i].PackageId;
				editPackage.selectedModels = source[i].SupportedModels;
                selectedarr.push(editPackage);
                globalVariableForEditContent = selectedarr;
            }
        }


        function deleteButtonClick(gID, check) {
            var selectedDeleteIds = getSelectedUniqueId(gID);
            var selectedData = getMultiSelectedData(gID);
            var unSelecedRowID = getUnSelectedUniqueId(gID);
            var checkAll = checkAllSelected(gID);
            var selectedarr = new Array();
            var editPackage = new Object();
            var selectedsource = _.where(selectedData, { PackageId: selectedDeleteIds[0] });
            if (checkAll == 1) {
                editPackage.selectedRowID = null;
                editPackage.unSelecedRowID = unSelecedRowID;
                editPackage.selectedData = selectedData;
            }
            else {
                editPackage.packageName = selectedsource[0].PackageName;
                editPackage.selectedRowID = selectedDeleteIds;
                editPackage.unSelecedRowID = null;
            }

            editPackage.checkAll = checkAll;
            selectedarr.push(editPackage);
            globalVariableForEditContent = selectedarr;
        }

        function deleteTileList(selectedData) {

            var selectedarr = new Array();
            for (var i = 0; i < selectedData.length; i++) {
                var editPackage = new Object();
                editPackage.packageName = selectedData[i].PackageName;
                editPackage.selectedRowID = selectedData[i].PackageId;
                editPackage.unSelecedRowID = null;
                editPackage.checlAll = 0;
                selectedarr.push(editPackage);
            }

            globalVariableForEditContent = selectedarr;
        }

        self.deleteAllLibrary = function (refershTileview) {
            var selecteItemIds = new Array();
            var unSelectedIds = new Array();
            for (var i = 0; i < globalVariableForEditContent.length; i++) {
                if (globalVariableForEditContent[i].checkAll == 1) {
                    selecteItemIds = null;
                    unSelectedIds = globalVariableForEditContent[i].unSelecedRowID;
                } else {
                    if (checkthumbnailview == true) {
                        for (var i = 0; i < globalVariableForEditContent.length; i++) {
                            selecteItemIds.push(globalVariableForEditContent[i].selectedRowID);
                        }
                        unSelectedIds = null;
                    } else {
                        selecteItemIds = globalVariableForEditContent[i].selectedRowID;
                        unSelectedIds = null;

                    }
                }
            }
            deletePackage(selecteItemIds, unSelectedIds, refershTileview);
        }

        function deletePackage(selecteDeleteIds, unSelectedDeleteIds, refershTileview) {
            var deletePackageReq = new Object();
            var Selector = new Object();
            Selector.SelectedItemIds = selecteDeleteIds;
            Selector.UnSelectedItemIds = unSelectedDeleteIds;

            deletePackageReq.PackageType = 2;
            deletePackageReq.Selector = Selector;
            deletePackageReq.IsDeleteAssociated = true;
            deletePackageReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        gridRefreshClearSelection('jqxgridContentlib');
                        $('#addLibraryModal').modal('hide');
                        openAlertpopup(0, 'alert_package_delete_success');

                        self.tilePageNo(1);
                        tileViewSelectedArray = [];
                        globalVariableForEditContent = [];
                        self.totalselectedTileView(0);
                        getContentLibraryData(filterobjforContent, self.contentTilesData, self.tilepaginationData, self.totalTilerow, self.totalTilePage, self.tilePageNo, self.tileshowing, self.tilevisibleRow);
                    }
                }
            }
            var method = 'DeletePackage';
            var params = '{"token":"' + TOKEN() + '","deletePackageReq":' + JSON.stringify(deletePackageReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        function getDevicesForPackage(gID) {
            var selectedItemData = getMultiSelectedData('jqxgridContentlib');
            var selectedItems = getSelectedPackageId('jqxgridContentlib');
            var unSelectedItems = getUnSelectedPackageId('jqxgridContentlib');
            var checkAll = checkAllSelected('jqxgridContentlib');
            var DeviceSearch = new Object();
            var Pagination = new Object();
            var selector = new Object();
            var Export = new Object();
            var EPackage = new Object();

            var packageIds = new Array();
            var schedulePackages = new Object();
            globalSchedulePackages = new Array();

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

            if (self.isGridVisible()) {

                for (var i = 0; i < selectedItems.length; i++) {
                    EPackage = new Object();
                    EPackage.PackageId = selectedItemData[i].PackageId;
                    EPackage.PackageName = selectedItemData[i].PackageName;
                    packageIds.push(EPackage);
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


            }
            else {
                for (var i = 0; i < tileViewSelectedArray.length; i++) {
                    EPackage = { PackageId: tileViewSelectedDataArray[i].PackageId, PackageName: tileViewSelectedDataArray[i].PackageName }
                    packageIds.push(EPackage);
                }

                if (tileViewSelectedArray.length == self.totalTilerow()) {
                    globalVariableForSelectedPackages = null;
                    globalVariableForUnselectedPackages = null;
                    selector.SelectedItemIds = null;
                    selector.UnSelectedItemIds = null;
                }
                else {
                    selector.SelectedItemIds = tileViewSelectedArray;
                    selector.UnSelectedItemIds = null;
                    globalVariableForSelectedPackages = tileViewSelectedArray;
                    globalVariableForUnselectedPackages = null;
                }
            }

            globalSchedulePackages = packageIds;

            getDevicesForPackageReq.PackageType = ENUM.get('Content');
            getDevicesForPackageReq.Pagination = Pagination;
            getDevicesForPackageReq.DeviceSearch = DeviceSearch;
            getDevicesForPackageReq.ParentColumnSortFilter = koUtil.GlobalColumnFilter;
            getDevicesForPackageReq.Selector = selector;
            getDevicesForPackageReq.Export = Export;

            function callBackfunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        setscheduleAdstorageFromDeviceSearch('jqxgridForSelectedDevicesdownloads');
                        scheduleOption = "scheduleContent";
                        isFromContentLibrary = true;
                        isFromDownloadLibrary = false;
                        redirectToLocation(menuJsonData, 'scheduleDelivery');
                    }
                    else if (data.responseStatus.StatusCode == AppConstants.get('No_Eligible_Device_Exists')) {
                        openAlertpopup(1, "selected_contents_do_not_have_common_models");
                    }
                }
            }

            var method = 'GetDevicesForPackage';
            var params = '{"token":"' + TOKEN() + '", "getDevicesForPackageReq":' + JSON.stringify(getDevicesForPackageReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        seti18nResourceData(document, resourceStorage);
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

    function contentLibraryGrid(gID, param) {
        //calculate height of grid
        var gridheight = $(window).height();
        var percentValue;
        if (gridheight > 600) {
            percentValue = (20 / 100) * gridheight;
            gridheight = gridheight - 150;

            gridheight = gridheight - percentValue + 'px';


        } else {
            gridheight = '400px';
        }
        ////////////////

        //alert('inital call ' + gridStorage[0].iscontentGrid);
        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        //alert('inital call ' + gridStorage[0].iscontentGrid);
        ////for grid local storage//
        //var gridStorageArr = new Array();
        //var gridStorageObj = new Object();
        //gridStorageObj.checkAllFlag = 0;
        //gridStorageObj.counter = 0;
        //gridStorageObj.filterflage = 0;
        //gridStorageObj.selectedDataArr = [];
        //gridStorageObj.unSelectedDataArr = [];
        //gridStorageObj.singlerowData = [];
        //gridStorageObj.multiRowData = [];
        //gridStorageObj.TotalSelectionCount = null;
        //gridStorageObj.highlightedRow = null;
        //gridStorageObj.highlightedPage = null;
        //gridStorageArr.push(gridStorageObj);
        //var gridStorage = JSON.stringify(gridStorageArr);
        //window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
        //var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

        var source =
            {
                dataType: "json",
                dataFields: [
                    { name: 'PackageId', map: 'PackageId' },
                    { name: 'ThumbnailLocationURL', map: 'ThumbnailLocationURL' },
                    { name: 'PackageName', map: 'PackageName' },
                    { name: 'DownloadUrl', map: 'DownloadUrl' },
                    { name: 'FileName', map: 'FileName' },
                    { name: 'FileSizeInMB', map: 'FileSizeInMB' },
                    { name: 'FileType', map: 'FileType' },
                    { name: 'Description', map: 'Description' },
                    { name: 'FileVersion', map: 'FileVersion' },
                    { name: 'PreviewFileLocationURL', map: 'PreviewFileLocationURL' },
                    { name: 'Tags', map: 'Tags' },
                    { name: 'FileUploadDate', map: 'FileUploadDate', type: 'date' },
                    { name: 'FullName', map: 'UserInfo>FullName' },
                    { name: 'DeviceFileLocationAlias', map: 'DeviceFileLocationAlias' },
                    { name: 'TargetUserAlias', map: 'TargetUserAlias' },
                    { name: 'DeviceFileNameAlias', map: 'DeviceFileNameAlias' },
					{ name: 'LastUsedDate', map: 'LastUsedDate', type: 'date' },
					{ name: 'SupportedModels', map: 'SupportedModels'},
                    { name: 'isSelected', type: 'number' }

                ],
                root: 'Packages',
                type: "POST",
                data: param,
                url: AppConstants.get('API_URL') + "/GetPackages",
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data.getPackagesResp)
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
                    //alert('2');
                    //alert(checkloadingforContent);
                    if (checkloadingforContent == 0 && checktileviewforloading == 0) {
                        $("#loader1").show();
                        checkloadingforContent = 1;
                    }
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    var columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForContent, gID, gridStorage, 'ContentLibrary');
                    koUtil.GlobalColumnFilter = columnSortFilter;
                    param.getPackagesReq.ColumnSortFilter = columnSortFilter;
                    param.getPackagesReq.Pagination = getPaginationObject(param.getPackagesReq.Pagination, gID);

                    updatepaginationOnState(gID, gridStorage, param.getPackagesReq.Pagination, null, null);

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    //alert('3');
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    if (data) {
                        if (data.getPackagesResp && (data.getPackagesResp.Packages || data.getPackagesResp.PaginationResponse)) {

                            if (data.getPackagesResp && data.getPackagesResp.Packages) {
                                for (var i = 0; i < data.getPackagesResp.Packages.length; i++) {
                                    data.getPackagesResp.Packages[i].FileUploadDate = convertToLocaltimestamp(data.getPackagesResp.Packages[i].FileUploadDate);
                                    data.getPackagesResp.Packages[i].LastUsedDate = convertToLocaltimestamp(data.getPackagesResp.Packages[i].LastUsedDate);
                                }
                            }
                            //if (data.getPackagesResp.PaginationResponse && data.getPackagesResp.PaginationResponse.HighLightedItemPage > 0) {
                            //    source.totalrecords = data.getPackagesResp.PaginationResponse.TotalRecords;
                            //    source.totalpages = data.getPackagesResp.PaginationResponse.TotalPages;
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
					setTimeout(function () {
						$("#loader1").hide();
					}, 5000);
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                    $("#loader1").hide();
                    openAlertpopup(2, 'network_error');
                }
            }
        );



        var imagerenderer = function (row, datafield, value) {
            var selectedFileName = $("#" + gID).jqxGrid('getcellvalue', row, "FileName");
            var selectedDownloadUrl = $("#" + gID).jqxGrid('getcellvalue', row, "DownloadUrl");
            if (selectedFileName) {
                var fileExt = selectedFileName.split('.').pop();
                if (fileExt == "mp3" || fileExt == "wav" || fileExt == "eet" || fileExt == "frm" || fileExt == "tgz") {
                    return '<img id="imageId" style="margin-left: 5px; width:50px; height:32px" src="assets/images/no_image.jpg"/>';
                } else {
                    if (selectedDownloadUrl) {
                        return '<img id="imageId" style="margin-left: 5px; width:50px; height:32px" src="' + value + '"/><a class="btn default" title="Download to PC" id="downloadToPc" tabindex="0" onClick=saveFileFromGrid("' + encodeURIComponent(selectedFileName) + '","' + encodeURIComponent(selectedDownloadUrl) + '")><i class="icon-download3"></i></a>';
                    }
                }
            }
        }

        var Aplicationrender = function (row, columnfield, value, defaulthtml, columnproperties) {
            var isAutomation = $("#" + gID).jqxGrid('getcellvalue', row, 'IsEnabledForAutomation');
            var packageID = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageId');
            var packagemode = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageMode');
            if (isAutomation == 'Allowed') {
                var html = '<div  style="height:100px;cursor:pointer;text-align:center"><a  title="view Aplication" tabindex="0"  onclick=AplicationViewPopup(' + packageID + ',"' + packagemode + '") role="button" >VIEW</a></div>';
                return html;
            } else {
            }
        }

        var previewRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            previewImg = $("#" + gID).jqxGrid('getcellvalue', row, 'PreviewFileLocationURL');
            $("#imgPreviewcontrol").prop('src', previewImg);
            var preview = i18n.t("click_to_preview");
            var html = '<div style="height:32px;cursor:pointer;text-align:center;padding-left:5px;padding-top:2px; padding-right:2px"><a class="btn btn-sm-g btn-default pull-left" , data-toggle="modal", data-target="#imgPreview", title="' + preview + '" tabindex="0" onClick=openModelPopup(' + row + ')><i class="icon-eye" style="width:30px; height:30px"></i></a></div>';
            return html;
        }

        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'PackageId', element, gridStorage, true, 'pagerDivContentLib', false, 0, 'PackageId', null, null, null);
            return true;
        }
        var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
            genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
        }

        //Custom filter
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

        }

        $("#" + gID).jqxGrid(
            {
                height: gridHeightFunction(gID, "library"),
                width: "100%",
                pageable: true,
                editable: true,
                source: dataAdapter,
                altRows: true,
                virtualmode: true,
                pageSize: AppConstants.get('ROWSPERPAGE'),
                filterable: true,
                sortable: true,
                columnsResize: true,
                enabletooltips: true,
                columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                rowsheight: 32,
                autoshowfiltericon: true,
                rendergridrows: function () {
                    return dataAdapter.records;
                },

                ready: function () {
                    callOnGridReady(gID, gridStorage);

                    var columns = genericHideShowColumn(gID, true, []);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                },

                columns: [
                    {
                        text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false,
                        datafield: 'isSelected', width: 40,
                        renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    {
                        text: i18n.t('thumbnail', { lng: lang }), datafield: 'ThumbnailLocationURL', editable: false, minwidth: 100, menu: false, sortable: false, filterable: false, resizable: false,
                        cellsrenderer: imagerenderer
                    },

                    {
                        text: i18n.t('content_name', { lng: lang }), datafield: 'PackageName', editable: false, minwidth: 150, filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('content_file_name', { lng: lang }), datafield: 'FileName', editable: false, minwidth: 120,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('filesize', { lng: lang }), datafield: 'FileSizeInMB', editable: false, minwidth: 100, filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('file_type', { lng: lang }), datafield: 'FileType', editable: false, minwidth: 100, filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('content_description', { lng: lang }), datafield: 'Description', editable: false, minwidth: 130, filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('version', { lng: lang }), datafield: 'FileVersion', editable: false, minwidth: 110, filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    { text: i18n.t('Content_preview', { lng: lang }), datafield: 'PreviewFileLocationURL', editable: false, minwidth: 100, menu: false, enabletooltips: false, sortable: false, filterable: false, cellsrenderer: previewRenderer },
                    {
                        text: i18n.t('keyword', { lng: lang }), dataField: 'Tags', editable: false, minwidth: 90,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('date_uploaded', { lng: lang }), datafield: 'FileUploadDate', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 150,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },
                    { text: i18n.t('uploaded_by', { lng: lang }), datafield: 'FullName', editable: false, minwidth: 100, filterable: false, menu: false, sortable: false },
                    {
                        text: i18n.t('device_file_location', { lng: lang }), datafield: 'DeviceFileLocationAlias', editable: false, minwidth: 130,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelMultiChoice(filterPanel, datafield, 'Device File Location');
                        }
                    },
                    { text: i18n.t('target_user', { lng: lang }), datafield: 'TargetUserAlias', sortable: false, filterable: false, menu: false, editable: false, hidden: true, visible: false, minwidth: 100, filterable: false },
                    { text: i18n.t('delivery_standard_filename', { lng: lang }), datafield: 'DeviceFileNameAlias', hidden: true, visible: false, editable: false, minwidth: 150, sortable: false, filterable: false, menu: false },
                    {
                        text: i18n.t('last_used', { lng: lang }), datafield: 'LastUsedDate', editable: false, minwidth: 150, enabletooltips: false, cellsformat: LONG_DATETIME_GRID_FORMAT,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    },

                ]
            });
        getGridBiginEdit(gID, 'PackageId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'PackageId');
    }

    function getContentParameters(isExport, columnSortFilterForContent, selectedContentItems, unselectedContentItems, checkAll, visibleColumns) {
        var getPackagesReq = new Object();
        var Pagination = new Object();
        var Export = new Object();
        var Selector = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedContentItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedContentItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.IsExport = true;

            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        }

        Export.ExportReportType = ENUM.get('ContentLibrary');

        Export.VisibleColumns = visibleColumns;
        var ColumnSortFilter = columnSortFilterForContent;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);

        getPackagesReq.ColumnSortFilter = ColumnSortFilter;
        getPackagesReq.Export = Export;
        getPackagesReq.PackageType = 2;
        getPackagesReq.Pagination = Pagination;
        getPackagesReq.Selector = Selector;

        var param = new Object();
        param.token = TOKEN();
        param.getPackagesReq = getPackagesReq;

        return param;
    }
    //end grid

    function gettileViewParams(FilterList, pageNo) {
        var getPackagesReq = new Object();
        var Pagination = new Object();
        var Export = new Object();
        var Selector = new Object();
        var ColumnSortFilter = new Object();

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = pageNo;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Export.DynamicColumns = null;
        Export.ExportReportType = 5;
        Export.IsAllSelected = false;
        Export.IsExport = false;

        Selector.SelectedItemIds = null;
        Selector.UnSelectedItemIds = null;

        ColumnSortFilter.FilterList = FilterList;
        ColumnSortFilter.GridId = 'ContentLibrary';
        ColumnSortFilter.SortList = null;

        getPackagesReq.ColumnSortFilter = ColumnSortFilter;
        getPackagesReq.Export = Export;
        getPackagesReq.PackageType = 2;
        getPackagesReq.Pagination = Pagination;
        getPackagesReq.Selector = Selector;

        return getPackagesReq;
    }

    function getContentLibraryData(FilterList, contentTilesData, tilepaginationData, totalTilerow, totalTilePage, pageNO, tileshowing, tilevisibleRow, isRefresh) {
        var pageName = "ContentLibrary";

        var InitPageStorage = initPageStorageObj(pageName);
        var PageStorage = InitPageStorage.PageStorage;
        if (PageStorage) {
            if (PageStorage[0].columnSortFilter != null) {
                FilterList = PageStorage[0].columnSortFilter;

            }

            pageNO(PageStorage[0].PagNo);
        }


        // $("#loadingDiv").show();
        var getPackagesReq = new Object();

        getPackagesReq = gettileViewParams(FilterList, pageNO());


        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.getPackagesResp)
                        data.getPackagesResp = $.parseJSON(data.getPackagesResp);

                    if (data.getPackagesResp && data.getPackagesResp.Packages) {
                        tilevisibleRow(data.getPackagesResp.Packages.length);
                        contentTilesData(data.getPackagesResp.Packages);
                        tilepaginationData(data.getPackagesResp.PaginationResponse);
                        totalTilerow(data.getPackagesResp.PaginationResponse.TotalRecords);
                        totalTilePage(data.getPackagesResp.PaginationResponse.TotalPages);
                        $("#txtGoToPagetilwView").prop("disabled", false);
                        if (pageNO() == '1') {

                            if (pageNO() == data.getPackagesResp.PaginationResponse.TotalPages) {
                                $("#tileViewfristbtn").prop("disabled", true);
                                $("#tileViewperbtn").prop("disabled", true);
                                $("#tileViewnextbtn").prop("disabled", true);
                                $("#tileViewlastbtn").prop("disabled", true);
                            } else {
                                $("#tileViewfristbtn").prop("disabled", true);
                                $("#tileViewperbtn").prop("disabled", true);
                                $("#tileViewnextbtn").prop("disabled", false);
                                $("#tileViewlastbtn").prop("disabled", false);
                            }
                        } else if (pageNO() == data.getPackagesResp.PaginationResponse.TotalPages) {
                            $("#tileViewfristbtn").prop("disabled", false);
                            $("#tileViewperbtn").prop("disabled", false);
                            $("#tileViewnextbtn").prop("disabled", true);
                            $("#tileViewlastbtn").prop("disabled", true);
                        } else {
                            $("#tileViewfristbtn").prop("disabled", false);
                            $("#tileViewperbtn").prop("disabled", false);
                            $("#tileViewnextbtn").prop("disabled", false);
                            $("#tileViewlastbtn").prop("disabled", false);
                        }
                        if (PageStorage) {
                            if (PageStorage[0].selectedDataArr != '') {

                                tileViewSelectedArray = PageStorage[0].selectedDataArr;
                                tileViewSelectedDataArray = PageStorage[0].multiRowData;
                                $("#tileViewseleceteRowSpan").text(tileViewSelectedArray.length);
                            }
                        }


                        for (var i = 0; i < data.getPackagesResp.Packages.length; i++) {

                            var id = '#contentLI' + i + '';

                            if ($.inArray(data.getPackagesResp.Packages[i].PackageId, tileViewSelectedArray) < 0) {

                            } else {

                                $(id).addClass('selected');

                            }
                        }
                    } else {
                        contentTilesData(null);
                        tilepaginationData(null);
                        totalTilerow(0);
                        totalTilePage(0);
                        pageNO(0);
                        $("#tileViewfristbtn").prop("disabled", true);
                        $("#tileViewperbtn").prop("disabled", true);
                        $("#tileViewnextbtn").prop("disabled", true);
                        $("#tileViewlastbtn").prop("disabled", true);
                        $("#txtGoToPagetilwView").prop("disabled", true);
                    }
                } else {
                    contentTilesData(null);
                    tilepaginationData(null);
                    totalTilerow(0);
                    totalTilePage(0);
                    pageNO(0);
                    $("#tileViewfristbtn").prop("disabled", true);
                    $("#tileViewperbtn").prop("disabled", true);
                    $("#tileViewnextbtn").prop("disabled", true);
                    $("#tileViewlastbtn").prop("disabled", true);
                    $("#txtGoToPagetilwView").prop("disabled", true);
                }
                if (isRefresh == 0) {
                    $('.tileswrapper').children('li').removeClass('selected');
                    tileViewSelectedArray = [];
                    tileViewSelectedDataArray = [];
                    // $("#jqxgridContentlibseleceteRowSpan").text() = 0;
                    $("#tileViewseleceteRowSpan").text('0');
                } else {

                }
                $("#loadingDiv").hide();
            }
            if (error) {
                contentTilesData(null);
                tilepaginationData(null);
                totalTilerow(0);
                totalTilePage(0);
                pageNO(0);
                $("#tileViewfristbtn").prop("disabled", true);
                $("#tileViewperbtn").prop("disabled", true);
                $("#tileViewnextbtn").prop("disabled", true);
                $("#tileViewlastbtn").prop("disabled", true);
                $("#txtGoToPagetilwView").prop("disabled", true);
                openAlertpopup(2, 'network_error');
                $("#loadingDiv").hide();

            }
        }
        var method = 'GetPackages';
        var params = '{"token":"' + TOKEN() + '","getPackagesReq":' + JSON.stringify(getPackagesReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
    }
});

//var player;
var fileName;

function openModelPopup(rowindex) {

    var rowdata = $("#jqxgridContentlib").jqxGrid('getrowdata', rowindex);
    fileName = rowdata.FileName;
    var previewFileLocationURL = rowdata.PreviewFileLocationURL;
    $("#previewImageName").empty();
    $("#previewImageName").text(fileName)
    var extension = fileName.substr((fileName.lastIndexOf('.') + 1));
    extension = extension.toLowerCase();

    if (previewFileLocationURL != null && previewFileLocationURL != "") {

        $("#audioDiv").hide();
        $("#videoDiv").hide();
        $("#imgDiv").hide();

        if (extension == 'mp3' || extension == 'wav') {
            $("#imgDiv").hide();
            $("#videoDiv").hide();
            $("#audioDiv").show();
            $("#audioplayer").prop("src", previewFileLocationURL);
            audioPlayer = new MediaElementPlayer("#audioplayer", {
                features: ['playpause', 'stop', 'current', 'progress', 'duration', 'volume'],
                audioWidth: 567,
                audioHeight: 60,
            });
            audioPlayer.load();
            audioPlayer.play();

            closeAudioPopup = 1;
            closeVideoPopup = 0;
        } else if (extension == 'wmv' || extension == 'avi' || extension == 'mpg' || extension == 'mp4') {
            $("#audioDiv").hide();
            $("#imgDiv").hide();
            $("#videoDiv").show();
            dispalyVideoOnPreview(previewFileLocationURL);
            closeVideoPopup = 1;
            closeAudioPopup = 0;
        }
        else if (extension == 'jpg' || extension == 'png' || extension == 'tiff' || extension == 'gif' || extension == 'bmp' || extension == 'pam') {
            $("#audioDiv").hide();
            $("#videoDiv").hide();
            $("#imgDiv").show();
            $(".img-display").prop('src', previewFileLocationURL);
            closeAudioPopup = 0;
            closeVideoPopup = 0;
        } else {
            openAlertpopup(1, 'file_format_not_supported');
            return true;
        }
    } else {
        openAlertpopup(1, 'no_file_found');
        return true;
    }
    $('#imageContentPreview').modal('show');

}


function saveFileFromGrid(fileName, downloadUrl) {
    fileName = decodeURIComponent(fileName);
    downloadUrl = decodeURIComponent(downloadUrl);
    var extension = fileName.substr((fileName.lastIndexOf('.') + 1));
    extension = extension.toLowerCase();
    downloadContentFile(downloadUrl, fileName, extension);
}


function downloadContentFile(url, filename, extension) {
    url = url.replace(/%20/gi, ' ');
    var responsefunction = function (data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                if (data.getContentFilesResp) {
                    data.getContentFilesResp = $.parseJSON(data.getContentFilesResp);
                    var b64Data = data.getContentFilesResp.byteArray;
                    var contentType = getContentTypeFromExtension(extension);
                    var blob = b64toBlob(b64Data, contentType);
                    var blobUrl = URL.createObjectURL(blob);
                    var a = $("<a>").attr("href", blobUrl)
                        .attr("download", data.getContentFilesResp.filename)
                        .appendTo("body");
                    try {
                        a[0].click();
                    } catch (e) {
                        saveFileOnAccessDenied(data.getContentFilesResp.filename, blob);
                    }
                    a.remove();
                }
            } else if (data.responseStatus.StatusCode == AppConstants.get('CONTENT_FILE_ERROR_WHEN_DOWNLOAD')) {
                openAlertpopup(1, 'error_occurred_while_downloading_file');
            } else if (data.responseStatus.StatusCode == AppConstants.get('CONTENT_FILE_NOT_EXISTS')) {
                openAlertpopup(1, 'content_file_not_found_in_filelocation');
            } else if (data.responseStatus.StatusCode == AppConstants.get('CONTENT_URL_FORBIDDEN')){
                openAlertpopup(1, 'content_file_forbidden');
            }
        }
    }
    var params = '{"token":"' + TOKEN() + '","getContentFilesReq":{"url":"' + url + '"}}';
    ajaxJsonCall('GetContentFiles', params, responsefunction, true, 'POST', true);
}

//play video when click on preview
function dispalyVideoOnPreview(previewFileLocationURL) {
    $("#ID1").empty();
    var str = '<video id="videoShowID" class="video-js vjs-default-skin video-MX760" controls preload="auto" width="170" height="119"></video>';
    $("#ID1").append(str);
    player = videojs('videoShowID', {
        techOrder: ['flash', 'html5'],
        autoplay: true,
        components: { 'playToggle': {} },
        sources: [{
            type: "video/flv",
            src: previewFileLocationURL,
        }],
    });

    player.on("ended", function () {
        player.posterImage.show();
        player.currentTime(0).trigger('loadstart');
        player.pause();
    });
}


