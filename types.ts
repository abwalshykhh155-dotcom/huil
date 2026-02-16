
export interface ScriptSection {
  id: string;
  title: string;
  timeRange: string;
  content: string;
  efeeh: string;
  visuals: string;
  category: 'space' | 'body' | 'energy' | 'physics' | 'meta' | 'tech';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum MozaCategory {
  SPACE = 'space',
  BODY = 'body',
  ENERGY = 'energy',
  PHYSICS = 'physics',
  META = 'meta',
  TECH = 'tech'
}
