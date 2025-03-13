/*
 * @Author: WANAN && 903157935@qq.com
 * @Date: 2025-03-13 12:33:07
 * @LastEditors: WANAN
 * @LastEditTime: 2025-03-13 12:42:50
 * @Description: 
 */
/* eslint-env node */
module.exports = {
  plugins: [
    require("postcss-nested"),
    require("postcss-each-variables"),
    require("postcss-each")({
      plugins: {
        beforeEach: [require("postcss-for"), require("postcss-color-mix")],
      },
    }),
  ],
};
