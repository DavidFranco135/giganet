import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { Card, Button, Input, cn } from '../../components/UI';
import { Plus, Trash2, Edit2, Upload, X, Check } from 'lucide-react';
import { Plan } from '../../types';

export const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  // Form state
  const [nome, setNome] = useState('');
  const [velocidade, setVelocidade] = useState('');
  const [valor, setValor] = useState('');
  const [beneficios, setBeneficios] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'plans'));
      const plansData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = editingPlan?.imageUrl || '';

      if (imageFile) {
        const storageRef = ref(storage, `plans/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const planData = {
        nome,
        velocidade,
        valor: parseFloat(valor),
        beneficios: beneficios.split(',').map(b => b.trim()),
        imageUrl,
      };

      if (editingPlan) {
        await updateDoc(doc(db, 'plans', editingPlan.id), planData);
      } else {
        await addDoc(collection(db, 'plans'), planData);
      }

      resetForm();
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setNome('');
    setVelocidade('');
    setValor('');
    setBeneficios('');
    setImageFile(null);
    setImagePreview(null);
    setEditingPlan(null);
    setIsModalOpen(false);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setNome(plan.nome);
    setVelocidade(plan.velocidade);
    setValor(plan.valor.toString());
    setBeneficios(plan.beneficios.join(', '));
    setImagePreview((plan as any).imageUrl || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await deleteDoc(doc(db, 'plans', id));
        fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
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
                {plan.imageUrl ? (
                  <img src={plan.imageUrl} alt={plan.nome} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400">
                    Sem imagem
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={() => handleEdit(plan)} className="p-2 bg-white/90 backdrop-blur rounded-full text-slate-600 hover:text-primary shadow-sm">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="p-2 bg-white/90 backdrop-blur rounded-full text-slate-600 hover:text-red-500 shadow-sm">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1">
                <h3 className="text-lg font-bold text-slate-900">{plan.nome}</h3>
                <p className="text-2xl font-bold text-primary mt-1">R$ {plan.valor.toFixed(2)}</p>
                <p className="text-sm text-slate-500 mt-2">Velocidade: {plan.velocidade}</p>
                <ul className="mt-4 space-y-2">
                  {plan.beneficios.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-3 w-3 text-emerald-500" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingPlan ? 'Editar Plano' : 'Novo Plano'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nome do Plano" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Ex: Giga Fibra 500MB" />
              <Input label="Velocidade" value={velocidade} onChange={(e) => setVelocidade(e.target.value)} required placeholder="Ex: 500MB" />
              <Input label="Valor Mensal (R$)" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required placeholder="99.90" />
              <Input label="Benefícios (separados por vírgula)" value={beneficios} onChange={(e) => setBeneficios(e.target.value)} placeholder="Wi-Fi Grátis, Suporte 24h" />
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Imagem do Plano</label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <Upload className="h-6 w-6 text-slate-400" />
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <p className="text-xs text-slate-500">Clique para selecionar uma foto do seu dispositivo.</p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>Cancelar</Button>
                <Button type="submit" className="flex-1" isLoading={uploading}>
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
