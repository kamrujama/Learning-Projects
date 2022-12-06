define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {

	//validation
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});
	return function addTagsModel() {

		var self = this;

		//focus on first textbox
		$('#modelAddTag').on('shown.bs.modal', function () {
			$('#txtTagName').focus();
		})
		//------------------------------FOCUS ON  POP UP-------------------------------------


		$('#modelAddTag').keydown(function (e) {
			if ($('#btnCancelTag').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#modelAddTagsClose').focus();
			}
		});

		//----------------------------------------------------------------------------------------

		$('#modelAddTagsHeader').mouseup(function () {
			$("#modelAddTagsClose").draggable({ disabled: true });
		});

		$('#modelAddTagsHeader').mousedown(function () {
			$("#modelAddTagsClose").draggable({ disabled: false });
		});


		//$('#txtTagName').keyup(function () {
		//	var yourInput = $(this).val();
		//	re = /[`~!#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
		//	// store current positions in variables
		//	var start = this.selectionStart,
		//		end = this.selectionEnd;

		//	var isSplChar = re.test(yourInput);
		//	if (isSplChar) {
		//		var no_spl_char = yourInput.replace(/[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '');
		//		$(this).val(no_spl_char);

		//		// restore from variables...
		//		this.setSelectionRange(start - 1, end - 1);
		//	}
		//});

		self.tagName = ko.observable('');
		self.tagName.subscribe(function () {
			if ($("#txtTagName").val().trim() != '') {
				$('#btnAddTag').removeAttr('disabled');
			} else {
				$('#btnAddTag').prop('disabled', true);
			}
		});

		self.addTag = function(observableModelPopup, gId) {
			var addTagReq = new Object();
			addTagReq.TagName = $("#txtTagName").val();
			addTagReq.Category = null;

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(0, 'tag_add_success');
						observableModelPopup('unloadTemplate');
						$("#modelAddTag").modal('hide');
						gridFilterClear(gId);
					} else if (data.responseStatus.StatusCode == AppConstants.get('EX_ADD_TAG_EXIST')) {
						openAlertpopup(1, 'tag_add_duplicate');
					}
				}
				$("#loadingDiv").hide();
			}

			var method = 'AddTag';
			var params = '{"token":"' + TOKEN() + '","addTagReq":' + JSON.stringify(addTagReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		seti18nResourceData(document, resourceStorage);
	};

	
});