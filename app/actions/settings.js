import { ApiActions } from "@actions";
import { INITSTORES } from "@constants";
export const getConfigAction = () => dispatch => {
    ApiActions.getConfig()
        .then(res => {
            let global_config = {};
            res.config?.forEach?.(item => {
                global_config = { ...global_config, [item.key]: item.value };
            });
            global.config = global_config;
        })
        .catch(err => {
            global.config = {};
        });
}
export const initStores = () => ({ type: INITSTORES })