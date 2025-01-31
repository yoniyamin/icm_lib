import { FIELD_LABELS as ENGLISH_LABELS } from './labels_eng';
import { FIELD_LABELS as HEBREW_LABELS } from './labels_heb';

export const getFieldLabels = (language) => language === 'he' ? HEBREW_LABELS : ENGLISH_LABELS;

export const translateCoverType = (type, labels) => {
    const coverTypeMap = {
        'כריכה רכה': labels.soft_cover,
        'כריכה קשה': labels.hard_cover,
        'עמודים קשיחים': labels.rigid_pages,
        'ספר עם בטריה': labels.battery_book,
    };
    return coverTypeMap[type] || 'N/A';
};

export const translateBookCondition = (condition, labels) => {
    const conditionMap = {
        'כמו חדש': labels.new,
        'מצויין - בלאי בלתי מורגש': labels.good,
        'טוב - בלאי קל': labels.worn,
    };
    return conditionMap[condition] || 'N/A';
};