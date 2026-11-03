import {getCollection,type CollectionEntry} from 'astro:content';
export type Lang = 'fr' | 'en';
export type Localized<T = string> = Record<Lang, T>;
export interface Lesson {
  id: string; chapter: number; part: number; title: Localized; intro: Localized; body: Localized;
  entries: Record<Lang,CollectionEntry<'lessons'>>; summary: Localized<string[]>; pitfall: Localized; formula: Localized;
  source: string; sourcePages: number[]; pdfPages: number;
  quiz: { question: Localized; options: Localized<string[]>; answer: Localized<number>; explanation: Localized };
}
const entries = await getCollection('lessons');
const ids = [...new Set(entries.map(e=>e.data.lessonId))];
export const lessons: Lesson[] = ids.map(id=>{
  const fr=entries.find(e=>e.data.lessonId===id&&e.data.lang==='fr');
  const en=entries.find(e=>e.data.lessonId===id&&e.data.lang==='en');
  if(!fr||!en) throw new Error(`Missing FR/EN translation for ${id}`);
  const [chapter,part]=id.split('-').map(Number);
  return {
    id,chapter,part,entries:{fr,en},
    title:{fr:fr.data.title,en:en.data.title},
    intro:{fr:fr.data.description,en:en.data.description},
    body:{fr:fr.body||'',en:en.body||''},
    summary:{fr:fr.data.summary,en:en.data.summary},
    pitfall:{fr:fr.data.pitfall,en:en.data.pitfall},
    formula:{fr:fr.data.formula,en:en.data.formula}, source:fr.data.source, sourcePages:fr.data.sourcePages, pdfPages:fr.data.pdfPages,
    quiz:{question:{fr:fr.data.quiz.question,en:en.data.quiz.question},
      options:{fr:fr.data.quiz.options,en:en.data.quiz.options},answer:{fr:fr.data.quiz.answer,en:en.data.quiz.answer},
      explanation:{fr:fr.data.quiz.explanation,en:en.data.quiz.explanation}},
  };
}).sort((a,b)=>a.chapter-b.chapter||a.part-b.part);
const definitions = [
  ['Fondations & tenseurs', 'Foundations & tensors', 'Du signal brut aux premières représentations.', 'From raw signals to your first representations.', 'FOUNDATIONS'],
  ['Apprendre & généraliser', 'Learning & generalisation', 'Risque, capacité et protocoles d’évaluation.', 'Risk, capacity and evaluation protocols.', 'FOUNDATIONS'],
  ['Réseaux & gradients', 'Networks & gradients', 'Du perceptron à la rétropropagation.', 'From the perceptron to backpropagation.', 'FOUNDATIONS'],
  ['Construire avec PyTorch', 'Building with PyTorch', 'Autograd, convolutions et modules.', 'Autograd, convolutions and modules.', 'BUILDING BLOCKS'],
  ['Entraîner un réseau', 'Training a network', 'Pertes, optimiseurs et initialisation.', 'Losses, optimisers and initialisation.', 'BUILDING BLOCKS'],
  ['Aller en profondeur', 'Going deeper', 'Stabiliser et accélérer l’apprentissage.', 'Stabilise and accelerate learning.', 'BUILDING BLOCKS'],
  ['Autoencodeurs', 'Autoencoders', 'Représentations latentes et reconstruction.', 'Latent representations and reconstruction.', 'GENERATIVE MODELS'],
  ['Vision par ordinateur', 'Computer vision', 'Classification, détection et segmentation.', 'Classification, detection and segmentation.', 'COMPUTER VISION'],
  ['Comprendre un réseau', 'Understanding a network', 'Activations, visualisations et entrées optimisées.', 'Activations, visualisations and optimised inputs.', 'COMPUTER VISION'],
  ['Modéliser des distributions', 'Modelling distributions', 'Autorégression, causalité et normalizing flows.', 'Autoregression, causality and normalising flows.', 'GENERATIVE MODELS'],
  ['Réseaux adversariaux', 'Adversarial networks', 'GAN, Wasserstein et génération conditionnelle.', 'GANs, Wasserstein and conditional generation.', 'GENERATIVE MODELS'],
  ['Modéliser les séquences', 'Modelling sequences', 'RNN, mémoire et représentations de mots.', 'RNNs, memory and word representations.', 'SEQUENCES & ATTENTION'],
  ['Attention & Transformers', 'Attention & Transformers', 'Transporter l’information et contextualiser.', 'Route information and build context.', 'SEQUENCES & ATTENTION'],
];
const groupTranslations: Record<string,string> = {'FOUNDATIONS':'FONDATIONS','BUILDING BLOCKS':'BRIQUES DU MODÈLE','GENERATIVE MODELS':'MODÈLES GÉNÉRATIFS','COMPUTER VISION':'VISION PAR ORDINATEUR','SEQUENCES & ATTENTION':'SÉQUENCES & ATTENTION'};
export const chapters = definitions.map((d,i) => ({
  id: i+1, title: {fr:d[0],en:d[1]}, description: {fr:d[2],en:d[3]}, group:{fr:groupTranslations[d[4]],en:d[4]},
  lessons: lessons.filter(l=>l.chapter === i+1),
}));
export function minutes(lesson: Lesson, lang: Lang): number {
  const text = [lesson.body[lang],...lesson.summary[lang],lesson.pitfall[lang]].join(' ');
  return Math.max(3, Math.ceil(text.split(/\s+/).length / 140) + 1);
}
export const languages: Lang[] = ['fr','en'];
export const href = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
