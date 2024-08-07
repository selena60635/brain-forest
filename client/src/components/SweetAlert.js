import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const SweetAlert = async ({
  type,
  title,
  icon,
  html,
  text,
  confirmButtonText,
  showCancelButton,
  cancelButtonText,
}) => {
  const MySwal = withReactContent(Swal);
  const Toast = MySwal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      container: "mt-12",
    },
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  if (type === "toast") {
    return Toast.fire({
      icon,
      title,
    });
  }
  return MySwal.fire({
    title,
    icon,
    html,
    text,
    confirmButtonText,
    showCancelButton,
    cancelButtonText,
    customClass: {
      confirmButton: "bg-red-500",
      cancelButton: "bg-green-500",
    },
  });
};

export default SweetAlert;
