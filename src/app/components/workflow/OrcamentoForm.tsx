import { useState, useEffect } from 'react';
import type { PriceEntry } from '@/domains/pricing/types/priceBook.types';
import type { Orcamento } from '@/app/types/workflow';
import type { EffectivePricingContext } from '@/domains/pricing/context/effectivePricingContext';
import modelosCatalogo from '@/domains/precificacao/modelosCatalogo.json';
import { listMaterials } from '@/domains/materials/services/materialCatalog.service';
import { getLatestPriceBook, getBestPrice } from '@/domains/pricing/services/priceBook.service';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// ================= NOVA IMPLEMENTAÇÃO ORCAMENTOFORM =================

type Step =
	| 'STEP_SELECT_PRODUCT'
	| 'STEP_SELECT_PROFILE'
	| 'STEP_SELECT_PRICEBOOK'
	| 'STEP_INPUT_DATA'
	| 'STEP_REVIEW_COST'
	| 'STEP_RESULT';

interface OrcamentoFormProps {
	onSubmit: (orcamento: Omit<Orcamento, 'id' | 'numero'>) => void;
	onCancel: () => void;
	initialData?: Orcamento | null;
	submitLabel?: string;
}

interface Diagnostics {
	missingPrices: string[];
	warnings: string[];
	errors: string[];
}

interface PricingConfigState extends Partial<EffectivePricingContext> {
	source: 'user' | 'tenant' | 'default' | 'market';
	updatedAt: string;
}

export function OrcamentoForm({
	onSubmit,
	onCancel,
	initialData,
	submitLabel = 'Salvar Orçamento',
}: OrcamentoFormProps) {
	// Steps
	const [step, setStep] = useState<Step>(initialData ? 'STEP_REVIEW_COST' : 'STEP_SELECT_PRODUCT');
	// Produto/modelo
	const [selectedProductType, setSelectedProductType] = useState<string>('');
	const [selectedModelId, setSelectedModelId] = useState<string>('');
	// Perfil/config
	const [selectedProfileId, setSelectedProfileId] = useState<string>('');
	const [selectedPriceBookVersionId, setSelectedPriceBookVersionId] = useState<string>('');
	// Config de precificação
	const [pricingConfig, setPricingConfig] = useState<PricingConfigState>({
		source: 'market',
		updatedAt: new Date().toISOString(),
		markup: 1.5,
		overheadPercent: 0.03,
		scrapPercent: 0.01,
		laborCostPerHour: 50,
		riskFactor: 0.05,
		priceBookVersionId: '',
		region: 'BR',
		supplierPreferences: {},
		profileId: '',
		tenantId: '',
	});
	// Dados do produto
	const [formData, setFormData] = useState<any>({});
	// Diagnóstico
	const [diagnostics, setDiagnostics] = useState<Diagnostics>({ missingPrices: [], warnings: [], errors: [] });
	// Resultado do orçamento


	// Efeito: atualizar pricebook versionId (async)
	useEffect(() => {
		(async () => {
			const pb = await getLatestPriceBook();
			setPricingConfig((prev) => ({ ...prev, priceBookVersionId: pb.versionId }));
		})();
	}, []);

	// Sugestão automática de materiais por modelo (async)
	type SuggestedMaterial = {
		label: string;
		materialId?: string;
		price?: number;
		priceEntry?: PriceEntry;
		warnings?: string[];
	};
	const [suggestedMaterials, setSuggestedMaterials] = useState<SuggestedMaterial[]>([]);
	const [loadingMaterials, setLoadingMaterials] = useState(false);
	useEffect(() => {
		let alive = true;
		async function fetchMaterials() {
			if (!selectedModelId) {
				setSuggestedMaterials([]);
				return;
			}
			setLoadingMaterials(true);
			try {
				const modelo = (modelosCatalogo as any[]).find((m) => m.codigo === selectedModelId);
				if (!modelo) {
					setSuggestedMaterials([]);
					setLoadingMaterials(false);
					return;
				}
				const allMaterials = listMaterials();
				const found: SuggestedMaterial[] = [];
				for (const comp of modelo.componentes || []) {
					const match = comp.match(/['"]([A-Za-z0-9\-_. ]+)['"]/);
					const query = match ? match[1] : comp;
					const foundMat = allMaterials.find((mat) => mat.materialId === query || mat.swName.includes(query));
					if (!foundMat) {
						found.push({ label: query, warnings: ['Material não encontrado no catálogo'] });
						continue;
					}
					const context: EffectivePricingContext = {
						tenantId: pricingConfig.tenantId || '',
						profileId: pricingConfig.profileId || '',
						region: pricingConfig.region || 'BR',
						supplierPreferences: pricingConfig.supplierPreferences || {},
						markup: pricingConfig.markup ?? 1.0,
						overheadPercent: pricingConfig.overheadPercent ?? 0.03,
						scrapPercent: pricingConfig.scrapPercent ?? 0.01,
						laborCostPerHour: pricingConfig.laborCostPerHour ?? 50,
						riskFactor: pricingConfig.riskFactor ?? 0.05,
						priceBookVersionId: pricingConfig.priceBookVersionId || '',
					};
					const priceEntry = await getBestPrice(foundMat.materialId, context);
					const price = priceEntry?.price;
					const warnings: string[] = [];
					if (priceEntry) {
						if (priceEntry.validUntil && Date.parse(priceEntry.validUntil) < Date.now()) {
							warnings.push('Preço expirado');
						}
						if (priceEntry.unit && priceEntry.unit !== 'kg') {
							warnings.push(`Unidade divergente: ${priceEntry.unit}`);
						}
					}
					found.push({ label: foundMat.swName, materialId: foundMat.materialId, price, priceEntry, warnings: warnings.length ? warnings : undefined });
				}
				if (alive) setSuggestedMaterials(found);
			} catch (e) {
				setSuggestedMaterials([]);
			} finally {
				if (alive) setLoadingMaterials(false);
			}
		}
		fetchMaterials();
		return () => { alive = false; };
	}, [selectedModelId, pricingConfig]);

	// Diagnóstico de preços faltantes
	useEffect(() => {
		if (!suggestedMaterials.length) {
			setDiagnostics((prev) => ({ ...prev, missingPrices: [] }));
			return;
		}
		const missing = suggestedMaterials.filter((m) => !m.materialId || !m.price).map((m) => m.label);
		setDiagnostics((prev) => ({ ...prev, missingPrices: missing }));
	}, [suggestedMaterials]);

	// Wizard steps
	function renderStep() {
		switch (step) {
			case 'STEP_SELECT_PRODUCT':
				return (
					<Card className="p-6 mb-4">
						<Label>Selecione o tipo de produto</Label>
						<Select value={selectedProductType} onValueChange={setSelectedProductType}>
							<SelectTrigger><SelectValue placeholder="Tipo de produto" /></SelectTrigger>
							<SelectContent>
								{(modelosCatalogo as any[]).map((m) => (
									<SelectItem key={m.codigo} value={m.codigo}>{m.nome}</SelectItem>
								))}
							</SelectContent>
						</Select>
						<div className="mt-4 flex gap-2">
							<Button disabled={!selectedProductType} onClick={() => { setSelectedModelId(selectedProductType); setStep('STEP_SELECT_PROFILE'); }}>Avançar</Button>
							<Button variant="outline" onClick={onCancel}>Cancelar</Button>
						</div>
					</Card>
				);
			case 'STEP_SELECT_PROFILE':
				return (
					<Card className="p-6 mb-4">
						<Label>Selecione o perfil de precificação</Label>
						<Input value={selectedProfileId} onChange={e => setSelectedProfileId(e.target.value)} placeholder="ID do perfil ou nome" />
						<div className="mt-4 flex gap-2">
							<Button onClick={() => setStep('STEP_SELECT_PRICEBOOK')}>Avançar</Button>
							<Button variant="outline" onClick={() => setStep('STEP_SELECT_PRODUCT')}>Voltar</Button>
						</div>
					</Card>
				);
			case 'STEP_SELECT_PRICEBOOK':
				return (
					<Card className="p-6 mb-4">
						<Label>Versão do PriceBook</Label>
						<Input value={selectedPriceBookVersionId} onChange={e => setSelectedPriceBookVersionId(e.target.value)} placeholder="ID da versão" />
						<div className="mt-4 flex gap-2">
							<Button onClick={() => setStep('STEP_INPUT_DATA')}>Avançar</Button>
							<Button variant="outline" onClick={() => setStep('STEP_SELECT_PROFILE')}>Voltar</Button>
						</div>
					</Card>
				);
			case 'STEP_INPUT_DATA':
				return (
					<Card className="p-6 mb-4">
						<Label>Dados do Produto</Label>
						<Input value={formData.nome || ''} onChange={e => setFormData((f: any) => ({ ...f, nome: e.target.value }))} placeholder="Nome do produto" />
						<Input className="mt-2" value={formData.qtd || ''} onChange={e => setFormData((f: any) => ({ ...f, qtd: e.target.value }))} placeholder="Quantidade" type="number" />
						<div className="mt-4 flex gap-2">
							<Button onClick={() => setStep('STEP_REVIEW_COST')}>Avançar</Button>
							<Button variant="outline" onClick={() => setStep('STEP_SELECT_PRICEBOOK')}>Voltar</Button>
						</div>
					</Card>
				);
			case 'STEP_REVIEW_COST':
				return (
					<Card className="p-6 mb-4">
						<div className="mb-2 font-semibold">Revisão de Materiais Sugeridos</div>
						{loadingMaterials ? (
							<div className="mt-4 text-muted-foreground">Carregando materiais e preços…</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								{suggestedMaterials.map((mat, i) => (
									<div key={i} className="border rounded p-2 bg-muted/30">
										<div><b>{mat.label}</b></div>
										{mat.materialId && mat.priceEntry && (
											<div className="text-xs text-muted-foreground">
												Preço: R$ {mat.priceEntry.price?.toFixed(2)} ({mat.priceEntry.unit})<br />
												Fornecedor: {mat.priceEntry.supplierId}<br />
												Fonte: {mat.priceEntry.source} | Validade: {mat.priceEntry.validUntil || mat.priceEntry.quotedAt}<br />
												Confiança: {mat.priceEntry.confidence}
											</div>
										)}
										{!mat.price && <div className="text-xs text-destructive">Sem preço real no PriceBook</div>}
										{mat.warnings && mat.warnings.length > 0 && (
											<ul className="text-amber-700 text-xs mt-1">
												{mat.warnings.map((w, j) => <li key={j}>⚠️ {w}</li>)}
											</ul>
										)}
									</div>
								))}
							</div>
						)}
						{diagnostics.missingPrices.length > 0 && (
							<div className="mt-4 text-destructive">
								<b>Materiais sem preço real:</b> {diagnostics.missingPrices.join(', ')}<br />
								<Button variant="outline" className="mt-2" onClick={() => setStep('STEP_SELECT_PRICEBOOK')}>Abrir PriceBook / Importar CSV</Button>
							</div>
						)}
						<div className="mt-4 flex gap-2">
							<Button disabled={loadingMaterials || diagnostics.missingPrices.length > 0 || diagnostics.errors.length > 0} onClick={() => setStep('STEP_RESULT')}>Avançar</Button>
							<Button variant="outline" onClick={() => setStep('STEP_INPUT_DATA')}>Voltar</Button>
						</div>
						{diagnostics.errors.length > 0 && (
							<div className="mt-2 text-destructive text-xs">{diagnostics.errors.join(' | ')}</div>
						)}
					</Card>
				);
			case 'STEP_RESULT':
				return (
					<Card className="p-6 mb-4">
						<div className="mb-2 font-semibold">Resumo do Orçamento</div>
						<div>Produto: <b>{formData.nome}</b></div>
						<div>Modelo: <b>{selectedModelId}</b></div>
						<div>Perfil: <b>{selectedProfileId}</b></div>
						<div>Versão PriceBook: <b>{selectedPriceBookVersionId}</b></div>
						<div className="mt-2">Materiais:</div>
						<ul className="list-disc ml-6">
							{suggestedMaterials.map((mat, i) => (
								<li key={i}>{mat.label} {mat.price ? `- R$ ${mat.price.toFixed(2)}` : '(sem preço)'}</li>
							))}
						</ul>
						<div className="mt-4 flex gap-2">
							<Button onClick={() => {
								// Monta objeto Orcamento e envia
								const orcamento: Omit<Orcamento, 'id' | 'numero'> = {
									clienteNome: '',
									clienteId: '',
									data: new Date(),
									validade: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
									status: 'Aguardando Aprovacao',
									itens: suggestedMaterials.map((mat, i) => ({
										id: mat.materialId || `mat-${i}`,
										modeloId: selectedModelId,
										modeloNome: formData.nome || '',
										descricao: mat.label,
										quantidade: Number(formData.qtd) || 1,
										precoUnitario: mat.price || 0,
										subtotal: (mat.price || 0) * (Number(formData.qtd) || 1),
										origemCusto: mat.priceEntry?.source || '',
										dataAtualizacaoCusto: mat.priceEntry?.quotedAt || '',
									})),
									subtotal: suggestedMaterials.reduce((sum, mat) => sum + ((mat.price || 0) * (Number(formData.qtd) || 1)), 0),
									desconto: 0,
									total: suggestedMaterials.reduce((sum, mat) => sum + ((mat.price || 0) * (Number(formData.qtd) || 1)), 0),
									observacoes: `priceBookVersionId: ${selectedPriceBookVersionId}; effectiveContext: ${JSON.stringify(pricingConfig)}; missingPrices: ${diagnostics.missingPrices.join(', ')}; warnings: ${diagnostics.warnings.join(', ')}`,
								};
								onSubmit(orcamento);
							}}>{submitLabel}</Button>
							<Button variant="outline" onClick={onCancel}>Cancelar</Button>
						</div>
					</Card>
				);
			default:
				return null;
		}
	}

	// Config Card sempre visível
	function renderConfigCard() {
		return (
			<Card className="p-6 mb-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<Label>Perfil</Label>
						<Input value={selectedProfileId} onChange={e => setSelectedProfileId(e.target.value)} placeholder="ID do perfil" />
					</div>
					<div>
						<Label>Região</Label>
						<Input value={pricingConfig.region || ''} onChange={e => setPricingConfig((c) => ({ ...c, region: e.target.value }))} placeholder="Região" />
					</div>
					<div>
						<Label>Markup</Label>
						<Input type="number" value={pricingConfig.markup || 1} onChange={e => setPricingConfig((c) => ({ ...c, markup: Number(e.target.value) }))} min={1} step={0.01} />
					</div>
					<div>
						<Label>Overhead (%)</Label>
						<Input type="number" value={pricingConfig.overheadPercent || 0} onChange={e => setPricingConfig((c) => ({ ...c, overheadPercent: Number(e.target.value) }))} min={0} max={1} step={0.01} />
					</div>
					<div>
						<Label>Scrap (%)</Label>
						<Input type="number" value={pricingConfig.scrapPercent || 0} onChange={e => setPricingConfig((c) => ({ ...c, scrapPercent: Number(e.target.value) }))} min={0} max={1} step={0.01} />
					</div>
					<div>
						<Label>Custo/h Mão de Obra</Label>
						<Input type="number" value={pricingConfig.laborCostPerHour || 0} onChange={e => setPricingConfig((c) => ({ ...c, laborCostPerHour: Number(e.target.value) }))} min={0} step={1} />
					</div>
					<div>
						<Label>Risco (%)</Label>
						<Input type="number" value={pricingConfig.riskFactor || 0} onChange={e => setPricingConfig((c) => ({ ...c, riskFactor: Number(e.target.value) }))} min={0} max={1} step={0.01} />
					</div>
					<div>
						<Label>Versão PriceBook</Label>
						<Input value={pricingConfig.priceBookVersionId || ''} onChange={e => setPricingConfig((c) => ({ ...c, priceBookVersionId: e.target.value }))} placeholder="Versão" />
					</div>
				</div>
				<div className="mt-2 text-xs text-muted-foreground">Fonte: {pricingConfig.source} | Atualizado em: {pricingConfig.updatedAt}</div>
				<div className="mt-2 flex gap-2">
					<Button variant="outline" onClick={() => setPricingConfig((c) => ({ ...c, source: 'market', updatedAt: new Date().toISOString(), markup: 1.5, overheadPercent: 0.03, scrapPercent: 0.01, laborCostPerHour: 50, riskFactor: 0.05 }))}>Restaurar padrão (mercado)</Button>
					<Button variant="outline" onClick={() => setPricingConfig((c) => ({ ...c, source: 'user', updatedAt: new Date().toISOString() }))}>Salvar como padrão do usuário</Button>
				</div>
			</Card>
		);
	}

	// Layout principal
	return (
		<div className="space-y-4">
			{renderConfigCard()}
			{renderStep()}
		</div>
	);
}

