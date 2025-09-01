import axios from "axios";
import { createContext, useReducer } from "react";
import { profileReducer } from "../../reducers/profile/profileReducer";
import apis from "../api";

export const ProfileContext = createContext();

const ProfileContextProvider = ({ children }) => {
  const initialState = {
    isLoading: false,
    isInput: false,
    showForm: false, 
    dataOrganization: [],
    dataWorkExperience: [],
    dataSkills: [],
    dataDegrees: [],
    dataInstituion: [],
    dataInstituionSearch: [],
    dataMajor: [],
    dataMajorSearch: [],
  };

  const [stateProfile, dispatch] = useReducer(profileReducer, initialState);

  function setInput(boolean) {
    dispatch({ type: "setInput", payload: boolean });
  };

  const setShowForm = () => {
    dispatch({ type: "setShowForm", showForm: !stateProfile.showForm });
  };

  const getWorkExperience = () => {
    let items = Array.apply(null, Array(5)).map((v, i) => {
      return {
        id: i,
        company_name: `PT Pulau Sambu (Kuala Enok)`,
        industry: `Manufacture`,
        function: `HRD`,
        position: `Psikolog Industri`,
        position_type: `Contract`,
        position_grade: `Supervisor`,
        task_description: `Human resource departemen ...`,
        start_date: `${i + 1} October 2022`,
        end_date: `${i + 1} October 2022`,
      };
    });
    items[1].company_name = "PT Pulau Sambu (Guntung)";
    items[2].company_name = "PT Riau Sakti Plantation (Pulau Burung)";
    items[3].company_name = "PT Pulau Sambu (Jakarta)";
    items[4].company_name = "PT Pulau Sambu (Singapore)";
    items[1].position = "Programmer";
    items[1].function = "IT";
    items[1].task_description = "Information Technology ...";
    dispatch({
      type: "setDataWorkExperience",
      data: items,
    });
  };

  const getOrganization = () => {
    let items = Array.apply(null, Array(3)).map((v, i) => {
      return {
        id: i,
        organization: `Pecinta Alam Psikologi`,
        scope: `Fakultas`,
        position: `Ketua`,
        start_date: `${i + 1} October 2022`,
        end_date: `${i + 1} October 2022`,
      };
    });
    dispatch({
      type: "setDataOrganization",
      data: items,
    });
  };

  const getSkills = () => {
    let items = Array.apply(null, Array(2)).map((v, i) => {
      return {
        id: i,
        skills: `Asssessment Center`,
        institution_publication: `PPM Management`,
        expired_date: `${i + 1} October 2022`,
      };
    });
    dispatch({
      type: "setDataSkills",
      data: items,
    });
  };

  const getDegree = async () => {
    let hasil = await apis.get("degrees")
    var dt = hasil.data.data?.map((x) => {
      return {value:x.code, label:x.name}
    })
    
    dispatch({type:"setdegree", payload:dt})
  }

  const getIntitution = async () => {
    let hasil = await apis.get("institution")
    var dt = hasil.data.data?.map((x) => {
    return {value:x.code, label:x.name}
    //return x.name
    
    })
    dispatch({type:"setInstitution", payload:dt})
  }

  const getIntitutionSearch = async () => {
    let hasil = await apis.get("institution")
    var dt = hasil.data.data?.map((x) => {
    return x.name
    
    })
    dispatch({type:"setInstitutionSearch", payload:dt})
  }

  const getMajor = async () => {
    let hasil = await apis.get("majors")
    var dt = hasil.data.data?.map((x) => {
      return {value:x.id, label:x.name}
    })
    dispatch({type:"setMajor", payload:dt})
  }

  const getMajorSearch = async () => {
    let hasil = await apis.get("majors")
    var dt = hasil.data.data?.map((x) => {
      return x.name
    })
    dispatch({type:"setMajorSearch", payload:dt})
  }

  return (
    <ProfileContext.Provider
      value={{
        ...stateProfile,
        stateProfile,
        setInput,
        setShowForm,
        getWorkExperience,
        getOrganization,
        getSkills,
        getDegree,
        getIntitution,
        getIntitutionSearch,
        getMajor,
        getMajorSearch
      }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContextProvider;
