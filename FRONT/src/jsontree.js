/**
 * @packet jsontree;
 * @css style.jsontree;
 */
$.fn.jsontree = function (da) {
    var nt = function (data) {
        var str = "";
        if ($.is.isArray(data) || $.is.isObject(data)) {
            str += "<div class='list'>";
            for (var i in data) {
                str += "<div class='node'>";
                if ($.is.isFunction(data[i])) {
                    str += "<div class='name'><span style='padding:0 4px 0 4px;'></span> " + i + " :<span>fn</span></div><div class='list'></div>";
                } else if ($.is.isObject(data[i]) || $.is.isArray(data[i])) {
                    str += "<div class='name'><i class='fa fa-caret-right'></i> " + i + " :<span>" + ($.is.isObject(data[i]) ? "Object" : "Array") + "</span></div>";
                    str += arguments.callee(data[i]);
                } else {
                    str += "<div class='name'><span style='padding:0 4px 0 4px;'></span> " + i + " :<span>" + cover(data[i]) + "</span></div><div class='list'></div>";
                }
                str += "</div>";
            }
            str += "</div>";
        }
        return str;
    };
    var str = "<div class='node active'>" + nt(da) + "</div>";
    $(this).html(str).find(".name").click(function () {
        $(this).parent().toggleClass("active");
    });
};
var cover = function (a) {
    if (a && a !== "") {
        return $().create("div").text(a).html();
    } else {
        return "''";
    }
};