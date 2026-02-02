
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import { Mic, MicOff, Volume2, Loader2, Sparkles, AlertTriangle, Play, Square } from 'lucide-react';

const LiveSession: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // PCM Encoding/Decoding functions
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const startSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + ' ' + message.serverContent?.outputTranscription?.text);
            }
            
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outCtx) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => setError('حدث خطأ في الاتصال الصوتي.'),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: 'أنت مساعد صوتي رمضاني خبير. تحدث مع المستخدم بلطف وبصوت مسموع. أجب عن تساؤلاته حول رمضان والدين الإسلامي بأسلوب المحادثة الطبيعية.',
          outputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
      setIsActive(true);
    } catch (err) {
      setError('يرجى السماح بالوصول للميكروفون والتأكد من اتصالك بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsActive(false);
    setTranscription('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12 text-center animate-in fade-in duration-700">
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="p-6 bg-[#d4af37]/10 rounded-[2.5rem] text-[#d4af37] relative">
            <Mic size={48} className={isActive ? 'animate-pulse' : ''} />
            {isActive && (
              <span className="absolute inset-0 rounded-[2.5rem] border-2 border-[#d4af37] animate-ping opacity-25"></span>
            )}
          </div>
        </div>
        <h2 className="text-3xl font-amiri font-bold text-white">المحادثة الروحانية المباشرة</h2>
        <p className="text-gray-400">تحدث مع المساعد الذكي واحصل على إجابات صوتية فورية.</p>
      </div>

      <div className={`glass p-12 rounded-[3rem] border-2 transition-all duration-500 ${isActive ? 'border-[#d4af37] shadow-[0_0_50px_rgba(212,175,55,0.2)]' : 'border-white/5'}`}>
        {!isActive ? (
          <div className="space-y-6">
            <button 
              onClick={startSession}
              disabled={loading}
              className="w-24 h-24 bg-[#d4af37] rounded-full flex items-center justify-center text-[#050a18] shadow-2xl hover:scale-110 active:scale-95 transition-all mx-auto disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={32} /> : <Play fill="currentColor" size={32} />}
            </button>
            <p className="font-bold text-white">اضغط للبدء بالتحدث</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1.5 h-8 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
            
            <div className="bg-black/20 p-6 rounded-2xl min-h-[100px] flex items-center justify-center">
              <p className="text-gray-300 italic">
                {transcription || "المساعد يستمع إليك الآن... اسأله عن أي شيء"}
              </p>
            </div>

            <button 
              onClick={stopSession}
              className="px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold flex items-center gap-2 mx-auto hover:bg-red-500/20 transition-all"
            >
              <Square size={20} fill="currentColor" />
              إنهاء المحادثة
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 justify-center">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default LiveSession;
