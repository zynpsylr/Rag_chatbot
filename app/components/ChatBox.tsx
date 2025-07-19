'use client'
import React, { useState, useRef, useEffect } from "react";
import { FiPaperclip } from "react-icons/fi";
import { RiSendPlaneFill } from "react-icons/ri";

interface Message {
    id: number;
    sender: "user" | "bot";
    text: string;
}

const ChatBox =() => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [dotCount, setDotCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Mesajlar listesinin sonuna scroll yapma
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // "Yazıyor..." efekti için ekrandaki noktaların sayısını her 500ms'de bir güncelleyen zamanlayıcı
    useEffect(() => {
        if (!loading) {
            setDotCount(0);
            return;
        }

        const interval = setInterval(() => {
            setDotCount((prev) => (prev + 1) % 4);
        }, 500);

        return () => clearInterval(interval);
    }, [loading]);

    // Kullanıcı mesajı gönderme fonksiyonu
    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now(),
            sender: "user",
            text: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: userMessage.text }),
            });

            if (!res.ok) throw new Error("API çağrısı başarısız.");

            const data = await res.json();

            const botMessage: Message = {
                id: Date.now() + 1,
                sender: "bot",
                text: data?.answer || "Bir hata oluştu.",
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 2,
                    sender: "bot",
                    text: "Bir hata oluştu.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Enter tuşuna basıldığında mesaj gönder
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !loading) {
            sendMessage();
        }
    };

    // Dosya seçildiğinde otomatik olarak yükle
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);

        // Kullanıcıya dosya gönderiliyor mesajı ekle
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                sender: "user",
                text: `${file.name} gönderiliyor...`,
            },
        ]);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Dosya yükleme başarısız.");

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: "bot",
                    text: data?.message || `${file.name} başarıyla yüklendi.`,
                },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 2,
                    sender: "bot",
                    text: "Dosya yüklenirken bir hata oluştu.",
                },
            ]);
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Ataç butonuna tıklandığında dosya seçiciyi aç
    const handleAttachClick = () => {
        if (!loading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="w-full h-screen border border-gray-200 flex flex-col bg-gray-50 shadow-md relative">
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-base break-words mb-1 ${
                            msg.sender === "user"
                                ? "self-end bg-blue-600 text-white"
                                : "self-start bg-gray-200 text-gray-900"
                        }`}
                    >
                        {msg.text}
                    </div>
                ))}

                {/* Bot yazıyor animasyonu */}
                {loading && (
                    <div className="max-w-[75%] px-4 py-2 rounded-2xl text-base break-words mb-1 self-start bg-gray-200 text-gray-900">
                        Yazıyor{'.'.repeat(dotCount)}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="flex border border-gray-200 p-3 bg-white items-center rounded-xl mx-4 my-3 shadow-md">
                
                {/* Dosya açma butonu */}
                <button
                   type="button"
                   className="mr-2 p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
                   onClick={handleAttachClick}
                   disabled={loading}
                   aria-label="Dosya ekle"
                >
                    <FiPaperclip size={22} />
                </button>

                {/* Gizli dosya input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={loading}
                />

                {/* Mesaj yazma input */}
                <input
                    className="flex-1 text-base px-4 py-3 rounded-full border border-gray-300 outline-none mr-2"
                    type="text"
                    placeholder="Bir soru yazın"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                />

                 {/* Gönder butonu */}
                <button
                    className="px-6 py-3 rounded-full border-none bg-blue-600 text-white font-semibold cursor-pointer text-base disabled:opacity-50 flex items-center gap-2"
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                >
                    Gönder <RiSendPlaneFill size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatBox;
