// hooks/useSweetAlert.js
import Swal from 'sweetalert2';

export const useSweetAlert = () => {
    // ✅ Reusable confirmation
    const confirmAction = async (options = {}) => {
        const {
            title = 'Are you sure?',
            text = "You won't be able to revert this!",
            confirmButtonText = 'Yes, do it!',
            ...otherOptions
        } = options;

        return await Swal.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText,
            ...otherOptions
        });
    };

    // ✅ Success alert
    const showSuccess = async (message = 'Success!', title = 'Done!') => {
        return await Swal.fire({
            icon: 'success',
            title,
            text: message,
            timer: 2000,
            showConfirmButton: false
        });
    };

    // ✅ Error alert
    const showError = (message = 'Something went wrong!', title = 'Error!') => {
        return Swal.fire({
            icon: 'error',
            title,
            text: message
        });
    };

    // ✅ Warning alert
    const showWarning = (message, title = 'Warning!') => {
        return Swal.fire({  
            icon: 'warning',
            title,
            text: message
        });
    }

    // ✅ Loading alert
    const showLoading = (message = 'Processing...') => {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    };

    // ✅ Close loading
    const closeLoading = () => {
        Swal.close();
    };

    // ✅ Input dialog
    const getInput = async (options = {}) => {
        const {
            title = 'Enter value',
            inputType = 'text',
            inputPlaceholder = '',
            ...otherOptions
        } = options;

        return await Swal.fire({
            title,
            input: inputType,
            inputPlaceholder,
            showCancelButton: true,
            ...otherOptions
        });
    };

    return {
        confirmAction,
        showSuccess,
        showError,
        showWarning,
        showLoading,
        closeLoading,
        getInput
    };
};