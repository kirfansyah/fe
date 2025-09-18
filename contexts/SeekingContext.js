import React, { createContext, useReducer } from "react";
import { AlertFailed } from "../components/Alert";
import { seekingReducer } from "../reducers/seekingReducer";
import apis from "./api";

export const SeekingContext = createContext();

const SeekingContextProvider = (props) => {
  const initialState = {
    isLoading: false,
    message: "",
    data: [],
    listData: [],
    isModal: false,
    isShow: false,
    searchText: ""
  };

  const [stateSeeking, dispatch] = useReducer(seekingReducer, initialState);

  const showModal = (payload) => {
    dispatch({type:"showModal", payload:payload})
  };

  const showList = (payload, setText) => {
    dispatch({type:"showList", payload:payload, text:setText})
  };

  const getSeeking = async(getText) => {
    try{
      dispatch({type:"showLoading", payload:true});
      
      const data = await apis.get("/seeking-search?keyText=" + getText);
      const resData = data.data.data;    

      dispatch({type:"getSeeking", payload:resData})
    }catch(err){
      AlertFailed({message:err.message});
  }
};

  return (
    <SeekingContext.Provider value={{ stateSeeking, dispatch, showModal, getSeeking, showList }}>
      {props.children}
    </SeekingContext.Provider>
  );
};

export default SeekingContextProvider;
