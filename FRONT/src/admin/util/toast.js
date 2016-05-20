/*!
 * @packet admin.util.toast;
 */
Plugin({
    name: "toastlite",
    singleton: true,
    option: {
        mes: ""
    },
    init: function () {
        
        if (!this.toast) {
            this.toast = $("<div class='plugin-toastlite'><div class='plugin-toastlite-mes'>" + this.option.mes + "</div></div>").appendTo("body");
        }
    },
    setMes: function (mes) {
        this.toast.children(0).html(mes);
    },
    setSuccess: function (mes) {
        var ths = this;
        this.setMes("<i class='fa fa-check'></i> " + (mes || "success"));
        setTimeout(function () {
            ths.remove();
        }, 2000);
    },
    setStart: function (mes) {
        this.setMes("<i class='fa fa-spin fa-refresh'></i> " + (mes || "loading..."));
    },
    setDataError: function (mes) {
        var ths = this;
        this.setMes("<i class='fa fa-times'></i> " + (mes || "error"));
        setTimeout(function () {
            ths.remove();
        }, 2000);
    },
    setNetError: function () {
        var ths = this;
        this.setMes("<i class='fa fa-times'></i> 断开连接");
        setTimeout(function () {
            ths.remove();
        }, 2000);
    },
    remove: function () {
        this.toast.remove();
        this.toast = null;
    }
});
$.toast = function (text) {
    $("<div class='toast'><div class='toast_text'>" + text + "</div></div>").appendTo("body").transition().set("-all-transform").done(function () {
        this.transition().removeAll().set("opacity", {time: 1000}).delay(2000).then(function () {
            this.css("opacity", 0);
        }).delay(1000).done(function () {
            this.remove();
        }).resolve();
    }).scope().transform().y(-150);
};