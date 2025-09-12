import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Camera } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const systemPreamble = `You are EcoAdvisor, a concise assistant helping users decide whether to sell or recycle waste.
Ask brief clarifying questions only when essential. Prioritize safety and local regulations.
When useful, suggest: (1) recycling steps, (2) marketplaces to sell, (3) price/condition factors, (4) environmental impact.`;

async function generateAdvice(apiKey: string, messages: ChatMessage[]): Promise<string> {
  // Build Gemini request
  const userTurns = messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));
  const body = {
    contents: [
      { role: "user", parts: [{ text: systemPreamble }] },
      ...userTurns,
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 512,
    },
  };

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(errText || `Gemini API error: ${resp.status}`);
  }

  const data = await resp.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
  return text;
}

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! Describe your waste (type, condition, quantity, location). I'll suggest whether to sell or recycle." },
  ]);
  const apiKey = useMemo(() => (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined, []);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // For file input and classification results
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || busy) return;
    if (!apiKey) {
      setMessages(prev => [...prev, { role: "assistant", content: "Gemini API key missing. Set VITE_GEMINI_API_KEY in your .env." }]);
      return;
    }
    const nextMessages = [...messages, { role: "user", content: trimmed } as ChatMessage];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    try {
      const reply = await generateAdvice(apiKey, nextMessages);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: e?.message || "Failed to contact Gemini." }]);
    } finally {
      setBusy(false);
    }
  };

  // Handle lens button click to open file input
  const handleLensClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and classification
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setMessages(prev => [...prev, { role: "assistant", content: "No file selected." }]);
      return;
    }
    const file = e.target.files[0];

    // Display the uploaded image
    const imageUrl = URL.createObjectURL(file);
    setMessages(prev => [...prev, {
      role: "user",
      content: `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin: 8px 0;" />`
    }]);

    setMessages(prev => [...prev, { role: "assistant", content: "Analyzing your waste image..." }]);
    setBusy(true);

    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      console.log('Sending image to API:', file.name, file.size, file.type);
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      console.log('API response status:', response.status, response.statusText);
      console.log('API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Server responded with status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      // Sort results by confidence
      const sortedResults = Object.entries(data)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5); // Top 5 predictions

      // Format results with better visualization
      let resultText = "🔍 **Waste Classification Results:**\n\n";
      resultText += `🎯 **Top Prediction:** ${sortedResults[0][0]} (${(sortedResults[0][1] as number * 100).toFixed(1)}%)\n\n`;
      resultText += "**All Predictions:**\n";
      sortedResults.forEach(([label, score], index) => {
        const percentage = (score as number * 100).toFixed(1);
        const bar = "█".repeat(Math.round((score as number) * 20)); // Simple progress bar
        resultText += `${index + 1}. ${label}: ${percentage}% ${bar}\n`;
      });

      resultText += "\n💡 **Recommendation:** Based on this classification, I can help you decide whether to recycle or sell this waste material.";

      setMessages(prev => [...prev, { role: "assistant", content: resultText }]);
    } catch (error: any) {
      console.error('Classification error:', error);
      setMessages(prev => [...prev, { role: "assistant", content: `Failed to get a classification. Error: ${error.message}` }]);
    } finally {
      setBusy(false);
      // Clear the file input value to allow re-uploading the same file if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button variant="eco" size="sm" onClick={() => setOpen(true)}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Ask EcoAdvisor
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>EcoAdvisor</DialogTitle>
          </DialogHeader>
          <Card className="border-none shadow-none">
            <div className="h-64">
              <ScrollArea className="h-full pr-3">
                <div className="space-y-3">
                  {messages.map((m, i) => (
                    <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                      <div className={`inline-block rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
            </div>
            <div className="mt-3 grid grid-cols-[auto_1fr_auto] gap-2 items-center">
              <Button onClick={handleLensClick} disabled={busy} variant="outline" size="sm" title="Upload image for classification">
                <Camera className="w-5 h-5" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 20kg clean PET bottles in Chennai — sell or recycle?"
                className="min-h-[44px]"
              />
              <Button onClick={handleSend} disabled={busy}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {!apiKey && (
              <div className="mt-2 text-xs text-destructive">Set VITE_GEMINI_API_KEY in your .env to enable the chatbot.</div>
            )}
          </Card>
        </DialogContent>
      </Dialog>

      {/* Hidden file input for image upload */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
};

export default Chatbot;


