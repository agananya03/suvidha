import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 VERIFY (Meta webhook)
export async function GET(req: NextRequest) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// 🔹 RECEIVE MESSAGE
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ success: true });
    }

    const phoneNumber = message.from;
    const text = message.text?.body?.toLowerCase().trim() || "";

    console.log("📩 Incoming from", phoneNumber, ":", text);

    // Get or create user conversation state
    let state = await prisma.userConversationState.findUnique({
      where: { phoneNumber },
    });

    if (!state) {
      state = await prisma.userConversationState.create({
        data: { phoneNumber, currentStep: "MENU" },
      });
    }

    // Update last message time
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: { lastMessageAt: new Date() },
    });

    // Route message based on current step
    await handleMessage(phoneNumber, text, state);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

// 🔹 MAIN MESSAGE HANDLER
async function handleMessage(
  phoneNumber: string,
  text: string,
  state: any
) {
  const step = state.currentStep;

  // Always allow menu reset
  if (text === "menu") {
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: { currentStep: "MENU", department: null, issueType: null, description: null },
    });
    await sendMainMenu(phoneNumber);
    return;
  }

  // Route based on conversation step
  switch (step) {
    case "MENU":
      await handleMenuSelection(phoneNumber, text);
      break;
    case "COMPLAINT_DEPT":
      await handleDepartmentSelection(phoneNumber, text);
      break;
    case "COMPLAINT_ISSUE":
      await handleIssueTypeSelection(phoneNumber, text, state.department);
      break;
    case "COMPLAINT_DESC":
      await handleComplaintDescription(phoneNumber, text, state.department, state.issueType);
      break;
    case "COMPLAINT_CONFIRM":
      await handleComplaintConfirmation(phoneNumber, text, state);
      break;
    case "CHECK_STATUS":
      await handleComplaintStatusCheck(phoneNumber, text);
      break;
    case "DOCUMENTS_SERVICE":
      await handleDocumentsService(phoneNumber, text);
      break;
    case "DOCUMENTS_SELECT_TYPE":
      await handleDocumentTypeSelection(phoneNumber, text, state.department || "");
      break;
    case "DOCUMENTS_WAITING_UPLOAD":
      await handleDocumentUpload(phoneNumber, text, state.department || "", state.issueType || "", body);
      break;
    case "DOCUMENTS_UPLOAD_MENU":
      await handleDocumentUploadMenu(phoneNumber, text, state.department || "");
      break;
    case "SCHEMES_CATEGORY":
      await handleSchemesCategory(phoneNumber, text);
      break;
    default:
      await sendMainMenu(phoneNumber);
  }
}

// 🔹 MENU HANDLER
async function handleMenuSelection(phoneNumber: string, text: string) {
  if (text === "1" || text === "complaint") {
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: { currentStep: "COMPLAINT_DEPT" },
    });
    await sendMessage(
      phoneNumber,
      "Select the department:\n\n1. Electricity\n2. Gas\n3. Municipal (Water, Roads, etc.)"
    );
  } else if (text === "2" || text === "status") {
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: { currentStep: "CHECK_STATUS" },
    });
    await sendMessage(phoneNumber, "Please enter your Complaint ID:");
  } else if (text === "3" || text === "documents") {
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: { currentStep: "DOCUMENTS_SERVICE" },
    });
    await sendMessage(
      phoneNumber,
      "Which service do you need documents for?\n\n1. Electricity\n2. Water\n3. Gas\n4. Birth Certificate"
    );
  } else if (text === "4" || text === "schemes") {
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: { currentStep: "SCHEMES_CATEGORY" },
    });
    await sendMessage(
      phoneNumber,
      "Select scheme category:\n\n1. Electricity\n2. Water\n3. Municipal"
    );
  } else {
    await sendMainMenu(phoneNumber);
  }
}

// 🔹 DEPARTMENT SELECTION
async function handleDepartmentSelection(phoneNumber: string, text: string) {
  let department = "";

  if (text === "1") {
    department = "ELECTRICITY";
  } else if (text === "2") {
    department = "GAS";
  } else if (text === "3") {
    department = "MUNICIPAL";
  } else {
    await sendMessage(phoneNumber, "Invalid selection. Please choose 1, 2, or 3:");
    return;
  }

  await prisma.userConversationState.update({
    where: { phoneNumber },
    data: { currentStep: "COMPLAINT_ISSUE", department },
  });

  await sendIssueTypeMenu(phoneNumber, department);
}

// 🔹 ISSUE TYPE SELECTION
async function handleIssueTypeSelection(
  phoneNumber: string,
  text: string,
  department: string
) {
  const issueTypeMap: Record<string, Record<string, string>> = {
    ELECTRICITY: {
      "1": "BILL_ISSUE",
      "2": "POWER_OUTAGE",
      "3": "METER_PROBLEM",
      "4": "NEW_CONNECTION",
    },
    GAS: {
      "1": "GAS_NOT_DELIVERED",
      "2": "LEAKAGE_ISSUE",
      "3": "BOOKING_PROBLEM",
      "4": "SUBSIDY_ISSUE",
    },
    MUNICIPAL: {
      "1": "WATER_LEAKAGE",
      "2": "NO_WATER_SUPPLY",
      "3": "ROAD_DAMAGE",
      "4": "STREET_LIGHT",
    },
  };

  const issueType = issueTypeMap[department]?.[text];

  if (!issueType) {
    await sendIssueTypeMenu(phoneNumber, department);
    return;
  }

  await prisma.userConversationState.update({
    where: { phoneNumber },
    data: { currentStep: "COMPLAINT_DESC", issueType },
  });

  await sendMessage(phoneNumber, "Please describe your issue in detail:");
}

// 🔹 COMPLAINT DESCRIPTION
async function handleComplaintDescription(
  phoneNumber: string,
  text: string,
  department: string,
  issueType: string
) {
  await prisma.userConversationState.update({
    where: { phoneNumber },
    data: { currentStep: "COMPLAINT_CONFIRM", description: text },
  });

  const deptLabel = getDepartmentLabel(department);
  const issueLabel = getIssueTypeLabel(issueType);

  const summary = `📋 *Complaint Summary*\n\nDepartment: ${deptLabel}\nIssue: ${issueLabel}\nDescription: ${text}\n\nConfirm submission? (yes/no)`;

  await sendMessage(phoneNumber, summary);
}

// 🔹 COMPLAINT CONFIRMATION
async function handleComplaintConfirmation(
  phoneNumber: string,
  text: string,
  state: any
) {
  if (text === "yes" || text === "y") {
    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        phoneNumber,
        department: state.department,
        issueType: state.issueType,
        description: state.description,
        status: "PENDING",
      },
    });

    // Reset state
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: {
        currentStep: "MENU",
        department: null,
        issueType: null,
        description: null,
      },
    });

    await sendMessage(
      phoneNumber,
      `✅ *Complaint Registered Successfully*\n\nComplaint ID: ${complaint.id}\n\nYou can track status using option 2.\n\nType 'menu' to continue.`
    );
  } else if (text === "no" || text === "n") {
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: { currentStep: "MENU", department: null, issueType: null, description: null },
    });
    await sendMainMenu(phoneNumber);
  } else {
    await sendMessage(phoneNumber, "Please reply with 'yes' or 'no':");
  }
}

// 🔹 CHECK COMPLAINT STATUS
async function handleComplaintStatusCheck(phoneNumber: string, text: string) {
  const complaintId = text.trim();

  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
  });

  if (!complaint || complaint.phoneNumber !== phoneNumber) {
    await sendMessage(phoneNumber, "❌ Complaint ID not found.\n\nType 'menu' to continue.");
  } else {
    const statusLabel = getStatusLabel(complaint.status);
    await sendMessage(
      phoneNumber,
      `📊 *Complaint Status*\n\nID: ${complaint.id}\nStatus: ${statusLabel}\nDepartment: ${getDepartmentLabel(complaint.department)}\n\nType 'menu' to continue.`
    );
  }

  await prisma.userConversationState.update({
    where: { phoneNumber },
    data: { currentStep: "MENU" },
  });
}

// 🔹 DOCUMENTS - SERVICE SELECTION
async function handleDocumentsService(phoneNumber: string, text: string) {
  const services: Record<string, string> = {
    "1": "ELECTRICITY",
    "2": "WATER",
    "3": "GAS",
    "4": "BIRTH_CERTIFICATE",
  };

  const service = services[text];

  if (!service) {
    await sendMessage(phoneNumber, "Invalid selection. Please choose 1-4:");
    return;
  }

  // Update state and move to document type selection
  await prisma.userConversationState.update({
    where: { phoneNumber },
    data: { 
      currentStep: "DOCUMENTS_SELECT_TYPE",
      department: service 
    },
  });

  const docOptions: Record<string, string> = {
    ELECTRICITY: "📋 *Electricity Documents*\n\nSelect which to upload:\n1. Aadhaar Card\n2. Address Proof\n3. Passport Photo\n4. Income Certificate\n5. View all requirements",
    WATER: "💧 *Water Documents*\n\nSelect which to upload:\n1. Aadhaar Card\n2. Address Proof\n3. Land Ownership\n4. Tax Certificate\n5. View all requirements",
    GAS: "⛽ *Gas Documents*\n\nSelect which to upload:\n1. Aadhaar Card\n2. Address Proof\n3. Bank Details\n4. Passport Photo\n5. View all requirements",
    BIRTH_CERTIFICATE: "👶 *Birth Certificate*\n\nSelect which to upload:\n1. Hospital Report\n2. Parent ID Proof\n3. Address Proof\n4. View all requirements",
  };

  await sendMessage(phoneNumber, docOptions[service] || "Select document type:");
}

// 🔹 DOCUMENTS - TYPE SELECTION & UPLOAD
async function handleDocumentTypeSelection(phoneNumber: string, text: string, service: string) {
  const docMap: Record<string, Record<string, string>> = {
    ELECTRICITY: {
      "1": "AADHAAR",
      "2": "ADDRESS_PROOF",
      "3": "PASSPORT_PHOTO",
      "4": "INCOME_CERTIFICATE",
    },
    WATER: {
      "1": "AADHAAR",
      "2": "ADDRESS_PROOF",
      "3": "LAND_OWNERSHIP",
      "4": "TAX_CERTIFICATE",
    },
    GAS: {
      "1": "AADHAAR",
      "2": "ADDRESS_PROOF",
      "3": "BANK_DETAILS",
      "4": "PASSPORT_PHOTO",
    },
    BIRTH_CERTIFICATE: {
      "1": "HOSPITAL_REPORT",
      "2": "PARENT_ID",
      "3": "ADDRESS_PROOF",
    },
  };

  // If user selects "View all requirements" (option 5)
  if (text === "5") {
    const requirements: Record<string, string> = {
      ELECTRICITY: "⚡ *Full Electricity Requirements:*\n\n✓ Aadhaar Card\n✓ Address Proof\n✓ Passport Size Photo\n✓ Income Certificate\n\nSend documents one by one or type 'menu' to exit.",
      WATER: "💧 *Full Water Requirements:*\n\n✓ Aadhaar Card\n✓ Address Proof\n✓ Land Ownership Proof\n✓ Tax Certificate\n\nSend documents one by one or type 'menu' to exit.",
      GAS: "⛽ *Full Gas Requirements:*\n\n✓ Aadhaar Card\n✓ Address Proof\n✓ Bank Account Details\n✓ Passport Size Photo\n\nSend documents one by one or type 'menu' to exit.",
      BIRTH_CERTIFICATE: "👶 *Full Requirements:*\n\n✓ Hospital Report\n✓ Parent ID Proof\n✓ Address Proof\n\nSend documents one by one or type 'menu' to exit.",
    };
    await sendMessage(phoneNumber, requirements[service] || "Requirements list not found.");
    return;
  }

  const docType = docMap[service]?.[text];

  if (!docType) {
    await sendMessage(phoneNumber, "Invalid selection. Please try again:");
    return;
  }

  // Move to upload waiting state
  await prisma.userConversationState.update({
    where: { phoneNumber },
    data: { 
      currentStep: "DOCUMENTS_WAITING_UPLOAD",
      issueType: docType // Reuse issueType field to store document type
    },
  });

  await sendMessage(
    phoneNumber,
    `📸 *Upload ${docType.replace(/_/g, " ")}*\n\nPlease send the document image or PDF.\n\nType 'skip' to choose another document or 'menu' to exit.`
  );
}

// 🔹 DOCUMENTS - HANDLE UPLOAD
async function handleDocumentUpload(
  phoneNumber: string,
  text: string,
  service: string,
  documentType: string,
  body: any
) {
  // Check if text is a command
  if (text === "menu") {
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: { currentStep: "MENU" },
    });
    await sendMainMenu(phoneNumber);
    return;
  }

  if (text === "skip") {
    // Show document selection again
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: { currentStep: "DOCUMENTS_SELECT_TYPE" },
    });
    
    const docOptions: Record<string, string> = {
      ELECTRICITY: "📋 *Electricity Documents*\n\nSelect which to upload:\n1. Aadhaar Card\n2. Address Proof\n3. Passport Photo\n4. Income Certificate\n5. View all requirements",
      WATER: "💧 *Water Documents*\n\nSelect which to upload:\n1. Aadhaar Card\n2. Address Proof\n3. Land Ownership\n4. Tax Certificate\n5. View all requirements",
      GAS: "⛽ *Gas Documents*\n\nSelect which to upload:\n1. Aadhaar Card\n2. Address Proof\n3. Bank Details\n4. Passport Photo\n5. View all requirements",
      BIRTH_CERTIFICATE: "👶 *Birth Certificate*\n\nSelect which to upload:\n1. Hospital Report\n2. Parent ID Proof\n3. Address Proof\n4. View all requirements",
    };

    await sendMessage(phoneNumber, docOptions[service] || "Select document type:");
    return;
  }

  // Check if message contains image/document
  const media = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.image ||
                body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.document;

  if (media) {
    try {
      // Store document in database
      const document = await prisma.document.create({
        data: {
          phoneNumber,
          service,
          documentType,
          fileName: media.caption || `${documentType}_${Date.now()}`,
          fileUrl: "", // Would be populated with Cloudinary URL in production
          mediaId: media.id,
          mediaType: media.mime_type || "image",
        },
      });

      await sendMessage(
        phoneNumber,
        `✅ *Document Uploaded Successfully*\n\n📄 ${documentType.replace(/_/g, " ")}\n\n1. Upload another document\n2. View upload summary\n3. Back to menu\n\nReply with 1, 2, or 3:`
      );

      // Give options to upload more or finish
      await prisma.userConversationState.update({
        where: { phoneNumber },
        data: { currentStep: "DOCUMENTS_UPLOAD_MENU" },
      });
    } catch (err) {
      console.error("Document upload error:", err);
      await sendMessage(
        phoneNumber,
        "❌ Error saving document. Please try again or type 'skip' to skip."
      );
    }
  } else {
    // No media attached
    await sendMessage(
      phoneNumber,
      "⚠️ Please send an image or document file.\n\nOr type 'skip' to choose another document."
    );
  }
}

// 🔹 DOCUMENTS - UPLOAD MENU OPTIONS
async function handleDocumentUploadMenu(
  phoneNumber: string,
  text: string,
  service: string
) {
  if (text === "1") {
    // Upload another document
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: { currentStep: "DOCUMENTS_SELECT_TYPE" },
    });

    const docOptions: Record<string, string> = {
      ELECTRICITY: "📋 *Electricity Documents*\n\nSelect which to upload:\n1. Aadhaar Card\n2. Address Proof\n3. Passport Photo\n4. Income Certificate\n5. View all requirements",
      WATER: "💧 *Water Documents*\n\nSelect which to upload:\n1. Aadhaar Card\n2. Address Proof\n3. Land Ownership\n4. Tax Certificate\n5. View all requirements",
      GAS: "⛽ *Gas Documents*\n\nSelect which to upload:\n1. Aadhaar Card\n2. Address Proof\n3. Bank Details\n4. Passport Photo\n5. View all requirements",
      BIRTH_CERTIFICATE: "👶 *Birth Certificate*\n\nSelect which to upload:\n1. Hospital Report\n2. Parent ID Proof\n3. Address Proof\n4. View all requirements",
    };

    await sendMessage(phoneNumber, docOptions[service] || "Select document type:");
  } else if (text === "2") {
    // Show upload summary
    const documents = await prisma.document.findMany({
      where: { phoneNumber, service },
    });

    let summary = "📋 *Your Uploads Summary*\n\n";
    documents.forEach((doc, index) => {
      summary += `${index + 1}. ${doc.documentType.replace(/_/g, " ")}\n`;
    });
    summary += `\nTotal: ${documents.length} documents uploaded\n\nType 'menu' to continue.`;

    await sendMessage(phoneNumber, summary);
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: { currentStep: "MENU" },
    });
  } else if (text === "3" || text === "menu") {
    // Back to main menu
    await prisma.userConversationState.update({
      where: { phoneNumber },
      data: { currentStep: "MENU" },
    });
    await sendMainMenu(phoneNumber);
  } else {
    await sendMessage(phoneNumber, "Invalid option. Please reply with 1, 2, or 3:");
  }
}

// 🔹 SCHEMES INFORMATION
async function handleSchemesCategory(phoneNumber: string, text: string) {
  const schemesMap: Record<string, string> = {
    "1": "⚡ *Electricity Schemes:*\n\n• Subsidized electricity for low-income families\n• Solar panel installation subsidy\n• Meter installation assistance",
    "2": "💧 *Water Schemes:*\n\n• Free/discounted rural water connections\n• Water conservation programs\n• Tank maintenance assistance",
    "3": "🏛️ *Municipal Schemes:*\n\n• Property tax relief for seniors\n• Road maintenance assistance\n• Street lighting programs",
  };

  const response = schemesMap[text];

  if (!response) {
    await sendMessage(phoneNumber, "Invalid selection. Please choose 1-3:");
    return;
  }

  await sendMessage(phoneNumber, response);
  await sendMessage(phoneNumber, "Type 'menu' to continue.");

  await prisma.userConversationState.update({
    where: { phoneNumber },
    data: { currentStep: "MENU" },
  });
}

// 🔹 HELPER FUNCTIONS
async function sendMainMenu(phoneNumber: string) {
  const menu = `👋 *Welcome to SUVIDHA* 🤖\n\nHow can I help you?\n\n1. Register Complaint\n2. Check Complaint Status\n3. Documents Required\n4. Government Schemes`;
  await sendMessage(phoneNumber, menu);
}

async function sendIssueTypeMenu(phoneNumber: string, department: string) {
  const menus: Record<string, string> = {
    ELECTRICITY:
      "Select issue type:\n\n1. Bill related issue\n2. Power outage\n3. Meter problem\n4. New connection",
    GAS: "Select issue type:\n\n1. Gas not delivered\n2. Leakage issue\n3. Booking problem\n4. Subsidy issue",
    MUNICIPAL:
      "Select issue type:\n\n1. Water leakage\n2. No water supply\n3. Road damage\n4. Street light not working",
  };

  await sendMessage(phoneNumber, menus[department] || "Invalid department");
}

async function sendMessage(to: string, text: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { body: text },
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("❌ Failed to send message:", data);
      return;
    }
    
    console.log("✅ Message sent to", to);
  } catch (error) {
    console.error("❌ Error sending message:", error);
  }
}

function getDepartmentLabel(dept: string): string {
  const map: Record<string, string> = {
    ELECTRICITY: "Electricity",
    GAS: "Gas",
    MUNICIPAL: "Municipal",
  };
  return map[dept] || dept;
}

function getIssueTypeLabel(issue: string): string {
  const map: Record<string, string> = {
    BILL_ISSUE: "Bill related issue",
    POWER_OUTAGE: "Power outage",
    METER_PROBLEM: "Meter problem",
    NEW_CONNECTION: "New connection",
    GAS_NOT_DELIVERED: "Gas not delivered",
    LEAKAGE_ISSUE: "Leakage issue",
    BOOKING_PROBLEM: "Booking problem",
    SUBSIDY_ISSUE: "Subsidy issue",
    WATER_LEAKAGE: "Water leakage",
    NO_WATER_SUPPLY: "No water supply",
    ROAD_DAMAGE: "Road damage",
    STREET_LIGHT: "Street light not working",
  };
  return map[issue] || issue;
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "⏳ Pending",
    IN_PROGRESS: "🔄 In Progress",
    RESOLVED: "✅ Resolved",
  };
  return map[status] || status;
}