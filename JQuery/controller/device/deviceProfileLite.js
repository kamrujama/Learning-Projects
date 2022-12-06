define(["knockout", "advancedSearchUtil"], function (ko, ADSearchUtil) {

	return function getFrameSource() {
		var self = this;
				
		self.isBlankDeviceProfile = ko.observable(false);
		self.isDeviceProfile = ko.observable(true);
		ADSearchUtil.AdScreenName = 'deviceProfile';
		
		mainMenuSetSelection("deviceProfileLite");
		removeSetMenuSelection("deviceProfileLite");
		seti18nResourceData(document, resourceStorage);
		var iframeHeight = 0;
		if (VHQFlag === true) {
			var sessionDeviceProfileUniqueDeviceId = JSON.parse(sessionStorage.getItem("DevProfileUniqueDeviceId"));
			if (sessionDeviceProfileUniqueDeviceId != null && sessionDeviceProfileUniqueDeviceId != "" && sessionDeviceProfileUniqueDeviceId != undefined) {
				self.isBlankDeviceProfile(false);
				self.isDeviceProfile(true);
				$("#blankDevProfile").css("min-height", 0);
				
				iframeHeight = getIframeHeight('VHQ');
				$("#iframeDeviceLiteDiv").attr('height', iframeHeight);
				$("#iframeDeviceLiteDiv").attr('src', "./VHQDeviceProfile/#/deviceProfile/VHQAUTHORIZEDACCESS");
			} else {
				self.isBlankDeviceProfile(true);
				self.isDeviceProfile(false);

				var blankDevProfileHeight = $(window).height() - $(".fixed-footer").height() - 140;
				$("#blankDevProfile").css("min-height", blankDevProfileHeight);
				return;
			}
		} else {
			self.isDeviceProfile(true);
			self.isBlankDeviceProfile(false);			
			$("#blankDevProfile").css("min-height", 0);
			
			iframeHeight = getIframeHeight('HostedPage');
			$("#iframeDeviceLiteDiv").attr('height', iframeHeight);
			$("#iframeDeviceLiteDiv").attr('src', "../VHQDeviceProfile/#/deviceProfile/" + hostedPageAccessToken);
			window.history.pushState(null, null, windowurl);			
		}

		function getIframeHeight(source) {
			var frameHeight = $(window).height();
			if(source == 'VHQ'){
				if ($("#iframeDeviceLiteDiv").offset().top == 0) {
					frameHeight = (frameHeight - 200) - $(".fixed-footer").height() - 30;
				} else {	
					frameHeight = (frameHeight - $(".navbar").height()) - $(".fixed-footer").height() - 30;
				}
			} else {
				if ($("#iframeDeviceLiteDiv").offset().top == 0) {
					frameHeight = (frameHeight - 200);	
				} else {
					frameHeight = (frameHeight - 20);
				}
			}

			return frameHeight;
		}
	}
}); 