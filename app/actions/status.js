import { ALERT, DESTROY, HIDEMOREDLG, LOADING, NOTIFICATION, SHOWMOREDLG, TOAST } from "@constants";

export const showLoading = (data, text) => {
    return { type: LOADING, data, text };
}
export const showAlert = (data) => {
    return { type: ALERT, data };
}
export const showToast = (message) => {
    return { type: TOAST, data: { message, visible: true } };
}
export const emptyToast = () => {
    return { type: TOAST, data: { message: "", visible: false } };
}
export const destroyView = () => {
    return { type: DESTROY };
}
export const showMoreDlg = () => {
    return { type: SHOWMOREDLG };
}
export const hideMoreDlg = () => {
    return { type: HIDEMOREDLG };
}
export const showNotification = (data) => {
    return { type: NOTIFICATION, data };
}
export const hideNotification = () => {
    return { type: NOTIFICATION, data: {} };
}