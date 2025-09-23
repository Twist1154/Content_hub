import type { FC } from 'react';
import { File, FileText, ImageIcon, MusicIcon, VideoIcon, FileArchiveIcon, FileCode2, Sheet } from 'lucide-react';

interface FileIconProps {
  fileType: string;
  className?: string;
}

const FileIcon: FC<FileIconProps> = ({ fileType, className }) => {
  if (fileType.startsWith('image/')) {
    return <ImageIcon className={className} />;
  }
  if (fileType.startsWith('video/')) {
    return <VideoIcon className={className} />;
  }
  if (fileType.startsWith('audio/')) {
    return <MusicIcon className={className} />;
  }
  if (fileType === 'application/pdf') {
    return <FileText className={className} />;
  }
  if (fileType.startsWith('application/vnd.ms-excel') || fileType.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml')) {
    return <Sheet className={className} />;
  }
  if (fileType.startsWith('application/zip') || fileType.startsWith('application/x-rar-compressed')) {
    return <FileArchiveIcon className={className} />;
  }
   if (fileType.startsWith('text/html') || fileType.startsWith('application/javascript') || fileType.startsWith('text/css')) {
    return <FileCode2 className={className} />;
  }
  return <File className={className} />;
};

export default FileIcon;
