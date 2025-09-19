import React, { createContext, useReducer } from "react";
import { authReducer } from "../reducers/AuthReducer";
import { useRouter } from "next/router";
import API from "./api";
import { AlertFailed, AlertSuccess } from "../components/Alert";
import Swal from "sweetalert2";

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
  const initialState = {
    isLoading: false,
    isAuthenticated: false,
    SecurePassword: true,
    isRegistered: false,
    isError: false,
    message: "",
    token: null,
    id: null,
    stateAuth: false,
  };
  const [stateAuth, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  const Register = async ({ email, password, passwordConfirm, tc }) => {
    dispatch({ type: "loading" }); // loading
    if (tc) {
      if (password.length < 8) {

        Swal.fire({
          icon: "error",
          text: "Password minimal 8 karakter",
          showCloseButton: false,
          showCancelButton: false,
          cancelButtonText: "OK",
          confirmButtonColor: "#1e3a8a",
        }).then((result) => {
        });

        dispatch({
          type: "loginFailed",
          data: { message: "Password minimal 8 karakter", status: false },
        });

      } else {
        // AlertFailed({
        //   message: "Konfirmasi password tidak sesuai!",
        // });
        Swal.fire({
          icon: "error",
          text: "Konfirmasi password tidak sesuai!",
          showCloseButton: false,
          showCancelButton: false,
          cancelButtonText: "OK",
          confirmButtonColor: "#1e3a8a",
        }).then((result) => {
        });
        dispatch({
          type: "loginFailed",
          data: { message: "Konfirmasi password tidak sesuai!", status: false },
        });
      }
    } else {
      AlertFailed({
        message: "Please check term and condition box!",
      });
      dispatch({
        type: "loginFailed",
        data: {
          message: "Please check term and condition box!",
          status: false,
        },
      });
    }
  };


  const Forgot = async ({ email }) => {
    dispatch({ type: "loading" }); // loading
    try {
      const response = await API.post("/pelamar/forgotPassword", { email });
      var { data, meta } = response.data;

      dispatch({
        type: "loginSuccess",
        data: {
          message: "Email berhasil dikirim!",
          status: true,

        },
      });
      AlertSuccess({
        message: "Email berhasil dikirim!",
      });

      router.push("/");

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Email anda tidak ditemukan",
        showCloseButton: true,
        showCancelButton: false,
        cancelButtonText: "OK",
        confirmButtonColor: "#1e3a8a",
      }).then((result) => {
      });

      dispatch({
        type: "loginFailed",
        data: { message: 'Email anda tidak ditemukan', status: false },
      });
    }
  }

  const Login = async ({ username, password }) => {
    dispatch({ type: "loading" }); // loading
    try {
      const response = await API.post("/auth/get_token", { username, password });
      const { status, message, data } = response.data;
 
      if (status === 200 && data.length > 0) {
      const user = data[0]; 
      document.cookie = `token=${user.token}; path=/`;
      document.cookie = `username=${user.nik}; path=/`;
      document.cookie = `nama=${user.nama}; path=/`;

      dispatch({
        type: "loginSuccess",
        data: {
          message: message,
          status: true,
          token: user.token,
          profil: {
            nik: user.nik,
            nama: user.nama,
          },
        },
      });

      // Alert sukses
      Swal.fire({
        icon: "success",
        title: "Berhasil Login",
        text: `Selamat datang ${user.nama}`,
        confirmButtonColor: "#1e3a8a",
      });

      router.push("/dashboard");
    } else {
      throw new Error("Login gagal");
    }
    } catch (err) { 
      Swal.fire({
        icon: "error",
        title: "Username atau password anda tidak sesuai",
        showCloseButton: true,
        showCancelButton: false,
        cancelButtonText: "OK",
        confirmButtonColor: "#1e3a8a",
      }).then((result) => {
      });

      dispatch({
        type: "loginSuccess",
        data: { message: 'Username atau password anda tidak sesuai', status: false },
      });
      console.log(err.response);
    }
  };

  function getSession() {
    let cookie = `; ${document.cookie}`.match(`;\\s*token=([^;]+)`);
    let token = cookie ? cookie[1] : "";
    //console.log(token)

    dispatch({
      type: "checkAuth",
      data: {
        status: token ? true : false,
        token: token,
      },
    });
    return token;
  }

  function getId(n) {
    let profile = `; ${document.cookie}`.match(`;\\s*username=([^;]+)`);
    let profil = profile ? profile[1] : "kosong username";
    console.log(profil)

    dispatch({
      type: "checkId",
      data: {
        status: profil ? true : false,
        profile: profil,
      },
    });
    return profil;
  }

  function getEmail() {
    let email_ar = `; ${document.cookie}`.match(`;\\s*email=([^;]+)`);
    let get_email = email_ar ? email_ar[1] : "";

    dispatch({
      type: "checkEmail",
      data: {
        status: get_email ? true : false,
        email: get_email,
      },
    });
    return get_email;
  }

  const Logout = () => {
    Swal.fire({
      title: "Apakah anda yakin ingin keluar?",
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: "Yakin",
      cancelButtonText: "Belum",
      confirmButtonColor: "#941d05",
      cancelButtonColor : "#1e3a8a"
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        document.cookie = `token=; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        document.cookie = `profil=; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        document.cookie = `email=; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        dispatch({
          type: "logout",
          data: { message: "berhasil logout", status: false, token: null },
        });
        router.push("/");
      }
    });
  };

  const changePassword = async ({ email, passwordOld, password, passwordConfirm }) => {
    dispatch({ type: "loading" });
    if (password === passwordConfirm) {
      try {
        await API.post("/pelamar/changePassword", {
          email,
          password,
          passwordOld,
        });

        dispatch({
          type: "changePassword",
          data: {
            message: "Update success!",
            status: true,
          },
        });
        AlertSuccess({
          message: "Update success",
        });

        router.push("/profile", { shallow: true });
      } catch (err) {
        var { data } = err.response;
        AlertFailed({
          message: data.message,
        });
        dispatch({
          type: "loginFailed",
          data: { message: data.message, status: false },
        });
      }
    } else {
      AlertFailed({
        message: "Password confirm is incorrect!",
      });
      dispatch({
        type: "loginFailed",
        data: { message: "Password confirm is incorrect!", status: false },
      });
    }
  };

  const Reset = async ({ email, key, password, passwordConfirm }) => {
    dispatch({ type: "loading" }); // loading
    try {
      const response = await API.post("/pelamar/resetPassword", { email, key });
      var { data, meta } = response.data;

      if (meta.code == 200) {
        // reset password lama
        if (password != passwordConfirm) {
          Swal.fire({
            icon: "error",
            text: "Konfimasi password tidak sesuai",
            showCloseButton: false,
            showCancelButton: false,
            cancelButtonText: "OK",
            confirmButtonColor: "#1e3a8a",
          }).then((result) => {
          });

          dispatch({
            type: "loginFailed",
            data: { message: "Konfimasi password tidak sesuai", status: false },
          });
        } else if (password.length < 8) {
          Swal.fire({
            icon: "error",
            text: "Password minimal 8 karakter",
            showCloseButton: false,
            showCancelButton: false,
            cancelButtonText: "OK",
            confirmButtonColor: "#1e3a8a",
          }).then((result) => {
          });

          dispatch({
            type: "loginFailed",
            data: { message: "Password minimal 8 karakter", status: false },
          });
        }else{

          try {
            const response = await API.post("/pelamar/resetPasswordConfirm", {
              email,
              password,
            });
  
            var { data, meta } = response.data;
            dispatch({
              type: "loginSuccess",
              data: {
                message: "Register sukses!",
                status: true,
  
              },
            });
            AlertSuccess({
              message: "Reset Password Berhasil",
            });
  
            router.push("/login");

          } catch (err) {
            var message = err.response.data.data;
            Swal.fire({
              icon: "error",
              text: message,
              showCloseButton: true,
              showCancelButton: false,
              cancelButtonText: "OK",
              confirmButtonColor: "#1e3a8a",
            }).then((result) => {
            });
            dispatch({
              type: "loginFailed",
              data: { message: err.response.data.data, status: false },
            });
          }
          
        }

      }
      else {
        Swal.fire({
          icon: "error",
          title: "Alamat URL sudah kadaluwarsa",
          showCloseButton: true,
          showCancelButton: false,
          cancelButtonText: "OK",
          confirmButtonColor: "#1e3a8a",
        }).then((result) => {
        });
        dispatch({
          type: "loginFailed",
          data: { message: 'Email anda tidak ditemukan', status: false },
        });
      }

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Alamat link sudah kadaluarsa",
        showCloseButton: true,
        showCancelButton: false,
        cancelButtonText: "OK",
        confirmButtonColor: "#1e3a8a",
      }).then((result) => {
      });

      dispatch({
        type: "loginFailed",
        data: { message: 'Email anda tidak ditemukan', status: false },
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        stateAuth,
        dispatch,
        Login,
        Logout,
        Forgot,
        Reset,
        getSession,
        getId,
        Register,
        getEmail,
        changePassword
      }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
