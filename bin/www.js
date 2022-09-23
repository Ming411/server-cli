#! /usr/bin/env node

const {program} = require('commander');

let options = {
  '-p --port <dir>': {
    description: 'init server port',
    example: 'lgserve -p 3306'
  },
  '-d --directory <dir>': {
    // 在那个盘符开启服务
    description: 'init server dirctory',
    example: 'lgserve -d c:'
  }
};
function formatConfig(configs, cb) {
  // 可以返回其可枚举属性的键值对的对象。
  Object.entries(configs).forEach(([key, val]) => {
    cb(key, val);
  });
}
formatConfig(options, (cmd, val) => {
  program.option(cmd, val.description);
});

program.on('--help', () => {
  console.log('Example');
  // 当执行--help时展示example
  formatConfig(options, (cmd, val) => {
    console.log(val.example);
  });
});
/* 至此 我们就能 lgserve --help 来查看我们自定义的提示信息 */
program.name('lgserve'); // 修改控制台输出的名字
let version = require('../package.json').version;
program.version(version); // lgserve -V  or --version

let cmdConfig = program.parse(process.argv);
// console.log(cmdConfig);

let Server = require('../main.js');
new Server(cmdConfig).start();
