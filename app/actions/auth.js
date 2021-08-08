import { ApiActions } from "@actions";
import { BaseConfig } from "@config";
import { LOGIN } from "@constants";
import * as logger from "./logger";

const colors = BaseConfig.AVATAR_DEF_BACK;

export const getMyInfo = () => async dispatch => {
    const device = global.device;
    let res = {};
    try {
        res = await ApiActions.getUser({ device });
        global.phone = res?.user?.phone;
        return dispatch({ type: LOGIN, data: { user: { ...res.user, backgroundColor: colors[(Date.parse(new Date(res?.user?.updated_at)) % 3)] } } });
    } catch (err) { logger.error("get my info", err) }
}