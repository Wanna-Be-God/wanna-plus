import { computed } from "vue";
import type { TransferDataItem, TransferKey, TransferProps } from "../transfer";

export const useComputedData = (props: TransferProps) => {
  const rowKey = props.rowKey;

  const dataObj = computed(() => {
    return props.data.reduce((o, cur) => (o[cur[rowKey]] = cur) && o, {});
  });

  const sourceData = computed(() => {
    return props.data.filter(item => !props.modelValue.includes(item[rowKey]));
  });

  const targetData = computed(() => {
    if (props.targetOrder === "original") {
      return props.data.filter(item => props.modelValue.includes(item[rowKey]));
    } else {
      return props.modelValue.reduce((arr: TransferDataItem[], cur: TransferKey) => {
        const val = dataObj.value[cur];
        if (val) {
          arr.push(val);
        }
        return arr;
      }, []);
    }
  });

  const leftPanelTitle = computed(() => (props.titles[0] as string) || "");

  const rightPanelTitle = computed(() => (props.titles[1] as string) || "");

  return {
    sourceData,
    targetData,
    leftPanelTitle,
    rightPanelTitle
  };
};
