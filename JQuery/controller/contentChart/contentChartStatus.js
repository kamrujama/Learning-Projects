define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil, ADSearchUtil) {
    var lang = getSysLang();
    return function DashBoardViewModel() {
   

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

        ischartpageLoad = 0;

        var self = this;

        //Draggable function
        $('#mdlAdvForContentChartHeader').mouseup(function () {
            $("#mdlAdvForContentChartContent").draggable({ disabled: true });
        });

        $('#mdlAdvForContentChartHeader').mousedown(function () {
            $("#mdlAdvForContentChartContent").draggable({ disabled: false });
        });




        var windowHeight = $(window).height();

        var chartTop = $('#jqxChartContentStatus').offset().top;

        var chartHeight = windowHeight - chartTop - $(".fixed-footer").height() - 68;
        $('#jqxChartContentStatus').css("height", chartHeight);

        /////////

        self.AdvanceTemplateFlag = ko.observable(false);
        self.observableCriteria = ko.observable();
        self.observableModelPopup = ko.observable();
        self.observableAdvancedSearchModelPopup = ko.observable();
        ADSearchUtil.SearchForChart = true;
        ADSearchUtil.SearchForGrid = false;

        loadelement('unloadTemplate', 'genericPopup');
        loadCriteria('modalCriteria', 'genericPopup');
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        ADSearchUtil.deviceSearchObj = new Object()
        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridCoulmns = [];
        ADSearchUtil.AdScreenName = 'chartContentStatus';

        setMenuSelection();
        modelReposition();
        //open advance search poup
        self.openPopup = function (popupName) {
            if (popupName == 'modelAdvancedSearch') {
                self.AdvanceTemplateFlag(true);
                loadAdvancedSearchModelPopup(popupName, 'genericPopup');
                $('#AdvanceSearchModal').modal('show');
            }
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        //unload advance serach popup
        self.unloadAdvancedSearch = function () {
            repositionAdvanceSearchPopUp("mdlAdvForContentChartContent");
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            $("#AdvanceSearchModal").modal('hide');
            $("#mainPageBody").removeClass('modal-open-appendon');
            isAdpopup = '';
        }

        self.clearAdvancedSearch = function () {
            repositionAdvanceSearchPopUp("mdlAdvForContentChartContent");
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
        }

        self.expandCriteria = function () {
            if ($("#deviceCriteriaDiv").hasClass('hide')) {
                $("#deviceCriteriaDiv").removeClass('hide');
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Collapse"><i class="icon-angle-up"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            } else {
                $("#deviceCriteriaDiv").addClass('hide')
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default btn-xs" tabindex="0"  role="button"  title="Expand"><i class="icon-angle-down"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            }
        }

        //for advance search
        function loadCriteria(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                //new template code
                var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
                var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
                ko.components.register(elementname, {
                    viewModel: { require: ViewName },
                    template: { require: 'plugin/text!' + htmlName }
                });
            }
            self.observableCriteria(elementname);
        }

        function loadAdvancedSearchModelPopup(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                //new template code
                var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
                var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
                ko.components.register(elementname, {
                    viewModel: { require: ViewName },
                    template: { require: 'plugin/text!' + htmlName }
                });
            }
            self.observableAdvancedSearchModelPopup(elementname);
        }

        //Reset filter
        self.applyAdvancedSearchForChart = function () {
            var week = '';
            var chartName = 'jqxChartContentStatus';
            var chartStorage = JSON.parse(sessionStorage.getItem(chartName + "chartStorage"));
            if (chartS1 = null) {
                week = chartStorage[0].week;
                dateTo = chartStorage[0].toDate;
                dateFrom = chartStorage[0].fromDate;
            }
            var adStorage = JSON.parse(sessionStorage.getItem(chartName + "adStorage"));
            if (adStorage[0].isAdSearch == 0) {
                if (adStorage[0].adSearchObj) {
                    ADSearchUtil.deviceSearchObj = adStorage[0].adSearchObj;
                } else {
                    ADSearchUtil.deviceSearchObj = null;
                }
            } else {
                if (adStorage[0].quickSearchObj) {
                    ADSearchUtil.deviceSearchObj = adStorage[0].quickSearchObj;
                } else {
                    ADSearchUtil.deviceSearchObj = null;
                }
            }
            getChartContentJobStatusDetails('jqxChartContentStatus', week, dateTo, dateFrom, ADSearchUtil.deviceSearchObj, self.observableAdvancedSearchModelPopup)
        }

        // get dropdown week
        self.getContentWeeksDates = ko.observableArray([i18n.t('1week'), i18n.t('2weeks'), i18n.t('3weeks'), i18n.t('4weeks')]);

        var dateTo = "";
        var dateFrom = "";

        // refresh and show 1 week data on chart
        self.refreshGrid = function () {
            dateTo = moment();
            dateFrom = moment().subtract(AppConstants.get('SUBTRACT_FIRST_WEEK'), 'd').format(LONG_DATE_FORMAT_TIME);

            var chartName = 'jqxChartContentStatus';
            var chartStorage = JSON.parse(sessionStorage.getItem(chartName + "chartStorage"));
            if (chartStorage) {
                chartStorage[0].week = '1 Week';
                chartStorage[0].fromDate = dateFrom;
                chartStorage[0].toDate = dateTo;

                var updatedChartStorage = JSON.stringify(chartStorage);
                window.sessionStorage.setItem(chartName + 'chartStorage', updatedChartStorage);
            }

            getChartContentJobStatusDetails('jqxChartContentStatus', '1 Week', dateTo, dateFrom, ADSearchUtil.deviceSearchObj, self.observableAdvancedSearchModelPopup);

            $('#contentWeek').val(i18n.t('1week')).prop("selected", "selected");
            $('#contentWeek').trigger('chosen:updated');
        }

        // display data on chart based on selected week
        $('.my_select_box').on('change', function (evt, params) {

            var week = '1 Week';
            var chartName = 'jqxChartContentStatus';
            //var chartStorage = JSON.parse(sessionStorage.getItem(chartName + "chartStorage"));
            var initToDate = moment();
            var initFromDate = moment().subtract(AppConstants.get('SUBTRACT_FIRST_WEEK'), 'd').format(LONG_DATE_FORMAT_TIME);
            var InitChartStoragObj = initChartStorageObj(chartName, week, initToDate, initFromDate, ADSearchUtil.deviceSearchObj);
            var chartStorage = InitChartStoragObj.chartStorage;
            var adStorage = InitChartStoragObj.adStorage;

            var adStorage = JSON.parse(sessionStorage.getItem(chartName + "adStorage"));
            if (adStorage[0].isAdSearch == 0) {
                if (adStorage[0].adSearchObj) {
                    ADSearchUtil.deviceSearchObj = adStorage[0].adSearchObj;
                } else {
                    ADSearchUtil.deviceSearchObj = null;
                }
            } else {
                if (adStorage[0].quickSearchObj) {
                    ADSearchUtil.deviceSearchObj = adStorage[0].quickSearchObj;
                } else {
                    ADSearchUtil.deviceSearchObj = null;
                }
            }

            if (chartStorage) {

                if (chartStorage[0].isInit != 0) {

                    if (ischartpageLoad == 0) {

                        week = chartStorage[0].week;
                        dateTo = chartStorage[0].toDate;
                        dateFrom = chartStorage[0].fromDate;
                        ischartpageLoad = 1;
                        $('#contentWeek').val(week).prop("selected", "selected");
                        $('#contentWeek').trigger('chosen:updated');

                    } else {

                        week = $(".my_select_box").find('option:selected').val();
                        dateTo = moment();
                        if (week == AppConstants.get('FIRST_WEEK')) {
                            dateFrom = moment().subtract(AppConstants.get('SUBTRACT_FIRST_WEEK'), 'd').format(LONG_DATE_FORMAT_TIME);
                        } else if (week == AppConstants.get('SECOND_WEEKS')) {
                            dateFrom = moment().subtract(AppConstants.get('SUBTRACT_SECOND_WEEKS'), 'd').format(LONG_DATE_FORMAT_TIME);
                        } else if (week == AppConstants.get('THIRD_WEEKS')) {
                            dateFrom = moment().subtract(AppConstants.get('SUBTRACT_THIRD_WEEKS'), 'd').format(LONG_DATE_FORMAT_TIME);
                        } else if (week == AppConstants.get('FOURTH_WEEKS')) {
                            dateFrom = moment().subtract(AppConstants.get('SUBTRACT_FOURTH_WEEKS'), 'd').format(LONG_DATE_FORMAT_TIME);
                        }
                        if (chartStorage) {
                            chartStorage[0].week = week;
                            chartStorage[0].fromDate = dateFrom;
                            chartStorage[0].toDate = dateTo;
                            chartStorage[0].isInit = 1;
                            var updatedChartStorage = JSON.stringify(chartStorage);
                            window.sessionStorage.setItem(chartName + 'chartStorage', updatedChartStorage);
                        }
                    }

                } else {

                    week = chartStorage[0].week;
                    dateTo = chartStorage[0].toDate;
                    dateFrom = chartStorage[0].fromDate;

                    ischartpageLoad = 1;
                    chartStorage[0].isInit = 1;
                    var updatedChartStorage = JSON.stringify(chartStorage);
                    window.sessionStorage.setItem(chartName + 'chartStorage', updatedChartStorage);
                }

            } else {
            }


            getChartContentJobStatusDetails('jqxChartContentStatus', week, dateTo, dateFrom, ADSearchUtil.deviceSearchObj, self.observableAdvancedSearchModelPopup);

            //var week = $(".my_select_box").find('option:selected').val();
            //dateTo = moment();

            //if (week == AppConstants.get('FIRST_WEEK')) {
            //    dateFrom = moment().subtract(AppConstants.get('SUBTRACT_FIRST_WEEK'), 'd').format(LONG_DATE_FORMAT_TIME);
            //} else if (week == AppConstants.get('SECOND_WEEKS')) {
            //    dateFrom = moment().subtract(AppConstants.get('SUBTRACT_SECOND_WEEKS'), 'd').format(LONG_DATE_FORMAT_TIME);
            //} else if (week == AppConstants.get('THIRD_WEEKS')) {
            //    dateFrom = moment().subtract(AppConstants.get('SUBTRACT_THIRD_WEEKS'), 'd').format(LONG_DATE_FORMAT_TIME);
            //} else if (week == AppConstants.get('FOURTH_WEEKS')) {
            //    dateFrom = moment().subtract(AppConstants.get('SUBTRACT_FOURTH_WEEKS'), 'd').format(LONG_DATE_FORMAT_TIME);
            //}
            //getChartContentJobStatusDetails(dateTo, dateFrom, ADSearchUtil.deviceSearchObj);
        });

        ADSearchUtil.gridIdForAdvanceSearch = 'jqxChartContentStatus';

        //alert('loaded');

        seti18nResourceData(document, resourceStorage);
    };

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
    function getHighest(array) {
        var max = {};
        for (var i = 0; i < array.length; i++) {
            if (array[i].Count > (max.Count || 0))
                max = array[i];
        }

        if (max.Count == undefined) {
            max.Count = 0;
        }
        return max;
    }

    //display chart
    function stackChartContentJobStatus(data, dateTo, dateFrom) {
        var valAxis = new Object();
       
   
            var countAarry = [];
            var totalCount = 0;
            for (i = 0; i < data.length; i++) {
                if (data[i].ContentReplacedCount != undefined) {
                    totalCount = totalCount + data[i].ContentReplacedCount;
                }
                if (data[i].ContentReplaceFailedCount != undefined) {
                    totalCount = totalCount + data[i].ContentReplaceFailedCount;
                }
                if (data[i].DownloadFailedCount != undefined) {
                    totalCount = totalCount + data[i].DownloadFailedCount;
                }
                if (data[i].DownloadStartedCount != undefined) {
                    totalCount = totalCount + data[i].DownloadStartedCount;
                }
                if (data[i].DownloadSuccessfulCount != undefined) {
                    totalCount = totalCount + data[i].DownloadSuccessfulCount;
                }
                if (data[i].InstallFailedCount != undefined) {
                    totalCount = totalCount + data[i].InstallFailedCount;
                }
                if (data[i].InstallSuccessfulCount != undefined) {
                    totalCount = totalCount + data[i].InstallSuccessfulCount;
                }
                if (data[i].InstallPostponedCount != undefined) {
                    totalCount = totalCount + data[i].InstallPostponedCount;
                }
                if (data[i].ScheduleSentCount != undefined) {
                    totalCount = totalCount + data[i].ScheduleSentCount;
                }
                if (data[i].ScheduleConfirmedCount != undefined) {
                    totalCount = totalCount + data[i].ScheduleConfirmedCount;
                }
                if (data[i].ScheduledCount != undefined) {
                    totalCount = totalCount + data[i].ScheduledCount;
                }
                var obj = new Object();
                obj.Count = totalCount;
                countAarry.push(obj);
            }

        var highest = getHighest(countAarry);
        var maxCount = 0;
        if (highest.Count < 6) {
            maxCount = 8;
        } else {
            maxCount = highest.Count;
        }
        if (data == 0) {
            valAxis = {
                displayValueAxis: true,
                showGridLines: false,
                minValue: 0,
                maxValue: 96,
                unitInterval: 6,
                title: { text: i18n.t('Number_Of_Downloads_lbl', { lng: lang }) },
                axisSize: 'auto',
                tickMarksColor: '#888888'
            };
        } else {
            if (highest.Count > 6) {
                var scalebase = 2;;
                if (maxCount > 8000) {
                    scalebase = 5;
                }
                valAxis = {
                    displayValueAxis: true,
                    showGridLines: false,
                    title: { text: i18n.t('Number_Of_Downloads_lbl', { lng: lang }) },
                    logarithmicScale: true,
                    logarithmicScaleBase: scalebase,
                    minValue: 0.5,
                    formatFunction: function (value, index, columnIndex) {
                        return Math.floor(value);
                    },
                axisSize: 'auto',
                tickMarksColor: '#888888'
            };
        } else {
            valAxis = {
                displayValueAxis: true,
                showGridLines: false,
                title: { text: i18n.t('Number_Of_Downloads_lbl', { lng: lang }) },
                axisSize: 'auto',
                    maxValue: maxCount,
                    unitInterval: 1,
                tickMarksColor: '#888888'
            };
        }
        }
        var jsonDateTo = jsonDateConversion(dateTo);
        var jsonDateFrom = jsonDateConversion(dateFrom);

        var settings = {
            title: false,
            description: false,
            enableAnimations: true,
            showLegend: true,
            padding: { left: 5, top: 5, right: 5, bottom: 5 },
            //legendLayout: {  width: 800,  flow: 'horizontal' },
            borderLineColor: 'white',
            source: data,
            toolTipShowDelay: 0,
            toolTipHideDelay: 2000,
            categoryAxis:
                {
                    text: 'Category Axis',
                    textRotationAngle: 0,
                    dataField: 'Date',
                    //type: 'date',
                    //baseUnit: 'day',
                    showTickMarks: true,
                    tickMarksInterval: 1,
                    minValue: jsonDateFrom,
                    maxValue: jsonDateTo,
                    tickMarksColor: '#888888',
                    unitInterval: 1,
                    showGridLines: false,
                    gridLinesInterval: 1,
                    gridLinesColor: '#888888',
                    axisSize: 'auto',
                    //formatFunction: function (value) {
                    //    return $.jqx.dataFormat.formatdate(value, 'MM/dd');
                    //}
                },
            seriesGroups:
                [
                    {
                        type: 'stackedcolumn',
                        columnsGapPercent: 100,
                        seriesGapPercent: 5,
                        useGradientColors: false,
                        valueAxis: valAxis,
                        //{                            
                        //    displayValueAxis: true,
                        //    showGridLines: false,
                        //    title: { text: i18n.t('Number_Of_Downloads_lbl', { lng: lang }) },
                        //    axisSize: 'auto',
                        //    tickMarksColor: '#888888'
                        //},
                        toolTipFormatFunction: function (value, itemIndex, serie, group, xAxisValue, xAxis) {
                            //var date = new Date(xAxisValue);
                            //var d = date.getDate();
                            //var m = date.getMonth();

                            var getTotalData = data[itemIndex].ScheduledCount + data[itemIndex].ScheduleSentCount + data[itemIndex].ScheduleConfirmedCount + data[itemIndex].DownloadFailedCount + data[itemIndex].DownloadStartedCount + data[itemIndex].DownloadSuccessfulCount + data[itemIndex].InstallFailedCount + data[itemIndex].InstallSuccessfulCount + data[itemIndex].ContentReplacedCount + data[itemIndex].ContentReplaceFailedCount;
                            var percentage = " ";
                            if (value == 0 || getTotalData == 0 || value == "NaN" || getTotalData == "NaN") {
                                percentage = " ";
                            } else {
                                percentage = "(" + ((value / getTotalData) * 100).toFixed(2) + "%)";
                            }

                            //var a1 = (m + 1);
                            //var a2 = d;

                            //var txta1 = ''
                            //if (a1 > 9)
                            //    txta1 = (m + 1);
                            //else
                            //    txta1 = "0" + (m + 1);


                            //var a2txt = '';
                            //if (a2 > 9)
                            //    txta2 = d;
                            //else
                            //txta2 = "0" + d;

                            var formattedTooltip = "<div style='text-align:left'>" +
                                "<b>" + serie.displayText + "</b>" + "</br>" +
                                  xAxisValue + "</br>" +
                                 value + " " + percentage + "</br>" +
                                 "<i>total</i>:" + " " + getTotalData + "</br></br></br>" +
                                "</div>";
                            return formattedTooltip;
                        },

                        series: [
                                { dataField: 'ScheduledCount', displayText: i18n.t('scheduled', { lng: lang }), fillColor: '#A600E8' },
                                { dataField: 'ScheduleSentCount', displayText: i18n.t('schedule_sent', { lng: lang }), fillColor: '#F241C6' },
                                { dataField: 'ScheduleConfirmedCount', displayText: i18n.t('schedule_confirmed', { lng: lang }), fillColor: '#159DC4' },
                                { dataField: 'DownloadFailedCount', displayText: i18n.t('download_failed', { lng: lang }), fillColor: '#E30000' },
                                { dataField: 'DownloadStartedCount', displayText: i18n.t('download_started', { lng: lang }), fillColor: '#008ED1' },
                                { dataField: 'DownloadSuccessfulCount', displayText: i18n.t('download_success', { lng: lang }), fillColor: '#FFFF00' },
                                { dataField: 'InstallFailedCount', displayText: i18n.t('install_failed', { lng: lang }), fillColor: '#FFA500' },
                                { dataField: 'InstallSuccessfulCount', displayText: i18n.t('install_success', { lng: lang }), fillColor: '#00FF00' },
                                { dataField: 'ContentReplacedCount', displayText: i18n.t('content_replace', { lng: lang }), fillColor: '#FF9933' },
                                { dataField: 'ContentReplaceFailedCount', displayText: i18n.t('content_replace_failed', { lng: lang }), fillColor: '#A0522D' },

                        ]
                    }
                ]
        };
        $('#jqxChartContentStatus').jqxChart(settings);
        $('#jqxChartContentStatus').jqxChart('refresh');

    }


    function getChartContentJobStatusDetails(chartName, week, dateTo, dateFrom, deviceSearchObj, modelPopup) {

        if (!isAdvancedSavedSearchApplied || koUtil.isSearchCancelled() == true) {
            $("#loadingDiv").show();
        }

        var adStorage = JSON.parse(sessionStorage.getItem(chartName + "adStorage"));

        updateOnState(chartName, deviceSearchObj, adStorage)

        var getDownloadResultsAggregateReq = new Object();
        var DefaultDate = new Object();

        var chartStorage = JSON.parse(sessionStorage.getItem(chartName + "chartStorage"));
        if (chartStorage) {
            DefaultDate.From = createJSONTimeStamp(chartStorage[0].fromDate);
            DefaultDate.To = createJSONTimeStamp(chartStorage[0].toDate);

        } else {
            DefaultDate.From = createJSONTimeStamp(dateFrom);
            DefaultDate.To = createJSONTimeStamp(dateTo);
        }

        getDownloadResultsAggregateReq.CallType = ENUM.get('CALLTYPE_DAY');
        getDownloadResultsAggregateReq.DefaultDate = DefaultDate;
        getDownloadResultsAggregateReq.DeviceSearch = deviceSearchObj;
        getDownloadResultsAggregateReq.PackageType = ENUM.get('Content');

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.getDownloadResultsAggregateResp) {
                        data.getDownloadResultsAggregateResp = $.parseJSON(data.getDownloadResultsAggregateResp);
                        if (data.getDownloadResultsAggregateResp.DeviceDownloadSummaryCollection) {
                            for (var i = 0; i < data.getDownloadResultsAggregateResp.DeviceDownloadSummaryCollection.length; i++) {
                                data.getDownloadResultsAggregateResp.DeviceDownloadSummaryCollection[i].Date = jsonDateConversionForCharts(data.getDownloadResultsAggregateResp.DeviceDownloadSummaryCollection[i].Date, "DD MMM");
                            }
                            stackChartContentJobStatus(data.getDownloadResultsAggregateResp.DeviceDownloadSummaryCollection, dateTo, dateFrom);
                        } else {
                            stackChartContentJobStatus([0], dateTo, dateFrom);
                        }

                        if (isAdvancedSavedSearchApplied && koUtil.isSearchCancelled() == false) {
                            $("#searchInProgress").modal('hide');
                            $("#AdvanceSearchModal").modal('hide');
                            koUtil.isHierarchyModified(false);
                            koUtil.isAttributeModified(false);
                            modelPopup('unloadTemplate');
                        } else {
                            $("#loadingDiv").hide();
                        }
                        isAdvancedSavedSearchApplied = false;
                        koUtil.isSearchCancelled(false);
                    }
                }
            } else {
                $("#loadingDiv").hide();
            }
        }

        var method = 'GetDownloadResultsAggregate';
        var params = '{"token":"' + TOKEN() + '","getDownloadResultsAggregateReq":' + JSON.stringify(getDownloadResultsAggregateReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
    }
});