
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic2, X, Volume2, Shield, Brain, Sparkles, AlertCircle, Lock, Crown, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StoicGuidanceProps {
  user_uid: string;
  currentPlan?: string;
}

// Implementation of encode/decode for the Live API
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const StoicGuidance: React.FC<StoicGuidanceProps> = ({ user_uid, currentPlan = 'Disciple' }) => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const isSage = currentPlan === 'Sage';

  const startGuidance = async () => {
    if (!isSage) return;
    setIsConnecting(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
            setIsActive(true);
            setIsConnecting(false);
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
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
          onerror: (e) => {
            setError("Connection failed. The Sage is silent.");
            stopGuidance();
          },
          onclose: () => stopGuidance(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
          systemInstruction: "You are a wise Stoic mentor. Your voice is calm, deep, and authoritative. Help the user re-center their mind. Keep your responses sparse and profound. Focus on the dichotomy of control.",
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      setError("Microphone access is required for guidance.");
      setIsConnecting(false);
    }
  };

  const stopGuidance = () => {
    sessionRef.current?.close();
    audioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    sourcesRef.current.forEach(s => s.stop());
    setIsActive(false);
    setIsConnecting(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col items-center justify-center p-8 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className={`w-[800px] h-[800px] rounded-full blur-[160px] absolute -top-40 -left-40 transition-all duration-1000 ${isActive ? 'bg-indigo-500/20 scale-110' : 'bg-slate-200/40'}`}></div>
      </div>

      <div className="text-center space-y-4 mb-16">
        <div className="flex items-center justify-center gap-3 text-slate-400 mb-2">
          <Mic2 size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Stoic Guidance</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Vocalized Wisdom</h1>
        <p className="text-slate-500 font-light italic max-w-sm mx-auto">
          "The voice of reason speaks only when the mind is ready to listen."
        </p>
      </div>

      {/* The Guidance Orb with Paywall */}
      <div className="relative mb-20">
        {isActive && (
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse scale-150"></div>
        )}
        
        {!isSage && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[8px] rounded-full scale-125 border border-white/40 shadow-2xl">
            <div className="bg-slate-900 text-white p-4 rounded-3xl mb-4 animate-bounce">
              <Crown size={32} className="text-amber-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 mb-4">Sage Standing Required</p>
            <button 
              onClick={() => navigate('/profile')}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
            >
              Ascend Now <ArrowUpRight size={14} />
            </button>
          </div>
        )}

        <button 
          onClick={isActive ? stopGuidance : startGuidance}
          disabled={isConnecting || !isSage}
          className={`w-64 h-64 rounded-full flex flex-col items-center justify-center transition-all duration-700 relative overflow-hidden group shadow-2xl ${
            isActive 
              ? 'bg-slate-900 scale-110' 
              : 'bg-white border border-slate-100'
          } ${!isSage ? 'opacity-40 grayscale blur-[2px]' : 'hover:scale-105 hover:border-indigo-100'}`}
        >
          {isConnecting ? (
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          ) : isActive ? (
            <>
              <div className="flex gap-1.5 items-center mb-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-1 h-8 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Listening...</span>
              <X size={24} className="mt-4 text-white/40 group-hover:text-white transition-colors" />
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <Mic2 size={32} />
              </div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Initiate Session</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl border border-rose-100 animate-in slide-in-from-top-4">
          <AlertCircle size={18} />
          <span className="text-xs font-bold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-2xl mt-8">
        {[
          { icon: <Shield size={18} />, label: "Grounding", desc: "Emergency calm" },
          { icon: <Brain size={18} />, label: "Clarity", desc: "Mental audit" },
          { icon: <Sparkles size={18} />, label: "Perspective", desc: "The view from above" }
        ].map((feat, i) => (
          <div key={i} className="flex flex-col items-center text-center p-6 glass-card rounded-3xl relative">
            {!isSage && <Lock size={12} className="absolute top-4 right-4 text-slate-300" />}
            <div className="text-slate-300 mb-3">{feat.icon}</div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">{feat.label}</h4>
            <p className="text-[10px] text-slate-400 font-bold">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoicGuidance;
