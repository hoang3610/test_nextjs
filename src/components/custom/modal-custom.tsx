import { Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import ProgressBar from '../custom/progress-bar';
import IconX from '../icons/icon-x';

interface ModalCustomProps {
  titleModal: string;
  isOpen: boolean;
  onClose: (isClose: boolean) => void;
  bodyModal?: React.ReactNode;
  footerModal?: React.ReactNode;
  modalSize?: string | number // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 378 | '50%' | 'calc(100vw - 87px)';
  isAllowClose?: boolean
  centered?: boolean
  closeOnClickOutside?: boolean
  className?: string
  progress?: number // Optional progress bar value (0-100)
  customHeader?: React.ReactNode
}

export const ModalCustom = ({
  titleModal,
  bodyModal,
  footerModal,
  isOpen,
  onClose,
  modalSize = "80%",
  isAllowClose = true,
  centered = true,
  closeOnClickOutside = false,
  className,
  progress = 0,
  customHeader
}: ModalCustomProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (

    <Modal
      lockScroll
      styles={{
        modal: {
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: isMobile ? 'auto' : undefined,
          maxHeight: isMobile ? 'calc(100dvh - 60px)' : 'calc(100vh - 40px)',
          width: isMobile ? 'calc(100vw - 40px)' : undefined,
          margin: isMobile ? 'auto' : undefined,
        },
        body: {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
          minHeight: 0,
        },
        inner: {
          display: isMobile ? 'flex' : undefined,
          alignItems: isMobile ? 'center' : undefined,
          justifyContent: isMobile ? 'center' : undefined,
        }
      }}

      padding={0}
      transitionDuration={350}
      exitTransitionDuration={350}
      withCloseButton={false}
      size={modalSize}
      transition='pop'
      closeOnClickOutside={closeOnClickOutside}
      centered={centered}
      opened={isOpen}
      onClose={() => onClose(false)}
    >
      {customHeader ? (
        <div id="modal-header-custom" className="flex-shrink-0 z-10 w-full bg-white dark:bg-black shadow-sm">
          {customHeader}
        </div>
      ) : (
        <div id="modal-header" className="flex items-center justify-between py-8 shadow-lg h-[3.75rem] bg-white dark:bg-black px-6">
          <div className="flex items-center gap-2">
            <span className="border-r-4 rounded-r border-[#1462B0] w-[0.25rem] h-[2rem] rounded-l-none"></span>
            <span className="text-lg font-bold text-[#1462B0] uppercase">
              {titleModal}
            </span>
          </div>
          {isAllowClose && (
            <button
              onClick={() => onClose(false)}
              className="p-3 rounded-full bg-white-light/40 hover:bg-white-light/90 dark:hover:bg-dark/60 border border-[#e5e7eb]"
            >
              <div className="fill-black dark:fill-white">
                <IconX />
              </div>
            </button>
          )}
        </div>
      )}
      {/* ProgressBar (Visible if progress > 0) */}
      {progress > 0 && (
        <div className="w-full px-0">
          <ProgressBar progress={progress} height="h-1" showLabel={false} className="rounded-none" />
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <div className={`p-4 bg-[#F3F4F6] dark:bg-[#060716] dark:text-white ${className}`}>
          {bodyModal}
        </div>
      </div>
      <div id="modal-footer" className="flex items-center justify-end gap-4 px-4 py-2 shadow-lg h-[3.75rem] bg-white dark:bg-black">
        {footerModal}
      </div>
    </Modal>
  );
};
