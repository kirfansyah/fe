// hooks/useSweetAlert.js
import Swal from 'sweetalert2';

export const useSweetAlert = () => {
    // ❌ MODAL - Confirmation (butuh user action)
    const confirmAction = async (options = {}) => {
        const {
            title = 'Apakah Anda yakin?',
            text = "Data tidak dapat dikembalikan!",
            confirmButtonText = 'Ya, lanjutkan!',
            cancelButtonText = 'Batal',
            ...otherOptions
        } = options;

        return await Swal.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText,
            cancelButtonText,
            ...otherOptions,
            customClass: {
                cancelButton: "swal-cancel-style",
                confirmButton: "swal-confirm-style",
            }
        });
    };

    // ✅ TOAST - Success (quick feedback)
    const showSuccess = (message = 'Berhasil!') => {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: message,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    };

    // ❌ MODAL - Error (important message)
    const showError = (message = 'Terjadi kesalahan!', title = 'Error') => {
        return Swal.fire({
            icon: 'error',
            title,
            text: message,
            confirmButtonColor: '#1e3a8a',
            confirmButtonText: 'OK',
            customClass: { 
                confirmButton: "swal-ok-style",
            }
        });
    };

    // ❌ MODAL - Warning (need attention)
    const showWarning = (message, title = 'Peringatan') => {
        return Swal.fire({
            icon: 'warning',
            title,
            text: message,
            confirmButtonColor: '#f59e0b',
            confirmButtonText: 'OK',
            customClass: { 
                confirmButton: "swal-ok-style",
            }
        });
    };

    // ✅ TOAST - Info (quick info)
    const showInfo = (message) => {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    };

    // ❌ MODAL - Loading (blocking)
    const showLoading = (message = 'Memproses...') => {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    };

    const closeLoading = () => {
        Swal.close();
    };

    // ❌ MODAL - Input (need user input)
    const getInput = async (options = {}) => {
        const {
            title = 'Masukkan nilai',
            inputType = 'text',
            inputPlaceholder = '',
            inputLabel = '',
            ...otherOptions
        } = options;

        return await Swal.fire({
            title,
            input: inputType,
            inputLabel,
            inputPlaceholder,
            showCancelButton: true,
            confirmButtonColor: '#1e3a8a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'OK',
            cancelButtonText: 'Batal',
            ...otherOptions,
            customClass: { 
                confirmButton: "swal-ok-style",
                cancelButton: "swal-cancel-style",
            }
        });
    };

    // ✅ TOAST - Delete Success (quick feedback after confirm)
    const showDeleteSuccess = (message = 'Data berhasil dihapus!') => {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: message,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });
    };

    // ✅ TOAST - Update Success
    const showUpdateSuccess = (message = 'Data berhasil diperbarui!') => {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: message,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });
    };

    return {
        confirmAction,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,
        closeLoading,
        getInput,
        showDeleteSuccess,
        showUpdateSuccess,
    };
};