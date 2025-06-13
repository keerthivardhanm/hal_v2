
"use client";

import type { ApprovalRequest } from "@/types";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import Image from 'next/image'; // Import next/image

interface ApprovalLetterProps {
  request: ApprovalRequest;
}

// Helper function to parse item string for quantity and name
function parseItemString(itemStr: string): { name: string; quantity: number } {
  const cleanedStr = itemStr.trim();
  const specificMatch = cleanedStr.match(/^(\d+)\s+(.+)/);
  if (specificMatch && specificMatch[1] && specificMatch[2]) {
    const quantity = parseInt(specificMatch[1], 10);
    if (!isNaN(quantity) && quantity > 0) {
      return { name: specificMatch[2].trim(), quantity };
    }
  }
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

  const approverGM = request.approvals.find((a) => a.level === 3); // Assuming GM is level 3
  const approverDGM = request.approvals.find((a) => a.level === 2);
  const approverSM = request.approvals.find((a) => a.level === 1); // Assuming SM is level 1

  const gadgetsString = request.finalSelectedGadgets.join(", ").toUpperCase();

  const MAX_TABLE_ROWS = 4;
  const gadgetRows = Array.from({ length: MAX_TABLE_ROWS }, (_, i) => {
    if (i < request.finalSelectedGadgets.length) {
      const parsedItem = parseItemString(request.finalSelectedGadgets[i]);
      return {
        slNo: i + 1,
        noOfItems: parsedItem.quantity,
        modelSerial: parsedItem.name + " (Serial No. _______________)",
        make: "_________________",
        personCarrying: request.submitterName,
      };
    }
    return { slNo: i + 1, noOfItems: "", modelSerial: "", make: "", personCarrying: "" }; // Blank row
  });


  return (
    <div
      className="print-letter-container bg-white text-black"
      style={{
        width: "794px", // A4 width at 96 DPI
        minHeight: "1123px", // A4 height
        padding: "40px",
        fontSize: "12px",
        lineHeight: "1.6",
        fontFamily: "serif",
        margin: "0 auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          paddingBottom: "10px",
          borderBottom: "1px solid black",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <img // Use standard img tag for html2canvas compatibility with external URLs if CORS is an issue, or ensure next.config.js allows domain for next/image
            src="https://hal-india.co.in/assets/images/logo.png"
            alt="HAL India Logo"
            style={{ maxHeight: "60px", objectFit: "contain", marginBottom: "10px" }}
          />
        </div>
        <div style={{ textAlign: "center", flexGrow: 1 }}>
          <p style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "14px", margin: 0 }}>
            OFFICE OF DGM (IT)
          </p>
        </div>
        <div style={{ textAlign: "right", minWidth: "150px" }}>
          <p style={{ fontWeight: "bold", margin: 0 }}>OVERHAUL DIVISION</p>
          <p style={{ margin: 0 }}>HAL(BC)</p>
          <p style={{ margin: 0 }}>{currentDate || "Loading date..."}</p>
        </div>
      </header>

      <section style={{ marginBottom: "15px", borderBottom: "1px solid black", paddingBottom: "10px" }}>
        <h2 style={{ fontWeight: "bold", textAlign: "center", fontSize: "13px", textDecoration: "underline", marginBottom: "10px" }}>
          REQUEST OVERVIEW
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 20px" }}>
          <p><strong>Requester Name:</strong> {request.submitterName}</p>
          <p><strong>Department:</strong> {request.organisationName}</p>
          <p><strong>Email:</strong> {request.submitterEmail}</p>
          <p><strong>Purpose:</strong> {request.purpose.substring(0,50)}{request.purpose.length > 50 ? '...' : ''}</p>
          <p><strong>Submitted At:</strong> {submittedAtDate}</p>
          <p><strong>Visit To:</strong> HAL Overhaul Division</p>
        </div>
      </section>

      <section style={{ marginBottom: "15px" }}>
        <h3 style={{ fontWeight: "bold", fontSize: "13px" }}>Request Details:</h3>
        <p style={{ marginBottom: "5px" }}>
          <strong>Requested Date for Visit:</strong> {eventDate} at {request.requestTime}
        </p>
        <p style={{ marginBottom: "5px" }}><strong>TO CM(SECURITY)-O</strong></p>
        <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
          SUB: PERMISSION FOR CARRYING GADGETS - {gadgetsString}
        </p>
        <p style={{ lineHeight: "1.5" }}>
          Mr/Mrs {request.submitterName} from {request.organisationName} (Overhaul Division) is visiting
          HAL on {eventDate} at {request.requestTime} for {request.purpose}. In this
          connection, He/She may be allowed to carry the below mentioned items.
        </p>
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h2 style={{ fontWeight: "bold", textAlign: "center", marginBottom: "10px", fontSize: "13px", textDecoration: "underline" }}>
          MOBILE & LAPTOP DETAILS
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: "11px", // Slightly smaller for table content
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "10%", border: "1px solid black", padding: "4px", fontWeight: "bold", textAlign: "center" }}>Sl. No.</th>
              <th style={{ width: "10%", border: "1px solid black", padding: "4px", fontWeight: "bold", textAlign: "center" }}>No. of items</th>
              <th style={{ width: "35%", border: "1px solid black", padding: "4px", fontWeight: "bold", textAlign: "center" }}>Model Number & Serial No.</th>
              <th style={{ width: "20%", border: "1px solid black", padding: "4px", fontWeight: "bold", textAlign: "center" }}>MAKE</th>
              <th style={{ width: "25%", border: "1px solid black", padding: "4px", fontWeight: "bold", textAlign: "center" }}>Name of the Person Carrying</th>
            </tr>
          </thead>
          <tbody>
            {gadgetRows.map((gadget, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center", height: "35px" }}>{gadget.slNo && index < request.finalSelectedGadgets.length ? gadget.slNo : index + 1}</td>
                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center", height: "35px" }}>{gadget.noOfItems}</td>
                <td style={{ border: "1px solid black", padding: "4px", height: "35px" }}>{gadget.modelSerial}</td>
                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center", height: "35px" }}>{gadget.make}</td>
                <td style={{ border: "1px solid black", padding: "4px", textAlign: "center", height: "35px" }}>{index < request.finalSelectedGadgets.length ? gadget.personCarrying : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: "15px", borderTop: "1px solid black", paddingTop: "10px" }}>
        <h3 style={{ fontWeight: "bold", fontSize: "13px", textDecoration: "underline", marginBottom: "5px" }}>Approval Log:</h3>
        {request.approvals.length > 0 ? (
          <ul style={{ listStylePosition: "inside", paddingLeft: "5px", margin: 0 }}>
            {request.approvals.sort((a, b) => a.level - b.level).map(appr => (
              <li key={appr.adminUid + appr.level} style={{ fontSize: "11px", marginBottom: "3px" }}>
                Level {appr.level} Approved by {appr.adminEmail} on {appr.approvedAt && appr.approvedAt.toDate ? format(appr.approvedAt.toDate(), 'dd-MM-yyyy') : 'Processing...'}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: "11px" }}>No approvals recorded yet.</p>
        )}
      </section>

      {request.isRejected && request.rejectionReason && (
        <section style={{ marginBottom: "15px", borderTop: "1px solid black", paddingTop: "10px", color: "red" }}>
          <h3 style={{ fontWeight: "bold", fontSize: "13px", textDecoration: "underline", marginBottom: "5px" }}>Rejection Information:</h3>
          <p style={{ fontSize: "11px" }}><strong>Reason:</strong> {request.rejectionReason}</p>
        </section>
      )}

      <section style={{ marginTop: "auto", paddingTop:"20px" }}> {/* Pushes footer to bottom */}
        <div style={{ marginBottom: "20px" }}>
            <p style={{ fontWeight: "bold", margin: 0 }}>NOTE: Camera is to be blocked.</p>
        </div>
        
        {request.status === "Fully Approved" && (
            <div style={{ border: "2px solid green", padding: "10px", textAlign: "center", marginBottom: "20px" }}>
                <p style={{ fontWeight: "bold", fontSize: "14px", margin: 0, color: "green" }}>STATUS: FULLY APPROVED</p>
            </div>
        )}

        <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "20px", borderTop: "1px solid black" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, height: "20px", borderBottom: "1px solid black", width: "120px", marginBottom:"5px" }}>{approverSM ? "(Approved)" : ""}</p>
            <p style={{ fontWeight: "bold", margin: 0 }}>SM(IT)</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, height: "20px", borderBottom: "1px solid black", width: "120px", marginBottom:"5px"  }}>{approverDGM ? "(Approved)" : ""}</p>
            <p style={{ fontWeight: "bold", margin: 0 }}>DGM</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, height: "20px", borderBottom: "1px solid black", width: "120px", marginBottom:"5px"  }}>{approverGM ? "(Approved)" : ""}</p>
            <p style={{ fontWeight: "bold", margin: 0 }}>GM ( O )</p>
          </div>
        </footer>
      </section>
    </div>
  );
}
