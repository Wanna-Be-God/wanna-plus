import { LEFT_CHECK_CHANGE_EVENT, RIGHT_CHECK_CHANGE_EVENT } from "../transfer";
import type { SetupContext } from "vue";
import type { TransferCheckedState, TransferEmits, TransferKey } from "../transfer";

export const useCheckedChange = (checkedState: TransferCheckedState, emit: SetupContext<TransferEmits>["emit"]) => {
  const onSourceCheckedChange = (checkedKeys: TransferKey[], movedKeys?: TransferKey[], checkedRows?: any[]) => {
    checkedState.leftChecked = checkedKeys;
    if (!movedKeys) return;
    emit(LEFT_CHECK_CHANGE_EVENT, checkedKeys, movedKeys, checkedRows);
  };

  const onTargetCheckedChange = (checkedKeys: TransferKey[], movedKeys?: TransferKey[], checkedRows?: any[]) => {
    checkedState.rightChecked = checkedKeys;
    if (!movedKeys) return;
    emit(RIGHT_CHECK_CHANGE_EVENT, checkedKeys, movedKeys, checkedRows);
  };

  return {
    onSourceCheckedChange,
    onTargetCheckedChange
  };
};
