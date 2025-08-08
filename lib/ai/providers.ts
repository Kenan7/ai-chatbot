import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { azure, createAzure } from '@ai-sdk/azure';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';
import { google } from '@ai-sdk/google';


const azureProvider = createAzure({
  baseURL: process.env.AZURE_ENDPOINT,
  apiKey: process.env.AZURE_API_KEY,
});

// Custom provider that maps generic model names to Azure deployments
const azureCustomProvider = customProvider({
  languageModels: {
    'chat-model': azureProvider.languageModel('grok-3-mini'),
    'chat-model-reasoning': azureProvider.languageModel('grok-3-mini'),
    'title-model': azureProvider.languageModel('grok-3-mini'),
    'artifact-model': azureProvider.languageModel('grok-3-mini'),
  },
});

const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const googleCustomProvider = customProvider({
  languageModels: {
    'chat-model': googleProvider.languageModel('gemini-2.5-flash-lite-preview-06-17'),
    'chat-model-reasoning': googleProvider.languageModel('gemini-2.5-flash-lite-preview-06-17'),
    'title-model': googleProvider.languageModel('gemini-2.5-flash-lite-preview-06-17'),
    'artifact-model': googleProvider.languageModel('gemini-2.5-flash-lite-preview-06-17'),
  },
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : googleCustomProvider;
