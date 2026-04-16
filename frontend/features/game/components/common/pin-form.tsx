"use client";

import { FormEvent, useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { getValidLobby } from "@/features/game/api/server-actions";
import { toast } from "sonner";
interface PinFormProps {
    onSuccess: (pin: string) => void;
}

export function PinForm({ onSuccess }: PinFormProps) {
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleJoinGame(e: FormEvent) {
        e.preventDefault();
        if (!pin) {
            toast.error("Please enter game PIN.");
            return;
        }

        setIsLoading(true);

        try {
            const lobby = await getValidLobby(pin);
            onSuccess(lobby.pin);
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-sm animate-in zoom-in-95 duration-500">
            <form
                onSubmit={handleJoinGame}
                className="flex flex-col gap-6 p-8 bg-(--app-elevated) rounded-3xl shadow-xl border-2 border-(--app-border)">
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Game PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-4 py-4 text-center text-xl font-black tracking-wide bg-(--app-input-bg) border-2 border-(--app-border) rounded-2xl text-(--app-fg) placeholder:text-(--app-fg-muted)/50 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                    autoFocus
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 rounded-2xl font-black text-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-(--app-surface-muted) disabled:text-(--app-fg-muted) disabled:cursor-not-allowed text-white transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-md"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Checking...
                        </>
                    ) : (
                        <>
                            Enter <ArrowRight size={22} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
