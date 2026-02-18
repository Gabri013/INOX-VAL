import { MaterialRepository, MaterialService } from './types';

export function createMaterialService(repository: MaterialRepository): MaterialService {
  return {
    repository,
    
    async validateMaterialForQuote(materialKey: string, quoteDate: string) {
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Verificar existência
      const material = await repository.getMaterialByKey(materialKey);
      if (!material) {
        errors.push(`Material não encontrado: ${materialKey}`);
        return { valid: false, errors, warnings };
      }
      
      // Verificar se está ativo
      if (!material.active) {
        errors.push('Material inativo');
      }
      
      // Verificar preço ativo
      const price = await repository.getActivePrice(materialKey, quoteDate);
      if (!price) {
        warnings.push('Sem preço ativo na data do orçamento');
      } else if (price.validTo) {
        const daysUntilExpiry = Math.ceil(
          (new Date(price.validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry < 30) {
          warnings.push(`Preço vence em ${daysUntilExpiry} dias`);
        }
      }
      
      return {
        valid: errors.length === 0,
        material,
        price,
        errors,
        warnings
      };
    },
    
    formatMaterialKey(params) {
      const parts = [params.kind.toUpperCase(), params.alloy];
      
      if (params.thicknessMm) {
        parts.push(params.thicknessMm.toString());
      }
      parts.push(params.finish);
      
      if (params.format) {
        parts.push(`${params.format.widthMm}x${params.format.heightMm}`);
      }
      
      if (params.tubeProfile) {
        parts.push(`${params.tubeProfile.widthMm}x${params.tubeProfile.heightMm}x${params.tubeProfile.thicknessMm}`);
      }
      
      parts.push(params.supplierId);
      
      return parts.join('#');
    },
    
    parseMaterialKey(key: string) {
      const parts = key.split('#');
      
      return {
        kind: parts[0]?.toLowerCase() || '',
        alloy: parts[1] || '',
        thicknessMm: parts[2] ? parseFloat(parts[2]) : undefined,
        finish: parts[3] || '',
        supplierId: parts[parts.length - 1] || ''
      };
    }
  };
}
