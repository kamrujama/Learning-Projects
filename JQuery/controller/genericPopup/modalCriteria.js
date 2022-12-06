define(["knockout", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "chosen", "appEnum"], function (ko, ADSearchUtil, koUtil) {

    return function DeviceSearchdViewModel() {

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


        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#deleteQuickConfirmationPopup').on('shown.bs.modal', function (e) {
            $('#deleteQuickConfirmationPopup_NO').focus();

        });
        $('#deleteQuickConfirmationPopup').keydown(function (e) {
            if ($('#deleteQuickConfirmationPopup_NO').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#deleteQuickConfirmationPopup_Yes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------

        var self = this;

        var GlobalCustomSearch = {
            ControlType: 0,
            DeviceSearchAttributeId: '',
            DeviceSearchOperatorId: '',
            SearchElementSeqNo: 0,
            SearchId: 0,
            SearchValue: ''
        };
        var CustomAttributeData = new Array();
        self.multiComboData = ko.observableArray();
        self.multiselctedDeviceStatus = ko.observable();
        self.criteriaGroups = ko.observable();
        self.attrbuteCriteriaArr = ko.observable();
        self.multiselctedModels = ko.observable();
        //self.testArr = ko.observableArray(ADSearchUtil.HierarchyPathArr());

        istypeedquick = 0;
        self.allSearches = ko.observableArray();
        self.SearchId = ko.observable();
        self.selectedSearch = ko.observable();
        self.selectedSearchText = ko.observable();
        self.deviceSearch = ko.observable(false);
        self.otherSearch = ko.observable(false);

        self.forDeviceSearchReset = ko.observable(false);

        self.oldSearchid = ko.observable();

        if (ADSearchUtil.AdScreenName == 'deviceSearch') {
            self.deviceSearch(false);
            self.otherSearch(true);
            self.forDeviceSearchReset(true);
        } else {
            self.deviceSearch(true);
            self.otherSearch(false);
            self.forDeviceSearchReset(false);
        }

        self.SearchDataFordelete = ko.observable();
        self.applyForChart = ko.observable();
        self.applyForChart(ADSearchUtil.SearchForChart);
        //For report
        self.applyForChartForReport = ko.observable();
        self.applyForChartForReport(ADSearchUtil.SearchForChart);

        self.applyForGrid = ko.observable();
        self.applyForGrid(ADSearchUtil.SearchForGrid);

        //For report
        self.applyForGridForReport = ko.observable();
        self.applyForGridForReport(ADSearchUtil.SearchForGrid);

        var nestedRoutePath = getRouteUrl();
        if (nestedRoutePath[1] == "reports") {
            self.applyForGridForReport(false);
            self.applyForChartForReport(false);
            $("#quickSearchCombo").hide();
            $("#quickTitle").hide();

        }
        //for (var i = 0; i < deviceAttributesDataCustomSearch.length; i++) {
        //    CustomAttributeData.push(deviceAttributesDataCustomSearch[i].AttributeName);
        //}
        self.selectedSearch.subscribe(function (newValue) {

            if (newValue != 0) {
                if (newValue) {
                    var selectedsource = _.where(self.allSearches(), { SearchID: newValue });

                    self.selectedSearchText(selectedsource[0].SearchText);
                    var str = '<div class="panel-body">';
                    str += '<div class="row">';
                    str += '<span>';
                    str += '' + selectedsource[0].SearchText + '';
                    str += '</span>';
                    str += '</div>';
                    str += '</div>';
                    $("#deviceCriteriaDiv").empty();
                    $("#deviceCriteriaDiv").append(str);

                }
            }
        });
        self.resetADSearch = function (unloadAdvancedSearch) {
            isFromDeviceSearch = false;
            isAdvancedSavedSearchApplied = false;
            isSearchReset = true;
            koUtil.savedSearchId = 0;
            careDataDeletedDevices = new Object();
            careSearchDeletedDevicesObject = new Object();

            //schedule Action Flag Resetting when resetting the search
            koUtil.isFromScheduleActionScreen = 1
            sessionStorage.removeItem("CustomSearchText");
            sessionStorage.removeItem("customSearchStore");
            isReset = true;
            var deleteid = self.SearchId();
            $("#td" + deleteid).removeClass('disabled');

            ADSearchUtil.deviceSearchObj = null;
            ADSearchUtil.resetAddSerchFlag = 'reset';

            var gId = '';

            if (ADSearchUtil.gridIdForAdvanceSearch == 'jqxgridForSelectedDevices') {
                gId = getschedulscrenName();
                gId = ADSearchUtil.gridIdForAdvanceSearch + gId;
                isSearchAppliedForSchedule = true;
            } else if (ADSearchUtil.gridIdForAdvanceSearch == "blankDevicejqxgrid") {
                gId = "Devicejqxgrid";
            } else {
                gId = ADSearchUtil.gridIdForAdvanceSearch;
            }
            sessionStorage.removeItem(gId + 'customSearch');
            sessionStorage.removeItem(gId + 'CustomSearchText');
            sessionStorage.removeItem(gId + 'CustomSearchCriteria');
            updateAdSearchObj(gId, null, 2);

            CallType = ENUM.get("CALLTYPE_NONE");
            if (ADSearchUtil.gridIdForAdvanceSearch == 'jqxgridForSelectedDevices') {

                //$("#newJobBtn").prop("disabled", true);
                //$("#selectedDevicesGrid").show();
                //$("#schduleGrid").hide();
                //$("#nextBtn").show();
                //$("#previousBtn").hide();
                //$("#nextSchedule").show();
                //$("#showHideResetExportbtn").show();
                //$("#tabUL").each(function () {
                //    $(this).children('li').removeClass('active');
                //});
                //$("#tabSelectedDevice").addClass('active');
                $("#" + 'jqxgridForSelectedDevices').jqxGrid('updatebounddata');
            } else {
                if (ADSearchUtil.gridIdForAdvanceSearch == "blankDevicejqxgrid") {
                    gId = "Devicejqxgrid";
                }
                gridFilterClear(gId);
            }
            //unloadAdvancedSearch();
            $("#deviceCriteriaDiv").empty();
            $("#criteriabtnDiv").css("display", "none");
            $("#btnApplyFilterChart").prop('disabled', true);
            $("#btnApplyFilter").prop('disabled', true);
            $("#txtQuickSearchDevice").val('');
            $("#txtQuickSearchDevice").val('');
            $("#resetBtnForChart").addClass('hide');

            $("#resetBtnForGrid").addClass('hide');
            $("#txtSearchName").val('');
            $(".panel-side-pop").hide();

            $("#allQuickSearchUL").each(function () {
                $(this).children('li').css("background-color", "");

            });


            $("#idCustomSearchModalCriteria").val("");

        }

        self.expandCriteria = function () {
            $("#deviceCriteriaDiv").toggleClass('hide');
        }

        self.setflageonOpen = function () {
            ClearAdSearch = 0;
        }

        self.resetADSearchForChart = function (applyAdvancedSearchForChart, unloadAdvancedSearch) {

            var deleteid = self.SearchId();
            $("#td" + deleteid).removeClass('disabled');
            var DeviceSearch = new Object();
            ADSearchUtil.deviceSearchObj = DeviceSearch;
            ADSearchUtil.ExportDynamicColumns = [];
            gId = ADSearchUtil.gridIdForAdvanceSearch;


            updateAdSearchObj(gId, DeviceSearch, 2);

            //var chartName = ADSearchUtil.gridIdForAdvanceSearch;
            //var adStorage = JSON.parse(sessionStorage.getItem(chartName + "adStorage"));
            //if (adStorage) {

            //    adStorage[0].isAdSearch = 0;
            //    adStorage[0].adSearchObj = null;
            //    adStorage[0].quickSearchObj = null;
            //    adStorage[0].searchText = null;
            //    adStorage[0].quickSearchName = null;
            //    adStorage[0].AdvancedSearchHierarchy = null;
            //    adStorage[0].AdvancedSearchGroup = null;
            //    adStorage[0].isWithGroup = 0;
            //    adStorage[0].isFromDevice = 0;

            //    var adStorage = JSON.stringify(adStorage);
            //    window.sessionStorage.setItem(chartName + 'adStorage', adStorage);
            //}


            applyAdvancedSearchForChart();
            unloadAdvancedSearch();
            $("#deviceCriteriaDiv").empty();
            $("#criteriabtnDiv").css("display", "none");
            $("#txtQuickSearchDevice").val('');
            $("#btnApplyFilterChart").prop('disabled', true);
            $("#btnApplyFilter").prop('disabled', true);
            $("#resetBtnForChart").addClass('hide');

            $("#resetBtnForGrid").addClass('hide');
        }

        function applyQuickSearch(applyFlage, QuickSurceSearchText) {
            $("#quickcriteria").removeClass('quickCriHide');
            $("#advanceCriteria").addClass('quickCriHide');
            koUtil.isQuickSearchApplied = 1;
            var deletedid = self.oldSearchid();
            $("#td" + deletedid).removeClass('disabled');

            $("#deviceCriteriaDiv").removeClass('hide');
            var DeviceSearch = new Object();
            if (ADSearchUtil.AdScreenName == 'deletedDevice') {
                DeviceSearch.DeviceStatus = ["Deleted"];
            } else {
                DeviceSearch.DeviceStatus = new Array();
            }
            DeviceSearch.GroupIds = new Array();
            DeviceSearch.HierarchyIdsWithChildren = new Array();
            DeviceSearch.HierarchyIdsWithoutChildren = new Array();
            DeviceSearch.IsHierarchiesSelected = false;

            if (ADSearchUtil.AdScreenName == 'deletedDevice') {
                DeviceSearch.IsOnlyDeleteBlacklisted = true;
            } else {
                DeviceSearch.IsOnlyDeleteBlacklisted = false;
            }

            //DeviceSearch.IsOnlyDeleteBlacklisted = true; //false
            DeviceSearch.SearchCriteria = null;
            DeviceSearch.SearchElements = null;
            DeviceSearch.SearchModels = null;
            DeviceSearch.SearchName = null;
            if (applyFlage == 0) {


                var gId = '';

                if (ADSearchUtil.gridIdForAdvanceSearch == 'jqxgridForSelectedDevices') {
                    gId = getschedulscrenName();
                    gId = ADSearchUtil.gridIdForAdvanceSearch + gId;
                } else if (ADSearchUtil.gridIdForAdvanceSearch == "blankDevicejqxgrid") {
                    gId = "Devicejqxgrid";
                } else {
                    gId = ADSearchUtil.gridIdForAdvanceSearch;
                }

                var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
                if (QuickSurceSearchText && QuickSurceSearchText != '' && QuickSurceSearchText != undefined) {
                    adStorage[0].searchText = QuickSurceSearchText;
                }
                adStorage[0].quickSearchName = $("#txtQuickSearchDevice").val().trim();
                var updatedAdStorage = JSON.stringify(adStorage);
                window.sessionStorage.setItem(gId + 'adStorage', updatedAdStorage);

                DeviceSearch.SearchID = self.SearchId();
                DeviceSearch.SearchText = $("#txtQuickSearchDevice").val().trim();//self.selectedSearchText();//
                DeviceSearch.SearchType = ENUM.get('ADVANCED');
            } else {

                var gId = '';
                if (ADSearchUtil.gridIdForAdvanceSearch == 'jqxgridForSelectedDevices') {
                    gId = getschedulscrenName();
                    gId = ADSearchUtil.gridIdForAdvanceSearch + gId;
                } else if (ADSearchUtil.gridIdForAdvanceSearch == "blankDevicejqxgrid") {
                    gId = "Devicejqxgrid";
                } else {
                    gId = ADSearchUtil.gridIdForAdvanceSearch;
                }
                var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
                adStorage[0].searchText = $("#txtQuickSearchDevice").val().trim();
                adStorage[0].quickSearchName = $("#txtQuickSearchDevice").val().trim();
                var updatedAdStorage = JSON.stringify(adStorage);
                window.sessionStorage.setItem(gId + 'adStorage', updatedAdStorage);

                DeviceSearch.SearchID = 0;
                DeviceSearch.SearchText = $("#txtQuickSearchDevice").val().trim();//self.selectedSearchText();//
                DeviceSearch.SearchType = ENUM.get('QUICK');
            }


            ADSearchUtil.deviceSearchObj = DeviceSearch; $("#deviceCriteriaDiv")
            ADSearchUtil.newAddedDataFieldsArr = [];
            ADSearchUtil.newAddedgridColumns = [];
            ADSearchUtil.ExportDynamicColumns = [];
            ADSearchUtil.resetAddSerchFlag = '';
            CallType = ENUM.get("CALLTYPE_NONE");

            var gId = '';
            if (ADSearchUtil.gridIdForAdvanceSearch == 'jqxgridForSelectedDevices') {
                gId = getschedulscrenName();
                gId = ADSearchUtil.gridIdForAdvanceSearch + gId;
            } else if (ADSearchUtil.gridIdForAdvanceSearch == "blankDevicejqxgrid") {
                gId = "Devicejqxgrid";
            } else {
                gId = ADSearchUtil.gridIdForAdvanceSearch;
            }

            updateAdSearchObj(gId, DeviceSearch, 1);
            //var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
            //adStorage[0].quickSearchObj = DeviceSearch;
            //adStorage[0].isAdSearch = 1;
            //var updatedadStorage = JSON.stringify(adStorage);
            //window.sessionStorage.setItem(gId + 'adStorage', updatedadStorage);


            //var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
            //gridStorage[0].adSearchObj = DeviceSearch;
            //var updatedGridStorage = JSON.stringify(gridStorage);
            //window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);

            //var gridStorage1 = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));

            if (ADSearchUtil.gridIdForAdvanceSearch == 'jqxgridForSelectedDevices') {
                $("#newJobBtn").prop("disabled", true);
                $("#selectedDevicesGrid").show();
                $("#schduleGrid").hide();
                $("#nextBtn").show();
                $("#previousBtn").hide();
                $("#nextSchedule").show();
                $("#showHideResetExportbtn").show();
                $("#tabUL").each(function () {
                    $(this).children('li').removeClass('active');
                });
                $("#tabSelectedDevice").addClass('active');
                $("#" + 'jqxgridForSelectedDevices').jqxGrid('updatebounddata');
            } else {
                if (ADSearchUtil.gridIdForAdvanceSearch == "blankDevicejqxgrid") {
                    gId = "Devicejqxgrid";
                }
                gridFilterClear(gId, 0);
            }






            if (applyFlage == 0) {


            } else {

                var str = '<div class="panel-body">';
                str += '<div class="row">';
                str += '<span>';
                str += '' + $("#txtQuickSearchDevice").val() + '';
                str += '</span>';
                str += '</div>';
                str += '</div>';
                $("#deviceCriteriaDiv").empty();
                $("#deviceCriteriaDiv").append(str);
            }

            $("#criteriabtnDiv").css("display", "inline");
            $("#resetBtnForChart").addClass('hide');

            $("#resetBtnForGrid").removeClass('hide');
            if (ADSearchUtil.AdScreenName == 'deviceSearch') {

                $("#resetBtnForGrid").css('display', "none");
                $("#A1").css('display', "");
            } else {

                $("#resetBtnForGrid").css('display', "");
                $("#A1").css('display', "none");
            }


            self.oldSearchid(self.SearchId());
            var deleteid = self.SearchId();
            $("#td" + deleteid).addClass('disabled');
        }
        //--------------------------------- Custom Search Start ------------------------------------------------------------------
        self.CustomSearchCriteria = ko.observable();
        self.IsCustomSearchResult = ko.observable(false);
        var CustomAttributeData = new Array();
        if (deviceAttributesDataCustomSearch && deviceAttributesDataCustomSearch.length != undefined) {
            for (var i = 0; i < deviceAttributesDataCustomSearch.length; i++) {
                CustomAttributeData.push(deviceAttributesDataCustomSearch[i].AttributeName);
            }
        }
        self.CustomData = ko.observableArray(CustomAttributeData);
        self.selectedValueFlag = ko.observable(true);
        self.selectedAttOperator = ko.observable();
        self.SelectedModelNameList = ko.observableArray();
        self.multiComboDataBackUp = ko.observableArray()

        var selectedsource = '';
        // using JQX       
        $("#idCustomSearchModalCriteria").jqxInput({
            source: function (query, response) {
                var item = query.split(/ \s*/).pop();
                // update the search query.
                $("#idCustomSearchModalCriteria").jqxInput({ query: item });

                if (self.selectedValue && query != "") {

                    var CustomeData = new Array();
                    var newValue = self.selectedValue();

                    var textData = $.trim($("#idCustomSearchModalCriteria").val());
                    var textD1 = textData.split(' ');
                    var isAttribute = _.where(deviceAttributesDataCustomSearch, { AttributeName: textD1[0] });
                    if (isAttribute.length < 1) {
                        self.CustomData(CustomAttributeData);
                    }
                    else {
                        selectedsource = _.where(deviceAttributesDataCustomSearch, { AttributeName: textD1[0] });
                        if (textD1[1]) {
                            self.CustomData([]);
                            self.selectedValue(undefined);

                            if (self.multiComboData().length > 0 && textD1[0] == "ModelName") {
                                var modelData = self.multiComboData();
                                var modelList = new Array();
                                for (var i = 0; i < modelData.length; i++) {
                                    modelList.push(modelData[i].Value);
                                }
                                self.CustomData(modelList);
                            }
                        }
                        else if (selectedsource.length != 0) {
                            for (var i = 0; i < selectedsource[0].DeviceSearchAttributeOperators.length; i++) {
                                CustomeData.push(selectedsource[0].DeviceSearchAttributeOperators[i].Operator);
                            }
                            self.CustomData(CustomeData);
                        }
                    }

                }

                if (self.selectedValue)
                    if (self.selectedValue() == undefined && self.selectedValueFlag())
                        self.CustomData(CustomAttributeData);

                response(self.CustomData());
            },
            renderer: function (itemValue, inputValue) {

                if (selectedsource.length != 0) {
                    var selectedsourceOperator = _.where(selectedsource[0].DeviceSearchAttributeOperators, { Operator: itemValue });
                    if (selectedsourceOperator.length > 0) {
                        self.selectedAttOperator(itemValue);
                        GlobalCustomSearch.DeviceSearchAttributeId = selectedsourceOperator[0].DeviceSearchAttributesId;
                        GlobalCustomSearch.DeviceSearchOperatorId = selectedsourceOperator[0].DeviceSearchOperatorId;
                    }
                }

                var textData = $.trim($("#idCustomSearchModalCriteria").val());
                var textD1 = textData.split(' ');
                var isAttribute = _.where(deviceAttributesDataCustomSearch, { AttributeName: textD1[0] });
                if (isAttribute.length < 1)
                    $("#idCustomSearchModalCriteria").val("");

                // for custom Model 
                var valueModelName;
                if (textD1[0] == "ModelName") {
                    var Modeltrm = inputValue.trim().split(self.selectedAttOperator());
                    if (Modeltrm[1] && Modeltrm[1] != "") {
                        var Modelterms = Modeltrm[1];

                        var a1 = Modelterms.split(/ \s*/);
                        var p = a1[a1.length - 1];
                        if (p.length < 3)
                            a1.pop();
                        a1 = a1.join(" ");
                        if (a1)
                            Modelterms = a1 + ", " + itemValue;
                        else
                            Modelterms = " " + itemValue;

                        valueModelName = Modeltrm[0] + self.selectedAttOperator() + Modelterms;
                    }
                }

                var terms = inputValue.split(/ \s*/);
                terms.pop();
                terms.push(itemValue);

                //terms.push("");
                var value = terms.join(" ");
                if (textD1[0] == "ModelName" && valueModelName) {
                    value = valueModelName;
                }

                self.selectedValue = ko.observable(itemValue);
                self.selectedValueFlag(false);


                // device Model Name 
                if (itemValue == "ModelName") {
                    var arr = getMultiCoiceFilterArr("Model");
                    self.multiComboData(arr);
                    self.multiComboDataBackUp(arr);
                }

                if (self.multiComboData().length > 0) {

                    if (textD1[0] == "ModelName") {
                        var SelectedcustomInput = inputValue.split(self.selectedAttOperator());
                        if (valueModelName) {
                            SelectedcustomInput = valueModelName.split(self.selectedAttOperator());
                        }

                        if (SelectedcustomInput[1]) {
                            var selectedModelNames = SelectedcustomInput[1].trim().split(',');
                            //selectedModelNames.push(itemValue);
                            var SelectedModelData = new Array();
                            // var multiComboDataTemp = self.multiComboDataBackUp();
                            if (!selectedModelNames[0]) {
                                selectedModelNames[0] = itemValue;
                            }
                            if (selectedModelNames[0]) {
                                for (var i = 0; i < selectedModelNames.length; i++) {
                                    var NewVal = selectedModelNames[i].trim();
                                    var selectedModel = _.where(self.multiComboDataBackUp(), { Value: NewVal });
                                    if (selectedModel.length > 0) {
                                        var SelectedModelReq = {
                                            ModelId: selectedModel[0].Id,
                                            ModelName: selectedModel[0].Value
                                        };
                                        SelectedModelData.push(SelectedModelReq);

                                        //for (var j = 0; j < self.multiComboDataBackUp().length; j++) {
                                        //    if (multiComboDataTemp[j].Value)
                                        //        if (multiComboDataTemp[j].Value == NewVal) {
                                        //            multiComboDataTemp.splice(j, 1);
                                        //        }
                                        //}
                                        //self.multiComboData(multiComboDataTemp);
                                    }
                                }

                            }
                            if (SelectedModelData.length > 0) {
                                self.SelectedModelNameList(SelectedModelData);
                            }
                        }

                        // remove selected value from device Model list                               
                        //if (GlobalCustomSearch.DeviceSearchAttributeId == 50) {
                        //    var multiComboDataTemp = self.multiComboDataBackUp();
                        //    for (var i = 0; i < self.SelectedModelNameList().length; i++) {
                        //        for (var j = 0; j < self.multiComboDataBackUp().length; j++) {
                        //            if (multiComboDataTemp[j].Value)
                        //                if (multiComboDataTemp[j].Value == self.SelectedModelNameList()[i].ModelName) {
                        //                    multiComboDataTemp.splice(j, 1);
                        //                }
                        //        }
                        //        self.multiComboData(multiComboDataTemp);
                        //    }

                        //}
                    }

                }


                return value;
            }
        });

        $("#idCustomSearchModalCriteria")
            .bind("keydown", function (event) {

                if ($(this).val() == "") {
                    self.selectedValueFlag(true);
                    $(this).val(null).trim();
                }
            });

        //self.addCustomSearchModalCriteria = function () {
        //    var customVal = $("#idCustomSearchModalCriteria").val();
        //    if (customVal && GlobalCustomSearch.DeviceSearchAttributeId) {
        //        var str = customVal.split(' ');
        //        var selectedsource = _.where(deviceAttributesDataCustomSearch, { AttributeName: str[0] });
        //        //  GlobalCustomSearch.ControlType = selectedsource[0].ControlType;
        //        var searchValue = str[str.length - 1];
        //        GlobalCustomSearch.SearchValue = searchValue;
        //        var cusData = new Array();
        //        cusData.push(GlobalCustomSearch);

        //        applyCustomFilter(cusData);
        //        //  applyQuickSearch(1, null);
        //    }
        //}

        $("#idCustomSearchModalCriteria").keypress(function (e) {
            if (e.keyCode == 13) {
                var customVal = $("#idCustomSearchModalCriteria").val();
                if (customVal) {
                    var str = customVal.split(' ');
                    var selectedsource = _.where(deviceAttributesDataCustomSearch, { AttributeName: str[0] });
                    if (selectedsource.length == 0)
                        openAlertpopup(1, 'please_select_Valid_attr');

                    if (GlobalCustomSearch.DeviceSearchAttributeId == "" && selectedsource.length != 0)
                        openAlertpopup(1, 'please_select_Valid_operator');

                    else if (selectedsource.length != 0 && str[1] == undefined)
                        openAlertpopup(1, 'please_select_Valid_operator');

                    else if (selectedsource.length != 0) {
                        var searchValue = str[str.length - 1];
                        if (searchValue != "") {
                            GlobalCustomSearch.SearchValue = searchValue;
                            var cusData = new Array();
                            cusData.push(GlobalCustomSearch);

                            isCustomSearchFlag = false;

                            var customStr = "  <strong>Search Type : </strong> Custom Search <br /><strong>Attribute = </strong><span>" + customVal + "</span>";
                            ADSearchUtil.SearchText = customStr;
                            ADSearchUtil.SearchCriteria = customStr;
                            sessionStorage.setItem("CustomSearchText", customStr);
                            applyCustomFilter(cusData);
                            $("#deviceCriteriaDiv").empty();
                            $("#deviceCriteriaDiv").append(customStr);
                        }
                        else
                            openAlertpopup(1, 'please_select_attr_value');
                    }
                }
                else
                    openAlertpopup(1, 'please_select_Valid_attr');
            }

        });
        self.addCustomSearchModalCriteria = function () {
            var customVal = $("#idCustomSearchModalCriteria").val();
            if (customVal) {
                var str = customVal.split(' ');
                var selectedsource = _.where(deviceAttributesDataCustomSearch, { AttributeName: str[0] });
                if (selectedsource.length == 0)
                    openAlertpopup(1, 'please_select_Valid_attr');

                if (GlobalCustomSearch.DeviceSearchAttributeId == "" && selectedsource.length != 0)
                    openAlertpopup(1, 'please_select_Valid_operator');

                else if (selectedsource.length != 0 && str[1] == undefined)
                    openAlertpopup(1, 'please_select_Valid_operator');

                else if (selectedsource.length != 0) {
                    var searchValue = str[str.length - 1];
                    if (searchValue != "") {
                        GlobalCustomSearch.SearchValue = searchValue;
                        var cusData = new Array();
                        cusData.push(GlobalCustomSearch);
                        isCustomSearchFlag = false;
                        var customStr = "  <strong>Search Type : </strong> Custom Search <br /><strong>Attribute = </strong><span>" + customVal + "</span>";
                        ADSearchUtil.SearchText = customStr;
                        ADSearchUtil.SearchCriteria = customStr;
                        applyCustomFilter(cusData);
                        $("#deviceCriteriaDiv").empty();
                        $("#deviceCriteriaDiv").append(customStr);

                    }
                    else
                        openAlertpopup(1, 'please_select_attr_value');
                }
            }
            else
                openAlertpopup(1, 'please_select_Valid_attr');

        }

        function applyCustomFilter(custom) {

            isResetApply = false;


            CallType = ENUM.get("CALLTYPE_NONE");


            //for dynamic
            var DeviceSearch = new Object();

            ///for device status           

            DeviceSearch.DeviceStatus = null;
            ///

            ///for groupsids       
            if (ADSearchUtil.gridIdForAdvanceSearch == "blankDevicejqxgrid") {
                gId = "Devicejqxgrid";
            } else {
                gId = ADSearchUtil.gridIdForAdvanceSearch;
            }


            var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));

            var GroupArr = new Array();

            var updatedadStorage = JSON.stringify(adStorage);
            window.sessionStorage.setItem(gId + 'adStorage', updatedadStorage);

            DeviceSearch.GroupIds = GroupArr;

            //for hierarchy
            var HierarchyIdsWithChildren = new Array();
            var HierarchyIdsWithoutChildren = new Array();
            var HierarchyPathArr = [];
            for (var i = 0; i < HierarchyPathArr.length; i++) {
                if (HierarchyPathArr[i].IsChildExists) {
                    if (HierarchyPathArr[i].IncludeChildren) {
                        HierarchyIdsWithChildren.push(HierarchyPathArr[i].HierarchyId);
                    } else {
                        HierarchyIdsWithoutChildren.push(HierarchyPathArr[i].HierarchyId);
                    }
                } else {
                    HierarchyIdsWithoutChildren.push(HierarchyPathArr[i].HierarchyId);
                }
            }


            //   gId = ADSearchUtil.gridIdForAdvanceSearch;


            var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));


            // adStorage[0].AdvancedSearchHierarchy = null;



            var updatedadStorage = JSON.stringify(adStorage);
            window.sessionStorage.setItem(gId + 'adStorage', updatedadStorage);

            DeviceSearch.HierarchyIdsWithChildren = HierarchyIdsWithChildren;
            DeviceSearch.HierarchyIdsWithoutChildren = HierarchyIdsWithoutChildren;

            DeviceSearch.IsHierarchiesSelected = false;


            ///

            DeviceSearch.IsOnlyDeleteBlacklisted = false;

            DeviceSearch.SearchCriteria = null;
            //for attributes                

            DeviceSearch.SearchElements = custom;

            // for model Name 
            var textData = $.trim($("#idCustomSearchModalCriteria").val());
            var textD1 = textData.split(' ');
            if (textD1[0] == "ModelName") {
                DeviceSearch.SearchElements = null;
            }


            ///for display criteria
            var SearchText = '';
            if (HierarchyPathArr.length > 0) {
                SearchText += 'Search Type = Hierarchy <br/>';

            }
            for (var i = 0; i < HierarchyPathArr.length; i++) {
                SearchText += 'Hierarchy = ';
                SearchText += HierarchyPathArr[i].HierarchyFullPath + ' <br/>';
            }




            $("#deviceCriteriaDiv").empty();
            $("#deviceCriteriaDiv").append(SearchText);
            ///

            ///for models
            var searchModels = new Array();
            var arr1 = [];



            for (var i = 0; i < arr1.length; i++) {
                var SearchModel = new Object();
                if (arr1[i].id != undefined) {
                    SearchModel.ModelId = arr1[i].id;
                } else {
                    SearchModel.ModelId = arr1[i].Id;
                }
                SearchModel.ModelName = arr1[i].Name;
                searchModels.push(SearchModel);
            }

            DeviceSearch.SearchModels = searchModels;
            var textData = $.trim($("#idCustomSearchModalCriteria").val());
            var textD1 = textData.split(' ');
            if (textD1[0] == "ModelName") {
                DeviceSearch.SearchModels = self.SelectedModelNameList();
            }

            ///
            DeviceSearch.SearchID = 0;
            DeviceSearch.SearchName = null;
            DeviceSearch.SearchText = SearchText;
            DeviceSearch.SearchType = ENUM.get('CUSTOM');
            //end dyn
            ADSearchUtil.deviceSearchObj = DeviceSearch;
            sessionStorage.setItem(gId + 'customSearch', JSON.stringify(DeviceSearch));
            sessionStorage.setItem(gId + 'CustomSearchText', ADSearchUtil.SearchText);
            sessionStorage.setItem(gId + 'CustomSearchCriteria', ADSearchUtil.SearchCriteria);
            gId = ADSearchUtil.gridIdForAdvanceSearch;
            sessionStorage.setItem('customSearchStore', JSON.stringify(DeviceSearch));



            updateAdSearchObj(gId, DeviceSearch, 0);

            ADSearchUtil.resetAddSerchFlag = '';
            ADSearchUtil.newAddedDataFieldsArr = [];
            ADSearchUtil.newAddedgridColumns = [];
            ADSearchUtil.ExportDynamicColumns = [];
            if (gId == 'jqxgridForSelectedDevices') {
                globalVariableForDownloadSchedule = null;
                koUtil.deviceProfileUniqueDeviceId = null;
                $("#newJobBtn").prop("disabled", true);
                $("#selectedDevicesGrid").show();
                $("#schduleGrid").hide();
                $("#nextBtn").show();
                $("#previousBtn").hide();
                $("#nextSchedule").show();
                $("#showHideResetExportbtn").show();
                $("#tabUL").each(function () {
                    $(this).children('li').removeClass('active');
                });
                $("#tabSelectedDevice").addClass('active');
                $("#" + gId).jqxGrid('updatebounddata');
                //gridFilterClear(gId);
            } else {
                gridFilterClear(gId, 0);
            }

            $("#mainPageBody").removeClass('modal-open-appendon');
            isAdpopup = '';


            $("#criteriabtnDiv").css("display", "inline");
            $("#resetBtnForChart").addClass('hide');

            $("#resetBtnForGrid").removeClass('hide');
            $("#txtSearchName").val('');

            //if (self.hierarchyFullPath().length != 0 || self.attrbuteCriteriaArr().length != 0 || self.criteriaGroups().length != 0) {
            //    $("#advanceCriteria").show();
            //} else {
            //    $("#advanceCriteria").hide();
            //}

        };

        //----------------------------------Custom Search End --------------------------------------------------------------------
        self.addQuickSearch = function () {

            if ($("#txtQuickSearchDevice").val().trim() != '') {
                $("#allQuickSearchUL").addClass('hide');
                $("#allSearchUL").addClass('hide');
                if (self.SearchId() != 0) {
                    //var str = '<div class="panel-body">';
                    //str += '<div class="row">';
                    //str += '<span>';
                    //str += '' + $("#txtQuickSearchDevice").val() + '';
                    //str += '</span>';
                    //str += '</div>';
                    //str += '</div>';
                    //$("#deviceCriteriaDiv").empty();
                    //$("#deviceCriteriaDiv").append(str);
                    $(".panel-side-pop").hide();
                    var QuickSurce = _.where(self.allSearches(), { SearchName: $("#txtQuickSearchDevice").val().trim() })



                    if (QuickSurce != '' && QuickSurce[0].SearchType != 2) {

                        self.SearchId(QuickSurce[0].SearchID);
                        var str = '<div class="panel-body">';
                        str += '<div class="row">';
                        str += '<span>';
                        str += '' + QuickSurce[0].SearchText + '';
                        str += '</span>';
                        str += '</div>';
                        str += '</div>';
                        $("#deviceCriteriaDiv").empty();
                        $("#deviceCriteriaDiv").append(str);
                        applyQuickSearch(0, QuickSurce[0].SearchText);
                    } else {

                        var addQuickSearchReq = new Object();
                        var quickSearch = new Object();
                        quickSearch.SearchId = 0;
                        quickSearch.SearchText = $("#txtQuickSearchDevice").val().trim();
                        addQuickSearchReq.QuickSearch = quickSearch;
                        function callbackFunction(data, error) {
                            if (data) {
                                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                                    applyQuickSearch(1, null);
                                    getAllSearches(self.allSearches);
                                }
                            }
                        }
                        var params = '{"token":"' + TOKEN() + '","addQuickSearchReq":' + JSON.stringify(addQuickSearchReq) + '}';
                        ajaxJsonCall("AddQuickSearch", params, callbackFunction, true, 'POST', true);
                    }
                }
            }
        }

        self.selectSearch = function (data, index) {

            var searchiid = self.SearchId();
            var deletedid = self.oldSearchid();
            istypeedquick = 1;

            if (data.SearchID != 0) {
                self.SearchId(data.SearchID);
                var d1 = self.SearchId();

                $("#txtQuickSearchDevice").val(data.SearchName);
                $("#txtQuickSearchDevice").prop('value', data.SearchName);

                $("#allQuickSearchUL").each(function () {
                    $(this).children('li').css("background-color", "");

                });
                $("#selectedSearchLi" + index).css("background-color", "#00aeef");
                var str = '<div class="panel-body">';
                str += '<div class="row">';
                str += '<span>';
                str += '' + data.SearchText + '';
                str += '</span>';
                str += '</div>';
                str += '</div>';
                $("#deviceCriteriaDiv").empty();
                $("#deviceCriteriaDiv").append(str);
                //$("#criteriabtnDiv").css("display", "inline");

                gID = '';

                if (ADSearchUtil.gridIdForAdvanceSearch == 'jqxgridForSelectedDevices') {
                    gID = getschedulscrenName();
                    gID = ADSearchUtil.gridIdForAdvanceSearch + gID;
                } else if (ADSearchUtil.gridIdForAdvanceSearch == "blankDevicejqxgrid") {
                    gId = "Devicejqxgrid";
                } else {
                    gID = ADSearchUtil.gridIdForAdvanceSearch;
                }


                var adStorage = JSON.parse(sessionStorage.getItem(gID + "adStorage"));
                if (adStorage) {
                    adStorage[0].searchText = data.SearchText;
                    adStorage[0].quickSearchName = data.SearchName;
                    var updatedAdStorage = JSON.stringify(adStorage);
                    window.sessionStorage.setItem(gID + 'adStorage', updatedAdStorage);
                }
                //var adStorage1 = JSON.parse(sessionStorage.getItem(gID + "adStorage"));

            }

        }


        self.confirmDelete = function (data) {
            $("#sQuickNameForDelete").text(data.SearchName);
            $("#deleteQuickConfirmationPopup").modal('show');

            self.SearchDataFordelete(data);
        }
        self.closedDeleteConfirmantion = function () {
            $("#deleteQuickConfirmationPopup").modal('hide');
            self.SearchDataFordelete(null);
        }
        self.deleteAdvancedSearch = function () {
            var data = self.SearchDataFordelete();

            var searchId = data.SearchID
            deleteSaveSearch(searchId, self.allSearches, data.SearchName);
            $("#deleteQuickConfirmationPopup").modal('hide');

        }

        self.editAdvancedSearch = function (data, index, openPopup, clearAdvancedSearch) {

            clearAdvancedSearch();
            ADSearchUtil.adEdit(true);
            ADSearchUtil.adCopy(false);
            ADSearchUtil.selectedADData(data);
            ADSearchUtil.selectedADIndex(index);
            openPopup('modelAdvancedSearch', 'jqxgridDeletedDevices', null);
        }

        self.copyAdvancedSearch = function (data, index, openPopup, clearAdvancedSearch) {
            clearAdvancedSearch();
            ADSearchUtil.adCopy(true);
            ADSearchUtil.adEdit(false);
            ADSearchUtil.selectedADData(data);
            ADSearchUtil.selectedADIndex(index);
            openPopup('modelAdvancedSearch', 'jqxgridDeletedDevices', null);
        }

        self.applyQuickSearchForChart = function (applyAdvancedSearchForChart) {
            var deletedid = self.oldSearchid();
            $("#td" + deletedid).removeClass('disabled');
            if ($("#txtQuickSearchDevice").val().trim() != '') {
                var str = '<div class="panel-body">';
                str += '<div class="row">';
                str += '<span>';
                str += '' + $("#txtQuickSearchDevice").val() + '';
                str += '</span>';
                str += '</div>';
                str += '</div>';
                $("#deviceCriteriaDiv").empty();
                $("#deviceCriteriaDiv").append(str);
                $("#deviceCriteriaDiv").removeClass('hide');
                var DeviceSearch = new Object();
                if (ADSearchUtil.AdScreenName == 'deletedDevice') {
                    DeviceSearch.DeviceStatus = ["Deleted"];
                } else {
                    DeviceSearch.DeviceStatus = null;
                }
                DeviceSearch.GroupIds = null;
                DeviceSearch.HierarchyIdsWithChildren = null;
                DeviceSearch.HierarchyIdsWithoutChildren = null;
                DeviceSearch.IsHierarchiesSelected = false;
                DeviceSearch.IsOnlyDeleteBlacklisted = false;
                DeviceSearch.SearchCriteria = null;
                DeviceSearch.SearchElements = null;
                DeviceSearch.SearchModels = null;
                DeviceSearch.SearchName = null;
                var QuickSurce = _.where(self.allSearches(), { SearchName: $("#txtQuickSearchDevice").val() })



                if (QuickSurce != '' && QuickSurce[0].SearchType != 2) {
                    DeviceSearch.SearchID = self.SearchId();
                    DeviceSearch.SearchText = $("#txtQuickSearchDevice").val();
                    DeviceSearch.SearchType = ENUM.get('ADVANCED');
                } else {

                    var gId = ADSearchUtil.gridIdForAdvanceSearch;
                    var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
                    if (adStorage) {
                        adStorage[0].searchText = $("#txtQuickSearchDevice").val();
                        adStorage[0].quickSearchName = $("#txtQuickSearchDevice").val();
                        var updatedAdStorage = JSON.stringify(adStorage);
                        window.sessionStorage.setItem(gId + 'adStorage', updatedAdStorage);
                    }


                    DeviceSearch.SearchID = 0;
                    DeviceSearch.SearchText = $("#txtQuickSearchDevice").val();
                    DeviceSearch.SearchType = ENUM.get('QUICK');
                }
                ADSearchUtil.deviceSearchObj = DeviceSearch;



                var gId = ADSearchUtil.gridIdForAdvanceSearch;


                updateAdSearchObj(gId, DeviceSearch, 1);

                applyAdvancedSearchForChart();
                $("#criteriabtnDiv").css("display", "inline");
                $("#resetBtnForChart").removeClass('hide');

                $("#resetBtnForGrid").addClass('hide');


                var deleteid = self.SearchId();
                $("#td" + deleteid).addClass('disabled');
            }

        }
        //$("#criteriabtnDiv").css("display", "none");
        $("#btnApplyFilterChart").prop('disabled', true);
        $("#btnApplyFilter").prop('disabled', true);
        //$("#resetBtnForChart").addClass('hide');
        ///commited for schedule reresh button hide issue issue
        if (ADSearchUtil.deviceSearchObj) {
            if (ADSearchUtil.deviceSearchObj.SearchText || ADSearchUtil.deviceSearchObj.SearchText != undefined) {

                if (ADSearchUtil.AdScreenName == 'deviceSearch') {

                    $("#resetBtnForGrid").addClass('hide');
                    $("#resetBtnForChart").addClass('hide');
                    $("#A1").hide();
                } else {
                    if (ADSearchUtil.AdScreenName == 'schedule') {
                        selectedGridId = 'jqxgridForSelectedDevices';
                        var srName = getschedulscrenName();
                        var strGID = selectedGridId + srName;
                        var adStorage = JSON.parse(sessionStorage.getItem(strGID + "adStorage"));

                        if (adStorage != null) {
                            if (adStorage[0].isFromDevice == 1) {
                                $("#resetBtnForGrid").addClass('hide');
                                $("#resetBtnForChart").addClass('hide');
                                $("#A1").hide();
                            }
                        }

                    }
                }

            } else {
                $("#resetBtnForGrid").addClass('hide');
                $("#resetBtnForChart").addClass('hide');

            }
        } else {

            $("#resetBtnForGrid").addClass('hide');
            $("#resetBtnForChart").addClass('hide');
        }

        self.allSearches(ADSearchUtil.ADAllSearches());

        self.expandUL = function () {
            koUtil.checkQuckDDL = 1;
            self.allSearches(ADSearchUtil.ADAllSearches());
        }

        //$("#txtQuickSearchDevice").keyup(function (e) {
        //    var count = 0;
        //    if (e.keyCode != 8) {
        //        var filter = $(this).val();

        //        $("#allQuickSearchUL li").each(function () {

        //            if ($(this).text().search(new RegExp(filter, "i")) < 0) {
        //                if ($(this).text().indexOf("-------Last Searches-------") < 0) {
        //                    if ($(this).text().indexOf("-------Private-------") < 0) {
        //                        if ($(this).text().indexOf("-------Public-------") < 0) {
        //                            $(this).hide();
        //                        }
        //                    }
        //                }
        //                //if ($(this).text().indexOf("-------Last Searches-------") < 0) {

        //                //}
        //                //$("#txtQuickSearchDevice").val($(this).closest('table').closest('tr').children('td:first').text());

        //            } else {
        //                $(this).show();
        //                if (filter.indexOf($("#txtQuickSearchDevice").val()) == 0) {
        //                    if (count == 0) {
        //                        if ($(this).text().indexOf("-------Last Searches-------") < 0) {
        //                            if ($(this).text().indexOf("-------Private-------") < 0) {
        //                                if ($(this).text().indexOf("-------Public-------") < 0) {
        //                                    $("#txtQuickSearchDevice").val($(this).children('table').children('tbody').children('tr').children('td:first').children('a').children('span').text())
        //                                    $(this).css("background-color", "red");
        //                                }
        //                            }
        //                        }
        //                        count = 1;
        //                    }
        //                }


        //            }

        //        });
        //    } else {
        //        count = 0;
        //    }


        //});

        $("#txtQuickSearchDevice").keyup(function (e) {
            var filter = $(this).val();
            $("#allQuickSearchUL li").each(function () {
                var regExpval = new RegExp(filter, "i")
                if ($(this).text().search(regExpval) < 0) {
                    if ($(this).text().indexOf("-------Last Searches-------") < 0) {
                        if ($(this).text().indexOf("-------Private-------") < 0) {
                            if ($(this).text().indexOf("-------Public-------") < 0) {
                                $(this).hide();
                            }
                        }
                    }

                } else {
                    //var str = $(this).children('table').children('tbody').children('tr').children('td:first').children('a').children('span').text();//$("#txtQuickSearchDevice").val();
                    //if (str.indexOf($("#txtQuickSearchDevice").val()) == 0) {
                    $(this).show();
                    //} else {
                    //    $(this).hide();
                    //}
                }

            });

            //-------------when filter value is blank background color reset---------
            if (filter == '') {
                $("#allQuickSearchUL").each(function () {
                    $(this).children('li').css("background-color", "");
                });
            }

            if (e.keyCode == 13) {
                koUtil.checkQuckDDL = 0;
                $("#allQuickSearchUL").addClass('hide');
                $("#allSearchUL").addClass('hide');
                self.addQuickSearch();

            }


        });

        $("#txtQuickSearchDevice").on("click", function () {
            var filter = $(this).val();
            $("#allQuickSearchUL li").each(function () {

                if ($(this).text().search(new RegExp(filter, "i")) < 0) {
                    if ($(this).text().indexOf("-------Last Searches-------") < 0) {
                        if ($(this).text().indexOf("-------Private-------") < 0) {
                            if ($(this).text().indexOf("-------Public-------") < 0) {
                                $(this).hide();
                            }
                        }
                    }

                } else {
                    $(this).show();
                }

            });
        });

        var gId = '';//ADSearchUtil.gridIdForAdvanceSearch;
        if (ADSearchUtil.gridIdForAdvanceSearch == 'jqxgridForSelectedDevices') {
            gId = getschedulscrenName();
            gId = ADSearchUtil.gridIdForAdvanceSearch + gId;
        } else if (ADSearchUtil.gridIdForAdvanceSearch == "blankDevicejqxgrid") {
            gId = "Devicejqxgrid";
        } else {
            gId = ADSearchUtil.gridIdForAdvanceSearch;
        }
        var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
        if (adStorage) {
            if (adStorage && adStorage[0] && adStorage[0].isAdSearch == 0) {

            } else {
                if (adStorage[0].quickSearchName != undefined) {
                    $("#txtQuickSearchDevice").val(adStorage[0].quickSearchName);
                }

            }
        }






        ////for up down key on all search dropdown
        var chosen = "";
        var liscrollpos = 10;
        var childIdx = 0;
        selectedtextforupdown = '';
        var checkpos = 0;
        var clickUpcount = 0;
        var change = 0;
        var currentIndex = 0;
        var upIndex = 0;
        var downIndex = 0;
        checkenter = 0;
        $(document).keydown(function (e) {

            if (e.keyCode == 13) {

                if (ADSearchUtil.AdScreenName == 'deviceSearch') {
                    if ($(".advance-search-result").hasClass("dn")) {


                    } else {

                        if ($("#allQuickSearchUL").hasClass('hide')) {
                            if ($("#txtQuickSearchDevice").is(":focus")) {
                                if ($("#txtQuickSearchDevice").val() != '') {
                                    $("#allQuickSearchUL").addClass('hide');
                                    $("#allSearchUL").addClass('hide');
                                    koUtil.checkQuckDDL = 0;
                                    self.addQuickSearch();
                                } else {

                                }
                            }

                        } else {
                            if (selectedtextforupdown != AppConstants.get('PRIVATE_SEARCH') && selectedtextforupdown != AppConstants.get('PUBLIC_SEARCH') && selectedtextforupdown != '-------Last Searches-------') {

                                //$("#txtQuickSearchDevice").val(selectedtextforupdown);
                                //$("#allQuickSearchUL").addClass('hide')
                                if ($("#txtQuickSearchDevice").is(":focus")) {

                                    if (checkenter == 1) {

                                        checkenter = 0;
                                        $("#txtQuickSearchDevice").val(selectedtextforupdown);

                                    } else {

                                        koUtil.checkQuckDDL = 0;
                                        self.addQuickSearch();
                                    }
                                }
                                $("#allQuickSearchUL").addClass('hide')

                            }

                        }

                    }
                } else {

                    if ($("#allQuickSearchUL").hasClass('hide')) {
                        if ($("#txtQuickSearchDevice").is(":focus")) {

                            if ($("#txtQuickSearchDevice").val() != '') {

                                $("#allQuickSearchUL").addClass('hide');
                                $("#allSearchUL").addClass('hide');
                                koUtil.checkQuckDDL = 0;
                                self.addQuickSearch();
                            } else {

                            }
                        }

                    } else {

                        if (selectedtextforupdown != AppConstants.get('PRIVATE_SEARCH') && selectedtextforupdown != AppConstants.get('PUBLIC_SEARCH') && selectedtextforupdown != '-------Last Searches-------') {

                            if ($("#txtQuickSearchDevice").is(":focus")) {

                                if (checkenter == 1) {

                                    checkenter = 0;
                                    $("#txtQuickSearchDevice").val(selectedtextforupdown);

                                } else {

                                    koUtil.checkQuckDDL = 0;
                                    self.addQuickSearch();
                                }
                            }
                            $("#allQuickSearchUL").addClass('hide')

                        }

                    }

                }




            }

            if (e.keyCode == 40) {

                if (chosen == $('#allSearchUL li').length - 1) {
                    //chosen = "";
                    // liscrollpos = 10;
                    // childIdx = 0;
                    //selectedtextforupdown = '';
                    // checkpos = 0;
                    // clickUpcount = 0;
                    // change = 0;
                    // currentIndex = 0;
                    // upIndex = 0;
                    // downIndex = 0;
                } else {


                    checkenter = 1;
                    if (ADSearchUtil.AdScreenName == 'deviceSearch') {
                        if ($(".advance-search-result").hasClass("dn")) {
                            if (chosen === "") {
                                chosen = 0;
                            } else if ((chosen) < $('#allSearchUL li').length) {
                                chosen++;
                                if (clickUpcount <= 11) {
                                    if (change == 1) {
                                        change = 0;
                                    }
                                    clickUpcount++;
                                }
                            }
                            currentIndex = chosen;
                            downIndex = chosen;
                            $('#allSearchUL li').removeClass('selected');

                            if ($('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text() != AppConstants.get('PRIVATE_SEARCH') && $('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text() != AppConstants.get('PUBLIC_SEARCH') && $('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text() != '-------Last Searches-------') {
                                $('#allSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                                selectedtextforupdown = $('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text();
                                if (clickUpcount > 11) {
                                    checkpos = checkpos + 1;
                                    var s = 25 * checkpos;
                                    $("#allSearchUL").scrollTop(s);
                                }
                            } else {
                                chosen = chosen + 1;
                                clickUpcount = clickUpcount + 1;
                                $('#allSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                                selectedtextforupdown = $('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text();
                                if (clickUpcount > 11) {
                                    checkpos = checkpos + 1;
                                    var s = 25 * checkpos;
                                    $("#allSearchUL").scrollTop(s);
                                }

                            }
                            //$('#allSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                            //selectedtextforupdown = $('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text();
                            //if (clickUpcount > 11) {
                            //    checkpos = checkpos + 1;
                            //    var s = 25 * checkpos;
                            //    $("#allSearchUL").scrollTop(s);
                            //}


                        } else {

                            if (chosen === "") {
                                chosen = 0;
                            } else if ((chosen) < $('#allSearchUL li').length) {
                                chosen++;
                                if (clickUpcount <= 11) {
                                    if (change == 1) {
                                        change = 0;
                                    }
                                    clickUpcount++;
                                }
                            }
                            currentIndex = chosen;
                            downIndex = chosen;
                            $('#allQuickSearchUL li').removeClass('selected');
                            selectedtextforupdown = $('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr:first td a span').text();
                            if (selectedtextforupdown != AppConstants.get('PRIVATE_SEARCH') && selectedtextforupdown != AppConstants.get('PUBLIC_SEARCH') && selectedtextforupdown != '-------Last Searches-------') {

                                $('#allQuickSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                                //$('#allQuickSearchUL li:visible:eq(' + chosen + ')').focus();
                                selectedtextforupdown = $('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr:first td a span').text();
                                if (clickUpcount > 11) {
                                    checkpos = checkpos + 1;
                                    var s = 25 * checkpos;
                                    $("#allQuickSearchUL").scrollTop(s);
                                }
                            } else {

                                chosen = chosen + 1;
                                clickUpcount = clickUpcount + 1;
                                $('#allQuickSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                                //$('#allQuickSearchUL li:visible:eq(' + chosen + ')').focus();
                                selectedtextforupdown = $('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr:first td a span').text();
                                if (clickUpcount > 11) {
                                    checkpos = checkpos + 1;
                                    var s = 25 * checkpos;
                                    $("#allQuickSearchUL").scrollTop(s);
                                }
                            }

                        }
                    } else {

                        if (chosen === "") {
                            chosen = 0;
                        } else if ((chosen) < $('#allQuickSearchUL li').length) {
                            chosen++;
                            if (clickUpcount <= 11) {
                                if (change == 1) {
                                    change = 0;
                                }
                                clickUpcount++;
                            }
                        }
                        currentIndex = chosen;
                        downIndex = chosen;
                        $('#allQuickSearchUL li').removeClass('selected');
                        selectedtextforupdown = $('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr:first td a span').text();
                        if (selectedtextforupdown != AppConstants.get('PRIVATE_SEARCH') && selectedtextforupdown != AppConstants.get('PUBLIC_SEARCH') && selectedtextforupdown != '-------Last Searches-------') {

                            $('#allQuickSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                            //$('#allQuickSearchUL li:visible:eq(' + chosen + ')').focus();
                            selectedtextforupdown = $('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr:first td a span').text();
                            if (clickUpcount > 11) {
                                checkpos = checkpos + 1;
                                var s = 25 * checkpos;
                                $("#allQuickSearchUL").scrollTop(s);
                            }
                        } else {

                            chosen = chosen + 1;
                            clickUpcount = clickUpcount + 1;
                            $('#allQuickSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                            //$('#allQuickSearchUL li:visible:eq(' + chosen + ')').focus();
                            selectedtextforupdown = $('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr:first td a span').text();
                            if (clickUpcount > 11) {
                                checkpos = checkpos + 1;
                                var s = 25 * checkpos;
                                $("#allQuickSearchUL").scrollTop(s);
                            }
                        }

                    }
                }

            }
            if (e.keyCode == 38) {

                checkenter = 1;
                if (ADSearchUtil.AdScreenName == 'deviceSearch') {
                    if ($(".advance-search-result").hasClass("dn")) {
                        if ($('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text() != '-------Last Searches-------') {
                            if (chosen === "") {
                                chosen = 0;
                            } else if (chosen > 0) {
                                chosen--;
                                if (clickUpcount > 0) {
                                    if (change == 0) {
                                        change = 1;
                                        clickUpcount = clickUpcount + 1;
                                    }
                                    clickUpcount--;
                                }

                            }
                            upIndex = chosen;
                            $('#allSearchUL li').removeClass('selected');
                            if ($('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text() != AppConstants.get('PRIVATE_SEARCH') && $('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text() != AppConstants.get('PUBLIC_SEARCH') && $('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text() != '-------Last Searches-------') {
                                $('#allSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                                selectedtextforupdown = $('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text();
                                var k = currentIndex - 12;
                                if (clickUpcount <= 1) {
                                    checkpos = checkpos - 1;
                                    var s = 25 * checkpos;
                                    $("#allSearchUL").scrollTop(s);
                                }
                            } else {
                                if ($('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text() != '-------Last Searches-------') {
                                    chosen = chosen - 1;
                                    clickUpcount = clickUpcount - 1;
                                }
                                //clickUpcount = clickUpcount-1
                                $('#allSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                                selectedtextforupdown = $('#allSearchUL li:visible:eq(' + chosen + ') table tr td a span').text();
                                var k = currentIndex - 12;
                                if (clickUpcount <= 1) {
                                    checkpos = checkpos - 1;
                                    var s = 25 * checkpos;
                                    $("#allSearchUL").scrollTop(s);
                                }
                            }


                        }

                    } else {
                        if ($('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr td a span').text() != '-------Last Searches-------') {
                            if (chosen === "") {
                                chosen = 0;
                            } else if (chosen > 0) {
                                chosen--;
                                if (clickUpcount > 0) {
                                    if (change == 0) {
                                        change = 1;
                                        clickUpcount = clickUpcount + 1;
                                    }
                                    clickUpcount--;
                                }

                            }
                            upIndex = chosen;
                            $('#allQuickSearchUL li').removeClass('selected');
                            selectedtextforupdown = $('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr:first td a span').text();
                            if (selectedtextforupdown != AppConstants.get('PRIVATE_SEARCH') && selectedtextforupdown != AppConstants.get('PUBLIC_SEARCH') && selectedtextforupdown != '-------Last Searches-------') {
                                $('#allQuickSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                                selectedtextforupdown = $('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr:first td a span').text();
                                var k = currentIndex - 12;
                                if (clickUpcount <= 1) {
                                    checkpos = checkpos - 1;
                                    var s = 25 * checkpos;
                                    $("#allQuickSearchUL").scrollTop(s);
                                }
                            } else {
                                chosen = chosen - 1;
                                clickUpcount = clickUpcount - 1
                                $('#allQuickSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                                selectedtextforupdown = $('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr:first td a span').text();
                                var k = currentIndex - 12;
                                if (clickUpcount <= 1) {
                                    checkpos = checkpos - 1;
                                    var s = 25 * checkpos;
                                    $("#allQuickSearchUL").scrollTop(s);
                                }
                            }
                        }
                    }
                } else {
                    if ($('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr td a span').text() != '-------Last Searches-------') {
                        if (chosen === "") {
                            chosen = 0;
                        } else if (chosen > 0) {
                            chosen--;
                            if (clickUpcount > 0) {
                                if (change == 0) {
                                    change = 1;
                                    clickUpcount = clickUpcount + 1;
                                }
                                clickUpcount--;
                            }

                        }
                        upIndex = chosen;

                        $('#allQuickSearchUL li').removeClass('selected');
                        selectedtextforupdown = $('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr:first td a span').text();
                        if (selectedtextforupdown != AppConstants.get('PRIVATE_SEARCH') && selectedtextforupdown != AppConstants.get('PUBLIC_SEARCH') && selectedtextforupdown != '-------Last Searches-------') {
                            $('#allQuickSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                            selectedtextforupdown = $('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr:first td a span').text();
                            var k = currentIndex - 12;
                            if (clickUpcount <= 1) {
                                checkpos = checkpos - 1;
                                var s = 25 * checkpos;
                                $("#allQuickSearchUL").scrollTop(s);
                            }
                        } else {
                            chosen = chosen - 1;
                            clickUpcount = clickUpcount - 1;
                            $('#allQuickSearchUL li:visible:eq(' + chosen + ')').addClass('selected');
                            selectedtextforupdown = $('#allQuickSearchUL li:visible:eq(' + chosen + ') table tr:first td a span').text();
                            var k = currentIndex - 12;
                            if (clickUpcount <= 1) {
                                checkpos = checkpos - 1;
                                var s = 25 * checkpos;
                                $("#allQuickSearchUL").scrollTop(s);
                            }
                        }

                    }
                }
            }



        });
        seti18nResourceData(document, resourceStorage);
    };



    function deleteSaveSearch(searchId, allSearches, searchName) {


        var deleteAdvanedSearchReq = new Object();
        deleteAdvanedSearchReq.SearchId = searchId;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    var msg = i18n.t('search_delete_success', { lng: lang, deletedsearchname: searchName })
                    openAlertpopup(0, msg);
                    getAllSearches(allSearches);
                    $("#txtQuickSearchDevice").val('');
                }
            }
        }

        var params = '{"token":"' + TOKEN() + '","deleteAdvanedSearchReq":' + JSON.stringify(deleteAdvanedSearchReq) + '}';
        ajaxJsonCall('DeleteAdvancedSearch', params, callbackFunction, true, 'POST', true);
    }

    function getAllSearches(allSearches) {
        function callbackFunction(data, error) {
            if (data) {

                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    allSearches([]);
                    var privateSearch = new Array();
                    var publicSearch = new Array();
                    var quickSearch = new Array();
                    if (data.getAllSearchesResp) {
                        data.getAllSearchesResp = $.parseJSON(data.getAllSearchesResp);
                        if (data.getAllSearchesResp.Searches) {
                            for (var i = 0; i < data.getAllSearchesResp.Searches.length; i++) {
                                var saveSearchdata = new Object();
                                saveSearchdata.SearchID = data.getAllSearchesResp.Searches[i].SearchID;
                                if (data.getAllSearchesResp.Searches[i].SearchType == 2) {
                                    saveSearchdata.SearchName = data.getAllSearchesResp.Searches[i].SearchText;
                                } else {
                                    saveSearchdata.SearchName = data.getAllSearchesResp.Searches[i].SearchName;
                                }

                                saveSearchdata.SearchText = data.getAllSearchesResp.Searches[i].SearchText;
                                saveSearchdata.SearchType = data.getAllSearchesResp.Searches[i].SearchType;
                                saveSearchdata.IsPrivateSearch = data.getAllSearchesResp.Searches[i].IsPrivateSearch;
                                saveSearchdata.IsAdmin = data.getAllSearchesResp.Searches[i].IsAdmin;

                                if (data.getAllSearchesResp.Searches[i].SearchType == 2) {
                                    //ADSearchUtil.quickSearch = saveSearchdata;
                                    //quickSearch.push(saveSearchdata);
                                    //quickSearch.sort(function (a, b) { return a.SearchName.toLowerCase() > b.SearchName.toLowerCase() ? 1 : -1; })
                                } else {
                                    if (data.getAllSearchesResp.Searches[i].IsPrivateSearch) {
                                        ADSearchUtil.privateSearch = saveSearchdata;
                                        privateSearch.push(saveSearchdata);
                                        privateSearch.sort(function (a, b) { return a.SearchName.toLowerCase() > b.SearchName.toLowerCase() ? 1 : -1; })
                                    } else {
                                        ADSearchUtil.publicSearch = saveSearchdata;
                                        publicSearch.push(saveSearchdata);
                                        publicSearch.sort(function (a, b) { return a.SearchName.toLowerCase() > b.SearchName.toLowerCase() ? 1 : -1; })
                                    }
                                }
                            }

                            //var saveSearchdata = new Object();
                            //saveSearchdata.SearchID = 0;
                            //saveSearchdata.SearchName = '-------Last Searches-------';
                            //saveSearchdata.SearchText = '-------Last Searches-------';
                            //saveSearchdata.SearchType = 2;
                            //saveSearchdata.IsPrivateSearch = '';
                            //allSearches.push(saveSearchdata);
                            //for (var i = 0; i < quickSearch.length; i++) {
                            //    allSearches.push(quickSearch[i]);
                            //}


                            var saveSearchdata = new Object();
                            saveSearchdata.SearchID = 0;
                            saveSearchdata.SearchName = AppConstants.get('PRIVATE_SEARCH');
                            saveSearchdata.SearchText = AppConstants.get('PRIVATE_SEARCH');
                            saveSearchdata.SearchType = 2;
                            saveSearchdata.IsPrivateSearch = '';
                            saveSearchdata.IsAdmin = false;
                            allSearches.push(saveSearchdata);
                            for (var i = 0; i < privateSearch.length; i++) {
                                allSearches.push(privateSearch[i]);
                            }
                            var saveSearchdata = new Object();
                            saveSearchdata.SearchID = 0;
                            saveSearchdata.SearchName = AppConstants.get('PUBLIC_SEARCH');
                            saveSearchdata.SearchText = AppConstants.get('PUBLIC_SEARCH');
                            saveSearchdata.SearchType = 2;
                            saveSearchdata.IsPrivateSearch = '';
                            saveSearchdata.IsAdmin = false;
                            allSearches.push(saveSearchdata);
                            for (var i = 0; i < publicSearch.length; i++) {
                                allSearches.push(publicSearch[i]);
                            }

                            ADSearchUtil.ADAllSearches(allSearches());
                        }
                    }
                }
            }
        }
        var params = '{"token":"' + TOKEN() + '"}';
        ajaxJsonCall("GetAllSearches", params, callbackFunction, true, 'POST', false);
    }
});

