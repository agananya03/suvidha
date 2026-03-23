// Note: JSZip was removed as it cannot natively decrypt UIDAI's AES encrypted ZIPs.
// Extraction and validation is now fully handled in the backend route.
export interface AadhaarKycData {
  referenceId: string;
  name: string;
  dob: string;
  gender: string;
  address: {
    house: string;
    street: string;
    locality: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
  };
  photo: string; // base64 JPEG
  mobileHash: string;
  emailHash: string;
}

export async function uploadAadhaarZip(
  zipFile: File,
  shareCode: string
): Promise<{ kycData: AadhaarKycData; signatureVerified: boolean }> {
  // Convert zip file to base64 for secure JSON transport to the API
  const arrayBuffer = await zipFile.arrayBuffer();
  const base64Zip = Buffer.from(arrayBuffer).toString('base64');

  const res = await fetch('/api/auth/verifyaadharekyc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      zipBase64: base64Zip,
      shareCode
    })
  });

  const data = await res.json();
  if (!res.ok || !data.valid) {
    throw new Error(data.error || 'Failed to verify Aadhaar eKYC zip');
  }

  return {
    kycData: data.kycData,
    signatureVerified: data.signatureVerified
  };
}


