// SUVIDHA Aadhaar Offline eKYC Verification Route
// Verifies UIDAI-signed XML using XMLDSig standard (RSA-SHA1)
// Reference: https://uidai.gov.in/en/ecosystem/authentication-devices-documents/about-aadhaar-paperless-offline-e-kyc.html
// Production deployment requires OVSE registration with C-DAC/UIDAI
import { NextResponse } from 'next/server';
import { createVerify } from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Minizip = require('minizip-asm.js');

// TODO: Replace with actual certificate downloaded from
// https://uidai.gov.in/images/uidai_offline_publickey_26022019.cer
// For demo, signature verification is attempted but may fail on sample data.
// In production, C-DAC onboards SUVIDHA as an OVSE and provides the cert.
const UIDAI_PUBLIC_CERT = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxqBN1T5zQqMdQfURN1Y1
BT93VrydSHiI0fc/dH/dDi9NJZRk67HMGtDkt/8UOPWAHRMoM4fizFOp0QIqUadO
VhlbgRyTd/CiDIcBD/B3pca/jxCmnw1jZk/60ufQ6kWyTooxt9cKQ0cSEkgbE5IT
uyJWtSoimZdZAQIIsZCIWvaUk7XHSU7scAgs19TPPEnnawUiiE4a2lYk+z9TSoA2
fbZeeEze+D7d7nTZw4JdfxNNagGIIlbTxoB29cngVlsc1O1IrjaWQc3c9a12asul
q0LggEN2WYlJxWXCtFQLW3/cl7DQzMNFd8pInbc9qkN/0++9yN+2B4jbIv8fhCds
PQIDAQAB
-----END PUBLIC KEY-----`;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { zipBase64, shareCode } = body;

        if (!zipBase64 || !shareCode) {
            return NextResponse.json({ error: 'Missing zip payload or share code' }, { status: 400 });
        }

        let xmlString = '';
        try {
            const zipBuffer = Buffer.from(zipBase64, 'base64');

            // minizip-asm.js supports ZipCrypto and AES-256 encrypted ZIPs
            // which is exactly what UIDAI uses for Offline eKYC exports.
            const mz = new Minizip(zipBuffer);
            const entries = mz.list();

            const xmlEntry = entries.find((e: { filepath: string }) =>
                e.filepath.endsWith('.xml')
            );

            if (!xmlEntry) {
                return NextResponse.json({ error: 'No XML file inside the uploaded Aadhaar eKYC ZIP' }, { status: 400 });
            }

            const extracted = mz.extract(xmlEntry.filepath, { password: shareCode });
            // minizip returns a Uint8Array
            xmlString = Buffer.from(extracted).toString('utf8');

            if (!xmlString) {
                throw new Error('Could not extract XML. Please verify your share code.');
            }
        } catch (err: unknown) {
            console.error('[SUVIDHA] ZIP Decryption error:', err);
            const msg = err instanceof Error ? err.message : 'Failed to decrypt ZIP';
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        let signatureVerified = false;

        try {
            const sigMatch = xmlString.match(/<SignatureValue>([\s\S]*?)<\/SignatureValue>/);
            const signedInfoMatch = xmlString.match(/<SignedInfo[\s\S]*?<\/SignedInfo>/);

            if (sigMatch && signedInfoMatch) {
                const signatureValue = sigMatch[1].replace(/\s/g, '');
                const signedInfo = signedInfoMatch[0];

                const verifier = createVerify('RSA-SHA1');
                verifier.update(signedInfo);
                signatureVerified = verifier.verify(UIDAI_PUBLIC_CERT, signatureValue, 'base64');
            }
        } catch (err) {
            console.warn('[SUVIDHA] XMLDSig Verification Exception:', err instanceof Error ? err.message : err);
            signatureVerified = false;
        }

        const refMatch = xmlString.match(/<OfflinePaperlessKyc[^>]*referenceId="([^"]+)"/);
        const poiMatch = xmlString.match(/<Poi([^>]+)\/?>/);
        const poaMatch = xmlString.match(/<Poa([^>]+)\/?>/);
        const phtMatch = xmlString.match(/<Pht>([\s\S]*?)<\/Pht>/);

        if (!refMatch || !poiMatch || !poaMatch) {
            return NextResponse.json({ error: 'Required eKYC tags missing or invalid XML structure' }, { status: 400 });
        }

        const referenceId = refMatch[1];
        const poiStr = poiMatch[1];
        const poaStr = poaMatch[1];

        const extractAttr = (str: string, attr: string) => {
            const m = str.match(new RegExp(`${attr}="([^"]+)"`));
            return m ? m[1] : '';
        };

        const kycData = {
            referenceId,
            name: extractAttr(poiStr, 'name'),
            dob: extractAttr(poiStr, 'dob'),
            gender: extractAttr(poiStr, 'gender'),
            mobileHash: extractAttr(poiStr, 'm'),
            emailHash: extractAttr(poiStr, 'e'),
            address: {
                house: extractAttr(poaStr, 'house'),
                street: extractAttr(poaStr, 'street'),
                locality: extractAttr(poaStr, 'loc'),
                district: extractAttr(poaStr, 'dist'),
                state: extractAttr(poaStr, 'state'),
                pincode: extractAttr(poaStr, 'pc'),
                country: extractAttr(poaStr, 'country'),
            },
            photo: phtMatch ? phtMatch[1].trim() : ''
        };

        return NextResponse.json({
            valid: true,
            signatureVerified,
            kycData
        });

    } catch (error) {
        console.error('eKYC Verify API Error:', error);
        return NextResponse.json({ error: 'Server error processing Aadhaar xml payload' }, { status: 500 });
    }
}
