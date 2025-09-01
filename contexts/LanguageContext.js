import { createContext, useReducer } from "react";
import { dictionaryList } from "../language";
import { languageReducer } from "../reducers/languageReducer";

export const LanguageContext = createContext();

const LanguageContextProvider = ({ children }) => {
  const initialState = {
    lang: "id",
    listLanguage: dictionaryList.id,
  };
  const [stateLanguage, dispatch] = useReducer(languageReducer, initialState);

  const changeLanguage = (payload) => {
    dispatch({
      type: "changeLanguage",
      payload: payload,
      listLanguage: dictionaryList[payload],
    });
  };

  return (
    <LanguageContext.Provider value={{ stateLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContextProvider;
