export async function sendWhatsAppMessage(phone: string, template: string, variables: any) {
    // Mock WhatsApp API call
    console.log(`Sending WhatsApp message to ${phone}`);
    return true;
}

export async function sendArattaiMessage(phone: string, text: string) {
    // Mock Arattai Messenger API call
    console.log(`Sending Arattai message to ${phone}`);
    return true;
}
