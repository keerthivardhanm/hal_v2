
"use client";

import type { ApprovalRequest } from "@/types";
import { format } from "date-fns";

interface ApprovalLetterProps {
  request: ApprovalRequest;
}

export function ApprovalLetter({ request }: ApprovalLetterProps) {
  const today = format(new Date(), "dd-MM-yyyy");
  const eventDate = request.requestDate
    ? format(request.requestDate.toDate(), "dd-MM-yyyy")
    : "N/A";

  const approver1 = request.approvals.find((a) => a.level === 1);
  const approver2 = request.approvals.find((a) => a.level === 2);
  const approver3 = request.approvals.find((a) => a.level === 3);

  return (
    <div className="p-8 bg-white text-black font-serif text-xs print-letter-container">
      {/* Removed inline A4 sizing, will rely on @page from globals.css */}
      <header className="flex justify-between items-start mb-6">
        <div>
          <p className="font-bold">OFFICE OF DGM (IT)</p>
        </div>
        <div className="text-right">
          <p className="font-bold">OVERHAUL DIVISION</p>
          <p>HAL(BC)</p>
          <p>{today}</p>
        </div>
      </header>

      <section className="mb-6">
        <p className="mb-2">TO CM(SECURITY)-O</p>
        <p className="font-bold mb-4">
          SUB: PERMISSION FOR {request.finalSelectedGadgets.join(", ").toUpperCase()} TO BRING INSIDE OVERHAUL DIVISION
        </p>
        <p className="mb-2 leading-relaxed">
          Mr/Mrs {request.submitterName} from {request.organisationName} (Overhaul Division) is visiting
          HAL on {eventDate} at {request.requestTime} for {request.purpose}. In this
          connection, He/She may be allowed to carry {request.finalSelectedGadgets.join(", ")}
          {" "}as per the details given below.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-center mb-2">MOBILE & LAPTOP DETAILS</h2>
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr>
              <th className="border border-black p-1 font-bold">No.of items</th>
              <th className="border border-black p-1 font-bold">Model Number & Serial No.</th>
              <th className="border border-black p-1 font-bold">MAKE</th>
              <th className="border border-black p-1 font-bold">Name of the Person Carrying</th>
            </tr>
          </thead>
          <tbody>
            {request.finalSelectedGadgets.length > 0 ? (
              request.finalSelectedGadgets.map((gadget, index) => (
                <tr key={index}>
                  <td className="border border-black p-1 text-center">
                    {index === 0 ? request.numberOfItems : ""}
                  </td>
                  <td className="border border-black p-1">
                    {gadget} (Serial No. _________________)
                  </td>
                  <td className="border border-black p-1">_________________</td>
                  <td className="border border-black p-1 text-center">
                    {request.submitterName}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border border-black p-1 text-center">No gadgets specified.</td>
              </tr>
            )}
            {request.finalSelectedGadgets.some(g => g.toLowerCase().includes("adaptor") || g.toLowerCase().includes("console cable")) && (
                 <tr>
                    <td className="border border-black p-1 text-center"></td>
                    <td className="border border-black p-1">Adaptor & console cable-1</td>
                    <td className="border border-black p-1">Smart Phone</td>
                    <td className="border border-black p-1 text-center">{request.submitterName}</td>
                </tr>
            )}
             {request.finalSelectedGadgets.some(g => g.toLowerCase().includes("tool kit")) && (
                 <tr>
                    <td className="border border-black p-1 text-center"></td>
                    <td className="border border-black p-1">Tool kit- 1 set</td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1 text-center"></td>
                </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="mb-12">
        <p className="font-bold">NOTE: Camera is to be blocked</p>
      </section>

      <footer className="flex justify-between items-end pt-10">
        <div className="text-center">
          <p className="mb-2">{approver1 ? "(Approved)" : "(__________________)"}</p>
          <p className="font-bold">GM ( O )</p>
        </div>
        <div className="text-center">
          <p className="mb-2">{approver2 ? "(Approved)" : "(__________________)"}</p>
          <p className="font-bold">DGM</p>
        </div>
        <div className="text-center">
          <p className="mb-2">{approver3 ? "(Approved)" : "(__________________)"}</p>
          <p className="font-bold">SM(IT)</p>
        </div>
      </footer>
    </div>
  );
}
