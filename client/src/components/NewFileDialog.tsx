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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface NewFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNewFile: (filename: string, fileType: string) => Promise<void>;
  isCreating: boolean;
}

export const NewFileDialog: React.FC<NewFileDialogProps> = ({
  isOpen,
  onClose,
  onNewFile,
  isCreating,
}) => {
  const [filename, setFilename] = useState("");
  const [fileType, setFileType] = useState("html");

  const handleCreateClick = async () => {
    if (filename && fileType) {
      // Adiciona a extensão se não estiver presente
      let finalFilename = filename;
      if (!filename.endsWith(`.${fileType}`)) {
        finalFilename = `${filename}.${fileType}`;
      }
      await onNewFile(finalFilename, fileType);
      setFilename("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            setFilename("");
            setFileType("html");
            onClose();
        }
    }}>
      <DialogContent className="sm:max-w-[425px] bg-[#16213E] border-[#2E8B57]/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Criar Novo Arquivo</DialogTitle>
          <DialogDescription className="text-gray-400">
            Adicione um novo arquivo ao seu Bite.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="filename" className="text-right text-gray-300">
                    Nome
                </Label>
                <Input
                    id="filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="col-span-3 bg-[#0F3460] border-[#2E8B57]/30 text-white"
                    placeholder="Ex: main"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="filetype" className="text-right text-gray-300">
                    Tipo
                </Label>
                <Select value={fileType} onValueChange={setFileType}>
                    <SelectTrigger id="filetype" className="col-span-3 bg-[#0F3460] border-[#2E8B57]/30 text-white">
                        <SelectValue placeholder="Selecione o tipo de arquivo" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#16213E] border-[#2E8B57]/30 text-white">
                        <SelectItem value="html">HTML (.html)</SelectItem>
                        <SelectItem value="css">CSS (.css)</SelectItem>
                        <SelectItem value="js">JavaScript (.js)</SelectItem>
                        <SelectItem value="md">Markdown (.md)</SelectItem>
                        <SelectItem value="json">JSON (.json)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleCreateClick}
            disabled={!filename || isCreating}
            className="bg-[#2E8B57] hover:bg-[#2E8B57]/90"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Arquivo"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
