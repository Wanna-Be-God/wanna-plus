<!--
 * @Author: 胡伟健 903157935@qq.com
 * @Date: 2023-11-15 11:10:59
 * @LastEditors: 胡伟健 903157935@qq.com
 * @LastEditTime: 2023-12-04 13:39:50
 * @FilePath: \Korean Student Programd:\ChuangHui\chkj-admin\src\components\SelectTable\renderCol.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "RenderCol",
  props: {
    row: Object,
    render: Function,
    index: Number,
    column: {
      type: Object,
      default: null
    }
  },
  render(ctx) {
    console.log(111, ctx);
    const params: any = {
      row: ctx.row,
      index: ctx.index
    };
    if (ctx.column) params.column = ctx.column;
    return ctx.render(ctx?.row[ctx?.column?.prop], ctx.row, ctx.index);
  }
});
</script>
