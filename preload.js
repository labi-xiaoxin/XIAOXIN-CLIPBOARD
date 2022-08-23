const { clipboard } = require("electron");
const crypto = require("crypto");

const xxjqbModule = {
    mode: "list",
    args: {
        //进入应用时调用
        enter: (action, callbackSetList) => {
            if (!historys) {
                refreshHistory();
            }
            callbackSetList(historys);
        },
        //子输入框内容变化时被调用
        search: (action, searchWord, callbackSetList) => {
            let pms = Promise.resolve(historys);
            if (searchWord) {
                const lowerWord = searchWord.toLowerCase();
                let results = historys.filter((x) => {
                    return x.title && ~x.title.toLowerCase().indexOf(lowerWord);
                });
                pms = Promise.resolve(results);

            }
            pms.then(callbackSetList, () => callbackSetList(historys));
        },
        //选择某个列调用
        select: (action, itemData, callbackSetList) => {
        },
        //子输入框为空时占位符
        placeholder: "小新剪切板，请输入搜索内容...",
        //删除方法
        clean: (arrs) =>{
            clean(arrs);
        }
    }
}

//复制的文本
let copyText = "";
//历史复制数据
let historys;
//本地数据库
const db = {
    //获取数据库文档
    allDocs() {
        return utools.db.allDocs();
    },
    //创建或更新文档
    put(item) {
        return utools.db.put(item);
    },
    //删除文档
    remove(id) {
        return utools.db.remove(id);
    }
};

//进入插件应用，主动调用该方法
utools.onPluginEnter(({ code, type, payload }) => {
    refreshHistory();
    utools.setSubInput(({ text }) => {
        // 这里的 text 就是输入的内容, 实时变化
      }, 'Enter 搜索, Space 预览, → 打开')
});
utools.onDbPull(refreshHistory);

//定时器读取剪切板
function clipboardEvent() {
    //上一个复制的数据
    let preResult = {};
    //1秒执行一次
    setInterval(function () {
        let readResult = clipboardPaste();
        //首次进入，preResult为空
        if(Object.keys(preResult).length === 0){
            preResult = readResult;
        }
        //不与之前所复制的一样
        if (readResult && (readResult.data !== preResult.data || readResult.type !== preResult.type || readResult.size !== preResult.size)) {
            preResult = readResult;
            saveData(readResult);
        }
        xxjqbModule.args.placeholder = '搜索框内容';
    }, 1000);

}

clipboardEvent();

//保存数据
function saveData(item) {
    if (!historys) {
        refreshHistory();
    }
    //加密id
    item._id = crypto.createHash("md5").update(item.data).digest("hex");
    //复制时间
    item.time = getCurrentTime();
    //添加元素到history
    historys.unshift(itemToHistory(item));
    //添加元素到db
    db.put(item);
}

//剪切板粘贴：支持文字
function clipboardPaste() {
    //文字读取
    let readText = clipboard.readText();
    if (readText.trim()) {
        copyText = readText;
        return { type: "text", data: readText, size: readText.length };
    }

}

//处理item
function itemToHistory(item) {
    return {
        _id: item._id,
        title: item.data.slice(0, 255),
        date: item.time,
        description: item.data,
        icon: "",
        click() {
            utools.copyText(x.data);
            return true;
        },
    };
}

//刷新数据
function refreshHistory() {
    let items = db.allDocs();
    items.sort((a, b) => {
        return a.time > b.time;
    });
    historys = [];
    for (let item of items) {
        historys.push(itemToHistory(item));
    }
}

 //获取当前时间
function getCurrentTime() {
    var date = new Date();//当前时间
    var year = date.getFullYear() //返回指定日期的年份
    var month = repair(date.getMonth() + 1);//月
    var day = repair(date.getDate());//日
    var hour = repair(date.getHours());//时
    var minute = repair(date.getMinutes());//分
    var second = repair(date.getSeconds());//秒
    
    //当前时间 
    var curTime = year + "-" + month + "-" + day
            + " " + hour + ":" + minute + ":" + second;
    return curTime;
}
 
//补0
function repair(i){
    if (i >= 0 && i <= 9) {
        return "0" + i;
    } else {
        return i;
    }
}

//清空数据
function clean(arrs){
    console.log(db.allDocs());
    let arrsLength = arrs.length;
    let objects = JSON.parse(JSON.stringify(arrs));

    for(var j = 0 ; j < arrsLength ; j++){
        let _id = objects[j]._id;
        for(var i = 0 ; i < historys.length ; i ++){
            if(objects[j]._id === historys[i]._id){
                historys.splice(i,1);
                break;
            }
        }
        db.remove(_id);
    }
}

window.exports = {
    xxjqb: xxjqbModule
}