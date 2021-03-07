import { find, isEmpty } from "lodash";
import TypeHard from "./typeHard/HookTypeHard.default";

import { HOOK_TYPE_HARD } from "grandus-lib/constants/AppConstants";

const Hook = ({ type = 1, data = [], options = {} }) => {
  if (isEmpty(data)) {
    return "";
  }

  switch (type) {
    case HOOK_TYPE_HARD:
      const hardHooks = find(data, { type: HOOK_TYPE_HARD });
      return <TypeHard data={hardHooks} options={options} />;
      break;

    default:
      return "default";
      break;
  }
};

export default Hook;
