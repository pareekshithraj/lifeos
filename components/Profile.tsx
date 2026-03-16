
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Award, Zap, Target, BookOpen, Quote, ShieldCheck, PenTool, 
  Check, Camera, X, Scissors, Save, Users, Info, RotateCcw, 
  Maximize, ZoomIn, Crown, Sparkles, Shield, ArrowUpRight, 
  CheckCircle2, Flame, Scale, Brain, Anchor, Globe
} from 'lucide-react';
import Cropper, { Area, Point } from 'react-easy-crop';
import SovereignAvatar from './SovereignAvatar';

interface ProfileData {
  name: string;
  identity: string;
  mission: string;
  avatar: string | null;
  followingCount?: number;
  followersCount?: number;
  plan?: string;
}

interface ProfileProps {
  data: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => void;
}

const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No 2d context');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    image.onerror = (error) => reject(error);
  });
};

const Profile: React.FC<ProfileProps> = ({ data, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localName, setLocalName] = useState(data.name);
  const [localIdentity, setLocalIdentity] = useState(data.identity);
  const [localMission, setLocalMission] = useState(data.mission);

  useEffect(() => {
    if (!isEditing) {
      setLocalName(data.name);
      setLocalIdentity(data.identity);
      setLocalMission(data.mission);
    }
  }, [data, isEditing]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleSaveText = () => {
    onUpdate({ name: localName, identity: localIdentity, mission: localMission });
    setIsEditing(false);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setImageToCrop(reader.result as string); setZoom(1); };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const applyCrop = async () => {
    if (imageToCrop && croppedAreaPixels) {
      setIsProcessing(true);
      try {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        onUpdate({ avatar: croppedImage });
        setImageToCrop(null);
      } catch (e) { console.error(e); } finally { setIsProcessing(false); }
    }
  };

  const getPlanDetails = () => {
    const planName = data.plan?.toLowerCase() || 'disciple';
    switch (planName) {
      case 'sage': 
        return { 
          label: 'Sage Council', 
          icon: <Crown size={16} />, 
          color: 'bg-amber-100 text-amber-700 border-amber-200 shadow-amber-100',
          desc: 'High Council Standing',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]'
        };
      case 'architect': 
        return { 
          label: 'Architect', 
          icon: <Sparkles size={16} />, 
          color: 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-indigo-100',
          desc: 'Structural Visionary',
          glow: 'shadow-[0_0_20px_rgba(79,70,229,0.2)]'
        };
      default: 
        return { 
          label: 'Disciple', 
          icon: <Shield size={16} />, 
          color: 'bg-slate-100 text-slate-500 border-slate-200 shadow-slate-100',
          desc: 'Initiate Status',
          glow: ''
        };
    }
  };

  const handleAscend = (tierName: string) => {
    onUpdate({ plan: tierName });
  };

  const planInfo = getPlanDetails();

  const tiers = [
    { 
      id: 'Disciple', 
      name: 'Disciple', 
      price: 'Free', 
      icon: <Shield size={20} />, 
      color: 'text-slate-500', 
      bg: 'bg-slate-50',
      features: ['Temporal Tracking', 'Daily Disciplines', 'Local-First Privacy', 'Standard Reflections'] 
    },
    { 
      id: 'Architect', 
      name: 'Architect', 
      price: '$9/mo', 
      icon: <Sparkles size={20} />, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      features: ['Gemini AI Wisdom Audits', 'Control Matrix Insights', 'Priority Estate Mapping', 'Advanced Analytics'] 
    },
    { 
      id: 'Sage Council', 
      name: 'Sage Council', 
      price: '$29/mo', 
      icon: <Crown size={20} />, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      features: ['Live Stoic Voice Guidance', 'Agora Influence Multiplier', 'Council Direct Mentorship', 'Early Protocol Access'] 
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* Identity Header */}
      <section className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
          <ShieldCheck size={200} />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
          <div className="relative group shrink-0">
            <SovereignAvatar 
              name={data.name}
              avatar={data.avatar}
              size="xl"
              onClick={handleAvatarClick}
              className={isEditing ? 'ring-8 ring-indigo-50 shadow-2xl scale-105' : 'active:scale-95 shadow-xl'}
            />
            <div 
              onClick={handleAvatarClick}
              className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity backdrop-blur-[2px] rounded-[2.5rem] md:rounded-[3rem] cursor-pointer"
            >
              <Camera size={24} className="mb-2 text-white" />
              <span className="text-[10px] uppercase font-black tracking-widest text-white">Focus Identity</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-6 w-full">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                  <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border ${planInfo.color} ${planInfo.glow} transition-all`}>
                    {planInfo.icon}
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[10px] font-black uppercase tracking-widest">{planInfo.label}</span>
                      <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-50 mt-1">{planInfo.desc}</span>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <input autoFocus value={localName} onChange={e => setLocalName(e.target.value)} className="text-4xl md:text-6xl font-black text-slate-900 border-b-4 border-slate-900 focus:outline-none bg-transparent w-full py-2 tracking-tighter" />
                ) : (
                  <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter truncate leading-[0.9]">{data.name}</h1>
                )}
              </div>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="p-4 bg-slate-50 text-slate-300 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100 rounded-[1.5rem] transition-all shadow-sm">
                  <PenTool size={22} />
                </button>
              )}
            </div>

            <div className="min-h-[2rem]">
              {isEditing ? (
                <input value={localIdentity} onChange={e => setLocalIdentity(e.target.value)} className="text-2xl font-bold text-indigo-600 border-b-2 border-indigo-100 focus:border-indigo-600 focus:outline-none bg-transparent w-full py-2" />
              ) : (
                <p className="text-2xl font-bold text-indigo-600 tracking-tight">{data.identity}</p>
              )}
            </div>
            
            <div className="relative">
              <Quote size={20} className="absolute -top-2 -left-6 text-slate-200" />
              {isEditing ? (
                <textarea 
                  value={localMission} 
                  onChange={e => setLocalMission(e.target.value)} 
                  className="w-full bg-slate-50 border-none rounded-2xl p-6 italic text-slate-600 focus:ring-2 focus:ring-indigo-100 transition-all resize-none h-24"
                  placeholder="Define your mission statement..."
                />
              ) : (
                <p className="text-xl text-slate-400 font-light italic leading-relaxed max-w-xl mx-auto md:mx-0">
                  {data.mission}
                </p>
              )}
            </div>

            {isEditing && (
              <div className="pt-8 flex flex-wrap justify-center md:justify-start gap-4">
                <button onClick={handleSaveText} className="bg-slate-900 text-white px-10 py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all">Establish Identity</button>
                <button onClick={() => setIsEditing(false)} className="bg-white text-slate-400 border border-slate-100 px-10 py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Abandon Draft</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ascension Section */}
      <section className="bg-slate-900 p-12 md:p-16 rounded-[4rem] text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Crown size={250} /></div>
        <div className="relative z-10 space-y-16">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 opacity-60">
              <Award size={20} />
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em]">Imperial Ascension</h2>
            </div>
            <h3 className="text-5xl font-black tracking-tighter">Occupy Your Standing.</h3>
            <p className="text-slate-400 font-light italic text-lg max-w-lg">Choose the depth of your architecture. Every level is a deeper commitment to focus.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => {
              const isCurrent = data.plan === tier.name || (tier.name === 'Sage Council' && data.plan === 'Sage');
              return (
                <div 
                  key={tier.id} 
                  className={`p-10 rounded-[3rem] border transition-all duration-700 flex flex-col relative overflow-hidden group ${
                    isCurrent 
                      ? 'bg-white/10 border-indigo-400 ring-4 ring-indigo-400/20 shadow-2xl' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-2">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-indigo-400' : 'opacity-40'}`}>
                        {tier.price}
                      </p>
                      <h4 className="text-2xl font-black tracking-tight">{tier.name}</h4>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 ${
                      isCurrent ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                      {isCurrent ? <CheckCircle2 size={24} /> : tier.icon}
                    </div>
                  </div>

                  <ul className="space-y-5 mb-12 flex-1">
                    {tier.features.map((f, i) => (
                      <li key={i} className={`flex items-start gap-3 text-[11px] font-bold tracking-tight leading-tight transition-opacity duration-500 ${isCurrent ? 'opacity-100' : 'opacity-50'}`}>
                        <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${isCurrent ? 'bg-indigo-400' : 'bg-white/40'}`}></div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handleAscend(tier.name === 'Sage Council' ? 'Sage' : tier.name)} 
                    disabled={isCurrent} 
                    className={`w-full py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                      isCurrent 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default' 
                        : 'bg-white text-slate-900 hover:scale-[1.03] active:scale-95 shadow-xl shadow-black/20'
                    }`}
                  >
                    {isCurrent ? 'Occupied Standing' : `Ascend to ${tier.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Identity Cropper Overlay */}
      {imageToCrop && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-2xl flex items-center justify-center z-[200] p-6 animate-in fade-in duration-500">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-500 border border-white/20">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><Globe size={20} /></div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Focusing the Identity</h2>
              </div>
              <button onClick={() => setImageToCrop(null)} className="p-3 text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
            </div>
            <div className="relative h-[450px] w-full bg-slate-100">
              <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} cropShape="round" showGrid={false} />
            </div>
            <div className="p-10 flex gap-6">
              <button onClick={() => setImageToCrop(null)} className="flex-1 py-5 rounded-2xl text-slate-400 font-bold border border-slate-100 hover:bg-slate-50 transition-colors">Discard</button>
              <button onClick={applyCrop} disabled={isProcessing} className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200">
                {isProcessing ? <RotateCcw size={18} className="animate-spin" /> : <Save size={18} />}
                {isProcessing ? 'Processing...' : 'Establish Visual'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
