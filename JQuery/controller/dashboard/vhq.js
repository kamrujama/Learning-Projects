define(["knockout", "moment", "momentTimeZone", "timeZone", "knockout.validation", "koUtil", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, tz) {
    var lang = getSysLang();
    SelectedIdOnGlobale = new Array();
    columnSortFilterDevice = new Array();
    confirmationFlage = 0;

    allDataArr = new Array();
    chartdataRight = new Array();
    peidata = new Array();

    expandrilcheck = 0;

    peiDate = '';

    dataforrefresh = new Array();

    CacceptstrForList = '';

    checkDragg = 0;

    linedata = new Array();

    lineWidgetdata = '';
    lineIndex = '';
    lineId = '';

    widgetDatatooltipclick = '';
    datafortooltipclick = '';

    funtionfortolltipclick = '';

    acceptStrStandard = '';

    acceptStrCounter = '';

    checklodingForCounter = 0;

    userwidgetlength = 0;

    userstandardwidgetlength = 0;

    chartGridData = new Array();
    openDrillWidget = '';
    chartdataleft = new Array();

    loadingcount = 0;
    loadwidgetdata = 0;
    WidgetDataMap = new Object();
    counterwidgetstorage = new Object();
    dashboardWidgetData = new Array();
    isEscapeKeyEnable = false;
    isExpandActive = false;
    chartIds = new Array();
    removedCounterStates = new Array();
    columnSortFilterForPieChart = new Object();
    var widgetId = '';
    var pageSize = "";
    expanddrillId = '';
    var isWidgetLicensed = false;

    Array.prototype.move = function (old_index, new_index) {

        if (new_index >= this.length) {
            var k = new_index - this.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this; // for testing purposes
    };

    check = 1;

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    //For time zone//
    var timezone = jstz.determine();
    var name = timezone.name();


    if (name == undefined) {
        name = tz.tz.guess();
    }

    //

    return function DashBoardViewModel() {

        var conHeight = $(window).height() + 'px';
        var self = this;
        self.widgetData = ko.observableArray();
        self.widgetDataRight = ko.observableArray();
        self.widgetlist = ko.observableArray();
        self.CounterWidgetlist = ko.observableArray();
        self.widgetbackuplist = ko.observableArray();
        self.widgetDataRightbackup = ko.observableArray();
        self.widgetDatabackup = ko.observableArray();
        self.StaticDataWidget = ko.observableArray();

        self.newModifiedWidgetData = ko.observableArray();

        self.UsersStandardWidgets = ko.observableArray();
        self.UsersCounterWidgets = ko.observableArray();

        self.removeCountercheck = ko.observable(true);


        self.NewStaticDataWidget = ko.observableArray();

        self.loadingtest = ko.observableArray();

        self.loadingtest.subscribe(function (newValue) {



        });




        self.modifiedStaticDataWidget = ko.observableArray();
        self.modifiedWidgetData = ko.observableArray();
        self.backUpCounterWidget = ko.observableArray();
        self.jsonWidget = ko.observableArray();
        self.legendsDeviceByStatus = ko.observableArray();
        checkDrilDown = 0;
        setMenuSelection();

        if (!isWidgetLicensed) {
            dashboardWidgets = getDashboardWidgets(dashboardWidgets);
            isWidgetLicensed = true;
        }
        self.jsonWidget(dashboardWidgets);

        //$(".slimScrolldrag").niceScroll({
        //    cursorborder: "",
        //    cursorcolor: "#000",
        //    cursoropacitymax: 0.4,
        //    boxzoom: false,
        //    cursordragontouch: true,
        //    touchbehavior: true
        //});
        var cunstStaticDataWidget = function (id, callType, WidgetId, dataSource, jsonSource, bgSource) {


            this.totalCount = dataSource.TotalCount;
            this.currentCount = dataSource.CurrentCount;
            if (dataSource.callduration == undefined) {
                if (dataSource.DefaultValue != "" && dataSource.DefaultValue != undefined) {
                    var test = parseInt(dataSource.DefaultValue);
                    this.callduration = "" + test + "";
                } else {
                    this.callduration = "";
                }
            } else {
                this.callduration = dataSource.callduration;
            }



            this.id = id;
            this.WidgetName = i18n.t(id, { lng: lang });
            this.Identifier = id;
            this.CallType = callType;
            this.WidgetId = dataSource.WidgetId;

            this.progress = jsonSource.Widget.progress;
            this.className = jsonSource.Widget.class;
            if (dataSource.background == undefined) {
                if (bgSource != undefined) {
                    this.background = bgSource;
                }
            } else {
                this.background = dataSource.background;
            }
            var displaycalltype = callType;

            if (displaycalltype.toLowerCase() == "all") {
                this.ctypedesc = ""
            } else if (displaycalltype.toLowerCase() == "weekly") {
                if (this.callduration == "1") {
                    this.ctypedesc = "Versus previous " + this.callduration + " week"
                } else {
                    this.ctypedesc = "Versus previous " + this.callduration + " weeks"
                }

            } else if (displaycalltype.toLowerCase() == "day") {
                if (this.callduration == "1") {
                    this.ctypedesc = "Versus previous " + this.callduration + " day"
                } else {
                    this.ctypedesc = "Versus previous " + this.callduration + " days"
                }

            } else if (displaycalltype.toLowerCase() == "monthly") {
                if (this.callduration == "1") {
                    this.ctypedesc = "Versus previous " + this.callduration + " month"
                } else {
                    this.ctypedesc = "Versus previous " + this.callduration + " months"
                }

            }

            this.name = i18n.t(id, { lng: lang });
            this.percentage = calculatePercentage(this.currentCount, this.totalCount);
        }
        var cunstWidgetData = function (widgetdata, source) {
            this.ApiName = widgetdata.ApiName;
            this.CallType = widgetdata.CallType;
            this.Category = widgetdata.Category;
            this.Identifier = widgetdata.Identifier;
            this.WidgetName = i18n.t(widgetdata.Identifier, { lng: lang });
            this.WidgetName1 = i18n.t(widgetdata.Identifier, { lng: lang });
            this.WidgetId = widgetdata.WidgetId;
            this.SourceDbType=widgetdata.SourceDbType;
            this.WidgetSourceData = source;

        }

        funtionfortolltipclick = function (index, id, elementIndex, xfield) {


            hideWidgetPanel();
            openDrillWidget = widgetDatatooltipclick.Identifier;
            var xfield = widgetDatatooltipclick.WidgetSourceData.chart.dataFeilds.XField;
            $("#expandDrilplaceholderRight" + index).css("top", "20px");
            valuedate = datafortooltipclick[elementIndex][xfield];

            if (index.lastIndexOf == undefined || index.lastIndexOf("Right") == -1) {
                $('#legendElementRight' + index).css("display", "none");
                $('#showHintRight' + index).css("display", "block");
            } else {
                var val = index.substring(index.lastIndexOf("Right") + 5, index.length);
                $('#legendElement' + val).css("display", "none");
                $('#showHint' + val).css("display", "block");
            }


            var dayArr = valuedate.split(' ');
            var month = new Date(Date.parse(dayArr[1] + " 1, 2016")).getMonth() + 1;
            var day = dayArr[0];

            var dateObj = new Object();
            var check = moment();
            var year = check.format('YYYY');

            // var tdate = moment(year + '/' + month + '/' + day).format('YYYY-MM-DD');

            var date = moment(year + '/' + month + '/' + day).format('MM/DD/YYYY');
            var minutes = "59";
            var hours = "23";
            var tdate = getlocaldateForDashboard('to', date, hours, minutes);

            var date = moment(tdate).tz(name).subtract('days', 1).format('MM/DD/YYYY');
            var minutes = "00";
            var hours = "24";

            fdate = getlocaldateForDashboard('from', date, hours, minutes);
            fdate = fdate;
            peiDate = tdate;
            tdate = tdate;

            dateObj.from = fdate;
            dateObj.to = tdate;

            isEscapeKeyEnable = true;


            $("#drillDownHead").text(i18n.t(widgetDatatooltipclick.Identifier, { lng: 'en' }))

            if (widgetDatatooltipclick.WidgetSourceData.chart.drill == "true") {

                if (checkDril != id) {

                    ////new for hide tooltip
                    var chartInstance = $("#" + id).jqxChart('getInstance');
                    if (chartInstance != undefined) {
                        chartInstance.hideToolTip(
                            1000  /* hide after 1 second, optional parameter */
                        );
                    }
                    ////

                    $("#loader1").show();
                    checkDril = id;
                    //GetWidgetsByIdForDrillDown(id, index, widgetData, dateObj);
                    dataforrefresh = [];
                    var obj = new Object();
                    obj.id = id;
                    obj.index = index;
                    obj.widgetData = widgetDatatooltipclick;
                    obj.dateObj = dateObj;
                    dataforrefresh.push(obj);
                    GetWidgetsByIdForDrillDown(id, index, widgetDatatooltipclick, dateObj);

                }
            } else {

            }
        }

        //if (loadwidgetdata == 0) {
        getUserWidget(self.UsersStandardWidgets, self.UsersCounterWidgets, cunstStaticDataWidget, cunstWidgetData);

        //} else {
        //    loadUserWidget(self.UsersStandardWidgets, self.UsersCounterWidgets, cunstStaticDataWidget, cunstWidgetData);
        //}


        self.widgetopen = function () {

            var left = self.widgetData();
            var right = self.widgetDataRight();

            $(".widget-panel").toggleClass("wp-open");

            if ($(".widget-panel").hasClass("wp-open")) {
                $("#btnRefresh").css("margin-right", "256px");
                $("#btnWidgetToggle").prop('title', 'Hide Widget Browser');
                $("#widgetMenuIcon").removeClass('icon-angle-left');
                $("#widgetMenuIcon").addClass('icon-angle-right');
            } else {
                $("#btnWidgetToggle").prop('title', 'Show Widget Browser');
                $("#btnRefresh").css("margin-right", "50px");
                $("#widgetMenuIcon").removeClass('icon-angle-right');
                $("#widgetMenuIcon").addClass('icon-angle-left');

            }
        };
        function refreshonCollapse() {
            if ($("#placeholder0").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder0").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder1").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder1").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder2").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder2").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder3").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder3").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder4").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder4").jqxChart('refresh');
                }, 1000);

            }
            if ($("#placeholder5").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder5").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder6").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder6").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder7").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder7").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder8").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder8").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder9").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder9").jqxChart('refresh');
                }, 1000);
            }
            /////for right
            if ($("#placeholderRight0").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight0").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight1").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight1").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight2").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight2").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight3").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight3").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight4").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight4").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight5").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight5").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight6").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight6").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight7").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight7").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight8").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight8").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight9").prop('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight9").jqxChart('refresh');
                }, 1000);
            }
        }

        self.CounterWidgetopen = function () {
            if ($("#counterbtn").hasClass('wpa-btn-r')) {
                $("#standardbtn").show();
                $("#counterbtn").prop('title', 'Expand counter widgets')
            } else {
                $("#standardbtn").hide();
                $("#counterbtn").prop('title', 'Collapse counter widgets');
            }
            $("#standardWidgetCollection").css("display", "none");
            $("#counterWidgetCollection").css("display", "");
            $(".widget-panel").toggleClass("wp-open");
            $("body").toggleClass("widget-panel-o");
            $(".wpa-btn").toggleClass("wpa-btn-r");

            if ($(".widget-panel").hasClass("wp-open")) {
                $(".collapsible").addClass("collapsible-mini");
                $("body").addClass("page-sidebar-minified");
                $("#sidebar").removeClass("scrolloverflow");
            } else {
                $(".collapsible").addClass("collapsible-mini");
            }

            //refreshonCollapse();
        };
        self.closeWidgets = function () {
            $(".widget-panel").css('right', '-4px');
        };

        self.collapsePanalhover = function (id) {

        };

        self.collapsePanalClick = function (id) {
            if ($('#' + id).children('i').hasClass('icon-angle-up')) {
                $('#' + id).children('i').removeClass('icon-angle-up')
                $('#' + id).children('i').addClass('icon-angle-down')
            } else {
                $('#' + id).children('i').addClass('icon-angle-up')
                $('#' + id).children('i').removeClass('icon-angle-down')
            }
            $("#" + id).closest(".panel").find(".panel-body").slideToggle();

        }

        self.removePanalhover = function (id) {

        }

        self.expandPanalhover = function (id) {


        }

        self.expandClick = function (data, id, index, flage) {

            hideWidgetPanel();
            var titleId = '#paneltitle' + data.WidgetId;
            var mArr = self.newModifiedWidgetData();
            var t = $("#" + id).closest(".panel");
            var n = $(t).find(".panel-body");
            var r = 40;
            if ($(n).length !== 0) {

                var i = $(t).offset().top;
                var s = $(n).offset().top;
                r = s - i
            }

            if ($("body").hasClass("panel-expand") && $(t).hasClass("panel-expand")) {
                isExpandActive = false;
                isEscapeKeyEnable = false;
                reloadScrollBars();
                $(titleId).css('font-size', '15px');
                expandrilcheck = 0;
                $("body, .panel").removeClass("panel-expand");
                $("#expandDrilplaceholderRight" + index).css("top", "20px");
                $(".panel-body").css({ "top": 0 });
                $(".panel-body").css("height", "278px");
                var mArr = self.newModifiedWidgetData();
                self.newModifiedWidgetData([]);
                self.newModifiedWidgetData(mArr);
                self.widgetData([]);
                self.widgetDataRight([])

                dragdroponChart(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight,
                    self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist, 0);
            } else {
                isExpandActive = true;
                isEscapeKeyEnable = true;
                unloadScrollBars();
                $(titleId).css('font-size', '22px');
                expandrilcheck = 1;
                //new code
                if (flage == 'right') {
                    // $('#mainChartDivRight').css("z-index", 997);
                    // $('#mainChartDiv').css("z-index", 996);
                    $('#placeholderRight' + index).closest(".panel").find(".panel-body").css("display", "block");
                    $('#placeholderRight' + index).closest(".panel").find(".panel-body").css("height", "auto");
                    $('#placeholderRight' + index).removeClass('decreaseChartWidth');
                    $('#placeholderRight' + index).addClass('increseChartWidth');
                    var widgetid = 'placeholderRight' + index;
                    expanddrillId = "expandDril" + widgetid;
                    GetWidgetsById(widgetid, index, data);


                    $("#colpA" + index).hide();
                    $("#removepA" + index).hide();

                    ///no data lable
                    $("#noDataLableRight" + index).css("margin-top", "-317px");
                    $("#noDataLableRight" + index).css("padding-left", "590px");
                    $("#expandDrilplaceholderRight" + index).css("top", "50px");

                    ///
                }
                if (flage == 'left') {
                    // $('#mainChartDiv').css("z-index", 997);
                    // $('#mainChartDivRight').css("z-index", 996);
                    $('#placeholder' + index).closest(".panel").find(".panel-body").css("display", "block");
                    $('#placeholder' + index).closest(".panel").find(".panel-body").css("height", "auto");
                    $('#placeholder' + index).removeClass('decreaseChartWidth');
                    $('#placeholder' + index).addClass('increseChartWidth');
                    var widgetid = 'placeholder' + index;
                    expanddrillId = "expandDril" + widgetid;
                    GetWidgetsById(widgetid, index, data);


                    $("#colpARight" + index).hide();
                    $("#removepARight" + index).hide();

                    $("#noDataLable" + index).css("margin-top", "-317px");
                    $("#noDataLable" + index).css("padding-left", "590px");

                }


                //
                $("body").addClass("panel-expand");
                $("#" + id).closest(".panel").addClass("panel-expand");
                if ($(n).length !== 0 && r != 40) {
                    var o = 40;
                    $(t).find(" > *").each(function () {
                        var e = $("#" + id).prop("class");
                        if (e != "panel-heading" && e != "panel-body") {
                            o += $("#" + id).height() + 30
                        }
                    });
                    if (o != 40) {
                        $(n).css("top", o + "px");
                    }
                }
            }

            $(window).trigger("resize");
        }

        handleDraggablePanel();


        self.onloadpanale = function (data) {

        };

        self.HideWidget = function (data, id, index) {
            $("#" + id).tooltip("destroy");

            var lengthArr = self.newModifiedWidgetData();

            if (lengthArr.length <= 4) {
                openAlertpopup(1, 'no_able_to_remove_standard_widget');
            } else {
                removedashboardwidgetdata(data);
                self.newModifiedWidgetData.remove(data);
                ////new code
                self.widgetlist.splice(0, 0, data);

                var mArr = self.newModifiedWidgetData();
                self.newModifiedWidgetData([]);
                self.newModifiedWidgetData(mArr);
                self.widgetData([]);
                self.widgetDataRight([])

                dragdroponChart(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight,
                    self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist, 1);
            }




        }

        self.HideCounterWidget = function (data) {

        }

        self.HideWidgetRight = function (data, id, index) {
            $("#" + id).tooltip("destroy");

            var engthArr = self.newModifiedWidgetData();


            if (engthArr.length <= 4) {
                openAlertpopup(1, 'no_able_to_remove_standard_widget');
            } else {
                removedashboardwidgetdata(data);
                self.newModifiedWidgetData.remove(data);
                ////new code
                self.widgetlist.splice(0, 0, data);

                var mArr = self.newModifiedWidgetData();
                self.newModifiedWidgetData([]);
                self.newModifiedWidgetData(mArr);
                self.widgetData([]);
                self.widgetDataRight([])

                dragdroponChart(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight,
                    self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist, 1);
            }


            ////

        }

        self.backToBarChart = function (data, index) {



            checkDril = '';



            $(".dash-filter-area").removeClass("displayBlock");
            $(".widget-panel").removeClass("wp-open");
            $("body").removeClass("widget-panel-o");
            $(".overflow-strip").removeClass("displayBlock");


            var mArr = self.newModifiedWidgetData();
            self.newModifiedWidgetData([]);
            self.newModifiedWidgetData(mArr);
            self.widgetData([]);
            self.widgetDataRight([])

            dragdroponChart(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight,
                self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist, 0);

        }

        self.backToRightBarChart = function (data, index) {


            checkDril = '';

            $(".dash-filter-area").removeClass("displayBlock");
            $(".widget-panel").removeClass("wp-open");
            $("body").removeClass("widget-panel-o");
            $(".overflow-strip").removeClass("displayBlock");


            var mArr = self.newModifiedWidgetData();
            self.newModifiedWidgetData([]);
            self.newModifiedWidgetData(mArr);
            self.widgetData([]);
            self.widgetDataRight([])

            dragdroponChart(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight,
                self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist, 0);
        }

        self.handelWidget = function (data, index) {

            var selectedsource = _.where(self.widgetData(), { Identifier: data.Identifier });
            var selectedsourceRight = _.where(self.widgetDataRight(), { Identifier: data.Identifier });
            var selectedsourceCounter = _.where(self.modifiedStaticDataWidget(), { Identifier: data.Identifier });
            if ($("#btnhande" + index).hasClass('btn-danger')) {
                $("#btnhande" + index).removeClass('btn-danger')
                $("#btnhande" + index).addClass('btn-success');
                $("#btnhande" + index).text('Add');
                if (selectedsource != '') {
                    self.widgetData.remove(data);
                }
                if (selectedsourceRight != '') {
                    self.widgetDataRight.remove(data);
                }
                if (selectedsourceCounter != '') {
                    var generatedArr = self.modifiedStaticDataWidget();

                    generatedArr = _.reject(generatedArr, function (el) { return el.id === data.id; });





                    self.modifiedStaticDataWidget(generatedArr);
                    var a = generatedArr;

                    var counterid = '#' + data.Identifier + '';

                    $(counterid).addClass('hide');
                }
            } else {

                $("#btnhande" + index).addClass('btn-danger')
                $("#btnhande" + index).removeClass('btn-success')
                $("#btnhande" + index).text('Remove');

                if (selectedsource == '' && selectedsourceRight == '' && selectedsourceCounter == '') {

                    var aaa = self.widgetDataRightbackup();

                    var i = self.widgetDataRightbackup.indexOf(data);
                    var j = self.widgetDatabackup.indexOf(data);
                    var generatedArr = self.backUpCounterWidget()


                    indexes = $.map(generatedArr, function (obj, index) {
                        if (obj.id == data.id) {
                            return index;
                        }
                    })


                    var k = indexes[0];


                    if (i >= 0) {

                        self.widgetDataRight.splice(i, 0, data);
                        var id = 'placeholderRight' + i;
                        var chartdata = self.widgetDataRight();
                        $('#drildownplaceholderRight' + i).hide();

                    }
                    if (j >= 0) {
                        self.widgetData.splice(j, 0, data);
                        var id = 'placeholder' + (self.widgetData().length - 1);
                        var chartdata = self.widgetDataRight();
                        $('#drildownplaceholder' + j).hide();
                    }
                    if (k >= 0) {
                        var generatedArr = self.modifiedStaticDataWidget()
                        generatedArr.splice(k, 0, data);
                        $(counterid).removeClass('hide');
                        self.modifiedStaticDataWidget(generatedArr);
                        createCounterWidget(self.jsonWidget, cunstStaticDataWidget, data.id, data.callType)
                    }
                }

            }

            var arr1 = self.modifiedStaticDataWidget()
            modifiedCounterWidgets = self.modifiedStaticDataWidget();
            //for (var i = 0; i < arr1.length; i++) {

            //    //createCounterWidget(self.jsonWidget, cunstStaticDataWidget, arr1[i].Identifier, arr1[i].CallType);
            //}


            getparamforSetWidget(self.widgetData, self.widgetDataRight, self.modifiedStaticDataWidget, 1);





            getwidgetDataAfterAdd(self.widgetData, self.widgetlist, self.widgetDataRight, self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup);


        }

        self.CharModelPopup = ko.observable();
        self.columnlist = ko.observableArray();
        self.templateFlag = ko.observable(false);
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['SerialNumber', 'DeviceId', 'ModelName', 'ComputedDeviceStatus', 'HierarchyFullPath', 'PREVIOUSHIERARCHYNAME', 'Status', 'TaskCreatedDate', 'Severity', 'AlertName'];
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');

        modelReposition();
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));
                loadelement(popupName, 'genericPopup');
                $('#viewCharPopupModal').modal('show');
            } else if (popupName == "modelViewAlertHistory") {
                loadelement(popupName, 'alerts');
                $('#viewCharPopupModal').modal('show');
            } else if (popupName == "modelExportSucess") {
                loadelement(popupName, 'genericPopup');
                $('#viewCharPopupModal').modal('show');
            }
        }

        self.exportToExcel = function (gID) {
            var dataInfo = $("#" + gID).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                var FileName = $("#drillDownHead").text();
                exportjqxcsvData(gID,FileName); 
               openAlertpopup(1, 'export_Information');
                $("#loadingDiv").hide();
            }

        }

        self.unloadTempPopup = function (popupName) {
            self.CharModelPopup(popupName);
        };

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.CharModelPopup(elementname);
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



        self.clearfilter = function (gId) {

            var AlertSeverity = 'ALL';
            var AlertStatus = 'ALL';
            var DownloadStatus = 'All';
            var Status = 'All';
            isPieChartFilter = false;
            columnSortFilterForPieChart = new Object();
            var dateObjNew = new Object();

            var date = moment(peiDate).tz(name).subtract('days', 1).format('MM/DD/YYYY');
            var minutes = "00";
            var hours = "24";
            var fromDate = getlocaldate1(moment(date), hours, minutes);
            var fdate = createJSONTimeStamp(fromDate);
            //var fdate = getlocaldateForDashboard('from', date, hours, minutes);
            //var fdate = moment(peiDate).tz(name).subtract('days', 1).format();

            dateObjNew.from = fdate;//moment().subtract('days', 7).format('YYYY-MM-DD');

            //  var tdate = moment(peiDate).tz(name).format();
            var date = moment(peiDate).tz(name).format('MM/DD/YYYY');
            var minutes = "59";
            var hours = "23";
            var toDate = getlocaldate1(moment(date), hours, minutes);
            var tdate = createJSONTimeStamp(fromDate);
            //var tdate = getlocaldateForDashboard('to', date, hours, minutes);

            dateObjNew.to = tdate; //moment().format('YYYY-MM-DD');
            if (widgetId == "SW_ALERT_CHART") {
                columnSortFilterForPieChart.GridId = "AlertHistory";
            } else if (widgetId == "SW_DOWNLOAD_CHART") {
                columnSortFilterForPieChart.GridId = "DownloadDetailsForDeviceProfile";
            }
            columnSortFilterForPieChart.FilterList = null;
            columnSortFilterForPieChart.SortList = null;
            isPieChartFilter = true;

            dateObjNew.to = tdate;
            var obj = new Object();
            if (widgetId == "SW_ALERT_CHART") {
                var param = getAlertResultsDetailsForDashboardParam(false, chartGridData.Identifier, chartGridData.WidgetSourceData.chart.APIDetails, dateObjNew, AlertSeverity, AlertStatus, DownloadStatus, Status, []);
                obj.getAlertResultsDetailsReq = param;
            }
            else if (widgetId == "SW_DOWNLOAD_CHART") {
                var param = getJobDownloadResultsDetailsForDashboardParam(false, chartGridData.Identifier, chartGridData.WidgetSourceData.chart.APIDetails, dateObjNew, AlertSeverity, AlertStatus, DownloadStatus, Status, []);
                obj.getDownloadResultsDetailsReq = param;
            }

            obj.token = TOKEN();
            param = obj;
            var datelable = moment(peiDate).format('DD MMMM');
            $("#chartGridMainDiv").empty();
            var str = '<div id="chartGrid"  />';
            $("#chartGridMainDiv").append(str);
            if (chartGridData.WidgetSourceData.chart.APIDetails.Columns != undefined) {
                $("#resultLable").text(i18n.t(chartGridData.Identifier, { lng: 'en' }) + '  ' + datelable);
                $("#drillDownHead").text(i18n.t(chartGridData.Identifier, { lng: 'en' }) + '  ' + datelable);
                showResultGrid('chartGrid', param, chartGridData, null, widgetId);
            }

        }

        self.backToMainChart = function () {

            reloadScrollBars();
            if (openDrillWidget != '') {
                var chartDataRight = self.widgetDataRight();
                var chartDataleft = self.widgetData();
                var isExist = false
                for (var i = 0; i < chartDataleft.length; i++) {
                    var id = 'placeholder' + i;
                    if (chartDataleft[i].Identifier == openDrillWidget) {
                        openDrillWidget = '';
                        GetWidgetsById(id, 'Right' + i, chartDataleft[i]);
                        isExist = true;
                    }
                }
                if (isExist == false) {

                    for (var j = 0; j < chartDataRight.length; j++) {
                        var RightID = 'placeholderRight' + j;
                        if (chartDataRight[j].Identifier == openDrillWidget) {
                            openDrillWidget = '';
                            GetWidgetsById(RightID, j, chartDataRight[j]);
                        }
                    }
                }
            }
            checkDril = '';
            var mArr = self.newModifiedWidgetData();
            self.newModifiedWidgetData([]);
            self.newModifiedWidgetData(mArr);
            self.widgetData([]);
            self.widgetDataRight([]);
            $("#openDrillDiv").addClass("hide");
            $(".dash-filter-area").removeClass("displayBlock");
            $(".widget-panel").removeClass("wp-open");
            $("body").removeClass("widget-panel-o");
            $(".overflow-strip").removeClass("displayBlock");
            isPieChartFilter = false;

            dragdroponChart(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight,
                self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist, 0);
        }

        $(document).keyup(function (e) {
            //Escape Key Pressed
            if ($('#loadingDiv').css('display') == 'none' && $('#allDisabledDiv').css('display') == 'none') {
                if (e.keyCode == 27 && isEscapeKeyEnable) {
                    isEscapeKeyEnable = false;
                    isExpandActive = false;
                    if (expanddrillId && expanddrillId != '' && $('#' + expanddrillId).hasClass('panel-sm-expand')) {
                        $('#' + expanddrillId).removeClass('panel-sm-expand');
                        isPieChartFilter = false;
                    }
                    //$(e.target).children().each(function () {
                    //    var tid = $(this).parent().parent().attr('id');
                    //    if (tid != undefined) {
                    //        if (tid.indexOf('expandDrilplaceholder') > -1) {
                    //            if ($(this).parent().parent().hasClass('panel-sm-expand')) {
                    //                $(this).parent().parent().removeClass('panel-sm-expand');
                    //                isPieChartFilter = false;
                    //            }

                    //        };
                    //    }
                    //});
                    $(".filter").hide();
                    self.backToMainChart();
                }
            }

        });
        self.refreshDrillDownChart = function () {

            var id = dataforrefresh[0].id;
            var index = dataforrefresh[0].index;
            var widgetData = dataforrefresh[0].widgetData;
            var dateObj = dataforrefresh[0].dateObj;

            callForRefreshDrillDown(id, index, widgetData, dateObj);
            //$("#drildownplaceholder0").jqxChart('refresh');
        }

        self.handelCounterWidget = function (data, index) {

            var mArr = self.modifiedStaticDataWidget();

            if (mArr.length == 4) {

                openAlertpopup(1, 'no_able_to_add_widget');
            } else {

                createCounterWidget(self.jsonWidget, cunstStaticDataWidget, data.id, data.CallType, self.modifiedStaticDataWidget, self.NewStaticDataWidget, self.widgetData, self.widgetDataRight, self.CounterWidgetlist, self.backUpCounterWidget, self.UsersCounterWidgets, self.widgetlist, 1);

                self.CounterWidgetlist.remove(data);

            }
        }

        self.handelStandardWidget = function (data, index) {


            var mArr = self.newModifiedWidgetData();
            mArr.push(data);
            self.widgetlist.remove(data);

            self.newModifiedWidgetData([]);
            self.newModifiedWidgetData(mArr);
            self.widgetData([]);
            self.widgetDataRight([])
            dragdroponChart(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight,
                self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist, 1);

        }





        self.removeCunterWidget = function (data) {
            var arr = self.modifiedStaticDataWidget();
            removedCounterStates.push(data.background);

            if (arr.length == 2) {

                openAlertpopup(1, 'no_able_to_remove_counter_widget');
            } else {
                removedashboardwidgetdata(data);
                self.modifiedStaticDataWidget.remove(data);
                self.CounterWidgetlist.splice(0, 0, data);



                var arr1 = self.modifiedStaticDataWidget();

                var listarr = self.CounterWidgetlist();
                var str = '#counterList' + data.id;
                CacceptstrForList = CacceptstrForList + ',' + str;


                for (var i = 0; i < listarr.length; i++) {

                    var listid = '#counterList' + listarr[i].id;
                    $(listid).draggable({
                        zIndex: 2147483647,
                        revert: function (event, ui) {
                            return !event;
                        },

                        stack: ".ui-draggable"
                    });


                }

                $("#mainCounterWidget").droppable({
                    accept: CacceptstrForList,
                    greedy: true,
                    drop: function (event, ui) {
                        var dragdId = ui.draggable.prop('id');


                        var droppableDiv = $(this).prop("id");


                        var listArr = self.CounterWidgetlist();



                        dragdId = dragdId.replace('counterList', '');

                        var newdragsource = _.where(listArr, { id: dragdId });

                        if (newdragsource != '') {
                            userwidgetlength = userwidgetlength + 1;


                            var mArr = self.modifiedStaticDataWidget();
                            if (mArr.length == 4) {

                            } else {
                                createCounterWidget(self.jsonWidget, cunstStaticDataWidget, newdragsource[0].id, newdragsource[0].CallType, self.modifiedStaticDataWidget, self.NewStaticDataWidget, self.widgetData, self.widgetDataRight, self.CounterWidgetlist, self.backUpCounterWidget, self.UsersCounterWidgets, self.widgetlist, 1);
                                self.CounterWidgetlist.remove(newdragsource[0]);
                            }
                        } else {

                            var draggArr = self.widgetlist();
                            self.widgetlist([]);
                            self.widgetlist(draggArr);
                            var listArr = self.widgetlist();
                            for (var l = 0; l < listArr.length; l++) {
                                var listid = '#' + listArr[l].Identifier + '';
                                $(listid).draggable({

                                    revert: function (event, ui) {

                                        return !event;

                                    },
                                    zIndex: 999999,
                                    stack: ".ui-draggable"

                                });
                            }


                        }

                    }

                });
                getparamforSetWidget(self.widgetData, self.widgetDataRight, self.modifiedStaticDataWidget(), 0);
            }
            modifiedCounterWidgets = self.modifiedStaticDataWidget();
        }

        self.ShowWidget = function (data, index) {

            var selectedsource = _.where(self.widgetData(), { Widget: data.Widget });
            var selectedsourceRight = _.where(self.widgetDataRight(), { Widget: data.Widget });
            if (selectedsource == '' && selectedsourceRight == '') {
                var i = self.widgetDataRightbackup.indexOf(data);
                var j = self.widgetDatabackup.indexOf(data);

                if (i >= 0) {
                    self.widgetDataRight.splice(i, 0, data);
                    var id = 'placeholderRight' + j;
                    var chartdata = self.widgetDataRight();
                    $('#drildownplaceholderRight' + index).hide();
                }
                if (j >= 0) {
                    self.widgetData.splice(j, 0, data);
                    var id = 'placeholder' + (self.widgetData().length - 1);
                    var chartdata = self.widgetDataRight();
                    $('#drildownplaceholder' + index).hide();
                }
            } else {
                openAlertpopup(1, 'chart already visible')
            }
            getwidgetDataAfterAdd(self.widgetData, self.widgetlist, self.widgetDataRight, self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup);
        }

        self.showDrildown = function (id, data) {
        }

        self.refreshStandarWidget = function () {
            //alert('call refresh standare');
            //self.newModifiedWidgetData.remove(data);
            //////new code
            //self.widgetlist.splice(0, 0, data);
            WidgetDataMap = new Object();
            var mArr = self.newModifiedWidgetData();
            self.newModifiedWidgetData([]);
            self.newModifiedWidgetData(mArr);
            self.widgetData([]);
            self.widgetDataRight([])

            dragdroponChart(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight,
                self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist, 1);
            var arr = self.NewStaticDataWidget();
            var arr2 = self.modifiedStaticDataWidget();
            self.modifiedStaticDataWidget([]);
            for (var i = 0; i < arr2.length; i++) {
                //if (i <= userwidgetlength) {

                createCounterWidget(self.jsonWidget, cunstStaticDataWidget, arr2[i].Identifier, arr2[i].CallType, self.modifiedStaticDataWidget, self.NewStaticDataWidget, self.widgetData, self.widgetDataRight, self.CounterWidgetlist, self.backUpCounterWidget, self.UsersCounterWidgets, self.widgetlist);
                //  }
            }
        }

        //getwidgetData(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight, self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist);





        $("*").dblclick(function (e) {
            e.preventDefault();
            e.stopPropagation();
        });









        ///

        function dragCounterToStandard(id) {

        }


        function calculatePercentage(currentCount, totalCount) {
            var per = (parseFloat(currentCount) / parseFloat(totalCount)) * 100;
            if (per > 100) {
                per = 100;
            }
            if (per.toFixed(2) != 'NaN') {
                return per.toFixed(2);
            } else {
                return 0;
            }
        }
        function loadUserWidget(UsersStandardWidgets, UsersCounterWidgets, cunstStaticDataWidget, cunstWidgetData) {
            var userDataArr = dashboardWidgetData;
            var updateduserdata = dashboardWidgetData;
            for (var i = 0; i < userDataArr.length; i++) {

                if (userDataArr[i].Value != null) {
                    if (userDataArr[i].Value[0].DeviceCountIdentifier != undefined) {
                        if (userDataArr[i].Value != null) {
                            var obj = new Object();
                            obj.sequence = i;
                            obj.Type = userDataArr[i].Key;
                            UsersCounterWidgets.push(obj);
                            updateduserdata = _.reject(updateduserdata, function (el) { return el.Key === userDataArr[i].Key; });
                        }

                    }
                }

            }

            for (var i = 0; i < updateduserdata.length; i++) {
                var obj = new Object();
                obj.sequence = i;
                obj.Type = updateduserdata[i].Key;
                UsersStandardWidgets.push(obj);
            }
            // if (AppConstants.get('COUNTER') in counterwidgetstorage) {
            //     constructDataForStaticWidgets(self.StaticDataWidget, self.jsonWidget, self.modifiedStaticDataWidget, cunstStaticDataWidget, self.NewStaticDataWidget, self.CounterWidgetlist, self.backUpCounterWidget, self.UsersStandardWidgets, self.widgetData, self.widgetDataRight, self.widgetlist, counterwidgetstorage[AppConstants.get('COUNTER')]);
            //} else {
            GetDataForStaticWidgets(self.StaticDataWidget, self.jsonWidget, self.modifiedStaticDataWidget, cunstStaticDataWidget, self.NewStaticDataWidget, self.CounterWidgetlist, self.backUpCounterWidget, self.UsersStandardWidgets, self.widgetData, self.widgetDataRight, self.widgetlist);
            //  }
            // if (AppConstants.get('STANDARD') in counterwidgetstorage) {
            //    constructWidgetData(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight, self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist, counterwidgetstorage[AppConstants.get('STANDARD')]);
            // } else {
            getwidgetData(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight, self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist);
            // }
        };
        function getUserWidget(UsersStandardWidgets, UsersCounterWidgets, cunstStaticDataWidget, cunstWidgetData) {
            WidgetDataMap = new Object();
            $("#loader1").show();
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        $("#loader1").hide();
                        loadwidgetdata = 1;

                        if (data && data.getWidgetResp) {
                            data.getWidgetResp = $.parseJSON(data.getWidgetResp);
                        }
                        data.getWidgetResp.WidgetList = mapObjectToArray(data.getWidgetResp.WidgetList);
                        var userDataArr = data.getWidgetResp.WidgetList;
                        dashboardWidgetData = userDataArr;
                        for (var i = 0; i < userDataArr.length; i++) {

                            if (userDataArr[i].Value != null) {
                                if (userDataArr[i].Value[0].DeviceCountIdentifier != undefined) {
                                    if (userDataArr[i].Value != null) {
                                        var obj = new Object();
                                        obj.sequence = i;
                                        obj.Type = userDataArr[i].Key;
                                        UsersCounterWidgets.push(obj);
                                        data.getWidgetResp.WidgetList = _.reject(data.getWidgetResp.WidgetList, function (el) { return el.Key === userDataArr[i].Key; });
                                    }

                                }
                            }

                        }

                        for (var i = 0; i < data.getWidgetResp.WidgetList.length; i++) {
                            var obj = new Object();
                            obj.sequence = i;
                            obj.Type = data.getWidgetResp.WidgetList[i].Key;
                            UsersStandardWidgets.push(obj);
                        }

                        GetDataForStaticWidgets(self.StaticDataWidget, self.jsonWidget, self.modifiedStaticDataWidget, cunstStaticDataWidget, self.NewStaticDataWidget, self.CounterWidgetlist, self.backUpCounterWidget, self.UsersStandardWidgets, self.widgetData, self.widgetDataRight, self.widgetlist);
                        getwidgetData(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight, self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist);

                    } else if (data.responseStatus.StatusCode == AppConstants.get('UNAUTHORIZED_ACCESS')) {
                        $("#loader1").hide();
                    } else if (data.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR')) {
                        $("#loader1").hide();
                    } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                        $("#loader1").hide();
                        Token_Expired();
                    }
                    else if (data.responseStatus.StatusCode == AppConstants.get('FALSESTATUS')) {
                        $("#loader1").hide();
                        openAlertpopup(2, 'internal_error_api');
                    }
                    $("#loader1").hide();
                }
            }
            var params = '{"token":"' + TOKEN() + '"}';
            ajaxJsonCall('GetUserWidgets', params, callbackFunction, true, 'POST', true);
        }


        function constructDataForStaticWidgets(StaticDataWidget, jsonWidget, modifiedStaticDataWidget, cunstStaticDataWidget, NewStaticDataWidget, CounterWidgetlist, backUpCounterWidget, UsersCounterWidgets, widgetData, widgetDataRight, widgetlist, widgetdatalist) {
            var counterSequenceArr = self.UsersCounterWidgets();
            if (modifiedCounterWidgets.length > 0) {
                for (var seq = 0; seq < modifiedCounterWidgets.length; seq++) {

                    indexes = $.map(widgetdatalist, function (obj, index) {
                        if (obj.Identifier == modifiedCounterWidgets[seq].Identifier) {
                            widgetdatalist[index].background = modifiedCounterWidgets[seq].background;
                            return index;
                        }
                    })
                    var oldindex = indexes[0];
                    widgetdatalist.move(oldindex, seq);
                }
                if (modifiedCounterWidgets != null) {
                    userwidgetlength = modifiedCounterWidgets.length - 1;
                }
            } else {
                if (counterSequenceArr != null) {
                    userwidgetlength = counterSequenceArr.length - 1;
                    if (userwidgetlength == 4) {
                        counterSequenceArr.pop();
                    }
                }
                var staticArr = new Array();
                for (var seq = 0; seq < counterSequenceArr.length; seq++) {

                    indexes = $.map(widgetdatalist, function (obj, index) {
                        if (obj.Identifier == counterSequenceArr[seq].Type) {
                            return index;
                        }
                    })
                    var oldindex = indexes[0];
                    widgetdatalist.move(oldindex, seq);
                }
            }


            StaticDataWidget(widgetdatalist);
            NewStaticDataWidget(widgetdatalist);
            for (var j = 0; j < widgetdatalist.length; j++) {
                if (widgetdatalist[j].background == undefined) {
                    if (j <= userwidgetlength) {
                        widgetdatalist[j].background = vfCounterColors[j];
                    }
                }

                var arr = jsonWidget();

                for (var k = 0; k < arr.length; k++) {

                    //if (k <= 3) {
                    if (arr[k].Widget.id == widgetdatalist[j].Identifier) {
                        var userSource = _.where(counterSequenceArr, { Type: arr[k].Widget.id });

                        if (userSource == '') {
                            CounterWidgetlist.push(new cunstStaticDataWidget(widgetdatalist[j].Identifier, widgetdatalist[j].CallType, widgetdatalist[j].WidgetId, widgetdatalist[j], arr[k], vfCounterColors[j]));
                        }

                        backUpCounterWidget.push(new cunstStaticDataWidget(widgetdatalist[j].Identifier, widgetdatalist[j].CallType, widgetdatalist[j].WidgetId, widgetdatalist[j], arr[k], vfCounterColors[j]));
                        if (j <= userwidgetlength) {
                            //modifiedStaticDataWidget.push(new cunstStaticDataWidget(data.getAllDashboardWidgetsResp.WidgetList[j].Identifier, data.getAllDashboardWidgetsResp.WidgetList[j].CallType, data.getAllDashboardWidgetsResp.WidgetList[j].WidgetId));
                        }
                    }
                    //}
                }
            }

            var listarr = CounterWidgetlist();





            for (var i = 0; i < listarr.length; i++) {
                var acceptID = '#counterList' + listarr[i].id;
                Cacceptstr += acceptID + ',';
            }





            for (var i = 0; i < listarr.length; i++) {

                var listid = '#counterList' + listarr[i].id;
                $(listid).draggable({
                    zIndex: 2147483647,
                    revert: function (event, ui) {

                        return !event;

                    },
                    stack: ".ui-draggable"
                });



            }
            var maindivWidth = modifiedStaticDataWidget().length;
            maindivWidth = maindivWidth * 250;

            $("#CounterWidetMainDiv").css("width", maindivWidth + "px");
            var arr = NewStaticDataWidget();


            var Cacceptstr = '';
            for (var i = 0; i < arr.length; i++) {
                var acceptID = '#' + arr[i].Identifier;
                Cacceptstr += acceptID + ',';
            }

            Cacceptstr = Cacceptstr.substr(0, Cacceptstr.length - 1);



            for (var i = 0; i < arr.length; i++) {

                var id = '#' + arr[i].Identifier + '';
                $(id).draggable({
                    revert: function (event, ui) {

                        return !event;

                    },
                    zIndex: 999999,
                    stack: ".ui-draggable"


                });

                $(id).droppable({
                    greedy: true,
                    //accept: acceptStrCounter,//'#CW_FUTURE_SCHEDULED_DEVICES_COUNT,#CW_UPDATED_DEVICE_COUNT',//Cacceptstr,
                    drop: function (event, ui) {
                        var dragID = ui.draggable.prop('id');

                        var droppableId = $(this).prop("id");

                        var newarr = modifiedStaticDataWidget();
                        var source = _.where(newarr, { Identifier: dragID });
                        var index1 = newarr.indexOf(source[0]);
                        var source2 = _.where(newarr, { Identifier: droppableId });
                        var index2 = newarr.indexOf(source2[0])



                        newarr = _.reject(newarr, function (el) { return el.Identifier === dragID; });
                        newarr.splice(index2, 0, source[0]);

                        NewStaticDataWidget([]);
                        NewStaticDataWidget(newarr);

                        modifiedStaticDataWidget([]);
                        modifiedStaticDataWidget(newarr);
                        modifiedCounterWidgets = newarr;
                        afterdraggCounterWidget(jsonWidget, cunstStaticDataWidget, backUpCounterWidget(), modifiedStaticDataWidget, NewStaticDataWidget, widgetData, widgetDataRight, CounterWidgetlist, backUpCounterWidget, UsersCounterWidgets, widgetlist);
                    }
                });
            }
            for (var i = 0; i < arr.length; i++) {
                if (userwidgetlength > 3) {
                    userwidgetlength = 3;
                }
                if (i <= userwidgetlength) {

                    createCounterWidget(jsonWidget, cunstStaticDataWidget, arr[i].Identifier, arr[i].CallType, modifiedStaticDataWidget, NewStaticDataWidget, widgetData, widgetDataRight, CounterWidgetlist, backUpCounterWidget, UsersCounterWidgets, widgetlist);
                }
            }
        }
        function GetDataForStaticWidgets(StaticDataWidget, jsonWidget, modifiedStaticDataWidget, cunstStaticDataWidget, NewStaticDataWidget, CounterWidgetlist, backUpCounterWidget, UsersCounterWidgets, widgetData, widgetDataRight, widgetlist) {
            checklodingForCounter = 0;
            $('#loader2').show();
            var counterSequenceArr = self.UsersCounterWidgets();
            if (counterSequenceArr != null) {
                userwidgetlength = counterSequenceArr.length - 1;
            }


            ////new code

            var Cacceptstr = '';



            ////
            var getAllDashboardWidgetsReq = new Object();
            getAllDashboardWidgetsReq.WidgetType = AppConstants.get('COUNTER');//'Counter';
            function callbackFunction(data, error) {
                if (data) {
                    if (data && data.getAllDashboardWidgetsResp) {
                        data.getAllDashboardWidgetsResp = $.parseJSON(data.getAllDashboardWidgetsResp);
                    }

                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        counterwidgetstorage[AppConstants.get('COUNTER')] = data.getAllDashboardWidgetsResp.WidgetList;
                        constructDataForStaticWidgets(StaticDataWidget, jsonWidget, modifiedStaticDataWidget, cunstStaticDataWidget, NewStaticDataWidget, CounterWidgetlist, backUpCounterWidget, UsersCounterWidgets, widgetData, widgetDataRight, widgetlist, data.getAllDashboardWidgetsResp.WidgetList);
                    }
                }
            }
            var params = '{"token":"' + TOKEN() + '","getAllDashboardWidgetsReq":' + JSON.stringify(getAllDashboardWidgetsReq) + '}';
            ajaxJsonCall('GetAllDashboardWidgets', params, callbackFunction, true, 'POST', true);
        }

        function afterdraggCounterWidget(jsonWidget, cunstStaticDataWidget, arr, modifiedStaticDataWidget, NewStaticDataWidget, widgetData, widgetDataRight, CounterWidgetlist, backUpCounterWidget, UsersCounterWidgets, widgetlist) {
            var newArr = modifiedStaticDataWidget();


            modifiedStaticDataWidget([]);
            for (var i = 0; i < newArr.length; i++) {
                if (userwidgetlength > 3) {
                    userwidgetlength = 3;
                }
                if (i <= userwidgetlength) {
                    createCounterWidget(jsonWidget, cunstStaticDataWidget, newArr[i].Identifier, newArr[i].CallType, modifiedStaticDataWidget, NewStaticDataWidget, widgetData, widgetDataRight, CounterWidgetlist, backUpCounterWidget, UsersCounterWidgets, widgetlist);
                }
            }

            getparamforSetWidget(widgetData, widgetDataRight, newArr, 0);
        }

        function createCounterWidget(jsonWidget, cunstStaticDataWidget, counterWidgetId, callType, modifiedStaticDataWidget, NewStaticDataWidget, widgetData, widgetDataRight, CounterWidgetlist, backUpCounterWidget, UsersCounterWidgets, widgetlist, checksetflage) {
            var Cacceptstr = '';


            var CLArray = CounterWidgetlist();
            var DefaultValue = 0;

            for (var i = 0; i < CLArray.length; i++) {
                var acceptID = '#counterList' + CLArray[i].id;
                Cacceptstr += acceptID + ',';
                CacceptstrForList += acceptID + ',';
            }

            CacceptstrForList = CacceptstrForList.substr(0, CacceptstrForList.length - 1);

            var CArray = modifiedStaticDataWidget();

            for (var i = 0; i < CArray.length; i++) {
                var acceptID = '#' + CArray[i].id + '';
                Cacceptstr += acceptID + ',';
            }





            Cacceptstr = Cacceptstr.substr(0, Cacceptstr.length - 1);
            acceptStrCounter = Cacceptstr;
            //('test2==' + acceptStrCounter)


            ///////for new changesmove postion of counter main drop
            $("#mainCounterWidget").droppable({
                accept: CacceptstrForList,
                greedy: true,
                drop: function (event, ui) {

                    var dragdId = ui.draggable.prop('id');

                    var droppableDiv = $(this).prop("id");


                    var listArr = self.CounterWidgetlist();



                    dragdId = dragdId.replace('counterList', '');

                    var newdragsource = _.where(listArr, { id: dragdId });

                    if (newdragsource != '') {
                        userwidgetlength = userwidgetlength + 1;

                        var mArr = self.modifiedStaticDataWidget();

                        if (mArr.length == 4) {

                        } else {
                            createCounterWidget(self.jsonWidget, cunstStaticDataWidget, newdragsource[0].id, newdragsource[0].CallType, self.modifiedStaticDataWidget, self.NewStaticDataWidget, self.widgetData, self.widgetDataRight, self.CounterWidgetlist, self.backUpCounterWidget, self.UsersCounterWidgets, self.widgetlist, 1);
                            self.CounterWidgetlist.remove(newdragsource[0]);
                        }
                    } else {

                        var draggArr = self.widgetlist();
                        self.widgetlist([]);
                        self.widgetlist(draggArr);
                        var listArr = self.widgetlist();
                        for (var l = 0; l < listArr.length; l++) {
                            var listid = '#' + listArr[l].Identifier + '';
                            $(listid).draggable({

                                revert: function (event, ui) {

                                    return !event;

                                },
                                zIndex: 999999,
                                stack: ".ui-draggable"

                            });
                        }


                    }

                }

            });

            /////////

            var backupArr = backUpCounterWidget();
            var arr = jsonWidget();
            for (var j = 0; j < arr.length; j++) {
                if (arr[j].Widget.id == counterWidgetId) {

                    var source = new Array();
                    source.push(arr[j].Widget);
                    var totalCount = 100;
                    var currentCount = 10;
                    if (source[0] != undefined) {
                        var id = '#' + arr[j].Widget.id + '';
                        var str = '';
                        var className = arr[j].Widget.class;
                        str += '<div  class="dash-p-sm ' + className + '">';
                        var currentCount = 10;
                        var totalCount = 100;
                        var percentage = calculatePercentage(currentCount, totalCount);

                        str += '</div>';
                        var datasource = _.where(backupArr, { id: arr[j].Widget.id })
                        datasource[0].CurrentCount = currentCount;
                        datasource[0].TotalCount = totalCount;
                        DefaultValue = datasource[0].callduration;
                        if (datasource[0].background == undefined) {

                            if (removedCounterStates.length > 0) {
                                datasource[0].background = removedCounterStates[0];
                                removedCounterStates.splice(0, 1);
                            } else {
                                datasource[0].background = "vf-sec-purple";
                            }
                        }
                        modifiedStaticDataWidget.push(new cunstStaticDataWidget(arr[j].Widget.id, callType, arr[j].Widget.id, datasource[0], arr[j], datasource[0].background));

                        if (checksetflage != undefined) {

                            var mArr = self.modifiedStaticDataWidget();
                            getparamforSetWidget(self.widgetData, self.widgetDataRight, mArr, 0);
                        }

                        $(id).draggable({
                            revert: function (event, ui) {

                                return !event;

                            },
                            zIndex: 999999,
                            stack: ".ui-draggable"

                        });
                        $(id).droppable({
                            greedy: true,

                            drop: function (event, ui) {
                                var dragID = ui.draggable.prop('id');


                                var dragID = ui.draggable.attr('id');

                                var droppableId = $(this).attr("id");

                                var newarr = modifiedStaticDataWidget();




                                var source = _.where(newarr, { Identifier: dragID });

                                if (source != undefined && source == '') {

                                    dragID = dragID.substring(11)

                                    source = _.where(newarr, { Identifier: dragID });
                                    var listsource = _.where(CounterWidgetlist(), { id: dragID });

                                    if (listsource != undefined && listsource != '') {

                                        var backsource = _.where(CounterWidgetlist(), { id: dragID });
                                        var backupindex = CounterWidgetlist().indexOf(backsource[0])
                                        CounterWidgetlist(_.reject(CounterWidgetlist(), function (el) { return el.id === dragID; }));

                                        var index1 = newarr.indexOf(listsource[0]);
                                        var source2 = _.where(newarr, { Identifier: droppableId });
                                        var index2 = newarr.indexOf(source2[0]);
                                        removedCounterStates.push(source2[0].background);
                                        removedashboardwidgetdata(source2[0]);


                                        if (modifiedStaticDataWidget().length >= 4) {

                                            newarr = _.reject(newarr, function (el) { return el.Identifier === droppableId; });
                                            var datasource = _.where(backUpCounterWidget(), { id: droppableId });


                                            CounterWidgetlist.splice(backupindex, 0, datasource[0]);


                                        } else {

                                            userwidgetlength = userwidgetlength + 1;
                                        }
                                        listsource[0].background = source2[0].background;
                                        newarr.splice(index2, 0, listsource[0]);


                                        //var backupsource = _.where(newarr, { id: dragID });
                                        //var backupindex = newarr.indexOf(source2[0])
                                        //newarr.splice(index2, 0, backupsource[0]);
                                    } else {


                                        var draggArr = widgetlist();
                                        widgetlist([]);
                                        widgetlist(draggArr);
                                        var listArr = widgetlist();
                                        for (var l = 0; l < listArr.length; l++) {
                                            var listid = '#' + listArr[l].Identifier + '';
                                            $(listid).draggable({
                                                revert: function (event, ui) {

                                                    return !event;

                                                },
                                                zIndex: 999999,
                                                stack: ".ui-draggable"

                                            });
                                        }
                                    }


                                } else {

                                    var index1 = newarr.indexOf(source[0]);
                                    var source2 = _.where(newarr, { Identifier: droppableId });
                                    var index2 = newarr.indexOf(source2[0])


                                    ///newarr.remove(source[0])
                                    newarr = _.reject(newarr, function (el) { return el.Identifier === dragID; });
                                    newarr.splice(index2, 0, source[0]);
                                    vfCounterColors.splice(index1, 1);
                                    vfCounterColors.splice(index2, 0, source[0].background);

                                }
                                var listarr = CounterWidgetlist();
                                for (var i = 0; i < listarr.length; i++) {

                                    var listid = '#counterList' + listarr[i].id;
                                    $(listid).draggable({

                                        zIndex: 2147483647,
                                        revert: function (event, ui) {
                                            return !event;
                                        },

                                        stack: ".ui-draggable"
                                    });


                                }


                                NewStaticDataWidget([]);
                                NewStaticDataWidget(newarr);
                                userwidgetlength = newarr.length - 1;
                                modifiedStaticDataWidget([]);
                                modifiedStaticDataWidget(newarr);
                                modifiedCounterWidgets = newarr;

                                afterdraggCounterWidget(jsonWidget, cunstStaticDataWidget, backUpCounterWidget(), modifiedStaticDataWidget, NewStaticDataWidget, widgetData, widgetDataRight, CounterWidgetlist, backUpCounterWidget, UsersCounterWidgets, widgetlist);
                            }
                        });

                    }

                } else {

                }

            }
            modifiedCounterWidgets = modifiedStaticDataWidget();
            generateDataForCounter(counterWidgetId, callType, userwidgetlength, DefaultValue);


        }
        function numberWithCommas(value) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        function setDataToCounter(counterWidgetId, data) {

            var totalCount = data[0].TotalCount;
            var currentCount = data[0].CurrentCount;
            var percentage = calculatePercentage(currentCount, totalCount);
            if (counterWidgetId == 'CW_TOTAL_DEVICE_COUNT') {
                var id = '#' + counterWidgetId + 'counterCountPro';
                $(id).text(numberWithCommas(currentCount));

            } else {
                var id = '#' + counterWidgetId + 'counterCount';
                $(id).text(numberWithCommas(currentCount));
            }

            var progdivId = '#' + counterWidgetId + 'percentageDiv';
            var progSpanId = '#' + counterWidgetId + 'perSpan';

            $(progdivId).css("width", percentage + "%");

            $(progSpanId).text(percentage + "%");
        }


        function generateDataForCounter(counterWidgetId, callType, userwidgetlength, DefaultValue) {
            var GetWidgetsReq = new Object();
            var WidgetParams = new Object();
            GetWidgetsReq.WidgetId = counterWidgetId;//"CW_TOTAL_DEVICE_COUNT";
            var WidgetParams = new Array();
            WidgetParams = [];
            var dictionary = new Array();
            if (DefaultValue != 0 && DefaultValue != "") {
                var DashBoardParamsFrom = new Object();
                DashBoardParamsFrom.PName = 'From';
                var date;
                if (callType == 'Weekly') {

                    date = moment().tz(name).subtract('days', 7 * DefaultValue).format('MM/DD/YYYY');
                } else if (callType == 'day') {
                    date = moment().tz(name).subtract('days', DefaultValue).format('MM/DD/YYYY');
                }
                var minutes = "00";
                var hours = "24";
                var fromdate = getlocaldateForDashboard('from', date, hours, minutes);
                //  var dayNumber = fromdate.getDate();
                DashBoardParamsFrom.PValue = fromdate;
                dictionary.push(DashBoardParamsFrom);


                var DashBoardParamsFrom = new Object();
                DashBoardParamsFrom.PName = 'To';
                //DashBoardParamsFrom.PValue = '10-29-2015';
                var date = moment().tz(name).format('MM/DD/YYYY');
                var minutes = "59";
                var hours = "23";
                var todate = getlocaldateForDashboard('to', date, hours, minutes);
                DashBoardParamsFrom.PValue = todate;
                dictionary.push(DashBoardParamsFrom);
            }


            WidgetParams = dictionary;
            GetWidgetsReq.WidgetParams = WidgetParams;
            function counterCallback(data, error) {
                checklodingForCounter = checklodingForCounter + 1;
                if (data) {

                    if (data.getWidgetResp) {
                        data.getWidgetResp = $.parseJSON(data.getWidgetResp);
                        data.getWidgetResp.WidgetList = mapObjectToArray(data.getWidgetResp.WidgetList);
                        insertdashboardwidgetdata(data.getWidgetResp.WidgetList[0]);
                        WidgetDataMap[counterWidgetId] = data.getWidgetResp.WidgetList[0].Value;
                        setDataToCounter(counterWidgetId, data.getWidgetResp.WidgetList[0].Value);
                    }
                }

                if (checklodingForCounter == userwidgetlength + 1) {
                    $("#loader2").hide();
                    //checklodingForCounter = 0;
                }
            }

            var params = '{"token":"' + TOKEN() + '","getWidgetByIdReq":' + JSON.stringify(GetWidgetsReq) + '}';
            /// mow check
            ajaxJsonCall('GetWidgetById', params, counterCallback, true, 'POST', true);
        }





        function createSingleCounterWidget(jsonWidget, counterWidgetId, callType) {

            var GetWidgetsReq = new Object();
            var WidgetParams = new Object();
            GetWidgetsReq.WidgetId = counterWidgetId;//"CW_TOTAL_DEVICE_COUNT";
            var WidgetParams = new Array();
            WidgetParams = [];

            var dictionary = new Array();

            if (callType == 'Weekly') {
                var DashBoardParamsFrom = new Object();
                DashBoardParamsFrom.PName = 'From';
                var fromdate = moment().subtract('days', 7).format('MM-DD-YYYY');
                DashBoardParamsFrom.PValue = fromdate;
                dictionary.push(DashBoardParamsFrom);


                var DashBoardParamsFrom = new Object();
                DashBoardParamsFrom.PName = 'To';
                var todate = moment().format('MM-DD-YYYY');
                DashBoardParamsFrom.PValue = todate;
                dictionary.push(DashBoardParamsFrom);
            }


            WidgetParams = dictionary;
            GetWidgetsReq.WidgetParams = WidgetParams;

            function counterCallback(data) {
                if (data.getWidgetResp) {
                    data.getWidgetResp = $.parseJSON(data.getWidgetResp);
                    data.getWidgetResp.WidgetList = mapObjectToArray(data.getWidgetResp.WidgetList);

                    insertdashboardwidgetdata(data.getWidgetResp.WidgetList[0]);
                    var d = data.getWidgetResp.WidgetList[0].Value;
                    var arr = jsonWidget();
                    for (var j = 0; j < arr.length; j++) {
                        if (arr[j].Widget.id == counterWidgetId) {

                            var totalCount = d[0].TotalCount;
                            var currentCount = d[0].CurrentCount;

                            var id = '#' + counterWidgetId + '';
                            $(id).empty();
                            var str = '';
                            var className = arr[j].Widget.class;
                            str += '<div  class="dash-p-sm ' + className + '">';
                            var currentCount = d[0].CurrentCount;
                            var totalCount = d[0].TotalCount;

                            var percentage = calculatePercentage(currentCount, totalCount);

                            if (arr[j].Widget.progress) {
                                str += '<h5 class="mb5" style="padding-top: 0px;" >' + i18n.t(arr[j].Widget.id, { lng: lang }) + '</h5>';
                                str += '<h2 class="mt0" >' + currentCount + '</h2>';

                                str += '<div class="progress p-custom" >';
                                str += '<div class="progress-bar" id="reportedPer" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="' + percentage + '" >';
                                str += '<span >' + percentage + '</span>';
                                str += '</div>';
                                str += '</div>';
                            }
                            else {

                                str += '<h5 class="mb5" style="padding-top: 16px;" >' + i18n.t(arr[j].Widget.id, { lng: lang }) + '</h5>';
                                str += '<h1 class="mt0"  >' + currentCount + '</h1>';
                            }


                            str += '</div>';
                            $(id).append(str);



                        } else {

                        }
                    }

                }

            }

            var params = '{"token":"' + TOKEN() + '","getWidgetByIdReq":' + JSON.stringify(GetWidgetsReq) + '}';
            ajaxJsonCall('GetWidgetById', params, counterCallback, true, 'POST', true);
        }

        function handlePanelAction() {
            $("[data-click=panel-remove]").hover(function () {
                $(this).tooltip({
                    title: "Remove",
                    placement: "bottom",
                    trigger: "hover",
                    container: "body"
                });
                $(this).tooltip("show")
            });
            $("[data-click=panel-remove]").click(function (e) {
                e.preventDefault();
                $(this).tooltip("destroy");
                //$(this).closest(".panel").remove()
            });
            $("[data-click=panel-collapse]").hover(function () {
                $(this).tooltip({
                    title: "Collapse / Expand",
                    placement: "bottom",
                    trigger: "hover",
                    container: "body"
                });
                $(this).tooltip("show")
            });
            $("[data-click=panel-collapse]").click(function (e) {
                e.preventDefault();
                $(this).closest(".panel").find(".panel-body").slideToggle()
            });

            $("[data-click=panel-expand]").hover(function () {
                $(this).tooltip({
                    title: "Expand / Compress",
                    placement: "bottom",
                    trigger: "hover",
                    container: "body"
                });
                $(this).tooltip("show")
            });
            $("[data-click=panel-expand]").click(function (e) {
                e.preventDefault();
                var t = $(this).closest(".panel");
                var n = $(t).find(".panel-body");
                var r = 40;
                if ($(n).length !== 0) {
                    var i = $(t).offset().top;
                    var s = $(n).offset().top;
                    r = s - i
                }
                if ($("body").hasClass("panel-expand") && $(t).hasClass("panel-expand")) {
                    $("body, .panel").removeClass("panel-expand");
                    $(".panel").removeAttr("style");
                    $(n).removeAttr("style")
                } else {
                    $("body").addClass("panel-expand");
                    $(this).closest(".panel").addClass("panel-expand");
                    if ($(n).length !== 0 && r != 40) {
                        var o = 40;
                        $(t).find(" > *").each(function () {
                            var e = $(this).prop("class");
                            if (e != "panel-heading" && e != "panel-body") {
                                o += $(this).height() + 30
                            }
                        });
                        if (o != 40) {
                            $(n).css("top", o + "px")
                        }
                    }
                }
                $(window).trigger("resize")
            })
        };
        function handleDraggablePanel() {

            var e = $(".panel").parent("[class*=col]");
            var t = ".panel-heading";

            $(e).sortable({
                handle: t,

            })
        };
        function isOdd(num) { return num % 2; }
        function constructWidgetData(jsonWidget, modifiedWidgetData, widgetData, widgetlist, widgetDataRight,
            widgetbackuplist, widgetDataRightbackup, widgetDatabackup, cunstWidgetData, modifiedStaticDataWidget, UsersStandardWidgets, newModifiedWidgetData, CounterWidgetlist, widgetlistData) {
            var a = jsonWidget();
            var standardSequenceArr = UsersStandardWidgets();
            for (var i = 0; i < widgetlistData.length; i++) {
                var identifier = widgetlistData[i].Identifier;
                var source = new Array();
                var arr = jsonWidget();
                for (var j = 0; j < arr.length; j++) {
                    if (arr[j].Widget.id == identifier) {
                        source.push(arr[j].Widget);
                    } else {

                    }
                }
                if (source != '') {
                    var userseq = _.where(standardSequenceArr, { Type: source[0].__type });
                    if (widgetlistData[i].Category == "base") {
                        if (userseq != '') {

                            newModifiedWidgetData.push(new cunstWidgetData(widgetlistData[i], source[0]));
                        } else {
                            widgetlist.push(new cunstWidgetData(widgetlistData[i], source[0]));
                        }
                    }
                    modifiedWidgetData.push(new cunstWidgetData(widgetlistData[i], source[0]));
                }
            }
            userstandardwidgetlength = standardSequenceArr.length - 1;

            var tempArr = modifiedWidgetData()

            for (var seq = 0; seq < standardSequenceArr.length; seq++) {

                indexes = $.map(tempArr, function (obj, index) {
                    if (obj.WidgetSourceData.__type == standardSequenceArr[seq].Type) {
                        return index;
                    }
                })
                var oldindex = indexes[0];
                if (oldindex > -1 && seq < tempArr.length)
                    tempArr.move(oldindex, seq);

            }
            modifiedWidgetData(tempArr);
            var newArr = modifiedWidgetData()
            ///new code
            widgetbackuplist(modifiedWidgetData);
            allDataArr = modifiedWidgetData();
            var arr = modifiedWidgetData();
            for (var i = 0; i < arr.length; i++) {
                if (isOdd(i)) {

                    if (arr[i].Category == "base") {

                        widgetDataRightbackup.push(arr[i]);
                        //widgetlist.push(arr[i]);
                    }
                } else {
                    if (arr[i].Category == "base") {

                        widgetDatabackup.push(arr[i]);
                        //widgetlist.push(arr[i]);
                    }
                }
            }

            var tempArr1 = newModifiedWidgetData()

            for (var seq = 0; seq < standardSequenceArr.length; seq++) {

                indexes = $.map(tempArr1, function (obj, index) {
                    if (obj.WidgetSourceData.__type == standardSequenceArr[seq].Type) {
                        return index;
                    }
                })


                var oldindex = indexes[0];
                if (oldindex > -1 && seq < tempArr1.length)
                    tempArr1.move(oldindex, seq);

            }
            newModifiedWidgetData(tempArr1);

            ///new code
            dragdroponChart(jsonWidget, modifiedWidgetData, widgetData, widgetlist, widgetDataRight,
                widgetbackuplist, widgetDataRightbackup, widgetDatabackup, cunstWidgetData, modifiedStaticDataWidget, UsersStandardWidgets, newModifiedWidgetData, CounterWidgetlist, 0);
            ///

        }
        function getwidgetData(jsonWidget, modifiedWidgetData, widgetData, widgetlist, widgetDataRight,
            widgetbackuplist, widgetDataRightbackup, widgetDatabackup, cunstWidgetData, modifiedStaticDataWidget, UsersStandardWidgets, newModifiedWidgetData, CounterWidgetlist) {
            function callbackFunction(data, error) {
                if (data && data.getAllDashboardWidgetsResp) {
                    data.getAllDashboardWidgetsResp = $.parseJSON(data.getAllDashboardWidgetsResp);
                }

                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        counterwidgetstorage[AppConstants.get('STANDARD')] = data.getAllDashboardWidgetsResp.WidgetList;
                        constructWidgetData(jsonWidget, modifiedWidgetData, widgetData, widgetlist, widgetDataRight,
                            widgetbackuplist, widgetDataRightbackup, widgetDatabackup, cunstWidgetData, modifiedStaticDataWidget, UsersStandardWidgets, newModifiedWidgetData, CounterWidgetlist, data.getAllDashboardWidgetsResp.WidgetList);

                    }
                }
            }

            var getAllDashboardWidgetsReq = new Object();
            getAllDashboardWidgetsReq.WidgetType = AppConstants.get('STANDARD');//'Standard';

            //
            //var params = '{"token":"' + TOKEN() + '"}';
            //ajaxJsonCall('GetAllDashboardWidgets', params, callbackFunction, true, 'POST', false);
            var params = '{"token":"' + TOKEN() + '","getAllDashboardWidgetsReq":' + JSON.stringify(getAllDashboardWidgetsReq) + '}';
            ajaxJsonCall('GetAllDashboardWidgets', params, callbackFunction, true, 'POST', true);

        }


        function dragdroponChart(jsonWidget, modifiedWidgetData, widgetData, widgetlist, widgetDataRight,
            widgetbackuplist, widgetDataRightbackup, widgetDatabackup, cunstWidgetData, modifiedStaticDataWidget, UsersStandardWidgets, newModifiedWidgetData, CounterWidgetlist, setWidgetFlag) {

            var acceptStr = '';

            var acceptStrForlist = '';

            chartIds = new Array();

            var arr1 = newModifiedWidgetData();
            for (var i = 0; i < arr1.length; i++) {
                if (isOdd(i)) {

                    if (arr1[i].Category == "base") {
                        arr1[i].widgetLabels = ko.observableArray();;
                        widgetDataRight.push(arr1[i]);
                    }
                } else {
                    if (arr1[i].Category == "base") {
                        arr1[i].widgetLabels = ko.observableArray();;
                        widgetData.push(arr1[i]);
                    }
                }
            }

            var widListArr = widgetlist();

            for (var w = 0; w < widListArr.length; w++) {
                var id = '#' + widListArr[w].Identifier + '';
                $(id).draggable({

                    revert: function (event, ui) {
                        return !event;
                    },
                    zIndex: 999999,
                    stack: ".ui-draggable"

                });
                acceptStr += id + ',';
                acceptStrForlist += id + ',';
            }
            acceptStrForlist = acceptStrForlist.substr(0, acceptStrForlist.length - 1);
            chartdataRight = widgetDataRight();


            chartdataleft = widgetData();

            for (var j = 0; j < chartdataRight.length; j++) {


                acceptID = '#expandDrilplaceholderRight' + j;
                acceptStr += acceptID + ',';
            }

            for (var j = 0; j < chartdataleft.length; j++) {
                acceptID = '#expandDrilplaceholder' + j;
                acceptStr += acceptID + ',';
            }

            acceptStr = acceptStr.substr(0, acceptStr.length - 1);

            acceptStrStandard = acceptStr;
            var modifiedstarr = modifiedStaticDataWidget();
            for (var j = 0; j < modifiedstarr.length; j++) {
                if (modifiedstarr[j].id in WidgetDataMap) {
                    $("#loader2").hide();
                    setDataToCounter(modifiedstarr[j].id, WidgetDataMap[modifiedstarr[j].id]);

                } else {
                    //Code commented for duplicate loading in the login
                    //generateDataForCounter(modifiedstarr[j].id, modifiedstarr[j].CallType, modifiedstarr.length - 1);
                }

            }

            for (var j = 0; j < chartdataRight.length; j++) {
                var RightID = 'placeholderRight' + j;
                chartIds.push(RightID);
                //if (chartdataRight[j].Category == "base") {
                if (chartdataRight[j].Identifier in WidgetDataMap) {
                    setDataToCharts(RightID, j, chartdataRight[j], WidgetDataMap[chartdataRight[j].Identifier], true);
                } else {
                    GetWidgetsById(RightID, j, chartdataRight[j]);
                    $("#drildown" + RightID).hide();
                }
                //$("#expandDrilplaceholderRight" + i).draggable();
                //}

            }


            ///new for main div
            $("#mainChartPanel").droppable({
                accept: acceptStrForlist,
                greedy: true,
                drop: function (event, ui) {
                    var dragdId = ui.draggable.prop('id');


                    var droppableDiv = $(this).prop("id");



                    var listArr = self.widgetlist();


                    var newdragsource = _.where(listArr, { Identifier: dragdId });

                    if (newdragsource != '') {
                        var mArr = self.newModifiedWidgetData();
                        mArr.push(newdragsource[0]);
                        self.widgetlist.remove(newdragsource[0]);
                        self.newModifiedWidgetData([]);
                        self.newModifiedWidgetData(mArr);
                        self.widgetData([]);
                        self.widgetDataRight([])
                        dragdroponChart(self.jsonWidget, self.modifiedWidgetData, self.widgetData, self.widgetlist, self.widgetDataRight,
                            self.widgetbackuplist, self.widgetDataRightbackup, self.widgetDatabackup, cunstWidgetData, self.modifiedStaticDataWidget, self.UsersStandardWidgets, self.newModifiedWidgetData, self.CounterWidgetlist, 1);

                    }

                }

            });
            ///

            for (var l = 0; l < chartdataRight.length; l++) {
                var RightID = 'expandDrilplaceholderRight' + l;



                $("#" + RightID).droppable({
                    greedy: true,
                    accept: acceptStr,
                    drop: function (event, ui) {

                        checkDragg = 1;

                        var dragdiv = ui.draggable.prop('id');
                        var dragdId = $("#" + dragdiv).children('div').prop('id');

                        var droppableDiv = $(this).prop("id");

                        var DropId = $("#" + droppableDiv).children('div').prop('id');



                        var mainArr = newModifiedWidgetData();


                        dragdId = parseInt(dragdId);

                        DropId = parseInt(DropId);

                        var dragsource = _.where(mainArr, { WidgetId: dragdId });



                        var dropsource = _.where(mainArr, { WidgetId: DropId })



                        var listArr = widgetlist();
                        if (dragsource == '') {

                            var newdragsource = _.where(listArr, { WidgetId: dragdId });

                            if (newdragsource != '') {
                                var dragIndex = listArr.indexOf(newdragsource[0])
                                var dropIndex = mainArr.indexOf(dropsource[0])

                                listArr = _.reject(listArr, function (el) { return el.WidgetId === dragdId; });
                                widgetlist(listArr);

                                mainArr.splice(dropIndex, 0, newdragsource[0]);
                            } else {


                            }



                        } else {

                            var dragIndex = mainArr.indexOf(dragsource[0])
                            var dropIndex = mainArr.indexOf(dropsource[0])

                            mainArr = _.reject(mainArr, function (el) { return el.WidgetId === dragdId; });

                            mainArr.splice(dropIndex, 0, dragsource[0]);
                        }



                        newModifiedWidgetData([]);
                        newModifiedWidgetData(mainArr);
                        widgetData([]);
                        widgetDataRight([]);

                        dragdroponChart(jsonWidget, modifiedWidgetData, widgetData, widgetlist, widgetDataRight,
                            widgetbackuplist, widgetDataRightbackup, widgetDatabackup, cunstWidgetData, modifiedStaticDataWidget, UsersStandardWidgets, newModifiedWidgetData, CounterWidgetlist, 1);

                    }
                });

            }




            for (var k = 0; k < chartdataleft.length; k++) {
                var id = 'placeholder' + k;
                chartIds.push(id);
                //if (chartdataleft[k].Category == "base") {
                if (chartdataleft[k].Identifier in WidgetDataMap) {
                    setDataToCharts(id, 'Right' + k, chartdataleft[k], WidgetDataMap[chartdataleft[k].Identifier], true);
                } else {
                    GetWidgetsById(id, 'Right' + k, chartdataleft[k]);
                }
                $("#drildown" + id).hide();
                //$("#expandDrilplaceholder" + i).draggable();
                //}
            }

            for (var r = 0; r < chartdataleft.length; r++) {
                var id = 'expandDrilplaceholder' + r;
                //$("#" + id).draggable({
                //    stack: "div",
                //    revert: function (event, ui) {
                //        return !event;
                //    }
                //});
                $("#" + id).droppable({
                    greedy: true,
                    accept: acceptStr,

                    drop: function (event, ui) {
                        checkDragg = 1;



                        var dragdiv = ui.draggable.prop('id');
                        var dragdId = $("#" + dragdiv).children('div').prop('id');

                        var droppableDiv = $(this).prop("id");

                        var DropId = $("#" + droppableDiv).children('div').prop('id');



                        var mainArr = newModifiedWidgetData();

                        dragdId = parseInt(dragdId);

                        DropId = parseInt(DropId);
                        var dragsource = _.where(mainArr, { WidgetId: dragdId });

                        var dropsource = _.where(mainArr, { WidgetId: DropId })



                        var listArr = widgetlist();
                        if (dragsource == '') {

                            var newdragsource = _.where(listArr, { WidgetId: dragdId });

                            if (newdragsource != '') {
                                var dragIndex = listArr.indexOf(newdragsource[0])
                                var dropIndex = mainArr.indexOf(dropsource[0])

                                listArr = _.reject(listArr, function (el) { return el.WidgetId === dragdId; });
                                widgetlist(listArr);

                                mainArr.splice(dropIndex, 0, newdragsource[0]);
                            } else {


                            }



                        } else {

                            var dragIndex = mainArr.indexOf(dragsource[0])
                            var dropIndex = mainArr.indexOf(dropsource[0])

                            mainArr = _.reject(mainArr, function (el) { return el.WidgetId === dragdId; });
                            mainArr.splice(dropIndex, 0, dragsource[0]);
                        }

                        newModifiedWidgetData([]);
                        newModifiedWidgetData(mainArr);
                        widgetData([]);
                        widgetDataRight([])

                        dragdroponChart(jsonWidget, modifiedWidgetData, widgetData, widgetlist, widgetDataRight,
                            widgetbackuplist, widgetDataRightbackup, widgetDatabackup, cunstWidgetData, modifiedStaticDataWidget, UsersStandardWidgets, newModifiedWidgetData, CounterWidgetlist, 1);


                    }
                });
            }


            if (setWidgetFlag == 1) {
                var StaticDataWidgetArr = modifiedStaticDataWidget();
                getparamforSetWidget(widgetData, widgetDataRight, StaticDataWidgetArr, 1);
            }
            checkDragg = 0;
        }






        function setUserWidget(setUserWidgetsReq) {

            function callbackFunction() {
            }
            var params = '{"token":"' + TOKEN() + '","setUserWidgetsReq":' + JSON.stringify(setUserWidgetsReq) + '}';
            ajaxJsonCall('SetUserWidgets', params, callbackFunction, true, 'POST', true);
        }

        function getparamforSetWidget(widgetData, widgetDataRight, StaticDataWidgetArr, flage) {

            var leftArr = widgetData();
            var rightArr = widgetDataRight();
            var counterArr = StaticDataWidgetArr;

            if (flage == 0) {
                ///for counter widget
                var setUserWidgetsReq = new Object();
                setUserWidgetsReq.WidgetType = AppConstants.get('COUNTER');//'Counter';
                var Widgets = new Array();

                for (var c = 0; c < counterArr.length; c++) {
                    if (c <= 3) {
                        var UserWidgetSequence1 = new Object();
                        UserWidgetSequence1.WidgetId = counterArr[c].WidgetId;
                        UserWidgetSequence1.WidgetSequence = c;


                        var source = _.where(Widgets, { WidgetId: counterArr[c].WidgetId });

                        if (source == '') {
                            Widgets.push(UserWidgetSequence1);

                        } else {

                        }

                    }
                }
                userwidgetlength = Widgets.length - 1;
                setUserWidgetsReq.Widgets = Widgets;
                setUserWidget(setUserWidgetsReq);
                ///end countr widget
            } else {
                ///for Standard widget;
                var test = new Array();
                var setUserWidgetsReq = new Object();

                setUserWidgetsReq.WidgetType = AppConstants.get('STANDARD');//'Standard';
                var Widgets = new Array();
                var l = 0;
                for (var i = 0; i < leftArr.length; i++) {
                    l = i * 2
                    test.push("left" + l);
                    var UserWidgetSequence1 = new Object();
                    UserWidgetSequence1.WidgetId = leftArr[i].WidgetId;
                    UserWidgetSequence1.WidgetSequence = l;
                    var source = _.where(Widgets, { WidgetId: leftArr[i].WidgetId });
                    if (source == '') {
                        Widgets.push(UserWidgetSequence1);

                    } else {

                    }

                }

                var testRight = new Array();

                var r = 0;
                for (var i = 0; i < rightArr.length; i++) {
                    r = i * 2 + 1;
                    testRight.push("Right" + r);
                    var UserWidgetSequence1 = new Object();
                    UserWidgetSequence1.WidgetId = rightArr[i].WidgetId;
                    UserWidgetSequence1.WidgetSequence = r;

                    var source = _.where(Widgets, { WidgetId: rightArr[i].WidgetId });
                    if (source == '') {
                        Widgets.push(UserWidgetSequence1);

                    } else {
                    }

                }

                setUserWidgetsReq.Widgets = Widgets;
                setUserWidget(setUserWidgetsReq);
                ////end standared widget
            }





        }


        function getjsonData(jsonWidget) {
            $.ajax({
                type: "GET",
                url: "assets/json/DyanamicDashbrod(new).json",
                dataType: 'json',
                async: false,
                success: function (data) {
                    jsonWidget(data.DashboardWidgets);
                },
                error: function (jqXHR, status, error) {
                    if (jqXHR != null) {
                        ajaxErrorHandler(jqXHR, status, error);
                        if (jqXHR.status != 401) {
                            widgetData(null);
                        }
                    } else {
                        widgetData(null);
                    }
                }
            });

        }


        function getwidgetDataAfterAdd(widgetData, widgetlist, widgetDataRight, widgetbackuplist, widgetDataRightbackup, widgetDatabackup) {

            var chartdataRight = widgetDataRight();


            for (var j = 0; j < chartdataRight.length; j++) {
                var RightID = 'placeholderRight' + j;
                GetWidgetsById(RightID, j, chartdataRight[j]);
            }
            var chartdataleft = widgetData();

            for (var k = 0; k < chartdataleft.length; k++) {
                var id = 'placeholder' + k;
                GetWidgetsById(id, 'Right' + k, chartdataleft[k]);
            }
        }


        function getwidgetDataAfterDragnDrop(widgetData, widgetlist, widgetDataRight, widgetbackuplist, widgetDataRightbackup, widgetDatabackup, modifiedStaticDataWidget) {

            var ddd = modifiedStaticDataWidget();


            getparamforSetWidget(widgetData, widgetDataRight, modifiedStaticDataWidget, 1);

            var chartdataRight = widgetDataRight();
            widgetDataRightbackup = chartdataRight;



            for (var j = 0; j < chartdataRight.length; j++) {
                var RightID = 'placeholderRight' + j;
                GetWidgetsById(RightID, j, chartdataRight[j]);
            }
            var chartdataleft = widgetData();

            widgetDatabackup = chartdataleft;

            for (var k = 0; k < chartdataleft.length; k++) {
                var id = 'placeholder' + k;
                GetWidgetsById(id, 'Right' + k, chartdataleft[k]);
            }
        }


        // var docHeight = $('#sidebar').height() - 70 + 'px';
        //$("#mainChartPanel").css('height', conHeight);

        reloadScrollBars();

        seti18nResourceData(document, resourceStorage);
    };




    /////end view
    function removedashboardwidgetdata(data) {
        var removeid = '';
        for (var i = 0; i < dashboardWidgetData.length; i++) {
            if (dashboardWidgetData[i].Key == data.Identifier) {
                removeid = i;
            }
        }
        if (removeid != '') {
            dashboardWidgetData.splice(removeid, 1);
        }
    }
    function insertdashboardwidgetdata(data) {
        var isExist = false;
        for (var i = 0; i < dashboardWidgetData.length; i++) {
            if (dashboardWidgetData[i].Key == data.Key) {
                isExist = true;
            }
        }
        if (isExist == false) {
            dashboardWidgetData.push(data);
        }
    }
    function drilDownPieChart(id, index) {
        unloadScrollBars();
        $("body").removeClass("page-sidebar-minified");
        $(".collapsible").toggleClass("collapsible-mini");
        $("#backchart" + index).toggleClass('hide');
        checkDrilDown = 1;
        $("#expandpA" + index).addClass('hide');
        $("#colpA" + index).addClass('hide');
        $("#removepA" + index).addClass('hide');
        $("#backchart" + index).removeClass('hide');
        $("#expandDril" + id).toggleClass("panel-sm-expand");
        $(".overflow-strip").toggleClass("displayBlock");
        $(".dash-filter-area").toggleClass("displayBlock");
        var source =
        {
            datatype: "json",
            datafields: [
                { name: 'Name' },
                { name: 'count' }
            ],
            url: 'peicharsampledata.json'
        };
        var dataAdapt = new $.jqx.dataAdapter(source, { async: true, autoBind: true, loadError: function (xhr, status, error) { alert('Error loading "' + source.url + '" : ' + error); } });
        $.jqx._jqxChart.prototype.colorSchemes.push({ name: 'VHQScheme', colors: ['#ffff00', '#ff0000', '#ccff00', '#00ffff', '#aaaaaa'] });
        // prepare jqxChart settings

        var settings = {
            title: "Alert DrilDown Chart",
            description: "(Vhq Media)",
            enableAnimations: true,
            showLegend: false,
            showBorderLine: true,
            legendLayout: { left: 350, top: 10, width: 300, height: 200, flow: 'vertical' },
            padding: { left: 5, top: 5, right: 5, bottom: 5 },
            titlePadding: { left: 0, top: 0, right: 0, bottom: 10 },
            source: dataAdapt,
            colorScheme: 'VHQScheme',
            seriesGroups:
                [
                    {
                        type: 'pie',
                        showLabels: true,
                        series:
                            [
                                {
                                    dataField: 'count',
                                    displayText: 'Name',
                                    labelRadius: 100,
                                    initialAngle: 15,
                                    radius: 80,
                                    centerOffset: 3,
                                    formatFunction: function (value) {
                                        if (isNaN(value))
                                            return value;
                                        return parseFloat(value) + '%';
                                    },
                                }
                            ]
                    }
                ]
        };
        // setup the chart
        $("#drildown" + id).show();
        $("#" + id).hide();
        $("#drildown" + id).jqxChart(settings);
    }

    function barchart(id, index, widgetData, Data, blankCheck) {
        if (widgetData.Identifier == 'SW_DEVICE_BY_MEDIA') {
            var othersindex = 0;
            var othersobj = {};
            for (var i = 0; i < Data.length; i++) {
                if (Data[i].Name == 'Others') {
                    othersindex = i;
                    othersobj = Data[i];
                }
            }
            Data.splice(othersindex, 1);
            if (othersobj != undefined) {
                Data.push(othersobj);
            }
        }
        //alert(JSON.stringify(Data));
        //for (var k = 0; k < Data.length; k++) {
        //    if (Data[k].DeviceCount == "34" || Data[k].DeviceCount == 34) {
        //        Data[k].DeviceCount = 22222;
        //    }
        //    if (Data[k].DeviceCount == "31" || Data[k].DeviceCount == 31) {
        //        Data[k].DeviceCount = 1;
        //    }
        //}

        //alert(JSON.stringify(Data));
        //for (var k = 0; k < Data.length; k++) {
        //    if (Data[k].DeviceCount == "34" || Data[k].DeviceCount == 34) {
        //        Data[k].DeviceCount = 22222;
        //    }
        //    if (Data[k].DeviceCount == "31" || Data[k].DeviceCount == 31) {
        //        Data[k].DeviceCount = 1;
        //    }
        //}

        //alert('data==' + JSON.stringify(widgetData.Identifier));
        //if (widgetData.Identifier == 'SW_REPORT_CHART') {
        //    for (var e = 0; e < Data.length; e++) {
        //        if (e == 0 || e == 4) {
        //            Data[e]["DeviceCount"] = 1;
        //            Data[e]["Count"] = 1;
        //        } else {
        //            Data[e]["DeviceCount"] = 3;
        //            Data[e]["Count"] =3;
        //        }
        //    }
        //    //alert('data==' + JSON.stringify(Data));
        //    blankCheck = false;
        //}


        var highest = getHighest(Data);

        var setValueaxis = new Object();



        var maxCount = 0;
        var realcount = 0;
        if (highest.Count) {
            if (highest.Count < 6) {
                maxCount = 8;
            } else {
                maxCount = highest.Count;
                realcount = highest.Count;
            }
        } else if (highest.DeviceCount) {
            if (highest.DeviceCount < 6) {
                maxCount = 8;
            } else {
                maxCount = highest.DeviceCount;
                realcount = highest.DeviceCount;
            }
        }
        if (blankCheck) {

            setValueaxis = {
                flip: false,
                displayValueAxis: true,
                minValue: 0,
                maxValue: 100,
                unitInterval: 10,
                description: widgetData.WidgetSourceData.chart.description,
                showGridLines: false,
                axisSize: 'auto',
                formatFunction: function (value, index, columnIndex) {

                    return Math.round(value);
                },
            };
            $("#expandpA" + index).css("display", "none");
            $("#" + id).next('div').next('div').removeClass('hide');
            $("#" + id).next('div').next('div').addClass('show');
        } else {
            //if (widgetData.Identifier == 'SW_REPORT_CHART') {
            //    alert('highest.Count     ' + highest.Count);
            //}
            //if (highest.Count < 4) {
            //    setValueaxis = {
            //        flip: false,
            //        displayValueAxis: true,
            //        minValue: 0,
            //        //maxValue: maxCount,
            //        unitInterval: 1,
            //        description: widgetData.WidgetSourceData.chart.description,
            //        showGridLines: false
            //    };
            //} else {
            //alert('in' + widgetData.Identifier);

            if (realcount > 6) {
                var scalebase = 2;;
                if (realcount > 8000) {
                    scalebase = 5;
                }
                setValueaxis = {
                    flip: false,
                    displayValueAxis: true,
                    logarithmicScale: true,
                    logarithmicScaleBase: scalebase,
                    //unitInterval: 0.5,
                    minValue: 0.5,
                    formatFunction: function (value, index, columnIndex) {
                        return Math.floor(value);
                    },
                    description: widgetData.WidgetSourceData.chart.description,
                    showGridLines: false
                };
            } else {
                setValueaxis = {
                    flip: false,
                    displayValueAxis: true,
                    axisSize: 'auto',
                    maxValue: maxCount,
                    unitInterval: 1,
                    minValue: 0,
                    description: widgetData.WidgetSourceData.chart.description,
                    showGridLines: false
                };

            }
            //}

            $("#" + id).next('div').next('div').addClass('hide');
            $("#" + id).next('div').next('div').removeClass('show');
        }

        var reportsetflag = widgetData.Identifier;

        var date = moment().tz(name).format('MM/DD/YYYY');
        var minutes = "59";
        var hours = "23";
        var dateTo = getlocaldateForDashboard('to', date, hours, minutes);
        // var dateTo = moment().format('YYYY-MM-DD');
        //  dateTo = dateTo + 'T00:00:00+05:30';
        var date = moment().subtract('days', 6).format('MM/DD/YYYY');
        var minutes = "00";
        var hours = "24";
        var dateFrom = getlocaldateForDashboard('from', date, hours, minutes);

        // var dateFrom = moment().subtract('days', 6);

        //    dateFrom = moment(dateFrom).format('YYYY-MM-DD');
        //  dateFrom = dateFrom + 'T16:53:53+05:30';
        var catAxis = new Object();

        if (reportsetflag == 'SW_REPORT_CHART') {
            catAxis = {

                dataField: widgetData.WidgetSourceData.chart.dataFeilds.XField,//'Name',
                showGridLines: false,
                flip: false,
                displayText: '',
                formatFunction: function (value, itemIndex, serie, group, xAxisValue, xAxis) {
                    var value1 = 0;
                    if (Data[itemIndex].DeviceCount != undefined) {
                        value1 = Data[itemIndex].DeviceCount;
                    }

                    return value;
                }
            }
            if (widgetData.widgetLabels().length == 0) {
                var obj = {};
                obj.Name = widgetData.WidgetName;
                var isCount = false;
                for (var i = 0; i < Data.length; i++) {
                    if (Data[i].DeviceCount != undefined) {
                        isCount = true;
                    }
                }
                if (isCount == false) {
                    obj.fillColor = '#FFFFFF';
                } else {
                    obj.fillColor = '#00aeef';
                }
                widgetData.widgetLabels.push(obj);
            }


        } else {
            catAxis = {

                dataField: widgetData.WidgetSourceData.chart.dataFeilds.XField,//'Name',
                showGridLines: false,
                flip: false,

                displayText: '',
                formatFunction: function (value, itemIndex, serie, group, xAxisValue, xAxis) {
                    var value1 = 0;
                    if (Data.length > 0 && Data[itemIndex].Count != undefined) {
                        value1 = Data[itemIndex].Count;
                    }
                    return ' ';
                }
            }
            if (widgetData.widgetLabels().length == 0) {
                for (var i = 0; i < Data.length; i++) {
                    if (Data[i] && Data[i].Name != undefined) {
                        var obj = {};
                        obj.Name = Data[i].Name;
                        if (Data[i].Name == "Models") {
                            obj.fillColor = "#FFFFFF";
                        } else if (Data[i].Name == "Media") {
                            obj.fillColor = "#FFFFFF";
                        } else {
                            obj.fillColor = vfChartBandColors[i];
                        }

                        widgetData.widgetLabels.push(obj);
                    }
                }
            }
        }

        var settings = {
            title: false,
            description: false,
            showLegend: false,
            enableAnimations: true,

            borderLineColor: 'white',
            source: Data,
            toolTipShowDelay: 0,
            toolTipHideDelay: 3000,
            categoryAxis: catAxis,
            colorScheme: 'scheme01',
            seriesGroups:
                [
                    {
                        type: 'column',
                        orientation: 'vertical',
                        toolTipFormatSettings: { thousandsSeparator: ',' },
                        useGradientColors: false,
                        valueAxis: setValueaxis,
                        toolTipFormatFunction: function (value, itemIndex, serie, group, xAxisValue, xAxis) {

                            var formattedTooltip = "";
                            if (reportsetflag == 'SW_REPORT_CHART') {
                                formattedTooltip = "<div style='width:110px;height:auto;cursor:default;'><table ><tr ><td style='text-align:left'><b>Reporting Terminal Count</b></td></tr><tr ><td style='text-align:left'>" + $.jqx.dataFormat.formatdate(xAxisValue, 'DD MMM') + "</td></tr><tr><td style='text-align:left;padding-bottom:5px'><i>total</i>: " + value + "</td></tr></table></div>";
                            } else {
                                formattedTooltip = "<div style='width:110px;height:auto;cursor:default;'><table ><tr ><td style='text-align:left'><b>" + xAxisValue + "</b></td></tr><tr><td style='text-align:left;padding-bottom:5px'><i>total</i>: " + value + "</td></tr></table></div>";
                            }
                            return formattedTooltip;
                        },
                        series: [
                            {
                                dataField: widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField,
                                displayText: '',
                                //labels: {
                                //    visible: true,
                                //    verticalAlignment: 'top',
                                //    offset: { x: 0, y: -20 }
                                //},
                                //formatFunction: function (value) {
                                //    return value;
                                //},
                                colorFunction: function (value, itemIndex, serie, group) {
                                    if (reportsetflag == 'SW_REPORT_CHART') {
                                        return '#00aeef';
                                    } else {
                                        if (isNaN(itemIndex) == false) {
                                            return vfChartBandColors[itemIndex];
                                        }
                                    }
                                }

                            }

                        ]
                    }
                ],

        };

        $("#" + id).show();
        $("#drildown" + id).hide();

        $("#" + id).jqxChart(settings);
        // get the series groups of an existing chart
        var groups = $("#" + id).jqxChart('seriesGroups');
        // add a click event handler function to the 1st group    
        if (groups.length > 0) {

            groups[0].mouseover = function (e) {
                //alert(JSON.stringify(chartIds));
                if (widgetData.WidgetSourceData.chart.drill == "true") {
                    if (checkDril != id) {
                        $('rect').css('cursor', 'pointer');
                    }
                } else {
                    $('rect').css('cursor', 'default');
                }

                for (var i = 0; i < chartIds.length; i++) {
                    if (id != chartIds[i]) {
                        var tempId = "#" + chartIds[i];
                        //alert(tempId)
                        var chartInstance = $(tempId).jqxChart('getInstance');
                        if (chartInstance != undefined) {
                            chartInstance.hideToolTip(
                                1000  /* hide after 1 second, optional parameter */
                            );
                        }

                    }
                }

                //var chartInstance = $('#placeholder0').jqxChart('getInstance');
                //chartInstance.hideToolTip(
                //              000  /* hide after 1 second, optional parameter */
                //      );

            }

            groups[0].mouseout = function (e) {


                $('rect').css('cursor', 'default');
                var chartInstance = $("#" + id).jqxChart('getInstance');

                if (chartInstance != undefined) {

                    chartInstance.hideToolTip(
                        1000  /* hide after 1 second, optional parameter */
                    );
                }

            }

            groups[0].click = function (e) {
                hideWidgetPanel();
                var chartInstance = $("#" + id).jqxChart('getInstance');
                ////alert(chartInstance.showToolTips);

                //setTimeout(function () {
                if (chartInstance != undefined) {
                    chartInstance.hideToolTip(
                        1000 /* hide after 1 second, optional parameter */
                    );
                }
                //}, 500);


                var xfield = widgetData.WidgetSourceData.chart.dataFeilds.XField;
                var dateObj = new Object();
                dateObj.from = Data[e.elementIndex][xfield];
                dateObj.to = Data[e.elementIndex][xfield];
                if (widgetData.WidgetSourceData.chart.drill == "true") {
                    if (checkDril != id) {

                        checkDril = id;
                        GetWidgetsByIdForDrillDown(id, index, widgetData, dateObj);
                    }
                } else {
                }

            }
            // update the group
            $("#" + id).jqxChart({ seriesGroups: groups });
        }

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


    function donutChart(id, index, widgetData, Data, blankCheck) {

        if (widgetData.widgetLabels().length == 0) {
            for (var i = 0; i < Data.length; i++) {
                if (Data[i].Name != undefined) {
                    var obj = {};
                    obj.Name = Data[i].Name;
                    if (Data[i].Name == "Models") {
                        obj.fillColor = "#FFFFFF";
                    } else {
                        if (VfModelColors[0][Data[i].Name] == undefined) {
                            obj.fillColor = vfChartBandColors[50 + i];
                        } else {
                            obj.fillColor = VfModelColors[0][Data[i].Name];
                        }
                    }

                    widgetData.widgetLabels.push(obj);
                }
            }
        }
        var windowheight = $(window).height();

        var radius;
        var leftpadding;
        var offsetx;
        var innerRadius;
        if (isExpandActive == true) {
            if (windowheight > 960) {
                radius = 190;
                leftpadding = 0;
                innerRadius = 140;
            } else if (windowheight > 700) {
                radius = 190;
                leftpadding = 0;
                innerRadius = 140;
            }
            else {
                radius = 120;
                leftpadding = 0;
                innerRadius = 85
            }

        } else {
            if (windowheight > 960) {
                leftpadding = 40;
                radius = 105;
                innerRadius = 65
            } else if (windowheight > 700) {
                leftpadding = 40;
                offsetx = 220;
                radius = 105;
                innerRadius = 65
            }
            else {
                offsetx = 200;
                leftpadding = 0;
                radius = 105;
                innerRadius = 65
            }
        }
        var settings = {
            title: false,
            description: false,
            showLegend: false,
            enableAnimations: true,
            borderLineColor: '#ddd',
            showBorderLine: true,
            source: Data,
            toolTipShowDelay: 0,
            toolTipHideDelay: 3000,
            padding: { left: leftpadding, top: 5, right: 5, bottom: 5 },
            colorScheme: 'scheme02',
            seriesGroups:
                [
                    {
                        type: 'donut',
                        offsetX: offsetx,
                        orientation: 'vertical',
                        toolTipFormatSettings: { thousandsSeparator: ',' },
                        useGradientColors: false,
                        toolTipFormatFunction: function (value, itemIndex, serie, group, xAxisValue, xAxis) {
                            var dataItem = Data[itemIndex];
                            var tot = 0;

                            for (var i = 0; i < Data.length; i++) {
                                tot = tot + Data[i].Count;
                            }
                            if (!value)
                                value = 0;
                            var percentage = ((value / tot) * 100).toFixed(2) + "%";
                            //return "<span>"+dataItem.Name + "</span> </br>" + value;  
                            if (((value / tot) * 100).toFixed(2) == "NaN") { percentage = "0.00%"; }
                            var formattedTooltip = "<div style='text-align:center;width:50px;margin-bottom:2px;cursor:default;'>" +
                                "<b>" + dataItem.Name + "</b></br>" + value + "(" + percentage + ")" +
                                "</div>";

                            return formattedTooltip;

                        },
                        series: [
                            {
                                dataField: widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField,
                                displayText: '',
                                labelRadius: 120,
                                initialAngle: 15,
                                radius: radius,
                                innerRadius: innerRadius,
                                centerOffset: 0,
                                formatSettings: { sufix: '%', decimalPlaces: 1 },
                                colorFunction: function (value, itemIndex, serie, group) {

                                    if (isNaN(itemIndex) == false) {
                                        if (VfModelColors[0][Data[itemIndex].Name] == undefined) {
                                            return vfChartBandColors[50 + itemIndex];
                                        } else {
                                            return VfModelColors[0][Data[itemIndex].Name];;
                                        }
                                    }

                                }

                            }

                        ]
                    }
                ],

        };

        $("#" + id).show();
        $("#drildown" + id).hide();

        $("#" + id).jqxChart(settings);
        // get the series groups of an existing chart
        var groups = $("#" + id).jqxChart('seriesGroups');
        // add a click event handler function to the 1st group    
        if (groups.length > 0) {

            groups[0].mouseover = function (e) {
                for (var i = 0; i < chartIds.length; i++) {
                    if (id != chartIds[i]) {
                        var tempId = "#" + chartIds[i];
                        //alert(tempId)
                        var chartInstance = $(tempId).jqxChart('getInstance');
                        if (chartInstance != undefined) {
                            chartInstance.hideToolTip(
                                1000  /* hide after 1 second, optional parameter */
                            );
                        }

                    }
                }

            }

            groups[0].mouseout = function (e) {

                var chartInstance = $("#" + id).jqxChart('getInstance');

                if (chartInstance != undefined) {

                    chartInstance.hideToolTip(
                        1000  /* hide after 1 second, optional parameter */
                    );
                }

            }

            groups[0].click = function (e) {
                hideWidgetPanel();
                var chartInstance = $("#" + id).jqxChart('getInstance');

                if (chartInstance != undefined) {
                    chartInstance.hideToolTip(
                        1000 /* hide after 1 second, optional parameter */
                    );
                }

                var xfield = widgetData.WidgetSourceData.chart.dataFeilds.XField;
                var dateObj = new Object();
                dateObj.from = Data[e.elementIndex][xfield];
                dateObj.to = Data[e.elementIndex][xfield];
                if (widgetData.WidgetSourceData.chart.drill == "true") {
                    if (checkDril != id) {

                        checkDril = id;
                        GetWidgetsByIdForDrillDown(id, index, widgetData, dateObj);
                    }
                } else {
                }

            }
            // update the group
            if (Data.length > 0) {
                $("#" + id).jqxChart({ seriesGroups: groups });
            } else {

                $("#" + id).jqxChart({ title: 'No data found' });
                $("#" + id).jqxChart({ padding: { left: 0, top: 80, right: 0, bottom: 0 } });
                $("#" + id).jqxChart({ description: '' });
            }

        }

    }
    function stackChart(id, index, widgetData, data, blankchek) {
        //if (widgetData.Identifier == "SW_DOWNLOAD_CHART") {
        //    for (var i = 0; i < data.length; i++) {
        //        data[i].DownloadSuccessfulCount =3;
        //        data[i].InstallSuccessfulCount = 3;
        //        data[i].ContentReplacedCount =4;
        //        data[i].InstallFailedCount = 0;
        //        data[i].ContentReplaceFailedCount = 0;
        //        data[i].DownloadFailedCount = 0;
        //        data[i].DownloadStartedCount =3;
        //        data[i].InstallPostponedCount =0;
        //        data[i].ScheduleSentCount = 0;
        //        data[i].ScheduledCount = 2;
        //        data[i].FailedCount = 20;
        //    }
        //}


        widgetDatatooltipclick = widgetData;
        datafortooltipclick = data;

        //data[6].ScheduledCount = 3.5;

        //alert(JSON.stringify(data))
        var countAarry = [];
        if (widgetData.WidgetName == i18n.t('SW_DOWNLOAD_CHART', { lng: lang })) {
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
                if (data[i].FailedCount != undefined) {
                    totalCount = totalCount + data[i].FailedCount;
                }
                if (data[i].CancelledCount != undefined) {
                    totalCount = totalCount + data[i].CancelledCount;
                }
                var obj = new Object();
                obj.Count = totalCount;
                countAarry.push(obj);
            }

        } else if (widgetData.WidgetName == i18n.t('SW_DONWLOAD_STATUS_CHART', { lng: lang })) {
            for (i = 0; i < data.length; i++) {
                var obj = new Object();
                if (data[i].SuccessfulCount == undefined) {
                    data[i].SuccessfulCount = 0;
                }
                if (data[i].FailedCount == undefined) {
                    data[i].FailedCount = 0;
                }
                totalCount = data[i].SuccessfulCount + data[i].FailedCount;
                obj.Count = totalCount;
                countAarry.push(obj);

            }
        }

        var max = getHighest(countAarry);
        var maxCount = max.Count;
        checkDril = '';

        var setValueAxis = new Object();
        var Yfields;
        if (blankchek) {
            setValueAxis = {
                flip: false,
                displayValueAxis: true,
                minValue: 0,
                maxValue: 100,
                unitInterval: 10,
                description: widgetData.WidgetSourceData.chart.description,
                formatFunction: function (value, index, columnIndex) {

                    return Math.round(value);
                },
                showGridLines: false,
                axisSize: 'auto'
            };
            $("#expandpA" + index).css("display", "none");
            $("#" + id).next('div').next('div').removeClass('hide');
            $("#" + id).next('div').next('div').addClass('show');
            var xFieldLegends = new Array();
            for (var j = 0; j < widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField.length; j++) {
                xFieldLegends.push(widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField[j]);
            }
            Yfields = getYfieldArr(xFieldLegends);
            if (widgetData.widgetLabels().length == 0) {
                var obj = {};
                obj.Name = "Status";
                obj.fillColor = '#FFFFFF';
                widgetData.widgetLabels.push(obj);
            }
        } else {
            if (maxCount > 6) {
                var scalebase = 2;;
                if (maxCount > 8000) {
                    scalebase = 5;
                }
                setValueAxis = {
                    displayValueAxis: true,
                    showGridLines: false,
                    logarithmicScale: true,
                    logarithmicScaleBase: scalebase,
                    //unitInterval: 0.5,
                    minValue: 0.5,
                    formatFunction: function (value, index, columnIndex) {
                        return Math.floor(value);
                    },
                    description: widgetData.WidgetSourceData.chart.description,
                    axisSize: 'auto'
                };

            } else {
                setValueAxis = {
                    displayValueAxis: true,
                    showGridLines: false,
                    minValue: 0,
                    maxValue: 8,
                    unitInterval: 1,
                    description: widgetData.WidgetSourceData.chart.description,
                    axisSize: 'auto'
                };

            }
            $("#" + id).next('div').next('div').addClass('hide');
            $("#" + id).next('div').next('div').removeClass('show');
            var xFieldLegends = new Array();
            for (var j = 0; j < widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField.length; j++) {
                var isExist = false;
                for (var k = 0; k < data.length; k++) {
                    if (data[k][widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField[j].fieldName] == undefined || data[k][widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField[j].fieldName] == 0) {
                        isExist = false;
                    }
                    else {
                        isExist = true;
                        break;
                    }
                }

                if (isExist)
                    xFieldLegends.push(widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField[j]);
            }
            Yfields = getYfieldArr(xFieldLegends);
            widgetData.widgetLabels([]);
            if (widgetData.widgetLabels().length == 0) {
                for (var i = 0; i < Yfields.length; i++) {
                    if (Yfields[i].displayText != undefined) {
                        var obj = {};
                        obj.Name = Yfields[i].displayText;
                        obj.fillColor = Yfields[i].fillColor;
                        widgetData.widgetLabels.push(obj);
                    }
                }
            }
        }




        var date = moment().tz(name).format('MM/DD/YYYY');
        var minutes = "59";
        var hours = "23";
        var dateTo = getlocaldateForDashboard('to', date, hours, minutes);

        //  var dateTo = moment().format('YYYY-MM-DD');
        //  dateTo = dateTo + 'T00:00:00+05:30';
        //   var dateFrom = moment().subtract('days', 6);
        var date = moment().tz(name).subtract('days', 6).format('MM/DD/YYYY');
        var minutes = "00";
        var hours = "24";
        var dateFrom = getlocaldateForDashboard('from', date, hours, minutes);

        //  dateFrom = moment(dateFrom).format('YYYY-MM-DD');
        //   dateFrom = dateFrom + 'T16:53:53+05:30';


        //var jsonDateTo = jsonDateConversion(dateTo);
        //var jsonDateFrom = jsonDateConversion(dateFrom);

        var settings = {
            title: false,
            description: false,
            enableAnimations: true,
            showBorderLine: false,
            showLegend: false,
            //padding: { left: 5, top: 5, right: 5, bottom: 5 },
            //titlePadding: { left: 90, top: 0, right: 0, bottom: 10 },
            padding: { left: 20, top: 5, right: 20, bottom: 5 },
            titlePadding: { left: 90, top: 0, right: 0, bottom: 10 },
            toolTipShowDelay: 0,
            toolTipHideDelay: 3000,
            source: data,
            categoryAxis:
            {
                //text: 'Category Axis',
                //textRotationAngle: -75,
                //dataField: widgetData.WidgetSourceData.chart.dataFeilds.XField,
                //type: 'date',
                //baseUnit: 'day',
                //showTickMarks: true,
                //tickMarksInterval: 1,
                //minValue: dateFrom,//'2015-11-12',//jsonDateFrom,
                //maxValue: dateTo,//'2015-11-18',//jsonDateTo,
                //tickMarksColor: '#888888',
                //unitInterval: 1,
                //showGridLines: false,
                //gridLinesInterval: 1,
                //gridLinesColor: '#888888',
                //axisSize: 'auto',
                //formatFunction: function (value) {
                //    return $.jqx.dataFormat.formatdate(value, 'dd/MM');
                //}

                text: 'Category Axis',
                textRotationAngle: 0,
                dataField: widgetData.WidgetSourceData.chart.dataFeilds.XField,

                showTickMarks: true,
                tickMarksInterval: 1,

                tickMarksColor: '#888888',
                showGridLines: false,
                gridLinesInterval: 1,
                gridLinesColor: '#888888',
                axisSize: 'auto',
                formatFunction: function (value, itemIndex) {
                    //var getTotalData = 0;
                    //for (var k = 0; k < widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField.length; k++) {
                    //    var fieldname = widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField[k].fieldName;
                    //    if (data[itemIndex][fieldname] != undefined) {
                    //        getTotalData = getTotalData + data[itemIndex][fieldname];
                    //    }

                    //}
                    return value;
                }

            },
            colorScheme: 'scheme06',
            seriesGroups:
                [
                    {
                        type: 'stackedcolumn',
                        columnsGapPercent: 100,
                        seriesGapPercent: 5,
                        useGradientColors: false,
                        //labels: {
                        //    visible: true,
                        //    offset: { x: 0, y: -20 },
                        //    verticalAlignment: 'top'

                        //},
                        //formatFunction: function (value) {
                        //    if (value <= 0) {
                        //        return ' ';
                        //    } else {
                        //        return value;
                        //    }

                        //},
                        valueAxis: setValueAxis,
                        toolTipFormatFunction: function (value, itemIndex, serie, group, xAxisValue, xAxis) {
                            var date = new Date(xAxisValue);
                            var d = date.getDate();
                            var m = date.getMonth();
                            var getTotalData = 0;
                            var displayName = serie.displayText;
                            if (data[itemIndex].DownloadFailedCount != 0 && data[itemIndex].DownloadStartedCount == 0 && data[itemIndex].DownloadSuccessfulCount == 0 &&
                                data[itemIndex].InstallFailedCount == 0 && data[itemIndex].InstallPostponedCount == 0 && data[itemIndex].InstallSuccessfulCount == 0 &&
                                data[itemIndex].ScheduledCount == 0 && data[itemIndex].ScheduleSentCount == 0 && data[itemIndex].ScheduleConfirmedCount == 0 && data[itemIndex].CancelledCount == 0) {
                                displayName = "Download Failed";
                            }
                            for (var k = 0; k < widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField.length; k++) {
                                var fieldname = widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField[k].fieldName;
                                if (data[itemIndex][fieldname] != undefined) {
                                    getTotalData = getTotalData + data[itemIndex][fieldname];
                                }
                            }
                            if (!value)
                                value = 0;
                            var percentage = ((value / getTotalData) * 100).toFixed(2) + "%";

                            if (((value / getTotalData) * 100).toFixed(2) == "NaN") { percentage = "0.00%"; getTotalData = 0 }
                            var dynClass = "" + itemIndex + "" + serie.dataField;//index, id, data,elementIndex, xfield
                            tooltipfield = '"' + fieldname + '"';
                            tooltipid = '"' + id + '"';
                            var formattedTooltip = "<div class='" + dynClass + "' onclick='calldrilontooltip(" + index + "," + tooltipid + "," + itemIndex + "," + tooltipfield + ")' style='text-align:left;width:100px;cursor:default;border:1px solid'>" +
                                "<b>" + displayName + "</b></br>" +
                                $.jqx.dataFormat.formatdate(xAxisValue, 'DD MMM') + "</br>" +
                                value + " " + "(" + percentage + ")" + "</br>" +
                                "<i>total</i>:" + " " + getTotalData + "</br></br></br>" +
                                "</div>";
                            if (value == 0) {
                                return "";
                            } else {
                                return formattedTooltip;
                            }
                        },
                        series: Yfields,
                        //click:stackChartClick

                    }
                ]

        };
        $("#drildown" + id).hide();
        $("#" + id).show();
        $("#" + id).jqxChart(settings);

        // get the series groups of an existing chart
        var groups = $("#" + id).jqxChart('seriesGroups');
        // add a click event handler function to the 1st group    
        if (groups.length > 0) {

            groups[0].mouseover = function (e) {
                //alert(JSON.stringify(data[e.elementIndex]));
                //alert(JSON.stringify(e.serie.dataField));
                var formatedClass = "" + e.elementIndex + "" + e.serie.dataField;
                //alert($("#" + id).offset().top);
                //alert($('.' + formatedClass).parent('span').parent('#contentDiv').prop('outerHTML'));
                //$("#contentDiv").parent('div').css("display", "none");
                //setTimeout(function () {
                //    //alert('ontimeout');
                //    var newtop = $("#contentDiv").parent('div').css("top");

                //    if (newtop != undefined) {
                //        $("#contentDiv").parent('div').css("display", "block");
                //        newtop = parseInt(newtop) - 30;
                //        //alert('==' + newtop);
                //    } else {
                //        $("#contentDiv").parent('div').css("display", "block");
                //        newtop = 150;
                //    }

                //    // $("#contentDiv").parent('div').css("top", newtop + "px");
                //    $('.' + formatedClass).parent('span').parent('#contentDiv').parent('div').css("top", "293px");

                //}, 400);

                if (widgetData.WidgetSourceData.chart.drill == "true") {
                    if (checkDril != id) {
                        $('rect').css('cursor', 'pointer');
                    }
                } else {
                    $('rect').css('cursor', 'default');
                }
                for (var i = 0; i < chartIds.length; i++) {
                    if (id != chartIds[i]) {
                        var tempId = "#" + chartIds[i];
                        var chartInstance = $(tempId).jqxChart('getInstance');
                        if (chartInstance != undefined) {
                            chartInstance.hideToolTip(
                                1000  /* hide after 1 second, optional parameter */
                            );
                        }
                    }
                }


            }

            groups[0].mouseleave = function (e) {
                $('rect').css('cursor', 'default');
                var chartInstance = $("#" + id).jqxChart('getInstance');
                if (chartInstance != undefined) {
                    chartInstance.hideToolTip(
                        1000  /* hide after 1 second, optional parameter */
                    );
                }
            }
            groups[0].click = function (e) {

                hideWidgetPanel();
                openDrillWidget = widgetData.Identifier;
                var xfield = widgetData.WidgetSourceData.chart.dataFeilds.XField;
                $("#expandDrilplaceholderRight" + index).css("top", "20px");
                valuedate = data[e.elementIndex][xfield];

                if (index.lastIndexOf == undefined || index.lastIndexOf("Right") == -1) {
                    $('#legendElementRight' + index).css("display", "none");
                    $('#showHintRight' + index).css("display", "block");
                } else {
                    var val = index.substring(index.lastIndexOf("Right") + 5, index.length);
                    $('#legendElement' + val).css("display", "none");
                    $('#showHint' + val).css("display", "block");
                }


                var dayArr = valuedate.split(' ');
                var month = new Date(Date.parse(dayArr[1] + " 1, 2016")).getMonth() + 1;
                var day = dayArr[0];

                var dateObj = new Object();
                var check = moment();
                var year = check.format('YYYY');

                // var tdate = moment(year + '/' + month + '/' + day).format('YYYY-MM-DD');

                var date = moment(year + '/' + month + '/' + day).format('MM/DD/YYYY');
                var minutes = "59";
                var hours = "23";
                var tdate = getlocaldateForDashboard('to', date, hours, minutes);

                var date = moment(tdate).tz(name).subtract('days', 1).format('MM/DD/YYYY');
                var minutes = "00";
                var hours = "24";

                fdate = getlocaldateForDashboard('from', date, hours, minutes);
                fdate = fdate;
                peiDate = tdate;
                tdate = tdate;

                dateObj.from = fdate;
                dateObj.to = tdate;

                isEscapeKeyEnable = true;


                //var dateObj = new Object();
                //var fdate = moment(data[e.elementIndex][xfield]).format('YYYY-MM-DD');
                //fdate = moment(fdate).subtract('days', 1);
                //fdate = moment(fdate).format('YYYY-MM-DD');

                //fdate = fdate + 'T18:30:00';
                //dateObj.from = fdate;
                //var tdate = moment(data[e.elementIndex][xfield]).format('YYYY-MM-DD');
                //peiDate = tdate;
                //tdate = tdate + 'T18:29:59.999';
                //dateObj.to = tdate;

                $("#drillDownHead").text(i18n.t(widgetData.Identifier, { lng: 'en' }))
                //dateObj.from = moment(data[e.elementIndex][xfield]).format('YYYY-MM-DD');
                //dateObj.to = moment(data[e.elementIndex][xfield]).format('YYYY-MM-DD');
                if (widgetData.WidgetSourceData.chart.drill == "true") {

                    if (checkDril != id) {

                        ////new for hide tooltip
                        var chartInstance = $("#" + id).jqxChart('getInstance');
                        if (chartInstance != undefined) {
                            chartInstance.hideToolTip(
                                1000  /* hide after 1 second, optional parameter */
                            );
                        }
                        ////

                        $("#loader1").show();
                        checkDril = id;
                        //GetWidgetsByIdForDrillDown(id, index, widgetData, dateObj);
                        dataforrefresh = [];
                        var obj = new Object();
                        obj.id = id;
                        obj.index = index;
                        obj.widgetData = widgetData;
                        obj.dateObj = dateObj;
                        dataforrefresh.push(obj);
                        GetWidgetsByIdForDrillDown(id, index, widgetData, dateObj);

                    }
                } else {

                }





            }
            // update the group
            $("#" + id).jqxChart({ seriesGroups: groups });

        }
        $("#loader1").hide();
    }




    function hideWidgetPanel() {
        if ($(".widget-panel").hasClass("wp-open")) {
            $(".widget-panel").toggleClass("wp-open");
            $("#btnWidgetToggle").prop('title', 'Show Widget Browser');
            $("#btnRefresh").css("margin-right", "56px");
            $("#widgetMenuIcon").removeClass('icon-angle-right');
            $("#widgetMenuIcon").addClass('icon-angle-left');
        }
    }


    function stackChartClick(e) {

    }

    function stackChartOld(id, index, widgetData, data) {

        for (var i = 0; i < data.length; i++) {
            //data[i].Date = '11/17';
            var localTime1 = moment(data[i].Date)
            localTime1 = moment(localTime1).format('DD/MM');
            data[i].Date = localTime1;
        }
        //if (data.length < 7) {
        //    for (var i = 0; i < 6; i++) {
        //        var obj = new Object();
        //        obj.ContentReplacedCount = 0;
        //        obj.Date = '2015-11-18';
        //        data.push(obj);
        //    }
        //}
        var Yfields = getYfieldArr(widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField)
        var settings = {
            title: false,
            description: false,
            enableAnimations: true,
            showBorderLine: false,
            //showLegend: true,
            //padding: { left: 5, top: 5, right: 5, bottom: 5 },
            //titlePadding: { left: 90, top: 0, right: 0, bottom: 10 },
            padding: { left: 20, top: 5, right: 20, bottom: 5 },
            titlePadding: { left: 90, top: 0, right: 0, bottom: 10 },
            toolTipShowDelay: 0,
            toolTipHideDelay: 3000,
            source: data,
            categoryAxis:
            {
                //text: 'Category Axis',
                textRotationAngle: 0,
                dataField: widgetData.WidgetSourceData.chart.dataFeilds.XField,//'Date',
                //type: 'date',
                //baseUnit: 'day',
                showTickMarks: true,
                tickMarksColor: '#888888',
                showGridLines: false,
                gridLinesColor: '#888888',
                //axisSize: 'auto',
                //formatFunction: function (value) {

                // return $.jqx.dataFormat.formatdate(value, 'dd/MM');
                //}
            },
            colorScheme: 'scheme06',
            seriesGroups:
                [
                    {
                        type: 'stackedcolumn',
                        seriesGapPercent: 5,
                        useGradientColors: false,
                        valueAxis:
                        {
                            displayValueAxis: true,
                            showGridLines: false,
                            description: widgetData.WidgetSourceData.chart.description,
                            axisSize: 'auto',
                        },
                        toolTipFormatFunction: function (value, itemIndex, serie, group, xAxisValue, xAxis) {
                            var date = new Date(xAxisValue);
                            var d = date.getDate();
                            var m = date.getMonth();
                            var getTotalData = 0;

                            for (var k = 0; k < widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField.length; k++) {
                                var fieldname = widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField[k].fieldName
                                getTotalData = getTotalData + data[itemIndex][fieldname];
                            }
                            if (!value)
                                value = 0;
                            var percentage = ((value / getTotalData) * 100).toFixed(2) + "%";
                            if (((value / getTotalData) * 100).toFixed(2) == "NaN") { percentage = "0.00%"; getTotalData = 0 }
                            var formattedTooltip = "<div style='text-align:left;cursor:default;width:110px'>" +
                                "<b>" + serie.displayText + "</b>" +
                                d + "/" + "0" + (m + 1) + "</br>" +
                                value + " " + "(" + percentage + ")" + "</br>" +
                                "<i>total</i>:" + " " + getTotalData + "</br></br></br>" +
                                "</div>";
                            return formattedTooltip;
                        },
                        series: Yfields

                    }
                ]
        };
        $("#drildown" + id).hide();
        $("#" + id).show();
        $("#" + id).jqxChart(settings);

        // get the series groups of an existing chart
        var groups = $("#" + id).jqxChart('seriesGroups');
        // add a click event handler function to the 1st group    
        if (groups.length > 0) {
            groups[0].click = function (e) {
                //var xfield = widgetData.WidgetSourceData.chart.dataFeilds.XField;
                //var dateObj = new Object();
                //var fdate = moment(data[e.elementIndex][xfield]).format('YYYY-MM-DD');
                //fdate = moment(fdate).subtract('days', 1);
                //fdate = moment(fdate).format('YYYY-MM-DD');

                //fdate = fdate + 'T18:30:00';
                //dateObj.from = fdate;
                //var tdate = moment(data[e.elementIndex][xfield]).format('YYYY-MM-DD');
                //peiDate = tdate;
                //tdate = tdate + 'T18:29:59.999';
                //dateObj.to = tdate;
                valuedate = data[e.elementIndex].Date;


                var dayArr = valuedate.split('/');


                var month = dayArr[1];
                var day = dayArr[0];

                var dateObj = new Object();
                var check = moment();
                var year = check.format('YYYY');

                //  var tdate = moment(year + '/' + month + '/' + day).format('YYYY-MM-DD');
                var date = moment(year + '/' + month + '/' + day).format('MM/DD/YYYY');
                var minutes = "59";
                var hours = "23";
                var tdate = getlocaldateForDashboard('to', date, hours, minutes);

                var date = moment(tdate).tz(name).subtract('days', 1).format('MM/DD/YYYY');
                var minutes = "00";
                var hours = "24";

                fdate = getlocaldateForDashboard('from', date, hours, minutes);

                // fdate = moment(tdate).tz(name).subtract('days', 1).format();
                fdate = fdate;
                peiDate = tdate;
                tdate = tdate;

                dateObj.from = fdate;
                dateObj.to = tdate;

                if (widgetData.WidgetSourceData.chart.drill == "true") {
                    if (checkDril != id) {
                        $("#loader1").show();
                        checkDril = id;
                        GetWidgetsByIdForDrillDown(id, index, widgetData, dateObj);
                    }
                } else {

                }




            }
            // update the group
            $("#" + id).jqxChart({ seriesGroups: groups });

        }
        $("#loader1").hide();
    }

    function stackChartClickHandler(e) {

    }


    function stackChartnew(id, index, widgetData, data) {

        for (var i = 0; i < data.length; i++) {
            data[i].Date = '11/16';
        }
        var sampleData = [
            { Day: '11/16', Running: 30, Swimming: 0, Cycling: 25 },
            { Day: '11/17', Running: 25, Swimming: 25, Cycling: 0 },
            //{ Day: 'Wednesday', Running: 30, Swimming: 0, Cycling: 25 },
            //{ Day: 'Thursday', Running: 35, Swimming: 25, Cycling: 45 },
            //{ Day: 'Friday', Running: 0, Swimming: 20, Cycling: 25 },
            //{ Day: 'Saturday', Running: 30, Swimming: 0, Cycling: 30 },
            //{ Day: 'Sunday', Running: 60, Swimming: 45, Cycling: 0 }
        ];
        // prepare jqxChart settings
        var settings = {
            title: "Fitness & exercise weekly scorecard",
            description: "Time spent in vigorous exercise by activity",
            enableAnimations: true,
            showLegend: true,
            padding: { left: 5, top: 5, right: 5, bottom: 5 },
            titlePadding: { left: 90, top: 0, right: 0, bottom: 10 },
            source: data,
            xAxis:
            {
                dataField: 'Date',
                //type: 'date',
                unitInterval: 1,
                axisSize: 'auto',
                tickMarks: {
                    visible: true,
                    interval: 1,
                    color: '#BCBCBC'
                },
                gridLines: {
                    visible: true,
                    interval: 1,
                    color: '#BCBCBC'
                },
                formatFunction: function (value) {

                    return $.jqx.dataFormat.formatdate(value, 'DD MMM');
                }
            },
            valueAxis:
            {
                unitInterval: 10,
                minValue: 0,
                maxValue: 20,
                title: { text: 'Time in minutes' },
                labels: { horizontalAlignment: 'right' },
                tickMarks: { color: '#BCBCBC' }
            },
            colorScheme: 'scheme06',
            seriesGroups:
                [
                    {
                        type: 'stackedcolumn',
                        columnsGapPercent: 50,
                        seriesGapPercent: 0,
                        series: [
                            { dataField: "ContentReplacedCount", "fieldText": "Content Replaced", "color": "#00aeef" },
                            { dataField: "ContentReplaceFailedCount", "fieldText": "Content Replace Failed", "color": "#00aeef" },
                            { dataField: "DownloadFailedCount", "fieldText": "Download Failed", "color": "#E30000" },
                            { dataField: "DownloadStartedCount", "fieldText": "Download Started", "color": "#008ED1" },
                            { dataField: "DownloadSuccessfulCount", "fieldText": "Download Successful", "color": "#FFFF00" },
                            { dataField: "InstallFailedCount", "fieldText": "Install Failed", "color": "#FFA500" },
                            { dataField: "InstallSuccessfulCount", "fieldText": "Install Successful", "color": "#00FF00" },
                            { dataField: "ScheduledCount", "fieldText": "Scheduled", "color": "#A600E8" },
                            { dataField: "ScheduleSentCount", "fieldText": "Schedule Sent", "color": "#F241C6" },
                            { dataField: "ScheduleConfirmedCount", "fieldText": "Schedule Confirmed", "color": "#159DC4" }
                        ]
                    }
                ]
        };
        $("#drildown" + id).hide();
        $("#" + id).show();
        $("#" + id).jqxChart(settings);

        // get the series groups of an existing chart
        var groups = $("#" + id).jqxChart('seriesGroups');
        // add a click event handler function to the 1st group    
        if (groups.length > 0) {
            groups[0].click = function (e) {
                var xfield = widgetData.WidgetSourceData.chart.dataFeilds.XField;
                var dateObj = new Object();
                var fdate = moment(data[e.elementIndex][xfield]).format('MM/DD/YYYY');

                var date = moment(fdate).tz(name).subtract('days', 1).format('MM/DD/YYYY');
                var minutes = "00";
                var hours = "24";
                fdate = getlocaldateForDashboard('from', date, hours, minutes);

                //fdate = moment(fdate).tz(name).subtract('days', 1);
                // fdate = moment(fdate).tz(name).format();

                fdate = fdate;
                dateObj.from = fdate;
                var tdate = moment(data[e.elementIndex][xfield]).tz(name).format();
                peiDate = tdate;
                tdate = tdate;
                dateObj.to = tdate;

                if (widgetData.WidgetSourceData.chart.drill == "true") {
                    if (checkDril != id) {

                        $("#loader1").show();
                        checkDril = id;
                        GetWidgetsByIdForDrillDown(id, index, widgetData, dateObj);
                    }
                } else {

                }

            }
            // update the group
            $("#" + id).jqxChart({ seriesGroups: groups });

        }
        $("#loader1").hide();
    }

    function getYfieldArr(data) {
        var arr = new Array();
        if (data != undefined) {
            for (var i = 0; i < data.length; i++) {
                var obj = new Object();
                obj.dataField = data[i].fieldName;
                obj.displayText = data[i].fieldText;
                obj.fillColor = data[i].color;
                arr.push(obj);
            }
        }
        return arr;
    }

    function pieChart(id, index, widgetData, Data, cArr, blanckcheck) {
        //alert("dril id is " + $("#drildown" + id).width() + "  " + $("#drildown" + id).height());
        var calreducewidth = parseInt((32 / 100) * $("#drildown" + id).width());

        var calcukatedpaddingforlegend = $("#drildown" + id).width() - calreducewidth;
        var calculatedtop = 130 - (10 * Data.length);

        //Low Alerts
        var windowheight = $(window).height();
        unloadScrollBars();
        var leftLegendPadding;
        if (windowheight > 900) {
            leftLegendPadding = 1000;
        } else if (windowheight > 700) {
            leftLegendPadding = 850;
        }
        else {
            leftLegendPadding = 700;
        }
        $("#loader1").hide();
        var schemeName = '';
        schemeName = widgetData.WidgetSourceData.chart.colorScheme;

        peidata = Data;

        var colorArr = new Array();

        var colorsArray = new Array();
        for (var i = 0; i < Data.length; i++) {
            switch (Data[i].Name.trim()) {
                case "DownloadSuccessfulCount":
                    colorsArray.push("#FFFF00");
                    break;
                case "InstallSuccessfulCount":
                    colorsArray.push("#00FF00");
                    break;
                case "DownloadFailedCount":
                    colorsArray.push("#E30000");
                    break;

            };
        };

        $.jqx._jqxChart.prototype.colorSchemes = [];
        $.jqx._jqxChart.prototype.colorSchemes.push({ name: schemeName, colors: cArr });

        if (blanckcheck) {

            $("#" + id).next('div').next('div').removeClass('hide');
            $("#" + id).next('div').next('div').addClass('show');
            $("#" + id).next('div').next('div').css("font-size", "16px")
            $("#" + id).next('div').next('div').css("margin-left", "252px")
        } else {
            $("#" + id).next('div').next('div').addClass('hide');
            $("#" + id).next('div').next('div').removeClass('show');
        }


        var settings = {
            title: false,
            description: false,
            enableAnimations: true,
            showLegend: true,
            showBorderLine: true,
            legendLayout: { left: calcukatedpaddingforlegend, top: calculatedtop, width: 300, height: 300, flow: 'vertical' },
            padding: { left: 5, top: 5, right: 5, bottom: 5 },
            titlePadding: { left: 10, top: 10, right: 10, bottom: 10 },
            source: Data,
            colorScheme: schemeName,
            seriesGroups:
                [
                    {
                        toolTipFormatFunction: function (value, itemIndex, serie, group, categoryValue, categoryAxis) {
                            var dataItem = Data[itemIndex];
                            var tot = 0;

                            for (var i = 0; i < Data.length; i++) {
                                tot = tot + Data[i].Count;
                            }
                            if (!value)
                                value = 0;
                            var percentage = ((value / tot) * 100).toFixed(2) + "%";
                            //return "<span>"+dataItem.Name + "</span> </br>" + value;  
                            if (((value / tot) * 100).toFixed(2) == "NaN") { percentage = "0.00%"; }
                            var formattedTooltip = "<div style='text-align:center;width:50px;margin-bottom:2px;cursor:default;'>" +
                                "" + percentage + "<br/> (" + value + ")" +
                                "</div>";
                            return formattedTooltip;
                        },
                        legendFormatFunction: function (value, itemIndex, serie, group, categoryValue, categoryAxis) {
                            var dataItem = Data[itemIndex];
                            var tot = 0;

                            for (var i = 0; i < Data.length; i++) {
                                tot = tot + Data[i].Count;
                            }
                            var percentage = ((dataItem.Count / tot) * 100).toFixed(2) + "%";
                            var formattedLegend = value + ": (" + dataItem.Count + ") " + percentage;
                            return formattedLegend;
                        },
                        type: 'pie',
                        showLabels: false,

                        series:
                            [
                                {
                                    dataField: widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField,//'count',
                                    displayText: widgetData.WidgetSourceData.chart.dataFeilds.XField,//'Name',
                                    //fillColor: color,//widgetData.WidgetSourceData.chart.dataFeilds.YFields.colorfield,
                                    labelRadius: 130,
                                    initialAngle: 15,
                                    useGradientColors: false,
                                    radius: 100,
                                    centerOffset: 6,
                                    formatFunction: function (value, itemIndex) {
                                        var tot = 0;

                                        for (var i = 0; i < Data.length; i++) {
                                            tot = tot + Data[i].Count;
                                        }
                                        var percentage = ((value / tot) * 100).toFixed(2) + "%";
                                        var dataItem = Data[itemIndex];
                                        if (isNaN(value))
                                            return value;
                                        return dataItem.Name + ': (' + parseFloat(value) + ') ' + percentage + '';
                                        //return  parseFloat(value);
                                    },
                                }
                            ],
                        click: pieChartClickHandler,
                    }
                ]
        };
        // setup the chart

        $("#drildown" + id).show();
        $("#" + id).hide();

        $("#drildown" + id).jqxChart(settings);

        $("#expandDril" + id).css("height", "550px");
        //storing drill id to close on escape
        expanddrillId = "expandDril" + id;

        var groups = $("#drildown" + id).jqxChart('seriesGroups');
        // add a click event handler function to the 1st group    
        if (groups.length > 0) {
            groups[0].mouseout = function (e) {
                $("path").css("cursor", "default");
                var chartInstance = $("#drildown" + id).jqxChart('getInstance');
                if (chartInstance != undefined) {
                    chartInstance.hideToolTip(
                        1000  /* hide after 1 second, optional parameter */
                    );
                }

            }
            groups[0].mouseover = function (e) {
                $("path").css("cursor", "pointer");
            }
            groups[0].mouseleave = function (e) {
                $("path").css("cursor", "default");
            }
        }









        $("#drildown" + id).jqxChart('refresh');
        $("#loadingDiv").hide();
        $("#loader1").hide();
    }


    function pieChartClickHandler(e) {
        $(".grid-pop").css('display', 'none');

        $("#expandDrilplaceholder1").draggable({ disabled: true });
        $("#expandDrilplaceholderRight1").draggable({ disabled: true });

        var AlertSeverity = peidata[e.elementIndex].Name.replace('Alerts', '');//'ALL';
        var AlertStatus = 'Open';
        var DownloadStatus = (peidata[e.elementIndex].Name).replace(/ /g, '');//AppConstants.get(peidata[e.elementIndex].Name);
        var Status = (peidata[e.elementIndex].Name).replace(/ /g, '');
        var dateObjNew = new Object();

        //var date = moment(peiDate).tz(name).subtract('days', 1).format('MM/DD/YYYY');
        //var minutes = "00";
        //var hours = "24";
        //var fdate = getlocaldateForDashboard('from', date, hours, minutes);

        //var fdate = moment(peiDate).tz(name).subtract('days', 1).format();
        //dateObj.from = fdate;// moment().subtract('days', 7).format('YYYY-MM-DD');//'2015-10-22';

        //var date = moment(peiDate).tz(name).format('MM/DD/YYYY');
        //var minutes = "59";
        //var hours = "23";
        //var tdate = getlocaldateForDashboard('to', date, hours, minutes);
        ////  var tdate = moment(peiDate).tz(name).format();
        //dateObj.to = tdate;//moment().format('YYYY-MM-DD');  //'2015-10-29';

        //GetResultWidgetsById(chartGridData, AlertSeverity, AlertStatus, dateObj);

        //var param = getParamforResultGrid(chartGridData.Identifier, chartGridData.WidgetSourceData.chart.APIDetails, dateObj, AlertSeverity, AlertStatus, DownloadStatus, Status);
        //var obj = new Object();
        //obj.token = TOKEN();
        //obj.getWidgetByIdReq = param;
        //param = obj;

        var date = moment(peiDate).tz(name).subtract('days', 1).format('MM/DD/YYYY');
        var minutes = "00";
        var hours = "24";
        var fromDate = getlocaldate1(moment(date), hours, minutes);
        var fdate = createJSONTimeStamp(fromDate, LONG_DATETIME_FORMAT);

        dateObjNew.from = fdate;

        var date = moment(peiDate).tz(name).format('MM/DD/YYYY');
        var minutes = "59";
        var hours = "23";
        var toDate = getlocaldate1(moment(date), hours, minutes);
        var tdate = createJSONTimeStamp(fromDate, LONG_DATETIME_FORMAT);

        if (widgetId == "SW_ALERT_CHART") {
            var filterValueArray = peidata[e.elementIndex].Name.split(" ");
            var filterValue = filterValueArray[0];
            var item = new Object();
            FilterList = new Array();
            item.FilterColumn = 'Severity';
            item.FilterValue = filterValue;
            FilterList.push(item);
            columnSortFilterForPieChart.GridId = "AlertHistory";
        }
        else if (widgetId == "SW_DOWNLOAD_CHART") {
            var item = new Object();
            FilterList = new Array();
            item.FilterColumn = 'Status';
            item.FilterValue = peidata[e.elementIndex].Name;
            FilterList.push(item);
            columnSortFilterForPieChart.GridId = "DownloadDetailsForDeviceProfile";
        }
        columnSortFilterForPieChart.FilterList = FilterList;
        columnSortFilterForPieChart.SortList = null;
        isPieChartFilter = true;

        dateObjNew.to = tdate;
        var obj = new Object();
        if (widgetId == "SW_ALERT_CHART") {
            var param = getAlertResultsDetailsForDashboardParam(false, chartGridData.Identifier, chartGridData.WidgetSourceData.chart.APIDetails, dateObjNew, AlertSeverity, AlertStatus, DownloadStatus, Status, []);
            obj.getAlertResultsDetailsReq = param;
        }
        else if (widgetId == "SW_DOWNLOAD_CHART") {
            var param = getJobDownloadResultsDetailsForDashboardParam(false, chartGridData.Identifier, chartGridData.WidgetSourceData.chart.APIDetails, dateObjNew, AlertSeverity, AlertStatus, DownloadStatus, Status, []);
            obj.getDownloadResultsDetailsReq = param;
        }

        obj.token = TOKEN();
        param = obj;
        var datelable = moment(peiDate).format('DD MMMM');
        $("#chartGridMainDiv").empty();
        var str = '<div id="chartGrid"  />';
        $("#chartGridMainDiv").append(str);
        if (chartGridData.WidgetSourceData.chart.APIDetails.Columns != undefined) {
            $("#resultLable").text(i18n.t(chartGridData.Identifier, { lng: 'en' }) + '  ' + datelable);
            $("#drillDownHead").text(i18n.t(chartGridData.Identifier, { lng: 'en' }) + '  ' + datelable);
            showResultGrid('chartGrid', param, chartGridData, null, widgetId);
        }
        //getParamforResultGrid(chartGridData.WidgetSourceData.chart.DrilDownChart.APIDetails.Name, source[0].WidgetSourceData.chart.APIDetails, dateObj);

    }



    function showResultGrid(gID, param, resultWidgetData, State, widgetID) {

        if (widgetID == "SW_ALERT_CHART") {
            getAlertResultsDetailsForDashboard('chartGrid', param, self.openPopup, self.columnlist);
        } else if (widgetID == "SW_DOWNLOAD_CHART") {
            getJobDownloadResultsDetailsForDashboard('chartGrid', param, self.openPopup, self.columnlist);
        }
    }

    function getAlertResultsDetailsForDashboardParam(isExport, identifier, APIDetails, dateObj, AlertSeverity, AlertStatus, DownloadStatus, Status, visibleColumns) {
        var getAlertResultsDetailsReq = new Object();
        var dictionary = new Array();
        var DefaultDate = new Object();
        var Pagination = new Object();
        var Export = new Object();

        Export.DynamicColumns = null;
        Export.IsAllSelected = false;
        Export.IsExport = false;
        Export.VisibleColumns = visibleColumns;

        DefaultDate.From = dateObj.from;
        DefaultDate.To = dateObj.to;

        Pagination.HighLightedItemId = null;
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = "250";

        //getAlertResultsDetailsReq.WidgetId = identifier;
        getAlertResultsDetailsReq.AlertStatus = "2";
        getAlertResultsDetailsReq.AlertSeverity = "4";
        getAlertResultsDetailsReq.ColumnSortFilter = columnSortFilterForPieChart;
        getAlertResultsDetailsReq.DefaultDate = DefaultDate;
        getAlertResultsDetailsReq.Export = Export;
        getAlertResultsDetailsReq.Pagination = Pagination;

        return getAlertResultsDetailsReq;
    }

    function getAlertResultsDetailsForDashboard(gID, param, openPopup, columnlist) {
        var gridColumns = [];
        var sourceDataFieldsArr = [
            { name: 'isSelected', type: 'number' },
            { name: 'UniqueDeviceId', map: 'UNIQUEDEVICEID' },
            { name: 'SerialNumber', map: 'SERIALNUMBER', type: 'string' },
            { name: 'DeviceId', map: 'DEVICEID', type: 'string' },
            { name: 'PREVIOUSHIERARCHYNAME', map: 'PREVIOUSHIERARCHYNAME', type: 'string' },
            { name: 'HierarchyFullPath', map: 'HIERARCHYFULLPATH', type: 'string' },
            { name: 'ModelName', map: 'MODELNAME', type: 'string' },
            { name: 'ComputedDeviceStatus', map: 'COMPUTEDDEVICESTATUS', type: 'string' },
            { name: 'EventRaisedDate', map: 'EVENTRECEIVEDDATE', type: 'date' },
            { name: 'EventReceivedDate', map: 'EVENTRAISEDDATE', type: 'date' },
            { name: 'Severity', map: 'SEVERITY', type: 'string' },
            { name: 'AlertName', map: 'ALERTNAME', type: 'string' },
            { name: 'Description', map: 'DESCRIPTION', type: 'string' }
        ];

        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var source = {
            dataType: 'json',
            dataFields: sourceDataFieldsArr,
            root: 'DeviceAlerts',
            type: 'POST',
            data: param,
            url: AppConstants.get('API_URL') + "/GetAlertResultsDetailsForDashboard",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getAlertResultsDetailsResp)
                    data.getAlertResultsDetailsResp = $.parseJSON(data.getAlertResultsDetailsResp);
                else
                    data.getAlertResultsDetailsResp = [];
            },
        }
        var dataAdapter = new $.jqx.dataAdapter(source,
            {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                    if (!isPieChartFilter) {
                        var columnSortFilter = new Object();
                        columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'AlertHistory');
                        param.getAlertResultsDetailsReq.ColumnSortFilter = columnSortFilter;
                    }

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    if (data) {
                        if (data.getAlertResultsDetailsResp && data.getAlertResultsDetailsResp.DeviceAlerts) {
                            for (var i = 0; i < data.getAlertResultsDetailsResp.DeviceAlerts.length; i++) {
                                data.getAlertResultsDetailsResp.DeviceAlerts[i].EventReceivedDate = convertToLocaltimestamp(data.getAlertResultsDetailsResp.DeviceAlerts[i].EventReceivedDate);
                                data.getAlertResultsDetailsResp.DeviceAlerts[i].EventRaisedDate = convertToDeviceZonetimestamp(data.getAlertResultsDetailsResp.DeviceAlerts[i].EventRaisedDate);
                            }
                        }


                        enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                        if (data.getAlertResultsDetailsResp && data.getAlertResultsDetailsResp.DeviceAlerts) {
                            pageSize = data.getAlertResultsDetailsResp.DeviceAlerts.length;
                            $("#showngSp").text(pageSize);
                            if (data.getAlertResultsDetailsResp.TotalSelectionCount != 'undefined') {
                                gridStorage[0].TotalSelectionCount = data.getAlertResultsDetailsResp.TotalSelectionCount;
                                var updatedGridStorage = JSON.stringify(gridStorage);
                                window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            }
                        } else {
                            data.getAlertResultsDetailsResp = new Object();
                            data.getAlertResultsDetailsResp.DeviceAlerts = [];
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

        //for device profile
        function SerialNoRendererAlerts(row, columnfield, value, defaulthtml, columnproperties) {
            isPieChartFilter = false;
            var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
            return html;
        }

        //Custom filter
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

        }
        var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
            genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
        }

        var toolTipComputedRenderer = function (row, column, value, defaultHtml) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
            if (value == "Pending Hierarchy Assignment") {
                defaultHtml = '<div style="padding-left:8px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-checkmark iPanding" ></i></span><span style="padding-left:12px;padding-top:7px;" title="' + value + '">' + value + '</span></div>';
            } else if (value == "Pending Registration") {
                defaultHtml = '<div style="margin-left:-4px; padding-left:0px;padding-top:3px;overflow:hidden;text-overflow: ellipsis;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="30"><div class="iconImg registration"></div></a><span style="padding-left:0px;padding-top:3px;" title="' + value + '">' + value + '</span></div>';
            } else if (value == "Active") {
                defaultHtml = '<div style="padding-left:8px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-checkmark" style="color:green"></i></span><span style="padding-left:12px;padding-top:7px;" title="' + value + '">' + value + '</span></div>';
            } else if (value == "Inactive") {
                defaultHtml = '<div style="padding-left:8px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-cross" style="color:red"></i></span><span style="padding-left:12px;padding-top:7px;" title="' + value + '">' + value + '</span></div>';
            }
            return defaultHtml;
        }

        var severityRenderer = function (row, columnfield, value, defaultHtml, columnproperties) {
            if (value == "Low") {
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Low_severity"></div></a>' + value + '</span></div>';
            } else if (value == "High") {
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg high_Severity"></div></a>' + value + '</span></div>';
            } else if (value == "Medium") {
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Medium_severity"></div></a>' + value + '</span></div>';
            }
            return defaultHtml;
        }

        var toolTipRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = displayTooltipAndIconRenderer(gID, row, column, value, defaultHtml, 2);
            return defaultHtml;
        }

        gridColumns = [
            {
                text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 100, enabletooltips: false,
                filtertype: "custom", cellsrenderer: SerialNoRendererAlerts,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 80, width: 'auto', enabletooltips: false,
                filtertype: "custom", cellsrenderer: SerialNoRendererAlerts,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, enabletooltips: false, minwidth: 80,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
                }
            },
            {
                text: i18n.t('dev_status', { lng: lang }), dataField: 'ComputedDeviceStatus', editable: false, minwidth: 120, cellsrenderer: toolTipComputedRenderer,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
                }
            },
            {
                text: i18n.t('from_hierarchy_path', { lng: lang }), datafield: 'PREVIOUSHIERARCHYNAME', editable: false, minwidth: 150,
                filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 130,
                filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('received_date', { lng: lang }), dataField: 'EventReceivedDate', filtertype: 'date', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 150, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('raised_date', { lng: lang }), datafield: 'EventRaisedDate', filtertype: 'date', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 150, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('severity', { lng: lang }), datafield: 'Severity', editable: false, enabletooltips: false, minwidth: 80, cellsrenderer: severityRenderer,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Severity');
                }
            },
            {
                text: i18n.t('alert_type', { lng: lang }), datafield: 'AlertName', enabletooltips: true, editable: false, minwidth: 100,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Alerts');
                }
            },
            {
                text: i18n.t('description', { lng: lang }), datafield: 'Description', editable: false, minwidth: 100,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
        ];
        var gridheight = $(window).height();
        if (gridheight > 800) {
            gridheight = 450;
        } else {
            gridheight = 250;
        }
        $("#" + gID).jqxGrid(
            {
                height: gridheight + "px",
                width: "100%",
                pageable: true,
                editable: true,
                source: dataAdapter,
                altRows: true,
                virtualmode: true,
                pageSize: "250",
                filterable: true,
                sortable: true,
                columnsResize: true,
                columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                enabletooltips: true,
                rowsheight: 32,
                autoshowfiltericon: true,
                columns: gridColumns,
                rendergridrows: function () {
                    return dataAdapter.records;
                },

                ready: function () {
                    //var columns = genericHideShowColumn(gID, true, []);
                    //koUtil.gridColumnList = new Array();
                    //for (var i = 0; i < columns.length; i++) {
                    //    koUtil.gridColumnList.push(columns[i].columnfield);
                    //}
                    //visibleColumnsList = koUtil.gridColumnList;
                },
            });

        getGridBiginEdit(gID, 'AlertTypeId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'AlertTypeId');
    }

    function getJobDownloadResultsDetailsForDashboardParam(isExport, identifier, APIDetails, dateObj, AlertSeverity, AlertStatus, DownloadStatus, Status, visibleColumns) {
        $(".filter.jqx-rc-all").css('display', 'none');
        var getDownloadResultsDetailsReq = new Object();
        var dictionary = new Array();
        var DefaultDate = new Object();
        var Pagination = new Object();
        var Export = new Object();

        Export.DynamicColumns = null;
        Export.IsAllSelected = false;
        Export.IsExport = false;
        Export.VisibleColumns = visibleColumns;

        DefaultDate.From = dateObj.from;
        DefaultDate.To = dateObj.to;

        Pagination.HighLightedItemId = null;
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = 250;

        getDownloadResultsDetailsReq.DownloadStatus = "15";
        getDownloadResultsDetailsReq.PackageType = "0";
        getDownloadResultsDetailsReq.ColumnSortFilter = columnSortFilterForPieChart;
        getDownloadResultsDetailsReq.DefaultDate = DefaultDate;
        getDownloadResultsDetailsReq.Export = Export;
        getDownloadResultsDetailsReq.Pagination = Pagination;

        return getDownloadResultsDetailsReq;
    }

    function getJobDownloadResultsDetailsForDashboard(gID, param, openPopup, columnlist) {
        var gridColumns = [];
        var sourceDataFieldsArr = [
            { name: 'isSelected', type: 'number' },
            { name: 'UniqueDeviceId', map: 'UNIQUEDEVICEID' },
            { name: 'SerialNumber', map: 'SERIALNUMBER', type: 'string' },
            { name: 'DeviceId', map: 'DEVICEID', type: 'string' },
            { name: 'HierarchyFullPath', map: 'HIERARCHYFULLPATH', type: 'string' },
            { name: 'ModelName', map: 'MODELNAME', type: 'string' },
            { name: 'ComputedDeviceStatus', map: 'COMPUTEDDEVICESTATUS', type: 'string' },
            { name: 'JobName', map: 'JOBNAME', type: 'string' },
            { name: 'Status', map: 'STATUS', type: 'string' },
            { name: 'PackageName', map: 'PACKAGENAME', type: 'string' },
            { name: 'Description', map: 'DESCRIPTION', type: 'string' },
            { name: 'ScheduledDownloadDate', map: 'SCHEDULEDDOWNLOADDATE', type: 'date' },
            { name: 'ScheduledInstallDate', map: 'SCHEDULEDINSTALLDATE', type: 'date' },
            { name: 'ScheduleInformation', map: 'SCHEDULEINFORMATION', type: 'date' },
            { name: 'StartDate', map: 'STARTDATE', type: 'date' },
            { name: 'DownloadDuration', map: 'DOWNLOADDURATION', type: 'string' },
            { name: 'FileName', map: 'FILENAME', type: 'string' },
            { name: 'FileSize', map: 'FILESIZEINMB', type: 'string' },
            { name: 'JobCreatedBy', map: 'JOBCREATEDBYUSERNAME', type: 'string' },
            { name: 'TaskCreatedDate', map: 'TASKCREATEDDATE', type: 'date' },
            { name: 'IsCancelRequestFailed', map: 'IsCancelRequestFailed' }
        ];

        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;

        var source = {
            dataType: 'json',
            dataFields: sourceDataFieldsArr,
            root: 'DownloadResultsDetails',
            type: 'POST',
            data: param,
            url: AppConstants.get('API_URL') + "/GetJobDownloadResultsDetailsForDashboard",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getDownloadResultsDetailsResp)
                    data.getDownloadResultsDetailsResp = $.parseJSON(data.getDownloadResultsDetailsResp);
                else
                    data.getDownloadResultsDetailsResp = [];

                if (data.getDownloadResultsDetailsResp && data.getDownloadResultsDetailsResp.PaginationResponse) {
                    source.totalrecords = data.getDownloadResultsDetailsResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getDownloadResultsDetailsResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
                $(".filter.jqx-rc-all").css('display', 'none');
            },
        }
        var dataAdapter = new $.jqx.dataAdapter(source,
            {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                    if (!isPieChartFilter) {
                        var columnSortFilter = new Object();
                        columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'DownloadDetailsForDeviceProfile');
                        param.getDownloadResultsDetailsReq.ColumnSortFilter = columnSortFilter;
                    }

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    if (data) {
                        if (data.getDownloadResultsDetailsResp && data.getDownloadResultsDetailsResp.DownloadResultsDetails) {
                            for (var i = 0; i < data.getDownloadResultsDetailsResp.DownloadResultsDetails.length; i++) {
                                data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].ScheduledDownloadDate = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].ScheduledDownloadDate);
                                data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].StartDate = convertToDeviceZonetimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].StartDate);
                                data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].TaskCreatedDate = convertToLocaltimestamp(data.getDownloadResultsDetailsResp.DownloadResultsDetails[i].TaskCreatedDate);
                            }
                        }

                        enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                        if (data.getDownloadResultsDetailsResp && data.getDownloadResultsDetailsResp.TotalSelectionCount != 'undefined') {
                            gridStorage[0].TotalSelectionCount = data.getDownloadResultsDetailsResp.TotalSelectionCount;
                            var updatedGridStorage = JSON.stringify(gridStorage);
                            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        }
                        if (data.getDownloadResultsDetailsResp && data.getDownloadResultsDetailsResp.DownloadResultsDetails) {
                            pageSize = data.getDownloadResultsDetailsResp.DownloadResultsDetails.length;
                            $("#showngSp").text(pageSize);
                        } else {
                            data.getDownloadResultsDetailsResp = new Object();
                            data.getDownloadResultsDetailsResp.DownloadResultsDetails = [];
                            $("#showngSp").text("0");
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

        //for device profile
        function SerialNoRendereDownloadJobStatus(row, columnfield, value, defaulthtml, columnproperties) {
            isPieChartFilter = false;
            var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
            return html;
        }

        //Custom filter
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

        }
        var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
            genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
        }

        var toolTipComputedRenderer = function (row, column, value, defaultHtml) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);
            if (value == "PendingHierarchyAssignment") {
                value = "Pending Hierarchy Assignment";
            } else if (value == "PendingRegistration") {
                value = "Pending Registration";
            }

            if (value == "Pending Hierarchy Assignment") {
                defaultHtml = '<div style="padding-left:8px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-checkmark iPanding" ></i></span><span style="padding-left:12px;padding-top:7px;" title="' + value + '">' + value + '</span></div>';
            } else if (value == "Pending Registration") {
                defaultHtml = '<div style="margin-left:-4px; padding-left:0px;padding-top:3px;overflow:hidden;text-overflow: ellipsis;"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="30"><div class="iconImg registration"></div></a><span style="padding-left:0px;padding-top:3px;" title="' + value + '">' + value + '</span></div>';
            } else if (value == "Active") {
                defaultHtml = '<div style="padding-left:8px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-checkmark" style="color:green"></i></span><span style="padding-left:12px;padding-top:7px;" title="' + value + '">' + value + '</span></div>';
            } else if (value == "Inactive") {
                defaultHtml = '<div style="padding-left:8px;padding-top:7px;overflow:hidden;text-overflow: ellipsis;"><span ><i class="icon-cross" style="color:red"></i></span><span style="padding-left:12px;padding-top:7px;" title="' + value + '">' + value + '</span></div>';
            }
            return defaultHtml;
        }

        var toolTipRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = dispalyTooltipIcon_DownloadStatus(gID, row, column, value, defaultHtml, 0);
            return defaultHtml;
        }

        gridColumns = [
            {
                text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 130, enabletooltips: false, cellsrenderer: SerialNoRendereDownloadJobStatus,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 120, width: 'auto', enabletooltips: false,
                filtertype: "custom", cellsrenderer: SerialNoRendereDownloadJobStatus,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, minwidth: 90, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Model');
                }
            },
            {
                text: i18n.t('dev_status', { lng: lang }), datafield: 'ComputedDeviceStatus', editable: false, minwidth: 100, enabletooltips: false,
                filtertype: "custom", cellsrenderer: toolTipComputedRenderer,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Device Status');
                }
            },
            {
                text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 130,
                filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('job_name', { lng: lang }), datafield: 'JobName', editable: false, minwidth: 130,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('chartDownloadStatus', { lng: lang }), datafield: 'Status', editable: false, minwidth: 100, enabletooltips: false, cellsrenderer: toolTipRenderer,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Software Job Task Status');
                }
            },
            {
                text: i18n.t('package_name_download', { lng: lang }), dataField: 'PackageName', editable: false, minwidth: 130,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('description', { lng: lang }), dataField: 'Description', editable: false, minwidth: 140,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('download_scheduled_col', { lng: lang }), datafield: 'ScheduledDownloadDate', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 150,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('download_started_at', { lng: lang }), datafield: 'StartDate', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 150,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('download_duration', { lng: lang }), dataField: 'DownloadDuration', editable: false, minwidth: 130,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('filename', { lng: lang }), dataField: 'FileName', editable: false, minwidth: 100,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('filesize', { lng: lang }), dataField: 'FileSize', editable: false, minwidth: 100,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('createdOn', { lng: lang }), datafield: 'TaskCreatedDate', editable: false, minwidth: 150, cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);

                }
            }
        ];
        var gridheight = $(window).height();
        if (gridheight > 800) {
            gridheight = 450;
        } else {
            gridheight = 250;
        }
        $("#" + gID).jqxGrid(
            {
                width: "100%",
                height: gridheight + "px",
                pageable: true,
                editable: true,
                source: dataAdapter,
                altRows: true,
                virtualmode: true,
                pageSize: "250",
                filterable: true,
                sortable: true,
                columnsResize: true,
                columnsreorder: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                enabletooltips: true,
                rowsheight: 32,
                autoshowfiltericon: true,
                columns: gridColumns,
                rendergridrows: function () {
                    return dataAdapter.records;
                },

                ready: function () {
                    //var columns = genericHideShowColumn(gID, true, []);
                    //koUtil.gridColumnList = new Array();
                    //for (var i = 0; i < columns.length; i++) {
                    //    koUtil.gridColumnList.push(columns[i].columnfield);
                    //}
                    //visibleColumnsList = koUtil.gridColumnList;
                },
            });

        getGridBiginEdit(gID, 'JobDevicesId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'JobDevicesId');
    }

    function pieChartForLine(id, index, widgetData, Data) {

        var colorArr = new Array();
        colorArr = widgetData.WidgetSourceData.chart.DrilDownChart.colorArr.color;
        $.jqx._jqxChart.prototype.colorSchemes.push({ name: 'VHQLinePie', colors: colorArr });

        var settings = {
            title: false,
            description: false,
            enableAnimations: true,
            showLegend: true,
            showBorderLine: true,
            legendLayout: { left: 150, top: 205, width: 300, height: 200, flow: 'horizontal' },
            padding: { left: 5, top: 5, right: 5, bottom: 5 },
            titlePadding: { left: 0, top: 0, right: 0, bottom: 10 },
            toolTipShowDelay: 0,
            toolTipHideDelay: 3000,
            source: Data,
            colorScheme: 'VHQLinePie',

            seriesGroups:
                [
                    {
                        type: 'pie',
                        showLabels: true,
                        series:
                            [
                                {
                                    dataField: 'DeviceCount',
                                    displayText: 'Date',
                                    labelRadius: 110,
                                    initialAngle: 15,
                                    useGradientColors: false,
                                    radius: 100,
                                    centerOffset: 3,
                                    formatFunction: function (value) {
                                        if (isNaN(value))
                                            return value;
                                        return parseFloat(value) + '';
                                    },
                                }
                            ]
                    }
                ]
        };
        // setup the chart
        $("#drildown" + id).show();
        $("#" + id).hide();
        $("#drildown" + id).jqxChart(settings);
        //$("#loadingDiv").hide();
    }

    //Calculate max count
    function getHighest(array) {
        var max = {};
        for (var i = 0; i < array.length; i++) {
            if (array[i] && array[i].Count) {
                if (array[i].Count > (max.Count || 0))
                    max = array[i];
            } else if (array[i] && array[i].DeviceCount) {
                if (array[i].DeviceCount > (max.DeviceCount || 0))
                    max = array[i];
            }
        }

        if (max.Count == undefined) {
            max.Count = 0;
        }

        return max;
    }

    ///for linr chart
    function lineChart(id, index, widgetData, Data, blankCheck) {

        //for (var i = 0; i < Data.length; i++) {
        //    if (i == 0 || i == 4) {
        //        Data[i].MediumAlertCount = 1;
        //    } else {
        //        Data[i].MediumAlertCount = 3;
        //    }
        //}

        //Data[1].MediumAlertCount = 1303;
        //Data[1].LowAlertCount = 0;
        //Data[1].HighAlertCount = 6;

        if (widgetData.Identifier == 'SW_ALERT_CHART') {
            for (var i = 0; i < Data.length; i++) {
                if (Data[i].LowAlertCount == undefined) {
                    Data[i].LowAlertCount = 0;
                }
                if (Data[i].MediumAlertCount == undefined) {
                    Data[i].MediumAlertCount = 0;
                }
                if (Data[i].HighAlertCount == undefined) {
                    Data[i].HighAlertCount = 0;
                }
            }
        }
        var totalCount = 0;
        var countAarry = [];
        var setValueAxis = new Object();

        for (i = 0; i < Data.length; i++) {
            totalCount = Data[i].HighAlertCount + Data[i].MediumAlertCount + Data[i].LowAlertCount;
            var obj = new Object();
            obj.Count = totalCount;
            countAarry.push(obj);
        }

        var max = getHighest(countAarry);


        if (blankCheck) {
            setValueAxis = {
                title: { text: widgetData.WidgetSourceData.chart.description },
                labels: { horizontalAlignment: 'right' },
                minValue: 0,
                maxValue: 100,
                unitInterval: 10,
                showGridLines: false
            };
            $("#expandpA" + index).css("display", "none");
            $("#" + id).next('div').next('div').removeClass('hide');
            $("#" + id).next('div').next('div').addClass('show');
        } else {
            if (max.Count > 4) {
                setValueAxis = {
                    title: { text: widgetData.WidgetSourceData.chart.description },
                    labels: { horizontalAlignment: 'right' },
                    minValue: 0,
                    //unitInterval: 1,
                    showGridLines: false
                };
            } else {
                setValueAxis = {
                    title: { text: widgetData.WidgetSourceData.chart.description },
                    labels: { horizontalAlignment: 'right' },
                    minValue: 0,
                    unitInterval: 100,
                    showGridLines: false
                };
            }
            $("#" + id).next('div').next('div').addClass('hide');
            $("#" + id).next('div').next('div').removeClass('show');
        }
        widgetData.widgetLabels([]);
        if (widgetData.widgetLabels().length == 0) {
            var XFieldLegends = widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField;
            for (var i = 0; i < XFieldLegends.length; i++) {
                if (XFieldLegends[i].fieldName != undefined) {
                    var obj = {};
                    obj.Name = XFieldLegends[i].fieldText;
                    obj.fillColor = XFieldLegends[i].color;
                    widgetData.widgetLabels.push(obj);
                }
            }
        }
        linedata = Data;
        lineWidgetdata = widgetData;
        lineIndex = index;
        lineId = id;

        valuedate = '';
        var generatedSeriesArr = new Array();
        for (var j = 0; j < widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField.length; j++) {
            var obj = new Object();
            obj.dataField = widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField[j].fieldName,
                obj.displayText = widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField[j].fieldText,
                obj.color = widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField[j].color,
                obj.symbolType = 'square',
                obj.labels = {
                    visible: false,
                    backgroundColor: '#FEFEFE',
                    backgroundOpacity: 0.2,
                    // borderColor: '#7FC4EF',
                    //  borderOpacity: 0.7,
                    //padding: { left: 5, right: 5, top: 0, bottom: 0 }
                }
            generatedSeriesArr.push(obj);
        }


        var settings = {
            title: false,
            description: false,
            enableAnimations: true,
            showLegend: false,
            showBorderLine: false,

            toolTipShowDelay: 0,
            toolTipHideDelay: 3000,
            source: Data,
            xAxis: {
                dataField: widgetData.WidgetSourceData.chart.dataFeilds.XField,
                tickMarks: { visible: true, interval: 100 },
                textRotationAngle: 0,
                //gridLinesInterval: { visible: false, interval: 1 },
                showGridLines: false,
                valuesOnTicks: false,
                formatFunction: function (value, itemIndex) {
                    //var getTotalData = 0;
                    //for (var k = 0; k < widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField.length; k++) {
                    //    var fieldname = widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField[k].fieldName;
                    //    if (Data[itemIndex][fieldname] != undefined) {
                    //        getTotalData = getTotalData + Data[itemIndex][fieldname];
                    //    }

                    //}
                    return value;
                }
                //padding: { bottom: 10 }
            },
            valueAxis: setValueAxis,

            seriesGroups:
                [
                    {
                        type: 'line',
                        toolTipFormatFunction: function (value, itemIndex, serie, group, xAxisValue, xAxis) {

                            valuedate = xAxisValue;
                            var date = new Date(xAxisValue);
                            var d = date.getDate();
                            var m = date.getMonth();
                            var getTotalData = 0;

                            for (var k = 0; k < widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField.length; k++) {
                                var fieldname = widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField[k].fieldName
                                getTotalData = getTotalData + Data[itemIndex][fieldname];
                            }
                            if (!value)
                                value = 0;
                            var percentage = ((value / getTotalData) * 100).toFixed(2) + "%";
                            if (((value / getTotalData) * 100).toFixed(2) == "NaN") { percentage = "0.00%"; getTotalData = 0 }
                            var formattedTooltip = "<div style='text-align:left;width:110px;cursor:default;'>" +
                                "<b>" + i18n.t(serie.dataField, { lng: lang }) + "</b>" + "</br>" +
                                $.jqx.dataFormat.formatdate(xAxisValue, 'DD MMM') + "</br>" +
                                value + " " + "(" + percentage + ")" + "</br>" +
                                "<i>total</i>:" + " " + getTotalData + "</br></br></br>" +
                                "</div>";
                            if (value == 0) {
                                return "";
                            } else {
                                return formattedTooltip;
                            }

                        },
                        series: generatedSeriesArr,
                        click: clickOnLineChart,
                    }
                ],

        };
        // setup the chart
        //$("#drildown" + id).show();
        //$("#" + id).hide();
        //$("#drildown" + id).jqxChart(settings);

        $("#" + id).show();
        $("#drildown" + id).hide();

        $("#" + id).jqxChart(settings);

        var groups = $("#" + id).jqxChart('seriesGroups');
        // add a click event handler function to the 1st group    
        if (groups.length > 0) {

            groups[0].mouseout = function (e) {
                $("rect").css("cursor", "default");
                var chartInstance = $("#" + id).jqxChart('getInstance');
                if (chartInstance != undefined) {
                    chartInstance.hideToolTip(
                        1000  /* hide after 1 second, optional parameter */
                    );
                }

            }
            groups[0].mouseleave = function (e) {
                $("rect").css("cursor", "default");
            }
            groups[0].mouseover = function (e) {
                $('rect').css('cursor', 'pointer');
            }
        }




        $("#loader1").hide();
    }





    function clickOnLineChart(e) {
        hideWidgetPanel();
        $("#expandDrilplaceholderRight" + lineIndex).css("top", "20px");
        var chartInstance = $("#" + lineId).jqxChart('getInstance');
        if (chartInstance != undefined) {
            chartInstance.hideToolTip(
                1000  /* hide after 1 second, optional parameter */
            );
        }
        isEscapeKeyEnable = true;
        if (lineIndex.lastIndexOf == undefined || lineIndex.lastIndexOf("Right") == -1) {
            $('#legendElementRight' + lineIndex).css("display", "none");
            $('#showHintRight' + lineIndex).css("display", "block");
        } else {
            var val = lineIndex.substring(lineIndex.lastIndexOf("Right") + 5, lineIndex.length);
            $('#legendElement' + val).css("display", "none");
            $('#showHint' + val).css("display", "block");
        }
        var xfield = lineWidgetdata.WidgetSourceData.chart.dataFeilds.XField;

        valuedate = linedata[e.elementIndex][xfield];



        if (valuedate != '') {

            var dayArr = valuedate.split(' ');
            var month = new Date(Date.parse(dayArr[1] + " 1, 2016")).getMonth() + 1;
            var day = dayArr[0];

            var dateObj = new Object();
            var check = moment();
            var year = check.format('YYYY');

            //    var tdate = moment(year + '/' + month + '/' + day).tz(name).format();
            var date = moment(year + '/' + month + '/' + day).tz(name).format('MM/DD/YYYY');
            var minutes = "59";
            var hours = "23";
            var tdate = getlocaldateForDashboard('to', date, hours, minutes);

            //fdate = moment(tdate).tz(name).subtract('days', 1).format();
            var date = moment(tdate).tz(name).subtract('days', 1).format('MM/DD/YYYY');
            var minutes = "00";
            var hours = "24";
            fdate = getlocaldateForDashboard('from', date, hours, minutes);

            peiDate = tdate;
            fdate = fdate;
            tdate = tdate;

            dateObj.from = fdate;
            dateObj.to = tdate;
            $("#loader1").show();
            drildata = _.where(linedata, { EventReceivedDate: valuedate });

            dataforrefresh = [];
            var obj = new Object();
            obj.id = lineId;
            obj.index = lineIndex;
            obj.widgetData = lineWidgetdata;
            obj.dateObj = dateObj;
            dataforrefresh.push(obj);
            openDrillWidget = lineWidgetdata.Identifier;
            GetWidgetsByIdForDrillDown(lineId, lineIndex, lineWidgetdata, dateObj);
            //}

        }
    }

    //function pieChartForLineChart(id, index, widgetData, Data) {
    //    $("#loadingDiv").show();
    //    $.jqx._jqxChart.prototype.colorSchemes.push({ name: 'VHQScheme', colors: ['#348fe2', '#8071b4', '#39b54a', '#f7931e', '#fbb03b'] });
    //    // prepare jqxChart settings

    //    var settings = {
    //        title: false,
    //        description: false,
    //        enableAnimations: true,
    //        showLegend: false,
    //        showBorderLine: true,
    //        legendLayout: { left: 30, top: 306, width: 300, height: 400, flow: 'horizontal' },
    //        //padding: { left: 5, top: 5, right: 5, bottom: 5 },
    //        //titlePadding: { left: 0, top: 0, right: 0, bottom: 10 },

    //        source: Data,
    //        colorScheme: 'VHQScheme',
    //        seriesGroups:
    //            [
    //                {
    //                    type: 'pie',
    //                    showLabels: true,
    //                    series:
    //                        [
    //                            {
    //                                dataField: widgetData.WidgetSourceData.chart.dataFeilds.YFields.YField,//'count',
    //                                displayText: widgetData.WidgetSourceData.chart.dataFeilds.XField,//'Name',
    //                                labelRadius: 100,
    //                                initialAngle: 15,
    //                                useGradientColors: false,
    //                                radius: 80,
    //                                centerOffset: 0,
    //                                formatFunction: function (value) {
    //                                    if (isNaN(value))
    //                                        return value;
    //                                    return parseFloat(value) + '%';
    //                                },
    //                            }
    //                        ]
    //                }
    //            ]
    //    };
    //    // setup the chart
    //    $("#drildown" + id).show();
    //    $("#" + id).hide();
    //    $("#drildown" + id).jqxChart(settings);
    //    $("#drildown" + id).jqxChart('refresh');
    //    $("#loadingDiv").hide();
    //}

    function createBarChartColumnArr(arrData) {
        var arr = [];
        var col = '';
        for (var i = 0; i < arrData.length; i++) {
            col = new Object();
            col.dataField = arrData[i].fieldName;
            col.displayText = arrData[i].fieldText;
            col.color = arrData[i].color;
            arr.push(col);
        }
        return arr;

    }
    function createDataFieldsArr(arrData) {
        var arr = [];
        var col = '';
        col = new Object();
        col.name = arrData.XField;
        arr.push(col);
        for (var i = 0; i < arrData.YFields.YField.length; i++) {
            col = new Object();
            col.name = arrData.YFields.YField[i].fieldName;
            arr.push(col);
        }
        return arr;
    }

    function GetAllDashboardWidgets() {
        function callbackFunction(data, error) {
            if (data && data.getAllDashboardWidgetsResp) {
                data.getAllDashboardWidgetsResp = $.parseJSON(data.getAllDashboardWidgetsResp);
            }

            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    }
                }
            }
        }
        var params = '{"token":"' + TOKEN() + '"}';
        ajaxJsonCall('GetAllDashboardWidgets', params, callbackFunction, true, 'POST', true);
    }

    function setDataToCharts(id, index, widgetData, chartdata, isreload) {
        if (chartdata != null) {

            var data = chartdata;

            if (widgetData.WidgetSourceData.chart.type == AppConstants.get('BAR_CHART')) {

                if (data) {
                    if (widgetData.WidgetSourceData.chart.dataFeilds.XField == 'Date') {
                        if (widgetData.Identifier != 'SW_REPORT_CHART') {
                            if (!isreload) {
                                for (var i = 0; i < data.length; i++) {
                                    data[i].Date = jsonDateConversion(data[i].Date, "DD MMM");
                                }
                            }
                        } else {
                            var datafield = widgetData.WidgetSourceData.chart.dataFeilds.XField;
                            if (!isreload) {
                                for (var i = 0; i < data.length; i++) {
                                    data[i].Date = jsonDateConversion(data[i].Date, "DD MMM");
                                }
                            }


                            var newModData = [];
                            //var date = new Date();



                            for (var i = 0; i < 7; i++) {
                                var tempDate = moment().subtract('days', i).format('DD MMM');
                                var source = _.where(data, { Date: tempDate });

                                if (source == '') {
                                    var obj = new Object();
                                    obj.__type = "DeviceSummary:#VHQBusinessLayer";
                                    obj[datafield] = tempDate;
                                    newModData.push(obj);
                                } else {

                                    var totalDeviceCount = 0;
                                    var DeviceSummary = new Object();
                                    for (var p = 0; p < source.length; p++) {
                                        DeviceSummary.Date = source[p].Date;
                                        var c = parseInt(source[p].DeviceCount);
                                        totalDeviceCount += c;
                                        DeviceSummary.DeviceCount = totalDeviceCount;
                                    }

                                    if (newModData.length > 0) {
                                        if (DeviceSummary.Date != undefined) {
                                            var source1 = _.where(newModData, { Date: DeviceSummary.Date });
                                            if (source1.length < 1)
                                                newModData.push(DeviceSummary);
                                        }

                                    }
                                    else
                                        newModData.push(DeviceSummary);
                                }

                            }

                            newModData.reverse();
                            data = newModData;
                        }
                    }

                }
                barchart(id, index, widgetData, data, false);
            } else if (widgetData.WidgetSourceData.chart.type == AppConstants.get('DONUT_CHART')) {
                donutChart(id, index, widgetData, data, false);
            } else if (widgetData.WidgetSourceData.chart.type == AppConstants.get('STACKBAR_CHART')) {

                var datafield = widgetData.WidgetSourceData.chart.dataFeilds.XField;
                if (data !== null && !isreload) {

                    for (var i = 0; i < data.length; i++) {
                        data[i].Date = jsonDateConversion(data[i].Date, "DD MMM");

                    }

                }

                var newModData = [];

                for (var i = 0; i < 7; i++) {
                    var tempDate = moment().subtract('days', i).format('DD MMM');
                    var source = _.where(data, { Date: tempDate });
                    if (source == '') {
                        var obj = new Object();
                        obj.__type = "Download_Chart:#VHQBusinessLayer";
                        obj[datafield] = tempDate;
                        newModData.push(obj);
                    } else {
                        //source[0].FailedCount = 1;
                        //source[0].SuccessfulCount = 1;
                        newModData.push(source[0]);
                    }

                }

                newModData.reverse()

                stackChart(id, index, widgetData, newModData, false);
            } else if (widgetData.WidgetSourceData.chart.type == AppConstants.get('PIE_CHART')) {
                if (data) {
                    if (widgetData.WidgetSourceData.chart.dataFeilds.XField == 'Date') {

                        for (var i = 0; i < data.length; i++) {
                            data[i].Date = jsonDateConversion(data[i].Date, "DD MMM");
                        }
                    }
                }
                pieChart(id, index, widgetData, data);
            } else if (widgetData.WidgetSourceData.chart.type == 'lineChart') {// AppConstants.get('LINE_CHART')) {
                var datafield = widgetData.WidgetSourceData.chart.dataFeilds.XField;

                if (data !== null && !isreload) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].EventReceivedDate = jsonDateConversion(data[i].EventReceivedDate, "DD MMM");

                    }
                }

                var newModData = [];

                for (var i = 0; i < 7; i++) {
                    var tempDate = moment().subtract('days', i).format('DD MMM');
                    var source = _.where(data, { EventReceivedDate: tempDate });
                    if (source == '') {
                        var obj = new Object();
                        obj.__type = "DeviceAlertSummary:#VHQBusinessLayer";
                        obj[datafield] = tempDate;
                        //obj.HighAlertCount = 0;
                        //obj.LowAlertCount = 0;
                        //obj.MediumAlertCount = 0;
                        //obj.TotalAlertCount = data[0].TotalAlertCount;
                        newModData.push(obj);
                    } else {
                        newModData.push(source[0]);
                    }

                }

                newModData.reverse()


                lineChart(id, index, widgetData, newModData, false);

            }
        } else {


            var data = [];
            if (widgetData.WidgetSourceData.chart.type == AppConstants.get('BAR_CHART')) {
                var datafield = widgetData.WidgetSourceData.chart.dataFeilds.XField;
                if (widgetData.Identifier == 'SW_REPORT_CHART') {
                    var newModData = [];
                    for (var i = 0; i < 7; i++) {
                        var tempDate = moment().subtract('days', i).format('DD MMM');


                        var obj = new Object();
                        obj.__type = "DeviceSummary:#VHQBusinessLayer";
                        obj[datafield] = tempDate;
                        newModData.push(obj);


                    }

                    newModData.reverse();
                    data = newModData;
                } else if (widgetData.Identifier == 'SW_DEVICES_BY_MODEL') {
                    var newModData = [];
                    var obj = new Object();
                    obj.__type = "DeviceSummary:#VHQBusinessLayer";
                    obj[datafield] = "Models";
                    newModData.push(obj);
                    data = newModData;
                } else if (widgetData.Identifier == 'SW_DEVICE_BY_MEDIA') {
                    var newModData = [];
                    var obj = new Object();
                    obj.__type = "DeviceSummary:#VHQBusinessLayer";
                    obj[datafield] = "Media";
                    newModData.push(obj);
                    data = newModData;
                }



                barchart(id, index, widgetData, data, true);
            } else if (widgetData.WidgetSourceData.chart.type == AppConstants.get('STACKBAR_CHART')) {
                var datafield = widgetData.WidgetSourceData.chart.dataFeilds.XField;
                var newModData = [];
                for (var i = 0; i < 7; i++) {
                    var tempDate = moment().subtract('days', i).format('DD MMM');
                    var obj = new Object();
                    obj.__type = "DeviceAlertSummary:#VHQBusinessLayer";
                    obj[datafield] = tempDate;

                    newModData.push(obj);


                }
                newModData.reverse()
                stackChart(id, index, widgetData, newModData, true);
            } else if (widgetData.WidgetSourceData.chart.type == AppConstants.get('PIE_CHART')) {
                pieChart(id, index, widgetData, data, true);
            } else if (widgetData.WidgetSourceData.chart.type == AppConstants.get('DONUT_CHART')) {
                donutChart(id, index, widgetData, data, false);
            } else if (widgetData.WidgetSourceData.chart.type == 'lineChart') {


                var datafield = widgetData.WidgetSourceData.chart.dataFeilds.XField;
                var newModData = [];
                for (var i = 0; i < 7; i++) {
                    var tempDate = moment().subtract('days', i).format('DD MMM');
                    var obj = new Object();
                    obj.__type = "DeviceAlertSummary:#VHQBusinessLayer";
                    obj[datafield] = tempDate;

                    newModData.push(obj);


                }
                newModData.reverse()

                lineChart(id, index, widgetData, newModData, true);
            }
            //stackChart(id, index, widgetData, data);
            $("#loader1").hide();
        }
    }

    function GetWidgetsById(id, index, widgetData) {


        loadingcount = loadingcount + 1;


        var getWidgetByIdReq = new Object();
        var dateObj = new Object();


        getWidgetByIdReq = getParam(widgetData.Identifier, widgetData.WidgetSourceData.chart.APIDetails, dateObj, widgetData);


        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data && data.getWidgetResp) {
                        data.getWidgetResp = $.parseJSON(data.getWidgetResp);
                    }
                    data.getWidgetResp.WidgetList = mapObjectToArray(data.getWidgetResp.WidgetList);

                    insertdashboardwidgetdata(data.getWidgetResp.WidgetList[0]);
                    if (data.getWidgetResp.WidgetList[0].Value != null) {
                        if (data.getWidgetResp.WidgetList[0].Key == "SW_DOWNLOAD_CHART") {
                            var downloadStatusArray1 = new Array();
                            for (var i = 0; i < data.getWidgetResp.WidgetList[0].Value.length; i++) {
                                var obj = new Object();

                                if (data.getWidgetResp.WidgetList[0].Value[i].ContentReplacedCount > 0) {
                                    obj.Date = data.getWidgetResp.WidgetList[0].Value[i].Date;
                                    obj.ContentReplacedCount = data.getWidgetResp.WidgetList[0].Value[i].ContentReplacedCount;
                                } if (data.getWidgetResp.WidgetList[0].Value[i].ContentReplaceFailedCount > 0) {
                                    obj.Date = data.getWidgetResp.WidgetList[0].Value[i].Date;
                                    obj.ContentReplaceFailedCount = data.getWidgetResp.WidgetList[0].Value[i].ContentReplaceFailedCount;
                                } if (data.getWidgetResp.WidgetList[0].Value[i].DownloadFailedCount > 0) {
                                    obj.Date = data.getWidgetResp.WidgetList[0].Value[i].Date;
                                    obj.DownloadFailedCount = data.getWidgetResp.WidgetList[0].Value[i].DownloadFailedCount;
                                } if (data.getWidgetResp.WidgetList[0].Value[i].DownloadStartedCount > 0) {
                                    obj.Date = data.getWidgetResp.WidgetList[0].Value[i].Date;
                                    obj.DownloadStartedCount = data.getWidgetResp.WidgetList[0].Value[i].DownloadStartedCount;
                                } if (data.getWidgetResp.WidgetList[0].Value[i].DownloadSuccessfulCount > 0) {
                                    obj.Date = data.getWidgetResp.WidgetList[0].Value[i].Date;
                                    obj.DownloadSuccessfulCount = data.getWidgetResp.WidgetList[0].Value[i].DownloadSuccessfulCount;
                                } if (data.getWidgetResp.WidgetList[0].Value[i].InstallFailedCount > 0) {
                                    obj.Date = data.getWidgetResp.WidgetList[0].Value[i].Date;
                                    obj.InstallFailedCount = data.getWidgetResp.WidgetList[0].Value[i].InstallFailedCount;
                                } if (data.getWidgetResp.WidgetList[0].Value[i].InstallPostponedCount > 0) {
                                    obj.Date = data.getWidgetResp.WidgetList[0].Value[i].Date;
                                    obj.InstallPostponedCount = data.getWidgetResp.WidgetList[0].Value[i].InstallPostponedCount;
                                } if (data.getWidgetResp.WidgetList[0].Value[i].InstallSuccessfulCount > 0) {
                                    obj.Date = data.getWidgetResp.WidgetList[0].Value[i].Date;
                                    obj.InstallSuccessfulCount = data.getWidgetResp.WidgetList[0].Value[i].InstallSuccessfulCount;
                                } if (data.getWidgetResp.WidgetList[0].Value[i].ScheduledCount > 0) {
                                    obj.Date = data.getWidgetResp.WidgetList[0].Value[i].Date;
                                    obj.ScheduledCount = data.getWidgetResp.WidgetList[0].Value[i].ScheduledCount;
                                } if (data.getWidgetResp.WidgetList[0].Value[i].ScheduleSentCount > 0) {
                                    obj.Date = data.getWidgetResp.WidgetList[0].Value[i].Date;
                                    obj.ScheduleSentCount = data.getWidgetResp.WidgetList[0].Value[i].ScheduleSentCount;
                                } if (data.getWidgetResp.WidgetList[0].Value[i].ScheduleConfirmedCount > 0) {
                                    obj.Date = data.getWidgetResp.WidgetList[0].Value[i].Date;
                                    obj.ScheduleConfirmedCount = data.getWidgetResp.WidgetList[0].Value[i].ScheduleConfirmedCount;
                                } if (data.getWidgetResp.WidgetList[0].Value[i].CancelledCount > 0) {
                                    obj.Date = data.getWidgetResp.WidgetList[0].Value[i].Date;
                                    obj.CancelledCount = data.getWidgetResp.WidgetList[0].Value[i].CancelledCount;
                                }
                                obj._type = "Download_Chart:#VHQCommon";
                                downloadStatusArray1.push(obj);
                            }

                            WidgetDataMap[widgetData.Identifier] = downloadStatusArray1;
                            setDataToCharts(id, index, widgetData, downloadStatusArray1, false);
                        }
                        else {
                            WidgetDataMap[widgetData.Identifier] = data.getWidgetResp.WidgetList[0].Value;
                        }
                        setDataToCharts(id, index, widgetData, data.getWidgetResp.WidgetList[0].Value, false);
                    } else {
                        setDataToCharts(id, index, widgetData, null, false);
                    }
                }
            }
            if (error) {
                $("#loader1").hide();
            }

        }
        var params = '{"token":"' + TOKEN() + '","getWidgetByIdReq":' + JSON.stringify(getWidgetByIdReq) + '}';
        customerData = JSON.parse(sessionStorage.getItem("customerData"));
        if(getWidgetByIdReq.SourceDbType==1 && customerData[0].IsMongoEnabled){
            ajaxJsonCall('GetWidgetById', params, callbackFunction, true, 'POST', true,true,'DashboardWidget');
        }
        else{
        ajaxJsonCall('GetWidgetById', params, callbackFunction, true, 'POST', true);
        }
    }



    function GetResultWidgetsById(widgetData, AlertSeverity, AlertStatus, dateObj) {

        var getWidgetByIdReq = new Object();
        getWidgetByIdReq = getParamforResultGrid(widgetData.Identifier, widgetData.WidgetSourceData.chart.APIDetails, dateObj, AlertSeverity, AlertStatus);

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                }
            }
        }
        var params = '{"token":"' + TOKEN() + '","getWidgetByIdReq":' + JSON.stringify(getWidgetByIdReq) + '}';
        ajaxJsonCall('GetWidgetById', params, callbackFunction, true, 'POST', true);
    }









    function getParam(identifier, APIDetails, dateObj, widgetData) {

        var getWidgetByIdReq = new Object();
        var dictionary = new Array();
        for (var i = 0; i < APIDetails.params.getWidgetByIdReq.WidgetParams.length; i++) {
            var DashBoardParamsFrom = new Object();

            DashBoardParamsFrom.PName = APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName;
            if (APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName == "From") {
                //var fromdate = moment().format('MM-DD-YYYY');

                var fromdate = moment().tz(name).format();
                DashBoardParamsFrom.PValue = fromdate;
                if (widgetData.CallType == 'day') {

                    //var fromdate = moment().subtract('days', 1).format('MM-DD-YYYY');
                    //  var fromdate = moment().tz(name).subtract('days', 1).format();
                    var date = moment().tz(name).subtract('days', 1).format('MM/DD/YYYY');
                    var minutes = "00";
                    var hours = "24";
                    var fromdate = getlocaldateForDashboard('from', date, hours, minutes);

                    DashBoardParamsFrom.PValue = fromdate;
                } else {
                    //var fromdate = moment().subtract('days', 7).format('MM-DD-YYYY');
                    //   var fromdate = moment().tz(name).subtract('days', 7).format();
                    var date = moment().tz(name).subtract('days', 7).format('MM/DD/YYYY');
                    var minutes = "00";
                    var hours = "24";
                    var fromdate = getlocaldateForDashboard('from', date, hours, minutes);

                    DashBoardParamsFrom.PValue = fromdate;

                }

            } else if (APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName == "To") {
                //var todate = moment().format('MM-DD-YYYY');
                // var todate = moment().tz(name).format();
                var date = moment().tz(name).format('MM/DD/YYYY');
                var minutes = "59";
                var hours = "23";
                var todate = getlocaldateForDashboard('to', date, hours, minutes);

                DashBoardParamsFrom.PValue = todate;

            }
            else {
                DashBoardParamsFrom.PValue = APIDetails.params.getWidgetByIdReq.WidgetParams[i].PValue;
            }
            dictionary.push(DashBoardParamsFrom);
        }

        getWidgetByIdReq.WidgetId = identifier;
        getWidgetByIdReq.WidgetParams = dictionary;
        getWidgetByIdReq.SourceDbType=widgetData.SourceDbType;








        return getWidgetByIdReq;
    }


    function getParamforDrildown(identifier, APIDetails, dateObj) {

        var getWidgetByIdReq = new Object();
        var dictionary = new Array();
        for (var i = 0; i < APIDetails.params.getWidgetByIdReq.WidgetParams.length; i++) {
            var DashBoardParamsFrom = new Object();

            DashBoardParamsFrom.PName = APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName;
            if (APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName == "From") {
                //var fromdate = moment().format('DD-MM-YYYY');
                //DashBoardParamsFrom.PValue = fromdate;
                DashBoardParamsFrom.PValue = dateObj.from;//"2015-10-19T18:30:00"; //AppConstants.get('FROMDATE');

            } else if (APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName == "To") {
                //var todate = moment().add('days', 7).format('DD-MM-YYYY');
                //DashBoardParamsFrom.PValue = todate;
                DashBoardParamsFrom.PValue = dateObj.to;//"2015-10-20T18:29:59.999";//AppConstants.get('TODATE');
            }
            else {
                DashBoardParamsFrom.PValue = APIDetails.params.getWidgetByIdReq.WidgetParams[i].PValue;
            }
            dictionary.push(DashBoardParamsFrom);
        }

        getWidgetByIdReq.WidgetId = identifier;
        getWidgetByIdReq.WidgetParams = dictionary;


        return getWidgetByIdReq;
    }

    function getParamforLIneDrilDown(identifier, dateObj) {

        var getWidgetByIdReq = new Object();
        var dictionary = new Array();

        var DashBoardParamsFrom = new Object();
        DashBoardParamsFrom.PName = "From";
        DashBoardParamsFrom.PValue = dateObj.from;
        dictionary.push(DashBoardParamsFrom);

        var DashBoardParamsTo = new Object();
        DashBoardParamsTo.PName = "To";
        DashBoardParamsTo.PValue = dateObj.to;
        dictionary.push(DashBoardParamsTo);

        var DashBoardParamsPackage = new Object();
        DashBoardParamsPackage.PName = "PackageType";
        DashBoardParamsPackage.PValue = "Software";
        dictionary.push(DashBoardParamsPackage);


        getWidgetByIdReq.WidgetId = identifier;
        getWidgetByIdReq.WidgetParams = dictionary;

        return getWidgetByIdReq;
    }


    function getParamforResultGrid(identifier, APIDetails, dateObj, AlertSeverity, AlertStatus, DownloadStatus, Status) {

        var getWidgetByIdReq = new Object();
        var dictionary = new Array();
        for (var i = 0; i < APIDetails.params.getWidgetByIdReq.WidgetParams.length; i++) {

            var DashBoardParamsFrom = new Object();

            DashBoardParamsFrom.PName = APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName;
            if (APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName == "From") {

                DashBoardParamsFrom.PValue = dateObj.from;

            } else if (APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName == "To") {

                DashBoardParamsFrom.PValue = dateObj.to;
            } else if (APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName == "AlertSeverity") {

                DashBoardParamsFrom.PValue = AlertSeverity;
            }
            else if (APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName == "AlertStatus") {

                DashBoardParamsFrom.PValue = AlertStatus;
            }
            else if (APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName == "DownloadStatus") {

                DashBoardParamsFrom.PValue = DownloadStatus;
            }
            else if (APIDetails.params.getWidgetByIdReq.WidgetParams[i].PName == "Status") {

                DashBoardParamsFrom.PValue = Status;
            }
            else {
                DashBoardParamsFrom.PValue = APIDetails.params.getWidgetByIdReq.WidgetParams[i].PValue;
            }
            dictionary.push(DashBoardParamsFrom);
        }

        getWidgetByIdReq.WidgetId = identifier;
        getWidgetByIdReq.WidgetParams = dictionary;


        return getWidgetByIdReq;
    }

    function GetWidgetsByIdForDrillDown(id, index, widgetData, dateObj) {




        // $("#drillDownHead").text(i18n.t(widgetData.Identifier, { lng: 'en' }))
        widgetId = widgetData.Identifier;

        var getWidgetByIdReq = new Object();


        var source = _.where(allDataArr, { Identifier: widgetData.WidgetSourceData.chart.DrilDownChart.APIDetails.Name });

        var source1 = _.where(allDataArr, { Identifier: widgetData.WidgetSourceData.GridDetails.APIDetails.Name });



        chartGridData = source1[0];

        var AlertSeverity = 'ALL';
        var AlertStatus = 'ALL';
        var DownloadStatus = 'All';
        var Status = 'All';
        var dateObjNew = new Object();

        var date = moment(peiDate).tz(name).subtract('days', 1).format('MM/DD/YYYY');
        var minutes = "00";
        var hours = "24";
        var fromDate = getlocaldate1(moment(date), hours, minutes);
        var fdate = createJSONTimeStamp(fromDate, LONG_DATETIME_FORMAT);
        //var fdate = getlocaldateForDashboard('from', date, hours, minutes);
        // var fdate = moment(peiDate).tz(name).subtract('days', 1).format();

        dateObjNew.from = fdate;//moment().subtract('days', 7).format('YYYY-MM-DD');

        var date = moment(peiDate).tz(name).format('MM/DD/YYYY');
        var minutes = "59";
        var hours = "23";
        var toDate = getlocaldate1(moment(date), hours, minutes);
        var tdate = createJSONTimeStamp(fromDate, LONG_DATETIME_FORMAT);
        //var tdate = getlocaldateForDashboard('to', date, hours, minutes);
        // var tdate = moment(peiDate).tz(name).format('YYYY-MM-DD');

        dateObjNew.to = tdate; //moment().format('YYYY-MM-DD');
        //var param = getParamforResultGrid(chartGridData.Identifier, chartGridData.WidgetSourceData.chart.APIDetails, dateObjNew, AlertSeverity, AlertStatus, DownloadStatus, Status);
        var obj = new Object();

        window.sessionStorage.removeItem('chartGrid' + 'gridStorage');

        if (widgetId == "SW_ALERT_CHART") {
            var param = getAlertResultsDetailsForDashboardParam(false, chartGridData.Identifier, chartGridData.WidgetSourceData.chart.APIDetails, dateObjNew, AlertSeverity, AlertStatus, DownloadStatus, Status, []);
            obj.getAlertResultsDetailsReq = param;
        }
        else if (widgetId == "SW_DOWNLOAD_CHART") {
            var param = getJobDownloadResultsDetailsForDashboardParam(false, chartGridData.Identifier, chartGridData.WidgetSourceData.chart.APIDetails, dateObjNew, AlertSeverity, AlertStatus, DownloadStatus, Status, []);
            obj.getDownloadResultsDetailsReq = param;
        }

        obj.token = TOKEN();
        param = obj;

        var datelable = moment(peiDate).format('DD MMMM');

        //var params = '{"token":"' + TOKEN() + '","getWidgetByIdReq":' + JSON.stringify(getWidgetByIdReq) + '}';
        $("#chartGridMainDiv").empty();
        var str = '<div id="chartGrid"  />';
        $("#chartGridMainDiv").append(str);
        if (chartGridData.WidgetSourceData.chart.APIDetails.Columns != undefined) {
            //if (chartGridData.Identifier == 'SW_ALERT_RESULT') {
            //    $("#resultLable").text(i18n.t('all_open_alerts', { lng: 'en' }));
            //} else {
            $("#resultLable").text(i18n.t(chartGridData.Identifier, { lng: 'en' }) + '  ' + datelable);
            $("#drillDownHead").text(i18n.t(chartGridData.Identifier, { lng: 'en' }) + ' ' + datelable);
            //}
            showResultGrid('chartGrid', param, chartGridData, null, widgetData.Identifier);
        }



        getWidgetByIdReq = getParamforDrildown(widgetData.WidgetSourceData.chart.DrilDownChart.APIDetails.Name, source[0].WidgetSourceData.chart.APIDetails, dateObj);
        function callbackFunction(data, error) {



            ///////////////
            $("#backchart" + index).addClass('show');
            checkDrilDown = 1;
            $("#expandpA" + index).addClass('hide');
            $("#colpA" + index).addClass('hide');
            $("#removepA" + index).addClass('hide');

            $("#expandpARight" + index).addClass('hide');
            $("#colpARight" + index).addClass('hide');
            $("#removepARight" + index).addClass('hide');

            $("#backchart" + index).removeClass('hide');

            $("#backchartRight" + index).addClass('show');
            $("#backchartRight" + index).removeClass('hide');
            $('#legendElementRight' + index).css("display", "none");
            $('#showHintRight' + index).css("display", "block");
            $('#legendElement' + index).css("display", "none");
            $('#showHint' + index).css("display", "block");

            if (expandrilcheck == 1) {

                $("#expandDril" + id).removeClass("panel-expand");
                $("#expandDril" + id).addClass("panel-sm-expand");
            } else {
                $("#expandDril" + id).toggleClass("panel-sm-expand");
            }

            $(".overflow-strip").toggleClass("displayBlock");

            $(".dash-filter-area").toggleClass("displayBlock");
            /////////
            $("#openDrillDiv").removeClass('hide');
            $(".panel-body").css("height", 'auto');

            //$("#expandDrilplaceholder" + index).draggable({ 'disable': true });

            //$("#expandDrilplaceholderRight" + index).draggable({ 'disable': true });




            if (data) {

                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                    if (data && data.getWidgetResp) {
                        data.getWidgetResp = $.parseJSON(data.getWidgetResp);
                    }
                    data.getWidgetResp.WidgetList = mapObjectToArray(data.getWidgetResp.WidgetList);

                    if (data.getWidgetResp.WidgetList[0].Value != null) {

                        var data = data.getWidgetResp.WidgetList[0].Value;

                        if (widgetData.WidgetSourceData.chart.DrilDownChart.type == AppConstants.get('BAR_CHART')) {
                            if (data) {
                                if (widgetData.WidgetSourceData.chart.dataFeilds.XField == 'Date') {
                                    if (widgetData.Identifier != 'SW_REPORT_CHART') {
                                        for (var i = 0; i < data.length; i++) {
                                            data[i].Date = jsonDateConversion(data[i].Date, "DD MMM");
                                        }
                                    }
                                }
                            }
                            barchart(id, index, widgetData, data);
                        } else if (widgetData.WidgetSourceData.chart.type == AppConstants.get('DONUT_CHART')) {
                            donutChart(id, index, widgetData, data);
                        } else if (widgetData.WidgetSourceData.chart.DrilDownChart.type == AppConstants.get('STACKBAR_CHART')) {
                            stackChart(id, index, widgetData, data);
                        } else if (widgetData.WidgetSourceData.chart.DrilDownChart.type == AppConstants.get('PIE_CHART')) {
                            var cArr = new Array();
                            var newdata = new Array();
                            //data[0].LowAlertCount = 1;
                            //data[0].HighAlertCount = 6;
                            //data[0].MediumAlertCount = 1303;



                            $.each(data[0], function (key, element) {

                                var obj = new Object();
                                if ($.inArray(key, source[0].WidgetSourceData.chart.APIDetails.Response.fields) >= 0) {
                                    if (element != 0) {
                                        obj.Name = AppConstants.get(key);
                                        obj.Count = element;
                                        newdata.push(obj);
                                        cArr.push(source[0].WidgetSourceData.chart.colorArr[0][key]);
                                    }

                                }


                            });

                            //alert("cArr   " + JSON.stringify(cArr))


                            pieChart(id, index, source[0], newdata, cArr);
                        } else if (widgetData.WidgetSourceData.chart.DrilDownChart.type == AppConstants.get('LINE_CHART')) {

                            lineChart(id, index, widgetData, data);
                        }
                    } else {
                        var data = [];
                        pieChart(id, index, widgetData, data, [], true);
                    }
                    $("#loader1").hide();
                    $("#loadingDiv").hide();
                } else if (data.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR')) {
                    $("#loader1").hide();
                } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                    $("#loader1").hide();
                    Token_Expired();
                }
            }
            if (error) {
                $("#loader1").hide();
            }
        }
        var params = '{"token":"' + TOKEN() + '","getWidgetByIdReq":' + JSON.stringify(getWidgetByIdReq) + '}';
        ajaxJsonCall('GetWidgetById', params, callbackFunction, true, 'POST', true);
    }



    function callForRefreshDrillDown(id, index, widgetData, dateObj) {
        //$("#loader1").hide();
        //$("#loadingDiv").hide();
        var getWidgetByIdReq = new Object();

        var source = _.where(allDataArr, { Identifier: widgetData.WidgetSourceData.chart.DrilDownChart.APIDetails.Name });

        var source1 = _.where(allDataArr, { Identifier: widgetData.WidgetSourceData.GridDetails.APIDetails.Name });



        chartGridData = source1[0];

        var AlertSeverity = 'ALL';
        var AlertStatus = 'ALL';
        var DownloadStatus = 'All';
        var Status = 'All';
        var dateObjNew = new Object();

        var date = moment(peiDate).tz(name).subtract('days', 1).format('MM/DD/YYYY');
        var minutes = "00";
        var hours = "24";
        var fromDate = getlocaldate1(moment(peiDate), hours, minutes);
        var fdate = createJSONTimeStamp(fromDate, LONG_DATETIME_FORMAT);
        //var fdate = getlocaldateForDashboard('from', date, hours, minutes);
        //var fdate = moment(peiDate).tz(name).subtract('days', 1).format();

        dateObjNew.from = fdate;//moment().subtract('days', 7).format('YYYY-MM-DD');

        var date = moment(peiDate).tz(name).format('MM/DD/YYYY');
        var minutes = "59";
        var hours = "23";
        var toDate = getlocaldate1(moment(peiDate), hours, minutes);
        var tdate = createJSONTimeStamp(fromDate, LONG_DATETIME_FORMAT);

        //var tdate = getlocaldateForDashboard('to', date, hours, minutes);
        //var tdate = moment(peiDate).tz(name).format();

        dateObjNew.to = tdate; //moment().format('YYYY-MM-DD');
        //var param = getParamforResultGrid(chartGridData.Identifier, chartGridData.WidgetSourceData.chart.APIDetails, dateObjNew, AlertSeverity, AlertStatus, DownloadStatus, Status);

        var obj = new Object();
        if (widgetId == "SW_ALERT_CHART") {
            var param = getAlertResultsDetailsForDashboardParam(false, chartGridData.Identifier, chartGridData.WidgetSourceData.chart.APIDetails, dateObjNew, AlertSeverity, AlertStatus, DownloadStatus, Status, []);
            obj.getAlertResultsDetailsReq = param;
        }
        else if (widgetId == "SW_DOWNLOAD_CHART") {
            var param = getJobDownloadResultsDetailsForDashboardParam(false, chartGridData.Identifier, chartGridData.WidgetSourceData.chart.APIDetails, dateObjNew, AlertSeverity, AlertStatus, DownloadStatus, Status, []);
            obj.getDownloadResultsDetailsReq = param;
        }

        obj.token = TOKEN();
        param = obj;

        var datelable = moment(peiDate).format('DD MMM');

        //var State = $("#chartGrid").jqxGrid('savestate');
        gridRefresh('chartGrid');

        //$("#chartGridMainDiv").empty();
        //var str = '<div id="chartGrid"  />';
        //$("#chartGridMainDiv").append(str);
        //if (chartGridData.WidgetSourceData.chart.APIDetails.Columns != undefined) {
        //    $("#resultLable").text(i18n.t(chartGridData.Identifier, { lng: 'en' }) + '  ' + datelable);


        //    showResultGrid('chartGrid', param, chartGridData, null, widgetId);


        //}

        getWidgetByIdReq = getParamforDrildown(widgetData.WidgetSourceData.chart.DrilDownChart.APIDetails.Name, source[0].WidgetSourceData.chart.APIDetails, dateObj);
        function callbackFunction(data, error) {



            if (data && data.getWidgetResp) {
                data.getWidgetResp = $.parseJSON(data.getWidgetResp);
            }

            data.getWidgetResp.WidgetList = mapObjectToArray(data.getWidgetResp.WidgetList);

            if (data) {

                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                    if (data.getWidgetResp.WidgetList[0].Value != null) {

                        var data = data.getWidgetResp.WidgetList[0].Value;


                        if (widgetData.WidgetSourceData.chart.DrilDownChart.type == AppConstants.get('PIE_CHART')) {
                            var cArr = new Array();
                            var newdata = new Array();
                            $.each(data[0], function (key, element) {

                                var obj = new Object();
                                if ($.inArray(key, source[0].WidgetSourceData.chart.APIDetails.Response.fields) >= 0) {
                                    if (element != 0) {
                                        obj.Name = AppConstants.get(key);
                                        obj.Count = element;
                                        newdata.push(obj);
                                        cArr.push(source[0].WidgetSourceData.chart.colorArr[0][key]);
                                    }

                                }


                            });

                            pieChart(id, index, source[0], newdata, cArr);
                        }
                    } else {
                        var data = [];
                        pieChart(id, index, widgetData, data, [], true);
                    }
                    $("#loader1").hide();
                    $("#loadingDiv").hide();
                } else if (data.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR')) {
                    $("#loader1").hide();
                } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                    $("#loader1").hide();
                    Token_Expired();
                }
            }
            if (error) {
                $("#loader1").hide();
            }
        }
        var params = '{"token":"' + TOKEN() + '","getWidgetByIdReq":' + JSON.stringify(getWidgetByIdReq) + '}';
        ajaxJsonCall('GetWidgetById', params, callbackFunction, true, 'POST', false);
    }

    function DrillDownForLineChart(id, index, widgetData, dateObj, data) {
        //apiGrid('chartGrid', widgetData.Identifier, dateObj);
        getAlertresultGridData('chartGrid', widgetData.Identifier, dateObj)
        //var getWidgetByIdReq = new Object();
        //getWidgetByIdReq = getParamforLIneDrilDown(widgetData.Identifier, dateObj);
        $("body").removeClass("page-sidebar-minified");
        $(".collapsible").removeClass("collapsible-mini");
        $("#backchart" + index).toggleClass('hide');
        checkDrilDown = 1;
        $("#expandpA" + index).addClass('hide');
        $("#colpA" + index).addClass('hide');
        $("#removepA" + index).addClass('hide');
        $("#backchart" + index).removeClass('hide');
        $("#expandDril" + id).toggleClass("panel-sm-expand");
        $(".overflow-strip").toggleClass("displayBlock");
        $(".dash-filter-area").toggleClass("displayBlock");

        if (data) {
            var dataarray = new Array();
            //if (widgetData.WidgetSourceData.chart.dataFeilds.XField == 'Date') {


            var obj = new Object();
            obj.Date = 'High Alert';
            obj.DeviceCount = data[0].HighAlertCount;
            dataarray.push(obj);
            var obj = new Object();
            obj.Date = 'Low Alert';
            obj.DeviceCount = data[0].LowAlertCount;
            dataarray.push(obj);
            var obj = new Object();
            obj.Date = 'Medium Alert';
            obj.DeviceCount = data[0].MediumAlertCount;
            dataarray.push(obj);


            //}
            data = dataarray;

        }

        pieChartForLine(id, index, widgetData, data);


    }


    function getParamFroGrid(identifier, dateObj) {
        var getWidgetByIdReq = new Object();
        var dictionary = new Array();

        var DashBoardParamsFrom = new Object();
        DashBoardParamsFrom.PName = "From";
        DashBoardParamsFrom.PValue = '05-01-2015';//dateObj.from;
        dictionary.push(DashBoardParamsFrom);

        var DashBoardParamsTo = new Object();
        DashBoardParamsTo.PName = "To";
        DashBoardParamsTo.PValue = '05-07-2015';//dateObj.to;
        dictionary.push(DashBoardParamsTo);
        if (identifier == AppConstants.get('ALERT_RESULT')) {
            var DashBoardParamsAlertSeverity = new Object();
            DashBoardParamsAlertSeverity.PName = "AlertSeverity";
            DashBoardParamsAlertSeverity.PValue = "Low";
            dictionary.push(DashBoardParamsAlertSeverity);

            var DashBoardParamsAlertStatus = new Object();
            DashBoardParamsAlertStatus.PName = "AlertStatus";
            DashBoardParamsAlertStatus.PValue = "Open";
            dictionary.push(DashBoardParamsAlertStatus);
        } else {
            var DashBoardParamsPackage = new Object();
            DashBoardParamsPackage.PName = "PackageType";
            DashBoardParamsPackage.PValue = "Software";
            dictionary.push(DashBoardParamsPackage);

        }
        getWidgetByIdReq.WidgetId = identifier;
        getWidgetByIdReq.WidgetParams = dictionary;

        return getWidgetByIdReq;
    }


    function getAlertresultGridData(gID, identifier, dateObj) {

        var getWidgetByIdReq = new Object();
        var dictionary = new Array();

        var DashBoardParamsFrom = new Object();
        DashBoardParamsFrom.PName = "From";
        DashBoardParamsFrom.PValue = '05-01-2015';//dateObj.from;
        dictionary.push(DashBoardParamsFrom);

        var DashBoardParamsTo = new Object();
        DashBoardParamsTo.PName = "To";
        DashBoardParamsTo.PValue = '05-07-2015';//dateObj.to;
        dictionary.push(DashBoardParamsTo);

        var DashBoardParamsAlertSeverity = new Object();
        DashBoardParamsAlertSeverity.PName = "AlertSeverity";
        DashBoardParamsAlertSeverity.PValue = "Low";
        dictionary.push(DashBoardParamsAlertSeverity);

        var DashBoardParamsAlertStatus = new Object();
        DashBoardParamsAlertStatus.PName = "AlertStatus";
        DashBoardParamsAlertStatus.PValue = "Open";
        dictionary.push(DashBoardParamsAlertStatus);

        getWidgetByIdReq.WidgetId = 'ALERT_RESULT';
        getWidgetByIdReq.WidgetParams = dictionary;

        //$("#loadingDiv").show();
        function callbackFunction(data, error) {
            if (data && data.getWidgetResp) {
                data.getWidgetResp = $.parseJSON(data.getWidgetResp);
            }

            data.getWidgetResp.WidgetList = mapObjectToArray(data.getWidgetResp.WidgetList);

            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.getWidgetResp.WidgetList[0].Value != null) {
                        var data = data.getWidgetResp.WidgetList[0].Value;
                        apiGrid(gID, data);
                    }
                }
            }
        }
        var params = '{"token":"' + TOKEN() + '","getWidgetByIdReq":' + JSON.stringify(getWidgetByIdReq) + '}';
        ajaxJsonCall('GetWidgetById', params, callbackFunction, true, 'POST', true);

    }


    function apiGrid(gID, data) {

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
        window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
        var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

        var source = {
            dataType: 'json',
            localdata: data,
            datafields: [
                { name: 'isSelected', type: 'number' },
                { name: 'UniqueDeviceId', map: 'DeviceDetail>UniqueDeviceId' },
                { name: 'AlertTypeId', map: 'AlertTypeId' },
                { name: "SerialNumber", map: 'DeviceDetail>SerialNumber', type: 'string' },
                { name: 'DeviceId', map: 'DeviceDetail>DeviceId' },
                { name: 'PREVIOUSHIERARCHYNAME', map: 'PREVIOUSHIERARCHYNAME', type: 'string' },
                { name: 'HierarchyFullPath', map: 'DeviceDetail>HierarchyFullPath', type: 'string' },
                { name: 'ComputedDeviceStatus', map: 'DeviceDetail>ComputedDeviceStatus', type: 'string' },
                { name: 'ModelName', map: 'DeviceDetail>ModelName', type: 'string' },
                { name: 'EventReceivedDate', map: 'EventReceivedDate', type: 'date' },
                { name: 'EventRaisedDate', map: 'EventRaisedDate', type: 'date' },
                { name: 'Severity', map: 'Severity', type: 'string' },
                { name: 'AlertName', map: 'AlertName', type: 'string' },
                { name: 'Description', map: 'Description', type: 'string' },
                { name: 'IsNoteExists', map: 'IsNoteExists' },
                { name: 'Notes', map: 'Notes', type: 'string' },
                { name: 'DeviceAlertId', map: 'DeviceAlertId' }

            ],
        }
        var dataAdapter = new $.jqx.dataAdapter(source);

        var rendered = function (element) {

            //enablegridfunctions(gID, 'DeviceAlertId', element, gridStorage, false, 'pagerChartGrid', true, 0, 'DeviceAlertId', null, null, null);
            enableUiGridFunctions(gID, 'DeviceAlertId', element, gridStorage, true);
            return true;
        }

        function SerialNoRendereOpenAlert(row, columnfield, value, defaulthtml, columnproperties) {
            var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
            return html;
        }
        var buildFilterPanel = function (filterPanel, datafield) {
            //genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

        }
        var buildFilterPanelMultiChoice = function (filterPanel, datafield, checkArr) {
            //genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
            multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gID, checkArr, true);
        }

        var buildFilterPanelUiDate = function (filterPanel, datafield) {
            // wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID,true);
            genericBuildFilterPanelFordateUI(filterPanel, datafield, dataAdapter, gID, "isUIDateFilter");
        }


        $("#" + gID).jqxGrid(
            {
                width: "100%",
                height: '210px',
                source: dataAdapter,
                sortable: true,
                filterable: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                pagesize: data.length,
                altrows: true,
                autoshowcolumnsmenubutton: false,
                showsortmenuitems: false,
                enabletooltips: true,
                editable: true,
                columnsResize: true,
                ready: function () {

                },
                autoshowfiltericon: true,
                columns: [
                    {
                        text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },

                    {
                        text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', editable: false, minwidth: 130, enabletooltips: false,
                        filtertype: "custom", cellsrenderer: SerialNoRendereOpenAlert,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', editable: false, minwidth: 80, width: 'auto', enabletooltips: false,
                        filtertype: "custom", cellsrenderer: SerialNoRendereOpenAlert,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('from_hierarchy_path', { lng: lang }), datafield: 'PREVIOUSHIERARCHYNAME', editable: false, minwidth: 150,
                        filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath', editable: false, minwidth: 150,
                        filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('model', { lng: lang }), datafield: 'ModelName', editable: false, enabletooltips: false, minwidth: 80,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            var checkArr = getMultiCoiceFilterArr('Model');
                            buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
                        }
                    },
                    {
                        text: i18n.t('dev_status', { lng: lang }), dataField: 'ComputedDeviceStatus', editable: false, minwidth: 120,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            var checkArr = getMultiCoiceFilterArr('Device Status');
                            buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
                        }
                    },
                    {
                        text: i18n.t('received_date', { lng: lang }), dataField: 'EventReceivedDate', filtertype: 'date', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 160, enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('raised_date', { lng: lang }), datafield: 'EventRaisedDate', filtertype: 'date', cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, minwidth: 160, enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('severity', { lng: lang }), datafield: 'Severity', editable: false, enabletooltips: false, minwidth: 80,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            //buildFilterPanelMultiChoice(filterPanel, datafield, 'Severity');
                            var checkArr = getMultiCoiceFilterArr('Severity');
                            buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
                        }
                    },
                    {
                        text: i18n.t('alert_type', { lng: lang }), datafield: 'AlertName', enabletooltips: true, editable: false, minwidth: 100,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            //buildFilterPanelMultiChoice(filterPanel, datafield, 'Alerts');
                            var checkArr = getMultiCoiceFilterArr('Alerts');
                            buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
                        }
                    },
                    {
                        text: i18n.t('description', { lng: lang }), datafield: 'Description', editable: false, minwidth: 100,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                ],
            });
        //$("#loadingDiv").show();

        $("#loadingDiv").hide();

        //
        //getGridBiginEdit(gID, 'DeviceAlertId', gridStorage);

        //callGridFilter(gID, gridStorage);
        //callGridSort(gID, gridStorage, 'DeviceAlertId');
        getUiGridBiginEdit(gID, 'DeviceAlertId', gridStorage);
        callUiGridFilter(gID, gridStorage);
    }

});

function calldrilontooltip(index, id, elementIndex, xfield) {

    funtionfortolltipclick(index, id, elementIndex, xfield);
}

function calldrilontooltip(index, id, elementIndex, xfield) {

    funtionfortolltipclick(index, id, elementIndex, xfield);
}

