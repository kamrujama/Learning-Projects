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

        var windowHeight = $(window).height();

        var chartTop = $('#jqxChartAlertStatus').offset().top;

        var chartHeight = windowHeight - chartTop - $(".fixed-footer").height() - 68;
        $('#jqxChartAlertStatus').css("height", chartHeight)

        //Draggable function
        $('#mdlAdvancedForAlertHeader').mouseup(function () {
            $("#mdlAdvancedForAlertContent").draggable({ disabled: true });
        });

        $('#mdlAdvancedForAlertHeader').mousedown(function () {
            $("#mdlAdvancedForAlertContent").draggable({ disabled: false });
        });
        /////////
        
        self.AdvanceTemplateFlag = ko.observable(false);
        self.observableCriteria = ko.observable();
        self.observableAdvancedSearchModelPopup = ko.observable();
        self.observableModelPopup = ko.observable();
        ADSearchUtil.SearchForChart = true;
        ADSearchUtil.SearchForGrid = false;

        loadelement('unloadTemplate', 'genericPopup');
        loadCriteria('modalCriteria', 'genericPopup');
        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        ADSearchUtil.deviceSearchObj = new Object()
        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridCoulmns = [];
        ADSearchUtil.AdScreenName = 'chartAlerts';

        setMenuSelection();
        modelReposition();
        //open advance search poup
        self.openPopup = function (popupName) {
            if (popupName == 'modelAdvancedSearch') {
                self.AdvanceTemplateFlag(true);
                loadAdvancedSearchModelPopup(popupName, 'genericPopup');
                $('#AdvanceSearchModalForAlert').modal('show');
            }
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
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        //unload advance serach popup
        self.unloadAdvancedSearch = function () {
            repositionAdvanceSearchPopUp("mdlAdvancedForAlertContent");
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            $("#AdvanceSearchModal").modal('hide');
            $("#mainPageBody").removeClass('modal-open-appendon');
            isAdpopup = '';
        }
        self.clearAdvancedSearch = function () {
            repositionAdvanceSearchPopUp("mdlAdvancedForAlertContent");
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');
        }

        //advance serach
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

        // get dropdown week
        self.getAlertWeeksDates = ko.observableArray([i18n.t('1week'), i18n.t('2weeks'), i18n.t('3weeks'), i18n.t('4weeks')]);

        var dateTo = "";
        var dateFrom = "";

        // refresh and show 1 week data on chart
        self.refreshGrid = function () {
            dateTo = moment();
            dateFrom = moment().subtract(AppConstants.get('SUBTRACT_FIRST_WEEK'), 'd').format(LONG_DATE_FORMAT_TIME);

            var chartName = 'jqxChartAlertStatus';
            var chartStorage = JSON.parse(sessionStorage.getItem(chartName + "chartStorage"));
            if (chartStorage) {
                chartStorage[0].week = '1 Week';
                chartStorage[0].fromDate = dateFrom;
                chartStorage[0].toDate = dateTo;

                var updatedChartStorage = JSON.stringify(chartStorage);
                window.sessionStorage.setItem(chartName + 'chartStorage', updatedChartStorage);
            }

            getChartAlertStatusDetails('jqxChartAlertStatus', '1 Week', dateTo, dateFrom, ADSearchUtil.deviceSearchObj, self.observableAdvancedSearchModelPopup);
            $('#alertWeek').val(i18n.t('1week')).prop("selected", "selected");
            $('#alertWeek').trigger('chosen:updated');
        }


        //Reset filter
        self.applyAdvancedSearchForChart = function () {
            var week = '';
            var chartName = 'jqxChartAlertStatus';
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
            getChartAlertStatusDetails('jqxChartAlertStatus', week, dateTo, dateFrom, ADSearchUtil.deviceSearchObj, self.observableAdvancedSearchModelPopup)
        }

        // display data on chart based on selected week
        $('.my_select_box').on('change', function (evt, params) {

            var week = '1 Week';
            var chartName = 'jqxChartAlertStatus';
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
                        $('#alertWeek').val(week).prop("selected", "selected");
                        $('#alertWeek').trigger('chosen:updated');

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


            getChartAlertStatusDetails('jqxChartAlertStatus', week, dateTo, dateFrom, ADSearchUtil.deviceSearchObj, self.observableAdvancedSearchModelPopup);

            
            //getChartAlertStatusDetails(dateTo, dateFrom, ADSearchUtil.deviceSearchObj);
        });

        ADSearchUtil.gridIdForAdvanceSearch = 'jqxChartAlertStatus';
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

    //Calculate max count
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


  
    // dispaly chart as per weeks
    function stackChartAlertStatus(data, dateTo, dateFrom) {

        var valAxis = new Object();
        var totalCount = 0;
        var countAarry = [];
        for (i = 0; i < data.length; i++) {
            totalCount = data[i].HighAlertCount + data[i].MediumAlertCount + data[i].LowAlertCount;
            var obj = new Object();
            obj.Count = totalCount;
            countAarry.push(obj);
        }

        var max = getHighest(countAarry);
        var description={ text: i18n.t('Number_Of_Alerts_title', { lng: lang }) };
        if (data == 0) {

            valAxis = {
                displayValueAxis: true,
                showGridLines: false,
                axisSize: 'auto',
                minValue: 0,
                maxValue: 100,
                unitInterval: 10,
                description: description.text,
                formatFunction: function (value, index, columnIndex) {

                    return Math.round(value);
                },
                axisSize: 'auto',
                tickMarksColor: '#888888'
            }
        } else {
            if (max.Count > 6) {
                var scalebase = 2;;
                if (max.Count > 8000) {
                    scalebase = 5;
                }
                valAxis = {
                    displayValueAxis: true,
                    showGridLines: false,
                    logarithmicScale: true,
                    logarithmicScaleBase: scalebase,
                    //unitInterval: 0.5,
                    minValue: 0.5,
                    description: description.text,
                    formatFunction: function (value, index, columnIndex) {
                        return Math.floor(value);
                    },
                    axisSize: 'auto',
                    //unitInterval: 1,
                    tickMarksColor: '#888888'
                };
            } else {
                
                valAxis = {
                    displayValueAxis: true,
                    showGridLines: false,
                    axisSize: 'auto',
                    minValue: 0,
                    maxValue: 8,
                    unitInterval: 1,
                    description: description.text,
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
            borderLineColor: 'white',
            source: data,
            toolTipShowDelay: 0,
            toolTipHideDelay: 2000,
            categoryAxis:
                {
                    //text: 'Category Axis',
                    //textRotationAngle: 0,
                    //dataField: 'Date',
                    //type: 'date',
                    //baseUnit: 'day',
                    //showTickMarks: true,
                    //tickMarksInterval: 1,
                    //minValue: jsonDateFrom,
                    //maxValue: jsonDateTo,
                    //tickMarksColor: '#888888',
                    //unitInterval: 1,
                    //showGridLines: false,
                    //gridLinesInterval: 1,
                    //gridLinesColor: '#888888',
                    //axisSize: 'auto',
                    //formatFunction: function (value) {
                    //    return $.jqx.dataFormat.formatdate(value, 'dd/MM');
                    //},
                    text: 'Category Axis',
                    dataField: 'EventReceivedDate',                   
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
                    
                },
            seriesGroups:
                [
                    {
                        type: 'stackedcolumn',
                        columnsGapPercent: 100,
                        seriesGapPercent: 5,
                        useGradientColors: false,

                        valueAxis: valAxis,

                        toolTipFormatFunction: function (value, itemIndex, serie, group, xAxisValue, xAxis) {
                          
                            //var date = xAxisValue.split('/');
                            //var strDate;
                            //var strMonth;
                            //var d = parseInt(date[0]);
                            //var m = parseInt(date[1]);
                            //if (d < 10) {
                            //    strDate = "0" + d;
                            //} else {
                            //    strDate = d;
                            //}

                            //if (m < 10) {
                            //    strMonth = "0" + m;
                            //} else {
                            //    strMonth = m;
                            //}
                            if (xAxisValue == undefined) {
                                xAxisValue = " ";
                            }

                            var getTotalData = data[itemIndex].TotalAlertCount;
                            var percentage = " ";
                            if (value == 0 || getTotalData == 0 || value == "NaN" || getTotalData == "NaN") {
                                percentage = " ";
                            } else {
                                percentage = "(" + ((value / getTotalData) * 100).toFixed(2) + "%)";
                            }

                          
                            var formattedTooltip;
                            if (getTotalData <= 99)
                                formattedTooltip = "<div style='text-align:left;min-height:105px;'>";
                            else if (getTotalData <= 999)
                                formattedTooltip = "<div style='text-align:left;'>";
                            else
                                formattedTooltip = "<div style='text-align:left;min-height:105px;'>";

                            formattedTooltip +=
                                "<b>" + serie.displayText + "</b>" + "</br>" +
                                xAxisValue + "</br>" +
                                 value + " " + percentage + "</br>" +
                                 "<i>total</i>:" + " " + getTotalData + "</br></br></br>" +
                                "</div>";
                            return formattedTooltip;
                        },

                        series: [
                                { dataField: 'HighAlertCount', displayText: i18n.t('high_alerts', { lng: lang }), fillColor: '#E30000' },
                                { dataField: 'MediumAlertCount', displayText: i18n.t('med_alerts', { lng: lang }), fillColor: '#FFBA00' },
                                { dataField: 'LowAlertCount', displayText: i18n.t('low_alerts', { lng: lang }), fillColor: '#00AEEF' },
                        ]
                    }
                ]
        };

        $('#jqxChartAlertStatus').jqxChart(settings);
        $('#jqxChartAlertStatus').jqxChart('refresh');
    }

    function getChartAlertStatusDetails(chartName, week, dateTo, dateFrom, deviceSearchObj, modelPopup) {

        if (!isAdvancedSavedSearchApplied || koUtil.isSearchCancelled() == true) {
            $("#loadingDiv").show();
        }

        var adStorage = JSON.parse(sessionStorage.getItem(chartName + "adStorage"));

        updateOnState(chartName, deviceSearchObj, adStorage)

        var getAlertsResultsAggregateReq = new Object();
        var DefaultDate = new Object();

        var chartStorage = JSON.parse(sessionStorage.getItem(chartName + "chartStorage"));
        if (chartStorage) {
            
            DefaultDate.From = createJSONTimeStamp(chartStorage[0].fromDate);
            DefaultDate.To = createJSONTimeStamp(chartStorage[0].toDate);

        } else {
            DefaultDate.From = createJSONTimeStamp(dateFrom);
            DefaultDate.To = createJSONTimeStamp(dateTo);
        }

        
        getAlertsResultsAggregateReq.CallType = ENUM.get('CALLTYPE_WEEK');
        getAlertsResultsAggregateReq.DefaultDate = DefaultDate;
        getAlertsResultsAggregateReq.DeviceSearch = deviceSearchObj;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.getAlertsResultsAggregateResp) {
                        data.getAlertsResultsAggregateResp = $.parseJSON(data.getAlertsResultsAggregateResp);
                        if (data.getAlertsResultsAggregateResp.DeviceAlertSummary) {

                            for (var i = 0; i < data.getAlertsResultsAggregateResp.DeviceAlertSummary.length; i++) {
                                data.getAlertsResultsAggregateResp.DeviceAlertSummary[i].EventReceivedDate = jsonDateConversionForCharts(data.getAlertsResultsAggregateResp.DeviceAlertSummary[i].EventReceivedDate, "DD MMM");
                            }

                            stackChartAlertStatus(data.getAlertsResultsAggregateResp.DeviceAlertSummary, dateTo, dateFrom);
                        } else {
                            stackChartAlertStatus([0], dateTo, dateFrom);
                        }

                        if (isAdvancedSavedSearchApplied && koUtil.isSearchCancelled() == false) {
                            $("#searchInProgress").modal('hide');
                            $("#AdvanceSearchModalForAlert").modal('hide');
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
        var method = 'GetAlertsResultsAggregate';
        var params = '{"token":"' + TOKEN() + '","getAlertsResultsAggregateReq":' + JSON.stringify(getAlertsResultsAggregateReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
    }
});