import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
  MuxUploaderStatus,
} from "@mux/mux-uploader-react";

interface StudioUploaderProps {
  endpoint?: string | null;
  onSucess?: () => void;
}

export const StudioUploader = ({ endpoint, onSucess }: StudioUploaderProps) => {
  return (
    <div>
      <MuxUploader endpoint={endpoint} />
      <p>kkkkk</p>
    </div>
  );
};
