import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, Button, Input, cn } from '../../components/UI';
import { Plus, Trash2, Edit2, X, Check, Upload, Loader2, ImageIcon } from 'lucide-react';
import { Plan } from '../../types';
import { uploadFileToImgBB, fileToBase64 } from '../../lib/imgbbService';

// ── Upload de imagem via ImgBB (sem Firebase Storage = sem CORS) ──
interface ImgUploadProps {
  currentUrl?: string;
  onUploaded: (url: string) => void;
  label?: string;
}

const ImgUpload: React.FC<ImgUploadProps> = ({ currentUrl, onUploaded, label }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    // Preview imediato
    const b64 = await fileToBase64(file);
    setPreview(b64);
    setUploading(true);
    try {
      const result = await uploadFileToImgBB(file, label || file.name);
      setPreview(result.url);
      onUploaded(result.url);
    } catch (err: any) {
      setError(err.message || 'Erro no upload');
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          'relative h-32 w-full rounded-xl border-2 border-dashed overflow-hidden cursor-pointer transition-colors',
          uploading ? 'opacity-60 cursor-not-allowed border-primary/40' : 'hover:border-primary border-slate-200',
          preview && 'border-primary/30',
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium flex items-center gap-2">
                <Upload className="h-4 w-4" /> Trocar imagem
              </span>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
            {uploading
              ? <Loader2 className="h-8 w-8 animate-spin text-primary" />
              : <ImageIcon className="h-8 w-8" />}
            <p className="text-xs">{uploading ? 'Enviando para ImgBB...' : 'Clique para selecionar'}</p>
            <p className="text-[10px] text-slate-300">JPEG, PNG, WebP — máx 32MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};

// ── AdminPlans Principal ──────────────────────────────────────
export const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [nome, setNome] = useState('');
  const [velocidade, setVelocidade] = useState('');
  const [valor, setValor] = useState('');
  const [beneficios, setBeneficios] = useState('');
  const [popular, setPopular] = useState(false);
  const [imagemUrl, setImagemUrl] = useState('');

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'plans'));
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as Plan)));
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !velocidade || !valor) return;
    setSaving(true);
    try {
      const planData = {
        nome,
        velocidade,
        valor: parseFloat(valor),
        beneficios: beneficios.split(',').map(b => b.trim()).filter(Boolean),
        popular,
        imagemUrl, // URL do ImgBB (sem Firebase Storage = sem CORS)
      };

      if (editingPlan) {
        await updateDoc(doc(db, 'plans', editingPlan.id), planData);
      } else {
        await addDoc(collection(db, 'plans'), planData);
      }

      resetForm();
      await fetchPlans();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNome(''); setVelocidade(''); setValor('');
    setBeneficios(''); setPopular(false); setImagemUrl('');
    setEditingPlan(null); setIsModalOpen(false);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setNome(plan.nome);
    setVelocidade(plan.velocidade);
    setValor(plan.valor.toString());
    setBeneficios(plan.beneficios.join(', '));
    setPopular(plan.popular || false);
    setImagemUrl(plan.imagemUrl || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este plano?')) return;
    try {
      await deleteDoc(doc(db, 'plans', id));
      await fetchPlans();
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciar Planos</h1>
          <p className="text-slate-500">Adicione ou edite os planos oferecidos aos clientes</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Plano
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="overflow-hidden p-0 flex flex-col">
              <div className="h-40 bg-slate-100 relative">
                {plan.imagemUrl ? (
                  <img
                    src={plan.imagemUrl}
                    alt={plan.nome}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-primary/10 to-primary/5">
                    <ImageIcon className="h-12 w-12 text-primary/30" />
                  </div>
                )}
                {plan.popular && (
                  <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                    Mais Popular
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 bg-white/90 backdrop-blur rounded-full text-slate-600 hover:text-primary shadow-sm transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 bg-white/90 backdrop-blur rounded-full text-slate-600 hover:text-red-500 shadow-sm transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1">
                <h3 className="text-lg font-bold text-slate-900">{plan.nome}</h3>
                <p className="text-2xl font-bold text-primary mt-1">R$ {plan.valor.toFixed(2)}</p>
                <p className="text-sm text-slate-500 mt-1">Velocidade: {plan.velocidade}</p>
                <ul className="mt-4 space-y-2">
                  {plan.beneficios.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
          {plans.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-400">
              Nenhum plano cadastrado. Clique em "Novo Plano" para começar.
            </div>
          )}
        </div>
      )}

      {/* Modal de criação/edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingPlan ? 'Editar Plano' : 'Novo Plano'}</h2>
              <button onClick={resetForm} className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome do Plano"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                placeholder="Ex: Giga Fibra 500MB"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Velocidade"
                  value={velocidade}
                  onChange={e => setVelocidade(e.target.value)}
                  required
                  placeholder="Ex: 500MB"
                />
                <Input
                  label="Valor Mensal (R$)"
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  required
                  placeholder="99.90"
                />
              </div>
              <Input
                label="Benefícios (separados por vírgula)"
                value={beneficios}
                onChange={e => setBeneficios(e.target.value)}
                placeholder="Wi-Fi Grátis, Suporte 24h, IP Fixo"
              />

              {/* Imagem via ImgBB — sem Firebase Storage = sem CORS */}
              <ImgUpload
                label="Imagem do Plano (hospedada no ImgBB)"
                currentUrl={imagemUrl}
                onUploaded={setImagemUrl}
              />

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={e => setPopular(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">Marcar como "Mais Popular"</p>
                  <p className="text-xs text-slate-500">Destaca este plano no catálogo do cliente</p>
                </div>
              </label>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" isLoading={saving} disabled={!nome || !velocidade || !valor}>
                  {editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
