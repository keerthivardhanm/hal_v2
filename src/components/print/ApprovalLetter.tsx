
"use client";

import type { ApprovalRequest } from "@/types";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface ApprovalLetterProps {
  request: ApprovalRequest;
}

// Helper function to parse item string for quantity and name
function parseItemString(itemStr: string): { name: string; quantity: number } {
  const cleanedStr = itemStr.trim();
  // Try to match "N item_name" or "N items item_name"
  const specificMatchWithQuantity = cleanedStr.match(/^(\d+)\s+(?:items?|item)?\s*(.+)/i);
  if (specificMatchWithQuantity && specificMatchWithQuantity[1] && specificMatchWithQuantity[2]) {
    const quantity = parseInt(specificMatchWithQuantity[1], 10);
    if (!isNaN(quantity) && quantity > 0) {
      return { name: specificMatchWithQuantity[2].trim(), quantity };
    }
  }
  // Fallback for just item name (implies quantity 1)
  return { name: cleanedStr, quantity: 1 };
}


export function ApprovalLetter({ request }: ApprovalLetterProps) {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(format(new Date(), "dd-MM-yyyy"));
  }, []);

  const eventDate = request.requestDate
    ? format(request.requestDate.toDate(), "dd-MM-yyyy")
    : "N/A";
  const submittedAtDate = request.submittedAt
    ? format(request.submittedAt.toDate(), "dd-MM-yyyy 'at' HH:mm")
    : "N/A";

  const approverGM = request.approvals.find((a) => a.level === 3);
  const approverDGM = request.approvals.find((a) => a.level === 2);
  const approverSM = request.approvals.find((a) => a.level === 1);

  const gadgetsString = request.finalSelectedGadgets.join(", ").toUpperCase();

  const MAX_TABLE_ROWS = 4;
  const gadgetRows = Array.from({ length: MAX_TABLE_ROWS }, (_, i) => {
    if (i < request.finalSelectedGadgets.length) {
      const parsedItem = parseItemString(request.finalSelectedGadgets[i]);
      return {
        slNo: i + 1,
        noOfItems: parsedItem.quantity.toString(),
        modelSerial: parsedItem.name + " (Serial No. _______________)",
        make: "_________________", // Placeholder for make
        personCarrying: request.submitterName,
      };
    }
    // Blank row, but still number it
    return { 
        slNo: i + 1, 
        noOfItems: "", 
        modelSerial: "", 
        make: "", 
        personCarrying: "" 
    };
  });

  return (
    <div
      className="print-letter-container"
      style={{
        width: "794px",
        height: "1123px", // Strict A4 height
        padding: "40px", // Approx 1 inch margins
        fontSize: "12px",
        fontFamily: "serif",
        lineHeight: "1.6",
        backgroundColor: "#fff",
        color: "#000",
        margin: "0 auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Clip content that exceeds A4 height
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "15px", // Reduced margin
          paddingBottom: "10px",
          borderBottom: "1px solid black",
          flexShrink: 0,
        }}
      >
        <div style={{ flex: "1 1 25%", textAlign: "left" }}>
          <img
            src="https://hal-india.co.in/assets/images/logo.png"
            alt="HAL India Logo"
            style={{ maxHeight: "50px", objectFit: "contain" }} 
          />
        </div>
        <div style={{ flex: "1 1 50%", textAlign: "center", alignSelf: "center" }}>
          <p style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "14px", margin: 0 }}>
            OFFICE OF DGM (IT)
          </p>
        </div>
        <div style={{ flex: "1 1 25%", textAlign: "right", fontSize: "11px" }}>
          <p style={{ fontWeight: "bold", margin: 0 }}>OVERHAUL DIVISION</p>
          <p style={{ margin: 0 }}>HAL(BC)</p>
          <p style={{ margin: 0 }}>{currentDate || "Loading date..."}</p>
        </div>
      </header>

      <section style={{ marginBottom: "10px", borderBottom: "1px solid black", paddingBottom: "10px", flexShrink: 0 }}>
        <h2 style={{ fontWeight: "bold", textAlign: "center", fontSize: "13px", textDecoration: "underline", margin: "0 0 5px 0" }}>
          REQUEST OVERVIEW
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 15px", fontSize: "11px" }}>
          <p style={{margin:0}}><strong>Requester Name:</strong> {request.submitterName}</p>
          <p style={{margin:0}}><strong>Department:</strong> {request.organisationName}</p>
          <p style={{margin:0}}><strong>Email:</strong> {request.submitterEmail}</p>
          <p style={{margin:0}}><strong>Purpose:</strong> {request.purpose.substring(0,40)}{request.purpose.length > 40 ? '...' : ''}</p>
          <p style={{margin:0}}><strong>Submitted At:</strong> {submittedAtDate}</p>
          <p style={{margin:0}}><strong>Visit To:</strong> HAL Overhaul Division</p>
        </div>
      </section>

      <section style={{ marginBottom: "10px", fontSize: "12px", flexShrink: 0 }}>
        <p style={{ marginBottom: "2px", margin:0 }}>
          <strong>Requested Date for Visit:</strong> {eventDate} at {request.requestTime}
        </p>
        <p style={{ marginBottom: "2px", margin:0 }}><strong>TO CM(SECURITY)-O</strong></p>
        <p style={{ fontWeight: "bold", marginBottom: "2px", margin:0 }}>
          SUB: PERMISSION FOR CARRYING GADGETS - {gadgetsString}
        </p>
        <p style={{ lineHeight: "1.4", margin:0 }}>
          Mr/Mrs {request.submitterName} from {request.organisationName} (Overhaul Division) is visiting
          HAL on {eventDate} at {request.requestTime} for "{request.purpose}". In this
          connection, He/She may be allowed to carry the below mentioned items.
        </p>
      </section>

      <section style={{ marginBottom: "15px", flexShrink: 0 }}>
        <h2 style={{ fontWeight: "bold", textAlign: "center", marginBottom: "5px", fontSize: "13px", textDecoration: "underline" }}>
          MOBILE & LAPTOP DETAILS
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: "10px", // Smaller font for table
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "10%", border: "1px solid black", padding: "3px", fontWeight: "bold", textAlign: "center" }}>Sl. No.</th>
              <th style={{ width: "10%", border: "1px solid black", padding: "3px", fontWeight: "bold", textAlign: "center" }}>No. of items</th>
              <th style={{ width: "35%", border: "1px solid black", padding: "3px", fontWeight: "bold", textAlign: "center" }}>Model Number & Serial No.</th>
              <th style={{ width: "20%", border: "1px solid black", padding: "3px", fontWeight: "bold", textAlign: "center" }}>MAKE</th>
              <th style={{ width: "25%", border: "1px solid black", padding: "3px", fontWeight: "bold", textAlign: "center" }}>Name of the Person Carrying</th>
            </tr>
          </thead>
          <tbody>
            {gadgetRows.map((gadget, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "center", height: "30px" }}>{gadget.slNo}</td>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "center" }}>{gadget.noOfItems}</td>
                <td style={{ border: "1px solid black", padding: "3px" }}>{gadget.modelSerial}</td>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "center" }}>{gadget.make}</td>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "center" }}>{gadget.personCarrying}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      
      <section style={{ marginBottom: "10px", borderTop: "1px solid black", paddingTop: "5px", fontSize: "11px", flexShrink: 0 }}>
        <h3 style={{ fontWeight: "bold", textDecoration: "underline", margin: "0 0 3px 0" }}>Approval Log:</h3>
        {request.approvals.length > 0 ? (
          <ul style={{ listStylePosition: "inside", paddingLeft: "0px", margin: 0, listStyleType:"none" }}>
            {request.approvals.sort((a, b) => a.level - b.level).map(appr => (
              <li key={appr.adminUid + appr.level} style={{ marginBottom: "1px" }}>
                Level {appr.level} Approved by {appr.adminEmail} on {appr.approvedAt && appr.approvedAt.toDate ? format(appr.approvedAt.toDate(), 'dd-MM-yyyy') : 'Processing...'}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{margin:0}}>No approvals recorded yet.</p>
        )}
      </section>

      {request.isRejected && request.rejectionReason && (
        <section style={{ marginBottom: "10px", borderTop: "1px solid black", paddingTop: "5px", color: "red", fontSize: "11px", flexShrink: 0 }}>
          <h3 style={{ fontWeight: "bold", textDecoration: "underline", margin: "0 0 3px 0" }}>Rejection Information:</h3>
          <p style={{margin:0}}><strong>Reason:</strong> {request.rejectionReason}</p>
        </section>
      )}
      
      {/* This spacer div will take up remaining space if content is short, helping to push footer down */}
      <div style={{ flexGrow: 1, minHeight: '10px' }}></div>


      <section style={{ flexShrink: 0 }}> {/* Removed marginTop: "auto" to rely on flexGrow of spacer */}
        <div style={{ marginBottom: "10px", borderTop: "1px solid black", paddingTop: "5px" }}>
            <p style={{ fontWeight: "bold", margin: 0, fontSize: "12px" }}>NOTE: Camera is to be blocked.</p>
        </div>
        
        {request.status === "Fully Approved" && (
            <div style={{ border: "1px solid green", padding: "5px", textAlign: "center", marginBottom: "10px" }}>
                <p style={{ fontWeight: "bold", fontSize: "13px", margin: 0, color: "green" }}>STATUS: FULLY APPROVED</p>
            </div>
        )}

        <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "10px", borderTop: "1px solid black", fontSize: "11px" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 2px 0", height: "15px", borderBottom: "1px solid black", width: "100px" }}>{approverSM ? "(Approved)" : ""}</p>
            <p style={{ fontWeight: "bold", margin: 0 }}>SM(IT)</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 2px 0", height: "15px", borderBottom: "1px solid black", width: "100px" }}>{approverDGM ? "(Approved)" : ""}</p>
            <p style={{ fontWeight: "bold", margin: 0 }}>DGM</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 2px 0", height: "15px", borderBottom: "1px solid black", width: "100px" }}>{approverGM ? "(Approved)" : ""}</p>
            <p style={{ fontWeight: "bold", margin: 0 }}>GM ( O )</p>
          </div>
        </footer>
      </section>
    </div>
  );
}

    