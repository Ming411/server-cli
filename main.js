const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs').promises; // 这样会返回一个promise
const {createReadStream} = require('fs');
const {promisify} = require('util');
const mime = require('mime');
const ejs = require('ejs');

// 合并参数
function mergeConfig(config) {
  return {
    port: 1234,
    dirctory: process.cwd(),
    ...config
  };
}

class Server {
  constructor(config) {
    this.config = mergeConfig(config);
    // console.log(this.config);
  }
  start() {
    // 启动web服务
    let server = http.createServer(this.serveHandle.bind(this));
    server.listen(this.config.port, () => {
      console.log('server is running');
    });
  }
  async serveHandle(req, res) {
    let {pathname} = url.parse(req.url);
    pathname = decodeURIComponent(pathname); // decode解码
    let absPath = path.join(this.config.dirctory, pathname);
    // console.log(absPath);
    try {
      let statObj = await fs.stat(absPath);
      if (statObj.isFile()) {
        // 当是一个可操作的文件时
        this.fileHandle(req, res, absPath);
      } else {
        // 目录的操作
        let dirs = await fs.readdir(absPath);

        dirs = dirs.map(item => {
          return {
            path: path.join(pathname, item),
            dirs: item
          };
        });
        // console.log(dirs);
        let renderFile = promisify(ejs.renderFile);
        let parentpath = path.dirname(pathname);

        // 通过ejs生成模板展示文件
        let ret = await renderFile(path.resolve(__dirname, 'template.html'), {
          arr: dirs,
          // 是否需要展示返回上一层
          parent: pathname === '/' ? false : true,
          parentpath: parentpath,
          title: path.basename(absPath)
        });
        res.end(ret);
      }
    } catch (err) {
      // 错误处理
      this.errorHandle(req, res, err);
    }
  }
  errorHandle(req, res, err) {
    console.log(err);
    res.statusCode = 404;
    res.setHeader('Content-type', 'text/html;charset=utf-8');
    res.end('Not Found');
  }
  fileHandle(req, res, absPath) {
    // 当文件体积较大时，采用流操作，边读边写
    res.statusCode = 200;
    res.setHeader('Content-type', mime.getType(absPath) + ';charset=utf-8');
    createReadStream(absPath).pipe(res);
  }
}

module.exports = Server;
