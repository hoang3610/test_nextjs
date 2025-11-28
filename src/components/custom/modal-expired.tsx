import { MODULE_ROUTE } from "../../routers/module-router";
import { useExpired } from "../../state/expired-context";
import CookieUtils from "../../utils/cookie-utils";
import { IconWarning } from "../icons/icon-group";
import { ButtonCustom } from "./button-custom";
import { ModalCustom } from "./modal-custom";

interface ModalExpiredProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}
export const ModalExpired = ({ isOpen, setIsOpen }: ModalExpiredProps) => {
  const { expired, setExpired } = useExpired();
  const bodyModal = () => {
    return (
      <div className="flex flex-col items-center justify-center">
        <IconWarning className="w-16 h-16 mb-3" />
        <label htmlFor="name" className="text-center">
          Phiên đăng nhập hết hạn!
        </label>
      </div>
    );
  };

  const footerModal = () => {
    return (
      <ButtonCustom
        type="button"
        text="Đăng xuất"
        onClick={() => {
          setIsOpen(expired);
          CookieUtils.eraseCookie("user");
          CookieUtils.eraseCookie("branch_id");
          setExpired(false);
          localStorage.removeItem("chatHistory");
          window.location.href = MODULE_ROUTE.LOGIN;
        }}
        className="text-gray-500 bg-gray-100 hover:bg-gray-400 hover:text-white"
      />
    );
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      isAllowClose={false}
      modalSize="50%"
      onClose={setIsOpen}
      titleModal="Thông báo"
      bodyModal={bodyModal()}
      footerModal={footerModal()}
    />
  );
};
