
import { ApiActions, logger } from "@actions";
import { BaseConfig } from "@config";
import {
    GETCONTACTSFAILED, GETCONTACTSSUCCESS, GETSTATEFAILED, GETSTATESUCCESS, GETUSERFAILED, GETUSERSUCCESS, LOADING
} from "@constants";
import { comparePhone } from "@utils";
import Contacts from 'react-native-contacts';
const colors = BaseConfig.AVATAR_DEF_BACK;

export const getUsers = (dispatch, contacts, isLoading) => {
    ApiActions.getUsers()
        .then(res => {
            const data = res.users.map(item => {
                let contacts_user = contacts.find(cont => comparePhone(cont.phone, item.phone));
                const backgroundColor = contacts_user?.backgroundColor || colors[(Date.parse(new Date(item.updated_at || item.created_at)) % 3)];
                const avatar = contacts_user?.avatar || item.avatar;
                const name = contacts_user?.name || item.name;
                return ({ ...item, avatar, backgroundColor, name, fromContacts: !!contacts_user });
            });
            dispatch({ type: GETUSERSUCCESS, data });
        })
        .catch(err => {
            dispatch({ type: GETUSERFAILED });
        })
        .finally(() => {
            if (isLoading) dispatch({ type: LOADING, data: false });
        })
}
export const getContacts = (isLoading) => dispatch => {
    Contacts.checkPermission().then(permission => {
        if (permission === "undefined") {
            Contacts.requestPermission().then(permission => {
                getAllContacts(dispatch, isLoading);
            })
        } else if (permission === "authorized") {
            getAllContacts(dispatch, isLoading);
        } else if (permission === "denied") {
            logger.log("permission denied");
            return;
        }
    })
}
const getAllContacts = (dispatch, isLoading) => {
    if (isLoading) {
        dispatch({ type: LOADING, data: true });
    }
    Contacts.getAll()
        .then(contacts => {
            contacts = contacts
                .map(item => {
                    let name = '';
                    if (item.phoneNumbers?.length <= 0 || !item.phoneNumbers[0].number) return null;
                    if (item.givenName || item.familyName) {
                        name = `${item.givenName} ${item.familyName}`.trim();
                    } else {
                        name = item.phoneNumbers[0].number;
                    }
                    let colorIndex = 0;
                    try {
                        colorIndex = parseInt(item.recordID.replace(/([^0-9])/g, '')) % colors.length;
                    } catch (error) {

                    }
                    return ({
                        id: item.recordID,
                        avatar: item.thumbnailPath,
                        name,
                        phone: item.phoneNumbers,
                        backgroundColor: colors[colorIndex]
                    });
                })
                .filter(item => {
                    if (item?.phone?.length > 0) { }
                    else return false;

                    if (typeof item.phone === "object") {
                        return comparePhone(item.phone, global.phone) == false;
                    }
                    return false;
                });
            getUsers(dispatch, contacts, isLoading);
            dispatch({ type: GETCONTACTSSUCCESS, data: contacts });
        })
        .catch(err => {
            logger.error("get contacts", err);
            dispatch({ type: GETCONTACTSFAILED });
        })
}
export const getUserStates = () => dispatch => {
    ApiActions.getUserStates()
        .then(res => dispatch({ type: GETSTATESUCCESS, data: res.states }))
        .catch(err => {
            dispatch({ type: GETSTATEFAILED });
            logger.error("get user state error", err)
        })
}