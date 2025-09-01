import axios from "axios";
import { createContext, useContext, useReducer } from "react";
import { AlertFailed, AlertSuccess } from "../../components/Alert"; 
import { userLanguageReducer } from "../../reducers/profile/userLanguageReducer";
import { AuthContext } from "../AuthContext";
import { ProfileContext } from "./ProfileContext";
import APIS from "../api";


export const UserLanguageContext = createContext();

const UserLanguageContextProvider = ({children }) => {

    const { getId } = useContext(AuthContext)
    const { setInput } = useContext(ProfileContext)
  
    // const { setInput } = useContext(ProfileContext);
    
    const initialState = {
        isInput: false,
        isLoading: false,
        isNotif: false,
        isSave: false,
        message: "",
        messageHeader: "",
        listData: [],
        data: [],
    };

    const [state, dispatch] = useReducer(userLanguageReducer, initialState);
    const {setShowForm} = useContext(ProfileContext)

    const saveLanguage = async (dt) => {
        
        try {
            if(state.listData.length >= 3 && dt.id == 0)
                throw new Error("Jumlah maksimal 3 data")

            const newData = {
                "user_guid" : getId("profil"),
                "id" : dt.id,
                "language_id" : dt.language_id,
                "main_language" : dt.main_language,
                "spoken" : dt.spoken,
                "written" : dt.written,
                "score" : null,
                "publish_institution" : null,
                "exp_date" : null,
                "add_edit" : dt.id == 0 ? "add" : "edit"
            }

            dispatch({type:"showLoadingSave", payload:true});
            const response = await APIS.post("addlanguage", newData);
            var res = response.data;
            if (res.api_status === 1) {
                dispatch({type:"saveLanguage"});
                AlertSuccess({
                    message: "Save success!",
                });
                getLanguage();
                setShowForm();
            } else {               
                AlertFailed({
                    message: res.api_message,
                });
            }
        } catch (error) {
            AlertFailed({message:error.message})
        }
    };

    const deleteLanguage = async (id) => {
        try{
            if (confirm(`Are you sure to delete it ?`) == true) {
                dispatch({type:"shwoLoading", payload:true});
                await APIS.get("/deletelanguage?id=" + id);
                getLanguage();
            }
        }catch(err){
            dispatch({type:"error", message:err.message});
        }
        
    };

    const getLanguage = async ()=> {
        dispatch({type:"showLoading", payload:true});
        const data = await APIS.get(`userlanguage?id=${getId("profil")}`);
        const resData = data.data.data;
        
        dispatch({ type : "getLanguage", payload:resData });
    };

    const beforeEditLanguage = async (id)=> {
        setShowForm()
        dispatch({ type: "beforeEdit", payload:id })
    }

    return (
        <UserLanguageContext.Provider value={{ state,  saveLanguage, deleteLanguage, getLanguage, beforeEditLanguage }}>
            {children}
        </UserLanguageContext.Provider>
    );

};

export default UserLanguageContextProvider;
