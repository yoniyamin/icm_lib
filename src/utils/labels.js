import { FIELD_LABELS as ENGLISH_LABELS } from './labels_eng';
import { FIELD_LABELS as HEBREW_LABELS } from './labels_heb';

export const getFieldLabels = (language) => language === 'he' ? HEBREW_LABELS : ENGLISH_LABELS;
