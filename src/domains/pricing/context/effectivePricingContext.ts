export interface EffectivePricingContext {
  tenantId: string;
  profileId: string;
  region: string;
  supplierPreferences: Record<string, string>;
  markup: number;
  overheadPercent: number;
  scrapPercent: number;
  laborCostPerHour: number;
  riskFactor: number;
  priceBookVersionId: string;
}

// Função para consolidar contexto de precificação
export function buildEffectivePricingContext(
  config: Partial<EffectivePricingContext>,
  profile: Partial<EffectivePricingContext>,
  tenantConfig: Partial<EffectivePricingContext>,
  priceBook: { versionId: string }
): EffectivePricingContext {
  return {
    tenantId: config.tenantId || tenantConfig.tenantId || '',
    profileId: config.profileId || profile.profileId || '',
    region: config.region || tenantConfig.region || 'BR',
    supplierPreferences: config.supplierPreferences || profile.supplierPreferences || {},
    markup: config.markup !== undefined ? config.markup : (profile.markup !== undefined ? profile.markup : (tenantConfig.markup !== undefined ? tenantConfig.markup : 1.0)),
    overheadPercent: config.overheadPercent !== undefined ? config.overheadPercent : (profile.overheadPercent !== undefined ? profile.overheadPercent : (tenantConfig.overheadPercent !== undefined ? tenantConfig.overheadPercent : 0.03)),
    scrapPercent: config.scrapPercent !== undefined ? config.scrapPercent : (profile.scrapPercent !== undefined ? profile.scrapPercent : (tenantConfig.scrapPercent !== undefined ? tenantConfig.scrapPercent : 0.01)),
    laborCostPerHour: config.laborCostPerHour !== undefined ? config.laborCostPerHour : (profile.laborCostPerHour !== undefined ? profile.laborCostPerHour : (tenantConfig.laborCostPerHour !== undefined ? tenantConfig.laborCostPerHour : 50)),
    riskFactor: config.riskFactor !== undefined ? config.riskFactor : (profile.riskFactor !== undefined ? profile.riskFactor : (tenantConfig.riskFactor !== undefined ? tenantConfig.riskFactor : 0.05)),
    priceBookVersionId: priceBook.versionId,
  };
}
