
可clone本包，并启动test/server.js，然后访问 http://localhost:3001/ 查看效果。模板文件可参考test/views 里的示例

# etpl-wrap 使用文档

本来想装个逼来个英文的文档的，但etpl自身的文档都是中文的，所以我这里搞个英文的也没必要了。

etpl-wrap是一个etpl的包装器，便于在**Node.js**下使用etpl模板引擎。

要想在Node下更好的使用etpl(-wrap)，有些习惯与在浏览器端是不一样的。

## 使用
**请先安装etpl**（这点不用多说），然后
    
    npm install etpl-wrap

然后在你的node.js文件中，

    const ETPL = require('../index.js');
    let etpl = new ETPL('./views','.html')

new ETPL的参数，依次是指定模板文件的根目录，及模板文件的默认后缀名

可以使用**etpl.js本来的配置参数**，作一个对象，传入new中

然后就可以使用etpl.render('模板文件路径','数据')来得到渲染后的结果字符串了。

## 模板

在Node下，一个文件就是一个天生的模板。

所以，想声明一个叫index的target，直接在‘模板文件根目录’下新建一个index文件即可。

**推荐使用.html为模板文件后缀**，因为起码这个后缀可以在任何IDE里以良好的语法格式显示。不像鬼扯的.jade，.ejs，什么鬼，几个编辑器能自动识别语法呢？

就这样，我们在模板根目录下创建一个index.html，其代码就如一个网页一般即可，当然也可以加入etpl的语法。

而且，此文件开头**不**需要target声明语句。

当然，你非要加target声明语句也可以，但请保持与文件名一致。如index.html，第一句非要加target，则是：`<!-- target:index -->`

**推荐不加**（因为包装器会自动加）

推荐不加的理由之一是，包装器会对子目录下的模板文件自动生成对应的target name，如：main/list.html，会自动生成 `<!-- target:main/list -->`，比你自己加要省事多了

## 主模板文件

默认以index为名的模板文件为主模板文件，如你想引用subdir/index，直接 `<!-- import:subdir -->` 即可

主模板文件可以通过new时的第3个参数对象的 mainFile 设置。如：

    let etpl = new ETPL('./views','.html', {
        // 以main为名的模板文件会是主模板
        mainFile:'main'
    })

## 同模板文件下多个target

这是允许的，虽然不推荐，但不能保证不会出现这样的情况。

比如index.html，虽然会自动生成 `<!-- target:index-->`，但你也可以在此文件里面，多处使用 `<!-- target:li-->`, `<!-- target:ul-->`等声明其他target

同模板文件下的多个target, **与主target是同级**的。

## 引用模板

**同级**模板请直接`<!-- import:a_temp_file_name -->`

虽然服务器下的模板文件因为都是文件而有后缀名，但在import时千万**不要**加上后缀名。原因：

1.如果以后发生后缀名更改，不至于改源代码；
2.etpl的target name中，**不允许**包含.的其实

引用子目录下的模板
    <!-- import:main/content/ -->

引用父级模板
    <!-- import:../main/content/li -->
   
## 渲染模板文件

此时你就可以在需要的时候，渲染对应的模板：
	
	// 渲染模板目录下的index文件
	response.end(eptl.render('index', {
		welcome:'hello',
		title:'欢迎你'
	}))
	// 渲染模板目录下/content/list模板
	response.end(eptl.render('content/list', {
		list:[{
			name:'lix',
			age:11
		}]
	}))

## 编译字符串

有时候想临时编译一段模板字符串，可以像使用etpl一样，使用compile，得到一个渲染函数，并在需要的时候渲染：

	let renderFn = etpl.compile('Hello ${etpl}');
	console.log(renderFn({etpl:'etpl-wrap'}));

