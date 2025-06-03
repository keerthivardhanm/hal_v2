
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

  const gadgetsString = request.finalSelectedGadgets.join(", ").toUpperCase();

  return (
    <div className="p-8 bg-white text-black font-serif text-xs print-letter-container">
      {/* Removed inline A4 sizing, will rely on @page from globals.css and .printable-area */}
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
        <p className="mb-1">TO CM(SECURITY)-O</p>
        <p className="font-bold mb-4">
          SUB: PERMISSION FOR {gadgetsString} TO BRING INSIDE OVERHAUL DIVISION
        </p>
        <p className="mb-2 leading-relaxed">
          Mr/Mrs {request.submitterName} from {request.organisationName} (Overhaul Division) is visiting
          HAL on {eventDate} at {request.requestTime} for {request.purpose}. In this
          connection, He/She may be allowed to carry {request.finalSelectedGadgets.join(", ")}
          {" "}as per the details given below.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-bold text-center mb-2 text-sm">MOBILE & LAPTOP DETAILS</h2>
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr>
              <th className="border border-black p-1 font-bold w-[15%]">No.of items</th>
              <th className="border border-black p-1 font-bold w-[40%]">Model Number & Serial No.</th>
              <th className="border border-black p-1 font-bold w-[20%]">MAKE</th>
              <th className="border border-black p-1 font-bold w-[25%]">Name of the Person Carrying</th>
            </tr>
          </thead>
          <tbody>
            {request.finalSelectedGadgets.length > 0 ? (
              request.finalSelectedGadgets.map((gadget, index) => (
                <tr key={index}>
                  <td className="border border-black p-1 text-center h-8">
                    {index === 0 ? request.numberOfItems : ""}
                  </td>
                  <td className="border border-black p-1 h-8">
                    {gadget} (Serial No. _________________)
                  </td>
                  <td className="border border-black p-1 h-8 text-center">_________________</td>
                  <td className="border border-black p-1 text-center h-8">
                    {request.submitterName}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border border-black p-1 text-center h-8">No gadgets specified.</td>
              </tr>
            )}
            {/* Conditional rows for standard items if mentioned */}
            {request.finalSelectedGadgets.some(g => g.toLowerCase().includes("adaptor") || g.toLowerCase().includes("console cable")) && (
                 <tr>
                    <td className="border border-black p-1 text-center h-8"></td>
                    <td className="border border-black p-1 h-8">Adaptor & console cable-1</td>
                    <td className="border border-black p-1 h-8 text-center">Smart Phone</td>
                    <td className="border border-black p-1 text-center h-8">{request.submitterName}</td>
                </tr>
            )}
             {request.finalSelectedGadgets.some(g => g.toLowerCase().includes("tool kit")) && (
                 <tr>
                    <td className="border border-black p-1 text-center h-8"></td>
                    <td className="border border-black p-1 h-8">Tool kit- 1 set</td>
                    <td className="border border-black p-1 h-8 text-center"></td>
                    <td className="border border-black p-1 text-center h-8">{request.submitterName}</td>
                </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="mb-12">
        <p className="font-bold">NOTE: Camera is to be blocked</p>
      </section>

      <footer className="flex justify-between items-end pt-10 mt-10"> {/* Added mt-10 for more space */}
        <div className="text-center">
          <p className="mb-2 h-6">{approver1 ? "(Approved)" : "(__________________)"}</p>
          <p className="font-bold">GM ( O )</p>
        </div>
        <div className="text-center">
          <p className="mb-2 h-6">{approver2 ? "(Approved)" : "(__________________)"}</p>
          <p className="font-bold">DGM</p>
        </div>
        <div className="text-center">
          <p className="mb-2 h-6">{approver3 ? "(Approved)" : "(__________________)"}</p>
          <p className="font-bold">SM(IT)</p>
        </div>
      </footer>
    </div>
  );
}
