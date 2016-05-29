/* 
 * @packet main;
 * @template template.temp;
 * @css style.style;
 * @css style.fontawesome;
 * @require tree;
 * @require jsontree;
 * @include admin.form;
 */
console.log(module);
Module({
    name: "login",
    extend: "viewgroup",
    className: "login",
    layout: module.getTemplate("@temp", "login"),
    init: function () {
        var ths = this;
        this.dom.transition().set("height", {time: "4s"}).done(function () {
            ths.dispatchEvent("loginout");
            ths.remove();
        });
    },
    group_form: function (dom) {
        var ths = this;
        dom.items("submit").click(function () {
            ths.dispatchEvent("loginend");
        });
    },
    event_loginend: function (e) {
        this.close();
        e.stopPropagation();
    },
    close: function () {
        var ths = this;
        this.groups("form").transition().all().done(function () {
            ths.dom.addClass("close");
        }).scope().css("opacity", 0);
    }
});
Module({
    name: "maincontainer",
    extend: "viewgroup",
    className: "maincontainer",
    layout: module.getTemplate("@temp", "maincontainer"),
    option: {
        treeType: "@tree.treelite",
        editType: "@.aceditor",
        docType: "@.doc",
        selectType: "@.dropselect"
    },
    onbeforeinit: function () {
        this.option[this.option.treeType] = this.option.tree;
        this.option[this.option.selectType] = this.option.select;
    },
    find_gotoline: function (dom) {
        var ths = this;
        dom.click(function () {
            var a = $(this).cache();
            ths.getChildByType("@.aceditor").getEditor().navigateTo(a.line, a.column);
        });
    },
    find_simulate: function (dom) {
        var ths = this;
        dom.click(function () {
            var results = ths.getChildByType("@.doc").getSimulateData();
            ths.addChild({
                type: "@.popup",
                option: {
                    title: "simulate",
                    width: 700,
                    override: {
                        onendinit: function () {
                            this.add({
                                type: "@.flipeditor",
                                option: {
                                    results: results
                                }
                            });
                        },
                        event_prev: function () {
                            this.getChildByType("@.flipeditor").prev();
                        },
                        event_next: function () {
                            this.getChildByType("@.flipeditor").next();
                        }
                    },
                    btns: [
                        {name: "Close", type: "close"},
                        {name: "PrevResult", type: "prev"},
                        {name: "NextResult", type: "next"}
                    ]
                }
            });
        });
    },
    find_apitest: function (dom) {
        var ths = this;
        dom.click(function () {
            var fields = ths.getChildByType("@.doc").getFormOption();
            ths.addChild({
                type: "@.popup",
                option: {
                    title: "apitest",
                    override: {
                        onendinit: function () {
                            this.add({
                                type: "@form.listform",
                                option: {
                                    url: "",
                                    fields: fields
                                }
                            });
                        },
                        event_submit: function () {
                            this.getChildByType("@form.listform").submit();
                        }
                    },
                    btns: [
                        {name: "Close", type: "close"},
                        {name: "Submit", type: "submit"}
                    ]
                }
            });
        });
    },
    find_setting: function (dom) {
        var ths = this;
        dom.click(function () {
            ths.addChild({
                type: "@.popup",
                option: {
                    title: "editor setting"
                },
                container: ths.finders("middlecon")
            });
        });
    },
    event_docerror: function (e) {
        this.finders("docerrorp").addClass("error");
        $.template(module.getTemplate("@temp", "docerror")).renderTo(this.finders("docerror"), e.data);
        this.delegate();
    },
    event_docunerror: function () {
        this.finders("docerrorp").removeClass("error");
    }
});
Module({
    name: "aceditor",
    extend: "view",
    className: "aceditor",
    template: module.getTemplate("@temp", "aceditor"),
    init: function () {
        var ths = this;
        this.render();
        $.loader().load({
            js: [
                basePath + "FRONT/src/lib/ace/ace.js",
                basePath + "FRONT/src/lib/jsyaml/esprima.js",
                basePath + "FRONT/src/lib/jsyaml/js-yaml.min.js"
            ]
        }, function () {
            var editor = ace.edit(ths.dom.children(0).get(0));
            editor.setTheme("ace/theme/xcode");
            editor.getSession().setMode("ace/mode/yaml");
            editor.on("change", function () {
                ths.dispatchEvent("editorchange", ths.getContentToJson());
            });
            ths.editor = editor;
            ths.dispatchEvent("editordone");
        });
    },
    getContentToJson: function () {
        var ths = this;
        try {
            var a = this.getContent();
            ths.dispatchEvent("docunerror");
            return jsyaml.load(a);
        } catch (e) {
            ths.dispatchEvent("docerror", e);
            return null;
        }
    },
    getContent: function () {
        return this.editor.getValue();
    },
    setContent: function (str) {
        this.editor.setValue(str);
        this.editor.navigateFileEnd();
    },
    getEditor: function () {
        return this.editor;
    },
    setContentWithJson: function (obj) {
        var ths = this;
        try {
            var a = jsyaml.safeDump(obj);
            this.setContent(a);
            ths.dispatchEvent("docunerror");
        } catch (e) {
            ths.dispatchEvent("docerror", e);
        }
    },
    event_editorchange: function (e) {
        this.parentView.getChildByType("@.doc").setData(e.data);
    },
    event_editordone: function () {
        var ths = this;
        $.loader().text(basePath + "data/sample.yaml", function (a) {
            ths.setContent(a);
        });
    }
});
Module({
    name: "doc",
    extend: "viewgroup",
    className: "doc",
    layout: module.getTemplate("@temp", "doc"),
    autoupdate:true,
    setData: function (data) {
        if (data) {
            this.cachedata = data;
            this.option=data;
            this.update();
            this.finders("entity").each(function () {
                $(this).jsontree($(this).cache());
            });
        }
    },
    getFormOption: function () {
        var a = this.cachedata.parameters, t = [];
        for (var i in a) {
            if (a[i].type !== "file") {
                t.push({
                    type: "@form.text",
                    label: a[i].key,
                    name: a[i].name
                });
            }
        }
        return t;
    },
    getSimulateData: function () {
        var a = this.cachedata.response, r = [];
        for (var i in a) {
            var t = a[i].data, p = null;
            if (t) {
                if (a[i].type === "array") {
                    p = [this.cachedata.entity[t]];
                } else {
                    p = this.cachedata.entity[t];
                }
            }
            r.push({
                code: a[i].code,
                data: this.coverRealObject(p),
                msg: a[i].msg || "",
                desc: a[i].desc
            });
        }
        return r;
    },
    coverRealObject: function (data) {
        var t = function (a) {
            var m = null;
            if ($.is.isArray(a)) {
                m = [];
                for (var i in a) {
                    m.push(t(a[i]));
                }
            } else if ($.is.isObject(a)) {
                m = {};
                for (var i in a) {
                    if ($.is.isArray(a[i])) {
                        m[i] = t(a[i]);
                    } else {
                        m[i] = a[i].default || "";
                    }
                }
            } else {
                m = a;
            }
            return m;
        };
        if (data) {
            return t(data);
        } else {
            return null;
        }
    }
});
Module({
    name: "popup",
    extend: "viewgroup",
    className: "popupt",
    layout: module.getTemplate("@temp", "popup"),
    option: {
        title: "popup",
        width: 400,
        btns: [
            {name: "close", type: "close"}
        ]
    },
    init: function () {
        var ths = this;
        this.dom.width(this.option.width);
        setTimeout(function () {
            ths.popupIn();
        });
    },
    find_btn: function (dom) {
        var ths = this;
        dom.click(function () {
            var a = $(this).cache();
            ths.dispatchEvent(a.type, a);
        });
    },
    event_close: function (e) {
        var ths = this;
        this.popupOut().done(function () {
            ths.removeMask();
            ths.remove();
        });
    },
    close: function () {
        var ths = this;
        this.popupOut().done(function () {
            ths.removeMask();
            ths.remove();
        });
    },
    addMask: function () {
        this.mask = $("<div class='popup-mask'></div>").appendTo(this.dom.parent());
    },
    removeMask: function () {
        if (this.mask) {
            this.mask.remove();
            this.mask = null;
        }
    },
    popupIn: function () {
        var a = this.dom.transition().all();
        a.scope().addClass("in");
        this.addMask();
        return a;
    },
    popupOut: function () {
        var a = this.dom.transition().all();
        a.scope().removeClass("in");
        return a;
    },
    add: function (option) {
        option.container = this.finders("inner");
        return this.addChild(option);
    },
    getContent: function () {
        return this.finders("inner");
    },
    setContent: function (a) {
        this.finders("inner").html(a);
    }
});
Module({
    name: "flipeditor",
    extend: "view",
    className: "flipeditor",
    template: module.getTemplate("@temp", "flipeditor"),
    option: {
        results: []
    },
    init: function () {
        this.render(this.option);
        var editor = ace.edit(this.finders("editor").get(0));
        editor.setTheme("ace/theme/xcode");
        editor.getSession().setMode("ace/mode/json");
        this.editor = editor;
        this.goto(0);
        this.dispatchEvent("flipeditordone");
    },
    goto: function (a) {
        if (a >= 0 && a < this.option.results.length) {
            this.current = a;
            var b = this.option.results[a];
            if (b) {
                var mq = {};
                mq.code = b.code + "";
                if (b.data) {
                    mq.data = b.data;
                }
                if (b.msg) {
                    mq.msg = b.msg;
                }
                this.editor.setValue(window.JSON.stringify(mq, null, 3));
                this.editor.navigateFileEnd();
                this.finders("desc").html(b.desc);
            }
        }
    },
    prev: function () {
        this.goto(this.current - 1);
    },
    next: function () {
        this.goto(this.current + 1);
    }
});

Module({
    name: "dropselect",
    extend: "view",
    className: "dropselect",
    template: module.getTemplate("@temp", "dropselect"),
    option: {
        url: basePath + "data/dropselect.json"
    },
    init: function () {
        this.getData();
    },
    find_title: function () {},
    find_add: function (dom) {
        var ths = this;
        dom.click(function () {
            if ($(this).hasClass("hover")) {
                $(this).removeClass("hover");
                ths.groups("add").hide();
            } else {
                $(this).addClass("hover");
                ths.groups("add").show();
            }
        });
    },
    group_item: function (dom) {
        var ths = this;
        dom.items("name").click(function () {
            ths.groups("item").each(function () {
                $(this).removeClass("active");
            });
            $(this).group().addClass("active");
            ths.selectItem($(this).group().cache());
        });
        dom.items("remove").click(function () {
            if(!$(this).hasClass("removeis")){
                $(this).addClass("removeis");
                $(this).html("<i class='fa fa-question'></i>");
                setTimeout(function () {
                    if(!this.empty()){
                        this.html("<i class='fa fa-minus'></i>").removeClass("removeis");
                    }
                }.bind($(this)), 2000);
            }else{
                $(this).html("<i class='fa fa-refresh fa-spin'></i>");
                setTimeout(function () {
                    ths.removeItem(this.cache());
                    this.group().remove();
                    ths.delegate();
                }.bind($(this)), 2000);
            }
        });
    },
    group_add: function (dom) {
        var ths = this;
        dom.items("check").click(function () {
            $(this).html("<i class='fa fa-refresh fa-spin'></i>");
            var name = $(this).group().items("input").val();
            if (name) {
                setTimeout(function () {
                    ths.addItem(name);
                    this.html("<i class='fa fa-check'></i>");
                    this.group().items("input").val("");
                }.bind($(this)), 2000);
            }
        });
    },
    getData: function () {
        this.postRequest(this.option.url).done(function (a) {
            this._cache = a;
            this.render(a);
            this.groups("item").eq(0).items("name").click();
            this.groups("add").hide();
        });
    },
    selectItem: function (obj) {
        for (var i in this._cache) {
            if (this._cache[i] === obj) {
                this.finders("title").html(obj.name);
                break;
            }
        }
    },
    addItem: function (name) {
        var t = {name: name, value: ""};
        this._cache.push(t);
        $.template(module.getTemplate("@temp", "dropselectitem")).renderAppendTo(this.finders("items"), t);
        this.delegate();
    },
    removeItem:function(obj){
        var a=this._cache.indexOf(obj);
        if(a!==-1){
            this._cache.splice(a,1);
        }
    }
});