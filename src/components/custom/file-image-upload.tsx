import { useEffect, useRef, useState } from 'react'
import { IcCloseSwitchButton, IcCamera } from '../icons/icon-group';
import { ButtonCustom } from './button-custom';
import ImageCustom from './image-custom';



interface Props {
    imageDefault?: string
    onUpload: (images: FileList) => void
}

const FileImageUpload = ({ imageDefault, onUpload }: Props) => {
    const [image, setImage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setImage(imageDefault ?? "");
    }, [imageDefault])

    const handleButtonClick = () => {
        if (fileInputRef?.current) {
            fileInputRef.current.click(); // Kích hoạt thẻ input
        }
    };

    const handleImageChange = (event: any) => {
        const file = event.target.files;
        if (file.length > 0) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string); // Cập nhật URL hình ảnh
            };
            reader.readAsDataURL(file[0]); // Đọc tệp dưới dạng URL
            onUpload(file);
        }
    };

    const handleDrop = (event: any) => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles.length > 0) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string); // Cập nhật URL hình ảnh
            };
            reader.readAsDataURL(droppedFiles[0]); // Đọc tệp dưới dạng URL
            onUpload(droppedFiles);
        }
    };
    return (
        <div className="col-span-full">
            <div className="relative drag-drop mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 bg-white dark:bg-[#121e32]">
                <section
                    aria-labelledby="image-upload-label"
                    className="items-center text-center"
                    onDrop={handleDrop}
                    onDragOver={(event) => event.preventDefault()}
                >
                    <input id="file-upload" ref={fileInputRef} accept="image/*" name="file-upload" onChange={handleImageChange} type="file" className="sr-only" />
                    {
                        image ? (
                            <>
                                <div className="flex justify-end align-start">
                                    <ButtonCustom
                                        text="Chọn ảnh"
                                        className="absolute btn-sm top-1 right-1"
                                        onClick={handleButtonClick}
                                        icon={<IcCamera />}
                                    />
                                </div>

                                <div className="relative" >
                                    <button
                                        type="button"
                                        className="custom-file-container__image-clear bg-[#71717a] dark:bg-dark dark:text-white-dark rounded-full block w-fit p-0.5 absolute top-0"
                                        title="Clear Image"
                                        onClick={() => { setImage(""); }}
                                    >
                                        <IcCloseSwitchButton className="w-3 h-3" />
                                    </button>
                                    <ImageCustom
                                        url={image}
                                        className="w-[250px] h-[250px]rounded-md overflow-hidden object-cover"
                                        isLocal={false}
                                    />
                                </div>
                            </>

                        ) :
                            (
                                <>
                                    <svg className="w-12 h-12 mx-auto text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon">
                                        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clip-rule="evenodd" />
                                    </svg>
                                    <div className="flex mt-4 text-gray-600 text-sm/6">
                                        <label htmlFor="file-upload" className="relative font-semibold text-indigo-600 bg-white rounded-md cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                                            <span>Chọn một ảnh</span>
                                        </label>
                                        <p className="pl-1">hoặc kéo và thả tại đây</p>
                                    </div>
                                    <p className="text-gray-600 text-xs/5">PNG, JPG up to 10MB</p>
                                    <div className="flex items-center justify-center mt-4">
                                        <ButtonCustom
                                            text="Chọn ảnh"
                                            className="text-gray-500 bg-gray-100 hover:bg-gray-400 hover:text-white btn-sm"
                                            onClick={handleButtonClick}
                                            icon={<IcCamera />}
                                        />
                                    </div>
                                </>
                            )
                    }
                </section>
            </div>
        </div>
    )
}

export default FileImageUpload