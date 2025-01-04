import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';

const PROMOTIONS = {
  LAUNCH2025: {
    code: 'LAUNCH2025',
    discount: 20,
    duration: 3, // months
    endDate: new Date('2025-12-31'),
    description: 'Launch offer - 20% off for 3 months'
  }
};

export const trackPromoCodeUsage = async (promoCode, userId) => {
  try {
    await addDoc(collection(db, 'promotion_usage'), {
      code: promoCode,
      userId,
      usedAt: Timestamp.now(),
      promotion: PROMOTIONS[promoCode]
    });
  } catch (error) {
    console.error('Error tracking promotion usage:', error);
  }
};

export const getPromoCodeStats = async (promoCode) => {
  try {
    const q = query(
      collection(db, 'promotion_usage'),
      where('code', '==', promoCode)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('Error getting promotion stats:', error);
    return 0;
  }
};

export const getCurrentPromotions = () => {
  const now = new Date();
  return Object.values(PROMOTIONS)
    .filter(promo => new Date(promo.endDate) > now);
};

export const isPromoCodeValid = (code) => {
  return PROMOTIONS[code] && new Date(PROMOTIONS[code].endDate) > new Date();
};
