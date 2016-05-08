'use strict';
const ETPL = require('../index.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
// console.log(ETPL)
let etpl = new ETPL('./views','.html')

let renderFn = etpl.compile('Hello ${etpl}');
console.log(renderFn({etpl:'etpl-wrap'}));

http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type':'text/html'
    })
    res.end(etpl.render('index', {
        title:'欢迎！',
        welcome:'非常欢迎你',
        em:'a string in a EM'
    }))
}).listen(3001);