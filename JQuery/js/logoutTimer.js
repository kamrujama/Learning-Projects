var sess_pollInterval = 1000;
var sess_expirationMinutes = 2;

var sess_intervalID;
var sess_lastActivity;

var sess_Alive_intervalID;

var sess_lastActivityNew;
var sess_intervalIDNew;
var sess_pollIntervalAlive = 60000;


function initSession(sess_warningMinutes) {
    setTimeoutForNotify(sess_warningMinutes);
    sessAliveInterval();
    $(document).bind('keypress.session', function (ed, e) {
        nofityServer();
    });
    $(document).bind('mousedown.session', function (ed, e) {
        nofityServer();
    });
}

function sessAliveInterval() {
    sessAliveWarningTime = sessAliveWarningTime * 80 / 100;
    setTimeout(function () { sess_Alive_intervalID = setInterval('sesssionAlive()', sess_pollIntervalAlive); }, sessAliveWarningTime);
}
function sessClearInterval(intervalId) {
    clearInterval(intervalId);
}

//Refresh Session Alive
function sesssionAlive() {
    $.ajax({
        url: GetVirtualPath() + "/Home/IsSessionAlive",
        type: "GET",
        async: false,
        cache: false,
        success: function (data) {
            if (data.IsSessionAlive == false) {
                sessClearInterval(sess_intervalID);
                sessClearInterval(sess_Alive_intervalID);
                logout(ENUM.get('IDLELOGOUT'));
            } else {
                sessAliveWarningTime = data.SessionTimeLeftInMilliSeconds;
                if (sessAliveWarningTime>60000) {
                    sessClearInterval(sess_Alive_intervalID);
                    sess_Alive_intervalID = '';
                    sessAliveInterval();
                }               
            }
        },
        error: function (jqXHR, status, error) {
            if (jqXHR != null) {
                ajaxErrorHandler(jqXHR, status, error);
            };
        }
    });
}
function logOut() {
    var path = window.location.href.substring(0, window.location.href.lastIndexOf("#"));
    if (path == '')
        path = window.location.href;
    var webFolderFullPath = path.substring(0, path.lastIndexOf("/"));

    

        //In case of WSO2 Logout
        var wso2Logout = localStorage.getItem("WSO2Logout");
        if ((wso2Logout != null && wso2Logout != "") && wso2Logout != "null") {
            $("#loadingDiv").show();
            var x = document.createElement('IFRAME');
            x.height = 0;
            x.width = 0;
            document.body.appendChild(x);
            x.onload = function () {
                $(this).remove();
                $("#loadingDiv").hide();
            };

            x.src = wso2Logout;

            localStorage.setItem("WSO2Logout", null);
        }

        var IsFederationSignOutUrlCalled = false;
        $.ajax({
            url: webFolderFullPath + "/Home/GetSignOutUrls",
            type: "GET",
            cache: false,
            async: false,
            success: function (data) {
                var FederationSignOutUrl = data.FederationSignOutUrl;
                if (data.IsVhqFederation == true && (data.VhqFederationSignOutUrl && data.VhqFederationSignOutUrl != "")) {
                    $.ajax({
                        url: data.VhqFederationSignOutUrl,
                        type: "GET",
                        cache: false,
                        async: false,
                        success: function (data) {
                            $.ajax({
                                url: FederationSignOutUrl,
                                type: "GET",
                                cache: false,
                                async: false,
                                success: function (data) {
                                    IsFederationSignOutUrlCalled = true
                                    console.log("Logout successful from " + FederationSignOutUrl);
                                },
                                error: function (error) {
                                    alert("Error: Getting error in Federation Signout.");
                                }

                            });
                        },
                        error: function (error) {
                            alert("Error: Getting error in VHQ Federation Signout.");
                        }

                    });
                }
                else if (data.IsVhqFederation == false && (data.VhqFederationSignOutUrl && data.VhqFederationSignOutUrl != "")) {
                    //For WSO2

                    var url = data.VhqFederationSignOutUrl;
                    localStorage.setItem("WSO2Logout", url);
                    url = url.toLowerCase();
                    if ((url.search("commonAuthLogout".toLocaleLowerCase()) != -1) && (url.search("sessionDataKey".toLocaleLowerCase()) != -1) && (url.search("commonauth".toLocaleLowerCase()) != -1)) {
                        var wso2Logout = data.VhqFederationSignOutUrl;
                        if ((wso2Logout != null && wso2Logout != "") && wso2Logout != "null") {
                            $("#loadingDiv").show();
                            var x = document.createElement('IFRAME');
                            x.height = 0;
                            x.width = 0;
                            document.body.appendChild(x);
                            x.onload = function () {
                                $(this).remove();
                                $("#loadingDiv").hide();
                            };

                            x.src = wso2Logout;
                        }
                    }
                }

                if (IsFederationSignOutUrlCalled == false && (FederationSignOutUrl && FederationSignOutUrl != ""))
                {
                    $.ajax
                        ({
                            url: FederationSignOutUrl,
                            type: "GET",
                            cache: false,
                            async: false,
                            success: function (data) {
                                IsFederationSignOutUrlCalled = true;
                                console.log("Logout successful from " + url);
                            },
                            error: function (error) {
                                alert("Error: Getting error in Federation Signout.");
                            }
                        });
                }

                if (data.ErrorMsg == "") {
                    $.ajax({
                        url: webFolderFullPath + "/Home/SignOut",
                        type: "GET",
                        cache: false,
                        async: false,
                        success: function (data) {

                            console.log("Logout successful from " + webFolderFullPath + "/Home/SignOut");
                            ///for clear save state///
                            var chartlist = JSON.parse(sessionStorage.getItem("chartlist"));
                            if (chartlist) {
                                for (var g = 0; g < chartlist.length; g++) {
                                    sessionStorage.removeItem(chartlist[g]);
                                }
                            } else {
                                var chartlistArr = new Array();
                                chartlistArr.push('jqxChart');
                                var chartlist = JSON.stringify(chartlistArr);
                                window.sessionStorage.setItem('chartlist', chartlist);
                            }

                            var Pagelist = JSON.parse(sessionStorage.getItem("Pagelist"));
                            if (Pagelist) {
                                for (var g = 0; g < Pagelist.length; g++) {
                                    sessionStorage.removeItem(Pagelist[g]);
                                }
                            } else {
                                var PagelistArr = new Array();
                                PagelistArr.push('page');
                                var Pagelist = JSON.stringify(PagelistArr);
                                window.sessionStorage.setItem('Pagelist', Pagelist);
                            }

 
                            var gridlist = JSON.parse(sessionStorage.getItem("gridlist"));
                            if (gridlist) {
                                for (var g = 0; g < gridlist.length; g++) {
                                    sessionStorage.removeItem(gridlist[g]);
                                }
                            } else {
                                var gridlistArr = new Array();
                                gridlistArr.push('jqxGrid');
                                var gridlist = JSON.stringify(gridlistArr);
                                window.sessionStorage.setItem('gridlist', gridlist);
                            }

                            var adlist = JSON.parse(sessionStorage.getItem("adlist"));
                            if (adlist) {
                                for (var g = 0; g < adlist.length; g++) {
                                    sessionStorage.removeItem(adlist[g]);
                                }
                            } else {
                                var adlistArr = new Array();
                                adlistArr.push('advanced');
                                var adlist = JSON.stringify(adlistArr);
                                window.sessionStorage.setItem('adlist', adlist);
                            }

                            var filterlist = JSON.parse(sessionStorage.getItem("filterlist"));
                            if (filterlist) {
                                for (var g = 0; g < filterlist.length; g++) {
                                    sessionStorage.removeItem(filterlist[g]);
                                }
                            } else {
                                var filterlistArr = new Array();
                                filterlistArr.push('filter');
                                var filterlist = JSON.stringify(filterlistArr);
                                window.sessionStorage.setItem('filterlist', filterlist);
                            }

                            sessionStorage.removeItem('exportStorage');
                            //////

                        },
                        error: function (error) {
                            alert("Error: Getting error in VHQ Signout.");
                        }
                    });
                }
            },
            error: function (error) {
                //alert("Error in Getting Signout Urls.");
            }
        }
      );
  
    localStorage.setItem("SessionStatus", "EF400");
}


function Token_Expired() {
    if (location.href != "loggedOut.html") {
          location.href = AppConstants.get('LOGOUT_URL') + '?tokenexpired=true';
    }
}

function setTimeoutForNotify(timeToNotify) {
    setTimeout(function () { notifyTimerCall = true; }, timeToNotify * 50 / 100);
}

function updatenNotifyTimer(data) {
    var timeDuration = data.SessionDurationInMilliSeconds * 50 / 100;
    if (data.SessionTimeLeftInMilliSeconds - timeDuration > 0) {
        setTimeoutForNotify(data.SessionTimeLeftInMilliSeconds -timeDuration);
        notifyTimerCall = false;
    } else {
        notifyTimerCall = true;
    }
}

//Update Timer in Following Cases
//IsSlidingTriggered==true
//notify server active session
function nofityServer() {
    if (notifyTimerCall) {
        $.ajax({
            url: GetVirtualPath() + "/Home/Notify",
            type: "GET",
            async: false,
            cache: false,
            success: function (data) {
                if (data.IsSlidingTriggered||(sess_warningMinutes < data.SessionDurationInMilliSeconds)) {
                    updatenNotifyTimer(data);                 
                } else if (data.SessionDurationInMilliSeconds/2 <= data.SessionTimeLeftInMilliSeconds) {
                    notifyTimerCall =true;
                } else {
                    notifyTimerCall =true;
                }
            },
            error: function (jqXHR, status, error) {
                if (jqXHR != null) {
                    ajaxErrorHandler(jqXHR, status, error);
                }
            }
        });
    };
}