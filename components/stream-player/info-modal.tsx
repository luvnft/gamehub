"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Hint } from "@/components/hint";
import { updateStream } from "@/actions/stream";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";
import { Trash } from "lucide-react";
import Image from "next/image";

interface InfoModalProps {
    initialName: string;
    initialThumbnailUrl: string | null | undefined;
}

export const InfoModal = ({
    initialName,
    initialThumbnailUrl,
}: InfoModalProps) => {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [thumbnailUrl, setThumbnailUrl] = useState(initialThumbnailUrl);

    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false); // Estado para controlar el diálogo

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setName(e.target.value);

    const onRemove = () => {
        startTransition(() => {
            updateStream({ thumbnailUrl: null })
                .then(() => {
                    toast.success("Thumbnail removed");
                    setThumbnailUrl("");
                    setIsOpen(false);
                })
                .catch(() => "Something went wrong");
        });
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        startTransition(() => {
            updateStream({ name: name })
                .then(() => {
                    toast.success("Stream updated");
                    setIsOpen(false);
                })
                .catch(() => toast.error("Something went wrong"));
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="link"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setIsOpen(true)}
                >
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit stream info</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-14">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            placeholder="Stream name"
                            onChange={onChange}
                            value={name}
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Thumbnail</Label>
                        {thumbnailUrl ? (
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
                                <div className="absolute top-2 right-2 z-[10]">
                                    <Hint
                                        label="Remove thumbnail"
                                        side="left"
                                        asChild
                                    >
                                        <Button
                                            type="button"
                                            disabled={isPending}
                                            onClick={onRemove}
                                            className="h-auto w-auto p-1.5"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </Hint>
                                </div>
                                <Image
                                    alt="Thumbnail"
                                    src={thumbnailUrl}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="rounded-xl border outline-dashed outline-muted">
                                <UploadDropzone
                                    endpoint="thumbnailUploader"
                                    appearance={{
                                        label: { color: "#FFFFF" },
                                        allowedContent: { color: "#FFFFFF" },
                                    }}
                                    onClientUploadComplete={(res) => {
                                        setThumbnailUrl(res?.[0].url);
                                        router.refresh();
                                        setIsOpen(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={isPending}
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            disabled={isPending}
                            type="submit"
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
