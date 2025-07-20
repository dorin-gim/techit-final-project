import * as yup from "yup";

// Strong password regex according to requirements:
// At least one uppercase letter, one lowercase letter, 4 digits, special character, minimum 8 characters
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*\d.*\d.*\d)(?=.*[!@%$#^&*\-_*]).{8,}$/;

// Advanced email validation regex
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Name validation regex (Hebrew and English letters, spaces, hyphens)
const nameRegex = /^[\u0590-\u05FFa-zA-Z\s\-']{2,50}$/;

export const loginSchema = yup.object({
  email: yup
    .string()
    .required("שדה חובה - אנא הכנס כתובת אימייל")
    .matches(emailRegex, "כתובת האימייל אינה תקינה")
    .max(100, "כתובת האימייל ארוכה מדי (מקסימום 100 תווים)")
    .lowercase("כתובת האימייל חייבת להיות באותיות קטנות"),
  
  password: yup
    .string()
    .required("שדה חובה - אנא הכנס סיסמה")
    .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
    .max(128, "הסיסמה ארוכה מדי (מקסימום 128 תווים)")
    .matches(
      passwordRegex,
      "הסיסמה חייבת לכלול: אות גדולה, אות קטנה, 4 מספרים וסימן מיוחד (!@%$#^&*-_*)"
    ),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .required("שדה חובה - אנא הכנס שם מלא")
    .min(2, "השם חייב להכיל לפחות 2 תווים")
    .max(50, "השם ארוך מדי (מקסימום 50 תווים)")
    .matches(nameRegex, "השם יכול להכיל רק אותיות עבריות/אנגליות, רווחים ומקפים")
    .test('no-numbers', 'השם לא יכול להכיל מספרים', (value) => {
      return value ? !/\d/.test(value) : true;
    })
    .test('no-special-chars', 'השם מכיל תווים לא חוקיים', (value) => {
      return value ? /^[\u0590-\u05FFa-zA-Z\s\-']+$/.test(value) : true;
    }),
  
  email: yup
    .string()
    .required("שדה חובה - אנא הכנס כתובת אימייל")
    .matches(emailRegex, "כתובת האימייל אינה תקינה")
    .max(100, "כתובת האימייל ארוכה מדי (מקסימום 100 תווים)")
    .lowercase("כתובת האימייל חייבת להיות באותיות קטנות")
    .test('valid-domain', 'דומיין האימייל אינו תקין', (value) => {
      if (!value) return true;
      const domain = value.split('@')[1];
      if (!domain) return false;
     // Basic domain validation
      return domain.includes('.') && domain.length > 3;
    }),
  
  password: yup
    .string()
    .required("שדה חובה - אנא הכנס סיסמה")
    .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
    .max(128, "הסיסמה ארוכה מדי (מקסימום 128 תווים)")
    .matches(
      passwordRegex,
      "הסיסמה חייבת לכלול: אות גדולה, אות קטנה, 4 מספרים וסימן מיוחד (!@%$#^&*-_*)"
    )
    .test('uppercase', 'הסיסמה חייבת לכלול לפחות אות גדולה אחת', (value) => {
      return value ? /[A-Z]/.test(value) : false;
    })
    .test('lowercase', 'הסיסמה חייבת לכלול לפחות אות קטנה אחת', (value) => {
      return value ? /[a-z]/.test(value) : false;
    })
    .test('numbers', 'הסיסמה חייבת לכלול לפחות 4 מספרים', (value) => {
      return value ? (value.match(/\d/g) || []).length >= 4 : false;
    })
    .test('special', 'הסיסמה חייבת לכלול לפחות סימן מיוחד אחד (!@%$#^&*-_*)', (value) => {
      return value ? /[!@%$#^&*\-_*]/.test(value) : false;
    })
    .test('no-spaces', 'הסיסמה לא יכולה להכיל רווחים', (value) => {
      return value ? !/\s/.test(value) : true;
    }),
});

export const productSchema = yup.object({
  name: yup
    .string()
    .required("שדה חובה - אנא הכנס שם מוצר")
    .min(2, "שם המוצר חייב להכיל לפחות 2 תווים")
    .max(100, "שם המוצר ארוך מדי (מקסימום 100 תווים)")
    .test('not-only-spaces', 'שם המוצר לא יכול להכיל רק רווחים', (value) => {
      return value ? value.trim().length > 0 : false;
    }),
  
  price: yup
    .number()
    .required("שדה חובה - אנא הכנס מחיר")
    .positive("המחיר חייב להיות חיובי")
    .min(0.01, "מחיר מינימלי הוא 0.01 ש״ח")
    .max(999999.99, "מחיר מקסימלי הוא 999,999.99 ש״ח")
    .test('decimal-places', 'המחיר יכול להכיל עד 2 ספרות אחרי הנקודה', (value) => {
      if (!value) return true;
      const decimalPlaces = (value.toString().split('.')[1] || '').length;
      return decimalPlaces <= 2;
    }),
  
  category: yup
    .string()
    .required("שדה חובה - אנא הכנס קטגוריה")
    .min(2, "הקטגוריה חייבת להכיל לפחות 2 תווים")
    .max(50, "הקטגוריה ארוכה מדי (מקסימום 50 תווים)")
    .test('not-only-spaces', 'הקטגוריה לא יכולה להכיל רק רווחים', (value) => {
      return value ? value.trim().length > 0 : false;
    }),
  
  description: yup
    .string()
    .required("שדה חובה - אנא הכנס תיאור מוצר")
    .min(10, "התיאור חייב להכיל לפחות 10 תווים")
    .max(500, "התיאור ארוך מדי (מקסימום 500 תווים)")
    .test('not-only-spaces', 'התיאור לא יכול להכיל רק רווחים', (value) => {
      return value ? value.trim().length >= 10 : false;
    }),
  
  image: yup
    .string()
    .url("כתובת התמונה אינה תקינה - צריכה להתחיל ב-http או https")
    .required("שדה חובה - אנא הכנס כתובת תמונה")
    .test('image-url', 'כתובת התמונה חייבת להוביל לקובץ תמונה', (value) => {
      if (!value) return false;
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => 
        value.toLowerCase().includes(ext)
      );
          // If no image extension, check if it's an image service URL
      const imageServices = ['imgur', 'cloudinary', 'unsplash', 'pixabay', 'pexels'];
      const isImageService = imageServices.some(service => 
        value.toLowerCase().includes(service)
      );
      return hasImageExtension || isImageService;
    }),
});

// Schema for profile update
export const profileUpdateSchema = yup.object({
  name: yup
    .string()
    .required("שדה חובה - אנא הכנס שם מלא")
    .min(2, "השם חייב להכיל לפחות 2 תווים")
    .max(50, "השם ארוך מדי (מקסימום 50 תווים)")
    .matches(nameRegex, "השם יכול להכיל רק אותיות עבריות/אנגליות, רווחים ומקפים"),
  
  email: yup
    .string()
    .required("שדה חובה - אנא הכנס כתובת אימייל")
    .matches(emailRegex, "כתובת האימייל אינה תקינה")
    .max(100, "כתובת האימייל ארוכה מדי (מקסימום 100 תווים)"),
});

// Schema for password change
export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required("שדה חובה - אנא הכנס סיסמה נוכחית"),
  
  newPassword: yup
    .string()
    .required("שדה חובה - אנא הכנס סיסמה חדשה")
    .min(8, "הסיסמה החדשה חייבת להכיל לפחות 8 תווים")
    .max(128, "הסיסמה ארוכה מדי (מקסימום 128 תווים)")
    .matches(
      passwordRegex,
      "הסיסמה חייבת לכלול: אות גדולה, אות קטנה, 4 מספרים וסימן מיוחד"
    )
    .test('different-password', 'הסיסמה החדשה חייבת להיות שונה מהנוכחית', function(value) {
      return value !== this.parent.currentPassword;
    }),
  
  confirmPassword: yup
    .string()
    .required("שדה חובה - אנא אשר את הסיסמה החדשה")
    .oneOf([yup.ref('newPassword')], 'אישור הסיסמה אינו תואם לסיסמה החדשה'),
});

// Schema for search
export const searchSchema = yup.object({
  query: yup
    .string()
    .min(1, "אנא הכנס לפחות תו אחד לחיפוש")
    .max(100, "חיפוש ארוך מדי (מקסימום 100 תווים)")
    .test('not-only-spaces', 'חיפוש לא יכול להכיל רק רווחים', (value) => {
      return value ? value.trim().length > 0 : false;
    }),
});

// Password strength checking utility functions
export const getPasswordStrength = (password: string) => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: (password.match(/\d/g) || []).length >= 4,
    special: /[!@%$#^&*\-_*]/.test(password),
    noSpaces: !/\s/.test(password)
  };

  const score = Object.values(requirements).filter(Boolean).length;
  
  let strength = '';
  let color = '';
  
  if (score <= 2) {
    strength = 'חלשה מאוד';
    color = 'danger';
  } else if (score === 3) {
    strength = 'חלשה';
    color = 'warning';
  } else if (score === 4) {
    strength = 'בינונית';
    color = 'info';
  } else if (score === 5) {
    strength = 'חזקה';
    color = 'success';
  } else if (score === 6) {
    strength = 'חזקה מאוד';
    color = 'success';
  }

  return {
    score,
    strength,
    color,
    requirements,
    percentage: (score / 6) * 100
  };
};

//Email validation function
export const validateEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

// Name validity check function
export const validateName = (name: string): boolean => {
  return nameRegex.test(name) && !/\d/.test(name);
};

// Cleanup and error handling function
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.response?.data) {
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    if (error.response.data.message) {
      return error.response.data.message;
    }
  }
  
  return 'אירעה שגיאה לא צפויה';
};