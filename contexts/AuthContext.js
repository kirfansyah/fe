import React, { createContext, useReducer, useState } from "react";
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
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  
  const router = useRouter();
  
  const Register = async ({ email, password, passwordConfirm, tc }) => {
    dispatch({ type: "loading" });
    if (tc) {
      if (password.length < 8) {
        Swal.fire({
          icon: "error",
          text: "Password minimal 8 karakter",
          showCloseButton: false,
          showCancelButton: false,
          cancelButtonText: "OK",
          confirmButtonColor: "#1e3a8a",
        }).then((result) => {});

        dispatch({
          type: "loginFailed",
          data: { message: "Password minimal 8 karakter", status: false },
        });
      } else { 
        Swal.fire({
          icon: "error",
          text: "Konfirmasi password tidak sesuai!",
          showCloseButton: false,
          showCancelButton: false,
          cancelButtonText: "OK",
          confirmButtonColor: "#1e3a8a",
        }).then((result) => {});
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
    dispatch({ type: "loading" });
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
      }).then((result) => {});

      dispatch({
        type: "loginFailed",
        data: { message: "Email anda tidak ditemukan", status: false },
      });
    }
  };

  const Login = async ({ nik, password, site_id, is_karyawan }) => {
    dispatch({ type: "loading" });

    try {
      const response = await API.post("/auth/login", { nik, password, site_id, is_karyawan });
      const { success, statusCode, message, data } = response.data;

      if (statusCode === 200 && data) {
        const user = data;
        
        document.cookie = `token=${user.token}; path=/`;
        document.cookie = `username=${user.nik}; path=/`;
        document.cookie = `nama=${user.nama}; path=/`;

        // ✅ FIX: Sesuaikan dengan backend response (snake_case)
        const mustChange = user.must_change_password || false;
        setMustChangePassword(mustChange);
        setIsFirstLogin(mustChange);
        
        // ✅ Simpan ke localStorage
        localStorage.setItem('mustChangePassword', mustChange.toString());
        localStorage.setItem('isFirstLogin', mustChange.toString());

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

        // ✅ KONDISI: Jika harus ganti password
        if (mustChange) {
          Swal.fire({
            icon: "warning",
            title: "Ganti Password Diperlukan",
            html: `
              <div style="text-align: left;">
                <p style="margin-bottom: 10px;">Hai <strong>${user.nama}</strong>,</p>
                <p style="margin-bottom: 10px;">Ini adalah login pertama Anda atau password Anda sudah kadaluarsa.</p>
                <p style="margin-bottom: 10px;"><strong>Untuk keamanan akun Anda, silakan ganti password sebelum melanjutkan.</strong></p>
              </div>
            `,
            confirmButtonColor: "#1e3a8a",
            confirmButtonText: "OK, Saya Mengerti",
            allowOutsideClick: false,
            customClass: {
              cancelButton: "swal-cancel-style",
              confirmButton: "swal-confirm-style",
            },
            allowEscapeKey: false,
            
          }).then((result) => {
            router.push("/dashboard");
          });
        } else {
          // Alert sukses normal
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: "success",
            title: "Berhasil Login",
            text: `Selamat datang ${user.nama}`,
            confirmButtonColor: "#1e3a8a",
            showConfirmButton: false,
            timer: 1500,
          }).then((result) => {
            router.push("/dashboard");
          });
        }
      } else {
        throw new Error("Login gagal");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Username atau password anda tidak sesuai';
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: "error",
        title: "Login Gagal",
        text: errorMessage,
        showCloseButton: true,
        confirmButtonColor: "#1e3a8a",
      });

      dispatch({
        type: "loginFailed",
        data: { message: errorMessage, status: false },
      });
    }
  };

  function getSession() {
    let cookie = `; ${document.cookie}`.match(`;\\s*token=([^;]+)`);
    let token = cookie ? cookie[1] : "";
    
    // ✅ Load flag dari localStorage
    const mustChange = localStorage.getItem('mustChangePassword') === 'true';
    const firstLogin = localStorage.getItem('isFirstLogin') === 'true';
    
    setMustChangePassword(mustChange);
    setIsFirstLogin(firstLogin);

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
      cancelButtonColor: "#1e3a8a",
      customClass: {
        cancelButton: "swal-cancel-style",
        confirmButton: "swal-confirm-style",
      }
    }).then((result) => {
      if (result.isConfirmed) {
        document.cookie = `token=; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        document.cookie = `profil=; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        document.cookie = `email=; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        
        // ✅ Clear localStorage flags
        localStorage.removeItem('mustChangePassword');
        localStorage.removeItem('isFirstLogin');
        setMustChangePassword(false);
        setIsFirstLogin(false);
        
        dispatch({
          type: "logout",
          data: { message: "berhasil logout", status: false, token: null },
        });
        router.push("/");
      }
    });
  };

  const changePassword = async ({
    current_password,
    new_password,
    confirm_new_password,
    profile_photo,
  }) => {
    let cookie = `; ${document.cookie}`.match(`;\\s*token=([^;]+)`);
    let token = cookie ? cookie[1] : "";
    dispatch({ type: "loading" });
    
    if (new_password === confirm_new_password) {
      try {
        await API.post("/auth/account", {
          current_password,
          new_password,
          confirm_new_password,
          profile_photo
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        // ✅ Clear force change password flags
        setMustChangePassword(false);
        setIsFirstLogin(false);
        localStorage.setItem('mustChangePassword', 'false');
        localStorage.setItem('isFirstLogin', 'false');

        dispatch({
          type: "changePassword",
          data: {
            message: "Update success!",
            status: true,
          },
        });
        
        AlertSuccess({
          message: "Password berhasil diubah!",
        });
        
        return { success: true };
        
      } catch (err) {
        var { data } = err.response;
        AlertFailed({
          message: data.message,
        });
        dispatch({
          type: "loginFailed",
          data: { message: data.message, status: false },
        });
        
        return { success: false };
      }
    } else {
      AlertFailed({
        message: "Password confirm is incorrect!",
      });
      dispatch({
        type: "loginFailed",
        data: { message: "Password confirm is incorrect!", status: false },
      });
      
      return { success: false };
    }
  };

  const Reset = async ({ email, key, password, passwordConfirm }) => {
    dispatch({ type: "loading" });
    try {
      const response = await API.post("/pelamar/resetPassword", { email, key });
      var { data, meta } = response.data;

      if (meta.code == 200) {
        if (password != passwordConfirm) {
          Swal.fire({
            icon: "error",
            text: "Konfimasi password tidak sesuai",
            showCloseButton: false,
            showCancelButton: false,
            cancelButtonText: "OK",
            confirmButtonColor: "#1e3a8a",
          }).then((result) => {});

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
          }).then((result) => {});

          dispatch({
            type: "loginFailed",
            data: { message: "Password minimal 8 karakter", status: false },
          });
        } else {
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
            }).then((result) => {});
            dispatch({
              type: "loginFailed",
              data: { message: err.response.data.data, status: false },
            });
          }
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Alamat URL sudah kadaluwarsa",
          showCloseButton: true,
          showCancelButton: false,
          cancelButtonText: "OK",
          confirmButtonColor: "#1e3a8a",
        }).then((result) => {});
        dispatch({
          type: "loginFailed",
          data: { message: "Email anda tidak ditemukan", status: false },
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
      }).then((result) => {});

      dispatch({
        type: "loginFailed",
        data: { message: "Email anda tidak ditemukan", status: false },
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
        changePassword,
        mustChangePassword,
        isFirstLogin,
        setMustChangePassword,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;