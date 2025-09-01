import Swal from "sweetalert2";

export const AlertSuccess = ({ message }) =>
  Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    toast: true,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
  
export const AlertFailed = ({ message }) =>
  Swal.fire({
    icon: "error",
    title: "Failed",
    text: message,
    toast: true,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
