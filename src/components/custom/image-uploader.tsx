import React, {useRef, useState} from 'react';
import {AspectRatio} from '@/components/ui/aspect-ratio';
import {Plus, X} from 'lucide-react';
import {cn} from '@/lib/utils';
import Image from "next/image";

interface ImageUploaderProps {
    id?: string;
    name?: string;
    onChange?: (file: File | null) => void;
    // 宽高比，默认 1:1
    aspectRatio?: number;
    // 最大文件大小（字节），默认 5MB
    maxSize?: number;
    accept?: string;
    className?: string;
    defaultValue?: string;
}

export function ImageUploader({
                                  id,
                                  name,
                                  accept,
                                  defaultValue,
                                  onChange,
                                  aspectRatio = 1,
                                  maxSize = 5 * 1024 * 1024,
                                  className,
                              }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(defaultValue ?? null);

    // 处理文件选择
    const handleFileChange =
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            // 验证文件大小
            if (file.size > maxSize) {
                alert(`图片大小不能超过 ${maxSize / 1024 / 1024}MB`);
                event.target.value = '';
                return;
            }

            // 验证文件类型
            if (!file.type.startsWith('image/')) {
                alert('请上传图片文件');
                event.target.value = '';
                return;
            }

            // 读取为 base64
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                setPreview(base64);
                onChange?.(file);
            };
            reader.readAsDataURL(file);

            // 清空 input 以便重复选择同一文件
            event.target.value = '';
        };

    // 触发文件选择
    const handleClick = () => {
        fileInputRef.current?.click();
    };

    // 删除图片
    const handleRemove =
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setPreview(null);
            onChange?.(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

    return (
        <div className={cn('relative', className)}>
            {/* 隐藏的文件输入 */}
            <input id={id}
                   name={name}
                   ref={fileInputRef}
                   type="file"
                   accept={accept ?? "image/*"}
                   onChange={handleFileChange}
                   className="hidden"
            />

            {/* 上传区域 */}
            <div
                onClick={handleClick}
                className={cn(
                    'relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
                    preview
                        ? 'border-solid border-primary/50'
                        : 'border-dashed border-muted-foreground/25 hover:border-primary hover:bg-accent/50'
                )}
            >
                <AspectRatio ratio={aspectRatio}>
                    {preview ? (
                        // 有图片时显示预览
                        <>
                            <Image src={preview}
                                   alt="file upload"
                                   fill
                                   className={'object-contain'}
                            />
                            {/* 悬停时的遮罩层和删除按钮 */}
                            <div
                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                                <button
                                    onClick={handleRemove}
                                    className="rounded-full bg-destructive p-1.5 text-destructive-foreground transition-transform hover:scale-110"
                                    aria-label="delete"
                                >
                                    <X className="h-4 w-4"/>
                                </button>
                            </div>
                        </>
                    ) : (
                        // 无图片时显示占位符
                        <div className="flex h-full flex-col items-center justify-center gap-1">
                            <Plus className="h-8 w-8 text-muted-foreground"/>
                            <span className="text-sm text-muted-foreground">点击上传图片</span>
                            <span className="text-xs text-muted-foreground/60">
                最大 {maxSize / 1024 / 1024}MB
              </span>
                        </div>
                    )}
                </AspectRatio>
            </div>
        </div>
    );
}