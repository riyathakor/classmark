import { colors } from './colors';

export const CHIP = 'rgba(244, 201, 93, 0.30)'; // soft yellow circle/pill background
export const LABEL = '#3F4E68';

export const cardStyle = {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#263A56',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
};

export const screenTitleStyle = { fontSize: 28, fontWeight: '700', color: colors.text };
export const screenSubtitleStyle = { fontSize: 16, marginTop: 4, color: colors.muted };