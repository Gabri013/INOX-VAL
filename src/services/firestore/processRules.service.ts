import { FirestoreService } from "./base";
import { COLLECTIONS } from "@/types/firebase";
import { DEFAULT_PROCESS_RULES } from "@/domains/precificacao/services/processRouting.service";
import type { ProcessRule } from "@/domains/precificacao/types/opPricing";

export interface ProcessRuleDoc extends ProcessRule {
  id: string;
  description?: string;
  empresaId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const toDocDefaults = (rule: ProcessRule, index: number): ProcessRuleDoc => ({
  id: `default-${index + 1}`,
  processNamePattern: rule.processNamePattern,
  category: rule.category,
  confidence: rule.confidence ?? 0.7,
  priority: rule.priority ?? 50,
  active: rule.active !== false,
});

export class ProcessRulesService extends FirestoreService<ProcessRuleDoc> {
  constructor() {
    super(COLLECTIONS.process_rules, { softDelete: true });
  }

  async listActive() {
    const result = await this.list({
      where: [{ field: "active", operator: "==", value: true }],
      orderBy: [{ field: "priority", direction: "desc" }],
    });
    if (result.success && result.data && result.data.items.length > 0) return result;

    const fallback = await this.list({
      orderBy: [{ field: "priority", direction: "desc" }],
    });
    if (fallback.success && fallback.data && fallback.data.items.length > 0) {
      return {
        success: true as const,
        data: {
          ...fallback.data,
          items: fallback.data.items.filter((item) => item.active !== false),
        },
      };
    }

    return {
      success: true as const,
      data: {
        items: DEFAULT_PROCESS_RULES.map(toDocDefaults),
        hasMore: false,
      },
    };
  }
}

export const processRulesService = new ProcessRulesService();

