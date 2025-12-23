import React, { createContext, useReducer, useContext } from "react";
import { AlertFailed, AlertSuccess } from "../../components/Alert";
import { profileReducer } from "../../reducers/profile/profileReducer";
import API from "../api";
import { useRouter } from "next/router";
import { AuthContext } from "../AuthContext";
import { LanguageContext } from "../LanguageContext";


export const ProfileContext = createContext();

const ProfileContextProvider = ({ children }) => {
    const initialState = {
        isInput: false,
        isLoading: false,
        isNotif: false,
        message: "",
        messageHeader: "",
        dataKaryawan: [],
        dataMenu: [],
        listDatas: [],
        state: false
    };

    const [state, dispatch] = useReducer(profileReducer, initialState);
    const { stateLanguage } = useContext(LanguageContext);
    const { listLanguage, lang } = stateLanguage;

    const { getId } = useContext(AuthContext);

    const router = useRouter();

    const getKaryawan = async () => {
        dispatch({ type: "loading" });
        try {
            let cookie = `; ${document.cookie}`.match(`;\\s*token=([^;]+)`);
            let token = cookie ? cookie[1] : "";
            const response = await API.get("/auth/me",
                {headers: { Authorization: `Bearer ${token}` }}
            );
            const resData = response.data;

            dispatch({
                type: "getKaryawan",
                payload: resData.data.user,
            });
        } catch (err) {
            console.log(err);
        };
    };

    const getMenu = async () => {
        dispatch({ type: "loading" });
        try {
            let cookie = `; ${document.cookie}`.match(`;\\s*token=([^;]+)`);
            let token = cookie ? cookie[1] : "";
            const response = await API.get("/auth/me",
                {headers: { Authorization: `Bearer ${token}` }}
            );
            const resData = response.data;
            dispatch({
                type: "getMenu",
                payload: resData.data.data, // data menu dari response
            });
        } catch (err) {
            console.log(err);
        };
    };

    return (
        <ProfileContext.Provider value={{ ...state, getKaryawan, getMenu }}>
            {children}
        </ProfileContext.Provider>
    );
}


export default ProfileContextProvider;
