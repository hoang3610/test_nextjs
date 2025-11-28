import { ReactNode, useState } from "react";
import { IconCheckSuccess, IcXCircle, IconWarning } from "../icons/icon-group";
import { ButtonCustom } from "./button-custom";
import { ModalCustom } from "./modal-custom"

interface BaseModalConfirmCustomProps {
    isOpen: boolean,
    titleModal?: string,
    content?: string | ReactNode,
    typeIcon?: 'success' | 'error' | 'warning' | 'none' | 'other',
    icon?: any
    placeholder?: string,
    errorText?: string,
    isLoading?: boolean,
    onClose: () => void
}

interface ConfirmModalProps extends BaseModalConfirmCustomProps {
    isModalReason?: false
    isRequiredReason?: never
    onConfirm: () => void,
}

interface CancelModalProps extends BaseModalConfirmCustomProps {
    isModalReason?: true
    isRequiredReason?: boolean
    onConfirm: (cancelReason: string) => void,
}

type ModalConfirmCustomProps = ConfirmModalProps | CancelModalProps;

const ModalConfirmCustom = ({
    isOpen, content,
    titleModal = 'Xác nhận',
    typeIcon = 'success',
    placeholder = 'Nhập lý do hủy',
    errorText = 'Vui lòng nhập lý do hủy',
    isLoading = false,
    isModalReason = false,
    isRequiredReason = true,
    onConfirm, onClose, icon
}: ModalConfirmCustomProps) => {

    const [cancelReason, setCancelReason] = useState('');
    const [isModalReasonEmpty, setIsModalReasonEmpty] = useState(false);

    const bodyModal = () => {
        return (
            <>
                {isModalReason ? (
                    <>
                        <textarea
                            required
                            value={cancelReason}
                            rows={4}
                            title={placeholder}
                            className={`w-full form-textarea form-input ${isModalReasonEmpty ? '!border-red-500' : ''}`}
                            placeholder={placeholder}
                            onChange={(e) => {
                                setCancelReason(e.target.value)
                            }}
                            onFocus={() => setIsModalReasonEmpty(false)}
                        />
                        {isModalReasonEmpty && <span className="text-sm text-red-500">{errorText}</span>}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        {(() => {
                            switch (typeIcon) {
                                case 'success': return <IconCheckSuccess className="w-16 h-16 mx-auto" />
                                case 'error': return <IcXCircle className="w-16 h-16 mx-auto" />
                                case 'warning': return <IconWarning className="w-16 h-16 mx-auto" />
                                case 'other': return icon
                                default: return null
                            }
                        })()}
                        {typeof content === 'string' ? (
                            <label htmlFor="name" className="text-center text-slate-800">
                                {content}
                            </label>
                        ) : content}
                    </div>
                )}
            </>
        )
    }

    const footerModal = () => {
        return (
            <ButtonCustom
                isLoading={isLoading}
                type="button"
                text="xác nhận"
                onClick={() => {
                    if (isModalReason) {
                        if (!cancelReason.trim() && isRequiredReason) {
                            setIsModalReasonEmpty(true);
                            return
                        }
                        setIsModalReasonEmpty(false);
                        onConfirm(cancelReason);
                    } else {
                        (onConfirm as () => void)();
                    }
                }}
            />
        );
    };

    return (
        <ModalCustom
            isOpen={isOpen}
            modalSize="lg"
            onClose={() => {
                setCancelReason('')
                setIsModalReasonEmpty(false)
                onClose()
            }}
            titleModal={titleModal}
            bodyModal={bodyModal()}
            footerModal={footerModal()}
        />
    )
}

export default ModalConfirmCustom