import { NextResponse } from 'next/server';

const ELECTRICITY_KEYWORDS = ['power', 'electricity', 'electric', 'light', 'bulb', 'meter', 'wire', 'wiring', 'voltage', 'transformer', 'outage', 'blackout', 'shock', 'overload', 'tripped', 'fuse', 'short circuit', 'meter reading', 'bill spike', 'socket', 'pole', 'line'];
const GAS_KEYWORDS = ['gas', 'lpg', 'pipeline', 'pipe', 'leak', 'leaking', 'smell', 'cylinder', 'pressure', 'regulator', 'connection', 'hissing', 'odor', 'flame', 'burner', 'stove'];
const MUNICIPAL_KEYWORDS = ['water', 'road', 'garbage', 'waste', 'drain', 'drainage', 'sewage', 'gutter', 'pothole', 'street', 'footpath', 'traffic', 'light', 'park', 'tree', 'noise', 'sanitation', 'manhole', 'flooding', 'pump', 'supply', 'tap', 'pipeline'];

const EMERGENCY_KEYWORDS = ['leak', 'leaking', 'hospital', 'flood', 'flooding', 'shock', 'short circuit', 'blackout', 'fire', 'hissing', 'explosion'];

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { description } = body;

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const lowerDesc = description.toLowerCase();

        let electricityScore = 0;
        let gasScore = 0;
        let municipalScore = 0;

        const matchedKeywords: { word: string; department: string; weight: number }[] = [];
        const urgencyFlags: string[] = [];

        // 1. & 2. & 3. Analyze Keywords
        ELECTRICITY_KEYWORDS.forEach(kw => {
            if (lowerDesc.includes(kw)) {
                electricityScore += 1.0;
                matchedKeywords.push({ word: kw, department: 'ELECTRICITY', weight: 1.0 });
            }
        });

        GAS_KEYWORDS.forEach(kw => {
            if (lowerDesc.includes(kw)) {
                gasScore += 1.2;
                matchedKeywords.push({ word: kw, department: 'GAS', weight: 1.2 });
            }
        });

        MUNICIPAL_KEYWORDS.forEach(kw => {
            if (lowerDesc.includes(kw)) {
                municipalScore += 1.0;
                matchedKeywords.push({ word: kw, department: 'MUNICIPAL', weight: 1.0 });
            }
        });

        EMERGENCY_KEYWORDS.forEach(kw => {
            if (lowerDesc.includes(kw)) {
                urgencyFlags.push(kw);
            }
        });

        // 5. Vulnerability
        const vulnerabilityScore = urgencyFlags.length > 0 ? 2 : 0;

        // 4. Aging (Not applicable on creation, but simulating if it was old)
        const agingBonus = 0; // Assuming new complaint

        const scores = [
            { department: 'ELECTRICITY', score: electricityScore },
            { department: 'GAS', score: gasScore },
            { department: 'MUNICIPAL', score: municipalScore },
        ].sort((a, b) => b.score - a.score);

        // Determine Primary Department (Default to MUNICIPAL if no match)
        let primaryDepartment = "MUNICIPAL";
        let isMultiDepartment = false;
        let departments = ["MUNICIPAL"];

        if (scores[0].score > 0) {
            primaryDepartment = scores[0].department;
            departments = [primaryDepartment];

            // 6. Check for multi-department (within 20%)
            if (scores[1].score > 0) {
                const diff = scores[0].score - scores[1].score;
                const threshold = scores[0].score * 0.20;
                if (diff <= threshold) {
                    isMultiDepartment = true;
                    departments.push(scores[1].department);
                }
            }
        }

        // 7. Calculate Priority (1-10)
        let priority = 5 + urgencyFlags.length + vulnerabilityScore + agingBonus;
        if (priority > 10) priority = 10;

        let priorityLabel = 'LOW';
        if (priority >= 8) priorityLabel = 'CRITICAL';
        else if (priority >= 6) priorityLabel = 'HIGH';
        else if (priority >= 4) priorityLabel = 'MEDIUM';

        // 8. Queue Position
        const queuePosition = Math.floor(Math.random() * 200) + 1;

        // 9. SLA Calculation
        let slaDays = 15; // default Municipal
        if (isMultiDepartment) {
            slaDays = 7;
        } else if (primaryDepartment === 'ELECTRICITY' || primaryDepartment === 'GAS') {
            slaDays = 7;
        }

        const slaDeadline = new Date();
        slaDeadline.setDate(slaDeadline.getDate() + slaDays);

        const complaintDNA = `Routed to ${departments.join(' and ')} based on ${matchedKeywords.length} keywords. ${isMultiDepartment ? 'Multi-department collaborative resolution required.' : 'Standard single-path resolution.'} ${urgencyFlags.length > 0 ? 'Urgency flagged due to emergency keywords.' : ''}`;

        return NextResponse.json({
            departments,
            primaryDepartment,
            isMultiDepartment,
            priority,
            priorityLabel,
            queuePosition,
            slaDeadline: slaDeadline.toISOString(),
            slaDays,
            matchedKeywords,
            urgencyFlags,
            complaintDNA,
            vulnerabilityScore,
            agingBonus
        }, { status: 200 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
