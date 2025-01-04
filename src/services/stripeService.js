import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const checkSubscriptionStatus = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data().subscription;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return null;
  }
};

export const updateSubscriptionStatus = async (userId, subscriptionData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      subscription: subscriptionData,
    });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
};
