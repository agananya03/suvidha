// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendWhatsAppMessage(phone: string, _template: string, _variables: unknown) {
    // Mock WhatsApp API call
    console.log(`Sending WhatsApp message to ${phone}`);
    return true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendArattaiMessage(phone: string, _text: string) {
    // Mock Arattai Messenger API call
    console.log(`Sending Arattai message to ${phone}`);
    return true;
}
