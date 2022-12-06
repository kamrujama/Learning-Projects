requirejs.config({
    baseUrl: 'js',
    "waitSeconds": 0,
    paths: {
        'jquery': 'plugin/jquery-3.5.1.min',
        'jquery-ui': 'plugin/jquery-ui-1.13.2/jquery-ui.min',
        'jQuery.base64': 'plugin/jQuery.base64',
        'jquery.nicescroll.min': 'plugin/jquery.nicescroll.min',
        'chosen': 'plugin/chosen/chosen.jquery.min',
        'gritter': 'plugin/gritter/js/jquery.gritter.min',
        'spinner': 'plugin/spinner/jquery.spinner',
        'knockout': 'plugin/knockout-3.5.1.min',
        'i18next': 'plugin/i18next-1.6.3.min',
        'popper': 'plugin/popper.min',
        'bootstrap': 'plugin/bootstrap.min',
        'bootstrapDatePicker': 'plugin/datepicker/bootstrap-datepicker',
        'bootstrapDateTimePicker': 'plugin/datetimepicker/bootstrap-datetimepicker',        
        'sammy.min': 'plugin/sammy.min',
        'knockout.validation': 'plugin/knockout.validation.min',
        'knockout.mapping': 'plugin/knockout.mapping',
        'momentTimeZone': 'plugin/jstz-1.0.4.min',
        'moment': 'plugin/moment.min',
        'timeZone': 'plugin/moment_timezone',
        'koUtil': 'knockoutUtil',
        'toaster': 'plugin/toaster/toaster',
        'advancedSearchUtil': 'advancedSearchUtil',
        'autho': 'authorization',
        'constants': 'appConstants',
        'jqx': 'plugin/jqwidgets/jqx-all',
        'timepicker': 'plugin/datepicker/bootstrap-timepicker.min',
        'xmltojson': 'xml2json',
        'globalFunction': 'global',        
        'maxlength': 'plugin/maxlength',
        'utility': 'utilities',
        'gridUtility': 'gridUtility',
        'ParamUtils': 'ParamUtils',
        'appEnum': 'AppEnum',
		'deviceUtility': 'deviceUtility',
        'underscore': 'plugin/underscore-min',
        'soapclient': 'plugin/soapclient',
        'video': 'video',
        'download': 'download'
    },
    "shim": {
        "constants": ["moment"],
        "gridUtility": ["constants"]
    }
});

require(["../controller/index", "knockout", "koUtil", "jquery","i18next", "gritter", "autho","jquery-ui","popper","bootstrap", "globalFunction", "underscore", "jquery.nicescroll.min", "spinner", "jqx", "timepicker", "xmltojson", "toaster","momentTimeZone","timeZone"], function (model, ko, koUtil, $, i18,_, autho) {

    if (sessionStorage.getItem("userrData") == null || sessionStorage.getItem("userrData") == "" ||
        sessionStorage.getItem("customerData") == null || sessionStorage.getItem("customerData") == "") {
        Token_Expired();
    } else {
        ko.applyBindings(new model());
        try {
            i18n.init({
                "lng": 'en',
                "debug": true,
                "fallbackLng": 'en',
                "resGetPath": AppConstants.get('LOCALIZEDPATH') + '/__ns__-__lng__.json',
                ns: {
                    namespaces: ['resource'],
                    defaultNs: 'resource'
                }
            }, function (call) {
                $(document).i18n();
            });
        }
        catch (err) {
        }
        $(".sidebar .nav > .has-sub > a").click(function () {
            var e = $(this).next(".sub-menu");
            var t = ".sidebar .nav > li.has-sub > .sub-menu";
            if ($(".page-sidebar-minified").length === 0 || $(".page-sidebar-minified").length === 1) {
                $(t).not(e).slideUp(250, function () {
                    $(this).closest("li").removeClass("expand active")
                    $(this).closest("li").children("a").removeClass('arrow-open')
                });
                var m = $(e).closest("ul").text();
                if (m.includes("Reports")) {
                    if (!$("body").hasClass("page-sidebar-minified")) {
                        $('#sidebar').css('width', '410px');
                        $('#mainScrenContent').css('margin-left', '180px');
                    }
				} 
                if (m == "") {
                    var n = $(e).closest("li")

                    if ($(n).hasClass("active")) {
                        $(n).removeClass("active");
                        $(n).children("a").removeClass("arrow-open")
                    } else {

                        $(n).addClass("active")
                        $(n).addClass("active-1")
                        $(n).children("a").addClass("arrow-open")
                    }
                } else {
                    $(e).slideToggle(250, function () {
                        var e = $(this).closest("li");

                        if ($(e).hasClass("expand active") || $(e).hasClass("active expand")) {
                            $(e).removeClass("expand ")
                            $(e).children("a").removeClass('arrow-open')
                        } else {

                            $(e).addClass("expand active")
                            $(e).children("a").addClass('arrow-open')

                        }
                    })
                }

            }
        });

        $(".sidebar .nav > .has-sub .sub-menu li.has-sub > a").click(function () {

            if ($(".page-sidebar-minified").length === 0) {
                var e = $(this).next(".sub-menu");
                $(e).slideToggle(250)
                if ($(this).closest("li").children("a").hasClass('arrow-open')) {
                    $(this).closest("li").children("a").removeClass('arrow-open');
                } else {
                    $(this).closest("li").children("a").addClass('arrow-open');
                }
            }
        });

        $(".sidebar .nav > .has-sub .sub-menu li.has-sub  > ul  li ").click(function () {
            //alert('lll' + $(this).children('ul').html());
            if ($(this).children('ul').html() == '') {
                //alert('no child');
            } else {
                //alert('yes child');
                $(this).children('a').removeClass('active');
            }
            //$(this).children('a').removeClass('active');
            //if ($(".page-sidebar-minified").length === 0) {
            var e = $(this).next(".sub-menu");

            $(e).slideToggle(250)
            //$(this).children("a").addClass('arrow-open')
            if ($(this).closest("li").children("a").hasClass('arrow-open')) {

                $(this).closest("li").children("a").removeClass('arrow-open');
            } else {
                $(this).closest("li").children("a").addClass('arrow-open');
            }
            //alert($(this).children("a").html());
            $(this).parent('ul').children('li').each(function () {
                //alert($(this).html());
            });
            if ($(this).children("a").hasClass('arrow-open')) {
                $(this).children("a").removeClass('arrow-open')
            } else {
                $(this).children("a").addClass('arrow-open')
            }

            //}
        });



        $("#notifiCation").on('click', function () {
            var gridID = $('.jqx-grid').attr('id');
            //grid refresh
            if (gridID == undefined) {

            } else {
                $("#" + gridID).jqxGrid('closemenu');

            }

        });

        $(".navbar-minimalize").click(function () {
            $("body").toggleClass("page-sidebar-minified");
            $(".collapsible").toggleClass("collapsible-mini");
            $(".fixed-footer").toggleClass("fixed-footer-l0");
            $(".widget-panel").removeClass("wp-open");
            $("body").removeClass("widget-panel-o");
            $(".wpa-btn").removeClass("wpa-btn-r");
            var gridID = $('.jqx-grid').attr('id');
            checkloadingforDeviceSearch = 0;
            checkloadingforContent = 0;

            if (koUtil.isDeviceProfileScreen == "DeviceProfile") {
                if (koUtil.isDeviceDetails == "DeviceDetails" || koUtil.isDeviceDetails == "DiagnosticProfile") {

                    if (setIdForDeviceDetailsTab == undefined) {
                    } else {
                        //if (setIdForDeviceDetailsTab != 'chartGrid') {
                        //    setTimeout(function () {
                        //        $("#" + setIdForDeviceDetailsTab).jqxGrid('refresh');
                        //    }, 500);                            
                        //}
                        //if (setIdForDeviceDetailsTab == "datagridConnectivityBluetoothGridDiv") {
                        //    setTimeout(function () {
                        //        $("#datagridConnectivityWiFiGridDiv").jqxGrid('refresh');
                        //    }, 500);
                        //}
                        $("#btnRefresh").click();
                    }

                } else {
                    if (gridID == undefined) {

                    } else {
                        if (gridID != 'chartGrid') {
                            setTimeout(function () {

                                $("#" + gridID).jqxGrid('updatebounddata');
                                $("#" + gridID).jqxGrid('refresh');
                            }, 500);
                        }

                    }
                }
            } else {
                if (gridID == undefined) {
                } else {
                    if (gridID != 'chartGrid') {
                        setTimeout(function () {

                            $("#" + gridID).jqxGrid('updatebounddata');
                            $("#" + gridID).jqxGrid('refresh');
                        }, 500);
                    }

                }
            }

            if ($("body").hasClass("page-sidebar-minified")) {
                $('.hidechildHeader').addClass('showchildHeader');
                $('.hidechildHeader').removeClass('hidechildHeader');
                $('#sidebar').removeClass('scroll-y-overflow');

                $("#sidebar").removeClass("scrolloverflow");
                $('#sidebar').removeClass('sidebar-left');
                $('#sidebar').css('width', 'auto');
                $('#mainScrenContent').css('margin-left', '0px');
            } else {
                $('.showchildHeader').addClass('hidechildHeader');
                $('.showchildHeader').removeClass('showchildHeader');
                $('#sidebar').addClass('scroll-y-overflow');
                $("#counterbtn").show();
                $("#counterbtn").attr('title', 'Expand counter widgets')
                $("#standardbtn").show();
                $("#standardbtn").attr('title', 'Expand standard widgets')
                $("#sidebar").addClass("scrolloverflow");
				$('#sidebar').addClass('sidebar-left');
            }

            var chartID = $('.jqx-ChartNavbarCollapse').attr('id');


            //// chart refresh
            if (chartID == undefined) {

            } else {
                setTimeout(function () { $("#" + chartID).jqxChart('refresh'); }, 500);

            }


            //grid refresh
            //if (gridID == undefined) {

            //} else {
            //    if (gridID != 'chartGrid') {
            //        setTimeout(function () {

            //            $("#" + gridID).jqxGrid('updatebounddata');
            //            $("#" + gridID).jqxGrid('refresh');
            //        }, 500);
            //    }

            //}
            refreshonCollapseOnIndex();

            if ($("#jqxgridForUserDetails").attr('id') != undefined) {
                setTimeout(function () {
                    $("#jqxgridForUserDetails").jqxGrid('updatebounddata');
                }, 500);
            }
            if ($("#jqxgridForRightsDetails").attr('id') != undefined) {
                setTimeout(function () {
                    $("#jqxgridForRightsDetails").jqxGrid('updatebounddata');
                }, 500);
            }
        });
        $(".btn-view-profile").click(function () {
            $(".profile-view").hide();
            $(".profile-edit").show();
        });
        $(".btn-edit-c").click(function () {
            $(".profile-view").show();
            $(".profile-edit").hide();
        });
        $(".btn-list").click(function () {
            $(".panel-two").toggleClass("panel-two-c");
            $(".panel-one").toggleClass("panel-one-c");
        });
        $(".v-table-list > li > a").click(function () {

        });





        $(".slimScroll").niceScroll({ cursorborder: "", cursorcolor: "#000", cursoropacitymax: 0.4, boxzoom: false, touchbehavior: true });

        function refreshonCollapseOnIndex() {
            if ($("#placeholder0").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder0").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder1").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder1").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder2").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder2").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder3").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder3").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder4").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder4").jqxChart('refresh');
                }, 1000);

            }
            if ($("#placeholder5").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder5").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder6").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder6").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder7").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder7").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder8").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder8").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholder9").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholder9").jqxChart('refresh');
                }, 1000);
            }
            /////for right
            if ($("#placeholderRight0").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight0").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight1").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight1").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight2").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight2").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight3").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight3").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight4").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight4").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight5").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight5").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight6").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight6").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight7").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight7").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight8").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight8").jqxChart('refresh');
                }, 1000);
            }
            if ($("#placeholderRight9").attr('id') != undefined) {
                setTimeout(function () {
                    $("#placeholderRight9").jqxChart('refresh');
                }, 1000);
            }
        }

        ///////////////////////////Rights related changes///////////////////////


        var isUserAdminAllowed = false;
        var isRoleAdminAllowed = false;
        var isHierarchyAssignmentAllowed = false;
        var isAlertAdminAllowed = false;
        var isConfigSettingsAllowed = false;
        var isAuditLogAllowed = false;
        var isSourceIpValidationAllowed = false;
        var isLicenseDetailsAllowed = false;
        var isDeviceStatusAllowed = false;
        var isGroupAssignmentAllowed = false;
        var isSponsorAllowed = false;
        var isKeyHandleAllowed = false;

        var isDevicesAllowed = false;
        var isAlertsAllowed = false;
        var isDownloadLibraryAllowed = false;
        var isSwapAllowed = false;
        var isReportandChartAllowed = false;
        var isDownloadScheduleAllowed = false;
        var isDiagnosticsScheduleAllowed;

        var isContentLibraryAllowed = false;
        var isDeliveryReportAllowed = false;
        var isContentSchedulerAllowed = false;
        var isChartDownloadsAllowed = false;
        var isReportViewAllowed = false;
		var isCareViewAllowed = false;
		
        var isTroubleShootAllowed = false;

        function updateMenusBasedOnUserSecurity() {

            //Administration
            isUserAdminAllowed = userHasViewAccess("Roles and Users");
            isRoleAdminAllowed = userHasViewAccess("Roles and Users");
            isHierarchyAssignmentAllowed = userHasViewAccess("Groups and Hierarchies");
            isAlertAdminAllowed = userHasViewAccess("Alerts");
            isConfigSettingsAllowed = userHasViewAccess("System Settings");
            isAuditLogAllowed = userHasViewAccess("Audit Logs");
            isSourceIpValidationAllowed = userHasViewAccess("System Settings");
            isDeviceStatusAllowed = userHasViewAccess("Devices");
            isLicenseDetailsAllowed = userHasViewAccess("Basic Access");
            isGroupAssignmentAllowed = userHasViewAccess("Groups and Hierarchies");
            isSponsorAllowed = userHasViewAccess("Sponsor");
            isKeyHandleAllowed = userHasViewAccess("Key Handle");

            //Device Management
            isDevicesAllowed = userHasViewAccess("Devices");
            isDownloadLibraryAllowed = userHasViewAccess("Download Library");
            isReportandChartAllowed = userHasViewAccess("Reports and Charts");
            isSwapAllowed = userHasViewAccess("Device Swap");
            isAlertsAllowed = userHasViewAccess("Alerts");
            isDownloadScheduleAllowed = userHasViewAccess("Download Schedule");
            isDiagnosticsScheduleAllowed = userHasViewAccess("Diagnostic Actions");

            isContentLibraryAllowed = userHasViewAccess("Content Library");
            isDeliveryReportAllowed = userHasViewAccess("Reports and Charts");
            isContentSchedulerAllowed = userHasViewAccess("Content Schedule");
            isChartDownloadsAllowed = userHasViewAccess("Reports and Charts");
            isReportViewAllowed = userHasViewAccess("Reports and Charts");
			isTroubleShootAllowed = userHasViewAccess("Troubleshooting");

			isCareViewAllowed = userHasViewAccess("VerifoneCare");
			
            /////////////////////Administartion///////////////////////////////////
            if (IsVHQAuthorizedUser) {
                $("#securitysublink").css("display", "none");
            } else {
                $("#securitysublink").css("display", "inline");
            }

            if (!isUserAdminAllowed && !isRoleAdminAllowed) {
                $("#userManagement").css("display", "none");
            }

            if (!isHierarchyAssignmentAllowed && !isGroupAssignmentAllowed && !isConfigSettingsAllowed && !isSourceIpValidationAllowed && !isDeviceStatusAllowed) {
                $("#estate").css("display", "none");
            } else {
                if (!isHierarchyAssignmentAllowed) {
                    $("#hierarchiessublink").css("display", "none");
                }
                if (!isGroupAssignmentAllowed) {
                    $("#groupEstablishmentsublink").css("display", "none");
                }
                if (!isSourceIpValidationAllowed) {
                    $("#ipRangesConfigsublink").css("display", "none");
                }
                if (!isConfigSettingsAllowed) {
                    $("#systemConfigurationsublink").css("display", "none");
                }
                if (!isDeviceStatusAllowed) {
                    $("#deviceSubStatussublink").css("display", "none");
                }
            }

            if (!isAuditLogAllowed)
                $("#auditReport").css("display", "none");

            if (!isAlertAdminAllowed)
                $("#adminalerts").css("display", "none");

            if (!isDownloadLibraryAllowed && !isContentLibraryAllowed) {
                $("#contentconfig").css("display", "none");
            } else if (!isDownloadLibraryAllowed) {
                $("#tagssublink").css("display", "none");
            } else if (!isContentLibraryAllowed) {
                $("#standardFilesublink").css("display", "none");
                $("#deviceLocationsublink").css("display", "none");
            }

            if (!isSponsorAllowed) {
                $("#sponsorssublink").css("display", "none");
            }
            if (!isKeyHandleAllowed) {
                $("#keyHandlessublink").css("display", "none");
            }

            if (!isSponsorAllowed && !isKeyHandleAllowed) {
                $("#keyManagement").css("display", "none");
            }

            //Admin tab
            if (!isUserAdminAllowed && !isRoleAdminAllowed && !isHierarchyAssignmentAllowed && !isGroupAssignmentAllowed && !isConfigSettingsAllowed && !isSourceIpValidationAllowed
                && !isDeviceStatusAllowed && !isAuditLogAllowed && !isAlertAdminAllowed && !isDownloadLibraryAllowed && !isContentLibraryAllowed && !isSponsorAllowed && !isKeyHandleAllowed && !isLicenseDetailsAllowed) {
                $("#administration").css("display", "none");
            }
            //////////////////////////////////End of administartion///////////////////////////////

            ////////////////////////////Device management/////////////////////////////////////
            var retval = autho.checkRightsBYScreen('Diagnostic Actions', 'IsModifyAllowed');
            var isDeviceModifyAllowed = autho.checkRightsBYScreen('Devices', 'IsModifyAllowed');

            if (!isDevicesAllowed) {
                $("#addDevicessublink").css("display", "none");
                $("#deletedDevicessublink").css("display", "none");
                $("#exports").css("display", "none");
            }

            if (!isDeviceModifyAllowed) {
                $("#addDevicessublink").css("display", "none");
                $("#deletedDevicessublink").css("display", "none");
            }

            if (!isDownloadLibraryAllowed) {
                $("#downloadLibrarysublink").css("display", "none");
                $("#referenceSetsublink").css("display", "none");
            }

            if (!isDownloadLibraryAllowed || !isDevicesAllowed) {
                $("#applicationssublink").css("display", "none");
            }

            if (!isDownloadLibraryAllowed || !isReportandChartAllowed) {
                $("#downloadJobsublink").css("display", "none");
                $("#downloadDetailsublink").css("display", "none");
            }
            if (!isReportandChartAllowed) {
                $("#chartReportingDevicessublink").css("display", "none");
                $("#chartDownloadStatussublink").css("display", "none");

            }
            if (isReportandChartAllowed && !isAlertsAllowed) {
                $("#chartAlertssublink").css("display", "none");
            }

            if (!isReportandChartAllowed && !isAlertsAllowed) {
                $("#chartAlertssublink").css("display", "none");
            }

            if (!isReportandChartAllowed) {
                $("#charts").css("display", "none");
            }
            if (!isReportandChartAllowed) {
                $("#chartReportingDevicessublink").css("display", "none");
                $("#chartDownloadStatussublink").css("display", "none");
            }

            if (!isReportandChartAllowed || !isDownloadScheduleAllowed || !isDownloadLibraryAllowed) {
                $("#deviceReferencesublink").css("display", "none");
            }


            if (!isDiagnosticsScheduleAllowed || !isReportandChartAllowed || !isDevicesAllowed) {
                $("#scheduleActionssublink").css("display", "none");
            }

            if (!isDiagnosticsScheduleAllowed || !isReportandChartAllowed) {
                $("#actionStatussublink").css("display", "none");
                $("#diagnosticReportsublink").css("display", "none");
            }

            if (!isDownloadScheduleAllowed || !isDevicesAllowed || !isDownloadLibraryAllowed) {
                $("#schedulesublink").css("display", "none");
            }

            if (!isDownloadScheduleAllowed || !isDownloadLibraryAllowed) {
                $("#hierarchyReferencesublink").css("display", "none");
            }

            if ((!isReportandChartAllowed || !isDownloadScheduleAllowed || !isDownloadLibraryAllowed) && (!isDownloadScheduleAllowed || !isDownloadLibraryAllowed) && (!isDownloadLibraryAllowed)) {
                $("#manageRefernceSet").css("display", "none");
            }

            if ((!isDownloadLibraryAllowed || !isDevicesAllowed) && (!isDownloadLibraryAllowed || !isReportandChartAllowed)
                && (!isDownloadScheduleAllowed || !isDevicesAllowed || !isDownloadLibraryAllowed) && (!isDownloadLibraryAllowed)) {
                $("#downloads").css("display", "none");
            }

            if (!isDevicesAllowed) {
                $("#manageDevices").css("display", "none");
            }

            if (!isAlertsAllowed) {
                $("#alerts").css("display", "none");
            }
            if (!isDownloadLibraryAllowed && !isDownloadScheduleAllowed && !isReportandChartAllowed && !isDevicesAllowed && !isAlertsAllowed
                && !isDiagnosticsScheduleAllowed) {
                $("#device").css("display", "none");
            }

            if ((isDiagnosticsScheduleAllowed && isReportandChartAllowed && isDevicesAllowed) || (isDiagnosticsScheduleAllowed && isReportandChartAllowed)
                && retval == true) {

            } else {
                $("#diagnostics").css("display", "none");
            }
            ////////////////////////////////Content Management////////////////////////////


            var chartIndex = 1;

            if (!isContentLibraryAllowed && !isDeliveryReportAllowed && !isContentSchedulerAllowed) {
                $("#manageContents").css("display", "none");
                chartIndex--;
            } else {
                if (!isContentLibraryAllowed) {
                    $("#contentLibrarysublink").css("display", "none");
                }
                if (!isDeliveryReportAllowed) {
                    $("#contentDetailedStatusReportsublink").css("display", "none");
                }
                if (!isDeliveryReportAllowed || !isContentLibraryAllowed) {
                    $("#contentJobStatusReportsublink").css("display", "none");
                }
                if (!isContentSchedulerAllowed || !isContentLibraryAllowed) {
                    $("#scheduleDeliverysublink").css("display", "none");
                }
            }

            if (!isChartDownloadsAllowed) {
                $("#contentChart").css("display", "none");
            }
            ///

            //content tab
            if (!isDeliveryReportAllowed && (!isContentSchedulerAllowed || !isContentLibraryAllowed) && !isChartDownloadsAllowed && isContentLibraryAllowed) {
                $("#content").css("display", "none");
            }

            //Reports tab

            if (!isReportViewAllowed) {
                $("#reports").css("display", "none");
            }

            //Dashboard tab
            if (!isReportViewAllowed && !isAlertsAllowed) {
                $("#dashboard").css("display", "none");
			}

			//Care Dashboard tab
			if (!isCareViewAllowed) {
				$("#care").css("display", "none");
			}

            //Device search/filter tab
            if (!isDevicesAllowed) {
                $("#deviceSearch").css("display", "none");
			}

			//Merchant Management tab
            if (IsMMEnabled) {
                $("#merchants").css("display", "block");
            } else {
                $("#merchants").css("display", "none");
            }
			
			//TroubleShooting Tab
			if (!isTroubleShootAllowed) {
                $("#troubleShoot").css("display", "none");
            }
        }
    }

    seti18nResourceData(document, resourceStorage);
	
	$(document).ready(function() {
        var element = document.getElementById('sidebar');
        if (element) {
          var resizer = document.createElement('div');
          resizer.className = 'draghandle';
          resizer.style.width = '6px';
          element.appendChild(resizer);
          resizer.addEventListener('mousedown', initResize, false);
        }

        function initResize(e) {
          window.addEventListener('mousemove', Resize, false);
          window.addEventListener('mouseup', stopResize, false);
        }

        function Resize(e) {
          element.style.width = (e.clientX - element.offsetLeft) + 'px';
		  var right = (e.clientX -220- element.offsetLeft) > 180 ? 180 : (e.clientX -220- element.offsetLeft) >= 0 ? (e.clientX -220- element.offsetLeft) : 0;
          $('#mainScrenContent').css('margin-left', right + 'px');
        }

        function stopResize(e) {
          window.removeEventListener('mousemove', Resize, false);
          window.removeEventListener('mouseup', stopResize, false)
		  var left = (e.clientX -220- element.offsetLeft) > 180 ? 180 : (e.clientX -220- element.offsetLeft) >= 0 ? (e.clientX -220- element.offsetLeft) : 0;
          $('#mainScrenContent').css('margin-left', left + 'px');

          var gridID = $('.jqx-grid').attr('id');
            //grid refresh
          if (gridID != undefined && gridID != '') {
              $("#" + gridID).jqxGrid('render');
          }
        }
        $('.draghandle').mousedown(function () {
		    setTimeout(function () {
                var gridID = $('.jqx-grid').attr('id');
                if (gridID != undefined && gridID != '') {
                    $("#" + gridID).jqxGrid('render');
                }
            }, 100);
        },false);

        $('.draghandle').mouseup(function () {
            setTimeout(function () {
                var gridID = $('.jqx-grid').attr('id');
                if (gridID != undefined && gridID != '') {
                    $("#" + gridID).jqxGrid('render');
                }
            }, 100);
        },false);
});
	
});
require(["../controller/index", "bootstrap"], function () {

});

