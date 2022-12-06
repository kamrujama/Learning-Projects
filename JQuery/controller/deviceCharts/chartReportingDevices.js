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
        var self = this;
        ischartpageLoad = 0;




        var windowHeight = $(window).height();

        var chartTop = $('#jqxChartReportingDevices').offset().top;

        var chartHeight = windowHeight - chartTop - $(".fixed-footer").height() - 68;
        $('#jqxChartReportingDevices').css("height", chartHeight)


        $('#mdlAdvForReportingHeader').mouseup(function () {
            $("#mdlAdvForReportingContent").draggable({ disabled: true });
        });

        $('#mdlAdvForReportingHeader').mousedown(function () {
            $("#mdlAdvForReportingContent").draggable({ disabled: false });
        });
        
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
        ADSearchUtil.AdScreenName = 'chartReportingDevices';

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

        //advance search
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
        self.getReportWeeksDates = ko.observableArray([i18n.t('1week'), i18n.t('2weeks'), i18n.t('3weeks'), i18n.t('4weeks')]);
        //Reset filter
        self.applyAdvancedSearchForChart = function () {
            getReportingDevicesDetails('jqxChartReportingDevices', dateTo, dateFrom, ADSearchUtil.deviceSearchObj, self.observableAdvancedSearchModelPopup)
        }

        //unload advance serach popup
        self.unloadAdvancedSearch = function () {
            repositionAdvanceSearchPopUp("mdlAdvForReportingContent");
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            $("#AdvanceSearchModal").modal('hide');
            $("#mainPageBody").removeClass('modal-open-appendon');
            isAdpopup = '';
        }
        self.clearAdvancedSearch = function () {
            repositionAdvanceSearchPopUp("mdlAdvForReportingContent");
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        }

        //refresh grid
        self.refreshGrid = function (gId) {
            dateTo = moment();
            dateFrom = moment().subtract(AppConstants.get('SUBTRACT_FIRST_WEEK'), 'd').format(LONG_DATE_FORMAT_TIME);

            var chartName = 'jqxChartReportingDevices';
            var chartStorage = JSON.parse(sessionStorage.getItem(chartName + "chartStorage"));
            if (chartStorage) {
                chartStorage[0].week = '1 Week';
                chartStorage[0].fromDate = dateFrom;
                chartStorage[0].toDate = dateTo;

                var updatedChartStorage = JSON.stringify(chartStorage);
                window.sessionStorage.setItem(chartName + 'chartStorage', updatedChartStorage);
            }

            getReportingDevicesDetails(chartName, dateTo, dateFrom, ADSearchUtil.deviceSearchObj, self.observableAdvancedSearchModelPopup);
            $('#reportWeek').val(i18n.t('1week')).prop("selected", "selected");
            $('#reportWeek').trigger('chosen:updated');
         }

       
        // display data on chart based on selected week
        $('.my_select_box').on('change', function (evt, params) {

            var week = '1 Week';
            var chartName = 'jqxChartReportingDevices';
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
                        $('#reportWeek').val(week).prop("selected", "selected");
                        $('#reportWeek').trigger('chosen:updated');

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
            getReportingDevicesDetails('jqxChartReportingDevices', dateTo, dateFrom, ADSearchUtil.deviceSearchObj, self.observableAdvancedSearchModelPopup);

        });
        ADSearchUtil.gridIdForAdvanceSearch = 'jqxChartReportingDevices';
        seti18nResourceData(document, resourceStorage);
    };
    // dispaly chart as per weeks
    function getHighest(array) {
        var max = {};
        for (var i = 0; i < array.length; i++) {
            if (array[i].DeviceCount > (max.DeviceCount || 0))
                max = array[i];
        }

        if (max.Count == undefined) {
            max.Count = 0;
        }
        return max;
    }

    function chartReportingDevices(data, dateTo, dateFrom) {     
        var valAxis = new Object();
        var highest = getHighest(data);
        var maxCount = 0;
        if (highest.DeviceCount < 6) {
            maxCount = 8;
        } else {
            maxCount = highest.DeviceCount;
        }
        if (data == 0) {
            valAxis = {
                showGridLines: false,
                displayValueAxis: true,
                axisSize: 'auto',
                minValue: 0,
                maxValue: 100,
                unitInterval: 10,
                title: { text: i18n.t('Number_Of_Devices_title', { lng: lang }) },
                tickMarksColor: '#888888'
            };
        } else {
            if (highest.DeviceCount > 6) {
                var scalebase = 2;;
                if (maxCount > 8000) {
                    scalebase = 5;
                }
             valAxis = {
                displayValueAxis: true,
                showGridLines: false,
                displayValueAxis: true,
                logarithmicScale: true,
                logarithmicScaleBase: scalebase,               
                minValue: 0.5,
                formatFunction: function (value, index, columnIndex) {
                    return Math.floor(value);
                },
                title: { text: i18n.t('Number_Of_Devices_title', { lng: lang }) },
                axisSize: 'auto',
                    maxValue: maxCount,
              //  unitInterval: 1,
                tickMarksColor: '#888888'
            };
        } else {
             valAxis = {
                displayValueAxis: true,
                showGridLines: false,
                displayValueAxis: true,
                logarithmicScale: true,
                logarithmicScaleBase: 10,
                 //unitInterval: 0.5,
                minValue: 0.5,
                formatFunction: function (value, index, columnIndex) {

                    return Math.floor(value);
                },
                title: { text: i18n.t('Number_Of_Devices_title', { lng: lang }) },
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
            borderLineColor: 'white',
            source: data,
            toolTipShowDelay: 0,
            toolTipHideDelay: 2000,
            categoryAxis:
                {

                    text: 'Category Axis',
                    textRotationAngle: 0,
                    dataField: 'Date',
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

                    //text: 'Category Axis',
                    //textRotationAngle: -75,
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
                    //}
                },
            
            seriesGroups:
                [
                    {
                        type: 'stackedcolumn',
                        columnsGapPercent: 100,
                        seriesGapPercent: 5,
                        useGradientColors: false,
                        valueAxis:valAxis,
                        //{
                        //    displayValueAxis: true,
                        //    showGridLines: false,
                        //    title: { text: i18n.t('Number_Of_Devices_title', { lng: lang }) },
                        //    axisSize: 'auto',
                        //    tickMarksColor: '#888888'
                        //},
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
                            var getTotalData = data[itemIndex].DeviceCount;
                            //var percentage = " ";
                            //if (value == 0 || getTotalData == 0) {
                            //    percentage = " ";
                            //} else {
                            //    percentage = "(" + ((value / getTotalData) * 100).toFixed(2) + "%)";
                            //}
                            var formattedTooltip = "<div style='text-align:left'>" +
                                "<b>" + "Reporting Terminal Count" + "</b>" + "</br>" +
                                 xAxisValue + "</br>" +
                                 value + "</br></br></br>" +
                                "</div>";
                            return formattedTooltip;
                        },

                        series: [
                                { dataField: 'DeviceCount', displayText: i18n.t('reporting_dev_count', { lng: lang }), fillColor: '#408CDE' }

                        ]
                        
                    }
                ]
        };

        $('#jqxChartReportingDevices').jqxChart(settings);
        $('#jqxChartReportingDevices').jqxChart('refresh');
       
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

    function getReportingDevicesDetails(chartName,dateTo, dateFrom, deviceSearchObj, modelPopup) {
      
        if (!isAdvancedSavedSearchApplied || koUtil.isSearchCancelled() == true) {
            $("#loadingDiv").show();
        }

        //dateTo = moment.utc().format('YYYY-MM-DD HH:mm:ss');

        //dateFrom = moment().subtract(1, 'months').utc().format('YYYY-MM-DD HH:mm:ss');
        var adStorage = JSON.parse(sessionStorage.getItem(chartName + "adStorage"));

        updateOnState(chartName, deviceSearchObj, adStorage)

       
        var getReportingDevicesReq = new Object();
        var DefaultDate = new Object();
        var chartStorage = JSON.parse(sessionStorage.getItem(chartName + "chartStorage"));
        if (chartStorage) {

            DefaultDate.From = createJSONTimeStamp(chartStorage[0].fromDate);
            DefaultDate.To = createJSONTimeStamp(chartStorage[0].toDate);

        } else {
            DefaultDate.From = createJSONTimeStamp(dateFrom);
            DefaultDate.To = createJSONTimeStamp(dateTo);
        }

        getReportingDevicesReq.CallType = ENUM.get('CALLTYPE_WEEK');
        getReportingDevicesReq.DefaultDate = DefaultDate;
        getReportingDevicesReq.DeviceSearch = deviceSearchObj;
       
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.getReportingDevicesResp) {
                        data.getReportingDevicesResp = $.parseJSON(data.getReportingDevicesResp);
                        if (data.getReportingDevicesResp.DeviceSummary) {

                            var d1=data.getReportingDevicesResp.DeviceSummary;
                            var deviceArray = new Array();
                            
                            for (var i = 0; i < d1.length; i++) {

                                var totalDeviceCount = 0;
                                var DeviceSummary = new Object();
                                var source = _.where(d1, { Date: d1[i].Date});

                                for (var p = 0; p < source.length; p++) {                                   
                                    DeviceSummary.Date=source[p].Date;
                                    var c = parseInt(source[p].DeviceCount);
                                    totalDeviceCount += c;
                                    DeviceSummary.DeviceCount= totalDeviceCount;
                                }

                                if (deviceArray.length>0) {
                                    var source1 = _.where(deviceArray, {Date: d1[i].Date  });
                                    if(source1.length<1)
                                        deviceArray.push(DeviceSummary);
                                }
                              else                               
                                deviceArray.push(DeviceSummary); 
                             }

                            for (var i = 0; i < deviceArray.length; i++) {
                                deviceArray[i].Date = jsonDateConversionForCharts(deviceArray[i].Date, "DD MMM");
                            }

                            chartReportingDevices(deviceArray, dateTo, dateFrom);
                        } else {
                            chartReportingDevices([0], dateTo, dateFrom);
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
        
        var method = 'GetReportingDevices';
        var params = '{"token":"' + TOKEN() + '","getReportingDevicesReq":' + JSON.stringify(getReportingDevicesReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
    }

});