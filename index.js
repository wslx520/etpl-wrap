/*
* etpl-wrap
* etpl的node包装器
* Version:0.1.6
* Author: 十年灯
* Url: https://github.com/wslx520/Node/tree/master/etpl-wrap
* Site: http://jo2.org
*/

'use strict';
const ETPL = require('etpl');
if(!ETPL) throw new Error('You must install etpl before use etpl-wrap');

const fs = require('fs');
const path = require('path');

const extend = function (old, newone) {
    for(let n in newone) {
        if(newone.hasOwnProperty(n)) {
            old[n] = newone[n];
        }
    }
    return old;
}
// etpl默认配置--与etpl模板引擎本身一致
const defaultConfig = {
    commandOpen:'<!--',
    commandClose:'-->',
    commandSyntax:null,
    variableOpen:'${',
    variableClose:'}',
    defaultFilter:'html',
    strip:false,
    namingConflict:'error',
    missTarget:'ignore',
    // 新增的设置
    root:'',
    extname:'.html', // 模板文件后缀
    mainFile:'index' // 主模板文件名（不含后缀）
};

let DEBUG = true;
let log = DEBUG ? console.log : function() {};
let extNames = {};
let mainFiles = {};
let targetReg = /\s*target\s*:\s*([a-z0-9\/_-]+)\s*/;
let targetcmdReg = null;
let importcmdReg = null;
// 遍历指定目录下的所有文件及目录，并对[文件]执行回调
// 增加一个额外的参数，以避免用call调用函数造成效率损失
function walk(root, callback, EW) {   
     // 保持对EtplWrap的指向
    let self = this;
    fs.readdir(root, function (err, files) {
        if(!err) {
            files = files.filter(function (filename, index) {
                let stat = fs.statSync(path.resolve(root, filename));
                // log('isFile? ', stat.isFile())
                if(stat.isFile()) {
                    callback(path.resolve(root, filename), filename, EW);                 
                } else {
                    walk(path.resolve(root, filename), callback, EW);
                }
            })
        }
    })
}
function compileFile (filepath, filename, EW) {
    log('find a template file: '+filepath)
    let options = EW.options;
    let extName = path.extname(filename);
    let open = options.commandOpen;
    let close = options.commandClose;
    if(!targetcmdReg) {
        targetcmdReg = new RegExp(options.commandOpen + targetReg.source + close, 'ig');
        // log(targetcmdReg)
    }
    if(!importcmdReg) {
        // 此正则里的target name匹配规则与etpl不同，因为我们需要转换引用父级模板的语法如：import: ../sidebar
        importcmdReg = new RegExp(options.commandOpen + '\\s*import\\s*:\\s*(\.*[a-z0-9\\/_-]+)\\s*' + close, 'ig');
        // log(importcmdReg)
    }
    fs.readFile(filepath, function (err, content) {
        if (!err) {
            content = content.toString('utf8').trim();

            let firstTargetCmd = null;
            let dir = '';

            let relative = path.relative(options.root, filepath);
            // 是否在子目录中
            let insubdir = relative.indexOf(path.sep) > -1;
            // 当前子目录
            if(insubdir) {
                dir = path.dirname(relative);;
            }
            // 快速判断出第一句是不是target声明
            if (
                // 如果不是以命令语句开头
                content.substr(0, open.length) != open 
                // 或命令不是target命令
                || !targetReg.test(content.substr(open.length, content.indexOf(close)))
            ) {
                let justname = relative.slice(0, -extName.length);
                // 如果是主模板文件名，且位于子目录中，则以其目录名做target名
                if(dir && path.basename(justname) === options.mainFile) {
                    justname = dir;
                }
                justname = justname.replace(/\\/g,'\/');
                log('generate a target: ',justname)
                firstTargetCmd = open + 'target:' + justname + close;
            }
            // 是以target声明开头，则直接取出第一个target name
            else {
                firstTargetCmd = content.substr(0, content.indexOf(close) + close.length);
                // 抛除第一句target
                content = content.substr(firstTargetCmd.length);
            }
            // 如果是子目录下的模板，则检查content(已抛除第一个target声明)，转换其中的包含的其他target的路径
            if(insubdir) {
                content = content.replace(targetcmdReg, function (m, targetName) {
                    // if(/\\|\//.test(targetName)) {
                    //     throw new Error('EtplWrap: when define target, it\'s name could not contains path separator.')
                    // }
                    targetName = path.join(dir, targetName).replace(/\\/g,'/');
                    log('replace a target definitaion: ', dir,targetName)
                    return open + 'target:' + targetName + close;
                })
                // 替换 import命令里目标target路径
                .replace(importcmdReg, function (m, targetName) {
                    targetName = path.join(dir, targetName).replace(/\\/g,'/');
                    log('replace a import command: ', dir,targetName)
                    return open + 'import:' + targetName + close;            
                })
            };
            // 将content补全
            content = firstTargetCmd + content;
            // log(content)
            EW.engine.compile(content);
        }
    })
}
function EtplWrap(root, extname, conf) {
    this.engine = ETPL;
    this.options = extend({},defaultConfig);
    if(conf) {
        this.config(conf);
    }
    this.init(root, extname);
}

EtplWrap.prototype = {
    init: function (root, ext) {
        root = root || __dirname + '/views';
        ext = ext || '.html';
        let self = this;
        if('string' === typeof ext) {
            ext = [ext];
        }
        self.options.root = root;
        self.options.extname = ext;
        ext.forEach(function (xt) {
            if(xt.charAt(0) !== '.') {
                xt = '.'+xt;
            }
            extNames[xt] = 1;
        })
        // log('template path is ' + root);
        walk(root, compileFile, self);
    },
    config: function (conf) {
        return this.engine.config(extend(this.options, conf));
    },
    render: function (target, data) {
        return this.engine.render(target, data);
    },
    compile: function (str) {
        return this.engine.compile(str);
    }
}
module.exports =  EtplWrap;