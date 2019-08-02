<template>
    <div class="v-select-container" style="height:100%;width:100%;" :id="'m-'+id">
        <div class="q-select" :class="[(layer || mlayer)?'active':'']" :checked-val="initVal">
            <div class="q-select-right" @click.stop="rClick">
                <i class="iconfont" :class="[(layer || mlayer)?'icon-arrow-up':'icon-arrow-down']"></i>
            </div>
            <div class="q-select-left">
                <div class="q-select-input" @click.stop="lClick" :placeholder="placeholder"
                    :contenteditable="fixSearch()" @input.stop="input" @focus.stop="focus" v-text="text"></div>
                <label class="q-select-hover"></label>
            </div>
        </div>

        <div class="q-select-layer" v-if="layer"
            :style="{width:layerStyle.width + 'px',top:layerStyle.top + 'px',left:layerStyle.left + 'px','--end':layerStyle.end + 'px','--start':layerStyle.start + 'px','max-height':layerStyle.height+'px','height':layerStyle.height+'px','z-index':zIndex}"
            :class="[layerStyle.bottom?'bottom':'top']">
            <ul @click.stop="liClick">
                <li class="compare" v-if="search" v-show="!regex" :class="[!regex?'only-last-li':'']">
                    <div class="op-left">无筛选匹配数据</div>
                </li>
                <li class="empty" v-if="empty && layerStyle.bottom" v-show="(sModel.indexOf('s') < 0)">
                    <div class="op-left">请选择</div>
                </li>
                <template v-for="(item,index) in tdata">
                    <li :key="item.text" :val="JSON.stringify(item)"
                        :class="[item.checked?'active':'',!(item.visible == false)?'visible':'unvisible']"
                        v-show="!(item.visible == false)" :index="index">
                        <div class="op-right">
                            <i v-if="multy" class="iconfont" :class="[item.checked?'icon-checkbox-checked':'icon-checkbox']"></i>
                            <i v-else class="iconfont" :class="[item.checked?'icon-radio-checked':'icon-radio']"></i>
                        </div>
                        <div class="op-left">{{item.text}}</div>
                    </li>
                </template>
                <li class="empty" v-if="empty && !layerStyle.bottom" v-show="(sModel.indexOf('s') < 0)">
                    <div class="op-left">请选择</div>
                </li>
            </ul>
        </div>

        <div class="m-q-select-layer" v-if="mlayer" :style="{height:mlayerHeight+'px'}" @touchstart="ts">
            <div class="m-layer-container">
                <div class="m-layer-content">
                    <div class="m-layer-botton">
                        <div class="confirm" @click.stop="confirmEvent">确 定</div>
                        <div class="cancel" @click.stop="cancelEvent">取 消</div>
                    </div>
                    <div class="m-layer-wrapper">
                        <ul>
                            <li></li>
                            <li></li>
                            <template v-for="(val,index) in tdata">
                                <li :key="val.text" :val="JSON.stringify(val)" @click.stop="mLiClick" :index="index"
                                    :class="[val.checked?'m-checked':'m-unchecked']">{{val.text}}</li>
                            </template>
                            <li></li>
                            <li></li>
                        </ul>
                    </div>
                    <div class="m-layer-line"></div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import JRoll from 'jroll'
    export default {
        name: "v-tag-select",
        model:{
            prop: 'value',
            event: 'c'
        },
        props: {
            multy: {
                type: Boolean,
                default: false
            },
            placeholder: {
                type: String,
                default: ""
            },
            empty: {
                type: Boolean,
                default: false
            },
            search: {
                type: Boolean,
                default: false
            },
            max: {
                type: Number,
                default: 5
            },
            zIndex: {
                type: Number,
                default: 10
            },
            change: {
                type: Function,
                default: null
            },
            confirm: {
                type: Function,
                default: null
            },
            cancel: {
                type: Function,
                default: null
            },
            close: {
                type: Function,
                default: null
            },
            options: {
                type: Array,
                default: ()=>[]
            },
            value:{},
            'value-format': {
                type: String,
                default: "1"/*[1,val1,val2],[2 txt1,txt2],[3,[val1,val2]],[4,[txt1,txt2]],[5,[{txt1:val1},{txt2:val2}]]  */
            }
        },
        data() {
            return {
                mJroll: null,
                mlayerHeight: 0,
                mlayer: false,
                regex: true,
                sModel: "",
                layerStyle: {
                    height: "",
                    width: "",
                    top: "",
                    left: "",
                    start: "",
                    end: "",
                    bottom: false
                },
                oHeight: 40,
                lOffset: 5,
                layer: false,
                startY: 0,
                storageTarget: null,
                inputTarget: null,
                layerTarget: null,
                regexCount: 0,
                old: "",
                text: "",
                initVal:"",
                async:false,
                datalist(){
                    let _str =  JSON.stringify(this.options);
                    return Object.assign([],JSON.parse(_str));
                },
                step:-1
            }
        },
        methods: {
            cancelEvent() {
                let _t = this;
                var _tmp = _t.storageTarget.getAttribute("checked-val");
                if (_tmp) {
                    var _tmpArray = JSON.parse(_tmp);
                    let chk_text = _tmpArray.reduce((a, b) => {
                        return a + "," + b.text;
                    }, "");
                    chk_text = chk_text && chk_text.substring(1, chk_text.length);
                    _t.inputTarget.innerText = chk_text;
                }
                _t.cancel && _t.cancel(_tmpArray);
                _t.mlayer = false;
                _t.mJroll && _t.mJroll.destroy();
            },
            confirmEvent() {
                let _t = this,
                    _result = _t.result();
                _t.confirm && _t.confirm(_result);
                _t.closeEvent();
            },
            trigger(index) {
                let _t = this,
                    _list = _t.tdata,
                    _current = _list[index];
                if (_t.multy) {
                    _current.checked = !_current.checked;
                    if (_t.change) {
                        let _vArray = _list.filter((item) => {
                            return item.checked;
                        });
                        _t.change(_vArray);
                    }
                } else {
                    _t["handle-list"](!!0);
                    _current.checked = !0;
                    let _tmpArray = [];
                    _tmpArray.push(_current);
                }
                _t.$forceUpdate();
            },
            mLiClick(e) {
                let _t = this,
                    _l = e.target,
                    _offset = 0;
                if(_t.step == 0){
                    return;
                }
                let _index = _l.getAttribute("index");
                _offset = (_index) * (-40);
                _t.mJroll.scrollTo(0, _offset, 300);
                _t.trigger(_index, true);
            },
            focus(e) {
                let _t = this;
                _t.sModel = "";
                if (_t.search) {
                    e.target.innerText = "";
                     _t["handle-list"](!0,"visible");
                }
            },
            input(e) {
                let _t = this,
                    _val = e.target.innerText,
                    _list = _t.tdata,_count = 0;

                _list.forEach((v) => {
                    if (v.text.indexOf(_val) > -1) {
                        _count += 1;
                        v.visible = !0;
                    } else {
                        v.visible = !!0;
                    }
                });
                _t.regexCount = _count;
                _t.regex = _count > 0;

                let _p = _t.offset(_t.storageTarget);
                _t.sModel = (_val ? "s" : "");

                if (!_t.layerStyle.bottom) {
                    if (_count == 0 && _val) {
                        _p.top -= (1 * _t.oHeight + 1);
                    } else if (_count > 0 && !_val) {
                        _p.top -= (_count * _t.oHeight + _count);
                        if (_t.empty) {
                            _p.top -= 1 * _t.oHeight;
                        }
                    } else {
                        _p.top -= (_count * _t.oHeight + _count);
                    }

                    if (_t.ie()) {
                        _p.top -= 1;
                        _t.layerStyle.top = _p.top;
                    } else {
                        _t.layerStyle.end = _p.top;
                    }
                }

                if (_t.empty && !_val) {
                    _count += 1;
                } else if (!_count && _val) {
                    _count = !_count ? 1 : _count;
                }
                let _h = _count * _t.oHeight + _count;
                if (_t.ie()) {
                    _h += 1;
                }
                _t.layerStyle.height = _h;
                _t.$forceUpdate();
                
                _t.$nextTick(() => {
                    let _tList = _t.layerTarget.querySelectorAll("li");
                    let _tLength = _tList.length,
                        _lastShowLi;
                    for (let _tl = 0; _tl < _tLength; _tl++) {
                        _tList[_tl].className = _tList[_tl].className.replace("only-last-li", "");
                        if (!_t.isHidden(_tList[_tl])) {
                            _lastShowLi = _tList[_tl];
                        }
                    }
                    _lastShowLi.className = _lastShowLi.className + " only-last-li";
                });
            },
            result() {
                let _t = this, _list = _t.tdata,_txt = "",_val = "",_f=parseInt(_t.valueFormat),_vResult=[];
                if(_f > 2){
                    _val = [];
                }
                _list.filter((v) => {
                    if(v.checked)
                    {
                        let _tmp = {text:v.text,value:v.value};
                        _txt += v.text + ",";
                        _vResult.push(_tmp);
                        if(_f == 1){
                            _val += v.value + ",";
                        }else if(_f == 2){
                            _val = _txt;
                        }else if(_f == 3){
                            _val.push(v.value);
                        }else if(_f == 4){
                            _val.push(v.text);
                        }else if(_f == 5){
                            _val.push(_tmp);
                        }
                    }
                });
                _txt = _txt && _txt.substring(0, _txt.length-1);
                if(_f < 3){
                    _val = _val && _val.substring(0, _val.length-1);
                }
                _t.text = _txt;
                _t.initVal = JSON.stringify(_vResult);
                _t.async = true;
                this.$emit('c', _val);
                _t.inputTarget.innerText = _txt;
                return _vResult;
            },
            'handle-list'(val,attr){
                let _list = this.tdata;
                attr = attr || "checked";
                _list.forEach((v) => {
                    v[attr] = val;
                });
            },
            liClick(e) {
                let _t = this,_list = _t.tdata,_target = e.target,_li;
                if(_target.parentNode.nodeName.toLowerCase() != "li"){
                    _li = _target.parentNode.parentNode;
                }else{
                    _li = e.target.parentNode;
                }
                let _index = _li.getAttribute("index"),_current = _list[_index];

                if (_li.className.indexOf("empty") > -1) {
                    _t["handle-list"](!!0);
                    _t.closeEvent();
                    return;
                }
                if (_li.className.indexOf("compare") > -1) {
                    _t.closeEvent();
                    return;
                }
                if (!_t.multy) {
                    _t["handle-list"](!!0);
                    _current.checked = !0;
                } else {
                    _current.checked = !_current.checked;
                }
                _t.$forceUpdate();
                let _val = _t.result();
                _t.change && _t.change(_val);
                !_t.multy && _t.closeEvent();
            },
            rClick(e) {
                this.lClick(e);
            },
            ts(e) {
                let _t = this;
                if (e.target.className.indexOf('m-layer-container') > -1) {
                    e.preventDefault();
                    _t.closeEvent();
                }
            },
            layerdom() {
                let _t = this;
                if (window.innerWidth < 769) {
                    return document.querySelector(".m-q-select-layer");
                }
                let _lList = document.querySelectorAll(".q-select-layer"),
                    _lCount = _lList.length,
                    _lActive;
                for (let _tl = 0; _tl < _lCount; _tl++) {
                    if (!_t.isHidden(_lList[_tl])) {
                        _lActive = _lList[_tl];
                    }
                }
                return _lActive;
            },
            ie() {
                let userAgent = navigator.userAgent;
                return userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
            },
            coordinate() {
                let _t = this,
                    _list = _t.tdata,
                    _p = _t.offset(_t.storageTarget),
                    _lh = 0,
                    _line = 0;
                if (_list.length > _t.max && _t.max > 0) {
                    _lh = _t.max * _t.oHeight;
                    _line = _t.max;
                } else {
                    _lh = _list.length * _t.oHeight;
                    _line = _list.length;
                }
                if (_t.empty) {
                    _lh += _t.oHeight;
                    _line += 1;
                }

                _lh += _line;

                if (_p.top + _p.height + _lh >= document.body.scrollTop + window.innerHeight) {
                    if (_t.ie()) {
                        _p.top -= (_lh + 1);
                    } else {
                        _p.top -= (_lh);
                    }
                    _p.bottom = false;
                    _p.start = _p.top - _t.lOffset;
                    _p.end = _p.top;
                } else {
                    if (_t.ie()) {
                        _p.top += _p.height;
                    } else {
                        _p.top += _p.height + _t.lOffset;
                    }
                    _p.bottom = true;
                    _p.start = _p.top;
                    _p.end = _p.top - _t.lOffset;
                }

                _p.height = _lh;
                if (_t.ie()) {
                    _p.height += 1;
                }
                _t.extend(_t.layerStyle, _p);
            },
            lClick(e) {
                let _t = this,
                    _list = _t.tdata;
                _t.storageTarget = e.target.parentNode.parentNode;
                _t.inputTarget = _t.storageTarget.querySelector(".q-select-input");
                let _chkVal = _t.storageTarget.getAttribute("checked-val");
                let _has = document.querySelector(".q-select.active");

                if (_t.layer && (_t.storageTarget.className.indexOf('oth') > -1 || !_has)) {
                    _t.layerTarget = null;
                    _t.storageTarget.className = _t.storageTarget.className.replace("oth", "");
                    _t.layer = false;
                    _t.regex = true;
                }

                if (_has) {
                    if (_t.layerTarget && _t.layerTarget["target"] && _t.layerTarget["target"].isSameNode(_t
                            .storageTarget)) {
                        return;
                    }
                    let _tList = document.querySelectorAll(".q-select-layer"),
                        _tLength = _tList.length;
                    for (let _tl = 0; _tl < _tLength; _tl++) {
                        _tList[_tl].style.display = "none";
                    }

                    _has.className = _has.className.replace("active", "oth");
                    _has.querySelector(".iconfont").className = _has.querySelector(".iconfont").className.replace(
                        "icon-arrow-up", "icon-arrow-down");
                    let _val = _has.getAttribute("checked-val");
                    if (_val) {
                        let _valArray = JSON.parse(_val);
                        let chk_text = _valArray.reduce((a, b) => {
                            return a + "," + b.text;
                        }, "");
                        chk_text = chk_text && chk_text.substring(1, chk_text.length);
                        _has.querySelector(".q-select-input").innerText = chk_text;
                    }
                }

                let _indexArray = [];
                if (_chkVal) {
                    let _chkArray = JSON.parse(_chkVal);
                    _list.forEach((item, indx) => {
                        _t.$set(item, "checked", !!0);
                        _chkArray.forEach((c_item) => {
                            if (item.value == c_item.value) {
                                _t.$set(item, "checked", !0);
                                _indexArray.push(parseInt(indx));
                            }
                        });
                    });
                }

                if (window.innerWidth < 769) {
                    _t.mlayerHeight = _t.scrollTop() + window.innerHeight;
                    _t.mlayer = true;

                    _t.$nextTick(() => {
                        let _layer = _t.layerdom();
                        _t.layerTarget = _layer;
                        _t.mJroll = new JRoll(".m-layer-wrapper");

                        /* 第一次展示，则默认显示第一个li内容 */
                        let _index = 0;
                        if (_indexArray.length > 0) {
                            _index = _indexArray[0];
                        } else {
                            _t.trigger(_index);
                        }
                        _t.mJroll.scrollTo(0, _index * (-40));

                        _t.mJroll.on("scrollStart", function () {
                            _t.step = 0;
                            _t.startY = this.y;
                        });

                        _t.mJroll.on("scrollEnd", function () {
                            _t.step = 1;
                            if (Math.abs(Math.abs(this.y) - Math.abs(_t.startY)) < 5) {
                                /*偏移距离过小，则视为点击操作 */
                                return;
                            }
                            _index = 0;
                            let _y = this.y,
                                _rest = parseInt(Math.abs((_y) / 40));
                            _index = _rest > 0 ? _rest + 1 : _rest;

                            let _offset = _index * (-40);
                            this.scrollTo(0, _offset, 100);

                            if (_index >= _list.length) {
                                _index = _list.length - 1;
                            }

                            _t.trigger(_index);
                        });
                    });
                    return;
                }

                _t.$nextTick(() => {
                    _t["handle-list"](!0,"visible");
                    _t.regexCount = 0;
                    _t.coordinate();

                    _t.layer = true;

                    _t.$nextTick(() => {
                        _t.layerTarget = _t.layerdom();
                        _t.layerTarget["target"] = _t.storageTarget;
                        if (_t.ie()) {
                            document.removeEventListener("keydown", _t.keydown);
                            document.removeEventListener("keyup", _t.keyup);
                            document.addEventListener("keydown", _t.keydown);
                            document.addEventListener("keyup", _t.keyup)
                        }
                        document.removeEventListener("click", _t.closeEvent);
                        document.addEventListener("click", _t.closeEvent);

                        if (window.innerWidth > 768) {
                            document.removeEventListener("scroll", _t.bodyScroll);
                            document.addEventListener("scroll", _t.bodyScroll, false);
                        }
                    });
                });
            },
            keydown(e) {
                this._old = e.target.innerText.trim();
            },
            keyup(e) {
                let _t = this;
                let _val = e.target.innerText.trim();
                if (_t._old != _val) {
                    _t.input(e);
                }
            },
            closeEvent() {
                if(!document.querySelector(".q-select.active")){
                    return;
                }
                let _t = this,_vArray = _t.result();
                _t.mJroll && _t.mJroll.destroy();
                _t.layerTarget = null;
                _t.regex = true;
                _t.mlayer = _t.layer = _t.async = false;
                _t.close && _t.close(_vArray);
                _t.$forceUpdate();
            },
            offset(elem) {
                elem = elem.querySelector(".q-select-hover");
                let _rect = elem.getBoundingClientRect();
                var _offset = {
                    left: _rect.left,
                    top: _rect.top,
                    width: _rect.width,
                    height: _rect.height
                }
                return _offset;
            },
            extend() {
                var length = arguments.length;
                var target = arguments[0] || {};
                if (typeof target != "object" && typeof target != "function") {
                    target = {};
                }
                if (length == 1) {
                    target = this;
                    i--;
                }
                for (var i = 1; i < length; i++) {
                    var source = arguments[i];
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
                return target;
            },
            scrollTop() {
                var scroll_top = 0;
                if (document.documentElement && document.documentElement.scrollTop) {
                    scroll_top = document.documentElement.scrollTop;
                } else if (document.body) {
                    scroll_top = document.body.scrollTop;
                }
                return scroll_top;
            },
            isHidden(ele) {
                let _style = window.getComputedStyle(ele);
                return (_style.display === 'none');
            },
            fixSearch() {
                let _t = this;
                return (window.innerWidth < 769 ? !!0 : _t.search);
            },
            bodyScroll() {
                let _t = this,
                    _l = document.querySelectorAll(".q-select-layer"),
                    _lCount = _l.length,
                    _lActive;
                for (let _tl = 0; _tl < _lCount; _tl++) {
                    if (!_t.isHidden(_l[_tl])) {
                        _lActive = _l[_tl];
                    }
                }
                let _target = _lActive ? _lActive["target"] : null;
                if (_target) {
                    let _p = _t.offset(_target),
                        _fix = 0,
                        _cssText = _lActive.style.cssText;

                    if (_lActive.className.indexOf('top') > -1) {
                        _fix = _p.top - _lActive.offsetHeight;
                    } else {
                        _fix = _p.top + _p.height;
                    }
                    if (_t.ie()) {
                        _cssText = _cssText.replace(/top:.*?;/g, "") + "top:" + (_fix + "px") + ";";
                    } else {
                        _cssText = _cssText.replace(/--end:.*?;/g, "") + "--end:" + (_fix + "px") + ";";
                    }
                    _lActive.style.cssText = _cssText
                }
            }
        },
        mounted(){
            let _t = this,_fH = 0;
            let _rect = document.querySelector("#m-" + _t.id).getBoundingClientRect();
            _fH = _rect.height - 4;
            document.querySelector("#m-" + _t.id + " .q-select-input").style.lineHeight = _fH + "px";
        },
        computed:{
            tdata(){
                return this.datalist();
            },
            id(){
                return new Date().getTime() + "-" + Math.random().toString(36).substr(2);
            }
        },
        watch: {
            value: {
                handler(val) {
                    let _t = this,_list = _t.tdata;
                    if(_t.async){
                        _t.async = false;
                        return;
                    }
                    if(!_list || _list.length == 0 || !val){
                        return;
                    }
                    let _vArray = [], _vText = "",_ckdArray=[];

                    if(!Array.isArray(val)){
                        let _tmpArray = val.split(',');
                        _tmpArray.forEach((v) => {
                            _vArray.push({value:v});
                        });
                    }else{
                        val.forEach((v) => {
                            _vArray.push({value:v});
                        });
                    }

                    _t.text = _t.initVal = "";
                    _list.forEach((l) => {
                        _vArray.forEach((v) => {
                            if (v.value == l.value) {
                                _vText += l.text + ",";
                                _ckdArray.push(l);
                            }
                        });
                    });
                    if (_vText) {
                        _vText = _vText.substring(0, _vText.length - 1);
                    }
                    _t.$nextTick(() => {
                        _t.text = _vText;
                        _t.initVal = JSON.stringify(_ckdArray);
                        _t.change && _t.change(_ckdArray);
                    });
                },
                immediate: true
            }
        }
    }
</script>
<style>
    @import "../font/iconfont.css";

    .m-q-select-layer {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(211, 211, 211, 0.3);
        z-index: 1;
    }

    .m-layer-container {
        height: 100%;
        width: 100%;
        position: relative;
        font-size: 12px;
    }

    .m-layer-content {
        position: fixed;
        height: 240px;
        width: 100%;
        bottom: 0;
        background: #fff;
        overflow: hidden;
    }

    .m-layer-wrapper {
        position: absolute;
        height: 200px;
        width: 100%;
        overflow: hidden;
    }

    .m-layer-botton {
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #ddd;
    }

    .m-layer-botton .confirm {
        float: right;
        width: 40px;
        font-weight: bolder;
        color: #c8000d;
    }

    .m-layer-botton .cancel {
        float: left;
        width: 40px;
    }

    .m-layer-container ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .m-layer-container li {
        height: 40px;
        line-height: 40px;
    }

    .m-layer-container li.m-checked {
        color: #c8000d;
    }

    .m-layer-line {
        position: absolute;
        z-index: 2;
        pointer-events: none;
        width: 100%;
        height: 40px;
        left: 0;
        bottom: 80px;
        border-bottom: 1px solid #ddd;
        border-top: 1px solid #ddd;
    }

    .q-select {
        width: 100%;
        height: 100%;
        position: relative;
        display: inline-block;
        padding: 1px;
        box-sizing: border-box;
        cursor: pointer;
        font-size: 12px;
        text-align: left;
    }

    .q-select.active .q-select-right {
        color: #1b7e5a;
    }

    .q-select.active .q-select-left {
        border-right-color: #1b7e5a;
    }

    .q-select.active label.q-select-hover {
        border-color: #1b7e5a;
        box-shadow: 0 0 3px #1b7e5a;
    }

    .q-select-right {
        float: right;
        width: 40px;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    .q-select-right i.iconfont {
        position: absolute\9;
        top: 12px\9;
        left: 12px\9;
    }

    .q-select-left {
        height: 100%;
        margin-right: 40px;
        border-right: 1px solid #ddd;
        box-sizing: border-box;
        padding: 2px 2px 2px 5px;
    }

    .q-select-input {
        width: 100%;
        height: 100%;
        border: 0;
        outline: none;
        line-height: 34px;
        /*calc*/
        overflow: hidden;
        white-space: nowrap;
    }

    /*为空时显示 element attribute content*/
    .q-select-input:empty:before {
        content: attr(placeholder);
        color: #ccc;
    }

    /*焦点时内容为空*/
    .q-select-input:focus:before {
        content: none;
    }

    .q-select-left label.q-select-hover {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: -1;
        border: 1px solid #ddd;
        pointer-events: none;
    }

    .q-select-layer {
        position: fixed;
        border: 1px solid #1b7e5a;
        background: #fff;
        box-shadow: 0 0 3px #1b7e5a;
        text-align: left;
        box-sizing: border-box;
        font-size: 12px;
        font-family: Arial, Helvetica, sans-serif;
        overflow: hidden;
        height: auto;
        overflow-y: auto;

        animation: mymove 300ms 1;
        -webkit-animation: mymove 300ms 1;
        animation-fill-mode: forwards;
    }

    .q-select-layer.top {
        border-bottom: none;
    }

    .q-select-layer.bottom {
        border-top: none;
    }

    .q-select-layer ul {
        -webkit-font-smoothing: antialiased;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .q-select-layer ul li {
        height: 40px;
        line-height: 40px;
        padding-left: 5px;
        border-bottom: 1px solid #1b7e5a;
        cursor: pointer;

        transition: padding-left 1s;
        -moz-transition: padding-left 1s;
        /* Firefox 4 */
        -webkit-transition: padding-left 1s;
        /* Safari and Chrome */
        -o-transition: padding-left 1s;
        /* Opera */
    }

    .q-select-layer ul li.exclude {
        display: none;
    }

    .q-select-layer ul li.compare.active,
    .q-select-layer ul li.empty.active {
        display: block;
        border-bottom: none;
    }

    .q-select-layer ul li:last-child {
        border-bottom: none;
    }

    .q-select-layer ul li:hover {
        color: #1b7e5a;
        padding-left: 10px;
        font-weight: 700;
    }

    .q-select-layer ul li.unvisible {
        display: none;
    }

    .q-select-layer ul li.visible {
        display: block;
    }

    .q-select-layer li.only-last-li {
        border-bottom: none;
    }

    .q-select-layer .op-right {
        height: 100%;
        width: 40px;
        line-height: 40px;
        float: right;
        text-align: center;
        color: #1b7e5a;
    }

    .q-select-layer .op-left {
        height: 100%;
        margin-right: 40px;
        overflow: hidden;
    }

    @keyframes mymove {
        from {
            top: var(--start);
        }

        to {
            top: var(--end);
        }
    }

    @-webkit-keyframes mymove

    /*Safari and Chrome*/
        {
        from {
            top: var(--start);
        }

        to {
            top: var(--end);
        }
    }
</style>