import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            welcome: "Welcome to SUVIDHA",
            selectAccessibilityMode: "Select Accessibility Mode",
            selectLanguage: "Select Language",
            enterMobile: "Enter Mobile Number",
            enterOTP: "Enter OTP",
            verifyOTP: "Verify OTP",
            resendOTP: "Resend OTP",
            quickPay: "Quick Pay",
            fullAccess: "Full Access",
            discoverServices: "Discover Services",
            yourServices: "Your Services",
            payBill: "Pay Bill",
            fileComplaint: "File Complaint",
            yourQueue: "Your Queue",
            sessionEnding: "Session Ending",
            logOut: "Log Out",
            billAmount: "Bill Amount",
            dueDate: "Due Date",
            payNow: "Pay Now",
            complaintDescription: "Complaint Description",
            routingTo: "Routing To",
            priorityScore: "Priority Score",
            queuePosition: "Queue Position",
            slaDeadline: "SLA Deadline",
            preVisit: "Pre-Visit",
            uploadDocument: "Upload Document",
            retrievalToken: "Retrieval Token",
            confidenceIndicator: "Confidence Indicator",
            homeVisit: "Home Visit",
            faceDetected: "Face Detected",
            stepAway: "Please Step Away",
            cancelLogout: "Cancel Logout",
            highContrast: "High Contrast",
            fontSize: "Font Size",
            voiceMode: "Voice Mode",
            islVideo: "ISL Video",
            submit: "Submit",
            cancel: "Cancel",
            error: "Error",
            success: "Success",
            retry: "Retry"
        }
    },
    hi: {
        translation: {
            welcome: "सुविधा में आपका स्वागत है",
            selectAccessibilityMode: "सुलभता मोड चुनें",
            selectLanguage: "भाषा चुनें",
            enterMobile: "मोबाइल नंबर दर्ज करें",
            enterOTP: "OTP दर्ज करें",
            verifyOTP: "OTP सत्यापित करें",
            resendOTP: "OTP पुनः भेजें",
            quickPay: "त्वरित भुगतान",
            fullAccess: "पूर्ण पहुँच",
            discoverServices: "सेवाएं खोजें",
            yourServices: "आपकी सेवाएं",
            payBill: "बिल का भुगतान करें",
            fileComplaint: "शिकायत दर्ज करें",
            yourQueue: "आपकी कतार",
            sessionEnding: "सत्र समाप्त हो रहा है",
            logOut: "लॉग आउट",
            billAmount: "बिल की राशि",
            dueDate: "नियत तारीख",
            payNow: "अभी भुगतान करें",
            complaintDescription: "शिकायत का विवरण",
            routingTo: "को रूट किया जा रहा है",
            priorityScore: "प्राथमिकता स्कोर",
            queuePosition: "कतार में स्थान",
            slaDeadline: "SLA समय सीमा",
            preVisit: "पूर्व-यात्रा",
            uploadDocument: "दस्तावेज़ अपलोड करें",
            retrievalToken: "पुनर्प्राप्ति टोकन",
            confidenceIndicator: "आत्मविश्वास संकेतक",
            homeVisit: "घर पर जाएँ",
            faceDetected: "चेहरा पहचाना गया",
            stepAway: "कृपया दूर हटें",
            cancelLogout: "लॉगआउट रद्द करें",
            highContrast: "उच्च कंट्रास्ट",
            fontSize: "फ़ॉन्ट का आकार",
            voiceMode: "आवाज़ मोड",
            islVideo: "ISL वीडियो",
            submit: "प्रस्तुत करें",
            cancel: "रद्द करें",
            error: "त्रुटि",
            success: "सफलता",
            retry: "पुनः प्रयास करें"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        lng: 'en', // default, will be overridden by store
        interpolation: {
            escapeValue: false // React already escapes values
        }
    });

export default i18n;
