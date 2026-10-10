import { createContext, useContext, type ReactNode } from 'react';
import type { Limits } from '../shared/limits';
import type { ProfileQuestion } from '../shared/profile';
import type { ApplicationKind, Requirement, RulePack } from '../shared/model';

export interface CatalogTemplate {
  id: string;
  kind: ApplicationKind;
  title: string;
  label: string;
  description: string;
  starter: Requirement[];
}
export interface CatalogPack {
  id: string;
  version: string;
  title: string;
  cycle: string;
  sourceUrl: string;
  checkedAt: string;
  assurance: RulePack['assurance'];
  requirementCount: number;
  conditionalCount: number;
  groups: Requirement['group'][];
  items: {
    id: string;
    title: string;
    group: Requirement['group'];
    mime: Requirement['mime'];
    conditional: boolean;
    dependsOn: string[];
  }[];
}
export interface Catalog {
  limits: Limits;
  evaluatorVersion: string;
  questions: ProfileQuestion[];
  conditions: { value: string; label: string }[];
  templates: CatalogTemplate[];
  packs: CatalogPack[];
}

const CatalogContext = createContext<Catalog | null>(null);
export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}
export function useCatalog() {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error('The product catalog has not loaded.');
  return catalog;
}

const megabytes = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;
/** Human-readable upload rules, built from the server's enforced limits. */
export function uploadRules(limits: Limits) {
  return {
    formats: limits.formats.map((f) => f.label).join(' or '),
    accept: limits.formats.flatMap((f) => f.extensions).join(','),
    perFile: megabytes(limits.fileBytes),
    perPacket: megabytes(limits.packetBytes),
    files: limits.packetFiles,
  };
}

/** The phrase used to describe an application's checklist source. */
export function kindLabel(
  catalog: Catalog,
  kind: ApplicationKind | undefined,
  pack?: Pick<RulePack, 'assurance' | 'title'>,
) {
  if (pack?.assurance === 'reference') return `${pack.title} reference checklist`;
  return catalog.templates.find((t) => t.kind === (kind || 'custom'))?.label || 'Application';
}
