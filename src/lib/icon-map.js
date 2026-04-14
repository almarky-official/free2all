import {
  AudioLines,
  Download,
  FileStack,
  ImageDown,
  KeyRound,
  PenSquare,
  ScanSearch
} from "lucide-react";

export const iconMap = {
  download: Download,
  image: ImageDown,
  music: AudioLines,
  "scan-search": ScanSearch,
  "file-stack": FileStack,
  "key-round": KeyRound,
  "pen-square": PenSquare
};

export function getToolIcon(iconName) {
  return iconMap[iconName] || Download;
}
