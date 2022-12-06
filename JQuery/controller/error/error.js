define(["koUtil", "constants", "globalFunction"], function (koUtil) {

    return function ErrorViewModel() {
        $("#errorDiv").css("width", $(window).width() - 220);
    }
})