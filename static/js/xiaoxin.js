/*
 * @Descripttion: 
 * @version: 0.0.1
 * @Author: xiaoxin
 * @Date: 2022-08-19 22:40:49
 * @LastEditors: xiaoxin
 * @LastEditTime: 2022-08-23 11:15:38
 */
let code = "xxjqb";
var app = new Vue({
    el: '#app',
    data: {
        //当前操作系统
        osInfo: '',
        //数据
        data: []
    },
    created: function load() {
        this.osInfo = getOs();
    },
    mounted() {
        //params:{code: features.code,payload: utools搜索入参,type: "text"}
        utools.onPluginEnter((params) => {
            //参数绑定到data
            window.exports[params.code].args.enter(params, (callback) => this.data = callback);
            //子输入框获得焦点
            utools.subInputFocus();
        });
    }
})

/**
 * 获取操作系统
 * @returns {string}
 * @author xiaoxin
 */
function getOs() {
    if (utools.isWindows()) {
        return "Windows"
    }
    if (utools.isLinux()) {
        return "Linux"
    }
    if (utools.isMacOS()) {
        return "Mac"
    }
}

/**
 * 鼠标移到对应位置
 * @param {element} id 
 */
function onfocus(id) {
    document.getElementById(id).className = "list-item list-item-selected";
}

/**
 * 鼠标离开对应位置
 * @param {element}} id 
 */
function onblur(id) {
    document.getElementById(id).className = "list-item";
}

//清空数据
function cleanAllDoc() {
    window.exports[code].args.clean(app.data);
}

utools.setSubInput(({ text }) => {
    console.log(text)
  }, '搜索')
utools.subInputSelect()
