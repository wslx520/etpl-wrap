
使用示例及文档请见：**[Github](https://github.com/wslx520/etpl-wrap)**，欢迎提交Issue及建议

# etpl-wrap etpl模板引擎的Node包装器

etpl-wrap用于包装etpl模板引擎，以便于在Node.js环境下使用。

etpl-wrap包装后，是独立的模板引擎，不依赖任何web框架，但又适用于任何框架。

[使用文档](https://github.com/wslx520/etpl-wrap/tree/master/doc)

## 为什么要包装etpl?

etpl是我用过的很出色的模板引擎，我想要的功能都有。

etpl本身是可以用在Node下的，但由于服务器环境和浏览器端天生不同，etpl更适合于浏览器端。

**有些什么不同？**

从后端语言的模板来讲，每个模板，一般就是一个文件，而不像浏览器端，需要显式的声明一个“模块”。如果接触后后端知识，比如JSP，就知道他们可以将几个模板文件互相include，组成想要的网页。

另外，后端语言的模板文件，在不同目录下当然允许重名。如根目录root下有list.html，root/content下也能有list.html，这是非常正常的需求，而且两个文件明显应该是不同的。

而在浏览器端，要你自己规避target名称冲突的问题。

因为后端的模块是一个个文件，所以也就涉及到路径的问题。浏览器端没这个问题（虽然etpl支持把target name设为路径形式如：main/content/list，但这需要你自己命名）

由于文件天生独立的特性，所以在浏览器端，必要的target声明，在后端就不再需要的————每个模板文件就对应相应的target

## 使用方法

先安装etpl，再安装etpl-wrap，然后：

	const ETPL = require('etpl-wrap');
	let etpl = new ETPL('./views','.html')
	
new ETPL的参数依次是：**模板文件根目录**，**模板文件默认后缀名**。

此时就可以像在浏览器一样，使用etpl.render渲染对应模板了：

	etpl.render('index', {
        title:'欢迎！',
        welcome:'非常欢迎你'
    })
	
此代码即渲染了模板根目录下的index文件。

如果你要独立渲染子目录下的某模板，则：

	etpl.render('content/list', data);

