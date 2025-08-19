import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';

import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

import { google } from '@ai-sdk/google';
import { createAzure } from '@ai-sdk/azure';
import { fal } from '@ai-sdk/fal';
import { openai } from '@ai-sdk/openai';


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


const googleCustomProvider = customProvider({
  languageModels: {
    'chat-model': google.languageModel('gemini-2.5-pro'),
    'chat-model-reasoning': google.languageModel('gemini-2.5-pro'),
    'title-model': google.languageModel('gemini-2.0-flash-lite'),
    'artifact-model': google.languageModel('gemini-2.5-pro'),
  },
  imageModels: {
    'image-model': fal.imageModel('fal-ai/flux/schnell'),
  },
});

const openaiProvider = customProvider({
  languageModels: {
    'chat-model': openai.languageModel('gpt-4.1'),
    'chat-model-reasoning': openai.languageModel('gpt-4.1'),
    'title-model': openai.languageModel('gpt-4o-mini'),
    'artifact-model': openai.languageModel('gpt-4.1'),
  },
  imageModels: {
    'image-model': fal.imageModel('fal-ai/flux/schnell'),
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
  : openaiProvider;
