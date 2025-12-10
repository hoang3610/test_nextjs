import { Modal } from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { StaticImageData } from "next/image";
import ic_image_default from "../../assets/icons/ic_image_default.svg";
import ic_user_default from "../../assets/icons/ic_user_default.svg";
import CookieUtils from "../../utils/cookie-utils";
import ic_notify_default from "../../assets/images/notify-img-default.png"


interface ImageProps {
  url?: string | null;
  className?: string;
  onClick?: () => void;
  fallBackUrl?: string;
  style?: React.CSSProperties;
  isLocal?: boolean;
  isUser?: boolean;
  isReview?: boolean;
  isNotify?: boolean;
}

const ImageCustom: FC<ImageProps> = ({
  url,
  className,
  onClick,
  fallBackUrl,
  style,
  isLocal = true,
  isUser = true,
  isReview = false,
  isNotify = false,
}: ImageProps) => {
  const imageDefault = isUser ? ic_user_default : isNotify ? ic_notify_default : ic_image_default;

  // Compute initial source synchronously to avoid empty string flash
  // If url is null/empty, fallback to imageDefault immediately.
  const getImageSrc = () => {
    if (!url) return imageDefault;

    if (isLocal) return url;

    if (typeof url === 'string' && url.startsWith("http")) return url;

    const mediaURL = CookieUtils.getCookie("CONFIG_RESOURCE_URL");
    return mediaURL ? `${mediaURL}/${url}` : url;
  };

  const [imageSrc, setImageSrc] = useState<string | StaticImageData>(getImageSrc());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setImageSrc(getImageSrc());
  }, [url, isLocal, imageDefault]);

  const handleError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    event.currentTarget.onerror = null;
    const fallback = fallBackUrl ?? imageDefault;
    if (fallback) {
      event.currentTarget.src = typeof fallback === 'string' ? fallback : fallback.src;
    }
  };

  const handleClick = () => {
    if (isReview) {
      setIsModalOpen(true);
    } else if (onClick) {
      onClick();
    }
  };

  // If we still somehow have no source and no default, don't render img to strictly avoid empty src
  if (!imageSrc && !imageDefault) return null;

  // Use a derived variable for the actual src string/object
  // Note: StaticImageData (Next.js imports) works with NextImage but here we use <img>.
  // <img> src expects string. StaticImageData object has .src property.
  const finalSrc = typeof imageSrc === 'string' ? imageSrc : imageSrc.src;

  if (!finalSrc) return null; // Avoid "src=''"

  return (
    <>
      {onClick || isReview ? (
        <button
          className="w-full h-full p-0 border-none"
          onClick={handleClick}
          style={style}
          type="button"
        >
          <img
            className={className}
            src={finalSrc}
            onError={handleError}
            alt="image"
          />
        </button>
      ) : (
        <img
          className={className}
          src={finalSrc}
          onError={handleError}
          style={style}
          alt="image"
        />
      )}

      {isReview && (
        <Modal
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="80%"
          withCloseButton={false}
          transitionDuration={350}
          exitTransitionDuration={350}
        >
          <div style={{ height: "calc(100vh - 48px - 48px)" }} className="p-2">
            <img
              className="object-contain w-full h-full"
              src={finalSrc}
              onError={handleError}
              alt="preview"
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default ImageCustom;
