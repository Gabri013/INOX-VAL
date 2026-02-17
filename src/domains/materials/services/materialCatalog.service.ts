import fs from 'fs';
import path from 'path';
import { MaterialCatalogItem } from '../types';

const catalogPath = path.resolve(__dirname, '../../../../data/material_catalog.json');
let catalog: MaterialCatalogItem[] | null = null;

function loadCatalog(): MaterialCatalogItem[] {
  if (!catalog) {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  }
  return catalog;
}

export function getMaterial(materialId: string): MaterialCatalogItem | undefined {
  return loadCatalog().find(m => m.materialId === materialId);
}

export function searchMaterials(query: string): MaterialCatalogItem[] {
  const q = query.toLowerCase();
  return loadCatalog().filter(m =>
    m.swName.toLowerCase().includes(q) ||
    (m.description?.toLowerCase().includes(q) ?? false) ||
    m.classification.toLowerCase().includes(q)
  );
}

export function listMaterials(): MaterialCatalogItem[] {
  return loadCatalog();
}

export function listByKind(kind: MaterialCatalogItem['kind']): MaterialCatalogItem[] {
  return loadCatalog().filter(m => m.kind === kind);
}

export function getByClassification(classification: string): MaterialCatalogItem[] {
  return loadCatalog().filter(m => m.classification.toLowerCase().includes(classification.toLowerCase()));
}
