import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input } from '../components/UI';
import { User, MapPin, Shield, Bell, ChevronRight, Camera, Loader2, CheckCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadFileToImgBB, fileToBase64, getAvatarUrl } from '../lib/imgbbService';

export const ProfilePage: React.FC = () => {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Foto atual: prioriza foto personalizada, senão usa avatar gerado
  const currentPhoto = previewUrl
    || profile?.fotoUrl
    || getAvatarUrl(profile?.uid || '');

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess(false);

    // Mostra preview imediato enquanto faz upload
    const base64 = await fileToBase64(file);
    setPreviewUrl(base64);
    setUploading(true);

    try {
      const result = await uploadFileToImgBB(
        file,
        `avatar_${profile?.uid}`
      );

      // Salva URL no Firestore no perfil do usuário
      await updateDoc(doc(db, 'users', profile!.uid), {
        fotoUrl: result.url,
      });

      setPreviewUrl(result.url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao enviar foto. Tente novamente.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      // Limpa o input para permitir re-upload do mesmo arquivo
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sections = [
    { icon: User,    label: 'Dados Pessoais',         value: profile?.nome || 'Não informado' },
    { icon: MapPin,  label: 'Endereço de Instalação', value: profile?.endereco?.rua ? `${profile.endereco.rua}, ${profile.endereco.numero}` : 'Não informado' },
    { icon: Shield,  label: 'Segurança',               value: 'Alterar senha' },
    { icon: Bell,    label: 'Notificações',             value: 'Configurar avisos' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-center text-center py-4">
        {/* Foto de perfil com botão de upload */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-200">
            <img
              src={currentPhoto}
              alt="Foto de perfil"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Botão câmera */}
          <button
            onClick={handlePhotoClick}
            disabled={uploading}
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white shadow-md hover:bg-primary-dark transition-colors disabled:opacity-70"
          >
            {uploading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Camera className="h-4 w-4" />
            }
          </button>

          {/* Input de arquivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Feedback de upload */}
        {uploading && (
          <p className="mt-2 text-xs text-primary font-medium animate-pulse">
            Enviando foto...
          </p>
        )}
        {uploadSuccess && (
          <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Foto atualizada!
          </p>
        )}
        {uploadError && (
          <p className="mt-2 text-xs text-red-500 text-center max-w-xs">
            {uploadError}
          </p>
        )}

        <h1 className="mt-4 text-2xl font-bold text-slate-900">{profile?.nome}</h1>
        <p className="text-slate-500">{profile?.email}</p>
        <p className="text-xs text-slate-400 mt-1">Toque na câmera para trocar a foto</p>
      </header>

      {/* Seções do perfil */}
      <div className="space-y-3">
        {sections.map((section, i) => (
          <Card key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <section.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{section.label}</p>
                <p className="font-semibold text-slate-700">{section.value}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <Button variant="outline" className="w-full text-red-500 hover:bg-red-50 hover:border-red-200">
          Encerrar Sessão
        </Button>
      </div>

      <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
        GigaNet Telecom v1.0.0
      </p>
    </div>
  );
};
