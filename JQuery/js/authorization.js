
define(["knockout"], function (ko) {
    function authorizationViewModal() {
    
        var self = this;
        self.rightsData = ko.observableArray();

        self.checkRightsBYScreen = function (screenName, rightsFor) {
            var arr=self.rightsData();
            var source = _.where(self.rightsData(), { RightName: screenName })
            if (source != '') {
                if (source[0][rightsFor] == true) {
                    //return source[0][rightsFor];
                    return true;
                } else if (source[0][rightsFor] == false) {
                    return false;
                }
            } else {
                return false;
            }
            
        }

        function IsViewAllowed(userRightsGlobal)
        {
            return koUtil.userRightsGlobal.IsviewAllowed;
        }

        function IsModifyAllowed(userRightsGlobal)
        {
            return koUtil.userRightsGlobal.IsModifyAllowed;
        }
		
        function IsDeleteAllowed(userRightsGlobal)
        {
            return koUtil.userRightsGlobal.IsDeleteAllowed;
        }

        self.userHasViewAccess = function (action) {
            //var isView = false;
            //if (null == koUtil.userRightsGlobal)
            //    return isView;
			
            //for (var i = 0; koUtil.userRightsGlobal.length > i; i++)
            //{
            //    if (action == koUtil.userRightsGlobal[i].RightName)
            //    {
            //        isView = IsViewAllowed(koUtil.userRightsGlobal[i]);
            //        break;
            //    }
            //}
            //return isView;	
        }
    };

  
      

    return new authorizationViewModal();
});