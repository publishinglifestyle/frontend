export interface Agent {
  id: string;
  name: string;
  type: string;
  prompt: string;
  temperature: number;
  level: number;
  n_buttons: number;
  buttons: Button[];
  model: string;
}

export interface Button {
  id: string;
  name: string;
  prompt: string;
}

interface Option {
  custom: string;
  label: string;
}

export interface Message {
  id: string;
  text: string;
  username: string;
  conversation_id: string;
  complete: boolean;
  title: string;
  buttons: Option[];
  ideogram_buttons: string[];
  messageId: string;
  flags: number;
  prompt: string;
}

export interface Conversation {
  id: string;
  name: string;
  context: Context[];
}

export interface Context {
  role: string;
  content: string;
}

export interface Column {
  key: string;
  name: string;
}

export interface Command {
  command: string;
  value: string;
}
