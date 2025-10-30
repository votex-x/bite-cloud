import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface UploadFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export const UploadFileDialog: React.FC<UploadFileDialogProps> = ({
  isOpen,
  onClose,
  onUpload,
  isUploading,
}) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleUploadClick = async () => {
    if (file) {
      await onUpload(file);
      setFile(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            setFile(null);
            onClose();
        }
    }}>
      <DialogContent className="sm:max-w-[425px] bg-[#16213E] border-[#2E8B57]/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Upload de Arquivo</DialogTitle>
          <DialogDescription className="text-gray-400">
            Selecione um arquivo .html, .css ou .js. O conteúdo será convertido para texto e salvo no banco de dados.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="file"
            type="file"
            accept=".html,.css,.js"
            onChange={handleFileChange}
            className="col-span-3 bg-[#0F3460] border-[#2E8B57]/30 text-white"
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleUploadClick}
            disabled={!file || isUploading}
            className="bg-[#2E8B57] hover:bg-[#2E8B57]/90"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Converter e Enviar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
